
import React from 'react';
import { PageHeader } from '@/components/shared/PageHeader';
import { DataTable } from '@/components/shared/DataTable';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface ModuleTemplateProps {
  moduleName: string;
  moduleDescription?: string;
  moduleIcon?: React.ReactNode;
  data?: any[];
  isLoading?: boolean;
  stats?: Array<{
    label: string;
    value: string | number;
    color?: string;
  }>;
}

/**
 * Template for creating new modules with consistent structure
 * 
 * Usage:
 * 1. Copy this template
 * 2. Rename to your module name (e.g., OnboardingModule.tsx)
 * 3. Customize the data structure and columns
 * 4. Add module-specific functionality
 */
export const ModuleTemplate: React.FC<ModuleTemplateProps> = ({
  moduleName,
  moduleDescription,
  moduleIcon,
  data = [],
  isLoading,
  stats
}) => {
  // Example columns - customize for your module
  const columns = [
    {
      key: 'name',
      header: 'Name',
      render: (item: any) => <span className="font-medium">{item.name}</span>
    },
    {
      key: 'status',
      header: 'Status', 
      render: (item: any) => <StatusBadge status={item.status} />
    },
    {
      key: 'created_at',
      header: 'Created',
      render: (item: any) => new Date(item.created_at).toLocaleDateString()
    }
  ];

  const handleAdd = () => {
    console.log(`Add new ${moduleName.toLowerCase()} item`);
    // Implement your add functionality
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={moduleName}
        description={moduleDescription}
        icon={moduleIcon}
        stats={stats}
      />

      <Card>
        <CardHeader>
          <CardTitle>Manage {moduleName}</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            data={data}
            columns={columns}
            onAdd={handleAdd}
            addButtonText={`Add ${moduleName}`}
            isLoading={isLoading}
            emptyMessage={`No ${moduleName.toLowerCase()} items found`}
          />
        </CardContent>
      </Card>
    </div>
  );
};
