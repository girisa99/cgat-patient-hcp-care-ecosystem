
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TreatmentCenterOnboarding } from '@/types/onboarding';
import { Separator } from '@/components/ui/separator';
import { CreditCard, Building, Mail, FileText, Phone } from 'lucide-react';

interface PaymentBankingStepProps {
  data: Partial<TreatmentCenterOnboarding>;
  onDataChange: (data: Partial<TreatmentCenterOnboarding>) => void;
}

export const PaymentBankingStep: React.FC<PaymentBankingStepProps> = ({ data, onDataChange }) => {
  const paymentInfo = data.payment_info || {
    ach_preference: 'direct_debit',
    bank_name: '',
    bank_account_number: '',
    bank_routing_number: '',
    bank_address: { street: '', city: '', state: '', zip: '' },
    statement_delivery_preference: 'email'
  };

  const updatePaymentInfo = (field: string, value: string) => {
    const updatedPaymentInfo = {
      ...paymentInfo,
      [field]: value
    };

    onDataChange({
      ...data,
      payment_info: updatedPaymentInfo
    });
  };

  const updateBankAddress = (field: string, value: string) => {
    const updatedPaymentInfo = {
      ...paymentInfo,
      bank_address: {
        ...paymentInfo.bank_address,
        [field]: value
      }
    };

    onDataChange({
      ...data,
      payment_info: updatedPaymentInfo
    });
  };

  return (
    <div className="space-y-6">
      {/* Payment Preferences */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <CreditCard className="h-5 w-5" />
            <span>Payment Preferences</span>
          </CardTitle>
          <CardDescription>
            Configure how you would like to handle payments and invoicing
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>ACH Payment Preference *</Label>
            <Select
              value={paymentInfo.ach_preference}
              onValueChange={(value) => updatePaymentInfo('ach_preference', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select payment preference" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="direct_debit">Direct Debit (ACH Pull)</SelectItem>
                <SelectItem value="online_payment">Online Payment Portal</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Statement Delivery Preference *</Label>
            <Select
              value={paymentInfo.statement_delivery_preference}
              onValueChange={(value) => updatePaymentInfo('statement_delivery_preference', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select delivery method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="email">
                  <div className="flex items-center space-x-2">
                    <Mail className="h-4 w-4" />
                    <span>Email</span>
                  </div>
                </SelectItem>
                <SelectItem value="fax">
                  <div className="flex items-center space-x-2">
                    <FileText className="h-4 w-4" />
                    <span>Fax</span>
                  </div>
                </SelectItem>
                <SelectItem value="mail">
                  <div className="flex items-center space-x-2">
                    <Building className="h-4 w-4" />
                    <span>Mail</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Requested Payment Terms</Label>
            <Select
              value={paymentInfo.payment_terms_requested || ''}
              onValueChange={(value) => updatePaymentInfo('payment_terms_requested', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select payment terms" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="net_15">Net 15 Days</SelectItem>
                <SelectItem value="net_30">Net 30 Days</SelectItem>
                <SelectItem value="net_45">Net 45 Days</SelectItem>
                <SelectItem value="net_60">Net 60 Days</SelectItem>
                <SelectItem value="cod">Cash on Delivery (COD)</SelectItem>
                <SelectItem value="prepaid">Prepaid</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Separator />

      {/* Banking Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Building className="h-5 w-5" />
            <span>Banking Information</span>
          </CardTitle>
          <CardDescription>
            Primary bank account information for ACH transactions
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="bank-name">Bank Name *</Label>
            <Input
              id="bank-name"
              value={paymentInfo.bank_name}
              onChange={(e) => updatePaymentInfo('bank_name', e.target.value)}
              placeholder="Enter your bank name"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="routing-number">Routing Number *</Label>
              <Input
                id="routing-number"
                value={paymentInfo.bank_routing_number}
                onChange={(e) => updatePaymentInfo('bank_routing_number', e.target.value)}
                placeholder="9-digit routing number"
                maxLength={9}
                pattern="[0-9]{9}"
                required
              />
            </div>
            <div>
              <Label htmlFor="account-number">Account Number *</Label>
              <Input
                id="account-number"
                value={paymentInfo.bank_account_number}
                onChange={(e) => updatePaymentInfo('bank_account_number', e.target.value)}
                placeholder="Enter account number"
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="bank-phone">Bank Phone Number</Label>
            <Input
              id="bank-phone"
              type="tel"
              value={paymentInfo.bank_phone || ''}
              onChange={(e) => updatePaymentInfo('bank_phone', e.target.value)}
              placeholder="(555) 123-4567"
            />
          </div>
        </CardContent>
      </Card>

      <Separator />

      {/* Bank Address */}
      <Card>
        <CardHeader>
          <CardTitle>Bank Address</CardTitle>
          <CardDescription>
            Physical address of your banking institution
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="bank-street">Street Address *</Label>
            <Input
              id="bank-street"
              value={paymentInfo.bank_address.street}
              onChange={(e) => updateBankAddress('street', e.target.value)}
              placeholder="Enter street address"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="bank-city">City *</Label>
              <Input
                id="bank-city"
                value={paymentInfo.bank_address.city}
                onChange={(e) => updateBankAddress('city', e.target.value)}
                placeholder="Enter city"
                required
              />
            </div>
            <div>
              <Label htmlFor="bank-state">State *</Label>
              <Input
                id="bank-state"
                value={paymentInfo.bank_address.state}
                onChange={(e) => updateBankAddress('state', e.target.value)}
                placeholder="State"
                maxLength={2}
                required
              />
            </div>
            <div>
              <Label htmlFor="bank-zip">ZIP Code *</Label>
              <Input
                id="bank-zip"
                value={paymentInfo.bank_address.zip}
                onChange={(e) => updateBankAddress('zip', e.target.value)}
                placeholder="ZIP Code"
                required
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Important Notice */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <FileText className="h-5 w-5 text-blue-600 mt-0.5" />
          <div>
            <h4 className="font-medium text-blue-900">Required Documentation</h4>
            <p className="text-sm text-blue-700 mt-1">
              You will need to provide a voided check or bank letter in the Documents section to verify your banking information.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
