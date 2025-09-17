/**
 * COMPLETE PROVIDER & TREATMENT CENTER FORM
 * All 16 fields from online form
 */
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Building2, User, Phone, Mail, MapPin, FileText } from 'lucide-react';
import type { CompleteProviderTreatmentCenter } from '@/types/completeEnrollmentMapping';

interface CompleteProviderFormProps {
  formData: CompleteProviderTreatmentCenter;
  updateFormData: (field: keyof CompleteProviderTreatmentCenter, value: any) => void;
  readOnly?: boolean;
}

export const CompleteProviderForm: React.FC<CompleteProviderFormProps> = ({
  formData,
  updateFormData,
  readOnly = false
}) => {
  return (
    <div className="space-y-6">
      {/* Primary Provider Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Primary Provider Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="providerFirstName">Provider First Name *</Label>
              <Input
                id="providerFirstName"
                value={formData.providerFirstName}
                onChange={(e) => updateFormData('providerFirstName', e.target.value)}
                disabled={readOnly}
                required
              />
            </div>
            <div>
              <Label htmlFor="providerLastName">Provider Last Name *</Label>
              <Input
                id="providerLastName"
                value={formData.providerLastName}
                onChange={(e) => updateFormData('providerLastName', e.target.value)}
                disabled={readOnly}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="providerCredentials">Credentials *</Label>
              <Input
                id="providerCredentials"
                value={formData.providerCredentials}
                onChange={(e) => updateFormData('providerCredentials', e.target.value)}
                placeholder="MD, DO, NP, PA, etc."
                disabled={readOnly}
                required
              />
            </div>
            <div>
              <Label htmlFor="providerNPI">Provider NPI *</Label>
              <Input
                id="providerNPI"
                value={formData.providerNPI}
                onChange={(e) => updateFormData('providerNPI', e.target.value)}
                placeholder="10-digit NPI number"
                disabled={readOnly}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="providerSpecialty">Medical Specialty *</Label>
              <Select 
                value={formData.providerSpecialty} 
                onValueChange={(value) => updateFormData('providerSpecialty', value)}
                disabled={readOnly}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select specialty" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="oncology">Oncology</SelectItem>
                  <SelectItem value="hematology">Hematology</SelectItem>
                  <SelectItem value="hematology-oncology">Hematology/Oncology</SelectItem>
                  <SelectItem value="internal-medicine">Internal Medicine</SelectItem>
                  <SelectItem value="family-medicine">Family Medicine</SelectItem>
                  <SelectItem value="pulmonology">Pulmonology</SelectItem>
                  <SelectItem value="cardiology">Cardiology</SelectItem>
                  <SelectItem value="neurology">Neurology</SelectItem>
                  <SelectItem value="rheumatology">Rheumatology</SelectItem>
                  <SelectItem value="gastroenterology">Gastroenterology</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Separator />

          {/* Provider Contact Information */}
          <div className="space-y-4">
            <h4 className="font-medium flex items-center gap-2">
              <Phone className="h-4 w-4" />
              Provider Contact Information
            </h4>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="providerPhone">Office Phone *</Label>
                <Input
                  id="providerPhone"
                  value={formData.providerPhone}
                  onChange={(e) => updateFormData('providerPhone', e.target.value)}
                  placeholder="(555) 123-4567"
                  disabled={readOnly}
                  required
                />
              </div>
              <div>
                <Label htmlFor="providerFax">Fax Number</Label>
                <Input
                  id="providerFax"
                  value={formData.providerFax || ''}
                  onChange={(e) => updateFormData('providerFax', e.target.value)}
                  placeholder="(555) 123-4567"
                  disabled={readOnly}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="providerEmail">Provider Email *</Label>
              <Input
                id="providerEmail"
                type="email"
                value={formData.providerEmail}
                onChange={(e) => updateFormData('providerEmail', e.target.value)}
                placeholder="provider@example.com"
                disabled={readOnly}
                required
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Treatment Center Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Treatment Center Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="treatmentCenterName">Treatment Center Name *</Label>
              <Input
                id="treatmentCenterName"
                value={formData.treatmentCenterName}
                onChange={(e) => updateFormData('treatmentCenterName', e.target.value)}
                disabled={readOnly}
                required
              />
            </div>
            <div>
              <Label htmlFor="treatmentCenterNPI">Treatment Center NPI</Label>
              <Input
                id="treatmentCenterNPI"
                value={formData.treatmentCenterNPI || ''}
                onChange={(e) => updateFormData('treatmentCenterNPI', e.target.value)}
                placeholder="10-digit NPI (if applicable)"
                disabled={readOnly}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="treatmentCenterAddress">Treatment Center Address *</Label>
            <Input
              id="treatmentCenterAddress"
              value={formData.treatmentCenterAddress}
              onChange={(e) => updateFormData('treatmentCenterAddress', e.target.value)}
              placeholder="Full address including city, state, ZIP"
              disabled={readOnly}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="treatmentCenterPhone">Center Phone *</Label>
              <Input
                id="treatmentCenterPhone"
                value={formData.treatmentCenterPhone}
                onChange={(e) => updateFormData('treatmentCenterPhone', e.target.value)}
                placeholder="(555) 123-4567"
                disabled={readOnly}
                required
              />
            </div>
            <div>
              <Label htmlFor="treatmentCenterFax">Center Fax</Label>
              <Input
                id="treatmentCenterFax"
                value={formData.treatmentCenterFax || ''}
                onChange={(e) => updateFormData('treatmentCenterFax', e.target.value)}
                placeholder="(555) 123-4567"
                disabled={readOnly}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Referring Provider (if different) */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Referring Provider (if different from primary)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="referringProviderName">Referring Provider Name</Label>
              <Input
                id="referringProviderName"
                value={formData.referringProviderName || ''}
                onChange={(e) => updateFormData('referringProviderName', e.target.value)}
                placeholder="Full name if different from primary provider"
                disabled={readOnly}
              />
            </div>
            <div>
              <Label htmlFor="referringProviderNPI">Referring Provider NPI</Label>
              <Input
                id="referringProviderNPI"
                value={formData.referringProviderNPI || ''}
                onChange={(e) => updateFormData('referringProviderNPI', e.target.value)}
                placeholder="10-digit NPI number"
                disabled={readOnly}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="referringProviderContact">Referring Provider Contact</Label>
            <Input
              id="referringProviderContact"
              value={formData.referringProviderContact || ''}
              onChange={(e) => updateFormData('referringProviderContact', e.target.value)}
              placeholder="Phone or email for referring provider"
              disabled={readOnly}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Default empty data helper
export const createEmptyCompleteProviderData = (): CompleteProviderTreatmentCenter => ({
  providerFirstName: '',
  providerLastName: '',
  providerMiddleName: '',
  providerCredentials: '',
  providerNPI: '',
  providerSpecialty: '',
  providerSubSpecialty: '',
  providerPhone: '',
  providerFax: '',
  providerEmail: '',
  providerLicenseNumber: '',
  providerLicenseState: '',
  providerLicenseExpiration: '',
  providerDEANumber: '',
  providerTaxonomy: '',
  treatmentCenterName: '',
  treatmentCenterNPI: '',
  treatmentCenterAddress: '',
  treatmentCenterCity: '',
  treatmentCenterState: '',
  treatmentCenterZipCode: '',
  treatmentCenterPhone: '',
  treatmentCenterFax: '',
  treatmentCenterEmail: '',
  treatmentCenterType: 'clinic',
  facilityLicenseNumber: '',
  accreditationStatus: '',
  networkAffiliation: [],
  referringProviderName: '',
  referringProviderNPI: '',
  referringProviderContact: '',
  referringProviderSpecialty: '',
  referralDate: '',
  referralReason: '',
  referralUrgency: 'routine',
  primaryCareManager: '',
  caseManager: '',
  socialWorker: '',
  pharmacist: '',
  preferredAppointmentTime: '',
  appointmentFrequency: '',
  transportationNeeds: '',
  accessibilityRequirements: '',
  interpreterNeeded: false,
  interpreterLanguage: ''
});