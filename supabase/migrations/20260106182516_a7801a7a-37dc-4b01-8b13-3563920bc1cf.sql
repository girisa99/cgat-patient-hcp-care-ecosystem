-- Add Optum-powered agent data requirements

-- Optum Eligibility Agent
INSERT INTO public.agent_data_requirements (agent_type_id, display_name, description, category, required_api_fields, required_document_data, optional_document_data, supported_data_methods, setup_instructions) 
VALUES (
  'optum-eligibility',
  'Optum Eligibility Agent',
  'Real-time eligibility verification via Optum/Change Healthcare APIs',
  'insurance',
  '[
    {"name": "optum_client_id", "label": "Optum Client ID", "type": "text", "required": true, "description": "OAuth2 client ID from developer.optum.com"},
    {"name": "optum_client_secret", "label": "Optum Client Secret", "type": "secret", "required": true, "description": "OAuth2 client secret"},
    {"name": "provider_npi", "label": "Provider NPI", "type": "text", "required": true, "description": "Your organization NPI"},
    {"name": "submitter_id", "label": "Submitter ID", "type": "text", "required": false, "description": "EDI submitter identifier"}
  ]'::jsonb,
  '[
    {"field": "member_id", "label": "Member ID", "source": "insurance_card", "fallback": "manual_input", "required": true},
    {"field": "payer_id", "label": "Payer ID", "source": "insurance_card", "fallback": "lookup", "required": true},
    {"field": "patient_dob", "label": "Patient DOB", "source": "patient_record", "fallback": "manual_input", "required": true},
    {"field": "patient_name", "label": "Patient Name", "source": "insurance_card", "required": true}
  ]'::jsonb,
  '[
    {"field": "group_number", "label": "Group Number", "source": "insurance_card"},
    {"field": "subscriber_id", "label": "Subscriber ID", "source": "insurance_card"},
    {"field": "service_date", "label": "Service Date", "source": "manual_input"}
  ]'::jsonb,
  '["inline_upload", "navigate_upload", "extracted_data", "manual_entry"]'::jsonb,
  'Optum Eligibility API Setup:\n\n**1. Get API Credentials:**\n- Register at https://developer.optum.com\n- Request sandbox access\n- Create OAuth2 application\n\n**2. Required Information:**\n- Client ID and Secret from your app\n- Provider NPI (validated via NPPES)\n- Submitter ID (for EDI transactions)\n\n**3. Supported Features:**\n- Real-time 270/271 eligibility transactions\n- Coverage status and plan details\n- Copay/deductible information\n- Prior auth requirements'
) ON CONFLICT (agent_type_id) DO NOTHING;

-- Optum Benefits & Copay Agent
INSERT INTO public.agent_data_requirements (agent_type_id, display_name, description, category, required_api_fields, required_document_data, optional_document_data, supported_data_methods, setup_instructions) 
VALUES (
  'optum-benefits',
  'Optum Benefits & Copay Agent',
  'Real-time copay, deductible, out-of-pocket maximums via Optum APIs',
  'insurance',
  '[
    {"name": "optum_client_id", "label": "Optum Client ID", "type": "text", "required": true, "description": "Same as eligibility credentials"},
    {"name": "optum_client_secret", "label": "Optum Client Secret", "type": "secret", "required": true, "description": "OAuth2 client secret"},
    {"name": "provider_npi", "label": "Provider NPI", "type": "text", "required": true, "description": "Your organization NPI"},
    {"name": "service_type_codes", "label": "Service Type Codes", "type": "text", "required": false, "description": "Comma-separated codes (e.g., 30,47,88)"}
  ]'::jsonb,
  '[
    {"field": "member_id", "label": "Member ID", "source": "insurance_card", "fallback": "manual_input", "required": true},
    {"field": "payer_id", "label": "Payer ID", "source": "insurance_card", "required": true}
  ]'::jsonb,
  '[
    {"field": "service_type", "label": "Service Type", "source": "manual_input"},
    {"field": "procedure_code", "label": "Procedure Code (CPT)", "source": "invoice"},
    {"field": "diagnosis_code", "label": "Diagnosis Code (ICD-10)", "source": "prescription"}
  ]'::jsonb,
  '["extracted_data", "manual_entry", "cross_document"]'::jsonb,
  'Optum Benefits API:\n\n**Returns:**\n- Copay amounts by service type\n- Deductible (met/remaining)\n- Out-of-pocket maximum status\n- Coinsurance percentages\n- In-network vs out-of-network benefits\n\n**Service Type Codes:**\n- 30: Health Benefit Plan Coverage\n- 47: Hospital\n- 88: Pharmacy\n- MH: Mental Health\n- UC: Urgent Care'
) ON CONFLICT (agent_type_id) DO NOTHING;

-- Optum Pharmacy Agent
INSERT INTO public.agent_data_requirements (agent_type_id, display_name, description, category, required_api_fields, required_document_data, optional_document_data, supported_data_methods, setup_instructions) 
VALUES (
  'optum-pharmacy',
  'Optum Pharmacy Agent',
  'Pharmacy benefits, drug coverage, formulary status via Optum Pharmacy Solutions',
  'pharmacy',
  '[
    {"name": "optum_pharmacy_client_id", "label": "Optum Pharmacy Client ID", "type": "text", "required": true, "description": "Pharmacy Solutions API credentials"},
    {"name": "optum_pharmacy_client_secret", "label": "Optum Pharmacy Client Secret", "type": "secret", "required": true, "description": "OAuth2 client secret"},
    {"name": "pharmacy_npi", "label": "Pharmacy NPI", "type": "text", "required": false, "description": "If submitting as pharmacy"},
    {"name": "pbm_id", "label": "PBM Identifier", "type": "text", "required": false, "description": "Pharmacy Benefit Manager ID"}
  ]'::jsonb,
  '[
    {"field": "medication_name", "label": "Medication Name", "source": "prescription", "required": true},
    {"field": "ndc", "label": "NDC Code", "source": "prescription", "fallback": "ndc_lookup", "required": true},
    {"field": "member_id", "label": "Member ID", "source": "insurance_card", "required": true}
  ]'::jsonb,
  '[
    {"field": "quantity", "label": "Quantity", "source": "prescription"},
    {"field": "days_supply", "label": "Days Supply", "source": "prescription"},
    {"field": "prescriber_npi", "label": "Prescriber NPI", "source": "prescription"}
  ]'::jsonb,
  '["inline_upload", "extracted_data", "cross_document"]'::jsonb,
  'Optum Pharmacy Solutions:\n\n**Features:**\n- Formulary tier lookup\n- Drug coverage status\n- Prior auth requirements for medications\n- Step therapy requirements\n- Patient copay estimation\n- Generic/brand alternatives\n\n**Cross-Document Flow:**\n1. Extract NDC from prescription\n2. Get member ID from insurance card\n3. Query pharmacy benefits\n4. Return copay + coverage status'
) ON CONFLICT (agent_type_id) DO NOTHING;

-- Optum Claims Agent
INSERT INTO public.agent_data_requirements (agent_type_id, display_name, description, category, required_api_fields, required_document_data, optional_document_data, supported_data_methods, setup_instructions) 
VALUES (
  'optum-claims',
  'Optum Claims Submission Agent',
  'Electronic claims submission and status tracking via Optum',
  'billing',
  '[
    {"name": "optum_claims_client_id", "label": "Optum Claims Client ID", "type": "text", "required": true, "description": "Claims API credentials"},
    {"name": "optum_claims_client_secret", "label": "Optum Claims Client Secret", "type": "secret", "required": true, "description": "OAuth2 client secret"},
    {"name": "provider_npi", "label": "Provider NPI", "type": "text", "required": true, "description": "Billing provider NPI"},
    {"name": "provider_tax_id", "label": "Provider Tax ID", "type": "text", "required": true, "description": "EIN/TIN for billing"},
    {"name": "clearinghouse_id", "label": "Clearinghouse ID", "type": "text", "required": false, "description": "If using clearinghouse"}
  ]'::jsonb,
  '[
    {"field": "patient_name", "label": "Patient Name", "source": "invoice", "required": true},
    {"field": "member_id", "label": "Member ID", "source": "insurance_card", "required": true},
    {"field": "payer_id", "label": "Payer ID", "source": "insurance_card", "required": true},
    {"field": "service_date", "label": "Service Date", "source": "invoice", "required": true},
    {"field": "procedure_codes", "label": "Procedure Codes (CPT)", "source": "invoice", "required": true},
    {"field": "diagnosis_codes", "label": "Diagnosis Codes (ICD-10)", "source": "invoice", "required": true}
  ]'::jsonb,
  '[
    {"field": "place_of_service", "label": "Place of Service", "source": "invoice"},
    {"field": "modifiers", "label": "Modifiers", "source": "invoice"},
    {"field": "charges", "label": "Charges", "source": "invoice"},
    {"field": "referring_npi", "label": "Referring Provider NPI", "source": "invoice"}
  ]'::jsonb,
  '["extracted_data", "cross_document", "manual_entry"]'::jsonb,
  'Optum Claims API:\n\n**837 Professional/Institutional Claims:**\n- Real-time claim submission\n- Claim status inquiry (276/277)\n- Batch submission support\n- Attachment handling\n\n**Cross-Document Integration:**\n- Patient info from onboarding\n- Insurance from card upload\n- Diagnosis from prescription/encounter\n- Charges from invoice'
) ON CONFLICT (agent_type_id) DO NOTHING;

-- Optum Payment Agent
INSERT INTO public.agent_data_requirements (agent_type_id, display_name, description, category, required_api_fields, required_document_data, optional_document_data, supported_data_methods, setup_instructions) 
VALUES (
  'optum-payment',
  'Optum Payment & ERA Agent',
  'Payment processing, ERA/EOB automation via Optum Payment & Reimbursement',
  'billing',
  '[
    {"name": "optum_payment_client_id", "label": "Optum Payment Client ID", "type": "text", "required": true, "description": "Payment API credentials"},
    {"name": "optum_payment_client_secret", "label": "Optum Payment Client Secret", "type": "secret", "required": true, "description": "OAuth2 client secret"},
    {"name": "provider_npi", "label": "Provider NPI", "type": "text", "required": true, "description": "Payment recipient NPI"},
    {"name": "era_enrollment_id", "label": "ERA Enrollment ID", "type": "text", "required": false, "description": "835 ERA enrollment identifier"}
  ]'::jsonb,
  '[
    {"field": "claim_id", "label": "Claim ID", "source": "claims_data", "required": true},
    {"field": "payer_id", "label": "Payer ID", "source": "insurance_card", "required": true}
  ]'::jsonb,
  '[
    {"field": "check_number", "label": "Check/EFT Number", "source": "manual_input"},
    {"field": "payment_date", "label": "Payment Date", "source": "manual_input"},
    {"field": "payment_amount", "label": "Payment Amount", "source": "manual_input"}
  ]'::jsonb,
  '["extracted_data", "manual_entry"]'::jsonb,
  'Optum Payment & Reimbursement:\n\n**ERA/EOB Processing:**\n- 835 ERA retrieval and parsing\n- Automatic payment posting\n- Denial reason code translation\n- Adjustment tracking\n\n**Payment Features:**\n- EFT/ACH status\n- Check trace\n- Recoupment handling\n- Secondary billing triggers'
) ON CONFLICT (agent_type_id) DO NOTHING;

-- Optum Real-Time Exchange Agent
INSERT INTO public.agent_data_requirements (agent_type_id, display_name, description, category, required_api_fields, required_document_data, optional_document_data, supported_data_methods, setup_instructions) 
VALUES (
  'optum-real',
  'Optum Real-Time Exchange Agent',
  'Real-time eligibility + claims adjudication in single transaction',
  'insurance',
  '[
    {"name": "optum_real_client_id", "label": "Optum Real Client ID", "type": "text", "required": true, "description": "Real-Time API credentials"},
    {"name": "optum_real_client_secret", "label": "Optum Real Client Secret", "type": "secret", "required": true, "description": "OAuth2 client secret"},
    {"name": "provider_npi", "label": "Provider NPI", "type": "text", "required": true, "description": "Credentialed provider NPI"},
    {"name": "real_enrollment_id", "label": "Real-Time Enrollment ID", "type": "text", "required": true, "description": "Enrollment for real-time transactions"}
  ]'::jsonb,
  '[
    {"field": "member_id", "label": "Member ID", "source": "insurance_card", "required": true},
    {"field": "payer_id", "label": "Payer ID", "source": "insurance_card", "required": true},
    {"field": "procedure_code", "label": "Procedure Code", "source": "invoice", "fallback": "manual_input", "required": true},
    {"field": "service_date", "label": "Service Date", "source": "manual_input", "required": true}
  ]'::jsonb,
  '[
    {"field": "diagnosis_code", "label": "Diagnosis Code", "source": "prescription"},
    {"field": "place_of_service", "label": "Place of Service", "source": "invoice"},
    {"field": "charge_amount", "label": "Charge Amount", "source": "invoice"}
  ]'::jsonb,
  '["extracted_data", "cross_document", "manual_entry"]'::jsonb,
  'Optum Real-Time Exchange:\n\n**Single Transaction:**\n- Eligibility verification\n- Benefits check\n- Claim adjudication\n- Patient responsibility estimate\n\n**Use Cases:**\n- Point-of-service collection\n- Pre-service authorization\n- Immediate claim submission\n- Patient cost transparency'
) ON CONFLICT (agent_type_id) DO NOTHING;