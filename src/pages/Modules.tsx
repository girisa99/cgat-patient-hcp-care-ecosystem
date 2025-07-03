
import React, { useState } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { useRoleBasedNavigation } from '@/hooks/useRoleBasedNavigation';
import { useMasterModules } from '@/hooks/useMasterModules';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Package, 
  Plus, 
  Search, 
  Filter, 
  Download, 
  Upload,
  Eye,
  Edit,
  Trash2,
  Settings,
  Activity,
  Users,
  Zap,
  Shield,
  Play,
  Pause,
  RotateCcw
} from 'lucide-react';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Textarea } from '@/components/ui/textarea';

const Modules: React.FC = () => {
  const { hasAccess, currentRole } = useRoleBasedNavigation();
  const { 
    modules, 
    isLoading, 
    error,
    createModule, 
    isCreatingModule,
    updateModule,
    isUpdatingModule,
    deactivateModule,
    isDeactivatingModule,
    searchModules,
    getModuleStats
  } = useMasterModules();
  const { toast } = useToast();
  
  const [activeTab, setActiveTab] = useState('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedModule, setSelectedModule] = useState<any>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [newModule, setNewModule] = useState({
    name: '',
    description: ''
  });

  const filteredModules = searchQuery ? searchModules(searchQuery) : modules;
  const stats = getModuleStats();

  const handleAddModule = async () => {
    if (!newModule.name) {
      toast({
        title: "Validation Error",
        description: "Please provide a module name",
        variant: "destructive",
      });
      return;
    }

    try {
      await createModule(newModule);
      
      setNewModule({ name: '', description: '' });
      setShowAddDialog(false);
      
      toast({
        title: "Module Created",
        description: "New module has been successfully created.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create module. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDeactivateModule = async (moduleId: string) => {
    try {
      await deactivateModule(moduleId);
      toast({
        title: "Module Deactivated",
        description: "Module has been successfully deactivated.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to deactivate module. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleExportModules = () => {
    const csvContent = "data:text/csv;charset=utf-8," 
      + "Name,Description,Status,Created Date\n"
      + filteredModules.map(module => 
          `"${module.name}","${module.description || 'N/A'}","${module.is_active ? 'Active' : 'Inactive'}","${new Date(module.created_at).toLocaleDateString()}"`
        ).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "modules_export.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!hasAccess('/modules')) {
    return (
      <AppLayout title="Access Denied">
        <Card>
          <CardContent className="p-8 text-center">
            <p>You don't have permission to access Module Management.</p>
            <p className="text-sm text-muted-foreground mt-2">Current role: {currentRole}</p>
          </CardContent>
        </Card>
      </AppLayout>
    );
  }

  if (isLoading) {
    return (
      <AppLayout title="Module Management">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </AppLayout>
    );
  }

  if (error) {
    return (
      <AppLayout title="Module Management">
        <Card>
          <CardContent className="p-8 text-center">
            <div className="text-red-600 mb-2">⚠️ Error loading modules</div>
            <p className="text-muted-foreground">{String(error)}</p>
          </CardContent>
        </Card>
      </AppLayout>
    );
  }

  return (
    <AppLayout title="Module Management">
      <div className="space-y-6">
        {/* Header with Actions */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Module Management</h1>
            <p className="text-muted-foreground">Manage system modules and their configurations</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={handleExportModules}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button variant="outline">
              <Upload className="h-4 w-4 mr-2" />
              Import
            </Button>
            <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
              <DialogTrigger asChild>
                <Button className="bg-primary hover:bg-primary/90">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Module
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>Create New Module</DialogTitle>
                  <DialogDescription>
                    Add a new system module to extend functionality.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div>
                    <label className="text-sm font-medium">Module Name *</label>
                    <Input 
                      placeholder="Enter module name"
                      value={newModule.name}
                      onChange={(e) => setNewModule({...newModule, name: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Description</label>
                    <Textarea 
                      placeholder="Enter module description"
                      value={newModule.description}
                      onChange={(e) => setNewModule({...newModule, description: e.target.value})}
                      rows={3}
                    />
                  </div>
                </div>
                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => setShowAddDialog(false)} className="flex-1">
                    Cancel
                  </Button>
                  <Button onClick={handleAddModule} className="flex-1" disabled={isCreatingModule}>
                    {isCreatingModule ? 'Creating...' : 'Create Module'}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Package className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">Total Modules</p>
                  <p className="text-2xl font-bold">{stats.total}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Activity className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">Active Modules</p>
                  <p className="text-2xl font-bold">{stats.active}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Pause className="h-8 w-8 text-orange-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">Inactive Modules</p>
                  <p className="text-2xl font-bold">{stats.inactive}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Zap className="h-8 w-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">System Load</p>
                  <p className="text-2xl font-bold">{Math.round((stats.active / Math.max(stats.total, 1)) * 100)}%</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filter */}
        <Card>
          <CardContent className="p-4">
            <div className="flex gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search modules by name or description..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button variant="outline">
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Module Directory</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="permissions">Permissions</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Module Directory
                  <Badge variant="secondary">{filteredModules.length} modules</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredModules.map((module) => (
                    <div key={module.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                          <Package className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold">{module.name}</h3>
                          <p className="text-sm text-muted-foreground">{module.description || 'No description available'}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant={module.is_active ? "default" : "secondary"}>
                              {module.is_active ? "Active" : "Inactive"}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              Created {new Date(module.created_at).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex gap-1">
                          <Button variant="ghost" size="sm" onClick={() => {
                            setSelectedModule(module);
                            setShowViewDialog(true);
                          }}>
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => {
                            setSelectedModule(module);
                            setShowEditDialog(true);
                          }}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          {module.is_active ? (
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleDeactivateModule(module.id)}
                              disabled={isDeactivatingModule}
                            >
                              <Pause className="h-4 w-4" />
                            </Button>
                          ) : (
                            <Button variant="ghost" size="sm">
                              <Play className="h-4 w-4" />
                            </Button>
                          )}
                          <Button variant="ghost" size="sm">
                            <Settings className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {filteredModules.length === 0 && (
                    <div className="text-center py-12">
                      <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-muted-foreground">No modules found</h3>
                      <p className="text-sm text-muted-foreground mt-2">
                        {searchQuery ? 'Try adjusting your search criteria' : 'Get started by adding your first module'}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Module Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span>Active Modules</span>
                      <span className="font-bold text-green-600">{stats.active}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Inactive Modules</span>
                      <span className="font-bold text-orange-600">{stats.inactive}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Total Modules</span>
                      <span className="font-bold">{stats.total}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>System Performance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600">
                    {Math.round((stats.active / Math.max(stats.total, 1)) * 100)}%
                  </div>
                  <p className="text-sm text-muted-foreground">Module activation rate</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="permissions">
            <Card>
              <CardHeader>
                <CardTitle>Module Permissions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded">
                    <div>
                      <h4 className="font-medium">Role-based Access</h4>
                      <p className="text-sm text-muted-foreground">Configure which roles can access specific modules</p>
                    </div>
                    <Button variant="outline">Configure</Button>
                  </div>
                  <div className="flex items-center justify-between p-4 border rounded">
                    <div>
                      <h4 className="font-medium">User Permissions</h4>
                      <p className="text-sm text-muted-foreground">Set individual user permissions for modules</p>
                    </div>
                    <Button variant="outline">Manage</Button>
                  </div>
                  <div className="flex items-center justify-between p-4 border rounded">
                    <div>
                      <h4 className="font-medium">API Access</h4>
                      <p className="text-sm text-muted-foreground">Control API access to module functionality</p>
                    </div>
                    <Button variant="outline">Settings</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle>Module Management Settings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Auto-activation</h4>
                      <p className="text-sm text-muted-foreground">Automatically activate new modules after creation</p>
                    </div>
                    <Button variant="outline" size="sm">Configure</Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Module Updates</h4>
                      <p className="text-sm text-muted-foreground">Manage automatic module updates and patches</p>
                    </div>
                    <Button variant="outline" size="sm">Settings</Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Backup & Recovery</h4>
                      <p className="text-sm text-muted-foreground">Configure module backup and recovery options</p>
                    </div>
                    <Button variant="outline" size="sm">Configure</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* View Module Dialog */}
        <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Module Details</DialogTitle>
              <DialogDescription>
                Complete module information and configuration
              </DialogDescription>
            </DialogHeader>
            {selectedModule && (
              <div className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Module Name</label>
                    <p className="font-medium">{selectedModule.name}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Status</label>
                    <Badge variant={selectedModule.is_active ? "default" : "secondary"}>
                      {selectedModule.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                  <div className="col-span-2">
                    <label className="text-sm font-medium text-muted-foreground">Description</label>
                    <p>{selectedModule.description || 'No description available'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Created</label>
                    <p>{new Date(selectedModule.created_at).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Last Updated</label>
                    <p>{selectedModule.updated_at ? new Date(selectedModule.updated_at).toLocaleDateString() : 'N/A'}</p>
                  </div>
                </div>
              </div>
            )}
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setShowViewDialog(false)} className="flex-1">
                Close
              </Button>
              <Button className="flex-1" onClick={() => {
                setShowViewDialog(false);
                setShowEditDialog(true);
              }}>
                Edit Module
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
};

export default Modules;
