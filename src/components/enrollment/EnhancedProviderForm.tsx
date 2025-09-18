/**
 * ENHANCED PROVIDER FORM
 * Comprehensive provider enrollment with NPI verification integration
 * Supports all 44 provider field scenarios with agent auto-fill
 */
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CheckCircle, AlertCircle, Loader2, User, Building, ShieldCheck, Award, Network } from 'lucide-react';
import { useNPIVerification } from '@/hooks/useNPIVerification';
import { useEnrollmentAgent } from '@/hooks/useEnrollmentAgent';
import { useMasterToast } from '@/hooks/useMasterToast';

interface ProviderFormData {
  // Basic Provider Info (16 base fields)
  firstName: string;
  lastName: string;
  middleInitial: string;
  suffix: string;
  npi: string;
  taxonomy: string;
  primarySpecialty: string;
  secondarySpecialty: string;
  email: string;
  phone: string;
  fax: string;
  dateOfBirth: string;
  ssn: string;
  medicalLicenseNumber: string;
  medicalLicenseState: string;
  medicalLicenseExpiration: string;

  // Facility Info (+8 fields)
  facilityName: string;
  facilityNPI: string;
  facilityAddress: string;
  facilityCity: string;
  facilityState: string;
  facilityZip: string;
  facilityPhone: string;
  facilityType: string;

  // NPI Verification & Credentialing (+12 fields)
  deaNumber: string;
  deaExpiration: string;
  cdsNumber: string;
  boardCertification: string;
  boardCertificationExpiration: string;
  malpracticeInsurance: string;
  malpracticeCarrier: string;
  malpracticePolicyNumber: string;
  malpracticeExpiration: string;
  backgroundCheckStatus: string;
  credentialingStatus: string;
  lastCredentialingDate: string;

  // Advanced Therapy Certifications (+5 fields)
  suboxoneWaiver: string;
  suboxoneWaiverNumber: string;
  matCertification: string;
  opioidTreatmentLicense: string;
  specializedTraining: string;

  // Referral Network (+3 fields)
  referralNetworkId: string;
  preferredReferralPartners: string;
  referralAgreements: string;
}

interface EnhancedProviderFormProps {
  onSubmit?: (data: ProviderFormData) => void;
  initialData?: Partial<ProviderFormData>;
  moduleType?: 'patient' | 'treatment_center' | 'customer' | 'manufacturer';
}

export const EnhancedProviderForm: React.FC<EnhancedProviderFormProps> = ({
  onSubmit,
  initialData = {},
  moduleType = 'patient'
}) => {
  const [formData, setFormData] = useState<ProviderFormData>({
    firstName: '',
    lastName: '',
    middleInitial: '',
    suffix: '',
    npi: '',
    taxonomy: '',
    primarySpecialty: '',
    secondarySpecialty: '',
    email: '',
    phone: '',
    fax: '',
    dateOfBirth: '',
    ssn: '',
    medicalLicenseNumber: '',
    medicalLicenseState: '',
    medicalLicenseExpiration: '',
    facilityName: '',
    facilityNPI: '',
    facilityAddress: '',
    facilityCity: '',
    facilityState: '',
    facilityZip: '',
    facilityPhone: '',
    facilityType: '',
    deaNumber: '',
    deaExpiration: '',
    cdsNumber: '',
    boardCertification: '',
    boardCertificationExpiration: '',
    malpracticeInsurance: '',
    malpracticeCarrier: '',
    malpracticePolicyNumber: '',
    malpracticeExpiration: '',
    backgroundCheckStatus: '',
    credentialingStatus: '',
    lastCredentialingDate: '',
    suboxoneWaiver: '',
    suboxoneWaiverNumber: '',
    matCertification: '',
    opioidTreatmentLicense: '',
    specializedTraining: '',
    referralNetworkId: '',
    preferredReferralPartners: '',
    referralAgreements: '',
    ...initialData
  });

  const [verificationStatus, setVerificationStatus] = useState<'idle' | 'verifying' | 'verified' | 'failed'>('idle');
  const [npiData, setNpiData] = useState<any>(null);

  const { verifyCredentials, isVerifying } = useNPIVerification();
  const { updateSection, currentSession } = useEnrollmentAgent();
  const { showSuccess, showError } = useMasterToast();

  const updateFormData = (field: keyof ProviderFormData, value: string) => {
    // Apply UNIVERSAL DATABASE CONSTRAINT FIXES before updating form data
    let processedValue = value;

    // UNIVERSAL FIX 1: Convert empty strings to null for database compliance
    if (typeof processedValue === 'string' && processedValue.trim() === '') {
      processedValue = '';  // Keep empty for form display, will convert to null on save
    }

    // UNIVERSAL FIX 2: NPI field validation - only allow digits, max 10
    if (field.toLowerCase().includes('npi')) {
      const digits = processedValue.replace(/\D/g, '');
      processedValue = digits.slice(0, 10); // Limit to 10 digits max
    }

    setFormData(prev => ({ ...prev, [field]: processedValue }));
  };

  const handleNPIVerification = async () => {
    if (!formData.npi) {
      showError('Please enter an NPI number');
      return;
    }

    setVerificationStatus('verifying');

    try {
      const result = await verifyCredentials({
        npi: formData.npi,
        providerType: 'individual',
        providerName: `${formData.firstName} ${formData.lastName}`.trim()
      });

      if (result.isValid && result.npiData) {
        setVerificationStatus('verified');
        setNpiData(result.npiData);
        
        // Auto-fill form data from NPI verification
        const autoFillData = extractNPIData(result.npiData);
        setFormData(prev => ({ ...prev, ...autoFillData }));

        // Update enrollment session if active
        if (currentSession) {
          await updateSection('provider_info', { ...formData, ...autoFillData, npiVerified: true });
        }

        showSuccess('NPI Verified', 'Provider information has been auto-filled');
      } else {
        setVerificationStatus('failed');
        showError('NPI Verification Failed', result.issues.join(', ') || 'Unable to verify NPI');
      }
    } catch (error) {
      setVerificationStatus('failed');
      showError('Verification Error', 'Failed to verify NPI');
    }
  };

  const extractNPIData = (npiData: any): Partial<ProviderFormData> => {
    return {
      firstName: npiData.basic?.first_name || '',
      lastName: npiData.basic?.last_name || '',
      primarySpecialty: npiData.taxonomies?.[0]?.desc || '',
      taxonomy: npiData.taxonomies?.[0]?.code || '',
      // Extract more fields based on NPI data structure
      facilityName: npiData.addresses?.[0]?.organization_name || '',
      facilityAddress: npiData.addresses?.[0]?.address_1 || '',
      facilityCity: npiData.addresses?.[0]?.city || '',
      facilityState: npiData.addresses?.[0]?.state || '',
      facilityZip: npiData.addresses?.[0]?.postal_code || '',
      facilityPhone: npiData.addresses?.[0]?.telephone_number || ''
    };
  };

  const handleSubmit = () => {
    if (onSubmit) {
      onSubmit(formData);
    }
  };

  const getFieldCount = () => {
    const baseFields = 16;
    let additionalFields = 0;
    
    // Add facility fields if facility data is present
    if (formData.facilityName || formData.facilityNPI) additionalFields += 8;
    
    // Add credentialing fields if verification data is present
    if (formData.deaNumber || formData.boardCertification) additionalFields += 12;
    
    // Add therapy certifications if present
    if (formData.suboxoneWaiver || formData.matCertification) additionalFields += 5;
    
    // Add referral network if present
    if (formData.referralNetworkId) additionalFields += 3;
    
    return baseFields + additionalFields;
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Enhanced Provider Enrollment
          </div>
          <Badge variant="secondary">{getFieldCount()} Fields Active</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="provider" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="provider" className="flex items-center gap-1">
              <User className="h-4 w-4" />
              Provider
            </TabsTrigger>
            <TabsTrigger value="facility" className="flex items-center gap-1">
              <Building className="h-4 w-4" />
              Facility
            </TabsTrigger>
            <TabsTrigger value="verification" className="flex items-center gap-1">
              <ShieldCheck className="h-4 w-4" />
              Verification
            </TabsTrigger>
            <TabsTrigger value="certifications" className="flex items-center gap-1">
              <Award className="h-4 w-4" />
              Certifications
            </TabsTrigger>
            <TabsTrigger value="network" className="flex items-center gap-1">
              <Network className="h-4 w-4" />
              Network
            </TabsTrigger>
          </TabsList>

          {/* Provider Info Tab */}
          <TabsContent value="provider" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) => updateFormData('firstName', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) => updateFormData('lastName', e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="middleInitial">Middle Initial</Label>
                <Input
                  id="middleInitial"
                  value={formData.middleInitial}
                  onChange={(e) => updateFormData('middleInitial', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="suffix">Suffix</Label>
                <Input
                  id="suffix"
                  value={formData.suffix}
                  onChange={(e) => updateFormData('suffix', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="dateOfBirth">Date of Birth</Label>
                <Input
                  id="dateOfBirth"
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(e) => updateFormData('dateOfBirth', e.target.value)}
                />
              </div>
            </div>

            <Separator />

            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="flex-1">
                  <Label htmlFor="npi">NPI Number</Label>
                  <Input
                    id="npi"
                    value={formData.npi}
                    onChange={(e) => updateFormData('npi', e.target.value)}
                    placeholder="10-digit NPI number"
                  />
                </div>
                <Button
                  onClick={handleNPIVerification}
                  disabled={!formData.npi || isVerifying}
                  className="mt-6"
                >
                  {isVerifying ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="h-4 w-4 mr-2" />
                      Verify NPI
                    </>
                  )}
                </Button>
              </div>

              {verificationStatus === 'verified' && (
                <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-950 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span className="text-green-800 dark:text-green-200">NPI Verified - Data auto-filled</span>
                </div>
              )}

              {verificationStatus === 'failed' && (
                <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-950 rounded-lg">
                  <AlertCircle className="h-5 w-5 text-red-600" />
                  <span className="text-red-800 dark:text-red-200">NPI Verification Failed</span>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="primarySpecialty">Primary Specialty</Label>
                <Input
                  id="primarySpecialty"
                  value={formData.primarySpecialty}
                  onChange={(e) => updateFormData('primarySpecialty', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="secondarySpecialty">Secondary Specialty</Label>
                <Input
                  id="secondarySpecialty"
                  value={formData.secondarySpecialty}
                  onChange={(e) => updateFormData('secondarySpecialty', e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => updateFormData('email', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => updateFormData('phone', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="fax">Fax</Label>
                <Input
                  id="fax"
                  value={formData.fax}
                  onChange={(e) => updateFormData('fax', e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="medicalLicenseNumber">Medical License #</Label>
                <Input
                  id="medicalLicenseNumber"
                  value={formData.medicalLicenseNumber}
                  onChange={(e) => updateFormData('medicalLicenseNumber', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="medicalLicenseState">License State</Label>
                <Input
                  id="medicalLicenseState"
                  value={formData.medicalLicenseState}
                  onChange={(e) => updateFormData('medicalLicenseState', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="medicalLicenseExpiration">License Expiration</Label>
                <Input
                  id="medicalLicenseExpiration"
                  type="date"
                  value={formData.medicalLicenseExpiration}
                  onChange={(e) => updateFormData('medicalLicenseExpiration', e.target.value)}
                />
              </div>
            </div>
          </TabsContent>

          {/* Facility Info Tab */}
          <TabsContent value="facility" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="facilityName">Facility Name</Label>
                <Input
                  id="facilityName"
                  value={formData.facilityName}
                  onChange={(e) => updateFormData('facilityName', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="facilityNPI">Facility NPI</Label>
                <Input
                  id="facilityNPI"
                  value={formData.facilityNPI}
                  onChange={(e) => updateFormData('facilityNPI', e.target.value)}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="facilityAddress">Address</Label>
              <Input
                id="facilityAddress"
                value={formData.facilityAddress}
                onChange={(e) => updateFormData('facilityAddress', e.target.value)}
              />
            </div>

            <div className="grid grid-cols-4 gap-4">
              <div>
                <Label htmlFor="facilityCity">City</Label>
                <Input
                  id="facilityCity"
                  value={formData.facilityCity}
                  onChange={(e) => updateFormData('facilityCity', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="facilityState">State</Label>
                <Input
                  id="facilityState"
                  value={formData.facilityState}
                  onChange={(e) => updateFormData('facilityState', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="facilityZip">ZIP Code</Label>
                <Input
                  id="facilityZip"
                  value={formData.facilityZip}
                  onChange={(e) => updateFormData('facilityZip', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="facilityPhone">Phone</Label>
                <Input
                  id="facilityPhone"
                  value={formData.facilityPhone}
                  onChange={(e) => updateFormData('facilityPhone', e.target.value)}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="facilityType">Facility Type</Label>
              <Select value={formData.facilityType} onValueChange={(value) => updateFormData('facilityType', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select facility type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="hospital">Hospital</SelectItem>
                  <SelectItem value="clinic">Clinic</SelectItem>
                  <SelectItem value="private_practice">Private Practice</SelectItem>
                  <SelectItem value="treatment_center">Treatment Center</SelectItem>
                  <SelectItem value="rehabilitation">Rehabilitation Center</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </TabsContent>

          {/* NPI Verification & Credentialing Tab */}
          <TabsContent value="verification" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="deaNumber">DEA Number</Label>
                <Input
                  id="deaNumber"
                  value={formData.deaNumber}
                  onChange={(e) => updateFormData('deaNumber', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="deaExpiration">DEA Expiration</Label>
                <Input
                  id="deaExpiration"
                  type="date"
                  value={formData.deaExpiration}
                  onChange={(e) => updateFormData('deaExpiration', e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="boardCertification">Board Certification</Label>
                <Input
                  id="boardCertification"
                  value={formData.boardCertification}
                  onChange={(e) => updateFormData('boardCertification', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="boardCertificationExpiration">Certification Expiration</Label>
                <Input
                  id="boardCertificationExpiration"
                  type="date"
                  value={formData.boardCertificationExpiration}
                  onChange={(e) => updateFormData('boardCertificationExpiration', e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="malpracticeCarrier">Malpractice Carrier</Label>
                <Input
                  id="malpracticeCarrier"
                  value={formData.malpracticeCarrier}
                  onChange={(e) => updateFormData('malpracticeCarrier', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="malpracticePolicyNumber">Policy Number</Label>
                <Input
                  id="malpracticePolicyNumber"
                  value={formData.malpracticePolicyNumber}
                  onChange={(e) => updateFormData('malpracticePolicyNumber', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="malpracticeExpiration">Policy Expiration</Label>
                <Input
                  id="malpracticeExpiration"
                  type="date"
                  value={formData.malpracticeExpiration}
                  onChange={(e) => updateFormData('malpracticeExpiration', e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="credentialingStatus">Credentialing Status</Label>
                <Select value={formData.credentialingStatus} onValueChange={(value) => updateFormData('credentialingStatus', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                    <SelectItem value="expired">Expired</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="lastCredentialingDate">Last Credentialing Date</Label>
                <Input
                  id="lastCredentialingDate"
                  type="date"
                  value={formData.lastCredentialingDate}
                  onChange={(e) => updateFormData('lastCredentialingDate', e.target.value)}
                />
              </div>
            </div>
          </TabsContent>

          {/* Advanced Therapy Certifications Tab */}
          <TabsContent value="certifications" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="suboxoneWaiver">Suboxone Waiver</Label>
                <Select value={formData.suboxoneWaiver} onValueChange={(value) => updateFormData('suboxoneWaiver', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="expired">Expired</SelectItem>
                    <SelectItem value="not_applicable">Not Applicable</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="suboxoneWaiverNumber">Waiver Number</Label>
                <Input
                  id="suboxoneWaiverNumber"
                  value={formData.suboxoneWaiverNumber}
                  onChange={(e) => updateFormData('suboxoneWaiverNumber', e.target.value)}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="matCertification">MAT Certification</Label>
              <Input
                id="matCertification"
                value={formData.matCertification}
                onChange={(e) => updateFormData('matCertification', e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="opioidTreatmentLicense">Opioid Treatment License</Label>
              <Input
                id="opioidTreatmentLicense"
                value={formData.opioidTreatmentLicense}
                onChange={(e) => updateFormData('opioidTreatmentLicense', e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="specializedTraining">Specialized Training</Label>
              <Input
                id="specializedTraining"
                value={formData.specializedTraining}
                onChange={(e) => updateFormData('specializedTraining', e.target.value)}
                placeholder="List any specialized training or certifications"
              />
            </div>
          </TabsContent>

          {/* Referral Network Tab */}
          <TabsContent value="network" className="space-y-4">
            <div>
              <Label htmlFor="referralNetworkId">Referral Network ID</Label>
              <Input
                id="referralNetworkId"
                value={formData.referralNetworkId}
                onChange={(e) => updateFormData('referralNetworkId', e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="preferredReferralPartners">Preferred Referral Partners</Label>
              <Input
                id="preferredReferralPartners"
                value={formData.preferredReferralPartners}
                onChange={(e) => updateFormData('preferredReferralPartners', e.target.value)}
                placeholder="List preferred referral partners"
              />
            </div>

            <div>
              <Label htmlFor="referralAgreements">Referral Agreements</Label>
              <Input
                id="referralAgreements"
                value={formData.referralAgreements}
                onChange={(e) => updateFormData('referralAgreements', e.target.value)}
                placeholder="Active referral agreements"
              />
            </div>
          </TabsContent>
        </Tabs>

        <div className="mt-6 flex justify-end">
          <Button onClick={handleSubmit} className="w-full sm:w-auto">
            Save Provider Information
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};