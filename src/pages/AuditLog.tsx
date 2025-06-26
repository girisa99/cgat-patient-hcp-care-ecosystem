
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileText, Clock, User, Activity } from 'lucide-react';

const AuditLog = () => {
  // Mock audit log data - in a real app, this would come from an API
  const auditLogs = [
    {
      id: '1',
      action: 'User Created',
      user: 'admin@example.com',
      target: 'john.doe@example.com',
      timestamp: new Date().toISOString(),
      details: 'Created new user account',
      type: 'user_management'
    },
    {
      id: '2',
      action: 'Module Assigned',
      user: 'admin@example.com',
      target: 'Patient Management Module',
      timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      details: 'Assigned module to user jane.smith@example.com',
      type: 'module_management'
    },
    {
      id: '3',
      action: 'Login',
      user: 'jane.smith@example.com',
      target: 'System',
      timestamp: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
      details: 'User logged into the system',
      type: 'authentication'
    }
  ];

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'user_management':
        return 'bg-blue-100 text-blue-800';
      case 'module_management':
        return 'bg-green-100 text-green-800';
      case 'authentication':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Audit Log</h2>
          <p className="text-muted-foreground">
            System activity and security audit trail
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {auditLogs.map((log) => (
              <div key={log.id} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <Activity className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <h4 className="font-medium">{log.action}</h4>
                      <p className="text-sm text-muted-foreground">{log.details}</p>
                    </div>
                  </div>
                  <Badge className={getTypeColor(log.type)}>
                    {log.type.replace('_', ' ')}
                  </Badge>
                </div>
                
                <div className="flex items-center gap-6 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <User className="h-4 w-4" />
                    <span>By: {log.user}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span>{formatTimestamp(log.timestamp)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {auditLogs.length === 0 && (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No audit logs available.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AuditLog;
