
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, Phone, Mail, MapPin } from 'lucide-react';

interface Facility {
  id: string;
  name: string;
  facility_type: string;
  address?: string;
  phone?: string;
  email?: string;
  is_active?: boolean;
  created_at?: string;
}

interface FacilitiesListProps {
  facilities: Facility[];
  onEditFacility: (facility: Facility) => void;
}

const FacilitiesList: React.FC<FacilitiesListProps> = ({ facilities, onEditFacility }) => {
  if (facilities.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No facilities found.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {facilities.map((facility) => (
        <div key={facility.id} className="border rounded-lg p-4 hover:bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <h3 className="font-medium text-lg">{facility.name}</h3>
                <Badge variant="outline">{facility.facility_type}</Badge>
                {facility.is_active !== false && (
                  <Badge variant="default">Active</Badge>
                )}
              </div>
              
              <div className="mt-2 space-y-1">
                {facility.address && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <MapPin className="h-4 w-4" />
                    {facility.address}
                  </div>
                )}
                {facility.phone && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Phone className="h-4 w-4" />
                    {facility.phone}
                  </div>
                )}
                {facility.email && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Mail className="h-4 w-4" />
                    {facility.email}
                  </div>
                )}
              </div>
              
              {facility.created_at && (
                <div className="mt-2 text-xs text-gray-500">
                  Created: {new Date(facility.created_at).toLocaleDateString()}
                </div>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onEditFacility(facility)}
              >
                <Edit className="h-4 w-4 mr-1" />
                Edit
              </Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default FacilitiesList;
