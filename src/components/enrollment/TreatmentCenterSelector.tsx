import React, { useState, useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Phone, Mail, Building2, CheckCircle, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface TreatmentCenter {
  id: string;
  name: string;
  facility_type: string;
  address: string | null;
  phone: string | null;
  email: string | null;
  npi_number: string | null;  
  is_active: boolean;
  specialty_designations: string[] | null;
  service_capabilities: string[] | null;
  advanced_therapy_certified: boolean | null;
  cart_center_designation: boolean | null;
  gene_therapy_capability: boolean | null;
  radioligand_therapy_capability: boolean | null;
  apheresis_capability: boolean | null;
  infusion_center_beds: number | null;
}

interface TreatmentCenterSelectorProps {
  value?: string;
  onValueChange: (facilityId: string, facilityData: TreatmentCenter) => void;
  collectionMethod?: string;
  required?: boolean;
  className?: string;
}

export const TreatmentCenterSelector: React.FC<TreatmentCenterSelectorProps> = ({
  value,
  onValueChange,
  collectionMethod,
  required = false,
  className = ''
}) => {
  const { toast } = useToast();
  const [facilities, setFacilities] = useState<TreatmentCenter[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFacility, setSelectedFacility] = useState<TreatmentCenter | null>(null);

  // Load treatment centers/facilities
  useEffect(() => {
    const loadFacilities = async () => {
      try {
        setLoading(true);
        
        const { data, error } = await supabase
          .from('facilities')
          .select(`
            id, name, facility_type, address, phone, email, npi_number,
            is_active, specialty_designations, service_capabilities,
            advanced_therapy_certified, cart_center_designation,
            gene_therapy_capability, radioligand_therapy_capability,
            apheresis_capability, infusion_center_beds
          `)
          .eq('is_active', true)
          .order('name');

        if (error) throw error;

        setFacilities(data || []);
        
        // If there's a selected value, find the facility
        if (value && data) {
          const facility = data.find(f => f.id === value);
          setSelectedFacility(facility || null);
        }
        
      } catch (error) {
        console.error('Error loading facilities:', error);
        toast({
          title: "Error Loading Treatment Centers",
          description: "Failed to load available treatment centers. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    loadFacilities();
  }, [value, toast]);

  const handleSelectionChange = (facilityId: string) => {
    const facility = facilities.find(f => f.id === facilityId);
    if (facility) {
      setSelectedFacility(facility);
      onValueChange(facilityId, facility);
    }
  };

  const getFacilityCapabilities = (facility: TreatmentCenter) => {
    const capabilities: string[] = [];
    
    if (facility.advanced_therapy_certified) capabilities.push('Advanced Therapy');
    if (facility.cart_center_designation) capabilities.push('CAR-T Center');
    if (facility.gene_therapy_capability) capabilities.push('Gene Therapy');
    if (facility.radioligand_therapy_capability) capabilities.push('Radioligand Therapy');
    if (facility.apheresis_capability) capabilities.push('Apheresis');
    
    if (facility.service_capabilities?.length) {
      capabilities.push(...facility.service_capabilities.slice(0, 3));
    }
    
    return capabilities.slice(0, 5); // Limit to 5 badges
  };

  const isCompatibleWithCollection = (facility: TreatmentCenter) => {
    if (!collectionMethod) return true;
    
    // Logic to determine if facility supports the collection method
    switch (collectionMethod) {
      case 'in_person':
        return facility.infusion_center_beds && facility.infusion_center_beds > 0;
      case 'mobile_collection':
        return facility.apheresis_capability;
      case 'home_collection':
        return facility.service_capabilities?.includes('Home Healthcare');
      default:
        return true;
    }
  };

  if (loading) {
    return (
      <div className="space-y-2">
        <Label>Treatment Center {required && <span className="text-destructive">*</span>}</Label>
        <div className="h-10 bg-muted animate-pulse rounded-md" />
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="space-y-2">
        <Label htmlFor="treatment-center">
          Select Treatment Center {required && <span className="text-destructive">*</span>}
        </Label>
        <Select 
          value={value || ''} 
          onValueChange={handleSelectionChange}
          required={required}
        >
          <SelectTrigger id="treatment-center">
            <SelectValue placeholder="Choose your treatment center..." />
          </SelectTrigger>
          <SelectContent>
            {facilities.map((facility) => {
              const compatible = isCompatibleWithCollection(facility);
              return (
                <SelectItem 
                  key={facility.id} 
                  value={facility.id}
                  disabled={!compatible}
                  className={!compatible ? 'opacity-50' : ''}
                >
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-2">
                      {compatible ? (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-yellow-500" />
                      )}
                      <span className="font-medium">{facility.name}</span>
                    </div>
                    <Badge variant={compatible ? 'default' : 'secondary'} className="ml-2">
                      {facility.facility_type}
                    </Badge>
                  </div>
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
      </div>

      {selectedFacility && (
        <Card className="border-l-4 border-l-primary">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Building2 className="w-5 h-5" />
              {selectedFacility.name}
              <Badge variant="outline">{selectedFacility.facility_type}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {selectedFacility.address && (
              <div className="flex items-start gap-2 text-sm">
                <MapPin className="w-4 h-4 mt-0.5 text-muted-foreground flex-shrink-0" />
                <span>{selectedFacility.address}</span>
              </div>
            )}
            
            <div className="flex gap-4 text-sm">
              {selectedFacility.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-muted-foreground" />
                  <span>{selectedFacility.phone}</span>
                </div>
              )}
              {selectedFacility.email && (
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  <span>{selectedFacility.email}</span>
                </div>
              )}
            </div>

            {selectedFacility.npi_number && (
              <div className="text-sm">
                <span className="font-medium">NPI:</span> {selectedFacility.npi_number}
              </div>
            )}

            {selectedFacility.infusion_center_beds && (
              <div className="text-sm">
                <span className="font-medium">Infusion Center Beds:</span> {selectedFacility.infusion_center_beds}
              </div>
            )}

            <div className="space-y-2">
              <div className="text-sm font-medium">Capabilities & Specialties:</div>
              <div className="flex flex-wrap gap-1">
                {getFacilityCapabilities(selectedFacility).map((capability, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {capability}
                  </Badge>
                ))}
                {selectedFacility.specialty_designations?.slice(0, 3).map((specialty, index) => (
                  <Badge key={`spec-${index}`} variant="outline" className="text-xs">
                    {specialty}
                  </Badge>
                ))}
              </div>
            </div>

            {collectionMethod && !isCompatibleWithCollection(selectedFacility) && (
              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                <div className="flex items-center gap-2 text-sm text-yellow-800">
                  <AlertCircle className="w-4 h-4" />
                  <span>This facility may not support your selected collection method ({collectionMethod})</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};