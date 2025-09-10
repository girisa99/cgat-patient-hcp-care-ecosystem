import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Building2, Plus, MapPin, Phone, Mail, Check, X, AlertCircle } from 'lucide-react';
import { useMasterFacilities } from '@/hooks/useMasterFacilities';
import { supabase } from '@/integrations/supabase/client';
import { useMasterToast } from '@/hooks/useMasterToast';

interface Provider {
  id: string;
  name: string;
  npi?: string;
  specialty?: string;
  email?: string;
  phone?: string;
  facility_id?: string;
  is_associated_with_treatment_center?: boolean;
}

interface EnhancedProviderSectionProps {
  formData: {
    providerId?: string;
    providerName: string;
    providerNpi?: string;
    providerSpecialty?: string;
    treatmentCenterId?: string;
    treatmentCenterName: string;
    treatmentCenterAddress?: string;
    treatmentCenterNpi?: string;
    referralProviderId?: string;
    referralProviderName?: string;
    referralCenterId?: string;
    referralCenterName?: string;
    referralCenterAddress?: string;
  };
  updateFormData: (field: string, value: any) => void;
  readOnly?: boolean;
}

export const EnhancedProviderSection: React.FC<EnhancedProviderSectionProps> = ({
  formData,
  updateFormData,
  readOnly = false
}) => {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loadingProviders, setLoadingProviders] = useState(false);
  const [showAddTreatmentCenter, setShowAddTreatmentCenter] = useState(false);
  const [showAddProvider, setShowAddProvider] = useState(false);
  const [showAddReferralCenter, setShowAddReferralCenter] = useState(false);
  const [newTreatmentCenter, setNewTreatmentCenter] = useState({
    name: '',
    address: '',
    phone: '',
    email: '',
    npi_number: '',
    facility_type: 'treatmentFacility' as const
  });
  const [newProvider, setNewProvider] = useState({
    name: '',
    npi: '',
    specialty: '',
    email: '',
    phone: '',
    facility_id: ''
  });
  
  const { facilities, createFacility, isLoading: facilitiesLoading } = useMasterFacilities();
  const { showSuccess, showError } = useMasterToast();

  // Load providers from profiles table where user has provider role
  useEffect(() => {
    const loadProviders = async () => {
      setLoadingProviders(true);
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select(`
            id,
            first_name,
            last_name,
            email,
            phone,
            facility_id,
            user_roles (
              role:roles (
                name
              )
            )
          `)
          .eq('user_roles.role.name', 'provider');

        if (error) throw error;

        const providersData = data?.map(profile => ({
          id: profile.id,
          name: `${profile.first_name || ''} ${profile.last_name || ''}`.trim(),
          email: profile.email,
          phone: profile.phone,
          facility_id: profile.facility_id,
          is_associated_with_treatment_center: !!profile.facility_id
        })) || [];

        setProviders(providersData);
      } catch (error) {
        console.error('Error loading providers:', error);
        showError('Failed to load providers');
      } finally {
        setLoadingProviders(false);
      }
    };

    loadProviders();
  }, []);

  const handleAddTreatmentCenter = async () => {
    try {
      // Create facility using Supabase directly since createFacility returns void
      const { data, error } = await supabase
        .from('facilities')
        .insert({
          name: newTreatmentCenter.name,
          address: newTreatmentCenter.address,
          phone: newTreatmentCenter.phone,
          email: newTreatmentCenter.email,
          npi_number: newTreatmentCenter.npi_number,
          facility_type: newTreatmentCenter.facility_type,
          is_active: true
        })
        .select()
        .single();

      if (error) throw error;

      if (data) {
        updateFormData('treatmentCenterId', data.id);
        updateFormData('treatmentCenterName', newTreatmentCenter.name);
        updateFormData('treatmentCenterAddress', newTreatmentCenter.address);
        updateFormData('treatmentCenterNpi', newTreatmentCenter.npi_number);
        setShowAddTreatmentCenter(false);
        setNewTreatmentCenter({
          name: '',
          address: '',
          phone: '',
          email: '',
          npi_number: '',
          facility_type: 'treatmentFacility' as const
        });
        showSuccess('Treatment center added successfully');
      }
    } catch (error) {
      console.error('Error adding treatment center:', error);
      showError('Failed to add treatment center');
    }
  };

  const handleAddProvider = async () => {
    try {
      // Create provider profile first
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .insert([{
          id: crypto.randomUUID(),
          email: newProvider.email,
          first_name: newProvider.name.split(' ')[0] || newProvider.name,
          last_name: newProvider.name.split(' ').slice(1).join(' ') || '',
          phone: newProvider.phone,
          facility_id: newProvider.facility_id || null
        }])
        .select()
        .single();

      if (profileError) throw profileError;

      // Get or create provider role
      const { data: roleData } = await supabase
        .from('roles')
        .select('id')
        .eq('name', 'healthcareProvider')
        .single();

      if (roleData && profile) {
        // Assign provider role
        await supabase
          .from('user_roles')
          .insert([{
            user_id: profile.id,
            role_id: roleData.id
          }]);

        // Update form with new provider
        updateFormData('providerId', profile.id);
        updateFormData('providerName', newProvider.name);
        updateFormData('providerNpi', newProvider.npi);
        updateFormData('providerSpecialty', newProvider.specialty);
        
        // Reload providers list
        setProviders(prev => [...prev, {
          id: profile.id,
          name: newProvider.name,
          npi: newProvider.npi,
          specialty: newProvider.specialty,
          email: newProvider.email,
          phone: newProvider.phone,
          facility_id: newProvider.facility_id,
          is_associated_with_treatment_center: !!newProvider.facility_id
        }]);

        setShowAddProvider(false);
        setNewProvider({
          name: '',
          npi: '',
          specialty: '',
          email: '',
          phone: '',
          facility_id: ''
        });
        showSuccess('Provider added successfully');
      }
    } catch (error) {
      console.error('Error adding provider:', error);
      showError('Failed to add provider');
    }
  };

  const selectedTreatmentCenter = facilities.find(f => f.id === formData.treatmentCenterId);
  const selectedProvider = providers.find(p => p.id === formData.providerId);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building2 className="h-5 w-5" />
          Provider Information
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Treatment Center Section */}
        <div>
          <Label className="text-base font-medium">Treatment Center</Label>
          <div className="flex gap-2 mt-2">
            <div className="flex-1">
              <Select
                value={formData.treatmentCenterId}
                onValueChange={(value) => {
                  const facility = facilities.find(f => f.id === value);
                  updateFormData('treatmentCenterId', value);
                  updateFormData('treatmentCenterName', facility?.name || '');
                  updateFormData('treatmentCenterAddress', facility?.address || '');
                  updateFormData('treatmentCenterNpi', facility?.npi_number || '');
                }}
                disabled={readOnly}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select treatment center..." />
                </SelectTrigger>
                <SelectContent>
                  {facilities.map(facility => (
                    <SelectItem key={facility.id} value={facility.id}>
                      <div className="flex flex-col">
                        <span>{facility.name}</span>
                        <span className="text-xs text-muted-foreground">
                          {facility.facility_type} • {facility.address}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Dialog open={showAddTreatmentCenter} onOpenChange={setShowAddTreatmentCenter}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" disabled={readOnly}>
                  <Plus className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Treatment Center</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="tcName">Treatment Center Name</Label>
                    <Input
                      id="tcName"
                      value={newTreatmentCenter.name}
                      onChange={(e) => setNewTreatmentCenter(prev => ({ ...prev, name: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="tcAddress">Address</Label>
                    <Textarea
                      id="tcAddress"
                      value={newTreatmentCenter.address}
                      onChange={(e) => setNewTreatmentCenter(prev => ({ ...prev, address: e.target.value }))}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="tcPhone">Phone</Label>
                      <Input
                        id="tcPhone"
                        value={newTreatmentCenter.phone}
                        onChange={(e) => setNewTreatmentCenter(prev => ({ ...prev, phone: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="tcNpi">NPI Number</Label>
                      <Input
                        id="tcNpi"
                        value={newTreatmentCenter.npi_number}
                        onChange={(e) => setNewTreatmentCenter(prev => ({ ...prev, npi_number: e.target.value }))}
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="tcEmail">Email</Label>
                    <Input
                      id="tcEmail"
                      type="email"
                      value={newTreatmentCenter.email}
                      onChange={(e) => setNewTreatmentCenter(prev => ({ ...prev, email: e.target.value }))}
                    />
                  </div>
                  <Button onClick={handleAddTreatmentCenter} className="w-full">
                    Add Treatment Center
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Treatment Center Details */}
          {selectedTreatmentCenter && (
            <div className="mt-3 p-3 bg-muted/30 rounded-lg">
              <div className="flex items-start gap-3">
                <Building2 className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div className="flex-1">
                  <h4 className="font-medium">{selectedTreatmentCenter.name}</h4>
                  {selectedTreatmentCenter.address && (
                    <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                      <MapPin className="h-3 w-3" />
                      {selectedTreatmentCenter.address}
                    </p>
                  )}
                  <div className="flex gap-4 mt-2">
                    {selectedTreatmentCenter.phone && (
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Phone className="h-3 w-3" />
                        {selectedTreatmentCenter.phone}
                      </span>
                    )}
                    {selectedTreatmentCenter.npi_number && (
                      <span className="text-xs text-muted-foreground">
                        NPI: {selectedTreatmentCenter.npi_number}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <Separator />

        {/* Provider Section */}
        <div>
          <Label className="text-base font-medium">Primary Provider</Label>
          <div className="flex gap-2 mt-2">
            <div className="flex-1">
              <Select
                value={formData.providerId}
                onValueChange={(value) => {
                  const provider = providers.find(p => p.id === value);
                  updateFormData('providerId', value);
                  updateFormData('providerName', provider?.name || '');
                  updateFormData('providerNpi', provider?.npi || '');
                  updateFormData('providerSpecialty', provider?.specialty || '');
                }}
                disabled={readOnly}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select provider..." />
                </SelectTrigger>
                <SelectContent>
                  {providers.map(provider => (
                    <SelectItem key={provider.id} value={provider.id}>
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                          <span>{provider.name}</span>
                          {provider.is_associated_with_treatment_center && (
                            <Badge variant="secondary" className="text-xs">
                              <Check className="h-3 w-3 mr-1" />
                              Associated
                            </Badge>
                          )}
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {provider.specialty} • NPI: {provider.npi}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Dialog open={showAddProvider} onOpenChange={setShowAddProvider}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" disabled={readOnly}>
                  <Plus className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Provider</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="providerName">Provider Name</Label>
                    <Input
                      id="providerName"
                      value={newProvider.name}
                      onChange={(e) => setNewProvider(prev => ({ ...prev, name: e.target.value }))}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="providerNpi">NPI Number</Label>
                      <Input
                        id="providerNpi"
                        value={newProvider.npi}
                        onChange={(e) => setNewProvider(prev => ({ ...prev, npi: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="providerSpecialty">Specialty</Label>
                      <Input
                        id="providerSpecialty"
                        value={newProvider.specialty}
                        onChange={(e) => setNewProvider(prev => ({ ...prev, specialty: e.target.value }))}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="providerEmail">Email</Label>
                      <Input
                        id="providerEmail"
                        type="email"
                        value={newProvider.email}
                        onChange={(e) => setNewProvider(prev => ({ ...prev, email: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="providerPhone">Phone</Label>
                      <Input
                        id="providerPhone"
                        value={newProvider.phone}
                        onChange={(e) => setNewProvider(prev => ({ ...prev, phone: e.target.value }))}
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="providerFacility">Associated Treatment Center (Optional)</Label>
                    <Select
                      value={newProvider.facility_id}
                      onValueChange={(value) => setNewProvider(prev => ({ ...prev, facility_id: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select treatment center..." />
                      </SelectTrigger>
                      <SelectContent>
                        {facilities.map(facility => (
                          <SelectItem key={facility.id} value={facility.id}>
                            {facility.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Button onClick={handleAddProvider} className="w-full">
                    Add Provider
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Provider Association Status */}
          {selectedProvider && (
            <div className="mt-3 p-3 bg-muted/30 rounded-lg">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="font-medium">{selectedProvider.name}</h4>
                  <div className="flex gap-4 mt-1">
                    {selectedProvider.specialty && (
                      <span className="text-sm text-muted-foreground">
                        {selectedProvider.specialty}
                      </span>
                    )}
                    {selectedProvider.npi && (
                      <span className="text-sm text-muted-foreground">
                        NPI: {selectedProvider.npi}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {selectedProvider.is_associated_with_treatment_center ? (
                    <Badge variant="default" className="bg-green-500">
                      <Check className="h-3 w-3 mr-1" />
                      Associated with Treatment Center
                    </Badge>
                  ) : (
                    <Badge variant="secondary">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      Not Associated
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        <Separator />

        {/* Referral Center Section */}
        <div>
          <Label className="text-base font-medium">Referral Center (Optional)</Label>
          <div className="flex gap-2 mt-2">
            <div className="flex-1">
              <Select
                value={formData.referralCenterId}
                onValueChange={(value) => {
                  const facility = facilities.find(f => f.id === value);
                  updateFormData('referralCenterId', value);
                  updateFormData('referralCenterName', facility?.name || '');
                  updateFormData('referralCenterAddress', facility?.address || '');
                }}
                disabled={readOnly}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select referral center..." />
                </SelectTrigger>
                <SelectContent>
                  {facilities.map(facility => (
                    <SelectItem key={facility.id} value={facility.id}>
                      <div className="flex flex-col">
                        <span>{facility.name}</span>
                        <span className="text-xs text-muted-foreground">
                          {facility.facility_type} • {facility.address}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Dialog open={showAddReferralCenter} onOpenChange={setShowAddReferralCenter}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" disabled={readOnly}>
                  <Plus className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Referral Center</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="rcName">Referral Center Name</Label>
                    <Input
                      id="rcName"
                      value={newTreatmentCenter.name}
                      onChange={(e) => setNewTreatmentCenter(prev => ({ ...prev, name: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="rcAddress">Address</Label>
                    <Textarea
                      id="rcAddress"
                      value={newTreatmentCenter.address}
                      onChange={(e) => setNewTreatmentCenter(prev => ({ ...prev, address: e.target.value }))}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="rcPhone">Phone</Label>
                      <Input
                        id="rcPhone"
                        value={newTreatmentCenter.phone}
                        onChange={(e) => setNewTreatmentCenter(prev => ({ ...prev, phone: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="rcEmail">Email</Label>
                      <Input
                        id="rcEmail"
                        type="email"
                        value={newTreatmentCenter.email}
                        onChange={(e) => setNewTreatmentCenter(prev => ({ ...prev, email: e.target.value }))}
                      />
                    </div>
                  </div>
                  <Button 
                    onClick={async () => {
                      try {
                        const { data, error } = await supabase
                          .from('facilities')
                          .insert({
                            ...newTreatmentCenter,
                            facility_type: 'referralFacility' as const,
                            is_active: true
                          })
                          .select()
                          .single();
                        
                        if (error) throw error;
                        
                        if (data) {
                          updateFormData('referralCenterId', data.id);
                          updateFormData('referralCenterName', newTreatmentCenter.name);
                          updateFormData('referralCenterAddress', newTreatmentCenter.address);
                          setShowAddReferralCenter(false);
                          showSuccess('Referral center added successfully');
                        }
                      } catch (error) {
                        showError('Failed to add referral center');
                      }
                    }}
                    className="w-full"
                  >
                    Add Referral Center
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};