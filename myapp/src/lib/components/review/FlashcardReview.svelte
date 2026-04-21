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
			if (event.key === ' ' && item.content_type !== 'mcq' && item.content_type !== 'wildcard') {
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
	const front = $derived(String(content.front ?? ''));
	const back = $derived(String(content.back ?? ''));
	const instruction = $derived(content.instruction ? String(content.instruction) : null);
	const question = $derived(String(content.question ?? ''));
	const sentence = $derived(String(content.sentence ?? ''));
	const wildcardText = $derived(String(content.text ?? ''));
	const correctIndex = $derived(
		typeof content.correct_index === 'number' ? content.correct_index : Number(content.correct_index)
	);
</script>

<div class="flashcard">
	{#if item.content_type === 'mcq'}
		<div class="card">
			<p class="prompt">{question}</p>
			{#if Array.isArray(content.answers)}
				<div class="answers">
					{#each content.answers as answer, i}
						<button
							type="button"
							class="answer-btn"
							class:selected={selectedMcq === i}
							class:correct={showAnswer && i === correctIndex}
							class:wrong={showAnswer && selectedMcq === i && i !== correctIndex}
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
		<div class="card">
			<p class="prompt">{sentence}</p>
			{#if showAnswer}
				<div class="answer">
					<p class="answer-label">Answer</p>
					<p>{back || sentence}</p>
				</div>
			{/if}
		</div>
	{:else if item.content_type === 'wildcard'}
		<div class="card">
			<p class="wildcard-label">Wild Card</p>
			<p class="prompt">{wildcardText}</p>
		</div>
	{:else}
		<div class="card">
			{#if instruction}
				<p class="instruction">{instruction}</p>
			{/if}
			<p class="prompt">{front}</p>
			{#if showAnswer}
				<div class="answer">
					<p class="answer-label">Answer</p>
					<p>{back}</p>
				</div>
			{/if}
		</div>
		{#if item.content_type === 'audio_card' && content.audio_url}
			<audio controls src={String(content.audio_url)}></audio>
		{/if}
	{/if}

	<div class="actions">
		{#if item.content_type === 'mcq' && !showAnswer}
		{:else if !showAnswer && item.content_type !== 'wildcard'}
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

	.card {
		width: min(520px, 90vw);
		min-height: 220px;
		background: white;
		border: 1px solid var(--color-border);
		border-radius: 18px;
		box-shadow: 0 20px 40px rgba(0, 0, 0, 0.12);
		padding: 1.5rem;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 1rem;
		text-align: center;
	}

	.instruction {
		font-size: 0.8rem;
		color: #888;
		font-style: italic;
		margin: 0;
	}

	.prompt {
		font-size: 1.1rem;
		margin: 0;
	}

	.answer {
		border-top: 1px solid var(--color-border);
		padding-top: 0.75rem;
		width: 100%;
	}

	.answer-label {
		font-size: 0.75rem;
		font-weight: 600;
		color: var(--color-primary);
		text-transform: uppercase;
		margin: 0 0 0.25rem 0;
	}

	.wildcard-label {
		font-size: 0.75rem;
		font-weight: 600;
		color: var(--color-primary);
		text-transform: uppercase;
		margin: 0;
	}

	.answers {
		display: grid;
		gap: 0.5rem;
		width: 100%;
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
