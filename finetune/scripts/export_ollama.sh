#!/usr/bin/env bash
# Exporte un adaptateur LoRA LeGriot vers Ollama (serveur d'établissement sans GPU).
#   scripts/export_ollama.sh output/legriot-griot-fr-sw [google/gemma-3-4b-it] [q4_K_M]
# Étapes : fusion base+LoRA (si <out>/merged absent) → GGUF via llama.cpp → quantification → ollama create.
# Prérequis : python avec transformers/peft, llama.cpp cloné dans $LLAMA_CPP (défaut ../llama.cpp), ollama installé.
set -euo pipefail

ADAPTER="${1:?chemin de l'adaptateur}"
BASE="${2:-google/gemma-3-4b-it}"
QUANT="${3:-q4_K_M}"
NAME="$(basename "$ADAPTER")"
LLAMA_CPP="${LLAMA_CPP:-../llama.cpp}"
MERGED="$ADAPTER/merged"

if [ ! -d "$MERGED" ]; then
  echo "Fusion de $BASE + $ADAPTER -> $MERGED"
  python - <<PY
import torch
from transformers import AutoModelForCausalLM, AutoTokenizer
from peft import PeftModel
tok = AutoTokenizer.from_pretrained("$BASE")
model = AutoModelForCausalLM.from_pretrained("$BASE", torch_dtype=torch.bfloat16, device_map="cpu")
model = PeftModel.from_pretrained(model, "$ADAPTER").merge_and_unload()
model.save_pretrained("$MERGED", safe_serialization=True)
tok.save_pretrained("$MERGED")
PY
fi

if [ ! -f "$LLAMA_CPP/convert_hf_to_gguf.py" ]; then
  echo "llama.cpp introuvable dans $LLAMA_CPP :  git clone https://github.com/ggml-org/llama.cpp \$LLAMA_CPP && make -C \$LLAMA_CPP llama-quantize" >&2
  exit 1
fi

F16="$ADAPTER/$NAME-f16.gguf"
OUT="$ADAPTER/$NAME-$QUANT.gguf"
[ -f "$F16" ] || python "$LLAMA_CPP/convert_hf_to_gguf.py" "$MERGED" --outfile "$F16" --outtype f16
[ -f "$OUT" ] || "$LLAMA_CPP/llama-quantize" "$F16" "$OUT" "$QUANT"

cat > "$ADAPTER/Modelfile" <<EOF
FROM ./$NAME-$QUANT.gguf
# Le gabarit de chat Gemma 3 est lu depuis le GGUF. Paramètres de génération du Griot :
PARAMETER temperature 0.6
PARAMETER top_p 0.9
PARAMETER num_ctx 8192
PARAMETER stop "<end_of_turn>"
EOF

ollama create "$NAME" -f "$ADAPTER/Modelfile"
echo
echo "Modèle Ollama créé : $NAME"
echo "Dans .env :  LLM_MODEL=$NAME   (LLM_BASE_URL=http://localhost:11434/v1)"
