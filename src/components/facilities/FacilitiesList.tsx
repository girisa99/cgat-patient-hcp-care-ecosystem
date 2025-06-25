import React, { useState } from 'react';
import { useFacilities } from '@/hooks/useFacilities';
import FacilitiesLoadingSkeleton from './FacilitiesLoadingSkeleton';
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
import { Plus, Edit, RefreshCw, AlertCircle } from 'lucide-react';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';

interface FacilitiesListProps {
  onCreateFacility: () => void;
  onEditFacility: (facilityId: string) => void;
}

const ITEMS_PER_PAGE = 10;

const FacilitiesList: React.FC<FacilitiesListProps> = ({
  onCreateFacility,
  onEditFacility
}) => {
  const { facilities, isLoading, error, refetch } = useFacilities();
  const [currentPage, setCurrentPage] = useState(1);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    console.log('🔄 Manual refresh triggered by user...');
    try {
      await refetch();
      console.log('✅ Manual refresh completed successfully');
    } catch (error) {
      console.error('❌ Manual refresh failed:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  if (isLoading) {
    return <FacilitiesLoadingSkeleton />;
  }

  if (error) {
    return (
      <div className="text-center p-8">
        <div className="flex flex-col items-center gap-4">
          <AlertCircle className="h-12 w-12 text-red-500" />
          <div>
            <p className="text-red-600 font-medium">Error loading facilities</p>
            <p className="text-sm text-gray-500 mt-1">
              {error.message || 'Failed to fetch facilities'}
            </p>
          </div>
          <Button onClick={handleRefresh} variant="outline" disabled={isRefreshing}>
            <RefreshCw className={`mr-2 h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            Try Again
          </Button>
        </div>
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

  // Pagination logic
  const totalPages = Math.ceil(facilities.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentFacilities = facilities.slice(startIndex, endIndex);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <h3 className="text-lg font-semibold">All Facilities</h3>
          <Button 
            onClick={handleRefresh} 
            variant="outline" 
            size="sm"
            disabled={isRefreshing}
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
        <Button onClick={onCreateFacility}>
          <Plus className="mr-2 h-4 w-4" />
          Add New Facility
        </Button>
      </div>

      <div className="mb-4 text-sm text-gray-600">
        Showing {startIndex + 1}-{Math.min(endIndex, facilities.length)} of {facilities.length} facilities
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
          {currentFacilities.map((facility) => (
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

      {totalPages > 1 && (
        <div className="mt-6">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious 
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                />
              </PaginationItem>
              
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <PaginationItem key={page}>
                  <PaginationLink
                    onClick={() => setCurrentPage(page)}
                    isActive={currentPage === page}
                    className="cursor-pointer"
                  >
                    {page}
                  </PaginationLink>
                </PaginationItem>
              ))}
              
              <PaginationItem>
                <PaginationNext 
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  );
};

export default FacilitiesList;
