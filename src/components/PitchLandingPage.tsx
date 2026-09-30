import React, { useState } from 'react';
import { AfricaMapSvg } from './AfricaMapSvg';
import { useClassroom } from '../context/ClassroomContext';
import { NdopMotifWatermark, NdopBadgeMotif } from './NdopMotifSvg';
import {
  Users,
  Smartphone,
  Sparkles,
  ArrowRight,
  Check,
  X,
  Layers,
  ChevronLeft,
  ChevronRight,
  MessageCircle,
  Brain,
  FileText,
  UserCheck,
} from 'lucide-react';
import { playDjembeBass, playRotationCall } from '../utils/audio';

export const PitchLandingPage: React.FC<{
  onSelectView: (view: 'student' | 'teacher') => void;
}> = ({ onSelectView }) => {
  const { isDemoModalOpen, setIsDemoModalOpen } = useClassroom();

  // Switcher state for the 3 AI visual variations requested by user
  const aiVisuals = [
    {
      id: 1,
      title: 'Target Ring Neural Topology',
      tag: 'Architecture Concept 01',
      src: '/assets/african_neural_network_motif.jpg',
      desc: 'Layered neural network nodes styled after African concentric target motifs connected across weight lines.',
    },
    {
      id: 2,
      title: 'Pattern Synapse Matrix',
      tag: 'Architecture Concept 02',
      src: '/assets/african_neural_nodes.jpg',
      desc: 'Woven knowledge threads interconnecting cultural symbols into neural weights.',
    },
    {
      id: 3,
      title: 'Acoustic Oral Waveform',
      tag: 'Architecture Concept 03',
      src: '/assets/african_oral_ai.jpg',
      desc: 'Harmonic oral speech frequencies integrated into low-power on-device chips.',
    },
  ];

  const [activeVisualIndex, setActiveVisualIndex] = useState(0);

  const handleOpenDemoModal = () => {
    playRotationCall();
    setIsDemoModalOpen(true);
  };

  const handleCloseDemoModal = () => {
    playDjembeBass();
    setIsDemoModalOpen(false);
  };

  return (
    <div className="relative min-h-screen bg-[#FAFAF8] text-stone-900 overflow-x-hidden font-sans selection:bg-[#A36B46] selection:text-white">
      
      {/* 1. HERO SECTION WITH VECTOR AFRICA MAP */}
      <section className="relative px-5 sm:px-8 pt-12 sm:pt-20 pb-16 overflow-hidden border-b border-stone-200/80">
        
        {/* Full Continent Africa Vector Map: Clean, visible, scrolls with page */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0 overflow-hidden">
          <AfricaMapSvg
            className="w-[600px] sm:w-[760px] md:w-[880px] h-[600px] sm:h-[760px] md:h-[880px] transition-transform duration-700 ease-out"
            opacity={0.22}
            highlightCameroon={false}
          />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 max-w-4xl mx-auto text-center space-y-7">
          <h1 className="font-serif font-black text-4xl sm:text-6xl lg:text-7xl text-stone-950 tracking-tight leading-[1.08]">
            15 Million Teachers Missing.<br />
            <span className="text-[#A36B46] italic font-serif">1 Billion African Youth Rising.</span>
          </h1>

          <p className="text-base sm:text-lg text-stone-700 max-w-2xl mx-auto leading-relaxed">
            In classrooms of <strong>50 to 80+ students</strong> where a single teacher cannot attend to every child, 
            LeGriot orchestrates autonomous student tables using <strong>1 smartphone per 8 students</strong> and an on-device AI built specifically on African oral and cultural knowledge.
          </p>

          {/* Primary CTA */}
          <div className="pt-2 flex justify-center">
            <button
              onClick={handleOpenDemoModal}
              className="px-8 py-4 bg-stone-950 hover:bg-stone-800 text-white rounded-2xl font-bold text-sm tracking-wide transition-all shadow-md hover:shadow-lg flex items-center gap-3 cursor-pointer active:scale-95 group"
            >
              <Sparkles className="w-4 h-4 text-[#A36B46] group-hover:rotate-12 transition-transform" />
              <span>Try Demo</span>
              <ArrowRight className="w-4 h-4 text-[#A36B46] group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </section>

      {/* 2. KEY FIGURES (Modern Light Cards, Vibrant Colors, Crisp Data) */}
      <section className="py-12 px-4 sm:px-6 max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Card 1: Teachers Deficit (Rose) */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-rose-100 shadow-xs hover:shadow-md transition-all space-y-3 relative overflow-hidden group">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-rose-600 bg-rose-50 px-2.5 py-1 rounded-lg">
                Critical Shortage
              </span>
              <span className="text-[11px] font-mono text-stone-400">UNESCO 2024</span>
            </div>
            <div className="font-serif font-black text-4xl sm:text-5xl text-rose-500 tracking-tight">
              15 Million
            </div>
            <div className="font-bold text-sm text-stone-900">
              Teachers Missing in Africa by 2030
            </div>
            <p className="text-xs text-stone-500 leading-relaxed">
              1/3 of the entire global deficit. Overcrowded classrooms of 50 to 80+ pupils per teacher.
            </p>
          </div>

          {/* Card 2: Demographic Boom (Amber) */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-amber-100 shadow-xs hover:shadow-md transition-all space-y-3 relative overflow-hidden group">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-amber-700 bg-amber-50 px-2.5 py-1 rounded-lg">
                Demographics
              </span>
              <span className="text-[11px] font-mono text-stone-400">UNICEF 2050</span>
            </div>
            <div className="font-serif font-black text-4xl sm:text-5xl text-amber-500 tracking-tight">
              1 Billion
            </div>
            <div className="font-bold text-sm text-stone-900">
              African Children Under 18 by 2050
            </div>
            <p className="text-xs text-stone-500 leading-relaxed">
              1 in every 3 children on Earth will live in Africa. The decisive educational challenge of this century.
            </p>
          </div>

          {/* Card 3: 1:8 Efficiency Ratio (Emerald) */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-emerald-100 shadow-xs hover:shadow-md transition-all space-y-3 relative overflow-hidden group">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg">
                Hardware Efficiency
              </span>
              <span className="text-[11px] font-mono text-stone-400">LeGriot Ratio</span>
            </div>
            <div className="font-serif font-black text-4xl sm:text-5xl text-emerald-600 tracking-tight">
              1 : 8 Ratio
            </div>
            <div className="font-bold text-sm text-stone-900">
              1 Everyday Smartphone for 8 Students
            </div>
            <p className="text-xs text-stone-500 leading-relaxed">
              Equips an entire 80-student classroom with 10 existing phones (~$3/student vs $200 1:1 tablets).
            </p>
          </div>

        </div>

        <div className="text-center text-xs font-mono text-stone-400 pt-4">
          Data verified: <em>UNESCO Global Report on Teachers</em> • <em>UNICEF Generation 2030 Africa</em>
        </div>
      </section>

      {/* 3. THE CORE SOLUTION: BUILT ON AFRICAN ORAL & CULTURAL KNOWLEDGE + 8 STUDENTS ON REAL PAPER */}
      <section className="py-12 sm:py-16 px-4 sm:px-6 max-w-6xl mx-auto space-y-10">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-stone-100 text-[#A36B46] text-xs font-mono font-bold uppercase tracking-wider">
            <NdopBadgeMotif size={14} className="text-[#A36B46]" />
            <span>The Core Solution</span>
          </div>
          <h2 className="font-serif font-black text-3xl sm:text-4xl text-stone-950 tracking-tight">
            An AI Built for African Knowledge Systems
          </h2>
          <p className="text-sm text-stone-600 leading-relaxed">
            Not a generic Western LLM with a prompt wrapper, but an AI model developed natively in its neural architecture and training dataset on African oral and cultural knowledge.
          </p>
        </div>

        {/* The Two Main Pillars */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
          
          {/* Pillar 1: Native Local AI with Multi-Concept Gallery Switcher */}
          <div className="bg-white rounded-3xl border border-stone-200/90 p-6 sm:p-8 flex flex-col justify-between space-y-6 shadow-xs hover:shadow-md transition-shadow relative overflow-hidden">
            <NdopMotifWatermark className="absolute -right-10 -bottom-10 w-64 h-32 text-stone-900" opacity={0.04} />
            
            <div className="space-y-4">
              {/* Interactive Visual Switcher for the Neural Model Concept Art */}
              <div className="space-y-2">
                <div className="rounded-2xl overflow-hidden border border-stone-200 bg-stone-950 h-56 relative group">
                  <img
                    src={aiVisuals[activeVisualIndex].src}
                    alt={aiVisuals[activeVisualIndex].title}
                    className="w-full h-full object-cover transition-opacity duration-300"
                  />
                  <div className="absolute top-3 left-3 bg-stone-900/80 backdrop-blur-md px-2.5 py-1 rounded-lg border border-white/10 text-[10px] font-mono text-[#EFE6CF] font-bold">
                    {aiVisuals[activeVisualIndex].tag}
                  </div>
                  <div className="absolute bottom-3 left-3 right-3 bg-stone-950/85 backdrop-blur-md p-2.5 rounded-xl border border-white/15 text-xs text-stone-200 flex items-center justify-between">
                    <span className="truncate font-medium">{aiVisuals[activeVisualIndex].desc}</span>
                    <span className="text-[10px] font-mono text-[#A36B46] shrink-0 ml-2 font-bold">
                      {activeVisualIndex + 1} / {aiVisuals.length}
                    </span>
                  </div>
                </div>

                {/* Concept Variation Switcher Buttons */}
                <div className="flex items-center justify-between gap-1.5 pt-1">
                  <span className="text-[11px] font-mono text-stone-500 font-semibold">Visual variations:</span>
                  <div className="flex items-center gap-1.5">
                    {aiVisuals.map((visual, idx) => (
                      <button
                        key={visual.id}
                        onClick={() => setActiveVisualIndex(idx)}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-mono transition-all cursor-pointer ${
                          activeVisualIndex === idx
                            ? 'bg-stone-900 text-white font-bold shadow-2xs'
                            : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                        }`}
                      >
                        V{visual.id}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <span className="text-xs font-mono text-[#A36B46] font-bold uppercase tracking-wider">
                  African Neural Architecture
                </span>
                <h3 className="font-serif font-black text-2xl text-stone-950 mt-1">
                  Trained by Local African Universities
                </h3>
              </div>

              <p className="text-xs sm:text-sm text-stone-600 leading-relaxed font-normal">
                Models are developed and trained directly by local African universities and national institutions. Each country and university shapes its models around its pedagogical traditions, local languages, and cultural knowledge systems.
              </p>

              <div className="grid grid-cols-2 gap-2 pt-1 text-xs">
                <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-200/80 font-normal text-stone-700">
                  ✓ Trained by Local African Universities
                </div>
                <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-200/80 font-normal text-stone-700">
                  ✓ Governed by National Curricula
                </div>
              </div>
            </div>
          </div>

          {/* Pillar 2: 8 Students, 1 Phone, Real Paper */}
          <div className="bg-white rounded-3xl border border-stone-200/90 p-6 sm:p-8 flex flex-col justify-between space-y-6 shadow-xs hover:shadow-md transition-shadow relative overflow-hidden">
            <NdopMotifWatermark className="absolute -right-10 -bottom-10 w-64 h-32 text-stone-900" opacity={0.04} />
            
            <div className="space-y-4">
              <div className="rounded-2xl overflow-hidden border border-stone-200 shadow-xs h-56 bg-stone-900">
                <img
                  src="/assets/students_circle_griot.jpg"
                  alt="8 students sitting in a circle around 1 phone on real paper"
                  className="w-full h-full object-cover"
                />
              </div>

              <div>
                <span className="text-xs font-mono text-[#A36B46] font-bold uppercase tracking-wider">
                  Collaborative Tactile Learning
                </span>
                <h3 className="font-serif font-black text-2xl text-stone-950 mt-1">
                  Collective Peer Reasoning on Real Paper
                </h3>
              </div>

              <p className="text-xs sm:text-sm text-stone-600 leading-relaxed font-normal">
                A single shared device serves the entire student table, keeping children focused on pens, rulers, and paper notebooks. Students debate conjectures face-to-face, verify geometric constructions collectively, and learn as a cohesive group.
              </p>

              <div className="grid grid-cols-2 gap-2 pt-1 text-xs">
                <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-200/80 font-normal text-stone-700">
                  ✓ Tangible physical notebooks
                </div>
                <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-200/80 font-normal text-stone-700">
                  ✓ Social peer reasoning
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* 4. THE THREE FOUNDATIONAL TENETS (High Substance & Depth) */}
      <section className="py-12 sm:py-16 px-4 sm:px-6 max-w-6xl mx-auto space-y-8">
        <div className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-10 shadow-xs space-y-8">
          
          <div className="border-b border-stone-200 pb-6 max-w-2xl">
            <span className="text-xs font-mono text-[#A36B46] font-bold uppercase tracking-wider">
              Pedagogical Foundation
            </span>
            <h3 className="font-serif font-black text-2xl sm:text-3xl text-stone-950 mt-1">
              Three Pillars of the LeGriot Method
            </h3>
            <p className="text-xs sm:text-sm text-stone-600 mt-1 leading-relaxed">
              Designed for classroom realities where deep human learning thrives through collective conversation, oral rhythm, and teacher leadership.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Tenet 1: Collective Peer Reasoning */}
            <div className="p-6 rounded-2xl bg-stone-50 border border-stone-200/90 space-y-3.5 flex flex-col justify-between hover:bg-stone-100/60 transition-colors">
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-xl bg-stone-900 text-white flex items-center justify-center shadow-2xs">
                  <Brain className="w-5 h-5 text-[#A36B46]" />
                </div>
                <h4 className="font-serif font-black text-lg text-stone-950">
                  Collective Peer Reasoning
                </h4>
                <p className="text-xs text-stone-600 leading-relaxed font-normal">
                  Knowledge is forged through social discourse. In pods of 8, students debate conjectures, defend mathematical steps, and resolve errors collaboratively. Real paper grounds tangible spatial memory, preventing the cognitive passivity of solitary screen tapping.
                </p>
              </div>

              <div className="pt-2 text-[11px] font-mono text-stone-500 border-t border-stone-200">
                Peer debate · Spatial reasoning
              </div>
            </div>

            {/* Tenet 2: Voice-Guided Instruction */}
            <div className="p-6 rounded-2xl bg-stone-50 border border-stone-200/90 space-y-3.5 flex flex-col justify-between hover:bg-stone-100/60 transition-colors">
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-xl bg-stone-900 text-white flex items-center justify-center shadow-2xs">
                  <MessageCircle className="w-5 h-5 text-[#A36B46]" />
                </div>
                <h4 className="font-serif font-black text-lg text-stone-950">
                  Voice-Guided Instruction
                </h4>
                <p className="text-xs text-stone-600 leading-relaxed font-normal">
                  Anchored in Africa's rich heritage of oral pedagogy. Rather than parsing dense digital menus, the whole table listens to the instructor's spoken voice. The AI asks Socratic riddles, provides timely verbal cues, and keeps all eight peers united in rhythmic attention.
                </p>
              </div>

              <div className="pt-2 text-[11px] font-mono text-stone-500 border-t border-stone-200">
                Oral tradition · Socratic dialogue
              </div>
            </div>

            {/* Tenet 3: Augmenting the Teacher */}
            <div className="p-6 rounded-2xl bg-stone-50 border border-stone-200/90 space-y-3.5 flex flex-col justify-between hover:bg-stone-100/60 transition-colors">
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-xl bg-stone-900 text-white flex items-center justify-center shadow-2xs">
                  <UserCheck className="w-5 h-5 text-[#A36B46]" />
                </div>
                <h4 className="font-serif font-black text-lg text-stone-950">
                  Augmenting the Teacher
                </h4>
                <p className="text-xs text-stone-600 leading-relaxed font-normal">
                  The AI handles routine mechanical facilitation and pacing at each table. The human teacher monitors all 10 collaborative tables at a glance, intervening with empathy, personalized coaching, and deep pedagogical guidance.
                </p>
              </div>

              <div className="pt-2 text-[11px] font-mono text-stone-500 border-t border-stone-200">
                Human Teacher Guidance · Targeted Interventions
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* 5. BOTTOM CTA: TRY DEMO */}
      <section className="py-12 pb-20 px-4 sm:px-6 max-w-4xl mx-auto text-center">
        <div className="p-8 sm:p-12 rounded-3xl bg-stone-950 text-white space-y-6 shadow-xl relative overflow-hidden">
          <NdopMotifWatermark className="absolute -right-10 -bottom-10 w-80 h-40 text-stone-800" opacity={0.15} />

          <div className="relative z-10 space-y-2">
            <h3 className="font-serif font-black text-2xl sm:text-4xl text-white">
              Experience the Classroom in Action
            </h3>
            <p className="text-xs sm:text-sm text-stone-400 max-w-md mx-auto">
              Test the student geometry session guided by the instructor, or explore the teacher's real-time supervision dashboard.
            </p>
          </div>

          <div className="relative z-10 pt-2 flex justify-center">
            <button
              onClick={handleOpenDemoModal}
              className="px-8 py-4 bg-[#A36B46] hover:bg-[#8C5332] text-white font-bold text-sm rounded-2xl transition-all shadow-md inline-flex items-center gap-3 cursor-pointer active:scale-95 group"
            >
              <Sparkles className="w-4 h-4 text-white group-hover:rotate-12 transition-transform" />
              <span>Try Demo</span>
              <ArrowRight className="w-4 h-4 text-white group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </section>

      {/* TRY DEMO MODAL (2-Perspective Selector) */}
      <div
        className={`fixed inset-0 z-50 bg-stone-950/80 backdrop-blur-md text-stone-100 transition-all duration-300 flex items-center justify-center p-4 sm:p-6 ${
          isDemoModalOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      >
        <div className="bg-stone-900 border border-stone-800 rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl relative">
          
          {/* Header */}
          <div className="flex items-center justify-between border-b border-stone-800 pb-4">
            <div className="flex items-center gap-2">
              <NdopBadgeMotif size={16} className="text-[#A36B46]" />
              <span className="font-mono text-xs font-bold uppercase tracking-wider text-stone-300">
                Choose Demonstration View
              </span>
            </div>

            <button
              onClick={handleCloseDemoModal}
              className="p-1.5 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Perspective Options */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Student Experience */}
            <button
              onClick={() => {
                handleCloseDemoModal();
                onSelectView('student');
              }}
              className="p-5 rounded-2xl bg-stone-800/80 hover:bg-stone-800 border-2 border-stone-700 hover:border-[#A36B46] text-left transition-all space-y-3 cursor-pointer group active:scale-98"
            >
              <div className="w-10 h-10 rounded-xl bg-[#A36B46]/20 border border-[#A36B46]/40 flex items-center justify-center text-[#A36B46] group-hover:bg-[#A36B46] group-hover:text-white transition-colors">
                <Smartphone className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-serif font-black text-lg text-white">
                  Student Experience
                </h4>
                <p className="text-xs text-stone-400 mt-1 leading-relaxed">
                  Interactive geometry timeline on royal Ndop motifs. Voice guidance from the floating instructor and 1-second overhead photo verification.
                </p>
              </div>
              <div className="pt-2 text-xs font-bold text-[#A36B46] flex items-center gap-1">
                <span>Enter Workshop</span>
                <span className="group-hover:translate-x-1 transition-transform">→</span>
              </div>
            </button>

            {/* Teacher Dashboard */}
            <button
              onClick={() => {
                handleCloseDemoModal();
                onSelectView('teacher');
              }}
              className="p-5 rounded-2xl bg-stone-800/80 hover:bg-stone-800 border-2 border-stone-700 hover:border-stone-400 text-left transition-all space-y-3 cursor-pointer group active:scale-98"
            >
              <div className="w-10 h-10 rounded-xl bg-stone-700/40 border border-stone-600 flex items-center justify-center text-stone-300 group-hover:bg-stone-100 group-hover:text-stone-900 transition-colors">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-serif font-black text-lg text-white">
                  Teacher Dashboard
                </h4>
                <p className="text-xs text-stone-400 mt-1 leading-relaxed">
                  Live orchestration of all 10 classroom tables. Real curriculum exercises, instant status of snapshots, and assistance alerts.
                </p>
              </div>
              <div className="pt-2 text-xs font-bold text-stone-300 flex items-center gap-1">
                <span>Open Dashboard</span>
                <span className="group-hover:translate-x-1 transition-transform">→</span>
              </div>
            </button>

          </div>
        </div>
      </div>

    </div>
  );
};
