
import { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar-database-aligned";
import { MasterAuthProvider } from "@/hooks/useMasterAuth";
import { AppSidebar } from "@/components/sidebar/AppSidebar";

const queryClient = new QueryClient();

// Lazy load pages
const Index = lazy(() => import("./pages/Index"));
const Users = lazy(() => import("./pages/Users"));
const SimpleModules = lazy(() => import("./pages/SimpleModules"));
const RoleManagement = lazy(() => import("./pages/RoleManagement"));
const Patients = lazy(() => import("./pages/Patients"));
const Facilities = lazy(() => import("./pages/Facilities"));
const ApiServices = lazy(() => import("./pages/ApiServices"));
const Testing = lazy(() => import("./pages/Testing"));
const DataImport = lazy(() => import("./pages/DataImport"));
const ActiveVerification = lazy(() => import("./pages/ActiveVerification"));
const Onboarding = lazy(() => import("./pages/Onboarding"));
const Security = lazy(() => import("./pages/Security"));

const App = () => (
  <QueryClientProvider client={queryClient}>
    <MasterAuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <SidebarProvider>
            <div className="min-h-screen flex w-full">
              <AppSidebar />
              <main className="flex-1 overflow-auto">
                <Suspense fallback={<div className="p-8">Loading...</div>}>
                  <Routes>
                    <Route path="/" element={<Index />} />
                    <Route path="/users" element={<Users />} />
                    <Route path="/modules" element={<SimpleModules />} />
                    <Route path="/role-management" element={<RoleManagement />} />
                    <Route path="/patients" element={<Patients />} />
                    <Route path="/facilities" element={<Facilities />} />
                    <Route path="/api-services" element={<ApiServices />} />
                    <Route path="/testing" element={<Testing />} />
                    <Route path="/data-import" element={<DataImport />} />
                    <Route path="/active-verification" element={<ActiveVerification />} />
                    <Route path="/onboarding" element={<Onboarding />} />
                    <Route path="/security" element={<Security />} />
                  </Routes>
                </Suspense>
              </main>
            </div>
          </SidebarProvider>
        </BrowserRouter>
      </TooltipProvider>
    </MasterAuthProvider>
  </QueryClientProvider>
);

export default App;
