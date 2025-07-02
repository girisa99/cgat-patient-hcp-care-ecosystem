
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CleanAuthProvider } from "@/components/auth/CleanAuthProvider";
import MainLayout from "@/components/layout/MainLayout";
import UnifiedDashboard from "@/components/dashboard/UnifiedDashboard";
import Users from "@/pages/Users";
import Patients from "@/pages/Patients";
import { ModulesManagement } from "@/components/modules/ModulesManagement";
import { FacilitiesManagement } from "@/components/facilities/FacilitiesManagement";
import { CollaborativeOnboardingView } from "@/components/onboarding/CollaborativeOnboardingView";
import ApiServices from "@/pages/ApiServices";
import Testing from "@/pages/Testing";
import DataImport from "@/pages/DataImport";
import ActiveVerification from "@/pages/ActiveVerification";
import SecurityDashboard from "@/components/security/SecurityDashboard";
import { navItems } from "@/nav-items";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const App = () => {
  console.log('🚀 App component rendering with navigation routes:', navItems.length);
  
  return (
    <QueryClientProvider client={queryClient}>
      <CleanAuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <MainLayout>
              <Routes>
                {/* Dashboard */}
                <Route path="/" element={<UnifiedDashboard />} />
                <Route path="/dashboard" element={<UnifiedDashboard />} />
                
                {/* Core Pages - SINGLE SOURCE OF TRUTH */}
                <Route path="/users" element={<Users />} />
                <Route path="/patients" element={<Patients />} />
                <Route path="/facilities" element={<FacilitiesManagement />} />
                <Route path="/modules" element={<ModulesManagement />} />
                <Route path="/api-services" element={<ApiServices />} />
                <Route path="/testing" element={<Testing />} />
                <Route path="/data-import" element={<DataImport />} />
                <Route path="/active-verification" element={<ActiveVerification />} />
                <Route path="/onboarding" element={<CollaborativeOnboardingView />} />
                <Route path="/security" element={<SecurityDashboard />} />
                
                {/* Fallback route */}
                <Route path="*" element={<UnifiedDashboard />} />
              </Routes>
            </MainLayout>
          </BrowserRouter>
        </TooltipProvider>
      </CleanAuthProvider>
    </QueryClientProvider>
  );
};

export default App;
