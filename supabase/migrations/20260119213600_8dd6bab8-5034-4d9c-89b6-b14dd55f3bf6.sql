-- Create presentation_templates table for AI-generated template repository
CREATE TABLE public.presentation_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL DEFAULT 'general',
  industry TEXT,
  segment TEXT,
  content_types TEXT[] DEFAULT '{}',
  
  -- Template visual config
  preview_gradient TEXT,
  preview_image_url TEXT,
  slide_count INTEGER DEFAULT 10,
  
  -- Colors
  primary_color TEXT NOT NULL DEFAULT '#3b82f6',
  secondary_color TEXT NOT NULL DEFAULT '#8b5cf6',
  accent_color TEXT NOT NULL DEFAULT '#f59e0b',
  
  -- Typography
  heading_font TEXT DEFAULT 'Inter',
  body_font TEXT DEFAULT 'Inter',
  
  -- Features enabled
  features TEXT[] DEFAULT '{}',
  
  -- Full template data as JSON
  template_data JSONB NOT NULL DEFAULT '{}',
  theme_data JSONB DEFAULT '{}',
  
  -- Metadata
  tags TEXT[] DEFAULT '{}',
  is_ai_generated BOOLEAN DEFAULT false,
  is_public BOOLEAN DEFAULT true,
  is_premium BOOLEAN DEFAULT false,
  is_system_template BOOLEAN DEFAULT false,
  
  -- Stats
  views_count INTEGER DEFAULT 0,
  downloads_count INTEGER DEFAULT 0,
  likes_count INTEGER DEFAULT 0,
  rating NUMERIC(2,1) DEFAULT 0,
  
  -- Author/Ownership
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.presentation_templates ENABLE ROW LEVEL SECURITY;

-- Public templates are viewable by everyone
CREATE POLICY "Public templates are viewable by everyone"
ON public.presentation_templates
FOR SELECT
USING (is_public = true OR is_system_template = true OR auth.uid() = created_by);

-- Users can create their own templates
CREATE POLICY "Users can create templates"
ON public.presentation_templates
FOR INSERT
WITH CHECK (auth.uid() = created_by);

-- Users can update their own templates
CREATE POLICY "Users can update their own templates"
ON public.presentation_templates
FOR UPDATE
USING (auth.uid() = created_by);

-- Users can delete their own templates
CREATE POLICY "Users can delete their own templates"
ON public.presentation_templates
FOR DELETE
USING (auth.uid() = created_by);

-- Create indexes for filtering
CREATE INDEX idx_templates_category ON public.presentation_templates(category);
CREATE INDEX idx_templates_industry ON public.presentation_templates(industry);
CREATE INDEX idx_templates_segment ON public.presentation_templates(segment);
CREATE INDEX idx_templates_content_types ON public.presentation_templates USING GIN(content_types);
CREATE INDEX idx_templates_tags ON public.presentation_templates USING GIN(tags);
CREATE INDEX idx_templates_public ON public.presentation_templates(is_public);
CREATE INDEX idx_templates_created_by ON public.presentation_templates(created_by);

-- Trigger for updated_at
CREATE TRIGGER update_presentation_templates_updated_at
BEFORE UPDATE ON public.presentation_templates
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- User saved/bookmarked templates
CREATE TABLE public.user_saved_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  template_id UUID NOT NULL REFERENCES public.presentation_templates(id) ON DELETE CASCADE,
  saved_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, template_id)
);

-- Enable RLS for saved templates
ALTER TABLE public.user_saved_templates ENABLE ROW LEVEL SECURITY;

-- Users can view their own saved templates
CREATE POLICY "Users can view their saved templates"
ON public.user_saved_templates
FOR SELECT
USING (auth.uid() = user_id);

-- Users can save templates
CREATE POLICY "Users can save templates"
ON public.user_saved_templates
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can unsave templates
CREATE POLICY "Users can unsave templates"
ON public.user_saved_templates
FOR DELETE
USING (auth.uid() = user_id);

-- Insert some system templates for different industries
INSERT INTO public.presentation_templates (
  name, description, category, industry, segment, content_types,
  preview_gradient, slide_count, primary_color, secondary_color, accent_color,
  features, tags, is_system_template, is_public, template_data
) VALUES
-- Healthcare
('Healthcare Modern', 'Clean clinical design for healthcare presentations', 'healthcare', 'healthcare', 'enterprise', ARRAY['narrative', 'strategic'],
 'linear-gradient(135deg, #0891b2 0%, #06b6d4 100%)', 12, '#0891b2', '#06b6d4', '#14b8a6',
 ARRAY['infographics', 'charts', 'tables'], ARRAY['healthcare', 'clinical', 'medical', 'HIPAA'], true, true,
 '{"id": "healthcare-modern", "name": "Healthcare Modern"}'::jsonb),

-- Consulting
('Consulting Framework', 'McKinsey-style strategic consulting template', 'business', 'consulting', 'enterprise', ARRAY['strategic', 'research'],
 'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)', 14, '#1e40af', '#3b82f6', '#f59e0b',
 ARRAY['charts', 'diagrams', 'tables'], ARRAY['consulting', 'strategy', 'McKinsey', 'BCG'], true, true,
 '{"id": "consulting-framework", "name": "Consulting Framework"}'::jsonb),

-- Technology
('Tech Startup', 'Modern tech startup pitch deck', 'tech', 'technology', 'startup', ARRAY['narrative', 'marketing'],
 'linear-gradient(135deg, #7c3aed 0%, #8b5cf6 100%)', 10, '#7c3aed', '#8b5cf6', '#06b6d4',
 ARRAY['infographics', 'icons'], ARRAY['tech', 'startup', 'pitch', 'modern'], true, true,
 '{"id": "tech-startup", "name": "Tech Startup"}'::jsonb),

-- Finance
('Financial Review', 'Professional financial reporting template', 'business', 'finance', 'enterprise', ARRAY['research', 'compliance'],
 'linear-gradient(135deg, #1f2937 0%, #374151 100%)', 16, '#1f2937', '#374151', '#10b981',
 ARRAY['charts', 'tables', 'diagrams'], ARRAY['finance', 'banking', 'quarterly', 'report'], true, true,
 '{"id": "financial-review", "name": "Financial Review"}'::jsonb),

-- Education
('Academic Research', 'Clean template for academic presentations', 'education', 'education', 'academic', ARRAY['research', 'narrative'],
 'linear-gradient(135deg, #1e3a5f 0%, #2563eb 100%)', 12, '#1e3a5f', '#2563eb', '#fbbf24',
 ARRAY['charts', 'tables', 'quotes'], ARRAY['academic', 'research', 'university', 'education'], true, true,
 '{"id": "academic-research", "name": "Academic Research"}'::jsonb),

-- Manufacturing
('Manufacturing Ops', 'Industrial operations and process template', 'business', 'manufacturing', 'enterprise', ARRAY['strategic', 'compliance'],
 'linear-gradient(135deg, #059669 0%, #34d399 100%)', 14, '#059669', '#34d399', '#f59e0b',
 ARRAY['diagrams', 'timelines', 'tables'], ARRAY['manufacturing', 'operations', 'industrial', 'process'], true, true,
 '{"id": "manufacturing-ops", "name": "Manufacturing Ops"}'::jsonb),

-- Pharma
('Pharma Research', 'Clinical trial and pharma research template', 'healthcare', 'pharma', 'enterprise', ARRAY['research', 'compliance'],
 'linear-gradient(135deg, #0d9488 0%, #2dd4bf 100%)', 18, '#0d9488', '#2dd4bf', '#8b5cf6',
 ARRAY['charts', 'tables', 'diagrams', 'timelines'], ARRAY['pharma', 'clinical', 'research', 'FDA'], true, true,
 '{"id": "pharma-research", "name": "Pharma Research"}'::jsonb),

-- Marketing
('Marketing Campaign', 'Bold creative marketing template', 'creative', 'marketing', 'agency', ARRAY['marketing', 'visual'],
 'linear-gradient(135deg, #ec4899 0%, #f97316 100%)', 10, '#ec4899', '#f97316', '#fbbf24',
 ARRAY['infographics', 'icons', 'quotes'], ARRAY['marketing', 'campaign', 'creative', 'brand'], true, true,
 '{"id": "marketing-campaign", "name": "Marketing Campaign"}'::jsonb);