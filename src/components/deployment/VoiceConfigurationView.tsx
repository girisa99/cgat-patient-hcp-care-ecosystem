import React, { useState } from 'react';
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
  Check
} from 'lucide-react';

const VoiceConfigurationView = () => {
  const [selectedVoiceProvider, setSelectedVoiceProvider] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('');

  const voiceProviders = [
    { id: 'twilio', name: 'Twilio Voice', status: 'active', features: ['Real-time', 'PSTN', 'SIP'] },
    { id: 'deepgram', name: 'Deepgram STT', status: 'active', features: ['Real-time', 'Streaming', 'Multiple Languages'] },
    { id: 'elevenlabs', name: 'ElevenLabs TTS', status: 'active', features: ['Natural Voice', 'Voice Cloning', 'Multilingual'] },
    { id: 'azure', name: 'Azure Speech', status: 'inactive', features: ['STT', 'TTS', 'Translation'] },
  ];

  const languages = [
    { code: 'en-US', name: 'English (US)' },
    { code: 'en-GB', name: 'English (UK)' },
    { code: 'es-ES', name: 'Spanish (Spain)' },
    { code: 'fr-FR', name: 'French (France)' },
    { code: 'de-DE', name: 'German (Germany)' },
  ];

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
            {voiceProviders.filter(p => p.features.includes('STT') || p.name.includes('STT')).map((provider) => (
              <div key={provider.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${provider.status === 'active' ? 'bg-green-500' : 'bg-gray-300'}`} />
                  <div>
                    <p className="font-medium">{provider.name}</p>
                    <div className="flex gap-1 mt-1">
                      {provider.features.map((feature, idx) => (
                        <Badge key={idx} variant="secondary" className="text-xs">
                          {feature}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
                <Button variant={provider.status === 'active' ? 'default' : 'outline'} size="sm">
                  {provider.status === 'active' ? 'Configured' : 'Configure'}
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
            {voiceProviders.filter(p => p.features.includes('TTS') || p.name.includes('TTS')).map((provider) => (
              <div key={provider.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${provider.status === 'active' ? 'bg-green-500' : 'bg-gray-300'}`} />
                  <div>
                    <p className="font-medium">{provider.name}</p>
                    <div className="flex gap-1 mt-1">
                      {provider.features.map((feature, idx) => (
                        <Badge key={idx} variant="secondary" className="text-xs">
                          {feature}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
                <Button variant={provider.status === 'active' ? 'default' : 'outline'} size="sm">
                  {provider.status === 'active' ? 'Configured' : 'Configure'}
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
            <Button className="flex items-center gap-2">
              <Check className="h-4 w-4" />
              Save Configuration
            </Button>
            <Button variant="outline">
              Test Voice Configuration
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default VoiceConfigurationView;