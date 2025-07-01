
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { 
  Key, 
  Users, 
  ExternalLink, 
  Copy,
  Settings,
  Shield,
  Code,
  Download,
  FileText
} from 'lucide-react';

export const DeveloperUtilities: React.FC = () => {
  const { toast } = useToast();
  const [generatedKey, setGeneratedKey] = useState<string>('');
  const [sandboxUrl] = useState('https://sandbox-api.healthcare-admin.com');

  const handleGenerateSandboxKey = () => {
    const sandboxKey = `hc_sandbox_${Math.random().toString(36).substr(2, 16)}`;
    setGeneratedKey(sandboxKey);
    navigator.clipboard.writeText(sandboxKey);
    console.log('🔑 Sandbox API key generated and copied');
    toast({
      title: "Sandbox Key Generated",
      description: "API key has been generated and copied to clipboard.",
    });
  };

  const handleShareSandbox = () => {
    navigator.clipboard.writeText(sandboxUrl);
    console.log('🔗 Sandbox URL copied to clipboard');
    toast({
      title: "URL Copied",
      description: "Sandbox URL has been copied to clipboard.",
    });
  };

  const handleInviteDeveloper = () => {
    console.log('👥 Opening developer invitation dialog');
    // Simulate sending an invitation
    toast({
      title: "Developer Invitation",
      description: "Invitation functionality activated. Integration with email system required.",
    });
  };

  const handleConfigureAccess = () => {
    console.log('⚙️ Opening access configuration');
    toast({
      title: "Access Configuration",
      description: "Access control panel opened. Configure API permissions here.",
    });
  };

  const handleManageDevelopers = () => {
    console.log('👥 Opening developer management');
    toast({
      title: "Developer Management",
      description: "Developer management panel accessed. View and manage developer accounts.",
    });
  };

  const handleOpenSandboxDocs = () => {
    const docsUrl = 'https://docs.healthcare-api.com/sandbox';
    window.open(docsUrl, '_blank');
    toast({
      title: "Documentation Opened",
      description: "Sandbox documentation opened in new tab.",
    });
  };

  return (
    <div className="space-y-6">
      {/* Sandbox Environment */}
      <Card className="border-l-4 border-l-blue-500">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Code className="h-5 w-5 text-blue-500" />
            Sandbox Environment
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Sandbox URL</label>
              <div className="flex items-center gap-2">
                <Input 
                  value={sandboxUrl} 
                  readOnly 
                  className="bg-muted text-sm"
                />
                <Button onClick={handleShareSandbox} size="sm" variant="outline">
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            <div>
              <label className="text-sm font-medium mb-2 block">Generated API Key</label>
              <div className="flex items-center gap-2">
                <Input 
                  value={generatedKey || 'Click generate to create key'} 
                  readOnly 
                  className="bg-muted text-sm"
                  placeholder="No key generated yet"
                />
                <Button onClick={handleGenerateSandboxKey} size="sm">
                  <Key className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-3 pt-4">
            <Button variant="outline" onClick={handleOpenSandboxDocs}>
              <FileText className="h-4 w-4 mr-2" />
              Sandbox Documentation
            </Button>
            <Button variant="outline" onClick={handleConfigureAccess}>
              <Settings className="h-4 w-4 mr-2" />
              Configure Access
            </Button>
            <Button variant="outline" onClick={handleManageDevelopers}>
              <Users className="h-4 w-4 mr-2" />
              Manage Developers
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Developer Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-green-500" />
            Developer Management
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Shield className="h-5 w-5 text-green-500" />
                  <span className="font-medium">Access Control</span>
                </div>
                <p className="text-sm text-muted-foreground mb-3">
                  Manage API access permissions and rate limits
                </p>
                <Button size="sm" onClick={handleConfigureAccess} className="w-full">
                  Configure
                </Button>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Key className="h-5 w-5 text-blue-500" />
                  <span className="font-medium">API Keys</span>
                </div>
                <p className="text-sm text-muted-foreground mb-3">
                  Generate and manage sandbox API keys
                </p>
                <Button size="sm" onClick={handleGenerateSandboxKey} className="w-full">
                  Generate Key
                </Button>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="h-5 w-5 text-purple-500" />
                  <span className="font-medium">Invitations</span>
                </div>
                <p className="text-sm text-muted-foreground mb-3">
                  Invite developers to access sandbox
                </p>
                <Button size="sm" onClick={handleInviteDeveloper} className="w-full">
                  Invite Developer
                </Button>
              </CardContent>
            </Card>
          </div>
          
          {generatedKey && (
            <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-green-700 border-green-300">
                  Active Key
                </Badge>
                <code className="text-sm bg-white px-2 py-1 rounded border">
                  {generatedKey}
                </code>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
