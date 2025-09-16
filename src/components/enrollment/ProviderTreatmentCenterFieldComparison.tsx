import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, AlertCircle, Info } from 'lucide-react';

export const ProviderTreatmentCenterFieldComparison = () => {
  const currentMappedFields = [
    { key: 'referring_provider_npi', label: 'Referring Provider NPI', required: true, table: 'enrollment_provider_info' },
    { key: 'facility_npi', label: 'Treatment Facility NPI', required: false, table: 'enrollment_provider_info' }
  ];

  const expectedOnlineFormFields = [
    // Provider Information Sub-section
    { key: 'referring_provider_name', label: 'Referring Provider Name', required: true, category: 'Provider Info' },
    { key: 'referring_provider_npi', label: 'Referring Provider NPI', required: true, category: 'Provider Info' },
    { key: 'provider_license_number', label: 'Provider License Number', required: true, category: 'Provider Info' },
    { key: 'provider_specialty', label: 'Provider Specialty', required: true, category: 'Provider Info' },
    { key: 'provider_phone', label: 'Provider Phone', required: true, category: 'Provider Info' },
    { key: 'provider_email', label: 'Provider Email', required: false, category: 'Provider Info' },
    
    // Treatment Center Sub-section
    { key: 'treatment_center_name', label: 'Treatment Center Name', required: true, category: 'Treatment Center' },
    { key: 'facility_npi', label: 'Treatment Facility NPI', required: false, category: 'Treatment Center' },
    { key: 'facility_license_number', label: 'Facility License Number', required: true, category: 'Treatment Center' },
    { key: 'facility_address', label: 'Facility Address', required: true, category: 'Treatment Center' },
    { key: 'facility_phone', label: 'Facility Phone', required: true, category: 'Treatment Center' },
    { key: 'facility_email', label: 'Facility Email', required: false, category: 'Treatment Center' },
    
    // NPI Verification Sub-section
    { key: 'npi_verification_status', label: 'NPI Verification Status', required: true, category: 'Verification' },
    { key: 'credentialing_status', label: 'Credentialing Status', required: true, category: 'Verification' },
    { key: 'verification_date', label: 'Verification Date', required: true, category: 'Verification' },
    { key: 'accreditation_status', label: 'Accreditation Status', required: false, category: 'Verification' }
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
            Provider & Treatment Center Section Analysis
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
            <p>• Update destination table schema for comprehensive provider data</p>
            <p>• Implement NPI verification and credentialing checks</p>
            <p>• Add validation for license numbers and provider specialties</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};