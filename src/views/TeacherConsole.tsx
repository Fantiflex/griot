import React, { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, ArrowRight, Check, Download, Pause, Play, Smartphone, X, ExternalLink } from 'lucide-react';
import { LANG_LABELS, SUBJECT_LABELS, t, type ClassroomState, type GroupState, type Journey, type Lang, type RoleType, type StandAction, ROLE_LABELS } from '@shared/types';
import { api } from '@/lib/api';
import { useRealtime } from '@/lib/realtime';
import { ui, phaseLabel } from '@/lib/i18n';
import { StandWidget } from '@/components/StandWidget';
import { Logo } from '@/components/Logo';

/* ================= En-tête commun ================= */

const TopBar: React.FC<{ onBack: () => void; right?: React.ReactNode; children?: React.ReactNode }> = ({ onBack, right, children }) => (
  <header className="h-14 border-b border-line bg-surface/80 backdrop-blur sticky top-0 z-30">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 h-full flex items-center gap-4">
      <button onClick={onBack} className="btn btn-ghost px-2 -ml-2" aria-label="Retour"><ArrowLeft className="w-4 h-4" /></button>
      <Logo size={22} accent="var(--color-accent)" />
      <div className="flex-1 min-w-0 flex items-center gap-3 text-sm text-ink-2">{children}</div>
      <div className="flex items-center gap-2">{right}</div>
    </div>
  </header>
);

/* ================= Création / reprise ================= */

const CreateOrResume: React.FC<{ lang: Lang; onOpen: (code: string) => void; onBack: () => void }> = ({ lang, onOpen, onBack }) => {
  const [journeys, setJourneys] = useState<Journey[]>([]);
  const [existing, setExisting] = useState<{ code: string; name: string; lang: Lang; rotation: number; groups: number }[]>([]);
  const [form, setForm] = useState({ name: '', lang, journeyId: '', groupCount: 6, studentsPerGroup: 8, rotationMinutes: 35 });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [code, setCode] = useState('');

  useEffect(() => {
    api.journeys().then((j) => {
      setJourneys(j);
      setForm((f) => ({ ...f, journeyId: j[0]?.id ?? '' }));
    });
    api.listClassrooms().then(setExisting).catch(() => {});
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const c = await api.createClassroom(form);
      onOpen(c.code);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg">
      <TopBar onBack={onBack}>{ui('teacherEntry', lang)}</TopBar>
      <div className="max-w-4xl mx-auto px-6 py-12 grid md:grid-cols-5 gap-12">
        <form onSubmit={submit} className="md:col-span-3 space-y-5">
          <h1 className="text-2xl font-semibold">{ui('createClass', lang)}</h1>
          <div>
            <label className="label">{ui('className', lang)}</label>
            <input className="field" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="6e B" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">{ui('language', lang)}</label>
              <select className="field" value={form.lang} onChange={(e) => setForm({ ...form, lang: e.target.value as Lang })}>
                {(Object.keys(LANG_LABELS) as Lang[]).map((l) => <option key={l} value={l}>{LANG_LABELS[l]}</option>)}
              </select>
            </div>
            <div>
              <label className="label">{ui('journey', lang)}</label>
              <select className="field" value={form.journeyId} onChange={(e) => setForm({ ...form, journeyId: e.target.value })}>
                {journeys.map((j) => <option key={j.id} value={j.id}>{t(j.title, form.lang)}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="label">{ui('groupCount', lang)}</label>
              <input type="number" min={1} max={10} className="field" value={form.groupCount} onChange={(e) => setForm({ ...form, groupCount: Number(e.target.value) })} />
            </div>
            <div>
              <label className="label">{ui('studentsPerGroup', lang)}</label>
              <input type="number" min={2} max={12} className="field" value={form.studentsPerGroup} onChange={(e) => setForm({ ...form, studentsPerGroup: Number(e.target.value) })} />
            </div>
            <div>
              <label className="label">{ui('rotationMinutes', lang)}</label>
              <input type="number" min={5} max={120} className="field" value={form.rotationMinutes} onChange={(e) => setForm({ ...form, rotationMinutes: Number(e.target.value) })} />
            </div>
          </div>
          {error && <p className="text-sm text-danger">{error}</p>}
          <button disabled={busy} className="btn btn-primary w-full py-3">{ui('createClass', lang)}</button>
        </form>

        <div className="md:col-span-2 space-y-4">
          <h2 className="text-lg font-semibold">{ui('resumeClass', lang)}</h2>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (code.trim()) onOpen(code.trim().toUpperCase());
            }}
            className="flex gap-2"
          >
            <input className="field font-mono uppercase tracking-widest" value={code} onChange={(e) => setCode(e.target.value)} placeholder="ABC123" maxLength={6} />
            <button className="btn btn-outline">OK</button>
          </form>
          <ul className="divide-y divide-line card">
            {existing.length === 0 && <li className="px-4 py-3 text-sm text-muted">—</li>}
            {existing.map((c) => (
              <li key={c.code}>
                <button onClick={() => onOpen(c.code)} className="w-full text-left px-4 py-3 hover:bg-bg flex items-center justify-between text-sm">
                  <span><span className="font-mono font-medium">{c.code}</span> <span className="text-ink-2 ml-2">{c.name}</span></span>
                  <span className="text-xs text-muted">{LANG_LABELS[c.lang]} · {c.groups}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

/* ================= Tableau de bord ================= */

function useTicker(ms = 1000) {
  const [, setN] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setN((n) => n + 1), ms);
    return () => clearInterval(id);
  }, [ms]);
}

function fmt(ms: number) {
  const s = Math.max(0, Math.floor(ms / 1000));
  return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
}

const PHASE_PILL: Record<string, string> = {
  idle: 'bg-bg text-muted border border-line',
  intro: 'bg-bg text-ink-2 border border-line',
  telling: 'bg-bg text-ink-2 border border-line',
  waiting_slate: 'bg-warn-soft text-warn',
  waiting_choice: 'bg-warn-soft text-warn',
  reading: 'bg-accent-soft text-accent',
  feedback: 'bg-ok-soft text-ok',
  discussion: 'bg-bg text-ink-2 border border-line',
  done: 'bg-ok text-white',
};

const Dashboard: React.FC<{ code: string; uiLang: Lang; onBack: () => void; navigate: (p: string[]) => void }> = ({ code, uiLang, onBack, navigate }) => {
  const [classroom, setClassroom] = useState<ClassroomState | null>(null);
  const [journey, setJourney] = useState<Journey | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  useTicker();

  const status = useRealtime({ code, role: 'teacher' }, { onClassroom: setClassroom, onError: setError });

  useEffect(() => {
    api.getClassroom(code).then(setClassroom).catch((e) => setError(e.message));
  }, [code]);

  useEffect(() => {
    if (!classroom) return;
    api.journeys().then((js) => setJourney(js.find((j) => j.id === classroom.journeyId) ?? js[0]));
  }, [classroom?.journeyId]);

  const lang = classroom?.lang ?? uiLang;
  const pending = useMemo(() => (classroom?.alerts ?? []).filter((a) => !a.acknowledged).sort((a, b) => b.at - a.at), [classroom]);
  const n = journey?.workshops.length ?? 3;

  if (error && !classroom) {
    return (
      <div className="min-h-screen bg-bg">
        <TopBar onBack={onBack} />
        <div className="max-w-xl mx-auto p-12 text-center text-sm">
          <p className="text-danger">{ui('notFound', uiLang)}</p>
        </div>
      </div>
    );
  }
  if (!classroom) return <div className="min-h-screen bg-bg flex items-center justify-center text-sm text-muted">{ui('connecting', uiLang)}</div>;

  const remaining = classroom.timerEndsAt ? classroom.timerEndsAt - Date.now() : classroom.timerPausedMs ?? classroom.rotationMinutes * 60_000;
  const rotationLabel = classroom.rotation === 0 ? ui('prologue', lang) : classroom.rotation > n ? ui('plenary', lang) : `${ui('rotation', lang)} ${classroom.rotation}/${n}`;
  const selectedGroup = classroom.groups.find((g) => g.id === selected) ?? null;

  return (
    <div className="min-h-screen bg-bg">
      <TopBar
        onBack={onBack}
        right={
          <>
            <span className={`pill ${status === 'open' ? 'bg-ok-soft text-ok' : 'bg-warn-soft text-warn'}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${status === 'open' ? 'bg-ok' : 'bg-warn'}`} /> {status === 'open' ? 'Live' : ui('offline', lang)}
            </span>
            <a href={`/api/export/training.jsonl?code=${code}`} className="btn btn-ghost px-2" title={ui('exportTraining', lang)}><Download className="w-4 h-4" /></a>
          </>
        }
      >
        <span className="font-medium text-ink truncate">{classroom.name}</span>
        <span className="hidden sm:inline text-muted truncate">{journey ? t(journey.title, lang) : ''} · {LANG_LABELS[classroom.lang]}</span>
      </TopBar>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        {/* Bandeau code + rotation */}
        <section className="card p-5 sm:p-6 grid lg:grid-cols-[auto_1fr] gap-8 items-center">
          <div>
            <div className="eyebrow">{ui('classCode', lang)}</div>
            <div className="font-mono font-semibold text-5xl tracking-[0.2em] mt-1">{classroom.code}</div>
            <div className="text-xs text-muted mt-2">{ui('codeHint', lang)}</div>
          </div>
          <div className="flex flex-wrap items-center gap-2 lg:justify-end">
            <button onClick={() => api.setRotation(code, 'prev')} className="btn btn-outline px-2.5" title={ui('prevRotation', lang)}><ArrowLeft className="w-4 h-4" /></button>
            <span className="btn btn-primary cursor-default">{rotationLabel}</span>
            <button onClick={() => api.setRotation(code, 'next')} className="btn btn-outline px-2.5" title={ui('nextRotation', lang)}><ArrowRight className="w-4 h-4" /></button>
            <span className="font-mono text-2xl tabular-nums ml-3">{fmt(remaining)}</span>
            <button onClick={() => api.toggleTimer(code)} className="btn btn-outline px-2.5">
              {classroom.timerEndsAt ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </button>
          </div>
        </section>

        <div className="grid lg:grid-cols-[1fr_300px] gap-8">
          <section>
            <div className="flex items-baseline justify-between mb-3">
              <h2 className="text-sm font-semibold">{ui('groups', lang)}</h2>
              <span className="text-xs text-muted">{classroom.groups.length}</span>
            </div>
            <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-3">
              {classroom.groups.map((g) => <GroupCard key={g.id} g={g} journey={journey} lang={lang} onClick={() => setSelected(g.id)} />)}
            </div>
          </section>

          <aside>
            <div className="flex items-baseline justify-between mb-3">
              <h2 className="text-sm font-semibold">{ui('alerts', lang)}</h2>
              {pending.length > 0 && <span className="pill bg-danger-soft text-danger">{pending.length}</span>}
            </div>
            <div className="space-y-2">
              {pending.length === 0 && <p className="text-sm text-muted card p-4">{ui('noAlerts', lang)}</p>}
              {pending.map((a) => (
                <div key={a.id} className={`card p-3 text-sm flex items-start gap-2 border-l-2 ${a.kind === 'completed' ? 'border-l-ok' : a.kind === 'help_requested' ? 'border-l-danger' : 'border-l-warn'}`}>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium">{a.message}</div>
                    <div className="text-xs text-muted mt-0.5">{new Date(a.at).toLocaleTimeString()}</div>
                  </div>
                  <button onClick={() => api.ackAlert(code, a.id)} className="btn btn-ghost px-1.5 py-1" title={ui('acknowledge', lang)}><Check className="w-4 h-4" /></button>
                </div>
              ))}
            </div>
          </aside>
        </div>
      </div>

      {selectedGroup && journey && <GroupDetail code={code} g={selectedGroup} journey={journey} lang={lang} onClose={() => setSelected(null)} navigate={navigate} />}
    </div>
  );
};

const GroupCard: React.FC<{ g: GroupState; journey: Journey | null; lang: Lang; onClick: () => void }> = ({ g, journey, lang, onClick }) => {
  const workshop = journey?.workshops.find((w) => w.id === g.workshopId);
  const total = workshop?.steps.length ?? 0;
  const last = g.transcript[g.transcript.length - 1];
  return (
    <button onClick={onClick} className={`card text-left p-4 hover:border-ink transition-colors ${g.needsHelp ? 'border-danger' : g.lesson.struggling ? 'border-warn' : ''}`}>
      <div className="flex items-center justify-between gap-2">
        <div className="font-medium flex items-center gap-2 min-w-0"><span>{g.totem}</span><span className="truncate">{g.name}</span></div>
        <span className={`pill ${PHASE_PILL[g.lesson.phase] ?? ''}`}>{phaseLabel(g.lesson.phase, lang)}</span>
      </div>
      <div className="text-xs text-muted mt-1 truncate">{workshop ? `${t(SUBJECT_LABELS[workshop.subject], lang)} · ${t(workshop.title, lang)}` : ''}</div>
      <div className="mt-4 grid grid-cols-4 gap-2 text-xs">
        <Stat label={ui('step', lang)} value={g.lesson.phase === 'idle' ? '–' : `${Math.min(g.lesson.stepIndex + 1, total)}/${total}`} />
        <Stat label={ui('score', lang)} value={String(g.lesson.score)} />
        <Stat label={ui('hints', lang)} value={String(g.lesson.hintsUsed)} />
        <Stat label={ui('devices', lang)} value={String(g.joinedDevices)} />
      </div>
      {g.needsHelp && <div className="mt-3 text-xs font-medium text-danger">{ui('needsHelp', lang)}{g.helpNote ? ` — ${g.helpNote}` : ''}</div>}
      {last && <p className="mt-3 text-xs text-ink-2 line-clamp-2">{last.text}</p>}
      <div className="mt-3 flex items-center gap-1.5 text-[11px] text-muted">
        <span className={`w-1.5 h-1.5 rounded-full ${g.standConnected ? 'bg-ok' : 'bg-line-2'}`} />
        {g.standConnected ? ui('standConnected', lang) : ui('standSimulated', lang)}
      </div>
    </button>
  );
};

const Stat: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div>
    <div className="font-semibold tabular-nums">{value}</div>
    <div className="text-muted">{label}</div>
  </div>
);

const GroupDetail: React.FC<{ code: string; g: GroupState; journey: Journey; lang: Lang; onClose: () => void; navigate: (p: string[]) => void }> = ({ code, g, journey, lang, onClose, navigate }) => {
  const workshop = journey.workshops.find((w) => w.id === g.workshopId);
  const step = workshop?.steps[g.lesson.stepIndex];
  const standActions: StandAction[] = ['center', 'look_slate', 'look_students', 'nod', 'shake', 'scan'];

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 bg-ink/40 backdrop-blur-[2px] flex items-end sm:items-center justify-center p-0 sm:p-6" onClick={onClose}>
      <div className="bg-surface w-full sm:max-w-3xl max-h-[92vh] overflow-y-auto rounded-t-2xl sm:rounded-2xl border border-line animate-fade-in" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between p-5 border-b border-line">
          <div>
            <div className="text-xl font-semibold flex items-center gap-2"><span>{g.totem}</span> {g.name}</div>
            <div className="text-sm text-muted mt-0.5">{workshop ? t(workshop.title, lang) : ''} · {phaseLabel(g.lesson.phase, lang)}</div>
          </div>
          <button onClick={onClose} className="btn btn-ghost px-2"><X className="w-5 h-5" /></button>
        </div>

        <div className="p-5 grid sm:grid-cols-2 gap-6">
          <div className="space-y-5">
            {step && (
              <div>
                <div className="eyebrow">{ui('step', lang)} {g.lesson.stepIndex + 1}</div>
                <p className="mt-1.5 text-sm">{t(step.prompt, lang)}</p>
                {step.expected && <p className="mt-1 text-xs text-accent">→ {t(step.expected, lang)}</p>}
              </div>
            )}
            {workshop && (
              <div className="text-sm space-y-3">
                <div><div className="eyebrow">{ui('teacherNote', lang)}</div><p className="mt-1.5">{t(workshop.teacherNote, lang)}</p></div>
                <div><div className="eyebrow">{ui('materials', lang)}</div><p className="mt-1.5">{t(workshop.materials, lang)}</p></div>
              </div>
            )}
            {g.lesson.lastReading && (
              <div>
                <div className="eyebrow">{ui('lastReading', lang)} · {g.lesson.lastReading.provider} · {Math.round(g.lesson.lastReading.confidence * 100)}%</div>
                <p className="mt-1.5 font-mono text-sm">{g.lesson.lastReading.text || '∅'}</p>
              </div>
            )}
            <div>
              <div className="eyebrow mb-2">{ui('roles', lang)}</div>
              <div className="grid grid-cols-2 gap-2">
                {(Object.keys(ROLE_LABELS) as RoleType[]).map((r) => (
                  <div key={r}>
                    <label className="label">{t(ROLE_LABELS[r], lang)}</label>
                    <input defaultValue={g.roles[r]} onBlur={(e) => e.target.value !== g.roles[r] && api.setRole(code, g.id, r, e.target.value)} className="field py-1.5" />
                  </div>
                ))}
              </div>
            </div>
            {Object.keys(g.results).length > 0 && (
              <div>
                <div className="eyebrow mb-2">{ui('results', lang)}</div>
                <ul className="text-sm space-y-1">
                  {Object.entries(g.results).map(([wid, r]) => {
                    const w = journey.workshops.find((x) => x.id === wid);
                    return <li key={wid} className="flex justify-between gap-3"><span className="truncate">{w ? t(w.title, lang) : wid}</span><span className="font-mono text-xs text-ink-2">{r.score}/{r.total} · {r.hintsUsed}</span></li>;
                  })}
                </ul>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <StandWidget pose={g.standPose} connected={g.standConnected} lang={lang} />
            <div className="flex flex-wrap gap-1.5">
              {standActions.map((a) => <button key={a} onClick={() => api.moveStand(code, g.id, a)} className="btn btn-outline px-2.5 py-1 text-xs font-mono">{a}</button>)}
            </div>
            <div>
              <div className="eyebrow mb-2">{ui('transcript', lang)}</div>
              <ul className="space-y-1.5 max-h-64 overflow-y-auto pr-1 text-sm">
                {[...g.transcript].reverse().map((u) => (
                  <li key={u.id} className="border-l-2 border-line pl-3 py-0.5">
                    <span className="text-[11px] font-mono text-muted mr-2">{u.kind}{u.fromModel ? ' · IA' : ''}</span>
                    <span className="text-ink-2">{u.text}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex gap-2">
              <button onClick={() => navigate(['groupe', code, g.id])} className="btn btn-primary flex-1"><Smartphone className="w-4 h-4" /> {ui('openGroup', lang)}</button>
              <a href={`#/groupe/${code}/${g.id}`} target="_blank" rel="noreferrer" className="btn btn-outline px-2.5"><ExternalLink className="w-4 h-4" /></a>
              {g.needsHelp && <button onClick={() => api.setHelp(code, g.id, false)} className="btn btn-accent">{ui('acknowledge', lang)}</button>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ================= Vue racine ================= */

export const TeacherConsole: React.FC<{ code?: string; lang: Lang; navigate: (p: string[]) => void }> = ({ code, lang, navigate }) => {
  if (!code) return <CreateOrResume lang={lang} onOpen={(c) => navigate(['prof', c])} onBack={() => navigate([])} />;
  return <Dashboard code={code} uiLang={lang} onBack={() => navigate(['prof'])} navigate={navigate} />;
};
