/**
 * COMPLETE CLINICAL & TREATMENT ASSESSMENT FORM
 * All 27 fields from online form
 */
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Stethoscope, FileText, AlertTriangle, Shield, Plus, X } from 'lucide-react';
import type { CompleteClinicalTreatmentAssessment } from '@/types/completeEnrollmentMapping';

interface CompleteClinicalFormProps {
  formData: CompleteClinicalTreatmentAssessment;
  updateFormData: (field: keyof CompleteClinicalTreatmentAssessment, value: any) => void;
  readOnly?: boolean;
}

export const CompleteClinicalForm: React.FC<CompleteClinicalFormProps> = ({
  formData,
  updateFormData,
  readOnly = false
}) => {
  // Helper functions for array management
  const addToArray = (field: keyof CompleteClinicalTreatmentAssessment, newItem: string) => {
    const currentArray = (formData[field] as string[]) || [];
    updateFormData(field, [...currentArray, newItem]);
  };

  const removeFromArray = (field: keyof CompleteClinicalTreatmentAssessment, index: number) => {
    const currentArray = (formData[field] as string[]) || [];
    updateFormData(field, currentArray.filter((_, i) => i !== index));
  };

  const updateArrayItem = (field: keyof CompleteClinicalTreatmentAssessment, index: number, value: string) => {
    const currentArray = (formData[field] as string[]) || [];
    const updatedArray = [...currentArray];
    updatedArray[index] = value;
    updateFormData(field, updatedArray);
  };

  return (
    <div className="space-y-6">
      {/* Primary Diagnosis & Medical History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Stethoscope className="h-5 w-5" />
            Primary Diagnosis & Medical History
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="primaryDiagnosis">Primary Diagnosis *</Label>
              <Input
                id="primaryDiagnosis"
                value={formData.primaryDiagnosis}
                onChange={(e) => updateFormData('primaryDiagnosis', e.target.value)}
                disabled={readOnly}
                required
              />
            </div>
            <div>
              <Label htmlFor="primaryDiagnosisICD10">Primary Diagnosis ICD-10 Code *</Label>
              <Input
                id="primaryDiagnosisICD10"
                value={formData.primaryDiagnosisICD10}
                onChange={(e) => updateFormData('primaryDiagnosisICD10', e.target.value)}
                placeholder="C25.9, C78.00, etc."
                disabled={readOnly}
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="medicalHistory">Complete Medical History *</Label>
            <Textarea
              id="medicalHistory"
              value={formData.medicalHistory}
              onChange={(e) => updateFormData('medicalHistory', e.target.value)}
              placeholder="Include relevant medical history, previous treatments, surgeries, etc."
              className="min-h-[100px]"
              disabled={readOnly}
              required
            />
          </div>

          {/* Secondary Diagnoses */}
          <div>
            <Label>Secondary Diagnoses</Label>
            <div className="space-y-2">
              {(formData.secondaryDiagnoses || []).map((diagnosis, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    value={diagnosis}
                    onChange={(e) => updateArrayItem('secondaryDiagnoses', index, e.target.value)}
                    placeholder="Secondary diagnosis"
                    disabled={readOnly}
                  />
                  {!readOnly && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeFromArray('secondaryDiagnoses', index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
              {!readOnly && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => addToArray('secondaryDiagnoses', '')}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Secondary Diagnosis
                </Button>
              )}
            </div>
          </div>

          <div>
            <Label htmlFor="priorTreatmentHistory">Prior Treatment History</Label>
            <Textarea
              id="priorTreatmentHistory"
              value={formData.priorTreatmentHistory || ''}
              onChange={(e) => updateFormData('priorTreatmentHistory', e.target.value)}
              placeholder="Previous treatments, therapies, and outcomes"
              disabled={readOnly}
            />
          </div>
        </CardContent>
      </Card>

      {/* Current Medications & Allergies */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Current Medications & Allergies
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Current Medications */}
          <div>
            <Label>Current Medications *</Label>
            <div className="space-y-2">
              {(formData.currentMedications || []).map((medication, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    value={medication}
                    onChange={(e) => updateArrayItem('currentMedications', index, e.target.value)}
                    placeholder="Medication name, dose, frequency"
                    disabled={readOnly}
                  />
                  {!readOnly && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeFromArray('currentMedications', index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
              {!readOnly && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => addToArray('currentMedications', '')}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Medication
                </Button>
              )}
            </div>
          </div>

          {/* Allergies */}
          <div>
            <Label>Known Allergies *</Label>
            <div className="space-y-2">
              {(formData.allergies || []).map((allergy, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    value={allergy}
                    onChange={(e) => updateArrayItem('allergies', index, e.target.value)}
                    placeholder="Allergy and reaction type"
                    disabled={readOnly}
                  />
                  {!readOnly && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeFromArray('allergies', index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
              {!readOnly && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => addToArray('allergies', '')}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Allergy
                </Button>
              )}
            </div>
          </div>

          {/* Comorbidities */}
          <div>
            <Label>Comorbidities</Label>
            <div className="space-y-2">
              {(formData.comorbidities || []).map((comorbidity, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    value={comorbidity}
                    onChange={(e) => updateArrayItem('comorbidities', index, e.target.value)}
                    placeholder="Comorbid condition"
                    disabled={readOnly}
                  />
                  {!readOnly && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeFromArray('comorbidities', index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
              {!readOnly && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => addToArray('comorbidities', '')}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Comorbidity
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Treatment Planning */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Treatment Planning
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="treatmentGoals">Treatment Goals *</Label>
            <Textarea
              id="treatmentGoals"
              value={formData.treatmentGoals}
              onChange={(e) => updateFormData('treatmentGoals', e.target.value)}
              placeholder="Expected treatment outcomes and goals"
              className="min-h-[100px]"
              disabled={readOnly}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="expectedTreatmentDuration">Expected Treatment Duration</Label>
              <Input
                id="expectedTreatmentDuration"
                value={formData.expectedTreatmentDuration || ''}
                onChange={(e) => updateFormData('expectedTreatmentDuration', e.target.value)}
                placeholder="e.g., 6 months, ongoing"
                disabled={readOnly}
              />
            </div>
            <div>
              <Label htmlFor="treatmentSetting">Treatment Setting *</Label>
              <Select 
                value={formData.treatmentSetting} 
                onValueChange={(value) => updateFormData('treatmentSetting', value)}
                disabled={readOnly}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select setting" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="inpatient">Inpatient</SelectItem>
                  <SelectItem value="outpatient">Outpatient</SelectItem>
                  <SelectItem value="both">Both Inpatient/Outpatient</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="urgencyLevel">Treatment Urgency Level *</Label>
            <Select 
              value={formData.urgencyLevel} 
              onValueChange={(value) => updateFormData('urgencyLevel', value)}
              disabled={readOnly}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select urgency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="routine">Routine</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
                <SelectItem value="emergent">Emergent</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Therapy-Specific Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Therapy-Specific Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="therapyType">Therapy Type *</Label>
              <Input
                id="therapyType"
                value={formData.therapyType}
                onChange={(e) => updateFormData('therapyType', e.target.value)}
                placeholder="CAR-T, Gene Therapy, Immunotherapy, etc."
                disabled={readOnly}
                required
              />
            </div>
            <div>
              <Label htmlFor="productName">Product Name *</Label>
              <Input
                id="productName"
                value={formData.productName}
                onChange={(e) => updateFormData('productName', e.target.value)}
                placeholder="Specific product/drug name"
                disabled={readOnly}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="administrationRoute">Administration Route</Label>
              <Select 
                value={formData.administrationRoute || ''} 
                onValueChange={(value) => updateFormData('administrationRoute', value)}
                disabled={readOnly}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select route" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="intravenous">Intravenous</SelectItem>
                  <SelectItem value="subcutaneous">Subcutaneous</SelectItem>
                  <SelectItem value="intramuscular">Intramuscular</SelectItem>
                  <SelectItem value="oral">Oral</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="treatmentSchedule">Treatment Schedule</Label>
              <Input
                id="treatmentSchedule"
                value={formData.treatmentSchedule || ''}
                onChange={(e) => updateFormData('treatmentSchedule', e.target.value)}
                placeholder="Frequency and timing"
                disabled={readOnly}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="dosageInstructions">Dosage Instructions</Label>
            <Textarea
              id="dosageInstructions"
              value={formData.dosageInstructions || ''}
              onChange={(e) => updateFormData('dosageInstructions', e.target.value)}
              placeholder="Complete dosing information"
              disabled={readOnly}
            />
          </div>
        </CardContent>
      </Card>

      {/* Clinical Assessments */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Stethoscope className="h-5 w-5" />
            Clinical Assessments
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="performanceStatus">Performance Status</Label>
              <Input
                id="performanceStatus"
                value={formData.performanceStatus || ''}
                onChange={(e) => updateFormData('performanceStatus', e.target.value)}
                placeholder="ECOG, Karnofsky, etc."
                disabled={readOnly}
              />
            </div>
            <div>
              <Label htmlFor="biomarkerStatus">Biomarker Status</Label>
              <Input
                id="biomarkerStatus"
                value={formData.biomarkerStatus || ''}
                onChange={(e) => updateFormData('biomarkerStatus', e.target.value)}
                placeholder="Relevant biomarker results"
                disabled={readOnly}
              />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="priorAuthRequired"
              checked={formData.priorAuthRequired || false}
              onCheckedChange={(checked) => updateFormData('priorAuthRequired', checked)}
              disabled={readOnly}
            />
            <Label htmlFor="priorAuthRequired">Prior authorization required</Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="clinicalTrialEnrollment"
              checked={formData.clinicalTrialEnrollment || false}
              onCheckedChange={(checked) => updateFormData('clinicalTrialEnrollment', checked)}
              disabled={readOnly}
            />
            <Label htmlFor="clinicalTrialEnrollment">Patient enrolled in clinical trial</Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="consentFormsCompleted"
              checked={formData.consentFormsCompleted || false}
              onCheckedChange={(checked) => updateFormData('consentFormsCompleted', checked)}
              disabled={readOnly}
            />
            <Label htmlFor="consentFormsCompleted">All consent forms completed</Label>
          </div>
        </CardContent>
      </Card>

      {/* Safety & Monitoring */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Safety & Monitoring
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="emergencyProtocols">Emergency Protocols</Label>
            <Textarea
              id="emergencyProtocols"
              value={formData.emergencyProtocols || ''}
              onChange={(e) => updateFormData('emergencyProtocols', e.target.value)}
              placeholder="Emergency contact and response procedures"
              disabled={readOnly}
            />
          </div>

          <div>
            <Label htmlFor="physicianOrders">Physician Orders</Label>
            <Textarea
              id="physicianOrders"
              value={formData.physicianOrders || ''}
              onChange={(e) => updateFormData('physicianOrders', e.target.value)}
              placeholder="Specific physician orders and instructions"
              disabled={readOnly}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Default empty data helper
export const createEmptyCompleteClinicalData = (): CompleteClinicalTreatmentAssessment => ({
  primaryDiagnosis: '',
  primaryDiagnosisICD10: '',
  secondaryDiagnoses: [],
  medicalHistory: '',
  currentMedications: [],
  allergies: [],
  priorTreatmentHistory: '',
  treatmentGoals: '',
  expectedTreatmentDuration: '',
  treatmentSetting: 'outpatient',
  urgencyLevel: 'routine',
  therapyType: '',
  productName: '',
  ndcCodes: [],
  dosageInstructions: '',
  administrationRoute: '',
  treatmentSchedule: '',
  performanceStatus: '',
  comorbidities: [],
  labValues: {},
  biomarkerStatus: '',
  priorAuthRequired: false,
  contraindications: [],
  warningsAndPrecautions: [],
  monitoringRequirements: [],
  emergencyProtocols: '',
  clinicalTrialEnrollment: false,
  consentFormsCompleted: false,
  physicianOrders: ''
});