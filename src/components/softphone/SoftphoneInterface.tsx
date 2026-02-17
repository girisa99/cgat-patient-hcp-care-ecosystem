import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useSoftphone } from '@/hooks/useSoftphone';
import { useVoiceProviders } from '@/hooks/useVoiceProviders';
import { 
  Phone, 
  PhoneCall, 
  PhoneOff, 
  ArrowRight, 
  Clock, 
  Volume2,
  Mic,
  MicOff,
  Pause,
  Play
} from 'lucide-react';

export const SoftphoneInterface = () => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [selectedProviderId, setSelectedProviderId] = useState<string>('');
  const [selectedAgentId, setSelectedAgentId] = useState<string>('');
  const [isMuted, setIsMuted] = useState(false);
  const [isOnHold, setIsOnHold] = useState(false);

  const {
    currentCall,
    callStatus,
    isCallActive,
    callDuration,
    phoneNumbers,
    makeCall,
    endCall,
    transferCall,
    isMakingCall,
    isEndingCall,
    isTransferring,
    formatDuration
  } = useSoftphone();

  const { voiceProviders } = useVoiceProviders();

  const handleMakeCall = () => {
    if (phoneNumber.trim()) {
      makeCall({
        phoneNumber: phoneNumber.trim(),
        providerId: selectedProviderId || undefined,
        agentId: selectedAgentId || undefined
      });
    }
  };

  const handleEndCall = () => {
    endCall();
  };

  const handleTransfer = () => {
    const destination = prompt('Enter destination number:');
    if (destination) {
      transferCall({ destination });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'idle': return 'bg-gray-500';
      case 'dialing': return 'bg-yellow-500';
      case 'ringing': return 'bg-blue-500';
      case 'connected': return 'bg-green-500';
      case 'ended': return 'bg-gray-500';
      case 'failed': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'idle': return 'Ready';
      case 'dialing': return 'Dialing...';
      case 'ringing': return 'Ringing...';
      case 'connected': return 'Connected';
      case 'ended': return 'Call Ended';
      case 'failed': return 'Call Failed';
      default: return status;
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Status Display */}
      <Card className="bg-gradient-to-r from-card to-secondary/10">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${getStatusColor(callStatus)} animate-pulse`} />
              <span className="text-lg font-medium">{getStatusText(callStatus)}</span>
              {isCallActive && (
                <Badge variant="outline" className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {formatDuration(callDuration)}
                </Badge>
              )}
            </div>
            {currentCall && (
              <Badge variant="secondary">
                {currentCall.direction === 'outbound' ? 'Outgoing' : 'Incoming'}
              </Badge>
            )}
          </div>
          
          {currentCall && (
            <div className="text-2xl font-bold text-primary mb-2">
              {currentCall.phone_number}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialer */}
      {!isCallActive && (
        <Card>
          <CardContent className="p-6 space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Phone Number</label>
              <Input
                placeholder="Enter phone number..."
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="text-lg"
                onKeyPress={(e) => e.key === 'Enter' && handleMakeCall()}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Voice Provider</label>
                <Select value={selectedProviderId} onValueChange={setSelectedProviderId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select provider" />
                  </SelectTrigger>
                  <SelectContent>
                    {voiceProviders.map((provider) => (
                      <SelectItem key={provider.id} value={provider.id}>
                        {provider.name} ({provider.provider_type})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Agent ID</label>
                <Input
                  placeholder="Optional agent ID"
                  value={selectedAgentId}
                  onChange={(e) => setSelectedAgentId(e.target.value)}
                />
              </div>
            </div>

            <Button
              onClick={handleMakeCall}
              disabled={!phoneNumber.trim() || isMakingCall}
              className="w-full bg-green-600 hover:bg-green-700 text-white"
              size="lg"
            >
              <PhoneCall className="h-5 w-5 mr-2" />
              {isMakingCall ? 'Calling...' : 'Make Call'}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Call Controls */}
      {isCallActive && callStatus === 'connected' && (
        <Card>
          <CardContent className="p-6">
            <div className="grid grid-cols-2 gap-4 mb-4">
              <Button
                variant={isMuted ? "destructive" : "outline"}
                onClick={() => setIsMuted(!isMuted)}
                className="flex items-center gap-2"
              >
                {isMuted ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                {isMuted ? 'Unmute' : 'Mute'}
              </Button>

              <Button
                variant={isOnHold ? "destructive" : "outline"}
                onClick={() => setIsOnHold(!isOnHold)}
                className="flex items-center gap-2"
              >
                {isOnHold ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
                {isOnHold ? 'Resume' : 'Hold'}
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Button
                onClick={handleTransfer}
                disabled={isTransferring}
                variant="outline"
                className="flex items-center gap-2"
              >
                <ArrowRight className="h-4 w-4" />
                Transfer
              </Button>

              <Button
                onClick={handleEndCall}
                disabled={isEndingCall}
                className="bg-red-600 hover:bg-red-700 text-white flex items-center gap-2"
              >
                <PhoneOff className="h-4 w-4" />
                End Call
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Dial Numbers */}
      {phoneNumbers.length > 0 && !isCallActive && (
        <Card>
          <CardContent className="p-6">
            <h3 className="font-medium mb-3">Quick Dial</h3>
            <div className="grid grid-cols-2 gap-2">
              {phoneNumbers.slice(0, 6).map((number) => (
                <Button
                  key={number.id}
                  variant="outline"
                  onClick={() => setPhoneNumber(number.phone_number)}
                  className="text-left justify-start"
                >
                  <Phone className="h-4 w-4 mr-2" />
                  {number.phone_number}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};