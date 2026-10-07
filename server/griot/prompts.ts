import fs from 'fs';
import path from 'path';
import { ROOT_DIR } from '../config';
import { LANG_LABELS, type ExerciseStep, type Lang, type Workshop, type Journey, t } from '../../shared/types';
import type { ChatMessage } from '../llm/provider';

/**
 * Construction des prompts du Griot. La charte éthique est chargée telle quelle :
 * c'est le même texte qui filtre les données de fine-tuning (finetune/).
 */

let charterCache: string | null = null;
export function loadCharter(): string {
  if (charterCache) return charterCache;
  const p = path.join(ROOT_DIR, 'ethics', 'charte-griot.md');
  try {
    charterCache = fs.readFileSync(p, 'utf8');
  } catch {
    charterCache = 'Tu es le Griot, un professeur africain, socratique, bienveillant et honnête.';
  }
  return charterCache;
}

const LANG_RULE: Record<Lang, string> = {
  fr: 'Tu réponds uniquement en français simple, oral, pour des élèves de 10 à 14 ans.',
  sw: 'Unajibu kwa Kiswahili sanifu, rahisi na cha mazungumzo, kwa wanafunzi wa miaka 10 hadi 14. Jibu kwa Kiswahili tu.',
};

export function systemPrompt(lang: Lang): string {
  return [
    loadCharter(),
    '',
    '## Consignes de génération',
    `Langue de la classe : ${LANG_LABELS[lang]}. ${LANG_RULE[lang]}`,
    'Deux à quatre phrases maximum, pensées pour être lues à voix haute. Pas de listes, pas de titres, pas de markdown, pas d’emoji.',
    'Tu parles au groupe (« vous »), jamais à un seul élève.',
    'Tu ne donnes jamais la réponse brute avant le troisième essai sincère du groupe.',
  ].join('\n');
}

export function lessonContext(journey: Journey, workshop: Workshop, step: ExerciseStep | undefined, lang: Lang): string {
  const lines = [
    `Parcours : ${t(journey.title, lang)} — ${t(journey.culture, lang)}, ${t(journey.period, lang)}.`,
    `Atelier : ${t(workshop.title, lang)} (${t(workshop.curriculum, lang)}).`,
    `Contexte : ${t(workshop.contextStory, lang)}`,
  ];
  if (step) {
    lines.push(`Étape en cours : ${t(step.prompt, lang)}`);
    if (step.expected) lines.push(`Réponse attendue : ${t(step.expected, lang)}`);
    if (step.rubric) lines.push(`Critères : ${t(step.rubric, lang)}`);
    if (step.options) {
      lines.push(`Choix proposés : ${step.options.map((o, i) => `${i + 1}) ${t(o, lang)}`).join(' ; ')}`);
      if (step.correctIndex !== undefined) lines.push(`Bonne réponse : ${step.correctIndex + 1}`);
    }
  }
  return lines.join('\n');
}

export interface JudgeResult {
  correct: boolean;
  partial: boolean;
  feedback: string;
  hint?: string;
}

export function judgeMessages(args: {
  journey: Journey;
  workshop: Workshop;
  step: ExerciseStep;
  lang: Lang;
  answer: string;
  attempt: number;
  maxAttempts: number;
}): ChatMessage[] {
  const { journey, workshop, step, lang, answer, attempt, maxAttempts } = args;
  const reveal = attempt >= maxAttempts;
  const user = [
    lessonContext(journey, workshop, step, lang),
    '',
    `Le groupe a écrit sur l’ardoise (lecture automatique, peut contenir des erreurs de lecture) : « ${answer} »`,
    `Essai numéro ${attempt} sur ${maxAttempts}.`,
    '',
    'Juge cette réponse selon la réponse attendue et les critères. Réponds en JSON strict avec ces clés :',
    '{"correct": true|false, "partial": true|false, "feedback": "2 à 3 phrases orales dans la langue de la classe", "hint": "une question ou un indice socratique si la réponse n’est pas correcte, sinon chaîne vide"}',
    reveal
      ? 'C’est le dernier essai : si la réponse est fausse, le feedback explique la solution complète avec le raisonnement, chaleureusement.'
      : 'Ce n’est pas le dernier essai : ne révèle pas la réponse, dis ce qui est juste dans la tentative et guide avec une question.',
    'Si la lecture semble illisible ou vide, "correct" est false, "partial" est false, et le feedback demande gentiment d’écrire plus gros et plus net.',
  ].join('\n');
  return [
    { role: 'system', content: systemPrompt(lang) },
    { role: 'user', content: user },
  ];
}

export function askMessages(args: {
  journey: Journey;
  workshop: Workshop;
  step: ExerciseStep | undefined;
  lang: Lang;
  question: string;
  recent: { role: 'griot' | 'students'; text: string }[];
}): ChatMessage[] {
  const { journey, workshop, step, lang, question, recent } = args;
  const history = recent
    .slice(-6)
    .map((r) => `${r.role === 'griot' ? 'Griot' : 'Groupe'} : ${r.text}`)
    .join('\n');
  const user = [
    lessonContext(journey, workshop, step, lang),
    history ? `\nDerniers échanges :\n${history}` : '',
    '',
    `Le groupe te demande : « ${question} »`,
    'Réponds en Griot : chaleureux, socratique, deux à trois phrases, avec une question ou un indice qui fait avancer le groupe sans donner la réponse de l’étape.',
  ].join('\n');
  return [
    { role: 'system', content: systemPrompt(lang) },
    { role: 'user', content: user },
  ];
}

export function summaryMessages(args: {
  journey: Journey;
  workshop: Workshop;
  lang: Lang;
  score: number;
  total: number;
  hintsUsed: number;
}): ChatMessage[] {
  const { journey, workshop, lang, score, total, hintsUsed } = args;
  const user = [
    lessonContext(journey, workshop, undefined, lang),
    '',
    `L’atelier est terminé. Le groupe a réussi ${score} étape(s) sur ${total}, en utilisant ${hintsUsed} indice(s).`,
    'Conclus en Griot : trois phrases chaleureuses qui nomment ce que le groupe a appris, relient à l’histoire, et préparent l’orateur pour le Grand Conseil. Pas de note chiffrée.',
  ].join('\n');
  return [
    { role: 'system', content: systemPrompt(lang) },
    { role: 'user', content: user },
  ];
}

export function visionReadMessages(lang: Lang, hint: string | undefined): ChatMessage[] {
  const user = [
    'Cette photo montre une ardoise ou une feuille sur laquelle un groupe d’élèves a écrit à la main.',
    'Transcris exactement ce qui est écrit, sans corriger, sans commenter. Chiffres, mots, opérations.',
    hint ? `Indice sur le contenu attendu (ne l’utilise pas pour inventer) : ${hint}` : '',
    'Réponds en JSON strict : {"text": "transcription", "confidence": 0.0 à 1.0, "empty": true|false}',
    `Si rien n’est écrit ou si c’est illisible, "empty" est true et "text" est vide.`,
    `Langue probable du texte : ${LANG_LABELS[lang]}.`,
  ]
    .filter(Boolean)
    .join('\n');
  return [
    { role: 'system', content: 'Tu es un lecteur OCR fidèle. Tu ne fais que transcrire.' },
    { role: 'user', content: user },
  ];
}
