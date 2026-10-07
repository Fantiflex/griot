import { useEffect, useRef, useState, useCallback } from 'react';
import type { ClassroomState, GroupState, GriotUtterance, ServerMessage, StandMove } from '@shared/types';

/**
 * Connexion WebSocket avec reconnexion automatique.
 * Un seul hook pour la console enseignant (role teacher) et le téléphone (role group).
 */

export interface RealtimeHandlers {
  onClassroom?: (c: ClassroomState) => void;
  onGroup?: (g: GroupState) => void;
  onSay?: (u: GriotUtterance) => void;
  onStandMove?: (groupId: string, move: StandMove) => void;
  onStandState?: (groupId: string, connected: boolean) => void;
  onError?: (message: string) => void;
}

export type ConnectionStatus = 'connecting' | 'open' | 'closed';

export function useRealtime(
  sub: { code: string; role: 'teacher' | 'group'; groupId?: string } | null,
  handlers: RealtimeHandlers,
): ConnectionStatus {
  const [status, setStatus] = useState<ConnectionStatus>('connecting');
  const handlersRef = useRef(handlers);
  handlersRef.current = handlers;

  useEffect(() => {
    if (!sub) return;
    let ws: WebSocket | null = null;
    let closedByUs = false;
    let retry = 0;
    let timer: ReturnType<typeof setTimeout> | undefined;

    const connect = () => {
      setStatus('connecting');
      const proto = location.protocol === 'https:' ? 'wss' : 'ws';
      ws = new WebSocket(`${proto}://${location.host}/ws`);
      ws.onopen = () => {
        retry = 0;
        setStatus('open');
        ws?.send(JSON.stringify({ type: 'subscribe', code: sub.code, role: sub.role, groupId: sub.groupId }));
      };
      ws.onmessage = (ev) => {
        let msg: ServerMessage;
        try {
          msg = JSON.parse(ev.data);
        } catch {
          return;
        }
        const h = handlersRef.current;
        switch (msg.type) {
          case 'classroom.state':
            h.onClassroom?.(msg.classroom);
            break;
          case 'group.state':
            h.onGroup?.(msg.group);
            break;
          case 'griot.say':
            h.onSay?.(msg.utterance);
            break;
          case 'stand.move':
            h.onStandMove?.(msg.groupId, msg.move);
            break;
          case 'stand.state':
            h.onStandState?.(msg.groupId, msg.connected);
            break;
          case 'error':
            h.onError?.(msg.message);
            break;
          default:
            break;
        }
      };
      ws.onclose = () => {
        setStatus('closed');
        if (closedByUs) return;
        const delay = Math.min(10_000, 500 * 2 ** retry++);
        timer = setTimeout(connect, delay);
      };
      ws.onerror = () => ws?.close();
    };

    connect();
    const keepAlive = setInterval(() => {
      if (ws?.readyState === WebSocket.OPEN) ws.send(JSON.stringify({ type: 'ping' }));
    }, 25_000);

    return () => {
      closedByUs = true;
      clearInterval(keepAlive);
      if (timer) clearTimeout(timer);
      ws?.close();
    };
  }, [sub?.code, sub?.role, sub?.groupId]);

  return status;
}

/** Mémorise une valeur dans l'URL (hash) pour survivre au rechargement du téléphone. */
export function useHashRoute(): [string[], (parts: string[]) => void] {
  const parse = () => location.hash.replace(/^#\/?/, '').split('/').filter(Boolean);
  const [parts, setParts] = useState<string[]>(parse);
  useEffect(() => {
    const onChange = () => setParts(parse());
    window.addEventListener('hashchange', onChange);
    return () => window.removeEventListener('hashchange', onChange);
  }, []);
  const navigate = useCallback((next: string[]) => {
    location.hash = '/' + next.map(encodeURIComponent).join('/');
  }, []);
  return [parts, navigate];
}
