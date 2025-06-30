
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Plus, X, Building, Truck, Shield, Users, Calendar } from 'lucide-react';
import { TreatmentCenterOnboarding } from '@/types/onboarding';
import { useServices } from '@/hooks/useServices';
import { ServiceSelection, SERVICE_TYPES, THERAPY_AREAS, CAPABILITY_LEVELS } from '@/types/services';

interface ServiceSelectionStepProps {
  data: Partial<TreatmentCenterOnboarding>;
  onDataChange: (data: Partial<TreatmentCenterOnboarding>) => void;
  applicationId?: string;
}

export const ServiceSelectionStep: React.FC<ServiceSelectionStepProps> = ({
  data,
  onDataChange,
  applicationId
}) => {
  const [selectedTherapyArea, setSelectedTherapyArea] = useState('');
  const [selectedServiceType, setSelectedServiceType] = useState('');
  const [isAddingSelection, setIsAddingSelection] = useState(false);
  
  const {
    services,
    serviceProviders,
    capabilities,
    getServiceSelections,
    saveServiceSelection,
    deleteServiceSelection,
    isLoadingServices,
    isSaving
  } = useServices();

  const { data: serviceSelections = [], refetch: refetchSelections } = getServiceSelections(applicationId || '');

  const [newSelection, setNewSelection] = useState<Partial<ServiceSelection>>({
    therapy_area: '',
    service_id: '',
    selected_provider_id: '',
    selection_rationale: '',
    estimated_volume: {},
    preferred_start_date: ''
  });

  const filteredServices = services?.filter(service => 
    !selectedServiceType || service.service_type === selectedServiceType
  ) || [];

  const getCapableProviders = (serviceType: string, therapyArea: string) => {
    if (!capabilities) return [];
    
    return capabilities
      .filter(cap => 
        cap.service_type === serviceType && 
        cap.therapy_area === therapyArea &&
        cap.service_provider
      )
      .sort((a, b) => {
        // Sort by preference and capability level
        if (a.is_preferred && !b.is_preferred) return -1;
        if (!a.is_preferred && b.is_preferred) return 1;
        
        const levelOrder = { 'specialized': 3, 'advanced': 2, 'basic': 1 };
        return (levelOrder[b.capability_level] || 0) - (levelOrder[a.capability_level] || 0);
      });
  };

  const handleAddSelection = () => {
    if (!applicationId || !newSelection.service_id || !newSelection.selected_provider_id || !newSelection.therapy_area) {
      return;
    }

    saveServiceSelection({
      ...newSelection,
      onboarding_id: applicationId,
    } as ServiceSelection);

    // Reset form
    setNewSelection({
      therapy_area: '',
      service_id: '',
      selected_provider_id: '',
      selection_rationale: '',
      estimated_volume: {},
      preferred_start_date: ''
    });
    setIsAddingSelection(false);
    setSelectedTherapyArea('');
    setSelectedServiceType('');
  };

  const handleRemoveSelection = (selectionId: string) => {
    if (!applicationId) return;
    deleteServiceSelection({ id: selectionId, onboardingId: applicationId });
  };

  const selectedService = services?.find(s => s.id === newSelection.service_id);
  const capableProviders = newSelection.therapy_area && selectedService?.service_type
    ? getCapableProviders(selectedService.service_type, newSelection.therapy_area)
    : [];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center space-x-2">
              <Building className="h-5 w-5" />
              <span>Service Provider Selection</span>
            </span>
            <Button onClick={() => setIsAddingSelection(true)} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Service
            </Button>
          </CardTitle>
          <CardDescription>
            Select service providers for different CGAT therapy areas and distribution services.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Current Selections */}
          {serviceSelections.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Selected Services</h3>
              {serviceSelections.map((selection) => (
                <Card key={selection.id} className="border-l-4 border-l-green-500">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <div className="flex items-center space-x-2">
                      <Badge variant="secondary">{selection.therapy_area}</Badge>
                      <Badge variant="outline">
                        {SERVICE_TYPES[selection.service?.service_type as keyof typeof SERVICE_TYPES]}
                      </Badge>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveSelection(selection.id!)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm font-medium">Service</Label>
                        <p className="text-sm">{selection.service?.name}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Provider</Label>
                        <p className="text-sm">{selection.service_provider?.name}</p>
                      </div>
                      {selection.selection_rationale && (
                        <div className="md:col-span-2">
                          <Label className="text-sm font-medium">Rationale</Label>
                          <p className="text-sm text-muted-foreground">{selection.selection_rationale}</p>
                        </div>
                      )}
                      {selection.preferred_start_date && (
                        <div>
                          <Label className="text-sm font-medium">Preferred Start Date</Label>
                          <p className="text-sm">{selection.preferred_start_date}</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Add New Selection Form */}
          {isAddingSelection && (
            <Card className="border-2 border-blue-200">
              <CardHeader>
                <CardTitle className="text-base">Add New Service Selection</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Therapy Area *</Label>
                    <Select
                      value={newSelection.therapy_area}
                      onValueChange={(value) => {
                        setSelectedTherapyArea(value);
                        setNewSelection({ ...newSelection, therapy_area: value });
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select therapy area" />
                      </SelectTrigger>
                      <SelectContent>
                        {THERAPY_AREAS.map((area) => (
                          <SelectItem key={area} value={area}>
                            {area}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Service Type</Label>
                    <Select
                      value={selectedServiceType}
                      onValueChange={(value) => {
                        setSelectedServiceType(value);
                        setNewSelection({ ...newSelection, service_id: '' });
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Filter by service type" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(SERVICE_TYPES).map(([key, label]) => (
                          <SelectItem key={key} value={key}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label>Service *</Label>
                  <Select
                    value={newSelection.service_id}
                    onValueChange={(value) => {
                      setNewSelection({ ...newSelection, service_id: value, selected_provider_id: '' });
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select service" />
                    </SelectTrigger>
                    <SelectContent>
                      {filteredServices.map((service) => (
                        <SelectItem key={service.id} value={service.id}>
                          <div className="flex items-center space-x-2">
                            <span>{service.name}</span>
                            <Badge variant="outline" className="text-xs">
                              {SERVICE_TYPES[service.service_type]}
                            </Badge>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {capableProviders.length > 0 && (
                  <div>
                    <Label>Service Provider *</Label>
                    <Select
                      value={newSelection.selected_provider_id}
                      onValueChange={(value) => setNewSelection({ ...newSelection, selected_provider_id: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select provider" />
                      </SelectTrigger>
                      <SelectContent>
                        {capableProviders.map((capability) => (
                          <SelectItem key={capability.service_provider_id} value={capability.service_provider_id}>
                            <div className="flex items-center space-x-2">
                              <span>{capability.service_provider?.name}</span>
                              <Badge 
                                variant={capability.is_preferred ? "default" : "secondary"}
                                className="text-xs"
                              >
                                {CAPABILITY_LEVELS[capability.capability_level]}
                              </Badge>
                              {capability.is_preferred && (
                                <Badge variant="default" className="text-xs">Preferred</Badge>
                              )}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div>
                  <Label>Selection Rationale</Label>
                  <Textarea
                    value={newSelection.selection_rationale}
                    onChange={(e) => setNewSelection({ ...newSelection, selection_rationale: e.target.value })}
                    placeholder="Why did you choose this service provider?"
                    rows={3}
                  />
                </div>

                <div>
                  <Label>Preferred Start Date</Label>
                  <Input
                    type="date"
                    value={newSelection.preferred_start_date}
                    onChange={(e) => setNewSelection({ ...newSelection, preferred_start_date: e.target.value })}
                  />
                </div>

                <div className="flex space-x-2">
                  <Button 
                    onClick={handleAddSelection}
                    disabled={!newSelection.service_id || !newSelection.selected_provider_id || !newSelection.therapy_area || isSaving}
                  >
                    {isSaving ? 'Adding...' : 'Add Selection'}
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setIsAddingSelection(false);
                      setNewSelection({
                        therapy_area: '',
                        service_id: '',
                        selected_provider_id: '',
                        selection_rationale: '',
                        estimated_volume: {},
                        preferred_start_date: ''
                      });
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {serviceSelections.length === 0 && !isAddingSelection && (
            <div className="text-center py-8 text-muted-foreground">
              <Building className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No service selections configured yet.</p>
              <p className="text-sm">Add services to begin setting up your distribution network.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Service Overview */}
      {serviceSelections.length > 0 && (
        <Card className="bg-green-50 border-green-200">
          <CardHeader>
            <CardTitle className="text-green-900">Service Selection Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <Truck className="h-8 w-8 mx-auto mb-2 text-green-600" />
                <h4 className="font-medium text-green-900">Services Selected</h4>
                <p className="text-2xl font-bold text-green-700">{serviceSelections.length}</p>
              </div>
              <div className="text-center">
                <Shield className="h-8 w-8 mx-auto mb-2 text-green-600" />
                <h4 className="font-medium text-green-900">Therapy Areas</h4>
                <p className="text-2xl font-bold text-green-700">
                  {new Set(serviceSelections.map(s => s.therapy_area)).size}
                </p>
              </div>
              <div className="text-center">
                <Users className="h-8 w-8 mx-auto mb-2 text-green-600" />
                <h4 className="font-medium text-green-900">Providers</h4>
                <p className="text-2xl font-bold text-green-700">
                  {new Set(serviceSelections.map(s => s.selected_provider_id)).size}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
