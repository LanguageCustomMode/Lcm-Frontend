<script lang="ts">
	import { goto } from '$app/navigation';
	import { apiPost } from '$lib/api';

	let step = $state(1);
	const totalSteps = 4;

	// Step 1: Basics
	let name = $state('');
	let l2_target = $state('');
	let proficiency = $state('A1');
	let description = $state('');

	// Step 2: Learning Goals
	let primary_goal = $state('');
	let interests = $state('');
	let weak_areas = $state('');
	let daily_time = $state('15');

	// Step 3: Content Preferences
	let preferred_formats = $state<string[]>([]);
	let use_readings = $state(false);
	let conversation_focus = $state(false);
	let grammar_depth = $state('moderate');

	// Step 4: Kit Selection
	let kit_type = $state('starter');

	let error = $state('');
	let loading = $state(false);

	const kits = [
		{ value: 'starter', label: 'Starter Pack', desc: 'Balanced mix of vocabulary, grammar, and conversation activities.' },
		{ value: 'grammar_focus', label: 'Grammar Focus', desc: 'Heavy on grammar theory, processing, and manipulation drills.' },
		{ value: 'conversation_focus', label: 'Conversation Focus', desc: 'Dialogue, writing practice, and interactive activities.' },
		{ value: 'reading_heavy', label: 'Reading Heavy', desc: 'Reading-centered with vocabulary and cultural knowledge support.' },
	];

	const formatOptions = [
		'vocabulary', 'grammar_theory', 'grammar_processing', 'cultural_knowledge',
		'template_sentences', 'fundamentals', 'reading', 'dialogue',
		'writing_practice', 'pronunciation', 'listening',
	];

	const toggleFormat = (f: string) => {
		if (preferred_formats.includes(f)) {
			preferred_formats = preferred_formats.filter(x => x !== f);
		} else {
			preferred_formats = [...preferred_formats, f];
		}
	};

	async function handleCreate() {
		loading = true;
		error = '';
		try {
			const questionnaire = {
				primary_goal,
				interests,
				weak_areas,
				daily_time,
				preferred_formats,
				use_readings,
				conversation_focus,
				grammar_depth,
			};
			const plot = await apiPost<{ id: string }>('/plots', {
				name, l2_target, proficiency, description,
				questionnaire,
				kit_type,
			});

			// Trigger batch design to auto-populate ideas
			try {
				await apiPost('/llm/design/batch', {
					plot_id: plot.id,
					questionnaire,
					kit_type,
				});
			} catch {
				// Non-blocking — ideas can be generated later
			}

			goto(`/dashboard/plots/${plot.id}`);
		} catch (e: any) {
			error = e.detail || e.message;
			loading = false;
		}
	}
</script>

<h1>Create New Plot</h1>
<div class="stepper">
	{#each Array.from({length: totalSteps}, (_, i) => i + 1) as s}
		<div class="step-dot" class:active={step === s} class:done={step > s}>{s}</div>
	{/each}
</div>

<form onsubmit={(e) => { e.preventDefault(); if (step < totalSteps) step++; else handleCreate(); }}>
	{#if step === 1}
		<h2>Language Basics</h2>
		<label>Plot Name <input bind:value={name} placeholder="e.g. Japanese Journey" required /></label>
		<label>Target Language <input bind:value={l2_target} placeholder="e.g. Spanish, Japanese" required /></label>
		<label>Proficiency Level
			<select bind:value={proficiency}>
				<option value="A1">A1 - Beginner</option>
				<option value="A2">A2 - Elementary</option>
				<option value="B1">B1 - Intermediate</option>
				<option value="B2">B2 - Upper Intermediate</option>
				<option value="C1">C1 - Advanced</option>
				<option value="C2">C2 - Mastery</option>
			</select>
		</label>
		<label>Description <textarea bind:value={description} placeholder="What is this plot about? (optional)" rows="2"></textarea></label>

	{:else if step === 2}
		<h2>Learning Goals</h2>
		<label>Primary Goal <input bind:value={primary_goal} placeholder="e.g. Hold basic conversations, pass JLPT N3" /></label>
		<label>Interests & Topics <textarea bind:value={interests} placeholder="What topics interest you? (food, travel, business, anime...)" rows="2"></textarea></label>
		<label>Weak Areas <textarea bind:value={weak_areas} placeholder="What do you struggle with? (grammar, listening, pronunciation...)" rows="2"></textarea></label>
		<label>Daily Study Time
			<select bind:value={daily_time}>
				<option value="5">5 minutes</option>
				<option value="15">15 minutes</option>
				<option value="30">30 minutes</option>
				<option value="60">1 hour</option>
				<option value="120">2+ hours</option>
			</select>
		</label>

	{:else if step === 3}
		<h2>Content Preferences</h2>
		<p class="subtitle">Select activity formats you'd like to use:</p>
		<div class="format-grid">
			{#each formatOptions as f}
				<button type="button" class:selected={preferred_formats.includes(f)} onclick={() => toggleFormat(f)}>
					{f.replace(/_/g, ' ')}
				</button>
			{/each}
		</div>
		<label class="checkbox"><input type="checkbox" bind:checked={use_readings} /> I want to use reading materials</label>
		<label class="checkbox"><input type="checkbox" bind:checked={conversation_focus} /> I want lots of conversation practice</label>
		<label>Grammar Depth
			<select bind:value={grammar_depth}>
				<option value="light">Light — just enough to communicate</option>
				<option value="moderate">Moderate — understand the rules</option>
				<option value="deep">Deep — thorough grammatical knowledge</option>
			</select>
		</label>

	{:else if step === 4}
		<h2>Choose Your Kit</h2>
		<p class="subtitle">Select an initialization kit to pre-populate your plot with activity ideas:</p>
		<div class="kit-grid">
			{#each kits as kit}
				<button type="button" class="kit-card" class:selected={kit_type === kit.value} onclick={() => kit_type = kit.value}>
					<strong>{kit.label}</strong>
					<p>{kit.desc}</p>
				</button>
			{/each}
		</div>
	{/if}

	{#if error}<p class="error">{error}</p>{/if}

	<div class="nav-buttons">
		{#if step > 1}
			<button type="button" class="secondary" onclick={() => step--}>Back</button>
		{/if}
		<button type="submit" disabled={loading}>
			{#if step < totalSteps}Next{:else}{loading ? 'Creating...' : 'Create Plot'}{/if}
		</button>
	</div>
</form>

<style>
	form {
		display: grid;
		gap: 0.75rem;
		max-width: 600px;
	}

	h2 { margin: 0; }

	.subtitle {
		font-size: 0.85rem;
		color: #555;
		margin: 0;
	}

	label {
		display: grid;
		gap: 0.25rem;
		font-size: 0.85rem;
		color: #555;
	}

	label.checkbox {
		flex-direction: row;
		display: flex;
		align-items: center;
		gap: 0.5rem;
		cursor: pointer;
	}

	input, select, textarea {
		border: 1px solid var(--color-border);
		border-radius: var(--radius);
		padding: 0.45rem 0.6rem;
	}

	.stepper {
		display: flex;
		gap: 0.5rem;
		margin-bottom: 1rem;
	}

	.step-dot {
		width: 28px;
		height: 28px;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 0.75rem;
		font-weight: 600;
		border: 2px solid var(--color-border);
		color: #999;
	}

	.step-dot.active {
		border-color: var(--color-primary);
		color: var(--color-primary);
		background: #f0f4e8;
	}

	.step-dot.done {
		border-color: var(--color-primary);
		background: var(--color-primary);
		color: white;
	}

	.format-grid {
		display: flex;
		flex-wrap: wrap;
		gap: 0.4rem;
	}

	.format-grid button {
		border: 1px solid var(--color-border);
		background: #fff;
		border-radius: 999px;
		padding: 0.3rem 0.6rem;
		font-size: 0.75rem;
		text-transform: capitalize;
		cursor: pointer;
	}

	.format-grid button.selected {
		background: var(--color-primary);
		color: white;
		border-color: transparent;
	}

	.kit-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
		gap: 0.75rem;
	}

	.kit-card {
		border: 2px solid var(--color-border);
		background: #fff;
		border-radius: var(--radius);
		padding: 0.8rem;
		text-align: left;
		cursor: pointer;
		display: grid;
		gap: 0.3rem;
	}

	.kit-card.selected {
		border-color: var(--color-primary);
		background: #f6fae8;
	}

	.kit-card p {
		font-size: 0.8rem;
		color: #666;
		margin: 0;
	}

	.nav-buttons {
		display: flex;
		gap: 0.5rem;
		justify-content: flex-end;
	}

	button[type="submit"], .nav-buttons button {
		border: 1px solid var(--color-border);
		background: var(--color-primary);
		color: white;
		border-radius: 999px;
		padding: 0.4rem 1rem;
		cursor: pointer;
	}

	.secondary {
		background: #fff !important;
		color: #333 !important;
	}

	.error { color: #b42318; }
</style>
