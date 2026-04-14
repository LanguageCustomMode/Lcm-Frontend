<script lang="ts">
	import ActivityEditor from '$lib/components/activity/ActivityEditor.svelte';
	import { fetchSSE } from '$lib/utils/sse';
	import { onMount } from 'svelte';
	import type { Activity } from '$lib/types';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';

	let { data } = $props();

	let activity = $state<Activity | null>(null);
	let loading = $state(false);
	let error = $state<string | null>(null);

	// Generate state
	let generating = $state(false);
	let generateInstruction = $state('');
	let generateProgress = $state<{ done: number; total: number } | null>(null);
	let generateDone = $state<{ count: number } | null>(null);
	let generateError = $state<string | null>(null);

	const loadActivity = async () => {
		loading = true;
		error = null;
		try {
			const res = await fetch(`/api/activities/${$page.params.activityId}`);
			if (!res.ok) throw new Error(await res.text());
			activity = await res.json();
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to load activity';
		} finally {
			loading = false;
		}
	};

	const saveActivity = async (patch: Partial<Activity>) => {
		if (!activity) return;
		try {
			const res = await fetch(`/api/activities/${activity.id}`, {
				method: 'PATCH',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(patch)
			});
			if (!res.ok) throw new Error(await res.text());
			await loadActivity();
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to save activity';
		}
	};

	const deleteActivity = async () => {
		if (!activity) return;
		loading = true;
		try {
			const res = await fetch(`/api/activities/${activity.id}`, { method: 'DELETE' });
			if (!res.ok) throw new Error(await res.text());
			await goto(`/dashboard/plots/${data.plot?.id}`);
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to delete activity';
		} finally {
			loading = false;
		}
	};

	const generateCards = async () => {
		if (!activity || generating) return;
		generating = true;
		generateProgress = null;
		generateDone = null;
		generateError = null;

		try {
			const body: Record<string, unknown> = {};
			if (generateInstruction.trim()) body.instruction = generateInstruction.trim();

			for await (const event of fetchSSE(`/api/llm/generate/${activity.id}`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(body)
			})) {
				if (event.event === 'progress') {
					try {
						generateProgress = JSON.parse(event.data);
					} catch { /* ignore */ }
				}
				if (event.event === 'done') {
					try {
						generateDone = JSON.parse(event.data);
					} catch {
						generateDone = { count: 0 };
					}
				}
			}
		} catch (err) {
			generateError = err instanceof Error ? err.message : 'Generation failed';
		} finally {
			generating = false;
		}
	};

	onMount(loadActivity);
</script>

<h1>Edit Activity</h1>
{#if error}
	<p class="error">{error}</p>
{/if}
{#if loading}
	<p>Loading...</p>
{:else if activity}
	<ActivityEditor {activity} onsave={saveActivity} />

	<!-- Generate cards panel -->
	<div class="generate-panel">
		<h3>Generate Cards</h3>
		<div class="generate-row">
			<input
				bind:value={generateInstruction}
				placeholder="Optional instruction (e.g. focus on past tense verbs)"
				disabled={generating}
			/>
			<button type="button" onclick={generateCards} disabled={generating}>
				{generating ? 'Generating…' : 'Generate'}
			</button>
		</div>

		{#if generating && generateProgress}
			<div class="progress-bar-wrap">
				<div
					class="progress-bar"
					style="width: {generateProgress.total > 0 ? Math.round((generateProgress.done / generateProgress.total) * 100) : 0}%"
				></div>
			</div>
			<p class="progress-label">{generateProgress.done} / {generateProgress.total} cards</p>
		{:else if generating}
			<div class="progress-bar-wrap"><div class="progress-bar indeterminate"></div></div>
		{/if}

		{#if generateDone}
			<p class="gen-success">✓ Generated {generateDone.count} card{generateDone.count === 1 ? '' : 's'}</p>
		{/if}
		{#if generateError}
			<p class="error">{generateError}</p>
		{/if}
	</div>

	<button type="button" class="delete" onclick={deleteActivity}>Delete Activity</button>
{:else}
	<p>No activity found.</p>
{/if}

<style>
	.error {
		color: #b42318;
	}

	.generate-panel {
		margin-top: 1.25rem;
		background: white;
		border: 1px solid var(--color-border);
		border-radius: var(--radius);
		padding: 1rem;
		display: grid;
		gap: 0.75rem;
	}

	.generate-panel h3 {
		font-size: 0.9rem;
		font-weight: 600;
	}

	.generate-row {
		display: flex;
		gap: 0.5rem;
	}

	.generate-row input {
		flex: 1;
		border: 1px solid var(--color-border);
		border-radius: var(--radius);
		padding: 0.45rem 0.6rem;
		font-size: 0.85rem;
	}

	.generate-row button {
		border: 1px solid var(--color-border);
		background: var(--color-primary);
		color: white;
		border-radius: 999px;
		padding: 0.4rem 0.9rem;
		cursor: pointer;
		white-space: nowrap;
	}

	.generate-row button:disabled {
		opacity: 0.6;
		cursor: default;
	}

	.progress-bar-wrap {
		height: 6px;
		background: #eee;
		border-radius: 999px;
		overflow: hidden;
	}

	.progress-bar {
		height: 100%;
		background: var(--color-primary);
		border-radius: 999px;
		transition: width 0.3s ease;
	}

	@keyframes slide {
		0% { transform: translateX(-100%); }
		100% { transform: translateX(400%); }
	}

	.progress-bar.indeterminate {
		width: 25%;
		animation: slide 1.2s ease-in-out infinite;
	}

	.progress-label {
		font-size: 0.75rem;
		color: #666;
	}

	.gen-success {
		font-size: 0.85rem;
		color: #0f766e;
	}

	.delete {
		margin-top: 1rem;
		border: 1px solid #f4c7c3;
		background: #fff5f5;
		color: #b42318;
		border-radius: 999px;
		padding: 0.4rem 0.9rem;
		cursor: pointer;
	}
</style>
