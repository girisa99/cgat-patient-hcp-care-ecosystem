
import React from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { PageContainer } from '@/components/layout/PageContainer';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Shield, Search, Filter, Download } from 'lucide-react';

const AuditLog = () => {
  console.log('🛡️ Audit Log page rendering...');
  
  // Mock audit log data
  const auditEntries = [
    {
      id: '1',
      timestamp: '2024-01-07 14:30:25',
      user: 'admin@healthcare.com',
      action: 'USER_LOGIN',
      resource: 'Authentication System',
      status: 'success',
      ipAddress: '192.168.1.100'
    },
    {
      id: '2',
      timestamp: '2024-01-07 14:25:10',
      user: 'nurse@healthcare.com',
      action: 'PATIENT_RECORD_UPDATE',
      resource: 'Patient ID: 12345',
      status: 'success',
      ipAddress: '192.168.1.105'
    },
    {
      id: '3',
      timestamp: '2024-01-07 14:20:45',
      user: 'doctor@healthcare.com',
      action: 'PRESCRIPTION_CREATE',
      resource: 'Patient ID: 67890',
      status: 'success',
      ipAddress: '192.168.1.110'
    },
    {
      id: '4',
      timestamp: '2024-01-07 14:15:30',
      user: 'system@healthcare.com',
      action: 'BACKUP_COMPLETION',
      resource: 'Database Backup',
      status: 'success',
      ipAddress: 'localhost'
    },
    {
      id: '5',
      timestamp: '2024-01-07 14:10:15',
      user: 'unknown@suspicious.com',
      action: 'LOGIN_ATTEMPT',
      resource: 'Authentication System',
      status: 'failed',
      ipAddress: '203.0.113.42'
    }
  ];

  return (
    <ProtectedRoute>
      <MainLayout>
        <PageContainer
          title="Audit Log"
          subtitle="Security events and system activity monitoring"
        >
          {/* Filters */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Filters
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4 flex-wrap">
                <div className="flex-1 min-w-[200px]">
                  <Input
                    placeholder="Search logs..."
                    className="w-full"
                  />
                </div>
                <Select>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Action Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Actions</SelectItem>
                    <SelectItem value="login">Login</SelectItem>
                    <SelectItem value="update">Updates</SelectItem>
                    <SelectItem value="create">Create</SelectItem>
                    <SelectItem value="delete">Delete</SelectItem>
                  </SelectContent>
                </Select>
                <Select>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="success">Success</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                    <SelectItem value="warning">Warning</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline">
                  <Search className="h-4 w-4 mr-2" />
                  Search
                </Button>
                <Button variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Audit Log Entries */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Recent Activity
              </CardTitle>
              <CardDescription>
                System security events and user activity logs
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {auditEntries.map((entry) => (
                  <div key={entry.id} className="border rounded-lg p-4 hover:bg-gray-50">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <Badge variant={entry.status === 'success' ? 'default' : entry.status === 'failed' ? 'destructive' : 'secondary'}>
                          {entry.status}
                        </Badge>
                        <span className="font-medium">{entry.action}</span>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {entry.timestamp}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="font-medium">User: </span>
                        <span className="text-muted-foreground">{entry.user}</span>
                      </div>
                      <div>
                        <span className="font-medium">Resource: </span>
                        <span className="text-muted-foreground">{entry.resource}</span>
                      </div>
                      <div>
                        <span className="font-medium">IP Address: </span>
                        <span className="text-muted-foreground">{entry.ipAddress}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </PageContainer>
      </MainLayout>
    </ProtectedRoute>
  );
};

export default AuditLog;
