
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { CleanAuthProvider } from "@/components/auth/CleanAuthProvider";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import LoginForm from "@/components/auth/LoginForm";
import Dashboard from "@/pages/Dashboard";
import Users from "@/pages/Users";
import Facilities from "@/pages/Facilities";
import Modules from "@/pages/Modules";
import AdminPage from "@/pages/AdminPage";

const queryClient = new QueryClient();

// Placeholder components for missing pages
const PatientsPage = () => (
  <div className="p-6">
    <h1 className="text-2xl font-bold mb-4">Patients</h1>
    <p>Patients management page - Coming soon</p>
  </div>
);

const OnboardingPage = () => (
  <div className="p-6">
    <h1 className="text-2xl font-bold mb-4">Onboarding</h1>
    <p>Onboarding management page - Coming soon</p>
  </div>
);

const ApiServicesPage = () => (
  <div className="p-6">
    <h1 className="text-2xl font-bold mb-4">API Services</h1>
    <p>API Services management page - Coming soon</p>
  </div>
);

const DataImportPage = () => (
  <div className="p-6">
    <h1 className="text-2xl font-bold mb-4">Data Import</h1>
    <p>Data Import management page - Coming soon</p>
  </div>
);

const SecurityPage = () => (
  <div className="p-6">
    <h1 className="text-2xl font-bold mb-4">Security</h1>
    <p>Security management page - Coming soon</p>
  </div>
);

const SettingsPage = () => (
  <div className="p-6">
    <h1 className="text-2xl font-bold mb-4">Settings</h1>
    <p>Settings page - Coming soon</p>
  </div>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <CleanAuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginForm />} />
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/patients"
              element={
                <ProtectedRoute>
                  <PatientsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/onboarding"
              element={
                <ProtectedRoute>
                  <OnboardingPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/api-services"
              element={
                <ProtectedRoute>
                  <ApiServicesPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/data-import"
              element={
                <ProtectedRoute>
                  <DataImportPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/users"
              element={
                <ProtectedRoute>
                  <Users />
                </ProtectedRoute>
              }
            />
            <Route
              path="/facilities"
              element={
                <ProtectedRoute>
                  <Facilities />
                </ProtectedRoute>
              }
            />
            <Route
              path="/modules"
              element={
                <ProtectedRoute>
                  <Modules />
                </ProtectedRoute>
              }
            />
            <Route
              path="/security"
              element={
                <ProtectedRoute>
                  <SecurityPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/settings"
              element={
                <ProtectedRoute>
                  <SettingsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin"
              element={
                <ProtectedRoute>
                  <AdminPage />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </CleanAuthProvider>
  </QueryClientProvider>
);

export default App;
