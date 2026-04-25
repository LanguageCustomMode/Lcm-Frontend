<script lang="ts">
	import { invalidate } from '$app/navigation';
	import Input from '$lib/components/ui/Input.svelte';
	import Textarea from '$lib/components/ui/Textarea.svelte';
	import Select from '$lib/components/ui/Select.svelte';
	import Checkbox from '$lib/components/ui/Checkbox.svelte';
	import Button from '$lib/components/ui/Button.svelte';

	let { data } = $props();

	let name = $state(data.plot?.name ?? '');
	let description = $state(data.plot?.description ?? '');
	let l2Target = $state(data.plot?.l2_target ?? '');
	let proficiency = $state(data.plot?.proficiency ?? 'A1');
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
					archived
				})
			});
			if (!res.ok) throw new Error(await res.text());

			// Refresh parent layout data so sidebar/dashboard plot lists reflect updates immediately.
			await Promise.all([
				invalidate('app:dashboard-plots'),
				invalidate('/api/plots'),
				invalidate('/api/plots?include_archived=true'),
				invalidate('/api/plots?archived=true'),
				invalidate(`/api/plots/${data.plot.id}`)
			]);

			message = 'Plot updated.';
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to update plot';
		} finally {
			saving = false;
		}
	};
</script>

<div class="plot-header">
	<div>
		<h1>Plot Settings</h1>
	</div>
</div>
{#if data.plot}
	<div class="settings-form">
		<Input label="Name" bind:value={name} />
		<Textarea label="Description" bind:value={description} rows={3} />
		<Select label="Target language" bind:value={l2Target} required>
			<option value="Chinese">Chinese</option>
			<option value="French">French</option>
			<option value="German">German</option>
			<option value="Korean">Korean</option>
			<option value="Spanish">Spanish</option>
		</Select>
		<Select label="Proficiency" bind:value={proficiency}>
			<option value="A1">A1 – Beginner</option>
			<option value="A2">A2 – Elementary</option>
			<option value="B1">B1 – Intermediate</option>
			<option value="B2">B2 – Upper Intermediate</option>
			<option value="C1">C1 – Advanced</option>
			<option value="C2">C2 – Mastery</option>
		</Select>
		<Checkbox label="Archive this plot" bind:checked={archived} />
		<Button type="button" disabled={saving} onclick={save}>
			{saving ? 'Saving...' : 'Save Settings'}
		</Button>
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
	.plot-header {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		gap: 1rem;
		margin-bottom: 0.5rem;
	}
	.plot-header h1 {
		font-family: 'Nunito', 'Trebuchet MS', 'Segoe UI', sans-serif;
		font-weight: 700;
	}
	.plot-desc {
		font-size: 0.8rem;
		color: #666;
		margin-top: 0.25rem;
	}
	.settings-form {
		background: white;
		border: 1px solid var(--color-border);
		border-radius: var(--radius);
		padding: 1.2rem;
		display: grid;
		gap: 0.8rem;
		max-width: 560px;
	}

	.success {
		color: #0f766e;
	}

	.error {
		color: #b42318;
	}
</style>
