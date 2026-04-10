<script lang="ts">
	import ActivityBrowser from '$lib/components/activity/ActivityBrowser.svelte';
	import { onMount } from 'svelte';
	import type { Activity, ActivityStats } from '$lib/types';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';

	let { data } = $props();

	let activity = $state<Activity | null>(null);
	let stats = $state<ActivityStats | null>(null);
	let loading = $state(false);
	let error = $state<string | null>(null);
	let showModifyChat = $state(false);

	const loadActivity = async () => {
		loading = true;
		error = null;
		try {
			const res = await fetch(`/api/activities/${$page.params.activityId}`);
			if (!res.ok) throw new Error(await res.text());
			activity = await res.json();
			const statsRes = await fetch(`/api/activities/${$page.params.activityId}/stats`);
			if (statsRes.ok) stats = await statsRes.json();

			// Primer gate: redirect to primer worksheet if not completed
			if (activity && activity.primer_completed === false) {
				goto(`/dashboard/plots/${data.plot?.id}/activities/${activity.id}/worksheet?type=primer`);
				return;
			}
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
			<button type="button" onclick={() => goto(`/dashboard/plots/${data.plot?.id}/activities/${activity?.id}/review`)}>
				Review
			</button>
			<button
				type="button"
				onclick={() => goto(`/dashboard/plots/${data.plot?.id}/activities/${activity?.id}/interact`)}
			>
				Practice
			</button>
			<button type="button" onclick={() => goto(`/dashboard/plots/${data.plot?.id}/activities/${activity?.id}/worksheet?type=practice`)}>
				Worksheet
			</button>
			<button type="button" onclick={() => goto(`/dashboard/plots/${data.plot?.id}/activities/${activity?.id}/edit`)}>
				Edit
			</button>
			<button type="button" class="secondary" onclick={() => showModifyChat = !showModifyChat}>
				{showModifyChat ? 'Hide Chat' : 'Modify'}
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

	<div class="content-layout" class:with-chat={showModifyChat}>
		<div class="browser">
			<ActivityBrowser activityId={activity.id} />
		</div>
		{#if showModifyChat}
			<aside class="modify-panel">
				{#await import('$lib/components/activity/ModifyChat.svelte') then { default: ModifyChat }}
					<ModifyChat activityId={activity.id} />
				{/await}
			</aside>
		{/if}
	</div>
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
		flex-wrap: wrap;
	}

	button {
		border: 1px solid var(--color-border);
		background: var(--color-primary);
		color: white;
		border-radius: 999px;
		padding: 0.35rem 0.8rem;
		cursor: pointer;
	}

	.secondary {
		background: #fff;
		color: #333;
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

	.content-layout {
		display: grid;
		gap: 1rem;
	}

	.content-layout.with-chat {
		grid-template-columns: 1fr 350px;
	}

	.modify-panel {
		max-height: 70vh;
		overflow: hidden;
	}

	@media (max-width: 900px) {
		.content-layout.with-chat {
			grid-template-columns: 1fr;
		}
	}

	.error {
		color: #b42318;
	}
</style>
