<script lang="ts">
	let { data } = $props();
</script>

<main class="landing">
	<div class="mesh mesh-a" aria-hidden="true"></div>
	<div class="mesh mesh-b" aria-hidden="true"></div>
	<div class="grain" aria-hidden="true"></div>
	<section class="hero">
		<h1>LanguageFarm</h1>
		<p>Grow your language skills, one plot at a time.</p>
		<div class="actions">
			{#if data.session}
				<a class="btn btn-primary" href="/dashboard">Go to Dashboard</a>
			{:else}
				<a class="btn btn-secondary" href="/auth/login">Log In</a>
				<a class="btn btn-primary" href="/auth/signup">Get Started</a>
			{/if}
		</div>
	</section>
</main>

<style>
	.landing {
		position: relative;
		overflow: hidden;
		isolation: isolate;
		min-height: 100vh;
		display: grid;
		place-items: center;
		padding: 1.5rem;
		background:
			radial-gradient(125% 85% at 8% 14%, rgba(125, 174, 138, 0.4), transparent 55%),
			radial-gradient(100% 70% at 92% 86%, rgba(74, 124, 89, 0.34), transparent 58%),
			radial-gradient(85% 60% at 58% 24%, rgba(150, 201, 164, 0.3), transparent 64%),
			linear-gradient(160deg, #f7fbf7 0%, #edf7f0 45%, #e7f2ea 100%);
	}

	.mesh {
		position: absolute;
		pointer-events: none;
		z-index: 0;
		filter: blur(6px);
		opacity: 0.78;
	}

	.mesh-a {
		width: clamp(16rem, 32vw, 24rem);
		height: clamp(16rem, 32vw, 24rem);
		top: -5rem;
		left: -4rem;
		border-radius: 57% 43% 66% 34% / 35% 57% 43% 65%;
		background:
			radial-gradient(circle at 34% 36%, rgba(103, 160, 118, 0.38), rgba(103, 160, 118, 0.06) 65%, transparent 70%),
			radial-gradient(circle at 72% 65%, rgba(67, 114, 81, 0.32), transparent 58%);
	}

	.mesh-b {
		width: clamp(17rem, 36vw, 27rem);
		height: clamp(17rem, 36vw, 27rem);
		right: -6rem;
		bottom: -6rem;
		border-radius: 39% 61% 47% 53% / 59% 31% 69% 41%;
		background:
			radial-gradient(circle at 30% 40%, rgba(74, 124, 89, 0.36), rgba(74, 124, 89, 0.08) 60%, transparent 68%),
			radial-gradient(circle at 72% 66%, rgba(166, 214, 178, 0.3), transparent 62%);
	}

	.grain {
		position: absolute;
		inset: 0;
		pointer-events: none;
		z-index: 1;
		opacity: 0.12;
		background-image:
			repeating-linear-gradient(0deg, rgba(19, 49, 30, 0.1) 0, rgba(19, 49, 30, 0.1) 1px, transparent 1px, transparent 3px),
			repeating-linear-gradient(90deg, rgba(19, 49, 30, 0.08) 0, rgba(19, 49, 30, 0.08) 1px, transparent 1px, transparent 4px);
		mix-blend-mode: soft-light;
	}

	.hero {
		position: relative;
		z-index: 2;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		text-align: center;
		gap: 1.2rem;
		max-width: 50rem;
		padding: clamp(1.6rem, 3.2vw, 2.4rem);
		border-radius: 1.25rem;
		backdrop-filter: blur(2px);
		background: rgba(255, 255, 255, 0.48);
		box-shadow: 0 14px 40px rgba(36, 72, 49, 0.12);
	}

	h1 {
		font-size: clamp(2rem, 4vw, 3rem);
		line-height: 1.18;
		letter-spacing: 0.01em;
		color: #325f43;
	}

	p {
		font-size: clamp(1rem, 2vw, 1.2rem);
		line-height: 1.65;
		letter-spacing: 0.01em;
		color: #406f50;
		max-width: 38rem;
	}

	.actions {
		display: flex;
		gap: 0.9rem;
		justify-content: center;
		margin-top: 0.9rem;
		flex-wrap: wrap;
	}

	.actions :global(.btn) {
		text-decoration: none;
		padding: 0.7rem 1.2rem;
		font-size: 0.95rem;
		font-weight: 600;
		border-radius: 999px;
	}

	.actions :global(.btn-primary) {
		background: #4a7c59;
		color: #fff;
	}

	.actions :global(.btn-primary:hover) {
		background: #5f926d;
	}

	.actions :global(.btn-secondary) {
		color: #2f5f3f;
		background: #fff;
		border: 1px solid #b8cfbf;
	}

	.actions :global(.btn-secondary:hover) {
		background: #f2f8f4;
	}

	@media (max-width: 640px) {
		.hero {
			padding: 1.4rem 1.1rem;
		}

		.mesh-a {
			top: -6rem;
			left: -7rem;
		}

		.mesh-b {
			right: -8rem;
			bottom: -8rem;
		}
	}
</style>
