-- Regional Pricing Configuration Table
-- Supports flexible region-based pricing with master toggle for instant on/off

CREATE TABLE IF NOT EXISTS public.genie_regional_pricing (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  region_code TEXT NOT NULL UNIQUE,
  region_name TEXT NOT NULL,
  display_name TEXT NOT NULL,
  currency_code TEXT NOT NULL DEFAULT 'USD',
  language_zone TEXT NOT NULL DEFAULT 'global',
  default_language TEXT NOT NULL DEFAULT 'en',
  supported_languages TEXT[] DEFAULT ARRAY['en'],
  is_active BOOLEAN NOT NULL DEFAULT false,
  is_default BOOLEAN NOT NULL DEFAULT false,
  stripe_price_ids JSONB DEFAULT '{}',
  payment_methods TEXT[] DEFAULT ARRAY['card'],
  ppp_multiplier NUMERIC(4,2) DEFAULT 1.00,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Regional Pricing Master Settings
CREATE TABLE IF NOT EXISTS public.genie_pricing_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  setting_key TEXT NOT NULL UNIQUE,
  setting_value JSONB NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Insert master toggle (default: regional pricing OFF, fallback to global)
INSERT INTO public.genie_pricing_settings (setting_key, setting_value, description)
VALUES 
  ('is_regional_enabled', 'false', 'Master toggle for regional pricing. When false, uses global pricing only.'),
  ('fallback_region', '"global"', 'Region code to use when user region is not detected or inactive'),
  ('geo_detection_enabled', 'true', 'Enable/disable IP-based geo detection')
ON CONFLICT (setting_key) DO NOTHING;

-- Insert default regions (initially inactive, ready for activation)
INSERT INTO public.genie_regional_pricing (region_code, region_name, display_name, currency_code, language_zone, default_language, supported_languages, is_active, is_default, payment_methods, ppp_multiplier)
VALUES
  ('global', 'Global/US', 'United States', 'USD', 'global', 'en', ARRAY['en', 'es'], true, true, ARRAY['card'], 1.00),
  ('india', 'India', 'भारत', 'INR', 'gemini', 'hi', ARRAY['hi', 'en', 'ta', 'te', 'bn', 'mr', 'gu', 'kn', 'ml', 'pa'], false, false, ARRAY['card', 'upi'], 0.25),
  ('africa', 'Africa', 'Africa', 'USD', 'africa', 'en', ARRAY['en', 'sw', 'fr', 'ar', 'am', 'yo', 'zu'], false, false, ARRAY['card', 'mobile_money'], 0.20),
  ('mea', 'Middle East & Africa', 'الشرق الأوسط', 'USD', 'arabic', 'ar', ARRAY['ar', 'en', 'he', 'fa', 'tr'], false, false, ARRAY['card'], 0.40),
  ('sea', 'Southeast Asia', 'Southeast Asia', 'USD', 'gemini', 'en', ARRAY['en', 'id', 'th', 'vi', 'ms', 'tl'], false, false, ARRAY['card'], 0.35),
  ('caribbean', 'Caribbean', 'Caribbean', 'USD', 'global', 'en', ARRAY['en', 'es', 'fr'], false, false, ARRAY['card'], 0.50),
  ('latam', 'Latin America', 'América Latina', 'USD', 'global', 'es', ARRAY['es', 'pt', 'en'], false, false, ARRAY['card'], 0.40),
  ('europe', 'Europe', 'Europe', 'EUR', 'claude', 'en', ARRAY['en', 'de', 'fr', 'es', 'it', 'nl', 'pl'], false, false, ARRAY['card'], 0.90),
  ('cjk', 'China/Japan/Korea', '中日韩', 'USD', 'alibaba', 'zh', ARRAY['zh', 'ja', 'ko'], false, false, ARRAY['card'], 0.60)
ON CONFLICT (region_code) DO NOTHING;

-- Enable RLS
ALTER TABLE public.genie_regional_pricing ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.genie_pricing_settings ENABLE ROW LEVEL SECURITY;

-- Public read access for pricing (needed for checkout)
CREATE POLICY "Regional pricing is publicly readable" 
ON public.genie_regional_pricing 
FOR SELECT 
USING (true);

CREATE POLICY "Pricing settings are publicly readable" 
ON public.genie_pricing_settings 
FOR SELECT 
USING (true);

-- Admin-only write access (via service role)
CREATE POLICY "Only admins can modify regional pricing" 
ON public.genie_regional_pricing 
FOR ALL 
USING (false);

CREATE POLICY "Only admins can modify pricing settings" 
ON public.genie_pricing_settings 
FOR ALL 
USING (false);

-- Update timestamp trigger
CREATE OR REPLACE FUNCTION public.update_regional_pricing_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_genie_regional_pricing_timestamp
BEFORE UPDATE ON public.genie_regional_pricing
FOR EACH ROW
EXECUTE FUNCTION public.update_regional_pricing_timestamp();

CREATE TRIGGER update_genie_pricing_settings_timestamp
BEFORE UPDATE ON public.genie_pricing_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_regional_pricing_timestamp();