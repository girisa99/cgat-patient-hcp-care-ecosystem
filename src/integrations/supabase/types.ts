export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      action_execution_logs: {
        Row: {
          action_id: string
          agent_id: string | null
          completed_at: string | null
          created_at: string
          duration_ms: number | null
          error_details: Json | null
          execution_context: Json | null
          execution_id: string
          id: string
          input_data: Json | null
          output_data: Json | null
          started_at: string
          status: string
          triggered_by: string | null
        }
        Insert: {
          action_id: string
          agent_id?: string | null
          completed_at?: string | null
          created_at?: string
          duration_ms?: number | null
          error_details?: Json | null
          execution_context?: Json | null
          execution_id?: string
          id?: string
          input_data?: Json | null
          output_data?: Json | null
          started_at?: string
          status?: string
          triggered_by?: string | null
        }
        Update: {
          action_id?: string
          agent_id?: string | null
          completed_at?: string | null
          created_at?: string
          duration_ms?: number | null
          error_details?: Json | null
          execution_context?: Json | null
          execution_id?: string
          id?: string
          input_data?: Json | null
          output_data?: Json | null
          started_at?: string
          status?: string
          triggered_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "action_execution_logs_action_id_fkey"
            columns: ["action_id"]
            isOneToOne: false
            referencedRelation: "agent_actions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "action_execution_logs_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
        ]
      }
      action_template_tasks: {
        Row: {
          created_at: string
          expected_outputs: Json | null
          id: string
          is_critical: boolean | null
          required_inputs: Json | null
          retry_attempts: number | null
          task_description: string | null
          task_name: string
          task_order: number
          task_type: string
          template_id: string
          timeout_minutes: number | null
          updated_at: string
          validation_rules: Json | null
        }
        Insert: {
          created_at?: string
          expected_outputs?: Json | null
          id?: string
          is_critical?: boolean | null
          required_inputs?: Json | null
          retry_attempts?: number | null
          task_description?: string | null
          task_name: string
          task_order?: number
          task_type?: string
          template_id: string
          timeout_minutes?: number | null
          updated_at?: string
          validation_rules?: Json | null
        }
        Update: {
          created_at?: string
          expected_outputs?: Json | null
          id?: string
          is_critical?: boolean | null
          required_inputs?: Json | null
          retry_attempts?: number | null
          task_description?: string | null
          task_name?: string
          task_order?: number
          task_type?: string
          template_id?: string
          timeout_minutes?: number | null
          updated_at?: string
          validation_rules?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "action_template_tasks_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "action_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      action_templates: {
        Row: {
          category: string
          created_at: string
          created_by: string | null
          description: string | null
          estimated_duration: number | null
          id: string
          is_active: boolean | null
          is_system_template: boolean | null
          name: string
          priority: string
          requires_approval: boolean | null
          template_config: Json | null
          type: string
          updated_at: string
        }
        Insert: {
          category?: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          estimated_duration?: number | null
          id?: string
          is_active?: boolean | null
          is_system_template?: boolean | null
          name: string
          priority?: string
          requires_approval?: boolean | null
          template_config?: Json | null
          type?: string
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          estimated_duration?: number | null
          id?: string
          is_active?: boolean | null
          is_system_template?: boolean | null
          name?: string
          priority?: string
          requires_approval?: boolean | null
          template_config?: Json | null
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
      active_issues: {
        Row: {
          category: string
          created_at: string
          first_detected: string
          id: string
          issue_message: string
          issue_severity: string
          issue_source: string
          issue_type: string
          last_seen: string
          status: string
          updated_at: string
        }
        Insert: {
          category: string
          created_at?: string
          first_detected?: string
          id?: string
          issue_message: string
          issue_severity: string
          issue_source: string
          issue_type: string
          last_seen?: string
          status?: string
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          first_detected?: string
          id?: string
          issue_message?: string
          issue_severity?: string
          issue_source?: string
          issue_type?: string
          last_seen?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      agent_actions: {
        Row: {
          agent_id: string | null
          ai_model_id: string | null
          average_duration_ms: number | null
          category: string
          created_at: string
          description: string | null
          estimated_duration: number | null
          execution_count: number | null
          id: string
          is_enabled: boolean | null
          last_executed_at: string | null
          mcp_server_id: string | null
          name: string
          parameters: Json | null
          priority: string
          requires_approval: boolean | null
          success_rate: number | null
          template_id: string | null
          type: string
          updated_at: string
        }
        Insert: {
          agent_id?: string | null
          ai_model_id?: string | null
          average_duration_ms?: number | null
          category?: string
          created_at?: string
          description?: string | null
          estimated_duration?: number | null
          execution_count?: number | null
          id?: string
          is_enabled?: boolean | null
          last_executed_at?: string | null
          mcp_server_id?: string | null
          name: string
          parameters?: Json | null
          priority?: string
          requires_approval?: boolean | null
          success_rate?: number | null
          template_id?: string | null
          type?: string
          updated_at?: string
        }
        Update: {
          agent_id?: string | null
          ai_model_id?: string | null
          average_duration_ms?: number | null
          category?: string
          created_at?: string
          description?: string | null
          estimated_duration?: number | null
          execution_count?: number | null
          id?: string
          is_enabled?: boolean | null
          last_executed_at?: string | null
          mcp_server_id?: string | null
          name?: string
          parameters?: Json | null
          priority?: string
          requires_approval?: boolean | null
          success_rate?: number | null
          template_id?: string | null
          type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "agent_actions_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agent_actions_ai_model_id_fkey"
            columns: ["ai_model_id"]
            isOneToOne: false
            referencedRelation: "ai_model_integrations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agent_actions_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "action_templates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_agent_actions_agent"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
        ]
      }
      agent_api_assignments: {
        Row: {
          agent_session_id: string
          api_configuration: Json | null
          assigned_api_service: string
          created_at: string | null
          id: string
          task_id: string
          task_type: string
          updated_at: string | null
        }
        Insert: {
          agent_session_id: string
          api_configuration?: Json | null
          assigned_api_service: string
          created_at?: string | null
          id?: string
          task_id: string
          task_type: string
          updated_at?: string | null
        }
        Update: {
          agent_session_id?: string
          api_configuration?: Json | null
          assigned_api_service?: string
          created_at?: string | null
          id?: string
          task_id?: string
          task_type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "agent_api_assignments_agent_session_id_fkey"
            columns: ["agent_session_id"]
            isOneToOne: false
            referencedRelation: "agent_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      agent_api_configurations: {
        Row: {
          agent_id: string
          api_service_id: string
          created_at: string | null
          data_access_scope: Json | null
          enabled_endpoints: string[] | null
          field_access_rules: Json | null
          id: string
          rate_limits: Json | null
          security_policies: Json | null
          transformation_rules: Json | null
          updated_at: string | null
          user_role: Database["public"]["Enums"]["user_role"]
        }
        Insert: {
          agent_id: string
          api_service_id: string
          created_at?: string | null
          data_access_scope?: Json | null
          enabled_endpoints?: string[] | null
          field_access_rules?: Json | null
          id?: string
          rate_limits?: Json | null
          security_policies?: Json | null
          transformation_rules?: Json | null
          updated_at?: string | null
          user_role: Database["public"]["Enums"]["user_role"]
        }
        Update: {
          agent_id?: string
          api_service_id?: string
          created_at?: string | null
          data_access_scope?: Json | null
          enabled_endpoints?: string[] | null
          field_access_rules?: Json | null
          id?: string
          rate_limits?: Json | null
          security_policies?: Json | null
          transformation_rules?: Json | null
          updated_at?: string | null
          user_role?: Database["public"]["Enums"]["user_role"]
        }
        Relationships: []
      }
      agent_audit_logs: {
        Row: {
          action_description: string
          action_type: string
          actor_type: string | null
          actor_user_id: string | null
          after_state: Json | null
          agent_id: string
          before_state: Json | null
          created_at: string | null
          execution_context: Json | null
          id: string
          ip_address: unknown | null
          user_agent: string | null
        }
        Insert: {
          action_description: string
          action_type: string
          actor_type?: string | null
          actor_user_id?: string | null
          after_state?: Json | null
          agent_id: string
          before_state?: Json | null
          created_at?: string | null
          execution_context?: Json | null
          id?: string
          ip_address?: unknown | null
          user_agent?: string | null
        }
        Update: {
          action_description?: string
          action_type?: string
          actor_type?: string | null
          actor_user_id?: string | null
          after_state?: Json | null
          agent_id?: string
          before_state?: Json | null
          created_at?: string | null
          execution_context?: Json | null
          id?: string
          ip_address?: unknown | null
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "agent_audit_logs_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
        ]
      }
      agent_channel_deployments: {
        Row: {
          agent_id: string
          assigned_at: string | null
          channel_id: string
          channel_type: string
          created_at: string | null
          created_by: string | null
          deployed_at: string | null
          deployment_config: Json | null
          deployment_status: string
          health_status: string | null
          id: string
          last_health_check: string | null
          max_concurrent_sessions: number | null
          performance_metrics: Json | null
          priority: number | null
          updated_at: string | null
        }
        Insert: {
          agent_id: string
          assigned_at?: string | null
          channel_id: string
          channel_type: string
          created_at?: string | null
          created_by?: string | null
          deployed_at?: string | null
          deployment_config?: Json | null
          deployment_status?: string
          health_status?: string | null
          id?: string
          last_health_check?: string | null
          max_concurrent_sessions?: number | null
          performance_metrics?: Json | null
          priority?: number | null
          updated_at?: string | null
        }
        Update: {
          agent_id?: string
          assigned_at?: string | null
          channel_id?: string
          channel_type?: string
          created_at?: string | null
          created_by?: string | null
          deployed_at?: string | null
          deployment_config?: Json | null
          deployment_status?: string
          health_status?: string | null
          id?: string
          last_health_check?: string | null
          max_concurrent_sessions?: number | null
          performance_metrics?: Json | null
          priority?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "agent_channel_deployments_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_agent_channel_deployments_agent"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
        ]
      }
      agent_communications: {
        Row: {
          conversation_id: string | null
          created_at: string | null
          from_agent_id: string
          id: string
          message_payload: Json
          message_type: string
          metadata: Json | null
          processed_at: string | null
          status: string | null
          to_agent_id: string | null
          workflow_execution_id: string | null
        }
        Insert: {
          conversation_id?: string | null
          created_at?: string | null
          from_agent_id: string
          id?: string
          message_payload: Json
          message_type: string
          metadata?: Json | null
          processed_at?: string | null
          status?: string | null
          to_agent_id?: string | null
          workflow_execution_id?: string | null
        }
        Update: {
          conversation_id?: string | null
          created_at?: string | null
          from_agent_id?: string
          id?: string
          message_payload?: Json
          message_type?: string
          metadata?: Json | null
          processed_at?: string | null
          status?: string | null
          to_agent_id?: string | null
          workflow_execution_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "agent_communications_from_agent_id_fkey"
            columns: ["from_agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agent_communications_to_agent_id_fkey"
            columns: ["to_agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
        ]
      }
      agent_compliance_monitoring: {
        Row: {
          agent_id: string
          auto_remediation_applied: boolean | null
          check_result: Json
          compliance_check_type: string
          conversation_id: string | null
          created_at: string
          id: string
          recommendations: Json | null
          remediation_actions: Json | null
          reviewed_at: string | null
          reviewed_by: string | null
          severity_level: string | null
          violations: Json | null
        }
        Insert: {
          agent_id: string
          auto_remediation_applied?: boolean | null
          check_result: Json
          compliance_check_type: string
          conversation_id?: string | null
          created_at?: string
          id?: string
          recommendations?: Json | null
          remediation_actions?: Json | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          severity_level?: string | null
          violations?: Json | null
        }
        Update: {
          agent_id?: string
          auto_remediation_applied?: boolean | null
          check_result?: Json
          compliance_check_type?: string
          conversation_id?: string | null
          created_at?: string
          id?: string
          recommendations?: Json | null
          remediation_actions?: Json | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          severity_level?: string | null
          violations?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "agent_compliance_monitoring_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "agent_conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      agent_conversation_engines: {
        Row: {
          agent_id: string
          conditions: Json | null
          conversation_engine_id: string
          created_at: string | null
          id: string
          is_active: boolean | null
          priority: number | null
          role: string
        }
        Insert: {
          agent_id: string
          conditions?: Json | null
          conversation_engine_id: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          priority?: number | null
          role: string
        }
        Update: {
          agent_id?: string
          conditions?: Json | null
          conversation_engine_id?: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          priority?: number | null
          role?: string
        }
        Relationships: [
          {
            foreignKeyName: "agent_conversation_engines_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agent_conversation_engines_conversation_engine_id_fkey"
            columns: ["conversation_engine_id"]
            isOneToOne: false
            referencedRelation: "conversation_engines"
            referencedColumns: ["id"]
          },
        ]
      }
      agent_conversations: {
        Row: {
          agent_id: string
          conversation_data: Json
          created_at: string
          current_journey_stage_id: string | null
          healthcare_context: Json | null
          id: string
          journey_completed_at: string | null
          journey_context: Json | null
          journey_started_at: string | null
          metadata: Json | null
          session_id: string
          status: string
          title: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          agent_id: string
          conversation_data?: Json
          created_at?: string
          current_journey_stage_id?: string | null
          healthcare_context?: Json | null
          id?: string
          journey_completed_at?: string | null
          journey_context?: Json | null
          journey_started_at?: string | null
          metadata?: Json | null
          session_id: string
          status?: string
          title?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          agent_id?: string
          conversation_data?: Json
          created_at?: string
          current_journey_stage_id?: string | null
          healthcare_context?: Json | null
          id?: string
          journey_completed_at?: string | null
          journey_context?: Json | null
          journey_started_at?: string | null
          metadata?: Json | null
          session_id?: string
          status?: string
          title?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_agent_conversations_agent"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
        ]
      }
      agent_health_checks: {
        Row: {
          agent_id: string
          check_result: Json
          check_type: string
          checked_by: string | null
          created_at: string | null
          error_details: Json | null
          health_status: string
          id: string
          response_time_ms: number | null
        }
        Insert: {
          agent_id: string
          check_result: Json
          check_type: string
          checked_by?: string | null
          created_at?: string | null
          error_details?: Json | null
          health_status?: string
          id?: string
          response_time_ms?: number | null
        }
        Update: {
          agent_id?: string
          check_result?: Json
          check_type?: string
          checked_by?: string | null
          created_at?: string | null
          error_details?: Json | null
          health_status?: string
          id?: string
          response_time_ms?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "agent_health_checks_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
        ]
      }
      agent_knowledge_bases: {
        Row: {
          agent_id: string
          created_at: string
          id: string
          is_primary: boolean | null
          knowledge_base_id: string
        }
        Insert: {
          agent_id: string
          created_at?: string
          id?: string
          is_primary?: boolean | null
          knowledge_base_id: string
        }
        Update: {
          agent_id?: string
          created_at?: string
          id?: string
          is_primary?: boolean | null
          knowledge_base_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "agent_knowledge_bases_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agent_knowledge_bases_knowledge_base_id_fkey"
            columns: ["knowledge_base_id"]
            isOneToOne: false
            referencedRelation: "knowledge_base"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_agent_knowledge_bases_agent"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
        ]
      }
      agent_lifecycle_states: {
        Row: {
          agent_id: string
          change_summary: string | null
          created_at: string | null
          created_by: string | null
          deployed_at: string | null
          deployment_config: Json | null
          health_check_config: Json | null
          id: string
          metadata: Json | null
          retired_at: string | null
          rollback_config: Json | null
          status: string
          version: string
        }
        Insert: {
          agent_id: string
          change_summary?: string | null
          created_at?: string | null
          created_by?: string | null
          deployed_at?: string | null
          deployment_config?: Json | null
          health_check_config?: Json | null
          id?: string
          metadata?: Json | null
          retired_at?: string | null
          rollback_config?: Json | null
          status: string
          version?: string
        }
        Update: {
          agent_id?: string
          change_summary?: string | null
          created_at?: string | null
          created_by?: string | null
          deployed_at?: string | null
          deployment_config?: Json | null
          health_check_config?: Json | null
          id?: string
          metadata?: Json | null
          retired_at?: string | null
          rollback_config?: Json | null
          status?: string
          version?: string
        }
        Relationships: [
          {
            foreignKeyName: "agent_lifecycle_states_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
        ]
      }
      agent_node_deployments: {
        Row: {
          agent_configuration: Json
          agent_id: string
          created_at: string | null
          deployed_by: string | null
          deployment_metadata: Json | null
          deployment_status: string
          execution_context: Json | null
          id: string
          node_configuration: Json
          updated_at: string | null
          workflow_node_id: string
        }
        Insert: {
          agent_configuration?: Json
          agent_id: string
          created_at?: string | null
          deployed_by?: string | null
          deployment_metadata?: Json | null
          deployment_status?: string
          execution_context?: Json | null
          id?: string
          node_configuration?: Json
          updated_at?: string | null
          workflow_node_id: string
        }
        Update: {
          agent_configuration?: Json
          agent_id?: string
          created_at?: string | null
          deployed_by?: string | null
          deployment_metadata?: Json | null
          deployment_status?: string
          execution_context?: Json | null
          id?: string
          node_configuration?: Json
          updated_at?: string | null
          workflow_node_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "agent_node_deployments_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
        ]
      }
      agent_organization_mapping: {
        Row: {
          agent_id: string
          business_unit: string | null
          created_at: string
          department: string | null
          facility_id: string | null
          id: string
          organization_id: string | null
        }
        Insert: {
          agent_id: string
          business_unit?: string | null
          created_at?: string
          department?: string | null
          facility_id?: string | null
          id?: string
          organization_id?: string | null
        }
        Update: {
          agent_id?: string
          business_unit?: string | null
          created_at?: string
          department?: string | null
          facility_id?: string | null
          id?: string
          organization_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "agent_organization_mapping_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_agent_organization_mapping_agent"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
        ]
      }
      agent_performance_metrics: {
        Row: {
          agent_id: string
          execution_context: Json | null
          id: string
          measurement_timestamp: string | null
          metadata: Json | null
          metric_type: string
          metric_unit: string
          metric_value: number
        }
        Insert: {
          agent_id: string
          execution_context?: Json | null
          id?: string
          measurement_timestamp?: string | null
          metadata?: Json | null
          metric_type: string
          metric_unit?: string
          metric_value: number
        }
        Update: {
          agent_id?: string
          execution_context?: Json | null
          id?: string
          measurement_timestamp?: string | null
          metadata?: Json | null
          metric_type?: string
          metric_unit?: string
          metric_value?: number
        }
        Relationships: [
          {
            foreignKeyName: "agent_performance_metrics_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
        ]
      }
      agent_permissions: {
        Row: {
          agent_id: string
          expires_at: string | null
          granted_at: string | null
          granted_by: string | null
          id: string
          is_active: boolean | null
          permission_scope: Json | null
          permission_type: string
          resource_identifier: string | null
          resource_type: string
        }
        Insert: {
          agent_id: string
          expires_at?: string | null
          granted_at?: string | null
          granted_by?: string | null
          id?: string
          is_active?: boolean | null
          permission_scope?: Json | null
          permission_type: string
          resource_identifier?: string | null
          resource_type: string
        }
        Update: {
          agent_id?: string
          expires_at?: string | null
          granted_at?: string | null
          granted_by?: string | null
          id?: string
          is_active?: boolean | null
          permission_scope?: Json | null
          permission_type?: string
          resource_identifier?: string | null
          resource_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "agent_permissions_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
        ]
      }
      agent_session_tasks: {
        Row: {
          action_id: string
          ai_model_id: string | null
          created_at: string
          expected_outputs: Json | null
          id: string
          is_critical: boolean | null
          mcp_server_id: string | null
          required_inputs: Json | null
          retry_attempts: number | null
          session_id: string
          task_description: string | null
          task_name: string
          task_order: number
          task_type: string
          timeout_minutes: number | null
          updated_at: string
          validation_rules: Json | null
        }
        Insert: {
          action_id: string
          ai_model_id?: string | null
          created_at?: string
          expected_outputs?: Json | null
          id?: string
          is_critical?: boolean | null
          mcp_server_id?: string | null
          required_inputs?: Json | null
          retry_attempts?: number | null
          session_id: string
          task_description?: string | null
          task_name: string
          task_order?: number
          task_type: string
          timeout_minutes?: number | null
          updated_at?: string
          validation_rules?: Json | null
        }
        Update: {
          action_id?: string
          ai_model_id?: string | null
          created_at?: string
          expected_outputs?: Json | null
          id?: string
          is_critical?: boolean | null
          mcp_server_id?: string | null
          required_inputs?: Json | null
          retry_attempts?: number | null
          session_id?: string
          task_description?: string | null
          task_name?: string
          task_order?: number
          task_type?: string
          timeout_minutes?: number | null
          updated_at?: string
          validation_rules?: Json | null
        }
        Relationships: []
      }
      agent_sessions: {
        Row: {
          actions: Json | null
          agent_brand: string | null
          agent_description: string | null
          agent_name: string | null
          agent_purpose: string | null
          agent_use_case: string | null
          basic_info: Json | null
          canvas: Json | null
          connectors: Json | null
          created_at: string
          current_step: string
          deployment: Json | null
          description: string | null
          id: string
          knowledge: Json | null
          name: string
          rag: Json | null
          status: string
          template_id: string | null
          template_type: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          actions?: Json | null
          agent_brand?: string | null
          agent_description?: string | null
          agent_name?: string | null
          agent_purpose?: string | null
          agent_use_case?: string | null
          basic_info?: Json | null
          canvas?: Json | null
          connectors?: Json | null
          created_at?: string
          current_step?: string
          deployment?: Json | null
          description?: string | null
          id?: string
          knowledge?: Json | null
          name: string
          rag?: Json | null
          status?: string
          template_id?: string | null
          template_type?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          actions?: Json | null
          agent_brand?: string | null
          agent_description?: string | null
          agent_name?: string | null
          agent_purpose?: string | null
          agent_use_case?: string | null
          basic_info?: Json | null
          canvas?: Json | null
          connectors?: Json | null
          created_at?: string
          current_step?: string
          deployment?: Json | null
          description?: string | null
          id?: string
          knowledge?: Json | null
          name?: string
          rag?: Json | null
          status?: string
          template_id?: string | null
          template_type?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_agent_sessions_template"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "agent_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      agent_template_journey_stages: {
        Row: {
          created_at: string
          dependencies: Json | null
          description: string | null
          entry_criteria: Json | null
          expected_duration_minutes: number | null
          id: string
          order_index: number
          outputs_success_criteria: Json | null
          owner_role: string | null
          risks: Json | null
          sla: Json | null
          tasks_checklist: Json | null
          template_id: string
          title: string
          updated_at: string
          validation_checkpoints: Json | null
        }
        Insert: {
          created_at?: string
          dependencies?: Json | null
          description?: string | null
          entry_criteria?: Json | null
          expected_duration_minutes?: number | null
          id?: string
          order_index?: number
          outputs_success_criteria?: Json | null
          owner_role?: string | null
          risks?: Json | null
          sla?: Json | null
          tasks_checklist?: Json | null
          template_id: string
          title: string
          updated_at?: string
          validation_checkpoints?: Json | null
        }
        Update: {
          created_at?: string
          dependencies?: Json | null
          description?: string | null
          entry_criteria?: Json | null
          expected_duration_minutes?: number | null
          id?: string
          order_index?: number
          outputs_success_criteria?: Json | null
          owner_role?: string | null
          risks?: Json | null
          sla?: Json | null
          tasks_checklist?: Json | null
          template_id?: string
          title?: string
          updated_at?: string
          validation_checkpoints?: Json | null
        }
        Relationships: []
      }
      agent_template_versions: {
        Row: {
          changelog: string | null
          configuration: Json
          created_at: string | null
          created_by: string | null
          id: string
          is_stable: boolean | null
          template_id: string
          version: string
        }
        Insert: {
          changelog?: string | null
          configuration: Json
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_stable?: boolean | null
          template_id: string
          version: string
        }
        Update: {
          changelog?: string | null
          configuration?: Json
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_stable?: boolean | null
          template_id?: string
          version?: string
        }
        Relationships: [
          {
            foreignKeyName: "agent_template_versions_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "agent_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      agent_templates: {
        Row: {
          accent_color: string | null
          configuration: Json | null
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          is_default: boolean | null
          journey_stages: Json
          logo_url: string | null
          name: string
          primary_color: string | null
          secondary_color: string | null
          tagline: string | null
          template_type: string
          updated_at: string
        }
        Insert: {
          accent_color?: string | null
          configuration?: Json | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_default?: boolean | null
          journey_stages?: Json
          logo_url?: string | null
          name: string
          primary_color?: string | null
          secondary_color?: string | null
          tagline?: string | null
          template_type?: string
          updated_at?: string
        }
        Update: {
          accent_color?: string | null
          configuration?: Json | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_default?: boolean | null
          journey_stages?: Json
          logo_url?: string | null
          name?: string
          primary_color?: string | null
          secondary_color?: string | null
          tagline?: string | null
          template_type?: string
          updated_at?: string
        }
        Relationships: []
      }
      agent_test_runs: {
        Row: {
          agent_id: string
          avg_accuracy: number | null
          avg_response_time_ms: number | null
          created_by: string | null
          end_time: string | null
          error_logs: Json | null
          id: string
          model_config_id: string
          performance_metrics: Json | null
          processed_samples: number | null
          resource_usage: Json | null
          results: Json | null
          start_time: string | null
          status: string | null
          success_rate: number | null
          test_dataset_id: string
          test_name: string
          total_samples: number | null
        }
        Insert: {
          agent_id: string
          avg_accuracy?: number | null
          avg_response_time_ms?: number | null
          created_by?: string | null
          end_time?: string | null
          error_logs?: Json | null
          id?: string
          model_config_id: string
          performance_metrics?: Json | null
          processed_samples?: number | null
          resource_usage?: Json | null
          results?: Json | null
          start_time?: string | null
          status?: string | null
          success_rate?: number | null
          test_dataset_id: string
          test_name: string
          total_samples?: number | null
        }
        Update: {
          agent_id?: string
          avg_accuracy?: number | null
          avg_response_time_ms?: number | null
          created_by?: string | null
          end_time?: string | null
          error_logs?: Json | null
          id?: string
          model_config_id?: string
          performance_metrics?: Json | null
          processed_samples?: number | null
          resource_usage?: Json | null
          results?: Json | null
          start_time?: string | null
          status?: string | null
          success_rate?: number | null
          test_dataset_id?: string
          test_name?: string
          total_samples?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "agent_test_runs_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agent_test_runs_model_config_id_fkey"
            columns: ["model_config_id"]
            isOneToOne: false
            referencedRelation: "ai_model_configs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agent_test_runs_test_dataset_id_fkey"
            columns: ["test_dataset_id"]
            isOneToOne: false
            referencedRelation: "test_datasets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_agent_test_runs_agent"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
        ]
      }
      agent_user_associations: {
        Row: {
          access_level: string | null
          agent_id: string
          created_at: string
          id: string
          role: string
          updated_at: string
          user_id: string
        }
        Insert: {
          access_level?: string | null
          agent_id: string
          created_at?: string
          id?: string
          role: string
          updated_at?: string
          user_id: string
        }
        Update: {
          access_level?: string | null
          agent_id?: string
          created_at?: string
          id?: string
          role?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "agent_user_associations_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_agent_user_associations_agent"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
        ]
      }
      agent_workflows: {
        Row: {
          agent_session_id: string | null
          created_at: string
          created_by: string
          description: string | null
          id: string
          metadata: Json | null
          name: string
          status: string
          template_id: string | null
          updated_at: string
          version: number
          workflow_data: Json
        }
        Insert: {
          agent_session_id?: string | null
          created_at?: string
          created_by: string
          description?: string | null
          id?: string
          metadata?: Json | null
          name: string
          status?: string
          template_id?: string | null
          updated_at?: string
          version?: number
          workflow_data?: Json
        }
        Update: {
          agent_session_id?: string | null
          created_at?: string
          created_by?: string
          description?: string | null
          id?: string
          metadata?: Json | null
          name?: string
          status?: string
          template_id?: string | null
          updated_at?: string
          version?: number
          workflow_data?: Json
        }
        Relationships: [
          {
            foreignKeyName: "agent_workflows_agent_session_id_fkey"
            columns: ["agent_session_id"]
            isOneToOne: false
            referencedRelation: "agent_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agent_workflows_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "agent_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      agents: {
        Row: {
          agent_type: string | null
          api_rate_limit: number | null
          brand: string | null
          business_units: string[] | null
          categories: string[] | null
          configuration: Json | null
          created_at: string
          created_by: string | null
          deployment_config: Json | null
          description: string | null
          enabled_features: string[] | null
          facility_id: string | null
          id: string
          max_tokens: number | null
          model_name: string | null
          model_provider: string | null
          name: string
          organization_id: string | null
          purpose: string | null
          status: string | null
          system_prompt: string | null
          temperature: number | null
          template_id: string | null
          timeout_seconds: number | null
          topics: string[] | null
          updated_at: string
          use_case: string | null
        }
        Insert: {
          agent_type?: string | null
          api_rate_limit?: number | null
          brand?: string | null
          business_units?: string[] | null
          categories?: string[] | null
          configuration?: Json | null
          created_at?: string
          created_by?: string | null
          deployment_config?: Json | null
          description?: string | null
          enabled_features?: string[] | null
          facility_id?: string | null
          id?: string
          max_tokens?: number | null
          model_name?: string | null
          model_provider?: string | null
          name: string
          organization_id?: string | null
          purpose?: string | null
          status?: string | null
          system_prompt?: string | null
          temperature?: number | null
          template_id?: string | null
          timeout_seconds?: number | null
          topics?: string[] | null
          updated_at?: string
          use_case?: string | null
        }
        Update: {
          agent_type?: string | null
          api_rate_limit?: number | null
          brand?: string | null
          business_units?: string[] | null
          categories?: string[] | null
          configuration?: Json | null
          created_at?: string
          created_by?: string | null
          deployment_config?: Json | null
          description?: string | null
          enabled_features?: string[] | null
          facility_id?: string | null
          id?: string
          max_tokens?: number | null
          model_name?: string | null
          model_provider?: string | null
          name?: string
          organization_id?: string | null
          purpose?: string | null
          status?: string | null
          system_prompt?: string | null
          temperature?: number | null
          template_id?: string | null
          timeout_seconds?: number | null
          topics?: string[] | null
          updated_at?: string
          use_case?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "agents_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "agent_templates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_agents_template"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "agent_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_model_configs: {
        Row: {
          configuration: Json | null
          cost_per_request: number | null
          created_at: string | null
          id: string
          is_active: boolean | null
          max_concurrent_requests: number | null
          model_id: string
          model_type: string
          name: string
          performance_tier: string | null
          provider: string
          updated_at: string | null
        }
        Insert: {
          configuration?: Json | null
          cost_per_request?: number | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          max_concurrent_requests?: number | null
          model_id: string
          model_type: string
          name: string
          performance_tier?: string | null
          provider: string
          updated_at?: string | null
        }
        Update: {
          configuration?: Json | null
          cost_per_request?: number | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          max_concurrent_requests?: number | null
          model_id?: string
          model_type?: string
          name?: string
          performance_tier?: string | null
          provider?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      ai_model_integrations: {
        Row: {
          api_endpoint: string | null
          api_key_reference: string | null
          capabilities: string[] | null
          created_at: string
          healthcare_specialization: string[] | null
          id: string
          is_active: boolean
          max_context_length: number | null
          model_config: Json
          model_type: string
          name: string
          provider: string
          supports_function_calling: boolean | null
          supports_vision: boolean | null
          updated_at: string
        }
        Insert: {
          api_endpoint?: string | null
          api_key_reference?: string | null
          capabilities?: string[] | null
          created_at?: string
          healthcare_specialization?: string[] | null
          id?: string
          is_active?: boolean
          max_context_length?: number | null
          model_config: Json
          model_type: string
          name: string
          provider: string
          supports_function_calling?: boolean | null
          supports_vision?: boolean | null
          updated_at?: string
        }
        Update: {
          api_endpoint?: string | null
          api_key_reference?: string | null
          capabilities?: string[] | null
          created_at?: string
          healthcare_specialization?: string[] | null
          id?: string
          is_active?: boolean
          max_context_length?: number | null
          model_config?: Json
          model_type?: string
          name?: string
          provider?: string
          supports_function_calling?: boolean | null
          supports_vision?: boolean | null
          updated_at?: string
        }
        Relationships: []
      }
      ai_workflow_traces: {
        Row: {
          agent_id: string | null
          conversation_id: string | null
          created_at: string
          duration_ms: number | null
          end_time: string | null
          id: string
          logs: Json | null
          metadata: Json | null
          operation_name: string
          parent_span_id: string | null
          span_id: string | null
          start_time: string
          status: string | null
          tags: Json | null
          trace_id: string
          user_id: string
        }
        Insert: {
          agent_id?: string | null
          conversation_id?: string | null
          created_at?: string
          duration_ms?: number | null
          end_time?: string | null
          id?: string
          logs?: Json | null
          metadata?: Json | null
          operation_name: string
          parent_span_id?: string | null
          span_id?: string | null
          start_time?: string
          status?: string | null
          tags?: Json | null
          trace_id: string
          user_id: string
        }
        Update: {
          agent_id?: string | null
          conversation_id?: string | null
          created_at?: string
          duration_ms?: number | null
          end_time?: string | null
          id?: string
          logs?: Json | null
          metadata?: Json | null
          operation_name?: string
          parent_span_id?: string | null
          span_id?: string | null
          start_time?: string
          status?: string | null
          tags?: Json | null
          trace_id?: string
          user_id?: string
        }
        Relationships: []
      }
      alternative_solutions: {
        Row: {
          category: string
          complexity_level: string | null
          contact_info: Json | null
          created_at: string | null
          description: string | null
          external_url: string | null
          id: string
          implementation_time: string | null
          is_active: boolean | null
          name: string
          pricing_info: string | null
          suitability_criteria: Json
          updated_at: string | null
        }
        Insert: {
          category: string
          complexity_level?: string | null
          contact_info?: Json | null
          created_at?: string | null
          description?: string | null
          external_url?: string | null
          id?: string
          implementation_time?: string | null
          is_active?: boolean | null
          name: string
          pricing_info?: string | null
          suitability_criteria?: Json
          updated_at?: string | null
        }
        Update: {
          category?: string
          complexity_level?: string | null
          contact_info?: Json | null
          created_at?: string | null
          description?: string | null
          external_url?: string | null
          id?: string
          implementation_time?: string | null
          is_active?: boolean | null
          name?: string
          pricing_info?: string | null
          suitability_criteria?: Json
          updated_at?: string | null
        }
        Relationships: []
      }
      api_consumption_logs: {
        Row: {
          api_integration_id: string
          consumer_id: string | null
          endpoint_path: string
          error_details: Json | null
          id: string
          ip_address: unknown | null
          method: string
          request_size_bytes: number | null
          request_timestamp: string
          response_size_bytes: number | null
          response_status: number | null
          response_time_ms: number | null
          user_agent: string | null
        }
        Insert: {
          api_integration_id: string
          consumer_id?: string | null
          endpoint_path: string
          error_details?: Json | null
          id?: string
          ip_address?: unknown | null
          method: string
          request_size_bytes?: number | null
          request_timestamp?: string
          response_size_bytes?: number | null
          response_status?: number | null
          response_time_ms?: number | null
          user_agent?: string | null
        }
        Update: {
          api_integration_id?: string
          consumer_id?: string | null
          endpoint_path?: string
          error_details?: Json | null
          id?: string
          ip_address?: unknown | null
          method?: string
          request_size_bytes?: number | null
          request_timestamp?: string
          response_size_bytes?: number | null
          response_status?: number | null
          response_time_ms?: number | null
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "api_consumption_logs_api_integration_id_fkey"
            columns: ["api_integration_id"]
            isOneToOne: false
            referencedRelation: "api_integration_registry"
            referencedColumns: ["id"]
          },
        ]
      }
      api_documentation: {
        Row: {
          api_integration_id: string | null
          audience: string | null
          content: string | null
          created_at: string | null
          doc_type: string
          format: string | null
          id: string
          is_public: boolean | null
          metadata: Json | null
          order_index: number | null
          title: string
          updated_at: string | null
          version: string | null
        }
        Insert: {
          api_integration_id?: string | null
          audience?: string | null
          content?: string | null
          created_at?: string | null
          doc_type: string
          format?: string | null
          id?: string
          is_public?: boolean | null
          metadata?: Json | null
          order_index?: number | null
          title: string
          updated_at?: string | null
          version?: string | null
        }
        Update: {
          api_integration_id?: string | null
          audience?: string | null
          content?: string | null
          created_at?: string | null
          doc_type?: string
          format?: string | null
          id?: string
          is_public?: boolean | null
          metadata?: Json | null
          order_index?: number | null
          title?: string
          updated_at?: string | null
          version?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "api_documentation_api_integration_id_fkey"
            columns: ["api_integration_id"]
            isOneToOne: false
            referencedRelation: "api_integration_registry"
            referencedColumns: ["id"]
          },
        ]
      }
      api_endpoints: {
        Row: {
          api_integration_id: string | null
          category: string
          created_at: string | null
          description: string | null
          documentation_url: string | null
          endpoint_path: string
          example_request: Json | null
          example_response: Json | null
          id: string
          is_public: boolean | null
          method: string
          postman_collection_id: string | null
          rate_limit_config: Json | null
          request_schema: Json | null
          requires_authentication: boolean | null
          response_schema: Json | null
          sandbox_available: boolean | null
          testing_status: string | null
          updated_at: string | null
        }
        Insert: {
          api_integration_id?: string | null
          category: string
          created_at?: string | null
          description?: string | null
          documentation_url?: string | null
          endpoint_path: string
          example_request?: Json | null
          example_response?: Json | null
          id?: string
          is_public?: boolean | null
          method: string
          postman_collection_id?: string | null
          rate_limit_config?: Json | null
          request_schema?: Json | null
          requires_authentication?: boolean | null
          response_schema?: Json | null
          sandbox_available?: boolean | null
          testing_status?: string | null
          updated_at?: string | null
        }
        Update: {
          api_integration_id?: string | null
          category?: string
          created_at?: string | null
          description?: string | null
          documentation_url?: string | null
          endpoint_path?: string
          example_request?: Json | null
          example_response?: Json | null
          id?: string
          is_public?: boolean | null
          method?: string
          postman_collection_id?: string | null
          rate_limit_config?: Json | null
          request_schema?: Json | null
          requires_authentication?: boolean | null
          response_schema?: Json | null
          sandbox_available?: boolean | null
          testing_status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "api_endpoints_api_integration_id_fkey"
            columns: ["api_integration_id"]
            isOneToOne: false
            referencedRelation: "api_integration_registry"
            referencedColumns: ["id"]
          },
        ]
      }
      api_field_mappings: {
        Row: {
          api_field: string
          created_at: string | null
          data_type: string
          database_column: string
          id: string
          is_required: boolean | null
          role_visibility: Database["public"]["Enums"]["user_role"][] | null
          table_name: string
          transformation_rule: string | null
          updated_at: string | null
          validation_rule: string | null
        }
        Insert: {
          api_field: string
          created_at?: string | null
          data_type: string
          database_column: string
          id?: string
          is_required?: boolean | null
          role_visibility?: Database["public"]["Enums"]["user_role"][] | null
          table_name: string
          transformation_rule?: string | null
          updated_at?: string | null
          validation_rule?: string | null
        }
        Update: {
          api_field?: string
          created_at?: string | null
          data_type?: string
          database_column?: string
          id?: string
          is_required?: boolean | null
          role_visibility?: Database["public"]["Enums"]["user_role"][] | null
          table_name?: string
          transformation_rule?: string | null
          updated_at?: string | null
          validation_rule?: string | null
        }
        Relationships: []
      }
      api_integration_registry: {
        Row: {
          base_url: string | null
          category: string
          contact_email: string | null
          contact_info: Json | null
          contact_name: string | null
          contact_phone: string | null
          created_at: string
          created_by: string | null
          data_mappings_count: number | null
          description: string | null
          direction: string
          documentation_url: string | null
          endpoints_count: number | null
          id: string
          last_modified_by: string | null
          lifecycle_stage: string
          name: string
          purpose: string
          rate_limit_requests_per_hour: number | null
          rate_limit_requests_per_minute: number | null
          rate_limits: Json | null
          requires_approval: boolean | null
          requires_authentication: boolean | null
          rls_policies_count: number | null
          security_requirements: Json | null
          sla_requirements: Json | null
          sla_response_time_ms: number | null
          sla_uptime_percentage: number | null
          status: string
          type: string
          updated_at: string
          version: string
          webhook_config: Json | null
          webhook_secret: string | null
          webhook_url: string | null
        }
        Insert: {
          base_url?: string | null
          category: string
          contact_email?: string | null
          contact_info?: Json | null
          contact_name?: string | null
          contact_phone?: string | null
          created_at?: string
          created_by?: string | null
          data_mappings_count?: number | null
          description?: string | null
          direction: string
          documentation_url?: string | null
          endpoints_count?: number | null
          id?: string
          last_modified_by?: string | null
          lifecycle_stage?: string
          name: string
          purpose: string
          rate_limit_requests_per_hour?: number | null
          rate_limit_requests_per_minute?: number | null
          rate_limits?: Json | null
          requires_approval?: boolean | null
          requires_authentication?: boolean | null
          rls_policies_count?: number | null
          security_requirements?: Json | null
          sla_requirements?: Json | null
          sla_response_time_ms?: number | null
          sla_uptime_percentage?: number | null
          status?: string
          type: string
          updated_at?: string
          version?: string
          webhook_config?: Json | null
          webhook_secret?: string | null
          webhook_url?: string | null
        }
        Update: {
          base_url?: string | null
          category?: string
          contact_email?: string | null
          contact_info?: Json | null
          contact_name?: string | null
          contact_phone?: string | null
          created_at?: string
          created_by?: string | null
          data_mappings_count?: number | null
          description?: string | null
          direction?: string
          documentation_url?: string | null
          endpoints_count?: number | null
          id?: string
          last_modified_by?: string | null
          lifecycle_stage?: string
          name?: string
          purpose?: string
          rate_limit_requests_per_hour?: number | null
          rate_limit_requests_per_minute?: number | null
          rate_limits?: Json | null
          requires_approval?: boolean | null
          requires_authentication?: boolean | null
          rls_policies_count?: number | null
          security_requirements?: Json | null
          sla_requirements?: Json | null
          sla_response_time_ms?: number | null
          sla_uptime_percentage?: number | null
          status?: string
          type?: string
          updated_at?: string
          version?: string
          webhook_config?: Json | null
          webhook_secret?: string | null
          webhook_url?: string | null
        }
        Relationships: []
      }
      api_keys: {
        Row: {
          created_at: string
          expires_at: string | null
          id: string
          ip_whitelist: string[] | null
          key_hash: string
          key_prefix: string
          last_used: string | null
          modules: string[]
          name: string
          permissions: string[]
          rate_limit_period: string
          rate_limit_requests: number
          status: string
          type: string
          updated_at: string
          usage_count: number
          user_id: string
        }
        Insert: {
          created_at?: string
          expires_at?: string | null
          id?: string
          ip_whitelist?: string[] | null
          key_hash: string
          key_prefix: string
          last_used?: string | null
          modules?: string[]
          name: string
          permissions?: string[]
          rate_limit_period?: string
          rate_limit_requests?: number
          status?: string
          type: string
          updated_at?: string
          usage_count?: number
          user_id: string
        }
        Update: {
          created_at?: string
          expires_at?: string | null
          id?: string
          ip_whitelist?: string[] | null
          key_hash?: string
          key_prefix?: string
          last_used?: string | null
          modules?: string[]
          name?: string
          permissions?: string[]
          rate_limit_period?: string
          rate_limit_requests?: number
          status?: string
          type?: string
          updated_at?: string
          usage_count?: number
          user_id?: string
        }
        Relationships: []
      }
      api_lifecycle_events: {
        Row: {
          api_integration_id: string
          created_at: string
          created_by: string | null
          description: string
          event_type: string
          from_stage: string | null
          id: string
          impact_level: string
          metadata: Json | null
          migration_instructions: string | null
          requires_migration: boolean | null
          to_stage: string | null
        }
        Insert: {
          api_integration_id: string
          created_at?: string
          created_by?: string | null
          description: string
          event_type: string
          from_stage?: string | null
          id?: string
          impact_level?: string
          metadata?: Json | null
          migration_instructions?: string | null
          requires_migration?: boolean | null
          to_stage?: string | null
        }
        Update: {
          api_integration_id?: string
          created_at?: string
          created_by?: string | null
          description?: string
          event_type?: string
          from_stage?: string | null
          id?: string
          impact_level?: string
          metadata?: Json | null
          migration_instructions?: string | null
          requires_migration?: boolean | null
          to_stage?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "api_lifecycle_events_api_integration_id_fkey"
            columns: ["api_integration_id"]
            isOneToOne: false
            referencedRelation: "api_integration_registry"
            referencedColumns: ["id"]
          },
        ]
      }
      api_mapping_fields: {
        Row: {
          api_integration_id: string | null
          created_at: string | null
          data_sensitivity: string | null
          default_value: string | null
          field_category: string | null
          field_type: string
          id: string
          is_required: boolean | null
          mapping_direction: string | null
          source_field: string
          target_field: string
          transformation_rule: string | null
          updated_at: string | null
          validation_rules: Json | null
        }
        Insert: {
          api_integration_id?: string | null
          created_at?: string | null
          data_sensitivity?: string | null
          default_value?: string | null
          field_category?: string | null
          field_type: string
          id?: string
          is_required?: boolean | null
          mapping_direction?: string | null
          source_field: string
          target_field: string
          transformation_rule?: string | null
          updated_at?: string | null
          validation_rules?: Json | null
        }
        Update: {
          api_integration_id?: string | null
          created_at?: string | null
          data_sensitivity?: string | null
          default_value?: string | null
          field_category?: string | null
          field_type?: string
          id?: string
          is_required?: boolean | null
          mapping_direction?: string | null
          source_field?: string
          target_field?: string
          transformation_rule?: string | null
          updated_at?: string | null
          validation_rules?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "api_mapping_fields_api_integration_id_fkey"
            columns: ["api_integration_id"]
            isOneToOne: false
            referencedRelation: "api_integration_registry"
            referencedColumns: ["id"]
          },
        ]
      }
      api_service_configurations: {
        Row: {
          agent_id: string | null
          api_endpoint: string | null
          api_key_header: string | null
          auth_type: string | null
          configuration: Json
          created_at: string
          credentials: Json | null
          environment: string | null
          health_status: string | null
          id: string
          is_active: boolean
          last_health_check: string | null
          rate_limit: number | null
          retry_attempts: number | null
          service_name: string
          service_type: string
          timeout_ms: number | null
          updated_at: string
        }
        Insert: {
          agent_id?: string | null
          api_endpoint?: string | null
          api_key_header?: string | null
          auth_type?: string | null
          configuration?: Json
          created_at?: string
          credentials?: Json | null
          environment?: string | null
          health_status?: string | null
          id?: string
          is_active?: boolean
          last_health_check?: string | null
          rate_limit?: number | null
          retry_attempts?: number | null
          service_name: string
          service_type: string
          timeout_ms?: number | null
          updated_at?: string
        }
        Update: {
          agent_id?: string | null
          api_endpoint?: string | null
          api_key_header?: string | null
          auth_type?: string | null
          configuration?: Json
          created_at?: string
          credentials?: Json | null
          environment?: string | null
          health_status?: string | null
          id?: string
          is_active?: boolean
          last_health_check?: string | null
          rate_limit?: number | null
          retry_attempts?: number | null
          service_name?: string
          service_type?: string
          timeout_ms?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      api_testing_configs: {
        Row: {
          api_integration_id: string | null
          config_name: string
          created_at: string | null
          expected_results: Json | null
          id: string
          is_active: boolean | null
          postman_collection: Json | null
          sandbox_config: Json | null
          test_parameters: Json | null
          testing_type: string
          updated_at: string | null
        }
        Insert: {
          api_integration_id?: string | null
          config_name: string
          created_at?: string | null
          expected_results?: Json | null
          id?: string
          is_active?: boolean | null
          postman_collection?: Json | null
          sandbox_config?: Json | null
          test_parameters?: Json | null
          testing_type: string
          updated_at?: string | null
        }
        Update: {
          api_integration_id?: string | null
          config_name?: string
          created_at?: string | null
          expected_results?: Json | null
          id?: string
          is_active?: boolean | null
          postman_collection?: Json | null
          sandbox_config?: Json | null
          test_parameters?: Json | null
          testing_type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "api_testing_configs_api_integration_id_fkey"
            columns: ["api_integration_id"]
            isOneToOne: false
            referencedRelation: "api_integration_registry"
            referencedColumns: ["id"]
          },
        ]
      }
      api_usage_analytics: {
        Row: {
          api_key_id: string | null
          country_code: string | null
          endpoint_path: string
          error_message: string | null
          external_api_id: string
          id: string
          ip_address: unknown | null
          method: string
          rate_limited: boolean | null
          request_size_bytes: number | null
          response_size_bytes: number | null
          response_time_ms: number | null
          status_code: number
          timestamp: string
          user_agent: string | null
        }
        Insert: {
          api_key_id?: string | null
          country_code?: string | null
          endpoint_path: string
          error_message?: string | null
          external_api_id: string
          id?: string
          ip_address?: unknown | null
          method: string
          rate_limited?: boolean | null
          request_size_bytes?: number | null
          response_size_bytes?: number | null
          response_time_ms?: number | null
          status_code: number
          timestamp?: string
          user_agent?: string | null
        }
        Update: {
          api_key_id?: string | null
          country_code?: string | null
          endpoint_path?: string
          error_message?: string | null
          external_api_id?: string
          id?: string
          ip_address?: unknown | null
          method?: string
          rate_limited?: boolean | null
          request_size_bytes?: number | null
          response_size_bytes?: number | null
          response_time_ms?: number | null
          status_code?: number
          timestamp?: string
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "api_usage_analytics_api_key_id_fkey"
            columns: ["api_key_id"]
            isOneToOne: false
            referencedRelation: "api_keys"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "api_usage_analytics_external_api_id_fkey"
            columns: ["external_api_id"]
            isOneToOne: false
            referencedRelation: "external_api_registry"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_api_usage_analytics_api_key_id"
            columns: ["api_key_id"]
            isOneToOne: false
            referencedRelation: "api_keys"
            referencedColumns: ["id"]
          },
        ]
      }
      api_usage_logs: {
        Row: {
          api_key_id: string
          created_at: string
          endpoint: string
          id: string
          ip_address: unknown | null
          method: string
          response_time_ms: number | null
          status_code: number
          user_agent: string | null
        }
        Insert: {
          api_key_id: string
          created_at?: string
          endpoint: string
          id?: string
          ip_address?: unknown | null
          method: string
          response_time_ms?: number | null
          status_code: number
          user_agent?: string | null
        }
        Update: {
          api_key_id?: string
          created_at?: string
          endpoint?: string
          id?: string
          ip_address?: unknown | null
          method?: string
          response_time_ms?: number | null
          status_code?: number
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "api_usage_logs_api_key_id_fkey"
            columns: ["api_key_id"]
            isOneToOne: false
            referencedRelation: "api_keys"
            referencedColumns: ["id"]
          },
        ]
      }
      application_pdfs: {
        Row: {
          application_id: string | null
          file_name: string
          file_size: number | null
          generated_at: string | null
          generated_by: string | null
          id: string
          includes_signatures: boolean | null
          pdf_type: string | null
          storage_path: string
        }
        Insert: {
          application_id?: string | null
          file_name: string
          file_size?: number | null
          generated_at?: string | null
          generated_by?: string | null
          id?: string
          includes_signatures?: boolean | null
          pdf_type?: string | null
          storage_path: string
        }
        Update: {
          application_id?: string | null
          file_name?: string
          file_size?: number | null
          generated_at?: string | null
          generated_by?: string | null
          id?: string
          includes_signatures?: boolean | null
          pdf_type?: string | null
          storage_path?: string
        }
        Relationships: [
          {
            foreignKeyName: "application_pdfs_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "credit_applications"
            referencedColumns: ["id"]
          },
        ]
      }
      application_signatures: {
        Row: {
          application_id: string | null
          created_at: string | null
          decline_reason: string | null
          id: string
          signature_data: string | null
          signed_at: string | null
          signer_email: string
          signer_name: string
          signer_order: number
          signer_role: string
          status: string | null
          updated_at: string | null
        }
        Insert: {
          application_id?: string | null
          created_at?: string | null
          decline_reason?: string | null
          id?: string
          signature_data?: string | null
          signed_at?: string | null
          signer_email: string
          signer_name: string
          signer_order: number
          signer_role: string
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          application_id?: string | null
          created_at?: string | null
          decline_reason?: string | null
          id?: string
          signature_data?: string | null
          signed_at?: string | null
          signer_email?: string
          signer_name?: string
          signer_order?: number
          signer_role?: string
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "application_signatures_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "credit_applications"
            referencedColumns: ["id"]
          },
        ]
      }
      arize_configurations: {
        Row: {
          api_endpoint: string | null
          configuration: Json | null
          created_at: string | null
          id: string
          is_enabled: boolean | null
          log_level: string | null
          model_id: string | null
          model_version: string | null
          organization_key: string | null
          sampling_rate: number | null
          space_key: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          api_endpoint?: string | null
          configuration?: Json | null
          created_at?: string | null
          id?: string
          is_enabled?: boolean | null
          log_level?: string | null
          model_id?: string | null
          model_version?: string | null
          organization_key?: string | null
          sampling_rate?: number | null
          space_key?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          api_endpoint?: string | null
          configuration?: Json | null
          created_at?: string | null
          id?: string
          is_enabled?: boolean | null
          log_level?: string | null
          model_id?: string | null
          model_version?: string | null
          organization_key?: string | null
          sampling_rate?: number | null
          space_key?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      audit_logs: {
        Row: {
          action: string
          created_at: string | null
          id: string
          ip_address: unknown | null
          new_values: Json | null
          old_values: Json | null
          record_id: string | null
          table_name: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string | null
          id?: string
          ip_address?: unknown | null
          new_values?: Json | null
          old_values?: Json | null
          record_id?: string | null
          table_name?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string | null
          id?: string
          ip_address?: unknown | null
          new_values?: Json | null
          old_values?: Json | null
          record_id?: string | null
          table_name?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      call_sessions: {
        Row: {
          agent_id: string | null
          call_direction: string
          call_recording_url: string | null
          call_status: string | null
          callee_number: string | null
          caller_number: string | null
          conversation_engine_id: string | null
          created_at: string | null
          duration_seconds: number | null
          end_time: string | null
          id: string
          metadata: Json | null
          phone_number_id: string | null
          provider_call_sid: string | null
          session_id: string
          start_time: string | null
          updated_at: string | null
          voice_provider_id: string | null
        }
        Insert: {
          agent_id?: string | null
          call_direction: string
          call_recording_url?: string | null
          call_status?: string | null
          callee_number?: string | null
          caller_number?: string | null
          conversation_engine_id?: string | null
          created_at?: string | null
          duration_seconds?: number | null
          end_time?: string | null
          id?: string
          metadata?: Json | null
          phone_number_id?: string | null
          provider_call_sid?: string | null
          session_id: string
          start_time?: string | null
          updated_at?: string | null
          voice_provider_id?: string | null
        }
        Update: {
          agent_id?: string | null
          call_direction?: string
          call_recording_url?: string | null
          call_status?: string | null
          callee_number?: string | null
          caller_number?: string | null
          conversation_engine_id?: string | null
          created_at?: string | null
          duration_seconds?: number | null
          end_time?: string | null
          id?: string
          metadata?: Json | null
          phone_number_id?: string | null
          provider_call_sid?: string | null
          session_id?: string
          start_time?: string | null
          updated_at?: string | null
          voice_provider_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "call_sessions_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "call_sessions_phone_number_id_fkey"
            columns: ["phone_number_id"]
            isOneToOne: false
            referencedRelation: "phone_numbers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "call_sessions_voice_provider_id_fkey"
            columns: ["voice_provider_id"]
            isOneToOne: false
            referencedRelation: "voice_providers"
            referencedColumns: ["id"]
          },
        ]
      }
      call_transcriptions: {
        Row: {
          call_session_id: string
          confidence_score: number | null
          created_at: string | null
          id: string
          keywords: Json | null
          language_code: string | null
          provider_used: string | null
          sentiment_analysis: Json | null
          speaker_type: string
          timestamp_offset: number | null
          transcript_text: string
        }
        Insert: {
          call_session_id: string
          confidence_score?: number | null
          created_at?: string | null
          id?: string
          keywords?: Json | null
          language_code?: string | null
          provider_used?: string | null
          sentiment_analysis?: Json | null
          speaker_type: string
          timestamp_offset?: number | null
          transcript_text: string
        }
        Update: {
          call_session_id?: string
          confidence_score?: number | null
          created_at?: string | null
          id?: string
          keywords?: Json | null
          language_code?: string | null
          provider_used?: string | null
          sentiment_analysis?: Json | null
          speaker_type?: string
          timestamp_offset?: number | null
          transcript_text?: string
        }
        Relationships: [
          {
            foreignKeyName: "call_transcriptions_call_session_id_fkey"
            columns: ["call_session_id"]
            isOneToOne: false
            referencedRelation: "call_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      clinical_trials: {
        Row: {
          actual_completion_date: string | null
          created_at: string | null
          eligibility_criteria: Json | null
          enrollment_current: number | null
          enrollment_target: number | null
          estimated_completion_date: string | null
          id: string
          investigational_sites: Json | null
          is_active: boolean | null
          nct_number: string | null
          patient_population: string | null
          phase: string | null
          primary_endpoint: string | null
          primary_indication: string | null
          product_id: string | null
          secondary_endpoints: string[] | null
          sponsor_info: Json | null
          start_date: string | null
          title: string
          trial_locations: string[] | null
          trial_status: Database["public"]["Enums"]["trial_status"]
          updated_at: string | null
        }
        Insert: {
          actual_completion_date?: string | null
          created_at?: string | null
          eligibility_criteria?: Json | null
          enrollment_current?: number | null
          enrollment_target?: number | null
          estimated_completion_date?: string | null
          id?: string
          investigational_sites?: Json | null
          is_active?: boolean | null
          nct_number?: string | null
          patient_population?: string | null
          phase?: string | null
          primary_endpoint?: string | null
          primary_indication?: string | null
          product_id?: string | null
          secondary_endpoints?: string[] | null
          sponsor_info?: Json | null
          start_date?: string | null
          title: string
          trial_locations?: string[] | null
          trial_status: Database["public"]["Enums"]["trial_status"]
          updated_at?: string | null
        }
        Update: {
          actual_completion_date?: string | null
          created_at?: string | null
          eligibility_criteria?: Json | null
          enrollment_current?: number | null
          enrollment_target?: number | null
          estimated_completion_date?: string | null
          id?: string
          investigational_sites?: Json | null
          is_active?: boolean | null
          nct_number?: string | null
          patient_population?: string | null
          phase?: string | null
          primary_endpoint?: string | null
          primary_indication?: string | null
          product_id?: string | null
          secondary_endpoints?: string[] | null
          sponsor_info?: Json | null
          start_date?: string | null
          title?: string
          trial_locations?: string[] | null
          trial_status?: Database["public"]["Enums"]["trial_status"]
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "clinical_trials_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      code_generation_monitoring: {
        Row: {
          auto_fixes_applied: Json | null
          compliance_score: number
          created_at: string
          framework_version: string | null
          generated_code: string | null
          generation_session_id: string
          id: string
          manual_review_required: boolean | null
          prompt_id: string | null
          user_id: string | null
          validation_results: Json
          violations_detected: Json | null
        }
        Insert: {
          auto_fixes_applied?: Json | null
          compliance_score?: number
          created_at?: string
          framework_version?: string | null
          generated_code?: string | null
          generation_session_id: string
          id?: string
          manual_review_required?: boolean | null
          prompt_id?: string | null
          user_id?: string | null
          validation_results?: Json
          violations_detected?: Json | null
        }
        Update: {
          auto_fixes_applied?: Json | null
          compliance_score?: number
          created_at?: string
          framework_version?: string | null
          generated_code?: string | null
          generation_session_id?: string
          id?: string
          manual_review_required?: boolean | null
          prompt_id?: string | null
          user_id?: string | null
          validation_results?: Json
          violations_detected?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "code_generation_monitoring_prompt_id_fkey"
            columns: ["prompt_id"]
            isOneToOne: false
            referencedRelation: "prompt_governance"
            referencedColumns: ["id"]
          },
        ]
      }
      commercial_products: {
        Row: {
          competitive_landscape: Json | null
          created_at: string | null
          distribution_channels: string[] | null
          id: string
          is_active: boolean | null
          key_opinion_leaders: string[] | null
          launch_date: string | null
          market_regions: string[] | null
          medical_affairs_contacts: Json | null
          patient_access_programs: Json | null
          product_id: string | null
          reimbursement_status: Json | null
          updated_at: string | null
          volume_projections: Json | null
        }
        Insert: {
          competitive_landscape?: Json | null
          created_at?: string | null
          distribution_channels?: string[] | null
          id?: string
          is_active?: boolean | null
          key_opinion_leaders?: string[] | null
          launch_date?: string | null
          market_regions?: string[] | null
          medical_affairs_contacts?: Json | null
          patient_access_programs?: Json | null
          product_id?: string | null
          reimbursement_status?: Json | null
          updated_at?: string | null
          volume_projections?: Json | null
        }
        Update: {
          competitive_landscape?: Json | null
          created_at?: string | null
          distribution_channels?: string[] | null
          id?: string
          is_active?: boolean | null
          key_opinion_leaders?: string[] | null
          launch_date?: string | null
          market_regions?: string[] | null
          medical_affairs_contacts?: Json | null
          patient_access_programs?: Json | null
          product_id?: string | null
          reimbursement_status?: Json | null
          updated_at?: string | null
          volume_projections?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "commercial_products_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      compliance_reports: {
        Row: {
          compliance_score: number
          generated_at: string
          id: string
          recommendations: Json | null
          report_data: Json
          report_period_end: string | null
          report_period_start: string | null
          report_type: string
          total_violations: number | null
          user_id: string | null
          violations_by_severity: Json | null
        }
        Insert: {
          compliance_score?: number
          generated_at?: string
          id?: string
          recommendations?: Json | null
          report_data?: Json
          report_period_end?: string | null
          report_period_start?: string | null
          report_type: string
          total_violations?: number | null
          user_id?: string | null
          violations_by_severity?: Json | null
        }
        Update: {
          compliance_score?: number
          generated_at?: string
          id?: string
          recommendations?: Json | null
          report_data?: Json
          report_period_end?: string | null
          report_period_start?: string | null
          report_type?: string
          total_violations?: number | null
          user_id?: string | null
          violations_by_severity?: Json | null
        }
        Relationships: []
      }
      comprehensive_test_cases: {
        Row: {
          actual_results: string | null
          api_integration_id: string | null
          auto_generated: boolean | null
          business_function: string | null
          cfr_part11_metadata: Json | null
          compliance_requirements: Json | null
          coverage_area: string | null
          created_at: string
          created_by: string | null
          database_source: string | null
          execution_data: Json | null
          execution_duration_ms: number | null
          expected_results: string | null
          id: string
          last_executed_at: string | null
          module_name: string | null
          related_functionality: string | null
          test_category: string
          test_description: string | null
          test_name: string
          test_status: string | null
          test_steps: Json | null
          test_suite_type: string
          topic: string | null
          updated_at: string
          updated_by: string | null
          validation_level: string | null
        }
        Insert: {
          actual_results?: string | null
          api_integration_id?: string | null
          auto_generated?: boolean | null
          business_function?: string | null
          cfr_part11_metadata?: Json | null
          compliance_requirements?: Json | null
          coverage_area?: string | null
          created_at?: string
          created_by?: string | null
          database_source?: string | null
          execution_data?: Json | null
          execution_duration_ms?: number | null
          expected_results?: string | null
          id?: string
          last_executed_at?: string | null
          module_name?: string | null
          related_functionality?: string | null
          test_category: string
          test_description?: string | null
          test_name: string
          test_status?: string | null
          test_steps?: Json | null
          test_suite_type: string
          topic?: string | null
          updated_at?: string
          updated_by?: string | null
          validation_level?: string | null
        }
        Update: {
          actual_results?: string | null
          api_integration_id?: string | null
          auto_generated?: boolean | null
          business_function?: string | null
          cfr_part11_metadata?: Json | null
          compliance_requirements?: Json | null
          coverage_area?: string | null
          created_at?: string
          created_by?: string | null
          database_source?: string | null
          execution_data?: Json | null
          execution_duration_ms?: number | null
          expected_results?: string | null
          id?: string
          last_executed_at?: string | null
          module_name?: string | null
          related_functionality?: string | null
          test_category?: string
          test_description?: string | null
          test_name?: string
          test_status?: string | null
          test_steps?: Json | null
          test_suite_type?: string
          topic?: string | null
          updated_at?: string
          updated_by?: string | null
          validation_level?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "comprehensive_test_cases_api_integration_id_fkey"
            columns: ["api_integration_id"]
            isOneToOne: false
            referencedRelation: "api_integration_registry"
            referencedColumns: ["id"]
          },
        ]
      }
      connected_systems: {
        Row: {
          authentication_method: string | null
          capabilities: Json | null
          compliance_requirements: string[] | null
          connection_config: Json
          created_at: string
          data_formats: string[] | null
          healthcare_standards: string[] | null
          id: string
          last_sync: string | null
          name: string
          status: string
          system_type: string
          updated_at: string
        }
        Insert: {
          authentication_method?: string | null
          capabilities?: Json | null
          compliance_requirements?: string[] | null
          connection_config: Json
          created_at?: string
          data_formats?: string[] | null
          healthcare_standards?: string[] | null
          id?: string
          last_sync?: string | null
          name: string
          status?: string
          system_type: string
          updated_at?: string
        }
        Update: {
          authentication_method?: string | null
          capabilities?: Json | null
          compliance_requirements?: string[] | null
          connection_config?: Json
          created_at?: string
          data_formats?: string[] | null
          healthcare_standards?: string[] | null
          id?: string
          last_sync?: string | null
          name?: string
          status?: string
          system_type?: string
          updated_at?: string
        }
        Relationships: []
      }
      connection_analytics: {
        Row: {
          connection_status: string
          connection_type: string
          created_at: string | null
          data_size_bytes: number | null
          error_message: string | null
          id: string
          latency_ms: number | null
          metadata: Json | null
          node_id: string
          source_node: string | null
          target_node: string | null
          updated_at: string | null
          user_id: string | null
          workflow_id: string
        }
        Insert: {
          connection_status: string
          connection_type: string
          created_at?: string | null
          data_size_bytes?: number | null
          error_message?: string | null
          id?: string
          latency_ms?: number | null
          metadata?: Json | null
          node_id: string
          source_node?: string | null
          target_node?: string | null
          updated_at?: string | null
          user_id?: string | null
          workflow_id: string
        }
        Update: {
          connection_status?: string
          connection_type?: string
          created_at?: string | null
          data_size_bytes?: number | null
          error_message?: string | null
          id?: string
          latency_ms?: number | null
          metadata?: Json | null
          node_id?: string
          source_node?: string | null
          target_node?: string | null
          updated_at?: string | null
          user_id?: string | null
          workflow_id?: string
        }
        Relationships: []
      }
      connector_activity_logs: {
        Row: {
          action_description: string | null
          action_type: string
          connector_id: string | null
          created_at: string | null
          id: string
          metadata: Json | null
          status: string
          user_id: string | null
        }
        Insert: {
          action_description?: string | null
          action_type: string
          connector_id?: string | null
          created_at?: string | null
          id?: string
          metadata?: Json | null
          status: string
          user_id?: string | null
        }
        Update: {
          action_description?: string | null
          action_type?: string
          connector_id?: string | null
          created_at?: string | null
          id?: string
          metadata?: Json | null
          status?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "connector_activity_logs_connector_id_fkey"
            columns: ["connector_id"]
            isOneToOne: false
            referencedRelation: "system_connectors"
            referencedColumns: ["id"]
          },
        ]
      }
      connector_assignments: {
        Row: {
          agent_session_id: string
          assignment_config: Json | null
          connector_id: string | null
          created_at: string | null
          created_by: string | null
          id: string
          is_active: boolean | null
          task_id: string
          task_type: string
          updated_at: string | null
        }
        Insert: {
          agent_session_id: string
          assignment_config?: Json | null
          connector_id?: string | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_active?: boolean | null
          task_id: string
          task_type: string
          updated_at?: string | null
        }
        Update: {
          agent_session_id?: string
          assignment_config?: Json | null
          connector_id?: string | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_active?: boolean | null
          task_id?: string
          task_type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "connector_assignments_connector_id_fkey"
            columns: ["connector_id"]
            isOneToOne: false
            referencedRelation: "system_connectors"
            referencedColumns: ["id"]
          },
        ]
      }
      conversation_analysis: {
        Row: {
          analysis_result: Json
          analysis_type: string
          call_session_id: string
          confidence_score: number | null
          created_at: string | null
          id: string
          processing_time_ms: number | null
          provider_used: string | null
        }
        Insert: {
          analysis_result: Json
          analysis_type: string
          call_session_id: string
          confidence_score?: number | null
          created_at?: string | null
          id?: string
          processing_time_ms?: number | null
          provider_used?: string | null
        }
        Update: {
          analysis_result?: Json
          analysis_type?: string
          call_session_id?: string
          confidence_score?: number | null
          created_at?: string | null
          id?: string
          processing_time_ms?: number | null
          provider_used?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "conversation_analysis_call_session_id_fkey"
            columns: ["call_session_id"]
            isOneToOne: false
            referencedRelation: "call_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      conversation_engines: {
        Row: {
          capabilities: Json | null
          configuration: Json
          created_at: string | null
          created_by: string | null
          engine_type: string
          id: string
          is_active: boolean | null
          model_identifier: string
          name: string
          performance_profile: Json | null
          provider: string
          updated_at: string | null
        }
        Insert: {
          capabilities?: Json | null
          configuration?: Json
          created_at?: string | null
          created_by?: string | null
          engine_type: string
          id?: string
          is_active?: boolean | null
          model_identifier: string
          name: string
          performance_profile?: Json | null
          provider: string
          updated_at?: string | null
        }
        Update: {
          capabilities?: Json | null
          configuration?: Json
          created_at?: string | null
          created_by?: string | null
          engine_type?: string
          id?: string
          is_active?: boolean | null
          model_identifier?: string
          name?: string
          performance_profile?: Json | null
          provider?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      conversation_exports: {
        Row: {
          completed_at: string | null
          compliance_metadata: Json | null
          conversation_id: string
          created_at: string
          export_data: Json
          export_type: string
          id: string
          recipient_email: string | null
          status: string
          user_id: string | null
        }
        Insert: {
          completed_at?: string | null
          compliance_metadata?: Json | null
          conversation_id: string
          created_at?: string
          export_data: Json
          export_type: string
          id?: string
          recipient_email?: string | null
          status?: string
          user_id?: string | null
        }
        Update: {
          completed_at?: string | null
          compliance_metadata?: Json | null
          conversation_id?: string
          created_at?: string
          export_data?: Json
          export_type?: string
          id?: string
          recipient_email?: string | null
          status?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "conversation_exports_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "agent_conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      conversation_message_routing: {
        Row: {
          conversation_id: string | null
          created_at: string | null
          entity_extraction: Json | null
          id: string
          intent_classification: Json | null
          message_id: string
          processing_status: string | null
          routing_decision: Json
          selected_models: Json
        }
        Insert: {
          conversation_id?: string | null
          created_at?: string | null
          entity_extraction?: Json | null
          id?: string
          intent_classification?: Json | null
          message_id: string
          processing_status?: string | null
          routing_decision: Json
          selected_models?: Json
        }
        Update: {
          conversation_id?: string | null
          created_at?: string | null
          entity_extraction?: Json | null
          id?: string
          intent_classification?: Json | null
          message_id?: string
          processing_status?: string | null
          routing_decision?: Json
          selected_models?: Json
        }
        Relationships: [
          {
            foreignKeyName: "conversation_message_routing_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "multi_model_conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      credit_application_audit: {
        Row: {
          action_type: string
          actor_ip_address: unknown | null
          actor_user_agent: string | null
          actor_user_id: string | null
          additional_context: Json | null
          created_at: string
          credit_application_id: string
          field_changed: string | null
          id: string
          new_value_hash: string | null
          old_value_hash: string | null
        }
        Insert: {
          action_type: string
          actor_ip_address?: unknown | null
          actor_user_agent?: string | null
          actor_user_id?: string | null
          additional_context?: Json | null
          created_at?: string
          credit_application_id: string
          field_changed?: string | null
          id?: string
          new_value_hash?: string | null
          old_value_hash?: string | null
        }
        Update: {
          action_type?: string
          actor_ip_address?: unknown | null
          actor_user_agent?: string | null
          actor_user_id?: string | null
          additional_context?: Json | null
          created_at?: string
          credit_application_id?: string
          field_changed?: string | null
          id?: string
          new_value_hash?: string | null
          old_value_hash?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "credit_application_audit_credit_application_id_fkey"
            columns: ["credit_application_id"]
            isOneToOne: false
            referencedRelation: "credit_applications"
            referencedColumns: ["id"]
          },
        ]
      }
      credit_application_documents: {
        Row: {
          access_level: string | null
          compliance_tags: string[] | null
          content_type: string | null
          created_at: string
          credit_application_id: string
          data_classification: string | null
          document_name: string
          document_type: string
          encrypted_checksum: string | null
          encryption_method: string | null
          file_size: number | null
          id: string
          retention_years: number | null
          storage_path: string
          updated_at: string
          uploaded_by: string | null
        }
        Insert: {
          access_level?: string | null
          compliance_tags?: string[] | null
          content_type?: string | null
          created_at?: string
          credit_application_id: string
          data_classification?: string | null
          document_name: string
          document_type: string
          encrypted_checksum?: string | null
          encryption_method?: string | null
          file_size?: number | null
          id?: string
          retention_years?: number | null
          storage_path: string
          updated_at?: string
          uploaded_by?: string | null
        }
        Update: {
          access_level?: string | null
          compliance_tags?: string[] | null
          content_type?: string | null
          created_at?: string
          credit_application_id?: string
          data_classification?: string | null
          document_name?: string
          document_type?: string
          encrypted_checksum?: string | null
          encryption_method?: string | null
          file_size?: number | null
          id?: string
          retention_years?: number | null
          storage_path?: string
          updated_at?: string
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "credit_application_documents_credit_application_id_fkey"
            columns: ["credit_application_id"]
            isOneToOne: false
            referencedRelation: "credit_applications"
            referencedColumns: ["id"]
          },
        ]
      }
      credit_application_terms: {
        Row: {
          compliance_framework: string[] | null
          content: string
          created_at: string
          effective_date: string
          expiry_date: string | null
          id: string
          is_active: boolean | null
          requires_signature: boolean | null
          terms_type: string
          title: string
          updated_at: string
          version: string
        }
        Insert: {
          compliance_framework?: string[] | null
          content: string
          created_at?: string
          effective_date?: string
          expiry_date?: string | null
          id?: string
          is_active?: boolean | null
          requires_signature?: boolean | null
          terms_type: string
          title: string
          updated_at?: string
          version: string
        }
        Update: {
          compliance_framework?: string[] | null
          content?: string
          created_at?: string
          effective_date?: string
          expiry_date?: string | null
          id?: string
          is_active?: boolean | null
          requires_signature?: boolean | null
          terms_type?: string
          title?: string
          updated_at?: string
          version?: string
        }
        Relationships: []
      }
      credit_applications: {
        Row: {
          all_signatures_completed_at: string | null
          annual_revenue_range: string | null
          applicant_user_id: string | null
          application_status: string | null
          approved_credit_limit: number | null
          approved_payment_terms: string | null
          bank_references: Json | null
          business_description: string | null
          business_type: string
          created_at: string
          credit_check_authorized: boolean | null
          credit_check_authorized_at: string | null
          credit_score_range: string | null
          data_classification: string | null
          debt_to_income_ratio: number | null
          decision_date: string | null
          decision_reason: string | null
          docusign_envelope_id: string | null
          encrypted_bank_account: string | null
          encrypted_federal_id: string | null
          encrypted_ssn: string | null
          encryption_key_id: string | null
          financial_statements: Json | null
          id: string
          ip_address: unknown | null
          number_of_employees: number | null
          onboarding_id: string | null
          payment_terms_requested: string | null
          primary_contact_email: string | null
          primary_contact_name: string
          primary_contact_phone: string | null
          primary_contact_title: string | null
          privacy_policy_accepted: boolean | null
          privacy_policy_accepted_at: string | null
          requested_credit_limit: number | null
          retention_policy: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          signature_workflow_status: string | null
          signatures_required: boolean | null
          submitted_at: string | null
          terms_accepted: boolean | null
          terms_accepted_at: string | null
          terms_version: string | null
          trade_references: Json | null
          updated_at: string
          user_agent: string | null
          years_in_business: number | null
        }
        Insert: {
          all_signatures_completed_at?: string | null
          annual_revenue_range?: string | null
          applicant_user_id?: string | null
          application_status?: string | null
          approved_credit_limit?: number | null
          approved_payment_terms?: string | null
          bank_references?: Json | null
          business_description?: string | null
          business_type: string
          created_at?: string
          credit_check_authorized?: boolean | null
          credit_check_authorized_at?: string | null
          credit_score_range?: string | null
          data_classification?: string | null
          debt_to_income_ratio?: number | null
          decision_date?: string | null
          decision_reason?: string | null
          docusign_envelope_id?: string | null
          encrypted_bank_account?: string | null
          encrypted_federal_id?: string | null
          encrypted_ssn?: string | null
          encryption_key_id?: string | null
          financial_statements?: Json | null
          id?: string
          ip_address?: unknown | null
          number_of_employees?: number | null
          onboarding_id?: string | null
          payment_terms_requested?: string | null
          primary_contact_email?: string | null
          primary_contact_name: string
          primary_contact_phone?: string | null
          primary_contact_title?: string | null
          privacy_policy_accepted?: boolean | null
          privacy_policy_accepted_at?: string | null
          requested_credit_limit?: number | null
          retention_policy?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          signature_workflow_status?: string | null
          signatures_required?: boolean | null
          submitted_at?: string | null
          terms_accepted?: boolean | null
          terms_accepted_at?: string | null
          terms_version?: string | null
          trade_references?: Json | null
          updated_at?: string
          user_agent?: string | null
          years_in_business?: number | null
        }
        Update: {
          all_signatures_completed_at?: string | null
          annual_revenue_range?: string | null
          applicant_user_id?: string | null
          application_status?: string | null
          approved_credit_limit?: number | null
          approved_payment_terms?: string | null
          bank_references?: Json | null
          business_description?: string | null
          business_type?: string
          created_at?: string
          credit_check_authorized?: boolean | null
          credit_check_authorized_at?: string | null
          credit_score_range?: string | null
          data_classification?: string | null
          debt_to_income_ratio?: number | null
          decision_date?: string | null
          decision_reason?: string | null
          docusign_envelope_id?: string | null
          encrypted_bank_account?: string | null
          encrypted_federal_id?: string | null
          encrypted_ssn?: string | null
          encryption_key_id?: string | null
          financial_statements?: Json | null
          id?: string
          ip_address?: unknown | null
          number_of_employees?: number | null
          onboarding_id?: string | null
          payment_terms_requested?: string | null
          primary_contact_email?: string | null
          primary_contact_name?: string
          primary_contact_phone?: string | null
          primary_contact_title?: string | null
          privacy_policy_accepted?: boolean | null
          privacy_policy_accepted_at?: string | null
          requested_credit_limit?: number | null
          retention_policy?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          signature_workflow_status?: string | null
          signatures_required?: boolean | null
          submitted_at?: string | null
          terms_accepted?: boolean | null
          terms_accepted_at?: string | null
          terms_version?: string | null
          trade_references?: Json | null
          updated_at?: string
          user_agent?: string | null
          years_in_business?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "credit_applications_onboarding_id_fkey"
            columns: ["onboarding_id"]
            isOneToOne: false
            referencedRelation: "treatment_center_onboarding"
            referencedColumns: ["id"]
          },
        ]
      }
      data_import_sessions: {
        Row: {
          completed_at: string | null
          created_at: string
          error_details: Json | null
          id: string
          import_config: Json | null
          import_type: string
          records_failed: number | null
          records_processed: number | null
          records_total: number | null
          schema_detected: Json
          source_name: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          error_details?: Json | null
          id?: string
          import_config?: Json | null
          import_type: string
          records_failed?: number | null
          records_processed?: number | null
          records_total?: number | null
          schema_detected?: Json
          source_name: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          error_details?: Json | null
          id?: string
          import_config?: Json | null
          import_type?: string
          records_failed?: number | null
          records_processed?: number | null
          records_total?: number | null
          schema_detected?: Json
          source_name?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      deployment_environments: {
        Row: {
          cloud_provider: string | null
          created_at: string | null
          created_by: string
          deployment_config: Json | null
          environment_type: string
          environment_variables: Json | null
          id: string
          infrastructure_config: Json | null
          last_deployed_at: string | null
          monitoring_config: Json | null
          name: string
          region: string | null
          resource_allocation: Json | null
          scaling_config: Json | null
          secrets: Json | null
          security_config: Json | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          cloud_provider?: string | null
          created_at?: string | null
          created_by: string
          deployment_config?: Json | null
          environment_type?: string
          environment_variables?: Json | null
          id?: string
          infrastructure_config?: Json | null
          last_deployed_at?: string | null
          monitoring_config?: Json | null
          name: string
          region?: string | null
          resource_allocation?: Json | null
          scaling_config?: Json | null
          secrets?: Json | null
          security_config?: Json | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          cloud_provider?: string | null
          created_at?: string | null
          created_by?: string
          deployment_config?: Json | null
          environment_type?: string
          environment_variables?: Json | null
          id?: string
          infrastructure_config?: Json | null
          last_deployed_at?: string | null
          monitoring_config?: Json | null
          name?: string
          region?: string | null
          resource_allocation?: Json | null
          scaling_config?: Json | null
          secrets?: Json | null
          security_config?: Json | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      developer_applications: {
        Row: {
          company_name: string
          created_at: string
          description: string
          email: string
          id: string
          requested_modules: string[]
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          company_name: string
          created_at?: string
          description: string
          email: string
          id?: string
          requested_modules?: string[]
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          company_name?: string
          created_at?: string
          description?: string
          email?: string
          id?: string
          requested_modules?: string[]
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      developer_notification_preferences: {
        Row: {
          beta_launches: boolean
          breaking_changes: boolean
          created_at: string
          documentation_updates: boolean
          email_notifications: boolean
          feature_updates: boolean
          id: string
          in_app_notifications: boolean
          new_apis: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          beta_launches?: boolean
          breaking_changes?: boolean
          created_at?: string
          documentation_updates?: boolean
          email_notifications?: boolean
          feature_updates?: boolean
          id?: string
          in_app_notifications?: boolean
          new_apis?: boolean
          updated_at?: string
          user_id: string
        }
        Update: {
          beta_launches?: boolean
          breaking_changes?: boolean
          created_at?: string
          documentation_updates?: boolean
          email_notifications?: boolean
          feature_updates?: boolean
          id?: string
          in_app_notifications?: boolean
          new_apis?: boolean
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      developer_notifications: {
        Row: {
          created_at: string
          id: string
          is_read: boolean
          message: string
          metadata: Json | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_read?: boolean
          message: string
          metadata?: Json | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_read?: boolean
          message?: string
          metadata?: Json | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      developer_portal_applications: {
        Row: {
          application_name: string
          application_type: string
          approval_notes: string | null
          approved_at: string | null
          approved_by: string | null
          company_name: string | null
          created_at: string
          description: string
          environment: string
          id: string
          privacy_policy_accepted: boolean | null
          requested_apis: string[] | null
          requested_scopes: string[] | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
          terms_accepted: boolean | null
          updated_at: string
          use_case: string | null
          user_id: string
          website_url: string | null
        }
        Insert: {
          application_name: string
          application_type?: string
          approval_notes?: string | null
          approved_at?: string | null
          approved_by?: string | null
          company_name?: string | null
          created_at?: string
          description: string
          environment?: string
          id?: string
          privacy_policy_accepted?: boolean | null
          requested_apis?: string[] | null
          requested_scopes?: string[] | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          terms_accepted?: boolean | null
          updated_at?: string
          use_case?: string | null
          user_id: string
          website_url?: string | null
        }
        Update: {
          application_name?: string
          application_type?: string
          approval_notes?: string | null
          approved_at?: string | null
          approved_by?: string | null
          company_name?: string | null
          created_at?: string
          description?: string
          environment?: string
          id?: string
          privacy_policy_accepted?: boolean | null
          requested_apis?: string[] | null
          requested_scopes?: string[] | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          terms_accepted?: boolean | null
          updated_at?: string
          use_case?: string | null
          user_id?: string
          website_url?: string | null
        }
        Relationships: []
      }
      document_processing_queue: {
        Row: {
          created_at: string
          error_message: string | null
          file_path: string | null
          id: string
          knowledge_base_id: string | null
          processed_at: string | null
          processing_type: string
          progress_data: Json | null
          retry_count: number | null
          status: string
          url: string | null
        }
        Insert: {
          created_at?: string
          error_message?: string | null
          file_path?: string | null
          id?: string
          knowledge_base_id?: string | null
          processed_at?: string | null
          processing_type: string
          progress_data?: Json | null
          retry_count?: number | null
          status?: string
          url?: string | null
        }
        Update: {
          created_at?: string
          error_message?: string | null
          file_path?: string | null
          id?: string
          knowledge_base_id?: string | null
          processed_at?: string | null
          processing_type?: string
          progress_data?: Json | null
          retry_count?: number | null
          status?: string
          url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "document_processing_queue_knowledge_base_id_fkey"
            columns: ["knowledge_base_id"]
            isOneToOne: false
            referencedRelation: "knowledge_base"
            referencedColumns: ["id"]
          },
        ]
      }
      docusign_envelopes: {
        Row: {
          application_id: string | null
          created_at: string | null
          envelope_data: Json | null
          envelope_id: string
          id: string
          signers: Json
          status: string | null
          updated_at: string | null
          webhook_events: Json | null
        }
        Insert: {
          application_id?: string | null
          created_at?: string | null
          envelope_data?: Json | null
          envelope_id: string
          id?: string
          signers?: Json
          status?: string | null
          updated_at?: string | null
          webhook_events?: Json | null
        }
        Update: {
          application_id?: string | null
          created_at?: string | null
          envelope_data?: Json | null
          envelope_id?: string
          id?: string
          signers?: Json
          status?: string | null
          updated_at?: string | null
          webhook_events?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "docusign_envelopes_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "credit_applications"
            referencedColumns: ["id"]
          },
        ]
      }
      dynamic_table_schemas: {
        Row: {
          created_at: string
          created_from_import_session: string | null
          id: string
          is_active: boolean
          schema_definition: Json
          table_name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          created_from_import_session?: string | null
          id?: string
          is_active?: boolean
          schema_definition: Json
          table_name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          created_from_import_session?: string | null
          id?: string
          is_active?: boolean
          schema_definition?: Json
          table_name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "dynamic_table_schemas_created_from_import_session_fkey"
            columns: ["created_from_import_session"]
            isOneToOne: false
            referencedRelation: "data_import_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      email_conversations: {
        Row: {
          created_at: string | null
          id: string
          is_archived: boolean | null
          last_message_at: string | null
          message_count: number | null
          participants: string[]
          subject: string
          thread_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_archived?: boolean | null
          last_message_at?: string | null
          message_count?: number | null
          participants: string[]
          subject: string
          thread_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_archived?: boolean | null
          last_message_at?: string | null
          message_count?: number | null
          participants?: string[]
          subject?: string
          thread_id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      email_logs: {
        Row: {
          campaign_id: string | null
          created_at: string
          email_address: string
          email_type: string
          error_message: string | null
          id: string
          sent_at: string
          status: string
          subscriber_id: string | null
          template_used: string
        }
        Insert: {
          campaign_id?: string | null
          created_at?: string
          email_address: string
          email_type: string
          error_message?: string | null
          id?: string
          sent_at?: string
          status?: string
          subscriber_id?: string | null
          template_used: string
        }
        Update: {
          campaign_id?: string | null
          created_at?: string
          email_address?: string
          email_type?: string
          error_message?: string | null
          id?: string
          sent_at?: string
          status?: string
          subscriber_id?: string | null
          template_used?: string
        }
        Relationships: [
          {
            foreignKeyName: "email_logs_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "newsletter_campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "email_logs_subscriber_id_fkey"
            columns: ["subscriber_id"]
            isOneToOne: false
            referencedRelation: "newsletter_subscribers"
            referencedColumns: ["id"]
          },
        ]
      }
      email_templates: {
        Row: {
          created_at: string | null
          created_by: string | null
          html_content: string
          id: string
          is_active: boolean | null
          is_system_template: boolean | null
          name: string
          subject: string
          template_type: string | null
          template_variables: Json | null
          text_content: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          html_content: string
          id?: string
          is_active?: boolean | null
          is_system_template?: boolean | null
          name: string
          subject: string
          template_type?: string | null
          template_variables?: Json | null
          text_content?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          html_content?: string
          id?: string
          is_active?: boolean | null
          is_system_template?: boolean | null
          name?: string
          subject?: string
          template_type?: string | null
          template_variables?: Json | null
          text_content?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      enrollment_clinical_info: {
        Row: {
          allergies: Json | null
          chief_complaint: string | null
          clinical_notes: string | null
          created_at: string
          current_medications: Json | null
          enrollment_id: string
          family_history: Json | null
          id: string
          imaging_results: Json | null
          lab_results: Json | null
          medical_history: Json | null
          risk_factors: Json | null
          social_history: Json | null
          surgical_history: Json | null
          treatment_goals: Json | null
          updated_at: string
          vital_signs: Json | null
        }
        Insert: {
          allergies?: Json | null
          chief_complaint?: string | null
          clinical_notes?: string | null
          created_at?: string
          current_medications?: Json | null
          enrollment_id: string
          family_history?: Json | null
          id?: string
          imaging_results?: Json | null
          lab_results?: Json | null
          medical_history?: Json | null
          risk_factors?: Json | null
          social_history?: Json | null
          surgical_history?: Json | null
          treatment_goals?: Json | null
          updated_at?: string
          vital_signs?: Json | null
        }
        Update: {
          allergies?: Json | null
          chief_complaint?: string | null
          clinical_notes?: string | null
          created_at?: string
          current_medications?: Json | null
          enrollment_id?: string
          family_history?: Json | null
          id?: string
          imaging_results?: Json | null
          lab_results?: Json | null
          medical_history?: Json | null
          risk_factors?: Json | null
          social_history?: Json | null
          surgical_history?: Json | null
          treatment_goals?: Json | null
          updated_at?: string
          vital_signs?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "enrollment_clinical_info_enrollment_id_fkey"
            columns: ["enrollment_id"]
            isOneToOne: false
            referencedRelation: "patient_enrollments"
            referencedColumns: ["id"]
          },
        ]
      }
      enrollment_collaborations: {
        Row: {
          assigned_role: string
          assigned_user: string | null
          completed_at: string | null
          created_at: string
          enrollment_instance_id: string
          id: string
          notes: string | null
          started_at: string | null
          status: string
          step_id: string
          updated_at: string
        }
        Insert: {
          assigned_role: string
          assigned_user?: string | null
          completed_at?: string | null
          created_at?: string
          enrollment_instance_id: string
          id?: string
          notes?: string | null
          started_at?: string | null
          status?: string
          step_id: string
          updated_at?: string
        }
        Update: {
          assigned_role?: string
          assigned_user?: string | null
          completed_at?: string | null
          created_at?: string
          enrollment_instance_id?: string
          id?: string
          notes?: string | null
          started_at?: string | null
          status?: string
          step_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "enrollment_collaborations_enrollment_instance_id_fkey"
            columns: ["enrollment_instance_id"]
            isOneToOne: false
            referencedRelation: "enrollment_instances"
            referencedColumns: ["id"]
          },
        ]
      }
      enrollment_consent: {
        Row: {
          collection_method: string | null
          communication_consent: boolean | null
          consent_date: string | null
          consent_to_treatment: boolean | null
          created_at: string
          enrollment_id: string
          facility_id: string | null
          final_signature: string | null
          final_signature_date: string | null
          financial_responsibility: boolean | null
          hipaa_authorization: boolean | null
          id: string
          location_type: string | null
          marketing_consent: boolean | null
          patient_signature: string | null
          privacy_consent: boolean | null
          provider_id: string | null
          provider_name: string | null
          provider_npi: string | null
          provider_signature: string | null
          signature_date: string | null
          telehealth_consent: boolean | null
          treatment_center: string | null
          treatment_center_npi: string | null
          treatment_consent: boolean | null
          updated_at: string
          witness_signature: string | null
        }
        Insert: {
          collection_method?: string | null
          communication_consent?: boolean | null
          consent_date?: string | null
          consent_to_treatment?: boolean | null
          created_at?: string
          enrollment_id: string
          facility_id?: string | null
          final_signature?: string | null
          final_signature_date?: string | null
          financial_responsibility?: boolean | null
          hipaa_authorization?: boolean | null
          id?: string
          location_type?: string | null
          marketing_consent?: boolean | null
          patient_signature?: string | null
          privacy_consent?: boolean | null
          provider_id?: string | null
          provider_name?: string | null
          provider_npi?: string | null
          provider_signature?: string | null
          signature_date?: string | null
          telehealth_consent?: boolean | null
          treatment_center?: string | null
          treatment_center_npi?: string | null
          treatment_consent?: boolean | null
          updated_at?: string
          witness_signature?: string | null
        }
        Update: {
          collection_method?: string | null
          communication_consent?: boolean | null
          consent_date?: string | null
          consent_to_treatment?: boolean | null
          created_at?: string
          enrollment_id?: string
          facility_id?: string | null
          final_signature?: string | null
          final_signature_date?: string | null
          financial_responsibility?: boolean | null
          hipaa_authorization?: boolean | null
          id?: string
          location_type?: string | null
          marketing_consent?: boolean | null
          patient_signature?: string | null
          privacy_consent?: boolean | null
          provider_id?: string | null
          provider_name?: string | null
          provider_npi?: string | null
          provider_signature?: string | null
          signature_date?: string | null
          telehealth_consent?: boolean | null
          treatment_center?: string | null
          treatment_center_npi?: string | null
          treatment_consent?: boolean | null
          updated_at?: string
          witness_signature?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "enrollment_consent_enrollment_id_fkey"
            columns: ["enrollment_id"]
            isOneToOne: false
            referencedRelation: "patient_enrollments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "enrollment_consent_facility_id_fkey"
            columns: ["facility_id"]
            isOneToOne: false
            referencedRelation: "facilities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "enrollment_consent_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "service_providers"
            referencedColumns: ["id"]
          },
        ]
      }
      enrollment_documents: {
        Row: {
          document_type: string
          enrollment_instance_id: string
          file_name: string
          file_path: string
          file_size: number | null
          id: string
          mime_type: string | null
          uploaded_at: string
          uploaded_by: string | null
        }
        Insert: {
          document_type: string
          enrollment_instance_id: string
          file_name: string
          file_path: string
          file_size?: number | null
          id?: string
          mime_type?: string | null
          uploaded_at?: string
          uploaded_by?: string | null
        }
        Update: {
          document_type?: string
          enrollment_instance_id?: string
          file_name?: string
          file_path?: string
          file_size?: number | null
          id?: string
          mime_type?: string | null
          uploaded_at?: string
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "enrollment_documents_enrollment_instance_id_fkey"
            columns: ["enrollment_instance_id"]
            isOneToOne: false
            referencedRelation: "enrollment_instances"
            referencedColumns: ["id"]
          },
        ]
      }
      enrollment_instances: {
        Row: {
          actual_start_date: string | null
          assigned_to: string | null
          collaborators_assigned: string[] | null
          communication_frequency: string | null
          completed_at: string | null
          consent_date: string | null
          consent_method: string | null
          consent_obtained: boolean | null
          created_at: string
          current_step: string | null
          current_step_assignee: string | null
          current_step_number: number | null
          enrollment_priority: string | null
          enrollment_source: string | null
          enrollment_type: string | null
          estimated_completion_date: string | null
          estimated_completion_hours: number | null
          estimated_start_date: string | null
          facility_id: string | null
          financial_consent_date: string | null
          financial_consent_signed: boolean | null
          hipaa_consent_date: string | null
          hipaa_consent_signed: boolean | null
          id: string
          last_action_by: string | null
          last_action_date: string | null
          module_type: string
          npi_verified_at: string | null
          patient_id: string | null
          patient_signature_captured: boolean | null
          primary_coordinator_email: string | null
          primary_coordinator_name: string | null
          priority_level: string | null
          priority_reason: string | null
          progress: number
          provider_id: string | null
          provider_signature_captured: boolean | null
          referral_physician: string | null
          referral_urgency: string | null
          research_consent_date: string | null
          research_consent_signed: boolean | null
          secondary_coordinator_email: string | null
          secondary_coordinator_name: string | null
          status: string
          submission_method: string
          submission_method_selected: string | null
          submitted_at: string | null
          submitted_by: string | null
          team_members: string[] | null
          template_id: string
          total_steps: number | null
          treatment_consent_date: string | null
          treatment_consent_signed: boolean | null
          updated_at: string
          verification_status: string | null
          workflow_notes: string | null
          workflow_step_completed: string[] | null
          workflow_version: string | null
        }
        Insert: {
          actual_start_date?: string | null
          assigned_to?: string | null
          collaborators_assigned?: string[] | null
          communication_frequency?: string | null
          completed_at?: string | null
          consent_date?: string | null
          consent_method?: string | null
          consent_obtained?: boolean | null
          created_at?: string
          current_step?: string | null
          current_step_assignee?: string | null
          current_step_number?: number | null
          enrollment_priority?: string | null
          enrollment_source?: string | null
          enrollment_type?: string | null
          estimated_completion_date?: string | null
          estimated_completion_hours?: number | null
          estimated_start_date?: string | null
          facility_id?: string | null
          financial_consent_date?: string | null
          financial_consent_signed?: boolean | null
          hipaa_consent_date?: string | null
          hipaa_consent_signed?: boolean | null
          id?: string
          last_action_by?: string | null
          last_action_date?: string | null
          module_type: string
          npi_verified_at?: string | null
          patient_id?: string | null
          patient_signature_captured?: boolean | null
          primary_coordinator_email?: string | null
          primary_coordinator_name?: string | null
          priority_level?: string | null
          priority_reason?: string | null
          progress?: number
          provider_id?: string | null
          provider_signature_captured?: boolean | null
          referral_physician?: string | null
          referral_urgency?: string | null
          research_consent_date?: string | null
          research_consent_signed?: boolean | null
          secondary_coordinator_email?: string | null
          secondary_coordinator_name?: string | null
          status?: string
          submission_method?: string
          submission_method_selected?: string | null
          submitted_at?: string | null
          submitted_by?: string | null
          team_members?: string[] | null
          template_id: string
          total_steps?: number | null
          treatment_consent_date?: string | null
          treatment_consent_signed?: boolean | null
          updated_at?: string
          verification_status?: string | null
          workflow_notes?: string | null
          workflow_step_completed?: string[] | null
          workflow_version?: string | null
        }
        Update: {
          actual_start_date?: string | null
          assigned_to?: string | null
          collaborators_assigned?: string[] | null
          communication_frequency?: string | null
          completed_at?: string | null
          consent_date?: string | null
          consent_method?: string | null
          consent_obtained?: boolean | null
          created_at?: string
          current_step?: string | null
          current_step_assignee?: string | null
          current_step_number?: number | null
          enrollment_priority?: string | null
          enrollment_source?: string | null
          enrollment_type?: string | null
          estimated_completion_date?: string | null
          estimated_completion_hours?: number | null
          estimated_start_date?: string | null
          facility_id?: string | null
          financial_consent_date?: string | null
          financial_consent_signed?: boolean | null
          hipaa_consent_date?: string | null
          hipaa_consent_signed?: boolean | null
          id?: string
          last_action_by?: string | null
          last_action_date?: string | null
          module_type?: string
          npi_verified_at?: string | null
          patient_id?: string | null
          patient_signature_captured?: boolean | null
          primary_coordinator_email?: string | null
          primary_coordinator_name?: string | null
          priority_level?: string | null
          priority_reason?: string | null
          progress?: number
          provider_id?: string | null
          provider_signature_captured?: boolean | null
          referral_physician?: string | null
          referral_urgency?: string | null
          research_consent_date?: string | null
          research_consent_signed?: boolean | null
          secondary_coordinator_email?: string | null
          secondary_coordinator_name?: string | null
          status?: string
          submission_method?: string
          submission_method_selected?: string | null
          submitted_at?: string | null
          submitted_by?: string | null
          team_members?: string[] | null
          template_id?: string
          total_steps?: number | null
          treatment_consent_date?: string | null
          treatment_consent_signed?: boolean | null
          updated_at?: string
          verification_status?: string | null
          workflow_notes?: string | null
          workflow_step_completed?: string[] | null
          workflow_version?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "enrollment_instances_current_step_assignee_fkey"
            columns: ["current_step_assignee"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "enrollment_instances_facility_id_fkey"
            columns: ["facility_id"]
            isOneToOne: false
            referencedRelation: "facilities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "enrollment_instances_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "enrollment_instances_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "enrollment_instances_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "enrollment_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      enrollment_insurance_info: {
        Row: {
          copay_amount: number | null
          created_at: string
          deductible_amount: number | null
          enrollment_id: string
          id: string
          insurance_verification_status: string | null
          out_of_pocket_max: number | null
          primary_effective_date: string | null
          primary_group_number: string | null
          primary_insurance_name: string | null
          primary_policy_number: string | null
          primary_subscriber_dob: string | null
          primary_subscriber_name: string | null
          primary_subscriber_relationship: string | null
          prior_auth_number: string | null
          prior_authorization_required: boolean | null
          secondary_effective_date: string | null
          secondary_group_number: string | null
          secondary_insurance_name: string | null
          secondary_policy_number: string | null
          secondary_subscriber_dob: string | null
          secondary_subscriber_name: string | null
          secondary_subscriber_relationship: string | null
          updated_at: string
        }
        Insert: {
          copay_amount?: number | null
          created_at?: string
          deductible_amount?: number | null
          enrollment_id: string
          id?: string
          insurance_verification_status?: string | null
          out_of_pocket_max?: number | null
          primary_effective_date?: string | null
          primary_group_number?: string | null
          primary_insurance_name?: string | null
          primary_policy_number?: string | null
          primary_subscriber_dob?: string | null
          primary_subscriber_name?: string | null
          primary_subscriber_relationship?: string | null
          prior_auth_number?: string | null
          prior_authorization_required?: boolean | null
          secondary_effective_date?: string | null
          secondary_group_number?: string | null
          secondary_insurance_name?: string | null
          secondary_policy_number?: string | null
          secondary_subscriber_dob?: string | null
          secondary_subscriber_name?: string | null
          secondary_subscriber_relationship?: string | null
          updated_at?: string
        }
        Update: {
          copay_amount?: number | null
          created_at?: string
          deductible_amount?: number | null
          enrollment_id?: string
          id?: string
          insurance_verification_status?: string | null
          out_of_pocket_max?: number | null
          primary_effective_date?: string | null
          primary_group_number?: string | null
          primary_insurance_name?: string | null
          primary_policy_number?: string | null
          primary_subscriber_dob?: string | null
          primary_subscriber_name?: string | null
          primary_subscriber_relationship?: string | null
          prior_auth_number?: string | null
          prior_authorization_required?: boolean | null
          secondary_effective_date?: string | null
          secondary_group_number?: string | null
          secondary_insurance_name?: string | null
          secondary_policy_number?: string | null
          secondary_subscriber_dob?: string | null
          secondary_subscriber_name?: string | null
          secondary_subscriber_relationship?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "enrollment_insurance_info_enrollment_id_fkey"
            columns: ["enrollment_id"]
            isOneToOne: false
            referencedRelation: "patient_enrollments"
            referencedColumns: ["id"]
          },
        ]
      }
      enrollment_patient_info: {
        Row: {
          address_line1: string | null
          address_line2: string | null
          city: string | null
          created_at: string
          date_of_birth: string | null
          email: string | null
          emergency_contact_name: string | null
          emergency_contact_phone: string | null
          emergency_contact_relationship: string | null
          employer: string | null
          enrollment_id: string
          first_name: string | null
          gender: string | null
          id: string
          last_name: string | null
          marital_status: string | null
          middle_name: string | null
          occupation: string | null
          phone: string | null
          preferred_language: string | null
          ssn: string | null
          state: string | null
          updated_at: string
          zip_code: string | null
        }
        Insert: {
          address_line1?: string | null
          address_line2?: string | null
          city?: string | null
          created_at?: string
          date_of_birth?: string | null
          email?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          emergency_contact_relationship?: string | null
          employer?: string | null
          enrollment_id: string
          first_name?: string | null
          gender?: string | null
          id?: string
          last_name?: string | null
          marital_status?: string | null
          middle_name?: string | null
          occupation?: string | null
          phone?: string | null
          preferred_language?: string | null
          ssn?: string | null
          state?: string | null
          updated_at?: string
          zip_code?: string | null
        }
        Update: {
          address_line1?: string | null
          address_line2?: string | null
          city?: string | null
          created_at?: string
          date_of_birth?: string | null
          email?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          emergency_contact_relationship?: string | null
          employer?: string | null
          enrollment_id?: string
          first_name?: string | null
          gender?: string | null
          id?: string
          last_name?: string | null
          marital_status?: string | null
          middle_name?: string | null
          occupation?: string | null
          phone?: string | null
          preferred_language?: string | null
          ssn?: string | null
          state?: string | null
          updated_at?: string
          zip_code?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "enrollment_patient_info_enrollment_id_fkey"
            columns: ["enrollment_id"]
            isOneToOne: false
            referencedRelation: "patient_enrollments"
            referencedColumns: ["id"]
          },
        ]
      }
      enrollment_provider_info: {
        Row: {
          created_at: string
          credentialing_notes: string | null
          credentialing_status: string | null
          diagnosis_codes: Json | null
          enrollment_id: string
          facility_address: string | null
          facility_id: string | null
          facility_npi: string | null
          id: string
          npi_verification_status: string | null
          pcp_npi: string | null
          pcp_phone: string | null
          pcp_provider_id: string | null
          primary_care_physician: string | null
          referring_provider_id: string | null
          referring_provider_name: string | null
          referring_provider_npi: string | null
          referring_provider_phone: string | null
          treatment_facility: string | null
          treatment_plan: Json | null
          treatment_start_date: string | null
          treatment_type: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          credentialing_notes?: string | null
          credentialing_status?: string | null
          diagnosis_codes?: Json | null
          enrollment_id: string
          facility_address?: string | null
          facility_id?: string | null
          facility_npi?: string | null
          id?: string
          npi_verification_status?: string | null
          pcp_npi?: string | null
          pcp_phone?: string | null
          pcp_provider_id?: string | null
          primary_care_physician?: string | null
          referring_provider_id?: string | null
          referring_provider_name?: string | null
          referring_provider_npi?: string | null
          referring_provider_phone?: string | null
          treatment_facility?: string | null
          treatment_plan?: Json | null
          treatment_start_date?: string | null
          treatment_type?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          credentialing_notes?: string | null
          credentialing_status?: string | null
          diagnosis_codes?: Json | null
          enrollment_id?: string
          facility_address?: string | null
          facility_id?: string | null
          facility_npi?: string | null
          id?: string
          npi_verification_status?: string | null
          pcp_npi?: string | null
          pcp_phone?: string | null
          pcp_provider_id?: string | null
          primary_care_physician?: string | null
          referring_provider_id?: string | null
          referring_provider_name?: string | null
          referring_provider_npi?: string | null
          referring_provider_phone?: string | null
          treatment_facility?: string | null
          treatment_plan?: Json | null
          treatment_start_date?: string | null
          treatment_type?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "enrollment_provider_info_enrollment_id_fkey"
            columns: ["enrollment_id"]
            isOneToOne: false
            referencedRelation: "patient_enrollments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "enrollment_provider_info_facility_id_fkey"
            columns: ["facility_id"]
            isOneToOne: false
            referencedRelation: "facilities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "enrollment_provider_info_pcp_provider_id_fkey"
            columns: ["pcp_provider_id"]
            isOneToOne: false
            referencedRelation: "service_providers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "enrollment_provider_info_referring_provider_id_fkey"
            columns: ["referring_provider_id"]
            isOneToOne: false
            referencedRelation: "service_providers"
            referencedColumns: ["id"]
          },
        ]
      }
      enrollment_real_time_sync: {
        Row: {
          conflict_resolution: string | null
          field_name: string
          field_value: Json | null
          id: string
          session_id: string
          sync_direction: string | null
          sync_status: string | null
          sync_timestamp: string | null
          whatsapp_session_id: string | null
        }
        Insert: {
          conflict_resolution?: string | null
          field_name: string
          field_value?: Json | null
          id?: string
          session_id: string
          sync_direction?: string | null
          sync_status?: string | null
          sync_timestamp?: string | null
          whatsapp_session_id?: string | null
        }
        Update: {
          conflict_resolution?: string | null
          field_name?: string
          field_value?: Json | null
          id?: string
          session_id?: string
          sync_direction?: string | null
          sync_status?: string | null
          sync_timestamp?: string | null
          whatsapp_session_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "enrollment_real_time_sync_whatsapp_session_id_fkey"
            columns: ["whatsapp_session_id"]
            isOneToOne: false
            referencedRelation: "whatsapp_enrollment_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      enrollment_templates: {
        Row: {
          created_at: string
          created_by: string | null
          form_schema: Json
          id: string
          is_active: boolean
          module_type: string
          name: string
          template_data: Json
          updated_at: string
          validation_rules: Json
          workflow_config: Json
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          form_schema?: Json
          id?: string
          is_active?: boolean
          module_type: string
          name: string
          template_data?: Json
          updated_at?: string
          validation_rules?: Json
          workflow_config?: Json
        }
        Update: {
          created_at?: string
          created_by?: string | null
          form_schema?: Json
          id?: string
          is_active?: boolean
          module_type?: string
          name?: string
          template_data?: Json
          updated_at?: string
          validation_rules?: Json
          workflow_config?: Json
        }
        Relationships: []
      }
      enrollment_treatment_plan: {
        Row: {
          authorization_status: string | null
          created_at: string
          discharge_criteria: Json | null
          duration: string | null
          enrollment_id: string
          estimated_cost: number | null
          frequency: string | null
          id: string
          location: string | null
          medication_management: Json | null
          monitoring_plan: Json | null
          provider_assignments: Json | null
          therapy_goals: Json | null
          treatment_modality: string | null
          treatment_schedule: Json | null
          updated_at: string
        }
        Insert: {
          authorization_status?: string | null
          created_at?: string
          discharge_criteria?: Json | null
          duration?: string | null
          enrollment_id: string
          estimated_cost?: number | null
          frequency?: string | null
          id?: string
          location?: string | null
          medication_management?: Json | null
          monitoring_plan?: Json | null
          provider_assignments?: Json | null
          therapy_goals?: Json | null
          treatment_modality?: string | null
          treatment_schedule?: Json | null
          updated_at?: string
        }
        Update: {
          authorization_status?: string | null
          created_at?: string
          discharge_criteria?: Json | null
          duration?: string | null
          enrollment_id?: string
          estimated_cost?: number | null
          frequency?: string | null
          id?: string
          location?: string | null
          medication_management?: Json | null
          monitoring_plan?: Json | null
          provider_assignments?: Json | null
          therapy_goals?: Json | null
          treatment_modality?: string | null
          treatment_schedule?: Json | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "enrollment_treatment_plan_enrollment_id_fkey"
            columns: ["enrollment_id"]
            isOneToOne: false
            referencedRelation: "patient_enrollments"
            referencedColumns: ["id"]
          },
        ]
      }
      external_api_change_logs: {
        Row: {
          affected_endpoints: string[] | null
          breaking_change: boolean | null
          change_type: string
          created_at: string
          created_by: string | null
          description: string
          developer_notification_sent: boolean | null
          external_api_id: string
          id: string
          migration_guide: string | null
          title: string
          version_from: string | null
          version_to: string | null
        }
        Insert: {
          affected_endpoints?: string[] | null
          breaking_change?: boolean | null
          change_type: string
          created_at?: string
          created_by?: string | null
          description: string
          developer_notification_sent?: boolean | null
          external_api_id: string
          id?: string
          migration_guide?: string | null
          title: string
          version_from?: string | null
          version_to?: string | null
        }
        Update: {
          affected_endpoints?: string[] | null
          breaking_change?: boolean | null
          change_type?: string
          created_at?: string
          created_by?: string | null
          description?: string
          developer_notification_sent?: boolean | null
          external_api_id?: string
          id?: string
          migration_guide?: string | null
          title?: string
          version_from?: string | null
          version_to?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "external_api_change_logs_external_api_id_fkey"
            columns: ["external_api_id"]
            isOneToOne: false
            referencedRelation: "external_api_registry"
            referencedColumns: ["id"]
          },
        ]
      }
      external_api_endpoints: {
        Row: {
          created_at: string
          deprecated: boolean | null
          deprecation_date: string | null
          description: string | null
          example_request: Json | null
          example_response: Json | null
          external_api_id: string
          external_path: string
          id: string
          internal_endpoint_id: string | null
          is_public: boolean | null
          method: string
          rate_limit_override: Json | null
          request_schema: Json | null
          requires_authentication: boolean | null
          response_schema: Json | null
          summary: string
          tags: string[] | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          deprecated?: boolean | null
          deprecation_date?: string | null
          description?: string | null
          example_request?: Json | null
          example_response?: Json | null
          external_api_id: string
          external_path: string
          id?: string
          internal_endpoint_id?: string | null
          is_public?: boolean | null
          method: string
          rate_limit_override?: Json | null
          request_schema?: Json | null
          requires_authentication?: boolean | null
          response_schema?: Json | null
          summary: string
          tags?: string[] | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          deprecated?: boolean | null
          deprecation_date?: string | null
          description?: string | null
          example_request?: Json | null
          example_response?: Json | null
          external_api_id?: string
          external_path?: string
          id?: string
          internal_endpoint_id?: string | null
          is_public?: boolean | null
          method?: string
          rate_limit_override?: Json | null
          request_schema?: Json | null
          requires_authentication?: boolean | null
          response_schema?: Json | null
          summary?: string
          tags?: string[] | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "external_api_endpoints_external_api_id_fkey"
            columns: ["external_api_id"]
            isOneToOne: false
            referencedRelation: "external_api_registry"
            referencedColumns: ["id"]
          },
        ]
      }
      external_api_registry: {
        Row: {
          analytics_config: Json | null
          authentication_methods: string[] | null
          base_url: string | null
          category: string | null
          created_at: string
          created_by: string | null
          documentation_url: string | null
          external_description: string | null
          external_name: string
          id: string
          internal_api_id: string
          marketplace_config: Json | null
          pricing_model: string
          published_at: string | null
          published_by: string | null
          rate_limits: Json | null
          sandbox_url: string | null
          status: string
          supported_formats: string[] | null
          tags: string[] | null
          updated_at: string
          version: string
          visibility: string
        }
        Insert: {
          analytics_config?: Json | null
          authentication_methods?: string[] | null
          base_url?: string | null
          category?: string | null
          created_at?: string
          created_by?: string | null
          documentation_url?: string | null
          external_description?: string | null
          external_name: string
          id?: string
          internal_api_id: string
          marketplace_config?: Json | null
          pricing_model?: string
          published_at?: string | null
          published_by?: string | null
          rate_limits?: Json | null
          sandbox_url?: string | null
          status?: string
          supported_formats?: string[] | null
          tags?: string[] | null
          updated_at?: string
          version?: string
          visibility?: string
        }
        Update: {
          analytics_config?: Json | null
          authentication_methods?: string[] | null
          base_url?: string | null
          category?: string | null
          created_at?: string
          created_by?: string | null
          documentation_url?: string | null
          external_description?: string | null
          external_name?: string
          id?: string
          internal_api_id?: string
          marketplace_config?: Json | null
          pricing_model?: string
          published_at?: string | null
          published_by?: string | null
          rate_limits?: Json | null
          sandbox_url?: string | null
          status?: string
          supported_formats?: string[] | null
          tags?: string[] | null
          updated_at?: string
          version?: string
          visibility?: string
        }
        Relationships: [
          {
            foreignKeyName: "external_api_registry_internal_api_id_fkey"
            columns: ["internal_api_id"]
            isOneToOne: false
            referencedRelation: "api_integration_registry"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_external_api_registry_internal_api_id"
            columns: ["internal_api_id"]
            isOneToOne: false
            referencedRelation: "api_integration_registry"
            referencedColumns: ["id"]
          },
        ]
      }
      facilities: {
        Row: {
          accreditation_bodies: string[] | null
          accreditation_status: string | null
          address: string | null
          administrator_contact: string | null
          administrator_name: string | null
          administrator_title: string | null
          advanced_therapy_certified: boolean | null
          adverse_event_reporting: string | null
          apheresis_capability: boolean | null
          apheresis_technician: string | null
          backup_power_systems: boolean | null
          bed_count: string | null
          billing_contact_info: string | null
          billing_contact_name: string | null
          biosafety_committee_approval: boolean | null
          cap_accreditation: boolean | null
          cap_details: string | null
          carf_accreditation: boolean | null
          carf_details: string | null
          cart_center_designation: boolean | null
          cell_counting_analyzers: boolean | null
          cell_processing_grade: string | null
          cell_processing_lab: boolean | null
          cell_therapy_coordinator: string | null
          cleanroom_facilities: string[] | null
          clia_cert_number: string | null
          clinical_lab_scientist: string | null
          cms_certification_number: string | null
          cold_chain_management: boolean | null
          created_at: string | null
          cryopreservation_capability: boolean | null
          days_of_operation: string[] | null
          dba_names: string | null
          ehr_system: string | null
          email: string | null
          emergency_contact: string | null
          emergency_department: boolean | null
          emergency_equipment: string[] | null
          emergency_hours: string | null
          emergency_response_team: string | null
          emergency_services_access: boolean | null
          facility_license_number: string | null
          facility_type: Database["public"]["Enums"]["facility_type"]
          fact_accreditation: boolean | null
          fax: string | null
          fda_registration_number: string | null
          flow_cytometry_equipment: boolean | null
          gene_therapy_capability: boolean | null
          gmp_compliance: boolean | null
          hours_of_operation: string | null
          icu_beds: number | null
          id: string
          imaging_services: string[] | null
          infusion_center_beds: number | null
          infusion_details: string | null
          infusion_equipment: string[] | null
          infusion_services: boolean | null
          insurance_contracts: string[] | null
          irb_information: string | null
          is_active: boolean | null
          isolation_rooms: number | null
          isolation_rooms_count: number | null
          joint_commission_accred: boolean | null
          joint_commission_id: string | null
          lab_personnel: string | null
          laboratory_services: boolean | null
          laboratory_services_detail: string | null
          languages_supported: string[] | null
          license_expiration_date: string | null
          license_number: string | null
          mailing_address: string | null
          medicaid_provider_number: string | null
          medical_director_name: string | null
          medical_director_npi: string | null
          medicare_provider_number: string | null
          name: string
          npi_number: string | null
          nrc_license: string | null
          nursing_qualifications: string | null
          operating_rooms: number | null
          organization_npi: string | null
          pa_specialist_contact: string | null
          pathology_services: boolean | null
          patient_capacity: string | null
          patient_volume_data: Json | null
          pcr_capabilities: boolean | null
          pharmacist_info: string | null
          pharmacy_services: boolean | null
          pharmacy_services_detail: string | null
          phone: string | null
          physical_address: string | null
          population_served: string[] | null
          qa_description: string | null
          quality_assurance_program: boolean | null
          quality_metrics: Json | null
          radiation_control_permit: string | null
          radiation_detection_equipment: boolean | null
          radiation_safety_officer: string | null
          radioligand_therapy_capability: boolean | null
          radiology_services: boolean | null
          referral_network_partners: string[] | null
          service_capabilities: string[] | null
          services_offered: string[] | null
          specialized_infusion_pumps: boolean | null
          specialty_designations: string[] | null
          state_license_numbers: Json | null
          tax_id: string | null
          treatment_modalities: string[] | null
          treatment_rooms: string | null
          updated_at: string | null
          website: string | null
        }
        Insert: {
          accreditation_bodies?: string[] | null
          accreditation_status?: string | null
          address?: string | null
          administrator_contact?: string | null
          administrator_name?: string | null
          administrator_title?: string | null
          advanced_therapy_certified?: boolean | null
          adverse_event_reporting?: string | null
          apheresis_capability?: boolean | null
          apheresis_technician?: string | null
          backup_power_systems?: boolean | null
          bed_count?: string | null
          billing_contact_info?: string | null
          billing_contact_name?: string | null
          biosafety_committee_approval?: boolean | null
          cap_accreditation?: boolean | null
          cap_details?: string | null
          carf_accreditation?: boolean | null
          carf_details?: string | null
          cart_center_designation?: boolean | null
          cell_counting_analyzers?: boolean | null
          cell_processing_grade?: string | null
          cell_processing_lab?: boolean | null
          cell_therapy_coordinator?: string | null
          cleanroom_facilities?: string[] | null
          clia_cert_number?: string | null
          clinical_lab_scientist?: string | null
          cms_certification_number?: string | null
          cold_chain_management?: boolean | null
          created_at?: string | null
          cryopreservation_capability?: boolean | null
          days_of_operation?: string[] | null
          dba_names?: string | null
          ehr_system?: string | null
          email?: string | null
          emergency_contact?: string | null
          emergency_department?: boolean | null
          emergency_equipment?: string[] | null
          emergency_hours?: string | null
          emergency_response_team?: string | null
          emergency_services_access?: boolean | null
          facility_license_number?: string | null
          facility_type: Database["public"]["Enums"]["facility_type"]
          fact_accreditation?: boolean | null
          fax?: string | null
          fda_registration_number?: string | null
          flow_cytometry_equipment?: boolean | null
          gene_therapy_capability?: boolean | null
          gmp_compliance?: boolean | null
          hours_of_operation?: string | null
          icu_beds?: number | null
          id?: string
          imaging_services?: string[] | null
          infusion_center_beds?: number | null
          infusion_details?: string | null
          infusion_equipment?: string[] | null
          infusion_services?: boolean | null
          insurance_contracts?: string[] | null
          irb_information?: string | null
          is_active?: boolean | null
          isolation_rooms?: number | null
          isolation_rooms_count?: number | null
          joint_commission_accred?: boolean | null
          joint_commission_id?: string | null
          lab_personnel?: string | null
          laboratory_services?: boolean | null
          laboratory_services_detail?: string | null
          languages_supported?: string[] | null
          license_expiration_date?: string | null
          license_number?: string | null
          mailing_address?: string | null
          medicaid_provider_number?: string | null
          medical_director_name?: string | null
          medical_director_npi?: string | null
          medicare_provider_number?: string | null
          name: string
          npi_number?: string | null
          nrc_license?: string | null
          nursing_qualifications?: string | null
          operating_rooms?: number | null
          organization_npi?: string | null
          pa_specialist_contact?: string | null
          pathology_services?: boolean | null
          patient_capacity?: string | null
          patient_volume_data?: Json | null
          pcr_capabilities?: boolean | null
          pharmacist_info?: string | null
          pharmacy_services?: boolean | null
          pharmacy_services_detail?: string | null
          phone?: string | null
          physical_address?: string | null
          population_served?: string[] | null
          qa_description?: string | null
          quality_assurance_program?: boolean | null
          quality_metrics?: Json | null
          radiation_control_permit?: string | null
          radiation_detection_equipment?: boolean | null
          radiation_safety_officer?: string | null
          radioligand_therapy_capability?: boolean | null
          radiology_services?: boolean | null
          referral_network_partners?: string[] | null
          service_capabilities?: string[] | null
          services_offered?: string[] | null
          specialized_infusion_pumps?: boolean | null
          specialty_designations?: string[] | null
          state_license_numbers?: Json | null
          tax_id?: string | null
          treatment_modalities?: string[] | null
          treatment_rooms?: string | null
          updated_at?: string | null
          website?: string | null
        }
        Update: {
          accreditation_bodies?: string[] | null
          accreditation_status?: string | null
          address?: string | null
          administrator_contact?: string | null
          administrator_name?: string | null
          administrator_title?: string | null
          advanced_therapy_certified?: boolean | null
          adverse_event_reporting?: string | null
          apheresis_capability?: boolean | null
          apheresis_technician?: string | null
          backup_power_systems?: boolean | null
          bed_count?: string | null
          billing_contact_info?: string | null
          billing_contact_name?: string | null
          biosafety_committee_approval?: boolean | null
          cap_accreditation?: boolean | null
          cap_details?: string | null
          carf_accreditation?: boolean | null
          carf_details?: string | null
          cart_center_designation?: boolean | null
          cell_counting_analyzers?: boolean | null
          cell_processing_grade?: string | null
          cell_processing_lab?: boolean | null
          cell_therapy_coordinator?: string | null
          cleanroom_facilities?: string[] | null
          clia_cert_number?: string | null
          clinical_lab_scientist?: string | null
          cms_certification_number?: string | null
          cold_chain_management?: boolean | null
          created_at?: string | null
          cryopreservation_capability?: boolean | null
          days_of_operation?: string[] | null
          dba_names?: string | null
          ehr_system?: string | null
          email?: string | null
          emergency_contact?: string | null
          emergency_department?: boolean | null
          emergency_equipment?: string[] | null
          emergency_hours?: string | null
          emergency_response_team?: string | null
          emergency_services_access?: boolean | null
          facility_license_number?: string | null
          facility_type?: Database["public"]["Enums"]["facility_type"]
          fact_accreditation?: boolean | null
          fax?: string | null
          fda_registration_number?: string | null
          flow_cytometry_equipment?: boolean | null
          gene_therapy_capability?: boolean | null
          gmp_compliance?: boolean | null
          hours_of_operation?: string | null
          icu_beds?: number | null
          id?: string
          imaging_services?: string[] | null
          infusion_center_beds?: number | null
          infusion_details?: string | null
          infusion_equipment?: string[] | null
          infusion_services?: boolean | null
          insurance_contracts?: string[] | null
          irb_information?: string | null
          is_active?: boolean | null
          isolation_rooms?: number | null
          isolation_rooms_count?: number | null
          joint_commission_accred?: boolean | null
          joint_commission_id?: string | null
          lab_personnel?: string | null
          laboratory_services?: boolean | null
          laboratory_services_detail?: string | null
          languages_supported?: string[] | null
          license_expiration_date?: string | null
          license_number?: string | null
          mailing_address?: string | null
          medicaid_provider_number?: string | null
          medical_director_name?: string | null
          medical_director_npi?: string | null
          medicare_provider_number?: string | null
          name?: string
          npi_number?: string | null
          nrc_license?: string | null
          nursing_qualifications?: string | null
          operating_rooms?: number | null
          organization_npi?: string | null
          pa_specialist_contact?: string | null
          pathology_services?: boolean | null
          patient_capacity?: string | null
          patient_volume_data?: Json | null
          pcr_capabilities?: boolean | null
          pharmacist_info?: string | null
          pharmacy_services?: boolean | null
          pharmacy_services_detail?: string | null
          phone?: string | null
          physical_address?: string | null
          population_served?: string[] | null
          qa_description?: string | null
          quality_assurance_program?: boolean | null
          quality_metrics?: Json | null
          radiation_control_permit?: string | null
          radiation_detection_equipment?: boolean | null
          radiation_safety_officer?: string | null
          radioligand_therapy_capability?: boolean | null
          radiology_services?: boolean | null
          referral_network_partners?: string[] | null
          service_capabilities?: string[] | null
          services_offered?: string[] | null
          specialized_infusion_pumps?: boolean | null
          specialty_designations?: string[] | null
          state_license_numbers?: Json | null
          tax_id?: string | null
          treatment_modalities?: string[] | null
          treatment_rooms?: string | null
          updated_at?: string | null
          website?: string | null
        }
        Relationships: []
      }
      feedback: {
        Row: {
          created_at: string
          email: string | null
          feedback_type: string
          id: string
          is_anonymous: boolean
          message: string
          name: string | null
          rating: number | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          feedback_type: string
          id?: string
          is_anonymous?: boolean
          message: string
          name?: string | null
          rating?: number | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string | null
          feedback_type?: string
          id?: string
          is_anonymous?: boolean
          message?: string
          name?: string | null
          rating?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      framework_configuration: {
        Row: {
          config_data: Json
          config_name: string
          created_at: string
          id: string
          is_active: boolean | null
          is_global: boolean | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          config_data?: Json
          config_name: string
          created_at?: string
          id?: string
          is_active?: boolean | null
          is_global?: boolean | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          config_data?: Json
          config_name?: string
          created_at?: string
          id?: string
          is_active?: boolean | null
          is_global?: boolean | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      functionality_change_detection: {
        Row: {
          change_description: string
          change_type: string
          detected_at: string
          functionality_id: string | null
          generated_test_cases: string[] | null
          id: string
          impact_analysis: Json | null
          metadata: Json | null
          processed_at: string | null
          processing_status: string | null
          sync_status: string | null
        }
        Insert: {
          change_description: string
          change_type: string
          detected_at?: string
          functionality_id?: string | null
          generated_test_cases?: string[] | null
          id?: string
          impact_analysis?: Json | null
          metadata?: Json | null
          processed_at?: string | null
          processing_status?: string | null
          sync_status?: string | null
        }
        Update: {
          change_description?: string
          change_type?: string
          detected_at?: string
          functionality_id?: string | null
          generated_test_cases?: string[] | null
          id?: string
          impact_analysis?: Json | null
          metadata?: Json | null
          processed_at?: string | null
          processing_status?: string | null
          sync_status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "functionality_change_detection_functionality_id_fkey"
            columns: ["functionality_id"]
            isOneToOne: false
            referencedRelation: "system_functionality_registry"
            referencedColumns: ["id"]
          },
        ]
      }
      genie_configurations: {
        Row: {
          configuration_name: string | null
          created_at: string
          enabled_features: Json | null
          id: string
          is_default: boolean | null
          knowledge_base: string | null
          left_model: string | null
          medical_context: boolean | null
          right_model: string | null
          selected_mcp_tools: Json | null
          selected_mode: string | null
          selected_model_type: string | null
          selected_models: Json | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          configuration_name?: string | null
          created_at?: string
          enabled_features?: Json | null
          id?: string
          is_default?: boolean | null
          knowledge_base?: string | null
          left_model?: string | null
          medical_context?: boolean | null
          right_model?: string | null
          selected_mcp_tools?: Json | null
          selected_mode?: string | null
          selected_model_type?: string | null
          selected_models?: Json | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          configuration_name?: string | null
          created_at?: string
          enabled_features?: Json | null
          id?: string
          is_default?: boolean | null
          knowledge_base?: string | null
          left_model?: string | null
          medical_context?: boolean | null
          right_model?: string | null
          selected_mcp_tools?: Json | null
          selected_mode?: string | null
          selected_model_type?: string | null
          selected_models?: Json | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      genie_conversations: {
        Row: {
          configuration_snapshot: Json | null
          conversation_id: string
          created_at: string
          id: string
          is_active: boolean | null
          messages: Json | null
          session_name: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          configuration_snapshot?: Json | null
          conversation_id: string
          created_at?: string
          id?: string
          is_active?: boolean | null
          messages?: Json | null
          session_name?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          configuration_snapshot?: Json | null
          conversation_id?: string
          created_at?: string
          id?: string
          is_active?: boolean | null
          messages?: Json | null
          session_name?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      imported_data: {
        Row: {
          created_at: string
          id: string
          import_session_id: string
          row_data: Json
          row_index: number
          table_schema_id: string | null
          user_id: string
          validation_errors: Json | null
          validation_status: string
        }
        Insert: {
          created_at?: string
          id?: string
          import_session_id: string
          row_data: Json
          row_index: number
          table_schema_id?: string | null
          user_id: string
          validation_errors?: Json | null
          validation_status?: string
        }
        Update: {
          created_at?: string
          id?: string
          import_session_id?: string
          row_data?: Json
          row_index?: number
          table_schema_id?: string | null
          user_id?: string
          validation_errors?: Json | null
          validation_status?: string
        }
        Relationships: [
          {
            foreignKeyName: "imported_data_import_session_id_fkey"
            columns: ["import_session_id"]
            isOneToOne: false
            referencedRelation: "data_import_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "imported_data_table_schema_id_fkey"
            columns: ["table_schema_id"]
            isOneToOne: false
            referencedRelation: "dynamic_table_schemas"
            referencedColumns: ["id"]
          },
        ]
      }
      insurance_coverages: {
        Row: {
          annual_deductible: number | null
          annual_deductible_family: string | null
          annual_deductible_individual: string | null
          annual_maximum_benefit: string | null
          benefits_confirmed: boolean | null
          bin_number: string | null
          brand_name_copay: string | null
          car_t_coverage: boolean | null
          card_back_image_url: string | null
          card_front_image_url: string | null
          card_uploaded_date: string | null
          card_verified: boolean | null
          case_management_required: boolean | null
          category: string
          claims_phone: string | null
          clinical_trial_coverage: boolean | null
          coinsurance_percentage: number | null
          company_name: string
          compassionate_use_coverage: boolean | null
          copay_amount: number | null
          coverage_decision_timeline: string | null
          coverage_tier: string | null
          created_at: string | null
          customer_service_hours: string | null
          customer_service_hours_insurance: string | null
          date_of_injury: string | null
          deductible_met_to_date: string | null
          diagnostic_test_coinsurance: string | null
          dual_eligible: boolean | null
          emergency_room_copay: string | null
          employer_name: string | null
          enrollment_instance_id: string | null
          experimental_coverage: boolean | null
          formulary_tier_structure: string | null
          formulary_type: string | null
          gene_therapy_coverage: boolean | null
          generic_copay: string | null
          group_number: string | null
          high_cost_therapy_coverage: boolean | null
          id: string
          immunotherapy_coverage: boolean | null
          inpatient_hospital_copay: string | null
          is_active: boolean | null
          lifetime_maximum_benefit: string | null
          mail_order_benefits: boolean | null
          mail_order_pharmacy: boolean | null
          medicaid_coverage: boolean | null
          medicaid_id_number: string | null
          medicaid_plan_type: string | null
          medical_vs_pharmacy_benefit: string | null
          medicare_id_number: string | null
          medicare_part_a: boolean | null
          medicare_part_b: boolean | null
          medicare_part_c: string | null
          medicare_part_d: string | null
          medicare_type: string | null
          member_services_phone: string | null
          military_branch: string | null
          mobile_app_available: boolean | null
          mobile_app_available_insurance: boolean | null
          network_status: string | null
          non_preferred_brand_copay: string | null
          office_visit_copay: string | null
          out_of_pocket_max_family: string | null
          out_of_pocket_max_individual: string | null
          out_of_pocket_maximum: number | null
          out_of_pocket_met_to_date: string | null
          outpatient_surgery_copay: string | null
          patient_id: string | null
          pcn_number: string | null
          pharmacy_benefit_manager: string | null
          pharmacy_benefits_active: boolean | null
          pharmacy_deductible: string | null
          pharmacy_group_number: string | null
          pharmacy_id_number: string | null
          pharmacy_network: string | null
          pharmacy_services_phone: string | null
          plan_name: string | null
          plan_type: string | null
          policy_effective_date: string | null
          policy_expiration_date: string | null
          policy_holder_dob: string | null
          policy_holder_name: string | null
          policy_holder_ssn_encrypted: string | null
          policy_id: string
          policy_status: string | null
          precertification_required: boolean | null
          precertification_timeline: string | null
          preferred_brand_copay: string | null
          preferred_pharmacies: string[] | null
          preventive_care_coverage: string | null
          prior_auth_approval_date: string | null
          prior_auth_expiration_date: string | null
          prior_auth_phone: string | null
          prior_auth_reference_number: string | null
          prior_auth_required: boolean | null
          prior_auth_required_advanced: boolean | null
          prior_auth_required_meds: boolean | null
          prior_auth_status: string | null
          prior_authorization_required: boolean | null
          priority: string
          priority_group: string | null
          provider_services_phone: string | null
          quantity_limits: boolean | null
          radioligand_therapy_coverage: boolean | null
          referral_required: boolean | null
          relationship_to_patient: string | null
          service_connected_rating: string | null
          site_of_care_restrictions: string | null
          specialist_visit_copay: string | null
          specialty_drug_copay: string | null
          specialty_drug_tier_assignment: string | null
          specialty_pharmacy_network: string | null
          specialty_pharmacy_required: boolean | null
          sponsor_military_id: string | null
          sponsor_status: string | null
          state_medicaid_program: string | null
          step_therapy_requirements: boolean | null
          tricare_plan_type: string | null
          tricare_region: string | null
          updated_at: string | null
          urgent_care_copay: string | null
          va_file_number: string | null
          verification_date: string | null
          verification_status: string | null
          verified_by: string | null
          website_url: string | null
          website_url_insurance: string | null
          workers_comp_carrier: string | null
          workers_comp_claim_number: string | null
        }
        Insert: {
          annual_deductible?: number | null
          annual_deductible_family?: string | null
          annual_deductible_individual?: string | null
          annual_maximum_benefit?: string | null
          benefits_confirmed?: boolean | null
          bin_number?: string | null
          brand_name_copay?: string | null
          car_t_coverage?: boolean | null
          card_back_image_url?: string | null
          card_front_image_url?: string | null
          card_uploaded_date?: string | null
          card_verified?: boolean | null
          case_management_required?: boolean | null
          category: string
          claims_phone?: string | null
          clinical_trial_coverage?: boolean | null
          coinsurance_percentage?: number | null
          company_name: string
          compassionate_use_coverage?: boolean | null
          copay_amount?: number | null
          coverage_decision_timeline?: string | null
          coverage_tier?: string | null
          created_at?: string | null
          customer_service_hours?: string | null
          customer_service_hours_insurance?: string | null
          date_of_injury?: string | null
          deductible_met_to_date?: string | null
          diagnostic_test_coinsurance?: string | null
          dual_eligible?: boolean | null
          emergency_room_copay?: string | null
          employer_name?: string | null
          enrollment_instance_id?: string | null
          experimental_coverage?: boolean | null
          formulary_tier_structure?: string | null
          formulary_type?: string | null
          gene_therapy_coverage?: boolean | null
          generic_copay?: string | null
          group_number?: string | null
          high_cost_therapy_coverage?: boolean | null
          id?: string
          immunotherapy_coverage?: boolean | null
          inpatient_hospital_copay?: string | null
          is_active?: boolean | null
          lifetime_maximum_benefit?: string | null
          mail_order_benefits?: boolean | null
          mail_order_pharmacy?: boolean | null
          medicaid_coverage?: boolean | null
          medicaid_id_number?: string | null
          medicaid_plan_type?: string | null
          medical_vs_pharmacy_benefit?: string | null
          medicare_id_number?: string | null
          medicare_part_a?: boolean | null
          medicare_part_b?: boolean | null
          medicare_part_c?: string | null
          medicare_part_d?: string | null
          medicare_type?: string | null
          member_services_phone?: string | null
          military_branch?: string | null
          mobile_app_available?: boolean | null
          mobile_app_available_insurance?: boolean | null
          network_status?: string | null
          non_preferred_brand_copay?: string | null
          office_visit_copay?: string | null
          out_of_pocket_max_family?: string | null
          out_of_pocket_max_individual?: string | null
          out_of_pocket_maximum?: number | null
          out_of_pocket_met_to_date?: string | null
          outpatient_surgery_copay?: string | null
          patient_id?: string | null
          pcn_number?: string | null
          pharmacy_benefit_manager?: string | null
          pharmacy_benefits_active?: boolean | null
          pharmacy_deductible?: string | null
          pharmacy_group_number?: string | null
          pharmacy_id_number?: string | null
          pharmacy_network?: string | null
          pharmacy_services_phone?: string | null
          plan_name?: string | null
          plan_type?: string | null
          policy_effective_date?: string | null
          policy_expiration_date?: string | null
          policy_holder_dob?: string | null
          policy_holder_name?: string | null
          policy_holder_ssn_encrypted?: string | null
          policy_id: string
          policy_status?: string | null
          precertification_required?: boolean | null
          precertification_timeline?: string | null
          preferred_brand_copay?: string | null
          preferred_pharmacies?: string[] | null
          preventive_care_coverage?: string | null
          prior_auth_approval_date?: string | null
          prior_auth_expiration_date?: string | null
          prior_auth_phone?: string | null
          prior_auth_reference_number?: string | null
          prior_auth_required?: boolean | null
          prior_auth_required_advanced?: boolean | null
          prior_auth_required_meds?: boolean | null
          prior_auth_status?: string | null
          prior_authorization_required?: boolean | null
          priority: string
          priority_group?: string | null
          provider_services_phone?: string | null
          quantity_limits?: boolean | null
          radioligand_therapy_coverage?: boolean | null
          referral_required?: boolean | null
          relationship_to_patient?: string | null
          service_connected_rating?: string | null
          site_of_care_restrictions?: string | null
          specialist_visit_copay?: string | null
          specialty_drug_copay?: string | null
          specialty_drug_tier_assignment?: string | null
          specialty_pharmacy_network?: string | null
          specialty_pharmacy_required?: boolean | null
          sponsor_military_id?: string | null
          sponsor_status?: string | null
          state_medicaid_program?: string | null
          step_therapy_requirements?: boolean | null
          tricare_plan_type?: string | null
          tricare_region?: string | null
          updated_at?: string | null
          urgent_care_copay?: string | null
          va_file_number?: string | null
          verification_date?: string | null
          verification_status?: string | null
          verified_by?: string | null
          website_url?: string | null
          website_url_insurance?: string | null
          workers_comp_carrier?: string | null
          workers_comp_claim_number?: string | null
        }
        Update: {
          annual_deductible?: number | null
          annual_deductible_family?: string | null
          annual_deductible_individual?: string | null
          annual_maximum_benefit?: string | null
          benefits_confirmed?: boolean | null
          bin_number?: string | null
          brand_name_copay?: string | null
          car_t_coverage?: boolean | null
          card_back_image_url?: string | null
          card_front_image_url?: string | null
          card_uploaded_date?: string | null
          card_verified?: boolean | null
          case_management_required?: boolean | null
          category?: string
          claims_phone?: string | null
          clinical_trial_coverage?: boolean | null
          coinsurance_percentage?: number | null
          company_name?: string
          compassionate_use_coverage?: boolean | null
          copay_amount?: number | null
          coverage_decision_timeline?: string | null
          coverage_tier?: string | null
          created_at?: string | null
          customer_service_hours?: string | null
          customer_service_hours_insurance?: string | null
          date_of_injury?: string | null
          deductible_met_to_date?: string | null
          diagnostic_test_coinsurance?: string | null
          dual_eligible?: boolean | null
          emergency_room_copay?: string | null
          employer_name?: string | null
          enrollment_instance_id?: string | null
          experimental_coverage?: boolean | null
          formulary_tier_structure?: string | null
          formulary_type?: string | null
          gene_therapy_coverage?: boolean | null
          generic_copay?: string | null
          group_number?: string | null
          high_cost_therapy_coverage?: boolean | null
          id?: string
          immunotherapy_coverage?: boolean | null
          inpatient_hospital_copay?: string | null
          is_active?: boolean | null
          lifetime_maximum_benefit?: string | null
          mail_order_benefits?: boolean | null
          mail_order_pharmacy?: boolean | null
          medicaid_coverage?: boolean | null
          medicaid_id_number?: string | null
          medicaid_plan_type?: string | null
          medical_vs_pharmacy_benefit?: string | null
          medicare_id_number?: string | null
          medicare_part_a?: boolean | null
          medicare_part_b?: boolean | null
          medicare_part_c?: string | null
          medicare_part_d?: string | null
          medicare_type?: string | null
          member_services_phone?: string | null
          military_branch?: string | null
          mobile_app_available?: boolean | null
          mobile_app_available_insurance?: boolean | null
          network_status?: string | null
          non_preferred_brand_copay?: string | null
          office_visit_copay?: string | null
          out_of_pocket_max_family?: string | null
          out_of_pocket_max_individual?: string | null
          out_of_pocket_maximum?: number | null
          out_of_pocket_met_to_date?: string | null
          outpatient_surgery_copay?: string | null
          patient_id?: string | null
          pcn_number?: string | null
          pharmacy_benefit_manager?: string | null
          pharmacy_benefits_active?: boolean | null
          pharmacy_deductible?: string | null
          pharmacy_group_number?: string | null
          pharmacy_id_number?: string | null
          pharmacy_network?: string | null
          pharmacy_services_phone?: string | null
          plan_name?: string | null
          plan_type?: string | null
          policy_effective_date?: string | null
          policy_expiration_date?: string | null
          policy_holder_dob?: string | null
          policy_holder_name?: string | null
          policy_holder_ssn_encrypted?: string | null
          policy_id?: string
          policy_status?: string | null
          precertification_required?: boolean | null
          precertification_timeline?: string | null
          preferred_brand_copay?: string | null
          preferred_pharmacies?: string[] | null
          preventive_care_coverage?: string | null
          prior_auth_approval_date?: string | null
          prior_auth_expiration_date?: string | null
          prior_auth_phone?: string | null
          prior_auth_reference_number?: string | null
          prior_auth_required?: boolean | null
          prior_auth_required_advanced?: boolean | null
          prior_auth_required_meds?: boolean | null
          prior_auth_status?: string | null
          prior_authorization_required?: boolean | null
          priority?: string
          priority_group?: string | null
          provider_services_phone?: string | null
          quantity_limits?: boolean | null
          radioligand_therapy_coverage?: boolean | null
          referral_required?: boolean | null
          relationship_to_patient?: string | null
          service_connected_rating?: string | null
          site_of_care_restrictions?: string | null
          specialist_visit_copay?: string | null
          specialty_drug_copay?: string | null
          specialty_drug_tier_assignment?: string | null
          specialty_pharmacy_network?: string | null
          specialty_pharmacy_required?: boolean | null
          sponsor_military_id?: string | null
          sponsor_status?: string | null
          state_medicaid_program?: string | null
          step_therapy_requirements?: boolean | null
          tricare_plan_type?: string | null
          tricare_region?: string | null
          updated_at?: string | null
          urgent_care_copay?: string | null
          va_file_number?: string | null
          verification_date?: string | null
          verification_status?: string | null
          verified_by?: string | null
          website_url?: string | null
          website_url_insurance?: string | null
          workers_comp_carrier?: string | null
          workers_comp_claim_number?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "insurance_coverages_enrollment_instance_id_fkey"
            columns: ["enrollment_instance_id"]
            isOneToOne: false
            referencedRelation: "enrollment_instances"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "insurance_coverages_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      insurance_document_uploads: {
        Row: {
          created_at: string
          document_type: string
          file_name: string
          file_path: string
          file_size: number
          id: string
          insurance_tier_id: string
          metadata: Json | null
          mime_type: string
          patient_id: string
          updated_at: string
          uploaded_by: string | null
        }
        Insert: {
          created_at?: string
          document_type: string
          file_name: string
          file_path: string
          file_size: number
          id?: string
          insurance_tier_id: string
          metadata?: Json | null
          mime_type: string
          patient_id: string
          updated_at?: string
          uploaded_by?: string | null
        }
        Update: {
          created_at?: string
          document_type?: string
          file_name?: string
          file_path?: string
          file_size?: number
          id?: string
          insurance_tier_id?: string
          metadata?: Json | null
          mime_type?: string
          patient_id?: string
          updated_at?: string
          uploaded_by?: string | null
        }
        Relationships: []
      }
      issue_fixes: {
        Row: {
          category: string
          created_at: string
          fix_method: string
          fixed_at: string
          id: string
          issue_message: string
          issue_severity: string
          issue_source: string
          issue_type: string
          metadata: Json | null
          user_id: string
        }
        Insert: {
          category: string
          created_at?: string
          fix_method: string
          fixed_at?: string
          id?: string
          issue_message: string
          issue_severity: string
          issue_source: string
          issue_type: string
          metadata?: Json | null
          user_id: string
        }
        Update: {
          category?: string
          created_at?: string
          fix_method?: string
          fixed_at?: string
          id?: string
          issue_message?: string
          issue_severity?: string
          issue_source?: string
          issue_type?: string
          metadata?: Json | null
          user_id?: string
        }
        Relationships: []
      }
      journey_stage_transitions: {
        Row: {
          conversation_id: string
          created_at: string | null
          from_stage_id: string | null
          id: string
          to_stage_id: string
          transition_data: Json | null
          transition_reason: string | null
          triggered_by: string | null
        }
        Insert: {
          conversation_id: string
          created_at?: string | null
          from_stage_id?: string | null
          id?: string
          to_stage_id: string
          transition_data?: Json | null
          transition_reason?: string | null
          triggered_by?: string | null
        }
        Update: {
          conversation_id?: string
          created_at?: string | null
          from_stage_id?: string | null
          id?: string
          to_stage_id?: string
          transition_data?: Json | null
          transition_reason?: string | null
          triggered_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_journey_transitions_conversation"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "agent_conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      knowledge_base: {
        Row: {
          category: string
          content_type: string | null
          created_at: string
          created_by: string | null
          description: string | null
          embeddings: string | null
          healthcare_tags: string[] | null
          id: string
          is_active: boolean
          metadata: Json | null
          modality_type: string | null
          name: string
          processed_content: string | null
          raw_content: string | null
          regulatory_status: string | null
          source_type: string
          source_url: string | null
          treatment_category: string | null
          updated_at: string
        }
        Insert: {
          category: string
          content_type?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          embeddings?: string | null
          healthcare_tags?: string[] | null
          id?: string
          is_active?: boolean
          metadata?: Json | null
          modality_type?: string | null
          name: string
          processed_content?: string | null
          raw_content?: string | null
          regulatory_status?: string | null
          source_type: string
          source_url?: string | null
          treatment_category?: string | null
          updated_at?: string
        }
        Update: {
          category?: string
          content_type?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          embeddings?: string | null
          healthcare_tags?: string[] | null
          id?: string
          is_active?: boolean
          metadata?: Json | null
          modality_type?: string | null
          name?: string
          processed_content?: string | null
          raw_content?: string | null
          regulatory_status?: string | null
          source_type?: string
          source_url?: string | null
          treatment_category?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      knowledge_base_configs: {
        Row: {
          configuration: Json
          created_at: string | null
          created_by: string | null
          id: string
          is_enabled: boolean | null
          knowledge_type: string
          metadata: Json | null
          node_config_id: string | null
          source_column: string | null
          source_table: string | null
          updated_at: string | null
        }
        Insert: {
          configuration?: Json
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_enabled?: boolean | null
          knowledge_type: string
          metadata?: Json | null
          node_config_id?: string | null
          source_column?: string | null
          source_table?: string | null
          updated_at?: string | null
        }
        Update: {
          configuration?: Json
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_enabled?: boolean | null
          knowledge_type?: string
          metadata?: Json | null
          node_config_id?: string | null
          source_column?: string | null
          source_table?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "knowledge_base_configs_node_config_id_fkey"
            columns: ["node_config_id"]
            isOneToOne: false
            referencedRelation: "nodes_config"
            referencedColumns: ["id"]
          },
        ]
      }
      knowledge_base_contributions: {
        Row: {
          content_summary: string | null
          context_sources: Json | null
          contribution_type: string
          conversation_id: string | null
          created_at: string
          id: string
          rag_enhancement_data: Json | null
          relevance_score: number | null
          user_id: string | null
        }
        Insert: {
          content_summary?: string | null
          context_sources?: Json | null
          contribution_type?: string
          conversation_id?: string | null
          created_at?: string
          id?: string
          rag_enhancement_data?: Json | null
          relevance_score?: number | null
          user_id?: string | null
        }
        Update: {
          content_summary?: string | null
          context_sources?: Json | null
          contribution_type?: string
          conversation_id?: string | null
          created_at?: string
          id?: string
          rag_enhancement_data?: Json | null
          relevance_score?: number | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "knowledge_base_contributions_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "user_conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      labeling_projects: {
        Row: {
          annotation_guidelines: string | null
          created_at: string
          created_by: string | null
          dataset_info: Json | null
          healthcare_domain: string | null
          id: string
          labeling_config: Json
          name: string
          project_type: string
          quality_metrics: Json | null
          status: string
          updated_at: string
        }
        Insert: {
          annotation_guidelines?: string | null
          created_at?: string
          created_by?: string | null
          dataset_info?: Json | null
          healthcare_domain?: string | null
          id?: string
          labeling_config: Json
          name: string
          project_type: string
          quality_metrics?: Json | null
          status?: string
          updated_at?: string
        }
        Update: {
          annotation_guidelines?: string | null
          created_at?: string
          created_by?: string | null
          dataset_info?: Json | null
          healthcare_domain?: string | null
          id?: string
          labeling_config?: Json
          name?: string
          project_type?: string
          quality_metrics?: Json | null
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      manufacturers: {
        Row: {
          contact_info: Json | null
          created_at: string | null
          headquarters_location: string | null
          id: string
          is_active: boolean | null
          manufacturer_type: string | null
          manufacturing_capabilities: string[] | null
          name: string
          partnership_tier: string | null
          quality_certifications: string[] | null
          regulatory_status: Json | null
          updated_at: string | null
        }
        Insert: {
          contact_info?: Json | null
          created_at?: string | null
          headquarters_location?: string | null
          id?: string
          is_active?: boolean | null
          manufacturer_type?: string | null
          manufacturing_capabilities?: string[] | null
          name: string
          partnership_tier?: string | null
          quality_certifications?: string[] | null
          regulatory_status?: Json | null
          updated_at?: string | null
        }
        Update: {
          contact_info?: Json | null
          created_at?: string | null
          headquarters_location?: string | null
          id?: string
          is_active?: boolean | null
          manufacturer_type?: string | null
          manufacturing_capabilities?: string[] | null
          name?: string
          partnership_tier?: string | null
          quality_certifications?: string[] | null
          regulatory_status?: Json | null
          updated_at?: string | null
        }
        Relationships: []
      }
      marketplace_listings: {
        Row: {
          category: string
          created_at: string
          demo_url: string | null
          external_api_id: string
          featured: boolean | null
          featured_order: number | null
          id: string
          is_verified: boolean | null
          listing_status: string
          logo_url: string | null
          long_description: string | null
          metrics: Json | null
          pricing_info: Json | null
          published_at: string | null
          screenshots: string[] | null
          seo_description: string | null
          seo_keywords: string[] | null
          short_description: string
          subcategory: string | null
          support_url: string | null
          title: string
          updated_at: string
          verification_date: string | null
          video_url: string | null
        }
        Insert: {
          category: string
          created_at?: string
          demo_url?: string | null
          external_api_id: string
          featured?: boolean | null
          featured_order?: number | null
          id?: string
          is_verified?: boolean | null
          listing_status?: string
          logo_url?: string | null
          long_description?: string | null
          metrics?: Json | null
          pricing_info?: Json | null
          published_at?: string | null
          screenshots?: string[] | null
          seo_description?: string | null
          seo_keywords?: string[] | null
          short_description: string
          subcategory?: string | null
          support_url?: string | null
          title: string
          updated_at?: string
          verification_date?: string | null
          video_url?: string | null
        }
        Update: {
          category?: string
          created_at?: string
          demo_url?: string | null
          external_api_id?: string
          featured?: boolean | null
          featured_order?: number | null
          id?: string
          is_verified?: boolean | null
          listing_status?: string
          logo_url?: string | null
          long_description?: string | null
          metrics?: Json | null
          pricing_info?: Json | null
          published_at?: string | null
          screenshots?: string[] | null
          seo_description?: string | null
          seo_keywords?: string[] | null
          short_description?: string
          subcategory?: string | null
          support_url?: string | null
          title?: string
          updated_at?: string
          verification_date?: string | null
          video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "marketplace_listings_external_api_id_fkey"
            columns: ["external_api_id"]
            isOneToOne: false
            referencedRelation: "external_api_registry"
            referencedColumns: ["id"]
          },
        ]
      }
      mcp_configurations: {
        Row: {
          api_endpoints: Json | null
          created_at: string
          created_by: string | null
          description: string | null
          filters: Json | null
          hybrid_config: Json | null
          id: string
          is_active: boolean
          mcp_type: string
          memory_config: Json | null
          module_context: string
          name: string
          permissions: Json
          schema_name: string
          tables: string[]
          updated_at: string
        }
        Insert: {
          api_endpoints?: Json | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          filters?: Json | null
          hybrid_config?: Json | null
          id?: string
          is_active?: boolean
          mcp_type: string
          memory_config?: Json | null
          module_context?: string
          name: string
          permissions?: Json
          schema_name?: string
          tables?: string[]
          updated_at?: string
        }
        Update: {
          api_endpoints?: Json | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          filters?: Json | null
          hybrid_config?: Json | null
          id?: string
          is_active?: boolean
          mcp_type?: string
          memory_config?: Json | null
          module_context?: string
          name?: string
          permissions?: Json
          schema_name?: string
          tables?: string[]
          updated_at?: string
        }
        Relationships: []
      }
      mcp_servers: {
        Row: {
          capabilities: Json | null
          connection_config: Json | null
          created_at: string
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          reliability_score: number | null
          server_id: string
          status: string
          type: string
          updated_at: string
        }
        Insert: {
          capabilities?: Json | null
          connection_config?: Json | null
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          reliability_score?: number | null
          server_id: string
          status?: string
          type: string
          updated_at?: string
        }
        Update: {
          capabilities?: Json | null
          connection_config?: Json | null
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          reliability_score?: number | null
          server_id?: string
          status?: string
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
      modalities: {
        Row: {
          administration_requirements: Json | null
          cold_chain_requirements: Json | null
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          manufacturing_complexity: string | null
          modality_type: Database["public"]["Enums"]["modality_type"]
          name: string
          shelf_life_considerations: string | null
          updated_at: string | null
        }
        Insert: {
          administration_requirements?: Json | null
          cold_chain_requirements?: Json | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          manufacturing_complexity?: string | null
          modality_type: Database["public"]["Enums"]["modality_type"]
          name: string
          shelf_life_considerations?: string | null
          updated_at?: string | null
        }
        Update: {
          administration_requirements?: Json | null
          cold_chain_requirements?: Json | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          manufacturing_complexity?: string | null
          modality_type?: Database["public"]["Enums"]["modality_type"]
          name?: string
          shelf_life_considerations?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      module_permissions: {
        Row: {
          created_at: string | null
          id: string
          module_id: string | null
          permission_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          module_id?: string | null
          permission_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          module_id?: string | null
          permission_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "module_permissions_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "modules"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "module_permissions_permission_id_fkey"
            columns: ["permission_id"]
            isOneToOne: false
            referencedRelation: "permissions"
            referencedColumns: ["id"]
          },
        ]
      }
      modules: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      multi_model_conversations: {
        Row: {
          active_models: Json
          context_data: Json | null
          conversation_history: Json
          conversation_mode: string
          created_at: string | null
          id: string
          model_responses: Json | null
          session_id: string
          status: string
          updated_at: string | null
          user_id: string | null
          user_preferences: Json | null
        }
        Insert: {
          active_models?: Json
          context_data?: Json | null
          conversation_history?: Json
          conversation_mode: string
          created_at?: string | null
          id?: string
          model_responses?: Json | null
          session_id: string
          status?: string
          updated_at?: string | null
          user_id?: string | null
          user_preferences?: Json | null
        }
        Update: {
          active_models?: Json
          context_data?: Json | null
          conversation_history?: Json
          conversation_mode?: string
          created_at?: string | null
          id?: string
          model_responses?: Json | null
          session_id?: string
          status?: string
          updated_at?: string | null
          user_id?: string | null
          user_preferences?: Json | null
        }
        Relationships: []
      }
      network_monitoring: {
        Row: {
          created_at: string | null
          duration_ms: number | null
          end_time: string | null
          id: string
          logs: Json | null
          metrics: Json | null
          monitoring_type: string
          operation_name: string
          session_id: string
          span_id: string | null
          start_time: string
          status: string
          tags: Json | null
          trace_id: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          duration_ms?: number | null
          end_time?: string | null
          id?: string
          logs?: Json | null
          metrics?: Json | null
          monitoring_type: string
          operation_name: string
          session_id: string
          span_id?: string | null
          start_time: string
          status: string
          tags?: Json | null
          trace_id?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          duration_ms?: number | null
          end_time?: string | null
          id?: string
          logs?: Json | null
          metrics?: Json | null
          monitoring_type?: string
          operation_name?: string
          session_id?: string
          span_id?: string | null
          start_time?: string
          status?: string
          tags?: Json | null
          trace_id?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      newsletter_campaigns: {
        Row: {
          created_at: string
          id: string
          name: string
          sent_at: string | null
          status: string
          subject: string
          template_data: Json | null
          template_name: string
          total_sent: number | null
          total_subscribers: number | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          sent_at?: string | null
          status?: string
          subject: string
          template_data?: Json | null
          template_name: string
          total_sent?: number | null
          total_subscribers?: number | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          sent_at?: string | null
          status?: string
          subject?: string
          template_data?: Json | null
          template_name?: string
          total_sent?: number | null
          total_subscribers?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      newsletter_subscribers: {
        Row: {
          created_at: string
          email: string
          id: string
          is_active: boolean
          preferences: Json | null
          subscribed_at: string
          subscription_source: string | null
          unsubscribed_at: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          is_active?: boolean
          preferences?: Json | null
          subscribed_at?: string
          subscription_source?: string | null
          unsubscribed_at?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          is_active?: boolean
          preferences?: Json | null
          subscribed_at?: string
          subscription_source?: string | null
          unsubscribed_at?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      node_analytics: {
        Row: {
          average_execution_time_ms: number | null
          common_connections: Json | null
          created_at: string | null
          failure_count: number | null
          id: string
          node_id: string | null
          node_type: string
          performance_metrics: Json | null
          success_count: number | null
          total_execution_time_ms: number | null
          updated_at: string | null
          usage_count: number | null
          user_rating: number | null
          workflow_id: string | null
        }
        Insert: {
          average_execution_time_ms?: number | null
          common_connections?: Json | null
          created_at?: string | null
          failure_count?: number | null
          id?: string
          node_id?: string | null
          node_type: string
          performance_metrics?: Json | null
          success_count?: number | null
          total_execution_time_ms?: number | null
          updated_at?: string | null
          usage_count?: number | null
          user_rating?: number | null
          workflow_id?: string | null
        }
        Update: {
          average_execution_time_ms?: number | null
          common_connections?: Json | null
          created_at?: string | null
          failure_count?: number | null
          id?: string
          node_id?: string | null
          node_type?: string
          performance_metrics?: Json | null
          success_count?: number | null
          total_execution_time_ms?: number | null
          updated_at?: string | null
          usage_count?: number | null
          user_rating?: number | null
          workflow_id?: string | null
        }
        Relationships: []
      }
      node_config_templates: {
        Row: {
          category: string | null
          config_schema: Json
          created_at: string | null
          created_by: string | null
          default_config: Json
          description: string | null
          id: string
          is_active: boolean | null
          is_system_template: boolean | null
          node_type: string
          template_name: string
          updated_at: string | null
          usage_count: number | null
          validation_rules: Json | null
        }
        Insert: {
          category?: string | null
          config_schema?: Json
          created_at?: string | null
          created_by?: string | null
          default_config?: Json
          description?: string | null
          id?: string
          is_active?: boolean | null
          is_system_template?: boolean | null
          node_type: string
          template_name: string
          updated_at?: string | null
          usage_count?: number | null
          validation_rules?: Json | null
        }
        Update: {
          category?: string | null
          config_schema?: Json
          created_at?: string | null
          created_by?: string | null
          default_config?: Json
          description?: string | null
          id?: string
          is_active?: boolean | null
          is_system_template?: boolean | null
          node_type?: string
          template_name?: string
          updated_at?: string | null
          usage_count?: number | null
          validation_rules?: Json | null
        }
        Relationships: []
      }
      node_suggestions: {
        Row: {
          applied_at: string | null
          confidence_score: number | null
          config_template: Json | null
          created_at: string | null
          dependencies: Json | null
          description: string | null
          expires_at: string | null
          id: string
          implementation_notes: string | null
          is_applied: boolean | null
          node_type: string
          priority: string | null
          suggestion_type: string
          title: string
          user_id: string | null
          workflow_id: string | null
        }
        Insert: {
          applied_at?: string | null
          confidence_score?: number | null
          config_template?: Json | null
          created_at?: string | null
          dependencies?: Json | null
          description?: string | null
          expires_at?: string | null
          id?: string
          implementation_notes?: string | null
          is_applied?: boolean | null
          node_type: string
          priority?: string | null
          suggestion_type: string
          title: string
          user_id?: string | null
          workflow_id?: string | null
        }
        Update: {
          applied_at?: string | null
          confidence_score?: number | null
          config_template?: Json | null
          created_at?: string | null
          dependencies?: Json | null
          description?: string | null
          expires_at?: string | null
          id?: string
          implementation_notes?: string | null
          is_applied?: boolean | null
          node_type?: string
          priority?: string | null
          suggestion_type?: string
          title?: string
          user_id?: string | null
          workflow_id?: string | null
        }
        Relationships: []
      }
      node_usage_events: {
        Row: {
          action: string
          created_at: string | null
          error_details: Json | null
          execution_time_ms: number | null
          id: string
          metadata: Json | null
          node_id: string
          node_type: string
          success: boolean | null
          user_id: string | null
          workflow_id: string | null
        }
        Insert: {
          action: string
          created_at?: string | null
          error_details?: Json | null
          execution_time_ms?: number | null
          id?: string
          metadata?: Json | null
          node_id: string
          node_type: string
          success?: boolean | null
          user_id?: string | null
          workflow_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string | null
          error_details?: Json | null
          execution_time_ms?: number | null
          id?: string
          metadata?: Json | null
          node_id?: string
          node_type?: string
          success?: boolean | null
          user_id?: string | null
          workflow_id?: string | null
        }
        Relationships: []
      }
      nodes_config: {
        Row: {
          agent_session_id: string | null
          change_summary: string | null
          configuration: Json
          created_at: string | null
          created_by: string | null
          id: string
          is_active: boolean | null
          node_id: string
          node_type: string
          updated_at: string | null
          version: number | null
          workflow_id: string | null
        }
        Insert: {
          agent_session_id?: string | null
          change_summary?: string | null
          configuration?: Json
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_active?: boolean | null
          node_id: string
          node_type: string
          updated_at?: string | null
          version?: number | null
          workflow_id?: string | null
        }
        Update: {
          agent_session_id?: string | null
          change_summary?: string | null
          configuration?: Json
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_active?: boolean | null
          node_id?: string
          node_type?: string
          updated_at?: string | null
          version?: number | null
          workflow_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "nodes_config_agent_session_id_fkey"
            columns: ["agent_session_id"]
            isOneToOne: false
            referencedRelation: "agent_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "nodes_config_workflow_id_fkey"
            columns: ["workflow_id"]
            isOneToOne: false
            referencedRelation: "agent_workflows"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_preferences: {
        Row: {
          created_at: string | null
          email_notifications: boolean | null
          id: string
          marketing_emails: boolean | null
          module_updates: boolean | null
          notification_frequency: string | null
          push_notifications: boolean | null
          quiet_hours_end: string | null
          quiet_hours_start: string | null
          security_alerts: boolean | null
          sms_notifications: boolean | null
          system_updates: boolean | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          email_notifications?: boolean | null
          id?: string
          marketing_emails?: boolean | null
          module_updates?: boolean | null
          notification_frequency?: string | null
          push_notifications?: boolean | null
          quiet_hours_end?: string | null
          quiet_hours_start?: string | null
          security_alerts?: boolean | null
          sms_notifications?: boolean | null
          system_updates?: boolean | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          email_notifications?: boolean | null
          id?: string
          marketing_emails?: boolean | null
          module_updates?: boolean | null
          notification_frequency?: string | null
          push_notifications?: boolean | null
          quiet_hours_end?: string | null
          quiet_hours_start?: string | null
          security_alerts?: boolean | null
          sms_notifications?: boolean | null
          system_updates?: boolean | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      npi_verification_results: {
        Row: {
          confidence_score: number
          created_at: string
          enrollment_id: string | null
          facility_id: string | null
          id: string
          issues: string[] | null
          npi: string
          provider_type: string
          updated_at: string
          verification_data: Json
          verification_status: string
          verified_at: string
        }
        Insert: {
          confidence_score?: number
          created_at?: string
          enrollment_id?: string | null
          facility_id?: string | null
          id?: string
          issues?: string[] | null
          npi: string
          provider_type: string
          updated_at?: string
          verification_data?: Json
          verification_status: string
          verified_at?: string
        }
        Update: {
          confidence_score?: number
          created_at?: string
          enrollment_id?: string | null
          facility_id?: string | null
          id?: string
          issues?: string[] | null
          npi?: string
          provider_type?: string
          updated_at?: string
          verification_data?: Json
          verification_status?: string
          verified_at?: string
        }
        Relationships: []
      }
      observability_configs: {
        Row: {
          api_key_encrypted: string | null
          configuration: Json | null
          created_at: string
          id: string
          is_enabled: boolean
          platform: string
          project_id: string | null
          space_key: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          api_key_encrypted?: string | null
          configuration?: Json | null
          created_at?: string
          id?: string
          is_enabled?: boolean
          platform: string
          project_id?: string | null
          space_key?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          api_key_encrypted?: string | null
          configuration?: Json | null
          created_at?: string
          id?: string
          is_enabled?: boolean
          platform?: string
          project_id?: string | null
          space_key?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      onboarding_340b_programs: {
        Row: {
          audit_requirements: Json | null
          compliance_contact_email: string | null
          compliance_contact_name: string | null
          compliance_contact_phone: string | null
          contract_pharmacy_locations: string[] | null
          created_at: string | null
          eligible_drug_categories: string[] | null
          id: string
          onboarding_id: string
          parent_entity_name: string | null
          program_type: string
          registration_number: string
        }
        Insert: {
          audit_requirements?: Json | null
          compliance_contact_email?: string | null
          compliance_contact_name?: string | null
          compliance_contact_phone?: string | null
          contract_pharmacy_locations?: string[] | null
          created_at?: string | null
          eligible_drug_categories?: string[] | null
          id?: string
          onboarding_id: string
          parent_entity_name?: string | null
          program_type: string
          registration_number: string
        }
        Update: {
          audit_requirements?: Json | null
          compliance_contact_email?: string | null
          compliance_contact_name?: string | null
          compliance_contact_phone?: string | null
          contract_pharmacy_locations?: string[] | null
          created_at?: string | null
          eligible_drug_categories?: string[] | null
          id?: string
          onboarding_id?: string
          parent_entity_name?: string | null
          program_type?: string
          registration_number?: string
        }
        Relationships: [
          {
            foreignKeyName: "onboarding_340b_programs_onboarding_id_fkey"
            columns: ["onboarding_id"]
            isOneToOne: false
            referencedRelation: "treatment_center_onboarding"
            referencedColumns: ["id"]
          },
        ]
      }
      onboarding_additional_licenses: {
        Row: {
          created_at: string | null
          expiration_date: string | null
          id: string
          license_number: string
          license_type: string
          onboarding_id: string
          state: string
        }
        Insert: {
          created_at?: string | null
          expiration_date?: string | null
          id?: string
          license_number: string
          license_type: string
          onboarding_id: string
          state: string
        }
        Update: {
          created_at?: string | null
          expiration_date?: string | null
          id?: string
          license_number?: string
          license_type?: string
          onboarding_id?: string
          state?: string
        }
        Relationships: [
          {
            foreignKeyName: "onboarding_additional_licenses_onboarding_id_fkey"
            columns: ["onboarding_id"]
            isOneToOne: false
            referencedRelation: "treatment_center_onboarding"
            referencedColumns: ["id"]
          },
        ]
      }
      onboarding_addresses: {
        Row: {
          address_type: string
          city: string
          country: string | null
          created_at: string | null
          id: string
          onboarding_id: string
          state: string
          street: string
          zip: string
        }
        Insert: {
          address_type: string
          city: string
          country?: string | null
          created_at?: string | null
          id?: string
          onboarding_id: string
          state: string
          street: string
          zip: string
        }
        Update: {
          address_type?: string
          city?: string
          country?: string | null
          created_at?: string | null
          id?: string
          onboarding_id?: string
          state?: string
          street?: string
          zip?: string
        }
        Relationships: [
          {
            foreignKeyName: "onboarding_addresses_onboarding_id_fkey"
            columns: ["onboarding_id"]
            isOneToOne: false
            referencedRelation: "treatment_center_onboarding"
            referencedColumns: ["id"]
          },
        ]
      }
      onboarding_audit_trail: {
        Row: {
          action_description: string
          action_type: string
          created_at: string | null
          id: string
          ip_address: unknown | null
          new_values: Json | null
          old_values: Json | null
          onboarding_id: string | null
          section_affected: string | null
          session_id: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action_description: string
          action_type: string
          created_at?: string | null
          id?: string
          ip_address?: unknown | null
          new_values?: Json | null
          old_values?: Json | null
          onboarding_id?: string | null
          section_affected?: string | null
          session_id?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action_description?: string
          action_type?: string
          created_at?: string | null
          id?: string
          ip_address?: unknown | null
          new_values?: Json | null
          old_values?: Json | null
          onboarding_id?: string | null
          section_affected?: string | null
          session_id?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "onboarding_audit_trail_onboarding_id_fkey"
            columns: ["onboarding_id"]
            isOneToOne: false
            referencedRelation: "treatment_center_onboarding"
            referencedColumns: ["id"]
          },
        ]
      }
      onboarding_compliance_requirements: {
        Row: {
          adverse_event_reporting_system: boolean | null
          audit_frequency_preferences: string | null
          created_at: string | null
          documentation_requirements: Json | null
          id: string
          onboarding_id: string | null
          patient_safety_protocols: Json | null
          quality_assurance_protocols: Json | null
          regulatory_reporting_needs: Json | null
          required_compliance_programs:
            | Database["public"]["Enums"]["compliance_program"][]
            | null
          staff_training_requirements: Json | null
          updated_at: string | null
        }
        Insert: {
          adverse_event_reporting_system?: boolean | null
          audit_frequency_preferences?: string | null
          created_at?: string | null
          documentation_requirements?: Json | null
          id?: string
          onboarding_id?: string | null
          patient_safety_protocols?: Json | null
          quality_assurance_protocols?: Json | null
          regulatory_reporting_needs?: Json | null
          required_compliance_programs?:
            | Database["public"]["Enums"]["compliance_program"][]
            | null
          staff_training_requirements?: Json | null
          updated_at?: string | null
        }
        Update: {
          adverse_event_reporting_system?: boolean | null
          audit_frequency_preferences?: string | null
          created_at?: string | null
          documentation_requirements?: Json | null
          id?: string
          onboarding_id?: string | null
          patient_safety_protocols?: Json | null
          quality_assurance_protocols?: Json | null
          regulatory_reporting_needs?: Json | null
          required_compliance_programs?:
            | Database["public"]["Enums"]["compliance_program"][]
            | null
          staff_training_requirements?: Json | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "onboarding_compliance_requirements_onboarding_id_fkey"
            columns: ["onboarding_id"]
            isOneToOne: false
            referencedRelation: "treatment_center_onboarding"
            referencedColumns: ["id"]
          },
        ]
      }
      onboarding_contacts: {
        Row: {
          contact_type: string
          created_at: string | null
          email: string
          fax: string | null
          id: string
          name: string
          onboarding_id: string
          phone: string
          title: string | null
        }
        Insert: {
          contact_type: string
          created_at?: string | null
          email: string
          fax?: string | null
          id?: string
          name: string
          onboarding_id: string
          phone: string
          title?: string | null
        }
        Update: {
          contact_type?: string
          created_at?: string | null
          email?: string
          fax?: string | null
          id?: string
          name?: string
          onboarding_id?: string
          phone?: string
          title?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "onboarding_contacts_onboarding_id_fkey"
            columns: ["onboarding_id"]
            isOneToOne: false
            referencedRelation: "treatment_center_onboarding"
            referencedColumns: ["id"]
          },
        ]
      }
      onboarding_contract_terms: {
        Row: {
          auto_renewal_clause: boolean | null
          contract_duration_months: number | null
          created_at: string | null
          data_protection_clauses: Json | null
          exclusivity_agreements: Json | null
          force_majeure_provisions: Json | null
          id: string
          intellectual_property_terms: Json | null
          liability_limitations: Json | null
          onboarding_id: string | null
          pricing_structure: Json | null
          rebate_programs: Json | null
          termination_clauses: Json | null
          updated_at: string | null
          volume_discounts: Json | null
        }
        Insert: {
          auto_renewal_clause?: boolean | null
          contract_duration_months?: number | null
          created_at?: string | null
          data_protection_clauses?: Json | null
          exclusivity_agreements?: Json | null
          force_majeure_provisions?: Json | null
          id?: string
          intellectual_property_terms?: Json | null
          liability_limitations?: Json | null
          onboarding_id?: string | null
          pricing_structure?: Json | null
          rebate_programs?: Json | null
          termination_clauses?: Json | null
          updated_at?: string | null
          volume_discounts?: Json | null
        }
        Update: {
          auto_renewal_clause?: boolean | null
          contract_duration_months?: number | null
          created_at?: string | null
          data_protection_clauses?: Json | null
          exclusivity_agreements?: Json | null
          force_majeure_provisions?: Json | null
          id?: string
          intellectual_property_terms?: Json | null
          liability_limitations?: Json | null
          onboarding_id?: string | null
          pricing_structure?: Json | null
          rebate_programs?: Json | null
          termination_clauses?: Json | null
          updated_at?: string | null
          volume_discounts?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "onboarding_contract_terms_onboarding_id_fkey"
            columns: ["onboarding_id"]
            isOneToOne: false
            referencedRelation: "treatment_center_onboarding"
            referencedColumns: ["id"]
          },
        ]
      }
      onboarding_controlling_entities: {
        Row: {
          city: string
          created_at: string | null
          id: string
          name: string
          onboarding_id: string
          phone: string
          relationship: string
          state: string
          street: string
          zip: string
        }
        Insert: {
          city: string
          created_at?: string | null
          id?: string
          name: string
          onboarding_id: string
          phone: string
          relationship: string
          state: string
          street: string
          zip: string
        }
        Update: {
          city?: string
          created_at?: string | null
          id?: string
          name?: string
          onboarding_id?: string
          phone?: string
          relationship?: string
          state?: string
          street?: string
          zip?: string
        }
        Relationships: [
          {
            foreignKeyName: "onboarding_controlling_entities_onboarding_id_fkey"
            columns: ["onboarding_id"]
            isOneToOne: false
            referencedRelation: "treatment_center_onboarding"
            referencedColumns: ["id"]
          },
        ]
      }
      onboarding_document_uploads: {
        Row: {
          document_name: string
          document_type: string
          file_path: string | null
          file_size: number | null
          id: string
          mime_type: string | null
          onboarding_id: string
          uploaded_at: string | null
        }
        Insert: {
          document_name: string
          document_type: string
          file_path?: string | null
          file_size?: number | null
          id?: string
          mime_type?: string | null
          onboarding_id: string
          uploaded_at?: string | null
        }
        Update: {
          document_name?: string
          document_type?: string
          file_path?: string | null
          file_size?: number | null
          id?: string
          mime_type?: string | null
          onboarding_id?: string
          uploaded_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "onboarding_document_uploads_onboarding_id_fkey"
            columns: ["onboarding_id"]
            isOneToOne: false
            referencedRelation: "treatment_center_onboarding"
            referencedColumns: ["id"]
          },
        ]
      }
      onboarding_financial_assessment: {
        Row: {
          annual_revenue_range: string | null
          created_at: string | null
          credit_limit_recommendation: number | null
          credit_score_range: string | null
          current_ratio: number | null
          days_sales_outstanding: number | null
          debt_to_equity_ratio: number | null
          financial_guarantees: Json | null
          id: string
          insurance_coverage: Json | null
          onboarding_id: string | null
          payment_history_rating: string | null
          payment_terms_recommendation: string | null
          risk_assessment_score: number | null
          risk_level: Database["public"]["Enums"]["risk_level"] | null
          updated_at: string | null
          years_in_operation: number | null
        }
        Insert: {
          annual_revenue_range?: string | null
          created_at?: string | null
          credit_limit_recommendation?: number | null
          credit_score_range?: string | null
          current_ratio?: number | null
          days_sales_outstanding?: number | null
          debt_to_equity_ratio?: number | null
          financial_guarantees?: Json | null
          id?: string
          insurance_coverage?: Json | null
          onboarding_id?: string | null
          payment_history_rating?: string | null
          payment_terms_recommendation?: string | null
          risk_assessment_score?: number | null
          risk_level?: Database["public"]["Enums"]["risk_level"] | null
          updated_at?: string | null
          years_in_operation?: number | null
        }
        Update: {
          annual_revenue_range?: string | null
          created_at?: string | null
          credit_limit_recommendation?: number | null
          credit_score_range?: string | null
          current_ratio?: number | null
          days_sales_outstanding?: number | null
          debt_to_equity_ratio?: number | null
          financial_guarantees?: Json | null
          id?: string
          insurance_coverage?: Json | null
          onboarding_id?: string | null
          payment_history_rating?: string | null
          payment_terms_recommendation?: string | null
          risk_assessment_score?: number | null
          risk_level?: Database["public"]["Enums"]["risk_level"] | null
          updated_at?: string | null
          years_in_operation?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "onboarding_financial_assessment_onboarding_id_fkey"
            columns: ["onboarding_id"]
            isOneToOne: false
            referencedRelation: "treatment_center_onboarding"
            referencedColumns: ["id"]
          },
        ]
      }
      onboarding_gpo_memberships: {
        Row: {
          contract_effective_date: string | null
          contract_expiration_date: string | null
          covered_categories: string[] | null
          created_at: string | null
          gpo_name: string
          id: string
          membership_number: string | null
          onboarding_id: string
          primary_contact_email: string | null
          primary_contact_name: string | null
          primary_contact_phone: string | null
          rebate_information: Json | null
          tier_level: string | null
        }
        Insert: {
          contract_effective_date?: string | null
          contract_expiration_date?: string | null
          covered_categories?: string[] | null
          created_at?: string | null
          gpo_name: string
          id?: string
          membership_number?: string | null
          onboarding_id: string
          primary_contact_email?: string | null
          primary_contact_name?: string | null
          primary_contact_phone?: string | null
          rebate_information?: Json | null
          tier_level?: string | null
        }
        Update: {
          contract_effective_date?: string | null
          contract_expiration_date?: string | null
          covered_categories?: string[] | null
          created_at?: string | null
          gpo_name?: string
          id?: string
          membership_number?: string | null
          onboarding_id?: string
          primary_contact_email?: string | null
          primary_contact_name?: string | null
          primary_contact_phone?: string | null
          rebate_information?: Json | null
          tier_level?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "onboarding_gpo_memberships_onboarding_id_fkey"
            columns: ["onboarding_id"]
            isOneToOne: false
            referencedRelation: "treatment_center_onboarding"
            referencedColumns: ["id"]
          },
        ]
      }
      onboarding_payment_terms: {
        Row: {
          billing_frequency: string | null
          consolidation_preferences: Json | null
          created_at: string | null
          credit_limit_requested: number | null
          early_payment_discount_interest: boolean | null
          id: string
          onboarding_id: string
          payment_method: string
          preferred_terms: string
        }
        Insert: {
          billing_frequency?: string | null
          consolidation_preferences?: Json | null
          created_at?: string | null
          credit_limit_requested?: number | null
          early_payment_discount_interest?: boolean | null
          id?: string
          onboarding_id: string
          payment_method: string
          preferred_terms: string
        }
        Update: {
          billing_frequency?: string | null
          consolidation_preferences?: Json | null
          created_at?: string | null
          credit_limit_requested?: number | null
          early_payment_discount_interest?: boolean | null
          id?: string
          onboarding_id?: string
          payment_method?: string
          preferred_terms?: string
        }
        Relationships: [
          {
            foreignKeyName: "onboarding_payment_terms_onboarding_id_fkey"
            columns: ["onboarding_id"]
            isOneToOne: false
            referencedRelation: "treatment_center_onboarding"
            referencedColumns: ["id"]
          },
        ]
      }
      onboarding_platform_users: {
        Row: {
          access_level: string
          can_manage_users: boolean | null
          can_place_orders: boolean | null
          can_view_reports: boolean | null
          created_at: string | null
          department: string | null
          email: string
          first_name: string
          id: string
          last_name: string
          notification_preferences: Json | null
          onboarding_id: string
          phone: string | null
          user_type: string
        }
        Insert: {
          access_level: string
          can_manage_users?: boolean | null
          can_place_orders?: boolean | null
          can_view_reports?: boolean | null
          created_at?: string | null
          department?: string | null
          email: string
          first_name: string
          id?: string
          last_name: string
          notification_preferences?: Json | null
          onboarding_id: string
          phone?: string | null
          user_type: string
        }
        Update: {
          access_level?: string
          can_manage_users?: boolean | null
          can_place_orders?: boolean | null
          can_view_reports?: boolean | null
          created_at?: string | null
          department?: string | null
          email?: string
          first_name?: string
          id?: string
          last_name?: string
          notification_preferences?: Json | null
          onboarding_id?: string
          phone?: string | null
          user_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "onboarding_platform_users_onboarding_id_fkey"
            columns: ["onboarding_id"]
            isOneToOne: false
            referencedRelation: "treatment_center_onboarding"
            referencedColumns: ["id"]
          },
        ]
      }
      onboarding_principal_owners: {
        Row: {
          created_at: string | null
          id: string
          name: string
          onboarding_id: string
          ownership_percentage: number
          ssn: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
          onboarding_id: string
          ownership_percentage: number
          ssn?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
          onboarding_id?: string
          ownership_percentage?: number
          ssn?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "onboarding_principal_owners_onboarding_id_fkey"
            columns: ["onboarding_id"]
            isOneToOne: false
            referencedRelation: "treatment_center_onboarding"
            referencedColumns: ["id"]
          },
        ]
      }
      onboarding_purchasing_preferences: {
        Row: {
          automated_reordering_enabled: boolean | null
          created_at: string | null
          hazmat_storage_capabilities: boolean | null
          id: string
          inventory_management_model: Database["public"]["Enums"]["inventory_model"]
          inventory_turnover_targets: Json | null
          onboarding_id: string | null
          preferred_order_frequency: string | null
          preferred_purchasing_methods:
            | Database["public"]["Enums"]["purchasing_method"][]
            | null
          reorder_points: Json | null
          storage_capacity_details: Json | null
          temperature_controlled_storage: boolean | null
          updated_at: string | null
        }
        Insert: {
          automated_reordering_enabled?: boolean | null
          created_at?: string | null
          hazmat_storage_capabilities?: boolean | null
          id?: string
          inventory_management_model: Database["public"]["Enums"]["inventory_model"]
          inventory_turnover_targets?: Json | null
          onboarding_id?: string | null
          preferred_order_frequency?: string | null
          preferred_purchasing_methods?:
            | Database["public"]["Enums"]["purchasing_method"][]
            | null
          reorder_points?: Json | null
          storage_capacity_details?: Json | null
          temperature_controlled_storage?: boolean | null
          updated_at?: string | null
        }
        Update: {
          automated_reordering_enabled?: boolean | null
          created_at?: string | null
          hazmat_storage_capabilities?: boolean | null
          id?: string
          inventory_management_model?: Database["public"]["Enums"]["inventory_model"]
          inventory_turnover_targets?: Json | null
          onboarding_id?: string | null
          preferred_order_frequency?: string | null
          preferred_purchasing_methods?:
            | Database["public"]["Enums"]["purchasing_method"][]
            | null
          reorder_points?: Json | null
          storage_capacity_details?: Json | null
          temperature_controlled_storage?: boolean | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "onboarding_purchasing_preferences_onboarding_id_fkey"
            columns: ["onboarding_id"]
            isOneToOne: false
            referencedRelation: "treatment_center_onboarding"
            referencedColumns: ["id"]
          },
        ]
      }
      onboarding_references: {
        Row: {
          account_number: string | null
          contact_name: string
          created_at: string | null
          id: string
          name: string
          onboarding_id: string
          phone: string
          reference_type: string
        }
        Insert: {
          account_number?: string | null
          contact_name: string
          created_at?: string | null
          id?: string
          name: string
          onboarding_id: string
          phone: string
          reference_type: string
        }
        Update: {
          account_number?: string | null
          contact_name?: string
          created_at?: string | null
          id?: string
          name?: string
          onboarding_id?: string
          phone?: string
          reference_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "onboarding_references_onboarding_id_fkey"
            columns: ["onboarding_id"]
            isOneToOne: false
            referencedRelation: "treatment_center_onboarding"
            referencedColumns: ["id"]
          },
        ]
      }
      onboarding_service_selections: {
        Row: {
          created_at: string | null
          custom_requirements: Json | null
          estimated_volume: Json | null
          id: string
          onboarding_id: string | null
          preferred_start_date: string | null
          selected_provider_id: string | null
          selection_rationale: string | null
          service_id: string | null
          therapy_area: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          custom_requirements?: Json | null
          estimated_volume?: Json | null
          id?: string
          onboarding_id?: string | null
          preferred_start_date?: string | null
          selected_provider_id?: string | null
          selection_rationale?: string | null
          service_id?: string | null
          therapy_area?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          custom_requirements?: Json | null
          estimated_volume?: Json | null
          id?: string
          onboarding_id?: string | null
          preferred_start_date?: string | null
          selected_provider_id?: string | null
          selection_rationale?: string | null
          service_id?: string | null
          therapy_area?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "onboarding_service_selections_onboarding_id_fkey"
            columns: ["onboarding_id"]
            isOneToOne: false
            referencedRelation: "treatment_center_onboarding"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "onboarding_service_selections_selected_provider_id_fkey"
            columns: ["selected_provider_id"]
            isOneToOne: false
            referencedRelation: "service_providers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "onboarding_service_selections_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      onboarding_sla_requirements: {
        Row: {
          created_at: string | null
          delivery_time_requirements: Json | null
          emergency_delivery_needs: boolean | null
          escalation_procedures: Json | null
          id: string
          onboarding_id: string | null
          penalty_structures: Json | null
          performance_metrics: Json | null
          response_time_requirements: Json | null
          service_tier: Database["public"]["Enums"]["sla_tier"]
          updated_at: string | null
          uptime_requirements: number | null
        }
        Insert: {
          created_at?: string | null
          delivery_time_requirements?: Json | null
          emergency_delivery_needs?: boolean | null
          escalation_procedures?: Json | null
          id?: string
          onboarding_id?: string | null
          penalty_structures?: Json | null
          performance_metrics?: Json | null
          response_time_requirements?: Json | null
          service_tier?: Database["public"]["Enums"]["sla_tier"]
          updated_at?: string | null
          uptime_requirements?: number | null
        }
        Update: {
          created_at?: string | null
          delivery_time_requirements?: Json | null
          emergency_delivery_needs?: boolean | null
          escalation_procedures?: Json | null
          id?: string
          onboarding_id?: string | null
          penalty_structures?: Json | null
          performance_metrics?: Json | null
          response_time_requirements?: Json | null
          service_tier?: Database["public"]["Enums"]["sla_tier"]
          updated_at?: string | null
          uptime_requirements?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "onboarding_sla_requirements_onboarding_id_fkey"
            columns: ["onboarding_id"]
            isOneToOne: false
            referencedRelation: "treatment_center_onboarding"
            referencedColumns: ["id"]
          },
        ]
      }
      onboarding_technology_integration: {
        Row: {
          api_capabilities: Json | null
          automated_billing_integration: boolean | null
          created_at: string | null
          current_ehr_system: string | null
          current_inventory_system: string | null
          edi_transaction_sets: string[] | null
          id: string
          mobile_access_requirements: Json | null
          onboarding_id: string | null
          preferred_integration_method: Database["public"]["Enums"]["technology_integration"]
          real_time_inventory_tracking: boolean | null
          reporting_dashboard_requirements: Json | null
          security_requirements: Json | null
          updated_at: string | null
        }
        Insert: {
          api_capabilities?: Json | null
          automated_billing_integration?: boolean | null
          created_at?: string | null
          current_ehr_system?: string | null
          current_inventory_system?: string | null
          edi_transaction_sets?: string[] | null
          id?: string
          mobile_access_requirements?: Json | null
          onboarding_id?: string | null
          preferred_integration_method: Database["public"]["Enums"]["technology_integration"]
          real_time_inventory_tracking?: boolean | null
          reporting_dashboard_requirements?: Json | null
          security_requirements?: Json | null
          updated_at?: string | null
        }
        Update: {
          api_capabilities?: Json | null
          automated_billing_integration?: boolean | null
          created_at?: string | null
          current_ehr_system?: string | null
          current_inventory_system?: string | null
          edi_transaction_sets?: string[] | null
          id?: string
          mobile_access_requirements?: Json | null
          onboarding_id?: string | null
          preferred_integration_method?: Database["public"]["Enums"]["technology_integration"]
          real_time_inventory_tracking?: boolean | null
          reporting_dashboard_requirements?: Json | null
          security_requirements?: Json | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "onboarding_technology_integration_onboarding_id_fkey"
            columns: ["onboarding_id"]
            isOneToOne: false
            referencedRelation: "treatment_center_onboarding"
            referencedColumns: ["id"]
          },
        ]
      }
      onboarding_therapy_selections: {
        Row: {
          clean_room_required: boolean | null
          clinical_trial_id: string | null
          commercial_product_id: string | null
          created_at: string | null
          date_of_apheresis: string | null
          date_of_infusion: string | null
          distribution_method: string | null
          enrollment_instance_id: string | null
          go_live_target_date: string | null
          icd_codes: Json | null
          id: string
          isolation_room_required: boolean | null
          ndc_codes: Json | null
          onboarding_id: string | null
          order_id_internal: string | null
          patient_id: string | null
          patient_id_internal: string | null
          patient_registry_participation: boolean | null
          patient_volume_estimate: number | null
          planning_phase_weeks: number | null
          preferred_start_date: string | null
          priority_level: string | null
          product_id: string | null
          provider_id: string | null
          regulatory_submissions_needed: string[] | null
          required_certifications: string[] | null
          selected_provider_id: string | null
          selection_rationale: string | null
          service_id: string | null
          specialized_equipment: string[] | null
          therapy_id: string | null
          training_hours_required: number | null
          treatment_readiness_level: string | null
          updated_at: string | null
        }
        Insert: {
          clean_room_required?: boolean | null
          clinical_trial_id?: string | null
          commercial_product_id?: string | null
          created_at?: string | null
          date_of_apheresis?: string | null
          date_of_infusion?: string | null
          distribution_method?: string | null
          enrollment_instance_id?: string | null
          go_live_target_date?: string | null
          icd_codes?: Json | null
          id?: string
          isolation_room_required?: boolean | null
          ndc_codes?: Json | null
          onboarding_id?: string | null
          order_id_internal?: string | null
          patient_id?: string | null
          patient_id_internal?: string | null
          patient_registry_participation?: boolean | null
          patient_volume_estimate?: number | null
          planning_phase_weeks?: number | null
          preferred_start_date?: string | null
          priority_level?: string | null
          product_id?: string | null
          provider_id?: string | null
          regulatory_submissions_needed?: string[] | null
          required_certifications?: string[] | null
          selected_provider_id?: string | null
          selection_rationale?: string | null
          service_id?: string | null
          specialized_equipment?: string[] | null
          therapy_id?: string | null
          training_hours_required?: number | null
          treatment_readiness_level?: string | null
          updated_at?: string | null
        }
        Update: {
          clean_room_required?: boolean | null
          clinical_trial_id?: string | null
          commercial_product_id?: string | null
          created_at?: string | null
          date_of_apheresis?: string | null
          date_of_infusion?: string | null
          distribution_method?: string | null
          enrollment_instance_id?: string | null
          go_live_target_date?: string | null
          icd_codes?: Json | null
          id?: string
          isolation_room_required?: boolean | null
          ndc_codes?: Json | null
          onboarding_id?: string | null
          order_id_internal?: string | null
          patient_id?: string | null
          patient_id_internal?: string | null
          patient_registry_participation?: boolean | null
          patient_volume_estimate?: number | null
          planning_phase_weeks?: number | null
          preferred_start_date?: string | null
          priority_level?: string | null
          product_id?: string | null
          provider_id?: string | null
          regulatory_submissions_needed?: string[] | null
          required_certifications?: string[] | null
          selected_provider_id?: string | null
          selection_rationale?: string | null
          service_id?: string | null
          specialized_equipment?: string[] | null
          therapy_id?: string | null
          training_hours_required?: number | null
          treatment_readiness_level?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "onboarding_therapy_selections_clinical_trial_id_fkey"
            columns: ["clinical_trial_id"]
            isOneToOne: false
            referencedRelation: "clinical_trials"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "onboarding_therapy_selections_commercial_product_id_fkey"
            columns: ["commercial_product_id"]
            isOneToOne: false
            referencedRelation: "commercial_products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "onboarding_therapy_selections_enrollment_instance_id_fkey"
            columns: ["enrollment_instance_id"]
            isOneToOne: false
            referencedRelation: "enrollment_instances"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "onboarding_therapy_selections_onboarding_id_fkey"
            columns: ["onboarding_id"]
            isOneToOne: false
            referencedRelation: "treatment_center_onboarding"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "onboarding_therapy_selections_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "onboarding_therapy_selections_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "onboarding_therapy_selections_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "provider_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "onboarding_therapy_selections_selected_provider_id_fkey"
            columns: ["selected_provider_id"]
            isOneToOne: false
            referencedRelation: "service_providers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "onboarding_therapy_selections_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "onboarding_therapy_selections_therapy_id_fkey"
            columns: ["therapy_id"]
            isOneToOne: false
            referencedRelation: "therapies"
            referencedColumns: ["id"]
          },
        ]
      }
      onboarding_workflow_notes: {
        Row: {
          author_id: string
          content: string
          created_at: string | null
          id: string
          note_type: string | null
          onboarding_id: string
        }
        Insert: {
          author_id: string
          content: string
          created_at?: string | null
          id?: string
          note_type?: string | null
          onboarding_id: string
        }
        Update: {
          author_id?: string
          content?: string
          created_at?: string | null
          id?: string
          note_type?: string | null
          onboarding_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "onboarding_workflow_notes_onboarding_id_fkey"
            columns: ["onboarding_id"]
            isOneToOne: false
            referencedRelation: "treatment_center_onboarding"
            referencedColumns: ["id"]
          },
        ]
      }
      onboarding_workflow_steps: {
        Row: {
          approval_level: string | null
          assigned_to: string | null
          completion_date: string | null
          created_at: string | null
          dependencies: string[] | null
          due_date: string | null
          escalation_rules: Json | null
          id: string
          onboarding_id: string | null
          required_documents: string[] | null
          status: string | null
          step_name: string
          step_order: number
          step_type: string
          updated_at: string | null
        }
        Insert: {
          approval_level?: string | null
          assigned_to?: string | null
          completion_date?: string | null
          created_at?: string | null
          dependencies?: string[] | null
          due_date?: string | null
          escalation_rules?: Json | null
          id?: string
          onboarding_id?: string | null
          required_documents?: string[] | null
          status?: string | null
          step_name: string
          step_order: number
          step_type: string
          updated_at?: string | null
        }
        Update: {
          approval_level?: string | null
          assigned_to?: string | null
          completion_date?: string | null
          created_at?: string | null
          dependencies?: string[] | null
          due_date?: string | null
          escalation_rules?: Json | null
          id?: string
          onboarding_id?: string | null
          required_documents?: string[] | null
          status?: string | null
          step_name?: string
          step_order?: number
          step_type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "onboarding_workflow_steps_onboarding_id_fkey"
            columns: ["onboarding_id"]
            isOneToOne: false
            referencedRelation: "treatment_center_onboarding"
            referencedColumns: ["id"]
          },
        ]
      }
      patient_enrollments: {
        Row: {
          agent_channel: string | null
          completed_at: string | null
          created_at: string
          current_section: string
          deactivated_at: string | null
          deactivated_by: string | null
          deactivation_reason: string | null
          enrollment_source: string | null
          enrollment_status: string
          facility_id: string | null
          id: string
          is_active: boolean | null
          metadata: Json | null
          pdf_file_path: string | null
          pdf_generated: boolean | null
          primary_provider_id: string | null
          progress_percentage: number | null
          session_id: string
          signature_data: Json | null
          signed_at: string | null
          submission_method: string | null
          tenant_id: string | null
          updated_at: string
          user_id: string | null
          verification_method: string | null
        }
        Insert: {
          agent_channel?: string | null
          completed_at?: string | null
          created_at?: string
          current_section?: string
          deactivated_at?: string | null
          deactivated_by?: string | null
          deactivation_reason?: string | null
          enrollment_source?: string | null
          enrollment_status?: string
          facility_id?: string | null
          id?: string
          is_active?: boolean | null
          metadata?: Json | null
          pdf_file_path?: string | null
          pdf_generated?: boolean | null
          primary_provider_id?: string | null
          progress_percentage?: number | null
          session_id: string
          signature_data?: Json | null
          signed_at?: string | null
          submission_method?: string | null
          tenant_id?: string | null
          updated_at?: string
          user_id?: string | null
          verification_method?: string | null
        }
        Update: {
          agent_channel?: string | null
          completed_at?: string | null
          created_at?: string
          current_section?: string
          deactivated_at?: string | null
          deactivated_by?: string | null
          deactivation_reason?: string | null
          enrollment_source?: string | null
          enrollment_status?: string
          facility_id?: string | null
          id?: string
          is_active?: boolean | null
          metadata?: Json | null
          pdf_file_path?: string | null
          pdf_generated?: boolean | null
          primary_provider_id?: string | null
          progress_percentage?: number | null
          session_id?: string
          signature_data?: Json | null
          signed_at?: string | null
          submission_method?: string | null
          tenant_id?: string | null
          updated_at?: string
          user_id?: string | null
          verification_method?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "patient_enrollments_facility_id_fkey"
            columns: ["facility_id"]
            isOneToOne: false
            referencedRelation: "facilities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "patient_enrollments_primary_provider_id_fkey"
            columns: ["primary_provider_id"]
            isOneToOne: false
            referencedRelation: "service_providers"
            referencedColumns: ["id"]
          },
        ]
      }
      permissions: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          name: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      phone_numbers: {
        Row: {
          assigned_to_agent_id: string | null
          assigned_to_brand: string | null
          capabilities: Json | null
          configuration: Json | null
          created_at: string | null
          created_by: string | null
          id: string
          is_active: boolean | null
          phone_number: string
          provider_phone_sid: string | null
          provider_type: string
          updated_at: string | null
        }
        Insert: {
          assigned_to_agent_id?: string | null
          assigned_to_brand?: string | null
          capabilities?: Json | null
          configuration?: Json | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_active?: boolean | null
          phone_number: string
          provider_phone_sid?: string | null
          provider_type: string
          updated_at?: string | null
        }
        Update: {
          assigned_to_agent_id?: string | null
          assigned_to_brand?: string | null
          capabilities?: Json | null
          configuration?: Json | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_active?: boolean | null
          phone_number?: string
          provider_phone_sid?: string | null
          provider_type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "phone_numbers_assigned_to_agent_id_fkey"
            columns: ["assigned_to_agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          approval_date: string | null
          brand_name: string | null
          contraindications: string[] | null
          created_at: string | null
          distribution_requirements: Json | null
          dosing_information: Json | null
          id: string
          indication: string | null
          is_active: boolean | null
          manufacturer_id: string | null
          market_access_considerations: Json | null
          modality_id: string | null
          name: string
          ndc_number: string | null
          pricing_information: Json | null
          product_status: Database["public"]["Enums"]["product_status"]
          special_populations: Json | null
          therapy_id: string | null
          updated_at: string | null
        }
        Insert: {
          approval_date?: string | null
          brand_name?: string | null
          contraindications?: string[] | null
          created_at?: string | null
          distribution_requirements?: Json | null
          dosing_information?: Json | null
          id?: string
          indication?: string | null
          is_active?: boolean | null
          manufacturer_id?: string | null
          market_access_considerations?: Json | null
          modality_id?: string | null
          name: string
          ndc_number?: string | null
          pricing_information?: Json | null
          product_status: Database["public"]["Enums"]["product_status"]
          special_populations?: Json | null
          therapy_id?: string | null
          updated_at?: string | null
        }
        Update: {
          approval_date?: string | null
          brand_name?: string | null
          contraindications?: string[] | null
          created_at?: string | null
          distribution_requirements?: Json | null
          dosing_information?: Json | null
          id?: string
          indication?: string | null
          is_active?: boolean | null
          manufacturer_id?: string | null
          market_access_considerations?: Json | null
          modality_id?: string | null
          name?: string
          ndc_number?: string | null
          pricing_information?: Json | null
          product_status?: Database["public"]["Enums"]["product_status"]
          special_populations?: Json | null
          therapy_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "products_manufacturer_id_fkey"
            columns: ["manufacturer_id"]
            isOneToOne: false
            referencedRelation: "manufacturers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_modality_id_fkey"
            columns: ["modality_id"]
            isOneToOne: false
            referencedRelation: "modalities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_therapy_id_fkey"
            columns: ["therapy_id"]
            isOneToOne: false
            referencedRelation: "therapies"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          accessibility_needs: string[] | null
          address: string | null
          address_line_1: string | null
          address_line_2: string | null
          alcohol_use: string | null
          allergies: string[] | null
          apartment: string | null
          avatar_url: string | null
          cell_phone: string | null
          city: string | null
          communication_preferences: string[] | null
          consent_for_communication: boolean | null
          consent_for_treatment: boolean | null
          country: string | null
          created_at: string | null
          current_medications: string[] | null
          date_of_birth: string | null
          department: string | null
          do_not_contact_patient: boolean | null
          email: string | null
          emergency_contact_email: string | null
          emergency_contact_name: string | null
          emergency_contact_phone: string | null
          emergency_contact_relationship: string | null
          enrollment_progress: number | null
          enrollment_status: string | null
          enrollment_type: string | null
          ethnicity: string | null
          facility_id: string | null
          family_medical_history: string | null
          first_name: string | null
          gender: string | null
          has_mfa_enabled: boolean | null
          hipaa_acknowledgment: boolean | null
          home_phone: string | null
          id: string
          is_email_verified: boolean | null
          last_login: string | null
          last_name: string | null
          marital_status: string | null
          medical_conditions: string[] | null
          medical_record_number: string | null
          middle_name: string | null
          occupation: string | null
          other_gender: string | null
          other_language: string | null
          patient_height_feet: number | null
          patient_height_inches: number | null
          patient_weight_lbs: number | null
          phone: string | null
          preferred_language: string | null
          previous_hospitalizations: string[] | null
          primary_care_physician: string | null
          race: string | null
          referring_physician: string | null
          smoking_status: string | null
          social_history: string | null
          ssn_encrypted: string | null
          state: string | null
          updated_at: string | null
          zip_code: string | null
        }
        Insert: {
          accessibility_needs?: string[] | null
          address?: string | null
          address_line_1?: string | null
          address_line_2?: string | null
          alcohol_use?: string | null
          allergies?: string[] | null
          apartment?: string | null
          avatar_url?: string | null
          cell_phone?: string | null
          city?: string | null
          communication_preferences?: string[] | null
          consent_for_communication?: boolean | null
          consent_for_treatment?: boolean | null
          country?: string | null
          created_at?: string | null
          current_medications?: string[] | null
          date_of_birth?: string | null
          department?: string | null
          do_not_contact_patient?: boolean | null
          email?: string | null
          emergency_contact_email?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          emergency_contact_relationship?: string | null
          enrollment_progress?: number | null
          enrollment_status?: string | null
          enrollment_type?: string | null
          ethnicity?: string | null
          facility_id?: string | null
          family_medical_history?: string | null
          first_name?: string | null
          gender?: string | null
          has_mfa_enabled?: boolean | null
          hipaa_acknowledgment?: boolean | null
          home_phone?: string | null
          id: string
          is_email_verified?: boolean | null
          last_login?: string | null
          last_name?: string | null
          marital_status?: string | null
          medical_conditions?: string[] | null
          medical_record_number?: string | null
          middle_name?: string | null
          occupation?: string | null
          other_gender?: string | null
          other_language?: string | null
          patient_height_feet?: number | null
          patient_height_inches?: number | null
          patient_weight_lbs?: number | null
          phone?: string | null
          preferred_language?: string | null
          previous_hospitalizations?: string[] | null
          primary_care_physician?: string | null
          race?: string | null
          referring_physician?: string | null
          smoking_status?: string | null
          social_history?: string | null
          ssn_encrypted?: string | null
          state?: string | null
          updated_at?: string | null
          zip_code?: string | null
        }
        Update: {
          accessibility_needs?: string[] | null
          address?: string | null
          address_line_1?: string | null
          address_line_2?: string | null
          alcohol_use?: string | null
          allergies?: string[] | null
          apartment?: string | null
          avatar_url?: string | null
          cell_phone?: string | null
          city?: string | null
          communication_preferences?: string[] | null
          consent_for_communication?: boolean | null
          consent_for_treatment?: boolean | null
          country?: string | null
          created_at?: string | null
          current_medications?: string[] | null
          date_of_birth?: string | null
          department?: string | null
          do_not_contact_patient?: boolean | null
          email?: string | null
          emergency_contact_email?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          emergency_contact_relationship?: string | null
          enrollment_progress?: number | null
          enrollment_status?: string | null
          enrollment_type?: string | null
          ethnicity?: string | null
          facility_id?: string | null
          family_medical_history?: string | null
          first_name?: string | null
          gender?: string | null
          has_mfa_enabled?: boolean | null
          hipaa_acknowledgment?: boolean | null
          home_phone?: string | null
          id?: string
          is_email_verified?: boolean | null
          last_login?: string | null
          last_name?: string | null
          marital_status?: string | null
          medical_conditions?: string[] | null
          medical_record_number?: string | null
          middle_name?: string | null
          occupation?: string | null
          other_gender?: string | null
          other_language?: string | null
          patient_height_feet?: number | null
          patient_height_inches?: number | null
          patient_weight_lbs?: number | null
          phone?: string | null
          preferred_language?: string | null
          previous_hospitalizations?: string[] | null
          primary_care_physician?: string | null
          race?: string | null
          referring_physician?: string | null
          smoking_status?: string | null
          social_history?: string | null
          ssn_encrypted?: string | null
          state?: string | null
          updated_at?: string | null
          zip_code?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_facility_id_fkey"
            columns: ["facility_id"]
            isOneToOne: false
            referencedRelation: "facilities"
            referencedColumns: ["id"]
          },
        ]
      }
      prompt_governance: {
        Row: {
          analysis_results: Json
          blocking_reasons: Json | null
          compliance_score: number
          enhanced_prompt: string | null
          enhancements_applied: Json | null
          id: string
          intercepted_at: string
          original_prompt: string | null
          prompt_text: string
          user_id: string | null
          violations_found: Json | null
          was_blocked: boolean | null
        }
        Insert: {
          analysis_results?: Json
          blocking_reasons?: Json | null
          compliance_score?: number
          enhanced_prompt?: string | null
          enhancements_applied?: Json | null
          id?: string
          intercepted_at?: string
          original_prompt?: string | null
          prompt_text: string
          user_id?: string | null
          violations_found?: Json | null
          was_blocked?: boolean | null
        }
        Update: {
          analysis_results?: Json
          blocking_reasons?: Json | null
          compliance_score?: number
          enhanced_prompt?: string | null
          enhancements_applied?: Json | null
          id?: string
          intercepted_at?: string
          original_prompt?: string | null
          prompt_text?: string
          user_id?: string | null
          violations_found?: Json | null
          was_blocked?: boolean | null
        }
        Relationships: []
      }
      provider_enrollments: {
        Row: {
          board_certification: string | null
          created_at: string
          credentialing_status: string | null
          dea_number: string | null
          enrollment_id: string
          id: string
          license_expiry: string | null
          license_number: string | null
          license_state: string | null
          medical_license_number: string | null
          npi_number: string | null
          provider_address: string | null
          provider_city: string | null
          provider_email: string | null
          provider_name: string
          provider_phone: string | null
          provider_state: string | null
          provider_status: string | null
          provider_type: string
          provider_verification_status: string | null
          provider_zip: string | null
          specialty: string | null
          tax_id: string | null
          taxonomy_code: string | null
          updated_at: string
          user_id: string | null
          verification_confidence: number | null
          verification_issues: Json | null
          verification_source: string | null
          verified_at: string | null
        }
        Insert: {
          board_certification?: string | null
          created_at?: string
          credentialing_status?: string | null
          dea_number?: string | null
          enrollment_id: string
          id?: string
          license_expiry?: string | null
          license_number?: string | null
          license_state?: string | null
          medical_license_number?: string | null
          npi_number?: string | null
          provider_address?: string | null
          provider_city?: string | null
          provider_email?: string | null
          provider_name: string
          provider_phone?: string | null
          provider_state?: string | null
          provider_status?: string | null
          provider_type: string
          provider_verification_status?: string | null
          provider_zip?: string | null
          specialty?: string | null
          tax_id?: string | null
          taxonomy_code?: string | null
          updated_at?: string
          user_id?: string | null
          verification_confidence?: number | null
          verification_issues?: Json | null
          verification_source?: string | null
          verified_at?: string | null
        }
        Update: {
          board_certification?: string | null
          created_at?: string
          credentialing_status?: string | null
          dea_number?: string | null
          enrollment_id?: string
          id?: string
          license_expiry?: string | null
          license_number?: string | null
          license_state?: string | null
          medical_license_number?: string | null
          npi_number?: string | null
          provider_address?: string | null
          provider_city?: string | null
          provider_email?: string | null
          provider_name?: string
          provider_phone?: string | null
          provider_state?: string | null
          provider_status?: string | null
          provider_type?: string
          provider_verification_status?: string | null
          provider_zip?: string | null
          specialty?: string | null
          tax_id?: string | null
          taxonomy_code?: string | null
          updated_at?: string
          user_id?: string | null
          verification_confidence?: number | null
          verification_issues?: Json | null
          verification_source?: string | null
          verified_at?: string | null
        }
        Relationships: []
      }
      provider_profiles: {
        Row: {
          advanced_therapy_details: string | null
          advanced_therapy_details_provider: string | null
          advanced_therapy_experience: boolean | null
          advanced_therapy_experience_provider: boolean | null
          biomarker_training: boolean | null
          board_certifications: string[] | null
          cart_certification: boolean | null
          companion_dx_experience: boolean | null
          continuing_education_status: string | null
          controlled_substance_status: string | null
          controlled_substance_status_provider: string | null
          coverage_limits: string | null
          coverage_limits_provider: string | null
          created_at: string | null
          credentials: string | null
          crs_management_training: boolean | null
          dea_number: string | null
          disciplinary_actions: boolean | null
          disciplinary_actions_provider: boolean | null
          disciplinary_details: string | null
          disciplinary_details_provider: string | null
          email: string | null
          facility_id: string | null
          fax_number: string | null
          fda_training_certs: string[] | null
          fellowship_details: string | null
          first_name: string
          gene_therapy_training: boolean | null
          graduation_year: string | null
          hospital_affiliations: string[] | null
          hospital_affiliations_provider: string[] | null
          id: string
          insurance_expiration_date: string | null
          insurance_expiration_date_provider: string | null
          is_active: boolean | null
          last_name: string
          mailing_address: string | null
          mailing_address_provider: string | null
          malpractice_carrier: string | null
          malpractice_carrier_provider: string | null
          medical_license_numbers: Json | null
          medical_school: string | null
          middle_name: string | null
          middle_name_provider: string | null
          mobile_phone: string | null
          npi: string | null
          office_phone: string | null
          pdmp_registration: string | null
          pdmp_registration_provider: string | null
          policy_number: string | null
          policy_number_provider: string | null
          practice_type: string | null
          practice_type_provider: string | null
          preferred_contact_method: string | null
          preferred_contact_method_provider: string | null
          primary_address: string | null
          primary_address_provider: string | null
          primary_specialty: string | null
          radiation_safety_cert: boolean | null
          radioligand_certification: boolean | null
          rems: string[] | null
          residency_details: string | null
          taxonomy_codes: string[] | null
          updated_at: string | null
          user_id: string | null
          years_in_practice: string | null
          years_in_practice_provider: string | null
        }
        Insert: {
          advanced_therapy_details?: string | null
          advanced_therapy_details_provider?: string | null
          advanced_therapy_experience?: boolean | null
          advanced_therapy_experience_provider?: boolean | null
          biomarker_training?: boolean | null
          board_certifications?: string[] | null
          cart_certification?: boolean | null
          companion_dx_experience?: boolean | null
          continuing_education_status?: string | null
          controlled_substance_status?: string | null
          controlled_substance_status_provider?: string | null
          coverage_limits?: string | null
          coverage_limits_provider?: string | null
          created_at?: string | null
          credentials?: string | null
          crs_management_training?: boolean | null
          dea_number?: string | null
          disciplinary_actions?: boolean | null
          disciplinary_actions_provider?: boolean | null
          disciplinary_details?: string | null
          disciplinary_details_provider?: string | null
          email?: string | null
          facility_id?: string | null
          fax_number?: string | null
          fda_training_certs?: string[] | null
          fellowship_details?: string | null
          first_name: string
          gene_therapy_training?: boolean | null
          graduation_year?: string | null
          hospital_affiliations?: string[] | null
          hospital_affiliations_provider?: string[] | null
          id?: string
          insurance_expiration_date?: string | null
          insurance_expiration_date_provider?: string | null
          is_active?: boolean | null
          last_name: string
          mailing_address?: string | null
          mailing_address_provider?: string | null
          malpractice_carrier?: string | null
          malpractice_carrier_provider?: string | null
          medical_license_numbers?: Json | null
          medical_school?: string | null
          middle_name?: string | null
          middle_name_provider?: string | null
          mobile_phone?: string | null
          npi?: string | null
          office_phone?: string | null
          pdmp_registration?: string | null
          pdmp_registration_provider?: string | null
          policy_number?: string | null
          policy_number_provider?: string | null
          practice_type?: string | null
          practice_type_provider?: string | null
          preferred_contact_method?: string | null
          preferred_contact_method_provider?: string | null
          primary_address?: string | null
          primary_address_provider?: string | null
          primary_specialty?: string | null
          radiation_safety_cert?: boolean | null
          radioligand_certification?: boolean | null
          rems?: string[] | null
          residency_details?: string | null
          taxonomy_codes?: string[] | null
          updated_at?: string | null
          user_id?: string | null
          years_in_practice?: string | null
          years_in_practice_provider?: string | null
        }
        Update: {
          advanced_therapy_details?: string | null
          advanced_therapy_details_provider?: string | null
          advanced_therapy_experience?: boolean | null
          advanced_therapy_experience_provider?: boolean | null
          biomarker_training?: boolean | null
          board_certifications?: string[] | null
          cart_certification?: boolean | null
          companion_dx_experience?: boolean | null
          continuing_education_status?: string | null
          controlled_substance_status?: string | null
          controlled_substance_status_provider?: string | null
          coverage_limits?: string | null
          coverage_limits_provider?: string | null
          created_at?: string | null
          credentials?: string | null
          crs_management_training?: boolean | null
          dea_number?: string | null
          disciplinary_actions?: boolean | null
          disciplinary_actions_provider?: boolean | null
          disciplinary_details?: string | null
          disciplinary_details_provider?: string | null
          email?: string | null
          facility_id?: string | null
          fax_number?: string | null
          fda_training_certs?: string[] | null
          fellowship_details?: string | null
          first_name?: string
          gene_therapy_training?: boolean | null
          graduation_year?: string | null
          hospital_affiliations?: string[] | null
          hospital_affiliations_provider?: string[] | null
          id?: string
          insurance_expiration_date?: string | null
          insurance_expiration_date_provider?: string | null
          is_active?: boolean | null
          last_name?: string
          mailing_address?: string | null
          mailing_address_provider?: string | null
          malpractice_carrier?: string | null
          malpractice_carrier_provider?: string | null
          medical_license_numbers?: Json | null
          medical_school?: string | null
          middle_name?: string | null
          middle_name_provider?: string | null
          mobile_phone?: string | null
          npi?: string | null
          office_phone?: string | null
          pdmp_registration?: string | null
          pdmp_registration_provider?: string | null
          policy_number?: string | null
          policy_number_provider?: string | null
          practice_type?: string | null
          practice_type_provider?: string | null
          preferred_contact_method?: string | null
          preferred_contact_method_provider?: string | null
          primary_address?: string | null
          primary_address_provider?: string | null
          primary_specialty?: string | null
          radiation_safety_cert?: boolean | null
          radioligand_certification?: boolean | null
          rems?: string[] | null
          residency_details?: string | null
          taxonomy_codes?: string[] | null
          updated_at?: string | null
          user_id?: string | null
          years_in_practice?: string | null
          years_in_practice_provider?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "provider_profiles_facility_id_fkey"
            columns: ["facility_id"]
            isOneToOne: false
            referencedRelation: "facilities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "provider_profiles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      provider_test_configs: {
        Row: {
          agent_id: string | null
          config_name: string
          created_at: string | null
          created_by: string | null
          expected_outcomes: Json | null
          id: string
          is_active: boolean | null
          phone_number_id: string | null
          provider_type: string
          test_data: Json
          test_scenario: string
          updated_at: string | null
        }
        Insert: {
          agent_id?: string | null
          config_name: string
          created_at?: string | null
          created_by?: string | null
          expected_outcomes?: Json | null
          id?: string
          is_active?: boolean | null
          phone_number_id?: string | null
          provider_type: string
          test_data: Json
          test_scenario: string
          updated_at?: string | null
        }
        Update: {
          agent_id?: string | null
          config_name?: string
          created_at?: string | null
          created_by?: string | null
          expected_outcomes?: Json | null
          id?: string
          is_active?: boolean | null
          phone_number_id?: string | null
          provider_type?: string
          test_data?: Json
          test_scenario?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "provider_test_configs_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "provider_test_configs_phone_number_id_fkey"
            columns: ["phone_number_id"]
            isOneToOne: false
            referencedRelation: "phone_numbers"
            referencedColumns: ["id"]
          },
        ]
      }
      questionnaire_sessions: {
        Row: {
          agent_recommendation: string | null
          analysis: Json
          completed_at: string | null
          complexity_level: string | null
          created_at: string | null
          estimated_timeline: string | null
          id: string
          insights: Json | null
          recommended_path: string | null
          resources_needed: Json | null
          responses: Json
          session_type: string
          suitability_score: number | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          agent_recommendation?: string | null
          analysis?: Json
          completed_at?: string | null
          complexity_level?: string | null
          created_at?: string | null
          estimated_timeline?: string | null
          id?: string
          insights?: Json | null
          recommended_path?: string | null
          resources_needed?: Json | null
          responses?: Json
          session_type?: string
          suitability_score?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          agent_recommendation?: string | null
          analysis?: Json
          completed_at?: string | null
          complexity_level?: string | null
          created_at?: string | null
          estimated_timeline?: string | null
          id?: string
          insights?: Json | null
          recommended_path?: string | null
          resources_needed?: Json | null
          responses?: Json
          session_type?: string
          suitability_score?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      rag_recommendations: {
        Row: {
          clinical_insights: Json | null
          confidence_score: number | null
          conversation_id: string | null
          created_at: string
          healthcare_context: Json | null
          id: string
          knowledge_base_ids: string[] | null
          next_best_actions: Json
          query_context: string
          recommendations: Json
          treatment_recommendations: Json | null
        }
        Insert: {
          clinical_insights?: Json | null
          confidence_score?: number | null
          conversation_id?: string | null
          created_at?: string
          healthcare_context?: Json | null
          id?: string
          knowledge_base_ids?: string[] | null
          next_best_actions: Json
          query_context: string
          recommendations: Json
          treatment_recommendations?: Json | null
        }
        Update: {
          clinical_insights?: Json | null
          confidence_score?: number | null
          conversation_id?: string | null
          created_at?: string
          healthcare_context?: Json | null
          id?: string
          knowledge_base_ids?: string[] | null
          next_best_actions?: Json
          query_context?: string
          recommendations?: Json
          treatment_recommendations?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "rag_recommendations_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "agent_conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      received_emails: {
        Row: {
          attachments: Json | null
          from_email: string
          headers: Json | null
          html_content: string | null
          id: string
          in_reply_to: string | null
          is_archived: boolean | null
          is_read: boolean | null
          message_id: string | null
          processed_at: string | null
          processing_status: string | null
          raw_email: string | null
          received_at: string | null
          subject: string
          tags: string[] | null
          text_content: string
          thread_id: string | null
          to_email: string
        }
        Insert: {
          attachments?: Json | null
          from_email: string
          headers?: Json | null
          html_content?: string | null
          id?: string
          in_reply_to?: string | null
          is_archived?: boolean | null
          is_read?: boolean | null
          message_id?: string | null
          processed_at?: string | null
          processing_status?: string | null
          raw_email?: string | null
          received_at?: string | null
          subject: string
          tags?: string[] | null
          text_content: string
          thread_id?: string | null
          to_email: string
        }
        Update: {
          attachments?: Json | null
          from_email?: string
          headers?: Json | null
          html_content?: string | null
          id?: string
          in_reply_to?: string | null
          is_archived?: boolean | null
          is_read?: boolean | null
          message_id?: string | null
          processed_at?: string | null
          processing_status?: string | null
          raw_email?: string | null
          received_at?: string | null
          subject?: string
          tags?: string[] | null
          text_content?: string
          thread_id?: string | null
          to_email?: string
        }
        Relationships: []
      }
      referral_network_enrollments: {
        Row: {
          created_at: string
          enrollment_id: string
          id: string
          network_contact_person: string | null
          network_email: string | null
          network_phone: string | null
          referral_network_id: string | null
          referral_network_name: string
          referral_network_type: string | null
          referral_network_verification_status: string | null
          updated_at: string
          user_id: string | null
          verification_confidence: number | null
          verification_issues: Json | null
          verification_source: string | null
          verified_at: string | null
        }
        Insert: {
          created_at?: string
          enrollment_id: string
          id?: string
          network_contact_person?: string | null
          network_email?: string | null
          network_phone?: string | null
          referral_network_id?: string | null
          referral_network_name: string
          referral_network_type?: string | null
          referral_network_verification_status?: string | null
          updated_at?: string
          user_id?: string | null
          verification_confidence?: number | null
          verification_issues?: Json | null
          verification_source?: string | null
          verified_at?: string | null
        }
        Update: {
          created_at?: string
          enrollment_id?: string
          id?: string
          network_contact_person?: string | null
          network_email?: string | null
          network_phone?: string | null
          referral_network_id?: string | null
          referral_network_name?: string
          referral_network_type?: string | null
          referral_network_verification_status?: string | null
          updated_at?: string
          user_id?: string | null
          verification_confidence?: number | null
          verification_issues?: Json | null
          verification_source?: string | null
          verified_at?: string | null
        }
        Relationships: []
      }
      role_api_access: {
        Row: {
          access_level: string
          agent_integration_enabled: boolean | null
          api_service_id: string
          created_at: string | null
          endpoints_allowed: string[] | null
          field_mappings: Json | null
          id: string
          postman_collection_access: boolean | null
          production_access: boolean | null
          rate_limit: number | null
          role: Database["public"]["Enums"]["user_role"]
          sandbox_access: boolean | null
          testing_permissions: string[] | null
          updated_at: string | null
        }
        Insert: {
          access_level: string
          agent_integration_enabled?: boolean | null
          api_service_id: string
          created_at?: string | null
          endpoints_allowed?: string[] | null
          field_mappings?: Json | null
          id?: string
          postman_collection_access?: boolean | null
          production_access?: boolean | null
          rate_limit?: number | null
          role: Database["public"]["Enums"]["user_role"]
          sandbox_access?: boolean | null
          testing_permissions?: string[] | null
          updated_at?: string | null
        }
        Update: {
          access_level?: string
          agent_integration_enabled?: boolean | null
          api_service_id?: string
          created_at?: string | null
          endpoints_allowed?: string[] | null
          field_mappings?: Json | null
          id?: string
          postman_collection_access?: boolean | null
          production_access?: boolean | null
          rate_limit?: number | null
          role?: Database["public"]["Enums"]["user_role"]
          sandbox_access?: boolean | null
          testing_permissions?: string[] | null
          updated_at?: string | null
        }
        Relationships: []
      }
      role_module_assignments: {
        Row: {
          assigned_at: string | null
          assigned_by: string | null
          id: string
          is_active: boolean | null
          module_id: string | null
          role_id: string | null
        }
        Insert: {
          assigned_at?: string | null
          assigned_by?: string | null
          id?: string
          is_active?: boolean | null
          module_id?: string | null
          role_id?: string | null
        }
        Update: {
          assigned_at?: string | null
          assigned_by?: string | null
          id?: string
          is_active?: boolean | null
          module_id?: string | null
          role_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "role_module_assignments_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "modules"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "role_module_assignments_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["id"]
          },
        ]
      }
      role_permission_overrides: {
        Row: {
          created_at: string | null
          created_by: string | null
          facility_id: string | null
          id: string
          is_granted: boolean | null
          permission_id: string | null
          role_id: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          facility_id?: string | null
          id?: string
          is_granted?: boolean | null
          permission_id?: string | null
          role_id?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          facility_id?: string | null
          id?: string
          is_granted?: boolean | null
          permission_id?: string | null
          role_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "role_permission_overrides_facility_id_fkey"
            columns: ["facility_id"]
            isOneToOne: false
            referencedRelation: "facilities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "role_permission_overrides_permission_id_fkey"
            columns: ["permission_id"]
            isOneToOne: false
            referencedRelation: "permissions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "role_permission_overrides_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["id"]
          },
        ]
      }
      role_permissions: {
        Row: {
          created_at: string | null
          id: string
          permission_id: string | null
          role_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          permission_id?: string | null
          role_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          permission_id?: string | null
          role_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "role_permissions_permission_id_fkey"
            columns: ["permission_id"]
            isOneToOne: false
            referencedRelation: "permissions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "role_permissions_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["id"]
          },
        ]
      }
      roles: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          is_default: boolean | null
          name: Database["public"]["Enums"]["user_role"]
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_default?: boolean | null
          name: Database["public"]["Enums"]["user_role"]
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_default?: boolean | null
          name?: Database["public"]["Enums"]["user_role"]
        }
        Relationships: []
      }
      security_alerts: {
        Row: {
          alert_details: Json
          alert_type: string
          created_at: string
          id: string
          ip_address: unknown | null
          resolution_notes: string | null
          resolved_at: string | null
          resolved_by: string | null
          resource_accessed: string | null
          severity: string
          status: string
          updated_at: string
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          alert_details?: Json
          alert_type: string
          created_at?: string
          id?: string
          ip_address?: unknown | null
          resolution_notes?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          resource_accessed?: string | null
          severity: string
          status?: string
          updated_at?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          alert_details?: Json
          alert_type?: string
          created_at?: string
          id?: string
          ip_address?: unknown | null
          resolution_notes?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          resource_accessed?: string | null
          severity?: string
          status?: string
          updated_at?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      security_events: {
        Row: {
          created_at: string | null
          description: string
          event_type: string
          id: string
          ip_address: unknown | null
          location: Json | null
          metadata: Json | null
          resolved: boolean | null
          resolved_at: string | null
          resolved_by: string | null
          severity: string
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          description: string
          event_type: string
          id?: string
          ip_address?: unknown | null
          location?: Json | null
          metadata?: Json | null
          resolved?: boolean | null
          resolved_at?: string | null
          resolved_by?: string | null
          severity?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string
          event_type?: string
          id?: string
          ip_address?: unknown | null
          location?: Json | null
          metadata?: Json | null
          resolved?: boolean | null
          resolved_at?: string | null
          resolved_by?: string | null
          severity?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      security_settings: {
        Row: {
          api_access_logging: boolean | null
          backup_codes: Json | null
          created_at: string | null
          device_tracking: boolean | null
          id: string
          ip_whitelist: Json | null
          login_notifications: boolean | null
          password_last_changed: string | null
          security_questions: Json | null
          session_timeout_minutes: number | null
          suspicious_activity_alerts: boolean | null
          trusted_devices: Json | null
          two_factor_enabled: boolean | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          api_access_logging?: boolean | null
          backup_codes?: Json | null
          created_at?: string | null
          device_tracking?: boolean | null
          id?: string
          ip_whitelist?: Json | null
          login_notifications?: boolean | null
          password_last_changed?: string | null
          security_questions?: Json | null
          session_timeout_minutes?: number | null
          suspicious_activity_alerts?: boolean | null
          trusted_devices?: Json | null
          two_factor_enabled?: boolean | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          api_access_logging?: boolean | null
          backup_codes?: Json | null
          created_at?: string | null
          device_tracking?: boolean | null
          id?: string
          ip_whitelist?: Json | null
          login_notifications?: boolean | null
          password_last_changed?: string | null
          security_questions?: Json | null
          session_timeout_minutes?: number | null
          suspicious_activity_alerts?: boolean | null
          trusted_devices?: Json | null
          two_factor_enabled?: boolean | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      sent_emails: {
        Row: {
          bcc_emails: string[] | null
          cc_emails: string[] | null
          created_at: string | null
          delivery_status: string | null
          error_message: string | null
          external_id: string | null
          from_email: string
          html_content: string | null
          id: string
          sent_at: string | null
          status: string | null
          subject: string
          template_id: string | null
          template_variables: Json | null
          text_content: string | null
          to_emails: string[]
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          bcc_emails?: string[] | null
          cc_emails?: string[] | null
          created_at?: string | null
          delivery_status?: string | null
          error_message?: string | null
          external_id?: string | null
          from_email: string
          html_content?: string | null
          id?: string
          sent_at?: string | null
          status?: string | null
          subject: string
          template_id?: string | null
          template_variables?: Json | null
          text_content?: string | null
          to_emails: string[]
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          bcc_emails?: string[] | null
          cc_emails?: string[] | null
          created_at?: string | null
          delivery_status?: string | null
          error_message?: string | null
          external_id?: string | null
          from_email?: string
          html_content?: string | null
          id?: string
          sent_at?: string | null
          status?: string | null
          subject?: string
          template_id?: string | null
          template_variables?: Json | null
          text_content?: string | null
          to_emails?: string[]
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sent_emails_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "email_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      service_provider_capabilities: {
        Row: {
          capability_level: string | null
          certifications: string[] | null
          created_at: string | null
          experience_years: number | null
          geographic_restrictions: string[] | null
          id: string
          is_preferred: boolean | null
          regulatory_compliance: Json | null
          service_provider_id: string | null
          service_type: Database["public"]["Enums"]["service_type"]
          therapy_area: string | null
          updated_at: string | null
          volume_capacity: Json | null
        }
        Insert: {
          capability_level?: string | null
          certifications?: string[] | null
          created_at?: string | null
          experience_years?: number | null
          geographic_restrictions?: string[] | null
          id?: string
          is_preferred?: boolean | null
          regulatory_compliance?: Json | null
          service_provider_id?: string | null
          service_type: Database["public"]["Enums"]["service_type"]
          therapy_area?: string | null
          updated_at?: string | null
          volume_capacity?: Json | null
        }
        Update: {
          capability_level?: string | null
          certifications?: string[] | null
          created_at?: string | null
          experience_years?: number | null
          geographic_restrictions?: string[] | null
          id?: string
          is_preferred?: boolean | null
          regulatory_compliance?: Json | null
          service_provider_id?: string | null
          service_type?: Database["public"]["Enums"]["service_type"]
          therapy_area?: string | null
          updated_at?: string | null
          volume_capacity?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "service_provider_capabilities_service_provider_id_fkey"
            columns: ["service_provider_id"]
            isOneToOne: false
            referencedRelation: "service_providers"
            referencedColumns: ["id"]
          },
        ]
      }
      service_providers: {
        Row: {
          capabilities: string[] | null
          certification_details: Json | null
          contact_info: Json | null
          created_at: string | null
          description: string | null
          geographic_coverage: string[] | null
          id: string
          is_active: boolean | null
          name: string
          provider_type: Database["public"]["Enums"]["service_provider_type"]
          specializations: string[] | null
          updated_at: string | null
        }
        Insert: {
          capabilities?: string[] | null
          certification_details?: Json | null
          contact_info?: Json | null
          created_at?: string | null
          description?: string | null
          geographic_coverage?: string[] | null
          id?: string
          is_active?: boolean | null
          name: string
          provider_type: Database["public"]["Enums"]["service_provider_type"]
          specializations?: string[] | null
          updated_at?: string | null
        }
        Update: {
          capabilities?: string[] | null
          certification_details?: Json | null
          contact_info?: Json | null
          created_at?: string | null
          description?: string | null
          geographic_coverage?: string[] | null
          id?: string
          is_active?: boolean | null
          name?: string
          provider_type?: Database["public"]["Enums"]["service_provider_type"]
          specializations?: string[] | null
          updated_at?: string | null
        }
        Relationships: []
      }
      services: {
        Row: {
          capabilities: string[] | null
          created_at: string | null
          description: string | null
          geographic_coverage: string[] | null
          id: string
          is_active: boolean | null
          name: string
          pricing_model: Json | null
          requirements: Json | null
          service_provider_id: string | null
          service_type: Database["public"]["Enums"]["service_type"]
          sla_requirements: Json | null
          updated_at: string | null
        }
        Insert: {
          capabilities?: string[] | null
          created_at?: string | null
          description?: string | null
          geographic_coverage?: string[] | null
          id?: string
          is_active?: boolean | null
          name: string
          pricing_model?: Json | null
          requirements?: Json | null
          service_provider_id?: string | null
          service_type: Database["public"]["Enums"]["service_type"]
          sla_requirements?: Json | null
          updated_at?: string | null
        }
        Update: {
          capabilities?: string[] | null
          created_at?: string | null
          description?: string | null
          geographic_coverage?: string[] | null
          id?: string
          is_active?: boolean | null
          name?: string
          pricing_model?: Json | null
          requirements?: Json | null
          service_provider_id?: string | null
          service_type?: Database["public"]["Enums"]["service_type"]
          sla_requirements?: Json | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "services_service_provider_id_fkey"
            columns: ["service_provider_id"]
            isOneToOne: false
            referencedRelation: "service_providers"
            referencedColumns: ["id"]
          },
        ]
      }
      site_stats: {
        Row: {
          created_at: string
          id: string
          stat_name: string
          stat_value: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          stat_name: string
          stat_value?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          stat_name?: string
          stat_value?: number
          updated_at?: string
        }
        Relationships: []
      }
      softphone_sessions: {
        Row: {
          agent_id: string | null
          created_at: string | null
          current_call_session_id: string | null
          id: string
          last_activity: string | null
          phone_number_id: string | null
          status: string | null
          ui_preferences: Json | null
          updated_at: string | null
          user_id: string
          voice_settings: Json | null
          websocket_connection_id: string | null
        }
        Insert: {
          agent_id?: string | null
          created_at?: string | null
          current_call_session_id?: string | null
          id?: string
          last_activity?: string | null
          phone_number_id?: string | null
          status?: string | null
          ui_preferences?: Json | null
          updated_at?: string | null
          user_id: string
          voice_settings?: Json | null
          websocket_connection_id?: string | null
        }
        Update: {
          agent_id?: string | null
          created_at?: string | null
          current_call_session_id?: string | null
          id?: string
          last_activity?: string | null
          phone_number_id?: string | null
          status?: string | null
          ui_preferences?: Json | null
          updated_at?: string | null
          user_id?: string
          voice_settings?: Json | null
          websocket_connection_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "softphone_sessions_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "softphone_sessions_current_call_session_id_fkey"
            columns: ["current_call_session_id"]
            isOneToOne: false
            referencedRelation: "call_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "softphone_sessions_phone_number_id_fkey"
            columns: ["phone_number_id"]
            isOneToOne: false
            referencedRelation: "phone_numbers"
            referencedColumns: ["id"]
          },
        ]
      }
      stability_monitoring: {
        Row: {
          auto_fixed: boolean | null
          created_at: string
          event_data: Json
          event_type: string
          file_path: string | null
          id: string
          monitoring_session_id: string
          rule_name: string | null
          severity: string
          updated_at: string
          user_id: string | null
          violation_details: Json | null
        }
        Insert: {
          auto_fixed?: boolean | null
          created_at?: string
          event_data?: Json
          event_type: string
          file_path?: string | null
          id?: string
          monitoring_session_id: string
          rule_name?: string | null
          severity?: string
          updated_at?: string
          user_id?: string | null
          violation_details?: Json | null
        }
        Update: {
          auto_fixed?: boolean | null
          created_at?: string
          event_data?: Json
          event_type?: string
          file_path?: string | null
          id?: string
          monitoring_session_id?: string
          rule_name?: string | null
          severity?: string
          updated_at?: string
          user_id?: string | null
          violation_details?: Json | null
        }
        Relationships: []
      }
      system_connectors: {
        Row: {
          auth_type: string
          base_url: string | null
          category: string
          configuration: Json | null
          created_at: string | null
          created_by: string | null
          description: string | null
          endpoints: Json | null
          id: string
          last_tested: string | null
          name: string
          status: string
          success_rate: number | null
          type: string
          updated_at: string | null
          usage_count: number | null
        }
        Insert: {
          auth_type: string
          base_url?: string | null
          category: string
          configuration?: Json | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          endpoints?: Json | null
          id?: string
          last_tested?: string | null
          name: string
          status?: string
          success_rate?: number | null
          type: string
          updated_at?: string | null
          usage_count?: number | null
        }
        Update: {
          auth_type?: string
          base_url?: string | null
          category?: string
          configuration?: Json | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          endpoints?: Json | null
          id?: string
          last_tested?: string | null
          name?: string
          status?: string
          success_rate?: number | null
          type?: string
          updated_at?: string | null
          usage_count?: number | null
        }
        Relationships: []
      }
      system_functionality_registry: {
        Row: {
          created_at: string
          dependencies: Json | null
          description: string | null
          functionality_name: string
          functionality_type: string
          id: string
          last_analyzed_at: string | null
          metadata: Json | null
          risk_level: string | null
          schema_name: string | null
          test_coverage_status: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          dependencies?: Json | null
          description?: string | null
          functionality_name: string
          functionality_type: string
          id?: string
          last_analyzed_at?: string | null
          metadata?: Json | null
          risk_level?: string | null
          schema_name?: string | null
          test_coverage_status?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          dependencies?: Json | null
          description?: string | null
          functionality_name?: string
          functionality_type?: string
          id?: string
          last_analyzed_at?: string | null
          metadata?: Json | null
          risk_level?: string | null
          schema_name?: string | null
          test_coverage_status?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      test_configurations: {
        Row: {
          assertions: Json | null
          created_at: string | null
          created_by: string
          id: string
          is_active: boolean | null
          name: string
          notification_settings: Json | null
          performance_thresholds: Json | null
          reporting_config: Json | null
          test_config: Json
          test_scenarios: Json | null
          test_type: string
          updated_at: string | null
        }
        Insert: {
          assertions?: Json | null
          created_at?: string | null
          created_by: string
          id?: string
          is_active?: boolean | null
          name: string
          notification_settings?: Json | null
          performance_thresholds?: Json | null
          reporting_config?: Json | null
          test_config?: Json
          test_scenarios?: Json | null
          test_type?: string
          updated_at?: string | null
        }
        Update: {
          assertions?: Json | null
          created_at?: string | null
          created_by?: string
          id?: string
          is_active?: boolean | null
          name?: string
          notification_settings?: Json | null
          performance_thresholds?: Json | null
          reporting_config?: Json | null
          test_config?: Json
          test_scenarios?: Json | null
          test_type?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      test_datasets: {
        Row: {
          created_at: string | null
          created_by: string | null
          data_format: string
          dataset_type: string
          description: string | null
          id: string
          is_active: boolean | null
          labels: Json | null
          metadata: Json | null
          name: string
          sample_count: number | null
          storage_path: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          data_format: string
          dataset_type: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          labels?: Json | null
          metadata?: Json | null
          name: string
          sample_count?: number | null
          storage_path?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          data_format?: string
          dataset_type?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          labels?: Json | null
          metadata?: Json | null
          name?: string
          sample_count?: number | null
          storage_path?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      test_execution_history: {
        Row: {
          environment_info: Json | null
          error_message: string | null
          executed_at: string
          executed_by: string | null
          execution_batch_id: string
          execution_details: Json | null
          execution_status: string
          id: string
          performance_metrics: Json | null
          test_case_id: string
          test_suite_run_id: string | null
          validation_witness: string | null
        }
        Insert: {
          environment_info?: Json | null
          error_message?: string | null
          executed_at?: string
          executed_by?: string | null
          execution_batch_id: string
          execution_details?: Json | null
          execution_status: string
          id?: string
          performance_metrics?: Json | null
          test_case_id: string
          test_suite_run_id?: string | null
          validation_witness?: string | null
        }
        Update: {
          environment_info?: Json | null
          error_message?: string | null
          executed_at?: string
          executed_by?: string | null
          execution_batch_id?: string
          execution_details?: Json | null
          execution_status?: string
          id?: string
          performance_metrics?: Json | null
          test_case_id?: string
          test_suite_run_id?: string | null
          validation_witness?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "test_execution_history_test_case_id_fkey"
            columns: ["test_case_id"]
            isOneToOne: false
            referencedRelation: "comprehensive_test_cases"
            referencedColumns: ["id"]
          },
        ]
      }
      test_samples: {
        Row: {
          accuracy_score: number | null
          actual_output: Json | null
          created_at: string | null
          error_message: string | null
          expected_output: Json | null
          id: string
          input_data: Json
          processing_time_ms: number | null
          sample_index: number
          status: string | null
          test_run_id: string
        }
        Insert: {
          accuracy_score?: number | null
          actual_output?: Json | null
          created_at?: string | null
          error_message?: string | null
          expected_output?: Json | null
          id?: string
          input_data: Json
          processing_time_ms?: number | null
          sample_index: number
          status?: string | null
          test_run_id: string
        }
        Update: {
          accuracy_score?: number | null
          actual_output?: Json | null
          created_at?: string | null
          error_message?: string | null
          expected_output?: Json | null
          id?: string
          input_data?: Json
          processing_time_ms?: number | null
          sample_index?: number
          status?: string | null
          test_run_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "test_samples_test_run_id_fkey"
            columns: ["test_run_id"]
            isOneToOne: false
            referencedRelation: "agent_test_runs"
            referencedColumns: ["id"]
          },
        ]
      }
      therapies: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          indication: string | null
          is_active: boolean | null
          mechanism_of_action: string | null
          name: string
          regulatory_designations: string[] | null
          special_handling_requirements: Json | null
          target_population: string | null
          therapy_type: Database["public"]["Enums"]["therapy_type"]
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          indication?: string | null
          is_active?: boolean | null
          mechanism_of_action?: string | null
          name: string
          regulatory_designations?: string[] | null
          special_handling_requirements?: Json | null
          target_population?: string | null
          therapy_type: Database["public"]["Enums"]["therapy_type"]
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          indication?: string | null
          is_active?: boolean | null
          mechanism_of_action?: string | null
          name?: string
          regulatory_designations?: string[] | null
          special_handling_requirements?: Json | null
          target_population?: string | null
          therapy_type?: Database["public"]["Enums"]["therapy_type"]
          updated_at?: string | null
        }
        Relationships: []
      }
      tool_executions: {
        Row: {
          completed_at: string | null
          created_at: string | null
          duration_ms: number | null
          error_details: Json | null
          execution_context: Json | null
          id: string
          input_data: Json | null
          node_config_id: string | null
          output_data: Json | null
          status: string | null
          tool_name: string
          tool_type: string
          triggered_by: string | null
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          duration_ms?: number | null
          error_details?: Json | null
          execution_context?: Json | null
          id?: string
          input_data?: Json | null
          node_config_id?: string | null
          output_data?: Json | null
          status?: string | null
          tool_name: string
          tool_type: string
          triggered_by?: string | null
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          duration_ms?: number | null
          error_details?: Json | null
          execution_context?: Json | null
          id?: string
          input_data?: Json | null
          node_config_id?: string | null
          output_data?: Json | null
          status?: string | null
          tool_name?: string
          tool_type?: string
          triggered_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tool_executions_node_config_id_fkey"
            columns: ["node_config_id"]
            isOneToOne: false
            referencedRelation: "nodes_config"
            referencedColumns: ["id"]
          },
        ]
      }
      treatment_assessments: {
        Row: {
          absolute_contraindications: string | null
          active_infections: boolean | null
          address_verified: boolean | null
          advanced_directive_review: string | null
          assessment_completion_date: string | null
          assessment_status: string | null
          baseline_assessments_complete: boolean | null
          biomarker_testing_complete: boolean | null
          biometric_data_available: boolean | null
          capacity_assessment: string | null
          cardiac_clearance: string | null
          care_coordinator_assigned: string | null
          care_plan_developed: boolean | null
          care_team_assigned: boolean | null
          caregiver_support_identified: string | null
          case_manager_assignment: string | null
          clinical_decision: string | null
          clinical_decision_rationale: string | null
          code_status_discussed: boolean | null
          communication_consent: string | null
          consent_date: string | null
          consenting_physician: string | null
          contraindications_assessed: boolean | null
          created_at: string | null
          current_functional_capacity: boolean | null
          device_distribution: string | null
          disease_status_at_enrollment: string | null
          distance_from_treatment_center: string | null
          drug_interaction_check: boolean | null
          drug_interactions_reviewed: boolean | null
          eligibility_confirmed: boolean | null
          emergency_communication_plan: string | null
          emergency_contact_24x7: string | null
          enrollment_instance_id: string | null
          estimated_out_of_pocket_cost: number | null
          facility_id: string | null
          family_communication_preferences: string | null
          financial_assessment_complete: boolean | null
          financial_counseling_completed: boolean | null
          financial_hardship_identified: boolean | null
          genetic_testing_required: boolean | null
          healthcare_proxy_confirmed: string | null
          high_risk_factors: string[] | null
          hipaa_authorization: boolean | null
          home_health_services: string | null
          id: string
          identity_discrepancies_found: boolean | null
          identity_discrepancy_details: string | null
          identity_verification_date_time: string | null
          identity_verification_witness: string | null
          identity_verified: boolean | null
          infection_screening: string | null
          insurance_verification_complete: boolean | null
          lab_results_complete: boolean | null
          language_interpreter_services: string | null
          lodging_arrangements: string | null
          medical_clearance_obtained: boolean | null
          medical_history_reviewed: boolean | null
          medical_review_date: string | null
          medical_reviewer_id: string | null
          mitigation_strategies: string[] | null
          mobile_app_onboarded: boolean | null
          multidisciplinary_team_meeting: string | null
          nutrition_consultation: string | null
          out_of_pocket_amount: string | null
          out_of_pocket_cost_estimate_provided: boolean | null
          overall_risk_score: number | null
          patient_assistance_programs: string[] | null
          patient_assistance_programs_applied: string[] | null
          patient_id: string | null
          patient_photo_captured: boolean | null
          patient_portal_registration: string | null
          payment_plan_required: boolean | null
          payment_plan_terms: string | null
          performance_status_current: string | null
          pharmacy_consultation: string | null
          photo_id_type_verified: string | null
          photo_id_verification_completed: boolean | null
          photo_id_verified: boolean | null
          photography_video_consent: boolean | null
          physician_approval_obtained: boolean | null
          preferred_contact_method_appointments: string | null
          pregnancy_test: string | null
          primary_care_coordinator: string | null
          primary_nurse_assignment: string | null
          prior_authorization_status: string | null
          prior_severe_adverse_reactions: string | null
          provider_id: string | null
          pulmonary_function: string | null
          recent_hospitalizations: boolean | null
          relative_contraindications: string | null
          remote_monitoring_enabled: boolean | null
          remote_monitoring_required: boolean | null
          required_lab_tests: string[] | null
          required_pre_treatment_labs: boolean | null
          research_clinical_trial_consent: string | null
          risk_stratification_complete: boolean | null
          secondary_id_cross_verification: boolean | null
          secure_messaging_setup: string | null
          social_security_verified: boolean | null
          social_worker_consultation: string | null
          specialty_pharmacy_coordination: string | null
          technical_support_contact: string | null
          technology_assessment: string | null
          telehealth_capability: string | null
          telemedicine_setup_complete: boolean | null
          training_provided: boolean | null
          transportation_plan: string | null
          treatment_consent_status: string | null
          treatment_goals_discussion: string | null
          treatment_readiness_assessment: string | null
          treatment_readiness_score: number | null
          updated_at: string | null
          vaccination_status: string | null
          wearable_devices_assigned: string[] | null
        }
        Insert: {
          absolute_contraindications?: string | null
          active_infections?: boolean | null
          address_verified?: boolean | null
          advanced_directive_review?: string | null
          assessment_completion_date?: string | null
          assessment_status?: string | null
          baseline_assessments_complete?: boolean | null
          biomarker_testing_complete?: boolean | null
          biometric_data_available?: boolean | null
          capacity_assessment?: string | null
          cardiac_clearance?: string | null
          care_coordinator_assigned?: string | null
          care_plan_developed?: boolean | null
          care_team_assigned?: boolean | null
          caregiver_support_identified?: string | null
          case_manager_assignment?: string | null
          clinical_decision?: string | null
          clinical_decision_rationale?: string | null
          code_status_discussed?: boolean | null
          communication_consent?: string | null
          consent_date?: string | null
          consenting_physician?: string | null
          contraindications_assessed?: boolean | null
          created_at?: string | null
          current_functional_capacity?: boolean | null
          device_distribution?: string | null
          disease_status_at_enrollment?: string | null
          distance_from_treatment_center?: string | null
          drug_interaction_check?: boolean | null
          drug_interactions_reviewed?: boolean | null
          eligibility_confirmed?: boolean | null
          emergency_communication_plan?: string | null
          emergency_contact_24x7?: string | null
          enrollment_instance_id?: string | null
          estimated_out_of_pocket_cost?: number | null
          facility_id?: string | null
          family_communication_preferences?: string | null
          financial_assessment_complete?: boolean | null
          financial_counseling_completed?: boolean | null
          financial_hardship_identified?: boolean | null
          genetic_testing_required?: boolean | null
          healthcare_proxy_confirmed?: string | null
          high_risk_factors?: string[] | null
          hipaa_authorization?: boolean | null
          home_health_services?: string | null
          id?: string
          identity_discrepancies_found?: boolean | null
          identity_discrepancy_details?: string | null
          identity_verification_date_time?: string | null
          identity_verification_witness?: string | null
          identity_verified?: boolean | null
          infection_screening?: string | null
          insurance_verification_complete?: boolean | null
          lab_results_complete?: boolean | null
          language_interpreter_services?: string | null
          lodging_arrangements?: string | null
          medical_clearance_obtained?: boolean | null
          medical_history_reviewed?: boolean | null
          medical_review_date?: string | null
          medical_reviewer_id?: string | null
          mitigation_strategies?: string[] | null
          mobile_app_onboarded?: boolean | null
          multidisciplinary_team_meeting?: string | null
          nutrition_consultation?: string | null
          out_of_pocket_amount?: string | null
          out_of_pocket_cost_estimate_provided?: boolean | null
          overall_risk_score?: number | null
          patient_assistance_programs?: string[] | null
          patient_assistance_programs_applied?: string[] | null
          patient_id?: string | null
          patient_photo_captured?: boolean | null
          patient_portal_registration?: string | null
          payment_plan_required?: boolean | null
          payment_plan_terms?: string | null
          performance_status_current?: string | null
          pharmacy_consultation?: string | null
          photo_id_type_verified?: string | null
          photo_id_verification_completed?: boolean | null
          photo_id_verified?: boolean | null
          photography_video_consent?: boolean | null
          physician_approval_obtained?: boolean | null
          preferred_contact_method_appointments?: string | null
          pregnancy_test?: string | null
          primary_care_coordinator?: string | null
          primary_nurse_assignment?: string | null
          prior_authorization_status?: string | null
          prior_severe_adverse_reactions?: string | null
          provider_id?: string | null
          pulmonary_function?: string | null
          recent_hospitalizations?: boolean | null
          relative_contraindications?: string | null
          remote_monitoring_enabled?: boolean | null
          remote_monitoring_required?: boolean | null
          required_lab_tests?: string[] | null
          required_pre_treatment_labs?: boolean | null
          research_clinical_trial_consent?: string | null
          risk_stratification_complete?: boolean | null
          secondary_id_cross_verification?: boolean | null
          secure_messaging_setup?: string | null
          social_security_verified?: boolean | null
          social_worker_consultation?: string | null
          specialty_pharmacy_coordination?: string | null
          technical_support_contact?: string | null
          technology_assessment?: string | null
          telehealth_capability?: string | null
          telemedicine_setup_complete?: boolean | null
          training_provided?: boolean | null
          transportation_plan?: string | null
          treatment_consent_status?: string | null
          treatment_goals_discussion?: string | null
          treatment_readiness_assessment?: string | null
          treatment_readiness_score?: number | null
          updated_at?: string | null
          vaccination_status?: string | null
          wearable_devices_assigned?: string[] | null
        }
        Update: {
          absolute_contraindications?: string | null
          active_infections?: boolean | null
          address_verified?: boolean | null
          advanced_directive_review?: string | null
          assessment_completion_date?: string | null
          assessment_status?: string | null
          baseline_assessments_complete?: boolean | null
          biomarker_testing_complete?: boolean | null
          biometric_data_available?: boolean | null
          capacity_assessment?: string | null
          cardiac_clearance?: string | null
          care_coordinator_assigned?: string | null
          care_plan_developed?: boolean | null
          care_team_assigned?: boolean | null
          caregiver_support_identified?: string | null
          case_manager_assignment?: string | null
          clinical_decision?: string | null
          clinical_decision_rationale?: string | null
          code_status_discussed?: boolean | null
          communication_consent?: string | null
          consent_date?: string | null
          consenting_physician?: string | null
          contraindications_assessed?: boolean | null
          created_at?: string | null
          current_functional_capacity?: boolean | null
          device_distribution?: string | null
          disease_status_at_enrollment?: string | null
          distance_from_treatment_center?: string | null
          drug_interaction_check?: boolean | null
          drug_interactions_reviewed?: boolean | null
          eligibility_confirmed?: boolean | null
          emergency_communication_plan?: string | null
          emergency_contact_24x7?: string | null
          enrollment_instance_id?: string | null
          estimated_out_of_pocket_cost?: number | null
          facility_id?: string | null
          family_communication_preferences?: string | null
          financial_assessment_complete?: boolean | null
          financial_counseling_completed?: boolean | null
          financial_hardship_identified?: boolean | null
          genetic_testing_required?: boolean | null
          healthcare_proxy_confirmed?: string | null
          high_risk_factors?: string[] | null
          hipaa_authorization?: boolean | null
          home_health_services?: string | null
          id?: string
          identity_discrepancies_found?: boolean | null
          identity_discrepancy_details?: string | null
          identity_verification_date_time?: string | null
          identity_verification_witness?: string | null
          identity_verified?: boolean | null
          infection_screening?: string | null
          insurance_verification_complete?: boolean | null
          lab_results_complete?: boolean | null
          language_interpreter_services?: string | null
          lodging_arrangements?: string | null
          medical_clearance_obtained?: boolean | null
          medical_history_reviewed?: boolean | null
          medical_review_date?: string | null
          medical_reviewer_id?: string | null
          mitigation_strategies?: string[] | null
          mobile_app_onboarded?: boolean | null
          multidisciplinary_team_meeting?: string | null
          nutrition_consultation?: string | null
          out_of_pocket_amount?: string | null
          out_of_pocket_cost_estimate_provided?: boolean | null
          overall_risk_score?: number | null
          patient_assistance_programs?: string[] | null
          patient_assistance_programs_applied?: string[] | null
          patient_id?: string | null
          patient_photo_captured?: boolean | null
          patient_portal_registration?: string | null
          payment_plan_required?: boolean | null
          payment_plan_terms?: string | null
          performance_status_current?: string | null
          pharmacy_consultation?: string | null
          photo_id_type_verified?: string | null
          photo_id_verification_completed?: boolean | null
          photo_id_verified?: boolean | null
          photography_video_consent?: boolean | null
          physician_approval_obtained?: boolean | null
          preferred_contact_method_appointments?: string | null
          pregnancy_test?: string | null
          primary_care_coordinator?: string | null
          primary_nurse_assignment?: string | null
          prior_authorization_status?: string | null
          prior_severe_adverse_reactions?: string | null
          provider_id?: string | null
          pulmonary_function?: string | null
          recent_hospitalizations?: boolean | null
          relative_contraindications?: string | null
          remote_monitoring_enabled?: boolean | null
          remote_monitoring_required?: boolean | null
          required_lab_tests?: string[] | null
          required_pre_treatment_labs?: boolean | null
          research_clinical_trial_consent?: string | null
          risk_stratification_complete?: boolean | null
          secondary_id_cross_verification?: boolean | null
          secure_messaging_setup?: string | null
          social_security_verified?: boolean | null
          social_worker_consultation?: string | null
          specialty_pharmacy_coordination?: string | null
          technical_support_contact?: string | null
          technology_assessment?: string | null
          telehealth_capability?: string | null
          telemedicine_setup_complete?: boolean | null
          training_provided?: boolean | null
          transportation_plan?: string | null
          treatment_consent_status?: string | null
          treatment_goals_discussion?: string | null
          treatment_readiness_assessment?: string | null
          treatment_readiness_score?: number | null
          updated_at?: string | null
          vaccination_status?: string | null
          wearable_devices_assigned?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "treatment_assessments_enrollment_instance_id_fkey"
            columns: ["enrollment_instance_id"]
            isOneToOne: false
            referencedRelation: "enrollment_instances"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "treatment_assessments_facility_id_fkey"
            columns: ["facility_id"]
            isOneToOne: false
            referencedRelation: "facilities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "treatment_assessments_medical_reviewer_id_fkey"
            columns: ["medical_reviewer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "treatment_assessments_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "treatment_assessments_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "provider_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      treatment_center_enrollments: {
        Row: {
          created_at: string
          enrollment_id: string
          facility_address: string | null
          facility_city: string | null
          facility_email: string | null
          facility_license_expiry: string | null
          facility_license_number: string | null
          facility_name: string
          facility_npi: string | null
          facility_phone: string | null
          facility_state: string | null
          facility_status: string | null
          facility_type: string | null
          facility_zip: string | null
          id: string
          treatment_center_verification_status: string | null
          updated_at: string
          user_id: string | null
          verification_confidence: number | null
          verification_issues: Json | null
          verification_source: string | null
          verified_at: string | null
        }
        Insert: {
          created_at?: string
          enrollment_id: string
          facility_address?: string | null
          facility_city?: string | null
          facility_email?: string | null
          facility_license_expiry?: string | null
          facility_license_number?: string | null
          facility_name: string
          facility_npi?: string | null
          facility_phone?: string | null
          facility_state?: string | null
          facility_status?: string | null
          facility_type?: string | null
          facility_zip?: string | null
          id?: string
          treatment_center_verification_status?: string | null
          updated_at?: string
          user_id?: string | null
          verification_confidence?: number | null
          verification_issues?: Json | null
          verification_source?: string | null
          verified_at?: string | null
        }
        Update: {
          created_at?: string
          enrollment_id?: string
          facility_address?: string | null
          facility_city?: string | null
          facility_email?: string | null
          facility_license_expiry?: string | null
          facility_license_number?: string | null
          facility_name?: string
          facility_npi?: string | null
          facility_phone?: string | null
          facility_state?: string | null
          facility_status?: string | null
          facility_type?: string | null
          facility_zip?: string | null
          id?: string
          treatment_center_verification_status?: string | null
          updated_at?: string
          user_id?: string | null
          verification_confidence?: number | null
          verification_issues?: Json | null
          verification_source?: string | null
          verified_at?: string | null
        }
        Relationships: []
      }
      treatment_center_onboarding: {
        Row: {
          ach_preference: string | null
          api_authentication_method: string | null
          api_endpoint_url: string | null
          api_key_required: boolean | null
          assigned_to: string | null
          authorized_signatory_name: string | null
          authorized_signatory_ssn: string | null
          authorized_signatory_title: string | null
          bank_account_number: string | null
          bank_name: string | null
          bank_phone: string | null
          bank_routing_number: string | null
          bankruptcy_explanation: string | null
          bankruptcy_history: boolean | null
          business_types: Database["public"]["Enums"]["business_type"][] | null
          completed_steps:
            | Database["public"]["Enums"]["onboarding_step"][]
            | null
          created_at: string
          current_step: Database["public"]["Enums"]["onboarding_step"] | null
          data_format_preference: string | null
          date_signed: string | null
          dba_name: string | null
          dea_number: string | null
          dea_registration_copy_uploaded: boolean | null
          enrollment_type: string | null
          estimated_monthly_purchases: number | null
          federal_tax_id: string | null
          financial_statements_uploaded: boolean | null
          friday_close: string | null
          friday_open: string | null
          gpo_memberships: string[] | null
          guarantor_date: string | null
          guarantor_name: string | null
          guarantor_ssn: string | null
          hin_number: string | null
          holiday_schedule_notes: string | null
          id: string
          initial_order_amount: number | null
          is_340b_entity: boolean | null
          legal_name: string | null
          medical_license: string | null
          medical_license_copy_uploaded: boolean | null
          monday_close: string | null
          monday_open: string | null
          number_of_employees: number | null
          ownership_type: Database["public"]["Enums"]["ownership_type"] | null
          payment_terms_preference: string | null
          payment_terms_requested: string | null
          preferred_payment_methods: string[] | null
          resale_tax_exemption: string | null
          resale_tax_exemption_cert_uploaded: boolean | null
          same_as_legal_address: boolean | null
          saturday_close: string | null
          saturday_open: string | null
          selected_distributors:
            | Database["public"]["Enums"]["distributor_type"][]
            | null
          state_org_charter_id: string | null
          state_pharmacy_license: string | null
          state_pharmacy_license_copy_uploaded: boolean | null
          statement_delivery_preference: string | null
          status: Database["public"]["Enums"]["onboarding_status"]
          submitted_at: string | null
          sunday_close: string | null
          sunday_open: string | null
          supplier_statements_uploaded: boolean | null
          terms_accepted: boolean | null
          thursday_close: string | null
          thursday_open: string | null
          timezone: string | null
          tuesday_close: string | null
          tuesday_open: string | null
          updated_at: string
          user_id: string
          voided_check_uploaded: boolean | null
          webhook_url: string | null
          website: string | null
          wednesday_close: string | null
          wednesday_open: string | null
          years_in_business: number | null
        }
        Insert: {
          ach_preference?: string | null
          api_authentication_method?: string | null
          api_endpoint_url?: string | null
          api_key_required?: boolean | null
          assigned_to?: string | null
          authorized_signatory_name?: string | null
          authorized_signatory_ssn?: string | null
          authorized_signatory_title?: string | null
          bank_account_number?: string | null
          bank_name?: string | null
          bank_phone?: string | null
          bank_routing_number?: string | null
          bankruptcy_explanation?: string | null
          bankruptcy_history?: boolean | null
          business_types?: Database["public"]["Enums"]["business_type"][] | null
          completed_steps?:
            | Database["public"]["Enums"]["onboarding_step"][]
            | null
          created_at?: string
          current_step?: Database["public"]["Enums"]["onboarding_step"] | null
          data_format_preference?: string | null
          date_signed?: string | null
          dba_name?: string | null
          dea_number?: string | null
          dea_registration_copy_uploaded?: boolean | null
          enrollment_type?: string | null
          estimated_monthly_purchases?: number | null
          federal_tax_id?: string | null
          financial_statements_uploaded?: boolean | null
          friday_close?: string | null
          friday_open?: string | null
          gpo_memberships?: string[] | null
          guarantor_date?: string | null
          guarantor_name?: string | null
          guarantor_ssn?: string | null
          hin_number?: string | null
          holiday_schedule_notes?: string | null
          id?: string
          initial_order_amount?: number | null
          is_340b_entity?: boolean | null
          legal_name?: string | null
          medical_license?: string | null
          medical_license_copy_uploaded?: boolean | null
          monday_close?: string | null
          monday_open?: string | null
          number_of_employees?: number | null
          ownership_type?: Database["public"]["Enums"]["ownership_type"] | null
          payment_terms_preference?: string | null
          payment_terms_requested?: string | null
          preferred_payment_methods?: string[] | null
          resale_tax_exemption?: string | null
          resale_tax_exemption_cert_uploaded?: boolean | null
          same_as_legal_address?: boolean | null
          saturday_close?: string | null
          saturday_open?: string | null
          selected_distributors?:
            | Database["public"]["Enums"]["distributor_type"][]
            | null
          state_org_charter_id?: string | null
          state_pharmacy_license?: string | null
          state_pharmacy_license_copy_uploaded?: boolean | null
          statement_delivery_preference?: string | null
          status?: Database["public"]["Enums"]["onboarding_status"]
          submitted_at?: string | null
          sunday_close?: string | null
          sunday_open?: string | null
          supplier_statements_uploaded?: boolean | null
          terms_accepted?: boolean | null
          thursday_close?: string | null
          thursday_open?: string | null
          timezone?: string | null
          tuesday_close?: string | null
          tuesday_open?: string | null
          updated_at?: string
          user_id: string
          voided_check_uploaded?: boolean | null
          webhook_url?: string | null
          website?: string | null
          wednesday_close?: string | null
          wednesday_open?: string | null
          years_in_business?: number | null
        }
        Update: {
          ach_preference?: string | null
          api_authentication_method?: string | null
          api_endpoint_url?: string | null
          api_key_required?: boolean | null
          assigned_to?: string | null
          authorized_signatory_name?: string | null
          authorized_signatory_ssn?: string | null
          authorized_signatory_title?: string | null
          bank_account_number?: string | null
          bank_name?: string | null
          bank_phone?: string | null
          bank_routing_number?: string | null
          bankruptcy_explanation?: string | null
          bankruptcy_history?: boolean | null
          business_types?: Database["public"]["Enums"]["business_type"][] | null
          completed_steps?:
            | Database["public"]["Enums"]["onboarding_step"][]
            | null
          created_at?: string
          current_step?: Database["public"]["Enums"]["onboarding_step"] | null
          data_format_preference?: string | null
          date_signed?: string | null
          dba_name?: string | null
          dea_number?: string | null
          dea_registration_copy_uploaded?: boolean | null
          enrollment_type?: string | null
          estimated_monthly_purchases?: number | null
          federal_tax_id?: string | null
          financial_statements_uploaded?: boolean | null
          friday_close?: string | null
          friday_open?: string | null
          gpo_memberships?: string[] | null
          guarantor_date?: string | null
          guarantor_name?: string | null
          guarantor_ssn?: string | null
          hin_number?: string | null
          holiday_schedule_notes?: string | null
          id?: string
          initial_order_amount?: number | null
          is_340b_entity?: boolean | null
          legal_name?: string | null
          medical_license?: string | null
          medical_license_copy_uploaded?: boolean | null
          monday_close?: string | null
          monday_open?: string | null
          number_of_employees?: number | null
          ownership_type?: Database["public"]["Enums"]["ownership_type"] | null
          payment_terms_preference?: string | null
          payment_terms_requested?: string | null
          preferred_payment_methods?: string[] | null
          resale_tax_exemption?: string | null
          resale_tax_exemption_cert_uploaded?: boolean | null
          same_as_legal_address?: boolean | null
          saturday_close?: string | null
          saturday_open?: string | null
          selected_distributors?:
            | Database["public"]["Enums"]["distributor_type"][]
            | null
          state_org_charter_id?: string | null
          state_pharmacy_license?: string | null
          state_pharmacy_license_copy_uploaded?: boolean | null
          statement_delivery_preference?: string | null
          status?: Database["public"]["Enums"]["onboarding_status"]
          submitted_at?: string | null
          sunday_close?: string | null
          sunday_open?: string | null
          supplier_statements_uploaded?: boolean | null
          terms_accepted?: boolean | null
          thursday_close?: string | null
          thursday_open?: string | null
          timezone?: string | null
          tuesday_close?: string | null
          tuesday_open?: string | null
          updated_at?: string
          user_id?: string
          voided_check_uploaded?: boolean | null
          webhook_url?: string | null
          website?: string | null
          wednesday_close?: string | null
          wednesday_open?: string | null
          years_in_business?: number | null
        }
        Relationships: []
      }
      universal_save_sessions: {
        Row: {
          channel_type: string
          created_at: string
          current_step: string
          form_data: Json
          id: string
          metadata: Json | null
          progress_percentage: number
          session_type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          channel_type: string
          created_at?: string
          current_step: string
          form_data?: Json
          id?: string
          metadata?: Json | null
          progress_percentage?: number
          session_type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          channel_type?: string
          created_at?: string
          current_step?: string
          form_data?: Json
          id?: string
          metadata?: Json | null
          progress_percentage?: number
          session_type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      use_cases: {
        Row: {
          category: string
          complexity: string
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          industry: string | null
          is_active: boolean | null
          is_system_template: boolean | null
          name: string
          optional_components: Json | null
          recommended_journey: Json | null
          required_components: Json | null
          templates: Json | null
          updated_at: string
        }
        Insert: {
          category?: string
          complexity?: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          industry?: string | null
          is_active?: boolean | null
          is_system_template?: boolean | null
          name: string
          optional_components?: Json | null
          recommended_journey?: Json | null
          required_components?: Json | null
          templates?: Json | null
          updated_at?: string
        }
        Update: {
          category?: string
          complexity?: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          industry?: string | null
          is_active?: boolean | null
          is_system_template?: boolean | null
          name?: string
          optional_components?: Json | null
          recommended_journey?: Json | null
          required_components?: Json | null
          templates?: Json | null
          updated_at?: string
        }
        Relationships: []
      }
      user_activity_logs: {
        Row: {
          activity_description: string
          activity_type: string
          created_at: string | null
          id: string
          ip_address: unknown | null
          location: Json | null
          metadata: Json | null
          module_name: string | null
          session_id: string | null
          user_agent: string | null
          user_id: string
        }
        Insert: {
          activity_description: string
          activity_type: string
          created_at?: string | null
          id?: string
          ip_address?: unknown | null
          location?: Json | null
          metadata?: Json | null
          module_name?: string | null
          session_id?: string | null
          user_agent?: string | null
          user_id: string
        }
        Update: {
          activity_description?: string
          activity_type?: string
          created_at?: string | null
          id?: string
          ip_address?: unknown | null
          location?: Json | null
          metadata?: Json | null
          module_name?: string | null
          session_id?: string | null
          user_agent?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_conversations: {
        Row: {
          conversation_context: Json | null
          created_at: string
          email: string
          first_name: string
          id: string
          knowledge_contributions: Json | null
          rag_context: Json | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          conversation_context?: Json | null
          created_at?: string
          email: string
          first_name: string
          id?: string
          knowledge_contributions?: Json | null
          rag_context?: Json | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          conversation_context?: Json | null
          created_at?: string
          email?: string
          first_name?: string
          id?: string
          knowledge_contributions?: Json | null
          rag_context?: Json | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      user_facility_access: {
        Row: {
          access_level: string
          expires_at: string | null
          facility_id: string | null
          granted_at: string | null
          granted_by: string | null
          id: string
          is_active: boolean | null
          user_id: string | null
        }
        Insert: {
          access_level: string
          expires_at?: string | null
          facility_id?: string | null
          granted_at?: string | null
          granted_by?: string | null
          id?: string
          is_active?: boolean | null
          user_id?: string | null
        }
        Update: {
          access_level?: string
          expires_at?: string | null
          facility_id?: string | null
          granted_at?: string | null
          granted_by?: string | null
          id?: string
          is_active?: boolean | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_facility_access_facility_id_fkey"
            columns: ["facility_id"]
            isOneToOne: false
            referencedRelation: "facilities"
            referencedColumns: ["id"]
          },
        ]
      }
      user_module_assignments: {
        Row: {
          assigned_at: string | null
          assigned_by: string | null
          expires_at: string | null
          id: string
          is_active: boolean | null
          module_id: string | null
          user_id: string | null
        }
        Insert: {
          assigned_at?: string | null
          assigned_by?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          module_id?: string | null
          user_id?: string | null
        }
        Update: {
          assigned_at?: string | null
          assigned_by?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          module_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_module_assignments_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "modules"
            referencedColumns: ["id"]
          },
        ]
      }
      user_permissions: {
        Row: {
          expires_at: string | null
          granted_at: string | null
          granted_by: string | null
          id: string
          is_active: boolean | null
          permission_id: string | null
          user_id: string | null
        }
        Insert: {
          expires_at?: string | null
          granted_at?: string | null
          granted_by?: string | null
          id?: string
          is_active?: boolean | null
          permission_id?: string | null
          user_id?: string | null
        }
        Update: {
          expires_at?: string | null
          granted_at?: string | null
          granted_by?: string | null
          id?: string
          is_active?: boolean | null
          permission_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_permissions_permission_id_fkey"
            columns: ["permission_id"]
            isOneToOne: false
            referencedRelation: "permissions"
            referencedColumns: ["id"]
          },
        ]
      }
      user_preferences: {
        Row: {
          auto_route: boolean | null
          created_at: string | null
          default_module: string | null
          id: string
          language: string | null
          npi_verification_settings: Json | null
          preferred_dashboard: string | null
          theme_preference: string | null
          timezone: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          auto_route?: boolean | null
          created_at?: string | null
          default_module?: string | null
          id?: string
          language?: string | null
          npi_verification_settings?: Json | null
          preferred_dashboard?: string | null
          theme_preference?: string | null
          timezone?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          auto_route?: boolean | null
          created_at?: string | null
          default_module?: string | null
          id?: string
          language?: string | null
          npi_verification_settings?: Json | null
          preferred_dashboard?: string | null
          theme_preference?: string | null
          timezone?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          assigned_by: string | null
          created_at: string | null
          id: string
          role_id: string
          user_id: string
        }
        Insert: {
          assigned_by?: string | null
          created_at?: string | null
          id?: string
          role_id: string
          user_id: string
        }
        Update: {
          assigned_by?: string | null
          created_at?: string | null
          id?: string
          role_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["id"]
          },
        ]
      }
      validation_documentation: {
        Row: {
          approval_status: string | null
          approved_at: string | null
          approved_by: string | null
          change_control_number: string | null
          compliance_metadata: Json | null
          created_at: string
          created_by: string | null
          digital_signature: Json | null
          document_content: Json
          document_title: string
          document_type: string
          document_version: string
          id: string
          related_functionality_id: string | null
          related_test_cases: string[] | null
          reviewed_by: string[] | null
          updated_at: string
        }
        Insert: {
          approval_status?: string | null
          approved_at?: string | null
          approved_by?: string | null
          change_control_number?: string | null
          compliance_metadata?: Json | null
          created_at?: string
          created_by?: string | null
          digital_signature?: Json | null
          document_content?: Json
          document_title: string
          document_type: string
          document_version?: string
          id?: string
          related_functionality_id?: string | null
          related_test_cases?: string[] | null
          reviewed_by?: string[] | null
          updated_at?: string
        }
        Update: {
          approval_status?: string | null
          approved_at?: string | null
          approved_by?: string | null
          change_control_number?: string | null
          compliance_metadata?: Json | null
          created_at?: string
          created_by?: string | null
          digital_signature?: Json | null
          document_content?: Json
          document_title?: string
          document_type?: string
          document_version?: string
          id?: string
          related_functionality_id?: string | null
          related_test_cases?: string[] | null
          reviewed_by?: string[] | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "validation_documentation_related_functionality_id_fkey"
            columns: ["related_functionality_id"]
            isOneToOne: false
            referencedRelation: "system_functionality_registry"
            referencedColumns: ["id"]
          },
        ]
      }
      vector_configs: {
        Row: {
          configuration: Json
          created_at: string | null
          created_by: string | null
          description: string | null
          document_sources: Json | null
          embedding_model: string
          id: string
          knowledge_name: string
          node_config_id: string | null
          return_source_documents: boolean | null
          updated_at: string | null
          vector_store_type: string
        }
        Insert: {
          configuration?: Json
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          document_sources?: Json | null
          embedding_model: string
          id?: string
          knowledge_name: string
          node_config_id?: string | null
          return_source_documents?: boolean | null
          updated_at?: string | null
          vector_store_type: string
        }
        Update: {
          configuration?: Json
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          document_sources?: Json | null
          embedding_model?: string
          id?: string
          knowledge_name?: string
          node_config_id?: string | null
          return_source_documents?: boolean | null
          updated_at?: string | null
          vector_store_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "vector_configs_node_config_id_fkey"
            columns: ["node_config_id"]
            isOneToOne: false
            referencedRelation: "nodes_config"
            referencedColumns: ["id"]
          },
        ]
      }
      vector_store_configs: {
        Row: {
          connection_config: Json
          created_at: string | null
          created_by: string
          distance_metric: string | null
          embedding_config: Json | null
          id: string
          index_type: string | null
          is_active: boolean | null
          name: string
          performance_config: Json | null
          search_config: Json | null
          store_type: string
          updated_at: string | null
          vector_dimension: number
        }
        Insert: {
          connection_config?: Json
          created_at?: string | null
          created_by: string
          distance_metric?: string | null
          embedding_config?: Json | null
          id?: string
          index_type?: string | null
          is_active?: boolean | null
          name: string
          performance_config?: Json | null
          search_config?: Json | null
          store_type?: string
          updated_at?: string | null
          vector_dimension?: number
        }
        Update: {
          connection_config?: Json
          created_at?: string | null
          created_by?: string
          distance_metric?: string | null
          embedding_config?: Json | null
          id?: string
          index_type?: string | null
          is_active?: boolean | null
          name?: string
          performance_config?: Json | null
          search_config?: Json | null
          store_type?: string
          updated_at?: string | null
          vector_dimension?: number
        }
        Relationships: []
      }
      voice_analytics_events: {
        Row: {
          agent_id: string | null
          call_duration: number | null
          connector_id: string | null
          created_at: string
          event_type: Database["public"]["Enums"]["voice_event_type"]
          id: string
          live_agent_id: string | null
          metadata: Json
          queue_wait_time: number | null
        }
        Insert: {
          agent_id?: string | null
          call_duration?: number | null
          connector_id?: string | null
          created_at?: string
          event_type: Database["public"]["Enums"]["voice_event_type"]
          id?: string
          live_agent_id?: string | null
          metadata?: Json
          queue_wait_time?: number | null
        }
        Update: {
          agent_id?: string | null
          call_duration?: number | null
          connector_id?: string | null
          created_at?: string
          event_type?: Database["public"]["Enums"]["voice_event_type"]
          id?: string
          live_agent_id?: string | null
          metadata?: Json
          queue_wait_time?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "voice_analytics_events_agent_fk"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "voice_analytics_events_connector_fk"
            columns: ["connector_id"]
            isOneToOne: false
            referencedRelation: "voice_connectors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "voice_analytics_events_live_agent_fk"
            columns: ["live_agent_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      voice_configurations: {
        Row: {
          agent_id: string | null
          configuration: Json
          created_at: string
          id: string
          is_active: boolean
          updated_at: string
          voice_provider_id: string | null
        }
        Insert: {
          agent_id?: string | null
          configuration?: Json
          created_at?: string
          id?: string
          is_active?: boolean
          updated_at?: string
          voice_provider_id?: string | null
        }
        Update: {
          agent_id?: string | null
          configuration?: Json
          created_at?: string
          id?: string
          is_active?: boolean
          updated_at?: string
          voice_provider_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "voice_configurations_voice_provider_id_fkey"
            columns: ["voice_provider_id"]
            isOneToOne: false
            referencedRelation: "voice_providers"
            referencedColumns: ["id"]
          },
        ]
      }
      voice_connectors: {
        Row: {
          configuration: Json
          connector_type: Database["public"]["Enums"]["voice_connector_type"]
          created_at: string
          created_by: string
          endpoints: string[]
          features: string[]
          health_status: Database["public"]["Enums"]["voice_health_status"]
          id: string
          is_active: boolean
          last_tested_at: string | null
          name: string
          updated_at: string
        }
        Insert: {
          configuration?: Json
          connector_type: Database["public"]["Enums"]["voice_connector_type"]
          created_at?: string
          created_by: string
          endpoints?: string[]
          features?: string[]
          health_status?: Database["public"]["Enums"]["voice_health_status"]
          id?: string
          is_active?: boolean
          last_tested_at?: string | null
          name: string
          updated_at?: string
        }
        Update: {
          configuration?: Json
          connector_type?: Database["public"]["Enums"]["voice_connector_type"]
          created_at?: string
          created_by?: string
          endpoints?: string[]
          features?: string[]
          health_status?: Database["public"]["Enums"]["voice_health_status"]
          id?: string
          is_active?: boolean
          last_tested_at?: string | null
          name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "voice_connectors_created_by_fk"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      voice_providers: {
        Row: {
          api_credentials: Json | null
          capabilities: Json | null
          configuration: Json
          created_at: string | null
          created_by: string | null
          health_check_config: Json | null
          id: string
          is_active: boolean | null
          name: string
          provider_type: string
          rate_limits: Json | null
          updated_at: string | null
          webhook_config: Json | null
        }
        Insert: {
          api_credentials?: Json | null
          capabilities?: Json | null
          configuration?: Json
          created_at?: string | null
          created_by?: string | null
          health_check_config?: Json | null
          id?: string
          is_active?: boolean | null
          name: string
          provider_type: string
          rate_limits?: Json | null
          updated_at?: string | null
          webhook_config?: Json | null
        }
        Update: {
          api_credentials?: Json | null
          capabilities?: Json | null
          configuration?: Json
          created_at?: string | null
          created_by?: string | null
          health_check_config?: Json | null
          id?: string
          is_active?: boolean | null
          name?: string
          provider_type?: string
          rate_limits?: Json | null
          updated_at?: string | null
          webhook_config?: Json | null
        }
        Relationships: []
      }
      voice_transfer_queue: {
        Row: {
          agent_id: string | null
          assigned_at: string | null
          completed_at: string | null
          created_at: string
          customer_info: Json
          id: string
          live_agent_id: string | null
          priority: number
          requested_by: string
          status: Database["public"]["Enums"]["voice_transfer_status"]
          updated_at: string
        }
        Insert: {
          agent_id?: string | null
          assigned_at?: string | null
          completed_at?: string | null
          created_at?: string
          customer_info?: Json
          id?: string
          live_agent_id?: string | null
          priority?: number
          requested_by: string
          status?: Database["public"]["Enums"]["voice_transfer_status"]
          updated_at?: string
        }
        Update: {
          agent_id?: string | null
          assigned_at?: string | null
          completed_at?: string | null
          created_at?: string
          customer_info?: Json
          id?: string
          live_agent_id?: string | null
          priority?: number
          requested_by?: string
          status?: Database["public"]["Enums"]["voice_transfer_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "voice_transfer_queue_agent_fk"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "voice_transfer_queue_live_agent_fk"
            columns: ["live_agent_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "voice_transfer_queue_requested_by_fk"
            columns: ["requested_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      whatsapp_business_numbers: {
        Row: {
          capabilities: Json | null
          created_at: string | null
          department: string | null
          display_name: string
          id: string
          is_active: boolean | null
          is_default: boolean | null
          phone_number: string
          region: string | null
          twilio_sid: string | null
          updated_at: string | null
        }
        Insert: {
          capabilities?: Json | null
          created_at?: string | null
          department?: string | null
          display_name: string
          id?: string
          is_active?: boolean | null
          is_default?: boolean | null
          phone_number: string
          region?: string | null
          twilio_sid?: string | null
          updated_at?: string | null
        }
        Update: {
          capabilities?: Json | null
          created_at?: string | null
          department?: string | null
          display_name?: string
          id?: string
          is_active?: boolean | null
          is_default?: boolean | null
          phone_number?: string
          region?: string | null
          twilio_sid?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      whatsapp_consent_sessions: {
        Row: {
          caregiver_info: Json | null
          completed_at: string | null
          consent_method: string
          created_at: string
          enrollment_id: string | null
          id: string
          location_type: string
          patient_info: Json | null
          phone_number: string
          session_data: Json | null
          signature_alternative: string | null
          status: string
          updated_at: string
        }
        Insert: {
          caregiver_info?: Json | null
          completed_at?: string | null
          consent_method: string
          created_at?: string
          enrollment_id?: string | null
          id?: string
          location_type: string
          patient_info?: Json | null
          phone_number: string
          session_data?: Json | null
          signature_alternative?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          caregiver_info?: Json | null
          completed_at?: string | null
          consent_method?: string
          created_at?: string
          enrollment_id?: string | null
          id?: string
          location_type?: string
          patient_info?: Json | null
          phone_number?: string
          session_data?: Json | null
          signature_alternative?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      whatsapp_conversation_flows: {
        Row: {
          agent_type: string
          created_at: string | null
          flow_stage: string
          humor_elements: Json | null
          id: string
          next_stage_logic: Json | null
          personality_type: string
          prompt_template: string
          response_options: Json | null
          validation_rules: Json | null
        }
        Insert: {
          agent_type: string
          created_at?: string | null
          flow_stage: string
          humor_elements?: Json | null
          id?: string
          next_stage_logic?: Json | null
          personality_type: string
          prompt_template: string
          response_options?: Json | null
          validation_rules?: Json | null
        }
        Update: {
          agent_type?: string
          created_at?: string | null
          flow_stage?: string
          humor_elements?: Json | null
          id?: string
          next_stage_logic?: Json | null
          personality_type?: string
          prompt_template?: string
          response_options?: Json | null
          validation_rules?: Json | null
        }
        Relationships: []
      }
      whatsapp_enrollment_sessions: {
        Row: {
          agent_type: string
          collected_fields: Json | null
          completed_at: string | null
          completed_steps: string[] | null
          consent_status: string | null
          conversation_context: Json | null
          conversation_personality: string | null
          created_at: string | null
          current_step: string | null
          enrollment_mode: string
          expires_at: string | null
          form_sync_data: Json | null
          from_phone: string
          id: string
          patient_data: Json | null
          patient_phone: string
          provider_data: Json | null
          real_time_sync_enabled: boolean | null
          session_id: string
          updated_at: string | null
        }
        Insert: {
          agent_type: string
          collected_fields?: Json | null
          completed_at?: string | null
          completed_steps?: string[] | null
          consent_status?: string | null
          conversation_context?: Json | null
          conversation_personality?: string | null
          created_at?: string | null
          current_step?: string | null
          enrollment_mode: string
          expires_at?: string | null
          form_sync_data?: Json | null
          from_phone: string
          id?: string
          patient_data?: Json | null
          patient_phone: string
          provider_data?: Json | null
          real_time_sync_enabled?: boolean | null
          session_id: string
          updated_at?: string | null
        }
        Update: {
          agent_type?: string
          collected_fields?: Json | null
          completed_at?: string | null
          completed_steps?: string[] | null
          consent_status?: string | null
          conversation_context?: Json | null
          conversation_personality?: string | null
          created_at?: string | null
          current_step?: string | null
          enrollment_mode?: string
          expires_at?: string | null
          form_sync_data?: Json | null
          from_phone?: string
          id?: string
          patient_data?: Json | null
          patient_phone?: string
          provider_data?: Json | null
          real_time_sync_enabled?: boolean | null
          session_id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      workflow_actions: {
        Row: {
          average_execution_time_ms: number | null
          category: string
          code: string | null
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          inputs: Json | null
          is_custom: boolean | null
          library_id: string | null
          name: string
          outputs: Json | null
          parameters: Json | null
          success_rate: number | null
          type: string
          updated_at: string
          usage_count: number | null
          validation_rules: Json | null
        }
        Insert: {
          average_execution_time_ms?: number | null
          category: string
          code?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          inputs?: Json | null
          is_custom?: boolean | null
          library_id?: string | null
          name: string
          outputs?: Json | null
          parameters?: Json | null
          success_rate?: number | null
          type: string
          updated_at?: string
          usage_count?: number | null
          validation_rules?: Json | null
        }
        Update: {
          average_execution_time_ms?: number | null
          category?: string
          code?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          inputs?: Json | null
          is_custom?: boolean | null
          library_id?: string | null
          name?: string
          outputs?: Json | null
          parameters?: Json | null
          success_rate?: number | null
          type?: string
          updated_at?: string
          usage_count?: number | null
          validation_rules?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "workflow_actions_library_id_fkey"
            columns: ["library_id"]
            isOneToOne: false
            referencedRelation: "workflow_libraries"
            referencedColumns: ["id"]
          },
        ]
      }
      workflow_analysis: {
        Row: {
          analysis_results: Json
          analysis_type: string
          complexity_score: number | null
          created_at: string | null
          current_nodes: Json
          id: string
          optimization_opportunities: Json | null
          performance_score: number | null
          suggestions_generated: number | null
          user_id: string | null
          workflow_id: string
        }
        Insert: {
          analysis_results?: Json
          analysis_type: string
          complexity_score?: number | null
          created_at?: string | null
          current_nodes?: Json
          id?: string
          optimization_opportunities?: Json | null
          performance_score?: number | null
          suggestions_generated?: number | null
          user_id?: string | null
          workflow_id: string
        }
        Update: {
          analysis_results?: Json
          analysis_type?: string
          complexity_score?: number | null
          created_at?: string | null
          current_nodes?: Json
          id?: string
          optimization_opportunities?: Json | null
          performance_score?: number | null
          suggestions_generated?: number | null
          user_id?: string | null
          workflow_id?: string
        }
        Relationships: []
      }
      workflow_collaborations: {
        Row: {
          cursor_position: Json | null
          id: string
          is_active: boolean
          joined_at: string
          last_active: string
          permission: string
          user_id: string
          workflow_id: string
        }
        Insert: {
          cursor_position?: Json | null
          id?: string
          is_active?: boolean
          joined_at?: string
          last_active?: string
          permission?: string
          user_id: string
          workflow_id: string
        }
        Update: {
          cursor_position?: Json | null
          id?: string
          is_active?: boolean
          joined_at?: string
          last_active?: string
          permission?: string
          user_id?: string
          workflow_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workflow_collaborations_workflow_id_fkey"
            columns: ["workflow_id"]
            isOneToOne: false
            referencedRelation: "agent_workflows"
            referencedColumns: ["id"]
          },
        ]
      }
      workflow_connections: {
        Row: {
          action_id: string | null
          configuration: Json | null
          connection_type: string
          created_at: string
          created_by: string | null
          id: string
          is_active: boolean | null
          library_id: string | null
          operator_id: string | null
          source_node_id: string
          target_node_id: string
          updated_at: string
          workflow_id: string
        }
        Insert: {
          action_id?: string | null
          configuration?: Json | null
          connection_type: string
          created_at?: string
          created_by?: string | null
          id?: string
          is_active?: boolean | null
          library_id?: string | null
          operator_id?: string | null
          source_node_id: string
          target_node_id: string
          updated_at?: string
          workflow_id: string
        }
        Update: {
          action_id?: string | null
          configuration?: Json | null
          connection_type?: string
          created_at?: string
          created_by?: string | null
          id?: string
          is_active?: boolean | null
          library_id?: string | null
          operator_id?: string | null
          source_node_id?: string
          target_node_id?: string
          updated_at?: string
          workflow_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workflow_connections_action_id_fkey"
            columns: ["action_id"]
            isOneToOne: false
            referencedRelation: "workflow_actions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workflow_connections_library_id_fkey"
            columns: ["library_id"]
            isOneToOne: false
            referencedRelation: "workflow_libraries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workflow_connections_operator_id_fkey"
            columns: ["operator_id"]
            isOneToOne: false
            referencedRelation: "workflow_operators"
            referencedColumns: ["id"]
          },
        ]
      }
      workflow_deployments: {
        Row: {
          created_at: string
          deployed_at: string | null
          deployed_by: string | null
          deployment_config: Json
          deployment_name: string
          environment: string
          health_check_url: string | null
          id: string
          performance_metrics: Json | null
          status: string
          updated_at: string
          workflow_id: string
        }
        Insert: {
          created_at?: string
          deployed_at?: string | null
          deployed_by?: string | null
          deployment_config?: Json
          deployment_name: string
          environment?: string
          health_check_url?: string | null
          id?: string
          performance_metrics?: Json | null
          status?: string
          updated_at?: string
          workflow_id: string
        }
        Update: {
          created_at?: string
          deployed_at?: string | null
          deployed_by?: string | null
          deployment_config?: Json
          deployment_name?: string
          environment?: string
          health_check_url?: string | null
          id?: string
          performance_metrics?: Json | null
          status?: string
          updated_at?: string
          workflow_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workflow_deployments_workflow_id_fkey"
            columns: ["workflow_id"]
            isOneToOne: false
            referencedRelation: "agent_workflows"
            referencedColumns: ["id"]
          },
        ]
      }
      workflow_edges: {
        Row: {
          created_at: string
          edge_data: Json | null
          edge_id: string
          edge_type: string | null
          id: string
          is_active: boolean
          source_node_id: string
          target_node_id: string
          updated_at: string
          workflow_id: string
        }
        Insert: {
          created_at?: string
          edge_data?: Json | null
          edge_id: string
          edge_type?: string | null
          id?: string
          is_active?: boolean
          source_node_id: string
          target_node_id: string
          updated_at?: string
          workflow_id: string
        }
        Update: {
          created_at?: string
          edge_data?: Json | null
          edge_id?: string
          edge_type?: string | null
          id?: string
          is_active?: boolean
          source_node_id?: string
          target_node_id?: string
          updated_at?: string
          workflow_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workflow_edges_workflow_id_fkey"
            columns: ["workflow_id"]
            isOneToOne: false
            referencedRelation: "agent_workflows"
            referencedColumns: ["id"]
          },
        ]
      }
      workflow_execution_logs: {
        Row: {
          completed_at: string | null
          created_at: string | null
          error_details: Json | null
          execution_status: string
          execution_time_ms: number | null
          id: string
          input_data: Json | null
          node_id: string
          node_type: string
          output_data: Json | null
          started_at: string | null
          workflow_instance_id: string | null
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          error_details?: Json | null
          execution_status?: string
          execution_time_ms?: number | null
          id?: string
          input_data?: Json | null
          node_id: string
          node_type: string
          output_data?: Json | null
          started_at?: string | null
          workflow_instance_id?: string | null
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          error_details?: Json | null
          execution_status?: string
          execution_time_ms?: number | null
          id?: string
          input_data?: Json | null
          node_id?: string
          node_type?: string
          output_data?: Json | null
          started_at?: string | null
          workflow_instance_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "workflow_execution_logs_workflow_instance_id_fkey"
            columns: ["workflow_instance_id"]
            isOneToOne: false
            referencedRelation: "workflow_instances"
            referencedColumns: ["id"]
          },
        ]
      }
      workflow_execution_steps: {
        Row: {
          completed_at: string | null
          created_at: string | null
          duration_ms: number | null
          error_details: Json | null
          error_message: string | null
          id: string
          input_data: Json | null
          node_id: string
          node_name: string
          node_type: string
          output_data: Json | null
          performance_metrics: Json | null
          started_at: string | null
          status: string
          step_index: number
          trace_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          duration_ms?: number | null
          error_details?: Json | null
          error_message?: string | null
          id?: string
          input_data?: Json | null
          node_id: string
          node_name: string
          node_type: string
          output_data?: Json | null
          performance_metrics?: Json | null
          started_at?: string | null
          status?: string
          step_index: number
          trace_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          duration_ms?: number | null
          error_details?: Json | null
          error_message?: string | null
          id?: string
          input_data?: Json | null
          node_id?: string
          node_name?: string
          node_type?: string
          output_data?: Json | null
          performance_metrics?: Json | null
          started_at?: string | null
          status?: string
          step_index?: number
          trace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workflow_execution_steps_trace_id_fkey"
            columns: ["trace_id"]
            isOneToOne: false
            referencedRelation: "workflow_execution_traces"
            referencedColumns: ["id"]
          },
        ]
      }
      workflow_execution_traces: {
        Row: {
          arize_trace_id: string | null
          completed_at: string | null
          created_at: string | null
          created_by: string | null
          error_count: number | null
          id: string
          metadata: Json | null
          node_count: number | null
          session_id: string | null
          started_at: string
          status: string
          success_count: number | null
          total_duration_ms: number | null
          trace_id: string
          updated_at: string | null
          workflow_id: string | null
        }
        Insert: {
          arize_trace_id?: string | null
          completed_at?: string | null
          created_at?: string | null
          created_by?: string | null
          error_count?: number | null
          id?: string
          metadata?: Json | null
          node_count?: number | null
          session_id?: string | null
          started_at?: string
          status?: string
          success_count?: number | null
          total_duration_ms?: number | null
          trace_id: string
          updated_at?: string | null
          workflow_id?: string | null
        }
        Update: {
          arize_trace_id?: string | null
          completed_at?: string | null
          created_at?: string | null
          created_by?: string | null
          error_count?: number | null
          id?: string
          metadata?: Json | null
          node_count?: number | null
          session_id?: string | null
          started_at?: string
          status?: string
          success_count?: number | null
          total_duration_ms?: number | null
          trace_id?: string
          updated_at?: string | null
          workflow_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "workflow_execution_traces_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "agent_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      workflow_executions: {
        Row: {
          completed_at: string | null
          created_at: string | null
          error_details: Json | null
          execution_trace: Json | null
          id: string
          input_data: Json | null
          output_data: Json | null
          performance_metrics: Json | null
          started_at: string | null
          status: string | null
          triggered_by: string | null
          workflow_instance_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          error_details?: Json | null
          execution_trace?: Json | null
          id?: string
          input_data?: Json | null
          output_data?: Json | null
          performance_metrics?: Json | null
          started_at?: string | null
          status?: string | null
          triggered_by?: string | null
          workflow_instance_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          error_details?: Json | null
          execution_trace?: Json | null
          id?: string
          input_data?: Json | null
          output_data?: Json | null
          performance_metrics?: Json | null
          started_at?: string | null
          status?: string | null
          triggered_by?: string | null
          workflow_instance_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workflow_executions_workflow_instance_id_fkey"
            columns: ["workflow_instance_id"]
            isOneToOne: false
            referencedRelation: "workflow_instances"
            referencedColumns: ["id"]
          },
        ]
      }
      workflow_instances: {
        Row: {
          configuration: Json | null
          created_at: string | null
          created_by: string
          description: string | null
          execution_count: number | null
          id: string
          last_executed_at: string | null
          metadata: Json | null
          name: string
          status: string | null
          template_id: string | null
          updated_at: string | null
          workflow_data: Json
        }
        Insert: {
          configuration?: Json | null
          created_at?: string | null
          created_by: string
          description?: string | null
          execution_count?: number | null
          id?: string
          last_executed_at?: string | null
          metadata?: Json | null
          name: string
          status?: string | null
          template_id?: string | null
          updated_at?: string | null
          workflow_data?: Json
        }
        Update: {
          configuration?: Json | null
          created_at?: string | null
          created_by?: string
          description?: string | null
          execution_count?: number | null
          id?: string
          last_executed_at?: string | null
          metadata?: Json | null
          name?: string
          status?: string | null
          template_id?: string | null
          updated_at?: string | null
          workflow_data?: Json
        }
        Relationships: [
          {
            foreignKeyName: "workflow_instances_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "workflow_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      workflow_libraries: {
        Row: {
          author: string | null
          category: string
          configuration: Json | null
          created_at: string
          created_by: string | null
          dependencies: string[] | null
          description: string | null
          documentation_url: string | null
          downloads: number | null
          examples: Json | null
          id: string
          is_core: boolean | null
          is_custom: boolean | null
          is_installed: boolean | null
          name: string
          rating: number | null
          repository_url: string | null
          tags: string[] | null
          updated_at: string
          version: string
        }
        Insert: {
          author?: string | null
          category: string
          configuration?: Json | null
          created_at?: string
          created_by?: string | null
          dependencies?: string[] | null
          description?: string | null
          documentation_url?: string | null
          downloads?: number | null
          examples?: Json | null
          id?: string
          is_core?: boolean | null
          is_custom?: boolean | null
          is_installed?: boolean | null
          name: string
          rating?: number | null
          repository_url?: string | null
          tags?: string[] | null
          updated_at?: string
          version?: string
        }
        Update: {
          author?: string | null
          category?: string
          configuration?: Json | null
          created_at?: string
          created_by?: string | null
          dependencies?: string[] | null
          description?: string | null
          documentation_url?: string | null
          downloads?: number | null
          examples?: Json | null
          id?: string
          is_core?: boolean | null
          is_custom?: boolean | null
          is_installed?: boolean | null
          name?: string
          rating?: number | null
          repository_url?: string | null
          tags?: string[] | null
          updated_at?: string
          version?: string
        }
        Relationships: []
      }
      workflow_node_categories: {
        Row: {
          color: string | null
          created_at: string | null
          description: string | null
          display_name: string
          icon: string | null
          id: string
          is_active: boolean | null
          name: string
          order_index: number | null
          parent_category_id: string | null
          updated_at: string | null
        }
        Insert: {
          color?: string | null
          created_at?: string | null
          description?: string | null
          display_name: string
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          order_index?: number | null
          parent_category_id?: string | null
          updated_at?: string | null
        }
        Update: {
          color?: string | null
          created_at?: string | null
          description?: string | null
          display_name?: string
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          order_index?: number | null
          parent_category_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "workflow_node_categories_parent_category_id_fkey"
            columns: ["parent_category_id"]
            isOneToOne: false
            referencedRelation: "workflow_node_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      workflow_node_dependencies: {
        Row: {
          condition: Json | null
          created_at: string | null
          dependency_type: string | null
          id: string
          source_node_id: string
          target_node_id: string
          workflow_instance_id: string
        }
        Insert: {
          condition?: Json | null
          created_at?: string | null
          dependency_type?: string | null
          id?: string
          source_node_id: string
          target_node_id: string
          workflow_instance_id: string
        }
        Update: {
          condition?: Json | null
          created_at?: string | null
          dependency_type?: string | null
          id?: string
          source_node_id?: string
          target_node_id?: string
          workflow_instance_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workflow_node_dependencies_workflow_instance_id_fkey"
            columns: ["workflow_instance_id"]
            isOneToOne: false
            referencedRelation: "workflow_instances"
            referencedColumns: ["id"]
          },
        ]
      }
      workflow_node_executions: {
        Row: {
          completed_at: string | null
          created_at: string | null
          duration_ms: number | null
          error_details: Json | null
          id: string
          input_data: Json | null
          node_id: string
          node_type_key: string
          output_data: Json | null
          retry_count: number | null
          started_at: string | null
          status: string | null
          workflow_execution_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          duration_ms?: number | null
          error_details?: Json | null
          id?: string
          input_data?: Json | null
          node_id: string
          node_type_key: string
          output_data?: Json | null
          retry_count?: number | null
          started_at?: string | null
          status?: string | null
          workflow_execution_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          duration_ms?: number | null
          error_details?: Json | null
          id?: string
          input_data?: Json | null
          node_id?: string
          node_type_key?: string
          output_data?: Json | null
          retry_count?: number | null
          started_at?: string | null
          status?: string | null
          workflow_execution_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workflow_node_executions_workflow_execution_id_fkey"
            columns: ["workflow_execution_id"]
            isOneToOne: false
            referencedRelation: "workflow_executions"
            referencedColumns: ["id"]
          },
        ]
      }
      workflow_node_instances: {
        Row: {
          configuration: Json | null
          created_at: string | null
          created_by: string | null
          id: string
          instance_name: string | null
          is_active: boolean | null
          metadata: Json | null
          node_id: string
          node_type_key: string
          position: Json | null
          size: Json | null
          updated_at: string | null
          workflow_id: string
        }
        Insert: {
          configuration?: Json | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          instance_name?: string | null
          is_active?: boolean | null
          metadata?: Json | null
          node_id: string
          node_type_key: string
          position?: Json | null
          size?: Json | null
          updated_at?: string | null
          workflow_id: string
        }
        Update: {
          configuration?: Json | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          instance_name?: string | null
          is_active?: boolean | null
          metadata?: Json | null
          node_id?: string
          node_type_key?: string
          position?: Json | null
          size?: Json | null
          updated_at?: string | null
          workflow_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workflow_node_instances_node_type_key_fkey"
            columns: ["node_type_key"]
            isOneToOne: false
            referencedRelation: "consolidated_node_catalog"
            referencedColumns: ["type_key"]
          },
          {
            foreignKeyName: "workflow_node_instances_node_type_key_fkey"
            columns: ["node_type_key"]
            isOneToOne: false
            referencedRelation: "workflow_node_types"
            referencedColumns: ["type_key"]
          },
        ]
      }
      workflow_node_types: {
        Row: {
          ai_model_config: Json | null
          apis_config: Json | null
          business_rules: Json | null
          capabilities: Json | null
          category_id: string
          color: string | null
          configuration_schema: Json | null
          connectors_config: Json | null
          created_at: string | null
          created_by: string | null
          data_storage_config: Json | null
          default_config: Json | null
          description: string | null
          detailed_explanation: string | null
          display_name: string
          icon: string | null
          id: string
          input_schema: Json | null
          is_active: boolean | null
          is_configurable: boolean | null
          is_draggable: boolean | null
          order_index: number | null
          output_schema: Json | null
          requirements: Json | null
          type_key: string
          updated_at: string | null
          validation_rules: Json | null
          variables_config: Json | null
        }
        Insert: {
          ai_model_config?: Json | null
          apis_config?: Json | null
          business_rules?: Json | null
          capabilities?: Json | null
          category_id: string
          color?: string | null
          configuration_schema?: Json | null
          connectors_config?: Json | null
          created_at?: string | null
          created_by?: string | null
          data_storage_config?: Json | null
          default_config?: Json | null
          description?: string | null
          detailed_explanation?: string | null
          display_name: string
          icon?: string | null
          id?: string
          input_schema?: Json | null
          is_active?: boolean | null
          is_configurable?: boolean | null
          is_draggable?: boolean | null
          order_index?: number | null
          output_schema?: Json | null
          requirements?: Json | null
          type_key: string
          updated_at?: string | null
          validation_rules?: Json | null
          variables_config?: Json | null
        }
        Update: {
          ai_model_config?: Json | null
          apis_config?: Json | null
          business_rules?: Json | null
          capabilities?: Json | null
          category_id?: string
          color?: string | null
          configuration_schema?: Json | null
          connectors_config?: Json | null
          created_at?: string | null
          created_by?: string | null
          data_storage_config?: Json | null
          default_config?: Json | null
          description?: string | null
          detailed_explanation?: string | null
          display_name?: string
          icon?: string | null
          id?: string
          input_schema?: Json | null
          is_active?: boolean | null
          is_configurable?: boolean | null
          is_draggable?: boolean | null
          order_index?: number | null
          output_schema?: Json | null
          requirements?: Json | null
          type_key?: string
          updated_at?: string | null
          validation_rules?: Json | null
          variables_config?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "workflow_node_types_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "workflow_node_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      workflow_nodes: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          node_data: Json
          node_id: string
          node_type: string
          order_index: number | null
          position_x: number
          position_y: number
          updated_at: string
          workflow_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          node_data?: Json
          node_id: string
          node_type: string
          order_index?: number | null
          position_x: number
          position_y: number
          updated_at?: string
          workflow_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          node_data?: Json
          node_id?: string
          node_type?: string
          order_index?: number | null
          position_x?: number
          position_y?: number
          updated_at?: string
          workflow_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workflow_nodes_workflow_id_fkey"
            columns: ["workflow_id"]
            isOneToOne: false
            referencedRelation: "agent_workflows"
            referencedColumns: ["id"]
          },
        ]
      }
      workflow_operators: {
        Row: {
          category: string
          created_at: string
          created_by: string | null
          description: string | null
          examples: string[] | null
          id: string
          is_binary: boolean | null
          name: string
          precedence: number | null
          return_type: string | null
          symbol: string
          syntax: string
          updated_at: string
          usage_count: number | null
        }
        Insert: {
          category: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          examples?: string[] | null
          id?: string
          is_binary?: boolean | null
          name: string
          precedence?: number | null
          return_type?: string | null
          symbol: string
          syntax: string
          updated_at?: string
          usage_count?: number | null
        }
        Update: {
          category?: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          examples?: string[] | null
          id?: string
          is_binary?: boolean | null
          name?: string
          precedence?: number | null
          return_type?: string | null
          symbol?: string
          syntax?: string
          updated_at?: string
          usage_count?: number | null
        }
        Relationships: []
      }
      workflow_performance_metrics: {
        Row: {
          created_at: string | null
          id: string
          measured_at: string | null
          measurement_window: string | null
          metadata: Json | null
          metric_type: string
          metric_unit: string
          metric_value: number
          session_id: string | null
          workflow_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          measured_at?: string | null
          measurement_window?: string | null
          metadata?: Json | null
          metric_type: string
          metric_unit: string
          metric_value: number
          session_id?: string | null
          workflow_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          measured_at?: string | null
          measurement_window?: string | null
          metadata?: Json | null
          metric_type?: string
          metric_unit?: string
          metric_value?: number
          session_id?: string | null
          workflow_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "workflow_performance_metrics_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "agent_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      workflow_templates: {
        Row: {
          category: string | null
          created_at: string | null
          created_by: string | null
          description: string | null
          id: string
          is_public: boolean | null
          is_system_template: boolean | null
          name: string
          tags: string[] | null
          template_data: Json
          updated_at: string | null
          version: number | null
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          is_public?: boolean | null
          is_system_template?: boolean | null
          name: string
          tags?: string[] | null
          template_data?: Json
          updated_at?: string | null
          version?: number | null
        }
        Update: {
          category?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          is_public?: boolean | null
          is_system_template?: boolean | null
          name?: string
          tags?: string[] | null
          template_data?: Json
          updated_at?: string | null
          version?: number | null
        }
        Relationships: []
      }
    }
    Views: {
      consolidated_node_catalog: {
        Row: {
          ai_model_config: Json | null
          apis_config: Json | null
          business_rules: Json | null
          capabilities: Json | null
          category_color: string | null
          category_description: string | null
          category_display_name: string | null
          category_icon: string | null
          category_name: string | null
          category_order: number | null
          configuration_schema: Json | null
          connectors_config: Json | null
          data_storage_config: Json | null
          default_config: Json | null
          detailed_explanation: string | null
          input_schema: Json | null
          is_active: boolean | null
          node_color: string | null
          node_description: string | null
          node_display_name: string | null
          node_icon: string | null
          node_id: string | null
          node_order: number | null
          output_schema: Json | null
          requirements: Json | null
          type_key: string | null
          validation_rules: Json | null
          variables_config: Json | null
        }
        Relationships: []
      }
      index_usage_stats: {
        Row: {
          idx_scan: number | null
          idx_tup_fetch: number | null
          idx_tup_read: number | null
          index_name: unknown | null
          index_size_bytes: number | null
          index_size_pretty: string | null
          schema_name: unknown | null
          table_name: unknown | null
        }
        Relationships: []
      }
      unused_index_candidates: {
        Row: {
          idx_scan: number | null
          idx_tup_fetch: number | null
          idx_tup_read: number | null
          index_name: unknown | null
          index_size_bytes: number | null
          index_size_pretty: string | null
          schema_name: unknown | null
          table_name: unknown | null
        }
        Relationships: []
      }
    }
    Functions: {
      _table_exists: {
        Args: { p_table: string }
        Returns: boolean
      }
      assign_user_role: {
        Args: { p_role_name: string; p_user_id: string }
        Returns: undefined
      }
      auto_cleanup_sessions: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      auto_sync_demo_user_access: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      bulk_deactivate_patient_enrollments: {
        Args:
          | { p_deactivation_reason?: string; p_facility_id: string }
          | { p_enrollment_ids: string[]; p_reason?: string }
        Returns: Json
      }
      calculate_enrollment_progress: {
        Args: { enrollment_uuid: string }
        Returns: number
      }
      calculate_financial_risk_score: {
        Args:
          | {
              p_annual_revenue_range: string
              p_current_ratio: number
              p_days_sales_outstanding: number
              p_debt_to_equity_ratio: number
              p_years_in_operation: number
            }
          | { p_enrollment_id: string }
        Returns: number
      }
      check_duplicate_agent_name: {
        Args: { p_exclude_id?: string; p_name: string; p_user_id: string }
        Returns: boolean
      }
      check_user_has_role: {
        Args:
          | {
              check_user_id: string
              role_name: Database["public"]["Enums"]["user_role"]
            }
          | { p_role_name: string; p_user_id: string }
        Returns: boolean
      }
      cleanup_agent_sessions: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      cleanup_duplicate_test_cases: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      cleanup_old_draft_agents: {
        Args: { p_confirm?: boolean; p_user_id?: string }
        Returns: Json
      }
      cleanup_old_performance_data: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      cleanup_orphaned_role_assignments: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      cleanup_universal_save_sessions: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      cleanup_user_agent_work: {
        Args: { p_statuses?: string[]; p_user_id?: string }
        Returns: Json
      }
      continuous_test_generation: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      create_patient_profile_and_role: {
        Args: {
          p_email: string
          p_facility_id?: string
          p_first_name: string
          p_last_name: string
          p_user_id: string
        }
        Returns: Json
      }
      deactivate_patient_enrollment: {
        Args: { p_enrollment_id: string; p_reason?: string }
        Returns: Json
      }
      detect_schema_from_data: {
        Args: { max_samples?: number; sample_data: Json }
        Returns: Json
      }
      detect_system_functionality: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      determine_risk_level: {
        Args: { p_risk_score: number }
        Returns: Database["public"]["Enums"]["risk_level"]
      }
      ensure_demo_block_triggers: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      execute_comprehensive_test_suite: {
        Args: { batch_size?: number; suite_type?: string }
        Returns: Json
      }
      generate_api_key: {
        Args: { key_type: string }
        Returns: string
      }
      generate_comprehensive_documentation: {
        Args: {
          functionality_id?: string
          include_architecture?: boolean
          include_requirements?: boolean
          include_test_cases?: boolean
        }
        Returns: Json
      }
      generate_comprehensive_test_cases: {
        Args: { functionality_id?: string }
        Returns: number
      }
      generate_comprehensive_test_cases_enhanced: {
        Args: { functionality_id?: string }
        Returns: Json
      }
      generate_role_based_test_cases: {
        Args:
          | { target_role?: Database["public"]["Enums"]["user_role"] }
          | { target_role?: string }
        Returns: Json
      }
      get_complete_schema_info: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      get_daily_fix_stats: {
        Args: { days_back?: number; target_user_id?: string }
        Returns: {
          category: string
          fix_count: number
          fix_date: string
          severity_breakdown: Json
        }[]
      }
      get_database_bloat_info: {
        Args: Record<PropertyKey, never>
        Returns: {
          bloat_ratio: number
          dead_rows: number
          live_rows: number
          recommendation: string
          table_name: string
          total_size: string
        }[]
      }
      get_import_statistics: {
        Args: { p_user_id?: string }
        Returns: Json
      }
      get_old_draft_agents: {
        Args: { p_user_id?: string }
        Returns: {
          created_at: string
          days_old: number
          id: string
          name: string
          table_source: string
          updated_at: string
        }[]
      }
      get_prepopulate_data: {
        Args: { user_uuid: string }
        Returns: Json
      }
      get_system_integration_status: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      get_user_accessible_facilities: {
        Args: { user_id: string }
        Returns: {
          access_level: string
          facility_id: string
          facility_name: string
        }[]
      }
      get_user_effective_modules: {
        Args: { check_user_id: string }
        Returns: {
          access_source: string
          expires_at: string
          module_description: string
          module_id: string
          module_name: string
        }[]
      }
      get_user_effective_permissions: {
        Args: { check_user_id: string; facility_id?: string }
        Returns: {
          expires_at: string
          permission_name: string
          source: string
        }[]
      }
      get_user_roles: {
        Args: { check_user_id: string }
        Returns: {
          role_name: string
        }[]
      }
      has_permission: {
        Args: { permission_name: string; user_id: string }
        Returns: boolean
      }
      has_role: {
        Args: {
          role_name: Database["public"]["Enums"]["user_role"]
          user_id: string
        }
        Returns: boolean
      }
      has_role_optimized: {
        Args: {
          _role_name: Database["public"]["Enums"]["user_role"]
          _user_id: string
        }
        Returns: boolean
      }
      initialize_conversation_journey: {
        Args: { p_agent_id: string; p_conversation_id: string }
        Returns: Json
      }
      initialize_onboarding_workflow: {
        Args: { p_onboarding_id: string }
        Returns: undefined
      }
      initialize_user_settings: {
        Args: { user_id: string }
        Returns: undefined
      }
      is_admin_user: {
        Args: { check_user_id: string }
        Returns: boolean
      }
      is_admin_user_safe: {
        Args: { check_user_id: string }
        Returns: boolean
      }
      is_demo_user: {
        Args: { check_user_id?: string }
        Returns: boolean
      }
      is_demo_user_or_admin: {
        Args: { check_user_id?: string }
        Returns: boolean
      }
      log_credit_application_audit: {
        Args: {
          p_action_type: string
          p_additional_context?: Json
          p_credit_application_id: string
          p_field_changed?: string
          p_new_value?: string
          p_old_value?: string
        }
        Returns: undefined
      }
      log_onboarding_audit: {
        Args: {
          p_action_description: string
          p_action_type: string
          p_new_values?: Json
          p_old_values?: Json
          p_onboarding_id: string
          p_section_affected?: string
        }
        Returns: undefined
      }
      log_prompt_governance: {
        Args: {
          p_analysis_results: Json
          p_blocking_reasons?: Json
          p_compliance_score?: number
          p_enhanced_prompt?: string
          p_enhancements_applied?: Json
          p_original_prompt?: string
          p_prompt_text: string
          p_violations_found?: Json
          p_was_blocked?: boolean
        }
        Returns: string
      }
      log_security_event: {
        Args: {
          p_description: string
          p_event_type: string
          p_metadata?: Json
          p_severity: string
          p_user_id: string
        }
        Returns: undefined
      }
      log_sensitive_data_access: {
        Args: { operation_type: string; record_id?: string; table_name: string }
        Returns: undefined
      }
      log_stability_event: {
        Args: {
          p_event_data?: Json
          p_event_type: string
          p_file_path?: string
          p_monitoring_session_id: string
          p_rule_name?: string
          p_severity?: string
          p_violation_details?: Json
        }
        Returns: string
      }
      log_user_activity: {
        Args: {
          p_activity_description: string
          p_activity_type: string
          p_metadata?: Json
          p_module_name?: string
          p_user_id: string
        }
        Returns: undefined
      }
      log_verification_activity: {
        Args: {
          activity_description: string
          activity_type: string
          metadata_info?: Json
        }
        Returns: undefined
      }
      optimize_database_performance: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      optimize_slow_queries: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      progress_journey_stage: {
        Args: {
          p_conversation_id: string
          p_next_stage_id?: string
          p_reason?: string
          p_transition_data?: Json
        }
        Returns: Json
      }
      run_automated_cleanup: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      run_comprehensive_system_update: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      schedule_maintenance: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      secure_assign_user_role: {
        Args: { target_role_name: string; target_user_id: string }
        Returns: Json
      }
      secure_remove_user_role: {
        Args: { target_role_name: string; target_user_id: string }
        Returns: Json
      }
      send_auth_email: {
        Args: {
          p_from_email?: string
          p_template_name: string
          p_to_email: string
          p_variables?: Json
        }
        Returns: Json
      }
      send_email_via_resend: {
        Args: {
          p_from_email?: string
          p_html_content?: string
          p_subject?: string
          p_template_id?: string
          p_text_content?: string
          p_to_email: string
          p_variables?: Json
        }
        Returns: Json
      }
      sync_active_issues: {
        Args: { issues_data: Json }
        Returns: undefined
      }
      sync_real_time_testing_updates: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      sync_role_based_testing: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      test_rls_policies: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      update_api_key_usage: {
        Args: { key_hash: string }
        Returns: undefined
      }
      update_api_services_documentation: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      update_site_stat: {
        Args: { increment_value?: number; stat_name_param: string }
        Returns: undefined
      }
      update_testing_suite_comprehensive: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      user_can_access_node_config: {
        Args: { config_id: string }
        Returns: boolean
      }
      user_has_any_role: {
        Args: { check_user_id: string; role_names: string[] }
        Returns: boolean
      }
      user_has_permission: {
        Args: {
          check_user_id: string
          facility_id?: string
          permission_name: string
        }
        Returns: boolean
      }
      user_has_role: {
        Args: {
          check_user_id: string
          role_name: Database["public"]["Enums"]["user_role"]
        }
        Returns: boolean
      }
      validate_data_against_schema: {
        Args: { data_row: Json; schema_def: Json }
        Returns: Json
      }
      verify_jsonb_migration_integrity: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
    }
    Enums: {
      business_type:
        | "acute_care"
        | "primary_care"
        | "specialty"
        | "home_health"
        | "extended_long_term"
        | "pharmacy"
        | "closed_door"
        | "internet"
        | "mail_order"
        | "supplier"
        | "government"
        | "other"
      compliance_program:
        | "joint_commission"
        | "cap_accreditation"
        | "iso_certification"
        | "fda_inspection_ready"
        | "state_board_compliance"
      distributor_type: "amerisource_bergen" | "cardinal_health" | "mckesson"
      enrollment_type_enum:
        | "not_selected"
        | "mcp"
        | "conversational"
        | "ai_structure"
        | "online"
      facility_type:
        | "treatmentFacility"
        | "referralFacility"
        | "prescriberFacility"
        | "hospital"
        | "other"
        | "clinic"
        | "pharmacy"
        | "laboratory"
      inventory_model:
        | "traditional_wholesale"
        | "consignment"
        | "vendor_managed"
        | "drop_ship_only"
        | "hybrid"
      modality_type:
        | "autologous"
        | "allogeneic"
        | "viral_vector"
        | "non_viral"
        | "protein_based"
        | "antibody_drug_conjugate"
        | "radioligand"
        | "combination"
      onboarding_status:
        | "draft"
        | "submitted"
        | "under_review"
        | "approved"
        | "rejected"
      onboarding_step:
        | "company_info"
        | "business_classification"
        | "contacts"
        | "ownership"
        | "references"
        | "payment_banking"
        | "licenses"
        | "documents"
        | "authorizations"
        | "review"
        | "complete"
      ownership_type:
        | "proprietorship"
        | "partnership"
        | "limited_partnership"
        | "llc"
        | "s_corp"
        | "c_corp"
        | "professional_corp"
        | "non_profit_corp"
      product_status:
        | "preclinical"
        | "phase_1"
        | "phase_2"
        | "phase_3"
        | "approved"
        | "discontinued"
      purchasing_method:
        | "just_in_time"
        | "bulk_ordering"
        | "consignment"
        | "drop_ship"
        | "blanket_orders"
      risk_level: "low" | "medium" | "high" | "very_high"
      service_provider_type: "internal" | "external_partner" | "third_party"
      service_type:
        | "3pl"
        | "specialty_distribution"
        | "specialty_pharmacy"
        | "order_management"
        | "patient_hub_services"
      sla_tier: "standard" | "priority" | "critical" | "emergency_only"
      technology_integration:
        | "edi_integration"
        | "api_integration"
        | "manual_processes"
        | "hybrid_approach"
      therapy_type:
        | "car_t_cell"
        | "gene_therapy"
        | "advanced_biologics"
        | "personalized_medicine"
        | "radioligand_therapy"
        | "cell_therapy"
        | "immunotherapy"
        | "other_cgat"
      trial_status:
        | "not_yet_recruiting"
        | "recruiting"
        | "active_not_recruiting"
        | "completed"
        | "suspended"
        | "terminated"
        | "withdrawn"
      user_role:
        | "superAdmin"
        | "healthcareProvider"
        | "nurse"
        | "caseManager"
        | "onboardingTeam"
        | "patientCaregiver"
        | "financeTeam"
        | "contractTeam"
        | "workflowManager"
        | "demoUser"
      voice_connector_type:
        | "SIP"
        | "API"
        | "Webhook"
        | "Database"
        | "CRM"
        | "Cloud"
      voice_event_type:
        | "call_started"
        | "call_ended"
        | "transfer"
        | "queue_join"
        | "queue_leave"
        | "agent_login"
        | "agent_logout"
      voice_health_status: "healthy" | "warning" | "error" | "unknown"
      voice_transfer_status: "waiting" | "assigned" | "completed" | "cancelled"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      business_type: [
        "acute_care",
        "primary_care",
        "specialty",
        "home_health",
        "extended_long_term",
        "pharmacy",
        "closed_door",
        "internet",
        "mail_order",
        "supplier",
        "government",
        "other",
      ],
      compliance_program: [
        "joint_commission",
        "cap_accreditation",
        "iso_certification",
        "fda_inspection_ready",
        "state_board_compliance",
      ],
      distributor_type: ["amerisource_bergen", "cardinal_health", "mckesson"],
      enrollment_type_enum: [
        "not_selected",
        "mcp",
        "conversational",
        "ai_structure",
        "online",
      ],
      facility_type: [
        "treatmentFacility",
        "referralFacility",
        "prescriberFacility",
        "hospital",
        "other",
        "clinic",
        "pharmacy",
        "laboratory",
      ],
      inventory_model: [
        "traditional_wholesale",
        "consignment",
        "vendor_managed",
        "drop_ship_only",
        "hybrid",
      ],
      modality_type: [
        "autologous",
        "allogeneic",
        "viral_vector",
        "non_viral",
        "protein_based",
        "antibody_drug_conjugate",
        "radioligand",
        "combination",
      ],
      onboarding_status: [
        "draft",
        "submitted",
        "under_review",
        "approved",
        "rejected",
      ],
      onboarding_step: [
        "company_info",
        "business_classification",
        "contacts",
        "ownership",
        "references",
        "payment_banking",
        "licenses",
        "documents",
        "authorizations",
        "review",
        "complete",
      ],
      ownership_type: [
        "proprietorship",
        "partnership",
        "limited_partnership",
        "llc",
        "s_corp",
        "c_corp",
        "professional_corp",
        "non_profit_corp",
      ],
      product_status: [
        "preclinical",
        "phase_1",
        "phase_2",
        "phase_3",
        "approved",
        "discontinued",
      ],
      purchasing_method: [
        "just_in_time",
        "bulk_ordering",
        "consignment",
        "drop_ship",
        "blanket_orders",
      ],
      risk_level: ["low", "medium", "high", "very_high"],
      service_provider_type: ["internal", "external_partner", "third_party"],
      service_type: [
        "3pl",
        "specialty_distribution",
        "specialty_pharmacy",
        "order_management",
        "patient_hub_services",
      ],
      sla_tier: ["standard", "priority", "critical", "emergency_only"],
      technology_integration: [
        "edi_integration",
        "api_integration",
        "manual_processes",
        "hybrid_approach",
      ],
      therapy_type: [
        "car_t_cell",
        "gene_therapy",
        "advanced_biologics",
        "personalized_medicine",
        "radioligand_therapy",
        "cell_therapy",
        "immunotherapy",
        "other_cgat",
      ],
      trial_status: [
        "not_yet_recruiting",
        "recruiting",
        "active_not_recruiting",
        "completed",
        "suspended",
        "terminated",
        "withdrawn",
      ],
      user_role: [
        "superAdmin",
        "healthcareProvider",
        "nurse",
        "caseManager",
        "onboardingTeam",
        "patientCaregiver",
        "financeTeam",
        "contractTeam",
        "workflowManager",
        "demoUser",
      ],
      voice_connector_type: [
        "SIP",
        "API",
        "Webhook",
        "Database",
        "CRM",
        "Cloud",
      ],
      voice_event_type: [
        "call_started",
        "call_ended",
        "transfer",
        "queue_join",
        "queue_leave",
        "agent_login",
        "agent_logout",
      ],
      voice_health_status: ["healthy", "warning", "error", "unknown"],
      voice_transfer_status: ["waiting", "assigned", "completed", "cancelled"],
    },
  },
} as const
