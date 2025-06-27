
import React, { useState } from 'react';
import { useResponsiveLayout } from '@/hooks/useResponsiveLayout';
import Header from './Header';
import Sidebar from './Sidebar';
import { Button } from '@/components/ui/button';
import { Menu } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SimplifiedDashboardLayoutProps {
  children: React.ReactNode;
  className?: string;
}

const SimplifiedDashboardLayout: React.FC<SimplifiedDashboardLayoutProps> = ({
  children,
  className,
}) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { isMobile } = useResponsiveLayout();

  return (
    <div className="min-h-screen bg-background">
      {/* Fixed Header */}
      <Header />
      
      {/* Mobile menu button */}
      {isMobile && (
        <div className="h-12 bg-background border-b px-4 flex items-center md:hidden">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setSidebarOpen(true)}
            className="flex items-center space-x-2"
          >
            <Menu className="h-4 w-4" />
            <span>Menu</span>
          </Button>
        </div>
      )}
      
      {/* Content area */}
      <div className="flex">
        {/* Sidebar */}
        <Sidebar 
          isOpen={sidebarOpen} 
          onClose={() => setSidebarOpen(false)} 
        />
        
        {/* Main content area */}
        <main 
          className={cn(
            "flex-1 min-h-screen bg-background",
            // Add left margin only on desktop to account for fixed sidebar
            !isMobile ? "ml-64" : "ml-0",
            className
          )}
          style={{
            // Ensure we account for header height
            paddingTop: isMobile ? '112px' : '64px' // 64px header + 48px mobile menu (when present)
          }}
        >
          <div className="w-full h-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default SimplifiedDashboardLayout;
