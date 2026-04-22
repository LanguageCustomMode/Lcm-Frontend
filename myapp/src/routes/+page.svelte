<script lang="ts">
	let { data } = $props();
</script>

<main>
	<h1>LanguageFarm</h1>
	<p>Grow your language skills, one plot at a time.</p>
	{#if data.session}
		<a href="/dashboard">Go to Dashboard</a>
	{:else}
		<a href="/auth/login">Log In</a>
		<a href="/auth/signup">Get Started</a>
	{/if}
</main>
