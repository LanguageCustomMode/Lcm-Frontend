<script lang="ts">
	import ActivityEditor from '$lib/components/activity/ActivityEditor.svelte';

	let { data } = $props();
</script>

<!-- TODO: Load activity from API -->
<!--
Stub outline:
- GET /activities/{activity_id} for initial data.
- ActivityEditor on save: PATCH /activities/{activity_id}.
- Offer delete/archive action.
-->
<h1>Edit Activity</h1>
