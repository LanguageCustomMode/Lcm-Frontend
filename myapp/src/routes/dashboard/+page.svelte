<script lang="ts">
	let { data } = $props();
</script>

<h1>Dashboard</h1>

{#if data.plots.length === 0}
	<div class="empty-state">
		<p>You don't have any plots yet.</p>
		<a href="/dashboard/plots/new">Create Your First Plot</a>
	</div>
{:else}
	<div class="plot-list">
		{#each data.plots as plot}
			<a href="/dashboard/plots/{plot.id}" class="plot-card">
				<h3>{plot.name}</h3>
				<p>{plot.l2_target} - {plot.proficiency}</p>
				<span>{plot.activity_count} activities</span>
			</a>
		{/each}
		<a href="/dashboard/plots/new" class="plot-card new-plot">+ New Plot</a>
	</div>
{/if}
