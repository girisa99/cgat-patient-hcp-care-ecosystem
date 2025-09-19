import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  User, 
  Building, 
  Network, 
  CheckCircle2, 
  AlertTriangle, 
  Award,
  Loader2,
  Shield
} from 'lucide-react';

interface ProviderData {
  // Provider Information
  providerName: string;
  providerType: string;
  npiNumber: string;
  taxId: string;
  specialty: string;
  licenseNumber: string;
  licenseState: string;
  licenseExpiry: string;
  boardCertification: string;
  providerStatus: string;
  
  // Treatment Center Information
  facilityName: string;
  facilityType: string;
  facilityNPI: string;
  facilityAddress: string;
  facilityCity: string;
  facilityState: string;
  facilityZip: string;
  facilityPhone: string;
  facilityLicenseNumber: string;
  facilityLicenseExpiry: string;
  facilityStatus: string;
  
  // Referral Network Information
  referralNetworkName: string;
  referralNetworkType: string;
  referralNetworkId: string;
  
  // Credentialing Information
  medicalLicenseNumber: string;
  deaNumber: string;
  taxonomy: string;
  
  // Verification Status
  verificationStatus: 'pending' | 'verified' | 'failed';
  verifiedAt?: string;
  
  // Missing Status Fields from extraction
  providerVerificationStatus?: 'pending' | 'verified' | 'failed' | 'not_verified';
  treatmentCenterVerificationStatus?: 'pending' | 'verified' | 'failed' | 'not_verified';
  referralNetworkVerificationStatus?: 'pending' | 'verified' | 'failed' | 'not_verified';
  credentialingStatus?: 'pending' | 'in_progress' | 'completed' | 'failed';
  overallStatus?: 'incomplete' | 'in_progress' | 'completed' | 'verified';
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
    providerType: '',
    npiNumber: '',
    taxId: '',
    specialty: '',
    licenseNumber: '',
    licenseState: '',
    licenseExpiry: '',
    boardCertification: '',
    providerStatus: 'active',
    
    facilityName: '',
    facilityType: '',
    facilityNPI: '',
    facilityAddress: '',
    facilityCity: '',
    facilityState: '',
    facilityZip: '',
    facilityPhone: '',
    facilityLicenseNumber: '',
    facilityLicenseExpiry: '',
    facilityStatus: 'active',
    
    referralNetworkName: '',
    referralNetworkType: '',
    referralNetworkId: '',
    
    medicalLicenseNumber: '',
    deaNumber: '',
    taxonomy: '',
    
    verificationStatus: 'pending',
    
    // Initialize status fields
    providerVerificationStatus: 'not_verified',
    treatmentCenterVerificationStatus: 'not_verified', 
    referralNetworkVerificationStatus: 'not_verified',
    credentialingStatus: 'pending',
    overallStatus: 'incomplete',
    
    ...initialData
  });

  const handleInputChange = (field: keyof ProviderData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleVerifyProvider = async () => {
    if (!formData.providerName || !formData.npiNumber) {
      toast({
        title: "Missing Information",
        description: "Please enter both provider name and NPI number.",
        variant: "destructive"
      });
      return;
    }

    setIsVerifying(true);
    setVerificationProgress(0);

    try {
      // Show progress updates
      const progressInterval = setInterval(() => {
        setVerificationProgress(prev => Math.min(prev + 10, 90));
      }, 500);

      const { data, error } = await supabase.functions.invoke('verify-npi-credentials', {
        body: {
          verificationType: 'provider',
          npi: formData.npiNumber,
          providerName: formData.providerName,
          providerType: formData.providerType || 'individual',
          sectionData: {
            providerName: formData.providerName
          }
        }
      });

      clearInterval(progressInterval);
      setVerificationProgress(100);

      if (error) throw error;

      if (data?.verified) {
        setFormData(prev => ({
          ...prev,
          ...data.providerInfo,
          verificationStatus: 'verified',
          providerVerificationStatus: 'verified',
          verifiedAt: new Date().toISOString()
        }));

        toast({
          title: "Verification Successful",
          description: "Provider information has been verified and auto-filled.",
          variant: "default"
        });
      } else {
        setFormData(prev => ({
          ...prev,
          verificationStatus: 'failed',
          providerVerificationStatus: 'failed'
        }));

        toast({
          title: "Verification Failed",
          description: data?.message || "Unable to verify provider information.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Verification error:', error);
      toast({
        title: "Verification Error",
        description: "An error occurred during verification. Please try again.",
        variant: "destructive"
      });

      setFormData(prev => ({
        ...prev,
        verificationStatus: 'failed',
        providerVerificationStatus: 'failed'
      }));
    } finally {
      setIsVerifying(false);
    }
  };

  const handleVerifyTreatmentCenter = async () => {
    if (!formData.facilityName || !formData.facilityNPI) {
      toast({
        title: "Missing Information",
        description: "Please enter both facility name and NPI number.",
        variant: "destructive"
      });
      return;
    }

    setIsVerifying(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('verify-npi-credentials', {
        body: {
          verificationType: 'treatment_center',
          npi: formData.facilityNPI,
          providerType: 'organization',
          sectionData: {
            treatmentCenterName: formData.facilityName,
            facilityType: formData.facilityType
          }
        }
      });

      if (error) throw error;

      if (data?.verified) {
        setFormData(prev => ({
          ...prev,
          ...data.facilityInfo,
          verificationStatus: 'verified',
          treatmentCenterVerificationStatus: 'verified',
          verifiedAt: new Date().toISOString()
        }));

        toast({
          title: "Treatment Center Verified",
          description: "Facility information has been verified and auto-filled.",
          variant: "default"
        });
      }
    } catch (error) {
      console.error('Treatment center verification error:', error);
      toast({
        title: "Verification Error",
        description: "Unable to verify treatment center information.",
        variant: "destructive"
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const handleVerifyReferralNetwork = async () => {
    if (!formData.referralNetworkName) {
      toast({
        title: "Missing Information",
        description: "Please enter referral network name.",
        variant: "destructive"
      });
      return;
    }

    setIsVerifying(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('verify-npi-credentials', {
        body: {
          verificationType: 'referral_network',
          providerType: 'organization',
          sectionData: {
            referralNetworkName: formData.referralNetworkName,
            networkType: formData.referralNetworkType
          }
        }
      });

      if (error) throw error;

      if (data?.verified) {
        setFormData(prev => ({
          ...prev,
          ...data.networkInfo,
          verificationStatus: 'verified',
          referralNetworkVerificationStatus: 'verified',
          verifiedAt: new Date().toISOString()
        }));

        toast({
          title: "Referral Network Verified",
          description: "Network information has been verified and auto-filled.",
          variant: "default"
        });
      }
    } catch (error) {
      console.error('Referral network verification error:', error);
      toast({
        title: "Verification Error",
        description: "Unable to verify referral network information.",
        variant: "destructive"
      });
    } finally {
      setIsVerifying(false);
    }
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
            placeholder="Dr. Sarah Michelle Johnson, MD"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="providerType">Provider Type *</Label>
          <Select
            value={formData.providerType}
            onValueChange={(value) => handleInputChange('providerType', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select provider type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="individual">Individual Provider</SelectItem>
              <SelectItem value="organization">Organization</SelectItem>
              <SelectItem value="facility">Facility</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="npiNumber">NPI Number *</Label>
          <Input
            id="npiNumber"
            value={formData.npiNumber}
            onChange={(e) => handleInputChange('npiNumber', e.target.value)}
            placeholder="1234567890"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="specialty">Specialty</Label>
          <Input
            id="specialty"
            value={formData.specialty}
            onChange={(e) => handleInputChange('specialty', e.target.value)}
            placeholder="Addiction Medicine"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="licenseNumber">License Number</Label>
          <Input
            id="licenseNumber"
            value={formData.licenseNumber}
            onChange={(e) => handleInputChange('licenseNumber', e.target.value)}
            placeholder="Enter license number"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="licenseState">License State</Label>
          <Input
            id="licenseState"
            value={formData.licenseState}
            onChange={(e) => handleInputChange('licenseState', e.target.value)}
            placeholder="CA"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="licenseExpiry">License Expiry Date</Label>
          <Input
            id="licenseExpiry"
            value={formData.licenseExpiry}
            type="date"
            onChange={(e) => handleInputChange('licenseExpiry', e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="providerStatus">Provider Status</Label>
          <Select
            value={formData.providerStatus}
            onValueChange={(value) => handleInputChange('providerStatus', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
              <SelectItem value="suspended">Suspended</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex justify-end">
        <Button 
          onClick={handleVerifyProvider}
          disabled={!formData.providerName || isVerifying}
          className="flex items-center gap-2"
        >
          {isVerifying ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Verifying Provider...
            </>
          ) : (
            <>
              <Shield className="h-4 w-4" />
              Verify Provider
            </>
          )}
        </Button>
      </div>

      {formData.verificationStatus === 'verified' && (
        <Alert className="border-green-200 bg-green-50">
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
      <Alert>
        <Building className="h-4 w-4" />
        <AlertDescription>
          Treatment Center information for organizational providers and facility credentialing.
        </AlertDescription>
      </Alert>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="facilityName">Facility Name *</Label>
          <Input
            id="facilityName"
            value={formData.facilityName}
            onChange={(e) => handleInputChange('facilityName', e.target.value)}
            placeholder="Sunrise Recovery Center"
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
              <SelectItem value="inpatient">Inpatient Treatment</SelectItem>
              <SelectItem value="outpatient">Outpatient Treatment</SelectItem>
              <SelectItem value="residential">Residential Treatment</SelectItem>
              <SelectItem value="detox">Detoxification Center</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="facilityNPI">Facility NPI *</Label>
          <Input
            id="facilityNPI"
            value={formData.facilityNPI}
            onChange={(e) => handleInputChange('facilityNPI', e.target.value)}
            placeholder="1234567890"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="facilityAddress">Address</Label>
          <Input
            id="facilityAddress"
            value={formData.facilityAddress}
            onChange={(e) => handleInputChange('facilityAddress', e.target.value)}
            placeholder="123 Recovery Lane"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="facilityCity">City</Label>
          <Input
            id="facilityCity"
            value={formData.facilityCity}
            onChange={(e) => handleInputChange('facilityCity', e.target.value)}
            placeholder="Los Angeles"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="facilityState">State</Label>
          <Input
            id="facilityState"
            value={formData.facilityState}
            onChange={(e) => handleInputChange('facilityState', e.target.value)}
            placeholder="CA"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="facilityLicenseNumber">Facility License Number</Label>
          <Input
            id="facilityLicenseNumber"
            value={formData.facilityLicenseNumber}
            onChange={(e) => handleInputChange('facilityLicenseNumber', e.target.value)}
            placeholder="Enter facility license number"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="facilityLicenseExpiry">License Expiry Date</Label>
          <Input
            id="facilityLicenseExpiry"
            value={formData.facilityLicenseExpiry}
            type="date"
            onChange={(e) => handleInputChange('facilityLicenseExpiry', e.target.value)}
            placeholder="License expiration date"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="facilityStatus">Facility Status</Label>
          <Select
            value={formData.facilityStatus}
            onValueChange={(value) => handleInputChange('facilityStatus', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
              <SelectItem value="suspended">Suspended</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex justify-end">
        <Button 
          onClick={handleVerifyTreatmentCenter}
          disabled={!formData.facilityName || isVerifying}
          className="flex items-center gap-2"
        >
          {isVerifying ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Verifying Treatment Center...
            </>
          ) : (
            <>
              <Shield className="h-4 w-4" />
              Verify Treatment Center
            </>
          )}
        </Button>
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
          <Label htmlFor="referralNetworkType">Network Type</Label>
          <Select
            value={formData.referralNetworkType}
            onValueChange={(value) => handleInputChange('referralNetworkType', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select network type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="preferred">Preferred Provider Network</SelectItem>
              <SelectItem value="hmo">HMO Network</SelectItem>
              <SelectItem value="ppo">PPO Network</SelectItem>
              <SelectItem value="ace">ACE Network</SelectItem>
              <SelectItem value="independent">Independent Network</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex justify-end">
        <Button 
          onClick={handleVerifyReferralNetwork}
          disabled={!formData.referralNetworkName || isVerifying}
          className="flex items-center gap-2"
        >
          {isVerifying ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Verifying Network...
            </>
          ) : (
            <>
              <Shield className="h-4 w-4" />
              Verify Network
            </>
          )}
        </Button>
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

export default EnhancedNPIVerificationForm;