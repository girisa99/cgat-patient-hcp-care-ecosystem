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
              <>
                <Route path="/" element={<Login />} />
                <Route path="*" element={<Navigate to="/login" replace />} />
              </>
            )}
          </Routes>
        </div>
      </BrowserRouter>
    </ErrorBoundary>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <MasterAuthProvider>
      <TooltipProvider>
        <Toaster />
        <AppContent />
      </TooltipProvider>
    </MasterAuthProvider>
  </QueryClientProvider>
);

export default App;