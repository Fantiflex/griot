import { Router, type Request, type Response, type NextFunction } from 'express';
import { JOURNEYS } from '../content';
import { LANGS, type Lang, type RoleType, type StandAction, type HealthReport } from '../shared/types';
import { config } from './config';
import * as M from './classroom/manager';
import * as L from './classroom/lesson';
import { checkLlmHealth } from './llm/provider';
import { mathpixEnabled } from './perception';
import { synthesize, checkTtsHealth } from './tts';
import { buildTrainingExamples, toJsonl } from './export';

export const api = Router();

type Handler = (req: Request, res: Response) => Promise<unknown> | unknown;
const wrap = (fn: Handler) => (req: Request, res: Response, next: NextFunction) => {
  Promise.resolve(fn(req, res)).catch(next);
};

function requireClassroom(req: Request, res: Response) {
  const classroom = M.getClassroom(String(req.params.code));
  if (!classroom) res.status(404).json({ error: `Classe ${req.params.code} introuvable` });
  return classroom;
}

function requireGroup(req: Request, res: Response) {
  const found = M.getGroup(String(req.params.code), String(req.params.gid));
  if (!found) res.status(404).json({ error: 'Groupe introuvable' });
  return found;
}

const ROLES: RoleType[] = ['griot', 'scribe', 'architect', 'orator'];
const STAND_ACTIONS: StandAction[] = ['center', 'look_slate', 'look_students', 'nod', 'shake', 'scan'];

/* ---------- Santé et contenu ---------- */

api.get(
  '/health',
  wrap(async (_req, res) => {
    const [llm, tts] = await Promise.all([checkLlmHealth(), checkTtsHealth()]);
    const report: HealthReport = {
      ok: llm.reachable && !llm.error,
      llm: { reachable: llm.reachable, baseUrl: config.llm.baseUrl, model: config.llm.model, visionModel: config.llm.visionModel, error: llm.error },
      tts: { reachable: tts, url: config.tts.url },
      perception: { mathpix: mathpixEnabled() },
      classrooms: M.classroomCount(),
    };
    res.json(report);
  }),
);

api.get('/journeys', (_req, res) => {
  res.json(JOURNEYS);
});

/* ---------- Classes ---------- */

api.post(
  '/classrooms',
  wrap((req, res) => {
    const { name, lang, journeyId, groupCount, studentsPerGroup, rotationMinutes } = req.body ?? {};
    const safeLang: Lang = LANGS.includes(lang) ? lang : 'fr';
    const classroom = M.createClassroom({
      name: String(name ?? ''),
      lang: safeLang,
      journeyId,
      groupCount: Number(groupCount) || undefined,
      studentsPerGroup: Number(studentsPerGroup) || undefined,
      rotationMinutes: Number(rotationMinutes) || undefined,
    });
    res.status(201).json(classroom);
  }),
);

api.get('/classrooms', (_req, res) => {
  res.json(M.listClassrooms().map((c) => ({ code: c.code, name: c.name, lang: c.lang, rotation: c.rotation, groups: c.groups.length, updatedAt: c.updatedAt })));
});

api.get('/classrooms/:code', (req, res) => {
  const classroom = requireClassroom(req, res);
  if (classroom) res.json(classroom);
});

api.post('/classrooms/:code/rotation', (req, res) => {
  const classroom = requireClassroom(req, res);
  if (!classroom) return;
  const { direction, rotation } = req.body ?? {};
  const target = typeof rotation === 'number' ? rotation : direction === 'prev' ? classroom.rotation - 1 : classroom.rotation + 1;
  M.setRotation(classroom.code, target);
  res.json(M.getClassroom(classroom.code));
});

api.post('/classrooms/:code/timer', (req, res) => {
  const classroom = requireClassroom(req, res);
  if (!classroom) return;
  M.toggleTimer(classroom.code);
  res.json(M.getClassroom(classroom.code));
});

api.post('/classrooms/:code/settings', (req, res) => {
  const classroom = requireClassroom(req, res);
  if (!classroom) return;
  if (req.body?.rotationMinutes) M.setRotationMinutes(classroom.code, Number(req.body.rotationMinutes));
  res.json(M.getClassroom(classroom.code));
});

api.post('/classrooms/:code/alerts/:id/ack', (req, res) => {
  const classroom = requireClassroom(req, res);
  if (!classroom) return;
  M.acknowledgeAlert(classroom.code, String(req.params.id));
  res.json({ ok: true });
});

/* ---------- Groupes ---------- */

api.get('/classrooms/:code/groups/:gid', (req, res) => {
  const found = requireGroup(req, res);
  if (found) res.json(found.group);
});

api.post('/classrooms/:code/groups/:gid/roles', (req, res) => {
  const found = requireGroup(req, res);
  if (!found) return;
  const { role, name } = req.body ?? {};
  if (!ROLES.includes(role)) return res.status(400).json({ error: 'Rôle inconnu' });
  M.setRole(found.classroom.code, found.group.id, role, String(name ?? ''));
  res.json(M.getGroup(found.classroom.code, found.group.id)?.group);
});

api.post('/classrooms/:code/groups/:gid/help', (req, res) => {
  const found = requireGroup(req, res);
  if (!found) return;
  const { needed, note } = req.body ?? {};
  M.setHelp(found.classroom.code, found.group.id, Boolean(needed), note ? String(note).slice(0, 200) : undefined);
  res.json({ ok: true });
});

api.post('/classrooms/:code/groups/:gid/stand', (req, res) => {
  const found = requireGroup(req, res);
  if (!found) return;
  const action = req.body?.action as StandAction;
  if (!STAND_ACTIONS.includes(action)) return res.status(400).json({ error: 'Action inconnue' });
  res.json({ moves: M.moveStand(found.classroom.code, found.group.id, action) });
});

/* ---------- Leçon ---------- */

api.post('/classrooms/:code/groups/:gid/lesson/start', (req, res) => {
  const found = requireGroup(req, res);
  if (!found) return;
  L.startLesson(found.classroom.code, found.group.id);
  res.json(M.getGroup(found.classroom.code, found.group.id)?.group);
});

api.post('/classrooms/:code/groups/:gid/lesson/continue', (req, res) => {
  const found = requireGroup(req, res);
  if (!found) return;
  L.continueLesson(found.classroom.code, found.group.id);
  res.json(M.getGroup(found.classroom.code, found.group.id)?.group);
});

api.post(
  '/classrooms/:code/groups/:gid/lesson/slate',
  wrap(async (req, res) => {
    const found = requireGroup(req, res);
    if (!found) return;
    const { imageDataUrl, text } = req.body ?? {};
    if (imageDataUrl !== undefined && (typeof imageDataUrl !== 'string' || !imageDataUrl.startsWith('data:image/'))) {
      return res.status(400).json({ error: 'imageDataUrl doit être une data URL image' });
    }
    // Réponse immédiate : le résultat arrive par WebSocket (lecture + jugement peuvent prendre plusieurs secondes).
    res.status(202).json({ accepted: true });
    await L.submitSlate(found.classroom.code, found.group.id, { imageDataUrl, text: typeof text === 'string' ? text : undefined });
  }),
);

api.post(
  '/classrooms/:code/groups/:gid/lesson/choice',
  wrap(async (req, res) => {
    const found = requireGroup(req, res);
    if (!found) return;
    const index = Number(req.body?.index);
    if (!Number.isInteger(index) || index < 0) return res.status(400).json({ error: 'index invalide' });
    res.status(202).json({ accepted: true });
    await L.submitChoice(found.classroom.code, found.group.id, index);
  }),
);

api.post(
  '/classrooms/:code/groups/:gid/lesson/hint',
  wrap(async (req, res) => {
    const found = requireGroup(req, res);
    if (!found) return;
    await L.requestHint(found.classroom.code, found.group.id);
    res.json({ ok: true });
  }),
);

api.post(
  '/classrooms/:code/groups/:gid/ask',
  wrap(async (req, res) => {
    const found = requireGroup(req, res);
    if (!found) return;
    const question = String(req.body?.question ?? '').trim();
    if (!question) return res.status(400).json({ error: 'Question vide' });
    res.status(202).json({ accepted: true });
    await L.askGriot(found.classroom.code, found.group.id, question);
  }),
);

/* ---------- Voix ---------- */

api.post(
  '/tts',
  wrap(async (req, res) => {
    const text = String(req.body?.text ?? '').trim().slice(0, 1200);
    const lang: Lang = LANGS.includes(req.body?.lang) ? req.body.lang : 'fr';
    if (!text) return res.status(400).json({ error: 'Texte vide' });
    const wav = await synthesize(text, lang);
    if (!wav) return res.status(503).json({ error: 'Synthèse vocale serveur indisponible' });
    res.setHeader('Content-Type', 'audio/wav');
    res.setHeader('Cache-Control', 'private, max-age=86400');
    res.send(wav);
  }),
);

/* ---------- Export pour le fine-tuning ---------- */

api.get('/export/training.jsonl', (req, res) => {
  const code = req.query.code ? String(req.query.code).toUpperCase() : undefined;
  const examples = buildTrainingExamples(code);
  res.setHeader('Content-Type', 'application/x-ndjson; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename="legriot-${code ?? 'all'}-${Date.now()}.jsonl"`);
  res.send(toJsonl(examples));
});

/* ---------- Erreurs ---------- */

api.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error('[api]', err.message);
  if (!res.headersSent) res.status(500).json({ error: err.message });
});
