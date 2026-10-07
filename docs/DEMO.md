# Scénario de démonstration investisseurs (5 minutes)

Matériel : un ordinateur portable (serveur + console enseignant projetée), deux ou trois téléphones Android avec Chrome sur le même Wi-Fi, le support robotisé ESP32 (ou le support simulé à l'écran), une ardoise et une craie par table.

## Avant

```bash
npm run cert:dev                      # une fois : certificat pour la caméra des téléphones
SSL_CERT=certs/dev-cert.pem SSL_KEY=certs/dev-key.pem npm run dev
```

Vérifier sur l'accueil : « Modèle local prêt », voix serveur ou navigateur, lecture manuscrite Mathpix ou vision.

## Déroulé

| Minute | Scène | Ce que les investisseurs voient |
|---|---|---|
| 0:00 | L'enseignant crée la classe « 6e B », français, 3 groupes. | Le code à 6 lettres s'affiche en grand. Pas de compte, pas de mot de passe. |
| 0:30 | Un téléphone rejoint avec le code et choisit « Lion 1 ». On le pose sur le support. | La carte du groupe passe à « 1 appareil », le support s'affiche connecté. |
| 1:00 | « Commencer l'atelier ». Le Griot raconte le quai de Kilwa et donne la première consigne. | Avatar, voix, bulle de texte ; le support se tourne vers les élèves. |
| 1:45 | Le Griot pose la question des douze sacs. Le support s'incline vers la table. | Le viseur caméra apparaît avec le guide d'alignement. |
| 2:15 | Un élève écrit « 6 » sur l'ardoise et retire la main. Deux secondes et demie plus tard, la photo part toute seule. | « Je regarde votre ardoise », puis « J'ai lu : 6 ». Indice socratique, le support fait non de la tête. Badge « IA » sur la bulle. |
| 3:00 | Les élèves écrivent « 8 ». | Lecture, « Bravo », le support acquiesce, le score monte sur la console. |
| 3:30 | Sur un second téléphone, un groupe appelle l'enseignant. | Alerte rouge sur la console avec le nom du groupe. L'enseignant l'acquitte. |
| 4:00 | Basculer la classe en kiswahili (nouvelle classe, langue Kiswahili). Le Griot parle swahili. | Même parcours, même code, autre langue : l'argument du fine-tuning par langue. |
| 4:30 | Ouvrir `finetune/` : charte, données gold, registre des modèles ; cliquer « Exporter les dialogues ». | Les échanges de la démo deviennent des données d'entraînement, sur place. |

## Phrases clés

- « Le téléphone ne pense pas : il regarde et il parle. Le professeur, c'est le modèle, chez vous, sur vos serveurs. »
- « Ce n'est pas un prompt : c'est un modèle fine-tuné sur une charte que vous pouvez lire, modifier et faire respecter. »
- « Chaque ministère peut refaire cet entraînement sur ses langues et ses programmes avec les scripts de ce dépôt. »

## Repli si quelque chose manque

- Pas de modèle : le Griot suit le script, les indices restent pertinents, la console signale « modèle injoignable ».
- Pas de caméra : bouton « On a fini » et saisie texte.
- Pas de support : le support simulé bouge à l'écran avec les mêmes commandes.
- Pas de voix serveur : voix du navigateur.
