/**
 * ONBOARDING DASHBOARD - Treatment Center Onboarding Management
 * Role: onboardingTeam
 * Features: Real data, comprehensive workflow, secure policies
 */
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { 
  Plus, 
  Search, 
  Filter, 
  Download,
  Users,
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';
import AppLayout from '@/components/layout/AppLayout';
import { useMasterOnboarding } from '@/hooks/useMasterOnboarding';
import { useMasterAuth } from '@/hooks/useMasterAuth';
import { OnboardingWizard } from '@/components/onboarding/OnboardingWizard';
import { EnhancedOnboardingWizard } from '@/components/onboarding/EnhancedOnboardingWizard';
import { OnboardingTable } from '@/components/onboarding/OnboardingTable';
import { TreatmentCenterOnboarding } from '@/types/onboarding';

const OnboardingDashboard: React.FC = () => {
  const [view, setView] = useState<'dashboard' | 'wizard' | 'comprehensive'>('dashboard');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [editingApplicationId, setEditingApplicationId] = useState<string | null>(null);

  const { user, userRoles } = useMasterAuth();
  const { 
    onboardingApplications, 
    onboardingStats, 
    isLoading, 
    createApplication,
    updateApplication
  } = useMasterOnboarding();

  // Security check - only onboardingTeam can access
  const hasAccess = userRoles.includes('superAdmin') || userRoles.includes('onboardingTeam');

  if (!hasAccess) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
            <p className="text-muted-foreground">
              You need onboardingTeam role to access this page.
            </p>
          </div>
        </div>
      </AppLayout>
    );
  }

  const handleCreateNew = () => {
    setEditingApplicationId(null);
    setView('wizard'); // Use original wizard with existing functionality
  };

  const handleEditApplication = (applicationId: string) => {
    setEditingApplicationId(applicationId);
    setView('wizard'); // Use original wizard with existing functionality
  };

  const handleWizardSubmit = async (data: any) => {
    try {
      if (editingApplicationId) {
        await updateApplication({ id: editingApplicationId, updates: data });
      } else {
        await createApplication(data);
      }
      setView('dashboard');
      setEditingApplicationId(null);
    } catch (error) {
      console.error('Error saving application:', error);
    }
  };

  const handleSaveAndExit = async (data: any) => {
    try {
      if (editingApplicationId) {
        await updateApplication({ id: editingApplicationId, updates: { ...data, status: 'draft' } });
      } else {
        await createApplication({ ...data, status: 'draft' });
      }
      setView('dashboard');
      setEditingApplicationId(null);
    } catch (error) {
      console.error('Error saving draft:', error);
    }
  };

  const handleBackToDashboard = () => {
    setView('dashboard');
    setEditingApplicationId(null);
  };

  const filteredApplications = onboardingApplications.filter(app => {
    const matchesSearch = app.legal_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         app.dba_name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || app.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (view === 'comprehensive') {
    const currentApplication = editingApplicationId 
      ? onboardingApplications.find(app => app.id === editingApplicationId)
      : null;

    // Simplified initial data - let the wizard handle type conversion
    const initialData = currentApplication as any;

    return (
      <AppLayout>
        <EnhancedOnboardingWizard
          applicationId={editingApplicationId}
          onSubmit={handleWizardSubmit}
          onSaveAndExit={handleSaveAndExit}
          onBack={handleBackToDashboard}
          initialData={initialData}
        />
      </AppLayout>
    );
  }

  if (view === 'wizard') {
    return (
      <AppLayout>
        <OnboardingWizard
          applicationId={editingApplicationId}
          onSubmit={handleWizardSubmit}
          onBack={handleBackToDashboard}
        />
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Treatment Center Onboarding</h1>
            <p className="text-muted-foreground">
              Manage onboarding applications and workflows
            </p>
          </div>
          <Button onClick={handleCreateNew} className="gap-2">
            <Plus className="h-4 w-4" />
            New Application
          </Button>
        </div>

        {/* Enhanced Stats Cards with Treatment Center Progress */}
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-blue-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Treatment Centers</p>
                  <p className="text-2xl font-bold">{onboardingStats.total}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-gray-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Draft</p>
                  <p className="text-2xl font-bold">{onboardingStats.draft}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-yellow-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Submitted</p>
                  <p className="text-2xl font-bold">{onboardingStats.submitted}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-orange-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Under Review</p>
                  <p className="text-2xl font-bold">{onboardingStats.under_review}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Approved</p>
                  <p className="text-2xl font-bold">{onboardingStats.approved}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <XCircle className="h-4 w-4 text-red-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Rejected</p>
                  <p className="text-2xl font-bold">{onboardingStats.rejected}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Onboarding Progress Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Onboarding Progress Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Completion Rate</span>
                  <span className="text-sm font-medium">
                    {Math.round((onboardingStats.approved / Math.max(onboardingStats.total, 1)) * 100)}%
                  </span>
                </div>
                <div className="w-full bg-secondary rounded-full h-2">
                  <div 
                    className="bg-primary h-2 rounded-full transition-all duration-300"
                    style={{ 
                      width: `${Math.round((onboardingStats.approved / Math.max(onboardingStats.total, 1)) * 100)}%` 
                    }}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">In Progress</p>
                    <p className="font-medium">{onboardingStats.submitted + onboardingStats.under_review}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Pending Start</p>
                    <p className="font-medium">{onboardingStats.draft}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Button onClick={handleCreateNew} className="w-full gap-2">
                  <Plus className="h-4 w-4" />
                  Start New Treatment Center Onboarding
                </Button>
                <Button variant="outline" className="w-full gap-2">
                  <Download className="h-4 w-4" />
                  Export Progress Report
                </Button>
                <Button variant="outline" className="w-full gap-2">
                  <FileText className="h-4 w-4" />
                  Download Onboarding Template
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Applications</CardTitle>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 mb-6">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search applications..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border rounded-md"
              >
                <option value="all">All Status</option>
                <option value="draft">Draft</option>
                <option value="submitted">Submitted</option>
                <option value="under_review">Under Review</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>

            <OnboardingTable
              applications={filteredApplications}
              isLoading={isLoading}
              onEdit={handleEditApplication}
            />
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default OnboardingDashboard;