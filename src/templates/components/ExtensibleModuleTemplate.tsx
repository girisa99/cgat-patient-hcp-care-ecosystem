import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { DataTable } from '@/components/ui/DataTable';
import { Plus, Search, RefreshCw, FileText } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

export interface ModuleTemplateProps {
  title: string;
  description?: string;
  items: any[];
  isLoading: boolean;
  error?: any;
  searchItems: (query: string) => any[];
  createItem?: (data: any) => Promise<any>;
  updateItem?: (id: string, data: any) => Promise<any>;
  deleteItem?: (id: string) => Promise<any>;
  getStatistics?: () => { total: number; active: number; inactive: number };
  columns: {
    key: string;
    header: string;
    cell?: (value: any, row: any) => React.ReactNode;
  }[];
  enableCreate?: boolean;
  enableEdit?: boolean;
  enableDelete?: boolean;
  createForm?: React.ComponentType<{ onSuccess: () => void; onCancel: () => void }>;
  editForm?: React.ComponentType<{ item: any; onSuccess: () => void; onCancel: () => void }>;
  customActions?: React.ReactNode;
  onRefresh?: () => void;
}

export const ExtensibleModuleTemplate: React.FC<ModuleTemplateProps> = ({
  title,
  description,
  items,
  isLoading,
  error,
  searchItems,
  createItem,
  updateItem,
  deleteItem,
  getStatistics,
  columns,
  enableCreate = true,
  enableEdit = true,
  enableDelete = true,
  createForm: CreateForm,
  editForm: EditForm,
  customActions,
  onRefresh
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);

  const filteredItems = searchQuery ? searchItems(searchQuery) : items;
  const stats = getStatistics ? getStatistics() : { total: items.length, active: 0, inactive: 0 };

  const handleCreate = async (data: any) => {
    if (createItem) {
      await createItem(data);
    }
    setCreateDialogOpen(false);
  };

  const handleEdit = async (data: any) => {
    if (updateItem && selectedItem) {
      await updateItem(selectedItem.id, data);
    }
    setEditDialogOpen(false);
    setSelectedItem(null);
  };

  const handleDelete = async (id: string) => {
    if (deleteItem) {
      await deleteItem(id);
    }
  };

  const handleRefresh = () => {
    if (onRefresh) {
      onRefresh();
    }
  };

  // Generate table columns with actions
  const tableColumns = [
    ...columns.map(col => ({
      key: col.key,
      label: col.header,
      render: col.cell ? (value: any, row: any) => col.cell!(value, row) : undefined
    })),
    ...(enableEdit || enableDelete ? [{
      key: "actions",
      label: "Actions",
      render: (_: any, row: any) => (
        <div className="flex items-center gap-2">
          {enableEdit && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSelectedItem(row);
                setEditDialogOpen(true);
              }}
            >
              Edit
            </Button>
          )}
          {enableDelete && (
            <Button
              variant="destructive"
              size="sm"
              onClick={() => handleDelete(row.id)}
            >
              Delete
            </Button>
          )}
        </div>
      ),
    }] : [])
  ];

  if (error) {
    return (
      <Card className="border-destructive">
        <CardContent className="p-6">
          <div className="flex items-center gap-2 text-destructive">
            <FileText className="h-4 w-4" />
            <p>Error loading {title.toLowerCase()}: {error.message}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{stats.total}</div>
            <div className="text-sm text-muted-foreground">Total {title}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">{stats.active}</div>
            <div className="text-sm text-muted-foreground">Active</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-red-600">{stats.inactive}</div>
            <div className="text-sm text-muted-foreground">Inactive</div>
          </CardContent>
        </Card>
      </div>

      {/* Main Module Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                {title}
              </CardTitle>
              {description && (
                <p className="text-sm text-muted-foreground mt-1">{description}</p>
              )}
            </div>
            <div className="flex items-center gap-2">
              {customActions}
              <Button variant="outline" onClick={handleRefresh} disabled={isLoading}>
                <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              {enableCreate && CreateForm && (
                <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Create New
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Create New {title.slice(0, -1)}</DialogTitle>
                    </DialogHeader>
                    <CreateForm 
                      onSuccess={() => setCreateDialogOpen(false)} 
                      onCancel={() => setCreateDialogOpen(false)} 
                    />
                  </DialogContent>
                </Dialog>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Search Bar */}
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder={`Search ${title.toLowerCase()}...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Data Table */}
          <DataTable
            columns={tableColumns}
            data={filteredItems}
            loading={isLoading}
            pagination={true}
            pageSize={20}
          />
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      {enableEdit && EditForm && (
        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit {title.slice(0, -1)}</DialogTitle>
            </DialogHeader>
            <EditForm
              item={selectedItem}
              onSuccess={() => setEditDialogOpen(false)}
              onCancel={() => setEditDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};