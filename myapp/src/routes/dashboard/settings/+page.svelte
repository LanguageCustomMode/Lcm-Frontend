<script lang="ts">
	import { createClient } from '$lib/supabase';

	let newPassword = $state('');
	let confirmPassword = $state('');
	let passwordMessage = $state<string | null>(null);

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
</script>

<h1>Settings</h1>
<p>Manage your account.</p>

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

	input {
		border: 1px solid var(--color-border);
		border-radius: var(--radius);
		padding: 0.45rem 0.6rem;
	}

	button {
		border: 1px solid var(--color-border);
		background: var(--color-primary);
		color: white;
		border-radius: 999px;
		padding: 0.45rem 0.9rem;
		cursor: pointer;
	}

	.info {
		font-size: 0.8rem;
		color: #555;
	}
</style>
