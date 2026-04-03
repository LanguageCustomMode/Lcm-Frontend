<script lang="ts">
	let { data } = $props();
</script>

<!-- TODO: Plot settings (name, l2_target, proficiency, grid size, archive) -->
<h1>Plot Settings</h1>
<p>{data.plot?.name ?? ''}</p>
