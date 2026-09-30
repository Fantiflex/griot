/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ClassroomProvider, useClassroom } from './context/ClassroomContext';
import { HeaderNav } from './components/HeaderNav';
import { PitchLandingPage } from './components/PitchLandingPage';
import { StudentToghuNdopView } from './components/StudentToghuNdopView';
import { TeacherMinimalDashboard } from './components/TeacherMinimalDashboard';

const AppContent: React.FC = () => {
  const { viewMode, setViewMode } = useClassroom();

  return (
    <div className="min-h-screen bg-[#FAFAF8] text-stone-900 flex flex-col font-sans">
      <HeaderNav />
      <main className="flex-1">
        {viewMode === 'landing' ? (
          <PitchLandingPage
            onSelectView={(target) => setViewMode(target === 'student' ? 'group' : 'teacher')}
          />
        ) : viewMode === 'group' ? (
          <StudentToghuNdopView onBackToSelection={() => setViewMode('landing')} />
        ) : viewMode === 'teacher' ? (
          <TeacherMinimalDashboard onBackToSelection={() => setViewMode('landing')} />
        ) : (
          <PitchLandingPage
            onSelectView={(target) => setViewMode(target === 'student' ? 'group' : 'teacher')}
          />
        )}
      </main>

      <footer className="border-t border-stone-200/80 bg-white py-5 px-4 text-xs text-stone-500">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span className="font-serif font-black text-stone-900 text-sm">
            LeGriot
          </span>
          <span className="text-stone-400 text-xs">
            © 2026 LeGriot. All rights reserved.
          </span>
        </div>
      </footer>
    </div>
  );
};

export default function App() {
  return (
    <ClassroomProvider>
      <AppContent />
    </ClassroomProvider>
  );
}
