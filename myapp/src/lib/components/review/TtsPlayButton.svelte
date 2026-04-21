<script lang="ts">
	interface Props {
		text: string;
		label?: string;
		voiceName?: string;
		stylePrompt?: string | null;
	}

	let { text, label = 'Play audio', voiceName = 'Kore', stylePrompt = null }: Props = $props();

	let loading = $state(false);
	let error = $state<string | null>(null);
	let audioUrl = $state<string | null>(null);
	let audioEl: HTMLAudioElement | null = $state(null);
	let cachedFor = $state<string | null>(null);

	$effect(() => {
		if (cachedFor !== null && cachedFor !== text) {
			if (audioUrl) URL.revokeObjectURL(audioUrl);
			audioUrl = null;
			cachedFor = null;
			error = null;
		}
	});

	const play = async () => {
		error = null;
		if (audioUrl) {
			audioEl?.play();
			return;
		}
		loading = true;
		try {
			const res = await fetch('/api/tts/preview', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ text, style_prompt: stylePrompt, voice_name: voiceName })
			});
			if (!res.ok) throw new Error(await res.text());
			const blob = await res.blob();
			audioUrl = URL.createObjectURL(blob);
			cachedFor = text;
			await new Promise((r) => setTimeout(r, 0));
			audioEl?.play();
		} catch (err) {
			error = err instanceof Error ? err.message : 'TTS failed';
		} finally {
			loading = false;
		}
	};
</script>

<div class="tts">
	<button type="button" on:click|stopPropagation={play} disabled={loading}>
		{loading ? 'Loading…' : audioUrl ? `▶ ${label}` : `🔊 ${label}`}
	</button>
	{#if audioUrl}
		<audio bind:this={audioEl} src={audioUrl} controls preload="auto"></audio>
	{/if}
	{#if error}
		<p class="error">{error}</p>
	{/if}
</div>

<style>
	.tts {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.5rem;
	}
	button {
		border: 1px solid var(--color-border);
		background: white;
		border-radius: 999px;
		padding: 0.4rem 0.9rem;
		cursor: pointer;
		font-size: 0.9rem;
	}
	button:hover:not(:disabled) {
		border-color: var(--color-primary);
		color: var(--color-primary);
	}
	button:disabled {
		opacity: 0.6;
		cursor: wait;
	}
	audio {
		width: min(420px, 80vw);
	}
	.error {
		color: #b42318;
		font-size: 0.8rem;
	}
</style>
