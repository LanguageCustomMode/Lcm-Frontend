# LanguageFarm - Implementation Plan

## Context

We're building a language learning website with a farming/gardening metaphor. Users create "plots" (learning plans), plant "activities" (study units) in a grid, and grow them through spaced repetition and LLM-powered tutoring. The system uses DSPy for LLM orchestration, py-fsrs for SRS, and Supabase for auth/database/vector storage.

**Two separate repos**: SvelteKit frontend (Vercel) + FastAPI backend (Railway).

---

## Architecture Overview

```
Browser
  |
  v
SvelteKit (Vercel)              FastAPI (Railway)
  |  Supabase Auth cookie            ^
  |  /api/* proxy routes  ---------> |
  |                                  |  supabase-py (service role)
  v                                  v
Supabase (Auth + Postgres + pgvector + Storage)
```

- **Auth**: SvelteKit handles login/signup via `@supabase/ssr`. Access token forwarded to FastAPI in `Authorization: Bearer` header. FastAPI verifies JWT against Supabase JWT secret.
- **API proxy**: SvelteKit `hooks.server.ts` intercepts `/api/*` requests, forwards to Railway FastAPI URL. Browser never talks to backend directly — no CORS issues.

---

## A. API Interface (Frontend <-> Backend)

### A.1 User Profile & Settings
```
GET    /users/me                    -> { id, username, email, xp, coins, level }
PATCH  /users/me                    -> Body: { username?, display_name? }
GET    /users/me/settings           -> { llm_provider, llm_api_key_set: bool }
PUT    /users/me/settings           -> Body: { llm_provider, llm_api_key }  (key Fernet-encrypted at rest)
DELETE /users/me/settings/api-key   -> 204
```

### A.2 Plots
```
GET    /plots                       -> Query: ?archived=false  -> plot list with activity_count
POST   /plots                       -> Body: { name, description, l2_target, proficiency, grid_rows, grid_cols }
GET    /plots/{plot_id}             -> full plot + nested activity summaries + grid layout
PATCH  /plots/{plot_id}             -> partial update (name, description, l2_target, proficiency, grid size, archived)
DELETE /plots/{plot_id}             -> 204 (soft-delete)
GET    /plots/{plot_id}/composition -> { by_tier: {...}, by_modality: {...}, total_cards, due_cards }
PATCH  /plots/{plot_id}/grid        -> Body: { activities: [{ activity_id, grid_positions }] }  (drag-drop save)
```

### A.3 Plot Reference Texts (RAG)
```
POST   /plots/{plot_id}/references          -> multipart file or { text, title } -> 202 (chunks + embeds async)
GET    /plots/{plot_id}/references          -> list with status
DELETE /plots/{plot_id}/references/{ref_id} -> 204
GET    /plots/{plot_id}/references/{ref_id}/chunks -> ?q=search&limit=10 -> similarity results
```

### A.4 Plot Ideas/Media
```
GET    /plots/{plot_id}/ideas    -> list
POST   /plots/{plot_id}/ideas    -> { content, type: "media"|"idea"|"note" }
DELETE /plots/{plot_id}/ideas/{idea_id} -> 204
```

### A.5 Activities
```
GET    /plots/{plot_id}/activities   -> ?type=vocabulary&sort=ripeness_desc -> list with stats
POST   /plots/{plot_id}/activities   -> { name, type, subtype?, config, grid_positions, parent_activity_id? }
GET    /activities/{activity_id}     -> full activity + config + stats
PATCH  /activities/{activity_id}     -> partial update
DELETE /activities/{activity_id}     -> 204 (soft-delete)
GET    /activities/{activity_id}/stats -> { level, xp, card counts, ripeness, retention, streak }
```

**ActivityType enum**: `vocabulary`, `grammar_theory`, `grammar_processing`, `cultural_knowledge`, `template_sentences`, `grammar_manipulations`, `fundamentals`, `reading`, `dialogue`, `writing_practice`, `pronunciation`, `listening`, `errors_srs`, `generic_conversation`

### A.6 Cards (SRS)
```
GET    /activities/{activity_id}/cards          -> ?status=due|new|learning|review&limit=50
POST   /activities/{activity_id}/cards          -> { cards: [{ front, back, extra_fields? }] }  batch max 100
PATCH  /cards/{card_id}                         -> { front?, back?, extra_fields? }
DELETE /cards/{card_id}                         -> 204
POST   /cards/{card_id}/review                  -> { rating: 1-4 } -> updated schedule + xp_earned
POST   /activities/{activity_id}/review-session -> { limit?: 20 } -> { session_id, cards }
POST   /review-sessions/{session_id}/complete   -> { reviews: [{ card_id, rating, time_ms }] } -> summary
```

### A.7 LLM - Design (Chatbot)
```
POST   /llm/design/start                       -> { plot_id, activity_type?, parent_activity_id? } -> { conversation_id, assistant_message }
POST   /llm/design/{conversation_id}/message    -> { message } -> SSE stream (token, suggestion, done events)
POST   /llm/design/{conversation_id}/accept     -> { spec } -> { activity_id }
GET    /llm/design/{conversation_id}            -> conversation state
```

### A.8 LLM - Generate (Content Creation)
```
POST   /llm/generate/{activity_id}              -> { instruction?, count? } -> SSE stream (progress, done)
POST   /llm/generate/{activity_id}/preview      -> { count: 1-5 } -> preview_cards
POST   /llm/generate/{activity_id}/confirm      -> { card_ids } -> saved count
```

### A.9 LLM - Interact (Tutoring)
```
POST   /llm/interact/{activity_id}/start        -> { card_id?, mode? } -> { session_id, opening_message }
POST   /llm/interact/{session_id}/message       -> { message, audio_url? } -> SSE (token, correction, tts, score, done)
POST   /llm/interact/{session_id}/end           -> { summary, errors_collected, xp_earned }
```

### A.10 Extensions
```
GET    /activities/{activity_id}/extensions      -> valid extension options
POST   /activities/{activity_id}/extend          -> { target_type } -> starts design conversation with extension context
```

### A.11 Gamification
```
GET    /users/me/gamification          -> { xp, level, coins, xp_to_next_level }
GET    /users/me/gamification/history  -> ?days=30 -> daily XP/cards/time
```

---

## B. Database Schema (Supabase PostgreSQL)

### B.1 Core Tables

```sql
-- Auto-created on auth signup via trigger
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username TEXT UNIQUE NOT NULL,
    display_name TEXT,
    xp BIGINT NOT NULL DEFAULT 0,
    coins BIGINT NOT NULL DEFAULT 0,
    level INT NOT NULL DEFAULT 1,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.user_settings (
    user_id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
    llm_provider TEXT CHECK (llm_provider IN ('openai', 'anthropic', 'google')),
    llm_api_key_encrypted BYTEA,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.plots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT DEFAULT '',
    l2_target TEXT NOT NULL,
    proficiency TEXT NOT NULL CHECK (proficiency IN ('A1','A2','B1','B2','C1','C2')),
    grid_rows INT NOT NULL DEFAULT 3,
    grid_cols INT NOT NULL DEFAULT 4,
    archived BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at TIMESTAMPTZ
);

CREATE TABLE public.plot_ideas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    plot_id UUID NOT NULL REFERENCES public.plots(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('media', 'idea', 'note')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TYPE activity_type AS ENUM (
    'vocabulary', 'grammar_theory', 'grammar_processing', 'cultural_knowledge',
    'template_sentences', 'grammar_manipulations', 'fundamentals',
    'reading', 'dialogue', 'writing_practice', 'pronunciation', 'listening',
    'errors_srs', 'generic_conversation'
);

CREATE TABLE public.activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    plot_id UUID NOT NULL REFERENCES public.plots(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    type activity_type NOT NULL,
    subtype TEXT,
    config JSONB NOT NULL DEFAULT '{}',
    grid_positions JSONB NOT NULL DEFAULT '[]',   -- [[row,col], ...]
    parent_activity_id UUID REFERENCES public.activities(id) ON DELETE SET NULL,
    xp BIGINT NOT NULL DEFAULT 0,
    level INT NOT NULL DEFAULT 1,
    card_cap INT,   -- 20 normal, 5 complex, 50 high-rep; null = unlimited
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at TIMESTAMPTZ
);

CREATE TABLE public.cards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    activity_id UUID NOT NULL REFERENCES public.activities(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    front TEXT NOT NULL,
    back TEXT NOT NULL,
    extra_fields JSONB NOT NULL DEFAULT '{}',
    notes TEXT,
    -- FSRS state
    due TIMESTAMPTZ NOT NULL DEFAULT now(),
    stability DOUBLE PRECISION NOT NULL DEFAULT 0,
    difficulty DOUBLE PRECISION NOT NULL DEFAULT 0,
    elapsed_days INT NOT NULL DEFAULT 0,
    scheduled_days INT NOT NULL DEFAULT 0,
    reps INT NOT NULL DEFAULT 0,
    lapses INT NOT NULL DEFAULT 0,
    state INT NOT NULL DEFAULT 0,   -- 0=New, 1=Learning, 2=Review, 3=Relearning
    last_review TIMESTAMPTZ,
    buried BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.review_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    card_id UUID NOT NULL REFERENCES public.cards(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    activity_id UUID NOT NULL REFERENCES public.activities(id) ON DELETE CASCADE,
    rating INT NOT NULL CHECK (rating BETWEEN 1 AND 4),
    state INT NOT NULL,
    due TIMESTAMPTZ NOT NULL,
    stability DOUBLE PRECISION NOT NULL,
    difficulty DOUBLE PRECISION NOT NULL,
    elapsed_days INT NOT NULL,
    scheduled_days INT NOT NULL,
    review_time_ms INT,
    reviewed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

### B.2 Interaction & Errors

```sql
CREATE TABLE public.interaction_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    activity_id UUID NOT NULL REFERENCES public.activities(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    card_id UUID REFERENCES public.cards(id),
    mode TEXT NOT NULL CHECK (mode IN ('conversation','roleplay','pronunciation','comprehension')),
    messages JSONB NOT NULL DEFAULT '[]',
    errors JSONB NOT NULL DEFAULT '[]',
    summary TEXT,
    xp_earned INT NOT NULL DEFAULT 0,
    started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    ended_at TIMESTAMPTZ
);

CREATE TABLE public.error_sources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    card_id UUID NOT NULL REFERENCES public.cards(id) ON DELETE CASCADE,
    interaction_session_id UUID NOT NULL REFERENCES public.interaction_sessions(id) ON DELETE CASCADE,
    error_type TEXT NOT NULL,
    original_text TEXT NOT NULL,
    corrected_text TEXT NOT NULL,
    explanation TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

### B.3 RAG / Vector Storage

```sql
CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE public.reference_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    plot_id UUID NOT NULL REFERENCES public.plots(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    original_text TEXT,
    status TEXT NOT NULL DEFAULT 'processing' CHECK (status IN ('processing', 'ready', 'error')),
    chunk_count INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.document_chunks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id UUID NOT NULL REFERENCES public.reference_documents(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    plot_id UUID NOT NULL,
    content TEXT NOT NULL,
    chunk_index INT NOT NULL,
    embedding vector(1536) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_chunks_embedding ON public.document_chunks
    USING hnsw (embedding vector_cosine_ops) WITH (m = 16, ef_construction = 64);

-- Similarity search function
CREATE FUNCTION match_chunks(query_embedding vector(1536), p_plot_id UUID, match_count INT DEFAULT 5)
RETURNS TABLE (id UUID, content TEXT, similarity FLOAT) AS $$
  SELECT id, content, 1 - (embedding <=> query_embedding) AS similarity
  FROM public.document_chunks
  WHERE plot_id = p_plot_id
  ORDER BY embedding <=> query_embedding
  LIMIT match_count;
$$ LANGUAGE sql SECURITY DEFINER;
```

### B.4 LLM Conversations

```sql
CREATE TABLE public.design_conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    plot_id UUID NOT NULL REFERENCES public.plots(id) ON DELETE CASCADE,
    activity_type activity_type,
    parent_activity_id UUID REFERENCES public.activities(id),
    messages JSONB NOT NULL DEFAULT '[]',
    current_spec JSONB,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'accepted', 'abandoned')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

### B.5 Gamification

```sql
CREATE TABLE public.daily_stats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    xp_earned BIGINT NOT NULL DEFAULT 0,
    coins_earned BIGINT NOT NULL DEFAULT 0,
    cards_reviewed INT NOT NULL DEFAULT 0,
    time_spent_ms BIGINT NOT NULL DEFAULT 0,
    UNIQUE(user_id, date)
);

CREATE TABLE public.level_thresholds (
    level INT PRIMARY KEY,
    xp_required BIGINT NOT NULL
);
-- Seed: 1->0, 2->100, 3->300, 4->600, 5->1000, ... (quadratic growth)
```

### B.6 Key Indexes

```sql
CREATE INDEX idx_plots_user ON public.plots(user_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_activities_plot ON public.activities(plot_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_activities_user ON public.activities(user_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_cards_activity ON public.cards(activity_id);
CREATE INDEX idx_cards_due ON public.cards(user_id, due) WHERE state != 0;
CREATE INDEX idx_review_logs_user_date ON public.review_logs(user_id, reviewed_at);
CREATE INDEX idx_review_logs_card ON public.review_logs(card_id);
CREATE INDEX idx_daily_stats_user_date ON public.daily_stats(user_id, date DESC);
```

### B.7 Row-Level Security

Enable RLS on all tables. Pattern: `USING (auth.uid() = user_id)` (or `= id` for profiles).

```sql
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own_profile" ON public.profiles FOR ALL USING (auth.uid() = id);
-- Repeat for: user_settings, plots, plot_ideas, activities, cards, review_logs,
-- interaction_sessions, error_sources, reference_documents, document_chunks,
-- design_conversations, daily_stats
-- level_thresholds: SELECT USING (true) only
```

### B.8 Triggers

- **Auto-create profile**: On `auth.users` INSERT, insert into `profiles` using `raw_user_meta_data->>'username'`
- **XP on review**: On `review_logs` INSERT, award XP to profile + activity, upsert daily_stats
- **Ripeness function**: `calculate_ripeness(activity_id)` returns fraction of due cards

---

## C. Backend Directory Structure

```
languagefarm-backend/
  pyproject.toml
  .env.example
  Dockerfile
  Procfile                         # web: uvicorn app.main:app --host 0.0.0.0 --port $PORT
  app/
    __init__.py
    main.py                        # App factory, lifespan, middleware
    config.py                      # pydantic-settings
    auth/
      dependencies.py              # get_current_user (JWT verify)
      jwt.py                       # Supabase JWT decode
    db/
      client.py                    # Supabase service-role client singleton
      queries/
        users.py, plots.py, activities.py, cards.py, reviews.py, references.py
    models/                        # Pydantic request/response schemas
      user.py, plot.py, activity.py, card.py, review.py, llm.py, gamification.py, reference.py
    routers/
      users.py, plots.py, activities.py, cards.py, reviews.py, references.py,
      llm_design.py, llm_generate.py, llm_interact.py, extensions.py, gamification.py
    services/
      plot_service.py, activity_service.py, card_service.py, review_service.py,
      reference_service.py, gamification_service.py, extension_service.py
    llm/
      client_factory.py            # Creates dspy.LM from user's provider + API key
      rag.py                       # Embedding generation + vector search
      design/
        signatures.py, modules.py, pipeline.py
      generate/
        signatures.py, modules.py, pipeline.py
      interact/
        signatures.py, modules.py, pipeline.py
    srs/
      scheduler.py                 # py-fsrs wrapper: Card <-> DB row conversion
    utils/
      crypto.py                    # Fernet encrypt/decrypt for API keys
      embedding.py                 # Embedding generation
      chunking.py                  # Text chunking for RAG
      sse.py                       # EventSourceResponse helpers
  tests/
    conftest.py
    test_auth.py, test_plots.py, test_activities.py, test_cards.py,
    test_reviews.py, test_llm.py, test_srs.py
```

---

## D. Frontend Route Structure (SvelteKit)

```
languagefarm-frontend/
  svelte.config.js                 # adapter-vercel
  .env.example                     # PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY, FASTAPI_URL
  src/
    app.html, app.css
    hooks.server.ts                # Supabase SSR auth + /api/* proxy to FastAPI
    lib/
      supabase.ts                  # createBrowserClient / createServerClient
      api.ts                       # Typed fetch wrapper for /api/* calls
      stores/
        user.ts, plot.ts, session.ts
      types/
        index.ts, activity.ts, card.ts, plot.ts
      utils/
        sse.ts                     # EventSource client wrapper
        grid.ts                    # Grid layout + contiguity validation
      components/
        ui/                        # Button, Input, Modal, etc.
        farm/
          FarmGrid.svelte          # Drag-and-drop grid (SvelteDnD)
          ActivityTile.svelte      # Shows name + ripeness color
          Toolbar.svelte           # Activity type tools
        chat/
          ChatWindow.svelte        # Design + interact chat
          ChatMessage.svelte
          ChatInput.svelte
        review/
          FlashcardReview.svelte   # Card flip + rating
          ReviewProgress.svelte
          ReviewSummary.svelte
        activity/
          ActivityEditor.svelte
          ActivityBrowser.svelte
          CardEditor.svelte
        composition/
          PlotComposition.svelte   # Tier/modality distribution charts
    routes/
      +layout.svelte, +layout.server.ts
      +page.svelte                 # Landing page
      auth/
        login/+page.svelte
        signup/+page.svelte
        callback/+server.ts
      dashboard/
        +layout.svelte             # Auth guard + sidebar
        +layout.server.ts          # Load profile + plot list
        +page.svelte               # Plot selection / creation
        plots/
          new/+page.svelte
          [plotId]/
            +layout.svelte, +layout.server.ts
            +page.svelte           # Farm grid view (main)
            settings/+page.svelte
            composition/+page.svelte
            references/+page.svelte
            design/+page.svelte    # Design chatbot
            activities/
              [activityId]/
                +page.svelte       # Activity detail / card browser
                edit/+page.svelte
                review/+page.svelte
                interact/+page.svelte
                extend/+page.svelte
        settings/+page.svelte      # User settings (password, API keys)
      api/
        [...path]/+server.ts       # Catch-all proxy to FastAPI
```

---

## E. UX Flows

### E.1 Onboarding
1. Landing page -> "Get Started" -> `/auth/signup`
2. Fill username, email, password -> Supabase creates user, trigger creates profile
3. Redirect to `/dashboard` -> empty state with "Create Your First Plot" card
4. Click -> `/dashboard/plots/new` -> set name, L2 target, proficiency
5. Redirect to farm grid (empty 3x4) with onboarding tooltip

### E.2 Creating Activity from Scratch
1. From farm grid, click activity type tool in toolbar, then click empty square
2. Navigate to design chat. System: "What would you like to study?"
3. User describes goal. Chatbot asks clarifying questions (SSE streaming).
4. Chatbot proposes activity spec with accept/modify UI
5. User accepts -> activity created, card generation starts (SSE progress)
6. Return to grid. New tile appears at selected position.

### E.3 Extending an Existing Activity
1. Click activity type tool, then click existing activity tile
2. Extension confirmation: "Add a dialogue to practice this vocabulary?"
3. Yes -> design chat opens pre-seeded with parent activity context
4. User refines -> accept -> new activity created with parent link

### E.4 Running Flashcard Review
1. Click activity tile -> see stats (due/new/learning) -> "Start Review"
2. Card front shown -> "Show Answer" -> back revealed + 4 rating buttons (Again/Hard/Good/Easy)
3. Rate -> card animates away -> next card. Progress bar updates.
4. All done -> batch submit -> summary (XP earned, accuracy, next due)

### E.5 Running Interaction Tutor
1. Click interaction activity (reading/dialogue/pronunciation) -> "Practice"
2. Tutor sets scene, streams opening message
3. User types in L2. Tutor streams response with inline corrections.
4. Each turn: `{ error, correction, error_type }` extracted and displayed
5. End session -> summary with errors collected -> errors auto-added to Errors SRS activity

### E.6 Browsing/Editing Activity
1. Activity detail page: name, type, level, XP bar, stats
2. Paginated card list (front, back, state, due date)
3. Inline edit cards, add cards manually, "Generate More" button
4. Bury/unbury cards within capacity window
5. Filter/sort by state, difficulty, creation date

---

## F. DSPy Pipeline Architecture

### F.1 Client Factory
`app/llm/client_factory.py`: Decrypts user's stored API key, creates `dspy.LM` for their provider. Each request handler calls `dspy.configure(lm=lm)` scoped to the request.

### F.2 RAG Context
`app/llm/rag.py`: Embeds query -> cosine similarity search on `document_chunks` scoped to plot -> returns top-k chunks.

Every pipeline receives:
- `plot_context`: l2_target, proficiency, description, ideas/media list
- `rag_context`: relevant reference text chunks
- `activity_context`: existing activity config + sample cards (for extensions)

### F.3 Design Pipeline
- **Signature**: plot_context + rag_context + conversation_history + user_message -> response + activity_spec
- **Module**: `dspy.ChainOfThought` wrapper
- Uses `dspy.streamify()` for SSE token streaming
- When activity_spec is non-empty, UI renders accept/modify controls

### F.4 Generate Pipeline
- One signature per activity type (vocabulary, reading, dialogue, grammar, etc.)
- Loads existing cards to avoid duplicates
- Generates cards in batches, validates, bulk inserts
- SSE reports progress (card N of M)

### F.5 Interact Pipeline
- **Signature**: activity config + session context + conversation history + user_message -> tutor_response + errors_json + sub_situation_complete
- Pronunciation variant: compares expected text to STT transcription
- Errors auto-collected into plot's Errors SRS activity at session end

### F.6 Extension Map
Lookup of valid (source_type, target_type) combinations with template prompts:
- (vocabulary, dialogue) -> "Create a dialogue using these vocabulary items"
- (reading, vocabulary) -> "Extract vocabulary from this passage"
- (any, listening) -> "Add listening practice for this content"
- (any, pronunciation) -> "Add pronunciation practice for this content"
- etc.

Pre-seeds the Design conversation with source activity context + extension template.

---

## G. Verification Plan

### G.1 Backend Tests
- **Unit**: JWT auth, py-fsrs roundtrip, Fernet encrypt/decrypt, text chunking, Pydantic validation
- **Integration**: All CRUD routes with FastAPI TestClient, review flow (card -> FSRS -> XP), RAG pipeline (upload -> chunk -> embed -> search)
- **SSE**: Mock DSPy module, verify event structure and ordering

### G.2 Frontend Tests
- **Component**: Farm grid drag-drop + contiguity validation, card flip + rating, chat message rendering
- **Integration**: Auth flow redirects, SSE client token accumulation

### G.3 E2E (Playwright)
1. Signup -> create plot -> verify dashboard
2. Design chatbot -> accept -> activity on grid
3. Manual card creation -> verify in list
4. Review session -> rate -> verify XP
5. Interaction tutor -> verify error collection
6. Extension flow -> verify parent link
7. Grid drag-drop -> refresh -> verify persistence

### G.4 Deployment Verification
1. Supabase: run migrations, verify RLS, test pgvector
2. Railway: deploy FastAPI, verify health + SSE streaming
3. Vercel: deploy SvelteKit, verify /api proxy + auth cookies
4. Confirm browser never directly calls Railway

---

## H. Implementation Sequencing

**Phase 1 - Foundation**: Supabase schema + RLS, FastAPI skeleton with auth, SvelteKit skeleton with Supabase SSR + proxy hook. Deploy to verify connectivity.

**Phase 2 - Core CRUD**: Profile/settings, Plot CRUD, Activity CRUD (no LLM), Card CRUD (manual), Farm grid with drag-and-drop.

**Phase 3 - SRS Engine**: py-fsrs scheduler wrapper, review session endpoints, flashcard review UI, ripeness calculation, gamification (XP/levels/coins/daily stats).

**Phase 4 - LLM Pipelines**: Client factory + API key management, RAG (upload/chunk/embed/search), Design pipeline, Generate pipeline, Interact pipeline, SSE streaming.

**Phase 5 - Extensions & Polish**: Extension system, plot composition view, Errors SRS auto-collection, plot archiving.

**Phase 6 - Testing & Hardening**: Full test suite, security audit, production deployment.

---

## Critical Files

| File | Purpose |
|------|---------|
| `backend/app/auth/dependencies.py` | JWT verification, every protected endpoint depends on this |
| `backend/app/srs/scheduler.py` | py-fsrs wrapper: DB row <-> Card conversion, scheduling |
| `backend/app/llm/client_factory.py` | Creates DSPy LM from user's API key + provider |
| `backend/app/llm/interact/pipeline.py` | Most complex pipeline: real-time tutoring + error extraction |
| `backend/app/llm/rag.py` | Embedding + vector search for reference text context |
| `frontend/src/hooks.server.ts` | Supabase SSR auth + API proxy to FastAPI |
| `frontend/src/lib/utils/grid.ts` | Grid layout logic + contiguity validation |
| `frontend/src/lib/components/farm/FarmGrid.svelte` | Drag-and-drop grid, central UI component |
