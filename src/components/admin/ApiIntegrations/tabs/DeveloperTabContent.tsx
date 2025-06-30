import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Share2, 
  Globe, 
  Key, 
  Users, 
  ExternalLink, 
  Copy,
  Settings,
  Shield,
  Code,
  Database,
  Clock
} from 'lucide-react';
import DeveloperPortal from '../DeveloperPortal';

export const DeveloperTabContent: React.FC = () => {
  const handleShareSandbox = () => {
    const sandboxUrl = 'https://sandbox-api.healthcare-admin.com';
    navigator.clipboard.writeText(sandboxUrl);
    console.log('🔗 Sandbox URL copied to clipboard');
  };

  const handleGenerateSandboxKey = () => {
    const sandboxKey = `hc_sandbox_${Math.random().toString(36).substr(2, 16)}`;
    navigator.clipboard.writeText(sandboxKey);
    console.log('🔑 Sandbox API key generated and copied');
  };

  const handleInviteDeveloper = () => {
    console.log('👥 Opening developer invitation dialog');
  };

  const handleOpenSandboxDocs = () => {
    window.open('https://docs.healthcare-api.com/sandbox', '_blank');
  };

  return (
    <div className="space-y-6">
      {/* Sandbox Environment Sharing Section */}
      <Card className="border-l-4 border-l-blue-500">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Share2 className="h-6 w-6 text-blue-500" />
              <div>
                <CardTitle>Sandbox Environment Sharing</CardTitle>
                <CardDescription>
                  Share secure sandbox access with developers and external partners
                </CardDescription>
              </div>
            </div>
            <Badge className="bg-green-100 text-green-800">
              <Globe className="h-3 w-3 mr-1" />
              Active
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Sandbox URL Sharing */}
            <div className="space-y-4">
              <h4 className="font-medium flex items-center gap-2">
                <ExternalLink className="h-4 w-4" />
                Sandbox Environment URL
              </h4>
              <div className="flex items-center gap-2">
                <Input 
                  value="https://sandbox-api.healthcare-admin.com" 
                  readOnly 
                  className="bg-muted"
                />
                <Button onClick={handleShareSandbox} size="sm">
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">
                Shared sandbox environment for testing healthcare APIs
              </p>
            </div>

            {/* API Key Generation */}
            <div className="space-y-4">
              <h4 className="font-medium flex items-center gap-2">
                <Key className="h-4 w-4" />
                Sandbox API Keys
              </h4>
              <div className="flex items-center gap-2">
                <Button onClick={handleGenerateSandboxKey} className="flex-1">
                  Generate Sandbox Key
                </Button>
                <Button variant="outline" onClick={handleInviteDeveloper}>
                  <Users className="h-4 w-4 mr-2" />
                  Invite Developer
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">
                Generate secure API keys with limited sandbox permissions
              </p>
            </div>
          </div>

          {/* Sandbox Features */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Shield className="h-5 w-5 text-green-500" />
                  <span className="font-medium">Secure Access</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Isolated environment with rate limiting and access controls
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Database className="h-5 w-5 text-blue-500" />
                  <span className="font-medium">Test Data</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Pre-populated with realistic healthcare test data
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="h-5 w-5 text-orange-500" />
                  <span className="font-medium">Real-time Monitoring</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Monitor API usage and performance in real-time
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="mt-6 flex flex-wrap gap-3">
            <Button variant="outline" onClick={handleOpenSandboxDocs}>
              <Code className="h-4 w-4 mr-2" />
              Sandbox Documentation
            </Button>
            <Button variant="outline">
              <Settings className="h-4 w-4 mr-2" />
              Configure Access
            </Button>
            <Button variant="outline">
              <Users className="h-4 w-4 mr-2" />
              Manage Developers
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Existing Developer Portal */}
      <DeveloperPortal />
    </div>
  );
};
