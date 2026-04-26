<script lang="ts">
	import ActivityBrowser from '$lib/components/activity/ActivityBrowser.svelte';
	import ModifyTab from '$lib/components/activity/ModifyTab.svelte';
	import Worksheet from '$lib/components/activity/Worksheet.svelte';
	import { onMount } from 'svelte';
	import type { Activity, ActivityStats, FlowType } from '$lib/types';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';

	const FLOW_LABELS: Record<FlowType, string> = {
		flashcard_review: 'Review',
		flashcard_audio: 'Pronunciation',
		audiocard_review: 'Listening',
		mcq_review: 'MCQ',
		conversation: 'Practice',
		dialogue_chat: 'Dialogue',
		writing_chat: 'Writing',
		reading_chat: 'Reading',
		tutor_chat: 'Tutor'
	};

	let { data } = $props();

	let activity = $state<Activity | null>(null);
	let stats = $state<ActivityStats | null>(null);
	let loading = $state(false);
	let error = $state<string | null>(null);
	let activeTab = $state<'overview' | 'modify'>('overview');
	let worksheetState = $state<WorksheetInitialState | null>(null);
	let generating = $state(false);
	let browserRefreshKey = $state(0);
	let pollStartedFor = $state<string | null>(null);

	interface WorksheetInitialState {
		session_id: string;
		messages: { role: 'user' | 'assistant' | 'system'; content: string; kind?: 'question' | 'commentary' }[];
		questions_asked: number;
		max_questions: number;
		min_questions?: number;
		answers_count?: number;
		complete: boolean;
	}

	const hasWorksheet = $derived(
		!!activity && activity.type !== 'generic_conversation' && activity.type !== 'errors_srs'
	);
	const hasModifyTab = $derived(!!activity && activity.type !== 'generic_conversation');
	const worksheetComplete = $derived(!!worksheetState?.complete);
	// errors_srs has no worksheet → expand generated content.
	// regular activities expand generated content once the worksheet is done.
	const generatedContentOpen = $derived(
		!!activity && (!hasWorksheet || worksheetComplete)
	);

	const loadActivity = async () => {
		loading = true;
		error = null;
		try {
			const res = await fetch(`/api/activities/${$page.params.activityId}`);
			if (!res.ok) throw new Error(await res.text());
			activity = await res.json();
			const statsRes = await fetch(`/api/activities/${$page.params.activityId}/stats`);
			if (statsRes.ok) stats = await statsRes.json();
			if (hasWorksheet) {
				const wsRes = await fetch(
					`/api/llm/worksheet/${$page.params.activityId}/start-or-resume`,
					{ method: 'POST' }
				);
				if (wsRes.ok) worksheetState = await wsRes.json();
			}
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to load activity';
		} finally {
			loading = false;
		}
	};

	const exitActivity = async () => {
		if (data.plot?.id) {
			await goto(`/dashboard/plots/${data.plot.id}`);
			return;
		}
		await goto('/dashboard');
	};

	const fetchContentCount = async (id: string): Promise<number> => {
		const res = await fetch(`/api/activities/${id}/content?limit=200`);
		if (!res.ok) return -1;
		const items = await res.json();
		return Array.isArray(items) ? items.length : -1;
	};

	const refreshStats = async (id: string) => {
		const res = await fetch(`/api/activities/${id}/stats`);
		if (res.ok) stats = await res.json();
	};

	const pollForGeneratedContent = async (id: string) => {
		const baseline = await fetchContentCount(id);
		generating = true;
		const start = Date.now();
		const maxMs = 120_000;
		const intervalMs = 3_000;
		let lastCount = baseline;
		let stableHits = 0;
		while (Date.now() - start < maxMs) {
			await new Promise((r) => setTimeout(r, intervalMs));
			const count = await fetchContentCount(id);
			if (count > baseline && count === lastCount) {
				stableHits += 1;
				if (stableHits >= 2) break;
			} else if (count > baseline) {
				stableHits = 1;
			} else {
				stableHits = 0;
			}
			lastCount = count;
		}
		await refreshStats(id);
		browserRefreshKey += 1;
		generating = false;
	};

	const handleWorksheetComplete = (state: WorksheetInitialState) => {
		worksheetState = {
			...(worksheetState ?? state),
			...state,
			complete: true
		};
	};

	$effect(() => {
		if (worksheetComplete && activity && pollStartedFor !== activity.id) {
			pollStartedFor = activity.id;
			pollForGeneratedContent(activity.id);
		}
	});

	onMount(loadActivity);
</script>

{#if error}
	<p class="error">{error}</p>
{/if}
{#if loading}
	<p>Loading activity...</p>
{:else if activity}
	<div class="plot-header">
		<div>
			<h1>{activity.name}</h1>
			<p class="plot-desc">{activity.type.replace(/_/g, ' ')}</p>
		</div>
		<div class="actions">
			{#each activity.supported_flows ?? [] as flow}
				<button
					type="button"
					onclick={() => goto(`/dashboard/plots/${data.plot?.id}/activities/${activity!.id}/flows/${flow}`)}
				>
					{FLOW_LABELS[flow] ?? flow}
				</button>
			{/each}
			<button type="button" onclick={() => goto(`/dashboard/plots/${data.plot?.id}/activities/${activity!.id}/edit`)}>
				Edit
			</button>
			<button type="button" onclick={exitActivity}>Return to Plot</button>
		</div>
	</div>
	{#if stats}
		<div class="stats-grid">
			<div><strong>Level</strong><span>{stats.level}</span></div>
			<div><strong>XP</strong><span>{stats.xp}</span></div>
			<div><strong>Due</strong><span>{stats.due_cards}</span></div>
			<div><strong>New</strong><span>{stats.new_cards}</span></div>
			<div><strong>Ripeness</strong><span>{Math.round(stats.ripeness * 100)}%</span></div>
			<div><strong>Streak</strong><span>{stats.streak}</span></div>
		</div>
	{/if}

	<div class="tabs" role="tablist">
		<button
			type="button"
			role="tab"
			aria-selected={activeTab === 'overview'}
			class:active={activeTab === 'overview'}
			onclick={() => (activeTab = 'overview')}
		>
			Overview
		</button>
		{#if hasModifyTab}
			<button
				type="button"
				role="tab"
				aria-selected={activeTab === 'modify'}
				class:active={activeTab === 'modify'}
				onclick={() => (activeTab = 'modify')}
			>
				Modify
			</button>
		{/if}
	</div>

	{#if activeTab === 'overview'}
		{#if hasWorksheet && !worksheetComplete}
			<Worksheet
				activityId={activity.id}
				initialState={worksheetState}
				onComplete={handleWorksheetComplete}
			/>
		{/if}
		<details class="browser-details" open={generatedContentOpen}>
			<summary>
				Generated content
				{#if generating}<span class="generating">· generating…</span>{/if}
			</summary>
			{#key browserRefreshKey}
				<ActivityBrowser activityId={activity.id} />
			{/key}
		</details>
		{#if hasWorksheet && worksheetComplete}
			<details class="browser-details">
				<summary>Worksheet (completed)</summary>
				<Worksheet activityId={activity.id} initialState={worksheetState} disabled />
			</details>
		{/if}
	{:else}
		<ModifyTab activityId={activity.id} />
	{/if}
{:else}
	<p>No activity found.</p>
{/if}

<style>
	.plot-header {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		gap: 1rem;
		margin-bottom: 1rem;
	}
	.plot-header h1 {
		font-family: 'Nunito', 'Trebuchet MS', 'Segoe UI', sans-serif;
		font-weight: 700;
	}
	.plot-desc {
		font-size: 0.8rem;
		color: #666;
		margin-top: 0.25rem;
	}

	.actions {
		display: flex;
		gap: 0.5rem;
	}

	button {
		border: 1px solid var(--color-border);
		background: var(--color-primary);
		color: white;
		border-radius: 999px;
		padding: 0.35rem 0.8rem;
		cursor: pointer;
	}

	.stats-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
		gap: 0.75rem;
		margin-bottom: 1rem;
	}

	.stats-grid div {
		background: #f6f6f1;
		border-radius: var(--radius);
		padding: 0.5rem 0.7rem;
		display: grid;
		gap: 0.25rem;
	}

	.stats-grid strong {
		font-size: 0.7rem;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		color: #666;
	}

	.error {
		color: #b42318;
	}

	.tabs {
		display: flex;
		gap: 0.3rem;
		border-bottom: 1px solid var(--color-border);
		margin: 1rem 0;
	}
	.tabs button {
		background: transparent;
		color: #555;
		border: none;
		border-bottom: 2px solid transparent;
		border-radius: 0;
		padding: 0.5rem 0.9rem;
		cursor: pointer;
		font-size: 0.85rem;
	}
	.tabs button.active {
		color: var(--color-primary);
		border-bottom-color: var(--color-primary);
		font-weight: 600;
	}

	.browser-details {
		margin-top: 1rem;
	}
	.browser-details summary {
		cursor: pointer;
		font-size: 0.8rem;
		color: #555;
		padding: 0.3rem 0;
	}
	.generating {
		margin-left: 0.4rem;
		color: #4a7c59;
		font-style: italic;
	}
</style>
