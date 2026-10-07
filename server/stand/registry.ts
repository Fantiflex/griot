import { WebSocketServer, WebSocket } from 'ws';
import type { IncomingMessage } from 'http';
import type { Duplex } from 'stream';
import type { StandClientMessage, StandServerMessage } from '../../shared/types';
import { bus } from '../bus';
import * as M from '../classroom/manager';

/**
 * Registre des supports robotisés ESP32.
 * Le firmware ouvre une connexion sortante : ws(s)://serveur/ws/stand?code=ABC123&group=g1
 * Le serveur relaie les mouvements décidés par le Griot. Fonctionne derrière un routeur,
 * en LAN ou vers un serveur distant : pas de contenu mixte, pas d'IP à configurer côté téléphone.
 */

const stands = new Map<string, WebSocket>();
const key = (code: string, groupId: string) => `${code.toUpperCase()}:${groupId}`;

export const standWss = new WebSocketServer({ noServer: true });

export function handleStandUpgrade(req: IncomingMessage, socket: Duplex, head: Buffer) {
  standWss.handleUpgrade(req, socket, head, (ws) => standWss.emit('connection', ws, req));
}

standWss.on('connection', (ws, req: IncomingMessage) => {
  const url = new URL(req.url ?? '/', 'http://localhost');
  const code = (url.searchParams.get('code') ?? '').toUpperCase();
  const groupId = url.searchParams.get('group') ?? '';
  const found = M.getGroup(code, groupId);
  if (!found) {
    ws.close(4004, 'classe ou groupe introuvable');
    return;
  }
  const k = key(code, groupId);
  stands.get(k)?.close(4001, 'remplacé par une nouvelle connexion');
  stands.set(k, ws);
  M.setStandConnected(code, groupId, true);
  console.log(`[stand] connecté ${k}`);

  const hello: StandServerMessage = { cmd: 'hello', groupId };
  ws.send(JSON.stringify(hello));
  // Position courante pour que le support se recale au branchement.
  const pose = found.group.standPose;
  ws.send(JSON.stringify({ cmd: 'move', pan: pose.pan, tilt: pose.tilt, ms: 800 } satisfies StandServerMessage));

  ws.on('message', (raw) => {
    try {
      const msg = JSON.parse(String(raw)) as StandClientMessage;
      if (msg.type === 'hello') console.log(`[stand] ${k} firmware ${msg.firmware}`);
    } catch {
      /* ignoré */
    }
  });

  ws.on('close', () => {
    if (stands.get(k) === ws) {
      stands.delete(k);
      M.setStandConnected(code, groupId, false);
      console.log(`[stand] déconnecté ${k}`);
    }
  });
});

bus.on('stand.move', (code, groupId, move) => {
  const ws = stands.get(key(code, groupId));
  if (ws && ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify({ cmd: 'move', ...move } satisfies StandServerMessage));
  }
});

setInterval(() => {
  for (const ws of stands.values()) if (ws.readyState === WebSocket.OPEN) ws.ping();
}, 20_000).unref();

export function connectedStands(): number {
  return stands.size;
}
