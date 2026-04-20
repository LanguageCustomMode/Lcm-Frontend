<script lang="ts">
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import { page } from '$app/stores';

	let { data } = $props();

	onMount(() => {
		const plotId = $page.params.plotId ?? data.plot?.id;
		if (plotId) goto(`/dashboard/plots/${plotId}`, { replaceState: true });
	});
</script>

<p class="deprecated">
	The standalone design page is deprecated — the Design chat now lives at the top of the plot page.
	Redirecting…
</p>

<style>
	.deprecated {
		color: #666;
		font-size: 0.85rem;
	}
</style>
