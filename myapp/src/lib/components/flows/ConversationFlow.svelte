<script lang="ts">
	import ChatWindow from '$lib/components/chat/ChatWindow.svelte';
	import { fetchSSE } from '$lib/utils/sse';
	import { onMount } from 'svelte';
	import type { Activity } from '$lib/types';

	interface Correction {
		original?: string;
		correction?: string;
		explanation?: string;
		error_type?: string;
		[key: string]: unknown;
	}

	interface SessionSummary {
		xp_earned: number;
		summary?: string;
		errors?: Correction[];
	}

	let { activity }: { activity: Activity } = $props();

	let messages: { role: 'user' | 'assistant'; content: string }[] = $state([]);
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
		try {
			const endpoint = forceNew
				? `/api/llm/interact/${activity.id}/start`
				: `/api/llm/interact/${activity.id}/start-or-resume`;
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
		messages = [...messages, { role: 'user', content: message }, { role: 'assistant', content: '' }];
		const assistantIndex = messages.length - 1;
		let buffer = '';
		loading = true;

		try {
			for await (const event of fetchSSE(
				`/api/llm/interact/${sessionId}/message`,
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
						const parsed = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
						const delta = Number(parsed?.delta ?? 0);
						const total = Number(parsed?.session_total ?? sessionXp);
						sessionXp = total;
						if (delta > 0) {
							xpPulse = delta;
							setTimeout(() => { xpPulse = 0; }, 1500);
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
			const res = await fetch(`/api/llm/interact/${sessionId}/end`, { method: 'POST' });
			if (res.ok) {
				sessionSummary = await res.json();
			}
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to end session';
		}
	};

	onMount(() => { startSession(); });
</script>

<h1>Practice</h1>
{#if error}
	<p class="error">{error}</p>
{/if}

{#if sessionSummary}
	<div class="summary-card">
		<h2>Session Complete</h2>
		{#if sessionSummary.summary}
			<p class="summary-text">{sessionSummary.summary}</p>
		{/if}
		<div class="xp-badge">+{sessionSummary.xp_earned} XP</div>
		{#if sessionSummary.errors && sessionSummary.errors.length > 0}
			<h3>Errors reviewed</h3>
			<ul class="summary-errors">
				{#each sessionSummary.errors as err}
					<li>
						{#if err.original}<span class="orig">{err.original}</span>{/if}
						{#if err.correction}<span class="arrow">→</span><span class="fix">{err.correction}</span>{/if}
						{#if err.explanation}<p class="expl">{err.explanation}</p>{/if}
					</li>
				{/each}
			</ul>
		{/if}
		<button type="button" onclick={() => { sessionSummary = null; corrections = []; startSession({ forceNew: true }); }}>New Session</button>
	</div>
{:else}
	<div class="practice-layout">
		<ChatWindow {messages} {loading} onsend={sendMessage} />
		<div class="panel">
			<div class="xp-live">
				<span class="xp-total">{sessionXp} XP</span>
				{#if xpPulse > 0}
					<span class="xp-pulse">+{xpPulse}</span>
				{/if}
			</div>
			<h3>Corrections</h3>
			{#if corrections.length === 0}
				<p class="empty-note">No corrections yet.</p>
			{:else}
				<ul class="corrections-list">
					{#each corrections as item}
						<li class="correction-item">
							{#if item.original || item.correction}
								<div class="correction-pair">
									{#if item.original}<span class="orig">{item.original}</span>{/if}
									{#if item.correction}<span class="arrow">→</span><span class="fix">{item.correction}</span>{/if}
								</div>
								{#if item.explanation}<p class="expl">{item.explanation}</p>{/if}
								{#if item.error_type}<span class="tag">{item.error_type}</span>{/if}
							{:else}
								<code>{JSON.stringify(item)}</code>
							{/if}
						</li>
					{/each}
				</ul>
			{/if}
			<button type="button" onclick={endSession}>End Session</button>
		</div>
	</div>
{/if}

<style>
	.practice-layout {
		display: grid;
		grid-template-columns: 2fr 1fr;
		gap: 1rem;
		align-items: start;
	}

	.panel {
		background: white;
		border: 1px solid var(--color-border);
		border-radius: var(--radius);
		padding: 1rem;
		display: grid;
		gap: 0.75rem;
	}

	.empty-note {
		font-size: 0.8rem;
		color: #999;
	}

	.corrections-list {
		list-style: none;
		display: grid;
		gap: 0.75rem;
		font-size: 0.8rem;
	}

	.correction-item {
		border-left: 3px solid var(--color-accent);
		padding-left: 0.6rem;
		display: grid;
		gap: 0.25rem;
	}

	.correction-pair {
		display: flex;
		flex-wrap: wrap;
		gap: 0.4rem;
		align-items: center;
	}

	.orig {
		color: #b42318;
		text-decoration: line-through;
	}

	.arrow {
		color: #999;
	}

	.fix {
		color: #0f766e;
		font-weight: 600;
	}

	.expl {
		font-size: 0.75rem;
		color: #555;
		margin: 0;
	}

	.tag {
		font-size: 0.65rem;
		background: #f0f0ea;
		color: #555;
		border-radius: 999px;
		padding: 0.15rem 0.5rem;
		text-transform: uppercase;
		letter-spacing: 0.04em;
	}

	button {
		border: 1px solid var(--color-border);
		background: var(--color-primary);
		color: white;
		border-radius: 999px;
		padding: 0.4rem 0.8rem;
		cursor: pointer;
	}

	.error {
		color: #b42318;
		margin-bottom: 0.5rem;
	}

	.summary-card {
		background: white;
		border: 1px solid var(--color-border);
		border-radius: var(--radius);
		padding: 1.5rem;
		display: grid;
		gap: 1rem;
		max-width: 600px;
	}

	.summary-text {
		color: #555;
		font-size: 0.9rem;
	}

	.xp-live {
		display: flex;
		align-items: baseline;
		gap: 0.5rem;
	}

	.xp-total {
		font-size: 1rem;
		font-weight: 700;
		color: var(--color-accent);
	}

	.xp-pulse {
		font-size: 0.85rem;
		font-weight: 700;
		color: #0f766e;
		animation: xp-pop 1.2s ease-out;
	}

	@keyframes xp-pop {
		0% { transform: translateY(0); opacity: 0; }
		20% { transform: translateY(-6px); opacity: 1; }
		100% { transform: translateY(-14px); opacity: 0; }
	}

	.xp-badge {
		font-size: 1.5rem;
		font-weight: 700;
		color: var(--color-accent);
	}

	.summary-errors {
		list-style: none;
		display: grid;
		gap: 0.75rem;
	}

	.summary-errors li {
		border-left: 3px solid var(--color-accent);
		padding-left: 0.6rem;
		font-size: 0.85rem;
		display: grid;
		gap: 0.2rem;
	}

	@media (max-width: 900px) {
		.practice-layout {
			grid-template-columns: 1fr;
		}
	}
</style>
