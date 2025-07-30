-- Insert sample manufacturers with correct column names
INSERT INTO public.manufacturers (name, manufacturer_type, headquarters_location, manufacturing_capabilities, regulatory_certifications, contact_information, is_active) VALUES
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

-- Create some commercial product records for approved products
INSERT INTO public.commercial_products (product_id, launch_date, market_regions, reimbursement_status, patient_access_programs, distribution_channels, volume_projections, competitive_landscape, key_opinion_leaders, medical_affairs_contacts, is_active)
SELECT 
  p.id,
  CASE 
    WHEN p.approval_date IS NOT NULL THEN p.approval_date + INTERVAL '6 months'
    ELSE '2023-01-01'::date
  END,
  ARRAY['US', 'EU', 'Canada'],
  '{"medicare": "covered", "medicaid": "prior_auth", "commercial": "tier_2"}'::jsonb,
  '{"patient_assistance": true, "copay_program": true, "free_drug_program": true}'::jsonb,
  ARRAY['specialty_pharmacy', 'hospital_direct', 'clinic_network'],
  '{"year1": 1000, "year2": 2500, "year3": 5000}'::jsonb,
  '{"competitors": ["Product A", "Product B"], "market_share": "15%"}'::jsonb,
  ARRAY['Dr. Smith (Oncology)', 'Dr. Johnson (Hematology)'],
  '{"medical_director": "medical@company.com", "field_team": "+1-800-MEDICAL"}'::jsonb,
  true
FROM products p
WHERE p.product_status = 'approved' 
AND p.is_active = true
AND NOT EXISTS (SELECT 1 FROM commercial_products cp WHERE cp.product_id = p.id);