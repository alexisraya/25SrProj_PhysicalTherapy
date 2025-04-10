import { writable } from 'svelte/store';

export interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  caption?: string;
  requiresChoice?: boolean;
}

export const currentStep = writable<number>(0);

export const stepCompletionStatus = writable<boolean[]>(
  Array(7)
    .fill(false)
    .map((_, index) => !steps[index]?.requiresChoice)
);

export const steps: OnboardingStep[] = [
  {
    id: 'mend',
    title: 'Mend',
    description:
      'Physical therapy can be difficult. But we’re here to keep you motivated. Let’s begin to see how.'
  },
  {
    id: 'streaks',
    title: 'Streaks',
    description: 'Stay accountable for completing your programs by working towards a streak...'
  },
  {
    id: 'achievements',
    title: 'Achievements',
    description: 'Completing those programs can unlock achievements that reflect your progress...'
  },
  {
    id: 'goals',
    title: 'Goals',
    description:
      'And they can also get you closer to goals that are set by your physical therapist.'
  },
  {
    id: 'tone',
    title: 'Please select tone',
    description:
      'The type of motivation you need can change. That’s why you can choose the way Mend motivates you.',
    caption: 'You can change this at any time.',
    requiresChoice: true
  },
  {
    id: 'model',
    title: 'Please select model',
    description: 'You can also choose the model you want to demonstrate your program exercises.',
    caption: 'You can change this at any time.',
    requiresChoice: true
  },
  {
    id: 'checkin',
    title: 'Check in',
    description:
      'Now let’s get started by checking in on your pain and mood today. This will set a baseline for your progress.',
    caption: 'You can check in at any time on the home page'
  }
];

// Navigation functions
export function goToNext(): void {
  currentStep.update((step) => {
    if (step < steps.length - 1) {
      return step + 1;
    }
    return step;
  });
}

export function goToPrevious(): void {
  currentStep.update((step) => {
    if (step > 0) {
      return step - 1;
    }
    return step;
  });
}

export function goToStep(index: number): void {
  currentStep.set(Math.max(0, Math.min(steps.length - 1, index)));
}

export function setStepComplete(stepIndex: number, isComplete: boolean): void {
  stepCompletionStatus.update((status) => {
    const newStatus = [...status];
    newStatus[stepIndex] = isComplete;
    return newStatus;
  });
}

// Function to check if current step is complete
export function isCurrentStepComplete(stepIndex: number): boolean {
  let complete = false;
  stepCompletionStatus.subscribe((status) => {
    complete = status[stepIndex];
  })();
  return complete;
}
