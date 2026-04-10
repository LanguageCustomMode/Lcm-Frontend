<script lang="ts">
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import { fetchSSE } from '$lib/utils/sse';
	import { apiPost } from '$lib/api';

	let { data } = $props();

	type WorksheetItem = {
		prompt: string;
		format: string;
		expected: string | null;
		options: string[] | null;
		response: string | null;
		feedback: string | null;
		status: 'pending' | 'complete' | 'incomplete' | 'skipped';
		user_feedback: string | null;
		errors: any[] | null;
	};

	type Session = {
		id: string;
		items: WorksheetItem[];
		skips_used: number;
		max_skips: number;
		status: string;
		summary?: any;
	};

	let session = $state<Session | null>(null);
	let currentIndex = $state(0);
	let userResponse = $state('');
	let userFeedback = $state('');
	let loading = $state(false);
	let feedbackText = $state('');
	let error = $state<string | null>(null);
	let completed = $state(false);

	const worksheetType = $derived(() => {
		return $page.url.searchParams.get('type') || 'practice';
	});

	const currentItem = $derived(() => {
		if (!session) return null;
		return session.items[currentIndex] ?? null;
	});

	const skipsRemaining = $derived(() => {
		if (!session) return 0;
		return session.max_skips - session.skips_used;
	});

	const progress = $derived(() => {
		if (!session) return { done: 0, total: 0 };
		const done = session.items.filter(i => i.status === 'complete' || i.status === 'skipped').length;
		return { done, total: session.items.length };
	});

	onMount(async () => {
		loading = true;
		try {
			session = await apiPost<Session>('/worksheet/create', {
				plot_id: $page.params.plotId,
				activity_id: $page.params.activityId,
				worksheet_type: worksheetType(),
			});
		} catch (e: any) {
			error = e.detail || e.message;
		}
		loading = false;
	});

	const submitResponse = async () => {
		if (!session || !userResponse.trim()) return;
		loading = true;
		feedbackText = '';
		error = null;

		try {
			for await (const event of fetchSSE(`/api/worksheet/${session.id}/respond`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ item_index: currentIndex, response: userResponse }),
			})) {
				if (event.event === 'token') {
					try {
						feedbackText = JSON.parse(event.data);
					} catch {
						feedbackText = event.data;
					}
				} else if (event.event === 'done') {
					const payload = JSON.parse(event.data);
					// Update local session state
					if (session) {
						session.items[currentIndex].response = userResponse;
						session.items[currentIndex].feedback = feedbackText;
						session.items[currentIndex].status = payload.status;
						session.items[currentIndex].errors = payload.errors;
						session = session; // trigger reactivity
					}
				}
			}
		} catch (e: any) {
			error = e.message;
		}
		loading = false;
		userResponse = '';
	};

	const skipItem = async () => {
		if (!session) return;
		try {
			session = await apiPost<Session>(`/worksheet/${session.id}/skip`, {
				item_index: currentIndex,
			});
			advanceToNext();
		} catch (e: any) {
			error = e.detail || e.message;
		}
	};

	const leaveFeedback = async () => {
		if (!session || !userFeedback.trim()) return;
		try {
			session = await apiPost<Session>(`/worksheet/${session.id}/feedback`, {
				item_index: currentIndex,
				feedback: userFeedback,
			});
			userFeedback = '';
		} catch (e: any) {
			error = e.detail || e.message;
		}
	};

	const advanceToNext = () => {
		if (!session) return;
		// Find next pending item
		for (let i = currentIndex + 1; i < session.items.length; i++) {
			if (session.items[i].status === 'pending') {
				currentIndex = i;
				feedbackText = '';
				return;
			}
		}
		// No more items
		completeWorksheet();
	};

	const completeWorksheet = async () => {
		if (!session) return;
		try {
			session = await apiPost<Session>(`/worksheet/${session.id}/complete`, {});
			completed = true;
		} catch (e: any) {
			error = e.detail || e.message;
		}
	};

	const goBack = () => {
		goto(`/dashboard/plots/${$page.params.plotId}/activities/${$page.params.activityId}`);
	};
</script>

<h1>{worksheetType() === 'primer' ? 'Primer Worksheet' : 'Practice Worksheet'}</h1>

{#if error}
	<p class="error">{error}</p>
{/if}

{#if loading && !session}
	<p>Generating worksheet...</p>
{:else if completed && session?.summary}
	<div class="summary">
		<h2>Worksheet Complete</h2>
		<div class="summary-grid">
			<div><strong>Completed</strong><span>{session.summary.completed}/{session.summary.total_items}</span></div>
			<div><strong>Skipped</strong><span>{session.summary.skipped}</span></div>
			<div><strong>Errors Found</strong><span>{session.summary.error_count}</span></div>
		</div>
		{#if session.summary.errors?.length > 0}
			<div class="error-list">
				<h3>Errors to Review</h3>
				{#each session.summary.errors as err}
					<div class="error-item">
						<span class="error-type">{err.error_type}</span>
						<span>"{err.original_text}" → "{err.corrected_text}"</span>
					</div>
				{/each}
			</div>
		{/if}
		<button type="button" onclick={goBack}>Back to Activity</button>
	</div>
{:else if session && currentItem()}
	<div class="progress-bar">
		<div class="progress-fill" style="width: {(progress().done / progress().total) * 100}%"></div>
		<span class="progress-label">{progress().done}/{progress().total}</span>
	</div>

	<div class="worksheet-item">
		<div class="item-header">
			<span class="item-format">{currentItem()?.format?.replace(/_/g, ' ')}</span>
			<span class="item-number">Question {currentIndex + 1} of {session.items.length}</span>
		</div>

		<p class="item-prompt">{currentItem()?.prompt}</p>

		{#if currentItem()?.options}
			<div class="options">
				{#each currentItem()?.options ?? [] as option, i}
					<button
						type="button"
						class:selected={userResponse === option}
						onclick={() => userResponse = option}
					>
						{option}
					</button>
				{/each}
			</div>
		{/if}

		{#if currentItem()?.status === 'pending'}
			{#if !currentItem()?.options}
				<textarea
					bind:value={userResponse}
					placeholder="Type your response..."
					rows="3"
					onkeydown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submitResponse(); }}}
				></textarea>
			{/if}
			<div class="item-actions">
				<button type="button" onclick={submitResponse} disabled={loading || !userResponse.trim()}>
					{loading ? 'Evaluating...' : 'Submit'}
				</button>
				<button type="button" class="secondary" onclick={skipItem} disabled={skipsRemaining() <= 0}>
					Skip ({skipsRemaining()} left)
				</button>
			</div>
		{/if}

		{#if feedbackText || currentItem()?.feedback}
			<div class="feedback" class:complete={currentItem()?.status === 'complete'} class:incomplete={currentItem()?.status === 'incomplete'}>
				<p>{feedbackText || currentItem()?.feedback}</p>
				{#if currentItem()?.errors?.length}
					<div class="inline-errors">
						{#each currentItem()?.errors ?? [] as err}
							<span class="inline-error">{err.error_type}: "{err.original_text}" → "{err.corrected_text}"</span>
						{/each}
					</div>
				{/if}
			</div>
		{/if}

		{#if currentItem()?.status === 'complete'}
			<div class="user-feedback-area">
				<input bind:value={userFeedback} placeholder="Leave feedback on this question (optional)" />
				{#if userFeedback.trim()}
					<button type="button" class="small" onclick={leaveFeedback}>Save</button>
				{/if}
			</div>
			<button type="button" onclick={advanceToNext}>Continue</button>
		{:else if currentItem()?.status === 'incomplete'}
			<p class="try-again">Try again or skip this question.</p>
		{/if}
	</div>
{:else}
	<p>No worksheet items available.</p>
{/if}

<style>
	.progress-bar {
		height: 8px;
		background: #e8e8e2;
		border-radius: 4px;
		position: relative;
		margin-bottom: 1rem;
	}

	.progress-fill {
		height: 100%;
		background: var(--color-primary);
		border-radius: 4px;
		transition: width 0.3s ease;
	}

	.progress-label {
		position: absolute;
		right: 0;
		top: -1.2rem;
		font-size: 0.7rem;
		color: #888;
	}

	.worksheet-item {
		background: white;
		border: 1px solid var(--color-border);
		border-radius: var(--radius);
		padding: 1.25rem;
		display: grid;
		gap: 0.75rem;
	}

	.item-header {
		display: flex;
		justify-content: space-between;
		font-size: 0.75rem;
		color: #888;
	}

	.item-format {
		text-transform: capitalize;
		background: #f0f0ec;
		padding: 0.15rem 0.5rem;
		border-radius: 999px;
	}

	.item-prompt {
		font-size: 1.05rem;
		line-height: 1.5;
		margin: 0;
	}

	.options {
		display: grid;
		gap: 0.4rem;
	}

	.options button {
		text-align: left;
		border: 1px solid var(--color-border);
		background: #fff;
		border-radius: var(--radius);
		padding: 0.5rem 0.75rem;
		cursor: pointer;
	}

	.options button.selected {
		border-color: var(--color-primary);
		background: #f6fae8;
	}

	textarea {
		border: 1px solid var(--color-border);
		border-radius: var(--radius);
		padding: 0.5rem 0.6rem;
		resize: vertical;
	}

	.item-actions {
		display: flex;
		gap: 0.5rem;
	}

	button {
		border: 1px solid var(--color-border);
		background: var(--color-primary);
		color: white;
		border-radius: 999px;
		padding: 0.4rem 0.8rem;
		cursor: pointer;
	}

	button:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.secondary {
		background: #fff;
		color: #333;
	}

	.small {
		font-size: 0.75rem;
		padding: 0.25rem 0.6rem;
	}

	.feedback {
		border-radius: var(--radius);
		padding: 0.75rem;
		font-size: 0.9rem;
	}

	.feedback.complete {
		background: #e8f5e9;
		border: 1px solid #a5d6a7;
	}

	.feedback.incomplete {
		background: #fff3e0;
		border: 1px solid #ffcc80;
	}

	.inline-errors {
		display: grid;
		gap: 0.3rem;
		margin-top: 0.5rem;
		font-size: 0.8rem;
	}

	.inline-error {
		color: #b42318;
	}

	.try-again {
		font-size: 0.85rem;
		color: #e65100;
	}

	.user-feedback-area {
		display: flex;
		gap: 0.4rem;
		align-items: center;
	}

	.user-feedback-area input {
		flex: 1;
		border: 1px solid var(--color-border);
		border-radius: var(--radius);
		padding: 0.35rem 0.6rem;
		font-size: 0.8rem;
	}

	.summary {
		background: white;
		border: 1px solid var(--color-border);
		border-radius: var(--radius);
		padding: 1.5rem;
		display: grid;
		gap: 1rem;
	}

	.summary-grid {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 0.75rem;
	}

	.summary-grid div {
		background: #f6f6f1;
		border-radius: var(--radius);
		padding: 0.6rem;
		display: grid;
		gap: 0.2rem;
	}

	.summary-grid strong {
		font-size: 0.7rem;
		text-transform: uppercase;
		color: #666;
	}

	.error-list {
		display: grid;
		gap: 0.4rem;
	}

	.error-item {
		font-size: 0.85rem;
		display: flex;
		gap: 0.5rem;
	}

	.error-type {
		background: #fce4ec;
		padding: 0.1rem 0.4rem;
		border-radius: 999px;
		font-size: 0.7rem;
	}

	.error { color: #b42318; }
</style>
