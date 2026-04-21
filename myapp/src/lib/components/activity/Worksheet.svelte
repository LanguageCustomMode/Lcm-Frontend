<script lang="ts">
	import { fetchSSE } from '$lib/utils/sse';
	import { onMount, tick } from 'svelte';

	interface VisibleMessage {
		role: 'user' | 'assistant' | 'system';
		content: string;
		kind?: 'question' | 'commentary';
	}

	interface InitialState {
		session_id: string;
		messages: VisibleMessage[];
		questions_asked: number;
		max_questions: number;
		complete: boolean;
	}

	interface Props {
		activityId: string;
		initialState?: InitialState | null;
		disabled?: boolean;
	}

	let { activityId, initialState = null, disabled = false }: Props = $props();

	let sessionId = $state<string | null>(null);
	let messages = $state<VisibleMessage[]>([]);
	let questionsAsked = $state(0);
	let maxQuestions = $state(10);
	let complete = $state(false);
	let answer = $state('');
	let loading = $state(false);
	let error = $state<string | null>(null);
	let scrollEl = $state<HTMLDivElement | null>(null);

	const scrollToBottom = async () => {
		await tick();
		scrollEl?.scrollTo({ top: scrollEl.scrollHeight, behavior: 'smooth' });
	};

	const startOrResume = async () => {
		loading = true;
		try {
			const res = await fetch(`/api/llm/worksheet/${activityId}/start-or-resume`, {
				method: 'POST'
			});
			if (!res.ok) throw new Error(await res.text());
			const payload = await res.json();
			sessionId = payload.session_id;
			messages = (payload.messages ?? []).filter(
				(m: VisibleMessage) => m.role !== 'system'
			);
			questionsAsked = payload.questions_asked ?? 0;
			maxQuestions = payload.max_questions ?? 10;
			complete = !!payload.complete;
			await scrollToBottom();
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to open worksheet';
		} finally {
			loading = false;
		}
	};

	const submitAnswer = async () => {
		if (!sessionId || !answer.trim() || loading || complete || disabled) return;
		const text = answer.trim();
		answer = '';
		error = null;
		messages = [...messages, { role: 'user', content: text }];
		loading = true;
		await scrollToBottom();

		try {
			for await (const event of fetchSSE(
				`/api/llm/worksheet/${sessionId}/answer`,
				{
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ answer: text })
				},
				true
			)) {
				if (event.event === 'token') {
					messages = [
						...messages,
						{ role: 'assistant', content: event.data, kind: 'commentary' }
					];
					await scrollToBottom();
				}
				if (event.event === 'question') {
					messages = [
						...messages,
						{ role: 'assistant', content: event.data, kind: 'question' }
					];
					await scrollToBottom();
				}
				if (event.event === 'done') {
					try {
						const payload = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
						if (payload?.complete) complete = true;
						if (typeof payload?.questions_asked === 'number')
							questionsAsked = payload.questions_asked;
						if (typeof payload?.max_questions === 'number')
							maxQuestions = payload.max_questions;
					} catch {
						/* ignore */
					}
				}
			}
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to submit answer';
		} finally {
			loading = false;
			await scrollToBottom();
		}
	};

	const handleKeydown = (e: KeyboardEvent) => {
		if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
			e.preventDefault();
			submitAnswer();
		}
	};

	onMount(() => {
		if (initialState) {
			sessionId = initialState.session_id;
			messages = (initialState.messages ?? []).filter((m) => m.role !== 'system');
			questionsAsked = initialState.questions_asked ?? 0;
			maxQuestions = initialState.max_questions ?? 10;
			complete = !!initialState.complete;
			scrollToBottom();
			return;
		}
		startOrResume();
	});
</script>

<div class="worksheet">
	<div class="worksheet-header">
		<h3>Worksheet</h3>
		<span class="progress">
			{questionsAsked} / {maxQuestions}
			{#if complete}· done{/if}
		</span>
	</div>

	{#if error}
		<p class="error">{error}</p>
	{/if}

	<div class="stream" bind:this={scrollEl}>
		{#each messages as msg (msg.content + (msg.kind ?? '') + msg.role)}
			<div class="turn turn-{msg.role} turn-kind-{msg.kind ?? 'plain'}">
				{#if msg.role === 'assistant' && msg.kind === 'question'}
					<div class="question">{msg.content}</div>
				{:else if msg.role === 'assistant'}
					<div class="commentary">{msg.content}</div>
				{:else}
					<div class="answer">{msg.content}</div>
				{/if}
			</div>
		{/each}
		{#if loading}
			<div class="turn turn-assistant">
				<div class="commentary">Thinking…</div>
			</div>
		{/if}
	</div>

	{#if complete || disabled}
		<div class="complete-banner">
			{#if complete}
				Worksheet complete — content is being generated from your answers.
			{:else}
				This worksheet is read-only.
			{/if}
		</div>
	{:else}
		<textarea
			bind:value={answer}
			placeholder="Your answer (⌘/Ctrl+Enter to submit)"
			disabled={loading || complete || disabled}
			onkeydown={handleKeydown}
			rows="3"
		></textarea>
		<div class="actions">
			<button type="button" disabled={loading || !answer.trim() || disabled} onclick={submitAnswer}>
				{loading ? 'Sending…' : 'Submit answer'}
			</button>
		</div>
	{/if}
</div>

<style>
	.worksheet {
		background: white;
		border: 1px solid var(--color-border);
		border-radius: var(--radius);
		padding: 1rem;
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
		height: 70vh;
	}
	.worksheet-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}
	.worksheet-header h3 {
		font-size: 0.85rem;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		color: #4a7c59;
		margin: 0;
	}
	.progress {
		font-size: 0.75rem;
		color: #888;
	}
	.stream {
		flex: 1;
		overflow-y: auto;
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
		padding-right: 0.3rem;
	}
	.turn {
		display: flex;
		flex-direction: column;
		gap: 0.3rem;
	}
	.question {
		font-size: 1rem;
		line-height: 1.5;
		color: #222;
		padding: 0.65rem 0.8rem;
		background: #f4faf4;
		border-left: 3px solid var(--color-primary);
		border-radius: var(--radius);
	}
	.commentary {
		font-size: 0.85rem;
		color: #555;
		font-style: italic;
		padding: 0.3rem 0.6rem;
	}
	.answer {
		font-size: 0.9rem;
		color: #222;
		padding: 0.55rem 0.8rem;
		background: #f6f6f1;
		border-radius: var(--radius);
		align-self: flex-end;
		max-width: 85%;
		white-space: pre-wrap;
	}
	textarea {
		border: 1px solid var(--color-border);
		border-radius: var(--radius);
		padding: 0.6rem 0.75rem;
		font-family: inherit;
		font-size: 0.9rem;
		resize: vertical;
	}
	.actions {
		display: flex;
		justify-content: flex-end;
	}
	.actions button {
		border: 1px solid var(--color-border);
		background: var(--color-primary);
		color: white;
		border-radius: 999px;
		padding: 0.4rem 1rem;
		font-size: 0.85rem;
		cursor: pointer;
	}
	.actions button:disabled {
		opacity: 0.5;
		cursor: default;
	}
	.complete-banner {
		background: #f4faf4;
		border: 1px solid #c8dfc5;
		border-radius: var(--radius);
		padding: 0.6rem 0.8rem;
		font-size: 0.85rem;
		color: #355e42;
	}
	.error {
		color: #b42318;
		font-size: 0.8rem;
	}
</style>
