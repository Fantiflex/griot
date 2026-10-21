/**
 * Textes du site vitrine. Anglais par défaut (professeurs, SkyDeck), français en option.
 * Règle : rien d'inventé. Chaque chiffre a une source ; ce qui n'est pas fait est marqué comme tel.
 */

export type SiteLang = 'en' | 'fr';

export const REPO_URL = 'https://github.com/Fantiflex/griot';
export const REPO_BRANCH_URL = 'https://github.com/Fantiflex/griot/tree/clement';
export const CHARTER_URL = 'https://github.com/Fantiflex/griot/blob/clement/ethics/charte-griot.md';
export const UNESCO_URL = 'https://digitallibrary.un.org/record/4039006?ln=en';

const EN = {
  nav: { problem: 'Problem', how: 'How it works', demo: 'Demo', tech: 'Technology', status: 'Status', code: 'Code' },
  hero: {
    eyebrow: 'AI for crowded classrooms',
    title: 'One phone per table. A patient teacher for every group.',
    body: 'LeGriot turns a single smartphone into a Socratic tutor for a group of eight. It tells a story, asks a question, reads what students write on their slate, and guides them with hints in their own language. The model runs on servers that schools control.',
    ctaDemo: 'Try the demo',
    ctaCode: 'Read the code',
    meta: ['Working prototype', 'French and Kiswahili', 'Open-weight model'],
    caption: 'One phone on a stand, eight students, one slate',
    phoneLabel: 'phone',
    slateLabel: 'slate',
  },
  problem: {
    eyebrow: 'The problem',
    title: 'Too many students per teacher, too few devices per student.',
    cards: [
      {
        stat: '15 million',
        title: 'teachers missing in sub-Saharan Africa by 2030',
        body: 'The region needs 15 million additional primary and secondary teachers by 2030, according to UNESCO and the Teacher Task Force.',
        source: { label: 'Global Report on Teachers, 2024', url: UNESCO_URL },
      },
      {
        stat: '1 teacher',
        title: 'for dozens of students',
        body: 'In a crowded class, a student rarely gets individual feedback on a mistake. Group work helps, but nobody is there to guide each group.',
      },
      {
        stat: '1 device',
        title: 'per group, not per student',
        body: 'Equipping every student is out of reach for most schools. One phone for eight students is a budget a school can actually plan.',
      },
    ],
  },
  how: {
    eyebrow: 'How it works',
    title: 'A lesson, as it happens in class.',
    steps: [
      { title: 'The teacher opens a class', body: 'In thirty seconds, with no accounts. A six-letter code appears on the teacher’s screen.' },
      { title: 'One phone per table', body: 'Each group joins with the code and sets the phone on a simple stand that faces the table.' },
      { title: 'The Griot teaches', body: 'It tells, asks, waits until students stop writing, reads the slate, then praises or gives a hint. It never gives the answer before three honest attempts.' },
      { title: 'The teacher sees every group', body: 'Live progress for each table, and an alert when a group is stuck or calls for help. The teacher stays in charge.' },
    ],
  },
  demo: {
    eyebrow: 'Try it',
    title: 'A math lesson from 14th-century Kilwa.',
    body: 'You are a group of students on the quay of Kilwa, trading rice for cloth. Answer as if you were writing on the slate. Try a wrong answer first to see how the Griot guides you, and watch the teacher view react.',
    note: 'This demo runs entirely in your browser with scripted feedback. In a real classroom, an open-weight model writes the feedback and the camera reads the slate.',
  },
  tech: {
    eyebrow: 'Technology',
    title: 'Sovereign by design.',
    cards: [
      { title: 'Open-weight model, on your servers', body: 'Gemma 3 behind a standard API. It runs on a school server or a rented GPU, and classroom data stays where the school decides.', tag: 'Working' },
      { title: 'It sees the slate', body: 'The camera triggers when the slate stops moving. Handwriting is read by OCR, and the Griot always confirms what it read before judging.', tag: 'Working, field test next' },
      { title: 'Built for noisy rooms', body: 'Push-to-talk, noise suppression, and speech recognition fine-tuned on classroom noise and African accents.', tag: 'In development' },
      { title: 'An ethics charter the model must follow', body: 'A short, readable, versioned text. It is both the model’s instructions and the filter for its training data.', tag: 'Working', link: { label: 'Read the charter (French)', url: CHARTER_URL } },
    ],
    loop: {
      title: 'It gets better with every classroom.',
      body: 'Each exchange can be reviewed by the teacher. Corrections that pass the charter become training data. A new version ships only if it beats the current one on a fixed test set.',
      steps: ['Class exchanges', 'Teacher corrections', 'Charter check', 'Retraining', 'Evaluation gate', 'New version'],
      status: 'Pipeline built. First training run pending.',
    },
  },
  charter: {
    eyebrow: 'Principles',
    items: [
      { title: 'Socratic first', body: 'Questions and hints before answers.' },
      { title: 'Dignity', body: 'Mistakes are a step, never a judgement.' },
      { title: 'African-centred', body: 'Stories, sciences and languages of the continent.' },
      { title: 'Honest', body: 'Says when it does not know, and asks the teacher.' },
      { title: 'Sovereign', body: 'Runs where the school decides. Data stays there.' },
    ],
  },
  status: {
    eyebrow: 'Where we are',
    title: 'An honest status.',
    cols: [
      {
        title: 'Built',
        items: [
          'Teacher console and group app, synced in real time',
          'Lesson engine that keeps working without the model',
          'Bilingual content in three subjects: math, language, history',
          'Fine-tuning and evaluation pipeline',
          'Firmware for an optional motorised stand',
          'Automated tests',
        ],
      },
      {
        title: 'Next',
        items: [
          'Field tests: several phones in a noisy room, 30 real slates',
          'Measure the base model, then the first fine-tuning run',
          'Native-speaker review of the Kiswahili content',
          'A first pilot in one school, with pre and post tests',
        ],
      },
      {
        title: 'Looking for',
        items: [
          'A faculty advisor. Research angles: speech recognition for African languages in noisy classrooms, and learning outcomes of group-based AI tutoring.',
          'A pilot school or school network',
          'Compute for training runs',
        ],
      },
    ],
  },
  contact: {
    title: 'Interested?',
    body: 'The code, the charter and the training pipeline are open. Get in touch through GitHub.',
    cta: 'Open the repository',
  },
  footer: { licence: 'MIT licence' },
};

const FR: typeof EN = {
  nav: { problem: 'Problème', how: 'Fonctionnement', demo: 'Démo', tech: 'Technologie', status: 'Avancement', code: 'Code' },
  hero: {
    eyebrow: 'De l’IA pour les classes surchargées',
    title: 'Un téléphone par table. Un professeur patient pour chaque groupe.',
    body: 'LeGriot transforme un seul smartphone en tuteur socratique pour un groupe de huit élèves. Il raconte, pose une question, lit ce que les élèves écrivent sur leur ardoise, puis les guide avec des indices, dans leur langue. Le modèle tourne sur des serveurs que les écoles contrôlent.',
    ctaDemo: 'Essayer la démo',
    ctaCode: 'Voir le code',
    meta: ['Prototype fonctionnel', 'Français et kiswahili', 'Modèle à poids ouverts'],
    caption: 'Un téléphone sur son support, huit élèves, une ardoise',
    phoneLabel: 'téléphone',
    slateLabel: 'ardoise',
  },
  problem: {
    eyebrow: 'Le problème',
    title: 'Trop d’élèves par enseignant, trop peu d’appareils par élève.',
    cards: [
      {
        stat: '15 millions',
        title: 'd’enseignants manquants en Afrique subsaharienne d’ici 2030',
        body: 'La région a besoin de 15 millions d’enseignants supplémentaires du primaire et du secondaire d’ici 2030, selon l’UNESCO et l’Équipe spéciale sur les enseignants.',
        source: { label: 'Rapport mondial sur les enseignants, 2024', url: UNESCO_URL },
      },
      {
        stat: '1 enseignant',
        title: 'pour des dizaines d’élèves',
        body: 'Dans une classe surchargée, un élève reçoit rarement un retour individuel sur son erreur. Le travail en groupe aide, mais personne ne guide chaque groupe.',
      },
      {
        stat: '1 appareil',
        title: 'par groupe, pas par élève',
        body: 'Équiper chaque élève est hors de portée pour la plupart des écoles. Un téléphone pour huit élèves, c’est un budget qu’une école peut réellement prévoir.',
      },
    ],
  },
  how: {
    eyebrow: 'Fonctionnement',
    title: 'Une leçon, telle qu’elle se passe en classe.',
    steps: [
      { title: 'L’enseignant ouvre une classe', body: 'En trente secondes, sans compte. Un code de six lettres s’affiche sur son écran.' },
      { title: 'Un téléphone par table', body: 'Chaque groupe rejoint avec le code et pose le téléphone sur un support simple, tourné vers la table.' },
      { title: 'Le Griot fait cours', body: 'Il raconte, demande, attend que les élèves aient fini d’écrire, lit l’ardoise, puis félicite ou donne un indice. Jamais la réponse avant trois essais sincères.' },
      { title: 'L’enseignant voit chaque groupe', body: 'La progression de chaque table en direct, et une alerte quand un groupe bloque ou appelle à l’aide. L’enseignant garde la main.' },
    ],
  },
  demo: {
    eyebrow: 'Essayez',
    title: 'Une leçon de maths dans la Kilwa du XIVe siècle.',
    body: 'Vous êtes un groupe d’élèves sur le quai de Kilwa, qui échange du riz contre du tissu. Répondez comme si vous écriviez sur l’ardoise. Essayez d’abord une mauvaise réponse pour voir comment le Griot guide, et regardez la vue enseignant réagir.',
    note: 'Cette démo tourne entièrement dans votre navigateur, avec des retours scriptés. En classe, un modèle à poids ouverts rédige les retours et la caméra lit l’ardoise.',
  },
  tech: {
    eyebrow: 'Technologie',
    title: 'Souverain par conception.',
    cards: [
      { title: 'Modèle ouvert, sur vos serveurs', body: 'Gemma 3 derrière une API standard. Il tourne sur un serveur d’école ou un GPU loué, et les données de classe restent là où l’école le décide.', tag: 'Fonctionne' },
      { title: 'Il voit l’ardoise', body: 'La caméra se déclenche quand l’ardoise ne bouge plus. L’écriture est lue par OCR, et le Griot confirme toujours ce qu’il a lu avant de juger.', tag: 'Fonctionne, test terrain à venir' },
      { title: 'Pensé pour les classes bruyantes', body: 'Appuyer pour parler, réduction du bruit, et reconnaissance vocale fine-tunée sur le bruit de classe et les accents africains.', tag: 'En développement' },
      { title: 'Une charte éthique que le modèle doit suivre', body: 'Un texte court, lisible et versionné. Il sert à la fois d’instructions au modèle et de filtre pour ses données d’entraînement.', tag: 'Fonctionne', link: { label: 'Lire la charte', url: CHARTER_URL } },
    ],
    loop: {
      title: 'Il s’améliore avec chaque classe.',
      body: 'Chaque échange peut être relu par l’enseignant. Les corrections conformes à la charte deviennent des données d’entraînement. Une nouvelle version n’est déployée que si elle bat l’actuelle sur un jeu de test figé.',
      steps: ['Échanges en classe', 'Corrections des enseignants', 'Contrôle de la charte', 'Réentraînement', 'Porte d’évaluation', 'Nouvelle version'],
      status: 'Pipeline construit. Premier entraînement à venir.',
    },
  },
  charter: {
    eyebrow: 'Principes',
    items: [
      { title: 'Socratique d’abord', body: 'Des questions et des indices avant les réponses.' },
      { title: 'Dignité', body: 'L’erreur est une étape, jamais un jugement.' },
      { title: 'Ancré en Afrique', body: 'Les récits, les sciences et les langues du continent.' },
      { title: 'Honnête', body: 'Dit quand il ne sait pas, et renvoie à l’enseignant.' },
      { title: 'Souverain', body: 'Tourne là où l’école le décide. Les données y restent.' },
    ],
  },
  status: {
    eyebrow: 'Où nous en sommes',
    title: 'Un état des lieux honnête.',
    cols: [
      {
        title: 'Construit',
        items: [
          'Console enseignant et app de groupe, synchronisées en direct',
          'Moteur de leçon qui fonctionne même sans le modèle',
          'Contenu bilingue en trois matières : maths, langue, histoire',
          'Pipeline de fine-tuning et d’évaluation',
          'Firmware d’un support motorisé optionnel',
          'Tests automatisés',
        ],
      },
      {
        title: 'Ensuite',
        items: [
          'Tests terrain : plusieurs téléphones dans une salle bruyante, 30 vraies ardoises',
          'Mesurer le modèle de base, puis le premier fine-tuning',
          'Relecture du contenu kiswahili par des locuteurs natifs',
          'Un premier pilote dans une école, avec tests avant et après',
        ],
      },
      {
        title: 'Nous cherchons',
        items: [
          'Un encadrant académique. Pistes de recherche : la reconnaissance vocale des langues africaines en classe bruyante, et les effets d’un tutorat IA de groupe sur les apprentissages.',
          'Une école ou un réseau d’écoles pilote',
          'Du calcul pour les entraînements',
        ],
      },
    ],
  },
  contact: {
    title: 'Intéressé ?',
    body: 'Le code, la charte et le pipeline d’entraînement sont ouverts. Contactez-nous via GitHub.',
    cta: 'Ouvrir le dépôt',
  },
  footer: { licence: 'Licence MIT' },
};

export const COPY: Record<SiteLang, typeof EN> = { en: EN, fr: FR };

export type SiteCopy = typeof EN;
