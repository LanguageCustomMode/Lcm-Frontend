<script lang="ts">
	import type { Activity } from '$lib/types';

	interface Props {
		activity: Activity;
		onsave?: (data: Partial<Activity>) => void;
	}

	let { activity, onsave }: Props = $props();
</script>

<!-- TODO: Activity name, type, config editor -->
<!--
Stub outline:
- Editable fields: name, type, subtype, card_cap, config JSON.
- Save button calls onsave with partial updates.
- Optional "Generate more cards" action for LLM activities.
- Show stats summary (level, xp, ripeness, streak).
-->
<div class="activity-editor">
	<p>Editing: {activity.name}</p>
</div>
