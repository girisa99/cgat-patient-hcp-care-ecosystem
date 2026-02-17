-- Add product context (UUID to match marketing_products.id)
ALTER TABLE public.regional_narration_scripts 
ADD COLUMN product_id UUID REFERENCES public.marketing_products(id) ON DELETE CASCADE;

ALTER TABLE public.tts_audio_versions 
ADD COLUMN product_id UUID REFERENCES public.marketing_products(id) ON DELETE CASCADE;

-- Indexing for fast product-aware lookups
CREATE INDEX idx_scripts_product_lookup ON public.regional_narration_scripts(product_id, region_code, status);
CREATE INDEX idx_tts_product_lookup ON public.tts_audio_versions(product_id, region_code);
CREATE INDEX idx_scripts_by_product ON public.regional_narration_scripts(product_id);
CREATE INDEX idx_tts_by_product ON public.tts_audio_versions(product_id);