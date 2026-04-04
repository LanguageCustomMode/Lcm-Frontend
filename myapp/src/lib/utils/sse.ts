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
	options?: RequestInit,
	debug = false
): AsyncGenerator<SSEEvent, void, unknown> {
	const response = await fetch(url, {
		...options,
		headers: {
			Accept: 'text/event-stream',
			...(options?.headers ?? {})
		}
	});
	if (debug) {
		console.debug('[sse] response', {
			url,
			status: response.status,
			ok: response.ok,
			contentType: response.headers.get('content-type')
		});
	}
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
		// Normalize CRLF to LF so we can reliably split on \n\n boundaries.
		if (buffer.includes('\r')) {
			buffer = buffer.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
		}
		if (debug) {
			console.debug('[sse] chunk', { len: value?.length ?? 0 });
		}
		let idx = buffer.indexOf('\n\n');
		while (idx >= 0) {
			const chunk = buffer.slice(0, idx);
			buffer = buffer.slice(idx + 2);
			const event = parseSseChunk(chunk, debug);
			if (event) yield event;
			idx = buffer.indexOf('\n\n');
		}
	}
	if (buffer.trim().length > 0) {
		const event = parseSseChunk(buffer, debug);
		if (event) yield event;
	}
}

function parseSseChunk(chunk: string, debug = false): SSEEvent | null {
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
	const data = dataLines.join('\n');
	if (debug) {
		console.debug('[sse] event', {
			event,
			dataPreview: data.length > 200 ? `${data.slice(0, 200)}...(truncated)` : data
		});
	}
	return { event, data };
}
