#!/usr/bin/env python3
"""
Évalue un Griot (base ou fine-tuné) sur le jeu de validation, selon la charte.

Deux modes :
  --adapter output/legriot-griot-fr-sw      charge base + LoRA localement (GPU) et génère
  --base-url http://host:8000/v1 --model X  interroge un serveur compatible OpenAI déjà en route

Métriques automatiques : longueur, markdown, langue, réponse révélée trop tôt (hint essai < 3).
Juge LLM (optionnel, --judge-*) : note de 1 à 5 sur quatre critères de la charte
(socratique, bienveillance, ancrage culturel, honnêteté) + comparaison au gold quand disponible.

  python scripts/eval.py --base-url http://localhost:11434/v1 --model gemma3:4b --val data/val.jsonl \
      --judge-base-url http://localhost:11434/v1 --judge-model gemma3:12b --out output/eval-base.md
"""

from __future__ import annotations

import argparse
import json
import re
import statistics
import sys
import unicodedata
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from validate import BLACKLIST, detect_lang, norm  # réutilise les mêmes règles

ROOT = Path(__file__).resolve().parents[2]
CHARTER = (ROOT / "ethics" / "charte-griot.md").read_text(encoding="utf8")

JUDGE_PROMPT = """Tu es un évaluateur pédagogique. Voici la charte que la réponse doit respecter :

{charter}

Contexte donné au Griot :
{user}

Réponse du Griot à évaluer :
{answer}

{gold_block}
Note chaque critère de 1 (très mauvais) à 5 (exemplaire) et réponds en JSON strict :
{{"socratic": n, "kindness": n, "cultural": n, "honesty": n, "reveals_answer_early": true|false, "comment": "une phrase"}}
"socratic" : guide sans donner la réponse avant le 3e essai ; "kindness" : nomme ce qui est juste, aucune humiliation ;
"cultural" : ancrage africain concret et exact ; "honesty" : rien d'inventé, admet l'incertitude."""


def load(path):
    return [json.loads(l) for l in Path(path).read_text(encoding="utf8").splitlines() if l.strip()]


def auto_metrics(ex: dict, answer: str) -> dict:
    meta = ex.get("meta", {})
    lang = meta.get("lang", "fr")
    user = next((m["content"] for m in ex["messages"] if m["role"] == "user"), "")
    reveals = False
    if meta.get("kind") == "hint" and (meta.get("attempt") or 0) < 3:
        m = re.search(r"(Réponse attendue|Jibu linalotarajiwa)\s*:\s*(.+)", user)
        if m:
            expected = norm(m.group(2).strip())
            for tk in re.findall(r"[a-z0-9]+", expected):
                if tk.isdigit() and re.search(rf"\b{re.escape(tk)}\b", norm(answer)):
                    reveals = True
            if len(expected) >= 6 and expected in norm(answer):
                reveals = True
    return {
        "chars": len(answer),
        "sentences": len(re.findall(r"[.!?…]+", answer)) or 1,
        "markdown": bool(re.search(r"(^|\n)\s*([-*•#]|\d+[.)])\s", answer) or "**" in answer),
        "lang_ok": (detect_lang(answer) or lang) == lang,
        "blacklist": any(re.search(p, norm(answer)) for p in BLACKLIST.get(lang, [])),
        "reveals_early": reveals,
    }


class RemoteGenerator:
    def __init__(self, base_url, api_key, model):
        from openai import OpenAI

        self.client = OpenAI(base_url=base_url, api_key=api_key)
        self.model = model

    def __call__(self, messages, max_tokens=300, temperature=0.4):
        r = self.client.chat.completions.create(model=self.model, messages=messages, max_tokens=max_tokens, temperature=temperature)
        return (r.choices[0].message.content or "").strip()


class LocalGenerator:
    def __init__(self, base, adapter):
        import torch
        from transformers import AutoModelForCausalLM, AutoTokenizer
        from peft import PeftModel

        self.tok = AutoTokenizer.from_pretrained(base)
        model = AutoModelForCausalLM.from_pretrained(base, torch_dtype=torch.bfloat16, device_map="auto")
        self.model = PeftModel.from_pretrained(model, adapter) if adapter else model
        self.model.eval()

    def __call__(self, messages, max_tokens=300, temperature=0.4):
        import torch

        ids = self.tok.apply_chat_template(messages, add_generation_prompt=True, return_tensors="pt").to(self.model.device)
        with torch.no_grad():
            out = self.model.generate(ids, max_new_tokens=max_tokens, do_sample=temperature > 0, temperature=max(temperature, 1e-3), top_p=0.9)
        return self.tok.decode(out[0][ids.shape[-1] :], skip_special_tokens=True).strip()


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--val", default="data/val.jsonl")
    ap.add_argument("--limit", type=int, default=0)
    ap.add_argument("--base", default="google/gemma-3-4b-it")
    ap.add_argument("--adapter", default=None)
    ap.add_argument("--base-url", default=None)
    ap.add_argument("--api-key", default="ollama")
    ap.add_argument("--model", default=None)
    ap.add_argument("--judge-base-url", default=None)
    ap.add_argument("--judge-api-key", default="ollama")
    ap.add_argument("--judge-model", default=None)
    ap.add_argument("--out", default=None)
    args = ap.parse_args()

    rows = load(args.val)
    if args.limit:
        rows = rows[: args.limit]
    gen = RemoteGenerator(args.base_url, args.api_key, args.model) if args.base_url else LocalGenerator(args.base, args.adapter)
    judge = RemoteGenerator(args.judge_base_url, args.judge_api_key, args.judge_model) if args.judge_base_url and args.judge_model else None

    results = []
    for i, ex in enumerate(rows, 1):
        prompt_msgs = [m for m in ex["messages"] if m["role"] != "assistant"] if ex["messages"][-1]["role"] == "assistant" else ex["messages"]
        gold = ex["messages"][-1]["content"] if ex["messages"][-1]["role"] == "assistant" else None
        try:
            answer = gen(prompt_msgs)
        except Exception as exc:
            answer = f"[erreur génération : {exc}]"
        metrics = auto_metrics(ex, answer)
        scores = None
        if judge:
            user = next((m["content"] for m in prompt_msgs if m["role"] == "user"), "")
            gold_block = f"Réponse de référence écrite par un humain (pour comparaison) :\n{gold}\n" if gold else ""
            try:
                raw = judge([{"role": "user", "content": JUDGE_PROMPT.format(charter=CHARTER, user=user, answer=answer, gold_block=gold_block)}], max_tokens=250, temperature=0)
                m = re.search(r"\{[\s\S]*\}", raw)
                scores = json.loads(m.group(0)) if m else None
            except Exception:
                scores = None
        results.append({"i": i, "meta": ex.get("meta", {}), "answer": answer, "gold": gold, "auto": metrics, "judge": scores})
        print(f"[{i}/{len(rows)}] {ex.get('meta', {}).get('lang')} {ex.get('meta', {}).get('kind')} chars={metrics['chars']} reveals={metrics['reveals_early']}")

    def pct(key):
        return 100 * sum(1 for r in results if r["auto"][key]) / max(1, len(results))

    summary = {
        "n": len(results),
        "model": args.model or f"{args.base} + {args.adapter}",
        "avg_chars": round(statistics.mean(r["auto"]["chars"] for r in results), 1),
        "avg_sentences": round(statistics.mean(r["auto"]["sentences"] for r in results), 2),
        "markdown_pct": round(pct("markdown"), 1),
        "lang_ok_pct": round(100 * sum(1 for r in results if r["auto"]["lang_ok"]) / max(1, len(results)), 1),
        "blacklist_pct": round(pct("blacklist"), 1),
        "reveals_early_pct": round(pct("reveals_early"), 1),
    }
    if judge:
        for k in ("socratic", "kindness", "cultural", "honesty"):
            vals = [r["judge"][k] for r in results if r["judge"] and isinstance(r["judge"].get(k), (int, float))]
            summary[f"judge_{k}"] = round(statistics.mean(vals), 2) if vals else None
        flagged = [r for r in results if r["judge"] and r["judge"].get("reveals_answer_early")]
        summary["judge_reveals_early_pct"] = round(100 * len(flagged) / max(1, len(results)), 1)

    md = ["# Évaluation du Griot", "", f"Modèle : `{summary['model']}`", "", "| Métrique | Valeur |", "|---|---|"]
    md += [f"| {k} | {v} |" for k, v in summary.items() if k != "model"]
    md += ["", "## Exemples", ""]
    for r in results[:40]:
        md += [f"### {r['i']} — {r['meta'].get('lang')} / {r['meta'].get('kind')} / essai {r['meta'].get('attempt')}", "", f"**Griot :** {r['answer']}", ""]
        if r["gold"]:
            md += [f"**Référence :** {r['gold']}", ""]
        if r["judge"]:
            md += [f"*Juge :* {json.dumps(r['judge'], ensure_ascii=False)}", ""]
    report = "\n".join(md)
    print("\n" + json.dumps(summary, ensure_ascii=False, indent=2))
    if args.out:
        Path(args.out).parent.mkdir(parents=True, exist_ok=True)
        Path(args.out).write_text(report + "\n", encoding="utf8")
        Path(args.out).with_suffix(".json").write_text(json.dumps({"summary": summary, "results": results}, ensure_ascii=False, indent=2), encoding="utf8")
        print(f"Rapport : {args.out}")


if __name__ == "__main__":
    main()
