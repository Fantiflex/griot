import React from 'react';
import { useClassroom } from '../context/ClassroomContext';
import { Users, Smartphone, Sparkles, ArrowLeft } from 'lucide-react';
import { playRotationCall } from '../utils/audio';
import { NdopBadgeMotif } from './NdopMotifSvg';

export const HeaderNav: React.FC = () => {
  const { viewMode, setViewMode, setIsDemoModalOpen } = useClassroom();

  if (viewMode === 'landing') {
    return (
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-stone-200/80 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Brand Logo */}
            <button
              onClick={() => setViewMode('landing')}
              className="flex items-center gap-2.5 text-left cursor-pointer group"
            >
              <div className="w-9 h-9 rounded-xl bg-stone-900 text-stone-100 flex items-center justify-center font-bold font-serif text-sm shadow-xs group-hover:bg-[#A36B46] transition-colors relative overflow-hidden">
                <NdopBadgeMotif size={20} className="text-[#A36B46] group-hover:text-white transition-colors" />
              </div>
              <span className="font-serif font-black text-xl text-stone-950 tracking-tight">
                LeGriot
              </span>
            </button>

            {/* Single Action Button */}
            <button
              onClick={() => {
                playRotationCall();
                setIsDemoModalOpen(true);
              }}
              className="px-5 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-2 cursor-pointer active:scale-95 group"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#A36B46] group-hover:rotate-12 transition-transform" />
              <span>Try Demo</span>
            </button>
          </div>
        </div>
      </header>
    );
  }

  // Inside app views: clean, minimal 2026 header bar
  return (
    <header className="sticky top-0 z-40 bg-stone-900 text-stone-100 border-b border-stone-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          {/* Logo & return to landing */}
          <button
            onClick={() => setViewMode('landing')}
            className="flex items-center gap-2 text-left cursor-pointer group"
          >
            <div className="w-7 h-7 rounded-lg bg-[#A36B46] text-white flex items-center justify-center font-bold font-serif text-xs">
              <NdopBadgeMotif size={14} className="text-white" />
            </div>
            <span className="font-serif font-black text-base text-white tracking-tight">
              LeGriot
            </span>
          </button>

          <nav className="flex items-center gap-2 text-xs font-medium">
            <button
              onClick={() => setViewMode('landing')}
              className="px-3 py-1.5 rounded-lg text-stone-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer flex items-center gap-1.5 text-xs"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Overview</span>
            </button>

            <div className="h-4 w-px bg-stone-700 mx-1" />

            <button
              onClick={() => setViewMode('group')}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer text-xs font-semibold ${
                viewMode === 'group'
                  ? 'bg-[#A36B46] text-white shadow-xs'
                  : 'text-stone-300 hover:text-white hover:bg-white/10'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Student Experience</span>
            </button>

            <button
              onClick={() => setViewMode('teacher')}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer text-xs font-semibold ${
                viewMode === 'teacher'
                  ? 'bg-stone-100 text-stone-900 shadow-xs'
                  : 'text-stone-300 hover:text-white hover:bg-white/10'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Teacher Dashboard</span>
            </button>
          </nav>
        </div>
      </div>
    </header>
  );
};
