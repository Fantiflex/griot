import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Bell, Brain, CheckCircle2, Eye, Hand, Keyboard, Lightbulb, Play, RotateCcw, Route, ScanLine, Volume2, VolumeX } from 'lucide-react';
import type { SiteLang } from '@site/copy';
import { PROBLEMS, diagnose, type DemoLang, type Problem } from './problems';
import { loadDigitModel, readNumber, type NumberRead } from './digits';
import { SlateCanvas, type SlateHandle } from './SlateCanvas';

/* ---------------------------------------------------------------------------
 * Démo jouable du site. L'écriture est lue pour de vrai, dans le navigateur, par un petit
 * réseau de neurones. Le diagnostic et les phrases du Griot sont scriptés ici ; en classe,
 * un modèle à poids ouverts les rédige à partir des mêmes informations.
 * ------------------------------------------------------------------------- */

type Phase = 'idle' | 'intro' | 'writing' | 'reading' | 'confirm' | 'feedback' | 'done';

interface Trace {
  read?: { kind: 'ink'; r: NumberRead } | { kind: 'typed'; text: string };
  confirm?: 'asked' | 'yes' | 'no';
  diagnosis?: { tone: 'ok' | 'known' | 'unknown'; text: string };
  decision?: string;
  teacher?: { alert: boolean; text: string };
}

interface Alert {
  id: number;
  text: string;
  tone: 'warn' | 'ok' | 'danger';
}

const SPEECH: Record<DemoLang, string> = { en: 'en-US', fr: 'fr-FR', sw: 'sw-KE' };

const LINES: Record<DemoLang, Record<string, string>> = {
  en: {
    intro: 'Hello Table 1. Three short problems today. Talk it over, then the scribe writes one answer on the slate and presses “Read my slate”.',
    empty: 'I can’t see anything on the slate yet. Write your answer big, in the middle.',
    readAs: 'I read {n}. Is that right?',
    readMaybe: 'I think I read {n}. Is that right?',
    rewrite: 'Sorry about that. Erase and write it again, a little bigger.',
    done: 'All three done. Speaker, get ready to explain to the class how you solved the equation.',
    stuck: 'Table 1 is stuck on {topic} after {n} attempts',
    finished: 'Table 1 finished: {ok} of 3 right first time',
    help: 'Table 1 is calling you',
  },
  fr: {
    intro: 'Bonjour Table 1. Trois petits problèmes aujourd’hui. Discutez, puis le scribe écrit une seule réponse sur l’ardoise et appuie sur « Lire l’ardoise ».',
    empty: 'Je ne vois encore rien sur l’ardoise. Écrivez votre réponse en grand, au milieu.',
    readAs: 'J’ai lu {n}. C’est bien ça ?',
    readMaybe: 'Je crois avoir lu {n}. C’est bien ça ?',
    rewrite: 'Pardon. Effacez et réécrivez, un peu plus grand.',
    done: 'Les trois sont faits. Orateur, prépare-toi à expliquer à la classe comment vous avez résolu l’équation.',
    stuck: 'Table 1 bloque en {topic} après {n} essais',
    finished: 'Table 1 a terminé : {ok} sur 3 justes du premier coup',
    help: 'Table 1 vous appelle',
  },
  sw: {
    intro: 'Habari Meza 1. Leo kuna maswali matatu mafupi. Jadilini, kisha mwandishi aandike jibu moja ubaoni na abonyeze « Soma ubao ».',
    empty: 'Bado sioni kitu ubaoni. Andikeni jibu lenu kwa herufi kubwa, katikati.',
    readAs: 'Nimesoma {n}. Ni sahihi?',
    readMaybe: 'Nadhani nimesoma {n}. Ni sahihi?',
    rewrite: 'Samahani. Futeni na mwandike tena, kwa ukubwa kidogo.',
    done: 'Yote matatu yamekamilika. Msemaji, jiandae kueleza darasa jinsi mlivyotatua mlinganyo.',
    stuck: 'Meza 1 imekwama kwenye {topic} baada ya majaribio {n}',
    finished: 'Meza 1 imemaliza: {ok} kati ya 3 sahihi mara ya kwanza',
    help: 'Meza 1 inakuita',
  },
};

const UI = {
  en: {
    voice: 'Voice',
    start: 'Start the lesson',
    cont: 'Continue',
    read: 'Read my slate',
    erase: 'Erase',
    yes: 'Yes',
    no: 'No, rewrite',
    typeInstead: 'Type instead',
    typePh: 'Answer',
    write: 'Write your answer here',
    hint: 'A hint',
    call: 'Call the teacher',
    cancel: 'Cancel call',
    restart: 'Start again',
    problem: 'Problem',
    of: 'of',
    attempt: 'Attempt',
    inside: 'Inside the Griot',
    insideSub: 'What it sees, understands and decides, live',
    steps: { sees: 'Sees', confirms: 'Checks', understands: 'Understands', decides: 'Decides', teacher: 'Teacher' },
    waiting: 'Waiting for the slate',
    readLine: 'Read “{n}” · {p}% confident',
    typedLine: 'Typed answer “{n}”',
    confAsked: 'Asks the group to confirm',
    confYes: 'The group confirmed',
    confNo: 'The group said no: rewriting',
    correct: 'Correct answer',
    unknown: 'Wrong, no known pattern',
    decPraise: 'Praise, explain why, next problem',
    decTargeted: 'Hint aimed at this mistake, no answer given ({a} of 3)',
    decHint: 'General hint {h} of 2, no answer given ({a} of 3)',
    decWorked: 'Third attempt: show the worked solution',
    teacherNone: 'No alert needed',
    teacherSent: 'Alert sent',
    note: 'Handwriting is read by a small neural network running in your browser ({acc} on the MNIST test set). The Griot’s sentences are scripted in this demo; in class, an open-weight model writes them.',
    teacherView: 'Teacher view',
    live: 'Live',
    tables: ['Table 1', 'Table 2', 'Table 3'],
    you: 'you',
    noAlerts: 'No alerts. Every table is working.',
    status: { idle: 'Not started', working: 'Problem {i} of 3', stuck: 'Stuck · problem {i}', done: 'Done · {ok}/3 first try', help: 'Calling you' },
  },
  fr: {
    voice: 'Voix',
    start: 'Commencer la leçon',
    cont: 'Continuer',
    read: 'Lire l’ardoise',
    erase: 'Effacer',
    yes: 'Oui',
    no: 'Non, réécrire',
    typeInstead: 'Taper plutôt',
    typePh: 'Réponse',
    write: 'Écrivez votre réponse ici',
    hint: 'Un indice',
    call: 'Appeler l’enseignant',
    cancel: 'Annuler l’appel',
    restart: 'Recommencer',
    problem: 'Problème',
    of: 'sur',
    attempt: 'Essai',
    inside: 'Dans la tête du Griot',
    insideSub: 'Ce qu’il voit, comprend et décide, en direct',
    steps: { sees: 'Voit', confirms: 'Vérifie', understands: 'Comprend', decides: 'Décide', teacher: 'Enseignant' },
    waiting: 'En attente de l’ardoise',
    readLine: 'Lu « {n} » · confiance {p} %',
    typedLine: 'Réponse tapée « {n} »',
    confAsked: 'Demande confirmation au groupe',
    confYes: 'Le groupe a confirmé',
    confNo: 'Le groupe a dit non : réécriture',
    correct: 'Réponse juste',
    unknown: 'Faux, sans erreur type reconnue',
    decPraise: 'Féliciter, expliquer pourquoi, problème suivant',
    decTargeted: 'Indice ciblé sur cette erreur, sans donner la réponse ({a} sur 3)',
    decHint: 'Indice général {h} sur 2, sans donner la réponse ({a} sur 3)',
    decWorked: 'Troisième essai : montrer la solution expliquée',
    teacherNone: 'Pas d’alerte nécessaire',
    teacherSent: 'Alerte envoyée',
    note: 'L’écriture est lue par un petit réseau de neurones qui tourne dans votre navigateur ({acc} sur le jeu de test MNIST). Les phrases du Griot sont scriptées dans cette démo ; en classe, un modèle à poids ouverts les rédige.',
    teacherView: 'Vue enseignant',
    live: 'En direct',
    tables: ['Table 1', 'Table 2', 'Table 3'],
    you: 'vous',
    noAlerts: 'Aucune alerte. Toutes les tables travaillent.',
    status: { idle: 'Pas commencé', working: 'Problème {i} sur 3', stuck: 'Bloqué · problème {i}', done: 'Fini · {ok}/3 du premier coup', help: 'Vous appelle' },
  },
};

const fill = (s: string, v: Record<string, string | number>) => s.replace(/\{(\w+)\}/g, (_, k) => String(v[k] ?? ''));

export const Demo: React.FC<{ siteLang: SiteLang }> = ({ siteLang }) => {
  const ui = UI[siteLang];
  const [lang, setLang] = useState<DemoLang>(siteLang);
  useEffect(() => setLang(siteLang), [siteLang]);
  const lines = LINES[lang];

  const [phase, setPhase] = useState<Phase>('idle');
  const [pi, setPi] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [hints, setHints] = useState(0);
  const [firstTry, setFirstTry] = useState(0);
  const [bubble, setBubble] = useState('');
  const [trace, setTrace] = useState<Trace>({});
  const [pending, setPending] = useState<string | null>(null);
  const [typing, setTyping] = useState(false);
  const [typed, setTyped] = useState('');
  const [slateEmpty, setSlateEmpty] = useState(true);
  const [voice, setVoice] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [stuck, setStuck] = useState(false);
  const [help, setHelp] = useState(false);
  const [acc, setAcc] = useState('');
  const [tick, setTick] = useState(0);
  const slate = useRef<SlateHandle | null>(null);
  const alertId = useRef(0);

  const problem: Problem = PROBLEMS[Math.min(pi, PROBLEMS.length - 1)];

  // Précharge le lecteur d'écriture
  useEffect(() => {
    loadDigitModel()
      .then((m) => setAcc(siteLang === 'fr' ? `${(m.accuracy * 100).toFixed(1).replace('.', ',')} %` : `${(m.accuracy * 100).toFixed(1)}%`))
      .catch(() => setAcc(''));
  }, [siteLang]);

  // Tables voisines simulées
  useEffect(() => {
    const id = window.setInterval(() => setTick((n) => n + 1), 4200);
    return () => clearInterval(id);
  }, []);

  const say = useCallback(
    (text: string) => {
      setBubble(text);
      setSpeaking(true);
      if (voice && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const u = new SpeechSynthesisUtterance(text);
        u.lang = SPEECH[lang];
        u.rate = 0.96;
        u.onend = () => setSpeaking(false);
        u.onerror = () => setSpeaking(false);
        window.speechSynthesis.speak(u);
      } else {
        window.setTimeout(() => setSpeaking(false), Math.min(2200, 500 + text.length * 8));
      }
    },
    [voice, lang],
  );

  const pushAlert = (text: string, tone: Alert['tone']) => setAlerts((a) => [{ id: ++alertId.current, text, tone }, ...a].slice(0, 4));

  const ask = (i: number) => {
    setPi(i);
    setAttempts(0);
    setPhase('writing');
    setTrace({});
    setTyping(false);
    setTyped('');
    slate.current?.clear();
    say(PROBLEMS[i].question[lang]);
  };

  const start = () => {
    setHints(0);
    setFirstTry(0);
    setAlerts([]);
    setStuck(false);
    setHelp(false);
    setTrace({});
    setPi(0);
    setPhase('intro');
    say(lines.intro);
  };

  /** Le cœur pédagogique : diagnostiquer, décider, prévenir l'enseignant. */
  const evaluate = (answer: string, base: Trace) => {
    const attempt = attempts + 1;
    setAttempts(attempt);
    const d = diagnose(problem, answer);
    const topic = problem.topic[lang].toLowerCase();

    if (d.kind === 'correct') {
      if (attempt === 1) setFirstTry((n) => n + 1);
      setStuck(false);
      setTrace({ ...base, diagnosis: { tone: 'ok', text: ui.correct }, decision: ui.decPraise, teacher: { alert: false, text: ui.teacherNone } });
      setPhase('feedback');
      say(problem.praise[lang]);
      return;
    }

    const diagnosis = { tone: d.kind === 'known' ? ('known' as const) : ('unknown' as const), text: d.kind === 'known' ? d.m.label[lang] : ui.unknown };
    if (attempt >= 3) {
      setTrace({ ...base, diagnosis, decision: ui.decWorked, teacher: { alert: true, text: ui.teacherSent } });
      pushAlert(fill(lines.stuck, { topic, n: attempt }), 'warn');
      setPhase('feedback');
      say(problem.worked[lang]);
      return;
    }

    setHints((n) => n + 1);
    const hintIdx = Math.min(attempt - 1, 1);
    const reply = d.kind === 'known' ? d.m.reply[lang] : problem.hints[hintIdx][lang];
    const decision = d.kind === 'known' ? fill(ui.decTargeted, { a: attempt }) : fill(ui.decHint, { h: hintIdx + 1, a: attempt });
    const alert = attempt >= 2;
    if (alert) {
      setStuck(true);
      pushAlert(fill(lines.stuck, { topic, n: attempt }), 'warn');
    }
    setTrace({ ...base, diagnosis, decision, teacher: { alert, text: alert ? ui.teacherSent : ui.teacherNone } });
    setPhase('writing');
    slate.current?.clear();
    say(reply);
  };

  const readSlate = async () => {
    const canvas = slate.current?.canvas();
    if (!canvas || slateEmpty) {
      say(lines.empty);
      return;
    }
    setPhase('reading');
    setTrace({});
    const [r] = await Promise.all([readNumber(canvas).catch(() => null), new Promise((res) => setTimeout(res, 900))]);
    if (!r) {
      setPhase('writing');
      say(lines.empty);
      return;
    }
    setPending(r.text);
    setTrace({ read: { kind: 'ink', r }, confirm: 'asked' });
    setPhase('confirm');
    say(fill(r.confidence > 0.6 ? lines.readAs : lines.readMaybe, { n: r.text }));
  };

  const submitTyped = (e: React.FormEvent) => {
    e.preventDefault();
    const v = typed.replace(/[^0-9]/g, '');
    if (!v) return;
    slate.current?.writeText(v);
    setTyped('');
    setTyping(false);
    evaluate(v, { read: { kind: 'typed', text: v }, confirm: 'yes' });
  };

  const confirmYes = () => {
    if (pending) evaluate(pending, { ...trace, confirm: 'yes' });
  };
  const confirmNo = () => {
    setTrace((t) => ({ ...t, confirm: 'no' }));
    setPhase('writing');
    slate.current?.clear();
    say(lines.rewrite);
  };

  const next = () => {
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    if (phase === 'intro') return ask(0);
    if (pi + 1 < PROBLEMS.length) return ask(pi + 1);
    setPhase('done');
    setStuck(false);
    pushAlert(fill(lines.finished, { ok: firstTry }), 'ok');
    say(lines.done);
  };

  const askHint = () => {
    const h = problem.hints[Math.min(hints, 1)][lang];
    setHints((n) => n + 1);
    say(h);
  };

  const toggleHelp = () => {
    if (!help) pushAlert(lines.help, 'danger');
    else setAlerts((a) => a.filter((x) => x.tone !== 'danger'));
    setHelp(!help);
  };

  // Changement de langue : on redit la phrase en cours dans la nouvelle langue
  const prevLang = useRef(lang);
  useEffect(() => {
    if (prevLang.current === lang) return;
    prevLang.current = lang;
    if (phase === 'intro') say(LINES[lang].intro);
    else if (phase === 'writing' || phase === 'feedback') say(problem.question[lang]);
    else if (phase === 'done') say(LINES[lang].done);
  }, [lang]);

  const working = phase === 'writing' || phase === 'reading' || phase === 'confirm';
  const inLesson = working || phase === 'feedback';
  const myStatus = help
    ? ui.status.help
    : phase === 'idle' || phase === 'intro'
      ? ui.status.idle
      : phase === 'done'
        ? fill(ui.status.done, { ok: firstTry })
        : stuck
          ? fill(ui.status.stuck, { i: pi + 1 })
          : fill(ui.status.working, { i: pi + 1 });
  const sims = [fill(ui.status.working, { i: (tick % 3) + 1 }), tick % 6 === 5 ? fill(ui.status.done, { ok: 2 }) : fill(ui.status.working, { i: ((tick + 1) % 3) + 1 })];

  return (
    <div className="grid lg:grid-cols-[minmax(0,380px)_minmax(0,1fr)] gap-8 items-start">
      {/* ===================== Téléphone du groupe ===================== */}
      <div className="mx-auto w-full max-w-[380px]">
        <div className="flex items-center justify-between mb-3 text-xs">
          <div className="flex items-center gap-1">
            {(['en', 'fr', 'sw'] as DemoLang[]).map((l) => (
              <button key={l} onClick={() => setLang(l)} className={`px-2.5 py-1 rounded-md font-medium transition-colors ${lang === l ? 'bg-ink text-white' : 'text-ink-2 hover:bg-line'}`}>
                {l.toUpperCase()}
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
          <div className="night rounded-[28px] bg-night-2 text-white h-[640px] flex flex-col overflow-hidden">
            <div className="h-11 px-4 flex items-center justify-between text-[11px] text-white/50 border-b border-white/10">
              <span className="font-mono">{ui.tables[0]}</span>
              {inLesson ? (
                <span className="font-mono">
                  {ui.problem} {pi + 1} {ui.of} 3 · {problem.topic[lang]}
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-ok" /> LeGriot
                </span>
              )}
            </div>

            {/* Griot */}
            <div className="px-4 pt-4 flex items-start gap-3">
              <GriotOrb speaking={speaking} />
              <div key={bubble} className="flex-1 rounded-2xl rounded-tl-sm bg-white text-ink p-3.5 text-[14px] leading-relaxed animate-fade-in min-h-[64px]">
                {phase === 'idle' ? lines.intro : bubble}
              </div>
            </div>

            {/* zone de travail */}
            <div className="flex-1 px-4 pt-4 pb-3 flex flex-col gap-3 min-h-0">
              {(phase === 'idle' || phase === 'intro') && (
                <button onClick={phase === 'idle' ? start : next} className="mt-auto mb-auto rounded-2xl bg-accent hover:bg-accent-2 transition-colors py-8 flex flex-col items-center gap-2 font-semibold">
                  <Play className="w-7 h-7" /> {phase === 'idle' ? ui.start : ui.cont}
                </button>
              )}

              {inLesson && <div className="rounded-xl bg-white/[0.06] border border-white/10 px-3 py-2.5 text-center font-display text-lg leading-snug">{problem.question[lang]}</div>}

              {inLesson && <SlateCanvas ref={slate} placeholder={ui.write} disabled={phase !== 'writing'} scanning={phase === 'reading'} onChange={setSlateEmpty} />}

              {phase === 'writing' && !typing && (
                <div className="grid grid-cols-[auto_1fr] gap-2">
                  <button onClick={() => slate.current?.clear()} className="btn btn-outline py-2.5 text-xs">
                    <RotateCcw className="w-3.5 h-3.5" /> {ui.erase}
                  </button>
                  <button onClick={readSlate} className="btn btn-accent py-2.5">
                    <ScanLine className="w-4 h-4" /> {ui.read}
                  </button>
                  <button onClick={() => setTyping(true)} className="col-span-2 text-[11px] text-white/45 hover:text-white inline-flex items-center justify-center gap-1">
                    <Keyboard className="w-3 h-3" /> {ui.typeInstead}
                  </button>
                </div>
              )}
              {phase === 'writing' && typing && (
                <form onSubmit={submitTyped} className="flex gap-2">
                  <input autoFocus inputMode="numeric" value={typed} onChange={(e) => setTyped(e.target.value)} placeholder={ui.typePh} className="field" />
                  <button className="btn btn-accent px-4">OK</button>
                </form>
              )}

              {phase === 'confirm' && (
                <div className="grid grid-cols-2 gap-2">
                  <button onClick={confirmNo} className="btn btn-outline py-2.5">
                    {ui.no}
                  </button>
                  <button onClick={confirmYes} className="btn btn-accent py-2.5">
                    <CheckCircle2 className="w-4 h-4" /> {ui.yes}
                  </button>
                </div>
              )}

              {phase === 'feedback' && (
                <button onClick={next} className="btn btn-outline w-full py-2.5">
                  <Play className="w-4 h-4" /> {ui.cont}
                </button>
              )}

              {phase === 'done' && (
                <div className="mt-auto mb-auto rounded-2xl border border-ok/40 bg-ok/10 p-5 text-center">
                  <div className="font-display text-3xl">{firstTry} / 3</div>
                  <div className="text-xs text-white/60 mt-1">{fill(ui.status.done, { ok: firstTry })}</div>
                  <button onClick={start} className="btn btn-ghost mt-3 text-xs">
                    <RotateCcw className="w-3.5 h-3.5" /> {ui.restart}
                  </button>
                </div>
              )}
            </div>

            <div className="px-4 pb-4 pt-3 border-t border-white/10 grid grid-cols-2 gap-2">
              <button onClick={askHint} disabled={!working} className="btn btn-outline py-2 text-xs">
                <Lightbulb className="w-3.5 h-3.5" /> {ui.hint}
              </button>
              <button onClick={toggleHelp} disabled={phase === 'idle'} className={`btn py-2 text-xs ${help ? 'bg-danger text-white' : 'btn-outline'}`}>
                <Hand className="w-3.5 h-3.5" /> {help ? ui.cancel : ui.call}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ===================== Dans la tête du Griot + vue enseignant ===================== */}
      <div className="space-y-5 min-w-0">
        <div className="rounded-3xl bg-ink text-white p-5 sm:p-7">
          <div className="flex items-baseline justify-between gap-3">
            <div>
              <div className="font-display text-2xl font-semibold">{ui.inside}</div>
              <div className="text-sm text-white/55 mt-0.5">{ui.insideSub}</div>
            </div>
            {inLesson && (
              <span className="font-mono text-[11px] text-white/50 shrink-0">
                {ui.attempt} {Math.min(attempts + (phase === 'feedback' ? 0 : 1), 3)} / 3
              </span>
            )}
          </div>

          <ol className="mt-6 space-y-2.5">
            <TraceRow icon={Eye} title={ui.steps.sees} active={phase === 'reading'} done={!!trace.read}>
              {trace.read ? (
                trace.read.kind === 'ink' ? (
                  <div className="flex items-center gap-3 flex-wrap">
                    <div className="flex gap-1.5">
                      {trace.read.r.digits.map((d, i) => (
                        <figure key={i} className="text-center">
                          <DigitPixels pixels={d.pixels} />
                          <figcaption className="font-mono text-[10px] text-white/60 mt-0.5">
                            {d.digit} · {Math.round(d.prob * 100)}%
                          </figcaption>
                        </figure>
                      ))}
                    </div>
                    <span className="text-sm">{fill(ui.readLine, { n: trace.read.r.text, p: Math.round(trace.read.r.confidence * 100) })}</span>
                  </div>
                ) : (
                  <span className="text-sm">{fill(ui.typedLine, { n: trace.read.text })}</span>
                )
              ) : (
                <span className="text-sm text-white/40">{phase === 'reading' ? '…' : ui.waiting}</span>
              )}
            </TraceRow>
            <TraceRow icon={CheckCircle2} title={ui.steps.confirms} active={phase === 'confirm'} done={trace.confirm === 'yes' || trace.confirm === 'no'}>
              <span className={`text-sm ${trace.confirm ? '' : 'text-white/40'}`}>
                {trace.confirm === 'asked' ? ui.confAsked : trace.confirm === 'yes' ? ui.confYes : trace.confirm === 'no' ? ui.confNo : '—'}
              </span>
            </TraceRow>
            <TraceRow icon={Brain} title={ui.steps.understands} done={!!trace.diagnosis}>
              <span
                className={`text-sm ${
                  !trace.diagnosis ? 'text-white/40' : trace.diagnosis.tone === 'ok' ? 'text-[#86d9ad]' : trace.diagnosis.tone === 'known' ? 'text-[#f2b872]' : 'text-white/85'
                }`}
              >
                {trace.diagnosis?.text ?? '—'}
              </span>
            </TraceRow>
            <TraceRow icon={Route} title={ui.steps.decides} done={!!trace.decision}>
              <span className={`text-sm ${trace.decision ? '' : 'text-white/40'}`}>{trace.decision ?? '—'}</span>
            </TraceRow>
            <TraceRow icon={Bell} title={ui.steps.teacher} done={!!trace.teacher} alert={trace.teacher?.alert}>
              <span className={`text-sm ${!trace.teacher ? 'text-white/40' : trace.teacher.alert ? 'text-[#f2b872]' : ''}`}>{trace.teacher?.text ?? '—'}</span>
            </TraceRow>
          </ol>
          <p className="mt-6 text-[11px] leading-relaxed text-white/45 font-mono">{fill(ui.note, { acc: acc || '98%' })}</p>
        </div>

        <div className="rounded-3xl bg-surface border border-line p-5 sm:p-6">
          <div className="flex items-center justify-between">
            <div className="font-semibold">{ui.teacherView}</div>
            <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-green bg-green-soft rounded-full px-2 py-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-green" /> {ui.live}
            </span>
          </div>
          <div className="mt-4 grid sm:grid-cols-2 gap-4">
            <ul className="space-y-2">
              {[myStatus, ...sims].map((s, i) => (
                <li
                  key={i}
                  className={`flex items-center justify-between gap-2 rounded-xl border px-3 py-2 text-sm ${i === 0 && (stuck || help) ? 'border-amber/50 bg-amber-soft' : i === 0 ? 'border-ink' : 'border-line'}`}
                >
                  <span className="font-medium whitespace-nowrap">
                    {ui.tables[i]} {i === 0 && <span className="text-xs text-accent font-normal">· {ui.you}</span>}
                  </span>
                  <span className={`text-xs text-right ${i === 0 && (stuck || help) ? 'text-amber font-medium' : 'text-muted'}`}>{s}</span>
                </li>
              ))}
            </ul>
            <div className="space-y-2">
              {alerts.length === 0 && <p className="text-sm text-muted">{ui.noAlerts}</p>}
              {alerts.map((a) => (
                <div
                  key={a.id}
                  className={`rounded-xl border border-line border-l-2 px-3 py-2 text-sm animate-fade-in ${a.tone === 'ok' ? 'border-l-ok' : a.tone === 'danger' ? 'border-l-danger' : 'border-l-warn'}`}
                >
                  {a.text}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const TraceRow: React.FC<{ icon: React.FC<{ className?: string }>; title: string; active?: boolean; done?: boolean; alert?: boolean; children: React.ReactNode }> = ({
  icon: Icon,
  title,
  active,
  done,
  alert,
  children,
}) => (
  <li className={`grid grid-cols-[36px_minmax(0,1fr)] sm:grid-cols-[36px_100px_minmax(0,1fr)] items-center gap-x-3 gap-y-1 rounded-xl px-3 py-2.5 transition-colors ${active ? 'bg-white/10' : done ? 'bg-white/[0.04]' : ''}`}>
    <span
      className={`row-span-2 sm:row-span-1 w-9 h-9 rounded-lg flex items-center justify-center ${
        alert ? 'bg-[#f2b872]/20 text-[#f2b872]' : done ? 'bg-accent/25 text-accent' : 'bg-white/5 text-white/35'
      } ${active ? 'animate-pulse' : ''}`}
    >
      <Icon className="w-4 h-4" />
    </span>
    <span className={`text-[11px] font-mono uppercase tracking-wider ${done || active ? 'text-white/80' : 'text-white/35'}`}>{title}</span>
    <div className="min-w-0">{children}</div>
  </li>
);

/** Affiche l'image 28x28 que le réseau a réellement vue. */
const DigitPixels: React.FC<{ pixels: Float32Array }> = ({ pixels }) => {
  const ref = useRef<HTMLCanvasElement | null>(null);
  useEffect(() => {
    const c = ref.current;
    const ctx = c?.getContext('2d');
    if (!c || !ctx) return;
    const img = ctx.createImageData(28, 28);
    for (let i = 0; i < 784; i++) {
      img.data[i * 4] = 250;
      img.data[i * 4 + 1] = 248;
      img.data[i * 4 + 2] = 240;
      img.data[i * 4 + 3] = Math.round(pixels[i] * 255);
    }
    ctx.putImageData(img, 0, 0);
  }, [pixels]);
  return <canvas ref={ref} width={28} height={28} className="w-11 h-11 rounded-md bg-[#24302b] [image-rendering:pixelated]" />;
};

/** Le Griot, dessiné comme un cercle et un point qui parle. */
const GriotOrb: React.FC<{ speaking: boolean }> = ({ speaking }) => (
  <div className={`relative w-11 h-11 shrink-0 ${speaking ? 'orb-speaking' : ''}`}>
    <svg viewBox="0 0 48 48" className="w-full h-full" aria-hidden="true">
      <circle cx="24" cy="24" r="20" fill="none" stroke="rgba(255,255,255,0.85)" strokeWidth="2.5" />
      <circle cx="32" cy="16" r={speaking ? 7 : 6} fill="var(--color-accent)" style={{ transition: 'r 200ms' }} />
    </svg>
  </div>
);
