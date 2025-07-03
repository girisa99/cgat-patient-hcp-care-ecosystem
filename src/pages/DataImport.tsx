
import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/components/layout/AppLayout';
import { useRoleBasedNavigation } from '@/hooks/useRoleBasedNavigation';
import { useMasterDataImport } from '@/hooks/useMasterDataImport';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  Upload, 
  Download, 
  Database, 
  FileText, 
  Users, 
  Building, 
  Package, 
  Activity,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  RefreshCw,
  Trash2,
  Eye,
  Settings
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

const DataImport: React.FC = () => {
  console.log('📥 Data Import page rendering');
  const { currentRole, hasAccess } = useRoleBasedNavigation();
  const { 
    isLoading, 
    importCSVData, 
    importJSONData,
    importHistory, 
    getImportStats,
    meta 
  } = useMasterDataImport();
  const { toast } = useToast();
  
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [importType, setImportType] = useState('users');
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [showHistoryDialog, setShowHistoryDialog] = useState(false);
  const [selectedImport, setSelectedImport] = useState<any>(null);
  const [importNotes, setImportNotes] = useState('');

  const stats = getImportStats();

  const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  }, []);

  const handleImport = useCallback(async () => {
    if (!selectedFile) {
      toast({
        title: "No File Selected",
        description: "Please select a file to import",
        variant: "destructive",
      });
      return;
    }

    try {
      let result;
      const fileExtension = selectedFile.name.split('.').pop()?.toLowerCase();
      
      if (fileExtension === 'csv') {
        result = await importCSVData(selectedFile, importType);
      } else if (fileExtension === 'json') {
        const text = await selectedFile.text();
        const data = JSON.parse(text);
        result = await importJSONData(data, importType);
      } else {
        throw new Error('Unsupported file format. Please use CSV or JSON files.');
      }

      if (result.success) {
        setSelectedFile(null);
        setShowImportDialog(false);
        setImportNotes('');
      }
    } catch (error: any) {
      toast({
        title: "Import Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  }, [selectedFile, importType, importCSVData, importJSONData, toast]);

  const handleExportTemplate = useCallback((type: string) => {
    let csvContent = '';
    let filename = '';

    switch (type) {
      case 'users':
        csvContent = "data:text/csv;charset=utf-8,first_name,last_name,email,phone,role\nJohn,Doe,john.doe@example.com,+1234567890,patientCaregiver\n";
        filename = 'users_template.csv';
        break;
      case 'facilities':
        csvContent = "data:text/csv;charset=utf-8,name,facility_type,address,phone,email,license_number,npi_number\nSample Treatment Center,treatmentFacility,123 Main St,+1234567890,info@center.com,LIC123,1234567890\n";
        filename = 'facilities_template.csv';
        break;
      case 'modules':
        csvContent = "data:text/csv;charset=utf-8,name,description,is_active\nPatient Management,Manage patient records,true\n";
        filename = 'modules_template.csv';
        break;
      default:
        return;
    }

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'failed': return <XCircle className="h-4 w-4 text-red-600" />;
      case 'processing': return <RefreshCw className="h-4 w-4 text-blue-600 animate-spin" />;
      default: return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'default';
      case 'failed': return 'destructive';
      case 'processing': return 'secondary';
      default: return 'outline';
    }
  };

  if (!hasAccess('/data-import')) {
    return (
      <AppLayout title="Access Denied">
        <Card>
          <CardContent className="p-8 text-center">
            <p>You don't have permission to access Data Import.</p>
            <p className="text-sm text-muted-foreground mt-2">Current role: {currentRole}</p>
          </CardContent>
        </Card>
      </AppLayout>
    );
  }

  return (
    <AppLayout title="Data Import">
      <div className="space-y-6">
        {/* Header with Actions */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Data Import & Migration</h1>
            <p className="text-muted-foreground">Import and manage data from external sources</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setShowHistoryDialog(true)}>
              <Activity className="h-4 w-4 mr-2" />
              Import History
            </Button>
            <Dialog open={showImportDialog} onOpenChange={setShowImportDialog}>
              <DialogTrigger asChild>
                <Button className="bg-primary hover:bg-primary/90">
                  <Upload className="h-4 w-4 mr-2" />
                  Import Data
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>Import Data</DialogTitle>
                  <DialogDescription>
                    Upload CSV or JSON files to import data into the system.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div>
                    <label className="text-sm font-medium">Data Type *</label>
                    <Select value={importType} onValueChange={setImportType}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select data type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="users">Users</SelectItem>
                        <SelectItem value="patients">Patients</SelectItem>
                        <SelectItem value="facilities">Facilities</SelectItem>
                        <SelectItem value="modules">Modules</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium">File *</label>
                    <Input 
                      type="file"
                      accept=".csv,.json"
                      onChange={handleFileSelect}
                      className="cursor-pointer"
                    />
                    {selectedFile && (
                      <p className="text-sm text-muted-foreground mt-1">
                        Selected: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="text-sm font-medium">Import Notes</label>
                    <Textarea 
                      placeholder="Add any notes about this import..."
                      value={importNotes}
                      onChange={(e) => setImportNotes(e.target.value)}
                      rows={3}
                    />
                  </div>
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="text-sm font-medium">Import Guidelines:</p>
                    <ul className="text-xs text-muted-foreground mt-1 space-y-1">
                      <li>• Ensure data format matches the selected type</li>
                      <li>• Maximum file size: 10MB</li>
                      <li>• Supported formats: CSV, JSON</li>
                      <li>• Duplicate entries will be handled automatically</li>
                    </ul>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => setShowImportDialog(false)} className="flex-1">
                    Cancel
                  </Button>
                  <Button onClick={handleImport} className="flex-1" disabled={isLoading || !selectedFile}>
                    {isLoading ? 'Importing...' : 'Import Data'}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Import Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <Database className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <div className="text-2xl font-bold">{stats.total}</div>
                  <div className="text-sm text-muted-foreground">Total Imports</div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <CheckCircle className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
                  <div className="text-sm text-muted-foreground">Successful</div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <RefreshCw className="h-8 w-8 text-yellow-600" />
                <div className="ml-4">
                  <div className="text-2xl font-bold text-yellow-600">{stats.processing}</div>
                  <div className="text-sm text-muted-foreground">Processing</div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <XCircle className="h-8 w-8 text-red-600" />
                <div className="ml-4">
                  <div className="text-2xl font-bold text-red-600">{stats.failed}</div>
                  <div className="text-sm text-muted-foreground">Failed</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Import Center</TabsTrigger>
            <TabsTrigger value="templates">Templates</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Import Types */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Upload className="h-5 w-5" />
                    Quick Import
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <Button variant="outline" className="h-20 flex-col gap-2" onClick={() => {
                      setImportType('users');
                      setShowImportDialog(true);
                    }}>
                      <Users className="h-6 w-6" />
                      <span className="text-sm">Import Users</span>
                    </Button>
                    <Button variant="outline" className="h-20 flex-col gap-2" onClick={() => {
                      setImportType('facilities');
                      setShowImportDialog(true);
                    }}>
                      <Building className="h-6 w-6" />
                      <span className="text-sm">Import Facilities</span>
                    </Button>
                    <Button variant="outline" className="h-20 flex-col gap-2" onClick={() => {
                      setImportType('patients');
                      setShowImportDialog(true);
                    }}>
                      <FileText className="h-6 w-6" />
                      <span className="text-sm">Import Patients</span>
                    </Button>
                    <Button variant="outline" className="h-20 flex-col gap-2" onClick={() => {
                      setImportType('modules');
                      setShowImportDialog(true);
                    }}>
                      <Package className="h-6 w-6" />
                      <span className="text-sm">Import Modules</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Recent Activity */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    Recent Activity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {importHistory.slice(0, 5).map((record) => (
                      <div key={record.id} className="flex items-center justify-between p-3 border rounded">
                        <div className="flex items-center gap-3">
                          {getStatusIcon(record.status)}
                          <div>
                            <p className="font-medium text-sm">{record.filename}</p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(record.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <Badge variant={getStatusColor(record.status) as any}>
                          {record.status}
                        </Badge>
                      </div>
                    ))}
                    
                    {importHistory.length === 0 && (
                      <div className="text-center py-8">
                        <Database className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                        <p className="text-sm text-muted-foreground">No recent imports</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="templates">
            <Card>
              <CardHeader>
                <CardTitle>Import Templates</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Download template files to ensure proper data formatting
                </p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center gap-3 mb-3">
                      <Users className="h-8 w-8 text-blue-600" />
                      <div>
                        <h3 className="font-semibold">User Import Template</h3>
                        <p className="text-sm text-muted-foreground">Template for importing user data</p>
                      </div>
                    </div>
                    <Button variant="outline" onClick={() => handleExportTemplate('users')} className="w-full">
                      <Download className="h-4 w-4 mr-2" />
                      Download Template
                    </Button>
                  </div>
                  
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center gap-3 mb-3">
                      <Building className="h-8 w-8 text-green-600" />
                      <div>
                        <h3 className="font-semibold">Facility Import Template</h3>
                        <p className="text-sm text-muted-foreground">Template for importing facility data</p>
                      </div>
                    </div>
                    <Button variant="outline" onClick={() => handleExportTemplate('facilities')} className="w-full">
                      <Download className="h-4 w-4 mr-2" />
                      Download Template
                    </Button>
                  </div>
                  
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center gap-3 mb-3">
                      <FileText className="h-8 w-8 text-purple-600" />
                      <div>
                        <h3 className="font-semibold">Patient Import Template</h3>
                        <p className="text-sm text-muted-foreground">Template for importing patient data</p>
                      </div>
                    </div>
                    <Button variant="outline" onClick={() => handleExportTemplate('users')} className="w-full">
                      <Download className="h-4 w-4 mr-2" />
                      Download Template
                    </Button>
                  </div>
                  
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center gap-3 mb-3">
                      <Package className="h-8 w-8 text-orange-600" />
                      <div>
                        <h3 className="font-semibold">Module Import Template</h3>
                        <p className="text-sm text-muted-foreground">Template for importing module data</p>
                      </div>
                    </div>
                    <Button variant="outline" onClick={() => handleExportTemplate('modules')} className="w-full">
                      <Download className="h-4 w-4 mr-2" />
                      Download Template
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Import History
                  <Badge variant="secondary">{importHistory.length} records</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {importHistory.map((record) => (
                    <div key={record.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50">
                      <div className="flex items-center gap-4">
                        {getStatusIcon(record.status)}
                        <div>
                          <h3 className="font-semibold">{record.filename}</h3>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span>Records: {record.records_processed}/{record.records_total}</span>
                            <span>Date: {new Date(record.created_at).toLocaleDateString()}</span>
                            {record.completed_at && (
                              <span>Completed: {new Date(record.completed_at).toLocaleDateString()}</span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={getStatusColor(record.status) as any}>
                          {record.status}
                        </Badge>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="sm" onClick={() => {
                            setSelectedImport(record);
                          }}>
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <RefreshCw className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {importHistory.length === 0 && (
                    <div className="text-center py-12">
                      <Database className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-muted-foreground">No import history</h3>
                      <p className="text-sm text-muted-foreground mt-2">
                        Start importing data to see your history here
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle>Import Settings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Auto-validation</h4>
                      <p className="text-sm text-muted-foreground">Automatically validate data before import</p>
                    </div>
                    <Button variant="outline" size="sm">Configure</Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Duplicate Handling</h4>
                      <p className="text-sm text-muted-foreground">Configure how to handle duplicate records</p>
                    </div>
                    <Button variant="outline" size="sm">Settings</Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Import Notifications</h4>
                      <p className="text-sm text-muted-foreground">Email notifications for import status</p>
                    </div>
                    <Button variant="outline" size="sm">Configure</Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Backup Settings</h4>
                      <p className="text-sm text-muted-foreground">Automatic backup before large imports</p>
                    </div>
                    <Button variant="outline" size="sm">Settings</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Current Status */}
        {isLoading && (
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <RefreshCw className="h-6 w-6 animate-spin text-blue-600" />
                <div className="flex-1">
                  <h4 className="font-medium">Import in Progress</h4>
                  <p className="text-sm text-muted-foreground">Processing your data import...</p>
                  <Progress value={65} className="mt-2" />
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  );
};

export default DataImport;
