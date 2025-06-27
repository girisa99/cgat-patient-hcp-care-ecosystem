
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/components/auth/AuthProvider";
import { lazy, Suspense } from "react";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

// Lazy load components
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Users = lazy(() => import("./pages/Users"));
const ConsistentUsers = lazy(() => import("./pages/ConsistentUsers"));
const Onboarding = lazy(() => import("./pages/Onboarding"));
const Patients = lazy(() => import("./pages/Patients"));
const Facilities = lazy(() => import("./pages/Facilities"));
const Modules = lazy(() => import("./pages/Modules"));
const ApiManagement = lazy(() => import("./pages/ApiManagement"));
const ApiIntegrations = lazy(() => import("./pages/ApiIntegrations"));
const AdminVerificationTest = lazy(() => import("./pages/AdminVerificationTest"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <Suspense fallback={<LoadingSpinner />}>
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/users" element={<Users />} />
                <Route path="/consistent-users" element={<ConsistentUsers />} />
                <Route path="/onboarding" element={<Onboarding />} />
                <Route path="/patients" element={<Patients />} />
                <Route path="/facilities" element={<Facilities />} />
                <Route path="/modules" element={<Modules />} />
                <Route path="/api-management" element={<ApiManagement />} />
                <Route path="/api-integrations" element={<ApiIntegrations />} />
                <Route path="/admin-verification" element={<AdminVerificationTest />} />
              </Routes>
            </Suspense>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
