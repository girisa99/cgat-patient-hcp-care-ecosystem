import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Building2, Search, RefreshCw, MapPin, Plus, Settings, Users } from 'lucide-react';
import { useMasterAuth } from '@/hooks/useMasterAuth';
import { useMasterData } from '@/hooks/useMasterData';

const Facilities: React.FC = () => {
  const { isAuthenticated, isLoading: authLoading } = useMasterAuth();
  const { 
    facilities,
    users,
    modules,
    isLoading, 
    error, 
    refreshData, 
    searchFacilities,
    stats
  } = useMasterData();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFacility, setSelectedFacility] = useState<any>(null);
  const [isAddFacilityOpen, setIsAddFacilityOpen] = useState(false);
  const [isAssignUserOpen, setIsAssignUserOpen] = useState(false);
  const [isAssignModuleOpen, setIsAssignModuleOpen] = useState(false);
  
  // Form states
  const [newFacility, setNewFacility] = useState({
    name: '',
    facilityType: '',
    address: '',
    phone: '',
    email: ''
  });
  const [selectedUser, setSelectedUser] = useState<string>('');
  const [selectedModule, setSelectedModule] = useState<string>('');

  console.log('🏢 Facilities Page - Master Data Integration (Single Source)');

  const handleAddFacility = () => {
    if (!newFacility.name || !newFacility.facilityType) {
      return;
    }

    // TODO: Implement facility creation through useMasterData
    console.log('Creating facility:', newFacility);
    setIsAddFacilityOpen(false);
    setNewFacility({ name: '', facilityType: '', address: '', phone: '', email: '' });
  };

  const handleAssignUser = () => {
    if (!selectedFacility || !selectedUser) {
      return;
    }

    // TODO: Implement user assignment to facility
    console.log('Assigning user to facility:', { facilityId: selectedFacility.id, userId: selectedUser });
    setIsAssignUserOpen(false);
    setSelectedUser('');
  };

  const handleAssignModule = () => {
    if (!selectedFacility || !selectedModule) {
      return;
    }

    // TODO: Implement module assignment to facility
    console.log('Assigning module to facility:', { facilityId: selectedFacility.id, moduleId: selectedModule });
    setIsAssignModuleOpen(false);
    setSelectedModule('');
  };

  const filteredFacilities = searchFacilities(searchQuery);

  // Loading state
  if (authLoading || isLoading) {
    return (
      <div className="p-6">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-green-600" />
          <div className="text-muted-foreground">Loading facilities...</div>
        </div>
      </div>
    );
  }

  // Not authenticated
  if (!isAuthenticated) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="p-8 text-center">
            <div className="text-muted-foreground">Please log in to view facilities</div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="p-8 text-center">
            <div className="text-red-600 mb-4">Error loading facilities: {error.message}</div>
            <Button onClick={refreshData} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const facilityTypes = [...new Set(facilities.map(f => f.facility_type))];

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Facilities Management</h1>
        <p className="text-muted-foreground">
          Manage healthcare facilities, assign users, and configure modules
        </p>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="text-center p-4 bg-green-50 rounded-lg">
          <div className="text-2xl font-bold text-green-600">{stats.totalFacilities}</div>
          <div className="text-sm text-green-600">Total Facilities</div>
        </div>
        <div className="text-center p-4 bg-blue-50 rounded-lg">
          <div className="text-2xl font-bold text-blue-600">{stats.activeFacilities}</div>
          <div className="text-sm text-blue-600">Active</div>
        </div>
        <div className="text-center p-4 bg-purple-50 rounded-lg">
          <div className="text-2xl font-bold text-purple-600">{facilityTypes.length}</div>
          <div className="text-sm text-purple-600">Facility Types</div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Healthcare Facilities ({filteredFacilities.length} facilities)
            </div>
            <div className="flex items-center gap-2">
              <Button
                onClick={refreshData}
                variant="outline"
                size="sm"
                disabled={isLoading}
                className="flex items-center gap-2"
              >
                <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Dialog open={isAddFacilityOpen} onOpenChange={setIsAddFacilityOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" className="flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    Add Facility
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add New Facility</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="name">Facility Name</Label>
                      <Input
                        id="name"
                        value={newFacility.name}
                        onChange={(e) => setNewFacility(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="Enter facility name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="facilityType">Facility Type</Label>
                      <Select value={newFacility.facilityType} onValueChange={(value) => setNewFacility(prev => ({ ...prev, facilityType: value }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select facility type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="hospital">Hospital</SelectItem>
                          <SelectItem value="clinic">Clinic</SelectItem>
                          <SelectItem value="pharmacy">Pharmacy</SelectItem>
                          <SelectItem value="laboratory">Laboratory</SelectItem>
                          <SelectItem value="imaging">Imaging Center</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="address">Address</Label>
                      <Input
                        id="address"
                        value={newFacility.address}
                        onChange={(e) => setNewFacility(prev => ({ ...prev, address: e.target.value }))}
                        placeholder="Enter facility address"
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone">Phone</Label>
                      <Input
                        id="phone"
                        value={newFacility.phone}
                        onChange={(e) => setNewFacility(prev => ({ ...prev, phone: e.target.value }))}
                        placeholder="Enter phone number"
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={newFacility.email}
                        onChange={(e) => setNewFacility(prev => ({ ...prev, email: e.target.value }))}
                        placeholder="Enter email address"
                      />
                    </div>
                    <Button 
                      onClick={handleAddFacility} 
                      className="w-full"
                    >
                      Create Facility
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search facilities by name, type, or address..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Facilities List */}
            {filteredFacilities.length === 0 ? (
              <div className="text-center p-8 text-muted-foreground">
                <Building2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No facilities found</p>
                {searchQuery && (
                  <p className="text-sm">Try adjusting your search terms</p>
                )}
              </div>
            ) : (
              <div className="space-y-2">
                {filteredFacilities.map((facility) => (
                  <div key={facility.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <div className="font-medium">{facility.name}</div>
                        <Badge variant="outline" className="text-xs">
                          {facility.facility_type}
                        </Badge>
                      </div>
                      {facility.address && (
                        <div className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                          <MapPin className="h-3 w-3" />
                          {facility.address}
                        </div>
                      )}
                      <div className="flex gap-2 text-sm text-muted-foreground mt-1">
                        {facility.phone && <span>📞 {facility.phone}</span>}
                        {facility.email && <span>✉️ {facility.email}</span>}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={facility.is_active ? "default" : "secondary"}>
                        {facility.is_active ? "Active" : "Inactive"}
                      </Badge>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          setSelectedFacility(facility);
                          setIsAssignUserOpen(true);
                        }}
                      >
                        <Users className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          setSelectedFacility(facility);
                          setIsAssignModuleOpen(true);
                        }}
                      >
                        <Settings className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Assign User Dialog */}
      <Dialog open={isAssignUserOpen} onOpenChange={setIsAssignUserOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign User to {selectedFacility?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="user">Select User</Label>
              <Select value={selectedUser} onValueChange={setSelectedUser}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a user" />
                </SelectTrigger>
                <SelectContent>
                  {users.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.first_name} {user.last_name} - {user.email}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button 
              onClick={handleAssignUser} 
              disabled={!selectedUser}
              className="w-full"
            >
              Assign User
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Assign Module Dialog */}
      <Dialog open={isAssignModuleOpen} onOpenChange={setIsAssignModuleOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Module to {selectedFacility?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="module">Select Module</Label>
              <Select value={selectedModule} onValueChange={setSelectedModule}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a module" />
                </SelectTrigger>
                <SelectContent>
                  {modules.map((module) => (
                    <SelectItem key={module.id} value={module.id}>
                      {module.name} {module.description && `- ${module.description}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button 
              onClick={handleAssignModule} 
              disabled={!selectedModule}
              className="w-full"
            >
              Assign Module
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Facilities;
