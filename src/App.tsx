import React, { Suspense } from 'react';
import { Toaster } from "sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { SidebarProvider } from '@/components/ui/sidebar-database-aligned';
import { AppSidebar } from '@/components/sidebar/AppSidebar';
import { MasterAuthProvider } from './hooks/useMasterAuth';
import { useMasterAuth } from '@/hooks/useMasterAuth';
import { TenantProvider } from '@/contexts/TenantContext';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';
import { PageLoading } from '@/components/ui/LoadingStates';

// Import pages that exist
import Index from '@/pages/Index';
import Users from '@/pages/Users';
import Patients from '@/pages/Patients';
import Facilities from '@/pages/Facilities';
import Onboarding from '@/pages/Onboarding';
import Modules from '@/pages/Modules';
import ApiServices from '@/pages/ApiServices';
import NgrokIntegration from '@/pages/NgrokIntegration';
import Security from '@/pages/Security';
import Reports from '@/pages/Reports';
import Testing from '@/pages/Testing';
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
  const { isAuthenticated, isLoading } = useMasterAuth();

  // Show loading screen while auth is initializing
  if (isLoading) {
    return <PageLoading message="Initializing application..." />;
  }

  return (
    <ErrorBoundary>
      <BrowserRouter>
        <SidebarProvider>
          <div className="flex min-h-screen w-full">
            {isAuthenticated && <AppSidebar />}
            <div className="flex-1 min-h-screen bg-gray-50">
              <Suspense fallback={<PageLoading message="Loading page..." />}>
                <Routes>
                  {/* Public routes */}
                  <Route path="/login" element={<Login />} />
                  
                  {/* Protected routes */}
                  {isAuthenticated ? (
                    <>
                      <Route path="/" element={<Index />} />
                      <Route path="/users" element={<Users />} />
                      <Route path="/patients" element={<Patients />} />
                      <Route path="/facilities" element={<Facilities />} />
                      <Route path="/onboarding" element={<Onboarding />} />
                      <Route path="/modules" element={<Modules />} />
                      <Route path="/api-services" element={<ApiServices />} />
                      <Route path="/ngrok" element={<NgrokIntegration />} />
                      <Route path="/security" element={<Security />} />
                      <Route path="/reports" element={<Reports />} />
                      <Route path="/testing" element={<Testing />} />
                      <Route path="/role-management" element={<RoleManagement />} />
                      <Route path="/stability" element={<Stability />} />
                    </>
                  ) : (
                    <Route path="*" element={<Navigate to="/login" replace />} />
                  )}
                </Routes>
              </Suspense>
            </div>
          </div>
        </SidebarProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <MasterAuthProvider>
      <TenantProvider>
        <TooltipProvider>
          <Toaster />
          <AppContent />
        </TooltipProvider>
      </TenantProvider>
    </MasterAuthProvider>
  </QueryClientProvider>
);

export default App;