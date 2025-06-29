
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { TreatmentCenterOnboarding, BusinessType, OwnershipType } from '@/types/onboarding';

interface BusinessClassificationStepProps {
  data: Partial<TreatmentCenterOnboarding>;
  onUpdate: (data: Partial<TreatmentCenterOnboarding>) => void;
}

const BUSINESS_TYPES: { key: BusinessType; label: string }[] = [
  { key: 'acute_care', label: 'Acute Care' },
  { key: 'primary_care', label: 'Primary Care' },
  { key: 'specialty', label: 'Specialty' },
  { key: 'home_health', label: 'Home Health' },
  { key: 'extended_long_term', label: 'Extended/Long Term' },
  { key: 'pharmacy', label: 'Pharmacy' },
  { key: 'closed_door', label: 'Closed Door' },
  { key: 'internet', label: 'Internet' },
  { key: 'mail_order', label: 'Mail Order' },
  { key: 'supplier', label: 'Supplier' },
  { key: 'government', label: 'Government' },
  { key: 'other', label: 'Other' }
];

const OWNERSHIP_TYPES: { key: OwnershipType; label: string }[] = [
  { key: 'proprietorship', label: 'Proprietorship' },
  { key: 'partnership', label: 'Partnership' },
  { key: 'limited_partnership', label: 'Limited Partnership' },
  { key: 'llc', label: 'LLC' },
  { key: 's_corp', label: 'S Corporation' },
  { key: 'c_corp', label: 'C Corporation' },
  { key: 'professional_corp', label: 'Professional Corporation' },
  { key: 'non_profit_corp', label: 'Non-Profit Corporation' }
];

export const BusinessClassificationStep: React.FC<BusinessClassificationStepProps> = ({ data, onUpdate }) => {
  const updateBusinessInfo = (field: string, value: any) => {
    onUpdate({
      business_info: {
        ...data.business_info,
        [field]: value
      }
    });
  };

  const handleBusinessTypeChange = (businessType: BusinessType, checked: boolean) => {
    const currentTypes = data.business_info?.business_type || [];
    const updatedTypes = checked
      ? [...currentTypes, businessType]
      : currentTypes.filter(type => type !== businessType);
    
    updateBusinessInfo('business_type', updatedTypes);
  };

  return (
    <div className="space-y-6">
      {/* Business Type Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Business Type Classification</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <Label>Select all business types that apply (check all that apply):</Label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {BUSINESS_TYPES.map(type => (
                <div key={type.key} className="flex items-center space-x-2">
                  <Checkbox
                    id={type.key}
                    checked={data.business_info?.business_type?.includes(type.key) || false}
                    onCheckedChange={(checked) => handleBusinessTypeChange(type.key, checked as boolean)}
                  />
                  <Label htmlFor={type.key} className="text-sm">{type.label}</Label>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Business Details */}
      <Card>
        <CardHeader>
          <CardTitle>Business Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="years_in_business">Years in Business *</Label>
              <Input
                id="years_in_business"
                type="number"
                value={data.business_info?.years_in_business || ''}
                onChange={(e) => updateBusinessInfo('years_in_business', parseInt(e.target.value) || 0)}
                placeholder="Enter years in business"
              />
            </div>
            <div>
              <Label htmlFor="ownership_type">Ownership Type *</Label>
              <Select 
                value={data.business_info?.ownership_type || ''} 
                onValueChange={(value) => updateBusinessInfo('ownership_type', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select ownership type" />
                </SelectTrigger>
                <SelectContent>
                  {OWNERSHIP_TYPES.map(type => (
                    <SelectItem key={type.key} value={type.key}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="state_org_charter_id">State Org/Charter ID/License#</Label>
              <Input
                id="state_org_charter_id"
                value={data.business_info?.state_org_charter_id || ''}
                onChange={(e) => updateBusinessInfo('state_org_charter_id', e.target.value)}
                placeholder="Enter state organization ID"
              />
            </div>
            <div>
              <Label htmlFor="number_of_employees">Number of Employees</Label>
              <Input
                id="number_of_employees"
                type="number"
                value={data.business_info?.number_of_employees || ''}
                onChange={(e) => updateBusinessInfo('number_of_employees', parseInt(e.target.value) || 0)}
                placeholder="Enter number of employees"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Financial Information */}
      <Card>
        <CardHeader>
          <CardTitle>Financial Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="estimated_monthly_purchases">Estimated Monthly Purchases ($)</Label>
              <Input
                id="estimated_monthly_purchases"
                type="number"
                value={data.business_info?.estimated_monthly_purchases || ''}
                onChange={(e) => updateBusinessInfo('estimated_monthly_purchases', parseFloat(e.target.value) || 0)}
                placeholder="Enter estimated monthly purchases"
              />
            </div>
            <div>
              <Label htmlFor="initial_order_amount">Initial Order Amount ($)</Label>
              <Input
                id="initial_order_amount"
                type="number"
                value={data.business_info?.initial_order_amount || ''}
                onChange={(e) => updateBusinessInfo('initial_order_amount', parseFloat(e.target.value) || 0)}
                placeholder="Enter initial order amount"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bankruptcy History */}
      <Card>
        <CardHeader>
          <CardTitle>Financial History</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="bankruptcy_history"
              checked={data.ownership?.bankruptcy_history || false}
              onCheckedChange={(checked) => onUpdate({
                ownership: {
                  ...data.ownership,
                  bankruptcy_history: checked as boolean
                }
              })}
            />
            <Label htmlFor="bankruptcy_history">
              Has applicant, applicant's parent or affiliates ever filed for bankruptcy?
            </Label>
          </div>
          
          {data.ownership?.bankruptcy_history && (
            <div>
              <Label htmlFor="bankruptcy_explanation">Please provide explanation:</Label>
              <Textarea
                id="bankruptcy_explanation"
                value={data.ownership?.bankruptcy_explanation || ''}
                onChange={(e) => onUpdate({
                  ownership: {
                    ...data.ownership,
                    bankruptcy_explanation: e.target.value
                  }
                })}
                placeholder="Provide details about bankruptcy filing"
                rows={3}
              />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
