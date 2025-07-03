
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { DatabaseAuthProvider } from "@/components/auth/DatabaseAuthProvider";
import Index from "./pages/Index";
import SimpleUsers from "./pages/SimpleUsers";
import Patients from "./pages/Patients";
import Facilities from "./pages/Facilities";
import Modules from "./pages/Modules";
import ApiServices from "./pages/ApiServices";
import TestingSuite from "./pages/TestingSuite";
import DataImport from "./pages/DataImport";
import ActiveVerification from "./pages/ActiveVerification";
import Onboarding from "./pages/Onboarding";
import Security from "./pages/Security";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <DatabaseAuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/users" element={<SimpleUsers />} />
              <Route path="/patients" element={<Patients />} />
              <Route path="/facilities" element={<Facilities />} />
              <Route path="/modules" element={<Modules />} />
              <Route path="/api-services" element={<ApiServices />} />
              <Route path="/testing" element={<TestingSuite />} />
              <Route path="/data-import" element={<DataImport />} />
              <Route path="/active-verification" element={<ActiveVerification />} />
              <Route path="/onboarding" element={<Onboarding />} />
              <Route path="/security" element={<Security />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </DatabaseAuthProvider>
    </QueryClientProvider>
  );
}

export default App;
