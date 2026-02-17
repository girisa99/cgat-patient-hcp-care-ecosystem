/**
 * GeoComplianceGate Component
 * 
 * Wraps application content and blocks access for users in sanctioned regions.
 * Should be placed high in the component tree, ideally wrapping the main App content.
 */

import React, { ReactNode } from 'react';
import { useGeoCompliance } from '@/hooks/useGeoCompliance';
import { SanctionsBlockScreen } from './SanctionsBlockScreen';
import { Loader2 } from 'lucide-react';

interface GeoComplianceGateProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export const GeoComplianceGate: React.FC<GeoComplianceGateProps> = ({
  children,
  fallback
}) => {
  const { 
    isLoading, 
    isBlocked, 
    countryName, 
    blockReason,
    recheckCompliance,
    isCheckingCompliance
  } = useGeoCompliance();

  // Show loading state while checking
  if (isLoading) {
    return fallback || (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="text-sm text-muted-foreground">Verifying access...</p>
        </div>
      </div>
    );
  }

  // Block access for sanctioned regions
  if (isBlocked) {
    return (
      <SanctionsBlockScreen
        countryName={countryName}
        blockReason={blockReason}
        onRetry={recheckCompliance}
        isRetrying={isCheckingCompliance}
      />
    );
  }

  // Allow access
  return <>{children}</>;
};

export default GeoComplianceGate;
