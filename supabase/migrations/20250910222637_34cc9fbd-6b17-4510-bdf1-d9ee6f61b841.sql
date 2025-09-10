-- Convert Treatment Center Onboarding JSONB fields to individual columns
DO $$
BEGIN
  -- Drop JSONB columns and add individual fields for treatment_center_onboarding
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='treatment_center_onboarding' AND column_name='api_requirements') THEN
    ALTER TABLE treatment_center_onboarding DROP COLUMN api_requirements;
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='treatment_center_onboarding' AND column_name='operational_hours') THEN
    ALTER TABLE treatment_center_onboarding DROP COLUMN operational_hours;
  END IF;

  -- Add individual API requirement fields
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='treatment_center_onboarding' AND column_name='api_endpoint_url') THEN
    ALTER TABLE treatment_center_onboarding ADD COLUMN api_endpoint_url TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='treatment_center_onboarding' AND column_name='api_authentication_method') THEN
    ALTER TABLE treatment_center_onboarding ADD COLUMN api_authentication_method TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='treatment_center_onboarding' AND column_name='api_key_required') THEN
    ALTER TABLE treatment_center_onboarding ADD COLUMN api_key_required BOOLEAN DEFAULT false;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='treatment_center_onboarding' AND column_name='webhook_url') THEN
    ALTER TABLE treatment_center_onboarding ADD COLUMN webhook_url TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='treatment_center_onboarding' AND column_name='data_format_preference') THEN
    ALTER TABLE treatment_center_onboarding ADD COLUMN data_format_preference TEXT;
  END IF;

  -- Add individual operational hours fields
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='treatment_center_onboarding' AND column_name='monday_open') THEN
    ALTER TABLE treatment_center_onboarding ADD COLUMN monday_open TIME;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='treatment_center_onboarding' AND column_name='monday_close') THEN
    ALTER TABLE treatment_center_onboarding ADD COLUMN monday_close TIME;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='treatment_center_onboarding' AND column_name='tuesday_open') THEN
    ALTER TABLE treatment_center_onboarding ADD COLUMN tuesday_open TIME;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='treatment_center_onboarding' AND column_name='tuesday_close') THEN
    ALTER TABLE treatment_center_onboarding ADD COLUMN tuesday_close TIME;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='treatment_center_onboarding' AND column_name='wednesday_open') THEN
    ALTER TABLE treatment_center_onboarding ADD COLUMN wednesday_open TIME;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='treatment_center_onboarding' AND column_name='wednesday_close') THEN
    ALTER TABLE treatment_center_onboarding ADD COLUMN wednesday_close TIME;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='treatment_center_onboarding' AND column_name='thursday_open') THEN
    ALTER TABLE treatment_center_onboarding ADD COLUMN thursday_open TIME;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='treatment_center_onboarding' AND column_name='thursday_close') THEN
    ALTER TABLE treatment_center_onboarding ADD COLUMN thursday_close TIME;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='treatment_center_onboarding' AND column_name='friday_open') THEN
    ALTER TABLE treatment_center_onboarding ADD COLUMN friday_open TIME;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='treatment_center_onboarding' AND column_name='friday_close') THEN
    ALTER TABLE treatment_center_onboarding ADD COLUMN friday_close TIME;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='treatment_center_onboarding' AND column_name='saturday_open') THEN
    ALTER TABLE treatment_center_onboarding ADD COLUMN saturday_open TIME;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='treatment_center_onboarding' AND column_name='saturday_close') THEN
    ALTER TABLE treatment_center_onboarding ADD COLUMN saturday_close TIME;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='treatment_center_onboarding' AND column_name='sunday_open') THEN
    ALTER TABLE treatment_center_onboarding ADD COLUMN sunday_open TIME;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='treatment_center_onboarding' AND column_name='sunday_close') THEN
    ALTER TABLE treatment_center_onboarding ADD COLUMN sunday_close TIME;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='treatment_center_onboarding' AND column_name='timezone') THEN
    ALTER TABLE treatment_center_onboarding ADD COLUMN timezone TEXT DEFAULT 'UTC';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='treatment_center_onboarding' AND column_name='holiday_schedule_notes') THEN
    ALTER TABLE treatment_center_onboarding ADD COLUMN holiday_schedule_notes TEXT;
  END IF;
END $$;

-- Convert Enrollment Instances JSONB fields to individual columns
DO $$
BEGIN
  -- Drop JSONB columns for enrollment_instances
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='enrollment_instances' AND column_name='collaboration_data') THEN
    ALTER TABLE enrollment_instances DROP COLUMN collaboration_data;
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='enrollment_instances' AND column_name='consent_data') THEN
    ALTER TABLE enrollment_instances DROP COLUMN consent_data;
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='enrollment_instances' AND column_name='enrollment_data') THEN
    ALTER TABLE enrollment_instances DROP COLUMN enrollment_data;
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='enrollment_instances' AND column_name='workflow_metadata') THEN
    ALTER TABLE enrollment_instances DROP COLUMN workflow_metadata;
  END IF;

  -- Add individual collaboration fields
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='enrollment_instances' AND column_name='primary_coordinator_name') THEN
    ALTER TABLE enrollment_instances ADD COLUMN primary_coordinator_name TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='enrollment_instances' AND column_name='primary_coordinator_email') THEN
    ALTER TABLE enrollment_instances ADD COLUMN primary_coordinator_email TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='enrollment_instances' AND column_name='secondary_coordinator_name') THEN
    ALTER TABLE enrollment_instances ADD COLUMN secondary_coordinator_name TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='enrollment_instances' AND column_name='secondary_coordinator_email') THEN
    ALTER TABLE enrollment_instances ADD COLUMN secondary_coordinator_email TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='enrollment_instances' AND column_name='team_members') THEN
    ALTER TABLE enrollment_instances ADD COLUMN team_members TEXT[];
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='enrollment_instances' AND column_name='communication_frequency') THEN
    ALTER TABLE enrollment_instances ADD COLUMN communication_frequency TEXT;
  END IF;

  -- Add individual consent fields
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='enrollment_instances' AND column_name='hipaa_consent_signed') THEN
    ALTER TABLE enrollment_instances ADD COLUMN hipaa_consent_signed BOOLEAN DEFAULT false;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='enrollment_instances' AND column_name='hipaa_consent_date') THEN
    ALTER TABLE enrollment_instances ADD COLUMN hipaa_consent_date DATE;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='enrollment_instances' AND column_name='treatment_consent_signed') THEN
    ALTER TABLE enrollment_instances ADD COLUMN treatment_consent_signed BOOLEAN DEFAULT false;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='enrollment_instances' AND column_name='treatment_consent_date') THEN
    ALTER TABLE enrollment_instances ADD COLUMN treatment_consent_date DATE;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='enrollment_instances' AND column_name='research_consent_signed') THEN
    ALTER TABLE enrollment_instances ADD COLUMN research_consent_signed BOOLEAN DEFAULT false;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='enrollment_instances' AND column_name='research_consent_date') THEN
    ALTER TABLE enrollment_instances ADD COLUMN research_consent_date DATE;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='enrollment_instances' AND column_name='financial_consent_signed') THEN
    ALTER TABLE enrollment_instances ADD COLUMN financial_consent_signed BOOLEAN DEFAULT false;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='enrollment_instances' AND column_name='financial_consent_date') THEN
    ALTER TABLE enrollment_instances ADD COLUMN financial_consent_date DATE;
  END IF;

  -- Add individual enrollment tracking fields
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='enrollment_instances' AND column_name='enrollment_source') THEN
    ALTER TABLE enrollment_instances ADD COLUMN enrollment_source TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='enrollment_instances' AND column_name='referral_physician') THEN
    ALTER TABLE enrollment_instances ADD COLUMN referral_physician TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='enrollment_instances' AND column_name='enrollment_priority') THEN
    ALTER TABLE enrollment_instances ADD COLUMN enrollment_priority TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='enrollment_instances' AND column_name='estimated_start_date') THEN
    ALTER TABLE enrollment_instances ADD COLUMN estimated_start_date DATE;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='enrollment_instances' AND column_name='actual_start_date') THEN
    ALTER TABLE enrollment_instances ADD COLUMN actual_start_date DATE;
  END IF;

  -- Add individual workflow fields
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='enrollment_instances' AND column_name='workflow_version') THEN
    ALTER TABLE enrollment_instances ADD COLUMN workflow_version TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='enrollment_instances' AND column_name='current_step_number') THEN
    ALTER TABLE enrollment_instances ADD COLUMN current_step_number INTEGER;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='enrollment_instances' AND column_name='total_steps') THEN
    ALTER TABLE enrollment_instances ADD COLUMN total_steps INTEGER;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='enrollment_instances' AND column_name='workflow_notes') THEN
    ALTER TABLE enrollment_instances ADD COLUMN workflow_notes TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='enrollment_instances' AND column_name='last_action_by') THEN
    ALTER TABLE enrollment_instances ADD COLUMN last_action_by TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='enrollment_instances' AND column_name='last_action_date') THEN
    ALTER TABLE enrollment_instances ADD COLUMN last_action_date TIMESTAMPTZ;
  END IF;
END $$;