
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Edit, MapPin, Phone, Mail, Building } from 'lucide-react';

interface FacilitiesListProps {
  facilities: any[];
  onEditFacility: (facility: any) => void;
}

const FacilitiesList: React.FC<FacilitiesListProps> = ({ facilities, onEditFacility }) => {
  if (facilities.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <p className="text-gray-500">No facilities found.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {facilities.map((facility) => (
        <Card key={facility.id}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <Building className="h-5 w-5 text-gray-400" />
                  <div>
                    <h3 className="font-semibold text-lg">{facility.name}</h3>
                    <Badge variant="outline" className="text-xs">
                      {facility.facility_type}
                    </Badge>
                  </div>
                </div>
                
                <div className="space-y-2 text-sm text-gray-600">
                  {facility.address && (
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      <span>{facility.address}</span>
                    </div>
                  )}
                  
                  {facility.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      <span>{facility.phone}</span>
                    </div>
                  )}
                  
                  {facility.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      <span>{facility.email}</span>
                    </div>
                  )}
                </div>

                {facility.license_number && (
                  <div className="mt-2">
                    <Badge variant="secondary" className="text-xs">
                      License: {facility.license_number}
                    </Badge>
                  </div>
                )}
              </div>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onEditFacility(facility)}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Facility
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default FacilitiesList;
