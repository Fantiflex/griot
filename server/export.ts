import { store, type StoredEvent } from './db';
import { JOURNEYS, getJourney, getWorkshop } from '../content';
import { t, type GriotUtterance, type Lang } from '../shared/types';
import * as M from './classroom/manager';

/**
 * Export des dialogues de classe au format d'entraînement (JSONL, messages chat).
 * Chaque ligne : { messages: [system?, user, assistant], meta: {...} }
 * Consommé par finetune/scripts/prepare_dataset.py. Les dialogues restent sur le serveur
 * de l'établissement : l'export est une action explicite de l'enseignant ou de l'administrateur.
 */

export interface TrainingExample {
  messages: { role: 'system' | 'user' | 'assistant'; content: string }[];
  meta: {
    source: 'classroom';
    code: string;
    groupId: string;
    lang: Lang;
    journeyId: string;
    workshopId?: string;
    stepId?: string;
    kind: string;
    fromModel: boolean;
    at: number;
  };
}

function contextFor(code: string, groupId: string, lang: Lang, workshopId?: string, stepId?: string): string {
  const classroom = M.getClassroom(code);
  const journey = (classroom && getJourney(classroom.journeyId)) ?? JOURNEYS[0];
  const workshop = workshopId ? getWorkshop(journey, workshopId) : undefined;
  const step = workshop?.steps.find((s) => s.id === stepId);
  const lines = [`Parcours : ${t(journey.title, lang)}.`];
  if (workshop) lines.push(`Atelier : ${t(workshop.title, lang)}.`);
  if (step) lines.push(`Consigne : ${t(step.prompt, lang)}`);
  if (step?.expected) lines.push(`Réponse attendue : ${t(step.expected, lang)}`);
  return lines.join('\n');
}

export function buildTrainingExamples(code?: string): TrainingExample[] {
  const events = store.events(code);
  const out: TrainingExample[] = [];

  // Regroupe par (classe, groupe) et parcourt chronologiquement.
  const byGroup = new Map<string, StoredEvent[]>();
  for (const ev of events) {
    if (!ev.group_id) continue;
    const k = `${ev.code}:${ev.group_id}`;
    (byGroup.get(k) ?? byGroup.set(k, []).get(k)!).push(ev);
  }

  for (const [k, list] of byGroup) {
    const [c, groupId] = k.split(':');
    const classroom = M.getClassroom(c);
    const lang: Lang = classroom?.lang ?? 'fr';
    const journeyId = classroom?.journeyId ?? JOURNEYS[0].id;
    let workshopId: string | undefined;
    let stepId: string | undefined;
    let pendingUser: { text: string; kind: 'question' | 'slate' | 'choice' } | null = null;

    for (const ev of list) {
      const payload = JSON.parse(ev.payload);
      switch (ev.type) {
        case 'lesson.start':
          workshopId = payload.workshopId;
          break;
        case 'lesson.step':
          stepId = payload.stepId;
          pendingUser = null;
          break;
        case 'student.question':
          pendingUser = { text: payload.question, kind: 'question' };
          break;
        case 'slate.reading':
          if (payload.text) pendingUser = { text: payload.text, kind: 'slate' };
          break;
        case 'choice':
          pendingUser = { text: `Choix ${Number(payload.index) + 1}`, kind: 'choice' };
          break;
        case 'griot.say': {
          const u = payload as GriotUtterance;
          if (!pendingUser || u.kind === 'system') break;
          const prefix =
            pendingUser.kind === 'question' ? 'Le groupe demande : '
            : pendingUser.kind === 'slate' ? 'Le groupe a écrit sur l’ardoise : '
            : 'Le groupe a choisi : ';
          out.push({
            messages: [
              { role: 'user', content: `${contextFor(c, groupId, lang, workshopId, stepId)}\n\n${prefix}« ${pendingUser.text} »` },
              { role: 'assistant', content: u.text },
            ],
            meta: {
              source: 'classroom',
              code: c,
              groupId,
              lang,
              journeyId,
              workshopId,
              stepId,
              kind: u.kind,
              fromModel: Boolean(u.fromModel),
              at: u.at,
            },
          });
          pendingUser = null;
          break;
        }
        default:
          break;
      }
    }
  }
  return out;
}

export function toJsonl(examples: TrainingExample[]): string {
  return examples.map((e) => JSON.stringify(e)).join('\n') + (examples.length ? '\n' : '');
}
