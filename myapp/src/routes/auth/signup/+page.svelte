<script lang="ts">
	import { createClient } from '$lib/supabase';
	import { goto } from '$app/navigation';

	let username = $state('');
	let email = $state('');
	let password = $state('');
	let error = $state('');
	let loading = $state(false);

	async function handleSignup() {
		loading = true;
		error = '';
		const supabase = createClient();
		const { error: err } = await supabase.auth.signUp({
			email,
			password,
			options: { data: { username } }
		});
		if (err) {
			error = err.message;
			loading = false;
			return;
		}
		goto('/dashboard');
	}
</script>

<main>
	<h1>Sign Up</h1>
	<form onsubmit={(e) => { e.preventDefault(); handleSignup(); }}>
		<input bind:value={username} type="text" placeholder="Username" required />
		<input bind:value={email} type="email" placeholder="Email" required />
		<input bind:value={password} type="password" placeholder="Password" required />
		{#if error}<p class="error">{error}</p>{/if}
		<button type="submit" disabled={loading}>{loading ? 'Creating account...' : 'Sign Up'}</button>
	</form>
	<p>Already have an account? <a href="/auth/login">Log in</a></p>
</main>
