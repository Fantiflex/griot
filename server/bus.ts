import { EventEmitter } from 'events';
import type { ClassroomState, GroupState, GriotUtterance, StandMove } from '../shared/types';

/**
 * Bus d'événements interne. Le gestionnaire de classe émet, le hub WebSocket
 * et le registre des supports ESP32 écoutent. Évite les imports circulaires.
 */
export interface BusEvents {
  classroom: (classroom: ClassroomState) => void;
  group: (group: GroupState) => void;
  say: (utterance: GriotUtterance) => void;
  'stand.move': (code: string, groupId: string, move: StandMove) => void;
  'stand.state': (code: string, groupId: string, connected: boolean) => void;
}

class TypedBus extends EventEmitter {
  override on<K extends keyof BusEvents>(event: K, listener: BusEvents[K]): this {
    return super.on(event, listener as (...args: unknown[]) => void);
  }
  override emit<K extends keyof BusEvents>(event: K, ...args: Parameters<BusEvents[K]>): boolean {
    return super.emit(event, ...args);
  }
}

export const bus = new TypedBus();
bus.setMaxListeners(50);
