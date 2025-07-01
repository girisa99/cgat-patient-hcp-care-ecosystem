
import React, { useState, useMemo } from 'react';
import { PageHeader } from '@/components/shared/PageHeader';
import { DataTable } from '@/components/shared/DataTable';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, Plus, BarChart3, Users, Activity } from 'lucide-react';
import { ModuleConfig } from '@/utils/moduleValidation';

interface ExtensibleModuleTemplateProps<T = any> {
  config: ModuleConfig;
  data?: T[];
  isLoading?: boolean;
  statistics?: {
    total: number;
    active: number;
    inactive: number;
    recentlyCreated: number;
  };
  onAdd?: () => void;
  onEdit?: (item: T) => void;
  onDelete?: (item: T) => void;
  onSearch?: (query: string) => T[];
  customColumns?: Array<{
    key: string;
    header: string;
    render?: (item: T) => React.ReactNode;
  }>;
  customActions?: React.ReactNode;
  enableSearch?: boolean;
  enableStats?: boolean;
  searchPlaceholder?: string;
}

/**
 * Universal Extensible Module Template Component
 * 
 * This is the single source of truth for all module UI components.
 * Automatically adapts to any module type with intelligent defaults.
 * 
 * Features:
 * - Universal compatibility with all data structures
 * - Intelligent column detection and rendering
 * - Built-in search and filtering
 * - Automatic statistics generation
 * - Responsive design
 * - Accessibility compliance
 * - Extensible action system
 */
export const ExtensibleModuleTemplate = <T extends { id: string; created_at?: string; status?: string }>({
  config,
  data = [],
  isLoading = false,
  statistics,
  onAdd,
  onEdit,
  onDelete,
  onSearch,
  customColumns,
  customActions,
  enableSearch = true,
  enableStats = true,
  searchPlaceholder
}: ExtensibleModuleTemplateProps<T>) => {
  const [searchQuery, setSearchQuery] = useState('');
  
  // Intelligent column generation
  const columns = useMemo(() => {
    if (customColumns) return customColumns;
    
    // Smart column detection based on data structure
    const sampleItem = data[0];
    if (!sampleItem) return [];
    
    const detectedColumns = [];
    
    // Primary identifier column
    if (sampleItem.name || sampleItem.title || sampleItem.first_name) {
      detectedColumns.push({
        key: 'name',
        header: 'Name',
        render: (item: T) => (
          <div className="flex flex-col">
            <span className="font-medium">
              {(item as any).name || 
               (item as any).title || 
               `${(item as any).first_name || ''} ${(item as any).last_name || ''}`.trim() || 
               'N/A'}
            </span>
            {(item as any).email && (
              <span className="text-sm text-muted-foreground">{(item as any).email}</span>
            )}
          </div>
        )
      });
    }
    
    // Status column
    if (sampleItem.status) {
      detectedColumns.push({
        key: 'status',
        header: 'Status',
        render: (item: T) => <StatusBadge status={(item as any).status || 'active'} />
      });
    }
    
    // Role or type column
    if ((sampleItem as any).role || (sampleItem as any).type || (sampleItem as any).facility_type) {
      detectedColumns.push({
        key: 'role',
        header: 'Role/Type',
        render: (item: T) => (
          <Badge variant="outline">
            {(item as any).role || (item as any).type || (item as any).facility_type || 'N/A'}
          </Badge>
        )
      });
    }
    
    // Date column
    if (sampleItem.created_at) {
      detectedColumns.push({
        key: 'created_at',
        header: 'Created',
        render: (item: T) => {
          const date = item.created_at || (item as any).created_at;
          return date ? new Date(date).toLocaleDateString() : 'N/A';
        }
      });
    }
    
    return detectedColumns;
  }, [data, customColumns]);
  
  // Add action column if needed
  const finalColumns = useMemo(() => {
    if (!onEdit && !onDelete) return columns;
    
    return [
      ...columns,
      {
        key: 'actions',
        header: 'Actions',
        render: (item: T) => (
          <div className="flex space-x-2">
            {onEdit && (
              <Button
                onClick={() => onEdit(item)}
                variant="ghost"
                size="sm"
                className="text-blue-600 hover:text-blue-800"
              >
                Edit
              </Button>
            )}
            {onDelete && (
              <Button
                onClick={() => onDelete(item)}
                variant="ghost"
                size="sm"
                className="text-red-600 hover:text-red-800"
              >
                Delete
              </Button>
            )}
          </div>
        )
      }
    ];
  }, [columns, onEdit, onDelete]);
  
  // Filtered data based on search
  const filteredData = useMemo(() => {
    if (!searchQuery.trim() || !onSearch) return data;
    return onSearch(searchQuery);
  }, [data, searchQuery, onSearch]);
  
  // Generate statistics if not provided
  const displayStats = useMemo(() => {
    if (statistics) return statistics;
    if (!enableStats) return null;
    
    const total = data.length;
    const active = data.filter((item: any) => item.status === 'active').length;
    const inactive = total - active;
    const recentlyCreated = data.filter((item: any) => {
      const created = new Date(item.created_at || item.created_at);
      const week = new Date();
      week.setDate(week.getDate() - 7);
      return created > week;
    }).length;
    
    return { total, active, inactive, recentlyCreated };
  }, [data, statistics, enableStats]);
  
  const statsCards = displayStats ? [
    { label: 'Total', value: displayStats.total, color: 'text-blue-600', icon: BarChart3 },
    { label: 'Active', value: displayStats.active, color: 'text-green-600', icon: Users },
    { label: 'Inactive', value: displayStats.inactive, color: 'text-gray-600', icon: Users },
    { label: 'Recent', value: displayStats.recentlyCreated, color: 'text-purple-600', icon: Activity },
  ] : [];

  return (
    <div className="space-y-6">
      {/* Universal Header */}
      <PageHeader
        title={config.moduleName}
        description={`Manage ${config.moduleName.toLowerCase()} records with intelligent automation`}
        stats={statsCards}
        actions={
          <div className="flex items-center gap-2">
            {customActions}
            {onAdd && (
              <Button onClick={onAdd} className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Add {config.moduleName}
              </Button>
            )}
          </div>
        }
      />

      {/* Search and Filters */}
      {enableSearch && onSearch && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={searchPlaceholder || `Search ${config.moduleName.toLowerCase()}...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="max-w-sm"
              />
              {searchQuery && (
                <Badge variant="secondary">
                  {filteredData.length} of {data.length} results
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Data Table */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>All {config.moduleName} Records</CardTitle>
            <div className="text-sm text-muted-foreground">
              Table: {config.tableName} | Total: {filteredData.length}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <DataTable
            data={filteredData}
            columns={finalColumns}
            isLoading={isLoading}
            emptyMessage={
              searchQuery 
                ? `No ${config.moduleName.toLowerCase()} found matching "${searchQuery}"`
                : `No ${config.moduleName.toLowerCase()} records found`
            }
          />
        </CardContent>
      </Card>

      {/* Debug Information (Development Only) */}
      {process.env.NODE_ENV === 'development' && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardHeader>
            <CardTitle className="text-yellow-800 text-sm">
              🔧 Universal Template Debug
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xs text-yellow-700 space-y-1">
              <div><strong>Module:</strong> {config.moduleName}</div>
              <div><strong>Table:</strong> {config.tableName}</div>
              <div><strong>Required Fields:</strong> {config.requiredFields.join(', ')}</div>
              <div><strong>Data Count:</strong> {data.length}</div>
              <div><strong>Filtered Count:</strong> {filteredData.length}</div>
              <div><strong>Columns Detected:</strong> {columns.length}</div>
              <div><strong>Loading:</strong> {isLoading ? 'Yes' : 'No'}</div>
              <div><strong>Search Enabled:</strong> {enableSearch ? 'Yes' : 'No'}</div>
              <div><strong>Stats Enabled:</strong> {enableStats ? 'Yes' : 'No'}</div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

// Legacy compatibility
export default ExtensibleModuleTemplate;
