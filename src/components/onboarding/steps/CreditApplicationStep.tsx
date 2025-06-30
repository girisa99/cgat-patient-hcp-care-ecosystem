
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { TreatmentCenterOnboarding } from '@/types/onboarding';
import { CreditCard, DollarSign, TrendingUp } from 'lucide-react';

interface CreditApplicationStepProps {
  data: Partial<TreatmentCenterOnboarding>;
  onDataChange: (data: Partial<TreatmentCenterOnboarding>) => void;
}

export const CreditApplicationStep: React.FC<CreditApplicationStepProps> = ({ data, onDataChange }) => {
  const creditApplication = data.credit_application || {
    requested_credit_limit: '',
    trade_references: [],
    bank_references: [],
    credit_terms_requested: 'net_30',
    personal_guarantee_required: false,
    collateral_offered: false,
    financial_statements_provided: false
  };

  const updateCreditApplication = (field: string, value: any) => {
    const updatedCreditApplication = {
      ...creditApplication,
      [field]: value
    };

    onDataChange({
      ...data,
      credit_application: updatedCreditApplication
    });
  };

  const addTradeReference = () => {
    const newReference = {
      company_name: '',
      contact_name: '',
      phone: '',
      email: '',
      account_number: '',
      credit_limit: '',
      payment_terms: ''
    };
    
    updateCreditApplication('trade_references', [...(creditApplication.trade_references || []), newReference]);
  };

  const updateTradeReference = (index: number, field: string, value: string) => {
    const updatedReferences = [...(creditApplication.trade_references || [])];
    updatedReferences[index] = { ...updatedReferences[index], [field]: value };
    updateCreditApplication('trade_references', updatedReferences);
  };

  return (
    <div className="space-y-6">
      {/* Credit Request Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <CreditCard className="h-5 w-5" />
            <span>Credit Application Details</span>
          </CardTitle>
          <CardDescription>
            Specify your credit requirements and payment preferences
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="credit-limit">Requested Credit Limit *</Label>
              <Input
                id="credit-limit"
                type="number"
                value={creditApplication.requested_credit_limit}
                onChange={(e) => updateCreditApplication('requested_credit_limit', e.target.value)}
                placeholder="$0.00"
                required
              />
            </div>
            <div>
              <Label htmlFor="credit-terms">Preferred Credit Terms *</Label>
              <Select
                value={creditApplication.credit_terms_requested}
                onValueChange={(value) => updateCreditApplication('credit_terms_requested', value)}
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
          </div>

          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="personal-guarantee"
                checked={creditApplication.personal_guarantee_required}
                onCheckedChange={(checked) => updateCreditApplication('personal_guarantee_required', checked)}
              />
              <Label htmlFor="personal-guarantee">Personal guarantee required</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="collateral-offered"
                checked={creditApplication.collateral_offered}
                onCheckedChange={(checked) => updateCreditApplication('collateral_offered', checked)}
              />
              <Label htmlFor="collateral-offered">Collateral offered</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="financial-statements"
                checked={creditApplication.financial_statements_provided}
                onCheckedChange={(checked) => updateCreditApplication('financial_statements_provided', checked)}
              />
              <Label htmlFor="financial-statements">Financial statements provided</Label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Trade References */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5" />
              <span>Trade References</span>
            </div>
            <button
              type="button"
              onClick={addTradeReference}
              className="text-blue-600 hover:text-blue-800 font-medium text-sm"
            >
              + Add Reference
            </button>
          </CardTitle>
          <CardDescription>
            Provide at least 3 trade references for credit evaluation
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {(creditApplication.trade_references || []).map((reference, index) => (
              <div key={index} className="p-4 border rounded-lg space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="font-medium">Trade Reference #{index + 1}</h4>
                  <button
                    type="button"
                    onClick={() => {
                      const updatedReferences = creditApplication.trade_references?.filter((_, i) => i !== index);
                      updateCreditApplication('trade_references', updatedReferences);
                    }}
                    className="text-red-600 hover:text-red-800 text-sm"
                  >
                    Remove
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Company Name *</Label>
                    <Input
                      value={reference.company_name}
                      onChange={(e) => updateTradeReference(index, 'company_name', e.target.value)}
                      placeholder="Company name"
                    />
                  </div>
                  <div>
                    <Label>Contact Name</Label>
                    <Input
                      value={reference.contact_name}
                      onChange={(e) => updateTradeReference(index, 'contact_name', e.target.value)}
                      placeholder="Contact person"
                    />
                  </div>
                  <div>
                    <Label>Phone</Label>
                    <Input
                      value={reference.phone}
                      onChange={(e) => updateTradeReference(index, 'phone', e.target.value)}
                      placeholder="Phone number"
                    />
                  </div>
                  <div>
                    <Label>Account Number</Label>
                    <Input
                      value={reference.account_number}
                      onChange={(e) => updateTradeReference(index, 'account_number', e.target.value)}
                      placeholder="Account number"
                    />
                  </div>
                </div>
              </div>
            ))}
            
            {(!creditApplication.trade_references || creditApplication.trade_references.length === 0) && (
              <div className="text-center py-8 text-gray-500">
                No trade references added yet. Click "Add Reference" to get started.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
