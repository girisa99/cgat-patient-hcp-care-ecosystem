
import React from 'react';
import { PageHeader } from '@/components/shared/PageHeader';
import { DataTable } from '@/components/shared/DataTable';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ModuleConfig } from '@/utils/moduleValidation';

interface ExtensibleModuleTemplateProps<T = any> {
  config: ModuleConfig;
  data?: T[];
  isLoading?: boolean;
  onAdd?: () => void;
  onEdit?: (item: T) => void;
  onDelete?: (item: T) => void;
  customColumns?: Array<{
    key: keyof T | string;
    header: string;
    render?: (item: T) => React.ReactNode;
  }>;
  customActions?: React.ReactNode;
  stats?: Array<{
    label: string;
    value: string | number;
    color?: string;
  }>;
}

/**
 * Extensible Module Template Component
 * 
 * This template automatically adapts to different module types and provides
 * consistent patterns that can be extended for all future modules.
 */
export const ExtensibleModuleTemplate = <T extends { id: string; created_at?: string; status?: string }>({
  config,
  data = [],
  isLoading,
  onAdd,
  onEdit,
  onDelete,
  customColumns,
  customActions,
  stats
}: ExtensibleModuleTemplateProps<T>) => {
  // Default columns that work for most modules
  const defaultColumns = [
    {
      key: 'name' as keyof T,
      header: 'Name',
      render: (item: T) => (
        <span className="font-medium">
          {(item as any).name || (item as any).title || (item as any).first_name || 'N/A'}
        </span>
      )
    },
    {
      key: 'status' as keyof T,
      header: 'Status',
      render: (item: T) => (
        <StatusBadge status={(item as any).status || 'active'} />
      )
    },
    {
      key: 'created_at' as keyof T,
      header: 'Created',
      render: (item: T) => {
        const date = item.created_at || (item as any).created_at;
        return date ? new Date(date).toLocaleDateString() : 'N/A';
      }
    }
  ];

  // Use custom columns if provided, otherwise use defaults
  const columns = customColumns || defaultColumns;

  // Add action column if edit/delete handlers are provided
  if (onEdit || onDelete) {
    columns.push({
      key: 'actions',
      header: 'Actions',
      render: (item: T) => (
        <div className="flex space-x-2">
          {onEdit && (
            <button
              onClick={() => onEdit(item)}
              className="text-blue-600 hover:text-blue-800 text-sm"
            >
              Edit
            </button>
          )}
          {onDelete && (
            <button
              onClick={() => onDelete(item)}
              className="text-red-600 hover:text-red-800 text-sm"
            >
              Delete
            </button>
          )}
        </div>
      )
    });
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={config.moduleName}
        description={`Manage ${config.moduleName.toLowerCase()} records`}
        stats={stats}
        actions={customActions}
      />

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>All {config.moduleName} Records</CardTitle>
            <div className="text-sm text-gray-500">
              Table: {config.tableName} | Total: {data.length}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <DataTable
            data={data}
            columns={columns}
            onAdd={onAdd}
            addButtonText={`Add ${config.moduleName}`}
            isLoading={isLoading}
            emptyMessage={`No ${config.moduleName.toLowerCase()} records found`}
          />
        </CardContent>
      </Card>

      {/* Debug information in development */}
      {process.env.NODE_ENV === 'development' && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardHeader>
            <CardTitle className="text-yellow-800 text-sm">Debug Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xs text-yellow-700 space-y-1">
              <div>Module: {config.moduleName}</div>
              <div>Table: {config.tableName}</div>
              <div>Required Fields: {config.requiredFields.join(', ')}</div>
              <div>Data Count: {data.length}</div>
              <div>Loading: {isLoading ? 'Yes' : 'No'}</div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
