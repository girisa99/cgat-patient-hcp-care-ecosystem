-- PIPELINE EDITING TABLES & RLS FIX
-- Creates tables for proactive editing ecosystem integration

-- 1. Create pipeline_edit_sessions table for tracking editing sessions
CREATE TABLE IF NOT EXISTS public.pipeline_edit_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    pipeline_id TEXT NOT NULL,
    media_url TEXT,
    operations JSONB DEFAULT '[]'::jsonb,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'failed', 'cancelled')),
    output_url TEXT,
    confidence_score NUMERIC(5,2),
    device_context TEXT DEFAULT 'desktop',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    completed_at TIMESTAMPTZ
);

-- Enable RLS
ALTER TABLE public.pipeline_edit_sessions ENABLE ROW LEVEL SECURITY;

-- RLS policies for pipeline_edit_sessions
CREATE POLICY "Users can view own edit sessions"
ON public.pipeline_edit_sessions FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create own edit sessions"
ON public.pipeline_edit_sessions FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own edit sessions"
ON public.pipeline_edit_sessions FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own edit sessions"
ON public.pipeline_edit_sessions FOR DELETE
USING (auth.uid() = user_id);

-- 2. Create proactive_edit_suggestions table
CREATE TABLE IF NOT EXISTS public.proactive_edit_suggestions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID REFERENCES public.pipeline_edit_sessions(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    pipeline_id TEXT NOT NULL,
    suggestion_type TEXT NOT NULL,
    priority TEXT DEFAULT 'MEDIUM' CHECK (priority IN ('CRITICAL', 'HIGH', 'MEDIUM', 'LOW')),
    reason TEXT,
    credit_cost INTEGER DEFAULT 0,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'applied', 'dismissed', 'expired')),
    applied_at TIMESTAMPTZ,
    dismissed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.proactive_edit_suggestions ENABLE ROW LEVEL SECURITY;

-- RLS policies for proactive_edit_suggestions
CREATE POLICY "Users can view own suggestions"
ON public.proactive_edit_suggestions FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can update own suggestions"
ON public.proactive_edit_suggestions FOR UPDATE
USING (auth.uid() = user_id);

-- 3. Create updated_at trigger for pipeline_edit_sessions
CREATE OR REPLACE FUNCTION public.trigger_set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS set_pipeline_edit_sessions_updated_at ON public.pipeline_edit_sessions;
CREATE TRIGGER set_pipeline_edit_sessions_updated_at
BEFORE UPDATE ON public.pipeline_edit_sessions
FOR EACH ROW
EXECUTE FUNCTION public.trigger_set_updated_at();

-- 4. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_pipeline_edit_sessions_user_id ON public.pipeline_edit_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_pipeline_edit_sessions_pipeline_id ON public.pipeline_edit_sessions(pipeline_id);
CREATE INDEX IF NOT EXISTS idx_pipeline_edit_sessions_status ON public.pipeline_edit_sessions(status);
CREATE INDEX IF NOT EXISTS idx_proactive_edit_suggestions_user_id ON public.proactive_edit_suggestions(user_id);
CREATE INDEX IF NOT EXISTS idx_proactive_edit_suggestions_session_id ON public.proactive_edit_suggestions(session_id);