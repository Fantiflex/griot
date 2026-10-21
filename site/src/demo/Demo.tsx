import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Hand, Lightbulb, Play, RotateCcw, Volume2, VolumeX } from 'lucide-react';
import { deterministicJudge } from '@shared/judge';
import type { SiteLang } from '@site/copy';
import { demoContext, demoSteps, demoTitle, LINES, type DemoLang, type DemoStep } from './script';

/* ---------------------------------------------------------------------------
 * Démo jouable, entièrement dans le navigateur. Même déroulé que le moteur de
 * leçon du serveur (server/classroom/lesson.ts) et même juge (shared/judge.ts),
 * avec des retours scriptés à la place du modèle.
 * ------------------------------------------------------------------------- */

type Phase = 'idle' | 'telling' | 'waiting_slate' | 'reading' | 'waiting_choice' | 'feedback' | 'discussion' | 'done';
type StandPose = 'students' | 'slate' | 'nod' | 'shake';
type AlertKind = 'stuck' | 'help' | 'done';

interface DemoAlert {
  id: number;
  kind: AlertKind;
  at: number;
}

const UI = {
  en: {
    start: 'Start the workshop',
    cont: 'Continue',
    done: 'We’re done writing',
    slatePlaceholder: 'Write your answer…',
    slateHint: 'In class, the camera reads the slate as soon as it stops moving.',
    hint: 'A hint',
    call: 'Call the teacher',
    cancel: 'Cancel the call',
    restart: 'Restart',
    finished: 'Workshop complete',
    step: 'Step',
    math: 'Math',
    reading: 'Reading the slate',
    voice: 'Voice',
    lang: 'Griot’s language',
    teacherView: 'Teacher view',
    live: 'Live',
    classCode: 'Class',
    you: 'you',
    groups: 'Groups',
    alerts: 'Alerts',
    noAlerts: 'No alerts. Groups are on track.',
    successes: 'Successes',
    hints: 'Hints',
    lastReading: 'Last slate reading:',
    stand: { students: 'Looking at the students', slate: 'Looking at the slate', nod: 'Nodding', shake: 'Shaking its head' },
    phases: {
      idle: 'Waiting',
      telling: 'Griot is telling',
      waiting_slate: 'Writing on the slate',
      reading: 'Reading the slate',
      waiting_choice: 'Choosing an answer',
      feedback: 'Feedback',
      discussion: 'Circle discussion',
      done: 'Done',
    } as Record<Phase, string>,
    alertText: {
      stuck: 'is stuck despite the hints',
      help: 'is calling the teacher',
      done: 'finished the workshop',
    } as Record<AlertKind, string>,
    groupsNames: ['Lion 1', 'Baobab 2', 'River 3'],
    workshops: ['Math · Proportions', 'Language · Proverb & decree', 'History · Wind & gold routes'],
    langNote: 'Classes run in French and Kiswahili today. English is shown for this demo.',
  },
  fr: {
    start: 'Commencer l’atelier',
    cont: 'Continuer',
    done: 'On a fini d’écrire',
    slatePlaceholder: 'Écrivez votre réponse…',
    slateHint: 'En classe, la caméra lit l’ardoise dès qu’elle ne bouge plus.',
    hint: 'Un indice',
    call: 'Appeler l’enseignant',
    cancel: 'Annuler l’appel',
    restart: 'Recommencer',
    finished: 'Atelier terminé',
    step: 'Étape',
    math: 'Maths',
    reading: 'Le Griot lit l’ardoise',
    voice: 'Voix',
    lang: 'Langue du Griot',
    teacherView: 'Vue enseignant',
    live: 'En direct',
    classCode: 'Classe',
    you: 'vous',
    groups: 'Groupes',
    alerts: 'Alertes',
    noAlerts: 'Aucune alerte. Les groupes avancent.',
    successes: 'Réussites',
    hints: 'Indices',
    lastReading: 'Dernière lecture d’ardoise :',
    stand: { students: 'Regarde les élèves', slate: 'Regarde l’ardoise', nod: 'Acquiesce', shake: 'Fait non de la tête' },
    phases: {
      idle: 'En attente',
      telling: 'Le Griot raconte',
      waiting_slate: 'Écrit sur l’ardoise',
      reading: 'Lecture de l’ardoise',
      waiting_choice: 'Choisit une réponse',
      feedback: 'Retour du Griot',
      discussion: 'Discussion en cercle',
      done: 'Terminé',
    } as Record<Phase, string>,
    alertText: {
      stuck: 'bloque malgré les indices',
      help: 'appelle l’enseignant',
      done: 'a terminé l’atelier',
    } as Record<AlertKind, string>,
    groupsNames: ['Lion 1', 'Baobab 2', 'Fleuve 3'],
    workshops: ['Maths · Proportions', 'Langue · Proverbe et décret', 'Histoire · Routes du vent et de l’or'],
    langNote: 'Les classes fonctionnent aujourd’hui en français et en kiswahili. L’anglais est affiché pour cette démo.',
  },
};

const SPEECH_LANG: Record<DemoLang, string> = { en: 'en-US', fr: 'fr-FR', sw: 'sw-KE' };

const PHASE_PILL: Record<Phase, string> = {
  idle: 'bg-bg text-muted border border-line',
  telling: 'bg-bg text-ink-2 border border-line',
  waiting_slate: 'bg-warn-soft text-warn',
  reading: 'bg-accent-soft text-accent',
  waiting_choice: 'bg-warn-soft text-warn',
  feedback: 'bg-ok-soft text-ok',
  discussion: 'bg-bg text-ink-2 border border-line',
  done: 'bg-ok text-white',
};

/* Groupes simulés autour du vôtre, pour que la vue enseignant vive. */
const SIM_SEQUENCE: { phase: Phase; step: number; score: number; hints: number }[] = [
  { phase: 'telling', step: 1, score: 0, hints: 0 },
  { phase: 'waiting_slate', step: 2, score: 0, hints: 0 },
  { phase: 'reading', step: 2, score: 0, hints: 0 },
  { phase: 'feedback', step: 2, score: 1, hints: 0 },
  { phase: 'waiting_slate', step: 3, score: 1, hints: 1 },
  { phase: 'reading', step: 3, score: 1, hints: 1 },
  { phase: 'feedback', step: 3, score: 2, hints: 1 },
  { phase: 'waiting_choice', step: 4, score: 2, hints: 1 },
  { phase: 'feedback', step: 4, score: 3, hints: 1 },
  { phase: 'discussion', step: 5, score: 3, hints: 1 },
];

export const Demo: React.FC<{ siteLang: SiteLang }> = ({ siteLang }) => {
  const ui = UI[siteLang];
  const [lang, setLang] = useState<DemoLang>(siteLang);
  useEffect(() => setLang(siteLang), [siteLang]);

  const steps = useMemo(() => demoSteps(lang), [lang]);
  const lines = LINES[lang];

  const [phase, setPhase] = useState<Phase>('idle');
  const [stepIndex, setStepIndex] = useState(-1);
  const [attempts, setAttempts] = useState(0);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [score, setScore] = useState(0);
  const [bubble, setBubble] = useState<string>('');
  const [slate, setSlate] = useState('');
  const [lastReading, setLastReading] = useState<string | null>(null);
  const [stand, setStand] = useState<StandPose>('students');
  const [speaking, setSpeaking] = useState(false);
  const [voice, setVoice] = useState(false);
  const [needsHelp, setNeedsHelp] = useState(false);
  const [alerts, setAlerts] = useState<DemoAlert[]>([]);
  const [simTick, setSimTick] = useState(0);
  const alertId = useRef(0);
  const timers = useRef<number[]>([]);

  const step: DemoStep | undefined = stepIndex >= 0 ? steps[stepIndex] : undefined;
  const totalSteps = steps.length;

  const later = (fn: () => void, ms: number) => {
    timers.current.push(window.setTimeout(fn, ms));
  };
  useEffect(() => () => timers.current.forEach((t) => clearTimeout(t)), []);

  /* Parole : bulle + animation, voix du navigateur si activée. */
  const say = useCallback(
    (text: string) => {
      setBubble(text);
      setSpeaking(true);
      if (voice && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const u = new SpeechSynthesisUtterance(text);
        u.lang = SPEECH_LANG[lang];
        u.rate = 0.95;
        u.onend = () => setSpeaking(false);
        u.onerror = () => setSpeaking(false);
        window.speechSynthesis.speak(u);
      } else {
        later(() => setSpeaking(false), Math.min(2400, 600 + text.length * 8));
      }
    },
    [voice, lang],
  );

  const moveStand = (pose: StandPose) => {
    setStand(pose);
    if (pose === 'nod' || pose === 'shake') later(() => setStand('students'), 1100);
  };

  const raise = (kind: AlertKind) => {
    setAlerts((prev) => (prev.some((a) => a.kind === kind) ? prev : [{ id: ++alertId.current, kind, at: Date.now() }, ...prev]));
  };

  const runStep = (i: number) => {
    const s = steps[i];
    if (!s) {
      setPhase('done');
      setStepIndex(totalSteps);
      moveStand('nod');
      say(lines.done);
      raise('done');
      return;
    }
    setStepIndex(i);
    setAttempts(0);
    setSlate('');
    setPhase(s.kind === 'tell' ? 'telling' : s.kind === 'ask_write' ? 'waiting_slate' : s.kind === 'ask_choice' ? 'waiting_choice' : 'discussion');
    moveStand(s.source.lookAt === 'slate' ? 'slate' : 'students');
    say(s.kind === 'ask_choice' ? `${s.prompt} ${lines.choices}` : s.prompt);
  };

  const start = () => {
    setScore(0);
    setHintsUsed(0);
    setAlerts([]);
    setNeedsHelp(false);
    setLastReading(null);
    setStepIndex(-1);
    setPhase('telling');
    moveStand('students');
    say(demoContext(lang));
  };

  const next = () => {
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    runStep(stepIndex + 1);
  };

  const evaluate = (answer: string, isChoice: boolean, forcedCorrect?: boolean) => {
    if (!step) return;
    const attempt = attempts + 1;
    const judgeStep = { ...step.source, accept: [...(step.source.accept ?? []), ...step.extraAccept] };
    const correct = forcedCorrect ?? deterministicJudge(judgeStep, answer, lang === 'en' ? 'fr' : lang) === true;
    const quoted = lang === 'fr' ? `« ${answer} »` : `“${answer}”`;
    const readBack = isChoice ? '' : `${lines.readAs} ${quoted}. `;
    setAttempts(attempt);

    if (correct) {
      setScore((n) => n + 1);
      setPhase('feedback');
      moveStand('nod');
      say(`${readBack}${isChoice ? lines.correctChoice : lines.correct} ${step.explanation ?? ''}`.trim());
      return;
    }
    if (attempt >= 3) {
      setPhase('feedback');
      moveStand('students');
      say(`${readBack}${lines.reveal} ${step.explanation ?? ''}`.trim());
      return;
    }
    const hint = step.hints[Math.min(attempt - 1, step.hints.length - 1)] ?? '';
    setHintsUsed((n) => n + 1);
    setSlate('');
    setPhase(isChoice ? 'waiting_choice' : 'waiting_slate');
    moveStand(isChoice ? 'students' : 'shake');
    say(`${readBack}${lines.retry} ${hint}`.trim());
    if (attempt >= 2) raise('stuck');
  };

  const submitSlate = (e?: React.FormEvent) => {
    e?.preventDefault();
    const answer = slate.trim();
    if (!answer) {
      say(lines.empty);
      return;
    }
    setPhase('reading');
    moveStand('slate');
    say(lines.looking);
    setLastReading(answer);
    later(() => evaluate(answer, false), 1300);
  };

  const choose = (i: number) => {
    if (!step) return;
    setLastReading(step.options?.[i] ?? String(i + 1));
    evaluate(step.options?.[i] ?? '', true, i === step.correctIndex);
  };

  const askHint = () => {
    if (!step || !step.hints.length) return;
    const h = step.hints[Math.min(hintsUsed, step.hints.length - 1)];
    setHintsUsed((n) => n + 1);
    say(h);
    if (hintsUsed + 1 >= 3) raise('stuck');
  };

  const toggleHelp = () => {
    setNeedsHelp((v) => {
      if (!v) raise('help');
      else setAlerts((prev) => prev.filter((a) => a.kind !== 'help'));
      return !v;
    });
  };

  // Changer de langue en cours de route relance l'étape dans la nouvelle langue.
  const prevLang = useRef(lang);
  useEffect(() => {
    if (prevLang.current === lang) return;
    prevLang.current = lang;
    if (phase === 'idle') return;
    if (stepIndex < 0) say(demoContext(lang));
    else if (phase === 'done') say(LINES[lang].done);
    else if (steps[stepIndex]) say(steps[stepIndex].prompt);
  }, [lang]);

  // Groupes simulés
  useEffect(() => {
    const id = window.setInterval(() => setSimTick((n) => n + 1), 3800);
    return () => clearInterval(id);
  }, []);

  const groups = [
    { name: ui.groupsNames[0], workshop: ui.workshops[0], phase, step: stepIndex < 0 ? 0 : Math.min(stepIndex + 1, totalSteps), score, hints: hintsUsed, you: true, help: needsHelp },
    { name: ui.groupsNames[1], workshop: ui.workshops[1], ...SIM_SEQUENCE[(simTick + 3) % SIM_SEQUENCE.length], you: false, help: false },
    { name: ui.groupsNames[2], workshop: ui.workshops[2], ...SIM_SEQUENCE[(simTick + 7) % SIM_SEQUENCE.length], you: false, help: false },
  ];

  const canContinue = phase === 'telling' || phase === 'feedback' || phase === 'discussion';

  return (
    <div className="grid lg:grid-cols-[minmax(0,380px)_minmax(0,1fr)] gap-8 items-start">
      {/* ===================== Téléphone de groupe ===================== */}
      <div className="mx-auto w-full max-w-[380px]">
        <div className="flex items-center justify-between mb-3 text-xs">
          <div className="flex items-center gap-1" role="group" aria-label={ui.lang}>
            {(['en', 'fr', 'sw'] as DemoLang[]).map((l) => (
              <button
                key={l}
                onClick={() => setLang(l)}
                className={`px-2.5 py-1 rounded-md font-medium transition-colors ${lang === l ? 'bg-ink text-white' : 'text-ink-2 hover:bg-line'}`}
              >
                {l === 'en' ? 'EN' : l === 'fr' ? 'FR' : 'SW'}
              </button>
            ))}
          </div>
          <button
            onClick={() => {
              if (voice && 'speechSynthesis' in window) window.speechSynthesis.cancel();
              setVoice((v) => !v);
            }}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-ink-2 hover:bg-line"
            aria-pressed={voice}
          >
            {voice ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />} {ui.voice}
          </button>
        </div>

        <div className="rounded-[36px] bg-night p-2.5 shadow-[0_30px_60px_-30px_rgba(20,19,17,0.45)]">
          <div className="night rounded-[28px] bg-night-2 text-white h-[600px] flex flex-col overflow-hidden">
            {/* barre */}
            <div className="h-11 px-4 flex items-center justify-between text-[11px] text-white/50 border-b border-white/10">
              <span className="font-mono">K7M2QX · {ui.groupsNames[0]}</span>
              <span className="inline-flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-ok" /> {ui.live}
              </span>
            </div>

            {/* Griot */}
            <div className="px-4 pt-4 flex items-start gap-3">
              <GriotOrb speaking={speaking} />
              <div className="flex-1 min-w-0">
                <div className="text-[10px] uppercase tracking-wider text-white/40 font-semibold">
                  {ui.math} · {demoTitle(lang)}
                  {stepIndex >= 0 && phase !== 'done' && ` · ${ui.step} ${Math.min(stepIndex + 1, totalSteps)}/${totalSteps}`}
                </div>
                <div key={bubble} className="mt-1.5 rounded-2xl rounded-tl-sm bg-white text-ink p-3.5 text-[14px] leading-relaxed animate-fade-in min-h-[72px] max-h-[210px] overflow-y-auto">
                  {phase === 'idle' ? demoContext(lang) : bubble}
                </div>
              </div>
            </div>

            {/* zone d'action */}
            <div className="flex-1 px-4 pt-4 pb-3 flex flex-col gap-3 min-h-0">
              {phase === 'idle' && (
                <button onClick={start} className="mt-auto mb-auto rounded-2xl bg-accent hover:bg-accent-2 transition-colors py-8 flex flex-col items-center gap-2 font-semibold">
                  <Play className="w-7 h-7" /> {ui.start}
                </button>
              )}

              {(phase === 'waiting_slate' || phase === 'reading') && (
                <form onSubmit={submitSlate} className="flex flex-col gap-2">
                  <div className="slate relative rounded-xl border-4 border-[#6b4f36] h-28 flex items-center justify-center">
                    <input
                      value={slate}
                      onChange={(e) => setSlate(e.target.value)}
                      disabled={phase === 'reading'}
                      placeholder={ui.slatePlaceholder}
                      className="font-chalk w-full bg-transparent text-center text-4xl text-white/90 placeholder:text-white/25 placeholder:text-2xl outline-none px-3"
                      aria-label={ui.slatePlaceholder}
                      autoComplete="off"
                    />
                    {phase === 'reading' && (
                      <div className="absolute inset-0 bg-night/60 rounded-lg flex items-center justify-center text-sm font-medium">
                        {ui.reading}
                        <span className="dot-1">.</span>
                        <span className="dot-2">.</span>
                        <span className="dot-3">.</span>
                      </div>
                    )}
                  </div>
                  <button disabled={phase === 'reading'} className="btn btn-accent w-full py-3">
                    <Hand className="w-4 h-4" /> {ui.done}
                  </button>
                  <p className="text-[11px] text-white/40 text-center">{ui.slateHint}</p>
                </form>
              )}

              {phase === 'waiting_choice' && step?.options && (
                <div className="flex flex-col gap-2">
                  {step.options.map((o, i) => (
                    <button
                      key={i}
                      onClick={() => choose(i)}
                      className="rounded-xl border border-white/12 bg-white/[0.04] hover:bg-white/10 hover:border-white/30 px-3 py-2.5 text-left text-sm flex items-center gap-3 transition-colors"
                    >
                      <span className="w-6 h-6 rounded-full border border-white/30 text-xs font-mono flex items-center justify-center shrink-0">{i + 1}</span>
                      {o}
                    </button>
                  ))}
                </div>
              )}

              {canContinue && (
                <button onClick={next} className="btn btn-outline w-full py-3 mt-auto">
                  <Play className="w-4 h-4" /> {ui.cont}
                </button>
              )}

              {phase === 'done' && (
                <div className="mt-auto rounded-2xl border border-ok/40 bg-ok/10 p-4 text-center">
                  <div className="font-semibold">{ui.finished}</div>
                  <div className="text-xs text-white/60 mt-1">
                    {ui.successes} {score} · {ui.hints} {hintsUsed}
                  </div>
                  <button onClick={start} className="btn btn-ghost mt-2 text-xs">
                    <RotateCcw className="w-3.5 h-3.5" /> {ui.restart}
                  </button>
                </div>
              )}
            </div>

            {/* pied */}
            <div className="px-4 pb-4 pt-3 border-t border-white/10 grid grid-cols-[1fr_1fr_auto] gap-2 items-center">
              <button onClick={askHint} disabled={!step || !step.hints.length || phase === 'done'} className="btn btn-outline py-2 text-xs">
                <Lightbulb className="w-3.5 h-3.5" /> {ui.hint}
              </button>
              <button onClick={toggleHelp} disabled={phase === 'idle'} className={`btn py-2 text-xs ${needsHelp ? 'bg-danger text-white' : 'btn-outline'}`}>
                <Hand className="w-3.5 h-3.5" /> {needsHelp ? ui.cancel : ui.call}
              </button>
              <StandIcon pose={stand} label={ui.stand[stand]} />
            </div>
          </div>
        </div>
        {lang === 'en' && <p className="mt-3 text-[11px] text-muted text-center">{ui.langNote}</p>}
      </div>

      {/* ===================== Vue enseignant ===================== */}
      <div className="card overflow-hidden">
        <div className="px-5 h-12 border-b border-line flex items-center justify-between">
          <div className="text-sm font-semibold">{ui.teacherView}</div>
          <div className="flex items-center gap-3 text-xs text-muted">
            <span className="font-mono">
              {ui.classCode} K7M2QX
            </span>
            <span className="pill bg-ok-soft text-ok">
              <span className="w-1.5 h-1.5 rounded-full bg-ok" /> {ui.live}
            </span>
          </div>
        </div>

        <div className="p-5 grid xl:grid-cols-[minmax(0,1fr)_240px] gap-6">
          <div>
            <div className="eyebrow mb-3">{ui.groups}</div>
            <div className="space-y-2">
              {groups.map((g) => (
                <div
                  key={g.name}
                  className={`rounded-xl border p-3.5 transition-colors ${g.help ? 'border-danger' : g.you ? 'border-ink' : 'border-line'}`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <div className="text-sm font-medium truncate">
                        {g.name} {g.you && <span className="text-xs text-accent font-normal">· {ui.you}</span>}
                      </div>
                      <div className="text-xs text-muted truncate">{g.workshop}</div>
                    </div>
                    <span className={`pill shrink-0 ${PHASE_PILL[g.phase]}`}>{ui.phases[g.phase]}</span>
                  </div>
                  <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
                    <Stat label={ui.step} value={g.step ? `${g.step}/${totalSteps}` : '–'} />
                    <Stat label={ui.successes} value={String(g.score)} />
                    <Stat label={ui.hints} value={String(g.hints)} />
                  </div>
                  {g.you && lastReading && (
                    <div className="mt-3 text-xs text-ink-2">
                      <span className="text-muted">{ui.lastReading}</span> <span className="font-mono">{lastReading}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className="eyebrow mb-3">{ui.alerts}</div>
            {alerts.length === 0 ? (
              <p className="text-sm text-muted">{ui.noAlerts}</p>
            ) : (
              <div className="space-y-2">
                {alerts.map((a) => (
                  <div
                    key={a.id}
                    className={`rounded-lg border border-line border-l-2 p-3 text-sm animate-fade-in ${a.kind === 'done' ? 'border-l-ok' : a.kind === 'help' ? 'border-l-danger' : 'border-l-warn'}`}
                  >
                    <span className="font-medium">{ui.groupsNames[0]}</span> {ui.alertText[a.kind]}
                    <div className="text-[11px] text-muted mt-0.5">{new Date(a.at).toLocaleTimeString(siteLang === 'fr' ? 'fr-FR' : 'en-US', { hour: '2-digit', minute: '2-digit' })}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const Stat: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div>
    <div className="font-semibold tabular-nums text-ink">{value}</div>
    <div className="text-muted">{label}</div>
  </div>
);

/** Le Griot, dessiné comme le logo : un cercle et un point qui parle. */
const GriotOrb: React.FC<{ speaking: boolean }> = ({ speaking }) => (
  <div className={`relative w-12 h-12 shrink-0 ${speaking ? 'orb-speaking' : ''}`}>
    <svg viewBox="0 0 48 48" className="w-full h-full" aria-hidden="true">
      <circle cx="24" cy="24" r="20" fill="none" stroke="rgba(255,255,255,0.85)" strokeWidth="2.5" />
      <circle cx="32" cy="16" r={speaking ? 7 : 6} fill="var(--color-accent)" style={{ transition: 'r 200ms' }} />
    </svg>
  </div>
);

/** Petit support vu de côté : il s'incline vers l'ardoise, acquiesce, fait non. */
const StandIcon: React.FC<{ pose: StandPose; label: string }> = ({ pose, label }) => {
  const rotate = pose === 'slate' ? 38 : pose === 'students' ? -6 : 0;
  const anim = pose === 'nod' ? 'stand-nod' : pose === 'shake' ? 'stand-shake' : '';
  return (
    <div className="w-11 h-9 flex items-end justify-center" title={label} aria-label={label}>
      <svg viewBox="0 0 44 36" className="w-11 h-9">
        <rect x="14" y="31" width="16" height="3" rx="1.5" fill="rgba(255,255,255,0.35)" />
        <line x1="22" y1="31" x2="22" y2="16" stroke="rgba(255,255,255,0.45)" strokeWidth="2" />
        <g className={anim} style={{ transformOrigin: '22px 15px', transform: anim ? undefined : `rotate(${rotate}deg)`, transition: 'transform 600ms cubic-bezier(.4,0,.2,1)' }}>
          <rect x="9" y="12" width="26" height="6" rx="3" fill="none" stroke="rgba(255,255,255,0.8)" strokeWidth="1.6" />
          <circle cx="22" cy="15" r="2.2" fill="var(--color-accent)" />
        </g>
      </svg>
    </div>
  );
};
