/**
 * COMPREHENSIVE PROVIDER SECTION
 * Complete provider, treatment center, and referral network information with 3 tabs
 */
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
// import { Calendar } from "@/components/ui/calendar";
// import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
// import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { 
  Building2, 
  User, 
  Users, 
  CalendarIcon,
  Phone,
  Mail,
  MapPin,
  FileText,
  Shield,
  Stethoscope,
  Building,
  Network
} from 'lucide-react';

interface ComprehensiveProviderData {
  // Tab 1: Provider Information
  provider: {
    // Basic Demographics
    firstName: string;
    middleName: string;
    lastName: string;
    credentials: string;
    npi: string;
    taxonomyCodes: string[];
    primarySpecialty: string;
    boardCertifications: string[];
    medicalSchool: string;
    graduationYear: string;
    residencyDetails: string;
    fellowshipDetails: string;
    
    // Contact Information
    primaryAddress: string;
    mailingAddress: string;
    officePhone: string;
    mobilePhone: string;
    faxNumber: string;
    email: string;
    preferredContactMethod: string;
    
    // Licensing & Regulatory
    medicalLicenseNumbers: Array<{state: string; number: string; expirationDate: Date}>;
    deaNumber: string;
    controlledSubstanceStatus: string;
    pdmpRegistration: string;
    disciplinaryActions: boolean;
    disciplinaryDetails: string;
    
    // Professional Experience
    yearsInPractice: string;
    practiceType: string;
    hospitalAffiliations: string[];
    advancedTherapyExperience: boolean;
    advancedTherapyDetails: string;
    
    // Insurance & Liability
    malpracticeCarrier: string;
    policyNumber: string;
    coverageLimits: string;
    insuranceExpirationDate: Date;
    
    // Advanced Therapy Certifications
    rems: string[];
    cartCertification: boolean;
    geneTherapyTraining: boolean;
    radioligandCertification: boolean;
    crsManagementTraining: boolean;
    radiationSafetyCert: boolean;
    biomarkerTraining: boolean;
    companionDxExperience: boolean;
    fdaTrainingCerts: string[];
    continuingEducationStatus: string;
  };
  
  // Tab 2: Treatment Center/Facility Information
  facility: {
    // Basic Facility Information
    name: string;
    dbaNames: string;
    facilityType: string;
    organizationNPI: string;
    taxId: string;
    physicalAddress: string;
    mailingAddress: string;
    phone: string;
    fax: string;
    email: string;
    website: string;
    emergencyContact: string;
    
    // Administrative Contacts
    administratorName: string;
    administratorTitle: string;
    administratorContact: string;
    medicalDirectorName: string;
    medicalDirectorNPI: string;
    billingContactName: string;
    billingContactInfo: string;
    paSpecialistContact: string;
    
    // Operational Details
    hoursOfOperation: string;
    daysOfOperation: string[];
    emergencyHours: string;
    patientCapacity: string;
    bedCount: string;
    treatmentRooms: string;
    languagesSupported: string[];
    populationServed: string[];
    
    // Licensing & Accreditation
    facilityLicenseNumber: string;
    licenseExpirationDate: Date;
    jointCommissionAccred: boolean;
    jointCommissionId: string;
    carfAccreditation: boolean;
    carfDetails: string;
    capAccreditation: boolean;
    capDetails: string;
    factAccreditation: boolean;
    medicareProviderNumber: string;
    medicaidProviderNumber: string;
    
    // Advanced Therapy Regulatory
    fdaRegistrationNumber: string;
    gmpCompliance: boolean;
    nrcLicense: string;
    radiationControlPermit: string;
    cliaCertNumber: string;
    biosafetyCommitteeApproval: boolean;
    irbInformation: string;
    
    // Clinical Services & Capabilities
    servicesOffered: string[];
    treatmentModalities: string[];
    infusionServices: boolean;
    infusionDetails: string;
    laboratoryServices: string;
    pharmacyServices: string;
    imagingServices: string[];
    emergencyServicesAccess: boolean;
    
    // Insurance & Financial
    insurancePlansAccepted: string[];
    priorAuthRequirements: string;
    financialAssistancePrograms: string[];
    patientPaymentOptions: string[];
    billingSystem: string;
    
    // Infrastructure & Equipment
    ehrSystem: string;
    infusionEquipment: string[];
    emergencyEquipment: string[];
    backupPowerSystems: boolean;
    cellProcessingLab: boolean;
    cellProcessingGrade: string;
    cleanroomFacilities: string[];
    cryopreservationCapability: boolean;
    coldChainManagement: boolean;
    flowCytometryEquipment: boolean;
    pcrCapabilities: boolean;
    radiationDetectionEquipment: boolean;
    specializedInfusionPumps: boolean;
    isolationRooms: boolean;
    cellCountingAnalyzers: boolean;
    
    // Staffing & Expertise
    nursingQualifications: string;
    pharmacistInfo: string;
    labPersonnel: string;
    cellTherapyCoordinator: string;
    radiationSafetyOfficer: string;
    apheresisTechnician: string;
    clinicalLabScientist: string;
    emergencyResponseTeam: string;
    
    // Safety & Quality Systems
    qualityAssuranceProgram: boolean;
    qaDescription: string;
    adverseEventReporting: string;
    emergencyResponseProtocols: string;
    infectionControlProcedures: string;
    physicianCoverage24x7: boolean;
    physicianCoverageDetails: string;
    icuBedAvailability: boolean;
    tocilizumabAvailability: boolean;
    productDeviationReporting: string;
    
    // Laboratory & Diagnostics
    onSiteLabServices: boolean;
    cliaStatus: string;
    labMedicalDirectorNPI: string;
    biomarkerTestingCapabilities: boolean;
    ngsCapability: boolean;
    companionDxServices: boolean;
    molecularPathologyExpertise: boolean;
    referenceLabs: string[];
    testingTurnaroundTimes: string;
    immunohistochemistryServices: boolean;
    
    // Supply Chain & Logistics
    validatedShippingVendors: string[];
    temperatureMonitoring: boolean;
    chainOfCustodyProtocols: string;
    internationalShipping: boolean;
    productStorageRequirements: string;
    coldStorageCapacity: string;
    productReturnProcedures: string;
    disposalProtocols: string;
    inventoryManagementSystem: string;
  };
  
  // Tab 3: Referral Network & Care Coordination
  referralNetwork: {
    // Primary Referring Physicians
    primaryReferringPhysician: {
      name: string;
      credentials: string;
      npi: string;
      specialty: string;
      practiceName: string;
      practiceAddress: string;
      officePhone: string;
      faxNumber: string;
      email: string;
      preferredCommunication: string;
      expectedReferralVolume: string;
      relationshipDuration: string;
    };
    
    // Additional Referring Sources
    secondaryReferringPhysician: {
      name: string;
      credentials: string;
      npi: string;
      specialty: string;
      practiceName: string;
      practiceAddress: string;
      officePhone: string;
      faxNumber: string;
      email: string;
      preferredCommunication: string;
    };
    
    referringPracticeGroups: string[];
    hospitalAffiliationsForReferrals: string[];
    multiDisciplinaryTeamMembers: string[];
    
    // Specialist Network
    consultingOncologist: {name: string; npi: string; contact: string};
    consultingHematologist: {name: string; npi: string; contact: string};
    pathologist: {name: string; npi: string; contact: string};
    radiologist: {name: string; npi: string; contact: string};
    pharmacogenomicsSpecialist: {name: string; certification: string; contact: string};
    geneticCounselor: {name: string; certification: string; contact: string};
    
    // Advanced Therapy Specialist Network
    nuclearMedicinePhysician: {name: string; npi: string; contact: string};
    radiationOncologist: {name: string; npi: string; contact: string};
    medicalPhysicist: {name: string; certification: string; contact: string};
    cellularTherapySpecialist: {name: string; npi: string; contact: string};
    apheresisPhysician: {name: string; npi: string; contact: string};
    emergencyMedicinePhysician: {name: string; npi: string; contact: string};
    icuPhysicianCoverage: Array<{name: string; npi: string; contact: string}>;
    
    // Care Coordination Processes
    referralCriteria: string;
    requiredDocumentation: string[];
    referralProcessingTime: string;
    patientCommunicationPreferences: string;
    progressNoteSharingMethod: string;
    dischargePlanningCoordination: string;
    emergencyContactProtocols: string;
    afterHoursCoverage: string;
    
    // Communication & Documentation
    ehrIntegration: boolean;
    ehrSystemName: string;
    secureMessagingSystem: string;
    preferredReportFormat: string;
    updateFrequency: string;
    patientPortalAccess: boolean;
    careplanSharingProtocols: string;
    outcomesReportingRequirements: string;
    
    // Network Agreements
    formalReferralAgreements: boolean;
    sharedCareProtocols: string;
    coverageAgreements: string;
    crossCoverageArrangements: string;
    continuingEducationCollaboration: string;
  };
}

interface ComprehensiveProviderSectionProps {
  formData: ComprehensiveProviderData;
  updateFormData: (section: keyof ComprehensiveProviderData, field: string, value: any) => void;
  readOnly?: boolean;
}

export const ComprehensiveProviderSection: React.FC<ComprehensiveProviderSectionProps> = ({
  formData,
  updateFormData,
  readOnly = false
}) => {
  const [activeTab, setActiveTab] = useState("provider");

  const handleFieldUpdate = (section: keyof ComprehensiveProviderData, field: string, value: any) => {
    updateFormData(section, field, value);
  };

  // Temporarily disabled date picker - will be implemented after adding calendar component
  const renderDatePicker = (
    label: string, 
    value: Date | undefined, 
    onChange: (date: Date | undefined) => void,
    placeholder: string = "Pick a date"
  ) => (
    <div>
      <Label>{label}</Label>
      <Input
        type="date"
        value={value ? value.toISOString().split('T')[0] : ''}
        onChange={(e) => onChange(e.target.value ? new Date(e.target.value) : undefined)}
        disabled={readOnly}
      />
    </div>
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building2 className="h-5 w-5" />
          Comprehensive Provider Information
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="provider" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Provider Info
            </TabsTrigger>
            <TabsTrigger value="facility" className="flex items-center gap-2">
              <Building className="h-4 w-4" />
              Treatment Center
            </TabsTrigger>
            <TabsTrigger value="referral" className="flex items-center gap-2">
              <Network className="h-4 w-4" />
              Referral Network
            </TabsTrigger>
          </TabsList>

          {/* Tab 1: Provider Information */}
          <TabsContent value="provider" className="space-y-6 mt-6">
            {/* Basic Demographics */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Basic Demographics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      value={formData.provider.firstName}
                      onChange={(e) => handleFieldUpdate('provider', 'firstName', e.target.value)}
                      disabled={readOnly}
                    />
                  </div>
                  <div>
                    <Label htmlFor="middleName">Middle Name</Label>
                    <Input
                      id="middleName"
                      value={formData.provider.middleName}
                      onChange={(e) => handleFieldUpdate('provider', 'middleName', e.target.value)}
                      disabled={readOnly}
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      value={formData.provider.lastName}
                      onChange={(e) => handleFieldUpdate('provider', 'lastName', e.target.value)}
                      disabled={readOnly}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="credentials">Professional Credentials</Label>
                    <Input
                      id="credentials"
                      value={formData.provider.credentials}
                      onChange={(e) => handleFieldUpdate('provider', 'credentials', e.target.value)}
                      placeholder="MD, DO, NP, PA, PharmD, etc."
                      disabled={readOnly}
                    />
                  </div>
                  <div>
                    <Label htmlFor="npi">National Provider Identifier (NPI)</Label>
                    <Input
                      id="npi"
                      value={formData.provider.npi}
                      onChange={(e) => handleFieldUpdate('provider', 'npi', e.target.value)}
                      disabled={readOnly}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="primarySpecialty">Primary Specialty</Label>
                    <Input
                      id="primarySpecialty"
                      value={formData.provider.primarySpecialty}
                      onChange={(e) => handleFieldUpdate('provider', 'primarySpecialty', e.target.value)}
                      disabled={readOnly}
                    />
                  </div>
                  <div>
                    <Label htmlFor="graduationYear">Medical School Graduation Year</Label>
                    <Input
                      id="graduationYear"
                      value={formData.provider.graduationYear}
                      onChange={(e) => handleFieldUpdate('provider', 'graduationYear', e.target.value)}
                      disabled={readOnly}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="medicalSchool">Medical School</Label>
                  <Input
                    id="medicalSchool"
                    value={formData.provider.medicalSchool}
                    onChange={(e) => handleFieldUpdate('provider', 'medicalSchool', e.target.value)}
                    disabled={readOnly}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="residencyDetails">Residency Details</Label>
                    <Textarea
                      id="residencyDetails"
                      value={formData.provider.residencyDetails}
                      onChange={(e) => handleFieldUpdate('provider', 'residencyDetails', e.target.value)}
                      disabled={readOnly}
                    />
                  </div>
                  <div>
                    <Label htmlFor="fellowshipDetails">Fellowship Details</Label>
                    <Textarea
                      id="fellowshipDetails"
                      value={formData.provider.fellowshipDetails}
                      onChange={(e) => handleFieldUpdate('provider', 'fellowshipDetails', e.target.value)}
                      disabled={readOnly}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="primaryAddress">Primary Practice Address</Label>
                  <Textarea
                    id="primaryAddress"
                    value={formData.provider.primaryAddress}
                    onChange={(e) => handleFieldUpdate('provider', 'primaryAddress', e.target.value)}
                    placeholder="Street, City, State, ZIP"
                    disabled={readOnly}
                  />
                </div>

                <div>
                  <Label htmlFor="mailingAddress">Mailing Address (if different)</Label>
                  <Textarea
                    id="mailingAddress"
                    value={formData.provider.mailingAddress}
                    onChange={(e) => handleFieldUpdate('provider', 'mailingAddress', e.target.value)}
                    disabled={readOnly}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="officePhone">Office Phone</Label>
                    <Input
                      id="officePhone"
                      value={formData.provider.officePhone}
                      onChange={(e) => handleFieldUpdate('provider', 'officePhone', e.target.value)}
                      disabled={readOnly}
                    />
                  </div>
                  <div>
                    <Label htmlFor="mobilePhone">Mobile Phone</Label>
                    <Input
                      id="mobilePhone"
                      value={formData.provider.mobilePhone}
                      onChange={(e) => handleFieldUpdate('provider', 'mobilePhone', e.target.value)}
                      disabled={readOnly}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="faxNumber">Fax Number</Label>
                    <Input
                      id="faxNumber"
                      value={formData.provider.faxNumber}
                      onChange={(e) => handleFieldUpdate('provider', 'faxNumber', e.target.value)}
                      disabled={readOnly}
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.provider.email}
                      onChange={(e) => handleFieldUpdate('provider', 'email', e.target.value)}
                      disabled={readOnly}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="preferredContactMethod">Preferred Contact Method</Label>
                  <Select
                    value={formData.provider.preferredContactMethod}
                    onValueChange={(value) => handleFieldUpdate('provider', 'preferredContactMethod', value)}
                    disabled={readOnly}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select preferred contact method" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="phone">Phone</SelectItem>
                      <SelectItem value="email">Email</SelectItem>
                      <SelectItem value="fax">Fax</SelectItem>
                      <SelectItem value="secure_messaging">Secure Messaging</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Licensing & Regulatory */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Licensing & Regulatory</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="deaNumber">DEA Number</Label>
                    <Input
                      id="deaNumber"
                      value={formData.provider.deaNumber}
                      onChange={(e) => handleFieldUpdate('provider', 'deaNumber', e.target.value)}
                      disabled={readOnly}
                    />
                  </div>
                  <div>
                    <Label htmlFor="controlledSubstanceStatus">Controlled Substance Registration Status</Label>
                    <Select
                      value={formData.provider.controlledSubstanceStatus}
                      onValueChange={(value) => handleFieldUpdate('provider', 'controlledSubstanceStatus', value)}
                      disabled={readOnly}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="expired">Expired</SelectItem>
                        <SelectItem value="not_applicable">Not Applicable</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="pdmpRegistration">PDMP Registration Information</Label>
                  <Input
                    id="pdmpRegistration"
                    value={formData.provider.pdmpRegistration}
                    onChange={(e) => handleFieldUpdate('provider', 'pdmpRegistration', e.target.value)}
                    disabled={readOnly}
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="disciplinaryActions"
                      checked={formData.provider.disciplinaryActions}
                      onCheckedChange={(checked) => handleFieldUpdate('provider', 'disciplinaryActions', checked === true)}
                      disabled={readOnly}
                    />
                    <Label htmlFor="disciplinaryActions">Any Disciplinary Actions or Sanctions</Label>
                  </div>
                  {formData.provider.disciplinaryActions && (
                    <div>
                      <Label htmlFor="disciplinaryDetails">Details of Disciplinary Actions</Label>
                      <Textarea
                        id="disciplinaryDetails"
                        value={formData.provider.disciplinaryDetails}
                        onChange={(e) => handleFieldUpdate('provider', 'disciplinaryDetails', e.target.value)}
                        disabled={readOnly}
                      />
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Professional Experience */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Professional Experience</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="yearsInPractice">Years in Practice</Label>
                    <Input
                      id="yearsInPractice"
                      value={formData.provider.yearsInPractice}
                      onChange={(e) => handleFieldUpdate('provider', 'yearsInPractice', e.target.value)}
                      disabled={readOnly}
                    />
                  </div>
                  <div>
                    <Label htmlFor="practiceType">Current Practice Type</Label>
                    <Select
                      value={formData.provider.practiceType}
                      onValueChange={(value) => handleFieldUpdate('provider', 'practiceType', value)}
                      disabled={readOnly}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select practice type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="private">Private Practice</SelectItem>
                        <SelectItem value="hospital">Hospital</SelectItem>
                        <SelectItem value="clinic">Clinic</SelectItem>
                        <SelectItem value="academic">Academic Medical Center</SelectItem>
                        <SelectItem value="group">Group Practice</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="advancedTherapyExperience"
                      checked={formData.provider.advancedTherapyExperience}
                      onCheckedChange={(checked) => handleFieldUpdate('provider', 'advancedTherapyExperience', checked === true)}
                      disabled={readOnly}
                    />
                    <Label htmlFor="advancedTherapyExperience">Previous Experience with Advanced Therapies</Label>
                  </div>
                  {formData.provider.advancedTherapyExperience && (
                    <div>
                      <Label htmlFor="advancedTherapyDetails">Advanced Therapy Experience Details</Label>
                      <Textarea
                        id="advancedTherapyDetails"
                        value={formData.provider.advancedTherapyDetails}
                        onChange={(e) => handleFieldUpdate('provider', 'advancedTherapyDetails', e.target.value)}
                        disabled={readOnly}
                      />
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Insurance & Liability */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Insurance & Liability</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="malpracticeCarrier">Malpractice Insurance Carrier</Label>
                    <Input
                      id="malpracticeCarrier"
                      value={formData.provider.malpracticeCarrier}
                      onChange={(e) => handleFieldUpdate('provider', 'malpracticeCarrier', e.target.value)}
                      disabled={readOnly}
                    />
                  </div>
                  <div>
                    <Label htmlFor="policyNumber">Policy Number</Label>
                    <Input
                      id="policyNumber"
                      value={formData.provider.policyNumber}
                      onChange={(e) => handleFieldUpdate('provider', 'policyNumber', e.target.value)}
                      disabled={readOnly}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="coverageLimits">Coverage Limits</Label>
                    <Input
                      id="coverageLimits"
                      value={formData.provider.coverageLimits}
                      onChange={(e) => handleFieldUpdate('provider', 'coverageLimits', e.target.value)}
                      placeholder="e.g., $1M/$3M"
                      disabled={readOnly}
                    />
                  </div>
                  <div>
                    {renderDatePicker(
                      "Insurance Expiration Date",
                      formData.provider.insuranceExpirationDate,
                      (date) => handleFieldUpdate('provider', 'insuranceExpirationDate', date),
                      "Select expiration date"
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Advanced Therapy Certifications */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Advanced Therapy Certifications</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="cartCertification"
                      checked={formData.provider.cartCertification}
                      onCheckedChange={(checked) => handleFieldUpdate('provider', 'cartCertification', checked === true)}
                      disabled={readOnly}
                    />
                    <Label htmlFor="cartCertification">CAR-T Therapy Certification</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="geneTherapyTraining"
                      checked={formData.provider.geneTherapyTraining}
                      onCheckedChange={(checked) => handleFieldUpdate('provider', 'geneTherapyTraining', checked === true)}
                      disabled={readOnly}
                    />
                    <Label htmlFor="geneTherapyTraining">Gene Therapy Training Completion</Label>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="radioligandCertification"
                      checked={formData.provider.radioligandCertification}
                      onCheckedChange={(checked) => handleFieldUpdate('provider', 'radioligandCertification', checked === true)}
                      disabled={readOnly}
                    />
                    <Label htmlFor="radioligandCertification">Radioligand Therapy Certification</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="crsManagementTraining"
                      checked={formData.provider.crsManagementTraining}
                      onCheckedChange={(checked) => handleFieldUpdate('provider', 'crsManagementTraining', checked === true)}
                      disabled={readOnly}
                    />
                    <Label htmlFor="crsManagementTraining">CRS Management Training</Label>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="radiationSafetyCert"
                      checked={formData.provider.radiationSafetyCert}
                      onCheckedChange={(checked) => handleFieldUpdate('provider', 'radiationSafetyCert', checked === true)}
                      disabled={readOnly}
                    />
                    <Label htmlFor="radiationSafetyCert">Radiation Safety Certification</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="biomarkerTraining"
                      checked={formData.provider.biomarkerTraining}
                      onCheckedChange={(checked) => handleFieldUpdate('provider', 'biomarkerTraining', checked === true)}
                      disabled={readOnly}
                    />
                    <Label htmlFor="biomarkerTraining">Biomarker Interpretation Training</Label>
                  </div>
                </div>

                <div>
                  <Label htmlFor="continuingEducationStatus">Continuing Education Status</Label>
                  <Textarea
                    id="continuingEducationStatus"
                    value={formData.provider.continuingEducationStatus}
                    onChange={(e) => handleFieldUpdate('provider', 'continuingEducationStatus', e.target.value)}
                    placeholder="Current CE requirements and completion status"
                    disabled={readOnly}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab 2: Treatment Center/Facility Information */}
          <TabsContent value="facility" className="space-y-6 mt-6">
            {/* Basic Facility Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Basic Facility Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="facilityName">Facility Name</Label>
                    <Input
                      id="facilityName"
                      value={formData.facility.name}
                      onChange={(e) => handleFieldUpdate('facility', 'name', e.target.value)}
                      disabled={readOnly}
                    />
                  </div>
                  <div>
                    <Label htmlFor="dbaNames">DBA/Alternate Names</Label>
                    <Input
                      id="dbaNames"
                      value={formData.facility.dbaNames}
                      onChange={(e) => handleFieldUpdate('facility', 'dbaNames', e.target.value)}
                      disabled={readOnly}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="facilityType">Facility Type</Label>
                    <Select
                      value={formData.facility.facilityType}
                      onValueChange={(value) => handleFieldUpdate('facility', 'facilityType', value)}
                      disabled={readOnly}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select facility type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="hospital">Hospital</SelectItem>
                        <SelectItem value="clinic">Clinic</SelectItem>
                        <SelectItem value="infusion_center">Infusion Center</SelectItem>
                        <SelectItem value="cancer_center">Cancer Center</SelectItem>
                        <SelectItem value="academic_medical_center">Academic Medical Center</SelectItem>
                        <SelectItem value="outpatient_facility">Outpatient Facility</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="organizationNPI">Organization NPI (Type 2)</Label>
                    <Input
                      id="organizationNPI"
                      value={formData.facility.organizationNPI}
                      onChange={(e) => handleFieldUpdate('facility', 'organizationNPI', e.target.value)}
                      disabled={readOnly}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="taxId">Tax ID/EIN</Label>
                    <Input
                      id="taxId"
                      value={formData.facility.taxId}
                      onChange={(e) => handleFieldUpdate('facility', 'taxId', e.target.value)}
                      disabled={readOnly}
                    />
                  </div>
                  <div>
                    <Label htmlFor="facilityPhone">Facility Phone</Label>
                    <Input
                      id="facilityPhone"
                      value={formData.facility.phone}
                      onChange={(e) => handleFieldUpdate('facility', 'phone', e.target.value)}
                      disabled={readOnly}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="physicalAddress">Physical Address</Label>
                  <Textarea
                    id="physicalAddress"
                    value={formData.facility.physicalAddress}
                    onChange={(e) => handleFieldUpdate('facility', 'physicalAddress', e.target.value)}
                    placeholder="Street, City, State, ZIP"
                    disabled={readOnly}
                  />
                </div>

                <div>
                  <Label htmlFor="facilityMailingAddress">Mailing Address (if different)</Label>
                  <Textarea
                    id="facilityMailingAddress"
                    value={formData.facility.mailingAddress}
                    onChange={(e) => handleFieldUpdate('facility', 'mailingAddress', e.target.value)}
                    disabled={readOnly}
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="facilityFax">Facility Fax</Label>
                    <Input
                      id="facilityFax"
                      value={formData.facility.fax}
                      onChange={(e) => handleFieldUpdate('facility', 'fax', e.target.value)}
                      disabled={readOnly}
                    />
                  </div>
                  <div>
                    <Label htmlFor="facilityEmail">Facility Email</Label>
                    <Input
                      id="facilityEmail"
                      type="email"
                      value={formData.facility.email}
                      onChange={(e) => handleFieldUpdate('facility', 'email', e.target.value)}
                      disabled={readOnly}
                    />
                  </div>
                  <div>
                    <Label htmlFor="website">Website</Label>
                    <Input
                      id="website"
                      value={formData.facility.website}
                      onChange={(e) => handleFieldUpdate('facility', 'website', e.target.value)}
                      disabled={readOnly}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Administrative Contacts */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Administrative Contacts</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="administratorName">Administrator Name</Label>
                    <Input
                      id="administratorName"
                      value={formData.facility.administratorName}
                      onChange={(e) => handleFieldUpdate('facility', 'administratorName', e.target.value)}
                      disabled={readOnly}
                    />
                  </div>
                  <div>
                    <Label htmlFor="administratorTitle">Administrator Title</Label>
                    <Input
                      id="administratorTitle"
                      value={formData.facility.administratorTitle}
                      onChange={(e) => handleFieldUpdate('facility', 'administratorTitle', e.target.value)}
                      disabled={readOnly}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="administratorContact">Administrator Contact Information</Label>
                  <Input
                    id="administratorContact"
                    value={formData.facility.administratorContact}
                    onChange={(e) => handleFieldUpdate('facility', 'administratorContact', e.target.value)}
                    placeholder="Phone/Email"
                    disabled={readOnly}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="medicalDirectorName">Medical Director Name</Label>
                    <Input
                      id="medicalDirectorName"
                      value={formData.facility.medicalDirectorName}
                      onChange={(e) => handleFieldUpdate('facility', 'medicalDirectorName', e.target.value)}
                      disabled={readOnly}
                    />
                  </div>
                  <div>
                    <Label htmlFor="medicalDirectorNPI">Medical Director NPI</Label>
                    <Input
                      id="medicalDirectorNPI"
                      value={formData.facility.medicalDirectorNPI}
                      onChange={(e) => handleFieldUpdate('facility', 'medicalDirectorNPI', e.target.value)}
                      disabled={readOnly}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="billingContactName">Billing Contact Name</Label>
                    <Input
                      id="billingContactName"
                      value={formData.facility.billingContactName}
                      onChange={(e) => handleFieldUpdate('facility', 'billingContactName', e.target.value)}
                      disabled={readOnly}
                    />
                  </div>
                  <div>
                    <Label htmlFor="billingContactInfo">Billing Contact Information</Label>
                    <Input
                      id="billingContactInfo"
                      value={formData.facility.billingContactInfo}
                      onChange={(e) => handleFieldUpdate('facility', 'billingContactInfo', e.target.value)}
                      disabled={readOnly}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="paSpecialistContact">Prior Authorization Specialist Contact</Label>
                  <Input
                    id="paSpecialistContact"
                    value={formData.facility.paSpecialistContact}
                    onChange={(e) => handleFieldUpdate('facility', 'paSpecialistContact', e.target.value)}
                    disabled={readOnly}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Operational Details */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Operational Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="hoursOfOperation">Hours of Operation</Label>
                    <Input
                      id="hoursOfOperation"
                      value={formData.facility.hoursOfOperation}
                      onChange={(e) => handleFieldUpdate('facility', 'hoursOfOperation', e.target.value)}
                      placeholder="e.g., 8:00 AM - 5:00 PM"
                      disabled={readOnly}
                    />
                  </div>
                  <div>
                    <Label htmlFor="emergencyHours">Emergency Hours Coverage</Label>
                    <Input
                      id="emergencyHours"
                      value={formData.facility.emergencyHours}
                      onChange={(e) => handleFieldUpdate('facility', 'emergencyHours', e.target.value)}
                      disabled={readOnly}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="patientCapacity">Patient Capacity</Label>
                    <Input
                      id="patientCapacity"
                      value={formData.facility.patientCapacity}
                      onChange={(e) => handleFieldUpdate('facility', 'patientCapacity', e.target.value)}
                      disabled={readOnly}
                    />
                  </div>
                  <div>
                    <Label htmlFor="bedCount">Bed Count (if applicable)</Label>
                    <Input
                      id="bedCount"
                      value={formData.facility.bedCount}
                      onChange={(e) => handleFieldUpdate('facility', 'bedCount', e.target.value)}
                      disabled={readOnly}
                    />
                  </div>
                  <div>
                    <Label htmlFor="treatmentRooms">Treatment Rooms Available</Label>
                    <Input
                      id="treatmentRooms"
                      value={formData.facility.treatmentRooms}
                      onChange={(e) => handleFieldUpdate('facility', 'treatmentRooms', e.target.value)}
                      disabled={readOnly}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Advanced Therapy Infrastructure */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Advanced Therapy Infrastructure</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="cellProcessingLab"
                      checked={formData.facility.cellProcessingLab}
                      onCheckedChange={(checked) => handleFieldUpdate('facility', 'cellProcessingLab', checked === true)}
                      disabled={readOnly}
                    />
                    <Label htmlFor="cellProcessingLab">Cell Processing Laboratory</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="cryopreservationCapability"
                      checked={formData.facility.cryopreservationCapability}
                      onCheckedChange={(checked) => handleFieldUpdate('facility', 'cryopreservationCapability', checked === true)}
                      disabled={readOnly}
                    />
                    <Label htmlFor="cryopreservationCapability">Cryopreservation Storage (-150°C to -196°C)</Label>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="coldChainManagement"
                      checked={formData.facility.coldChainManagement}
                      onCheckedChange={(checked) => handleFieldUpdate('facility', 'coldChainManagement', checked === true)}
                      disabled={readOnly}
                    />
                    <Label htmlFor="coldChainManagement">Cold Chain Management Systems</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="flowCytometryEquipment"
                      checked={formData.facility.flowCytometryEquipment}
                      onCheckedChange={(checked) => handleFieldUpdate('facility', 'flowCytometryEquipment', checked === true)}
                      disabled={readOnly}
                    />
                    <Label htmlFor="flowCytometryEquipment">Flow Cytometry Equipment</Label>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="pcrCapabilities"
                      checked={formData.facility.pcrCapabilities}
                      onCheckedChange={(checked) => handleFieldUpdate('facility', 'pcrCapabilities', checked === true)}
                      disabled={readOnly}
                    />
                    <Label htmlFor="pcrCapabilities">Real-time PCR Capabilities</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="radiationDetectionEquipment"
                      checked={formData.facility.radiationDetectionEquipment}
                      onCheckedChange={(checked) => handleFieldUpdate('facility', 'radiationDetectionEquipment', checked === true)}
                      disabled={readOnly}
                    />
                    <Label htmlFor="radiationDetectionEquipment">Radiation Detection Equipment</Label>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="isolationRooms"
                      checked={formData.facility.isolationRooms}
                      onCheckedChange={(checked) => handleFieldUpdate('facility', 'isolationRooms', checked === true)}
                      disabled={readOnly}
                    />
                    <Label htmlFor="isolationRooms">Isolation Rooms with HEPA Filtration</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="cellCountingAnalyzers"
                      checked={formData.facility.cellCountingAnalyzers}
                      onCheckedChange={(checked) => handleFieldUpdate('facility', 'cellCountingAnalyzers', checked === true)}
                      disabled={readOnly}
                    />
                    <Label htmlFor="cellCountingAnalyzers">Cell Counting and Viability Analyzers</Label>
                  </div>
                </div>

                {formData.facility.cellProcessingLab && (
                  <div>
                    <Label htmlFor="cellProcessingGrade">Cell Processing Laboratory Grade Classification</Label>
                    <Select
                      value={formData.facility.cellProcessingGrade}
                      onValueChange={(value) => handleFieldUpdate('facility', 'cellProcessingGrade', value)}
                      disabled={readOnly}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select grade classification" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="grade_a">Grade A</SelectItem>
                        <SelectItem value="grade_b">Grade B</SelectItem>
                        <SelectItem value="grade_c">Grade C</SelectItem>
                        <SelectItem value="grade_d">Grade D</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab 3: Referral Network & Care Coordination */}
          <TabsContent value="referral" className="space-y-6 mt-6">
            {/* Primary Referring Physicians */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Primary Referring Physician</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="primaryReferringName">Referring Physician Name</Label>
                    <Input
                      id="primaryReferringName"
                      value={formData.referralNetwork.primaryReferringPhysician.name}
                      onChange={(e) => handleFieldUpdate('referralNetwork', 'primaryReferringPhysician', {
                        ...formData.referralNetwork.primaryReferringPhysician,
                        name: e.target.value
                      })}
                      disabled={readOnly}
                    />
                  </div>
                  <div>
                    <Label htmlFor="primaryReferringCredentials">Credentials</Label>
                    <Input
                      id="primaryReferringCredentials"
                      value={formData.referralNetwork.primaryReferringPhysician.credentials}
                      onChange={(e) => handleFieldUpdate('referralNetwork', 'primaryReferringPhysician', {
                        ...formData.referralNetwork.primaryReferringPhysician,
                        credentials: e.target.value
                      })}
                      disabled={readOnly}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="primaryReferringNPI">NPI</Label>
                    <Input
                      id="primaryReferringNPI"
                      value={formData.referralNetwork.primaryReferringPhysician.npi}
                      onChange={(e) => handleFieldUpdate('referralNetwork', 'primaryReferringPhysician', {
                        ...formData.referralNetwork.primaryReferringPhysician,
                        npi: e.target.value
                      })}
                      disabled={readOnly}
                    />
                  </div>
                  <div>
                    <Label htmlFor="primaryReferringSpecialty">Primary Specialty</Label>
                    <Input
                      id="primaryReferringSpecialty"
                      value={formData.referralNetwork.primaryReferringPhysician.specialty}
                      onChange={(e) => handleFieldUpdate('referralNetwork', 'primaryReferringPhysician', {
                        ...formData.referralNetwork.primaryReferringPhysician,
                        specialty: e.target.value
                      })}
                      disabled={readOnly}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="primaryReferringPracticeName">Practice Name</Label>
                  <Input
                    id="primaryReferringPracticeName"
                    value={formData.referralNetwork.primaryReferringPhysician.practiceName}
                    onChange={(e) => handleFieldUpdate('referralNetwork', 'primaryReferringPhysician', {
                      ...formData.referralNetwork.primaryReferringPhysician,
                      practiceName: e.target.value
                    })}
                    disabled={readOnly}
                  />
                </div>

                <div>
                  <Label htmlFor="primaryReferringPracticeAddress">Practice Address</Label>
                  <Textarea
                    id="primaryReferringPracticeAddress"
                    value={formData.referralNetwork.primaryReferringPhysician.practiceAddress}
                    onChange={(e) => handleFieldUpdate('referralNetwork', 'primaryReferringPhysician', {
                      ...formData.referralNetwork.primaryReferringPhysician,
                      practiceAddress: e.target.value
                    })}
                    disabled={readOnly}
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="primaryReferringOfficePhone">Office Phone</Label>
                    <Input
                      id="primaryReferringOfficePhone"
                      value={formData.referralNetwork.primaryReferringPhysician.officePhone}
                      onChange={(e) => handleFieldUpdate('referralNetwork', 'primaryReferringPhysician', {
                        ...formData.referralNetwork.primaryReferringPhysician,
                        officePhone: e.target.value
                      })}
                      disabled={readOnly}
                    />
                  </div>
                  <div>
                    <Label htmlFor="primaryReferringFax">Fax Number</Label>
                    <Input
                      id="primaryReferringFax"
                      value={formData.referralNetwork.primaryReferringPhysician.faxNumber}
                      onChange={(e) => handleFieldUpdate('referralNetwork', 'primaryReferringPhysician', {
                        ...formData.referralNetwork.primaryReferringPhysician,
                        faxNumber: e.target.value
                      })}
                      disabled={readOnly}
                    />
                  </div>
                  <div>
                    <Label htmlFor="primaryReferringEmail">Email Address</Label>
                    <Input
                      id="primaryReferringEmail"
                      type="email"
                      value={formData.referralNetwork.primaryReferringPhysician.email}
                      onChange={(e) => handleFieldUpdate('referralNetwork', 'primaryReferringPhysician', {
                        ...formData.referralNetwork.primaryReferringPhysician,
                        email: e.target.value
                      })}
                      disabled={readOnly}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="expectedReferralVolume">Expected Referral Volume</Label>
                    <Select
                      value={formData.referralNetwork.primaryReferringPhysician.expectedReferralVolume}
                      onValueChange={(value) => handleFieldUpdate('referralNetwork', 'primaryReferringPhysician', {
                        ...formData.referralNetwork.primaryReferringPhysician,
                        expectedReferralVolume: value
                      })}
                      disabled={readOnly}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select expected volume" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1-5_per_month">1-5 per month</SelectItem>
                        <SelectItem value="6-10_per_month">6-10 per month</SelectItem>
                        <SelectItem value="11-20_per_month">11-20 per month</SelectItem>
                        <SelectItem value="20+_per_month">20+ per month</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="relationshipDuration">Relationship Duration</Label>
                    <Input
                      id="relationshipDuration"
                      value={formData.referralNetwork.primaryReferringPhysician.relationshipDuration}
                      onChange={(e) => handleFieldUpdate('referralNetwork', 'primaryReferringPhysician', {
                        ...formData.referralNetwork.primaryReferringPhysician,
                        relationshipDuration: e.target.value
                      })}
                      placeholder="e.g., 5 years"
                      disabled={readOnly}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Specialist Network */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Specialist Network</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="consultingOncologist">Consulting Oncologist</Label>
                    <Input
                      id="consultingOncologist"
                      value={formData.referralNetwork.consultingOncologist.name}
                      onChange={(e) => handleFieldUpdate('referralNetwork', 'consultingOncologist', {
                        ...formData.referralNetwork.consultingOncologist,
                        name: e.target.value
                      })}
                      placeholder="Name, NPI, Contact"
                      disabled={readOnly}
                    />
                  </div>
                  <div>
                    <Label htmlFor="consultingHematologist">Consulting Hematologist</Label>
                    <Input
                      id="consultingHematologist"
                      value={formData.referralNetwork.consultingHematologist.name}
                      onChange={(e) => handleFieldUpdate('referralNetwork', 'consultingHematologist', {
                        ...formData.referralNetwork.consultingHematologist,
                        name: e.target.value
                      })}
                      placeholder="Name, NPI, Contact"
                      disabled={readOnly}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="pathologist">Pathologist</Label>
                    <Input
                      id="pathologist"
                      value={formData.referralNetwork.pathologist.name}
                      onChange={(e) => handleFieldUpdate('referralNetwork', 'pathologist', {
                        ...formData.referralNetwork.pathologist,
                        name: e.target.value
                      })}
                      placeholder="Name, NPI, Contact"
                      disabled={readOnly}
                    />
                  </div>
                  <div>
                    <Label htmlFor="radiologist">Radiologist</Label>
                    <Input
                      id="radiologist"
                      value={formData.referralNetwork.radiologist.name}
                      onChange={(e) => handleFieldUpdate('referralNetwork', 'radiologist', {
                        ...formData.referralNetwork.radiologist,
                        name: e.target.value
                      })}
                      placeholder="Name, NPI, Contact"
                      disabled={readOnly}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="pharmacogenomicsSpecialist">Pharmacogenomics Specialist</Label>
                    <Input
                      id="pharmacogenomicsSpecialist"
                      value={formData.referralNetwork.pharmacogenomicsSpecialist.name}
                      onChange={(e) => handleFieldUpdate('referralNetwork', 'pharmacogenomicsSpecialist', {
                        ...formData.referralNetwork.pharmacogenomicsSpecialist,
                        name: e.target.value
                      })}
                      placeholder="Name, Certification, Contact"
                      disabled={readOnly}
                    />
                  </div>
                  <div>
                    <Label htmlFor="geneticCounselor">Genetic Counselor</Label>
                    <Input
                      id="geneticCounselor"
                      value={formData.referralNetwork.geneticCounselor.name}
                      onChange={(e) => handleFieldUpdate('referralNetwork', 'geneticCounselor', {
                        ...formData.referralNetwork.geneticCounselor,
                        name: e.target.value
                      })}
                      placeholder="Name, Certification, Contact"
                      disabled={readOnly}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Care Coordination Processes */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Care Coordination Processes</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="referralCriteria">Referral Criteria and Protocols</Label>
                  <Textarea
                    id="referralCriteria"
                    value={formData.referralNetwork.referralCriteria}
                    onChange={(e) => handleFieldUpdate('referralNetwork', 'referralCriteria', e.target.value)}
                    disabled={readOnly}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="referralProcessingTime">Referral Processing Turnaround Time</Label>
                    <Select
                      value={formData.referralNetwork.referralProcessingTime}
                      onValueChange={(value) => handleFieldUpdate('referralNetwork', 'referralProcessingTime', value)}
                      disabled={readOnly}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select turnaround time" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="same_day">Same Day</SelectItem>
                        <SelectItem value="24_hours">24 Hours</SelectItem>
                        <SelectItem value="48_hours">48 Hours</SelectItem>
                        <SelectItem value="3-5_days">3-5 Days</SelectItem>
                        <SelectItem value="1_week">1 Week</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="patientCommunicationPreferences">Patient Communication Preferences</Label>
                    <Select
                      value={formData.referralNetwork.patientCommunicationPreferences}
                      onValueChange={(value) => handleFieldUpdate('referralNetwork', 'patientCommunicationPreferences', value)}
                      disabled={readOnly}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select communication method" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="phone">Phone</SelectItem>
                        <SelectItem value="email">Email</SelectItem>
                        <SelectItem value="patient_portal">Patient Portal</SelectItem>
                        <SelectItem value="secure_messaging">Secure Messaging</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="emergencyContactProtocols">Emergency Contact Protocols</Label>
                  <Textarea
                    id="emergencyContactProtocols"
                    value={formData.referralNetwork.emergencyContactProtocols}
                    onChange={(e) => handleFieldUpdate('referralNetwork', 'emergencyContactProtocols', e.target.value)}
                    disabled={readOnly}
                  />
                </div>

                <div>
                  <Label htmlFor="afterHoursCoverage">After-hours Coverage Arrangements</Label>
                  <Textarea
                    id="afterHoursCoverage"
                    value={formData.referralNetwork.afterHoursCoverage}
                    onChange={(e) => handleFieldUpdate('referralNetwork', 'afterHoursCoverage', e.target.value)}
                    disabled={readOnly}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Communication & Documentation */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Communication & Documentation</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="ehrIntegration"
                      checked={formData.referralNetwork.ehrIntegration}
                      onCheckedChange={(checked) => handleFieldUpdate('referralNetwork', 'ehrIntegration', checked === true)}
                      disabled={readOnly}
                    />
                    <Label htmlFor="ehrIntegration">EHR Integration Available</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="patientPortalAccess"
                      checked={formData.referralNetwork.patientPortalAccess}
                      onCheckedChange={(checked) => handleFieldUpdate('referralNetwork', 'patientPortalAccess', checked === true)}
                      disabled={readOnly}
                    />
                    <Label htmlFor="patientPortalAccess">Patient Portal Access for Referring Providers</Label>
                  </div>
                </div>

                {formData.referralNetwork.ehrIntegration && (
                  <div>
                    <Label htmlFor="ehrSystemName">EHR System Name</Label>
                    <Input
                      id="ehrSystemName"
                      value={formData.referralNetwork.ehrSystemName}
                      onChange={(e) => handleFieldUpdate('referralNetwork', 'ehrSystemName', e.target.value)}
                      disabled={readOnly}
                    />
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="secureMessagingSystem">Secure Messaging System</Label>
                    <Input
                      id="secureMessagingSystem"
                      value={formData.referralNetwork.secureMessagingSystem}
                      onChange={(e) => handleFieldUpdate('referralNetwork', 'secureMessagingSystem', e.target.value)}
                      disabled={readOnly}
                    />
                  </div>
                  <div>
                    <Label htmlFor="preferredReportFormat">Preferred Report Format</Label>
                    <Select
                      value={formData.referralNetwork.preferredReportFormat}
                      onValueChange={(value) => handleFieldUpdate('referralNetwork', 'preferredReportFormat', value)}
                      disabled={readOnly}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select format" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pdf">PDF</SelectItem>
                        <SelectItem value="hl7">HL7</SelectItem>
                        <SelectItem value="fax">Fax</SelectItem>
                        <SelectItem value="secure_email">Secure Email</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="updateFrequency">Frequency of Updates to Referring Physicians</Label>
                  <Select
                    value={formData.referralNetwork.updateFrequency}
                    onValueChange={(value) => handleFieldUpdate('referralNetwork', 'updateFrequency', value)}
                    disabled={readOnly}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select frequency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="real_time">Real-time</SelectItem>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="as_needed">As Needed</SelectItem>
                      <SelectItem value="milestone_based">Milestone-based</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Network Agreements */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Network Agreements</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="formalReferralAgreements"
                    checked={formData.referralNetwork.formalReferralAgreements}
                    onCheckedChange={(checked) => handleFieldUpdate('referralNetwork', 'formalReferralAgreements', checked === true)}
                    disabled={readOnly}
                  />
                  <Label htmlFor="formalReferralAgreements">Formal Referral Agreements in Place</Label>
                </div>

                <div>
                  <Label htmlFor="sharedCareProtocols">Shared Care Protocols</Label>
                  <Textarea
                    id="sharedCareProtocols"
                    value={formData.referralNetwork.sharedCareProtocols}
                    onChange={(e) => handleFieldUpdate('referralNetwork', 'sharedCareProtocols', e.target.value)}
                    disabled={readOnly}
                  />
                </div>

                <div>
                  <Label htmlFor="coverageAgreements">Coverage Agreements</Label>
                  <Textarea
                    id="coverageAgreements"
                    value={formData.referralNetwork.coverageAgreements}
                    onChange={(e) => handleFieldUpdate('referralNetwork', 'coverageAgreements', e.target.value)}
                    disabled={readOnly}
                  />
                </div>

                <div>
                  <Label htmlFor="continuingEducationCollaboration">Continuing Education Collaboration</Label>
                  <Textarea
                    id="continuingEducationCollaboration"
                    value={formData.referralNetwork.continuingEducationCollaboration}
                    onChange={(e) => handleFieldUpdate('referralNetwork', 'continuingEducationCollaboration', e.target.value)}
                    disabled={readOnly}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

// Default data structure for initialization
export const createEmptyComprehensiveProviderData = (): ComprehensiveProviderData => ({
  provider: {
    firstName: '',
    middleName: '',
    lastName: '',
    credentials: '',
    npi: '',
    taxonomyCodes: [],
    primarySpecialty: '',
    boardCertifications: [],
    medicalSchool: '',
    graduationYear: '',
    residencyDetails: '',
    fellowshipDetails: '',
    primaryAddress: '',
    mailingAddress: '',
    officePhone: '',
    mobilePhone: '',
    faxNumber: '',
    email: '',
    preferredContactMethod: '',
    medicalLicenseNumbers: [],
    deaNumber: '',
    controlledSubstanceStatus: '',
    pdmpRegistration: '',
    disciplinaryActions: false,
    disciplinaryDetails: '',
    yearsInPractice: '',
    practiceType: '',
    hospitalAffiliations: [],
    advancedTherapyExperience: false,
    advancedTherapyDetails: '',
    malpracticeCarrier: '',
    policyNumber: '',
    coverageLimits: '',
    insuranceExpirationDate: new Date(),
    rems: [],
    cartCertification: false,
    geneTherapyTraining: false,
    radioligandCertification: false,
    crsManagementTraining: false,
    radiationSafetyCert: false,
    biomarkerTraining: false,
    companionDxExperience: false,
    fdaTrainingCerts: [],
    continuingEducationStatus: ''
  },
  facility: {
    name: '',
    dbaNames: '',
    facilityType: '',
    organizationNPI: '',
    taxId: '',
    physicalAddress: '',
    mailingAddress: '',
    phone: '',
    fax: '',
    email: '',
    website: '',
    emergencyContact: '',
    administratorName: '',
    administratorTitle: '',
    administratorContact: '',
    medicalDirectorName: '',
    medicalDirectorNPI: '',
    billingContactName: '',
    billingContactInfo: '',
    paSpecialistContact: '',
    hoursOfOperation: '',
    daysOfOperation: [],
    emergencyHours: '',
    patientCapacity: '',
    bedCount: '',
    treatmentRooms: '',
    languagesSupported: [],
    populationServed: [],
    facilityLicenseNumber: '',
    licenseExpirationDate: new Date(),
    jointCommissionAccred: false,
    jointCommissionId: '',
    carfAccreditation: false,
    carfDetails: '',
    capAccreditation: false,
    capDetails: '',
    factAccreditation: false,
    medicareProviderNumber: '',
    medicaidProviderNumber: '',
    fdaRegistrationNumber: '',
    gmpCompliance: false,
    nrcLicense: '',
    radiationControlPermit: '',
    cliaCertNumber: '',
    biosafetyCommitteeApproval: false,
    irbInformation: '',
    servicesOffered: [],
    treatmentModalities: [],
    infusionServices: false,
    infusionDetails: '',
    laboratoryServices: '',
    pharmacyServices: '',
    imagingServices: [],
    emergencyServicesAccess: false,
    insurancePlansAccepted: [],
    priorAuthRequirements: '',
    financialAssistancePrograms: [],
    patientPaymentOptions: [],
    billingSystem: '',
    ehrSystem: '',
    infusionEquipment: [],
    emergencyEquipment: [],
    backupPowerSystems: false,
    cellProcessingLab: false,
    cellProcessingGrade: '',
    cleanroomFacilities: [],
    cryopreservationCapability: false,
    coldChainManagement: false,
    flowCytometryEquipment: false,
    pcrCapabilities: false,
    radiationDetectionEquipment: false,
    specializedInfusionPumps: false,
    isolationRooms: false,
    cellCountingAnalyzers: false,
    nursingQualifications: '',
    pharmacistInfo: '',
    labPersonnel: '',
    cellTherapyCoordinator: '',
    radiationSafetyOfficer: '',
    apheresisTechnician: '',
    clinicalLabScientist: '',
    emergencyResponseTeam: '',
    qualityAssuranceProgram: false,
    qaDescription: '',
    adverseEventReporting: '',
    emergencyResponseProtocols: '',
    infectionControlProcedures: '',
    physicianCoverage24x7: false,
    physicianCoverageDetails: '',
    icuBedAvailability: false,
    tocilizumabAvailability: false,
    productDeviationReporting: '',
    onSiteLabServices: false,
    cliaStatus: '',
    labMedicalDirectorNPI: '',
    biomarkerTestingCapabilities: false,
    ngsCapability: false,
    companionDxServices: false,
    molecularPathologyExpertise: false,
    referenceLabs: [],
    testingTurnaroundTimes: '',
    immunohistochemistryServices: false,
    validatedShippingVendors: [],
    temperatureMonitoring: false,
    chainOfCustodyProtocols: '',
    internationalShipping: false,
    productStorageRequirements: '',
    coldStorageCapacity: '',
    productReturnProcedures: '',
    disposalProtocols: '',
    inventoryManagementSystem: ''
  },
  referralNetwork: {
    primaryReferringPhysician: {
      name: '',
      credentials: '',
      npi: '',
      specialty: '',
      practiceName: '',
      practiceAddress: '',
      officePhone: '',
      faxNumber: '',
      email: '',
      preferredCommunication: '',
      expectedReferralVolume: '',
      relationshipDuration: ''
    },
    secondaryReferringPhysician: {
      name: '',
      credentials: '',
      npi: '',
      specialty: '',
      practiceName: '',
      practiceAddress: '',
      officePhone: '',
      faxNumber: '',
      email: '',
      preferredCommunication: ''
    },
    referringPracticeGroups: [],
    hospitalAffiliationsForReferrals: [],
    multiDisciplinaryTeamMembers: [],
    consultingOncologist: {name: '', npi: '', contact: ''},
    consultingHematologist: {name: '', npi: '', contact: ''},
    pathologist: {name: '', npi: '', contact: ''},
    radiologist: {name: '', npi: '', contact: ''},
    pharmacogenomicsSpecialist: {name: '', certification: '', contact: ''},
    geneticCounselor: {name: '', certification: '', contact: ''},
    nuclearMedicinePhysician: {name: '', npi: '', contact: ''},
    radiationOncologist: {name: '', npi: '', contact: ''},
    medicalPhysicist: {name: '', certification: '', contact: ''},
    cellularTherapySpecialist: {name: '', npi: '', contact: ''},
    apheresisPhysician: {name: '', npi: '', contact: ''},
    emergencyMedicinePhysician: {name: '', npi: '', contact: ''},
    icuPhysicianCoverage: [],
    referralCriteria: '',
    requiredDocumentation: [],
    referralProcessingTime: '',
    patientCommunicationPreferences: '',
    progressNoteSharingMethod: '',
    dischargePlanningCoordination: '',
    emergencyContactProtocols: '',
    afterHoursCoverage: '',
    ehrIntegration: false,
    ehrSystemName: '',
    secureMessagingSystem: '',
    preferredReportFormat: '',
    updateFrequency: '',
    patientPortalAccess: false,
    careplanSharingProtocols: '',
    outcomesReportingRequirements: '',
    formalReferralAgreements: false,
    sharedCareProtocols: '',
    coverageAgreements: '',
    crossCoverageArrangements: '',
    continuingEducationCollaboration: ''
  }
});

// Export types
export type { ComprehensiveProviderData };