import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { DatabaseAuthProvider } from "@/components/auth/DatabaseAuthProvider";
import Index from "@/pages/Index";
import SimpleUsers from "@/pages/SimpleUsers";
import SimplePatients from "@/pages/SimplePatients";
import SimpleFacilities from "@/pages/SimpleFacilities";
import SimpleModules from "@/pages/SimpleModules";
import SimpleSecurity from "@/pages/SimpleSecurity";
import ApiServices from "@/pages/ApiServices";
import DataImport from "@/pages/DataImport";
import TestingSuite from "@/pages/TestingSuite";
import ActiveVerificationPage from "@/pages/ActiveVerificationPage";
import Onboarding from "@/pages/Onboarding";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const App = () => {
  console.log('🚀 App rendering - minimal version');
  
  return (
    <QueryClientProvider client={queryClient}>
      <DatabaseAuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/users" element={<SimpleUsers />} />
            <Route path="/patients" element={<SimplePatients />} />
            <Route path="/facilities" element={<SimpleFacilities />} />
            <Route path="/modules" element={<SimpleModules />} />
            <Route path="/api-services" element={<ApiServices />} />
            <Route path="/testing" element={<TestingSuite />} />
            <Route path="/data-import" element={<DataImport />} />
            <Route path="/active-verification" element={<ActiveVerificationPage />} />
            <Route path="/onboarding" element={<Onboarding />} />
            <Route path="/security" element={<SimpleSecurity />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </DatabaseAuthProvider>
    </QueryClientProvider>
  );
};

export default App;