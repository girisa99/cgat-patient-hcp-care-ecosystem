-- Insert sample manufacturers (without conflict handling since there's no unique constraint)
INSERT INTO public.manufacturers (name, manufacturer_type, headquarters_location, manufacturing_capabilities, quality_certifications, contact_info, is_active) 
SELECT 'BioCell Therapeutics Inc.', 'biotech', 'Boston, MA, USA', ARRAY['cell_processing', 'gmp_manufacturing', 'cold_chain'], ARRAY['FDA', 'EMA', 'PMDA'], '{"website": "www.biocell.com", "email": "contact@biocell.com"}', true
WHERE NOT EXISTS (SELECT 1 FROM manufacturers WHERE name = 'BioCell Therapeutics Inc.');

INSERT INTO public.manufacturers (name, manufacturer_type, headquarters_location, manufacturing_capabilities, quality_certifications, contact_info, is_active) 
SELECT 'GeneTech Solutions', 'gene_therapy', 'South San Francisco, CA, USA', ARRAY['viral_vectors', 'gene_editing', 'analytical_testing'], ARRAY['FDA', 'EMA'], '{"website": "www.genetech.com", "email": "info@genetech.com"}', true
WHERE NOT EXISTS (SELECT 1 FROM manufacturers WHERE name = 'GeneTech Solutions');

INSERT INTO public.manufacturers (name, manufacturer_type, headquarters_location, manufacturing_capabilities, quality_certifications, contact_info, is_active) 
SELECT 'Precision Medicine Corp', 'biotech', 'Cambridge, MA, USA', ARRAY['companion_diagnostics', 'biomarker_analysis', 'sequencing'], ARRAY['FDA', 'CAP', 'CLIA'], '{"website": "www.precisionmed.com", "email": "contact@precisionmed.com"}', true
WHERE NOT EXISTS (SELECT 1 FROM manufacturers WHERE name = 'Precision Medicine Corp');

INSERT INTO public.manufacturers (name, manufacturer_type, headquarters_location, manufacturing_capabilities, quality_certifications, contact_info, is_active) 
SELECT 'RadioPharma Inc.', 'pharmaceutical', 'Princeton, NJ, USA', ARRAY['radiopharmaceuticals', 'isotope_production', 'nuclear_medicine'], ARRAY['FDA', 'NRC', 'EMA'], '{"website": "www.radiopharma.com", "email": "info@radiopharma.com"}', true
WHERE NOT EXISTS (SELECT 1 FROM manufacturers WHERE name = 'RadioPharma Inc.');

-- Update existing products to have manufacturer relationships
UPDATE public.products 
SET manufacturer_id = (
  SELECT id FROM public.manufacturers 
  WHERE (products.therapy_id IN (
    SELECT id FROM therapies WHERE therapy_type = 'cell_therapy'
  ) AND manufacturers.manufacturer_type = 'biotech')
  OR (products.therapy_id IN (
    SELECT id FROM therapies WHERE therapy_type = 'gene_therapy'  
  ) AND manufacturers.manufacturer_type = 'gene_therapy')
  OR (products.therapy_id IN (
    SELECT id FROM therapies WHERE therapy_type = 'personalized_medicine'
  ) AND manufacturers.manufacturer_type = 'biotech')
  OR (products.therapy_id IN (
    SELECT id FROM therapies WHERE therapy_type = 'radioligand_therapy'
  ) AND manufacturers.manufacturer_type = 'pharmaceutical')
  LIMIT 1
)
WHERE manufacturer_id IS NULL;