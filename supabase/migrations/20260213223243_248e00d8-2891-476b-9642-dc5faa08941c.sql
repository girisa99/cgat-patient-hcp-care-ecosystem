-- User AI Preferences: stores global provider defaults per user
-- Follows "Both" override model: global defaults + per-template overrides

CREATE TABLE public.user_ai_preferences (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  -- Provider selections (array of provider value strings)
  selected_providers TEXT[] NOT NULL DEFAULT '{}',
  -- Category-specific overrides (optional fine-grained control)
  category_overrides JSONB DEFAULT '{}',
  -- Which Genie product this preference applies to (null = all products)
  product_scope TEXT DEFAULT NULL,
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  -- One preference set per user per product scope
  UNIQUE(user_id, product_scope)
);

-- Enable RLS
ALTER TABLE public.user_ai_preferences ENABLE ROW LEVEL SECURITY;

-- Users can only read their own preferences
CREATE POLICY "Users can view own AI preferences"
  ON public.user_ai_preferences FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own preferences
CREATE POLICY "Users can create own AI preferences"
  ON public.user_ai_preferences FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own preferences
CREATE POLICY "Users can update own AI preferences"
  ON public.user_ai_preferences FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete their own preferences
CREATE POLICY "Users can delete own AI preferences"
  ON public.user_ai_preferences FOR DELETE
  USING (auth.uid() = user_id);

-- Auto-update timestamp trigger
CREATE TRIGGER update_user_ai_preferences_updated_at
  BEFORE UPDATE ON public.user_ai_preferences
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
