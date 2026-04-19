<script lang="ts">
	import { goto } from '$app/navigation';
	import { apiPost } from '$lib/api';
	import Input from '$lib/components/ui/Input.svelte';
	import Textarea from '$lib/components/ui/Textarea.svelte';
	import Select from '$lib/components/ui/Select.svelte';

	let name = $state('');
	let l2_target = $state('');
	let proficiency = $state('A1');
	let description = $state('');
	let error = $state('');
	let loading = $state(false);

	async function handleCreate() {
		loading = true;
		error = '';
		try {
			const plot = await apiPost<{ id: string }>('/plots', {
				name, l2_target, proficiency, description
			});
			goto(`/dashboard/plots/${plot.id}`);
		} catch (e: any) {
			error = e.detail || e.message;
			loading = false;
		}
	}
</script>

<div class="page">
	<h1>Create New Plot</h1>
	<form onsubmit={(e) => { e.preventDefault(); handleCreate(); }}>
		<Input bind:value={name} label="Plot name" placeholder="My Spanish Story" required />
		<div class="row">
			<Input bind:value={l2_target} label="Target language" placeholder="Spanish" required />
			<Select bind:value={proficiency} label="Proficiency">
				<option value="A1">A1 – Beginner</option>
				<option value="A2">A2 – Elementary</option>
				<option value="B1">B1 – Intermediate</option>
				<option value="B2">B2 – Upper Intermediate</option>
				<option value="C1">C1 – Advanced</option>
				<option value="C2">C2 – Mastery</option>
			</Select>
		</div>
		<Textarea bind:value={description} label="Description" placeholder="What's this plot about? (optional)" />
		{#if error}<p class="error">{error}</p>{/if}
		<button type="submit" disabled={loading}>{loading ? 'Creating…' : 'Create Plot'}</button>
	</form>
</div>

<style>
	.page {
		max-width: 520px;
		padding: 2rem 0;
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
	}

	h1 {
		font-size: 1.4rem;
		font-weight: 600;
	}

	form {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.row {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 0.75rem;
	}

	button[type='submit'] {
		align-self: flex-start;
		background: var(--color-primary);
		color: white;
		border: none;
		border-radius: var(--radius);
		padding: 0.6rem 1.5rem;
		font-size: 0.95rem;
		font-weight: 500;
		cursor: pointer;
		transition: background 0.15s;
		font-family: inherit;
		margin-top: 0.25rem;
	}

	button[type='submit']:hover:not(:disabled) {
		background: var(--color-primary-light);
	}

	button[type='submit']:disabled {
		opacity: 0.65;
		cursor: not-allowed;
	}

	.error {
		font-size: 0.8rem;
		color: #b42318;
	}
</style>
