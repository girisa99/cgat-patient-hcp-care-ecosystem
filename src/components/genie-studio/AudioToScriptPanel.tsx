/**
 * AUDIO TO SCRIPT PANEL - Phase 1 Frontend (P0-10)
 * UI for transcribing audio and converting to production-ready scripts
 * Uses audioToScriptService backend service with Universal AI
 */

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Mic, 
  Upload,
  Link,
  Wand2, 
  Loader2, 
  CheckCircle, 
  AlertCircle,
  Copy,
  Download,
  Play,
  Pause,
  Clock,
  Volume2,
  FileAudio,
  Radio,
  Square
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { useDropzone } from 'react-dropzone';
import { 
  audioToScriptService, 
  AudioToScriptRequest, 
  AudioToScriptResult,
  ScriptOutputFormat,
  TranscriptionProvider
} from '@/services/audioToScriptService';
import { ContentSafetyBanner } from './ContentSafetyBanner';

interface AudioToScriptPanelProps {
  onScriptGenerated?: (script: AudioToScriptResult['script']) => void;
  className?: string;
}

const OUTPUT_FORMATS: { value: ScriptOutputFormat; label: string; description: string }[] = [
  { value: 'video_script', label: 'Video Script', description: 'For video productions' },
  { value: 'podcast_script', label: 'Podcast Script', description: 'For audio podcasts' },
  { value: 'meeting_notes', label: 'Meeting Notes', description: 'For meeting summaries' },
  { value: 'tutorial_script', label: 'Tutorial', description: 'For how-to content' },
];

const TRANSCRIPTION_PROVIDERS: { value: TranscriptionProvider; label: string; description: string }[] = [
  { value: 'openai', label: 'OpenAI Whisper', description: 'Best accuracy' },
  { value: 'huggingface', label: 'Hugging Face', description: 'Open source' },
  { value: 'google', label: 'Google Cloud', description: 'Multi-language' },
];

const TONE_OPTIONS = [
  { value: 'professional', label: 'Professional' },
  { value: 'casual', label: 'Casual' },
  { value: 'educational', label: 'Educational' },
  { value: 'documentary', label: 'Documentary' },
];

export function AudioToScriptPanel({ onScriptGenerated, className }: AudioToScriptPanelProps) {
  const [activeTab, setActiveTab] = useState<'upload' | 'url' | 'record'>('upload');
  
  // Audio inputs
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [audioUrl, setAudioUrl] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);
  
  // Cleanup recording timer on unmount
  useEffect(() => {
    return () => {
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
      }
    };
  }, []);
  
  // Options
  const [outputFormat, setOutputFormat] = useState<ScriptOutputFormat>('video_script');
  const [transcriptionProvider, setTranscriptionProvider] = useState<TranscriptionProvider>('openai');
  const [tone, setTone] = useState('professional');
  const [targetAudience, setTargetAudience] = useState('');
  const [language, setLanguage] = useState('en');
  const [enhanceWithAI, setEnhanceWithAI] = useState(true);
  const [removeFillerWords, setRemoveFillerWords] = useState(true);
  const [speakerDiarization, setSpeakerDiarization] = useState(false);
  
  // State
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressMessage, setProgressMessage] = useState('');
  const [result, setResult] = useState<AudioToScriptResult | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      setUploadedFile(file);
      toast.success(`Audio uploaded: ${file.name}`);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'audio/mpeg': ['.mp3'],
      'audio/wav': ['.wav'],
      'audio/ogg': ['.ogg'],
      'audio/webm': ['.webm'],
      'audio/mp4': ['.m4a'],
      'audio/flac': ['.flac'],
    },
    maxFiles: 1,
    maxSize: 100 * 1024 * 1024, // 100MB
  });

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      const chunks: Blob[] = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        setRecordedBlob(blob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
      setIsRecording(true);
      setRecordingDuration(0);

      recordingTimerRef.current = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);

      toast.info('Recording started...');
    } catch (error) {
      console.error('Recording error:', error);
      toast.error('Could not access microphone');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
      }
      toast.success('Recording saved');
    }
  };

  const formatRecordingTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getAudioInput = async (): Promise<{ source: 'file' | 'url' | 'recording'; data: any } | null> => {
    if (activeTab === 'upload' && uploadedFile) {
      return { source: 'file', data: uploadedFile };
    }
    if (activeTab === 'url' && audioUrl.trim()) {
      return { source: 'url', data: audioUrl.trim() };
    }
    if (activeTab === 'record' && recordedBlob) {
      return { source: 'recording', data: recordedBlob };
    }
    return null;
  };

  const handleConvert = async () => {
    const audioInput = await getAudioInput();
    
    if (!audioInput) {
      toast.error('Please provide audio input');
      return;
    }

    setIsProcessing(true);
    setProgress(0);
    setProgressMessage('Starting...');
    setResult(null);

    try {
      // Progress simulation
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 8, 90));
        const messages = [
          'Processing audio...',
          'Transcribing content...',
          'Analyzing speech patterns...',
          'Enhancing transcription...',
          'Generating script...',
        ];
        setProgressMessage(messages[Math.floor(Math.random() * messages.length)]);
      }, 1200);

      const request: AudioToScriptRequest = {
        audioSource: audioInput.source,
        audioUrl: audioInput.source === 'url' ? audioInput.data : undefined,
        audioFile: audioInput.source === 'file' ? audioInput.data : 
                   audioInput.source === 'recording' ? new File([audioInput.data], 'recording.webm', { type: 'audio/webm' }) : undefined,
        transcriptionProvider,
        language,
        speakerDiarization,
        outputFormat,
        tone: tone as any,
        targetAudience: targetAudience || undefined,
        enhanceWithAI,
        removeFillerWords,
        aiProvider: 'gemini',
      };

      const conversionResult = await audioToScriptService.convertAudioToScript(request);

      clearInterval(progressInterval);
      setProgress(100);
      setProgressMessage('Complete!');
      setResult(conversionResult);

      if (conversionResult.success && conversionResult.script) {
        toast.success('Script generated successfully!');
        onScriptGenerated?.(conversionResult.script);
      } else {
        toast.error(conversionResult.error || 'Conversion failed');
      }
    } catch (error) {
      console.error('Conversion error:', error);
      toast.error('An error occurred during conversion');
      setResult({ success: false, error: 'Conversion failed' });
    } finally {
      setIsProcessing(false);
    }
  };

  const copyScriptToClipboard = () => {
    if (result?.script) {
      const scriptText = result.script.scenes.map(scene => 
        `[Scene ${scene.sceneNumber}${scene.speaker ? ` - ${scene.speaker}` : ''}]\n${scene.narration}`
      ).join('\n\n');
      navigator.clipboard.writeText(scriptText);
      toast.success('Script copied to clipboard');
    }
  };

  const copyTranscriptionToClipboard = () => {
    if (result?.transcription?.text) {
      navigator.clipboard.writeText(result.transcription.text);
      toast.success('Transcription copied to clipboard');
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className={cn("space-y-6", className)}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Volume2 className="h-5 w-5 text-primary" />
            Audio to Script
          </CardTitle>
          <CardDescription>
            Transcribe audio and convert to production-ready scripts using Universal AI
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Content Safety Notice */}
          <ContentSafetyBanner variant="minimal" />

          {/* Input Method Tabs */}
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="upload" className="flex items-center gap-2">
                <Upload className="h-4 w-4" />
                Upload
              </TabsTrigger>
              <TabsTrigger value="url" className="flex items-center gap-2">
                <Link className="h-4 w-4" />
                URL
              </TabsTrigger>
              <TabsTrigger value="record" className="flex items-center gap-2">
                <Mic className="h-4 w-4" />
                Record
              </TabsTrigger>
            </TabsList>

            <TabsContent value="upload" className="mt-4">
              <div
                {...getRootProps()}
                className={cn(
                  "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors",
                  isDragActive ? "border-primary bg-primary/5" : "border-border hover:border-primary/50",
                  uploadedFile && "border-green-500 bg-green-50 dark:bg-green-950/20"
                )}
              >
                <input {...getInputProps()} />
                {uploadedFile ? (
                  <div className="flex flex-col items-center gap-2">
                    <FileAudio className="h-10 w-10 text-green-500" />
                    <p className="font-medium">{uploadedFile.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {(uploadedFile.size / (1024 * 1024)).toFixed(1)} MB
                    </p>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={(e) => { 
                        e.stopPropagation(); 
                        setUploadedFile(null); 
                      }}
                    >
                      Remove
                    </Button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2">
                    <Upload className="h-10 w-10 text-muted-foreground" />
                    <p className="font-medium">
                      {isDragActive ? 'Drop the audio file here' : 'Drag & drop or click to upload'}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Supports MP3, WAV, OGG, WebM, M4A, FLAC (max 100MB)
                    </p>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="url" className="mt-4 space-y-4">
              <div className="space-y-2">
                <Label>Audio URL</Label>
                <Input
                  placeholder="https://example.com/audio.mp3"
                  value={audioUrl}
                  onChange={(e) => setAudioUrl(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Enter a direct link to an audio file
                </p>
              </div>
            </TabsContent>

            <TabsContent value="record" className="mt-4">
              <div className="flex flex-col items-center gap-4 py-8">
                {isRecording ? (
                  <>
                    <div className="relative">
                      <Radio className="h-16 w-16 text-red-500 animate-pulse" />
                      <span className="absolute -top-2 -right-2 flex h-4 w-4">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                        <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500" />
                      </span>
                    </div>
                    <p className="text-2xl font-mono">{formatRecordingTime(recordingDuration)}</p>
                    <Button onClick={stopRecording} variant="destructive" size="lg">
                      <Square className="h-4 w-4 mr-2" />
                      Stop Recording
                    </Button>
                  </>
                ) : recordedBlob ? (
                  <>
                    <FileAudio className="h-16 w-16 text-green-500" />
                    <p className="font-medium">Recording saved ({formatRecordingTime(recordingDuration)})</p>
                    <div className="flex gap-2">
                      <Button onClick={startRecording} variant="outline">
                        <Mic className="h-4 w-4 mr-2" />
                        Re-record
                      </Button>
                      <Button 
                        variant="ghost" 
                        onClick={() => { setRecordedBlob(null); setRecordingDuration(0); }}
                      >
                        Clear
                      </Button>
                    </div>
                  </>
                ) : (
                  <>
                    <Mic className="h-16 w-16 text-muted-foreground" />
                    <p className="text-muted-foreground">Click to start recording</p>
                    <Button onClick={startRecording} size="lg">
                      <Mic className="h-4 w-4 mr-2" />
                      Start Recording
                    </Button>
                  </>
                )}
              </div>
            </TabsContent>
          </Tabs>

          {/* Transcription Provider */}
          <div className="space-y-2">
            <Label>Transcription Provider</Label>
            <div className="grid grid-cols-3 gap-3">
              {TRANSCRIPTION_PROVIDERS.map((provider) => (
                <button
                  key={provider.value}
                  onClick={() => setTranscriptionProvider(provider.value)}
                  className={cn(
                    "p-3 rounded-lg border text-left transition-all",
                    transcriptionProvider === provider.value
                      ? "border-primary bg-primary/10 ring-2 ring-primary/20"
                      : "border-border hover:border-primary/50"
                  )}
                >
                  <span className="font-medium text-sm">{provider.label}</span>
                  <p className="text-xs text-muted-foreground mt-1">{provider.description}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Output Format */}
          <div className="space-y-2">
            <Label>Output Format</Label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {OUTPUT_FORMATS.map((format) => (
                <button
                  key={format.value}
                  onClick={() => setOutputFormat(format.value)}
                  className={cn(
                    "p-3 rounded-lg border text-left transition-all",
                    outputFormat === format.value
                      ? "border-primary bg-primary/10 ring-2 ring-primary/20"
                      : "border-border hover:border-primary/50"
                  )}
                >
                  <span className="font-medium text-sm">{format.label}</span>
                  <p className="text-xs text-muted-foreground mt-1">{format.description}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Options Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Tone</Label>
              <Select value={tone} onValueChange={setTone}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TONE_OPTIONS.map((t) => (
                    <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Language</Label>
              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="es">Spanish</SelectItem>
                  <SelectItem value="fr">French</SelectItem>
                  <SelectItem value="de">German</SelectItem>
                  <SelectItem value="ja">Japanese</SelectItem>
                  <SelectItem value="zh">Chinese</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Target Audience</Label>
              <Input
                placeholder="e.g., Professionals"
                value={targetAudience}
                onChange={(e) => setTargetAudience(e.target.value)}
              />
            </div>
          </div>

          {/* Checkboxes */}
          <div className="flex flex-wrap gap-6">
            <div className="flex items-center gap-2">
              <Checkbox 
                id="enhance" 
                checked={enhanceWithAI} 
                onCheckedChange={(c) => setEnhanceWithAI(!!c)} 
              />
              <Label htmlFor="enhance" className="text-sm cursor-pointer">
                Enhance with AI
              </Label>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox 
                id="fillers" 
                checked={removeFillerWords} 
                onCheckedChange={(c) => setRemoveFillerWords(!!c)} 
              />
              <Label htmlFor="fillers" className="text-sm cursor-pointer">
                Remove Filler Words
              </Label>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox 
                id="speakers" 
                checked={speakerDiarization} 
                onCheckedChange={(c) => setSpeakerDiarization(!!c)} 
              />
              <Label htmlFor="speakers" className="text-sm cursor-pointer">
                Speaker Detection
              </Label>
            </div>
          </div>

          {/* Convert Button */}
          <Button
            onClick={handleConvert}
            disabled={isProcessing}
            className="w-full"
            size="lg"
          >
            {isProcessing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Wand2 className="h-4 w-4 mr-2" />
                Transcribe & Generate Script
              </>
            )}
          </Button>

          {/* Progress */}
          {isProcessing && (
            <div className="space-y-2">
              <Progress value={progress} />
              <p className="text-sm text-muted-foreground text-center">{progressMessage}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Result Section */}
      {result && (
        <Card className={cn(result.success ? "border-green-500/50" : "border-red-500/50")}>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {result.success ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-red-500" />
                )}
                {result.success ? 'Script Generated' : 'Processing Failed'}
              </div>
              {result.success && result.script && (
                <Badge variant="outline">
                  <Clock className="h-3 w-3 mr-1" />
                  {formatDuration(result.script.totalDuration)}
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {result.success && result.script ? (
              <Tabs defaultValue="script" className="space-y-4">
                <TabsList>
                  <TabsTrigger value="script">Script</TabsTrigger>
                  <TabsTrigger value="transcription">Transcription</TabsTrigger>
                </TabsList>

                <TabsContent value="script">
                  <ScrollArea className="h-[300px] rounded-lg border p-4">
                    {result.script.scenes.map((scene, index) => (
                      <div 
                        key={scene.id} 
                        className={cn(
                          "mb-4 pb-4",
                          index < result.script!.scenes.length - 1 && "border-b"
                        )}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">Scene {scene.sceneNumber}</Badge>
                            {scene.speaker && (
                              <Badge variant="secondary">{scene.speaker}</Badge>
                            )}
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {scene.timestamp || `${scene.duration}s`}
                          </span>
                        </div>
                        <p className="text-sm mb-2">{scene.narration}</p>
                        {scene.visualDirection && (
                          <p className="text-xs text-muted-foreground italic">
                            📹 {scene.visualDirection}
                          </p>
                        )}
                      </div>
                    ))}
                  </ScrollArea>
                </TabsContent>

                <TabsContent value="transcription">
                  {result.transcription?.text && (
                    <div className="space-y-3">
                      <ScrollArea className="h-[250px] rounded-lg border p-4">
                        <p className="text-sm whitespace-pre-wrap">{result.transcription.text}</p>
                      </ScrollArea>
                      <Button variant="outline" onClick={copyTranscriptionToClipboard} size="sm">
                        <Copy className="h-4 w-4 mr-2" />
                        Copy Transcription
                      </Button>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            ) : (
              <p className="text-sm text-red-500">{result.error || 'Unknown error occurred'}</p>
            )}

            {result.success && result.script && (
              <>
                {/* Actions */}
                <div className="flex gap-2 mt-4">
                  <Button variant="outline" onClick={copyScriptToClipboard} className="flex-1">
                    <Copy className="h-4 w-4 mr-2" />
                    Copy Script
                  </Button>
                  <Button variant="outline" className="flex-1">
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                  <Button className="flex-1">
                    <Play className="h-4 w-4 mr-2" />
                    Send to Vibe
                  </Button>
                </div>

                {/* Metadata */}
                {result.metadata && (
                  <div className="flex flex-wrap gap-4 text-xs text-muted-foreground pt-4 border-t mt-4">
                    <span>⏱️ {(result.metadata.processingTime / 1000).toFixed(1)}s processing</span>
                    <span>🎵 {formatDuration(result.metadata.audioDuration)} audio</span>
                    <span>🎤 {result.metadata.transcriptionProvider}</span>
                    <span>🤖 {result.metadata.aiProvider}</span>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default AudioToScriptPanel;
