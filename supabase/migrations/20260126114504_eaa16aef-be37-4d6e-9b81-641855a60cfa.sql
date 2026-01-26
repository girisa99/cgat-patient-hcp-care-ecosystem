-- =====================================================
-- GENIE STUDIO ECOSYSTEM TABLES (From Spec v4)
-- Creates 7 missing tables for beta rewards, scheduling, and creator ecosystem
-- =====================================================

-- 1. Creator Profiles (for rewards system)
CREATE TABLE IF NOT EXISTS public.creator_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  display_name TEXT,
  avatar_url TEXT,
  level TEXT DEFAULT 'bronze' CHECK (level IN ('bronze', 'silver', 'gold', 'platinum', 'diamond')),
  total_points INTEGER DEFAULT 0,
  lifetime_points INTEGER DEFAULT 0,
  badges JSONB DEFAULT '[]'::jsonb,
  streak_count INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  pipelines_used TEXT[] DEFAULT '{}',
  preferred_language TEXT DEFAULT 'en',
  timezone TEXT DEFAULT 'UTC',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id)
);

-- 2. Beta Participants
CREATE TABLE IF NOT EXISTS public.beta_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  email TEXT NOT NULL,
  joined_at TIMESTAMPTZ DEFAULT now(),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'graduated')),
  tier TEXT DEFAULT 'early_adopter' CHECK (tier IN ('early_adopter', 'power_user', 'ambassador', 'founding_member')),
  feedback_count INTEGER DEFAULT 0,
  bugs_reported INTEGER DEFAULT 0,
  features_tested INTEGER DEFAULT 0,
  referral_code TEXT UNIQUE,
  invited_by UUID REFERENCES public.beta_participants(id),
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id)
);

-- 3. Beta Rewards
CREATE TABLE IF NOT EXISTS public.beta_rewards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  reward_type TEXT NOT NULL CHECK (reward_type IN ('badge', 'points', 'feature_unlock', 'discount', 'credits', 'lifetime_access')),
  reward_name TEXT NOT NULL,
  reward_value JSONB NOT NULL,
  earned_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ,
  claimed_at TIMESTAMPTZ,
  source_action TEXT NOT NULL,
  source_pipeline TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Daily Streaks
CREATE TABLE IF NOT EXISTS public.daily_streaks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  streak_date DATE NOT NULL DEFAULT CURRENT_DATE,
  activity_type TEXT NOT NULL CHECK (activity_type IN ('generation', 'edit', 'publish', 'feedback', 'login')),
  pipeline_id TEXT,
  content_id UUID,
  points_earned INTEGER DEFAULT 0,
  streak_day INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, streak_date, activity_type)
);

-- 5. Referrals
CREATE TABLE IF NOT EXISTS public.referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  referred_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  referral_code TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'rewarded', 'expired')),
  reward_type TEXT,
  reward_value JSONB,
  referred_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ,
  rewarded_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(referrer_id, referred_id)
);

-- 6. Scheduled Posts (for social publishing)
CREATE TABLE IF NOT EXISTS public.scheduled_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  content_id UUID,
  pipeline_id TEXT,
  platform TEXT NOT NULL CHECK (platform IN ('linkedin', 'youtube', 'tiktok', 'instagram', 'twitter', 'blog', 'facebook')),
  scheduled_time TIMESTAMPTZ NOT NULL,
  timezone TEXT DEFAULT 'UTC',
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('draft', 'scheduled', 'publishing', 'published', 'failed', 'cancelled')),
  content_data JSONB NOT NULL,
  media_urls TEXT[] DEFAULT '{}',
  hashtags TEXT[] DEFAULT '{}',
  mentions TEXT[] DEFAULT '{}',
  platform_config JSONB DEFAULT '{}'::jsonb,
  published_at TIMESTAMPTZ,
  publish_result JSONB,
  error_message TEXT,
  retry_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 7. Optimal Post Times (for scheduling intelligence)
CREATE TABLE IF NOT EXISTS public.optimal_post_times (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  platform TEXT NOT NULL CHECK (platform IN ('linkedin', 'youtube', 'tiktok', 'instagram', 'twitter', 'blog', 'facebook')),
  day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  hour_utc INTEGER NOT NULL CHECK (hour_utc BETWEEN 0 AND 23),
  engagement_score DECIMAL(5,2) DEFAULT 0,
  post_count INTEGER DEFAULT 0,
  avg_engagement DECIMAL(10,2) DEFAULT 0,
  region TEXT,
  language TEXT DEFAULT 'en',
  is_recommended BOOLEAN DEFAULT false,
  last_calculated_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, platform, day_of_week, hour_utc)
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_creator_profiles_user_id ON public.creator_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_creator_profiles_level ON public.creator_profiles(level);

CREATE INDEX IF NOT EXISTS idx_beta_participants_user_id ON public.beta_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_beta_participants_referral_code ON public.beta_participants(referral_code);
CREATE INDEX IF NOT EXISTS idx_beta_participants_status ON public.beta_participants(status);

CREATE INDEX IF NOT EXISTS idx_beta_rewards_user_id ON public.beta_rewards(user_id);
CREATE INDEX IF NOT EXISTS idx_beta_rewards_type ON public.beta_rewards(reward_type);
CREATE INDEX IF NOT EXISTS idx_beta_rewards_earned_at ON public.beta_rewards(earned_at);

CREATE INDEX IF NOT EXISTS idx_daily_streaks_user_id ON public.daily_streaks(user_id);
CREATE INDEX IF NOT EXISTS idx_daily_streaks_date ON public.daily_streaks(streak_date);
CREATE INDEX IF NOT EXISTS idx_daily_streaks_user_date ON public.daily_streaks(user_id, streak_date);

CREATE INDEX IF NOT EXISTS idx_referrals_referrer ON public.referrals(referrer_id);
CREATE INDEX IF NOT EXISTS idx_referrals_code ON public.referrals(referral_code);
CREATE INDEX IF NOT EXISTS idx_referrals_status ON public.referrals(status);

CREATE INDEX IF NOT EXISTS idx_scheduled_posts_user_id ON public.scheduled_posts(user_id);
CREATE INDEX IF NOT EXISTS idx_scheduled_posts_scheduled_time ON public.scheduled_posts(scheduled_time);
CREATE INDEX IF NOT EXISTS idx_scheduled_posts_status ON public.scheduled_posts(status);
CREATE INDEX IF NOT EXISTS idx_scheduled_posts_platform ON public.scheduled_posts(platform);

CREATE INDEX IF NOT EXISTS idx_optimal_post_times_platform ON public.optimal_post_times(platform);
CREATE INDEX IF NOT EXISTS idx_optimal_post_times_user_platform ON public.optimal_post_times(user_id, platform);

-- =====================================================
-- ROW LEVEL SECURITY
-- =====================================================

ALTER TABLE public.creator_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.beta_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.beta_rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_streaks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scheduled_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.optimal_post_times ENABLE ROW LEVEL SECURITY;

-- Creator Profiles policies
CREATE POLICY "Users can view own creator profile" ON public.creator_profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own creator profile" ON public.creator_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own creator profile" ON public.creator_profiles
  FOR UPDATE USING (auth.uid() = user_id);

-- Beta Participants policies
CREATE POLICY "Users can view own beta participation" ON public.beta_participants
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can join beta" ON public.beta_participants
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own beta participation" ON public.beta_participants
  FOR UPDATE USING (auth.uid() = user_id);

-- Beta Rewards policies
CREATE POLICY "Users can view own rewards" ON public.beta_rewards
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can create rewards" ON public.beta_rewards
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Daily Streaks policies
CREATE POLICY "Users can view own streaks" ON public.daily_streaks
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own streaks" ON public.daily_streaks
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Referrals policies
CREATE POLICY "Users can view referrals they made" ON public.referrals
  FOR SELECT USING (auth.uid() = referrer_id OR auth.uid() = referred_id);

CREATE POLICY "Users can create referrals" ON public.referrals
  FOR INSERT WITH CHECK (auth.uid() = referrer_id);

CREATE POLICY "Users can update own referrals" ON public.referrals
  FOR UPDATE USING (auth.uid() = referrer_id);

-- Scheduled Posts policies
CREATE POLICY "Users can view own scheduled posts" ON public.scheduled_posts
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create scheduled posts" ON public.scheduled_posts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own scheduled posts" ON public.scheduled_posts
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own scheduled posts" ON public.scheduled_posts
  FOR DELETE USING (auth.uid() = user_id);

-- Optimal Post Times policies (global recommendations + user-specific)
CREATE POLICY "Users can view global optimal times" ON public.optimal_post_times
  FOR SELECT USING (user_id IS NULL OR auth.uid() = user_id);

CREATE POLICY "Users can manage own optimal times" ON public.optimal_post_times
  FOR ALL USING (auth.uid() = user_id);

-- =====================================================
-- TRIGGERS FOR updated_at
-- =====================================================

CREATE TRIGGER update_creator_profiles_updated_at
  BEFORE UPDATE ON public.creator_profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_beta_participants_updated_at
  BEFORE UPDATE ON public.beta_participants
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_referrals_updated_at
  BEFORE UPDATE ON public.referrals
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_scheduled_posts_updated_at
  BEFORE UPDATE ON public.scheduled_posts
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_optimal_post_times_updated_at
  BEFORE UPDATE ON public.optimal_post_times
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();