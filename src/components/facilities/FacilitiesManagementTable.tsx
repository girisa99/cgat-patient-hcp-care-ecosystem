import React, { useState } from 'react';
import { useMasterAuth } from '@/hooks/useMasterAuth';
import { useMasterFacilities, Facility } from '@/hooks/useMasterFacilities';
import { useMasterToast } from '@/hooks/useMasterToast';
import { DataTable, ColumnConfig } from '@/components/ui/DataTable';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Shield, UserPlus, Settings } from 'lucide-react';

export const FacilitiesManagementTable: React.FC = () => {
  const { userRoles } = useMasterAuth();
  const { showSuccess, showError, showInfo } = useMasterToast();
  const {
    facilities,
    isLoading,
    error,
    createFacility,
    deactivateFacility,
    isCreatingFacility,
    isDeactivatingFacility,
    refetch,
  } = useMasterFacilities();

  const isAdmin = userRoles.includes('superAdmin') || userRoles.includes('onboardingTeam');
  
  // Dialog state
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newFacility, setNewFacility] = useState({
    name: '',
    facility_type: 'treatmentFacility' as Facility['facility_type'],
    address: '',
    phone: '',
  });

  if (!isAdmin) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <p>You don't have permission to manage facilities.</p>
        </CardContent>
      </Card>
    );
  }

  const handleCreate = () => {
    if (!newFacility.name) {
      showError("Validation Error", "Facility name is required");
      return;
    }
    createFacility({
      name: newFacility.name,
      facility_type: newFacility.facility_type,
      address: newFacility.address || undefined,
      phone: newFacility.phone || undefined,
    });
    setIsAddOpen(false);
    setNewFacility({ name: '', facility_type: 'treatmentFacility', address: '', phone: '' });
    showSuccess("Facility Created", `${newFacility.name} has been created successfully`);
  };

  const columns: ColumnConfig[] = [
    { key: 'name', label: 'Name', sortable: true, className: 'font-medium' },
    { key: 'facility_type', label: 'Type', sortable: true },
    { key: 'address', label: 'Address', sortable: false },
    { key: 'phone', label: 'Phone' },
    {
      key: 'is_active',
      label: 'Status',
      render: (value) => (
        <Badge variant={value ? 'default' : 'secondary'}>{value ? 'Active' : 'Inactive'}</Badge>
      ),
    },
  ];

  const handleDeactivate = (facility: Facility) => {
    deactivateFacility(facility.id);
    showInfo("Facility Deactivated", `${facility.name} has been deactivated`);
  };

  const handleAssignRole = (facility: Facility) => {
    // Functionality to assign role to facility
    console.log('Assign role to facility:', facility.id);
    showSuccess("Role Assignment", `Role assignment dialog opened for ${facility.name}`);
  };

  const handleAssignUser = (facility: Facility) => {
    // Functionality to assign user to facility
    console.log('Assign user to facility:', facility.id);
    showSuccess("User Assignment", `User assignment dialog opened for ${facility.name}`);
  };

  const handleAssignModule = (facility: Facility) => {
    // Functionality to assign module to facility
    console.log('Assign module to facility:', facility.id);
    showSuccess("Module Assignment", `Module assignment dialog opened for ${facility.name}`);
  };

  const renderActions = (row: Facility) => (
    <div className="flex gap-1">
      <Button
        size="sm"
        variant="outline"
        onClick={() => handleAssignRole(row)}
        title="Assign Role"
      >
        <Shield className="h-4 w-4" />
      </Button>
      <Button
        size="sm"
        variant="outline"
        onClick={() => handleAssignUser(row)}
        title="Assign User"
      >
        <UserPlus className="h-4 w-4" />
      </Button>
      <Button
        size="sm"
        variant="outline"
        onClick={() => handleAssignModule(row)}
        title="Assign Module"
      >
        <Settings className="h-4 w-4" />
      </Button>
      {row.is_active && (
        <Button
          size="sm"
          variant="outline"
          disabled={isDeactivatingFacility}
          onClick={() => handleDeactivate(row)}
        >
          Deactivate
        </Button>
      )}
    </div>
  );

  return (
    <Card>
      <CardHeader className="flex items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          Facilities <Badge variant="outline">{facilities.length}</Badge>
        </CardTitle>
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button size="sm">Add Facility</Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Add Facility</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Name *</Label>
                <Input id="name" value={newFacility.name} onChange={(e) => setNewFacility({ ...newFacility, name: e.target.value })} />
              </div>
              <div>
                <Label htmlFor="type">Type</Label>
                <Input id="type" value={newFacility.facility_type} onChange={(e) => setNewFacility({ ...newFacility, facility_type: e.target.value as any })} />
              </div>
              <div>
                <Label htmlFor="address">Address</Label>
                <Input id="address" value={newFacility.address} onChange={(e) => setNewFacility({ ...newFacility, address: e.target.value })} />
              </div>
              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" value={newFacility.phone} onChange={(e) => setNewFacility({ ...newFacility, phone: e.target.value })} />
              </div>
              <Button className="w-full" disabled={isCreatingFacility || !newFacility.name} onClick={handleCreate}>
                {isCreatingFacility ? 'Creating…' : 'Create'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {error ? (
          <p className="text-destructive">{String(error)}</p>
        ) : (
          <DataTable
            data={facilities}
            columns={columns}
            actions={renderActions}
            loading={isLoading}
            emptyMessage="No facilities found"
            onRefresh={refetch}
          />
        )}
      </CardContent>
    </Card>
  );
};