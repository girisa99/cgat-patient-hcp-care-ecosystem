
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { TreatmentCenterOnboarding, EnhancedPaymentTerms } from '@/types/onboarding';
import { CreditCard, Percent, Calendar } from 'lucide-react';

interface EnhancedPaymentTermsStepProps {
  data: Partial<TreatmentCenterOnboarding>;
  onDataChange: (data: Partial<TreatmentCenterOnboarding>) => void;
}

export const EnhancedPaymentTermsStep: React.FC<EnhancedPaymentTermsStepProps> = ({
  data,
  onDataChange,
}) => {
  const paymentTerms = data.enhanced_payment_terms || {
    preferred_terms: 'net_30',
    early_payment_discount: false,
    consolidation_preferences: [],
    billing_frequency: 'monthly',
    credit_limit_requested: 0,
  };

  const updatePaymentTerms = (updates: Partial<EnhancedPaymentTerms>) => {
    onDataChange({
      enhanced_payment_terms: { ...paymentTerms, ...updates },
    });
  };

  const toggleConsolidationPreference = (preference: string) => {
    const current = paymentTerms.consolidation_preferences || [];
    const updated = current.includes(preference)
      ? current.filter(p => p !== preference)
      : [...current, preference];
    
    updatePaymentTerms({ consolidation_preferences: updated });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <CreditCard className="h-5 w-5" />
            <span>Enhanced Payment Terms</span>
          </CardTitle>
          <CardDescription>
            Configure advanced payment terms and preferences
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="preferred-terms">Preferred Payment Terms</Label>
              <Select
                value={paymentTerms.preferred_terms}
                onValueChange={(value) => updatePaymentTerms({ preferred_terms: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select terms" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="net_15">Net 15</SelectItem>
                  <SelectItem value="net_30">Net 30</SelectItem>
                  <SelectItem value="net_45">Net 45</SelectItem>
                  <SelectItem value="net_60">Net 60</SelectItem>
                  <SelectItem value="2_10_net_30">2/10 Net 30</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="billing-frequency">Billing Frequency</Label>
              <Select
                value={paymentTerms.billing_frequency}
                onValueChange={(value) => updatePaymentTerms({ billing_frequency: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select frequency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="bi-weekly">Bi-weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="quarterly">Quarterly</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="credit-limit">Requested Credit Limit ($)</Label>
            <Input
              id="credit-limit"
              type="number"
              value={paymentTerms.credit_limit_requested}
              onChange={(e) => updatePaymentTerms({ credit_limit_requested: parseInt(e.target.value) || 0 })}
              placeholder="50000"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Percent className="h-5 w-5" />
            <span>Early Payment Discounts</span>
          </CardTitle>
          <CardDescription>
            Configure early payment discount preferences
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="early-payment-discount"
              checked={paymentTerms.early_payment_discount}
              onCheckedChange={(checked) => updatePaymentTerms({ early_payment_discount: checked as boolean })}
            />
            <Label htmlFor="early-payment-discount">
              Interest in early payment discounts
            </Label>
          </div>

          {paymentTerms.early_payment_discount && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div>
                <Label htmlFor="discount-percentage">Preferred Discount Percentage (%)</Label>
                <Input
                  id="discount-percentage"
                  type="number"
                  step="0.1"
                  value={paymentTerms.discount_percentage || ''}
                  onChange={(e) => updatePaymentTerms({ discount_percentage: parseFloat(e.target.value) || undefined })}
                  placeholder="2.0"
                />
              </div>
              <div>
                <Label htmlFor="discount-days">Discount Days</Label>
                <Input
                  id="discount-days"
                  type="number"
                  value={paymentTerms.discount_days || ''}
                  onChange={(e) => updatePaymentTerms({ discount_days: parseInt(e.target.value) || undefined })}
                  placeholder="10"
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Calendar className="h-5 w-5" />
            <span>Consolidation Preferences</span>
          </CardTitle>
          <CardDescription>
            Select your invoice consolidation preferences
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[
              'By Location',
              'By Department',
              'By Product Category',
              'Weekly Consolidation',
              'Monthly Consolidation',
              'No Consolidation'
            ].map((preference) => (
              <div key={preference} className="flex items-center space-x-2">
                <Checkbox
                  id={preference}
                  checked={paymentTerms.consolidation_preferences?.includes(preference)}
                  onCheckedChange={() => toggleConsolidationPreference(preference)}
                />
                <Label htmlFor={preference}>{preference}</Label>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
