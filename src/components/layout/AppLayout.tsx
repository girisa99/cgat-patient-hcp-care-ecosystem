/**
 * ENHANCED APP LAYOUT COMPONENT
 * Consistent layout wrapper with header, navigation, and user info for all pages
 */
import React from 'react';
import DashboardHeader from './DashboardHeader';
import RoleBasedNavigation from '@/components/navigation/RoleBasedNavigation';

interface AppLayoutProps {
  title?: string;
  children: React.ReactNode;
  showHeader?: boolean;
  showNavigation?: boolean;
}

const AppLayout: React.FC<AppLayoutProps> = ({ 
  title, 
  children, 
  showHeader = true, 
  showNavigation = true 
}) => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Consistent Header with Logo and User Info */}
      {showHeader && <DashboardHeader />}
      
      {/* Navigation */}
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
