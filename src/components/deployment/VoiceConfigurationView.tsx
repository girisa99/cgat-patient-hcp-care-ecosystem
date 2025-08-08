import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
  PowerOff
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useVoiceProviders } from '@/hooks/useVoiceProviders';

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
          <h2 className="text-2xl font-bold">Voice Configuration</h2>
          <p className="text-muted-foreground">Manage voice providers and configuration settings</p>
        </div>
        <Button onClick={() => setShowAddProvider(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Voice Provider
        </Button>
      </div>

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
              <div key={provider.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${provider.is_active ? 'bg-green-500' : 'bg-gray-300'}`} />
                  <div>
                    <p className="font-medium">{provider.name}</p>
                    <div className="flex gap-1 mt-1">
                      {(Array.isArray(provider.capabilities) ? provider.capabilities : []).map((capability, idx) => (
                        <Badge key={idx} variant="secondary" className="text-xs">
                          {capability}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant={provider.is_active ? 'default' : 'outline'} 
                    size="sm"
                    disabled={isConfiguring === provider.id || isUpdating}
                    onClick={() => handleConfigure(provider.id, provider.name)}
                  >
                    {isConfiguring === provider.id ? 'Configuring...' : provider.is_active ? 'Active' : 'Activate'}
                    {!provider.is_active && <ExternalLink className="h-3 w-3 ml-1" />}
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => handleEditProvider(provider)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  {provider.is_active && (
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleDeactivateProvider(provider.id, provider.name)}
                    >
                      <PowerOff className="h-4 w-4" />
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
              <div key={provider.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${provider.is_active ? 'bg-green-500' : 'bg-gray-300'}`} />
                  <div>
                    <p className="font-medium">{provider.name}</p>
                    <div className="flex gap-1 mt-1">
                      {(Array.isArray(provider.capabilities) ? provider.capabilities : []).map((capability, idx) => (
                        <Badge key={idx} variant="secondary" className="text-xs">
                          {capability}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant={provider.is_active ? 'default' : 'outline'} 
                    size="sm"
                    disabled={isConfiguring === provider.id || isUpdating}
                    onClick={() => handleConfigure(provider.id, provider.name)}
                  >
                    {isConfiguring === provider.id ? 'Configuring...' : provider.is_active ? 'Active' : 'Activate'}
                    {!provider.is_active && <ExternalLink className="h-3 w-3 ml-1" />}
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => handleEditProvider(provider)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  {provider.is_active && (
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleDeactivateProvider(provider.id, provider.name)}
                    >
                      <PowerOff className="h-4 w-4" />
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