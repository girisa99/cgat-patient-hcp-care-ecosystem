/**
 * ENHANCED INSURANCE FORM
 * Dynamic form that expands based on insurance type selections
 * Supports all permutations: Primary/Secondary/Tertiary + Government/Commercial + Medical/Pharmacy
 */
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CreditCard, Plus, Minus, Shield, Building2, Info } from 'lucide-react';

interface InsuranceTier {
  id: string;
  level: 'primary' | 'secondary' | 'tertiary';
  type: 'commercial' | 'medicare' | 'medicaid' | 'government_other' | '';
  
  // Base fields (all insurance types)
  provider: string;
  memberId: string;
  groupNumber: string;
  policyHolder: string;
  policyHolderDOB: string;
  policyHolderRelationship: string;
  phone: string;
  effectiveDate: string;
  expirationDate: string;
  
  // Government-specific fields
  medicarePartA?: boolean;
  medicarePartB?: boolean;
  medicarePartC?: boolean;
  medicarePartD?: boolean;
  medicaidNumber?: string;
  socialSecurityNumber?: string;
  railroadRetirementNumber?: string;
  
  // Commercial-specific fields
  employerName?: string;
  hrContactInfo?: string;
  cobraEligibility?: boolean;
  openEnrollmentPeriod?: string;
}

interface PharmacyBenefits {
  enabled: boolean;
  provider: string;
  memberId: string;
  groupNumber: string;
  pcn: string;
  bin: string;
  preferredPharmacy: string;
  mailOrderPharmacy: string;
  specialtyPharmacy: string;
}

interface EnhancedInsuranceData {
  insuranceTiers: InsuranceTier[];
  pharmacyBenefits: PharmacyBenefits;
  totalFieldCount: number;
}

interface EnhancedInsuranceFormProps {
  formData: EnhancedInsuranceData;
  updateFormData: (data: EnhancedInsuranceData) => void;
  readOnly?: boolean;
}

export const EnhancedInsuranceForm: React.FC<EnhancedInsuranceFormProps> = ({
  formData,
  updateFormData,
  readOnly = false
}) => {
  const [showFieldCount, setShowFieldCount] = useState(true);

  // Calculate total field count dynamically
  const calculateFieldCount = (data: EnhancedInsuranceData): number => {
    let count = 0;
    
    data.insuranceTiers.forEach(tier => {
      count += 9; // Base fields
      if (tier.type === 'medicare' || tier.type === 'medicaid' || tier.type === 'government_other') {
        count += 7; // Government-specific fields
      }
      if (tier.type === 'commercial') {
        count += 4; // Commercial-specific fields
      }
    });
    
    if (data.pharmacyBenefits.enabled) {
      count += 8; // Pharmacy fields
    }
    
    return count;
  };

  const addInsuranceTier = () => {
    const newLevel = formData.insuranceTiers.length === 0 ? 'primary' : 
                    formData.insuranceTiers.length === 1 ? 'secondary' : 'tertiary';
    
    const newTier: InsuranceTier = {
      id: `tier_${Date.now()}`,
      level: newLevel,
      type: '',
      provider: '',
      memberId: '',
      groupNumber: '',
      policyHolder: '',
      policyHolderDOB: '',
      policyHolderRelationship: '',
      phone: '',
      effectiveDate: '',
      expirationDate: ''
    };

    const updatedData = {
      ...formData,
      insuranceTiers: [...formData.insuranceTiers, newTier]
    };
    updatedData.totalFieldCount = calculateFieldCount(updatedData);
    updateFormData(updatedData);
  };

  const removeInsuranceTier = (tierId: string) => {
    const updatedData = {
      ...formData,
      insuranceTiers: formData.insuranceTiers.filter(tier => tier.id !== tierId)
    };
    updatedData.totalFieldCount = calculateFieldCount(updatedData);
    updateFormData(updatedData);
  };

  const updateInsuranceTier = (tierId: string, field: keyof InsuranceTier, value: any) => {
    const updatedData = {
      ...formData,
      insuranceTiers: formData.insuranceTiers.map(tier => 
        tier.id === tierId ? { ...tier, [field]: value } : tier
      )
    };
    updatedData.totalFieldCount = calculateFieldCount(updatedData);
    updateFormData(updatedData);
  };

  const updatePharmacyBenefits = (field: keyof PharmacyBenefits, value: any) => {
    const updatedData = {
      ...formData,
      pharmacyBenefits: {
        ...formData.pharmacyBenefits,
        [field]: value
      }
    };
    updatedData.totalFieldCount = calculateFieldCount(updatedData);
    updateFormData(updatedData);
  };

  const renderInsuranceTier = (tier: InsuranceTier, index: number) => {
    const isGovernment = ['medicare', 'medicaid', 'government_other'].includes(tier.type);
    const isCommercial = tier.type === 'commercial';

    return (
      <Card key={tier.id} className="relative">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              {tier.level.charAt(0).toUpperCase() + tier.level.slice(1)} Insurance
              {tier.type && (
                <Badge variant="outline">
                  {tier.type === 'medicare' ? 'Medicare' :
                   tier.type === 'medicaid' ? 'Medicaid' :
                   tier.type === 'commercial' ? 'Commercial' :
                   tier.type === 'government_other' ? 'Other Government' : ''}
                </Badge>
              )}
            </div>
            {formData.insuranceTiers.length > 1 && !readOnly && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeInsuranceTier(tier.id)}
              >
                <Minus className="h-4 w-4" />
              </Button>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Insurance Type Selection */}
          <div>
            <Label htmlFor={`type_${tier.id}`}>Insurance Type *</Label>
            <Select 
              value={tier.type} 
              onValueChange={(value) => updateInsuranceTier(tier.id, 'type', value)}
              disabled={readOnly}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select insurance type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="commercial">Commercial</SelectItem>
                <SelectItem value="medicare">Medicare</SelectItem>
                <SelectItem value="medicaid">Medicaid</SelectItem>
                <SelectItem value="government_other">Other Government</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Base Insurance Fields */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor={`provider_${tier.id}`}>Insurance Provider *</Label>
              <Input
                id={`provider_${tier.id}`}
                value={tier.provider}
                onChange={(e) => updateInsuranceTier(tier.id, 'provider', e.target.value)}
                disabled={readOnly}
                required
              />
            </div>
            <div>
              <Label htmlFor={`memberId_${tier.id}`}>Member/Policy ID *</Label>
              <Input
                id={`memberId_${tier.id}`}
                value={tier.memberId}
                onChange={(e) => updateInsuranceTier(tier.id, 'memberId', e.target.value)}
                disabled={readOnly}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor={`groupNumber_${tier.id}`}>Group Number</Label>
              <Input
                id={`groupNumber_${tier.id}`}
                value={tier.groupNumber}
                onChange={(e) => updateInsuranceTier(tier.id, 'groupNumber', e.target.value)}
                disabled={readOnly}
              />
            </div>
            <div>
              <Label htmlFor={`phone_${tier.id}`}>Customer Service Phone *</Label>
              <Input
                id={`phone_${tier.id}`}
                value={tier.phone}
                onChange={(e) => updateInsuranceTier(tier.id, 'phone', e.target.value)}
                disabled={readOnly}
                required
              />
            </div>
          </div>

          {/* Policy Holder Information */}
          <Separator />
          <h4 className="font-medium">Policy Holder Information</h4>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor={`policyHolder_${tier.id}`}>Policy Holder Name *</Label>
              <Input
                id={`policyHolder_${tier.id}`}
                value={tier.policyHolder}
                onChange={(e) => updateInsuranceTier(tier.id, 'policyHolder', e.target.value)}
                disabled={readOnly}
                required
              />
            </div>
            <div>
              <Label htmlFor={`policyHolderDOB_${tier.id}`}>Policy Holder DOB *</Label>
              <Input
                id={`policyHolderDOB_${tier.id}`}
                type="date"
                value={tier.policyHolderDOB}
                onChange={(e) => updateInsuranceTier(tier.id, 'policyHolderDOB', e.target.value)}
                disabled={readOnly}
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor={`relationship_${tier.id}`}>Relationship to Patient *</Label>
            <Select 
              value={tier.policyHolderRelationship} 
              onValueChange={(value) => updateInsuranceTier(tier.id, 'policyHolderRelationship', value)}
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

          {/* Coverage Dates */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor={`effectiveDate_${tier.id}`}>Effective Date</Label>
              <Input
                id={`effectiveDate_${tier.id}`}
                type="date"
                value={tier.effectiveDate}
                onChange={(e) => updateInsuranceTier(tier.id, 'effectiveDate', e.target.value)}
                disabled={readOnly}
              />
            </div>
            <div>
              <Label htmlFor={`expirationDate_${tier.id}`}>Expiration Date</Label>
              <Input
                id={`expirationDate_${tier.id}`}
                type="date"
                value={tier.expirationDate}
                onChange={(e) => updateInsuranceTier(tier.id, 'expirationDate', e.target.value)}
                disabled={readOnly}
              />
            </div>
          </div>

          {/* Government-Specific Fields */}
          {isGovernment && (
            <>
              <Separator />
              <div className="space-y-4">
                <h4 className="font-medium flex items-center gap-2">
                  <Building2 className="h-4 w-4" />
                  Government Insurance Details
                </h4>

                {tier.type === 'medicare' && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id={`medicarePartA_${tier.id}`}
                        checked={tier.medicarePartA || false}
                        onCheckedChange={(checked) => updateInsuranceTier(tier.id, 'medicarePartA', checked)}
                        disabled={readOnly}
                      />
                      <Label htmlFor={`medicarePartA_${tier.id}`}>Medicare Part A</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id={`medicarePartB_${tier.id}`}
                        checked={tier.medicarePartB || false}
                        onCheckedChange={(checked) => updateInsuranceTier(tier.id, 'medicarePartB', checked)}
                        disabled={readOnly}
                      />
                      <Label htmlFor={`medicarePartB_${tier.id}`}>Medicare Part B</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id={`medicarePartC_${tier.id}`}
                        checked={tier.medicarePartC || false}
                        onCheckedChange={(checked) => updateInsuranceTier(tier.id, 'medicarePartC', checked)}
                        disabled={readOnly}
                      />
                      <Label htmlFor={`medicarePartC_${tier.id}`}>Medicare Part C (Advantage)</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id={`medicarePartD_${tier.id}`}
                        checked={tier.medicarePartD || false}
                        onCheckedChange={(checked) => updateInsuranceTier(tier.id, 'medicarePartD', checked)}
                        disabled={readOnly}
                      />
                      <Label htmlFor={`medicarePartD_${tier.id}`}>Medicare Part D (Prescription)</Label>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  {tier.type === 'medicaid' && (
                    <div>
                      <Label htmlFor={`medicaidNumber_${tier.id}`}>Medicaid ID Number</Label>
                      <Input
                        id={`medicaidNumber_${tier.id}`}
                        value={tier.medicaidNumber || ''}
                        onChange={(e) => updateInsuranceTier(tier.id, 'medicaidNumber', e.target.value)}
                        disabled={readOnly}
                      />
                    </div>
                  )}
                  <div>
                    <Label htmlFor={`ssn_${tier.id}`}>Social Security Number</Label>
                    <Input
                      id={`ssn_${tier.id}`}
                      value={tier.socialSecurityNumber || ''}
                      onChange={(e) => updateInsuranceTier(tier.id, 'socialSecurityNumber', e.target.value)}
                      disabled={readOnly}
                    />
                  </div>
                  <div>
                    <Label htmlFor={`railroad_${tier.id}`}>Railroad Retirement Number</Label>
                    <Input
                      id={`railroad_${tier.id}`}
                      value={tier.railroadRetirementNumber || ''}
                      onChange={(e) => updateInsuranceTier(tier.id, 'railroadRetirementNumber', e.target.value)}
                      disabled={readOnly}
                    />
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Commercial-Specific Fields */}
          {isCommercial && (
            <>
              <Separator />
              <div className="space-y-4">
                <h4 className="font-medium">Commercial Insurance Details</h4>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor={`employer_${tier.id}`}>Employer Name</Label>
                    <Input
                      id={`employer_${tier.id}`}
                      value={tier.employerName || ''}
                      onChange={(e) => updateInsuranceTier(tier.id, 'employerName', e.target.value)}
                      disabled={readOnly}
                    />
                  </div>
                  <div>
                    <Label htmlFor={`hrContact_${tier.id}`}>HR Contact Information</Label>
                    <Input
                      id={`hrContact_${tier.id}`}
                      value={tier.hrContactInfo || ''}
                      onChange={(e) => updateInsuranceTier(tier.id, 'hrContactInfo', e.target.value)}
                      disabled={readOnly}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id={`cobra_${tier.id}`}
                      checked={tier.cobraEligibility || false}
                      onCheckedChange={(checked) => updateInsuranceTier(tier.id, 'cobraEligibility', checked)}
                      disabled={readOnly}
                    />
                    <Label htmlFor={`cobra_${tier.id}`}>COBRA Eligible</Label>
                  </div>
                  <div>
                    <Label htmlFor={`openEnrollment_${tier.id}`}>Open Enrollment Period</Label>
                    <Input
                      id={`openEnrollment_${tier.id}`}
                      value={tier.openEnrollmentPeriod || ''}
                      onChange={(e) => updateInsuranceTier(tier.id, 'openEnrollmentPeriod', e.target.value)}
                      disabled={readOnly}
                    />
                  </div>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      {/* Field Count Display */}
      {showFieldCount && (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            <strong>Current Configuration:</strong> {formData.totalFieldCount} total fields across{' '}
            {formData.insuranceTiers.length} insurance tier(s){formData.pharmacyBenefits.enabled ? ' + pharmacy benefits' : ''}
          </AlertDescription>
        </Alert>
      )}

      {/* Insurance Tiers */}
      <div className="space-y-4">
        {formData.insuranceTiers.map((tier, index) => renderInsuranceTier(tier, index))}
        
        {formData.insuranceTiers.length < 3 && !readOnly && (
          <Button
            variant="outline"
            onClick={addInsuranceTier}
            className="w-full"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add {formData.insuranceTiers.length === 0 ? 'Primary' : 
                 formData.insuranceTiers.length === 1 ? 'Secondary' : 'Tertiary'} Insurance
          </Button>
        )}
      </div>

      {/* Pharmacy Benefits */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Pharmacy Benefits
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="pharmacyEnabled"
              checked={formData.pharmacyBenefits.enabled}
              onCheckedChange={(checked) => updatePharmacyBenefits('enabled', checked)}
              disabled={readOnly}
            />
            <Label htmlFor="pharmacyEnabled">Patient has separate pharmacy benefits</Label>
          </div>

          {formData.pharmacyBenefits.enabled && (
            <div className="space-y-4 pt-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="pharmacyProvider">Pharmacy Benefits Manager</Label>
                  <Input
                    id="pharmacyProvider"
                    value={formData.pharmacyBenefits.provider}
                    onChange={(e) => updatePharmacyBenefits('provider', e.target.value)}
                    disabled={readOnly}
                  />
                </div>
                <div>
                  <Label htmlFor="pharmacyMemberId">Pharmacy Member ID</Label>
                  <Input
                    id="pharmacyMemberId"
                    value={formData.pharmacyBenefits.memberId}
                    onChange={(e) => updatePharmacyBenefits('memberId', e.target.value)}
                    disabled={readOnly}
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="pharmacyGroupNumber">Group Number</Label>
                  <Input
                    id="pharmacyGroupNumber"
                    value={formData.pharmacyBenefits.groupNumber}
                    onChange={(e) => updatePharmacyBenefits('groupNumber', e.target.value)}
                    disabled={readOnly}
                  />
                </div>
                <div>
                  <Label htmlFor="pharmacyPCN">PCN</Label>
                  <Input
                    id="pharmacyPCN"
                    value={formData.pharmacyBenefits.pcn}
                    onChange={(e) => updatePharmacyBenefits('pcn', e.target.value)}
                    disabled={readOnly}
                  />
                </div>
                <div>
                  <Label htmlFor="pharmacyBIN">BIN</Label>
                  <Input
                    id="pharmacyBIN"
                    value={formData.pharmacyBenefits.bin}
                    onChange={(e) => updatePharmacyBenefits('bin', e.target.value)}
                    disabled={readOnly}
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="preferredPharmacy">Preferred Pharmacy Network</Label>
                  <Input
                    id="preferredPharmacy"
                    value={formData.pharmacyBenefits.preferredPharmacy}
                    onChange={(e) => updatePharmacyBenefits('preferredPharmacy', e.target.value)}
                    disabled={readOnly}
                  />
                </div>
                <div>
                  <Label htmlFor="mailOrderPharmacy">Mail Order Pharmacy</Label>
                  <Input
                    id="mailOrderPharmacy"
                    value={formData.pharmacyBenefits.mailOrderPharmacy}
                    onChange={(e) => updatePharmacyBenefits('mailOrderPharmacy', e.target.value)}
                    disabled={readOnly}
                  />
                </div>
                <div>
                  <Label htmlFor="specialtyPharmacy">Specialty Pharmacy</Label>
                  <Input
                    id="specialtyPharmacy"
                    value={formData.pharmacyBenefits.specialtyPharmacy}
                    onChange={(e) => updatePharmacyBenefits('specialtyPharmacy', e.target.value)}
                    disabled={readOnly}
                  />
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

// Helper function to create empty enhanced insurance data
export const createEmptyEnhancedInsuranceData = (): EnhancedInsuranceData => ({
  insuranceTiers: [{
    id: 'primary',
    level: 'primary',
    type: '',
    provider: '',
    memberId: '',
    groupNumber: '',
    policyHolder: '',
    policyHolderDOB: '',
    policyHolderRelationship: '',
    phone: '',
    effectiveDate: '',
    expirationDate: ''
  }],
  pharmacyBenefits: {
    enabled: false,
    provider: '',
    memberId: '',
    groupNumber: '',
    pcn: '',
    bin: '',
    preferredPharmacy: '',
    mailOrderPharmacy: '',
    specialtyPharmacy: ''
  },
  totalFieldCount: 9
});