
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@/components/auth/AuthProvider';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
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
            <Routes>
              <Route path="/" element={<Index />} />
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/users"
                element={
                  <ProtectedRoute>
                    <Users />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/facilities"
                element={
                  <ProtectedRoute>
                    <Facilities />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/patients"
                element={
                  <ProtectedRoute>
                    <Patients />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/settings"
                element={
                  <ProtectedRoute>
                    <Settings />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/onboarding"
                element={
                  <ProtectedRoute>
                    <Onboarding />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/modules"
                element={
                  <ProtectedRoute>
                    <Modules />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/audit-log"
                element={
                  <ProtectedRoute>
                    <AuditLog />
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
                    <DesignSystem />
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
