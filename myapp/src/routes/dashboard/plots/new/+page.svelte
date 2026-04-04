<script lang="ts">
	import { goto } from '$app/navigation';
	import { apiPost } from '$lib/api';

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

<h1>Create New Plot</h1>
<form onsubmit={(e) => { e.preventDefault(); handleCreate(); }}>
	<input bind:value={name} placeholder="Plot name" required />
	<input bind:value={l2_target} placeholder="Target language (e.g. Spanish)" required />
	<select bind:value={proficiency}>
		<option value="A1">A1 - Beginner</option>
		<option value="A2">A2 - Elementary</option>
		<option value="B1">B1 - Intermediate</option>
		<option value="B2">B2 - Upper Intermediate</option>
		<option value="C1">C1 - Advanced</option>
		<option value="C2">C2 - Mastery</option>
	</select>
	<textarea bind:value={description} placeholder="Description (optional)"></textarea>
	{#if error}<p class="error">{error}</p>{/if}
	<button type="submit" disabled={loading}>{loading ? 'Creating...' : 'Create Plot'}</button>
</form>
