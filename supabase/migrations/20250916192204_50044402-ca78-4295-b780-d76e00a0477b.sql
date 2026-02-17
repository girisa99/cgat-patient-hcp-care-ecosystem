-- Create WhatsApp consent sessions table for patient enrollment
CREATE TABLE IF NOT EXISTS public.whatsapp_consent_sessions (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    enrollment_id UUID REFERENCES public.patient_enrollments(id) ON DELETE CASCADE,
    phone_number TEXT NOT NULL,
    location_type TEXT NOT NULL CHECK (location_type IN ('facility', 'remote', 'caregiver')),
    consent_method TEXT NOT NULL CHECK (consent_method IN ('whatsapp_chat', 'whatsapp_voice', 'verbal_phone')),
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'failed')),
    session_data JSONB DEFAULT '{}',
    patient_info JSONB DEFAULT '{}',
    caregiver_info JSONB DEFAULT '{}',
    signature_alternative TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    completed_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS
ALTER TABLE public.whatsapp_consent_sessions ENABLE ROW LEVEL SECURITY;

-- Create policies for WhatsApp consent sessions
CREATE POLICY "Users can view their own consent sessions" 
ON public.whatsapp_consent_sessions 
FOR SELECT 
USING (
    EXISTS (
        SELECT 1 FROM public.patient_enrollments pe 
        WHERE pe.id = whatsapp_consent_sessions.enrollment_id 
        AND pe.user_id = auth.uid()
    )
    OR auth.uid() IN (
        SELECT user_id FROM public.user_roles 
        WHERE role IN ('superAdmin', 'healthcareProvider', 'onboardingTeam')
    )
);

CREATE POLICY "Users can create consent sessions" 
ON public.whatsapp_consent_sessions 
FOR INSERT 
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.patient_enrollments pe 
        WHERE pe.id = whatsapp_consent_sessions.enrollment_id 
        AND pe.user_id = auth.uid()
    )
    OR auth.uid() IN (
        SELECT user_id FROM public.user_roles 
        WHERE role IN ('superAdmin', 'healthcareProvider', 'onboardingTeam')
    )
);

CREATE POLICY "Users can update consent sessions" 
ON public.whatsapp_consent_sessions 
FOR UPDATE 
USING (
    EXISTS (
        SELECT 1 FROM public.patient_enrollments pe 
        WHERE pe.id = whatsapp_consent_sessions.enrollment_id 
        AND pe.user_id = auth.uid()
    )
    OR auth.uid() IN (
        SELECT user_id FROM public.user_roles 
        WHERE role IN ('superAdmin', 'healthcareProvider', 'onboardingTeam')
    )
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_whatsapp_consent_sessions_enrollment_id ON public.whatsapp_consent_sessions(enrollment_id);
CREATE INDEX IF NOT EXISTS idx_whatsapp_consent_sessions_phone_number ON public.whatsapp_consent_sessions(phone_number);
CREATE INDEX IF NOT EXISTS idx_whatsapp_consent_sessions_status ON public.whatsapp_consent_sessions(status);
CREATE INDEX IF NOT EXISTS idx_whatsapp_consent_sessions_created_at ON public.whatsapp_consent_sessions(created_at);

-- Create trigger for automatic timestamp updates
CREATE OR REPLACE FUNCTION public.update_whatsapp_consent_sessions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_whatsapp_consent_sessions_updated_at
    BEFORE UPDATE ON public.whatsapp_consent_sessions
    FOR EACH ROW
    EXECUTE FUNCTION public.update_whatsapp_consent_sessions_updated_at();

-- Add WhatsApp consent method to enrollment_consent table if not exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'enrollment_consent' 
        AND column_name = 'collection_method'
    ) THEN
        ALTER TABLE public.enrollment_consent 
        ADD COLUMN collection_method TEXT DEFAULT 'standard' 
        CHECK (collection_method IN ('standard', 'whatsapp_agent', 'voice_call', 'caregiver_assisted'));
    END IF;
END $$;

-- Add location context to enrollment_consent table if not exists  
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'enrollment_consent' 
        AND column_name = 'location_type'
    ) THEN
        ALTER TABLE public.enrollment_consent 
        ADD COLUMN location_type TEXT DEFAULT 'facility' 
        CHECK (location_type IN ('facility', 'remote', 'caregiver'));
    END IF;
END $$;