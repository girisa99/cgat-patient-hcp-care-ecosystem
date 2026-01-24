/**
 * Sanctions & Compliance Registry
 * 
 * CRITICAL: This implements OFAC sanctions compliance as of September 2024.
 * 
 * LEGAL DISCLAIMER: This is informational guidance only, not legal advice.
 * Consult with a sanctions/export compliance attorney before launching
 * in any international markets.
 */

// ═══════════════════════════════════════════════════════════════════════════════
// TYPE DEFINITIONS
// ═══════════════════════════════════════════════════════════════════════════════

export type SanctionStatus = 'fully_sanctioned' | 'partially_sanctioned' | 'data_residency' | 'allowed';
export type CompliancePriority = 'critical' | 'high' | 'medium' | 'low';
export type BlockAction = 'block_completely' | 'consult_legal' | 'regional_server' | 'privacy_focus' | 'allowed';

export interface SanctionedRegion {
  countryCode: string;
  countryName: string;
  status: SanctionStatus;
  action: BlockAction;
  notes: string;
  effectiveDate: string;
  legalBasis: string;
}

export interface DataResidencyRequirement {
  countryCode: string;
  countryName: string;
  requirement: string;
  implementation: string;
  priority: CompliancePriority;
}

export interface CompliancePhase {
  phase: string;
  action: string;
  priority: CompliancePriority;
  status: 'pending' | 'in_progress' | 'completed';
}

export interface ProhibitedService {
  service: string;
  description: string;
  affectsOurPlatform: boolean;
}

// ═══════════════════════════════════════════════════════════════════════════════
// SANCTIONED REGIONS - CRITICAL BLOCKING LIST
// ═══════════════════════════════════════════════════════════════════════════════

export const SANCTIONED_REGIONS: SanctionedRegion[] = [
  // CRITICAL: Fully Sanctioned - Block Completely
  {
    countryCode: 'RU',
    countryName: 'Russia',
    status: 'fully_sanctioned',
    action: 'block_completely',
    notes: 'OFAC June 2024 restrictions effective September 12, 2024 - SaaS services prohibited',
    effectiveDate: '2024-09-12',
    legalBasis: 'US Treasury/OFAC'
  },
  {
    countryCode: 'BY',
    countryName: 'Belarus',
    status: 'fully_sanctioned',
    action: 'block_completely',
    notes: 'Similar restrictions as Russia effective September 2024',
    effectiveDate: '2024-09-12',
    legalBasis: 'US Treasury/OFAC'
  },
  {
    countryCode: 'IR',
    countryName: 'Iran',
    status: 'fully_sanctioned',
    action: 'block_completely',
    notes: 'OFAC comprehensive sanctions',
    effectiveDate: '1979-11-14',
    legalBasis: 'US Treasury/OFAC'
  },
  {
    countryCode: 'KP',
    countryName: 'North Korea',
    status: 'fully_sanctioned',
    action: 'block_completely',
    notes: 'OFAC comprehensive sanctions',
    effectiveDate: '2008-06-26',
    legalBasis: 'US Treasury/OFAC'
  },
  {
    countryCode: 'SY',
    countryName: 'Syria',
    status: 'fully_sanctioned',
    action: 'block_completely',
    notes: 'OFAC comprehensive sanctions',
    effectiveDate: '2011-08-18',
    legalBasis: 'US Treasury/OFAC'
  },
  {
    countryCode: 'CU',
    countryName: 'Cuba',
    status: 'partially_sanctioned',
    action: 'block_completely',
    notes: 'OFAC restrictions',
    effectiveDate: '1962-02-07',
    legalBasis: 'US Treasury/OFAC'
  },
  {
    countryCode: 'VE',
    countryName: 'Venezuela',
    status: 'partially_sanctioned',
    action: 'consult_legal',
    notes: 'Targeted sanctions, complex - requires legal review',
    effectiveDate: '2019-01-28',
    legalBasis: 'US Treasury/OFAC'
  },
  // Occupied territories - treat as sanctioned
  {
    countryCode: 'UA-43', // Crimea
    countryName: 'Crimea',
    status: 'fully_sanctioned',
    action: 'block_completely',
    notes: 'Treat as Russia-occupied territory',
    effectiveDate: '2014-03-17',
    legalBasis: 'US Treasury/OFAC'
  },
  {
    countryCode: 'UA-14', // Donetsk
    countryName: 'Donetsk',
    status: 'fully_sanctioned',
    action: 'block_completely',
    notes: 'Russia-occupied Ukraine',
    effectiveDate: '2022-02-21',
    legalBasis: 'US Treasury/OFAC'
  },
  {
    countryCode: 'UA-09', // Luhansk
    countryName: 'Luhansk',
    status: 'fully_sanctioned',
    action: 'block_completely',
    notes: 'Russia-occupied Ukraine',
    effectiveDate: '2022-02-21',
    legalBasis: 'US Treasury/OFAC'
  }
];

// Country codes that should be completely blocked
export const BLOCKED_COUNTRY_CODES: string[] = [
  'RU', // Russia
  'BY', // Belarus
  'IR', // Iran
  'KP', // North Korea
  'SY', // Syria
  'CU', // Cuba
];

// ═══════════════════════════════════════════════════════════════════════════════
// PROHIBITED SERVICES TO RUSSIA (September 2024+)
// ═══════════════════════════════════════════════════════════════════════════════

export const PROHIBITED_SERVICES_RUSSIA: ProhibitedService[] = [
  {
    service: 'IT consultancy and design services',
    description: 'Any IT consulting or design work',
    affectsOurPlatform: true
  },
  {
    service: 'IT support services for enterprise management software',
    description: 'Technical support for ERP, CRM, etc.',
    affectsOurPlatform: true
  },
  {
    service: 'Cloud-based services (SaaS) for enterprise software',
    description: 'Any SaaS offering',
    affectsOurPlatform: true
  },
  {
    service: 'Design and manufacturing software services',
    description: 'CAD, CAM, and related services',
    affectsOurPlatform: true
  }
];

// ═══════════════════════════════════════════════════════════════════════════════
// DATA RESIDENCY REQUIREMENTS
// ═══════════════════════════════════════════════════════════════════════════════

export const DATA_RESIDENCY_REQUIREMENTS: DataResidencyRequirement[] = [
  {
    countryCode: 'SA',
    countryName: 'Saudi Arabia',
    requirement: 'In-country data storage (2024 rules)',
    implementation: 'May need regional server or exclude',
    priority: 'medium'
  },
  {
    countryCode: 'AE',
    countryName: 'UAE',
    requirement: 'PDPL compliance required',
    implementation: 'Privacy-focused approach',
    priority: 'medium'
  },
  {
    countryCode: 'EU',
    countryName: 'European Union',
    requirement: 'GDPR compliance',
    implementation: 'Standard privacy practices',
    priority: 'high'
  },
  {
    countryCode: 'BR',
    countryName: 'Brazil',
    requirement: 'LGPD compliance',
    implementation: 'Similar to GDPR',
    priority: 'medium'
  },
  {
    countryCode: 'IN',
    countryName: 'India',
    requirement: 'Data localization for financial',
    implementation: 'Stripe handles this',
    priority: 'medium'
  },
  {
    countryCode: 'CN',
    countryName: 'China',
    requirement: 'Strict data localization',
    implementation: 'Exclude China market initially',
    priority: 'high'
  }
];

// ═══════════════════════════════════════════════════════════════════════════════
// COMPLIANCE IMPLEMENTATION PHASES
// ═══════════════════════════════════════════════════════════════════════════════

export const COMPLIANCE_PHASES: CompliancePhase[] = [
  {
    phase: 'Immediate',
    action: 'Block Russia, Belarus, Iran, NK, Syria, Cuba',
    priority: 'critical',
    status: 'in_progress'
  },
  {
    phase: 'Immediate',
    action: 'Add sanctioned regions to Terms of Service',
    priority: 'critical',
    status: 'pending'
  },
  {
    phase: 'Phase 1',
    action: 'Implement IP geolocation blocking',
    priority: 'high',
    status: 'in_progress'
  },
  {
    phase: 'Phase 2',
    action: 'Phone verification for regional pricing',
    priority: 'medium',
    status: 'pending'
  },
  {
    phase: 'Phase 3',
    action: 'Regional compliance review (Saudi, UAE)',
    priority: 'medium',
    status: 'pending'
  },
  {
    phase: 'Ongoing',
    action: 'Monitor OFAC updates quarterly',
    priority: 'high',
    status: 'pending'
  }
];

// ═══════════════════════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Check if a country code is sanctioned
 */
export function isSanctionedCountry(countryCode: string): boolean {
  return BLOCKED_COUNTRY_CODES.includes(countryCode.toUpperCase());
}

/**
 * Get sanction details for a country
 */
export function getSanctionDetails(countryCode: string): SanctionedRegion | undefined {
  return SANCTIONED_REGIONS.find(r => r.countryCode === countryCode.toUpperCase());
}

/**
 * Check if a country requires data residency considerations
 */
export function requiresDataResidency(countryCode: string): DataResidencyRequirement | undefined {
  return DATA_RESIDENCY_REQUIREMENTS.find(r => r.countryCode === countryCode.toUpperCase());
}

/**
 * Get all blocked country codes
 */
export function getBlockedCountryCodes(): string[] {
  return [...BLOCKED_COUNTRY_CODES];
}

/**
 * Get all sanctioned regions with full details
 */
export function getAllSanctionedRegions(): SanctionedRegion[] {
  return SANCTIONED_REGIONS.filter(r => 
    r.action === 'block_completely' || r.status === 'fully_sanctioned'
  );
}

/**
 * Build compliance status report
 */
export function getComplianceStatus(): {
  blockedCountries: number;
  dataResidencyCountries: number;
  criticalActions: CompliancePhase[];
  completedPhases: number;
  totalPhases: number;
} {
  const criticalActions = COMPLIANCE_PHASES.filter(p => p.priority === 'critical');
  const completedPhases = COMPLIANCE_PHASES.filter(p => p.status === 'completed').length;
  
  return {
    blockedCountries: BLOCKED_COUNTRY_CODES.length,
    dataResidencyCountries: DATA_RESIDENCY_REQUIREMENTS.length,
    criticalActions,
    completedPhases,
    totalPhases: COMPLIANCE_PHASES.length
  };
}

/**
 * Get blocking message for sanctioned region
 */
export function getBlockingMessage(countryCode: string): string {
  const sanction = getSanctionDetails(countryCode);
  if (!sanction) {
    return 'Access is restricted in your region due to regulatory requirements.';
  }
  
  return `Access to this service is not available in ${sanction.countryName} due to ${sanction.legalBasis} regulations. We apologize for any inconvenience.`;
}

/**
 * Validate if a region is allowed for service
 */
export function isRegionAllowed(countryCode: string): {
  allowed: boolean;
  reason?: string;
  action?: BlockAction;
} {
  const upperCode = countryCode.toUpperCase();
  
  // Check sanctioned list first
  const sanction = getSanctionDetails(upperCode);
  if (sanction && sanction.action === 'block_completely') {
    return {
      allowed: false,
      reason: sanction.notes,
      action: sanction.action
    };
  }
  
  // Check if in blocked list
  if (BLOCKED_COUNTRY_CODES.includes(upperCode)) {
    return {
      allowed: false,
      reason: 'Region is under comprehensive sanctions',
      action: 'block_completely'
    };
  }
  
  // Check data residency - allowed but with notes
  const residency = requiresDataResidency(upperCode);
  if (residency) {
    return {
      allowed: true,
      reason: residency.requirement,
      action: 'privacy_focus'
    };
  }
  
  return { allowed: true };
}

// ═══════════════════════════════════════════════════════════════════════════════
// REGISTRY EXPORT
// ═══════════════════════════════════════════════════════════════════════════════

export const SanctionsComplianceRegistry = {
  SANCTIONED_REGIONS,
  BLOCKED_COUNTRY_CODES,
  PROHIBITED_SERVICES_RUSSIA,
  DATA_RESIDENCY_REQUIREMENTS,
  COMPLIANCE_PHASES,
  isSanctionedCountry,
  getSanctionDetails,
  requiresDataResidency,
  getBlockedCountryCodes,
  getAllSanctionedRegions,
  getComplianceStatus,
  getBlockingMessage,
  isRegionAllowed
};

export default SanctionsComplianceRegistry;
