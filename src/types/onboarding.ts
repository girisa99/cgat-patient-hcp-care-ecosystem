
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
  | 'licenses'
  | 'documents'
  | 'authorizations'
  | 'review'
  | 'complete';
