
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Key, 
  Code, 
  Users, 
  Settings, 
  Shield, 
  Globe, 
  Zap,
  Copy,
  Eye,
  EyeOff,
  Plus,
  TestTube,
  FileText,
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ApiKey {
  id: string;
  name: string;
  key: string;
  type: 'development' | 'production' | 'sandbox';
  permissions: string[];
  modules: string[];
  rateLimit: {
    requests: number;
    period: string;
  };
  status: 'active' | 'inactive' | 'pending';
  createdAt: string;
  expiresAt?: string;
  lastUsed?: string;
}

interface DeveloperApplication {
  id: string;
  companyName: string;
  email: string;
  description: string;
  requestedModules: string[];
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: string;
}

const DeveloperPortal = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('overview');
  const [showApiKey, setShowApiKey] = useState<string | null>(null);
  const [showApplicationDialog, setShowApplicationDialog] = useState(false);

  // Mock data - in real implementation, this would come from your backend
  const [apiKeys] = useState<ApiKey[]>([
    {
      id: '1',
      name: 'Healthcare App Dev',
      key: 'hc_dev_1a2b3c4d5e6f7g8h9i0j',
      type: 'development',
      permissions: ['read', 'write'],
      modules: ['patients', 'facilities', 'users'],
      rateLimit: { requests: 1000, period: 'hour' },
      status: 'active',
      createdAt: '2024-01-15T10:00:00Z',
      lastUsed: '2024-01-20T14:30:00Z'
    },
    {
      id: '2',
      name: 'Mobile App Sandbox',
      key: 'hc_sandbox_k1l2m3n4o5p6q7r8s9t0',
      type: 'sandbox',
      permissions: ['read'],
      modules: ['patients', 'facilities'],
      rateLimit: { requests: 500, period: 'hour' },
      status: 'active',
      createdAt: '2024-01-10T09:00:00Z'
    }
  ]);

  const [applications] = useState<DeveloperApplication[]>([
    {
      id: '1',
      companyName: 'HealthTech Solutions',
      email: 'dev@healthtech.com',
      description: 'Building a patient management mobile app',
      requestedModules: ['patients', 'facilities', 'appointments'],
      status: 'pending',
      submittedAt: '2024-01-18T11:00:00Z'
    }
  ]);

  const availableModules = [
    { id: 'patients', name: 'Patient Management', description: 'Access patient data and records' },
    { id: 'facilities', name: 'Facility Management', description: 'Manage healthcare facilities' },
    { id: 'users', name: 'User Management', description: 'User authentication and roles' },
    { id: 'appointments', name: 'Appointments', description: 'Schedule and manage appointments' },
    { id: 'billing', name: 'Billing', description: 'Handle billing and payments' },
  ];

  const handleCopyApiKey = (key: string) => {
    navigator.clipboard.writeText(key);
    toast({
      title: "API Key Copied",
      description: "The API key has been copied to your clipboard.",
    });
  };

  const handleGenerateTestUrl = (apiKey: ApiKey) => {
    const testUrl = `${window.location.origin}/api/sandbox?key=${apiKey.key}&modules=${apiKey.modules.join(',')}`;
    navigator.clipboard.writeText(testUrl);
    toast({
      title: "Test URL Generated",
      description: "Sandbox URL has been copied to your clipboard.",
    });
  };

  const ApplicationForm = () => {
    const [formData, setFormData] = useState({
      companyName: '',
      email: '',
      description: '',
      requestedModules: [] as string[]
    });

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      toast({
        title: "Application Submitted",
        description: "Your API access request has been submitted for review.",
      });
      setShowApplicationDialog(false);
    };

    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="companyName">Company/Organization Name</Label>
          <Input
            id="companyName"
            value={formData.companyName}
            onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="email">Contact Email</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="description">Project Description</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Describe your project and how you plan to use our APIs..."
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label>Requested API Modules</Label>
          <div className="grid grid-cols-1 gap-2">
            {availableModules.map((module) => (
              <div key={module.id} className="flex items-center space-x-2">
                <Checkbox
                  id={module.id}
                  checked={formData.requestedModules.includes(module.id)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setFormData({
                        ...formData,
                        requestedModules: [...formData.requestedModules, module.id]
                      });
                    } else {
                      setFormData({
                        ...formData,
                        requestedModules: formData.requestedModules.filter(m => m !== module.id)
                      });
                    }
                  }}
                />
                <div className="flex-1">
                  <Label htmlFor={module.id} className="font-medium">{module.name}</Label>
                  <p className="text-sm text-muted-foreground">{module.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <Button type="submit" className="w-full">
          Submit Application
        </Button>
      </form>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Developer Portal</h2>
          <p className="text-muted-foreground">
            Manage your API keys, access sandbox environments, and integrate with our healthcare platform
          </p>
        </div>
        <Dialog open={showApplicationDialog} onOpenChange={setShowApplicationDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Request API Access
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Apply for API Access</DialogTitle>
            </DialogHeader>
            <ApplicationForm />
          </DialogContent>
        </Dialog>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="api-keys">API Keys</TabsTrigger>
          <TabsTrigger value="sandbox">Sandbox</TabsTrigger>
          <TabsTrigger value="applications">Applications</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active API Keys</CardTitle>
                <Key className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{apiKeys.filter(k => k.status === 'active').length}</div>
                <p className="text-xs text-muted-foreground">
                  +1 from last month
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">API Calls This Month</CardTitle>
                <Zap className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">24,567</div>
                <p className="text-xs text-muted-foreground">
                  +20.1% from last month
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Available Modules</CardTitle>
                <Settings className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{availableModules.length}</div>
                <p className="text-xs text-muted-foreground">
                  Healthcare APIs
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Quick Start Guide</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h4 className="font-medium flex items-center gap-2">
                  <span className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-sm">1</span>
                  Apply for API Access
                </h4>
                <p className="text-sm text-muted-foreground ml-8">
                  Submit an application with your project details and required modules
                </p>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-medium flex items-center gap-2">
                  <span className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-sm">2</span>
                  Get Your API Keys
                </h4>
                <p className="text-sm text-muted-foreground ml-8">
                  Once approved, receive development and production API keys
                </p>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-medium flex items-center gap-2">
                  <span className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-sm">3</span>
                  Test in Sandbox
                </h4>
                <p className="text-sm text-muted-foreground ml-8">
                  Use our sandbox environment to test API calls and integrations
                </p>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-medium flex items-center gap-2">
                  <span className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-sm">4</span>
                  Go Live
                </h4>
                <p className="text-sm text-muted-foreground ml-8">
                  Deploy your application with production API keys
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="api-keys" className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Your API Keys</h3>
            <Button variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              Generate New Key
            </Button>
          </div>
          
          <div className="space-y-4">
            {apiKeys.map((apiKey) => (
              <Card key={apiKey.id}>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium">{apiKey.name}</h4>
                        <Badge variant={apiKey.type === 'production' ? 'default' : 'secondary'}>
                          {apiKey.type}
                        </Badge>
                        <Badge variant={apiKey.status === 'active' ? 'secondary' : 'destructive'}>
                          {apiKey.status}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 font-mono text-sm">
                        {showApiKey === apiKey.id ? (
                          <span>{apiKey.key}</span>
                        ) : (
                          <span>{'*'.repeat(20)}</span>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setShowApiKey(showApiKey === apiKey.id ? null : apiKey.id)}
                        >
                          {showApiKey === apiKey.id ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleCopyApiKey(apiKey.key)}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleGenerateTestUrl(apiKey)}
                      >
                        <TestTube className="h-4 w-4 mr-2" />
                        Generate Test URL
                      </Button>
                      <Button variant="outline" size="sm">
                        <Settings className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Rate Limit</p>
                      <p className="font-medium">{apiKey.rateLimit.requests}/{apiKey.rateLimit.period}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Modules</p>
                      <p className="font-medium">{apiKey.modules.length} modules</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Created</p>
                      <p className="font-medium">{new Date(apiKey.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Last Used</p>
                      <p className="font-medium">
                        {apiKey.lastUsed ? new Date(apiKey.lastUsed).toLocaleDateString() : 'Never'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <p className="text-sm text-muted-foreground mb-2">Accessible Modules:</p>
                    <div className="flex flex-wrap gap-2">
                      {apiKey.modules.map((module) => (
                        <Badge key={module} variant="outline">{module}</Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="sandbox" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TestTube className="h-5 w-5" />
                API Sandbox Environment
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <h4 className="font-medium mb-2">Sandbox Base URL</h4>
                <code className="text-sm bg-white p-2 rounded border">
                  {window.location.origin}/api/sandbox
                </code>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h4 className="font-medium">Available Endpoints</h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">GET</Badge>
                      <code>/patients</code>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">POST</Badge>
                      <code>/patients</code>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">GET</Badge>
                      <code>/facilities</code>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">GET</Badge>
                      <code>/users</code>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h4 className="font-medium">Authentication</h4>
                  <div className="text-sm space-y-1">
                    <p>Header: <code>Authorization: Bearer YOUR_API_KEY</code></p>
                    <p>Or Query: <code>?api_key=YOUR_API_KEY</code></p>
                  </div>
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button variant="outline">
                  <FileText className="h-4 w-4 mr-2" />
                  View API Documentation
                </Button>
                <Button variant="outline">
                  <Code className="h-4 w-4 mr-2" />
                  Download Postman Collection
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="applications" className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">API Access Applications</h3>
            <Badge variant="secondary">{applications.length} applications</Badge>
          </div>
          
          <div className="space-y-4">
            {applications.map((app) => (
              <Card key={app.id}>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium">{app.companyName}</h4>
                        <Badge variant={
                          app.status === 'approved' ? 'secondary' : 
                          app.status === 'pending' ? 'outline' : 'destructive'
                        }>
                          {app.status === 'pending' && <Clock className="h-3 w-3 mr-1" />}
                          {app.status === 'approved' && <CheckCircle className="h-3 w-3 mr-1" />}
                          {app.status === 'rejected' && <AlertCircle className="h-3 w-3 mr-1" />}
                          {app.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{app.email}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Submitted</p>
                      <p className="text-sm font-medium">{new Date(app.submittedAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <p className="text-sm font-medium mb-2">Project Description:</p>
                    <p className="text-sm text-muted-foreground">{app.description}</p>
                  </div>
                  
                  <div className="mt-4">
                    <p className="text-sm font-medium mb-2">Requested Modules:</p>
                    <div className="flex flex-wrap gap-2">
                      {app.requestedModules.map((module) => (
                        <Badge key={module} variant="outline">{module}</Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DeveloperPortal;
