import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Phone, 
  Mic, 
  Volume2,
  Settings,
  Zap,
  Check,
  ExternalLink
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useVoiceProviders } from '@/hooks/useVoiceProviders';

const VoiceConfigurationView = () => {
  const [selectedVoiceProvider, setSelectedVoiceProvider] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('');
  const [isConfiguring, setIsConfiguring] = useState<string | null>(null);
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

  if (isLoading) {
    return <div className="flex justify-center p-8">Loading voice configuration...</div>;
  }

  return (
    <div className="space-y-6">
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
            {voiceProviders.filter(p => 
              (p.capabilities && p.capabilities.includes('STT')) || 
              p.provider_type === 'stt' || 
              p.name.toLowerCase().includes('stt')
            ).map((provider) => (
              <div key={provider.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${provider.is_active ? 'bg-green-500' : 'bg-gray-300'}`} />
                  <div>
                    <p className="font-medium">{provider.name}</p>
                    <div className="flex gap-1 mt-1">
                      {provider.capabilities?.map((capability, idx) => (
                        <Badge key={idx} variant="secondary" className="text-xs">
                          {capability}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
                <Button 
                  variant={provider.is_active ? 'default' : 'outline'} 
                  size="sm"
                  disabled={isConfiguring === provider.id || isUpdating}
                  onClick={() => handleConfigure(provider.id, provider.name)}
                >
                  {isConfiguring === provider.id ? 'Configuring...' : provider.is_active ? 'Active' : 'Activate'}
                  {!provider.is_active && <ExternalLink className="h-3 w-3 ml-1" />}
                </Button>
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
            {voiceProviders.filter(p => 
              (p.capabilities && p.capabilities.includes('TTS')) || 
              p.provider_type === 'tts' || 
              p.name.toLowerCase().includes('tts')
            ).map((provider) => (
              <div key={provider.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${provider.is_active ? 'bg-green-500' : 'bg-gray-300'}`} />
                  <div>
                    <p className="font-medium">{provider.name}</p>
                    <div className="flex gap-1 mt-1">
                      {provider.capabilities?.map((capability, idx) => (
                        <Badge key={idx} variant="secondary" className="text-xs">
                          {capability}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
                <Button 
                  variant={provider.is_active ? 'default' : 'outline'} 
                  size="sm"
                  disabled={isConfiguring === provider.id || isUpdating}
                  onClick={() => handleConfigure(provider.id, provider.name)}
                >
                  {isConfiguring === provider.id ? 'Configuring...' : provider.is_active ? 'Active' : 'Activate'}
                  {!provider.is_active && <ExternalLink className="h-3 w-3 ml-1" />}
                </Button>
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
    </div>
  );
};

export default VoiceConfigurationView;