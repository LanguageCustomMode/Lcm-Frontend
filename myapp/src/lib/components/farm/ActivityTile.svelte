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
<!--
Stub outline:
- Map ripeness (0..1) to background color (green -> yellow -> brown).
- Add activity.type/subtype badge.
- Show quick stats (due/new) on hover.
- Emit onclick for navigation to activity detail.
-->
<div class="activity-tile" role="button" tabindex="0" onclick={onclick} onkeydown={onclick}>
	<span>{activity.name}</span>
</div>
