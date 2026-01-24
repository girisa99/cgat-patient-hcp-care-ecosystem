/**
 * Regional Compliance Registry
 * Comprehensive regional privacy policies, terms, and content moderation rules
 * Supports GDPR, CCPA, MENA, APAC, and other regional requirements
 */

export type ComplianceRegion = 
  | 'EU' | 'US' | 'MENA' | 'APAC' | 'LATAM' | 'AFRICA' 
  | 'UK' | 'CANADA' | 'AUSTRALIA' | 'INDIA' | 'CHINA' | 'JAPAN' | 'KOREA';

export type ContentRestrictionLevel = 'strict' | 'moderate' | 'standard';

export interface RegionalPrivacyPolicy {
  region: ComplianceRegion;
  name: string;
  regulations: string[];
  dataRetentionDays: number;
  requiresExplicitConsent: boolean;
  requiresDataDeletionOnRequest: boolean;
  requiresDataPortability: boolean;
  ageOfConsent: number;
  cookieConsentRequired: boolean;
  crossBorderTransferRules: 'prohibited' | 'restricted' | 'allowed';
  notificationRequiredForBreach: boolean;
  breachNotificationHours: number;
  dataProtectionOfficerRequired: boolean;
  privacyImpactAssessmentRequired: boolean;
}

export interface RegionalContentPolicy {
  region: ComplianceRegion;
  adultContentAllowed: boolean;
  violenceLevel: ContentRestrictionLevel;
  religiousSensitivity: ContentRestrictionLevel;
  politicalContentRestricted: boolean;
  gamblingContentAllowed: boolean;
  alcoholContentAllowed: boolean;
  tobaccoContentAllowed: boolean;
  cannabisContentAllowed: boolean;
  weaponryContentAllowed: boolean;
  lgbtqContentRestricted: boolean;
  profanityLevel: ContentRestrictionLevel;
  customPatterns: RegExp[];
}

export interface RegionalTermsOfService {
  region: ComplianceRegion;
  governingLaw: string;
  disputeResolution: 'arbitration' | 'court' | 'mediation';
  jurisdictionCourt: string;
  consumerProtectionLaws: string[];
  cancelationPeriodDays: number;
  automaticRenewalDisclosure: boolean;
  priceTransparencyRequired: boolean;
  classActionWaiverAllowed: boolean;
  arbitrationOptOutPeriodDays: number;
}

// ═══════════════════════════════════════════════════════════════════
// REGIONAL PRIVACY POLICIES
// ═══════════════════════════════════════════════════════════════════

export const REGIONAL_PRIVACY_POLICIES: Record<ComplianceRegion, RegionalPrivacyPolicy> = {
  EU: {
    region: 'EU',
    name: 'GDPR (General Data Protection Regulation)',
    regulations: ['GDPR', 'ePrivacy Directive'],
    dataRetentionDays: 365,
    requiresExplicitConsent: true,
    requiresDataDeletionOnRequest: true,
    requiresDataPortability: true,
    ageOfConsent: 16,
    cookieConsentRequired: true,
    crossBorderTransferRules: 'restricted',
    notificationRequiredForBreach: true,
    breachNotificationHours: 72,
    dataProtectionOfficerRequired: true,
    privacyImpactAssessmentRequired: true,
  },
  UK: {
    region: 'UK',
    name: 'UK GDPR & Data Protection Act 2018',
    regulations: ['UK GDPR', 'DPA 2018', 'PECR'],
    dataRetentionDays: 365,
    requiresExplicitConsent: true,
    requiresDataDeletionOnRequest: true,
    requiresDataPortability: true,
    ageOfConsent: 13,
    cookieConsentRequired: true,
    crossBorderTransferRules: 'restricted',
    notificationRequiredForBreach: true,
    breachNotificationHours: 72,
    dataProtectionOfficerRequired: true,
    privacyImpactAssessmentRequired: true,
  },
  US: {
    region: 'US',
    name: 'US Privacy Laws (CCPA, CPRA, State Laws)',
    regulations: ['CCPA', 'CPRA', 'HIPAA', 'COPPA', 'State Privacy Laws'],
    dataRetentionDays: 730,
    requiresExplicitConsent: false,
    requiresDataDeletionOnRequest: true,
    requiresDataPortability: true,
    ageOfConsent: 13,
    cookieConsentRequired: false,
    crossBorderTransferRules: 'allowed',
    notificationRequiredForBreach: true,
    breachNotificationHours: 72,
    dataProtectionOfficerRequired: false,
    privacyImpactAssessmentRequired: false,
  },
  MENA: {
    region: 'MENA',
    name: 'MENA Data Protection Regulations',
    regulations: ['UAE PDPL', 'Saudi PDPL', 'Egypt Data Protection Law', 'Bahrain PDPL'],
    dataRetentionDays: 365,
    requiresExplicitConsent: true,
    requiresDataDeletionOnRequest: true,
    requiresDataPortability: true,
    ageOfConsent: 18,
    cookieConsentRequired: true,
    crossBorderTransferRules: 'restricted',
    notificationRequiredForBreach: true,
    breachNotificationHours: 72,
    dataProtectionOfficerRequired: true,
    privacyImpactAssessmentRequired: true,
  },
  APAC: {
    region: 'APAC',
    name: 'APAC Data Protection Framework',
    regulations: ['PDPA (Singapore)', 'PDPA (Thailand)', 'PIPA (Korea)', 'APPI (Japan)'],
    dataRetentionDays: 365,
    requiresExplicitConsent: true,
    requiresDataDeletionOnRequest: true,
    requiresDataPortability: true,
    ageOfConsent: 16,
    cookieConsentRequired: true,
    crossBorderTransferRules: 'restricted',
    notificationRequiredForBreach: true,
    breachNotificationHours: 72,
    dataProtectionOfficerRequired: true,
    privacyImpactAssessmentRequired: true,
  },
  LATAM: {
    region: 'LATAM',
    name: 'Latin America Data Protection Laws',
    regulations: ['LGPD (Brazil)', 'Argentina PDPA', 'Mexico LFPDPPP', 'Colombia Law 1581'],
    dataRetentionDays: 365,
    requiresExplicitConsent: true,
    requiresDataDeletionOnRequest: true,
    requiresDataPortability: true,
    ageOfConsent: 18,
    cookieConsentRequired: true,
    crossBorderTransferRules: 'restricted',
    notificationRequiredForBreach: true,
    breachNotificationHours: 72,
    dataProtectionOfficerRequired: true,
    privacyImpactAssessmentRequired: true,
  },
  AFRICA: {
    region: 'AFRICA',
    name: 'African Data Protection Framework',
    regulations: ['POPIA (South Africa)', 'Nigeria NDPR', 'Kenya DPA', 'AU Convention'],
    dataRetentionDays: 365,
    requiresExplicitConsent: true,
    requiresDataDeletionOnRequest: true,
    requiresDataPortability: true,
    ageOfConsent: 18,
    cookieConsentRequired: true,
    crossBorderTransferRules: 'restricted',
    notificationRequiredForBreach: true,
    breachNotificationHours: 72,
    dataProtectionOfficerRequired: true,
    privacyImpactAssessmentRequired: true,
  },
  CANADA: {
    region: 'CANADA',
    name: 'Canadian Privacy Laws',
    regulations: ['PIPEDA', 'Quebec Law 25', 'CASL'],
    dataRetentionDays: 365,
    requiresExplicitConsent: true,
    requiresDataDeletionOnRequest: true,
    requiresDataPortability: true,
    ageOfConsent: 13,
    cookieConsentRequired: true,
    crossBorderTransferRules: 'restricted',
    notificationRequiredForBreach: true,
    breachNotificationHours: 72,
    dataProtectionOfficerRequired: true,
    privacyImpactAssessmentRequired: true,
  },
  AUSTRALIA: {
    region: 'AUSTRALIA',
    name: 'Australian Privacy Act',
    regulations: ['Privacy Act 1988', 'APPs', 'Notifiable Data Breaches Scheme'],
    dataRetentionDays: 365,
    requiresExplicitConsent: false,
    requiresDataDeletionOnRequest: true,
    requiresDataPortability: false,
    ageOfConsent: 15,
    cookieConsentRequired: false,
    crossBorderTransferRules: 'restricted',
    notificationRequiredForBreach: true,
    breachNotificationHours: 72,
    dataProtectionOfficerRequired: false,
    privacyImpactAssessmentRequired: true,
  },
  INDIA: {
    region: 'INDIA',
    name: 'Digital Personal Data Protection Act',
    regulations: ['DPDPA 2023', 'IT Act 2000', 'SPDI Rules'],
    dataRetentionDays: 365,
    requiresExplicitConsent: true,
    requiresDataDeletionOnRequest: true,
    requiresDataPortability: true,
    ageOfConsent: 18,
    cookieConsentRequired: true,
    crossBorderTransferRules: 'restricted',
    notificationRequiredForBreach: true,
    breachNotificationHours: 72,
    dataProtectionOfficerRequired: true,
    privacyImpactAssessmentRequired: true,
  },
  CHINA: {
    region: 'CHINA',
    name: 'China Data Protection Laws',
    regulations: ['PIPL', 'CSL', 'DSL'],
    dataRetentionDays: 365,
    requiresExplicitConsent: true,
    requiresDataDeletionOnRequest: true,
    requiresDataPortability: true,
    ageOfConsent: 14,
    cookieConsentRequired: true,
    crossBorderTransferRules: 'prohibited',
    notificationRequiredForBreach: true,
    breachNotificationHours: 24,
    dataProtectionOfficerRequired: true,
    privacyImpactAssessmentRequired: true,
  },
  JAPAN: {
    region: 'JAPAN',
    name: 'Act on Protection of Personal Information',
    regulations: ['APPI', 'PIPA Guidelines'],
    dataRetentionDays: 365,
    requiresExplicitConsent: true,
    requiresDataDeletionOnRequest: true,
    requiresDataPortability: true,
    ageOfConsent: 16,
    cookieConsentRequired: false,
    crossBorderTransferRules: 'restricted',
    notificationRequiredForBreach: true,
    breachNotificationHours: 72,
    dataProtectionOfficerRequired: false,
    privacyImpactAssessmentRequired: true,
  },
  KOREA: {
    region: 'KOREA',
    name: 'Personal Information Protection Act',
    regulations: ['PIPA', 'ICT Network Act', 'Credit Information Act'],
    dataRetentionDays: 365,
    requiresExplicitConsent: true,
    requiresDataDeletionOnRequest: true,
    requiresDataPortability: true,
    ageOfConsent: 14,
    cookieConsentRequired: true,
    crossBorderTransferRules: 'restricted',
    notificationRequiredForBreach: true,
    breachNotificationHours: 24,
    dataProtectionOfficerRequired: true,
    privacyImpactAssessmentRequired: true,
  },
};

// ═══════════════════════════════════════════════════════════════════
// REGIONAL CONTENT POLICIES
// ═══════════════════════════════════════════════════════════════════

export const REGIONAL_CONTENT_POLICIES: Record<ComplianceRegion, RegionalContentPolicy> = {
  EU: {
    region: 'EU',
    adultContentAllowed: false,
    violenceLevel: 'moderate',
    religiousSensitivity: 'moderate',
    politicalContentRestricted: false,
    gamblingContentAllowed: true,
    alcoholContentAllowed: true,
    tobaccoContentAllowed: false,
    cannabisContentAllowed: false,
    weaponryContentAllowed: false,
    lgbtqContentRestricted: false,
    profanityLevel: 'moderate',
    customPatterns: [],
  },
  UK: {
    region: 'UK',
    adultContentAllowed: false,
    violenceLevel: 'moderate',
    religiousSensitivity: 'moderate',
    politicalContentRestricted: false,
    gamblingContentAllowed: true,
    alcoholContentAllowed: true,
    tobaccoContentAllowed: false,
    cannabisContentAllowed: false,
    weaponryContentAllowed: false,
    lgbtqContentRestricted: false,
    profanityLevel: 'moderate',
    customPatterns: [],
  },
  US: {
    region: 'US',
    adultContentAllowed: false,
    violenceLevel: 'moderate',
    religiousSensitivity: 'standard',
    politicalContentRestricted: false,
    gamblingContentAllowed: true,
    alcoholContentAllowed: true,
    tobaccoContentAllowed: true,
    cannabisContentAllowed: false,
    weaponryContentAllowed: true,
    lgbtqContentRestricted: false,
    profanityLevel: 'standard',
    customPatterns: [],
  },
  MENA: {
    region: 'MENA',
    adultContentAllowed: false,
    violenceLevel: 'strict',
    religiousSensitivity: 'strict',
    politicalContentRestricted: true,
    gamblingContentAllowed: false,
    alcoholContentAllowed: false,
    tobaccoContentAllowed: false,
    cannabisContentAllowed: false,
    weaponryContentAllowed: false,
    lgbtqContentRestricted: true,
    profanityLevel: 'strict',
    customPatterns: [
      /\b(allah|prophet|quran|islam)\b/i, // Religious terms requiring sensitivity
      /\b(haram|halal)\b/i, // Cultural terms
      /\b(pork|bacon|ham|wine|beer|vodka|whiskey)\b/i, // Prohibited substances
    ],
  },
  APAC: {
    region: 'APAC',
    adultContentAllowed: false,
    violenceLevel: 'moderate',
    religiousSensitivity: 'moderate',
    politicalContentRestricted: true,
    gamblingContentAllowed: false,
    alcoholContentAllowed: true,
    tobaccoContentAllowed: false,
    cannabisContentAllowed: false,
    weaponryContentAllowed: false,
    lgbtqContentRestricted: false,
    profanityLevel: 'moderate',
    customPatterns: [],
  },
  LATAM: {
    region: 'LATAM',
    adultContentAllowed: false,
    violenceLevel: 'moderate',
    religiousSensitivity: 'moderate',
    politicalContentRestricted: false,
    gamblingContentAllowed: true,
    alcoholContentAllowed: true,
    tobaccoContentAllowed: true,
    cannabisContentAllowed: false,
    weaponryContentAllowed: false,
    lgbtqContentRestricted: false,
    profanityLevel: 'standard',
    customPatterns: [],
  },
  AFRICA: {
    region: 'AFRICA',
    adultContentAllowed: false,
    violenceLevel: 'strict',
    religiousSensitivity: 'strict',
    politicalContentRestricted: true,
    gamblingContentAllowed: false,
    alcoholContentAllowed: false,
    tobaccoContentAllowed: false,
    cannabisContentAllowed: false,
    weaponryContentAllowed: false,
    lgbtqContentRestricted: true,
    profanityLevel: 'strict',
    customPatterns: [],
  },
  CANADA: {
    region: 'CANADA',
    adultContentAllowed: false,
    violenceLevel: 'moderate',
    religiousSensitivity: 'standard',
    politicalContentRestricted: false,
    gamblingContentAllowed: true,
    alcoholContentAllowed: true,
    tobaccoContentAllowed: false,
    cannabisContentAllowed: true,
    weaponryContentAllowed: false,
    lgbtqContentRestricted: false,
    profanityLevel: 'standard',
    customPatterns: [],
  },
  AUSTRALIA: {
    region: 'AUSTRALIA',
    adultContentAllowed: false,
    violenceLevel: 'moderate',
    religiousSensitivity: 'standard',
    politicalContentRestricted: false,
    gamblingContentAllowed: true,
    alcoholContentAllowed: true,
    tobaccoContentAllowed: false,
    cannabisContentAllowed: false,
    weaponryContentAllowed: false,
    lgbtqContentRestricted: false,
    profanityLevel: 'standard',
    customPatterns: [],
  },
  INDIA: {
    region: 'INDIA',
    adultContentAllowed: false,
    violenceLevel: 'strict',
    religiousSensitivity: 'strict',
    politicalContentRestricted: true,
    gamblingContentAllowed: false,
    alcoholContentAllowed: false,
    tobaccoContentAllowed: false,
    cannabisContentAllowed: false,
    weaponryContentAllowed: false,
    lgbtqContentRestricted: true,
    profanityLevel: 'strict',
    customPatterns: [
      /\b(beef|cow|sacred)\b/i, // Cultural sensitivity
    ],
  },
  CHINA: {
    region: 'CHINA',
    adultContentAllowed: false,
    violenceLevel: 'strict',
    religiousSensitivity: 'strict',
    politicalContentRestricted: true,
    gamblingContentAllowed: false,
    alcoholContentAllowed: true,
    tobaccoContentAllowed: false,
    cannabisContentAllowed: false,
    weaponryContentAllowed: false,
    lgbtqContentRestricted: true,
    profanityLevel: 'strict',
    customPatterns: [
      /\b(tiananmen|falun|gong|tibet|taiwan\s+independence)\b/i, // Political sensitivity
    ],
  },
  JAPAN: {
    region: 'JAPAN',
    adultContentAllowed: false,
    violenceLevel: 'moderate',
    religiousSensitivity: 'standard',
    politicalContentRestricted: false,
    gamblingContentAllowed: true,
    alcoholContentAllowed: true,
    tobaccoContentAllowed: true,
    cannabisContentAllowed: false,
    weaponryContentAllowed: false,
    lgbtqContentRestricted: false,
    profanityLevel: 'moderate',
    customPatterns: [],
  },
  KOREA: {
    region: 'KOREA',
    adultContentAllowed: false,
    violenceLevel: 'moderate',
    religiousSensitivity: 'moderate',
    politicalContentRestricted: true,
    gamblingContentAllowed: false,
    alcoholContentAllowed: true,
    tobaccoContentAllowed: false,
    cannabisContentAllowed: false,
    weaponryContentAllowed: false,
    lgbtqContentRestricted: false,
    profanityLevel: 'moderate',
    customPatterns: [
      /\b(north\s+korea|dprk|kim\s+jong)\b/i, // Political sensitivity
    ],
  },
};

// ═══════════════════════════════════════════════════════════════════
// REGIONAL TERMS OF SERVICE
// ═══════════════════════════════════════════════════════════════════

export const REGIONAL_TERMS: Record<ComplianceRegion, RegionalTermsOfService> = {
  EU: {
    region: 'EU',
    governingLaw: 'Laws of the European Union and Member States',
    disputeResolution: 'court',
    jurisdictionCourt: 'Courts of the Member State of residence',
    consumerProtectionLaws: ['Consumer Rights Directive', 'UCPD', 'CRD'],
    cancelationPeriodDays: 14,
    automaticRenewalDisclosure: true,
    priceTransparencyRequired: true,
    classActionWaiverAllowed: false,
    arbitrationOptOutPeriodDays: 0,
  },
  UK: {
    region: 'UK',
    governingLaw: 'Laws of England and Wales',
    disputeResolution: 'court',
    jurisdictionCourt: 'Courts of England and Wales',
    consumerProtectionLaws: ['Consumer Rights Act 2015', 'CCRs'],
    cancelationPeriodDays: 14,
    automaticRenewalDisclosure: true,
    priceTransparencyRequired: true,
    classActionWaiverAllowed: false,
    arbitrationOptOutPeriodDays: 0,
  },
  US: {
    region: 'US',
    governingLaw: 'Laws of the State of Delaware',
    disputeResolution: 'arbitration',
    jurisdictionCourt: 'State and Federal Courts of Delaware',
    consumerProtectionLaws: ['FTC Act', 'State Consumer Protection Laws'],
    cancelationPeriodDays: 3,
    automaticRenewalDisclosure: true,
    priceTransparencyRequired: true,
    classActionWaiverAllowed: true,
    arbitrationOptOutPeriodDays: 30,
  },
  MENA: {
    region: 'MENA',
    governingLaw: 'Laws of the United Arab Emirates',
    disputeResolution: 'arbitration',
    jurisdictionCourt: 'DIFC Courts or local courts',
    consumerProtectionLaws: ['UAE Consumer Protection Law', 'E-Commerce Law'],
    cancelationPeriodDays: 7,
    automaticRenewalDisclosure: true,
    priceTransparencyRequired: true,
    classActionWaiverAllowed: true,
    arbitrationOptOutPeriodDays: 0,
  },
  APAC: {
    region: 'APAC',
    governingLaw: 'Laws of Singapore',
    disputeResolution: 'arbitration',
    jurisdictionCourt: 'Singapore International Arbitration Centre',
    consumerProtectionLaws: ['Consumer Protection (Fair Trading) Act', 'PDPA'],
    cancelationPeriodDays: 7,
    automaticRenewalDisclosure: true,
    priceTransparencyRequired: true,
    classActionWaiverAllowed: true,
    arbitrationOptOutPeriodDays: 0,
  },
  LATAM: {
    region: 'LATAM',
    governingLaw: 'Laws of Brazil',
    disputeResolution: 'court',
    jurisdictionCourt: 'Courts of São Paulo, Brazil',
    consumerProtectionLaws: ['CDC (Consumer Defense Code)', 'Marco Civil'],
    cancelationPeriodDays: 7,
    automaticRenewalDisclosure: true,
    priceTransparencyRequired: true,
    classActionWaiverAllowed: false,
    arbitrationOptOutPeriodDays: 0,
  },
  AFRICA: {
    region: 'AFRICA',
    governingLaw: 'Laws of South Africa',
    disputeResolution: 'arbitration',
    jurisdictionCourt: 'Courts of South Africa',
    consumerProtectionLaws: ['Consumer Protection Act', 'ECTA'],
    cancelationPeriodDays: 5,
    automaticRenewalDisclosure: true,
    priceTransparencyRequired: true,
    classActionWaiverAllowed: true,
    arbitrationOptOutPeriodDays: 0,
  },
  CANADA: {
    region: 'CANADA',
    governingLaw: 'Laws of Ontario, Canada',
    disputeResolution: 'court',
    jurisdictionCourt: 'Courts of Ontario',
    consumerProtectionLaws: ['CPA (Ontario)', 'Competition Act'],
    cancelationPeriodDays: 10,
    automaticRenewalDisclosure: true,
    priceTransparencyRequired: true,
    classActionWaiverAllowed: false,
    arbitrationOptOutPeriodDays: 0,
  },
  AUSTRALIA: {
    region: 'AUSTRALIA',
    governingLaw: 'Laws of New South Wales, Australia',
    disputeResolution: 'court',
    jurisdictionCourt: 'Courts of New South Wales',
    consumerProtectionLaws: ['Australian Consumer Law', 'ACL'],
    cancelationPeriodDays: 10,
    automaticRenewalDisclosure: true,
    priceTransparencyRequired: true,
    classActionWaiverAllowed: false,
    arbitrationOptOutPeriodDays: 0,
  },
  INDIA: {
    region: 'INDIA',
    governingLaw: 'Laws of India',
    disputeResolution: 'arbitration',
    jurisdictionCourt: 'Courts of New Delhi',
    consumerProtectionLaws: ['Consumer Protection Act 2019', 'IT Act'],
    cancelationPeriodDays: 7,
    automaticRenewalDisclosure: true,
    priceTransparencyRequired: true,
    classActionWaiverAllowed: false,
    arbitrationOptOutPeriodDays: 0,
  },
  CHINA: {
    region: 'CHINA',
    governingLaw: 'Laws of the People\'s Republic of China',
    disputeResolution: 'arbitration',
    jurisdictionCourt: 'CIETAC or Shanghai Courts',
    consumerProtectionLaws: ['Consumer Rights Protection Law', 'E-Commerce Law'],
    cancelationPeriodDays: 7,
    automaticRenewalDisclosure: true,
    priceTransparencyRequired: true,
    classActionWaiverAllowed: true,
    arbitrationOptOutPeriodDays: 0,
  },
  JAPAN: {
    region: 'JAPAN',
    governingLaw: 'Laws of Japan',
    disputeResolution: 'court',
    jurisdictionCourt: 'Tokyo District Court',
    consumerProtectionLaws: ['Consumer Contract Act', 'Act on Specified Commercial Transactions'],
    cancelationPeriodDays: 8,
    automaticRenewalDisclosure: true,
    priceTransparencyRequired: true,
    classActionWaiverAllowed: false,
    arbitrationOptOutPeriodDays: 0,
  },
  KOREA: {
    region: 'KOREA',
    governingLaw: 'Laws of the Republic of Korea',
    disputeResolution: 'court',
    jurisdictionCourt: 'Seoul Central District Court',
    consumerProtectionLaws: ['Consumer Protection Act', 'E-Commerce Act'],
    cancelationPeriodDays: 7,
    automaticRenewalDisclosure: true,
    priceTransparencyRequired: true,
    classActionWaiverAllowed: false,
    arbitrationOptOutPeriodDays: 0,
  },
};

// ═══════════════════════════════════════════════════════════════════
// COUNTRY TO REGION MAPPING
// ═══════════════════════════════════════════════════════════════════

export const COUNTRY_TO_REGION: Record<string, ComplianceRegion> = {
  // EU Countries
  AT: 'EU', BE: 'EU', BG: 'EU', HR: 'EU', CY: 'EU', CZ: 'EU', DK: 'EU',
  EE: 'EU', FI: 'EU', FR: 'EU', DE: 'EU', GR: 'EU', HU: 'EU', IE: 'EU',
  IT: 'EU', LV: 'EU', LT: 'EU', LU: 'EU', MT: 'EU', NL: 'EU', PL: 'EU',
  PT: 'EU', RO: 'EU', SK: 'EU', SI: 'EU', ES: 'EU', SE: 'EU',
  // UK
  GB: 'UK',
  // US
  US: 'US',
  // MENA
  AE: 'MENA', SA: 'MENA', QA: 'MENA', KW: 'MENA', BH: 'MENA', OM: 'MENA',
  EG: 'MENA', JO: 'MENA', LB: 'MENA', IQ: 'MENA', MA: 'MENA', TN: 'MENA',
  DZ: 'MENA', LY: 'MENA', YE: 'MENA', PS: 'MENA',
  // APAC
  SG: 'APAC', TH: 'APAC', MY: 'APAC', ID: 'APAC', PH: 'APAC', VN: 'APAC',
  HK: 'APAC', TW: 'APAC',
  // Individual countries
  JP: 'JAPAN', KR: 'KOREA', CN: 'CHINA', IN: 'INDIA',
  CA: 'CANADA', AU: 'AUSTRALIA', NZ: 'AUSTRALIA',
  // LATAM
  BR: 'LATAM', MX: 'LATAM', AR: 'LATAM', CL: 'LATAM', CO: 'LATAM',
  PE: 'LATAM', VE: 'LATAM', EC: 'LATAM', BO: 'LATAM', UY: 'LATAM',
  PY: 'LATAM', CR: 'LATAM', PA: 'LATAM', GT: 'LATAM', DO: 'LATAM',
  // Africa
  ZA: 'AFRICA', NG: 'AFRICA', KE: 'AFRICA', GH: 'AFRICA', TZ: 'AFRICA',
  UG: 'AFRICA', RW: 'AFRICA', ET: 'AFRICA', SN: 'AFRICA', CM: 'AFRICA',
};

// ═══════════════════════════════════════════════════════════════════
// UTILITY FUNCTIONS
// ═══════════════════════════════════════════════════════════════════

/**
 * Get region from country code
 */
export function getRegionFromCountry(countryCode: string): ComplianceRegion {
  return COUNTRY_TO_REGION[countryCode.toUpperCase()] || 'US';
}

/**
 * Get privacy policy for a region
 */
export function getPrivacyPolicy(region: ComplianceRegion): RegionalPrivacyPolicy {
  return REGIONAL_PRIVACY_POLICIES[region];
}

/**
 * Get content policy for a region
 */
export function getContentPolicy(region: ComplianceRegion): RegionalContentPolicy {
  return REGIONAL_CONTENT_POLICIES[region];
}

/**
 * Get terms of service for a region
 */
export function getTermsOfService(region: ComplianceRegion): RegionalTermsOfService {
  return REGIONAL_TERMS[region];
}

/**
 * Get full compliance config for a country
 */
export function getFullComplianceConfig(countryCode: string) {
  const region = getRegionFromCountry(countryCode);
  return {
    region,
    privacy: getPrivacyPolicy(region),
    content: getContentPolicy(region),
    terms: getTermsOfService(region),
  };
}

export default {
  REGIONAL_PRIVACY_POLICIES,
  REGIONAL_CONTENT_POLICIES,
  REGIONAL_TERMS,
  COUNTRY_TO_REGION,
  getRegionFromCountry,
  getPrivacyPolicy,
  getContentPolicy,
  getTermsOfService,
  getFullComplianceConfig,
};
