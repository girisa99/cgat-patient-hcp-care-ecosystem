-- Update cost-analysis agent to reflect GoodRx public pricing widgets
UPDATE public.agent_data_requirements 
SET 
  required_api_fields = '[
    {"name": "goodrx_affiliate_id", "label": "GoodRx Affiliate ID", "type": "text", "required": false, "description": "Optional affiliate ID for GoodRx widget integration"},
    {"name": "rxnav_api_url", "label": "RxNav API URL", "type": "text", "required": false, "default": "https://rxnav.nlm.nih.gov/REST/", "description": "NIH RxNav is free and public"}
  ]'::jsonb,
  setup_instructions = 'Cost Analysis uses FREE public APIs:\n\n**RxNav API (NIH)** - Free, no key required\n- Drug information and interactions\n- Generic alternatives lookup\n- RxCUI mapping\n\n**GoodRx Widget** - Free, public pricing\n- Real-time pharmacy pricing display\n- Coupon availability\n- Optional: Register as affiliate for enhanced features\n\n**AI-Powered Analysis:**\n- Patient assistance program matching\n- Cost-saving recommendations\n- Generic substitution suggestions'
WHERE agent_type_id = 'cost-analysis';

-- Add benefits-verification agent
INSERT INTO public.agent_data_requirements (agent_type_id, display_name, description, category, required_api_fields, required_document_data, optional_document_data, supported_data_methods, setup_instructions) 
VALUES (
  'benefits-verification',
  'Benefits Verification Agent',
  'Checks specific benefit coverage, copays, deductibles, and out-of-pocket maximums',
  'insurance',
  '[
    {"name": "payer_api_key", "label": "Payer Portal API Key", "type": "secret", "required": false, "description": "Direct payer API credentials (if available)"},
    {"name": "provider_npi", "label": "Provider NPI", "type": "text", "required": true, "description": "Your organization NPI for benefits lookup"}
  ]'::jsonb,
  '[
    {"field": "member_id", "label": "Member ID", "source": "insurance_card", "fallback": "manual_input", "required": true},
    {"field": "insurance_name", "label": "Insurance Name", "source": "insurance_card", "required": true},
    {"field": "plan_name", "label": "Plan Name", "source": "insurance_card", "required": false}
  ]'::jsonb,
  '[
    {"field": "group_number", "label": "Group Number", "source": "insurance_card"},
    {"field": "service_type", "label": "Service Type", "source": "manual_input"}
  ]'::jsonb,
  '["inline_upload", "navigate_upload", "extracted_data", "manual_entry"]'::jsonb,
  'Benefits Verification can work in multiple modes:\n\n**AI-Powered (No API needed):**\n- Analyzes insurance card data\n- Estimates benefits based on plan type\n- Suggests coverage questions to ask\n\n**With Payer API:**\n- Real-time benefits lookup\n- Exact copay/deductible amounts\n- Prior auth requirements'
) ON CONFLICT (agent_type_id) DO UPDATE SET
  display_name = EXCLUDED.display_name,
  description = EXCLUDED.description,
  required_api_fields = EXCLUDED.required_api_fields,
  required_document_data = EXCLUDED.required_document_data,
  setup_instructions = EXCLUDED.setup_instructions;