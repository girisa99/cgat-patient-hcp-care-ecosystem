
/**
 * APP LAYOUT COMPONENT
 * Simple layout wrapper for pages
 */
import React from 'react';

interface AppLayoutProps {
  title: string;
  children: React.ReactNode;
}

const AppLayout: React.FC<AppLayoutProps> = ({ title, children }) => {
  return (
    <div className="min-h-screen bg-gray-50">
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
