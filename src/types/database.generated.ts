// Type-aligned database definitions based on actual Supabase schema
export type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

// Generic table definition with proper typing
type TableDef<Row = any, Insert = any, Update = any> = {
  Row: Row;
  Insert: Insert;
  Update: Update;
  Relationships: any[];
};

export type Database = {
  public: {
    Tables: {
      // Core user & auth tables
      profiles: TableDef;
      roles: TableDef;
      user_roles: TableDef;
      user_permissions: TableDef;
      permissions: TableDef;
      role_permissions: TableDef;
      
      // Agent system tables
      agents: TableDef;
      agent_sessions: TableDef;
      agent_actions: TableDef;
      agent_templates: TableDef;
      agent_conversations: TableDef;
      agent_workflows: TableDef;
      agent_channel_deployments: TableDef;
      agent_api_assignments: TableDef;
      agent_session_tasks: TableDef;
      agent_knowledge_bases: TableDef;
      agent_user_associations: TableDef;
      agent_organization_mapping: TableDef;
      agent_compliance_monitoring: TableDef;
      agent_conversation_engines: TableDef;
      agent_template_journey_stages: TableDef;
      agent_test_runs: TableDef;
      
      // Action & Template tables
      action_templates: TableDef;
      action_template_tasks: TableDef;
      action_execution_logs: TableDef;
      
      // AI Model & Integration tables
      ai_model_integrations: TableDef;
      ai_model_configs: TableDef;
      
      // API & Integration tables
      api_keys: TableDef;
      api_endpoints: TableDef;
      api_documentation: TableDef;
      api_consumption_logs: TableDef;
      api_integration_registry: TableDef;
      api_lifecycle_events: TableDef;
      
      // Voice & Communication tables
      voice_transfer_queue: TableDef;
      voice_analytics_events: TableDef;
      voice_connectors: TableDef;
      
      // Facility & Organization tables
      facilities: TableDef;
      modules: TableDef;
      role_module_assignments: TableDef;
      user_module_assignments: TableDef;
      
      // System & Monitoring tables
      active_issues: TableDef;
      audit_logs: TableDef;
      alternative_solutions: TableDef;
      
      // Fallback for any other tables
      [table: string]: TableDef;
    };
    Views: {
      [view: string]: TableDef;
    };
    Functions: {
      [fn: string]: unknown;
    };
    Enums: {
      facility_type:
        | 'hospital'
        | 'clinic'
        | 'pharmacy'
        | 'laboratory'
        | 'treatmentFacility'
        | 'referralFacility'
        | 'prescriberFacility'
        | 'other';
      user_role:
        | 'superAdmin'
        | 'onboardingTeam'
        | 'patientCaregiver'
        | 'healthcareProvider'
        | 'nurse'
        | 'caseManager'
        | 'financeTeam'
        | 'contractTeam'
        | 'workflowManager'
        | 'demoUser';
      voice_connector_type:
        | 'SIP'
        | 'API'
        | 'Webhook'
        | 'Database'
        | 'CRM'
        | 'Cloud';
      voice_event_type:
        | 'call_started'
        | 'call_ended'
        | 'transfer'
        | 'queue_join'
        | 'queue_leave'
        | 'agent_login'
        | 'agent_logout';
      voice_transfer_status: 'waiting' | 'assigned' | 'completed' | 'cancelled';
      voice_health_status: 'healthy' | 'warning' | 'error' | 'unknown';
    };
    CompositeTypes: {
      [type: string]: unknown;
    };
  };
};