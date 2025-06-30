// Business Types
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

// Fix OnboardingStep to be a string union type instead of interface
export type OnboardingStep = 
  | 'company_info'
  | 'business_classification' 
  | 'contacts'
  | 'ownership'
  | 'references'
  | 'payment_banking'
  | 'licenses'
  | 'documents'
  | 'authorizations'
  | 'review'
  | 'therapy_selection'
  | 'service_selection'
  | 'online_services'
  | 'purchasing_preferences'
  | 'financial_assessment'
  | 'credit_application'
  | 'gpo_membership'
  | 'office_hours';

export interface CompanyInfo {
  legal_name: string;
  dba_name?: string;
  website?: string;
  federal_tax_id: string;
  legal_address: Address;
  mailing_address?: Address;
  same_as_legal_address: boolean;
}

export interface BusinessInfo {
  business_type: BusinessType[];
  years_in_business: number;
  ownership_type: OwnershipType;
  state_org_charter_id?: string;
  number_of_employees?: number;
  estimated_monthly_purchases?: number;
  initial_order_amount?: number;
}

export interface ContactsInfo {
  primary_contact: Contact;
  billing_contact?: Contact;
  technical_contact?: Contact;
  emergency_contact?: Contact;
  accounts_payable_contact?: Contact;
  shipping_contact?: Contact;
  alternate_contact?: Contact;
}

export interface OwnershipInfo {
  principal_owners: PrincipalOwner[];
  bankruptcy_history: boolean;
  bankruptcy_explanation?: string;
  controlling_entity?: ControllingEntity;
}

export interface ControllingEntity {
  name: string;
  relationship: string;
  phone: string;
  address: Address;
}

export interface ReferencesInfo {
  primary_bank: BankReference;
  primary_supplier: SupplierReference;
  additional_references: AdditionalReference[];
  technology_provider?: TechnologyReference;
}

export interface TechnologyReference {
  name: string;
  contact_name: string;
  phone: string;
  email?: string;
}

export interface PaymentInfo {
  ach_preference: 'direct_debit' | 'credit_card' | 'wire_transfer';
  bank_name: string;
  bank_account_number: string;
  bank_routing_number: string;
  bank_address: Address;
  statement_delivery_preference: 'email' | 'mail';
  payment_terms_requested?: string;
  bank_phone?: string;
}

export interface CreditApplicationInfo {
  requested_credit_limit: string;
  trade_references: TradeReference[];
  bank_references: Reference[];
  credit_terms_requested: 'net_30' | 'net_60' | 'net_90' | 'other';
  personal_guarantee_required: boolean;
  collateral_offered: boolean;
  financial_statements_provided: boolean;
}

export interface FinancialAssessmentInfo {
  annual_revenue_range: string;
  credit_score_range: string;
  years_in_operation: number;
  insurance_coverage: InsuranceCoverage;
  financial_guarantees: FinancialGuarantees;
  payment_history_rating?: string;
  debt_to_equity_ratio?: number;
  current_ratio?: number;
  days_sales_outstanding?: number;
}

export interface OfficeHoursInfo {
  monday: DaySchedule;
  tuesday: DaySchedule;
  wednesday: DaySchedule;
  thursday: DaySchedule;
  friday: DaySchedule;
  saturday: DaySchedule;
  sunday: DaySchedule;
  timezone: string;
  emergency_contact: EmergencyContact;
  special_hours: SpecialHours;
}

export interface PurchasingPreferencesInfo {
  preferred_purchasing_methods: PurchasingMethod[];
  inventory_management_model: InventoryModel;
  automated_reordering_enabled: boolean;
  reorder_points: Record<string, number>;
  inventory_turnover_targets: Record<string, number>;
  storage_capacity_details: Record<string, string>;
  temperature_controlled_storage: boolean;
  hazmat_storage_capabilities: boolean;
  preferred_order_frequency?: string;
}

export interface LicensesInfo {
  additional_licenses: AdditionalLicense[];
  dea_number?: string;
  medical_license?: string;
  hin_number?: string;
  state_pharmacy_license?: string;
  resale_tax_exemption?: string;
}

export interface DocumentsInfo {
  voided_check: boolean;
  resale_tax_exemption_cert: boolean;
  dea_registration_copy: boolean;
  state_pharmacy_license_copy: boolean;
  medical_license_copy: boolean;
  financial_statements: boolean;
  supplier_statements: boolean;
  additional_documents: AdditionalDocument[];
}

export interface AuthorizationsInfo {
  authorized_signature: AuthorizedSignature;
  guarantor_signature?: GuarantorSignature;
  terms_accepted: boolean;
  date_signed?: string;
}

export interface WorkflowInfo {
  current_step: string;
  completed_steps: string[];
  notes: WorkflowNote[];
}

export interface OnlinePlatformUser {
  name: string;
  email: string;
  role: string;
  // Additional properties for enhanced user management
  user_type?: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  department?: string;
  access_level?: string;
  can_place_orders?: boolean;
  can_manage_users?: boolean;
  can_view_reports?: boolean;
  notification_preferences?: Record<string, any>;
}

export interface GPOMembership {
  gpo_name: string;
  membership_number: string;
  contract_effective_date: string;
  contract_expiration_date: string;
  primary_contact_name: string;
  primary_contact_email: string;
  primary_contact_phone: string;
  covered_categories: string[];
  tier_level: string;
  rebate_information: Record<string, any>;
}

export interface Program340B {
  program_name: string;
  eligibility_criteria: string;
  enrollment_date: string;
  compliance_officer: string;
  policies_procedures_document: string;
  // Additional properties for enhanced 340B management
  program_type?: string;
  registration_number?: string;
  parent_entity_name?: string;
  contract_pharmacy_locations?: string[];
  eligible_drug_categories?: string[];
  compliance_contact_name?: string;
  compliance_contact_email?: string;
  compliance_contact_phone?: string;
  audit_requirements?: Record<string, any>;
}

export interface Address {
  street: string;
  city: string;
  state: string;
  zip: string;
}

export interface Contact {
  name: string;
  title?: string;
  phone: string;
  email: string;
  fax?: string;
}

export interface PrincipalOwner {
  name: string;
  title: string;
  ownership_percentage: number;
}

export interface BankReference {
  name: string;
  contact_name: string;
  phone: string;
  account_number?: string;
}

export interface SupplierReference {
  name: string;
  contact_name: string;
  phone: string;
  account_number?: string;
}

export interface AdditionalReference {
  name: string;
  contact_name: string;
  phone: string;
  account_number?: string;
}

export interface Reference {
  name: string;
  contact_name: string;
  phone: string;
}

export interface TradeReference {
  company_name: string;
  contact_name: string;
  phone: string;
  email?: string;
  account_number?: string;
  credit_limit?: string;
  payment_terms?: string;
}

export interface InsuranceCoverage {
  general_liability: string;
  professional_liability: string;
  workers_compensation: string;
}

export interface FinancialGuarantees {
  lines_of_credit: string;
  assets_pledged: string;
}

export interface DaySchedule {
  open: string;
  close: string;
  closed: boolean;
}

export interface EmergencyContact {
  available_24_7: boolean;
  phone: string;
  email: string;
  instructions: string;
}

export interface SpecialHours {
  holidays_closed: boolean;
  holiday_schedule: string;
  seasonal_adjustments: string;
}

export interface AdditionalLicense {
  license_type: string;
  license_number: string;
  issuing_state: string;
  expiration_date: string;
  // Legacy property names for backward compatibility
  type?: string;
  number?: string;
  state?: string;
}

export interface AdditionalDocument {
  document_type: string;
  file_name: string;
  upload_date: string;
  // Legacy property names for backward compatibility
  name?: string;
  type?: string;
  uploaded?: boolean;
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
  date: string;
  ssn?: string;
}

export interface WorkflowNote {
  author: string;
  timestamp: string;
  content: string;
}

export interface ApiIntegrationData {
  endpoints: ApiEndpoint[];
  authentication_methods: string[];
  data_formats: string[];
  security_requirements: {
    encryption_required: boolean;
    api_key_authentication: boolean;
    oauth2_authentication: boolean;
    ip_whitelisting: boolean;
    ssl_certificate_required: boolean;
  };
  documentation_preferences: {
    swagger_documentation: boolean;
    postman_collection: boolean;
    sdk_required: boolean;
    sandbox_environment: boolean;
  };
}

export interface ApiEndpoint {
  id: string;
  name: string;
  url: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  description: string;
  authentication_required: boolean;
  rate_limit?: number;
  data_format: 'JSON' | 'XML' | 'CSV' | 'FHIR';
  is_webhook: boolean;
}

export interface EnhancedPaymentTerms {
  preferred_terms: string;
  early_payment_discount: boolean;
  discount_percentage?: number;
  discount_days?: number;
  consolidation_preferences: string[];
  billing_frequency: string;
  credit_limit_requested: number;
}

export interface ApiRequirements {
  needs_api_integration: boolean;
  integration_priority?: 'high' | 'medium' | 'low';
  integration_timeline?: string;
  current_systems: string[];
  data_exchange_needs: string[];
  security_requirements: string[];
  technical_contact_name?: string;
  technical_contact_email?: string;
  technical_contact_phone?: string;
  additional_notes?: string;
}

export interface TreatmentCenterOnboarding {
  id?: string;
  user_id?: string;
  status?: 'draft' | 'submitted' | 'under_review' | 'approved' | 'rejected';
  created_at?: string;
  updated_at?: string;
  submitted_at?: string;
  
  // Basic Information
  selected_distributors: string[];
  company_info: CompanyInfo;
  business_info: BusinessInfo;
  contacts: ContactsInfo;
  ownership: OwnershipInfo;
  references: ReferencesInfo;
  
  // Financial & Payment
  payment_info: PaymentInfo;
  credit_application: CreditApplicationInfo;
  financial_assessment: FinancialAssessmentInfo;
  enhanced_payment_terms?: EnhancedPaymentTerms;
  
  // Operations
  office_hours: OfficeHoursInfo;
  purchasing_preferences: PurchasingPreferencesInfo;
  
  // Compliance & Documentation
  licenses: LicensesInfo;
  documents: DocumentsInfo;
  authorizations: AuthorizationsInfo;
  
  // Online Services & Users
  selected_online_services: string[];
  selected_user_roles: string[];
  platform_users: OnlinePlatformUser[];
  
  // Special Programs
  gpo_memberships: GPOMembership[];
  gpo_memberships_detailed?: GPOMembership[];
  program_340b: Program340B[];
  is_340b_entity?: boolean;
  
  // API Requirements (replaces api_integration)
  api_requirements?: ApiRequirements;
  
  // Additional properties for database compatibility
  operational_hours?: Record<string, any>;
  payment_terms_preference?: string;
  preferred_payment_methods?: string[];
  
  // Workflow
  workflow: WorkflowInfo;
}
