import React from 'react';
import { useClassroom } from '../context/ClassroomContext';
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  Users,
  Ruler,
  PenTool,
  MapPin,
  CheckCircle2,
  Clock,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { playRotationCall } from '../utils/audio';

export const ProjectorView: React.FC = () => {
  const {
    session,
    activeJourney,
    toggleTimer,
    resetTimer,
    advanceRotation,
    previousRotation,
    getWorkshopForGroup,
  } = useClassroom();

  const formatMinutes = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    return mins.toString().padStart(2, '0');
  };

  const formatSeconds = (seconds: number) => {
    const secs = seconds % 60;
    return secs.toString().padStart(2, '0');
  };

  const isLowTime = session.timerSecondsRemaining < 300 && session.timerSecondsRemaining > 0;

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 p-6 sm:p-10 flex flex-col justify-between">
      
      {/* Top Banner: Story and Classroom State */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-800 pb-6">
        <div>
          <div className="flex items-center gap-2 text-amber-400 text-xs uppercase tracking-widest font-bold">
            <Sparkles className="w-4 h-4" />
            <span>Grand Council Display · {activeJourney.culture}</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-black tracking-tight text-white mt-1">
            {activeJourney.title}
          </h1>
          <p className="text-stone-400 text-sm mt-1 max-w-2xl">
            {activeJourney.subtitle}
          </p>
        </div>

        <div className="flex items-center gap-4 bg-stone-900/80 px-5 py-3 rounded-2xl border border-stone-800">
          <div className="text-right">
            <div className="text-xs text-stone-400">Classroom Deployment</div>
            <div className="font-serif font-bold text-lg text-white">
              {session.totalStudents} Students · {session.groupCount} Circles
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-700/30 border border-amber-600/40 text-amber-300 flex items-center justify-center font-bold text-lg">
            {session.currentRotation > 3 ? '★' : `R${session.currentRotation}`}
          </div>
        </div>
      </header>

      {/* Centerpiece: Giant Timer & 3 Rotating Stations */}
      <main className="my-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        
        {/* Giant Countdown Clock (5 cols) */}
        <div className="lg:col-span-5 bg-stone-900/90 rounded-3xl border border-stone-800 p-8 text-center space-y-6 shadow-2xl relative overflow-hidden">
          <div className="text-xs uppercase tracking-widest text-stone-400 font-semibold flex items-center justify-center gap-2">
            <Clock className="w-4 h-4 text-amber-500" />
            <span>
              {session.currentRotation === 0
                ? 'Classroom Intro & Prologue'
                : session.currentRotation <= 3
                ? `Session Rotation ${session.currentRotation} of 3`
                : 'Grand Council Assembly'}
            </span>
          </div>

          {/* Huge Digits */}
          <div className={`font-mono text-7xl sm:text-8xl md:text-9xl font-black tabular-nums tracking-tighter ${
            isLowTime ? 'text-rose-500 animate-pulse' : 'text-amber-400'
          }`}>
            <span>{formatMinutes(session.timerSecondsRemaining)}</span>
            <span className="opacity-40">:</span>
            <span>{formatSeconds(session.timerSecondsRemaining)}</span>
          </div>

          {/* Timer Controls */}
          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              onClick={toggleTimer}
              className="p-4 rounded-2xl bg-amber-600 hover:bg-amber-500 text-white transition-all shadow-lg active:scale-95"
            >
              {session.isTimerRunning ? (
                <Pause className="w-7 h-7 fill-white" />
              ) : (
                <Play className="w-7 h-7 fill-white ml-0.5" />
              )}
            </button>

            <button
              onClick={resetTimer}
              title="Reset Timer"
              className="p-4 rounded-2xl bg-stone-800 hover:bg-stone-700 text-stone-300 transition-colors"
            >
              <RotateCcw className="w-6 h-6" />
            </button>

            <button
              onClick={playRotationCall}
              title="Call Classroom Drum"
              className="px-5 py-4 rounded-2xl bg-amber-950/80 hover:bg-amber-900 text-amber-300 border border-amber-800/60 font-semibold text-sm flex items-center gap-2 transition-colors"
            >
              <Volume2 className="w-5 h-5 text-amber-400" />
              <span>Djembe Call</span>
            </button>
          </div>

          {session.currentRotation < 4 && (
            <div className="pt-2">
              <button
                onClick={advanceRotation}
                className="w-full py-3 px-6 rounded-xl bg-gradient-to-r from-amber-700 to-amber-600 hover:from-amber-600 hover:to-amber-500 text-white font-bold text-sm tracking-wide transition-all shadow-md flex items-center justify-center gap-2"
              >
                <span>Ring Rotation Bell & Shift Stations</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* 3 Active Workshop Stations (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="text-xs uppercase tracking-wider text-stone-400 font-semibold mb-2">
            The 3 Synchronous Workshop Stations
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {activeJourney.workshops.map((workshop, idx) => {
              // Find which groups are in this station right now
              const groupsInStation = session.groups.filter(
                g => getWorkshopForGroup(g.index, session.currentRotation) === idx
              );

              return (
                <div
                  key={workshop.id}
                  className="bg-stone-900/80 rounded-2xl p-5 border border-stone-800 flex flex-col justify-between space-y-4 shadow-lg hover:border-stone-700 transition-all"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs text-stone-400">
                      <span className="font-mono text-amber-400 font-bold">Station {idx + 1}</span>
                      <span>{groupsInStation.length} Groups</span>
                    </div>

                    <h3 className="font-serif font-bold text-white text-base leading-snug">
                      {workshop.title}
                    </h3>

                    <div className="text-xs text-amber-300/80 font-medium">
                      {workshop.subject}
                    </div>

                    <p className="text-xs text-stone-400 line-clamp-3 leading-relaxed">
                      {workshop.handsOnChallenge}
                    </p>
                  </div>

                  {/* Groups currently stationed here */}
                  <div className="pt-3 border-t border-stone-800 space-y-1.5">
                    <span className="text-[10px] uppercase text-stone-500 font-bold block">
                      Circles Currently Here:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {groupsInStation.map(g => {
                        const isDone = g.answers[workshop.id]?.completed;
                        return (
                          <span
                            key={g.id}
                            className={`inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-md font-medium ${
                              isDone
                                ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                                : 'bg-stone-800 text-stone-200'
                            }`}
                          >
                            <span>{g.animalTotem}</span>
                            <span>{g.name.split(' ')[1] || g.name}</span>
                            {isDone && <CheckCircle2 className="w-3 h-3 text-emerald-400" />}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Central Moral Question */}
          <div className="bg-amber-950/40 border border-amber-800/40 rounded-2xl p-5 text-xs text-amber-100 flex items-start gap-3">
            <span className="text-2xl shrink-0">🏛️</span>
            <div>
              <span className="font-bold text-amber-300 uppercase tracking-wider block text-[11px] mb-0.5">
                Central Question of the Day:
              </span>
              <p className="text-sm font-serif italic text-white leading-relaxed">
                "{activeJourney.coreQuestion}"
              </p>
            </div>
          </div>
        </div>

      </main>

      {/* Bottom Bar: Live Group Circles Progress Bar */}
      <footer className="border-t border-stone-800 pt-6">
        <div className="flex items-center justify-between text-xs text-stone-400 mb-3">
          <span>Live Classroom Progress · Circles of 8</span>
          <span>1 Phone Per Circle · Cooperative Slates</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
          {session.groups.map(group => {
            const currentWIdx = getWorkshopForGroup(group.index, session.currentRotation);
            const wId = activeJourney.workshops[currentWIdx]?.id;
            const isCompleted = group.answers[wId]?.completed;

            return (
              <div
                key={group.id}
                className={`p-3 rounded-xl border text-xs text-left transition-all ${
                  group.needsHelp
                    ? 'bg-rose-950/60 border-rose-600 text-rose-200'
                    : isCompleted
                    ? 'bg-emerald-950/50 border-emerald-700/80 text-emerald-100'
                    : 'bg-stone-900 border-stone-800 text-stone-300'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold truncate text-white">{group.name}</span>
                  <span>{group.animalTotem}</span>
                </div>
                <div className="text-[11px] text-stone-400 truncate">
                  Station {currentWIdx + 1}: {activeJourney.workshops[currentWIdx]?.subject.split(' ')[0]}
                </div>
                <div className="mt-2 text-[10px] font-semibold flex items-center justify-between">
                  <span>{isCompleted ? '✓ Submitted' : '⏳ Thinking'}</span>
                  {group.needsHelp && <span className="text-rose-400 animate-pulse">Needs Help</span>}
                </div>
              </div>
            );
          })}
        </div>
      </footer>

    </div>
  );
};
