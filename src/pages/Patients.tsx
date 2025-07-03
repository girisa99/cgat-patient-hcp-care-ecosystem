
import React, { useState } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { useRoleBasedNavigation } from '@/hooks/useRoleBasedNavigation';
import { useMasterUserManagement } from '@/hooks/useMasterUserManagement';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users, 
  UserPlus, 
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
  Calendar,
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

const Patients: React.FC = () => {
  const { hasAccess, currentRole } = useRoleBasedNavigation();
  const { users, isLoading, getPatients, searchUsers, createUser, isCreatingUser } = useMasterUserManagement();
  const { toast } = useToast();
  
  const [activeTab, setActiveTab] = useState('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPatient, setSelectedPatient] = useState<any>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [newPatient, setNewPatient] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    address: ''
  });

  const patients = getPatients();
  const filteredPatients = searchQuery 
    ? searchUsers(searchQuery).filter(user => 
        user.user_roles.some(userRole => userRole.roles.name === 'patientCaregiver')
      )
    : patients;

  const handleAddPatient = async () => {
    if (!newPatient.firstName || !newPatient.lastName || !newPatient.email) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    try {
      await createUser({
        email: newPatient.email,
        first_name: newPatient.firstName,
        last_name: newPatient.lastName,
        phone: newPatient.phone,
        role: 'patientCaregiver'
      });
      
      setNewPatient({ firstName: '', lastName: '', email: '', phone: '', dateOfBirth: '', address: '' });
      setShowAddDialog(false);
      
      toast({
        title: "Patient Added",
        description: "New patient has been successfully added to the system.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add patient. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleExportPatients = () => {
    const csvContent = "data:text/csv;charset=utf-8," 
      + "Name,Email,Phone,Status,Created\n"
      + filteredPatients.map(patient => 
          `"${patient.first_name} ${patient.last_name}","${patient.email}","${patient.phone || 'N/A'}","Active","${new Date(patient.created_at).toLocaleDateString()}"`
        ).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "patients_export.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getPatientStats = () => {
    return {
      total: patients.length,
      active: patients.filter(p => p.created_at).length,
      newThisMonth: patients.filter(p => {
        const createdDate = new Date(p.created_at);
        const monthAgo = new Date();
        monthAgo.setMonth(monthAgo.getMonth() - 1);
        return createdDate > monthAgo;
      }).length,
      verified: patients.filter(p => p.email_confirmed_at).length
    };
  };

  const stats = getPatientStats();

  if (!hasAccess('/patients')) {
    return (
      <AppLayout title="Access Denied">
        <Card>
          <CardContent className="p-8 text-center">
            <p>You don't have permission to access Patient Management.</p>
            <p className="text-sm text-muted-foreground mt-2">Current role: {currentRole}</p>
          </CardContent>
        </Card>
      </AppLayout>
    );
  }

  if (isLoading) {
    return (
      <AppLayout title="Patient Management">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout title="Patient Management">
      <div className="space-y-6">
        {/* Header with Actions */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Patient Management</h1>
            <p className="text-muted-foreground">Manage patient records and healthcare information</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={handleExportPatients}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
              <DialogTrigger asChild>
                <Button className="bg-primary hover:bg-primary/90">
                  <UserPlus className="h-4 w-4 mr-2" />
                  Add Patient
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>Add New Patient</DialogTitle>
                  <DialogDescription>
                    Register a new patient in the healthcare system.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">First Name *</label>
                      <Input 
                        placeholder="Enter first name"
                        value={newPatient.firstName}
                        onChange={(e) => setNewPatient({...newPatient, firstName: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Last Name *</label>
                      <Input 
                        placeholder="Enter last name"
                        value={newPatient.lastName}
                        onChange={(e) => setNewPatient({...newPatient, lastName: e.target.value})}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Email Address *</label>
                    <Input 
                      placeholder="Enter email address"
                      type="email"
                      value={newPatient.email}
                      onChange={(e) => setNewPatient({...newPatient, email: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Phone Number</label>
                    <Input 
                      placeholder="Enter phone number"
                      value={newPatient.phone}
                      onChange={(e) => setNewPatient({...newPatient, phone: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Date of Birth</label>
                    <Input 
                      type="date"
                      value={newPatient.dateOfBirth}
                      onChange={(e) => setNewPatient({...newPatient, dateOfBirth: e.target.value})}
                    />
                  </div>
                </div>
                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => setShowAddDialog(false)} className="flex-1">
                    Cancel
                  </Button>
                  <Button onClick={handleAddPatient} className="flex-1" disabled={isCreatingUser}>
                    {isCreatingUser ? 'Adding...' : 'Add Patient'}
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
                <Users className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">Total Patients</p>
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
                  <p className="text-sm font-medium text-muted-foreground">Active Patients</p>
                  <p className="text-2xl font-bold">{stats.active}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Calendar className="h-8 w-8 text-orange-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">New This Month</p>
                  <p className="text-2xl font-bold">{stats.newThisMonth}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Mail className="h-8 w-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">Verified</p>
                  <p className="text-2xl font-bold">{stats.verified}</p>
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
                  placeholder="Search patients by name, email, or phone..."
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
            <TabsTrigger value="overview">Patient Directory</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Patient Directory
                  <Badge variant="secondary">{filteredPatients.length} patients</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredPatients.map((patient) => (
                    <div key={patient.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                          <Users className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold">{patient.first_name} {patient.last_name}</h3>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Mail className="h-3 w-3" />
                              {patient.email}
                            </div>
                            {patient.phone && (
                              <div className="flex items-center gap-1">
                                <Phone className="h-3 w-3" />
                                {patient.phone}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={patient.email_confirmed_at ? "default" : "secondary"}>
                          {patient.email_confirmed_at ? "Verified" : "Pending"}
                        </Badge>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="sm" onClick={() => {
                            setSelectedPatient(patient);
                            setShowViewDialog(true);
                          }}>
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {filteredPatients.length === 0 && (
                    <div className="text-center py-12">
                      <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-muted-foreground">No patients found</h3>
                      <p className="text-sm text-muted-foreground mt-2">
                        {searchQuery ? 'Try adjusting your search criteria' : 'Get started by adding your first patient'}
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
                  <CardTitle>Patient Growth</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">+{stats.newThisMonth}</div>
                  <p className="text-sm text-muted-foreground">New patients this month</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Verification Rate</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600">
                    {stats.total > 0 ? Math.round((stats.verified / stats.total) * 100) : 0}%
                  </div>
                  <p className="text-sm text-muted-foreground">Patients verified</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="reports">
            <Card>
              <CardHeader>
                <CardTitle>Patient Reports</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Button variant="outline" className="w-full justify-start">
                    <Download className="h-4 w-4 mr-2" />
                    Download Patient Summary Report
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Download className="h-4 w-4 mr-2" />
                    Download Verification Status Report
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Download className="h-4 w-4 mr-2" />
                    Download Monthly Activity Report
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle>Patient Management Settings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Auto-verification</h4>
                      <p className="text-sm text-muted-foreground">Automatically verify patients with valid email domains</p>
                    </div>
                    <Button variant="outline" size="sm">Configure</Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Notification Settings</h4>
                      <p className="text-sm text-muted-foreground">Manage patient communication preferences</p>
                    </div>
                    <Button variant="outline" size="sm">Settings</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Patient View Dialog */}
        <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Patient Details</DialogTitle>
              <DialogDescription>
                Complete patient information and status
              </DialogDescription>
            </DialogHeader>
            {selectedPatient && (
              <div className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Name</label>
                    <p className="font-medium">{selectedPatient.first_name} {selectedPatient.last_name}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Status</label>
                    <Badge variant={selectedPatient.email_confirmed_at ? "default" : "secondary"}>
                      {selectedPatient.email_confirmed_at ? "Verified" : "Not Verified"}
                    </Badge>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Email</label>
                    <p>{selectedPatient.email}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Phone</label>
                    <p>{selectedPatient.phone || 'Not provided'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Created</label>
                    <p>{new Date(selectedPatient.created_at).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Last Updated</label>
                    <p>{selectedPatient.updated_at ? new Date(selectedPatient.updated_at).toLocaleDateString() : 'N/A'}</p>
                  </div>
                </div>
              </div>
            )}
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setShowViewDialog(false)} className="flex-1">
                Close
              </Button>
              <Button className="flex-1">
                Edit Patient
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
};

export default Patients;
