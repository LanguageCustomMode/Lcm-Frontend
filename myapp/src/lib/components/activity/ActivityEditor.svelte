<script lang="ts">
	import type { Activity } from '$lib/types';

	interface Props {
		activity: Activity;
		onsave?: (data: Partial<Activity>) => void;
	}

	let { activity, onsave }: Props = $props();

	let name = $state(activity.name);
	let type = $state(activity.type);
	let cardCap = $state((activity as any).card_cap ?? '');
	let config = $state(JSON.stringify(activity.config ?? {}, null, 2));

	const save = () => {
		let parsedConfig: Record<string, unknown> = {};
		try {
			parsedConfig = config ? JSON.parse(config) : {};
		} catch {
			parsedConfig = activity.config ?? {};
		}
		onsave?.({
			name,
			type,
			config: parsedConfig,
			...(cardCap !== '' ? { card_cap: Number(cardCap) } : {})
		} as Partial<Activity>);
	};

	const stats = (activity as any).stats;
</script>

<div class="activity-editor">
	<div class="header">
		<div>
			<h2>Edit Activity</h2>
			<p>Update the core details and configuration.</p>
		</div>
		<div class="actions">
			<button type="button" on:click={save}>Save Changes</button>
		</div>
	</div>

	<div class="form-grid">
		<label>
			Name
			<input bind:value={name} />
		</label>
		<label>
			Type
			<input bind:value={type} disabled />
		</label>
		<label>
			Card Cap
			<input bind:value={cardCap} type="number" min="0" placeholder="Unlimited" />
		</label>
	</div>

	<label class="config">
		Config (JSON)
		<textarea bind:value={config} rows="8"></textarea>
	</label>

	{#if stats}
		<div class="stats">
			<div>
				<strong>Level</strong>
				<span>{stats.level ?? activity.level}</span>
			</div>
			<div>
				<strong>XP</strong>
				<span>{stats.xp ?? activity.xp}</span>
			</div>
			<div>
				<strong>Ripeness</strong>
				<span>{Math.round((stats.ripeness ?? 0) * 100)}%</span>
			</div>
			<div>
				<strong>Streak</strong>
				<span>{stats.streak ?? 0}</span>
			</div>
		</div>
	{/if}
</div>

<style>
	.activity-editor {
		display: grid;
		gap: 1.25rem;
		background: white;
		border: 1px solid var(--color-border);
		border-radius: var(--radius);
		padding: 1.2rem;
	}

	.header {
		display: flex;
		justify-content: space-between;
		gap: 1rem;
		align-items: center;
	}

	.header h2 {
		font-size: 0.85rem;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		color: #4a7c59;
		margin: 0;
	}

	.header p {
		font-size: 0.8rem;
		color: #666;
		margin: 0.25rem 0 0;
	}

	.actions {
		display: flex;
		gap: 0.5rem;
	}

	.actions button {
		border: 1px solid var(--color-border);
		background: var(--color-primary);
		color: white;
		border-radius: 999px;
		padding: 0.4rem 0.9rem;
		cursor: pointer;
	}

	.form-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
		gap: 0.75rem;
	}

	label {
		display: grid;
		gap: 0.35rem;
		font-size: 0.8rem;
		color: #555;
	}

	input,
	textarea {
		border: 1px solid var(--color-border);
		border-radius: var(--radius);
		padding: 0.45rem 0.6rem;
		font-size: 0.9rem;
		font-family: inherit;
	}

	.config textarea {
		font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono',
			'Courier New', monospace;
	}

	.stats {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
		gap: 0.75rem;
	}

	.stats div {
		background: #f6f6f1;
		border-radius: var(--radius);
		padding: 0.5rem 0.6rem;
		display: grid;
		gap: 0.25rem;
	}

	.stats strong {
		font-size: 0.7rem;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		color: #666;
	}
</style>
