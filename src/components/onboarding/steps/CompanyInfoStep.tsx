
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { TreatmentCenterOnboarding } from '@/types/onboarding';

interface CompanyInfoStepProps {
  data: Partial<TreatmentCenterOnboarding>;
  onUpdate: (data: Partial<TreatmentCenterOnboarding>) => void;
}

export const CompanyInfoStep: React.FC<CompanyInfoStepProps> = ({ data, onUpdate }) => {
  const updateCompanyInfo = (field: string, value: any) => {
    onUpdate({
      company_info: {
        ...data.company_info,
        [field]: value
      }
    });
  };

  const updateAddress = (addressType: 'legal_address' | 'billing_address' | 'shipping_address', field: string, value: string) => {
    onUpdate({
      company_info: {
        ...data.company_info,
        [addressType]: {
          ...data.company_info?.[addressType],
          [field]: value
        }
      }
    });
  };

  const handleSameAsLegalAddress = (checked: boolean) => {
    updateCompanyInfo('same_as_legal_address', checked);
    if (checked && data.company_info?.legal_address) {
      onUpdate({
        company_info: {
          ...data.company_info,
          same_as_legal_address: true,
          billing_address: { ...data.company_info.legal_address },
          shipping_address: { ...data.company_info.legal_address }
        }
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Distributor Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Distributor Selection</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <Label>Select distributors you want to work with:</Label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { key: 'amerisource_bergen', label: 'AmerisourceBergen' },
                { key: 'cardinal_health', label: 'Cardinal Health' },
                { key: 'mckesson', label: 'McKesson' }
              ].map(distributor => (
                <div key={distributor.key} className="flex items-center space-x-2">
                  <Checkbox
                    id={distributor.key}
                    checked={data.selected_distributors?.includes(distributor.key as any) || false}
                    onCheckedChange={(checked) => {
                      const current = data.selected_distributors || [];
                      const updated = checked 
                        ? [...current, distributor.key as any]
                        : current.filter(d => d !== distributor.key);
                      onUpdate({ selected_distributors: updated });
                    }}
                  />
                  <Label htmlFor={distributor.key}>{distributor.label}</Label>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Company Information */}
      <Card>
        <CardHeader>
          <CardTitle>Company Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="legal_name">Legal Company Name *</Label>
              <Input
                id="legal_name"
                value={data.company_info?.legal_name || ''}
                onChange={(e) => updateCompanyInfo('legal_name', e.target.value)}
                placeholder="Enter legal company name"
              />
            </div>
            <div>
              <Label htmlFor="dba_name">DBA/Business Trade Name</Label>
              <Input
                id="dba_name"
                value={data.company_info?.dba_name || ''}
                onChange={(e) => updateCompanyInfo('dba_name', e.target.value)}
                placeholder="Enter DBA name if different"
              />
            </div>
            <div>
              <Label htmlFor="website">Website Address</Label>
              <Input
                id="website"
                value={data.company_info?.website || ''}
                onChange={(e) => updateCompanyInfo('website', e.target.value)}
                placeholder="https://www.example.com"
              />
            </div>
            <div>
              <Label htmlFor="federal_tax_id">Federal Tax ID *</Label>
              <Input
                id="federal_tax_id"
                value={data.company_info?.federal_tax_id || ''}
                onChange={(e) => updateCompanyInfo('federal_tax_id', e.target.value)}
                placeholder="XX-XXXXXXX"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Legal Address */}
      <Card>
        <CardHeader>
          <CardTitle>Legal Address (Main Office)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="legal_street">Street Address *</Label>
            <Input
              id="legal_street"
              value={data.company_info?.legal_address?.street || ''}
              onChange={(e) => updateAddress('legal_address', 'street', e.target.value)}
              placeholder="Enter street address"
            />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="col-span-2">
              <Label htmlFor="legal_city">City *</Label>
              <Input
                id="legal_city"
                value={data.company_info?.legal_address?.city || ''}
                onChange={(e) => updateAddress('legal_address', 'city', e.target.value)}
                placeholder="City"
              />
            </div>
            <div>
              <Label htmlFor="legal_state">State *</Label>
              <Input
                id="legal_state"
                value={data.company_info?.legal_address?.state || ''}
                onChange={(e) => updateAddress('legal_address', 'state', e.target.value)}
                placeholder="State"
              />
            </div>
            <div>
              <Label htmlFor="legal_zip">ZIP Code *</Label>
              <Input
                id="legal_zip"
                value={data.company_info?.legal_address?.zip || ''}
                onChange={(e) => updateAddress('legal_address', 'zip', e.target.value)}
                placeholder="ZIP"
              />
            </div>
          </div>
          
          <div className="flex items-center space-x-2 pt-4">
            <Checkbox
              id="same_address"
              checked={data.company_info?.same_as_legal_address || false}
              onCheckedChange={handleSameAsLegalAddress}
            />
            <Label htmlFor="same_address">
              Use legal address for billing and shipping
            </Label>
          </div>
        </CardContent>
      </Card>

      {/* Billing Address */}
      {!data.company_info?.same_as_legal_address && (
        <Card>
          <CardHeader>
            <CardTitle>Billing/Statement Address</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="billing_street">Street Address</Label>
              <Input
                id="billing_street"
                value={data.company_info?.billing_address?.street || ''}
                onChange={(e) => updateAddress('billing_address', 'street', e.target.value)}
                placeholder="Enter street address"
              />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="col-span-2">
                <Label htmlFor="billing_city">City</Label>
                <Input
                  id="billing_city"
                  value={data.company_info?.billing_address?.city || ''}
                  onChange={(e) => updateAddress('billing_address', 'city', e.target.value)}
                  placeholder="City"
                />
              </div>
              <div>
                <Label htmlFor="billing_state">State</Label>
                <Input
                  id="billing_state"
                  value={data.company_info?.billing_address?.state || ''}
                  onChange={(e) => updateAddress('billing_address', 'state', e.target.value)}
                  placeholder="State"
                />
              </div>
              <div>
                <Label htmlFor="billing_zip">ZIP Code</Label>
                <Input
                  id="billing_zip"
                  value={data.company_info?.billing_address?.zip || ''}
                  onChange={(e) => updateAddress('billing_address', 'zip', e.target.value)}
                  placeholder="ZIP"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Shipping Address */}
      {!data.company_info?.same_as_legal_address && (
        <Card>
          <CardHeader>
            <CardTitle>Ship to Address</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="shipping_street">Street Address</Label>
              <Input
                id="shipping_street"
                value={data.company_info?.shipping_address?.street || ''}
                onChange={(e) => updateAddress('shipping_address', 'street', e.target.value)}
                placeholder="Enter street address"
              />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="col-span-2">
                <Label htmlFor="shipping_city">City</Label>
                <Input
                  id="shipping_city"
                  value={data.company_info?.shipping_address?.city || ''}
                  onChange={(e) => updateAddress('shipping_address', 'city', e.target.value)}
                  placeholder="City"
                />
              </div>
              <div>
                <Label htmlFor="shipping_state">State</Label>
                <Input
                  id="shipping_state"
                  value={data.company_info?.shipping_address?.state || ''}
                  onChange={(e) => updateAddress('shipping_address', 'state', e.target.value)}
                  placeholder="State"
                />
              </div>
              <div>
                <Label htmlFor="shipping_zip">ZIP Code</Label>
                <Input
                  id="shipping_zip"
                  value={data.company_info?.shipping_address?.zip || ''}
                  onChange={(e) => updateAddress('shipping_address', 'zip', e.target.value)}
                  placeholder="ZIP"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
