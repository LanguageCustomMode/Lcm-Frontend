export interface Profile {
	id: string;
	username: string;
	email?: string;
	xp: number;
	coins: number;
	level: number;
}

export interface UserSettings {
	llm_provider: string | null;
	llm_api_key_set: boolean;
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
	questionnaire?: Record<string, unknown>;
	kit_type?: string;
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
	idea_type?: string;
	activity_type?: string;
	tag?: string;
	source?: string;
	sort_order?: number;
	claimed_activity_id?: string;
}

// Forward import to avoid circular
import type { Activity } from './activity';
