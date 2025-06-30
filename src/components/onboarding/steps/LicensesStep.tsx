
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { TreatmentCenterOnboarding } from '@/types/onboarding';
import { Separator } from '@/components/ui/separator';
import { Plus, X, Shield, FileText, Calendar } from 'lucide-react';

interface LicensesStepProps {
  data: Partial<TreatmentCenterOnboarding>;
  onDataChange: (data: Partial<TreatmentCenterOnboarding>) => void;
}

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
                placeholder="Enter DEA number"
              />
            </div>
            <div>
              <Label htmlFor="hin-number">HIN (Health Industry Number)</Label>
              <Input
                id="hin-number"
                value={licenses.hin_number || ''}
                onChange={(e) => updateLicense('hin_number', e.target.value)}
                placeholder="Enter HIN number"
              />
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
            </div>
            <div>
              <Label htmlFor="pharmacy-license">State Pharmacy License</Label>
              <Input
                id="pharmacy-license"
                value={licenses.state_pharmacy_license || ''}
                onChange={(e) => updateLicense('state_pharmacy_license', e.target.value)}
                placeholder="Enter pharmacy license"
              />
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
                    <Input
                      value={license.type}
                      onChange={(e) => updateAdditionalLicense(index, 'type', e.target.value)}
                      placeholder="e.g., Controlled Substance License, CLIA Certificate"
                      required
                    />
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
                      <Input
                        value={license.state}
                        onChange={(e) => updateAdditionalLicense(index, 'state', e.target.value)}
                        placeholder="State code (e.g., CA, NY)"
                        maxLength={2}
                        required
                      />
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
                    />
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
          <Shield className="h-5 w-5 text-amber-600 mt-0.5" />
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
