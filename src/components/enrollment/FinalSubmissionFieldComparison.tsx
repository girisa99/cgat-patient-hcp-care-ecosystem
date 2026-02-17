import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, AlertCircle, Info } from 'lucide-react';

export const FinalSubmissionFieldComparison = () => {
  // Complete Final Submission Fields - All patient information permutations based on actual form implementation
  const currentMappedFields = [
    // Review & Verification (5 fields)
    { key: 'patientInformationReviewed', label: 'Patient Information Reviewed', required: true, table: 'enrollment_final_submission' },
    { key: 'providerInformationVerified', label: 'Provider Information Verified', required: true, table: 'enrollment_final_submission' },
    { key: 'insuranceInformationConfirmed', label: 'Insurance Information Confirmed', required: true, table: 'enrollment_final_submission' },
    { key: 'clinicalInformationValidated', label: 'Clinical Information Validated', required: true, table: 'enrollment_final_submission' },
    { key: 'treatmentPlanApproved', label: 'Treatment Plan Approved', required: true, table: 'enrollment_final_submission' },
    
    // Consents & Authorizations (8 fields)
    { key: 'consentToTreatment', label: 'Consent to Treatment', required: true, table: 'enrollment_final_submission' },
    { key: 'hipaaAuthorizationSigned', label: 'HIPAA Authorization Signed', required: true, table: 'enrollment_final_submission' },
    { key: 'financialResponsibilityAccepted', label: 'Financial Responsibility Accepted', required: true, table: 'enrollment_final_submission' },
    { key: 'communicationConsentProvided', label: 'Communication Consent Provided', required: false, table: 'enrollment_final_submission' },
    { key: 'marketingConsentGiven', label: 'Marketing Consent Given', required: false, table: 'enrollment_final_submission' },
    { key: 'researchConsentProvided', label: 'Research Consent Provided', required: false, table: 'enrollment_final_submission' },
    { key: 'dataShringConsent', label: 'Data Sharing Consent', required: false, table: 'enrollment_final_submission' },
    { key: 'teleHealthConsent', label: 'Telehealth Consent', required: false, table: 'enrollment_final_submission' },
    
    // Required Signatures (6 fields)
    { key: 'patientSignature', label: 'Patient Signature', required: true, table: 'enrollment_final_submission' },
    { key: 'patientSignatureDate', label: 'Patient Signature Date', required: true, table: 'enrollment_final_submission' },
    { key: 'providerSignature', label: 'Provider Signature', required: true, table: 'enrollment_final_submission' },
    { key: 'providerSignatureDate', label: 'Provider Signature Date', required: true, table: 'enrollment_final_submission' },
    { key: 'witnessSignature', label: 'Witness Signature', required: false, table: 'enrollment_final_submission' },
    { key: 'witnessSignatureDate', label: 'Witness Signature Date', required: false, table: 'enrollment_final_submission' },
    
    // Submission Details (10 fields)
    { key: 'submissionDate', label: 'Submission Date', required: true, table: 'enrollment_final_submission' },
    { key: 'submittedBy', label: 'Submitted By', required: true, table: 'enrollment_final_submission' },
    { key: 'submissionMethod', label: 'Submission Method', required: true, table: 'enrollment_final_submission' },
    { key: 'confirmationNumber', label: 'Confirmation Number', required: false, table: 'enrollment_final_submission' },
    { key: 'urgentProcessingRequested', label: 'Urgent Processing Requested', required: false, table: 'enrollment_final_submission' },
    { key: 'followUpRequired', label: 'Follow-up Required', required: false, table: 'enrollment_final_submission' },
    { key: 'specialInstructions', label: 'Special Instructions', required: false, table: 'enrollment_final_submission' },
    { key: 'notesForProcessing', label: 'Notes for Processing Team', required: false, table: 'enrollment_final_submission' },
    { key: 'priorityLevel', label: 'Priority Level', required: false, table: 'enrollment_final_submission' },
    { key: 'estimatedProcessingTime', label: 'Estimated Processing Time', required: false, table: 'enrollment_final_submission' },
    
    // All Patient Information Permutations (20 fields from consent management)
    { key: 'patientFirstName', label: 'Patient First Name', required: true, table: 'enrollment_final_submission' },
    { key: 'patientLastName', label: 'Patient Last Name', required: true, table: 'enrollment_final_submission' },
    { key: 'patientMiddleName', label: 'Patient Middle Name', required: false, table: 'enrollment_final_submission' },
    { key: 'patientDateOfBirth', label: 'Patient Date of Birth', required: true, table: 'enrollment_final_submission' },
    { key: 'patientGender', label: 'Patient Gender', required: true, table: 'enrollment_final_submission' },
    { key: 'patientSSN', label: 'Patient SSN', required: true, table: 'enrollment_final_submission' },
    { key: 'patientPhone', label: 'Patient Phone', required: true, table: 'enrollment_final_submission' },
    { key: 'patientEmail', label: 'Patient Email', required: true, table: 'enrollment_final_submission' },
    { key: 'patientAddress', label: 'Patient Address', required: true, table: 'enrollment_final_submission' },
    { key: 'patientCity', label: 'Patient City', required: true, table: 'enrollment_final_submission' },
    { key: 'patientState', label: 'Patient State', required: true, table: 'enrollment_final_submission' },
    { key: 'patientZipCode', label: 'Patient Zip Code', required: true, table: 'enrollment_final_submission' },
    { key: 'patientCountry', label: 'Patient Country', required: false, table: 'enrollment_final_submission' },
    { key: 'patientEmergencyContact', label: 'Patient Emergency Contact', required: true, table: 'enrollment_final_submission' },
    { key: 'patientEmergencyContactPhone', label: 'Patient Emergency Contact Phone', required: true, table: 'enrollment_final_submission' },
    { key: 'patientEmergencyContactRelationship', label: 'Patient Emergency Contact Relationship', required: true, table: 'enrollment_final_submission' },
    { key: 'patientPreferredLanguage', label: 'Patient Preferred Language', required: false, table: 'enrollment_final_submission' },
    { key: 'patientRace', label: 'Patient Race', required: false, table: 'enrollment_final_submission' },
    { key: 'patientEthnicity', label: 'Patient Ethnicity', required: false, table: 'enrollment_final_submission' },
    { key: 'patientMaritalStatus', label: 'Patient Marital Status', required: false, table: 'enrollment_final_submission' },
    
    // Provider Information Summary (15 fields)
    { key: 'primaryProviderName', label: 'Primary Provider Name', required: true, table: 'enrollment_final_submission' },
    { key: 'primaryProviderNPI', label: 'Primary Provider NPI', required: true, table: 'enrollment_final_submission' },
    { key: 'primaryProviderPhone', label: 'Primary Provider Phone', required: true, table: 'enrollment_final_submission' },
    { key: 'primaryProviderEmail', label: 'Primary Provider Email', required: false, table: 'enrollment_final_submission' },
    { key: 'treatmentCenterName', label: 'Treatment Center Name', required: true, table: 'enrollment_final_submission' },
    { key: 'treatmentCenterNPI', label: 'Treatment Center NPI', required: true, table: 'enrollment_final_submission' },
    { key: 'treatmentCenterAddress', label: 'Treatment Center Address', required: true, table: 'enrollment_final_submission' },
    { key: 'treatmentCenterPhone', label: 'Treatment Center Phone', required: true, table: 'enrollment_final_submission' },
    { key: 'treatmentCenterType', label: 'Treatment Center Type', required: true, table: 'enrollment_final_submission' },
    { key: 'treatmentCenterSpecialty', label: 'Treatment Center Specialty', required: true, table: 'enrollment_final_submission' },
    { key: 'referringProviderName', label: 'Referring Provider Name', required: false, table: 'enrollment_final_submission' },
    { key: 'referringProviderNPI', label: 'Referring Provider NPI', required: false, table: 'enrollment_final_submission' },
    { key: 'coordinatingNurse', label: 'Coordinating Nurse', required: false, table: 'enrollment_final_submission' },
    { key: 'caseManager', label: 'Case Manager', required: false, table: 'enrollment_final_submission' },
    { key: 'socialWorker', label: 'Social Worker', required: false, table: 'enrollment_final_submission' },
    
    // Insurance Summary (15 fields)
    { key: 'primaryInsuranceName', label: 'Primary Insurance Name', required: true, table: 'enrollment_final_submission' },
    { key: 'primaryInsuranceMemberID', label: 'Primary Insurance Member ID', required: true, table: 'enrollment_final_submission' },
    { key: 'primaryInsuranceGroupNumber', label: 'Primary Insurance Group Number', required: false, table: 'enrollment_final_submission' },
    { key: 'primaryInsurancePolicyHolder', label: 'Primary Insurance Policy Holder', required: true, table: 'enrollment_final_submission' },
    { key: 'primaryInsuranceRelationship', label: 'Primary Insurance Relationship', required: true, table: 'enrollment_final_submission' },
    { key: 'secondaryInsuranceName', label: 'Secondary Insurance Name', required: false, table: 'enrollment_final_submission' },
    { key: 'secondaryInsuranceMemberID', label: 'Secondary Insurance Member ID', required: false, table: 'enrollment_final_submission' },
    { key: 'benefitsVerificationStatus', label: 'Benefits Verification Status', required: true, table: 'enrollment_final_submission' },
    { key: 'benefitsVerificationDate', label: 'Benefits Verification Date', required: false, table: 'enrollment_final_submission' },
    { key: 'priorAuthorizationStatus', label: 'Prior Authorization Status', required: false, table: 'enrollment_final_submission' },
    { key: 'priorAuthorizationNumber', label: 'Prior Authorization Number', required: false, table: 'enrollment_final_submission' },
    { key: 'estimatedPatientCost', label: 'Estimated Patient Cost', required: false, table: 'enrollment_final_submission' },
    { key: 'deductibleAmount', label: 'Deductible Amount', required: false, table: 'enrollment_final_submission' },
    { key: 'copayAmount', label: 'Copay Amount', required: false, table: 'enrollment_final_submission' },
    { key: 'coinsurancePercentage', label: 'Coinsurance Percentage', required: false, table: 'enrollment_final_submission' },
    
    // Clinical Summary (25 fields)  
    { key: 'primaryDiagnosisSummary', label: 'Primary Diagnosis Summary', required: true, table: 'enrollment_final_submission' },
    { key: 'primaryDiagnosisICD10Summary', label: 'Primary Diagnosis ICD-10 Summary', required: true, table: 'enrollment_final_submission' },
    { key: 'secondaryDiagnosesSummary', label: 'Secondary Diagnoses Summary', required: false, table: 'enrollment_final_submission' },
    { key: 'treatmentGoalsSummary', label: 'Treatment Goals Summary', required: true, table: 'enrollment_final_submission' },
    { key: 'proposedTreatmentPlan', label: 'Proposed Treatment Plan', required: true, table: 'enrollment_final_submission' },
    { key: 'treatmentTypeSummary', label: 'Treatment Type Summary', required: true, table: 'enrollment_final_submission' },
    { key: 'treatmentSettingSummary', label: 'Treatment Setting Summary', required: true, table: 'enrollment_final_submission' },
    { key: 'estimatedTreatmentDuration', label: 'Estimated Treatment Duration', required: false, table: 'enrollment_final_submission' },
    { key: 'currentMedicationsSummary', label: 'Current Medications Summary', required: false, table: 'enrollment_final_submission' },
    { key: 'allergiesSummary', label: 'Allergies Summary', required: false, table: 'enrollment_final_submission' },
    { key: 'riskAssessmentSummary', label: 'Risk Assessment Summary', required: false, table: 'enrollment_final_submission' },
    { key: 'performanceStatus', label: 'Performance Status', required: false, table: 'enrollment_final_submission' },
    { key: 'functionalStatus', label: 'Functional Status', required: false, table: 'enrollment_final_submission' },
    { key: 'priorTreatmentHistory', label: 'Prior Treatment History', required: false, table: 'enrollment_final_submission' },
    { key: 'treatmentResponseHistory', label: 'Treatment Response History', required: false, table: 'enrollment_final_submission' },
    { key: 'biomarkerResults', label: 'Biomarker Results', required: false, table: 'enrollment_final_submission' },
    { key: 'genomicTestingResults', label: 'Genomic Testing Results', required: false, table: 'enrollment_final_submission' },
    { key: 'pathologyResults', label: 'Pathology Results', required: false, table: 'enrollment_final_submission' },
    { key: 'imagingResults', label: 'Imaging Results', required: false, table: 'enrollment_final_submission' },
    { key: 'laboratoryResults', label: 'Laboratory Results', required: false, table: 'enrollment_final_submission' },
    { key: 'vitalSignsSummary', label: 'Vital Signs Summary', required: false, table: 'enrollment_final_submission' },
    { key: 'comorbidityAssessment', label: 'Comorbidity Assessment', required: false, table: 'enrollment_final_submission' },
    { key: 'psychosocialAssessment', label: 'Psychosocial Assessment', required: false, table: 'enrollment_final_submission' },
    { key: 'nutritionalAssessment', label: 'Nutritional Assessment', required: false, table: 'enrollment_final_submission' },
    { key: 'specialConsiderations', label: 'Special Considerations', required: false, table: 'enrollment_final_submission' },
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