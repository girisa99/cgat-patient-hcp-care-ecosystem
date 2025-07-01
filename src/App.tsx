
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CleanAuthProvider } from "@/components/auth/CleanAuthProvider";
import UnifiedDashboard from "@/components/dashboard/UnifiedDashboard";
import Users from "@/pages/Users";
import UsersPage from "@/pages/UsersPage";
import AdminVerificationTest from "@/pages/AdminVerificationTest";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <CleanAuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<UnifiedDashboard />} />
            <Route path="/dashboard" element={<UnifiedDashboard />} />
            <Route path="/users" element={<Users />} />
            <Route path="/user-management" element={<UsersPage />} />
            <Route path="/admin/system-verification" element={<AdminVerificationTest />} />
            <Route path="/patients" element={<UnifiedDashboard />} />
            <Route path="/facilities" element={<UnifiedDashboard />} />
            <Route path="/modules" element={<UnifiedDashboard />} />
            <Route path="/onboarding" element={<UnifiedDashboard />} />
            <Route path="/security" element={<UnifiedDashboard />} />
            <Route path="/reports" element={<UnifiedDashboard />} />
            <Route path="/admin/*" element={<UnifiedDashboard />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </CleanAuthProvider>
  </QueryClientProvider>
);

export default App;
