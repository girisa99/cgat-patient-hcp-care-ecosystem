import { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar-database-aligned";
import { MasterAuthProvider, useMasterAuth } from "@/hooks/useMasterAuth";
import { AppSidebar } from "@/components/sidebar/AppSidebar";
import MasterAuthForm from "@/components/auth/MasterAuthForm";
import RoleBasedRoute from "@/components/RoleBasedRoute";

const queryClient = new QueryClient();

// Lazy load pages
const Index = lazy(() => import("./pages/Index"));
const Users = lazy(() => import("./pages/Users"));
const SimpleModules = lazy(() => import("./pages/SimpleModules"));
const RoleManagement = lazy(() => import("./pages/RoleManagement"));
const Patients = lazy(() => import("./pages/Patients"));
const Facilities = lazy(() => import("./pages/Facilities"));
const ApiServices = lazy(() => import("./pages/ApiServices"));
const Testing = lazy(() => import("./pages/Testing"));
const DataImport = lazy(() => import("./pages/DataImport"));
const ActiveVerification = lazy(() => import("./pages/ActiveVerification"));
const Onboarding = lazy(() => import("./pages/Onboarding"));
const Security = lazy(() => import("./pages/Security"));

// Main App content component
const AppContent = () => {
  const { isAuthenticated, isLoading, user, userRoles } = useMasterAuth();

  console.log('🎯 SINGLE SOURCE OF TRUTH - Architecture Check:', {
    isAuthenticated,
    isLoading,
    userEmail: user?.email,
    userRoles,
    timestamp: new Date().toISOString()
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading GENIE Healthcare System...</p>
          <p className="text-sm text-gray-500 mt-2">Initializing single source of truth authentication...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <MasterAuthForm />;
  }

  // ✅ AUTHENTICATED - Apply proper RBAC with single source of truth
  console.log('🔐 User authenticated - Loading application with enterprise RBAC security');

  return (
    <BrowserRouter>
      <SidebarProvider>
        <div className="min-h-screen flex w-full">
          <AppSidebar />
          <main className="flex-1 overflow-auto">
            <Suspense fallback={
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p>Loading page...</p>
              </div>
            }>
              <Routes>
                {/* Dashboard - requires authentication */}
                <Route path="/" element={
                  <RoleBasedRoute path="/" requiredPermissions={['authenticated']}>
                    <Index />
                  </RoleBasedRoute>
                } />
                
                {/* User Management - requires admin access */}
                <Route path="/users" element={
                  <RoleBasedRoute path="/users" requiredPermissions={['users.read', 'admin.access']}>
                    <Users />
                  </RoleBasedRoute>
                } />
                
                {/* Patients - requires clinical access */}
                <Route path="/patients" element={
                  <RoleBasedRoute path="/patients" requiredPermissions={['patients.read', 'clinical.access']}>
                    <Patients />
                  </RoleBasedRoute>
                } />
                
                {/* Facilities - requires admin access */}
                <Route path="/facilities" element={
                  <RoleBasedRoute path="/facilities" requiredPermissions={['facilities.read', 'admin.access']}>
                    <Facilities />
                  </RoleBasedRoute>
                } />
                
                {/* Modules - requires admin access */}
                <Route path="/modules" element={
                  <RoleBasedRoute path="/modules" requiredPermissions={['modules.read', 'admin.access']}>
                    <SimpleModules />
                  </RoleBasedRoute>
                } />
                
                {/* API Services - requires technical access */}
                <Route path="/api-services" element={
                  <RoleBasedRoute path="/api-services" requiredPermissions={['api.read', 'technical.access']}>
                    <ApiServices />
                  </RoleBasedRoute>
                } />
                
                {/* Testing - requires technical access */}
                <Route path="/testing" element={
                  <RoleBasedRoute path="/testing" requiredPermissions={['testing.read', 'technical.access']}>
                    <Testing />
                  </RoleBasedRoute>
                } />
                
                {/* Data Import - requires admin access */}
                <Route path="/data-import" element={
                  <RoleBasedRoute path="/data-import" requiredPermissions={['data.import', 'admin.access']}>
                    <DataImport />
                  </RoleBasedRoute>
                } />
                
                {/* Active Verification - requires clinical access */}
                <Route path="/active-verification" element={
                  <RoleBasedRoute path="/active-verification" requiredPermissions={['verification.read', 'clinical.access']}>
                    <ActiveVerification />
                  </RoleBasedRoute>
                } />
                
                {/* Onboarding - requires onboarding access */}
                <Route path="/onboarding" element={
                  <RoleBasedRoute path="/onboarding" requiredPermissions={['onboarding.read', 'onboarding.access']}>
                    <Onboarding />
                  </RoleBasedRoute>
                } />
                
                {/* Security - requires admin access */}
                <Route path="/security" element={
                  <RoleBasedRoute path="/security" requiredPermissions={['security.read', 'admin.access']}>
                    <Security />
                  </RoleBasedRoute>
                } />
                
                {/* Role Management - requires super admin access */}
                <Route path="/role-management" element={
                  <RoleBasedRoute path="/role-management" requiredPermissions={['roles.manage', 'superAdmin.access']}>
                    <RoleManagement />
                  </RoleBasedRoute>
                } />
                
                {/* Catch all - redirect to dashboard */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Suspense>
          </main>
        </div>
      </SidebarProvider>
    </BrowserRouter>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <MasterAuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <AppContent />
      </TooltipProvider>
    </MasterAuthProvider>
  </QueryClientProvider>
);

export default App;
