import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Shield, CheckCircle, AlertTriangle } from 'lucide-react';

interface HealthcareComplianceConfigurationNodeProps {
  data: {
    label: string;
    config?: {
      hipaa_enabled?: boolean;
      phi_encryption?: boolean;
      audit_logging?: boolean;
      access_controls?: boolean;
      data_retention_days?: number;
      compliance_level?: string;
    };
  };
}

const HealthcareComplianceConfigurationNode: React.FC<HealthcareComplianceConfigurationNodeProps> = ({ data }) => {
  const config = data.config || {};
  
  const complianceFeatures = [
    { key: 'hipaa_enabled', label: 'HIPAA Compliance', enabled: config.hipaa_enabled !== false },
    { key: 'phi_encryption', label: 'PHI Encryption', enabled: config.phi_encryption !== false },
    { key: 'audit_logging', label: 'Audit Logging', enabled: config.audit_logging !== false },
    { key: 'access_controls', label: 'Access Controls', enabled: config.access_controls !== false },
  ];

  const enabledCount = complianceFeatures.filter(f => f.enabled).length;
  const complianceScore = Math.round((enabledCount / complianceFeatures.length) * 100);

  return (
    <div className="min-w-[300px]">
      <Handle type="target" position={Position.Top} />
      
      <Card className="border-2 border-green-500/20 bg-background/95 backdrop-blur-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-green-500/10">
              <Shield className="h-4 w-4 text-green-600" />
            </div>
            <div>
              <CardTitle className="text-sm font-medium">{data.label}</CardTitle>
              <Badge variant="secondary" className="text-xs mt-1">
                Healthcare Compliance
              </Badge>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Compliance Score:</span>
            <Badge 
              variant={complianceScore >= 80 ? "default" : complianceScore >= 60 ? "secondary" : "destructive"}
              className="text-xs"
            >
              {complianceScore}%
            </Badge>
          </div>
          
          <div className="space-y-2">
            {complianceFeatures.map((feature) => (
              <div key={feature.key} className="flex items-center gap-2 text-xs">
                {feature.enabled ? (
                  <CheckCircle className="h-3 w-3 text-green-600" />
                ) : (
                  <AlertTriangle className="h-3 w-3 text-amber-500" />
                )}
                <span className={feature.enabled ? "text-foreground" : "text-muted-foreground"}>
                  {feature.label}
                </span>
              </div>
            ))}
          </div>
          
          <div className="pt-2 border-t border-border/50 space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Compliance Level:</span>
              <span className="font-medium">{config.compliance_level || 'HIPAA'}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Data Retention:</span>
              <span className="font-medium">{config.data_retention_days || 2555} days</span>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
};

export default HealthcareComplianceConfigurationNode;