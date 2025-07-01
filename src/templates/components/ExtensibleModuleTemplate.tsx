
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  MoreHorizontal,
  TrendingUp,
  Users,
  Activity
} from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

interface ColumnConfig {
  key: string;
  header: string;
  render?: (item: any) => React.ReactNode;
  sortable?: boolean;
}

interface ExtensibleModuleTemplateProps<T = any> {
  config: {
    tableName: string;
    moduleName: string;
    requiredFields: string[];
  };
  data: T[];
  isLoading: boolean;
  statistics?: {
    total: number;
    active?: number;
    inactive?: number;
    [key: string]: any;
  };
  onAdd?: () => void;
  onEdit?: (item: T) => void;
  onDelete?: (item: T) => void;
  onSearch?: (query: string) => T[];
  customColumns?: ColumnConfig[];
  customActions?: React.ReactNode;
  enableSearch?: boolean;
  enableStats?: boolean;
  searchPlaceholder?: string;
}

export const ExtensibleModuleTemplate = <T extends Record<string, any>>({
  config,
  data,
  isLoading,
  statistics,
  onAdd,
  onEdit,
  onDelete,
  onSearch,
  customColumns,
  customActions,
  enableSearch = true,
  enableStats = true,
  searchPlaceholder = "Search items..."
}: ExtensibleModuleTemplateProps<T>) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredData, setFilteredData] = useState<T[]>(data);

  // Handle search
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (onSearch) {
      const filtered = onSearch(query);
      setFilteredData(filtered);
    } else {
      // Default search logic
      const filtered = data.filter((item: T) => {
        const searchableFields = ['name', 'title', 'first_name', 'last_name', 'email'];
        return searchableFields.some(field => 
          item[field]?.toString().toLowerCase().includes(query.toLowerCase())
        );
      });
      setFilteredData(filtered);
    }
  };

  // Auto-detect columns from data
  const autoDetectedColumns = useMemo(() => {
    if (!data.length) return [];
    
    const firstItem = data[0];
    const commonColumns: ColumnConfig[] = [];
    
    // Primary identifier column
    if ('name' in firstItem || 'title' in firstItem || 'first_name' in firstItem) {
      commonColumns.push({
        key: 'primary',
        header: 'Name',
        render: (item: T) => (
          <div className="font-medium">
            {(item as any).name || (item as any).title || 
             `${(item as any).first_name || ''} ${(item as any).last_name || ''}`.trim() || 
             'Unnamed'}
          </div>
        )
      });
    }
    
    // Email column
    if ('email' in firstItem) {
      commonColumns.push({
        key: 'email',
        header: 'Email',
        render: (item: T) => (
          <div className="text-sm text-gray-600">{(item as any).email}</div>
        )
      });
    }
    
    // Status column
    if ('status' in firstItem || 'is_active' in firstItem) {
      commonColumns.push({
        key: 'status',
        header: 'Status',
        render: (item: T) => (
          <Badge variant={(item as any).status === 'active' || (item as any).is_active ? 'default' : 'secondary'}>
            {(item as any).status || ((item as any).is_active ? 'Active' : 'Inactive')}
          </Badge>
        )
      });
    }
    
    // Created date column
    if ('created_at' in firstItem) {
      commonColumns.push({
        key: 'created_at',
        header: 'Created',
        render: (item: T) => (
          <div className="text-sm text-gray-500">
            {new Date((item as any).created_at).toLocaleDateString()}
          </div>
        )
      });
    }
    
    return commonColumns;
  }, [data]);

  const columns = customColumns || autoDetectedColumns;
  const displayData = searchQuery ? filteredData : data;

  // Update filtered data when main data changes
  React.useEffect(() => {
    if (!searchQuery) {
      setFilteredData(data);
    } else {
      handleSearch(searchQuery);
    }
  }, [data, searchQuery]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">{config.moduleName}</h2>
        </div>
        <div className="flex justify-center p-8">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">{config.moduleName}</h2>
        <div className="flex gap-2">
          {customActions}
          {onAdd && (
            <Button onClick={onAdd}>
              <Plus className="h-4 w-4 mr-2" />
              Add {config.moduleName.slice(0, -1)}
            </Button>
          )}
        </div>
      </div>

      {/* Statistics */}
      {enableStats && statistics && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total</p>
                  <p className="text-2xl font-bold">{statistics.total}</p>
                </div>
                <Users className="h-8 w-8 text-gray-400" />
              </div>
            </CardContent>
          </Card>
          
          {statistics.active !== undefined && (
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Active</p>
                    <p className="text-2xl font-bold">{statistics.active}</p>
                  </div>
                  <Activity className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>
          )}
          
          {statistics.inactive !== undefined && (
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Inactive</p>
                    <p className="text-2xl font-bold">{statistics.inactive}</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-gray-400" />
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Search */}
      {enableSearch && (
        <div className="flex items-center space-x-2">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder={searchPlaceholder}
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      )}

      {/* Data Table */}
      <Card>
        <CardContent className="p-0">
          {displayData.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              {searchQuery ? 'No items match your search.' : `No ${config.moduleName.toLowerCase()} found.`}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    {columns.map((column) => (
                      <th key={column.key} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {column.header}
                      </th>
                    ))}
                    {(onEdit || onDelete) && (
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {displayData.map((item, index) => (
                    <tr key={(item as any).id || index} className="hover:bg-gray-50">
                      {columns.map((column) => (
                        <td key={column.key} className="px-6 py-4 whitespace-nowrap">
                          {column.render ? column.render(item) : (item as any)[column.key]}
                        </td>
                      ))}
                      {(onEdit || onDelete) && (
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              {onEdit && (
                                <DropdownMenuItem onClick={() => onEdit(item)}>
                                  <Edit className="h-4 w-4 mr-2" />
                                  Edit
                                </DropdownMenuItem>
                              )}
                              {onDelete && (
                                <DropdownMenuItem 
                                  onClick={() => onDelete(item)}
                                  className="text-red-600"
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Delete
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ExtensibleModuleTemplate;
