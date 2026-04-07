export type ContentType =
	| 'card'
	| 'note'
	| 'mcq'
	| 'error'
	| 'audio_card'
	| 'wildcard'
	| 'knowledge_component'
	| 'sentence';

export interface CardContent {
	front: string;
	back: string;
	instruction?: string;
}

export interface NoteContent {
	text: string;
}

export interface McqContent {
	question: string;
	answers: string[];
	correct_index: number;
}

export interface ErrorContent {
	front: string;
	back: string;
	instruction?: string;
	error_category: string;
}

export interface AudioCardContent {
	front: string;
	back: string;
	instruction?: string;
	audio_url: string;
}

export interface WildCardContent {
	text: string;
}

export interface KnowledgeComponentContent {
	short_name: string;
	description: string;
	how_to_grade?: string;
}

export interface SentenceContent {
	sentence: string;
	source_content_id?: string;
	span?: number[];
}

export type ContentPayload =
	| CardContent
	| NoteContent
	| McqContent
	| ErrorContent
	| AudioCardContent
	| WildCardContent
	| KnowledgeComponentContent
	| SentenceContent;

export interface SrsRecord {
	id: string;
	due: string | null;
	state: number;
	reps: number;
	lapses: number;
	stability: number;
	difficulty: number;
}

export interface ContentItem {
	id: string;
	activity_id: string;
	content_type: ContentType;
	content: ContentPayload;
	srs_record_id?: string;
	knowledge_component_id?: string;
	sort_order: number;
	srs_records?: SrsRecord;
}

export interface ReviewSession {
	session_id: string;
	items: ContentItem[];
}

export interface ReviewSummary {
	total_reviewed: number;
	xp_earned: number;
	accuracy: number;
	next_review_at?: string;
	remaining_due?: number;
}
