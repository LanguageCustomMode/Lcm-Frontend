<script lang="ts">
	import { page } from '$app/stores';

	let { children, data } = $props();

	const isActive = (path: string) => $page.url.pathname === path;
</script>

<nav class="plot-nav">
	<div class="plot-info">
		<h2>{data.plot?.name ?? 'Plot'}</h2>
		<span>{data.plot?.l2_target} • {data.plot?.proficiency}</span>
	</div>
	<div class="plot-links">
		<a href="/dashboard/plots/{data.plot?.id}" class:active={isActive(`/dashboard/plots/${data.plot?.id}`)}>
			Grid
		</a>
		<a
			href="/dashboard/plots/{data.plot?.id}/composition"
			class:active={isActive(`/dashboard/plots/${data.plot?.id}/composition`)}
		>
			Composition
		</a>
		<a
			href="/dashboard/plots/{data.plot?.id}/references"
			class:active={isActive(`/dashboard/plots/${data.plot?.id}/references`)}
		>
			References
		</a>
		<a
			href="/dashboard/plots/{data.plot?.id}/design"
			class:active={isActive(`/dashboard/plots/${data.plot?.id}/design`)}
		>
			Design
		</a>
		<a
			href="/dashboard/plots/{data.plot?.id}/settings"
			class:active={isActive(`/dashboard/plots/${data.plot?.id}/settings`)}
		>
			Settings
		</a>
	</div>
	<div class="plot-actions">
		<span>{data.plot?.activities?.length ?? data.plot?.activity_count ?? 0} activities</span>
		<a href="/dashboard/plots/{data.plot?.id}/design" class="primary">Create Activity</a>
	</div>
</nav>

{@render children()}

<style>
	.plot-nav {
		display: grid;
		grid-template-columns: 1fr auto auto;
		align-items: center;
		gap: 1.5rem;
		margin-bottom: 1.5rem;
		padding: 1rem;
		background: white;
		border: 1px solid var(--color-border);
		border-radius: var(--radius);
	}

	.plot-info h2 {
		margin-bottom: 0.25rem;
	}

	.plot-info span {
		font-size: 0.75rem;
		color: #666;
	}

	.plot-links {
		display: flex;
		gap: 0.5rem;
		flex-wrap: wrap;
	}

	.plot-links a {
		text-decoration: none;
		color: inherit;
		padding: 0.3rem 0.6rem;
		border-radius: 999px;
		border: 1px solid transparent;
		font-size: 0.8rem;
	}

	.plot-links a.active,
	.plot-links a:hover {
		border-color: var(--color-primary);
		color: var(--color-primary);
	}

	.plot-actions {
		display: flex;
		gap: 0.75rem;
		align-items: center;
		font-size: 0.8rem;
	}

	.plot-actions .primary {
		background: var(--color-primary);
		color: white;
		text-decoration: none;
		padding: 0.4rem 0.8rem;
		border-radius: 999px;
	}

	@media (max-width: 900px) {
		.plot-nav {
			grid-template-columns: 1fr;
			gap: 1rem;
		}
		.plot-actions {
			justify-content: space-between;
		}
	}
</style>
