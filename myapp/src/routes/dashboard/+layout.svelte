<script lang="ts">
	import type { Snippet } from 'svelte';

	let { children, data } = $props();
</script>

<!-- TODO: Sidebar with plot list, user info, navigation -->
<!--
Stub outline:
- Show profile (username, level, xp) from load data.
- Render plot list for quick switching.
- Add "New Plot" action and logout button.
-->
<div class="dashboard-layout">
	<aside class="sidebar">
		<h2>LanguageFarm</h2>
		<nav>
			<a href="/dashboard">Dashboard</a>
			<a href="/dashboard/settings">Settings</a>
		</nav>
	</aside>
	<main class="dashboard-content">
		{@render children()}
	</main>
</div>
