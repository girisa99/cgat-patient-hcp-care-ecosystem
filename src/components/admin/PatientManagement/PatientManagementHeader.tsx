
import React from 'react';
import { Users, Activity, Shield, Smartphone, Wifi, WifiOff } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface PatientManagementHeaderProps {
  meta: {
    totalPatients: number;
    patientCount: number;
    dataSource: string;
    lastFetch: string;
    focusArea: string;
    realtimeEnabled?: boolean;
    isOnline?: boolean;
    platform?: string;
    bulkOperationsEnabled?: boolean;
    advancedSearchEnabled?: boolean;
  };
}

export const PatientManagementHeader: React.FC<PatientManagementHeaderProps> = ({ meta }) => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Patient Management</h1>
          <p className="text-muted-foreground">
            View and manage patient records with automated features
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          {meta.realtimeEnabled && (
            <Badge variant="outline" className="flex items-center gap-1">
              <Activity className="h-3 w-3" />
              Real-time
            </Badge>
          )}
          
          {meta.bulkOperationsEnabled && (
            <Badge variant="outline">Bulk Ops</Badge>
          )}
          
          {meta.advancedSearchEnabled && (
            <Badge variant="outline">Advanced Search</Badge>
          )}
          
          <Badge variant="secondary" className="flex items-center gap-1">
            {meta.isOnline ? <Wifi className="h-3 w-3" /> : <WifiOff className="h-3 w-3" />}
            {meta.isOnline ? 'Online' : 'Offline'}
          </Badge>
          
          {meta.platform && (
            <Badge variant="outline" className="flex items-center gap-1">
              <Smartphone className="h-3 w-3" />
              {meta.platform}
            </Badge>
          )}
        </div>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-blue-500" />
              <div>
                <p className="font-medium">{meta.patientCount}</p>
                <p className="text-muted-foreground">Total Patients</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-green-500" />
              <div>
                <p className="font-medium">Unified</p>
                <p className="text-muted-foreground">Data Source</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-purple-500" />
              <div>
                <p className="font-medium">Live</p>
                <p className="text-muted-foreground">Updates</p>
              </div>
            </div>
            
            <div className="text-xs text-muted-foreground">
              <p>Source: {meta.dataSource}</p>
              <p>Last sync: {new Date(meta.lastFetch).toLocaleTimeString()}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
