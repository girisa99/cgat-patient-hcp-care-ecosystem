
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@/components/auth/AuthProvider';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import DashboardLayout from '@/components/layout/DashboardLayout';
import Index from '@/pages/Index';
import Dashboard from '@/pages/Dashboard';
import Users from '@/pages/Users';
import Facilities from '@/pages/Facilities';
import Patients from '@/pages/Patients';
import Settings from '@/pages/Settings';
import Onboarding from '@/pages/Onboarding';
import NotFound from '@/pages/NotFound';
import Modules from '@/pages/Modules';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <div className="min-h-screen bg-gray-50">
            <Routes>
              <Route path="/" element={<Index />} />
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <DashboardLayout>
                      <Dashboard />
                    </DashboardLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/users"
                element={
                  <ProtectedRoute>
                    <DashboardLayout>
                      <Users />
                    </DashboardLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/facilities"
                element={
                  <ProtectedRoute>
                    <DashboardLayout>
                      <Facilities />
                    </DashboardLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/patients"
                element={
                  <ProtectedRoute>
                    <DashboardLayout>
                      <Patients />
                    </DashboardLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/settings"
                element={
                  <ProtectedRoute>
                    <DashboardLayout>
                      <Settings />
                    </DashboardLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/onboarding"
                element={
                  <ProtectedRoute>
                    <DashboardLayout>
                      <Onboarding />
                    </DashboardLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/modules"
                element={
                  <ProtectedRoute>
                    <DashboardLayout>
                      <Modules />
                    </DashboardLayout>
                  </ProtectedRoute>
                }
              />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
