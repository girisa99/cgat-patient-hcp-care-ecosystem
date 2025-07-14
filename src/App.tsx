import React, { Suspense } from 'react';
import { Toaster } from "sonner";
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
import { PageLoading } from '@/components/ui/LoadingStates';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

const AppContent = () => {
  const { isAuthenticated, isLoading } = useMasterAuth();

  // Initialize routes once on app start
  React.useEffect(() => {
    console.log('🚀 App initializing routes...');
    initializeRoutes();
    console.log('✅ App routes initialized');
  }, []);

  // Show loading screen while auth is initializing
  if (isLoading) {
    return <PageLoading message="Initializing application..." />;
  }

  const routes = generateRoutes();

  return (
    <ErrorBoundary>
      <BrowserRouter>
        <SidebarProvider>
          <div className="flex min-h-screen w-full">
            {isAuthenticated && <AppSidebar />}
            <div className="flex-1 min-h-screen bg-gray-50">
              <Suspense fallback={<PageLoading message="Loading page..." />}>
                {routes}
              </Suspense>
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
          <AppContent />
        </TooltipProvider>
      </TenantProvider>
    </MasterAuthProvider>
  </QueryClientProvider>
);

export default App;