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
<!--
Stub outline:
- Render list/table of cards (front/back/state/due).
- Pagination: track page, pageSize; request /activities/{id}/cards?limit=...&status=...
- Inline edit opens CardEditor; onedit and ondelete callbacks.
- Provide filters for status and sort (due date, difficulty, created).
-->
<div class="activity-browser">
	<p>{cards.length} cards</p>
</div>
