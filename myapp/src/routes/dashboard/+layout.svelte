<script lang="ts">
	import type { Snippet } from 'svelte';
	import { createClient } from '$lib/supabase';
	import { goto } from '$app/navigation';

	let { children, data } = $props();
	let signingOut = $state(false);

	const logout = async () => {
		signingOut = true;
		const supabase = createClient();
		await supabase.auth.signOut();
		await goto('/auth/login');
	};
</script>

<div class="dashboard-layout">
	<aside class="sidebar">
		<div class="brand">
			<h2>LanguageFarm</h2>
			<span>Grow your language skills</span>
		</div>
		<div class="profile">
			{#if data.profile}
				<div class="avatar">{data.profile.username?.slice(0, 1)?.toUpperCase()}</div>
				<div class="profile-info">
					<p class="name">{data.profile.username}</p>
					<p class="meta">Lv.{data.profile.level} · {data.profile.xp} XP</p>
					{#if data.gamification}
						<p class="meta coin-meta">{data.gamification.coins} ◈</p>
					{/if}
				</div>
			{:else}
				<p class="meta">Loading profile...</p>
			{/if}
		</div>
		<nav>
			<a href="/dashboard">Dashboard</a>
			<a href="/dashboard/settings">Settings</a>
		</nav>
		<div class="plots">
			<div class="plot-header">
				<span>Plots</span>
				<a href="/dashboard/plots/new">+ New</a>
			</div>
			{#if data.plots?.length}
				{#each data.plots as plot}
					<a href="/dashboard/plots/{plot.id}" class="plot-link">{plot.name}</a>
				{/each}
			{:else}
				<p class="meta">No plots yet.</p>
			{/if}
		</div>
		<button type="button" class="logout" on:click={logout} disabled={signingOut}>
			{signingOut ? 'Signing out...' : 'Log out'}
		</button>
	</aside>
	<main class="dashboard-content">
		{@render children()}
	</main>
</div>

<style>
	.dashboard-layout {
		display: grid;
		grid-template-columns: 260px 1fr;
		min-height: 100vh;
	}

	.sidebar {
		background: #f3f3ef;
		padding: 1.5rem;
		display: grid;
		gap: 1.5rem;
		border-right: 1px solid var(--color-border);
	}

	.brand h2 {
		margin-bottom: 0.25rem;
	}

	.brand span {
		font-size: 0.75rem;
		color: #666;
	}

	.profile {
		display: flex;
		gap: 0.75rem;
		align-items: center;
		background: white;
		border: 1px solid var(--color-border);
		border-radius: var(--radius);
		padding: 0.75rem;
	}

	.avatar {
		width: 42px;
		height: 42px;
		border-radius: 50%;
		background: var(--color-primary);
		color: white;
		display: flex;
		align-items: center;
		justify-content: center;
		font-weight: 600;
	}

	.name {
		font-weight: 600;
	}

	.profile-info {
		display: grid;
		gap: 0.1rem;
	}

	.meta {
		font-size: 0.7rem;
		color: #666;
	}

	.coin-meta {
		color: var(--color-accent);
		font-weight: 600;
	}

	nav {
		display: grid;
		gap: 0.5rem;
	}

	nav a {
		text-decoration: none;
		color: inherit;
		padding: 0.4rem 0.6rem;
		border-radius: var(--radius);
	}

	nav a:hover {
		background: white;
	}

	.plots {
		display: grid;
		gap: 0.5rem;
	}

	.plot-header {
		display: flex;
		justify-content: space-between;
		font-size: 0.75rem;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		color: #666;
	}

	.plot-link {
		text-decoration: none;
		color: inherit;
		padding: 0.35rem 0.5rem;
		border-radius: var(--radius);
		background: white;
		border: 1px solid var(--color-border);
		font-size: 0.85rem;
	}

	.logout {
		border: 1px solid var(--color-border);
		background: white;
		border-radius: var(--radius);
		padding: 0.5rem;
		cursor: pointer;
	}

	.dashboard-content {
		padding: 2rem;
	}

	@media (max-width: 900px) {
		.dashboard-layout {
			grid-template-columns: 1fr;
		}
		.sidebar {
			border-right: none;
			border-bottom: 1px solid var(--color-border);
		}
	}
</style>
