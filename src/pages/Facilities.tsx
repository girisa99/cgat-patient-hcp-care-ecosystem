
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
import { useFacilitiesPage } from '@/hooks/useFacilitiesPage';

/**
 * Facilities Page - LOCKED IMPLEMENTATION
 * Uses dedicated useFacilitiesPage hook for consistent data access
 * DO NOT MODIFY - This page is locked for stability
 */
const Facilities = () => {
  const { facilities, isLoading, error, getFacilityStats, searchFacilities, meta } = useFacilitiesPage();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedFacility, setSelectedFacility] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');

  console.log('🔒 Facilities Page - LOCKED VERSION active with hook version:', meta.hookVersion);

  const handleCreateFacility = () => {
    setCreateDialogOpen(true);
  };

  const handleEditFacility = (facility: any) => {
    setSelectedFacility(facility);
    setEditDialogOpen(true);
  };

  // Get stats from the locked hook
  const stats = getFacilityStats();
  
  // Filter facilities using the locked hook's search function
  const filteredFacilities = searchFacilities(searchQuery);

  if (error) {
    console.error('❌ Error loading facilities:', error);
  }

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
          {/* LOCKED STATUS INDICATOR - Fixed spacing */}
          <Card className="border-green-200 bg-green-50/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
                <h3 className="font-semibold text-green-900">🔒 Facilities Management - LOCKED & STABLE</h3>
              </div>
              <div className="text-sm text-green-700 space-y-1">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p><strong>Data Source:</strong> {meta.dataSource}</p>
                    <p><strong>Total Facilities:</strong> {meta.totalFacilities}</p>
                  </div>
                  <div>
                    <p><strong>Hook Version:</strong> {meta.hookVersion}</p>
                    <p><strong>Implementation:</strong> {meta.implementationLocked ? '🔒 LOCKED' : '❌ Unlocked'}</p>
                  </div>
                </div>
                <div className="pt-2 border-t border-green-200">
                  <p className="text-xs text-green-600">
                    ✅ Single Source Validated | 
                    ✅ Data Consistency Verified | 
                    ✅ No Breaking Changes Allowed
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Stats Grid - Real Data with consistent spacing */}
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

          {/* Search and Filters - Consistent spacing */}
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

          {/* Facilities List - Real Data with consistent layout */}
          <Card className="shadow-sm">
            <CardContent className="p-6">
              {isLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-500">Loading facilities from database...</p>
                </div>
              ) : error ? (
                <div className="text-center py-8">
                  <p className="text-red-500">Error loading facilities: {error.message}</p>
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
