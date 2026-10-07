# Schéma des données d'entraînement

Un fichier `.jsonl` : une ligne = un exemple = un objet JSON avec deux clés.

## `messages`

Liste ordonnée de messages au format chat. Dans les fichiers sources (gold, synthétique, classe), **pas de message système** : il est injecté par `prepare_dataset.py` à partir de `ethics/charte-griot.md`, ce qui garantit que tout le jeu de données partage la même charte et permet de ré-entraîner après une mise à jour de la charte.

- `user` : le contexte pédagogique puis ce que le groupe a écrit, dit ou choisi. Convention :
  ```
  Parcours : <titre>.
  Atelier : <titre> (<notion du programme>).
  Consigne : <question posée par le Griot>
  Réponse attendue : <si fermée>
  Essai numéro <n> sur 3.

  Le groupe a écrit sur l’ardoise : « ... »       | Le groupe demande : « ... »  | Le groupe a choisi : « ... »
  ```
- `assistant` : la réponse du Griot. 2 à 4 phrases, orales, sans markdown, dans la langue de `meta.lang`.

Multi-tours autorisés (user/assistant alternés) pour les dialogues synthétiques longs.

## `meta`

| Champ | Valeurs | Obligatoire |
|---|---|---|
| `source` | `gold` (rédigé à la main), `synthetic`, `classroom` | oui |
| `lang` | `fr`, `sw`, … (ISO 639-1) | oui |
| `region` | ISO 3166-1 alpha-2 du contexte culturel (`CM`, `KE`, `TZ`, `SN`, `ML`…) ou `PAN` (panafricain) | oui |
| `subject` | `math`, `language`, `history`, `science`, `general` | oui |
| `kind` | `hint` (indice, pas la réponse), `feedback` (réponse juste), `answer` (révélation après 3 essais), `tell` (récit), `ask` (consigne), `refusal` (hors cadre, orientation vers l'enseignant), `encourage` | oui |
| `attempt` | 1, 2, 3 pour `hint`/`answer` | si pertinent |
| `charter_version` | version de la charte sous laquelle l'exemple a été écrit ou validé | oui |
| `author` | identifiant du rédacteur ou du générateur | non |
| `reviewed` | `true` si relu par un humain | non |
| `grade` | tranche d'âge visée, ex. `10-14` | non |

## Règles de qualité (appliquées par `validate.py`)

1. `kind=hint` avec `attempt<3` ne doit pas contenir la réponse attendue.
2. Pas de `*`, `#`, `-` en début de ligne, pas de listes.
3. 60 à 600 caractères pour l'assistant (tell : jusqu'à 1 200).
4. Langue détectée cohérente avec `meta.lang` (heuristique de mots fréquents).
5. Aucun motif de la liste noire de la charte (voir `validate.py`).
6. Distance de Jaccard sur les trigrammes > 0,15 avec tout autre exemple (anti-doublons).
