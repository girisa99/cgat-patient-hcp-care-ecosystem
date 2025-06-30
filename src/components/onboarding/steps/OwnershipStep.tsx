
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TreatmentCenterOnboarding } from '@/types/onboarding';

interface OwnershipStepProps {
  data: Partial<TreatmentCenterOnboarding>;
  onDataChange: (data: Partial<TreatmentCenterOnboarding>) => void;
}

export const OwnershipStep: React.FC<OwnershipStepProps> = ({ data, onDataChange }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Ownership & Control Information</CardTitle>
        <CardDescription>
          This section will be implemented to capture ownership and control details.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">Coming soon...</p>
      </CardContent>
    </Card>
  );
};
