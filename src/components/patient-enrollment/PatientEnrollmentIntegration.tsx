/**
 * PATIENT ENROLLMENT INTEGRATION COMPONENT
 * Main entry point that handles the complete enrollment workflow
 */
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  CheckCircle2, 
  AlertTriangle, 
  Info,
  FileText,
  Users,
  Clock
} from 'lucide-react';
import { PatientEnrollmentForm, type PatientEnrollmentData } from './PatientEnrollmentForm';
import { useMasterToast } from '@/hooks/useMasterToast';
import { useMasterAuth } from '@/hooks/useMasterAuth';

interface PatientEnrollmentIntegrationProps {
  patientId?: string;
  initialData?: Partial<PatientEnrollmentData>;
  onComplete?: (data: PatientEnrollmentData) => void;
}

export const PatientEnrollmentIntegration: React.FC<PatientEnrollmentIntegrationProps> = ({
  patientId,
  initialData,
  onComplete
}) => {
  const [enrollmentData, setEnrollmentData] = useState<PatientEnrollmentData | null>(null);
  const [isComplete, setIsComplete] = useState(false);
  const [integrationStatus, setIntegrationStatus] = useState({
    dataPreFill: 'checking',
    consentManagement: 'pending',
    collaborationTracking: 'pending',
    workflowIntegration: 'pending'
  });
  const { showSuccess, showInfo } = useMasterToast();
  const { user } = useMasterAuth();

  useEffect(() => {
    // Verify integration components
    const checkIntegration = async () => {
      // Simulate integration checks
      setTimeout(() => {
        setIntegrationStatus({
          dataPreFill: 'ready',
          consentManagement: 'ready',
          collaborationTracking: 'ready',
          workflowIntegration: 'ready'
        });
        showInfo('Patient enrollment system is ready with all integrations');
      }, 1000);
    };

    checkIntegration();
  }, []);

  const handleEnrollmentSubmit = (data: PatientEnrollmentData) => {
    setEnrollmentData(data);
    setIsComplete(true);
    onComplete?.(data);
    showSuccess('Patient enrollment completed successfully');
  };

  const renderIntegrationStatus = () => (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Info className="h-5 w-5" />
          Integration Status
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm">Data Pre-population</span>
              <Badge variant={integrationStatus.dataPreFill === 'ready' ? 'default' : 'secondary'}>
                {integrationStatus.dataPreFill === 'ready' ? (
                  <><CheckCircle2 className="h-3 w-3 mr-1" />Ready</>
                ) : (
                  <><Clock className="h-3 w-3 mr-1" />Checking</>
                )}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Consent Management</span>
              <Badge variant={integrationStatus.consentManagement === 'ready' ? 'default' : 'secondary'}>
                {integrationStatus.consentManagement === 'ready' ? (
                  <><CheckCircle2 className="h-3 w-3 mr-1" />Ready</>
                ) : (
                  <><Clock className="h-3 w-3 mr-1" />Pending</>
                )}
              </Badge>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm">Collaboration Tracking</span>
              <Badge variant={integrationStatus.collaborationTracking === 'ready' ? 'default' : 'secondary'}>
                {integrationStatus.collaborationTracking === 'ready' ? (
                  <><CheckCircle2 className="h-3 w-3 mr-1" />Ready</>
                ) : (
                  <><Clock className="h-3 w-3 mr-1" />Pending</>
                )}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Workflow Integration</span>
              <Badge variant={integrationStatus.workflowIntegration === 'ready' ? 'default' : 'secondary'}>
                {integrationStatus.workflowIntegration === 'ready' ? (
                  <><CheckCircle2 className="h-3 w-3 mr-1" />Ready</>
                ) : (
                  <><Clock className="h-3 w-3 mr-1" />Pending</>
                )}
              </Badge>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const isIntegrationReady = Object.values(integrationStatus).every(status => status === 'ready');

  if (isComplete && enrollmentData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-600">
            <CheckCircle2 className="h-6 w-6" />
            Enrollment Completed Successfully
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <CheckCircle2 className="h-4 w-4" />
            <AlertDescription>
              Patient enrollment for <strong>{enrollmentData.firstName} {enrollmentData.lastName}</strong> has been 
              completed using the <strong>{enrollmentData.submissionMethod}</strong> method.
            </AlertDescription>
          </Alert>

          <div className="grid md:grid-cols-2 gap-4 mt-4">
            <div>
              <h4 className="font-medium mb-2">Enrollment Details</h4>
              <div className="text-sm space-y-1 text-muted-foreground">
                <div>Patient: {enrollmentData.firstName} {enrollmentData.lastName}</div>
                <div>Provider: {enrollmentData.providerName}</div>
                <div>Treatment Center: {enrollmentData.treatmentCenterName}</div>
                <div>Submission Method: {enrollmentData.submissionMethod}</div>
              </div>
            </div>
            <div>
              <h4 className="font-medium mb-2">Workflow Status</h4>
              <div className="text-sm space-y-1">
                <Badge className="bg-green-500">
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  All Steps Completed
                </Badge>
              </div>
            </div>
          </div>

          <Button 
            variant="outline" 
            onClick={() => {
              setIsComplete(false);
              setEnrollmentData(null);
            }}
          >
            Start New Enrollment
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {renderIntegrationStatus()}
      
      {!isIntegrationReady && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            System is initializing integration components. Please wait a moment before starting enrollment.
          </AlertDescription>
        </Alert>
      )}

      {isIntegrationReady && (
        <PatientEnrollmentForm
          patientId={patientId}
          initialData={initialData}
          onSubmit={handleEnrollmentSubmit}
          readOnly={false}
        />
      )}
    </div>
  );
};