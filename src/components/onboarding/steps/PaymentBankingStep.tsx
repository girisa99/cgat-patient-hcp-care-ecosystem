
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TreatmentCenterOnboarding } from '@/types/onboarding';

interface PaymentBankingStepProps {
  data: Partial<TreatmentCenterOnboarding>;
  onDataChange: (data: Partial<TreatmentCenterOnboarding>) => void;
}

export const PaymentBankingStep: React.FC<PaymentBankingStepProps> = ({ data, onDataChange }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Payment & Banking Information</CardTitle>
        <CardDescription>
          This section will be implemented to capture payment and banking details.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">Coming soon...</p>
      </CardContent>
    </Card>
  );
};
