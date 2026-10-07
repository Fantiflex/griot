# Entraîner le Griot sur Google Colab ou un GPU loué

Copier ces cellules dans un notebook (Colab : *Exécution → Modifier le type d'exécution → GPU*, un T4 16 Go suffit pour Gemma 3 4B en 4 bits ; un A100/L4 va plus vite). Sur un GPU loué (RunPod, Vast, Scaleway…), les mêmes commandes s'exécutent dans un terminal.

## 1. Dépendances

```bash
pip install -q "unsloth[colab-new] @ git+https://github.com/unslothai/unsloth.git"
pip install -q --no-deps trl peft accelerate bitsandbytes datasets
pip install -q openai pyyaml tqdm
```

## 2. Récupérer le dépôt et les données

```bash
git clone https://github.com/Fantiflex/griot.git && cd griot/finetune
# Déposer ici les fichiers préparés en local : data/train.jsonl et data/val.jsonl
# (ou les régénérer : generate_synthetic.py → validate.py → prepare_dataset.py)
```

Accès aux poids Gemma : `huggingface-cli login` avec un jeton ayant accepté la licence Gemma.

## 3. Entraîner

```bash
python scripts/train_lora.py --base google/gemma-3-4b-it \
  --train data/train.jsonl --val data/val.jsonl \
  --out output/legriot-griot-fr-sw --epochs 2 --lr 1e-4 --rank 32 --merge
```

Ordre de grandeur : 2 000 exemples × 2 époques ≈ 25 min sur A100, ≈ 1 h 30 sur T4.

## 4. Évaluer base vs fine-tuné

```bash
python scripts/eval.py --base google/gemma-3-4b-it --val data/val.jsonl --limit 60 --out output/eval-base.md
python scripts/eval.py --base google/gemma-3-4b-it --adapter output/legriot-griot-fr-sw --val data/val.jsonl --limit 60 --out output/eval-lora.md
```

Comparer `reveals_early_pct`, `markdown_pct`, `lang_ok_pct` et, si un juge est configuré, les quatre notes de la charte.

## 5. Rapatrier

```bash
zip -r legriot-griot-fr-sw.zip output/legriot-griot-fr-sw -x "output/legriot-griot-fr-sw/checkpoints/*"
```

Télécharger l'archive, la déposer dans `finetune/output/` du serveur, puis :

- GPU + vLLM : `docker compose -f docker-compose.yml -f docker-compose.gpu.yml up -d` (l'adaptateur est monté automatiquement).
- CPU + Ollama : `scripts/export_ollama.sh output/legriot-griot-fr-sw`.

Enfin, compléter `registry/models.json` avec les scores d'évaluation et la date.
