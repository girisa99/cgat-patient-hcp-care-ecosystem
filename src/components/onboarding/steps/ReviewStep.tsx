
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TreatmentCenterOnboarding } from '@/types/onboarding';

interface ReviewStepProps {
  data: Partial<TreatmentCenterOnboarding>;
  onDataChange: (data: Partial<TreatmentCenterOnboarding>) => void;
}

export const ReviewStep: React.FC<ReviewStepProps> = ({ data, onDataChange }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Review & Submit</CardTitle>
        <CardDescription>
          Review your application details before submitting for approval.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <h4 className="font-semibold">Company Information</h4>
            <p className="text-sm text-muted-foreground">
              Legal Name: {data.company_info?.legal_name || 'Not provided'}
            </p>
            <p className="text-sm text-muted-foreground">
              Federal Tax ID: {data.company_info?.federal_tax_id || 'Not provided'}
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold">Selected Distributors</h4>
            <p className="text-sm text-muted-foreground">
              {data.selected_distributors?.length ? 
                data.selected_distributors.join(', ') : 
                'None selected'
              }
            </p>
          </div>

          <div>
            <h4 className="font-semibold">Primary Contact</h4>
            <p className="text-sm text-muted-foreground">
              {data.contacts?.primary_contact?.name || 'Not provided'} - {data.contacts?.primary_contact?.email || 'No email'}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
