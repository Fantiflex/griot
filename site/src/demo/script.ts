import { KILWA_JOURNEY } from '@content/journeys/kilwa';
import type { ExerciseStep, Workshop } from '@shared/types';

/**
 * Script de la démo du site : l'atelier de maths du vrai parcours Kilwa (français, kiswahili),
 * avec une traduction anglaise ajoutée ici pour les visiteurs anglophones.
 * Les classes réelles fonctionnent aujourd'hui en français et en kiswahili.
 */

export type DemoLang = 'en' | 'fr' | 'sw';

export interface DemoStep {
  id: string;
  kind: ExerciseStep['kind'];
  prompt: string;
  hints: string[];
  explanation?: string;
  options?: string[];
  correctIndex?: number;
  /** Étape d'origine, pour le juge partagé. */
  source: ExerciseStep;
  /** Réponses acceptées en plus, propres à la langue de la démo. */
  extraAccept: string[];
}

const MATH: Workshop = KILWA_JOURNEY.workshops.find((w) => w.subject === 'math')!;

const EN: Record<string, { prompt: string; hints?: string[]; explanation?: string; options?: string[]; accept?: string[] }> = {
  'm-intro': {
    prompt:
      'Welcome to the merchants’ table. Put your twelve pebbles in front of you: each pebble is a sack of rice. The scribe takes the chalk. When I ask a question, talk it over first, then write one answer on the slate.',
  },
  'm-ratio': {
    prompt:
      'The merchant trades three sacks of rice for two rolls of cloth. Your village brings twelve sacks. How many rolls of cloth should you receive? Write the number on the slate.',
    hints: [
      'Group your pebbles in piles of three. How many piles do you get?',
      'Each pile of three sacks gives two rolls. Four piles give how many rolls?',
      'Griot’s secret: when the rice is multiplied by four, so is the cloth. Multiply two by four.',
    ],
    explanation:
      'Twelve sacks is four times three sacks, so you get four times two rolls: eight rolls. The merchants of Kilwa did this in their heads, grouping the sacks by three.',
    accept: ['eight', '8 rolls', 'eight rolls'],
  },
  'm-fraction': {
    prompt:
      'A dhow carries sixty sacks. Three quarters of them hold rice, the rest hold salt. How many sacks of rice are there? Write the number.',
    hints: [
      'Start by finding one quarter of sixty. Share sixty into four equal parts.',
      'One quarter is fifteen. You need three quarters, not one.',
      'Griot’s secret: three quarters is the whole dhow minus one quarter. Sixty minus fifteen.',
    ],
    explanation: 'One quarter of sixty is fifteen. Three quarters is three times fifteen: forty-five sacks of rice, and fifteen sacks of salt.',
    accept: ['forty-five', 'forty five'],
  },
  'm-gold': {
    prompt:
      'Kilwa’s gold was weighed in mithqal. One mithqal weighs four and a quarter grams. How much do four mithqal weigh? Talk it over, then choose.',
    hints: [
      'Separate the whole grams from the quarter. Four times four grams first.',
      'Four times a quarter is like four quarters. What does that make?',
    ],
    explanation: 'Four times four grams is sixteen grams, and four times a quarter is one whole gram. Sixteen plus one: seventeen grams.',
    options: ['16 grams', '17 grams', '8.5 grams', '21 grams'],
  },
  'm-discuss': {
    prompt:
      'One last question for the circle, without the slate: why did the merchants of Kilwa prefer to trade by proportions rather than with coins? Everyone gives one idea, then the speaker sums it up in one sentence.',
  },
};

export const CONTEXT_EN =
  'On the quay of Kilwa, an Indian merchant offers cloth for rice. No coins here: you must count right, or the dhow leaves with your rice without leaving enough cloth for the village.';

export const LINES: Record<DemoLang, Record<'looking' | 'readAs' | 'correct' | 'correctChoice' | 'retry' | 'reveal' | 'empty' | 'done' | 'choices', string>> = {
  en: {
    looking: 'I am looking at your slate. Hold still for a moment.',
    readAs: 'I read:',
    correct: 'Yes! Your slate tells the truth.',
    correctChoice: 'Yes, that is the right choice.',
    retry: 'Not yet. There is something right in your attempt, but look again together.',
    reveal: 'You searched well. Here is the path to the answer.',
    empty: 'I cannot see anything on the slate. Write bigger, in the middle, and show me again.',
    done: 'Your workshop is complete. You worked together, searched, and found. Speaker, prepare one minute for the Grand Council.',
    choices: 'Here are the choices.',
  },
  fr: {
    looking: 'Je regarde votre ardoise. Ne bougez plus un instant.',
    readAs: 'J’ai lu :',
    correct: 'Oui ! Votre ardoise dit vrai.',
    correctChoice: 'Oui, c’est le bon choix.',
    retry: 'Pas encore. Il y a quelque chose de juste dans votre essai, mais regardez encore ensemble.',
    reveal: 'Vous avez bien cherché. Voici le chemin de la réponse.',
    empty: 'Je ne vois rien d’écrit sur l’ardoise. Écrivez plus gros, au centre, puis montrez-la moi encore.',
    done: 'Votre atelier est terminé. Vous avez travaillé ensemble, cherché, et trouvé. Orateur, prépare une minute de parole pour le Grand Conseil.',
    choices: 'Voici les choix.',
  },
  sw: {
    looking: 'Naangalia ubao wenu. Msisogee kidogo.',
    readAs: 'Nimesoma:',
    correct: 'Ndiyo! Ubao wenu unasema kweli.',
    correctChoice: 'Ndiyo, hilo ndilo chaguo sahihi.',
    retry: 'Bado. Kuna kitu sahihi katika jaribio lenu, lakini angalieni tena pamoja.',
    reveal: 'Mmetafuta vizuri. Hii ndiyo njia ya jibu.',
    empty: 'Sioni kitu kilichoandikwa ubaoni. Andikeni kwa herufi kubwa, katikati, kisha nionyesheni tena.',
    done: 'Warsha yenu imekamilika. Mmefanya kazi pamoja, mmetafuta, na mmepata. Msemaji, andaa dakika moja ya kuzungumza kwa Baraza Kuu.',
    choices: 'Hivi ndivyo vichaguo.',
  },
};

function local(text: { fr: string; sw?: string } | undefined, lang: Exclude<DemoLang, 'en'>): string {
  if (!text) return '';
  return lang === 'sw' ? text.sw ?? text.fr : text.fr;
}

export function demoContext(lang: DemoLang): string {
  return lang === 'en' ? CONTEXT_EN : local(MATH.contextStory, lang);
}

export function demoTitle(lang: DemoLang): string {
  return lang === 'en' ? 'The market of proportions' : local(MATH.title, lang);
}

export function demoSteps(lang: DemoLang): DemoStep[] {
  return MATH.steps.map((s) => {
    const en = EN[s.id];
    if (lang === 'en' && en) {
      return {
        id: s.id,
        kind: s.kind,
        prompt: en.prompt,
        hints: en.hints ?? [],
        explanation: en.explanation,
        options: en.options,
        correctIndex: s.correctIndex,
        source: s,
        extraAccept: en.accept ?? [],
      };
    }
    const l = lang === 'en' ? 'fr' : lang;
    return {
      id: s.id,
      kind: s.kind,
      prompt: local(s.prompt, l),
      hints: s.hints.map((h) => local(h, l)),
      explanation: s.explanation ? local(s.explanation, l) : undefined,
      options: s.options?.map((o) => local(o, l)),
      correctIndex: s.correctIndex,
      source: s,
      extraAccept: [],
    };
  });
}
