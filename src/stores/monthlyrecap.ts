import { writable } from 'svelte/store';

export interface MonthlyRecapStep {
  id: string;
}

export const recapSteps: MonthlyRecapStep[] = [
  {
    id: 'intro'
  },
  {
    id: 'pain'
  },
  {
    id: 'mood'
  },
  {
    id: 'programs'
  },
  {
    id: 'exercises'
  },
  {
    id: 'achievements'
  },
  {
    id: 'goals'
  },
  {
    id: 'metrics'
  },
  {
    id: 'summary'
  }
];

export const currentRecapStep = writable<number>(0);

export function goToNextRecap(): void {
  currentRecapStep.update((step) => {
    if (step < recapSteps.length - 1) {
      return step + 1;
    }
    return step;
  });
}

export function goToPreviousRecap(): void {
  currentRecapStep.update((step) => {
    if (step > 0) {
      return step - 1;
    }
    return step;
  });
}

export function goToRecapStep(index: number): void {
  currentRecapStep.set(Math.max(0, Math.min(recapSteps.length - 1, index)));
}
