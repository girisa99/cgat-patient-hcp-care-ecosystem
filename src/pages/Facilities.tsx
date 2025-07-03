
import React, { useState } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { useRoleBasedNavigation } from '@/hooks/useRoleBasedNavigation';
import { useMasterFacilities } from '@/hooks/useMasterFacilities';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Building, 
  Plus, 
  Search, 
  Filter, 
  Download, 
  Upload,
  Eye,
  Edit,
  Trash2,
  Phone,
  Mail,
  MapPin,
  FileText,
  Settings,
  Users,
  Activity
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

const Facilities: React.FC = () => {
  const { hasAccess, currentRole } = useRoleBasedNavigation();
  const { 
    facilities, 
    isLoading, 
    error,
    createFacility, 
    isCreatingFacility,
    updateFacility,
    isUpdatingFacility,
    searchFacilities,
    getFacilityStats
  } = useMasterFacilities();
  const { toast } = useToast();
  
  const [activeTab, setActiveTab] = useState('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFacility, setSelectedFacility] = useState<any>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [newFacility, setNewFacility] = useState({
    name: '',
    facility_type: 'treatmentFacility' as const,
    address: '',
    phone: '',
    email: '',
    license_number: '',
    npi_number: ''
  });

  const filteredFacilities = searchQuery ? searchFacilities(searchQuery) : facilities;
  const stats = getFacilityStats();

  const handleAddFacility = async () => {
    if (!newFacility.name || !newFacility.facility_type) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    try {
      await createFacility(newFacility);
      
      setNewFacility({
        name: '',
        facility_type: 'treatmentFacility',
        address: '',
        phone: '',
        email: '',
        license_number: '',
        npi_number: ''
      });
      setShowAddDialog(false);
      
      toast({
        title: "Facility Added",
        description: "New facility has been successfully added to the system.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add facility. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleExportFacilities = () => {
    const csvContent = "data:text/csv;charset=utf-8," 
      + "Name,Type,Address,Phone,Email,License Number,NPI Number,Status\n"
      + filteredFacilities.map(facility => 
          `"${facility.name}","${facility.facility_type}","${facility.address || 'N/A'}","${facility.phone || 'N/A'}","${facility.email || 'N/A'}","${facility.license_number || 'N/A'}","${facility.npi_number || 'N/A'}","${facility.is_active ? 'Active' : 'Inactive'}"`
        ).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "facilities_export.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getFacilityTypeLabel = (type: string) => {
    switch (type) {
      case 'treatmentFacility': return 'Treatment Facility';
      case 'referralFacility': return 'Referral Facility';
      case 'prescriberFacility': return 'Prescriber Facility';
      default: return type;
    }
  };

  const getFacilityTypeColor = (type: string) => {
    switch (type) {
      case 'treatmentFacility': return 'bg-blue-100 text-blue-800';
      case 'referralFacility': return 'bg-green-100 text-green-800';
      case 'prescriberFacility': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (!hasAccess('/facilities')) {
    return (
      <AppLayout title="Access Denied">
        <Card>
          <CardContent className="p-8 text-center">
            <p>You don't have permission to access Facility Management.</p>
            <p className="text-sm text-muted-foreground mt-2">Current role: {currentRole}</p>
          </CardContent>
        </Card>
      </AppLayout>
    );
  }

  if (isLoading) {
    return (
      <AppLayout title="Facility Management">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </AppLayout>
    );
  }

  if (error) {
    return (
      <AppLayout title="Facility Management">
        <Card>
          <CardContent className="p-8 text-center">
            <div className="text-red-600 mb-2">⚠️ Error loading facilities</div>
            <p className="text-muted-foreground">{String(error)}</p>
          </CardContent>
        </Card>
      </AppLayout>
    );
  }

  return (
    <AppLayout title="Facility Management">
      <div className="space-y-6">
        {/* Header with Actions */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Facility Management</h1>
            <p className="text-muted-foreground">Manage healthcare facilities and treatment centers</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={handleExportFacilities}>
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
                  Add Facility
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                  <DialogTitle>Add New Facility</DialogTitle>
                  <DialogDescription>
                    Register a new healthcare facility in the system.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div>
                    <label className="text-sm font-medium">Facility Name *</label>
                    <Input 
                      placeholder="Enter facility name"
                      value={newFacility.name}
                      onChange={(e) => setNewFacility({...newFacility, name: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Facility Type *</label>
                    <Select value={newFacility.facility_type} onValueChange={(value: any) => setNewFacility({...newFacility, facility_type: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select facility type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="treatmentFacility">Treatment Facility</SelectItem>
                        <SelectItem value="referralFacility">Referral Facility</SelectItem>
                        <SelectItem value="prescriberFacility">Prescriber Facility</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Address</label>
                    <Input 
                      placeholder="Enter facility address"
                      value={newFacility.address}
                      onChange={(e) => setNewFacility({...newFacility, address: e.target.value})}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">Phone Number</label>
                      <Input 
                        placeholder="Enter phone number"
                        value={newFacility.phone}
                        onChange={(e) => setNewFacility({...newFacility, phone: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Email Address</label>
                      <Input 
                        placeholder="Enter email address"
                        type="email"
                        value={newFacility.email}
                        onChange={(e) => setNewFacility({...newFacility, email: e.target.value})}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">License Number</label>
                      <Input 
                        placeholder="Enter license number"
                        value={newFacility.license_number}
                        onChange={(e) => setNewFacility({...newFacility, license_number: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">NPI Number</label>
                      <Input 
                        placeholder="Enter NPI number"
                        value={newFacility.npi_number}
                        onChange={(e) => setNewFacility({...newFacility, npi_number: e.target.value})}
                      />
                    </div>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => setShowAddDialog(false)} className="flex-1">
                    Cancel
                  </Button>
                  <Button onClick={handleAddFacility} className="flex-1" disabled={isCreatingFacility}>
                    {isCreatingFacility ? 'Adding...' : 'Add Facility'}
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
                <Building className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">Total Facilities</p>
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
                  <p className="text-sm font-medium text-muted-foreground">Active Facilities</p>
                  <p className="text-2xl font-bold">{stats.active}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-orange-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">Treatment Centers</p>
                  <p className="text-2xl font-bold">{stats.typeDistribution?.treatmentFacility || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <FileText className="h-8 w-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">Referral Centers</p>
                  <p className="text-2xl font-bold">{stats.typeDistribution?.referralFacility || 0}</p>
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
                  placeholder="Search facilities by name, type, or location..."
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
            <TabsTrigger value="overview">Facility Directory</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="compliance">Compliance</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building className="h-5 w-5" />
                  Facility Directory
                  <Badge variant="secondary">{filteredFacilities.length} facilities</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredFacilities.map((facility) => (
                    <div key={facility.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                          <Building className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold">{facility.name}</h3>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <Badge 
                              variant="secondary" 
                              className={getFacilityTypeColor(facility.facility_type)}
                            >
                              {getFacilityTypeLabel(facility.facility_type)}
                            </Badge>
                            {facility.address && (
                              <div className="flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                {facility.address}
                              </div>
                            )}
                            {facility.phone && (
                              <div className="flex items-center gap-1">
                                <Phone className="h-3 w-3" />
                                {facility.phone}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={facility.is_active ? "default" : "secondary"}>
                          {facility.is_active ? "Active" : "Inactive"}
                        </Badge>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="sm" onClick={() => {
                            setSelectedFacility(facility);
                            setShowViewDialog(true);
                          }}>
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => {
                            setSelectedFacility(facility);
                            setShowEditDialog(true);
                          }}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {filteredFacilities.length === 0 && (
                    <div className="text-center py-12">
                      <Building className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-muted-foreground">No facilities found</h3>
                      <p className="text-sm text-muted-foreground mt-2">
                        {searchQuery ? 'Try adjusting your search criteria' : 'Get started by adding your first facility'}
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
                  <CardTitle>Facility Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span>Treatment Facilities</span>
                      <span className="font-bold">{stats.typeDistribution?.treatmentFacility || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Referral Facilities</span>
                      <span className="font-bold">{stats.typeDistribution?.referralFacility || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Prescriber Facilities</span>
                      <span className="font-bold">{stats.typeDistribution?.prescriberFacility || 0}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Active vs Inactive</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">{stats.active}/{stats.total}</div>
                  <p className="text-sm text-muted-foreground">Active facilities</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="compliance">
            <Card>
              <CardHeader>
                <CardTitle>Facility Compliance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded">
                    <div>
                      <h4 className="font-medium">License Verification</h4>
                      <p className="text-sm text-muted-foreground">Check facility licensing status</p>
                    </div>
                    <Button variant="outline">Run Check</Button>
                  </div>
                  <div className="flex items-center justify-between p-4 border rounded">
                    <div>
                      <h4 className="font-medium">NPI Validation</h4>
                      <p className="text-sm text-muted-foreground">Validate National Provider Identifier numbers</p>
                    </div>
                    <Button variant="outline">Validate</Button>
                  </div>
                  <div className="flex items-center justify-between p-4 border rounded">
                    <div>
                      <h4 className="font-medium">Compliance Report</h4>
                      <p className="text-sm text-muted-foreground">Generate comprehensive compliance report</p>
                    </div>
                    <Button variant="outline">Generate</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle>Facility Management Settings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Auto-approval</h4>
                      <p className="text-sm text-muted-foreground">Automatically approve facilities with valid credentials</p>
                    </div>
                    <Button variant="outline" size="sm">Configure</Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Integration Settings</h4>
                      <p className="text-sm text-muted-foreground">Manage external system integrations</p>
                    </div>
                    <Button variant="outline" size="sm">Settings</Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Data Sync</h4>
                      <p className="text-sm text-muted-foreground">Configure data synchronization schedules</p>
                    </div>
                    <Button variant="outline" size="sm">Schedule</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* View Facility Dialog */}
        <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
          <DialogContent className="sm:max-w-[700px]">
            <DialogHeader>
              <DialogTitle>Facility Details</DialogTitle>
              <DialogDescription>
                Complete facility information and status
              </DialogDescription>
            </DialogHeader>
            {selectedFacility && (
              <div className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Facility Name</label>
                    <p className="font-medium">{selectedFacility.name}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Type</label>
                    <Badge className={getFacilityTypeColor(selectedFacility.facility_type)}>
                      {getFacilityTypeLabel(selectedFacility.facility_type)}
                    </Badge>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Status</label>
                    <Badge variant={selectedFacility.is_active ? "default" : "secondary"}>
                      {selectedFacility.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Address</label>
                    <p>{selectedFacility.address || 'Not provided'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Phone</label>
                    <p>{selectedFacility.phone || 'Not provided'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Email</label>
                    <p>{selectedFacility.email || 'Not provided'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">License Number</label>
                    <p>{selectedFacility.license_number || 'Not provided'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">NPI Number</label>
                    <p>{selectedFacility.npi_number || 'Not provided'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Created</label>
                    <p>{new Date(selectedFacility.created_at).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Last Updated</label>
                    <p>{selectedFacility.updated_at ? new Date(selectedFacility.updated_at).toLocaleDateString() : 'N/A'}</p>
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
                Edit Facility
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
};

export default Facilities;
