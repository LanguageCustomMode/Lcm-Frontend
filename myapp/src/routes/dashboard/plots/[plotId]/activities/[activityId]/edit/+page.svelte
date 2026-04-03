<script lang="ts">
	import ActivityEditor from '$lib/components/activity/ActivityEditor.svelte';
	import { onMount } from 'svelte';
	import type { Activity } from '$lib/types';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';

	let { data } = $props();

	let activity = $state<Activity | null>(null);
	let loading = $state(false);
	let error = $state<string | null>(null);

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
		if (!activity) return;
		try {
			await fetch(`/api/llm/generate/${activity.id}`, { method: 'POST' });
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to start generation';
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
	<ActivityEditor {activity} onsave={saveActivity} ongenerate={generateCards} />
	<button type="button" class="delete" on:click={deleteActivity}>Delete Activity</button>
{:else}
	<p>No activity found.</p>
{/if}

<style>
	.error {
		color: #b42318;
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
