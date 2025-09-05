-- Add comprehensive healthcare agent templates for real workflow scenarios
INSERT INTO agent_templates (
  name, 
  description, 
  template_type, 
  is_default, 
  journey_stages,
  configuration,
  primary_color,
  secondary_color,
  accent_color,
  tagline
) VALUES 
(
  'Emergency Triage Assistant',
  'AI agent for emergency department triage and patient prioritization',
  'healthcare',
  true,
  '[
    {
      "id": "assessment",
      "title": "Initial Assessment",
      "description": "Rapid patient assessment and symptom collection",
      "duration": 3,
      "required_data": ["symptoms", "vital_signs", "medical_history"]
    },
    {
      "id": "prioritization",
      "title": "Triage Prioritization", 
      "description": "Assign emergency priority level based on protocols",
      "duration": 2,
      "outputs": ["priority_level", "recommended_care_path"]
    },
    {
      "id": "assignment",
      "title": "Care Team Assignment",
      "description": "Route to appropriate medical team",
      "duration": 1,
      "next_actions": ["notify_team", "prepare_workspace"]
    }
  ]'::jsonb,
  '{
    "ai_models": ["gpt-4o", "claude-3-5-sonnet"],
    "integrations": ["ehr_system", "triage_protocols"],
    "specializations": ["emergency_medicine", "triage"],
    "compliance": ["hipaa", "emergency_protocols"]
  }'::jsonb,
  '#dc2626',
  '#ef4444', 
  '#fca5a5',
  'Fast, accurate emergency triage powered by AI'
),
(
  'Medication Management Specialist',
  'Comprehensive medication reconciliation and management assistant',
  'healthcare',
  true,
  '[
    {
      "id": "reconciliation",
      "title": "Medication Reconciliation",
      "description": "Review current medications and identify conflicts",
      "duration": 5,
      "required_data": ["current_medications", "allergies", "conditions"]
    },
    {
      "id": "optimization",
      "title": "Therapy Optimization",
      "description": "Recommend dosage adjustments and alternatives",
      "duration": 10,
      "outputs": ["optimization_recommendations", "interaction_alerts"]
    },
    {
      "id": "monitoring",
      "title": "Ongoing Monitoring",
      "description": "Track medication effectiveness and side effects",
      "duration": 0,
      "type": "continuous",
      "alerts": ["adverse_events", "adherence_issues"]
    }
  ]'::jsonb,
  '{
    "ai_models": ["gpt-4o", "o3-2025-04-16"],
    "integrations": ["pharmacy_system", "drug_database", "lab_results"],
    "specializations": ["pharmacology", "clinical_pharmacy"],
    "monitoring": ["drug_interactions", "adherence_tracking"],
    "compliance": ["fda_guidelines", "clinical_protocols"]
  }'::jsonb,
  '#059669',
  '#10b981',
  '#6ee7b7',
  'Intelligent medication management for optimal patient outcomes'
),
(
  'Care Coordination Hub',
  'Multi-disciplinary care coordination and communication platform',
  'healthcare',
  true,
  '[
    {
      "id": "intake",
      "title": "Patient Intake",
      "description": "Comprehensive patient information gathering",
      "duration": 8,
      "stakeholders": ["patient", "family", "intake_coordinator"]
    },
    {
      "id": "assessment",
      "title": "Multi-disciplinary Assessment", 
      "description": "Coordinate assessments across care teams",
      "duration": 15,
      "participants": ["physician", "nurse", "social_worker", "therapist"]
    },
    {
      "id": "planning",
      "title": "Care Plan Development",
      "description": "Collaborative care plan creation and approval",
      "duration": 12,
      "outputs": ["care_plan", "discharge_goals", "resource_allocation"]
    },
    {
      "id": "execution",
      "title": "Care Delivery",
      "description": "Coordinated care delivery with real-time updates",
      "duration": 0,
      "type": "ongoing",
      "monitoring": ["progress_tracking", "communication_hub"]
    }
  ]'::jsonb,
  '{
    "ai_models": ["gpt-5-2025-08-07", "claude-3-5-sonnet"],
    "integrations": ["ehr_system", "scheduling", "communication_platform"],
    "workflow_types": ["care_coordination", "discharge_planning"],
    "stakeholder_management": true,
    "real_time_updates": true,
    "compliance": ["care_coordination_standards", "quality_metrics"]
  }'::jsonb,
  '#7c3aed',
  '#8b5cf6',
  '#c4b5fd',
  'Seamless care coordination across all disciplines'
),
(
  'Clinical Decision Support',
  'Evidence-based clinical decision support and diagnostic assistance',
  'healthcare',
  true,
  '[
    {
      "id": "data_collection",
      "title": "Clinical Data Review",
      "description": "Comprehensive review of patient clinical data",
      "duration": 5,
      "data_sources": ["labs", "imaging", "vitals", "history"]
    },
    {
      "id": "analysis",
      "title": "Evidence-Based Analysis",
      "description": "Apply clinical guidelines and research evidence",
      "duration": 8,
      "resources": ["clinical_guidelines", "medical_literature", "protocols"]
    },
    {
      "id": "recommendations",
      "title": "Clinical Recommendations",
      "description": "Generate evidence-based diagnostic and treatment suggestions",
      "duration": 3,
      "outputs": ["differential_diagnosis", "treatment_options", "risk_stratification"]
    },
    {
      "id": "monitoring",
      "title": "Outcome Monitoring",
      "description": "Track clinical outcomes and adjust recommendations",
      "duration": 0,
      "type": "continuous",
      "metrics": ["clinical_outcomes", "guideline_adherence"]
    }
  ]'::jsonb,
  '{
    "ai_models": ["o3-2025-04-16", "gpt-5-2025-08-07"],
    "knowledge_bases": ["medical_literature", "clinical_guidelines", "drug_database"],
    "integrations": ["ehr_system", "lab_system", "imaging_system"],
    "specializations": ["internal_medicine", "evidence_based_medicine"],
    "decision_support": true,
    "compliance": ["clinical_practice_guidelines", "quality_measures"]
  }'::jsonb,
  '#0891b2',
  '#06b6d4',
  '#67e8f9',
  'AI-powered clinical decision support for better outcomes'
);