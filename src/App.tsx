
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CleanAuthProvider } from "@/components/auth/CleanAuthProvider";
import MainLayout from "@/components/layout/MainLayout";
import UnifiedDashboard from "@/components/dashboard/UnifiedDashboard";
import Users from "@/pages/Users";
import UsersPage from "@/pages/UsersPage";
import AdminVerificationTest from "@/pages/AdminVerificationTest";
import SecurityDashboard from "@/components/security/SecurityDashboard";
import { ModulesManagement } from "@/components/modules/ModulesManagement";
import { FacilitiesManagement } from "@/components/facilities/FacilitiesManagement";
import { CollaborativeOnboardingView } from "@/components/onboarding/CollaborativeOnboardingView";
import Patients from "@/pages/Patients";
import ApiServices from "@/pages/ApiServices";
import DataImport from "@/pages/DataImport";
import ActiveVerification from "@/pages/ActiveVerification";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const App = () => {
  console.log('🚀 App component rendering...');
  
  return (
    <QueryClientProvider client={queryClient}>
      <CleanAuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <MainLayout>
              <Routes>
                <Route path="/" element={<UnifiedDashboard />} />
                <Route path="/dashboard" element={<UnifiedDashboard />} />
                <Route path="/users" element={<Users />} />
                <Route path="/user-management" element={<UsersPage />} />
                <Route path="/patients" element={<Patients />} />
                <Route path="/facilities" element={<FacilitiesManagement />} />
                <Route path="/modules" element={<ModulesManagement />} />
                <Route path="/api-services" element={<ApiServices />} />
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
