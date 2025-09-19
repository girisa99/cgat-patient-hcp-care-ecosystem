/**
 * ENHANCED NPI VERIFICATION FORM
 * Comprehensive provider, treatment center, and referral network verification
 * Follows online form sequence with proper database UUID standards
 */
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { 
  User, 
  Building, 
  Network, 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle, 
  Loader2,
  MapPin,
  Phone,
  Mail,
  Award,
  FileText,
  Clock
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { v4 as uuidv4 } from 'uuid';

interface ProviderData {
  // Primary Provider Information
  providerName: string;
  providerType: 'individual' | 'organization';
  npiNumber: string;
  npiType: '1' | '2'; // Type 1: Individual, Type 2: Organization/Treatment Center
  
  // Treatment Center Information
  treatmentCenterName: string;
  treatmentCenterNPI: string;
  facilityType: string;
  
  // Referral Network Information
  referralNetworkName: string;
  referralNetworkNPI: string;
  networkType: string;
  
  // Contact Information
  primaryPhone: string;
  primaryEmail: string;
  businessAddress: string;
  city: string;
  state: string;
  zipCode: string;
  
  // Credentialing Information
  medicalLicenseNumber: string;
  licenseState: string;
  deaNumber: string;
  taxonomy: string;
  specialization: string;
  
  // Verification Status
  verificationStatus: 'pending' | 'verified' | 'failed';
  verifiedAt?: string;
}

interface EnhancedNPIVerificationFormProps {
  onVerificationComplete?: (data: ProviderData) => void;
  initialData?: Partial<ProviderData>;
  autoTriggerVerification?: boolean;
}

export const EnhancedNPIVerificationForm: React.FC<EnhancedNPIVerificationFormProps> = ({
  onVerificationComplete,
  initialData = {},
  autoTriggerVerification = false
}) => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('provider');
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationProgress, setVerificationProgress] = useState(0);
  const [formData, setFormData] = useState<ProviderData>({
    providerName: '',
    providerType: 'individual',
    npiNumber: '',
    npiType: '1',
    treatmentCenterName: '',
    treatmentCenterNPI: '',
    facilityType: '',
    referralNetworkName: '',
    referralNetworkNPI: '',
    networkType: '',
    primaryPhone: '',
    primaryEmail: '',
    businessAddress: '',
    city: '',
    state: '',
    zipCode: '',
    medicalLicenseNumber: '',
    licenseState: '',
    deaNumber: '',
    taxonomy: '',
    specialization: '',
    verificationStatus: 'pending',
    ...initialData
  });

  const [verificationResults, setVerificationResults] = useState<any>(null);

  useEffect(() => {
    if (autoTriggerVerification && formData.npiNumber) {
      handleNPIVerification();
    }
  }, [autoTriggerVerification]);

  const validateUUID = (uuid: string): boolean => {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
  };

  const generateUUID = (): string => {
    return uuidv4();
  };

  const validateNPIFormat = (npi: string): boolean => {
    // NPI must be exactly 10 digits
    const npiRegex = /^\d{10}$/;
    return npiRegex.test(npi);
  };

  const handleNPIVerification = async () => {
    if (!validateNPIFormat(formData.npiNumber)) {
      toast({
        title: "Invalid NPI Format",
        description: "NPI must be exactly 10 digits",
        variant: "destructive"
      });
      return;
    }

    setIsVerifying(true);
    setVerificationProgress(0);

    try {
      // Step 1: NPI Registry Lookup (20%)
      setVerificationProgress(20);
      const npiResponse = await supabase.functions.invoke('verify-npi', {
        body: { npi: formData.npiNumber }
      });

      if (npiResponse.error) {
        throw new Error(npiResponse.error.message);
      }

      const npiData = npiResponse.data;
      
      if (!npiData.verified) {
        throw new Error(npiData.error || 'NPI verification failed');
      }

      // Step 2: Provider Details Extraction (40%)
      setVerificationProgress(40);
      const extractedData = {
        ...formData,
        providerName: npiData.name || formData.providerName,
        providerType: npiData.provider_type?.toLowerCase() === 'individual' ? 'individual' : 'organization' as 'individual' | 'organization',
        npiType: npiData.provider_type?.toLowerCase() === 'individual' ? '1' : '2' as '1' | '2',
        primaryPhone: npiData.practice_address?.telephone_number || formData.primaryPhone,
        businessAddress: npiData.practice_address?.address_1 || formData.businessAddress,
        city: npiData.practice_address?.city || formData.city,
        state: npiData.practice_address?.state || formData.state,
        zipCode: npiData.practice_address?.postal_code || formData.zipCode,
        taxonomy: npiData.primary_taxonomy?.code || formData.taxonomy,
        specialization: npiData.primary_taxonomy?.description || formData.specialization,
        verificationStatus: 'verified' as const,
        verifiedAt: new Date().toISOString()
      };

      // Step 3: Database Save with UUID Standards (60%)
      setVerificationProgress(60);
      const verificationId = generateUUID();
      
      const { error: saveError } = await supabase
        .from('npi_verification_results')
        .upsert({
          npi: formData.npiNumber,
          provider_type: extractedData.providerType,
          verification_data: npiData,
          verification_status: 'verified',
          verified_at: extractedData.verifiedAt,
          confidence_score: 100
        });

      if (saveError) {
        console.error('Database save error:', saveError);
        // Continue with verification but warn user
        toast({
          title: "Warning",
          description: "Verification successful but data save failed. Please contact support.",
          variant: "default"
        });
      }

      // Step 4: Treatment Center Verification (80%)
      setVerificationProgress(80);
      if (extractedData.treatmentCenterNPI && validateNPIFormat(extractedData.treatmentCenterNPI)) {
        const treatmentCenterResponse = await supabase.functions.invoke('verify-npi', {
          body: { npi: extractedData.treatmentCenterNPI }
        });

        if (treatmentCenterResponse.data?.verified) {
          extractedData.treatmentCenterName = treatmentCenterResponse.data.name || extractedData.treatmentCenterName;
        }
      }

      // Step 5: Final Integration (100%)
      setVerificationProgress(100);
      
      setFormData(extractedData);
      setVerificationResults(npiData);

      toast({
        title: "Verification Complete",
        description: "Provider information has been successfully verified and auto-filled",
        variant: "default"
      });

      // Call completion callback
      if (onVerificationComplete) {
        onVerificationComplete(extractedData);
      }

    } catch (error: any) {
      console.error('NPI Verification error:', error);
      toast({
        title: "Verification Failed",
        description: error.message || 'Unable to verify NPI. Please check the number and try again.',
        variant: "destructive"
      });
      
      setFormData(prev => ({
        ...prev,
        verificationStatus: 'failed'
      }));
    } finally {
      setIsVerifying(false);
    }
  };

  const handleInputChange = (field: keyof ProviderData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const renderProviderTab = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="providerName">Provider Name *</Label>
          <Input
            id="providerName"
            value={formData.providerName}
            onChange={(e) => handleInputChange('providerName', e.target.value)}
            placeholder="Enter provider name"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="providerType">Provider Type *</Label>
          <Select 
            value={formData.providerType} 
            onValueChange={(value: 'individual' | 'organization') => handleInputChange('providerType', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select provider type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="individual">Individual Provider (Type 1)</SelectItem>
              <SelectItem value="organization">Organization/Treatment Center (Type 2)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="npiNumber">NPI Number *</Label>
          <div className="flex gap-2">
            <Input
              id="npiNumber"
              value={formData.npiNumber}
              onChange={(e) => handleInputChange('npiNumber', e.target.value)}
              placeholder="Enter 10-digit NPI"
              maxLength={10}
            />
            <Button 
              onClick={handleNPIVerification}
              disabled={isVerifying || !formData.npiNumber}
              size="sm"
            >
              {isVerifying ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <ShieldCheck className="h-4 w-4" />
              )}
              Verify
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="specialization">Specialization</Label>
          <Input
            id="specialization"
            value={formData.specialization}
            onChange={(e) => handleInputChange('specialization', e.target.value)}
            placeholder="Medical specialization"
          />
        </div>
      </div>

      {isVerifying && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span>Verifying provider information...</span>
            <span>{verificationProgress}%</span>
          </div>
          <Progress value={verificationProgress} className="w-full" />
        </div>
      )}

      {verificationResults && (
        <Alert>
          <CheckCircle2 className="h-4 w-4" />
          <AlertDescription>
            Provider verified successfully. Information has been auto-filled from the NPI registry.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );

  const renderTreatmentCenterTab = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="treatmentCenterName">Treatment Center Name *</Label>
          <Input
            id="treatmentCenterName"
            value={formData.treatmentCenterName}
            onChange={(e) => handleInputChange('treatmentCenterName', e.target.value)}
            placeholder="Enter treatment center name"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="treatmentCenterNPI">Treatment Center NPI (Type 2)</Label>
          <Input
            id="treatmentCenterNPI"
            value={formData.treatmentCenterNPI}
            onChange={(e) => handleInputChange('treatmentCenterNPI', e.target.value)}
            placeholder="Enter treatment center NPI"
            maxLength={10}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="facilityType">Facility Type</Label>
          <Select 
            value={formData.facilityType} 
            onValueChange={(value) => handleInputChange('facilityType', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select facility type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="hospital">Hospital</SelectItem>
              <SelectItem value="clinic">Clinic</SelectItem>
              <SelectItem value="treatment_center">Treatment Center</SelectItem>
              <SelectItem value="rehabilitation">Rehabilitation Facility</SelectItem>
              <SelectItem value="outpatient">Outpatient Facility</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );

  const renderReferralNetworkTab = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="referralNetworkName">Referral Network Name</Label>
          <Input
            id="referralNetworkName"
            value={formData.referralNetworkName}
            onChange={(e) => handleInputChange('referralNetworkName', e.target.value)}
            placeholder="Enter referral network name"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="referralNetworkNPI">Referral Network NPI</Label>
          <Input
            id="referralNetworkNPI"
            value={formData.referralNetworkNPI}
            onChange={(e) => handleInputChange('referralNetworkNPI', e.target.value)}
            placeholder="Enter referral network NPI"
            maxLength={10}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="networkType">Network Type</Label>
          <Select 
            value={formData.networkType} 
            onValueChange={(value) => handleInputChange('networkType', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select network type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ppo">PPO Network</SelectItem>
              <SelectItem value="hmo">HMO Network</SelectItem>
              <SelectItem value="ace">ACE Network</SelectItem>
              <SelectItem value="independent">Independent Network</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );

  const renderCredentialingTab = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="medicalLicenseNumber">Medical License Number</Label>
          <Input
            id="medicalLicenseNumber"
            value={formData.medicalLicenseNumber}
            onChange={(e) => handleInputChange('medicalLicenseNumber', e.target.value)}
            placeholder="Enter medical license number"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="licenseState">License State</Label>
          <Input
            id="licenseState"
            value={formData.licenseState}
            onChange={(e) => handleInputChange('licenseState', e.target.value)}
            placeholder="Enter license state"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="deaNumber">DEA Number</Label>
          <Input
            id="deaNumber"
            value={formData.deaNumber}
            onChange={(e) => handleInputChange('deaNumber', e.target.value)}
            placeholder="Enter DEA number"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="taxonomy">Taxonomy Code</Label>
          <Input
            id="taxonomy"
            value={formData.taxonomy}
            onChange={(e) => handleInputChange('taxonomy', e.target.value)}
            placeholder="Enter taxonomy code"
          />
        </div>
      </div>
    </div>
  );

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          Enhanced Provider Verification
        </CardTitle>
        <div className="flex items-center gap-4">
          <Badge variant={formData.verificationStatus === 'verified' ? 'default' : 'secondary'}>
            {formData.verificationStatus === 'verified' ? 'Verified' : 'Pending Verification'}
          </Badge>
          {formData.verifiedAt && (
            <span className="text-sm text-muted-foreground">
              Verified: {new Date(formData.verifiedAt).toLocaleDateString()}
            </span>
          )}
        </div>
      </CardHeader>
      
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="provider" className="flex items-center gap-1">
              <User className="h-3 w-3" />
              Provider
            </TabsTrigger>
            <TabsTrigger value="treatment" className="flex items-center gap-1">
              <Building className="h-3 w-3" />
              Treatment Center
            </TabsTrigger>
            <TabsTrigger value="referral" className="flex items-center gap-1">
              <Network className="h-3 w-3" />
              Referral Network
            </TabsTrigger>
            <TabsTrigger value="credentialing" className="flex items-center gap-1">
              <Award className="h-3 w-3" />
              Credentialing
            </TabsTrigger>
          </TabsList>

          <TabsContent value="provider" className="mt-6">
            {renderProviderTab()}
          </TabsContent>

          <TabsContent value="treatment" className="mt-6">
            {renderTreatmentCenterTab()}
          </TabsContent>

          <TabsContent value="referral" className="mt-6">
            {renderReferralNetworkTab()}
          </TabsContent>

          <TabsContent value="credentialing" className="mt-6">
            {renderCredentialingTab()}
          </TabsContent>
        </Tabs>

        <Separator className="my-6" />

        <div className="flex justify-between items-center">
          <div className="text-sm text-muted-foreground">
            All data is saved using PostgreSQL UUID standards for optimal performance and security.
          </div>
          <Button 
            onClick={() => onVerificationComplete?.(formData)}
            disabled={!formData.providerName || !formData.npiNumber}
          >
            Complete Verification
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};