
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { CreditCard, Clock, DollarSign, Settings, AlertCircle } from 'lucide-react';
import { TreatmentCenterOnboarding } from '@/types/onboarding';

interface EnhancedPaymentTermsStepProps {
  data: Partial<TreatmentCenterOnboarding>;
  onDataChange: (data: Partial<TreatmentCenterOnboarding>) => void;
}

const PAYMENT_TERMS = [
  { value: 'net_30', label: 'Net 30 Days', description: 'Payment due within 30 days' },
  { value: 'net_60', label: 'Net 60 Days', description: 'Payment due within 60 days' },
  { value: 'net_90', label: 'Net 90 Days', description: 'Payment due within 90 days' },
  { value: '2_10_net_30', label: '2/10 Net 30', description: '2% discount if paid within 10 days, otherwise net 30' },
  { value: 'cod', label: 'Cash on Delivery (COD)', description: 'Payment required upon delivery' },
  { value: 'prepay', label: 'Prepayment', description: 'Payment required before shipment' }
];

const PAYMENT_METHODS = [
  { value: 'ach', label: 'ACH Transfer', description: 'Automated Clearing House electronic transfer' },
  { value: 'wire', label: 'Wire Transfer', description: 'Bank-to-bank wire transfer' },
  { value: 'check', label: 'Check', description: 'Traditional paper check' },
  { value: 'credit_card', label: 'Credit Card', description: 'Corporate credit card payment' }
];

const BILLING_FREQUENCIES = [
  { value: 'daily', label: 'Daily', description: 'Individual invoices for each order' },
  { value: 'weekly', label: 'Weekly', description: 'Consolidated weekly invoicing' },
  { value: 'monthly', label: 'Monthly', description: 'Monthly consolidated billing' }
];

export const EnhancedPaymentTermsStep: React.FC<EnhancedPaymentTermsStepProps> = ({
  data,
  onDataChange
}) => {
  const paymentTerms = (data as any)?.enhanced_payment_terms || {
    preferred_terms: 'net_30',
    credit_limit_requested: '',
    payment_method: 'ach',
    early_payment_discount_interest: false,
    billing_frequency: 'weekly',
    consolidation_preferences: {
      enable_consolidation: false,
      consolidation_level: 'facility',
      separate_controlled_substances: false,
      separate_specialty_orders: false
    }
  };

  const updatePaymentTerms = (field: string, value: any) => {
    if (field.startsWith('consolidation_preferences.')) {
      const prefField = field.split('.')[1];
      const updatedTerms = {
        ...paymentTerms,
        consolidation_preferences: {
          ...paymentTerms.consolidation_preferences,
          [prefField]: value
        }
      };
      onDataChange({
        ...data,
        enhanced_payment_terms: updatedTerms
      });
    } else {
      const updatedTerms = {
        ...paymentTerms,
        [field]: value
      };
      onDataChange({
        ...data,
        enhanced_payment_terms: updatedTerms
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Basic Payment Terms */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <CreditCard className="h-5 w-5" />
            <span>Payment Terms & Preferences</span>
          </CardTitle>
          <CardDescription>
            Configure your preferred payment terms, credit requirements, and billing preferences
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label className="flex items-center space-x-2 mb-3">
                <Clock className="h-4 w-4" />
                <span>Preferred Payment Terms *</span>
              </Label>
              <Select
                value={paymentTerms.preferred_terms}
                onValueChange={(value) => updatePaymentTerms('preferred_terms', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select payment terms" />
                </SelectTrigger>
                <SelectContent>
                  {PAYMENT_TERMS.map((term) => (
                    <SelectItem key={term.value} value={term.value}>
                      <div>
                        <div className="font-medium">{term.label}</div>
                        <div className="text-xs text-muted-foreground">{term.description}</div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="flex items-center space-x-2 mb-3">
                <DollarSign className="h-4 w-4" />
                <span>Credit Limit Requested</span>
              </Label>
              <Input
                type="number"
                value={paymentTerms.credit_limit_requested}
                onChange={(e) => updatePaymentTerms('credit_limit_requested', e.target.value)}
                placeholder="Enter requested credit limit"
                min="0"
                step="1000"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Leave blank if no specific credit limit is required
              </p>
            </div>
          </div>

          <div>
            <Label className="flex items-center space-x-2 mb-3">
              <span>Primary Payment Method *</span>
            </Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {PAYMENT_METHODS.map((method) => (
                <div
                  key={method.value}
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                    paymentTerms.payment_method === method.value
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => updatePaymentTerms('payment_method', method.value)}
                >
                  <div className="flex items-center space-x-3">
                    <input
                      type="radio"
                      name="payment_method"
                      value={method.value}
                      checked={paymentTerms.payment_method === method.value}
                      onChange={() => updatePaymentTerms('payment_method', method.value)}
                      className="text-blue-600"
                    />
                    <div>
                      <div className="font-medium">{method.label}</div>
                      <div className="text-sm text-muted-foreground">{method.description}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center space-x-3 p-4 bg-green-50 border border-green-200 rounded-lg">
            <Checkbox
              id="early_payment_discount"
              checked={paymentTerms.early_payment_discount_interest}
              onCheckedChange={(checked) => updatePaymentTerms('early_payment_discount_interest', checked)}
            />
            <div>
              <Label htmlFor="early_payment_discount" className="font-medium cursor-pointer">
                Interested in early payment discounts
              </Label>
              <p className="text-sm text-muted-foreground mt-1">
                Check this to be considered for early payment discount programs
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Billing Preferences */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Settings className="h-5 w-5" />
            <span>Billing & Consolidation Preferences</span>
          </CardTitle>
          <CardDescription>
            Configure how you want to receive and consolidate your invoices
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <Label className="mb-3 block">Billing Frequency</Label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {BILLING_FREQUENCIES.map((freq) => (
                <div
                  key={freq.value}
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                    paymentTerms.billing_frequency === freq.value
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => updatePaymentTerms('billing_frequency', freq.value)}
                >
                  <div className="flex items-center space-x-3">
                    <input
                      type="radio"
                      name="billing_frequency"
                      value={freq.value}
                      checked={paymentTerms.billing_frequency === freq.value}
                      onChange={() => updatePaymentTerms('billing_frequency', freq.value)}
                      className="text-blue-600"
                    />
                    <div>
                      <div className="font-medium">{freq.label}</div>
                      <div className="text-sm text-muted-foreground">{freq.description}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          <div>
            <div className="flex items-center space-x-3 mb-4">
              <Checkbox
                id="enable_consolidation"
                checked={paymentTerms.consolidation_preferences?.enable_consolidation || false}
                onCheckedChange={(checked) => updatePaymentTerms('consolidation_preferences.enable_consolidation', checked)}
              />
              <div>
                <Label htmlFor="enable_consolidation" className="font-medium cursor-pointer">
                  Enable Invoice Consolidation
                </Label>
                <p className="text-sm text-muted-foreground">
                  Combine multiple orders into single invoices for easier processing
                </p>
              </div>
            </div>

            {paymentTerms.consolidation_preferences?.enable_consolidation && (
              <div className="ml-6 space-y-4 p-4 bg-gray-50 rounded-lg">
                <div>
                  <Label>Consolidation Level</Label>
                  <Select
                    value={paymentTerms.consolidation_preferences?.consolidation_level || 'facility'}
                    onValueChange={(value) => updatePaymentTerms('consolidation_preferences.consolidation_level', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select consolidation level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="facility">By Facility</SelectItem>
                      <SelectItem value="department">By Department</SelectItem>
                      <SelectItem value="organization">Entire Organization</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="separate_controlled"
                      checked={paymentTerms.consolidation_preferences?.separate_controlled_substances || false}
                      onCheckedChange={(checked) => updatePaymentTerms('consolidation_preferences.separate_controlled_substances', checked)}
                    />
                    <Label htmlFor="separate_controlled" className="text-sm">
                      Separate controlled substances on different invoices
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="separate_specialty"
                      checked={paymentTerms.consolidation_preferences?.separate_specialty_orders || false}
                      onCheckedChange={(checked) => updatePaymentTerms('consolidation_preferences.separate_specialty_orders', checked)}
                    />
                    <Label htmlFor="separate_specialty" className="text-sm">
                      Separate specialty pharmacy orders
                    </Label>
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Payment Terms Summary */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-blue-900">
            <AlertCircle className="h-5 w-5" />
            <span>Payment Terms Summary</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium text-blue-900 mb-2">Selected Terms</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>Payment Terms:</span>
                  <Badge variant="secondary">
                    {PAYMENT_TERMS.find(t => t.value === paymentTerms.preferred_terms)?.label}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span>Payment Method:</span>
                  <Badge variant="secondary">
                    {PAYMENT_METHODS.find(m => m.value === paymentTerms.payment_method)?.label}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span>Billing Frequency:</span>
                  <Badge variant="secondary">
                    {BILLING_FREQUENCIES.find(f => f.value === paymentTerms.billing_frequency)?.label}
                  </Badge>
                </div>
              </div>
            </div>
            <div>
              <h4 className="font-medium text-blue-900 mb-2">Additional Preferences</h4>
              <div className="space-y-1 text-sm">
                <div className="flex items-center space-x-2">
                  <span className={paymentTerms.early_payment_discount_interest ? 'text-green-600' : 'text-gray-500'}>
                    {paymentTerms.early_payment_discount_interest ? '✓' : '○'} 
                  </span>
                  <span>Early payment discounts</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={paymentTerms.consolidation_preferences?.enable_consolidation ? 'text-green-600' : 'text-gray-500'}>
                    {paymentTerms.consolidation_preferences?.enable_consolidation ? '✓' : '○'} 
                  </span>
                  <span>Invoice consolidation</span>
                </div>
                {paymentTerms.credit_limit_requested && (
                  <div className="flex justify-between">
                    <span>Credit limit:</span>
                    <span className="font-medium">${parseInt(paymentTerms.credit_limit_requested).toLocaleString()}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
