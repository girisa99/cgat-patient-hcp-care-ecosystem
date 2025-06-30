
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CleanAuthProvider } from "@/components/auth/CleanAuthProvider";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import OnboardingDashboard from "./pages/OnboardingDashboard";
import PatientsPage from "./pages/PatientsPage";
import UsersPage from "./pages/UsersPage";
import FacilitiesPage from "./pages/FacilitiesPage";
import ModulesPage from "./pages/ModulesPage";
import SecurityPage from "./pages/SecurityPage";
import ReportsPage from "./pages/ReportsPage";
import DocumentsPage from "./pages/DocumentsPage";
import SettingsPage from "./pages/SettingsPage";
import TherapiesPage from "./pages/TherapiesPage";
import ServicesPage from "./pages/ServicesPage";
import DataImport from "./pages/DataImport";
import ApiIntegrations from "./pages/ApiIntegrations";
import ApiServicesPage from "./pages/ApiServicesPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <CleanAuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/onboarding" element={<OnboardingDashboard />} />
            <Route path="/patients" element={<PatientsPage />} />
            <Route path="/therapies" element={<TherapiesPage />} />
            <Route path="/services" element={<ServicesPage />} />
            <Route path="/api-services" element={<ApiServicesPage />} />
            <Route path="/data-import" element={<DataImport />} />
            <Route path="/api-integrations" element={<ApiIntegrations />} />
            <Route path="/users" element={<UsersPage />} />
            <Route path="/facilities" element={<FacilitiesPage />} />
            <Route path="/modules" element={<ModulesPage />} />
            <Route path="/security" element={<SecurityPage />} />
            <Route path="/reports" element={<ReportsPage />} />
            <Route path="/documents" element={<DocumentsPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </CleanAuthProvider>
  </QueryClientProvider>
);

export default App;
