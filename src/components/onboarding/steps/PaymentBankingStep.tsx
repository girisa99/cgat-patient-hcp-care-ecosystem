
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { TreatmentCenterOnboarding } from '@/types/onboarding';

interface PaymentBankingStepProps {
  data: Partial<TreatmentCenterOnboarding>;
  onUpdate: (data: Partial<TreatmentCenterOnboarding>) => void;
}

export const PaymentBankingStep: React.FC<PaymentBankingStepProps> = ({ data, onUpdate }) => {
  const updatePaymentInfo = (field: string, value: any) => {
    onUpdate({
      payment_info: {
        ...data.payment_info,
        [field]: value
      }
    });
  };

  const updateBankAddress = (field: string, value: string) => {
    onUpdate({
      payment_info: {
        ...data.payment_info,
        bank_address: {
          ...data.payment_info?.bank_address,
          [field]: value
        }
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* ACH Payment Preference */}
      <Card>
        <CardHeader>
          <CardTitle>Payment Preferences</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>ACH Payment Preference *</Label>
            <RadioGroup
              value={data.payment_info?.ach_preference || ''}
              onValueChange={(value) => updatePaymentInfo('ach_preference', value)}
              className="mt-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="direct_debit" id="direct_debit" />
                <Label htmlFor="direct_debit">Direct Debit from Bank Account</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="online_payment" id="online_payment" />
                <Label htmlFor="online_payment">Online Payment Portal</Label>
              </div>
            </RadioGroup>
          </div>

          <div>
            <Label>Statement Delivery Preference *</Label>
            <RadioGroup
              value={data.payment_info?.statement_delivery_preference || ''}
              onValueChange={(value) => updatePaymentInfo('statement_delivery_preference', value)}
              className="mt-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="email" id="email" />
                <Label htmlFor="email">Email</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="fax" id="fax" />
                <Label htmlFor="fax">Fax</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="mail" id="mail" />
                <Label htmlFor="mail">Mail</Label>
              </div>
            </RadioGroup>
          </div>

          <div>
            <Label htmlFor="payment_terms">Requested Payment Terms</Label>
            <Input
              id="payment_terms"
              value={data.payment_info?.payment_terms_requested || ''}
              onChange={(e) => updatePaymentInfo('payment_terms_requested', e.target.value)}
              placeholder="Net 30, Net 15, etc."
            />
          </div>
        </CardContent>
      </Card>

      {/* Banking Information */}
      <Card>
        <CardHeader>
          <CardTitle>Banking Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="bank_name">Bank Name *</Label>
              <Input
                id="bank_name"
                value={data.payment_info?.bank_name || ''}
                onChange={(e) => updatePaymentInfo('bank_name', e.target.value)}
                placeholder="Enter bank name"
              />
            </div>
            <div>
              <Label htmlFor="bank_phone">Bank Phone</Label>
              <Input
                id="bank_phone"
                value={data.payment_info?.bank_phone || ''}
                onChange={(e) => updatePaymentInfo('bank_phone', e.target.value)}
                placeholder="(555) 123-4567"
              />
            </div>
            <div>
              <Label htmlFor="account_number">Account Number *</Label>
              <Input
                id="account_number"
                value={data.payment_info?.bank_account_number || ''}
                onChange={(e) => updatePaymentInfo('bank_account_number', e.target.value)}
                placeholder="Enter account number"
              />
            </div>
            <div>
              <Label htmlFor="routing_number">Routing Number *</Label>
              <Input
                id="routing_number"
                value={data.payment_info?.bank_routing_number || ''}
                onChange={(e) => updatePaymentInfo('bank_routing_number', e.target.value)}
                placeholder="Enter routing number"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bank Address */}
      <Card>
        <CardHeader>
          <CardTitle>Bank Address</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="bank_street">Street Address *</Label>
            <Input
              id="bank_street"
              value={data.payment_info?.bank_address?.street || ''}
              onChange={(e) => updateBankAddress('street', e.target.value)}
              placeholder="Enter bank street address"
            />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="col-span-2">
              <Label htmlFor="bank_city">City *</Label>
              <Input
                id="bank_city"
                value={data.payment_info?.bank_address?.city || ''}
                onChange={(e) => updateBankAddress('city', e.target.value)}
                placeholder="City"
              />
            </div>
            <div>
              <Label htmlFor="bank_state">State *</Label>
              <Input
                id="bank_state"
                value={data.payment_info?.bank_address?.state || ''}
                onChange={(e) => updateBankAddress('state', e.target.value)}
                placeholder="State"
              />
            </div>
            <div>
              <Label htmlFor="bank_zip">ZIP Code *</Label>
              <Input
                id="bank_zip"
                value={data.payment_info?.bank_address?.zip || ''}
                onChange={(e) => updateBankAddress('zip', e.target.value)}
                placeholder="ZIP"
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
