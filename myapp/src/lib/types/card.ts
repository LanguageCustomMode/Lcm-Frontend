export interface Card {
	id: string;
	activity_id: string;
	front: string;
	back: string;
	extra_fields: Record<string, unknown>;
	due: string;
	state: number;
	reps: number;
	lapses: number;
}

export interface ReviewSession {
	session_id: string;
	cards: Card[];
}

export interface ReviewSummary {
	total_reviewed: number;
	xp_earned: number;
	accuracy: number;
	next_review_at?: string;
	remaining_due?: number;
}
