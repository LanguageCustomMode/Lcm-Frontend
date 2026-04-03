<script lang="ts">
	import ActivityBrowser from '$lib/components/activity/ActivityBrowser.svelte';

	let { data } = $props();
</script>

<!-- TODO: Load activity detail + cards from API -->
<!--
Stub outline:
- Load activity: GET /activities/{activity_id}.
- Load cards: GET /activities/{activity_id}/cards?status=...
- Show stats (level/xp/ripeness) and action buttons (Review/Practice/Edit).
- Wire ActivityBrowser to edit/delete cards.
-->
<h1>Activity Detail</h1>
<ActivityBrowser cards={[]} />
