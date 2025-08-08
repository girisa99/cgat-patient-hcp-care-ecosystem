import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from '@/hooks/use-toast';
import { 
  Users, UserPlus, Mail, Phone, Shield, 
  Calendar, MoreHorizontal, Edit, Trash2, 
  Search, Filter, Plus 
} from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

interface TreatmentCenterStaffProps {
  center: any;
  isOpen: boolean;
  onClose: () => void;
}

const mockStaffData = [
  {
    id: '1',
    name: 'Dr. Sarah Johnson',
    email: 'sarah.johnson@example.com',
    phone: '(555) 123-4567',
    role: 'Medical Director',
    department: 'Administration',
    status: 'Active',
    joinDate: '2023-01-15',
    permissions: ['Admin', 'Patient Records', 'Staff Management'],
    avatar: null
  },
  {
    id: '2',
    name: 'Mike Rodriguez',
    email: 'mike.rodriguez@example.com',
    phone: '(555) 234-5678',
    role: 'Lead Counselor',
    department: 'Clinical',
    status: 'Active',
    joinDate: '2023-03-20',
    permissions: ['Patient Records', 'Treatment Plans'],
    avatar: null
  },
  {
    id: '3',
    name: 'Lisa Chen',
    email: 'lisa.chen@example.com',
    phone: '(555) 345-6789',
    role: 'Intake Coordinator',
    department: 'Admissions',
    status: 'Active',
    joinDate: '2023-06-10',
    permissions: ['Patient Intake', 'Scheduling'],
    avatar: null
  },
  {
    id: '4',
    name: 'James Wilson',
    email: 'james.wilson@example.com',
    phone: '(555) 456-7890',
    role: 'Clinical Supervisor',
    department: 'Clinical',
    status: 'On Leave',
    joinDate: '2022-11-05',
    permissions: ['Patient Records', 'Staff Supervision'],
    avatar: null
  }
];

export const TreatmentCenterStaff: React.FC<TreatmentCenterStaffProps> = ({
  center,
  isOpen,
  onClose
}) => {
  const [staffList, setStaffList] = useState(mockStaffData);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState('all');
  const [showAddStaff, setShowAddStaff] = useState(false);
  const [editingStaff, setEditingStaff] = useState<any>(null);
  
  const [newStaff, setNewStaff] = useState({
    name: '',
    email: '',
    phone: '',
    role: '',
    department: '',
    permissions: []
  });

  const { toast } = useToast();

  // Filter staff based on search and role
  const filteredStaff = staffList.filter(staff => {
    const matchesSearch = staff.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         staff.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         staff.role.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = selectedRole === 'all' || staff.role === selectedRole;
    return matchesSearch && matchesRole;
  });

  const handleAddStaff = () => {
    if (!newStaff.name || !newStaff.email || !newStaff.role) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    const staffMember = {
      id: Date.now().toString(),
      ...newStaff,
      status: 'Active',
      joinDate: new Date().toISOString().split('T')[0],
      permissions: newStaff.permissions || [],
      avatar: null
    };

    setStaffList(prev => [...prev, staffMember]);
    setNewStaff({ name: '', email: '', phone: '', role: '', department: '', permissions: [] });
    setShowAddStaff(false);
    
    toast({
      title: "Staff Added",
      description: `${staffMember.name} has been added to ${center.name}.`,
    });
  };

  const handleEditStaff = (staff: any) => {
    setEditingStaff(staff);
  };

  const handleDeleteStaff = (staffId: string) => {
    const staff = staffList.find(s => s.id === staffId);
    setStaffList(prev => prev.filter(s => s.id !== staffId));
    
    toast({
      title: "Staff Removed",
      description: `${staff?.name} has been removed from ${center.name}.`,
    });
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const getRoleColor = (role: string) => {
    const colors = {
      'Medical Director': 'bg-purple-100 text-purple-800',
      'Lead Counselor': 'bg-blue-100 text-blue-800',
      'Clinical Supervisor': 'bg-green-100 text-green-800',
      'Intake Coordinator': 'bg-orange-100 text-orange-800',
      'Nurse': 'bg-pink-100 text-pink-800',
      'Therapist': 'bg-cyan-100 text-cyan-800',
    };
    return colors[role] || 'bg-gray-100 text-gray-800';
  };

  if (!center) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            {center.name} - Staff Management
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="staff-list" className="child-tabs">
          <TabsList className="child-tabs">
            <TabsTrigger value="staff-list" className="child-tab-trigger">
              <Users className="h-4 w-4" />
              <span>Staff Directory</span>
            </TabsTrigger>
            <TabsTrigger value="add-staff" className="child-tab-trigger">
              <UserPlus className="h-4 w-4" />
              <span>Add Staff</span>
            </TabsTrigger>
            <TabsTrigger value="permissions" className="child-tab-trigger">
              <Shield className="h-4 w-4" />
              <span>Permissions</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="staff-list" className="child-tab-content space-y-6">
            {/* Staff Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="bg-blue-50 border-blue-200">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-blue-600">Total Staff</p>
                      <p className="text-2xl font-bold text-blue-900">{staffList.length}</p>
                    </div>
                    <Users className="h-8 w-8 text-blue-500" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-green-50 border-green-200">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-green-600">Active</p>
                      <p className="text-2xl font-bold text-green-900">
                        {staffList.filter(s => s.status === 'Active').length}
                      </p>
                    </div>
                    <Shield className="h-8 w-8 text-green-500" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-orange-50 border-orange-200">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-orange-600">Clinical Staff</p>
                      <p className="text-2xl font-bold text-orange-900">
                        {staffList.filter(s => s.department === 'Clinical').length}
                      </p>
                    </div>
                    <Calendar className="h-8 w-8 text-orange-500" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-purple-50 border-purple-200">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-purple-600">Admin Staff</p>
                      <p className="text-2xl font-bold text-purple-900">
                        {staffList.filter(s => s.department === 'Administration').length}
                      </p>
                    </div>
                    <UserPlus className="h-8 w-8 text-purple-500" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Search and Filters */}
            <div className="flex items-center gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  type="text"
                  placeholder="Search staff..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={selectedRole} onValueChange={setSelectedRole}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="Medical Director">Medical Director</SelectItem>
                  <SelectItem value="Lead Counselor">Lead Counselor</SelectItem>
                  <SelectItem value="Clinical Supervisor">Clinical Supervisor</SelectItem>
                  <SelectItem value="Intake Coordinator">Intake Coordinator</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Staff List */}
            <Card>
              <CardHeader>
                <CardTitle>Staff Directory ({filteredStaff.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredStaff.map((staff) => (
                    <div key={staff.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                      <div className="flex items-center gap-4">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={staff.avatar} />
                          <AvatarFallback>{getInitials(staff.name)}</AvatarFallback>
                        </Avatar>
                        
                        <div>
                          <h4 className="font-medium">{staff.name}</h4>
                          <p className="text-sm text-gray-600">{staff.email}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge className={getRoleColor(staff.role)}>{staff.role}</Badge>
                            <Badge variant="outline">{staff.department}</Badge>
                            <Badge variant={staff.status === 'Active' ? 'default' : 'secondary'}>
                              {staff.status}
                            </Badge>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="text-right text-sm text-gray-600">
                          <p>{staff.phone}</p>
                          <p>Joined: {new Date(staff.joinDate).toLocaleDateString()}</p>
                        </div>
                        
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEditStaff(staff)}>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleDeleteStaff(staff.id)}
                              className="text-red-600"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Remove
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="add-staff" className="child-tab-content space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Add New Staff Member</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="staff-name">Full Name*</Label>
                    <Input
                      id="staff-name"
                      value={newStaff.name}
                      onChange={(e) => setNewStaff(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Enter full name"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="staff-email">Email*</Label>
                    <Input
                      id="staff-email"
                      type="email"
                      value={newStaff.email}
                      onChange={(e) => setNewStaff(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="Enter email address"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="staff-phone">Phone</Label>
                    <Input
                      id="staff-phone"
                      value={newStaff.phone}
                      onChange={(e) => setNewStaff(prev => ({ ...prev, phone: e.target.value }))}
                      placeholder="Enter phone number"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="staff-role">Role*</Label>
                    <Select value={newStaff.role} onValueChange={(value) => setNewStaff(prev => ({ ...prev, role: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Medical Director">Medical Director</SelectItem>
                        <SelectItem value="Lead Counselor">Lead Counselor</SelectItem>
                        <SelectItem value="Clinical Supervisor">Clinical Supervisor</SelectItem>
                        <SelectItem value="Intake Coordinator">Intake Coordinator</SelectItem>
                        <SelectItem value="Nurse">Nurse</SelectItem>
                        <SelectItem value="Therapist">Therapist</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="staff-department">Department</Label>
                    <Select value={newStaff.department} onValueChange={(value) => setNewStaff(prev => ({ ...prev, department: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select department" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Administration">Administration</SelectItem>
                        <SelectItem value="Clinical">Clinical</SelectItem>
                        <SelectItem value="Admissions">Admissions</SelectItem>
                        <SelectItem value="Medical">Medical</SelectItem>
                        <SelectItem value="Support">Support</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <Button variant="outline" onClick={() => setNewStaff({ name: '', email: '', phone: '', role: '', department: '', permissions: [] })}>
                    Clear
                  </Button>
                  <Button onClick={handleAddStaff}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Staff Member
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="permissions" className="child-tab-content space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Permission Management</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Manage permissions and access levels for different staff roles.
                  </p>
                  
                  <div className="grid gap-4">
                    {['Admin', 'Patient Records', 'Staff Management', 'Treatment Plans', 'Scheduling', 'Billing'].map((permission) => (
                      <div key={permission} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <span className="font-medium">{permission}</span>
                          <p className="text-sm text-gray-600">
                            {permission === 'Admin' && 'Full system access and configuration'}
                            {permission === 'Patient Records' && 'View and edit patient information'}
                            {permission === 'Staff Management' && 'Manage staff accounts and roles'}
                            {permission === 'Treatment Plans' && 'Create and modify treatment plans'}
                            {permission === 'Scheduling' && 'Manage appointments and schedules'}
                            {permission === 'Billing' && 'Access billing and payment information'}
                          </p>
                        </div>
                        <Badge variant="outline">
                          {staffList.filter(s => s.permissions.includes(permission)).length} users
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-2 mt-6">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};