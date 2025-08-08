import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
  Mic, 
  MicOff, 
  Phone, 
  PhoneOff, 
  Settings, 
  Zap,
  MessageSquare,
  Volume2,
  Activity,
  Key
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const OpenAIRealtimeChat = () => {
  const { toast } = useToast();
  const [isConnected, setIsConnected] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [selectedVoice, setSelectedVoice] = useState('alloy');
  const [selectedModel, setSelectedModel] = useState('gpt-4o-realtime-preview-2024-12-17');
  const [messages, setMessages] = useState<Array<{id: string, type: 'user' | 'assistant', content: string, timestamp: Date}>>([]);
  const [connectionStatus, setConnectionStatus] = useState<'disconnected' | 'connecting' | 'connected' | 'error'>('disconnected');

  const wsRef = useRef<WebSocket | null>(null);

  const voices = [
    { value: 'alloy', label: 'Alloy', description: 'Neutral, balanced voice' },
    { value: 'ash', label: 'Ash', description: 'Clear, articulate voice' },
    { value: 'ballad', label: 'Ballad', description: 'Smooth, expressive voice' },
    { value: 'coral', label: 'Coral', description: 'Warm, friendly voice' },
    { value: 'echo', label: 'Echo', description: 'Resonant, clear voice' },
    { value: 'sage', label: 'Sage', description: 'Wise, measured voice' },
    { value: 'shimmer', label: 'Shimmer', description: 'Bright, energetic voice' },
    { value: 'verse', label: 'Verse', description: 'Poetic, flowing voice' }
  ];

  const handleConnect = async () => {
    if (!apiKey) {
      toast({
        title: "API Key Required",
        description: "Please enter your OpenAI API key first.",
        variant: "destructive"
      });
      return;
    }

    setConnectionStatus('connecting');
    try {
      // Simulate WebSocket connection to OpenAI Realtime API
      await new Promise(resolve => setTimeout(resolve, 1500));
      setIsConnected(true);
      setConnectionStatus('connected');
      
      toast({
        title: "Connected",
        description: "Successfully connected to OpenAI Realtime API."
      });

      // Add system message
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        type: 'assistant',
        content: 'Connected to OpenAI Realtime Chat. You can now speak or type to interact.',
        timestamp: new Date()
      }]);
    } catch (error) {
      setConnectionStatus('error');
      toast({
        title: "Connection Failed",
        description: "Unable to connect to OpenAI Realtime API.",
        variant: "destructive"
      });
    }
  };

  const handleDisconnect = () => {
    setIsConnected(false);
    setConnectionStatus('disconnected');
    setIsRecording(false);
    setIsMuted(false);
    
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }

    toast({
      title: "Disconnected",
      description: "Disconnected from OpenAI Realtime API."
    });
  };

  const handleToggleMute = () => {
    setIsMuted(!isMuted);
    toast({
      title: isMuted ? "Unmuted" : "Muted",
      description: `Microphone ${isMuted ? 'enabled' : 'disabled'}.`
    });
  };

  const handleToggleRecording = () => {
    if (!isConnected) return;
    
    setIsRecording(!isRecording);
    if (!isRecording) {
      toast({
        title: "Recording Started",
        description: "Voice recording active. Speak now."
      });
    } else {
      toast({
        title: "Recording Stopped",
        description: "Voice recording paused."
      });
    }
  };

  const getConnectionStatusColor = () => {
    switch (connectionStatus) {
      case 'connected': return 'bg-green-500';
      case 'connecting': return 'bg-yellow-500 animate-pulse';
      case 'error': return 'bg-red-500';
      default: return 'bg-gray-300';
    }
  };

  const getConnectionStatusText = () => {
    switch (connectionStatus) {
      case 'connected': return 'Connected';
      case 'connecting': return 'Connecting...';
      case 'error': return 'Connection Error';
      default: return 'Disconnected';
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 rounded-lg p-6">
        <h3 className="font-bold text-blue-900 mb-2">OpenAI Realtime Voice Chat</h3>
        <p className="text-blue-700">
          Real-time voice conversation with OpenAI's advanced language models using WebSocket connections.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Connection Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="h-5 w-5" />
              API Configuration
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="openai-key">OpenAI API Key</Label>
              <Input
                id="openai-key"
                type="password"
                placeholder="sk-..."
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                disabled={isConnected}
              />
            </div>

            <div>
              <Label>Voice Selection</Label>
              <Select value={selectedVoice} onValueChange={setSelectedVoice} disabled={isConnected}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {voices.map((voice) => (
                    <SelectItem key={voice.value} value={voice.value}>
                      <div>
                        <div className="font-medium">{voice.label}</div>
                        <div className="text-xs text-muted-foreground">{voice.description}</div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50">
              <div className={`w-3 h-3 rounded-full ${getConnectionStatusColor()}`} />
              <span className="text-sm font-medium">{getConnectionStatusText()}</span>
              {connectionStatus === 'connected' && <Activity className="h-4 w-4 text-green-600 ml-auto" />}
            </div>
          </CardContent>
        </Card>

        {/* Voice Controls */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Volume2 className="h-5 w-5" />
              Voice Controls
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-sm text-muted-foreground mb-2">Connection</div>
                {!isConnected ? (
                  <Button onClick={handleConnect} className="w-full" disabled={connectionStatus === 'connecting'}>
                    <Phone className="h-4 w-4 mr-2" />
                    {connectionStatus === 'connecting' ? 'Connecting...' : 'Connect'}
                  </Button>
                ) : (
                  <Button onClick={handleDisconnect} variant="destructive" className="w-full">
                    <PhoneOff className="h-4 w-4 mr-2" />
                    Disconnect
                  </Button>
                )}
              </div>

              <div className="text-center">
                <div className="text-sm text-muted-foreground mb-2">Recording</div>
                <Button 
                  onClick={handleToggleRecording}
                  disabled={!isConnected}
                  variant={isRecording ? "destructive" : "outline"}
                  className="w-full"
                >
                  {isRecording ? <Mic className="h-4 w-4 mr-2" /> : <MicOff className="h-4 w-4 mr-2" />}
                  {isRecording ? 'Recording' : 'Start Recording'}
                </Button>
              </div>
            </div>

            <div className="flex items-center justify-center">
              <Button 
                onClick={handleToggleMute}
                disabled={!isConnected}
                variant="ghost"
                size="sm"
              >
                {isMuted ? <MicOff className="h-4 w-4 mr-2" /> : <Mic className="h-4 w-4 mr-2" />}
                {isMuted ? 'Unmute' : 'Mute'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Chat Messages */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Conversation History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="max-h-80 overflow-y-auto space-y-3 border rounded-lg p-4">
            {messages.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                <MessageSquare className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No messages yet. Connect and start chatting!</p>
              </div>
            ) : (
              messages.map((message) => (
                <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-xs lg:max-w-md p-3 rounded-lg ${
                    message.type === 'user' 
                      ? 'bg-primary text-primary-foreground' 
                      : 'bg-muted'
                  }`}>
                    <p className="text-sm">{message.content}</p>
                    <p className="text-xs opacity-70 mt-1">
                      {message.timestamp.toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Advanced Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Advanced Configuration
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label>Sample Rate</Label>
              <div className="mt-1 p-2 border rounded text-center text-sm">24kHz</div>
            </div>
            <div>
              <Label>Audio Format</Label>
              <div className="mt-1 p-2 border rounded text-center text-sm">PCM16</div>
            </div>
            <div>
              <Label>Turn Detection</Label>
              <div className="mt-1 p-2 border rounded text-center text-sm">Server VAD</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OpenAIRealtimeChat;