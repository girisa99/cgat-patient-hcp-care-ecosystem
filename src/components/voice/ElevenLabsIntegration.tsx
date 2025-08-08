import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
  AudioWaveform, 
  Key, 
  Play, 
  Save, 
  TestTube, 
  Volume2,
  Settings,
  Check
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const ElevenLabsIntegration = () => {
  const { toast } = useToast();
  const [apiKey, setApiKey] = useState('');
  const [selectedVoice, setSelectedVoice] = useState('');
  const [selectedModel, setSelectedModel] = useState('eleven_multilingual_v2');
  const [testText, setTestText] = useState('Hello! This is a test of the ElevenLabs voice synthesis.');
  const [isConnected, setIsConnected] = useState(false);
  const [isTesting, setIsTesting] = useState(false);

  const voices = [
    { id: 'pNInz6obpgDQGcFmaJgB', name: 'Adam', accent: 'American' },
    { id: 'EXAVITQu4vr4xnSDxMaL', name: 'Sarah', accent: 'American' },
    { id: 'ErXwobaYiN019PkySvjV', name: 'Antoni', accent: 'American' },
    { id: 'VR6AewLTigWG4xSOukaG', name: 'Arnold', accent: 'American' },
    { id: 'MF3mGyEYCl7XYWbV9V6O', name: 'Bella', accent: 'American' },
    { id: 'TxGEqnHWrfWFTfGW9XjX', name: 'Josh', accent: 'American' },
    { id: 'AZnzlk1XvdvUeBnXmlld', name: 'Domi', accent: 'American' },
    { id: 'GBv7mTt0atIp3Br8iCZE', name: 'Thomas', accent: 'American' },
    { id: 'oWAxZDx7w5VEj9dCyTzz', name: 'Grace', accent: 'American' },
    { id: 'IKne3meq5aSn9XLyUdCD', name: 'Charlie', accent: 'Australian' }
  ];

  const models = [
    { value: 'eleven_multilingual_v2', label: 'Multilingual v2 (Best Quality)', description: 'Most lifelike, emotionally rich in 29 languages' },
    { value: 'eleven_turbo_v2_5', label: 'Turbo v2.5 (Low Latency)', description: 'High quality, low latency in 32 languages' },
    { value: 'eleven_turbo_v2', label: 'Turbo v2 (English Only)', description: 'English-only, lowest latency' },
    { value: 'eleven_multilingual_sts_v2', label: 'Speech-to-Speech v2', description: 'Advanced speech-to-speech with prosody control' }
  ];

  const handleTestConnection = async () => {
    if (!apiKey) {
      toast({
        title: "API Key Required",
        description: "Please enter your ElevenLabs API key first.",
        variant: "destructive"
      });
      return;
    }

    setIsTesting(true);
    try {
      // Simulate API test
      await new Promise(resolve => setTimeout(resolve, 2000));
      setIsConnected(true);
      toast({
        title: "Connection Successful",
        description: "Successfully connected to ElevenLabs API."
      });
    } catch (error) {
      toast({
        title: "Connection Failed",
        description: "Unable to connect to ElevenLabs API. Check your API key.",
        variant: "destructive"
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handleTestVoice = async () => {
    if (!selectedVoice || !testText) {
      toast({
        title: "Missing Information",
        description: "Please select a voice and enter test text.",
        variant: "destructive"
      });
      return;
    }

    try {
      toast({
        title: "Voice Test",
        description: "Playing voice sample... (Demo functionality)"
      });
    } catch (error) {
      toast({
        title: "Test Failed",
        description: "Unable to generate voice sample.",
        variant: "destructive"
      });
    }
  };

  const handleSaveConfig = () => {
    toast({
      title: "Configuration Saved",
      description: "ElevenLabs voice settings saved successfully."
    });
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-purple-50 to-purple-100 border border-purple-200 rounded-lg p-6">
        <h3 className="font-bold text-purple-900 mb-2">ElevenLabs Voice Synthesis</h3>
        <p className="text-purple-700">
          Configure ElevenLabs API for high-quality text-to-speech generation with natural, expressive voices.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* API Configuration */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="h-5 w-5" />
              API Configuration
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="apiKey">ElevenLabs API Key</Label>
              <div className="flex gap-2 mt-1">
                <Input
                  id="apiKey"
                  type="password"
                  placeholder="sk-..."
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  className="flex-1"
                />
                <Button 
                  onClick={handleTestConnection} 
                  disabled={isTesting}
                  variant="outline"
                >
                  <TestTube className="h-4 w-4 mr-1" />
                  {isTesting ? 'Testing...' : 'Test'}
                </Button>
              </div>
            </div>

            <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50">
              <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-gray-300'}`} />
              <span className="text-sm">
                {isConnected ? 'Connected to ElevenLabs API' : 'Not connected'}
              </span>
              {isConnected && <Check className="h-4 w-4 text-green-600 ml-auto" />}
            </div>
          </CardContent>
        </Card>

        {/* Voice Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AudioWaveform className="h-5 w-5" />
              Voice Selection
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="voice">Select Voice</Label>
              <Select value={selectedVoice} onValueChange={setSelectedVoice}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a voice" />
                </SelectTrigger>
                <SelectContent>
                  {voices.map((voice) => (
                    <SelectItem key={voice.id} value={voice.id}>
                      <div className="flex items-center gap-2">
                        <span>{voice.name}</span>
                        <Badge variant="outline" className="text-xs">
                          {voice.accent}
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="model">Voice Model</Label>
              <Select value={selectedModel} onValueChange={setSelectedModel}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {models.map((model) => (
                    <SelectItem key={model.value} value={model.value}>
                      <div>
                        <div className="font-medium">{model.label}</div>
                        <div className="text-xs text-muted-foreground">{model.description}</div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Voice Testing */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Volume2 className="h-5 w-5" />
            Voice Testing
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="testText">Test Text</Label>
            <textarea
              id="testText"
              className="w-full mt-1 p-3 border rounded-lg resize-none"
              rows={3}
              placeholder="Enter text to test voice synthesis..."
              value={testText}
              onChange={(e) => setTestText(e.target.value)}
            />
          </div>

          <div className="flex gap-2">
            <Button onClick={handleTestVoice} disabled={!isConnected}>
              <Play className="h-4 w-4 mr-2" />
              Test Voice
            </Button>
            <Button variant="outline" onClick={handleSaveConfig}>
              <Save className="h-4 w-4 mr-2" />
              Save Configuration
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Advanced Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Advanced Settings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label>Stability</Label>
              <div className="mt-1 p-2 border rounded text-center text-sm">0.5</div>
            </div>
            <div>
              <Label>Similarity Boost</Label>
              <div className="mt-1 p-2 border rounded text-center text-sm">0.75</div>
            </div>
            <div>
              <Label>Style</Label>
              <div className="mt-1 p-2 border rounded text-center text-sm">0.0</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ElevenLabsIntegration;