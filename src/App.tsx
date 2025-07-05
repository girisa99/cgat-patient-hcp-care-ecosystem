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
import Login from "./pages/Login";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { MasterAuthProvider } from './hooks/useMasterAuth';
import { useMasterAuth } from '@/hooks/useMasterAuth';

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
              {/* Sidebar (only when authenticated) */}
              {(() => {
                const { isAuthenticated } = useMasterAuth();
                return isAuthenticated ? <AppSidebar /> : null;
              })()}
              {/* Main Content Area */}
              <div className="flex-1 min-h-screen bg-gray-50">
                <Routes>
                  <Route path="/login" element={<Login />} />
                  <Route path="/" element={<ProtectedRoute><Index /></ProtectedRoute>} />
                  <Route path="/users" element={<ProtectedRoute><Users /></ProtectedRoute>} />
                  <Route path="/patients" element={<ProtectedRoute><Patients /></ProtectedRoute>} />
                  <Route path="/facilities" element={<ProtectedRoute><Facilities /></ProtectedRoute>} />
                  <Route path="/onboarding" element={<ProtectedRoute><Onboarding /></ProtectedRoute>} />
                  <Route path="/modules" element={<ProtectedRoute><Modules /></ProtectedRoute>} />
                  <Route path="/api-services" element={<ProtectedRoute><ApiServices /></ProtectedRoute>} />
                  <Route path="/ngrok" element={<ProtectedRoute><NgrokIntegration /></ProtectedRoute>} />
                  <Route path="/security" element={<ProtectedRoute><Security /></ProtectedRoute>} />
                  <Route path="/reports" element={<ProtectedRoute><Reports /></ProtectedRoute>} />
                  <Route path="/testing" element={<ProtectedRoute><Testing /></ProtectedRoute>} />
                  <Route path="/role-management" element={<ProtectedRoute><RoleManagement /></ProtectedRoute>} />
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
