-- Create questionnaire sessions table to store dynamic questionnaire data
CREATE TABLE IF NOT EXISTS public.questionnaire_sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id),
    session_type TEXT NOT NULL DEFAULT 'dynamic_onboarding',
    responses JSONB NOT NULL DEFAULT '[]',
    analysis JSONB NOT NULL DEFAULT '{}',
    suitability_score INTEGER,
    agent_recommendation TEXT CHECK (agent_recommendation IN ('perfect-fit', 'good-fit', 'needs-enhancement', 'not-suitable')),
    recommended_path TEXT CHECK (recommended_path IN ('guided', 'self-service', 'consultation', 'alternative')),
    complexity_level TEXT CHECK (complexity_level IN ('Low', 'Medium', 'High', 'Expert')),
    estimated_timeline TEXT,
    resources_needed JSONB DEFAULT '[]',
    insights JSONB DEFAULT '{}',
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.questionnaire_sessions ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own questionnaire sessions" 
ON public.questionnaire_sessions 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own questionnaire sessions" 
ON public.questionnaire_sessions 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own questionnaire sessions" 
ON public.questionnaire_sessions 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create index for performance
CREATE INDEX idx_questionnaire_sessions_user_id ON public.questionnaire_sessions(user_id);
CREATE INDEX idx_questionnaire_sessions_created_at ON public.questionnaire_sessions(created_at);
CREATE INDEX idx_questionnaire_sessions_suitability_score ON public.questionnaire_sessions(suitability_score);

-- Create trigger for updated_at
CREATE TRIGGER update_questionnaire_sessions_updated_at
    BEFORE UPDATE ON public.questionnaire_sessions
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Create alternative solutions table
CREATE TABLE IF NOT EXISTS public.alternative_solutions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL, -- 'workflow_automation', 'business_process', 'consultation', etc.
    suitability_criteria JSONB NOT NULL DEFAULT '{}', -- Conditions when this is recommended
    external_url TEXT,
    contact_info JSONB DEFAULT '{}',
    pricing_info TEXT,
    implementation_time TEXT,
    complexity_level TEXT CHECK (complexity_level IN ('Low', 'Medium', 'High')),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS for alternative solutions
ALTER TABLE public.alternative_solutions ENABLE ROW LEVEL SECURITY;

-- Create policy for alternative solutions (viewable by all authenticated users)
CREATE POLICY "Authenticated users can view alternative solutions" 
ON public.alternative_solutions 
FOR SELECT 
USING (auth.uid() IS NOT NULL AND is_active = true);

-- Admins can manage alternative solutions
CREATE POLICY "Admins can manage alternative solutions" 
ON public.alternative_solutions 
FOR ALL 
USING (is_admin_user_safe(auth.uid()));

-- Insert some default alternative solutions
INSERT INTO public.alternative_solutions (name, description, category, suitability_criteria, external_url, complexity_level, implementation_time) VALUES
(
    'Zapier Automation',
    'Connect your apps and automate workflows without coding',
    'workflow_automation',
    '{"max_suitability_score": 40, "user_types": ["beginner"], "use_cases": ["simple_automation", "app_integration"]}',
    'https://zapier.com',
    'Low',
    '1-2 weeks'
),
(
    'Microsoft Power Automate',
    'Build automated workflows between your favorite apps and services',
    'workflow_automation',
    '{"max_suitability_score": 50, "business_context": ["enterprise"], "integration_needs": ["microsoft_ecosystem"]}',
    'https://powerautomate.microsoft.com',
    'Medium',
    '2-4 weeks'
),
(
    'Business Process Consultation',
    'Work with experts to map and optimize your processes before automation',
    'consultation',
    '{"max_suitability_score": 60, "problem_clarity": [1, 2], "stakeholder_alignment": ["No", "not sure"]}',
    null,
    'Medium',
    '4-8 weeks'
),
(
    'UiPath Community Edition',
    'Robotic Process Automation for repetitive tasks',
    'rpa_automation',
    '{"complexity_level": ["High", "Expert"], "business_context": ["enterprise"], "technical_level": ["advanced"]}',
    'https://www.uipath.com',
    'High',
    '6-12 weeks'
);

-- Create trigger for alternative solutions updated_at
CREATE TRIGGER update_alternative_solutions_updated_at
    BEFORE UPDATE ON public.alternative_solutions
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();