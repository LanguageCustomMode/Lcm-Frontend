<script lang="ts">
	import type { ContentItem } from '$lib/types';
	import { onMount } from 'svelte';

	interface Props {
		item: ContentItem;
		onrate?: (rating: 1 | 2 | 3 | 4) => void;
	}

	let { item, onrate }: Props = $props();
	let showAnswer = $state(false);
	let selectedMcq = $state<number | null>(null);

	const rate = (value: 1 | 2 | 3 | 4) => {
		onrate?.(value);
		showAnswer = false;
		selectedMcq = null;
	};

	const toggle = () => {
		showAnswer = !showAnswer;
	};

	const selectMcqAnswer = (index: number) => {
		selectedMcq = index;
		showAnswer = true;
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

	const content = $derived(item.content as unknown as Record<string, unknown>);
</script>

<div class="flashcard">
	{#if item.content_type === 'mcq'}
		<div class="mcq-card">
			<p class="question">{content.question}</p>
			{#if content.answers && Array.isArray(content.answers)}
				<div class="answers">
					{#each content.answers as answer, i}
						<button
							type="button"
							class="answer-btn"
							class:selected={selectedMcq === i}
							class:correct={showAnswer && i === content.correct_index}
							class:wrong={showAnswer && selectedMcq === i && i !== content.correct_index}
							on:click={() => selectMcqAnswer(i)}
							disabled={showAnswer}
						>
							{answer}
						</button>
					{/each}
				</div>
			{/if}
		</div>
	{:else if item.content_type === 'sentence'}
		<div class="card-face" class:flipped={showAnswer} on:click={toggle}>
			<div class="front">
				<p>{content.sentence}</p>
				<span class="hint">Tap or press space to reveal</span>
			</div>
			<div class="back">
				<p>{content.sentence}</p>
			</div>
		</div>
	{:else if item.content_type === 'wildcard'}
		<div class="card-face">
			<div class="front">
				<p class="wildcard-label">Wild Card</p>
				<p>{content.text}</p>
			</div>
		</div>
	{:else}
		<!-- card, error, audio_card: all have front/back -->
		<div class="card-face" class:flipped={showAnswer} on:click={toggle}>
			<div class="front">
				{#if content.instruction}
					<p class="instruction">{content.instruction}</p>
				{/if}
				<p>{content.front}</p>
				<span class="hint">Tap or press space to reveal</span>
			</div>
			<div class="back">
				<p>{content.back}</p>
			</div>
		</div>
		{#if item.content_type === 'audio_card' && content.audio_url}
			<audio controls src={String(content.audio_url)}></audio>
		{/if}
	{/if}

	<div class="actions">
		{#if !showAnswer && item.content_type !== 'wildcard'}
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

	.instruction {
		font-size: 0.8rem;
		color: #888;
		font-style: italic;
	}

	.wildcard-label {
		font-size: 0.75rem;
		font-weight: 600;
		color: var(--color-primary);
		text-transform: uppercase;
	}

	.mcq-card {
		width: min(520px, 90vw);
		background: white;
		border: 1px solid var(--color-border);
		border-radius: 18px;
		box-shadow: 0 20px 40px rgba(0, 0, 0, 0.12);
		padding: 1.5rem;
	}

	.question {
		font-size: 1.1rem;
		margin-bottom: 1rem;
		text-align: center;
	}

	.answers {
		display: grid;
		gap: 0.5rem;
	}

	.answer-btn {
		border: 1px solid var(--color-border);
		background: white;
		border-radius: 12px;
		padding: 0.6rem 1rem;
		cursor: pointer;
		text-align: left;
		font-size: 0.9rem;
	}

	.answer-btn:hover:not(:disabled) {
		border-color: var(--color-primary);
	}

	.answer-btn.selected {
		border-color: var(--color-primary);
		background: #f0f7ff;
	}

	.answer-btn.correct {
		border-color: #22c55e;
		background: #f0fdf4;
	}

	.answer-btn.wrong {
		border-color: #ef4444;
		background: #fef2f2;
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
