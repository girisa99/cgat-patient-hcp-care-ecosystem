/**
 * ENHANCED PROVIDER FORM WITH CONFIRMATION
 * Wrapper component that handles NPI verification confirmation flow
 * Shows modal to choose between manual entry and auto-verification
 */
import React, { useState, useEffect } from 'react';
import { EnhancedProviderForm } from './EnhancedProviderForm';
import { NPIVerificationConfirmationModal } from './NPIVerificationConfirmationModal';
import { NPIVerificationComponent } from './NPIVerificationComponent';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Settings, 
  Edit, 
  ShieldCheck, 
  CheckCircle, 
  RefreshCw,
  Info
} from 'lucide-react';
import { useEnrollmentAgent } from '@/hooks/useEnrollmentAgent';
import { useMasterToast } from '@/hooks/useMasterToast';

interface ProviderFormData {
  firstName: string;
  lastName: string;
  middleInitial: string;
  suffix: string;
  npi: string;
  taxonomy: string;
  primarySpecialty: string;
  secondarySpecialty: string;
  email: string;
  phone: string;
  fax: string;
  dateOfBirth: string;
  ssn: string;
  medicalLicenseNumber: string;
  medicalLicenseState: string;
  medicalLicenseExpiration: string;
  facilityName: string;
  facilityNPI: string;
  facilityAddress: string;
  facilityCity: string;
  facilityState: string;
  facilityZip: string;
  facilityPhone: string;
  facilityType: string;
  deaNumber: string;
  deaExpiration: string;
  cdsNumber: string;
  boardCertification: string;
  boardCertificationExpiration: string;
  malpracticeInsurance: string;
  malpracticeCarrier: string;
  malpracticePolicyNumber: string;
  malpracticeExpiration: string;
  backgroundCheckStatus: string;
  credentialingStatus: string;
  lastCredentialingDate: string;
  suboxoneWaiver: string;
  suboxoneWaiverNumber: string;
  matCertification: string;
  opioidTreatmentLicense: string;
  specializedTraining: string;
  referralNetworkId: string;
  preferredReferralPartners: string;
  referralAgreements: string;
  // Verification metadata
  enableNPIVerification?: boolean;
  npiVerified?: boolean;
  verificationMethod?: 'manual' | 'verify';
}

interface EnhancedProviderFormWithConfirmationProps {
  onSubmit?: (data: ProviderFormData) => void;
  initialData?: Partial<ProviderFormData>;
  sectionType?: 'provider' | 'treatment_center' | 'referral';
  autoTriggerConfirmation?: boolean;
}

export const EnhancedProviderFormWithConfirmation: React.FC<EnhancedProviderFormWithConfirmationProps> = ({
  onSubmit,
  initialData = {},
  sectionType = 'provider',
  autoTriggerConfirmation = true
}) => {
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [verificationMethod, setVerificationMethod] = useState<'manual' | 'verify' | null>(null);
  const [isVerificationComplete, setIsVerificationComplete] = useState(false);
  const [providerData, setProviderData] = useState<Partial<ProviderFormData>>(initialData);

  const { updateSection, currentSession } = useEnrollmentAgent();
  const { showSuccess, showInfo } = useMasterToast();

  // Show confirmation modal on component mount if auto-trigger is enabled
  useEffect(() => {
    if (autoTriggerConfirmation && !verificationMethod && !initialData.verificationMethod) {
      setShowConfirmationModal(true);
    }
  }, [autoTriggerConfirmation, verificationMethod, initialData.verificationMethod]);

  const handleMethodChoice = async (choice: { method: 'manual' | 'verify' | null; confirmed: boolean }) => {
    if (!choice.confirmed || !choice.method) {
      setVerificationMethod('manual'); // Default to manual if skipped
      showInfo('Defaulting to manual entry', 'You can switch to verification later');
      return;
    }

    setVerificationMethod(choice.method);
    
    // Update enrollment session with user preference
    if (currentSession) {
      await updateSection('provider_info', {
        verificationMethod: choice.method,
        enableNPIVerification: choice.method === 'verify'
      }, { skipNPIVerification: true }); // Skip auto-verification during preference setting
    }

    if (choice.method === 'verify') {
      showSuccess('NPI Verification Enabled', 'Enter your NPI to auto-fill provider information');
    } else {
      showSuccess('Manual Entry Selected', 'You can fill out all fields manually');
    }
  };

  const handleVerificationComplete = async (verificationData: any) => {
    setIsVerificationComplete(true);
    setProviderData(prev => ({ ...prev, ...verificationData }));
    
    // Update enrollment session with verified data
    if (currentSession) {
      await updateSection('provider_info', {
        ...verificationData,
        npiVerified: true,
        verificationCompleted: true
      });
    }

    showSuccess('Verification Complete', 'Provider information has been auto-filled');
  };

  const handleFormSubmit = async (formData: ProviderFormData) => {
    const finalData = {
      ...formData,
      verificationMethod,
      enableNPIVerification: verificationMethod === 'verify',
      npiVerified: isVerificationComplete
    };

    // Update enrollment session
    if (currentSession) {
      await updateSection('provider_info', finalData);
    }

    if (onSubmit) {
      onSubmit(finalData);
    }
  };

  const switchMethod = () => {
    setShowConfirmationModal(true);
  };

  const resetVerification = () => {
    setIsVerificationComplete(false);
    setProviderData(initialData);
    setVerificationMethod(null);
    setShowConfirmationModal(true);
  };

  return (
    <div className="space-y-6">
      {/* Method Selection Status */}
      {verificationMethod && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {verificationMethod === 'verify' ? (
                  <ShieldCheck className="h-5 w-5 text-blue-600" />
                ) : (
                  <Edit className="h-5 w-5 text-gray-600" />
                )}
                <div>
                  <span className="font-medium">
                    {verificationMethod === 'verify' ? 'NPI Verification Mode' : 'Manual Entry Mode'}
                  </span>
                  {isVerificationComplete && verificationMethod === 'verify' && (
                    <div className="flex items-center gap-1 text-sm text-green-600">
                      <CheckCircle className="h-3 w-3" />
                      Verification Complete
                    </div>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={verificationMethod === 'verify' ? 'default' : 'secondary'}>
                  {verificationMethod === 'verify' ? 'Auto-Fill' : 'Manual'}
                </Badge>
                <Button variant="outline" size="sm" onClick={switchMethod}>
                  <Settings className="h-3 w-3 mr-1" />
                  Switch
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* NPI Verification Component (only show if verify method and not completed) */}
      {verificationMethod === 'verify' && !isVerificationComplete && (
        <div className="space-y-4">
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              Enter your NPI number to automatically verify and fill provider information. 
              You can still edit any fields after verification completes.
            </AlertDescription>
          </Alert>
          
          <NPIVerificationComponent
            onVerificationComplete={handleVerificationComplete}
            autoTrigger={false}
          />
        </div>
      )}

      {/* Enhanced Provider Form */}
      {(verificationMethod === 'manual' || isVerificationComplete) && (
        <div className="space-y-4">
          {isVerificationComplete && (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription className="flex items-center justify-between">
                <span>Information auto-filled from NPI verification. Review and edit as needed.</span>
                <Button variant="outline" size="sm" onClick={resetVerification}>
                  <RefreshCw className="h-3 w-3 mr-1" />
                  Re-verify
                </Button>
              </AlertDescription>
            </Alert>
          )}
          
          <EnhancedProviderForm
            onSubmit={handleFormSubmit}
            initialData={providerData}
          />
        </div>
      )}

      {/* Confirmation Modal */}
      <NPIVerificationConfirmationModal
        isOpen={showConfirmationModal}
        onClose={() => setShowConfirmationModal(false)}
        onChoice={handleMethodChoice}
        sectionType={sectionType}
      />
    </div>
  );
};