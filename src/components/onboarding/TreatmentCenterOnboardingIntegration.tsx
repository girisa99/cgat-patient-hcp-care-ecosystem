/**
 * TREATMENT CENTER ONBOARDING INTEGRATION
 * Integrates AI enrollment into treatment center onboarding workflows
 */
import React from 'react';
import { PageEnrollmentIntegration } from '@/components/page-integration/PageEnrollmentIntegration';

export const TreatmentCenterOnboardingIntegration: React.FC = () => {
  return (
    <div className="mb-6">
      <PageEnrollmentIntegration variant="card" className="max-w-2xl" />
    </div>
  );
};