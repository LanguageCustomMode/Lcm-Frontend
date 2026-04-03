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
<div class="flashcard">
	<div class="flashcard-front">{card.front}</div>
	{#if showAnswer}
		<div class="flashcard-back">{card.back}</div>
	{/if}
</div>
