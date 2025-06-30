
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TreatmentCenterOnboarding } from '@/types/onboarding';
import { Separator } from '@/components/ui/separator';
import { CreditCard, Building, Mail, FileText, Phone, DollarSign, Calendar } from 'lucide-react';

interface PaymentBankingStepProps {
  data: Partial<TreatmentCenterOnboarding>;
  onDataChange: (data: Partial<TreatmentCenterOnboarding>) => void;
}

const US_STATES = [
  { value: 'AL', label: 'Alabama' }, { value: 'AK', label: 'Alaska' }, { value: 'AZ', label: 'Arizona' },
  { value: 'AR', label: 'Arkansas' }, { value: 'CA', label: 'California' }, { value: 'CO', label: 'Colorado' },
  { value: 'CT', label: 'Connecticut' }, { value: 'DE', label: 'Delaware' }, { value: 'FL', label: 'Florida' },
  { value: 'GA', label: 'Georgia' }, { value: 'HI', label: 'Hawaii' }, { value: 'ID', label: 'Idaho' },
  { value: 'IL', label: 'Illinois' }, { value: 'IN', label: 'Indiana' }, { value: 'IA', label: 'Iowa' },
  { value: 'KS', label: 'Kansas' }, { value: 'KY', label: 'Kentucky' }, { value: 'LA', label: 'Louisiana' },
  { value: 'ME', label: 'Maine' }, { value: 'MD', label: 'Maryland' }, { value: 'MA', label: 'Massachusetts' },
  { value: 'MI', label: 'Michigan' }, { value: 'MN', label: 'Minnesota' }, { value: 'MS', label: 'Mississippi' },
  { value: 'MO', label: 'Missouri' }, { value: 'MT', label: 'Montana' }, { value: 'NE', label: 'Nebraska' },
  { value: 'NV', label: 'Nevada' }, { value: 'NH', label: 'New Hampshire' }, { value: 'NJ', label: 'New Jersey' },
  { value: 'NM', label: 'New Mexico' }, { value: 'NY', label: 'New York' }, { value: 'NC', label: 'North Carolina' },
  { value: 'ND', label: 'North Dakota' }, { value: 'OH', label: 'Ohio' }, { value: 'OK', label: 'Oklahoma' },
  { value: 'OR', label: 'Oregon' }, { value: 'PA', label: 'Pennsylvania' }, { value: 'RI', label: 'Rhode Island' },
  { value: 'SC', label: 'South Carolina' }, { value: 'SD', label: 'South Dakota' }, { value: 'TN', label: 'Tennessee' },
  { value: 'TX', label: 'Texas' }, { value: 'UT', label: 'Utah' }, { value: 'VT', label: 'Vermont' },
  { value: 'VA', label: 'Virginia' }, { value: 'WA', label: 'Washington' }, { value: 'WV', label: 'West Virginia' },
  { value: 'WI', label: 'Wisconsin' }, { value: 'WY', label: 'Wyoming' }
];

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
        <CardContent className="space-y-6">
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
                <SelectItem value="direct_debit">
                  <div className="flex items-center space-x-2">
                    <CreditCard className="h-4 w-4" />
                    <div>
                      <div className="font-medium">Direct Debit (ACH Pull)</div>
                      <div className="text-sm text-muted-foreground">Automatic bank withdrawal</div>
                    </div>
                  </div>
                </SelectItem>
                <SelectItem value="online_payment">
                  <div className="flex items-center space-x-2">
                    <Building className="h-4 w-4" />
                    <div>
                      <div className="font-medium">Online Payment Portal</div>
                      <div className="text-sm text-muted-foreground">Manual payments via web portal</div>
                    </div>
                  </div>
                </SelectItem>
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
                    <div>
                      <div className="font-medium">Email</div>
                      <div className="text-sm text-muted-foreground">Electronic delivery (recommended)</div>
                    </div>
                  </div>
                </SelectItem>
                <SelectItem value="fax">
                  <div className="flex items-center space-x-2">
                    <FileText className="h-4 w-4" />
                    <div>
                      <div className="font-medium">Fax</div>
                      <div className="text-sm text-muted-foreground">Fax transmission</div>
                    </div>
                  </div>
                </SelectItem>
                <SelectItem value="mail">
                  <div className="flex items-center space-x-2">
                    <Building className="h-4 w-4" />
                    <div>
                      <div className="font-medium">Mail</div>
                      <div className="text-sm text-muted-foreground">Physical mail delivery</div>
                    </div>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="flex items-center space-x-2">
              <Calendar className="h-4 w-4" />
              <span>Requested Payment Terms</span>
            </Label>
            <Select
              value={paymentInfo.payment_terms_requested || ''}
              onValueChange={(value) => updatePaymentInfo('payment_terms_requested', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select payment terms" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="net_15">
                  <div>
                    <div className="font-medium">Net 15 Days</div>
                    <div className="text-sm text-muted-foreground">Payment due within 15 days</div>
                  </div>
                </SelectItem>
                <SelectItem value="net_30">
                  <div>
                    <div className="font-medium">Net 30 Days</div>
                    <div className="text-sm text-muted-foreground">Payment due within 30 days (standard)</div>
                  </div>
                </SelectItem>
                <SelectItem value="net_45">
                  <div>
                    <div className="font-medium">Net 45 Days</div>
                    <div className="text-sm text-muted-foreground">Payment due within 45 days</div>
                  </div>
                </SelectItem>
                <SelectItem value="net_60">
                  <div>
                    <div className="font-medium">Net 60 Days</div>
                    <div className="text-sm text-muted-foreground">Payment due within 60 days</div>
                  </div>
                </SelectItem>
                <SelectItem value="cod">
                  <div>
                    <div className="font-medium">Cash on Delivery (COD)</div>
                    <div className="text-sm text-muted-foreground">Payment upon delivery</div>
                  </div>
                </SelectItem>
                <SelectItem value="prepaid">
                  <div>
                    <div className="font-medium">Prepaid</div>
                    <div className="text-sm text-muted-foreground">Payment in advance</div>
                  </div>
                </SelectItem>
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
              placeholder="Enter your bank name (e.g., Chase Bank, Bank of America)"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="routing-number">Bank Routing Number *</Label>
              <Input
                id="routing-number"
                value={paymentInfo.bank_routing_number}
                onChange={(e) => updatePaymentInfo('bank_routing_number', e.target.value)}
                placeholder="123456789"
                maxLength={9}
                pattern="[0-9]{9}"
                required
              />
              <p className="text-xs text-muted-foreground mt-1">9-digit number found on your checks</p>
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
              <p className="text-xs text-muted-foreground mt-1">Business checking account number</p>
            </div>
          </div>

          <div>
            <Label htmlFor="bank-phone" className="flex items-center space-x-2">
              <Phone className="h-4 w-4" />
              <span>Bank Phone Number</span>
            </Label>
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
            Physical address of your banking institution's branch
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="bank-street">Street Address *</Label>
            <Input
              id="bank-street"
              value={paymentInfo.bank_address.street}
              onChange={(e) => updateBankAddress('street', e.target.value)}
              placeholder="Enter bank branch address"
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
              <Select
                value={paymentInfo.bank_address.state}
                onValueChange={(value) => updateBankAddress('state', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select state" />
                </SelectTrigger>
                <SelectContent className="max-h-60">
                  {US_STATES.map((state) => (
                    <SelectItem key={state.value} value={state.value}>
                      {state.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="bank-zip">ZIP Code *</Label>
              <Input
                id="bank-zip"
                value={paymentInfo.bank_address.zip}
                onChange={(e) => updateBankAddress('zip', e.target.value)}
                placeholder="12345"
                pattern="[0-9]{5}(-[0-9]{4})?"
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
