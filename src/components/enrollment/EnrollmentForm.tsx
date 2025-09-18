import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Switch } from "@/components/ui/switch";
import { CalendarDays, AlertTriangle, CheckCircle, Expand, Minimize, Settings } from "lucide-react";
import { getExpandedFields, calculateSectionCompletion, FIELD_EXPANSION_RULES } from "@/utils/conditionalFieldExpansion";
import { ENHANCED_FIELD_EXPANSION_RULES } from "@/utils/extendedConditionalFields";
import { ConditionalFieldRenderer } from './ConditionalFieldRenderer';

interface EnrollmentFormProps {
  step: string;
  fields: string[];
  requiredFields: string[];
  initialData: Record<string, any>;
  onSubmit: (data: Record<string, any>) => void;
  onPrevious?: () => void;
  isLoading?: boolean;
  checkCompletion?: (data: Record<string, any>) => boolean;
  enableConditionalFields?: boolean;
  sectionKey?: string;
}

export const EnrollmentForm: React.FC<EnrollmentFormProps> = ({
  step,
  fields,
  requiredFields,
  initialData,
  onSubmit,
  onPrevious,
  isLoading = false,
  checkCompletion,
  enableConditionalFields = true,
  sectionKey
}) => {
  const [formData, setFormData] = useState<Record<string, any>>(initialData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showExpandedFields, setShowExpandedFields] = useState(true);
  const [showOptionalProviderFields, setShowOptionalProviderFields] = useState(false);

  // Update form data when initialData changes
  useEffect(() => {
    setFormData(initialData);
  }, [initialData]);

  // Get conditional fields based on current form data
  const getCombinedExpandedFields = (sectionKey: string, formData: Record<string, any>) => {
    // Get basic conditional fields
    const basicExpansion = getExpandedFields(sectionKey, formData);
    
    // Get enhanced conditional fields
    const enhancedRules = ENHANCED_FIELD_EXPANSION_RULES.find(rule => rule.section === sectionKey);
    let enhancedFields: string[] = [];
    let enhancedRequired: string[] = [];
    
    if (enhancedRules) {
      enhancedRules.scenarios.forEach(scenario => {
        const conditionsMet = Object.entries(scenario.conditions).every(([key, expectedValue]) => {
          const formValue = formData[key];
          
          if (Array.isArray(expectedValue)) {
            return expectedValue.includes(formValue);
          }
          
          if (typeof expectedValue === 'boolean') {
            return !!formValue === expectedValue;
          }
          
          return formValue === expectedValue;
        });
        
        if (conditionsMet) {
          enhancedFields.push(...scenario.additionalFields);
          enhancedRequired.push(...scenario.requiredFields);
        }
      });
    }
    
    // Combine all fields
    const allFields = [...new Set([...basicExpansion.fields, ...enhancedFields])];
    const allRequired = [...new Set([...basicExpansion.requiredFields, ...enhancedRequired])];
    
    return { fields: allFields, requiredFields: allRequired };
  };

  const { fields: expandedFields, requiredFields: conditionalRequired } = enableConditionalFields && sectionKey 
    ? getCombinedExpandedFields(sectionKey, formData) 
    : { fields: fields, requiredFields: [] };

  // Combine original and conditional fields
  const activeFields = enableConditionalFields && sectionKey ? expandedFields : fields;
  const allRequiredFields = [...requiredFields, ...conditionalRequired];

  // Calculate section completion
  const sectionCompletion = enableConditionalFields && sectionKey 
    ? calculateSectionCompletion(sectionKey, formData)
    : null;

  // Field configurations for smart rendering
  const getFieldConfig = (fieldKey: string) => {
    const configs: Record<string, any> = {
      // Consent fields
      consent_treatment: { type: 'checkbox', label: 'Treatment Consent', description: 'I consent to receive treatment' },
      consent_privacy: { type: 'checkbox', label: 'Privacy Consent', description: 'I consent to privacy practices' },
      consent_communication: { type: 'checkbox', label: 'Communication Consent', description: 'I consent to communications' },
      collection_method: { 
        type: 'select', 
        label: 'Collection Method',
        options: ['digital', 'phone', 'paper']
      },
      
      // Patient fields
      patient_first_name: { type: 'text', label: 'First Name' },
      patient_last_name: { type: 'text', label: 'Last Name' },
      patient_dob: { type: 'date', label: 'Date of Birth' },
      patient_phone: { type: 'tel', label: 'Phone Number' },
      patient_email: { type: 'email', label: 'Email Address' },
      patient_address: { type: 'textarea', label: 'Address' },
      emergency_contact_name: { type: 'text', label: 'Emergency Contact Name' },
      emergency_contact_phone: { type: 'tel', label: 'Emergency Contact Phone' },
      
      // Provider and Treatment Center fields (now optional) 
      treatment_center_id: { type: 'custom', label: 'Treatment Center (Optional)' },
      provider_id: { type: 'custom', label: 'Healthcare Provider (Optional)' },
      
      // Provider fields
      provider_specialty: { type: 'text', label: 'Provider Specialty' },
      provider_phone: { type: 'tel', label: 'Provider Phone' },
      provider_email: { type: 'email', label: 'Provider Email' },
      
      // Insurance fields
      insurance_provider: { type: 'text', label: 'Insurance Provider' },
      insurance_policy_number: { type: 'text', label: 'Policy Number' },
      insurance_group_number: { type: 'text', label: 'Group Number' },
      insurance_subscriber_name: { type: 'text', label: 'Subscriber Name' },
      
      // Treatment fields
      treatment_type: { 
        type: 'select', 
        label: 'Treatment Type',
        options: ['inpatient', 'outpatient', 'intensive_outpatient', 'partial_hospitalization']
      },
      treatment_frequency: { type: 'text', label: 'Treatment Frequency' },
      treatment_start_date: { type: 'date', label: 'Treatment Start Date' },
      
      // Clinical fields
      primary_diagnosis: { type: 'text', label: 'Primary Diagnosis' },
      medical_history: { type: 'textarea', label: 'Medical History' },
      current_medications: { type: 'textarea', label: 'Current Medications' },
      allergies: { type: 'textarea', label: 'Allergies' },
      treatment_goals: { type: 'textarea', label: 'Treatment Goals' },
      physician_name: { type: 'text', label: 'Referring Physician' },
      
      // Signature fields
      patient_signature: { type: 'text', label: 'Patient Signature' },
      provider_signature: { type: 'text', label: 'Provider Signature' },
      final_patient_signature: { type: 'text', label: 'Final Patient Signature' },
      signature_date: { type: 'date', label: 'Signature Date' },
      submission_notes: { type: 'textarea', label: 'Submission Notes' },

      // Conditional consent fields
      telehealth_consent: { type: 'checkbox', label: 'Telehealth Consent', description: 'I consent to receive telehealth services' },
      technology_consent: { type: 'checkbox', label: 'Technology Consent', description: 'I consent to use of technology platforms' },
      recording_consent: { type: 'checkbox', label: 'Recording Consent', description: 'I consent to session recordings' },
      research_consent: { type: 'checkbox', label: 'Research Consent', description: 'I consent to participate in research' },
      
      // Conditional provider fields
      secondary_provider_name: { type: 'text', label: 'Secondary Provider Name' },
      secondary_provider_npi: { type: 'text', label: 'Secondary Provider NPI', pattern: '[0-9]{10}' },
      care_coordinator_name: { type: 'text', label: 'Care Coordinator Name' },
      treatment_center_name: { type: 'text', label: 'Treatment Center Name' },
      treatment_center_npi: { type: 'text', label: 'Treatment Center NPI', pattern: '[0-9]{10}' },
      level_of_care: { 
        type: 'select', 
        label: 'Level of Care',
        options: ['outpatient', 'intensive_outpatient', 'partial_hospitalization', 'inpatient', 'residential']
      },
      
      // Conditional insurance fields
      secondary_insurance_provider: { type: 'text', label: 'Secondary Insurance Provider' },
      secondary_policy_number: { type: 'text', label: 'Secondary Policy Number' },
      coordination_of_benefits: { 
        type: 'select', 
        label: 'Coordination of Benefits',
        options: ['primary_secondary', 'secondary_primary', 'split_billing']
      },
      medicare_part_a: { type: 'checkbox', label: 'Medicare Part A', description: 'Hospital insurance coverage' },
      medicare_part_b: { type: 'checkbox', label: 'Medicare Part B', description: 'Medical insurance coverage' },
      
      // Conditional clinical fields
      secondary_diagnosis: { type: 'text', label: 'Secondary Diagnosis' },
      chronic_conditions_list: { type: 'textarea', label: 'Chronic Conditions List' },
      psychiatric_history: { type: 'textarea', label: 'Psychiatric History' },
      substance_use_history: { type: 'textarea', label: 'Substance Use History' },
      // Enhanced insurance fields
      insurance_type: { 
        type: 'select', 
        label: 'Insurance Type',
        options: ['commercial', 'medicare', 'medicaid', 'va_benefits', 'self_pay']
      },
      dual_eligible: { type: 'checkbox', label: 'Dual Eligible (Medicare & Medicaid)', description: 'Check if eligible for both Medicare and Medicaid' },
      medicare_part_a_effective_date: { type: 'date', label: 'Medicare Part A Effective Date' },
      medicare_part_b_effective_date: { type: 'date', label: 'Medicare Part B Effective Date' },
      medicare_beneficiary_id: { type: 'text', label: 'Medicare Beneficiary ID' },
      medicaid_recipient_id: { type: 'text', label: 'Medicaid Recipient ID' },
      state_medicaid_program: { type: 'text', label: 'State Medicaid Program' },
      employer_group_name: { type: 'text', label: 'Employer Group Name' },
      deductible_amount: { type: 'text', label: 'Deductible Amount' },
      pharmacy_benefit_manager_name: { type: 'text', label: 'Pharmacy Benefit Manager' },
      pharmacy_member_id_number: { type: 'text', label: 'Pharmacy Member ID' },
      
      // Enhanced clinical fields
      primary_substance_used: { 
        type: 'select', 
        label: 'Primary Substance Used',
        options: ['alcohol', 'opioids', 'cocaine', 'methamphetamine', 'marijuana', 'prescription_drugs', 'other']
      },
      last_use_date: { type: 'date', label: 'Date of Last Use' },
      addiction_severity_index_score: { type: 'text', label: 'Addiction Severity Index Score' },
      psychiatric_diagnosis_history: { type: 'textarea', label: 'Psychiatric Diagnosis History' },
      current_mood_symptoms: { type: 'textarea', label: 'Current Mood Symptoms' },
      suicide_attempt_history: { 
        type: 'select', 
        label: 'Suicide Attempt History',
        options: ['none', 'past_attempts', 'recent_ideation', 'current_risk']
      },
      pain_onset_date: { type: 'date', label: 'Pain Onset Date' },
      pain_intensity_current: { 
        type: 'select', 
        label: 'Current Pain Intensity (0-10)',
        options: ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10']
      },
      pain_location_primary: { type: 'text', label: 'Primary Pain Location' },
      mini_mental_state_exam_score: { type: 'text', label: 'Mini Mental State Exam Score' },
      activities_daily_living_score: { type: 'text', label: 'Activities of Daily Living Score' },
      fall_risk_assessment: { 
        type: 'select', 
        label: 'Fall Risk Assessment',
        options: ['low', 'moderate', 'high', 'very_high']
      },
      
      // Enhanced provider fields
      primary_care_physician_name: { type: 'text', label: 'Primary Care Physician Name' },
      case_manager_name: { type: 'text', label: 'Case Manager Name' },
      treatment_center_license_number: { type: 'text', label: 'Treatment Center License Number' },
      medical_director_name: { type: 'text', label: 'Medical Director Name' }
    };
    
    return configs[fieldKey] || { type: 'text', label: fieldKey.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) };
  };

  const handleInputChange = (fieldKey: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [fieldKey]: value
    }));
    
    // Clear error when user starts typing
    if (errors[fieldKey]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[fieldKey];
        return newErrors;
      });
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    allRequiredFields.forEach(field => {
      if (!formData[field] || formData[field].toString().trim() === '') {
        const config = getFieldConfig(field);
        newErrors[field] = `${config.label} is required`;
      }
    });
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  const renderField = (fieldKey: string) => {
    const config = getFieldConfig(fieldKey);
    const isRequired = allRequiredFields.includes(fieldKey);
    const hasError = errors[fieldKey];
    const value = formData[fieldKey] || '';
    const isConditional = enableConditionalFields && !fields.includes(fieldKey);

    // Use ConditionalFieldRenderer for special fields
    if (['treatment_center_id', 'provider_id', 'collection_method', 'consent_treatment', 'consent_privacy', 'consent_communication'].includes(fieldKey)) {
      return (
        <ConditionalFieldRenderer
          key={fieldKey}
          fieldKey={fieldKey}
          value={value}
          onChange={handleInputChange}  
          formData={formData}
          showOptionalFields={showOptionalProviderFields}
        />
      );
    }

    // Skip auto-populated fields that are handled by selectors
    if (['treatment_center', 'treatment_center_npi', 'provider_name', 'provider_npi'].includes(fieldKey) && 
        (formData.treatment_center_id || formData.provider_id)) {
      return null;
    }

    const commonProps = {
      id: fieldKey,
      required: isRequired,
      className: hasError ? "border-red-500" : ""
    };

    switch (config.type) {
      case 'custom':
        // Handle custom field types (treatment center, provider selectors)
        return (
          <ConditionalFieldRenderer
            key={fieldKey}
            fieldKey={fieldKey}
            value={value}
            onChange={handleInputChange}  
            formData={formData}
            showOptionalFields={showOptionalProviderFields}
          />
        );
        
      case 'checkbox':
        return (
          <div key={fieldKey} className={`flex items-start space-x-3 p-4 border rounded-lg ${isConditional ? 'border-blue-200 bg-blue-50/30' : ''}`}>
            <Checkbox
              {...commonProps}
              checked={!!value}
              onCheckedChange={(checked) => handleInputChange(fieldKey, checked)}
            />
            <div className="space-y-1">
              <Label htmlFor={fieldKey} className="text-sm font-medium">
                {config.label} 
                {isRequired && <span className="text-red-500">*</span>}
                {isConditional && <span className="text-blue-500 text-xs ml-2">(conditional)</span>}
              </Label>
              {config.description && (
                <p className="text-xs text-gray-600">{config.description}</p>
              )}
            </div>
          </div>
        );
        
      case 'select':
        return (
          <div key={fieldKey} className="space-y-2">
            <Label htmlFor={fieldKey}>
              {config.label} {isRequired && <span className="text-red-500">*</span>}
            </Label>
            <Select value={value} onValueChange={(val) => handleInputChange(fieldKey, val)}>
              <SelectTrigger className={hasError ? "border-red-500" : ""}>
                <SelectValue placeholder={`Select ${config.label}`} />
              </SelectTrigger>
              <SelectContent>
                {config.options.map((option: string) => (
                  <SelectItem key={option} value={option}>
                    {option.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {hasError && <p className="text-sm text-red-500">{hasError}</p>}
          </div>
        );
        
      case 'textarea':
        return (
          <div key={fieldKey} className={`space-y-2 ${isConditional ? 'p-3 border border-blue-200 rounded-lg bg-blue-50/20' : ''}`}>
            <Label htmlFor={fieldKey}>
              {config.label} 
              {isRequired && <span className="text-red-500">*</span>}
              {isConditional && <span className="text-blue-500 text-xs ml-2">(conditional)</span>}
            </Label>
            <Textarea
              {...commonProps}
              value={value}
              onChange={(e) => handleInputChange(fieldKey, e.target.value)}
              placeholder={`Enter ${config.label.toLowerCase()}`}
              rows={3}
            />
            {hasError && <p className="text-sm text-red-500">{hasError}</p>}
          </div>
        );
        
      case 'date':
        return (
          <div key={fieldKey} className={`space-y-2 ${isConditional ? 'p-3 border border-blue-200 rounded-lg bg-blue-50/20' : ''}`}>
            <Label htmlFor={fieldKey}>
              {config.label} 
              {isRequired && <span className="text-red-500">*</span>}
              {isConditional && <span className="text-blue-500 text-xs ml-2">(conditional)</span>}
            </Label>
            <div className="relative">
              <Input
                {...commonProps}
                type="date"
                value={value ? new Date(value).toISOString().split('T')[0] : ''}
                onChange={(e) => handleInputChange(fieldKey, e.target.value)}
              />
              <CalendarDays className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
            </div>
            {hasError && <p className="text-sm text-red-500">{hasError}</p>}
          </div>
        );
        
      default:
        return (
          <div key={fieldKey} className={`space-y-2 ${isConditional ? 'p-3 border border-blue-200 rounded-lg bg-blue-50/20' : ''}`}>
            <Label htmlFor={fieldKey}>
              {config.label} 
              {isRequired && <span className="text-red-500">*</span>}
              {isConditional && <span className="text-blue-500 text-xs ml-2">(conditional)</span>}
            </Label>
            <Input
              {...commonProps}
              type={config.type}
              value={value}
              onChange={(e) => handleInputChange(fieldKey, e.target.value)}
              placeholder={`Enter ${config.label.toLowerCase()}`}
              pattern={config.pattern}
            />
            {hasError && <p className="text-sm text-red-500">{hasError}</p>}
          </div>
        );
    }
  };

  const canProceed = checkCompletion ? checkCompletion(formData) : validateForm();

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Section Completion Status */}
      <Alert>
        {canProceed ? (
          <CheckCircle className="h-4 w-4 text-green-500" />
        ) : (
          <AlertTriangle className="h-4 w-4 text-amber-500" />
        )}
        <AlertDescription>
          {canProceed 
            ? "All required fields completed. Ready to proceed."
            : `Please complete ${allRequiredFields.filter(f => !formData[f]).length} required field(s).`
          }
          {sectionCompletion && (
            <div className="mt-2 text-sm">
              Section Progress: {sectionCompletion.completed}/{sectionCompletion.total} fields 
              ({sectionCompletion.percentage}% complete)
            </div>
          )}
        </AlertDescription>
      </Alert>

      {/* Conditional Fields Toggle */}
      {enableConditionalFields && activeFields.length !== fields.length && (
        <Alert>
          <Expand className="h-4 w-4" />
          <AlertDescription>
            <div className="flex items-center justify-between">
              <span>
                {activeFields.length - fields.length} additional fields available based on your selections
              </span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowExpandedFields(!showExpandedFields)}
              >
                {showExpandedFields ? <Minimize className="h-4 w-4" /> : <Expand className="h-4 w-4" />}
                {showExpandedFields ? 'Hide' : 'Show'} Additional Fields
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Form Fields */}
      <Card>
        <CardContent className="pt-6 space-y-6">
          {(showExpandedFields ? activeFields : fields).map(renderField)}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between">
        {onPrevious && (
          <Button 
            type="button" 
            variant="outline" 
            onClick={onPrevious}
            disabled={isLoading}
          >
            Previous
          </Button>
        )}
        
        <Button 
          type="submit" 
          disabled={!canProceed || isLoading}
          className="ml-auto"
        >
          {isLoading ? "Saving..." : step === 'submit' ? "Submit Enrollment" : "Next"}
        </Button>
      </div>
    </form>
  );
};