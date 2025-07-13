import React from 'react';
import { useTenantContext } from '@/contexts/TenantContext';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Building2, Users, ChevronDown } from 'lucide-react';

// Facility switcher component for multi-tenant users
export const FacilitySwitcher: React.FC = () => {
  const { 
    currentFacility, 
    userFacilities, 
    switchFacility, 
    isSuperAdmin, 
    isMultiTenantUser,
    isLoadingFacilities 
  } = useTenantContext();

  // Don't show switcher if user only has access to one facility
  if (!isMultiTenantUser || isLoadingFacilities) {
    return null;
  }

  return (
    <Card className="mb-4">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center text-sm">
          <Building2 className="h-4 w-4 mr-2" />
          Active Facility
          {isSuperAdmin && (
            <Badge variant="secondary" className="ml-2">Super Admin</Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Select 
          value={currentFacility?.facility_id || ''} 
          onValueChange={switchFacility}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select facility...">
              {currentFacility ? (
                <div className="flex items-center">
                  <Building2 className="h-4 w-4 mr-2" />
                  <span>{currentFacility.facility_name}</span>
                  <Badge variant="outline" className="ml-2">
                    {currentFacility.facility_type}
                  </Badge>
                </div>
              ) : (
                'No facility selected'
              )}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {userFacilities.map((facility) => (
              <SelectItem key={facility.facility_id} value={facility.facility_id}>
                <div className="flex items-center w-full">
                  <Building2 className="h-4 w-4 mr-2" />
                  <div className="flex-1">
                    <div className="font-medium">{facility.facility_name}</div>
                    <div className="text-xs text-muted-foreground">
                      {facility.facility_type} • {facility.access_level}
                    </div>
                  </div>
                  {facility.is_active && (
                    <Badge variant="default" className="ml-2">Active</Badge>
                  )}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        {currentFacility && (
          <div className="mt-2 text-xs text-muted-foreground">
            Access Level: <Badge variant="outline">{currentFacility.access_level}</Badge>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// Tenant context display component
export const TenantContextDisplay: React.FC = () => {
  const { 
    currentFacility, 
    userFacilities,
    isSuperAdmin,
    meta
  } = useTenantContext();

  return (
    <div className="space-y-2 text-sm">
      <div className="flex items-center text-muted-foreground">
        <Building2 className="h-4 w-4 mr-2" />
        Tenant Scope: <Badge variant="outline" className="ml-2">{meta.tenantScope}</Badge>
      </div>
      
      {currentFacility && (
        <div className="text-muted-foreground">
          Current: <span className="font-medium">{currentFacility.facility_name}</span>
        </div>
      )}
      
      <div className="text-muted-foreground">
        <Users className="h-4 w-4 inline mr-1" />
        Facilities: {userFacilities.length}
        {isSuperAdmin && ' (All Access)'}
      </div>
    </div>
  );
};

// Hook to check if user needs facility context for current route
export const useRequiresFacilityContext = (routePath?: string) => {
  const { currentFacility } = useTenantContext();
  
  // This would check route config to see if facility context is required
  // For now, we'll assume patient-related routes need facility context
  const requiresFacility = routePath?.includes('/patients') || 
                          routePath?.includes('/treatment');
  
  return {
    requiresFacility,
    hasFacility: !!currentFacility,
    needsSelection: requiresFacility && !currentFacility
  };
};