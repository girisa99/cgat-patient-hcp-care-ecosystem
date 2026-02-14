
-- Add user_id and core messaging columns to ecosystem_messaging
ALTER TABLE public.ecosystem_messaging 
  ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS request_id TEXT,
  ADD COLUMN IF NOT EXISTS feature_id TEXT,
  ADD COLUMN IF NOT EXISTS headline TEXT,
  ADD COLUMN IF NOT EXISTS hook TEXT,
  ADD COLUMN IF NOT EXISTS sub_hook TEXT,
  ADD COLUMN IF NOT EXISTS cta TEXT,
  ADD COLUMN IF NOT EXISTS cta_secondary TEXT,
  ADD COLUMN IF NOT EXISTS value_proposition TEXT,
  ADD COLUMN IF NOT EXISTS benefits TEXT[],
  ADD COLUMN IF NOT EXISTS opening_line TEXT,
  ADD COLUMN IF NOT EXISTS closing_line TEXT,
  ADD COLUMN IF NOT EXISTS transition_phrases TEXT[],
  ADD COLUMN IF NOT EXISTS short_script TEXT,
  ADD COLUMN IF NOT EXISTS medium_script TEXT,
  ADD COLUMN IF NOT EXISTS long_script TEXT,
  ADD COLUMN IF NOT EXISTS hashtags TEXT[],
  ADD COLUMN IF NOT EXISTS keywords TEXT[],
  ADD COLUMN IF NOT EXISTS meta_description TEXT,
  ADD COLUMN IF NOT EXISTS confidence NUMERIC,
  ADD COLUMN IF NOT EXISTS generated_by TEXT,
  ADD COLUMN IF NOT EXISTS version INTEGER DEFAULT 1,
  ADD COLUMN IF NOT EXISTS creative_angle TEXT,
  ADD COLUMN IF NOT EXISTS production_capability TEXT;

-- Drop old overly-permissive RLS policies
DROP POLICY IF EXISTS "Authenticated users can manage ecosystem messaging" ON public.ecosystem_messaging;
DROP POLICY IF EXISTS "Authenticated users can read ecosystem messaging" ON public.ecosystem_messaging;

-- Create proper user-scoped RLS policies
CREATE POLICY "Users can read own messaging"
  ON public.ecosystem_messaging FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own messaging"
  ON public.ecosystem_messaging FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own messaging"
  ON public.ecosystem_messaging FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own messaging"
  ON public.ecosystem_messaging FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);
