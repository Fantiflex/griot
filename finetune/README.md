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

## Pourquoi des données synthétiques changent quelque chose

Un grand modèle propriétaire parle déjà bien kiswahili. Mais on ne peut ni l'héberger, ni le fine-tuner, ni le garantir hors ligne : il ne répond pas au cahier des charges. Le modèle que l'on fine-tune est **petit et ouvert** (Gemma 3 4B ou 12B). Sur lui, le fine-tuning agit sur trois choses mesurables :

1. **Le comportement.** Sans fine-tuning, un petit modèle donne la réponse trop tôt, écrit des listes, change de langue, s'étale. Avec 2 000 exemples conformes à la charte, ces défauts chutent fortement : c'est l'effet le plus net et le plus rapide à obtenir.
2. **Le registre.** Kiswahili scolaire, phrases courtes, oral, vocabulaire de la table et de l'ardoise : un petit modèle est médiocre dans ce registre précis, et s'y améliore avec des exemples ciblés.
3. **Le coût.** Un modèle qui a intériorisé la charte a besoin d'un prompt système court : moins de tokens à chaque appel, donc plus rapide sur un serveur d'établissement sans GPU.

Ce que le fine-tuning **ne fait pas** : ajouter des connaissances encyclopédiques fiables. L'histoire de Kilwa, les programmes, les réponses attendues restent dans le contenu des parcours (`content/`), pas dans les poids.

Condition pour que le synthétique serve : le modèle **générateur** doit être plus fort que le modèle **élève**. Faire générer Gemma 4B pour entraîner Gemma 4B n'apporte rien. On génère donc avec Gemma 3 27B ou un modèle ouvert plus grand (Llama 3.3 70B, Qwen 3, DeepSeek) sur le GPU loué, on filtre avec `validate.py`, et on ancre le style avec les exemples gold rédigés à la main. À terme, les vrais dialogues de classe relus par des enseignants remplacent progressivement le synthétique : c'est la donnée que personne d'autre n'a.

## Évaluation : comment savoir si l'entraînement a réussi

Il n'existe pas de benchmark public « professeur socratique en kiswahili ». On combine donc quatre mesures, toutes comparées **base vs fine-tuné** sur les mêmes entrées.

| Mesure | Outil | Ce qu'elle prouve |
|---|---|---|
| Métriques de comportement : réponse révélée trop tôt, markdown, langue, longueur, motifs interdits | `eval.py` (automatique) | Le modèle respecte la charte |
| Juge LLM sur la grille de la charte : socratique, bienveillance, ancrage culturel, honnêteté, notes 1 à 5 | `eval.py --judge-*` avec un modèle plus grand | Qualité pédagogique perçue |
| **Non-régression des capacités** : le fine-tuning n'a pas abîmé le modèle | `lm-evaluation-harness` sur MGSM (sw, fr : problèmes de maths d'école primaire en kiswahili et en français), Belebele (sw, fr : compréhension de lecture), AfriMMLU / IrokoBench (sw) | Le modèle compte et comprend toujours aussi bien |
| **Évaluation humaine en aveugle** : des enseignants swahiliphones et francophones voient deux réponses (base, fine-tuné) sans savoir laquelle est laquelle et choisissent la meilleure | Fichier `eval-pairs.jsonl` produit par `eval.py`, à soumettre via un simple formulaire | La preuve qu'un investisseur et un ministère comprennent |

Seuils cibles pour le premier adaptateur : réponse révélée trop tôt < 5 % (base typique : 30 à 50 %), markdown 0 %, langue correcte > 98 %, préférence humaine ≥ 70 % pour le fine-tuné, et MGSM/Belebele à ± 1 point de la base.

```bash
# Non-régression (sur la machine GPU, après pip install lm-eval)
lm_eval --model hf --model_args pretrained=google/gemma-3-4b-it,peft=output/legriot-griot-fr-sw \
  --tasks mgsm_direct_sw,mgsm_direct_fr,belebele_swh_Latn,belebele_fra_Latn --batch_size 8 --output_path output/lm-eval-lora
lm_eval --model hf --model_args pretrained=google/gemma-3-4b-it \
  --tasks mgsm_direct_sw,mgsm_direct_fr,belebele_swh_Latn,belebele_fra_Latn --batch_size 8 --output_path output/lm-eval-base
```

## Souveraineté

Les dialogues exportés d'une classe restent sur le serveur de l'établissement. L'export est une action explicite (bouton de la console enseignant, ou `GET /api/export/training.jsonl`). Aucun identifiant d'élève n'y figure : seulement le code de classe, le groupe, l'atelier, et le texte des échanges.
