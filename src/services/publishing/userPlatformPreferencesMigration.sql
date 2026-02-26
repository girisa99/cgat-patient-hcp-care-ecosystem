-- User Platform Preferences — DB table schema reference
-- Run this migration against Supabase to create the preferences table.

CREATE TABLE IF NOT EXISTS user_platform_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  -- Platform selections
  preferred_platforms JSONB DEFAULT '[]',        -- SocialPlatformId[]
  preferred_outlets JSONB DEFAULT '[]',          -- OutletPlatformId[]
  -- Format preferences
  preferred_formats JSONB DEFAULT '[]',          -- ContentFormatId[]
  default_delivery_mode TEXT DEFAULT 'download_export',
  -- Regional defaults
  default_region TEXT,
  default_sub_region TEXT,
  default_language TEXT DEFAULT 'en',
  timezone TEXT DEFAULT 'UTC',
  -- Content preferences
  preferred_industries JSONB DEFAULT '[]',       -- IndustryVertical[]
  preferred_messaging_tones JSONB DEFAULT '[]',  -- MessagingArchetype[]
  -- Auto-publish preferences
  auto_publish_enabled BOOLEAN DEFAULT false,
  auto_publish_cadence_days INTEGER DEFAULT 2,
  auto_publish_require_approval BOOLEAN DEFAULT true,
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE user_platform_preferences ENABLE ROW LEVEL SECURITY;

-- Users can only read/write their own preferences
CREATE POLICY "Users manage own preferences"
  ON user_platform_preferences
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_platform_prefs_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_platform_prefs_ts
  BEFORE UPDATE ON user_platform_preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_platform_prefs_updated_at();
