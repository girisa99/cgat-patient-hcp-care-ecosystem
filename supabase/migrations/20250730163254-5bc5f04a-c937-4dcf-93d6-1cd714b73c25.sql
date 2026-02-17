-- Add missing major pharmaceutical manufacturers
INSERT INTO public.manufacturers (name, manufacturer_type, headquarters_location, manufacturing_capabilities, quality_certifications, partnership_tier, is_active) VALUES
('Roche', 'pharma', 'Basel, Switzerland', ARRAY['Biologics', 'Monoclonal Antibodies', 'CAR-T Cell Therapy'], ARRAY['FDA', 'EMA', 'Swissmedic', 'GMP'], 'preferred', true),
('Genentech', 'biotech', 'South San Francisco, CA', ARRAY['Biologics', 'Monoclonal Antibodies', 'Gene Therapy'], ARRAY['FDA', 'EMA', 'GMP'], 'preferred', true),
('Biogen', 'biotech', 'Cambridge, MA', ARRAY['Biologics', 'Neurological Therapies', 'Gene Therapy'], ARRAY['FDA', 'EMA', 'GMP'], 'preferred', true),
('Bristol Myers Squibb', 'pharma', 'New York, NY', ARRAY['CAR-T Cell Therapy', 'Immunotherapy', 'Oncology'], ARRAY['FDA', 'EMA', 'GMP'], 'preferred', true),
('Rocket Pharmaceuticals', 'biotech', 'New York, NY', ARRAY['Gene Therapy', 'Lentiviral Vectors', 'AAV Vectors'], ARRAY['FDA', 'EMA', 'GMP'], 'standard', true),
('Iovance Biotherapeutics', 'biotech', 'San Carlos, CA', ARRAY['TIL Therapy', 'Tumor Infiltrating Lymphocytes', 'Cell Therapy'], ARRAY['FDA', 'EMA', 'GMP'], 'standard', true),
('CRISPR Therapeutics', 'biotech', 'Zug, Switzerland', ARRAY['Gene Editing', 'CRISPR/Cas9', 'Cell Therapy'], ARRAY['FDA', 'EMA', 'GMP'], 'preferred', true),
('Spark Therapeutics (Roche)', 'biotech', 'Philadelphia, PA', ARRAY['AAV Gene Therapy', 'Retinal Gene Therapy'], ARRAY['FDA', 'EMA', 'GMP'], 'preferred', true)
ON CONFLICT (name) DO NOTHING;

-- Add major commercial products for these manufacturers
INSERT INTO public.products (name, indication, product_status, approval_date, manufacturer_id, pricing_information, dosing_information, distribution_requirements, market_access_considerations, is_active)
SELECT 
  product_name,
  indication,
  product_status::product_status,
  approval_date::date,
  m.id,
  pricing_info::jsonb,
  dosing_info::jsonb,
  distribution_reqs::jsonb,
  market_access::jsonb,
  true
FROM (VALUES
  ('Tecentriq (atezolizumab)', 'Non-Small Cell Lung Cancer, Breast Cancer', 'approved', '2016-05-18', 'Roche', '{"currency": "USD", "list_price": 12500}', '{"frequency": "Q3W", "dose": "1200mg"}', '{"cold_chain": true, "specialty_pharmacy": true}', '{"prior_authorization": true, "step_therapy": false}'),
  ('Avastin (bevacizumab)', 'Colorectal Cancer, Lung Cancer', 'approved', '2004-02-26', 'Roche', '{"currency": "USD", "list_price": 8500}', '{"frequency": "Q2W", "dose": "5-15mg/kg"}', '{"cold_chain": true, "hospital_only": true}', '{"prior_authorization": true, "specialty_distribution": true}'),
  ('Herceptin (trastuzumab)', 'HER2+ Breast Cancer', 'approved', '1998-09-25', 'Genentech', '{"currency": "USD", "list_price": 9500}', '{"frequency": "Q3W", "dose": "6mg/kg"}', '{"cold_chain": true, "specialty_pharmacy": true}', '{"biomarker_testing": true, "prior_authorization": true}'),
  ('Kadcyla (ado-trastuzumab emtansine)', 'HER2+ Metastatic Breast Cancer', 'approved', '2013-02-22', 'Genentech', '{"currency": "USD", "list_price": 13500}', '{"frequency": "Q3W", "dose": "3.6mg/kg"}', '{"cold_chain": true, "specialty_pharmacy": true}', '{"biomarker_testing": true, "prior_authorization": true}'),
  ('Spinraza (nusinersen)', 'Spinal Muscular Atrophy', 'approved', '2016-12-23', 'Biogen', '{"currency": "USD", "list_price": 125000}', '{"intrathecal": true, "loading_dose": true}', '{"neurologist_only": true, "lumbar_puncture": true}', '{"genetic_testing": true, "prior_authorization": true}'),
  ('Aduhelm (aducanumab)', 'Alzheimers Disease', 'approved', '2021-06-07', 'Biogen', '{"currency": "USD", "list_price": 56000}', '{"frequency": "monthly", "dose": "10mg/kg"}', '{"PET_imaging": true, "MRI_monitoring": true}', '{"amyloid_testing": true, "ARIA_monitoring": true}'),
  ('Breyanzi (lisocabtagene maraleucel)', 'Diffuse Large B-Cell Lymphoma', 'approved', '2021-02-05', 'Bristol Myers Squibb', '{"currency": "USD", "list_price": 410300}', '{"single_infusion": true, "lymphodepletion": true}', '{"REMS_program": true, "certified_centers": true}', '{"CAR-T_center": true, "prior_authorization": true}'),
  ('Abecma (idecabtagene vicleucel)', 'Multiple Myeloma', 'approved', '2021-03-26', 'Bristol Myers Squibb', '{"currency": "USD", "list_price": 419500}', '{"single_infusion": true, "lymphodepletion": true}', '{"REMS_program": true, "certified_centers": true}', '{"CAR-T_center": true, "prior_authorization": true}'),
  ('Kresladi (beremagene geperpavec)', 'Dystrophic Epidermolysis Bullosa', 'approved', '2023-05-19', 'Rocket Pharmaceuticals', '{"currency": "USD", "list_price": 4250000}', '{"topical_gel": true, "weekly_application": true}', '{"specialized_wound_care": true, "cold_chain": true}', '{"genetic_testing": true, "specialized_center": true}'),
  ('Amtagvi (lifileucel)', 'Metastatic Melanoma', 'approved', '2024-02-16', 'Iovance Biotherapeutics', '{"currency": "USD", "list_price": 515000}', '{"single_infusion": true, "lymphodepletion": true}', '{"TIL_center": true, "specialized_manufacturing": true}', '{"tumor_resection": true, "prior_immunotherapy": true}'),
  ('Casgevy (exagamglogene autotemcel)', 'Sickle Cell Disease, Beta Thalassemia', 'approved', '2023-12-08', 'CRISPR Therapeutics', '{"currency": "USD", "list_price": 2200000}', '{"single_infusion": true, "gene_editing": true}', '{"specialized_centers": true, "long_term_followup": true}', '{"genetic_counseling": true, "prior_authorization": true}'),
  ('Zolgensma (onasemnogene abeparvovec)', 'Spinal Muscular Atrophy', 'approved', '2019-05-24', 'Spark Therapeutics (Roche)', '{"currency": "USD", "list_price": 2125000}', '{"single_IV_infusion": true, "weight_based": true}', '{"age_restriction": true, "genetic_testing": true}', '{"SMN1_deletion": true, "pre_dose_steroids": true}')
) AS v(product_name, indication, product_status, approval_date, manufacturer_name, pricing_info, dosing_info, distribution_reqs, market_access)
JOIN manufacturers m ON m.name = v.manufacturer_name
ON CONFLICT (name) DO NOTHING;

-- Add corresponding commercial products records
INSERT INTO public.commercial_products (product_id, launch_date, market_regions, reimbursement_status, competitive_landscape, patient_access_programs, distribution_channels, volume_projections, is_active)
SELECT 
  p.id,
  p.approval_date,
  ARRAY['US', 'EU', 'Japan'],
  CASE 
    WHEN p.name LIKE '%Amtagvi%' OR p.name LIKE '%Casgevy%' OR p.name LIKE '%Zolgensma%' THEN '{"status": "limited", "coverage": "specialty"}'
    WHEN p.name LIKE '%Aduhelm%' THEN '{"status": "controversial", "coverage": "limited"}'
    ELSE '{"status": "covered", "coverage": "broad"}'
  END::jsonb,
  '{"market_position": "leading", "key_competitors": 2}'::jsonb,
  '{"copay_assistance": true, "patient_support": true}'::jsonb,
  ARRAY['specialty_pharmacy', 'hospital_direct'],
  '{"peak_sales": "1B+", "patient_population": "orphan"}'::jsonb,
  true
FROM products p
WHERE p.name IN (
  'Tecentriq (atezolizumab)', 'Avastin (bevacizumab)', 'Herceptin (trastuzumab)', 
  'Kadcyla (ado-trastuzumab emtansine)', 'Spinraza (nusinersen)', 'Aduhelm (aducanumab)',
  'Breyanzi (lisocabtagene maraleucel)', 'Abecma (idecabtagene vicleucel)', 
  'Kresladi (beremagene geperpavec)', 'Amtagvi (lifileucel)', 
  'Casgevy (exagamglogene autotemcel)', 'Zolgensma (onasemnogene abeparvovec)'
)
AND NOT EXISTS (
  SELECT 1 FROM commercial_products cp WHERE cp.product_id = p.id
);