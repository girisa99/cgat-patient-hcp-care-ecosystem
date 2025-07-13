import React, { ReactNode } from 'react';
import { StabilityProvider, useModuleStability, useHookProtection, useLayoutProtection } from './StabilityProvider';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, AlertTriangle } from 'lucide-react';

interface ProtectedModuleWrapperProps {
  children: ReactNode;
  moduleId: string;
  enableHookProtection?: boolean;
  enableLayoutProtection?: boolean;
  elementId?: string;
}

/**
 * ProtectedModuleWrapper - Wraps modules with comprehensive stability protection
 */
const ProtectedModuleWrapper: React.FC<ProtectedModuleWrapperProps> = ({
  children,
  moduleId,
  enableHookProtection = true,
  enableLayoutProtection = true,
  elementId
}) => {
  const { moduleHealth, reportError, reportRecovery } = useModuleStability(moduleId);
  const { elementRef, hasShift } = useLayoutProtection(elementId || moduleId);

  // Track hook protection for common hooks
  if (enableHookProtection) {
    useHookProtection('useMasterAuth', moduleId);
    useHookProtection('useMasterData', moduleId);
    useHookProtection('useMasterApplication', moduleId);
    useHookProtection('useMasterRoleManagement', moduleId);
  }

  // Error boundary effect
  React.useEffect(() => {
    const handleError = (error: ErrorEvent) => {
      if (error.filename?.includes(moduleId)) {
        reportError(new Error(error.message));
      }
    };

    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, [moduleId, reportError]);

  // Recovery detection
  React.useEffect(() => {
    if (moduleHealth?.errorCount && moduleHealth.errorCount > 0 && moduleHealth.healthStatus === 'healthy') {
      reportRecovery();
    }
  }, [moduleHealth, reportRecovery]);

  return (
    <div ref={elementRef as React.RefObject<HTMLDivElement>} data-module-id={moduleId} className="protected-module">
      {/* Health Status Alert */}
      {moduleHealth?.healthStatus === 'critical' && (
        <Alert className="mb-4">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Module {moduleId} is in critical state. Error count: {moduleHealth.errorCount}
          </AlertDescription>
        </Alert>
      )}

      {/* Layout Shift Warning */}
      {hasShift && (
        <Alert className="mb-4">
          <Shield className="h-4 w-4" />
          <AlertDescription>
            Layout shift detected in {moduleId}. Page stability may be affected.
          </AlertDescription>
        </Alert>
      )}

      {children}
    </div>
  );
};

interface StabilityProtectedAppProps {
  children: ReactNode;
  enableGlobalMonitoring?: boolean;
  alertThreshold?: number;
}

/**
 * StabilityProtectedApp - Top-level app wrapper with comprehensive protection
 */
export const StabilityProtectedApp: React.FC<StabilityProtectedAppProps> = ({
  children,
  enableGlobalMonitoring = true,
  alertThreshold = 3
}) => {
  return (
    <StabilityProvider 
      enableMonitoring={enableGlobalMonitoring}
      alertThreshold={alertThreshold}
    >
      <div className="stability-protected-app">
        {children}
      </div>
    </StabilityProvider>
  );
};

/**
 * withStabilityProtection - HOC for adding stability protection to any component
 */
export const withStabilityProtection = <P extends object>(
  Component: React.ComponentType<P>,
  moduleId: string,
  options: {
    enableHookProtection?: boolean;
    enableLayoutProtection?: boolean;
    elementId?: string;
  } = {}
) => {
  const ProtectedComponent = React.forwardRef<any, P>((props, ref) => (
    <ProtectedModuleWrapper
      moduleId={moduleId}
      enableHookProtection={options.enableHookProtection}
      enableLayoutProtection={options.enableLayoutProtection}
      elementId={options.elementId}
    >
      <Component {...(props as P)} />
    </ProtectedModuleWrapper>
  ));

  ProtectedComponent.displayName = `withStabilityProtection(${moduleId})`;
  
  return ProtectedComponent;
};

// Enhanced module wrappers with stability protection
export const StabilityProtectedUserModule: React.FC<{ children: ReactNode }> = ({ children }) => (
  <ProtectedModuleWrapper moduleId="user-management">
    {children}
  </ProtectedModuleWrapper>
);

export const StabilityProtectedFacilityModule: React.FC<{ children: ReactNode }> = ({ children }) => (
  <ProtectedModuleWrapper moduleId="facility-management">
    {children}
  </ProtectedModuleWrapper>
);

export const StabilityProtectedAPIModule: React.FC<{ children: ReactNode }> = ({ children }) => (
  <ProtectedModuleWrapper moduleId="api-services">
    {children}
  </ProtectedModuleWrapper>
);

export const StabilityProtectedTestingModule: React.FC<{ children: ReactNode }> = ({ children }) => (
  <ProtectedModuleWrapper moduleId="testing-service-suite">
    {children}
  </ProtectedModuleWrapper>
);

export const StabilityProtectedDataImportModule: React.FC<{ children: ReactNode }> = ({ children }) => (
  <ProtectedModuleWrapper moduleId="data-import">
    {children}
  </ProtectedModuleWrapper>
);

export const StabilityProtectedOnboardingModule: React.FC<{ children: ReactNode }> = ({ children }) => (
  <ProtectedModuleWrapper moduleId="customer-onboarding">
    {children}
  </ProtectedModuleWrapper>
);