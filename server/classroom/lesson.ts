import { getWorkshop } from '../../content';
import { t, type ExerciseStep, type GroupState, type Lang, type SlateReading, type Verdict, type Workshop } from '../../shared/types';
import { config } from '../config';
import { store } from '../db';
import { chat, chatJson, LlmUnavailableError } from '../llm/provider';
import { askMessages, judgeMessages, summaryMessages, type JudgeResult } from '../griot/prompts';
import { readSlate } from '../perception';
import { deterministicJudge } from '../../shared/judge';
import * as M from './manager';

/**
 * Déroulé d'un atelier par le Griot : il parle, demande, regarde, lit, corrige, relance.
 * Le modèle apporte la finesse (feedback, indices, résumé) ; le script garantit que
 * la leçon avance même si le modèle est lent ou injoignable.
 */

const TXT = {
  looking: {
    fr: 'Je regarde votre ardoise. Ne bougez plus un instant.',
    sw: 'Naangalia ubao wenu. Msisogee kidogo.',
  },
  nothing: {
    fr: 'Je ne vois rien d’écrit sur l’ardoise. Écrivez plus gros, au centre, puis montrez-la moi encore.',
    sw: 'Sioni kitu kilichoandikwa ubaoni. Andikeni kwa herufi kubwa, katikati, kisha nionyesheni tena.',
  },
  unreadable: {
    fr: 'J’ai du mal à lire. Effacez autour, écrivez une seule réponse bien nette, et montrez-la moi.',
    sw: 'Nashindwa kusoma vizuri. Futeni pembeni, andikeni jibu moja tu kwa uwazi, kisha nionyesheni.',
  },
  correct: {
    fr: 'Oui ! Votre ardoise dit vrai.',
    sw: 'Ndiyo! Ubao wenu unasema kweli.',
  },
  retry: {
    fr: 'Pas encore. Il y a quelque chose de juste dans votre essai, mais regardez encore ensemble.',
    sw: 'Bado. Kuna kitu sahihi katika jaribio lenu, lakini angalieni tena pamoja.',
  },
  reveal: {
    fr: 'Vous avez bien cherché. Voici le chemin de la réponse.',
    sw: 'Mmetafuta vizuri. Hii ndiyo njia ya jibu.',
  },
  choiceIntro: {
    fr: 'Voici les choix.',
    sw: 'Hivi ndivyo vichaguo.',
  },
  noHint: {
    fr: 'Relisez la question ensemble, lentement, et que chacun dise ce qu’il a compris.',
    sw: 'Someni swali tena pamoja, polepole, na kila mmoja aseme alichoelewa.',
  },
  askFallback: {
    fr: 'Bonne question. Que pense le reste du groupe ? Regardez votre ardoise et vos cailloux : qu’avez-vous déjà trouvé de sûr ?',
    sw: 'Swali zuri. Wengine wanafikiri nini? Angalieni ubao na mawe yenu: mmeshapata nini cha uhakika?',
  },
  summary: {
    fr: 'Votre atelier est terminé. Vous avez travaillé ensemble, cherché, et trouvé. Orateur, prépare une minute de parole pour le Grand Conseil.',
    sw: 'Warsha yenu imekamilika. Mmefanya kazi pamoja, mmetafuta, na mmepata. Msemaji, andaa dakika moja ya kuzungumza kwa Baraza Kuu.',
  },
  readAs: {
    fr: 'J’ai lu :',
    sw: 'Nimesoma:',
  },
};

function tx(key: keyof typeof TXT, lang: Lang): string {
  return TXT[key][lang] ?? TXT[key].fr;
}

/** Derniers échanges en mémoire (pour le contexte des questions au Griot). */
const recent = new Map<string, { role: 'griot' | 'students'; text: string }[]>();
function remember(code: string, groupId: string, role: 'griot' | 'students', text: string) {
  const key = `${code}:${groupId}`;
  const list = recent.get(key) ?? [];
  list.push({ role, text });
  if (list.length > 12) list.splice(0, list.length - 12);
  recent.set(key, list);
}

function ctx(code: string, groupId: string) {
  const found = M.getGroup(code, groupId);
  if (!found) throw new Error('Groupe introuvable');
  const journey = M.journeyOf(found.classroom);
  const workshop = getWorkshop(journey, found.group.workshopId) ?? journey.workshops[0];
  const step: ExerciseStep | undefined = workshop.steps[found.group.lesson.stepIndex];
  return { ...found, journey, workshop, step, lang: found.classroom.lang };
}

function griotSays(code: string, groupId: string, input: M.SayInput) {
  const u = M.say(code, groupId, input);
  if (u) remember(code, groupId, 'griot', u.text);
  return u;
}

/* ---------- Démarrage et progression ---------- */

export function startLesson(code: string, groupId: string) {
  const { lang, workshop, group } = ctx(code, groupId);
  M.mutateGroup(code, groupId, (g) => {
    g.lesson = M.freshLesson(g.workshopId);
    g.lesson.phase = 'intro';
    g.lesson.startedAt = Date.now();
  });
  store.logEvent(code, groupId, 'lesson.start', { workshopId: group.workshopId });
  griotSays(code, groupId, {
    text: t(workshop.contextStory, lang),
    pose: 'storytelling',
    kind: 'tell',
    stand: 'look_students',
  });
  runStep(code, groupId, 0);
}

function runStep(code: string, groupId: string, index: number) {
  const { lang, workshop } = ctx(code, groupId);
  const step = workshop.steps[index];
  if (!step) {
    void finishLesson(code, groupId);
    return;
  }
  M.mutateGroup(code, groupId, (g) => {
    g.lesson.stepIndex = index;
    g.lesson.attempts = 0;
    g.lesson.struggling = false;
    g.lesson.lastVerdict = undefined;
    g.lesson.lastReading = undefined;
    g.lesson.lastActivityAt = Date.now();
    g.lesson.phase =
      step.kind === 'tell' ? 'telling'
      : step.kind === 'ask_write' ? 'waiting_slate'
      : step.kind === 'ask_choice' ? 'waiting_choice'
      : 'discussion';
  });
  store.logEvent(code, groupId, 'lesson.step', { stepId: step.id, kind: step.kind, index });

  let text = t(step.prompt, lang);
  if (step.kind === 'ask_choice' && step.options) {
    text += ` ${tx('choiceIntro', lang)} ${step.options.map((o, i) => `${i + 1} : ${t(o, lang)}.`).join(' ')}`;
  }
  griotSays(code, groupId, {
    text,
    pose: step.kind === 'tell' ? 'storytelling' : step.kind === 'discuss' ? 'listening' : 'welcoming',
    kind: step.kind === 'tell' ? 'tell' : 'ask',
    stand: step.lookAt === 'slate' ? 'look_slate' : 'look_students',
  });
}

/** Le groupe (ou la fin de la parole) demande de passer à la suite. */
export function continueLesson(code: string, groupId: string) {
  const { group } = ctx(code, groupId);
  const phase = group.lesson.phase;
  if (phase === 'idle') {
    startLesson(code, groupId);
    return;
  }
  if (phase === 'telling' || phase === 'discussion' || phase === 'feedback' || phase === 'intro') {
    runStep(code, groupId, group.lesson.stepIndex + 1);
    return;
  }
  // Dans une attente d'ardoise ou de choix, « continuer » relit la consigne.
  if (phase === 'waiting_slate' || phase === 'waiting_choice') {
    runStep(code, groupId, group.lesson.stepIndex);
  }
}

/* ---------- Lecture de l'ardoise et jugement ---------- */


async function modelJudge(args: Parameters<typeof judgeMessages>[0]): Promise<JudgeResult | null> {
  try {
    const res = await chatJson<JudgeResult>(judgeMessages(args), { temperature: 0.4, maxTokens: 300 });
    if (!res || typeof res.feedback !== 'string') return null;
    return { correct: Boolean(res.correct), partial: Boolean(res.partial), feedback: res.feedback.trim(), hint: (res.hint ?? '').trim() || undefined };
  } catch (err) {
    if (!(err instanceof LlmUnavailableError)) console.warn('[lesson] juge modèle :', (err as Error).message);
    return null;
  }
}

export async function submitSlate(code: string, groupId: string, input: { imageDataUrl?: string; text?: string }) {
  const c = ctx(code, groupId);
  const { lang, step, group } = c;
  if (!step || step.kind !== 'ask_write') throw new Error('Aucune question écrite en attente');
  if (group.lesson.phase === 'reading') return; // déjà en cours

  M.mutateGroup(code, groupId, (g) => {
    g.lesson.phase = 'reading';
    g.lesson.lastActivityAt = Date.now();
  });
  griotSays(code, groupId, { text: tx('looking', lang), pose: 'looking', kind: 'system', stand: 'look_slate' });

  let reading: SlateReading;
  if (input.text !== undefined) {
    reading = { text: input.text.trim(), confidence: 1, provider: 'typed', at: Date.now() };
  } else if (input.imageDataUrl) {
    reading = await readSlate(input.imageDataUrl, { lang, expectedHint: step.expected ? t(step.expected, lang) : undefined });
  } else {
    throw new Error('Image ou texte requis');
  }
  store.logEvent(code, groupId, 'slate.reading', { stepId: step.id, ...reading });

  if (!reading.text) {
    M.mutateGroup(code, groupId, (g) => {
      g.lesson.phase = 'waiting_slate';
      g.lesson.lastReading = reading;
    });
    griotSays(code, groupId, { text: tx(reading.provider === 'none' ? 'unreadable' : 'nothing', lang), pose: 'thinking', kind: 'system', stand: 'look_students' });
    return;
  }

  await evaluate(code, groupId, reading);
}

export async function submitChoice(code: string, groupId: string, index: number) {
  const { step, lang } = ctx(code, groupId);
  if (!step || step.kind !== 'ask_choice' || !step.options) throw new Error('Aucun choix en attente');
  const label = t(step.options[index], lang) ?? String(index + 1);
  const reading: SlateReading = { text: `${index + 1}) ${label}`, confidence: 1, provider: 'typed', at: Date.now() };
  store.logEvent(code, groupId, 'choice', { stepId: step.id, index });
  M.mutateGroup(code, groupId, (g) => {
    g.lesson.phase = 'reading';
    g.lesson.lastActivityAt = Date.now();
  });
  await evaluate(code, groupId, reading, step.correctIndex === index);
}

async function evaluate(code: string, groupId: string, reading: SlateReading, forcedCorrect?: boolean) {
  const c = ctx(code, groupId);
  const { lang, step, journey, workshop } = c;
  if (!step) return;
  const attempt = c.group.lesson.attempts + 1;
  const max = config.lesson.maxAttempts;

  remember(code, groupId, 'students', reading.text);

  const deterministic = forcedCorrect ?? deterministicJudge(step, reading.text, lang);
  let model = await modelJudge({ journey, workshop, step, lang, answer: reading.text, attempt, maxAttempts: max });

  // Le script tranche quand il le peut ; le modèle tranche les questions ouvertes.
  // Si le modèle contredit le script, son texte serait incohérent avec le verdict : on l'écarte.
  if (deterministic !== null && model && model.correct !== deterministic) {
    store.logEvent(code, groupId, 'judge.disagreement', { stepId: step.id, deterministic, model });
    model = null;
  }
  const correct = deterministic ?? model?.correct ?? false;
  const partial = model?.partial ?? false;
  const verdict: Verdict = {
    correct,
    partial,
    summary: model?.feedback ?? (correct ? tx('correct', lang) : attempt >= max ? tx('reveal', lang) : tx('retry', lang)),
    fromModel: Boolean(model),
  };
  store.logEvent(code, groupId, 'verdict', { stepId: step.id, attempt, reading: reading.text, ...verdict, deterministic });

  const readBack = reading.provider === 'typed' ? '' : `${tx('readAs', lang)} « ${reading.text} ». `;
  const explanation = step.explanation ? ` ${t(step.explanation, lang)}` : '';

  if (correct) {
    M.mutateGroup(code, groupId, (g) => {
      g.lesson.attempts = attempt;
      g.lesson.score += 1;
      g.lesson.stepsCompleted += 1;
      g.lesson.phase = 'feedback';
      g.lesson.lastReading = reading;
      g.lesson.lastVerdict = verdict;
      g.lesson.struggling = false;
    });
    griotSays(code, groupId, {
      text: `${readBack}${verdict.summary}${model ? '' : explanation}`,
      pose: 'celebrating',
      kind: 'feedback',
      stand: 'nod',
      fromModel: Boolean(model),
    });
    return;
  }

  if (attempt >= max) {
    M.mutateGroup(code, groupId, (g) => {
      g.lesson.attempts = attempt;
      g.lesson.stepsCompleted += 1;
      g.lesson.phase = 'feedback';
      g.lesson.lastReading = reading;
      g.lesson.lastVerdict = verdict;
    });
    griotSays(code, groupId, {
      text: `${readBack}${verdict.summary}${explanation}`,
      pose: 'storytelling',
      kind: 'answer',
      stand: 'look_students',
      fromModel: Boolean(model),
    });
    return;
  }

  const scriptedHint = step.hints[Math.min(attempt - 1, step.hints.length - 1)];
  const hint = model?.hint || (scriptedHint ? t(scriptedHint, lang) : tx('noHint', lang));
  const struggling = attempt >= 2;
  M.mutateGroup(code, groupId, (g) => {
    g.lesson.attempts = attempt;
    g.lesson.hintsUsed += 1;
    g.lesson.phase = step.kind === 'ask_choice' ? 'waiting_choice' : 'waiting_slate';
    g.lesson.lastReading = reading;
    g.lesson.lastVerdict = verdict;
    g.lesson.struggling = struggling;
  });
  griotSays(code, groupId, {
    text: `${readBack}${verdict.summary} ${hint}`,
    pose: 'thinking',
    kind: 'hint',
    stand: step.kind === 'ask_choice' ? 'look_students' : 'shake',
    fromModel: Boolean(model),
  });
  if (struggling) M.raiseAlert(code, groupId, 'struggling');
}

/* ---------- Questions libres et indices ---------- */

export async function askGriot(code: string, groupId: string, question: string) {
  const { lang, step, journey, workshop } = ctx(code, groupId);
  const q = question.trim().slice(0, 500);
  if (!q) throw new Error('Question vide');
  store.logEvent(code, groupId, 'student.question', { stepId: step?.id, question: q });
  remember(code, groupId, 'students', q);
  M.mutateGroup(code, groupId, (g) => {
    g.lesson.hintsUsed += 1;
    g.lesson.lastActivityAt = Date.now();
  });

  let answer: string | null = null;
  try {
    answer = await chat(askMessages({ journey, workshop, step, lang, question: q, recent: recent.get(`${code}:${groupId}`) ?? [] }), {
      temperature: 0.7,
      maxTokens: 220,
    });
  } catch (err) {
    if (!(err instanceof LlmUnavailableError)) console.warn('[lesson] askGriot :', (err as Error).message);
  }
  const fromModel = Boolean(answer);
  if (!answer) {
    const hintIdx = Math.min(ctx(code, groupId).group.lesson.hintsUsed - 1, (step?.hints.length ?? 1) - 1);
    const scripted = step?.hints[hintIdx];
    answer = scripted ? t(scripted, lang) : tx('askFallback', lang);
  }
  const u = griotSays(code, groupId, { text: answer, pose: 'thinking', kind: 'hint', stand: 'look_students', fromModel });
  if (ctx(code, groupId).group.lesson.hintsUsed >= 3) M.raiseAlert(code, groupId, 'struggling');
  return u;
}

export async function requestHint(code: string, groupId: string) {
  const { lang, step, group } = ctx(code, groupId);
  if (!step) return;
  const idx = Math.min(group.lesson.hintsUsed, step.hints.length - 1);
  const scripted = step.hints[idx];
  M.mutateGroup(code, groupId, (g) => {
    g.lesson.hintsUsed += 1;
    g.lesson.lastActivityAt = Date.now();
  });
  store.logEvent(code, groupId, 'hint.requested', { stepId: step.id, index: idx });
  griotSays(code, groupId, {
    text: scripted ? t(scripted, lang) : tx('noHint', lang),
    pose: 'thinking',
    kind: 'hint',
    stand: 'look_students',
  });
  if (group.lesson.hintsUsed + 1 >= 3) M.raiseAlert(code, groupId, 'struggling');
}

/* ---------- Fin d'atelier ---------- */

async function finishLesson(code: string, groupId: string) {
  const { lang, journey, workshop, group } = ctx(code, groupId);
  const total = workshop.steps.filter((s) => s.kind === 'ask_write' || s.kind === 'ask_choice').length;
  M.mutateGroup(code, groupId, (g) => {
    g.lesson.phase = 'done';
    g.lesson.finishedAt = Date.now();
    g.results[g.workshopId] = { score: g.lesson.score, total, hintsUsed: g.lesson.hintsUsed, finishedAt: g.lesson.finishedAt };
  });
  store.logEvent(code, groupId, 'lesson.done', { workshopId: group.workshopId, score: group.lesson.score, total, hintsUsed: group.lesson.hintsUsed });

  let summary: string | null = null;
  try {
    summary = await chat(summaryMessages({ journey, workshop, lang, score: group.lesson.score, total, hintsUsed: group.lesson.hintsUsed }), {
      temperature: 0.7,
      maxTokens: 220,
    });
  } catch {
    summary = null;
  }
  griotSays(code, groupId, { text: summary ?? tx('summary', lang), pose: 'celebrating', kind: 'tell', stand: 'nod', fromModel: Boolean(summary) });
  M.raiseAlert(code, groupId, 'completed');
}
