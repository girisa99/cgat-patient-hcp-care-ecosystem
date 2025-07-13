import React from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import { SidebarProvider } from '@/components/ui/sidebar-database-aligned';
import { AppSidebar } from '@/components/sidebar/AppSidebar';
import { MasterAuthProvider } from './hooks/useMasterAuth';
import { useMasterAuth } from '@/hooks/useMasterAuth';
import { TenantProvider } from '@/contexts/TenantContext';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';
import { generateRoutes } from '@/utils/routing/RouteGenerator';
import { initializeRoutes } from '@/utils/routing/routes';

const queryClient = new QueryClient();

const AppContent = () => {
  console.log('🚀 AppContent component mounting...');
  const { isAuthenticated } = useMasterAuth();
  console.log('🔐 AppContent authentication state:', isAuthenticated);

  // Initialize routes on app start
  React.useEffect(() => {
    console.log('🚀 AppContent mounted, initializing routes...');
    initializeRoutes();
  }, []);

  console.log('🖥️ AppContent render - isAuthenticated:', isAuthenticated);

  console.log('🗂️ About to generate routes...');
  const routes = generateRoutes();
  console.log('✅ Routes generated:', routes);

  return (
    <ErrorBoundary>
      <BrowserRouter>
        <SidebarProvider>
          <div className="flex min-h-screen w-full">
            {isAuthenticated && <AppSidebar />}
            <div className="flex-1 min-h-screen bg-gray-50">
              {routes}
            </div>
          </div>
        </SidebarProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <MasterAuthProvider>
      <TenantProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <AppContent />
        </TooltipProvider>
      </TenantProvider>
    </MasterAuthProvider>
  </QueryClientProvider>
);

export default App;
