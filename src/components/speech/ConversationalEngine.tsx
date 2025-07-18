/**
 * Conversational Engine for Healthcare with Speech Capabilities
 * Supports text-to-speech, speech-to-text, and adverse event detection
 */

import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  MessageSquare, 
  AlertTriangle, 
  Activity,
  Phone,
  PhoneCall,
  Settings
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface ConversationMessage {
  id: string;
  type: 'user' | 'agent' | 'system';
  content: string;
  timestamp: Date;
  audioUrl?: string;
  adverseEventFlag?: boolean;
  sentiment?: 'positive' | 'neutral' | 'negative' | 'urgent';
}

interface AdverseEventAlert {
  id: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  type: string;
  description: string;
  timestamp: Date;
  patient_id?: string;
}

interface ConversationalEngineProps {
  patientId?: string;
  therapyContext?: 'cell' | 'gene' | 'personalized' | 'radioland';
  onAdverseEvent?: (event: AdverseEventAlert) => void;
}

export const ConversationalEngine: React.FC<ConversationalEngineProps> = ({
  patientId,
  therapyContext = 'personalized',
  onAdverseEvent
}) => {
  const { toast } = useToast();
  const [messages, setMessages] = useState<ConversationMessage[]>([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [conversationMode, setConversationMode] = useState<'inbound' | 'outbound'>('inbound');
  const [adverseEvents, setAdverseEvents] = useState<AdverseEventAlert[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioContextRef = useRef<AudioContext | null>(null);

  // Initialize audio context
  useEffect(() => {
    audioContextRef.current = new AudioContext();
    return () => {
      audioContextRef.current?.close();
    };
  }, []);

  // Speech-to-Text Processing
  const processAudioToText = async (audioBlob: Blob): Promise<string> => {
    try {
      setIsProcessing(true);
      
      // Convert audio blob to base64
      const arrayBuffer = await audioBlob.arrayBuffer();
      const base64Audio = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
      
      // Call Supabase edge function for speech-to-text
      const { data, error } = await supabase.functions.invoke('speech-to-text', {
        body: { 
          audio: base64Audio,
          medical_context: therapyContext,
          specialty_terms: getSpecialtyTerms(therapyContext)
        }
      });
      
      if (error) throw error;
      
      return data.text || '';
    } catch (error) {
      console.error('Speech-to-text error:', error);
      toast({
        title: "Speech Recognition Error",
        description: "Failed to process audio. Please try again.",
        variant: "destructive"
      });
      return '';
    } finally {
      setIsProcessing(false);
    }
  };

  // Text-to-Speech Processing
  const processTextToSpeech = async (text: string, urgency: 'normal' | 'urgent' = 'normal'): Promise<string> => {
    try {
      const voiceProfile = urgency === 'urgent' ? 'urgent' : 'professional';
      
      const { data, error } = await supabase.functions.invoke('text-to-speech', {
        body: { 
          text,
          voice_profile: voiceProfile,
          medical_terms: getSpecialtyTerms(therapyContext),
          patient_context: { therapy_type: therapyContext }
        }
      });
      
      if (error) throw error;
      
      // Convert base64 audio to blob URL
      const audioBlob = new Blob([Uint8Array.from(atob(data.audioContent), c => c.charCodeAt(0))], { type: 'audio/mp3' });
      return URL.createObjectURL(audioBlob);
    } catch (error) {
      console.error('Text-to-speech error:', error);
      toast({
        title: "Speech Generation Error", 
        description: "Failed to generate speech. Please try again.",
        variant: "destructive"
      });
      return '';
    }
  };

  // Get specialty terms based on therapy context
  const getSpecialtyTerms = (context: string): string[] => {
    const terms = {
      cell: ['CAR-T', 'stem cell', 'regenerative', 'infusion', 'cytokine release syndrome', 'engraftment'],
      gene: ['vector', 'transduction', 'gene expression', 'viral vector', 'immunogenicity', 'biodistribution'],
      personalized: ['biomarker', 'genomic', 'precision medicine', 'pharmacogenomics', 'targeted therapy'],
      radioland: ['radioland therapy', 'radiation exposure', 'dosimetry', 'radioprotection', 'isotope']
    };
    return terms[context as keyof typeof terms] || [];
  };

  // Adverse Event Detection
  const detectAdverseEvents = (text: string): AdverseEventAlert[] => {
    const adverseEventKeywords = [
      { keywords: ['severe pain', 'unbearable', 'emergency'], severity: 'critical' as const, type: 'Pain' },
      { keywords: ['allergic reaction', 'rash', 'swelling', 'difficulty breathing'], severity: 'high' as const, type: 'Allergic Reaction' },
      { keywords: ['nausea', 'vomiting', 'diarrhea'], severity: 'medium' as const, type: 'GI Effects' },
      { keywords: ['fever', 'chills', 'infection'], severity: 'high' as const, type: 'Infection' },
      { keywords: ['bleeding', 'bruising', 'blood'], severity: 'high' as const, type: 'Bleeding' },
      { keywords: ['chest pain', 'heart racing', 'palpitations'], severity: 'critical' as const, type: 'Cardiac' },
      { keywords: ['headache', 'dizziness', 'confusion'], severity: 'medium' as const, type: 'Neurological' }
    ];

    const detected: AdverseEventAlert[] = [];
    const lowerText = text.toLowerCase();

    adverseEventKeywords.forEach(({ keywords, severity, type }) => {
      if (keywords.some(keyword => lowerText.includes(keyword))) {
        const event: AdverseEventAlert = {
          id: `ae-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          severity,
          type,
          description: `Potential ${type.toLowerCase()} detected in conversation`,
          timestamp: new Date(),
          patient_id: patientId
        };
        detected.push(event);
      }
    });

    return detected;
  };

  // Start Recording
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          sampleRate: 16000,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true
        }
      });
      
      audioChunksRef.current = [];
      mediaRecorderRef.current = new MediaRecorder(stream);
      
      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };
      
      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const transcription = await processAudioToText(audioBlob);
        
        if (transcription) {
          handleSendMessage(transcription, true);
        }
        
        stream.getTracks().forEach(track => track.stop());
      };
      
      mediaRecorderRef.current.start();
      setIsRecording(true);
      
      toast({
        title: "Recording Started",
        description: "Speak clearly for accurate transcription"
      });
    } catch (error) {
      console.error('Recording error:', error);
      toast({
        title: "Recording Error",
        description: "Failed to access microphone. Please check permissions.",
        variant: "destructive"
      });
    }
  };

  // Stop Recording
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      toast({
        title: "Recording Stopped",
        description: "Processing speech..."
      });
    }
  };

  // Play Audio
  const playAudio = async (audioUrl: string) => {
    try {
      setIsPlaying(true);
      const audio = new Audio(audioUrl);
      
      audio.onended = () => setIsPlaying(false);
      audio.onerror = () => {
        setIsPlaying(false);
        toast({
          title: "Playback Error",
          description: "Failed to play audio",
          variant: "destructive"
        });
      };
      
      await audio.play();
    } catch (error) {
      console.error('Audio playback error:', error);
      setIsPlaying(false);
    }
  };

  // Handle Send Message
  const handleSendMessage = async (text: string = currentMessage, fromSpeech: boolean = false) => {
    if (!text.trim()) return;
    
    // Detect adverse events
    const detectedEvents = detectAdverseEvents(text);
    if (detectedEvents.length > 0) {
      setAdverseEvents(prev => [...prev, ...detectedEvents]);
      detectedEvents.forEach(event => {
        onAdverseEvent?.(event);
        toast({
          title: "Adverse Event Detected",
          description: `${event.type} - ${event.severity} severity`,
          variant: event.severity === 'critical' ? 'destructive' : 'default'
        });
      });
    }
    
    // Create user message
    const userMessage: ConversationMessage = {
      id: `msg-${Date.now()}`,
      type: 'user',
      content: text,
      timestamp: new Date(),
      adverseEventFlag: detectedEvents.length > 0
    };
    
    setMessages(prev => [...prev, userMessage]);
    setCurrentMessage('');
    
    // Generate AI response (simplified for demo)
    setTimeout(async () => {
      const responseText = generateResponse(text, therapyContext, detectedEvents.length > 0);
      const audioUrl = await processTextToSpeech(responseText, detectedEvents.length > 0 ? 'urgent' : 'normal');
      
      const agentMessage: ConversationMessage = {
        id: `msg-${Date.now()}-agent`,
        type: 'agent',
        content: responseText,
        timestamp: new Date(),
        audioUrl,
        sentiment: detectedEvents.length > 0 ? 'urgent' : 'neutral'
      };
      
      setMessages(prev => [...prev, agentMessage]);
      
      // Auto-play response if adverse event detected
      if (detectedEvents.length > 0 && audioUrl) {
        await playAudio(audioUrl);
      }
    }, 1000);
  };

  // Generate AI Response (simplified)
  const generateResponse = (userMessage: string, context: string, hasAdverseEvent: boolean): string => {
    if (hasAdverseEvent) {
      return `I understand you're experiencing some concerning symptoms. This is important information for your ${context} therapy monitoring. I'm documenting this adverse event and will ensure your care team is notified immediately. Please contact your healthcare provider or emergency services if symptoms worsen.`;
    }
    
    const responses = {
      cell: `Thank you for the update regarding your cell therapy treatment. I'm monitoring your progress and will keep track of any changes. Is there anything specific about your CAR-T or stem cell therapy that you'd like to discuss?`,
      gene: `I've noted your information about the gene therapy process. It's important to track how you're responding to the treatment. Are you experiencing any expected or unexpected effects from the viral vector delivery?`,
      personalized: `Your feedback helps us optimize your personalized medicine approach. Based on your biomarkers and genetic profile, we can adjust your treatment plan as needed. How are you feeling about the targeted therapy?`,
      radioland: `I'm recording your update about the radioland treatment. Monitoring radiation exposure and effects is crucial for safety. Please continue to report any changes in how you're feeling.`
    };
    
    return responses[context as keyof typeof responses] || `Thank you for your message. I'm here to help monitor your treatment and address any concerns you may have.`;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Healthcare Conversational Engine
            </CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant={conversationMode === 'inbound' ? 'default' : 'secondary'}>
                {conversationMode === 'inbound' ? <Phone className="h-3 w-3 mr-1" /> : <PhoneCall className="h-3 w-3 mr-1" />}
                {conversationMode === 'inbound' ? 'Inbound' : 'Outbound'}
              </Badge>
              {therapyContext && (
                <Badge variant="outline">
                  {therapyContext.charAt(0).toUpperCase() + therapyContext.slice(1)} Therapy
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="conversation" className="space-y-4">
            <TabsList>
              <TabsTrigger value="conversation">Conversation</TabsTrigger>
              <TabsTrigger value="adverse-events">
                Adverse Events
                {adverseEvents.length > 0 && (
                  <Badge variant="destructive" className="ml-2">
                    {adverseEvents.length}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>

            <TabsContent value="conversation" className="space-y-4">
              {/* Messages Display */}
              <div className="h-96 overflow-y-auto border rounded-lg p-4 space-y-3">
                {messages.length === 0 ? (
                  <div className="text-center text-muted-foreground">
                    <Activity className="h-8 w-8 mx-auto mb-2" />
                    <p>Start a conversation to monitor patient care</p>
                  </div>
                ) : (
                  messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-xs lg:max-w-md px-3 py-2 rounded-lg ${
                          message.type === 'user'
                            ? 'bg-primary text-primary-foreground'
                            : message.adverseEventFlag
                            ? 'bg-destructive text-destructive-foreground'
                            : 'bg-muted'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs opacity-70">
                            {message.type === 'user' ? 'You' : 'Agent'}
                          </span>
                          <div className="flex items-center gap-1">
                            {message.adverseEventFlag && (
                              <AlertTriangle className="h-3 w-3" />
                            )}
                            {message.audioUrl && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-4 w-4 p-0"
                                onClick={() => playAudio(message.audioUrl!)}
                                disabled={isPlaying}
                              >
                                {isPlaying ? <VolumeX className="h-3 w-3" /> : <Volume2 className="h-3 w-3" />}
                              </Button>
                            )}
                          </div>
                        </div>
                        <p className="text-sm">{message.content}</p>
                        <p className="text-xs opacity-50 mt-1">
                          {message.timestamp.toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Input Area */}
              <div className="space-y-3">
                <Textarea
                  value={currentMessage}
                  onChange={(e) => setCurrentMessage(e.target.value)}
                  placeholder="Type your message or use voice input..."
                  className="min-h-[80px]"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                />
                
                <div className="flex items-center gap-2">
                  <Button
                    variant={isRecording ? "destructive" : "outline"}
                    size="sm"
                    onClick={isRecording ? stopRecording : startRecording}
                    disabled={isProcessing}
                  >
                    {isRecording ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                    {isRecording ? 'Stop Recording' : 'Voice Input'}
                  </Button>
                  
                  <Button
                    onClick={() => handleSendMessage()}
                    disabled={!currentMessage.trim() || isProcessing}
                    className="flex-1"
                  >
                    Send Message
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setConversationMode(conversationMode === 'inbound' ? 'outbound' : 'inbound')}
                  >
                    Switch to {conversationMode === 'inbound' ? 'Outbound' : 'Inbound'}
                  </Button>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="adverse-events" className="space-y-4">
              <div className="space-y-3">
                {adverseEvents.length === 0 ? (
                  <div className="text-center text-muted-foreground py-8">
                    <AlertTriangle className="h-8 w-8 mx-auto mb-2" />
                    <p>No adverse events detected</p>
                  </div>
                ) : (
                  adverseEvents.map((event) => (
                    <Card key={event.id}>
                      <CardContent className="pt-4">
                        <div className="flex items-center justify-between mb-2">
                          <Badge
                            variant={
                              event.severity === 'critical' ? 'destructive' :
                              event.severity === 'high' ? 'destructive' :
                              event.severity === 'medium' ? 'default' : 'secondary'
                            }
                          >
                            {event.severity.toUpperCase()} - {event.type}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {event.timestamp.toLocaleString()}
                          </span>
                        </div>
                        <p className="text-sm">{event.description}</p>
                        {event.patient_id && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Patient ID: {event.patient_id}
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </TabsContent>

            <TabsContent value="settings" className="space-y-4">
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Therapy Context</label>
                  <p className="text-xs text-muted-foreground mb-2">
                    Current therapy context affects speech recognition and response generation
                  </p>
                  <Badge variant="outline">{therapyContext}</Badge>
                </div>
                
                <div>
                  <label className="text-sm font-medium">Speech Features</label>
                  <div className="mt-2 space-y-2">
                    <div className="flex items-center gap-2">
                      <Mic className="h-4 w-4" />
                      <span className="text-sm">Speech-to-Text with medical vocabulary</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Volume2 className="h-4 w-4" />
                      <span className="text-sm">Text-to-Speech with urgency detection</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4" />
                      <span className="text-sm">Real-time adverse event detection</span>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};