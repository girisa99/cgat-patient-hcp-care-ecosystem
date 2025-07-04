/**
 * ENHANCED APP LAYOUT COMPONENT
 * Consistent layout wrapper with header, logo, and user info for all pages
 */
import React from 'react';
import DashboardHeader from './DashboardHeader';

interface AppLayoutProps {
  title: string;
  children: React.ReactNode;
  showHeader?: boolean;
}

const AppLayout: React.FC<AppLayoutProps> = ({ title, children, showHeader = true }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Consistent Header with Logo and User Info */}
      {showHeader && <DashboardHeader />}
      
      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
        </div>
        {children}
      </div>
    </div>
  );
};

export default AppLayout;
