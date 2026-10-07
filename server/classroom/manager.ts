import { JOURNEYS, getJourney } from '../../content';
import type {
  AlertKind,
  ClassroomState,
  GroupState,
  GriotUtterance,
  Journey,
  Lang,
  LessonState,
  RoleType,
  StandAction,
  StandMove,
} from '../../shared/types';
import { config } from '../config';
import { store } from '../db';
import { bus } from '../bus';
import { newClassCode, newId, clamp } from '../util';
import { STAND_HOME, standSequence } from '../stand/presets';

/**
 * Source de vérité de l'état des classes. Tout passe par `mutate` :
 * sauvegarde SQLite, puis diffusion aux clients via le bus.
 */

const classrooms = new Map<string, ClassroomState>();

for (const c of store.loadAllClassrooms()) {
  // Les connexions ne survivent pas au redémarrage.
  for (const g of c.groups) {
    g.standConnected = false;
    g.joinedDevices = 0;
  }
  classrooms.set(c.code, c);
}
console.log(`[classroom] ${classrooms.size} classe(s) chargée(s)`);

const TOTEMS = [
  { name: { fr: 'Lion', sw: 'Simba' }, totem: '🦁', color: 'amber' },
  { name: { fr: 'Baobab', sw: 'Mbuyu' }, totem: '🌳', color: 'emerald' },
  { name: { fr: 'Fleuve', sw: 'Mto' }, totem: '🌊', color: 'sky' },
  { name: { fr: 'Gazelle', sw: 'Swala' }, totem: '🦌', color: 'orange' },
  { name: { fr: 'Éléphant', sw: 'Tembo' }, totem: '🐘', color: 'stone' },
  { name: { fr: 'Soleil', sw: 'Jua' }, totem: '☀️', color: 'yellow' },
  { name: { fr: 'Aigle', sw: 'Tai' }, totem: '🦅', color: 'indigo' },
  { name: { fr: 'Kora', sw: 'Kora' }, totem: '🪕', color: 'teal' },
  { name: { fr: 'Boutre', sw: 'Jahazi' }, totem: '⛵', color: 'rose' },
  { name: { fr: 'Tortue', sw: 'Kobe' }, totem: '🐢', color: 'lime' },
];

export function freshLesson(workshopId: string): LessonState {
  return {
    workshopId,
    stepIndex: 0,
    phase: 'idle',
    attempts: 0,
    hintsUsed: 0,
    score: 0,
    stepsCompleted: 0,
    lastActivityAt: Date.now(),
    struggling: false,
  };
}

function workshopIdForRotation(journey: Journey, groupIndex: number, rotation: number): string {
  const n = journey.workshops.length;
  const idx = rotation <= 0 || rotation > n ? groupIndex % n : (groupIndex + rotation - 1) % n;
  return journey.workshops[idx].id;
}

export interface CreateClassroomInput {
  name: string;
  lang: Lang;
  journeyId?: string;
  groupCount?: number;
  studentsPerGroup?: number;
  rotationMinutes?: number;
}

export function createClassroom(input: CreateClassroomInput): ClassroomState {
  const journey = getJourney(input.journeyId ?? '') ?? JOURNEYS[0];
  const groupCount = clamp(Math.round(input.groupCount ?? 6), 1, 10);
  const studentsPerGroup = clamp(Math.round(input.studentsPerGroup ?? 8), 2, 12);
  let code = newClassCode();
  while (classrooms.has(code)) code = newClassCode();
  const now = Date.now();

  const groups: GroupState[] = Array.from({ length: groupCount }, (_, i) => {
    const totem = TOTEMS[i % TOTEMS.length];
    const label = totem.name[input.lang] ?? totem.name.fr;
    return {
      id: `g${i + 1}`,
      classroomCode: code,
      index: i,
      name: `${label} ${i + 1}`,
      totem: totem.totem,
      color: totem.color,
      studentCount: studentsPerGroup,
      roles: { griot: '', scribe: '', architect: '', orator: '' },
      workshopId: workshopIdForRotation(journey, i, 1),
      lesson: freshLesson(workshopIdForRotation(journey, i, 1)),
      needsHelp: false,
      results: {},
      transcript: [],
      standConnected: false,
      standPose: { ...STAND_HOME },
      joinedDevices: 0,
      updatedAt: now,
    };
  });

  const classroom: ClassroomState = {
    code,
    name: input.name.trim() || `Classe ${code}`,
    lang: input.lang,
    journeyId: journey.id,
    rotation: 1,
    rotationMinutes: clamp(input.rotationMinutes ?? 35, 5, 120),
    timerEndsAt: null,
    timerPausedMs: null,
    groups,
    alerts: [],
    createdAt: now,
    updatedAt: now,
  };
  classrooms.set(code, classroom);
  store.saveClassroom(classroom);
  store.logEvent(code, null, 'classroom.created', { name: classroom.name, lang: classroom.lang, journeyId: journey.id, groupCount });
  bus.emit('classroom', classroom);
  return classroom;
}

export function getClassroom(code: string): ClassroomState | undefined {
  return classrooms.get(code.toUpperCase());
}

export function listClassrooms(): ClassroomState[] {
  return [...classrooms.values()].sort((a, b) => b.updatedAt - a.updatedAt);
}

export function getGroup(code: string, groupId: string): { classroom: ClassroomState; group: GroupState } | undefined {
  const classroom = getClassroom(code);
  const group = classroom?.groups.find((g) => g.id === groupId);
  return classroom && group ? { classroom, group } : undefined;
}

export function journeyOf(classroom: ClassroomState): Journey {
  return getJourney(classroom.journeyId) ?? JOURNEYS[0];
}

/** Mutation atomique d'une classe : sauvegarde puis diffusion. */
export function mutate(code: string, fn: (classroom: ClassroomState) => void | GroupState[]): ClassroomState | undefined {
  const classroom = getClassroom(code);
  if (!classroom) return undefined;
  const touched = fn(classroom) ?? [];
  classroom.updatedAt = Date.now();
  for (const g of touched) g.updatedAt = classroom.updatedAt;
  store.saveClassroom(classroom);
  bus.emit('classroom', classroom);
  for (const g of touched) bus.emit('group', g);
  return classroom;
}

export function mutateGroup(code: string, groupId: string, fn: (group: GroupState, classroom: ClassroomState) => void): GroupState | undefined {
  let result: GroupState | undefined;
  mutate(code, (classroom) => {
    const group = classroom.groups.find((g) => g.id === groupId);
    if (!group) return [];
    fn(group, classroom);
    result = group;
    return [group];
  });
  return result;
}

/* ---------- Parole du Griot et support ---------- */

export interface SayInput {
  text: string;
  pose: GriotUtterance['pose'];
  kind: GriotUtterance['kind'];
  stand?: StandAction;
  fromModel?: boolean;
}

export function say(code: string, groupId: string, input: SayInput): GriotUtterance | undefined {
  const found = getGroup(code, groupId);
  if (!found) return undefined;
  const utterance: GriotUtterance = {
    id: newId('u_'),
    classroomCode: found.classroom.code,
    groupId,
    kind: input.kind,
    text: input.text.trim(),
    lang: found.classroom.lang,
    pose: input.pose,
    stand: input.stand,
    fromModel: input.fromModel ?? false,
    at: Date.now(),
  };
  mutateGroup(code, groupId, (group) => {
    group.transcript.push(utterance);
    if (group.transcript.length > config.lesson.transcriptWindow) {
      group.transcript.splice(0, group.transcript.length - config.lesson.transcriptWindow);
    }
    group.lesson.lastActivityAt = utterance.at;
  });
  store.logEvent(code, groupId, 'griot.say', utterance);
  bus.emit('say', utterance);
  if (input.stand) moveStand(code, groupId, input.stand);
  return utterance;
}

export function moveStand(code: string, groupId: string, action: StandAction): StandMove[] {
  const seq = standSequence(action);
  const last = seq[seq.length - 1];
  mutateGroup(code, groupId, (group) => {
    group.standPose = { ...last };
  });
  for (const move of seq) bus.emit('stand.move', code, groupId, move);
  store.logEvent(code, groupId, 'stand.action', { action });
  return seq;
}

export function setStandConnected(code: string, groupId: string, connected: boolean) {
  mutateGroup(code, groupId, (group) => {
    group.standConnected = connected;
  });
  bus.emit('stand.state', code, groupId, connected);
}

export function adjustDevices(code: string, groupId: string, delta: number) {
  mutateGroup(code, groupId, (group) => {
    group.joinedDevices = Math.max(0, group.joinedDevices + delta);
  });
}

/* ---------- Alertes enseignant ---------- */

const ALERT_MESSAGES: Record<AlertKind, Record<Lang, string>> = {
  help_requested: { fr: 'demande l’aide de l’enseignant', sw: 'kinaomba msaada wa mwalimu' },
  struggling: { fr: 'bloque sur une étape malgré les indices', sw: 'kimekwama licha ya vidokezo' },
  inactive: { fr: 'n’a rien écrit depuis plusieurs minutes', sw: 'hakijaandika chochote kwa dakika kadhaa' },
  completed: { fr: 'a terminé son atelier', sw: 'kimemaliza warsha yake' },
};

export function raiseAlert(code: string, groupId: string, kind: AlertKind) {
  mutate(code, (classroom) => {
    const group = classroom.groups.find((g) => g.id === groupId);
    if (!group) return [];
    const duplicate = classroom.alerts.find((a) => a.groupId === groupId && a.kind === kind && !a.acknowledged);
    if (duplicate) return [];
    classroom.alerts.push({
      id: newId('al_'),
      groupId,
      kind,
      message: `${group.totem} ${group.name} ${ALERT_MESSAGES[kind][classroom.lang]}`,
      at: Date.now(),
      acknowledged: false,
    });
    if (classroom.alerts.length > 100) classroom.alerts.splice(0, classroom.alerts.length - 100);
    return [];
  });
  store.logEvent(code, groupId, 'alert', { kind });
}

export function acknowledgeAlert(code: string, alertId: string) {
  mutate(code, (classroom) => {
    const alert = classroom.alerts.find((a) => a.id === alertId);
    if (alert) alert.acknowledged = true;
    return [];
  });
}

export function setHelp(code: string, groupId: string, needed: boolean, note?: string) {
  mutateGroup(code, groupId, (group) => {
    group.needsHelp = needed;
    group.helpNote = needed ? note : undefined;
  });
  if (needed) raiseAlert(code, groupId, 'help_requested');
  else {
    mutate(code, (classroom) => {
      for (const a of classroom.alerts) if (a.groupId === groupId && a.kind === 'help_requested') a.acknowledged = true;
      return [];
    });
  }
  store.logEvent(code, groupId, 'help', { needed, note });
}

export function setRole(code: string, groupId: string, role: RoleType, name: string) {
  mutateGroup(code, groupId, (group) => {
    group.roles[role] = name.trim().slice(0, 40);
  });
}

/* ---------- Rotations et chrono ---------- */

export function setRotation(code: string, rotation: number) {
  mutate(code, (classroom) => {
    const journey = journeyOf(classroom);
    const n = journey.workshops.length;
    classroom.rotation = clamp(rotation, 0, n + 1);
    for (const g of classroom.groups) {
      // Archive le résultat de l'atelier en cours s'il a démarré.
      if (g.lesson.phase !== 'idle') {
        g.results[g.lesson.workshopId] = {
          score: g.lesson.score,
          total: g.lesson.stepsCompleted,
          hintsUsed: g.lesson.hintsUsed,
          finishedAt: g.lesson.finishedAt,
        };
      }
      const wid = workshopIdForRotation(journey, g.index, classroom.rotation);
      g.workshopId = wid;
      g.lesson = freshLesson(wid);
      g.needsHelp = false;
      g.helpNote = undefined;
    }
    classroom.alerts = [];
    const active = classroom.rotation >= 1 && classroom.rotation <= n;
    classroom.timerEndsAt = active ? Date.now() + classroom.rotationMinutes * 60_000 : null;
    classroom.timerPausedMs = null;
    return classroom.groups;
  });
  store.logEvent(code, null, 'rotation', { rotation });
}

export function toggleTimer(code: string) {
  mutate(code, (classroom) => {
    if (classroom.timerEndsAt) {
      classroom.timerPausedMs = Math.max(0, classroom.timerEndsAt - Date.now());
      classroom.timerEndsAt = null;
    } else {
      const remaining = classroom.timerPausedMs ?? classroom.rotationMinutes * 60_000;
      classroom.timerEndsAt = Date.now() + remaining;
      classroom.timerPausedMs = null;
    }
    return [];
  });
}

export function setRotationMinutes(code: string, minutes: number) {
  mutate(code, (classroom) => {
    classroom.rotationMinutes = clamp(Math.round(minutes), 5, 120);
    classroom.timerEndsAt = null;
    classroom.timerPausedMs = null;
    return [];
  });
}

/* ---------- Surveillance d'inactivité ---------- */

const WAITING_PHASES = new Set(['waiting_slate', 'waiting_choice', 'discussion']);

export function sweepInactivity() {
  const now = Date.now();
  for (const classroom of classrooms.values()) {
    for (const g of classroom.groups) {
      if (!WAITING_PHASES.has(g.lesson.phase)) continue;
      if (now - g.lesson.lastActivityAt > config.lesson.inactivityAlertMs) {
        raiseAlert(classroom.code, g.id, 'inactive');
      }
    }
  }
}

export function classroomCount(): number {
  return classrooms.size;
}
