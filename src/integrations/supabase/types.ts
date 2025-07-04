export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
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
      api_integration_registry: {
        Row: {
          base_url: string | null
          category: string
          contact_info: Json | null
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
          rate_limits: Json | null
          rls_policies_count: number | null
          security_requirements: Json | null
          sla_requirements: Json | null
          status: string
          type: string
          updated_at: string
          version: string
          webhook_config: Json | null
        }
        Insert: {
          base_url?: string | null
          category: string
          contact_info?: Json | null
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
          rate_limits?: Json | null
          rls_policies_count?: number | null
          security_requirements?: Json | null
          sla_requirements?: Json | null
          status?: string
          type: string
          updated_at?: string
          version?: string
          webhook_config?: Json | null
        }
        Update: {
          base_url?: string | null
          category?: string
          contact_info?: Json | null
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
          rate_limits?: Json | null
          rls_policies_count?: number | null
          security_requirements?: Json | null
          sla_requirements?: Json | null
          status?: string
          type?: string
          updated_at?: string
          version?: string
          webhook_config?: Json | null
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
          address: string | null
          created_at: string | null
          email: string | null
          facility_type: Database["public"]["Enums"]["facility_type"]
          id: string
          is_active: boolean | null
          license_number: string | null
          name: string
          npi_number: string | null
          phone: string | null
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          created_at?: string | null
          email?: string | null
          facility_type: Database["public"]["Enums"]["facility_type"]
          id?: string
          is_active?: boolean | null
          license_number?: string | null
          name: string
          npi_number?: string | null
          phone?: string | null
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          created_at?: string | null
          email?: string | null
          facility_type?: Database["public"]["Enums"]["facility_type"]
          id?: string
          is_active?: boolean | null
          license_number?: string | null
          name?: string
          npi_number?: string | null
          phone?: string | null
          updated_at?: string | null
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
          clinical_trial_id: string | null
          commercial_product_id: string | null
          created_at: string | null
          id: string
          infrastructure_requirements: Json | null
          onboarding_id: string | null
          patient_volume_estimate: number | null
          preferred_start_date: string | null
          priority_level: string | null
          product_id: string | null
          selected_provider_id: string | null
          selection_rationale: string | null
          service_id: string | null
          special_requirements: Json | null
          staff_training_needs: Json | null
          therapy_id: string | null
          timeline_considerations: Json | null
          treatment_readiness_level: string | null
          updated_at: string | null
        }
        Insert: {
          clinical_trial_id?: string | null
          commercial_product_id?: string | null
          created_at?: string | null
          id?: string
          infrastructure_requirements?: Json | null
          onboarding_id?: string | null
          patient_volume_estimate?: number | null
          preferred_start_date?: string | null
          priority_level?: string | null
          product_id?: string | null
          selected_provider_id?: string | null
          selection_rationale?: string | null
          service_id?: string | null
          special_requirements?: Json | null
          staff_training_needs?: Json | null
          therapy_id?: string | null
          timeline_considerations?: Json | null
          treatment_readiness_level?: string | null
          updated_at?: string | null
        }
        Update: {
          clinical_trial_id?: string | null
          commercial_product_id?: string | null
          created_at?: string | null
          id?: string
          infrastructure_requirements?: Json | null
          onboarding_id?: string | null
          patient_volume_estimate?: number | null
          preferred_start_date?: string | null
          priority_level?: string | null
          product_id?: string | null
          selected_provider_id?: string | null
          selection_rationale?: string | null
          service_id?: string | null
          special_requirements?: Json | null
          staff_training_needs?: Json | null
          therapy_id?: string | null
          timeline_considerations?: Json | null
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
            foreignKeyName: "onboarding_therapy_selections_onboarding_id_fkey"
            columns: ["onboarding_id"]
            isOneToOne: false
            referencedRelation: "treatment_center_onboarding"
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
          avatar_url: string | null
          created_at: string | null
          department: string | null
          email: string | null
          facility_id: string | null
          first_name: string | null
          has_mfa_enabled: boolean | null
          id: string
          is_email_verified: boolean | null
          last_login: string | null
          last_name: string | null
          phone: string | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          department?: string | null
          email?: string | null
          facility_id?: string | null
          first_name?: string | null
          has_mfa_enabled?: boolean | null
          id: string
          is_email_verified?: boolean | null
          last_login?: string | null
          last_name?: string | null
          phone?: string | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          department?: string | null
          email?: string | null
          facility_id?: string | null
          first_name?: string | null
          has_mfa_enabled?: boolean | null
          id?: string
          is_email_verified?: boolean | null
          last_login?: string | null
          last_name?: string | null
          phone?: string | null
          updated_at?: string | null
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
      treatment_center_onboarding: {
        Row: {
          ach_preference: string | null
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
          date_signed: string | null
          dba_name: string | null
          dea_number: string | null
          dea_registration_copy_uploaded: boolean | null
          estimated_monthly_purchases: number | null
          federal_tax_id: string | null
          financial_statements_uploaded: boolean | null
          gpo_memberships: string[] | null
          guarantor_date: string | null
          guarantor_name: string | null
          guarantor_ssn: string | null
          hin_number: string | null
          id: string
          initial_order_amount: number | null
          is_340b_entity: boolean | null
          legal_name: string | null
          medical_license: string | null
          medical_license_copy_uploaded: boolean | null
          number_of_employees: number | null
          operational_hours: Json | null
          ownership_type: Database["public"]["Enums"]["ownership_type"] | null
          payment_terms_preference: string | null
          payment_terms_requested: string | null
          preferred_payment_methods: string[] | null
          resale_tax_exemption: string | null
          resale_tax_exemption_cert_uploaded: boolean | null
          same_as_legal_address: boolean | null
          selected_distributors:
            | Database["public"]["Enums"]["distributor_type"][]
            | null
          state_org_charter_id: string | null
          state_pharmacy_license: string | null
          state_pharmacy_license_copy_uploaded: boolean | null
          statement_delivery_preference: string | null
          status: Database["public"]["Enums"]["onboarding_status"]
          submitted_at: string | null
          supplier_statements_uploaded: boolean | null
          terms_accepted: boolean | null
          updated_at: string
          user_id: string
          voided_check_uploaded: boolean | null
          website: string | null
          years_in_business: number | null
        }
        Insert: {
          ach_preference?: string | null
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
          date_signed?: string | null
          dba_name?: string | null
          dea_number?: string | null
          dea_registration_copy_uploaded?: boolean | null
          estimated_monthly_purchases?: number | null
          federal_tax_id?: string | null
          financial_statements_uploaded?: boolean | null
          gpo_memberships?: string[] | null
          guarantor_date?: string | null
          guarantor_name?: string | null
          guarantor_ssn?: string | null
          hin_number?: string | null
          id?: string
          initial_order_amount?: number | null
          is_340b_entity?: boolean | null
          legal_name?: string | null
          medical_license?: string | null
          medical_license_copy_uploaded?: boolean | null
          number_of_employees?: number | null
          operational_hours?: Json | null
          ownership_type?: Database["public"]["Enums"]["ownership_type"] | null
          payment_terms_preference?: string | null
          payment_terms_requested?: string | null
          preferred_payment_methods?: string[] | null
          resale_tax_exemption?: string | null
          resale_tax_exemption_cert_uploaded?: boolean | null
          same_as_legal_address?: boolean | null
          selected_distributors?:
            | Database["public"]["Enums"]["distributor_type"][]
            | null
          state_org_charter_id?: string | null
          state_pharmacy_license?: string | null
          state_pharmacy_license_copy_uploaded?: boolean | null
          statement_delivery_preference?: string | null
          status?: Database["public"]["Enums"]["onboarding_status"]
          submitted_at?: string | null
          supplier_statements_uploaded?: boolean | null
          terms_accepted?: boolean | null
          updated_at?: string
          user_id: string
          voided_check_uploaded?: boolean | null
          website?: string | null
          years_in_business?: number | null
        }
        Update: {
          ach_preference?: string | null
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
          date_signed?: string | null
          dba_name?: string | null
          dea_number?: string | null
          dea_registration_copy_uploaded?: boolean | null
          estimated_monthly_purchases?: number | null
          federal_tax_id?: string | null
          financial_statements_uploaded?: boolean | null
          gpo_memberships?: string[] | null
          guarantor_date?: string | null
          guarantor_name?: string | null
          guarantor_ssn?: string | null
          hin_number?: string | null
          id?: string
          initial_order_amount?: number | null
          is_340b_entity?: boolean | null
          legal_name?: string | null
          medical_license?: string | null
          medical_license_copy_uploaded?: boolean | null
          number_of_employees?: number | null
          operational_hours?: Json | null
          ownership_type?: Database["public"]["Enums"]["ownership_type"] | null
          payment_terms_preference?: string | null
          payment_terms_requested?: string | null
          preferred_payment_methods?: string[] | null
          resale_tax_exemption?: string | null
          resale_tax_exemption_cert_uploaded?: boolean | null
          same_as_legal_address?: boolean | null
          selected_distributors?:
            | Database["public"]["Enums"]["distributor_type"][]
            | null
          state_org_charter_id?: string | null
          state_pharmacy_license?: string | null
          state_pharmacy_license_copy_uploaded?: boolean | null
          statement_delivery_preference?: string | null
          status?: Database["public"]["Enums"]["onboarding_status"]
          submitted_at?: string | null
          supplier_statements_uploaded?: boolean | null
          terms_accepted?: boolean | null
          updated_at?: string
          user_id?: string
          voided_check_uploaded?: boolean | null
          website?: string | null
          years_in_business?: number | null
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
          role_id: string | null
          user_id: string | null
        }
        Insert: {
          assigned_by?: string | null
          created_at?: string | null
          id?: string
          role_id?: string | null
          user_id?: string | null
        }
        Update: {
          assigned_by?: string | null
          created_at?: string | null
          id?: string
          role_id?: string | null
          user_id?: string | null
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
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      calculate_financial_risk_score: {
        Args: {
          p_annual_revenue_range: string
          p_years_in_operation: number
          p_debt_to_equity_ratio: number
          p_current_ratio: number
          p_days_sales_outstanding: number
        }
        Returns: number
      }
      check_user_has_role: {
        Args: {
          check_user_id: string
          role_name: Database["public"]["Enums"]["user_role"]
        }
        Returns: boolean
      }
      detect_system_functionality: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      determine_risk_level: {
        Args: { p_risk_score: number }
        Returns: Database["public"]["Enums"]["risk_level"]
      }
      execute_comprehensive_test_suite: {
        Args: { suite_type?: string; batch_size?: number }
        Returns: Json
      }
      generate_api_key: {
        Args: { key_type: string }
        Returns: string
      }
      generate_comprehensive_test_cases: {
        Args: { functionality_id?: string }
        Returns: number
      }
      get_daily_fix_stats: {
        Args: { days_back?: number; target_user_id?: string }
        Returns: {
          fix_date: string
          category: string
          fix_count: number
          severity_breakdown: Json
        }[]
      }
      get_user_accessible_facilities: {
        Args: { user_id: string }
        Returns: {
          facility_id: string
          facility_name: string
          access_level: string
        }[]
      }
      get_user_effective_modules: {
        Args: { check_user_id: string }
        Returns: {
          module_id: string
          module_name: string
          module_description: string
          access_source: string
          expires_at: string
        }[]
      }
      get_user_effective_permissions: {
        Args: { check_user_id: string; facility_id?: string }
        Returns: {
          permission_name: string
          source: string
          expires_at: string
        }[]
      }
      get_user_roles: {
        Args: { check_user_id: string }
        Returns: {
          role_name: string
        }[]
      }
      has_permission: {
        Args: { user_id: string; permission_name: string }
        Returns: boolean
      }
      has_role: {
        Args: {
          user_id: string
          role_name: Database["public"]["Enums"]["user_role"]
        }
        Returns: boolean
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
      log_onboarding_audit: {
        Args: {
          p_onboarding_id: string
          p_action_type: string
          p_action_description: string
          p_section_affected?: string
          p_old_values?: Json
          p_new_values?: Json
        }
        Returns: undefined
      }
      log_security_event: {
        Args: {
          p_user_id: string
          p_event_type: string
          p_severity: string
          p_description: string
          p_metadata?: Json
        }
        Returns: undefined
      }
      log_user_activity: {
        Args: {
          p_user_id: string
          p_activity_type: string
          p_activity_description: string
          p_module_name?: string
          p_metadata?: Json
        }
        Returns: undefined
      }
      log_verification_activity: {
        Args: {
          activity_type: string
          activity_description: string
          metadata_info?: Json
        }
        Returns: undefined
      }
      sync_active_issues: {
        Args: { issues_data: Json }
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
      user_has_permission: {
        Args: {
          check_user_id: string
          permission_name: string
          facility_id?: string
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
      facility_type:
        | "treatmentFacility"
        | "referralFacility"
        | "prescriberFacility"
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
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
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
      facility_type: [
        "treatmentFacility",
        "referralFacility",
        "prescriberFacility",
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
      ],
    },
  },
} as const
