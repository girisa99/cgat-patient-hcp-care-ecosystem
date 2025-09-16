import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, AlertCircle, Info } from 'lucide-react';

export const FinalSubmissionFieldComparison = () => {
  const currentMappedFields = [
    { key: 'final_review_complete', label: 'Final Review Complete', required: true, table: 'patient_enrollments' }
  ];

  const expectedOnlineFormFields = [
    // Review & Validation Sub-section
    { key: 'data_accuracy_confirmed', label: 'Data Accuracy Confirmed', required: true, category: 'Review & Validation' },
    { key: 'required_fields_complete', label: 'All Required Fields Complete', required: true, category: 'Review & Validation' },
    { key: 'insurance_verification_complete', label: 'Insurance Verification Complete', required: false, category: 'Review & Validation' },
    { key: 'provider_credentials_verified', label: 'Provider Credentials Verified', required: false, category: 'Review & Validation' },
    
    // Consent & Signatures Sub-section
    { key: 'patient_consent_obtained', label: 'Patient Consent Obtained', required: true, category: 'Consent & Signatures' },
    { key: 'provider_authorization_complete', label: 'Provider Authorization Complete', required: true, category: 'Consent & Signatures' },
    { key: 'hipaa_authorization_signed', label: 'HIPAA Authorization Signed', required: true, category: 'Consent & Signatures' },
    { key: 'treatment_consent_signed', label: 'Treatment Consent Signed', required: true, category: 'Consent & Signatures' },
    
    // Documentation Sub-section
    { key: 'supporting_documents_uploaded', label: 'Supporting Documents Uploaded', required: false, category: 'Documentation' },
    { key: 'insurance_cards_uploaded', label: 'Insurance Cards Uploaded', required: false, category: 'Documentation' },
    { key: 'referral_documents_attached', label: 'Referral Documents Attached', required: false, category: 'Documentation' },
    
    // Quality Assurance Sub-section
    { key: 'clinical_review_complete', label: 'Clinical Review Complete', required: false, category: 'Quality Assurance' },
    { key: 'administrative_review_complete', label: 'Administrative Review Complete', required: false, category: 'Quality Assurance' },
    { key: 'quality_score', label: 'Enrollment Quality Score', required: false, category: 'Quality Assurance' },
    
    // Submission Control Sub-section
    { key: 'final_review_complete', label: 'Final Review Complete', required: true, category: 'Submission Control' },
    { key: 'submit_enrollment', label: 'Submit Enrollment', required: true, category: 'Submission Control' },
    { key: 'submission_timestamp', label: 'Submission Timestamp', required: true, category: 'Submission Control' },
    { key: 'submission_id', label: 'Submission ID', required: true, category: 'Submission Control' },
    
    // Post-Submission Actions Sub-section
    { key: 'enrollment_pdf_generated', label: 'Enrollment PDF Generated', required: false, category: 'Post-Submission' },
    { key: 'provider_notification_sent', label: 'Provider Notification Sent', required: false, category: 'Post-Submission' },
    { key: 'patient_confirmation_sent', label: 'Patient Confirmation Sent', required: false, category: 'Post-Submission' },
    { key: 'next_steps_communicated', label: 'Next Steps Communicated', required: false, category: 'Post-Submission' },
    
    // Audit Trail Sub-section
    { key: 'enrollment_audit_trail', label: 'Enrollment Audit Trail', required: true, category: 'Audit Trail' },
    { key: 'data_integrity_verified', label: 'Data Integrity Verified', required: true, category: 'Audit Trail' },
    { key: 'compliance_check_passed', label: 'Compliance Check Passed', required: true, category: 'Audit Trail' }
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
            Final Submission Section Analysis
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
            <p>• Implement comprehensive pre-submission validation</p>
            <p>• Add consent and signature verification checks</p>
            <p>• Implement post-submission workflow automation</p>
            <p>• Add audit trail and compliance verification</p>
            <p>• Integrate with document generation and notification systems</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};