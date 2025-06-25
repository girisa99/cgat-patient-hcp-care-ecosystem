
import React from 'react';
import { useFacilities } from '@/hooks/useFacilities';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Plus, Edit } from 'lucide-react';

interface FacilitiesListProps {
  onCreateFacility: () => void;
  onEditFacility: (facilityId: string) => void;
}

const FacilitiesList: React.FC<FacilitiesListProps> = ({
  onCreateFacility,
  onEditFacility
}) => {
  const { facilities, isLoading, error } = useFacilities();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-8">
        <p className="text-red-600">Error loading facilities: {error.message}</p>
      </div>
    );
  }

  if (!facilities || facilities.length === 0) {
    return (
      <div className="text-center p-8">
        <p className="text-gray-500 mb-4">No facilities found</p>
        <Button onClick={onCreateFacility}>
          <Plus className="mr-2 h-4 w-4" />
          Add First Facility
        </Button>
      </div>
    );
  }

  const getFacilityTypeLabel = (type: string) => {
    switch (type) {
      case 'treatmentFacility':
        return 'Treatment Facility';
      case 'referralFacility':
        return 'Referral Facility';
      case 'prescriberFacility':
        return 'Prescriber Facility';
      default:
        return type;
    }
  };

  const getFacilityTypeColor = (type: string) => {
    switch (type) {
      case 'treatmentFacility':
        return 'bg-green-100 text-green-800';
      case 'referralFacility':
        return 'bg-blue-100 text-blue-800';
      case 'prescriberFacility':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold">All Facilities</h3>
        <Button onClick={onCreateFacility}>
          <Plus className="mr-2 h-4 w-4" />
          Add New Facility
        </Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Contact</TableHead>
            <TableHead>License/NPI</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {facilities.map((facility) => (
            <TableRow key={facility.id}>
              <TableCell>
                <div>
                  <div className="font-medium">{facility.name}</div>
                  <div className="text-sm text-gray-500">{facility.address}</div>
                </div>
              </TableCell>
              <TableCell>
                <Badge className={getFacilityTypeColor(facility.facility_type)}>
                  {getFacilityTypeLabel(facility.facility_type)}
                </Badge>
              </TableCell>
              <TableCell>
                <div>
                  {facility.phone && <div className="text-sm">{facility.phone}</div>}
                  {facility.email && <div className="text-sm text-gray-500">{facility.email}</div>}
                </div>
              </TableCell>
              <TableCell>
                <div>
                  {facility.license_number && <div className="text-sm">License: {facility.license_number}</div>}
                  {facility.npi_number && <div className="text-sm text-gray-500">NPI: {facility.npi_number}</div>}
                  {!facility.license_number && !facility.npi_number && <span className="text-gray-400">-</span>}
                </div>
              </TableCell>
              <TableCell>
                <Badge variant={facility.is_active ? 'default' : 'secondary'}>
                  {facility.is_active ? 'Active' : 'Inactive'}
                </Badge>
              </TableCell>
              <TableCell>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onEditFacility(facility.id)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default FacilitiesList;
