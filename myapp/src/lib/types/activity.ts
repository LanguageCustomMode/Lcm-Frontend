export type ActivityType =
	| 'vocabulary'
	| 'grammar_theory'
	| 'grammar_processing'
	| 'cultural_knowledge'
	| 'template_sentences'
	| 'grammar_manipulations'
	| 'fundamentals'
	| 'reading'
	| 'dialogue'
	| 'writing_practice'
	| 'pronunciation'
	| 'listening'
	| 'errors_srs'
	| 'generic_conversation';

export interface Activity {
	id: string;
	plot_id: string;
	name: string;
	type: ActivityType;
	config: Record<string, unknown>;
	grid_positions: [number, number][];
	parent_activity_id?: string;
	primer_completed?: boolean;
	xp: number;
	level: number;
}

export interface ActivityStats {
	level: number;
	xp: number;
	total_cards: number;
	due_cards: number;
	new_cards: number;
	learning_cards: number;
	review_cards: number;
	ripeness: number;
	retention: number;
	streak: number;
}
