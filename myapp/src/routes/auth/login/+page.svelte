<script lang="ts">
	import { createClient } from '$lib/supabase';
	import { goto } from '$app/navigation';

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
	<h1>Log In</h1>
	<form onsubmit={(e) => { e.preventDefault(); handleLogin(); }}>
		<input bind:value={email} type="email" placeholder="Email" required />
		<input bind:value={password} type="password" placeholder="Password" required />
		{#if error}<p class="error">{error}</p>{/if}
		<button type="submit" disabled={loading}>{loading ? 'Logging in...' : 'Log In'}</button>
	</form>
	<p>Don't have an account? <a href="/auth/signup">Sign up</a></p>
</main>
