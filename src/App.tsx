
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@/components/auth/AuthProvider';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import StandardizedDashboardLayout from '@/components/layout/StandardizedDashboardLayout';
import { ThemeProvider } from 'next-themes';
import Index from '@/pages/Index';
import Dashboard from '@/pages/Dashboard';
import Users from '@/pages/Users';
import Facilities from '@/pages/Facilities';
import Patients from '@/pages/Patients';
import Settings from '@/pages/Settings';
import Onboarding from '@/pages/Onboarding';
import NotFound from '@/pages/NotFound';
import Modules from '@/pages/Modules';
import AuditLog from '@/pages/AuditLog';
import ApiIntegrations from '@/pages/ApiIntegrations';
import SystemAssessment from '@/pages/SystemAssessment';
import DesignSystem from '@/pages/DesignSystem';

const queryClient = new QueryClient();

function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <Router>
            {/* Remove the wrapper div that was adding extra background and spacing */}
            <Routes>
              <Route path="/" element={<Index />} />
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <StandardizedDashboardLayout showPageHeader pageTitle="Dashboard" pageSubtitle="Healthcare System Overview">
                      <Dashboard />
                    </StandardizedDashboardLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/users"
                element={
                  <ProtectedRoute>
                    <StandardizedDashboardLayout showPageHeader pageTitle="User Management" pageSubtitle="Manage user accounts, roles, and permissions">
                      <Users />
                    </StandardizedDashboardLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/facilities"
                element={
                  <ProtectedRoute>
                    <StandardizedDashboardLayout showPageHeader pageTitle="Facilities" pageSubtitle="Manage healthcare facilities and locations">
                      <Facilities />
                    </StandardizedDashboardLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/patients"
                element={
                  <ProtectedRoute>
                    <StandardizedDashboardLayout showPageHeader pageTitle="Patients" pageSubtitle="Manage patient records and information">
                      <Patients />
                    </StandardizedDashboardLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/settings"
                element={
                  <ProtectedRoute>
                    <StandardizedDashboardLayout showPageHeader pageTitle="Settings" pageSubtitle="System configuration and preferences">
                      <Settings />
                    </StandardizedDashboardLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/onboarding"
                element={
                  <ProtectedRoute>
                    <StandardizedDashboardLayout showPageHeader pageTitle="Onboarding" pageSubtitle="User onboarding and setup workflows">
                      <Onboarding />
                    </StandardizedDashboardLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/modules"
                element={
                  <ProtectedRoute>
                    <StandardizedDashboardLayout showPageHeader pageTitle="Modules" pageSubtitle="System modules and components management">
                      <Modules />
                    </StandardizedDashboardLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/audit-log"
                element={
                  <ProtectedRoute>
                    <StandardizedDashboardLayout showPageHeader pageTitle="Audit Log" pageSubtitle="System activity and security audit trail">
                      <AuditLog />
                    </StandardizedDashboardLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/api-integrations"
                element={
                  <ProtectedRoute>
                    <ApiIntegrations />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/design-system"
                element={
                  <ProtectedRoute>
                    <StandardizedDashboardLayout showPageHeader pageTitle="Design System" pageSubtitle="Component library and design tokens">
                      <DesignSystem />
                    </StandardizedDashboardLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/system-assessment"
                element={
                  <ProtectedRoute>
                    <SystemAssessment />
                  </ProtectedRoute>
                }
              />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Router>
        </AuthProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
