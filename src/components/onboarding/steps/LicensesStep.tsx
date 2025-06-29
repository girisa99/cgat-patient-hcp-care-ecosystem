
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Plus, Trash2 } from 'lucide-react';
import { TreatmentCenterOnboarding } from '@/types/onboarding';

interface LicensesStepProps {
  data: Partial<TreatmentCenterOnboarding>;
  onUpdate: (data: Partial<TreatmentCenterOnboarding>) => void;
}

export const LicensesStep: React.FC<LicensesStepProps> = ({ data, onUpdate }) => {
  const updateLicense = (field: string, value: string) => {
    onUpdate({
      licenses: {
        ...data.licenses,
        [field]: value
      }
    });
  };

  const addAdditionalLicense = () => {
    const currentLicenses = data.licenses?.additional_licenses || [];
    onUpdate({
      licenses: {
        ...data.licenses,
        additional_licenses: [
          ...currentLicenses,
          { type: '', number: '', state: '', expiration_date: '' }
        ]
      }
    });
  };

  const updateAdditionalLicense = (index: number, field: string, value: string) => {
    const currentLicenses = data.licenses?.additional_licenses || [];
    const updatedLicenses = [...currentLicenses];
    updatedLicenses[index] = { ...updatedLicenses[index], [field]: value };
    onUpdate({
      licenses: {
        ...data.licenses,
        additional_licenses: updatedLicenses
      }
    });
  };

  const removeAdditionalLicense = (index: number) => {
    const currentLicenses = data.licenses?.additional_licenses || [];
    onUpdate({
      licenses: {
        ...data.licenses,
        additional_licenses: currentLicenses.filter((_, i) => i !== index)
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Primary Licenses */}
      <Card>
        <CardHeader>
          <CardTitle>Primary Licenses & Certifications</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="dea_number">DEA Number</Label>
              <Input
                id="dea_number"
                value={data.licenses?.dea_number || ''}
                onChange={(e) => updateLicense('dea_number', e.target.value)}
                placeholder="Enter DEA number"
              />
            </div>
            <div>
              <Label htmlFor="hin_number">HIN Number</Label>
              <Input
                id="hin_number"
                value={data.licenses?.hin_number || ''}
                onChange={(e) => updateLicense('hin_number', e.target.value)}
                placeholder="Enter HIN number"
              />
            </div>
            <div>
              <Label htmlFor="medical_license">Medical License</Label>
              <Input
                id="medical_license"
                value={data.licenses?.medical_license || ''}
                onChange={(e) => updateLicense('medical_license', e.target.value)}
                placeholder="Enter medical license number"
              />
            </div>
            <div>
              <Label htmlFor="pharmacy_license">State Pharmacy License</Label>
              <Input
                id="pharmacy_license"
                value={data.licenses?.state_pharmacy_license || ''}
                onChange={(e) => updateLicense('state_pharmacy_license', e.target.value)}
                placeholder="Enter pharmacy license number"
              />
            </div>
            <div>
              <Label htmlFor="resale_tax">Resale Tax Exemption</Label>
              <Input
                id="resale_tax"
                value={data.licenses?.resale_tax_exemption || ''}
                onChange={(e) => updateLicense('resale_tax_exemption', e.target.value)}
                placeholder="Enter tax exemption number"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Additional Licenses */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Additional Licenses & Certifications
            <Button onClick={addAdditionalLicense} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add License
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {data.licenses?.additional_licenses?.map((license, index) => (
            <div key={index} className="border rounded-lg p-4 space-y-3">
              <div className="flex justify-between items-center">
                <h4 className="font-medium">License {index + 1}</h4>
                <Button
                  onClick={() => removeAdditionalLicense(index)}
                  variant="destructive"
                  size="sm"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor={`license_type_${index}`}>License Type *</Label>
                  <Input
                    id={`license_type_${index}`}
                    value={license.type}
                    onChange={(e) => updateAdditionalLicense(index, 'type', e.target.value)}
                    placeholder="e.g., State Medical License"
                  />
                </div>
                <div>
                  <Label htmlFor={`license_number_${index}`}>License Number *</Label>
                  <Input
                    id={`license_number_${index}`}
                    value={license.number}
                    onChange={(e) => updateAdditionalLicense(index, 'number', e.target.value)}
                    placeholder="Enter license number"
                  />
                </div>
                <div>
                  <Label htmlFor={`license_state_${index}`}>Issuing State *</Label>
                  <Input
                    id={`license_state_${index}`}
                    value={license.state}
                    onChange={(e) => updateAdditionalLicense(index, 'state', e.target.value)}
                    placeholder="Enter state"
                  />
                </div>
                <div>
                  <Label htmlFor={`license_expiration_${index}`}>Expiration Date</Label>
                  <Input
                    id={`license_expiration_${index}`}
                    type="date"
                    value={license.expiration_date || ''}
                    onChange={(e) => updateAdditionalLicense(index, 'expiration_date', e.target.value)}
                  />
                </div>
              </div>
            </div>
          )) || (
            <div className="text-center py-8 text-muted-foreground">
              <p>No additional licenses added yet.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
