<script lang="ts">
	interface Props {
		current: number;
		total: number;
	}

	let { current, total }: Props = $props();
</script>

<div class="review-progress">
	<span>{current} / {total}</span>
	<progress value={current} max={total}></progress>
</div>
