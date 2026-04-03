<script lang="ts">
	import ActivityBrowser from '$lib/components/activity/ActivityBrowser.svelte';

	let { data } = $props();
</script>

<!-- TODO: Load activity detail + cards from API -->
<h1>Activity Detail</h1>
<ActivityBrowser cards={[]} />
