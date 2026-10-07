import { test, before, describe } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'fs';
import os from 'os';
import path from 'path';

/**
 * Tests du moteur de leçon sans modèle : LLM injoignable, le Griot suit le script.
 * Lancer : npm test
 */

process.env.DATA_DIR = fs.mkdtempSync(path.join(os.tmpdir(), 'legriot-test-'));
process.env.LLM_BASE_URL = 'http://127.0.0.1:9/v1'; // port « discard » : connexion refusée immédiatement
process.env.LLM_TIMEOUT_MS = '1500';
process.env.TTS_ENABLED = 'false';

type Manager = typeof import('../server/classroom/manager');
type Lesson = typeof import('../server/classroom/lesson');
type Exporter = typeof import('../server/export');

let M: Manager;
let L: Lesson;
let E: Exporter;

before(async () => {
  M = await import('../server/classroom/manager');
  L = await import('../server/classroom/lesson');
  E = await import('../server/export');
});

const lastText = (code: string, gid: string) => {
  const g = M.getGroup(code, gid)!.group;
  return g.transcript[g.transcript.length - 1];
};

describe('classe', () => {
  test('création : code de 6 caractères, groupes répartis sur les 3 ateliers', () => {
    const c = M.createClassroom({ name: 'Test', lang: 'fr', groupCount: 4 });
    assert.equal(c.code.length, 6);
    assert.equal(c.groups.length, 4);
    assert.deepEqual(
      c.groups.map((g) => g.workshopId),
      ['kilwa-math', 'kilwa-language', 'kilwa-history', 'kilwa-math'],
    );
    assert.equal(c.rotation, 1);
    assert.ok(M.getClassroom(c.code.toLowerCase()), 'le code est insensible à la casse');
  });

  test('rotation : les ateliers tournent et les résultats sont archivés', () => {
    const c = M.createClassroom({ name: 'Rot', lang: 'fr', groupCount: 3 });
    L.startLesson(c.code, 'g1');
    M.setRotation(c.code, 2);
    const after = M.getClassroom(c.code)!;
    assert.deepEqual(after.groups.map((g) => g.workshopId), ['kilwa-language', 'kilwa-history', 'kilwa-math']);
    assert.ok(after.groups[0].results['kilwa-math'], 'résultat archivé pour le groupe qui avait démarré');
    assert.equal(after.groups[0].lesson.phase, 'idle');
    assert.ok(after.timerEndsAt && after.timerEndsAt > Date.now());
  });
});

describe('leçon sans modèle', () => {
  test('démarrage puis enchaînement vers la question écrite', () => {
    const c = M.createClassroom({ name: 'L1', lang: 'fr', groupCount: 1 });
    L.startLesson(c.code, 'g1');
    let g = M.getGroup(c.code, 'g1')!.group;
    assert.equal(g.lesson.phase, 'telling');
    assert.equal(g.transcript.length, 2, 'contexte de l’atelier + consigne de l’étape 1');
    assert.equal(g.transcript[0].stand, 'look_students');

    L.continueLesson(c.code, 'g1');
    g = M.getGroup(c.code, 'g1')!.group;
    assert.equal(g.lesson.phase, 'waiting_slate');
    assert.equal(g.lesson.stepIndex, 1);
    assert.equal(lastText(c.code, 'g1').stand, 'look_slate', 'le support regarde l’ardoise');
  });

  test('réponse juste écrite en lettres : acceptée par le juge déterministe', async () => {
    const c = M.createClassroom({ name: 'L2', lang: 'fr', groupCount: 1 });
    L.startLesson(c.code, 'g1');
    L.continueLesson(c.code, 'g1');
    await L.submitSlate(c.code, 'g1', { text: 'huit rouleaux' });
    const g = M.getGroup(c.code, 'g1')!.group;
    assert.equal(g.lesson.phase, 'feedback');
    assert.equal(g.lesson.score, 1);
    assert.equal(g.lesson.lastVerdict?.correct, true);
    assert.equal(g.lesson.lastVerdict?.fromModel, false, 'pas de modèle : verdict du script');
    assert.equal(lastText(c.code, 'g1').kind, 'feedback');
    assert.equal(lastText(c.code, 'g1').stand, 'nod');
  });

  test('trois erreurs : deux indices scriptés puis révélation, alerte « bloque »', async () => {
    const c = M.createClassroom({ name: 'L3', lang: 'fr', groupCount: 1 });
    L.startLesson(c.code, 'g1');
    L.continueLesson(c.code, 'g1');

    await L.submitSlate(c.code, 'g1', { text: '6' });
    let g = M.getGroup(c.code, 'g1')!.group;
    assert.equal(g.lesson.phase, 'waiting_slate');
    assert.equal(g.lesson.attempts, 1);
    assert.equal(g.lesson.hintsUsed, 1);
    assert.equal(lastText(c.code, 'g1').kind, 'hint');
    assert.match(lastText(c.code, 'g1').text, /paquets de trois/i, 'premier indice scripté');

    await L.submitSlate(c.code, 'g1', { text: '4' });
    g = M.getGroup(c.code, 'g1')!.group;
    assert.equal(g.lesson.attempts, 2);
    assert.equal(g.lesson.struggling, true);
    assert.ok(M.getClassroom(c.code)!.alerts.some((a) => a.kind === 'struggling'), 'alerte enseignant levée');

    await L.submitSlate(c.code, 'g1', { text: '5' });
    g = M.getGroup(c.code, 'g1')!.group;
    assert.equal(g.lesson.phase, 'feedback');
    assert.equal(g.lesson.score, 0);
    assert.equal(g.lesson.stepsCompleted, 1);
    assert.equal(lastText(c.code, 'g1').kind, 'answer');
    assert.match(lastText(c.code, 'g1').text, /huit rouleaux/i, 'l’explication complète est révélée');
  });

  test('ardoise vide : pas d’essai compté, le Griot demande d’écrire plus gros', async () => {
    const c = M.createClassroom({ name: 'L4', lang: 'fr', groupCount: 1 });
    L.startLesson(c.code, 'g1');
    L.continueLesson(c.code, 'g1');
    await L.submitSlate(c.code, 'g1', { text: '   ' });
    const g = M.getGroup(c.code, 'g1')!.group;
    assert.equal(g.lesson.attempts, 0);
    assert.equal(g.lesson.phase, 'waiting_slate');
    assert.equal(lastText(c.code, 'g1').kind, 'system');
  });

  test('question à choix : bonne réponse par index', async () => {
    const c = M.createClassroom({ name: 'L5', lang: 'sw', groupCount: 1 });
    L.startLesson(c.code, 'g1');
    L.continueLesson(c.code, 'g1'); // -> m-ratio
    await L.submitSlate(c.code, 'g1', { text: '8' });
    L.continueLesson(c.code, 'g1'); // -> m-fraction
    await L.submitSlate(c.code, 'g1', { text: '45' });
    L.continueLesson(c.code, 'g1'); // -> m-gold (choix)
    let g = M.getGroup(c.code, 'g1')!.group;
    assert.equal(g.lesson.phase, 'waiting_choice');
    assert.match(lastText(c.code, 'g1').text, /Gramu 17/, 'les options sont lues en kiswahili');
    await L.submitChoice(c.code, 'g1', 1);
    g = M.getGroup(c.code, 'g1')!.group;
    assert.equal(g.lesson.score, 3);
    assert.equal(g.lesson.phase, 'feedback');
  });

  test('fin d’atelier : résumé, résultat archivé, alerte « terminé »', async () => {
    const c = M.createClassroom({ name: 'L6', lang: 'fr', groupCount: 1 });
    L.startLesson(c.code, 'g1');
    L.continueLesson(c.code, 'g1');
    await L.submitSlate(c.code, 'g1', { text: '8' });
    L.continueLesson(c.code, 'g1');
    await L.submitSlate(c.code, 'g1', { text: '45' });
    L.continueLesson(c.code, 'g1');
    await L.submitChoice(c.code, 'g1', 1);
    L.continueLesson(c.code, 'g1'); // -> discuss
    assert.equal(M.getGroup(c.code, 'g1')!.group.lesson.phase, 'discussion');
    L.continueLesson(c.code, 'g1'); // -> fin
    await new Promise((r) => setTimeout(r, 50));
    const g = M.getGroup(c.code, 'g1')!.group;
    assert.equal(g.lesson.phase, 'done');
    assert.deepEqual({ score: g.results['kilwa-math'].score, total: g.results['kilwa-math'].total }, { score: 3, total: 3 });
    assert.ok(M.getClassroom(c.code)!.alerts.some((a) => a.kind === 'completed'));
  });

  test('question libre sans modèle : indice scripté, compteur d’indices', async () => {
    const c = M.createClassroom({ name: 'L7', lang: 'fr', groupCount: 1 });
    L.startLesson(c.code, 'g1');
    L.continueLesson(c.code, 'g1');
    await L.askGriot(c.code, 'g1', 'On fait comment ?');
    const g = M.getGroup(c.code, 'g1')!.group;
    assert.equal(g.lesson.hintsUsed, 1);
    assert.equal(lastText(c.code, 'g1').fromModel, false);
    assert.ok(lastText(c.code, 'g1').text.length > 10);
  });

  test('aide : alerte levée puis acquittée', () => {
    const c = M.createClassroom({ name: 'L8', lang: 'fr', groupCount: 1 });
    M.setHelp(c.code, 'g1', true, 'On ne comprend pas');
    let cl = M.getClassroom(c.code)!;
    assert.equal(cl.groups[0].needsHelp, true);
    assert.ok(cl.alerts.some((a) => a.kind === 'help_requested' && !a.acknowledged));
    M.setHelp(c.code, 'g1', false);
    cl = M.getClassroom(c.code)!;
    assert.equal(cl.groups[0].needsHelp, false);
    assert.ok(cl.alerts.every((a) => a.kind !== 'help_requested' || a.acknowledged));
  });
});

describe('export fine-tuning', () => {
  test('les paires (écrit du groupe → réponse du Griot) sont reconstruites', async () => {
    const c = M.createClassroom({ name: 'X', lang: 'fr', groupCount: 1 });
    L.startLesson(c.code, 'g1');
    L.continueLesson(c.code, 'g1');
    await L.submitSlate(c.code, 'g1', { text: '6' });
    await L.askGriot(c.code, 'g1', 'Pourquoi ?');
    const ex = E.buildTrainingExamples(c.code);
    assert.ok(ex.length >= 2);
    assert.ok(ex.some((e) => e.messages[0].content.includes('« 6 »') && e.meta.kind === 'hint'));
    assert.ok(ex.some((e) => e.messages[0].content.includes('Pourquoi ?')));
    assert.equal(ex[0].messages[1].role, 'assistant');
    assert.equal(ex[0].meta.lang, 'fr');
    const jsonl = E.toJsonl(ex);
    assert.equal(jsonl.trim().split('\n').length, ex.length);
  });
});
