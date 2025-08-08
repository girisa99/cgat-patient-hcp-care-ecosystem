import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { 
  Phone, 
  Mic, 
  Volume2,
  Settings,
  Zap,
  Check,
  ExternalLink,
  Plus,
  Edit,
  Trash2,
  Power,
  PowerOff,
  BarChart3,
  TestTube,
  Headphones,
  Users,
  Activity
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useVoiceProviders } from '@/hooks/useVoiceProviders';
import { SoftphoneInterface } from '@/components/softphone/SoftphoneInterface';
import { LiveAgentTransfer } from '@/components/agent-testing/LiveAgentTransfer';
import VoiceConnectors from '@/components/voice/VoiceConnectors';
import ActiveDeploymentsView from '@/components/deployment/ActiveDeploymentsView';
import ElevenLabsIntegration from '@/components/voice/ElevenLabsIntegration';
import OpenAIRealtimeChat from '@/components/voice/OpenAIRealtimeChat';
import VoiceAnalytics from '@/components/voice/VoiceAnalytics';

const VoiceConfigurationView = () => {
  const [selectedVoiceProvider, setSelectedVoiceProvider] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('');
  const [isConfiguring, setIsConfiguring] = useState<string | null>(null);
  const [showAddProvider, setShowAddProvider] = useState(false);
  const [showEditProvider, setShowEditProvider] = useState(false);
  const [editingProvider, setEditingProvider] = useState<any>(null);
  const [newProvider, setNewProvider] = useState({
    name: '',
    provider_type: '',
    capabilities: [''],
    configuration: {},
    description: ''
  });
  const { toast } = useToast();
  
  const {
    voiceProviders,
    voiceConfigurations,
    isLoading,
    createVoiceConfiguration,
    updateProviderStatus,
    testVoiceProvider,
    isCreating,
    isUpdating,
    isTesting
  } = useVoiceProviders();

  const languages = [
    { code: 'en-US', name: 'English (US)' },
    { code: 'en-GB', name: 'English (UK)' },
    { code: 'es-ES', name: 'Spanish (Spain)' },
    { code: 'fr-FR', name: 'French (France)' },
    { code: 'de-DE', name: 'German (Germany)' },
  ];

  // Load existing configuration
  useEffect(() => {
    const activeConfig = voiceConfigurations.find(config => config.is_active);
    if (activeConfig) {
      setSelectedVoiceProvider(activeConfig.voice_provider_id);
      const langConfig = activeConfig.configuration?.language;
      if (langConfig) {
        setSelectedLanguage(langConfig);
      }
    }
  }, [voiceConfigurations]);

  const handleConfigure = async (providerId: string, providerName: string) => {
    setIsConfiguring(providerId);
    
    try {
      // Toggle provider status
      const provider = voiceProviders.find(p => p.id === providerId);
      const newStatus = !provider?.is_active;
      
      await updateProviderStatus({ id: providerId, isActive: newStatus });
      
      toast({
        title: `${providerName} Configuration`,
        description: `Successfully ${newStatus ? 'activated' : 'deactivated'} ${providerName} for voice processing.`,
      });
    } catch (error) {
      console.error('Configuration error:', error);
      toast({
        title: 'Configuration Error',
        description: 'Failed to update voice provider configuration.',
        variant: 'destructive',
      });
    } finally {
      setIsConfiguring(null);
    }
  };

  const handleTestConfiguration = async () => {
    if (!selectedVoiceProvider) {
      toast({
        title: "No Provider Selected",
        description: "Please select a voice provider to test.",
        variant: "destructive",
      });
      return;
    }

    try {
      await testVoiceProvider(selectedVoiceProvider);
    } catch (error) {
      console.error('Test error:', error);
    }
  };

  const handleSaveConfiguration = async () => {
    if (!selectedVoiceProvider || !selectedLanguage) {
      toast({
        title: "Configuration Incomplete",
        description: "Please select both a voice provider and language before saving.",
        variant: "destructive",
      });
      return;
    }

    try {
      const config = {
        voice_provider_id: selectedVoiceProvider,
        configuration: {
          language: selectedLanguage,
          sample_rate: 16000,
          audio_format: 'PCM',
          latency: 'low'
        },
        is_active: true
      };

      await createVoiceConfiguration(config);
    } catch (error) {
      console.error('Save error:', error);
    }
  };

  const handleAddProvider = async () => {
    // This would typically call an API to create a new provider
    toast({
      title: "Add Provider",
      description: "Voice provider added successfully (demo functionality)",
    });
    setShowAddProvider(false);
    setNewProvider({
      name: '',
      provider_type: '',
      capabilities: [''],
      configuration: {},
      description: ''
    });
  };

  const handleEditProvider = (provider: any) => {
    setEditingProvider(provider);
    setShowEditProvider(true);
  };

  const handleUpdateProvider = async () => {
    toast({
      title: "Update Provider",
      description: "Voice provider updated successfully (demo functionality)",
    });
    setShowEditProvider(false);
    setEditingProvider(null);
  };

  const handleDeactivateProvider = async (providerId: string, providerName: string) => {
    try {
      await updateProviderStatus({ id: providerId, isActive: false });
      toast({
        title: "Provider Deactivated",
        description: `${providerName} has been deactivated successfully.`,
      });
    } catch (error) {
      console.error('Deactivation error:', error);
      toast({
        title: 'Deactivation Error',
        description: 'Failed to deactivate voice provider.',
        variant: 'destructive',
      });
    }
  };

  if (isLoading) {
    return <div className="flex justify-center p-8">Loading voice configuration...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header with Add Provider Button */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Voice Configuration & Management</h2>
          <p className="text-muted-foreground">Complete voice system management including softphone, providers, and analytics</p>
        </div>
        <Button onClick={() => setShowAddProvider(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Voice Provider
        </Button>
      </div>

      {/* Comprehensive Voice System Tabs */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4 lg:grid-cols-8 text-xs bg-card shadow-lg border">
          <TabsTrigger value="overview" className="flex items-center gap-1 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <BarChart3 className="h-3 w-3" />
            <span className="hidden sm:inline">Overview</span>
          </TabsTrigger>
          <TabsTrigger value="softphone" className="flex items-center gap-1 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Phone className="h-3 w-3" />
            <span className="hidden sm:inline">Softphone</span>
          </TabsTrigger>
          <TabsTrigger value="live-agents" className="flex items-center gap-1 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Users className="h-3 w-3" />
            <span className="hidden sm:inline">Live Agents</span>
          </TabsTrigger>
          <TabsTrigger value="ai-voice" className="flex items-center gap-1 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Mic className="h-3 w-3" />
            <span className="hidden sm:inline">AI Voice</span>
          </TabsTrigger>
          <TabsTrigger value="connectors" className="flex items-center gap-1 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Zap className="h-3 w-3" />
            <span className="hidden sm:inline">Connectors</span>
          </TabsTrigger>
          <TabsTrigger value="testing" className="flex items-center gap-1 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <TestTube className="h-3 w-3" />
            <span className="hidden sm:inline">Testing</span>
          </TabsTrigger>
          <TabsTrigger value="deployments" className="flex items-center gap-1 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Activity className="h-3 w-3" />
            <span className="hidden sm:inline">Deployments</span>
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-1 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <BarChart3 className="h-3 w-3" />
            <span className="hidden sm:inline">Analytics</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* System Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Voice System Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Active Providers</span>
                    <Badge variant="secondary">4/7</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">System Health</span>
                    <Badge className="bg-green-100 text-green-800">Excellent</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Uptime</span>
                    <span className="text-sm font-medium">99.8%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Phone className="h-5 w-5" />
                  Call Statistics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Total Calls Today</span>
                    <span className="text-sm font-medium">347</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Success Rate</span>
                    <span className="text-sm font-medium text-green-600">94.2%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Avg Duration</span>
                    <span className="text-sm font-medium">2:34</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Agent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Online Agents</span>
                    <span className="text-sm font-medium">12/15</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">In Conversation</span>
                    <span className="text-sm font-medium">8</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Available</span>
                    <span className="text-sm font-medium text-green-600">4</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Button variant="outline" className="h-20 flex flex-col gap-2">
                  <Phone className="h-6 w-6" />
                  <span className="text-sm">Test Call</span>
                </Button>
                <Button variant="outline" className="h-20 flex flex-col gap-2">
                  <Settings className="h-6 w-6" />
                  <span className="text-sm">Configure</span>
                </Button>
                <Button variant="outline" className="h-20 flex flex-col gap-2">
                  <BarChart3 className="h-6 w-6" />
                  <span className="text-sm">View Reports</span>
                </Button>
                <Button variant="outline" className="h-20 flex flex-col gap-2">
                  <Zap className="h-6 w-6" />
                  <span className="text-sm">Run Tests</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="providers" className="space-y-6">
          {/* Voice Provider Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mic className="h-5 w-5" />
                  Speech-to-Text Providers
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {voiceProviders.filter(p => {
                  // Check if this provider supports STT functionality
                  const capabilities = Array.isArray(p.capabilities) ? p.capabilities : [];
                  return capabilities.some(cap => 
                    cap.toLowerCase().includes('voice') || 
                    cap.toLowerCase().includes('stt') || 
                    ['twilio', 'five9', 'genesys'].includes(p.provider_type)
                  );
                }).map((provider) => (
                  <div key={provider.id} className="flex items-start justify-between p-4 border rounded-lg space-y-2">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <div className={`w-3 h-3 rounded-full mt-1 flex-shrink-0 ${provider.is_active ? 'bg-green-500' : 'bg-gray-300'}`} />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{provider.name}</p>
                        <div className="flex gap-1 mt-2 flex-wrap">
                          {(Array.isArray(provider.capabilities) ? provider.capabilities : []).map((capability, idx) => (
                            <Badge key={idx} variant="secondary" className="text-xs px-1.5 py-0.5 h-auto">
                              {capability}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-1 ml-2 flex-shrink-0">
                      <Button 
                        variant={provider.is_active ? 'default' : 'outline'} 
                        size="sm"
                        className="text-xs px-2 h-7"
                        disabled={isConfiguring === provider.id || isUpdating}
                        onClick={() => handleConfigure(provider.id, provider.name)}
                      >
                        {isConfiguring === provider.id ? 'Config...' : provider.is_active ? 'Active' : 'Activate'}
                        {!provider.is_active && <ExternalLink className="h-2.5 w-2.5 ml-1" />}
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="h-7 w-7 p-0"
                        onClick={() => handleEditProvider(provider)}
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                      {provider.is_active && (
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className="h-7 w-7 p-0"
                          onClick={() => handleDeactivateProvider(provider.id, provider.name)}
                        >
                          <PowerOff className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Volume2 className="h-5 w-5" />
                  Text-to-Speech Providers
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {voiceProviders.filter(p => {
                  // Check if this provider supports TTS functionality  
                  const capabilities = Array.isArray(p.capabilities) ? p.capabilities : [];
                  return capabilities.some(cap => 
                    cap.toLowerCase().includes('voice') || 
                    cap.toLowerCase().includes('tts') || 
                    ['twilio', 'five9', 'genesys', 'vonage', 'voxiplant'].includes(p.provider_type)
                  );
                }).map((provider) => (
                  <div key={provider.id} className="flex items-start justify-between p-4 border rounded-lg space-y-2">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <div className={`w-3 h-3 rounded-full mt-1 flex-shrink-0 ${provider.is_active ? 'bg-green-500' : 'bg-gray-300'}`} />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{provider.name}</p>
                        <div className="flex gap-1 mt-2 flex-wrap">
                          {(Array.isArray(provider.capabilities) ? provider.capabilities : []).map((capability, idx) => (
                            <Badge key={idx} variant="secondary" className="text-xs px-1.5 py-0.5 h-auto">
                              {capability}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-1 ml-2 flex-shrink-0">
                      <Button 
                        variant={provider.is_active ? 'default' : 'outline'} 
                        size="sm"
                        className="text-xs px-2 h-7"
                        disabled={isConfiguring === provider.id || isUpdating}
                        onClick={() => handleConfigure(provider.id, provider.name)}
                      >
                        {isConfiguring === provider.id ? 'Config...' : provider.is_active ? 'Active' : 'Activate'}
                        {!provider.is_active && <ExternalLink className="h-2.5 w-2.5 ml-1" />}
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="h-7 w-7 p-0"
                        onClick={() => handleEditProvider(provider)}
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                      {provider.is_active && (
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className="h-7 w-7 p-0"
                          onClick={() => handleDeactivateProvider(provider.id, provider.name)}
                        >
                          <PowerOff className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Configuration Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Voice Configuration Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Primary Language</label>
                    <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select language" />
                      </SelectTrigger>
                      <SelectContent>
                        {languages.map((lang) => (
                          <SelectItem key={lang.code} value={lang.code}>
                            {lang.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Voice Provider</label>
                    <Select value={selectedVoiceProvider} onValueChange={setSelectedVoiceProvider}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select provider" />
                      </SelectTrigger>
                      <SelectContent>
                        {voiceProviders.map((provider) => (
                          <SelectItem key={provider.id} value={provider.id}>
                            {provider.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="p-4 bg-muted/20 rounded-lg">
                    <h4 className="font-medium mb-2 flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      Voice Channel Settings
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Sample Rate:</span>
                        <span className="text-muted-foreground">16kHz</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Audio Format:</span>
                        <span className="text-muted-foreground">PCM</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Latency:</span>
                        <span className="text-muted-foreground">Low</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-2 pt-4 border-t">
                <Button 
                  className="flex items-center gap-2" 
                  onClick={handleSaveConfiguration}
                  disabled={isCreating}
                >
                  <Check className="h-4 w-4" />
                  {isCreating ? 'Saving...' : 'Save Configuration'}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={handleTestConfiguration}
                  disabled={isTesting}
                >
                  <Zap className="h-4 w-4 mr-2" />
                  {isTesting ? 'Testing...' : 'Test Voice Configuration'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="softphone" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Phone className="h-5 w-5" />
                Complete Softphone Interface
              </CardTitle>
            </CardHeader>
            <CardContent>
              <SoftphoneInterface />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="live-agents" className="space-y-6">
          <LiveAgentTransfer />
        </TabsContent>

        <TabsContent value="ai-voice" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>ElevenLabs TTS Integration</CardTitle>
              </CardHeader>
              <CardContent>
                <ElevenLabsIntegration />
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>OpenAI Realtime Voice</CardTitle>
              </CardHeader>
              <CardContent>
                <OpenAIRealtimeChat />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="connectors" className="space-y-6">
          <VoiceConnectors />
        </TabsContent>

        <TabsContent value="testing" className="space-y-6">
          <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 border border-yellow-200 rounded-lg p-6">
            <h3 className="font-bold text-yellow-900 mb-2">Voice Provider Testing</h3>
            <p className="text-yellow-700">Test voice provider connectivity and performance across all configured providers.</p>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TestTube className="h-5 w-5" />
                Provider Test Suite
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {voiceProviders.map((provider) => (
                  <div key={provider.id} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">{provider.name}</h4>
                      <div className={`w-3 h-3 rounded-full ${provider.is_active ? 'bg-green-500' : 'bg-gray-300'}`} />
                    </div>
                    <div className="flex gap-1 flex-wrap">
                      {(Array.isArray(provider.capabilities) ? provider.capabilities : []).map((capability, idx) => (
                        <Badge key={idx} variant="secondary" className="text-xs">
                          {capability}
                        </Badge>
                      ))}
                    </div>
                    <Button 
                      className="w-full" 
                      variant="outline" 
                      size="sm"
                      disabled={isTesting}
                      onClick={() => testVoiceProvider(provider.id)}
                    >
                      <Zap className="h-4 w-4 mr-2" />
                      {isTesting ? 'Testing...' : 'Test Connection'}
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="deployments" className="space-y-6">
          <ActiveDeploymentsView />
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <VoiceAnalytics />
        </TabsContent>
      </Tabs>

      {/* Add Provider Dialog */}
      <Dialog open={showAddProvider} onOpenChange={setShowAddProvider}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Voice Provider</DialogTitle>
            <DialogDescription>
              Configure a new voice provider for speech processing.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="provider-name">Provider Name</Label>
              <Input
                id="provider-name"
                value={newProvider.name}
                onChange={(e) => setNewProvider(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter provider name"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="provider-type">Provider Type</Label>
              <Select 
                value={newProvider.provider_type} 
                onValueChange={(value) => setNewProvider(prev => ({ ...prev, provider_type: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select provider type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="twilio">Twilio</SelectItem>
                  <SelectItem value="five9">Five9</SelectItem>
                  <SelectItem value="genesys">Genesys</SelectItem>
                  <SelectItem value="vonage">Vonage</SelectItem>
                  <SelectItem value="aws">AWS Connect</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="provider-description">Description</Label>
              <Textarea
                id="provider-description"
                value={newProvider.description}
                onChange={(e) => setNewProvider(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Enter provider description"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddProvider(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddProvider}>
              Add Provider
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Provider Dialog */}
      <Dialog open={showEditProvider} onOpenChange={setShowEditProvider}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Voice Provider</DialogTitle>
            <DialogDescription>
              Update voice provider configuration.
            </DialogDescription>
          </DialogHeader>
          
          {editingProvider && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-provider-name">Provider Name</Label>
                <Input
                  id="edit-provider-name"
                  defaultValue={editingProvider.name}
                  placeholder="Enter provider name"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-provider-type">Provider Type</Label>
                <Select defaultValue={editingProvider.provider_type}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select provider type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="twilio">Twilio</SelectItem>
                    <SelectItem value="five9">Five9</SelectItem>
                    <SelectItem value="genesys">Genesys</SelectItem>
                    <SelectItem value="vonage">Vonage</SelectItem>
                    <SelectItem value="aws">AWS Connect</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditProvider(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateProvider}>
              Update Provider
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default VoiceConfigurationView;