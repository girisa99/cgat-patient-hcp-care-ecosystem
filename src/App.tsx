import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SidebarProvider } from '@/components/ui/sidebar-database-aligned';
import { AppSidebar } from '@/components/sidebar/AppSidebar';
import Index from "./pages/Index";
import Users from "./pages/Users";
import Patients from "./pages/Patients";
import Facilities from "./pages/Facilities";
import Onboarding from "./pages/Onboarding";
import Modules from "./pages/Modules";
import ApiServices from "./pages/ApiServices";
import NgrokIntegration from "./pages/NgrokIntegration";
import Security from "./pages/Security";
import Reports from "./pages/Reports";
import Testing from "./pages/Testing";
import RoleManagement from "./pages/RoleManagement";
import { MasterAuthProvider } from './hooks/useMasterAuth';

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <MasterAuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <SidebarProvider>
            <div className="flex min-h-screen w-full">
              {/* Sidebar */}
              <AppSidebar />
              {/* Main Content Area */}
              <div className="flex-1 min-h-screen bg-gray-50">
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/users" element={<Users />} />
                  <Route path="/patients" element={<Patients />} />
                  <Route path="/facilities" element={<Facilities />} />
                  <Route path="/onboarding" element={<Onboarding />} />
                  <Route path="/modules" element={<Modules />} />
                  <Route path="/api-services" element={<ApiServices />} />
                  <Route path="/ngrok" element={<NgrokIntegration />} />
                  <Route path="/security" element={<Security />} />
                  <Route path="/reports" element={<Reports />} />
                  <Route path="/testing" element={<Testing />} />
                  <Route path="/role-management" element={<RoleManagement />} />
                </Routes>
              </div>
            </div>
          </SidebarProvider>
        </BrowserRouter>
      </TooltipProvider>
    </MasterAuthProvider>
  </QueryClientProvider>
);

export default App;
