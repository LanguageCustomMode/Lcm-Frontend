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

export type FlowType =
	| 'flashcard_review'
	| 'flashcard_audio'
	| 'audiocard_review'
	| 'mcq_review'
	| 'conversation'
	| 'writing_chat'
	| 'reading_chat'
	| 'tutor_chat';

export interface Activity {
	id: string;
	plot_id: string;
	name: string;
	type: ActivityType;
	config: Record<string, unknown>;
	grid_positions: [number, number][];
	parent_activity_id?: string;
	xp: number;
	level: number;
	supported_flows?: FlowType[];
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
