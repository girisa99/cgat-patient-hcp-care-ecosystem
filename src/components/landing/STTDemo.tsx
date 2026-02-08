/**
 * STT Demo — Speech-to-Text Landing Page Component
 * 
 * Uses dynamic language registry instead of hardcoded data.
 * Allows visitors to speak into the mic and see real-time
 * transcription results using the voice-to-text edge function.
 */

import React, { useState, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Mic, MicOff, Loader2, Copy, Check, Volume2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useDynamicLanguageRegistry } from '@/hooks/landing/useDynamicLanguageRegistry';

const SUPABASE_URL = 'https://ithspbabhmdntioslfqe.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml0aHNwYmFiaG1kbnRpb3NsZnFlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY5MjU5OTMsImV4cCI6MjA2MjUwMTk5M30.yUZZHsz2wIHboVuWWfqXeAH5oHRxzJIz20NWSUmHPhw';

const REGION_DEFAULT_LANG: Record<string, string> = {
  mena: 'ar', india: 'hi', africa: 'sw', apac: 'ja',
  latam: 'pt', europe: 'de', nam: 'en', caribbean: 'es',
};

interface STTDemoProps {
  className?: string;
  region?: string;
}

export const STTDemo: React.FC<STTDemoProps> = ({
  className = '',
  region,
}) => {
  const registry = useDynamicLanguageRegistry();
  const defaultLang = region ? (REGION_DEFAULT_LANG[region] || 'en') : 'en';
  const [language, setLanguage] = useState(defaultLang);
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcription, setTranscription] = useState('');
  const [provider, setProvider] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Get STT-supported languages from registry, sorted by region
  const sttLangs = region
    ? registry.getLanguagesForRegion(region).filter(l => {
        const short = l.code.split('-')[0];
        return ['en','ar','hi','ta','te','bn','ja','zh','ko','de','fr','es','pt','sw','th','vi','id','tr','it','nl','ru'].includes(short);
      })
    : registry.sttLanguages;

  // Deduplicate by short code for STT
  const uniqueSTTLangs = sttLangs.reduce<Array<{ code: string; name: string; flag: string }>>((acc, lang) => {
    const shortCode = lang.code.split('-')[0];
    if (!acc.find(l => l.code === shortCode)) {
      acc.push({ code: shortCode, name: lang.name, flag: lang.flag });
    }
    return acc;
  }, []);

  const startRecording = useCallback(async () => {
    try {
      setError(null);
      setTranscription('');
      setProvider(null);
      
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: { echoCancellation: true, noiseSuppression: true } 
      });
      
      const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];
      
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      
      mediaRecorder.onstop = async () => {
        stream.getTracks().forEach(t => t.stop());
        if (timerRef.current) clearInterval(timerRef.current);
        
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });
        await processAudio(audioBlob);
      };
      
      mediaRecorder.start(250);
      setIsRecording(true);
      setRecordingTime(0);
      
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => {
          if (prev >= 30) {
            stopRecording();
            return prev;
          }
          return prev + 1;
        });
      }, 1000);
      
    } catch (err: any) {
      console.error('[STT Demo] Mic error:', err);
      setError('Microphone access denied. Please allow mic access and try again.');
    }
  }, []);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  }, []);

  const processAudio = async (audioBlob: Blob) => {
    setIsProcessing(true);
    
    try {
      const arrayBuffer = await audioBlob.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);
      let binary = '';
      const chunkSize = 8192;
      for (let i = 0; i < uint8Array.length; i += chunkSize) {
        const chunk = uint8Array.subarray(i, i + chunkSize);
        binary += String.fromCharCode(...chunk);
      }
      const base64Audio = btoa(binary);
      
      const response = await fetch(
        `${SUPABASE_URL}/functions/v1/voice-to-text`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({
            audio: base64Audio,
            language,
          }),
        }
      );

      if (!response.ok) {
        const err = await response.json().catch(() => ({ error: 'STT failed' }));
        throw new Error(err.error || 'Transcription failed');
      }

      const data = await response.json();
      setTranscription(data.text || '');
      setProvider(data.provider || 'whisper');
    } catch (err: any) {
      console.error('[STT Demo] Error:', err);
      setError(err.message || 'Transcription failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCopy = () => {
    if (transcription) {
      navigator.clipboard.writeText(transcription);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <motion.div
      className={`max-w-3xl mx-auto ${className}`}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
    >
      <Card className="border-primary/20 shadow-xl overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-secondary/30 to-primary/10 border-b border-border">
          <CardTitle className="flex items-center gap-3">
            <div className="w-10 h-10 bg-secondary rounded-xl flex items-center justify-center">
              <Mic className="h-5 w-5 text-secondary-foreground" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-foreground">Speech-to-Text Demo</h3>
              <p className="text-sm text-muted-foreground font-normal">
                Speak into your mic and see real-time transcription
              </p>
            </div>
            <Badge variant="secondary" className="ml-auto">
              Multi-Provider STT
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          {/* Language selector — dynamic from registry */}
          <div className="flex items-center gap-3">
            <Select value={language} onValueChange={setLanguage}>
              <SelectTrigger className="flex-1">
                <SelectValue placeholder="Select language" />
              </SelectTrigger>
              <SelectContent>
                {uniqueSTTLangs.map(lang => (
                  <SelectItem key={lang.code} value={lang.code}>
                    {lang.flag} {lang.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Badge variant="outline" className="text-xs">
              <Volume2 className="h-3 w-3 mr-1" />
              {provider || 'Whisper / Google / ElevenLabs'}
            </Badge>
          </div>

          {/* Recording area */}
          <div className="flex flex-col items-center gap-4 py-6">
            <button
              onClick={isRecording ? stopRecording : startRecording}
              disabled={isProcessing}
              className={`w-24 h-24 rounded-full flex items-center justify-center transition-all ${
                isRecording
                  ? 'bg-destructive text-destructive-foreground animate-pulse shadow-lg shadow-destructive/30'
                  : isProcessing
                  ? 'bg-muted text-muted-foreground cursor-not-allowed'
                  : 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg hover:shadow-xl'
              }`}
            >
              {isProcessing ? (
                <Loader2 className="h-10 w-10 animate-spin" />
              ) : isRecording ? (
                <MicOff className="h-10 w-10" />
              ) : (
                <Mic className="h-10 w-10" />
              )}
            </button>

            <div className="text-center">
              {isRecording ? (
                <div className="space-y-1">
                  <p className="text-destructive font-medium">
                    🔴 Recording... {formatTime(recordingTime)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Click to stop (max 30 seconds)
                  </p>
                  <div className="flex items-center justify-center gap-1 mt-2">
                    {[1,2,3,4,5,6,7,8].map(i => (
                      <motion.div
                        key={i}
                        className="w-1 bg-destructive rounded-full"
                        animate={{ height: [4, 20, 8, 16, 6, 24, 10, 14] }}
                        transition={{ repeat: Infinity, duration: 0.8, delay: i * 0.08 }}
                      />
                    ))}
                  </div>
                </div>
              ) : isProcessing ? (
                <p className="text-muted-foreground">Processing audio...</p>
              ) : (
                <p className="text-muted-foreground">
                  Tap the mic to start speaking
                </p>
              )}
            </div>
          </div>

          {/* Transcription result */}
          {transcription && (
            <div className="p-4 bg-muted/30 rounded-lg border border-border">
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-medium text-muted-foreground uppercase">
                  Transcription Result
                </label>
                <div className="flex items-center gap-2">
                  {provider && (
                    <Badge variant="secondary" className="text-[10px]">
                      via {provider}
                    </Badge>
                  )}
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 text-xs gap-1"
                    onClick={handleCopy}
                  >
                    {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                    {copied ? 'Copied!' : 'Copy'}
                  </Button>
                </div>
              </div>
              <p className="text-foreground text-sm leading-relaxed">{transcription}</p>
            </div>
          )}

          {error && (
            <p className="text-sm text-destructive text-center">{error}</p>
          )}

          <p className="text-xs text-muted-foreground text-center">
            🔒 Audio is processed server-side and not stored. Supports Whisper, Google STT, and ElevenLabs Scribe.
          </p>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default STTDemo;
