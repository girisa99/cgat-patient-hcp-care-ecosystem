
-- =====================================================
-- RLS HARDENING BATCH 2: MEDIUM RISK - System/Logging/Analytics Tables
-- Strategy: Edge functions use service_role (bypasses RLS),
-- so we restrict client-side to authenticated where possible.
-- Tables needing anon access (public genie, newsletter) keep anon+authenticated.
-- =====================================================

-- =====================================================
-- GROUP A: SYSTEM LOGGING — only edge functions write (service_role bypasses RLS)
-- Restrict to authenticated to prevent anonymous abuse
-- =====================================================

-- action_execution_logs
DROP POLICY IF EXISTS "System can insert execution logs" ON public.action_execution_logs;
CREATE POLICY "Authenticated can insert execution logs"
  ON public.action_execution_logs FOR INSERT TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

-- connector_activity_logs
DROP POLICY IF EXISTS "System can insert activity logs" ON public.connector_activity_logs;
CREATE POLICY "Authenticated can insert activity logs"
  ON public.connector_activity_logs FOR INSERT TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

-- credit_application_audit
DROP POLICY IF EXISTS "System can insert audit logs" ON public.credit_application_audit;
CREATE POLICY "Authenticated can insert audit logs"
  ON public.credit_application_audit FOR INSERT TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

-- genie_session_notifications
DROP POLICY IF EXISTS "System can insert notifications" ON public.genie_session_notifications;
CREATE POLICY "Authenticated can insert notifications"
  ON public.genie_session_notifications FOR INSERT TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

-- genie_token_budgets
DROP POLICY IF EXISTS "System can insert token budgets" ON public.genie_token_budgets;
CREATE POLICY "Authenticated can insert token budgets"
  ON public.genie_token_budgets FOR INSERT TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

-- journey_stage_transitions
DROP POLICY IF EXISTS "System can insert journey transitions" ON public.journey_stage_transitions;
CREATE POLICY "Authenticated can insert journey transitions"
  ON public.journey_stage_transitions FOR INSERT TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

-- knowledge_citations
DROP POLICY IF EXISTS "System can log citations" ON public.knowledge_citations;
CREATE POLICY "Authenticated can log citations"
  ON public.knowledge_citations FOR INSERT TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

-- onboarding_audit_trail
DROP POLICY IF EXISTS "System can insert audit records" ON public.onboarding_audit_trail;
CREATE POLICY "Authenticated can insert audit records"
  ON public.onboarding_audit_trail FOR INSERT TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

-- security_alerts
DROP POLICY IF EXISTS "System can insert security alerts" ON public.security_alerts;
CREATE POLICY "Authenticated can insert security alerts"
  ON public.security_alerts FOR INSERT TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

-- security_events (has 2 duplicate policies)
DROP POLICY IF EXISTS "System can insert security events" ON public.security_events;
DROP POLICY IF EXISTS "Service can log security events" ON public.security_events;
CREATE POLICY "Authenticated can insert security events"
  ON public.security_events FOR INSERT TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

-- tool_executions
DROP POLICY IF EXISTS "System can insert tool executions" ON public.tool_executions;
CREATE POLICY "Authenticated can insert tool executions"
  ON public.tool_executions FOR INSERT TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

-- user_activity_logs
DROP POLICY IF EXISTS "System can insert activity logs" ON public.user_activity_logs;
CREATE POLICY "Authenticated can insert user activity logs"
  ON public.user_activity_logs FOR INSERT TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

-- workflow_execution_logs
DROP POLICY IF EXISTS "System can insert execution logs" ON public.workflow_execution_logs;
CREATE POLICY "Authenticated can insert workflow execution logs"
  ON public.workflow_execution_logs FOR INSERT TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

-- workflow_executions
DROP POLICY IF EXISTS "System can insert workflow executions" ON public.workflow_executions;
CREATE POLICY "Authenticated can insert workflow executions"
  ON public.workflow_executions FOR INSERT TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

-- workflow_node_executions
DROP POLICY IF EXISTS "System can insert node executions" ON public.workflow_node_executions;
CREATE POLICY "Authenticated can insert node executions"
  ON public.workflow_node_executions FOR INSERT TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

-- =====================================================
-- GROUP B: ANALYTICS — edge functions write via service_role,
-- but some need anon for public-facing tracking
-- =====================================================

-- document_ai_analytics (authenticated users submit docs)
DROP POLICY IF EXISTS "Allow insert for document analytics" ON public.document_ai_analytics;
CREATE POLICY "Authenticated can insert document analytics"
  ON public.document_ai_analytics FOR INSERT TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

-- genie_query_analysis (edge function only)
DROP POLICY IF EXISTS "System can insert query analysis" ON public.genie_query_analysis;
CREATE POLICY "Authenticated can insert query analysis"
  ON public.genie_query_analysis FOR INSERT TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

-- genie_response_confidence (edge function only)
DROP POLICY IF EXISTS "System can insert confidence scores" ON public.genie_response_confidence;
CREATE POLICY "Authenticated can insert confidence scores"
  ON public.genie_response_confidence FOR INSERT TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

-- knowledge_usage_analytics (edge function only)
DROP POLICY IF EXISTS "System can log usage" ON public.knowledge_usage_analytics;
CREATE POLICY "Authenticated can log knowledge usage"
  ON public.knowledge_usage_analytics FOR INSERT TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

-- model_usage_analytics (already says authenticated in name but uses public role)
DROP POLICY IF EXISTS "Authenticated users can insert analytics" ON public.model_usage_analytics;
CREATE POLICY "Authenticated can insert model analytics"
  ON public.model_usage_analytics FOR INSERT TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

-- api_usage_analytics (already authenticated)
DROP POLICY IF EXISTS "system_insert_api_analytics" ON public.api_usage_analytics;
CREATE POLICY "Authenticated can insert api analytics"
  ON public.api_usage_analytics FOR INSERT TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

-- vision_analysis_logs
DROP POLICY IF EXISTS "Public can log analyses" ON public.vision_analysis_logs;
CREATE POLICY "Authenticated can log vision analyses"
  ON public.vision_analysis_logs FOR INSERT TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

-- voice_analytics_events
DROP POLICY IF EXISTS "vae_insert" ON public.voice_analytics_events;
CREATE POLICY "Authenticated can insert voice analytics"
  ON public.voice_analytics_events FOR INSERT TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

-- =====================================================
-- GROUP C: PUBLIC-FACING — need anon access (public genie, visitors)
-- Keep anon+authenticated but these are intentionally open
-- =====================================================

-- genie_popup_analytics (public genie widget)
DROP POLICY IF EXISTS "Anyone can insert popup analytics" ON public.genie_popup_analytics;
CREATE POLICY "Anon and authenticated can insert popup analytics"
  ON public.genie_popup_analytics FOR INSERT TO anon, authenticated
  WITH CHECK (true);

-- genie_configuration_analytics (public genie widget)
DROP POLICY IF EXISTS "Anyone can insert configuration analytics" ON public.genie_configuration_analytics;
CREATE POLICY "Anon and authenticated can insert config analytics"
  ON public.genie_configuration_analytics FOR INSERT TO anon, authenticated
  WITH CHECK (true);

-- visitor_analytics (anonymous visitors)
DROP POLICY IF EXISTS "System can insert visitor analytics" ON public.visitor_analytics;
CREATE POLICY "Anon and authenticated can insert visitor analytics"
  ON public.visitor_analytics FOR INSERT TO anon, authenticated
  WITH CHECK (true);

-- narration_playback_events (public playback)
DROP POLICY IF EXISTS "Anyone can log playback events" ON public.narration_playback_events;
CREATE POLICY "Anon and authenticated can log playback"
  ON public.narration_playback_events FOR INSERT TO anon, authenticated
  WITH CHECK (true);

-- newsletter_subscribers (public signup)
DROP POLICY IF EXISTS "Anyone can subscribe to newsletter" ON public.newsletter_subscribers;
CREATE POLICY "Anon and authenticated can subscribe"
  ON public.newsletter_subscribers FOR INSERT TO anon, authenticated
  WITH CHECK (true);

-- feedback (public feedback form)
DROP POLICY IF EXISTS "Anyone can submit feedback" ON public.feedback;
CREATE POLICY "Anon and authenticated can submit feedback"
  ON public.feedback FOR INSERT TO anon, authenticated
  WITH CHECK (true);

-- access_requests (unauthenticated users requesting access)
DROP POLICY IF EXISTS "Users can create access requests" ON public.access_requests;
CREATE POLICY "Anon and authenticated can create access requests"
  ON public.access_requests FOR INSERT TO anon, authenticated
  WITH CHECK (true);

-- =====================================================
-- GROUP D: USER-SCOPED — authenticated with proper ownership
-- =====================================================

-- document_processing_jobs
DROP POLICY IF EXISTS "Users can create document jobs" ON public.document_processing_jobs;
CREATE POLICY "Authenticated can create document jobs"
  ON public.document_processing_jobs FOR INSERT TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

-- enrollment_form_extractions
DROP POLICY IF EXISTS "Users can create extractions" ON public.enrollment_form_extractions;
CREATE POLICY "Authenticated can create extractions"
  ON public.enrollment_form_extractions FOR INSERT TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

-- generated_media
DROP POLICY IF EXISTS "Anyone can insert media" ON public.generated_media;
CREATE POLICY "Authenticated can insert media"
  ON public.generated_media FOR INSERT TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

-- email_logs (already authenticated)
DROP POLICY IF EXISTS "System can log emails for tracking" ON public.email_logs;
CREATE POLICY "Authenticated can log emails"
  ON public.email_logs FOR INSERT TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

-- knowledge_base_contributions (already authenticated)
DROP POLICY IF EXISTS "System can insert knowledge contributions" ON public.knowledge_base_contributions;
CREATE POLICY "Authenticated can insert knowledge contributions"
  ON public.knowledge_base_contributions FOR INSERT TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

-- thumbnail_generation_queue (already authenticated)
DROP POLICY IF EXISTS "Allow authenticated insert queue jobs" ON public.thumbnail_generation_queue;
CREATE POLICY "Authenticated can insert queue jobs"
  ON public.thumbnail_generation_queue FOR INSERT TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

-- =====================================================
-- GROUP E: AUTHENTICATED UPDATE/DELETE — scope properly
-- =====================================================

-- feature_comparison_matrix
DROP POLICY IF EXISTS "Authenticated users can insert feature matrix" ON public.feature_comparison_matrix;
DROP POLICY IF EXISTS "Authenticated users can update feature matrix" ON public.feature_comparison_matrix;
CREATE POLICY "Authenticated can insert feature matrix"
  ON public.feature_comparison_matrix FOR INSERT TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated can update feature matrix"
  ON public.feature_comparison_matrix FOR UPDATE TO authenticated
  USING (auth.uid() IS NOT NULL);

-- ralph_wiggum_findings (security scanner)
DROP POLICY IF EXISTS "Allow authenticated insert" ON public.ralph_wiggum_findings;
DROP POLICY IF EXISTS "Allow authenticated update" ON public.ralph_wiggum_findings;
DROP POLICY IF EXISTS "Allow authenticated delete" ON public.ralph_wiggum_findings;
CREATE POLICY "Authenticated can insert findings"
  ON public.ralph_wiggum_findings FOR INSERT TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated can update findings"
  ON public.ralph_wiggum_findings FOR UPDATE TO authenticated
  USING (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated can delete findings"
  ON public.ralph_wiggum_findings FOR DELETE TO authenticated
  USING (auth.uid() IS NOT NULL);

-- trend_monitoring_log
DROP POLICY IF EXISTS "Authenticated users can insert trends" ON public.trend_monitoring_log;
DROP POLICY IF EXISTS "Authenticated users can update trends" ON public.trend_monitoring_log;
CREATE POLICY "Authenticated can insert trends"
  ON public.trend_monitoring_log FOR INSERT TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated can update trends"
  ON public.trend_monitoring_log FOR UPDATE TO authenticated
  USING (auth.uid() IS NOT NULL);

-- usp_registry
DROP POLICY IF EXISTS "Authenticated users can insert USPs" ON public.usp_registry;
DROP POLICY IF EXISTS "Authenticated users can update USPs" ON public.usp_registry;
CREATE POLICY "Authenticated can insert USPs"
  ON public.usp_registry FOR INSERT TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated can update USPs"
  ON public.usp_registry FOR UPDATE TO authenticated
  USING (auth.uid() IS NOT NULL);
