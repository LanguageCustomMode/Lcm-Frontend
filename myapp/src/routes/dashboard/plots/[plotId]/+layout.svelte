<script lang="ts">
	let { children, data } = $props();
</script>

<!-- TODO: Plot-level navigation (grid, settings, composition, references, design) -->
<!--
Stub outline:
- Highlight active tab.
- Show quick stats (due cards, ripeness) from plot data.
- Add "Create Activity" shortcut.
-->
<nav class="plot-nav">
	<a href="/dashboard/plots/{data.plot.id}">Grid</a>
	<a href="/dashboard/plots/{data.plot.id}/composition">Composition</a>
	<a href="/dashboard/plots/{data.plot.id}/references">References</a>
	<a href="/dashboard/plots/{data.plot.id}/design">Design</a>
	<a href="/dashboard/plots/{data.plot.id}/settings">Settings</a>
</nav>

{@render children()}
