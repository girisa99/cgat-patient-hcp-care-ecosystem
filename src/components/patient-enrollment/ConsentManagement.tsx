/**
 * CONSENT MANAGEMENT COMPONENT
 * Handles different patient consent options and provider authorization
 */
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Shield, 
  CheckCircle2, 
  AlertTriangle, 
  Clock,
  User,
  Mail,
  MessageSquare,
  Phone,
  Building2,
  Plus
} from 'lucide-react';
import { SignatureCapture } from '@/components/signature/SignatureCapture';
import { useOnboardingDataPrefill } from '@/hooks/useOnboardingDataPrefill';

export interface ConsentData {
  consentType: 'facility_present' | 'digital_remote' | 'verbal';
  // Prescriber Information
  prescriberFirstName: string;
  prescriberLastName: string;
  practiceName: string;
  prescriberStreet: string;
  prescriberSuite?: string;
  prescriberCity: string;
  prescriberState: string;
  prescriberZip: string;
  prescriberTaxId?: string;
  prescriberNpi: string;
  groupNpi?: string;
  prescriberPhone: string;
  prescriberContactPhone?: string;
  // Legacy fields (keeping for backward compatibility)
  providerName: string;
  providerNpi: string;
  providerPhone: string;
  providerEmail: string;
  // Referral Doctor Information
  referralDoctorName?: string;
  referralDoctorNpi?: string;
  referralDoctorPhone?: string;
  // Treatment Center
  treatmentCenter: string;
  treatmentCenterId?: string;
  treatmentCenterNpi?: string;
  patientConsentStatus: 'pending' | 'obtained' | 'declined';
  consentMethod?: string;
  consentDate?: string;
  consentBy?: string;
  verbalConsentWitness?: string;
  digitalConsentEmail?: string;
  digitalConsentPhone?: string;
  providerSignature?: string;
  providerConsentDate?: string;
  notes?: string;
}

interface ConsentManagementProps {
  consentData: ConsentData;
  onConsentChange: (data: Partial<ConsentData>) => void;
  onProviderInfoUpdate?: (providerData: {
    // Prescriber Details
    prescriberFirstName: string;
    prescriberLastName: string;
    practiceName: string;
    prescriberStreet: string;
    prescriberSuite?: string;
    prescriberCity: string;
    prescriberState: string;
    prescriberZip: string;
    prescriberTaxId?: string;
    prescriberNpi: string;
    groupNpi?: string;
    prescriberPhone: string;
    prescriberContactPhone?: string;
    // Legacy fields
    providerName: string;
    providerNpi: string;
    providerPhone: string;
    providerEmail: string;
    // Referral Doctor
    referralDoctorName?: string;
    referralDoctorNpi?: string;
    referralDoctorPhone?: string;
    // Treatment Center
    treatmentCenterId?: string;
    treatmentCenterName: string;
    treatmentCenterNpi?: string;
  }) => void;
  readOnly?: boolean;
}

export const ConsentManagement: React.FC<ConsentManagementProps> = ({
  consentData,
  onConsentChange,
  onProviderInfoUpdate,
  readOnly = false
}) => {
  const [providerSignature, setProviderSignature] = useState<string | null>(null);
  const [isManualEntry, setIsManualEntry] = useState(false);
  const [selectedProviderId, setSelectedProviderId] = useState<string>('');
  const [selectedTreatmentCenterId, setSelectedTreatmentCenterId] = useState<string>('');
  const { prefillData, isLoading, getUserProfileData } = useOnboardingDataPrefill();
  
  const isProviderLocked = !!(selectedProviderId && selectedProviderId !== 'manual');
  const isTreatmentCenterLocked = !!(selectedTreatmentCenterId && selectedTreatmentCenterId !== 'manual');

  // Auto-populate from current user data if available
  useEffect(() => {
    const loadCurrentUserData = async () => {
      if (!consentData.providerName && !isLoading) {
        const userData = await getUserProfileData();
        if (userData) {
          handleProviderInfoChange('providerName', userData.name);
          handleProviderInfoChange('providerEmail', userData.email);
        }
      }
    };
    loadCurrentUserData();
  }, [isLoading]);

  const handleProviderSelection = (providerId: string) => {
    setSelectedProviderId(providerId);
    if (providerId === 'manual') {
      setIsManualEntry(true);
      return;
    }

    const selectedProvider = prefillData.providers.find(p => p.id === providerId);
    if (selectedProvider) {
      // Split name into first and last name
      const nameParts = selectedProvider.name.split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';
      
      handleProviderInfoChange('prescriberFirstName', firstName);
      handleProviderInfoChange('prescriberLastName', lastName);
      handleProviderInfoChange('providerName', selectedProvider.name);
      handleProviderInfoChange('providerEmail', selectedProvider.email || '');
      handleProviderInfoChange('providerPhone', selectedProvider.phone || '');
      handleProviderInfoChange('prescriberPhone', selectedProvider.phone || '');
      setIsManualEntry(false);
    }
  };

  const handleTreatmentCenterSelection = (centerId: string) => {
    setSelectedTreatmentCenterId(centerId);
    if (centerId === 'manual') {
      return;
    }

    const selectedCenter = prefillData.treatmentCenters.find(c => c.id === centerId);
    if (selectedCenter) {
      handleProviderInfoChange('treatmentCenter', selectedCenter.name);
      handleProviderInfoChange('treatmentCenterNpi', selectedCenter.npi || '');
      handleProviderInfoChange('treatmentCenterId', selectedCenter.id);
    }
  };

  const handleProviderInfoChange = (field: keyof ConsentData, value: any) => {
    const updatedData = { [field]: value } as Partial<ConsentData>;
    onConsentChange(updatedData);
    
    // Auto-update provider information in the main form
    const presciberFields = ['prescriberFirstName', 'prescriberLastName', 'practiceName', 'prescriberStreet', 'prescriberSuite', 'prescriberCity', 'prescriberState', 'prescriberZip', 'prescriberTaxId', 'prescriberNpi', 'groupNpi', 'prescriberPhone', 'prescriberContactPhone', 'providerName', 'providerNpi', 'providerPhone', 'providerEmail', 'referralDoctorName', 'referralDoctorNpi', 'referralDoctorPhone', 'treatmentCenter', 'treatmentCenterNpi', 'treatmentCenterId'];
    
    if (presciberFields.includes(field)) {
      const updatedConsentData = { ...consentData, ...updatedData };
      onProviderInfoUpdate?.({
        prescriberFirstName: updatedConsentData.prescriberFirstName,
        prescriberLastName: updatedConsentData.prescriberLastName,
        practiceName: updatedConsentData.practiceName,
        prescriberStreet: updatedConsentData.prescriberStreet,
        prescriberSuite: updatedConsentData.prescriberSuite,
        prescriberCity: updatedConsentData.prescriberCity,
        prescriberState: updatedConsentData.prescriberState,
        prescriberZip: updatedConsentData.prescriberZip,
        prescriberTaxId: updatedConsentData.prescriberTaxId,
        prescriberNpi: updatedConsentData.prescriberNpi,
        groupNpi: updatedConsentData.groupNpi,
        prescriberPhone: updatedConsentData.prescriberPhone,
        prescriberContactPhone: updatedConsentData.prescriberContactPhone,
        providerName: updatedConsentData.providerName,
        providerNpi: updatedConsentData.providerNpi,
        providerPhone: updatedConsentData.providerPhone,
        providerEmail: updatedConsentData.providerEmail,
        referralDoctorName: updatedConsentData.referralDoctorName,
        referralDoctorNpi: updatedConsentData.referralDoctorNpi,
        referralDoctorPhone: updatedConsentData.referralDoctorPhone,
        treatmentCenterId: updatedConsentData.treatmentCenterId,
        treatmentCenterName: updatedConsentData.treatmentCenter,
        treatmentCenterNpi: updatedConsentData.treatmentCenterNpi
      });
    }
  };

  const handleConsentTypeChange = (type: 'facility_present' | 'digital_remote' | 'verbal') => {
    onConsentChange({ 
      consentType: type,
      patientConsentStatus: 'pending'
    });
  };

  const handleProviderAuthorization = () => {
    if (!providerSignature) return;
    
    onConsentChange({
      providerSignature: providerSignature,
      providerConsentDate: new Date().toISOString()
    });
  };

  const renderConsentTypeSelection = () => (
    <div className="space-y-4">
      <h4 className="font-medium">Select Patient Consent Method</h4>
      
      <div className="grid gap-4">
        {/* Facility Present Option */}
        <Card className={`cursor-pointer border-2 transition-colors ${
          consentData.consentType === 'facility_present' 
            ? 'border-primary bg-primary/5' 
            : 'border-muted hover:border-primary/50'
        }`}
        onClick={() => handleConsentTypeChange('facility_present')}>
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <Building2 className="h-5 w-5 mt-1 text-primary" />
              <div className="flex-1">
                <h5 className="font-medium">Patient/Caregiver Present at Facility</h5>
                <p className="text-sm text-muted-foreground mt-1">
                  Patient or caregiver is physically present and can sign consent immediately
                </p>
                {consentData.consentType === 'facility_present' && (
                  <Badge className="mt-2" variant="default">
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    Selected
                  </Badge>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Digital Remote Option */}
        <Card className={`cursor-pointer border-2 transition-colors ${
          consentData.consentType === 'digital_remote' 
            ? 'border-primary bg-primary/5' 
            : 'border-muted hover:border-primary/50'
        }`}
        onClick={() => handleConsentTypeChange('digital_remote')}>
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <Mail className="h-5 w-5 mt-1 text-primary" />
              <div className="flex-1">
                <h5 className="font-medium">Digital Consent via SMS/Email</h5>
                <p className="text-sm text-muted-foreground mt-1">
                  Send consent form to patient/caregiver via SMS or email for digital signature
                </p>
                {consentData.consentType === 'digital_remote' && (
                  <Badge className="mt-2" variant="default">
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    Selected
                  </Badge>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Verbal Consent Option */}
        <Card className={`cursor-pointer border-2 transition-colors ${
          consentData.consentType === 'verbal' 
            ? 'border-primary bg-primary/5' 
            : 'border-muted hover:border-primary/50'
        }`}
        onClick={() => handleConsentTypeChange('verbal')}>
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <Phone className="h-5 w-5 mt-1 text-primary" />
              <div className="flex-1">
                <h5 className="font-medium">Verbal Consent</h5>
                <p className="text-sm text-muted-foreground mt-1">
                  Obtain verbal consent with witness documentation
                </p>
                {consentData.consentType === 'verbal' && (
                  <Badge className="mt-2" variant="default">
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    Selected
                  </Badge>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderConsentDetails = () => {
    if (!consentData.consentType) return null;

    return (
      <div className="space-y-4">
        <Separator />
        
        {consentData.consentType === 'digital_remote' && (
          <div>
            <h5 className="font-medium mb-3">Digital Consent Contact Information</h5>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="digitalConsentEmail">Email Address</Label>
                <Input
                  id="digitalConsentEmail"
                  type="email"
                  value={consentData.digitalConsentEmail || ''}
                  onChange={(e) => handleProviderInfoChange('digitalConsentEmail', e.target.value)}
                  placeholder="patient@example.com"
                  disabled={readOnly}
                />
              </div>
              <div>
                <Label htmlFor="digitalConsentPhone">Phone Number (for SMS)</Label>
                <Input
                  id="digitalConsentPhone"
                  type="tel"
                  value={consentData.digitalConsentPhone || ''}
                  onChange={(e) => handleProviderInfoChange('digitalConsentPhone', e.target.value)}
                  placeholder="+1 (555) 123-4567"
                  disabled={readOnly}
                />
              </div>
            </div>
          </div>
        )}

        {consentData.consentType === 'verbal' && (
          <div>
            <h5 className="font-medium mb-3">Verbal Consent Documentation</h5>
            <div>
              <Label htmlFor="verbalConsentWitness">Witness Name</Label>
              <Input
                id="verbalConsentWitness"
                value={consentData.verbalConsentWitness || ''}
                onChange={(e) => handleProviderInfoChange('verbalConsentWitness', e.target.value)}
                placeholder="Name of witness present during verbal consent"
                disabled={readOnly}
              />
            </div>
          </div>
        )}

        <div>
          <Label htmlFor="consentNotes">Additional Notes</Label>
          <Textarea
            id="consentNotes"
            value={consentData.notes || ''}
            onChange={(e) => handleProviderInfoChange('notes', e.target.value)}
            placeholder="Any additional notes regarding patient consent..."
            disabled={readOnly}
          />
        </div>
      </div>
    );
  };

  const renderConsentStatus = () => {
    const getStatusBadge = () => {
      switch (consentData.patientConsentStatus) {
        case 'obtained':
          return (
            <Badge className="bg-green-500">
              <CheckCircle2 className="h-3 w-3 mr-1" />
              Consent Obtained
            </Badge>
          );
        case 'declined':
          return (
            <Badge variant="destructive">
              <AlertTriangle className="h-3 w-3 mr-1" />
              Consent Declined
            </Badge>
          );
        default:
          return (
            <Badge variant="secondary">
              <Clock className="h-3 w-3 mr-1" />
              Pending Consent
            </Badge>
          );
      }
    };

    return (
      <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
        <span className="font-medium">Patient Consent Status:</span>
        {getStatusBadge()}
      </div>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Consent Management
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Prescriber Information */}
        <div>
          <h4 className="font-medium mb-3">Prescriber Information</h4>
          <p className="text-sm text-muted-foreground mb-4">
            Complete prescriber details as required for patient enrollment
          </p>
          
          {/* Provider Selection */}
          <div className="mb-4">
            <Label htmlFor="providerSelect">Select Provider</Label>
            <Select 
              value={selectedProviderId} 
              onValueChange={handleProviderSelection}
              disabled={readOnly}
            >
              <SelectTrigger className="bg-background">
                <SelectValue placeholder="Choose existing provider or add new" />
              </SelectTrigger>
              <SelectContent className="z-50 bg-background shadow-md border">
                {prefillData.providers.map(provider => (
                  <SelectItem key={provider.id} value={provider.id}>
                    {provider.name} {provider.email && `(${provider.email})`}
                  </SelectItem>
                ))}
                <SelectItem value="manual">
                  <div className="flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    Add New Provider
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Name and Practice */}
          <div className="grid md:grid-cols-3 gap-4 mb-4">
            <div>
              <Label htmlFor="prescriberFirstName">First Name *</Label>
              <Input
                id="prescriberFirstName"
                value={consentData.prescriberFirstName || ''}
                onChange={(e) => handleProviderInfoChange('prescriberFirstName', e.target.value)}
                disabled={readOnly || isProviderLocked}
                required
                placeholder="John"
                className={!consentData.prescriberFirstName?.trim() ? 'border-destructive focus-visible:ring-destructive' : ''}
                aria-invalid={!consentData.prescriberFirstName?.trim()}
              />
            </div>
            <div>
              <Label htmlFor="prescriberLastName">Last Name *</Label>
              <Input
                id="prescriberLastName"
                value={consentData.prescriberLastName || ''}
                onChange={(e) => handleProviderInfoChange('prescriberLastName', e.target.value)}
                disabled={readOnly || isProviderLocked}
                required
                placeholder="Smith"
                className={!consentData.prescriberLastName?.trim() ? 'border-destructive focus-visible:ring-destructive' : ''}
                aria-invalid={!consentData.prescriberLastName?.trim()}
              />
            </div>
            <div>
              <Label htmlFor="practiceName">Practice Name *</Label>
              <Input
                id="practiceName"
                value={consentData.practiceName || ''}
                onChange={(e) => handleProviderInfoChange('practiceName', e.target.value)}
                disabled={readOnly || isProviderLocked}
                required
                placeholder="ABC Medical Practice"
                className={!consentData.practiceName?.trim() ? 'border-destructive focus-visible:ring-destructive' : ''}
                aria-invalid={!consentData.practiceName?.trim()}
              />
            </div>
          </div>

          {/* Address */}
          <div className="grid md:grid-cols-4 gap-4 mb-4">
            <div className="md:col-span-2">
              <Label htmlFor="prescriberStreet">Street *</Label>
              <Input
                id="prescriberStreet"
                value={consentData.prescriberStreet || ''}
                onChange={(e) => handleProviderInfoChange('prescriberStreet', e.target.value)}
                disabled={readOnly || isProviderLocked}
                required
                placeholder="123 Main Street"
                className={!consentData.prescriberStreet?.trim() ? 'border-destructive focus-visible:ring-destructive' : ''}
                aria-invalid={!consentData.prescriberStreet?.trim()}
              />
            </div>
            <div>
              <Label htmlFor="prescriberSuite">Suite</Label>
              <Input
                id="prescriberSuite"
                value={consentData.prescriberSuite || ''}
                onChange={(e) => handleProviderInfoChange('prescriberSuite', e.target.value)}
                disabled={readOnly || isProviderLocked}
                placeholder="Suite 100"
              />
            </div>
            <div>
              <Label htmlFor="prescriberCity">City *</Label>
              <Input
                id="prescriberCity"
                value={consentData.prescriberCity || ''}
                onChange={(e) => handleProviderInfoChange('prescriberCity', e.target.value)}
                disabled={readOnly || isProviderLocked}
                required
                placeholder="New York"
                className={!consentData.prescriberCity?.trim() ? 'border-destructive focus-visible:ring-destructive' : ''}
                aria-invalid={!consentData.prescriberCity?.trim()}
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <div>
              <Label htmlFor="prescriberState">State *</Label>
              <Input
                id="prescriberState"
                value={consentData.prescriberState || ''}
                onChange={(e) => handleProviderInfoChange('prescriberState', e.target.value)}
                disabled={readOnly || isProviderLocked}
                required
                placeholder="NY"
                maxLength={2}
                className={!consentData.prescriberState?.trim() ? 'border-destructive focus-visible:ring-destructive' : ''}
                aria-invalid={!consentData.prescriberState?.trim()}
              />
            </div>
            <div>
              <Label htmlFor="prescriberZip">ZIP *</Label>
              <Input
                id="prescriberZip"
                value={consentData.prescriberZip || ''}
                onChange={(e) => handleProviderInfoChange('prescriberZip', e.target.value)}
                disabled={readOnly || isProviderLocked}
                required
                placeholder="10001"
                maxLength={10}
                className={!consentData.prescriberZip?.trim() ? 'border-destructive focus-visible:ring-destructive' : ''}
                aria-invalid={!consentData.prescriberZip?.trim()}
              />
            </div>
          </div>

          {/* IDs and Contact */}
          <div className="grid md:grid-cols-3 gap-4 mb-4">
            <div>
              <Label htmlFor="prescriberTaxId">Prescriber Tax ID #</Label>
              <Input
                id="prescriberTaxId"
                value={consentData.prescriberTaxId || ''}
                onChange={(e) => handleProviderInfoChange('prescriberTaxId', e.target.value)}
                disabled={readOnly || isProviderLocked}
                placeholder="12-3456789"
              />
            </div>
            <div>
              <Label htmlFor="prescriberNpi">Prescriber NPI # *</Label>
              <Input
                id="prescriberNpi"
                value={consentData.prescriberNpi || ''}
                onChange={(e) => handleProviderInfoChange('prescriberNpi', e.target.value)}
                disabled={readOnly || isProviderLocked}
                required
                placeholder="1234567890"
                maxLength={10}
                className={!consentData.prescriberNpi?.trim() ? 'border-destructive focus-visible:ring-destructive' : ''}
                aria-invalid={!consentData.prescriberNpi?.trim()}
              />
            </div>
            <div>
              <Label htmlFor="groupNpi">Group NPI #</Label>
              <Input
                id="groupNpi"
                value={consentData.groupNpi || ''}
                onChange={(e) => handleProviderInfoChange('groupNpi', e.target.value)}
                disabled={readOnly || isProviderLocked}
                placeholder="0987654321"
                maxLength={10}
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <div>
              <Label htmlFor="prescriberPhone">Contact Phone *</Label>
              <Input
                id="prescriberPhone"
                type="tel"
                value={consentData.prescriberPhone || ''}
                onChange={(e) => handleProviderInfoChange('prescriberPhone', e.target.value)}
                disabled={readOnly || isProviderLocked}
                required
                placeholder="+1 (555) 123-4567"
                className={!consentData.prescriberPhone?.trim() ? 'border-destructive focus-visible:ring-destructive' : ''}
                aria-invalid={!consentData.prescriberPhone?.trim()}
              />
            </div>
            <div>
              <Label htmlFor="providerEmail">Email *</Label>
              <Input
                id="providerEmail"
                type="email"
                value={consentData.providerEmail || ''}
                onChange={(e) => handleProviderInfoChange('providerEmail', e.target.value)}
                disabled={readOnly || isProviderLocked}
                required
                placeholder="provider@clinic.com"
                className={!consentData.providerEmail?.trim() ? 'border-destructive focus-visible:ring-destructive' : ''}
                aria-invalid={!consentData.providerEmail?.trim()}
              />
            </div>
          </div>

          <Separator className="my-6" />

          {/* Referral Doctor Section */}
          <div className="mb-6">
            <h5 className="font-medium mb-3">Referral Doctor (Optional)</h5>
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="referralDoctorName">Referral Doctor Name</Label>
                <Input
                  id="referralDoctorName"
                  value={consentData.referralDoctorName || ''}
                  onChange={(e) => handleProviderInfoChange('referralDoctorName', e.target.value)}
                  disabled={readOnly}
                  placeholder="Dr. Jane Doe"
                />
              </div>
              <div>
                <Label htmlFor="referralDoctorNpi">Referral Doctor NPI</Label>
                <Input
                  id="referralDoctorNpi"
                  value={consentData.referralDoctorNpi || ''}
                  onChange={(e) => handleProviderInfoChange('referralDoctorNpi', e.target.value)}
                  disabled={readOnly}
                  placeholder="1234567890"
                  maxLength={10}
                />
              </div>
              <div>
                <Label htmlFor="referralDoctorPhone">Referral Doctor Phone</Label>
                <Input
                  id="referralDoctorPhone"
                  type="tel"
                  value={consentData.referralDoctorPhone || ''}
                  onChange={(e) => handleProviderInfoChange('referralDoctorPhone', e.target.value)}
                  disabled={readOnly}
                  placeholder="+1 (555) 987-6543"
                />
              </div>
            </div>
          </div>

          {/* Treatment Center Selection */}
          <div className="mb-4">
            <Label htmlFor="treatmentCenterSelect">Select Treatment Center</Label>
            <Select 
              value={selectedTreatmentCenterId} 
              onValueChange={handleTreatmentCenterSelection}
              disabled={readOnly}
            >
              <SelectTrigger className="bg-background">
                <SelectValue placeholder="Choose existing treatment center or add new" />
              </SelectTrigger>
              <SelectContent className="z-50 bg-background shadow-md border">
                {prefillData.treatmentCenters.map(center => (
                  <SelectItem key={center.id} value={center.id}>
                    {center.name} {center.npi && `(NPI: ${center.npi})`}
                  </SelectItem>
                ))}
                <SelectItem value="manual">
                  <div className="flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    Add New Treatment Center
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="treatmentCenter">Treatment Center *</Label>
              <Input
                id="treatmentCenter"
                value={consentData.treatmentCenter}
                onChange={(e) => handleProviderInfoChange('treatmentCenter', e.target.value)}
                disabled={readOnly || isTreatmentCenterLocked}
                required
                placeholder="ABC Medical Center"
                className={!consentData.treatmentCenter?.trim() ? 'border-destructive focus-visible:ring-destructive' : ''}
                aria-invalid={!consentData.treatmentCenter?.trim()}
              />
            </div>
            <div>
              <Label htmlFor="treatmentCenterNpi">Treatment Center NPI</Label>
              <Input
                id="treatmentCenterNpi"
                value={consentData.treatmentCenterNpi || ''}
                onChange={(e) => handleProviderInfoChange('treatmentCenterNpi', e.target.value)}
                disabled={readOnly}
                placeholder="1234567890"
                maxLength={10}
              />
            </div>
          </div>
        </div>

        <Separator />

        {/* Provider Authorization */}
        <div>
          <h4 className="font-medium mb-3">Provider Authorization</h4>
          <p className="text-sm text-muted-foreground mb-4">
            As the healthcare provider, I authorize the initiation of patient enrollment 
            and consent collection process using the selected method below.
          </p>
          
          <SignatureCapture
            title="Provider Authorization Signature"
            description="I authorize the patient consent collection process"
            required={true}
            onSignatureChange={setProviderSignature}
            value={providerSignature}
            disabled={readOnly}
          />

          <Button 
            onClick={handleProviderAuthorization}
            disabled={!providerSignature || readOnly}
            className="w-full mt-4"
          >
            <CheckCircle2 className="h-4 w-4 mr-2" />
            Authorize Consent Process
          </Button>

          {consentData.providerConsentDate && (
            <Alert className="mt-4">
              <CheckCircle2 className="h-4 w-4" />
              <AlertDescription>
                Provider authorization recorded on {new Date(consentData.providerConsentDate).toLocaleString()}
              </AlertDescription>
            </Alert>
          )}
        </div>

        <Separator />

        {/* Patient Consent Method Selection */}
        {consentData.providerConsentDate && renderConsentTypeSelection()}

        {/* Consent Details Based on Selected Method */}
        {renderConsentDetails()}

        {/* Consent Status */}
        {consentData.consentType && renderConsentStatus()}
      </CardContent>
    </Card>
  );
};