-- Fix function search paths for security (35 functions total)
-- This prevents SQL injection vulnerabilities without changing function behavior

-- Fix agent session tasks function
ALTER FUNCTION public.update_agent_session_tasks_updated_at() SET search_path TO 'public';

-- Fix API key generation functions
ALTER FUNCTION public.generate_api_key(character varying) SET search_path TO 'public';
ALTER FUNCTION public.update_api_key_usage(text) SET search_path TO 'public';

-- Fix generic timestamp functions
ALTER FUNCTION public.update_updated_at_column() SET search_path TO 'public';
ALTER FUNCTION public.handle_updated_at() SET search_path TO 'public';
ALTER FUNCTION public.update_framework_updated_at() SET search_path TO 'public';
ALTER FUNCTION public.update_import_timestamp() SET search_path TO 'public';
ALTER FUNCTION public.update_comprehensive_test_updated_at() SET search_path TO 'public';

-- Fix user and profile management functions  
ALTER FUNCTION public.initialize_user_settings(uuid) SET search_path TO 'public';
ALTER FUNCTION public.handle_new_user() SET search_path TO 'public';
ALTER FUNCTION public.create_patient_profile_and_role(uuid, text, text, text, uuid) SET search_path TO 'public';

-- Fix role and permission functions
ALTER FUNCTION public.assign_user_role(uuid, text) SET search_path TO 'public';
ALTER FUNCTION public.assign_default_role() SET search_path TO 'public';
ALTER FUNCTION public.get_user_roles(uuid) SET search_path TO 'public';
ALTER FUNCTION public.has_role(uuid, user_role) SET search_path TO 'public';
ALTER FUNCTION public.user_has_role(uuid, user_role) SET search_path TO 'public';
ALTER FUNCTION public.check_user_has_role(uuid, user_role) SET search_path TO 'public';
ALTER FUNCTION public.has_permission(uuid, text) SET search_path TO 'public';
ALTER FUNCTION public.user_has_permission(uuid, text, uuid) SET search_path TO 'public';
ALTER FUNCTION public.get_user_effective_permissions(uuid, uuid) SET search_path TO 'public';
ALTER FUNCTION public.get_user_effective_modules(uuid) SET search_path TO 'public';

-- Fix facility access functions
ALTER FUNCTION public.get_user_accessible_facilities(uuid) SET search_path TO 'public';

-- Fix logging and audit functions
ALTER FUNCTION public.log_verification_activity(text, text, jsonb) SET search_path TO 'public';
ALTER FUNCTION public.log_user_activity(uuid, text, text, text, jsonb) SET search_path TO 'public';
ALTER FUNCTION public.log_security_event(uuid, text, text, text, jsonb) SET search_path TO 'public';
ALTER FUNCTION public.audit_trigger_function() SET search_path TO 'public';
ALTER FUNCTION public.log_onboarding_audit(uuid, text, text, text, jsonb, jsonb) SET search_path TO 'public';
ALTER FUNCTION public.log_stability_event(uuid, text, jsonb, text, text, text, jsonb) SET search_path TO 'public';
ALTER FUNCTION public.log_prompt_governance(text, jsonb, integer, jsonb, jsonb, text, text, boolean, jsonb) SET search_path TO 'public';

-- Fix onboarding functions
ALTER FUNCTION public.initialize_onboarding_workflow(uuid) SET search_path TO 'public';
ALTER FUNCTION public.calculate_financial_risk_score(text, integer, numeric, numeric, integer) SET search_path TO 'public';
ALTER FUNCTION public.determine_risk_level(integer) SET search_path TO 'public';

-- Fix testing and validation functions
ALTER FUNCTION public.get_daily_fix_stats(integer, uuid) SET search_path TO 'public';
ALTER FUNCTION public.sync_active_issues(jsonb) SET search_path TO 'public';
ALTER FUNCTION public.test_rls_policies() SET search_path TO 'public';
ALTER FUNCTION public.detect_system_functionality() SET search_path TO 'public';
ALTER FUNCTION public.generate_comprehensive_test_cases(uuid) SET search_path TO 'public';
ALTER FUNCTION public.execute_comprehensive_test_suite(text, integer) SET search_path TO 'public';
ALTER FUNCTION public.generate_comprehensive_test_cases_enhanced(uuid) SET search_path TO 'public';
ALTER FUNCTION public.continuous_test_generation() SET search_path TO 'public';
ALTER FUNCTION public.auto_generate_tests_trigger() SET search_path TO 'public';

-- Fix data import and schema functions
ALTER FUNCTION public.detect_schema_from_data(jsonb, integer) SET search_path TO 'public';
ALTER FUNCTION public.validate_data_against_schema(jsonb, jsonb) SET search_path TO 'public';
ALTER FUNCTION public.get_import_statistics(uuid) SET search_path TO 'public';
ALTER FUNCTION public.get_complete_schema_info() SET search_path TO 'public';