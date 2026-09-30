import React, { useState } from 'react';
import { Camera, BatteryCharging, Users, Cpu, Lock, Sparkles, Check, Smartphone, Layers } from 'lucide-react';

export const HardwareStandGriot: React.FC<{ className?: string }> = ({ className = '' }) => {
  const [activeTab, setActiveTab] = useState<'group' | 'stand'>('group');

  return (
    <div className={`relative bg-[#FAF6EC] rounded-3xl border-2 border-[#18202F] p-6 sm:p-8 shadow-md overflow-hidden ${className}`}>
      {/* Top Banner Tag */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#18202F]/15 pb-4 mb-6">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#A36B46] animate-pulse" />
          <span className="font-mono text-xs font-bold uppercase tracking-wider text-[#18202F]">
            The Hardware Anchor · Everyday Phone + Collective Table Arch
          </span>
        </div>
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300 text-[11px] font-mono font-bold">
          <Lock className="w-3 h-3 text-emerald-800" />
          <span>Passive Arch · Zero Electronics in Stand · 100% Local Phone Processing</span>
        </div>
      </div>

      {/* Main Dual Showcase Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* LEFT: Tabbed Visual Showcase (1. 8-Student Table Pod with Griot on Screen, 2. Technical Stand Architecture) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Sub-tabs to easily switch between the group reality photo and the stand schematic */}
          <div className="flex items-center gap-2 bg-[#F3ECE0] p-1.5 rounded-2xl border border-stone-300/80">
            <button
              onClick={() => setActiveTab('group')}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                activeTab === 'group'
                  ? 'bg-[#18202F] text-white shadow-xs'
                  : 'text-stone-700 hover:text-stone-900 hover:bg-white/40'
              }`}
            >
              <Users className="w-3.5 h-3.5 text-[#A36B46]" />
              <span>8-Student Circle Around Stand</span>
            </button>
            <button
              onClick={() => setActiveTab('stand')}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                activeTab === 'stand'
                  ? 'bg-[#18202F] text-white shadow-xs'
                  : 'text-stone-700 hover:text-stone-900 hover:bg-white/40'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5 text-[#A36B46]" />
              <span>Stand Ergonomics & Camera</span>
            </button>
          </div>

          {/* Visual Container */}
          <div className="bg-[#FDFBF7] rounded-2xl border-2 border-[#18202F] p-3 sm:p-5 shadow-inner relative overflow-hidden">
            {activeTab === 'group' ? (
              <div className="space-y-3">
                <div className="relative rounded-xl overflow-hidden border border-stone-300 shadow-sm bg-stone-900">
                  <img
                    src="/assets/students_circle_griot.jpg"
                    alt="8 African students in a collaborative circle with the tabletop stand and speaking AI instructor on screen"
                    className="w-full h-[320px] sm:h-[380px] object-cover select-none"
                  />
                  {/* Floating callout on photo */}
                  <div className="absolute bottom-3 left-3 right-3 bg-[#18202F]/90 backdrop-blur-md text-[#EFE6CF] p-2.5 rounded-xl border border-white/20 text-xs flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                      <span className="font-mono font-bold text-[11px]">Center Pod: 8 Peers · 1 Phone · 0 Headsets</span>
                    </div>
                    <span className="text-[10px] font-mono text-[#A36B46] font-bold uppercase hidden sm:inline">
                      Collective Synergy
                    </span>
                  </div>
                </div>

                <div className="p-3 bg-white rounded-xl border border-stone-200 text-xs text-stone-700 leading-relaxed">
                  <strong className="text-[#18202F]">Collaborative Peer Dynamic:</strong> The phone is anchored at eye-level in the center of the table. Students debate and solve geometric problems together on physical paper. When they ask for guidance, the AI Instructor speaks aloud for the entire table.
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="relative rounded-xl overflow-hidden border border-stone-300 shadow-sm bg-stone-100 flex items-center justify-center">
                  <img
                    src="/assets/hardware_stand.jpg"
                    alt="LeGriot Tabletop Educational Stand Architecture"
                    className="w-full h-[320px] sm:h-[380px] object-contain select-none p-2"
                  />
                </div>

                {/* 4 Architectural Callouts */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] font-mono">
                  <div className="p-2.5 rounded-xl bg-white border border-stone-200 text-stone-800 shadow-xs flex items-start gap-2">
                    <span className="text-[#A36B46] font-bold">01.</span>
                    <span><strong>Screen:</strong> Asks questions, poses riddles, never reveals direct answers.</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white border border-stone-200 text-stone-800 shadow-xs flex items-start gap-2">
                    <span className="text-[#A36B46] font-bold">02.</span>
                    <span><strong>Overhead Camera:</strong> 1-second shutter snapshot analyzes paper angles.</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white border border-stone-200 text-stone-800 shadow-xs flex items-start gap-2">
                    <span className="text-[#A36B46] font-bold">03.</span>
                    <span><strong>Tabletop Arch:</strong> Straddles notebook cleanly so all 8 peers write freely.</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white border border-stone-200 text-stone-800 shadow-xs flex items-start gap-2">
                    <span className="text-[#A36B46] font-bold">04.</span>
                    <span><strong>Real Paper & Chalk:</strong> Zero touchscreens to break, zero battery drain.</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT: Technical Context & Black-Centered Frugal Principles */}
        <div className="lg:col-span-5 space-y-4 text-left">
          <div>
            <div className="text-[10px] font-mono uppercase font-bold tracking-widest text-[#A36B46]">
              Designed For African Realities
            </div>
            <h3 className="font-serif font-black text-2xl text-[#18202F] leading-tight mt-1">
              Low-Power Hardware.<br />Black-Centered Local AI.
            </h3>
          </div>

          <p className="text-xs sm:text-sm text-stone-700 leading-relaxed font-normal">
            Western ed-tech models impose $600 tablets, continuous cloud connectivity, and air-conditioned rooms. 
            LeGriot is built for the actual field: <strong>intermittent power, high ambient temperatures, and 50–80 students per classroom</strong>.
          </p>

          <div className="space-y-2.5 pt-1 text-xs">
            <div className="p-3 bg-white rounded-xl border border-[#18202F]/15 flex items-start gap-3 shadow-xs">
              <div className="w-8 h-8 rounded-lg bg-[#FAF6EC] border border-[#A36B46]/30 flex items-center justify-center text-[#A36B46] shrink-0 mt-0.5">
                <Smartphone className="w-4 h-4" />
              </div>
              <div>
                <div className="font-bold text-[#18202F]">Leverages Ubiquitous Phones</div>
                <div className="text-[11px] text-stone-600 leading-snug mt-0.5">
                  Africa already has hundreds of millions of standard Android smartphones. No need for specialized imports—schools or teachers utilize existing everyday devices placed on a $2 local wooden stand.
                </div>
              </div>
            </div>

            <div className="p-3 bg-white rounded-xl border border-[#18202F]/15 flex items-start gap-3 shadow-xs">
              <div className="w-8 h-8 rounded-lg bg-[#FAF6EC] border border-[#18202F]/30 flex items-center justify-center text-[#18202F] shrink-0 mt-0.5">
                <BatteryCharging className="w-4 h-4" />
              </div>
              <div>
                <div className="font-bold text-[#18202F]">Discrete 1-Sec Shutter (Zero Video Thermal Throttling)</div>
                <div className="text-[11px] text-stone-600 leading-snug mt-0.5">
                  Continuous video streaming depletes phone battery in under 45 minutes and overheats in 35°C classrooms. LeGriot only triggers the camera for a 1-second still snapshot when students tap "Verify".
                </div>
              </div>
            </div>

            <div className="p-3 bg-white rounded-xl border border-[#18202F]/15 flex items-start gap-3 shadow-xs">
              <div className="w-8 h-8 rounded-lg bg-[#FAF6EC] border border-[#A36B46]/30 flex items-center justify-center text-[#A36B46] shrink-0 mt-0.5">
                <Cpu className="w-4 h-4" />
              </div>
              <div>
                <div className="font-bold text-[#18202F]">Lightweight Edge SLMs (Zero Cloud Tokens)</div>
                <div className="text-[11px] text-stone-600 leading-snug mt-0.5">
                  Instead of giant, energy-draining cloud models burning expensive bandwidth, LeGriot deploys small, culturally fine-tuned models running 100% on the device.
                </div>
              </div>
            </div>

            <div className="p-3 bg-white rounded-xl border border-[#18202F]/15 flex items-start gap-3 shadow-xs">
              <div className="w-8 h-8 rounded-lg bg-[#FAF6EC] border border-emerald-600/30 flex items-center justify-center text-emerald-800 shrink-0 mt-0.5">
                <Users className="w-4 h-4" />
              </div>
              <div>
                <div className="font-bold text-[#18202F]">Supports the Teacher, Never Replaces Them</div>
                <div className="text-[11px] text-stone-600 leading-snug mt-0.5">
                  The teacher directs the classroom with targeted 1-on-1 human guidance. The local tutor handles repetitive verifications and pacing.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
