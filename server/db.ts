import { DatabaseSync } from 'node:sqlite';
import fs from 'fs';
import path from 'path';
import { config } from './config';
import type { ClassroomState } from '../shared/types';
import { newId } from './util';

/**
 * Persistance SQLite (module natif de Node, pas de compilation).
 * L'état d'une classe est stocké en JSON : simple, suffisant pour un établissement,
 * et le journal d'événements sert de source aux données de fine-tuning.
 */

fs.mkdirSync(config.dataDir, { recursive: true });
const db = new DatabaseSync(path.join(config.dataDir, 'legriot.sqlite'));

db.exec(`
  PRAGMA journal_mode = WAL;
  CREATE TABLE IF NOT EXISTS classrooms (
    code TEXT PRIMARY KEY,
    state TEXT NOT NULL,
    updated_at INTEGER NOT NULL
  );
  CREATE TABLE IF NOT EXISTS events (
    id TEXT PRIMARY KEY,
    code TEXT NOT NULL,
    group_id TEXT,
    type TEXT NOT NULL,
    payload TEXT NOT NULL,
    created_at INTEGER NOT NULL
  );
  CREATE INDEX IF NOT EXISTS events_code_idx ON events(code, created_at);
`);

const upsertClassroom = db.prepare(
  `INSERT INTO classrooms(code, state, updated_at) VALUES (?, ?, ?)
   ON CONFLICT(code) DO UPDATE SET state = excluded.state, updated_at = excluded.updated_at`,
);
const selectClassroom = db.prepare(`SELECT state FROM classrooms WHERE code = ?`);
const selectAllClassrooms = db.prepare(`SELECT state FROM classrooms ORDER BY updated_at DESC`);
const countClassrooms = db.prepare(`SELECT COUNT(*) AS n FROM classrooms`);
const insertEvent = db.prepare(
  `INSERT INTO events(id, code, group_id, type, payload, created_at) VALUES (?, ?, ?, ?, ?, ?)`,
);
const selectEvents = db.prepare(
  `SELECT id, code, group_id, type, payload, created_at FROM events WHERE code = ? ORDER BY created_at ASC`,
);
const selectAllEvents = db.prepare(
  `SELECT id, code, group_id, type, payload, created_at FROM events ORDER BY created_at ASC`,
);

export interface StoredEvent {
  id: string;
  code: string;
  group_id: string | null;
  type: string;
  payload: string;
  created_at: number;
}

export const store = {
  saveClassroom(state: ClassroomState) {
    upsertClassroom.run(state.code, JSON.stringify(state), Date.now());
  },
  loadClassroom(code: string): ClassroomState | undefined {
    const row = selectClassroom.get(code) as { state: string } | undefined;
    return row ? (JSON.parse(row.state) as ClassroomState) : undefined;
  },
  loadAllClassrooms(): ClassroomState[] {
    return (selectAllClassrooms.all() as { state: string }[]).map((r) => JSON.parse(r.state));
  },
  countClassrooms(): number {
    return Number((countClassrooms.get() as { n: number }).n);
  },
  logEvent(code: string, groupId: string | null, type: string, payload: unknown) {
    insertEvent.run(newId('ev_'), code, groupId, type, JSON.stringify(payload), Date.now());
  },
  events(code?: string): StoredEvent[] {
    return (code ? selectEvents.all(code) : selectAllEvents.all()) as unknown as StoredEvent[];
  },
};
