/**
 * NPI VERIFICATION AGENT
 * Specialized agent for verifying provider credentials and treatment center licenses
 */
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Shield, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Clock, 
  Search,
  FileText,
  Building,
  User,
  Loader2
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface NPIVerificationData {
  npi: string;
  providerType: 'individual' | 'organization';
  providerName?: string;
  state?: string;
  licenseNumber?: string;
  deaNumber?: string;
  facilityId?: string;
  enrollmentId?: string;
}

interface VerificationResult {
  isValid: boolean;
  npiData?: any;
  licenseVerification?: any;
  deaVerification?: any;
  verificationStatus: 'verified' | 'failed' | 'partial' | 'pending';
  issues: string[];
  verifiedAt: string;
  confidence: number;
}

interface NPIVerificationAgentProps {
  verificationData: NPIVerificationData;
  onVerificationComplete: (result: VerificationResult) => void;
  onRetry?: () => void;
  autoStart?: boolean;
}

export const NPIVerificationAgent: React.FC<NPIVerificationAgentProps> = ({
  verificationData,
  onVerificationComplete,
  onRetry,
  autoStart = true
}) => {
  const { toast } = useToast();
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState<VerificationResult | null>(null);
  const [currentStep, setCurrentStep] = useState<string>('');
  const [progress, setProgress] = useState(0);
  const [retryCount, setRetryCount] = useState(0);

  const verificationSteps = [
    { id: 'npi', label: 'NPI Validation', weight: 40 },
    { id: 'license', label: 'License Verification', weight: 25 },
    { id: 'dea', label: 'DEA Verification', weight: 15 },
    { id: 'additional', label: 'Additional Checks', weight: 20 }
  ];

  useEffect(() => {
    if (autoStart && verificationData.npi) {
      startVerification();
    }
  }, [autoStart, verificationData.npi]);

  const startVerification = async () => {
    if (!verificationData.npi) {
      toast({
        title: "Verification Error",
        description: "NPI number is required for verification",
        variant: "destructive",
      });
      return;
    }

    setIsVerifying(true);
    setProgress(0);
    setVerificationResult(null);

    try {
      console.log('🔍 Starting NPI verification process...');
      
      // Step 1: NPI Validation
      setCurrentStep('Validating NPI format and registry...');
      setProgress(10);
      
      // Call the verification edge function
      const { data, error } = await supabase.functions.invoke('verify-npi-credentials', {
        body: verificationData
      });

      if (error) {
        throw new Error(error.message);
      }

      if (!data.success) {
        throw new Error(data.error || 'Verification failed');
      }

      const result = data.verification as VerificationResult;
      
      // Simulate step-by-step progress for UI
      setCurrentStep('Verifying NPI with NPPES database...');
      setProgress(30);
      await new Promise(resolve => setTimeout(resolve, 1000));

      setCurrentStep('Checking state license information...');
      setProgress(55);
      await new Promise(resolve => setTimeout(resolve, 800));

      setCurrentStep('Validating DEA registration...');
      setProgress(75);
      await new Promise(resolve => setTimeout(resolve, 600));

      setCurrentStep('Performing additional verification checks...');
      setProgress(90);
      await new Promise(resolve => setTimeout(resolve, 500));

      setCurrentStep('Verification complete');
      setProgress(100);

      setVerificationResult(result);
      onVerificationComplete(result);

      // Show appropriate toast based on result
      if (result.verificationStatus === 'verified') {
        toast({
          title: "Verification Successful",
          description: `Provider credentials verified with ${result.confidence}% confidence`,
        });
      } else if (result.verificationStatus === 'partial') {
        toast({
          title: "Partial Verification",
          description: "Some credentials verified, review issues below",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Verification Failed",
          description: "Provider credentials could not be verified",
          variant: "destructive",
        });
      }

    } catch (error) {
      console.error('Verification error:', error);
      
      const failedResult: VerificationResult = {
        isValid: false,
        verificationStatus: 'failed',
        issues: [error instanceof Error ? error.message : 'Unknown error'],
        verifiedAt: new Date().toISOString(),
        confidence: 0
      };
      
      setVerificationResult(failedResult);
      onVerificationComplete(failedResult);
      
      toast({
        title: "Verification Error",
        description: error instanceof Error ? error.message : 'Verification failed',
        variant: "destructive",
      });
    } finally {
      setIsVerifying(false);
      setCurrentStep('');
    }
  };

  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
    if (onRetry) {
      onRetry();
    } else {
      startVerification();
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'verified':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'partial':
        return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
      case 'failed':
        return <XCircle className="h-5 w-5 text-red-600" />;
      default:
        return <Clock className="h-5 w-5 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'verified': return 'bg-green-100 text-green-800 border-green-200';
      case 'partial': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'failed': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Verification Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Shield className="h-6 w-6 text-primary" />
            </div>
            NPI Verification Agent
            {verificationResult && (
              <Badge className={`ml-auto ${getStatusColor(verificationResult.verificationStatus)}`}>
                {getStatusIcon(verificationResult.verificationStatus)}
                {verificationResult.verificationStatus.toUpperCase()}
              </Badge>
            )}
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Verifying provider credentials and licenses for compliance
          </p>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Provider Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              {verificationData.providerType === 'individual' ? (
                <User className="h-4 w-4 text-muted-foreground" />
              ) : (
                <Building className="h-4 w-4 text-muted-foreground" />
              )}
              <span className="text-sm font-medium">NPI:</span>
              <span className="text-sm">{verificationData.npi}</span>
            </div>
            
            {verificationData.providerName && (
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Name:</span>
                <span className="text-sm">{verificationData.providerName}</span>
              </div>
            )}
            
            {verificationData.licenseNumber && (
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">License:</span>
                <span className="text-sm">{verificationData.licenseNumber}</span>
              </div>
            )}
            
            {verificationData.state && (
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">State:</span>
                <span className="text-sm">{verificationData.state}</span>
              </div>
            )}
          </div>

          {/* Progress Bar */}
          {isVerifying && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Verification Progress</span>
                <span className="text-sm text-muted-foreground">{progress}%</span>
              </div>
              <Progress value={progress} className="h-2" />
              {currentStep && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  {currentStep}
                </div>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button
              onClick={startVerification}
              disabled={isVerifying}
              className="flex-1"
            >
              {isVerifying ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Verifying...
                </>
              ) : (
                <>
                  <Search className="h-4 w-4 mr-2" />
                  {verificationResult ? 'Re-verify' : 'Start Verification'}
                </>
              )}
            </Button>
            
            {verificationResult && verificationResult.verificationStatus === 'failed' && retryCount < 3 && (
              <Button
                onClick={handleRetry}
                variant="outline"
                disabled={isVerifying}
              >
                Retry ({3 - retryCount} left)
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Verification Results */}
      {verificationResult && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {getStatusIcon(verificationResult.verificationStatus)}
              Verification Results
              <Badge variant="outline" className="ml-auto">
                {verificationResult.confidence}% Confidence
              </Badge>
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* NPI Data */}
            {verificationResult.npiData && (
              <div className="space-y-2">
                <h4 className="font-medium">NPI Registry Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                  <div><strong>Status:</strong> {verificationResult.npiData.status}</div>
                  <div><strong>Type:</strong> {verificationResult.npiData.providerType}</div>
                  {verificationResult.npiData.name && (
                    <div><strong>Name:</strong> {verificationResult.npiData.name}</div>
                  )}
                  {verificationResult.npiData.organizationName && (
                    <div><strong>Organization:</strong> {verificationResult.npiData.organizationName}</div>
                  )}
                  {verificationResult.npiData.enumerationDate && (
                    <div><strong>Enumeration Date:</strong> {new Date(verificationResult.npiData.enumerationDate).toLocaleDateString()}</div>
                  )}
                </div>
              </div>
            )}

            {/* License Verification */}
            {verificationResult.licenseVerification && (
              <div className="space-y-2">
                <h4 className="font-medium">License Verification</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                  <div><strong>Status:</strong> {verificationResult.licenseVerification.status}</div>
                  <div><strong>State:</strong> {verificationResult.licenseVerification.state}</div>
                  <div><strong>Expires:</strong> {verificationResult.licenseVerification.expirationDate}</div>
                </div>
              </div>
            )}

            {/* DEA Verification */}
            {verificationResult.deaVerification && (
              <div className="space-y-2">
                <h4 className="font-medium">DEA Verification</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                  <div><strong>Format:</strong> {verificationResult.deaVerification.format}</div>
                  <div><strong>Checksum:</strong> {verificationResult.deaVerification.checksum}</div>
                  <div><strong>Type:</strong> {verificationResult.deaVerification.registrantType}</div>
                </div>
              </div>
            )}

            {/* Issues */}
            {verificationResult.issues.length > 0 && (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Issues Found:</strong>
                  <ul className="mt-2 space-y-1">
                    {verificationResult.issues.map((issue, index) => (
                      <li key={index} className="text-sm">• {issue}</li>
                    ))}
                  </ul>
                </AlertDescription>
              </Alert>
            )}

            {/* Verification Steps */}
            <div className="space-y-2">
              <h4 className="font-medium">Verification Steps</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {verificationSteps.map((step) => (
                  <div key={step.id} className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-3 w-3 text-green-600" />
                    <span>{step.label}</span>
                    <Badge variant="outline" className="ml-auto text-xs">
                      {step.weight}%
                    </Badge>
                  </div>
                ))}
              </div>
            </div>

            <div className="text-xs text-muted-foreground">
              Verified at: {new Date(verificationResult.verifiedAt).toLocaleString()}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};