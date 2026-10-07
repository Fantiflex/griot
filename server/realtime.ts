import { WebSocketServer, WebSocket } from 'ws';
import type { IncomingMessage } from 'http';
import type { Duplex } from 'stream';
import type { ClientMessage, ServerMessage } from '../shared/types';
import { bus } from './bus';
import * as M from './classroom/manager';

/**
 * Hub temps réel pour les téléphones de groupe et la console enseignant.
 * Chemin : /ws
 */

interface Subscription {
  code: string;
  role: 'teacher' | 'group';
  groupId?: string;
}

const clients = new Map<WebSocket, Subscription | null>();

function send(ws: WebSocket, msg: ServerMessage) {
  if (ws.readyState === WebSocket.OPEN) ws.send(JSON.stringify(msg));
}

export const wss = new WebSocketServer({ noServer: true });

export function handleUpgrade(req: IncomingMessage, socket: Duplex, head: Buffer) {
  wss.handleUpgrade(req, socket, head, (ws) => wss.emit('connection', ws, req));
}

wss.on('connection', (ws) => {
  clients.set(ws, null);

  ws.on('message', (raw) => {
    let msg: ClientMessage;
    try {
      msg = JSON.parse(String(raw));
    } catch {
      return send(ws, { type: 'error', message: 'JSON invalide' });
    }
    if (msg.type === 'ping') return send(ws, { type: 'pong' });
    if (msg.type === 'subscribe') {
      const code = msg.code.toUpperCase();
      const classroom = M.getClassroom(code);
      if (!classroom) return send(ws, { type: 'error', message: `Classe ${code} introuvable` });
      const previous = clients.get(ws);
      if (previous?.role === 'group' && previous.groupId) M.adjustDevices(previous.code, previous.groupId, -1);

      const sub: Subscription = { code, role: msg.role, groupId: msg.groupId };
      clients.set(ws, sub);
      if (sub.role === 'group' && sub.groupId) {
        M.adjustDevices(code, sub.groupId, +1);
        const group = M.getGroup(code, sub.groupId)?.group;
        if (group) send(ws, { type: 'group.state', group });
      }
      send(ws, { type: 'classroom.state', classroom: M.getClassroom(code)! });
    }
  });

  ws.on('close', () => {
    const sub = clients.get(ws);
    clients.delete(ws);
    if (sub?.role === 'group' && sub.groupId) M.adjustDevices(sub.code, sub.groupId, -1);
  });
});

function forEachSubscriber(code: string, fn: (ws: WebSocket, sub: Subscription) => void) {
  for (const [ws, sub] of clients) if (sub && sub.code === code) fn(ws, sub);
}

bus.on('classroom', (classroom) => {
  forEachSubscriber(classroom.code, (ws, sub) => {
    if (sub.role === 'teacher') send(ws, { type: 'classroom.state', classroom });
  });
});

bus.on('group', (group) => {
  forEachSubscriber(group.classroomCode, (ws, sub) => {
    if (sub.role === 'group' && sub.groupId === group.id) send(ws, { type: 'group.state', group });
  });
});

bus.on('say', (utterance) => {
  forEachSubscriber(utterance.classroomCode, (ws, sub) => {
    if (sub.role === 'teacher' || sub.groupId === utterance.groupId) send(ws, { type: 'griot.say', utterance });
  });
});

bus.on('stand.move', (code, groupId, move) => {
  forEachSubscriber(code, (ws, sub) => {
    if (sub.role === 'teacher' || sub.groupId === groupId) send(ws, { type: 'stand.move', groupId, move });
  });
});

bus.on('stand.state', (code, groupId, connected) => {
  forEachSubscriber(code, (ws, sub) => {
    if (sub.role === 'teacher' || sub.groupId === groupId) send(ws, { type: 'stand.state', groupId, connected });
  });
});

/** Ping périodique pour fermer les sockets morts (téléphones en veille). */
setInterval(() => {
  for (const ws of clients.keys()) {
    if (ws.readyState === WebSocket.OPEN) ws.ping();
  }
}, 30_000).unref();

export function connectedClients(): number {
  return clients.size;
}
