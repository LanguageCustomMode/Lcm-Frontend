<script lang="ts">
	import type { Activity } from '$lib/types';

	interface Props {
		activity: Activity;
		onsave?: (data: Partial<Activity>) => void;
	}

	let { activity, onsave }: Props = $props();
</script>

<!-- TODO: Activity name, type, config editor -->
<div class="activity-editor">
	<p>Editing: {activity.name}</p>
</div>
