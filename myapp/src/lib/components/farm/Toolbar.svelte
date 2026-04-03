<script lang="ts">
	import type { ActivityType } from '$lib/types';

	interface Props {
		onselect?: (type: ActivityType) => void;
	}

	let { onselect }: Props = $props();
</script>

<!-- TODO: Activity type tool palette -->
<!--
Stub outline:
- Render ActivityType buttons from PLAN.md enum list.
- Maintain "selected tool" state (create vs extend).
- onselect(type) fires when a tool is clicked.
- Optional "extend" toggle when clicking existing activity tiles.
-->
<div class="toolbar">
	<p>Activity Toolbar</p>
</div>
