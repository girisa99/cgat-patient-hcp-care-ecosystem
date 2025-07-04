
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Building2, MapPin, Phone, Mail } from 'lucide-react';
import { useFacilities } from '@/hooks/useFacilities';

const Facilities: React.FC = () => {
  const { facilities, isLoading, getFacilityStats } = useFacilities();
  const stats = getFacilityStats();

  return (
    <div className="p-6 space-y-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Facility Management</h1>
        <p className="text-muted-foreground">
          Manage healthcare facilities and locations
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Facilities</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">
              Registered facilities
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Facilities</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.active}</div>
            <p className="text-xs text-muted-foreground">
              Currently operational
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inactive Facilities</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.inactive}</div>
            <p className="text-xs text-muted-foreground">
              Not operational
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Facilities List */}
      <Card>
        <CardHeader>
          <CardTitle>Healthcare Facilities</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center p-8">Loading facilities...</div>
          ) : facilities.length === 0 ? (
            <div className="text-center p-8 text-muted-foreground">
              <Building2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No facilities found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {facilities.map((facility) => (
                <div key={facility.id} className="flex items-start justify-between p-4 border rounded-lg">
                  <div className="space-y-2">
                    <div className="font-medium">{facility.name}</div>
                    <div className="text-sm text-muted-foreground capitalize">
                      {facility.facility_type?.replace('_', ' ')}
                    </div>
                    {facility.address && (
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <MapPin className="h-3 w-3" />
                        {facility.address}
                      </div>
                    )}
                    <div className="flex gap-4 text-sm text-muted-foreground">
                      {facility.phone && (
                        <div className="flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          {facility.phone}
                        </div>
                      )}
                      {facility.email && (
                        <div className="flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          {facility.email}
                        </div>
                      )}
                    </div>
                  </div>
                  <Badge variant={facility.is_active ? "default" : "secondary"}>
                    {facility.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Facilities;
