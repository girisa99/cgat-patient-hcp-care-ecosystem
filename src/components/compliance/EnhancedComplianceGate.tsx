/**
 * Enhanced Compliance Gate
 * 
 * Combines geo-blocking with suspicious activity detection.
 * Blocks users from sanctioned regions AND those attempting bypass.
 */

import React, { ReactNode } from 'react';
import { useGeoCompliance, GeoComplianceProvider } from '@/hooks/useGeoCompliance';
import { SuspiciousActivityProvider, useSuspiciousActivity } from '@/hooks/useSuspiciousActivityDetection';
import { SanctionsBlockScreen } from './SanctionsBlockScreen';
import { SuspiciousActivityBlockScreen } from './SuspiciousActivityBlockScreen';
import { PageLoading } from '@/components/ui/LoadingStates';

interface ComplianceGateInnerProps {
  children: ReactNode;
  allowSuspiciousWithWarning?: boolean;
}

function ComplianceGateInner({ children, allowSuspiciousWithWarning = false }: ComplianceGateInnerProps) {
  const { 
    isLoading: geoLoading, 
    isBlocked, 
    blockReason, 
    countryCode, 
    countryName,
    recheckCompliance,
    isCheckingCompliance 
  } = useGeoCompliance();
  const { isLoading: activityLoading, isSuspicious, suspicionReasons, riskScore } = useSuspiciousActivity();

  // Show loading while checking
  if (geoLoading || activityLoading) {
    return <PageLoading message="Verifying access..." />;
  }

  // Block if from sanctioned region
  if (isBlocked) {
    console.warn('[ComplianceGate] Access blocked - sanctioned region:', countryCode);
    return (
      <SanctionsBlockScreen 
        countryName={countryName}
        blockReason={blockReason}
        onRetry={recheckCompliance}
        isRetrying={isCheckingCompliance}
      />
    );
  }

  // Block if suspicious activity detected with high risk score
  if (isSuspicious && riskScore >= 70) {
    console.warn('[ComplianceGate] Access blocked - suspicious activity:', {
      reasons: suspicionReasons,
      riskScore
    });
    return (
      <SuspiciousActivityBlockScreen 
        reasons={suspicionReasons}
        riskScore={riskScore}
      />
    );
  }

  // Log warning for moderate risk but allow access
  if (isSuspicious && riskScore >= 50 && riskScore < 70) {
    console.warn('[ComplianceGate] Suspicious activity detected (moderate risk):', {
      reasons: suspicionReasons,
      riskScore
    });
    // Could show a warning banner here if needed
  }

  return <>{children}</>;
}

interface EnhancedComplianceGateProps {
  children: ReactNode;
  allowSuspiciousWithWarning?: boolean;
}

function ComplianceWithActivity({ children, allowSuspiciousWithWarning }: EnhancedComplianceGateProps) {
  const { countryCode } = useGeoCompliance();
  
  return (
    <SuspiciousActivityProvider detectedCountryCode={countryCode}>
      <ComplianceGateInner allowSuspiciousWithWarning={allowSuspiciousWithWarning}>
        {children}
      </ComplianceGateInner>
    </SuspiciousActivityProvider>
  );
}

export function EnhancedComplianceGate({ children, allowSuspiciousWithWarning = false }: EnhancedComplianceGateProps) {
  return (
    <GeoComplianceProvider>
      <ComplianceWithActivity allowSuspiciousWithWarning={allowSuspiciousWithWarning}>
        {children}
      </ComplianceWithActivity>
    </GeoComplianceProvider>
  );
}

export default EnhancedComplianceGate;
