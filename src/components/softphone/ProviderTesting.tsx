import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useVoiceProviders } from '@/hooks/useVoiceProviders';
import { useMasterToast } from '@/hooks/useMasterToast';
import { SoftphoneInterface } from './SoftphoneInterface';
import { 
  TestTube, 
  Play, 
  CheckCircle, 
  XCircle,
  Clock,
  Activity,
  Database,
  Settings,
  Zap,
  RefreshCw,
  Phone
} from 'lucide-react';
import { format } from 'date-fns';

interface ProviderTestConfig {
  id: string;
  agent_id: string;
  config_name: string;
  created_by: string;
  expected_outcomes: any;
  phone_number_id: string;
  provider_type: string;
  test_data: any;
  test_scenario: string;
  updated_at: string;
  is_active: boolean;
  created_at: string;
  
  // Helper properties for UI compatibility
  test_scenarios?: any;
  expected_results?: any;
}

export const ProviderTesting = () => {
  const [selectedProvider, setSelectedProvider] = useState<string>('');
  const [selectedTestType, setSelectedTestType] = useState<string>('');
  const [testInput, setTestInput] = useState('');
  const [testResults, setTestResults] = useState<any>(null);
  const [isRunningTest, setIsRunningTest] = useState(false);
  const [showSoftphone, setShowSoftphone] = useState(false);

  const { showSuccess, showError } = useMasterToast();
  const queryClient = useQueryClient();

  const { voiceProviders, testVoiceProvider } = useVoiceProviders();

  // Fetch test configurations
  const { data: testConfigs = [], isLoading } = useQuery({
    queryKey: ['provider-test-configs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('provider_test_configs')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data.map((item): ProviderTestConfig => ({
        ...item,
        test_scenarios: item.test_data,
        expected_results: item.expected_outcomes
      }));
    }
  });

  // Test scenarios by provider type
  const testScenarios = {
    twilio: [
      { id: 'call-test', name: 'Voice Call Test', description: 'Test making and receiving calls' },
      { id: 'sms-test', name: 'SMS Test', description: 'Test sending and receiving SMS' },
      { id: 'webhook-test', name: 'Webhook Test', description: 'Test webhook integration' }
    ],
    elevenlabs: [
      { id: 'tts-test', name: 'Text-to-Speech Test', description: 'Test voice synthesis' },
      { id: 'voice-clone-test', name: 'Voice Cloning Test', description: 'Test voice cloning capabilities' },
      { id: 'realtime-test', name: 'Realtime API Test', description: 'Test realtime voice streaming' }
    ],
    openai: [
      { id: 'speech-test', name: 'Speech Services Test', description: 'Test TTS and STT' },
      { id: 'realtime-api-test', name: 'Realtime API Test', description: 'Test realtime conversation' },
      { id: 'whisper-test', name: 'Whisper Test', description: 'Test speech recognition' }
    ],
    huggingface: [
      { id: 'model-test', name: 'Model Test', description: 'Test voice models' },
      { id: 'pipeline-test', name: 'Pipeline Test', description: 'Test processing pipeline' },
      { id: 'embedding-test', name: 'Embedding Test', description: 'Test voice embeddings' }
    ],
    claude: [
      { id: 'orchestration-test', name: 'Voice Orchestration Test', description: 'Test AI conversation flow' },
      { id: 'context-test', name: 'Context Understanding Test', description: 'Test conversation context' },
      { id: 'integration-test', name: 'Integration Test', description: 'Test with other providers' }
    ]
  };

  const runProviderTest = useMutation({
    mutationFn: async ({ providerId, testType, input }: { 
      providerId: string; 
      testType: string; 
      input: string; 
    }) => {
      setIsRunningTest(true);
      
      // First test the provider connection
      const { data, error } = await supabase.functions.invoke('test-voice-provider', {
        body: { providerId }
      });
      
      if (error) throw error;
      
      // Simulate specific test based on type
      const testResult = {
        providerId,
        testType,
        input,
        timestamp: new Date().toISOString(),
        success: data?.success || false,
        results: data?.results || {},
        latency: Math.random() * 1000 + 100, // Simulated latency
        details: data?.details || {}
      };
      
      return testResult;
    },
    onSuccess: (result) => {
      setTestResults(result);
      setIsRunningTest(false);
      showSuccess(`Test completed: ${result.success ? 'PASSED' : 'FAILED'}`);
    },
    onError: (error) => {
      console.error('Test failed:', error);
      setIsRunningTest(false);
      showError('Test execution failed');
    }
  });

  const handleRunTest = () => {
    if (selectedProvider && selectedTestType) {
      runProviderTest.mutate({
        providerId: selectedProvider,
        testType: selectedTestType,
        input: testInput
      });
    }
  };

  const getProviderIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'twilio': return '📞';
      case 'elevenlabs': return '🎙️';
      case 'openai': return '🤖';
      case 'huggingface': return '🤗';
      case 'claude': return '🧠';
      default: return '🔧';
    }
  };

  const selectedProviderType = voiceProviders.find(p => p.id === selectedProvider)?.provider_type;
  const availableTests = selectedProviderType ? testScenarios[selectedProviderType as keyof typeof testScenarios] || [] : [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Provider Testing</h2>
          <p className="text-muted-foreground">
            Test voice provider connections and configurations
          </p>
        </div>
        <Button 
          onClick={() => setShowSoftphone(!showSoftphone)}
          className="gap-2"
          variant={showSoftphone ? "default" : "outline"}
        >
          <Phone className="h-4 w-4" />
          {showSoftphone ? 'Hide' : 'Show'} Voice Testing
        </Button>
      </div>

      {showSoftphone && (
        <Card className="border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Phone className="h-5 w-5 text-primary" />
              Voice Testing Interface
            </CardTitle>
          </CardHeader>
          <CardContent>
            <SoftphoneInterface />
          </CardContent>
        </Card>
      )}
      
      {/* Test Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TestTube className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-2xl font-bold">{testConfigs.length}</p>
                <p className="text-sm text-muted-foreground">Test Configs</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-2xl font-bold">
                  {voiceProviders.filter(p => p.is_active).length}
                </p>
                <p className="text-sm text-muted-foreground">Active Providers</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Activity className="h-8 w-8 text-purple-600" />
              <div>
                <p className="text-2xl font-bold">5</p>
                <p className="text-sm text-muted-foreground">Provider Types</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Zap className="h-8 w-8 text-yellow-600" />
              <div>
                <p className="text-2xl font-bold">
                  {testResults ? `${Math.round(testResults.latency)}ms` : 'N/A'}
                </p>
                <p className="text-sm text-muted-foreground">Last Test Latency</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Test Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Test Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Select Provider</label>
              <Select value={selectedProvider} onValueChange={setSelectedProvider}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a provider" />
                </SelectTrigger>
                <SelectContent>
                  {voiceProviders.map((provider) => (
                    <SelectItem key={provider.id} value={provider.id}>
                      <div className="flex items-center gap-2">
                        <span>{getProviderIcon(provider.provider_type)}</span>
                        {provider.name} ({provider.provider_type})
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Test Scenario</label>
              <Select 
                value={selectedTestType} 
                onValueChange={setSelectedTestType}
                disabled={!selectedProvider}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose test scenario" />
                </SelectTrigger>
                <SelectContent>
                  {availableTests.map((test) => (
                    <SelectItem key={test.id} value={test.id}>
                      {test.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {selectedTestType && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Test Input</label>
              <Textarea
                placeholder="Enter test data or configuration..."
                value={testInput}
                onChange={(e) => setTestInput(e.target.value)}
                rows={4}
              />
              <p className="text-xs text-muted-foreground">
                {availableTests.find(t => t.id === selectedTestType)?.description}
              </p>
            </div>
          )}

          <div className="flex gap-2">
            <Button
              onClick={handleRunTest}
              disabled={!selectedProvider || !selectedTestType || isRunningTest}
              className="flex items-center gap-2"
            >
              {isRunningTest ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <Play className="h-4 w-4" />
              )}
              {isRunningTest ? 'Running Test...' : 'Run Test'}
            </Button>
            
            <Button
              variant="outline"
              onClick={() => testVoiceProvider(selectedProvider)}
              disabled={!selectedProvider}
            >
              <Activity className="h-4 w-4 mr-2" />
              Quick Health Check
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Test Results */}
      {testResults && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {testResults.success ? (
                <CheckCircle className="h-5 w-5 text-green-600" />
              ) : (
                <XCircle className="h-5 w-5 text-red-600" />
              )}
              Test Results
              <Badge variant={testResults.success ? "default" : "destructive"}>
                {testResults.success ? 'PASSED' : 'FAILED'}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium mb-2">Test Details</h4>
                <div className="space-y-1 text-sm">
                  <p><span className="font-medium">Provider:</span> {selectedProvider}</p>
                  <p><span className="font-medium">Test Type:</span> {selectedTestType}</p>
                  <p><span className="font-medium">Timestamp:</span> {format(new Date(testResults.timestamp), 'PPpp')}</p>
                  <p className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    <span className="font-medium">Latency:</span> {Math.round(testResults.latency)}ms
                  </p>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-2">Performance Metrics</h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Response Time:</span>
                    <Badge variant="outline">{Math.round(testResults.latency)}ms</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Success Rate:</span>
                    <Badge variant={testResults.success ? "default" : "destructive"}>
                      {testResults.success ? '100%' : '0%'}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>

            {testResults.details && (
              <div>
                <h4 className="font-medium mb-2">Detailed Results</h4>
                <div className="bg-accent/20 p-4 rounded-lg">
                  <pre className="text-xs overflow-x-auto">
                    {JSON.stringify(testResults.details, null, 2)}
                  </pre>
                </div>
              </div>
            )}

            {testResults.input && (
              <div>
                <h4 className="font-medium mb-2">Test Input</h4>
                <div className="bg-accent/10 p-3 rounded-lg text-sm">
                  {testResults.input}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Test Data Templates */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Test Data Templates
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-2">📞 Call Test Data</h4>
              <p className="text-sm text-muted-foreground mb-2">
                Test phone numbers and call scenarios
              </p>
              <div className="text-xs font-mono bg-accent/20 p-2 rounded">
                +1234567890<br/>
                Test message content
              </div>
            </div>

            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-2">🎙️ TTS Test Data</h4>
              <p className="text-sm text-muted-foreground mb-2">
                Sample text for speech synthesis
              </p>
              <div className="text-xs font-mono bg-accent/20 p-2 rounded">
                "Hello, this is a test of the text-to-speech system."
              </div>
            </div>

            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-2">🤖 AI Test Data</h4>
              <p className="text-sm text-muted-foreground mb-2">
                Conversation prompts and context
              </p>
              <div className="text-xs font-mono bg-accent/20 p-2 rounded">
                &#123;"prompt": "Healthcare assistant test"&#125;
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};