// Minimal generated Database types to satisfy strict type-checks
export type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

// Generic table definition placeholder
type TableDef<Row = any, Insert = any, Update = any> = {
  Row: Row;
  Insert: Insert;
  Update: Update;
  Relationships: any[];
};

export type Database = {
  public: {
    Tables: {
      facilities: TableDef;
      modules: TableDef;
      profiles: TableDef;
      roles: TableDef;
      user_roles: TableDef;
      user_permissions: TableDef;
      permissions: TableDef;
      role_permissions: TableDef;
      role_module_assignments: TableDef;
      user_module_assignments: TableDef;
      audit_logs: TableDef;
      voice_transfer_queue: TableDef;
      voice_analytics_events: TableDef;
      voice_connectors: TableDef;
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
        | 'demoUser'
        | (string & {});
      [enumName: string]: unknown;
    };
    CompositeTypes: {
      [composite: string]: unknown;
    };
  };
};
