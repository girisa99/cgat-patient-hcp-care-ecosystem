
import React, { useState } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { PageContainer } from '@/components/layout/PageContainer';
import { AdminStatsGrid, StatCard } from '@/components/layout/AdminStatsGrid';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, UserPlus, CheckCircle, Clock, AlertCircle, Search, Filter, Download } from 'lucide-react';
import OnboardingWorkflowsList from '@/components/onboarding/OnboardingWorkflowsList';
import CreateOnboardingDialog from '@/components/onboarding/CreateOnboardingDialog';
import EditOnboardingDialog from '@/components/onboarding/EditOnboardingDialog';
import { useOnboarding } from '@/hooks/useOnboarding';

const Onboarding = () => {
  const { onboardingWorkflows, isLoading, meta } = useOnboarding();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedWorkflow, setSelectedWorkflow] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const handleCreateWorkflow = () => {
    setCreateDialogOpen(true);
  };

  const handleEditWorkflow = (workflow: any) => {
    setSelectedWorkflow(workflow);
    setEditDialogOpen(true);
  };

  // Filter workflows based on search
  const filteredWorkflows = onboardingWorkflows.filter(workflow => 
    workflow.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    workflow.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Calculate stats
  const stats = {
    total: onboardingWorkflows.length,
    active: onboardingWorkflows.filter(w => w.is_active !== false).length,
    completed: onboardingWorkflows.filter(w => w.status === 'completed').length,
    pending: onboardingWorkflows.filter(w => w.status === 'pending').length
  };

  const headerActions = (
    <Button onClick={handleCreateWorkflow}>
      <Plus className="h-4 w-4 mr-2" />
      New Onboarding
    </Button>
  );

  return (
    <MainLayout>
      <PageContainer
        title="Onboarding Management"
        subtitle={`Manage onboarding workflows and processes (${onboardingWorkflows.length} workflows from ${meta.dataSource})`}
        headerActions={headerActions}
      >
        <div className="space-y-6">
          {/* Data Source Indicator */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm text-green-800 font-medium">
                Real Database: {meta.dataSource}
              </span>
            </div>
            <div className="mt-2 text-xs text-green-700">
              Found: {onboardingWorkflows.length} onboarding workflows
            </div>
          </div>

          {/* Stats Grid */}
          <AdminStatsGrid columns={4}>
            <StatCard
              title="Total Workflows"
              value={stats.total}
              icon={UserPlus}
              description="All onboarding workflows"
            />
            <StatCard
              title="Active"
              value={stats.active}
              icon={CheckCircle}
              description="Currently active"
            />
            <StatCard
              title="Completed"
              value={stats.completed}
              icon={CheckCircle}
              description="Successfully completed"
            />
            <StatCard
              title="Pending"
              value={stats.pending}
              icon={Clock}
              description="Awaiting action"
            />
          </AdminStatsGrid>

          {/* Search and Filters */}
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search onboarding workflows..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>

          {/* Onboarding List */}
          <Card className="shadow-sm">
            <CardContent className="p-6">
              {isLoading ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">Loading onboarding workflows...</p>
                </div>
              ) : (
                <OnboardingWorkflowsList 
                  workflows={filteredWorkflows}
                  onEditWorkflow={handleEditWorkflow}
                />
              )}
            </CardContent>
          </Card>
        </div>

        {/* Dialogs */}
        <CreateOnboardingDialog 
          open={createDialogOpen}
          onOpenChange={setCreateDialogOpen}
        />

        {selectedWorkflow && (
          <EditOnboardingDialog
            workflow={selectedWorkflow}
            open={editDialogOpen}
            onOpenChange={setEditDialogOpen}
          />
        )}
      </PageContainer>
    </MainLayout>
  );
};

export default Onboarding;
