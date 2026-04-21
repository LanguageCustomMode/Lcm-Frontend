export interface Profile {
	id: string;
	username: string;
	email?: string;
	xp: number;
	coins: number;
	level: number;
}

export interface Plot {
	id: string;
	name: string;
	description: string;
	l2_target: string;
	proficiency: string;
	grid_rows: number;
	grid_cols: number;
	archived: boolean;
	activity_count: number;
}

export interface PlotDetail extends Plot {
	activities: Activity[];
}

export interface PlotComposition {
	by_tier: Record<string, number>;
	by_modality: Record<string, number>;
	total_cards: number;
	due_cards: number;
}

export interface Idea {
	id: string;
	content: string;
	type: 'media' | 'idea' | 'note';
}

// Forward import to avoid circular
import type { Activity } from './activity';
