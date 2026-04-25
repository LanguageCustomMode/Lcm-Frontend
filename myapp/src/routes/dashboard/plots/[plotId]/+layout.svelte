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
			href="/dashboard/plots/{data.plot?.id}/references"
			class:active={isActive(`/dashboard/plots/${data.plot?.id}/references`)}
		>
			References
		</a>
		<a
			href="/dashboard/plots/{data.plot?.id}/settings"
			class:active={isActive(`/dashboard/plots/${data.plot?.id}/settings`)}
		>
			Settings
		</a>
		<a href="/dashboard">Exit Plot</a>
	</div>
	<div class="plot-actions">
		<span>{data.plot?.activities?.length ?? data.plot?.activity_count ?? 0} activities</span>
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
		font-family: 'Nunito', 'Trebuchet MS', 'Segoe UI', sans-serif;
		font-weight: 700;
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
		color: #fff;
		padding: 0.3rem 0.6rem;
		border-radius: 999px;
		border: 1px solid #2f6a3f;
		font-size: 0.8rem;
		font-weight: 600;
		transition: background 0.15s ease, border-color 0.15s ease, box-shadow 0.15s ease;
	}

	.plot-links a {
		background: #3f8a52;
		border-color: #2f6a3f;
		box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.08);
	}

	.plot-links a:hover,
	.plot-links a.active {
		background: #347444;
		border-color: #275a35;
	}

	.plot-actions {
		display: flex;
		gap: 0.75rem;
		align-items: center;
		font-size: 0.8rem;
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
