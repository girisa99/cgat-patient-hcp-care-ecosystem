/**
 * APP LAYOUT WITH UNIVERSAL CONVERSATION GENIE
 * Enhanced app layout with global conversational AI available across all pages
 * Supports multi-user/multi-tenant conversations
 */
import React from 'react';
import { GlobalConversationalEnrollmentProvider } from '@/hooks/useGlobalConversationalEnrollment';
import { GlobalConversationalEnrollmentModal } from '@/components/global/GlobalConversationalEnrollmentModal';
import { UniversalConversationGenie } from '@/components/enrollment-genie/UniversalConversationGenie';
import { usePageAwareEnrollment } from '@/hooks/usePageAwareEnrollment';

interface AppLayoutWithEnrollmentProps {
  children: React.ReactNode;
  showUniversalGenie?: boolean;
  tenantId?: string;
  userId?: string;
}

export const AppLayoutWithEnrollment: React.FC<AppLayoutWithEnrollmentProps> = ({
  children,
  showUniversalGenie = true,
  tenantId,
  userId
}) => {
  return (
    <GlobalConversationalEnrollmentProvider>
      <div className="min-h-screen bg-background">
        {children}
        
        {/* Global Enrollment Modal (Legacy Support) */}
        <GlobalConversationalEnrollmentModal />
        
        {/* Universal Conversation Genie - Available Globally */}
        {showUniversalGenie && (
          <UniversalConversationGenie 
            tenantId={tenantId}
            userId={userId}
            onConversationComplete={(data) => {
              console.log('Global conversation completed:', data);
            }}
          />
        )}
      </div>
    </GlobalConversationalEnrollmentProvider>
  );
};