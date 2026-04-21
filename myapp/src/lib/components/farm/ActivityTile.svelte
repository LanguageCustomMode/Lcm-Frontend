<script lang="ts">
	import { goto } from '$app/navigation';
	import type { Activity, FlowType } from '$lib/types';

	interface Props {
		activity: Activity;
		ripeness?: number;
		plotId?: string;
		onclick?: () => void;
	}

	let { activity, ripeness = 0, plotId, onclick }: Props = $props();

	const FLOW_ICONS: Record<FlowType, string> = {
		flashcard_review: '🃏',
		flashcard_audio: '🎤',
		audiocard_review: '🎧',
		mcq_review: '☑️',
		conversation: '💬',
		writing_chat: '✍️',
		reading_chat: '📖',
		tutor_chat: '🧑‍🏫'
	};

	const primaryFlow = $derived(activity.supported_flows?.[0]);

	const handleQuickJump = (event: MouseEvent) => {
		event.stopPropagation();
		if (!plotId || !primaryFlow) return;
		goto(`/dashboard/plots/${plotId}/activities/${activity.id}/flows/${primaryFlow}`);
	};

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
	<div class="title-row">
		<div class="title">{activity.name}</div>
		{#if plotId && primaryFlow}
			<button
				type="button"
				class="quick-jump"
				title={`Start ${primaryFlow.replace(/_/g, ' ')}`}
				onclick={handleQuickJump}
			>
				{FLOW_ICONS[primaryFlow] ?? '▶'}
			</button>
		{/if}
	</div>
	<div class="meta">
		<span class="badge">{formatType(activity.type)}</span>
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

	.title-row {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 0.4rem;
	}

	.title {
		font-weight: 600;
		font-size: 0.95rem;
		flex: 1;
		min-width: 0;
	}

	.quick-jump {
		background: rgba(255, 255, 255, 0.85);
		border: 1px solid var(--color-border);
		border-radius: 999px;
		width: 1.6rem;
		height: 1.6rem;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		font-size: 0.85rem;
		cursor: pointer;
		padding: 0;
		line-height: 1;
	}

	.quick-jump:hover {
		background: white;
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
