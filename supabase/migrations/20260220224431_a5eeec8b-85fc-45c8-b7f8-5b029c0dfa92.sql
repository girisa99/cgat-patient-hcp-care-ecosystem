-- Add content_type (industry vertical) and location fields to marketing_products
ALTER TABLE public.marketing_products
  ADD COLUMN IF NOT EXISTS content_vertical text,
  ADD COLUMN IF NOT EXISTS business_zipcode text,
  ADD COLUMN IF NOT EXISTS business_city text,
  ADD COLUMN IF NOT EXISTS business_state text,
  ADD COLUMN IF NOT EXISTS business_country text DEFAULT 'US';

-- Add index for location-based queries
CREATE INDEX IF NOT EXISTS idx_marketing_products_location 
  ON public.marketing_products (business_country, business_state, business_city);

-- Add index for content vertical filtering
CREATE INDEX IF NOT EXISTS idx_marketing_products_vertical 
  ON public.marketing_products (content_vertical);

COMMENT ON COLUMN public.marketing_products.content_vertical IS 'Industry vertical: finance, travel, food_beverage, healthcare, technology, education, real_estate, retail, etc.';
COMMENT ON COLUMN public.marketing_products.business_zipcode IS 'Business location zipcode for local SMB enrichment';
COMMENT ON COLUMN public.marketing_products.business_city IS 'Business city for local search enrichment';
COMMENT ON COLUMN public.marketing_products.business_state IS 'Business state/province';
COMMENT ON COLUMN public.marketing_products.business_country IS 'Business country (ISO 2-letter code)';