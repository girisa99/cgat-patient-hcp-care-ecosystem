-- =====================================================
-- ENHANCED SUPPORT INFRASTRUCTURE: Categories, Templates, Escalation
-- Dynamic categories, AI-enhanced context capture, full template library
-- =====================================================

-- ======================
-- 1. DYNAMIC CATEGORY SYSTEM
-- ======================

-- Support categories (admin-configurable)
CREATE TABLE public.genie_support_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  display_name TEXT NOT NULL,
  description TEXT,
  icon TEXT DEFAULT 'help-circle',
  color TEXT DEFAULT '#6366F1',
  parent_category_id UUID REFERENCES public.genie_support_categories(id) ON DELETE SET NULL,
  category_type TEXT NOT NULL DEFAULT 'general' CHECK (category_type IN ('product', 'issue', 'general', 'technical', 'billing', 'account')),
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  auto_assign_team_id UUID,
  default_priority genie_ticket_priority DEFAULT 'medium',
  sla_override_hours INTEGER,
  keywords TEXT[] DEFAULT ARRAY[]::TEXT[],
  ai_routing_hints JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Issue types per category
CREATE TABLE public.genie_issue_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID NOT NULL REFERENCES public.genie_support_categories(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  display_name TEXT NOT NULL,
  description TEXT,
  severity_default genie_ticket_priority DEFAULT 'medium',
  requires_reproduction_steps BOOLEAN DEFAULT false,
  requires_screenshot BOOLEAN DEFAULT false,
  requires_project_id BOOLEAN DEFAULT false,
  auto_response_template_id UUID,
  ai_classification_keywords TEXT[] DEFAULT ARRAY[]::TEXT[],
  expected_resolution_hours INTEGER,
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ======================
-- 2. AI-ENHANCED CONTEXT CAPTURE
-- ======================

-- Ticket context (auto-captured from Ask Genie session)
CREATE TABLE public.genie_ticket_context (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID NOT NULL REFERENCES public.genie_support_tickets(id) ON DELETE CASCADE,
  
  -- Device/Browser context
  browser_info JSONB DEFAULT '{}',
  device_info JSONB DEFAULT '{}',
  os_info JSONB DEFAULT '{}',
  screen_resolution TEXT,
  user_agent TEXT,
  ip_address TEXT,
  
  -- Session context
  session_id TEXT,
  genie_session_id UUID REFERENCES public.genie_support_sessions(id),
  page_url TEXT,
  referrer_url TEXT,
  
  -- Product context
  affected_product TEXT,
  affected_project_id UUID,
  affected_content_ids JSONB DEFAULT '[]',
  
  -- User activity context
  recent_actions JSONB DEFAULT '[]',
  recent_errors JSONB DEFAULT '[]',
  console_logs TEXT,
  network_errors JSONB DEFAULT '[]',
  
  -- AI analysis
  ai_context_summary TEXT,
  ai_suggested_category_id UUID REFERENCES public.genie_support_categories(id),
  ai_suggested_issue_type_id UUID REFERENCES public.genie_issue_types(id),
  ai_sentiment_score DECIMAL(3,2),
  ai_urgency_score DECIMAL(3,2),
  ai_context_confidence DECIMAL(3,2),
  
  -- Screenshots/Attachments
  screenshots JSONB DEFAULT '[]',
  attachments JSONB DEFAULT '[]',
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Reproduction steps (user-provided)
CREATE TABLE public.genie_ticket_reproduction_steps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID NOT NULL REFERENCES public.genie_support_tickets(id) ON DELETE CASCADE,
  step_number INTEGER NOT NULL,
  description TEXT NOT NULL,
  expected_result TEXT,
  actual_result TEXT,
  screenshot_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ======================
-- 3. FULL RESPONSE TEMPLATE LIBRARY
-- ======================

-- Template categories
CREATE TABLE public.genie_template_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  display_name TEXT NOT NULL,
  description TEXT,
  icon TEXT DEFAULT 'folder',
  color TEXT DEFAULT '#6366F1',
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Response templates with variables
CREATE TABLE public.genie_response_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_category_id UUID REFERENCES public.genie_template_categories(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  subject_template TEXT,
  content_template TEXT NOT NULL,
  content_html TEXT,
  
  -- Template type
  template_type TEXT NOT NULL DEFAULT 'manual' CHECK (template_type IN ('manual', 'auto_response', 'ai_draft', 'escalation', 'resolution', 'follow_up')),
  
  -- Applicable contexts (using TEXT[] to avoid enum array issues)
  applicable_categories UUID[] DEFAULT ARRAY[]::UUID[],
  applicable_issue_types UUID[] DEFAULT ARRAY[]::UUID[],
  applicable_tiers TEXT[] DEFAULT ARRAY[]::TEXT[],
  
  -- Template variables (for interpolation)
  available_variables JSONB DEFAULT '["{{user_name}}", "{{ticket_id}}", "{{agent_name}}", "{{company_name}}"]',
  
  -- Language support
  language_code TEXT NOT NULL DEFAULT 'en',
  translations JSONB DEFAULT '{}',
  
  -- Usage stats
  usage_count INTEGER DEFAULT 0,
  last_used_at TIMESTAMPTZ,
  average_rating DECIMAL(3,2),
  
  -- Metadata
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_by UUID,
  updated_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Template usage history
CREATE TABLE public.genie_template_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID NOT NULL REFERENCES public.genie_response_templates(id) ON DELETE CASCADE,
  ticket_id UUID REFERENCES public.genie_support_tickets(id) ON DELETE SET NULL,
  agent_id UUID NOT NULL,
  used_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  was_modified BOOLEAN DEFAULT false,
  modification_percentage DECIMAL(5,2),
  customer_rating INTEGER CHECK (customer_rating BETWEEN 1 AND 5)
);

-- ======================
-- 4. ENHANCED ESCALATION SYSTEM
-- ======================

-- Escalation levels
CREATE TYPE genie_escalation_level AS ENUM ('l1_ai', 'l2_support', 'l3_specialist', 'l4_engineering', 'l5_management');

-- Escalation rules
CREATE TABLE public.genie_escalation_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  
  -- Trigger conditions
  trigger_type TEXT NOT NULL CHECK (trigger_type IN ('time_based', 'priority_based', 'tier_based', 'manual', 'ai_detected', 'sla_breach')),
  trigger_conditions JSONB NOT NULL DEFAULT '{}',
  
  -- From/To levels
  from_level genie_escalation_level,
  to_level genie_escalation_level NOT NULL,
  
  -- Routing
  route_to_team_id UUID REFERENCES public.genie_support_teams(id),
  route_to_agent_id UUID REFERENCES public.genie_support_agents(id),
  
  -- Actions
  notify_customer BOOLEAN DEFAULT false,
  notify_manager BOOLEAN DEFAULT true,
  auto_priority_bump BOOLEAN DEFAULT false,
  required_action TEXT,
  
  -- Applicability (using TEXT[] to avoid enum array issues)
  applicable_categories UUID[] DEFAULT ARRAY[]::UUID[],
  applicable_tiers TEXT[] DEFAULT ARRAY[]::TEXT[],
  
  is_active BOOLEAN NOT NULL DEFAULT true,
  priority INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Escalation history
CREATE TABLE public.genie_escalation_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID NOT NULL REFERENCES public.genie_support_tickets(id) ON DELETE CASCADE,
  
  -- Escalation details
  from_level genie_escalation_level,
  to_level genie_escalation_level NOT NULL,
  from_team_id UUID REFERENCES public.genie_support_teams(id),
  to_team_id UUID REFERENCES public.genie_support_teams(id),
  from_agent_id UUID REFERENCES public.genie_support_agents(id),
  to_agent_id UUID REFERENCES public.genie_support_agents(id),
  
  -- Trigger info
  escalation_rule_id UUID REFERENCES public.genie_escalation_rules(id),
  trigger_reason TEXT NOT NULL,
  trigger_details JSONB DEFAULT '{}',
  
  -- Timing
  escalated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  escalated_by UUID,
  was_auto_escalated BOOLEAN DEFAULT false,
  
  -- Resolution
  time_at_previous_level_minutes INTEGER,
  notes TEXT
);

-- ======================
-- 5. ENHANCED TICKET FIELDS
-- ======================

-- Add new columns to existing tickets table
ALTER TABLE public.genie_support_tickets 
ADD COLUMN IF NOT EXISTS category_id UUID REFERENCES public.genie_support_categories(id),
ADD COLUMN IF NOT EXISTS issue_type_id UUID REFERENCES public.genie_issue_types(id),
ADD COLUMN IF NOT EXISTS current_level genie_escalation_level DEFAULT 'l1_ai',
ADD COLUMN IF NOT EXISTS escalation_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_escalated_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS is_vip BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS customer_satisfaction_rating INTEGER CHECK (customer_satisfaction_rating BETWEEN 1 AND 5),
ADD COLUMN IF NOT EXISTS resolution_summary TEXT,
ADD COLUMN IF NOT EXISTS root_cause TEXT,
ADD COLUMN IF NOT EXISTS affected_users_count INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS is_recurring BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS related_ticket_ids UUID[] DEFAULT ARRAY[]::UUID[];

-- ======================
-- 6. INDEXES FOR PERFORMANCE
-- ======================

CREATE INDEX idx_support_categories_parent ON public.genie_support_categories(parent_category_id) WHERE parent_category_id IS NOT NULL;
CREATE INDEX idx_support_categories_active ON public.genie_support_categories(is_active, sort_order);
CREATE INDEX idx_issue_types_category ON public.genie_issue_types(category_id, is_active);
CREATE INDEX idx_ticket_context_ticket ON public.genie_ticket_context(ticket_id);
CREATE INDEX idx_ticket_context_session ON public.genie_ticket_context(genie_session_id) WHERE genie_session_id IS NOT NULL;
CREATE INDEX idx_response_templates_type ON public.genie_response_templates(template_type, is_active);
CREATE INDEX idx_response_templates_category ON public.genie_response_templates USING GIN(applicable_categories);
CREATE INDEX idx_escalation_history_ticket ON public.genie_escalation_history(ticket_id, escalated_at DESC);
CREATE INDEX idx_tickets_category ON public.genie_support_tickets(category_id) WHERE category_id IS NOT NULL;
CREATE INDEX idx_tickets_level ON public.genie_support_tickets(current_level, status);

-- ======================
-- 7. TRIGGERS FOR TIMESTAMPS
-- ======================

CREATE OR REPLACE FUNCTION update_genie_support_tables_timestamp()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER update_support_categories_timestamp BEFORE UPDATE ON public.genie_support_categories
FOR EACH ROW EXECUTE FUNCTION update_genie_support_tables_timestamp();

CREATE TRIGGER update_issue_types_timestamp BEFORE UPDATE ON public.genie_issue_types
FOR EACH ROW EXECUTE FUNCTION update_genie_support_tables_timestamp();

CREATE TRIGGER update_template_categories_timestamp BEFORE UPDATE ON public.genie_template_categories
FOR EACH ROW EXECUTE FUNCTION update_genie_support_tables_timestamp();

CREATE TRIGGER update_response_templates_timestamp BEFORE UPDATE ON public.genie_response_templates
FOR EACH ROW EXECUTE FUNCTION update_genie_support_tables_timestamp();

CREATE TRIGGER update_escalation_rules_timestamp BEFORE UPDATE ON public.genie_escalation_rules
FOR EACH ROW EXECUTE FUNCTION update_genie_support_tables_timestamp();

-- ======================
-- 8. AUTO-ESCALATION FUNCTION
-- ======================

CREATE OR REPLACE FUNCTION public.check_ticket_escalation()
RETURNS TRIGGER AS $$
DECLARE
  rule_rec RECORD;
  hours_open INTERVAL;
  should_escalate BOOLEAN := false;
  next_level genie_escalation_level;
  target_team_id UUID;
BEGIN
  -- Calculate time open
  hours_open := now() - NEW.created_at;
  
  -- Check escalation rules
  FOR rule_rec IN 
    SELECT * FROM genie_escalation_rules 
    WHERE is_active = true 
    AND (from_level IS NULL OR from_level = NEW.current_level)
    ORDER BY priority DESC
  LOOP
    -- Time-based escalation
    IF rule_rec.trigger_type = 'time_based' THEN
      IF hours_open > ((rule_rec.trigger_conditions->>'hours')::int || ' hours')::interval 
         AND NEW.status NOT IN ('resolved', 'closed') THEN
        should_escalate := true;
        next_level := rule_rec.to_level;
        target_team_id := rule_rec.route_to_team_id;
        EXIT;
      END IF;
    -- Priority-based escalation
    ELSIF rule_rec.trigger_type = 'priority_based' THEN
      IF NEW.priority = 'critical' AND NEW.current_level = 'l1_ai' THEN
        should_escalate := true;
        next_level := rule_rec.to_level;
        target_team_id := rule_rec.route_to_team_id;
        EXIT;
      END IF;
    -- VIP tier-based
    ELSIF rule_rec.trigger_type = 'tier_based' THEN
      IF NEW.is_vip = true AND NEW.current_level = 'l1_ai' THEN
        should_escalate := true;
        next_level := rule_rec.to_level;
        target_team_id := rule_rec.route_to_team_id;
        EXIT;
      END IF;
    END IF;
  END LOOP;
  
  -- Apply escalation
  IF should_escalate AND next_level IS NOT NULL THEN
    NEW.current_level := next_level;
    NEW.escalation_count := COALESCE(NEW.escalation_count, 0) + 1;
    NEW.last_escalated_at := now();
    NEW.assigned_team_id := COALESCE(target_team_id, NEW.assigned_team_id);
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER check_escalation_on_ticket_update
BEFORE UPDATE ON public.genie_support_tickets
FOR EACH ROW EXECUTE FUNCTION public.check_ticket_escalation();

-- ======================
-- 9. RLS POLICIES
-- ======================

ALTER TABLE public.genie_support_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.genie_issue_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.genie_ticket_context ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.genie_ticket_reproduction_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.genie_template_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.genie_response_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.genie_template_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.genie_escalation_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.genie_escalation_history ENABLE ROW LEVEL SECURITY;

-- Public read for categories (needed for ticket submission)
CREATE POLICY "Anyone can view active categories" ON public.genie_support_categories
FOR SELECT USING (is_active = true);

CREATE POLICY "Anyone can view active issue types" ON public.genie_issue_types
FOR SELECT USING (is_active = true);

-- Users can view their own ticket context
CREATE POLICY "Users can view own ticket context" ON public.genie_ticket_context
FOR SELECT USING (
  EXISTS (SELECT 1 FROM genie_support_tickets t WHERE t.id = ticket_id AND t.user_id = auth.uid())
);

CREATE POLICY "Users can insert own ticket context" ON public.genie_ticket_context
FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM genie_support_tickets t WHERE t.id = ticket_id AND t.user_id = auth.uid())
);

-- Reproduction steps
CREATE POLICY "Users can manage own reproduction steps" ON public.genie_ticket_reproduction_steps
FOR ALL USING (
  EXISTS (SELECT 1 FROM genie_support_tickets t WHERE t.id = ticket_id AND t.user_id = auth.uid())
);

-- Support agents can view templates
CREATE POLICY "Support agents can view templates" ON public.genie_response_templates
FOR SELECT USING (is_active = true AND public.is_genie_support_agent());

CREATE POLICY "Support agents can manage templates" ON public.genie_response_templates
FOR ALL USING (public.is_genie_support_agent());

CREATE POLICY "Support agents can view template categories" ON public.genie_template_categories
FOR SELECT USING (is_active = true AND public.is_genie_support_agent());

-- Escalation rules (support agents only)
CREATE POLICY "Support agents can view escalation rules" ON public.genie_escalation_rules
FOR SELECT USING (public.is_genie_support_agent());

-- Escalation history (users for own tickets, agents for all)
CREATE POLICY "Users can view own escalation history" ON public.genie_escalation_history
FOR SELECT USING (
  EXISTS (SELECT 1 FROM genie_support_tickets t WHERE t.id = ticket_id AND t.user_id = auth.uid())
  OR public.is_genie_support_agent()
);

-- Template usage (agents only)
CREATE POLICY "Support agents can manage template usage" ON public.genie_template_usage
FOR ALL USING (public.is_genie_support_agent());

-- ======================
-- 10. SEED DEFAULT CATEGORIES
-- ======================

INSERT INTO public.genie_support_categories (name, display_name, description, category_type, icon, color, sort_order) VALUES
-- Product categories
('genie_deck', 'Genie Deck', 'Presentation and slide creation', 'product', 'presentation', '#6366F1', 1),
('genie_video', 'Genie Video', 'Video creation and editing', 'product', 'video', '#8B5CF6', 2),
('genie_text', 'Genie Text', 'AI writing and content', 'product', 'file-text', '#EC4899', 3),
('genie_voice', 'Genie Voice', 'Voice synthesis and dubbing', 'product', 'mic', '#F59E0B', 4),
('ask_genie', 'Ask Genie', 'AI assistant and help', 'product', 'sparkles', '#10B981', 5),
-- Issue categories
('technical', 'Technical Issues', 'Bugs, errors, and technical problems', 'technical', 'bug', '#EF4444', 10),
('billing', 'Billing & Payments', 'Subscription, credits, and payment issues', 'billing', 'credit-card', '#3B82F6', 11),
('account', 'Account & Access', 'Login, settings, and permissions', 'account', 'user', '#6B7280', 12),
('feature_request', 'Feature Requests', 'New feature suggestions', 'general', 'lightbulb', '#22C55E', 13),
('content', 'Content Issues', 'Quality, generation, or output problems', 'general', 'file-warning', '#F97316', 14);

-- Seed issue types for technical category
INSERT INTO public.genie_issue_types (category_id, name, display_name, description, severity_default, requires_reproduction_steps, requires_screenshot)
SELECT 
  c.id,
  issue.name,
  issue.display_name,
  issue.description,
  issue.severity::genie_ticket_priority,
  issue.requires_steps,
  issue.requires_screenshot
FROM genie_support_categories c
CROSS JOIN (VALUES
  ('export_error', 'Export Failed', 'Unable to export or download content', 'high', true, true),
  ('generation_error', 'Generation Error', 'AI generation failed or produced errors', 'high', true, true),
  ('ui_bug', 'UI/Display Issue', 'Visual glitches or display problems', 'medium', true, true),
  ('performance', 'Slow Performance', 'Application is slow or unresponsive', 'medium', true, false),
  ('crash', 'App Crash', 'Application crashed or became unresponsive', 'critical', true, false),
  ('integration', 'Integration Issue', 'Third-party integration not working', 'medium', true, false)
) AS issue(name, display_name, description, severity, requires_steps, requires_screenshot)
WHERE c.name = 'technical';

-- Seed default template categories
INSERT INTO public.genie_template_categories (name, display_name, description, sort_order) VALUES
('greeting', 'Greetings', 'Initial response templates', 1),
('acknowledgment', 'Acknowledgment', 'Issue acknowledgment templates', 2),
('troubleshooting', 'Troubleshooting', 'Step-by-step troubleshooting guides', 3),
('resolution', 'Resolution', 'Issue resolved templates', 4),
('escalation', 'Escalation', 'Escalation notification templates', 5),
('follow_up', 'Follow Up', 'Follow-up and check-in templates', 6),
('billing', 'Billing', 'Billing and subscription templates', 7),
('technical', 'Technical', 'Technical response templates', 8);

-- Seed default response templates
INSERT INTO public.genie_response_templates (
  template_category_id, name, subject_template, content_template, template_type, language_code
)
SELECT 
  tc.id,
  t.name,
  t.subject,
  t.content,
  t.template_type::TEXT,
  'en'
FROM genie_template_categories tc
CROSS JOIN (VALUES
  ('greeting', 'Welcome Response', 'Re: {{ticket_subject}}', 'Hi {{user_name}},

Thank you for reaching out to Genie Studio support! I''m here to help you with your inquiry.

I''ve reviewed your message and will get back to you shortly with a solution.

Best regards,
{{agent_name}}
Genie Studio Support', 'manual'),
  
  ('acknowledgment', 'Ticket Received', 'Your support request #{{ticket_id}} has been received', 'Hi {{user_name}},

We''ve received your support request and assigned it ticket number **#{{ticket_id}}**.

Our team is reviewing your issue and will respond within {{sla_hours}} hours.

You can track your ticket status anytime by logging into your account.

Best regards,
Genie Studio Support Team', 'auto_response'),
  
  ('resolution', 'Issue Resolved', 'Resolved: {{ticket_subject}}', 'Hi {{user_name}},

Great news! Your issue has been resolved.

**Summary:** {{resolution_summary}}

If you have any further questions or if the issue persists, please don''t hesitate to reply to this message.

Thank you for your patience!

Best regards,
{{agent_name}}
Genie Studio Support', 'resolution'),
  
  ('escalation', 'Escalation Notice', 'Update on your request #{{ticket_id}}', 'Hi {{user_name}},

Your support request has been escalated to our {{escalation_team}} team for specialized assistance.

A specialist will review your case and respond shortly. We appreciate your patience.

Best regards,
{{agent_name}}
Genie Studio Support', 'escalation')
) AS t(category, name, subject, content, template_type)
WHERE tc.name = t.category;

-- Seed default escalation rules
INSERT INTO public.genie_escalation_rules (name, description, trigger_type, trigger_conditions, from_level, to_level, notify_customer, auto_priority_bump) VALUES
('AI to Support (Unresolved)', 'Escalate from AI to human support after 15 minutes of unresolved conversation', 'time_based', '{"minutes": 15, "status": "open"}', 'l1_ai', 'l2_support', true, false),
('Support to Specialist (Time)', 'Escalate to specialist after 4 hours without resolution', 'time_based', '{"hours": 4, "status": "in_progress"}', 'l2_support', 'l3_specialist', true, false),
('Critical Priority Auto-Escalate', 'Critical issues skip AI and go directly to support', 'priority_based', '{"priority": "critical"}', 'l1_ai', 'l2_support', true, true),
('VIP Customer Fast-Track', 'Enterprise/Business tier customers get priority routing', 'tier_based', '{"tiers": ["enterprise", "business"]}', 'l1_ai', 'l2_support', false, false),
('SLA Breach Escalation', 'Auto-escalate when SLA is about to be breached', 'sla_breach', '{"threshold_percentage": 80}', NULL, 'l3_specialist', true, true);