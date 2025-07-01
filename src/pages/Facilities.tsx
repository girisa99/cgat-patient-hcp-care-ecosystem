
import React, { useState } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { PageContainer } from '@/components/layout/PageContainer';
import { AdminStatsGrid, StatCard } from '@/components/layout/AdminStatsGrid';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Building2, CheckCircle, AlertCircle, Settings, Search, Filter, Download } from 'lucide-react';
import FacilitiesList from '@/components/facilities/FacilitiesList';
import CreateFacilityDialog from '@/components/facilities/CreateFacilityDialog';
import EditFacilityDialog from '@/components/facilities/EditFacilityDialog';
import { useFacilities } from '@/hooks/useFacilities';

const Facilities = () => {
  const { facilities, isLoading, getFacilityStats } = useFacilities();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedFacility, setSelectedFacility] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const handleCreateFacility = () => {
    setCreateDialogOpen(true);
  };

  const handleEditFacility = (facility: any) => {
    setSelectedFacility(facility);
    setEditDialogOpen(true);
  };

  // Get stats from the hook
  const stats = getFacilityStats();
  
  // Filter facilities based on search
  const filteredFacilities = facilities.filter(facility => 
    facility.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    facility.facility_type?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    facility.address?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const headerActions = (
    <Button onClick={handleCreateFacility}>
      <Plus className="h-4 w-4 mr-2" />
      Add Facility
    </Button>
  );

  return (
    <MainLayout>
      <PageContainer
        title="Facilities Management"
        subtitle="Manage healthcare facilities and their information"
        headerActions={headerActions}
      >
        <div className="space-y-6">
          {/* Stats Grid */}
          <AdminStatsGrid columns={4}>
            <StatCard
              title="Total Facilities"
              value={stats.total}
              icon={Building2}
              description="All registered facilities"
            />
            <StatCard
              title="Active Facilities"
              value={stats.active}
              icon={CheckCircle}
              description="Currently active facilities"
            />
            <StatCard
              title="Inactive Facilities"
              value={stats.inactive}
              icon={AlertCircle}
              description="Inactive facilities"
            />
            <StatCard
              title="Facility Types"
              value={Object.keys(stats.typeBreakdown).length}
              icon={Settings}
              description="Different facility types"
            />
          </AdminStatsGrid>

          {/* Search and Filters */}
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search facilities by name, type, or address..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>

          {/* Facilities List */}
          <Card className="shadow-sm">
            <CardContent className="p-6">
              {isLoading ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">Loading facilities...</p>
                </div>
              ) : (
                <FacilitiesList 
                  facilities={filteredFacilities}
                  onEditFacility={handleEditFacility}
                />
              )}
            </CardContent>
          </Card>
        </div>

        {/* Dialogs */}
        <CreateFacilityDialog 
          open={createDialogOpen}
          onOpenChange={setCreateDialogOpen}
        />

        {selectedFacility && (
          <EditFacilityDialog
            facility={selectedFacility}
            open={editDialogOpen}
            onOpenChange={setEditDialogOpen}
          />
        )}
      </PageContainer>
    </MainLayout>
  );
};

export default Facilities;
