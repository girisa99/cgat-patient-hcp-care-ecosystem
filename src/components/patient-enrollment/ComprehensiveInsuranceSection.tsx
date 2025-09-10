/**
 * COMPREHENSIVE INSURANCE SECTION
 * Complete insurance information with multiple coverage levels, card uploads, and conditional fields
 */
import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  CreditCard, 
  Plus, 
  Minus,
  Upload,
  Camera,
  FileImage,
  Shield,
  CheckCircle2,
  AlertCircle,
  Phone,
  Mail,
  Calendar,
  DollarSign,
  Users,
  Building2,
  FileText,
  Heart,
  Stethoscope
} from 'lucide-react';

// Types
interface InsuranceCard {
  id: string;
  file?: File;
  url?: string;
  type: 'front' | 'back';
}

interface InsuranceCoverage {
  id: string;
  priority: 'primary' | 'secondary' | 'tertiary';
  
  // Basic Information
  category: string;
  companyName: string;
  planName: string;
  planType: string;
  policyId: string;
  groupNumber: string;
  binNumber: string;
  pcnNumber: string;
  policyHolderName: string;
  policyHolderDob: string;
  policyHolderSsn: string;
  relationshipToPatient: string;
  policyEffectiveDate: string;
  policyExpirationDate: string;
  policyStatus: string;
  
  // Contact Information
  memberServicesPhone: string;
  providerServicesPhone: string;
  claimsPhone: string;
  priorAuthPhone: string;
  pharmacyServicesPhone: string;
  customerServiceHours: string;
  websiteUrl: string;
  mobileAppAvailable: boolean;
  
  // Coverage Details
  medicalCoverage: boolean;
  pharmacyCoverage: boolean;
  mentalHealthCoverage: boolean;
  substanceAbuseCoverage: boolean;
  
  // Medical Coverage Details
  annualDeductibleIndividual: string;
  annualDeductibleFamily: string;
  deductibleMetToDate: string;
  outOfPocketMaxIndividual: string;
  outOfPocketMaxFamily: string;
  outOfPocketMetToDate: string;
  officeVisitCopay: string;
  specialistVisitCopay: string;
  emergencyRoomCopay: string;
  urgentCareCopay: string;
  inpatientHospitalCopay: string;
  outpatientSurgeryCopay: string;
  diagnosticTestCoinsurance: string;
  preventiveCareCoverage: string;
  priorAuthRequired: boolean;
  referralRequired: boolean;
  precertificationRequired: boolean;
  
  // Pharmacy Coverage Details
  pharmacyBenefitsActive: boolean;
  pharmacyBenefitManager: string;
  pharmacyIdNumber: string;
  pharmacyGroupNumber: string;
  formularyType: string;
  formularyTierStructure: string;
  genericCopay: string;
  brandNameCopay: string;
  preferredBrandCopay: string;
  nonPreferredBrandCopay: string;
  specialtyDrugCopay: string;
  pharmacyDeductible: string;
  mailOrderBenefits: boolean;
  specialtyPharmacyNetwork: string;
  priorAuthRequiredMeds: boolean;
  stepTherapyRequirements: boolean;
  quantityLimits: boolean;
  
  // Advanced Therapy Coverage
  highCostTherapyCoverage: boolean;
  specialtyDrugTierAssignment: string;
  medicalVsPharmacyBenefit: string;
  siteOfCareRestrictions: string;
  caseManagementRequired: boolean;
  priorAuthRequiredAdvanced: boolean;
  precertificationTimeline: string;
  coverageDecisionTimeline: string;
  annualMaximumBenefit: string;
  lifetimeMaximumBenefit: string;
  experimentalCoverage: boolean;
  clinicalTrialCoverage: boolean;
  compassionateUseCoverage: boolean;
  
  // Government Insurance Specific Fields
  medicareIdNumber: string;
  medicareType: string;
  medicarePartA: boolean;
  medicarePartB: boolean;
  medicarePartC: string;
  medicarePartD: string;
  medicaidIdNumber: string;
  stateMedicaidProgram: string;
  medicaidPlanType: string;
  tricareRegion: string;
  tricarePlanType: string;
  sponsorMilitaryId: string;
  militaryBranch: string;
  sponsorStatus: string;
  vaFileNumber: string;
  serviceConnectedRating: string;
  priorityGroup: string;
  workersCompClaimNumber: string;
  workersCompCarrier: string;
  dateOfInjury: string;
  employerName: string;
  
  // Insurance Cards
  insuranceCards: InsuranceCard[];
  
  // Verification Status
  verificationStatus: 'pending' | 'verified' | 'failed';
  verificationDate: string;
  verifiedBy: string;
  benefitsConfirmed: boolean;
  priorAuthStatus: string;
  priorAuthReferenceNumber: string;
  priorAuthApprovalDate: string;
  priorAuthExpirationDate: string;
}

interface PatientAssistancePrograms {
  // Manufacturer Programs
  manufacturerCopayCard: boolean;
  copayCardEligibility: string;
  copayCardAnnualMax: string;
  copayCardUsedToDate: string;
  manufacturerSupportProgram: boolean;
  hubServicesProgram: boolean;
  hubServicesContact: string;
  
  // Foundation Programs
  foundationAssistanceApplied: boolean;
  foundationProgram: string;
  foundationApplicationStatus: string;
  foundationAwardAmount: string;
  hospitalCharityCare: string;
  stateAssistancePrograms: string;
  federalAssistancePrograms: string;
  
  // Restrictions
  governmentInsuranceRestriction: boolean;
  incomeVerificationRequired: boolean;
  assetVerificationRequired: boolean;
}

interface CoordinationOfBenefits {
  primaryPayer: string;
  secondaryPayer: string;
  tertiaryPayer: string;
  cobMethod: string;
  autoCobProcessing: boolean;
  birthdayRuleOverride: boolean;
  birthdayRuleReason: string;
  
  // Medicare Secondary Payer
  workingAgedBeneficiary: boolean;
  employerSize: string;
  activeEmployment: boolean;
  cobraCoverage: boolean;
  spouseEmploymentStatus: string;
  esrdStatus: boolean;
  mspQuestionnaireDate: string;
  mspDevelopmentStatus: string;
}

interface ComprehensiveInsuranceData {
  // Coverage Selection
  numberOfPlans: number;
  insuranceCategories: string[];
  governmentSubTypes: string[];
  coverageTypes: string[];
  
  // Insurance Coverages
  insuranceCoverages: InsuranceCoverage[];
  
  // Coordination of Benefits
  coordinationOfBenefits: CoordinationOfBenefits;
  
  // Patient Assistance
  patientAssistancePrograms: PatientAssistancePrograms;
  
  // Financial Responsibility
  estimatedPatientResponsibility: string;
  primaryInsuranceResponsibility: string;
  secondaryInsuranceResponsibility: string;
  patientResponsibilityAfterInsurance: string;
  copayAmountDue: string;
  coinsuranceAmountDue: string;
  deductibleAmountDue: string;
  unmetDeductibleBalance: string;
  paymentMethodPreference: string;
  paymentPlanAvailable: boolean;
  depositRequired: boolean;
  depositAmount: string;
  financialHardshipIdentified: boolean;
}

interface ComprehensiveInsuranceSectionProps {
  formData: ComprehensiveInsuranceData;
  updateFormData: (field: keyof ComprehensiveInsuranceData, value: any) => void;
  readOnly?: boolean;
}

export const ComprehensiveInsuranceSection: React.FC<ComprehensiveInsuranceSectionProps> = ({
  formData,
  updateFormData,
  readOnly = false
}) => {
  const [activeTab, setActiveTab] = useState("coverage-selection");
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  // Create empty insurance coverage
  const createEmptyInsuranceCoverage = (priority: 'primary' | 'secondary' | 'tertiary'): InsuranceCoverage => ({
    id: Math.random().toString(36).substr(2, 9),
    priority,
    category: '',
    companyName: '',
    planName: '',
    planType: '',
    policyId: '',
    groupNumber: '',
    binNumber: '',
    pcnNumber: '',
    policyHolderName: '',
    policyHolderDob: '',
    policyHolderSsn: '',
    relationshipToPatient: '',
    policyEffectiveDate: '',
    policyExpirationDate: '',
    policyStatus: 'active',
    memberServicesPhone: '',
    providerServicesPhone: '',
    claimsPhone: '',
    priorAuthPhone: '',
    pharmacyServicesPhone: '',
    customerServiceHours: '',
    websiteUrl: '',
    mobileAppAvailable: false,
    medicalCoverage: false,
    pharmacyCoverage: false,
    mentalHealthCoverage: false,
    substanceAbuseCoverage: false,
    annualDeductibleIndividual: '',
    annualDeductibleFamily: '',
    deductibleMetToDate: '',
    outOfPocketMaxIndividual: '',
    outOfPocketMaxFamily: '',
    outOfPocketMetToDate: '',
    officeVisitCopay: '',
    specialistVisitCopay: '',
    emergencyRoomCopay: '',
    urgentCareCopay: '',
    inpatientHospitalCopay: '',
    outpatientSurgeryCopay: '',
    diagnosticTestCoinsurance: '',
    preventiveCareCoverage: '',
    priorAuthRequired: false,
    referralRequired: false,
    precertificationRequired: false,
    pharmacyBenefitsActive: false,
    pharmacyBenefitManager: '',
    pharmacyIdNumber: '',
    pharmacyGroupNumber: '',
    formularyType: '',
    formularyTierStructure: '',
    genericCopay: '',
    brandNameCopay: '',
    preferredBrandCopay: '',
    nonPreferredBrandCopay: '',
    specialtyDrugCopay: '',
    pharmacyDeductible: '',
    mailOrderBenefits: false,
    specialtyPharmacyNetwork: '',
    priorAuthRequiredMeds: false,
    stepTherapyRequirements: false,
    quantityLimits: false,
    highCostTherapyCoverage: false,
    specialtyDrugTierAssignment: '',
    medicalVsPharmacyBenefit: '',
    siteOfCareRestrictions: '',
    caseManagementRequired: false,
    priorAuthRequiredAdvanced: false,
    precertificationTimeline: '',
    coverageDecisionTimeline: '',
    annualMaximumBenefit: '',
    lifetimeMaximumBenefit: '',
    experimentalCoverage: false,
    clinicalTrialCoverage: false,
    compassionateUseCoverage: false,
    medicareIdNumber: '',
    medicareType: '',
    medicarePartA: false,
    medicarePartB: false,
    medicarePartC: '',
    medicarePartD: '',
    medicaidIdNumber: '',
    stateMedicaidProgram: '',
    medicaidPlanType: '',
    tricareRegion: '',
    tricarePlanType: '',
    sponsorMilitaryId: '',
    militaryBranch: '',
    sponsorStatus: '',
    vaFileNumber: '',
    serviceConnectedRating: '',
    priorityGroup: '',
    workersCompClaimNumber: '',
    workersCompCarrier: '',
    dateOfInjury: '',
    employerName: '',
    insuranceCards: [],
    verificationStatus: 'pending',
    verificationDate: '',
    verifiedBy: '',
    benefitsConfirmed: false,
    priorAuthStatus: '',
    priorAuthReferenceNumber: '',
    priorAuthApprovalDate: '',
    priorAuthExpirationDate: ''
  });

  // Add insurance coverage
  const addInsuranceCoverage = () => {
    const priorities: ('primary' | 'secondary' | 'tertiary')[] = ['primary', 'secondary', 'tertiary'];
    const existingPriorities = formData.insuranceCoverages.map(c => c.priority);
    const nextPriority = priorities.find(p => !existingPriorities.includes(p));
    
    if (nextPriority && formData.insuranceCoverages.length < 3) {
      const newCoverage = createEmptyInsuranceCoverage(nextPriority);
      updateFormData('insuranceCoverages', [...formData.insuranceCoverages, newCoverage]);
      updateFormData('numberOfPlans', formData.numberOfPlans + 1);
    }
  };

  // Remove insurance coverage
  const removeInsuranceCoverage = (id: string) => {
    const updatedCoverages = formData.insuranceCoverages.filter(c => c.id !== id);
    updateFormData('insuranceCoverages', updatedCoverages);
    updateFormData('numberOfPlans', updatedCoverages.length);
  };

  // Update insurance coverage
  const updateInsuranceCoverage = (id: string, field: keyof InsuranceCoverage, value: any) => {
    const updatedCoverages = formData.insuranceCoverages.map(coverage => 
      coverage.id === id ? { ...coverage, [field]: value } : coverage
    );
    updateFormData('insuranceCoverages', updatedCoverages);
  };

  // Handle file upload
  const handleFileUpload = (coverageId: string, files: FileList | null, type: 'front' | 'back') => {
    if (!files || files.length === 0) return;
    
    const file = files[0];
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    const coverage = formData.insuranceCoverages.find(c => c.id === coverageId);
    if (!coverage) return;

    const newCard: InsuranceCard = {
      id: Math.random().toString(36).substr(2, 9),
      file,
      url: URL.createObjectURL(file),
      type
    };

    const updatedCards = [...coverage.insuranceCards.filter(card => card.type !== type), newCard];
    updateInsuranceCoverage(coverageId, 'insuranceCards', updatedCards);
  };

  // Handle drag and drop
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent, coverageId: string, type: 'front' | 'back') => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(coverageId, e.dataTransfer.files, type);
    }
  };

  // Remove insurance card
  const removeInsuranceCard = (coverageId: string, cardId: string) => {
    const coverage = formData.insuranceCoverages.find(c => c.id === coverageId);
    if (!coverage) return;

    const updatedCards = coverage.insuranceCards.filter(card => card.id !== cardId);
    updateInsuranceCoverage(coverageId, 'insuranceCards', updatedCards);
  };

  // Check if government insurance is selected
  const hasGovernmentInsurance = () => {
    return formData.insuranceCategories.includes('Government Insurance') ||
           formData.governmentSubTypes.length > 0;
  };

  // Render insurance card upload section
  const renderInsuranceCardUpload = (coverage: InsuranceCoverage) => (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle className="text-sm flex items-center gap-2">
          <FileImage className="h-4 w-4" />
          Insurance Card Images
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          {/* Front of Card */}
          <div>
            <Label className="text-xs font-medium">Front of Card</Label>
            <div
              className={`mt-2 border-2 border-dashed rounded-lg p-4 text-center transition-colors ${
                dragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/25'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={(e) => handleDrop(e, coverage.id, 'front')}
            >
              {coverage.insuranceCards.find(card => card.type === 'front') ? (
                <div className="relative">
                  <img
                    src={coverage.insuranceCards.find(card => card.type === 'front')?.url}
                    alt="Front of insurance card"
                    className="w-full h-32 object-cover rounded"
                  />
                  <Button
                    size="sm"
                    variant="destructive"
                    className="absolute top-1 right-1 h-6 w-6 p-0"
                    onClick={() => removeInsuranceCard(coverage.id, coverage.insuranceCards.find(card => card.type === 'front')!.id)}
                  >
                    <Minus className="h-3 w-3" />
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  <FileImage className="h-8 w-8 mx-auto text-muted-foreground" />
                  <p className="text-xs text-muted-foreground">
                    Drag & drop or click to upload
                  </p>
                  <div className="flex gap-2 justify-center">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={readOnly}
                    >
                      <Upload className="h-3 w-3 mr-1" />
                      Upload
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => cameraInputRef.current?.click()}
                      disabled={readOnly}
                    >
                      <Camera className="h-3 w-3 mr-1" />
                      Camera
                    </Button>
                  </div>
                </div>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => handleFileUpload(coverage.id, e.target.files, 'front')}
            />
            <input
              ref={cameraInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={(e) => handleFileUpload(coverage.id, e.target.files, 'front')}
            />
          </div>

          {/* Back of Card */}
          <div>
            <Label className="text-xs font-medium">Back of Card</Label>
            <div
              className={`mt-2 border-2 border-dashed rounded-lg p-4 text-center transition-colors ${
                dragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/25'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={(e) => handleDrop(e, coverage.id, 'back')}
            >
              {coverage.insuranceCards.find(card => card.type === 'back') ? (
                <div className="relative">
                  <img
                    src={coverage.insuranceCards.find(card => card.type === 'back')?.url}
                    alt="Back of insurance card"
                    className="w-full h-32 object-cover rounded"
                  />
                  <Button
                    size="sm"
                    variant="destructive"
                    className="absolute top-1 right-1 h-6 w-6 p-0"
                    onClick={() => removeInsuranceCard(coverage.id, coverage.insuranceCards.find(card => card.type === 'back')!.id)}
                  >
                    <Minus className="h-3 w-3" />
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  <FileImage className="h-8 w-8 mx-auto text-muted-foreground" />
                  <p className="text-xs text-muted-foreground">
                    Drag & drop or click to upload
                  </p>
                  <div className="flex gap-2 justify-center">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={readOnly}
                    >
                      <Upload className="h-3 w-3 mr-1" />
                      Upload
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => cameraInputRef.current?.click()}
                      disabled={readOnly}
                    >
                      <Camera className="h-3 w-3 mr-1" />
                      Camera
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          Comprehensive Insurance Information
        </CardTitle>
        <div className="text-sm text-muted-foreground">
          Complete the insurance information across all tabs below, then continue to Therapy section
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList level="child" className="grid w-full grid-cols-6 text-xs">
            <TabsTrigger level="child" value="coverage-selection" className="flex items-center gap-1 text-xs">
              <Shield className="h-3 w-3" />
              Coverage
            </TabsTrigger>
            <TabsTrigger level="child" value="insurance-details" className="flex items-center gap-1 text-xs">
              <CreditCard className="h-3 w-3" />
              Details
            </TabsTrigger>
            <TabsTrigger level="child" value="coordination" className="flex items-center gap-1 text-xs">
              <Users className="h-3 w-3" />
              COB
            </TabsTrigger>
            <TabsTrigger level="child" value="verification" className="flex items-center gap-1 text-xs">
              <CheckCircle2 className="h-3 w-3" />
              Verify
            </TabsTrigger>
            <TabsTrigger level="child" value="assistance" className="flex items-center gap-1 text-xs">
              <Heart className="h-3 w-3" />
              Assist
            </TabsTrigger>
            <TabsTrigger level="child" value="financial" className="flex items-center gap-1 text-xs">
              <DollarSign className="h-3 w-3" />
              Financial
            </TabsTrigger>
          </TabsList>

          {/* Tab 1: Coverage Selection */}
          <TabsContent value="coverage-selection" className="space-y-6 mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Insurance Coverage Selection</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Number of Plans */}
                <div>
                  <Label htmlFor="numberOfPlans">Number of Insurance Plans</Label>
                  <Select
                    value={formData.numberOfPlans.toString()}
                    onValueChange={(value) => updateFormData('numberOfPlans', parseInt(value))}
                    disabled={readOnly}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select number of plans" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">Self-Pay Only</SelectItem>
                      <SelectItem value="1">1 Insurance Plan</SelectItem>
                      <SelectItem value="2">2 Insurance Plans</SelectItem>
                      <SelectItem value="3">3 Insurance Plans</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Insurance Categories */}
                <div>
                  <Label className="text-base font-medium">Insurance Categories</Label>
                  <div className="grid grid-cols-2 gap-4 mt-2">
                    {[
                      'Commercial Insurance',
                      'Government Insurance', 
                      'Self-Pay',
                      'Clinical Trial Coverage',
                      'International Insurance'
                    ].map((category) => (
                      <div key={category} className="flex items-center space-x-2">
                        <Checkbox
                          id={category}
                          checked={formData.insuranceCategories.includes(category)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              updateFormData('insuranceCategories', [...formData.insuranceCategories, category]);
                            } else {
                              updateFormData('insuranceCategories', formData.insuranceCategories.filter(c => c !== category));
                            }
                          }}
                          disabled={readOnly}
                        />
                        <Label htmlFor={category} className="text-sm">{category}</Label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Government Insurance Sub-Types */}
                {formData.insuranceCategories.includes('Government Insurance') && (
                  <div>
                    <Label className="text-base font-medium">Government Program Types</Label>
                    <div className="grid grid-cols-2 gap-4 mt-2">
                      {[
                        'Medicare (Original/Advantage/Supplement)',
                        'Medicaid',
                        'TRICARE',
                        'VA Benefits',
                        'Workers\' Compensation',
                        'State Insurance Programs',
                        'Indian Health Service'
                      ].map((subType) => (
                        <div key={subType} className="flex items-center space-x-2">
                          <Checkbox
                            id={subType}
                            checked={formData.governmentSubTypes.includes(subType)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                updateFormData('governmentSubTypes', [...formData.governmentSubTypes, subType]);
                              } else {
                                updateFormData('governmentSubTypes', formData.governmentSubTypes.filter(t => t !== subType));
                              }
                            }}
                            disabled={readOnly}
                          />
                          <Label htmlFor={subType} className="text-sm">{subType}</Label>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Coverage Types */}
                <div>
                  <Label className="text-base font-medium">Coverage Types</Label>
                  <div className="grid grid-cols-2 gap-4 mt-2">
                    {[
                      'Medical Coverage',
                      'Pharmacy Coverage',
                      'Mental Health Coverage',
                      'Substance Abuse Coverage'
                    ].map((coverageType) => (
                      <div key={coverageType} className="flex items-center space-x-2">
                        <Checkbox
                          id={coverageType}
                          checked={formData.coverageTypes.includes(coverageType)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              updateFormData('coverageTypes', [...formData.coverageTypes, coverageType]);
                            } else {
                              updateFormData('coverageTypes', formData.coverageTypes.filter(t => t !== coverageType));
                            }
                          }}
                          disabled={readOnly}
                        />
                        <Label htmlFor={coverageType} className="text-sm">{coverageType}</Label>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab 2: Insurance Details */}
          <TabsContent value="insurance-details" className="space-y-6 mt-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Insurance Coverage Details</h3>
              <Button
                onClick={addInsuranceCoverage}
                disabled={formData.insuranceCoverages.length >= 3 || readOnly}
                size="sm"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Insurance
              </Button>
            </div>

            {formData.insuranceCoverages.length === 0 ? (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  No insurance coverage added. Click "Add Insurance" to get started.
                </AlertDescription>
              </Alert>
            ) : (
              <div className="space-y-6">
                {formData.insuranceCoverages.map((coverage) => (
                  <Card key={coverage.id}>
                    <CardHeader>
                      <div className="flex justify-between items-center">
                        <CardTitle className="capitalize flex items-center gap-2">
                          <Badge variant={coverage.priority === 'primary' ? 'default' : 'secondary'}>
                            {coverage.priority}
                          </Badge>
                          Insurance Coverage
                        </CardTitle>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => removeInsuranceCoverage(coverage.id)}
                          disabled={readOnly}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {/* Basic Insurance Details */}
                      <div>
                        <h4 className="font-medium mb-4">Basic Insurance Details</h4>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor={`category-${coverage.id}`}>Insurance Category</Label>
                            <Select
                              value={coverage.category}
                              onValueChange={(value) => updateInsuranceCoverage(coverage.id, 'category', value)}
                              disabled={readOnly}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select category" />
                              </SelectTrigger>
                              <SelectContent>
                                {formData.insuranceCategories.map(category => (
                                  <SelectItem key={category} value={category}>{category}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label htmlFor={`companyName-${coverage.id}`}>Insurance Company Name</Label>
                            <Input
                              id={`companyName-${coverage.id}`}
                              value={coverage.companyName}
                              onChange={(e) => updateInsuranceCoverage(coverage.id, 'companyName', e.target.value)}
                              disabled={readOnly}
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mt-4">
                          <div>
                            <Label htmlFor={`planName-${coverage.id}`}>Plan Name/Product</Label>
                            <Input
                              id={`planName-${coverage.id}`}
                              value={coverage.planName}
                              onChange={(e) => updateInsuranceCoverage(coverage.id, 'planName', e.target.value)}
                              disabled={readOnly}
                            />
                          </div>
                          <div>
                            <Label htmlFor={`planType-${coverage.id}`}>Plan Type</Label>
                            <Select
                              value={coverage.planType}
                              onValueChange={(value) => updateInsuranceCoverage(coverage.id, 'planType', value)}
                              disabled={readOnly}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select plan type" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="HMO">HMO</SelectItem>
                                <SelectItem value="PPO">PPO</SelectItem>
                                <SelectItem value="EPO">EPO</SelectItem>
                                <SelectItem value="POS">POS</SelectItem>
                                <SelectItem value="HDHP">HDHP</SelectItem>
                                <SelectItem value="Indemnity">Indemnity</SelectItem>
                                <SelectItem value="Medicare Advantage">Medicare Advantage</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mt-4">
                          <div>
                            <Label htmlFor={`policyId-${coverage.id}`}>Policy/Member ID Number</Label>
                            <Input
                              id={`policyId-${coverage.id}`}
                              value={coverage.policyId}
                              onChange={(e) => updateInsuranceCoverage(coverage.id, 'policyId', e.target.value)}
                              disabled={readOnly}
                            />
                          </div>
                          <div>
                            <Label htmlFor={`groupNumber-${coverage.id}`}>Group Number</Label>
                            <Input
                              id={`groupNumber-${coverage.id}`}
                              value={coverage.groupNumber}
                              onChange={(e) => updateInsuranceCoverage(coverage.id, 'groupNumber', e.target.value)}
                              disabled={readOnly}
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mt-4">
                          <div>
                            <Label htmlFor={`policyHolderName-${coverage.id}`}>Policy Holder Name</Label>
                            <Input
                              id={`policyHolderName-${coverage.id}`}
                              value={coverage.policyHolderName}
                              onChange={(e) => updateInsuranceCoverage(coverage.id, 'policyHolderName', e.target.value)}
                              disabled={readOnly}
                            />
                          </div>
                          <div>
                            <Label htmlFor={`relationshipToPatient-${coverage.id}`}>Relationship to Patient</Label>
                            <Select
                              value={coverage.relationshipToPatient}
                              onValueChange={(value) => updateInsuranceCoverage(coverage.id, 'relationshipToPatient', value)}
                              disabled={readOnly}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select relationship" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="self">Self</SelectItem>
                                <SelectItem value="spouse">Spouse</SelectItem>
                                <SelectItem value="parent">Parent</SelectItem>
                                <SelectItem value="child">Child</SelectItem>
                                <SelectItem value="other">Other</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </div>

                      <Separator />

                      {/* Contact Information */}
                      <div>
                        <h4 className="font-medium mb-4">Contact Information</h4>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor={`memberServicesPhone-${coverage.id}`}>Member Services Phone</Label>
                            <Input
                              id={`memberServicesPhone-${coverage.id}`}
                              value={coverage.memberServicesPhone}
                              onChange={(e) => updateInsuranceCoverage(coverage.id, 'memberServicesPhone', e.target.value)}
                              disabled={readOnly}
                            />
                          </div>
                          <div>
                            <Label htmlFor={`providerServicesPhone-${coverage.id}`}>Provider Services Phone</Label>
                            <Input
                              id={`providerServicesPhone-${coverage.id}`}
                              value={coverage.providerServicesPhone}
                              onChange={(e) => updateInsuranceCoverage(coverage.id, 'providerServicesPhone', e.target.value)}
                              disabled={readOnly}
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mt-4">
                          <div>
                            <Label htmlFor={`priorAuthPhone-${coverage.id}`}>Prior Authorization Phone</Label>
                            <Input
                              id={`priorAuthPhone-${coverage.id}`}
                              value={coverage.priorAuthPhone}
                              onChange={(e) => updateInsuranceCoverage(coverage.id, 'priorAuthPhone', e.target.value)}
                              disabled={readOnly}
                            />
                          </div>
                          <div>
                            <Label htmlFor={`websiteUrl-${coverage.id}`}>Website/Online Portal URL</Label>
                            <Input
                              id={`websiteUrl-${coverage.id}`}
                              value={coverage.websiteUrl}
                              onChange={(e) => updateInsuranceCoverage(coverage.id, 'websiteUrl', e.target.value)}
                              disabled={readOnly}
                            />
                          </div>
                        </div>
                      </div>

                      <Separator />

                      {/* Coverage Details */}
                      <div>
                        <h4 className="font-medium mb-4">Coverage Details</h4>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id={`medicalCoverage-${coverage.id}`}
                              checked={coverage.medicalCoverage}
                              onCheckedChange={(checked) => updateInsuranceCoverage(coverage.id, 'medicalCoverage', checked === true)}
                              disabled={readOnly}
                            />
                            <Label htmlFor={`medicalCoverage-${coverage.id}`}>Medical Coverage</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id={`pharmacyCoverage-${coverage.id}`}
                              checked={coverage.pharmacyCoverage}
                              onCheckedChange={(checked) => updateInsuranceCoverage(coverage.id, 'pharmacyCoverage', checked === true)}
                              disabled={readOnly}
                            />
                            <Label htmlFor={`pharmacyCoverage-${coverage.id}`}>Pharmacy Coverage</Label>
                          </div>
                        </div>

                        {/* Medical Coverage Details */}
                        {coverage.medicalCoverage && (
                          <div className="mt-4 p-4 bg-muted/30 rounded-lg space-y-4">
                            <h5 className="font-medium">Medical Coverage Details</h5>
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <Label htmlFor={`annualDeductibleIndividual-${coverage.id}`}>Annual Deductible (Individual)</Label>
                                <Input
                                  id={`annualDeductibleIndividual-${coverage.id}`}
                                  value={coverage.annualDeductibleIndividual}
                                  onChange={(e) => updateInsuranceCoverage(coverage.id, 'annualDeductibleIndividual', e.target.value)}
                                  placeholder="$0"
                                  disabled={readOnly}
                                />
                              </div>
                              <div>
                                <Label htmlFor={`annualDeductibleFamily-${coverage.id}`}>Annual Deductible (Family)</Label>
                                <Input
                                  id={`annualDeductibleFamily-${coverage.id}`}
                                  value={coverage.annualDeductibleFamily}
                                  onChange={(e) => updateInsuranceCoverage(coverage.id, 'annualDeductibleFamily', e.target.value)}
                                  placeholder="$0"
                                  disabled={readOnly}
                                />
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <Label htmlFor={`officeVisitCopay-${coverage.id}`}>Office Visit Copay</Label>
                                <Input
                                  id={`officeVisitCopay-${coverage.id}`}
                                  value={coverage.officeVisitCopay}
                                  onChange={(e) => updateInsuranceCoverage(coverage.id, 'officeVisitCopay', e.target.value)}
                                  placeholder="$0"
                                  disabled={readOnly}
                                />
                              </div>
                              <div>
                                <Label htmlFor={`specialistVisitCopay-${coverage.id}`}>Specialist Visit Copay</Label>
                                <Input
                                  id={`specialistVisitCopay-${coverage.id}`}
                                  value={coverage.specialistVisitCopay}
                                  onChange={(e) => updateInsuranceCoverage(coverage.id, 'specialistVisitCopay', e.target.value)}
                                  placeholder="$0"
                                  disabled={readOnly}
                                />
                              </div>
                            </div>

                            <div className="grid grid-cols-3 gap-4">
                              <div className="flex items-center space-x-2">
                                <Checkbox
                                  id={`priorAuthRequired-${coverage.id}`}
                                  checked={coverage.priorAuthRequired}
                                  onCheckedChange={(checked) => updateInsuranceCoverage(coverage.id, 'priorAuthRequired', checked === true)}
                                  disabled={readOnly}
                                />
                                <Label htmlFor={`priorAuthRequired-${coverage.id}`} className="text-sm">Prior Auth Required</Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Checkbox
                                  id={`referralRequired-${coverage.id}`}
                                  checked={coverage.referralRequired}
                                  onCheckedChange={(checked) => updateInsuranceCoverage(coverage.id, 'referralRequired', checked === true)}
                                  disabled={readOnly}
                                />
                                <Label htmlFor={`referralRequired-${coverage.id}`} className="text-sm">Referral Required</Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Checkbox
                                  id={`precertificationRequired-${coverage.id}`}
                                  checked={coverage.precertificationRequired}
                                  onCheckedChange={(checked) => updateInsuranceCoverage(coverage.id, 'precertificationRequired', checked === true)}
                                  disabled={readOnly}
                                />
                                <Label htmlFor={`precertificationRequired-${coverage.id}`} className="text-sm">Precertification Required</Label>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Pharmacy Coverage Details */}
                        {coverage.pharmacyCoverage && (
                          <div className="mt-4 p-4 bg-muted/30 rounded-lg space-y-4">
                            <h5 className="font-medium">Pharmacy Coverage Details</h5>
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <Label htmlFor={`pharmacyBenefitManager-${coverage.id}`}>Pharmacy Benefit Manager (PBM)</Label>
                                <Input
                                  id={`pharmacyBenefitManager-${coverage.id}`}
                                  value={coverage.pharmacyBenefitManager}
                                  onChange={(e) => updateInsuranceCoverage(coverage.id, 'pharmacyBenefitManager', e.target.value)}
                                  disabled={readOnly}
                                />
                              </div>
                              <div>
                                <Label htmlFor={`formularyType-${coverage.id}`}>Formulary Type</Label>
                                <Select
                                  value={coverage.formularyType}
                                  onValueChange={(value) => updateInsuranceCoverage(coverage.id, 'formularyType', value)}
                                  disabled={readOnly}
                                >
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select formulary type" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="open">Open</SelectItem>
                                    <SelectItem value="closed">Closed</SelectItem>
                                    <SelectItem value="tiered">Tiered</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <Label htmlFor={`genericCopay-${coverage.id}`}>Generic Copay</Label>
                                <Input
                                  id={`genericCopay-${coverage.id}`}
                                  value={coverage.genericCopay}
                                  onChange={(e) => updateInsuranceCoverage(coverage.id, 'genericCopay', e.target.value)}
                                  placeholder="$0"
                                  disabled={readOnly}
                                />
                              </div>
                              <div>
                                <Label htmlFor={`brandNameCopay-${coverage.id}`}>Brand Name Copay</Label>
                                <Input
                                  id={`brandNameCopay-${coverage.id}`}
                                  value={coverage.brandNameCopay}
                                  onChange={(e) => updateInsuranceCoverage(coverage.id, 'brandNameCopay', e.target.value)}
                                  placeholder="$0"
                                  disabled={readOnly}
                                />
                              </div>
                            </div>

                            <div className="grid grid-cols-3 gap-4">
                              <div className="flex items-center space-x-2">
                                <Checkbox
                                  id={`priorAuthRequiredMeds-${coverage.id}`}
                                  checked={coverage.priorAuthRequiredMeds}
                                  onCheckedChange={(checked) => updateInsuranceCoverage(coverage.id, 'priorAuthRequiredMeds', checked === true)}
                                  disabled={readOnly}
                                />
                                <Label htmlFor={`priorAuthRequiredMeds-${coverage.id}`} className="text-sm">Prior Auth for Medications</Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Checkbox
                                  id={`stepTherapyRequirements-${coverage.id}`}
                                  checked={coverage.stepTherapyRequirements}
                                  onCheckedChange={(checked) => updateInsuranceCoverage(coverage.id, 'stepTherapyRequirements', checked === true)}
                                  disabled={readOnly}
                                />
                                <Label htmlFor={`stepTherapyRequirements-${coverage.id}`} className="text-sm">Step Therapy</Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Checkbox
                                  id={`quantityLimits-${coverage.id}`}
                                  checked={coverage.quantityLimits}
                                  onCheckedChange={(checked) => updateInsuranceCoverage(coverage.id, 'quantityLimits', checked === true)}
                                  disabled={readOnly}
                                />
                                <Label htmlFor={`quantityLimits-${coverage.id}`} className="text-sm">Quantity Limits</Label>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      <Separator />

                      {/* Government Insurance Specific Fields */}
                      {coverage.category === 'Government Insurance' && (
                        <div>
                          <h4 className="font-medium mb-4">Government Insurance Details</h4>
                          
                          {/* Medicare Fields */}
                          {formData.governmentSubTypes.includes('Medicare (Original/Advantage/Supplement)') && (
                            <div className="p-4 bg-muted/30 rounded-lg space-y-4">
                              <h5 className="font-medium">Medicare Information</h5>
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <Label htmlFor={`medicareIdNumber-${coverage.id}`}>Medicare ID Number (MBI)</Label>
                                  <Input
                                    id={`medicareIdNumber-${coverage.id}`}
                                    value={coverage.medicareIdNumber}
                                    onChange={(e) => updateInsuranceCoverage(coverage.id, 'medicareIdNumber', e.target.value)}
                                    disabled={readOnly}
                                  />
                                </div>
                                <div>
                                  <Label htmlFor={`medicareType-${coverage.id}`}>Medicare Type</Label>
                                  <Select
                                    value={coverage.medicareType}
                                    onValueChange={(value) => updateInsuranceCoverage(coverage.id, 'medicareType', value)}
                                    disabled={readOnly}
                                  >
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select Medicare type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="original">Original Medicare (Parts A & B)</SelectItem>
                                      <SelectItem value="advantage">Medicare Advantage (Part C)</SelectItem>
                                      <SelectItem value="supplement">Medicare Supplement (Medigap)</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                              </div>

                              <div className="grid grid-cols-2 gap-4">
                                <div className="flex items-center space-x-2">
                                  <Checkbox
                                    id={`medicarePartA-${coverage.id}`}
                                    checked={coverage.medicarePartA}
                                    onCheckedChange={(checked) => updateInsuranceCoverage(coverage.id, 'medicarePartA', checked === true)}
                                    disabled={readOnly}
                                  />
                                  <Label htmlFor={`medicarePartA-${coverage.id}`} className="text-sm">Medicare Part A</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <Checkbox
                                    id={`medicarePartB-${coverage.id}`}
                                    checked={coverage.medicarePartB}
                                    onCheckedChange={(checked) => updateInsuranceCoverage(coverage.id, 'medicarePartB', checked === true)}
                                    disabled={readOnly}
                                  />
                                  <Label htmlFor={`medicarePartB-${coverage.id}`} className="text-sm">Medicare Part B</Label>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Medicaid Fields */}
                          {formData.governmentSubTypes.includes('Medicaid') && (
                            <div className="p-4 bg-muted/30 rounded-lg space-y-4 mt-4">
                              <h5 className="font-medium">Medicaid Information</h5>
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <Label htmlFor={`medicaidIdNumber-${coverage.id}`}>Medicaid ID Number</Label>
                                  <Input
                                    id={`medicaidIdNumber-${coverage.id}`}
                                    value={coverage.medicaidIdNumber}
                                    onChange={(e) => updateInsuranceCoverage(coverage.id, 'medicaidIdNumber', e.target.value)}
                                    disabled={readOnly}
                                  />
                                </div>
                                <div>
                                  <Label htmlFor={`stateMedicaidProgram-${coverage.id}`}>State Medicaid Program</Label>
                                  <Input
                                    id={`stateMedicaidProgram-${coverage.id}`}
                                    value={coverage.stateMedicaidProgram}
                                    onChange={(e) => updateInsuranceCoverage(coverage.id, 'stateMedicaidProgram', e.target.value)}
                                    disabled={readOnly}
                                  />
                                </div>
                              </div>
                            </div>
                          )}

                          {/* TRICARE Fields */}
                          {formData.governmentSubTypes.includes('TRICARE') && (
                            <div className="p-4 bg-muted/30 rounded-lg space-y-4 mt-4">
                              <h5 className="font-medium">TRICARE Information</h5>
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <Label htmlFor={`tricareRegion-${coverage.id}`}>TRICARE Region</Label>
                                  <Input
                                    id={`tricareRegion-${coverage.id}`}
                                    value={coverage.tricareRegion}
                                    onChange={(e) => updateInsuranceCoverage(coverage.id, 'tricareRegion', e.target.value)}
                                    disabled={readOnly}
                                  />
                                </div>
                                <div>
                                  <Label htmlFor={`tricarePlanType-${coverage.id}`}>TRICARE Plan Type</Label>
                                  <Select
                                    value={coverage.tricarePlanType}
                                    onValueChange={(value) => updateInsuranceCoverage(coverage.id, 'tricarePlanType', value)}
                                    disabled={readOnly}
                                  >
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select plan type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="prime">Prime</SelectItem>
                                      <SelectItem value="select">Select</SelectItem>
                                      <SelectItem value="reserve_select">Reserve Select</SelectItem>
                                      <SelectItem value="young_adult">Young Adult</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Insurance Card Upload */}
                      {renderInsuranceCardUpload(coverage)}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Tab 3: Coordination of Benefits */}
          <TabsContent value="coordination" className="space-y-6 mt-6">
            {formData.insuranceCoverages.length > 1 ? (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Coordination of Benefits (COB)</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="primaryPayer">Primary Payer</Label>
                      <Select
                        value={formData.coordinationOfBenefits.primaryPayer}
                        onValueChange={(value) => updateFormData('coordinationOfBenefits', {
                          ...formData.coordinationOfBenefits,
                          primaryPayer: value
                        })}
                        disabled={readOnly}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select primary payer" />
                        </SelectTrigger>
                        <SelectContent>
                          {formData.insuranceCoverages.map(coverage => (
                            <SelectItem key={coverage.id} value={coverage.id}>
                              {coverage.companyName || 'Unnamed Insurance'}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="secondaryPayer">Secondary Payer</Label>
                      <Select
                        value={formData.coordinationOfBenefits.secondaryPayer}
                        onValueChange={(value) => updateFormData('coordinationOfBenefits', {
                          ...formData.coordinationOfBenefits,
                          secondaryPayer: value
                        })}
                        disabled={readOnly}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select secondary payer" />
                        </SelectTrigger>
                        <SelectContent>
                          {formData.insuranceCoverages
                            .filter(coverage => coverage.id !== formData.coordinationOfBenefits.primaryPayer)
                            .map(coverage => (
                              <SelectItem key={coverage.id} value={coverage.id}>
                                {coverage.companyName || 'Unnamed Insurance'}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="cobMethod">COB Method</Label>
                    <Select
                      value={formData.coordinationOfBenefits.cobMethod}
                      onValueChange={(value) => updateFormData('coordinationOfBenefits', {
                        ...formData.coordinationOfBenefits,
                        cobMethod: value
                      })}
                      disabled={readOnly}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select COB method" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="traditional">Traditional</SelectItem>
                        <SelectItem value="carve_out">Carve-out</SelectItem>
                        <SelectItem value="non_duplication">Non-duplication</SelectItem>
                        <SelectItem value="maintenance_of_benefits">Maintenance of Benefits</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Medicare Secondary Payer (MSP) */}
                  {formData.governmentSubTypes.includes('Medicare (Original/Advantage/Supplement)') && (
                    <div className="p-4 bg-muted/30 rounded-lg space-y-4">
                      <h4 className="font-medium">Medicare Secondary Payer (MSP)</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="workingAgedBeneficiary"
                            checked={formData.coordinationOfBenefits.workingAgedBeneficiary}
                            onCheckedChange={(checked) => updateFormData('coordinationOfBenefits', {
                              ...formData.coordinationOfBenefits,
                              workingAgedBeneficiary: checked === true
                            })}
                            disabled={readOnly}
                          />
                          <Label htmlFor="workingAgedBeneficiary" className="text-sm">Working Aged Beneficiary</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="activeEmployment"
                            checked={formData.coordinationOfBenefits.activeEmployment}
                            onCheckedChange={(checked) => updateFormData('coordinationOfBenefits', {
                              ...formData.coordinationOfBenefits,
                              activeEmployment: checked === true
                            })}
                            disabled={readOnly}
                          />
                          <Label htmlFor="activeEmployment" className="text-sm">Active Employment</Label>
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="employerSize">Employer Size</Label>
                        <Select
                          value={formData.coordinationOfBenefits.employerSize}
                          onValueChange={(value) => updateFormData('coordinationOfBenefits', {
                            ...formData.coordinationOfBenefits,
                            employerSize: value
                          })}
                          disabled={readOnly}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select employer size" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="less_than_20">&lt; 20 employees</SelectItem>
                            <SelectItem value="20_or_more">≥ 20 employees</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ) : (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Coordination of Benefits is only applicable when multiple insurance plans are selected.
                </AlertDescription>
              </Alert>
            )}
          </TabsContent>

          {/* Tab 4: Verification & Eligibility */}
          <TabsContent value="verification" className="space-y-6 mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Verification & Eligibility Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {formData.insuranceCoverages.map((coverage) => (
                  <div key={coverage.id} className="p-4 border rounded-lg space-y-4">
                    <div className="flex justify-between items-center">
                      <h4 className="font-medium capitalize">{coverage.priority} Insurance - {coverage.companyName}</h4>
                      <Badge 
                        variant={
                          coverage.verificationStatus === 'verified' ? 'default' :
                          coverage.verificationStatus === 'failed' ? 'destructive' : 'secondary'
                        }
                      >
                        {coverage.verificationStatus}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor={`verificationStatus-${coverage.id}`}>Verification Status</Label>
                        <Select
                          value={coverage.verificationStatus}
                          onValueChange={(value: 'pending' | 'verified' | 'failed') => 
                            updateInsuranceCoverage(coverage.id, 'verificationStatus', value)
                          }
                          disabled={readOnly}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="verified">Verified</SelectItem>
                            <SelectItem value="failed">Failed</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor={`verificationDate-${coverage.id}`}>Verification Date</Label>
                        <Input
                          id={`verificationDate-${coverage.id}`}
                          type="date"
                          value={coverage.verificationDate}
                          onChange={(e) => updateInsuranceCoverage(coverage.id, 'verificationDate', e.target.value)}
                          disabled={readOnly}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor={`verifiedBy-${coverage.id}`}>Verified By</Label>
                        <Input
                          id={`verifiedBy-${coverage.id}`}
                          value={coverage.verifiedBy}
                          onChange={(e) => updateInsuranceCoverage(coverage.id, 'verifiedBy', e.target.value)}
                          placeholder="Staff member name"
                          disabled={readOnly}
                        />
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id={`benefitsConfirmed-${coverage.id}`}
                          checked={coverage.benefitsConfirmed}
                          onCheckedChange={(checked) => updateInsuranceCoverage(coverage.id, 'benefitsConfirmed', checked === true)}
                          disabled={readOnly}
                        />
                        <Label htmlFor={`benefitsConfirmed-${coverage.id}`} className="text-sm">Benefits Confirmed</Label>
                      </div>
                    </div>

                    {/* Prior Authorization Status */}
                    <div className="p-3 bg-muted/30 rounded space-y-3">
                      <h5 className="font-medium text-sm">Prior Authorization</h5>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor={`priorAuthStatus-${coverage.id}`}>Prior Auth Status</Label>
                          <Select
                            value={coverage.priorAuthStatus}
                            onValueChange={(value) => updateInsuranceCoverage(coverage.id, 'priorAuthStatus', value)}
                            disabled={readOnly}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="not_required">Not Required</SelectItem>
                              <SelectItem value="required">Required</SelectItem>
                              <SelectItem value="submitted">Submitted</SelectItem>
                              <SelectItem value="approved">Approved</SelectItem>
                              <SelectItem value="denied">Denied</SelectItem>
                              <SelectItem value="pending">Pending</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor={`priorAuthReferenceNumber-${coverage.id}`}>Reference Number</Label>
                          <Input
                            id={`priorAuthReferenceNumber-${coverage.id}`}
                            value={coverage.priorAuthReferenceNumber}
                            onChange={(e) => updateInsuranceCoverage(coverage.id, 'priorAuthReferenceNumber', e.target.value)}
                            disabled={readOnly}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab 5: Patient Assistance Programs */}
          <TabsContent value="assistance" className="space-y-6 mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Patient Assistance Programs</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Manufacturer Programs */}
                <div>
                  <h4 className="font-medium mb-4">Manufacturer Programs</h4>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="manufacturerCopayCard"
                        checked={formData.patientAssistancePrograms.manufacturerCopayCard}
                        onCheckedChange={(checked) => updateFormData('patientAssistancePrograms', {
                          ...formData.patientAssistancePrograms,
                          manufacturerCopayCard: checked === true
                        })}
                        disabled={readOnly || hasGovernmentInsurance()}
                      />
                      <Label htmlFor="manufacturerCopayCard">Manufacturer Copay Card Available</Label>
                      {hasGovernmentInsurance() && (
                        <Badge variant="destructive" className="text-xs">
                          Not Available - Government Insurance
                        </Badge>
                      )}
                    </div>

                    {formData.patientAssistancePrograms.manufacturerCopayCard && (
                      <div className="grid grid-cols-2 gap-4 pl-6">
                        <div>
                          <Label htmlFor="copayCardEligibility">Copay Card Eligibility</Label>
                          <Select
                            value={formData.patientAssistancePrograms.copayCardEligibility}
                            onValueChange={(value) => updateFormData('patientAssistancePrograms', {
                              ...formData.patientAssistancePrograms,
                              copayCardEligibility: value
                            })}
                            disabled={readOnly}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select eligibility" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="eligible">Eligible</SelectItem>
                              <SelectItem value="ineligible">Ineligible</SelectItem>
                              <SelectItem value="pending">Pending Review</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="copayCardAnnualMax">Annual Maximum Benefit</Label>
                          <Input
                            id="copayCardAnnualMax"
                            value={formData.patientAssistancePrograms.copayCardAnnualMax}
                            onChange={(e) => updateFormData('patientAssistancePrograms', {
                              ...formData.patientAssistancePrograms,
                              copayCardAnnualMax: e.target.value
                            })}
                            placeholder="$0"
                            disabled={readOnly}
                          />
                        </div>
                      </div>
                    )}

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="manufacturerSupportProgram"
                        checked={formData.patientAssistancePrograms.manufacturerSupportProgram}
                        onCheckedChange={(checked) => updateFormData('patientAssistancePrograms', {
                          ...formData.patientAssistancePrograms,
                          manufacturerSupportProgram: checked === true
                        })}
                        disabled={readOnly}
                      />
                      <Label htmlFor="manufacturerSupportProgram">Manufacturer Patient Support Program</Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="hubServicesProgram"
                        checked={formData.patientAssistancePrograms.hubServicesProgram}
                        onCheckedChange={(checked) => updateFormData('patientAssistancePrograms', {
                          ...formData.patientAssistancePrograms,
                          hubServicesProgram: checked === true
                        })}
                        disabled={readOnly}
                      />
                      <Label htmlFor="hubServicesProgram">Hub Services Program</Label>
                    </div>

                    {formData.patientAssistancePrograms.hubServicesProgram && (
                      <div className="pl-6">
                        <Label htmlFor="hubServicesContact">Hub Services Contact</Label>
                        <Input
                          id="hubServicesContact"
                          value={formData.patientAssistancePrograms.hubServicesContact}
                          onChange={(e) => updateFormData('patientAssistancePrograms', {
                            ...formData.patientAssistancePrograms,
                            hubServicesContact: e.target.value
                          })}
                          placeholder="Phone number or contact information"
                          disabled={readOnly}
                        />
                      </div>
                    )}
                  </div>
                </div>

                <Separator />

                {/* Foundation & Charity Programs */}
                <div>
                  <h4 className="font-medium mb-4">Foundation & Charity Programs</h4>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="foundationAssistanceApplied"
                        checked={formData.patientAssistancePrograms.foundationAssistanceApplied}
                        onCheckedChange={(checked) => updateFormData('patientAssistancePrograms', {
                          ...formData.patientAssistancePrograms,
                          foundationAssistanceApplied: checked === true
                        })}
                        disabled={readOnly}
                      />
                      <Label htmlFor="foundationAssistanceApplied">Foundation Assistance Applied</Label>
                    </div>

                    {formData.patientAssistancePrograms.foundationAssistanceApplied && (
                      <div className="grid grid-cols-2 gap-4 pl-6">
                        <div>
                          <Label htmlFor="foundationProgram">Foundation Program Name</Label>
                          <Input
                            id="foundationProgram"
                            value={formData.patientAssistancePrograms.foundationProgram}
                            onChange={(e) => updateFormData('patientAssistancePrograms', {
                              ...formData.patientAssistancePrograms,
                              foundationProgram: e.target.value
                            })}
                            disabled={readOnly}
                          />
                        </div>
                        <div>
                          <Label htmlFor="foundationApplicationStatus">Application Status</Label>
                          <Select
                            value={formData.patientAssistancePrograms.foundationApplicationStatus}
                            onValueChange={(value) => updateFormData('patientAssistancePrograms', {
                              ...formData.patientAssistancePrograms,
                              foundationApplicationStatus: value
                            })}
                            disabled={readOnly}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pending">Pending</SelectItem>
                              <SelectItem value="approved">Approved</SelectItem>
                              <SelectItem value="denied">Denied</SelectItem>
                              <SelectItem value="under_review">Under Review</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    )}

                    <div>
                      <Label htmlFor="hospitalCharityCare">Hospital Charity Care</Label>
                      <Select
                        value={formData.patientAssistancePrograms.hospitalCharityCare}
                        onValueChange={(value) => updateFormData('patientAssistancePrograms', {
                          ...formData.patientAssistancePrograms,
                          hospitalCharityCare: value
                        })}
                        disabled={readOnly}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="not_applied">Not Applied</SelectItem>
                          <SelectItem value="applied">Applied</SelectItem>
                          <SelectItem value="approved">Approved</SelectItem>
                          <SelectItem value="denied">Denied</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Restrictions & Eligibility */}
                <div>
                  <h4 className="font-medium mb-4">Restrictions & Eligibility Requirements</h4>
                  <div className="space-y-4">
                    {hasGovernmentInsurance() && (
                      <Alert>
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                          Government insurance restrictions apply. Manufacturer copay cards are not available for patients with Medicare, Medicaid, or other government insurance.
                        </AlertDescription>
                      </Alert>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="incomeVerificationRequired"
                          checked={formData.patientAssistancePrograms.incomeVerificationRequired}
                          onCheckedChange={(checked) => updateFormData('patientAssistancePrograms', {
                            ...formData.patientAssistancePrograms,
                            incomeVerificationRequired: checked === true
                          })}
                          disabled={readOnly}
                        />
                        <Label htmlFor="incomeVerificationRequired" className="text-sm">Income Verification Required</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="assetVerificationRequired"
                          checked={formData.patientAssistancePrograms.assetVerificationRequired}
                          onCheckedChange={(checked) => updateFormData('patientAssistancePrograms', {
                            ...formData.patientAssistancePrograms,
                            assetVerificationRequired: checked === true
                          })}
                          disabled={readOnly}
                        />
                        <Label htmlFor="assetVerificationRequired" className="text-sm">Asset Verification Required</Label>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab 6: Financial Responsibility */}
          <TabsContent value="financial" className="space-y-6 mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Financial Responsibility</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Cost Estimates */}
                <div>
                  <h4 className="font-medium mb-4">Cost Estimates</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="primaryInsuranceResponsibility">Primary Insurance Responsibility</Label>
                      <Input
                        id="primaryInsuranceResponsibility"
                        value={formData.primaryInsuranceResponsibility}
                        onChange={(e) => updateFormData('primaryInsuranceResponsibility', e.target.value)}
                        placeholder="$0.00"
                        disabled={readOnly}
                      />
                    </div>
                    <div>
                      <Label htmlFor="secondaryInsuranceResponsibility">Secondary Insurance Responsibility</Label>
                      <Input
                        id="secondaryInsuranceResponsibility"
                        value={formData.secondaryInsuranceResponsibility}
                        onChange={(e) => updateFormData('secondaryInsuranceResponsibility', e.target.value)}
                        placeholder="$0.00"
                        disabled={readOnly}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <div>
                      <Label htmlFor="patientResponsibilityAfterInsurance">Patient Responsibility After Insurance</Label>
                      <Input
                        id="patientResponsibilityAfterInsurance"
                        value={formData.patientResponsibilityAfterInsurance}
                        onChange={(e) => updateFormData('patientResponsibilityAfterInsurance', e.target.value)}
                        placeholder="$0.00"
                        disabled={readOnly}
                      />
                    </div>
                    <div>
                      <Label htmlFor="estimatedPatientResponsibility">Estimated Patient Responsibility</Label>
                      <Input
                        id="estimatedPatientResponsibility"
                        value={formData.estimatedPatientResponsibility}
                        onChange={(e) => updateFormData('estimatedPatientResponsibility', e.target.value)}
                        placeholder="$0.00"
                        disabled={readOnly}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 mt-4">
                    <div>
                      <Label htmlFor="copayAmountDue">Copay Amount Due</Label>
                      <Input
                        id="copayAmountDue"
                        value={formData.copayAmountDue}
                        onChange={(e) => updateFormData('copayAmountDue', e.target.value)}
                        placeholder="$0.00"
                        disabled={readOnly}
                      />
                    </div>
                    <div>
                      <Label htmlFor="coinsuranceAmountDue">Coinsurance Amount Due</Label>
                      <Input
                        id="coinsuranceAmountDue"
                        value={formData.coinsuranceAmountDue}
                        onChange={(e) => updateFormData('coinsuranceAmountDue', e.target.value)}
                        placeholder="$0.00"
                        disabled={readOnly}
                      />
                    </div>
                    <div>
                      <Label htmlFor="deductibleAmountDue">Deductible Amount Due</Label>
                      <Input
                        id="deductibleAmountDue"
                        value={formData.deductibleAmountDue}
                        onChange={(e) => updateFormData('deductibleAmountDue', e.target.value)}
                        placeholder="$0.00"
                        disabled={readOnly}
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Payment Information */}
                <div>
                  <h4 className="font-medium mb-4">Payment Information</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="paymentMethodPreference">Payment Method Preference</Label>
                      <Select
                        value={formData.paymentMethodPreference}
                        onValueChange={(value) => updateFormData('paymentMethodPreference', value)}
                        disabled={readOnly}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select payment method" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="cash">Cash</SelectItem>
                          <SelectItem value="check">Check</SelectItem>
                          <SelectItem value="credit_card">Credit Card</SelectItem>
                          <SelectItem value="payment_plan">Payment Plan</SelectItem>
                          <SelectItem value="insurance_only">Insurance Only</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="paymentPlanAvailable"
                        checked={formData.paymentPlanAvailable}
                        onCheckedChange={(checked) => updateFormData('paymentPlanAvailable', checked === true)}
                        disabled={readOnly}
                      />
                      <Label htmlFor="paymentPlanAvailable">Payment Plan Available</Label>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="depositRequired"
                        checked={formData.depositRequired}
                        onCheckedChange={(checked) => updateFormData('depositRequired', checked === true)}
                        disabled={readOnly}
                      />
                      <Label htmlFor="depositRequired">Deposit Required</Label>
                    </div>
                    {formData.depositRequired && (
                      <div>
                        <Label htmlFor="depositAmount">Deposit Amount</Label>
                        <Input
                          id="depositAmount"
                          value={formData.depositAmount}
                          onChange={(e) => updateFormData('depositAmount', e.target.value)}
                          placeholder="$0.00"
                          disabled={readOnly}
                        />
                      </div>
                    )}
                  </div>

                  <div className="flex items-center space-x-2 mt-4">
                    <Checkbox
                      id="financialHardshipIdentified"
                      checked={formData.financialHardshipIdentified}
                      onCheckedChange={(checked) => updateFormData('financialHardshipIdentified', checked === true)}
                      disabled={readOnly}
                    />
                    <Label htmlFor="financialHardshipIdentified">Financial Hardship Identified</Label>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Section Navigation */}
        <div className="mt-8 pt-6 border-t border-border/20">
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              Insurance Information Section
            </div>
            <div className="flex items-center gap-4">
              <div className="text-sm text-muted-foreground">
                Next: Therapy Information
              </div>
              <Button size="sm" className="bg-primary/10 text-primary hover:bg-primary/20">
                Continue to Therapy →
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Default data structure for initialization
export const createEmptyComprehensiveInsuranceData = (): ComprehensiveInsuranceData => ({
  numberOfPlans: 0,
  insuranceCategories: [],
  governmentSubTypes: [],
  coverageTypes: [],
  insuranceCoverages: [],
  coordinationOfBenefits: {
    primaryPayer: '',
    secondaryPayer: '',
    tertiaryPayer: '',
    cobMethod: '',
    autoCobProcessing: false,
    birthdayRuleOverride: false,
    birthdayRuleReason: '',
    workingAgedBeneficiary: false,
    employerSize: '',
    activeEmployment: false,
    cobraCoverage: false,
    spouseEmploymentStatus: '',
    esrdStatus: false,
    mspQuestionnaireDate: '',
    mspDevelopmentStatus: ''
  },
  patientAssistancePrograms: {
    manufacturerCopayCard: false,
    copayCardEligibility: '',
    copayCardAnnualMax: '',
    copayCardUsedToDate: '',
    manufacturerSupportProgram: false,
    hubServicesProgram: false,
    hubServicesContact: '',
    foundationAssistanceApplied: false,
    foundationProgram: '',
    foundationApplicationStatus: '',
    foundationAwardAmount: '',
    hospitalCharityCare: '',
    stateAssistancePrograms: '',
    federalAssistancePrograms: '',
    governmentInsuranceRestriction: false,
    incomeVerificationRequired: false,
    assetVerificationRequired: false
  },
  estimatedPatientResponsibility: '',
  primaryInsuranceResponsibility: '',
  secondaryInsuranceResponsibility: '',
  patientResponsibilityAfterInsurance: '',
  copayAmountDue: '',
  coinsuranceAmountDue: '',
  deductibleAmountDue: '',
  unmetDeductibleBalance: '',
  paymentMethodPreference: '',
  paymentPlanAvailable: false,
  depositRequired: false,
  depositAmount: '',
  financialHardshipIdentified: false
});

// Export types
export type { ComprehensiveInsuranceData, InsuranceCoverage };