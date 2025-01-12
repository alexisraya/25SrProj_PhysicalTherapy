import { writable } from 'svelte/store';
import { lightColors, darkColors } from './colors';
import type { ColorScheme } from './colors';

export const theme = writable<'light' | 'dark'>('light');
export const colors = writable<ColorScheme>(lightColors);

theme.subscribe((mode) => {
  colors.set(mode === 'light' ? lightColors : darkColors);
});
