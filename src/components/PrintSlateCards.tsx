import React from 'react';
import { useClassroom } from '../context/ClassroomContext';
import { WORKSHOP_ROLES } from '../data/defaultJourneys';
import { Printer, ArrowLeft, Ruler, PenTool, MapPin, Sparkles } from 'lucide-react';

export const PrintSlateCards: React.FC = () => {
  const { activeJourney, session, setViewMode } = useClassroom();

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8 bg-stone-50 min-h-screen print:bg-white print:p-0">
      
      {/* Top action bar (hidden during print) */}
      <div className="flex items-center justify-between print:hidden">
        <button
          onClick={() => setViewMode('teacher')}
          className="flex items-center gap-1.5 text-xs font-semibold text-stone-600 hover:text-stone-900"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Teacher Console</span>
        </button>

        <button
          onClick={handlePrint}
          className="flex items-center gap-2 px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-semibold shadow-xs"
        >
          <Printer className="w-4 h-4" />
          <span>Print Blackboard & Slate Cards (PDF)</span>
        </button>
      </div>

      {/* Main Printable Document */}
      <div className="bg-white rounded-2xl border border-stone-200 p-8 sm:p-12 shadow-sm space-y-10 print:border-none print:p-0 print:shadow-none">
        
        {/* Header Brief */}
        <div className="border-b-2 border-stone-900 pb-6 space-y-2">
          <div className="flex items-center justify-between text-xs font-mono text-stone-500 uppercase">
            <span>LeGriot Classroom Slate Pack · Low-Tech Support</span>
            <span>{session.totalStudents} Students · 1 Phone / Group</span>
          </div>
          <h1 className="font-serif text-3xl font-black text-stone-900">
            {activeJourney.title}
          </h1>
          <p className="text-stone-700 text-sm italic font-serif">
            "{activeJourney.coreQuestion}"
          </p>
          <div className="text-xs text-stone-600 flex gap-4 pt-1">
            <span><strong>Culture:</strong> {activeJourney.culture}</span>
            <span><strong>Period:</strong> {activeJourney.period}</span>
            <span><strong>Materials Needed:</strong> {activeJourney.materialsNeeded}</span>
          </div>
        </div>

        {/* Cooperative Roles Assignment Slate Card */}
        <section className="space-y-3">
          <h2 className="font-serif font-bold text-base text-stone-900 uppercase tracking-wider border-b border-stone-300 pb-1">
            Circle Roles for 8 Students
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
            {WORKSHOP_ROLES.map(role => (
              <div key={role.id} className="border border-stone-300 p-3 rounded-lg space-y-1">
                <span className="font-bold text-stone-900 block">{role.title}</span>
                <p className="text-stone-600 text-[11px] leading-tight">{role.shortDescription}</p>
                <div className="pt-2 border-t border-stone-200 text-[10px] text-stone-400">
                  Student Name: ______________
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* The 3 Workshop Cards for Blackboards / Slates */}
        <div className="space-y-8">
          {activeJourney.workshops.map((workshop, idx) => (
            <div
              key={workshop.id}
              className="border-2 border-stone-800 rounded-xl p-6 space-y-4 break-inside-avoid"
            >
              <div className="flex items-center justify-between border-b border-stone-200 pb-2">
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-widest text-stone-500">
                    Station {idx + 1} · {workshop.subject}
                  </span>
                  <h3 className="font-serif font-bold text-xl text-stone-900">
                    {workshop.title}
                  </h3>
                </div>
                <span className="text-xs font-mono text-stone-500">
                  Curriculum: {workshop.curriculumConnection}
                </span>
              </div>

              {/* Hands-On Challenge Box */}
              <div className="bg-stone-50 border border-stone-300 p-4 rounded-lg space-y-1">
                <strong className="text-xs text-stone-900 uppercase tracking-wide block">
                  🛠️ Hands-on Action on Table / Slate:
                </strong>
                <p className="text-xs text-stone-800 leading-relaxed font-medium">
                  {workshop.handsOnChallenge}
                </p>
              </div>

              {/* Investigation Steps */}
              <div className="space-y-1.5 text-xs text-stone-700">
                <strong>Circle Discussion Steps:</strong>
                <ol className="list-decimal list-inside space-y-1 pl-1">
                  {workshop.interactiveSteps.map((step, sIdx) => (
                    <li key={sIdx} className="leading-snug">{step}</li>
                  ))}
                </ol>
              </div>

              {/* Consensus Question */}
              <div className="space-y-2 pt-2 border-t border-stone-200">
                <strong className="text-xs text-stone-900 block">
                  Question for the Circle:
                </strong>
                <p className="text-xs text-stone-800 font-serif italic">
                  {workshop.groupQuestion}
                </p>

                <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                  {workshop.options?.map((opt, oIdx) => (
                    <div key={oIdx} className="border border-stone-300 p-2 rounded flex items-center gap-2">
                      <span className="w-4 h-4 rounded-full border border-stone-400 text-[10px] flex items-center justify-center font-bold">
                        {String.fromCharCode(65 + oIdx)}
                      </span>
                      <span>{opt}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Slate Blank Area for Students to write */}
              <div className="border border-dashed border-stone-400 p-6 rounded-lg text-center text-xs text-stone-400 min-h-[70px] flex items-center justify-center">
                [ Scribe's Chalk Slate Workspace: Calculations, Sketches, and Final Consensus ]
              </div>
            </div>
          ))}
        </div>

        {/* Grand Council Plenary Card */}
        <section className="border-2 border-stone-900 rounded-xl p-6 space-y-3 bg-stone-50 break-inside-avoid">
          <div className="flex items-center justify-between border-b border-stone-300 pb-2">
            <h3 className="font-serif font-bold text-lg text-stone-900 uppercase tracking-wider">
              {activeJourney.plenaryCouncil.title}
            </h3>
            <span className="text-xs font-mono text-stone-500">60-Sec Plenary Speech</span>
          </div>

          <p className="text-xs text-stone-700 leading-relaxed font-serif italic">
            "{activeJourney.plenaryCouncil.finalChallengePrompt}"
          </p>

          <div className="border border-dashed border-stone-400 p-4 rounded text-xs text-stone-400">
            [ Orator's 3 Key Presentation Bullet Points for Class Plenary: 1. Math finding, 2. Writing decree, 3. World map discovery ]
          </div>
        </section>

      </div>
    </div>
  );
};
