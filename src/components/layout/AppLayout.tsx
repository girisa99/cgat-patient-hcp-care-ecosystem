/**
 * ENHANCED APP LAYOUT COMPONENT
 * Consistent layout wrapper with navigation for all pages
 */
import React, { Suspense } from 'react';
import RoleBasedNavigation from '@/components/navigation/RoleBasedNavigation';
import '@/styles/navigation.css';
import { GlobalConversationalEnrollmentProvider } from '@/hooks/useGlobalConversationalEnrollment';
const GlobalConversationalEnrollmentModalLazy = React.lazy(() =>
  import('@/components/global/GlobalConversationalEnrollmentModal').then(m => ({ default: m.GlobalConversationalEnrollmentModal }))
);
const UniversalConversationGenieLazy = React.lazy(() =>
  import('@/components/enrollment-genie/UniversalConversationGenie').then(m => ({ default: m.UniversalConversationGenie }))
);

interface AppLayoutProps {
  title?: string;
  children: React.ReactNode;
  showNavigation?: boolean;
}

const AppLayout: React.FC<AppLayoutProps> = ({ 
  title, 
  children, 
  showNavigation = true 
}) => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      {showNavigation && <RoleBasedNavigation />}
      
      {/* Main Content */}
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {title && (
          <div className="mb-8">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 truncate">{title}</h1>
          </div>
        )}
        <div className="min-w-0">
          {children}
        </div>
      </div>
    </div>
  );
};

export default AppLayout;
