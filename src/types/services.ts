
export interface ServiceProvider {
  id: string;
  name: string;
  provider_type: 'internal' | 'external_partner' | 'third_party';
  description?: string;
  contact_info: any;
  capabilities: string[];
  geographic_coverage: string[];
  certification_details: any;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Service {
  id: string;
  service_type: '3pl' | 'specialty_distribution' | 'specialty_pharmacy' | 'order_management' | 'patient_hub_services';
  name: string;
  description?: string;
  service_provider_id: string;
  service_provider?: ServiceProvider;
  requirements: any;
  pricing_model: any;
  sla_requirements: any;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ServiceSelection {
  id?: string;
  onboarding_id: string;
  service_id: string;
  selected_provider_id: string;
  therapy_area: string;
  selection_rationale?: string;
  custom_requirements?: any;
  estimated_volume?: any;
  preferred_start_date?: string;
  service?: Service;
  service_provider?: ServiceProvider;
}

export interface ServiceProviderCapability {
  id: string;
  service_provider_id: string;
  therapy_area: string;
  service_type: '3pl' | 'specialty_distribution' | 'specialty_pharmacy' | 'order_management' | 'patient_hub_services';
  capability_level: 'basic' | 'advanced' | 'specialized';
  experience_years?: number;
  volume_capacity: any;
  geographic_restrictions: string[];
  regulatory_compliance: any;
  certifications: string[];
  is_preferred: boolean;
  created_at: string;
  updated_at: string;
  service_provider?: ServiceProvider;
}

export const SERVICE_TYPES = {
  '3pl': '3PL Logistics',
  'specialty_distribution': 'Specialty Distribution',
  'specialty_pharmacy': 'Specialty Pharmacy',
  'order_management': 'Order Management',
  'patient_hub_services': 'Patient Hub Services'
} as const;

export const PROVIDER_TYPES = {
  'internal': 'Internal',
  'external_partner': 'External Partner',
  'third_party': 'Third Party'
} as const;

export const CAPABILITY_LEVELS = {
  'basic': 'Basic',
  'advanced': 'Advanced',
  'specialized': 'Specialized'
} as const;

export const THERAPY_AREAS = [
  'CAR-T Cell Therapy',
  'Gene Therapy',
  'Advanced Biologics',
  'Personalized Medicine',
  'Radioligand Therapy',
  'Cell Therapy',
  'Immunotherapy',
  'Other CGAT Therapies'
] as const;
