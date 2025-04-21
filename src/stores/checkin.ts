import { writable } from 'svelte/store';

export interface CheckInStep {
  id: string;
  title?: string;
  description?: string;
  requiresChoice?: boolean;
}

// Define checkInSteps first
export const checkInSteps: CheckInStep[] = [
  {
    id: 'pain',
    title: 'How would you rate your knee pain level today?',
    description: `This rating will be tracked on the Progress page so you can see how you’re improving over time.`,
    requiresChoice: true
  },
  {
    id: 'mood',
    title: 'How are you feeling about your recovery today?',
    requiresChoice: true
  },
  {
    id: 'reflection'
  }
];

// Create stores after checkInSteps is defined
export const currentCheckInStep = writable<number>(0);

export const checkInStepCompletionStatus = writable<boolean[]>(
  Array(checkInSteps.length)
    .fill(false)
    .map((_, index) => !checkInSteps[index]?.requiresChoice)
);

// Navigation functions
export function goToNext(): void {
  currentCheckInStep.update((step) => {
    if (step < checkInSteps.length - 1) {
      return step + 1;
    }
    return step;
  });
}

export function goToPrevious(): void {
  currentCheckInStep.update((step) => {
    if (step > 0) {
      return step - 1;
    }
    return step;
  });
}

export function goToStep(index: number): void {
  currentCheckInStep.set(Math.max(0, Math.min(checkInSteps.length - 1, index)));
}

export function setStepComplete(stepIndex: number, isComplete: boolean): void {
  checkInStepCompletionStatus.update((status) => {
    const newStatus = [...status];
    newStatus[stepIndex] = isComplete;
    return newStatus;
  });
}

// Function to check if current step is complete
export function isCurrentCheckInStepComplete(stepIndex: number): boolean {
  let complete = false;
  checkInStepCompletionStatus.subscribe((status) => {
    complete = status[stepIndex];
  })();
  return complete;
}
