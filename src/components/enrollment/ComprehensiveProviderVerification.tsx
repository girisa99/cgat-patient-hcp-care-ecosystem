/**
 * COMPREHENSIVE PROVIDER VERIFICATION
 * Integrates with SmartMCPStepwiseAgent for enhanced NPI verification
 * Includes provider, treatment center, and referral network verification
 */
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  User, 
  Building, 
  Network, 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle,
  Info
} from 'lucide-react';
import { EnhancedNPIVerificationForm } from './EnhancedNPIVerificationForm';
import { EnhancedProviderForm } from './EnhancedProviderForm';
import { NPIVerificationConfirmationModal } from './NPIVerificationConfirmationModal';
import { CrossTabValidationHelper } from './CrossTabValidationHelper';

interface ComprehensiveProviderVerificationProps {
  onSubmit: (data: any) => void;
  initialData?: any;
  sectionType?: 'provider' | 'treatment_center' | 'referral';
  autoTriggerConfirmation?: boolean;
}

export const ComprehensiveProviderVerification: React.FC<ComprehensiveProviderVerificationProps> = ({
  onSubmit,
  initialData = {},
  sectionType = 'provider',
  autoTriggerConfirmation = true
}) => {
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [verificationMethod, setVerificationMethod] = useState<'manual' | 'verify' | null>(null);
  const [isVerificationComplete, setIsVerificationComplete] = useState(false);
  const [providerData, setProviderData] = useState(initialData);
  const [activeVerificationTab, setActiveVerificationTab] = useState('provider');
  
  // Extract consent step data for cross-tab validation
  const consentData = initialData?._consentStepData || {
    provider_name: initialData?.provider_name,
    provider_npi: initialData?.provider_npi,
    treatment_center: initialData?.treatment_center,
    treatment_center_npi: initialData?.treatment_center_npi
  };

  // Show confirmation modal on component mount if auto-trigger is enabled
  useEffect(() => {
    if (autoTriggerConfirmation && !verificationMethod && !initialData.verificationMethod) {
      setShowConfirmationModal(true);
    }
  }, [autoTriggerConfirmation, verificationMethod, initialData.verificationMethod]);

  const handleMethodChoice = async (choice: { method: 'manual' | 'verify' | null; confirmed: boolean }) => {
    if (!choice.confirmed || !choice.method) {
      setVerificationMethod('manual'); // Default to manual if skipped
      return;
    }

    setVerificationMethod(choice.method);
    setShowConfirmationModal(false);
  };

  const handleVerificationComplete = (verificationData: any) => {
    setIsVerificationComplete(true);
    setProviderData(prev => ({ ...prev, ...verificationData }));
  };

  const handleFormSubmit = (formData: any) => {
    const finalData = {
      ...formData,
      verificationMethod,
      enableNPIVerification: verificationMethod === 'verify',
      npiVerified: isVerificationComplete,
      verification_timestamp: new Date().toISOString()
    };

    onSubmit(finalData);
  };

  const resetVerification = () => {
    setIsVerificationComplete(false);
    setProviderData(initialData);
    setVerificationMethod(null);
    setShowConfirmationModal(true);
  };

  const handleCrossTabSync = (field: string, value: string) => {
    setProviderData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleCrossTabValidate = () => {
    // Trigger validation logic
    console.log('Cross-tab validation requested');
  };

  return (
    <div className="space-y-6">
      {/* Cross-Tab Validation Helper */}
      {consentData && Object.keys(consentData).some(key => consentData[key as keyof typeof consentData]) && (
        <div className="mb-6">
          <CrossTabValidationHelper
            consentData={consentData}
            currentData={providerData}
            onSync={handleCrossTabSync}
            onValidate={handleCrossTabValidate}
          />
        </div>
      )}

      {/* Method Selection Status */}
      {verificationMethod && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {verificationMethod === 'verify' ? (
                  <ShieldCheck className="h-5 w-5 text-blue-600" />
                ) : (
                  <User className="h-5 w-5 text-gray-600" />
                )}
                <div>
                  <span className="font-medium">
                    {verificationMethod === 'verify' ? 'Enhanced NPI Verification Mode' : 'Manual Entry Mode'}
                  </span>
                  {isVerificationComplete && verificationMethod === 'verify' && (
                    <div className="flex items-center gap-1 text-sm text-green-600">
                      <CheckCircle2 className="h-3 w-3" />
                      Verification Complete
                    </div>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={verificationMethod === 'verify' ? 'default' : 'secondary'}>
                  {verificationMethod === 'verify' ? 'Auto-Verify' : 'Manual'}
                </Badge>
                <Button variant="outline" size="sm" onClick={() => setShowConfirmationModal(true)}>
                  Switch Method
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Enhanced NPI Verification (only show if verify method and not completed) */}
      {verificationMethod === 'verify' && !isVerificationComplete && (
        <div className="space-y-4">
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              <strong>Enhanced Verification Process:</strong>
              <ul className="mt-2 list-disc list-inside space-y-1 text-sm">
                <li>Provider NPI verification using NPPES registry</li>
                <li>Treatment Center (Type 2 NPI) validation</li>
                <li>Referral network credentialing checks</li>
                <li>Automatic data population following online form sequence</li>
                <li>Database saving with PostgreSQL UUID standards</li>
              </ul>
            </AlertDescription>
          </Alert>
          
          <EnhancedNPIVerificationForm
            onVerificationComplete={handleVerificationComplete}
            initialData={providerData}
            autoTriggerVerification={false}
          />
        </div>
      )}

      {/* Enhanced Provider Form */}
      {(verificationMethod === 'manual' || isVerificationComplete || (!verificationMethod && !showConfirmationModal)) && (
        <div className="space-y-4">
          {isVerificationComplete && (
            <Alert>
              <CheckCircle2 className="h-4 w-4" />
              <AlertDescription className="flex items-center justify-between">
                <span>Provider information has been verified and auto-filled. Review and edit as needed.</span>
                <Button variant="outline" size="sm" onClick={resetVerification}>
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

      {/* Database Standards Information */}
      <Card className="border-blue-200 bg-blue-50/30">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-blue-900">
            Database Standards Compliance
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0 text-sm text-blue-800">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <strong>UUID Standards:</strong>
              <ul className="mt-1 text-xs space-y-1">
                <li>• Auto-generated UUID for all records</li>
                <li>• Foreign key relationships properly maintained</li>
                <li>• Optimized indexing for performance</li>
              </ul>
            </div>
            <div>
              <strong>Data Validation:</strong>
              <ul className="mt-1 text-xs space-y-1">
                <li>• NPI format validation (10 digits)</li>
                <li>• Real-time NPPES registry verification</li>
                <li>• PostgreSQL constraint enforcement</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

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