
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Plus, X, Dna, Users, Calendar, AlertCircle, CheckCircle } from 'lucide-react';
import { TreatmentCenterOnboarding } from '@/types/onboarding';
import { useTherapies } from '@/hooks/useTherapies';
import { useServices } from '@/hooks/useServices';
import { 
  TherapySelection, 
  THERAPY_TYPES, 
  TREATMENT_READINESS_LEVELS, 
  PRIORITY_LEVELS 
} from '@/types/therapies';

interface EnhancedTherapySelectionStepProps {
  data: Partial<TreatmentCenterOnboarding>;
  onDataChange: (data: Partial<TreatmentCenterOnboarding>) => void;
  applicationId?: string;
}

export const EnhancedTherapySelectionStep: React.FC<EnhancedTherapySelectionStepProps> = ({
  data,
  onDataChange,
  applicationId
}) => {
  const [isAddingSelection, setIsAddingSelection] = useState(false);
  const [selectedTherapyType, setSelectedTherapyType] = useState('');
  
  const {
    therapies,
    products,
    clinicalTrials,
    commercialProducts,
    getTherapySelections,
    saveTherapySelection,
    deleteTherapySelection,
    isLoadingProducts,
    isSaving
  } = useTherapies();

  const {
    services,
    serviceProviders,
    capabilities
  } = useServices();

  const { data: therapySelections = [], refetch: refetchSelections } = getTherapySelections(applicationId || '');

  const [newSelection, setNewSelection] = useState<Partial<TherapySelection>>({
    therapy_id: '',
    product_id: '',
    service_id: '',
    selected_provider_id: '',
    treatment_readiness_level: 'planning',
    priority_level: 'medium',
    patient_volume_estimate: 0,
    selection_rationale: '',
    preferred_start_date: ''
  });

  const filteredTherapies = therapies?.filter(therapy => 
    !selectedTherapyType || therapy.therapy_type === selectedTherapyType
  ) || [];

  const filteredProducts = products?.filter(product => 
    !newSelection.therapy_id || product.therapy_id === newSelection.therapy_id
  ) || [];

  const availableTrials = clinicalTrials?.filter(trial => 
    trial.product_id === newSelection.product_id && 
    ['recruiting', 'active_not_recruiting'].includes(trial.trial_status)
  ) || [];

  const availableCommercialProducts = commercialProducts?.filter(cp => 
    cp.product_id === newSelection.product_id
  ) || [];

  const handleAddSelection = () => {
    if (!applicationId || !newSelection.therapy_id || !newSelection.product_id || !newSelection.service_id || !newSelection.selected_provider_id) {
      return;
    }

    saveTherapySelection({
      ...newSelection,
      onboarding_id: applicationId,
    } as TherapySelection);

    // Reset form
    setNewSelection({
      therapy_id: '',
      product_id: '',
      service_id: '',
      selected_provider_id: '',
      treatment_readiness_level: 'planning',
      priority_level: 'medium',
      patient_volume_estimate: 0,
      selection_rationale: '',
      preferred_start_date: ''
    });
    setIsAddingSelection(false);
    setSelectedTherapyType('');
  };

  const handleRemoveSelection = (selectionId: string) => {
    if (!applicationId) return;
    deleteTherapySelection({ id: selectionId, onboardingId: applicationId });
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'default';
    }
  };

  const getReadinessIcon = (level: string) => {
    switch (level) {
      case 'active': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'ready': return <CheckCircle className="h-4 w-4 text-blue-600" />;
      case 'preparing': return <AlertCircle className="h-4 w-4 text-yellow-600" />;
      case 'planning': return <AlertCircle className="h-4 w-4 text-gray-600" />;
      default: return <AlertCircle className="h-4 w-4 text-gray-600" />;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center space-x-2">
              <Dna className="h-5 w-5" />
              <span>CGAT Therapy Selection</span>
            </span>
            <Button onClick={() => setIsAddingSelection(true)} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Therapy
            </Button>
          </CardTitle>
          <CardDescription>
            Select CGAT therapies, products, and service providers for your treatment center.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Current Selections */}
          {therapySelections.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Selected Therapies</h3>
              {therapySelections.map((selection) => (
                <Card key={selection.id} className="border-l-4 border-l-blue-500">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline">
                        {THERAPY_TYPES[selection.therapy?.therapy_type as keyof typeof THERAPY_TYPES]}
                      </Badge>
                      <Badge variant={getPriorityColor(selection.priority_level) as any}>
                        {PRIORITY_LEVELS[selection.priority_level as keyof typeof PRIORITY_LEVELS]}
                      </Badge>
                      <div className="flex items-center space-x-1">
                        {getReadinessIcon(selection.treatment_readiness_level)}
                        <span className="text-sm">
                          {TREATMENT_READINESS_LEVELS[selection.treatment_readiness_level as keyof typeof TREATMENT_READINESS_LEVELS]}
                        </span>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveSelection(selection.id!)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm font-medium">Therapy</Label>
                        <p className="text-sm">{selection.therapy?.name}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Product</Label>
                        <p className="text-sm">{selection.product?.name}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Service Provider</Label>
                        <p className="text-sm">{selection.service_provider?.name}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Patient Volume (Annual Estimate)</Label>
                        <p className="text-sm">{selection.patient_volume_estimate || 'Not specified'}</p>
                      </div>
                    </div>
                    {selection.selection_rationale && (
                      <div>
                        <Label className="text-sm font-medium">Selection Rationale</Label>
                        <p className="text-sm text-muted-foreground">{selection.selection_rationale}</p>
                      </div>
                    )}
                    {selection.preferred_start_date && (
                      <div>
                        <Label className="text-sm font-medium">Preferred Start Date</Label>
                        <p className="text-sm">{selection.preferred_start_date}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Add New Selection Form */}
          {isAddingSelection && (
            <Card className="border-2 border-blue-200">
              <CardHeader>
                <CardTitle className="text-base">Add New Therapy Selection</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Therapy Type</Label>
                    <Select
                      value={selectedTherapyType}
                      onValueChange={(value) => {
                        setSelectedTherapyType(value);
                        setNewSelection({ ...newSelection, therapy_id: '', product_id: '' });
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Filter by therapy type" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(THERAPY_TYPES).map(([key, label]) => (
                          <SelectItem key={key} value={key}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Treatment Readiness *</Label>
                    <Select
                      value={newSelection.treatment_readiness_level}
                      onValueChange={(value) => setNewSelection({ ...newSelection, treatment_readiness_level: value as any })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select readiness level" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(TREATMENT_READINESS_LEVELS).map(([key, label]) => (
                          <SelectItem key={key} value={key}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label>Therapy *</Label>
                  <Select
                    value={newSelection.therapy_id}
                    onValueChange={(value) => {
                      setNewSelection({ ...newSelection, therapy_id: value, product_id: '' });
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select therapy" />
                    </SelectTrigger>
                    <SelectContent>
                      {filteredTherapies.map((therapy) => (
                        <SelectItem key={therapy.id} value={therapy.id}>
                          <div className="flex flex-col">
                            <span>{therapy.name}</span>
                            <span className="text-xs text-muted-foreground">{therapy.indication}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Product *</Label>
                  <Select
                    value={newSelection.product_id}
                    onValueChange={(value) => setNewSelection({ ...newSelection, product_id: value })}
                    disabled={!newSelection.therapy_id}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select product" />
                    </SelectTrigger>
                    <SelectContent>
                      {filteredProducts.map((product) => (
                        <SelectItem key={product.id} value={product.id}>
                          <div className="flex flex-col">
                            <span>{product.name}</span>
                            <span className="text-xs text-muted-foreground">
                              {product.manufacturer?.name} - {product.product_status}
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Service *</Label>
                    <Select
                      value={newSelection.service_id}
                      onValueChange={(value) => setNewSelection({ ...newSelection, service_id: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select service" />
                      </SelectTrigger>
                      <SelectContent>
                        {services?.map((service) => (
                          <SelectItem key={service.id} value={service.id}>
                            {service.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
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
                        {serviceProviders?.map((provider) => (
                          <SelectItem key={provider.id} value={provider.id}>
                            {provider.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Priority Level</Label>
                    <Select
                      value={newSelection.priority_level}
                      onValueChange={(value) => setNewSelection({ ...newSelection, priority_level: value as any })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select priority" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(PRIORITY_LEVELS).map(([key, label]) => (
                          <SelectItem key={key} value={key}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Annual Patient Volume Estimate</Label>
                    <Input
                      type="number"
                      value={newSelection.patient_volume_estimate || ''}
                      onChange={(e) => setNewSelection({ 
                        ...newSelection, 
                        patient_volume_estimate: parseInt(e.target.value) || 0 
                      })}
                      placeholder="e.g., 25"
                    />
                  </div>
                </div>

                <div>
                  <Label>Selection Rationale</Label>
                  <Textarea
                    value={newSelection.selection_rationale}
                    onChange={(e) => setNewSelection({ ...newSelection, selection_rationale: e.target.value })}
                    placeholder="Why did you choose this therapy and service provider combination?"
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
                    disabled={!newSelection.therapy_id || !newSelection.product_id || !newSelection.service_id || !newSelection.selected_provider_id || isSaving}
                  >
                    {isSaving ? 'Adding...' : 'Add Selection'}
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setIsAddingSelection(false);
                      setNewSelection({
                        therapy_id: '',
                        product_id: '',
                        service_id: '',
                        selected_provider_id: '',
                        treatment_readiness_level: 'planning',
                        priority_level: 'medium',
                        patient_volume_estimate: 0,
                        selection_rationale: '',
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

          {therapySelections.length === 0 && !isAddingSelection && (
            <div className="text-center py-8 text-muted-foreground">
              <Dna className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No therapy selections configured yet.</p>
              <p className="text-sm">Add CGAT therapies to begin setting up your treatment programs.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Therapy Selection Summary */}
      {therapySelections.length > 0 && (
        <Card className="bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-blue-900">Therapy Selection Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <Dna className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                <h4 className="font-medium text-blue-900">Therapies Selected</h4>
                <p className="text-2xl font-bold text-blue-700">{therapySelections.length}</p>
              </div>
              <div className="text-center">
                <Users className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                <h4 className="font-medium text-blue-900">Est. Annual Patients</h4>
                <p className="text-2xl font-bold text-blue-700">
                  {therapySelections.reduce((sum, s) => sum + (s.patient_volume_estimate || 0), 0)}
                </p>
              </div>
              <div className="text-center">
                <Calendar className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                <h4 className="font-medium text-blue-900">Ready to Start</h4>
                <p className="text-2xl font-bold text-blue-700">
                  {therapySelections.filter(s => s.treatment_readiness_level === 'ready' || s.treatment_readiness_level === 'active').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
