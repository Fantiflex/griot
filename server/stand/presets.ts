import type { StandAction, StandMove } from '../../shared/types';

/**
 * Traduction d'une intention du Griot en mouvements du support (pan/tilt en degrés).
 * Les mêmes séquences animent le support simulé à l'écran et le support ESP32 réel.
 *
 * Repère : pan 90 = face aux élèves ; tilt 90 = horizontal, > 90 = penché vers la table.
 */
export const STAND_HOME: StandMove = { pan: 90, tilt: 90, ms: 600 };
export const STAND_SLATE: StandMove = { pan: 90, tilt: 135, ms: 900 };
export const STAND_STUDENTS: StandMove = { pan: 90, tilt: 80, ms: 700 };

export function standSequence(action: StandAction): StandMove[] {
  switch (action) {
    case 'center':
      return [STAND_HOME];
    case 'look_slate':
      return [STAND_SLATE];
    case 'look_students':
      return [STAND_STUDENTS];
    case 'nod':
      return [
        { pan: 90, tilt: 100, ms: 250 },
        { pan: 90, tilt: 75, ms: 250 },
        { pan: 90, tilt: 100, ms: 250 },
        STAND_STUDENTS,
      ];
    case 'shake':
      return [
        { pan: 70, tilt: 80, ms: 250 },
        { pan: 110, tilt: 80, ms: 300 },
        { pan: 70, tilt: 80, ms: 300 },
        STAND_STUDENTS,
      ];
    case 'scan':
      return [
        { pan: 40, tilt: 80, ms: 900 },
        { pan: 140, tilt: 80, ms: 1400 },
        STAND_STUDENTS,
      ];
    default:
      return [STAND_HOME];
  }
}

export function sequenceDuration(seq: StandMove[]): number {
  return seq.reduce((acc, m) => acc + m.ms, 0);
}
