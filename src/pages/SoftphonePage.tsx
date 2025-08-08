import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Phone, 
  Settings, 
  BarChart3, 
  TestTube,
  Headphones,
  Activity
} from 'lucide-react';
import SoftphoneInterface from '@/components/softphone/SoftphoneInterface';
import PhoneNumberManager from '@/components/softphone/PhoneNumberManager';

const SoftphonePage: React.FC = () => {
  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Multi-Provider Softphone System</h1>
          <p className="text-muted-foreground mt-1">
            Complete softphone solution with multi-provider support, real-time transcription, and testing capabilities
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="default" className="flex items-center gap-1">
            <Activity className="h-3 w-3" />
            System Online
          </Badge>
        </div>
      </div>

      {/* Feature Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="flex items-center p-4">
            <Phone className="h-8 w-8 text-blue-600 mr-3" />
            <div>
              <p className="text-sm font-medium">Voice Calling</p>
              <p className="text-xs text-muted-foreground">Make & receive calls</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="flex items-center p-4">
            <Headphones className="h-8 w-8 text-green-600 mr-3" />
            <div>
              <p className="text-sm font-medium">Real-time Transcription</p>
              <p className="text-xs text-muted-foreground">Live speech-to-text</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="flex items-center p-4">
            <Settings className="h-8 w-8 text-purple-600 mr-3" />
            <div>
              <p className="text-sm font-medium">Multi-Provider</p>
              <p className="text-xs text-muted-foreground">9+ voice providers</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="flex items-center p-4">
            <TestTube className="h-8 w-8 text-orange-600 mr-3" />
            <div>
              <p className="text-sm font-medium">Testing Suite</p>
              <p className="text-xs text-muted-foreground">Provider testing</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Tabs */}
      <Tabs defaultValue="softphone" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="softphone" className="flex items-center gap-2">
            <Phone className="h-4 w-4" />
            Softphone
          </TabsTrigger>
          <TabsTrigger value="numbers" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Phone Numbers
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Analytics
          </TabsTrigger>
          <TabsTrigger value="testing" className="flex items-center gap-2">
            <TestTube className="h-4 w-4" />
            Testing
          </TabsTrigger>
        </TabsList>

        <TabsContent value="softphone">
          <SoftphoneInterface />
        </TabsContent>

        <TabsContent value="numbers">
          <PhoneNumberManager />
        </TabsContent>

        <TabsContent value="analytics">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Call Analytics & Reporting
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Call Volume Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <Phone className="h-6 w-6 text-blue-600" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-muted-foreground">Total Calls</p>
                        <p className="text-2xl font-bold">1,247</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center">
                      <div className="p-2 bg-green-100 rounded-lg">
                        <Activity className="h-6 w-6 text-green-600" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-muted-foreground">Success Rate</p>
                        <p className="text-2xl font-bold">94.2%</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center">
                      <div className="p-2 bg-purple-100 rounded-lg">
                        <Headphones className="h-6 w-6 text-purple-600" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-muted-foreground">Avg Duration</p>
                        <p className="text-2xl font-bold">4:32</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center">
                      <div className="p-2 bg-orange-100 rounded-lg">
                        <Settings className="h-6 w-6 text-orange-600" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-muted-foreground">Active Providers</p>
                        <p className="text-2xl font-bold">7</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Provider Performance */}
              <Card>
                <CardHeader>
                  <CardTitle>Provider Performance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      { name: 'Twilio', calls: 450, success: 96.2, latency: '120ms' },
                      { name: 'ElevenLabs', calls: 289, success: 98.1, latency: '80ms' },
                      { name: 'OpenAI', calls: 234, success: 94.7, latency: '100ms' },
                      { name: 'Google CX', calls: 156, success: 92.3, latency: '150ms' },
                      { name: 'Hugging Face', calls: 118, success: 89.1, latency: '200ms' }
                    ].map((provider) => (
                      <div key={provider.name} className="flex items-center justify-between p-3 border rounded">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-muted rounded flex items-center justify-center">
                            <Settings className="h-5 w-5" />
                          </div>
                          <div>
                            <p className="font-medium">{provider.name}</p>
                            <p className="text-sm text-muted-foreground">{provider.calls} calls</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-6 text-sm">
                          <div className="text-center">
                            <p className="font-medium">{provider.success}%</p>
                            <p className="text-muted-foreground">Success</p>
                          </div>
                          <div className="text-center">
                            <p className="font-medium">{provider.latency}</p>
                            <p className="text-muted-foreground">Latency</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="testing">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TestTube className="h-5 w-5" />
                Provider Testing & Quality Assurance
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Test Scenarios */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Available Test Scenarios</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {[
                        { name: 'Basic Connectivity', description: 'Test provider connection and authentication' },
                        { name: 'Call Quality', description: 'Assess audio quality and latency' },
                        { name: 'Transcription Accuracy', description: 'Verify speech-to-text performance' },
                        { name: 'Agent Assignment', description: 'Test agent-to-number assignment' },
                        { name: 'Multi-Channel', description: 'Test across different channels' },
                        { name: 'Load Testing', description: 'Stress test with multiple concurrent calls' }
                      ].map((scenario) => (
                        <div key={scenario.name} className="p-3 border rounded">
                          <p className="font-medium">{scenario.name}</p>
                          <p className="text-sm text-muted-foreground">{scenario.description}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Test Results */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Recent Test Results</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {[
                        { provider: 'Twilio', scenario: 'Basic Connectivity', status: 'passed', timestamp: '2 min ago' },
                        { provider: 'ElevenLabs', scenario: 'Call Quality', status: 'passed', timestamp: '5 min ago' },
                        { provider: 'OpenAI', scenario: 'Transcription', status: 'warning', timestamp: '12 min ago' },
                        { provider: 'Google CX', scenario: 'Agent Assignment', status: 'passed', timestamp: '18 min ago' },
                        { provider: 'Test Number', scenario: 'Load Testing', status: 'failed', timestamp: '25 min ago' }
                      ].map((result, idx) => (
                        <div key={idx} className="flex items-center justify-between p-3 border rounded">
                          <div>
                            <p className="font-medium">{result.provider}</p>
                            <p className="text-sm text-muted-foreground">{result.scenario}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant={
                              result.status === 'passed' ? 'default' :
                              result.status === 'warning' ? 'secondary' : 'destructive'
                            }>
                              {result.status}
                            </Badge>
                            <span className="text-sm text-muted-foreground">{result.timestamp}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Test Configuration */}
              <Card>
                <CardHeader>
                  <CardTitle>Test Data & Configuration</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card>
                      <CardContent className="p-4">
                        <h4 className="font-medium mb-2">Hugging Face Models</h4>
                        <ul className="text-sm text-muted-foreground space-y-1">
                          <li>• wav2vec2-base-960h (STT)</li>
                          <li>• speecht5_tts (TTS)</li>
                          <li>• whisper-tiny.en (STT)</li>
                          <li>• bark (Voice Generation)</li>
                        </ul>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="p-4">
                        <h4 className="font-medium mb-2">ElevenLabs Voices</h4>
                        <ul className="text-sm text-muted-foreground space-y-1">
                          <li>• alloy (Default)</li>
                          <li>• aria (Female)</li>
                          <li>• roger (Male)</li>
                          <li>• sarah (Professional)</li>
                        </ul>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="p-4">
                        <h4 className="font-medium mb-2">Test Datasets</h4>
                        <ul className="text-sm text-muted-foreground space-y-1">
                          <li>• Healthcare scenarios</li>
                          <li>• Customer support dialogs</li>
                          <li>• Multi-language samples</li>
                          <li>• Noise tolerance tests</li>
                        </ul>
                      </CardContent>
                    </Card>
                  </div>
                </CardContent>
              </Card>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SoftphonePage;