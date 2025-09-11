/**
 * APP LAYOUT WITH ENROLLMENT
 * Enhanced app layout that includes context-aware conversational enrollment
 */
import React from 'react';
import { GlobalConversationalEnrollmentProvider } from '@/hooks/useGlobalConversationalEnrollment';
import { GlobalConversationalEnrollmentModal } from '@/components/global/GlobalConversationalEnrollmentModal';
import { EnrollmentLauncher } from '@/components/global/EnrollmentLauncher';
import { usePageAwareEnrollment } from '@/hooks/usePageAwareEnrollment';

interface AppLayoutWithEnrollmentProps {
  children: React.ReactNode;
  showFloatingLauncher?: boolean;
  launcherVariant?: 'floating' | 'inline' | 'menu';
}

const FloatingLauncherWrapper: React.FC = () => {
  const { shouldShowFloatingButton } = usePageAwareEnrollment();
  
  // Never show floating launcher - only show when explicitly requested
  if (!shouldShowFloatingButton()) {
    return null;
  }
  
  return <EnrollmentLauncher variant="floating" />;
};

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
        
        {/* Context-Aware Floating Launcher */}
        {showFloatingLauncher && launcherVariant === 'floating' && (
          <FloatingLauncherWrapper />
        )}
      </div>
    </GlobalConversationalEnrollmentProvider>
  );
};