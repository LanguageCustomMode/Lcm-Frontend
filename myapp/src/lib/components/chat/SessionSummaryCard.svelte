<script lang="ts">
	import type { SessionSummary } from '$lib/composables/useChatSession.svelte';

	let {
		summary,
		onrestart
	}: {
		summary: SessionSummary;
		onrestart: () => void;
	} = $props();
</script>

<div class="summary-card">
	<h2>Session Complete</h2>
	{#if summary.summary}
		<p class="summary-text">{summary.summary}</p>
	{/if}
	<div class="xp-badge">+{summary.xp_earned} XP</div>
	{#if summary.errors && summary.errors.length > 0}
		<h3>Errors reviewed</h3>
		<ul class="summary-errors">
			{#each summary.errors as err}
				<li>
					{#if err.original}<span class="orig">{err.original}</span>{/if}
					{#if err.correction}<span class="arrow">→</span><span class="fix">{err.correction}</span>{/if}
					{#if err.explanation}<p class="expl">{err.explanation}</p>{/if}
				</li>
			{/each}
		</ul>
	{/if}
	<button type="button" onclick={onrestart}>New Session</button>
</div>

<style>
	.summary-card {
		background: white;
		border: 1px solid var(--color-border);
		border-radius: var(--radius);
		padding: 1.5rem;
		display: grid;
		gap: 1rem;
		max-width: 600px;
	}

	.summary-text {
		color: #555;
		font-size: 0.9rem;
	}

	.xp-badge {
		font-size: 1.5rem;
		font-weight: 700;
		color: var(--color-accent);
	}

	.summary-errors {
		list-style: none;
		display: grid;
		gap: 0.75rem;
	}

	.summary-errors li {
		border-left: 3px solid var(--color-accent);
		padding-left: 0.6rem;
		font-size: 0.85rem;
		display: grid;
		gap: 0.2rem;
	}

	.orig {
		color: #b42318;
		text-decoration: line-through;
	}

	.arrow {
		color: #999;
	}

	.fix {
		color: #0f766e;
		font-weight: 600;
	}

	.expl {
		font-size: 0.75rem;
		color: #555;
		margin: 0;
	}

	button {
		border: 1px solid var(--color-border);
		background: var(--color-primary);
		color: white;
		border-radius: 999px;
		padding: 0.4rem 0.8rem;
		cursor: pointer;
		justify-self: start;
	}
</style>
