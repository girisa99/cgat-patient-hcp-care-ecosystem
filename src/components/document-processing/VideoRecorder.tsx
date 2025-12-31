import React, { useRef, useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import {
  Video,
  Camera,
  Monitor,
  MonitorPlay,
  Mic,
  MicOff,
  Play,
  Pause,
  Square,
  Upload,
  Download,
  Trash2,
  Image,
  Music,
  FileVideo,
  Headphones,
  Sparkles,
  Loader2,
  RefreshCw,
  Maximize2,
  Minimize2,
  Captions,
  FileText,
  Volume2,
  ExternalLink,
  Eye,
  Scissors,
} from 'lucide-react';
import { useMediaRecorder, RecordingMode } from '@/hooks/useMediaRecorder';
import { useMasterToast } from '@/hooks/useMasterToast';
import { supabase } from '@/integrations/supabase/client';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { TeleprompterPopup } from './TeleprompterPopup';
import { VideoEditor } from './VideoEditor';

interface MediaItem {
  id: string;
  name: string;
  url: string;
  file_type: 'video' | 'audio' | 'image';
  storage_bucket: string;
  storage_path: string;
  duration_seconds?: number;
  source: 'upload' | 'recording' | 'generated';
  created_at: string;
  metadata?: Record<string, unknown>;
}

interface ScriptItem {
  id: string;
  title: string;
  content: string;
}

export const VideoRecorder: React.FC = () => {
  const [activeTab, setActiveTab] = useState('record');
  const [recordingMode, setRecordingMode] = useState<RecordingMode>('webcam');
  const [videoName, setVideoName] = useState('');
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showCaptions, setShowCaptions] = useState(false);
  const [captionText, setCaptionText] = useState('');
  const [selectedAudioFile, setSelectedAudioFile] = useState<MediaItem | null>(null);
  const [selectedScript, setSelectedScript] = useState<ScriptItem | null>(null);
  const [availableScripts, setAvailableScripts] = useState<ScriptItem[]>([]);
  const [isPlayingVoiceover, setIsPlayingVoiceover] = useState(false);
  const [micEnabled, setMicEnabled] = useState(true);
  const [showScriptTeleprompter, setShowScriptTeleprompter] = useState(false);
  const [showAudioTeleprompter, setShowAudioTeleprompter] = useState(false);
  const [editingMedia, setEditingMedia] = useState<MediaItem | null>(null);
  const [previewStream, setPreviewStream] = useState<MediaStream | null>(null);
  
  // Instrumental music generation state
  const [musicPrompt, setMusicPrompt] = useState('');
  const [musicDuration, setMusicDuration] = useState(30);
  const [isGeneratingMusic, setIsGeneratingMusic] = useState(false);
  const [selectedBackgroundMusic, setSelectedBackgroundMusic] = useState<MediaItem | null>(null);
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);
  
  // Countdown state
  const [countdown, setCountdown] = useState<number | null>(null);
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);
  
  const previewRef = useRef<HTMLVideoElement>(null);
  const fullscreenPreviewRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);
  const musicInputRef = useRef<HTMLInputElement>(null);
  const voiceoverAudioRef = useRef<HTMLAudioElement>(null);
  const fullscreenContainerRef = useRef<HTMLDivElement>(null);
  
  const {
    isRecording,
    isPaused,
    duration,
    recordedBlob,
    recordedUrl,
    error,
    isMicEnabled,
    startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording,
    resetRecording,
    toggleMic,
    webcamStream,
    combinedStream,
  } = useMediaRecorder();
  
  const { showSuccess, showError } = useMasterToast();

  // Start camera preview when mode changes (before recording)
  useEffect(() => {
    const startPreview = async () => {
      // Stop existing preview stream
      if (previewStream) {
        previewStream.getTracks().forEach(track => track.stop());
        setPreviewStream(null);
      }
      
      if (isRecording || recordedUrl) return;
      
      setIsPreviewLoading(true);
      
      try {
        if (recordingMode === 'webcam' || recordingMode === 'screen+webcam') {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: { width: 1280, height: 720, facingMode: 'user' },
            audio: false, // No audio for preview
          });
          setPreviewStream(stream);
        }
      } catch (err) {
        console.error('Preview error:', err);
      } finally {
        setIsPreviewLoading(false);
      }
    };
    
    startPreview();
    
    return () => {
      if (previewStream) {
        previewStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [recordingMode, isRecording, recordedUrl]);

  // Show live preview (before recording, during recording, or playback)
  useEffect(() => {
    const videoElement = isFullscreen ? fullscreenPreviewRef.current : previewRef.current;
    if (videoElement) {
      if (isRecording) {
        // During recording - show combined stream
        videoElement.srcObject = combinedStream || webcamStream;
        videoElement.muted = true;
        videoElement.play().catch(console.error);
      } else if (recordedUrl) {
        // After recording - show playback
        videoElement.srcObject = null;
        videoElement.src = recordedUrl;
        videoElement.muted = false;
      } else if (previewStream) {
        // Before recording - show camera preview
        videoElement.srcObject = previewStream;
        videoElement.muted = true;
        videoElement.play().catch(console.error);
      }
    }
  }, [isRecording, webcamStream, combinedStream, recordedUrl, isFullscreen, previewStream]);

  // Load media from database and scripts
  useEffect(() => {
    const loadMedia = async () => {
      setIsLoading(true);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setIsLoading(false);
          return;
        }

        const { data, error } = await supabase
          .from('generated_media')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) throw error;

        const items: MediaItem[] = (data || []).map((item: any) => ({
          id: item.id,
          name: item.name,
          file_type: item.file_type,
          storage_bucket: item.storage_bucket,
          storage_path: item.storage_path,
          url: item.file_url || '',
          duration_seconds: item.duration_seconds,
          source: item.source,
          created_at: item.created_at,
          metadata: item.metadata,
        }));

        // Also check localStorage for legacy generated audios not yet in DB
        const savedAudioMetadata = localStorage.getItem('generatedAudiosMetadata');
        if (savedAudioMetadata) {
          try {
            const legacyAudios = JSON.parse(savedAudioMetadata);
            legacyAudios.forEach((audio: any) => {
              // Check if this audio is already in the DB items (by storage path or name)
              const alreadyExists = items.some(
                item => 
                  (item.storage_path && audio.storagePath && item.storage_path === audio.storagePath) || 
                  (item.name === audio.name && item.file_type === 'audio')
              );
              if (!alreadyExists && audio.audioUrl) {
                items.push({
                  id: audio.id || `legacy-${Date.now()}-${Math.random().toString(36).substring(7)}`,
                  name: audio.name || 'Generated Audio',
                  file_type: 'audio',
                  storage_bucket: 'generated-audio',
                  storage_path: audio.storagePath || '',
                  url: audio.audioUrl,
                  source: 'generated',
                  created_at: audio.generatedAt || new Date().toISOString(),
                  metadata: { voice: audio.voice, scriptText: audio.scriptText },
                });
              }
            });
          } catch (e) {
            console.error('Failed to parse legacy audio metadata:', e);
          }
        }

        // Also check for savedAudios in localStorage (another common pattern)
        const savedAudios = localStorage.getItem('savedAudios');
        if (savedAudios) {
          try {
            const audios = JSON.parse(savedAudios);
            audios.forEach((audio: any) => {
              const alreadyExists = items.some(
                item => item.url === audio.url || (item.name === audio.name && item.file_type === 'audio')
              );
              if (!alreadyExists && (audio.url || audio.audioUrl)) {
                items.push({
                  id: audio.id || `saved-${Date.now()}-${Math.random().toString(36).substring(7)}`,
                  name: audio.name || audio.title || 'Saved Audio',
                  file_type: 'audio',
                  storage_bucket: audio.bucket || 'generated-audio',
                  storage_path: audio.path || '',
                  url: audio.url || audio.audioUrl,
                  source: 'generated',
                  created_at: audio.createdAt || new Date().toISOString(),
                  metadata: audio.metadata || {},
                });
              }
            });
          } catch (e) {
            console.error('Failed to parse saved audios:', e);
          }
        }

        console.log('Loaded media items:', items.length, 'audio files:', items.filter(m => m.file_type === 'audio').length);
        setMediaItems(items);
      } catch (e) {
        console.error('Failed to load media:', e);
      } finally {
        setIsLoading(false);
      }
    };

    loadMedia();

    // Load scripts from multiple sources
    const loadScripts = () => {
      const allScripts: ScriptItem[] = [];
      
      // Always add preset scripts first
      allScripts.push(
        {
          id: 'preset-video',
          title: 'Video Script - Patient Onboarding',
          content: `# AI Document Processing: Enterprise Edition
## Voice-Over Script

Hello everyone! If you watched my previous video on this AI document processing platform, you saw what was possible in less than 64 hours during a single weekend.

Today, I'm excited to share what happened next—the evolution from a weekend prototype to an enterprise-grade solution.

Since that original build, I've made significant enhancements on both the technical architecture and functional sides.

Technical Architecture Enhancements:
- Multi-Model AI Routing System
- Configuration-Driven Architecture
- Two-Stage Pipeline with Provider Abstraction

Let me walk you through the technical transformation.`,
        },
        {
          id: 'preset-audio',
          title: 'Audio Script - Introduction',
          content: `Hello everyone! Good morning, evening, afternoon, or night—wherever you are watching this video!

Today I'm excited to share the evolution of our AI document processing platform from a weekend prototype to an enterprise-grade solution.

Let me walk you through the key improvements we've made.`,
        }
      );
      
      // Source 1: savedScripts (legacy)
      const savedScripts = localStorage.getItem('savedScripts');
      if (savedScripts) {
        try {
          const scripts = JSON.parse(savedScripts);
          scripts.forEach((s: any) => {
            const content = s.content || s.text || '';
            if (content) {
              allScripts.push({
                id: s.id || crypto.randomUUID(),
                title: s.title || 'Untitled Script',
                content,
              });
            }
          });
        } catch (e) {
          console.error('Failed to load savedScripts:', e);
        }
      }
      
      // Source 2: videoScripts from ScriptsManager
      const videoScripts = localStorage.getItem('videoScripts');
      if (videoScripts) {
        try {
          const scripts = JSON.parse(videoScripts);
          scripts.forEach((s: any) => {
            const content = s.content || s.script || '';
            if (content) {
              const isDuplicate = allScripts.some(
                existing => existing.content.substring(0, 100) === content.substring(0, 100)
              );
              if (!isDuplicate) {
                allScripts.push({
                  id: s.id || crypto.randomUUID(),
                  title: s.title || s.name || 'Video Script',
                  content,
                });
              }
            }
          });
        } catch (e) {
          console.error('Failed to load videoScripts:', e);
        }
      }
      
      // Source 3: generatedAudiosMetadata (scripts attached to generated audio)
      const audioMetadata = localStorage.getItem('generatedAudiosMetadata');
      if (audioMetadata) {
        try {
          const audios = JSON.parse(audioMetadata);
          audios.forEach((a: any) => {
            if (a.scriptText) {
              const isDuplicate = allScripts.some(
                s => s.content.substring(0, 100) === a.scriptText.substring(0, 100)
              );
              if (!isDuplicate) {
                allScripts.push({
                  id: `audio-${a.id}`,
                  title: `${a.name} Script`,
                  content: a.scriptText,
                });
              }
            }
          });
        } catch (e) {
          console.error('Failed to load audio scripts:', e);
        }
      }
      
      console.log('Loaded scripts:', allScripts.length);
      setAvailableScripts(allScripts);
    };
    
    loadScripts();
  }, []);

  // Handle fullscreen change
  useEffect(() => {
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement) {
        setIsFullscreen(false);
      }
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStartRecording = async () => {
    // Start 5-second countdown
    setCountdown(5);
    
    countdownIntervalRef.current = setInterval(() => {
      setCountdown(prev => {
        if (prev === null || prev <= 1) {
          // Clear interval and start recording
          if (countdownIntervalRef.current) {
            clearInterval(countdownIntervalRef.current);
            countdownIntervalRef.current = null;
          }
          
          // Actually start recording
          (async () => {
            // Stop preview stream before starting recording
            if (previewStream) {
              previewStream.getTracks().forEach(track => track.stop());
              setPreviewStream(null);
            }
            
            await startRecording(recordingMode, micEnabled);
            // Start voiceover audio if selected
            if (selectedAudioFile && voiceoverAudioRef.current) {
              voiceoverAudioRef.current.play();
              setIsPlayingVoiceover(true);
            }
          })();
          
          return null;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleCancelCountdown = () => {
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }
    setCountdown(null);
  };

  const handleStopRecording = () => {
    stopRecording();
    if (voiceoverAudioRef.current) {
      voiceoverAudioRef.current.pause();
      voiceoverAudioRef.current.currentTime = 0;
      setIsPlayingVoiceover(false);
    }
  };

  const handleToggleFullscreen = async () => {
    if (!isFullscreen) {
      setIsFullscreen(true);
    } else {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      }
      setIsFullscreen(false);
    }
  };

  // Pop out recording to a separate window (completely outside app frame)
  const handlePopOutRecording = async () => {
    const scriptContent = selectedScript?.content || '';
    const scriptTitle = selectedScript?.title || '';
    const audioName = selectedAudioFile?.name || '';
    const audioUrl = selectedAudioFile?.url || '';
    const bgMusicName = selectedBackgroundMusic?.name || '';
    const bgMusicUrl = selectedBackgroundMusic?.url || '';
    
    // Get Supabase URL and API key for TTS calls
    const supabaseUrl = 'https://ithspbabhmdntioslfqe.supabase.co';
    const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml0aHNwYmFiaG1kbnRpb3NsZnFlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY5MjU5OTMsImV4cCI6MjA2MjUwMTk5M30.yUZZHsz2wIHboVuWWfqXeAH5oHRxzJIz20NWSUmHPhw';
    
    // Escape script content for safe HTML embedding
    const escapeHtml = (str: string) => str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;')
      .replace(/\n/g, '<br>');
    
    const escapedScriptContent = escapeHtml(scriptContent);
    
    // Prepare scripts list for dropdown
    const scriptsJson = JSON.stringify(availableScripts.map(s => ({ id: s.id, title: s.title, content: s.content })));
    const voiceoversJson = JSON.stringify(voiceoverFiles.map(a => ({ id: a.id, name: a.name, url: a.url })));
    const musicFilesJson = JSON.stringify(musicFiles.map(m => ({ id: m.id, name: m.name, url: m.url })));
    
    const popoutWindow = window.open('', 'recording-studio', 
      'width=1400,height=900,left=100,top=50,toolbar=no,menubar=no,scrollbars=no,resizable=yes'
    );
    
    if (!popoutWindow) {
      showError('Pop-up blocked. Please allow pop-ups for this site.');
      return;
    }
    
    popoutWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Video Recording Studio</title>
        <style>
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: #0a0a0a;
            color: #fff;
            height: 100vh;
            display: flex;
            flex-direction: column;
          }
          .header {
            background: #1a1a2e;
            padding: 12px 20px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            border-bottom: 1px solid #333;
          }
          .header h1 { font-size: 18px; display: flex; align-items: center; gap: 8px; }
          .header .badge { background: #22c55e; padding: 4px 10px; border-radius: 12px; font-size: 12px; }
          
          /* Options bar */
          .options-bar {
            background: #1a1a2e;
            padding: 12px 20px;
            display: flex;
            flex-wrap: wrap;
            gap: 16px;
            align-items: center;
            border-bottom: 1px solid #333;
          }
          .option-group {
            display: flex;
            flex-direction: column;
            gap: 4px;
          }
          .option-group label {
            font-size: 11px;
            color: #888;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          select {
            background: #2a2a3e;
            border: 1px solid #444;
            color: white;
            padding: 8px 12px;
            border-radius: 6px;
            font-size: 13px;
            min-width: 180px;
            cursor: pointer;
          }
          select:focus { outline: 2px solid #6366f1; outline-offset: 2px; }
          
          .main { flex: 1; display: flex; gap: 10px; padding: 10px; overflow: hidden; }
          .video-section { flex: 2; display: flex; flex-direction: column; gap: 10px; }
          .video-container {
            flex: 1;
            background: #1a1a1a;
            border-radius: 12px;
            overflow: hidden;
            position: relative;
          }
          video { width: 100%; height: 100%; object-fit: contain; }
          .controls {
            display: flex;
            gap: 10px;
            justify-content: center;
            padding: 15px;
            background: #1a1a2e;
            border-radius: 12px;
          }
          button {
            background: #4a4a6a;
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 8px;
            cursor: pointer;
            font-size: 14px;
            display: flex;
            align-items: center;
            gap: 8px;
            transition: all 0.2s;
          }
          button:hover { background: #5a5a7a; }
          button.primary { background: #6366f1; }
          button.primary:hover { background: #4f46e5; }
          button.danger { background: #dc2626; }
          button.danger:hover { background: #b91c1c; }
          button:disabled { opacity: 0.5; cursor: not-allowed; }
          .sidebar { width: 350px; display: flex; flex-direction: column; gap: 10px; overflow-y: auto; }
          .panel {
            background: #1a1a2e;
            border-radius: 12px;
            padding: 15px;
            flex-shrink: 0;
          }
          .panel.teleprompter {
            flex: 1;
            overflow-y: auto;
          }
          .panel h3 { font-size: 14px; margin-bottom: 10px; opacity: 0.8; display: flex; align-items: center; gap: 6px; }
          .script-content {
            font-size: 18px;
            line-height: 2;
            white-space: pre-wrap;
            overflow-y: auto;
          }
          .recording-indicator {
            position: absolute;
            top: 15px;
            left: 15px;
            display: flex;
            align-items: center;
            gap: 8px;
            background: rgba(0,0,0,0.7);
            padding: 8px 12px;
            border-radius: 8px;
          }
          .rec-dot {
            width: 12px;
            height: 12px;
            background: #dc2626;
            border-radius: 50%;
            animation: pulse 1s ease-in-out infinite;
          }
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
          }
          .timer { font-family: monospace; font-size: 16px; }
          input {
            background: #2a2a3e;
            border: 1px solid #444;
            color: white;
            padding: 10px 15px;
            border-radius: 8px;
            font-size: 14px;
            width: 200px;
          }
          .status { padding: 5px 10px; border-radius: 20px; font-size: 12px; }
          .status.ready { background: #22c55e33; color: #22c55e; }
          .status.countdown { background: #f59e0b33; color: #f59e0b; }
          .status.recording { background: #dc262633; color: #dc2626; }
          .audio-info {
            margin-top: 10px;
            padding: 10px;
            background: #2a2a3e;
            border-radius: 8px;
            font-size: 13px;
          }
          
          /* Countdown overlay */
          .countdown-overlay {
            position: absolute;
            inset: 0;
            background: rgba(0,0,0,0.8);
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            z-index: 100;
          }
          .countdown-overlay.hidden { display: none; }
          .countdown-number {
            font-size: 150px;
            font-weight: bold;
            color: white;
            animation: countPulse 1s ease-in-out infinite;
          }
          .countdown-text { font-size: 24px; color: #888; margin-top: 20px; }
          .countdown-cancel { margin-top: 30px; }
          @keyframes countPulse {
            0% { transform: scale(1); opacity: 1; }
            50% { transform: scale(1.1); opacity: 0.8; }
            100% { transform: scale(1); opacity: 1; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
              <line x1="8" y1="21" x2="16" y2="21"></line>
              <line x1="12" y1="17" x2="12" y2="21"></line>
            </svg>
            Video Recording Studio
            <span class="badge">Pop-out Mode</span>
          </h1>
          <div id="status" class="status ready">Ready</div>
        </div>
        
        <!-- Options Bar with Dropdowns -->
        <div class="options-bar">
          <div class="option-group">
            <label>📄 Script</label>
            <select id="scriptSelect">
              <option value="">None</option>
            </select>
          </div>
          <div class="option-group">
            <label>🎤 Voiceover</label>
            <select id="voiceoverSelect">
              <option value="">None</option>
            </select>
          </div>
          <div class="option-group">
            <label>🎵 Background Music</label>
            <select id="musicSelect">
              <option value="">None</option>
            </select>
          </div>
        </div>
        
        <div class="main">
          <div class="video-section">
            <div class="video-container">
              <video id="preview" autoplay playsinline muted></video>
              
              <!-- Countdown Overlay -->
              <div id="countdownOverlay" class="countdown-overlay hidden">
                <div id="countdownNumber" class="countdown-number">5</div>
                <div class="countdown-text">Get ready...</div>
                <button id="cancelCountdown" class="countdown-cancel">Cancel</button>
              </div>
              
              <div id="recIndicator" class="recording-indicator" style="display:none;">
                <div class="rec-dot"></div>
                <span id="timer" class="timer">00:00</span>
              </div>
            </div>
            <div class="controls">
              <button id="startBtn" class="primary">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="10"></circle>
                  <circle cx="12" cy="12" r="3" fill="currentColor"></circle>
                </svg>
                Start Recording
              </button>
              <button id="pauseBtn" style="display:none;">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="6" y="4" width="4" height="16"></rect>
                  <rect x="14" y="4" width="4" height="16"></rect>
                </svg>
                Pause
              </button>
              <button id="stopBtn" class="danger" style="display:none;">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <rect x="4" y="4" width="16" height="16" rx="2"></rect>
                </svg>
                Stop
              </button>
              <input id="videoName" placeholder="Video name..." style="display:none;" />
              <button id="saveBtn" class="primary" style="display:none;">Save</button>
              <button id="resetBtn" style="display:none;">New Recording</button>
            </div>
          </div>
          
          <div class="sidebar">
            <div id="scriptPanel" class="panel teleprompter">
              <h3>📄 Teleprompter</h3>
              <div id="scriptContent" class="script-content">
                ${escapedScriptContent || '<span style="opacity:0.5;">Select a script to display here...</span>'}
              </div>
            </div>
            
            <div id="audioPanel" class="panel" style="${audioUrl ? '' : 'display:none;'}">
              <h3>🎤 Voiceover Audio</h3>
              <div class="audio-info">
                <strong id="voiceoverName">${audioName}</strong><br>
                <small>Will play automatically when recording starts</small>
              </div>
              <audio id="voiceover" src="${audioUrl}" preload="auto"></audio>
            </div>
            
            <div id="musicPanel" class="panel" style="${bgMusicUrl ? '' : 'display:none;'}">
              <h3>🎵 Background Music</h3>
              <div class="audio-info">
                <strong id="bgMusicName">${bgMusicName}</strong>
              </div>
              <audio id="bgMusic" src="${bgMusicUrl}" preload="auto" loop></audio>
            </div>
            
            <div class="panel">
              <h3>⚙️ Info</h3>
              <p style="font-size:13px;opacity:0.8;">
                This window is separate from the main app.<br><br>
                When you share your screen, only this window will be captured - the main app controls won't show.
              </p>
            </div>
          </div>
        </div>

        <script>
          // Data from parent
          const scripts = ${scriptsJson};
          const voiceovers = ${voiceoversJson};
          const musicList = ${musicFilesJson};
          
          let mediaRecorder = null;
          let chunks = [];
          let stream = null;
          let startTime = 0;
          let timerInterval = null;
          let isPaused = false;
          let countdownInterval = null;
          let countdownValue = 5;
          
          const preview = document.getElementById('preview');
          const startBtn = document.getElementById('startBtn');
          const pauseBtn = document.getElementById('pauseBtn');
          const stopBtn = document.getElementById('stopBtn');
          const saveBtn = document.getElementById('saveBtn');
          const resetBtn = document.getElementById('resetBtn');
          const videoNameInput = document.getElementById('videoName');
          const recIndicator = document.getElementById('recIndicator');
          const timer = document.getElementById('timer');
          const status = document.getElementById('status');
          const voiceover = document.getElementById('voiceover');
          const bgMusic = document.getElementById('bgMusic');
          const countdownOverlay = document.getElementById('countdownOverlay');
          const countdownNumber = document.getElementById('countdownNumber');
          const cancelCountdown = document.getElementById('cancelCountdown');
          const scriptSelect = document.getElementById('scriptSelect');
          const voiceoverSelect = document.getElementById('voiceoverSelect');
          const musicSelect = document.getElementById('musicSelect');
          const scriptContent = document.getElementById('scriptContent');
          const audioPanel = document.getElementById('audioPanel');
          const musicPanel = document.getElementById('musicPanel');
          const voiceoverName = document.getElementById('voiceoverName');
          const bgMusicName = document.getElementById('bgMusicName');
          
          // Currently selected script ID
          const selectedScriptId = '${selectedScript?.id || ''}';
          const selectedVoiceoverId = '${selectedAudioFile?.id || ''}';
          const selectedMusicId = '${selectedBackgroundMusic?.id || ''}';
          
          // Populate dropdowns
          scripts.forEach(s => {
            const opt = document.createElement('option');
            opt.value = s.id;
            opt.textContent = s.title;
            if (s.id === selectedScriptId) opt.selected = true;
            scriptSelect.appendChild(opt);
          });
          
          voiceovers.forEach(v => {
            const opt = document.createElement('option');
            opt.value = v.id;
            opt.textContent = v.name;
            if (v.id === selectedVoiceoverId) opt.selected = true;
            voiceoverSelect.appendChild(opt);
          });
          
          musicList.forEach(m => {
            const opt = document.createElement('option');
            opt.value = m.id;
            opt.textContent = m.name;
            if (m.id === selectedMusicId) opt.selected = true;
            musicSelect.appendChild(opt);
          });
          
          // Helper to escape HTML for safe display
          function escapeHtmlContent(str) {
            const div = document.createElement('div');
            div.textContent = str;
            return div.innerHTML.replace(/\\n/g, '<br>');
          }
          
          // Handle dropdown changes
          scriptSelect.onchange = function() {
            const script = scripts.find(s => s.id === this.value);
            if (script) {
              scriptContent.innerHTML = escapeHtmlContent(script.content);
            } else {
              scriptContent.innerHTML = '<span style="opacity:0.5;">Select a script to display here...</span>';
            }
          };
          
          voiceoverSelect.onchange = function() {
            const vo = voiceovers.find(v => v.id === this.value);
            if (vo) {
              voiceover.src = vo.url;
              voiceoverName.textContent = vo.name;
              audioPanel.style.display = 'block';
            } else {
              voiceover.src = '';
              audioPanel.style.display = 'none';
            }
          };
          
          musicSelect.onchange = function() {
            const m = musicList.find(x => x.id === this.value);
            if (m) {
              bgMusic.src = m.url;
              bgMusicName.textContent = m.name;
              musicPanel.style.display = 'block';
            } else {
              bgMusic.src = '';
              musicPanel.style.display = 'none';
            }
          };
          
          // Request camera on load
          async function initCamera() {
            try {
              stream = await navigator.mediaDevices.getUserMedia({
                video: { width: 1280, height: 720 },
                audio: true
              });
              preview.srcObject = stream;
            } catch(e) {
              alert('Camera access needed: ' + e.message);
            }
          }
          
          initCamera();
          
          function formatTime(seconds) {
            const mins = Math.floor(seconds / 60);
            const secs = seconds % 60;
            return mins.toString().padStart(2,'0') + ':' + secs.toString().padStart(2,'0');
          }
          
          let displayStream = null;
          let screenVideo = null;
          let webcamVideo = null;
          let canvas = null;
          let ctx = null;
          let audioContext = null;
          let scrollInterval = null;
          let ttsAudio = null;
          
          // Start recording - First get screen share, then show audio options, then countdown
          startBtn.onclick = async function() {
            try {
              status.textContent = 'Select screen...';
              status.className = 'status countdown';
              
              // Step 1: Get screen share FIRST (before countdown)
              displayStream = await navigator.mediaDevices.getDisplayMedia({
                video: { width: 1920, height: 1080, frameRate: 30 },
                audio: true
              });
              
              // Show screen preview immediately
              preview.srcObject = displayStream;
              
              status.textContent = 'Screen selected';
              
              // Step 2: Show audio options confirmation dialog
              showAudioOptionsDialog();
              
            } catch(e) {
              console.error('Screen share error:', e);
              status.textContent = 'Ready';
              status.className = 'status ready';
              if (e.name !== 'NotAllowedError') {
                alert('Screen share error: ' + e.message);
              }
            }
          };
          
          // Audio options dialog
          function showAudioOptionsDialog() {
            const hasScript = scriptSelect.value && scripts.find(s => s.id === scriptSelect.value);
            const hasVoiceover = voiceoverSelect.value && voiceovers.find(v => v.id === voiceoverSelect.value);
            const hasMusic = musicSelect.value && musicList.find(m => m.id === musicSelect.value);
            
            let dialogHtml = '<div id="audioOptionsDialog" style="position:fixed;inset:0;background:rgba(0,0,0,0.8);display:flex;align-items:center;justify-content:center;z-index:200;">';
            dialogHtml += '<div style="background:#1a1a2e;padding:30px;border-radius:16px;max-width:500px;width:90%;">';
            dialogHtml += '<h2 style="margin-bottom:20px;font-size:20px;">🎬 Recording Options</h2>';
            
            // TTS Option (if script is selected)
            if (hasScript) {
              dialogHtml += '<div style="margin-bottom:20px;padding:15px;background:#2a2a3e;border-radius:8px;">';
              dialogHtml += '<label style="display:flex;align-items:center;gap:10px;cursor:pointer;">';
              dialogHtml += '<input type="checkbox" id="useTTS" checked style="width:20px;height:20px;">';
              dialogHtml += '<div><strong>🗣️ Generate TTS Voiceover</strong><br><small style="opacity:0.7;">Convert script to speech using AI voice</small></div>';
              dialogHtml += '</label></div>';
            }
            
            // Audio file option (if voiceover is selected)
            if (hasVoiceover) {
              dialogHtml += '<div style="margin-bottom:20px;padding:15px;background:#2a2a3e;border-radius:8px;">';
              dialogHtml += '<label style="display:flex;align-items:center;gap:10px;cursor:pointer;">';
              dialogHtml += '<input type="checkbox" id="useVoiceover" checked style="width:20px;height:20px;">';
              dialogHtml += '<div><strong>🎤 Play Voiceover Audio</strong><br><small style="opacity:0.7;">' + voiceovers.find(v => v.id === voiceoverSelect.value)?.name + '</small></div>';
              dialogHtml += '</label></div>';
            }
            
            // Background music option
            if (hasMusic) {
              dialogHtml += '<div style="margin-bottom:20px;padding:15px;background:#2a2a3e;border-radius:8px;">';
              dialogHtml += '<label style="display:flex;align-items:center;gap:10px;cursor:pointer;">';
              dialogHtml += '<input type="checkbox" id="useMusic" checked style="width:20px;height:20px;">';
              dialogHtml += '<div><strong>🎵 Play Background Music</strong><br><small style="opacity:0.7;">' + musicList.find(m => m.id === musicSelect.value)?.name + '</small></div>';
              dialogHtml += '</label></div>';
            }
            
            if (!hasScript && !hasVoiceover && !hasMusic) {
              dialogHtml += '<p style="opacity:0.7;margin-bottom:20px;">No audio sources selected. Recording will use microphone only.</p>';
            }
            
            dialogHtml += '<div style="display:flex;gap:10px;justify-content:flex-end;">';
            dialogHtml += '<button id="cancelOptions" style="padding:12px 24px;">Cancel</button>';
            dialogHtml += '<button id="confirmOptions" class="primary" style="padding:12px 24px;">Start Countdown</button>';
            dialogHtml += '</div></div></div>';
            
            document.body.insertAdjacentHTML('beforeend', dialogHtml);
            
            document.getElementById('cancelOptions').onclick = function() {
              document.getElementById('audioOptionsDialog').remove();
              if (displayStream) {
                displayStream.getTracks().forEach(t => t.stop());
                displayStream = null;
              }
              preview.srcObject = stream;
              status.textContent = 'Ready';
              status.className = 'status ready';
            };
            
            document.getElementById('confirmOptions').onclick = async function() {
              const useTTS = document.getElementById('useTTS')?.checked || false;
              const useVoiceover = document.getElementById('useVoiceover')?.checked || false;
              const useMusic = document.getElementById('useMusic')?.checked || false;
              
              document.getElementById('audioOptionsDialog').remove();
              
              // Generate TTS if requested
              if (useTTS && hasScript) {
                status.textContent = 'Generating TTS...';
                try {
                  await generateTTS(scripts.find(s => s.id === scriptSelect.value).content);
                } catch(e) {
                  console.error('TTS generation failed:', e);
                }
              }
              
              // Start countdown
              startCountdown(useVoiceover, useMusic, useTTS);
            };
          }
          
          // Generate TTS from script
          async function generateTTS(text) {
            const supabaseUrl = '${supabaseUrl}';
            const supabaseKey = '${supabaseKey}';
            
            try {
              const response = await fetch(supabaseUrl + '/functions/v1/elevenlabs-voice', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'apikey': supabaseKey,
                  'Authorization': 'Bearer ' + supabaseKey
                },
                body: JSON.stringify({
                  text: text.substring(0, 5000),
                  voice: 'Aria',
                  model: 'eleven_multilingual_v2',
                  agentType: 'conversational'
                })
              });
              
              if (!response.ok) throw new Error('TTS API failed');
              
              const data = await response.json();
              if (data.audioContent) {
                ttsAudio = new Audio('data:audio/mpeg;base64,' + data.audioContent);
                ttsAudio.volume = 1.0;
              }
            } catch(e) {
              console.error('TTS error:', e);
              // Fallback: try OpenAI TTS
              try {
                const response = await fetch(supabaseUrl + '/functions/v1/openai-tts', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    'apikey': supabaseKey,
                    'Authorization': 'Bearer ' + supabaseKey
                  },
                  body: JSON.stringify({
                    text: text.substring(0, 4000),
                    voice: 'alloy',
                    speed: 1.0
                  })
                });
                
                if (response.ok) {
                  const data = await response.json();
                  if (data.audioContent) {
                    ttsAudio = new Audio('data:audio/mpeg;base64,' + data.audioContent);
                    ttsAudio.volume = 1.0;
                  }
                }
              } catch(e2) {
                console.error('OpenAI TTS fallback failed:', e2);
              }
            }
          }
          
          // Start countdown after screen share is ready
          function startCountdown(useVoiceover, useMusic, useTTS) {
            countdownValue = 5;
            countdownNumber.textContent = countdownValue;
            countdownOverlay.classList.remove('hidden');
            status.textContent = 'Countdown...';
            status.className = 'status countdown';
            
            countdownInterval = setInterval(() => {
              countdownValue--;
              if (countdownValue <= 0) {
                clearInterval(countdownInterval);
                countdownOverlay.classList.add('hidden');
                actuallyStartRecording(useVoiceover, useMusic, useTTS);
              } else {
                countdownNumber.textContent = countdownValue;
              }
            }, 1000);
          }
          
          cancelCountdown.onclick = function() {
            clearInterval(countdownInterval);
            countdownOverlay.classList.add('hidden');
            if (displayStream) {
              displayStream.getTracks().forEach(t => t.stop());
              displayStream = null;
            }
            preview.srcObject = stream;
            status.textContent = 'Ready';
            status.className = 'status ready';
          };
          
          async function actuallyStartRecording(useVoiceover, useMusic, useTTS) {
            try {
              // Create canvas for picture-in-picture (reduces delay)
              canvas = document.createElement('canvas');
              canvas.width = 1920;
              canvas.height = 1080;
              ctx = canvas.getContext('2d');
              
              screenVideo = document.createElement('video');
              screenVideo.srcObject = displayStream;
              screenVideo.muted = true;
              screenVideo.playsInline = true;
              await screenVideo.play();
              
              webcamVideo = document.createElement('video');
              webcamVideo.srcObject = stream;
              webcamVideo.muted = true;
              webcamVideo.playsInline = true;
              await webcamVideo.play();
              
              // Optimized drawing loop for less delay
              let lastDrawTime = 0;
              function draw(timestamp) {
                if (timestamp - lastDrawTime >= 33) { // ~30fps
                  ctx.drawImage(screenVideo, 0, 0, canvas.width, canvas.height);
                  ctx.drawImage(webcamVideo, canvas.width - 340, canvas.height - 260, 320, 240);
                  lastDrawTime = timestamp;
                }
                requestAnimationFrame(draw);
              }
              draw(0);
              
              // Combine audio sources
              audioContext = new AudioContext();
              const dest = audioContext.createMediaStreamDestination();
              
              // Add display audio
              displayStream.getAudioTracks().forEach(track => {
                const src = audioContext.createMediaStreamSource(new MediaStream([track]));
                src.connect(dest);
              });
              
              // Add microphone audio
              stream.getAudioTracks().forEach(track => {
                const src = audioContext.createMediaStreamSource(new MediaStream([track]));
                src.connect(dest);
              });
              
              const canvasStream = canvas.captureStream(30);
              const finalStream = new MediaStream([
                ...canvasStream.getVideoTracks(),
                ...dest.stream.getAudioTracks()
              ]);
              
              preview.srcObject = finalStream;
              
              mediaRecorder = new MediaRecorder(finalStream, { 
                mimeType: 'video/webm;codecs=vp9',
                videoBitsPerSecond: 2500000 
              });
              chunks = [];
              
              mediaRecorder.ondataavailable = (e) => {
                if(e.data.size > 0) chunks.push(e.data);
              };
              
              mediaRecorder.onstop = () => {
                clearInterval(timerInterval);
                clearInterval(scrollInterval);
                const blob = new Blob(chunks, { type: 'video/webm' });
                preview.srcObject = null;
                preview.src = URL.createObjectURL(blob);
                preview.muted = false;
                preview.controls = true;
                
                startBtn.style.display = 'none';
                pauseBtn.style.display = 'none';
                stopBtn.style.display = 'none';
                videoNameInput.style.display = 'block';
                saveBtn.style.display = 'block';
                resetBtn.style.display = 'block';
                recIndicator.style.display = 'none';
                status.textContent = 'Recorded';
                status.className = 'status';
                
                if(voiceover) voiceover.pause();
                if(bgMusic) bgMusic.pause();
                if(ttsAudio) ttsAudio.pause();
                if(displayStream) displayStream.getTracks().forEach(t => t.stop());
              };
              
              mediaRecorder.start(1000);
              startTime = Date.now();
              timerInterval = setInterval(() => {
                timer.textContent = formatTime(Math.floor((Date.now() - startTime) / 1000));
              }, 1000);
              
              startBtn.style.display = 'none';
              pauseBtn.style.display = 'block';
              stopBtn.style.display = 'block';
              recIndicator.style.display = 'flex';
              status.textContent = 'Recording';
              status.className = 'status recording';
              
              // Play TTS if generated
              if (useTTS && ttsAudio) {
                ttsAudio.play().catch(e => console.error('TTS playback error:', e));
              }
              
              // Play voiceover if selected
              if(useVoiceover && voiceover && voiceover.src) {
                voiceover.play().catch(e => console.error('Voiceover error:', e));
              }
              
              // Play background music if selected
              if(useMusic && bgMusic && bgMusic.src) { 
                bgMusic.volume = 0.3; 
                bgMusic.play().catch(e => console.error('Music error:', e));
              }
              
              // Auto-scroll teleprompter
              startTeleprompterScroll();
              
            } catch(e) {
              console.error('Recording error:', e);
              alert('Error: ' + e.message);
              if (displayStream) {
                displayStream.getTracks().forEach(t => t.stop());
                displayStream = null;
              }
              preview.srcObject = stream;
              status.textContent = 'Ready';
              status.className = 'status ready';
            }
          }
          
          // Auto-scroll teleprompter during recording
          function startTeleprompterScroll() {
            const scrollSpeed = 1; // pixels per 50ms
            scrollInterval = setInterval(() => {
              if (!isPaused && scriptContent) {
                scriptContent.scrollTop += scrollSpeed;
              }
            }, 50);
          }
          
          pauseBtn.onclick = function() {
            if(isPaused) {
              mediaRecorder.resume();
              pauseBtn.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg>Pause';
              isPaused = false;
              if(ttsAudio && !ttsAudio.ended) ttsAudio.play();
              if(voiceover && voiceover.src) voiceover.play();
              if(bgMusic && bgMusic.src) bgMusic.play();
            } else {
              mediaRecorder.pause();
              pauseBtn.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>Resume';
              isPaused = true;
              if(ttsAudio) ttsAudio.pause();
              if(voiceover) voiceover.pause();
              if(bgMusic) bgMusic.pause();
            }
          };
          
          stopBtn.onclick = function() {
            mediaRecorder.stop();
            stream.getTracks().forEach(t => t.stop());
          };
          
          saveBtn.onclick = function() {
            const name = videoNameInput.value.trim() || 'recording';
            const blob = new Blob(chunks, { type: 'video/webm' });
            const a = document.createElement('a');
            a.href = URL.createObjectURL(blob);
            a.download = name + '.webm';
            a.click();
            alert('Video downloaded! Close this window to return to the app.');
          };
          
          resetBtn.onclick = function() {
            location.reload();
          };
        </script>
      </body>
      </html>
    `);
    popoutWindow.document.close();
    showSuccess('Recording studio opened in separate window');
  };

  const handleSaveRecording = async () => {
    if (!recordedBlob || !videoName.trim()) {
      showError('Please enter a name for the recording');
      return;
    }

    setIsSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        showError('Please log in to save recordings');
        return;
      }

      // Upload to Supabase storage
      const fileName = `${Date.now()}_${videoName.replace(/[^a-zA-Z0-9]/g, '_')}.webm`;
      const { data, error: uploadError } = await supabase.storage
        .from('generated-videos')
        .upload(fileName, recordedBlob, {
          contentType: 'video/webm',
          upsert: false,
        });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from('generated-videos')
        .getPublicUrl(data.path);

      // Save to database
      const { data: dbData, error: dbError } = await supabase
        .from('generated_media')
        .insert({
          user_id: user.id,
          name: videoName,
          file_type: 'video',
          storage_bucket: 'generated-videos',
          storage_path: data.path,
          file_url: urlData.publicUrl,
          duration_seconds: duration,
          source: 'recording',
          metadata: { mode: recordingMode },
        })
        .select()
        .single();

      if (dbError) throw dbError;

      const newMedia: MediaItem = {
        id: dbData.id,
        name: videoName,
        url: urlData.publicUrl,
        file_type: 'video',
        storage_bucket: 'generated-videos',
        storage_path: data.path,
        duration_seconds: duration,
        source: 'recording',
        created_at: dbData.created_at,
        metadata: { mode: recordingMode },
      };

      setMediaItems(prev => [newMedia, ...prev]);
      showSuccess('Recording saved successfully');
      resetRecording();
      setVideoName('');
      setActiveTab('library');
    } catch (err) {
      console.error('Save error:', err);
      showError('Failed to save recording');
    } finally {
      setIsSaving(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length) return;

    setIsUploading(true);
    try {
      for (const file of Array.from(files)) {
        const type = file.type.startsWith('video/') 
          ? 'video' 
          : file.type.startsWith('audio/') 
            ? 'audio' 
            : file.type.startsWith('image/') 
              ? 'image' 
              : null;

        if (!type) {
          showError(`Unsupported file type: ${file.name}`);
          continue;
        }

        const bucket = type === 'video' ? 'generated-videos' : type === 'audio' ? 'generated-audio' : 'generated-media';
        const fileName = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;
        
        const { data, error: uploadError } = await supabase.storage
          .from(bucket)
          .upload(fileName, file, {
            contentType: file.type,
            upsert: false,
          });

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
          .from(bucket)
          .getPublicUrl(data.path);

        // Get user and save to database
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: dbData, error: dbError } = await supabase
            .from('generated_media')
            .insert({
              user_id: user.id,
              name: file.name,
              file_type: type,
              storage_bucket: bucket,
              storage_path: data.path,
              file_url: urlData.publicUrl,
              file_size_bytes: file.size,
              source: 'upload',
            })
            .select()
            .single();

          if (!dbError && dbData) {
            const newMedia: MediaItem = {
              id: dbData.id,
              name: file.name,
              url: urlData.publicUrl,
              file_type: type,
              storage_bucket: bucket,
              storage_path: data.path,
              source: 'upload',
              created_at: dbData.created_at,
            };
            setMediaItems(prev => [newMedia, ...prev]);
          }
        }
      }
      showSuccess('Files uploaded successfully');
    } catch (err) {
      console.error('Upload error:', err);
      showError('Failed to upload files');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Upload instrumental music files
  const handleMusicUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length) return;

    setIsUploading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      for (const file of Array.from(files)) {
        if (!file.type.startsWith('audio/')) {
          showError(`Only audio files allowed: ${file.name}`);
          continue;
        }

        const bucket = 'generated-audio';
        const fileName = `music_${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;
        
        const { data, error: uploadError } = await supabase.storage
          .from(bucket)
          .upload(fileName, file, {
            contentType: file.type,
            upsert: false,
          });

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
          .from(bucket)
          .getPublicUrl(data.path);

        const { data: dbData, error: dbError } = await supabase
          .from('generated_media')
          .insert({
            user_id: user.id,
            name: `🎵 ${file.name}`,
            file_type: 'audio',
            storage_bucket: bucket,
            storage_path: data.path,
            file_url: urlData.publicUrl,
            file_size_bytes: file.size,
            source: 'upload',
            metadata: { type: 'instrumental', uploadedAs: 'background_music' }
          })
          .select()
          .single();

        if (!dbError && dbData) {
          const newMedia: MediaItem = {
            id: dbData.id,
            name: `🎵 ${file.name}`,
            url: urlData.publicUrl,
            file_type: 'audio',
            storage_bucket: bucket,
            storage_path: data.path,
            source: 'upload',
            created_at: dbData.created_at,
            metadata: { type: 'instrumental' }
          };
          setMediaItems(prev => [newMedia, ...prev]);
        }
      }
      showSuccess('Music files uploaded successfully!');
    } catch (err) {
      console.error('Music upload error:', err);
      showError('Failed to upload music files');
    } finally {
      setIsUploading(false);
      if (musicInputRef.current) {
        musicInputRef.current.value = '';
      }
    }
  };

  const handleDownload = async (media: MediaItem) => {
    try {
      const response = await fetch(media.url);
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      
      const ext = media.file_type === 'video' ? 'webm' : media.file_type === 'audio' ? 'mp3' : 'png';
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = `${media.name.replace(/[^a-zA-Z0-9]/g, '_')}.${ext}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(blobUrl);
      showSuccess('File downloaded');
    } catch (err) {
      console.error('Download error:', err);
      showError('Failed to download file');
    }
  };

  const handleDeleteMedia = async (id: string) => {
    const media = mediaItems.find(m => m.id === id);
    if (!media) return;

    try {
      // Delete from storage
      await supabase.storage.from(media.storage_bucket).remove([media.storage_path]);
      
      // Delete from database
      await supabase.from('generated_media').delete().eq('id', id);
      
      setMediaItems(prev => prev.filter(m => m.id !== id));
      showSuccess('Media deleted');
    } catch (err) {
      console.error('Delete error:', err);
      showError('Failed to delete media');
    }
  };

  const handleSelectAudioFile = (mediaId: string) => {
    const audio = mediaItems.find(m => m.id === mediaId && m.file_type === 'audio');
    setSelectedAudioFile(audio || null);
    if (audio) {
      showSuccess(`Selected "${audio.name}" as voiceover`);
    }
  };

  const handleSelectScript = (scriptId: string) => {
    const script = availableScripts.find(s => s.id === scriptId);
    setSelectedScript(script || null);
    if (script) {
      setCaptionText(script.content);
      setShowCaptions(true);
      showSuccess(`Loaded script: "${script.title}"`);
    }
  };

  const getModeIcon = (mode: string) => {
    switch (mode) {
      case 'webcam': return <Camera className="h-4 w-4" />;
      case 'screen': return <Monitor className="h-4 w-4" />;
      case 'screen+webcam': return <MonitorPlay className="h-4 w-4" />;
      default: return <Video className="h-4 w-4" />;
    }
  };

  const getMediaIcon = (type: 'video' | 'audio' | 'image') => {
    switch (type) {
      case 'video': return <FileVideo className="h-4 w-4" />;
      case 'audio': return <Music className="h-4 w-4" />;
      case 'image': return <Image className="h-4 w-4" />;
    }
  };

  const audioFiles = mediaItems.filter(m => m.file_type === 'audio');
  const musicFiles = audioFiles.filter(m => m.metadata?.type === 'instrumental' || m.name.toLowerCase().includes('music') || m.name.toLowerCase().includes('instrument'));
  const voiceoverFiles = audioFiles.filter(m => !musicFiles.includes(m));
  const videoFiles = mediaItems.filter(m => m.file_type === 'video');
  const recordings = mediaItems.filter(m => m.source === 'recording');
  const uploads = mediaItems.filter(m => m.source === 'upload');

  // Generate instrumental music using ElevenLabs
  const handleGenerateMusic = async () => {
    if (!musicPrompt.trim()) {
      showError('Please enter a music description');
      return;
    }

    setIsGeneratingMusic(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      console.log('🎵 Generating instrumental music:', musicPrompt);
      
      const { data, error } = await supabase.functions.invoke('elevenlabs-music', {
        body: { prompt: musicPrompt, duration: musicDuration }
      });

      if (error) throw error;
      if (!data?.audioContent) throw new Error('No audio content returned');

      // Convert base64 to blob
      const audioUrl = `data:audio/mpeg;base64,${data.audioContent}`;
      
      // Create blob from data URL for storage
      const response = await fetch(audioUrl);
      const audioBlob = await response.blob();
      
      // Upload to storage
      const fileName = `instrumental_${Date.now()}.mp3`;
      const storagePath = `${user.id}/${fileName}`;
      
      const { error: uploadError } = await supabase.storage
        .from('generated-audio')
        .upload(storagePath, audioBlob, {
          contentType: 'audio/mpeg',
          upsert: false,
        });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from('generated-audio')
        .getPublicUrl(storagePath);

      // Save to database
      const { data: dbData, error: dbError } = await supabase
        .from('generated_media')
        .insert({
          user_id: user.id,
          name: `🎵 ${musicPrompt.substring(0, 50)}${musicPrompt.length > 50 ? '...' : ''}`,
          file_type: 'audio',
          storage_bucket: 'generated-audio',
          storage_path: storagePath,
          file_url: urlData.publicUrl,
          source: 'generated',
          duration_seconds: musicDuration,
          metadata: { type: 'instrumental', prompt: musicPrompt, duration: musicDuration }
        })
        .select()
        .single();

      if (dbError) throw dbError;

      // Add to local state
      const newItem: MediaItem = {
        id: dbData.id,
        name: dbData.name,
        file_type: 'audio',
        storage_bucket: 'generated-audio',
        storage_path: storagePath,
        url: urlData.publicUrl,
        source: 'generated',
        duration_seconds: musicDuration,
        created_at: new Date().toISOString(),
        metadata: { type: 'instrumental', prompt: musicPrompt }
      };

      setMediaItems(prev => [newItem, ...prev]);
      setMusicPrompt('');
      showSuccess(`Instrumental music "${musicPrompt.substring(0, 30)}..." generated!`);
    } catch (error: any) {
      console.error('Music generation error:', error);
      showError(error.message || 'Failed to generate music');
    } finally {
      setIsGeneratingMusic(false);
    }
  };

  const VideoPreview = ({ className = '', videoRef }: { className?: string; videoRef: React.RefObject<HTMLVideoElement> }) => (
    <div className={`relative aspect-video bg-muted rounded-lg overflow-hidden ${className}`}>
      <video
        ref={videoRef}
        className="w-full h-full object-contain"
        playsInline
        controls={!!recordedUrl && !isRecording}
      />
      {/* Countdown overlay */}
      {countdown !== null && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/70 z-20">
          <div className="text-center">
            <div className="text-8xl font-bold text-white animate-pulse mb-4">
              {countdown}
            </div>
            <p className="text-white text-lg mb-4">Get ready...</p>
            <Button 
              variant="outline" 
              onClick={handleCancelCountdown}
              className="bg-background/20 border-white text-white hover:bg-white/20"
            >
              Cancel
            </Button>
          </div>
        </div>
      )}
      {/* Show placeholder only when no preview stream available */}
      {!isRecording && !recordedUrl && !previewStream && !isPreviewLoading && recordingMode === 'screen' && countdown === null && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-muted-foreground">
            <Monitor className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>Screen preview available after starting</p>
          </div>
        </div>
      )}
      {/* Loading state */}
      {isPreviewLoading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-muted-foreground">
            <Loader2 className="h-8 w-8 mx-auto mb-2 animate-spin" />
            <p>Starting live preview...</p>
          </div>
        </div>
      )}
      {/* Camera preview ready indicator */}
      {!isRecording && !recordedUrl && previewStream && countdown === null && (
        <div className="absolute top-4 left-4 bg-green-500/80 text-white px-2 py-1 rounded flex items-center gap-1">
          <Camera className="h-3 w-3" />
          <span className="text-xs">Camera Ready</span>
        </div>
      )}
      {isRecording && (
        <div className="absolute top-4 left-4 flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${isPaused ? 'bg-yellow-500' : 'bg-red-500 animate-pulse'}`} />
          <span className="text-sm font-mono bg-background/80 px-2 py-1 rounded">
            {formatDuration(duration)}
          </span>
        </div>
      )}
      {/* Captions overlay */}
      {showCaptions && captionText && (
        <div className="absolute bottom-16 left-4 right-4">
          <div className="bg-black/70 text-white text-center py-2 px-4 rounded-lg">
            <p className="text-sm leading-relaxed whitespace-pre-wrap max-h-24 overflow-y-auto">
              {captionText}
            </p>
          </div>
        </div>
      )}
      {/* Voiceover indicator */}
      {isPlayingVoiceover && (
        <div className="absolute top-4 right-4 bg-primary/80 text-primary-foreground px-2 py-1 rounded flex items-center gap-1">
          <Volume2 className="h-3 w-3" />
          <span className="text-xs">Voiceover</span>
        </div>
      )}
    </div>
  );

  return (
    <>
      <Card className="border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <Video className="h-5 w-5 text-primary" />
            Video Studio
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3 mb-4">
              <TabsTrigger value="record" className="flex items-center gap-2">
                <Camera className="h-4 w-4" />
                Record
              </TabsTrigger>
              <TabsTrigger value="upload" className="flex items-center gap-2">
                <Upload className="h-4 w-4" />
                Upload
              </TabsTrigger>
              <TabsTrigger value="library" className="flex items-center gap-2">
                <FileVideo className="h-4 w-4" />
                Library ({mediaItems.length})
              </TabsTrigger>
            </TabsList>

            {/* Record Tab */}
            <TabsContent value="record" className="space-y-4">
              {/* Recording Mode Selector */}
              <div className="space-y-2">
                <Label>Recording Mode</Label>
                <div className="flex gap-2">
                  <Button
                    variant={recordingMode === 'webcam' ? 'default' : 'outline'}
                    onClick={() => setRecordingMode('webcam')}
                    disabled={isRecording}
                    className="flex-1"
                  >
                    <Camera className="h-4 w-4 mr-2" />
                    Webcam
                  </Button>
                  <Button
                    variant={recordingMode === 'screen' ? 'default' : 'outline'}
                    onClick={() => setRecordingMode('screen')}
                    disabled={isRecording}
                    className="flex-1"
                  >
                    <Monitor className="h-4 w-4 mr-2" />
                    Screen
                  </Button>
                  <Button
                    variant={recordingMode === 'screen+webcam' ? 'default' : 'outline'}
                    onClick={() => setRecordingMode('screen+webcam')}
                    disabled={isRecording}
                    className="flex-1"
                  >
                    <MonitorPlay className="h-4 w-4 mr-2" />
                    Screen + Webcam
                  </Button>
                </div>
              </div>

              {/* Audio & Script Options */}
              <div className="grid grid-cols-2 gap-4">
                {/* Mic Toggle */}
                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-2">
                    {micEnabled ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
                    <Label>Enable Microphone</Label>
                  </div>
                  <Switch
                    checked={micEnabled}
                    onCheckedChange={setMicEnabled}
                    disabled={isRecording}
                  />
                </div>

                {/* Captions Toggle */}
                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Captions className="h-4 w-4" />
                    <Label>Show Captions</Label>
                  </div>
                  <Switch
                    checked={showCaptions}
                    onCheckedChange={setShowCaptions}
                  />
                </div>
              </div>

              {/* Voiceover & Script Selection */}
              <div className="grid grid-cols-2 gap-4">
                {/* Audio File Selection */}
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Music className="h-4 w-4" />
                    Voiceover Audio
                  </Label>
                  <Select
                    value={selectedAudioFile?.id || 'none'}
                    onValueChange={(val) => handleSelectAudioFile(val === 'none' ? '' : val)}
                    disabled={isRecording}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select audio file..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      {voiceoverFiles.map(audio => (
                        <SelectItem key={audio.id} value={audio.id}>
                          {audio.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Script Selection */}
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Script for Captions
                  </Label>
                  <Select
                    value={selectedScript?.id || 'none'}
                    onValueChange={(val) => handleSelectScript(val === 'none' ? '' : val)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select script..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      {availableScripts.map(script => (
                        <SelectItem key={script.id} value={script.id}>
                          {script.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Background Instrumental Music */}
              <div className="space-y-3 p-3 bg-gradient-to-r from-primary/5 to-primary/10 rounded-lg border border-primary/20">
                <div className="flex items-center justify-between">
                  <Label className="flex items-center gap-2">
                    <Headphones className="h-4 w-4 text-primary" />
                    Background Instrumental Music
                  </Label>
                  <Badge variant="outline" className="text-xs">AI Generated</Badge>
                </div>
                
                {/* Music Selection */}
                <Select
                  value={selectedBackgroundMusic?.id || 'none'}
                  onValueChange={(val) => {
                    if (val === 'none') {
                      setSelectedBackgroundMusic(null);
                    } else {
                      const music = musicFiles.find(m => m.id === val);
                      setSelectedBackgroundMusic(music || null);
                    }
                  }}
                  disabled={isRecording}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select background music..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    {musicFiles.map(music => (
                      <SelectItem key={music.id} value={music.id}>
                        {music.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Generate New Music */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium">Generate New Instrumental</span>
                  </div>
                  <div className="flex gap-2">
                    <Input
                      placeholder="e.g., Upbeat corporate background, relaxing piano..."
                      value={musicPrompt}
                      onChange={(e) => setMusicPrompt(e.target.value)}
                      disabled={isGeneratingMusic}
                      className="flex-1"
                    />
                    <Select
                      value={musicDuration.toString()}
                      onValueChange={(val) => setMusicDuration(parseInt(val))}
                      disabled={isGeneratingMusic}
                    >
                      <SelectTrigger className="w-24">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="15">15s</SelectItem>
                        <SelectItem value="30">30s</SelectItem>
                        <SelectItem value="60">1 min</SelectItem>
                        <SelectItem value="90">1.5 min</SelectItem>
                        <SelectItem value="120">2 min</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button
                      onClick={handleGenerateMusic}
                      disabled={isGeneratingMusic || !musicPrompt.trim()}
                      size="sm"
                    >
                      {isGeneratingMusic ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Sparkles className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Describe the style: genre, mood, instruments, tempo
                  </p>
                  
                  {/* Upload music divider */}
                  <div className="flex items-center gap-2 pt-2 mt-2 border-t border-border/50">
                    <span className="text-xs text-muted-foreground">Or upload your own:</span>
                    <input
                      ref={musicInputRef}
                      type="file"
                      accept="audio/*"
                      multiple
                      onChange={handleMusicUpload}
                      className="hidden"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => musicInputRef.current?.click()}
                      disabled={isUploading}
                      className="gap-1"
                    >
                      {isUploading ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        <Upload className="h-3 w-3" />
                      )}
                      Upload Music
                    </Button>
                  </div>
                </div>
              </div>

              {/* Teleprompter Controls */}
              {(selectedScript || selectedAudioFile) && (
                <div className="flex flex-wrap gap-2 p-3 bg-muted/50 rounded-lg">
                  <Label className="flex items-center gap-2 text-sm mr-2">
                    <Eye className="h-4 w-4" />
                    Teleprompter:
                  </Label>
                  {selectedScript && (
                    <Button
                      variant={showScriptTeleprompter ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setShowScriptTeleprompter(!showScriptTeleprompter)}
                      className="gap-2"
                    >
                      <FileText className="h-4 w-4" />
                      Script
                      {showScriptTeleprompter && <Badge variant="secondary" className="ml-1">Open</Badge>}
                    </Button>
                  )}
                  {selectedAudioFile && (
                    <Button
                      variant={showAudioTeleprompter ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setShowAudioTeleprompter(!showAudioTeleprompter)}
                      className="gap-2"
                    >
                      <Volume2 className="h-4 w-4" />
                      Audio Cue
                      {showAudioTeleprompter && <Badge variant="secondary" className="ml-1">Open</Badge>}
                    </Button>
                  )}
                  <span className="text-xs text-muted-foreground ml-auto flex items-center gap-1">
                    <ExternalLink className="h-3 w-3" />
                    Click popup icon to open in separate window
                  </span>
                </div>
              )}

              {/* Custom Caption Input */}
              {showCaptions && !selectedScript && (
                <div className="space-y-2">
                  <Label>Custom Caption Text</Label>
                  <Input
                    placeholder="Enter caption text to display..."
                    value={captionText}
                    onChange={(e) => setCaptionText(e.target.value)}
                  />
                </div>
              )}

              {/* Preview */}
              <div className="relative">
                <VideoPreview videoRef={previewRef} />
                <div className="absolute top-2 right-2 flex gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    className="bg-background/80"
                    onClick={handlePopOutRecording}
                    title="Pop out to separate window (for cleaner screen recording)"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="bg-background/80"
                    onClick={handleToggleFullscreen}
                    title="Fullscreen in app"
                  >
                    <Maximize2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {error && (
                <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-lg">
                  {error}
                </div>
              )}

              {/* Hidden audio element for voiceover */}
              {selectedAudioFile && (
                <audio ref={voiceoverAudioRef} src={selectedAudioFile.url} preload="auto" />
              )}

              {/* Controls */}
              <div className="flex items-center gap-2">
                {!isRecording && !recordedUrl && countdown === null && (
                  <Button onClick={handleStartRecording} className="flex-1">
                    <Camera className="h-4 w-4 mr-2" />
                    Start Recording
                  </Button>
                )}

                {countdown !== null && !isRecording && (
                  <Button variant="outline" onClick={handleCancelCountdown} className="flex-1">
                    Cancel Countdown ({countdown}s)
                  </Button>
                )}
                
                {isRecording && (
                  <>
                    <Button
                      variant="outline"
                      onClick={toggleMic}
                    >
                      {isMicEnabled ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
                    </Button>
                    <Button
                      variant={isPaused ? 'default' : 'outline'}
                      onClick={isPaused ? resumeRecording : pauseRecording}
                    >
                      {isPaused ? <Play className="h-4 w-4 mr-2" /> : <Pause className="h-4 w-4 mr-2" />}
                      {isPaused ? 'Resume' : 'Pause'}
                    </Button>
                    <Button variant="destructive" onClick={handleStopRecording}>
                      <Square className="h-4 w-4 mr-2" />
                      Stop
                    </Button>
                  </>
                )}
                
                {recordedUrl && !isRecording && (
                  <>
                    <Input
                      placeholder="Video name..."
                      value={videoName}
                      onChange={(e) => setVideoName(e.target.value)}
                      className="flex-1"
                    />
                    <Button onClick={handleSaveRecording} disabled={isSaving || !videoName.trim()}>
                      {isSaving ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Download className="h-4 w-4 mr-2" />
                      )}
                      Save
                    </Button>
                    <Button variant="outline" onClick={resetRecording}>
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Reset
                    </Button>
                  </>
                )}
              </div>
            </TabsContent>

            {/* Upload Tab */}
            <TabsContent value="upload" className="space-y-4">
              <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="video/*,audio/*,image/*"
                  multiple
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="font-medium mb-2">Upload Media Files</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Videos, audio files, and images
                </p>
                <Button onClick={() => fileInputRef.current?.click()} disabled={isUploading}>
                  {isUploading ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Upload className="h-4 w-4 mr-2" />
                  )}
                  Select Files
                </Button>
              </div>

              {uploads.length > 0 && (
                <div className="space-y-2">
                  <Label>Recently Uploaded</Label>
                  <ScrollArea className="h-[200px]">
                    <div className="space-y-2">
                      {uploads.slice(0, 5).map((media) => (
                        <div
                          key={media.id}
                          className="flex items-center gap-3 p-3 rounded-lg bg-muted/50"
                        >
                          {getMediaIcon(media.file_type)}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{media.name}</p>
                            <p className="text-xs text-muted-foreground capitalize">{media.file_type}</p>
                          </div>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDeleteMedia(media.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              )}
            </TabsContent>

            {/* Library Tab */}
            <TabsContent value="library" className="space-y-4">
              {editingMedia ? (
                <VideoEditor
                  videoUrl={editingMedia.url}
                  videoName={editingMedia.name}
                  videoId={editingMedia.id}
                  availableAudioFiles={audioFiles.map(a => ({
                    id: a.id,
                    name: a.name,
                    url: a.url,
                  }))}
                  onClose={() => setEditingMedia(null)}
                  onSave={(blob, transcript, audioSettings) => {
                    console.log('Video saved:', {
                      transcript: transcript.substring(0, 100),
                      audioSettings,
                    });
                    setEditingMedia(null);
                    showSuccess(audioSettings 
                      ? `Video saved with ${audioSettings.mixMode} voiceover!` 
                      : 'Video saved with updated script'
                    );
                  }}
                />
              ) : (
                <ScrollArea className="h-[400px]">
                  {mediaItems.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <FileVideo className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      <p>No recordings or uploads yet</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {/* All Media Items */}
                      {mediaItems.map((media) => (
                        <div
                          key={media.id}
                          className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                        >
                          {media.source === 'recording' && media.metadata?.mode 
                            ? getModeIcon(media.metadata.mode as string) 
                            : getMediaIcon(media.file_type)}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{media.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {media.duration_seconds ? `${formatDuration(media.duration_seconds)} • ` : ''}
                              {media.source === 'recording' ? 'Recording' : 'Upload'} • 
                              {new Date(media.created_at).toLocaleDateString()}
                            </p>
                          </div>
                          {/* Edit button for videos only */}
                          {media.file_type === 'video' && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => setEditingMedia(media)}
                              title="Edit video (trim, transcribe)"
                            >
                              <Scissors className="h-4 w-4" />
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDownload(media)}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDeleteMedia(media.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Fullscreen Dialog */}
      <Dialog open={isFullscreen} onOpenChange={setIsFullscreen}>
        <DialogContent className="max-w-[95vw] max-h-[95vh] w-full h-full p-4" ref={fullscreenContainerRef}>
          <DialogHeader className="pb-2">
            <DialogTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Video className="h-5 w-5 text-primary" />
                Video Recording - Fullscreen
              </span>
              <Button variant="ghost" size="sm" onClick={() => setIsFullscreen(false)}>
                <Minimize2 className="h-4 w-4" />
              </Button>
            </DialogTitle>
          </DialogHeader>
          
          <div className="flex-1 flex flex-col gap-4">
            {/* Fullscreen Options Bar */}
            <div className="flex flex-wrap items-center gap-4 p-3 bg-muted/50 rounded-lg">
              {/* Voiceover Audio Selection */}
              <div className="flex flex-col gap-1">
                <Label className="text-xs text-muted-foreground flex items-center gap-1">
                  <Music className="h-3 w-3" />
                  Voiceover
                </Label>
                <Select
                  value={selectedAudioFile?.id || 'none'}
                  onValueChange={(val) => handleSelectAudioFile(val === 'none' ? '' : val)}
                  disabled={isRecording || countdown !== null}
                >
                  <SelectTrigger className="w-[180px] bg-background">
                    <SelectValue placeholder="Select audio..." />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border border-border shadow-lg z-[100]">
                    <SelectItem value="none">None</SelectItem>
                    {voiceoverFiles.map(audio => (
                      <SelectItem key={audio.id} value={audio.id}>
                        {audio.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Script Selection */}
              <div className="flex flex-col gap-1">
                <Label className="text-xs text-muted-foreground flex items-center gap-1">
                  <FileText className="h-3 w-3" />
                  Script
                </Label>
                <Select
                  value={selectedScript?.id || 'none'}
                  onValueChange={(val) => handleSelectScript(val === 'none' ? '' : val)}
                >
                  <SelectTrigger className="w-[180px] bg-background">
                    <SelectValue placeholder="Select script..." />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border border-border shadow-lg z-[100]">
                    <SelectItem value="none">None</SelectItem>
                    {availableScripts.map(script => (
                      <SelectItem key={script.id} value={script.id}>
                        {script.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Background Music Selection */}
              <div className="flex flex-col gap-1">
                <Label className="text-xs text-muted-foreground flex items-center gap-1">
                  <Headphones className="h-3 w-3" />
                  Background Music
                </Label>
                <Select
                  value={selectedBackgroundMusic?.id || 'none'}
                  onValueChange={(val) => {
                    if (val === 'none') {
                      setSelectedBackgroundMusic(null);
                    } else {
                      const music = musicFiles.find(m => m.id === val);
                      setSelectedBackgroundMusic(music || null);
                    }
                  }}
                  disabled={isRecording || countdown !== null}
                >
                  <SelectTrigger className="w-[180px] bg-background">
                    <SelectValue placeholder="Select music..." />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border border-border shadow-lg z-[100]">
                    <SelectItem value="none">None</SelectItem>
                    {musicFiles.map(music => (
                      <SelectItem key={music.id} value={music.id}>
                        {music.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Teleprompter Buttons */}
              {(selectedScript || selectedAudioFile) && (
                <div className="flex items-center gap-2 ml-auto">
                  <Eye className="h-4 w-4 text-muted-foreground" />
                  {selectedScript && (
                    <Button
                      variant={showScriptTeleprompter ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setShowScriptTeleprompter(!showScriptTeleprompter)}
                    >
                      <FileText className="h-4 w-4 mr-1" />
                      Script
                    </Button>
                  )}
                  {selectedAudioFile && (
                    <Button
                      variant={showAudioTeleprompter ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setShowAudioTeleprompter(!showAudioTeleprompter)}
                    >
                      <Volume2 className="h-4 w-4 mr-1" />
                      Audio Cue
                    </Button>
                  )}
                </div>
              )}

              {/* Captions Toggle */}
              <div className="flex items-center gap-2">
                <Captions className="h-4 w-4" />
                <Switch
                  checked={showCaptions}
                  onCheckedChange={setShowCaptions}
                />
              </div>
            </div>

            <VideoPreview className="flex-1 min-h-[50vh]" videoRef={fullscreenPreviewRef} />
            
            {/* Fullscreen Controls */}
            <div className="flex items-center justify-center gap-4">
              {!isRecording && !recordedUrl && countdown === null && (
                <Button onClick={handleStartRecording} size="lg">
                  <Camera className="h-5 w-5 mr-2" />
                  Start Recording
                </Button>
              )}

              {countdown !== null && !isRecording && (
                <Button variant="outline" size="lg" onClick={handleCancelCountdown}>
                  Cancel Countdown ({countdown}s)
                </Button>
              )}
              
              {isRecording && (
                <>
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={toggleMic}
                  >
                    {isMicEnabled ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
                  </Button>
                  <Button
                    variant={isPaused ? 'default' : 'outline'}
                    size="lg"
                    onClick={isPaused ? resumeRecording : pauseRecording}
                  >
                    {isPaused ? <Play className="h-5 w-5 mr-2" /> : <Pause className="h-5 w-5 mr-2" />}
                    {isPaused ? 'Resume' : 'Pause'}
                  </Button>
                  <Button variant="destructive" size="lg" onClick={handleStopRecording}>
                    <Square className="h-5 w-5 mr-2" />
                    Stop
                  </Button>
                </>
              )}
              
              {recordedUrl && !isRecording && (
                <>
                  <Input
                    placeholder="Video name..."
                    value={videoName}
                    onChange={(e) => setVideoName(e.target.value)}
                    className="max-w-xs"
                  />
                  <Button size="lg" onClick={handleSaveRecording} disabled={isSaving || !videoName.trim()}>
                    {isSaving ? (
                      <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    ) : (
                      <Download className="h-5 w-5 mr-2" />
                    )}
                    Save
                  </Button>
                  <Button variant="outline" size="lg" onClick={resetRecording}>
                    <RefreshCw className="h-5 w-5 mr-2" />
                    Reset
                  </Button>
                </>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Script Teleprompter Popup */}
      {selectedScript && (
        <TeleprompterPopup
          title={selectedScript.title}
          content={selectedScript.content}
          type="script"
          isOpen={showScriptTeleprompter}
          onClose={() => setShowScriptTeleprompter(false)}
          isRecording={isRecording}
        />
      )}

      {/* Audio Cue Teleprompter Popup */}
      {selectedAudioFile && (
        <TeleprompterPopup
          title={`Audio: ${selectedAudioFile.name}`}
          content={`Playing voiceover audio:\n\n${selectedAudioFile.name}\n\nThis audio will play automatically when you start recording.\n\nFollow along with your script and let the audio guide your presentation.`}
          type="audio"
          isOpen={showAudioTeleprompter}
          onClose={() => setShowAudioTeleprompter(false)}
          isRecording={isRecording}
        />
      )}
    </>
  );
};
