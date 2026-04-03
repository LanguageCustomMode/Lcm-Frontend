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
	const source = new EventSource(url);
	const handler = (evt: MessageEvent) => {
		onEvent({ event: evt.type || 'message', data: evt.data });
	};
	const events = ['message', 'token', 'suggestion', 'done', 'correction', 'progress', 'error'];
	for (const name of events) {
		source.addEventListener(name, handler as EventListener);
	}
	if (onError) source.addEventListener('error', onError);
	return source;
}

export async function* fetchSSE(
	url: string,
	options?: RequestInit
): AsyncGenerator<SSEEvent, void, unknown> {
	const response = await fetch(url, {
		...options,
		headers: {
			Accept: 'text/event-stream',
			...(options?.headers ?? {})
		}
	});
	if (!response.ok) {
		const text = await response.text();
		throw new Error(text || `SSE request failed (${response.status})`);
	}
	const reader = response.body?.getReader();
	if (!reader) return;

	const decoder = new TextDecoder();
	let buffer = '';

	while (true) {
		const { value, done } = await reader.read();
		if (done) break;
		buffer += decoder.decode(value, { stream: true });
		let idx = buffer.indexOf('\n\n');
		while (idx >= 0) {
			const chunk = buffer.slice(0, idx);
			buffer = buffer.slice(idx + 2);
			const event = parseSseChunk(chunk);
			if (event) yield event;
			idx = buffer.indexOf('\n\n');
		}
	}
	if (buffer.trim().length > 0) {
		const event = parseSseChunk(buffer);
		if (event) yield event;
	}
}

function parseSseChunk(chunk: string): SSEEvent | null {
	const lines = chunk.split('\n').map((line) => line.trim());
	let event = 'message';
	const dataLines: string[] = [];
	for (const line of lines) {
		if (!line || line.startsWith(':')) continue;
		if (line.startsWith('event:')) {
			event = line.slice(6).trim();
			continue;
		}
		if (line.startsWith('data:')) {
			dataLines.push(line.slice(5).trim());
		}
	}
	if (!dataLines.length) return null;
	return { event, data: dataLines.join('\n') };
}
