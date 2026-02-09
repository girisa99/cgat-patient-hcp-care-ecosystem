/**
 * STT Demo Card — Speech-to-Text with Deepgram Nova 2 as primary
 * 
 * Provider chain: Deepgram Nova 2 → Azure STT → OpenAI Whisper
 * Includes suggested phrases so users know what to say in each language.
 */

import React, { useState, useRef, useCallback } from 'react';
import { Mic, MicOff, Loader2, Copy, Check, MessageSquareQuote } from 'lucide-react';
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
import { ProviderBadge, ProviderPanel } from './RegionalProviderInfo';
import { getSTTSuggestions } from './demoExamples';
import { motion } from 'framer-motion';

const SUPABASE_URL = 'https://ithspbabhmdntioslfqe.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml0aHNwYmFiaG1kbnRpb3NsZnFlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY5MjU5OTMsImV4cCI6MjA2MjUwMTk5M30.yUZZHsz2wIHboVuWWfqXeAH5oHRxzJIz20NWSUmHPhw';
const MAX_RETRIES = 3;
const INITIAL_BACKOFF_MS = 3000;

async function fetchWithRetry(url: string, options: RequestInit, retries = MAX_RETRIES): Promise<Response> {
  for (let attempt = 0; attempt <= retries; attempt++) {
    const response = await fetch(url, options);
    if (response.ok) return response;

    const body = await response.json().catch(() => ({ message: '' }));
    const isRateLimited = response.status === 429 ||
      (body?.message || body?.error || '').toLowerCase().includes('throttler') ||
      (body?.message || body?.error || '').toLowerCase().includes('too many');

    if (isRateLimited && attempt < retries) {
      const backoff = INITIAL_BACKOFF_MS * Math.pow(2, attempt);
      console.log(`[STT] Rate limited, retrying in ${backoff}ms (attempt ${attempt + 1}/${retries})`);
      await new Promise(r => setTimeout(r, backoff));
      continue;
    }
    throw new Error(isRateLimited
      ? 'Demo limit reached — each visitor gets 10 free tries per minute. Please wait a moment and try again!'
      : (body?.error || body?.message || 'Transcription failed'));
  }
  throw new Error('Demo limit reached — each visitor gets 10 free tries per minute. Please wait a moment and try again!');
}

const REGION_DEFAULT_LANG: Record<string, string> = {
  mena: 'ar', india: 'hi', africa: 'sw', apac: 'ja',
  latam: 'pt', europe: 'de', nam: 'en', caribbean: 'es',
};

interface STTDemoCardProps {
  region?: string;
  industryId?: string;
}

export const STTDemoCard: React.FC<STTDemoCardProps> = ({ region, industryId }) => {
  const registry = useDynamicLanguageRegistry();
  const defaultLang = region ? (REGION_DEFAULT_LANG[region] || 'en') : 'en';
  const [language, setLanguage] = useState(defaultLang);
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcription, setTranscription] = useState('');
  const [provider, setProvider] = useState<string | null>(null);
  const [latencyMs, setLatencyMs] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const suggestions = getSTTSuggestions(language);

  // Get STT-supported languages, dedup by short code
  const sttLangs = region
    ? registry.getLanguagesForRegion(region).filter(l => {
        const short = l.code.split('-')[0];
        return ['en','ar','hi','ta','te','bn','ja','zh','ko','de','fr','es','pt','sw','th','vi','id','tr','it','nl','ru'].includes(short);
      })
    : registry.sttLanguages;

  const uniqueSTTLangs = sttLangs.reduce<Array<{ code: string; name: string; flag: string; isCore?: boolean }>>((acc, lang) => {
    const shortCode = lang.code.split('-')[0];
    if (!acc.find(l => l.code === shortCode)) {
      acc.push({ code: shortCode, name: lang.name, flag: lang.flag, isCore: lang.isCore });
    }
    return acc;
  }, []);

  const startRecording = useCallback(async () => {
    try {
      setError(null);
      setTranscription('');
      setProvider(null);
      setLatencyMs(null);

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true },
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
    } catch {
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
    const startTime = Date.now();
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

      const response = await fetchWithRetry(`${SUPABASE_URL}/functions/v1/voice-to-text`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({ audio: base64Audio, language }),
      });

      const data = await response.json();
      setTranscription(data.text || '');
      setProvider(data.provider || 'Deepgram Nova 2');
      setLatencyMs(Date.now() - startTime);
    } catch (err: any) {
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
    <Card className="border-primary/20 shadow-xl overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-secondary/30 to-primary/10 border-b border-border py-4">
        <CardTitle className="flex items-center gap-3">
          <div className="w-10 h-10 bg-secondary rounded-xl flex items-center justify-center">
            <Mic className="h-5 w-5 text-secondary-foreground" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-bold text-foreground">Speech-to-Text</h3>
            <p className="text-sm text-muted-foreground font-normal">
              Pick a language, try a suggested phrase, and speak into your mic
            </p>
          </div>
          <ProviderBadge capability="stt" region={region} />
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-5">
        {/* Provider chain info */}
        <ProviderPanel capability="stt" region={region} compact />

        {/* Language selector */}
        <div>
          <label className="text-xs font-medium text-muted-foreground uppercase mb-2 block">
            Transcription Language
          </label>
          <Select value={language} onValueChange={setLanguage}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select language" />
            </SelectTrigger>
            <SelectContent>
              {uniqueSTTLangs.map(lang => (
                <SelectItem key={lang.code} value={lang.code}>
                  {lang.flag} {lang.name} {lang.isCore ? '⭐' : ''}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Suggested phrases */}
        {suggestions.length > 0 && (
          <div>
            <label className="text-xs font-medium text-muted-foreground uppercase mb-2 flex items-center gap-1.5">
              <MessageSquareQuote className="h-3.5 w-3.5" />
              Try saying one of these
            </label>
            <div className="space-y-2">
              {suggestions.map((s, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-2.5 p-3 rounded-xl border border-border bg-muted/20"
                  dir={['ar', 'he', 'ur', 'fa'].includes(language) ? 'rtl' : 'ltr'}
                >
                  <span className="text-primary text-sm font-bold shrink-0 mt-0.5">💬</span>
                  <p className="text-sm text-foreground leading-relaxed italic">
                    "{s.phrase}"
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recording area */}
        <div className="flex flex-col items-center gap-4 py-4">
          <button
            onClick={isRecording ? stopRecording : startRecording}
            disabled={isProcessing}
            className={`w-20 h-20 rounded-full flex items-center justify-center transition-all ${
              isRecording
                ? 'bg-destructive text-destructive-foreground animate-pulse shadow-lg shadow-destructive/30'
                : isProcessing
                ? 'bg-muted text-muted-foreground cursor-not-allowed'
                : 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg hover:shadow-xl'
            }`}
          >
            {isProcessing ? (
              <Loader2 className="h-8 w-8 animate-spin" />
            ) : isRecording ? (
              <MicOff className="h-8 w-8" />
            ) : (
              <Mic className="h-8 w-8" />
            )}
          </button>

          <div className="text-center">
            {isRecording ? (
              <div className="space-y-1">
                <p className="text-destructive font-medium text-sm">
                  🔴 Recording... {formatTime(recordingTime)}
                </p>
                <p className="text-xs text-muted-foreground">Click to stop (max 30s)</p>
                <div className="flex items-center justify-center gap-0.5 mt-2">
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
              <p className="text-muted-foreground text-sm">Processing via Deepgram Nova 2...</p>
            ) : (
              <p className="text-muted-foreground text-sm">Tap the mic to start speaking</p>
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
                    {latencyMs && <span className="ml-1 text-primary">{latencyMs}ms</span>}
                  </Badge>
                )}
                <Button size="sm" variant="ghost" className="h-7 text-xs gap-1" onClick={handleCopy}>
                  {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                  {copied ? 'Copied!' : 'Copy'}
                </Button>
              </div>
            </div>
            <p className="text-foreground text-sm leading-relaxed">{transcription}</p>
          </div>
        )}

        {error && (
          <div className="p-3 bg-accent/10 border border-accent/30 rounded-lg text-center">
            <p className="text-sm text-foreground font-medium">{error}</p>
            <p className="text-xs text-muted-foreground mt-1">
              Sign up for unlimited access to all AI features ✨
            </p>
          </div>
        )}

        <p className="text-xs text-muted-foreground text-center">
          🔒 Audio is processed server-side and not stored. Primary: Deepgram Nova 2, Fallback: Azure STT → Whisper.
        </p>
      </CardContent>
    </Card>
  );
};

export default STTDemoCard;
