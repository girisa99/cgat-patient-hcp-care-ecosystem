import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, AlertCircle, Info } from 'lucide-react';

export const InsuranceInformationFieldComparison = () => {
  const currentMappedFields = [
    { key: 'insurance_provider', label: 'Insurance Provider', required: true, table: 'enrollment_insurance_info' },
    { key: 'member_id', label: 'Member ID', required: true, table: 'enrollment_insurance_info' },
    { key: 'group_number', label: 'Group Number', required: false, table: 'enrollment_insurance_info' },
    { key: 'policy_holder', label: 'Policy Holder Name', required: true, table: 'enrollment_insurance_info' }
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