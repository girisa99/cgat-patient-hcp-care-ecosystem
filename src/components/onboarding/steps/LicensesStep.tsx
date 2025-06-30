
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TreatmentCenterOnboarding } from '@/types/onboarding';

interface LicensesStepProps {
  data: Partial<TreatmentCenterOnboarding>;
  onDataChange: (data: Partial<TreatmentCenterOnboarding>) => void;
}

export const LicensesStep: React.FC<LicensesStepProps> = ({ data, onDataChange }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Licenses & Certifications</CardTitle>
        <CardDescription>
          This section will be implemented to capture license and certification information.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">Coming soon...</p>
      </CardContent>
    </Card>
  );
};
