
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { AlertTriangle } from 'lucide-react';
import { TreatmentCenterOnboarding } from '@/types/onboarding';

interface AuthorizationsStepProps {
  data: Partial<TreatmentCenterOnboarding>;
  onUpdate: (data: Partial<TreatmentCenterOnboarding>) => void;
}

export const AuthorizationsStep: React.FC<AuthorizationsStepProps> = ({ data, onUpdate }) => {
  const updateAuthorizedSignature = (field: string, value: string) => {
    onUpdate({
      authorizations: {
        ...data.authorizations,
        authorized_signature: {
          ...data.authorizations?.authorized_signature,
          [field]: value
        }
      }
    });
  };

  const updateGuarantorSignature = (field: string, value: any) => {
    if (field === 'home_address') {
      onUpdate({
        authorizations: {
          ...data.authorizations,
          guarantor_signature: {
            ...data.authorizations?.guarantor_signature,
            home_address: {
              ...data.authorizations?.guarantor_signature?.home_address,
              ...value
            }
          }
        }
      });
    } else {
      onUpdate({
        authorizations: {
          ...data.authorizations,
          guarantor_signature: {
            ...data.authorizations?.guarantor_signature,
            [field]: value
          }
        }
      });
    }
  };

  const updateTermsAccepted = (accepted: boolean) => {
    onUpdate({
      authorizations: {
        ...data.authorizations,
        terms_accepted: accepted,
        date_signed: accepted ? new Date().toISOString().split('T')[0] : undefined
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Authorized Signature */}
      <Card>
        <CardHeader>
          <CardTitle>Authorized Signature *</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="auth_name">Full Name *</Label>
              <Input
                id="auth_name"
                value={data.authorizations?.authorized_signature?.name || ''}
                onChange={(e) => updateAuthorizedSignature('name', e.target.value)}
                placeholder="Enter full legal name"
              />
            </div>
            <div>
              <Label htmlFor="auth_title">Title *</Label>
              <Input
                id="auth_title"
                value={data.authorizations?.authorized_signature?.title || ''}
                onChange={(e) => updateAuthorizedSignature('title', e.target.value)}
                placeholder="Enter job title"
              />
            </div>
            <div>
              <Label htmlFor="auth_date">Date *</Label>
              <Input
                id="auth_date"
                type="date"
                value={data.authorizations?.authorized_signature?.date || ''}
                onChange={(e) => updateAuthorizedSignature('date', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="auth_ssn">SSN (Optional)</Label>
              <Input
                id="auth_ssn"
                value={data.authorizations?.authorized_signature?.ssn || ''}
                onChange={(e) => updateAuthorizedSignature('ssn', e.target.value)}
                placeholder="XXX-XX-XXXX"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Guarantor Signature */}
      <Card>
        <CardHeader>
          <CardTitle>Personal Guarantor (if applicable)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="guarantor_name">Full Name</Label>
              <Input
                id="guarantor_name"
                value={data.authorizations?.guarantor_signature?.name || ''}
                onChange={(e) => updateGuarantorSignature('name', e.target.value)}
                placeholder="Enter full legal name"
              />
            </div>
            <div>
              <Label htmlFor="guarantor_date">Date</Label>
              <Input
                id="guarantor_date"
                type="date"
                value={data.authorizations?.guarantor_signature?.date || ''}
                onChange={(e) => updateGuarantorSignature('date', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="guarantor_ssn">SSN</Label>
              <Input
                id="guarantor_ssn"
                value={data.authorizations?.guarantor_signature?.ssn || ''}
                onChange={(e) => updateGuarantorSignature('ssn', e.target.value)}
                placeholder="XXX-XX-XXXX"
              />
            </div>
          </div>
          
          <div>
            <Label htmlFor="guarantor_street">Home Address</Label>
            <Input
              id="guarantor_street"
              value={data.authorizations?.guarantor_signature?.home_address?.street || ''}
              onChange={(e) => updateGuarantorSignature('home_address', { 
                ...data.authorizations?.guarantor_signature?.home_address,
                street: e.target.value 
              })}
              placeholder="Enter street address"
            />
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="col-span-2">
              <Label htmlFor="guarantor_city">City</Label>
              <Input
                id="guarantor_city"
                value={data.authorizations?.guarantor_signature?.city || ''}
                onChange={(e) => updateGuarantorSignature('city', e.target.value)}
                placeholder="City"
              />
            </div>
            <div>
              <Label htmlFor="guarantor_state">State</Label>
              <Input
                id="guarantor_state"
                value={data.authorizations?.guarantor_signature?.state || ''}
                onChange={(e) => updateGuarantorSignature('state', e.target.value)}
                placeholder="State"
              />
            </div>
            <div>
              <Label htmlFor="guarantor_zip">ZIP</Label>
              <Input
                id="guarantor_zip"
                value={data.authorizations?.guarantor_signature?.zip || ''}
                onChange={(e) => updateGuarantorSignature('zip', e.target.value)}
                placeholder="ZIP"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Terms and Conditions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            <span>Terms and Conditions *</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-muted p-4 rounded-lg">
            <h4 className="font-semibold mb-2">Terms of Agreement</h4>
            <div className="text-sm space-y-2 max-h-48 overflow-y-auto">
              <p>By submitting this application, I/we certify that:</p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>All information provided is true, complete, and accurate</li>
                <li>I/we have the authority to bind the applicant organization</li>
                <li>I/we agree to the distributor's standard terms and conditions</li>
                <li>I/we understand that false information may result in application rejection</li>
                <li>I/we authorize credit and reference checks as necessary</li>
                <li>I/we agree to comply with all applicable laws and regulations</li>
                <li>I/we understand that approval is subject to distributor review and approval</li>
              </ul>
            </div>
          </div>
          
          <div className="flex items-start space-x-3">
            <Checkbox
              id="terms_accepted"
              checked={data.authorizations?.terms_accepted || false}
              onCheckedChange={updateTermsAccepted}
            />
            <Label htmlFor="terms_accepted" className="text-sm leading-relaxed">
              I acknowledge that I have read, understood, and agree to be bound by the terms and conditions outlined above. 
              I certify that I am authorized to submit this application on behalf of the organization.
            </Label>
          </div>
          
          {data.authorizations?.terms_accepted && (
            <div className="text-sm text-muted-foreground">
              Date of acceptance: {data.authorizations.date_signed}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Legal Notice */}
      <Card>
        <CardHeader>
          <CardTitle>Legal Notice</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground space-y-2">
            <p className="font-medium">Privacy Notice:</p>
            <p>
              Your personal information will be used solely for processing this application and establishing 
              business relationships. Information will be shared only with authorized personnel and as required by law.
            </p>
            <p className="font-medium mt-4">Security:</p>
            <p>
              All data transmitted through this application is encrypted and stored securely in compliance with 
              healthcare data protection standards including HIPAA where applicable.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
