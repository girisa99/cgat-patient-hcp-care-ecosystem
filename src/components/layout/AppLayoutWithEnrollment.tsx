/**
 * APP LAYOUT WITH ENROLLMENT
 * Enhanced app layout that includes global conversational enrollment
 */
import React from 'react';
import { GlobalConversationalEnrollmentProvider } from '@/hooks/useGlobalConversationalEnrollment';
import { GlobalConversationalEnrollmentModal } from '@/components/global/GlobalConversationalEnrollmentModal';
import { EnrollmentLauncher } from '@/components/global/EnrollmentLauncher';

interface AppLayoutWithEnrollmentProps {
  children: React.ReactNode;
  showFloatingLauncher?: boolean;
  launcherVariant?: 'floating' | 'inline' | 'menu';
}

export const AppLayoutWithEnrollment: React.FC<AppLayoutWithEnrollmentProps> = ({
  children,
  showFloatingLauncher = true,
  launcherVariant = 'floating'
}) => {
  return (
    <GlobalConversationalEnrollmentProvider>
      <div className="min-h-screen bg-background">
        {children}
        
        {/* Global Enrollment Modal */}
        <GlobalConversationalEnrollmentModal />
        
        {/* Floating Launcher (optional) */}
        {showFloatingLauncher && (
          <EnrollmentLauncher variant={launcherVariant} />
        )}
      </div>
    </GlobalConversationalEnrollmentProvider>
  );
};