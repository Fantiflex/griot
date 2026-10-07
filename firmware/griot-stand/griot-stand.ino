/*
 * LeGriot — support robotisé (ESP32 + 2 servos pan/tilt)
 *
 * Le support se connecte en WebSocket sortant au serveur LeGriot :
 *   ws://<serveur>:3000/ws/stand?code=<CODE_CLASSE>&group=<gN>
 * et reçoit des commandes JSON :
 *   {"cmd":"move","pan":90,"tilt":135,"ms":900}
 * Il les exécute en douceur (interpolation) et renvoie périodiquement son état.
 * Un petit serveur HTTP local (/move?pan=..&tilt=..) sert aux tests sans serveur.
 *
 * Bibliothèques (gestionnaire Arduino) :
 *   - ESP32Servo            (Kevin Harrington)
 *   - ArduinoJson  >= 7     (Benoit Blanchon)
 *   - WebSockets   >= 2.4   (Markus Sattler, « WebSockets » links2004)
 *
 * Câblage (ESP32 DevKit) :
 *   servo pan   signal -> GPIO 13, +5V, GND
 *   servo tilt  signal -> GPIO 14, +5V, GND
 *   Alimentation servos séparée (5V / 2A), masse commune avec l'ESP32.
 */

#include <WiFi.h>
#include <WebServer.h>
#include <WebSocketsClient.h>
#include <ArduinoJson.h>
#include <ESP32Servo.h>
#include <Preferences.h>

// ---------- Configuration ----------
// Au premier démarrage, si le Wi-Fi échoue, l'ESP32 ouvre un point d'accès « LeGriot-Stand »
// et une page http://192.168.4.1 pour saisir Wi-Fi, serveur, code de classe et groupe.
static const char* FIRMWARE = "griot-stand/0.2";
static const int PIN_PAN = 13;
static const int PIN_TILT = 14;
static const int PAN_MIN = 20, PAN_MAX = 160;
static const int TILT_MIN = 60, TILT_MAX = 150;   // > 90 = penché vers la table
static const int HOME_PAN = 90, HOME_TILT = 90;

Preferences prefs;
String wifiSsid, wifiPass, serverHost, classCode, groupId;
int serverPort = 3000;
bool useTls = false;

Servo panServo, tiltServo;
WebSocketsClient ws;
WebServer http(80);

// Interpolation de mouvement
float curPan = HOME_PAN, curTilt = HOME_TILT;
float fromPan = HOME_PAN, fromTilt = HOME_TILT, toPan = HOME_PAN, toTilt = HOME_TILT;
unsigned long moveStart = 0, moveMs = 0;
unsigned long lastState = 0;
bool apMode = false;

// ---------- Mouvement ----------
void startMove(int pan, int tilt, int ms) {
  fromPan = curPan; fromTilt = curTilt;
  toPan = constrain(pan, PAN_MIN, PAN_MAX);
  toTilt = constrain(tilt, TILT_MIN, TILT_MAX);
  moveMs = max(80, ms);
  moveStart = millis();
}

float easeInOut(float t) { return t < 0.5f ? 2 * t * t : 1 - powf(-2 * t + 2, 2) / 2; }

void updateMove() {
  if (moveMs == 0) return;
  float t = (float)(millis() - moveStart) / (float)moveMs;
  if (t >= 1.0f) { t = 1.0f; moveMs = 0; }
  float e = easeInOut(t);
  curPan = fromPan + (toPan - fromPan) * e;
  curTilt = fromTilt + (toTilt - fromTilt) * e;
  panServo.write((int)curPan);
  tiltServo.write((int)curTilt);
}

// ---------- WebSocket ----------
void sendState() {
  JsonDocument doc;
  doc["type"] = "state";
  doc["pan"] = (int)curPan;
  doc["tilt"] = (int)curTilt;
  String out; serializeJson(doc, out);
  ws.sendTXT(out);
}

void onWsEvent(WStype_t type, uint8_t* payload, size_t length) {
  switch (type) {
    case WStype_CONNECTED: {
      Serial.println("[ws] connecté");
      JsonDocument hello;
      hello["type"] = "hello";
      hello["firmware"] = FIRMWARE;
      String out; serializeJson(hello, out);
      ws.sendTXT(out);
      break;
    }
    case WStype_DISCONNECTED:
      Serial.println("[ws] déconnecté");
      break;
    case WStype_TEXT: {
      JsonDocument doc;
      if (deserializeJson(doc, payload, length)) return;
      const char* cmd = doc["cmd"] | "";
      if (strcmp(cmd, "move") == 0) {
        startMove(doc["pan"] | HOME_PAN, doc["tilt"] | HOME_TILT, doc["ms"] | 600);
      } else if (strcmp(cmd, "hello") == 0) {
        Serial.printf("[ws] groupe %s\n", (const char*)(doc["groupId"] | ""));
      }
      break;
    }
    default: break;
  }
}

void connectWs() {
  String path = "/ws/stand?code=" + classCode + "&group=" + groupId;
  if (useTls) ws.beginSSL(serverHost.c_str(), serverPort, path.c_str());
  else ws.begin(serverHost.c_str(), serverPort, path.c_str());
  ws.onEvent(onWsEvent);
  ws.setReconnectInterval(3000);
  ws.enableHeartbeat(15000, 3000, 2);
}

// ---------- Configuration via page web ----------
const char* CONFIG_PAGE =
  "<!doctype html><meta name=viewport content='width=device-width'>"
  "<h2>LeGriot — support</h2><form method=post action=/save>"
  "Wi-Fi SSID <input name=ssid><br>Mot de passe <input name=pass type=password><br>"
  "Serveur (hôte) <input name=host placeholder='192.168.1.20 ou griot.ecole.cm'><br>"
  "Port <input name=port value=3000><br>TLS (wss) <input type=checkbox name=tls><br>"
  "Code de classe <input name=code maxlength=6 style='text-transform:uppercase'><br>"
  "Groupe <input name=group value=g1><br><button>Enregistrer et redémarrer</button></form>";

void handleSave() {
  prefs.begin("griot", false);
  prefs.putString("ssid", http.arg("ssid"));
  prefs.putString("pass", http.arg("pass"));
  prefs.putString("host", http.arg("host"));
  prefs.putInt("port", http.arg("port").toInt());
  prefs.putBool("tls", http.hasArg("tls"));
  String code = http.arg("code"); code.toUpperCase();
  prefs.putString("code", code);
  prefs.putString("group", http.arg("group"));
  prefs.end();
  http.send(200, "text/html", "Enregistré. Redémarrage…");
  delay(500);
  ESP.restart();
}

void handleMove() {  // test local : /move?pan=90&tilt=135&ms=800
  startMove(http.arg("pan").toInt(), http.arg("tilt").toInt(), http.hasArg("ms") ? http.arg("ms").toInt() : 600);
  http.sendHeader("Access-Control-Allow-Origin", "*");
  http.send(200, "application/json", "{\"ok\":true}");
}

void loadConfig() {
  prefs.begin("griot", true);
  wifiSsid = prefs.getString("ssid", "");
  wifiPass = prefs.getString("pass", "");
  serverHost = prefs.getString("host", "");
  serverPort = prefs.getInt("port", 3000);
  useTls = prefs.getBool("tls", false);
  classCode = prefs.getString("code", "");
  groupId = prefs.getString("group", "g1");
  prefs.end();
}

// ---------- Arduino ----------
void setup() {
  Serial.begin(115200);
  ESP32PWM::allocateTimer(0);
  ESP32PWM::allocateTimer(1);
  panServo.setPeriodHertz(50);
  tiltServo.setPeriodHertz(50);
  panServo.attach(PIN_PAN, 500, 2400);
  tiltServo.attach(PIN_TILT, 500, 2400);
  panServo.write(HOME_PAN);
  tiltServo.write(HOME_TILT);

  loadConfig();

  bool online = false;
  if (wifiSsid.length()) {
    WiFi.mode(WIFI_STA);
    WiFi.begin(wifiSsid.c_str(), wifiPass.c_str());
    Serial.printf("[wifi] connexion à %s", wifiSsid.c_str());
    for (int i = 0; i < 40 && WiFi.status() != WL_CONNECTED; i++) { delay(500); Serial.print('.'); }
    Serial.println();
    online = WiFi.status() == WL_CONNECTED;
  }

  if (!online) {
    apMode = true;
    WiFi.mode(WIFI_AP);
    WiFi.softAP("LeGriot-Stand");
    Serial.println("[wifi] mode configuration : http://192.168.4.1");
    http.on("/", []() { http.send(200, "text/html", CONFIG_PAGE); });
  } else {
    Serial.printf("[wifi] IP %s\n", WiFi.localIP().toString().c_str());
    http.on("/", []() { http.send(200, "text/html", String("<h3>LeGriot stand</h3><p>") + classCode + " / " + groupId + "</p><a href=/config>Configurer</a>"); });
    http.on("/config", []() { http.send(200, "text/html", CONFIG_PAGE); });
    if (serverHost.length() && classCode.length()) connectWs();
  }
  http.on("/save", HTTP_POST, handleSave);
  http.on("/move", handleMove);
  http.begin();

  // Petit salut mécanique au démarrage
  startMove(HOME_PAN, 100, 400);
}

void loop() {
  http.handleClient();
  if (!apMode) ws.loop();
  updateMove();
  if (!apMode && millis() - lastState > 5000) {
    lastState = millis();
    if (ws.isConnected()) sendState();
  }
  delay(5);
}
