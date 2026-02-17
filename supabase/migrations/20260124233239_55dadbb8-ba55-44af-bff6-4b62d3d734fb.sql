-- =====================================================
-- DEVELOPER HANDOFF & ISSUE RESOLUTION SYSTEM
-- AI Context Export + GitHub Environment Tracking + Self-Service
-- =====================================================

-- Engineering ticket context for AI tools (full capture)
CREATE TABLE public.genie_engineering_context (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID REFERENCES public.genie_support_tickets(id) ON DELETE CASCADE,
  
  -- Full stack trace capture
  console_errors JSONB DEFAULT '[]',
  network_failures JSONB DEFAULT '[]',
  api_responses JSONB DEFAULT '[]',
  error_stack_trace TEXT,
  
  -- Session replay data
  user_actions JSONB DEFAULT '[]',
  navigation_path JSONB DEFAULT '[]',
  click_events JSONB DEFAULT '[]',
  form_submissions JSONB DEFAULT '[]',
  
  -- Environment snapshot
  browser_info JSONB DEFAULT '{}',
  device_info JSONB DEFAULT '{}',
  os_info JSONB DEFAULT '{}',
  user_tier TEXT,
  feature_flags JSONB DEFAULT '{}',
  current_page_state JSONB DEFAULT '{}',
  local_storage_snapshot JSONB DEFAULT '{}',
  
  -- AI-generated analysis
  ai_root_cause_analysis TEXT,
  ai_suggested_fix TEXT,
  ai_affected_files JSONB DEFAULT '[]',
  ai_related_issues JSONB DEFAULT '[]',
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- AI context export format for dev tools
CREATE TABLE public.genie_dev_context_exports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID REFERENCES public.genie_support_tickets(id) ON DELETE CASCADE,
  engineering_context_id UUID REFERENCES public.genie_engineering_context(id),
  
  -- Export format
  export_format TEXT NOT NULL DEFAULT 'lovable', -- 'lovable', 'cursor', 'claude', 'github_issue'
  export_content JSONB NOT NULL, -- Structured prompt/context
  
  -- Markdown-formatted context for AI tools
  ai_prompt_markdown TEXT,
  reproduction_steps_markdown TEXT,
  expected_vs_actual TEXT,
  
  -- Export metadata
  exported_by UUID,
  exported_at TIMESTAMPTZ DEFAULT now(),
  export_url TEXT, -- If pushed to external system
  
  created_at TIMESTAMPTZ DEFAULT now()
);

-- GitHub environment tracking (dev → UAT → main)
CREATE TYPE public.genie_environment AS ENUM ('dev', 'uat', 'staging', 'main', 'production');

CREATE TABLE public.genie_fix_deployments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID REFERENCES public.genie_support_tickets(id) ON DELETE CASCADE,
  
  -- GitHub integration
  github_branch TEXT,
  github_pr_number INTEGER,
  github_pr_url TEXT,
  github_commit_sha TEXT,
  
  -- Environment progression
  current_environment genie_environment DEFAULT 'dev',
  deployed_to_dev_at TIMESTAMPTZ,
  deployed_to_uat_at TIMESTAMPTZ,
  deployed_to_main_at TIMESTAMPTZ,
  
  -- Status
  fix_status TEXT DEFAULT 'in_development', -- 'in_development', 'testing', 'verified', 'deployed', 'rolled_back'
  verified_by UUID,
  verified_at TIMESTAMPTZ,
  
  -- Notes
  developer_notes TEXT,
  test_results JSONB DEFAULT '{}',
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Self-service knowledge base for non-technical issues
CREATE TABLE public.genie_knowledge_articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Categorization
  category_id UUID REFERENCES public.genie_support_categories(id),
  issue_type_id UUID REFERENCES public.genie_issue_types(id),
  
  -- Content
  title TEXT NOT NULL,
  slug TEXT UNIQUE,
  summary TEXT,
  content_markdown TEXT NOT NULL,
  
  -- Rich media
  video_url TEXT,
  video_embed_code TEXT,
  tutorial_steps JSONB DEFAULT '[]', -- Interactive tutorial steps
  screenshots JSONB DEFAULT '[]',
  
  -- Search optimization
  keywords TEXT[],
  search_vector tsvector,
  
  -- Metadata
  view_count INTEGER DEFAULT 0,
  helpful_votes INTEGER DEFAULT 0,
  not_helpful_votes INTEGER DEFAULT 0,
  is_published BOOLEAN DEFAULT false,
  
  -- Versioning
  version INTEGER DEFAULT 1,
  last_updated_by UUID,
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Interactive tutorials with step tracking
CREATE TABLE public.genie_interactive_tutorials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  knowledge_article_id UUID REFERENCES public.genie_knowledge_articles(id) ON DELETE CASCADE,
  
  -- Tutorial metadata
  title TEXT NOT NULL,
  description TEXT,
  estimated_duration_minutes INTEGER DEFAULT 5,
  difficulty_level TEXT DEFAULT 'beginner', -- 'beginner', 'intermediate', 'advanced'
  
  -- Steps structure
  steps JSONB NOT NULL DEFAULT '[]',
  -- Each step: { step_number, title, instruction, action_type, target_element, validation_check, hint }
  
  -- Completion tracking
  total_steps INTEGER DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- User tutorial progress tracking
CREATE TABLE public.genie_tutorial_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  tutorial_id UUID REFERENCES public.genie_interactive_tutorials(id) ON DELETE CASCADE,
  
  -- Progress
  current_step INTEGER DEFAULT 0,
  completed_steps INTEGER[] DEFAULT '{}',
  is_completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMPTZ,
  
  -- Analytics
  started_at TIMESTAMPTZ DEFAULT now(),
  time_spent_seconds INTEGER DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  
  UNIQUE(user_id, tutorial_id)
);

-- Video walkthroughs library
CREATE TABLE public.genie_video_walkthroughs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Categorization
  category_id UUID REFERENCES public.genie_support_categories(id),
  knowledge_article_id UUID REFERENCES public.genie_knowledge_articles(id),
  
  -- Video details
  title TEXT NOT NULL,
  description TEXT,
  video_url TEXT NOT NULL,
  thumbnail_url TEXT,
  duration_seconds INTEGER,
  
  -- Transcription for search
  transcript TEXT,
  chapters JSONB DEFAULT '[]', -- { timestamp, title, description }
  
  -- Analytics
  view_count INTEGER DEFAULT 0,
  average_watch_percentage DECIMAL(5,2) DEFAULT 0,
  
  -- Metadata
  is_published BOOLEAN DEFAULT true,
  language_code TEXT DEFAULT 'en',
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Issue classification: Technical vs Non-Technical
CREATE OR REPLACE FUNCTION public.classify_issue_type(p_ticket_id UUID)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_category TEXT;
  v_has_errors BOOLEAN;
  v_issue_keywords TEXT[];
BEGIN
  -- Check if ticket has technical indicators
  SELECT 
    sc.name,
    EXISTS (SELECT 1 FROM genie_engineering_context WHERE ticket_id = p_ticket_id AND (console_errors != '[]' OR network_failures != '[]'))
  INTO v_category, v_has_errors
  FROM genie_support_tickets t
  LEFT JOIN genie_support_categories sc ON t.category_id = sc.id
  WHERE t.id = p_ticket_id;
  
  -- Technical categories
  IF v_category IN ('Technical', 'API & Integration', 'Bug Report', 'Performance') THEN
    RETURN 'engineering';
  END IF;
  
  -- Has error logs = engineering
  IF v_has_errors THEN
    RETURN 'engineering';
  END IF;
  
  -- Default to support (non-technical)
  RETURN 'support';
END;
$$;

-- Generate AI-exportable context for dev tools
CREATE OR REPLACE FUNCTION public.generate_ai_context_export(
  p_ticket_id UUID,
  p_export_format TEXT DEFAULT 'lovable'
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_ticket RECORD;
  v_context RECORD;
  v_export_content JSONB;
  v_prompt_markdown TEXT;
  v_export_id UUID;
BEGIN
  -- Get ticket details
  SELECT t.*, sc.name as category_name, sit.name as issue_type_name
  INTO v_ticket
  FROM genie_support_tickets t
  LEFT JOIN genie_support_categories sc ON t.category_id = sc.id
  LEFT JOIN genie_issue_types sit ON t.issue_type_id = sit.id
  WHERE t.id = p_ticket_id;
  
  -- Get engineering context
  SELECT * INTO v_context
  FROM genie_engineering_context
  WHERE ticket_id = p_ticket_id
  ORDER BY created_at DESC
  LIMIT 1;
  
  -- Build export content
  v_export_content := jsonb_build_object(
    'ticket_id', p_ticket_id,
    'priority', v_ticket.priority,
    'category', v_ticket.category_name,
    'issue_type', v_ticket.issue_type_name,
    'subject', v_ticket.subject,
    'description', v_ticket.description,
    'environment', jsonb_build_object(
      'browser', v_context.browser_info,
      'device', v_context.device_info,
      'os', v_context.os_info,
      'user_tier', v_context.user_tier,
      'feature_flags', v_context.feature_flags
    ),
    'errors', jsonb_build_object(
      'console', v_context.console_errors,
      'network', v_context.network_failures,
      'api_responses', v_context.api_responses,
      'stack_trace', v_context.error_stack_trace
    ),
    'user_actions', v_context.user_actions,
    'navigation_path', v_context.navigation_path,
    'ai_analysis', jsonb_build_object(
      'root_cause', v_context.ai_root_cause_analysis,
      'suggested_fix', v_context.ai_suggested_fix,
      'affected_files', v_context.ai_affected_files
    )
  );
  
  -- Generate markdown prompt for AI tools
  v_prompt_markdown := '## Issue Context for Development

### Summary
**Ticket ID**: ' || p_ticket_id || '
**Priority**: ' || COALESCE(v_ticket.priority::text, 'medium') || '
**Category**: ' || COALESCE(v_ticket.category_name, 'General') || '

### Description
' || COALESCE(v_ticket.description, 'No description provided') || '

### Environment
- **Browser**: ' || COALESCE(v_context.browser_info->>'name', 'Unknown') || ' ' || COALESCE(v_context.browser_info->>'version', '') || '
- **OS**: ' || COALESCE(v_context.os_info->>'name', 'Unknown') || '
- **User Tier**: ' || COALESCE(v_context.user_tier, 'Unknown') || '

### Error Details
```
' || COALESCE(v_context.error_stack_trace, 'No stack trace captured') || '
```

### Console Errors
```json
' || COALESCE(v_context.console_errors::text, '[]') || '
```

### Network Failures
```json
' || COALESCE(v_context.network_failures::text, '[]') || '
```

### AI Analysis
**Root Cause**: ' || COALESCE(v_context.ai_root_cause_analysis, 'Pending analysis') || '
**Suggested Fix**: ' || COALESCE(v_context.ai_suggested_fix, 'Pending analysis') || '
**Affected Files**: ' || COALESCE(v_context.ai_affected_files::text, '[]') || '

---
*Generated for ' || p_export_format || ' at ' || now()::text || '*';

  -- Create export record
  INSERT INTO genie_dev_context_exports (
    ticket_id,
    engineering_context_id,
    export_format,
    export_content,
    ai_prompt_markdown,
    exported_by
  ) VALUES (
    p_ticket_id,
    v_context.id,
    p_export_format,
    v_export_content,
    v_prompt_markdown,
    auth.uid()
  )
  RETURNING id INTO v_export_id;
  
  RETURN v_export_id;
END;
$$;

-- Auto-update ticket when fix is deployed to main
CREATE OR REPLACE FUNCTION public.sync_fix_deployment_status()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- When deployed to main, mark ticket as resolved
  IF NEW.current_environment = 'main' AND NEW.fix_status = 'deployed' THEN
    UPDATE genie_support_tickets
    SET 
      status = 'resolved',
      resolved_at = now(),
      resolution_type = 'fix_deployed',
      resolution_notes = 'Fix deployed via PR #' || NEW.github_pr_number || ' (commit: ' || NEW.github_commit_sha || ')'
    WHERE id = NEW.ticket_id;
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER sync_fix_deployment
  AFTER UPDATE ON genie_fix_deployments
  FOR EACH ROW
  EXECUTE FUNCTION sync_fix_deployment_status();

-- Search articles function
CREATE OR REPLACE FUNCTION public.search_knowledge_articles(
  p_query TEXT,
  p_category_id UUID DEFAULT NULL,
  p_limit INTEGER DEFAULT 10
)
RETURNS TABLE (
  id UUID,
  title TEXT,
  summary TEXT,
  category_name TEXT,
  video_url TEXT,
  relevance REAL
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ka.id,
    ka.title,
    ka.summary,
    sc.name as category_name,
    ka.video_url,
    ts_rank(ka.search_vector, plainto_tsquery('english', p_query)) as relevance
  FROM genie_knowledge_articles ka
  LEFT JOIN genie_support_categories sc ON ka.category_id = sc.id
  WHERE 
    ka.is_published = true
    AND (p_category_id IS NULL OR ka.category_id = p_category_id)
    AND (
      ka.search_vector @@ plainto_tsquery('english', p_query)
      OR ka.title ILIKE '%' || p_query || '%'
      OR ka.summary ILIKE '%' || p_query || '%'
    )
  ORDER BY relevance DESC
  LIMIT p_limit;
END;
$$;

-- Update search vector trigger
CREATE OR REPLACE FUNCTION public.update_knowledge_article_search_vector()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.search_vector := to_tsvector('english', 
    COALESCE(NEW.title, '') || ' ' || 
    COALESCE(NEW.summary, '') || ' ' || 
    COALESCE(NEW.content_markdown, '') || ' ' ||
    COALESCE(array_to_string(NEW.keywords, ' '), '')
  );
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_knowledge_search
  BEFORE INSERT OR UPDATE ON genie_knowledge_articles
  FOR EACH ROW
  EXECUTE FUNCTION update_knowledge_article_search_vector();

-- RLS Policies
ALTER TABLE genie_engineering_context ENABLE ROW LEVEL SECURITY;
ALTER TABLE genie_dev_context_exports ENABLE ROW LEVEL SECURITY;
ALTER TABLE genie_fix_deployments ENABLE ROW LEVEL SECURITY;
ALTER TABLE genie_knowledge_articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE genie_interactive_tutorials ENABLE ROW LEVEL SECURITY;
ALTER TABLE genie_tutorial_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE genie_video_walkthroughs ENABLE ROW LEVEL SECURITY;

-- Engineering context - support team access
CREATE POLICY "Support team can manage engineering context"
  ON genie_engineering_context FOR ALL
  USING (public.is_admin_user(auth.uid()) OR public.has_role(auth.uid(), 'onboardingTeam'));

-- Dev exports - authenticated users for their tickets
CREATE POLICY "Users can view exports for their tickets"
  ON genie_dev_context_exports FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM genie_support_tickets t 
    WHERE t.id = ticket_id AND t.user_id = auth.uid()
  ) OR public.is_admin_user(auth.uid()));

-- Fix deployments - admin access
CREATE POLICY "Admins manage fix deployments"
  ON genie_fix_deployments FOR ALL
  USING (public.is_admin_user(auth.uid()));

-- Knowledge articles - public read
CREATE POLICY "Anyone can read published articles"
  ON genie_knowledge_articles FOR SELECT
  USING (is_published = true);

CREATE POLICY "Admins manage articles"
  ON genie_knowledge_articles FOR ALL
  USING (public.is_admin_user(auth.uid()));

-- Tutorials - public read
CREATE POLICY "Anyone can read tutorials"
  ON genie_interactive_tutorials FOR SELECT
  USING (true);

-- Tutorial progress - user's own progress
CREATE POLICY "Users manage own tutorial progress"
  ON genie_tutorial_progress FOR ALL
  USING (user_id = auth.uid());

-- Video walkthroughs - public read
CREATE POLICY "Anyone can view published videos"
  ON genie_video_walkthroughs FOR SELECT
  USING (is_published = true);

-- Indexes for performance
CREATE INDEX idx_eng_context_ticket ON genie_engineering_context(ticket_id);
CREATE INDEX idx_dev_exports_ticket ON genie_dev_context_exports(ticket_id);
CREATE INDEX idx_fix_deployments_ticket ON genie_fix_deployments(ticket_id);
CREATE INDEX idx_fix_deployments_env ON genie_fix_deployments(current_environment);
CREATE INDEX idx_knowledge_articles_search ON genie_knowledge_articles USING gin(search_vector);
CREATE INDEX idx_knowledge_articles_category ON genie_knowledge_articles(category_id);
CREATE INDEX idx_tutorial_progress_user ON genie_tutorial_progress(user_id);
CREATE INDEX idx_video_walkthroughs_category ON genie_video_walkthroughs(category_id);

-- Seed initial knowledge articles
INSERT INTO genie_knowledge_articles (title, slug, summary, content_markdown, keywords, is_published) VALUES
('Getting Started with Genie Deck', 'getting-started-deck', 
 'Learn the basics of creating presentations with Genie Deck',
 '## Getting Started

Welcome to Genie Deck! This guide will walk you through creating your first AI-powered presentation.

### Step 1: Create a New Project
Click the "New Deck" button to start a new presentation project.

### Step 2: Choose Your Template
Select from our library of professional templates or start from scratch.

### Step 3: Add Your Content
Use the AI assistant to generate slides, or add content manually.

### Step 4: Customize & Export
Fine-tune your design and export in your preferred format.',
 ARRAY['getting started', 'beginner', 'deck', 'presentation', 'tutorial'],
 true),
 
('Understanding AI Credits', 'ai-credits-explained',
 'How AI credits work and how to manage your usage',
 '## AI Credits Explained

AI credits are used when you generate content using our AI features.

### What Uses Credits
- Generating slide content
- Creating images
- AI translations
- Video generation

### Managing Credits
Check your usage in Settings → Usage Dashboard.',
 ARRAY['credits', 'billing', 'usage', 'ai', 'limits'],
 true),
 
('Troubleshooting API Errors', 'troubleshooting-api-errors',
 'Common API errors and how to resolve them',
 '## Troubleshooting API Errors

### Error 429: Rate Limited
Wait a few minutes and try again. Consider upgrading for higher limits.

### Error 500: Server Error
Report this issue to support with your error details.

### Error 401: Authentication Failed
Log out and log back in to refresh your session.',
 ARRAY['api', 'errors', 'troubleshooting', 'technical', 'debugging'],
 true);