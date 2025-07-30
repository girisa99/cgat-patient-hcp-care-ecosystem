/**
 * ADDITIONAL STEP COMPONENTS - Service selection, therapy selection, and other specialized steps
 */
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Building, Users, CreditCard, FileText, Clock, Stethoscope, Settings, Globe, Package, Truck, X, CheckCircle, Plus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { SERVICE_TYPES } from '@/types/services';

// Types for database entities
interface Therapy {
  id: string;
  name: string;
  therapy_type: string;
  indication: string;
  description: string;
}

interface Service {
  id: string;
  name: string;
  service_type: string;
  description: string;
  service_provider_id: string;
}

interface TherapySelection {
  therapy_id: string;
  therapy_name: string;
  selection_rationale: string;
  priority_level: 'high' | 'medium' | 'low';
  patient_volume_estimate: number;
}

interface ServiceSelection {
  service_id: string;
  service_name: string;
  therapy_area: string;
  selection_rationale: string;
  custom_requirements: any;
}

// DISTRIBUTOR SELECTION STEP
export const DistributorSelectionStep = ({ formData, updateFormData }: any) => {
  const distributors = [
    {
      id: 'amerisource_bergen',
      name: 'AmerisourceBergen',
      description: 'Leading pharmaceutical distribution and healthcare services company',
      specialties: ['Pharmaceuticals', 'Specialty Medicines', 'Oncology', 'Rare Diseases'],
      coverage: 'National',
      logo: '🏥'
    },
    {
      id: 'cardinal_health', 
      name: 'Cardinal Health',
      description: 'Healthcare services and products company serving hospitals and pharmacies',
      specialties: ['Medical Supplies', 'Pharmaceuticals', 'Laboratory Products', 'Surgery'],
      coverage: 'National',
      logo: '⚕️'
    },
    {
      id: 'mckesson',
      name: 'McKesson Corporation', 
      description: 'Healthcare supply chain management solutions and pharmaceutical distribution',
      specialties: ['Pharmaceuticals', 'Medical-Surgical', 'Health Technology', 'Retail'],
      coverage: 'National',
      logo: '🚛'
    }
  ];

  const selectedDistributors = formData.selected_distributors || [];

  const handleDistributorToggle = (distributorId: string) => {
    const updated = selectedDistributors.includes(distributorId)
      ? selectedDistributors.filter((id: string) => id !== distributorId)
      : [...selectedDistributors, distributorId];
    
    updateFormData('selected_distributors', updated);
  };

  return (
    <div className="space-y-6">
      <div className="p-4 border rounded-lg bg-blue-50">
        <h4 className="font-medium mb-2 text-blue-900">Distribution Partnership Selection</h4>
        <p className="text-sm text-blue-800">
          Select the distribution partners you would like to work with. You can choose multiple distributors 
          to ensure optimal coverage and competitive pricing for your treatment center.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {distributors.map((distributor) => (
          <div
            key={distributor.id}
            className={`p-6 border-2 rounded-lg cursor-pointer transition-all ${
              selectedDistributors.includes(distributor.id)
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
            onClick={() => handleDistributorToggle(distributor.id)}
          >
            <div className="flex items-start space-x-4">
              <div className="text-3xl">{distributor.logo}</div>
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <Checkbox
                    id={distributor.id}
                    checked={selectedDistributors.includes(distributor.id)}
                    onChange={() => handleDistributorToggle(distributor.id)}
                  />
                  <h5 className="font-semibold text-lg">{distributor.name}</h5>
                  <span className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded-full">
                    {distributor.coverage}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-3">{distributor.description}</p>
                <div className="flex flex-wrap gap-2">
                  {distributor.specialties.map((specialty, index) => (
                    <span
                      key={index}
                      className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded-full"
                    >
                      {specialty}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {selectedDistributors.length > 0 && (
        <div className="p-4 border rounded-lg bg-green-50">
          <h4 className="font-medium mb-2 text-green-900">Selected Distribution Partners</h4>
          <div className="flex flex-wrap gap-2">
            {selectedDistributors.map((distributorId: string) => {
              const distributor = distributors.find(d => d.id === distributorId);
              return distributor ? (
                <span
                  key={distributorId}
                  className="inline-flex items-center px-3 py-1 bg-green-200 text-green-800 rounded-full text-sm"
                >
                  {distributor.logo} {distributor.name}
                </span>
              ) : null;
            })}
          </div>
          <p className="text-sm text-green-700 mt-2">
            Great choice! Your selected partners will provide comprehensive coverage for your treatment center's needs.
          </p>
        </div>
      )}

      <div className="p-4 border rounded-lg">
        <h4 className="font-medium mb-3">Distribution Preferences</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="preferred_delivery_schedule">Preferred Delivery Schedule</Label>
            <select
              id="preferred_delivery_schedule"
              className="w-full px-3 py-2 border rounded-md bg-background"
            >
              <option value="">Select delivery schedule</option>
              <option value="daily">Daily Delivery</option>
              <option value="weekly">Weekly Delivery</option>
              <option value="bi_weekly">Bi-weekly Delivery</option>
              <option value="monthly">Monthly Delivery</option>
              <option value="on_demand">On-Demand</option>
            </select>
          </div>
          <div>
            <Label htmlFor="emergency_delivery_required">Emergency Delivery Capability</Label>
            <select
              id="emergency_delivery_required"
              className="w-full px-3 py-2 border rounded-md bg-background"
            >
              <option value="">Select requirement</option>
              <option value="same_day">Same Day Delivery</option>
              <option value="next_day">Next Day Delivery</option>
              <option value="48_hours">Within 48 Hours</option>
              <option value="not_required">Not Required</option>
            </select>
          </div>
        </div>
      </div>

      <div className="p-4 border rounded-lg">
        <h4 className="font-medium mb-3">Special Distribution Requirements</h4>
        <Textarea
          placeholder="Describe any special requirements for product distribution, storage, handling, or delivery logistics..."
          rows={3}
        />
      </div>
    </div>
  );
};

// ENHANCED THERAPY SELECTION STEP
export const DetailedTherapySelectionStep = ({ formData, updateFormData }: any) => {
  const [therapies, setTherapies] = useState<Therapy[]>([]);
  const [loading, setLoading] = useState(true);
  const [rawTherapySelections, setRawTherapySelections] = useState<TherapySelection[]>(
    formData.therapy_selections || []
  );

  // Convert object-like arrays to proper arrays
  const therapySelections = React.useMemo(() => {
    if (!rawTherapySelections) return [];
    if (Array.isArray(rawTherapySelections)) return rawTherapySelections;
    
    // Handle object with numeric keys (common when data comes from forms or storage)
    if (typeof rawTherapySelections === 'object') {
      const keys = Object.keys(rawTherapySelections);
      if (keys.every(key => !isNaN(Number(key)))) {
        return Object.values(rawTherapySelections) as TherapySelection[];
      }
    }
    
    console.warn('therapySelections is not in expected format:', rawTherapySelections);
    return [];
  }, [rawTherapySelections]);

  useEffect(() => {
    fetchTherapies();
  }, []);

  const fetchTherapies = async () => {
    try {
      const { data, error } = await supabase
        .from('therapies')
        .select('id, name, therapy_type, indication, description')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      setTherapies(data || []);
    } catch (error) {
      console.error('Error fetching therapies:', error);
      toast({
        title: "Error",
        description: "Failed to load therapy options",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleTherapyToggle = (therapy: Therapy) => {
    if (!Array.isArray(therapySelections)) {
      console.error('therapySelections is not an array:', therapySelections);
      return;
    }
    
    const existingIndex = therapySelections.findIndex(t => t.therapy_id === therapy.id);
    
    if (existingIndex >= 0) {
      // Remove therapy
      const updated = therapySelections.filter(t => t.therapy_id !== therapy.id);
      setRawTherapySelections(updated);
      updateFormData('therapy_selections', updated);
    } else {
      // Add therapy with default values
      const newSelection: TherapySelection = {
        therapy_id: therapy.id,
        therapy_name: therapy.name,
        selection_rationale: '',
        priority_level: 'medium',
        patient_volume_estimate: 0
      };
      const updated = [...therapySelections, newSelection];
      setRawTherapySelections(updated);
      updateFormData('therapy_selections', updated);
    }
  };

  const updateTherapySelection = (therapyId: string, field: keyof TherapySelection, value: any) => {
    if (!Array.isArray(therapySelections)) {
      console.error('therapySelections is not an array:', therapySelections);
      return;
    }
    
    const updated = therapySelections.map(selection =>
      selection.therapy_id === therapyId ? { ...selection, [field]: value } : selection
    );
    setRawTherapySelections(updated);
    updateFormData('therapy_selections', updated);
  };

  const getTherapyTypeColor = (type: string) => {
    const colors = {
      cell_therapy: 'bg-blue-100 text-blue-800',
      gene_therapy: 'bg-green-100 text-green-800',
      car_t_cell: 'bg-purple-100 text-purple-800',
      immunotherapy: 'bg-orange-100 text-orange-800',
      default: 'bg-gray-100 text-gray-800'
    };
    return colors[type as keyof typeof colors] || colors.default;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2">Loading therapy options...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="p-4 border rounded-lg bg-blue-50">
        <h4 className="font-medium mb-2 text-blue-900">Therapy Area Selection</h4>
        <p className="text-sm text-blue-800">
          Select the therapeutic areas that your treatment center will focus on. This helps us understand 
          your clinical capabilities and match you with appropriate products and services.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {therapies.map((therapy) => {
          const isSelected = Array.isArray(therapySelections) && therapySelections.some(s => s.therapy_id === therapy.id);
          const selection = Array.isArray(therapySelections) && therapySelections.find(s => s.therapy_id === therapy.id);
          
          return (
            <div
              key={therapy.id}
              className={`p-4 border-2 rounded-lg transition-all ${
                isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-start space-x-3">
                <Checkbox
                  id={therapy.id}
                  checked={isSelected}
                  onCheckedChange={() => handleTherapyToggle(therapy)}
                  className="mt-1"
                />
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <Label htmlFor={therapy.id} className="font-medium cursor-pointer">
                      {therapy.name}
                    </Label>
                    <span className={`text-xs px-2 py-1 rounded-full ${getTherapyTypeColor(therapy.therapy_type)}`}>
                      {therapy.therapy_type.replace('_', ' ').toUpperCase()}
                    </span>
                  </div>
                  {therapy.indication && (
                    <p className="text-sm text-gray-600 mb-2">
                      <strong>Indication:</strong> {therapy.indication}
                    </p>
                  )}
                  {therapy.description && (
                    <p className="text-sm text-gray-600 mb-3">{therapy.description}</p>
                  )}
                  
                  {isSelected && (
                    <div className="mt-4 p-3 bg-white border rounded-lg space-y-3">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <Label htmlFor={`priority_${therapy.id}`}>Priority Level</Label>
                          <select
                            id={`priority_${therapy.id}`}
                            value={selection?.priority_level || 'medium'}
                            onChange={(e) => updateTherapySelection(therapy.id, 'priority_level', e.target.value as 'high' | 'medium' | 'low')}
                            className="w-full px-3 py-2 border rounded-md bg-background"
                          >
                            <option value="high">High Priority</option>
                            <option value="medium">Medium Priority</option>
                            <option value="low">Low Priority</option>
                          </select>
                        </div>
                        <div>
                          <Label htmlFor={`volume_${therapy.id}`}>Estimated Annual Patient Volume</Label>
                          <Input
                            id={`volume_${therapy.id}`}
                            type="number"
                            value={selection?.patient_volume_estimate || 0}
                            onChange={(e) => updateTherapySelection(therapy.id, 'patient_volume_estimate', parseInt(e.target.value) || 0)}
                            placeholder="Number of patients"
                            min="0"
                          />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor={`rationale_${therapy.id}`}>Selection Rationale</Label>
                        <Textarea
                          id={`rationale_${therapy.id}`}
                          value={selection?.selection_rationale || ''}
                          onChange={(e) => updateTherapySelection(therapy.id, 'selection_rationale', e.target.value)}
                          placeholder="Why is this therapy area important for your treatment center?"
                          rows={2}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {Array.isArray(therapySelections) && therapySelections.length > 0 && (
        <div className="p-4 border rounded-lg bg-green-50">
          <h4 className="font-medium mb-2 text-green-900">Selected Therapy Areas</h4>
          <div className="flex flex-wrap gap-2">
            {therapySelections.map((selection) => (
              <span
                key={selection.therapy_id}
                className="inline-flex items-center px-3 py-1 bg-green-200 text-green-800 rounded-full text-sm"
              >
                {selection.therapy_name}
                <span className="ml-1 text-xs">({selection.priority_level})</span>
              </span>
            ))}
          </div>
          <p className="text-sm text-green-700 mt-2">
            {Array.isArray(therapySelections) ? therapySelections.length : 0} therapy area{(Array.isArray(therapySelections) ? therapySelections.length : 0) !== 1 ? 's' : ''} selected for your treatment center.
          </p>
        </div>
      )}
    </div>
  );
};

// ENHANCED SERVICE SELECTION STEP
export const DetailedServiceSelectionStep = ({ formData, updateFormData }: any) => {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [serviceSelections, setServiceSelections] = useState<ServiceSelection[]>(
    formData.service_selections || []
  );
  const [showAddServiceForm, setShowAddServiceForm] = useState<string | null>(null);
  const [newServiceData, setNewServiceData] = useState({
    name: '',
    description: '',
    service_type: ''
  });

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const { data, error } = await supabase
        .from('services')
        .select(`
          id, 
          name, 
          service_type, 
          description,
          service_provider_id
        `)
        .eq('is_active', true)
        .order('service_type, name');

      if (error) throw error;
      setServices(data || []);
    } catch (error) {
      console.error('Error fetching services:', error);
      toast({
        title: "Error",
        description: "Failed to load service options",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleServiceToggle = (service: Service) => {
    const existingIndex = serviceSelections.findIndex(s => s.service_id === service.id);
    
    if (existingIndex >= 0) {
      // Remove service
      const updated = serviceSelections.filter(s => s.service_id !== service.id);
      setServiceSelections(updated);
      updateFormData('service_selections', updated);
    } else {
      // Add service with default values
      const newSelection: ServiceSelection = {
        service_id: service.id,
        service_name: service.name,
        therapy_area: '',
        selection_rationale: '',
        custom_requirements: {}
      };
      const updated = [...serviceSelections, newSelection];
      setServiceSelections(updated);
      updateFormData('service_selections', updated);
    }
  };

  const updateServiceSelection = (serviceId: string, field: keyof ServiceSelection, value: any) => {
    const updated = serviceSelections.map(selection =>
      selection.service_id === serviceId ? { ...selection, [field]: value } : selection
    );
    setServiceSelections(updated);
    updateFormData('service_selections', updated);
  };

  const handleAddNewService = async () => {
    if (!newServiceData.name.trim() || !newServiceData.service_type) {
      toast({
        title: "Validation Error",
        description: "Please fill in service name and select a type",
        variant: "destructive"
      });
      return;
    }

    try {
      const { data, error } = await supabase
        .from('services')
        .insert([{
          name: newServiceData.name.trim(),
          description: newServiceData.description.trim(),
          service_type: newServiceData.service_type as '3pl' | 'specialty_distribution' | 'specialty_pharmacy' | 'order_management' | 'patient_hub_services',
          is_active: true,
          requirements: {},
          pricing_model: {},
          sla_requirements: {}
        }])
        .select()
        .single();

      if (error) throw error;

      // Add to local services state
      setServices(prev => [...prev, data]);
      
      // Reset form
      setNewServiceData({ name: '', description: '', service_type: '' });
      setShowAddServiceForm(null);
      
      toast({
        title: "Success",
        description: `${data.name} has been added successfully`,
      });
      
    } catch (error) {
      console.error('Error adding service:', error);
      toast({
        title: "Error",
        description: "Failed to add new service",
        variant: "destructive"
      });
    }
  };

  const getServiceTypeColor = (type: string) => {
    const colors = {
      '3pl': 'bg-blue-100 text-blue-800',
      specialty_distribution: 'bg-green-100 text-green-800',
      specialty_pharmacy: 'bg-purple-100 text-purple-800',
      order_management: 'bg-orange-100 text-orange-800',
      patient_hub_services: 'bg-pink-100 text-pink-800',
      default: 'bg-gray-100 text-gray-800'
    };
    return colors[type as keyof typeof colors] || colors.default;
  };

  // Create complete service type groups including empty ones
  const allServiceTypes = Object.keys(SERVICE_TYPES) as Array<keyof typeof SERVICE_TYPES>;
  const groupedServices = allServiceTypes.reduce((acc, serviceType) => {
    acc[serviceType] = services.filter(service => service.service_type === serviceType);
    return acc;
  }, {} as Record<string, Service[]>);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2">Loading service options...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="p-4 border rounded-lg bg-green-50">
        <h4 className="font-medium mb-2 text-green-900">Service Selection</h4>
        <p className="text-sm text-green-800">
          Choose the services that will support your treatment center operations using the dropdown below.
        </p>
      </div>

      {/* Dropdown Service Selection */}
      <div className="space-y-4">
        <Label htmlFor="service-dropdown">Add Service</Label>
        <Select onValueChange={(serviceId) => {
          const service = services.find(s => s.id === serviceId);
          if (service && !serviceSelections.some(s => s.service_id === serviceId)) {
            handleServiceToggle(service);
          }
        }}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select a service to add..." />
          </SelectTrigger>
          <SelectContent className="max-h-[300px] bg-background border border-border shadow-lg z-50">
            {Object.entries(groupedServices).map(([serviceType, serviceList]) => (
              <div key={serviceType}>
                <div className="px-3 py-2 text-sm font-medium text-muted-foreground border-b flex items-center justify-between">
                  <span>{SERVICE_TYPES[serviceType as keyof typeof SERVICE_TYPES] || serviceType.replace('_', ' ')}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setNewServiceData({ ...newServiceData, service_type: serviceType });
                      setShowAddServiceForm(serviceType);
                    }}
                    className="h-6 px-2 text-xs hover:bg-accent"
                  >
                    + Add New
                  </Button>
                </div>
                {serviceList.length > 0 ? serviceList.map((service) => {
                  const isSelected = serviceSelections.some(s => s.service_id === service.id);
                  return (
                    <SelectItem 
                      key={service.id} 
                      value={service.id}
                      disabled={isSelected}
                      className="focus:bg-accent focus:text-accent-foreground"
                    >
                      <div className="flex items-center justify-between w-full">
                        <div className="flex flex-col min-w-0 flex-1">
                          <span className="font-medium truncate">{service.name}</span>
                          {service.description && (
                            <span className="text-xs text-muted-foreground truncate">{service.description}</span>
                          )}
                        </div>
                        {isSelected && <CheckCircle className="h-4 w-4 text-primary ml-2 flex-shrink-0" />}
                      </div>
                    </SelectItem>
                  );
                }) : (
                  <div className="px-3 py-2 text-sm text-muted-foreground italic">
                    No services available. Click "Add New" above to create one.
                  </div>
                )}
              </div>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Selected Services Display */}
      {serviceSelections.length > 0 && (
        <div className="space-y-4">
          <h4 className="font-medium text-lg">Selected Services</h4>
          {serviceSelections.map((selection) => {
            const service = services.find(s => s.id === selection.service_id);
            if (!service) return null;
            
            return (
              <div key={selection.service_id} className="p-4 border rounded-lg bg-green-50">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <span className={`px-3 py-1 rounded-full text-sm ${getServiceTypeColor(service.service_type)}`}>
                      {SERVICE_TYPES[service.service_type as keyof typeof SERVICE_TYPES] || service.service_type}
                    </span>
                    <h5 className="font-medium">{service.name}</h5>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleServiceToggle(service)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                
                {service.description && (
                  <p className="text-sm text-gray-600 mb-3">{service.description}</p>
                )}
                
                <div className="space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor={`therapy_area_${service.id}`}>Related Therapy Area</Label>
                      <Input
                        id={`therapy_area_${service.id}`}
                        value={selection?.therapy_area || ''}
                        onChange={(e) => updateServiceSelection(service.id, 'therapy_area', e.target.value)}
                        placeholder="e.g., Oncology, Cardiology"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor={`service_rationale_${service.id}`}>Selection Rationale</Label>
                    <Textarea
                      id={`service_rationale_${service.id}`}
                      value={selection?.selection_rationale || ''}
                      onChange={(e) => updateServiceSelection(service.id, 'selection_rationale', e.target.value)}
                      placeholder="Why do you need this service for your treatment center?"
                      rows={2}
                    />
                  </div>
                </div>
              </div>
            );
          })}
          
          <div className="p-4 border rounded-lg bg-blue-50">
            <p className="text-sm text-blue-700">
              {serviceSelections.length} service{serviceSelections.length !== 1 ? 's' : ''} selected for your treatment center.
            </p>
          </div>
        </div>
      )}
      
      {/* Add Service Dialog */}
      <Dialog open={!!showAddServiceForm} onOpenChange={() => setShowAddServiceForm(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Add New {showAddServiceForm ? SERVICE_TYPES[showAddServiceForm as keyof typeof SERVICE_TYPES] : ''} Service
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="new-service-name">Service Name</Label>
              <Input
                id="new-service-name"
                value={newServiceData.name}
                onChange={(e) => setNewServiceData({ ...newServiceData, name: e.target.value })}
                placeholder="Enter service name"
              />
            </div>
            <div>
              <Label htmlFor="new-service-description">Description (Optional)</Label>
              <Textarea
                id="new-service-description"
                value={newServiceData.description}
                onChange={(e) => setNewServiceData({ ...newServiceData, description: e.target.value })}
                placeholder="Enter service description"
                rows={3}
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowAddServiceForm(null)}>
                Cancel
              </Button>
              <Button onClick={handleAddNewService}>
                Add Service
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

// ONLINE SERVICES STEP
export const DetailedOnlineServicesStep = ({ formData, updateFormData }: any) => (
  <div className="space-y-6">
    <div className="p-4 border rounded-lg">
      <h4 className="font-medium mb-3">Online Platform Services</h4>
      <p className="text-sm text-muted-foreground mb-4">
        Select the online services you would like to access.
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[
          'Online Ordering', 'Invoice Management', 'Account Analytics', 'Inventory Tracking',
          'Contract Management', 'Product Catalog', 'Price Lists', 'Order History',
          'Statement Downloads', 'Credit Application Status', 'Return Processing', 'Support Portal'
        ].map((service) => (
          <div key={service} className="flex items-center space-x-2 p-2 border rounded">
            <Checkbox id={`online_${service.toLowerCase().replace(/[^a-z]/g, '_')}`} />
            <Label htmlFor={`online_${service.toLowerCase().replace(/[^a-z]/g, '_')}`} className="text-sm">
              {service}
            </Label>
          </div>
        ))}
      </div>
    </div>

    <div className="p-4 border rounded-lg">
      <h4 className="font-medium mb-3">Platform Users</h4>
      <p className="text-sm text-muted-foreground mb-4">
        Add users who will need access to the online platform.
      </p>
      
      <div className="space-y-4">
        {[1, 2, 3].map((user) => (
          <div key={user} className="grid grid-cols-1 md:grid-cols-4 gap-3 p-3 border rounded">
            <div>
              <Label htmlFor={`user_${user}_name`}>Name</Label>
              <Input
                id={`user_${user}_name`}
                placeholder="User full name"
              />
            </div>
            <div>
              <Label htmlFor={`user_${user}_email`}>Email</Label>
              <Input
                id={`user_${user}_email`}
                type="email"
                placeholder="user@facility.com"
              />
            </div>
            <div>
              <Label htmlFor={`user_${user}_role`}>Role</Label>
              <select 
                id={`user_${user}_role`}
                className="w-full px-3 py-2 border rounded-md bg-background"
              >
                <option value="">Select role</option>
                <option value="administrator">Administrator</option>
                <option value="purchasing">Purchasing Manager</option>
                <option value="finance">Finance/Billing</option>
                <option value="clinical">Clinical Staff</option>
                <option value="viewer">View Only</option>
              </select>
            </div>
            <div>
              <Label htmlFor={`user_${user}_department`}>Department</Label>
              <Input
                id={`user_${user}_department`}
                placeholder="Department"
              />
            </div>
          </div>
        ))}
        <Button variant="outline" className="w-full">
          <Users className="h-4 w-4 mr-2" />
          Add Platform User
        </Button>
      </div>
    </div>

    <div className="p-4 border rounded-lg bg-green-50">
      <h4 className="font-medium mb-2">Platform Access Benefits</h4>
      <p className="text-sm text-green-800">
        🌐 Online platform access provides 24/7 ordering, real-time inventory tracking, 
        detailed analytics, and streamlined account management.
      </p>
    </div>
  </div>
);

// PURCHASING PREFERENCES STEP
export const DetailedPurchasingPreferencesStep = ({ formData, updateFormData }: any) => (
  <div className="space-y-6">
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="p-4 border rounded-lg">
        <h4 className="font-medium mb-3">Preferred Purchasing Methods</h4>
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <Checkbox id="just_in_time" />
            <Label htmlFor="just_in_time">Just-in-Time Delivery</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox id="bulk_ordering" />
            <Label htmlFor="bulk_ordering">Bulk Ordering</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox id="consignment" />
            <Label htmlFor="consignment">Consignment</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox id="drop_ship" />
            <Label htmlFor="drop_ship">Drop Ship</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox id="blanket_orders" />
            <Label htmlFor="blanket_orders">Blanket Orders</Label>
          </div>
        </div>
      </div>
      
      <div className="p-4 border rounded-lg">
        <h4 className="font-medium mb-3">Inventory Management</h4>
        <div className="space-y-3">
          <div>
            <Label htmlFor="inventory_model">Preferred Inventory Model</Label>
            <select 
              id="inventory_model"
              className="w-full px-3 py-2 border rounded-md bg-background"
            >
              <option value="">Select model</option>
              <option value="traditional_wholesale">Traditional Wholesale</option>
              <option value="consignment">Consignment</option>
              <option value="vendor_managed">Vendor Managed</option>
              <option value="drop_ship_only">Drop Ship Only</option>
              <option value="hybrid">Hybrid</option>
            </select>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox id="automated_reordering" />
            <Label htmlFor="automated_reordering">Enable Automated Reordering</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox id="temperature_controlled" />
            <Label htmlFor="temperature_controlled">Temperature Controlled Storage</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox id="hazmat_storage" />
            <Label htmlFor="hazmat_storage">Hazmat Storage Capabilities</Label>
          </div>
        </div>
      </div>
    </div>
    
    <div className="p-4 border rounded-lg">
      <h4 className="font-medium mb-3">Order Frequency & Volume</h4>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <Label htmlFor="preferred_order_frequency">Preferred Order Frequency</Label>
          <select 
            id="preferred_order_frequency"
            className="w-full px-3 py-2 border rounded-md bg-background"
          >
            <option value="">Select frequency</option>
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="bi_weekly">Bi-weekly</option>
            <option value="monthly">Monthly</option>
            <option value="as_needed">As Needed</option>
          </select>
        </div>
        <div>
          <Label htmlFor="storage_capacity">Storage Capacity (sq ft)</Label>
          <Input
            id="storage_capacity"
            type="number"
            placeholder="5000"
            min="0"
          />
        </div>
        <div>
          <Label htmlFor="delivery_dock_access">Delivery Dock Access</Label>
          <select 
            id="delivery_dock_access"
            className="w-full px-3 py-2 border rounded-md bg-background"
          >
            <option value="">Select access type</option>
            <option value="full_dock">Full Loading Dock</option>
            <option value="ground_level">Ground Level</option>
            <option value="stairs_required">Stairs Required</option>
            <option value="elevator_required">Elevator Required</option>
          </select>
        </div>
      </div>
    </div>

    <div className="p-4 border rounded-lg">
      <h4 className="font-medium mb-3">Special Requirements</h4>
      <Textarea
        placeholder="Describe any special purchasing requirements, delivery restrictions, or handling needs..."
        rows={3}
      />
    </div>
  </div>
);

// TECHNOLOGY INTEGRATION STEP
export const DetailedTechnologyIntegrationStep = ({ formData, updateFormData }: any) => (
  <div className="space-y-6">
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="p-4 border rounded-lg">
        <h4 className="font-medium mb-3">Current Systems</h4>
        <div className="space-y-3">
          <div>
            <Label htmlFor="emr_system">EMR System</Label>
            <Input
              id="emr_system"
              placeholder="e.g., Epic, Cerner, Allscripts"
            />
          </div>
          <div>
            <Label htmlFor="inventory_system">Inventory Management System</Label>
            <Input
              id="inventory_system"
              placeholder="e.g., RFID, Barcode scanning"
            />
          </div>
          <div>
            <Label htmlFor="erp_system">ERP System</Label>
            <Input
              id="erp_system"
              placeholder="e.g., SAP, Oracle, Microsoft"
            />
          </div>
          <div>
            <Label htmlFor="pharmacy_system">Pharmacy System</Label>
            <Input
              id="pharmacy_system"
              placeholder="e.g., Pyxis, Omnicell"
            />
          </div>
        </div>
      </div>
      
      <div className="p-4 border rounded-lg">
        <h4 className="font-medium mb-3">Integration Requirements</h4>
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <Checkbox id="api_integration" />
            <Label htmlFor="api_integration">API Integration Required</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox id="edi_integration" />
            <Label htmlFor="edi_integration">EDI Integration</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox id="real_time_sync" />
            <Label htmlFor="real_time_sync">Real-time Data Synchronization</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox id="single_sign_on" />
            <Label htmlFor="single_sign_on">Single Sign-On (SSO)</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox id="automated_ordering" />
            <Label htmlFor="automated_ordering">Automated Ordering</Label>
          </div>
        </div>
      </div>
    </div>
    
    <div className="p-4 border rounded-lg">
      <h4 className="font-medium mb-3">Technical Contact</h4>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <Label htmlFor="tech_contact_name">Technical Contact Name</Label>
          <Input
            id="tech_contact_name"
            placeholder="IT Manager or Technical Lead"
          />
        </div>
        <div>
          <Label htmlFor="tech_contact_email">Email</Label>
          <Input
            id="tech_contact_email"
            type="email"
            placeholder="tech@facility.com"
          />
        </div>
        <div>
          <Label htmlFor="tech_contact_phone">Phone</Label>
          <Input
            id="tech_contact_phone"
            placeholder="(555) 123-4567"
          />
        </div>
      </div>
    </div>

    <div className="p-4 border rounded-lg">
      <h4 className="font-medium mb-3">Integration Timeline & Priority</h4>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="integration_timeline">Implementation Timeline</Label>
          <select 
            id="integration_timeline"
            className="w-full px-3 py-2 border rounded-md bg-background"
          >
            <option value="">Select timeline</option>
            <option value="immediate">Immediate (within 30 days)</option>
            <option value="short_term">Short-term (1-3 months)</option>
            <option value="medium_term">Medium-term (3-6 months)</option>
            <option value="long_term">Long-term (6+ months)</option>
          </select>
        </div>
        <div>
          <Label htmlFor="integration_priority">Integration Priority</Label>
          <select 
            id="integration_priority"
            className="w-full px-3 py-2 border rounded-md bg-background"
          >
            <option value="">Select priority</option>
            <option value="high">High - Critical for operations</option>
            <option value="medium">Medium - Important but not critical</option>
            <option value="low">Low - Nice to have</option>
          </select>
        </div>
      </div>
    </div>

    <div className="p-4 border rounded-lg">
      <h4 className="font-medium mb-3">Additional Integration Notes</h4>
      <Textarea
        placeholder="Describe any specific integration requirements, security considerations, or technical constraints..."
        rows={4}
      />
    </div>
  </div>
);