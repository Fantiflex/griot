# Support robotisé LeGriot — firmware ESP32

Le téléphone du groupe est posé sur un support motorisé à deux servos (pan = rotation, tilt = inclinaison). Le Griot décide où regarder (« regarde l'ardoise », « regarde les élèves », « acquiesce ») ; le serveur traduit ces intentions en angles et les envoie au support par WebSocket. Le même flux anime le support simulé à l'écran.

## Matériel

| Pièce | Référence indicative |
|---|---|
| Carte | ESP32 DevKit v1 (WROOM-32) |
| Servo pan | MG90S ou SG90 (rotation 0-180°) |
| Servo tilt | MG995 / MG996R (couple pour tenir le téléphone) |
| Alimentation servos | 5 V / 2 A, masse commune avec l'ESP32 |
| Structure | socle lesté, mât, berceau de téléphone imprimé 3D ou bois/bambou |

Câblage : signal pan → GPIO 13, signal tilt → GPIO 14. Ne pas alimenter les servos par la broche 5 V de l'ESP32.

Repère des angles : pan 90 = face aux élèves ; tilt 90 = horizontal, 135 = caméra vers la table. Limites logicielles dans le sketch (`PAN_MIN/MAX`, `TILT_MIN/MAX`).

## Flasher

1. Arduino IDE ≥ 2.x, carte « ESP32 Dev Module ».
2. Bibliothèques : ESP32Servo, ArduinoJson (≥ 7), WebSockets (links2004).
3. Ouvrir `griot-stand/griot-stand.ino`, téléverser.

## Configurer

Au premier démarrage, le support crée le Wi-Fi « LeGriot-Stand ». S'y connecter, ouvrir http://192.168.4.1, saisir : Wi-Fi de la classe, hôte et port du serveur LeGriot, TLS si le serveur est en HTTPS, code de la classe (affiché sur la console enseignant), groupe (`g1`, `g2`…). Le support redémarre, se connecte, et la console enseignant affiche « Support robotisé connecté » pour ce groupe.

Pour reconfigurer : http://<ip-du-support>/config.

## Protocole

Connexion sortante : `ws(s)://<serveur>/ws/stand?code=ABC123&group=g1`

Serveur → support :
```json
{"cmd":"move","pan":90,"tilt":135,"ms":900}
```
Support → serveur :
```json
{"type":"hello","firmware":"griot-stand/0.2"}
{"type":"state","pan":90,"tilt":135}
```

Test sans serveur : `http://<ip-du-support>/move?pan=60&tilt=120&ms=800`.

## Pourquoi une connexion sortante

Le téléphone est servi en HTTPS (obligatoire pour la caméra) et ne peut pas appeler un ESP32 en HTTP sur le réseau local (contenu mixte bloqué). Le support se connecte donc lui-même au serveur, qui relaie. Cela marche aussi quand le serveur est loué dans le cloud, sans ouvrir de port chez l'établissement.
