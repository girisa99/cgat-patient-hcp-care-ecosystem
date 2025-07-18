
import React from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { useRoleBasedNavigation } from '@/hooks/useRoleBasedNavigation';
import { Card, CardContent } from '@/components/ui/card';
import { ExtensibleModuleTemplate } from '@/templates/components/ExtensibleModuleTemplate';
import { useTesting } from '@/hooks/useTesting';
import { Badge } from '@/components/ui/badge';
import { TestTube, Activity, BarChart3 } from 'lucide-react';

const Testing: React.FC = () => {
  console.log('🧪 Testing page - Using template structure');
  
  const { hasAccess, currentRole } = useRoleBasedNavigation();
  const testing = useTesting();
  
  if (!hasAccess('/testing')) {
    return (
      <AppLayout title="Access Denied">
        <Card>
          <CardContent className="p-8 text-center">
            <p>You don't have permission to access Testing Suite.</p>
            <p className="text-sm text-muted-foreground mt-2">Current role: {currentRole}</p>
          </CardContent>
        </Card>
      </AppLayout>
    );
  }

  const columns = [
    {
      key: 'test_name',
      header: 'Test Name'
    },
    {
      key: 'test_category',
      header: 'Category',
      cell: (value: string) => <Badge variant="outline">{value}</Badge>
    },
    {
      key: 'test_suite_type',
      header: 'Suite Type',
      cell: (value: string) => <Badge variant="secondary">{value}</Badge>
    },
    {
      key: 'test_status',
      header: 'Status',
      cell: (value: string) => (
        <Badge variant={value === 'passed' ? "default" : value === 'failed' ? "destructive" : "secondary"}>
          {value || 'pending'}
        </Badge>
      )
    },
    {
      key: 'validation_level',
      header: 'Validation Level',
      cell: (value: string) => value ? <Badge variant="outline">{value}</Badge> : 'N/A'
    },
    {
      key: 'last_executed_at',
      header: 'Last Executed',
      cell: (value: string) => value ? new Date(value).toLocaleDateString() : 'Never'
    }
  ];

  // Enhanced statistics for testing module
  const testingStats = () => {
    const stats = testing.getStatistics();
    const passed = testing.items.filter(item => item.test_status === 'passed').length;
    const failed = testing.items.filter(item => item.test_status === 'failed').length;
    const pending = testing.items.filter(item => !item.test_status || item.test_status === 'pending').length;
    
    return {
      total: stats.total,
      active: passed,
      inactive: failed,
      pending: pending,
      coverage: stats.total > 0 ? Math.round((passed / stats.total) * 100) : 0
    };
  };

  const customActions = (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-4 mr-4">
        <div className="flex items-center gap-2">
          <Activity className="h-4 w-4 text-green-600" />
          <span className="text-sm font-medium">{testingStats().active} Passed</span>
        </div>
        <div className="flex items-center gap-2">
          <BarChart3 className="h-4 w-4 text-blue-600" />
          <span className="text-sm font-medium">{testingStats().coverage}% Coverage</span>
        </div>
      </div>
      <TestTube className="h-4 w-4" />
    </div>
  );

  return (
    <AppLayout title="Comprehensive Testing Suite">
      <ExtensibleModuleTemplate
        title="Test Cases"
        description="Comprehensive testing suite with automated test case management, compliance validation, and business intelligence"
        items={testing.items}
        isLoading={testing.isLoading}
        error={testing.error}
        searchItems={testing.searchItems}
        createItem={undefined}
        updateItem={undefined}
        deleteItem={undefined}
        getStatistics={testingStats}
        columns={columns}
        onRefresh={testing.refetch}
        customActions={customActions}
        enableCreate={false}
        enableEdit={false}
        enableDelete={false}
      />
    </AppLayout>
  );
};

export default Testing;
