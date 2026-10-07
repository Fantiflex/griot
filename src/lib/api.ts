import type { ClassroomState, GroupState, HealthReport, Journey, Lang, RoleType, StandAction } from '@shared/types';

async function request<T>(method: string, url: string, body?: unknown): Promise<T> {
  const res = await fetch(url, {
    method,
    headers: body !== undefined ? { 'Content-Type': 'application/json' } : undefined,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    let message = `HTTP ${res.status}`;
    try {
      const data = await res.json();
      if (data?.error) message = data.error;
    } catch {
      /* corps non JSON */
    }
    throw new Error(message);
  }
  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

const g = (code: string, groupId: string) => `/api/classrooms/${encodeURIComponent(code)}/groups/${encodeURIComponent(groupId)}`;

export const api = {
  health: () => request<HealthReport>('GET', '/api/health'),
  journeys: () => request<Journey[]>('GET', '/api/journeys'),

  createClassroom: (input: { name: string; lang: Lang; journeyId?: string; groupCount: number; studentsPerGroup: number; rotationMinutes: number }) =>
    request<ClassroomState>('POST', '/api/classrooms', input),
  listClassrooms: () => request<{ code: string; name: string; lang: Lang; rotation: number; groups: number; updatedAt: number }[]>('GET', '/api/classrooms'),
  getClassroom: (code: string) => request<ClassroomState>('GET', `/api/classrooms/${encodeURIComponent(code)}`),
  setRotation: (code: string, direction: 'next' | 'prev') => request<ClassroomState>('POST', `/api/classrooms/${code}/rotation`, { direction }),
  toggleTimer: (code: string) => request<ClassroomState>('POST', `/api/classrooms/${code}/timer`),
  setRotationMinutes: (code: string, rotationMinutes: number) => request<ClassroomState>('POST', `/api/classrooms/${code}/settings`, { rotationMinutes }),
  ackAlert: (code: string, alertId: string) => request<{ ok: true }>('POST', `/api/classrooms/${code}/alerts/${alertId}/ack`),

  getGroup: (code: string, groupId: string) => request<GroupState>('GET', g(code, groupId)),
  setRole: (code: string, groupId: string, role: RoleType, name: string) => request<GroupState>('POST', `${g(code, groupId)}/roles`, { role, name }),
  setHelp: (code: string, groupId: string, needed: boolean, note?: string) => request<{ ok: true }>('POST', `${g(code, groupId)}/help`, { needed, note }),
  moveStand: (code: string, groupId: string, action: StandAction) => request<unknown>('POST', `${g(code, groupId)}/stand`, { action }),

  startLesson: (code: string, groupId: string) => request<GroupState>('POST', `${g(code, groupId)}/lesson/start`),
  continueLesson: (code: string, groupId: string) => request<GroupState>('POST', `${g(code, groupId)}/lesson/continue`),
  submitSlateImage: (code: string, groupId: string, imageDataUrl: string) => request<unknown>('POST', `${g(code, groupId)}/lesson/slate`, { imageDataUrl }),
  submitSlateText: (code: string, groupId: string, text: string) => request<unknown>('POST', `${g(code, groupId)}/lesson/slate`, { text }),
  submitChoice: (code: string, groupId: string, index: number) => request<unknown>('POST', `${g(code, groupId)}/lesson/choice`, { index }),
  requestHint: (code: string, groupId: string) => request<unknown>('POST', `${g(code, groupId)}/lesson/hint`),
  ask: (code: string, groupId: string, question: string) => request<unknown>('POST', `${g(code, groupId)}/ask`, { question }),

  /** Renvoie un Blob WAV, ou null si la voix serveur est indisponible. */
  async tts(text: string, lang: Lang): Promise<Blob | null> {
    try {
      const res = await fetch('/api/tts', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text, lang }) });
      if (!res.ok) return null;
      return await res.blob();
    } catch {
      return null;
    }
  },
};
