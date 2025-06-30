import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CleanAuthProvider } from "@/components/auth/CleanAuthProvider";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import Users from "./pages/Users";
import Patients from "./pages/Patients";
import Facilities from "./pages/Facilities";
import Modules from "./pages/Modules";
import Onboarding from "./pages/Onboarding";
import TreatmentCenterOnboarding from "./pages/TreatmentCenterOnboarding";
import Settings from "./pages/Settings";
import ApiIntegrations from "./pages/ApiIntegrations";
import AuditLog from "./pages/AuditLog";
import CollaborativeOnboardingPage from './pages/CollaborativeOnboarding';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <CleanAuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/users" element={<Users />} />
              <Route path="/patients" element={<Patients />} />
              <Route path="/facilities" element={<Facilities />} />
              <Route path="/modules" element={<Modules />} />
              <Route path="/onboarding" element={<TreatmentCenterOnboardingPage />} />
              <Route path="/onboarding/collaborate/:applicationId" element={<CollaborativeOnboardingPage />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/api-integrations" element={<ApiIntegrations />} />
              <Route path="/audit-log" element={<AuditLog />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </CleanAuthProvider>
    </QueryClientProvider>
  );
}

export default App;
