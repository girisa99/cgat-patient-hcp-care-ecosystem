import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/components/layout/AppLayout';
import { useMasterFacilities } from '@/hooks/useMasterFacilities';
import { useRoleBasedNavigation } from '@/hooks/useRoleBasedNavigation';
import { Badge } from '@/components/ui/badge';

const SimpleFacilities: React.FC = () => {
  console.log('🏢 Simple Facilities page rendering');
  const { facilities, isLoading, error, getFacilityStats } = useMasterFacilities();
  const { hasAccess, currentRole } = useRoleBasedNavigation();

  if (!hasAccess('/facilities')) {
    return (
      <AppLayout title="Access Denied">
        <Card>
          <CardContent className="p-8 text-center">
            <p>You don't have permission to access Facilities Management.</p>
            <p className="text-sm text-muted-foreground mt-2">Current role: {currentRole}</p>
          </CardContent>
        </Card>
      </AppLayout>
    );
  }

  const stats = getFacilityStats();

  return (
    <AppLayout title="Facilities Management">
      <div className="space-y-6">
        {/* Facility Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold">{stats.total}</div>
              <div className="text-sm text-muted-foreground">Total Facilities</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-green-600">{stats.active}</div>
              <div className="text-sm text-muted-foreground">Active Facilities</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-blue-600">{Object.keys(stats.typeDistribution || {}).length}</div>
              <div className="text-sm text-muted-foreground">Facility Types</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-purple-600">{Object.keys(stats.typeDistribution || {}).length}</div>
              <div className="text-sm text-muted-foreground">Categories</div>
            </CardContent>
          </Card>
        </div>

        {/* Facility Management */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Facility Management
              <Badge variant="outline">{facilities.length} facilities</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p>Loading facilities...</p>
            ) : error ? (
              <p className="text-red-600">Error: {String(error)}</p>
            ) : (
              <div className="space-y-4">
                <p>Managing {facilities.length} healthcare facilities across multiple regions.</p>
                
                {/* Facility List Preview */}
                <div className="space-y-2">
                  {facilities.slice(0, 5).map((facility: any) => (
                    <div key={facility.id} className="flex items-center justify-between p-3 border rounded">
                      <div>
                        <div className="font-medium">{facility.name}</div>
                        <div className="text-sm text-muted-foreground">{facility.facility_type}</div>
                      </div>
                      <Badge variant={facility.is_active ? 'default' : 'secondary'}>
                        {facility.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                  ))}
                  {facilities.length > 5 && (
                    <p className="text-sm text-muted-foreground">
                      And {facilities.length - 5} more facilities...
                    </p>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default SimpleFacilities;