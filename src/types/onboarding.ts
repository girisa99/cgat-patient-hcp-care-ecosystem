export interface TreatmentCenterOnboarding {
  // Basic Information
  id: string;
  status: 'draft' | 'submitted' | 'under_review' | 'approved' | 'rejected';
  created_at: string;
  updated_at: string;
  submitted_at?: string;
  
  // Distributor Selection
  selected_distributors: ('amerisource_bergen' | 'cardinal_health' | 'mckesson')[];
  
  // Company Information
  company_info: {
    legal_name: string;
    dba_name?: string;
    website?: string;
    federal_tax_id: string;
    legal_address: Address;
    billing_address?: Address;
    shipping_address?: Address;
    same_as_legal_address: boolean;
  };
  
  // Business Classification
  business_info: {
    business_type: BusinessType[];
    years_in_business: number;
    ownership_type: OwnershipType;
    state_org_charter_id?: string;
    number_of_employees?: number;
    estimated_monthly_purchases?: number;
    initial_order_amount?: number;
  };
  
  // Contacts
  contacts: {
    primary_contact: ContactInfo;
    accounts_payable_contact?: ContactInfo;
    shipping_contact?: ContactInfo;
    alternate_contact?: ContactInfo;
  };
  
  // Ownership & Control
  ownership: {
    principal_owners: OwnerInfo[];
    controlling_entity?: ControllingEntity;
    bankruptcy_history: boolean;
    bankruptcy_explanation?: string;
  };
  
  // References
  references: {
    primary_bank: ReferenceInfo;
    primary_supplier: ReferenceInfo;
    technology_provider?: ReferenceInfo;
    additional_references: ReferenceInfo[];
  };
  
  // Payment & Banking
  payment_info: {
    ach_preference: 'direct_debit' | 'online_payment';
    bank_name: string;
    bank_address: Address;
    bank_account_number: string;
    bank_routing_number: string;
    bank_phone?: string;
    statement_delivery_preference: 'email' | 'fax' | 'mail';
    payment_terms_requested?: string;
  };

  // NEW: Purchasing Preferences
  purchasing_preferences?: {
    preferred_purchasing_methods: PurchasingMethod[];
    inventory_management_model: InventoryModel;
    automated_reordering_enabled: boolean;
    reorder_points: any;
    preferred_order_frequency?: string;
    inventory_turnover_targets: any;
    storage_capacity_details: any;
    temperature_controlled_storage: boolean;
    hazmat_storage_capabilities: boolean;
  };

  // NEW: Financial Assessment
  financial_assessment?: {
    annual_revenue_range?: string;
    credit_score_range?: string;
    years_in_operation?: number;
    debt_to_equity_ratio?: number;
    current_ratio?: number;
    days_sales_outstanding?: number;
    payment_history_rating?: string;
    insurance_coverage: any;
    financial_guarantees: any;
    risk_assessment_score?: number;
    risk_level?: 'low' | 'medium' | 'high' | 'very_high';
    credit_limit_recommendation?: number;
    payment_terms_recommendation?: string;
  };

  // NEW: Compliance Requirements
  compliance_requirements?: {
    required_compliance_programs: ComplianceProgram[];
    quality_assurance_protocols: any;
    documentation_requirements: any;
    staff_training_requirements: any;
    audit_frequency_preferences?: string;
    regulatory_reporting_needs: any;
    patient_safety_protocols: any;
    adverse_event_reporting_system: boolean;
  };

  // NEW: Technology Integration
  technology_integration?: {
    current_ehr_system?: string;
    current_inventory_system?: string;
    preferred_integration_method: TechnologyIntegration;
    api_capabilities: any;
    edi_transaction_sets: string[];
    real_time_inventory_tracking: boolean;
    automated_billing_integration: boolean;
    reporting_dashboard_requirements: any;
    mobile_access_requirements: any;
    security_requirements: any;
  };

  // NEW: SLA Requirements
  sla_requirements?: {
    delivery_time_requirements: any;
    emergency_delivery_needs: boolean;
    service_tier: SLATier;
    uptime_requirements: number;
    response_time_requirements: any;
    escalation_procedures: any;
    performance_metrics: any;
    penalty_structures: any;
  };

  // NEW: Contract Terms
  contract_terms?: {
    contract_duration_months: number;
    auto_renewal_clause: boolean;
    pricing_structure: any;
    volume_discounts: any;
    rebate_programs: any;
    exclusivity_agreements: any;
    termination_clauses: any;
    force_majeure_provisions: any;
    liability_limitations: any;
    intellectual_property_terms: any;
    data_protection_clauses: any;
  };
  
  // Licenses & Certifications
  licenses: {
    dea_number?: string;
    hin_number?: string;
    medical_license?: string;
    state_pharmacy_license?: string;
    resale_tax_exemption?: string;
    additional_licenses: LicenseInfo[];
  };
  
  // Required Documents
  documents: {
    voided_check: boolean;
    resale_tax_exemption_cert: boolean;
    dea_registration_copy: boolean;
    state_pharmacy_license_copy: boolean;
    medical_license_copy: boolean;
    financial_statements: boolean;
    supplier_statements: boolean;
    additional_documents: DocumentInfo[];
  };
  
  // Authorizations & Signatures
  authorizations: {
    authorized_signature: AuthorizedSignature;
    guarantor_signature?: GuarantorSignature;
    terms_accepted: boolean;
    date_signed?: string;
  };
  
  // Workflow Tracking
  workflow: {
    current_step: OnboardingStep;
    completed_steps: OnboardingStep[];
    assigned_to?: string;
    notes: WorkflowNote[];
  };
  
  // Enhanced fields for comprehensive onboarding
  operational_hours?: {
    monday?: { open: string; close: string; };
    tuesday?: { open: string; close: string; };
    wednesday?: { open: string; close: string; };
    thursday?: { open: string; close: string; };
    friday?: { open: string; close: string; };
    saturday?: { open: string; close: string; };
    sunday?: { open: string; close: string; };
  };
  
  payment_terms_preference?: string;
  preferred_payment_methods?: string[];
  is_340b_entity?: boolean;
  gpo_memberships?: string[];
  
  // New complex data structures
  platform_users?: PlatformUser[];
  program_340b?: Program340B[];
  gpo_memberships_detailed?: GPOMembership[];
  enhanced_payment_terms?: EnhancedPaymentTerms;
}

export interface Address {
  street: string;
  city: string;
  state: string;
  zip: string;
  country?: string;
}

export interface ContactInfo {
  name: string;
  title?: string;
  phone: string;
  fax?: string;
  email: string;
}

export interface OwnerInfo {
  name: string;
  ownership_percentage: number;
  ssn?: string;
}

export interface ControllingEntity {
  name: string;
  relationship: string;
  phone: string;
  address: Address;
}

export interface ReferenceInfo {
  name: string;
  account_number?: string;
  contact_name: string;
  phone: string;
}

export interface LicenseInfo {
  type: string;
  number: string;
  state: string;
  expiration_date?: string;
}

export interface DocumentInfo {
  name: string;
  type: string;
  uploaded: boolean;
  file_path?: string;
}

export interface AuthorizedSignature {
  name: string;
  title: string;
  date: string;
  ssn?: string;
}

export interface GuarantorSignature {
  name: string;
  home_address: Address;
  city: string;
  state: string;
  zip: string;
  ssn?: string;
  date: string;
}

export interface WorkflowNote {
  id: string;
  author: string;
  content: string;
  created_at: string;
  type: 'note' | 'status_change' | 'document_upload';
}

export interface PlatformUser {
  user_type: 'primary_admin' | 'secondary_admin' | 'ordering_user' | 'receiving_user' | 'accounting_user';
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  department?: string;
  access_level: 'full' | 'limited' | 'view_only';
  can_place_orders: boolean;
  can_manage_users: boolean;
  can_view_reports: boolean;
  notification_preferences?: {
    email_orders?: boolean;
    email_shipments?: boolean;
    email_invoices?: boolean;
    sms_urgent?: boolean;
  };
}

export interface Program340B {
  program_type: 'hospital' | 'fqhc' | 'ryan_white' | 'other';
  registration_number: string;
  parent_entity_name?: string;
  contract_pharmacy_locations?: string[];
  eligible_drug_categories?: string[];
  compliance_contact_name?: string;
  compliance_contact_email?: string;
  compliance_contact_phone?: string;
  audit_requirements?: any;
}

export interface GPOMembership {
  gpo_name: string;
  membership_number?: string;
  contract_effective_date?: string;
  contract_expiration_date?: string;
  primary_contact_name?: string;
  primary_contact_email?: string;
  primary_contact_phone?: string;
  covered_categories?: string[];
  tier_level?: string;
  rebate_information?: any;
}

export interface EnhancedPaymentTerms {
  preferred_terms: 'net_30' | 'net_60' | 'net_90' | '2_10_net_30' | 'cod' | 'prepay';
  credit_limit_requested?: number;
  payment_method: 'ach' | 'wire' | 'check' | 'credit_card';
  early_payment_discount_interest: boolean;
  consolidation_preferences?: {
    enable_consolidation: boolean;
    consolidation_level?: 'facility' | 'department' | 'organization';
    separate_controlled_substances: boolean;
    separate_specialty_orders: boolean;
  };
  billing_frequency?: 'daily' | 'weekly' | 'monthly';
}

// NEW: Type definitions for new enums
export type PurchasingMethod = 
  | 'just_in_time'
  | 'bulk_ordering'
  | 'consignment'
  | 'drop_ship'
  | 'blanket_orders';

export type InventoryModel = 
  | 'traditional_wholesale'
  | 'consignment'
  | 'vendor_managed'
  | 'drop_ship_only'
  | 'hybrid';

export type ComplianceProgram = 
  | 'joint_commission'
  | 'cap_accreditation'
  | 'iso_certification'
  | 'fda_inspection_ready'
  | 'state_board_compliance';

export type TechnologyIntegration = 
  | 'edi_integration'
  | 'api_integration'
  | 'manual_processes'
  | 'hybrid_approach';

export type SLATier = 
  | 'standard'
  | 'priority'
  | 'critical'
  | 'emergency_only';

export type BusinessType = 
  | 'acute_care'
  | 'primary_care'
  | 'specialty'
  | 'home_health'
  | 'extended_long_term'
  | 'pharmacy'
  | 'closed_door'
  | 'internet'
  | 'mail_order'
  | 'supplier'
  | 'government'
  | 'other';

export type OwnershipType = 
  | 'proprietorship'
  | 'partnership'
  | 'limited_partnership'
  | 'llc'
  | 's_corp'
  | 'c_corp'
  | 'professional_corp'
  | 'non_profit_corp';

export type OnboardingStep = 
  | 'company_info'
  | 'business_classification'
  | 'contacts'
  | 'ownership'
  | 'references'
  | 'payment_banking'
  | 'purchasing_preferences'
  | 'financial_assessment'
  | 'licenses'
  | 'documents'
  | 'authorizations'
  | 'review'
  | 'complete';
