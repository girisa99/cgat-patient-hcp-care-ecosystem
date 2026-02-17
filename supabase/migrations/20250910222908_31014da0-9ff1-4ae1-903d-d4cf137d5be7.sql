-- Convert Insurance Coverages JSONB fields to individual columns
DO $$
BEGIN
  -- Drop JSONB columns for insurance_coverages
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='insurance_coverages' AND column_name='advanced_therapy_coverage') THEN
    ALTER TABLE insurance_coverages DROP COLUMN advanced_therapy_coverage;
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='insurance_coverages' AND column_name='coverage_details') THEN
    ALTER TABLE insurance_coverages DROP COLUMN coverage_details;
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='insurance_coverages' AND column_name='government_insurance_details') THEN
    ALTER TABLE insurance_coverages DROP COLUMN government_insurance_details;
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='insurance_coverages' AND column_name='pharmacy_benefits') THEN
    ALTER TABLE insurance_coverages DROP COLUMN pharmacy_benefits;
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='insurance_coverages' AND column_name='card_images') THEN
    ALTER TABLE insurance_coverages DROP COLUMN card_images;
  END IF;

  -- Add individual advanced therapy coverage fields
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='insurance_coverages' AND column_name='car_t_coverage') THEN
    ALTER TABLE insurance_coverages ADD COLUMN car_t_coverage BOOLEAN DEFAULT false;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='insurance_coverages' AND column_name='gene_therapy_coverage') THEN
    ALTER TABLE insurance_coverages ADD COLUMN gene_therapy_coverage BOOLEAN DEFAULT false;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='insurance_coverages' AND column_name='immunotherapy_coverage') THEN
    ALTER TABLE insurance_coverages ADD COLUMN immunotherapy_coverage BOOLEAN DEFAULT false;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='insurance_coverages' AND column_name='radioligand_therapy_coverage') THEN
    ALTER TABLE insurance_coverages ADD COLUMN radioligand_therapy_coverage BOOLEAN DEFAULT false;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='insurance_coverages' AND column_name='prior_authorization_required') THEN
    ALTER TABLE insurance_coverages ADD COLUMN prior_authorization_required BOOLEAN DEFAULT false;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='insurance_coverages' AND column_name='step_therapy_requirements') THEN
    ALTER TABLE insurance_coverages ADD COLUMN step_therapy_requirements TEXT;
  END IF;

  -- Add individual coverage detail fields
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='insurance_coverages' AND column_name='annual_deductible') THEN
    ALTER TABLE insurance_coverages ADD COLUMN annual_deductible DECIMAL(10,2);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='insurance_coverages' AND column_name='out_of_pocket_maximum') THEN
    ALTER TABLE insurance_coverages ADD COLUMN out_of_pocket_maximum DECIMAL(10,2);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='insurance_coverages' AND column_name='copay_amount') THEN
    ALTER TABLE insurance_coverages ADD COLUMN copay_amount DECIMAL(8,2);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='insurance_coverages' AND column_name='coinsurance_percentage') THEN
    ALTER TABLE insurance_coverages ADD COLUMN coinsurance_percentage DECIMAL(5,2);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='insurance_coverages' AND column_name='coverage_tier') THEN
    ALTER TABLE insurance_coverages ADD COLUMN coverage_tier TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='insurance_coverages' AND column_name='network_status') THEN
    ALTER TABLE insurance_coverages ADD COLUMN network_status TEXT;
  END IF;

  -- Add government insurance fields
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='insurance_coverages' AND column_name='medicare_part_a') THEN
    ALTER TABLE insurance_coverages ADD COLUMN medicare_part_a BOOLEAN DEFAULT false;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='insurance_coverages' AND column_name='medicare_part_b') THEN
    ALTER TABLE insurance_coverages ADD COLUMN medicare_part_b BOOLEAN DEFAULT false;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='insurance_coverages' AND column_name='medicare_part_c') THEN
    ALTER TABLE insurance_coverages ADD COLUMN medicare_part_c BOOLEAN DEFAULT false;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='insurance_coverages' AND column_name='medicare_part_d') THEN
    ALTER TABLE insurance_coverages ADD COLUMN medicare_part_d BOOLEAN DEFAULT false;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='insurance_coverages' AND column_name='medicaid_coverage') THEN
    ALTER TABLE insurance_coverages ADD COLUMN medicaid_coverage BOOLEAN DEFAULT false;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='insurance_coverages' AND column_name='dual_eligible') THEN
    ALTER TABLE insurance_coverages ADD COLUMN dual_eligible BOOLEAN DEFAULT false;
  END IF;

  -- Add pharmacy benefit fields
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='insurance_coverages' AND column_name='pharmacy_network') THEN
    ALTER TABLE insurance_coverages ADD COLUMN pharmacy_network TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='insurance_coverages' AND column_name='specialty_pharmacy_required') THEN
    ALTER TABLE insurance_coverages ADD COLUMN specialty_pharmacy_required BOOLEAN DEFAULT false;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='insurance_coverages' AND column_name='mail_order_pharmacy') THEN
    ALTER TABLE insurance_coverages ADD COLUMN mail_order_pharmacy BOOLEAN DEFAULT false;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='insurance_coverages' AND column_name='preferred_pharmacies') THEN
    ALTER TABLE insurance_coverages ADD COLUMN preferred_pharmacies TEXT[];
  END IF;

  -- Add insurance card fields
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='insurance_coverages' AND column_name='card_front_image_url') THEN
    ALTER TABLE insurance_coverages ADD COLUMN card_front_image_url TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='insurance_coverages' AND column_name='card_back_image_url') THEN
    ALTER TABLE insurance_coverages ADD COLUMN card_back_image_url TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='insurance_coverages' AND column_name='card_uploaded_date') THEN
    ALTER TABLE insurance_coverages ADD COLUMN card_uploaded_date DATE;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='insurance_coverages' AND column_name='card_verified') THEN
    ALTER TABLE insurance_coverages ADD COLUMN card_verified BOOLEAN DEFAULT false;
  END IF;
END $$;

-- Convert Treatment Assessments JSONB fields to individual columns
DO $$
BEGIN
  -- Drop JSONB columns for treatment_assessments
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='treatment_assessments' AND column_name='care_coordination') THEN
    ALTER TABLE treatment_assessments DROP COLUMN care_coordination;
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='treatment_assessments' AND column_name='clinical_readiness') THEN
    ALTER TABLE treatment_assessments DROP COLUMN clinical_readiness;
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='treatment_assessments' AND column_name='financial_counseling') THEN
    ALTER TABLE treatment_assessments DROP COLUMN financial_counseling;
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='treatment_assessments' AND column_name='identity_verification') THEN
    ALTER TABLE treatment_assessments DROP COLUMN identity_verification;
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='treatment_assessments' AND column_name='laboratory_diagnostics') THEN
    ALTER TABLE treatment_assessments DROP COLUMN laboratory_diagnostics;
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='treatment_assessments' AND column_name='medical_review') THEN
    ALTER TABLE treatment_assessments DROP COLUMN medical_review;
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='treatment_assessments' AND column_name='risk_assessment') THEN
    ALTER TABLE treatment_assessments DROP COLUMN risk_assessment;
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='treatment_assessments' AND column_name='technology_monitoring') THEN
    ALTER TABLE treatment_assessments DROP COLUMN technology_monitoring;
  END IF;

  -- Add individual care coordination fields
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='treatment_assessments' AND column_name='care_team_assigned') THEN
    ALTER TABLE treatment_assessments ADD COLUMN care_team_assigned BOOLEAN DEFAULT false;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='treatment_assessments' AND column_name='primary_care_coordinator') THEN
    ALTER TABLE treatment_assessments ADD COLUMN primary_care_coordinator TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='treatment_assessments' AND column_name='care_plan_developed') THEN
    ALTER TABLE treatment_assessments ADD COLUMN care_plan_developed BOOLEAN DEFAULT false;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='treatment_assessments' AND column_name='multidisciplinary_team_meeting') THEN
    ALTER TABLE treatment_assessments ADD COLUMN multidisciplinary_team_meeting DATE;
  END IF;

  -- Add clinical readiness fields
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='treatment_assessments' AND column_name='medical_clearance_obtained') THEN
    ALTER TABLE treatment_assessments ADD COLUMN medical_clearance_obtained BOOLEAN DEFAULT false;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='treatment_assessments' AND column_name='baseline_assessments_complete') THEN
    ALTER TABLE treatment_assessments ADD COLUMN baseline_assessments_complete BOOLEAN DEFAULT false;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='treatment_assessments' AND column_name='eligibility_confirmed') THEN
    ALTER TABLE treatment_assessments ADD COLUMN eligibility_confirmed BOOLEAN DEFAULT false;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='treatment_assessments' AND column_name='treatment_readiness_score') THEN
    ALTER TABLE treatment_assessments ADD COLUMN treatment_readiness_score INTEGER;
  END IF;

  -- Add financial counseling fields
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='treatment_assessments' AND column_name='financial_assessment_complete') THEN
    ALTER TABLE treatment_assessments ADD COLUMN financial_assessment_complete BOOLEAN DEFAULT false;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='treatment_assessments' AND column_name='insurance_verification_complete') THEN
    ALTER TABLE treatment_assessments ADD COLUMN insurance_verification_complete BOOLEAN DEFAULT false;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='treatment_assessments' AND column_name='prior_authorization_status') THEN
    ALTER TABLE treatment_assessments ADD COLUMN prior_authorization_status TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='treatment_assessments' AND column_name='patient_assistance_programs') THEN
    ALTER TABLE treatment_assessments ADD COLUMN patient_assistance_programs TEXT[];
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='treatment_assessments' AND column_name='estimated_out_of_pocket_cost') THEN
    ALTER TABLE treatment_assessments ADD COLUMN estimated_out_of_pocket_cost DECIMAL(10,2);
  END IF;

  -- Add identity verification fields
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='treatment_assessments' AND column_name='identity_verified') THEN
    ALTER TABLE treatment_assessments ADD COLUMN identity_verified BOOLEAN DEFAULT false;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='treatment_assessments' AND column_name='photo_id_verified') THEN
    ALTER TABLE treatment_assessments ADD COLUMN photo_id_verified BOOLEAN DEFAULT false;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='treatment_assessments' AND column_name='social_security_verified') THEN
    ALTER TABLE treatment_assessments ADD COLUMN social_security_verified BOOLEAN DEFAULT false;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='treatment_assessments' AND column_name='address_verified') THEN
    ALTER TABLE treatment_assessments ADD COLUMN address_verified BOOLEAN DEFAULT false;
  END IF;

  -- Add laboratory diagnostics fields
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='treatment_assessments' AND column_name='required_lab_tests') THEN
    ALTER TABLE treatment_assessments ADD COLUMN required_lab_tests TEXT[];
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='treatment_assessments' AND column_name='lab_results_complete') THEN
    ALTER TABLE treatment_assessments ADD COLUMN lab_results_complete BOOLEAN DEFAULT false;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='treatment_assessments' AND column_name='biomarker_testing_complete') THEN
    ALTER TABLE treatment_assessments ADD COLUMN biomarker_testing_complete BOOLEAN DEFAULT false;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='treatment_assessments' AND column_name='genetic_testing_required') THEN
    ALTER TABLE treatment_assessments ADD COLUMN genetic_testing_required BOOLEAN DEFAULT false;
  END IF;

  -- Add medical review fields
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='treatment_assessments' AND column_name='medical_history_reviewed') THEN
    ALTER TABLE treatment_assessments ADD COLUMN medical_history_reviewed BOOLEAN DEFAULT false;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='treatment_assessments' AND column_name='contraindications_assessed') THEN
    ALTER TABLE treatment_assessments ADD COLUMN contraindications_assessed BOOLEAN DEFAULT false;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='treatment_assessments' AND column_name='drug_interactions_reviewed') THEN
    ALTER TABLE treatment_assessments ADD COLUMN drug_interactions_reviewed BOOLEAN DEFAULT false;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='treatment_assessments' AND column_name='physician_approval_obtained') THEN
    ALTER TABLE treatment_assessments ADD COLUMN physician_approval_obtained BOOLEAN DEFAULT false;
  END IF;

  -- Add risk assessment fields
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='treatment_assessments' AND column_name='risk_stratification_complete') THEN
    ALTER TABLE treatment_assessments ADD COLUMN risk_stratification_complete BOOLEAN DEFAULT false;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='treatment_assessments' AND column_name='high_risk_factors') THEN
    ALTER TABLE treatment_assessments ADD COLUMN high_risk_factors TEXT[];
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='treatment_assessments' AND column_name='mitigation_strategies') THEN
    ALTER TABLE treatment_assessments ADD COLUMN mitigation_strategies TEXT[];
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='treatment_assessments' AND column_name='overall_risk_score') THEN
    ALTER TABLE treatment_assessments ADD COLUMN overall_risk_score INTEGER;
  END IF;

  -- Add technology monitoring fields
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='treatment_assessments' AND column_name='remote_monitoring_enabled') THEN
    ALTER TABLE treatment_assessments ADD COLUMN remote_monitoring_enabled BOOLEAN DEFAULT false;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='treatment_assessments' AND column_name='wearable_devices_assigned') THEN
    ALTER TABLE treatment_assessments ADD COLUMN wearable_devices_assigned TEXT[];
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='treatment_assessments' AND column_name='mobile_app_onboarded') THEN
    ALTER TABLE treatment_assessments ADD COLUMN mobile_app_onboarded BOOLEAN DEFAULT false;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='treatment_assessments' AND column_name='telemedicine_setup_complete') THEN
    ALTER TABLE treatment_assessments ADD COLUMN telemedicine_setup_complete BOOLEAN DEFAULT false;
  END IF;
END $$;