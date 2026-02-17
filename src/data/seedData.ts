
// Seed data for Services & Therapies section
export const SEED_THERAPIES = [
  {
    id: '1',
    name: 'CAR-T Cell Therapy',
    therapy_type: 'cell_gene_therapy',
    description: 'Chimeric Antigen Receptor T-Cell Therapy for hematologic malignancies',
    indication_areas: ['Oncology', 'Hematology'],
    regulatory_status: 'FDA Approved',
    is_active: true
  },
  {
    id: '2',
    name: 'Gene Editing Therapy',
    therapy_type: 'gene_editing',
    description: 'CRISPR-based gene editing for genetic disorders',
    indication_areas: ['Genetic Disorders', 'Rare Diseases'],
    regulatory_status: 'Clinical Trial',
    is_active: true
  },
  {
    id: '3',
    name: 'Oncolytic Virus Therapy',
    therapy_type: 'oncolytic_virus',
    description: 'Engineered viruses for cancer treatment',
    indication_areas: ['Oncology'],
    regulatory_status: 'FDA Approved',
    is_active: true
  }
];

export const SEED_MANUFACTURERS = [
  {
    id: '1',
    name: 'Gilead Sciences',
    manufacturer_type: 'biopharmaceutical',
    headquarters_location: 'Foster City, CA',
    quality_certifications: ['FDA', 'EMA', 'GMP'],
    manufacturing_capabilities: ['Cell Therapy', 'Gene Therapy'],
    partnership_tier: 'tier_1',
    is_active: true
  },
  {
    id: '2',
    name: 'Novartis',
    manufacturer_type: 'biopharmaceutical',
    headquarters_location: 'Basel, Switzerland',
    quality_certifications: ['FDA', 'EMA', 'GMP', 'ISO'],
    manufacturing_capabilities: ['CAR-T', 'Gene Therapy', 'Cell Therapy'],
    partnership_tier: 'tier_1',
    is_active: true
  },
  {
    id: '3',
    name: 'Bristol Myers Squibb',
    manufacturer_type: 'biopharmaceutical',
    headquarters_location: 'New York, NY',
    quality_certifications: ['FDA', 'EMA', 'GMP'],
    manufacturing_capabilities: ['Immunotherapy', 'CAR-T'],
    partnership_tier: 'tier_1',
    is_active: true
  }
];

export const SEED_MODALITIES = [
  {
    id: '1',
    name: 'Autologous CAR-T',
    modality_type: 'cell_therapy',
    description: 'Patient-derived T-cell therapy',
    administration_requirements: {
      infusion_center: true,
      specialized_staff: true,
      monitoring_period: '30 days'
    },
    cold_chain_requirements: {
      storage_temp: '-80°C',
      transport_temp: 'Dry ice',
      stability: '24 months'
    },
    manufacturing_complexity: 'high',
    is_active: true
  },
  {
    id: '2',
    name: 'Allogeneic CAR-T',
    modality_type: 'cell_therapy',
    description: 'Donor-derived T-cell therapy',
    administration_requirements: {
      infusion_center: true,
      specialized_staff: true,
      monitoring_period: '30 days'
    },
    cold_chain_requirements: {
      storage_temp: '-80°C',
      transport_temp: 'Dry ice',
      stability: '24 months'
    },
    manufacturing_complexity: 'high',
    is_active: true
  }
];

export const SEED_PRODUCTS = [
  {
    id: '1',
    name: 'Kymriah (tisagenlecleucel)',
    therapy_id: '1',
    modality_id: '1',
    manufacturer_id: '2',
    product_type: 'commercial',
    indication_areas: ['Acute Lymphoblastic Leukemia', 'Diffuse Large B-Cell Lymphoma'],
    regulatory_approvals: {
      fda: { approved: true, date: '2017-08-30' },
      ema: { approved: true, date: '2018-08-22' }
    },
    pricing_information: {
      list_price: 475000,
      currency: 'USD',
      pricing_model: 'outcome_based'
    },
    is_active: true
  },
  {
    id: '2',
    name: 'Yescarta (axicabtagene ciloleucel)',
    therapy_id: '1',
    modality_id: '1',
    manufacturer_id: '1',
    product_type: 'commercial',
    indication_areas: ['Diffuse Large B-Cell Lymphoma', 'Primary Mediastinal B-Cell Lymphoma'],
    regulatory_approvals: {
      fda: { approved: true, date: '2017-10-18' },
      ema: { approved: true, date: '2018-08-23' }
    },
    pricing_information: {
      list_price: 373000,
      currency: 'USD',
      pricing_model: 'fixed'
    },
    is_active: true
  }
];

export const SEED_SERVICES = [
  {
    id: '1',
    name: 'Cold Chain Logistics',
    service_type: 'logistics',
    description: 'Specialized cold chain management for cell and gene therapies',
    capabilities: ['Temperature monitoring', 'Real-time tracking', 'Emergency protocols'],
    geographic_coverage: ['North America', 'Europe'],
    is_active: true
  },
  {
    id: '2',
    name: 'Patient Scheduling & Coordination',
    service_type: 'patient_services',
    description: 'Comprehensive patient journey management',
    capabilities: ['Appointment scheduling', 'Insurance verification', 'Patient support'],
    geographic_coverage: ['United States'],
    is_active: true
  },
  {
    id: '3',
    name: 'Regulatory Compliance Support',
    service_type: 'regulatory',
    description: 'DSCSA compliance and regulatory reporting',
    capabilities: ['DSCSA reporting', 'Audit support', 'Documentation management'],
    geographic_coverage: ['United States'],
    is_active: true
  },
  {
    id: '4',
    name: 'Financial Management Services',
    service_type: 'financial',
    description: 'Revenue cycle and financial reporting',
    capabilities: ['Claims processing', 'Invoice management', 'Financial reporting'],
    geographic_coverage: ['United States'],
    is_active: true
  },
  {
    id: '5',
    name: 'Returns & Claims Processing',
    service_type: 'operational',
    description: 'Product returns and claims management',
    capabilities: ['Return authorization', 'Claims processing', 'Credit management'],
    geographic_coverage: ['United States'],
    is_active: true
  }
];

export const SEED_SERVICE_PROVIDERS = [
  {
    id: '1',
    name: 'Cryoport Systems',
    provider_type: 'logistics',
    specializations: ['Cold Chain', 'Cell & Gene Therapy'],
    geographic_coverage: ['Global'],
    certifications: ['GDP', 'IATA', 'ISPE'],
    contact_info: {
      phone: '1-800-CRYOPORT',
      email: 'info@cryoport.com',
      website: 'www.cryoport.com'
    },
    is_active: true
  },
  {
    id: '2',
    name: 'McKesson Specialty Health',
    provider_type: 'distribution',
    specializations: ['Specialty Pharmacy', 'Oncology', 'Rare Diseases'],
    geographic_coverage: ['United States', 'Canada'],
    certifications: ['NABP', 'VAWD', 'DSCSA'],
    contact_info: {
      phone: '1-800-MCKESSON',
      email: 'specialty@mckesson.com',
      website: 'www.mckesson.com'
    },
    is_active: true
  },
  {
    id: '3',
    name: 'Cardinal Health Specialty Solutions',
    provider_type: 'distribution',
    specializations: ['Cell & Gene Therapy', 'Rare Diseases', 'Oncology'],
    geographic_coverage: ['United States'],
    certifications: ['NABP', 'VAWD', 'DSCSA'],
    contact_info: {
      phone: '1-800-CARDINAL',
      email: 'specialty@cardinalhealth.com',
      website: 'www.cardinalhealth.com'
    },
    is_active: true
  }
];

export const SEED_CLINICAL_TRIALS = [
  {
    id: '1',
    product_id: '1',
    nct_number: 'NCT04162015',
    title: 'Kymriah in Pediatric B-ALL - Expanded Access',
    phase: 'Phase IV',
    trial_status: 'recruiting',
    primary_indication: 'Acute Lymphoblastic Leukemia',
    patient_population: 'Pediatric and Young Adult',
    enrollment_target: 100,
    enrollment_current: 45,
    start_date: '2023-01-15',
    estimated_completion_date: '2025-12-31',
    primary_endpoint: 'Overall response rate',
    secondary_endpoints: ['Overall survival', 'Progression-free survival'],
    eligibility_criteria: {
      age_range: '3-25 years',
      disease_status: 'Relapsed/Refractory B-ALL',
      prior_therapies: 'At least 2 prior regimens'
    },
    trial_locations: ['Children\'s Hospital of Philadelphia', 'Seattle Children\'s Hospital'],
    is_active: true
  }
];

export const SEED_COMMERCIAL_PRODUCTS = [
  {
    id: '1',
    product_id: '1',
    launch_date: '2017-08-30',
    market_regions: ['United States', 'European Union', 'Canada'],
    reimbursement_status: {
      medicare: 'Covered',
      medicaid: 'Varies by state',
      commercial: 'Prior authorization required'
    },
    patient_access_programs: {
      patient_assistance: true,
      copay_support: true,
      free_drug_program: true
    },
    distribution_channels: ['Specialty pharmacy', 'Hospital direct', 'Authorized distributors'],
    competitive_landscape: {
      primary_competitors: ['Yescarta', 'Tecartus'],
      market_share: '35%',
      differentiation: 'First-in-class pediatric indication'
    },
    volume_projections: {
      year_1: 500,
      year_2: 750,
      year_3: 1000
    },
    is_active: true
  }
];

export const SERVICE_CAPABILITIES = [
  {
    id: '1',
    service_provider_id: '1',
    service_type: 'logistics',
    therapy_area: 'Cell & Gene Therapy',
    capability_level: 'specialized',
    is_preferred: true,
    geographic_coverage: ['North America', 'Europe'],
    certifications: ['GDP', 'IATA'],
    experience_years: 15
  },
  {
    id: '2',
    service_provider_id: '2',
    service_type: 'distribution',
    therapy_area: 'Oncology',
    capability_level: 'advanced',
    is_preferred: true,
    geographic_coverage: ['United States'],
    certifications: ['NABP', 'VAWD', 'DSCSA'],
    experience_years: 25
  },
  {
    id: '3',
    service_provider_id: '3',
    service_type: 'distribution',
    therapy_area: 'Cell & Gene Therapy',
    capability_level: 'specialized',
    is_preferred: true,
    geographic_coverage: ['United States'],
    certifications: ['NABP', 'VAWD', 'DSCSA'],
    experience_years: 20
  }
];

export const ONLINE_SERVICES = [
  {
    id: '1',
    service_name: 'Online Order Management',
    description: 'Complete order lifecycle management',
    features: ['Order placement', 'Order tracking', 'Delivery scheduling', 'Order history'],
    access_roles: ['ordering_user', 'primary_admin', 'secondary_admin'],
    is_active: true
  },
  {
    id: '2',
    service_name: 'Returns & Claims Processing',
    description: 'Automated returns and claims management',
    features: ['Return authorization', 'Claims submission', 'Status tracking', 'Credit processing'],
    access_roles: ['returns_specialist', 'primary_admin', 'accounting_user'],
    is_active: true
  },
  {
    id: '3',
    service_name: 'Invoice Management',
    description: 'Digital invoice processing and payment',
    features: ['Invoice viewing', 'Payment processing', 'Dispute resolution', 'Payment history'],
    access_roles: ['accounting_user', 'primary_admin', 'accounts_payable'],
    is_active: true
  },
  {
    id: '4',
    service_name: 'DSCSA Reporting',
    description: 'Drug Supply Chain Security Act compliance',
    features: ['Transaction reporting', 'Product tracing', 'Verification records', 'Compliance dashboard'],
    access_roles: ['compliance_officer', 'primary_admin', 'quality_assurance'],
    is_active: true
  },
  {
    id: '5',
    service_name: 'Analytics & Reporting',
    description: 'Business intelligence and analytics platform',
    features: ['Custom reports', 'Dashboard creation', 'Data export', 'Scheduled reports'],
    access_roles: ['reporting_user', 'primary_admin', 'business_analyst'],
    is_active: true
  },
  {
    id: '6',
    service_name: 'Report Sharing',
    description: 'Secure report distribution and collaboration',
    features: ['Report sharing', 'Access controls', 'Audit trails', 'Automated distribution'],
    access_roles: ['reporting_user', 'primary_admin', 'business_analyst'],
    is_active: true
  }
];

export const USER_ROLES = [
  {
    role: 'primary_admin',
    title: 'Primary Administrator',
    description: 'Full system access and user management',
    permissions: ['all']
  },
  {
    role: 'secondary_admin',
    title: 'Secondary Administrator',
    description: 'Limited administrative access',
    permissions: ['user_management', 'order_management', 'reporting']
  },
  {
    role: 'ordering_user',
    title: 'Ordering User',
    description: 'Can place and manage orders',
    permissions: ['place_orders', 'view_orders', 'order_tracking']
  },
  {
    role: 'receiving_user',
    title: 'Receiving User',
    description: 'Manages product receiving and inventory',
    permissions: ['receive_products', 'inventory_management', 'returns']
  },
  {
    role: 'accounting_user',
    title: 'Accounting User',
    description: 'Financial and billing management',
    permissions: ['invoice_management', 'payment_processing', 'financial_reporting']
  },
  {
    role: 'returns_specialist',
    title: 'Returns Specialist',
    description: 'Handles product returns and claims',
    permissions: ['returns_processing', 'claims_management', 'credit_processing']
  },
  {
    role: 'compliance_officer',
    title: 'Compliance Officer',
    description: 'Regulatory compliance and reporting',
    permissions: ['dscsa_reporting', 'compliance_monitoring', 'audit_management']
  },
  {
    role: 'quality_assurance',
    title: 'Quality Assurance',
    description: 'Quality control and validation',
    permissions: ['quality_control', 'validation', 'documentation_review']
  },
  {
    role: 'reporting_user',
    title: 'Reporting User',
    description: 'Analytics and business intelligence',
    permissions: ['report_creation', 'data_analysis', 'dashboard_access']
  },
  {
    role: 'business_analyst',
    title: 'Business Analyst',
    description: 'Advanced analytics and insights',
    permissions: ['advanced_analytics', 'data_modeling', 'custom_reporting']
  }
];
