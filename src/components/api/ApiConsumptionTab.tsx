
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Phone, 
  Database, 
  MessageCircle, 
  Shield, 
  Zap,
  CheckCircle,
  Settings,
  ExternalLink,
  AlertCircle,
  Clock,
  Users,
  Activity
} from 'lucide-react';

export const ApiConsumptionTab: React.FC = () => {
  const [twilioConfigured, setTwilioConfigured] = useState(false);
  const [npiConfigured, setNpiConfigured] = useState(false);

  console.log('🚀 API Consumption Tab with Twilio and NPI Registry integration');

  return (
    <div className="space-y-6">
      {/* Consumption Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">API Consumption Management</h3>
          <p className="text-sm text-muted-foreground">
            Manage external API integrations including Twilio, NPI Registry, and other services
          </p>
        </div>
        <Button>
          <Zap className="h-4 w-4 mr-2" />
          Add New Integration
        </Button>
      </div>

      {/* Consumption Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Phone className="h-4 w-4 text-blue-600" />
              Twilio Integration
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {twilioConfigured ? 'Active' : 'Inactive'}
            </div>
            <p className="text-xs text-muted-foreground">
              {twilioConfigured ? '1,234 messages sent' : 'Not configured'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Database className="h-4 w-4 text-green-600" />
              NPI Registry
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {npiConfigured ? 'Connected' : 'Disconnected'}
            </div>
            <p className="text-xs text-muted-foreground">
              {npiConfigured ? '567 lookups today' : 'Configuration required'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Activity className="h-4 w-4 text-purple-600" />
              Total API Calls
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">45.2K</div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Shield className="h-4 w-4 text-orange-600" />
              Success Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">99.2%</div>
            <p className="text-xs text-muted-foreground">Last 30 days</p>
          </CardContent>
        </Card>
      </div>

      {/* API Consumption Tabs */}
      <Tabs defaultValue="twilio" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="twilio">Twilio</TabsTrigger>
          <TabsTrigger value="npi-registry">NPI Registry</TabsTrigger>
          <TabsTrigger value="external-apis">External APIs</TabsTrigger>
          <TabsTrigger value="monitoring">Monitoring</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="twilio">
          <TwilioIntegrationTab configured={twilioConfigured} onConfigure={setTwilioConfigured} />
        </TabsContent>

        <TabsContent value="npi-registry">
          <NpiRegistryTab configured={npiConfigured} onConfigure={setNpiConfigured} />
        </TabsContent>

        <TabsContent value="external-apis">
          <ExternalApisTab />
        </TabsContent>

        <TabsContent value="monitoring">
          <ConsumptionMonitoringTab />
        </TabsContent>

        <TabsContent value="analytics">
          <ConsumptionAnalyticsTab />
        </TabsContent>
      </Tabs>
    </div>
  );
};

// Twilio Integration Tab
const TwilioIntegrationTab: React.FC<{ 
  configured: boolean, 
  onConfigure: (configured: boolean) => void 
}> = ({ configured, onConfigure }) => {
  const [accountSid, setAccountSid] = useState('');
  const [authToken, setAuthToken] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');

  const handleConfigure = () => {
    if (accountSid && authToken && phoneNumber) {
      onConfigure(true);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Phone className="h-5 w-5 text-blue-600" />
            Twilio SMS/Voice Integration
            {configured && <Badge variant="default">Active</Badge>}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!configured ? (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Account SID</label>
                <Input
                  type="password"
                  placeholder="Enter your Twilio Account SID"
                  value={accountSid}
                  onChange={(e) => setAccountSid(e.target.value)}
                />
              </div>
              
              <div>
                <label className="text-sm font-medium mb-2 block">Auth Token</label>
                <Input
                  type="password"
                  placeholder="Enter your Twilio Auth Token"
                  value={authToken}
                  onChange={(e) => setAuthToken(e.target.value)}
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Phone Number</label>
                <Input
                  placeholder="Enter your Twilio phone number (e.g., +1234567890)"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                />
              </div>

              <Button onClick={handleConfigure} className="w-full">
                <CheckCircle className="h-4 w-4 mr-2" />
                Configure Twilio Integration
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium">Messages Sent</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-blue-600">1,234</div>
                    <p className="text-xs text-muted-foreground">This month</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium">Delivery Rate</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-600">98.5%</div>
                    <p className="text-xs text-muted-foreground">Last 30 days</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium">Credits Used</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-purple-600">$47.82</div>
                    <p className="text-xs text-muted-foreground">This month</p>
                  </CardContent>
                </Card>
              </div>

              <div className="border rounded-lg p-4">
                <h4 className="font-medium mb-3">Test SMS Integration</h4>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium mb-1 block">Test Phone Number</label>
                    <Input placeholder="+1234567890" />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">Test Message</label>
                    <Textarea placeholder="Hello from Healthcare API!" rows={3} />
                  </div>
                  <Button>
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Send Test Message
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

// NPI Registry Tab
const NpiRegistryTab: React.FC<{ 
  configured: boolean, 
  onConfigure: (configured: boolean) => void 
}> = ({ configured, onConfigure }) => {
  const [testNpi, setTestNpi] = useState('');
  const [lookupResult, setLookupResult] = useState<any>(null);

  const handleTestLookup = async () => {
    // Mock NPI lookup
    const mockResult = {
      npi: testNpi,
      name: 'Dr. John Smith',
      specialty: 'Internal Medicine',
      address: '123 Medical Center Dr, City, ST 12345',
      phone: '(555) 123-4567',
      status: 'Active'
    };
    setLookupResult(mockResult);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5 text-green-600" />
            NPI Registry Integration
            <Badge variant="default">Active</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">NPI Lookups</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">567</div>
                  <p className="text-xs text-muted-foreground">Today</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">Cache Hits</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600">78%</div>
                  <p className="text-xs text-muted-foreground">Cache efficiency</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">Response Time</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-purple-600">145ms</div>
                  <p className="text-xs text-muted-foreground">Average</p>
                </CardContent>
              </Card>
            </div>

            <div className="border rounded-lg p-4">
              <h4 className="font-medium mb-3">Test NPI Lookup</h4>
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium mb-1 block">NPI Number</label>
                  <Input 
                    placeholder="1234567890" 
                    value={testNpi}
                    onChange={(e) => setTestNpi(e.target.value)}
                  />
                </div>
                <Button onClick={handleTestLookup}>
                  <Database className="h-4 w-4 mr-2" />
                  Lookup Provider
                </Button>
                
                {lookupResult && (
                  <div className="mt-4 p-3 bg-gray-50 rounded-md">
                    <h5 className="font-medium mb-2">Lookup Result:</h5>
                    <div className="space-y-1 text-sm">
                      <p><strong>Name:</strong> {lookupResult.name}</p>
                      <p><strong>Specialty:</strong> {lookupResult.specialty}</p>
                      <p><strong>Address:</strong> {lookupResult.address}</p>
                      <p><strong>Phone:</strong> {lookupResult.phone}</p>
                      <p><strong>Status:</strong> <Badge variant="default">{lookupResult.status}</Badge></p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// External APIs Tab
const ExternalApisTab: React.FC = () => {
  const externalServices = [
    { name: 'Stripe Payment', status: 'active', calls: '2,345', lastUsed: '2 hours ago' },
    { name: 'SendGrid Email', status: 'active', calls: '1,567', lastUsed: '1 hour ago' },
    { name: 'Google Maps', status: 'inactive', calls: '0', lastUsed: 'Never' },
    { name: 'DocuSign', status: 'active', calls: '234', lastUsed: '3 hours ago' }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ExternalLink className="h-5 w-5" />
          External API Integrations
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {externalServices.map((service, index) => (
            <div key={index} className="border rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">{service.name}</h4>
                  <p className="text-sm text-muted-foreground">
                    {service.calls} calls • Last used: {service.lastUsed}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={service.status === 'active' ? 'default' : 'secondary'}>
                    {service.status}
                  </Badge>
                  <Button size="sm" variant="outline">
                    <Settings className="h-4 w-4" />
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

// Consumption Monitoring Tab
const ConsumptionMonitoringTab: React.FC = () => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Real-time Monitoring
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 border rounded">
              <div className="flex items-center gap-3">
                <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="font-medium">Twilio SMS</span>
              </div>
              <div className="text-right">
                <span className="text-sm text-green-600">Healthy</span>
                <p className="text-xs text-muted-foreground">99.9% uptime</p>
              </div>
            </div>

            <div className="flex justify-between items-center p-3 border rounded">
              <div className="flex items-center gap-3">
                <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="font-medium">NPI Registry</span>
              </div>
              <div className="text-right">
                <span className="text-sm text-green-600">Healthy</span>
                <p className="text-xs text-muted-foreground">145ms avg</p>
              </div>
            </div>

            <div className="flex justify-between items-center p-3 border rounded">
              <div className="flex items-center gap-3">
                <div className="h-2 w-2 bg-yellow-500 rounded-full animate-pulse"></div>
                <span className="font-medium">Stripe API</span>
              </div>
              <div className="text-right">
                <span className="text-sm text-yellow-600">Warning</span>
                <p className="text-xs text-muted-foreground">High latency</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Consumption Analytics Tab
const ConsumptionAnalyticsTab: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Usage by Service</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm">Twilio SMS</span>
                <span className="text-sm font-medium">45.2%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">NPI Registry</span>
                <span className="text-sm font-medium">28.7%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Stripe Payments</span>
                <span className="text-sm font-medium">16.4%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Other Services</span>
                <span className="text-sm font-medium">9.7%</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Cost Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm">Twilio Credits</span>
                <span className="text-sm font-medium">$47.82</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Stripe Processing</span>
                <span className="text-sm font-medium">$23.45</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">NPI Lookups</span>
                <span className="text-sm font-medium">$12.00</span>
              </div>
              <div className="flex justify-between items-center border-t pt-2">
                <span className="font-medium">Total Monthly</span>
                <span className="font-medium">$83.27</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
