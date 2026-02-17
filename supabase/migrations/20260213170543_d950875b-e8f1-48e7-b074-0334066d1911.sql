
-- Drop the duplicate enum type if it was somehow created differently
-- Use TEXT for tier to be compatible with existing subscription_tier enum values

CREATE TABLE IF NOT EXISTS public.platform_tier_access (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tier TEXT NOT NULL,
  platform_key TEXT NOT NULL,
  platform_category TEXT NOT NULL,
  is_enabled BOOLEAN NOT NULL DEFAULT true,
  max_monthly_publishes INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(tier, platform_key)
);

ALTER TABLE public.platform_tier_access ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Platform tier access is publicly readable"
  ON public.platform_tier_access FOR SELECT USING (true);

CREATE POLICY "Only superAdmins can manage platform tier access"
  ON public.platform_tier_access FOR ALL
  USING (public.has_role(auth.uid(), 'superAdmin'))
  WITH CHECK (public.has_role(auth.uid(), 'superAdmin'));

-- Use existing tier names: free, starter, pro, business, enterprise, internal
INSERT INTO public.platform_tier_access (tier, platform_key, platform_category, max_monthly_publishes) VALUES
  ('free', 'youtube', 'social', 3),
  ('free', 'linkedin', 'social', 3),
  ('starter', 'youtube', 'social', 10),
  ('starter', 'linkedin', 'social', 10),
  ('starter', 'instagram-reels', 'social', 10),
  ('pro', 'youtube', 'social', 30),
  ('pro', 'linkedin', 'social', 30),
  ('pro', 'instagram-reels', 'social', 30),
  ('pro', 'tiktok', 'social', 30),
  ('pro', 'facebook-video', 'social', 30),
  ('pro', 'x-twitter', 'social', 20),
  ('pro', 'landing-page', 'web', 10),
  ('pro', 'blog-post', 'web', 10),
  ('business', 'youtube', 'social', 100),
  ('business', 'linkedin', 'social', 100),
  ('business', 'instagram-reels', 'social', 100),
  ('business', 'tiktok', 'social', 100),
  ('business', 'facebook-video', 'social', 100),
  ('business', 'x-twitter', 'social', 100),
  ('business', 'landing-page', 'web', 50),
  ('business', 'blog-post', 'web', 50),
  ('business', 'email-campaign', 'web', 50),
  ('business', 'whatsapp-status', 'messaging', 50),
  ('business', 'pinterest-video', 'social', 50),
  ('business', 'snapchat-spotlight', 'social', 50),
  ('enterprise', 'youtube', 'social', NULL),
  ('enterprise', 'linkedin', 'social', NULL),
  ('enterprise', 'instagram-reels', 'social', NULL),
  ('enterprise', 'tiktok', 'social', NULL),
  ('enterprise', 'facebook-video', 'social', NULL),
  ('enterprise', 'x-twitter', 'social', NULL),
  ('enterprise', 'landing-page', 'web', NULL),
  ('enterprise', 'blog-post', 'web', NULL),
  ('enterprise', 'email-campaign', 'web', NULL),
  ('enterprise', 'whatsapp-status', 'messaging', NULL),
  ('enterprise', 'pinterest-video', 'social', NULL),
  ('enterprise', 'snapchat-spotlight', 'social', NULL),
  ('enterprise', 'vimeo', 'social', NULL),
  ('enterprise', 'wistia', 'web', NULL),
  ('enterprise', 'broadcast-tv', 'broadcast', NULL),
  ('enterprise', 'digital-signage', 'broadcast', NULL),
  ('enterprise', 'pptx-export', 'presentation', NULL),
  ('enterprise', 'keynote-export', 'presentation', NULL),
  ('internal', 'youtube', 'social', NULL),
  ('internal', 'linkedin', 'social', NULL),
  ('internal', 'instagram-reels', 'social', NULL),
  ('internal', 'tiktok', 'social', NULL),
  ('internal', 'facebook-video', 'social', NULL),
  ('internal', 'x-twitter', 'social', NULL),
  ('internal', 'landing-page', 'web', NULL),
  ('internal', 'blog-post', 'web', NULL),
  ('internal', 'email-campaign', 'web', NULL),
  ('internal', 'whatsapp-status', 'messaging', NULL),
  ('internal', 'pinterest-video', 'social', NULL),
  ('internal', 'snapchat-spotlight', 'social', NULL),
  ('internal', 'vimeo', 'social', NULL),
  ('internal', 'wistia', 'web', NULL),
  ('internal', 'broadcast-tv', 'broadcast', NULL),
  ('internal', 'digital-signage', 'broadcast', NULL),
  ('internal', 'pptx-export', 'presentation', NULL),
  ('internal', 'keynote-export', 'presentation', NULL),
  ('internal', 'telegram-video', 'messaging', NULL),
  ('internal', 'threads-video', 'social', NULL),
  ('internal', 'google-ads-video', 'web', NULL),
  ('internal', 'meta-ads-video', 'web', NULL)
ON CONFLICT (tier, platform_key) DO NOTHING;

-- ============================================================================
-- CONTENT STORAGE
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.user_content_assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.marketing_products(id),
  asset_type TEXT NOT NULL,
  file_name TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  file_size_bytes BIGINT NOT NULL DEFAULT 0,
  mime_type TEXT,
  metadata JSONB DEFAULT '{}',
  is_internal BOOLEAN NOT NULL DEFAULT false,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.user_content_assets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own content assets"
  ON public.user_content_assets FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own content assets"
  ON public.user_content_assets FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own content assets"
  ON public.user_content_assets FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own content assets"
  ON public.user_content_assets FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "SuperAdmins can view all content assets"
  ON public.user_content_assets FOR SELECT USING (public.has_role(auth.uid(), 'superAdmin'));

CREATE TABLE IF NOT EXISTS public.storage_tier_quotas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tier TEXT NOT NULL UNIQUE,
  max_storage_bytes BIGINT NOT NULL,
  retention_days INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.storage_tier_quotas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Storage quotas are publicly readable"
  ON public.storage_tier_quotas FOR SELECT USING (true);
CREATE POLICY "Only superAdmins can manage storage quotas"
  ON public.storage_tier_quotas FOR ALL
  USING (public.has_role(auth.uid(), 'superAdmin'))
  WITH CHECK (public.has_role(auth.uid(), 'superAdmin'));

INSERT INTO public.storage_tier_quotas (tier, max_storage_bytes, retention_days) VALUES
  ('free',        536870912,    7),
  ('starter',    2147483648,   30),
  ('pro',       10737418240,   30),
  ('business',  53687091200,   30),
  ('enterprise', 107374182400, NULL),
  ('internal',   -1,           NULL)
ON CONFLICT (tier) DO NOTHING;

INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES ('user-content', 'user-content', false, 524288000)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Users can upload to own content folder"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'user-content' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users can view own content files"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'user-content' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users can delete own content files"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'user-content' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE TRIGGER update_user_content_assets_updated_at
  BEFORE UPDATE ON public.user_content_assets
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_platform_tier_access_updated_at
  BEFORE UPDATE ON public.platform_tier_access
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
