<script lang="ts">
	import type { Activity } from '$lib/types';

	interface Props {
		activity: Activity;
		ripeness?: number;
		onclick?: () => void;
	}

	let { activity, ripeness = 0, onclick }: Props = $props();

	const formatType = (value?: string) => (value ? value.replace(/_/g, ' ') : '');
	const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));
	const backgroundForRipeness = (value: number) => {
		const clamped = clamp(value, 0, 1);
		const hue = 110 - clamped * 60;
		const sat = 45 + clamped * 15;
		const light = 75 - clamped * 20;
		return `hsl(${hue}, ${sat}%, ${light}%)`;
	};
	const handleKey = (event: KeyboardEvent) => {
		if (event.key === 'Enter' || event.key === ' ') {
			event.preventDefault();
			onclick?.();
		}
	};
</script>

<div
	class="activity-tile"
	role="button"
	tabindex="0"
	onclick={onclick}
	onkeydown={handleKey}
	style={`background: ${backgroundForRipeness(ripeness)}`}
>
	<div class="title">{activity.name}</div>
	<div class="meta">
		<span class="badge">{formatType(activity.type)}</span>
		{#if activity.subtype}
			<span class="badge subtle">{formatType(activity.subtype)}</span>
		{/if}
	</div>
	{#if (activity as any).stats}
		<div class="stats">
			<span>Due: {(activity as any).stats?.due_cards ?? 0}</span>
			<span>New: {(activity as any).stats?.new_cards ?? 0}</span>
		</div>
	{/if}
</div>

<style>
	.activity-tile {
		display: flex;
		flex-direction: column;
		justify-content: space-between;
		gap: 0.35rem;
		padding: 0.6rem 0.7rem;
		border-radius: var(--radius);
		border: 1px solid var(--color-border);
		min-height: 90px;
		box-shadow: 0 8px 16px rgba(0, 0, 0, 0.06);
		cursor: pointer;
		transition: transform 0.15s ease, box-shadow 0.15s ease;
	}

	.activity-tile:focus,
	.activity-tile:hover {
		transform: translateY(-2px);
		box-shadow: 0 12px 22px rgba(0, 0, 0, 0.12);
		outline: none;
	}

	.title {
		font-weight: 600;
		font-size: 0.95rem;
	}

	.meta {
		display: flex;
		gap: 0.35rem;
		flex-wrap: wrap;
	}

	.badge {
		background: rgba(255, 255, 255, 0.7);
		padding: 0.15rem 0.45rem;
		border-radius: 999px;
		font-size: 0.65rem;
		text-transform: uppercase;
		letter-spacing: 0.04em;
	}

	.badge.subtle {
		background: rgba(255, 255, 255, 0.45);
	}

	.stats {
		display: flex;
		justify-content: space-between;
		font-size: 0.7rem;
		color: rgba(0, 0, 0, 0.7);
	}
</style>
