export interface Therapy {
  id: string;
  name: string;
  therapy_type: 'car_t_cell' | 'gene_therapy' | 'advanced_biologics' | 'personalized_medicine' | 'radioligand_therapy' | 'cell_therapy' | 'immunotherapy' | 'other_cgat';
  description?: string;
  indication?: string;
  target_population?: string;
  mechanism_of_action?: string;
  special_handling_requirements: Record<string, unknown>;
  regulatory_designations: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Modality {
  id: string;
  name: string;
  modality_type: 'autologous' | 'allogeneic' | 'viral_vector' | 'non_viral' | 'protein_based' | 'antibody_drug_conjugate' | 'radioligand' | 'combination';
  description?: string;
  manufacturing_complexity: 'low' | 'medium' | 'high' | 'very_high';
  cold_chain_requirements: Record<string, unknown>;
  shelf_life_considerations?: string;
  administration_requirements: Record<string, unknown>;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Manufacturer {
  id: string;
  name: string;
  manufacturer_type: 'pharma' | 'biotech' | 'cdmo' | 'academic' | 'other';
  headquarters_location?: string;
  regulatory_status: Record<string, unknown>;
  manufacturing_capabilities: string[];
  quality_certifications: string[];
  contact_info: Record<string, unknown>;
  partnership_tier: 'preferred' | 'standard' | 'limited';
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: string;
  name: string;
  brand_name?: string;
  therapy_id: string;
  modality_id: string;
  manufacturer_id: string;
  product_status: 'preclinical' | 'phase_1' | 'phase_2' | 'phase_3' | 'approved' | 'discontinued';
  ndc_number?: string;
  approval_date?: string;
  indication?: string;
  dosing_information: Record<string, unknown>;
  contraindications: string[];
  special_populations: Record<string, unknown>;
  distribution_requirements: Record<string, unknown>;
  pricing_information: Record<string, unknown>;
  market_access_considerations: Record<string, unknown>;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  therapy?: Therapy;
  modality?: Modality;
  manufacturer?: Manufacturer;
}

export interface ClinicalTrial {
  id: string;
  nct_number?: string;
  title: string;
  product_id: string;
  trial_status: 'not_yet_recruiting' | 'recruiting' | 'active_not_recruiting' | 'completed' | 'suspended' | 'terminated' | 'withdrawn';
  phase: 'preclinical' | 'phase_1' | 'phase_1_2' | 'phase_2' | 'phase_2_3' | 'phase_3' | 'phase_4';
  primary_indication?: string;
  patient_population?: string;
  enrollment_target?: number;
  enrollment_current: number;
  primary_endpoint?: string;
  secondary_endpoints: string[];
  investigational_sites: Record<string, unknown>;
  sponsor_info: Record<string, unknown>;
  start_date?: string;
  estimated_completion_date?: string;
  actual_completion_date?: string;
  trial_locations: string[];
  eligibility_criteria: Record<string, unknown>;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  product?: Product;
}

export interface CommercialProduct {
  id: string;
  product_id: string;
  launch_date?: string;
  market_regions: string[];
  reimbursement_status: Record<string, unknown>;
  patient_access_programs: Record<string, unknown>;
  distribution_channels: string[];
  volume_projections: Record<string, unknown>;
  competitive_landscape: Record<string, unknown>;
  key_opinion_leaders: string[];
  medical_affairs_contacts: Record<string, unknown>;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  product?: Product;
}

export interface TherapySelection {
  id?: string;
  onboarding_id: string;
  therapy_id: string;
  product_id: string;
  service_id: string;
  selected_provider_id: string;
  clinical_trial_id?: string;
  commercial_product_id?: string;
  patient_volume_estimate?: number;
  treatment_readiness_level: 'planning' | 'preparing' | 'ready' | 'active';
  infrastructure_requirements?: Record<string, unknown>;
  staff_training_needs?: Record<string, unknown>;
  timeline_considerations?: Record<string, unknown>;
  special_requirements?: Record<string, unknown>;
  selection_rationale?: string;
  priority_level: 'high' | 'medium' | 'low';
  preferred_start_date?: string;
  created_at: string;
  updated_at: string;
  therapy?: Therapy;
  product?: Product;
  service?: Record<string, unknown>;
  service_provider?: Record<string, unknown>;
  clinical_trial?: ClinicalTrial;
  commercial_product?: CommercialProduct;
}

export const THERAPY_TYPES = {
  'car_t_cell': 'CAR-T Cell Therapy',
  'gene_therapy': 'Gene Therapy',
  'advanced_biologics': 'Advanced Biologics',
  'personalized_medicine': 'Personalized Medicine',
  'radioligand_therapy': 'Radioligand Therapy',
  'cell_therapy': 'Cell Therapy',
  'immunotherapy': 'Immunotherapy',
  'other_cgat': 'Other CGAT Therapies'
} as const;

export const MODALITY_TYPES = {
  'autologous': 'Autologous',
  'allogeneic': 'Allogeneic',
  'viral_vector': 'Viral Vector',
  'non_viral': 'Non-Viral',
  'protein_based': 'Protein-Based',
  'antibody_drug_conjugate': 'Antibody Drug Conjugate',
  'radioligand': 'Radioligand',
  'combination': 'Combination'
} as const;

export const TREATMENT_READINESS_LEVELS = {
  'planning': 'Planning',
  'preparing': 'Preparing',
  'ready': 'Ready to Start',
  'active': 'Active Treatment'
} as const;

export const PRIORITY_LEVELS = {
  'high': 'High Priority',
  'medium': 'Medium Priority',
  'low': 'Low Priority'
} as const;
