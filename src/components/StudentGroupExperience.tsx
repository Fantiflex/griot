import React, { useState, useEffect, useRef } from 'react';
import { useClassroom } from '../context/ClassroomContext';
import { WORKSHOP_ROLES } from '../data/defaultJourneys';
import { RoleType } from '../types/griot';
import { InteractiveSlate } from './InteractiveSlate';
import {
  Volume2,
  VolumeX,
  Play,
  Pause,
  Ruler,
  PenTool,
  MapPin,
  CheckCircle2,
  HelpCircle,
  AlertCircle,
  Sparkles,
  Users,
  Send,
  Loader2,
  ChevronDown,
  RotateCw,
  Award,
  ChevronRight,
  Maximize2,
  Minimize2,
  Compass,
  Smile,
  ShieldAlert,
  Flame,
} from 'lucide-react';
import { playCelebration, playDjembeBass, playDjembeSlap, playPcmAudio, speakWithWebSpeech } from '../utils/audio';

export const StudentGroupExperience: React.FC = () => {
  const {
    session,
    activeJourney,
    activeGroupId,
    setActiveGroupId,
    setGroupAnswer,
    setGroupHelpNeeded,
    updateStudentRole,
    getWorkshopForGroup,
    setViewMode,
  } = useClassroom();

  const currentGroup = session.groups.find(g => g.id === activeGroupId) || session.groups[0];
  const currentWorkshopIdx = getWorkshopForGroup(currentGroup?.index ?? 0, session.currentRotation);
  const currentWorkshop = activeJourney.workshops[currentWorkshopIdx] || activeJourney.workshops[0];

  const currentAnswer = currentGroup?.answers[currentWorkshop.id];
  const [selectedOption, setSelectedOption] = useState<number | undefined>(currentAnswer?.selectedOption);
  const [slateNote, setSlateNote] = useState<string>(currentAnswer?.slateNote || '');
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState<boolean>(!!currentAnswer?.completed);
  const [unlockedHintsCount, setUnlockedHintsCount] = useState<number>(currentAnswer?.hintCountUsed || 0);

  // 8-Student Participatory Voting State
  const [votedStudents, setVotedStudents] = useState<boolean[]>(() => [false, false, false, false, false, false, false, false]);

  // Audio Narration State
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [isLoadingAudio, setIsLoadingAudio] = useState(false);
  const stopWebSpeechRef = useRef<(() => void) | null>(null);

  // Ask Griot Interactive State
  const [griotQuestion, setGriotQuestion] = useState('');
  const [griotResponse, setGriotResponse] = useState<string | null>(null);
  const [isAskingGriot, setIsAskingGriot] = useState(false);

  // Active Role Superpower Card
  const [activeRoleTab, setActiveRoleTab] = useState<RoleType>('griot');
  const [isEditingRoleName, setIsEditingRoleName] = useState<boolean>(false);
  const [editedName, setEditedName] = useState<string>('');

  // Screen display mode: "phone-mockup" or "fullscreen"
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Sync state on group or workshop change
  useEffect(() => {
    const ans = currentGroup?.answers[currentWorkshop.id];
    setSelectedOption(ans?.selectedOption);
    setSlateNote(ans?.slateNote || '');
    setIsAnswerSubmitted(!!ans?.completed);
    setUnlockedHintsCount(ans?.hintCountUsed || 0);
    setGriotResponse(null);
    setGriotQuestion('');
    setVotedStudents([false, false, false, false, false, false, false, false]);
  }, [activeGroupId, currentWorkshop.id, currentGroup]);

  // Audio player
  const handleToggleAudio = async () => {
    if (isPlayingAudio) {
      if (stopWebSpeechRef.current) {
        stopWebSpeechRef.current();
        stopWebSpeechRef.current = null;
      }
      setIsPlayingAudio(false);
      return;
    }

    setIsLoadingAudio(true);
    const narrationText = `${activeJourney.title}. ${activeJourney.griotPrologue}`;

    try {
      const res = await fetch('/api/griot-narrate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: narrationText, voice: 'Puck' }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.audioBase64) {
          setIsLoadingAudio(false);
          setIsPlayingAudio(true);
          await playPcmAudio(data.audioBase64);
          setIsPlayingAudio(false);
          return;
        }
      }
    } catch (err) {
      console.warn('Fallback to browser speech synthesis:', err);
    }

    setIsLoadingAudio(false);
    setIsPlayingAudio(true);
    stopWebSpeechRef.current = speakWithWebSpeech(narrationText, () => {
      setIsPlayingAudio(false);
    });
  };

  const handleSelectOption = (idx: number) => {
    if (isAnswerSubmitted) return;
    playDjembeSlap();
    setSelectedOption(idx);
  };

  const toggleStudentVote = (index: number) => {
    playDjembeSlap();
    setVotedStudents(prev => {
      const updated = [...prev];
      updated[index] = !updated[index];
      return updated;
    });
  };

  const agreedCount = votedStudents.filter(Boolean).length;
  const hasConsensus = agreedCount >= 5;

  const handleSubmitConsensus = () => {
    if (selectedOption === undefined) return;
    playCelebration();
    setIsAnswerSubmitted(true);
    setGroupAnswer(currentGroup.id, currentWorkshop.id, {
      selectedOption,
      slateNote,
      completed: true,
      hintCountUsed: unlockedHintsCount,
    });
  };

  const handleUnlockNextHint = () => {
    playDjembeSlap();
    const nextCount = Math.min(currentWorkshop.hints.length, unlockedHintsCount + 1);
    setUnlockedHintsCount(nextCount);
    setGroupAnswer(currentGroup.id, currentWorkshop.id, {
      hintCountUsed: nextCount,
    });
  };

  const handleAskGriot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!griotQuestion.trim() || isAskingGriot) return;

    setIsAskingGriot(true);
    try {
      const res = await fetch('/api/ask-griot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: griotQuestion,
          workshopTitle: currentWorkshop.title,
          storyTitle: activeJourney.title,
          currentStep: 'Group Circle Investigation',
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setGriotResponse(data.answer);
      } else {
        setGriotResponse('Écoutez le bruissement des feuilles du baobab: observez ensemble vos bâtons sur l’ardoise !');
      }
    } catch (err) {
      setGriotResponse('La sagesse du cercle dit: aucun esprit n’est plus fort que huit esprits réunis.');
    } finally {
      setIsAskingGriot(false);
    }
  };

  const handleCallTeacher = () => {
    playDjembeBass();
    setGroupHelpNeeded(currentGroup.id, !currentGroup.needsHelp, 'Question at Station');
  };

  const roleMeta = {
    griot: {
      title: 'Le Griot de Table',
      badge: '🎙️ Conteur & Rythme',
      color: 'bg-[#F5BA1E] text-stone-950 border-[#1A1817]',
      accentBg: 'bg-[#FEF7D9]',
      desc: 'Tu tiens le smartphone, lis à haute voix et fais battre le tambour du cercle.',
    },
    scribe: {
      title: 'Le Scribe du Conseil',
      badge: '✍️ Gardien de l’Ardoise',
      color: 'bg-[#156050] text-[#FFFDF7] border-[#1A1817]',
      accentBg: 'bg-[#E3F2EE]',
      desc: 'Tu écris les calculs et la décision sur l’ardoise quand tout le monde est d’accord.',
    },
    architect: {
      title: 'L’Architecte-Géomètre',
      badge: '📐 Maître des Bâtons',
      color: 'bg-[#C34B26] text-[#FFFDF7] border-[#1A1817]',
      accentBg: 'bg-[#FBE8E2]',
      desc: 'Tu manipules les 8 bâtons de bois, les ficelles et mesures les angles sur la table.',
    },
    orator: {
      title: 'L’Orateur du Cercle',
      badge: '📢 Voix du Grand Conseil',
      color: 'bg-[#2B211E] text-[#F5BA1E] border-[#1A1817]',
      accentBg: 'bg-[#EAE4DC]',
      desc: 'Tu prépares le discours d’1 minute pour parler devant toute la classe au Grand Conseil.',
    },
  };

  return (
    <div className={`min-h-screen bg-[#FFFDF7] text-stone-900 transition-all ${
      isFullscreen ? 'p-2 sm:p-6' : 'py-6 px-3'
    }`}>
      
      {/* Top Experience Switcher & Group Selector */}
      <div className="max-w-2xl mx-auto mb-4 flex items-center justify-between gap-2 px-2">
        <div className="flex items-center gap-2">
          {/* Circle Selector Pill */}
          <div className="relative">
            <select
              value={activeGroupId}
              onChange={(e) => setActiveGroupId(e.target.value)}
              aria-label="Sélectionner le groupe d'élèves"
              className="bg-[#1A1817] text-[#F5BA1E] text-xs font-black px-3 py-2 rounded-2xl border-2 border-[#1A1817] dair-shadow-sm cursor-pointer focus:outline-none tracking-wide"
            >
              {session.groups.map(g => (
                <option key={g.id} value={g.id}>
                  {g.animalTotem} {g.name} ({g.studentCount} élèves)
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Action Buttons: Fullscreen & Call Teacher */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsFullscreen(!isFullscreen)}
            title={isFullscreen ? 'Vue Smartphone' : 'Plein Écran'}
            className="p-2 bg-stone-100 hover:bg-stone-200 border-2 border-[#1A1817] rounded-xl text-stone-900 dair-shadow-sm transition-all"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>

          <button
            type="button"
            onClick={handleCallTeacher}
            className={`px-3 py-1.5 rounded-xl border-2 border-[#1A1817] text-xs font-black flex items-center gap-1.5 transition-all ${
              currentGroup.needsHelp
                ? 'bg-rose-500 text-white animate-bounce-slow dair-shadow'
                : 'bg-[#FBE8E2] text-[#C34B26] hover:bg-[#F8D2C6] dair-shadow-sm'
            }`}
          >
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span className="hidden sm:inline">{currentGroup.needsHelp ? 'Maître appelé !' : 'Appeler le Maître'}</span>
            <span className="sm:hidden">{currentGroup.needsHelp ? 'Appelé !' : 'Maître'}</span>
          </button>
        </div>
      </div>

      {/* Main Student Experience Card (DAIR-inspired design) */}
      <div className={`mx-auto bg-[#FFFDF7] rounded-3xl border-3 border-[#1A1817] dair-shadow-lg overflow-hidden flex flex-col ${
        isFullscreen ? 'max-w-4xl' : 'max-w-md'
      }`}>
        
        {/* DAIR-Style Hero Banner: Geometric Patterns & Group Totem */}
        <div className="bg-[#E5A823] border-b-3 border-[#1A1817] p-5 relative overflow-hidden">
          {/* Subtle Geometric Background Pattern */}
          <div className="absolute inset-0 opacity-15 dair-pattern-stripes pointer-events-none" />

          <div className="relative z-10 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-2xl bg-[#FFFDF7] border-3 border-[#1A1817] dair-shadow-sm flex items-center justify-center text-3xl shrink-0">
                {currentGroup.animalTotem}
              </div>
              <div>
                <div className="text-[11px] font-black uppercase tracking-wider text-[#78350F] flex items-center gap-1">
                  <span>Cercle des 8 Élèves</span>
                  <span>·</span>
                  <span>Station {currentWorkshopIdx + 1}</span>
                </div>
                <h1 className="font-serif font-black text-xl sm:text-2xl text-[#1A1817] leading-tight">
                  {currentGroup.name}
                </h1>
                <p className="text-xs text-stone-900 font-semibold mt-0.5">
                  1 smartphone · 8 esprits curieux · 3 ateliers
                </p>
              </div>
            </div>

            {/* Quick mini sound drum triggers */}
            <div className="flex flex-col gap-1 shrink-0">
              <button
                type="button"
                onClick={() => playDjembeBass()}
                title="Battre le tambour basse"
                className="px-2 py-1 bg-[#1A1817] hover:bg-stone-800 text-[#F5BA1E] rounded-lg text-[10px] font-black border border-[#1A1817] dair-shadow-sm active:translate-y-0.5"
              >
                🥁 Bass
              </button>
              <button
                type="button"
                onClick={() => playDjembeSlap()}
                title="Clac de djembé"
                className="px-2 py-1 bg-[#FFFDF7] hover:bg-stone-100 text-[#1A1817] rounded-lg text-[10px] font-black border border-[#1A1817] dair-shadow-sm active:translate-y-0.5"
              >
                ⚡ Slap
              </button>
            </div>
          </div>

          {/* Quick Active Workshop Title Banner */}
          <div className="mt-4 pt-3 border-t-2 border-[#1A1817]/20 flex items-center justify-between text-xs">
            <span className="font-black text-[#1A1817] flex items-center gap-1.5">
              <Compass className="w-4 h-4" />
              <span>Atelier: {currentWorkshop.subject}</span>
            </span>
            <span className="bg-[#1A1817] text-[#FFFDF7] px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase">
              Rotation {session.currentRotation} / 3
            </span>
          </div>
        </div>

        {/* Section 1: The 4 Cooperative Roles - Interactive Switcher */}
        <section className="bg-[#FAF6EC] border-b-3 border-[#1A1817] p-4 sm:p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#C34B26]" />
              <h2 className="font-serif font-black text-sm uppercase tracking-wide text-[#1A1817]">
                Qui a quel rôle dans le cercle ?
              </h2>
            </div>
            <span className="text-[11px] text-stone-600 font-bold">Touche pour voir ton pouvoir</span>
          </div>

          {/* 4 Large Tactile Role Tabs */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {WORKSHOP_ROLES.map(role => {
              const meta = roleMeta[role.id];
              const isSelected = activeRoleTab === role.id;
              const assignedName = (currentGroup.assignedStudentNames as any)[role.id] || 'Élève';

              return (
                <button
                  key={role.id}
                  type="button"
                  onClick={() => {
                    playDjembeSlap();
                    setActiveRoleTab(role.id);
                  }}
                  className={`p-2.5 rounded-2xl border-2 text-left transition-all relative ${
                    isSelected
                      ? `${meta.color} dair-shadow-sm -translate-y-0.5`
                      : 'bg-[#FFFDF7] border-stone-300 text-stone-800 hover:border-[#1A1817]'
                  }`}
                >
                  <div className="font-black text-xs truncate">
                    {meta.title.split(' ')[1] || meta.title}
                  </div>
                  <div className="text-[11px] truncate opacity-90 font-mono mt-0.5">
                    {assignedName}
                  </div>
                  {isSelected && (
                    <div className="w-2 h-2 rounded-full bg-white absolute top-2 right-2 ring-2 ring-stone-900" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Active Role Superpower Card */}
          {activeRoleTab && (
            <div className={`p-3.5 rounded-2xl border-2 border-[#1A1817] text-xs space-y-2 ${roleMeta[activeRoleTab].accentBg}`}>
              <div className="flex items-center justify-between">
                <span className="font-black text-[#1A1817] text-sm">
                  {roleMeta[activeRoleTab].title} ({roleMeta[activeRoleTab].badge})
                </span>

                <button
                  type="button"
                  onClick={() => {
                    setIsEditingRoleName(true);
                    setEditedName((currentGroup.assignedStudentNames as any)[activeRoleTab]);
                  }}
                  className="text-[11px] font-black underline text-[#1A1817] hover:text-[#C34B26]"
                >
                  Changer de prénom
                </button>
              </div>

              <p className="text-stone-800 font-medium leading-relaxed">
                👉 {roleMeta[activeRoleTab].desc}
              </p>

              {isEditingRoleName && (
                <div className="flex gap-2 pt-1">
                  <input
                    type="text"
                    value={editedName}
                    onChange={(e) => setEditedName(e.target.value)}
                    placeholder="Prénom de l'élève"
                    className="flex-1 bg-white px-2.5 py-1.5 rounded-xl border-2 border-[#1A1817] text-xs font-bold"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (editedName.trim()) {
                        updateStudentRole(currentGroup.id, activeRoleTab, editedName.trim());
                      }
                      setIsEditingRoleName(false);
                    }}
                    className="px-3 py-1.5 bg-[#1A1817] text-[#FFFDF7] rounded-xl text-xs font-black"
                  >
                    Valider
                  </button>
                </div>
              )}
            </div>
          )}
        </section>

        {/* Section 2: Listen to the Griot's Tale (Audio Player with Animated Soundwaves) */}
        <section className="p-4 sm:p-5 border-b-3 border-[#1A1817] bg-[#FFFDF7] space-y-4">
          <div className="flex items-center justify-between gap-2">
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-[#C34B26]">
                Parole Vivante du Griot
              </span>
              <h3 className="font-serif font-black text-lg text-[#1A1817]">
                {activeJourney.title}
              </h3>
            </div>

            {/* Big Tactile Audio Button */}
            <button
              type="button"
              onClick={handleToggleAudio}
              disabled={isLoadingAudio}
              className={`px-4 py-2.5 rounded-2xl border-2 border-[#1A1817] text-xs font-black flex items-center gap-2 transition-all dair-shadow ${
                isPlayingAudio
                  ? 'bg-[#156050] text-[#FFFDF7] animate-pulse-glow'
                  : 'bg-[#F5BA1E] hover:bg-[#E5A823] text-[#1A1817]'
              }`}
            >
              {isLoadingAudio ? (
                <Loader2 className="w-4 h-4 animate-spin text-stone-900" />
              ) : isPlayingAudio ? (
                <>
                  <Pause className="w-4 h-4 fill-white" />
                  <span>Pause</span>
                </>
              ) : (
                <>
                  <Volume2 className="w-4 h-4 text-stone-900" />
                  <span>Écouter le Conte</span>
                </>
              )}
            </button>
          </div>

          {/* Animated sound wave bars when playing */}
          {isPlayingAudio && (
            <div className="flex items-center justify-center gap-1.5 h-6 bg-[#FAF6EC] rounded-xl border border-stone-300 p-1">
              {[40, 75, 55, 90, 60, 100, 45, 80, 65, 95, 50, 85].map((h, i) => (
                <div
                  key={i}
                  style={{ height: `${h}%` }}
                  className="w-1.5 bg-[#156050] rounded-full animate-bounce-slow"
                />
              ))}
            </div>
          )}

          {/* Story Text Box with Griot's Stamp */}
          <div className="bg-[#FAF6EC] rounded-2xl p-4 border-2 border-[#1A1817] space-y-2 relative">
            <span className="text-3xl absolute -top-3 -left-2 select-none">🪕</span>
            <p className="text-xs sm:text-sm text-stone-800 leading-relaxed font-serif italic pl-4">
              "{activeJourney.griotPrologue}"
            </p>
            <div className="pt-2 text-[11px] font-bold text-stone-600 flex justify-between items-center border-t border-stone-200">
              <span>🎙️ Lu ou écouté par le groupe</span>
              <span className="text-[#C34B26] font-mono">{activeJourney.period}</span>
            </div>
          </div>
        </section>

        {/* Section 3: The Active Workshop Station Challenge */}
        <section className="p-4 sm:p-5 border-b-3 border-[#1A1817] bg-[#FFFDF7] space-y-5">
          
          {/* Station Badge Header */}
          <div className="flex items-center justify-between bg-[#156050] text-[#FFFDF7] p-3 rounded-2xl border-2 border-[#1A1817] dair-shadow-sm">
            <div>
              <div className="text-[10px] font-black uppercase tracking-wider text-[#F5BA1E]">
                Atelier {currentWorkshopIdx + 1} · {currentWorkshop.subject}
              </div>
              <h3 className="font-serif font-black text-base leading-tight">
                {currentWorkshop.title}
              </h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-[#FFFDF7] text-[#156050] flex items-center justify-center font-black text-lg border-2 border-[#1A1817] shrink-0">
              {currentWorkshopIdx === 0 ? '📐' : currentWorkshopIdx === 1 ? '✍️' : '🌍'}
            </div>
          </div>

          {/* Hands-On Table Mission */}
          <div className="bg-[#FEF7D9] border-2 border-[#1A1817] rounded-2xl p-4 space-y-2 dair-shadow-sm">
            <div className="flex items-center gap-2 text-xs font-black text-[#78350F]">
              <Ruler className="w-4 h-4 text-[#C34B26]" />
              <span>DÉFI MANUEL DU CERCLE (AVEC LES MAINS ET LES BÂTONS) :</span>
            </div>
            <p className="text-xs sm:text-sm text-stone-900 font-bold leading-relaxed">
              {currentWorkshop.handsOnChallenge}
            </p>
            <div className="text-[11px] text-[#78350F] font-bold">
              👉 L'Architecte ({currentGroup.assignedStudentNames.architect}) place les bâtons sur la table pour le groupe !
            </div>
          </div>

          {/* Interactive Digital Slate & Sticks Canvas */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-black text-[#1A1817]">Ardoise Numérique de Travail :</span>
              <span className="text-stone-500 font-semibold text-[11px]">Dessinez ou manipulez les 8 bâtons !</span>
            </div>
            <InteractiveSlate />
          </div>

          {/* Steps of Investigation */}
          <div className="space-y-2">
            <span className="text-xs font-black text-[#1A1817] uppercase tracking-wide">
              Les 3 étapes de recherche en groupe :
            </span>
            {currentWorkshop.interactiveSteps.map((step, idx) => (
              <div
                key={idx}
                className="bg-[#FAF6EC] p-3 rounded-2xl border-2 border-[#1A1817] text-xs text-stone-800 flex items-start gap-2.5 dair-shadow-sm"
              >
                <span className="w-6 h-6 rounded-full bg-[#F5BA1E] text-stone-950 font-black text-xs flex items-center justify-center shrink-0 border border-[#1A1817]">
                  {idx + 1}
                </span>
                <p className="font-semibold leading-relaxed pt-0.5">{step}</p>
              </div>
            ))}
          </div>

          {/* Question & Options */}
          <div className="bg-[#FFFDF7] rounded-3xl border-3 border-[#1A1817] p-5 space-y-4 dair-shadow-sm">
            <div className="border-b-2 border-stone-200 pb-2">
              <span className="text-[10px] uppercase font-black tracking-wider text-[#C34B26]">
                Énigme à Résoudre Ensemble
              </span>
              <h4 className="font-serif font-black text-base text-[#1A1817] mt-0.5 leading-snug">
                {currentWorkshop.groupQuestion}
              </h4>
            </div>

            {/* Options list */}
            <div className="space-y-2.5">
              {currentWorkshop.options?.map((option, idx) => {
                const isChosen = selectedOption === idx;
                const isCorrect = isAnswerSubmitted && idx === currentWorkshop.correctOptionIndex;
                const isWrong = isAnswerSubmitted && isChosen && idx !== currentWorkshop.correctOptionIndex;

                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelectOption(idx)}
                    disabled={isAnswerSubmitted}
                    className={`w-full text-left p-3.5 rounded-2xl border-2 text-xs transition-all flex items-start gap-3 ${
                      isCorrect
                        ? 'bg-[#E3F2EE] border-[#156050] text-[#156050] font-black dair-shadow-sm'
                        : isWrong
                        ? 'bg-[#FBE8E2] border-[#C34B26] text-[#C34B26] font-bold'
                        : isChosen
                        ? 'bg-[#FEF7D9] border-[#1A1817] text-stone-950 font-black dair-shadow'
                        : 'bg-[#FAF6EC] hover:bg-[#F4EFE6] border-stone-300 text-stone-800'
                    }`}
                  >
                    <span className={`w-6 h-6 rounded-xl font-black text-xs flex items-center justify-center shrink-0 border border-[#1A1817] ${
                      isChosen ? 'bg-[#F5BA1E] text-stone-950' : 'bg-white text-stone-700'
                    }`}>
                      {String.fromCharCode(65 + idx)}
                    </span>
                    <span className="leading-relaxed flex-1 font-medium">{option}</span>
                    {isCorrect && <CheckCircle2 className="w-5 h-5 text-[#156050] shrink-0" />}
                  </button>
                );
              })}
            </div>

            {/* Scribe's slate notes input */}
            <div className="pt-2">
              <label className="block text-xs font-black text-[#1A1817] mb-1">
                ✍️ Ce que le Scribe note sur l'ardoise en craie :
              </label>
              <textarea
                value={slateNote}
                onChange={(e) => setSlateNote(e.target.value)}
                disabled={isAnswerSubmitted}
                rows={2}
                placeholder="Écrivez le mot-clé ou le calcul découvert..."
                className="w-full text-xs p-3 rounded-2xl border-2 border-[#1A1817] bg-[#FAF6EC] focus:bg-white font-medium focus:outline-none"
              />
            </div>

            {/* Participatory 8-Student Voting Circle */}
            {!isAnswerSubmitted && (
              <div className="bg-[#FAF6EC] p-4 rounded-2xl border-2 border-[#1A1817] space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-black text-[#1A1817] block">
                      Le Vote des 8 Mains :
                    </span>
                    <span className="text-[11px] text-stone-600">
                      Chaque élève touche son bouton s'il est d'accord !
                    </span>
                  </div>
                  <span className={`text-xs font-black px-2.5 py-1 rounded-full border border-[#1A1817] ${
                    hasConsensus ? 'bg-[#156050] text-white' : 'bg-stone-200 text-stone-700'
                  }`}>
                    {agreedCount} / 8 d'accord
                  </span>
                </div>

                {/* 8 Touch buttons for 8 children */}
                <div className="grid grid-cols-4 sm:grid-cols-8 gap-1.5">
                  {votedStudents.map((voted, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => toggleStudentVote(idx)}
                      className={`py-2 rounded-xl text-xs font-black border-2 border-[#1A1817] transition-transform active:scale-95 ${
                        voted
                          ? 'bg-[#F5BA1E] text-stone-950 dair-shadow-sm'
                          : 'bg-white text-stone-400'
                      }`}
                    >
                      {voted ? '👍' : `${idx + 1}`}
                    </button>
                  ))}
                </div>

                {/* Validation button */}
                <button
                  type="button"
                  onClick={handleSubmitConsensus}
                  disabled={selectedOption === undefined || !hasConsensus}
                  className={`w-full py-3.5 px-4 rounded-2xl border-2 border-[#1A1817] text-xs font-black tracking-wide transition-all ${
                    hasConsensus && selectedOption !== undefined
                      ? 'bg-[#156050] hover:bg-[#124d40] text-[#FFFDF7] dair-shadow animate-pulse-glow'
                      : 'bg-stone-300 text-stone-500 cursor-not-allowed border-stone-400'
                  }`}
                >
                  {hasConsensus
                    ? "✨ Valider l'Accord du Cercle !"
                    : `Il faut encore ${Math.max(0, 5 - agreedCount)} votes pour valider (5/8)`}
                </button>
              </div>
            )}

            {/* Answer feedback once submitted */}
            {isAnswerSubmitted && (
              <div className="bg-[#E3F2EE] border-2 border-[#156050] rounded-2xl p-4 text-xs text-[#156050] space-y-2 dair-shadow-sm">
                <div className="flex items-center gap-2 font-black text-sm">
                  <Award className="w-5 h-5 text-[#156050]" />
                  <span>Consensus Enregistré pour la Station {currentWorkshopIdx + 1} !</span>
                </div>
                <p className="text-stone-800 leading-relaxed font-medium">
                  {currentWorkshop.explanation}
                </p>
              </div>
            )}

          </div>

        </section>

        {/* Section 4: L'Arbre aux Clues (Griot's Hints & AI Whisperer) */}
        <section className="p-4 sm:p-5 border-b-3 border-[#1A1817] bg-[#FAF6EC] space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xl">🌳</span>
              <div>
                <h4 className="font-serif font-black text-sm text-[#1A1817]">
                  L'Arbre à Clés du Griot
                </h4>
                <p className="text-[11px] text-stone-600">Un indice si votre cercle hésite</p>
              </div>
            </div>

            {unlockedHintsCount < currentWorkshop.hints.length && (
              <button
                type="button"
                onClick={handleUnlockNextHint}
                className="px-3 py-1.5 bg-[#F5BA1E] hover:bg-[#E5A823] text-stone-950 rounded-xl text-xs font-black border-2 border-[#1A1817] dair-shadow-sm transition-all"
              >
                Débloquer l'indice {unlockedHintsCount + 1}
              </button>
            )}
          </div>

          {/* Unlocked Clues */}
          {unlockedHintsCount > 0 && (
            <div className="space-y-2">
              {currentWorkshop.hints.slice(0, unlockedHintsCount).map((hint, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-2xl bg-[#FFFDF7] border-2 border-[#1A1817] text-xs text-stone-900 space-y-1 dair-shadow-sm"
                >
                  <span className="text-[10px] font-black uppercase text-[#C34B26]">
                    {idx === 2 ? '🗝️ Secret Suprême du Griot' : `Indice ${idx + 1}`}
                  </span>
                  <p className="font-medium leading-relaxed">{hint}</p>
                </div>
              ))}
            </div>
          )}

          {/* Whisper to Griot (Gemini AI Interactive Guidance) */}
          <form onSubmit={handleAskGriot} className="space-y-2 pt-1">
            <div className="flex gap-2">
              <input
                type="text"
                value={griotQuestion}
                onChange={(e) => setGriotQuestion(e.target.value)}
                placeholder="Chuchote une question au sage Griot..."
                className="flex-1 bg-white text-xs px-3.5 py-2.5 rounded-2xl border-2 border-[#1A1817] font-medium focus:outline-none"
              />
              <button
                type="submit"
                disabled={isAskingGriot || !griotQuestion.trim()}
                className="px-4 py-2.5 bg-[#1A1817] hover:bg-stone-800 text-[#F5BA1E] rounded-2xl text-xs font-black border-2 border-[#1A1817] dair-shadow-sm disabled:opacity-50 transition-all flex items-center gap-1.5"
              >
                {isAskingGriot ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                <span className="hidden sm:inline">Chuchoter</span>
              </button>
            </div>

            {griotResponse && (
              <div className="p-4 bg-[#FEF7D9] border-2 border-[#1A1817] rounded-2xl text-xs text-[#78350F] italic font-serif leading-relaxed dair-shadow-sm">
                "{griotResponse}"
              </div>
            )}
          </form>
        </section>

        {/* Section 5: Orator's Prep for the Plenary Assembly */}
        <section className="p-4 sm:p-5 bg-[#2B211E] text-[#FFFDF7] space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase text-[#F5BA1E] tracking-wider flex items-center gap-1.5">
              <span>📢 Préparation du Plénier (60 secondes)</span>
            </span>
            <span className="text-[11px] font-mono text-stone-300">
              Orateur: {currentGroup.assignedStudentNames.orator}
            </span>
          </div>
          <p className="text-xs text-stone-300 leading-relaxed">
            Au son du tambour de fin, ton Orateur se lèvera pour partager la découverte de votre cercle devant les 50 autres camarades !
          </p>
        </section>

        {/* Bottom Phone Bar */}
        <div className="bg-[#FAF6EC] border-t-3 border-[#1A1817] p-3 text-center text-xs font-black text-stone-700 flex items-center justify-between px-5">
          <span>🔄 Sur rotation: passe le téléphone au Scribe suivant</span>
          <span className="text-[#C34B26]">LeGriot · Unis par l'Histoire</span>
        </div>

      </div>

    </div>
  );
};
