import { fetchSSE } from '$lib/utils/sse';

export interface Correction {
	original?: string;
	correction?: string;
	explanation?: string;
	error_type?: string;
	[key: string]: unknown;
}

export interface SessionSummary {
	xp_earned: number;
	summary?: string;
	errors?: Correction[];
}

export interface ChatMessage {
	role: 'user' | 'assistant';
	content: string;
}

export interface UseChatSessionOptions {
	activityId: string;
	interactBasePath?: string;
}

export function useChatSession({
	activityId,
	interactBasePath = '/api/llm/interact'
}: UseChatSessionOptions) {
	let messages = $state<ChatMessage[]>([]);
	let loading = $state(false);
	let sessionId = $state<string | null>(null);
	let corrections = $state<Correction[]>([]);
	let error = $state<string | null>(null);
	let sessionSummary = $state<SessionSummary | null>(null);
	let sessionXp = $state(0);
	let xpPulse = $state(0);

	const startSession = async ({ forceNew = false }: { forceNew?: boolean } = {}) => {
		sessionXp = 0;
		xpPulse = 0;
		corrections = [];
		sessionSummary = null;
		try {
			const endpoint = forceNew
				? `${interactBasePath}/${activityId}/start`
				: `${interactBasePath}/${activityId}/start-or-resume`;
			const res = await fetch(endpoint, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({})
			});
			if (!res.ok) throw new Error(await res.text());
			const payload = await res.json();
			sessionId = payload.session_id;
			if (payload.resumed) {
				messages = (payload.messages ?? []).map((m: { role: string; content: string }) => ({
					role: m.role === 'user' ? 'user' : 'assistant',
					content: m.content ?? ''
				}));
				corrections = payload.errors ?? [];
				sessionXp = Number(payload.xp_earned ?? 0);
			} else {
				const opening = payload.opening_message ?? payload.message ?? '';
				messages = opening ? [{ role: 'assistant', content: opening }] : [];
			}
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to start session';
		}
	};

	const sendMessage = async (message: string) => {
		if (!sessionId) return;
		error = null;
		messages = [
			...messages,
			{ role: 'user', content: message },
			{ role: 'assistant', content: '' }
		];
		const assistantIndex = messages.length - 1;
		let buffer = '';
		loading = true;

		try {
			for await (const event of fetchSSE(
				`${interactBasePath}/${sessionId}/message`,
				{
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ message })
				},
				true
			)) {
				if (event.event === 'token') {
					buffer += event.data;
					messages = messages.map((msg, idx) =>
						idx === assistantIndex ? { ...msg, content: buffer } : msg
					);
				}
				if (event.event === 'correction') {
					try {
						const parsed = JSON.parse(event.data);
						corrections = Array.isArray(parsed) ? parsed : [parsed];
					} catch {
						corrections = [{ raw: event.data }];
					}
				}
				if (event.event === 'xp') {
					try {
						const parsed =
							typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
						const delta = Number(parsed?.delta ?? 0);
						const total = Number(parsed?.session_total ?? sessionXp);
						sessionXp = total;
						if (delta > 0) {
							xpPulse = delta;
							setTimeout(() => {
								xpPulse = 0;
							}, 1500);
						}
					} catch {
						// ignore malformed xp event
					}
				}
				if (event.event === 'done') {
					loading = false;
				}
			}
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to send message';
		} finally {
			loading = false;
		}
	};

	const endSession = async () => {
		if (!sessionId) return;
		try {
			const res = await fetch(`${interactBasePath}/${sessionId}/end`, { method: 'POST' });
			if (res.ok) {
				sessionSummary = await res.json();
			}
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to end session';
		}
	};

	const restart = () => startSession({ forceNew: true });

	return {
		get messages() { return messages; },
		get loading() { return loading; },
		get sessionId() { return sessionId; },
		get corrections() { return corrections; },
		get error() { return error; },
		set error(v: string | null) { error = v; },
		get sessionSummary() { return sessionSummary; },
		set sessionSummary(v: SessionSummary | null) { sessionSummary = v; },
		get sessionXp() { return sessionXp; },
		get xpPulse() { return xpPulse; },
		startSession,
		sendMessage,
		endSession,
		restart
	};
}
