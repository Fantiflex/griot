# Voix du Griot — service TTS ouvert (Piper)

Synthèse vocale à poids ouverts, sur CPU, en français (`fr_FR-siwis-medium`) et en kiswahili (`sw_CD-lanfrica-medium`). Le serveur Node appelle `POST /synthesize` et met l'audio en cache ; si ce service est absent, les téléphones basculent sur la voix du navigateur.

## Lancer en local

```bash
cd services/tts
python -m venv .venv && . .venv/bin/activate     # Windows : .venv\Scripts\activate
pip install -r requirements.txt
uvicorn app:app --port 5002
```

Sous Windows, Piper a besoin d'`espeak-ng` : installer depuis https://github.com/espeak-ng/espeak-ng/releases puis relancer. Les voix se téléchargent au premier appel dans `./voices`.

## Docker

Inclus dans `docker-compose.yml` sous le nom `tts`.

## Fine-tuner la voix plus tard

Piper s'entraîne sur quelques heures d'enregistrements d'un locuteur. La piste prévue : enregistrer des conteurs francophones et swahiliphones d'Afrique, entraîner une voix Piper par langue, la déposer dans `voices/` et changer `VOICES` dans `app.py`. L'interface `/synthesize` ne change pas.
