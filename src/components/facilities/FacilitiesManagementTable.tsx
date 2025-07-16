import React, { useState } from 'react';
import { useMasterAuth } from '@/hooks/useMasterAuth';
import { useMasterFacilities, Facility } from '@/hooks/useMasterFacilities';
import { useMasterToast } from '@/hooks/useMasterToast';
import { DataTable, ColumnConfig } from '@/components/ui/DataTable';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Shield, UserPlus, Settings, Plus, Edit } from 'lucide-react';
import { FacilityManagementModal } from '@/components/modals/FacilityManagementModal';
import { Database } from '@/integrations/supabase/types';

type FacilityType = Database["public"]["Enums"]["facility_type"];

export const FacilitiesManagementTable: React.FC = () => {
  const { userRoles } = useMasterAuth();
  const { showSuccess, showError, showInfo } = useMasterToast();
  const {
    facilities,
    isLoading,
    error,
    refetch,
  } = useMasterFacilities();

  const isAdmin = userRoles.includes('superAdmin') || userRoles.includes('onboardingTeam');
  
  // Modal state
  const [facilityModal, setFacilityModal] = useState<{
    open: boolean;
    facility?: {
      id: string;
      name: string;
      facility_type: FacilityType;
      address?: string;
      phone?: string;
      email?: string;
      is_active: boolean;
    };
  }>({ open: false });

  if (!isAdmin) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <p>You don't have permission to manage facilities.</p>
        </CardContent>
      </Card>
    );
  }

  const handleOpenCreateModal = () => {
    setFacilityModal({ open: true, facility: undefined });
  };

  const handleOpenEditModal = (facility: Facility) => {
    // Convert facility to match modal's expected type
    const modalFacility = {
      id: facility.id,
      name: facility.name,
      facility_type: facility.facility_type as FacilityType,
      address: facility.address,
      phone: facility.phone,
      email: facility.email,
      is_active: facility.is_active
    };
    setFacilityModal({ open: true, facility: modalFacility });
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

  const refreshData = () => {
    refetch();
  };

  const renderActions = (row: Facility) => (
    <div className="flex gap-1">
      <Button
        size="sm"
        variant="outline"
        onClick={() => handleOpenEditModal(row)}
        title="Edit Facility"
      >
        <Edit className="h-4 w-4" />
      </Button>
      <Button
        size="sm"
        variant="outline"
        onClick={() => handleOpenEditModal(row)}
        title="Manage Facility"
      >
        <Settings className="h-4 w-4" />
      </Button>
    </div>
  );

  return (
    <Card>
      <CardHeader className="flex items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          Facilities <Badge variant="outline">{facilities.length}</Badge>
        </CardTitle>
        <Button size="sm" onClick={handleOpenCreateModal}>
          <Plus className="h-4 w-4 mr-2" />
          Add Facility
        </Button>
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

      {/* Facility Management Modal */}
      <FacilityManagementModal
        open={facilityModal.open}
        onOpenChange={(open) => setFacilityModal(prev => ({ 
          open, 
          facility: open ? prev.facility : undefined 
        }))}
        facility={facilityModal.facility}
        onSuccess={() => {
          refreshData();
          setFacilityModal({ open: false });
        }}
      />
    </Card>
  );
};