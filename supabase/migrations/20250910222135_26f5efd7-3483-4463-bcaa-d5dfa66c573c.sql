-- Expand profiles table for comprehensive patient data (only add missing columns)
DO $$ 
BEGIN
  -- Add patient demographic fields
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='date_of_birth') THEN
    ALTER TABLE profiles ADD COLUMN date_of_birth DATE;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='gender') THEN
    ALTER TABLE profiles ADD COLUMN gender TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='ethnicity') THEN
    ALTER TABLE profiles ADD COLUMN ethnicity TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='race') THEN
    ALTER TABLE profiles ADD COLUMN race TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='preferred_language') THEN
    ALTER TABLE profiles ADD COLUMN preferred_language TEXT;
  END IF;

  -- Add address fields
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='address_line_1') THEN
    ALTER TABLE profiles ADD COLUMN address_line_1 TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='address_line_2') THEN
    ALTER TABLE profiles ADD COLUMN address_line_2 TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='city') THEN
    ALTER TABLE profiles ADD COLUMN city TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='state') THEN
    ALTER TABLE profiles ADD COLUMN state TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='zip_code') THEN
    ALTER TABLE profiles ADD COLUMN zip_code TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='country') THEN
    ALTER TABLE profiles ADD COLUMN country TEXT DEFAULT 'USA';
  END IF;

  -- Add emergency contact fields
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='emergency_contact_name') THEN
    ALTER TABLE profiles ADD COLUMN emergency_contact_name TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='emergency_contact_relationship') THEN
    ALTER TABLE profiles ADD COLUMN emergency_contact_relationship TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='emergency_contact_phone') THEN
    ALTER TABLE profiles ADD COLUMN emergency_contact_phone TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='emergency_contact_email') THEN
    ALTER TABLE profiles ADD COLUMN emergency_contact_email TEXT;
  END IF;

  -- Add medical fields
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='primary_care_physician') THEN
    ALTER TABLE profiles ADD COLUMN primary_care_physician TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='referring_physician') THEN
    ALTER TABLE profiles ADD COLUMN referring_physician TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='medical_record_number') THEN
    ALTER TABLE profiles ADD COLUMN medical_record_number TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='patient_height_feet') THEN
    ALTER TABLE profiles ADD COLUMN patient_height_feet INTEGER;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='patient_height_inches') THEN
    ALTER TABLE profiles ADD COLUMN patient_height_inches INTEGER;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='patient_weight_lbs') THEN
    ALTER TABLE profiles ADD COLUMN patient_weight_lbs DECIMAL(5,2);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='allergies') THEN
    ALTER TABLE profiles ADD COLUMN allergies TEXT[];
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='current_medications') THEN
    ALTER TABLE profiles ADD COLUMN current_medications TEXT[];
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='medical_conditions') THEN
    ALTER TABLE profiles ADD COLUMN medical_conditions TEXT[];
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='previous_hospitalizations') THEN
    ALTER TABLE profiles ADD COLUMN previous_hospitalizations TEXT[];
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='family_medical_history') THEN
    ALTER TABLE profiles ADD COLUMN family_medical_history TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='social_history') THEN
    ALTER TABLE profiles ADD COLUMN social_history TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='smoking_status') THEN
    ALTER TABLE profiles ADD COLUMN smoking_status TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='alcohol_use') THEN
    ALTER TABLE profiles ADD COLUMN alcohol_use TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='occupation') THEN
    ALTER TABLE profiles ADD COLUMN occupation TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='marital_status') THEN
    ALTER TABLE profiles ADD COLUMN marital_status TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='communication_preferences') THEN
    ALTER TABLE profiles ADD COLUMN communication_preferences TEXT[];
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='accessibility_needs') THEN
    ALTER TABLE profiles ADD COLUMN accessibility_needs TEXT[];
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='consent_for_treatment') THEN
    ALTER TABLE profiles ADD COLUMN consent_for_treatment BOOLEAN DEFAULT false;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='consent_for_communication') THEN
    ALTER TABLE profiles ADD COLUMN consent_for_communication BOOLEAN DEFAULT false;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='hipaa_acknowledgment') THEN
    ALTER TABLE profiles ADD COLUMN hipaa_acknowledgment BOOLEAN DEFAULT false;
  END IF;
END $$;

-- Create therapies table with individual fields (only if it doesn't exist)
CREATE TABLE IF NOT EXISTS therapies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  therapy_type TEXT NOT NULL CHECK (therapy_type IN ('car_t_cell', 'gene_therapy', 'advanced_biologics', 'personalized_medicine', 'radioligand_therapy', 'cell_therapy', 'immunotherapy', 'other_cgat')),
  description TEXT,
  indication TEXT,
  target_population TEXT,
  mechanism_of_action TEXT,
  
  -- Special handling requirements as individual fields
  temperature_requirements TEXT,
  storage_conditions TEXT,
  handling_precautions TEXT[],
  transportation_requirements TEXT,
  shelf_life_hours INTEGER,
  preparation_time_minutes INTEGER,
  administration_time_minutes INTEGER,
  monitoring_requirements TEXT[],
  
  -- Regulatory designations
  regulatory_designations TEXT[],
  fda_approval_status TEXT,
  breakthrough_therapy_designation BOOLEAN DEFAULT false,
  orphan_drug_designation BOOLEAN DEFAULT false,
  fast_track_designation BOOLEAN DEFAULT false,
  regenerative_medicine_designation BOOLEAN DEFAULT false,
  
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS and create policies only if table was created
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'therapies') THEN
    -- Enable RLS
    ALTER TABLE therapies ENABLE ROW LEVEL SECURITY;
    
    -- Create policies only if they don't exist
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'therapies' AND policyname = 'Users can view therapies') THEN
      CREATE POLICY "Users can view therapies" ON therapies FOR SELECT USING (auth.uid() IS NOT NULL);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'therapies' AND policyname = 'Admins can manage therapies') THEN
      CREATE POLICY "Admins can manage therapies" ON therapies FOR ALL USING (is_admin_user_safe(auth.uid()));
    END IF;
  END IF;
END $$;

-- Update existing onboarding_therapy_selections to use individual fields instead of JSONB
DO $$
BEGIN
  -- Remove old JSONB columns if they exist
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='onboarding_therapy_selections' AND column_name='infrastructure_requirements') THEN
    ALTER TABLE onboarding_therapy_selections DROP COLUMN infrastructure_requirements;
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='onboarding_therapy_selections' AND column_name='staff_training_needs') THEN
    ALTER TABLE onboarding_therapy_selections DROP COLUMN staff_training_needs;
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='onboarding_therapy_selections' AND column_name='timeline_considerations') THEN
    ALTER TABLE onboarding_therapy_selections DROP COLUMN timeline_considerations;
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='onboarding_therapy_selections' AND column_name='special_requirements') THEN
    ALTER TABLE onboarding_therapy_selections DROP COLUMN special_requirements;
  END IF;

  -- Add individual infrastructure requirement fields
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='onboarding_therapy_selections' AND column_name='clean_room_required') THEN
    ALTER TABLE onboarding_therapy_selections ADD COLUMN clean_room_required BOOLEAN DEFAULT false;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='onboarding_therapy_selections' AND column_name='isolation_room_required') THEN
    ALTER TABLE onboarding_therapy_selections ADD COLUMN isolation_room_required BOOLEAN DEFAULT false;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='onboarding_therapy_selections' AND column_name='specialized_equipment') THEN
    ALTER TABLE onboarding_therapy_selections ADD COLUMN specialized_equipment TEXT[];
  END IF;
  
  -- Add individual staff training fields
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='onboarding_therapy_selections' AND column_name='required_certifications') THEN
    ALTER TABLE onboarding_therapy_selections ADD COLUMN required_certifications TEXT[];
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='onboarding_therapy_selections' AND column_name='training_hours_required') THEN
    ALTER TABLE onboarding_therapy_selections ADD COLUMN training_hours_required INTEGER;
  END IF;
  
  -- Add individual timeline fields  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='onboarding_therapy_selections' AND column_name='planning_phase_weeks') THEN
    ALTER TABLE onboarding_therapy_selections ADD COLUMN planning_phase_weeks INTEGER;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='onboarding_therapy_selections' AND column_name='go_live_target_date') THEN
    ALTER TABLE onboarding_therapy_selections ADD COLUMN go_live_target_date DATE;
  END IF;
  
  -- Add individual special requirement fields
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='onboarding_therapy_selections' AND column_name='regulatory_submissions_needed') THEN
    ALTER TABLE onboarding_therapy_selections ADD COLUMN regulatory_submissions_needed TEXT[];
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='onboarding_therapy_selections' AND column_name='patient_registry_participation') THEN
    ALTER TABLE onboarding_therapy_selections ADD COLUMN patient_registry_participation BOOLEAN DEFAULT false;
  END IF;
END $$;