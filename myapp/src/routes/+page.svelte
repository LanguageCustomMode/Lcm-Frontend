<script lang="ts">
	let { data } = $props();
</script>

<div class="page">
	<header class="nav">
		<div class="nav-inner">
			<a class="brand" href="/">LanguageFarm</a>
			<div class="nav-actions">
				{#if data.session}
					<a class="btn btn-primary btn-md" href="/dashboard">Dashboard</a>
				{:else}
					<a class="btn btn-ghost btn-md" href="/auth/login">Log in</a>
					<a class="btn btn-primary btn-md" href="/auth/signup">Get started</a>
				{/if}
			</div>
		</div>
	</header>

	<section class="hero">
		<div class="hero-inner">
			<span class="eyebrow">Grow fluency, naturally</span>
			<h1>Cultivate a language like you'd tend a garden.</h1>
			<p class="lede">
				LanguageFarm turns vocabulary, grammar, and comprehension into plots you plant, water,
				and harvest — adaptive review, AI-generated practice, and real texts in one calm,
				focused workspace.
			</p>
			<div class="hero-cta">
				{#if data.session}
					<a class="btn btn-primary btn-lg" href="/dashboard">Open your farm</a>
				{:else}
					<a class="btn btn-primary btn-lg" href="/auth/signup">Start free</a>
				{/if}
			</div>
		</div>
	</section>

	<section class="feature-row">
		<div class="feature-text">
			<span class="eyebrow">Spaced repetition</span>
			<h2>Review what matters, exactly when you'd forget it.</h2>
			<p>
				LanguageFarm schedules every word, phrase, and pattern on its own curve. Your daily
				session stays short, but nothing slips through the cracks — the hard items come back,
				the easy ones step aside.
			</p>
		</div>
		<div class="feature-art art-1" aria-hidden="true">
			<div class="card">
				<div class="card-head">Today's review</div>
				<div class="bar"><span style="width: 82%"></span></div>
				<div class="bar"><span style="width: 64%"></span></div>
				<div class="bar"><span style="width: 91%"></span></div>
				<div class="bar"><span style="width: 47%"></span></div>
			</div>
		</div>
	</section>

	<section class="feature-row reverse">
		<div class="feature-text">
			<span class="eyebrow">AI-generated practice</span>
			<h2>Fresh exercises built from your own vocabulary.</h2>
			<p>
				Cloze passages, dialogues, worksheets, and listening drills are generated on demand at
				your level — using words you're actually learning. No more generic textbook fillers.
			</p>
		</div>
		<div class="feature-art art-2" aria-hidden="true">
			<div class="card">
				<div class="card-head">Cloze — B1 German</div>
				<p class="faux-line">Ich ___ gestern ins Kino gegangen.</p>
				<p class="faux-line faux-dim">bin · habe · war</p>
				<p class="faux-line">Der Film ___ sehr spannend.</p>
				<p class="faux-line faux-dim">war · ist · sei</p>
			</div>
		</div>
	</section>

	<section class="feature-row">
		<div class="feature-text">
			<span class="eyebrow">Read real texts</span>
			<h2>Turn articles and stories into study material.</h2>
			<p>
				Paste anything you want to read. Tap a word to see meaning, conjugation, and examples,
				then add it straight to your review deck. Your library grows with what you actually
				care about.
			</p>
		</div>
		<div class="feature-art art-3" aria-hidden="true">
			<div class="card">
				<div class="card-head">Der Tagesspiegel</div>
				<p class="faux-line">Die <mark>Aufmerksamkeit</mark> der Leserinnen …</p>
				<p class="faux-line faux-dim">noun · die · attention, awareness</p>
				<p class="faux-line">… wurde auf das <mark>Ereignis</mark> gelenkt.</p>
			</div>
		</div>
	</section>

	<section class="feature-row reverse">
		<div class="feature-text">
			<span class="eyebrow">Honest progress</span>
			<h2>Metrics that predict fluency, not streaks.</h2>
			<p>
				Track retention, coverage, and time on task across skills. See what's sticking and
				what's slipping — the numbers reflect the work, not the noise.
			</p>
		</div>
		<div class="feature-art art-4" aria-hidden="true">
			<div class="card">
				<div class="card-head">This week</div>
				<div class="stat"><span>Retention</span><b>87%</b></div>
				<div class="stat"><span>New items</span><b>42</b></div>
				<div class="stat"><span>Time on task</span><b>2h 14m</b></div>
			</div>
		</div>
	</section>

	<footer class="footer">
		© {new Date().getFullYear()} LanguageFarm
	</footer>
</div>

<style>
	.page {
		min-height: 100vh;
		display: flex;
		flex-direction: column;
	}

	/* Nav */
	.nav {
		position: sticky;
		top: 0;
		z-index: 10;
		background: rgba(250, 250, 248, 0.85);
		backdrop-filter: saturate(180%) blur(8px);
		border-bottom: 1px solid var(--color-border);
	}
	.nav-inner {
		max-width: 1080px;
		margin: 0 auto;
		padding: 0.9rem 1.25rem;
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1rem;
	}
	.brand {
		text-decoration: none;
		color: var(--color-text);
		font-weight: 600;
		font-size: 1.05rem;
		letter-spacing: -0.01em;
	}
	.nav-actions {
		display: flex;
		gap: 0.5rem;
	}

	/* Hero */
	.hero {
		padding: 6rem 1.25rem 5rem;
	}
	.hero-inner {
		max-width: 720px;
		margin: 0 auto;
		text-align: center;
	}
	.eyebrow {
		display: inline-block;
		font-size: 0.8rem;
		text-transform: uppercase;
		letter-spacing: 0.12em;
		color: var(--color-primary);
		font-weight: 600;
		margin-bottom: 1rem;
	}
	.hero h1 {
		font-size: clamp(2rem, 4.2vw, 3.25rem);
		line-height: 1.1;
		letter-spacing: -0.02em;
		margin-bottom: 1.25rem;
	}
	.lede {
		font-size: 1.1rem;
		line-height: 1.6;
		color: #444;
		margin: 0 auto 2rem;
		max-width: 38rem;
	}
	.hero-cta {
		display: flex;
		gap: 0.75rem;
		justify-content: center;
	}

	/* Feature rows */
	.feature-row {
		max-width: 1080px;
		margin: 0 auto;
		padding: 5rem 1.25rem;
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 4rem;
		align-items: center;
	}
	.feature-row.reverse .feature-text {
		order: 2;
	}
	.feature-text h2 {
		font-size: clamp(1.5rem, 2.4vw, 2rem);
		line-height: 1.2;
		letter-spacing: -0.015em;
		margin-bottom: 1rem;
	}
	.feature-text p {
		font-size: 1rem;
		line-height: 1.65;
		color: #444;
	}

	.feature-art {
		border-radius: 16px;
		padding: 2rem;
		min-height: 260px;
		display: flex;
		align-items: center;
		justify-content: center;
		border: 1px solid var(--color-border);
		box-shadow: 0 10px 40px -20px rgba(0, 0, 0, 0.15);
	}
	.art-1 {
		background: linear-gradient(160deg, #eef5ec, #f7f0dd);
	}
	.art-2 {
		background: linear-gradient(160deg, #f3efe4, #e8f0ee);
	}
	.art-3 {
		background: linear-gradient(160deg, #f1eadd, #ecf3e8);
	}
	.art-4 {
		background: linear-gradient(160deg, #e8f0ee, #faf3e4);
	}

	.card {
		background: #fff;
		border: 1px solid var(--color-border);
		border-radius: 12px;
		padding: 1.25rem 1.4rem;
		width: 100%;
		max-width: 340px;
		display: flex;
		flex-direction: column;
		gap: 0.7rem;
	}
	.card-head {
		font-size: 0.82rem;
		text-transform: uppercase;
		letter-spacing: 0.1em;
		color: #888;
		font-weight: 600;
		margin-bottom: 0.3rem;
	}
	.bar {
		height: 8px;
		background: #f0efe9;
		border-radius: 999px;
		overflow: hidden;
	}
	.bar span {
		display: block;
		height: 100%;
		background: linear-gradient(90deg, var(--color-primary), var(--color-primary-light));
		border-radius: 999px;
	}
	.faux-line {
		font-size: 0.92rem;
		color: #333;
		line-height: 1.5;
	}
	.faux-dim {
		color: #999;
		font-size: 0.82rem;
	}
	.card mark {
		background: rgba(232, 168, 56, 0.25);
		padding: 0 0.2rem;
		border-radius: 3px;
		color: inherit;
	}
	.stat {
		display: flex;
		justify-content: space-between;
		align-items: baseline;
		padding: 0.5rem 0;
		border-bottom: 1px dashed #eee;
	}
	.stat:last-child {
		border-bottom: none;
	}
	.stat span {
		color: #666;
		font-size: 0.9rem;
	}
	.stat b {
		font-size: 1.15rem;
		font-weight: 600;
		letter-spacing: -0.01em;
	}

	/* Footer */
	.footer {
		margin-top: auto;
		padding: 2rem 1.25rem;
		text-align: center;
		font-size: 0.85rem;
		color: #888;
		border-top: 1px solid var(--color-border);
	}

	/* Responsive */
	@media (max-width: 780px) {
		.feature-row {
			grid-template-columns: 1fr;
			gap: 2rem;
			padding: 3.5rem 1.25rem;
		}
		.feature-row.reverse .feature-text {
			order: 0;
		}
		.hero {
			padding: 4rem 1.25rem 3rem;
		}
	}
</style>
