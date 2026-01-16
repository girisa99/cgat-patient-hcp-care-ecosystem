import React, { Suspense, useEffect } from 'react';
import { Toaster } from "sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { MasterAuthProvider } from './hooks/useMasterAuth';
import { useMasterAuth } from '@/hooks/useMasterAuth';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';
import { PageLoading } from '@/components/ui/LoadingStates';
import { initializeStabilityFramework } from '@/utils/framework/init';
import { AppLayoutWithEnrollment } from '@/components/layout/AppLayoutWithEnrollment';
import { StabilityProvider } from '@/components/stability/StabilityProvider';
import { AccessibilityProvider } from '@/components/genie-studio/AccessibilityEnhancements';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { TenantProvider } from '@/contexts/TenantContext';
import { HelmetProvider } from 'react-helmet-async';
import { GlobalAgentGeneratorProvider } from '@/hooks/useGlobalAgentGenerator';
import { GlobalAgentGeneratorModal } from '@/components/global/GlobalAgentGeneratorModal';
import { LSUniversalProvider } from '@/components/label-studio/LSUniversalProvider';
import { GenieStudioProvider } from '@/contexts/GenieStudioSharedContext';
import { LazyPages, lazyWithRetry } from '@/utils/lazyWithRetry';
import { SmartDefaultRoute, RouteTracker } from '@/components/routing/SmartDefaultRoute';

// Import pages that exist
import Index from '@/pages/Index';
import Dashboard from '@/pages/Dashboard';
import DemoDashboard from '@/pages/DemoDashboard';
import Users from '@/pages/Users';
import Patients from '@/pages/Patients';
import Facilities from '@/pages/Facilities';
import PackageResearch from '@/components/PackageResearch';
import DataImport from '@/pages/DataImport';


import Modules from '@/pages/Modules';
import ApiServices from '@/pages/ApiServices';
import NgrokIntegration from '@/pages/NgrokIntegration';
import Security from '@/pages/Security';
import Reports from '@/pages/Reports';
import Testing from '@/pages/Testing';
import FrameworkDashboard from '@/pages/FrameworkDashboard';
import DatabasePerformance from '@/pages/DatabasePerformance';
import RoleManagement from '@/pages/RoleManagement';
import Stability from '@/pages/Stability';
import Governance from '@/pages/Governance';
import Agents from '@/pages/Agents';
import Login from '@/pages/Login';
import GenieStudioAuth from '@/pages/GenieStudioAuth';
import GenieStudioPricing from '@/pages/GenieStudioPricing';
import ForgotPassword from '@/pages/ForgotPassword';
import ResetPassword from '@/pages/ResetPassword';
import EmailConfirmation from '@/pages/EmailConfirmation';
import { PresentationPage } from '@/pages/PresentationPage';
import SystemIntegration from '@/pages/SystemIntegration';
import OrderManagement from '@/pages/OrderManagement';
import PatientOnboarding from '@/pages/PatientOnboarding';
import PatientOnboardingWhatsApp from '@/pages/PatientOnboardingWhatsApp';
import DocumentProcessing from '@/pages/DocumentProcessing';
import { ConfigurableGeniePage } from '@/pages/ConfigurableGeniePage';
import { UnifiedAgentAdminDashboard } from '@/components/admin/UnifiedAgentAdminDashboard';
import AppLayout from '@/components/layout/AppLayout';


import OnboardingDashboard from '@/pages/OnboardingDashboard';
import TherapySelection from '@/pages/TherapySelection';
import CreditApplication from '@/pages/CreditApplication';
import AgentCreationWizard from '@/components/agentic/AgentCreationWizard';
// Lazy loaded components
import MCPDemo from '@/pages/MCPDemo';
const EnrollmentDemo = React.lazy(() => 
  import('@/components/pages/EnrollmentDemoPage').then(module => ({ 
    default: module.EnrollmentDemoPage 
  }))
);
const SubscriptionPage = React.lazy(() => import('@/pages/SubscriptionPage'));
import { getDefaultRouteForRoles, normalizeRoles } from '@/utils/roles';
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

// Lazy load the public presentation component outside of auth flow
const PublicDocumentPresentation = React.lazy(() => import('@/pages/PublicDocumentPresentation'));

const AppContent = () => {
  console.log('🎯 AppContent rendering...');
  const { isAuthenticated, isLoading, userRoles } = useMasterAuth();

  console.log('🎯 Auth state:', { isAuthenticated, isLoading, userRoles });

  // Show loading screen while auth is initializing
  if (isLoading) {
    console.log('⏳ Showing loading screen...');
    return <PageLoading message="Initializing application..." />;
  }

  // Wait for roles to load to avoid dashboard flicker
  if (isAuthenticated && userRoles.length === 0) {
    console.log('⏳ Waiting for roles to load...');
    return <PageLoading message="Loading your dashboard..." />;
  }

  console.log('🎯 Rendering routes, isAuthenticated:', isAuthenticated);

  return (
    <ErrorBoundary>
      <Suspense fallback={<PageLoading message="Loading page..." />}>
          <Routes>
              {/* Public routes - accessible without authentication */}
              <Route path="/login" element={<Login />} />
              <Route path="/genie-studio-auth" element={<GenieStudioAuth />} />
              <Route path="/genie-studio-pricing" element={<GenieStudioPricing />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/email-confirmation" element={<EmailConfirmation />} />
              <Route path="/social-oauth-callback" element={
                <Suspense fallback={<PageLoading message="Processing..." />}>
                  {React.createElement(React.lazy(() => import('@/pages/SocialOAuthCallback')))}
                </Suspense>
              } />
              
              {/* Protected routes */}
              {isAuthenticated ? (
                <>
                  {/* Smart default route - preserves last visited page on refresh */}
                  <Route path="/" element={
                    <SmartDefaultRoute userRoles={userRoles} />
                  } />
                  
                  {/* SuperAdmin & Admin & Healthcare Staff routes */}
                  <Route path="/dashboard" element={
                    <ProtectedRoute requiredRoles={['superAdmin', 'admin', 'healthcareProvider', 'nurse', 'caseManager', 'onboardingTeam']}>
                      <Dashboard />
                    </ProtectedRoute>
                  } />
                  <Route path="/demo-dashboard" element={
                    <ProtectedRoute requiredRoles={['demoUser']}>
                      <DemoDashboard />
                    </ProtectedRoute>
                  } />
                  <Route path="/index" element={
                    <ProtectedRoute requiredRoles={['superAdmin', 'admin']}>
                      <Index />
                    </ProtectedRoute>
                  } />
                  <Route path="/users" element={
                    <ProtectedRoute requiredRoles={['superAdmin', 'admin', 'demoUser']}>
                      <Users />
                    </ProtectedRoute>
                  } />
                  <Route path="/patients" element={
                    <ProtectedRoute requiredRoles={['superAdmin', 'admin', 'healthcareProvider', 'nurse', 'caseManager', 'demoUser']}>
                      <Patients />
                    </ProtectedRoute>
                  } />
                  
                  {/* Admin - Single Source of Truth for all agent/genie management */}
                  <Route path="/admin" element={
                    <ProtectedRoute requiredRoles={['superAdmin', 'admin', 'onboardingTeam', 'healthcareProvider', 'demoUser']}>
                      <AppLayout><UnifiedAgentAdminDashboard /></AppLayout>
                    </ProtectedRoute>
                  } />
                  <Route path="/agents" element={<Navigate to="/admin" replace />} />
                  <Route path="/genie-management" element={<Navigate to="/admin" replace />} />
                  <Route path="/agents/canvas" element={
                    <ProtectedRoute requiredRoles={['superAdmin', 'admin', 'onboardingTeam', 'healthcareProvider', 'demoUser']}>
                      <Agents />
                    </ProtectedRoute>
                  } />
                  <Route path="/genie-analytics/:genieId" element={
                    <ProtectedRoute requiredRoles={['superAdmin', 'admin', 'onboardingTeam', 'healthcareProvider', 'demoUser']}>
                      {React.createElement(React.lazy(() => import('@/pages/GenieAnalyticsPage')))}
                    </ProtectedRoute>
                  } />
                  <Route path="/configurable-genie" element={
                    <ProtectedRoute requiredRoles={['superAdmin', 'admin', 'onboardingTeam', 'healthcareProvider', 'demoUser']}>
                      <ConfigurableGeniePage />
                    </ProtectedRoute>
                  } />
                  <Route path="/enterprise-analytics" element={
                    <ProtectedRoute requiredRoles={['superAdmin', 'admin', 'demoUser']}>
                      <Suspense fallback={<PageLoading message="Loading analytics..." />}>
                        {React.createElement(React.lazy(() => import('@/pages/EnterpriseAnalytics')))}
                      </Suspense>
                    </ProtectedRoute>
                  } />
                  <Route path="/system-completion" element={
                    <ProtectedRoute requiredRoles={['superAdmin', 'admin', 'onboardingTeam', 'demoUser']}>
                      <Suspense fallback={<PageLoading message="Loading system completion..." />}>
                        {React.createElement(React.lazy(() => import('@/pages/SystemCompletion')))}
                      </Suspense>
                    </ProtectedRoute>
                  } />
                  <Route path="/mcp" element={
                    <ProtectedRoute requiredRoles={['superAdmin', 'admin', 'onboardingTeam', 'demoUser']}>
                      <MCPDemo />
                    </ProtectedRoute>
                  } />
                  <Route path="/testing" element={
                    <ProtectedRoute requiredRoles={['superAdmin', 'onboardingTeam', 'healthcareProvider', 'demoUser']}>
                      <Testing />
                    </ProtectedRoute>
                  } />
                  
                  {/* Healthcare Provider specific routes */}
                  <Route path="/order-management" element={
                    <ProtectedRoute requiredRoles={['healthcareProvider']}>
                      <OrderManagement />
                    </ProtectedRoute>
                  } />
                  <Route path="/patient-onboarding" element={
                    <ProtectedRoute requiredRoles={['healthcareProvider', 'onboardingTeam', 'superAdmin', 'admin']}>
                      <PatientOnboarding />
                    </ProtectedRoute>
                  } />
                  <Route path="/patient-onboarding-whatsapp" element={
                    <ProtectedRoute requiredRoles={['healthcareProvider', 'onboardingTeam', 'superAdmin', 'admin']}>
                      <PatientOnboardingWhatsApp />
                    </ProtectedRoute>
                  } />
                  <Route path="/enrollment-workspace" element={
                    <ProtectedRoute requiredRoles={['healthcareProvider', 'onboardingTeam', 'superAdmin', 'admin']}>
                      <PatientOnboarding />
                    </ProtectedRoute>
                  } />
                  <Route path="/document-processing" element={
                    <ProtectedRoute requiredRoles={['superAdmin', 'admin', 'healthcareProvider', 'onboardingTeam', 'demoUser']}>
                      <DocumentProcessing />
                    </ProtectedRoute>
                  } />
                  <Route path="/genie-studio" element={
                    <ProtectedRoute requiredRoles={['superAdmin', 'admin', 'healthcareProvider', 'onboardingTeam', 'demoUser']}>
                      <Suspense fallback={<PageLoading message="Loading Genie Studio..." />}>
                        <LazyPages.GenieStudio />
                      </Suspense>
                    </ProtectedRoute>
                  } />
                  <Route path="/genie-spark" element={
                    <ProtectedRoute requiredRoles={['superAdmin', 'admin', 'healthcareProvider', 'onboardingTeam', 'demoUser']}>
                      <Suspense fallback={<PageLoading message="Loading Genie Spark..." />}>
                        <LazyPages.GenieSpark />
                      </Suspense>
                    </ProtectedRoute>
                  } />
                  <Route path="/genie-arc" element={
                    <ProtectedRoute requiredRoles={['superAdmin', 'admin', 'healthcareProvider', 'onboardingTeam', 'demoUser']}>
                      <Suspense fallback={<PageLoading message="Loading Genie Arc..." />}>
                        <LazyPages.GenieArc />
                      </Suspense>
                    </ProtectedRoute>
                  } />
                  <Route path="/genie-mind" element={
                    <ProtectedRoute requiredRoles={['superAdmin', 'admin', 'healthcareProvider', 'onboardingTeam', 'demoUser']}>
                      <Suspense fallback={<PageLoading message="Loading Genie Mind..." />}>
                        <LazyPages.GenieMind />
                      </Suspense>
                    </ProtectedRoute>
                  } />
                  <Route path="/genie-vibe" element={
                    <ProtectedRoute requiredRoles={['superAdmin', 'admin', 'healthcareProvider', 'onboardingTeam', 'demoUser']}>
                      <Suspense fallback={<PageLoading message="Loading Genie Vibe..." />}>
                        <LazyPages.GenieVibe />
                      </Suspense>
                    </ProtectedRoute>
                  } />
                  <Route path="/genie-deck" element={
                    <ProtectedRoute requiredRoles={['superAdmin', 'admin', 'healthcareProvider', 'onboardingTeam', 'demoUser']}>
                      <Suspense fallback={<PageLoading message="Loading Genie Deck..." />}>
                        {React.createElement(React.lazy(() => import('@/pages/GenieDeck')))}
                      </Suspense>
                    </ProtectedRoute>
                  } />
                  <Route path="/genie-studio/productions" element={
                    <ProtectedRoute requiredRoles={['superAdmin', 'admin', 'healthcareProvider', 'onboardingTeam', 'demoUser']}>
                      <Suspense fallback={<PageLoading message="Loading Production Hub..." />}>
                        <LazyPages.ProductionHub />
                      </Suspense>
                    </ProtectedRoute>
                  } />
                  <Route path="/production-hub" element={
                    <ProtectedRoute requiredRoles={['superAdmin', 'admin', 'healthcareProvider', 'onboardingTeam', 'demoUser']}>
                      <Suspense fallback={<PageLoading message="Loading Production Hub..." />}>
                        <LazyPages.ProductionHub />
                      </Suspense>
                    </ProtectedRoute>
                  } />
                  <Route path="/genie-studio/feedback-analytics" element={
                    <ProtectedRoute requiredRoles={['superAdmin', 'admin', 'onboardingTeam', 'healthcareProvider', 'caseManager']}>
                      <Suspense fallback={<PageLoading message="Loading Feedback Analytics..." />}>
                        <AppLayout>
                          {React.createElement(React.lazy(() => import('@/components/genie-studio/FeedbackAnalyticsDashboard').then(m => ({ default: m.FeedbackAnalyticsDashboard }))))}
                        </AppLayout>
                      </Suspense>
                    </ProtectedRoute>
                  } />
                  <Route path="/genie-vibe/mobile" element={
                    <ProtectedRoute requiredRoles={['superAdmin', 'admin', 'healthcareProvider', 'onboardingTeam', 'demoUser']}>
                      <Suspense fallback={<PageLoading message="Loading Mobile Studio..." />}>
                        {React.createElement(React.lazy(() => import('@/pages/MobileRecordingPage')))}
                      </Suspense>
                    </ProtectedRoute>
                  } />
                  <Route path="/data-import" element={
                    <ProtectedRoute requiredRoles={['superAdmin', 'onboardingTeam', 'demoUser']}>
                      <DataImport />
                    </ProtectedRoute>
                  } />
                  
                  <Route path="/facilities" element={
                    <ProtectedRoute requiredRoles={['superAdmin', 'admin', 'demoUser']}>
                      <Facilities />
                    </ProtectedRoute>
                  } />
                  
                  {/* Onboarding route - accessible to onboardingTeam and superAdmin */}
                  <Route path="/onboarding" element={
                    <ProtectedRoute requiredRoles={['superAdmin', 'onboardingTeam', 'demoUser']}>
                      <OnboardingDashboard />
                    </ProtectedRoute>
                  } />
                  <Route path="/therapy-selection" element={
                    <ProtectedRoute requiredRoles={['superAdmin', 'onboardingTeam', 'healthcareProvider']}>
                      <TherapySelection />
                    </ProtectedRoute>
                  } />
                  <Route path="/credit-application" element={
                    <ProtectedRoute requiredRoles={['superAdmin', 'onboardingTeam', 'healthcareProvider', 'admin']}>
                      <CreditApplication />
                    </ProtectedRoute>
                  } />
                  
                  {/* Technical/Admin routes - SuperAdmin only */}
                  <Route path="/modules" element={
                    <ProtectedRoute requiredRoles={['superAdmin', 'demoUser']}>
                      <Modules />
                    </ProtectedRoute>
                  } />
                  <Route path="/api-services" element={
                    <ProtectedRoute requiredRoles={['superAdmin', 'onboardingTeam', 'healthcareProvider', 'demoUser']}>
                      <ApiServices />
                    </ProtectedRoute>
                  } />
                  <Route path="/system-integration" element={
                    <ProtectedRoute requiredRoles={['superAdmin', 'onboardingTeam', 'demoUser']}>
                      <SystemIntegration />
                    </ProtectedRoute>
                  } />
                  <Route path="/architecture" element={
                    <ProtectedRoute requiredRoles={['superAdmin', 'admin', 'onboardingTeam', 'demoUser', 'healthcareProvider', 'caseManager', 'nurse', 'provider']}>
                      <Suspense fallback={<PageLoading message="Loading architecture..." />}>
                        {React.createElement(React.lazy(() => import('@/pages/ArchitectureDiagram')))}
                      </Suspense>
                    </ProtectedRoute>
                  } />
                   <Route path="/ai-testing" element={
                     <ProtectedRoute requiredRoles={['superAdmin', 'onboardingTeam']}>
                       <Suspense fallback={<PageLoading message="Loading AI testing..." />}>
                         {React.createElement(React.lazy(() => import('@/components/ai-testing/AIModelTestingInterface').then(m => ({ default: m.AIModelTestingInterface }))))}
                       </Suspense>
                     </ProtectedRoute>
                   } />
                  <Route path="/ngrok" element={
                    <ProtectedRoute requiredRoles={['superAdmin']}>
                      <NgrokIntegration />
                    </ProtectedRoute>
                  } />
                  <Route path="/database-performance" element={
                    <ProtectedRoute requiredRoles={['superAdmin', 'demoUser']}>
                      <DatabasePerformance />
                    </ProtectedRoute>
                  } />
                  <Route path="/security" element={
                    <ProtectedRoute requiredRoles={['superAdmin']}>
                      <Security />
                    </ProtectedRoute>
                  } />
                  <Route path="/reports" element={
                    <ProtectedRoute requiredRoles={['superAdmin', 'admin', 'demoUser']}>
                      <Reports />
                    </ProtectedRoute>
                  } />
                  <Route path="/framework" element={
                    <ProtectedRoute requiredRoles={['superAdmin', 'demoUser']}>
                      <FrameworkDashboard />
                    </ProtectedRoute>
                  } />
                  <Route path="/role-management" element={
                    <ProtectedRoute requiredRoles={['superAdmin', 'demoUser']}>
                      <RoleManagement />
                    </ProtectedRoute>
                  } />
                  <Route path="/stability" element={
                    <ProtectedRoute requiredRoles={['superAdmin', 'demoUser']}>
                      <Stability />
                    </ProtectedRoute>
                  } />
                  <Route path="/stability/dashboard" element={
                    <ProtectedRoute requiredRoles={['superAdmin']}>
                      <Suspense fallback={<PageLoading message="Loading stability dashboard..." />}>
                        {React.createElement(React.lazy(() => import('@/components/stability/StabilityDashboard').then(m => ({ default: m.StabilityDashboard }))))}
                      </Suspense>
                    </ProtectedRoute>
                  } />
                  <Route path="/governance" element={
                    <ProtectedRoute requiredRoles={['superAdmin', 'demoUser']}>
                      <Governance />
                    </ProtectedRoute>
                  } />
                  <Route path="/settings/integrations" element={
                    <ProtectedRoute requiredRoles={['superAdmin', 'admin', 'healthcareProvider', 'onboardingTeam', 'demoUser']}>
                      <Suspense fallback={<PageLoading message="Loading Integrations..." />}>
                        {React.createElement(React.lazy(() => import('@/components/settings/IntegrationsSettingsPage')))}
                      </Suspense>
                    </ProtectedRoute>
                  } />
                  <Route path="/content-tools" element={
                    <ProtectedRoute requiredRoles={['superAdmin', 'admin', 'healthcareProvider', 'onboardingTeam', 'demoUser']}>
                      <Suspense fallback={<PageLoading message="Loading Content Tools..." />}>
                        {React.createElement(React.lazy(() => import('@/pages/ContentTools')))}
                      </Suspense>
                    </ProtectedRoute>
                  } />
                  <Route path="/healthcare-ai" element={
                    <ProtectedRoute requiredRoles={['superAdmin', 'admin', 'healthcareProvider', 'onboardingTeam', 'demoUser']}>
                      <Suspense fallback={<PageLoading message="Loading healthcare AI..." />}>
                        {React.createElement(React.lazy(() => import('@/components/healthcare/HealthcareAIDashboard').then(m => ({ default: m.default }))))}
                      </Suspense>
                    </ProtectedRoute>
                  } />
                  <Route path="/research" element={
                    <ProtectedRoute requiredRoles={['superAdmin']}>
                      <PackageResearch />
                    </ProtectedRoute>
                  } />
                  <Route path="/presentation" element={
                    <ProtectedRoute requiredRoles={['superAdmin', 'admin', 'onboardingTeam']}>
                      <PresentationPage />
                    </ProtectedRoute>
                  } />
                  <Route path="/presentations" element={
                    <ProtectedRoute requiredRoles={['superAdmin', 'admin', 'onboardingTeam', 'healthcareProvider', 'demoUser']}>
                      <Suspense fallback={<PageLoading message="Loading presentations..." />}>
                        {React.createElement(React.lazy(() => import('@/pages/Presentations')))}
                      </Suspense>
                    </ProtectedRoute>
                  } />
                  <Route path="/treatment-centers" element={
                    <ProtectedRoute requiredRoles={['superAdmin', 'demoUser']}>
                      <OnboardingDashboard />
                    </ProtectedRoute>
                  } />
                  <Route path="/enrollment-demo" element={
                    <ProtectedRoute requiredRoles={['superAdmin', 'admin', 'demoUser', 'onboardingTeam']}>
                      <EnrollmentDemo />
                    </ProtectedRoute>
                  } />
                  <Route path="/page-demo" element={
                    <ProtectedRoute requiredRoles={['superAdmin', 'admin', 'demoUser', 'onboardingTeam']}>
                      <Suspense fallback={<PageLoading message="Loading page demo..." />}>
                        {React.createElement(React.lazy(() => 
                          import('@/components/pages/PageSpecificEnrollmentDemo').then(m => ({ 
                            default: m.PageSpecificEnrollmentDemo 
                          }))
                        ))}
                      </Suspense>
                    </ProtectedRoute>
                  } />
                  <Route path="/subscription" element={
                    <ProtectedRoute requiredRoles={['superAdmin', 'admin', 'demoUser', 'onboardingTeam', 'healthcareProvider']}>
                      <Suspense fallback={<PageLoading message="Loading subscription..." />}>
                        <SubscriptionPage />
                      </Suspense>
                    </ProtectedRoute>
                  } />
                </>
              ) : (
                <>
                  <Route path="/" element={<Login />} />
                  <Route path="*" element={<Navigate to="/login" replace />} />
                </>
              )}
            </Routes>
          </Suspense>
      
    </ErrorBoundary>
  );
};

// Lazy load public pages
const PublicPresentationPage = React.lazy(() => import('@/pages/PublicPresentationPage'));
const MeetingRoom = React.lazy(() => import('@/pages/MeetingRoom'));

// Public routes wrapper - no auth required
const PublicRoutes = () => (
  <Routes>
    {/* Meeting room route - connects to Genie Vibe */}
    <Route path="/meeting/:meetingCode" element={
      <Suspense fallback={<PageLoading message="Loading meeting room..." />}>
        <MeetingRoom />
      </Suspense>
    } />
    {/* Main public presentation route */}
    <Route path="/presentation/document-processing" element={
      <Suspense fallback={<PageLoading message="Loading presentation..." />}>
        <PublicDocumentPresentation />
      </Suspense>
    } />
    {/* Legacy route - redirect to new path */}
    <Route path="/public/presentation/document-processing" element={
      <Navigate to="/presentation/document-processing" replace />
    } />
    <Route path="/public/presentation/:slug" element={
      <Suspense fallback={<PageLoading message="Loading presentation..." />}>
        <PublicPresentationPage />
      </Suspense>
    } />
    <Route path="/presentation/:slug" element={
      <Suspense fallback={<PageLoading message="Loading presentation..." />}>
        <PublicPresentationPage />
      </Suspense>
    } />
  </Routes>
);

// Main app with routing logic
const AppRouter = () => {
  const location = useLocation();
  
  // Check if this is a public route - render without auth
  if (location.pathname.startsWith('/public/') || 
      location.pathname.startsWith('/presentation/') ||
      location.pathname.startsWith('/meeting/')) {
    return (
      <HelmetProvider>
        <PublicRoutes />
      </HelmetProvider>
    );
  }
  
  // Protected routes - require auth
  return (
    <MasterAuthProvider>
      <TenantProvider>
        <AccessibilityProvider>
          <TooltipProvider>
            <HelmetProvider>
              <GlobalAgentGeneratorProvider>
                <LSUniversalProvider autoEnable={false}>
                  <GenieStudioProvider>
                    <Toaster />
                    <AppLayoutWithEnrollment 
                      showUniversalGenie={true}
                      tenantId="default-tenant"
                      userId="current-user"
                    >
                      <RouteTracker>
                        <AppContent />
                      </RouteTracker>
                    </AppLayoutWithEnrollment>
                    <GlobalAgentGeneratorModal />
                  </GenieStudioProvider>
                </LSUniversalProvider>
              </GlobalAgentGeneratorProvider>
            </HelmetProvider>
          </TooltipProvider>
        </AccessibilityProvider>
      </TenantProvider>
    </MasterAuthProvider>
  );
};

// DEV-ONLY: Ralph Wiggum Global Provider and Panel
const isDev = import.meta.env.DEV;

// Import Ralph Wiggum components directly (they handle dev check internally)
import { RalphWiggumProvider } from '@/contexts/RalphWiggumContext';
import { RalphWiggumGlobalPanel } from '@/components/global/RalphWiggumGlobalPanel';

const App = () => {
  console.log('🚀 App component rendering...');
  
  return (
    <BrowserRouter>
      <ErrorBoundary>
        <QueryClientProvider client={queryClient}>
          <RalphWiggumProvider>
            <AppRouter />
            {isDev && <RalphWiggumGlobalPanel />}
          </RalphWiggumProvider>
        </QueryClientProvider>
      </ErrorBoundary>
    </BrowserRouter>
  );
};

export default App;