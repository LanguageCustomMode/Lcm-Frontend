<script lang="ts">
	import { createClient } from '$lib/supabase';
	import { goto } from '$app/navigation';
	import Input from '$lib/components/ui/Input.svelte';

	let email = $state('');
	let password = $state('');
	let error = $state('');
	let loading = $state(false);

	async function handleLogin() {
		loading = true;
		error = '';
		const supabase = createClient();
		const { error: err } = await supabase.auth.signInWithPassword({ email, password });
		if (err) {
			error = err.message;
			loading = false;
			return;
		}
		goto('/dashboard');
	}
</script>

<main>
	<div class="card">
		<h1>Log In</h1>
		<form onsubmit={(e) => { e.preventDefault(); handleLogin(); }}>
			<Input bind:value={email} type="email" placeholder="you@example.com" label="Email" required />
			<Input bind:value={password} type="password" placeholder="••••••••" label="Password" required />
			{#if error}<p class="error">{error}</p>{/if}
			<button type="submit" disabled={loading}>{loading ? 'Logging in…' : 'Log In'}</button>
		</form>
		<p>Don't have an account? <a href="/auth/signup">Sign up</a></p>
	</div>
</main>

<style>
	main {
		min-height: 100vh;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 2rem;
	}

	.card {
		background: white;
		border: 1px solid var(--color-border);
		border-radius: var(--radius);
		padding: 2rem;
		width: 100%;
		max-width: 380px;
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

	button[type='submit'] {
		width: 100%;
		background: var(--color-primary);
		color: white;
		border: none;
		border-radius: var(--radius);
		padding: 0.65rem;
		font-size: 0.95rem;
		font-weight: 500;
		cursor: pointer;
		transition: background 0.15s;
		margin-top: 0.25rem;
		font-family: inherit;
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

	p {
		font-size: 0.85rem;
		color: #666;
		text-align: center;
	}

	a {
		color: var(--color-primary);
	}
</style>
