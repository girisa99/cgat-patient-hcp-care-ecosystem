-- Create phone numbers management table
CREATE TABLE IF NOT EXISTS phone_numbers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  phone_number VARCHAR(20) NOT NULL UNIQUE,
  provider_type TEXT NOT NULL CHECK (provider_type IN ('twilio', 'vonage', 'genesys', 'five9', 'google_cx', 'test_number')),
  provider_phone_sid TEXT, -- Provider's unique ID for the phone number
  assigned_to_agent_id UUID REFERENCES agents(id),
  assigned_to_brand TEXT,
  is_active BOOLEAN DEFAULT true,
  capabilities JSONB DEFAULT '["voice", "sms"]'::jsonb,
  configuration JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

-- Create call sessions table for tracking calls
CREATE TABLE IF NOT EXISTS call_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id TEXT NOT NULL UNIQUE,
  phone_number_id UUID REFERENCES phone_numbers(id),
  agent_id UUID REFERENCES agents(id),
  caller_number VARCHAR(20),
  callee_number VARCHAR(20),
  call_direction TEXT NOT NULL CHECK (call_direction IN ('inbound', 'outbound')),
  call_status TEXT DEFAULT 'initiated' CHECK (call_status IN ('initiated', 'ringing', 'answered', 'ended', 'failed')),
  start_time TIMESTAMP WITH TIME ZONE DEFAULT now(),
  end_time TIMESTAMP WITH TIME ZONE,
  duration_seconds INTEGER,
  call_recording_url TEXT,
  provider_call_sid TEXT,
  voice_provider_id UUID REFERENCES voice_providers(id),
  conversation_engine_id UUID,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create call transcriptions table
CREATE TABLE IF NOT EXISTS call_transcriptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  call_session_id UUID REFERENCES call_sessions(id) NOT NULL,
  speaker_type TEXT NOT NULL CHECK (speaker_type IN ('caller', 'agent', 'system')),
  transcript_text TEXT NOT NULL,
  confidence_score DECIMAL(3,2),
  timestamp_offset INTEGER, -- Offset from call start in milliseconds
  language_code VARCHAR(10) DEFAULT 'en-US',
  sentiment_analysis JSONB,
  keywords JSONB,
  provider_used TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create softphone sessions table for UI state management
CREATE TABLE IF NOT EXISTS softphone_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  agent_id UUID REFERENCES agents(id),
  phone_number_id UUID REFERENCES phone_numbers(id),
  status TEXT DEFAULT 'offline' CHECK (status IN ('offline', 'available', 'busy', 'in_call')),
  current_call_session_id UUID REFERENCES call_sessions(id),
  websocket_connection_id TEXT,
  voice_settings JSONB DEFAULT '{}'::jsonb,
  ui_preferences JSONB DEFAULT '{}'::jsonb,
  last_activity TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create conversation analysis table
CREATE TABLE IF NOT EXISTS conversation_analysis (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  call_session_id UUID REFERENCES call_sessions(id) NOT NULL,
  analysis_type TEXT NOT NULL CHECK (analysis_type IN ('sentiment', 'intent', 'keywords', 'summary', 'compliance')),
  analysis_result JSONB NOT NULL,
  confidence_score DECIMAL(3,2),
  provider_used TEXT,
  processing_time_ms INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create multi-provider test configurations
CREATE TABLE IF NOT EXISTS provider_test_configs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  config_name TEXT NOT NULL,
  provider_type TEXT NOT NULL,
  test_scenario TEXT NOT NULL,
  test_data JSONB NOT NULL,
  expected_outcomes JSONB,
  phone_number_id UUID REFERENCES phone_numbers(id),
  agent_id UUID REFERENCES agents(id),
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_phone_numbers_provider ON phone_numbers(provider_type);
CREATE INDEX IF NOT EXISTS idx_phone_numbers_agent ON phone_numbers(assigned_to_agent_id);
CREATE INDEX IF NOT EXISTS idx_call_sessions_phone_number ON call_sessions(phone_number_id);
CREATE INDEX IF NOT EXISTS idx_call_sessions_status ON call_sessions(call_status);
CREATE INDEX IF NOT EXISTS idx_call_sessions_time ON call_sessions(start_time);
CREATE INDEX IF NOT EXISTS idx_call_transcriptions_session ON call_transcriptions(call_session_id);
CREATE INDEX IF NOT EXISTS idx_softphone_sessions_user ON softphone_sessions(user_id);

-- Enable Row Level Security
ALTER TABLE phone_numbers ENABLE ROW LEVEL SECURITY;
ALTER TABLE call_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE call_transcriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE softphone_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE provider_test_configs ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for phone_numbers
CREATE POLICY "Users can manage their own phone numbers" ON phone_numbers
FOR ALL USING (
  created_by = auth.uid() OR 
  EXISTS(SELECT 1 FROM agents WHERE id = assigned_to_agent_id AND created_by = auth.uid())
);

-- Create RLS policies for call_sessions
CREATE POLICY "Users can view call sessions for their agents/phone numbers" ON call_sessions
FOR SELECT USING (
  EXISTS(SELECT 1 FROM agents WHERE id = agent_id AND created_by = auth.uid()) OR
  EXISTS(SELECT 1 FROM phone_numbers WHERE id = phone_number_id AND created_by = auth.uid())
);

CREATE POLICY "System can manage call sessions" ON call_sessions
FOR ALL USING (true);

-- Create RLS policies for call_transcriptions
CREATE POLICY "Users can view transcriptions for their call sessions" ON call_transcriptions
FOR SELECT USING (
  EXISTS(
    SELECT 1 FROM call_sessions cs 
    JOIN agents a ON cs.agent_id = a.id 
    WHERE cs.id = call_session_id AND a.created_by = auth.uid()
  )
);

CREATE POLICY "System can manage transcriptions" ON call_transcriptions
FOR ALL USING (true);

-- Create RLS policies for softphone_sessions
CREATE POLICY "Users can manage their own softphone sessions" ON softphone_sessions
FOR ALL USING (user_id = auth.uid());

-- Create RLS policies for conversation_analysis
CREATE POLICY "Users can view analysis for their call sessions" ON conversation_analysis
FOR SELECT USING (
  EXISTS(
    SELECT 1 FROM call_sessions cs 
    JOIN agents a ON cs.agent_id = a.id 
    WHERE cs.id = call_session_id AND a.created_by = auth.uid()
  )
);

-- Create RLS policies for provider_test_configs
CREATE POLICY "Users can manage their own test configs" ON provider_test_configs
FOR ALL USING (created_by = auth.uid());

-- Create triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_phone_numbers_updated_at
  BEFORE UPDATE ON phone_numbers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_call_sessions_updated_at
  BEFORE UPDATE ON call_sessions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_softphone_sessions_updated_at
  BEFORE UPDATE ON softphone_sessions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_provider_test_configs_updated_at
  BEFORE UPDATE ON provider_test_configs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert some test phone numbers for different providers
INSERT INTO phone_numbers (phone_number, provider_type, assigned_to_brand, configuration) VALUES
('+1-555-TEST-001', 'test_number', 'Healthcare Demo', '{"test_mode": true, "auto_answer": true}'),
('+1-555-TEST-002', 'test_number', 'AI Assistant Demo', '{"test_mode": true, "auto_answer": false}'),
('+1-555-TWILIO-1', 'twilio', 'Twilio Test', '{"webhook_url": "/api/twilio/voice"}'),
('+1-555-ELEVEN-1', 'test_number', 'ElevenLabs Demo', '{"provider": "elevenlabs", "voice_id": "alloy"}'),
('+1-555-GOOGLE-1', 'google_cx', 'Google CX Demo', '{"project_id": "demo-project", "location": "global"}')