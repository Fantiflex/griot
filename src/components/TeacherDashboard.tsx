import React, { useState } from 'react';
import { useClassroom } from '../context/ClassroomContext';
import { WORKSHOP_ROLES } from '../data/defaultJourneys';
import {
  Users,
  Compass,
  PenTool,
  MapPin,
  Ruler,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  HelpCircle,
  ChevronRight,
  ArrowRight,
  Smartphone,
  Eye,
  BookOpen,
  Volume2,
  Play,
  RotateCw,
} from 'lucide-react';
import { playRotationCall } from '../utils/audio';

export const TeacherDashboard: React.FC = () => {
  const {
    session,
    journeys,
    activeJourney,
    setViewMode,
    setActiveGroupId,
    setTotalStudents,
    setRotationDuration,
    advanceRotation,
    previousRotation,
    selectJourney,
    getWorkshopForGroup,
  } = useClassroom();

  const [selectedStationTab, setSelectedStationTab] = useState<number>(0);

  const getWorkshopIcon = (subject: string) => {
    if (subject.toLowerCase().includes('geometry') || subject.toLowerCase().includes('measure')) {
      return <Ruler className="w-4 h-4 text-amber-700" />;
    }
    if (subject.toLowerCase().includes('writing') || subject.toLowerCase().includes('debate')) {
      return <PenTool className="w-4 h-4 text-emerald-700" />;
    }
    return <MapPin className="w-4 h-4 text-sky-700" />;
  };

  const getWorkshopName = (idx: number) => {
    return activeJourney.workshops[idx]?.subject || `Workshop ${idx + 1}`;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Top Banner: The Divide-and-Conquer Methodology */}
      <section className="bg-amber-900 text-amber-50 rounded-2xl p-6 sm:p-8 shadow-sm relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-12 -translate-y-8 w-64 h-64 bg-amber-800/40 rounded-full blur-2xl pointer-events-none" />
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="text-xs uppercase tracking-wider text-amber-300 font-semibold">
            Pedagogical Architecture · High-Density Classrooms
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-white">
            One Teacher. One Phone Per Group. 40 to 70 Empowered Learners.
          </h1>
          <p className="text-amber-100/90 text-sm sm:text-base leading-relaxed">
            Divide your class into circles of ~8 students. Each circle is guided by their own <strong className="text-white">Griot of the Day</strong> and rotates through three interdisciplinary workshops (Geometry, Writing, Geography) before coming together in the Grand Council.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-4 text-xs text-amber-200">
            <span className="flex items-center gap-1.5 bg-amber-800/60 px-3 py-1.5 rounded-lg border border-amber-700/50">
              <Users className="w-3.5 h-3.5" />
              <span>{session.totalStudents} Students in {session.groupCount} Circles</span>
            </span>
            <span className="flex items-center gap-1.5 bg-amber-800/60 px-3 py-1.5 rounded-lg border border-amber-700/50">
              <Smartphone className="w-3.5 h-3.5" />
              <span>{session.groupCount} Smartphones total</span>
            </span>
            <span className="flex items-center gap-1.5 bg-amber-800/60 px-3 py-1.5 rounded-lg border border-amber-700/50">
              <RotateCw className="w-3.5 h-3.5" />
              <span>3 Rotations · 35 min each</span>
            </span>
          </div>

          <div className="pt-4 border-t border-amber-800/60 flex flex-wrap items-center justify-between gap-3">
            <div className="text-xs text-amber-200">
              <span className="font-bold text-white">✨ 2 Versions Disponibles :</span> Vous êtes sur le <strong>Tableau de Bord Enseignant</strong>. Passez à la <strong>Version Élèves</strong> pour tester l'interface tactile interactive pour enfants (style DAIR Institute).
            </div>
            <button
              onClick={() => setViewMode('group')}
              className="px-4 py-2 bg-[#F5BA1E] hover:bg-[#E5A823] text-stone-950 font-black text-xs rounded-xl border-2 border-stone-900 shadow-[3px_3px_0px_#1A1817] flex items-center gap-1.5 transition-all active:translate-y-0.5 cursor-pointer"
            >
              <Smartphone className="w-4 h-4 text-stone-950" />
              <span>Ouvrir l'Interface Élèves (Design DAIR) ➔</span>
            </button>
          </div>
        </div>
      </section>

      {/* Classroom Setup & Rotation Control Row */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left: Class Size & Duration Orchestration */}
        <div className="bg-white rounded-xl border border-stone-200 p-5 space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-stone-900 text-sm">Classroom Parameters</h2>
            <span className="text-xs text-stone-500 font-mono">Dynamic Split</span>
          </div>

          <div className="space-y-3">
            <label className="block text-xs font-medium text-stone-700">
              Total Students in Room: <span className="font-bold text-stone-900">{session.totalStudents}</span>
            </label>
            <div className="grid grid-cols-5 gap-1.5">
              {[40, 48, 56, 64, 72].map(count => (
                <button
                  key={count}
                  onClick={() => setTotalStudents(count)}
                  className={`py-2 text-xs font-semibold rounded-lg transition-colors border ${
                    session.totalStudents === count
                      ? 'bg-amber-700 text-white border-amber-700 shadow-xs'
                      : 'bg-stone-50 hover:bg-stone-100 text-stone-700 border-stone-200'
                  }`}
                >
                  {count}
                </button>
              ))}
            </div>
            <p className="text-xs text-stone-500">
              Split into <strong>{session.groupCount} groups</strong> of <strong>~{session.studentsPerGroup} students</strong>. Each group only needs 1 smartphone!
            </p>
          </div>

          <div className="space-y-2 pt-2 border-t border-stone-100">
            <label className="block text-xs font-medium text-stone-700">
              Session Rotation Duration: <span className="font-bold text-stone-900">{session.rotationDurationMinutes} min</span>
            </label>
            <div className="grid grid-cols-4 gap-1.5">
              {[20, 25, 30, 35].map(min => (
                <button
                  key={min}
                  onClick={() => setRotationDuration(min)}
                  className={`py-1.5 text-xs font-medium rounded-lg transition-colors border ${
                    session.rotationDurationMinutes === min
                      ? 'bg-stone-900 text-white border-stone-900'
                      : 'bg-stone-50 hover:bg-stone-100 text-stone-600 border-stone-200'
                  }`}
                >
                  {min}m
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Center: Live Rotation Orchestrator */}
        <div className="bg-white rounded-xl border border-stone-200 p-5 space-y-4 lg:col-span-2">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-semibold text-stone-900 text-sm">3-Workshop Rotation Matrix</h2>
              <p className="text-xs text-stone-500">All groups rotate synchronously across the 3 stations</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={previousRotation}
                disabled={session.currentRotation <= 0}
                className="px-2.5 py-1 text-xs font-medium rounded-md border border-stone-200 hover:bg-stone-50 disabled:opacity-40 text-stone-700"
              >
                Previous
              </button>
              <button
                onClick={advanceRotation}
                className="px-3 py-1 text-xs font-semibold rounded-md bg-amber-700 hover:bg-amber-800 text-white flex items-center gap-1.5 transition-colors shadow-xs"
              >
                <span>Trigger Rotation</span>
                <Volume2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Matrix Steps Flow */}
          <div className="grid grid-cols-4 gap-2 text-xs">
            {[
              { id: 0, title: '0. Briefing', desc: 'Prologue & Roles' },
              { id: 1, title: 'Session 1', desc: 'First Station (35m)' },
              { id: 2, title: 'Session 2', desc: 'Second Station (35m)' },
              { id: 3, title: 'Session 3', desc: 'Third Station (35m)' },
            ].map(col => {
              const isCurrent = session.currentRotation === col.id;
              return (
                <div
                  key={col.id}
                  className={`p-2.5 rounded-lg border text-left transition-all ${
                    isCurrent
                      ? 'bg-amber-50/80 border-amber-300 ring-2 ring-amber-500/20'
                      : 'bg-stone-50/60 border-stone-200 text-stone-600'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className={`font-semibold ${isCurrent ? 'text-amber-900' : 'text-stone-700'}`}>
                      {col.title}
                    </span>
                    {isCurrent && (
                      <span className="w-2 h-2 rounded-full bg-amber-600 animate-pulse" />
                    )}
                  </div>
                  <div className="text-[11px] text-stone-500">{col.desc}</div>
                </div>
              );
            })}
          </div>

          {/* Schedule distribution table */}
          <div className="border border-stone-200 rounded-lg overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-stone-50 border-b border-stone-200 text-stone-600">
                <tr>
                  <th className="py-2 px-3 font-semibold">Group Circle</th>
                  <th className="py-2 px-3 font-semibold">Session 1</th>
                  <th className="py-2 px-3 font-semibold">Session 2</th>
                  <th className="py-2 px-3 font-semibold">Session 3</th>
                  <th className="py-2 px-3 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 font-sans">
                {session.groups.slice(0, 7).map(group => {
                  const s1Idx = getWorkshopForGroup(group.index, 1);
                  const s2Idx = getWorkshopForGroup(group.index, 2);
                  const s3Idx = getWorkshopForGroup(group.index, 3);
                  return (
                    <tr key={group.id} className="hover:bg-stone-50/50">
                      <td className="py-2 px-3 font-medium text-stone-800 flex items-center gap-1.5">
                        <span>{group.animalTotem}</span>
                        <span>{group.name}</span>
                      </td>
                      <td className={`py-2 px-3 ${session.currentRotation === 1 ? 'font-bold text-amber-800 bg-amber-50/50' : 'text-stone-600'}`}>
                        {getWorkshopName(s1Idx)}
                      </td>
                      <td className={`py-2 px-3 ${session.currentRotation === 2 ? 'font-bold text-amber-800 bg-amber-50/50' : 'text-stone-600'}`}>
                        {getWorkshopName(s2Idx)}
                      </td>
                      <td className={`py-2 px-3 ${session.currentRotation === 3 ? 'font-bold text-amber-800 bg-amber-50/50' : 'text-stone-600'}`}>
                        {getWorkshopName(s3Idx)}
                      </td>
                      <td className="py-2 px-3 text-right">
                        <button
                          onClick={() => {
                            setActiveGroupId(group.id);
                            setViewMode('group');
                          }}
                          className="text-stone-600 hover:text-amber-800 font-medium inline-flex items-center gap-1 hover:underline"
                        >
                          <Smartphone className="w-3 h-3" />
                          <span>View Phone</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Live Group Monitoring Grid */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="font-serif text-xl font-bold text-stone-900">
              Live Classroom Monitor ({session.groupCount} Groups)
            </h2>
            <p className="text-xs text-stone-500">
              Observe each circle of 8 students. You can see answers submitted, hints unlocked, and help calls.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="flex items-center gap-1 text-emerald-700 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5" /> Answer Submitted
            </span>
            <span aria-hidden="true" className="text-stone-300">·</span>
            <span className="flex items-center gap-1 text-rose-600 font-medium">
              <AlertCircle className="w-3.5 h-3.5" /> Call for Teacher
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {session.groups.map(group => {
            const currentWorkshopIdx = getWorkshopForGroup(group.index, session.currentRotation);
            const currentWorkshop = activeJourney.workshops[currentWorkshopIdx] || activeJourney.workshops[0];
            const answer = group.answers[currentWorkshop.id];
            const isCompleted = answer?.completed;

            return (
              <div
                key={group.id}
                className={`bg-white rounded-xl border p-4 transition-all relative flex flex-col justify-between ${
                  group.needsHelp
                    ? 'border-rose-400 ring-2 ring-rose-500/20 shadow-sm'
                    : isCompleted
                    ? 'border-emerald-300 bg-emerald-50/20'
                    : 'border-stone-200 hover:border-stone-300'
                }`}
              >
                {/* Emergency help badge */}
                {group.needsHelp && (
                  <div className="bg-rose-600 text-white text-[11px] font-semibold px-2 py-0.5 rounded-md mb-2 flex items-center justify-between">
                    <span className="flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> Teacher Assistance Requested
                    </span>
                  </div>
                )}

                <div>
                  {/* Group header */}
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2 font-medium text-stone-900 text-sm">
                      <span className="text-lg">{group.animalTotem}</span>
                      <span>{group.name}</span>
                    </div>
                    <span className="text-xs text-stone-500 bg-stone-100 px-2 py-0.5 rounded font-mono">
                      {group.studentCount} kids
                    </span>
                  </div>

                  {/* Current Active Station */}
                  <div className="bg-stone-50 rounded-lg p-2.5 mb-3 border border-stone-100 text-xs space-y-1">
                    <div className="flex items-center gap-1.5 font-medium text-stone-800">
                      {getWorkshopIcon(currentWorkshop.subject)}
                      <span className="truncate">{currentWorkshop.title}</span>
                    </div>
                    <div className="text-[11px] text-stone-500">
                      Standard: {currentWorkshop.curriculumConnection}
                    </div>
                  </div>

                  {/* Assigned Student Roles */}
                  <div className="space-y-1 mb-3 text-[11px] text-stone-600">
                    <div className="flex justify-between">
                      <span className="text-stone-400">Griot (Phone):</span>
                      <span className="font-medium text-stone-800">{group.assignedStudentNames.griot}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-stone-400">Scribe (Slate):</span>
                      <span className="font-medium text-stone-800">{group.assignedStudentNames.scribe}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-stone-400">Builder (Math):</span>
                      <span className="font-medium text-stone-800">{group.assignedStudentNames.architect}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-stone-400">Orator (Plenary):</span>
                      <span className="font-medium text-stone-800">{group.assignedStudentNames.orator}</span>
                    </div>
                  </div>

                  {/* Status / Answer Submission */}
                  <div className="text-xs pt-2 border-t border-stone-100">
                    {isCompleted ? (
                      <div className="text-emerald-700 flex items-center gap-1.5 font-medium">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Agreed consensus recorded</span>
                      </div>
                    ) : (
                      <div className="text-stone-500 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
                        <span>Circle in active discussion...</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Inspect Action */}
                <div className="pt-3 mt-3 border-t border-stone-100 flex items-center justify-between">
                  <span className="text-[11px] text-stone-400">Phone # {group.index + 1}</span>
                  <button
                    onClick={() => {
                      setActiveGroupId(group.id);
                      setViewMode('group');
                    }}
                    className="text-xs font-medium text-amber-800 hover:text-amber-900 flex items-center gap-1 hover:underline"
                  >
                    <span>Test Phone View</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Teacher Walk-Around Guide & Observation Notes */}
      <section className="bg-stone-100/70 rounded-xl border border-stone-200 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-serif text-lg font-bold text-stone-900">
              Teacher Walk-Around Pedagogical Guide
            </h2>
            <p className="text-xs text-stone-600">
              While the groups work independently with their smartphone, walk the room and use these observational checkpoints:
            </p>
          </div>

          <div className="flex gap-1 bg-stone-200/80 p-1 rounded-lg">
            {activeJourney.workshops.map((w, idx) => (
              <button
                key={w.id}
                onClick={() => setSelectedStationTab(idx)}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                  selectedStationTab === idx
                    ? 'bg-white text-stone-900 shadow-xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                {w.subject}
              </button>
            ))}
          </div>
        </div>

        {activeJourney.workshops[selectedStationTab] && (
          <div className="bg-white rounded-lg p-5 border border-stone-200/80 space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-amber-800">
                {activeJourney.workshops[selectedStationTab].subject}
              </span>
              <span aria-hidden="true" className="text-stone-300">·</span>
              <span className="text-xs text-stone-500 font-mono">
                Station {selectedStationTab + 1}
              </span>
            </div>

            <h3 className="font-semibold text-stone-900 text-sm">
              {activeJourney.workshops[selectedStationTab].title}
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 text-xs">
              <div className="bg-stone-50 p-3 rounded-lg border border-stone-200/60">
                <span className="font-semibold text-stone-800 block mb-1">
                  👀 What to observe when stepping up to this circle:
                </span>
                <p className="text-stone-600 leading-relaxed">
                  {activeJourney.workshops[selectedStationTab].teacherGuideNote}
                </p>
              </div>

              <div className="bg-amber-50/60 p-3 rounded-lg border border-amber-200/60">
                <span className="font-semibold text-amber-900 block mb-1">
                  💡 Diagnostic question to stimulate stalled groups:
                </span>
                <p className="text-amber-800/90 leading-relaxed">
                  "Ask the Architect: How did your sticks demonstrate the answer to the Scribe before they wrote it down?"
                </p>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Story & Learning Journey Library */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-serif text-xl font-bold text-stone-900">
              Learning Journey Library
            </h2>
            <p className="text-xs text-stone-500">
              Select an interdisciplinary tale or generate a custom one with Gemini
            </p>
          </div>

          <button
            onClick={() => setViewMode('generator')}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-amber-700 hover:bg-amber-800 text-white transition-colors shadow-xs"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Forge New Tale with Gemini</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {journeys.map(journey => {
            const isSelected = journey.id === activeJourney.id;
            return (
              <div
                key={journey.id}
                onClick={() => selectJourney(journey.id)}
                className={`cursor-pointer rounded-xl border p-4 text-left transition-all flex flex-col justify-between ${
                  isSelected
                    ? 'border-amber-700 bg-amber-50/40 ring-2 ring-amber-700/20 shadow-xs'
                    : 'bg-white border-stone-200 hover:border-stone-300'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between text-xs text-stone-500 mb-2">
                    <span>{journey.culture}</span>
                    <span className="font-mono">{journey.period}</span>
                  </div>

                  <h3 className="font-serif font-bold text-stone-900 text-base mb-1">
                    {journey.title}
                  </h3>

                  <p className="text-xs text-stone-600 line-clamp-2 leading-relaxed mb-3">
                    {journey.subtitle}
                  </p>

                  <div className="text-[11px] text-stone-500 space-y-0.5 border-t border-stone-100 pt-2">
                    <div>1. {journey.workshops[0]?.subject || 'Geometry'}</div>
                    <div>2. {journey.workshops[1]?.subject || 'Writing'}</div>
                    <div>3. {journey.workshops[2]?.subject || 'Geography'}</div>
                  </div>
                </div>

                <div className="mt-4 pt-2 border-t border-stone-100 flex items-center justify-between text-xs">
                  <span className="text-stone-400 font-medium">
                    {isSelected ? '✓ Active Journey' : 'Click to Select'}
                  </span>
                  {isSelected && (
                    <span className="w-2 h-2 rounded-full bg-amber-600" />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

    </div>
  );
};
