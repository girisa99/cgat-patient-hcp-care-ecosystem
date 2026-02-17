import React, { ReactNode } from 'react';
import { ModuleErrorBoundary } from './ModuleErrorBoundary';
import { ModuleLoadingBoundary } from './ModuleLoadingBoundary';
import { ModuleProvider } from '@/contexts/ModuleContext';

interface IsolatedModuleProps {
  moduleName: string;
  children: ReactNode;
  
  // Module configuration
  permissions?: string[];
  settings?: Record<string, any>;
  
  // Error handling
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  errorFallback?: ReactNode;
  showRetry?: boolean;
  
  // Loading configuration
  loadingComponent?: ReactNode;
  loadingTimeout?: number;
  showModuleName?: boolean;
  
  // Isolation settings
  isolated?: boolean;
  className?: string;
  
  // Performance
  lazy?: boolean;
  preload?: boolean;
}

/**
 * IsolatedModule - Complete isolation wrapper for application modules
 * 
 * Features:
 * - Error boundary isolation
 * - Loading state management
 * - Module-specific context
 * - Permission-based access control
 * - Performance optimizations
 */
export const IsolatedModule: React.FC<IsolatedModuleProps> = ({
  moduleName,
  children,
  permissions = [],
  settings = {},
  onError,
  errorFallback,
  showRetry = true,
  loadingComponent,
  loadingTimeout = 10000,
  showModuleName = true,
  isolated = true,
  className,
  lazy = false,
  preload = false
}) => {
  // Enhanced error handler with module context
  const handleModuleError = React.useCallback((error: Error, errorInfo: React.ErrorInfo) => {
    console.error(`🚨 Module Error [${moduleName}]:`, {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      moduleName,
      permissions,
      timestamp: new Date().toISOString()
    });

    // Call custom error handler
    onError?.(error, errorInfo);

    // Report to error tracking service if available
    if (typeof window !== 'undefined' && (window as any).errorTracker) {
      (window as any).errorTracker.captureException(error, {
        tags: { module: moduleName },
        extra: { errorInfo, permissions }
      });
    }
  }, [moduleName, permissions, onError]);

  // Preload effect for performance
  React.useEffect(() => {
    if (preload) {
      console.log(`🚀 Preloading module: ${moduleName}`);
      // Module preloading logic could go here
    }
  }, [preload, moduleName]);

  // Lazy loading wrapper
  const ModuleContent = React.useMemo(() => {
    if (lazy) {
      return React.lazy(() => 
        Promise.resolve({ default: () => <>{children}</> })
      );
    }
    return () => <>{children}</>;
  }, [lazy, children]);

  const moduleContent = lazy ? <ModuleContent /> : children;

  return (
    <div 
      className={`isolated-module ${className || ''}`}
      data-module={moduleName}
      data-isolated={isolated}
    >
      <ModuleErrorBoundary
        moduleName={moduleName}
        onError={handleModuleError}
        fallbackComponent={errorFallback}
        showRetry={showRetry}
      >
        <ModuleProvider
          moduleName={moduleName}
          initialPermissions={permissions}
          initialSettings={settings}
          isolated={isolated}
        >
          <ModuleLoadingBoundary
            moduleName={moduleName}
            loadingComponent={loadingComponent}
            timeout={loadingTimeout}
            showModuleName={showModuleName}
          >
            {moduleContent}
          </ModuleLoadingBoundary>
        </ModuleProvider>
      </ModuleErrorBoundary>
    </div>
  );
};

// Specialized module wrappers for common use cases

export const UserManagementModule: React.FC<{ children: ReactNode }> = ({ children }) => (
  <IsolatedModule
    moduleName="User Management"
    permissions={['user_management', 'user_read', 'user_write']}
    settings={{ 
      pageSize: 50,
      enableFilters: true,
      enableExport: true 
    }}
    loadingTimeout={8000}
  >
    {children}
  </IsolatedModule>
);

export const FacilityManagementModule: React.FC<{ children: ReactNode }> = ({ children }) => (
  <IsolatedModule
    moduleName="Facility Management"
    permissions={['facility_management', 'facility_read', 'facility_write']}
    settings={{ 
      mapEnabled: true,
      defaultView: 'list',
      enableBulkOperations: true 
    }}
    loadingTimeout={6000}
  >
    {children}
  </IsolatedModule>
);

export const OnboardingModule: React.FC<{ children: ReactNode }> = ({ children }) => (
  <IsolatedModule
    moduleName="Onboarding"
    permissions={['onboarding_read', 'onboarding_write', 'onboarding_approve']}
    settings={{ 
      autoSave: true,
      validationMode: 'strict',
      enableWorkflow: true 
    }}
    loadingTimeout={12000}
  >
    {children}
  </IsolatedModule>
);

export const PatientManagementModule: React.FC<{ children: ReactNode }> = ({ children }) => (
  <IsolatedModule
    moduleName="Patient Management"
    permissions={['patient_read', 'patient_write', 'patient_phi_access']}
    settings={{ 
      hipaaCompliance: true,
      auditLogging: true,
      encryptionEnabled: true 
    }}
    loadingTimeout={10000}
  >
    {children}
  </IsolatedModule>
);

// API Services Module
export const APIServicesModule: React.FC<{ children: ReactNode }> = ({ children }) => (
  <IsolatedModule
    moduleName="API Services"
    permissions={['api_management', 'api_read', 'api_write', 'api_keys']}
    settings={{ 
      rateLimitMonitoring: true,
      enableVersioning: true,
      enableAnalytics: true,
      enableDeveloperPortal: true
    }}
    loadingTimeout={8000}
  >
    {children}
  </IsolatedModule>
);

// Testing Service Suite Module
export const TestingServiceSuiteModule: React.FC<{ children: ReactNode }> = ({ children }) => (
  <IsolatedModule
    moduleName="Testing Service Suite"
    permissions={['testing_read', 'testing_write', 'testing_execute', 'testing_admin']}
    settings={{ 
      cfrPart11Compliance: true,
      autoTestGeneration: true,
      performanceMonitoring: true,
      testReportGeneration: true,
      validationLevels: ['IQ', 'OQ', 'PQ']
    }}
    loadingTimeout={15000}
  >
    {children}
  </IsolatedModule>
);

// Data Import Module
export const DataImportModule: React.FC<{ children: ReactNode }> = ({ children }) => (
  <IsolatedModule
    moduleName="Data Import"
    permissions={['data_import', 'data_read', 'data_write', 'data_validate']}
    settings={{ 
      maxFileSize: '100MB',
      supportedFormats: ['CSV', 'Excel', 'JSON', 'XML'],
      enableValidation: true,
      enablePreview: true,
      batchProcessing: true
    }}
    loadingTimeout={20000}
  >
    {children}
  </IsolatedModule>
);

// Customer Onboarding Module (specialized for customer role)
export const CustomerOnboardingModule: React.FC<{ children: ReactNode }> = ({ children }) => (
  <IsolatedModule
    moduleName="Customer Onboarding"
    permissions={['customer_onboarding', 'customer_read', 'customer_write']}
    settings={{ 
      workflowEnabled: true,
      documentUpload: true,
      complianceChecks: true,
      financialAssessment: true,
      contractManagement: true,
      autoNotifications: true
    }}
    loadingTimeout={10000}
  >
    {children}
  </IsolatedModule>
);

// Analytics & Reporting Module
export const AnalyticsReportingModule: React.FC<{ children: ReactNode }> = ({ children }) => (
  <IsolatedModule
    moduleName="Analytics & Reporting"
    permissions={['analytics_read', 'reports_read', 'reports_generate']}
    settings={{ 
      realTimeAnalytics: true,
      exportFormats: ['PDF', 'Excel', 'CSV'],
      dashboardCustomization: true,
      scheduledReports: true
    }}
    loadingTimeout={12000}
  >
    {children}
  </IsolatedModule>
);

// Developer Portal Module
export const DeveloperPortalModule: React.FC<{ children: ReactNode }> = ({ children }) => (
  <IsolatedModule
    moduleName="Developer Portal"
    permissions={['developer_portal', 'api_documentation', 'api_keys']}
    settings={{ 
      interactiveDocumentation: true,
      codeExamples: true,
      apiKeyManagement: true,
      usageAnalytics: true,
      sandboxEnvironment: true
    }}
    loadingTimeout={8000}
  >
    {children}
  </IsolatedModule>
);

// Marketplace Module
export const MarketplaceModule: React.FC<{ children: ReactNode }> = ({ children }) => (
  <IsolatedModule
    moduleName="Marketplace"
    permissions={['marketplace_read', 'marketplace_publish', 'marketplace_manage']}
    settings={{ 
      apiListings: true,
      verificationSystem: true,
      ratingSystem: true,
      monetization: true
    }}
    loadingTimeout={10000}
  >
    {children}
  </IsolatedModule>
);

// High-order component for easy module wrapping
export const withModuleIsolation = <P extends object>(
  Component: React.ComponentType<P>,
  moduleConfig: Omit<IsolatedModuleProps, 'children'>
) => {
  const WrappedComponent = React.forwardRef<any, P>((props, ref) => (
    <IsolatedModule {...moduleConfig}>
      <Component {...(props as P)} />
    </IsolatedModule>
  ));

  WrappedComponent.displayName = `withModuleIsolation(${moduleConfig.moduleName})`;
  
  return WrappedComponent;
};