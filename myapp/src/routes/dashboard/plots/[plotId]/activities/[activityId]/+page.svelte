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

	const loadActivity = async () => {
		loading = true;
		error = null;
		try {
			const res = await fetch(`/api/activities/${$page.params.activityId}`);
			if (!res.ok) throw new Error(await res.text());
			activity = await res.json();
			const statsRes = await fetch(`/api/activities/${$page.params.activityId}/stats`);
			if (statsRes.ok) stats = await statsRes.json();
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to load activity';
		} finally {
			loading = false;
		}
	};

	onMount(loadActivity);
</script>

<h1>Activity Detail</h1>
{#if error}
	<p class="error">{error}</p>
{/if}
{#if loading}
	<p>Loading activity...</p>
{:else if activity}
	<div class="activity-summary">
		<div>
			<h2>{activity.name}</h2>
			<p class="meta">{activity.type.replace(/_/g, ' ')}</p>
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
		<button
			type="button"
			role="tab"
			aria-selected={activeTab === 'modify'}
			class:active={activeTab === 'modify'}
			onclick={() => (activeTab = 'modify')}
		>
			Modify
		</button>
	</div>

	{#if activeTab === 'overview'}
		<Worksheet activityId={activity.id} />
		<details class="browser-details">
			<summary>Generated content</summary>
			<ActivityBrowser activityId={activity.id} />
		</details>
	{:else}
		<ModifyTab activityId={activity.id} />
	{/if}
{:else}
	<p>No activity found.</p>
{/if}

<style>
	.activity-summary {
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 1rem;
		margin-bottom: 1rem;
	}

	.meta {
		font-size: 0.8rem;
		color: #666;
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
</style>
