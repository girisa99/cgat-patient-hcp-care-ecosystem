
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { TreatmentCenterOnboarding } from '@/types/onboarding';
import { Separator } from '@/components/ui/separator';
import { PenTool, Shield, FileCheck, AlertCircle } from 'lucide-react';

interface AuthorizationsStepProps {
  data: Partial<TreatmentCenterOnboarding>;
  onDataChange: (data: Partial<TreatmentCenterOnboarding>) => void;
}

export const AuthorizationsStep: React.FC<AuthorizationsStepProps> = ({ data, onDataChange }) => {
  const authorizations = data.authorizations || {
    authorized_signature: { name: '', title: '', date: '' },
    terms_accepted: false
  };

  const updateAuthorizedSignature = (field: string, value: string) => {
    const updatedAuthorizations = {
      ...authorizations,
      authorized_signature: {
        ...authorizations.authorized_signature,
        [field]: value
      }
    };

    onDataChange({
      ...data,
      authorizations: updatedAuthorizations
    });
  };

  const updateGuarantorSignature = (field: string, value: string) => {
    const updatedAuthorizations = {
      ...authorizations,
      guarantor_signature: {
        ...authorizations.guarantor_signature,
        [field]: value
      }
    };

    onDataChange({
      ...data,
      authorizations: updatedAuthorizations
    });
  };

  const updateGuarantorAddress = (field: string, value: string) => {
    const updatedAuthorizations = {
      ...authorizations,
      guarantor_signature: {
        ...authorizations.guarantor_signature,
        home_address: {
          ...authorizations.guarantor_signature?.home_address,
          [field]: value
        }
      }
    };

    onDataChange({
      ...data,
      authorizations: updatedAuthorizations
    });
  };

  const updateTermsAccepted = (accepted: boolean) => {
    const updatedAuthorizations = {
      ...authorizations,
      terms_accepted: accepted,
      date_signed: accepted ? new Date().toISOString() : undefined
    };

    onDataChange({
      ...data,
      authorizations: updatedAuthorizations
    });
  };

  return (
    <div className="space-y-6">
      {/* Authorized Signatory */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <PenTool className="h-5 w-5" />
            <span>Authorized Signatory *</span>
          </CardTitle>
          <CardDescription>
            Person authorized to sign on behalf of the organization
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="auth-name">Full Name *</Label>
              <Input
                id="auth-name"
                value={authorizations.authorized_signature?.name || ''}
                onChange={(e) => updateAuthorizedSignature('name', e.target.value)}
                placeholder="Enter full legal name"
                required
              />
            </div>
            <div>
              <Label htmlFor="auth-title">Title/Position *</Label>
              <Input
                id="auth-title"
                value={authorizations.authorized_signature?.title || ''}
                onChange={(e) => updateAuthorizedSignature('title', e.target.value)}
                placeholder="e.g., CEO, President, Administrator"
                required
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="auth-date">Signature Date *</Label>
              <Input
                id="auth-date"
                type="date"
                value={authorizations.authorized_signature?.date || ''}
                onChange={(e) => updateAuthorizedSignature('date', e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="auth-ssn">SSN (Last 4 digits)</Label>
              <Input
                id="auth-ssn"
                value={authorizations.authorized_signature?.ssn || ''}
                onChange={(e) => updateAuthorizedSignature('ssn', e.target.value)}
                placeholder="####"
                maxLength={4}
                pattern="[0-9]{4}"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Separator />

      {/* Guarantor Information (Optional) */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Shield className="h-5 w-5" />
            <span>Personal Guarantor (If Required)</span>
          </CardTitle>
          <CardDescription>
            Personal guarantee may be required for credit approval
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!authorizations.guarantor_signature ? (
            <div className="text-center py-4">
              <button
                type="button"
                onClick={() => {
                  const updatedAuthorizations = {
                    ...authorizations,
                    guarantor_signature: {
                      name: '',
                      home_address: { street: '', city: '', state: '', zip: '' },
                      city: '',
                      state: '',
                      zip: '',
                      date: ''
                    }
                  };
                  onDataChange({ ...data, authorizations: updatedAuthorizations });
                }}
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                + Add Personal Guarantor Information
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="guarantor-name">Guarantor Full Name</Label>
                  <Input
                    id="guarantor-name"
                    value={authorizations.guarantor_signature?.name || ''}
                    onChange={(e) => updateGuarantorSignature('name', e.target.value)}
                    placeholder="Enter full legal name"
                  />
                </div>
                <div>
                  <Label htmlFor="guarantor-date">Signature Date</Label>
                  <Input
                    id="guarantor-date"
                    type="date"
                    value={authorizations.guarantor_signature?.date || ''}
                    onChange={(e) => updateGuarantorSignature('date', e.target.value)}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="guarantor-street">Home Address</Label>
                <Input
                  id="guarantor-street"
                  value={authorizations.guarantor_signature?.home_address?.street || ''}
                  onChange={(e) => updateGuarantorAddress('street', e.target.value)}
                  placeholder="Street address"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="guarantor-city">City</Label>
                  <Input
                    id="guarantor-city"
                    value={authorizations.guarantor_signature?.home_address?.city || ''}
                    onChange={(e) => updateGuarantorAddress('city', e.target.value)}
                    placeholder="City"
                  />
                </div>
                <div>
                  <Label htmlFor="guarantor-state">State</Label>
                  <Input
                    id="guarantor-state"
                    value={authorizations.guarantor_signature?.home_address?.state || ''}
                    onChange={(e) => updateGuarantorAddress('state', e.target.value)}
                    placeholder="State"
                    maxLength={2}
                  />
                </div>
                <div>
                  <Label htmlFor="guarantor-zip">ZIP Code</Label>
                  <Input
                    id="guarantor-zip"
                    value={authorizations.guarantor_signature?.home_address?.zip || ''}
                    onChange={(e) => updateGuarantorAddress('zip', e.target.value)}
                    placeholder="ZIP Code"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="guarantor-ssn">SSN (Last 4 digits)</Label>
                <Input
                  id="guarantor-ssn"
                  value={authorizations.guarantor_signature?.ssn || ''}
                  onChange={(e) => updateGuarantorSignature('ssn', e.target.value)}
                  placeholder="####"
                  maxLength={4}
                  pattern="[0-9]{4}"
                />
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => {
                    const updatedAuthorizations = { ...authorizations };
                    delete updatedAuthorizations.guarantor_signature;
                    onDataChange({ ...data, authorizations: updatedAuthorizations });
                  }}
                  className="text-red-600 hover:text-red-800 text-sm"
                >
                  Remove Guarantor Information
                </button>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <Separator />

      {/* Terms and Conditions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileCheck className="h-5 w-5" />
            <span>Terms and Conditions *</span>
          </CardTitle>
          <CardDescription>
            Review and accept the terms and conditions
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="border rounded-lg p-4 max-h-48 overflow-y-auto bg-gray-50">
            <h4 className="font-semibold mb-2">Healthcare Distribution Agreement Terms</h4>
            <div className="text-sm space-y-2">
              <p>By accepting these terms, you agree to:</p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Comply with all applicable federal, state, and local laws and regulations</li>
                <li>Maintain proper licenses and certifications for your facility</li>
                <li>Follow all DEA and controlled substance regulations</li>
                <li>Maintain appropriate storage and handling procedures</li>
                <li>Provide accurate and truthful information in this application</li>
                <li>Pay all invoices according to agreed terms</li>
                <li>Report any changes in business structure or ownership</li>
                <li>Allow periodic audits and compliance reviews</li>
              </ul>
              <p className="mt-4">
                <strong>Privacy:</strong> Your information will be handled in accordance with HIPAA 
                and other applicable privacy regulations.
              </p>
              <p>
                <strong>Updates:</strong> You agree to notify us within 30 days of any material 
                changes to your business, licenses, or contact information.
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <Checkbox
              id="terms-accepted"
              checked={authorizations.terms_accepted}
              onCheckedChange={updateTermsAccepted}
            />
            <Label htmlFor="terms-accepted" className="text-sm leading-relaxed">
              I have read, understood, and agree to the terms and conditions outlined above. 
              I certify that all information provided in this application is true and accurate 
              to the best of my knowledge. *
            </Label>
          </div>

          {authorizations.terms_accepted && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <FileCheck className="h-5 w-5 text-green-600" />
                <span className="text-green-800 font-medium">Terms Accepted</span>
              </div>
              <p className="text-green-700 text-sm mt-1">
                Signed on: {new Date(authorizations.date_signed || '').toLocaleDateString()}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Legal Disclaimer */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
          <div>
            <h4 className="font-medium text-blue-900">Legal Notice</h4>
            <p className="text-sm text-blue-700 mt-1">
              This application constitutes a legal agreement. By submitting this application, 
              you acknowledge that you have the authority to bind your organization to these terms. 
              False statements may result in denial of application or termination of services.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
