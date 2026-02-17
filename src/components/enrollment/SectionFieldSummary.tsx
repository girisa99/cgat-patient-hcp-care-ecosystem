import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, AlertCircle, XCircle } from 'lucide-react';

export const SectionFieldSummary = () => {
  const sectionsData = {
    'Provider & Treatment Center': {
      mapped: 2,
      total: 16,
      mappedFields: [
        'referring_provider_npi (Referring Provider NPI)',
        'facility_npi (Treatment Facility NPI)'
      ],
      missingFields: [
        'referring_provider_name (Referring Provider Name) *Required',
        'provider_license_number (Provider License Number) *Required',
        'provider_specialty (Provider Specialty) *Required',
        'provider_phone (Provider Phone) *Required',
        'provider_email (Provider Email)',
        'treatment_center_name (Treatment Center Name) *Required',
        'facility_license_number (Facility License Number) *Required',
        'facility_address (Facility Address) *Required',
        'facility_phone (Facility Phone) *Required',
        'facility_email (Facility Email)',
        'npi_verification_status (NPI Verification Status) *Required',
        'credentialing_status (Credentialing Status) *Required',
        'verification_date (Verification Date) *Required',
        'accreditation_status (Accreditation Status)'
      ]
    },
    'Insurance Information': {
      mapped: 4,
      total: 22,
      mappedFields: [
        'insurance_provider (Primary Insurance Provider)',
        'member_id (Member/Policy ID)',
        'group_number (Group Number)',
        'policy_holder (Policy Holder Name)'
      ],
      missingFields: [
        'policy_holder_dob (Policy Holder Date of Birth) *Required',
        'relationship_to_insured (Relationship to Insured) *Required',
        'insurance_phone (Insurance Customer Service Phone)',
        'effective_date (Coverage Effective Date)',
        'has_secondary_insurance (Has Secondary Insurance)',
        'secondary_insurance_provider (Secondary Insurance Provider)',
        'secondary_member_id (Secondary Member ID)',
        'secondary_group_number (Secondary Group Number)',
        'secondary_policy_holder (Secondary Policy Holder)',
        'benefits_verified (Benefits Verified)',
        'verification_date (Verification Date)',
        'copay_amount (Copay Amount)',
        'deductible_amount (Deductible Amount)',
        'coinsurance_percentage (Coinsurance Percentage)',
        'out_of_pocket_max (Out of Pocket Maximum)',
        'prior_authorization_required (Prior Authorization Required)',
        'insurance_card_front (Insurance Card Front Image)',
        'insurance_card_back (Insurance Card Back Image)'
      ]
    },
    'Clinical & Treatment': {
      mapped: 2,
      total: 27,
      mappedFields: [
        'primary_diagnosis (Primary Diagnosis/Chief Complaint)',
        'treatment_goals (Treatment Goals)'
      ],
      missingFields: [
        'secondary_diagnosis (Secondary Diagnosis)',
        'icd10_codes (ICD-10 Codes)',
        'symptom_severity (Symptom Severity 1-10) *Required',
        'duration_of_symptoms (Duration of Symptoms) *Required',
        'functional_impairment (Functional Impairment Level) *Required',
        'relevant_medical_history (Relevant Medical History)',
        'previous_treatments (Previous Treatments Tried)',
        'current_medications (Current Medications)',
        'allergies (Known Allergies)',
        'substance_use_history (Substance Use History)',
        'family_history (Relevant Family History)',
        'proposed_treatment_plan (Proposed Treatment Plan) *Required',
        'treatment_modality (Treatment Modality) *Required',
        'treatment_frequency (Treatment Frequency) *Required',
        'estimated_duration (Estimated Treatment Duration) *Required',
        'expected_outcomes (Expected Treatment Outcomes) *Required',
        'suicide_risk_assessment (Suicide Risk Assessment) *Required',
        'violence_risk_assessment (Violence Risk Assessment) *Required',
        'safety_plan_needed (Safety Plan Needed)',
        'emergency_contact_provider (Emergency Contact Provider)',
        'medication_management_needed (Medication Management Needed)',
        'prescribing_provider (Prescribing Provider)',
        'medication_compliance_history (Medication Compliance History)',
        'special_accommodations (Special Accommodations Needed)',
        'cultural_considerations (Cultural/Religious Considerations)'
      ]
    },
    'Final Submission': {
      mapped: 1,
      total: 23,
      mappedFields: [
        'final_review_complete (Final Review Complete)'
      ],
      missingFields: [
        'data_accuracy_confirmed (Data Accuracy Confirmed) *Required',
        'required_fields_complete (All Required Fields Complete) *Required',
        'insurance_verification_complete (Insurance Verification Complete)',
        'provider_credentials_verified (Provider Credentials Verified)',
        'patient_consent_obtained (Patient Consent Obtained) *Required',
        'provider_authorization_complete (Provider Authorization Complete) *Required',
        'hipaa_authorization_signed (HIPAA Authorization Signed) *Required',
        'treatment_consent_signed (Treatment Consent Signed) *Required',
        'supporting_documents_uploaded (Supporting Documents Uploaded)',
        'insurance_cards_uploaded (Insurance Cards Uploaded)',
        'referral_documents_attached (Referral Documents Attached)',
        'clinical_review_complete (Clinical Review Complete)',
        'administrative_review_complete (Administrative Review Complete)',
        'quality_score (Enrollment Quality Score)',
        'submit_enrollment (Submit Enrollment) *Required',
        'submission_timestamp (Submission Timestamp) *Required',
        'submission_id (Submission ID) *Required',
        'enrollment_pdf_generated (Enrollment PDF Generated)',
        'provider_notification_sent (Provider Notification Sent)',
        'patient_confirmation_sent (Patient Confirmation Sent)',
        'next_steps_communicated (Next Steps Communicated)',
        'enrollment_audit_trail (Enrollment Audit Trail) *Required'
      ]
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Patient Enrollment Form Field Mapping Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {Object.entries(sectionsData).map(([sectionName, data]) => {
              const completionRate = Math.round((data.mapped / data.total) * 100);
              
              return (
                <Card key={sectionName} className="border-l-4 border-l-blue-500">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{sectionName}</CardTitle>
                      <div className="flex items-center gap-2">
                        <Badge variant={completionRate > 50 ? "default" : "destructive"}>
                          {data.mapped}/{data.total} ({completionRate}%)
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Mapped Fields */}
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span className="font-medium text-green-600">Currently Mapped ({data.mapped})</span>
                      </div>
                      <div className="pl-6 space-y-1">
                        {data.mappedFields.map((field, index) => (
                          <div key={index} className="text-sm text-green-700 bg-green-50 p-2 rounded">
                            ✓ {field}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Missing Fields */}
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <XCircle className="h-4 w-4 text-red-600" />
                        <span className="font-medium text-red-600">Missing Fields ({data.missingFields.length})</span>
                      </div>
                      <div className="pl-6 space-y-1">
                        {data.missingFields.map((field, index) => (
                          <div key={index} className={`text-sm p-2 rounded ${
                            field.includes('*Required') 
                              ? 'text-red-700 bg-red-50 border-l-2 border-red-300' 
                              : 'text-orange-700 bg-orange-50'
                          }`}>
                            {field.includes('*Required') ? '⚠️' : '○'} {field}
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card className="border-amber-200 bg-amber-50">
        <CardHeader>
          <CardTitle className="text-amber-800">Overall Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            {Object.entries(sectionsData).map(([sectionName, data]) => (
              <div key={sectionName} className="bg-white p-3 rounded-lg border">
                <div className="text-sm font-medium text-gray-600 mb-1">{sectionName}</div>
                <div className="text-2xl font-bold text-amber-700">{data.mapped}/{data.total}</div>
                <div className="text-xs text-gray-500">
                  {Math.round((data.mapped / data.total) * 100)}% Complete
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};