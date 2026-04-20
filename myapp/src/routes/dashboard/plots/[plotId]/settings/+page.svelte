<script lang="ts">
	import Select from '$lib/components/ui/Select.svelte';

	let { data } = $props();

	let name = $state(data.plot?.name ?? '');
	let description = $state(data.plot?.description ?? '');
	let l2Target = $state(data.plot?.l2_target ?? '');
	let proficiency = $state(data.plot?.proficiency ?? 'A1');
	let gridRows = $state(data.plot?.grid_rows ?? 3);
	let gridCols = $state(data.plot?.grid_cols ?? 4);
	let archived = $state(data.plot?.archived ?? false);

	let saving = $state(false);
	let message = $state<string | null>(null);
	let error = $state<string | null>(null);

	const save = async () => {
		if (!data.plot) return;
		saving = true;
		message = null;
		error = null;
		try {
			const res = await fetch(`/api/plots/${data.plot.id}`, {
				method: 'PATCH',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					name,
					description,
					l2_target: l2Target,
					proficiency,
					grid_rows: Number(gridRows),
					grid_cols: Number(gridCols),
					archived
				})
			});
			if (!res.ok) throw new Error(await res.text());
			message = 'Plot updated.';
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to update plot';
		} finally {
			saving = false;
		}
	};
</script>

<h1>Plot Settings</h1>
{#if data.plot}
	<div class="settings-form">
		<label>
			Name
			<input bind:value={name} />
		</label>
		<label>
			Description
			<textarea bind:value={description} rows="3"></textarea>
		</label>
		<label>
			Target language
			<Select bind:value={l2Target} label="" required>
				<option value="Chinese">Chinese</option>
				<option value="French">French</option>
				<option value="German">German</option>
				<option value="Korean">Korean</option>
				<option value="Spanish">Spanish</option>
			</Select>
		</label>
		<label>
			Proficiency
			<select bind:value={proficiency}>
				<option value="A1">A1</option>
				<option value="A2">A2</option>
				<option value="B1">B1</option>
				<option value="B2">B2</option>
				<option value="C1">C1</option>
				<option value="C2">C2</option>
			</select>
		</label>
		<div class="grid-row">
			<label>
				Grid rows
				<input type="number" min="1" max="10" bind:value={gridRows} />
			</label>
			<label>
				Grid cols
				<input type="number" min="1" max="10" bind:value={gridCols} />
			</label>
		</div>
		<label class="toggle">
			<input type="checkbox" bind:checked={archived} />
			Archive this plot
		</label>
		<button type="button" disabled={saving} on:click={save}>
			{saving ? 'Saving...' : 'Save Settings'}
		</button>
		{#if message}
			<p class="success">{message}</p>
		{/if}
		{#if error}
			<p class="error">{error}</p>
		{/if}
	</div>
{:else}
	<p>No plot found.</p>
{/if}

<style>
	.settings-form {
		background: white;
		border: 1px solid var(--color-border);
		border-radius: var(--radius);
		padding: 1.2rem;
		display: grid;
		gap: 0.8rem;
		max-width: 560px;
	}

	label {
		display: grid;
		gap: 0.35rem;
		font-size: 0.85rem;
		color: #555;
	}

	input,
	select,
	textarea {
		border: 1px solid var(--color-border);
		border-radius: var(--radius);
		padding: 0.45rem 0.6rem;
		font-family: inherit;
	}

	.grid-row {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
		gap: 0.75rem;
	}

	.toggle {
		display: flex;
		gap: 0.5rem;
		align-items: center;
	}

	button {
		border: 1px solid var(--color-border);
		background: var(--color-primary);
		color: white;
		border-radius: 999px;
		padding: 0.45rem 0.9rem;
		cursor: pointer;
	}

	.success {
		color: #0f766e;
	}

	.error {
		color: #b42318;
	}
</style>
