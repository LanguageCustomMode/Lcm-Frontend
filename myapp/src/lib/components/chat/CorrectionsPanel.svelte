<script lang="ts">
	import type { Correction } from '$lib/composables/useChatSession.svelte';

	let {
		corrections,
		sessionXp,
		xpPulse,
		onend
	}: {
		corrections: Correction[];
		sessionXp: number;
		xpPulse: number;
		onend: () => void;
	} = $props();
</script>

<div class="panel">
	<div class="xp-live">
		<span class="xp-total">{sessionXp} XP</span>
		{#if xpPulse > 0}
			<span class="xp-pulse">+{xpPulse}</span>
		{/if}
	</div>
	<h3>Corrections</h3>
	{#if corrections.length === 0}
		<p class="empty-note">No corrections yet.</p>
	{:else}
		<ul class="corrections-list">
			{#each corrections as item}
				<li class="correction-item">
					{#if item.original || item.correction}
						<div class="correction-pair">
							{#if item.original}<span class="orig">{item.original}</span>{/if}
							{#if item.correction}<span class="arrow">→</span><span class="fix">{item.correction}</span>{/if}
						</div>
						{#if item.explanation}<p class="expl">{item.explanation}</p>{/if}
						{#if item.error_type}<span class="tag">{item.error_type}</span>{/if}
					{:else}
						<code>{JSON.stringify(item)}</code>
					{/if}
				</li>
			{/each}
		</ul>
	{/if}
	<button type="button" onclick={onend}>End Session</button>
</div>

<style>
	.panel {
		background: white;
		border: 1px solid var(--color-border);
		border-radius: var(--radius);
		padding: 1rem;
		display: grid;
		gap: 0.75rem;
	}

	.empty-note {
		font-size: 0.8rem;
		color: #999;
	}

	.corrections-list {
		list-style: none;
		display: grid;
		gap: 0.75rem;
		font-size: 0.8rem;
	}

	.correction-item {
		border-left: 3px solid var(--color-accent);
		padding-left: 0.6rem;
		display: grid;
		gap: 0.25rem;
	}

	.correction-pair {
		display: flex;
		flex-wrap: wrap;
		gap: 0.4rem;
		align-items: center;
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

	.tag {
		font-size: 0.65rem;
		background: #f0f0ea;
		color: #555;
		border-radius: 999px;
		padding: 0.15rem 0.5rem;
		text-transform: uppercase;
		letter-spacing: 0.04em;
	}

	button {
		border: 1px solid var(--color-border);
		background: var(--color-primary);
		color: white;
		border-radius: 999px;
		padding: 0.4rem 0.8rem;
		cursor: pointer;
	}

	.xp-live {
		display: flex;
		align-items: baseline;
		gap: 0.5rem;
	}

	.xp-total {
		font-size: 1rem;
		font-weight: 700;
		color: var(--color-accent);
	}

	.xp-pulse {
		font-size: 0.85rem;
		font-weight: 700;
		color: #0f766e;
		animation: xp-pop 1.2s ease-out;
	}

	@keyframes xp-pop {
		0% { transform: translateY(0); opacity: 0; }
		20% { transform: translateY(-6px); opacity: 1; }
		100% { transform: translateY(-14px); opacity: 0; }
	}
</style>
