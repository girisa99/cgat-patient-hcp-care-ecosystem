/**
 * APP LAYOUT WITH UNIVERSAL CONVERSATION GENIE
 * Enhanced app layout with global conversational AI available across all pages
 * Supports multi-user/multi-tenant conversations
 * 
 * NOTE: Genie popup is hidden on Genie Studio pages (uses Ask Genie instead)
 * NOTE: Label Studio runs as background service (no popup widgets)
 */
import React, { Suspense } from 'react';
import { useLocation } from 'react-router-dom';
import { GlobalConversationalEnrollmentProvider } from '@/hooks/useGlobalConversationalEnrollment';
import { lazyWithRetry } from '@/utils/lazyWithRetry';

// Lazy load heavy global components with retry to prevent startup failures
const GlobalConversationalEnrollmentModalLazy = lazyWithRetry(() =>
  import('@/components/global/GlobalConversationalEnrollmentModal').then(m => ({ default: m.GlobalConversationalEnrollmentModal }))
);
const UniversalConversationGenieLazy = lazyWithRetry(() =>
  import('@/components/enrollment-genie/UniversalConversationGenie').then(m => ({ default: m.UniversalConversationGenie }))
);

// Routes where the floating Genie popup should be hidden (Ask Genie is used instead)
const GENIE_STUDIO_ROUTES = [
  '/genie-studio',
  '/genie-spark',
  '/genie-arc',
  '/genie-mind',
  '/genie-vibe',
  '/genie-deck',
  '/genie-cast',
  '/genie-admin',
  '/genie-studio/productions',
  '/genie-landing',
  '/genie-explore',
  '/genie-products'
];

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
  const location = useLocation();
  
  // Hide the floating Genie on Genie Studio pages (they use Ask Genie instead)
  const isGenieStudioPage = GENIE_STUDIO_ROUTES.some(route => 
    location.pathname.startsWith(route)
  );
  const shouldShowGenie = showUniversalGenie && !isGenieStudioPage;

  // Label Studio runs as background service - no popup widget needed
  // Training data is captured via labelStudioBackgroundService hooks

  return (
    <GlobalConversationalEnrollmentProvider>
      <div className="min-h-screen bg-background">
        {children}
        
        {/* Global Enrollment Modal (Legacy Support) */}
        <Suspense fallback={<div />}>
          <GlobalConversationalEnrollmentModalLazy />

          {/* Universal Conversation Genie - Hidden on Genie Studio pages */}
          {shouldShowGenie && (
            <UniversalConversationGenieLazy 
              tenantId={tenantId}
              userId={userId}
              onConversationComplete={(data) => {
                console.log('Global conversation completed:', data);
              }}
            />
          )}
        </Suspense>
        
        {/* Label Studio runs silently in background via labelStudioBackgroundService */}
        {/* No popup widgets - training data captured inline via hooks */}
      </div>
    </GlobalConversationalEnrollmentProvider>
  );
};