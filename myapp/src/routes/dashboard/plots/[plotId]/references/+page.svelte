<script lang="ts">
	let { data } = $props();
</script>

<!-- TODO: Reference text upload/list/search -->
<!--
Stub outline:
- List: GET /plots/{plot_id}/references.
- Upload: POST /plots/{plot_id}/references (multipart or text).
- Delete: DELETE /plots/{plot_id}/references/{ref_id}.
- Search: GET /plots/{plot_id}/references/{ref_id}/chunks?q=... for similarity.
-->
<h1>References</h1>
<p>Upload reference texts for RAG-powered content generation.</p>
