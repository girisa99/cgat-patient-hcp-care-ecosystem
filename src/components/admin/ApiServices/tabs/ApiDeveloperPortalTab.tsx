
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Users, 
  Key, 
  FileText, 
  MessageCircle, 
  TrendingUp,
  Shield,
  Code,
  Globe,
  CheckCircle,
  AlertCircle,
  Clock
} from 'lucide-react';

export const ApiDeveloperPortalTab: React.FC = () => {
  const [selectedApplication, setSelectedApplication] = useState<string | null>(null);

  console.log('🚀 API Developer Portal Tab with complete developer experience');

  return (
    <div className="space-y-6">
      {/* Developer Portal Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Developer Portal Management</h3>
          <p className="text-sm text-muted-foreground">
            Manage developer access, applications, and API keys
          </p>
        </div>
        <Button>
          <Users className="h-4 w-4 mr-2" />
          Invite Developer
        </Button>
      </div>

      {/* Developer Portal Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Users className="h-4 w-4 text-blue-600" />
              Active Developers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">247</div>
            <p className="text-xs text-muted-foreground">+12 this month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Key className="h-4 w-4 text-green-600" />
              API Keys Issued
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">1,834</div>
            <p className="text-xs text-muted-foreground">Active keys</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <FileText className="h-4 w-4 text-purple-600" />
              Applications
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">89</div>
            <p className="text-xs text-muted-foreground">Pending: 12</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-orange-600" />
              API Usage
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">2.3M</div>
            <p className="text-xs text-muted-foreground">Calls this month</p>
          </CardContent>
        </Card>
      </div>

      {/* Developer Portal Tabs */}
      <Tabs defaultValue="applications" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="applications">Applications</TabsTrigger>
          <TabsTrigger value="developers">Developers</TabsTrigger>
          <TabsTrigger value="api-keys">API Keys</TabsTrigger>
          <TabsTrigger value="documentation">Documentation</TabsTrigger>
          <TabsTrigger value="support">Support</TabsTrigger>
        </TabsList>

        <TabsContent value="applications">
          <DeveloperApplicationsTab />
        </TabsContent>

        <TabsContent value="developers">
          <DevelopersManagementTab />
        </TabsContent>

        <TabsContent value="api-keys">
          <ApiKeysManagementTab />
        </TabsContent>

        <TabsContent value="documentation">
          <DeveloperDocumentationTab />
        </TabsContent>

        <TabsContent value="support">
          <DeveloperSupportTab />
        </TabsContent>
      </Tabs>
    </div>
  );
};

// Developer Applications Management
const DeveloperApplicationsTab: React.FC = () => {
  const applications = [
    { 
      id: '1', 
      appName: 'HealthTech Mobile App', 
      developer: 'HealthTech Solutions', 
      status: 'pending', 
      requestedApis: ['Patient Data API', 'Appointment API'],
      submittedDate: '2024-01-15'
    },
    { 
      id: '2', 
      appName: 'MedRecord Integration', 
      developer: 'MedRecord Inc', 
      status: 'approved', 
      requestedApis: ['Treatment API', 'Billing API'],
      submittedDate: '2024-01-10'
    },
    { 
      id: '3', 
      appName: 'Clinical Dashboard', 
      developer: 'ClinTech Corp', 
      status: 'rejected', 
      requestedApis: ['Patient Data API'],
      submittedDate: '2024-01-08'
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Developer Applications
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {applications.map((app) => (
            <div key={app.id} className="border rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h4 className="font-medium">{app.appName}</h4>
                    <Badge variant={
                      app.status === 'approved' ? 'default' : 
                      app.status === 'pending' ? 'secondary' : 'destructive'
                    }>
                      {app.status === 'approved' && <CheckCircle className="h-3 w-3 mr-1" />}
                      {app.status === 'pending' && <Clock className="h-3 w-3 mr-1" />}
                      {app.status === 'rejected' && <AlertCircle className="h-3 w-3 mr-1" />}
                      {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    By: {app.developer} • Submitted: {app.submittedDate}
                  </p>
                  <div className="text-sm text-muted-foreground">
                    Requested APIs: {app.requestedApis.join(', ')}
                  </div>
                </div>
                <div className="flex gap-2">
                  {app.status === 'pending' && (
                    <>
                      <Button size="sm" variant="outline">
                        Reject
                      </Button>
                      <Button size="sm">
                        Approve
                      </Button>
                    </>
                  )}
                  {app.status !== 'pending' && (
                    <Button size="sm" variant="outline">
                      View Details
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

// Developers Management
const DevelopersManagementTab: React.FC = () => {
  const developers = [
    { id: '1', name: 'John Smith', company: 'HealthTech Solutions', email: 'john@healthtech.com', apiKeys: 5, lastActive: '2024-01-15' },
    { id: '2', name: 'Sarah Johnson', company: 'MedRecord Inc', email: 'sarah@medrecord.com', apiKeys: 3, lastActive: '2024-01-14' },
    { id: '3', name: 'Mike Chen', company: 'ClinTech Corp', email: 'mike@clintech.com', apiKeys: 8, lastActive: '2024-01-13' }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Registered Developers
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {developers.map((dev) => (
            <div key={dev.id} className="border rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">{dev.name}</h4>
                  <p className="text-sm text-muted-foreground">
                    {dev.company} • {dev.email}
                  </p>
                  <div className="flex gap-4 text-xs text-muted-foreground mt-2">
                    <span>API Keys: {dev.apiKeys}</span>
                    <span>Last Active: {dev.lastActive}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline">
                    <Key className="h-4 w-4 mr-2" />
                    Manage Keys
                  </Button>
                  <Button size="sm" variant="outline">
                    <MessageCircle className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

// API Keys Management
const ApiKeysManagementTab: React.FC = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Key className="h-5 w-5" />
          API Key Management
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Active Keys</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">1,834</div>
                <p className="text-xs text-muted-foreground">Currently active</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Expired Keys</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">45</div>
                <p className="text-xs text-muted-foreground">Need renewal</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Usage This Month</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">2.3M</div>
                <p className="text-xs text-muted-foreground">API calls</p>
              </CardContent>
            </Card>
          </div>

          <div className="border rounded-lg p-4">
            <h4 className="font-medium mb-3">Recent API Key Activity</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between items-center">
                <span>hc_prod_abc123... (HealthTech Solutions)</span>
                <span className="text-muted-foreground">1,234 calls today</span>
              </div>
              <div className="flex justify-between items-center">
                <span>hc_prod_def456... (MedRecord Inc)</span>
                <span className="text-muted-foreground">856 calls today</span>
              </div>
              <div className="flex justify-between items-center">
                <span>hc_prod_ghi789... (ClinTech Corp)</span>
                <span className="text-muted-foreground">2,101 calls today</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Developer Documentation
const DeveloperDocumentationTab: React.FC = () => {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Code className="h-5 w-5" />
            Documentation Portal
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border rounded-lg p-4">
              <h4 className="font-medium mb-2">API Reference</h4>
              <p className="text-sm text-muted-foreground mb-3">
                Complete API documentation with examples
              </p>
              <Button size="sm" variant="outline">
                <Globe className="h-4 w-4 mr-2" />
                View Docs
              </Button>
            </div>

            <div className="border rounded-lg p-4">
              <h4 className="font-medium mb-2">Quick Start Guide</h4>
              <p className="text-sm text-muted-foreground mb-3">
                Get started with our APIs in minutes
              </p>
              <Button size="sm" variant="outline">
                <FileText className="h-4 w-4 mr-2" />
                View Guide
              </Button>
            </div>

            <div className="border rounded-lg p-4">
              <h4 className="font-medium mb-2">Code Examples</h4>
              <p className="text-sm text-muted-foreground mb-3">
                Sample code in multiple languages
              </p>
              <Button size="sm" variant="outline">
                <Code className="h-4 w-4 mr-2" />
                Browse Examples
              </Button>
            </div>

            <div className="border rounded-lg p-4">
              <h4 className="font-medium mb-2">SDK Downloads</h4>
              <p className="text-sm text-muted-foreground mb-3">
                Official SDKs for popular languages
              </p>
              <Button size="sm" variant="outline">
                <Globe className="h-4 w-4 mr-2" />
                Download SDKs
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Developer Support
const DeveloperSupportTab: React.FC = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageCircle className="h-5 w-5" />
          Developer Support
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Open Tickets</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">23</div>
                <p className="text-xs text-muted-foreground">Need attention</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Response Time</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">2.4h</div>
                <p className="text-xs text-muted-foreground">Average response</p>
              </CardContent>
            </Card>
          </div>

          <div className="border rounded-lg p-4">
            <h4 className="font-medium mb-3">Recent Support Requests</h4>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium text-sm">API Rate Limit Questions</p>
                  <p className="text-xs text-muted-foreground">From: john@healthtech.com</p>
                </div>
                <Badge variant="secondary">Open</Badge>
              </div>
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium text-sm">Authentication Issues</p>
                  <p className="text-xs text-muted-foreground">From: sarah@medrecord.com</p>
                </div>
                <Badge variant="default">Resolved</Badge>
              </div>
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium text-sm">Documentation Request</p>
                  <p className="text-xs text-muted-foreground">From: mike@clintech.com</p>
                </div>
                <Badge variant="secondary">In Progress</Badge>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
