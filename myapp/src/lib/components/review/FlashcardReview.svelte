<script lang="ts">
	import type { Card } from '$lib/types';
	import { onMount } from 'svelte';

	interface Props {
		card: Card;
		onrate?: (rating: 1 | 2 | 3 | 4) => void;
	}

	let { card, onrate }: Props = $props();
	let showAnswer = $state(false);

	const rate = (value: 1 | 2 | 3 | 4) => {
		onrate?.(value);
		showAnswer = false;
	};

	const toggle = () => {
		showAnswer = !showAnswer;
	};

	onMount(() => {
		const handler = (event: KeyboardEvent) => {
			if (event.key === ' ') {
				event.preventDefault();
				toggle();
			}
			if (event.key === '1') rate(1);
			if (event.key === '2') rate(2);
			if (event.key === '3') rate(3);
			if (event.key === '4') rate(4);
		};
		window.addEventListener('keydown', handler);
		return () => window.removeEventListener('keydown', handler);
	});
</script>

<div class="flashcard">
	<div class="card-face" class:flipped={showAnswer} on:click={toggle}>
		<div class="front">
			<p>{card.front}</p>
			<span class="hint">Tap or press space to reveal</span>
		</div>
		<div class="back">
			<p>{card.back}</p>
		</div>
	</div>
	<div class="actions">
		{#if !showAnswer}
			<button type="button" on:click={toggle}>Show Answer</button>
		{:else}
			<button type="button" on:click={() => rate(1)}>Again (1)</button>
			<button type="button" on:click={() => rate(2)}>Hard (2)</button>
			<button type="button" on:click={() => rate(3)}>Good (3)</button>
			<button type="button" on:click={() => rate(4)}>Easy (4)</button>
		{/if}
	</div>
</div>

<style>
	.flashcard {
		display: grid;
		gap: 1rem;
		justify-items: center;
	}

	.card-face {
		position: relative;
		width: min(520px, 90vw);
		min-height: 220px;
		border-radius: 18px;
		background: white;
		border: 1px solid var(--color-border);
		box-shadow: 0 20px 40px rgba(0, 0, 0, 0.12);
		transform-style: preserve-3d;
		transition: transform 0.4s ease;
		cursor: pointer;
		padding: 1.5rem;
	}

	.card-face.flipped {
		transform: rotateY(180deg);
	}

	.front,
	.back {
		position: absolute;
		inset: 0;
		padding: 1.5rem;
		backface-visibility: hidden;
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		text-align: center;
		gap: 0.75rem;
	}

	.back {
		transform: rotateY(180deg);
	}

	.hint {
		font-size: 0.75rem;
		color: #666;
	}

	.actions {
		display: flex;
		gap: 0.5rem;
		flex-wrap: wrap;
		justify-content: center;
	}

	.actions button {
		border: 1px solid var(--color-border);
		background: white;
		border-radius: 999px;
		padding: 0.4rem 0.9rem;
		cursor: pointer;
	}

	.actions button:hover {
		border-color: var(--color-primary);
		color: var(--color-primary);
	}
</style>
