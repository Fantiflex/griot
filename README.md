# 🪘 LeGriot — Un professeur IA africain, éthique et souverain

> Un téléphone par table, posé sur un support robotisé. Un modèle à poids ouverts, hébergé sur vos serveurs, fine-tuné sur une charte, vos langues et vos programmes. Le Griot raconte, questionne, **regarde l'ardoise**, lit ce que le groupe a écrit et relance avec un indice.

**Site de présentation et démo jouable : https://clementdumeril.github.io/griot/**

Classes de 40 à 80 élèves, groupes de 8, aucun appareil individuel. Français et kiswahili aujourd'hui ; le pipeline de fine-tuning est ouvert pour que chaque autorité éducative ajoute les siens.

## Ce que fait le produit

- **Console enseignant** : crée une classe, obtient un code, suit tous les groupes en direct (étape, réussites, indices, appareils, support), reçoit des alertes (appel à l'aide, groupe qui bloque, inactivité, atelier terminé), pilote rotations et chrono.
- **Téléphone de groupe** : rejoint avec le code, se pose sur le support. Le Griot déroule l'atelier seul : il parle (voix ouverte Piper ou navigateur), demande d'écrire, incline la caméra, détecte que l'ardoise ne bouge plus, lit le manuscrit (Mathpix ou modèle de vision), juge, félicite ou guide, puis passe à la suite. Boutons « On a fini », « Un indice », « Poser une question », « Appeler l'enseignant ».
- **Support robotisé** : ESP32 + deux servos, relié au serveur par WebSocket. Simulé à l'écran tant que le matériel n'est pas là.
- **Contenu** : parcours « Les marchands de Kilwa » en trois ateliers (mathématiques, langue & écriture, histoire & géographie), bilingue FR/SW, avec étapes scriptées, réponses attendues, indices et explications.
- **Fine-tuning** : charte éthique versionnée, données gold rédigées à la main, génération synthétique, validation, LoRA sur Gemma 3, évaluation, export Ollama/vLLM, registre des modèles. Les dialogues de classe s'exportent en JSONL d'entraînement.

## Démarrer en 5 minutes (PC, sans GPU)

```bash
git clone https://github.com/Fantiflex/griot.git && cd griot
npm install
cp .env.example .env
# Modèle local : installer Ollama (https://ollama.com) puis
ollama pull gemma3:4b
npm run dev
```

Ouvrir http://localhost:3000. Sous Windows, `powershell -ExecutionPolicy Bypass -File scripts\setup-local.ps1` fait tout cela.

Sans aucun modèle (tests, CI) :

```bash
npm run mock:llm        # faux serveur compatible OpenAI sur :11435
npm run dev:mock
```

Téléphones sur le même Wi-Fi (la caméra exige HTTPS) :

```bash
npm run cert:dev
SSL_CERT=certs/dev-cert.pem SSL_KEY=certs/dev-key.pem npm run dev
```

Voix serveur (optionnel) : `services/tts/README.md`. Lecture manuscrite Mathpix (optionnel) : renseigner `MATHPIX_APP_ID` et `MATHPIX_APP_KEY`.

## Site de présentation

Le site vitrine (`site/`) est statique et contient une démo jouable dans le navigateur, sans serveur ni modèle. Il réutilise le vrai contenu des leçons et le même juge de réponses que le serveur.

```bash
npm run site:dev       # http://localhost:5174/griot/
npm run site:deploy    # build et publication sur GitHub Pages (branche gh-pages)
```

## Déployer

```bash
docker compose up -d                                   # web + Ollama (CPU) + voix
docker compose exec ollama ollama pull gemma3:4b
# GPU + vLLM + adaptateur LoRA LeGriot :
docker compose -f docker-compose.yml -f docker-compose.gpu.yml up -d
```

## Fine-tuner le Griot

Tout est dans [`finetune/README.md`](finetune/README.md) : générer, valider, assembler, entraîner (GPU loué ou Colab), évaluer, servir, enregistrer. La charte qui gouverne le modèle et filtre ses données est [`ethics/charte-griot.md`](ethics/charte-griot.md).

## Tester

```bash
npm test        # moteur de leçon sans modèle : 11 tests
npm run lint    # types
```

## Documentation

- [Architecture et décisions](docs/ARCHITECTURE.md)
- [Scénario de démonstration](docs/DEMO.md)
- [Firmware du support](firmware/README.md)
- [Service de voix](services/tts/README.md)

## Stack

Node 24 · Express · ws · SQLite natif · React 19 · Vite · Tailwind 4 · Gemma 3 via Ollama ou vLLM · Piper · Mathpix (optionnel) · ESP32 Arduino · Python (Unsloth/PEFT/TRL) pour le fine-tuning.

## Licence

MIT.
