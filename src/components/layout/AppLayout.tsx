/**
 * ENHANCED APP LAYOUT COMPONENT
 * Consistent layout wrapper with navigation for all pages
 */
import React from 'react';
import RoleBasedNavigation from '@/components/navigation/RoleBasedNavigation';

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
      {/* DEBUG: Navigation should render here */}
      {showNavigation && <RoleBasedNavigation />}
      
      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {title && (
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
          </div>
        )}
        {children}
      </div>
    </div>
  );
};

export default AppLayout;
