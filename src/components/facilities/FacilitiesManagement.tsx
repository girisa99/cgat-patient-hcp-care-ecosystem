import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Building, 
  Plus, 
  Search, 
  Filter,
  Download,
  Settings,
  Activity,
  MapPin
} from 'lucide-react';
import { useRealFacilities } from '@/hooks/api/useRealFacilities';
import FacilitiesList from './FacilitiesList';
import CreateFacilityDialog from './CreateFacilityDialog';
import EditFacilityDialog from './EditFacilityDialog';

export const FacilitiesManagement: React.FC = () => {
  const { data: facilities = [], isLoading, error } = useRealFacilities();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFacility, setSelectedFacility] = useState<any>(null);
  
  // Dialog states
  const [createFacilityOpen, setCreateFacilityOpen] = useState(false);
  const [editFacilityOpen, setEditFacilityOpen] = useState(false);

  const getFacilityStats = () => {
    return {
      total: facilities.length,
      active: facilities.filter(f => f.is_active !== false).length,
      inactive: facilities.filter(f => f.is_active === false).length,
      typeBreakdown: facilities.reduce((acc: any, f) => {
        const t = f.facility_type || 'unknown';
        acc[t] = (acc[t] || 0) + 1;
        return acc;
      }, {})
    };
  };

  const searchFacilities = (query: string) => {
    if (!query.trim()) return facilities;
    return facilities.filter(f =>
      f.name.toLowerCase().includes(query.toLowerCase()) ||
      (f.address ?? '').toLowerCase().includes(query.toLowerCase())
    );
  };

  const handleEditFacility = (facility: any) => {
    setSelectedFacility(facility);
    setEditFacilityOpen(true);
  };

  if (error) {
    console.error('❌ Error in FacilitiesManagement:', error);
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Facilities Management</h1>
          <p className="text-gray-600">Manage healthcare facilities and their information</p>
        </div>
        <Button onClick={() => setCreateFacilityOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Facility
        </Button>
      </div>

      {/* Stats - Real Data */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Facilities</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{getFacilityStats().total}</div>
            <p className="text-xs text-muted-foreground">
              {getFacilityStats().active} active, {getFacilityStats().inactive} inactive
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Facility Types</CardTitle>
            <Settings className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Object.keys(getFacilityStats().typeBreakdown).length}</div>
            <p className="text-xs text-muted-foreground">Different facility types</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Facilities</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{getFacilityStats().active}</div>
            <p className="text-xs text-muted-foreground">Currently operational</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Locations</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{getFacilityStats().total}</div>
            <p className="text-xs text-muted-foreground">Unique locations</p>
          </CardContent>
        </Card>
      </div>

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

      {/* Facility Type Breakdown - Real Data */}
      <Card>
        <CardHeader>
          <CardTitle>Facility Types</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {Object.entries(getFacilityStats().typeBreakdown).map(([type, count]) => (
              <Badge key={type} variant="outline" className="text-sm">
                {type}: {count as number}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Facilities List - Real Data */}
      {isLoading ? (
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-gray-500">Loading facilities from database...</p>
          </CardContent>
        </Card>
      ) : error ? (
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-red-500">Error loading facilities: {error.message}</p>
          </CardContent>
        </Card>
      ) : (
        <FacilitiesList
          facilities={searchFacilities(searchQuery)}
          onEditFacility={handleEditFacility}
        />
      )}

      {/* Data Source Indicator */}
      <div className="text-xs text-gray-500 text-center">
        Real Database Connection • {facilities.length} facilities loaded from facilities table
      </div>

      {/* Dialogs */}
      <CreateFacilityDialog
        open={createFacilityOpen}
        onOpenChange={setCreateFacilityOpen}
      />

      <EditFacilityDialog
        open={editFacilityOpen}
        onOpenChange={setEditFacilityOpen}
        facility={selectedFacility}
      />
    </div>
  );
};
