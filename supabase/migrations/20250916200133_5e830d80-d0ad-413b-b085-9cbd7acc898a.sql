-- Create WhatsApp enrollment management tables with phone number handling and agent integration

-- WhatsApp enrollment sessions with phone number management
CREATE TABLE IF NOT EXISTS whatsapp_enrollment_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT NOT NULL UNIQUE,
  patient_phone TEXT NOT NULL,
  from_phone TEXT NOT NULL, -- Twilio/business phone number
  agent_type TEXT NOT NULL CHECK (agent_type IN ('conversational', 'structured', 'mcp_stepwise', 'hybrid')),
  enrollment_mode TEXT NOT NULL CHECK (enrollment_mode IN ('whatsapp_chat', 'whatsapp_voice', 'phone_verbal', 'hybrid_choice')),
  conversation_personality TEXT DEFAULT 'friendly_professional' CHECK (conversation_personality IN ('friendly_professional', 'humorous_warm', 'medical_empathetic', 'casual_supportive')),
  patient_data JSONB DEFAULT '{}',
  provider_data JSONB DEFAULT '{}',
  collected_fields JSONB DEFAULT '{}',
  consent_status TEXT DEFAULT 'pending' CHECK (consent_status IN ('pending', 'in_progress', 'completed', 'declined', 'expired')),
  conversation_context JSONB DEFAULT '{}',
  current_step TEXT DEFAULT 'introduction',
  completed_steps TEXT[] DEFAULT ARRAY[]::TEXT[],
  real_time_sync_enabled BOOLEAN DEFAULT true,
  form_sync_data JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (now() + INTERVAL '24 hours')
);

-- Business phone numbers for WhatsApp integration
CREATE TABLE IF NOT EXISTS whatsapp_business_numbers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone_number TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  twilio_sid TEXT,
  is_active BOOLEAN DEFAULT true,
  is_default BOOLEAN DEFAULT false,
  capabilities JSONB DEFAULT '{"sms": true, "voice": true, "whatsapp": true}',
  region TEXT DEFAULT 'US',
  department TEXT, -- e.g., 'enrollment', 'support', 'clinical'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Real-time enrollment data sync
CREATE TABLE IF NOT EXISTS enrollment_real_time_sync (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT NOT NULL,
  whatsapp_session_id UUID REFERENCES whatsapp_enrollment_sessions(id),
  field_name TEXT NOT NULL,
  field_value JSONB,
  sync_direction TEXT CHECK (sync_direction IN ('whatsapp_to_form', 'form_to_whatsapp', 'bidirectional')),
  sync_timestamp TIMESTAMP WITH TIME ZONE DEFAULT now(),
  sync_status TEXT DEFAULT 'pending' CHECK (sync_status IN ('pending', 'synced', 'failed', 'conflict')),
  conflict_resolution TEXT CHECK (conflict_resolution IN ('whatsapp_wins', 'form_wins', 'manual_review', 'merge'))
);

-- Agent conversation flows with personality
CREATE TABLE IF NOT EXISTS whatsapp_conversation_flows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_type TEXT NOT NULL,
  personality_type TEXT NOT NULL,
  flow_stage TEXT NOT NULL,
  prompt_template TEXT NOT NULL,
  response_options JSONB DEFAULT '[]',
  validation_rules JSONB DEFAULT '{}',
  next_stage_logic JSONB DEFAULT '{}',
  humor_elements JSONB DEFAULT '{}', -- jokes, fun facts, encouraging messages
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Insert default business phone number
INSERT INTO whatsapp_business_numbers (phone_number, display_name, is_default, department) 
VALUES ('+1-555-HEALTH', 'Patient Enrollment Center', true, 'enrollment')
ON CONFLICT (phone_number) DO NOTHING;

-- Insert conversation flow templates with humor and personality
INSERT INTO whatsapp_conversation_flows (agent_type, personality_type, flow_stage, prompt_template, humor_elements) VALUES 
('conversational', 'humorous_warm', 'introduction', 
 'Hey {firstName}! 👋 I''m your friendly AI enrollment assistant. Think of me as your healthcare buddy who never needs coffee breaks! ☕ Ready to make enrollment as easy as ordering pizza? 🍕', 
 '{"greetings": ["Hope you''re having a fantastic day!", "Ready to tackle some paperwork? Don''t worry, I make it fun! 😄"], "encouragement": ["You''re doing great!", "Almost there, superstar!"]}'),

('conversational', 'humorous_warm', 'insurance_collection',
 'Now for the thrilling world of insurance! 🎭 Don''t worry, I speak "insurance" fluently. What''s your insurance provider? (And no, "I hope I have insurance" isn''t a provider name 😉)',
 '{"jokes": ["Insurance forms are like puzzles, but I''m really good at puzzles!", "Fun fact: I process insurance faster than you can say ''deductible''!"]}'),

('mcp_stepwise', 'medical_empathetic', 'clinical_history',
 'I understand discussing medical history can feel personal. I''m here to help ensure you get the best care possible. Everything you share is secure and confidential. Let''s take this step by step, at your comfort level.',
 '{"supportive": ["Take your time", "You''re in safe hands", "Every detail helps us care for you better"]}'),

('structured', 'friendly_professional', 'contact_verification',
 'Let me verify your contact information to ensure we can reach you. Is {cellPhone} the best number to contact you? And would you prefer text messages or phone calls for updates?',
 '{"efficiency": ["This will just take a moment", "Making sure we can stay connected!"]}'),

('hybrid', 'casual_supportive', 'choice_offering',
 'Great news! You have options! 🎉 Would you like to: 1️⃣ Continue chatting here on WhatsApp 2️⃣ Switch to a quick phone call 3️⃣ Mix of both (chat + call when needed) What sounds good to you?',
 '{"choices": ["Flexibility is key!", "You''re the boss!", "Whatever works best for you!"]}');

-- Enable RLS
ALTER TABLE whatsapp_enrollment_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE whatsapp_business_numbers ENABLE ROW LEVEL SECURITY;
ALTER TABLE enrollment_real_time_sync ENABLE ROW LEVEL SECURITY;
ALTER TABLE whatsapp_conversation_flows ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can manage their enrollment sessions" ON whatsapp_enrollment_sessions
  FOR ALL USING (auth.uid()::text = session_id OR is_admin_user_safe(auth.uid()));

CREATE POLICY "Authenticated users can view business numbers" ON whatsapp_business_numbers
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admins can manage business numbers" ON whatsapp_business_numbers
  FOR ALL USING (is_admin_user_safe(auth.uid()));

CREATE POLICY "Users can view their sync data" ON enrollment_real_time_sync
  FOR ALL USING (auth.uid()::text = session_id OR is_admin_user_safe(auth.uid()));

CREATE POLICY "Authenticated users can view conversation flows" ON whatsapp_conversation_flows
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- Triggers for updated_at
CREATE OR REPLACE TRIGGER update_whatsapp_enrollment_sessions_updated_at
  BEFORE UPDATE ON whatsapp_enrollment_sessions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE OR REPLACE TRIGGER update_whatsapp_business_numbers_updated_at
  BEFORE UPDATE ON whatsapp_business_numbers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();