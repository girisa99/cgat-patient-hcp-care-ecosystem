import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  Play, 
  Pause, 
  Download,
  Upload,
  Send,
  FileText,
  Bot,
  Settings
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface UniversalVoiceInterfaceProps {
  agentType: 'conversational' | 'structured' | 'traditional_form' | 'fax' | 'pdf';
  channelType: 'online' | 'pdf' | 'fax' | 'voice' | 'download';
  onDataCapture?: (data: any) => void;
  onStatusChange?: (status: string) => void;
}

export const UniversalVoiceInterface: React.FC<UniversalVoiceInterfaceProps> = ({
  agentType,
  channelType,
  onDataCapture,
  onStatusChange
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [recordedText, setRecordedText] = useState('');
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [currentAction, setCurrentAction] = useState<'record' | 'speak' | 'process'>('record');
  const [processingData, setProcessingData] = useState<any>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioElementRef = useRef<HTMLAudioElement | null>(null);

  const getAgentCapabilities = () => {
    const capabilities = {
      conversational: {
        canRecord: true,
        canSpeak: true,
        canProcess: true,
        features: ['Real-time conversation', 'Context awareness', 'Natural responses']
      },
      structured: {
        canRecord: true,
        canSpeak: true,
        canProcess: true,
        features: ['Step-by-step guidance', 'Form validation', 'Progress tracking']
      },
      traditional_form: {
        canRecord: false,
        canSpeak: true,
        canProcess: false,
        features: ['Read-only voice feedback', 'Form confirmation']
      },
      fax: {
        canRecord: true,
        canSpeak: true,
        canProcess: true,
        features: ['OCR voice readout', 'Voice dictation', 'Status announcements']
      },
      pdf: {
        canRecord: true,
        canSpeak: true,
        canProcess: true,
        features: ['Document reading', 'Voice navigation', 'Form filling']
      }
    };

    return capabilities[agentType];
  };

  const capabilities = getAgentCapabilities();

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          sampleRate: 24000,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });

      mediaRecorderRef.current = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });

      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setAudioBlob(audioBlob);
        await processAudio(audioBlob);
        
        // Stop the stream
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorderRef.current.start(1000); // Collect data every second
      setIsRecording(true);
      onStatusChange?.('recording');
      toast.success('Recording started');
    } catch (error) {
      console.error('Error starting recording:', error);
      toast.error('Failed to start recording. Please check microphone permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      onStatusChange?.('processing');
      toast.info('Processing audio...');
    }
  };

  const processAudio = async (audioBlob: Blob) => {
    try {
      // Convert audio blob to base64
      const arrayBuffer = await audioBlob.arrayBuffer();
      const base64Audio = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));

      // Send to appropriate processing endpoint based on channel type
      let endpoint = 'huggingface-speech';
      let additionalData = {};

      if (channelType === 'pdf') {
        endpoint = 'pdf-voice-processor';
        additionalData = { action: 'voice_navigation' };
      } else if (channelType === 'fax') {
        endpoint = 'fax-voice-processor';
        additionalData = { action: 'voice_dictation' };
      }

      const { data, error } = await supabase.functions.invoke(endpoint, {
        body: {
          audio: base64Audio,
          agentType,
          ...additionalData
        }
      });

      if (error) throw error;

      setRecordedText(data.text || data.transcription || '');
      setProcessingData(data);
      
      // Capture data for form filling
      if (onDataCapture && data.text) {
        const capturedData = extractDataFromTranscription(data.text);
        onDataCapture(capturedData);
      }

      onStatusChange?.('completed');
      toast.success('Audio processed successfully');
    } catch (error) {
      console.error('Error processing audio:', error);
      toast.error('Failed to process audio');
      onStatusChange?.('error');
    }
  };

  const speakText = async (text: string) => {
    try {
      setIsPlaying(true);
      onStatusChange?.('speaking');

      const { data, error } = await supabase.functions.invoke('elevenlabs-voice', {
        body: {
          text,
          agentType,
          voice: getVoiceForAgent(),
          model: 'eleven_multilingual_v2'
        }
      });

      if (error) throw error;

      // Play the audio
      const audioData = `data:audio/mpeg;base64,${data.audioContent}`;
      const audio = new Audio(audioData);
      audioElementRef.current = audio;

      audio.onended = () => {
        setIsPlaying(false);
        onStatusChange?.('idle');
      };

      audio.onerror = () => {
        setIsPlaying(false);
        onStatusChange?.('error');
        toast.error('Failed to play audio');
      };

      await audio.play();
      toast.success('Playing audio response');
    } catch (error) {
      console.error('Error generating speech:', error);
      toast.error('Failed to generate speech');
      setIsPlaying(false);
      onStatusChange?.('error');
    }
  };

  const stopPlaying = () => {
    if (audioElementRef.current) {
      audioElementRef.current.pause();
      audioElementRef.current.currentTime = 0;
      setIsPlaying(false);
      onStatusChange?.('idle');
    }
  };

  const getVoiceForAgent = () => {
    const voiceMap = {
      conversational: 'Aria',
      structured: 'Sarah',
      traditional_form: 'Laura',
      fax: 'Charlie',
      pdf: 'Jessica'
    };
    return voiceMap[agentType];
  };

  const extractDataFromTranscription = (text: string) => {
    // Simple data extraction - in production, use more sophisticated NLP
    const data: any = {};
    
    // Extract common patterns
    const nameMatch = text.match(/(?:my name is|name is|i am) ([a-zA-Z\s]+)/i);
    if (nameMatch) data.name = nameMatch[1].trim();

    const emailMatch = text.match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/);
    if (emailMatch) data.email = emailMatch[1];

    const phoneMatch = text.match(/(\d{3}[-.\s]?\d{3}[-.\s]?\d{4})/);
    if (phoneMatch) data.phone = phoneMatch[1];

    return data;
  };

  const downloadAudio = () => {
    if (audioBlob) {
      const url = URL.createObjectURL(audioBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `recording_${agentType}_${Date.now()}.webm`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success('Audio downloaded');
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5" />
            Voice Interface - {agentType} ({channelType})
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant={voiceEnabled ? "default" : "secondary"}>
              {voiceEnabled ? 'Voice Enabled' : 'Voice Disabled'}
            </Badge>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setVoiceEnabled(!voiceEnabled)}
            >
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={currentAction} onValueChange={(value: any) => setCurrentAction(value)}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="record" disabled={!capabilities.canRecord}>
              <Mic className="h-4 w-4 mr-2" />
              Record
            </TabsTrigger>
            <TabsTrigger value="speak" disabled={!capabilities.canSpeak}>
              <Volume2 className="h-4 w-4 mr-2" />
              Speak
            </TabsTrigger>
            <TabsTrigger value="process" disabled={!capabilities.canProcess}>
              <FileText className="h-4 w-4 mr-2" />
              Process
            </TabsTrigger>
          </TabsList>

          <TabsContent value="record" className="space-y-4">
            <div className="flex items-center justify-center space-x-4">
              <Button
                onClick={isRecording ? stopRecording : startRecording}
                disabled={!voiceEnabled}
                size="lg"
                className={isRecording ? 'bg-red-500 hover:bg-red-600' : ''}
              >
                {isRecording ? (
                  <>
                    <MicOff className="h-5 w-5 mr-2" />
                    Stop Recording
                  </>
                ) : (
                  <>
                    <Mic className="h-5 w-5 mr-2" />
                    Start Recording
                  </>
                )}
              </Button>
              
              {audioBlob && (
                <Button variant="outline" onClick={downloadAudio}>
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
              )}
            </div>

            {recordedText && (
              <div className="p-4 bg-muted rounded-lg">
                <h4 className="font-medium mb-2">Transcribed Text:</h4>
                <p>{recordedText}</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="speak" className="space-y-4">
            <div className="flex items-center justify-center space-x-4">
              <Button
                onClick={isPlaying ? stopPlaying : () => speakText(recordedText || 'Hello, this is a test of the voice interface.')}
                disabled={!voiceEnabled}
                size="lg"
              >
                {isPlaying ? (
                  <>
                    <Pause className="h-5 w-5 mr-2" />
                    Stop Playing
                  </>
                ) : (
                  <>
                    <Play className="h-5 w-5 mr-2" />
                    Play Response
                  </>
                )}
              </Button>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium">Voice: {getVoiceForAgent()}</h4>
              <p className="text-sm text-muted-foreground">
                Optimized for {agentType} interactions
              </p>
            </div>
          </TabsContent>

          <TabsContent value="process" className="space-y-4">
            <div className="grid gap-4">
              <div>
                <h4 className="font-medium mb-2">Agent Capabilities:</h4>
                <div className="space-y-1">
                  {capabilities.features.map((feature, index) => (
                    <Badge key={index} variant="outline" className="mr-2">
                      {feature}
                    </Badge>
                  ))}
                </div>
              </div>

              {processingData && (
                <div className="p-4 bg-muted rounded-lg">
                  <h4 className="font-medium mb-2">Processing Results:</h4>
                  <pre className="text-sm whitespace-pre-wrap">
                    {JSON.stringify(processingData, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};