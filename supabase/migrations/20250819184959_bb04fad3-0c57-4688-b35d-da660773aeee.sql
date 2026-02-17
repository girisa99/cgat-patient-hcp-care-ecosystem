-- Insert sample journey stages for existing templates
-- First, let's add journey stages for the Patient Support template for patient onboarding
INSERT INTO agent_template_journey_stages (template_id, order_index, title, description, owner_role, entry_criteria, tasks_checklist, expected_duration_minutes, outputs_success_criteria, risks, dependencies, validation_checkpoints)
SELECT 
    id as template_id,
    0 as order_index,
    'Patient Registration and Verification' as title,
    'Collect and verify patient demographics, insurance information, and identity' as description,
    'Registration Staff' as owner_role,
    '["Patient arrival", "Valid identification provided"]'::jsonb as entry_criteria,
    '["Collect demographics", "Verify insurance", "Take photo ID", "Confirm emergency contacts"]'::jsonb as tasks_checklist,
    15 as expected_duration_minutes,
    '["Complete demographics captured", "Insurance verified", "Emergency contacts confirmed"]'::jsonb as outputs_success_criteria,
    '["Identity fraud", "Insurance verification delays"]'::jsonb as risks,
    '["Insurance verification system", "Photo ID scanner"]'::jsonb as dependencies,
    '["Demographics accuracy check", "Insurance eligibility confirmation"]'::jsonb as validation_checkpoints
FROM agent_templates 
WHERE name = 'Patient Support'
UNION ALL
SELECT 
    id as template_id,
    1 as order_index,
    'Medical History Collection' as title,
    'Gather comprehensive medical history and current medications' as description,
    'Clinical Staff' as owner_role,
    '["Patient registered", "Consent forms signed"]'::jsonb as entry_criteria,
    '["Review medical history form", "Confirm current medications", "Note allergies", "Update medical records"]'::jsonb as tasks_checklist,
    20 as expected_duration_minutes,
    '["Medical history documented", "Medication list updated", "Allergy information confirmed"]'::jsonb as outputs_success_criteria,
    '["Incomplete medical history", "Medication interaction risks"]'::jsonb as risks,
    '["EMR system", "Medication database"]'::jsonb as dependencies,
    '["Medical history completeness", "Medication accuracy verification"]'::jsonb as validation_checkpoints
FROM agent_templates 
WHERE name = 'Patient Support'
UNION ALL
SELECT 
    id as template_id,
    2 as order_index,
    'Care Team Assignment' as title,
    'Assign appropriate care team members based on patient needs and condition' as description,
    'Care Coordinator' as owner_role,
    '["Medical history reviewed", "Patient condition assessed"]'::jsonb as entry_criteria,
    '["Assess care needs", "Assign primary provider", "Schedule initial consultation", "Notify care team"]'::jsonb as tasks_checklist,
    10 as expected_duration_minutes,
    '["Care team assigned", "Initial consultation scheduled", "Care plan initiated"]'::jsonb as outputs_success_criteria,
    '["Provider availability", "Care coordination delays"]'::jsonb as risks,
    '["Provider scheduling system", "Care team directory"]'::jsonb as dependencies,
    '["Provider assignment confirmation", "Schedule verification"]'::jsonb as validation_checkpoints
FROM agent_templates 
WHERE name = 'Patient Support';

-- Add journey stages for Healthcare Assistant template
INSERT INTO agent_template_journey_stages (template_id, order_index, title, description, owner_role, entry_criteria, tasks_checklist, expected_duration_minutes, outputs_success_criteria, risks, dependencies, validation_checkpoints)
SELECT 
    id as template_id,
    0 as order_index,
    'Initial Patient Assessment' as title,
    'Conduct initial triage and assessment of patient needs' as description,
    'Healthcare Assistant' as owner_role,
    '["Patient contact initiated", "Basic information collected"]'::jsonb as entry_criteria,
    '["Conduct triage assessment", "Identify urgent needs", "Document symptoms", "Determine care priority"]'::jsonb as tasks_checklist,
    15 as expected_duration_minutes,
    '["Triage completed", "Care priority assigned", "Urgent needs identified"]'::jsonb as outputs_success_criteria,
    '["Missed urgent symptoms", "Incorrect triage level"]'::jsonb as risks,
    '["Triage protocols", "Assessment tools"]'::jsonb as dependencies,
    '["Triage accuracy check", "Symptom documentation review"]'::jsonb as validation_checkpoints
FROM agent_templates 
WHERE name = 'Healthcare Assistant'
UNION ALL
SELECT 
    id as template_id,
    1 as order_index,
    'Care Coordination' as title,
    'Coordinate care activities and communicate with healthcare team' as description,
    'Healthcare Assistant' as owner_role,
    '["Assessment completed", "Care priority established"]'::jsonb as entry_criteria,
    '["Communicate with care team", "Schedule appointments", "Coordinate services", "Update care plan"]'::jsonb as tasks_checklist,
    20 as expected_duration_minutes,
    '["Care activities coordinated", "Team communication completed", "Services scheduled"]'::jsonb as outputs_success_criteria,
    '["Communication gaps", "Scheduling conflicts"]'::jsonb as risks,
    '["Care team availability", "Scheduling systems"]'::jsonb as dependencies,
    '["Team communication verification", "Schedule confirmation"]'::jsonb as validation_checkpoints
FROM agent_templates 
WHERE name = 'Healthcare Assistant';

-- Update the templates with journey stage counts in their JSON column for quick preview
UPDATE agent_templates 
SET journey_stages = (
    SELECT jsonb_agg(
        jsonb_build_object(
            'id', id,
            'title', title,
            'description', description,
            'order_index', order_index,
            'owner_role', owner_role,
            'expected_duration_minutes', expected_duration_minutes
        ) ORDER BY order_index
    )
    FROM agent_template_journey_stages 
    WHERE template_id = agent_templates.id
)
WHERE id IN (
    SELECT DISTINCT template_id 
    FROM agent_template_journey_stages 
    WHERE template_id IN (SELECT id FROM agent_templates)
);