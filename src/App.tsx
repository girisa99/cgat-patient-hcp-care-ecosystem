
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
import { SystemAnalysisDashboard } from "@/components/admin/SystemAnalysisDashboard";
import SystemAssessmentDashboard from "@/components/admin/SystemAssessment/SystemAssessmentDashboard";
import { ApiServicesModule } from "@/components/admin/ApiServices/ApiServicesModule";
import OptimizedApiIntegrationsManager from "@/components/admin/ApiIntegrations/OptimizedApiIntegrationsManager";
import { DataImportModule } from "@/components/admin/DataImportModule";
import { SystemStatusDashboard } from "@/components/admin/SystemStatusDashboard";
import { UserManagementMain } from "@/components/admin/UserManagement/UserManagementMain";
import Patients from "@/pages/Patients";
import AutoModuleManager from "@/components/admin/AutoModuleManager";
import Reports from "@/pages/Reports";
import ApiServices from "@/pages/ApiServices";
import DataImport from "@/pages/DataImport";

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
                <Route path="/onboarding" element={<CollaborativeOnboardingView />} />
                <Route path="/security" element={<SecurityDashboard />} />
                <Route path="/reports" element={<Reports />} />
                
                {/* Admin Routes */}
                <Route path="/admin/system-analysis" element={<SystemAnalysisDashboard />} />
                <Route path="/admin/system-assessment" element={<SystemAssessmentDashboard />} />
                <Route path="/admin/api-services" element={<ApiServicesModule />} />
                <Route path="/admin/api-integrations" element={<OptimizedApiIntegrationsManager />} />
                <Route path="/admin/data-import" element={<DataImportModule />} />
                <Route path="/admin/system-status" element={<SystemStatusDashboard />} />
                <Route path="/admin/user-management" element={<UserManagementMain />} />
                <Route path="/admin/patient-management" element={<Patients />} />
                <Route path="/admin/auto-module-manager" element={<AutoModuleManager />} />
                <Route path="/admin/system-verification" element={<AdminVerificationTest />} />
                
                {/* Fallback for other admin routes */}
                <Route path="/admin/*" element={<UnifiedDashboard />} />
              </Routes>
            </MainLayout>
          </BrowserRouter>
        </TooltipProvider>
      </CleanAuthProvider>
    </QueryClientProvider>
  );
};

export default App;
