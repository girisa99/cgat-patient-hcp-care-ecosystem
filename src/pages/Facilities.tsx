
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, RefreshCw, Plus, Building2, MapPin } from 'lucide-react';
import { useMasterData } from '@/hooks/useMasterData';
import { useMasterAuth } from '@/hooks/useMasterAuth';

const Facilities: React.FC = () => {
  const { isAuthenticated, isLoading: authLoading, userRoles } = useMasterAuth();
  const { 
    facilities,
    isLoading, 
    error, 
    refreshData, 
    searchFacilities,
    stats
  } = useMasterData();
  
  const [searchQuery, setSearchQuery] = React.useState('');

  console.log('🏥 Facilities Page - Master Data Integration');

  if (authLoading || isLoading) {
    return (
      <div className="p-6">
        <div className="text-center">
          <div className="text-muted-foreground">Loading facilities...</div>
        </div>
      </div>
    );
  }

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

  if (error) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="p-8 text-center">
            <div className="text-red-600">Error loading facilities: {error.message}</div>
            <Button onClick={refreshData} className="mt-4">
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const filteredFacilities = searchFacilities(searchQuery);

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Facility Management</h1>
        <p className="text-muted-foreground">
          Manage healthcare facilities and treatment centers
        </p>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="text-center p-4 bg-blue-50 rounded-lg">
          <div className="text-2xl font-bold text-blue-600">{stats.totalFacilities}</div>
          <div className="text-sm text-blue-600">Total Facilities</div>
        </div>
        <div className="text-center p-4 bg-green-50 rounded-lg">
          <div className="text-2xl font-bold text-green-600">{stats.activeFacilities}</div>
          <div className="text-sm text-green-600">Active</div>
        </div>
        <div className="text-center p-4 bg-orange-50 rounded-lg">
          <div className="text-2xl font-bold text-orange-600">{stats.totalFacilities - stats.activeFacilities}</div>
          <div className="text-sm text-orange-600">Inactive</div>
        </div>
        <div className="text-center p-4 bg-purple-50 rounded-lg">
          <div className="text-2xl font-bold text-purple-600">{userRoles.length}</div>
          <div className="text-sm text-purple-600">Your Roles</div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Healthcare Facilities ({filteredFacilities.length})
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
              <Button
                size="sm"
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Add Facility
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search facilities by name or address..."
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
                {facilities.length === 0 && (
                  <p className="text-sm">No facilities have been added to the system yet</p>
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
                        <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                          <MapPin className="h-3 w-3" />
                          {facility.address}
                        </div>
                      )}
                      <div className="flex items-center gap-2 mt-2">
                        {facility.phone && (
                          <span className="text-xs text-muted-foreground">{facility.phone}</span>
                        )}
                        {facility.email && (
                          <span className="text-xs text-muted-foreground">{facility.email}</span>
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        Created: {new Date(facility.created_at).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={facility.is_active ? 'default' : 'secondary'}>
                        {facility.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                      <Button variant="outline" size="sm">
                        Manage
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Facilities;
