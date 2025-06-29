
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { CheckCircle, AlertCircle, Edit } from 'lucide-react';
import { TreatmentCenterOnboarding } from '@/types/onboarding';

interface ReviewStepProps {
  data: Partial<TreatmentCenterOnboarding>;
  onUpdate: (data: Partial<TreatmentCenterOnboarding>) => void;
  onSubmit: (data: TreatmentCenterOnboarding) => void;
}

export const ReviewStep: React.FC<ReviewStepProps> = ({ data, onUpdate, onSubmit }) => {
  const handleSubmit = () => {
    onSubmit(data as TreatmentCenterOnboarding);
  };

  const isFieldComplete = (value: any): boolean => {
    if (value === null || value === undefined || value === '') return false;
    if (Array.isArray(value)) return value.length > 0;
    if (typeof value === 'object') return Object.keys(value).length > 0;
    return true;
  };

  const getCompletionStatus = () => {
    const requiredFields = [
      data.company_info?.legal_name,
      data.company_info?.federal_tax_id,
      data.company_info?.legal_address?.street,
      data.business_info?.business_type?.length,
      data.business_info?.years_in_business,
      data.contacts?.primary_contact?.name,
      data.contacts?.primary_contact?.email,
      data.references?.primary_bank?.name,
      data.references?.primary_supplier?.name,
      data.payment_info?.bank_name,
      data.payment_info?.bank_account_number,
      data.authorizations?.authorized_signature?.name,
      data.authorizations?.terms_accepted
    ];

    const completed = requiredFields.filter(field => isFieldComplete(field)).length;
    const total = requiredFields.length;
    
    return { completed, total, percentage: Math.round((completed / total) * 100) };
  };

  const completionStatus = getCompletionStatus();
  const isReadyToSubmit = completionStatus.percentage >= 90;

  return (
    <div className="space-y-6">
      {/* Completion Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            {isReadyToSubmit ? (
              <CheckCircle className="h-5 w-5 text-green-600" />
            ) : (
              <AlertCircle className="h-5 w-5 text-amber-500" />
            )}
            <span>Application Review</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Completion Status</span>
                <span className="text-sm text-muted-foreground">
                  {completionStatus.completed} of {completionStatus.total} required fields
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full ${
                    completionStatus.percentage >= 90 ? 'bg-green-600' : 
                    completionStatus.percentage >= 70 ? 'bg-amber-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${completionStatus.percentage}%` }}
                ></div>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                {completionStatus.percentage}% complete
              </p>
            </div>
            
            {!isReadyToSubmit && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <p className="text-sm text-amber-800">
                  Please complete all required fields before submitting your application.
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Selected Distributors */}
      <Card>
        <CardHeader>
          <CardTitle>Selected Distributors</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {data.selected_distributors?.map(distributor => (
              <Badge key={distributor} variant="secondary" className="px-3 py-1">
                {distributor.replace('_', ' ').toUpperCase()}
              </Badge>
            )) || <p className="text-muted-foreground">None selected</p>}
          </div>
        </CardContent>
      </Card>

      {/* Company Information */}
      <Card>
        <CardHeader>
          <CardTitle>Company Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <span className="text-sm font-medium">Legal Name:</span>
              <p className="text-sm text-muted-foreground">{data.company_info?.legal_name || 'Not provided'}</p>
            </div>
            <div>
              <span className="text-sm font-medium">Federal Tax ID:</span>
              <p className="text-sm text-muted-foreground">{data.company_info?.federal_tax_id || 'Not provided'}</p>
            </div>
            <div>
              <span className="text-sm font-medium">DBA Name:</span>
              <p className="text-sm text-muted-foreground">{data.company_info?.dba_name || 'None'}</p>
            </div>
            <div>
              <span className="text-sm font-medium">Website:</span>
              <p className="text-sm text-muted-foreground">{data.company_info?.website || 'Not provided'}</p>
            </div>
          </div>
          <Separator />
          <div>
            <span className="text-sm font-medium">Legal Address:</span>
            <p className="text-sm text-muted-foreground">
              {data.company_info?.legal_address ? 
                `${data.company_info.legal_address.street}, ${data.company_info.legal_address.city}, ${data.company_info.legal_address.state} ${data.company_info.legal_address.zip}` :
                'Not provided'
              }
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Business Classification */}
      <Card>
        <CardHeader>
          <CardTitle>Business Classification</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <span className="text-sm font-medium">Years in Business:</span>
              <p className="text-sm text-muted-foreground">{data.business_info?.years_in_business || 'Not provided'}</p>
            </div>
            <div>
              <span className="text-sm font-medium">Ownership Type:</span>
              <p className="text-sm text-muted-foreground">{data.business_info?.ownership_type || 'Not provided'}</p>
            </div>
          </div>
          <div>
            <span className="text-sm font-medium">Business Types:</span>
            <div className="flex flex-wrap gap-1 mt-1">
              {data.business_info?.business_type?.map(type => (
                <Badge key={type} variant="outline" className="text-xs">
                  {type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </Badge>
              )) || <p className="text-sm text-muted-foreground">None selected</p>}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Primary Contacts */}
      <Card>
        <CardHeader>
          <CardTitle>Primary Contact</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <span className="text-sm font-medium">Name:</span>
              <p className="text-sm text-muted-foreground">{data.contacts?.primary_contact?.name || 'Not provided'}</p>
            </div>
            <div>
              <span className="text-sm font-medium">Title:</span>
              <p className="text-sm text-muted-foreground">{data.contacts?.primary_contact?.title || 'Not provided'}</p>
            </div>
            <div>
              <span className="text-sm font-medium">Email:</span>
              <p className="text-sm text-muted-foreground">{data.contacts?.primary_contact?.email || 'Not provided'}</p>
            </div>
            <div>
              <span className="text-sm font-medium">Phone:</span>
              <p className="text-sm text-muted-foreground">{data.contacts?.primary_contact?.phone || 'Not provided'}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Authorization Status */}
      <Card>
        <CardHeader>
          <CardTitle>Authorization Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              {data.authorizations?.terms_accepted ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : (
                <AlertCircle className="h-4 w-4 text-red-500" />
              )}
              <span className="text-sm">Terms and Conditions Accepted</span>
            </div>
            
            {data.authorizations?.authorized_signature?.name && (
              <div>
                <span className="text-sm font-medium">Authorized by:</span>
                <p className="text-sm text-muted-foreground">
                  {data.authorizations.authorized_signature.name} ({data.authorizations.authorized_signature.title})
                </p>
                {data.authorizations.date_signed && (
                  <p className="text-xs text-muted-foreground">
                    Signed on: {data.authorizations.date_signed}
                  </p>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Submit Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Ready to Submit?</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Please review all information above for accuracy. Once submitted, your application will be 
              processed by the selected distributors. You will receive confirmation and status updates via email.
            </p>
            
            <div className="flex space-x-3">
              <Button 
                onClick={handleSubmit}
                disabled={!isReadyToSubmit}
                className="flex-1"
              >
                Submit Application
              </Button>
              <Button variant="outline" size="sm">
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
            </div>
            
            {!isReadyToSubmit && (
              <p className="text-xs text-red-600">
                Complete all required fields to enable submission.
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
