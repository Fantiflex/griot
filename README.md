# 🪘 LeGriot — Scribe Mathématique & Pédagogie Collaborative en Afrique

> **Projet Hackathon EdTech & IA Éthique**  
> *Révolutionner l'apprentissage collaboratif dans les classes à forts effectifs (40-80 élèves) avec 1 seul téléphone intelligent par groupe de travail et de l'IA 100% locale.*

---

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6.x-646CFF.svg)](https://vitejs.dev/)
[![React](https://img.shields.io/badge/React-18.x-61DAFB.svg)](https://reactjs.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.x-38B2AC.svg)](https://tailwindcss.com/)
[![Gemini 2.5 API](https://img.shields.io/badge/Gemini_API-2.5-orange.svg)](https://ai.google.dev/)

---

## 🌟 Vision & Problématique

Dans de nombreuses régions subsahariennes, les enseignants font face à un défi pédagogique majeur : **encadrer de 40 à 80 élèves par classe** avec des ressources numériques limitées.

**LeGriot** propose un paradigme novateur :
- **1 Téléphone Étalon par Table (4 à 8 élèves)** : Pas besoin d'un appareil par élève. Le téléphone devient un support d'atelier partagé posé sur un support en bois/bambou ou au centre de la table.
- **Récits Interdisciplinaires & Héritage Culturel** : L'apprentissage de la géométrie (droites parallèles, losanges, symétrie) s'articule autour des motifs géométriques ancestraux des textiles **Toghu** et **Ndop** (Cameroun/Afrique Centrale).
- **Vérification Caméra & Analyse Géométrique** : Détection en temps réel des tracés manuels sur papier sous le téléphone via l'analyse géométrique et l'IA.
- **Compagnon Griot Vivant (Style Jeu Vidéo RPG)** : Un avatar interactif incarnant la sagesse africaine, parlant avec des voix et accents régionaux authentiques (Afrique de l'Ouest, de l'Est, Australe et Franco-Africaine).

---

## 🚀 Fonctionnalités Clés

### 👨‍🏫 1. Tableau de Bord Enseignant Temps Réel (`TeacherMinimalDashboard`)
- **Vue d'ensemble de la classe** : Suivi simultané de toutes les tables/groupes (Table Bamboutos, Wouri, Mayo, Sawa, etc.).
- **Indicateurs de Progression & Alertes** : Visualisation instantanée des groupes nécessitant une intervention (*"Besoin de guidage"*).
- **Dossier Élève & Modal Interactif** : Consultation de la fiche détaillée d'un élève avec fermeture fluide (<kbd>Échap</kbd>, clic extérieur ou bouton dédié).

### 📐 2. Atelier Élève & Scribe Ndop/Toghu (`StudentToghuNdopView`)
- **Mode Scribe Collaboratif (8 Rôles)** : Scribe, Métreur, Rapporteur, Gardien de la Règle, etc.
- **Viseur Caméra Direct (Overhead Camera)** : Caméra en direct avec guides d'alignement géométrique pour scanner les dessins faits sur papier.
- **Capturation Shutter 1-Seconde** : Prise de vue discrète de 1 seconde pour vérifier la précision des pentes ($\pm 2^\circ$) et la symétrie sans surcharge réseau.

### 🎭 3. Compagnon Griot Interactif (RPG Style)
- **Bulle de Dialogue BD/RPG** : Dialogue immersif avec pointeur dynamique vers le visage du Griot.
- **Options de Dialogue Interactives** : Demande d'indices sur la leçon, explication des concepts mathématiques.
- **Synthèse Vocale & Accents Régionaux** : Profils vocaux adaptatifs avec cadences et intonations locales.

---

## 🏗️ Architecture Technique

```
┌─────────────────────────────────────────────────────────────┐
│                 React 18 + Vite Single Page App             │
├──────────────────────────────┬──────────────────────────────┤
│ Teacher Dashboard            │ Student Workshop (Toghu/Ndop)│
│ - Realtime Group Status      │ - Role Rotation System       │
│ - Dossier Inspection         │ - Overhead Viewfinder        │
│ - Intervention Trigger       │ - RPG Griot Companion        │
└──────────────┬───────────────┴──────────────┬───────────────┘
               │                              │
               ▼                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      Express Node Server                    │
│   - Embedded Gemini API Proxy                               │
│   - Offline / On-Device Hybrid Logic                        │
│   - Production Dist & Assets Static Pipeline                │
└─────────────────────────────────────────────────────────────┘
```

---

## 🛠️ Tech Stack & Modèles

- **Frontend** : React 18, Vite, Tailwind CSS v4, Lucide React Icons.
- **Backend / Serveur** : Node.js, Express, `tsx`.
- **IA & Traitement d'Image** : `@google/genai` (Gemini API Server-Side Proxy), Canvas HTML5 pour la vision par ordinateur locale.
- **Audio & Séquenceur** : Web Audio API pour les retours sonores traditionnels (Djembe, Balafon).

---

## 💻 Installation & Démarrage Local

### Prérequis
- **Node.js** v18+ 
- **npm** v9+

### Étape 1 : Cloner le dépôt
```bash
git clone https://github.com/<votre-compte>/legriot-edtech.git
cd legriot-edtech
```

### Étape 2 : Installer les dépendances
```bash
npm install
```

### Étape 3 : Configurer les variables d'environnement
Créez un fichier `.env` basé sur `.env.example` :
```bash
cp .env.example .env
```

### Étape 4 : Lancer le serveur de développement
```bash
npm run dev
```
Ouvrez votre navigateur sur `http://localhost:3000`.

### Étape 5 : Compilation pour la Production
```bash
npm run build
npm start
```

---

## 📜 Licence & Impact

Développé avec passion dans le cadre du **Hackathon Éducation & IA Éthique**.
Licence MIT - Libre de réutilisation et d'adaptation pour les écoles et universités.
