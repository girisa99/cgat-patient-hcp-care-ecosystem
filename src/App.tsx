import React, { Suspense, useEffect } from 'react';
import { Toaster } from "sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { MasterAuthProvider } from './hooks/useMasterAuth';
import { useMasterAuth } from '@/hooks/useMasterAuth';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';
import { PageLoading } from '@/components/ui/LoadingStates';
import { initializeStabilityFramework } from '@/utils/framework/init';
import { StabilityProvider } from '@/components/stability/StabilityProvider';
import ProtectedRoute from '@/components/auth/ProtectedRoute';

// Import pages that exist
import Index from '@/pages/Index';
import Dashboard from '@/pages/Dashboard';
import Users from '@/pages/Users';
import Patients from '@/pages/Patients';
import Facilities from '@/pages/Facilities';
import PackageResearch from '@/components/PackageResearch';
import DataImport from '@/pages/DataImport';

import Modules from '@/pages/Modules';
import ApiServices from '@/pages/ApiServices';
import NgrokIntegration from '@/pages/NgrokIntegration';
import Security from '@/pages/Security';
import Reports from '@/pages/Reports';
import Testing from '@/pages/Testing';
import FrameworkDashboard from '@/pages/FrameworkDashboard';
import RoleManagement from '@/pages/RoleManagement';
import Stability from '@/pages/Stability';
import Governance from '@/pages/Governance';
import Agents from '@/pages/Agents';
import Login from '@/pages/Login';
import DeploymentManagement from '@/pages/DeploymentManagement';
import OnboardingDashboard from '@/pages/OnboardingDashboard';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

const AppContent = () => {
  console.log('🎯 AppContent rendering...');
  const { isAuthenticated, isLoading, userRoles } = useMasterAuth();

  console.log('🎯 Auth state:', { isAuthenticated, isLoading, userRoles });

  // Show loading screen while auth is initializing
  if (isLoading) {
    console.log('⏳ Showing loading screen...');
    return <PageLoading message="Initializing application..." />;
  }

  console.log('🎯 Rendering routes, isAuthenticated:', isAuthenticated);

  return (
    <ErrorBoundary>
      <BrowserRouter>
        <div className="min-h-screen bg-background">
          <Suspense fallback={<PageLoading message="Loading page..." />}>
            <Routes>
              {/* Public routes */}
              <Route path="/login" element={<Login />} />
              
              {/* Protected routes */}
              {isAuthenticated ? (
                <>
                  {/* Role-based default route */}
                  <Route path="/" element={
                    userRoles.includes('onboardingTeam') && !userRoles.includes('superAdmin') 
                      ? <OnboardingDashboard /> 
                      : <Dashboard />
                  } />
                  
                  {/* SuperAdmin & Admin & Healthcare Staff routes */}
                  <Route path="/dashboard" element={
                    <ProtectedRoute requiredRoles={['superAdmin', 'admin', 'healthcareProvider', 'nurse', 'caseManager', 'onboardingTeam']}>
                      <Dashboard />
                    </ProtectedRoute>
                  } />
                  <Route path="/index" element={
                    <ProtectedRoute requiredRoles={['superAdmin', 'admin']}>
                      <Index />
                    </ProtectedRoute>
                  } />
                  <Route path="/users" element={
                    <ProtectedRoute requiredRoles={['superAdmin', 'admin']}>
                      <Users />
                    </ProtectedRoute>
                  } />
                  <Route path="/patients" element={
                    <ProtectedRoute requiredRoles={['superAdmin', 'admin', 'healthcareProvider', 'nurse', 'caseManager']}>
                      <Patients />
                    </ProtectedRoute>
                  } />
                  
                  {/* OnboardingTeam accessible routes */}
                  <Route path="/agents" element={
                    <ProtectedRoute requiredRoles={['superAdmin', 'admin', 'onboardingTeam']}>
                      <Agents />
                    </ProtectedRoute>
                  } />
                  <Route path="/testing" element={
                    <ProtectedRoute requiredRoles={['superAdmin', 'onboardingTeam']}>
                      <Testing />
                    </ProtectedRoute>
                  } />
                  <Route path="/data-import" element={
                    <ProtectedRoute requiredRoles={['superAdmin', 'onboardingTeam']}>
                      <DataImport />
                    </ProtectedRoute>
                  } />
                  
                  <Route path="/facilities" element={
                    <ProtectedRoute requiredRoles={['superAdmin', 'admin']}>
                      <Facilities />
                    </ProtectedRoute>
                  } />
                  
                  {/* Onboarding route - accessible to onboardingTeam and superAdmin */}
                  <Route path="/onboarding" element={
                    <ProtectedRoute requiredRoles={['superAdmin', 'onboardingTeam']}>
                      <OnboardingDashboard />
                    </ProtectedRoute>
                  } />
                  
                  {/* Technical/Admin routes - SuperAdmin only */}
                  <Route path="/deployment" element={
                    <ProtectedRoute requiredRoles={['superAdmin']}>
                      <DeploymentManagement />
                    </ProtectedRoute>
                  } />
                  <Route path="/modules" element={
                    <ProtectedRoute requiredRoles={['superAdmin']}>
                      <Modules />
                    </ProtectedRoute>
                  } />
                  <Route path="/api-services" element={
                    <ProtectedRoute requiredRoles={['superAdmin']}>
                      <ApiServices />
                    </ProtectedRoute>
                  } />
                  <Route path="/ngrok" element={
                    <ProtectedRoute requiredRoles={['superAdmin']}>
                      <NgrokIntegration />
                    </ProtectedRoute>
                  } />
                  <Route path="/security" element={
                    <ProtectedRoute requiredRoles={['superAdmin']}>
                      <Security />
                    </ProtectedRoute>
                  } />
                  <Route path="/reports" element={
                    <ProtectedRoute requiredRoles={['superAdmin', 'admin']}>
                      <Reports />
                    </ProtectedRoute>
                  } />
                  <Route path="/framework" element={
                    <ProtectedRoute requiredRoles={['superAdmin']}>
                      <FrameworkDashboard />
                    </ProtectedRoute>
                  } />
                  <Route path="/role-management" element={
                    <ProtectedRoute requiredRoles={['superAdmin']}>
                      <RoleManagement />
                    </ProtectedRoute>
                  } />
                  <Route path="/stability" element={
                    <ProtectedRoute requiredRoles={['superAdmin']}>
                      <Stability />
                    </ProtectedRoute>
                  } />
                  <Route path="/stability/dashboard" element={
                    <ProtectedRoute requiredRoles={['superAdmin']}>
                      <Suspense fallback={<PageLoading message="Loading stability dashboard..." />}>
                        {React.createElement(React.lazy(() => import('@/components/stability/StabilityDashboard').then(m => ({ default: m.StabilityDashboard }))))}
                      </Suspense>
                    </ProtectedRoute>
                  } />
                  <Route path="/governance" element={
                    <ProtectedRoute requiredRoles={['superAdmin']}>
                      <Governance />
                    </ProtectedRoute>
                  } />
                  <Route path="/healthcare-ai" element={
                    <ProtectedRoute requiredRoles={['superAdmin', 'admin', 'healthcareProvider']}>
                      <Suspense fallback={<PageLoading message="Loading healthcare AI..." />}>
                        {React.createElement(React.lazy(() => import('@/components/healthcare/HealthcareAIDashboard').then(m => ({ default: m.default }))))}
                      </Suspense>
                    </ProtectedRoute>
                  } />
                  <Route path="/research" element={
                    <ProtectedRoute requiredRoles={['superAdmin']}>
                      <PackageResearch />
                    </ProtectedRoute>
                  } />
                </>
              ) : (
                <>
                  <Route path="/" element={<Login />} />
                  <Route path="*" element={<Navigate to="/login" replace />} />
                </>
              )}
            </Routes>
          </Suspense>
        </div>
      </BrowserRouter>
    </ErrorBoundary>
  );
};

const App = () => {
  // Initialize stability framework on app startup
  useEffect(() => {
    initializeStabilityFramework().catch(console.error);
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <MasterAuthProvider>
        <StabilityProvider>
          <TooltipProvider>
            <Toaster />
            <AppContent />
          </TooltipProvider>
        </StabilityProvider>
      </MasterAuthProvider>
    </QueryClientProvider>
  );
};

export default App;