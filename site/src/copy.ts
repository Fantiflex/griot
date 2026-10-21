/**
 * Textes du site vitrine. Anglais par défaut (professeurs, SkyDeck), français en option.
 * Règle : rien d'inventé. Chaque chiffre a une source ; ce qui n'est pas fait est marqué comme tel.
 */

export type SiteLang = 'en' | 'fr';

export const REPO_URL = 'https://github.com/Fantiflex/griot';
export const CHARTER_URL = 'https://github.com/Fantiflex/griot/blob/clement/ethics/charte-griot.md';
export const UNESCO_URL = 'https://digitallibrary.un.org/record/4039006?ln=en';
export const UIS_URL = 'https://unesdoc.unesco.org/ark:/48223/pf0000246124';
export const UNICEF_URL = 'https://www.unicef.org/reports/generation-2030-africa-20';

export type Tone = 'red' | 'amber' | 'green' | 'clay';

const EN = {
  nav: { problem: 'Problem', solution: 'Solution', demo: 'Demo', tech: 'Technology', status: 'Status', cta: 'Try the demo', code: 'Code' },
  hero: {
    titleA: '15 million teachers missing.',
    titleB: 'One patient teacher for every table.',
    body: 'In classrooms of 40 to 80 students, one teacher cannot reach every child. LeGriot turns a single smartphone into a Socratic tutor for each group of eight. It tells a story, asks a question, reads what students write on their slate, and guides them with hints, in French or Kiswahili, on servers the school controls.',
    ctaDemo: 'Try the demo',
    ctaCode: 'Read the code',
    meta: ['Working prototype', 'French and Kiswahili', 'Open-weight model'],
  },
  stats: {
    cards: [
      { tone: 'red' as Tone, tag: 'Critical shortage', source: 'UNESCO 2024', url: UNESCO_URL, stat: '15 million', title: 'teachers missing in sub-Saharan Africa by 2030', body: 'One third of the 44 million teachers the world needs to recruit.' },
      { tone: 'amber' as Tone, tag: 'Crowded classrooms', source: 'UNESCO UIS', url: UIS_URL, stat: '42 : 1', title: 'pupils per teacher in primary school, on average', body: 'Up to 70 or 80 in countries such as Malawi or the Central African Republic.' },
      { tone: 'green' as Tone, tag: 'Demographics', source: 'UNICEF', url: UNICEF_URL, stat: '1 billion', title: 'children under 18 in Africa by mid-century', body: 'Almost 40 percent of all the children in the world.' },
    ],
    footnote: 'Sources: UNESCO and Teacher Task Force, Global Report on Teachers (2024) · UNESCO Institute for Statistics · UNICEF, Generation 2030 Africa 2.0 (2017)',
  },
  solution: {
    eyebrow: 'The solution',
    title: 'A teacher’s voice at every table.',
    body: 'One shared phone per group of eight. Students keep their pens, paper and slates. The Griot keeps the lesson moving, and the teacher sees every group at once.',
    features: [
      {
        img: 'img/classroom.webp',
        alt: 'Eight students around a table, a phone on a wooden stand in the middle',
        tag: 'Collaborative learning',
        title: 'Eight students, one phone, real paper.',
        body: 'The phone sits in the middle of the table. Students talk, argue and write together. The Griot asks the next question, listens to the group’s answer, and never hands out the solution before three honest attempts.',
        points: ['Peer reasoning', 'Paper and slate, no screen tapping'],
      },
      {
        img: 'img/stand.webp',
        alt: 'Illustration of a stand holding a screen and a camera above a notebook',
        tag: 'It sees the slate',
        title: 'A simple stand. A phone the school already has.',
        body: 'The stand points the camera at the table. When the slate stops moving, the Griot reads it, says what it read, then praises or gives a hint. A motorised stand exists as an option, not a requirement.',
        points: ['Reads handwriting', 'Always confirms before judging'],
      },
    ],
    illustration: 'Illustration',
    ratio: { stat: '1 : 8', title: 'One everyday smartphone for eight students.', body: 'Ten phones equip a class of eighty. No tablet per child, no computer room.' },
    tableCaption: 'One phone on a stand, eight students, one slate',
    phoneLabel: 'phone',
    slateLabel: 'slate',
  },
  pillars: {
    eyebrow: 'Pedagogy',
    title: 'Three principles of the LeGriot method.',
    items: [
      { icon: 'users', title: 'Collective reasoning', body: 'Knowledge is built by talking it through. In groups of eight, students defend their steps and fix their mistakes together, on real paper.', tags: 'Peer debate · Written reasoning' },
      { icon: 'voice', title: 'A Socratic voice', body: 'Rooted in Africa’s oral tradition of teaching. The whole table listens to one voice that tells, asks and gives hints, instead of eight children tapping on screens.', tags: 'Oral tradition · Questions before answers' },
      { icon: 'teacher', title: 'The teacher stays in charge', body: 'The Griot handles the routine pacing at each table. The teacher watches every group at a glance and steps in where a human is needed.', tags: 'Live overview · Alerts when a group is stuck' },
    ],
  },
  how: {
    eyebrow: 'How it works',
    title: 'A lesson, as it happens in class.',
    steps: [
      { title: 'The teacher opens a class', body: 'Thirty seconds, no accounts. A six-letter code appears on the teacher’s screen.' },
      { title: 'One phone per table', body: 'Each group joins with the code and sets the phone on its stand, facing the table.' },
      { title: 'The Griot teaches', body: 'It tells, asks, waits until students stop writing, reads the slate, then praises or gives a hint.' },
      { title: 'The teacher sees every group', body: 'Live progress for each table, and an alert when a group is stuck or calls for help.' },
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
    body: 'An African school should not depend on a foreign cloud to teach. Every part of LeGriot can run on hardware the school or the ministry controls.',
    cards: [
      { icon: 'server', title: 'Open-weight model, on your servers', body: 'Gemma 3 behind a standard API, on a school server or a rented GPU. Classroom data stays where the school decides.', tag: 'Working', done: true },
      { icon: 'eye', title: 'It sees the slate', body: 'The camera triggers when the slate stops moving. Handwriting is read by OCR, and the Griot confirms what it read before judging.', tag: 'Working · field test next', done: true },
      { icon: 'mic', title: 'Built for noisy rooms', body: 'Push-to-talk, noise suppression, and speech recognition fine-tuned on classroom noise and African accents.', tag: 'In development', done: false },
      { icon: 'shield', title: 'An ethics charter the model must follow', body: 'A short, readable, versioned text. It is both the model’s instructions and the filter for its training data.', tag: 'Working', done: true, link: { label: 'Read the charter (French)', url: CHARTER_URL } },
    ],
    loop: {
      title: 'It gets better with every classroom.',
      body: 'Teachers can review and correct any answer the Griot gives. Corrections that pass the charter become training data. A new version ships only if it beats the current one on a fixed test set.',
      steps: ['Class exchanges', 'Teacher corrections', 'Charter check', 'Retraining', 'Evaluation gate', 'New version'],
      status: 'Pipeline built · first training run pending',
    },
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
    title: 'Let’s bring a patient teacher to every table.',
    body: 'The code, the charter and the training pipeline are open. Get in touch through GitHub.',
    cta: 'Open the repository',
  },
  footer: { licence: 'MIT licence' },
};

const FR: typeof EN = {
  nav: { problem: 'Problème', solution: 'Solution', demo: 'Démo', tech: 'Technologie', status: 'Avancement', cta: 'Essayer la démo', code: 'Code' },
  hero: {
    titleA: '15 millions d’enseignants manquants.',
    titleB: 'Un professeur patient à chaque table.',
    body: 'Dans des classes de 40 à 80 élèves, un enseignant ne peut pas atteindre chaque enfant. LeGriot transforme un seul smartphone en tuteur socratique pour chaque groupe de huit. Il raconte, pose une question, lit ce que les élèves écrivent sur leur ardoise, puis les guide avec des indices, en français ou en kiswahili, sur des serveurs que l’école contrôle.',
    ctaDemo: 'Essayer la démo',
    ctaCode: 'Voir le code',
    meta: ['Prototype fonctionnel', 'Français et kiswahili', 'Modèle à poids ouverts'],
  },
  stats: {
    cards: [
      { tone: 'red', tag: 'Pénurie critique', source: 'UNESCO 2024', url: UNESCO_URL, stat: '15 millions', title: 'd’enseignants manquants en Afrique subsaharienne d’ici 2030', body: 'Un tiers des 44 millions d’enseignants que le monde doit recruter.' },
      { tone: 'amber', tag: 'Classes surchargées', source: 'UNESCO ISU', url: UIS_URL, stat: '42 : 1', title: 'élèves par enseignant au primaire, en moyenne', body: 'Jusqu’à 70 ou 80 dans des pays comme le Malawi ou la Centrafrique.' },
      { tone: 'green', tag: 'Démographie', source: 'UNICEF', url: UNICEF_URL, stat: '1 milliard', title: 'd’enfants de moins de 18 ans en Afrique vers le milieu du siècle', body: 'Près de 40 % de tous les enfants du monde.' },
    ],
    footnote: 'Sources : UNESCO et Équipe spéciale sur les enseignants, Rapport mondial sur les enseignants (2024) · Institut de statistique de l’UNESCO · UNICEF, Generation 2030 Africa 2.0 (2017)',
  },
  solution: {
    eyebrow: 'La solution',
    title: 'La voix d’un professeur à chaque table.',
    body: 'Un téléphone partagé par groupe de huit. Les élèves gardent leurs stylos, leurs cahiers et leurs ardoises. Le Griot fait avancer la leçon, et l’enseignant voit tous les groupes d’un coup d’œil.',
    features: [
      {
        img: 'img/classroom.webp',
        alt: 'Huit élèves autour d’une table, un téléphone sur un support en bois au centre',
        tag: 'Apprentissage collectif',
        title: 'Huit élèves, un téléphone, du vrai papier.',
        body: 'Le téléphone est posé au milieu de la table. Les élèves discutent, argumentent et écrivent ensemble. Le Griot pose la question suivante, écoute la réponse du groupe, et ne donne jamais la solution avant trois essais sincères.',
        points: ['Raisonnement entre pairs', 'Papier et ardoise, pas d’écran à toucher'],
      },
      {
        img: 'img/stand.webp',
        alt: 'Illustration d’un support tenant un écran et une caméra au-dessus d’un cahier',
        tag: 'Il voit l’ardoise',
        title: 'Un support simple. Un téléphone que l’école possède déjà.',
        body: 'Le support oriente la caméra vers la table. Quand l’ardoise ne bouge plus, le Griot la lit, dit ce qu’il a lu, puis félicite ou donne un indice. Un support motorisé existe en option, pas en obligation.',
        points: ['Lit l’écriture manuscrite', 'Confirme toujours avant de juger'],
      },
    ],
    illustration: 'Illustration',
    ratio: { stat: '1 : 8', title: 'Un smartphone ordinaire pour huit élèves.', body: 'Dix téléphones équipent une classe de quatre-vingts. Pas de tablette par enfant, pas de salle informatique.' },
    tableCaption: 'Un téléphone sur son support, huit élèves, une ardoise',
    phoneLabel: 'téléphone',
    slateLabel: 'ardoise',
  },
  pillars: {
    eyebrow: 'Pédagogie',
    title: 'Trois principes de la méthode LeGriot.',
    items: [
      { icon: 'users', title: 'Le raisonnement collectif', body: 'Le savoir se construit en discutant. En groupes de huit, les élèves défendent leurs étapes et corrigent leurs erreurs ensemble, sur du vrai papier.', tags: 'Débat entre pairs · Raisonnement écrit' },
      { icon: 'voice', title: 'Une voix socratique', body: 'Ancrée dans la tradition orale africaine. Toute la table écoute une seule voix qui raconte, questionne et donne des indices, au lieu de huit enfants penchés sur des écrans.', tags: 'Tradition orale · Les questions avant les réponses' },
      { icon: 'teacher', title: 'L’enseignant garde la main', body: 'Le Griot gère le rythme de routine à chaque table. L’enseignant suit tous les groupes d’un coup d’œil et intervient là où un humain est nécessaire.', tags: 'Vue d’ensemble en direct · Alerte quand un groupe bloque' },
    ],
  },
  how: {
    eyebrow: 'Fonctionnement',
    title: 'Une leçon, telle qu’elle se passe en classe.',
    steps: [
      { title: 'L’enseignant ouvre une classe', body: 'Trente secondes, sans compte. Un code de six lettres s’affiche sur son écran.' },
      { title: 'Un téléphone par table', body: 'Chaque groupe rejoint avec le code et pose le téléphone sur son support, tourné vers la table.' },
      { title: 'Le Griot fait cours', body: 'Il raconte, demande, attend que les élèves aient fini d’écrire, lit l’ardoise, puis félicite ou donne un indice.' },
      { title: 'L’enseignant voit chaque groupe', body: 'La progression de chaque table en direct, et une alerte quand un groupe bloque ou appelle à l’aide.' },
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
    body: 'Une école africaine ne devrait pas dépendre d’un cloud étranger pour enseigner. Chaque brique de LeGriot peut tourner sur du matériel que l’école ou le ministère contrôle.',
    cards: [
      { icon: 'server', title: 'Modèle ouvert, sur vos serveurs', body: 'Gemma 3 derrière une API standard, sur un serveur d’école ou un GPU loué. Les données de classe restent là où l’école le décide.', tag: 'Fonctionne', done: true },
      { icon: 'eye', title: 'Il voit l’ardoise', body: 'La caméra se déclenche quand l’ardoise ne bouge plus. L’écriture est lue par OCR, et le Griot confirme ce qu’il a lu avant de juger.', tag: 'Fonctionne · test terrain à venir', done: true },
      { icon: 'mic', title: 'Pensé pour les classes bruyantes', body: 'Appuyer pour parler, réduction du bruit, et reconnaissance vocale fine-tunée sur le bruit de classe et les accents africains.', tag: 'En développement', done: false },
      { icon: 'shield', title: 'Une charte éthique que le modèle doit suivre', body: 'Un texte court, lisible et versionné. Il sert à la fois d’instructions au modèle et de filtre pour ses données d’entraînement.', tag: 'Fonctionne', done: true, link: { label: 'Lire la charte', url: CHARTER_URL } },
    ],
    loop: {
      title: 'Il s’améliore avec chaque classe.',
      body: 'Les enseignants peuvent relire et corriger chaque réponse du Griot. Les corrections conformes à la charte deviennent des données d’entraînement. Une nouvelle version n’est déployée que si elle bat l’actuelle sur un jeu de test figé.',
      steps: ['Échanges en classe', 'Corrections des enseignants', 'Contrôle de la charte', 'Réentraînement', 'Porte d’évaluation', 'Nouvelle version'],
      status: 'Pipeline construit · premier entraînement à venir',
    },
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
    title: 'Mettons un professeur patient à chaque table.',
    body: 'Le code, la charte et le pipeline d’entraînement sont ouverts. Contactez-nous via GitHub.',
    cta: 'Ouvrir le dépôt',
  },
  footer: { licence: 'Licence MIT' },
};

export const COPY: Record<SiteLang, typeof EN> = { en: EN, fr: FR };
export type SiteCopy = typeof EN;
