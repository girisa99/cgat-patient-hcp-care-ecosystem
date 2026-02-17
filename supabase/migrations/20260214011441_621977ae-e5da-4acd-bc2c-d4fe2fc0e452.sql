
-- ============================================================================
-- 1. Product Knowledge Registry - versioned knowledge per product
-- ============================================================================
CREATE TABLE public.product_knowledge_registry (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES public.marketing_products(id) ON DELETE CASCADE,
  version INTEGER NOT NULL DEFAULT 1,
  is_current BOOLEAN NOT NULL DEFAULT true,
  
  -- Core Positioning
  value_proposition TEXT,
  positioning_statement TEXT,
  tagline TEXT,
  elevator_pitch TEXT,
  
  -- Pain Points & Benefits (arrays for flexibility)
  pain_points JSONB DEFAULT '[]'::jsonb,
  key_benefits JSONB DEFAULT '[]'::jsonb,
  use_cases JSONB DEFAULT '[]'::jsonb,
  differentiators JSONB DEFAULT '[]'::jsonb,
  
  -- Competitive Intelligence
  competitive_edge TEXT,
  competitive_category TEXT,
  
  -- Regional Overrides (JSONB keyed by region/sub-region code)
  regional_positioning JSONB DEFAULT '{}'::jsonb,
  regional_pain_points JSONB DEFAULT '{}'::jsonb,
  regional_benefits JSONB DEFAULT '{}'::jsonb,
  
  -- Metadata
  created_by UUID REFERENCES auth.users(id),
  is_system_default BOOLEAN NOT NULL DEFAULT false,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('draft', 'active', 'archived')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Unique constraint: one current version per product
CREATE UNIQUE INDEX idx_product_knowledge_current 
  ON public.product_knowledge_registry(product_id) WHERE is_current = true;

CREATE INDEX idx_product_knowledge_product ON public.product_knowledge_registry(product_id);

ALTER TABLE public.product_knowledge_registry ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active knowledge" 
  ON public.product_knowledge_registry FOR SELECT 
  USING (status = 'active');

CREATE POLICY "Users can manage own knowledge" 
  ON public.product_knowledge_registry FOR INSERT 
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update own knowledge" 
  ON public.product_knowledge_registry FOR UPDATE 
  USING (auth.uid() = created_by OR is_system_default = true);

CREATE POLICY "Users can delete own knowledge" 
  ON public.product_knowledge_registry FOR DELETE 
  USING (auth.uid() = created_by);

-- ============================================================================
-- 2. Competitor Landscape - global now, regional columns for future
-- ============================================================================
CREATE TABLE public.competitor_landscape (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID REFERENCES public.marketing_products(id) ON DELETE CASCADE,
  
  -- Competitor info (we never expose names in output, only use for internal analysis)
  competitor_name TEXT NOT NULL,
  competitor_category TEXT NOT NULL,
  competitor_weakness TEXT,
  
  -- Our differentiation (this is what gets used in messaging)
  our_advantage TEXT NOT NULL,
  battle_card TEXT,
  positioning_against TEXT,
  
  -- Scope: global by default, regional later
  scope TEXT NOT NULL DEFAULT 'global' CHECK (scope IN ('global', 'regional', 'sub_regional')),
  region_code TEXT,
  sub_region_code TEXT,
  
  -- Metadata
  is_system_default BOOLEAN NOT NULL DEFAULT false,
  created_by UUID REFERENCES auth.users(id),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_competitor_product ON public.competitor_landscape(product_id);
CREATE INDEX idx_competitor_scope ON public.competitor_landscape(scope, region_code);

ALTER TABLE public.competitor_landscape ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active competitors" 
  ON public.competitor_landscape FOR SELECT 
  USING (is_active = true);

CREATE POLICY "Users can manage own competitors" 
  ON public.competitor_landscape FOR INSERT 
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update own competitors" 
  ON public.competitor_landscape FOR UPDATE 
  USING (auth.uid() = created_by OR is_system_default = true);

CREATE POLICY "Users can delete own competitors" 
  ON public.competitor_landscape FOR DELETE 
  USING (auth.uid() = created_by);

-- Timestamp triggers
CREATE TRIGGER update_product_knowledge_updated_at
  BEFORE UPDATE ON public.product_knowledge_registry
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_competitor_landscape_updated_at
  BEFORE UPDATE ON public.competitor_landscape
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
