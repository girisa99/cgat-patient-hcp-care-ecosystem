-- ==========================================
-- CUSTOM TEMPLATE & FRAMEWORK LIBRARY SYSTEM
-- Allows users to create, save, and share custom frameworks and templates
-- ==========================================

-- Create enum for framework categories (if not exists)
DO $$ BEGIN
  CREATE TYPE public.framework_category AS ENUM (
    'strategy',
    'growth', 
    'operations',
    'universal',
    'industry-specific',
    'custom'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Create enum for template visibility (if not exists)
DO $$ BEGIN
  CREATE TYPE public.template_visibility AS ENUM (
    'private',
    'public',
    'pending_review'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- ==========================================
-- CUSTOM CONSULTING FRAMEWORKS TABLE
-- ==========================================

CREATE TABLE IF NOT EXISTS public.custom_consulting_frameworks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  category framework_category NOT NULL DEFAULT 'custom',
  frameworks TEXT[] NOT NULL DEFAULT '{}',
  tags TEXT[] NOT NULL DEFAULT '{}',
  use_cases TEXT[] NOT NULL DEFAULT '{}',
  visual_style TEXT DEFAULT 'balanced',
  industries TEXT[] DEFAULT '{}',
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  is_system BOOLEAN DEFAULT FALSE,
  visibility template_visibility DEFAULT 'private',
  usage_count INTEGER DEFAULT 0,
  rating_avg NUMERIC(3,2) DEFAULT 0,
  rating_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ==========================================
-- INDUSTRY TEMPLATE LIBRARY TABLE
-- ==========================================

CREATE TABLE IF NOT EXISTS public.industry_template_library (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  industry TEXT NOT NULL,
  sub_industry TEXT,
  template_type TEXT NOT NULL DEFAULT 'presentation',
  frameworks TEXT[] NOT NULL DEFAULT '{}',
  tags TEXT[] NOT NULL DEFAULT '{}',
  slide_suggestions JSONB DEFAULT '[]',
  recommended_visuals TEXT[] DEFAULT '{}',
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  is_system BOOLEAN DEFAULT FALSE,
  visibility template_visibility DEFAULT 'private',
  usage_count INTEGER DEFAULT 0,
  rating_avg NUMERIC(3,2) DEFAULT 0,
  rating_count INTEGER DEFAULT 0,
  preview_image_url TEXT,
  sample_slides JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ==========================================
-- USER SAVED FRAMEWORKS TABLE
-- ==========================================

CREATE TABLE IF NOT EXISTS public.user_saved_frameworks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  framework_id UUID REFERENCES public.custom_consulting_frameworks(id) ON DELETE CASCADE,
  template_id UUID REFERENCES public.industry_template_library(id) ON DELETE CASCADE,
  saved_at TIMESTAMPTZ DEFAULT now(),
  notes TEXT,
  CONSTRAINT usf_reference_required CHECK (
    (framework_id IS NOT NULL) OR (template_id IS NOT NULL)
  )
);

-- ==========================================
-- TEMPLATE RATINGS TABLE
-- ==========================================

CREATE TABLE IF NOT EXISTS public.template_ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  framework_id UUID REFERENCES public.custom_consulting_frameworks(id) ON DELETE CASCADE,
  template_id UUID REFERENCES public.industry_template_library(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT tr_unique_framework_rating UNIQUE (user_id, framework_id),
  CONSTRAINT tr_unique_template_rating UNIQUE (user_id, template_id),
  CONSTRAINT tr_rating_target_required CHECK (
    (framework_id IS NOT NULL) OR (template_id IS NOT NULL)
  )
);

-- ==========================================
-- ENABLE RLS
-- ==========================================

ALTER TABLE public.custom_consulting_frameworks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.industry_template_library ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_saved_frameworks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.template_ratings ENABLE ROW LEVEL SECURITY;

-- ==========================================
-- RLS POLICIES - CONSULTING FRAMEWORKS
-- ==========================================

DROP POLICY IF EXISTS "View consulting frameworks" ON public.custom_consulting_frameworks;
CREATE POLICY "View consulting frameworks"
ON public.custom_consulting_frameworks
FOR SELECT
USING (
  is_system = TRUE 
  OR visibility = 'public' 
  OR (auth.uid() IS NOT NULL AND created_by = auth.uid())
);

DROP POLICY IF EXISTS "Create consulting frameworks" ON public.custom_consulting_frameworks;
CREATE POLICY "Create consulting frameworks"
ON public.custom_consulting_frameworks
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = created_by);

DROP POLICY IF EXISTS "Update own consulting frameworks" ON public.custom_consulting_frameworks;
CREATE POLICY "Update own consulting frameworks"
ON public.custom_consulting_frameworks
FOR UPDATE
TO authenticated
USING (auth.uid() = created_by)
WITH CHECK (auth.uid() = created_by);

DROP POLICY IF EXISTS "Delete own consulting frameworks" ON public.custom_consulting_frameworks;
CREATE POLICY "Delete own consulting frameworks"
ON public.custom_consulting_frameworks
FOR DELETE
TO authenticated
USING (auth.uid() = created_by AND is_system = FALSE);

-- ==========================================
-- RLS POLICIES - INDUSTRY TEMPLATES
-- ==========================================

DROP POLICY IF EXISTS "View industry templates" ON public.industry_template_library;
CREATE POLICY "View industry templates"
ON public.industry_template_library
FOR SELECT
USING (
  is_system = TRUE 
  OR visibility = 'public' 
  OR (auth.uid() IS NOT NULL AND created_by = auth.uid())
);

DROP POLICY IF EXISTS "Create industry templates" ON public.industry_template_library;
CREATE POLICY "Create industry templates"
ON public.industry_template_library
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = created_by);

DROP POLICY IF EXISTS "Update own industry templates" ON public.industry_template_library;
CREATE POLICY "Update own industry templates"
ON public.industry_template_library
FOR UPDATE
TO authenticated
USING (auth.uid() = created_by)
WITH CHECK (auth.uid() = created_by);

DROP POLICY IF EXISTS "Delete own industry templates" ON public.industry_template_library;
CREATE POLICY "Delete own industry templates"
ON public.industry_template_library
FOR DELETE
TO authenticated
USING (auth.uid() = created_by AND is_system = FALSE);

-- ==========================================
-- RLS POLICIES - USER SAVED FRAMEWORKS
-- ==========================================

DROP POLICY IF EXISTS "View own saved frameworks" ON public.user_saved_frameworks;
CREATE POLICY "View own saved frameworks"
ON public.user_saved_frameworks
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Save frameworks" ON public.user_saved_frameworks;
CREATE POLICY "Save frameworks"
ON public.user_saved_frameworks
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Delete saved frameworks" ON public.user_saved_frameworks;
CREATE POLICY "Delete saved frameworks"
ON public.user_saved_frameworks
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- ==========================================
-- RLS POLICIES - RATINGS
-- ==========================================

DROP POLICY IF EXISTS "View template ratings" ON public.template_ratings;
CREATE POLICY "View template ratings"
ON public.template_ratings
FOR SELECT
USING (TRUE);

DROP POLICY IF EXISTS "Create ratings" ON public.template_ratings;
CREATE POLICY "Create ratings"
ON public.template_ratings
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Update own ratings" ON public.template_ratings;
CREATE POLICY "Update own ratings"
ON public.template_ratings
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Delete own ratings" ON public.template_ratings;
CREATE POLICY "Delete own ratings"
ON public.template_ratings
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- ==========================================
-- INDEXES (with unique names)
-- ==========================================

CREATE INDEX IF NOT EXISTS idx_ccf_visibility ON public.custom_consulting_frameworks(visibility);
CREATE INDEX IF NOT EXISTS idx_ccf_category ON public.custom_consulting_frameworks(category);
CREATE INDEX IF NOT EXISTS idx_ccf_created_by ON public.custom_consulting_frameworks(created_by);
CREATE INDEX IF NOT EXISTS idx_ccf_is_system ON public.custom_consulting_frameworks(is_system);

CREATE INDEX IF NOT EXISTS idx_itl_visibility ON public.industry_template_library(visibility);
CREATE INDEX IF NOT EXISTS idx_itl_industry ON public.industry_template_library(industry);
CREATE INDEX IF NOT EXISTS idx_itl_created_by ON public.industry_template_library(created_by);
CREATE INDEX IF NOT EXISTS idx_itl_is_system ON public.industry_template_library(is_system);

CREATE INDEX IF NOT EXISTS idx_usf_user ON public.user_saved_frameworks(user_id);
CREATE INDEX IF NOT EXISTS idx_tr_framework ON public.template_ratings(framework_id);
CREATE INDEX IF NOT EXISTS idx_tr_template ON public.template_ratings(template_id);

-- ==========================================
-- UPDATED_AT TRIGGERS
-- ==========================================

DROP TRIGGER IF EXISTS update_ccf_updated_at ON public.custom_consulting_frameworks;
CREATE TRIGGER update_ccf_updated_at
  BEFORE UPDATE ON public.custom_consulting_frameworks
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_itl_updated_at ON public.industry_template_library;
CREATE TRIGGER update_itl_updated_at
  BEFORE UPDATE ON public.industry_template_library
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_tr_updated_at ON public.template_ratings;
CREATE TRIGGER update_tr_updated_at
  BEFORE UPDATE ON public.template_ratings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();