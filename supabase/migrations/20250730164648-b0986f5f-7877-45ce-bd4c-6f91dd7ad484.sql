-- Add comprehensive clinical trials data for major commercial products
INSERT INTO public.clinical_trials (
  title, nct_number, trial_status, phase, primary_indication, patient_population,
  primary_endpoint, secondary_endpoints, enrollment_target, enrollment_current,
  start_date, estimated_completion_date, sponsor_info, trial_locations,
  investigational_sites, eligibility_criteria, product_id, is_active
)
SELECT 
  v.trial_title, 
  v.nct_num, 
  v.status::trial_status, 
  v.phase_val, 
  v.indication_val, 
  v.population,
  v.primary_ep, 
  v.secondary_eps::text[], 
  v.target_enrollment::integer, 
  v.current_enrollment::integer,
  v.start_dt::date, 
  v.completion_dt::date,
  v.sponsor_data::jsonb, 
  v.locations::text[], 
  v.sites::jsonb, 
  v.eligibility::jsonb,
  p.id,
  true
FROM (VALUES
  -- Roche Trials
  ('Tecentriq + Chemotherapy in 1L NSCLC', 'NCT02367781', 'completed', 'Phase 3', 'Non-Small Cell Lung Cancer', 'Treatment-naive metastatic NSCLC', 'Overall Survival', ARRAY['Progression-free survival', 'Objective response rate'], 800, 792, '2015-02-20', '2023-12-15', '{"sponsor": "Roche", "collaborators": ["ECOG-ACRIN"], "funding": "industry"}', ARRAY['United States', 'Europe', 'Asia'], '{"sites_count": 156, "countries": 23, "principal_investigators": ["Dr. Smith", "Dr. Johnson"]}', '{"age": "18+", "performance_status": "ECOG 0-1", "histology": "non-squamous NSCLC"}', 'Tecentriq (atezolizumab)'),
  ('Avastin in Metastatic Colorectal Cancer', 'NCT00109070', 'completed', 'Phase 3', 'Colorectal Cancer', 'Metastatic colorectal cancer', 'Overall Survival', ARRAY['Progression-free survival', 'Response rate'], 1401, 1401, '2005-04-15', '2008-10-30', '{"sponsor": "Roche", "collaborators": ["NCCTG"], "funding": "industry"}', ARRAY['United States', 'Canada'], '{"sites_count": 89, "countries": 2, "principal_investigators": ["Dr. Brown", "Dr. Davis"]}', '{"age": "18+", "histology": "adenocarcinoma", "metastatic": true}', 'Avastin (bevacizumab)'),
  
  -- Genentech Trials  
  ('Herceptin Adjuvant Breast Cancer Trial', 'NCT00045032', 'completed', 'Phase 3', 'HER2+ Breast Cancer', 'Early-stage HER2+ breast cancer', 'Disease-free Survival', ARRAY['Overall survival', 'Cardiac safety'], 3387, 3387, '2002-09-01', '2012-05-15', '{"sponsor": "Genentech", "collaborators": ["NSABP"], "funding": "industry"}', ARRAY['United States', 'Canada'], '{"sites_count": 234, "countries": 2, "principal_investigators": ["Dr. Wilson", "Dr. Miller"]}', '{"age": "18+", "HER2_status": "positive", "stage": "I-III"}', 'Herceptin (trastuzumab)'),
  ('Kadcyla in Metastatic HER2+ Breast Cancer', 'NCT00829166', 'completed', 'Phase 3', 'HER2+ Metastatic Breast Cancer', 'Previously treated HER2+ metastatic breast cancer', 'Progression-free Survival', ARRAY['Overall survival', 'Safety'], 991, 991, '2009-01-26', '2013-02-28', '{"sponsor": "Genentech", "collaborators": ["Roche"], "funding": "industry"}', ARRAY['United States', 'Europe', 'Asia-Pacific'], '{"sites_count": 213, "countries": 26, "principal_investigators": ["Dr. Garcia", "Dr. Rodriguez"]}', '{"age": "18+", "HER2_status": "positive", "prior_therapy": "trastuzumab"}', 'Kadcyla (ado-trastuzumab emtansine)'),
  
  -- Biogen Trials
  ('Spinraza in Infantile SMA', 'NCT02193074', 'completed', 'Phase 3', 'Spinal Muscular Atrophy', 'Infantile-onset SMA', 'Motor Milestone Response', ARRAY['Survival', 'Respiratory support'], 121, 121, '2014-08-08', '2016-08-15', '{"sponsor": "Biogen", "collaborators": ["Ionis Pharmaceuticals"], "funding": "industry"}', ARRAY['United States', 'Europe', 'Canada'], '{"sites_count": 31, "countries": 11, "principal_investigators": ["Dr. Anderson", "Dr. Martinez"]}', '{"age": "≤7 months", "SMA_type": "Type 1", "genetic_confirmation": true}', 'Spinraza (nusinersen)'),
  ('Aduhelm EMERGE Trial', 'NCT02484547', 'completed', 'Phase 3', 'Alzheimers Disease', 'Early Alzheimer disease', 'CDR-SB Change', ARRAY['MMSE', 'ADAS-Cog', 'Safety'], 1638, 1638, '2015-08-28', '2019-03-21', '{"sponsor": "Biogen", "collaborators": ["Neurimmune"], "funding": "industry"}', ARRAY['United States', 'Europe', 'Japan'], '{"sites_count": 348, "countries": 20, "principal_investigators": ["Dr. Thompson", "Dr. White"]}', '{"age": "50-85", "amyloid_positive": true, "MMSE": "24-30"}', 'Aduhelm (aducanumab)'),
  
  -- Bristol Myers Squibb Trials
  ('Breyanzi TRANSCEND Trial', 'NCT02631044', 'completed', 'Phase 2', 'Diffuse Large B-Cell Lymphoma', 'Relapsed/refractory DLBCL', 'Overall Response Rate', ARRAY['Complete response rate', 'Duration of response'], 269, 269, '2015-12-15', '2020-06-30', '{"sponsor": "Bristol Myers Squibb", "collaborators": ["Juno Therapeutics"], "funding": "industry"}', ARRAY['United States', 'Europe'], '{"sites_count": 71, "countries": 10, "principal_investigators": ["Dr. Clark", "Dr. Lewis"]}', '{"age": "18+", "histology": "DLBCL", "refractory": true}', 'Breyanzi (lisocabtagene maraleucel)'),
  ('Abecma KarMMa Trial', 'NCT03361748', 'completed', 'Phase 2', 'Multiple Myeloma', 'Relapsed/refractory multiple myeloma', 'Overall Response Rate', ARRAY['Complete response rate', 'Progression-free survival'], 128, 128, '2017-12-07', '2020-12-15', '{"sponsor": "Bristol Myers Squibb", "collaborators": ["bluebird bio"], "funding": "industry"}', ARRAY['United States'], '{"sites_count": 16, "countries": 1, "principal_investigators": ["Dr. Walker", "Dr. Hall"]}', '{"age": "18+", "prior_lines": "≥3", "CAR-T_naive": true}', 'Abecma (idecabtagene vicleucel)'),
  
  -- Rocket Pharmaceuticals Trials
  ('Kresladi DYSTOPIA Trial', 'NCT04491604', 'completed', 'Phase 3', 'Dystrophic Epidermolysis Bullosa', 'Dystrophic EB with COL7A1 mutations', 'Wound Healing', ARRAY['Pain reduction', 'Quality of life'], 31, 31, '2020-07-30', '2023-01-15', '{"sponsor": "Rocket Pharmaceuticals", "collaborators": ["Stanford University"], "funding": "industry"}', ARRAY['United States'], '{"sites_count": 8, "countries": 1, "principal_investigators": ["Dr. Young", "Dr. King"]}', '{"age": "≥1 year", "mutation": "COL7A1", "wound_size": "≥10cm²"}', 'Kresladi (beremagene geperpavec)'),
  
  -- Iovance Trials
  ('Amtagvi C-144-01 Trial', 'NCT02360579', 'completed', 'Phase 2', 'Metastatic Melanoma', 'Unresectable metastatic melanoma', 'Objective Response Rate', ARRAY['Duration of response', 'Overall survival'], 153, 153, '2015-02-09', '2022-08-30', '{"sponsor": "Iovance Biotherapeutics", "collaborators": ["NCI"], "funding": "industry"}', ARRAY['United States'], '{"sites_count": 12, "countries": 1, "principal_investigators": ["Dr. Adams", "Dr. Baker"]}', '{"age": "18+", "stage": "unresectable/metastatic", "prior_immunotherapy": true}', 'Amtagvi (lifileucel)'),
  
  -- CRISPR Therapeutics Trials
  ('Casgevy CTX001 SCD Trial', 'NCT03745287', 'completed', 'Phase 3', 'Sickle Cell Disease', 'Severe sickle cell disease', 'Vaso-occlusive Crises', ARRAY['Hemoglobin levels', 'Hospitalizations'], 31, 31, '2018-11-20', '2022-12-15', '{"sponsor": "CRISPR Therapeutics", "collaborators": ["Vertex Pharmaceuticals"], "funding": "industry"}', ARRAY['United States', 'Europe', 'Canada'], '{"sites_count": 12, "countries": 7, "principal_investigators": ["Dr. Green", "Dr. Turner"]}', '{"age": "12-35", "SCD_severity": "severe", "HbS": ">95%"}', 'Casgevy (exagamglogene autotemcel)'),
  
  -- Spark Therapeutics Trials
  ('Zolgensma STRONG Trial', 'NCT03505099', 'completed', 'Phase 3', 'Spinal Muscular Atrophy', 'Pre-symptomatic SMA Type 1', 'Survival without respiratory support', ARRAY['Motor milestones', 'Growth'], 50, 50, '2018-05-25', '2021-12-30', '{"sponsor": "Spark Therapeutics", "collaborators": ["AveXis"], "funding": "industry"}', ARRAY['United States', 'Europe'], '{"sites_count": 18, "countries": 8, "principal_investigators": ["Dr. Phillips", "Dr. Campbell"]}', '{"age": "≤6 weeks", "SMA_type": "Type 1", "pre_symptomatic": true}', 'Zolgensma (onasemnogene abeparvovec)')
) AS v(trial_title, nct_num, status, phase_val, indication_val, population, primary_ep, secondary_eps, target_enrollment, current_enrollment, start_dt, completion_dt, sponsor_data, locations, sites, eligibility, product_name)
JOIN products p ON p.name = v.product_name
WHERE NOT EXISTS (
  SELECT 1 FROM clinical_trials ct WHERE ct.nct_number = v.nct_num
);

-- Add competitor analysis data to commercial_products
UPDATE public.commercial_products 
SET competitive_landscape = CASE 
  WHEN p.name LIKE '%Tecentriq%' THEN '{"direct_competitors": ["Keytruda", "Opdivo"], "market_share": "15%", "competitive_advantages": ["PD-L1 expression", "Combination approvals"], "threats": ["Newer IO combinations"]}'
  WHEN p.name LIKE '%Avastin%' THEN '{"direct_competitors": ["Cyramza", "Stivarga"], "market_share": "45%", "competitive_advantages": ["First-in-class", "Multiple indications"], "threats": ["Biosimilars", "Newer anti-angiogenics"]}'
  WHEN p.name LIKE '%Herceptin%' THEN '{"direct_competitors": ["Kadcyla", "Perjeta"], "market_share": "35%", "competitive_advantages": ["Standard of care", "Long track record"], "threats": ["Biosimilars", "ADCs"]}'
  WHEN p.name LIKE '%Spinraza%' THEN '{"direct_competitors": ["Zolgensma", "Evrysdi"], "market_share": "60%", "competitive_advantages": ["First approved", "Proven efficacy"], "threats": ["One-time gene therapies"]}'
  WHEN p.name LIKE '%Breyanzi%' THEN '{"direct_competitors": ["Kymriah", "Yescarta"], "market_share": "25%", "competitive_advantages": ["Outpatient manufacturing", "Safety profile"], "threats": ["Allogeneic CAR-T"]}'
  WHEN p.name LIKE '%Amtagvi%' THEN '{"direct_competitors": ["Kymriah (solid tumors)", "Other TILs"], "market_share": "80%", "competitive_advantages": ["First TIL therapy", "Melanoma focus"], "threats": ["CAR-T expansion", "Other TIL companies"]}'
  WHEN p.name LIKE '%Casgevy%' THEN '{"direct_competitors": ["Zolgensma (SMA)", "Other gene editing"], "market_share": "90%", "competitive_advantages": ["First CRISPR therapy", "Curative potential"], "threats": ["Base editing", "Prime editing"]}'
  WHEN p.name LIKE '%Zolgensma%' THEN '{"direct_competitors": ["Spinraza", "Evrysdi"], "market_share": "40%", "competitive_advantages": ["One-time treatment", "Gene replacement"], "threats": ["Age restrictions", "Safety concerns"]}'
  ELSE competitive_landscape
END::jsonb
FROM products p 
WHERE commercial_products.product_id = p.id;