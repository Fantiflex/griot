# Fine-tuning du Griot

Ce dossier contient tout ce qu'il faut pour transformer un modèle à poids ouverts (Gemma 3) en **professeur africain, éthique et socratique**, puis pour qu'une autorité éducative refasse l'opération sur ses propres langues, programmes et récits. C'est le cœur de ce que LeGriot vend : pas un prompt, un modèle.

## Vue d'ensemble

```
charte éthique (ethics/charte-griot.md)
        │ filtre + prompt système
        ▼
┌───────────────┐   ┌──────────────────────┐   ┌───────────────────────┐
│ gold (humain) │ + │ synthétique (généré) │ + │ dialogues de classe   │
│ data/seed/    │   │ generate_synthetic.py│   │ /api/export/training  │
└───────┬───────┘   └──────────┬───────────┘   └───────────┬───────────┘
        └──────────────────────┼───────────────────────────┘
                               ▼
                      validate.py  (charte, langue, longueur, doublons)
                               ▼
                      prepare_dataset.py → data/train.jsonl, data/val.jsonl
                               ▼
                      train_lora.py  (QLoRA, Unsloth ou PEFT)  — GPU
                               ▼
                      eval.py  (jeu de validation + juge selon la charte)
                               ▼
                 output/<nom>/  (adaptateur LoRA) → vLLM  ou  export_ollama.sh → GGUF/Ollama
                               ▼
                      registry/models.json  (langue, région, charte, données, scores)
```

## Format des données

Une ligne JSON par exemple, format « messages » :

```json
{"messages":[{"role":"user","content":"<contexte pédagogique>\n\nLe groupe a écrit sur l’ardoise : « 6 »"},{"role":"assistant","content":"Pas encore, mais..."}],
 "meta":{"source":"gold","lang":"fr","region":"CM","subject":"math","kind":"hint","charter_version":"0.1"}}
```

Le prompt système (la charte) est injecté par `prepare_dataset.py`, pas stocké dans chaque ligne. Détails : [data/SCHEMA.md](data/SCHEMA.md).

## Étapes

### 0. Prérequis

- Python 3.10+ et `pip install -r requirements.txt` (génération/validation : CPU suffit).
- Pour l'entraînement : un GPU de 16 Go minimum pour Gemma 3 4B en QLoRA, 24 Go confortable, 48 Go pour 12B. Location à l'heure (RunPod, Vast, Scaleway, OVH) ou Google Colab : voir `notebooks/colab_train.md`.
- Accès Hugging Face aux poids Gemma (accepter la licence, `huggingface-cli login`).

### 1. Générer des dialogues synthétiques

Le générateur demande à un modèle (le même serveur compatible OpenAI que l'appli, ou un plus gros modèle ouvert si disponible) de produire des échanges professeur-groupe à partir de `seeds/topics.yaml` (matières, notions, erreurs typiques, cultures, langues). La charte est dans le prompt.

```bash
python scripts/generate_synthetic.py --lang fr --n 400 --out data/synthetic_fr.jsonl \
  --base-url http://localhost:11434/v1 --model gemma3:12b
python scripts/generate_synthetic.py --lang sw --n 300 --out data/synthetic_sw.jsonl ...
```

Ordre de grandeur pour un premier vrai fine-tune de démonstration : 1 500 à 3 000 exemples validés, moitié français, moitié kiswahili, avec les ~40 exemples « gold » rédigés à la main qui servent de modèle de style.

### 2. Valider

```bash
python scripts/validate.py data/seed/*.jsonl data/synthetic_*.jsonl --report data/validation_report.md
```

Rejette : réponses qui donnent la solution avant le 3e essai, listes à puces/markdown, longueur hors bornes, langue incohérente, motifs interdits par la charte (humiliation, punition, stéréotypes, prosélytisme), doublons proches. Les rejets sont listés pour relecture humaine.

### 3. Assembler

```bash
python scripts/prepare_dataset.py --inputs data/seed/*.jsonl data/synthetic_*.jsonl data/classroom_*.jsonl \
  --out-dir data --val-ratio 0.08
```

Produit `train.jsonl` et `val.jsonl` avec le prompt système, équilibrés par langue et par type.

### 4. Entraîner (GPU)

```bash
python scripts/train_lora.py --base google/gemma-3-4b-it --train data/train.jsonl --val data/val.jsonl \
  --out output/legriot-griot-fr-sw --epochs 2 --lr 1e-4 --rank 32
```

QLoRA 4 bits via Unsloth si installé (2 à 3 fois plus rapide), sinon PEFT + TRL. Sur une RTX 4090 : ~25 minutes pour 2 000 exemples et Gemma 3 4B.

### 5. Évaluer

```bash
python scripts/eval.py --adapter output/legriot-griot-fr-sw --val data/val.jsonl --judge-base-url http://localhost:11434/v1 --judge-model gemma3:12b
```

Mesure : respect de la charte (juge LLM avec la grille de la charte), taux de « réponse révélée trop tôt », longueur, langue, et compare base vs fine-tuné. Le rapport va dans `output/<nom>/eval.md` et alimente le registre.

### 6. Servir

- **vLLM (GPU)** : l'adaptateur est monté par `docker-compose.gpu.yml` (`--lora-modules legriot-griot-fr-sw=/adapters/legriot-griot-fr-sw`). `LLM_MODEL=legriot-griot-fr-sw`.
- **Ollama (CPU, serveur d'établissement)** : `scripts/export_ollama.sh output/legriot-griot-fr-sw` fusionne l'adaptateur, convertit en GGUF q4_K_M et crée le modèle `legriot-griot-fr-sw` dans Ollama. `LLM_MODEL=legriot-griot-fr-sw`.

### 7. Enregistrer

Ajouter l'entrée dans `registry/models.json` : nom, base, langues, région, version de charte, sources de données, scores d'évaluation, date. C'est ce registre qu'une autorité éducative consulte pour choisir ou publier un modèle.

## Souveraineté

Les dialogues exportés d'une classe restent sur le serveur de l'établissement. L'export est une action explicite (bouton de la console enseignant, ou `GET /api/export/training.jsonl`). Aucun identifiant d'élève n'y figure : seulement le code de classe, le groupe, l'atelier, et le texte des échanges.
