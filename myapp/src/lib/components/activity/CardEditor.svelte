<script lang="ts">
	import type { CardContent } from '$lib/types';

	interface Props {
		card?: CardContent;
		onsave?: (data: { front: string; back: string }) => void;
		oncancel?: () => void;
	}

	let { card, onsave, oncancel }: Props = $props();
	let front = $state(card?.front ?? '');
	let back = $state(card?.back ?? '');
</script>

<form onsubmit={(e) => { e.preventDefault(); onsave?.({ front, back }); }}>
	<input bind:value={front} placeholder="Front" />
	<input bind:value={back} placeholder="Back" />
	<button type="submit">Save</button>
	<button type="button" onclick={oncancel}>Cancel</button>
</form>
