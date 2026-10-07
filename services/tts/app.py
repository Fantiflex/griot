"""
LeGriot — service de synthèse vocale ouvert (Piper).

Voix à poids ouverts, exécutées sur CPU, en français et en kiswahili. La même interface
accueillera plus tard une voix fine-tunée sur des locuteurs africains.

  POST /synthesize  {"text": "...", "lang": "fr"|"sw"}  -> audio/wav
  GET  /health

Lancement local :  pip install -r requirements.txt && uvicorn app:app --port 5002
Les voix sont téléchargées au premier appel dans VOICES_DIR (défaut ./voices).
"""

from __future__ import annotations

import io
import os
import threading
import urllib.request
import wave
from pathlib import Path

from fastapi import FastAPI, HTTPException
from fastapi.responses import Response
from pydantic import BaseModel

VOICES_DIR = Path(os.environ.get("VOICES_DIR", "./voices"))
VOICES_DIR.mkdir(parents=True, exist_ok=True)

# Voix Piper publiées sur Hugging Face (rhasspy/piper-voices). Clé = langue de la classe.
HF = "https://huggingface.co/rhasspy/piper-voices/resolve/main"
VOICES: dict[str, dict[str, str]] = {
    "fr": {
        "name": "fr_FR-siwis-medium",
        "onnx": f"{HF}/fr/fr_FR/siwis/medium/fr_FR-siwis-medium.onnx",
        "json": f"{HF}/fr/fr_FR/siwis/medium/fr_FR-siwis-medium.onnx.json",
    },
    "sw": {
        "name": "sw_CD-lanfrica-medium",
        "onnx": f"{HF}/sw/sw_CD/lanfrica/medium/sw_CD-lanfrica-medium.onnx",
        "json": f"{HF}/sw/sw_CD/lanfrica/medium/sw_CD-lanfrica-medium.onnx.json",
    },
}

# Cadence de conteur : un peu plus lent que la valeur par défaut, pauses plus longues.
LENGTH_SCALE = float(os.environ.get("TTS_LENGTH_SCALE", "1.08"))
SENTENCE_SILENCE = float(os.environ.get("TTS_SENTENCE_SILENCE", "0.35"))

app = FastAPI(title="LeGriot TTS", version="0.1")
_lock = threading.Lock()
_voices: dict[str, object] = {}


def _download(url: str, dest: Path) -> None:
    if dest.exists():
        return
    tmp = dest.with_suffix(dest.suffix + ".part")
    urllib.request.urlretrieve(url, tmp)
    tmp.rename(dest)


def _load(lang: str):
    if lang in _voices:
        return _voices[lang]
    with _lock:
        if lang in _voices:
            return _voices[lang]
        spec = VOICES.get(lang) or VOICES["fr"]
        onnx = VOICES_DIR / f"{spec['name']}.onnx"
        cfg = VOICES_DIR / f"{spec['name']}.onnx.json"
        _download(spec["onnx"], onnx)
        _download(spec["json"], cfg)
        from piper import PiperVoice  # import tardif : démarrage rapide même sans modèle

        voice = PiperVoice.load(str(onnx), config_path=str(cfg))
        _voices[lang] = voice
        return voice


class SynthesizeIn(BaseModel):
    text: str
    lang: str = "fr"


@app.get("/health")
def health():
    return {"ok": True, "voices": {k: v["name"] for k, v in VOICES.items()}, "loaded": list(_voices)}


@app.post("/synthesize")
def synthesize(body: SynthesizeIn):
    text = body.text.strip()
    if not text:
        raise HTTPException(400, "Texte vide")
    lang = body.lang if body.lang in VOICES else "fr"
    try:
        voice = _load(lang)
    except Exception as exc:  # téléchargement ou chargement impossible
        raise HTTPException(503, f"Voix indisponible : {exc}") from exc

    buf = io.BytesIO()
    with wave.open(buf, "wb") as wav:
        # piper >= 1.2 : synthesize(text, wav_file, ...). Les anciennes versions exposent synthesize_stream_raw.
        try:
            from piper import SynthesisConfig  # type: ignore

            cfg = SynthesisConfig(length_scale=LENGTH_SCALE)
            voice.synthesize_wav(text, wav, syn_config=cfg)  # type: ignore[attr-defined]
        except Exception:
            voice.synthesize(text, wav, length_scale=LENGTH_SCALE, sentence_silence=SENTENCE_SILENCE)  # type: ignore[call-arg]
    return Response(content=buf.getvalue(), media_type="audio/wav")
