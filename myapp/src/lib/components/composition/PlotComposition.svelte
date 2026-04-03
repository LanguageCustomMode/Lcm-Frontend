<script lang="ts">
	import type { PlotComposition } from '$lib/types';

	interface Props {
		composition: PlotComposition;
	}

	let { composition }: Props = $props();

	const entriesFrom = (record: Record<string, number>) =>
		Object.entries(record).sort((a, b) => b[1] - a[1]);

	const total = $derived(() => Math.max(1, composition.total_cards || 1));
</script>

<div class="plot-composition">
	<div class="summary">
		<div>
			<h3>{composition.total_cards}</h3>
			<span>Total cards</span>
		</div>
		<div>
			<h3>{composition.due_cards}</h3>
			<span>Due cards</span>
		</div>
	</div>

	<div class="section">
		<h4>By Tier</h4>
		{#if entriesFrom(composition.by_tier).length === 0}
			<p class="empty">No tier data yet.</p>
		{:else}
			{#each entriesFrom(composition.by_tier) as [label, value]}
				<div class="bar-row">
					<span>{label}</span>
					<div class="bar">
						<div class="fill" style={`width: ${(value / total) * 100}%`}></div>
					</div>
					<span class="value">{value}</span>
				</div>
			{/each}
		{/if}
	</div>

	<div class="section">
		<h4>By Modality</h4>
		{#if entriesFrom(composition.by_modality).length === 0}
			<p class="empty">No modality data yet.</p>
		{:else}
			{#each entriesFrom(composition.by_modality) as [label, value]}
				<div class="bar-row">
					<span>{label}</span>
					<div class="bar">
						<div class="fill accent" style={`width: ${(value / total) * 100}%`}></div>
					</div>
					<span class="value">{value}</span>
				</div>
			{/each}
		{/if}
	</div>
</div>

<style>
	.plot-composition {
		display: grid;
		gap: 1.5rem;
	}

	.summary {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
		gap: 1rem;
	}

	.summary div {
		background: white;
		border: 1px solid var(--color-border);
		border-radius: var(--radius);
		padding: 0.9rem;
	}

	.summary h3 {
		font-size: 1.6rem;
	}

	.summary span {
		font-size: 0.75rem;
		color: #666;
		text-transform: uppercase;
		letter-spacing: 0.04em;
	}

	.section {
		background: white;
		border: 1px solid var(--color-border);
		border-radius: var(--radius);
		padding: 1rem;
		display: grid;
		gap: 0.65rem;
	}

	.section h4 {
		font-size: 0.9rem;
	}

	.bar-row {
		display: grid;
		grid-template-columns: 120px 1fr 40px;
		gap: 0.75rem;
		align-items: center;
		font-size: 0.8rem;
	}

	.bar {
		background: #f0f0ea;
		border-radius: 999px;
		height: 8px;
		overflow: hidden;
	}

	.fill {
		height: 100%;
		background: var(--color-primary);
	}

	.fill.accent {
		background: var(--color-accent);
	}

	.value {
		text-align: right;
		font-weight: 600;
	}

	.empty {
		font-size: 0.8rem;
		color: #666;
	}
</style>
