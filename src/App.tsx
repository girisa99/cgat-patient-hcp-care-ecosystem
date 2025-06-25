
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/components/auth/AuthProvider";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import DashboardLayout from "@/components/layout/DashboardLayout";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import Users from "./pages/Users";
import Facilities from "./pages/Facilities";
import Onboarding from "./pages/Onboarding";
import Patients from "./pages/Patients";
import Settings from "./pages/Settings";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <DashboardLayout>
                  <Dashboard />
                </DashboardLayout>
              </ProtectedRoute>
            } />
            <Route path="/users" element={
              <ProtectedRoute requiredRoles={['superAdmin', 'caseManager']}>
                <DashboardLayout>
                  <Users />
                </DashboardLayout>
              </ProtectedRoute>
            } />
            <Route path="/facilities" element={
              <ProtectedRoute requiredRoles={['superAdmin', 'onboardingTeam']}>
                <DashboardLayout>
                  <Facilities />
                </DashboardLayout>
              </ProtectedRoute>
            } />
            <Route path="/onboarding" element={
              <ProtectedRoute requiredRoles={['superAdmin', 'onboardingTeam']}>
                <DashboardLayout>
                  <Onboarding />
                </DashboardLayout>
              </ProtectedRoute>
            } />
            <Route path="/patients" element={
              <ProtectedRoute requiredRoles={['healthcareProvider', 'nurse', 'caseManager']}>
                <DashboardLayout>
                  <Patients />
                </DashboardLayout>
              </ProtectedRoute>
            } />
            <Route path="/settings" element={
              <ProtectedRoute requiredRoles={['superAdmin']}>
                <DashboardLayout>
                  <Settings />
                </DashboardLayout>
              </ProtectedRoute>
            } />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
