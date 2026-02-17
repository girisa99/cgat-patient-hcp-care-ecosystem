-- =====================================================
-- GENIE STUDIO SUPPORT & COMMUNITY INFRASTRUCTURE
-- Ask Genie First + Internal Teams + Community Support
-- =====================================================

-- Support ticket priority enum
CREATE TYPE genie_ticket_priority AS ENUM ('low', 'medium', 'high', 'urgent', 'critical');

-- Ticket status enum
CREATE TYPE genie_ticket_status AS ENUM ('open', 'pending_ai', 'pending_user', 'in_progress', 'escalated', 'resolved', 'closed');

-- Ticket category enum
CREATE TYPE genie_ticket_category AS ENUM (
  'account', 'billing', 'technical', 'feature_request', 
  'bug_report', 'content_generation', 'integration', 'other'
);

-- =====================================================
-- 1. ASK GENIE SUPPORT SESSIONS
-- Primary interface - AI-first support via Ask Genie
-- =====================================================
CREATE TABLE genie_support_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  session_token TEXT UNIQUE, -- For anonymous sessions
  
  -- Session context
  product_context TEXT DEFAULT 'genie_studio', -- deck, spark, mind, etc.
  user_language TEXT DEFAULT 'en',
  user_region TEXT,
  
  -- AI handling
  ai_handled_count INTEGER DEFAULT 0,
  ai_resolution_rate DECIMAL(5,2) DEFAULT 0,
  escalated_to_ticket BOOLEAN DEFAULT false,
  
  -- Timestamps
  started_at TIMESTAMPTZ DEFAULT now(),
  last_activity_at TIMESTAMPTZ DEFAULT now(),
  ended_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Ask Genie support messages (AI conversations before escalation)
CREATE TABLE genie_support_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES genie_support_sessions(id) ON DELETE CASCADE NOT NULL,
  
  -- Message content
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  content_language TEXT DEFAULT 'en', -- Detected or specified language
  
  -- AI response metadata
  ai_model_used TEXT,
  ai_confidence DECIMAL(5,2),
  knowledge_sources JSONB DEFAULT '[]', -- Referenced KB articles
  suggested_actions JSONB DEFAULT '[]',
  
  -- Resolution tracking
  was_helpful BOOLEAN,
  user_feedback TEXT,
  
  created_at TIMESTAMPTZ DEFAULT now()
);

-- =====================================================
-- 2. INTERNAL TEAM TICKETING (English-first)
-- Escalated from Ask Genie or created by internal
-- =====================================================
CREATE SEQUENCE genie_ticket_seq START 1;

CREATE TABLE genie_support_tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_number TEXT UNIQUE DEFAULT 'TKT-' || LPAD(nextval('genie_ticket_seq')::text, 8, '0'),
  
  -- User info
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  genie_studio_user_id UUID REFERENCES genie_studio_users(id) ON DELETE SET NULL,
  user_email TEXT NOT NULL,
  user_name TEXT,
  user_tier TEXT DEFAULT 'free', -- Subscription tier for priority
  
  -- Ticket details (English only for internal processing)
  subject TEXT NOT NULL,
  description TEXT NOT NULL,
  category genie_ticket_category DEFAULT 'other',
  priority genie_ticket_priority DEFAULT 'medium',
  status genie_ticket_status DEFAULT 'open',
  
  -- AI pre-processing
  ai_suggested_category genie_ticket_category,
  ai_suggested_priority genie_ticket_priority,
  ai_initial_response TEXT, -- Draft response for agent
  ai_knowledge_matches JSONB DEFAULT '[]',
  
  -- Escalation from Ask Genie
  escalated_from_session UUID REFERENCES genie_support_sessions(id),
  escalation_reason TEXT,
  
  -- Assignment
  assigned_team TEXT, -- 'tier1', 'tier2', 'billing', 'technical', etc.
  assigned_agent UUID REFERENCES genie_studio_users(id),
  
  -- SLA tracking
  sla_response_deadline TIMESTAMPTZ,
  sla_resolution_deadline TIMESTAMPTZ,
  first_response_at TIMESTAMPTZ,
  resolved_at TIMESTAMPTZ,
  
  -- Metadata
  tags TEXT[] DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Ticket messages (internal team responses - English)
CREATE TABLE genie_ticket_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID REFERENCES genie_support_tickets(id) ON DELETE CASCADE NOT NULL,
  
  -- Response info
  responder_id UUID REFERENCES genie_studio_users(id),
  responder_type TEXT NOT NULL CHECK (responder_type IN ('user', 'agent', 'system', 'ai')),
  
  -- Content (English for internal)
  content TEXT NOT NULL,
  is_internal_note BOOLEAN DEFAULT false, -- Agent-only notes
  
  -- AI assistance
  ai_drafted BOOLEAN DEFAULT false,
  ai_translated_from TEXT, -- If user wrote in another language
  
  created_at TIMESTAMPTZ DEFAULT now()
);

-- =====================================================
-- 3. COMMUNITY SUPPORT
-- User-to-user help, forums, discussions
-- =====================================================
CREATE TABLE genie_community_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  icon TEXT,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE genie_community_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID REFERENCES genie_community_categories(id) ON DELETE SET NULL,
  author_id UUID REFERENCES genie_studio_users(id) ON DELETE SET NULL,
  
  -- Post content
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  content_language TEXT DEFAULT 'en',
  
  -- Post type
  post_type TEXT DEFAULT 'discussion' CHECK (post_type IN ('discussion', 'question', 'tip', 'showcase', 'announcement')),
  
  -- Status
  is_pinned BOOLEAN DEFAULT false,
  is_locked BOOLEAN DEFAULT false,
  is_solved BOOLEAN DEFAULT false, -- For questions
  accepted_answer_id UUID, -- References genie_community_replies
  
  -- Engagement
  view_count INTEGER DEFAULT 0,
  reply_count INTEGER DEFAULT 0,
  upvote_count INTEGER DEFAULT 0,
  
  -- Moderation
  is_approved BOOLEAN DEFAULT true,
  moderated_by UUID REFERENCES genie_studio_users(id),
  moderation_notes TEXT,
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE genie_community_replies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES genie_community_posts(id) ON DELETE CASCADE NOT NULL,
  parent_reply_id UUID REFERENCES genie_community_replies(id) ON DELETE CASCADE, -- For nested replies
  author_id UUID REFERENCES genie_studio_users(id) ON DELETE SET NULL,
  
  -- Content
  content TEXT NOT NULL,
  content_language TEXT DEFAULT 'en',
  
  -- Engagement
  upvote_count INTEGER DEFAULT 0,
  is_accepted_answer BOOLEAN DEFAULT false,
  
  -- Moderation
  is_approved BOOLEAN DEFAULT true,
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Community upvotes (for posts and replies)
CREATE TABLE genie_community_upvotes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES genie_studio_users(id) ON DELETE CASCADE NOT NULL,
  post_id UUID REFERENCES genie_community_posts(id) ON DELETE CASCADE,
  reply_id UUID REFERENCES genie_community_replies(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  
  -- One upvote per user per item
  CONSTRAINT unique_post_upvote UNIQUE (user_id, post_id),
  CONSTRAINT unique_reply_upvote UNIQUE (user_id, reply_id),
  CONSTRAINT must_have_target CHECK (post_id IS NOT NULL OR reply_id IS NOT NULL)
);

-- =====================================================
-- 4. SUPPORT KNOWLEDGE BASE
-- Powers AI responses and self-service
-- =====================================================
CREATE TABLE genie_support_knowledge (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Article info
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  content TEXT NOT NULL,
  summary TEXT, -- For quick AI reference
  
  -- Categorization
  category TEXT NOT NULL,
  subcategory TEXT,
  tags TEXT[] DEFAULT '{}',
  
  -- Targeting
  applicable_products TEXT[] DEFAULT '{"all"}', -- deck, spark, mind, etc.
  applicable_tiers TEXT[] DEFAULT '{"all"}', -- free, starter, creator, etc.
  
  -- Multilingual (primary in English, AI translates on-demand)
  primary_language TEXT DEFAULT 'en',
  translations JSONB DEFAULT '{}', -- {"es": {...}, "ja": {...}}
  
  -- AI training
  ai_embedding_updated_at TIMESTAMPTZ,
  search_keywords TEXT[] DEFAULT '{}',
  
  -- Publishing
  is_published BOOLEAN DEFAULT false,
  published_at TIMESTAMPTZ,
  author_id UUID REFERENCES genie_studio_users(id),
  
  -- Metrics
  view_count INTEGER DEFAULT 0,
  helpful_count INTEGER DEFAULT 0,
  not_helpful_count INTEGER DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- =====================================================
-- 5. INTERNAL TEAM STRUCTURE
-- Support agents and team assignments
-- =====================================================
CREATE TABLE genie_support_teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  
  -- Capabilities
  handles_categories genie_ticket_category[] DEFAULT '{}',
  handles_tiers TEXT[] DEFAULT '{"all"}',
  escalation_target_id UUID REFERENCES genie_support_teams(id), -- Next level team
  
  -- Availability
  is_active BOOLEAN DEFAULT true,
  timezone TEXT DEFAULT 'UTC',
  working_hours JSONB DEFAULT '{"start": "09:00", "end": "18:00", "days": [1,2,3,4,5]}',
  
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE genie_support_agents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES genie_studio_users(id) ON DELETE CASCADE NOT NULL,
  team_id UUID REFERENCES genie_support_teams(id) ON DELETE SET NULL,
  
  -- Agent info
  display_name TEXT NOT NULL,
  avatar_url TEXT,
  
  -- Capabilities
  specializations TEXT[] DEFAULT '{}',
  languages TEXT[] DEFAULT '{"en"}',
  max_concurrent_tickets INTEGER DEFAULT 10,
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  is_available BOOLEAN DEFAULT true,
  current_ticket_count INTEGER DEFAULT 0,
  
  -- Performance
  total_tickets_handled INTEGER DEFAULT 0,
  avg_response_time_minutes INTEGER,
  avg_resolution_time_hours INTEGER,
  satisfaction_rating DECIMAL(3,2),
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- =====================================================
-- 6. SLA CONFIGURATION
-- Response/resolution targets by tier
-- =====================================================
CREATE TABLE genie_sla_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tier TEXT UNIQUE NOT NULL, -- free, starter, creator, pro, business, enterprise
  
  -- Response time (hours)
  response_time_low INTEGER DEFAULT 48,
  response_time_medium INTEGER DEFAULT 24,
  response_time_high INTEGER DEFAULT 8,
  response_time_urgent INTEGER DEFAULT 4,
  response_time_critical INTEGER DEFAULT 1,
  
  -- Resolution time (hours)
  resolution_time_low INTEGER DEFAULT 168, -- 7 days
  resolution_time_medium INTEGER DEFAULT 72,
  resolution_time_high INTEGER DEFAULT 48,
  resolution_time_urgent INTEGER DEFAULT 24,
  resolution_time_critical INTEGER DEFAULT 8,
  
  -- Features
  priority_queue BOOLEAN DEFAULT false,
  dedicated_agent BOOLEAN DEFAULT false,
  phone_support BOOLEAN DEFAULT false,
  
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Insert default SLA configs
INSERT INTO genie_sla_config (tier, response_time_low, response_time_medium, response_time_high, response_time_urgent, response_time_critical, priority_queue, dedicated_agent, phone_support) VALUES
  ('free', 72, 48, 24, 12, 4, false, false, false),
  ('starter', 48, 24, 12, 8, 2, false, false, false),
  ('creator', 24, 12, 8, 4, 2, true, false, false),
  ('pro', 12, 8, 4, 2, 1, true, false, false),
  ('business', 8, 4, 2, 1, 0.5, true, true, false),
  ('enterprise', 4, 2, 1, 0.5, 0.25, true, true, true);

-- =====================================================
-- 7. HELPER FUNCTIONS
-- =====================================================

-- Calculate SLA deadlines when ticket is created
CREATE OR REPLACE FUNCTION calculate_ticket_sla()
RETURNS TRIGGER AS $$
DECLARE
  sla RECORD;
  response_hours INTEGER;
  resolution_hours INTEGER;
BEGIN
  -- Get SLA config for user tier
  SELECT * INTO sla FROM genie_sla_config WHERE tier = COALESCE(NEW.user_tier, 'free');
  
  -- Default to free tier if not found
  IF sla IS NULL THEN
    SELECT * INTO sla FROM genie_sla_config WHERE tier = 'free';
  END IF;
  
  -- Calculate response time based on priority
  response_hours := CASE NEW.priority
    WHEN 'low' THEN sla.response_time_low
    WHEN 'medium' THEN sla.response_time_medium
    WHEN 'high' THEN sla.response_time_high
    WHEN 'urgent' THEN sla.response_time_urgent
    WHEN 'critical' THEN sla.response_time_critical
    ELSE sla.response_time_medium
  END;
  
  -- Calculate resolution time based on priority
  resolution_hours := CASE NEW.priority
    WHEN 'low' THEN sla.resolution_time_low
    WHEN 'medium' THEN sla.resolution_time_medium
    WHEN 'high' THEN sla.resolution_time_high
    WHEN 'urgent' THEN sla.resolution_time_urgent
    WHEN 'critical' THEN sla.resolution_time_critical
    ELSE sla.resolution_time_medium
  END;
  
  NEW.sla_response_deadline := NEW.created_at + (response_hours || ' hours')::interval;
  NEW.sla_resolution_deadline := NEW.created_at + (resolution_hours || ' hours')::interval;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER set_ticket_sla
  BEFORE INSERT ON genie_support_tickets
  FOR EACH ROW
  EXECUTE FUNCTION calculate_ticket_sla();

-- Auto-update timestamps
CREATE TRIGGER update_genie_support_tickets_updated_at
  BEFORE UPDATE ON genie_support_tickets
  FOR EACH ROW
  EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER update_genie_community_posts_updated_at
  BEFORE UPDATE ON genie_community_posts
  FOR EACH ROW
  EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER update_genie_community_replies_updated_at
  BEFORE UPDATE ON genie_community_replies
  FOR EACH ROW
  EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER update_genie_support_knowledge_updated_at
  BEFORE UPDATE ON genie_support_knowledge
  FOR EACH ROW
  EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER update_genie_support_agents_updated_at
  BEFORE UPDATE ON genie_support_agents
  FOR EACH ROW
  EXECUTE FUNCTION handle_updated_at();

-- =====================================================
-- 8. ROW LEVEL SECURITY
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE genie_support_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE genie_support_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE genie_support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE genie_ticket_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE genie_community_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE genie_community_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE genie_community_replies ENABLE ROW LEVEL SECURITY;
ALTER TABLE genie_community_upvotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE genie_support_knowledge ENABLE ROW LEVEL SECURITY;
ALTER TABLE genie_support_teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE genie_support_agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE genie_sla_config ENABLE ROW LEVEL SECURITY;

-- Helper function: Check if user is internal Genie team
CREATE OR REPLACE FUNCTION is_genie_support_agent(check_user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM genie_support_agents sa
    JOIN genie_studio_users gsu ON sa.user_id = gsu.id
    WHERE gsu.auth_user_id = check_user_id
    AND sa.is_active = true
  );
$$;

-- Support Sessions: Users see own, agents see all
CREATE POLICY "Users view own support sessions" ON genie_support_sessions
  FOR SELECT USING (user_id = auth.uid() OR is_genie_support_agent());

CREATE POLICY "Users create own support sessions" ON genie_support_sessions
  FOR INSERT WITH CHECK (user_id = auth.uid() OR user_id IS NULL);

CREATE POLICY "Users update own support sessions" ON genie_support_sessions
  FOR UPDATE USING (user_id = auth.uid() OR is_genie_support_agent());

-- Support Messages: Users see own session messages
CREATE POLICY "Users view own session messages" ON genie_support_messages
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM genie_support_sessions WHERE id = session_id AND (user_id = auth.uid() OR is_genie_support_agent()))
  );

CREATE POLICY "Users create messages in own sessions" ON genie_support_messages
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM genie_support_sessions WHERE id = session_id AND (user_id = auth.uid() OR is_genie_support_agent()))
  );

-- Tickets: Users see own, agents see all
CREATE POLICY "Users view own tickets" ON genie_support_tickets
  FOR SELECT USING (user_id = auth.uid() OR is_genie_support_agent());

CREATE POLICY "Users create own tickets" ON genie_support_tickets
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Agents update tickets" ON genie_support_tickets
  FOR UPDATE USING (is_genie_support_agent());

-- Ticket Responses: Users see non-internal, agents see all
CREATE POLICY "Users view public ticket responses" ON genie_ticket_responses
  FOR SELECT USING (
    (is_internal_note = false AND EXISTS (SELECT 1 FROM genie_support_tickets WHERE id = ticket_id AND user_id = auth.uid()))
    OR is_genie_support_agent()
  );

CREATE POLICY "Users create responses on own tickets" ON genie_ticket_responses
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM genie_support_tickets WHERE id = ticket_id AND user_id = auth.uid())
    OR is_genie_support_agent()
  );

-- Community: Public read, auth write
CREATE POLICY "Anyone can view community categories" ON genie_community_categories
  FOR SELECT USING (is_active = true);

CREATE POLICY "Anyone can view approved posts" ON genie_community_posts
  FOR SELECT USING (is_approved = true);

CREATE POLICY "Auth users can create posts" ON genie_community_posts
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update own posts" ON genie_community_posts
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM genie_studio_users WHERE id = author_id AND auth_user_id = auth.uid())
    OR is_genie_support_agent()
  );

CREATE POLICY "Anyone can view approved replies" ON genie_community_replies
  FOR SELECT USING (is_approved = true);

CREATE POLICY "Auth users can create replies" ON genie_community_replies
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update own replies" ON genie_community_replies
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM genie_studio_users WHERE id = author_id AND auth_user_id = auth.uid())
  );

CREATE POLICY "Users manage own upvotes" ON genie_community_upvotes
  FOR ALL USING (
    EXISTS (SELECT 1 FROM genie_studio_users WHERE id = user_id AND auth_user_id = auth.uid())
  );

-- Knowledge Base: Public read for published
CREATE POLICY "Anyone can view published knowledge" ON genie_support_knowledge
  FOR SELECT USING (is_published = true);

CREATE POLICY "Agents manage knowledge" ON genie_support_knowledge
  FOR ALL USING (is_genie_support_agent());

-- Teams and Agents: Internal only
CREATE POLICY "Agents view teams" ON genie_support_teams
  FOR SELECT USING (is_genie_support_agent());

CREATE POLICY "Agents view agents" ON genie_support_agents
  FOR SELECT USING (is_genie_support_agent());

-- SLA Config: Public read
CREATE POLICY "Anyone can view SLA config" ON genie_sla_config
  FOR SELECT USING (true);

-- =====================================================
-- 9. INDEXES FOR PERFORMANCE
-- =====================================================
CREATE INDEX idx_genie_support_sessions_user ON genie_support_sessions(user_id);
CREATE INDEX idx_genie_support_sessions_last_activity ON genie_support_sessions(last_activity_at);
CREATE INDEX idx_genie_support_messages_session ON genie_support_messages(session_id);
CREATE INDEX idx_genie_support_tickets_user ON genie_support_tickets(user_id);
CREATE INDEX idx_genie_support_tickets_status ON genie_support_tickets(status);
CREATE INDEX idx_genie_support_tickets_assigned_agent ON genie_support_tickets(assigned_agent);
CREATE INDEX idx_genie_support_tickets_sla_response ON genie_support_tickets(sla_response_deadline);
CREATE INDEX idx_genie_ticket_responses_ticket ON genie_ticket_responses(ticket_id);
CREATE INDEX idx_genie_community_posts_category ON genie_community_posts(category_id);
CREATE INDEX idx_genie_community_posts_author ON genie_community_posts(author_id);
CREATE INDEX idx_genie_community_replies_post ON genie_community_replies(post_id);
CREATE INDEX idx_genie_support_knowledge_category ON genie_support_knowledge(category);
CREATE INDEX idx_genie_support_knowledge_published ON genie_support_knowledge(is_published);
CREATE INDEX idx_genie_support_agents_team ON genie_support_agents(team_id);