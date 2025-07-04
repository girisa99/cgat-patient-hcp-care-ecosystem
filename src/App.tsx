import { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar-database-aligned";
import { MasterAuthProvider, useMasterAuth } from "@/hooks/useMasterAuth";
import { useRoleBasedNavigation } from "@/hooks/useRoleBasedNavigation";
import { AppSidebar } from "@/components/sidebar/AppSidebar";
import MasterAuthForm from "@/components/auth/MasterAuthForm";

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

// Development-friendly Route Protection Component
const ProtectedRoute = ({ children, path }: { children: React.ReactNode; path: string }) => {
  const { hasAccess, userRoles } = useRoleBasedNavigation();
  const { isLoading } = useMasterAuth();
  
  // Be permissive during loading or development
  if (isLoading || userRoles.length === 0) {
    console.log('🔓 ProtectedRoute: Allowing access during loading/development for path:', path);
    return <>{children}</>;
  }
  
  if (!hasAccess(path)) {
    console.log('🚫 ProtectedRoute: Access denied for path:', path, 'User roles:', userRoles);
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <h2 className="text-2xl font-bold text-red-600 mb-2">Access Restricted</h2>
          <p className="text-gray-600 mb-4">
            This page requires specific permissions. 
            {userRoles.length === 0 ? ' Please wait for role loading or contact support.' : ` Your current roles: ${userRoles.join(', ')}`}
          </p>
          <button 
            onClick={() => window.history.back()} 
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }
  
  return <>{children}</>;
};

// Main App content component
const AppContent = () => {
  const { isAuthenticated, isLoading, user, userRoles } = useMasterAuth();
  const { roleStats } = useRoleBasedNavigation();

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

  // Show role-based welcome message and debug info
  console.log('🎯 SINGLE SOURCE OF TRUTH - App loaded with:', {
    user: user?.email,
    userRoles,
    accessiblePages: roleStats.accessiblePages,
    roleLevel: roleStats.roleLevel,
    isAuthenticated,
    profileLoaded: !!user
  });

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
                {/* Dashboard - Always accessible */}
                <Route path="/" element={<Index />} />
                
                {/* All other routes with development-friendly protection */}
                <Route path="/users" element={
                  <ProtectedRoute path="/users">
                    <Users />
                  </ProtectedRoute>
                } />
                
                <Route path="/patients" element={
                  <ProtectedRoute path="/patients">
                    <Patients />
                  </ProtectedRoute>
                } />
                
                <Route path="/facilities" element={
                  <ProtectedRoute path="/facilities">
                    <Facilities />
                  </ProtectedRoute>
                } />
                
                <Route path="/modules" element={
                  <ProtectedRoute path="/modules">
                    <SimpleModules />
                  </ProtectedRoute>
                } />
                
                <Route path="/api-services" element={
                  <ProtectedRoute path="/api-services">
                    <ApiServices />
                  </ProtectedRoute>
                } />
                
                <Route path="/testing" element={
                  <ProtectedRoute path="/testing">
                    <Testing />
                  </ProtectedRoute>
                } />
                
                <Route path="/data-import" element={
                  <ProtectedRoute path="/data-import">
                    <DataImport />
                  </ProtectedRoute>
                } />
                
                <Route path="/active-verification" element={
                  <ProtectedRoute path="/active-verification">
                    <ActiveVerification />
                  </ProtectedRoute>
                } />
                
                <Route path="/onboarding" element={
                  <ProtectedRoute path="/onboarding">
                    <Onboarding />
                  </ProtectedRoute>
                } />
                
                <Route path="/security" element={
                  <ProtectedRoute path="/security">
                    <Security />
                  </ProtectedRoute>
                } />
                
                <Route path="/role-management" element={
                  <ProtectedRoute path="/role-management">
                    <RoleManagement />
                  </ProtectedRoute>
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
