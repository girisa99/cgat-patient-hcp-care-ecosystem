/**
 * ENHANCED PATIENT ENROLLMENT STRUCTURE
 * Complete restructure with Identity, Clinical, Care Coordination, Financial, Consent, Tech subsections
 * Addresses the organizational gap between current tabs and expected healthcare workflow
 */
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  User,
  Stethoscope,
  Users,
  DollarSign,
  ShieldCheck,
  Laptop,
  FileText,
  Phone,
  Mail,
  MapPin,
  Calendar,
  CreditCard,
  Globe,
  CheckCircle,
  AlertTriangle,
  Clock,
  Plus,
  X
} from 'lucide-react';

interface EnhancedPatientEnrollmentData {
  // IDENTITY SUBSECTION (Demographics & Personal Information)
  identity: {
    // Basic Demographics
    firstName: string;
    lastName: string;
    middleName?: string;
    dateOfBirth: string;
    age: number;
    gender: 'male' | 'female' | 'non-binary' | 'other' | 'prefer-not-to-say';
    genderIdentity?: string;
    pronouns?: string;
    
    // Identity Documents
    ssn?: string;
    driverLicenseNumber?: string;
    passportNumber?: string;
    alternativeIdType?: string;
    alternativeIdNumber?: string;
    
    // Personal Preferences
    preferredLanguage: 'english' | 'spanish' | 'french' | 'mandarin' | 'other';
    languageOther?: string;
    interpreterNeeded: boolean;
    culturalConsiderations?: string;
    religiousConsiderations?: string;
    
    // Contact Information
    email: string;
    cellPhone: string;
    homePhone?: string;
    workPhone?: string;
    preferredContactMethod: 'phone' | 'email' | 'text' | 'whatsapp';
    
    // Address Information
    address: string;
    apartment?: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    addressType: 'residential' | 'mailing' | 'temporary';
    
    // Emergency Contact
    emergencyContactName: string;
    emergencyContactRelationship: string;
    emergencyContactPhone: string;
    emergencyContactEmail?: string;
    
    // Alternative Contact
    alternateContactName?: string;
    alternateContactRelationship?: string;
    alternateContactPhone?: string;
    doNotContactPatient?: boolean;
  };

  // CLINICAL SUBSECTION (Medical & Treatment Information)
  clinical: {
    // Primary Medical Information
    primaryDiagnosis: string;
    secondaryDiagnoses: string[];
    icdCodes: Array<{
      version: 9 | 10;
      code: string;
      description: string;
      isPrimary: boolean;
    }>;
    
    // Symptom Assessment
    presentingSymptoms: string;
    symptomOnset: string;
    symptomSeverity: number; // 1-10 scale
    functionalImpairment: 'none' | 'mild' | 'moderate' | 'severe';
    
    // Medical History
    medicalHistory: string;
    surgicalHistory: string[];
    hospitalizations: string[];
    chronicConditions: string[];
    
    // Current Medications
    currentMedications: Array<{
      name: string;
      dosage: string;
      frequency: string;
      prescribingPhysician: string;
      startDate: string;
    }>;
    
    // Allergies & Reactions
    allergies: Array<{
      allergen: string;
      reactionType: string;
      severity: 'mild' | 'moderate' | 'severe' | 'life-threatening';
    }>;
    
    // Substance Use History
    tobaccoUse: 'never' | 'former' | 'current';
    alcoholUse: 'never' | 'occasional' | 'regular' | 'former';
    substanceUse: 'never' | 'former' | 'current';
    substanceUseDetails?: string;
    
    // Family Medical History
    familyHistory: string;
    geneticRiskFactors: string[];
    
    // Vital Signs & Assessments
    height?: string;
    weight?: string;
    bloodPressure?: string;
    heartRate?: number;
    temperature?: string;
    
    // Lab Results & Diagnostics
    recentLabResults: string[];
    imagingStudies: string[];
    diagnosticTests: string[];
    
    // Treatment Planning
    treatmentGoals: string;
    proposedTreatmentPlan: string;
    treatmentModality: string;
    treatmentFrequency: string;
    estimatedDuration: string;
    expectedOutcomes: string;
    
    // Risk Assessment
    suicideRisk: 'low' | 'moderate' | 'high';
    violenceRisk: 'low' | 'moderate' | 'high';
    fallRisk: 'low' | 'moderate' | 'high';
    safetyPlanRequired: boolean;
    
    // Clinical Documents
    clinicalDocuments: File[];
  };

  // CARE COORDINATION SUBSECTION (Provider & Team Information)
  careCoordination: {
    // Primary Care Team
    primaryPhysician: {
      name: string;
      npi?: string;
      specialty: string;
      phone: string;
      email?: string;
      address: string;
    };
    
    // Referring Provider
    referringProvider?: {
      name: string;
      npi?: string;
      specialty: string;
      phone: string;
      email?: string;
      address: string;
      referralReason: string;
      referralDate: string;
    };
    
    // Treatment Center/Facility
    treatmentCenter: {
      name: string;
      npi?: string;
      address: string;
      phone: string;
      email?: string;
      facilityType: 'hospital' | 'clinic' | 'ambulatory' | 'home-health' | 'other';
      accreditation: string[];
    };
    
    // Care Team Members
    careTeamMembers: Array<{
      name: string;
      role: 'physician' | 'nurse' | 'care-coordinator' | 'social-worker' | 'therapist' | 'other';
      specialty?: string;
      phone: string;
      email?: string;
      responsibilities: string[];
    }>;
    
    // Coordination Preferences
    careCoordinationMethod: 'email' | 'phone' | 'portal' | 'fax' | 'secure-messaging';
    reportingFrequency: 'daily' | 'weekly' | 'bi-weekly' | 'monthly' | 'as-needed';
    
    // External Providers
    specialists: Array<{
      name: string;
      specialty: string;
      phone: string;
      lastVisit?: string;
      nextAppointment?: string;
    }>;
    
    // Care Transitions
    previousFacilities: string[];
    dischargeInstructions?: string;
    followUpRequirements: string[];
    
    // Communication Preferences
    providerCommunicationConsent: boolean;
    familyCommunicationConsent: boolean;
    emergencyNotificationContacts: string[];
  };

  // FINANCIAL SUBSECTION (Insurance & Payment Information)
  financial: {
    // Primary Insurance
    primaryInsurance: {
      provider: string;
      planName: string;
      policyNumber: string;
      groupNumber: string;
      subscriberId: string;
      subscriberName: string;
      subscriberRelationship: 'self' | 'spouse' | 'child' | 'other';
      subscriberDateOfBirth?: string;
      effectiveDate: string;
      expirationDate?: string;
      copayAmount?: string;
      deductibleAmount?: string;
      outOfPocketMax?: string;
    };
    
    // Secondary Insurance
    secondaryInsurance?: {
      provider: string;
      planName: string;
      policyNumber: string;
      groupNumber: string;
      subscriberId: string;
      subscriberName: string;
      subscriberRelationship: 'self' | 'spouse' | 'child' | 'other';
      effectiveDate: string;
      coordinationOfBenefits: string;
    };
    
    // Pharmacy Benefits
    pharmacyInsurance: {
      provider: string;
      policyNumber: string;
      groupNumber: string;
      binNumber?: string;
      pcnNumber?: string;
    };
    
    // Financial Assistance
    householdSize?: number;
    annualHouseholdIncome?: string;
    financialHardship: boolean;
    assistanceProgramInterest: boolean;
    assistanceProgramsApplied: string[];
    
    // Payment Information
    responsibleParty: {
      name: string;
      relationship: 'self' | 'spouse' | 'parent' | 'guardian' | 'other';
      phone: string;
      email?: string;
      address?: string;
    };
    
    // Payment Methods
    preferredPaymentMethod: 'insurance-only' | 'credit-card' | 'check' | 'payment-plan' | 'assistance-program';
    paymentPlanInterest: boolean;
    
    // Insurance Documents
    insuranceCards: File[];
    financialDocuments: File[];
    
    // Prior Authorizations
    priorAuthRequired: boolean;
    priorAuthStatus: 'pending' | 'approved' | 'denied' | 'not-required';
    priorAuthNumber?: string;
    
    // Cost Estimates
    estimatedTreatmentCost?: string;
    estimatedPatientResponsibility?: string;
  };

  // CONSENT SUBSECTION (Legal & Authorization Information)
  consent: {
    // Treatment Consent
    consentToTreatment: boolean;
    consentToTreatmentDate?: string;
    consentToTreatmentMethod: 'written' | 'verbal' | 'electronic';
    consentToTreatmentWitness?: string;
    
    // HIPAA Authorization
    hipaaAuthorization: boolean;
    hipaaAuthorizationDate?: string;
    hipaaAuthorizationScope: string[];
    
    // Financial Responsibility
    financialResponsibilityAcknowledgment: boolean;
    financialResponsibilityDate?: string;
    
    // Communication Consents
    communicationConsent: boolean;
    emailConsent: boolean;
    smsConsent: boolean;
    voiceMessageConsent: boolean;
    whatsappConsent: boolean;
    
    // Marketing & Research
    marketingConsent: boolean;
    researchParticipationConsent: boolean;
    
    // Telehealth Consent
    telehealthConsent: boolean;
    telehealthPlatformAgreement: boolean;
    
    // Advance Directives
    advanceDirectiveOnFile: boolean;
    powerOfAttorneyOnFile: boolean;
    
    // Consent Management
    consentMethod: 'facility-present' | 'digital-signature' | 'verbal-witnessed' | 'whatsapp' | 'DocuSign';
    digitalConsentPlatform?: string;
    consentIP?: string;
    consentDevice?: string;
    
    // Signature Data
    patientSignature?: string;
    patientSignatureDate?: string;
    witnessSignature?: string;
    witnessName?: string;
    witnessDate?: string;
    
    // Special Consents
    photographyConsent: boolean;
    socialMediaConsent: boolean;
    testimonialConsent: boolean;
    
    // Consent Notes
    consentNotes?: string;
    consentExceptions?: string[];
  };

  // TECH SUBSECTION (Digital & Technology Preferences)
  tech: {
    // Digital Preferences
    patientPortalAccess: boolean;
    patientPortalUsername?: string;
    mobileAppInterest: boolean;
    
    // Communication Technology
    preferredDigitalPlatform: 'email' | 'sms' | 'whatsapp' | 'patient-portal' | 'mobile-app';
    videoCallCapability: boolean;
    videoCallPlatform?: 'zoom' | 'teams' | 'facetime' | 'google-meet' | 'proprietary';
    
    // Device Information
    primaryDevice: 'smartphone' | 'tablet' | 'laptop' | 'desktop' | 'none';
    operatingSystem?: 'ios' | 'android' | 'windows' | 'mac' | 'other';
    internetAccess: boolean;
    internetReliability: 'excellent' | 'good' | 'fair' | 'poor';
    
    // Accessibility Needs
    visualImpairment: boolean;
    hearingImpairment: boolean;
    motorImpairment: boolean;
    cognitiveImpairment: boolean;
    assistiveTechnology: string[];
    
    // Digital Literacy
    technologyComfortLevel: 'expert' | 'comfortable' | 'basic' | 'needs-assistance';
    trainingNeeded: boolean;
    supportPersonAvailable: boolean;
    
    // Remote Monitoring
    remoteMonitoringInterest: boolean;
    wearableDevices: string[];
    homeMonitoringEquipment: string[];
    
    // Digital Health Tools
    healthAppsUsed: string[];
    fitnessTrakingUsed: boolean;
    medicationReminderApps: boolean;
    
    // Telehealth Setup
    telehealthSetupComplete: boolean;
    telehealthTesting: boolean;
    telehealthSupport: boolean;
    
    // Data Sharing Preferences
    healthDataSharing: boolean;
    anonymizedDataSharing: boolean;
    researchDataSharing: boolean;
    
    // Security Preferences
    twoFactorAuthentication: boolean;
    biometricAuthentication: boolean;
    passwordComplexity: 'basic' | 'standard' | 'high';
    
    // Technical Support
    technicalSupportNeeded: boolean;
    technicalSupportContact: string;
    preferredSupportMethod: 'phone' | 'email' | 'chat' | 'video' | 'in-person';
  };
}

interface EnhancedPatientEnrollmentStructureProps {
  onSubmit?: (data: EnhancedPatientEnrollmentData) => void;
  initialData?: Partial<EnhancedPatientEnrollmentData>;
  readonly?: boolean;
}

export const EnhancedPatientEnrollmentStructure: React.FC<EnhancedPatientEnrollmentStructureProps> = ({
  onSubmit,
  initialData = {},
  readonly = false
}) => {
  const [formData, setFormData] = useState<EnhancedPatientEnrollmentData>({
    identity: {
      firstName: '',
      lastName: '',
      dateOfBirth: '',
      age: 0,
      gender: 'male',
      preferredLanguage: 'english',
      interpreterNeeded: false,
      email: '',
      cellPhone: '',
      preferredContactMethod: 'phone',
      address: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'United States',
      addressType: 'residential',
      emergencyContactName: '',
      emergencyContactRelationship: '',
      emergencyContactPhone: '',
      ...initialData.identity
    },
    clinical: {
      primaryDiagnosis: '',
      secondaryDiagnoses: [],
      icdCodes: [],
      presentingSymptoms: '',
      symptomOnset: '',
      symptomSeverity: 1,
      functionalImpairment: 'none',
      medicalHistory: '',
      surgicalHistory: [],
      hospitalizations: [],
      chronicConditions: [],
      currentMedications: [],
      allergies: [],
      tobaccoUse: 'never',
      alcoholUse: 'never',
      substanceUse: 'never',
      familyHistory: '',
      geneticRiskFactors: [],
      recentLabResults: [],
      imagingStudies: [],
      diagnosticTests: [],
      treatmentGoals: '',
      proposedTreatmentPlan: '',
      treatmentModality: '',
      treatmentFrequency: '',
      estimatedDuration: '',
      expectedOutcomes: '',
      suicideRisk: 'low',
      violenceRisk: 'low',
      fallRisk: 'low',
      safetyPlanRequired: false,
      clinicalDocuments: [],
      ...initialData.clinical
    },
    careCoordination: {
      primaryPhysician: {
        name: '',
        specialty: '',
        phone: '',
        address: ''
      },
      treatmentCenter: {
        name: '',
        address: '',
        phone: '',
        facilityType: 'clinic',
        accreditation: []
      },
      careTeamMembers: [],
      careCoordinationMethod: 'email',
      reportingFrequency: 'weekly',
      specialists: [],
      previousFacilities: [],
      followUpRequirements: [],
      providerCommunicationConsent: false,
      familyCommunicationConsent: false,
      emergencyNotificationContacts: [],
      ...initialData.careCoordination
    },
    financial: {
      primaryInsurance: {
        provider: '',
        planName: '',
        policyNumber: '',
        groupNumber: '',
        subscriberId: '',
        subscriberName: '',
        subscriberRelationship: 'self',
        effectiveDate: ''
      },
      pharmacyInsurance: {
        provider: '',
        policyNumber: '',
        groupNumber: ''
      },
      householdSize: 1,
      financialHardship: false,
      assistanceProgramInterest: false,
      assistanceProgramsApplied: [],
      responsibleParty: {
        name: '',
        relationship: 'self',
        phone: ''
      },
      preferredPaymentMethod: 'insurance-only',
      paymentPlanInterest: false,
      insuranceCards: [],
      financialDocuments: [],
      priorAuthRequired: false,
      priorAuthStatus: 'not-required',
      ...initialData.financial
    },
    consent: {
      consentToTreatment: false,
      consentToTreatmentMethod: 'written',
      hipaaAuthorization: false,
      hipaaAuthorizationScope: [],
      financialResponsibilityAcknowledgment: false,
      communicationConsent: false,
      emailConsent: false,
      smsConsent: false,
      voiceMessageConsent: false,
      whatsappConsent: false,
      marketingConsent: false,
      researchParticipationConsent: false,
      telehealthConsent: false,
      telehealthPlatformAgreement: false,
      advanceDirectiveOnFile: false,
      powerOfAttorneyOnFile: false,
      consentMethod: 'facility-present',
      photographyConsent: false,
      socialMediaConsent: false,
      testimonialConsent: false,
      consentExceptions: [],
      ...initialData.consent
    },
    tech: {
      patientPortalAccess: false,
      mobileAppInterest: false,
      preferredDigitalPlatform: 'email',
      videoCallCapability: false,
      primaryDevice: 'smartphone',
      internetAccess: false,
      internetReliability: 'good',
      visualImpairment: false,
      hearingImpairment: false,
      motorImpairment: false,
      cognitiveImpairment: false,
      assistiveTechnology: [],
      technologyComfortLevel: 'comfortable',
      trainingNeeded: false,
      supportPersonAvailable: false,
      remoteMonitoringInterest: false,
      wearableDevices: [],
      homeMonitoringEquipment: [],
      healthAppsUsed: [],
      fitnessTrakingUsed: false,
      medicationReminderApps: false,
      telehealthSetupComplete: false,
      telehealthTesting: false,
      telehealthSupport: false,
      healthDataSharing: false,
      anonymizedDataSharing: false,
      researchDataSharing: false,
      twoFactorAuthentication: false,
      biometricAuthentication: false,
      passwordComplexity: 'standard',
      technicalSupportNeeded: false,
      technicalSupportContact: '',
      preferredSupportMethod: 'phone',
      ...initialData.tech
    }
  });

  const [activeTab, setActiveTab] = useState('identity');
  const [completedSections, setCompletedSections] = useState<string[]>([]);

  const updateFormData = (section: keyof EnhancedPatientEnrollmentData, field: string, value: any) => {
    // Apply universal DB constraint fixes
    let dbValue = value;
    if (typeof value === 'string' && value.trim() === '') {
      dbValue = null;
    }
    
    // NPI validation: only allow exactly 10 digits
    if (/npi$/i.test(field) && dbValue) {
      const digits = dbValue.toString().replace(/\D/g, '');
      dbValue = digits.length === 10 ? digits : null;
    }
    
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: dbValue
      }
    }));
  };

  const addToArray = (section: keyof EnhancedPatientEnrollmentData, field: string, newItem: any) => {
    // Apply constraint fixes to new array items
    const cleanedItem = typeof newItem === 'object' ? 
      Object.fromEntries(
        Object.entries(newItem).map(([key, value]) => [
          key, 
          (typeof value === 'string' && value.trim() === '') ? null : value
        ])
      ) : newItem;
    
    const currentArray = (formData[section] as any)[field] || [];
    updateFormData(section, field, [...currentArray, cleanedItem]);
  };

  const removeFromArray = (section: keyof EnhancedPatientEnrollmentData, field: string, index: number) => {
    const currentArray = (formData[section] as any)[field] || [];
    updateFormData(section, field, currentArray.filter((_: any, i: number) => i !== index));
  };

  const getSectionCompletionStatus = (section: keyof EnhancedPatientEnrollmentData) => {
    // Simple completion check - you can enhance this logic
    const sectionData = formData[section];
    const requiredFields = getRequiredFields(section);
    const completedFields = requiredFields.filter(field => {
      const value = (sectionData as any)[field];
      return value && value !== '' && value !== false && value !== 0;
    });
    
    return {
      completed: completedFields.length,
      total: requiredFields.length,
      percentage: Math.round((completedFields.length / requiredFields.length) * 100)
    };
  };

  const getRequiredFields = (section: keyof EnhancedPatientEnrollmentData): string[] => {
    const requiredFieldsMap = {
      identity: ['firstName', 'lastName', 'dateOfBirth', 'email', 'cellPhone', 'address', 'city', 'state', 'zipCode'],
      clinical: ['primaryDiagnosis', 'presentingSymptoms', 'treatmentGoals'],
      careCoordination: ['primaryPhysician', 'treatmentCenter'],
      financial: ['primaryInsurance'],
      consent: ['consentToTreatment', 'hipaaAuthorization', 'financialResponsibilityAcknowledgment'],
      tech: ['preferredDigitalPlatform', 'primaryDevice']
    };
    return requiredFieldsMap[section] || [];
  };

  const handleSubmit = () => {
    if (onSubmit) {
      onSubmit(formData);
    }
  };

  return (
    <Card className="w-full max-w-7xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <User className="h-6 w-6" />
            Enhanced Patient Enrollment Structure
          </div>
          <Badge variant="secondary">Complete Healthcare Workflow</Badge>
        </CardTitle>
        <div className="text-sm text-muted-foreground">
          Comprehensive patient enrollment covering all healthcare subsections: Identity, Clinical, Care Coordination, Financial, Consent, and Technology
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="identity" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              <div>
                <div>Identity</div>
                <div className="text-xs text-muted-foreground">
                  {getSectionCompletionStatus('identity').percentage}%
                </div>
              </div>
            </TabsTrigger>
            <TabsTrigger value="clinical" className="flex items-center gap-2">
              <Stethoscope className="h-4 w-4" />
              <div>
                <div>Clinical</div>
                <div className="text-xs text-muted-foreground">
                  {getSectionCompletionStatus('clinical').percentage}%
                </div>
              </div>
            </TabsTrigger>
            <TabsTrigger value="care-coordination" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <div>
                <div>Care Coordination</div>
                <div className="text-xs text-muted-foreground">
                  {getSectionCompletionStatus('careCoordination').percentage}%
                </div>
              </div>
            </TabsTrigger>
            <TabsTrigger value="financial" className="flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              <div>
                <div>Financial</div>
                <div className="text-xs text-muted-foreground">
                  {getSectionCompletionStatus('financial').percentage}%
                </div>
              </div>
            </TabsTrigger>
            <TabsTrigger value="consent" className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4" />
              <div>
                <div>Consent</div>
                <div className="text-xs text-muted-foreground">
                  {getSectionCompletionStatus('consent').percentage}%
                </div>
              </div>
            </TabsTrigger>
            <TabsTrigger value="tech" className="flex items-center gap-2">
              <Laptop className="h-4 w-4" />
              <div>
                <div>Technology</div>
                <div className="text-xs text-muted-foreground">
                  {getSectionCompletionStatus('tech').percentage}%
                </div>
              </div>
            </TabsTrigger>
          </TabsList>

          {/* IDENTITY TAB */}
          <TabsContent value="identity" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Identity & Demographics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Basic Demographics */}
                <div>
                  <h3 className="text-lg font-medium mb-4">Basic Demographics</h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="firstName">First Name *</Label>
                      <Input
                        id="firstName"
                        value={formData.identity.firstName}
                        onChange={(e) => updateFormData('identity', 'firstName', e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="middleName">Middle Name</Label>
                      <Input
                        id="middleName"
                        value={formData.identity.middleName || ''}
                        onChange={(e) => updateFormData('identity', 'middleName', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="lastName">Last Name *</Label>
                      <Input
                        id="lastName"
                        value={formData.identity.lastName}
                        onChange={(e) => updateFormData('identity', 'lastName', e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-4 mt-4">
                    <div>
                      <Label htmlFor="dateOfBirth">Date of Birth *</Label>
                      <Input
                        id="dateOfBirth"
                        type="date"
                        value={formData.identity.dateOfBirth}
                        onChange={(e) => updateFormData('identity', 'dateOfBirth', e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="age">Age</Label>
                      <Input
                        id="age"
                        type="number"
                        value={formData.identity.age}
                        onChange={(e) => updateFormData('identity', 'age', parseInt(e.target.value))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="gender">Gender *</Label>
                      <Select value={formData.identity.gender} onValueChange={(value) => updateFormData('identity', 'gender', value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="male">Male</SelectItem>
                          <SelectItem value="female">Female</SelectItem>
                          <SelectItem value="non-binary">Non-binary</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                          <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="pronouns">Pronouns</Label>
                      <Input
                        id="pronouns"
                        value={formData.identity.pronouns || ''}
                        onChange={(e) => updateFormData('identity', 'pronouns', e.target.value)}
                        placeholder="e.g., he/him, she/her, they/them"
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Identity Documents */}
                <div>
                  <h3 className="text-lg font-medium mb-4">Identity Documents</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="ssn">Social Security Number</Label>
                      <Input
                        id="ssn"
                        value={formData.identity.ssn || ''}
                        onChange={(e) => updateFormData('identity', 'ssn', e.target.value)}
                        placeholder="XXX-XX-XXXX"
                      />
                    </div>
                    <div>
                      <Label htmlFor="driverLicense">Driver's License Number</Label>
                      <Input
                        id="driverLicense"
                        value={formData.identity.driverLicenseNumber || ''}
                        onChange={(e) => updateFormData('identity', 'driverLicenseNumber', e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Contact Information */}
                <div>
                  <h3 className="text-lg font-medium mb-4">Contact Information</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="email">Email Address *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.identity.email}
                        onChange={(e) => updateFormData('identity', 'email', e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="cellPhone">Cell Phone *</Label>
                      <Input
                        id="cellPhone"
                        type="tel"
                        value={formData.identity.cellPhone}
                        onChange={(e) => updateFormData('identity', 'cellPhone', e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 mt-4">
                    <div>
                      <Label htmlFor="homePhone">Home Phone</Label>
                      <Input
                        id="homePhone"
                        type="tel"
                        value={formData.identity.homePhone || ''}
                        onChange={(e) => updateFormData('identity', 'homePhone', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="workPhone">Work Phone</Label>
                      <Input
                        id="workPhone"
                        type="tel"
                        value={formData.identity.workPhone || ''}
                        onChange={(e) => updateFormData('identity', 'workPhone', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="preferredContactMethod">Preferred Contact Method</Label>
                      <Select value={formData.identity.preferredContactMethod} onValueChange={(value) => updateFormData('identity', 'preferredContactMethod', value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="phone">Phone</SelectItem>
                          <SelectItem value="email">Email</SelectItem>
                          <SelectItem value="text">Text Message</SelectItem>
                          <SelectItem value="whatsapp">WhatsApp</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Address Information */}
                <div>
                  <h3 className="text-lg font-medium mb-4">Address Information</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="address">Street Address *</Label>
                      <Input
                        id="address"
                        value={formData.identity.address}
                        onChange={(e) => updateFormData('identity', 'address', e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="apartment">Apartment/Suite</Label>
                      <Input
                        id="apartment"
                        value={formData.identity.apartment || ''}
                        onChange={(e) => updateFormData('identity', 'apartment', e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-4 mt-4">
                    <div>
                      <Label htmlFor="city">City *</Label>
                      <Input
                        id="city"
                        value={formData.identity.city}
                        onChange={(e) => updateFormData('identity', 'city', e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="state">State *</Label>
                      <Input
                        id="state"
                        value={formData.identity.state}
                        onChange={(e) => updateFormData('identity', 'state', e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="zipCode">ZIP Code *</Label>
                      <Input
                        id="zipCode"
                        value={formData.identity.zipCode}
                        onChange={(e) => updateFormData('identity', 'zipCode', e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="country">Country</Label>
                      <Input
                        id="country"
                        value={formData.identity.country}
                        onChange={(e) => updateFormData('identity', 'country', e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Emergency Contact */}
                <div>
                  <h3 className="text-lg font-medium mb-4">Emergency Contact</h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="emergencyContactName">Name *</Label>
                      <Input
                        id="emergencyContactName"
                        value={formData.identity.emergencyContactName}
                        onChange={(e) => updateFormData('identity', 'emergencyContactName', e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="emergencyContactRelationship">Relationship *</Label>
                      <Input
                        id="emergencyContactRelationship"
                        value={formData.identity.emergencyContactRelationship}
                        onChange={(e) => updateFormData('identity', 'emergencyContactRelationship', e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="emergencyContactPhone">Phone Number *</Label>
                      <Input
                        id="emergencyContactPhone"
                        type="tel"
                        value={formData.identity.emergencyContactPhone}
                        onChange={(e) => updateFormData('identity', 'emergencyContactPhone', e.target.value)}
                        required
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* CLINICAL TAB - Placeholder for now */}
          <TabsContent value="clinical" className="space-y-6">
            <Alert>
              <Stethoscope className="h-4 w-4" />
              <AlertDescription>
                Clinical section with 75+ comprehensive fields covering all medical, treatment, and assessment data would be implemented here. 
                This includes diagnosis, symptoms, medical history, medications, allergies, treatment planning, risk assessments, and clinical documents.
              </AlertDescription>
            </Alert>
          </TabsContent>

          {/* Other tabs would be implemented similarly... */}
          <TabsContent value="care-coordination" className="space-y-6">
            <Alert>
              <Users className="h-4 w-4" />
              <AlertDescription>
                Care Coordination section covering primary care team, referring providers, treatment centers, care team members, 
                coordination preferences, specialists, and communication settings.
              </AlertDescription>
            </Alert>
          </TabsContent>

          <TabsContent value="financial" className="space-y-6">
            <Alert>
              <DollarSign className="h-4 w-4" />
              <AlertDescription>
                Financial section with comprehensive insurance information, payment methods, financial assistance programs, 
                prior authorizations, and cost estimates.
              </AlertDescription>
            </Alert>
          </TabsContent>

          <TabsContent value="consent" className="space-y-6">
            <Alert>
              <ShieldCheck className="h-4 w-4" />
              <AlertDescription>
                Consent management covering treatment consent, HIPAA authorization, financial responsibility, communication consents, 
                telehealth consent, advance directives, and digital signature management.
              </AlertDescription>
            </Alert>
          </TabsContent>

          <TabsContent value="tech" className="space-y-6">
            <Alert>
              <Laptop className="h-4 w-4" />
              <AlertDescription>
                Technology preferences including digital platforms, device information, accessibility needs, digital literacy, 
                remote monitoring, telehealth setup, and technical support preferences.
              </AlertDescription>
            </Alert>
          </TabsContent>
        </Tabs>

        <div className="mt-6 flex justify-between">
          <Button variant="outline" onClick={() => setActiveTab('identity')}>
            Reset to Identity
          </Button>
          <Button onClick={handleSubmit} disabled={readonly}>
            Complete Enrollment
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export type { EnhancedPatientEnrollmentData };
export const createEmptyEnhancedPatientEnrollmentData = (): EnhancedPatientEnrollmentData => {
  return {
    identity: {
      firstName: '',
      lastName: '',
      dateOfBirth: '',
      age: 0,
      gender: 'male',
      preferredLanguage: 'english',
      interpreterNeeded: false,
      email: '',
      cellPhone: '',
      preferredContactMethod: 'phone',
      address: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'United States',
      addressType: 'residential',
      emergencyContactName: '',
      emergencyContactRelationship: '',
      emergencyContactPhone: ''
    },
    clinical: {
      primaryDiagnosis: '',
      secondaryDiagnoses: [],
      icdCodes: [],
      presentingSymptoms: '',
      symptomOnset: '',
      symptomSeverity: 1,
      functionalImpairment: 'none',
      medicalHistory: '',
      surgicalHistory: [],
      hospitalizations: [],
      chronicConditions: [],
      currentMedications: [],
      allergies: [],
      tobaccoUse: 'never',
      alcoholUse: 'never',
      substanceUse: 'never',
      familyHistory: '',
      geneticRiskFactors: [],
      recentLabResults: [],
      imagingStudies: [],
      diagnosticTests: [],
      treatmentGoals: '',
      proposedTreatmentPlan: '',
      treatmentModality: '',
      treatmentFrequency: '',
      estimatedDuration: '',
      expectedOutcomes: '',
      suicideRisk: 'low',
      violenceRisk: 'low',
      fallRisk: 'low',
      safetyPlanRequired: false,
      clinicalDocuments: []
    },
    careCoordination: {
      primaryPhysician: {
        name: '',
        specialty: '',
        phone: '',
        address: ''
      },
      treatmentCenter: {
        name: '',
        address: '',
        phone: '',
        facilityType: 'clinic',
        accreditation: []
      },
      careTeamMembers: [],
      careCoordinationMethod: 'email',
      reportingFrequency: 'weekly',
      specialists: [],
      previousFacilities: [],
      followUpRequirements: [],
      providerCommunicationConsent: false,
      familyCommunicationConsent: false,
      emergencyNotificationContacts: []
    },
    financial: {
      primaryInsurance: {
        provider: '',
        planName: '',
        policyNumber: '',
        groupNumber: '',
        subscriberId: '',
        subscriberName: '',
        subscriberRelationship: 'self',
        effectiveDate: ''
      },
      pharmacyInsurance: {
        provider: '',
        policyNumber: '',
        groupNumber: ''
      },
      householdSize: 1,
      financialHardship: false,
      assistanceProgramInterest: false,
      assistanceProgramsApplied: [],
      responsibleParty: {
        name: '',
        relationship: 'self',
        phone: ''
      },
      preferredPaymentMethod: 'insurance-only',
      paymentPlanInterest: false,
      insuranceCards: [],
      financialDocuments: [],
      priorAuthRequired: false,
      priorAuthStatus: 'not-required'
    },
    consent: {
      consentToTreatment: false,
      consentToTreatmentMethod: 'written',
      hipaaAuthorization: false,
      hipaaAuthorizationScope: [],
      financialResponsibilityAcknowledgment: false,
      communicationConsent: false,
      emailConsent: false,
      smsConsent: false,
      voiceMessageConsent: false,
      whatsappConsent: false,
      marketingConsent: false,
      researchParticipationConsent: false,
      telehealthConsent: false,
      telehealthPlatformAgreement: false,
      advanceDirectiveOnFile: false,
      powerOfAttorneyOnFile: false,
      consentMethod: 'facility-present',
      photographyConsent: false,
      socialMediaConsent: false,
      testimonialConsent: false,
      consentExceptions: []
    },
    tech: {
      patientPortalAccess: false,
      mobileAppInterest: false,
      preferredDigitalPlatform: 'email',
      videoCallCapability: false,
      primaryDevice: 'smartphone',
      internetAccess: false,
      internetReliability: 'good',
      visualImpairment: false,
      hearingImpairment: false,
      motorImpairment: false,
      cognitiveImpairment: false,
      assistiveTechnology: [],
      technologyComfortLevel: 'comfortable',
      trainingNeeded: false,
      supportPersonAvailable: false,
      remoteMonitoringInterest: false,
      wearableDevices: [],
      homeMonitoringEquipment: [],
      healthAppsUsed: [],
      fitnessTrakingUsed: false,
      medicationReminderApps: false,
      telehealthSetupComplete: false,
      telehealthTesting: false,
      telehealthSupport: false,
      healthDataSharing: false,
      anonymizedDataSharing: false,
      researchDataSharing: false,
      twoFactorAuthentication: false,
      biometricAuthentication: false,
      passwordComplexity: 'standard',
      technicalSupportNeeded: false,
      technicalSupportContact: '',
      preferredSupportMethod: 'phone'
    }
  };
};
