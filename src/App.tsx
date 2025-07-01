
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SessionContextProvider } from '@supabase/auth-helpers-react';
import { supabase } from "@/integrations/supabase/client";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Patients from "./pages/Patients";
import Users from "./pages/Users";
import Facilities from "./pages/Facilities";
import Modules from "./pages/Modules";
import Onboarding from "./pages/Onboarding";
import ApiServices from "./pages/ApiServices";
import ApiIntegrations from "./pages/ApiIntegrations";
import AdminVerification from "./pages/AdminVerification";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <SessionContextProvider supabaseClient={supabase}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/patients" element={<Patients />} />
            <Route path="/users" element={<Users />} />
            <Route path="/facilities" element={<Facilities />} />
            <Route path="/modules" element={<Modules />} />
            <Route path="/onboarding" element={<Onboarding />} />
            <Route path="/api-services" element={<ApiServices />} />
            <Route path="/api-integrations" element={<ApiIntegrations />} />
            <Route path="/admin/verification" element={<AdminVerification />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </SessionContextProvider>
  </QueryClientProvider>
);

export default App;
