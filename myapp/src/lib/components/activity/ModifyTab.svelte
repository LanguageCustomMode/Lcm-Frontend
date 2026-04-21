<script lang="ts">
	import type { ContentType, ContentPayload } from '$lib/types';
	import { onMount } from 'svelte';

	interface Props {
		activityId: string;
	}

	interface ModifyItem {
		id: string | null;
		content_type: ContentType;
		content: ContentPayload;
		sort_order: number;
	}

	interface ModifyMessage {
		role: 'user' | 'assistant';
		content: string;
	}

	let { activityId }: Props = $props();

	let sessionId = $state<string | null>(null);
	let messages = $state<ModifyMessage[]>([]);
	let currentContent = $state<ModifyItem[]>([]);
	let draftContent = $state<ModifyItem[] | null>(null);
	let input = $state('');
	let loading = $state(false);
	let sending = $state(false);
	let error = $state<string | null>(null);

	const summarize = (item: ModifyItem): string => {
		const c = item.content as unknown as Record<string, unknown>;
		switch (item.content_type) {
			case 'card':
			case 'error':
			case 'audio_card':
				return `${String(c.front ?? '')}  ↔  ${String(c.back ?? '')}`;
			case 'note':
				return String(c.text ?? '').slice(0, 200);
			case 'mcq':
				return `${String(c.question ?? '')} (${(c.answers as string[])?.length ?? 0} opts)`;
			case 'wildcard':
				return String(c.text ?? '');
			case 'sentence':
				return String(c.sentence ?? '');
			case 'knowledge_component':
				return `${String(c.short_name ?? '')} — ${String(c.description ?? '')}`;
			default:
				return JSON.stringify(c).slice(0, 120);
		}
	};

	const diffClass = (item: ModifyItem): string => {
		if (!item.id) return 'added';
		const orig = currentContent.find((c) => c.id === item.id);
		if (!orig) return 'added';
		if (JSON.stringify(orig.content) !== JSON.stringify(item.content)) return 'changed';
		return '';
	};

	const removedItems = $derived(() => {
		if (!draftContent) return [];
		const keptIds = new Set(draftContent.filter((d) => d.id).map((d) => d.id));
		return currentContent.filter((c) => !keptIds.has(c.id));
	});

	const loadSession = async () => {
		loading = true;
		error = null;
		try {
			const res = await fetch(`/api/llm/modify/activities/${activityId}/session`, {
				method: 'POST'
			});
			if (!res.ok) throw new Error(await res.text());
			const data = await res.json();
			sessionId = data.session_id;
			messages = data.messages ?? [];
			currentContent = data.current_content ?? [];
			draftContent = data.draft_content ?? null;
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to load session';
		} finally {
			loading = false;
		}
	};

	const send = async () => {
		if (!sessionId || !input.trim() || sending) return;
		const msg = input.trim();
		input = '';
		sending = true;
		error = null;
		messages = [...messages, { role: 'user', content: msg }];
		try {
			const res = await fetch(`/api/llm/modify/${sessionId}/message`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ message: msg })
			});
			if (!res.ok) throw new Error(await res.text());
			const data = await res.json();
			messages = data.messages;
			draftContent = data.draft_content ?? null;
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to send';
		} finally {
			sending = false;
		}
	};

	const accept = async () => {
		if (!sessionId) return;
		if (!confirm('Apply these changes to the activity?')) return;
		try {
			const res = await fetch(`/api/llm/modify/${sessionId}/apply`, { method: 'POST' });
			if (!res.ok) throw new Error(await res.text());
			sessionId = null;
			messages = [];
			draftContent = null;
			await loadSession();
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to apply';
		}
	};

	const discard = async () => {
		if (!sessionId) return;
		try {
			const res = await fetch(`/api/llm/modify/${sessionId}/discard`, { method: 'POST' });
			if (!res.ok) throw new Error(await res.text());
			draftContent = null;
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to discard';
		}
	};

	onMount(loadSession);
</script>

<div class="modify-tab">
	{#if error}
		<p class="error">{error}</p>
	{/if}

	{#if loading}
		<p>Loading…</p>
	{:else}
		<div class="split">
			<section class="chat">
				<h3>Modify chat</h3>
				<div class="messages">
					{#if messages.length === 0}
						<p class="hint">
							Describe the changes you want — e.g. "rewrite the cards to use the formal
							register" or "add 3 more sentences about travel".
						</p>
					{/if}
					{#each messages as m}
						<div class="msg {m.role}">
							<strong>{m.role === 'user' ? 'You' : 'Editor'}</strong>
							<p>{m.content}</p>
						</div>
					{/each}
					{#if sending}
						<div class="msg assistant"><em>Editor is thinking…</em></div>
					{/if}
				</div>
				<form
					on:submit|preventDefault={send}
					class="composer"
				>
					<textarea
						bind:value={input}
						placeholder="Instructions for the editor…"
						rows="3"
						disabled={sending}
					></textarea>
					<button type="submit" disabled={sending || !input.trim()}>Send</button>
				</form>
			</section>

			<section class="diff">
				<div class="diff-header">
					<h3>Content</h3>
					{#if draftContent}
						<div class="draft-actions">
							<button type="button" class="accept" on:click={accept}>Accept draft</button>
							<button type="button" class="discard" on:click={discard}>Discard</button>
						</div>
					{/if}
				</div>

				<div class="columns">
					<div class="column">
						<h4>Current ({currentContent.length})</h4>
						<ul>
							{#each currentContent as item}
								<li>
									<span class="badge">{item.content_type}</span>
									<span class="text">{summarize(item)}</span>
								</li>
							{/each}
							{#if currentContent.length === 0}
								<li class="hint">No content yet.</li>
							{/if}
						</ul>
					</div>
					<div class="column">
						<h4>
							Draft
							{#if draftContent}({draftContent.length}){/if}
						</h4>
						{#if !draftContent}
							<p class="hint">No draft yet — send a message to propose changes.</p>
						{:else}
							<ul>
								{#each draftContent as item}
									<li class={diffClass(item)}>
										<span class="badge">{item.content_type}</span>
										<span class="text">{summarize(item)}</span>
									</li>
								{/each}
								{#each removedItems() as item}
									<li class="removed">
										<span class="badge">{item.content_type}</span>
										<span class="text">{summarize(item)}</span>
									</li>
								{/each}
							</ul>
						{/if}
					</div>
				</div>
			</section>
		</div>
	{/if}
</div>

<style>
	.modify-tab {
		display: grid;
		gap: 1rem;
	}
	.split {
		display: grid;
		grid-template-columns: minmax(300px, 1fr) minmax(400px, 1.4fr);
		gap: 1rem;
	}
	section {
		background: white;
		border: 1px solid var(--color-border);
		border-radius: var(--radius);
		padding: 1rem;
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
		min-height: 400px;
	}
	h3 {
		margin: 0;
		font-size: 0.95rem;
	}
	h4 {
		margin: 0 0 0.5rem;
		font-size: 0.8rem;
		color: #555;
	}
	.messages {
		flex: 1;
		overflow-y: auto;
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		max-height: 420px;
	}
	.msg {
		padding: 0.5rem 0.7rem;
		border-radius: var(--radius);
		font-size: 0.85rem;
	}
	.msg.user {
		background: #eef5ff;
	}
	.msg.assistant {
		background: #f6f6f1;
	}
	.msg strong {
		display: block;
		font-size: 0.7rem;
		color: #555;
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}
	.msg p {
		margin: 0.2rem 0 0;
		white-space: pre-wrap;
	}
	.composer {
		display: grid;
		gap: 0.4rem;
	}
	textarea {
		width: 100%;
		font: inherit;
		border: 1px solid var(--color-border);
		border-radius: var(--radius);
		padding: 0.5rem;
		resize: vertical;
	}
	button {
		border: 1px solid var(--color-border);
		background: white;
		border-radius: 999px;
		padding: 0.35rem 0.8rem;
		cursor: pointer;
		font-size: 0.8rem;
	}
	button.accept {
		background: var(--color-primary, #16a34a);
		color: white;
	}
	button.discard {
		background: #fafaf8;
	}
	.diff-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}
	.draft-actions {
		display: flex;
		gap: 0.4rem;
	}
	.columns {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 0.75rem;
	}
	.column {
		background: #fafaf8;
		border-radius: var(--radius);
		padding: 0.6rem;
		max-height: 480px;
		overflow-y: auto;
	}
	ul {
		list-style: none;
		padding: 0;
		margin: 0;
		display: grid;
		gap: 0.3rem;
	}
	li {
		display: flex;
		gap: 0.4rem;
		font-size: 0.8rem;
		padding: 0.35rem 0.4rem;
		border-radius: var(--radius);
		background: white;
		border-left: 3px solid transparent;
	}
	li.added {
		border-left-color: #16a34a;
		background: #f0fdf4;
	}
	li.changed {
		border-left-color: #d97706;
		background: #fffbeb;
	}
	li.removed {
		border-left-color: #dc2626;
		background: #fef2f2;
		text-decoration: line-through;
		opacity: 0.7;
	}
	.badge {
		font-size: 0.65rem;
		text-transform: uppercase;
		letter-spacing: 0.04em;
		color: #666;
		flex-shrink: 0;
	}
	.text {
		flex: 1;
		word-break: break-word;
	}
	.hint {
		color: #888;
		font-size: 0.8rem;
	}
	.error {
		color: #b42318;
	}
</style>
