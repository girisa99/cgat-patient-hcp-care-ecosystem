/**
 * APP LAYOUT WITH UNIVERSAL CONVERSATION GENIE
 * Enhanced app layout with global conversational AI available across all pages
 * Supports multi-user/multi-tenant conversations
 */
import React, { Suspense } from 'react';
import { GlobalConversationalEnrollmentProvider } from '@/hooks/useGlobalConversationalEnrollment';
import { lazyWithRetry } from '@/utils/lazyWithRetry';
import { usePageAwareEnrollment } from '@/hooks/usePageAwareEnrollment';

// Lazy load heavy global components with retry to prevent startup failures
const GlobalConversationalEnrollmentModalLazy = lazyWithRetry(() =>
  import('@/components/global/GlobalConversationalEnrollmentModal').then(m => ({ default: m.GlobalConversationalEnrollmentModal }))
);
const UniversalConversationGenieLazy = lazyWithRetry(() =>
  import('@/components/enrollment-genie/UniversalConversationGenie').then(m => ({ default: m.UniversalConversationGenie }))
);

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
        <Suspense fallback={<div />}>
          <GlobalConversationalEnrollmentModalLazy />

          {/* Universal Conversation Genie - Available Globally */}
          {showUniversalGenie && (
            <UniversalConversationGenieLazy 
              tenantId={tenantId}
              userId={userId}
              onConversationComplete={(data) => {
                console.log('Global conversation completed:', data);
              }}
            />
          )}
        </Suspense>
      </div>
    </GlobalConversationalEnrollmentProvider>
  );
};