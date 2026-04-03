/**
 * EventSource client wrapper for consuming SSE streams from the API.
 */

export interface SSEEvent {
	event: string;
	data: string;
}

export function connectSSE(
	url: string,
	onEvent: (event: SSEEvent) => void,
	onError?: (error: Event) => void
): EventSource {
	throw new Error('Not implemented');
}

export async function* fetchSSE(
	url: string,
	options?: RequestInit
): AsyncGenerator<SSEEvent, void, unknown> {
	throw new Error('Not implemented');
}
