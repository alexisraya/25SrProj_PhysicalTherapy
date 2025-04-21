import { writable } from 'svelte/store';

export interface MonthlyRecapStep {
  id: string;
  title: string;
  description: string;
  caption?: string;
}

export const recapSteps: MonthlyRecapStep[] = [
  {
    id: 'intro',
    title: '',
    description: ""
  },
  {
    id: 'pain',
    title: '',
    description: ""
  },
  {
    id: 'mood',
    title: '',
    description: ""
  },
  {
    id: 'programs',
    title: '',
    description: ""
  },
  {
    id: 'exercises',
    title: '',
    description: ""
  },
  {
    id: 'achievements',
    title: '',
    description: ""
  },
  {
    id: 'goals',
    title: '',
    description: ""
  },
  {
    id: 'metrics',
    title: '',
    description: ""
  },
  {
    id: 'summary',
    title: '',
    description: ""
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