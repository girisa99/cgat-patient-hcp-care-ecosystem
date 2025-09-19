import React from 'react';
import { TreatmentCenterSelector } from './TreatmentCenterSelector';
import { ProviderSelector } from './ProviderSelector';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface ConditionalFieldRendererProps {
  fieldKey: string;
  value: any;
  onChange: (fieldKey: string, value: any) => void;
  formData: Record<string, any>;
  showOptionalFields?: boolean;
}

export const ConditionalFieldRenderer: React.FC<ConditionalFieldRendererProps> = ({
  fieldKey,
  value,
  onChange,
  formData,
  showOptionalFields = false
}) => {
  
  // Helper function to determine if field should be shown
  const shouldShowField = (field: string): boolean => {
    switch (field) {
      case 'treatment_center_id':
      case 'treatment_center':
      case 'treatment_center_npi':
        // Show if user wants to specify treatment center or if collection method requires it
        return showOptionalFields || 
               formData.collection_method === 'facility_specific' ||
               formData.show_provider_fields === true;
               
      case 'provider_id':
      case 'provider_name':
      case 'provider_npi':
      case 'provider_signature':
        // Show if user wants to specify provider info
        return showOptionalFields || 
               formData.show_provider_fields === true ||
               formData.collection_method === 'provider_guided';
               
      default:
        return true;
    }
  };

  if (!shouldShowField(fieldKey)) {
    return null;
  }

  // Render special field components
  switch (fieldKey) {
    case 'treatment_center_id':
      return (
        <TreatmentCenterSelector
          value={value}
          onValueChange={(facilityId, facilityData) => {
            onChange('treatment_center_id', facilityId);
            onChange('treatment_center', facilityData.name);
            onChange('treatment_center_npi', facilityData.npi_number || '');
          }}
          collectionMethod={formData.collection_method}
          required={false}
          className="space-y-2"
        />
      );
      
    case 'provider_id':
      return (
        <ProviderSelector
          value={value}
          onValueChange={(providerId, providerData) => {
            onChange('provider_id', providerId);
            onChange('provider_name', providerData.name);
            onChange('provider_npi', providerData.contact_info?.npi || '');
          }}
          facilityId={formData.treatment_center_id}
          required={false}
          label="Healthcare Provider (Optional)"
          placeholder="Search for healthcare provider..."
          className="space-y-2"
        />
      );

    case 'collection_method':
      return (
        <div className="space-y-2">
          <Label htmlFor={fieldKey}>Collection Method</Label>
          <Select value={value || ''} onValueChange={(val) => onChange(fieldKey, val)}>
            <SelectTrigger>
              <SelectValue placeholder="Select collection method..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="whatsapp">WhatsApp</SelectItem>
              <SelectItem value="sms">SMS/Text Message</SelectItem>
              <SelectItem value="email">Email</SelectItem>
              <SelectItem value="voice">Voice Call</SelectItem>
              <SelectItem value="facility_specific">Facility-Specific Process</SelectItem>
              <SelectItem value="provider_guided">Provider-Guided Process</SelectItem>
            </SelectContent>
          </Select>
        </div>
      );

    case 'consent_treatment':
    case 'consent_privacy':
    case 'consent_communication':
      return (
        <div className="flex items-center space-x-2">
          <Checkbox
            id={fieldKey}
            checked={value === true}
            onCheckedChange={(checked) => onChange(fieldKey, checked)}
          />
          <Label htmlFor={fieldKey} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
            {getFieldLabel(fieldKey)}
          </Label>
        </div>
      );

    // Hidden fields that are auto-populated
    case 'treatment_center':
    case 'treatment_center_npi':
    case 'provider_name':
    case 'provider_npi':
      return null; // These are auto-populated by the selectors above

    default:
      return (
        <div className="space-y-2">
          <Label htmlFor={fieldKey}>{getFieldLabel(fieldKey)}</Label>
          <Input
            id={fieldKey}
            value={value || ''}
            onChange={(e) => onChange(fieldKey, e.target.value)}
            placeholder={getFieldPlaceholder(fieldKey)}
          />
        </div>
      );
  }
};

function getFieldLabel(fieldKey: string): string {
  const labels: Record<string, string> = {
    'consent_treatment': 'I consent to treatment',
    'consent_privacy': 'I consent to privacy policy and HIPAA authorization',
    'consent_communication': 'I consent to communication',
    'patient_signature': 'Patient Signature',
    'provider_signature': 'Provider Signature',
    'collection_method': 'Collection Method',
    'treatment_center': 'Treatment Center Name',
    'treatment_center_npi': 'Treatment Center NPI',
    'provider_name': 'Provider Name',
    'provider_npi': 'Provider NPI'
  };
  
  return labels[fieldKey] || fieldKey.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
}

function getFieldPlaceholder(fieldKey: string): string {
  const placeholders: Record<string, string> = {
    'patient_signature': 'Enter your full name as signature',
    'provider_signature': 'Provider signature',
    'treatment_center': 'Treatment center name',
    'provider_name': 'Healthcare provider name'
  };
  
  return placeholders[fieldKey] || '';
}