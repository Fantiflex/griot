import React, { useState } from 'react';
import { useClassroom } from '../context/ClassroomContext';
import {
  Users,
  Smartphone,
  Cpu,
  Sun,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  RotateCw,
  Compass,
  PenTool,
  Ruler,
  Volume2,
  Calculator,
  Download,
  Send,
  Layers,
  Zap,
  Globe2,
  HardDrive,
  Radio,
  BookOpen,
  Award,
} from 'lucide-react';
import { TeacherDashboard } from './TeacherDashboard';
import { StudentGroupExperience } from './StudentGroupExperience';
import { playDjembeBass, playRotationCall } from '../utils/audio';

export const SellingLandingPage: React.FC = () => {
  const { setViewMode } = useClassroom();
  
  // Demo interactive tab: 'teacher' or 'student'
  const [demoTab, setDemoTab] = useState<'student' | 'teacher'>('student');

  // ROI / School Kit Calculator State
  const [calcStudents, setCalcStudents] = useState<number>(350);
  const [calcClasses, setCalcClasses] = useState<number>(5);

  // Lead request form state
  const [pilotSchoolName, setPilotSchoolName] = useState('');
  const [pilotLocation, setPilotLocation] = useState('');
  const [pilotEmail, setPilotEmail] = useState('');
  const [pilotSubmitted, setPilotSubmitted] = useState(false);

  // Hardware tab selector
  const [activeHardwareSpec, setActiveHardwareSpec] = useState<'hub' | 'acoustic' | 'slates' | 'nfc'>('hub');

  const handleCalculateCost = () => {
    const traditionalOneToOneCost = calcStudents * 220; // $220 per tablet
    const leGriotKitCost = calcClasses * 115; // $115 per 8-smartphone class kit (uses existing parents/teachers phones)
    const costPerLearnerPerYear = (leGriotKitCost / calcStudents).toFixed(2);
    const savings = traditionalOneToOneCost - leGriotKitCost;
    return { traditionalOneToOneCost, leGriotKitCost, costPerLearnerPerYear, savings };
  };

  const calcResults = handleCalculateCost();

  const handlePilotSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pilotEmail || !pilotSchoolName) return;
    playRotationCall();
    setPilotSubmitted(true);
  };

  return (
    <div className="bg-[#FFFDF7] text-stone-900 font-sans selection:bg-[#E5A823] selection:text-stone-950">
      
      {/* Top Banner Alert: The Continental Reality */}
      <div className="bg-[#1A1817] text-[#FAF6EC] py-2 px-4 text-xs font-mono text-center border-b border-stone-800 flex items-center justify-center gap-2">
        <span className="w-2 h-2 rounded-full bg-[#E5A823] animate-pulse" />
        <span>UNESCO Data: Sub-Saharan Africa faces a shortage of <strong>15 Million Teachers</strong> for 170 Million new learners.</span>
        <button
          onClick={() => {
            const el = document.getElementById('economics');
            el?.scrollIntoView({ behavior: 'smooth' });
          }}
          className="underline text-[#E5A823] hover:text-[#F5BA1E] ml-2 hidden sm:inline"
        >
          View The Unit Economics ➔
        </button>
      </div>

      {/* Hero Section: The LeGriot Proposition */}
      <section className="relative overflow-hidden pt-12 pb-20 border-b-3 border-[#1A1817] dair-pattern-stripes">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          
          <div className="max-w-4xl mx-auto text-center space-y-6">
            
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FAF6EC] border-2 border-[#1A1817] dair-shadow-sm text-xs font-black uppercase tracking-wider text-[#78350F]">
              <Sparkles className="w-4 h-4 text-[#C34B26]" />
              <span>Sovereign African EdTech · Inspired by DAIR & Msingi</span>
            </div>

            <h1 className="font-serif font-black text-4xl sm:text-6xl lg:text-7xl text-[#1A1817] leading-[1.08] tracking-tight">
              Multiply the Teacher. <br />
              <span className="text-[#C34B26] italic font-serif">Not the Devices.</span>
            </h1>

            <p className="text-base sm:text-xl text-stone-700 max-w-2xl mx-auto leading-relaxed font-medium">
              In classrooms where <strong>40 to 70 children</strong> share a single instructor, 1-to-1 screens lead to chaos and debt. <strong className="text-[#1A1817]">LeGriot</strong> is a divide-and-conquer learning system: <strong>one teacher</strong> orchestrates small circles of 8, each guided by their own Griot for the day with <strong>one shared smartphone</strong>.
            </p>

            {/* High-Impact Stat Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 max-w-3xl mx-auto text-left">
              <div className="bg-[#FFFDF7] p-3.5 rounded-2xl border-2 border-[#1A1817] dair-shadow-sm">
                <div className="font-serif font-black text-2xl sm:text-3xl text-[#1A1817]">1 : 70</div>
                <div className="text-[11px] text-stone-600 font-bold uppercase mt-0.5">Ratio Bridged</div>
              </div>
              <div className="bg-[#FFFDF7] p-3.5 rounded-2xl border-2 border-[#1A1817] dair-shadow-sm">
                <div className="font-serif font-black text-2xl sm:text-3xl text-[#156050]">1 Phone</div>
                <div className="text-[11px] text-stone-600 font-bold uppercase mt-0.5">Per 8 Learners</div>
              </div>
              <div className="bg-[#FFFDF7] p-3.5 rounded-2xl border-2 border-[#1A1817] dair-shadow-sm">
                <div className="font-serif font-black text-2xl sm:text-3xl text-[#C34B26]">3 Stations</div>
                <div className="text-[11px] text-stone-600 font-bold uppercase mt-0.5">Math · Writing · Geo</div>
              </div>
              <div className="bg-[#FFFDF7] p-3.5 rounded-2xl border-2 border-[#1A1817] dair-shadow-sm">
                <div className="font-serif font-black text-2xl sm:text-3xl text-[#D97706]">$0.15</div>
                <div className="text-[11px] text-stone-600 font-bold uppercase mt-0.5">Per Kid / Month</div>
              </div>
            </div>

            {/* CTAs */}
            <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
              <button
                onClick={() => {
                  const demoEl = document.getElementById('live-demo');
                  demoEl?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="px-6 py-4 rounded-2xl bg-[#E5A823] hover:bg-[#F5BA1E] text-stone-950 font-black text-sm border-3 border-[#1A1817] dair-shadow transition-all active:translate-y-0.5 flex items-center gap-2 cursor-pointer"
              >
                <span>Tester la Démo Interactive en Direct</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => {
                  const hardwareEl = document.getElementById('hardware');
                  hardwareEl?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="px-6 py-4 rounded-2xl bg-[#FFFDF7] hover:bg-stone-100 text-stone-900 font-black text-sm border-3 border-[#1A1817] dair-shadow-sm transition-all active:translate-y-0.5 flex items-center gap-2 cursor-pointer"
              >
                <Cpu className="w-4 h-4 text-[#C34B26]" />
                <span>Découvrir le Kit Hardware Solaire</span>
              </button>
            </div>

          </div>

        </div>
      </section>

      {/* The Crisis in Numbers vs The Griot Solution */}
      <section className="py-16 sm:py-24 border-b-3 border-[#1A1817] bg-[#FAF6EC]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          <div className="max-w-3xl space-y-3">
            <span className="text-xs font-black uppercase tracking-wider text-[#C34B26]">
              Le Diagnostic Continental
            </span>
            <h2 className="font-serif font-black text-3xl sm:text-5xl text-[#1A1817] leading-tight">
              Pourquoi les tablettes individuelles ont échoué.
            </h2>
            <p className="text-stone-700 text-base leading-relaxed">
              Pendant quinze ans, les programmes gouvernementaux ont distribué des tablettes bon marché à chaque enfant. En moins de 6 mois : 60% d'écrans cassés, batteries mortes sans réseau électrique, élèves isolés derrière des jeux, et un enseignant totalement dépassé.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* The Old Extractive Approach */}
            <div className="bg-[#FFFDF7] p-8 rounded-3xl border-3 border-stone-300 space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center font-bold text-lg">
                  ✕
                </div>
                <div>
                  <h3 className="font-serif font-black text-xl text-stone-800">
                    L'Approche 1:1 "Silicon Valley"
                  </h3>
                  <span className="text-xs text-rose-600 font-bold uppercase">Coûteuse & Solitaire</span>
                </div>
              </div>

              <ul className="space-y-3 text-xs sm:text-sm text-stone-600">
                <li className="flex items-start gap-2">
                  <span className="text-rose-500 font-bold">―</span>
                  <span><strong>15 000 $ par classe :</strong> 70 tablettes, 70 chargeurs, forfaits data mensuels hors de prix.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-rose-500 font-bold">―</span>
                  <span><strong>Isolement de l'enfant :</strong> Chacun a les yeux rivés sur son écran, anéantissant l'apprentissage par les pairs.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-rose-500 font-bold">―</span>
                  <span><strong>L'enseignant marginalisé :</strong> Ne pouvant surveiller 70 écrans simultanés, le maître perd le contrôle pédagogique.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-rose-500 font-bold">―</span>
                  <span><strong>Contenus désincarnés :</strong> Applications occidentales déconnectées des réalités et cultures africaines.</span>
                </li>
              </ul>
            </div>

            {/* The LeGriot Approach */}
            <div className="bg-[#FFFDF7] p-8 rounded-3xl border-3 border-[#1A1817] dair-shadow-lg space-y-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-[#E5A823] px-4 py-1 text-[11px] font-black uppercase text-stone-950 border-b-2 border-l-2 border-[#1A1817]">
                Le Modèle LeGriot
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#156050] text-[#FFFDF7] flex items-center justify-center font-bold text-lg">
                  ✓
                </div>
                <div>
                  <h3 className="font-serif font-black text-xl text-[#1A1817]">
                    Diviser pour Réussir (Cercles de 8)
                  </h3>
                  <span className="text-xs text-[#156050] font-bold uppercase">Collectif, Économique & Souverain</span>
                </div>
              </div>

              <ul className="space-y-3 text-xs sm:text-sm text-stone-800 font-medium">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#156050] shrink-0 mt-0.5" />
                  <span><strong>1 seul smartphone par cercle :</strong> Posé au centre de la table, utilisé comme catalyseur de débat oral.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#156050] shrink-0 mt-0.5" />
                  <span><strong>4 rôles tournants responsabilisants :</strong> Le Griot (conteur), le Scribe (ardoise), l'Architecte (bâtons géométriques), l'Orateur (débat).</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#156050] shrink-0 mt-0.5" />
                  <span><strong>Rotation en 3 Ateliers :</strong> Pendant que le groupe A fait de la géométrie, le B débat des droits de Kurukan Fuga et le C cartographie le fleuve Niger.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#156050] shrink-0 mt-0.5" />
                  <span><strong>L'enseignant reste le chef d'orchestre :</strong> Tableau de bord centralisé, observation ciblée et assemblée plénière finale.</span>
                </li>
              </ul>
            </div>

          </div>

        </div>
      </section>

      {/* Philosophy: The Black-Empowered AI & Cultural Sovereignty */}
      <section className="py-16 sm:py-24 border-b-3 border-[#1A1817] bg-[#FFFDF7]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            <div className="lg:col-span-7 space-y-5">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FEF7D9] border-2 border-[#1A1817] text-xs font-black uppercase text-[#78350F]">
                <span>Epistémologie & Souveraineté · Inspiré du DAIR Institute</span>
              </div>

              <h2 className="font-serif font-black text-3xl sm:text-5xl text-[#1A1817] leading-tight">
                Une IA Enracinée dans la Tradition Orale Africaine.
              </h2>

              <p className="text-stone-700 text-sm sm:text-base leading-relaxed">
                Le Griot n'est pas un simple narrateur : c'est l'historien, le diplomate, le juge de paix et le dépositaire de la science d'une communauté. Notre architecture d'IA ne remplace pas l'humain par un chatbot individuel aliénant. Elle s'inspire directement des travaux de <strong>Timnit Gebru</strong> et du <strong>DAIR Institute</strong> :
              </p>

              <div className="space-y-3 pt-2">
                <div className="p-4 rounded-2xl bg-[#FAF6EC] border-2 border-[#1A1817] space-y-1">
                  <h4 className="font-serif font-black text-sm text-[#1A1817]">
                    1. Revalorisation des Sciences & Mathématiques Africaines
                  </h4>
                  <p className="text-xs text-stone-600 leading-relaxed">
                    Les élèves apprennent la géométrie à travers les arches d'inertie thermique de Djenné, les périmètres des murailles de la Reine Amina et les réseaux hexagonaux de Wangari Maathai, plutôt que de simples exemples désincarnés.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-[#FAF6EC] border-2 border-[#1A1817] space-y-1">
                  <h4 className="font-serif font-black text-sm text-[#1A1817]">
                    2. IA Communautaire Anti-Extractive
                  </h4>
                  <p className="text-xs text-stone-600 leading-relaxed">
                    Aucune collecte prédatrice de données d'enfants. L'IA fonctionne comme un sage au milieu du cercle (« Chuchoter au Griot »), incitant les enfants à poser des questions et à manipuler le réel plutôt qu'à consommer passivement un résultat.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-[#FAF6EC] border-2 border-[#1A1817] space-y-1">
                  <h4 className="font-serif font-black text-sm text-[#1A1817]">
                    3. Le Consensus des 8 Mains plutôt que l'Algorithme Solitaire
                  </h4>
                  <p className="text-xs text-stone-600 leading-relaxed">
                    Pour valider une réponse sur le téléphone, au moins 5 des 8 enfants doivent appuyer sur leur bouton. La technologie force la délibération et le consensus démocratique (Sanankuya).
                  </p>
                </div>
              </div>
            </div>

            <div className="lg:col-span-5 bg-[#2B211E] text-[#FFFDF7] p-8 rounded-3xl border-3 border-[#1A1817] dair-shadow-lg space-y-6">
              <div className="text-xs font-mono uppercase text-[#F5BA1E] tracking-widest">
                Manifeste Pédagogique
              </div>

              <blockquote className="font-serif italic text-lg sm:text-xl text-[#FEF7D9] leading-relaxed">
                "Quand un vieillard meurt en Afrique, c'est une bibliothèque qui brûle. Avec LeGriot, chaque classe de 70 enfants devient un atelier d'artisans où la bibliothèque renaît chaque jour."
              </blockquote>

              <div className="pt-4 border-t border-stone-700 text-xs text-stone-400 flex items-center justify-between">
                <span>Inspiré d'Amadou Hampâté Bâ</span>
                <span className="text-[#F5BA1E] font-bold">LeGriot Protocol</span>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* Hardware Section: The LeGriot Physical Ecosystem (Inspired by Msingi) */}
      <section id="hardware" className="py-16 sm:py-24 border-b-3 border-[#1A1817] bg-[#FAF6EC]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          <div className="max-w-3xl space-y-3">
            <span className="text-xs font-black uppercase tracking-wider text-[#C34B26]">
              Intégration Matérielle & Basse Technologie
            </span>
            <h2 className="font-serif font-black text-3xl sm:text-5xl text-[#1A1817] leading-tight">
              Le "Kit Classe Baobab" : 100% Hors-Ligne & Solaire.
            </h2>
            <p className="text-stone-700 text-base leading-relaxed">
              Dans les zones rurales sans électricité stable ni 4G, le logiciel seul ne suffit pas. Comme sur <strong>msingi.dumeril.net</strong>, LeGriot est livré avec un kit matériel robuste, réparable localement et conçu pour survivre à la poussière et aux pannes.
            </p>
          </div>

          {/* Hardware Spec Visual Showcase */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left selector */}
            <div className="lg:col-span-4 space-y-2">
              {[
                { id: 'hub', label: '1. Le Micro-Serveur Solaire Baobab', desc: 'Mini-box locale autonome sans internet' },
                { id: 'acoustic', label: '2. Pavillons Acoustiques en Bois', desc: '+14dB d’amplification sans fil ni pile' },
                { id: 'slates', label: '3. Ardoises & Trousse de 8 Bâtons', desc: 'Matériel tactile réutilisable à vie' },
                { id: 'nfc', label: '4. Médaillons de Rôles en Laiton', desc: 'Passation physique des responsabilités' },
              ].map(item => (
                <button
                  key={item.id}
                  onClick={() => setActiveHardwareSpec(item.id as any)}
                  className={`w-full text-left p-4 rounded-2xl border-2 transition-all cursor-pointer ${
                    activeHardwareSpec === item.id
                      ? 'bg-[#E5A823] text-stone-950 border-[#1A1817] dair-shadow-sm font-black'
                      : 'bg-[#FFFDF7] text-stone-700 border-stone-300 hover:border-[#1A1817]'
                  }`}
                >
                  <div className="text-sm font-black">{item.label}</div>
                  <div className="text-xs opacity-80 mt-0.5">{item.desc}</div>
                </button>
              ))}
            </div>

            {/* Right Display Card */}
            <div className="lg:col-span-8 bg-[#FFFDF7] rounded-3xl border-3 border-[#1A1817] p-6 sm:p-8 dair-shadow-lg">
              {activeHardwareSpec === 'hub' && (
                <div className="space-y-6 animate-fade-in">
                  <div className="flex items-center justify-between border-b-2 border-stone-200 pb-4">
                    <div>
                      <span className="text-[10px] font-mono text-[#C34B26] font-bold uppercase">Hardware Spec #01</span>
                      <h3 className="font-serif font-black text-2xl text-[#1A1817]">Le Micro-Serveur Solaire Baobab</h3>
                    </div>
                    <span className="text-2xl">☀️</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div className="p-3 bg-[#FAF6EC] rounded-xl border border-stone-300">
                      <strong>Processeur :</strong> Rockchip NPU / Cortex A76 optimisé pour inférence IA locale.
                    </div>
                    <div className="p-3 bg-[#FAF6EC] rounded-xl border border-stone-300">
                      <strong>Connectivité :</strong> Réseau Wi-Fi local maillé (Local Mesh). Zéro forfait 4G requis.
                    </div>
                    <div className="p-3 bg-[#FAF6EC] rounded-xl border border-stone-300">
                      <strong>Batterie & Solaire :</strong> Accumulateur LiFePO4 (2000 cycles) + Panneau pliable 20W.
                    </div>
                    <div className="p-3 bg-[#FAF6EC] rounded-xl border border-stone-300">
                      <strong>Robustesse :</strong> Boîtier bois étanche à la latérite et ventilé passivement.
                    </div>
                  </div>

                  <p className="text-xs text-stone-700 leading-relaxed font-medium">
                    Le serveur héberge tous les contes, les parcours d'ateliers et le modèle d'inférence Gemini Distillé. Dès que les 8 smartphones des groupes se connectent au Wi-Fi local "LeGriot-Salle-1", tout fonctionne instantanément, même au fond du village sans aucun signal satellite.
                  </p>
                </div>
              )}

              {activeHardwareSpec === 'acoustic' && (
                <div className="space-y-6 animate-fade-in">
                  <div className="flex items-center justify-between border-b-2 border-stone-200 pb-4">
                    <div>
                      <span className="text-[10px] font-mono text-[#C34B26] font-bold uppercase">Hardware Spec #02</span>
                      <h3 className="font-serif font-black text-2xl text-[#1A1817]">Pavillons Acoustiques en Bois d'Acacia</h3>
                    </div>
                    <span className="text-2xl">🪵</span>
                  </div>

                  <p className="text-xs text-stone-700 leading-relaxed font-medium">
                    Dans une classe bruyante de 60 enfants, les haut-parleurs de smartphone saturent. Plutôt que d'acheter des enceintes Bluetooth fragiles qui tombent en panne de batterie, nous fournissons <strong>8 supports sculptés en bois local</strong> selon les lois de la résonance acoustique.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    <div className="p-3 bg-[#FAF6EC] rounded-xl border border-stone-300 text-center">
                      <div className="font-serif font-black text-lg text-[#156050]">+14 dB</div>
                      <div className="text-[11px] text-stone-600">Gain acoustique passif</div>
                    </div>
                    <div className="p-3 bg-[#FAF6EC] rounded-xl border border-stone-300 text-center">
                      <div className="font-serif font-black text-lg text-[#156050]">0 Watt</div>
                      <div className="text-[11px] text-stone-600">Consommation électrique</div>
                    </div>
                    <div className="p-3 bg-[#FAF6EC] rounded-xl border border-stone-300 text-center">
                      <div className="font-serif font-black text-lg text-[#156050]">Indestructible</div>
                      <div className="text-[11px] text-stone-600">Artisanat menuisier local</div>
                    </div>
                  </div>
                </div>
              )}

              {activeHardwareSpec === 'slates' && (
                <div className="space-y-6 animate-fade-in">
                  <div className="flex items-center justify-between border-b-2 border-stone-200 pb-4">
                    <div>
                      <span className="text-[10px] font-mono text-[#C34B26] font-bold uppercase">Hardware Spec #03</span>
                      <h3 className="font-serif font-black text-2xl text-[#1A1817]">Ardoises Recto-Verso & Bâtons Métriques</h3>
                    </div>
                    <span className="text-2xl">📐</span>
                  </div>

                  <p className="text-xs text-stone-700 leading-relaxed font-medium">
                    Chaque cercle reçoit son jeu de matériel tactile : une ardoise double-face (côté craie libre pour le Scribe / côté quadrillage métrique pour l'Architecte), 8 bâtons de bois calibrés pour former des polygones et un cordon de mesure à nœuds pour les angles droits (triangle 3-4-5 égyptien/sahélien).
                  </p>
                </div>
              )}

              {activeHardwareSpec === 'nfc' && (
                <div className="space-y-6 animate-fade-in">
                  <div className="flex items-center justify-between border-b-2 border-stone-200 pb-4">
                    <div>
                      <span className="text-[10px] font-mono text-[#C34B26] font-bold uppercase">Hardware Spec #04</span>
                      <h3 className="font-serif font-black text-2xl text-[#1A1817]">4 Médaillons de Rôles en Laiton / Bois</h3>
                    </div>
                    <span className="text-2xl">🏅</span>
                  </div>

                  <p className="text-xs text-stone-700 leading-relaxed font-medium">
                    Pour matérialiser la charge de chaque élève, chaque groupe possède 4 médaillons physiques (Griot, Scribe, Architecte, Orateur). À chaque sonnerie de rotation, les enfants se passent solennellement les médaillons, valorisant le sens des responsabilités et le service au collectif.
                  </p>
                </div>
              )}
            </div>

          </div>

        </div>
      </section>

      {/* Economics & Unit Cost Comparison (Inspired by Msingi.dumeril.net) */}
      <section id="economics" className="py-16 sm:py-24 border-b-3 border-[#1A1817] bg-[#FFFDF7]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          <div className="max-w-3xl space-y-3">
            <span className="text-xs font-black uppercase tracking-wider text-[#C34B26]">
              Rentabilité & Économie d'Échelle
            </span>
            <h2 className="font-serif font-black text-3xl sm:text-5xl text-[#1A1817] leading-tight">
              Combien coûte l'éducation efficace par élève ?
            </h2>
            <p className="text-stone-700 text-base leading-relaxed">
              Tout comme Msingi calcule le coût marginal par correction, LeGriot a été conçu pour casser le coût d'équipement par enfant. En partageant 1 smartphone pour 8, une classe entière s'équipe pour le prix d'un demi-ordinateur portable.
            </p>
          </div>

          {/* Interactive Calculator */}
          <div className="bg-[#FAF6EC] rounded-3xl border-3 border-[#1A1817] p-6 sm:p-10 dair-shadow-lg grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            <div className="lg:col-span-6 space-y-6">
              <h3 className="font-serif font-black text-2xl text-[#1A1817]">
                Simulateur d'Équipement pour votre Établissement
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-black text-stone-700 mb-1">
                    Nombre total d'élèves dans l'école : <span className="text-[#C34B26] font-mono text-base">{calcStudents}</span>
                  </label>
                  <input
                    type="range"
                    min="80"
                    max="1200"
                    step="20"
                    value={calcStudents}
                    onChange={(e) => setCalcStudents(Number(e.target.value))}
                    className="w-full accent-[#C34B26]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black text-stone-700 mb-1">
                    Nombre de classes nombreuses (40–70 élèves) : <span className="text-[#156050] font-mono text-base">{calcClasses}</span>
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="20"
                    step="1"
                    value={calcClasses}
                    onChange={(e) => setCalcClasses(Number(e.target.value))}
                    className="w-full accent-[#156050]"
                  />
                </div>
              </div>

              <div className="text-xs text-stone-600 bg-[#FFFDF7] p-4 rounded-2xl border border-stone-300">
                💡 <em>Hypothèse réaliste :</em> Utilisation des smartphones existants d'enseignants ou reconditionnés à 35$ + Kit matériel Baobab complet.
              </div>
            </div>

            {/* Results Grid */}
            <div className="lg:col-span-6 bg-[#FFFDF7] p-6 rounded-2xl border-2 border-[#1A1817] dair-shadow space-y-4">
              <div className="text-xs uppercase font-mono text-stone-500 font-bold">
                Comparatif Financier Immédiat
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-stone-100 rounded-xl border border-stone-200">
                  <div className="text-[11px] text-stone-500 font-bold uppercase">Projet 1:1 Tablette</div>
                  <div className="font-serif font-black text-xl text-rose-700 mt-1">
                    {calcResults.traditionalOneToOneCost.toLocaleString()} $
                  </div>
                  <div className="text-[10px] text-stone-500 mt-0.5">220$ / enfant</div>
                </div>

                <div className="p-3 bg-[#FEF7D9] rounded-xl border-2 border-[#1A1817]">
                  <div className="text-[11px] text-[#78350F] font-bold uppercase">Solution LeGriot</div>
                  <div className="font-serif font-black text-xl text-[#156050] mt-1">
                    {calcResults.leGriotKitCost.toLocaleString()} $
                  </div>
                  <div className="text-[10px] text-[#78350F] mt-0.5 font-bold">115$ par classe</div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[#E3F2EE] border-2 border-[#156050] text-[#156050] text-center">
                <div className="text-xs font-black uppercase">Économie budgétaire nette :</div>
                <div className="font-serif font-black text-2xl sm:text-3xl mt-0.5">
                  {calcResults.savings.toLocaleString()} $ économisés
                </div>
                <div className="text-xs font-bold mt-1">
                  Soit seulement <strong className="underline font-black">{calcResults.costPerLearnerPerYear} $ par élève</strong> pour toute l'année scolaire !
                </div>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* Trial Demo Section: Live Interactive Playground */}
      <section id="live-demo" className="py-16 sm:py-24 border-b-3 border-[#1A1817] bg-[#FAF6EC]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          
          <div className="max-w-3xl space-y-3">
            <span className="text-xs font-black uppercase tracking-wider text-[#C34B26]">
              Démonstration Interactive
            </span>
            <h2 className="font-serif font-black text-3xl sm:text-5xl text-[#1A1817] leading-tight">
              Testez l'Application en Conditions Réelles.
            </h2>
            <p className="text-stone-700 text-base leading-relaxed">
              Basculez librement entre les deux écrans pour comprendre la symbiose : la vue du <strong>groupe d'enfants</strong> autour du téléphone partagé (design DAIR) et la vue de <strong>l'enseignant</strong> qui supervise les 7 cercles.
            </p>
          </div>

          {/* Interactive Switcher Header */}
          <div className="flex flex-wrap items-center justify-between gap-4 bg-[#FFFDF7] p-3 rounded-2xl border-3 border-[#1A1817] dair-shadow">
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => setDemoTab('student')}
                className={`px-4 py-2.5 rounded-xl font-black text-xs transition-all flex items-center gap-2 cursor-pointer ${
                  demoTab === 'student'
                    ? 'bg-[#E5A823] text-stone-950 border-2 border-[#1A1817] dair-shadow-sm'
                    : 'text-stone-700 hover:text-stone-950'
                }`}
              >
                <Smartphone className="w-4 h-4 text-[#C34B26]" />
                <span>1. Version Groupe d'Élèves (Design DAIR)</span>
              </button>

              <button
                onClick={() => setDemoTab('teacher')}
                className={`px-4 py-2.5 rounded-xl font-black text-xs transition-all flex items-center gap-2 cursor-pointer ${
                  demoTab === 'teacher'
                    ? 'bg-[#156050] text-[#FFFDF7] border-2 border-[#1A1817] dair-shadow-sm'
                    : 'text-stone-700 hover:text-stone-950'
                }`}
              >
                <Users className="w-4 h-4 text-[#F5BA1E]" />
                <span>2. Tableau de Bord Enseignant</span>
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setViewMode(demoTab === 'student' ? 'group' : 'teacher')}
                className="px-4 py-2 bg-[#1A1817] hover:bg-stone-800 text-[#F5BA1E] rounded-xl text-xs font-black border-2 border-[#1A1817] dair-shadow-sm flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <span>Ouvrir en Plein Écran</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

          </div>

          {/* Demo Frame Preview */}
          <div className="bg-[#FFFDF7] rounded-3xl border-3 border-[#1A1817] dair-shadow-lg overflow-hidden p-2 sm:p-6 min-h-[600px]">
            {demoTab === 'student' ? (
              <div className="space-y-4">
                <div className="bg-[#FEF7D9] border-2 border-[#1A1817] p-3 rounded-2xl text-xs text-[#78350F] font-bold flex items-center justify-between">
                  <span>📱 Interface partagée par les 8 élèves : testez la craie sur l'ardoise, les votes et les indices du Griot !</span>
                  <span className="font-mono text-[11px] bg-[#1A1817] text-white px-2 py-0.5 rounded">Mode Interactif</span>
                </div>
                <StudentGroupExperience />
              </div>
            ) : (
              <div className="space-y-4">
                <div className="bg-[#E3F2EE] border-2 border-[#156050] p-3 rounded-2xl text-xs text-[#156050] font-bold flex items-center justify-between">
                  <span>👩‍🏫 Vue enseignant : observez les 7 groupes en temps réel, activez la sonnerie djembé ou lancez le générateur IA !</span>
                  <span className="font-mono text-[11px] bg-[#156050] text-white px-2 py-0.5 rounded">Console Maître</span>
                </div>
                <TeacherDashboard />
              </div>
            )}
          </div>

        </div>
      </section>

      {/* Pilot School Request / Order Classroom Kit Form */}
      <section className="py-16 sm:py-24 bg-[#1A1817] text-[#FAF6EC] border-b-3 border-[#1A1817]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 text-center">
          
          <div className="space-y-3">
            <span className="text-xs font-mono uppercase tracking-widest text-[#E5A823]">
              Rejoindre le Programme Pilote
            </span>
            <h2 className="font-serif font-black text-3xl sm:text-5xl text-white">
              Équipez votre établissement avec LeGriot.
            </h2>
            <p className="text-stone-300 text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
              Nous sélectionnons 25 écoles pionnières (Sénégal, Côte d'Ivoire, Mali, Kenya, Rwanda, RDC, Bénin) pour recevoir gratuitement un Kit Baobab Solaire et notre formation pédagogique.
            </p>
          </div>

          {!pilotSubmitted ? (
            <form onSubmit={handlePilotSubmit} className="max-w-lg mx-auto bg-[#2B211E] p-6 sm:p-8 rounded-3xl border-2 border-stone-700 text-left space-y-4 dair-shadow">
              
              <div className="space-y-1">
                <label className="block text-xs font-bold text-stone-200">
                  Nom de l'école / Institution :
                </label>
                <input
                  type="text"
                  required
                  value={pilotSchoolName}
                  onChange={(e) => setPilotSchoolName(e.target.value)}
                  placeholder="ex: Collège Nelson Mandela, Dakar"
                  className="w-full text-xs p-3 rounded-xl border border-stone-600 bg-stone-900 text-white focus:outline-none focus:border-[#E5A823]"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-stone-200">
                  Ville & Pays :
                </label>
                <input
                  type="text"
                  required
                  value={pilotLocation}
                  onChange={(e) => setPilotLocation(e.target.value)}
                  placeholder="ex: Abidjan, Côte d'Ivoire"
                  className="w-full text-xs p-3 rounded-xl border border-stone-600 bg-stone-900 text-white focus:outline-none focus:border-[#E5A823]"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-stone-200">
                  Adresse e-mail du responsable / enseignant :
                </label>
                <input
                  type="email"
                  required
                  value={pilotEmail}
                  onChange={(e) => setPilotEmail(e.target.value)}
                  placeholder="direction@ecole.org"
                  className="w-full text-xs p-3 rounded-xl border border-stone-600 bg-stone-900 text-white focus:outline-none focus:border-[#E5A823]"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 px-6 rounded-xl bg-[#E5A823] hover:bg-[#F5BA1E] text-stone-950 font-black text-xs uppercase tracking-wider border-2 border-[#1A1817] transition-all cursor-pointer shadow-md"
              >
                Demander un Kit Pilote & Documentation
              </button>
            </form>
          ) : (
            <div className="bg-[#156050] text-[#FFFDF7] p-8 rounded-3xl border-2 border-emerald-400 max-w-lg mx-auto space-y-3 animate-fade-in">
              <div className="w-12 h-12 rounded-full bg-white/20 mx-auto flex items-center justify-center text-2xl font-black">
                ✓
              </div>
              <h3 className="font-serif font-black text-xl">Dossier Pilote Enregistré !</h3>
              <p className="text-xs text-emerald-100 leading-relaxed">
                Merci pour votre engagement pour <strong>{pilotSchoolName}</strong> ({pilotLocation}). Notre équipe pédagogique vous contactera à <strong>{pilotEmail}</strong> sous 48 heures avec les fiches d'ateliers et la spécification matérielle.
              </p>
            </div>
          )}

        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 bg-[#FAF6EC] border-t-3 border-[#1A1817] text-xs text-stone-600">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-serif font-black text-lg text-stone-900">LeGriot</span>
            <span className="text-stone-400">|</span>
            <span>Éducation Souveraine & Partagée pour l'Afrique</span>
          </div>

          <div className="flex items-center gap-4 text-xs font-bold text-stone-700">
            <button onClick={() => setViewMode('teacher')} className="hover:text-[#C34B26] underline">
              Tableau de Bord
            </button>
            <button onClick={() => setViewMode('group')} className="hover:text-[#C34B26] underline">
              Interface Élèves
            </button>
            <button onClick={() => setViewMode('print')} className="hover:text-[#C34B26] underline">
              Ardoises Imprimables
            </button>
          </div>
        </div>
      </footer>

    </div>
  );
};
