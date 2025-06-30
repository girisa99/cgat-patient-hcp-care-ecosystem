
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TreatmentCenterOnboarding } from '@/types/onboarding';

interface CompanyInfoStepProps {
  data: Partial<TreatmentCenterOnboarding>;
  onDataChange: (data: Partial<TreatmentCenterOnboarding>) => void;
}

export const CompanyInfoStep: React.FC<CompanyInfoStepProps> = ({ data, onDataChange }) => {
  const handleInputChange = (field: string, value: any) => {
    onDataChange({
      company_info: {
        ...data.company_info,
        [field]: value,
      },
    });
  };

  const handleAddressChange = (field: string, value: string) => {
    onDataChange({
      company_info: {
        ...data.company_info,
        legal_address: {
          ...data.company_info?.legal_address,
          [field]: value,
        },
      },
    });
  };

  const handleDistributorChange = (distributor: string, checked: boolean) => {
    const currentDistributors = data.selected_distributors || [];
    const updatedDistributors = checked
      ? [...currentDistributors, distributor as any]
      : currentDistributors.filter(d => d !== distributor);
    
    onDataChange({
      selected_distributors: updatedDistributors,
    });
  };

  return (
    <div className="space-y-6">
      {/* Distributor Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Preferred Healthcare Distributors</CardTitle>
          <CardDescription>
            Select the healthcare distributors you would like to work with
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="amerisource_bergen"
              checked={data.selected_distributors?.includes('amerisource_bergen') || false}
              onCheckedChange={(checked) => handleDistributorChange('amerisource_bergen', checked as boolean)}
            />
            <Label htmlFor="amerisource_bergen">AmerisourceBergen</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="cardinal_health"
              checked={data.selected_distributors?.includes('cardinal_health') || false}
              onCheckedChange={(checked) => handleDistributorChange('cardinal_health', checked as boolean)}
            />
            <Label htmlFor="cardinal_health">Cardinal Health</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="mckesson"
              checked={data.selected_distributors?.includes('mckesson') || false}
              onCheckedChange={(checked) => handleDistributorChange('mckesson', checked as boolean)}
            />
            <Label htmlFor="mckesson">McKesson</Label>
          </div>
        </CardContent>
      </Card>

      {/* Company Information */}
      <Card>
        <CardHeader>
          <CardTitle>Company Information</CardTitle>
          <CardDescription>
            Provide your company's basic information and legal details
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="legal_name">Legal Company Name *</Label>
              <Input
                id="legal_name"
                value={data.company_info?.legal_name || ''}
                onChange={(e) => handleInputChange('legal_name', e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="dba_name">DBA Name (if different)</Label>
              <Input
                id="dba_name"
                value={data.company_info?.dba_name || ''}
                onChange={(e) => handleInputChange('dba_name', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                type="url"
                value={data.company_info?.website || ''}
                onChange={(e) => handleInputChange('website', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="federal_tax_id">Federal Tax ID *</Label>
              <Input
                id="federal_tax_id"
                value={data.company_info?.federal_tax_id || ''}
                onChange={(e) => handleInputChange('federal_tax_id', e.target.value)}
                required
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Legal Address */}
      <Card>
        <CardHeader>
          <CardTitle>Legal Address</CardTitle>
          <CardDescription>
            Provide your company's legal business address
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="street">Street Address *</Label>
            <Input
              id="street"
              value={data.company_info?.legal_address?.street || ''}
              onChange={(e) => handleAddressChange('street', e.target.value)}
              required
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="city">City *</Label>
              <Input
                id="city"
                value={data.company_info?.legal_address?.city || ''}
                onChange={(e) => handleAddressChange('city', e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="state">State *</Label>
              <Input
                id="state"
                value={data.company_info?.legal_address?.state || ''}
                onChange={(e) => handleAddressChange('state', e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="zip">ZIP Code *</Label>
              <Input
                id="zip"
                value={data.company_info?.legal_address?.zip || ''}
                onChange={(e) => handleAddressChange('zip', e.target.value)}
                required
              />
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Checkbox
              id="same_as_legal"
              checked={data.company_info?.same_as_legal_address || false}
              onCheckedChange={(checked) => handleInputChange('same_as_legal_address', checked)}
            />
            <Label htmlFor="same_as_legal">
              Billing and shipping addresses are the same as legal address
            </Label>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
