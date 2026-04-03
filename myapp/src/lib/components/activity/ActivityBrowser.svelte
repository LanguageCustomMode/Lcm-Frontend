<script lang="ts">
	import type { Card } from '$lib/types';

	interface Props {
		cards: Card[];
		onedit?: (card: Card) => void;
		ondelete?: (cardId: string) => void;
	}

	let { cards, onedit, ondelete }: Props = $props();
</script>

<!-- TODO: Paginated card list with inline editing -->
<div class="activity-browser">
	<p>{cards.length} cards</p>
</div>
