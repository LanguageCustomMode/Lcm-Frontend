<script lang="ts">
	import type { Activity } from '$lib/types';

	interface Props {
		activity: Activity;
		ripeness?: number;
		onclick?: () => void;
	}

	let { activity, ripeness = 0, onclick }: Props = $props();
</script>

<!-- TODO: Show name + ripeness color gradient -->
<div class="activity-tile" role="button" tabindex="0" onclick={onclick} onkeydown={onclick}>
	<span>{activity.name}</span>
</div>
