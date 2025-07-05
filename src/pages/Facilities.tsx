"use client";

import React, { useState } from 'react';
import { useMasterAuth } from '@/hooks/useMasterAuth';
import { useMasterFacilities, Facility } from '@/hooks/useMasterFacilities';
import AccessDenied from '@/components/AccessDenied';
import { DataTable, ColumnConfig } from '@/components/ui/DataTable';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import AppLayout from '@/components/layout/AppLayout';
import { Badge } from '@/components/ui/badge';

export default function Facilities() {
  const { userRoles } = useMasterAuth();
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
  if (!isAdmin) return <AccessDenied />;

  // Dialog state
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newFacility, setNewFacility] = useState({
    name: '',
    facility_type: 'treatmentFacility' as Facility['facility_type'],
    address: '',
    phone: '',
  });

  const handleCreate = () => {
    if (!newFacility.name) return;
    createFacility({
      name: newFacility.name,
      facility_type: newFacility.facility_type,
      address: newFacility.address || undefined,
      phone: newFacility.phone || undefined,
    });
    setIsAddOpen(false);
    setNewFacility({ name: '', facility_type: 'treatmentFacility', address: '', phone: '' });
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

  const renderActions = (row: Facility) => (
    <div className="flex gap-1">
      {row.is_active && (
        <Button
          size="sm"
          variant="outline"
          disabled={isDeactivatingFacility}
          onClick={() => deactivateFacility(row.id)}
        >
          Deactivate
        </Button>
      )}
    </div>
  );

  return (
    <AppLayout title="Facilities Management">
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
    </AppLayout>
  );
}
