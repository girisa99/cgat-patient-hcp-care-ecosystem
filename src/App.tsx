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

// Import pages that exist
import Index from '@/pages/Index';
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
import Login from '@/pages/Login';

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
  const { isAuthenticated, isLoading } = useMasterAuth();

  console.log('🎯 Auth state:', { isAuthenticated, isLoading });

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
                  <Route path="/" element={<Index />} />
                  <Route path="/dashboard" element={<Index />} />
                  <Route path="/users" element={<Users />} />
                  <Route path="/patients" element={<Patients />} />
                  <Route path="/facilities" element={<Facilities />} />
                  
                   <Route path="/modules" element={<Modules />} />
                   <Route path="/api-services" element={<ApiServices />} />
                   <Route path="/data-import" element={<DataImport />} />
                   <Route path="/ngrok" element={<NgrokIntegration />} />
                   <Route path="/security" element={<Security />} />
                   <Route path="/reports" element={<Reports />} />
                    <Route path="/testing" element={<Testing />} />
                    <Route path="/framework" element={<FrameworkDashboard />} />
                   <Route path="/role-management" element={<RoleManagement />} />
                  <Route path="/stability" element={<Stability />} />
                  <Route path="/stability/dashboard" element={
                    <Suspense fallback={<PageLoading message="Loading stability dashboard..." />}>
                      {React.createElement(React.lazy(() => import('@/components/monitoring/StabilityDashboard').then(m => ({ default: m.StabilityDashboard }))))}
                    </Suspense>
                  } />
                  <Route path="/governance" element={
                    <Suspense fallback={<PageLoading message="Loading governance dashboard..." />}>
                      {React.createElement(React.lazy(() => import('@/components/monitoring/GovernanceDashboard').then(m => ({ default: m.default }))))}
                    </Suspense>
                  } />
                  <Route path="/research" element={<PackageResearch />} />
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
        <TooltipProvider>
          <Toaster />
          <AppContent />
        </TooltipProvider>
      </MasterAuthProvider>
    </QueryClientProvider>
  );
};

export default App;