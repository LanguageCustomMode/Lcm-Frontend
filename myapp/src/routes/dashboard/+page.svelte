<script lang="ts">
	import { onMount } from 'svelte';

	let { data } = $props();

	interface Insight {
		type: string;
		message: string;
		[key: string]: unknown;
	}

	let insights = $state<Insight[]>([]);

	const loadInsights = async () => {
		try {
			const res = await fetch('/api/users/me/learning-insights');
			if (res.ok) insights = await res.json();
		} catch { /* non-critical */ }
	};

	const xpProgress = $derived(() => {
		const g = data.gamification;
		if (!g) return 0;
		// Use explicit progress field if provided, otherwise derive from xp
		if (typeof g.progress_percent === 'number') return Math.min(100, Math.round(g.progress_percent));
		if (typeof g.xp_to_next_level === 'number' && g.xp_to_next_level > 0) {
			const earned = g.xp_current_level ?? (g.xp % 100);
			return Math.min(100, Math.round((earned / g.xp_to_next_level) * 100));
		}
		// Simple heuristic: 100 XP per level
		const base = g.level * 100;
		const next = (g.level + 1) * 100;
		const span = next - base;
		return span > 0 ? Math.min(100, Math.round(((g.xp - base) / span) * 100)) : 0;
	});

	const nextLevelXp = $derived(() => {
		const g = data.gamification;
		if (!g) return 0;
		return g.xp_to_next_level ?? (g.level + 1) * 100;
	});

	const isArchivedPlot = (plot: Record<string, unknown>) => {
		const archived = plot.archived;
		const isArchived = plot.is_archived;
		if (typeof archived === 'boolean') return archived;
		if (typeof archived === 'string') return archived.toLowerCase() === 'true';
		if (typeof archived === 'number') return archived === 1;
		if (typeof isArchived === 'boolean') return isArchived;
		if (typeof isArchived === 'string') return isArchived.toLowerCase() === 'true';
		if (typeof isArchived === 'number') return isArchived === 1;
		return false;
	};

	const activePlots = $derived(() => (data.plots ?? []).filter((plot) => !isArchivedPlot(plot)));
	const archivedPlots = $derived(() => (data.plots ?? []).filter((plot) => isArchivedPlot(plot)));

	onMount(loadInsights);
</script>

<div class="dashboard">
	<div class="page-header">
		<h1>Dashboard</h1>
		<a href="/dashboard/plots/new" class="btn-primary">+ New Plot</a>
	</div>

	<!-- Gamification strip -->
	{#if data.gamification}
		{@const g = data.gamification}
		<div class="gami-strip">
			<div class="gami-card">
				<span class="gami-label">Level</span>
				<span class="gami-value">{g.level}</span>
			</div>
			<div class="gami-card xp-card">
				<div class="xp-header">
					<span class="gami-label">XP</span>
					<span class="gami-small">{g.xp} / {nextLevelXp()}</span>
				</div>
				<div class="xp-bar-wrap">
					<div class="xp-bar" style="width: {xpProgress()}%"></div>
				</div>
			</div>
			<div class="gami-card">
				<span class="gami-label">Coins</span>
				<span class="gami-value coin">{g.coins} ◈</span>
			</div>
		</div>
	{/if}

	<!-- Learning insights -->
	{#if insights.length > 0}
		<div class="insights-panel">
			<h2>Learning Insights</h2>
			<ul class="insights-list">
				{#each insights as insight}
					<li class="insight-item insight-{insight.type}">
						<p>{insight.message}</p>
					</li>
				{/each}
			</ul>
		</div>
	{/if}

	<!-- Plots grid -->
	<h2>Your Plots</h2>
	{#if activePlots().length === 0}
		<div class="empty-state">
			<p>You don't have any plots yet. Create one to get started.</p>
			<a href="/dashboard/plots/new" class="btn-primary">Create Your First Plot</a>
		</div>
	{:else}
		<div class="plot-grid">
			{#each activePlots() as plot}
				<a href="/dashboard/plots/{plot.id}" class="plot-card">
					<div class="plot-card-inner">
						<h3>{plot.name}</h3>
						<p class="plot-meta">{plot.l2_target}{plot.proficiency ? ' · ' + plot.proficiency : ''}</p>
						<span class="plot-count">{plot.activity_count ?? 0} activities</span>
					</div>
				</a>
			{/each}
			<a href="/dashboard/plots/new" class="plot-card new-plot">
				<span>+ New Plot</span>
			</a>
		</div>
	{/if}

	<h2>Your Archived Plots</h2>
	{#if archivedPlots().length === 0}
		<div class="empty-state">
			<p>You don't have any archived plots yet.</p>
		</div>
	{:else}
		<div class="plot-grid">
			{#each archivedPlots() as plot}
				<a href="/dashboard/plots/{plot.id}" class="plot-card">
					<div class="plot-card-inner">
						<h3>{plot.name}</h3>
						<p class="plot-meta">{plot.l2_target}{plot.proficiency ? ' · ' + plot.proficiency : ''}</p>
						<span class="plot-count">{plot.activity_count ?? 0} activities</span>
					</div>
				</a>
			{/each}
		</div>
	{/if}
</div>

<style>
	.dashboard {
		display: grid;
		gap: 1.75rem;
	}

	.page-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
	}

	.btn-primary {
		background: var(--color-primary);
		color: white;
		border: none;
		border-radius: 999px;
		padding: 0.45rem 1rem;
		font-size: 0.85rem;
		text-decoration: none;
		cursor: pointer;
	}

	/* Gamification */
	.gami-strip {
		display: grid;
		grid-template-columns: auto 1fr auto;
		gap: 0.75rem;
		align-items: center;
	}

	.gami-card {
		background: white;
		border: 1px solid var(--color-border);
		border-radius: var(--radius);
		padding: 0.75rem 1rem;
		display: grid;
		gap: 0.25rem;
	}

	.xp-card {
		display: grid;
		gap: 0.4rem;
	}

	.xp-header {
		display: flex;
		justify-content: space-between;
		align-items: baseline;
	}

	.gami-label {
		font-size: 0.65rem;
		text-transform: uppercase;
		letter-spacing: 0.06em;
		color: #888;
	}

	.gami-small {
		font-size: 0.7rem;
		color: #888;
	}

	.gami-value {
		font-size: 1.4rem;
		font-weight: 700;
		color: var(--color-text);
	}

	.coin {
		color: var(--color-accent);
	}

	.xp-bar-wrap {
		height: 6px;
		background: #eee;
		border-radius: 999px;
		overflow: hidden;
	}

	.xp-bar {
		height: 100%;
		background: var(--color-primary);
		border-radius: 999px;
		transition: width 0.4s ease;
		min-width: 4px;
	}

	/* Insights */
	.insights-panel {
		background: white;
		border: 1px solid var(--color-border);
		border-radius: var(--radius);
		padding: 1rem;
		display: grid;
		gap: 0.75rem;
	}

	.insights-panel h2 {
		font-size: 0.9rem;
		font-weight: 600;
	}

	.insights-list {
		list-style: none;
		display: grid;
		gap: 0.5rem;
	}

	.insight-item {
		font-size: 0.85rem;
		color: #444;
		padding: 0.5rem 0.75rem;
		border-radius: var(--radius);
		background: #f6f6f1;
		border-left: 3px solid var(--color-primary);
	}

	.insight-item p { margin: 0; }

	/* Plots */
	h2 {
		font-size: 1rem;
		font-weight: 600;
		color: #333;
	}

	.empty-state {
		display: grid;
		gap: 0.75rem;
		justify-items: start;
		background: white;
		border: 1px solid var(--color-border);
		border-radius: var(--radius);
		padding: 1.5rem;
		color: #555;
	}

	.plot-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
		gap: 0.75rem;
	}

	.plot-card {
		text-decoration: none;
		color: inherit;
		background: white;
		border: 1px solid var(--color-border);
		border-radius: var(--radius);
		transition: border-color 0.15s, box-shadow 0.15s;
	}

	.plot-card:hover {
		border-color: var(--color-primary);
		box-shadow: 0 2px 8px rgba(74, 124, 89, 0.12);
	}

	.plot-card-inner {
		padding: 1rem;
		display: grid;
		gap: 0.35rem;
	}

	.plot-card h3 {
		font-size: 0.95rem;
		font-weight: 600;
	}

	.plot-meta {
		font-size: 0.75rem;
		color: #888;
	}

	.plot-count {
		font-size: 0.75rem;
		color: #aaa;
		margin-top: 0.25rem;
	}

	.new-plot {
		display: flex;
		align-items: center;
		justify-content: center;
		min-height: 90px;
		border-style: dashed;
		color: #aaa;
		font-size: 0.9rem;
	}

	.new-plot:hover {
		color: var(--color-primary);
	}

	@media (max-width: 640px) {
		.gami-strip {
			grid-template-columns: 1fr 1fr;
		}
		.xp-card {
			grid-column: 1 / -1;
		}
	}
</style>
