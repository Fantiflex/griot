import React, { useEffect, useState } from 'react';
import type { Lang } from '@shared/types';
import { useHashRoute } from '@/lib/realtime';
import { Home } from '@/views/Home';
import { TeacherConsole } from '@/views/TeacherConsole';
import { GroupPhone } from '@/views/GroupPhone';
import { PitchLandingPage } from '@/components/PitchLandingPage';

/**
 * Routage par hash, pour survivre aux rechargements et aux liens partagés :
 *   #/                 accueil
 *   #/prof             créer ou reprendre une classe
 *   #/prof/CODE        console enseignant
 *   #/groupe           rejoindre
 *   #/groupe/CODE/g1   téléphone de groupe
 *   #/pitch            présentation investisseurs
 */
export default function App() {
  const [route, navigate] = useHashRoute();
  const [lang, setLang] = useState<Lang>(() => {
    try {
      return (localStorage.getItem('legriot_ui_lang') as Lang) || 'fr';
    } catch {
      return 'fr';
    }
  });
  useEffect(() => {
    try {
      localStorage.setItem('legriot_ui_lang', lang);
    } catch {
      /* stockage indisponible */
    }
  }, [lang]);

  const [section, a, b] = route;

  if (section === 'prof') return <TeacherConsole code={a?.toUpperCase()} lang={lang} navigate={navigate} />;
  if (section === 'groupe') return <GroupPhone code={a?.toUpperCase()} groupId={b} lang={lang} navigate={navigate} />;
  if (section === 'pitch') {
    return (
      <div>
        <div className="h-12 border-b border-line bg-surface text-sm px-6 flex items-center justify-between">
          <button onClick={() => navigate([])} className="btn btn-ghost px-2 -ml-2">← LeGriot</button>
          <span className="text-muted text-xs">Présentation investisseurs (version pitch)</span>
        </div>
        <PitchLandingPage onSelectView={(v) => navigate([v === 'teacher' ? 'prof' : 'groupe'])} />
      </div>
    );
  }
  return <Home navigate={navigate} lang={lang} setLang={setLang} />;
}
