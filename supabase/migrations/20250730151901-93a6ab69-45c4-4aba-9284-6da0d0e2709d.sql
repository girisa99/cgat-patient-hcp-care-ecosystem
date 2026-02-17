-- Generate more products per therapy using enhanced AI orchestrator
-- Update healthcare-agentic-orchestrator to generate 3-5 products per AI provider

-- First, let's also create some commercial product records and manufacturers
-- Insert sample manufacturers
INSERT INTO public.manufacturers (name, company_type, headquarters_location, manufacturing_capabilities, regulatory_certifications, contact_information, is_active) VALUES
('BioCell Therapeutics Inc.', 'biotech', 'Boston, MA, USA', '{"cell_processing": true, "gmp_manufacturing": true, "cold_chain": true}', '["FDA", "EMA", "PMDA"]', '{"website": "www.biocell.com", "email": "contact@biocell.com"}', true),
('GeneTech Solutions', 'gene_therapy', 'South San Francisco, CA, USA', '{"viral_vectors": true, "gene_editing": true, "analytical_testing": true}', '["FDA", "EMA"]', '{"website": "www.genetech.com", "email": "info@genetech.com"}', true),
('Precision Medicine Corp', 'biotech', 'Cambridge, MA, USA', '{"companion_diagnostics": true, "biomarker_analysis": true, "sequencing": true}', '["FDA", "CAP", "CLIA"]', '{"website": "www.precisionmed.com", "email": "contact@precisionmed.com"}', true),
('RadioPharma Inc.', 'pharmaceutical', 'Princeton, NJ, USA', '{"radiopharmaceuticals": true, "isotope_production": true, "nuclear_medicine": true}', '["FDA", "NRC", "EMA"]', '{"website": "www.radiopharma.com", "email": "info@radiopharma.com"}', true)
ON CONFLICT (name) DO NOTHING;

-- Update existing products to have manufacturer relationships
UPDATE public.products 
SET manufacturer_id = (
  SELECT id FROM public.manufacturers 
  WHERE (products.therapy_id IN (
    SELECT id FROM therapies WHERE therapy_type = 'cell_therapy'
  ) AND manufacturers.company_type = 'biotech')
  OR (products.therapy_id IN (
    SELECT id FROM therapies WHERE therapy_type = 'gene_therapy'  
  ) AND manufacturers.company_type = 'gene_therapy')
  OR (products.therapy_id IN (
    SELECT id FROM therapies WHERE therapy_type = 'personalized_medicine'
  ) AND manufacturers.company_type = 'biotech')
  OR (products.therapy_id IN (
    SELECT id FROM therapies WHERE therapy_type = 'radioligand_therapy'
  ) AND manufacturers.company_type = 'pharmaceutical')
  LIMIT 1
)
WHERE manufacturer_id IS NULL;