<script lang="ts">
	let { data } = $props();
</script>

<!-- TODO: Plot settings (name, l2_target, proficiency, grid size, archive) -->
<!--
Stub outline:
- Form bound to plot fields.
- PATCH /plots/{plot_id} for updates.
- Archive toggle (soft-delete) via PATCH { archived: true }.
-->
<h1>Plot Settings</h1>
<p>{data.plot?.name ?? ''}</p>
