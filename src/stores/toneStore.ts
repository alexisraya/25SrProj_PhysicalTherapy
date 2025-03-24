import { writable } from 'svelte/store';

export type ToneType = 'tough' | 'kind';

interface ToneStore {
  currentTone: ToneType;
}

// Create the initial tone store with 'kind' as default
const initialState: ToneStore = {
  currentTone: 'kind'
};

export const toneStore = writable<ToneStore>(initialState);

// Helper functions for tone store manipulation
export function setTone(newTone: ToneType): void {
  toneStore.update(state => ({
    ...state,
    currentTone: newTone
  }));
}

export function toggleTone(): void {
  toneStore.update(state => ({
    ...state,
    currentTone: state.currentTone === 'kind' ? 'tough' : 'kind'
  }));
}