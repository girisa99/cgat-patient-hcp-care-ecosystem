import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, AlertCircle, Info } from 'lucide-react';

export const InsuranceInformationFieldComparison = () => {
  // Complete Insurance Fields - 56 fields total from actual form implementation
  const currentMappedFields = [
    // Primary Insurance (14 fields)
    { key: 'primaryInsuranceProvider', label: 'Primary Insurance Provider', required: true, table: 'enrollment_insurance_info' },
    { key: 'primaryMemberId', label: 'Primary Member/Policy ID', required: true, table: 'enrollment_insurance_info' },
    { key: 'primaryGroupNumber', label: 'Primary Group Number', required: false, table: 'enrollment_insurance_info' },
    { key: 'primaryPolicyHolder', label: 'Primary Policy Holder Name', required: true, table: 'enrollment_insurance_info' },
    { key: 'primaryPolicyHolderDOB', label: 'Primary Policy Holder DOB', required: true, table: 'enrollment_insurance_info' },
    { key: 'primaryPolicyHolderRelationship', label: 'Primary Policy Holder Relationship', required: true, table: 'enrollment_insurance_info' },
    { key: 'primaryInsuranceType', label: 'Primary Insurance Type', required: true, table: 'enrollment_insurance_info' },
    { key: 'primaryInsurancePhone', label: 'Primary Insurance Phone', required: true, table: 'enrollment_insurance_info' },
    { key: 'primaryInsuranceAddress', label: 'Primary Insurance Address', required: false, table: 'enrollment_insurance_info' },
    { key: 'primaryInsuranceCity', label: 'Primary Insurance City', required: false, table: 'enrollment_insurance_info' },
    { key: 'primaryInsuranceState', label: 'Primary Insurance State', required: false, table: 'enrollment_insurance_info' },
    { key: 'primaryInsuranceZipCode', label: 'Primary Insurance Zip Code', required: false, table: 'enrollment_insurance_info' },
    { key: 'primaryEffectiveDate', label: 'Primary Effective Date', required: false, table: 'enrollment_insurance_info' },
    { key: 'primaryExpirationDate', label: 'Primary Expiration Date', required: false, table: 'enrollment_insurance_info' },
    
    // Secondary Insurance (9 fields)
    { key: 'hasSecondaryInsurance', label: 'Has Secondary Insurance', required: false, table: 'enrollment_insurance_info' },
    { key: 'secondaryInsuranceProvider', label: 'Secondary Insurance Provider', required: false, table: 'enrollment_insurance_info' },
    { key: 'secondaryMemberId', label: 'Secondary Member ID', required: false, table: 'enrollment_insurance_info' },
    { key: 'secondaryGroupNumber', label: 'Secondary Group Number', required: false, table: 'enrollment_insurance_info' },
    { key: 'secondaryPolicyHolder', label: 'Secondary Policy Holder', required: false, table: 'enrollment_insurance_info' },
    { key: 'secondaryPolicyHolderDOB', label: 'Secondary Policy Holder DOB', required: false, table: 'enrollment_insurance_info' },
    { key: 'secondaryPolicyHolderRelationship', label: 'Secondary Policy Holder Relationship', required: false, table: 'enrollment_insurance_info' },
    { key: 'secondaryInsuranceType', label: 'Secondary Insurance Type', required: false, table: 'enrollment_insurance_info' },
    { key: 'secondaryInsurancePhone', label: 'Secondary Insurance Phone', required: false, table: 'enrollment_insurance_info' },
    
    // Pharmacy Insurance (8 fields)
    { key: 'pharmacyInsuranceProvider', label: 'Pharmacy Insurance Provider', required: false, table: 'enrollment_insurance_info' },
    { key: 'pharmacyMemberId', label: 'Pharmacy Member ID', required: false, table: 'enrollment_insurance_info' },
    { key: 'pharmacyGroupNumber', label: 'Pharmacy Group Number', required: false, table: 'enrollment_insurance_info' },
    { key: 'pharmacyPCN', label: 'Pharmacy PCN', required: false, table: 'enrollment_insurance_info' },
    { key: 'pharmacyBIN', label: 'Pharmacy BIN', required: false, table: 'enrollment_insurance_info' },
    { key: 'pharmacyProcessorNumber', label: 'Pharmacy Processor Number', required: false, table: 'enrollment_insurance_info' },
    { key: 'pharmacyPhone', label: 'Pharmacy Phone', required: false, table: 'enrollment_insurance_info' },
    { key: 'pharmacyNetwork', label: 'Pharmacy Network', required: false, table: 'enrollment_insurance_info' },
    
    // Benefits & Coverage (25 fields)
    { key: 'deductibleAmount', label: 'Deductible Amount', required: false, table: 'enrollment_insurance_info' },
    { key: 'deductibleMet', label: 'Deductible Met', required: false, table: 'enrollment_insurance_info' },
    { key: 'outOfPocketMaximum', label: 'Out of Pocket Maximum', required: false, table: 'enrollment_insurance_info' },
    { key: 'outOfPocketMet', label: 'Out of Pocket Met', required: false, table: 'enrollment_insurance_info' },
    { key: 'copayAmount', label: 'Copay Amount', required: false, table: 'enrollment_insurance_info' },
    { key: 'coinsurancePercentage', label: 'Coinsurance Percentage', required: false, table: 'enrollment_insurance_info' },
    { key: 'coveragePercentage', label: 'Coverage Percentage', required: false, table: 'enrollment_insurance_info' },
    { key: 'annualMaximumBenefit', label: 'Annual Maximum Benefit', required: false, table: 'enrollment_insurance_info' },
    { key: 'lifetimeMaximumBenefit', label: 'Lifetime Maximum Benefit', required: false, table: 'enrollment_insurance_info' },
    { key: 'coverageLevel', label: 'Coverage Level', required: false, table: 'enrollment_insurance_info' },
    { key: 'formularyTier', label: 'Formulary Tier', required: false, table: 'enrollment_insurance_info' },
    { key: 'stepTherapyRequired', label: 'Step Therapy Required', required: false, table: 'enrollment_insurance_info' },
    { key: 'priorAuthorizationRequired', label: 'Prior Authorization Required', required: false, table: 'enrollment_insurance_info' },
    { key: 'priorAuthorizationNumber', label: 'Prior Authorization Number', required: false, table: 'enrollment_insurance_info' },
    { key: 'priorAuthorizationExpiration', label: 'Prior Authorization Expiration', required: false, table: 'enrollment_insurance_info' },
    { key: 'referralRequired', label: 'Referral Required', required: false, table: 'enrollment_insurance_info' },
    { key: 'referralNumber', label: 'Referral Number', required: false, table: 'enrollment_insurance_info' },
    { key: 'referralExpiration', label: 'Referral Expiration', required: false, table: 'enrollment_insurance_info' },
    { key: 'preApprovalRequired', label: 'Pre-approval Required', required: false, table: 'enrollment_insurance_info' },
    { key: 'preApprovalNumber', label: 'Pre-approval Number', required: false, table: 'enrollment_insurance_info' },
    { key: 'preApprovalExpiration', label: 'Pre-approval Expiration', required: false, table: 'enrollment_insurance_info' },
    { key: 'primaryInsuranceNetwork', label: 'Primary Insurance Network', required: false, table: 'enrollment_insurance_info' },
    { key: 'secondaryEffectiveDate', label: 'Secondary Effective Date', required: false, table: 'enrollment_insurance_info' },
    { key: 'secondaryExpirationDate', label: 'Secondary Expiration Date', required: false, table: 'enrollment_insurance_info' },
    { key: 'coordinationOfBenefits', label: 'Coordination of Benefits', required: false, table: 'enrollment_insurance_info' }
  ];

  const expectedOnlineFormFields = [
    // Primary Insurance Information
    { key: 'primary_insurance_provider', label: 'Primary Insurance Provider', required: true, category: 'Primary Insurance' },
    { key: 'member_id', label: 'Member/Policy ID', required: true, category: 'Primary Insurance' },
    { key: 'group_number', label: 'Group Number', required: false, category: 'Primary Insurance' },
    { key: 'policy_holder', label: 'Policy Holder Name', required: true, category: 'Primary Insurance' },
    { key: 'policy_holder_dob', label: 'Policy Holder Date of Birth', required: true, category: 'Primary Insurance' },
    { key: 'relationship_to_insured', label: 'Relationship to Insured', required: true, category: 'Primary Insurance' },
    { key: 'insurance_phone', label: 'Insurance Customer Service Phone', required: false, category: 'Primary Insurance' },
    { key: 'effective_date', label: 'Coverage Effective Date', required: false, category: 'Primary Insurance' },
    
    // Secondary Insurance (if applicable)
    { key: 'has_secondary_insurance', label: 'Has Secondary Insurance', required: false, category: 'Secondary Insurance' },
    { key: 'secondary_insurance_provider', label: 'Secondary Insurance Provider', required: false, category: 'Secondary Insurance' },
    { key: 'secondary_member_id', label: 'Secondary Member ID', required: false, category: 'Secondary Insurance' },
    { key: 'secondary_group_number', label: 'Secondary Group Number', required: false, category: 'Secondary Insurance' },
    { key: 'secondary_policy_holder', label: 'Secondary Policy Holder', required: false, category: 'Secondary Insurance' },
    
    // Benefits Verification
    { key: 'benefits_verified', label: 'Benefits Verified', required: false, category: 'Benefits Verification' },
    { key: 'verification_date', label: 'Verification Date', required: false, category: 'Benefits Verification' },
    { key: 'copay_amount', label: 'Copay Amount', required: false, category: 'Benefits Verification' },
    { key: 'deductible_amount', label: 'Deductible Amount', required: false, category: 'Benefits Verification' },
    { key: 'coinsurance_percentage', label: 'Coinsurance Percentage', required: false, category: 'Benefits Verification' },
    { key: 'out_of_pocket_max', label: 'Out of Pocket Maximum', required: false, category: 'Benefits Verification' },
    { key: 'prior_authorization_required', label: 'Prior Authorization Required', required: false, category: 'Benefits Verification' },
    
    // Insurance Card Upload
    { key: 'insurance_card_front', label: 'Insurance Card Front Image', required: false, category: 'Documentation' },
    { key: 'insurance_card_back', label: 'Insurance Card Back Image', required: false, category: 'Documentation' }
  ];

  const mappedKeys = currentMappedFields.map(f => f.key);
  const missingFields = expectedOnlineFormFields.filter(f => !mappedKeys.includes(f.key));
  const mappedCorrectly = expectedOnlineFormFields.filter(f => mappedKeys.includes(f.key));

  const categories = Array.from(new Set(expectedOnlineFormFields.map(f => f.category)));

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Insurance Information Section Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            <div className="flex gap-4 text-sm">
              <div className="flex items-center gap-1">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span>Mapped: {mappedCorrectly.length}</span>
              </div>
              <div className="flex items-center gap-1">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <span>Missing: {missingFields.length}</span>
              </div>
              <div className="text-muted-foreground">
                Total Online Form Fields: {expectedOnlineFormFields.length}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {categories.map(category => (
        <Card key={category}>
          <CardHeader>
            <CardTitle className="text-lg">{category}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {expectedOnlineFormFields
                .filter(field => field.category === category)
                .map(field => {
                  const isMapped = mappedKeys.includes(field.key);
                  const mappedField = currentMappedFields.find(m => m.key === field.key);
                  
                  return (
                    <div key={field.key} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        {isMapped ? (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        ) : (
                          <AlertCircle className="h-4 w-4 text-red-600" />
                        )}
                        <div>
                          <div className="font-medium">{field.label}</div>
                          <div className="text-sm text-muted-foreground">
                            Field Key: {field.key}
                            {mappedField && (
                              <span className="ml-2">→ {mappedField.table}.{field.key}</span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Badge variant={field.required ? "destructive" : "secondary"}>
                          {field.required ? "Required" : "Optional"}
                        </Badge>
                        <Badge variant={isMapped ? "default" : "outline"}>
                          {isMapped ? "Mapped" : "Missing"}
                        </Badge>
                      </div>
                    </div>
                  );
                })}
            </div>
          </CardContent>
        </Card>
      ))}

      <Card className="border-red-200 bg-red-50">
        <CardHeader>
          <CardTitle className="text-red-800">Required Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm text-red-700">
            <p>• Add {missingFields.length} missing fields to the mapping</p>
            <p>• Implement secondary insurance handling (conditional fields)</p>
            <p>• Add benefits verification workflow and real-time checks</p>
            <p>• Implement insurance card image upload functionality</p>
            <p>• Add prior authorization tracking and notifications</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};