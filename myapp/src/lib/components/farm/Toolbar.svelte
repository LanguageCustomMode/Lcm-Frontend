<script lang="ts">
	import type { ActivityType } from '$lib/types';

	interface Props {
		onselect?: (type: ActivityType) => void;
	}

	let { onselect }: Props = $props();
</script>

<!-- TODO: Activity type tool palette -->
<div class="toolbar">
	<p>Activity Toolbar</p>
</div>
