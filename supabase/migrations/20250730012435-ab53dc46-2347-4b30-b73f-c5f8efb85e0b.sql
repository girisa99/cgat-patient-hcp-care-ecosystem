-- Add missing api_requirements column to treatment_center_onboarding table
ALTER TABLE treatment_center_onboarding 
ADD COLUMN api_requirements jsonb DEFAULT NULL;