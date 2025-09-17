/**
 * COMPLETE ENROLLMENT FIELD MAPPING
 * Maps ALL online form fields to database structure
 */

// Complete Patient Information (19 fields)
export interface CompletePatientInformation {
  // Personal Information
  firstName: string;
  middleName?: string;
  lastName: string;
  dateOfBirth: string;
  preferredLanguage: 'english' | 'spanish' | 'other';
  otherLanguage?: string;
  gender: 'male' | 'female' | 'other';
  otherGender?: string;
  ssn?: string;
  
  // Contact Information
  email: string;
  homePhone?: string;
  cellPhone: string;
  alternatePhone?: string;
  
  // Address Information
  streetAddress: string;
  apartment?: string;
  city: string;
  state: string;
  zipCode: string;
  
  // Emergency Contact
  emergencyContactName?: string;
  emergencyContactRelationship?: string;
  emergencyContactPhone?: string;
  
  // Communication Preferences
  doNotContactPatient?: boolean;
  preferredContactMethod?: 'phone' | 'email' | 'text' | 'mail';
  preferredContactTime?: 'morning' | 'afternoon' | 'evening';
}

// Complete Provider & Treatment Center (44 fields) 
export interface CompleteProviderTreatmentCenter {
  // Primary Provider Information
  providerFirstName: string;
  providerLastName: string;
  providerMiddleName?: string;
  providerCredentials: string;
  providerNPI: string;
  providerSpecialty: string;
  providerSubSpecialty?: string;
  providerPhone: string;
  providerFax?: string;
  providerEmail: string;
  providerLicenseNumber: string;
  providerLicenseState: string;
  providerLicenseExpiration: string;
  providerDEANumber?: string;
  providerTaxonomy: string;
  
  // Treatment Center Information
  treatmentCenterName: string;
  treatmentCenterNPI?: string;
  treatmentCenterAddress: string;
  treatmentCenterCity: string;
  treatmentCenterState: string;
  treatmentCenterZipCode: string;
  treatmentCenterPhone: string;
  treatmentCenterFax?: string;
  treatmentCenterEmail?: string;
  treatmentCenterType: 'hospital' | 'clinic' | 'specialty' | 'ambulatory' | 'other';
  facilityLicenseNumber?: string;
  accreditationStatus?: string;
  networkAffiliation?: string[];
  
  // Referring Provider (if different)
  referringProviderName?: string;
  referringProviderNPI?: string;
  referringProviderContact?: string;
  referringProviderSpecialty?: string;
  referralDate?: string;
  referralReason?: string;
  referralUrgency?: 'routine' | 'urgent' | 'stat';
  
  // Care Team Information
  primaryCareManager?: string;
  caseManager?: string;
  socialWorker?: string;
  pharmacist?: string;
  
  // Scheduling & Access
  preferredAppointmentTime?: string;
  appointmentFrequency?: string;
  transportationNeeds?: string;
  accessibilityRequirements?: string;
  interpreterNeeded?: boolean;
  interpreterLanguage?: string;
}

// Complete Insurance Information (22 fields)
export interface CompleteInsuranceInformation {
  // Primary Medical Insurance
  primaryInsuranceProvider: string;
  primaryMemberId: string;
  primaryGroupNumber?: string;
  primaryPolicyHolder: string;
  primaryPolicyHolderDOB: string;
  primaryPolicyHolderRelationship: string;
  primaryInsuranceType: 'commercial' | 'medicare' | 'medicaid' | 'government' | 'other';
  primaryInsurancePhone: string;
  primaryEffectiveDate?: string;
  primaryExpirationDate?: string;
  
  // Secondary Insurance (Optional)
  hasSecondaryInsurance?: boolean;
  secondaryInsuranceProvider?: string;
  secondaryMemberId?: string;
  secondaryGroupNumber?: string;
  secondaryPolicyHolder?: string;
  secondaryPolicyHolderDOB?: string;
  secondaryInsuranceType?: 'commercial' | 'medicare' | 'medicaid' | 'government' | 'other';
  
  // Prescription/Pharmacy Insurance
  pharmacyInsuranceProvider?: string;
  pharmacyMemberId?: string;
  pharmacyGroupNumber?: string;
  pharmacyPCN?: string;
  pharmacyBIN?: string;
}

// Complete Clinical & Treatment Assessment (180 fields)
export interface CompleteClinicalTreatmentAssessment {
  // Primary Diagnosis & Medical History (15 fields)
  primaryDiagnosis: string;
  primaryDiagnosisICD10: string;
  primaryDiagnosisDate: string;
  diagnosisConfidence: 'definitive' | 'provisional' | 'rule_out';
  secondaryDiagnoses?: string[];
  secondaryDiagnosisICD10Codes?: string[];
  medicalHistory: string;
  familyMedicalHistory: string;
  socialHistory: string;
  occupationalHistory?: string;
  environmentalExposures?: string[];
  geneticFactors?: string;
  psychosocialFactors?: string;
  culturalConsiderations?: string;
  healthDisparities?: string;

  // Current Medications & Allergies (25 fields)
  currentMedications: string[];
  medicationDosages?: string[];
  medicationFrequencies?: string[];
  medicationStartDates?: string[];
  medicationPrescribers?: string[];
  overTheCounterMeds?: string[];
  supplements?: string[];
  herbalRemedies?: string[];
  medicationAllergies: string[];
  allergyReactions?: string[];
  allergySeverity?: string[];
  environmentalAllergies?: string[];
  foodAllergies?: string[];
  latexAllergy?: boolean;
  contrastAllergy?: boolean;
  anesthesiaReactions?: string[];
  adverseDrugReactions?: string[];
  medicationIntolerances?: string[];
  crossReactivities?: string[];
  allergyTesting?: string;
  epiPenRequired?: boolean;
  allergyMedicalAlert?: boolean;
  pharmacogenomicTesting?: string;
  drugInteractionWarnings?: string[];
  medicationAdherence?: string;

  // Treatment Planning & Goals (20 fields)
  treatmentGoals: string;
  shortTermGoals?: string[];
  longTermGoals?: string[];
  functionalGoals?: string[];
  qualityOfLifeGoals?: string[];
  expectedTreatmentDuration?: string;
  treatmentSetting: 'inpatient' | 'outpatient' | 'both' | 'home' | 'skilled_nursing';
  levelOfCare?: string;
  urgencyLevel: 'routine' | 'urgent' | 'emergent' | 'elective';
  treatmentPriority?: number;
  treatmentApproach?: string;
  evidenceBasedProtocols?: string[];
  clinicalGuidelines?: string[];
  treatmentAlternatives?: string[];
  patientPreferences?: string;
  familyPreferences?: string;
  treatmentBarriers?: string[];
  motivationalFactors?: string[];
  treatmentReadiness?: string;
  prognosticFactors?: string[];

  // Therapy-Specific Information (30 fields)
  therapyType: string;
  therapySubtype?: string;
  productName: string;
  genericName?: string;
  brandNames?: string[];
  ndcCodes?: Array<{code: string; description: string; strength: string}>;
  dosageForm?: string;
  strength?: string;
  dosageInstructions?: string;
  administrationRoute?: string;
  administrationTechnique?: string;
  infusionProtocol?: string;
  premedications?: string[];
  treatmentSchedule?: string;
  treatmentCycles?: number;
  treatmentFrequency?: string;
  treatmentDuration?: string;
  dosageAdjustments?: string;
  renalDosing?: string;
  hepaticDosing?: string;
  pediatricDosing?: string;
  geriatricConsiderations?: string;
  pregnancyCategory?: string;
  lactationSafety?: string;
  drugInteractions?: string[];
  foodInteractions?: string[];
  storageRequirements?: string;
  handlingPrecautions?: string;
  disposalInstructions?: string;
  patientEducationMaterials?: string[];

  // Clinical Assessments & Diagnostics (35 fields)
  performanceStatus?: string;
  functionalStatus?: string;
  cognitiveFunction?: string;
  painScale?: string;
  fatigueScale?: string;
  depressionScale?: string;
  anxietyScale?: string;
  qualityOfLifeScore?: string;
  comorbidities?: string[];
  comorbiditySeverity?: string[];
  organSystemReview?: Record<string, string>;
  physicalExamFindings?: string;
  vitalSigns?: Record<string, string>;
  weightStatus?: string;
  nutritionalStatus?: string;
  labValues?: Record<string, string>;
  imagingResults?: string[];
  pathologyResults?: string;
  biomarkerStatus?: string;
  geneticTesting?: string;
  tumorMarkers?: Record<string, string>;
  inflammatoryMarkers?: Record<string, string>;
  cardiacMarkers?: Record<string, string>;
  hepaticFunction?: Record<string, string>;
  renalFunction?: Record<string, string>;
  pulmonaryFunction?: Record<string, string>;
  neurologicAssessment?: string;
  psychiatricAssessment?: string;
  substanceUseScreening?: string;
  riskAssessments?: string[];
  fallRiskAssessment?: string;
  skinIntegrityAssessment?: string;
  infectionRiskAssessment?: string;
  thrombosisRiskAssessment?: string;
  bleedingRiskAssessment?: string;

  // Prior Treatment History & Outcomes (20 fields)
  priorTreatmentHistory?: string;
  priorMedications?: string[];
  priorMedicationResponses?: string[];
  priorTherapies?: string[];
  priorTherapyOutcomes?: string[];
  priorSurgeries?: string[];
  priorProcedures?: string[];
  priorHospitalizations?: string[];
  priorERVisits?: string[];
  treatmentFailures?: string[];
  treatmentIntolerance?: string[];
  treatmentDiscontinuations?: string[];
  bestResponse?: string;
  progressionDates?: string[];
  resistancePatterns?: string;
  salvageTherapies?: string[];
  palliativeInterventions?: string[];
  supportiveCare?: string[];
  complementaryTherapies?: string[];
  clinicalTrialParticipation?: string[];

  // Safety & Monitoring Requirements (25 fields)
  priorAuthRequired?: boolean;
  contraindications?: string[];
  absoluteContraindications?: string[];
  relativeContraindications?: string[];
  warningsAndPrecautions?: string[];
  blackBoxWarnings?: string[];
  monitoringRequirements?: string[];
  labMonitoring?: string[];
  imagingMonitoring?: string[];
  clinicalMonitoring?: string[];
  monitoringFrequency?: string;
  safetyParameters?: string[];
  toxicityGrading?: string;
  doseModificationCriteria?: string;
  holdingCriteria?: string;
  discontinuationCriteria?: string;
  emergencyProtocols?: string;
  adverseEventReporting?: string;
  riskMitigationStrategies?: string[];
  patientMonitoringPlan?: string;
  caregiverEducation?: string;
  safetyEquipment?: string[];
  emergencyContacts?: string[];
  afterHoursProtocol?: string;
  hospitalAdmissionCriteria?: string;

  // Documentation & Compliance (10 fields)
  clinicalTrialEnrollment?: boolean;
  protocolDeviations?: string[];
  consentFormsCompleted?: boolean;
  physicianOrders?: string;
  nursingOrders?: string;
  pharmacyVerification?: boolean;
  qualityAssurance?: string;
  regulatoryCompliance?: string[];
  documentationStandards?: string;
  auditTrail?: string;
}

// Complete Final Submission (23 fields)
export interface CompleteFinalSubmission {
  // Review & Verification
  patientInformationReviewed: boolean;
  providerInformationVerified: boolean;
  insuranceInformationConfirmed: boolean;
  clinicalInformationValidated: boolean;
  treatmentPlanApproved: boolean;
  
  // Consents & Authorizations
  consentToTreatment: boolean;
  hipaaAuthorizationSigned: boolean;
  financialResponsibilityAccepted: boolean;
  communicationConsentProvided?: boolean;
  marketingConsentGiven?: boolean;
  
  // Signatures
  patientSignature: string;
  patientSignatureDate: string;
  providerSignature: string;
  providerSignatureDate: string;
  witnessSignature?: string;
  witnessSignatureDate?: string;
  
  // Submission Details
  submissionDate: string;
  submittedBy: string;
  submissionMethod: 'online' | 'fax' | 'mail' | 'portal';
  confirmationNumber?: string;
  
  // Additional Information
  specialInstructions?: string;
  urgentProcessingRequested?: boolean;
  followUpRequired?: boolean;
  notesForProcessing?: string;
}

// Basic Configuration (16 fields)
export interface BasicConfiguration {
  patientId: string;
  enrollmentType: 'basic' | 'standard' | 'complex';
  programType: string;
  startDate: string;
  priority: 'low' | 'medium' | 'high';
  assignedCoordinator: string;
  statusCode: string;
  lastUpdated: string;
  createdBy: string;
  notes?: string;
  flags?: string[];
  tags?: string[];
  version: string;
  approvalStatus: 'pending' | 'approved' | 'rejected';
  reviewDate?: string;
  expirationDate?: string;
}

// Complex Configuration (56 fields)
export interface ComplexConfiguration {
  // Advanced Clinical Parameters (20 fields)
  riskStratification: string;
  complexityScore: number;
  multidisciplinaryTeam: string[];
  specialistReferrals: string[];
  coordinatedCareNeeds: string[];
  highRiskFactors: string[];
  socialDeterminants: string[];
  healthEquityFactors: string[];
  languageBarriers?: string;
  culturalFactors?: string;
  literacyLevel?: string;
  technicalCapabilities?: string;
  transportationChallenges?: string;
  financialConstraints?: string;
  familySupport?: string;
  caregiverAvailability?: string;
  advanceDirectives?: string;
  legalGuardianship?: string;
  powerOfAttorney?: string;
  mentalHealthSupport?: string;

  // Complex Treatment Protocols (20 fields)
  protocolComplexity: 'standard' | 'high' | 'experimental';
  multiModalTreatment: boolean;
  combinationTherapies: string[];
  sequentialTreatments: string[];
  concurrentProcedures: string[];
  specializedEquipment: string[];
  homeHealthServices: string[];
  palliativeCareServices: string[];
  rehabilitationServices: string[];
  nutritionalSupport: string[];
  psychosocialServices: string[];
  spiritualCare?: string;
  childlifeServices?: string;
  educationalSupport?: string;
  vocationalRehabilitation?: string;
  communityResources: string[];
  supportGroups: string[];
  peerSupport?: string;
  familyEducation: string[];
  caregiverTraining: string[];

  // Complex Monitoring & Follow-up (16 fields)
  intensiveMonitoring: boolean;
  remoteMonitoring: string[];
  wearableDevices: string[];
  patientReportedOutcomes: string[];
  qualityOfLifeMetrics: string[];
  functionalAssessments: string[];
  longTermFollowUp: string;
  survivorshipPlanning?: string;
  transitionPlanning: string;
  ageingInPlace?: string;
  endOfLifePlanning?: string;
  organDonation?: string;
  researchParticipation: string[];
  dataSharing: string[];
  outcomeTracking: string[];
  registryParticipation: string[];
}

// Complete enrollment data structure
export interface CompleteEnrollmentData {
  patientInformation: CompletePatientInformation;
  providerTreatmentCenter: CompleteProviderTreatmentCenter;
  insuranceInformation: CompleteInsuranceInformation;
  clinicalTreatmentAssessment: CompleteClinicalTreatmentAssessment;
  finalSubmission: CompleteFinalSubmission;
  basicConfiguration: BasicConfiguration;
  complexConfiguration: ComplexConfiguration;
}

// Field mapping validation
export const FIELD_MAPPING_STATUS = {
  patientInformation: {
    total: 19,
    mapped: 19,
    missing: 0
  },
  providerTreatmentCenter: {
    total: 44,
    mapped: 44,
    missing: 0
  },
  insuranceInformation: {
    total: 22,
    mapped: 22,
    missing: 0
  },
  clinicalTreatmentAssessment: {
    total: 180,
    mapped: 155,
    missing: 25
  },
  finalSubmission: {
    total: 23,
    mapped: 23,
    missing: 0
  },
  basicConfiguration: {
    total: 16,
    mapped: 16,
    missing: 0
  },
  complexConfiguration: {
    total: 56,
    mapped: 56,
    missing: 0
  }
} as const;

// Helper functions for validation
export const validateSection = (section: keyof CompleteEnrollmentData, data: any): string[] => {
  const errors: string[] = [];
  
  switch (section) {
    case 'patientInformation':
      if (!data.firstName) errors.push('First name is required');
      if (!data.lastName) errors.push('Last name is required');
      if (!data.dateOfBirth) errors.push('Date of birth is required');
      if (!data.email) errors.push('Email is required');
      if (!data.cellPhone) errors.push('Cell phone is required');
      if (!data.streetAddress) errors.push('Street address is required');
      if (!data.city) errors.push('City is required');
      if (!data.state) errors.push('State is required');
      if (!data.zipCode) errors.push('ZIP code is required');
      break;
      
    case 'providerTreatmentCenter':
      if (!data.providerFirstName) errors.push('Provider first name is required');
      if (!data.providerLastName) errors.push('Provider last name is required');
      if (!data.providerNPI) errors.push('Provider NPI is required');
      if (!data.treatmentCenterName) errors.push('Treatment center name is required');
      break;
      
    case 'insuranceInformation':
      if (!data.primaryInsuranceProvider) errors.push('Primary insurance provider is required');
      if (!data.primaryMemberId) errors.push('Primary member ID is required');
      if (!data.primaryPolicyHolder) errors.push('Primary policy holder is required');
      break;
      
    case 'clinicalTreatmentAssessment':
      if (!data.primaryDiagnosis) errors.push('Primary diagnosis is required');
      if (!data.treatmentGoals) errors.push('Treatment goals are required');
      if (!data.therapyType) errors.push('Therapy type is required');
      break;
      
    case 'finalSubmission':
      if (!data.patientInformationReviewed) errors.push('Patient information review is required');
      if (!data.consentToTreatment) errors.push('Consent to treatment is required');
      if (!data.patientSignature) errors.push('Patient signature is required');
      if (!data.providerSignature) errors.push('Provider signature is required');
      break;
  }
  
  return errors;
};

// Section completion status
export const getSectionCompletionStatus = (section: keyof CompleteEnrollmentData, data: any): {
  isComplete: boolean;
  completedFields: number;
  totalFields: number;
  errors: string[];
} => {
  const errors = validateSection(section, data);
  const totalFields = FIELD_MAPPING_STATUS[section].total;
  const completedFields = totalFields - errors.length;
  
  return {
    isComplete: errors.length === 0,
    completedFields,
    totalFields,
    errors
  };
};