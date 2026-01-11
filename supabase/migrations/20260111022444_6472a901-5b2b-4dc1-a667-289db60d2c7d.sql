-- Create user segments table to track feature access and user categorization
CREATE TABLE public.user_segments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Subscription & Tier
  subscription_tier TEXT DEFAULT 'free' CHECK (subscription_tier IN ('free', 'starter', 'business', 'pro', 'beta', 'enterprise')),
  subscription_status TEXT DEFAULT 'trial' CHECK (subscription_status IN ('trial', 'active', 'cancelled', 'expired', 'pending')),
  trial_started_at TIMESTAMP WITH TIME ZONE,
  trial_ends_at TIMESTAMP WITH TIME ZONE,
  subscription_started_at TIMESTAMP WITH TIME ZONE,
  subscription_ends_at TIMESTAMP WITH TIME ZONE,
  
  -- User Segment Classification
  segment_type TEXT DEFAULT 'individual' CHECK (segment_type IN ('individual', 'team', 'enterprise', 'healthcare', 'education', 'nonprofit')),
  organization_name TEXT,
  organization_size TEXT CHECK (organization_size IN ('1', '2-10', '11-50', '51-200', '201-1000', '1000+')),
  industry TEXT,
  
  -- Feature Access Flags (derived from tier + segment)
  has_studio_access BOOLEAN DEFAULT true,
  has_spark_access BOOLEAN DEFAULT true,
  has_vibe_access BOOLEAN DEFAULT false,
  has_arc_access BOOLEAN DEFAULT false,
  has_mind_access BOOLEAN DEFAULT false,
  has_production_hub_access BOOLEAN DEFAULT false,
  
  -- Usage Limits
  max_agents INTEGER DEFAULT 1,
  max_api_calls_monthly INTEGER DEFAULT 100,
  max_storage_mb INTEGER DEFAULT 500,
  max_team_members INTEGER DEFAULT 1,
  max_rag_documents INTEGER DEFAULT 0,
  
  -- Watermark & Branding
  watermarks_enabled BOOLEAN DEFAULT true,
  custom_branding_enabled BOOLEAN DEFAULT false,
  white_label_enabled BOOLEAN DEFAULT false,
  
  -- Priority Features Tracking
  one_tap_mobile_enabled BOOLEAN DEFAULT false,
  quick_clips_enabled BOOLEAN DEFAULT false,
  offline_mode_enabled BOOLEAN DEFAULT false,
  remix_engine_enabled BOOLEAN DEFAULT false,
  hipaa_compliance_enabled BOOLEAN DEFAULT false,
  education_lessons_enabled BOOLEAN DEFAULT false,
  
  -- Metadata
  onboarding_completed BOOLEAN DEFAULT false,
  onboarding_completed_at TIMESTAMP WITH TIME ZONE,
  last_feature_check_at TIMESTAMP WITH TIME ZONE,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE public.user_segments ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own segment"
  ON public.user_segments FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own segment"
  ON public.user_segments FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "System can insert segments"
  ON public.user_segments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create function to auto-create segment on user signup
CREATE OR REPLACE FUNCTION public.create_user_segment()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_segments (
    user_id,
    subscription_tier,
    subscription_status,
    trial_started_at,
    trial_ends_at,
    has_studio_access,
    has_spark_access,
    max_agents,
    max_api_calls_monthly,
    max_storage_mb
  ) VALUES (
    NEW.id,
    'free',
    'trial',
    NOW(),
    NOW() + INTERVAL '14 days',
    true,
    true,
    1,
    100,
    500
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger to create segment on user creation
CREATE TRIGGER on_auth_user_created_segment
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.create_user_segment();

-- Create function to update feature access based on tier
CREATE OR REPLACE FUNCTION public.update_segment_features()
RETURNS TRIGGER AS $$
BEGIN
  -- Update feature flags based on subscription tier
  CASE NEW.subscription_tier
    WHEN 'free' THEN
      NEW.has_studio_access := true;
      NEW.has_spark_access := true;
      NEW.has_vibe_access := false;
      NEW.has_arc_access := false;
      NEW.has_mind_access := false;
      NEW.has_production_hub_access := false;
      NEW.max_agents := 1;
      NEW.max_api_calls_monthly := 100;
      NEW.max_storage_mb := 500;
      NEW.max_team_members := 1;
      NEW.watermarks_enabled := true;
      NEW.custom_branding_enabled := false;
      
    WHEN 'starter' THEN
      NEW.has_studio_access := true;
      NEW.has_spark_access := true;
      NEW.has_vibe_access := false;
      NEW.has_arc_access := false;
      NEW.has_mind_access := false;
      NEW.has_production_hub_access := false;
      NEW.max_agents := 5;
      NEW.max_api_calls_monthly := 1000;
      NEW.max_storage_mb := 5120;
      NEW.max_team_members := 1;
      NEW.watermarks_enabled := false;
      NEW.custom_branding_enabled := false;
      
    WHEN 'business' THEN
      NEW.has_studio_access := true;
      NEW.has_spark_access := true;
      NEW.has_vibe_access := true;
      NEW.has_arc_access := false;
      NEW.has_mind_access := true;
      NEW.has_production_hub_access := false;
      NEW.max_agents := 25;
      NEW.max_api_calls_monthly := 10000;
      NEW.max_storage_mb := 51200;
      NEW.max_team_members := 5;
      NEW.max_rag_documents := 10000;
      NEW.watermarks_enabled := false;
      NEW.custom_branding_enabled := true;
      NEW.quick_clips_enabled := true;
      
    WHEN 'pro', 'enterprise', 'beta' THEN
      NEW.has_studio_access := true;
      NEW.has_spark_access := true;
      NEW.has_vibe_access := true;
      NEW.has_arc_access := true;
      NEW.has_mind_access := true;
      NEW.has_production_hub_access := true;
      NEW.max_agents := -1; -- unlimited
      NEW.max_api_calls_monthly := -1;
      NEW.max_storage_mb := 512000;
      NEW.max_team_members := -1;
      NEW.max_rag_documents := -1;
      NEW.watermarks_enabled := false;
      NEW.custom_branding_enabled := true;
      NEW.white_label_enabled := true;
      NEW.one_tap_mobile_enabled := true;
      NEW.quick_clips_enabled := true;
      NEW.remix_engine_enabled := true;
      NEW.hipaa_compliance_enabled := true;
      
    ELSE
      NULL;
  END CASE;
  
  -- Healthcare segment gets HIPAA by default
  IF NEW.segment_type = 'healthcare' THEN
    NEW.hipaa_compliance_enabled := true;
  END IF;
  
  -- Education segment gets lessons
  IF NEW.segment_type = 'education' THEN
    NEW.education_lessons_enabled := true;
  END IF;
  
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Trigger to update features when tier changes
CREATE TRIGGER on_segment_tier_change
  BEFORE UPDATE OF subscription_tier, segment_type ON public.user_segments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_segment_features();

-- Index for faster lookups
CREATE INDEX idx_user_segments_user_id ON public.user_segments(user_id);
CREATE INDEX idx_user_segments_tier ON public.user_segments(subscription_tier);
CREATE INDEX idx_user_segments_type ON public.user_segments(segment_type);

-- Add comment for documentation
COMMENT ON TABLE public.user_segments IS 'Tracks user subscription tier, segment classification, and feature access flags. Auto-created on user signup with 14-day free trial.';
