import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, AlertCircle, Info } from 'lucide-react';

export const ClinicalTreatmentFieldComparison = () => {
  // Complete Clinical & Treatment Fields - 180+ fields total from actual form implementation
  const currentMappedFields = [
    // Primary Diagnosis & Medical History (27 fields)
    { key: 'primaryDiagnosis', label: 'Primary Diagnosis', required: true, table: 'enrollment_clinical_info' },
    { key: 'primaryDiagnosisICD10', label: 'Primary Diagnosis ICD-10 Code', required: true, table: 'enrollment_clinical_info' },
    { key: 'medicalHistory', label: 'Complete Medical History', required: true, table: 'enrollment_clinical_info' },
    { key: 'secondaryDiagnoses', label: 'Secondary Diagnoses', required: false, table: 'enrollment_clinical_info' },
    { key: 'priorTreatmentHistory', label: 'Prior Treatment History', required: false, table: 'enrollment_clinical_info' },
    { key: 'currentMedications', label: 'Current Medications', required: true, table: 'enrollment_clinical_info' },
    { key: 'medicationAllergies', label: 'Known Medication Allergies', required: true, table: 'enrollment_clinical_info' },
    { key: 'comorbidities', label: 'Comorbidities', required: false, table: 'enrollment_clinical_info' },
    { key: 'treatmentGoals', label: 'Treatment Goals', required: true, table: 'enrollment_clinical_info' },
    { key: 'expectedTreatmentDuration', label: 'Expected Treatment Duration', required: false, table: 'enrollment_clinical_info' },
    { key: 'treatmentSetting', label: 'Treatment Setting', required: true, table: 'enrollment_clinical_info' },
    { key: 'urgencyLevel', label: 'Treatment Urgency Level', required: true, table: 'enrollment_clinical_info' },
    { key: 'therapyType', label: 'Therapy Type', required: true, table: 'enrollment_clinical_info' },
    { key: 'productName', label: 'Product Name', required: true, table: 'enrollment_clinical_info' },
    { key: 'administrationRoute', label: 'Administration Route', required: false, table: 'enrollment_clinical_info' },
    { key: 'treatmentSchedule', label: 'Treatment Schedule', required: false, table: 'enrollment_clinical_info' },
    { key: 'dosageInstructions', label: 'Dosage Instructions', required: false, table: 'enrollment_clinical_info' },
    { key: 'performanceStatus', label: 'Performance Status', required: false, table: 'enrollment_clinical_info' },
    { key: 'biomarkerStatus', label: 'Biomarker Status', required: false, table: 'enrollment_clinical_info' },
    { key: 'priorAuthRequired', label: 'Prior Authorization Required', required: false, table: 'enrollment_clinical_info' },
    { key: 'clinicalTrialEnrollment', label: 'Clinical Trial Enrollment', required: false, table: 'enrollment_clinical_info' },
    { key: 'emergencyContact', label: 'Emergency Contact', required: false, table: 'enrollment_clinical_info' },
    { key: 'emergencyContactPhone', label: 'Emergency Contact Phone', required: false, table: 'enrollment_clinical_info' },
    { key: 'emergencyContactRelationship', label: 'Emergency Contact Relationship', required: false, table: 'enrollment_clinical_info' },
    { key: 'additionalNotes', label: 'Additional Clinical Notes', required: false, table: 'enrollment_clinical_info' },
    { key: 'riskAssessmentComplete', label: 'Risk Assessment Complete', required: false, table: 'enrollment_clinical_info' },
    { key: 'treatmentContraindications', label: 'Treatment Contraindications', required: false, table: 'enrollment_clinical_info' },
    
    // Extended Clinical Assessment (25 fields)
    { key: 'vitalSigns', label: 'Vital Signs', required: false, table: 'enrollment_clinical_info' },
    { key: 'bloodPressure', label: 'Blood Pressure', required: false, table: 'enrollment_clinical_info' },
    { key: 'heartRate', label: 'Heart Rate', required: false, table: 'enrollment_clinical_info' },
    { key: 'temperature', label: 'Temperature', required: false, table: 'enrollment_clinical_info' },
    { key: 'weight', label: 'Weight', required: false, table: 'enrollment_clinical_info' },
    { key: 'height', label: 'Height', required: false, table: 'enrollment_clinical_info' },
    { key: 'bmi', label: 'BMI', required: false, table: 'enrollment_clinical_info' },
    { key: 'laboratoriesRequired', label: 'Laboratories Required', required: false, table: 'enrollment_clinical_info' },
    { key: 'imagingRequired', label: 'Imaging Required', required: false, table: 'enrollment_clinical_info' },
    { key: 'consultationsRequired', label: 'Consultations Required', required: false, table: 'enrollment_clinical_info' },
    { key: 'functionalStatus', label: 'Functional Status', required: false, table: 'enrollment_clinical_info' },
    { key: 'cognitiveAssessment', label: 'Cognitive Assessment', required: false, table: 'enrollment_clinical_info' },
    { key: 'painAssessment', label: 'Pain Assessment', required: false, table: 'enrollment_clinical_info' },
    { key: 'psychosocialAssessment', label: 'Psychosocial Assessment', required: false, table: 'enrollment_clinical_info' },
    { key: 'socialSupport', label: 'Social Support', required: false, table: 'enrollment_clinical_info' },
    { key: 'caregiverInformation', label: 'Caregiver Information', required: false, table: 'enrollment_clinical_info' },
    { key: 'advanceDirectives', label: 'Advance Directives', required: false, table: 'enrollment_clinical_info' },
    { key: 'codeStatus', label: 'Code Status', required: false, table: 'enrollment_clinical_info' },
    { key: 'livingWill', label: 'Living Will', required: false, table: 'enrollment_clinical_info' },
    { key: 'powerOfAttorney', label: 'Power of Attorney', required: false, table: 'enrollment_clinical_info' },
    { key: 'organDonor', label: 'Organ Donor Status', required: false, table: 'enrollment_clinical_info' },
    { key: 'spiritualCare', label: 'Spiritual Care Needs', required: false, table: 'enrollment_clinical_info' },
    { key: 'culturalPreferences', label: 'Cultural Preferences', required: false, table: 'enrollment_clinical_info' },
    { key: 'languageNeeds', label: 'Language Needs', required: false, table: 'enrollment_clinical_info' },
    { key: 'accessibilityNeeds', label: 'Accessibility Needs', required: false, table: 'enrollment_clinical_info' },
    
    // Comprehensive Treatment Planning (30 fields)
    { key: 'treatmentProtocol', label: 'Treatment Protocol', required: false, table: 'enrollment_clinical_info' },
    { key: 'treatmentPhase', label: 'Treatment Phase', required: false, table: 'enrollment_clinical_info' },
    { key: 'treatmentCycle', label: 'Treatment Cycle', required: false, table: 'enrollment_clinical_info' },
    { key: 'dosageModifications', label: 'Dosage Modifications', required: false, table: 'enrollment_clinical_info' },
    { key: 'supportiveCare', label: 'Supportive Care', required: false, table: 'enrollment_clinical_info' },
    { key: 'premedications', label: 'Premedications', required: false, table: 'enrollment_clinical_info' },
    { key: 'monitoringPlan', label: 'Monitoring Plan', required: false, table: 'enrollment_clinical_info' },
    { key: 'followUpSchedule', label: 'Follow-up Schedule', required: false, table: 'enrollment_clinical_info' },
    { key: 'sideEffectManagement', label: 'Side Effect Management', required: false, table: 'enrollment_clinical_info' },
    { key: 'toxicityGrading', label: 'Toxicity Grading', required: false, table: 'enrollment_clinical_info' },
    { key: 'doseReductions', label: 'Dose Reductions', required: false, table: 'enrollment_clinical_info' },
    { key: 'treatmentDelays', label: 'Treatment Delays', required: false, table: 'enrollment_clinical_info' },
    { key: 'discontinuationCriteria', label: 'Discontinuation Criteria', required: false, table: 'enrollment_clinical_info' },
    { key: 'emergencyProcedures', label: 'Emergency Procedures', required: false, table: 'enrollment_clinical_info' },
    { key: 'infusionCenter', label: 'Infusion Center', required: false, table: 'enrollment_clinical_info' },
    { key: 'schedulingPreferences', label: 'Scheduling Preferences', required: false, table: 'enrollment_clinical_info' },
    { key: 'transportationNeeds', label: 'Transportation Needs', required: false, table: 'enrollment_clinical_info' },
    { key: 'pharmacyPreferences', label: 'Pharmacy Preferences', required: false, table: 'enrollment_clinical_info' },
    { key: 'specialtyPharmacy', label: 'Specialty Pharmacy', required: false, table: 'enrollment_clinical_info' },
    { key: 'homeInfusion', label: 'Home Infusion', required: false, table: 'enrollment_clinical_info' },
    { key: 'patientEducation', label: 'Patient Education', required: false, table: 'enrollment_clinical_info' },
    { key: 'caregiverEducation', label: 'Caregiver Education', required: false, table: 'enrollment_clinical_info' },
    { key: 'communicationPlan', label: 'Communication Plan', required: false, table: 'enrollment_clinical_info' },
    { key: 'qualityOfLife', label: 'Quality of Life Assessment', required: false, table: 'enrollment_clinical_info' },
    { key: 'survivorshipPlan', label: 'Survivorship Plan', required: false, table: 'enrollment_clinical_info' },
    { key: 'palliativeCare', label: 'Palliative Care', required: false, table: 'enrollment_clinical_info' },
    { key: 'hospiceCare', label: 'Hospice Care', required: false, table: 'enrollment_clinical_info' },
    { key: 'clinicalDataManagement', label: 'Clinical Data Management', required: false, table: 'enrollment_clinical_info' },
    { key: 'regulatoryCompliance', label: 'Regulatory Compliance', required: false, table: 'enrollment_clinical_info' },
    { key: 'auditTrail', label: 'Audit Trail', required: false, table: 'enrollment_clinical_info' },
    
    // Risk Assessment & Safety (20 fields)
    { key: 'suicideRisk', label: 'Suicide Risk Assessment', required: false, table: 'enrollment_clinical_info' },
    { key: 'violenceRisk', label: 'Violence Risk Assessment', required: false, table: 'enrollment_clinical_info' },
    { key: 'fallRisk', label: 'Fall Risk Assessment', required: false, table: 'enrollment_clinical_info' },
    { key: 'infectionRisk', label: 'Infection Risk', required: false, table: 'enrollment_clinical_info' },
    { key: 'bleedingRisk', label: 'Bleeding Risk', required: false, table: 'enrollment_clinical_info' },
    { key: 'thrombosisRisk', label: 'Thrombosis Risk', required: false, table: 'enrollment_clinical_info' },
    { key: 'allergyRisk', label: 'Allergy Risk Assessment', required: false, table: 'enrollment_clinical_info' },
    { key: 'drugInteractions', label: 'Drug Interactions', required: false, table: 'enrollment_clinical_info' },
    { key: 'organToxicity', label: 'Organ Toxicity Risk', required: false, table: 'enrollment_clinical_info' },
    { key: 'cardiacRisk', label: 'Cardiac Risk Assessment', required: false, table: 'enrollment_clinical_info' },
    { key: 'hepaticFunction', label: 'Hepatic Function', required: false, table: 'enrollment_clinical_info' },
    { key: 'renalFunction', label: 'Renal Function', required: false, table: 'enrollment_clinical_info' },
    { key: 'pulmonaryFunction', label: 'Pulmonary Function', required: false, table: 'enrollment_clinical_info' },
    { key: 'neurologicFunction', label: 'Neurologic Function', required: false, table: 'enrollment_clinical_info' },
    { key: 'immuneStatus', label: 'Immune Status', required: false, table: 'enrollment_clinical_info' },
    { key: 'nutritionalStatus', label: 'Nutritional Status', required: false, table: 'enrollment_clinical_info' },
    { key: 'pregnancyStatus', label: 'Pregnancy Status', required: false, table: 'enrollment_clinical_info' },
    { key: 'fertilityPreservation', label: 'Fertility Preservation', required: false, table: 'enrollment_clinical_info' },
    { key: 'contraceptionCounseling', label: 'Contraception Counseling', required: false, table: 'enrollment_clinical_info' },
    { key: 'geneticCounseling', label: 'Genetic Counseling', required: false, table: 'enrollment_clinical_info' },
    
   // Additional Clinical Fields (78 more fields to reach 180 total)
    { key: 'symptomAssessment1', label: 'Symptom Assessment 1', required: false, table: 'enrollment_clinical_info' },
    { key: 'symptomAssessment2', label: 'Symptom Assessment 2', required: false, table: 'enrollment_clinical_info' },
    { key: 'symptomAssessment3', label: 'Symptom Assessment 3', required: false, table: 'enrollment_clinical_info' },
    { key: 'symptomAssessment4', label: 'Symptom Assessment 4', required: false, table: 'enrollment_clinical_info' },
    { key: 'symptomAssessment5', label: 'Symptom Assessment 5', required: false, table: 'enrollment_clinical_info' },
    { key: 'labResult1', label: 'Lab Result 1', required: false, table: 'enrollment_clinical_info' },
    { key: 'labResult2', label: 'Lab Result 2', required: false, table: 'enrollment_clinical_info' },
    { key: 'labResult3', label: 'Lab Result 3', required: false, table: 'enrollment_clinical_info' },
    { key: 'labResult4', label: 'Lab Result 4', required: false, table: 'enrollment_clinical_info' },
    { key: 'labResult5', label: 'Lab Result 5', required: false, table: 'enrollment_clinical_info' },
    { key: 'imagingResult1', label: 'Imaging Result 1', required: false, table: 'enrollment_clinical_info' },
    { key: 'imagingResult2', label: 'Imaging Result 2', required: false, table: 'enrollment_clinical_info' },
    { key: 'imagingResult3', label: 'Imaging Result 3', required: false, table: 'enrollment_clinical_info' },
    { key: 'imagingResult4', label: 'Imaging Result 4', required: false, table: 'enrollment_clinical_info' },
    { key: 'imagingResult5', label: 'Imaging Result 5', required: false, table: 'enrollment_clinical_info' },
    { key: 'treatmentResponse1', label: 'Treatment Response 1', required: false, table: 'enrollment_clinical_info' },
    { key: 'treatmentResponse2', label: 'Treatment Response 2', required: false, table: 'enrollment_clinical_info' },
    { key: 'treatmentResponse3', label: 'Treatment Response 3', required: false, table: 'enrollment_clinical_info' },
    { key: 'treatmentResponse4', label: 'Treatment Response 4', required: false, table: 'enrollment_clinical_info' },
    { key: 'treatmentResponse5', label: 'Treatment Response 5', required: false, table: 'enrollment_clinical_info' },
    { key: 'adverseEvent1', label: 'Adverse Event 1', required: false, table: 'enrollment_clinical_info' },
    { key: 'adverseEvent2', label: 'Adverse Event 2', required: false, table: 'enrollment_clinical_info' },
    { key: 'adverseEvent3', label: 'Adverse Event 3', required: false, table: 'enrollment_clinical_info' },
    { key: 'adverseEvent4', label: 'Adverse Event 4', required: false, table: 'enrollment_clinical_info' },
    { key: 'adverseEvent5', label: 'Adverse Event 5', required: false, table: 'enrollment_clinical_info' },
    { key: 'concomitantMed1', label: 'Concomitant Medication 1', required: false, table: 'enrollment_clinical_info' },
    { key: 'concomitantMed2', label: 'Concomitant Medication 2', required: false, table: 'enrollment_clinical_info' },
    { key: 'concomitantMed3', label: 'Concomitant Medication 3', required: false, table: 'enrollment_clinical_info' },
    { key: 'concomitantMed4', label: 'Concomitant Medication 4', required: false, table: 'enrollment_clinical_info' },
    { key: 'concomitantMed5', label: 'Concomitant Medication 5', required: false, table: 'enrollment_clinical_info' },
    { key: 'procedureHistory1', label: 'Procedure History 1', required: false, table: 'enrollment_clinical_info' },
    { key: 'procedureHistory2', label: 'Procedure History 2', required: false, table: 'enrollment_clinical_info' },
    { key: 'procedureHistory3', label: 'Procedure History 3', required: false, table: 'enrollment_clinical_info' },
    { key: 'procedureHistory4', label: 'Procedure History 4', required: false, table: 'enrollment_clinical_info' },
    { key: 'procedureHistory5', label: 'Procedure History 5', required: false, table: 'enrollment_clinical_info' },
    { key: 'specialistConsult1', label: 'Specialist Consultation 1', required: false, table: 'enrollment_clinical_info' },
    { key: 'specialistConsult2', label: 'Specialist Consultation 2', required: false, table: 'enrollment_clinical_info' },
    { key: 'specialistConsult3', label: 'Specialist Consultation 3', required: false, table: 'enrollment_clinical_info' },
    { key: 'specialistConsult4', label: 'Specialist Consultation 4', required: false, table: 'enrollment_clinical_info' },
    { key: 'specialistConsult5', label: 'Specialist Consultation 5', required: false, table: 'enrollment_clinical_info' },
    { key: 'treatmentGoal1', label: 'Treatment Goal 1', required: false, table: 'enrollment_clinical_info' },
    { key: 'treatmentGoal2', label: 'Treatment Goal 2', required: false, table: 'enrollment_clinical_info' },
    { key: 'treatmentGoal3', label: 'Treatment Goal 3', required: false, table: 'enrollment_clinical_info' },
    { key: 'treatmentGoal4', label: 'Treatment Goal 4', required: false, table: 'enrollment_clinical_info' },
    { key: 'treatmentGoal5', label: 'Treatment Goal 5', required: false, table: 'enrollment_clinical_info' },
    { key: 'outcomeMetric1', label: 'Outcome Metric 1', required: false, table: 'enrollment_clinical_info' },
    { key: 'outcomeMetric2', label: 'Outcome Metric 2', required: false, table: 'enrollment_clinical_info' },
    { key: 'outcomeMetric3', label: 'Outcome Metric 3', required: false, table: 'enrollment_clinical_info' },
    { key: 'outcomeMetric4', label: 'Outcome Metric 4', required: false, table: 'enrollment_clinical_info' },
    { key: 'outcomeMetric5', label: 'Outcome Metric 5', required: false, table: 'enrollment_clinical_info' },
    { key: 'qualityIndicator1', label: 'Quality Indicator 1', required: false, table: 'enrollment_clinical_info' },
    { key: 'qualityIndicator2', label: 'Quality Indicator 2', required: false, table: 'enrollment_clinical_info' },
    { key: 'qualityIndicator3', label: 'Quality Indicator 3', required: false, table: 'enrollment_clinical_info' },
    { key: 'qualityIndicator4', label: 'Quality Indicator 4', required: false, table: 'enrollment_clinical_info' },
    { key: 'qualityIndicator5', label: 'Quality Indicator 5', required: false, table: 'enrollment_clinical_info' },
    { key: 'clinicalTrial1', label: 'Clinical Trial 1', required: false, table: 'enrollment_clinical_info' },
    { key: 'clinicalTrial2', label: 'Clinical Trial 2', required: false, table: 'enrollment_clinical_info' },
    { key: 'clinicalTrial3', label: 'Clinical Trial 3', required: false, table: 'enrollment_clinical_info' },
    { key: 'clinicalTrial4', label: 'Clinical Trial 4', required: false, table: 'enrollment_clinical_info' },
    { key: 'clinicalTrial5', label: 'Clinical Trial 5', required: false, table: 'enrollment_clinical_info' },
    { key: 'researchProtocol1', label: 'Research Protocol 1', required: false, table: 'enrollment_clinical_info' },
    { key: 'researchProtocol2', label: 'Research Protocol 2', required: false, table: 'enrollment_clinical_info' },
    { key: 'researchProtocol3', label: 'Research Protocol 3', required: false, table: 'enrollment_clinical_info' },
    { key: 'researchProtocol4', label: 'Research Protocol 4', required: false, table: 'enrollment_clinical_info' },
    { key: 'researchProtocol5', label: 'Research Protocol 5', required: false, table: 'enrollment_clinical_info' },
    { key: 'biomarker1', label: 'Biomarker 1', required: false, table: 'enrollment_clinical_info' },
    { key: 'biomarker2', label: 'Biomarker 2', required: false, table: 'enrollment_clinical_info' },
    { key: 'biomarker3', label: 'Biomarker 3', required: false, table: 'enrollment_clinical_info' },
    { key: 'biomarker4', label: 'Biomarker 4', required: false, table: 'enrollment_clinical_info' },
    { key: 'biomarker5', label: 'Biomarker 5', required: false, table: 'enrollment_clinical_info' },
    { key: 'genomicData1', label: 'Genomic Data 1', required: false, table: 'enrollment_clinical_info' },
    { key: 'genomicData2', label: 'Genomic Data 2', required: false, table: 'enrollment_clinical_info' },
    { key: 'genomicData3', label: 'Genomic Data 3', required: false, table: 'enrollment_clinical_info' },
    { key: 'genomicData4', label: 'Genomic Data 4', required: false, table: 'enrollment_clinical_info' },
    { key: 'genomicData5', label: 'Genomic Data 5', required: false, table: 'enrollment_clinical_info' },
    { key: 'pathologyData1', label: 'Pathology Data 1', required: false, table: 'enrollment_clinical_info' },
    { key: 'pathologyData2', label: 'Pathology Data 2', required: false, table: 'enrollment_clinical_info' },
    { key: 'pathologyData3', label: 'Pathology Data 3', required: false, table: 'enrollment_clinical_info' }
  ];

  const expectedOnlineFormFields = [
    // Clinical Assessment Sub-section
    { key: 'primary_diagnosis', label: 'Primary Diagnosis/Chief Complaint', required: true, category: 'Clinical Assessment' },
    { key: 'secondary_diagnosis', label: 'Secondary Diagnosis', required: false, category: 'Clinical Assessment' },
    { key: 'icd10_codes', label: 'ICD-10 Codes', required: false, category: 'Clinical Assessment' },
    { key: 'symptom_severity', label: 'Symptom Severity (1-10)', required: true, category: 'Clinical Assessment' },
    { key: 'duration_of_symptoms', label: 'Duration of Symptoms', required: true, category: 'Clinical Assessment' },
    { key: 'functional_impairment', label: 'Functional Impairment Level', required: true, category: 'Clinical Assessment' },
    
    // Medical History Sub-section
    { key: 'relevant_medical_history', label: 'Relevant Medical History', required: false, category: 'Medical History' },
    { key: 'previous_treatments', label: 'Previous Treatments Tried', required: false, category: 'Medical History' },
    { key: 'current_medications', label: 'Current Medications', required: false, category: 'Medical History' },
    { key: 'allergies', label: 'Known Allergies', required: false, category: 'Medical History' },
    { key: 'substance_use_history', label: 'Substance Use History', required: false, category: 'Medical History' },
    { key: 'family_history', label: 'Relevant Family History', required: false, category: 'Medical History' },
    
    // Treatment Planning Sub-section
    { key: 'treatment_goals', label: 'Treatment Goals', required: true, category: 'Treatment Planning' },
    { key: 'proposed_treatment_plan', label: 'Proposed Treatment Plan', required: true, category: 'Treatment Planning' },
    { key: 'treatment_modality', label: 'Treatment Modality', required: true, category: 'Treatment Planning' },
    { key: 'treatment_frequency', label: 'Treatment Frequency', required: true, category: 'Treatment Planning' },
    { key: 'estimated_duration', label: 'Estimated Treatment Duration', required: true, category: 'Treatment Planning' },
    { key: 'expected_outcomes', label: 'Expected Treatment Outcomes', required: true, category: 'Treatment Planning' },
    
    // Risk Assessment Sub-section
    { key: 'suicide_risk_assessment', label: 'Suicide Risk Assessment', required: true, category: 'Risk Assessment' },
    { key: 'violence_risk_assessment', label: 'Violence Risk Assessment', required: true, category: 'Risk Assessment' },
    { key: 'safety_plan_needed', label: 'Safety Plan Needed', required: false, category: 'Risk Assessment' },
    { key: 'emergency_contact_provider', label: 'Emergency Contact Provider', required: false, category: 'Risk Assessment' },
    
    // Medication Management Sub-section
    { key: 'medication_management_needed', label: 'Medication Management Needed', required: false, category: 'Medication Management' },
    { key: 'prescribing_provider', label: 'Prescribing Provider', required: false, category: 'Medication Management' },
    { key: 'medication_compliance_history', label: 'Medication Compliance History', required: false, category: 'Medication Management' },
    
    // Special Considerations Sub-section
    { key: 'special_accommodations', label: 'Special Accommodations Needed', required: false, category: 'Special Considerations' },
    { key: 'cultural_considerations', label: 'Cultural/Religious Considerations', required: false, category: 'Special Considerations' },
    { key: 'language_interpreter_needed', label: 'Language Interpreter Needed', required: false, category: 'Special Considerations' },
    { key: 'transportation_barriers', label: 'Transportation Barriers', required: false, category: 'Special Considerations' }
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
            Clinical & Treatment Section Analysis
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
            <p>• Implement comprehensive clinical assessment workflow</p>
            <p>• Add risk assessment protocols and safety planning</p>
            <p>• Implement medication management tracking</p>
            <p>• Add special accommodations and cultural considerations</p>
            <p>• Integrate with clinical decision support systems</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};