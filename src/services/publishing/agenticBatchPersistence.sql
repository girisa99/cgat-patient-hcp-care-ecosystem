-- Agentic Batch Persistence Schema
-- Stores orchestrator batch results for audit trail, resumption, and A2A task tracking.
-- Compatible with the existing Supabase infrastructure.

-- ─── Agentic Batches Table ──────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS agentic_batches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_id TEXT UNIQUE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,

  -- Configuration snapshot (full config at time of generation)
  config JSONB NOT NULL DEFAULT '{}',

  -- Pipeline status
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'running', 'completed', 'failed', 'cancelled')),

  -- Results
  item_count INTEGER NOT NULL DEFAULT 0,
  approved_count INTEGER NOT NULL DEFAULT 0,
  rejected_count INTEGER NOT NULL DEFAULT 0,
  published_count INTEGER NOT NULL DEFAULT 0,

  -- Timing
  total_duration_ms INTEGER,
  agent_timings JSONB DEFAULT '{}',

  -- Quality metrics
  overall_quality_score INTEGER,
  quality_target INTEGER,

  -- Regional context
  target_region TEXT NOT NULL DEFAULT 'NAM',
  target_sub_region TEXT,
  language TEXT NOT NULL DEFAULT 'en',
  source_product TEXT NOT NULL DEFAULT 'cast',

  -- Visual style for this batch
  visual_style_family TEXT,
  visual_style_week INTEGER,

  -- Production plan (if enableProduction was true)
  has_production_plan BOOLEAN NOT NULL DEFAULT FALSE,

  -- Error details (if failed)
  error_message TEXT,
  error_stack TEXT,

  -- A2A task reference (if invoked via A2A)
  a2a_task_id TEXT,
  a2a_session_id TEXT,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- ─── Agentic Batch Items Table ──────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS agentic_batch_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_id TEXT NOT NULL REFERENCES agentic_batches(batch_id) ON DELETE CASCADE,
  item_id TEXT UNIQUE NOT NULL,

  -- Content
  title_en TEXT NOT NULL,
  body_en TEXT,
  cta_en TEXT,
  hashtags TEXT[] DEFAULT '{}',

  -- Structured script
  script_hook TEXT,
  script_problem TEXT,
  script_transformation TEXT,
  script_solution TEXT,
  script_cta TEXT,
  fictitious_name TEXT,

  -- Classification
  archetype TEXT NOT NULL,
  industry TEXT NOT NULL,
  tone TEXT NOT NULL,
  template TEXT NOT NULL,
  voice_character TEXT,

  -- Visual style
  visual_style_family TEXT,
  visual_style_intensity INTEGER,

  -- Voiceover direction
  voiceover_provider TEXT,
  voiceover_voice_id TEXT,
  voiceover_duration_sec NUMERIC(8,2),

  -- Audio mix direction
  audio_music_genre TEXT,
  audio_music_bpm INTEGER,
  audio_track_count INTEGER,

  -- Quality
  quality_score INTEGER,

  -- Production plan (if exists)
  production_blueprint_id TEXT,
  production_scene_count INTEGER,
  production_chunking_strategy TEXT,
  production_resolved_format TEXT,
  production_total_duration_sec NUMERIC(10,2),

  -- Transcreation results
  transcreation_count INTEGER DEFAULT 0,
  transcreations JSONB DEFAULT '{}',

  -- Review status
  status TEXT NOT NULL DEFAULT 'pending_review'
    CHECK (status IN ('pending_review', 'approved', 'rejected', 'published', 'archived')),
  review_notes TEXT,
  reviewed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMPTZ,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── Indexes ────────────────────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_agentic_batches_user ON agentic_batches(user_id);
CREATE INDEX IF NOT EXISTS idx_agentic_batches_status ON agentic_batches(status);
CREATE INDEX IF NOT EXISTS idx_agentic_batches_region ON agentic_batches(target_region, target_sub_region);
CREATE INDEX IF NOT EXISTS idx_agentic_batches_created ON agentic_batches(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_agentic_batches_a2a ON agentic_batches(a2a_task_id) WHERE a2a_task_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_agentic_items_batch ON agentic_batch_items(batch_id);
CREATE INDEX IF NOT EXISTS idx_agentic_items_status ON agentic_batch_items(status);
CREATE INDEX IF NOT EXISTS idx_agentic_items_archetype ON agentic_batch_items(archetype, industry);

-- ─── Updated_at Trigger ─────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION update_agentic_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_agentic_batches_updated
  BEFORE UPDATE ON agentic_batches
  FOR EACH ROW EXECUTE FUNCTION update_agentic_updated_at();

CREATE TRIGGER trg_agentic_items_updated
  BEFORE UPDATE ON agentic_batch_items
  FOR EACH ROW EXECUTE FUNCTION update_agentic_updated_at();

-- ─── RLS Policies ───────────────────────────────────────────────────────────

ALTER TABLE agentic_batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE agentic_batch_items ENABLE ROW LEVEL SECURITY;

-- Users can read/write their own batches
CREATE POLICY agentic_batches_user_policy ON agentic_batches
  FOR ALL USING (auth.uid() = user_id);

-- Users can read/write items in their batches
CREATE POLICY agentic_items_user_policy ON agentic_batch_items
  FOR ALL USING (
    batch_id IN (SELECT batch_id FROM agentic_batches WHERE user_id = auth.uid())
  );
