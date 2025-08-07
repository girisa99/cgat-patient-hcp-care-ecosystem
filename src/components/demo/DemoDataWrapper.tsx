/**
 * Demo Data Wrapper Component
 * Wraps components to provide demo data when in demo mode
 */

import React, { ReactNode } from 'react';
import { useDemoMode } from '@/hooks/useDemoMode';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Info } from 'lucide-react';

interface DemoDataWrapperProps {
  children: ReactNode;
  dataCategory: string;
  fallbackComponent?: ReactNode;
  showDemoAlert?: boolean;
}

export const DemoDataWrapper: React.FC<DemoDataWrapperProps> = ({
  children,
  dataCategory,
  fallbackComponent,
  showDemoAlert = false
}) => {
  const { 
    isDemoMode, 
    isLoadingMockData, 
    getMockData,
    demoConfig 
  } = useDemoMode();

  // If not in demo mode, render children normally
  if (!isDemoMode) {
    return <>{children}</>;
  }

  // Show loading state while mock data is being generated
  if (isLoadingMockData) {
    return fallbackComponent || (
      <div className="space-y-3">
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-6 w-1/2" />
      </div>
    );
  }

  // Get mock data for the specified category
  const mockData = getMockData(dataCategory);

  return (
    <div>
      {showDemoAlert && demoConfig.showDemoIndicators && (
        <Alert className="mb-4 border-orange-200 bg-orange-50">
          <Info className="h-4 w-4 text-orange-600" />
          <AlertDescription className="text-orange-800">
            <strong>Demo Mode:</strong> This data is simulated for demonstration purposes. 
            {mockData.length > 0 && ` Showing ${mockData.length} sample ${dataCategory}.`}
          </AlertDescription>
        </Alert>
      )}
      
      {/* Inject mock data into children via React.cloneElement if possible */}
      {React.isValidElement(children) 
        ? React.cloneElement(children as React.ReactElement<any>, { 
            demoData: mockData,
            isDemoMode: true 
          })
        : children
      }
    </div>
  );
};