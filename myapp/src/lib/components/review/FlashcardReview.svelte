<script lang="ts">
	import type { Card } from '$lib/types';

	interface Props {
		card: Card;
		onrate?: (rating: 1 | 2 | 3 | 4) => void;
	}

	let { card, onrate }: Props = $props();
	let showAnswer = $state(false);
</script>

<!-- TODO: Card flip animation + rating buttons -->
<!--
Stub outline:
- Click/tap flips card (showAnswer = true).
- Rating buttons map to 1..4 (Again/Hard/Good/Easy).
- onrate(rating) emits for parent review session.
- Keyboard shortcuts: 1-4 for ratings, space to flip.
-->
<div class="flashcard">
	<div class="flashcard-front">{card.front}</div>
	{#if showAnswer}
		<div class="flashcard-back">{card.back}</div>
	{/if}
</div>
