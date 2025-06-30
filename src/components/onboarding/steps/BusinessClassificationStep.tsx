
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TreatmentCenterOnboarding, BusinessType, OwnershipType } from '@/types/onboarding';

interface BusinessClassificationStepProps {
  data: Partial<TreatmentCenterOnboarding>;
  onDataChange: (data: Partial<TreatmentCenterOnboarding>) => void;
}

const businessTypes: { value: BusinessType; label: string }[] = [
  { value: 'acute_care', label: 'Acute Care' },
  { value: 'primary_care', label: 'Primary Care' },
  { value: 'specialty', label: 'Specialty' },
  { value: 'home_health', label: 'Home Health' },
  { value: 'extended_long_term', label: 'Extended Long Term Care' },
  { value: 'pharmacy', label: 'Pharmacy' },
  { value: 'closed_door', label: 'Closed Door Pharmacy' },
  { value: 'internet', label: 'Internet Pharmacy' },
  { value: 'mail_order', label: 'Mail Order Pharmacy' },
  { value: 'supplier', label: 'Supplier' },
  { value: 'government', label: 'Government' },
  { value: 'other', label: 'Other' },
];

const ownershipTypes: { value: OwnershipType; label: string }[] = [
  { value: 'proprietorship', label: 'Sole Proprietorship' },
  { value: 'partnership', label: 'Partnership' },
  { value: 'limited_partnership', label: 'Limited Partnership' },
  { value: 'llc', label: 'Limited Liability Company (LLC)' },
  { value: 's_corp', label: 'S Corporation' },
  { value: 'c_corp', label: 'C Corporation' },
  { value: 'professional_corp', label: 'Professional Corporation' },
  { value: 'non_profit_corp', label: 'Non-Profit Corporation' },
];

export const BusinessClassificationStep: React.FC<BusinessClassificationStepProps> = ({ data, onDataChange }) => {
  const handleInputChange = (field: string, value: any) => {
    onDataChange({
      business_info: {
        ...data.business_info,
        [field]: value,
      },
    });
  };

  const handleBusinessTypeChange = (businessType: BusinessType, checked: boolean) => {
    const currentTypes = data.business_info?.business_type || [];
    const updatedTypes = checked
      ? [...currentTypes, businessType]
      : currentTypes.filter(t => t !== businessType);
    
    handleInputChange('business_type', updatedTypes);
  };

  return (
    <div className="space-y-6">
      {/* Business Type */}
      <Card>
        <CardHeader>
          <CardTitle>Business Classification</CardTitle>
          <CardDescription>
            Select all business types that apply to your organization
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {businessTypes.map((type) => (
              <div key={type.value} className="flex items-center space-x-2">
                <Checkbox
                  id={type.value}
                  checked={data.business_info?.business_type?.includes(type.value) || false}
                  onCheckedChange={(checked) => handleBusinessTypeChange(type.value, checked as boolean)}
                />
                <Label htmlFor={type.value}>{type.label}</Label>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Business Details */}
      <Card>
        <CardHeader>
          <CardTitle>Business Details</CardTitle>
          <CardDescription>
            Provide additional information about your business
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="years_in_business">Years in Business *</Label>
              <Input
                id="years_in_business"
                type="number"
                min="0"
                value={data.business_info?.years_in_business || ''}
                onChange={(e) => handleInputChange('years_in_business', parseInt(e.target.value) || 0)}
                required
              />
            </div>
            <div>
              <Label htmlFor="ownership_type">Ownership Type *</Label>
              <Select
                value={data.business_info?.ownership_type || ''}
                onValueChange={(value) => handleInputChange('ownership_type', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select ownership type" />
                </SelectTrigger>
                <SelectContent>
                  {ownershipTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="state_org_charter_id">State Organization Charter ID</Label>
              <Input
                id="state_org_charter_id"
                value={data.business_info?.state_org_charter_id || ''}
                onChange={(e) => handleInputChange('state_org_charter_id', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="number_of_employees">Number of Employees</Label>
              <Input
                id="number_of_employees"
                type="number"
                min="0"
                value={data.business_info?.number_of_employees || ''}
                onChange={(e) => handleInputChange('number_of_employees', parseInt(e.target.value) || 0)}
              />
            </div>
            <div>
              <Label htmlFor="estimated_monthly_purchases">Estimated Monthly Purchases ($)</Label>
              <Input
                id="estimated_monthly_purchases"
                type="number"
                min="0"
                step="0.01"
                value={data.business_info?.estimated_monthly_purchases || ''}
                onChange={(e) => handleInputChange('estimated_monthly_purchases', parseFloat(e.target.value) || 0)}
              />
            </div>
            <div>
              <Label htmlFor="initial_order_amount">Initial Order Amount ($)</Label>
              <Input
                id="initial_order_amount"
                type="number"
                min="0"
                step="0.01"
                value={data.business_info?.initial_order_amount || ''}
                onChange={(e) => handleInputChange('initial_order_amount', parseFloat(e.target.value) || 0)}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
