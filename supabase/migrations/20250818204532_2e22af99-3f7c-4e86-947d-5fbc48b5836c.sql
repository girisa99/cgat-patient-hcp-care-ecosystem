-- Secure sensitive public tables (fix security errors)
-- Enable RLS and restrict reads to authenticated users only

ALTER TABLE public.treatment_center_onboarding ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clinical_trials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.commercial_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.manufacturers ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for authenticated users only
CREATE POLICY "Authenticated read treatment_center_onboarding"
ON public.treatment_center_onboarding
FOR SELECT
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated read clinical_trials"
ON public.clinical_trials
FOR SELECT
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated read commercial_products"
ON public.commercial_products
FOR SELECT
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated read products"
ON public.products
FOR SELECT
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated read manufacturers"
ON public.manufacturers
FOR SELECT
USING (auth.uid() IS NOT NULL);