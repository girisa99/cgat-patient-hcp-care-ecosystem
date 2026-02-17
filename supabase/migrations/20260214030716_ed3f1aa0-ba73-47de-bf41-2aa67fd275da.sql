-- Create product_audience_relevance table for learning audience-product affinities
CREATE TABLE IF NOT EXISTS public.product_audience_relevance (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id TEXT NOT NULL,
  audience_id TEXT NOT NULL,
  relevance_score DECIMAL(3,2) NOT NULL DEFAULT 0.5,
  feedback_count INTEGER NOT NULL DEFAULT 0,
  positive_feedback INTEGER NOT NULL DEFAULT 0,
  negative_feedback INTEGER NOT NULL DEFAULT 0,
  last_feedback_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(product_id, audience_id)
);

-- Enable RLS
ALTER TABLE public.product_audience_relevance ENABLE ROW LEVEL SECURITY;

-- Allow read access to all authenticated users (learning data is shared)
CREATE POLICY "Allow read access to relevance scores"
  ON public.product_audience_relevance
  FOR SELECT
  USING (true);

-- Allow admin/service role to update scores
CREATE POLICY "Allow updates to relevance scores"
  ON public.product_audience_relevance
  FOR UPDATE
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- Allow inserts for new product-audience combinations
CREATE POLICY "Allow inserts of new relevance entries"
  ON public.product_audience_relevance
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- Trigger to update the updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_product_audience_relevance_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_product_audience_relevance_updated_at
  BEFORE UPDATE ON public.product_audience_relevance
  FOR EACH ROW
  EXECUTE FUNCTION public.update_product_audience_relevance_updated_at();