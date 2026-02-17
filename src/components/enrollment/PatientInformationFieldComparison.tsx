/**
 * PATIENT INFORMATION FIELD COMPARISON
 * Shows exact mapping between Online Form vs MCP Agent capture
 */
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, AlertCircle, User, Phone, MapPin, Mail } from 'lucide-react';

interface FieldMapping {
  onlineFormField: string;
  onlineFormType: string;
  mcpFieldKey: string;
  destinationTable: string;
  destinationColumn: string;
  required: boolean;
  validation?: string;
  placeholder?: string;
}

const PATIENT_INFO_FIELD_MAPPINGS: FieldMapping[] = [
  // Personal Information
  {
    onlineFormField: 'First Name',
    onlineFormType: 'text',
    mcpFieldKey: 'first_name',
    destinationTable: 'profiles',
    destinationColumn: 'first_name',
    required: true,
    placeholder: 'Enter first name'
  },
  {
    onlineFormField: 'Last Name',
    onlineFormType: 'text',
    mcpFieldKey: 'last_name',
    destinationTable: 'profiles',
    destinationColumn: 'last_name',
    required: true,
    placeholder: 'Enter last name'
  },
  {
    onlineFormField: 'Middle Name',
    onlineFormType: 'text',
    mcpFieldKey: 'middle_name',
    destinationTable: 'profiles',
    destinationColumn: 'middle_name',
    required: false,
    placeholder: 'Enter middle name (optional)'
  },
  {
    onlineFormField: 'Date of Birth',
    onlineFormType: 'date',
    mcpFieldKey: 'date_of_birth',
    destinationTable: 'profiles',
    destinationColumn: 'date_of_birth',
    required: true
  },
  {
    onlineFormField: 'Preferred Language',
    onlineFormType: 'select',
    mcpFieldKey: 'preferred_language',
    destinationTable: 'profiles',
    destinationColumn: 'preferred_language',
    required: true,
    validation: 'English | Spanish | Other'
  },
  {
    onlineFormField: 'Gender',
    onlineFormType: 'select',
    mcpFieldKey: 'gender',
    destinationTable: 'profiles',
    destinationColumn: 'gender',
    required: true,
    validation: 'Male | Female | Other'
  },
  {
    onlineFormField: 'SSN',
    onlineFormType: 'text',
    mcpFieldKey: 'ssn',
    destinationTable: 'profiles',
    destinationColumn: 'ssn',
    required: false,
    validation: 'XXX-XX-XXXX format',
    placeholder: 'XXX-XX-XXXX'
  },

  // Contact Information
  {
    onlineFormField: 'Email Address',
    onlineFormType: 'email',
    mcpFieldKey: 'email_address',
    destinationTable: 'profiles',
    destinationColumn: 'email',
    required: true,
    validation: 'Valid email format',
    placeholder: 'Enter email address'
  },
  {
    onlineFormField: 'Cell Phone',
    onlineFormType: 'phone',
    mcpFieldKey: 'cell_phone',
    destinationTable: 'profiles',
    destinationColumn: 'cell_phone',
    required: true,
    validation: '(XXX) XXX-XXXX format',
    placeholder: '(555) 123-4567'
  },
  {
    onlineFormField: 'Home Phone',
    onlineFormType: 'phone',
    mcpFieldKey: 'home_phone',
    destinationTable: 'profiles',
    destinationColumn: 'home_phone',
    required: false,
    placeholder: '(555) 123-4567'
  },
  {
    onlineFormField: 'Alternate Phone',
    onlineFormType: 'phone',
    mcpFieldKey: 'alternate_phone',
    destinationTable: 'profiles',
    destinationColumn: 'alternate_phone',
    required: false,
    placeholder: '(555) 123-4567'
  },

  // Address Information
  {
    onlineFormField: 'Street Address',
    onlineFormType: 'text',
    mcpFieldKey: 'street_address',
    destinationTable: 'profiles',
    destinationColumn: 'address_street',
    required: true,
    placeholder: 'Enter street address'
  },
  {
    onlineFormField: 'Apartment/Unit',
    onlineFormType: 'text',
    mcpFieldKey: 'apartment',
    destinationTable: 'profiles',
    destinationColumn: 'address_unit',
    required: false,
    placeholder: 'Apt, Unit, Suite, etc.'
  },
  {
    onlineFormField: 'City',
    onlineFormType: 'text',
    mcpFieldKey: 'city',
    destinationTable: 'profiles',
    destinationColumn: 'address_city',
    required: true,
    placeholder: 'Enter city'
  },
  {
    onlineFormField: 'State',
    onlineFormType: 'text',
    mcpFieldKey: 'state',
    destinationTable: 'profiles',
    destinationColumn: 'address_state',
    required: true,
    placeholder: 'Enter state'
  },
  {
    onlineFormField: 'ZIP Code',
    onlineFormType: 'text',
    mcpFieldKey: 'zip_code',
    destinationTable: 'profiles',
    destinationColumn: 'address_zip',
    required: true,
    validation: 'XXXXX or XXXXX-XXXX format',
    placeholder: 'Enter ZIP code'
  },

  // Emergency Contact Information
  {
    onlineFormField: 'Alternate Contact Name',
    onlineFormType: 'text',
    mcpFieldKey: 'alternate_contact_name',
    destinationTable: 'profiles',
    destinationColumn: 'alternate_contact_name',
    required: false,
    placeholder: 'Emergency contact name'
  },
  {
    onlineFormField: 'Alternate Contact Relationship',
    onlineFormType: 'text',
    mcpFieldKey: 'alternate_contact_relationship',
    destinationTable: 'profiles',
    destinationColumn: 'alternate_contact_relationship',
    required: false,
    placeholder: 'Relationship to patient'
  },
  {
    onlineFormField: 'Do Not Contact Patient',
    onlineFormType: 'checkbox',
    mcpFieldKey: 'do_not_contact_patient',
    destinationTable: 'profiles',
    destinationColumn: 'do_not_contact_patient',
    required: false
  }
];

export const PatientInformationFieldComparison: React.FC = () => {
  const requiredFields = PATIENT_INFO_FIELD_MAPPINGS.filter(f => f.required);
  const optionalFields = PATIENT_INFO_FIELD_MAPPINGS.filter(f => !f.required);

  const getFieldIcon = (fieldKey: string) => {
    if (fieldKey.includes('phone')) return Phone;
    if (fieldKey.includes('email')) return Mail;
    if (fieldKey.includes('address') || fieldKey.includes('city') || fieldKey.includes('state') || fieldKey.includes('zip')) return MapPin;
    return User;
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Patient Information Section - Field Mapping
          </CardTitle>
          <p className="text-muted-foreground">
            Complete comparison between Online Form fields and MCP Agent capture
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Required Fields */}
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                Required Fields ({requiredFields.length})
              </h3>
              <div className="space-y-3">
                {requiredFields.map((field, index) => {
                  const Icon = getFieldIcon(field.mcpFieldKey);
                  return (
                    <Card key={index} className="border-green-100">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <Icon className="h-4 w-4 text-green-600 mt-1 flex-shrink-0" />
                          <div className="flex-1 space-y-2">
                            <div className="flex justify-between items-start">
                              <div>
                                <h4 className="font-medium text-sm">{field.onlineFormField}</h4>
                                <p className="text-xs text-muted-foreground">
                                  Online Form: <code className="bg-muted px-1 rounded">{field.onlineFormType}</code>
                                </p>
                              </div>
                              <Badge className="bg-green-100 text-green-800 text-xs">Required</Badge>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-2 text-xs">
                              <div>
                                <span className="font-medium">MCP Field:</span>
                                <div className="text-muted-foreground">{field.mcpFieldKey}</div>
                              </div>
                              <div>
                                <span className="font-medium">Destination:</span>
                                <div className="text-muted-foreground">{field.destinationTable}.{field.destinationColumn}</div>
                              </div>
                            </div>

                            {field.placeholder && (
                              <div className="text-xs">
                                <span className="font-medium">Placeholder:</span>
                                <span className="text-muted-foreground ml-1">{field.placeholder}</span>
                              </div>
                            )}

                            {field.validation && (
                              <div className="text-xs">
                                <span className="font-medium">Validation:</span>
                                <span className="text-muted-foreground ml-1">{field.validation}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>

            {/* Optional Fields */}
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-blue-600" />
                Optional Fields ({optionalFields.length})
              </h3>
              <div className="space-y-3">
                {optionalFields.map((field, index) => {
                  const Icon = getFieldIcon(field.mcpFieldKey);
                  return (
                    <Card key={index} className="border-blue-100">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <Icon className="h-4 w-4 text-blue-600 mt-1 flex-shrink-0" />
                          <div className="flex-1 space-y-2">
                            <div className="flex justify-between items-start">
                              <div>
                                <h4 className="font-medium text-sm">{field.onlineFormField}</h4>
                                <p className="text-xs text-muted-foreground">
                                  Online Form: <code className="bg-muted px-1 rounded">{field.onlineFormType}</code>
                                </p>
                              </div>
                              <Badge variant="outline" className="text-xs">Optional</Badge>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-2 text-xs">
                              <div>
                                <span className="font-medium">MCP Field:</span>
                                <div className="text-muted-foreground">{field.mcpFieldKey}</div>
                              </div>
                              <div>
                                <span className="font-medium">Destination:</span>
                                <div className="text-muted-foreground">{field.destinationTable}.{field.destinationColumn}</div>
                              </div>
                            </div>

                            {field.placeholder && (
                              <div className="text-xs">
                                <span className="font-medium">Placeholder:</span>
                                <span className="text-muted-foreground ml-1">{field.placeholder}</span>
                              </div>
                            )}

                            {field.validation && (
                              <div className="text-xs">
                                <span className="font-medium">Validation:</span>
                                <span className="text-muted-foreground ml-1">{field.validation}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Summary */}
          <div className="mt-6 p-4 bg-muted/30 rounded-lg">
            <h4 className="font-semibold mb-2">Summary</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="font-medium">Total Fields:</span>
                <div className="text-lg font-bold">{PATIENT_INFO_FIELD_MAPPINGS.length}</div>
              </div>
              <div>
                <span className="font-medium">Required:</span>
                <div className="text-lg font-bold text-green-600">{requiredFields.length}</div>
              </div>
              <div>
                <span className="font-medium">Optional:</span>
                <div className="text-lg font-bold text-blue-600">{optionalFields.length}</div>
              </div>
              <div>
                <span className="font-medium">Destination Table:</span>
                <div className="text-lg font-bold">profiles</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};