<script lang="ts">
	import PlotComposition from '$lib/components/composition/PlotComposition.svelte';
	import { onMount } from 'svelte';
	import type { PlotComposition as PlotCompositionType } from '$lib/types';

	let { data } = $props();

	let composition = $state<PlotCompositionType | null>(null);
	let loading = $state(false);
	let error = $state<string | null>(null);

	const loadComposition = async () => {
		if (!data.plot) return;
		loading = true;
		error = null;
		try {
			const res = await fetch(`/api/plots/${data.plot.id}/composition`);
			if (!res.ok) throw new Error(await res.text());
			composition = await res.json();
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to load composition';
		} finally {
			loading = false;
		}
	};

	onMount(loadComposition);
</script>

<h1>Plot Composition</h1>
{#if loading}
	<p>Loading composition...</p>
{:else if error}
	<p class="error">{error}</p>
{:else if composition}
	<PlotComposition {composition} />
{:else}
	<p>No composition data available yet.</p>
{/if}

<style>
	.error {
		color: #b42318;
	}
</style>
