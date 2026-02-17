-- P3 Complete Database Schema
-- Creates all 11 missing tables for P3 features

-- ============================================
-- 1. LEGAL REVIEW GATE TABLES
-- ============================================

CREATE TABLE public.legal_reviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  content_id TEXT NOT NULL,
  content_type TEXT NOT NULL CHECK (content_type IN ('video', 'audio', 'script', 'image', 'document')),
  content_data JSONB DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'changes_requested', 'auto_approved')),
  compliance_score INTEGER DEFAULT 100,
  flagged_issues TEXT[] DEFAULT '{}',
  reviewer_id UUID REFERENCES auth.users(id),
  review_notes TEXT,
  compliance_flags TEXT[] DEFAULT '{}',
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  reviewed_at TIMESTAMPTZ,
  approval_type TEXT CHECK (approval_type IN ('auto', 'manual')),
  auto_screened BOOLEAN DEFAULT false,
  screening_results JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.legal_reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view legal reviews" ON public.legal_reviews
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create legal reviews" ON public.legal_reviews
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Reviewers can update legal reviews" ON public.legal_reviews
  FOR UPDATE USING (auth.uid() IS NOT NULL);

CREATE INDEX idx_legal_reviews_content ON public.legal_reviews(content_id);
CREATE INDEX idx_legal_reviews_status ON public.legal_reviews(status);

-- ============================================
-- 2. BULK OPERATIONS TABLES
-- ============================================

CREATE TABLE public.bulk_jobs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  operation_type TEXT NOT NULL CHECK (operation_type IN ('video_generation', 'audio_processing', 'image_resize', 'document_convert', 'data_export', 'content_publish')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled', 'paused')),
  total_items INTEGER NOT NULL DEFAULT 0,
  processed_items INTEGER DEFAULT 0,
  failed_items INTEGER DEFAULT 0,
  items JSONB NOT NULL DEFAULT '[]',
  results JSONB DEFAULT '[]',
  errors JSONB DEFAULT '[]',
  options JSONB DEFAULT '{}',
  created_by UUID REFERENCES auth.users(id),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.bulk_jobs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their bulk jobs" ON public.bulk_jobs
  FOR SELECT USING (auth.uid() = created_by OR auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can create bulk jobs" ON public.bulk_jobs
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update their bulk jobs" ON public.bulk_jobs
  FOR UPDATE USING (auth.uid() = created_by OR auth.uid() IS NOT NULL);

CREATE INDEX idx_bulk_jobs_status ON public.bulk_jobs(status);
CREATE INDEX idx_bulk_jobs_created_by ON public.bulk_jobs(created_by);

-- ============================================
-- 3. WORKSPACE COLLABORATION TABLES
-- ============================================

CREATE TABLE public.workspace_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  workspace_id UUID NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'viewer' CHECK (role IN ('viewer', 'editor', 'admin', 'owner')),
  invited_by UUID REFERENCES auth.users(id),
  joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(workspace_id, user_id)
);

ALTER TABLE public.workspace_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can view workspace members" ON public.workspace_members
  FOR SELECT USING (auth.uid() = user_id OR auth.uid() IS NOT NULL);

CREATE POLICY "Admins can manage members" ON public.workspace_members
  FOR ALL USING (auth.uid() IS NOT NULL);

CREATE INDEX idx_workspace_members_workspace ON public.workspace_members(workspace_id);
CREATE INDEX idx_workspace_members_user ON public.workspace_members(user_id);

-- Workspace Invitations
CREATE TABLE public.workspace_invitations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  workspace_id UUID NOT NULL,
  email TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'viewer' CHECK (role IN ('viewer', 'editor', 'admin')),
  invited_by UUID REFERENCES auth.users(id),
  token TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'expired', 'cancelled')),
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.workspace_invitations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view invitations" ON public.workspace_invitations
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admins can manage invitations" ON public.workspace_invitations
  FOR ALL USING (auth.uid() IS NOT NULL);

CREATE INDEX idx_workspace_invitations_token ON public.workspace_invitations(token);
CREATE INDEX idx_workspace_invitations_email ON public.workspace_invitations(email);

-- Workspace Teams
CREATE TABLE public.workspace_teams (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  workspace_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.workspace_teams ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Teams are viewable" ON public.workspace_teams
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admins can manage teams" ON public.workspace_teams
  FOR ALL USING (auth.uid() IS NOT NULL);

-- Workspace Activity Log
CREATE TABLE public.workspace_activity (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  workspace_id UUID NOT NULL,
  user_id UUID REFERENCES auth.users(id),
  activity_type TEXT NOT NULL,
  details JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.workspace_activity ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Activity is viewable by workspace members" ON public.workspace_activity
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Activity can be logged" ON public.workspace_activity
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE INDEX idx_workspace_activity_workspace ON public.workspace_activity(workspace_id);
CREATE INDEX idx_workspace_activity_created ON public.workspace_activity(created_at DESC);

-- ============================================
-- 4. CONTENT COLLABORATION TABLES
-- ============================================

CREATE TABLE public.content_assignments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  content_id TEXT NOT NULL,
  content_type TEXT NOT NULL DEFAULT 'general',
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  assigned_by UUID REFERENCES auth.users(id),
  assigned_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  due_date TIMESTAMPTZ,
  status TEXT DEFAULT 'assigned' CHECK (status IN ('assigned', 'in_progress', 'completed', 'cancelled')),
  UNIQUE(content_id, user_id)
);

ALTER TABLE public.content_assignments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their assignments" ON public.content_assignments
  FOR SELECT USING (auth.uid() = user_id OR auth.uid() = assigned_by);

CREATE POLICY "Users can manage assignments" ON public.content_assignments
  FOR ALL USING (auth.uid() IS NOT NULL);

CREATE INDEX idx_content_assignments_user ON public.content_assignments(user_id);

-- Content Shares
CREATE TABLE public.content_shares (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  content_id TEXT NOT NULL,
  content_type TEXT NOT NULL DEFAULT 'general',
  shared_with UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  shared_by UUID REFERENCES auth.users(id),
  permissions TEXT[] DEFAULT ARRAY['view'],
  shared_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ,
  UNIQUE(content_id, shared_with)
);

ALTER TABLE public.content_shares ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view shares" ON public.content_shares
  FOR SELECT USING (auth.uid() = shared_with OR auth.uid() = shared_by);

CREATE POLICY "Users can manage shares" ON public.content_shares
  FOR ALL USING (auth.uid() IS NOT NULL);

CREATE INDEX idx_content_shares_shared_with ON public.content_shares(shared_with);

-- ============================================
-- 5. TEMPLATE MARKETPLACE TABLES
-- ============================================

CREATE TABLE public.marketplace_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  template_type TEXT DEFAULT 'agent' CHECK (template_type IN ('agent', 'workflow', 'script', 'video', 'audio')),
  configuration JSONB NOT NULL DEFAULT '{}',
  preview_url TEXT,
  tags TEXT[] DEFAULT '{}',
  price INTEGER DEFAULT 0,
  currency TEXT DEFAULT 'USD',
  avg_rating DECIMAL(3,2) DEFAULT 0,
  install_count INTEGER DEFAULT 0,
  created_by UUID REFERENCES auth.users(id),
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'pending_review', 'published', 'rejected', 'archived')),
  is_featured BOOLEAN DEFAULT false,
  is_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.marketplace_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Published templates are public" ON public.marketplace_templates
  FOR SELECT USING (status = 'published' OR auth.uid() = created_by);

CREATE POLICY "Users can create templates" ON public.marketplace_templates
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update their templates" ON public.marketplace_templates
  FOR UPDATE USING (auth.uid() = created_by);

CREATE INDEX idx_marketplace_templates_category ON public.marketplace_templates(category);
CREATE INDEX idx_marketplace_templates_status ON public.marketplace_templates(status);
CREATE INDEX idx_marketplace_templates_featured ON public.marketplace_templates(is_featured) WHERE is_featured = true;

-- Template Reviews
CREATE TABLE public.template_reviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  template_id UUID NOT NULL REFERENCES public.marketplace_templates(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(template_id, user_id)
);

ALTER TABLE public.template_reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Reviews are public" ON public.template_reviews
  FOR SELECT USING (true);

CREATE POLICY "Users can create reviews" ON public.template_reviews
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their reviews" ON public.template_reviews
  FOR UPDATE USING (auth.uid() = user_id);

CREATE INDEX idx_template_reviews_template ON public.template_reviews(template_id);

-- Template Installations
CREATE TABLE public.template_installations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  template_id UUID NOT NULL REFERENCES public.marketplace_templates(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  installed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  configuration JSONB DEFAULT '{}',
  UNIQUE(template_id, user_id)
);

ALTER TABLE public.template_installations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their installations" ON public.template_installations
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can install templates" ON public.template_installations
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE INDEX idx_template_installations_user ON public.template_installations(user_id);

-- ============================================
-- 6. HELPER FUNCTIONS
-- ============================================

-- Increment template install count
CREATE OR REPLACE FUNCTION public.increment_template_installs(template_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE public.marketplace_templates
  SET install_count = install_count + 1, updated_at = now()
  WHERE id = template_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update template average rating
CREATE OR REPLACE FUNCTION public.update_template_avg_rating(p_template_id UUID)
RETURNS void AS $$
DECLARE
  new_avg DECIMAL(3,2);
BEGIN
  SELECT COALESCE(AVG(rating)::DECIMAL(3,2), 0)
  INTO new_avg
  FROM public.template_reviews
  WHERE template_id = p_template_id;
  
  UPDATE public.marketplace_templates
  SET avg_rating = new_avg, updated_at = now()
  WHERE id = p_template_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers
CREATE TRIGGER set_legal_reviews_updated_at BEFORE UPDATE ON public.legal_reviews FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_bulk_jobs_updated_at BEFORE UPDATE ON public.bulk_jobs FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_workspace_members_updated_at BEFORE UPDATE ON public.workspace_members FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_workspace_invitations_updated_at BEFORE UPDATE ON public.workspace_invitations FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_workspace_teams_updated_at BEFORE UPDATE ON public.workspace_teams FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_marketplace_templates_updated_at BEFORE UPDATE ON public.marketplace_templates FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_template_reviews_updated_at BEFORE UPDATE ON public.template_reviews FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();