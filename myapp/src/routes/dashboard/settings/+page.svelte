<script lang="ts">
	import { onMount } from 'svelte';
	import { createClient } from '$lib/supabase';

	let { data } = $props();

	let provider = $state('openai');
	let apiKey = $state('');
	let apiKeySet = $state(false);
	let loading = $state(false);
	let message = $state<string | null>(null);
	let error = $state<string | null>(null);

	let newPassword = $state('');
	let confirmPassword = $state('');
	let passwordMessage = $state<string | null>(null);

	const loadSettings = async () => {
		try {
			const res = await fetch('/api/users/me/settings');
			if (!res.ok) throw new Error(await res.text());
			const settings = await res.json();
			provider = settings.llm_provider ?? 'openai';
			apiKeySet = settings.llm_api_key_set;
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to load settings';
		}
	};

	const saveSettings = async () => {
		loading = true;
		message = null;
		error = null;
		try {
			const res = await fetch('/api/users/me/settings', {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ llm_provider: provider, llm_api_key: apiKey || undefined })
			});
			if (!res.ok) throw new Error(await res.text());
			message = 'Settings saved.';
			apiKey = '';
			await loadSettings();
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to save settings';
		} finally {
			loading = false;
		}
	};

	const removeKey = async () => {
		loading = true;
		message = null;
		error = null;
		try {
			const res = await fetch('/api/users/me/settings/api-key', { method: 'DELETE' });
			if (!res.ok) throw new Error(await res.text());
			message = 'API key removed.';
			apiKeySet = false;
			apiKey = '';
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to remove key';
		} finally {
			loading = false;
		}
	};

	const changePassword = async () => {
		passwordMessage = null;
		if (!newPassword || newPassword !== confirmPassword) {
			passwordMessage = 'Passwords do not match.';
			return;
		}
		const supabase = createClient();
		const { error: updateError } = await supabase.auth.updateUser({ password: newPassword });
		passwordMessage = updateError ? updateError.message : 'Password updated.';
		newPassword = '';
		confirmPassword = '';
	};

	onMount(loadSettings);
</script>

<h1>Settings</h1>
<p>Manage your account and API keys.</p>

<section class="panel">
	<h2>LLM Provider</h2>
	<p>Choose your provider and store an API key for generation features.</p>
	<div class="form">
		<label>
			Provider
			<select bind:value={provider}>
				<option value="openai">OpenAI</option>
				<option value="anthropic">Anthropic</option>
				<option value="google">Google</option>
			</select>
		</label>
		<label>
			API Key {apiKeySet ? '(set)' : '(not set)'}
			<input
				type="password"
				bind:value={apiKey}
				placeholder={apiKeySet ? '••••••••••' : 'Paste key'}
			/>
		</label>
		<div class="actions">
			<button type="button" disabled={loading} on:click={saveSettings}>
				{loading ? 'Saving...' : 'Save Settings'}
			</button>
			{#if apiKeySet}
				<button type="button" class="ghost" disabled={loading} on:click={removeKey}>Remove Key</button>
			{/if}
		</div>
		{#if message}
			<p class="success">{message}</p>
		{/if}
		{#if error}
			<p class="error">{error}</p>
		{/if}
	</div>
</section>

<section class="panel">
	<h2>Change Password</h2>
	<p>Update your account password.</p>
	<div class="form">
		<label>
			New password
			<input type="password" bind:value={newPassword} />
		</label>
		<label>
			Confirm password
			<input type="password" bind:value={confirmPassword} />
		</label>
		<button type="button" on:click={changePassword}>Update Password</button>
		{#if passwordMessage}
			<p class="info">{passwordMessage}</p>
		{/if}
	</div>
</section>

<style>
	.panel {
		background: white;
		border: 1px solid var(--color-border);
		border-radius: var(--radius);
		padding: 1.2rem;
		margin-top: 1.5rem;
		display: grid;
		gap: 0.5rem;
	}

	.form {
		display: grid;
		gap: 0.75rem;
	}

	label {
		display: grid;
		gap: 0.35rem;
		font-size: 0.85rem;
		color: #555;
	}

	input,
	select {
		border: 1px solid var(--color-border);
		border-radius: var(--radius);
		padding: 0.45rem 0.6rem;
	}

	.actions {
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

	button.ghost {
		background: white;
		color: #333;
	}

	.success {
		color: #0f766e;
	}

	.error {
		color: #b42318;
	}

	.info {
		font-size: 0.8rem;
		color: #555;
	}
</style>
