import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Building2, Search, RefreshCw, MapPin } from 'lucide-react';
import { useMasterAuth } from '@/hooks/useMasterAuth';
import { supabase } from '@/integrations/supabase/client';

interface Facility {
  id: string;
  name: string;
  facility_type: string;
  address?: string;
  phone?: string;
  email?: string;
  is_active: boolean;
  created_at: string;
}

const Facilities: React.FC = () => {
  const { isAuthenticated, isLoading: authLoading } = useMasterAuth();
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  console.log('🏢 Facilities Page - Direct Database Loading');

  const loadFacilities = async () => {
    if (!isAuthenticated) return;
    
    setLoading(true);
    setError(null);
    
    try {
      console.log('🔍 Loading facilities directly from database...');
      
      const { data, error: dbError } = await supabase
        .from('facilities')
        .select('*')
        .order('name');

      if (dbError) {
        console.error('❌ Database error:', dbError);
        setError(dbError.message);
        return;
      }

      const cleanFacilities = (data || []).map(facility => ({
        id: facility.id,
        name: facility.name || '',
        facility_type: facility.facility_type || '',
        address: facility.address || '',
        phone: facility.phone || '',
        email: facility.email || '',
        is_active: facility.is_active ?? true,
        created_at: facility.created_at || new Date().toISOString()
      }));

      setFacilities(cleanFacilities);
      console.log('✅ Facilities loaded successfully:', cleanFacilities.length, 'facilities');
      
    } catch (err: any) {
      console.error('💥 Exception loading facilities:', err);
      setError(err.message || 'Failed to load facilities');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated && !authLoading) {
      loadFacilities();
    }
  }, [isAuthenticated, authLoading]);

  const handleRefresh = () => {
    loadFacilities();
  };

  const filteredFacilities = facilities.filter(facility => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      facility.name.toLowerCase().includes(query) ||
      facility.facility_type.toLowerCase().includes(query) ||
      (facility.address && facility.address.toLowerCase().includes(query))
    );
  });

  // Loading state
  if (authLoading) {
    return (
      <div className="p-6">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <div className="text-muted-foreground">Authenticating...</div>
        </div>
      </div>
    );
  }

  // Not authenticated
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

  // Error state
  if (error) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="p-8 text-center">
            <div className="text-red-600 mb-4">Error loading facilities: {error}</div>
            <Button onClick={handleRefresh} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const stats = {
    totalFacilities: facilities.length,
    activeFacilities: facilities.filter(f => f.is_active).length,
    facilityTypes: [...new Set(facilities.map(f => f.facility_type))].length
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Facilities Management</h1>
        <p className="text-muted-foreground">
          Manage healthcare facilities and locations
        </p>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="text-center p-4 bg-green-50 rounded-lg">
          <div className="text-2xl font-bold text-green-600">{stats.totalFacilities}</div>
          <div className="text-sm text-green-600">Total Facilities</div>
        </div>
        <div className="text-center p-4 bg-blue-50 rounded-lg">
          <div className="text-2xl font-bold text-blue-600">{stats.activeFacilities}</div>
          <div className="text-sm text-blue-600">Active</div>
        </div>
        <div className="text-center p-4 bg-purple-50 rounded-lg">
          <div className="text-2xl font-bold text-purple-600">{stats.facilityTypes}</div>
          <div className="text-sm text-purple-600">Facility Types</div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Healthcare Facilities ({filteredFacilities.length} facilities)
            </div>
            <div className="flex items-center gap-2">
              <Button
                onClick={handleRefresh}
                variant="outline"
                size="sm"
                disabled={loading}
                className="flex items-center gap-2"
              >
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                Refresh
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
                placeholder="Search facilities by name, type, or address..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Loading state */}
            {loading && (
              <div className="text-center p-8">
                <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-green-600" />
                <div className="text-muted-foreground">Loading facilities...</div>
              </div>
            )}

            {/* Facilities List */}
            {!loading && filteredFacilities.length === 0 && (
              <div className="text-center p-8 text-muted-foreground">
                <Building2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No facilities found</p>
                {searchQuery && (
                  <p className="text-sm">Try adjusting your search terms</p>
                )}
              </div>
            )}

            {!loading && filteredFacilities.length > 0 && (
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
                        <div className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                          <MapPin className="h-3 w-3" />
                          {facility.address}
                        </div>
                      )}
                      <div className="flex gap-2 text-sm text-muted-foreground mt-1">
                        {facility.phone && <span>📞 {facility.phone}</span>}
                        {facility.email && <span>✉️ {facility.email}</span>}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={facility.is_active ? "default" : "secondary"}>
                        {facility.is_active ? "Active" : "Inactive"}
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
