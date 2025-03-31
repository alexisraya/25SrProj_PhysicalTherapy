import { getContext, setContext } from 'svelte';
import { writable, derived, type Readable } from 'svelte/store';
import { toneContent, type ContentKey } from '$lib/toneContent';

// Define the tone types
export type ToneType = 'tough' | 'kind';

// Create a context key for the tone
const TONE_KEY = Symbol('tone');

// Function to set up the tone context at the app layout level
export function setupToneContext(initialTone: ToneType = 'kind') {
  // Create the writable store
  const toneStore = writable<ToneType>(initialTone);
  
  // Create a derived store that gives easy access to text content
  const toneText = derived(toneStore, $tone => {
    // Return a function that gets text for a given content key
    return (contentKey: ContentKey, fallback: string = ''): string => {
      if (toneContent[contentKey]) {
        return $tone === 'tough' 
          ? toneContent[contentKey].tough 
          : toneContent[contentKey].kind;
      }
      return fallback;
    };
  });
  
  // Expose functions for manipulating the tone
  const setTone = (newTone: ToneType) => toneStore.set(newTone);
  const toggleTone = () => toneStore.update(t => t === 'kind' ? 'tough' : 'kind');
  
  // Set the tone interface in context
  const toneInterface = {
    tone: toneStore,
    text: toneText,
    setTone,
    toggleTone
  };
  
  setContext(TONE_KEY, toneInterface);
  return toneInterface;
}

// Function to get the tone context in components
export function getTone() {
  return getContext<{
    tone: Readable<ToneType>;
    text: Readable<(key: ContentKey, fallback?: string) => string>;
    setTone: (tone: ToneType) => void;
    toggleTone: () => void;
  }>(TONE_KEY);
}