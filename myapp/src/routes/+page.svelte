<script lang="ts">
	let { data } = $props();
</script>

<div class="page">
	<header class="nav">
		<div class="nav-inner">
			<a class="brand" href="/">
				<span class="brand-mark">🌱</span>
				<span class="brand-name">LanguageFarm</span>
			</a>
			<nav class="nav-links">
				<a href="#features">Features</a>
				<a href="#how">How it works</a>
				<a href="#pricing">Pricing</a>
			</nav>
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
				and harvest. Adaptive review, AI-generated practice, and real texts — all in one calm,
				focused workspace.
			</p>
			<div class="hero-cta">
				{#if data.session}
					<a class="btn btn-primary btn-lg" href="/dashboard">Open your farm</a>
				{:else}
					<a class="btn btn-primary btn-lg" href="/auth/signup">Start free</a>
					<a class="btn btn-secondary btn-lg" href="#how">See how it works</a>
				{/if}
			</div>
			<p class="hero-note">No credit card required · Works in 20+ languages</p>
		</div>
		<div class="hero-art" aria-hidden="true">
			<div class="plot plot-1">
				<div class="plot-label">Vocabulary</div>
				<div class="plot-bar"><span style="width: 82%"></span></div>
			</div>
			<div class="plot plot-2">
				<div class="plot-label">Grammar</div>
				<div class="plot-bar"><span style="width: 64%"></span></div>
			</div>
			<div class="plot plot-3">
				<div class="plot-label">Listening</div>
				<div class="plot-bar"><span style="width: 47%"></span></div>
			</div>
			<div class="plot plot-4">
				<div class="plot-label">Reading</div>
				<div class="plot-bar"><span style="width: 73%"></span></div>
			</div>
		</div>
	</section>

	<section class="features" id="features">
		<div class="section-head">
			<h2>Everything you need to grow</h2>
			<p>Tools built on research in second-language acquisition — not gamified busywork.</p>
		</div>
		<div class="feature-grid">
			<article class="feature">
				<div class="feature-icon">🌾</div>
				<h3>Smart spaced repetition</h3>
				<p>
					FSRS-based scheduling adapts to your memory, showing each item exactly when you're
					about to forget it.
				</p>
			</article>
			<article class="feature">
				<div class="feature-icon">✨</div>
				<h3>AI-generated practice</h3>
				<p>
					Worksheets, cloze exercises, and dialogues generated on demand from your own
					vocabulary and level.
				</p>
			</article>
			<article class="feature">
				<div class="feature-icon">📚</div>
				<h3>Read real texts</h3>
				<p>
					Import articles and stories. Tap any word to see meaning, conjugation, and add it
					straight to your review deck.
				</p>
			</article>
			<article class="feature">
				<div class="feature-icon">🎧</div>
				<h3>Listening plots</h3>
				<p>
					Train your ear with transcripts, shadowing tasks, and pronunciation feedback tuned
					to your target language.
				</p>
			</article>
			<article class="feature">
				<div class="feature-icon">🗂️</div>
				<h3>Organized your way</h3>
				<p>
					Drag-and-drop decks, tags, and activity sequences. Structure lessons like a
					teacher, study them like a learner.
				</p>
			</article>
			<article class="feature">
				<div class="feature-icon">📈</div>
				<h3>Honest progress</h3>
				<p>
					See retention, coverage, and time-on-task — the metrics that actually predict
					fluency, not vanity streaks.
				</p>
			</article>
		</div>
	</section>

	<section class="how" id="how">
		<div class="section-head">
			<h2>Three steps to a working practice</h2>
		</div>
		<ol class="steps">
			<li>
				<span class="step-num">1</span>
				<h3>Plant your plots</h3>
				<p>Pick a language and level. Import a deck, a text, or just a list of words you want to learn.</p>
			</li>
			<li>
				<span class="step-num">2</span>
				<h3>Water daily</h3>
				<p>Ten to twenty minutes a day of mixed review, reading, and generated activities — guided, not grinding.</p>
			</li>
			<li>
				<span class="step-num">3</span>
				<h3>Harvest fluency</h3>
				<p>Track what's stuck and what's slipping. Export decks, share progress, keep growing.</p>
			</li>
		</ol>
	</section>

	<section class="pricing" id="pricing">
		<div class="section-head">
			<h2>Simple pricing</h2>
			<p>Start free. Upgrade when it becomes part of your routine.</p>
		</div>
		<div class="plans">
			<div class="plan">
				<h3>Seedling</h3>
				<p class="price">Free</p>
				<ul>
					<li>Up to 3 languages</li>
					<li>Core SRS and reading tools</li>
					<li>50 AI activities / month</li>
				</ul>
				<a class="btn btn-secondary btn-md" href="/auth/signup">Start free</a>
			</div>
			<div class="plan plan-featured">
				<span class="badge">Most popular</span>
				<h3>Orchard</h3>
				<p class="price">$6<span>/mo</span></p>
				<ul>
					<li>Unlimited languages & decks</li>
					<li>Unlimited AI activities</li>
					<li>Audio, shadowing, imports</li>
					<li>Priority support</li>
				</ul>
				<a class="btn btn-primary btn-md" href="/auth/signup">Get Orchard</a>
			</div>
			<div class="plan">
				<h3>Classroom</h3>
				<p class="price">Contact</p>
				<ul>
					<li>For teachers and schools</li>
					<li>Shared decks and assignments</li>
					<li>Classroom analytics</li>
				</ul>
				<a class="btn btn-secondary btn-md" href="mailto:hello@languagefarm.app">Get in touch</a>
			</div>
		</div>
	</section>

	<section class="cta">
		<h2>Your next fluent language is one quiet habit away.</h2>
		{#if data.session}
			<a class="btn btn-primary btn-lg" href="/dashboard">Open your farm</a>
		{:else}
			<a class="btn btn-primary btn-lg" href="/auth/signup">Create a free account</a>
		{/if}
	</section>

	<footer class="footer">
		<div class="footer-inner">
			<div class="brand">
				<span class="brand-mark">🌱</span>
				<span class="brand-name">LanguageFarm</span>
			</div>
			<div class="footer-cols">
				<div>
					<h4>Product</h4>
					<a href="#features">Features</a>
					<a href="#pricing">Pricing</a>
					<a href="#how">How it works</a>
				</div>
				<div>
					<h4>Company</h4>
					<a href="/about">About</a>
					<a href="/blog">Blog</a>
					<a href="mailto:hello@languagefarm.app">Contact</a>
				</div>
				<div>
					<h4>Legal</h4>
					<a href="/privacy">Privacy</a>
					<a href="/terms">Terms</a>
				</div>
			</div>
		</div>
		<div class="footer-bottom">© {new Date().getFullYear()} LanguageFarm. Grown with care.</div>
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
		max-width: 1120px;
		margin: 0 auto;
		padding: 0.9rem 1.25rem;
		display: flex;
		align-items: center;
		gap: 2rem;
	}
	.brand {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		text-decoration: none;
		color: var(--color-text);
		font-weight: 600;
	}
	.brand-mark {
		font-size: 1.3rem;
	}
	.brand-name {
		font-size: 1.05rem;
		letter-spacing: -0.01em;
	}
	.nav-links {
		display: flex;
		gap: 1.5rem;
		margin-left: auto;
	}
	.nav-links a {
		color: #555;
		text-decoration: none;
		font-size: 0.92rem;
	}
	.nav-links a:hover {
		color: var(--color-primary);
	}
	.nav-actions {
		display: flex;
		gap: 0.5rem;
	}

	/* Hero */
	.hero {
		max-width: 1120px;
		margin: 0 auto;
		padding: 5rem 1.25rem 4rem;
		display: grid;
		grid-template-columns: 1.1fr 1fr;
		gap: 3rem;
		align-items: center;
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
		font-size: clamp(2rem, 4vw, 3.25rem);
		line-height: 1.1;
		letter-spacing: -0.02em;
		margin-bottom: 1.25rem;
	}
	.lede {
		font-size: 1.1rem;
		line-height: 1.6;
		color: #444;
		max-width: 36rem;
		margin-bottom: 2rem;
	}
	.hero-cta {
		display: flex;
		gap: 0.75rem;
		flex-wrap: wrap;
		margin-bottom: 1rem;
	}
	.hero-note {
		font-size: 0.85rem;
		color: #777;
	}

	.hero-art {
		background: linear-gradient(160deg, #eef5ec, #f7f0dd);
		border: 1px solid var(--color-border);
		border-radius: 16px;
		padding: 1.75rem;
		display: flex;
		flex-direction: column;
		gap: 1rem;
		box-shadow: 0 10px 40px -20px rgba(74, 124, 89, 0.3);
	}
	.plot {
		background: #fff;
		border: 1px solid var(--color-border);
		border-radius: 10px;
		padding: 0.9rem 1rem;
	}
	.plot-label {
		font-size: 0.85rem;
		font-weight: 500;
		margin-bottom: 0.5rem;
		color: #333;
	}
	.plot-bar {
		height: 8px;
		background: #f0efe9;
		border-radius: 999px;
		overflow: hidden;
	}
	.plot-bar span {
		display: block;
		height: 100%;
		background: linear-gradient(90deg, var(--color-primary), var(--color-primary-light));
		border-radius: 999px;
	}
	.plot-3 .plot-bar span {
		background: linear-gradient(90deg, var(--color-accent), #f2c56b);
	}

	/* Sections */
	section.features,
	section.how,
	section.pricing {
		max-width: 1120px;
		margin: 0 auto;
		padding: 4.5rem 1.25rem;
		width: 100%;
	}
	.section-head {
		text-align: center;
		margin-bottom: 2.5rem;
	}
	.section-head h2 {
		font-size: clamp(1.6rem, 2.5vw, 2.2rem);
		letter-spacing: -0.015em;
		margin-bottom: 0.5rem;
	}
	.section-head p {
		color: #555;
		font-size: 1rem;
	}

	/* Features grid */
	.feature-grid {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 1.25rem;
	}
	.feature {
		background: #fff;
		border: 1px solid var(--color-border);
		border-radius: 12px;
		padding: 1.5rem;
		transition: transform 0.15s, box-shadow 0.15s;
	}
	.feature:hover {
		transform: translateY(-2px);
		box-shadow: 0 10px 30px -15px rgba(0, 0, 0, 0.12);
	}
	.feature-icon {
		font-size: 1.6rem;
		margin-bottom: 0.75rem;
	}
	.feature h3 {
		font-size: 1.05rem;
		margin-bottom: 0.4rem;
		letter-spacing: -0.01em;
	}
	.feature p {
		font-size: 0.92rem;
		color: #555;
		line-height: 1.55;
	}

	/* Steps */
	.steps {
		list-style: none;
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 1.5rem;
		counter-reset: step;
	}
	.steps li {
		position: relative;
		padding: 1.5rem;
		background: #fff;
		border: 1px solid var(--color-border);
		border-radius: 12px;
	}
	.step-num {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 2rem;
		height: 2rem;
		border-radius: 999px;
		background: var(--color-primary);
		color: #fff;
		font-weight: 600;
		margin-bottom: 0.75rem;
	}
	.steps h3 {
		font-size: 1.05rem;
		margin-bottom: 0.35rem;
	}
	.steps p {
		color: #555;
		font-size: 0.92rem;
		line-height: 1.55;
	}

	/* Pricing */
	.plans {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 1.25rem;
	}
	.plan {
		position: relative;
		background: #fff;
		border: 1px solid var(--color-border);
		border-radius: 12px;
		padding: 1.75rem;
		display: flex;
		flex-direction: column;
	}
	.plan-featured {
		border-color: var(--color-primary);
		box-shadow: 0 10px 40px -20px rgba(74, 124, 89, 0.35);
	}
	.badge {
		position: absolute;
		top: -0.6rem;
		right: 1rem;
		background: var(--color-primary);
		color: #fff;
		font-size: 0.72rem;
		padding: 0.25rem 0.6rem;
		border-radius: 999px;
		font-weight: 500;
	}
	.plan h3 {
		font-size: 1rem;
		color: #555;
		font-weight: 500;
		margin-bottom: 0.4rem;
	}
	.price {
		font-size: 2rem;
		font-weight: 600;
		letter-spacing: -0.02em;
		margin-bottom: 1rem;
	}
	.price span {
		font-size: 0.95rem;
		font-weight: 400;
		color: #888;
	}
	.plan ul {
		list-style: none;
		margin-bottom: 1.5rem;
		flex: 1;
	}
	.plan ul li {
		padding: 0.35rem 0;
		font-size: 0.92rem;
		color: #444;
		border-bottom: 1px dashed #eee;
	}
	.plan ul li:last-child {
		border-bottom: none;
	}

	/* CTA */
	.cta {
		background: linear-gradient(160deg, var(--color-primary), var(--color-primary-light));
		color: #fff;
		text-align: center;
		padding: 4.5rem 1.25rem;
	}
	.cta h2 {
		font-size: clamp(1.5rem, 2.5vw, 2rem);
		margin-bottom: 1.5rem;
		letter-spacing: -0.015em;
		max-width: 36rem;
		margin-left: auto;
		margin-right: auto;
	}
	.cta .btn-primary {
		background: #fff;
		color: var(--color-primary);
	}
	.cta .btn-primary:hover {
		background: #f5f5f0;
	}

	/* Footer */
	.footer {
		border-top: 1px solid var(--color-border);
		background: #fff;
		margin-top: auto;
	}
	.footer-inner {
		max-width: 1120px;
		margin: 0 auto;
		padding: 3rem 1.25rem 1.5rem;
		display: grid;
		grid-template-columns: 1fr 2fr;
		gap: 2rem;
	}
	.footer-cols {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 2rem;
	}
	.footer-cols h4 {
		font-size: 0.85rem;
		text-transform: uppercase;
		letter-spacing: 0.08em;
		color: #888;
		margin-bottom: 0.75rem;
		font-weight: 600;
	}
	.footer-cols a {
		display: block;
		color: #444;
		text-decoration: none;
		font-size: 0.92rem;
		padding: 0.25rem 0;
	}
	.footer-cols a:hover {
		color: var(--color-primary);
	}
	.footer-bottom {
		max-width: 1120px;
		margin: 0 auto;
		padding: 1rem 1.25rem 2rem;
		font-size: 0.85rem;
		color: #888;
		border-top: 1px solid #f0f0ec;
	}

	/* Responsive */
	@media (max-width: 860px) {
		.nav-links {
			display: none;
		}
		.hero {
			grid-template-columns: 1fr;
			padding-top: 3rem;
		}
		.feature-grid,
		.steps,
		.plans {
			grid-template-columns: 1fr;
		}
		.footer-inner {
			grid-template-columns: 1fr;
		}
		.footer-cols {
			grid-template-columns: repeat(3, 1fr);
		}
	}
</style>
