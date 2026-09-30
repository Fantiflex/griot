import React, { useState } from 'react';
import { Smartphone, Check } from 'lucide-react';

export const ClassroomFlowDiagram: React.FC = () => {
  const [activeCircle, setActiveCircle] = useState<number>(4);

  return (
    <div className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-8 space-y-6 shadow-xs">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-200 pb-4">
        <div>
          <span className="text-[10px] font-mono font-bold tracking-widest text-[#A36B46] uppercase">
            Classroom Architecture
          </span>
          <h3 className="font-serif font-black text-2xl text-[#18202F]">
            1 Teacher · 10 Autonomous Collaborative Tables
          </h3>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-auto bg-[#FAF6EC] px-3 py-1.5 rounded-xl border border-[#18202F]/15 text-xs font-mono font-bold text-[#A36B46]">
          <span>Class Setup: 80 Students · 10 Tables of 8 · 1 Phone per Table</span>
        </div>
      </div>

      {/* Visual Architectural Map */}
      <div className="space-y-6">
        
        {/* Top: 1 Teacher Central Console */}
        <div className="bg-[#18202F] text-white p-4 sm:p-5 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-[#A36B46] flex items-center justify-center font-serif font-black text-xl text-white shadow-xs">
              👨🏾‍🏫
            </div>
            <div>
              <div className="text-[10px] font-mono uppercase text-[#A36B46] font-bold tracking-wider">
                Teacher Central Console
              </div>
              <div className="font-serif font-black text-lg text-white">
                One Central Minimalist Overview
              </div>
              <p className="text-xs text-stone-300">
                Supervises all 10 tables in real time. Steps in precisely when a table flags for human guidance.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs font-mono bg-white/10 px-3 py-2 rounded-xl border border-white/10 text-[#EFE6CF] shrink-0">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>10 Tables Active · Real-time Overview</span>
          </div>
        </div>

        {/* Downward Directional Flow Lines */}
        <div className="flex items-center justify-center gap-4 text-xs font-mono text-stone-400 py-1">
          <span>↓ Autonomous Oral Guidance</span>
          <span>•</span>
          <span>↑ Discrete 1-Second Shutter Verification</span>
        </div>

        {/* Center: The 10 Student Circles Grid (8 students per table + 1 phone stand) */}
        <div>
          <div className="flex items-center justify-between text-xs font-mono font-bold text-stone-700 mb-3">
            <span>Classroom Hall (80 Students in 10 Tables of 8):</span>
            <span className="text-[#A36B46]">Select any table to inspect</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {Array.from({ length: 10 }).map((_, idx) => {
              const tableNum = idx + 1;
              const isSelected = activeCircle === tableNum;
              const isNeedHelp = tableNum === 3;
              const isVerified = tableNum === 1 || tableNum === 4 || tableNum === 7;

              return (
                <button
                  key={tableNum}
                  onClick={() => setActiveCircle(tableNum)}
                  className={`p-3 rounded-2xl border text-left transition-all cursor-pointer relative group ${
                    isSelected
                      ? 'bg-[#FAF6EC] border-[#A36B46] shadow-md scale-102 ring-2 ring-[#A36B46]/30'
                      : 'bg-stone-50 border-stone-200 hover:border-stone-400 hover:bg-stone-100'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[11px] font-mono font-bold text-[#18202F]">
                      Table {tableNum}
                    </span>
                    {isNeedHelp ? (
                      <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                    ) : isVerified ? (
                      <Check className="w-3 h-3 text-emerald-600" />
                    ) : (
                      <span className="w-2 h-2 rounded-full bg-amber-400" />
                    )}
                  </div>

                  {/* 8 Student Avatars Dot Cluster */}
                  <div className="flex items-center gap-1 mb-2">
                    <div className="grid grid-cols-4 gap-0.5">
                      {Array.from({ length: 8 }).map((_, sIdx) => (
                        <span
                          key={sIdx}
                          className={`w-1.5 h-1.5 rounded-full ${
                            isSelected ? 'bg-[#A36B46]' : 'bg-stone-400'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-[9px] font-mono text-stone-500 ml-1">8 students</span>
                  </div>

                  {/* Center Shared Phone Indicator */}
                  <div className="flex items-center gap-1 text-[10px] font-mono font-medium text-stone-700 bg-white p-1 rounded-md border border-stone-200">
                    <Smartphone className="w-3 h-3 text-[#A36B46] shrink-0" />
                    <span className="truncate">1 Shared Stand</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Table Deep-Dive: The Local AI Architecture & Student Context */}
        <div className="p-5 rounded-2xl bg-[#F8F3E6] border-2 border-[#18202F]/20 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#18202F]/10 pb-3">
            <div className="flex items-center gap-2">
              <span className="font-serif font-black text-base text-[#18202F]">
                Table {activeCircle} · 8 Students Working on Physical Paper
              </span>
              <span className="text-[10px] font-mono bg-[#18202F] text-white px-2 py-0.5 rounded-md font-bold">
                Local AI Active
              </span>
            </div>
            <span className="text-xs font-mono text-emerald-800 font-bold">
              ✓ Edge Neural Engine · Offline
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            {/* Step A */}
            <div className="bg-white p-3.5 rounded-xl border border-stone-200 space-y-1">
              <div className="font-mono font-bold text-[#A36B46] text-[10px] uppercase">
                A. Contextual Memory
              </div>
              <div className="font-bold text-stone-900">Dedicated Table Context</div>
              <p className="text-[11px] text-stone-600 leading-snug">
                The local model tracks these 8 learners: previous mistakes, speaking turns, and collective drawing pace.
              </p>
            </div>

            {/* Step B */}
            <div className="bg-white p-3.5 rounded-xl border border-stone-200 space-y-1">
              <div className="font-mono font-bold text-[#A36B46] text-[10px] uppercase">
                B. Oral Call & Response
              </div>
              <div className="font-bold text-stone-900">Spoken Riddles, Real Paper</div>
              <p className="text-[11px] text-stone-600 leading-snug">
                The phone speaks aloud with an authentic African accent. Students discuss answers together and write on paper.
              </p>
            </div>

            {/* Step C */}
            <div className="bg-white p-3.5 rounded-xl border border-stone-200 space-y-1">
              <div className="font-mono font-bold text-[#A36B46] text-[10px] uppercase">
                C. Shutter Verification
              </div>
              <div className="font-bold text-stone-900">1-Second Camera Pulse</div>
              <p className="text-[11px] text-stone-600 leading-snug">
                A single overhead photo verifies their geometric construction offline, updating the teacher's dashboard.
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
