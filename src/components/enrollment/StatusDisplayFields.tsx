import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  Database,
  Shield,
  Activity
} from 'lucide-react';

interface StatusDisplayFieldsProps {
  providerStatus?: 'pending' | 'verified' | 'failed' | 'not_verified';
  treatmentCenterStatus?: 'pending' | 'verified' | 'failed' | 'not_verified';
  referralNetworkStatus?: 'pending' | 'verified' | 'failed' | 'not_verified';
  credentialingStatus?: 'pending' | 'in_progress' | 'completed' | 'failed';
  overallStatus?: 'incomplete' | 'in_progress' | 'completed' | 'verified';
  lastVerified?: string;
  dbWriteStatus?: 'pending' | 'success' | 'failed';
  dbWriteDetails?: string;
}

export const StatusDisplayFields: React.FC<StatusDisplayFieldsProps> = ({
  providerStatus = 'not_verified',
  treatmentCenterStatus = 'not_verified', 
  referralNetworkStatus = 'not_verified',
  credentialingStatus = 'pending',
  overallStatus = 'incomplete',
  lastVerified,
  dbWriteStatus = 'pending',
  dbWriteDetails
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'verified':
      case 'completed':
      case 'success':
        return 'default';
      case 'pending':
      case 'in_progress':
        return 'secondary';
      case 'failed':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'verified':
      case 'completed':
      case 'success':
        return <CheckCircle2 className="h-3 w-3" />;
      case 'pending':
      case 'in_progress':
        return <Clock className="h-3 w-3" />;
      case 'failed':
        return <AlertTriangle className="h-3 w-3" />;
      default:
        return <Activity className="h-3 w-3" />;
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Verification Status Dashboard
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Verification Status Section */}
        <div>
          <h4 className="font-semibold mb-3 flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4" />
            Verification Status
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="flex flex-col gap-1">
              <span className="text-xs text-muted-foreground">Provider</span>
              <Badge variant={getStatusColor(providerStatus)} className="flex items-center gap-1 justify-center">
                {getStatusIcon(providerStatus)}
                {providerStatus}
              </Badge>
            </div>
            
            <div className="flex flex-col gap-1">
              <span className="text-xs text-muted-foreground">Treatment Center</span>
              <Badge variant={getStatusColor(treatmentCenterStatus)} className="flex items-center gap-1 justify-center">
                {getStatusIcon(treatmentCenterStatus)}
                {treatmentCenterStatus}
              </Badge>
            </div>
            
            <div className="flex flex-col gap-1">
              <span className="text-xs text-muted-foreground">Referral Network</span>
              <Badge variant={getStatusColor(referralNetworkStatus)} className="flex items-center gap-1 justify-center">
                {getStatusIcon(referralNetworkStatus)}
                {referralNetworkStatus}
              </Badge>
            </div>
            
            <div className="flex flex-col gap-1">
              <span className="text-xs text-muted-foreground">Credentialing</span>
              <Badge variant={getStatusColor(credentialingStatus)} className="flex items-center gap-1 justify-center">
                {getStatusIcon(credentialingStatus)}
                {credentialingStatus}
              </Badge>
            </div>
          </div>
        </div>

        <Separator />

        {/* Overall Status Section */}
        <div>
          <h4 className="font-semibold mb-3 flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Overall Status
          </h4>
          <div className="flex items-center gap-4">
            <Badge variant={getStatusColor(overallStatus)} className="flex items-center gap-2 px-3 py-1">
              {getStatusIcon(overallStatus)}
              Overall: {overallStatus}
            </Badge>
            {lastVerified && (
              <span className="text-sm text-muted-foreground">
                Last verified: {new Date(lastVerified).toLocaleString()}
              </span>
            )}
          </div>
        </div>

        <Separator />

        {/* Database Status Section */}
        <div>
          <h4 className="font-semibold mb-3 flex items-center gap-2">
            <Database className="h-4 w-4" />
            Database Operations
          </h4>
          <div className="flex items-center gap-4">
            <Badge variant={getStatusColor(dbWriteStatus)} className="flex items-center gap-2 px-3 py-1">
              {getStatusIcon(dbWriteStatus)}
              DB Write: {dbWriteStatus}
            </Badge>
            {dbWriteDetails && (
              <span className="text-sm text-muted-foreground">
                {dbWriteDetails}
              </span>
            )}
          </div>
          <div className="mt-2 text-xs text-muted-foreground">
            Data saved to: provider_enrollments, treatment_center_enrollments, referral_network_enrollments tables
          </div>
        </div>

        {/* Technical Details */}
        <div className="bg-muted/50 p-3 rounded-lg">
          <h5 className="text-sm font-medium mb-2">Technical Implementation</h5>
          <ul className="text-xs text-muted-foreground space-y-1">
            <li>• Individual UUID-mapped database fields (no JSONB)</li>
            <li>• Row-Level Security (RLS) policies enforced</li>
            <li>• Real-time verification status updates</li>
            <li>• NPPES registry integration for provider verification</li>
            <li>• Comprehensive audit trail and timestamp tracking</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default StatusDisplayFields;