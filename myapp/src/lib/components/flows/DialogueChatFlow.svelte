<script lang="ts">
	import ConversationFlow from './ConversationFlow.svelte';
	import type { Activity } from '$lib/types';

	let { activity }: { activity: Activity } = $props();
</script>

<ConversationFlow {activity} />
