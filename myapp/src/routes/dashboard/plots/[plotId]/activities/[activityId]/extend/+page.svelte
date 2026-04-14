<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';

	let { data } = $props();

	type ExtensionOption = { target_type: string; prompt: string };

	let options = $state<ExtensionOption[]>([]);
	let loading = $state(false);
	let error = $state<string | null>(null);

	const loadOptions = async () => {
		loading = true;
		try {
			const res = await fetch(`/api/activities/${$page.params.activityId}/extensions`);
			if (!res.ok) throw new Error(await res.text());
			options = await res.json();
			const preselect = $page.url.searchParams.get('target_type');
			if (preselect && options.some((option) => option.target_type === preselect)) {
				await extend(preselect);
			}
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to load extensions';
		} finally {
			loading = false;
		}
	};

	const extend = async (targetType: string) => {
		try {
			const res = await fetch(`/api/activities/${$page.params.activityId}/extensions`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ target_type: targetType })
			});
			if (!res.ok) throw new Error(await res.text());
			const payload = await res.json();
			const params = new URLSearchParams({ conversation_id: payload.conversation_id });
			await goto(`/dashboard/plots/${data.plot?.id}/design?${params.toString()}`);
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to start extension';
		}
	};

	onMount(loadOptions);
</script>

<h1>Extend Activity</h1>
<p>Choose an extension type to create a new related activity.</p>
{#if error}
	<p class="error">{error}</p>
{/if}
{#if loading}
	<p>Loading extensions...</p>
{:else}
	<ul class="options">
		{#each options as option}
			<li>
				<div>
					<strong>{option.target_type.replace(/_/g, ' ')}</strong>
					<p>{option.prompt}</p>
				</div>
				<button type="button" on:click={() => extend(option.target_type)}>Select</button>
			</li>
		{/each}
	</ul>
{/if}

<style>
	.options {
		list-style: none;
		display: grid;
		gap: 0.75rem;
		margin-top: 1rem;
	}

	.options li {
		background: white;
		border: 1px solid var(--color-border);
		border-radius: var(--radius);
		padding: 0.9rem;
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 1rem;
	}

	.options p {
		font-size: 0.8rem;
		color: #666;
	}

	button {
		border: 1px solid var(--color-border);
		background: var(--color-primary);
		color: white;
		border-radius: 999px;
		padding: 0.4rem 0.8rem;
		cursor: pointer;
	}

	.error {
		color: #b42318;
	}
</style>
