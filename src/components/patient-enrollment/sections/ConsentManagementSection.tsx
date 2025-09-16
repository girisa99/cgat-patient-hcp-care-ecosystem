import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { supabase } from '@/integrations/supabase/client';
import { useMasterToast } from '@/hooks/useMasterToast';
import { 
  Shield, 
  User, 
  Building2, 
  Phone, 
  Mail, 
  Plus, 
  Search,
  CheckCircle2,
  Clock,
  AlertTriangle
} from 'lucide-react';
import { SignatureCapture } from '@/components/signature/SignatureCapture';

interface ConsentManagementData {
  // Provider Selection
  selectedProviderId?: string;
  providerName: string;
  providerPhone: string;
  providerEmail: string;
  providerNpi?: string;
  
  // Treatment Center
  selectedTreatmentCenterId?: string;
  treatmentCenterName: string;
  treatmentCenterAddress?: string;
  treatmentCenterNpi?: string;
  
  // Consent Method
  consentMethod: 'facility_present' | 'digital_sms' | 'digital_email' | 'verbal';
  
  // Patient Consent Status
  patientConsentStatus: 'pending' | 'obtained' | 'declined';
  consentDate: string;
  consentBy: string;
  
  // Method-specific fields
  verbalConsentWitness?: string;
  digitalConsentEmail?: string;
  digitalConsentPhone?: string;
  
  // Provider Consent & Signature
  providerConsentStatus: 'pending' | 'obtained';
  providerSignature?: string;
  providerConsentDate?: string;
  
  // Consent Types
  consentToTreatment: boolean;
  hipaaAuthorization: boolean;  
  financialResponsibility: boolean;
  communicationConsent: boolean;
  telehealthConsent: boolean;
  marketingConsent: boolean;
  
  // Notes
  consentNotes?: string;
}

// Simple props interface to avoid type recursion
interface ConsentProps {
  data: any;
  onChange: (data: any) => void;
  onSave: () => void;
  isLoading?: boolean;
}

export const ConsentManagementSection = ({
  data,
  onChange,
  onSave,
  isLoading = false
}) => {
  const [providers, setProviders] = useState<any[]>([]);
  const [treatmentCenters, setTreatmentCenters] = useState<any[]>([]);
  const [showAddProvider, setShowAddProvider] = useState(false);
  const [showAddTreatmentCenter, setShowAddTreatmentCenter] = useState(false);
  const [searchingProviders, setSearchingProviders] = useState(false);
  const { showSuccess, showError } = useMasterToast();

  useEffect(() => {
    loadProviders();
    loadTreatmentCenters();
  }, []);

  const loadProviders = async () => {
    try {
      const { data: providersData, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'provider')
        .limit(50);
      
      if (error) throw error;
      setProviders(providersData || []);
    } catch (error) {
      console.error('Failed to load providers:', error);
    }
  };

  const loadTreatmentCenters = async () => {
    try {
      const { data: centersData, error } = await supabase
        .from('facilities')
        .select('*')
        .limit(50);
      
      if (error) throw error;
      setTreatmentCenters(centersData || []);
    } catch (error) {
      console.error('Failed to load treatment centers:', error);
    }
  };

  const handleProviderSelect = (providerId: string) => {
    const provider = providers.find(p => p.id === providerId);
    if (provider) {
      onChange({
        selectedProviderId: providerId,
        providerName: `${provider.first_name} ${provider.last_name}`,
        providerPhone: provider.phone || '',
        providerEmail: provider.email || '',
        providerNpi: provider.npi_number || ''
      });
    }
  };

  const handleTreatmentCenterSelect = (centerId: string) => {
    const center = treatmentCenters.find(c => c.id === centerId);
    if (center) {
      onChange({
        selectedTreatmentCenterId: centerId,
        treatmentCenterName: center.name || '',
        treatmentCenterAddress: center.address || '',
        treatmentCenterNpi: center.npi_number || ''
      });
    }
  };

  const addNewProvider = async (providerData: any) => {
    try {
      const { data: newProvider, error } = await supabase
        .from('profiles')
        .insert({
          ...providerData,
          role: 'provider'
        })
        .select()
        .single();
      
      if (error) throw error;
      
      setProviders(prev => [...prev, newProvider]);
      handleProviderSelect(newProvider.id);
      setShowAddProvider(false);
      showSuccess('Provider added successfully');
    } catch (error) {
      console.error('Failed to add provider:', error);
      showError('Failed to add provider');
    }
  };

  const addNewTreatmentCenter = async (centerData: any) => {
    try {
      const { data: newCenter, error } = await supabase
        .from('facilities')
        .insert(centerData)
        .select()
        .single();
      
      if (error) throw error;
      
      setTreatmentCenters(prev => [...prev, newCenter]);
      handleTreatmentCenterSelect(newCenter.id);
      setShowAddTreatmentCenter(false);
      showSuccess('Treatment center added successfully');
    } catch (error) {
      console.error('Failed to add treatment center:', error);
      showError('Failed to add treatment center');
    }
  };

  const handleConsentCapture = (consentType: 'patient' | 'provider') => {
    if (consentType === 'patient') {
      onChange({
        patientConsentStatus: 'obtained',
        consentDate: new Date().toISOString(),
        consentBy: data.providerName || 'Provider'
      });
      showSuccess('Patient consent captured successfully');
    } else {
      onChange({
        providerConsentStatus: 'obtained',
        providerConsentDate: new Date().toISOString()
      });
      showSuccess('Provider consent captured successfully');
    }
  };

  const getConsentStatusBadge = (status: string) => {
    switch (status) {
      case 'obtained':
        return <Badge variant="default" className="bg-green-500"><CheckCircle2 className="w-3 h-3 mr-1" />Obtained</Badge>;
      case 'declined':
        return <Badge variant="destructive"><AlertTriangle className="w-3 h-3 mr-1" />Declined</Badge>;
      default:
        return <Badge variant="outline"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
    }
  };

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Consent Management
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Capture patient consent and provider authorization with appropriate method selection
        </p>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Provider Information Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4" />
            <h3 className="text-lg font-semibold">Provider Information</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Select Existing Provider</Label>
              <Select value={data.selectedProviderId} onValueChange={handleProviderSelect}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a provider..." />
                </SelectTrigger>
                <SelectContent>
                  {providers.map(provider => (
                    <SelectItem key={provider.id} value={provider.id}>
                      {provider.first_name} {provider.last_name} - {provider.email}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-end">
              <Button
                variant="outline"
                onClick={() => setShowAddProvider(true)}
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add New Provider
              </Button>
            </div>
          </div>

          {/* Provider Details */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Provider Name</Label>
              <Input
                value={data.providerName}
                onChange={(e) => onChange({ providerName: e.target.value })}
                placeholder="Enter provider name"
              />
            </div>
            <div className="space-y-2">
              <Label>Provider Phone</Label>
              <Input
                value={data.providerPhone}
                onChange={(e) => onChange({ providerPhone: e.target.value })}
                placeholder="(555) 123-4567"
              />
            </div>
            <div className="space-y-2">
              <Label>Provider Email</Label>
              <Input
                value={data.providerEmail}
                onChange={(e) => onChange({ providerEmail: e.target.value })}
                placeholder="provider@example.com"
              />
            </div>
          </div>
        </div>

        <Separator />

        {/* Treatment Center Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            <h3 className="text-lg font-semibold">Treatment Center</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Select Treatment Center</Label>
              <Select value={data.selectedTreatmentCenterId} onValueChange={handleTreatmentCenterSelect}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a treatment center..." />
                </SelectTrigger>
                <SelectContent>
                  {treatmentCenters.map(center => (
                    <SelectItem key={center.id} value={center.id}>
                      {center.name} - {center.city}, {center.state}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-end">
              <Button
                variant="outline"
                onClick={() => setShowAddTreatmentCenter(true)}
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add New Treatment Center
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Treatment Center Name</Label>
            <Input
              value={data.treatmentCenterName}
              onChange={(e) => onChange({ treatmentCenterName: e.target.value })}
              placeholder="Enter treatment center name"
            />
          </div>
        </div>

        <Separator />

        {/* Consent Method Selection */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Consent Method</h3>
          
          <RadioGroup
            value={data.consentMethod}
            onValueChange={(value: any) => onChange({ consentMethod: value })}
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
          >
            <div className="flex items-center space-x-2 p-4 border rounded-lg">
              <RadioGroupItem value="facility_present" id="facility_present" />
              <div className="flex-1">
                <Label htmlFor="facility_present" className="font-medium">
                  Patient Present at Facility
                </Label>
                <p className="text-xs text-muted-foreground mt-1">
                  Patient is physically present for in-person consent
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2 p-4 border rounded-lg">
              <RadioGroupItem value="digital_sms" id="digital_sms" />
              <div className="flex-1">
                <Label htmlFor="digital_sms" className="font-medium">
                  Digital Consent - SMS
                </Label>
                <p className="text-xs text-muted-foreground mt-1">
                  Send consent form via SMS
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2 p-4 border rounded-lg">
              <RadioGroupItem value="digital_email" id="digital_email" />
              <div className="flex-1">
                <Label htmlFor="digital_email" className="font-medium">
                  Digital Consent - Email
                </Label>
                <p className="text-xs text-muted-foreground mt-1">
                  Send consent form via email
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2 p-4 border rounded-lg">
              <RadioGroupItem value="verbal" id="verbal" />
              <div className="flex-1">
                <Label htmlFor="verbal" className="font-medium">
                  Verbal Consent
                </Label>
                <p className="text-xs text-muted-foreground mt-1">
                  Consent given verbally with witness
                </p>
              </div>
            </div>
          </RadioGroup>

          {/* Method-specific fields */}
          {data.consentMethod === 'verbal' && (
            <div className="space-y-2">
              <Label>Witness Name</Label>
              <Input
                value={data.verbalConsentWitness || ''}
                onChange={(e) => onChange({ verbalConsentWitness: e.target.value })}
                placeholder="Enter witness name"
              />
            </div>
          )}

          {data.consentMethod === 'digital_email' && (
            <div className="space-y-2">
              <Label>Patient Email for Consent</Label>
              <Input
                value={data.digitalConsentEmail || ''}
                onChange={(e) => onChange({ digitalConsentEmail: e.target.value })}
                placeholder="patient@example.com"
              />
            </div>
          )}

          {data.consentMethod === 'digital_sms' && (
            <div className="space-y-2">
              <Label>Patient Phone for SMS Consent</Label>
              <Input
                value={data.digitalConsentPhone || ''}
                onChange={(e) => onChange({ digitalConsentPhone: e.target.value })}
                placeholder="(555) 123-4567"
              />
            </div>
          )}
        </div>

        <Separator />

        {/* Consent Types */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Consent Types</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="consentToTreatment"
                checked={data.consentToTreatment}
                onCheckedChange={(checked) => onChange({ consentToTreatment: !!checked })}
              />
              <Label htmlFor="consentToTreatment" className="text-sm font-medium">
                Consent to Treatment
              </Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox
                id="hipaaAuthorization"
                checked={data.hipaaAuthorization}
                onCheckedChange={(checked) => onChange({ hipaaAuthorization: !!checked })}
              />
              <Label htmlFor="hipaaAuthorization" className="text-sm font-medium">
                HIPAA Authorization
              </Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox
                id="financialResponsibility"
                checked={data.financialResponsibility}
                onCheckedChange={(checked) => onChange({ financialResponsibility: !!checked })}
              />
              <Label htmlFor="financialResponsibility" className="text-sm font-medium">
                Financial Responsibility
              </Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox
                id="communicationConsent"
                checked={data.communicationConsent}
                onCheckedChange={(checked) => onChange({ communicationConsent: !!checked })}
              />
              <Label htmlFor="communicationConsent" className="text-sm font-medium">
                Communication Consent
              </Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox
                id="telehealthConsent"
                checked={data.telehealthConsent}
                onCheckedChange={(checked) => onChange({ telehealthConsent: !!checked })}
              />
              <Label htmlFor="telehealthConsent" className="text-sm font-medium">
                Telehealth Consent
              </Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox
                id="marketingConsent"
                checked={data.marketingConsent}
                onCheckedChange={(checked) => onChange({ marketingConsent: !!checked })}
              />
              <Label htmlFor="marketingConsent" className="text-sm font-medium">
                Marketing Communications
              </Label>
            </div>
          </div>
        </div>

        <Separator />

        {/* Consent Status & Capture */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Consent Status</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">Patient Consent</CardTitle>
                  {getConsentStatusBadge(data.patientConsentStatus)}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Button
                    onClick={() => handleConsentCapture('patient')}
                    disabled={data.patientConsentStatus === 'obtained'}
                    className="w-full"
                  >
                    Capture Patient Consent
                  </Button>
                  {data.patientConsentStatus === 'obtained' && (
                    <p className="text-xs text-muted-foreground">
                      Obtained on {new Date(data.consentDate).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">Provider Consent</CardTitle>
                  {getConsentStatusBadge(data.providerConsentStatus)}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Button
                    onClick={() => handleConsentCapture('provider')}
                    disabled={data.providerConsentStatus === 'obtained'}
                    className="w-full"
                  >
                    Capture Provider Consent
                  </Button>
                  {data.providerConsentStatus === 'obtained' && (
                    <p className="text-xs text-muted-foreground">
                      Obtained on {new Date(data.providerConsentDate || '').toLocaleDateString()}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Provider Signature Capture */}
        {data.providerConsentStatus === 'obtained' && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Provider Signature</h3>
            <SignatureCapture
              title="Provider Signature"
              onSignatureChange={(signature) => onChange({ providerSignature: signature })}
            />
          </div>
        )}

        {/* Notes */}
        <div className="space-y-2">
          <Label>Additional Notes</Label>
          <Textarea
            value={data.consentNotes || ''}
            onChange={(e) => onChange({ consentNotes: e.target.value })}
            placeholder="Any additional notes about the consent process..."
            rows={3}
          />
        </div>

        {/* Save Button */}
        <div className="flex justify-end pt-4">
          <Button
            onClick={onSave}
            disabled={isLoading}
            className="min-w-32"
          >
            {isLoading ? 'Saving...' : 'Save & Continue'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export type { ConsentManagementData };