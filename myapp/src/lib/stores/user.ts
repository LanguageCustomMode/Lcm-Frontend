import { writable } from 'svelte/store';
import type { Profile } from '$lib/types';

export const profile = writable<Profile | null>(null);
