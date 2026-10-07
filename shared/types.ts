/**
 * Types partagés entre le serveur (server/) et le client (src/).
 * Source de vérité du modèle de données LeGriot.
 */

export type Lang = 'fr' | 'sw';
export const LANGS: Lang[] = ['fr', 'sw'];
export const LANG_LABELS: Record<Lang, string> = { fr: 'Français', sw: 'Kiswahili' };

/** Texte localisé. Le français est obligatoire, les autres langues optionnelles. */
export type Localized = { fr: string } & Partial<Record<Exclude<Lang, 'fr'>, string>>;

export function t(text: Localized | undefined, lang: Lang): string {
  if (!text) return '';
  return text[lang] ?? text.fr;
}

export type SubjectKind = 'language' | 'math' | 'history';

export const SUBJECT_LABELS: Record<SubjectKind, Localized> = {
  language: { fr: 'Langue & écriture', sw: 'Lugha na uandishi' },
  math: { fr: 'Mathématiques', sw: 'Hisabati' },
  history: { fr: 'Histoire & géographie', sw: 'Historia na jiografia' },
};

export type StepKind = 'tell' | 'ask_write' | 'ask_choice' | 'discuss';

export interface ExerciseStep {
  id: string;
  kind: StepKind;
  /** Ce que le Griot dit pour lancer l'étape. */
  prompt: Localized;
  /** Réponse attendue (texte court) pour les étapes ask_write. */
  expected?: Localized;
  /** Variantes acceptées pour le juge déterministe (normalisées). */
  accept?: string[];
  /** Critères de jugement donnés au modèle. */
  rubric?: Localized;
  /** Explication complète révélée après plusieurs essais ou en cas de réussite. */
  explanation?: Localized;
  options?: Localized[];
  correctIndex?: number;
  hints: Localized[];
  /** Où le support robotisé doit regarder pendant l'étape. */
  lookAt?: 'slate' | 'students';
  /** Délai maximum avant que le Griot relance le groupe. */
  maxSeconds?: number;
}

export interface Workshop {
  id: string;
  subject: SubjectKind;
  title: Localized;
  curriculum: Localized;
  contextStory: Localized;
  materials: Localized;
  teacherNote: Localized;
  steps: ExerciseStep[];
}

export interface Journey {
  id: string;
  title: Localized;
  subtitle: Localized;
  culture: Localized;
  period: Localized;
  theme: Localized;
  prologue: Localized;
  coreQuestion: Localized;
  workshops: Workshop[];
  plenary: {
    title: Localized;
    description: Localized;
    finalPrompt: Localized;
  };
}

export type GriotPose =
  | 'welcoming'
  | 'storytelling'
  | 'thinking'
  | 'thumbsUp'
  | 'celebrating'
  | 'listening'
  | 'looking';

export type StandAction = 'center' | 'look_slate' | 'look_students' | 'nod' | 'shake' | 'scan';

/** Primitive de mouvement envoyée au support (réel ou simulé). Angles en degrés 0-180. */
export interface StandMove {
  pan: number;
  tilt: number;
  /** Durée du mouvement en ms. */
  ms: number;
}

export type UtteranceKind = 'tell' | 'ask' | 'hint' | 'feedback' | 'answer' | 'system';

export interface GriotUtterance {
  id: string;
  classroomCode: string;
  groupId: string;
  kind: UtteranceKind;
  text: string;
  lang: Lang;
  pose: GriotPose;
  stand?: StandAction;
  /** Vrai si le texte vient du modèle, faux s'il vient du script. */
  fromModel: boolean;
  at: number;
}

export type LessonPhase =
  | 'idle'
  | 'intro'
  | 'telling'
  | 'waiting_slate'
  | 'waiting_choice'
  | 'reading'
  | 'feedback'
  | 'discussion'
  | 'done';

export interface SlateReading {
  text: string;
  latex?: string;
  confidence: number;
  provider: 'mathpix' | 'vision-llm' | 'typed' | 'none';
  at: number;
}

export interface Verdict {
  correct: boolean;
  partial: boolean;
  summary: string;
  fromModel: boolean;
}

export interface LessonState {
  workshopId: string;
  stepIndex: number;
  phase: LessonPhase;
  attempts: number;
  hintsUsed: number;
  score: number;
  stepsCompleted: number;
  startedAt?: number;
  finishedAt?: number;
  lastActivityAt: number;
  lastReading?: SlateReading;
  lastVerdict?: Verdict;
  struggling: boolean;
}

export interface WorkshopResult {
  score: number;
  total: number;
  hintsUsed: number;
  finishedAt?: number;
}

export type RoleType = 'griot' | 'scribe' | 'architect' | 'orator';
export const ROLE_LABELS: Record<RoleType, Localized> = {
  griot: { fr: 'Griot de table', sw: 'Griot wa meza' },
  scribe: { fr: 'Scribe', sw: 'Mwandishi' },
  architect: { fr: 'Bâtisseur', sw: 'Mjenzi' },
  orator: { fr: 'Orateur', sw: 'Msemaji' },
};

export interface GroupState {
  id: string;
  classroomCode: string;
  index: number;
  name: string;
  totem: string;
  color: string;
  studentCount: number;
  roles: Record<RoleType, string>;
  workshopId: string;
  lesson: LessonState;
  needsHelp: boolean;
  helpNote?: string;
  /** Résultats par atelier terminé (une entrée par rotation). */
  results: Record<string, WorkshopResult>;
  /** Dernières interventions, du plus ancien au plus récent (fenêtre glissante). */
  transcript: GriotUtterance[];
  standConnected: boolean;
  /** Dernière position connue du support. */
  standPose: StandMove;
  joinedDevices: number;
  updatedAt: number;
}

export type AlertKind = 'help_requested' | 'struggling' | 'inactive' | 'completed';

export interface TeacherAlert {
  id: string;
  groupId: string;
  kind: AlertKind;
  message: string;
  at: number;
  acknowledged: boolean;
}

export interface ClassroomState {
  code: string;
  name: string;
  lang: Lang;
  journeyId: string;
  /** 0 = prologue, 1..3 = rotations, 4 = conseil final. */
  rotation: number;
  rotationMinutes: number;
  /** Fin du chrono en cours (ms epoch), null si arrêté. */
  timerEndsAt: number | null;
  /** Temps restant mémorisé quand le chrono est en pause. */
  timerPausedMs: number | null;
  groups: GroupState[];
  alerts: TeacherAlert[];
  createdAt: number;
  updatedAt: number;
}

export interface HealthReport {
  ok: boolean;
  llm: { reachable: boolean; baseUrl: string; model: string; visionModel: string; error?: string };
  tts: { reachable: boolean; url: string };
  perception: { mathpix: boolean };
  classrooms: number;
}

/* ---------- Protocole WebSocket ---------- */

export type ClientMessage =
  | { type: 'subscribe'; code: string; role: 'teacher' | 'group'; groupId?: string }
  | { type: 'ping' };

export type ServerMessage =
  | { type: 'classroom.state'; classroom: ClassroomState }
  | { type: 'group.state'; group: GroupState }
  | { type: 'griot.say'; utterance: GriotUtterance }
  | { type: 'stand.move'; groupId: string; move: StandMove }
  | { type: 'stand.state'; groupId: string; connected: boolean }
  | { type: 'error'; message: string }
  | { type: 'pong' };

/** Messages échangés avec le firmware ESP32 (WebSocket /ws/stand). */
export type StandServerMessage =
  | { cmd: 'move'; pan: number; tilt: number; ms: number }
  | { cmd: 'hello'; groupId: string };
export type StandClientMessage =
  | { type: 'hello'; firmware: string }
  | { type: 'state'; pan: number; tilt: number; battery?: number };
