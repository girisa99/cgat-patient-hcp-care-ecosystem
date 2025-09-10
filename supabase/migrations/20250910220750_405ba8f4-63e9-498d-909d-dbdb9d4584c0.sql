-- COMPREHENSIVE FORM FIELDS MIGRATION: Individual columns for all form fields
-- This enables proper mapping, retrieval, and prepopulation instead of JSONB blocks

-- ========================================
-- 1. EXPAND PROVIDER_PROFILES TABLE WITH ALL INDIVIDUAL FIELDS
-- ========================================
-- Provider Tab - Additional fields not already created
ALTER TABLE public.provider_profiles ADD COLUMN IF NOT EXISTS middle_name_provider TEXT;
ALTER TABLE public.provider_profiles ADD COLUMN IF NOT EXISTS primary_address_provider TEXT;
ALTER TABLE public.provider_profiles ADD COLUMN IF NOT EXISTS mailing_address_provider TEXT;
ALTER TABLE public.provider_profiles ADD COLUMN IF NOT EXISTS preferred_contact_method_provider TEXT;

-- Additional licensing fields  
ALTER TABLE public.provider_profiles ADD COLUMN IF NOT EXISTS controlled_substance_status_provider TEXT;
ALTER TABLE public.provider_profiles ADD COLUMN IF NOT EXISTS pdmp_registration_provider TEXT;
ALTER TABLE public.provider_profiles ADD COLUMN IF NOT EXISTS disciplinary_actions_provider BOOLEAN DEFAULT false;
ALTER TABLE public.provider_profiles ADD COLUMN IF NOT EXISTS disciplinary_details_provider TEXT;

-- Professional experience fields
ALTER TABLE public.provider_profiles ADD COLUMN IF NOT EXISTS years_in_practice_provider TEXT;
ALTER TABLE public.provider_profiles ADD COLUMN IF NOT EXISTS practice_type_provider TEXT;
ALTER TABLE public.provider_profiles ADD COLUMN IF NOT EXISTS hospital_affiliations_provider TEXT[];
ALTER TABLE public.provider_profiles ADD COLUMN IF NOT EXISTS advanced_therapy_experience_provider BOOLEAN DEFAULT false;
ALTER TABLE public.provider_profiles ADD COLUMN IF NOT EXISTS advanced_therapy_details_provider TEXT;

-- Insurance & Liability fields
ALTER TABLE public.provider_profiles ADD COLUMN IF NOT EXISTS malpractice_carrier_provider TEXT;
ALTER TABLE public.provider_profiles ADD COLUMN IF NOT EXISTS policy_number_provider TEXT;
ALTER TABLE public.provider_profiles ADD COLUMN IF NOT EXISTS coverage_limits_provider TEXT;
ALTER TABLE public.provider_profiles ADD COLUMN IF NOT EXISTS insurance_expiration_date_provider DATE;

-- ========================================
-- 2. EXPAND FACILITIES TABLE WITH COMPREHENSIVE FACILITY FIELDS
-- ========================================
-- Basic Facility Information (additional)
ALTER TABLE public.facilities ADD COLUMN IF NOT EXISTS organization_npi TEXT;
ALTER TABLE public.facilities ADD COLUMN IF NOT EXISTS tax_id TEXT;
ALTER TABLE public.facilities ADD COLUMN IF NOT EXISTS physical_address TEXT;
ALTER TABLE public.facilities ADD COLUMN IF NOT EXISTS mailing_address TEXT;
ALTER TABLE public.facilities ADD COLUMN IF NOT EXISTS fax TEXT;
ALTER TABLE public.facilities ADD COLUMN IF NOT EXISTS website TEXT;
ALTER TABLE public.facilities ADD COLUMN IF NOT EXISTS emergency_contact TEXT;

-- Administrative Contacts
ALTER TABLE public.facilities ADD COLUMN IF NOT EXISTS administrator_name TEXT;
ALTER TABLE public.facilities ADD COLUMN IF NOT EXISTS administrator_title TEXT;
ALTER TABLE public.facilities ADD COLUMN IF NOT EXISTS administrator_contact TEXT;
ALTER TABLE public.facilities ADD COLUMN IF NOT EXISTS medical_director_name TEXT;
ALTER TABLE public.facilities ADD COLUMN IF NOT EXISTS medical_director_npi TEXT;
ALTER TABLE public.facilities ADD COLUMN IF NOT EXISTS billing_contact_name TEXT;
ALTER TABLE public.facilities ADD COLUMN IF NOT EXISTS billing_contact_info TEXT;
ALTER TABLE public.facilities ADD COLUMN IF NOT EXISTS pa_specialist_contact TEXT;

-- Operational Details
ALTER TABLE public.facilities ADD COLUMN IF NOT EXISTS hours_of_operation TEXT;
ALTER TABLE public.facilities ADD COLUMN IF NOT EXISTS days_of_operation TEXT[];
ALTER TABLE public.facilities ADD COLUMN IF NOT EXISTS emergency_hours TEXT;
ALTER TABLE public.facilities ADD COLUMN IF NOT EXISTS patient_capacity TEXT;
ALTER TABLE public.facilities ADD COLUMN IF NOT EXISTS bed_count TEXT;
ALTER TABLE public.facilities ADD COLUMN IF NOT EXISTS treatment_rooms TEXT;
ALTER TABLE public.facilities ADD COLUMN IF NOT EXISTS languages_supported TEXT[];
ALTER TABLE public.facilities ADD COLUMN IF NOT EXISTS population_served TEXT[];

-- Licensing & Accreditation (additional)
ALTER TABLE public.facilities ADD COLUMN IF NOT EXISTS facility_license_number TEXT;
ALTER TABLE public.facilities ADD COLUMN IF NOT EXISTS license_expiration_date DATE;
ALTER TABLE public.facilities ADD COLUMN IF NOT EXISTS joint_commission_accred BOOLEAN DEFAULT false;
ALTER TABLE public.facilities ADD COLUMN IF NOT EXISTS carf_accreditation BOOLEAN DEFAULT false;
ALTER TABLE public.facilities ADD COLUMN IF NOT EXISTS carf_details TEXT;
ALTER TABLE public.facilities ADD COLUMN IF NOT EXISTS cap_accreditation BOOLEAN DEFAULT false;
ALTER TABLE public.facilities ADD COLUMN IF NOT EXISTS cap_details TEXT;
ALTER TABLE public.facilities ADD COLUMN IF NOT EXISTS fact_accreditation BOOLEAN DEFAULT false;
ALTER TABLE public.facilities ADD COLUMN IF NOT EXISTS medicare_provider_number TEXT;
ALTER TABLE public.facilities ADD COLUMN IF NOT EXISTS medicaid_provider_number TEXT;

-- Advanced Therapy Regulatory
ALTER TABLE public.facilities ADD COLUMN IF NOT EXISTS fda_registration_number TEXT;
ALTER TABLE public.facilities ADD COLUMN IF NOT EXISTS gmp_compliance BOOLEAN DEFAULT false;
ALTER TABLE public.facilities ADD COLUMN IF NOT EXISTS nrc_license TEXT;
ALTER TABLE public.facilities ADD COLUMN IF NOT EXISTS radiation_control_permit TEXT;
ALTER TABLE public.facilities ADD COLUMN IF NOT EXISTS clia_cert_number TEXT;
ALTER TABLE public.facilities ADD COLUMN IF NOT EXISTS biosafety_committee_approval BOOLEAN DEFAULT false;
ALTER TABLE public.facilities ADD COLUMN IF NOT EXISTS irb_information TEXT;

-- Clinical Services & Capabilities (additional)
ALTER TABLE public.facilities ADD COLUMN IF NOT EXISTS services_offered TEXT[];
ALTER TABLE public.facilities ADD COLUMN IF NOT EXISTS treatment_modalities TEXT[];
ALTER TABLE public.facilities ADD COLUMN IF NOT EXISTS infusion_services BOOLEAN DEFAULT false;
ALTER TABLE public.facilities ADD COLUMN IF NOT EXISTS infusion_details TEXT;
ALTER TABLE public.facilities ADD COLUMN IF NOT EXISTS laboratory_services_detail TEXT;
ALTER TABLE public.facilities ADD COLUMN IF NOT EXISTS pharmacy_services_detail TEXT;
ALTER TABLE public.facilities ADD COLUMN IF NOT EXISTS imaging_services TEXT[];
ALTER TABLE public.facilities ADD COLUMN IF NOT EXISTS emergency_services_access BOOLEAN DEFAULT false;

-- Infrastructure & Equipment (additional)
ALTER TABLE public.facilities ADD COLUMN IF NOT EXISTS ehr_system TEXT;
ALTER TABLE public.facilities ADD COLUMN IF NOT EXISTS infusion_equipment TEXT[];
ALTER TABLE public.facilities ADD COLUMN IF NOT EXISTS emergency_equipment TEXT[];
ALTER TABLE public.facilities ADD COLUMN IF NOT EXISTS backup_power_systems BOOLEAN DEFAULT false;
ALTER TABLE public.facilities ADD COLUMN IF NOT EXISTS cell_processing_lab BOOLEAN DEFAULT false;
ALTER TABLE public.facilities ADD COLUMN IF NOT EXISTS cell_processing_grade TEXT;
ALTER TABLE public.facilities ADD COLUMN IF NOT EXISTS cleanroom_facilities TEXT[];
ALTER TABLE public.facilities ADD COLUMN IF NOT EXISTS cryopreservation_capability BOOLEAN DEFAULT false;
ALTER TABLE public.facilities ADD COLUMN IF NOT EXISTS cold_chain_management BOOLEAN DEFAULT false;
ALTER TABLE public.facilities ADD COLUMN IF NOT EXISTS flow_cytometry_equipment BOOLEAN DEFAULT false;
ALTER TABLE public.facilities ADD COLUMN IF NOT EXISTS pcr_capabilities BOOLEAN DEFAULT false;
ALTER TABLE public.facilities ADD COLUMN IF NOT EXISTS radiation_detection_equipment BOOLEAN DEFAULT false;
ALTER TABLE public.facilities ADD COLUMN IF NOT EXISTS specialized_infusion_pumps BOOLEAN DEFAULT false;
ALTER TABLE public.facilities ADD COLUMN IF NOT EXISTS isolation_rooms_count INTEGER;
ALTER TABLE public.facilities ADD COLUMN IF NOT EXISTS cell_counting_analyzers BOOLEAN DEFAULT false;

-- Staffing & Expertise
ALTER TABLE public.facilities ADD COLUMN IF NOT EXISTS nursing_qualifications TEXT;
ALTER TABLE public.facilities ADD COLUMN IF NOT EXISTS pharmacist_info TEXT;
ALTER TABLE public.facilities ADD COLUMN IF NOT EXISTS lab_personnel TEXT;
ALTER TABLE public.facilities ADD COLUMN IF NOT EXISTS cell_therapy_coordinator TEXT;
ALTER TABLE public.facilities ADD COLUMN IF NOT EXISTS radiation_safety_officer TEXT;
ALTER TABLE public.facilities ADD COLUMN IF NOT EXISTS apheresis_technician TEXT;
ALTER TABLE public.facilities ADD COLUMN IF NOT EXISTS clinical_lab_scientist TEXT;
ALTER TABLE public.facilities ADD COLUMN IF NOT EXISTS emergency_response_team TEXT;

-- Safety & Quality Systems
ALTER TABLE public.facilities ADD COLUMN IF NOT EXISTS quality_assurance_program BOOLEAN DEFAULT false;
ALTER TABLE public.facilities ADD COLUMN IF NOT EXISTS qa_description TEXT;
ALTER TABLE public.facilities ADD COLUMN IF NOT EXISTS adverse_event_reporting TEXT;

-- ========================================
-- 3. EXPAND INSURANCE_COVERAGES TABLE WITH ALL INSURANCE FIELDS
-- ========================================
-- Contact Information (additional fields not already added)
ALTER TABLE public.insurance_coverages ADD COLUMN IF NOT EXISTS customer_service_hours_insurance TEXT;
ALTER TABLE public.insurance_coverages ADD COLUMN IF NOT EXISTS website_url_insurance TEXT;
ALTER TABLE public.insurance_coverages ADD COLUMN IF NOT EXISTS mobile_app_available_insurance BOOLEAN DEFAULT false;

-- Medical Coverage Details
ALTER TABLE public.insurance_coverages ADD COLUMN IF NOT EXISTS annual_deductible_individual TEXT;
ALTER TABLE public.insurance_coverages ADD COLUMN IF NOT EXISTS annual_deductible_family TEXT;
ALTER TABLE public.insurance_coverages ADD COLUMN IF NOT EXISTS deductible_met_to_date TEXT;
ALTER TABLE public.insurance_coverages ADD COLUMN IF NOT EXISTS out_of_pocket_max_individual TEXT;
ALTER TABLE public.insurance_coverages ADD COLUMN IF NOT EXISTS out_of_pocket_max_family TEXT;
ALTER TABLE public.insurance_coverages ADD COLUMN IF NOT EXISTS out_of_pocket_met_to_date TEXT;
ALTER TABLE public.insurance_coverages ADD COLUMN IF NOT EXISTS office_visit_copay TEXT;
ALTER TABLE public.insurance_coverages ADD COLUMN IF NOT EXISTS specialist_visit_copay TEXT;
ALTER TABLE public.insurance_coverages ADD COLUMN IF NOT EXISTS emergency_room_copay TEXT;
ALTER TABLE public.insurance_coverages ADD COLUMN IF NOT EXISTS urgent_care_copay TEXT;
ALTER TABLE public.insurance_coverages ADD COLUMN IF NOT EXISTS inpatient_hospital_copay TEXT;
ALTER TABLE public.insurance_coverages ADD COLUMN IF NOT EXISTS outpatient_surgery_copay TEXT;
ALTER TABLE public.insurance_coverages ADD COLUMN IF NOT EXISTS diagnostic_test_coinsurance TEXT;
ALTER TABLE public.insurance_coverages ADD COLUMN IF NOT EXISTS preventive_care_coverage TEXT;
ALTER TABLE public.insurance_coverages ADD COLUMN IF NOT EXISTS prior_auth_required BOOLEAN DEFAULT false;
ALTER TABLE public.insurance_coverages ADD COLUMN IF NOT EXISTS referral_required BOOLEAN DEFAULT false;
ALTER TABLE public.insurance_coverages ADD COLUMN IF NOT EXISTS precertification_required BOOLEAN DEFAULT false;

-- Pharmacy Coverage Details
ALTER TABLE public.insurance_coverages ADD COLUMN IF NOT EXISTS pharmacy_benefits_active BOOLEAN DEFAULT false;
ALTER TABLE public.insurance_coverages ADD COLUMN IF NOT EXISTS pharmacy_benefit_manager TEXT;
ALTER TABLE public.insurance_coverages ADD COLUMN IF NOT EXISTS pharmacy_id_number TEXT;
ALTER TABLE public.insurance_coverages ADD COLUMN IF NOT EXISTS pharmacy_group_number TEXT;
ALTER TABLE public.insurance_coverages ADD COLUMN IF NOT EXISTS formulary_type TEXT;
ALTER TABLE public.insurance_coverages ADD COLUMN IF NOT EXISTS formulary_tier_structure TEXT;
ALTER TABLE public.insurance_coverages ADD COLUMN IF NOT EXISTS generic_copay TEXT;
ALTER TABLE public.insurance_coverages ADD COLUMN IF NOT EXISTS brand_name_copay TEXT;
ALTER TABLE public.insurance_coverages ADD COLUMN IF NOT EXISTS preferred_brand_copay TEXT;
ALTER TABLE public.insurance_coverages ADD COLUMN IF NOT EXISTS non_preferred_brand_copay TEXT;
ALTER TABLE public.insurance_coverages ADD COLUMN IF NOT EXISTS specialty_drug_copay TEXT;
ALTER TABLE public.insurance_coverages ADD COLUMN IF NOT EXISTS pharmacy_deductible TEXT;
ALTER TABLE public.insurance_coverages ADD COLUMN IF NOT EXISTS mail_order_benefits BOOLEAN DEFAULT false;
ALTER TABLE public.insurance_coverages ADD COLUMN IF NOT EXISTS specialty_pharmacy_network TEXT;
ALTER TABLE public.insurance_coverages ADD COLUMN IF NOT EXISTS prior_auth_required_meds BOOLEAN DEFAULT false;
ALTER TABLE public.insurance_coverages ADD COLUMN IF NOT EXISTS step_therapy_requirements BOOLEAN DEFAULT false;
ALTER TABLE public.insurance_coverages ADD COLUMN IF NOT EXISTS quantity_limits BOOLEAN DEFAULT false;

-- Advanced Therapy Coverage
ALTER TABLE public.insurance_coverages ADD COLUMN IF NOT EXISTS high_cost_therapy_coverage BOOLEAN DEFAULT false;
ALTER TABLE public.insurance_coverages ADD COLUMN IF NOT EXISTS specialty_drug_tier_assignment TEXT;
ALTER TABLE public.insurance_coverages ADD COLUMN IF NOT EXISTS medical_vs_pharmacy_benefit TEXT;
ALTER TABLE public.insurance_coverages ADD COLUMN IF NOT EXISTS site_of_care_restrictions TEXT;
ALTER TABLE public.insurance_coverages ADD COLUMN IF NOT EXISTS case_management_required BOOLEAN DEFAULT false;
ALTER TABLE public.insurance_coverages ADD COLUMN IF NOT EXISTS prior_auth_required_advanced BOOLEAN DEFAULT false;
ALTER TABLE public.insurance_coverages ADD COLUMN IF NOT EXISTS precertification_timeline TEXT;
ALTER TABLE public.insurance_coverages ADD COLUMN IF NOT EXISTS coverage_decision_timeline TEXT;
ALTER TABLE public.insurance_coverages ADD COLUMN IF NOT EXISTS annual_maximum_benefit TEXT;
ALTER TABLE public.insurance_coverages ADD COLUMN IF NOT EXISTS lifetime_maximum_benefit TEXT;
ALTER TABLE public.insurance_coverages ADD COLUMN IF NOT EXISTS experimental_coverage BOOLEAN DEFAULT false;
ALTER TABLE public.insurance_coverages ADD COLUMN IF NOT EXISTS clinical_trial_coverage BOOLEAN DEFAULT false;
ALTER TABLE public.insurance_coverages ADD COLUMN IF NOT EXISTS compassionate_use_coverage BOOLEAN DEFAULT false;

-- Government Insurance Specific Fields
ALTER TABLE public.insurance_coverages ADD COLUMN IF NOT EXISTS medicare_id_number TEXT;
ALTER TABLE public.insurance_coverages ADD COLUMN IF NOT EXISTS medicare_type TEXT;
ALTER TABLE public.insurance_coverages ADD COLUMN IF NOT EXISTS medicare_part_a BOOLEAN DEFAULT false;
ALTER TABLE public.insurance_coverages ADD COLUMN IF NOT EXISTS medicare_part_b BOOLEAN DEFAULT false;
ALTER TABLE public.insurance_coverages ADD COLUMN IF NOT EXISTS medicare_part_c TEXT;
ALTER TABLE public.insurance_coverages ADD COLUMN IF NOT EXISTS medicare_part_d TEXT;
ALTER TABLE public.insurance_coverages ADD COLUMN IF NOT EXISTS medicaid_id_number TEXT;
ALTER TABLE public.insurance_coverages ADD COLUMN IF NOT EXISTS state_medicaid_program TEXT;
ALTER TABLE public.insurance_coverages ADD COLUMN IF NOT EXISTS medicaid_plan_type TEXT;
ALTER TABLE public.insurance_coverages ADD COLUMN IF NOT EXISTS tricare_region TEXT;
ALTER TABLE public.insurance_coverages ADD COLUMN IF NOT EXISTS tricare_plan_type TEXT;
ALTER TABLE public.insurance_coverages ADD COLUMN IF NOT EXISTS sponsor_military_id TEXT;
ALTER TABLE public.insurance_coverages ADD COLUMN IF NOT EXISTS military_branch TEXT;
ALTER TABLE public.insurance_coverages ADD COLUMN IF NOT EXISTS sponsor_status TEXT;
ALTER TABLE public.insurance_coverages ADD COLUMN IF NOT EXISTS va_file_number TEXT;
ALTER TABLE public.insurance_coverages ADD COLUMN IF NOT EXISTS service_connected_rating TEXT;
ALTER TABLE public.insurance_coverages ADD COLUMN IF NOT EXISTS priority_group TEXT;
ALTER TABLE public.insurance_coverages ADD COLUMN IF NOT EXISTS workers_comp_claim_number TEXT;
ALTER TABLE public.insurance_coverages ADD COLUMN IF NOT EXISTS workers_comp_carrier TEXT;
ALTER TABLE public.insurance_coverages ADD COLUMN IF NOT EXISTS date_of_injury DATE;
ALTER TABLE public.insurance_coverages ADD COLUMN IF NOT EXISTS employer_name TEXT;

-- Verification Status
ALTER TABLE public.insurance_coverages ADD COLUMN IF NOT EXISTS verification_status TEXT DEFAULT 'pending';
ALTER TABLE public.insurance_coverages ADD COLUMN IF NOT EXISTS verification_date DATE;
ALTER TABLE public.insurance_coverages ADD COLUMN IF NOT EXISTS verified_by TEXT;
ALTER TABLE public.insurance_coverages ADD COLUMN IF NOT EXISTS benefits_confirmed BOOLEAN DEFAULT false;
ALTER TABLE public.insurance_coverages ADD COLUMN IF NOT EXISTS prior_auth_status TEXT;
ALTER TABLE public.insurance_coverages ADD COLUMN IF NOT EXISTS prior_auth_reference_number TEXT;
ALTER TABLE public.insurance_coverages ADD COLUMN IF NOT EXISTS prior_auth_approval_date DATE;
ALTER TABLE public.insurance_coverages ADD COLUMN IF NOT EXISTS prior_auth_expiration_date DATE;

-- ========================================
-- 4. EXPAND TREATMENT_ASSESSMENTS TABLE WITH ALL INDIVIDUAL ASSESSMENT FIELDS
-- ========================================
-- Identity Verification & Documentation
ALTER TABLE public.treatment_assessments ADD COLUMN IF NOT EXISTS photo_id_verification_completed BOOLEAN DEFAULT false;
ALTER TABLE public.treatment_assessments ADD COLUMN IF NOT EXISTS photo_id_type_verified TEXT;
ALTER TABLE public.treatment_assessments ADD COLUMN IF NOT EXISTS secondary_id_cross_verification BOOLEAN DEFAULT false;
ALTER TABLE public.treatment_assessments ADD COLUMN IF NOT EXISTS patient_photo_captured BOOLEAN DEFAULT false;
ALTER TABLE public.treatment_assessments ADD COLUMN IF NOT EXISTS biometric_data_available BOOLEAN DEFAULT false;
ALTER TABLE public.treatment_assessments ADD COLUMN IF NOT EXISTS identity_verification_witness TEXT;
ALTER TABLE public.treatment_assessments ADD COLUMN IF NOT EXISTS identity_verification_date_time TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.treatment_assessments ADD COLUMN IF NOT EXISTS identity_discrepancies_found BOOLEAN DEFAULT false;
ALTER TABLE public.treatment_assessments ADD COLUMN IF NOT EXISTS identity_discrepancy_details TEXT;

-- Clinical Readiness Assessment
ALTER TABLE public.treatment_assessments ADD COLUMN IF NOT EXISTS treatment_readiness_assessment TEXT;
ALTER TABLE public.treatment_assessments ADD COLUMN IF NOT EXISTS performance_status_current TEXT;
ALTER TABLE public.treatment_assessments ADD COLUMN IF NOT EXISTS disease_status_at_enrollment TEXT;
ALTER TABLE public.treatment_assessments ADD COLUMN IF NOT EXISTS recent_hospitalizations BOOLEAN DEFAULT false;
ALTER TABLE public.treatment_assessments ADD COLUMN IF NOT EXISTS active_infections BOOLEAN DEFAULT false;
ALTER TABLE public.treatment_assessments ADD COLUMN IF NOT EXISTS current_functional_capacity BOOLEAN DEFAULT false;
ALTER TABLE public.treatment_assessments ADD COLUMN IF NOT EXISTS required_pre_treatment_labs BOOLEAN DEFAULT false;
ALTER TABLE public.treatment_assessments ADD COLUMN IF NOT EXISTS cardiac_clearance TEXT;
ALTER TABLE public.treatment_assessments ADD COLUMN IF NOT EXISTS pulmonary_function TEXT;
ALTER TABLE public.treatment_assessments ADD COLUMN IF NOT EXISTS infection_screening TEXT;
ALTER TABLE public.treatment_assessments ADD COLUMN IF NOT EXISTS pregnancy_test TEXT;
ALTER TABLE public.treatment_assessments ADD COLUMN IF NOT EXISTS vaccination_status TEXT;
ALTER TABLE public.treatment_assessments ADD COLUMN IF NOT EXISTS absolute_contraindications TEXT;
ALTER TABLE public.treatment_assessments ADD COLUMN IF NOT EXISTS relative_contraindications TEXT;
ALTER TABLE public.treatment_assessments ADD COLUMN IF NOT EXISTS drug_interaction_check BOOLEAN DEFAULT false;
ALTER TABLE public.treatment_assessments ADD COLUMN IF NOT EXISTS prior_severe_adverse_reactions TEXT;

-- Care Coordination & Logistics Setup
ALTER TABLE public.treatment_assessments ADD COLUMN IF NOT EXISTS care_coordinator_assigned TEXT;
ALTER TABLE public.treatment_assessments ADD COLUMN IF NOT EXISTS primary_nurse_assignment TEXT;
ALTER TABLE public.treatment_assessments ADD COLUMN IF NOT EXISTS case_manager_assignment TEXT;
ALTER TABLE public.treatment_assessments ADD COLUMN IF NOT EXISTS social_worker_consultation TEXT;
ALTER TABLE public.treatment_assessments ADD COLUMN IF NOT EXISTS transportation_plan TEXT;
ALTER TABLE public.treatment_assessments ADD COLUMN IF NOT EXISTS lodging_arrangements TEXT;
ALTER TABLE public.treatment_assessments ADD COLUMN IF NOT EXISTS caregiver_support_identified TEXT;
ALTER TABLE public.treatment_assessments ADD COLUMN IF NOT EXISTS emergency_contact_24x7 TEXT;
ALTER TABLE public.treatment_assessments ADD COLUMN IF NOT EXISTS distance_from_treatment_center TEXT;
ALTER TABLE public.treatment_assessments ADD COLUMN IF NOT EXISTS preferred_contact_method_appointments TEXT;
ALTER TABLE public.treatment_assessments ADD COLUMN IF NOT EXISTS family_communication_preferences TEXT;
ALTER TABLE public.treatment_assessments ADD COLUMN IF NOT EXISTS language_interpreter_services TEXT;
ALTER TABLE public.treatment_assessments ADD COLUMN IF NOT EXISTS patient_portal_registration TEXT;

-- Financial Counseling & Support Services
ALTER TABLE public.treatment_assessments ADD COLUMN IF NOT EXISTS financial_counseling_completed BOOLEAN DEFAULT false;
ALTER TABLE public.treatment_assessments ADD COLUMN IF NOT EXISTS out_of_pocket_cost_estimate_provided BOOLEAN DEFAULT false;
ALTER TABLE public.treatment_assessments ADD COLUMN IF NOT EXISTS out_of_pocket_amount TEXT;
ALTER TABLE public.treatment_assessments ADD COLUMN IF NOT EXISTS payment_plan_required BOOLEAN DEFAULT false;
ALTER TABLE public.treatment_assessments ADD COLUMN IF NOT EXISTS payment_plan_terms TEXT;
ALTER TABLE public.treatment_assessments ADD COLUMN IF NOT EXISTS financial_hardship_identified BOOLEAN DEFAULT false;
ALTER TABLE public.treatment_assessments ADD COLUMN IF NOT EXISTS patient_assistance_programs_applied TEXT[];
ALTER TABLE public.treatment_assessments ADD COLUMN IF NOT EXISTS nutrition_consultation TEXT;
ALTER TABLE public.treatment_assessments ADD COLUMN IF NOT EXISTS pharmacy_consultation TEXT;
ALTER TABLE public.treatment_assessments ADD COLUMN IF NOT EXISTS specialty_pharmacy_coordination TEXT;
ALTER TABLE public.treatment_assessments ADD COLUMN IF NOT EXISTS home_health_services TEXT;

-- Consent & Legal Documentation
ALTER TABLE public.treatment_assessments ADD COLUMN IF NOT EXISTS treatment_consent_status TEXT;
ALTER TABLE public.treatment_assessments ADD COLUMN IF NOT EXISTS consent_date DATE;
ALTER TABLE public.treatment_assessments ADD COLUMN IF NOT EXISTS consenting_physician TEXT;
ALTER TABLE public.treatment_assessments ADD COLUMN IF NOT EXISTS capacity_assessment TEXT;
ALTER TABLE public.treatment_assessments ADD COLUMN IF NOT EXISTS research_clinical_trial_consent TEXT;
ALTER TABLE public.treatment_assessments ADD COLUMN IF NOT EXISTS code_status_discussed BOOLEAN DEFAULT false;
ALTER TABLE public.treatment_assessments ADD COLUMN IF NOT EXISTS advanced_directive_review TEXT;
ALTER TABLE public.treatment_assessments ADD COLUMN IF NOT EXISTS healthcare_proxy_confirmed TEXT;
ALTER TABLE public.treatment_assessments ADD COLUMN IF NOT EXISTS treatment_goals_discussion TEXT;
ALTER TABLE public.treatment_assessments ADD COLUMN IF NOT EXISTS hipaa_authorization BOOLEAN DEFAULT false;
ALTER TABLE public.treatment_assessments ADD COLUMN IF NOT EXISTS communication_consent TEXT;
ALTER TABLE public.treatment_assessments ADD COLUMN IF NOT EXISTS photography_video_consent BOOLEAN DEFAULT false;

-- Technology & Monitoring Setup
ALTER TABLE public.treatment_assessments ADD COLUMN IF NOT EXISTS remote_monitoring_required BOOLEAN DEFAULT false;
ALTER TABLE public.treatment_assessments ADD COLUMN IF NOT EXISTS technology_assessment TEXT;
ALTER TABLE public.treatment_assessments ADD COLUMN IF NOT EXISTS device_distribution TEXT;
ALTER TABLE public.treatment_assessments ADD COLUMN IF NOT EXISTS training_provided BOOLEAN DEFAULT false;
ALTER TABLE public.treatment_assessments ADD COLUMN IF NOT EXISTS technical_support_contact TEXT;
ALTER TABLE public.treatment_assessments ADD COLUMN IF NOT EXISTS secure_messaging_setup TEXT;
ALTER TABLE public.treatment_assessments ADD COLUMN IF NOT EXISTS telehealth_capability TEXT;
ALTER TABLE public.treatment_assessments ADD COLUMN IF NOT EXISTS emergency_communication_plan TEXT;

-- ========================================
-- 5. EXPAND ENROLLMENT_INSTANCES WITH INDIVIDUAL FIELDS INSTEAD OF JSONB BLOCKS
-- ========================================
-- Remove the JSONB columns and replace with individual fields for better mapping
ALTER TABLE public.enrollment_instances DROP COLUMN IF EXISTS provider_data;
ALTER TABLE public.enrollment_instances DROP COLUMN IF EXISTS insurance_data;
ALTER TABLE public.enrollment_instances DROP COLUMN IF EXISTS treatment_assessment_data;

-- Add individual enrollment tracking fields
ALTER TABLE public.enrollment_instances ADD COLUMN IF NOT EXISTS submission_method_selected TEXT;
ALTER TABLE public.enrollment_instances ADD COLUMN IF NOT EXISTS consent_obtained BOOLEAN DEFAULT false;
ALTER TABLE public.enrollment_instances ADD COLUMN IF NOT EXISTS consent_method TEXT;
ALTER TABLE public.enrollment_instances ADD COLUMN IF NOT EXISTS consent_date DATE;
ALTER TABLE public.enrollment_instances ADD COLUMN IF NOT EXISTS provider_signature_captured BOOLEAN DEFAULT false;
ALTER TABLE public.enrollment_instances ADD COLUMN IF NOT EXISTS patient_signature_captured BOOLEAN DEFAULT false;
ALTER TABLE public.enrollment_instances ADD COLUMN IF NOT EXISTS collaborators_assigned TEXT[];
ALTER TABLE public.enrollment_instances ADD COLUMN IF NOT EXISTS workflow_step_completed TEXT[];
ALTER TABLE public.enrollment_instances ADD COLUMN IF NOT EXISTS current_step_assignee UUID REFERENCES public.profiles(id);
ALTER TABLE public.enrollment_instances ADD COLUMN IF NOT EXISTS estimated_completion_hours INTEGER;
ALTER TABLE public.enrollment_instances ADD COLUMN IF NOT EXISTS priority_reason TEXT;
ALTER TABLE public.enrollment_instances ADD COLUMN IF NOT EXISTS referral_urgency TEXT;

-- Add indexes for the new individual fields to improve query performance
CREATE INDEX IF NOT EXISTS idx_enrollment_instances_consent_status ON public.enrollment_instances(consent_obtained);
CREATE INDEX IF NOT EXISTS idx_enrollment_instances_submission_method ON public.enrollment_instances(submission_method_selected);
CREATE INDEX IF NOT EXISTS idx_enrollment_instances_current_assignee ON public.enrollment_instances(current_step_assignee);

CREATE INDEX IF NOT EXISTS idx_provider_profiles_npi_provider ON public.provider_profiles(npi);
CREATE INDEX IF NOT EXISTS idx_facilities_organization_npi ON public.facilities(organization_npi);
CREATE INDEX IF NOT EXISTS idx_insurance_coverages_verification_status ON public.insurance_coverages(verification_status);
CREATE INDEX IF NOT EXISTS idx_treatment_assessments_consent_date ON public.treatment_assessments(consent_date);