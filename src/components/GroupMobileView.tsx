import React, { useState, useEffect, useRef } from 'react';
import { useClassroom } from '../context/ClassroomContext';
import { WORKSHOP_ROLES } from '../data/defaultJourneys';
import { RoleType } from '../types/griot';
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
} from 'lucide-react';
import { playCelebration, playDjembeSlap, playPcmAudio, speakWithWebSpeech } from '../utils/audio';

export const GroupMobileView: React.FC = () => {
  const {
    session,
    activeJourney,
    activeGroupId,
    setActiveGroupId,
    setGroupAnswer,
    setGroupHelpNeeded,
    updateStudentRole,
    getWorkshopForGroup,
  } = useClassroom();

  const currentGroup = session.groups.find(g => g.id === activeGroupId) || session.groups[0];
  const currentWorkshopIdx = getWorkshopForGroup(currentGroup?.index ?? 0, session.currentRotation);
  const currentWorkshop = activeJourney.workshops[currentWorkshopIdx] || activeJourney.workshops[0];

  const currentAnswer = currentGroup?.answers[currentWorkshop.id];
  const [selectedOption, setSelectedOption] = useState<number | undefined>(currentAnswer?.selectedOption);
  const [slateNote, setSlateNote] = useState<string>(currentAnswer?.slateNote || '');
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState<boolean>(!!currentAnswer?.completed);
  const [unlockedHintsCount, setUnlockedHintsCount] = useState<number>(currentAnswer?.hintCountUsed || 0);

  // Audio narration state
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [isLoadingAudio, setIsLoadingAudio] = useState(false);
  const stopWebSpeechRef = useRef<(() => void) | null>(null);

  // Ask Griot state
  const [griotQuestion, setGriotQuestion] = useState('');
  const [griotResponse, setGriotResponse] = useState<string | null>(null);
  const [isAskingGriot, setIsAskingGriot] = useState(false);

  // Role editing modal
  const [editingRole, setEditingRole] = useState<RoleType | null>(null);
  const [roleInputName, setRoleInputName] = useState('');

  // Synchronize when active group or workshop changes
  useEffect(() => {
    const ans = currentGroup?.answers[currentWorkshop.id];
    setSelectedOption(ans?.selectedOption);
    setSlateNote(ans?.slateNote || '');
    setIsAnswerSubmitted(!!ans?.completed);
    setUnlockedHintsCount(ans?.hintCountUsed || 0);
    setGriotResponse(null);
    setGriotQuestion('');
  }, [activeGroupId, currentWorkshop.id, currentGroup]);

  // Audio Narration Handler
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
      // First attempt server-side Gemini TTS
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
      console.warn('Gemini TTS failed or offline, falling back to Web Speech API:', err);
    }

    // Fallback: Web Speech API
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
          currentStep: 'Group Circle Puzzle',
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setGriotResponse(data.answer);
      } else {
        setGriotResponse('The wind whispers: Gather your 8 minds together and look at your sticks once more.');
      }
    } catch (err) {
      setGriotResponse('Wise words: Trust your team’s measurements and verify on your slate.');
    } finally {
      setIsAskingGriot(false);
    }
  };

  const handleCallTeacher = () => {
    playDjembeSlap();
    setGroupHelpNeeded(currentGroup.id, !currentGroup.needsHelp, 'Question at Station');
  };

  const getSubjectColor = (subject: string) => {
    if (subject.toLowerCase().includes('geometry')) return 'text-amber-800 bg-amber-50 border-amber-200';
    if (subject.toLowerCase().includes('writing')) return 'text-emerald-800 bg-emerald-50 border-emerald-200';
    return 'text-sky-800 bg-sky-50 border-sky-200';
  };

  return (
    <div className="min-h-screen bg-stone-100 py-4 sm:py-8 px-2 sm:px-4">
      {/* Smartphone Device Mockup Container */}
      <div className="max-w-md mx-auto bg-white rounded-3xl shadow-xl border-4 border-stone-800 overflow-hidden flex flex-col">
        
        {/* Device Top Speaker & Status Notch */}
        <div className="bg-stone-900 text-white px-5 pt-3 pb-2 flex items-center justify-between text-[11px] font-mono">
          <div className="flex items-center gap-1.5 text-stone-300">
            <span>9:41</span>
            <span>·</span>
            <span>Circle #{currentGroup.index + 1}</span>
          </div>

          <div className="w-16 h-3 bg-stone-800 rounded-full mx-auto" />

          {/* Group Switcher Dropdown */}
          <div className="relative">
            <select
              value={activeGroupId}
              onChange={(e) => setActiveGroupId(e.target.value)}
              aria-label="Select Group Circle"
              className="bg-stone-800 text-stone-200 text-xs px-2 py-0.5 rounded border border-stone-700 cursor-pointer focus:outline-none"
            >
              {session.groups.map(g => (
                <option key={g.id} value={g.id}>
                  {g.animalTotem} {g.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Group Identity Header */}
        <div className="bg-amber-900 text-amber-50 p-4 border-b border-amber-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-2xl">{currentGroup.animalTotem}</span>
              <div>
                <h1 className="font-serif font-bold text-lg text-white leading-tight">
                  {currentGroup.name}
                </h1>
                <p className="text-xs text-amber-200">
                  {currentGroup.studentCount} Students · 1 Smartphone Shared
                </p>
              </div>
            </div>

            {/* Silent Help Button */}
            <button
              onClick={handleCallTeacher}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors border ${
                currentGroup.needsHelp
                  ? 'bg-rose-600 text-white border-rose-500 animate-pulse'
                  : 'bg-amber-800/80 hover:bg-amber-700 text-amber-100 border-amber-700'
              }`}
            >
              <AlertCircle className="w-3.5 h-3.5" />
              <span>{currentGroup.needsHelp ? 'Help Called!' : 'Call Teacher'}</span>
            </button>
          </div>

          {/* The 4 Cooperative Roles Bar */}
          <div className="mt-3 pt-3 border-t border-amber-800/60 grid grid-cols-4 gap-1.5 text-center text-[10px]">
            {WORKSHOP_ROLES.map(role => {
              const assignedName = (currentGroup.assignedStudentNames as any)[role.id] || 'Non assigné';
              return (
                <button
                  key={role.id}
                  onClick={() => {
                    setEditingRole(role.id);
                    setRoleInputName(assignedName);
                  }}
                  className="bg-amber-950/40 hover:bg-amber-950/70 p-1.5 rounded-lg border border-amber-700/40 transition-colors text-left"
                >
                  <div className="font-semibold text-amber-200 truncate">{role.title.split(' ')[1] || role.title}</div>
                  <div className="text-amber-100 truncate font-mono text-[9px]">{assignedName}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Scrollable Content Body */}
        <div className="p-4 sm:p-5 space-y-6 overflow-y-auto max-h-[75vh]">
          
          {/* Section 1: The Oral Story Prologue & Voice Narration */}
          <section className="bg-stone-50 rounded-2xl p-4 border border-stone-200 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-amber-800 tracking-wider">
                  The Oral Tale
                </span>
                <h2 className="font-serif font-bold text-stone-900 text-base">
                  {activeJourney.title}
                </h2>
              </div>

              {/* Audio Listen Button */}
              <button
                onClick={handleToggleAudio}
                disabled={isLoadingAudio}
                className={`p-2 rounded-full transition-all border flex items-center gap-1.5 text-xs font-semibold ${
                  isPlayingAudio
                    ? 'bg-amber-700 text-white border-amber-700 animate-pulse'
                    : 'bg-white hover:bg-stone-100 text-stone-800 border-stone-300 shadow-xs'
                }`}
              >
                {isLoadingAudio ? (
                  <Loader2 className="w-4 h-4 animate-spin text-amber-700" />
                ) : isPlayingAudio ? (
                  <>
                    <Pause className="w-3.5 h-3.5" />
                    <span>Pause</span>
                  </>
                ) : (
                  <>
                    <Volume2 className="w-3.5 h-3.5 text-amber-700" />
                    <span>Listen</span>
                  </>
                )}
              </button>
            </div>

            <p className="text-xs text-stone-700 leading-relaxed italic border-l-2 border-amber-600 pl-3">
              "{activeJourney.griotPrologue.slice(0, 320)}..."
            </p>

            <div className="text-[11px] text-stone-500 pt-1 flex items-center justify-between">
              <span>🎙️ Read aloud by: <strong>{currentGroup.assignedStudentNames.griot}</strong></span>
              <span className="text-stone-400">{activeJourney.period}</span>
            </div>
          </section>

          {/* Section 2: Active Workshop Station Challenge */}
          <section className="space-y-4">
            {/* Workshop Banner */}
            <div className={`p-3 rounded-xl border text-xs ${getSubjectColor(currentWorkshop.subject)}`}>
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold uppercase tracking-wider text-[10px]">
                  Station {currentWorkshopIdx + 1} · {currentWorkshop.subject}
                </span>
                <span className="font-mono text-[10px]">Rotation {session.currentRotation}</span>
              </div>
              <h3 className="font-serif font-bold text-stone-900 text-sm">
                {currentWorkshop.title}
              </h3>
              <p className="text-[11px] opacity-90 mt-1">
                Curriculum Focus: {currentWorkshop.curriculumConnection}
              </p>
            </div>

            {/* Hands-On Challenge Prompt */}
            <div className="bg-amber-50/70 border border-amber-200/80 rounded-xl p-3.5 space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900">
                <Ruler className="w-4 h-4 text-amber-700" />
                <span>Hands-on Physical Challenge:</span>
              </div>
              <p className="text-xs text-amber-900 leading-relaxed font-medium">
                {currentWorkshop.handsOnChallenge}
              </p>
              <div className="text-[11px] text-amber-700/80">
                👉 Led on table by: <strong>{currentGroup.assignedStudentNames.architect}</strong>
              </div>
            </div>

            {/* Progressive Interactive Steps */}
            <div className="space-y-2">
              <span className="text-xs font-semibold text-stone-700">Team Investigation Steps:</span>
              {currentWorkshop.interactiveSteps.map((step, idx) => (
                <div
                  key={idx}
                  className="bg-white p-2.5 rounded-lg border border-stone-200 text-xs text-stone-700 flex items-start gap-2 shadow-2xs"
                >
                  <span className="w-5 h-5 rounded-full bg-stone-100 text-stone-600 font-bold text-[11px] flex items-center justify-center shrink-0">
                    {idx + 1}
                  </span>
                  <p className="leading-snug pt-0.5">{step}</p>
                </div>
              ))}
            </div>

            {/* Core Group Consensus Question */}
            <div className="bg-white rounded-xl border border-stone-200 p-4 space-y-3 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-[11px] uppercase font-bold text-stone-500">
                  Circle Consensus Vote
                </span>
                <span className="text-xs text-stone-400">At least 5 must agree</span>
              </div>

              <h4 className="font-semibold text-stone-900 text-sm leading-snug">
                {currentWorkshop.groupQuestion}
              </h4>

              {/* Options */}
              <div className="space-y-2 pt-1">
                {currentWorkshop.options?.map((option, idx) => {
                  const isChosen = selectedOption === idx;
                  const isCorrect = isAnswerSubmitted && idx === currentWorkshop.correctOptionIndex;
                  const isWrong = isAnswerSubmitted && isChosen && idx !== currentWorkshop.correctOptionIndex;

                  return (
                    <button
                      key={idx}
                      onClick={() => handleSelectOption(idx)}
                      disabled={isAnswerSubmitted}
                      className={`w-full text-left p-3 rounded-xl border text-xs transition-all flex items-start gap-2.5 ${
                        isCorrect
                          ? 'bg-emerald-50 border-emerald-400 text-emerald-900 font-medium'
                          : isWrong
                          ? 'bg-rose-50 border-rose-300 text-rose-900'
                          : isChosen
                          ? 'bg-amber-50 border-amber-600 text-amber-950 font-medium ring-2 ring-amber-500/20'
                          : 'bg-stone-50/60 hover:bg-stone-100 border-stone-200 text-stone-700'
                      }`}
                    >
                      <span className={`w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5 ${
                        isChosen ? 'bg-amber-700 text-white' : 'bg-stone-200 text-stone-600'
                      }`}>
                        {String.fromCharCode(65 + idx)}
                      </span>
                      <span className="leading-snug flex-1">{option}</span>
                      {isCorrect && <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />}
                    </button>
                  );
                })}
              </div>

              {/* Slate Notes by Scribe */}
              <div className="pt-2">
                <label className="block text-[11px] font-medium text-stone-600 mb-1">
                  ✍️ Scribe's Blackboard/Slate Notes ({currentGroup.assignedStudentNames.scribe}):
                </label>
                <textarea
                  value={slateNote}
                  onChange={(e) => setSlateNote(e.target.value)}
                  disabled={isAnswerSubmitted}
                  rows={2}
                  placeholder="Record what the group decided or calculated on the slate..."
                  className="w-full text-xs p-2.5 rounded-lg border border-stone-200 bg-stone-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-amber-600"
                />
              </div>

              {/* Submit Consensus Button */}
              {!isAnswerSubmitted ? (
                <button
                  onClick={handleSubmitConsensus}
                  disabled={selectedOption === undefined}
                  className="w-full py-2.5 px-4 rounded-xl bg-amber-700 hover:bg-amber-800 disabled:opacity-50 text-white text-xs font-semibold transition-colors shadow-xs"
                >
                  Submit Agreed Group Answer
                </button>
              ) : (
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-xs text-emerald-900 space-y-1">
                  <div className="flex items-center gap-1.5 font-bold">
                    <Award className="w-4 h-4 text-emerald-600" />
                    <span>Consensus Registered for Station {currentWorkshopIdx + 1}!</span>
                  </div>
                  <p className="text-[11px] text-emerald-800 leading-relaxed">
                    {currentWorkshop.explanation}
                  </p>
                </div>
              )}
            </div>
          </section>

          {/* Section 3: Griot's Progressive Hints & AI Guidance */}
          <section className="bg-stone-50 rounded-2xl p-4 border border-stone-200 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-stone-800 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-600" />
                <span>Need Guidance? Ask the Griot</span>
              </span>

              {unlockedHintsCount < currentWorkshop.hints.length && (
                <button
                  onClick={handleUnlockNextHint}
                  className="text-xs font-semibold text-amber-800 hover:text-amber-900 bg-amber-100/70 hover:bg-amber-100 px-2.5 py-1 rounded-md transition-colors"
                >
                  Unlock Clue {unlockedHintsCount + 1}
                </button>
              )}
            </div>

            {/* Unlocked Hints */}
            {unlockedHintsCount > 0 && (
              <div className="space-y-2 pt-1">
                {currentWorkshop.hints.slice(0, unlockedHintsCount).map((hint, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-lg bg-white border border-amber-200/70 text-xs text-stone-800 space-y-0.5 shadow-2xs"
                  >
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700">
                      {idx === 2 ? "Griot's Secret" : `Clue ${idx + 1}`}
                    </span>
                    <p className="leading-snug">{hint}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Ask the Griot interactive input */}
            <form onSubmit={handleAskGriot} className="pt-2 space-y-2">
              <div className="flex gap-1.5">
                <input
                  type="text"
                  value={griotQuestion}
                  onChange={(e) => setGriotQuestion(e.target.value)}
                  placeholder="Ask the Griot a question about this riddle..."
                  className="flex-1 text-xs px-3 py-2 rounded-lg border border-stone-200 bg-white focus:outline-none focus:ring-1 focus:ring-amber-600"
                />
                <button
                  type="submit"
                  disabled={isAskingGriot || !griotQuestion.trim()}
                  className="px-3 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-lg text-xs font-medium disabled:opacity-50 transition-colors flex items-center gap-1"
                >
                  {isAskingGriot ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                </button>
              </div>

              {griotResponse && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-950 italic leading-relaxed">
                  " {griotResponse} "
                </div>
              )}
            </form>
          </section>

          {/* Section 4: Orator's Prep for the Grand Council Plenary */}
          <section className="bg-stone-900 text-stone-100 rounded-2xl p-4 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-amber-400 uppercase tracking-wider text-[10px]">
                Plenary Preparation
              </span>
              <span className="text-stone-400">Orator: {currentGroup.assignedStudentNames.orator}</span>
            </div>
            <p className="text-xs text-stone-300 leading-relaxed">
              When the rotation bell rings, your Orator will have 60 seconds to speak in front of the whole class! Rehearse together: How did your sticks or calculations reveal the answer?
            </p>
          </section>

        </div>

        {/* Device Bottom Bar */}
        <div className="bg-stone-100 border-t border-stone-200 p-2.5 text-center text-[11px] text-stone-500 flex items-center justify-between px-4">
          <span>Pass phone to: <strong>Next Scribe</strong> on rotation</span>
          <div className="w-24 h-1 bg-stone-400 rounded-full mx-auto" />
          <span>Battery 84% 🔋</span>
        </div>

      </div>

      {/* Role Assignment Modal */}
      {editingRole && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 space-y-4 shadow-xl border border-stone-200">
            <h3 className="font-serif font-bold text-stone-900 text-base">
              Assign {WORKSHOP_ROLES.find(r => r.id === editingRole)?.title}
            </h3>
            <p className="text-xs text-stone-600">
              {WORKSHOP_ROLES.find(r => r.id === editingRole)?.actionInstruction}
            </p>

            <input
              type="text"
              value={roleInputName}
              onChange={(e) => setRoleInputName(e.target.value)}
              placeholder="Student's Name"
              className="w-full text-xs p-2.5 rounded-lg border border-stone-200 focus:outline-none focus:ring-1 focus:ring-amber-600"
              autoFocus
            />

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setEditingRole(null)}
                className="px-3 py-1.5 text-xs rounded-lg border border-stone-200 text-stone-600 hover:bg-stone-50"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (roleInputName.trim()) {
                    updateStudentRole(currentGroup.id, editingRole, roleInputName.trim());
                  }
                  setEditingRole(null);
                }}
                className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-amber-700 text-white hover:bg-amber-800"
              >
                Save Role
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
