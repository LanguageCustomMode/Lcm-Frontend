<script lang="ts">
	import TtsPlayButton from './TtsPlayButton.svelte';
	import type { ContentItem } from '$lib/types';
	import { onMount } from 'svelte';

	interface Props {
		item: ContentItem;
		onrate?: (rating: 1 | 2 | 3 | 4) => void;
	}

	let { item, onrate }: Props = $props();
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

	const content = $derived(item.content as unknown as Record<string, unknown>);
	const audioText = $derived(String(content.audio_text ?? ''));
	const front = $derived(String(content.front ?? ''));
	const back = $derived(String(content.back ?? ''));
	const instruction = $derived(content.instruction ? String(content.instruction) : null);
</script>

<div class="listening">
	<div class="card">
		{#if instruction}
			<p class="instruction">{instruction}</p>
		{/if}
		<p class="prompt">{front}</p>
		{#if audioText}
			<TtsPlayButton text={audioText} label="Play audio" />
		{/if}
		{#if showAnswer}
			<div class="answer">
				<p class="answer-label">Answer</p>
				<p>{back}</p>
				{#if audioText && audioText !== back}
					<p class="transcript">Transcript: <em>{audioText}</em></p>
				{/if}
			</div>
		{/if}
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
	.listening {
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
	.transcript {
		font-size: 0.85rem;
		color: #555;
		margin-top: 0.5rem;
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
