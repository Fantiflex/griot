#!/usr/bin/env python3
"""
Fine-tuning QLoRA de Gemma 3 pour le Griot.

  python scripts/train_lora.py --base google/gemma-3-4b-it --train data/train.jsonl --val data/val.jsonl \
      --out output/legriot-griot-fr-sw --epochs 2 --lr 1e-4 --rank 32

Utilise Unsloth si installé (plus rapide, moins de mémoire), sinon transformers + PEFT + TRL.
Sortie : un adaptateur LoRA (adapter_model.safetensors + adapter_config.json) servi par vLLM
(--enable-lora) ou fusionné puis converti en GGUF par export_ollama.sh.

Mémoire indicative (4 bits, seq 2048) : Gemma 3 4B ≈ 10 Go, 12B ≈ 20 Go, 27B ≈ 40 Go.
"""

from __future__ import annotations

import argparse
import json
import os
import time
from pathlib import Path


def parse():
    ap = argparse.ArgumentParser()
    ap.add_argument("--base", default="google/gemma-3-4b-it")
    ap.add_argument("--train", default="data/train.jsonl")
    ap.add_argument("--val", default="data/val.jsonl")
    ap.add_argument("--out", default="output/legriot-griot-fr-sw")
    ap.add_argument("--epochs", type=float, default=2)
    ap.add_argument("--lr", type=float, default=1e-4)
    ap.add_argument("--rank", type=int, default=32)
    ap.add_argument("--alpha", type=int, default=None, help="défaut : 2 × rank")
    ap.add_argument("--dropout", type=float, default=0.05)
    ap.add_argument("--max-seq", type=int, default=2048)
    ap.add_argument("--batch", type=int, default=2)
    ap.add_argument("--grad-accum", type=int, default=8)
    ap.add_argument("--no-4bit", action="store_true", help="LoRA en bf16 sans quantification (plus de VRAM)")
    ap.add_argument("--merge", action="store_true", help="Écrit aussi le modèle fusionné dans <out>/merged (pour GGUF)")
    ap.add_argument("--seed", type=int, default=3407)
    return ap.parse_args()


def load_jsonl(path: str):
    from datasets import load_dataset

    return load_dataset("json", data_files=path, split="train")


def main():
    args = parse()
    alpha = args.alpha or args.rank * 2
    out = Path(args.out)
    out.mkdir(parents=True, exist_ok=True)
    t0 = time.time()

    train_ds = load_jsonl(args.train)
    val_ds = load_jsonl(args.val) if args.val and Path(args.val).exists() else None
    print(f"train={len(train_ds)} val={len(val_ds) if val_ds else 0}")

    use_unsloth = False
    try:
        from unsloth import FastModel  # type: ignore

        use_unsloth = True
    except Exception:
        pass

    if use_unsloth:
        print("Unsloth détecté.")
        model, tokenizer = FastModel.from_pretrained(
            model_name=args.base,
            max_seq_length=args.max_seq,
            load_in_4bit=not args.no_4bit,
            full_finetuning=False,
        )
        model = FastModel.get_peft_model(
            model,
            r=args.rank,
            lora_alpha=alpha,
            lora_dropout=args.dropout,
            target_modules=["q_proj", "k_proj", "v_proj", "o_proj", "gate_proj", "up_proj", "down_proj"],
            finetune_vision_layers=False,
            finetune_language_layers=True,
            finetune_attention_modules=True,
            finetune_mlp_modules=True,
            random_state=args.seed,
        )
    else:
        print("Unsloth absent : transformers + PEFT.")
        import torch
        from transformers import AutoModelForCausalLM, AutoTokenizer, BitsAndBytesConfig
        from peft import LoraConfig, get_peft_model, prepare_model_for_kbit_training

        tokenizer = AutoTokenizer.from_pretrained(args.base)
        quant = None if args.no_4bit else BitsAndBytesConfig(load_in_4bit=True, bnb_4bit_quant_type="nf4", bnb_4bit_compute_dtype=torch.bfloat16, bnb_4bit_use_double_quant=True)
        model = AutoModelForCausalLM.from_pretrained(args.base, quantization_config=quant, torch_dtype=torch.bfloat16, device_map="auto", attn_implementation="eager")
        if quant:
            model = prepare_model_for_kbit_training(model)
        model = get_peft_model(
            model,
            LoraConfig(r=args.rank, lora_alpha=alpha, lora_dropout=args.dropout, bias="none", task_type="CAUSAL_LM", target_modules=["q_proj", "k_proj", "v_proj", "o_proj", "gate_proj", "up_proj", "down_proj"]),
        )

    # Les exemples sont déjà au format messages (system/user/assistant) : on applique le gabarit de chat de Gemma.
    def to_text(batch):
        texts = [tokenizer.apply_chat_template(m, tokenize=False, add_generation_prompt=False) for m in batch["messages"]]
        return {"text": texts}

    train_ds = train_ds.map(to_text, batched=True, remove_columns=[c for c in train_ds.column_names if c != "text"])
    if val_ds is not None:
        val_ds = val_ds.map(to_text, batched=True, remove_columns=[c for c in val_ds.column_names if c != "text"])

    from trl import SFTConfig, SFTTrainer

    cfg = SFTConfig(
        output_dir=str(out / "checkpoints"),
        num_train_epochs=args.epochs,
        learning_rate=args.lr,
        per_device_train_batch_size=args.batch,
        gradient_accumulation_steps=args.grad_accum,
        lr_scheduler_type="cosine",
        warmup_ratio=0.05,
        logging_steps=10,
        eval_strategy="epoch" if val_ds is not None else "no",
        save_strategy="epoch",
        bf16=True,
        max_seq_length=args.max_seq,
        dataset_text_field="text",
        packing=False,
        seed=args.seed,
        report_to="none",
    )
    trainer = SFTTrainer(model=model, tokenizer=tokenizer, train_dataset=train_ds, eval_dataset=val_ds, args=cfg)
    result = trainer.train()

    model.save_pretrained(str(out))
    tokenizer.save_pretrained(str(out))
    metrics = {"train_loss": result.training_loss, "runtime_s": round(time.time() - t0), **({} if val_ds is None else trainer.evaluate())}
    (out / "train_metrics.json").write_text(json.dumps(metrics, indent=2), encoding="utf8")
    (out / "train_args.json").write_text(json.dumps(vars(args), indent=2), encoding="utf8")
    print(json.dumps(metrics, indent=2))

    if args.merge:
        merged = out / "merged"
        if use_unsloth:
            model.save_pretrained_merged(str(merged), tokenizer, save_method="merged_16bit")
        else:
            model.merge_and_unload().save_pretrained(str(merged), safe_serialization=True)
            tokenizer.save_pretrained(str(merged))
        print(f"Modèle fusionné écrit dans {merged}")

    print(f"Adaptateur LoRA écrit dans {out}. Étape suivante : eval.py puis export_ollama.sh ou vLLM --enable-lora.")


if __name__ == "__main__":
    os.environ.setdefault("TOKENIZERS_PARALLELISM", "false")
    main()
