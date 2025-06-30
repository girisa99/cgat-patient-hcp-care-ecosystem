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
          name: Database["public"]["Enums"]["user_role"]
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          name: Database["public"]["Enums"]["user_role"]
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
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
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      check_user_has_role: {
        Args: {
          check_user_id: string
          role_name: Database["public"]["Enums"]["user_role"]
        }
        Returns: boolean
      }
      generate_api_key: {
        Args: { key_type: string }
        Returns: string
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
      initialize_user_settings: {
        Args: { user_id: string }
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
      distributor_type: "amerisource_bergen" | "cardinal_health" | "mckesson"
      facility_type:
        | "treatmentFacility"
        | "referralFacility"
        | "prescriberFacility"
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
      user_role:
        | "superAdmin"
        | "healthcareProvider"
        | "nurse"
        | "caseManager"
        | "onboardingTeam"
        | "patientCaregiver"
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
      distributor_type: ["amerisource_bergen", "cardinal_health", "mckesson"],
      facility_type: [
        "treatmentFacility",
        "referralFacility",
        "prescriberFacility",
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
      user_role: [
        "superAdmin",
        "healthcareProvider",
        "nurse",
        "caseManager",
        "onboardingTeam",
        "patientCaregiver",
      ],
    },
  },
} as const
