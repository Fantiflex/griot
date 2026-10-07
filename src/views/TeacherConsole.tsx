import React, { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, ArrowRight, Bell, Check, Download, Pause, Play, Smartphone, X, ExternalLink } from 'lucide-react';
import { LANG_LABELS, SUBJECT_LABELS, t, type ClassroomState, type GroupState, type Journey, type Lang, type RoleType, type StandAction, ROLE_LABELS } from '@shared/types';
import { api } from '@/lib/api';
import { useRealtime } from '@/lib/realtime';
import { ui, phaseLabel } from '@/lib/i18n';
import { StandWidget } from '@/components/StandWidget';

/* ================= Création / reprise ================= */

const CreateOrResume: React.FC<{ lang: Lang; onOpen: (code: string) => void }> = ({ lang, onOpen }) => {
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

  const field = 'w-full rounded-xl border border-stone-300 bg-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#A36B46]';

  return (
    <div className="max-w-3xl mx-auto px-5 py-10 grid md:grid-cols-5 gap-8">
      <form onSubmit={submit} className="md:col-span-3 space-y-4">
        <h2 className="font-serif font-black text-2xl">{ui('createClass', lang)}</h2>
        <label className="block text-sm font-bold text-stone-700">
          {ui('className', lang)}
          <input className={`${field} mt-1`} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="6e B" />
        </label>
        <label className="block text-sm font-bold text-stone-700">
          {ui('language', lang)}
          <select className={`${field} mt-1`} value={form.lang} onChange={(e) => setForm({ ...form, lang: e.target.value as Lang })}>
            {(Object.keys(LANG_LABELS) as Lang[]).map((l) => (
              <option key={l} value={l}>{LANG_LABELS[l]}</option>
            ))}
          </select>
        </label>
        <label className="block text-sm font-bold text-stone-700">
          {ui('journey', lang)}
          <select className={`${field} mt-1`} value={form.journeyId} onChange={(e) => setForm({ ...form, journeyId: e.target.value })}>
            {journeys.map((j) => (
              <option key={j.id} value={j.id}>{t(j.title, form.lang)}</option>
            ))}
          </select>
        </label>
        <div className="grid grid-cols-3 gap-3">
          <label className="block text-sm font-bold text-stone-700">
            {ui('groupCount', lang)}
            <input type="number" min={1} max={10} className={`${field} mt-1`} value={form.groupCount} onChange={(e) => setForm({ ...form, groupCount: Number(e.target.value) })} />
          </label>
          <label className="block text-sm font-bold text-stone-700">
            {ui('studentsPerGroup', lang)}
            <input type="number" min={2} max={12} className={`${field} mt-1`} value={form.studentsPerGroup} onChange={(e) => setForm({ ...form, studentsPerGroup: Number(e.target.value) })} />
          </label>
          <label className="block text-sm font-bold text-stone-700">
            {ui('rotationMinutes', lang)}
            <input type="number" min={5} max={120} className={`${field} mt-1`} value={form.rotationMinutes} onChange={(e) => setForm({ ...form, rotationMinutes: Number(e.target.value) })} />
          </label>
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button disabled={busy} className="w-full rounded-xl bg-stone-900 text-white font-bold py-3 hover:bg-stone-800 disabled:opacity-50">
          {ui('createClass', lang)}
        </button>
      </form>

      <div className="md:col-span-2 space-y-4">
        <h2 className="font-serif font-black text-2xl">{ui('resumeClass', lang)}</h2>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (code.trim()) onOpen(code.trim().toUpperCase());
          }}
          className="flex gap-2"
        >
          <input className={`${field} font-mono uppercase tracking-widest`} value={code} onChange={(e) => setCode(e.target.value)} placeholder="ABC123" maxLength={6} />
          <button className="rounded-xl bg-[#A36B46] text-white font-bold px-4">OK</button>
        </form>
        <ul className="space-y-2">
          {existing.map((c) => (
            <li key={c.code}>
              <button onClick={() => onOpen(c.code)} className="w-full text-left rounded-xl border border-stone-200 bg-white px-3 py-2.5 hover:border-[#A36B46] flex items-center justify-between">
                <span>
                  <span className="font-mono font-bold">{c.code}</span> <span className="text-stone-600">· {c.name}</span>
                </span>
                <span className="text-xs text-stone-400">{LANG_LABELS[c.lang]} · {c.groups} {ui('groups', lang).toLowerCase()}</span>
              </button>
            </li>
          ))}
        </ul>
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

const PHASE_COLOR: Record<string, string> = {
  idle: 'bg-stone-100 text-stone-600',
  intro: 'bg-sky-100 text-sky-800',
  telling: 'bg-sky-100 text-sky-800',
  waiting_slate: 'bg-amber-100 text-amber-800',
  waiting_choice: 'bg-amber-100 text-amber-800',
  reading: 'bg-violet-100 text-violet-800',
  feedback: 'bg-emerald-100 text-emerald-800',
  discussion: 'bg-indigo-100 text-indigo-800',
  done: 'bg-emerald-600 text-white',
};

const Dashboard: React.FC<{ code: string; uiLang: Lang; onBack: () => void; navigate: (p: string[]) => void }> = ({ code, uiLang, onBack, navigate }) => {
  const [classroom, setClassroom] = useState<ClassroomState | null>(null);
  const [journey, setJourney] = useState<Journey | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  useTicker();

  const status = useRealtime({ code, role: 'teacher' }, {
    onClassroom: setClassroom,
    onError: setError,
  });

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
      <div className="max-w-xl mx-auto p-10 text-center">
        <p className="text-red-600">{ui('notFound', uiLang)}</p>
        <button onClick={onBack} className="mt-4 text-sm font-bold underline">{ui('back', uiLang)}</button>
      </div>
    );
  }
  if (!classroom) return <div className="p-10 text-center text-stone-500">{ui('connecting', uiLang)}</div>;

  const remaining = classroom.timerEndsAt ? classroom.timerEndsAt - Date.now() : classroom.timerPausedMs ?? classroom.rotationMinutes * 60_000;
  const rotationLabel =
    classroom.rotation === 0 ? ui('prologue', lang) : classroom.rotation > n ? ui('plenary', lang) : `${ui('rotation', lang)} ${classroom.rotation} / ${n}`;
  const selectedGroup = classroom.groups.find((g) => g.id === selected) ?? null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Bandeau */}
      <div className="rounded-3xl bg-stone-900 text-white p-5 sm:p-6 grid lg:grid-cols-[auto_1fr_auto] gap-6 items-center">
        <div>
          <div className="text-[11px] font-mono uppercase tracking-widest text-stone-400">{ui('classCode', lang)}</div>
          <div className="font-mono font-black text-5xl tracking-[0.25em] text-[#E5A823]">{classroom.code}</div>
          <div className="text-xs text-stone-400 mt-1">{ui('codeHint', lang)}</div>
        </div>
        <div>
          <div className="font-serif font-black text-2xl">{classroom.name}</div>
          <div className="text-sm text-stone-300">{journey ? t(journey.title, lang) : ''} · {LANG_LABELS[classroom.lang]}</div>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <button onClick={() => api.setRotation(code, 'prev')} className="p-2 rounded-lg bg-white/10 hover:bg-white/20" title={ui('prevRotation', lang)}><ArrowLeft className="w-4 h-4" /></button>
            <span className="font-bold px-3 py-1.5 rounded-lg bg-[#A36B46]">{rotationLabel}</span>
            <button onClick={() => api.setRotation(code, 'next')} className="p-2 rounded-lg bg-white/10 hover:bg-white/20" title={ui('nextRotation', lang)}><ArrowRight className="w-4 h-4" /></button>
            <span className="font-mono text-2xl font-bold ml-2 tabular-nums">{fmt(remaining)}</span>
            <button onClick={() => api.toggleTimer(code)} className="p-2 rounded-lg bg-white/10 hover:bg-white/20">
              {classroom.timerEndsAt ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </button>
            <span className={`ml-auto text-xs ${status === 'open' ? 'text-emerald-400' : 'text-amber-400'}`}>● {status === 'open' ? 'live' : ui('offline', lang)}</span>
          </div>
        </div>
        <div className="flex lg:flex-col gap-2">
          <a href={`/api/export/training.jsonl?code=${code}`} className="inline-flex items-center gap-2 text-xs font-bold px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20">
            <Download className="w-3.5 h-3.5" /> {ui('exportTraining', lang)}
          </a>
          <button onClick={onBack} className="inline-flex items-center gap-2 text-xs font-bold px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20">
            <ArrowLeft className="w-3.5 h-3.5" /> {ui('back', lang)}
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-[1fr_320px] gap-6">
        {/* Groupes */}
        <section>
          <h3 className="font-serif font-black text-lg mb-3">{ui('groups', lang)}</h3>
          <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-3">
            {classroom.groups.map((g) => (
              <GroupCard key={g.id} g={g} journey={journey} lang={lang} onClick={() => setSelected(g.id)} />
            ))}
          </div>
        </section>

        {/* Alertes */}
        <aside className="space-y-3">
          <h3 className="font-serif font-black text-lg flex items-center gap-2"><Bell className="w-4 h-4" /> {ui('alerts', lang)} {pending.length > 0 && <span className="text-xs bg-red-600 text-white rounded-full px-2 py-0.5">{pending.length}</span>}</h3>
          {pending.length === 0 && <p className="text-sm text-stone-500 rounded-2xl border border-dashed border-stone-300 p-4">{ui('noAlerts', lang)}</p>}
          {pending.map((a) => (
            <div key={a.id} className={`rounded-2xl p-3 text-sm flex items-start gap-2 border ${a.kind === 'completed' ? 'bg-emerald-50 border-emerald-200' : a.kind === 'help_requested' ? 'bg-red-50 border-red-200' : 'bg-amber-50 border-amber-200'}`}>
              <div className="flex-1">
                <div className="font-bold">{a.message}</div>
                <div className="text-[11px] text-stone-500">{new Date(a.at).toLocaleTimeString()}</div>
              </div>
              <button onClick={() => api.ackAlert(code, a.id)} className="p-1.5 rounded-lg hover:bg-white" title={ui('acknowledge', lang)}><Check className="w-4 h-4" /></button>
            </div>
          ))}
        </aside>
      </div>

      {selectedGroup && journey && (
        <GroupDetail code={code} g={selectedGroup} journey={journey} lang={lang} onClose={() => setSelected(null)} navigate={navigate} />
      )}
    </div>
  );
};

const GroupCard: React.FC<{ g: GroupState; journey: Journey | null; lang: Lang; onClick: () => void }> = ({ g, journey, lang, onClick }) => {
  const workshop = journey?.workshops.find((w) => w.id === g.workshopId);
  const total = workshop?.steps.length ?? 0;
  const last = g.transcript[g.transcript.length - 1];
  return (
    <button onClick={onClick} className={`text-left rounded-2xl border bg-white p-4 hover:border-[#A36B46] transition-colors ${g.needsHelp ? 'border-red-400 ring-2 ring-red-200' : g.lesson.struggling ? 'border-amber-400' : 'border-stone-200'}`}>
      <div className="flex items-center justify-between">
        <div className="font-bold flex items-center gap-2"><span className="text-xl">{g.totem}</span> {g.name}</div>
        <span className={`text-[11px] font-bold px-2 py-1 rounded-lg ${PHASE_COLOR[g.lesson.phase] ?? ''}`}>{phaseLabel(g.lesson.phase, lang)}</span>
      </div>
      <div className="text-xs text-stone-500 mt-1">{workshop ? `${t(SUBJECT_LABELS[workshop.subject], lang)} · ${t(workshop.title, lang)}` : ''}</div>
      <div className="mt-3 grid grid-cols-4 gap-2 text-center text-[11px]">
        <Stat label={ui('step', lang)} value={g.lesson.phase === 'idle' ? '–' : `${Math.min(g.lesson.stepIndex + 1, total)}/${total}`} />
        <Stat label={ui('score', lang)} value={String(g.lesson.score)} />
        <Stat label={ui('hints', lang)} value={String(g.lesson.hintsUsed)} />
        <Stat label={ui('devices', lang)} value={String(g.joinedDevices)} />
      </div>
      {g.needsHelp && <div className="mt-2 text-xs font-bold text-red-600">✋ {ui('needsHelp', lang)}{g.helpNote ? ` : ${g.helpNote}` : ''}</div>}
      {last && <p className="mt-2 text-xs text-stone-600 line-clamp-2 italic">« {last.text} »</p>}
      <div className="mt-2 flex items-center gap-2 text-[11px] text-stone-400">
        <span className={`w-1.5 h-1.5 rounded-full ${g.standConnected ? 'bg-emerald-500' : 'bg-stone-300'}`} />
        {g.standConnected ? ui('standConnected', lang) : ui('standSimulated', lang)}
      </div>
    </button>
  );
};

const Stat: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="rounded-lg bg-stone-50 py-1.5">
    <div className="font-bold text-sm text-stone-900">{value}</div>
    <div className="text-stone-400">{label}</div>
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
    <div className="fixed inset-0 z-50 bg-stone-950/70 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-6" onClick={onClose}>
      <div className="bg-white w-full sm:max-w-3xl max-h-[92vh] overflow-y-auto rounded-t-3xl sm:rounded-3xl p-5 sm:p-6 space-y-5" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between">
          <div>
            <div className="font-serif font-black text-2xl flex items-center gap-2"><span>{g.totem}</span> {g.name}</div>
            <div className="text-sm text-stone-500">{workshop ? t(workshop.title, lang) : ''} · {phaseLabel(g.lesson.phase, lang)}</div>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-stone-100"><X className="w-5 h-5" /></button>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-3">
            {step && (
              <div className="rounded-2xl bg-amber-50 border border-amber-200 p-3 text-sm">
                <div className="text-[11px] font-bold uppercase text-amber-700">{ui('step', lang)} {g.lesson.stepIndex + 1}</div>
                <p className="mt-1">{t(step.prompt, lang)}</p>
                {step.expected && <p className="mt-1 text-xs text-amber-800">→ {t(step.expected, lang)}</p>}
              </div>
            )}
            {workshop && (
              <div className="rounded-2xl bg-stone-50 p-3 text-sm">
                <div className="text-[11px] font-bold uppercase text-stone-500">{ui('teacherNote', lang)}</div>
                <p className="mt-1">{t(workshop.teacherNote, lang)}</p>
                <div className="text-[11px] font-bold uppercase text-stone-500 mt-3">{ui('materials', lang)}</div>
                <p className="mt-1">{t(workshop.materials, lang)}</p>
              </div>
            )}
            {g.lesson.lastReading && (
              <div className="rounded-2xl bg-violet-50 border border-violet-200 p-3 text-sm">
                <div className="text-[11px] font-bold uppercase text-violet-700">{ui('lastReading', lang)} · {g.lesson.lastReading.provider} · {Math.round(g.lesson.lastReading.confidence * 100)}%</div>
                <p className="mt-1 font-mono">{g.lesson.lastReading.text || '∅'}</p>
              </div>
            )}
            <div>
              <div className="text-[11px] font-bold uppercase text-stone-500 mb-1">{ui('roles', lang)}</div>
              <div className="grid grid-cols-2 gap-2">
                {(Object.keys(ROLE_LABELS) as RoleType[]).map((r) => (
                  <label key={r} className="text-xs">
                    <span className="text-stone-500">{t(ROLE_LABELS[r], lang)}</span>
                    <input
                      defaultValue={g.roles[r]}
                      onBlur={(e) => e.target.value !== g.roles[r] && api.setRole(code, g.id, r, e.target.value)}
                      className="mt-0.5 w-full rounded-lg border border-stone-200 px-2 py-1.5"
                    />
                  </label>
                ))}
              </div>
            </div>
            {Object.keys(g.results).length > 0 && (
              <div>
                <div className="text-[11px] font-bold uppercase text-stone-500 mb-1">{ui('results', lang)}</div>
                <ul className="text-xs space-y-1">
                  {Object.entries(g.results).map(([wid, r]) => {
                    const w = journey.workshops.find((x) => x.id === wid);
                    return <li key={wid} className="flex justify-between"><span>{w ? t(w.title, lang) : wid}</span><span className="font-mono">{r.score}/{r.total} · {r.hintsUsed} {ui('hints', lang).toLowerCase()}</span></li>;
                  })}
                </ul>
              </div>
            )}
          </div>

          <div className="space-y-3">
            <StandWidget pose={g.standPose} connected={g.standConnected} lang={lang} />
            <div className="flex flex-wrap gap-1.5">
              {standActions.map((a) => (
                <button key={a} onClick={() => api.moveStand(code, g.id, a)} className="text-[11px] font-bold px-2.5 py-1.5 rounded-lg bg-stone-100 hover:bg-stone-200">{a}</button>
              ))}
            </div>
            <div>
              <div className="text-[11px] font-bold uppercase text-stone-500 mb-1">{ui('transcript', lang)}</div>
              <ul className="space-y-1.5 max-h-64 overflow-y-auto pr-1">
                {[...g.transcript].reverse().map((u) => (
                  <li key={u.id} className="text-xs rounded-lg bg-stone-50 p-2">
                    <span className={`font-bold mr-1 ${u.fromModel ? 'text-[#A36B46]' : 'text-stone-500'}`}>{u.kind}{u.fromModel ? ' · IA' : ''}</span>
                    {u.text}
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex gap-2">
              <button onClick={() => navigate(['groupe', code, g.id])} className="flex-1 inline-flex items-center justify-center gap-2 text-xs font-bold px-3 py-2 rounded-lg bg-stone-900 text-white">
                <Smartphone className="w-3.5 h-3.5" /> {ui('openGroup', lang)}
              </button>
              <a href={`#/groupe/${code}/${g.id}`} target="_blank" rel="noreferrer" className="inline-flex items-center justify-center p-2 rounded-lg bg-stone-100"><ExternalLink className="w-4 h-4" /></a>
              {g.needsHelp && (
                <button onClick={() => api.setHelp(code, g.id, false)} className="text-xs font-bold px-3 py-2 rounded-lg bg-emerald-600 text-white">{ui('acknowledge', lang)}</button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ================= Vue racine ================= */

export const TeacherConsole: React.FC<{ code?: string; lang: Lang; navigate: (p: string[]) => void }> = ({ code, lang, navigate }) => {
  if (!code) return <CreateOrResume lang={lang} onOpen={(c) => navigate(['prof', c])} />;
  return <Dashboard code={code} uiLang={lang} onBack={() => navigate(['prof'])} navigate={navigate} />;
};
