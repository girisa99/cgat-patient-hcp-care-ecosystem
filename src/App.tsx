
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { CleanAuthProvider } from '@/components/auth/CleanAuthProvider';
import { Toaster } from '@/components/ui/toaster';
import ProtectedRoute from '@/components/auth/ProtectedRoute';

// Import pages - all using consolidated hooks
import Index from '@/pages/Index';
import LoginPage from '@/pages/LoginPage';
import DashboardPage from '@/pages/DashboardPage';
import UsersPage from '@/pages/UsersPage';
import FacilitiesPage from '@/pages/FacilitiesPage';
import ModulesPage from '@/pages/ModulesPage';
import PatientsPage from '@/pages/PatientsPage';
import ApiServicesPage from '@/pages/ApiServicesPage';
import DataImportPage from '@/pages/DataImport';
import ConsolidationPage from '@/pages/ConsolidationPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  console.log('🚀 App: Rendering with consolidated single source architecture...');

  return (
    <QueryClientProvider client={queryClient}>
      <CleanAuthProvider>
        <Router>
          <Routes>
            {/* Main index route */}
            <Route path="/" element={<Index />} />
            
            {/* Auth routes */}
            <Route path="/login" element={<LoginPage />} />
            
            {/* Protected application routes */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/users"
              element={
                <ProtectedRoute>
                  <UsersPage />
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/facilities"
              element={
                <ProtectedRoute>
                  <FacilitiesPage />
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/modules"
              element={
                <ProtectedRoute>
                  <ModulesPage />
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/patients"
              element={
                <ProtectedRoute>
                  <PatientsPage />
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/api-services"
              element={
                <ProtectedRoute>
                  <ApiServicesPage />
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/data-import"
              element={
                <ProtectedRoute>
                  <DataImportPage />
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/consolidation"
              element={
                <ProtectedRoute>
                  <ConsolidationPage />
                </ProtectedRoute>
              }
            />
          </Routes>
          <Toaster />
        </Router>
      </CleanAuthProvider>
    </QueryClientProvider>
  );
}

export default App;
