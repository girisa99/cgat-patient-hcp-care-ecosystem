/**
 * COMPLETE INSURANCE INFORMATION FORM
 * All 22 fields from online form
 */
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { CreditCard, Shield, Plus } from 'lucide-react';
import type { CompleteInsuranceInformation } from '@/types/completeEnrollmentMapping';

interface CompleteInsuranceFormProps {
  formData: CompleteInsuranceInformation;
  updateFormData: (field: keyof CompleteInsuranceInformation, value: any) => void;
  readOnly?: boolean;
}

export const CompleteInsuranceForm: React.FC<CompleteInsuranceFormProps> = ({
  formData,
  updateFormData,
  readOnly = false
}) => {
  return (
    <div className="space-y-6">
      {/* Primary Medical Insurance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Primary Medical Insurance
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="primaryInsuranceProvider">Insurance Provider *</Label>
              <Input
                id="primaryInsuranceProvider"
                value={formData.primaryInsuranceProvider}
                onChange={(e) => updateFormData('primaryInsuranceProvider', e.target.value)}
                placeholder="Blue Cross Blue Shield, Aetna, etc."
                disabled={readOnly}
                required
              />
            </div>
            <div>
              <Label htmlFor="primaryInsuranceType">Insurance Type *</Label>
              <Select 
                value={formData.primaryInsuranceType} 
                onValueChange={(value) => updateFormData('primaryInsuranceType', value)}
                disabled={readOnly}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select insurance type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="commercial">Commercial</SelectItem>
                  <SelectItem value="medicare">Medicare</SelectItem>
                  <SelectItem value="medicaid">Medicaid</SelectItem>
                  <SelectItem value="government">Government</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="primaryMemberId">Member/Policy ID *</Label>
              <Input
                id="primaryMemberId"
                value={formData.primaryMemberId}
                onChange={(e) => updateFormData('primaryMemberId', e.target.value)}
                disabled={readOnly}
                required
              />
            </div>
            <div>
              <Label htmlFor="primaryGroupNumber">Group Number</Label>
              <Input
                id="primaryGroupNumber"
                value={formData.primaryGroupNumber || ''}
                onChange={(e) => updateFormData('primaryGroupNumber', e.target.value)}
                disabled={readOnly}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="primaryInsurancePhone">Insurance Phone Number *</Label>
            <Input
              id="primaryInsurancePhone"
              value={formData.primaryInsurancePhone}
              onChange={(e) => updateFormData('primaryInsurancePhone', e.target.value)}
              placeholder="Customer service phone"
              disabled={readOnly}
              required
            />
          </div>

          <Separator />

          {/* Policy Holder Information */}
          <div className="space-y-4">
            <h4 className="font-medium">Policy Holder Information</h4>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="primaryPolicyHolder">Policy Holder Name *</Label>
                <Input
                  id="primaryPolicyHolder"
                  value={formData.primaryPolicyHolder}
                  onChange={(e) => updateFormData('primaryPolicyHolder', e.target.value)}
                  placeholder="Name as it appears on insurance card"
                  disabled={readOnly}
                  required
                />
              </div>
              <div>
                <Label htmlFor="primaryPolicyHolderDOB">Policy Holder DOB *</Label>
                <Input
                  id="primaryPolicyHolderDOB"
                  type="date"
                  value={formData.primaryPolicyHolderDOB}
                  onChange={(e) => updateFormData('primaryPolicyHolderDOB', e.target.value)}
                  disabled={readOnly}
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="primaryPolicyHolderRelationship">Relationship to Patient *</Label>
              <Select 
                value={formData.primaryPolicyHolderRelationship} 
                onValueChange={(value) => updateFormData('primaryPolicyHolderRelationship', value)}
                disabled={readOnly}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select relationship" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="self">Self</SelectItem>
                  <SelectItem value="spouse">Spouse</SelectItem>
                  <SelectItem value="child">Child</SelectItem>
                  <SelectItem value="parent">Parent</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Separator />

          {/* Coverage Dates */}
          <div className="space-y-4">
            <h4 className="font-medium">Coverage Dates</h4>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="primaryEffectiveDate">Effective Date</Label>
                <Input
                  id="primaryEffectiveDate"
                  type="date"
                  value={formData.primaryEffectiveDate || ''}
                  onChange={(e) => updateFormData('primaryEffectiveDate', e.target.value)}
                  disabled={readOnly}
                />
              </div>
              <div>
                <Label htmlFor="primaryExpirationDate">Expiration Date</Label>
                <Input
                  id="primaryExpirationDate"
                  type="date"
                  value={formData.primaryExpirationDate || ''}
                  onChange={(e) => updateFormData('primaryExpirationDate', e.target.value)}
                  disabled={readOnly}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Secondary Insurance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Secondary Insurance (Optional)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="hasSecondaryInsurance"
              checked={formData.hasSecondaryInsurance || false}
              onCheckedChange={(checked) => updateFormData('hasSecondaryInsurance', checked)}
              disabled={readOnly}
            />
            <Label htmlFor="hasSecondaryInsurance">Patient has secondary insurance</Label>
          </div>

          {formData.hasSecondaryInsurance && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="secondaryInsuranceProvider">Secondary Provider</Label>
                  <Input
                    id="secondaryInsuranceProvider"
                    value={formData.secondaryInsuranceProvider || ''}
                    onChange={(e) => updateFormData('secondaryInsuranceProvider', e.target.value)}
                    disabled={readOnly}
                  />
                </div>
                <div>
                  <Label htmlFor="secondaryInsuranceType">Insurance Type</Label>
                  <Select 
                    value={formData.secondaryInsuranceType || ''} 
                    onValueChange={(value) => updateFormData('secondaryInsuranceType', value)}
                    disabled={readOnly}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="commercial">Commercial</SelectItem>
                      <SelectItem value="medicare">Medicare</SelectItem>
                      <SelectItem value="medicaid">Medicaid</SelectItem>
                      <SelectItem value="government">Government</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="secondaryMemberId">Member/Policy ID</Label>
                  <Input
                    id="secondaryMemberId"
                    value={formData.secondaryMemberId || ''}
                    onChange={(e) => updateFormData('secondaryMemberId', e.target.value)}
                    disabled={readOnly}
                  />
                </div>
                <div>
                  <Label htmlFor="secondaryGroupNumber">Group Number</Label>
                  <Input
                    id="secondaryGroupNumber"
                    value={formData.secondaryGroupNumber || ''}
                    onChange={(e) => updateFormData('secondaryGroupNumber', e.target.value)}
                    disabled={readOnly}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="secondaryPolicyHolder">Policy Holder Name</Label>
                  <Input
                    id="secondaryPolicyHolder"
                    value={formData.secondaryPolicyHolder || ''}
                    onChange={(e) => updateFormData('secondaryPolicyHolder', e.target.value)}
                    disabled={readOnly}
                  />
                </div>
                <div>
                  <Label htmlFor="secondaryPolicyHolderDOB">Policy Holder DOB</Label>
                  <Input
                    id="secondaryPolicyHolderDOB"
                    type="date"
                    value={formData.secondaryPolicyHolderDOB || ''}
                    onChange={(e) => updateFormData('secondaryPolicyHolderDOB', e.target.value)}
                    disabled={readOnly}
                  />
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Prescription/Pharmacy Insurance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Prescription/Pharmacy Insurance
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="pharmacyInsuranceProvider">Pharmacy Insurance Provider</Label>
              <Input
                id="pharmacyInsuranceProvider"
                value={formData.pharmacyInsuranceProvider || ''}
                onChange={(e) => updateFormData('pharmacyInsuranceProvider', e.target.value)}
                placeholder="Express Scripts, CVS Caremark, etc."
                disabled={readOnly}
              />
            </div>
            <div>
              <Label htmlFor="pharmacyMemberId">Pharmacy Member ID</Label>
              <Input
                id="pharmacyMemberId"
                value={formData.pharmacyMemberId || ''}
                onChange={(e) => updateFormData('pharmacyMemberId', e.target.value)}
                disabled={readOnly}
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="pharmacyGroupNumber">Group Number</Label>
              <Input
                id="pharmacyGroupNumber"
                value={formData.pharmacyGroupNumber || ''}
                onChange={(e) => updateFormData('pharmacyGroupNumber', e.target.value)}
                disabled={readOnly}
              />
            </div>
            <div>
              <Label htmlFor="pharmacyPCN">PCN</Label>
              <Input
                id="pharmacyPCN"
                value={formData.pharmacyPCN || ''}
                onChange={(e) => updateFormData('pharmacyPCN', e.target.value)}
                placeholder="Processor Control Number"
                disabled={readOnly}
              />
            </div>
            <div>
              <Label htmlFor="pharmacyBIN">BIN</Label>
              <Input
                id="pharmacyBIN"
                value={formData.pharmacyBIN || ''}
                onChange={(e) => updateFormData('pharmacyBIN', e.target.value)}
                placeholder="Bank Identification Number"
                disabled={readOnly}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Default empty data helper
export const createEmptyCompleteInsuranceData = (): CompleteInsuranceInformation => ({
  primaryInsuranceProvider: '',
  primaryMemberId: '',
  primaryGroupNumber: '',
  primaryPolicyHolder: '',
  primaryPolicyHolderDOB: '',
  primaryPolicyHolderRelationship: '',
  primaryInsuranceType: 'commercial',
  primaryInsurancePhone: '',
  primaryEffectiveDate: '',
  primaryExpirationDate: '',
  hasSecondaryInsurance: false,
  secondaryInsuranceProvider: '',
  secondaryMemberId: '',
  secondaryGroupNumber: '',
  secondaryPolicyHolder: '',
  secondaryPolicyHolderDOB: '',
  secondaryInsuranceType: 'commercial',
  pharmacyInsuranceProvider: '',
  pharmacyMemberId: '',
  pharmacyGroupNumber: '',
  pharmacyPCN: '',
  pharmacyBIN: ''
});