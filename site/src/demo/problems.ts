/**
 * Contenu de la démo du site : trois problèmes de maths de collège, sans habillage folklorique.
 * Pour chaque réponse fausse fréquente, un diagnostic (ce que l'élève a probablement fait)
 * et une relance socratique qui ne donne pas la réponse.
 * EN et FR relus ; SW à faire relire par un locuteur natif.
 */

export type DemoLang = 'en' | 'fr' | 'sw';
type L = Record<DemoLang, string>;

export interface Misconception {
  answers: string[];
  label: L; // diagnostic affiché dans « Ce que pense le Griot »
  reply: L; // ce que dit le Griot au groupe
}

export interface Problem {
  id: string;
  topic: L;
  question: L;
  answer: string;
  misconceptions: Misconception[];
  hints: [L, L]; // indice 1 (question), indice 2 (plus précis)
  worked: L; // solution expliquée après 3 essais
  praise: L;
}

export const PROBLEMS: Problem[] = [
  {
    id: 'fraction',
    topic: { en: 'Fractions', fr: 'Fractions', sw: 'Sehemu' },
    question: {
      en: 'What is three quarters of 60?',
      fr: 'Combien font les trois quarts de 60 ?',
      sw: 'Robo tatu ya 60 ni ngapi?',
    },
    answer: '45',
    misconceptions: [
      {
        answers: ['15'],
        label: { en: 'Found one quarter, not three quarters', fr: 'A trouvé un quart, pas trois quarts', sw: 'Amepata robo moja, si robo tatu' },
        reply: {
          en: 'You found one quarter of 60, and that part is right. The question asks for three quarters: how many of those parts do you need?',
          fr: 'Vous avez trouvé un quart de 60, et c’est juste. La question demande trois quarts : combien de ces parts vous faut-il ?',
          sw: 'Mmepata robo moja ya 60, na hiyo ni sahihi. Swali linauliza robo tatu: mnahitaji sehemu ngapi kati ya hizo?',
        },
      },
      {
        answers: ['20'],
        label: { en: 'Divided by 3 instead of 4', fr: 'A divisé par 3 au lieu de 4', sw: 'Amegawanya kwa 3 badala ya 4' },
        reply: {
          en: 'You divided 60 by 3. A quarter means four equal parts. How big is one of them?',
          fr: 'Vous avez divisé 60 par 3. Un quart, c’est quatre parts égales. Combien vaut une de ces parts ?',
          sw: 'Mmegawanya 60 kwa 3. Robo ni sehemu nne sawa. Sehemu moja ni ngapi?',
        },
      },
      {
        answers: ['80'],
        label: { en: 'Divided by ¾ instead of multiplying', fr: 'A divisé par ¾ au lieu de multiplier', sw: 'Amegawanya kwa ¾ badala ya kuzidisha' },
        reply: {
          en: '80 is bigger than 60, so it cannot be a part of 60. Did you divide when you needed to take a part?',
          fr: '80 est plus grand que 60, ce ne peut pas être une partie de 60. Avez-vous divisé au lieu de prendre une part ?',
          sw: '80 ni kubwa kuliko 60, kwa hiyo haiwezi kuwa sehemu ya 60. Je, mmegawanya badala ya kuchukua sehemu?',
        },
      },
      {
        answers: ['180'],
        label: { en: 'Multiplied by 3, forgot to divide by 4', fr: 'A multiplié par 3, oublié de diviser par 4', sw: 'Amezidisha kwa 3, amesahau kugawanya kwa 4' },
        reply: {
          en: 'You multiplied by 3, good start. Three quarters also means sharing into four parts. What is missing?',
          fr: 'Vous avez multiplié par 3, bon début. Trois quarts, c’est aussi partager en quatre. Que manque-t-il ?',
          sw: 'Mmezidisha kwa 3, mwanzo mzuri. Robo tatu pia ni kugawanya katika sehemu nne. Nini kinakosekana?',
        },
      },
    ],
    hints: [
      {
        en: 'Start with one quarter: share 60 into four equal parts. How big is one part?',
        fr: 'Commencez par un quart : partagez 60 en quatre parts égales. Combien vaut une part ?',
        sw: 'Anzeni na robo moja: gawanyeni 60 katika sehemu nne sawa. Sehemu moja ni ngapi?',
      },
      {
        en: 'One quarter of 60 is 15. Three quarters is three of those parts.',
        fr: 'Un quart de 60, c’est 15. Trois quarts, c’est trois de ces parts.',
        sw: 'Robo moja ya 60 ni 15. Robo tatu ni sehemu tatu kati ya hizo.',
      },
    ],
    worked: {
      en: 'Here is the path: 60 ÷ 4 = 15, then 15 × 3 = 45. Three quarters of 60 is 45.',
      fr: 'Voici le chemin : 60 ÷ 4 = 15, puis 15 × 3 = 45. Les trois quarts de 60 font 45.',
      sw: 'Njia ni hii: 60 ÷ 4 = 15, kisha 15 × 3 = 45. Robo tatu ya 60 ni 45.',
    },
    praise: {
      en: 'Yes! 60 ÷ 4 = 15, and 15 × 3 = 45.',
      fr: 'Oui ! 60 ÷ 4 = 15, et 15 × 3 = 45.',
      sw: 'Ndiyo! 60 ÷ 4 = 15, na 15 × 3 = 45.',
    },
  },
  {
    id: 'equation',
    topic: { en: 'Equations', fr: 'Équations', sw: 'Milinganyo' },
    question: {
      en: 'Solve 3x + 5 = 20. What is x?',
      fr: 'Résolvez 3x + 5 = 20. Que vaut x ?',
      sw: 'Tatueni 3x + 5 = 20. x ni ngapi?',
    },
    answer: '5',
    misconceptions: [
      {
        answers: ['15'],
        label: { en: 'Removed the +5, forgot to divide by 3', fr: 'A retiré le +5, oublié de diviser par 3', sw: 'Ameondoa +5, amesahau kugawanya kwa 3' },
        reply: {
          en: 'You removed the 5 correctly: 3x = 15. But 3x means three times x. What is x itself?',
          fr: 'Vous avez bien retiré le 5 : 3x = 15. Mais 3x, c’est trois fois x. Que vaut x lui-même ?',
          sw: 'Mmeondoa 5 vizuri: 3x = 15. Lakini 3x ni mara tatu ya x. x yenyewe ni ngapi?',
        },
      },
      {
        answers: ['8', '25'],
        label: { en: 'Added 5 instead of subtracting it', fr: 'A ajouté 5 au lieu de le soustraire', sw: 'Ameongeza 5 badala ya kutoa' },
        reply: {
          en: 'Careful with the +5. To undo adding 5, we take 5 away from both sides. What is 20 − 5?',
          fr: 'Attention au +5. Pour défaire « ajouter 5 », on retire 5 des deux côtés. Combien fait 20 − 5 ?',
          sw: 'Angalieni +5. Ili kuondoa 5 iliyoongezwa, tunatoa 5 pande zote mbili. 20 − 5 ni ngapi?',
        },
      },
      {
        answers: ['45'],
        label: { en: 'Multiplied by 3 instead of dividing', fr: 'A multiplié par 3 au lieu de diviser', sw: 'Amezidisha kwa 3 badala ya kugawanya' },
        reply: {
          en: '3x means 3 times x. To undo a multiplication, which operation do you use?',
          fr: '3x veut dire 3 fois x. Pour défaire une multiplication, quelle opération utilise-t-on ?',
          sw: '3x maana yake ni mara 3 ya x. Ili kuondoa kuzidisha, tunatumia operesheni gani?',
        },
      },
      {
        answers: ['3'],
        label: { en: 'Divided by 5 instead of 3', fr: 'A divisé par 5 au lieu de 3', sw: 'Amegawanya kwa 5 badala ya 3' },
        reply: {
          en: 'The number stuck to x is 3, not 5. Once you have 3x = 15, what do you divide by?',
          fr: 'Le nombre collé à x, c’est 3, pas 5. Une fois que 3x = 15, par quoi divise-t-on ?',
          sw: 'Namba iliyoshikamana na x ni 3, si 5. Mkishapata 3x = 15, mnagawanya kwa nini?',
        },
      },
    ],
    hints: [
      {
        en: 'First get 3x alone. What must you do to both sides to remove the +5?',
        fr: 'Isolez d’abord 3x. Que faut-il faire des deux côtés pour enlever le +5 ?',
        sw: 'Kwanza bakiza 3x peke yake. Mfanye nini pande zote mbili kuondoa +5?',
      },
      {
        en: 'Now 3x = 15. Which number times 3 makes 15?',
        fr: 'Maintenant 3x = 15. Quel nombre multiplié par 3 donne 15 ?',
        sw: 'Sasa 3x = 15. Namba gani mara 3 inatoa 15?',
      },
    ],
    worked: {
      en: 'Here is the path: 20 − 5 = 15, then 15 ÷ 3 = 5. Check it: 3 × 5 + 5 = 20.',
      fr: 'Voici le chemin : 20 − 5 = 15, puis 15 ÷ 3 = 5. Vérifions : 3 × 5 + 5 = 20.',
      sw: 'Njia ni hii: 20 − 5 = 15, kisha 15 ÷ 3 = 5. Hakikisheni: 3 × 5 + 5 = 20.',
    },
    praise: {
      en: 'Yes! And you can always check: 3 × 5 + 5 = 20.',
      fr: 'Oui ! Et on peut toujours vérifier : 3 × 5 + 5 = 20.',
      sw: 'Ndiyo! Na mnaweza kuhakikisha kila wakati: 3 × 5 + 5 = 20.',
    },
  },
  {
    id: 'percent',
    topic: { en: 'Percentages', fr: 'Pourcentages', sw: 'Asilimia' },
    question: {
      en: 'A price of 80 is reduced by 25%. What is the new price?',
      fr: 'Un prix de 80 baisse de 25 %. Quel est le nouveau prix ?',
      sw: 'Bei ya 80 inapunguzwa kwa asilimia 25. Bei mpya ni ngapi?',
    },
    answer: '60',
    misconceptions: [
      {
        answers: ['20'],
        label: { en: 'Found the discount, not the new price', fr: 'A trouvé la réduction, pas le nouveau prix', sw: 'Amepata punguzo, si bei mpya' },
        reply: {
          en: 'Well done, 20 is the discount. The question asks for the price after the discount. What is left?',
          fr: 'Bravo, 20 est bien la réduction. La question demande le prix après la réduction. Que reste-t-il ?',
          sw: 'Vizuri, 20 ndilo punguzo. Swali linauliza bei baada ya punguzo. Kinabaki nini?',
        },
      },
      {
        answers: ['55'],
        label: { en: 'Subtracted 25 instead of 25%', fr: 'A retiré 25 au lieu de 25 %', sw: 'Ametoa 25 badala ya asilimia 25' },
        reply: {
          en: '25% is not the number 25. It means 25 out of every 100. What is 25% of 80?',
          fr: '25 %, ce n’est pas le nombre 25. C’est 25 sur 100. Combien font 25 % de 80 ?',
          sw: 'Asilimia 25 si namba 25. Ni 25 kwa kila 100. Asilimia 25 ya 80 ni ngapi?',
        },
      },
      {
        answers: ['100', '105'],
        label: { en: 'Increased the price instead of reducing it', fr: 'A augmenté le prix au lieu de le baisser', sw: 'Ameongeza bei badala ya kupunguza' },
        reply: {
          en: 'The price is reduced, so the new price must be smaller than 80. Look again at the operation.',
          fr: 'Le prix baisse, donc le nouveau prix doit être plus petit que 80. Regardez à nouveau l’opération.',
          sw: 'Bei inapunguzwa, kwa hiyo bei mpya lazima iwe ndogo kuliko 80. Angalieni tena operesheni.',
        },
      },
    ],
    hints: [
      {
        en: '25% is a simple fraction. Which one? Use it to find the discount.',
        fr: '25 %, c’est une fraction simple. Laquelle ? Servez-vous-en pour trouver la réduction.',
        sw: 'Asilimia 25 ni sehemu rahisi. Ni ipi? Itumieni kupata punguzo.',
      },
      {
        en: '25% of 80 is 20. What is left when you take 20 away from 80?',
        fr: '25 % de 80, c’est 20. Que reste-t-il quand on enlève 20 à 80 ?',
        sw: 'Asilimia 25 ya 80 ni 20. Kinabaki nini mkitoa 20 kutoka 80?',
      },
    ],
    worked: {
      en: 'Here is the path: 25% is one quarter, so the discount is 80 ÷ 4 = 20, and 80 − 20 = 60.',
      fr: 'Voici le chemin : 25 %, c’est un quart, donc la réduction vaut 80 ÷ 4 = 20, et 80 − 20 = 60.',
      sw: 'Njia ni hii: asilimia 25 ni robo, kwa hiyo punguzo ni 80 ÷ 4 = 20, na 80 − 20 = 60.',
    },
    praise: {
      en: 'Yes! 25% of 80 is 20, and 80 − 20 = 60.',
      fr: 'Oui ! 25 % de 80 font 20, et 80 − 20 = 60.',
      sw: 'Ndiyo! Asilimia 25 ya 80 ni 20, na 80 − 20 = 60.',
    },
  },
];

/** Diagnostic d'une réponse : juste, erreur connue, ou erreur inconnue. */
export type Diagnosis = { kind: 'correct' } | { kind: 'known'; m: Misconception } | { kind: 'unknown' };

export function diagnose(p: Problem, answer: string): Diagnosis {
  const a = answer.replace(/[^0-9]/g, '').replace(/^0+(?=\d)/, '');
  if (a === p.answer) return { kind: 'correct' };
  const m = p.misconceptions.find((mm) => mm.answers.includes(a));
  return m ? { kind: 'known', m } : { kind: 'unknown' };
}
