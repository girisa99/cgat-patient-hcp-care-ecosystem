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
import GenieStudioProtectedRoute from '@/components/auth/GenieStudioProtectedRoute';
import { TenantProvider } from '@/contexts/TenantContext';
import { HelmetProvider } from 'react-helmet-async';
import { GlobalAgentGeneratorProvider } from '@/hooks/useGlobalAgentGenerator';
import { GlobalAgentGeneratorModal } from '@/components/global/GlobalAgentGeneratorModal';
import { LSUniversalProvider } from '@/components/label-studio/LSUniversalProvider';
import { GenieStudioProvider } from '@/contexts/GenieStudioSharedContext';
import { LazyPages, lazyWithRetry } from '@/utils/lazyWithRetry';
import { SmartDefaultRoute, RouteTracker } from '@/components/routing/SmartDefaultRoute';
import { EnhancedComplianceGate } from '@/components/compliance/EnhancedComplianceGate';
import { RegionalComplianceProvider } from '@/hooks/useRegionalCompliance';
import { ContentModerationGate } from '@/components/compliance/ContentModerationGate';
// P4 Resilience - Session Recovery & Debug Mode
import { DebugProvider } from '@/components/resilience/DebugModeToggle';
import { SessionRecoveryPrompt } from '@/components/resilience/SessionRecoveryPrompt';

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
// GenieStudioPricing removed - pricing is now integrated into landing page
import GenieStudioLanding from '@/pages/GenieStudioLanding';
import GenieAdminPage from '@/pages/GenieAdminPage';
import GenieSupportPage from '@/pages/GenieSupportPage';
const GenieExplorePage = React.lazy(() => import('@/pages/GenieExplorePage'));
const GenieProductsPage = React.lazy(() => import('@/pages/GenieProductsPage'));
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
const GenieExploreDemoPage = React.lazy(() => import('@/pages/GenieExploreDemoPage'));
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
  const location = window.location.pathname;
  
  // Check if this is a Genie Studio route (uses separate auth system)
  const isGenieStudioRoute = location.startsWith('/genie-studio') || 
    location.startsWith('/genie-spark') || 
    location.startsWith('/genie-mind') || 
    location.startsWith('/genie-vibe') ||
    location.startsWith('/genie-deck') ||
    location.startsWith('/genie-arc') ||
    location.startsWith('/genie-admin') ||
    location.startsWith('/subscription') ||
    location.startsWith('/marketing-materials');

  // Also check if user is on root route - SmartDefaultRoute will handle Genie Studio detection
  const isRootRoute = location === '/' || location === '';

  console.log('🎯 Auth state:', { isAuthenticated, isLoading, userRoles, isGenieStudioRoute, isRootRoute });

  // Show loading screen while auth is initializing
  if (isLoading) {
    console.log('⏳ Showing loading screen...');
    return <PageLoading message="Initializing application..." />;
  }

  // For Genie Studio routes OR root route, don't wait for legacy roles
  // Genie Studio routes use GenieStudioProtectedRoute
  // Root route uses SmartDefaultRoute which checks Genie Studio user status
  if (isAuthenticated && userRoles.length === 0 && !isGenieStudioRoute && !isRootRoute) {
    console.log('⏳ Waiting for roles to load (healthcare route)...');
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
              <Route path="/genie-studio-pricing" element={<Navigate to="/genie-landing#pricing" replace />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/email-confirmation" element={<EmailConfirmation />} />
              <Route path="/social-oauth-callback" element={
                <Suspense fallback={<PageLoading message="Processing..." />}>
                  {React.createElement(React.lazy(() => import('@/pages/SocialOAuthCallback')))}
                </Suspense>
              } />
              
              {/* Legal Pages - Public */}
              <Route path="/terms" element={
                <Suspense fallback={<PageLoading message="Loading..." />}>
                  {React.createElement(React.lazy(() => import('@/pages/TermsOfServicePage')))}
                </Suspense>
              } />
              <Route path="/privacy" element={
                <Suspense fallback={<PageLoading message="Loading..." />}>
                  {React.createElement(React.lazy(() => import('@/pages/PrivacyPolicyPage')))}
                </Suspense>
              } />
              <Route path="/cookies" element={
                <Suspense fallback={<PageLoading message="Loading..." />}>
                  {React.createElement(React.lazy(() => import('@/pages/CookiePolicyPage')))}
                </Suspense>
              } />
              <Route path="/acceptable-use" element={
                <Suspense fallback={<PageLoading message="Loading..." />}>
                  {React.createElement(React.lazy(() => import('@/pages/AcceptableUsePolicyPage')))}
                </Suspense>
              } />
              <Route path="/content-guidelines" element={
                <Suspense fallback={<PageLoading message="Loading..." />}>
                  {React.createElement(React.lazy(() => import('@/pages/ContentGuidelinesPage')))}
                </Suspense>
              } />
              <Route path="/dmca" element={
                <Suspense fallback={<PageLoading message="Loading..." />}>
                  {React.createElement(React.lazy(() => import('@/pages/DMCAPolicyPage')))}
                </Suspense>
              } />
              
              {/* Public landing page route */}
              <Route path="/genie-landing" element={<GenieStudioLanding />} />
              
              {/* Genie Explore - Interactive Journey */}
              <Route path="/explore" element={
                <Suspense fallback={<PageLoading message="Loading..." />}>
                  <GenieExplorePage />
                </Suspense>
              } />
              <Route path="/explore/demo" element={
                <Suspense fallback={<PageLoading message="Loading demo..." />}>
                  <GenieExploreDemoPage />
                </Suspense>
              } />
              <Route path="/explore/:step" element={
                <Suspense fallback={<PageLoading message="Loading..." />}>
                  <GenieExplorePage />
                </Suspense>
              } />
              
              {/* Genie Products */}
              <Route path="/products" element={
                <Suspense fallback={<PageLoading message="Loading..." />}>
                  <GenieProductsPage />
                </Suspense>
              } />
              <Route path="/products/:productSlug" element={
                <Suspense fallback={<PageLoading message="Loading..." />}>
                  <GenieProductsPage />
                </Suspense>
              } />
              
              {/* Genie Pricing - Redirect to landing page pricing section */}
              <Route path="/pricing" element={<Navigate to="/genie-landing#pricing" replace />} />
              
              {/* Genie Support - accessible to all (with auth prompt for tickets) */}
              <Route path="/genie-support" element={<GenieSupportPage />} />
              <Route path="/support" element={<GenieSupportPage />} />
              
              {/* Genie Admin - internal users only (self-protected) */}
              <Route path="/genie-admin" element={<GenieAdminPage />} />
              <Route path="/internal/users" element={<GenieAdminPage />} />
              
              {/* Root path - Dashboard redirect */}
              <Route path="/" element={
                isAuthenticated ? (
                  <SmartDefaultRoute userRoles={userRoles} />
                ) : (
                  <Navigate to="/genie-landing" replace />
                )
              } />
              
              {/* Protected routes */}
              {isAuthenticated ? (
                <>
                  
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
                  {/* Genie Analytics - Tiered access for subscribers */}
                  <Route path="/genie-analytics" element={
                    <GenieStudioProtectedRoute>
                      <Suspense fallback={<PageLoading message="Loading analytics..." />}>
                        {React.createElement(React.lazy(() => import('@/pages/GenieAnalyticsPage')))}
                      </Suspense>
                    </GenieStudioProtectedRoute>
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
                  {/* Genie Studio routes - use GenieStudioProtectedRoute with Genie-specific auth */}
                  <Route path="/genie-studio" element={
                    <GenieStudioProtectedRoute>
                      <Suspense fallback={<PageLoading message="Loading Genie Studio..." />}>
                        <LazyPages.GenieStudio />
                      </Suspense>
                    </GenieStudioProtectedRoute>
                  } />
                  <Route path="/genie-spark" element={
                    <GenieStudioProtectedRoute>
                      <Suspense fallback={<PageLoading message="Loading Genie Spark..." />}>
                        <LazyPages.GenieSpark />
                      </Suspense>
                    </GenieStudioProtectedRoute>
                  } />
                  {/* Genie Arc - Redirect to Production Hub with calendar tab (schedule flow merged) */}
                  <Route path="/genie-arc" element={
                    <Navigate to="/genie-admin?tab=calendar" replace />
                  } />
                  <Route path="/genie-mind" element={
                    <GenieStudioProtectedRoute>
                      <Suspense fallback={<PageLoading message="Loading Genie Mind..." />}>
                        <LazyPages.GenieMind />
                      </Suspense>
                    </GenieStudioProtectedRoute>
                  } />
                  <Route path="/genie-vibe" element={
                    <GenieStudioProtectedRoute>
                      <Suspense fallback={<PageLoading message="Loading Genie Vibe..." />}>
                        <LazyPages.GenieVibe />
                      </Suspense>
                    </GenieStudioProtectedRoute>
                  } />
                  <Route path="/genie-deck" element={
                    <GenieStudioProtectedRoute>
                      <Suspense fallback={<PageLoading message="Loading Genie Deck..." />}>
                        {React.createElement(React.lazy(() => import('@/pages/GenieDeck')))}
                      </Suspense>
                    </GenieStudioProtectedRoute>
                  } />
                  {/* Redirect all production routes to consolidated /genie-admin */}
                  <Route path="/genie-studio/productions" element={
                    <Navigate to="/genie-admin?tab=library" replace />
                  } />
                  <Route path="/production-hub" element={
                    <Navigate to="/genie-admin?tab=kanban" replace />
                  } />
                  <Route path="/arc/*" element={
                    <Navigate to="/genie-admin?tab=calendar" replace />
                  } />
                  <Route path="/marketing-materials" element={
                    <GenieStudioProtectedRoute>
                      <Suspense fallback={<PageLoading message="Loading Marketing Materials..." />}>
                        {React.createElement(React.lazy(() => import('@/pages/marketing/MarketingMaterialsPage')))}
                      </Suspense>
                    </GenieStudioProtectedRoute>
                  } />
                  <Route path="/genie-studio/feedback-analytics" element={
                    <GenieStudioProtectedRoute>
                      <Suspense fallback={<PageLoading message="Loading Feedback Analytics..." />}>
                        <AppLayout>
                          {React.createElement(React.lazy(() => import('@/components/genie-studio/FeedbackAnalyticsDashboard').then(m => ({ default: m.FeedbackAnalyticsDashboard }))))}
                        </AppLayout>
                      </Suspense>
                    </GenieStudioProtectedRoute>
                  } />
                  <Route path="/genie-vibe/mobile" element={
                    <GenieStudioProtectedRoute>
                      <Suspense fallback={<PageLoading message="Loading Mobile Studio..." />}>
                        {React.createElement(React.lazy(() => import('@/pages/MobileRecordingPage')))}
                      </Suspense>
                    </GenieStudioProtectedRoute>
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
                    <GenieStudioProtectedRoute>
                      <Suspense fallback={<PageLoading message="Loading subscription..." />}>
                        <SubscriptionPage />
                      </Suspense>
                    </GenieStudioProtectedRoute>
                  } />
                </>
              ) : (
                <>
                  {/* Unauthenticated users - redirect to Genie landing or login based on context */}
                  <Route path="/" element={<Navigate to="/genie-landing" replace />} />
                  <Route path="*" element={<Navigate to="/genie-landing" replace />} />
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
          {/* P4: Debug Mode Provider for verbose logging */}
          <DebugProvider>
            {/* Enhanced Compliance Gate - Blocks sanctioned regions + VPN/proxy bypass attempts */}
            <EnhancedComplianceGate>
              {/* Regional Compliance - Dynamic privacy/terms based on user region */}
              <RegionalComplianceProvider>
                {/* Content Moderation Gate - Blocks adult/explicit/prohibited content */}
                <ContentModerationGate showPreview={false}>
                  <RalphWiggumProvider>
                    <AppRouter />
                    {/* P4: Session Recovery Prompt - Restores wizard/form state after crash */}
                    <SessionRecoveryPrompt />
                    {isDev && <RalphWiggumGlobalPanel />}
                  </RalphWiggumProvider>
                </ContentModerationGate>
              </RegionalComplianceProvider>
            </EnhancedComplianceGate>
          </DebugProvider>
        </QueryClientProvider>
      </ErrorBoundary>
    </BrowserRouter>
  );
};

export default App;