import type { Journey, Workshop } from '../shared/types';
import { KILWA_JOURNEY } from './journeys/kilwa';

export const JOURNEYS: Journey[] = [KILWA_JOURNEY];

export function getJourney(id: string): Journey | undefined {
  return JOURNEYS.find((j) => j.id === id);
}

export function getWorkshop(journey: Journey, workshopId: string): Workshop | undefined {
  return journey.workshops.find((w) => w.id === workshopId);
}
