<script lang="ts">
	let { data } = $props();
</script>

<!-- TODO: User settings (password change, LLM API key management) -->
<!--
Stub outline:
- GET /users/me/settings for provider + key presence.
- PUT /users/me/settings to save provider + API key.
- DELETE /users/me/settings/api-key to remove key.
- Optional Supabase password change flow.
-->
<h1>Settings</h1>
<p>Manage your account and API keys.</p>
