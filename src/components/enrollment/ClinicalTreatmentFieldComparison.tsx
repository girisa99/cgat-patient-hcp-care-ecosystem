import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, AlertCircle, Info } from 'lucide-react';

export const ClinicalTreatmentFieldComparison = () => {
  const currentMappedFields = [
    { key: 'primary_diagnosis', label: 'Primary Diagnosis', required: true, table: 'enrollment_clinical_info' },
    { key: 'treatment_goals', label: 'Treatment Goals', required: true, table: 'enrollment_clinical_info' }
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