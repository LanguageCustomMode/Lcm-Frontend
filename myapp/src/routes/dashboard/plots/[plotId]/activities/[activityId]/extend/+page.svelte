<script lang="ts">
	let { data } = $props();
</script>

<!-- TODO: Extension selection + redirect to design chat -->
<!--
Stub outline:
- GET /activities/{activity_id}/extensions -> list of target_type options.
- Render selection list; on choose, POST /activities/{activity_id}/extend.
- Backend returns { conversation_id, assistant_message }; redirect to design chat and continue via /llm/design/{conversation_id}/message.
-->
<h1>Extend Activity</h1>
<p>Choose an extension type to create a new related activity.</p>
