
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TreatmentCenterOnboarding } from '@/types/onboarding';
import { Separator } from '@/components/ui/separator';
import { Plus, X, Shield, FileText, Calendar, AlertTriangle } from 'lucide-react';

interface LicensesStepProps {
  data: Partial<TreatmentCenterOnboarding>;
  onDataChange: (data: Partial<TreatmentCenterOnboarding>) => void;
}

const LICENSE_TYPES = [
  { value: 'controlled_substance', label: 'Controlled Substance License' },
  { value: 'clia_certificate', label: 'CLIA Certificate' },
  { value: 'state_medical', label: 'State Medical License' },
  { value: 'nursing_home', label: 'Nursing Home License' },
  { value: 'laboratory', label: 'Laboratory License' },
  { value: 'radiation_safety', label: 'Radiation Safety License' },
  { value: 'waste_management', label: 'Medical Waste Management' },
  { value: 'fire_department', label: 'Fire Department Permit' },
  { value: 'building_permit', label: 'Building/Occupancy Permit' },
  { value: 'other', label: 'Other License/Certification' }
];

const US_STATES = [
  { value: 'AL', label: 'Alabama' }, { value: 'AK', label: 'Alaska' }, { value: 'AZ', label: 'Arizona' },
  { value: 'AR', label: 'Arkansas' }, { value: 'CA', label: 'California' }, { value: 'CO', label: 'Colorado' },
  { value: 'CT', label: 'Connecticut' }, { value: 'DE', label: 'Delaware' }, { value: 'FL', label: 'Florida' },
  { value: 'GA', label: 'Georgia' }, { value: 'HI', label: 'Hawaii' }, { value: 'ID', label: 'Idaho' },
  { value: 'IL', label: 'Illinois' }, { value: 'IN', label: 'Indiana' }, { value: 'IA', label: 'Iowa' },
  { value: 'KS', label: 'Kansas' }, { value: 'KY', label: 'Kentucky' }, { value: 'LA', label: 'Louisiana' },
  { value: 'ME', label: 'Maine' }, { value: 'MD', label: 'Maryland' }, { value: 'MA', label: 'Massachusetts' },
  { value: 'MI', label: 'Michigan' }, { value: 'MN', label: 'Minnesota' }, { value: 'MS', label: 'Mississippi' },
  { value: 'MO', label: 'Missouri' }, { value: 'MT', label: 'Montana' }, { value: 'NE', label: 'Nebraska' },
  { value: 'NV', label: 'Nevada' }, { value: 'NH', label: 'New Hampshire' }, { value: 'NJ', label: 'New Jersey' },
  { value: 'NM', label: 'New Mexico' }, { value: 'NY', label: 'New York' }, { value: 'NC', label: 'North Carolina' },
  { value: 'ND', label: 'North Dakota' }, { value: 'OH', label: 'Ohio' }, { value: 'OK', label: 'Oklahoma' },
  { value: 'OR', label: 'Oregon' }, { value: 'PA', label: 'Pennsylvania' }, { value: 'RI', label: 'Rhode Island' },
  { value: 'SC', label: 'South Carolina' }, { value: 'SD', label: 'South Dakota' }, { value: 'TN', label: 'Tennessee' },
  { value: 'TX', label: 'Texas' }, { value: 'UT', label: 'Utah' }, { value: 'VT', label: 'Vermont' },
  { value: 'VA', label: 'Virginia' }, { value: 'WA', label: 'Washington' }, { value: 'WV', label: 'West Virginia' },
  { value: 'WI', label: 'Wisconsin' }, { value: 'WY', label: 'Wyoming' }
];

export const LicensesStep: React.FC<LicensesStepProps> = ({ data, onDataChange }) => {
  const licenses = data.licenses || {
    additional_licenses: []
  };

  const updateLicense = (field: string, value: string) => {
    const updatedLicenses = {
      ...licenses,
      [field]: value
    };

    onDataChange({
      ...data,
      licenses: updatedLicenses
    });
  };

  const addAdditionalLicense = () => {
    const updatedLicenses = {
      ...licenses,
      additional_licenses: [
        ...licenses.additional_licenses,
        { type: '', number: '', state: '', expiration_date: '' }
      ]
    };

    onDataChange({
      ...data,
      licenses: updatedLicenses
    });
  };

  const updateAdditionalLicense = (index: number, field: string, value: string) => {
    const updatedLicenses = [...licenses.additional_licenses];
    updatedLicenses[index] = {
      ...updatedLicenses[index],
      [field]: value
    };

    onDataChange({
      ...data,
      licenses: {
        ...licenses,
        additional_licenses: updatedLicenses
      }
    });
  };

  const removeAdditionalLicense = (index: number) => {
    const updatedLicenses = licenses.additional_licenses.filter((_, i) => i !== index);
    
    onDataChange({
      ...data,
      licenses: {
        ...licenses,
        additional_licenses: updatedLicenses
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Primary Licenses */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Shield className="h-5 w-5" />
            <span>Primary Licenses & Certifications</span>
          </CardTitle>
          <CardDescription>
            Enter your primary healthcare and business licenses
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="dea-number">DEA Registration Number</Label>
              <Input
                id="dea-number"
                value={licenses.dea_number || ''}
                onChange={(e) => updateLicense('dea_number', e.target.value)}
                placeholder="B12345678"
                maxLength={9}
              />
              <p className="text-xs text-muted-foreground mt-1">Required for controlled substances</p>
            </div>
            <div>
              <Label htmlFor="hin-number">HIN (Health Industry Number)</Label>
              <Input
                id="hin-number"
                value={licenses.hin_number || ''}
                onChange={(e) => updateLicense('hin_number', e.target.value)}
                placeholder="Enter HIN number"
              />
              <p className="text-xs text-muted-foreground mt-1">Healthcare industry identifier</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="medical-license">Medical License Number</Label>
              <Input
                id="medical-license"
                value={licenses.medical_license || ''}
                onChange={(e) => updateLicense('medical_license', e.target.value)}
                placeholder="Enter medical license"
              />
              <p className="text-xs text-muted-foreground mt-1">State medical practice license</p>
            </div>
            <div>
              <Label htmlFor="pharmacy-license">State Pharmacy License</Label>
              <Input
                id="pharmacy-license"
                value={licenses.state_pharmacy_license || ''}
                onChange={(e) => updateLicense('state_pharmacy_license', e.target.value)}
                placeholder="Enter pharmacy license"
              />
              <p className="text-xs text-muted-foreground mt-1">Required for pharmaceutical operations</p>
            </div>
          </div>

          <div>
            <Label htmlFor="resale-exemption">Resale Tax Exemption Number</Label>
            <Input
              id="resale-exemption"
              value={licenses.resale_tax_exemption || ''}
              onChange={(e) => updateLicense('resale_tax_exemption', e.target.value)}
              placeholder="Enter tax exemption number"
            />
            <p className="text-xs text-muted-foreground mt-1">Sales tax exemption certificate number</p>
          </div>
        </CardContent>
      </Card>

      <Separator />

      {/* Additional Licenses */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Additional Licenses & Certifications</span>
            <Button
              type="button"
              onClick={addAdditionalLicense}
              size="sm"
              className="flex items-center space-x-2"
            >
              <Plus className="h-4 w-4" />
              <span>Add License</span>
            </Button>
          </CardTitle>
          <CardDescription>
            Any additional professional licenses, certifications, or permits
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {licenses.additional_licenses.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No additional licenses added yet.</p>
              <p className="text-sm">Click "Add License" to include additional certifications.</p>
            </div>
          ) : (
            licenses.additional_licenses.map((license, index) => (
              <Card key={index} className="border-l-4 border-l-green-500">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-base">License {index + 1}</CardTitle>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeAdditionalLicense(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>License Type *</Label>
                    <Select
                      value={license.type}
                      onValueChange={(value) => updateAdditionalLicense(index, 'type', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select license type" />
                      </SelectTrigger>
                      <SelectContent>
                        {LICENSE_TYPES.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>License Number *</Label>
                      <Input
                        value={license.number}
                        onChange={(e) => updateAdditionalLicense(index, 'number', e.target.value)}
                        placeholder="Enter license number"
                        required
                      />
                    </div>
                    <div>
                      <Label>Issuing State *</Label>
                      <Select
                        value={license.state}
                        onValueChange={(value) => updateAdditionalLicense(index, 'state', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select state" />
                        </SelectTrigger>
                        <SelectContent className="max-h-60">
                          {US_STATES.map((state) => (
                            <SelectItem key={state.value} value={state.value}>
                              {state.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div>
                    <Label className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4" />
                      <span>Expiration Date</span>
                    </Label>
                    <Input
                      type="date"
                      value={license.expiration_date || ''}
                      onChange={(e) => updateAdditionalLicense(index, 'expiration_date', e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                    />
                    <p className="text-xs text-muted-foreground mt-1">Leave blank if license doesn't expire</p>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </CardContent>
      </Card>

      {/* Important Notice */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5" />
          <div>
            <h4 className="font-medium text-amber-900">License Documentation Required</h4>
            <p className="text-sm text-amber-700 mt-1">
              You will need to upload copies of all licenses and certifications in the Documents section. 
              Ensure all licenses are current and not expired.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
