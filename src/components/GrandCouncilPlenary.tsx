import React, { useState, useEffect } from 'react';
import { useClassroom } from '../context/ClassroomContext';
import { Award, Volume2, Users, ArrowLeft, Play, Pause, RotateCcw, Sparkles } from 'lucide-react';
import { playCelebration, playRotationCall } from '../utils/audio';

export const GrandCouncilPlenary: React.FC = () => {
  const { session, activeJourney, setViewMode } = useClassroom();

  const [activeSpeakerIndex, setActiveSpeakerIndex] = useState<number>(0);
  const [speakerSecondsRemaining, setSpeakerSecondsRemaining] = useState<number>(60);
  const [isSpeakerTimerActive, setIsSpeakerTimerActive] = useState<boolean>(false);
  const [celebrated, setCelebrated] = useState<boolean>(false);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isSpeakerTimerActive && speakerSecondsRemaining > 0) {
      interval = setInterval(() => {
        setSpeakerSecondsRemaining(prev => {
          if (prev <= 1) {
            playRotationCall();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isSpeakerTimerActive, speakerSecondsRemaining]);

  const handleNextSpeaker = () => {
    setActiveSpeakerIndex(prev => (prev + 1) % session.groups.length);
    setSpeakerSecondsRemaining(60);
    setIsSpeakerTimerActive(false);
  };

  const handleCelebrateClassroom = () => {
    playCelebration();
    setCelebrated(true);
  };

  const currentSpeakerGroup = session.groups[activeSpeakerIndex] || session.groups[0];

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
      
      {/* Top action */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setViewMode('teacher')}
          className="flex items-center gap-1.5 text-xs font-semibold text-stone-600 hover:text-stone-900"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Teacher Console</span>
        </button>

        <button
          onClick={handleCelebrateClassroom}
          className="flex items-center gap-2 px-4 py-2 bg-amber-700 hover:bg-amber-800 text-white rounded-xl text-xs font-semibold shadow-xs"
        >
          <Sparkles className="w-4 h-4" />
          <span>Celebrate Classroom Achievement</span>
        </button>
      </div>

      {/* Main Assembly Banner */}
      <div className="bg-amber-950 text-amber-50 rounded-3xl p-8 sm:p-10 border border-amber-900 text-center space-y-4 shadow-xl relative overflow-hidden">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-900/60 border border-amber-700/50 text-xs font-bold uppercase tracking-wider text-amber-300">
          <span>🏛️ The Grand Council Assembly</span>
        </div>

        <h1 className="font-serif text-3xl sm:text-5xl font-black text-white tracking-tight">
          {activeJourney.plenaryCouncil.title}
        </h1>

        <p className="text-amber-100/90 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
          {activeJourney.plenaryCouncil.description}
        </p>

        {/* Central Mystery Synthesis */}
        <div className="bg-amber-900/50 border border-amber-700/50 rounded-2xl p-5 max-w-2xl mx-auto text-left space-y-2 mt-4">
          <span className="text-[11px] uppercase tracking-wider font-bold text-amber-300 block">
            Central Inquiry to Synthesize:
          </span>
          <p className="font-serif italic text-white text-base leading-relaxed">
            "{activeJourney.plenaryCouncil.finalChallengePrompt}"
          </p>
        </div>
      </div>

      {/* Orator Podium & 60-Second Presentation Stage */}
      <div className="bg-white rounded-2xl border border-stone-200 p-6 sm:p-8 space-y-6 shadow-xs">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-200 pb-4">
          <div>
            <div className="text-xs uppercase tracking-wider text-stone-500 font-semibold">
              Podium: Speaking Circle {activeSpeakerIndex + 1} of {session.groupCount}
            </div>
            <h2 className="font-serif text-2xl font-bold text-stone-900 flex items-center gap-2 mt-1">
              <span>{currentSpeakerGroup.animalTotem}</span>
              <span>{currentSpeakerGroup.name}</span>
            </h2>
          </div>

          {/* 60s Speaker Clock */}
          <div className="flex items-center gap-3 bg-stone-100 p-2 rounded-xl border border-stone-200">
            <div className="font-mono text-2xl sm:text-3xl font-black text-stone-900 tabular-nums px-3">
              {speakerSecondsRemaining}s
            </div>

            <button
              onClick={() => setIsSpeakerTimerActive(!isSpeakerTimerActive)}
              className="p-2 rounded-lg bg-stone-900 text-white hover:bg-stone-800"
            >
              {isSpeakerTimerActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </button>

            <button
              onClick={() => {
                setSpeakerSecondsRemaining(60);
                setIsSpeakerTimerActive(false);
              }}
              className="p-2 rounded-lg border border-stone-300 text-stone-600 hover:bg-stone-200"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            <button
              onClick={handleNextSpeaker}
              className="px-3 py-2 bg-amber-700 text-white rounded-lg text-xs font-semibold hover:bg-amber-800"
            >
              Next Circle ➔
            </button>
          </div>
        </div>

        {/* Orator details */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="bg-stone-50 p-4 rounded-xl border border-stone-200 space-y-1">
            <span className="font-bold text-stone-700 block">📢 Spokesperson:</span>
            <div className="text-sm font-semibold text-stone-900">
              {currentSpeakerGroup.assignedStudentNames.orator}
            </div>
            <p className="text-stone-500 text-[11px]">
              Speaks on behalf of the {currentSpeakerGroup.studentCount} circle members
            </p>
          </div>

          <div className="bg-stone-50 p-4 rounded-xl border border-stone-200 space-y-1 md:col-span-2">
            <span className="font-bold text-stone-700 block">✍️ Scribe's Recorded Slate Notes:</span>
            <p className="text-stone-800 italic leading-relaxed">
              {currentSpeakerGroup.answers['workshop-writing']?.slateNote ||
                currentSpeakerGroup.answers['workshop-geometry']?.slateNote ||
                'The group demonstrated their findings using geometric sticks and consensus voting.'}
            </p>
          </div>
        </div>

        {/* 3 Discipline Synthesis Badges */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
          {activeJourney.workshops.map((w, idx) => (
            <div key={w.id} className="p-3 rounded-xl border border-stone-200 bg-stone-50/70 text-xs space-y-1">
              <span className="font-mono text-amber-800 font-bold block text-[10px]">
                Workshop {idx + 1}
              </span>
              <strong className="text-stone-900 block truncate">{w.subject}</strong>
              <p className="text-[11px] text-stone-600 leading-snug line-clamp-2">
                {w.explanation || w.title}
              </p>
            </div>
          ))}
        </div>

      </div>

      {/* Classroom Celebration Modal / Card */}
      {celebrated && (
        <div className="bg-emerald-50 border-2 border-emerald-400 rounded-3xl p-8 text-center space-y-3 shadow-md animate-fade-in">
          <div className="w-14 h-14 bg-emerald-600 text-white rounded-2xl mx-auto flex items-center justify-center font-bold text-2xl shadow-sm">
            🏆
          </div>
          <h3 className="font-serif font-bold text-2xl text-emerald-950">
            Collective Master Griot Honor Bestowed!
          </h3>
          <p className="text-xs text-emerald-800 max-w-lg mx-auto leading-relaxed">
            All {session.totalStudents} students across the {session.groupCount} circles have completed their 3-workshop rotation. Geometry, Writing, and Geography have bridged together.
          </p>
        </div>
      )}

    </div>
  );
};
