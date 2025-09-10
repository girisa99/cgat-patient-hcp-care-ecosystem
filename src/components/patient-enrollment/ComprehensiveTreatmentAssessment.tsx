/**
 * COMPREHENSIVE TREATMENT & CLINICAL ASSESSMENT
 * Combines therapy, clinical, and medical review with smart pre-population
 * 8 tabs focused on enrollment-specific activities rather than redundant data collection
 */
import React, { useState, useEffect } from 'react';
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
  FileText, 
  UserCheck, 
  Stethoscope,
  Calendar,
  DollarSign,
  FileCheck,
  Smartphone,
  ClipboardList,
  Activity,
  CheckCircle2,
  AlertCircle,
  User,
  Phone,
  Shield,
  Heart,
  CreditCard
} from 'lucide-react';

// Pre-populated data interfaces
interface PrePopulatedData {
  // From Provider Section
  treatingPhysician: {
    name: string;
    npi: string;
    specialty: string;
    phone: string;
    email: string;
  };
  facility: {
    name: string;
    address: string;
    phone: string;
    emergencyContact: string;
  };
  
  // From Insurance Section
  coverage: {
    primaryInsurance: string;
    policyNumber: string;
    groupNumber: string;
    copayAmount: string;
    deductibleRemaining: string;
    outOfPocketMax: string;
    priorAuthStatus: string;
  };
  
  // From Referral Section
  referringPhysician: {
    name: string;
    npi: string;
    specialty: string;
    phone: string;
    practiceName: string;
  };
  
  // From Treatment Section
  treatment: {
    therapyType: string;
    productName: string;
    ndcCodes: string[];
    distributionMethod: string;
  };
  
  // From Basic Demographics
  patient: {
    fullName: string;
    dateOfBirth: string;
    phone: string;
    email: string;
    address: string;
  };
}

interface ComprehensiveTreatmentAssessmentData {
  // Tab 1: Identity Verification & Documentation
  identityVerification: {
    photoIdVerificationCompleted: boolean;
    photoIdTypeVerified: string;
    secondaryIdCrossVerification: boolean;
    patientPhotoCaptured: boolean;
    biometricDataAvailable: boolean;
    identityVerificationWitness: string;
    identityVerificationDateTime: string;
    identityDiscrepanciesFound: boolean;
    identityDiscrepancyDetails: string;
  };
  
  // Tab 2: Clinical Readiness Assessment
  clinicalReadiness: {
    treatmentReadinessAssessment: string;
    performanceStatusCurrent: string;
    diseaseStatusAtEnrollment: string;
    recentHospitalizations: boolean;
    activeInfections: boolean;
    currentFunctionalCapacity: boolean;
    requiredPreTreatmentLabs: boolean;
    cardiacClearance: string;
    pulmonaryFunction: string;
    infectionScreening: string;
    pregnancyTest: string;
    vaccinationStatus: string;
    absoluteContraindications: string;
    relativeContraindications: string;
    drugInteractionCheck: boolean;
    priorSevereAdverseReactions: string;
  };
  
  // Tab 3: Care Coordination & Logistics Setup
  careCoordination: {
    careCoordinatorAssigned: string;
    primaryNurseAssignment: string;
    caseManagerAssignment: string;
    socialWorkerConsultation: string;
    transportationPlan: string;
    lodgingArrangements: string;
    caregiverSupportIdentified: string;
    emergencyContact24x7: string;
    distanceFromTreatmentCenter: string;
    preferredContactMethodAppointments: string;
    familyCommunicationPreferences: string;
    languageInterpreterServices: string;
    patientPortalRegistration: string;
  };
  
  // Tab 4: Financial Counseling & Support Services
  financialCounseling: {
    financialCounselingCompleted: boolean;
    outOfPocketCostEstimateProvided: boolean;
    outOfPocketAmount: string;
    paymentPlanRequired: boolean;
    paymentPlanTerms: string;
    financialHardshipIdentified: boolean;
    patientAssistanceProgramsApplied: string[];
    nutritionConsultation: string;
    pharmacyConsultation: string;
    specialtyPharmacyCoordination: string;
    homeHealthServices: string;
  };
  
  // Tab 5: Consent & Legal Documentation
  consentLegal: {
    treatmentConsentStatus: string;
    consentDate: string;
    consentingPhysician: string;
    capacityAssessment: string;
    researchClinicalTrialConsent: string;
    codeStatusDiscussed: boolean;
    advancedDirectiveReview: string;
    healthcareProxyConfirmed: string;
    treatmentGoalsDiscussion: string;
    hipaaAuthorization: boolean;
    communicationConsent: string;
    photographyVideoConsent: boolean;
  };
  
  // Tab 6: Technology & Monitoring Setup
  technologyMonitoring: {
    remoteMonitoringRequired: boolean;
    technologyAssessment: string;
    deviceDistribution: string;
    trainingProvided: boolean;
    technicalSupportContact: string;
    secureMessagingSetup: string;
    telehealthCapability: string;
    emergencyCommunicationPlan: string;
  };
}

interface ComprehensiveTreatmentAssessmentProps {
  formData: ComprehensiveTreatmentAssessmentData;
  updateFormData: (field: keyof ComprehensiveTreatmentAssessmentData, value: any) => void;
  prePopulatedData?: PrePopulatedData;
  readOnly?: boolean;
}

export const ComprehensiveTreatmentAssessment: React.FC<ComprehensiveTreatmentAssessmentProps> = ({
  formData,
  updateFormData,
  prePopulatedData,
  readOnly = false
}) => {
  const [activeTab, setActiveTab] = useState("identity-verification");
  const [prePopulationStatus, setPrePopulationStatus] = useState({
    provider: false,
    insurance: false,
    referral: false,
    treatment: false,
    demographics: false
  });

  // Pre-population effect
  useEffect(() => {
    if (prePopulatedData) {
      // Update pre-population status
      setPrePopulationStatus({
        provider: !!(prePopulatedData.treatingPhysician.name),
        insurance: !!(prePopulatedData.coverage.primaryInsurance),
        referral: !!(prePopulatedData.referringPhysician.name),
        treatment: !!(prePopulatedData.treatment.therapyType),
        demographics: !!(prePopulatedData.patient.fullName)
      });
    }
  }, [prePopulatedData]);

  const handleFieldUpdate = (section: keyof ComprehensiveTreatmentAssessmentData, field: string, value: any) => {
    updateFormData(section, {
      ...formData[section],
      [field]: value
    });
  };

  const PrePopulationStatus = () => (
    <div className="mb-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4" />
            Pre-Population Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-5 gap-2">
            {Object.entries(prePopulationStatus).map(([key, status]) => (
              <Badge 
                key={key} 
                variant={status ? "default" : "secondary"}
                className="justify-center"
              >
                {status ? <CheckCircle2 className="h-3 w-3 mr-1" /> : <AlertCircle className="h-3 w-3 mr-1" />}
                {key.charAt(0).toUpperCase() + key.slice(1)}
              </Badge>
            ))}
          </div>
          {prePopulatedData && (
            <div className="mt-3 text-sm text-muted-foreground">
              Auto-populated: Patient {prePopulatedData.patient.fullName} • 
              Therapy {prePopulatedData.treatment.therapyType} • 
              Provider {prePopulatedData.treatingPhysician.name}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Treatment & Clinical Assessment
        </CardTitle>
        <div className="text-sm text-muted-foreground">
          Enrollment-specific assessment and preparation with smart pre-population from previous sections
        </div>
      </CardHeader>
      <CardContent>
        <PrePopulationStatus />
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList level="child" className="grid w-full grid-cols-3 lg:grid-cols-6 text-xs">
            <TabsTrigger level="child" value="identity-verification" className="flex flex-col items-center gap-1 p-2">
              <UserCheck className="h-3 w-3" />
              <span className="hidden lg:inline">Identity</span>
            </TabsTrigger>
            <TabsTrigger level="child" value="clinical-readiness" className="flex flex-col items-center gap-1 p-2">
              <Stethoscope className="h-3 w-3" />
              <span className="hidden lg:inline">Clinical</span>
            </TabsTrigger>
            <TabsTrigger level="child" value="care-coordination" className="flex flex-col items-center gap-1 p-2">
              <Calendar className="h-3 w-3" />
              <span className="hidden lg:inline">Care Coord</span>
            </TabsTrigger>
            <TabsTrigger level="child" value="financial-counseling" className="flex flex-col items-center gap-1 p-2">
              <DollarSign className="h-3 w-3" />
              <span className="hidden lg:inline">Financial</span>
            </TabsTrigger>
            <TabsTrigger level="child" value="consent-legal" className="flex flex-col items-center gap-1 p-2">
              <FileCheck className="h-3 w-3" />
              <span className="hidden lg:inline">Consent</span>
            </TabsTrigger>
            <TabsTrigger level="child" value="technology-monitoring" className="flex flex-col items-center gap-1 p-2">
              <Smartphone className="h-3 w-3" />
              <span className="hidden lg:inline">Tech</span>
            </TabsTrigger>
          </TabsList>

          {/* Tab 1: Identity Verification & Documentation */}
          <TabsContent value="identity-verification" className="space-y-6 mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <UserCheck className="h-5 w-5" />
                  Enhanced Identity Verification
                </CardTitle>
                <div className="text-sm text-muted-foreground">
                  Unique to enrollment - enhanced verification for high-value treatments
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="photoIdVerificationCompleted"
                      checked={formData.identityVerification.photoIdVerificationCompleted}
                      onCheckedChange={(checked) => handleFieldUpdate('identityVerification', 'photoIdVerificationCompleted', checked === true)}
                      disabled={readOnly}
                    />
                    <Label htmlFor="photoIdVerificationCompleted">Photo ID Verification Completed *</Label>
                  </div>
                  <div>
                    <Label htmlFor="photoIdTypeVerified">Photo ID Type Verified *</Label>
                    <Select
                      value={formData.identityVerification.photoIdTypeVerified}
                      onValueChange={(value) => handleFieldUpdate('identityVerification', 'photoIdTypeVerified', value)}
                      disabled={readOnly}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select ID type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="drivers_license">Driver's License</SelectItem>
                        <SelectItem value="passport">Passport</SelectItem>
                        <SelectItem value="state_id">State ID</SelectItem>
                        <SelectItem value="military_id">Military ID</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="secondaryIdCrossVerification"
                      checked={formData.identityVerification.secondaryIdCrossVerification}
                      onCheckedChange={(checked) => handleFieldUpdate('identityVerification', 'secondaryIdCrossVerification', checked === true)}
                      disabled={readOnly}
                    />
                    <Label htmlFor="secondaryIdCrossVerification">Secondary ID Cross-Verification (SSN, DOB match) *</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="patientPhotoCaptured"
                      checked={formData.identityVerification.patientPhotoCaptured}
                      onCheckedChange={(checked) => handleFieldUpdate('identityVerification', 'patientPhotoCaptured', checked === true)}
                      disabled={readOnly}
                    />
                    <Label htmlFor="patientPhotoCaptured">Patient Photo Captured (for treatment verification) *</Label>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="identityVerificationWitness">Identity Verification Witness (Staff Member) *</Label>
                    <Input
                      id="identityVerificationWitness"
                      value={formData.identityVerification.identityVerificationWitness}
                      onChange={(e) => handleFieldUpdate('identityVerification', 'identityVerificationWitness', e.target.value)}
                      disabled={readOnly}
                    />
                  </div>
                  <div>
                    <Label htmlFor="identityVerificationDateTime">Identity Verification Date/Time *</Label>
                    <Input
                      id="identityVerificationDateTime"
                      type="datetime-local"
                      value={formData.identityVerification.identityVerificationDateTime}
                      onChange={(e) => handleFieldUpdate('identityVerification', 'identityVerificationDateTime', e.target.value)}
                      disabled={readOnly}
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="identityDiscrepanciesFound"
                    checked={formData.identityVerification.identityDiscrepanciesFound}
                    onCheckedChange={(checked) => handleFieldUpdate('identityVerification', 'identityDiscrepanciesFound', checked === true)}
                    disabled={readOnly}
                  />
                  <Label htmlFor="identityDiscrepanciesFound">Identity Discrepancies Found</Label>
                </div>

                {formData.identityVerification.identityDiscrepanciesFound && (
                  <div>
                    <Label htmlFor="identityDiscrepancyDetails">Identity Discrepancy Details</Label>
                    <Textarea
                      id="identityDiscrepancyDetails"
                      value={formData.identityVerification.identityDiscrepancyDetails}
                      onChange={(e) => handleFieldUpdate('identityVerification', 'identityDiscrepancyDetails', e.target.value)}
                      disabled={readOnly}
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab 2: Clinical Readiness Assessment */}
          <TabsContent value="clinical-readiness" className="space-y-6 mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Stethoscope className="h-5 w-5" />
                  Current Clinical Status
                </CardTitle>
                <div className="text-sm text-muted-foreground">
                  Treatment-specific readiness assessment beyond basic medical info
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="treatmentReadinessAssessment">Treatment Readiness Assessment *</Label>
                    <Select
                      value={formData.clinicalReadiness.treatmentReadinessAssessment}
                      onValueChange={(value) => handleFieldUpdate('clinicalReadiness', 'treatmentReadinessAssessment', value)}
                      disabled={readOnly}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select readiness" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ready">Ready</SelectItem>
                        <SelectItem value="needs_optimization">Needs Optimization</SelectItem>
                        <SelectItem value="not_ready">Not Ready</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="performanceStatusCurrent">Performance Status Current *</Label>
                    <Select
                      value={formData.clinicalReadiness.performanceStatusCurrent}
                      onValueChange={(value) => handleFieldUpdate('clinicalReadiness', 'performanceStatusCurrent', value)}
                      disabled={readOnly}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0">ECOG 0 - Fully active</SelectItem>
                        <SelectItem value="1">ECOG 1 - Restricted in strenuous activity</SelectItem>
                        <SelectItem value="2">ECOG 2 - Ambulatory, up &gt;50% of time</SelectItem>
                        <SelectItem value="3">ECOG 3 - Confined to bed/chair &gt;50% of time</SelectItem>
                        <SelectItem value="4">ECOG 4 - Completely disabled</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="diseaseStatusAtEnrollment">Disease Status at Enrollment *</Label>
                    <Input
                      id="diseaseStatusAtEnrollment"
                      value={formData.clinicalReadiness.diseaseStatusAtEnrollment}
                      onChange={(e) => handleFieldUpdate('clinicalReadiness', 'diseaseStatusAtEnrollment', e.target.value)}
                      placeholder="vs. at referral"
                      disabled={readOnly}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="recentHospitalizations"
                      checked={formData.clinicalReadiness.recentHospitalizations}
                      onCheckedChange={(checked) => handleFieldUpdate('clinicalReadiness', 'recentHospitalizations', checked === true)}
                      disabled={readOnly}
                    />
                    <Label htmlFor="recentHospitalizations">Recent Hospitalizations (within 30 days) *</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="activeInfections"
                      checked={formData.clinicalReadiness.activeInfections}
                      onCheckedChange={(checked) => handleFieldUpdate('clinicalReadiness', 'activeInfections', checked === true)}
                      disabled={readOnly}
                    />
                    <Label htmlFor="activeInfections">Active Infections *</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="currentFunctionalCapacity"
                      checked={formData.clinicalReadiness.currentFunctionalCapacity}
                      onCheckedChange={(checked) => handleFieldUpdate('clinicalReadiness', 'currentFunctionalCapacity', checked === true)}
                      disabled={readOnly}
                    />
                    <Label htmlFor="currentFunctionalCapacity">Can Perform ADLs *</Label>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Pre-Treatment Screening Results</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="requiredPreTreatmentLabs"
                      checked={formData.clinicalReadiness.requiredPreTreatmentLabs}
                      onCheckedChange={(checked) => handleFieldUpdate('clinicalReadiness', 'requiredPreTreatmentLabs', checked === true)}
                      disabled={readOnly}
                    />
                    <Label htmlFor="requiredPreTreatmentLabs">Required Pre-Treatment Labs (completed within timeframe) *</Label>
                  </div>
                  <div>
                    <Label htmlFor="cardiacClearance">Cardiac Clearance *</Label>
                    <Select
                      value={formData.clinicalReadiness.cardiacClearance}
                      onValueChange={(value) => handleFieldUpdate('clinicalReadiness', 'cardiacClearance', value)}
                      disabled={readOnly}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="required">Required</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="not_required">Not Required</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="infectionScreening">Infection Screening (Hepatitis, CMV, HIV) *</Label>
                    <Select
                      value={formData.clinicalReadiness.infectionScreening}
                      onValueChange={(value) => handleFieldUpdate('clinicalReadiness', 'infectionScreening', value)}
                      disabled={readOnly}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="completed_negative">Completed - Negative</SelectItem>
                        <SelectItem value="completed_positive">Completed - Positive</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="not_required">Not Required</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="pregnancyTest">Pregnancy Test (if applicable) *</Label>
                    <Select
                      value={formData.clinicalReadiness.pregnancyTest}
                      onValueChange={(value) => handleFieldUpdate('clinicalReadiness', 'pregnancyTest', value)}
                      disabled={readOnly}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="completed_negative">Completed - Negative</SelectItem>
                        <SelectItem value="completed_positive">Completed - Positive</SelectItem>
                        <SelectItem value="not_applicable">Not Applicable</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Treatment-Specific Contraindications</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="absoluteContraindications">Absolute Contraindications *</Label>
                  <Textarea
                    id="absoluteContraindications"
                    value={formData.clinicalReadiness.absoluteContraindications}
                    onChange={(e) => handleFieldUpdate('clinicalReadiness', 'absoluteContraindications', e.target.value)}
                    placeholder="None identified / List contraindications"
                    disabled={readOnly}
                  />
                </div>

                <div>
                  <Label htmlFor="relativeContraindications">Relative Contraindications *</Label>
                  <Textarea
                    id="relativeContraindications"
                    value={formData.clinicalReadiness.relativeContraindications}
                    onChange={(e) => handleFieldUpdate('clinicalReadiness', 'relativeContraindications', e.target.value)}
                    placeholder="None identified / Physician reviewed"
                    disabled={readOnly}
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="drugInteractionCheck"
                    checked={formData.clinicalReadiness.drugInteractionCheck}
                    onCheckedChange={(checked) => handleFieldUpdate('clinicalReadiness', 'drugInteractionCheck', checked === true)}
                    disabled={readOnly}
                  />
                  <Label htmlFor="drugInteractionCheck">Drug Interaction Check Completed *</Label>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab 3: Care Coordination & Logistics Setup */}
          <TabsContent value="care-coordination" className="space-y-6 mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Treatment Episode Coordination
                </CardTitle>
                <div className="text-sm text-muted-foreground">
                  Operational coordination beyond basic referral info
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="careCoordinatorAssigned">Care Coordinator Assigned *</Label>
                    <Input
                      id="careCoordinatorAssigned"
                      value={formData.careCoordination.careCoordinatorAssigned}
                      onChange={(e) => handleFieldUpdate('careCoordination', 'careCoordinatorAssigned', e.target.value)}
                      placeholder="Name/Contact"
                      disabled={readOnly}
                    />
                  </div>
                  <div>
                    <Label htmlFor="primaryNurseAssignment">Primary Nurse Assignment *</Label>
                    <Input
                      id="primaryNurseAssignment"
                      value={formData.careCoordination.primaryNurseAssignment}
                      onChange={(e) => handleFieldUpdate('careCoordination', 'primaryNurseAssignment', e.target.value)}
                      placeholder="For this treatment episode"
                      disabled={readOnly}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="caseManagerAssignment">Case Manager Assignment</Label>
                    <Select
                      value={formData.careCoordination.caseManagerAssignment}
                      onValueChange={(value) => handleFieldUpdate('careCoordination', 'caseManagerAssignment', value)}
                      disabled={readOnly}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="assigned">Assigned</SelectItem>
                        <SelectItem value="not_required">Not Required</SelectItem>
                        <SelectItem value="pending_insurance">Pending Insurance Requirement</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="socialWorkerConsultation">Social Worker Consultation *</Label>
                    <Select
                      value={formData.careCoordination.socialWorkerConsultation}
                      onValueChange={(value) => handleFieldUpdate('careCoordination', 'socialWorkerConsultation', value)}
                      disabled={readOnly}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="scheduled">Scheduled</SelectItem>
                        <SelectItem value="not_needed">Not Needed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Logistical Planning</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="transportationPlan">Transportation Plan *</Label>
                  <Textarea
                    id="transportationPlan"
                    value={formData.careCoordination.transportationPlan}
                    onChange={(e) => handleFieldUpdate('careCoordination', 'transportationPlan', e.target.value)}
                    placeholder="How patient gets to appointments"
                    disabled={readOnly}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="lodgingArrangements">Lodging Arrangements *</Label>
                    <Select
                      value={formData.careCoordination.lodgingArrangements}
                      onValueChange={(value) => handleFieldUpdate('careCoordination', 'lodgingArrangements', value)}
                      disabled={readOnly}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select arrangement" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="local">Local</SelectItem>
                        <SelectItem value="hotel_assistance">Hotel Assistance</SelectItem>
                        <SelectItem value="family">Family</SelectItem>
                        <SelectItem value="not_needed">Not Needed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="distanceFromTreatmentCenter">Distance from Treatment Center (miles) *</Label>
                    <Input
                      id="distanceFromTreatmentCenter"
                      type="number"
                      value={formData.careCoordination.distanceFromTreatmentCenter}
                      onChange={(e) => handleFieldUpdate('careCoordination', 'distanceFromTreatmentCenter', e.target.value)}
                      placeholder="For emergency planning"
                      disabled={readOnly}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="caregiverSupportIdentified">Caregiver Support Identified *</Label>
                  <Input
                    id="caregiverSupportIdentified"
                    value={formData.careCoordination.caregiverSupportIdentified}
                    onChange={(e) => handleFieldUpdate('careCoordination', 'caregiverSupportIdentified', e.target.value)}
                    placeholder="Name/Relationship/Availability"
                    disabled={readOnly}
                  />
                </div>

                <div>
                  <Label htmlFor="emergencyContact24x7">Emergency Contact 24/7 *</Label>
                  <Input
                    id="emergencyContact24x7"
                    value={formData.careCoordination.emergencyContact24x7}
                    onChange={(e) => handleFieldUpdate('careCoordination', 'emergencyContact24x7', e.target.value)}
                    placeholder="Who to call during treatment"
                    disabled={readOnly}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Communication Preferences Setup</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="preferredContactMethodAppointments">Preferred Contact Method for Appointments *</Label>
                    <Select
                      value={formData.careCoordination.preferredContactMethodAppointments}
                      onValueChange={(value) => handleFieldUpdate('careCoordination', 'preferredContactMethodAppointments', value)}
                      disabled={readOnly}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select method" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="phone">Phone</SelectItem>
                        <SelectItem value="email">Email</SelectItem>
                        <SelectItem value="text">Text Message</SelectItem>
                        <SelectItem value="patient_portal">Patient Portal</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="familyCommunicationPreferences">Family Communication Preferences *</Label>
                    <Select
                      value={formData.careCoordination.familyCommunicationPreferences}
                      onValueChange={(value) => handleFieldUpdate('careCoordination', 'familyCommunicationPreferences', value)}
                      disabled={readOnly}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select preference" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="include_all">Include in All Communications</SelectItem>
                        <SelectItem value="include_some">Include in Some Communications</SelectItem>
                        <SelectItem value="include_none">No Family Communications</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="languageInterpreterServices">Language/Interpreter Services *</Label>
                    <Input
                      id="languageInterpreterServices"
                      value={formData.careCoordination.languageInterpreterServices}
                      onChange={(e) => handleFieldUpdate('careCoordination', 'languageInterpreterServices', e.target.value)}
                      placeholder="Needed/Language/Arranged"
                      disabled={readOnly}
                    />
                  </div>
                  <div>
                    <Label htmlFor="patientPortalRegistration">Patient Portal Registration *</Label>
                    <Select
                      value={formData.careCoordination.patientPortalRegistration}
                      onValueChange={(value) => handleFieldUpdate('careCoordination', 'patientPortalRegistration', value)}
                      disabled={readOnly}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="declined">Declined</SelectItem>
                        <SelectItem value="needs_assistance">Needs Assistance</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab 4: Financial Counseling & Support Services */}
          <TabsContent value="financial-counseling" className="space-y-6 mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Financial Assessment & Planning
                </CardTitle>
                <div className="text-sm text-muted-foreground">
                  Beyond basic insurance - actual financial planning with pre-populated coverage details
                </div>
                {prePopulatedData?.coverage.primaryInsurance && (
                  <Alert>
                    <CreditCard className="h-4 w-4" />
                    <AlertDescription>
                      Pre-populated from Insurance: {prePopulatedData.coverage.primaryInsurance} • 
                      Estimated Patient Responsibility: ${prePopulatedData.coverage.copayAmount || 'TBD'}
                    </AlertDescription>
                  </Alert>
                )}
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="financialCounselingCompleted"
                      checked={formData.financialCounseling.financialCounselingCompleted}
                      onCheckedChange={(checked) => handleFieldUpdate('financialCounseling', 'financialCounselingCompleted', checked === true)}
                      disabled={readOnly}
                    />
                    <Label htmlFor="financialCounselingCompleted">Financial Counseling Completed *</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="outOfPocketCostEstimateProvided"
                      checked={formData.financialCounseling.outOfPocketCostEstimateProvided}
                      onCheckedChange={(checked) => handleFieldUpdate('financialCounseling', 'outOfPocketCostEstimateProvided', checked === true)}
                      disabled={readOnly}
                    />
                    <Label htmlFor="outOfPocketCostEstimateProvided">Out-of-Pocket Cost Estimate Provided *</Label>
                  </div>
                </div>

                {formData.financialCounseling.outOfPocketCostEstimateProvided && (
                  <div>
                    <Label htmlFor="outOfPocketAmount">Estimated Out-of-Pocket Amount</Label>
                    <Input
                      id="outOfPocketAmount"
                      type="number"
                      value={formData.financialCounseling.outOfPocketAmount}
                      onChange={(e) => handleFieldUpdate('financialCounseling', 'outOfPocketAmount', e.target.value)}
                      placeholder="$0.00"
                      disabled={readOnly}
                    />
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="paymentPlanRequired"
                      checked={formData.financialCounseling.paymentPlanRequired}
                      onCheckedChange={(checked) => handleFieldUpdate('financialCounseling', 'paymentPlanRequired', checked === true)}
                      disabled={readOnly}
                    />
                    <Label htmlFor="paymentPlanRequired">Payment Plan Required *</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="financialHardshipIdentified"
                      checked={formData.financialCounseling.financialHardshipIdentified}
                      onCheckedChange={(checked) => handleFieldUpdate('financialCounseling', 'financialHardshipIdentified', checked === true)}
                      disabled={readOnly}
                    />
                    <Label htmlFor="financialHardshipIdentified">Financial Hardship Identified *</Label>
                  </div>
                </div>

                {formData.financialCounseling.paymentPlanRequired && (
                  <div>
                    <Label htmlFor="paymentPlanTerms">Payment Plan Terms</Label>
                    <Textarea
                      id="paymentPlanTerms"
                      value={formData.financialCounseling.paymentPlanTerms}
                      onChange={(e) => handleFieldUpdate('financialCounseling', 'paymentPlanTerms', e.target.value)}
                      placeholder="Terms agreed upon"
                      disabled={readOnly}
                    />
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Support Services Coordination</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="nutritionConsultation">Nutrition Consultation *</Label>
                    <Select
                      value={formData.financialCounseling.nutritionConsultation}
                      onValueChange={(value) => handleFieldUpdate('financialCounseling', 'nutritionConsultation', value)}
                      disabled={readOnly}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="required">Required</SelectItem>
                        <SelectItem value="scheduled">Scheduled</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="not_required">Not Required</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="pharmacyConsultation">Pharmacy Consultation *</Label>
                    <Select
                      value={formData.financialCounseling.pharmacyConsultation}
                      onValueChange={(value) => handleFieldUpdate('financialCounseling', 'pharmacyConsultation', value)}
                      disabled={readOnly}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="required">Required</SelectItem>
                        <SelectItem value="scheduled">Scheduled</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="not_required">Not Required</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="specialtyPharmacyCoordination">Specialty Pharmacy Coordination *</Label>
                    <Select
                      value={formData.financialCounseling.specialtyPharmacyCoordination}
                      onValueChange={(value) => handleFieldUpdate('financialCounseling', 'specialtyPharmacyCoordination', value)}
                      disabled={readOnly}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="assigned">Assigned</SelectItem>
                        <SelectItem value="contacted">Contacted</SelectItem>
                        <SelectItem value="enrolled">Enrolled</SelectItem>
                        <SelectItem value="not_applicable">Not Applicable</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="homeHealthServices">Home Health Services</Label>
                    <Select
                      value={formData.financialCounseling.homeHealthServices}
                      onValueChange={(value) => handleFieldUpdate('financialCounseling', 'homeHealthServices', value)}
                      disabled={readOnly}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="needed">Needed</SelectItem>
                        <SelectItem value="arranged">Arranged</SelectItem>
                        <SelectItem value="not_applicable">Not Applicable</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab 5: Consent & Legal Documentation */}
          <TabsContent value="consent-legal" className="space-y-6 mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <FileCheck className="h-5 w-5" />
                  Treatment-Specific Consents
                </CardTitle>
                <div className="text-sm text-muted-foreground">
                  Beyond basic demographics - treatment-specific legal documentation
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="treatmentConsentStatus">Treatment Consent Status *</Label>
                    <Select
                      value={formData.consentLegal.treatmentConsentStatus}
                      onValueChange={(value) => handleFieldUpdate('consentLegal', 'treatmentConsentStatus', value)}
                      disabled={readOnly}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="obtained">Obtained</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="refused">Refused</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="consentDate">Consent Date *</Label>
                    <Input
                      id="consentDate"
                      type="date"
                      value={formData.consentLegal.consentDate}
                      onChange={(e) => handleFieldUpdate('consentLegal', 'consentDate', e.target.value)}
                      disabled={readOnly}
                    />
                  </div>
                  <div>
                    <Label htmlFor="consentingPhysician">Consenting Physician *</Label>
                    <Input
                      id="consentingPhysician"
                      value={formData.consentLegal.consentingPhysician}
                      onChange={(e) => handleFieldUpdate('consentLegal', 'consentingPhysician', e.target.value)}
                      disabled={readOnly}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="capacityAssessment">Capacity Assessment *</Label>
                    <Select
                      value={formData.consentLegal.capacityAssessment}
                      onValueChange={(value) => handleFieldUpdate('consentLegal', 'capacityAssessment', value)}
                      disabled={readOnly}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="patient_capable">Patient Capable</SelectItem>
                        <SelectItem value="guardian_required">Guardian Required</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="researchClinicalTrialConsent">Research/Clinical Trial Consent</Label>
                    <Select
                      value={formData.consentLegal.researchClinicalTrialConsent}
                      onValueChange={(value) => handleFieldUpdate('consentLegal', 'researchClinicalTrialConsent', value)}
                      disabled={readOnly}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="applicable">Applicable</SelectItem>
                        <SelectItem value="obtained">Obtained</SelectItem>
                        <SelectItem value="declined">Declined</SelectItem>
                        <SelectItem value="not_applicable">Not Applicable</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Advanced Directives & Preferences</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="codeStatusDiscussed"
                      checked={formData.consentLegal.codeStatusDiscussed}
                      onCheckedChange={(checked) => handleFieldUpdate('consentLegal', 'codeStatusDiscussed', checked === true)}
                      disabled={readOnly}
                    />
                    <Label htmlFor="codeStatusDiscussed">Code Status Discussed (Full Code/DNR) *</Label>
                  </div>
                  <div>
                    <Label htmlFor="treatmentGoalsDiscussion">Treatment Goals Discussion *</Label>
                    <Select
                      value={formData.consentLegal.treatmentGoalsDiscussion}
                      onValueChange={(value) => handleFieldUpdate('consentLegal', 'treatmentGoalsDiscussion', value)}
                      disabled={readOnly}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select goal" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="curative">Curative</SelectItem>
                        <SelectItem value="palliative">Palliative</SelectItem>
                        <SelectItem value="comfort">Comfort</SelectItem>
                        <SelectItem value="bridge_therapy">Bridge Therapy</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="advancedDirectiveReview">Advanced Directive Review *</Label>
                    <Select
                      value={formData.consentLegal.advancedDirectiveReview}
                      onValueChange={(value) => handleFieldUpdate('consentLegal', 'advancedDirectiveReview', value)}
                      disabled={readOnly}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="current">Current</SelectItem>
                        <SelectItem value="needs_updating">Needs Updating</SelectItem>
                        <SelectItem value="none">None</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="healthcareProxyConfirmed">Healthcare Proxy Confirmed</Label>
                    <Input
                      id="healthcareProxyConfirmed"
                      value={formData.consentLegal.healthcareProxyConfirmed}
                      onChange={(e) => handleFieldUpdate('consentLegal', 'healthcareProxyConfirmed', e.target.value)}
                      placeholder="Yes/Contact Info/No/Not Applicable"
                      disabled={readOnly}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Privacy & Communication Consents</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="hipaaAuthorization"
                      checked={formData.consentLegal.hipaaAuthorization}
                      onCheckedChange={(checked) => handleFieldUpdate('consentLegal', 'hipaaAuthorization', checked === true)}
                      disabled={readOnly}
                    />
                    <Label htmlFor="hipaaAuthorization">HIPAA Authorization Signed *</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="photographyVideoConsent"
                      checked={formData.consentLegal.photographyVideoConsent}
                      onCheckedChange={(checked) => handleFieldUpdate('consentLegal', 'photographyVideoConsent', checked === true)}
                      disabled={readOnly}
                    />
                    <Label htmlFor="photographyVideoConsent">Photography/Video Consent</Label>
                  </div>
                  <div>
                    <Label htmlFor="communicationConsent">Communication Consent (Family Involvement) *</Label>
                    <Select
                      value={formData.consentLegal.communicationConsent}
                      onValueChange={(value) => handleFieldUpdate('consentLegal', 'communicationConsent', value)}
                      disabled={readOnly}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="full_involvement">Full Involvement</SelectItem>
                        <SelectItem value="limited_involvement">Limited Involvement</SelectItem>
                        <SelectItem value="no_involvement">No Involvement</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Remaining tabs would continue with similar structure... */}
          {/* For brevity, I'll add placeholders for the remaining tabs */}
          
          <TabsContent value="technology-monitoring" className="space-y-6 mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Smartphone className="h-5 w-5" />
                  Technology & Monitoring Setup
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="text-sm text-muted-foreground mb-4">
                  Configure technology infrastructure and remote monitoring for treatment oversight
                </div>

                {/* Remote Monitoring Section */}
                <div className="space-y-4">
                  <h4 className="font-medium text-base">Remote Monitoring Requirements</h4>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="remoteMonitoringRequired"
                        checked={formData.technologyMonitoring.remoteMonitoringRequired}
                        onCheckedChange={(checked) => handleFieldUpdate('technologyMonitoring', 'remoteMonitoringRequired', checked === true)}
                        disabled={readOnly}
                      />
                      <Label htmlFor="remoteMonitoringRequired">Remote Monitoring Required *</Label>
                    </div>
                    
                    <div>
                      <Label htmlFor="technologyAssessment">Technology Assessment *</Label>
                      <Select
                        value={formData.technologyMonitoring.technologyAssessment}
                        onValueChange={(value) => handleFieldUpdate('technologyMonitoring', 'technologyAssessment', value)}
                        disabled={readOnly}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Patient tech comfort level" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="high">High - Very comfortable with technology</SelectItem>
                          <SelectItem value="medium">Medium - Some assistance needed</SelectItem>
                          <SelectItem value="low">Low - Significant assistance required</SelectItem>
                          <SelectItem value="unable">Unable - Caregiver assistance required</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="deviceDistribution">Device Distribution Status *</Label>
                      <Select
                        value={formData.technologyMonitoring.deviceDistribution}
                        onValueChange={(value) => handleFieldUpdate('technologyMonitoring', 'deviceDistribution', value)}
                        disabled={readOnly}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select distribution status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="required">Required - Devices needed</SelectItem>
                          <SelectItem value="completed">Completed - Devices distributed</SelectItem>
                          <SelectItem value="declined">Declined - Patient declined devices</SelectItem>
                          <SelectItem value="not_applicable">Not Applicable</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="trainingProvided"
                        checked={formData.technologyMonitoring.trainingProvided}
                        onCheckedChange={(checked) => handleFieldUpdate('technologyMonitoring', 'trainingProvided', checked === true)}
                        disabled={readOnly}
                      />
                      <Label htmlFor="trainingProvided">Device Training Provided</Label>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="technicalSupportContact">Technical Support Contact *</Label>
                    <Input
                      id="technicalSupportContact"
                      value={formData.technologyMonitoring.technicalSupportContact}
                      onChange={(e) => handleFieldUpdate('technologyMonitoring', 'technicalSupportContact', e.target.value)}
                      disabled={readOnly}
                      placeholder="24/7 tech support phone number"
                    />
                  </div>
                </div>

                <Separator />

                {/* Digital Communication Section */}
                <div className="space-y-4">
                  <h4 className="font-medium text-base">Digital Communication Setup</h4>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="secureMessagingSetup">Secure Messaging Setup *</Label>
                      <Select
                        value={formData.technologyMonitoring.secureMessagingSetup}
                        onValueChange={(value) => handleFieldUpdate('technologyMonitoring', 'secureMessagingSetup', value)}
                        disabled={readOnly}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select messaging status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="enrolled">Enrolled - Account created</SelectItem>
                          <SelectItem value="training_provided">Training Provided</SelectItem>
                          <SelectItem value="declined">Declined - Patient prefers phone</SelectItem>
                          <SelectItem value="not_available">Not Available - No technology access</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="telehealthCapability">Telehealth Capability *</Label>
                      <Select
                        value={formData.technologyMonitoring.telehealthCapability}
                        onValueChange={(value) => handleFieldUpdate('technologyMonitoring', 'telehealthCapability', value)}
                        disabled={readOnly}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select capability status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="tested">Tested - Ready for video calls</SelectItem>
                          <SelectItem value="needs_assistance">Needs Assistance - Setup required</SelectItem>
                          <SelectItem value="not_available">Not Available - No video capability</SelectItem>
                          <SelectItem value="declined">Declined - Prefers in-person</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="emergencyCommunicationPlan">Emergency Communication Plan *</Label>
                    <Textarea
                      id="emergencyCommunicationPlan"
                      value={formData.technologyMonitoring.emergencyCommunicationPlan}
                      onChange={(e) => handleFieldUpdate('technologyMonitoring', 'emergencyCommunicationPlan', e.target.value)}
                      disabled={readOnly}
                      placeholder="After-hours contact method and escalation procedure"
                      rows={3}
                    />
                  </div>
                </div>

                {/* Pre-populated Data Display */}
                {prePopulatedData && (
                  <div className="mt-6 p-4 bg-muted/50 rounded-lg">
                    <h4 className="font-medium text-sm mb-2">Pre-populated Information</h4>
                    <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                      <div>Patient: {prePopulatedData.patient.fullName}</div>
                      <div>Phone: {prePopulatedData.patient.phone}</div>
                      <div>Email: {prePopulatedData.patient.email}</div>
                      <div>Treatment: {prePopulatedData.treatment.therapyType}</div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Section Navigation */}
        <div className="mt-8 pt-6 border-t border-border/20">
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              Treatment & Clinical Assessment Section
            </div>
            <div className="flex items-center gap-4">
              <div className="text-sm text-muted-foreground">
                Next: Final Review & Submission
              </div>
              <Button size="sm" className="bg-primary/10 text-primary hover:bg-primary/20">
                Continue to Review →
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Default data structure for initialization
export const createEmptyComprehensiveTreatmentAssessmentData = (): ComprehensiveTreatmentAssessmentData => ({
  identityVerification: {
    photoIdVerificationCompleted: false,
    photoIdTypeVerified: '',
    secondaryIdCrossVerification: false,
    patientPhotoCaptured: false,
    biometricDataAvailable: false,
    identityVerificationWitness: '',
    identityVerificationDateTime: '',
    identityDiscrepanciesFound: false,
    identityDiscrepancyDetails: ''
  },
  clinicalReadiness: {
    treatmentReadinessAssessment: '',
    performanceStatusCurrent: '',
    diseaseStatusAtEnrollment: '',
    recentHospitalizations: false,
    activeInfections: false,
    currentFunctionalCapacity: false,
    requiredPreTreatmentLabs: false,
    cardiacClearance: '',
    pulmonaryFunction: '',
    infectionScreening: '',
    pregnancyTest: '',
    vaccinationStatus: '',
    absoluteContraindications: '',
    relativeContraindications: '',
    drugInteractionCheck: false,
    priorSevereAdverseReactions: ''
  },
  careCoordination: {
    careCoordinatorAssigned: '',
    primaryNurseAssignment: '',
    caseManagerAssignment: '',
    socialWorkerConsultation: '',
    transportationPlan: '',
    lodgingArrangements: '',
    caregiverSupportIdentified: '',
    emergencyContact24x7: '',
    distanceFromTreatmentCenter: '',
    preferredContactMethodAppointments: '',
    familyCommunicationPreferences: '',
    languageInterpreterServices: '',
    patientPortalRegistration: ''
  },
  financialCounseling: {
    financialCounselingCompleted: false,
    outOfPocketCostEstimateProvided: false,
    outOfPocketAmount: '',
    paymentPlanRequired: false,
    paymentPlanTerms: '',
    financialHardshipIdentified: false,
    patientAssistanceProgramsApplied: [],
    nutritionConsultation: '',
    pharmacyConsultation: '',
    specialtyPharmacyCoordination: '',
    homeHealthServices: ''
  },
  consentLegal: {
    treatmentConsentStatus: '',
    consentDate: '',
    consentingPhysician: '',
    capacityAssessment: '',
    researchClinicalTrialConsent: '',
    codeStatusDiscussed: false,
    advancedDirectiveReview: '',
    healthcareProxyConfirmed: '',
    treatmentGoalsDiscussion: '',
    hipaaAuthorization: false,
    communicationConsent: '',
    photographyVideoConsent: false
  },
  technologyMonitoring: {
    remoteMonitoringRequired: false,
    technologyAssessment: '',
    deviceDistribution: '',
    trainingProvided: false,
    technicalSupportContact: '',
    secureMessagingSetup: '',
    telehealthCapability: '',
    emergencyCommunicationPlan: ''
  }
});

// Export types
export type { ComprehensiveTreatmentAssessmentData, PrePopulatedData };