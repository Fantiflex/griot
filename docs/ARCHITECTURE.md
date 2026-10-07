# Architecture LeGriot

## Décisions (octobre 2026)

| Sujet | Décision | Pourquoi |
|---|---|---|
| « IA locale » | Modèle à poids ouverts (Gemma 3) auto-hébergé derrière une API compatible OpenAI. Pas d'exécution sur le téléphone. | Fine-tunable, souverain, remplaçable ; les téléphones restent des clients légers. |
| Hébergement | Dev : Ollama sur PC CPU. Démo : GPU loué + vLLM. Cible : serveurs des établissements via Docker Compose. | Même code partout, seul `LLM_BASE_URL` change. |
| Fine-tuning | Pipeline complet et ouvert (`finetune/`), charte éthique versionnée, LoRA, registre par langue/région. | C'est le produit : un professeur africain éthique, adaptable par les autorités éducatives. |
| Pédagogie | Parcours à trois ateliers (maths, langue & écriture, histoire), scripts d'étapes que le Griot déroule seul. | La leçon avance même si le modèle est lent ou absent ; le modèle apporte la finesse. |
| Perception | Caméra périodique, fin d'écriture par stabilité d'image, Mathpix pour le manuscrit, Gemma vision en secours. | « Il comprend en voyant » sans bouton obligatoire. |
| Support | ESP32 + 2 servos, connexion WebSocket sortante vers le serveur, mode simulé à l'écran. | Pas de contenu mixte HTTPS→HTTP, fonctionne avec un serveur distant, démo possible sans matériel. |
| Classe | Code à 6 caractères, serveur source de vérité, SQLite, temps réel WebSocket, pas d'authentification. | Démo sans friction ; l'authentification viendra avec les premiers établissements. |
| Voix | TTS ouverte Piper côté serveur (FR, SW), navigateur en secours. | Fine-tunable plus tard ; la voix navigateur ne l'est pas. |

## Vue d'ensemble

```
 Téléphone de groupe (React, #/groupe/CODE/g1)         Console enseignant (#/prof/CODE)
   avatar Griot · bulle · caméra · boutons                 code · chrono · groupes · alertes
            │  HTTP /api + WS /ws                                   │  HTTP /api + WS /ws
            ▼                                                       ▼
 ┌─────────────────────────────── server/ (Node 24, Express, ws) ───────────────────────────────┐
 │ routes.ts        API HTTP                 realtime.ts   hub WS téléphones + console          │
 │ classroom/manager.ts   état des classes (source de vérité) → SQLite (db.ts) → bus.ts          │
 │ classroom/lesson.ts    moteur de leçon : parle, demande, lit, juge, relance, résume          │
 │ griot/prompts.ts       charte + contexte → prompts (juge JSON, question libre, résumé)        │
 │ perception/            Mathpix → sinon vision LLM → SlateReading                              │
 │ stand/                 presets pan/tilt + registre WS des ESP32 (/ws/stand)                    │
 │ tts.ts                 proxy + cache vers le sidecar Piper                                     │
 │ export.ts              dialogues → JSONL d'entraînement                                        │
 └───────┬───────────────────────────┬──────────────────────────┬───────────────────────────────┘
         │ OpenAI-compatible         │ HTTP                     │ WS sortant
         ▼                           ▼                          ▼
   Ollama / vLLM               services/tts (Piper)       firmware/griot-stand (ESP32)
   Gemma 3 (+ LoRA Griot)
```

Le contenu pédagogique (`content/`) et les types (`shared/`) sont partagés entre serveur et client.

## Cycle d'une étape « ask_write »

1. `lesson.runStep` : phase `waiting_slate`, le Griot lit la consigne, le support s'incline vers l'ardoise (`look_slate`).
2. Le téléphone capture une image toutes les 500 ms ; quand l'image a changé puis reste stable 2,5 s, il envoie la photo (`POST .../lesson/slate`). Le bouton « On a fini » et la saisie texte restent disponibles.
3. `perception.readSlate` : Mathpix si clé, sinon Gemma vision. Lecture vide → le Griot demande d'écrire plus gros, aucun essai compté.
4. `lesson.evaluate` : juge déterministe (`accept`, Levenshtein) quand la réponse est fermée ; juge modèle (JSON) pour le texte du retour et pour les questions ouvertes. En cas de désaccord, le script tranche et le texte du modèle est écarté.
5. Juste → `feedback`, support `nod`, score +1. Faux et essai < 3 → indice (modèle ou scripté), support `shake`, alerte « bloque » à partir du 2e essai. Faux au 3e → révélation avec explication.
6. Après la parole de feedback, le téléphone appelle `continue` et l'étape suivante démarre.

Tout événement (parole, lecture, verdict, question, aide) est journalisé dans `events` : c'est la matière première du fine-tuning (`/api/export/training.jsonl`).

## Robustesse sans modèle

Si le serveur de modèle est injoignable, `LlmUnavailableError` est attrapée partout : verdicts scriptés, indices scriptés, résumé scripté. Les tests (`npm test`) tournent dans ce mode. La console affiche « Modèle injoignable : le Griot suit le script ».

## Sécurité et données

- Pas de données personnelles : prénoms des rôles facultatifs, code de classe, texte des ardoises.
- Les photos d'ardoise ne sont pas stockées : seule la transcription l'est.
- Mathpix est un service cloud payant : il est optionnel et désactivé sans clé.
- HTTPS obligatoire pour la caméra hors localhost : `npm run cert:dev` en local, certificat réel en production.

## Dossiers

```
content/      parcours pédagogiques bilingues
ethics/       charte du Griot (prompt système + filtre des données)
finetune/     pipeline de fine-tuning, données gold, registre des modèles
firmware/     ESP32 du support robotisé
server/       API, temps réel, moteur de leçon, perception, voix, export
services/tts/ sidecar Piper
shared/       types partagés
src/          application React (accueil, console enseignant, téléphone de groupe, pitch)
tests/        tests du moteur de leçon (node:test)
```
