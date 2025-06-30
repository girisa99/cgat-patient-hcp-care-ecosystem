
import React from 'react';

export const OnboardingLoadingState: React.FC = () => {
  return (
    <div className="flex items-center justify-center p-8">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
        <p className="mt-4 text-muted-foreground">Loading onboarding data...</p>
      </div>
    </div>
  );
};
