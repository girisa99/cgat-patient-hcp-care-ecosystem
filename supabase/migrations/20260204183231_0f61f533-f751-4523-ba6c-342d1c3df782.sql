-- ============================================
-- VIDEO BLUEPRINTS SYSTEM
-- Database-driven template architecture for Genie Cast
-- Supports internal/external SaaS with multi-tenancy ready
-- ============================================

-- 1. MAIN BLUEPRINTS TABLE
-- Represents a complete video template (Product Demo, Social Ad, Tutorial, etc.)
CREATE TABLE public.video_blueprints (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL DEFAULT 'marketing',
    thumbnail_url TEXT,
    preview_video_url TEXT,
    
    -- Template metadata
    estimated_duration_seconds INTEGER DEFAULT 60,
    target_platform TEXT[] DEFAULT ARRAY['youtube', 'tiktok', 'instagram'],
    industry_tags TEXT[] DEFAULT ARRAY[]::TEXT[],
    
    -- Default settings applied when using this blueprint
    default_settings JSONB DEFAULT '{}'::JSONB,
    
    -- Style configuration (visual, audio, transitions)
    style_preset JSONB DEFAULT '{}'::JSONB,
    
    -- Multi-tenancy support
    is_system_default BOOLEAN DEFAULT false,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    is_public BOOLEAN DEFAULT true,
    usage_count INTEGER DEFAULT 0,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 2. BLUEPRINT SCENES TABLE
-- Each scene within a blueprint (atomic unit, not chapters)
CREATE TABLE public.blueprint_scenes (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    blueprint_id UUID NOT NULL REFERENCES public.video_blueprints(id) ON DELETE CASCADE,
    
    -- Scene identification
    scene_key TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    order_index INTEGER NOT NULL DEFAULT 0,
    
    -- Scene type (intro, feature, testimonial, cta, transition, etc.)
    scene_type TEXT NOT NULL DEFAULT 'content',
    
    -- Script configuration
    script_template TEXT,
    script_variables JSONB DEFAULT '[]'::JSONB,
    
    -- Timing
    duration_seconds INTEGER DEFAULT 10,
    min_duration_seconds INTEGER DEFAULT 5,
    max_duration_seconds INTEGER DEFAULT 30,
    
    -- Visual configuration
    visual_config JSONB DEFAULT '{}'::JSONB,
    
    -- Audio configuration (TTS, music, SFX)
    audio_config JSONB DEFAULT '{}'::JSONB,
    
    -- Transition to next scene
    transition_config JSONB DEFAULT '{"type": "fade", "duration_ms": 500}'::JSONB,
    
    -- Flexibility
    is_optional BOOLEAN DEFAULT false,
    is_repeatable BOOLEAN DEFAULT false,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    
    UNIQUE(blueprint_id, scene_key)
);

-- 3. SCENE ELEMENTS TABLE
-- Individual elements within a scene (text, image, avatar, logo, etc.)
CREATE TABLE public.scene_elements (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    scene_id UUID NOT NULL REFERENCES public.blueprint_scenes(id) ON DELETE CASCADE,
    
    -- Element identification
    element_key TEXT NOT NULL,
    element_type TEXT NOT NULL, -- text, image, avatar, logo, video, audio, shape, animation
    
    -- Layer ordering (z-index)
    layer_order INTEGER DEFAULT 0,
    
    -- Position and size (percentage-based for responsive)
    position_x DECIMAL DEFAULT 50,
    position_y DECIMAL DEFAULT 50,
    width_percent DECIMAL DEFAULT 100,
    height_percent DECIMAL DEFAULT 100,
    
    -- Element-specific configuration
    element_config JSONB DEFAULT '{}'::JSONB,
    
    -- Animation
    entrance_animation JSONB DEFAULT '{}'::JSONB,
    exit_animation JSONB DEFAULT '{}'::JSONB,
    
    -- Timing within scene
    start_time_ms INTEGER DEFAULT 0,
    end_time_ms INTEGER,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    
    UNIQUE(scene_id, element_key)
);

-- 4. BLUEPRINT ASSIGNMENTS TABLE
-- Links blueprints to products/campaigns
CREATE TABLE public.blueprint_assignments (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    blueprint_id UUID NOT NULL REFERENCES public.video_blueprints(id) ON DELETE CASCADE,
    
    -- Assignment target
    product_id TEXT, -- Links to marketing_products
    campaign_id UUID,
    
    -- Customization overrides
    scene_overrides JSONB DEFAULT '{}'::JSONB,
    style_overrides JSONB DEFAULT '{}'::JSONB,
    
    -- Assignment metadata
    assigned_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    is_active BOOLEAN DEFAULT true,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- ============================================
-- INDEXES
-- ============================================
CREATE INDEX idx_video_blueprints_category ON public.video_blueprints(category);
CREATE INDEX idx_video_blueprints_active ON public.video_blueprints(is_active, is_public);
CREATE INDEX idx_video_blueprints_created_by ON public.video_blueprints(created_by);
CREATE INDEX idx_blueprint_scenes_blueprint ON public.blueprint_scenes(blueprint_id, order_index);
CREATE INDEX idx_scene_elements_scene ON public.scene_elements(scene_id, layer_order);
CREATE INDEX idx_blueprint_assignments_blueprint ON public.blueprint_assignments(blueprint_id);
CREATE INDEX idx_blueprint_assignments_product ON public.blueprint_assignments(product_id);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

-- Enable RLS
ALTER TABLE public.video_blueprints ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blueprint_scenes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scene_elements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blueprint_assignments ENABLE ROW LEVEL SECURITY;

-- VIDEO_BLUEPRINTS policies
-- Everyone can view public/system blueprints
CREATE POLICY "Anyone can view public blueprints" 
ON public.video_blueprints 
FOR SELECT 
USING (is_public = true OR is_system_default = true OR auth.uid() = created_by);

-- Authenticated users can create blueprints
CREATE POLICY "Authenticated users can create blueprints" 
ON public.video_blueprints 
FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);

-- Users can update their own blueprints
CREATE POLICY "Users can update own blueprints" 
ON public.video_blueprints 
FOR UPDATE 
USING (auth.uid() = created_by OR is_system_default = false);

-- Users can delete their own blueprints
CREATE POLICY "Users can delete own blueprints" 
ON public.video_blueprints 
FOR DELETE 
USING (auth.uid() = created_by AND is_system_default = false);

-- BLUEPRINT_SCENES policies (inherit from parent blueprint)
CREATE POLICY "Anyone can view scenes of accessible blueprints" 
ON public.blueprint_scenes 
FOR SELECT 
USING (
    EXISTS (
        SELECT 1 FROM public.video_blueprints 
        WHERE id = blueprint_id 
        AND (is_public = true OR is_system_default = true OR created_by = auth.uid())
    )
);

CREATE POLICY "Authenticated users can manage scenes" 
ON public.blueprint_scenes 
FOR ALL 
USING (auth.uid() IS NOT NULL);

-- SCENE_ELEMENTS policies (inherit from parent scene)
CREATE POLICY "Anyone can view elements of accessible scenes" 
ON public.scene_elements 
FOR SELECT 
USING (
    EXISTS (
        SELECT 1 FROM public.blueprint_scenes bs
        JOIN public.video_blueprints vb ON bs.blueprint_id = vb.id
        WHERE bs.id = scene_id 
        AND (vb.is_public = true OR vb.is_system_default = true OR vb.created_by = auth.uid())
    )
);

CREATE POLICY "Authenticated users can manage elements" 
ON public.scene_elements 
FOR ALL 
USING (auth.uid() IS NOT NULL);

-- BLUEPRINT_ASSIGNMENTS policies
CREATE POLICY "Users can view their assignments" 
ON public.blueprint_assignments 
FOR SELECT 
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can manage their assignments" 
ON public.blueprint_assignments 
FOR ALL 
USING (auth.uid() = assigned_by OR auth.uid() IS NOT NULL);

-- ============================================
-- TRIGGERS
-- ============================================

-- Update timestamp trigger
CREATE OR REPLACE FUNCTION public.update_blueprint_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_video_blueprints_timestamp
BEFORE UPDATE ON public.video_blueprints
FOR EACH ROW EXECUTE FUNCTION public.update_blueprint_timestamp();

CREATE TRIGGER update_blueprint_scenes_timestamp
BEFORE UPDATE ON public.blueprint_scenes
FOR EACH ROW EXECUTE FUNCTION public.update_blueprint_timestamp();

CREATE TRIGGER update_scene_elements_timestamp
BEFORE UPDATE ON public.scene_elements
FOR EACH ROW EXECUTE FUNCTION public.update_blueprint_timestamp();

CREATE TRIGGER update_blueprint_assignments_timestamp
BEFORE UPDATE ON public.blueprint_assignments
FOR EACH ROW EXECUTE FUNCTION public.update_blueprint_timestamp();