
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
  const { isAuthenticated, isLoading } = useMasterAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading application...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <MasterAuthForm />;
  }

  return (
    <BrowserRouter>
      <SidebarProvider>
        <div className="min-h-screen flex w-full">
          <AppSidebar />
          <main className="flex-1 overflow-auto">
            <Suspense fallback={<div className="p-8">Loading...</div>}>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/users" element={<Users />} />
                <Route path="/modules" element={<SimpleModules />} />
                <Route path="/role-management" element={<RoleManagement />} />
                <Route path="/patients" element={<Patients />} />
                <Route path="/facilities" element={<Facilities />} />
                <Route path="/api-services" element={<ApiServices />} />
                <Route path="/testing" element={<Testing />} />
                <Route path="/data-import" element={<DataImport />} />
                <Route path="/active-verification" element={<ActiveVerification />} />
                <Route path="/onboarding" element={<Onboarding />} />
                <Route path="/security" element={<Security />} />
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
