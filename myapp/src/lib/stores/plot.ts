import { writable } from 'svelte/store';
import type { Plot } from '$lib/types';

export const currentPlot = writable<Plot | null>(null);
export const plotList = writable<Plot[]>([]);
