/**
 * PROVIDER VERIFICATION INTEGRATION
 * Component that integrates NPI verification into enrollment forms with real-time capability
 */
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { 
  Shield, 
  CheckCircle, 
  AlertTriangle, 
  User, 
  Building,
  FileText,
  Clock,
  Zap
} from 'lucide-react';
import { NPIVerificationAgent } from './NPIVerificationAgent';
import { useNPIVerification } from '@/hooks/useNPIVerification';
import { useRealTimeNPIVerification } from './RealTimeNPIVerificationProvider';
import { useToast } from '@/hooks/use-toast';

interface ProviderData {
  npi?: string;
  providerName?: string;
  licenseNumber?: string;
  state?: string;
  deaNumber?: string;
  providerType?: 'individual' | 'organization';
}

interface ProviderVerificationIntegrationProps {
  providerData: ProviderData;
  enrollmentId?: string;
  facilityId?: string;
  onVerificationComplete: (isVerified: boolean, result?: any) => void;
  autoTrigger?: boolean;
  mode?: 'inline' | 'modal' | 'card';
}

export const ProviderVerificationIntegration: React.FC<ProviderVerificationIntegrationProps> = ({
  providerData,
  enrollmentId,
  facilityId,
  onVerificationComplete,
  autoTrigger = false,
  mode = 'card'
}) => {
  const { toast } = useToast();
  const { 
    validateNPIFormat, 
    checkExistingVerification, 
    verifyCredentials,
    isVerifying 
  } = useNPIVerification();
  
  const { settings, isEnabled: realTimeEnabled } = useRealTimeNPIVerification();
  
  const [showVerificationAgent, setShowVerificationAgent] = useState(false);
  const [verificationData, setVerificationData] = useState(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [existingVerification, setExistingVerification] = useState(null);
  const [isCheckingExisting, setIsCheckingExisting] = useState(false);
  const [isRealTimeVerifying, setIsRealTimeVerifying] = useState(false);
  const [realTimeResult, setRealTimeResult] = useState(null);
  
  const debounceTimerRef = useRef<NodeJS.Timeout>();

  // Real-time verification with debouncing
  const performRealTimeVerification = useCallback(async (npi: string) => {
    if (!realTimeEnabled || !settings.backgroundVerification) return;

    setIsRealTimeVerifying(true);
    
    try {
      const verificationPayload = {
        npi,
        providerType: providerData.providerType || 'individual',
        providerName: providerData.providerName,
        state: providerData.state,
        licenseNumber: providerData.licenseNumber,
        deaNumber: providerData.deaNumber,
        enrollmentId,
        facilityId
      };

      const result = await verifyCredentials(verificationPayload);
      setRealTimeResult(result);
      
      if (result.isValid && settings.autoVerifyOnComplete) {
        onVerificationComplete(result.isValid, result);
      }
      
    } catch (error) {
      console.error('Real-time verification failed:', error);
    } finally {
      setIsRealTimeVerifying(false);
    }
  }, [realTimeEnabled, settings, providerData, verifyCredentials, onVerificationComplete]);

  // Validate provider data and handle real-time verification
  useEffect(() => {
    if (providerData.npi) {
      validateAndCheckExisting();
      
      // Real-time verification with debouncing
      if (realTimeEnabled && providerData.npi.length === 10) {
        if (debounceTimerRef.current) {
          clearTimeout(debounceTimerRef.current);
        }
        
        debounceTimerRef.current = setTimeout(() => {
          performRealTimeVerification(providerData.npi);
        }, settings.debounceMs);
      }
    }
    
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [providerData.npi, realTimeEnabled, settings.debounceMs, performRealTimeVerification]);

  // Auto-trigger verification if enabled and data is valid
  useEffect(() => {
    if (autoTrigger && providerData.npi && validationErrors.length === 0 && !existingVerification) {
      handleStartVerification();
    }
  }, [autoTrigger, providerData.npi, validationErrors, existingVerification]);

  const validateAndCheckExisting = async () => {
    if (!providerData.npi) return;

    // Validate NPI format
    const validation = validateNPIFormat(providerData.npi);
    if (!validation.isValid) {
      setValidationErrors([validation.error || 'Invalid NPI format']);
      return;
    }
    
    setValidationErrors([]);

    // Check for existing verification
    setIsCheckingExisting(true);
    try {
      const existing = await checkExistingVerification(providerData.npi);
      setExistingVerification(existing);
      
      if (existing) {
        toast({
          title: "Existing Verification Found",
          description: `NPI ${providerData.npi} was verified ${Math.floor((Date.now() - new Date(existing.verifiedAt).getTime()) / (1000 * 60 * 60 * 24))} days ago`,
        });
        
        onVerificationComplete(existing.isValid, existing);
      }
    } catch (error) {
      console.error('Error checking existing verification:', error);
    } finally {
      setIsCheckingExisting(false);
    }
  };

  const handleStartVerification = () => {
    if (!providerData.npi) {
      toast({
        title: "Missing NPI",
        description: "NPI number is required for verification",
        variant: "destructive",
      });
      return;
    }

    const data = {
      npi: providerData.npi,
      providerType: providerData.providerType || 'individual',
      providerName: providerData.providerName,
      state: providerData.state,
      licenseNumber: providerData.licenseNumber,
      deaNumber: providerData.deaNumber,
      enrollmentId,
      facilityId
    };

    setVerificationData(data);
    setShowVerificationAgent(true);
  };

  const handleVerificationComplete = (result: any) => {
    setVerificationData(null);
    setShowVerificationAgent(false);
    onVerificationComplete(result.isValid, result);

    // Update existing verification state
    if (result.isValid) {
      setExistingVerification(result);
    }
  };

  const getStatusDisplay = () => {
    // Real-time verification result takes priority
    if (realTimeResult?.isValid) {
      return (
        <div className="flex items-center gap-2">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <span className="text-sm text-green-700">Verified (Real-time)</span>
          <Badge variant="outline" className="text-xs">
            {realTimeResult.confidence}% confidence
          </Badge>
          <Zap className="h-3 w-3 text-blue-500" />
        </div>
      );
    }

    if (existingVerification) {
      return (
        <div className="flex items-center gap-2">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <span className="text-sm text-green-700">Verified</span>
          <Badge variant="outline" className="text-xs">
            {existingVerification.confidence}% confidence
          </Badge>
        </div>
      );
    }

    if (isRealTimeVerifying) {
      return (
        <div className="flex items-center gap-2">
          <Zap className="h-4 w-4 text-blue-600 animate-pulse" />
          <span className="text-sm text-blue-700">Verifying in background...</span>
        </div>
      );
    }

    if (validationErrors.length > 0) {
      return (
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <span className="text-sm text-red-700">Invalid Format</span>
        </div>
      );
    }

    if (isCheckingExisting) {
      return (
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-gray-600 animate-spin" />
          <span className="text-sm text-gray-700">Checking...</span>
        </div>
      );
    }

    return (
      <div className="flex items-center gap-2">
        <Shield className="h-4 w-4 text-gray-600" />
        <span className="text-sm text-gray-700">Not Verified</span>
        {realTimeEnabled && (
          <Badge variant="secondary" className="text-xs">
            Real-time enabled
          </Badge>
        )}
      </div>
    );
  };

  if (showVerificationAgent && verificationData) {
    return (
      <NPIVerificationAgent
        verificationData={verificationData}
        onVerificationComplete={handleVerificationComplete}
        onRetry={() => setShowVerificationAgent(false)}
        autoStart={true}
      />
    );
  }

  if (mode === 'inline') {
    return (
      <div className="space-y-4">
        {/* Provider Info Summary */}
        <div className="flex items-center justify-between p-3 border rounded-lg bg-muted/50">
          <div className="flex items-center gap-3">
            {providerData.providerType === 'organization' ? (
              <Building className="h-4 w-4 text-muted-foreground" />
            ) : (
              <User className="h-4 w-4 text-muted-foreground" />
            )}
            <div>
              <div className="text-sm font-medium">
                {providerData.providerName || 'Provider'}
              </div>
              {providerData.npi && (
                <div className="text-xs text-muted-foreground">
                  NPI: {providerData.npi}
                </div>
              )}
            </div>
          </div>
          {getStatusDisplay()}
        </div>

        {/* Validation Errors */}
        {validationErrors.length > 0 && (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <ul className="list-disc pl-4">
                {validationErrors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        )}

        {/* Existing Verification Info */}
        {existingVerification && (
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              Provider credentials were verified {Math.floor((Date.now() - new Date(existingVerification.verifiedAt).getTime()) / (1000 * 60 * 60 * 24))} days ago 
              with {existingVerification.confidence}% confidence.
              {existingVerification.issues?.length > 0 && (
                <div className="mt-2">
                  <strong>Issues noted:</strong>
                  <ul className="list-disc pl-4 mt-1">
                    {existingVerification.issues.map((issue, index) => (
                      <li key={index} className="text-sm">{issue}</li>
                    ))}
                  </ul>
                </div>
              )}
            </AlertDescription>
          </Alert>
        )}

        {/* Verification Button */}
        {!existingVerification && validationErrors.length === 0 && providerData.npi && (
          <Button
            onClick={handleStartVerification}
            disabled={isVerifying || isCheckingExisting}
            className="w-full"
          >
            <Shield className="h-4 w-4 mr-2" />
            {isVerifying ? 'Verifying...' : 'Verify Provider Credentials'}
          </Button>
        )}
      </div>
    );
  }

  return (
    <Card className="border-2 border-dashed border-primary/20 bg-primary/5">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-primary" />
          Provider Credential Verification
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Verify NPI, licenses, and other credentials for healthcare compliance
        </p>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Provider Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">NPI:</span>
              <span className="text-sm">{providerData.npi || 'Not provided'}</span>
            </div>
            
            {providerData.providerName && (
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Name:</span>
                <span className="text-sm">{providerData.providerName}</span>
              </div>
            )}
            
            {providerData.licenseNumber && (
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">License:</span>
                <span className="text-sm">{providerData.licenseNumber}</span>
              </div>
            )}
          </div>

          <div className="flex items-center justify-center">
            {getStatusDisplay()}
          </div>
        </div>

        {/* Validation Errors */}
        {validationErrors.length > 0 && (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Please fix the following issues before verification:
              <ul className="list-disc pl-4 mt-2">
                {validationErrors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        )}

        {/* Existing Verification Display */}
        {existingVerification && (
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Already Verified:</strong> This provider was verified {Math.floor((Date.now() - new Date(existingVerification.verifiedAt).getTime()) / (1000 * 60 * 60 * 24))} days ago.
              <Button
                variant="link"
                className="p-0 h-auto text-primary"
                onClick={handleStartVerification}
              >
                Re-verify credentials
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* Action Button */}
        {!existingVerification && (
          <Button
            onClick={handleStartVerification}
            disabled={!providerData.npi || validationErrors.length > 0 || isVerifying || isCheckingExisting}
            className="w-full"
          >
            {isCheckingExisting ? (
              <>
                <Clock className="h-4 w-4 mr-2 animate-spin" />
                Checking Existing Verification...
              </>
            ) : (
              <>
                <Shield className="h-4 w-4 mr-2" />
                {isVerifying ? 'Starting Verification...' : 'Verify Provider Credentials'}
              </>
            )}
          </Button>
        )}
      </CardContent>
    </Card>
  );
};
