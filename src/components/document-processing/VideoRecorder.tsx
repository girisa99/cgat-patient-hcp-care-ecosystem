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

        // Also check localStorage for generated audios from ScriptsManager
        const savedAudioMetadata = localStorage.getItem('generatedAudiosMetadata');
        if (savedAudioMetadata) {
          try {
            const generatedAudios = JSON.parse(savedAudioMetadata);
            console.log('📀 Found generatedAudiosMetadata:', generatedAudios.length, 'audios');
            
            generatedAudios.forEach((audio: any) => {
              // Check if this audio is already in the DB items (by storage path or name)
              const alreadyExists = items.some(
                item => 
                  (item.storage_path && audio.storagePath && item.storage_path === audio.storagePath) || 
                  (item.name === audio.name && item.file_type === 'audio')
              );
              
              // Reconstruct URL from storage path if needed
              let audioUrl = audio.audioUrl;
              if (audio.storagePath && !audioUrl) {
                const { data } = supabase.storage.from('generated-audio').getPublicUrl(audio.storagePath);
                audioUrl = data.publicUrl;
              }
              
              if (!alreadyExists && audioUrl) {
                items.push({
                  id: audio.id || `generated-${Date.now()}-${Math.random().toString(36).substring(7)}`,
                  name: audio.name || 'Generated Audio',
                  file_type: 'audio',
                  storage_bucket: 'generated-audio',
                  storage_path: audio.storagePath || '',
                  url: audioUrl,
                  source: 'generated',
                  created_at: audio.generatedAt || new Date().toISOString(),
                  metadata: { voice: audio.voice, scriptText: audio.scriptText, scriptType: audio.scriptType },
                });
              }
            });
          } catch (e) {
            console.error('Failed to parse generated audio metadata:', e);
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

        console.log('🎥 Loaded media items:', items.length, 'audio files:', items.filter(m => m.file_type === 'audio').length, items.filter(m => m.file_type === 'audio').map(a => a.name));
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
## Voice-Over Script — Part 1: Patient Onboarding

**Total Runtime: ~11 minutes**

---

# SCENE 1: OPENING
**[0:00 - 2:30]**

*[Show title card, then transition to screen recording]*

Hello everyone! Good morning, evening, afternoon, or night—wherever you are watching this video!

If you watched my previous video on this AI document processing platform, you saw what was possible in less than 64 hours during a single weekend.

Today, I'm excited to share what happened next—the evolution from a weekend prototype to an enterprise-grade solution.

Since that original build, I've made significant enhancements on both the **technical architecture** and **functional** sides.

**Technical Architecture Enhancements:**

**Multi-Model AI Routing System:**
- Content-aware model selection based on document characteristics
- Specialized models for different content types—tables, handwriting, medical images
- Dynamic routing logic that chooses the optimal AI model per document

**Configuration-Driven Architecture:**
- Document type configurations externalized from code
- Field mapping rules configurable per document category
- Processing hints that enable specialized pipelines like NDC lookup

**Two-Stage Pipeline with Provider Abstraction:**
- OCR layer with dynamic provider selection—Google Vision, AWS Textract, Azure Form Recognizer
- NLP layer with multi-model routing based on document complexity
- Interface patterns that allow swapping providers without pipeline changes

---

# SCENE 2: MULTI-MODEL ROUTING ARCHITECTURE
**[2:30 - 4:30]**

*[Navigate to Architecture Diagram → Content Type Routing tab]*

The biggest architectural change is **intelligent multi-model routing**.

Before — Single Model Approach:
- One AI model processed every document type
- Same extraction logic regardless of content
- Generic prompts with no document-type optimization
- Accuracy dropped significantly on specialized content

After — Content-Aware Routing System:

The system now analyzes document characteristics and routes to specialized models:

**Tables and Structured Data:**
- Gemini 2.5 Flash for structure recognition
- AWS Textract for precise cell extraction
- Optimized for invoices, forms, and tabular medical records

**Medical Imaging:**
- GPT-5 for radiology analysis and findings
- Med-PaLM 2 for clinical interpretation
- X-rays, CT scans, MRI reports

**Lab Results:**
- Claude Sonnet for result interpretation
- Gemini Pro for reference range validation
- Blood tests, pathology reports, urinalysis

**Handwritten Content:**
- Google Vision for handwriting OCR
- GPT-5 Mini for contextual correction
- Physician notes, handwritten prescriptions

Each routing decision is logged with the model selected, confidence threshold applied, and processing time.

---

# PRODUCTION NOTES

## Key Technical Points to Emphasize
1. Multi-model routing based on content type
2. Configuration-driven document types
3. Provider abstraction pattern (OCR and NLP)
4. Two-stage pipeline architecture
5. Per-field confidence scoring
6. Cross-document validation in workflows

## YouTube Timestamps
0:00 Introduction & Technical Enhancements
2:30 Multi-Model Routing Architecture
4:30 Configuration-Driven Document Types
6:30 Two-Stage Pipeline Architecture
8:00 Patient Onboarding Technical Demo
10:30 What's Next: Sub-Agent Architecture

---

*Version 3.0 | January 2025 | Technical Focus*`,
        },
        {
          id: 'preset-audio',
          title: 'Audio Script - Full Voiceover',
          content: `Hello everyone! Good morning, evening, afternoon, or night—wherever you are watching this video!

If you watched my previous video on this AI document processing platform, you saw what was possible in less than 64 hours during a single weekend.

Today, I'm excited to share what happened next—the evolution from a weekend prototype to an enterprise-grade solution.

Since that original build, I've made significant enhancements on both the technical architecture and functional sides.

On the technical architecture side:

First, a Multi-Model AI Routing System. The platform now performs content-aware model selection based on document characteristics. Specialized models handle different content types—tables, handwriting, medical images. Dynamic routing logic chooses the optimal AI model for each document.

Second, Configuration-Driven Architecture. Document type configurations are externalized from code. Field mapping rules are configurable per document category. Processing hints enable specialized pipelines like NDC medication lookup.

Third, a Two-Stage Pipeline with Provider Abstraction. The OCR layer dynamically selects providers—Google Vision, AWS Textract, or Azure Form Recognizer. The NLP layer routes to different models based on document complexity. Interface patterns allow swapping providers without changing the pipeline.

On the functional side:

Intelligent multi-model routing means automatic model selection based on document type, confidence-based routing with fallback strategies, and cost optimization through model tiering.

Dynamic field discovery allows extracting fields from any document type without pre-configuration, schema inference from document structure, and flexible field mapping with validation rules.

Enhanced confidence scoring provides per-field confidence from zero to 100 percent, healthcare-specific validation against clinical rules, and human-in-the-loop triggers at configurable thresholds.

Healthcare-specific integrations include NDC medication database lookups for prescription validation, ICD-10 and CPT code search, insurance payer database integration, and seamless patient onboarding workflow integration.

What started as a proof-of-concept now has production-ready architecture and functionality.

Let me walk you through the technical transformation.

The biggest architectural change is intelligent multi-model routing.

Before, with the single model approach, one AI model processed every document type. The same extraction logic ran regardless of content. Generic prompts had no document-type optimization. Accuracy dropped significantly on specialized content.

Now, with the content-aware routing system, the platform analyzes document characteristics and routes to specialized models.

For tables and structured data: Gemini 2.5 Flash handles structure recognition. AWS Textract performs precise cell extraction. This path is optimized for invoices, forms, and tabular medical records.

For medical imaging: GPT-5 analyzes radiology findings. Med-PaLM 2 provides clinical interpretation. This handles X-rays, CT scans, and MRI reports.

For lab results: Claude Sonnet interprets results. Gemini Pro validates reference ranges. This covers blood tests, pathology reports, and urinalysis.

For handwritten content: Google Vision performs handwriting OCR. GPT-5 Mini applies contextual correction. This handles physician notes and handwritten prescriptions.

Each routing decision is logged with the model selected, confidence threshold applied, and processing time.

The second major enhancement is configuration-driven architecture.

Previously, adding a new document type meant writing custom code—new components, new extraction logic, new field mappings.

Now, document types are defined in configuration. A document type config includes the ID, category, expected fields, and processing hints. Processing hints specify options like enable OCR, enable medication lookup, and preferred OCR provider.

What does this enable? You can add new document types without code changes. You can A/B test different field extraction strategies. Per-document-type model selection becomes trivial. Custom validation rules can be defined per category.

The processing hints system drives dynamic behavior. Enable medication lookup triggers NDC database integration. Enable table extraction activates the AWS Textract pipeline. Preferred OCR provider routes to a specific OCR service. Confidence threshold sets the human review trigger level.

This pattern follows the Open/Closed Principle—the system is open for extension but closed for modification.

The processing foundation is a two-stage pipeline with provider abstraction.

Stage 1 is the OCR layer with provider selection. The system dynamically selects OCR providers based on document characteristics. Google Cloud Vision for general-purpose printed text. AWS Textract for superior table and form extraction. Azure Form Recognizer for structured documents.

Provider selection logic considers document type from classification, presence of tables or forms, handwriting detection results, and cost optimization rules.

Stage 2 is NLP entity extraction. After OCR, the text flows through entity extraction. Prompt templates are document-type-specific. Field schemas define expected fields with types and validation rules. Confidence scoring provides per-field certainty from zero to 100 percent.

The key technical pattern is provider abstraction. Both OCR and NLP layers use a provider interface pattern. This means swapping providers—or adding new ones—requires zero changes to the processing pipeline.

Let's see the architecture in action with patient onboarding.

Patient onboarding is architecturally interesting because it demonstrates multi-document workflow chaining, cross-document validation, and multiple extraction pipelines in sequence.

Watch the processing stages. Document classification identifies type as patient enrollment. Config lookup loads processing hints and field schema. OCR provider selected is Google Vision for printed form. NLP model routed is Gemini 2.5 Flash for structured extraction.

Each extracted field includes metadata. Value is the extracted content. Confidence is model certainty from zero to one. Source indicates OCR-derived or NLP-inferred. Validation status shows passed, warning, or failed.

The system performs cross-document validation. Patient name is checked for consistency across all documents. Date of birth is verified between forms. Insurance member ID is matched against card scan.

This is enabled by workflow context that persists across document processing.

So that's the technical architecture—configuration-driven document types, multi-model routing, and a two-stage pipeline with provider abstraction.

But there's one more architectural pattern I haven't shown yet.

You might have noticed a dialog appearing after processing—Sub-Agent Recommendations.

This is the next evolution: after extracting data, the system can recommend and orchestrate follow-up AI agents. Insurance eligibility verification agent. Prior authorization agent. Care team notification agent.

These agents are dynamically generated based on document context and connected through an MCP SDK integration layer.

But that architecture deserves its own deep dive.

In Part 2, I'll cover sub-agent generation from document context, the workflow canvas for visual agent orchestration, MCP SDK integration patterns, and event-driven agent communication.

If you're building AI-powered document systems, subscribe for the technical deep dive.

Full architecture documentation is linked in the description.

Thanks for watching!`,
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
      
      console.log('📄 Loaded scripts:', allScripts.length, allScripts.map(s => s.title));
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
    
    // Escape script content for safe HTML embedding AND template literal safety
    const escapeHtml = (str: string) => str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;')
      .replace(/`/g, '&#96;')  // Escape backticks for template literal safety
      .replace(/\$/g, '&#36;') // Escape dollar signs to prevent ${} interpolation
      .replace(/\\/g, '&#92;') // Escape backslashes
      .replace(/\n/g, '<br>');
    
    const escapedScriptContent = escapeHtml(scriptContent);
    
    // Calculate audio files for popout - filter from mediaItems
    const popoutAudioFiles = mediaItems.filter(m => m.file_type === 'audio');
    
    // Music files: instrumental type OR name contains music-related keywords
    const popoutMusicFiles = popoutAudioFiles.filter(m => 
      m.metadata?.type === 'instrumental' || 
      m.name.toLowerCase().includes('music') || 
      m.name.toLowerCase().includes('instrument') ||
      m.name.toLowerCase().includes('bgm') ||
      m.name.toLowerCase().includes('background') ||
      m.name.toLowerCase().includes('song_') // Generated music files start with song_
    );
    
    // Voiceover files: Has scriptText/scriptType in metadata OR not in music list
    // Prioritize files that have script data attached (from Library generation)
    const popoutVoiceoverFiles = popoutAudioFiles.filter(m => {
      // If it's already identified as music, exclude it
      if (popoutMusicFiles.includes(m)) return false;
      
      // If it has scriptText or scriptType metadata, it's a voiceover
      if (m.metadata?.scriptText || m.metadata?.scriptType === 'audio' || m.metadata?.scriptType === 'video') {
        return true;
      }
      
      // If it has voice metadata (TTS generated), it's a voiceover
      if (m.metadata?.voice) return true;
      
      // Default: include anything not in music
      return true;
    });
    
    console.log('📋 Pop-out data:', {
      scripts: availableScripts.length,
      voiceovers: popoutVoiceoverFiles.length,
      voiceoverNames: popoutVoiceoverFiles.map(v => v.name),
      music: popoutMusicFiles.length,
      musicNames: popoutMusicFiles.map(m => m.name),
      allAudio: popoutAudioFiles.length
    });
    
    // Prepare scripts list for dropdown - include scriptText from voiceovers that have it
    // IMPORTANT: Use a safe method to pass data - encode as base64 and decode in the popout
    const scriptsData = availableScripts.map(s => ({ id: s.id, title: s.title, content: s.content }));
    const voiceoversData = popoutVoiceoverFiles.map(a => ({ 
      id: a.id, 
      name: a.name, 
      url: a.url,
      scriptText: a.metadata?.scriptText || null,
      scriptType: a.metadata?.scriptType || null
    }));
    const musicData = popoutMusicFiles.map(m => ({ id: m.id, name: m.name, url: m.url }));
    
    // Encode data as base64 to avoid any escaping issues with template literals
    const encodeData = (data: any) => btoa(encodeURIComponent(JSON.stringify(data)));
    const scriptsEncoded = encodeData(scriptsData);
    const voiceoversEncoded = encodeData(voiceoversData);
    const musicEncoded = encodeData(musicData);
    
    // Also escape other string values that will be embedded - use HTML entities
    const escapedAudioName = audioName.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;').replace(/`/g, '&#96;').replace(/\$/g, '&#36;');
    const escapedBgMusicName = bgMusicName.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;').replace(/`/g, '&#96;').replace(/\$/g, '&#36;');
    
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
          button.use-script-btn { 
            background: #22c55e; 
            font-size: 12px; 
            padding: 6px 12px; 
            width: 100%;
          }
          button.use-script-btn:hover { background: #16a34a; }
          button:disabled { opacity: 0.5; cursor: not-allowed; }
          
          /* Audio control panel during recording */
          .audio-control-panel {
            position: absolute;
            bottom: 80px;
            left: 50%;
            transform: translateX(-50%);
            background: rgba(0,0,0,0.9);
            border-radius: 12px;
            padding: 12px 20px;
            display: none;
            gap: 15px;
            align-items: center;
            z-index: 50;
            border: 1px solid #333;
          }
          .audio-control-panel.visible { display: flex; }
          .audio-control-group {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 5px;
            min-width: 100px;
          }
          .audio-control-group label {
            font-size: 10px;
            text-transform: uppercase;
            opacity: 0.7;
          }
          .audio-control-group .controls {
            display: flex;
            gap: 5px;
          }
          .audio-control-group button {
            padding: 6px 10px;
            font-size: 14px;
            min-width: 36px;
          }
          .audio-control-group .progress {
            width: 80px;
            height: 4px;
            background: #333;
            border-radius: 2px;
            overflow: hidden;
            margin-top: 3px;
          }
          .audio-control-group .progress-bar {
            height: 100%;
            background: #6366f1;
            width: 0%;
            transition: width 0.1s;
          }
          .audio-control-group.playing { border-left: 2px solid #22c55e; padding-left: 10px; }
          .audio-control-group.paused { border-left: 2px solid #f59e0b; padding-left: 10px; }
          
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
          .status.error { background: #dc262633; color: #dc2626; }
          .status.loading { background: #3b82f633; color: #3b82f6; }
          
          /* Camera loading overlay */
          .camera-loading {
            position: absolute;
            inset: 0;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            background: #1a1a1a;
            color: white;
          }
          .camera-loading.hidden { display: none; }
          .spinner {
            width: 48px;
            height: 48px;
            border: 4px solid #333;
            border-top-color: #6366f1;
            border-radius: 50%;
            animation: spin 1s linear infinite;
          }
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
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
          <div style="display:flex;align-items:center;gap:15px;">
            <div id="status" class="status loading">Initializing Camera...</div>
            <button id="closeBtn" class="danger" style="padding:8px 16px;font-size:13px;">
              ✕ Close
            </button>
          </div>
        </div>
        
        <!-- Options Bar with Dropdowns -->
        <div class="options-bar">
          <div class="option-group">
            <label>📄 Script (${availableScripts.length} available)</label>
            <select id="scriptSelect">
              <option value="">None</option>
            </select>
          </div>
          <div class="option-group">
            <label>🎤 Voiceover (${popoutVoiceoverFiles.length} available)</label>
            <select id="voiceoverSelect">
              <option value="">None</option>
            </select>
          </div>
          <div class="option-group">
            <label>🎵 Background Music (${popoutMusicFiles.length} available)</label>
            <select id="musicSelect">
              <option value="">None</option>
            </select>
          </div>
        </div>
        
        <div class="main">
          <div class="video-section">
            <div class="video-container">
              <video id="preview" autoplay playsinline muted></video>
              
              <!-- Camera Loading Overlay -->
              <div id="cameraLoading" class="camera-loading">
                <div id="cameraLoadingContent">
                  <div class="spinner"></div>
                  <p style="margin-top:20px;opacity:0.7;">Checking camera permissions...</p>
                  <p style="margin-top:10px;font-size:12px;opacity:0.5;">Please allow camera access when prompted</p>
                </div>
                <div id="cameraPermissionRequest" style="display:none;text-align:center;">
                  <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" stroke-width="1.5" style="margin-bottom:20px;">
                    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
                    <circle cx="12" cy="13" r="4"></circle>
                  </svg>
                  <p style="font-size:18px;font-weight:600;margin-bottom:10px;">Camera Access Required</p>
                  <p style="font-size:14px;opacity:0.7;margin-bottom:20px;">Click below to grant camera and microphone access</p>
                  <button id="requestCameraBtn" style="padding:15px 30px;font-size:16px;background:linear-gradient(135deg,#3b82f6,#8b5cf6);border:none;color:white;border-radius:10px;cursor:pointer;margin-bottom:15px;">
                    🎥 Allow Camera Access
                  </button>
                  <p style="font-size:12px;opacity:0.5;">Your browser will ask for permission</p>
                </div>
              </div>
              
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
              
              <!-- Audio Control Panel (visible during recording) -->
              <div id="audioControlPanel" class="audio-control-panel">
                <div id="voiceoverControls" class="audio-control-group" style="display:none;">
                  <label>🎤 Voiceover</label>
                  <div class="controls">
                    <button id="voRewindBtn" title="Rewind 5s">⏪</button>
                    <button id="voPlayPauseBtn" title="Play/Pause">⏸️</button>
                    <button id="voForwardBtn" title="Forward 5s">⏩</button>
                  </div>
                  <div class="progress"><div id="voProgress" class="progress-bar"></div></div>
                </div>
                
                <div id="ttsControls" class="audio-control-group" style="display:none;">
                  <label>🗣️ TTS Audio</label>
                  <div class="controls">
                    <button id="ttsRewindBtn" title="Rewind 5s">⏪</button>
                    <button id="ttsPlayPauseBtn" title="Play/Pause">⏸️</button>
                    <button id="ttsForwardBtn" title="Forward 5s">⏩</button>
                  </div>
                  <div class="progress"><div id="ttsProgress" class="progress-bar"></div></div>
                </div>
                
                <div id="musicControls" class="audio-control-group" style="display:none;">
                  <label>🎵 Music</label>
                  <div class="controls">
                    <button id="musicRewindBtn" title="Rewind 5s">⏪</button>
                    <button id="musicPlayPauseBtn" title="Play/Pause">⏸️</button>
                    <button id="musicVolumeDownBtn" title="Volume -">🔉</button>
                    <button id="musicVolumeUpBtn" title="Volume +">🔊</button>
                  </div>
                  <div class="progress"><div id="musicProgress" class="progress-bar"></div></div>
                </div>
                
                <div class="audio-control-group">
                  <label>All Audio</label>
                  <div class="controls">
                    <button id="pauseAllAudioBtn" title="Pause All">⏸️ All</button>
                    <button id="resumeAllAudioBtn" title="Resume All">▶️ All</button>
                    <button id="restartAllAudioBtn" title="Restart All">🔄</button>
                  </div>
                </div>
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
              <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;">
                <h3 style="margin:0;">📄 Teleprompter</h3>
                <div style="display:flex;gap:5px;">
                  <button id="scrollUpBtn" style="padding:4px 8px;font-size:12px;" title="Scroll Up">▲</button>
                  <button id="scrollDownBtn" style="padding:4px 8px;font-size:12px;" title="Scroll Down">▼</button>
                  <button id="scrollResetBtn" style="padding:4px 8px;font-size:12px;" title="Reset">⟲</button>
                </div>
              </div>
              <div id="scriptContent" class="script-content">
                ${escapedScriptContent || '<span style="opacity:0.5;">Select a script to display here...</span>'}
              </div>
            </div>
            
            <div id="audioPanel" class="panel" style="${audioUrl ? '' : 'display:none;'}">
              <h3>🎤 Voiceover Audio</h3>
              <div class="audio-info">
                <strong id="voiceoverName">${escapedAudioName}</strong><br>
                <small>Will play automatically when recording starts</small>
                <button id="useVoiceoverScriptBtn" class="use-script-btn" style="display:none;margin-top:8px;">
                  📄 Use Attached Script
                </button>
              </div>
              <audio id="voiceover" src="${audioUrl}" preload="auto"></audio>
            </div>
            
            <div id="musicPanel" class="panel" style="${bgMusicUrl ? '' : 'display:none;'}">
              <h3>🎵 Background Music</h3>
              <div class="audio-info">
                <strong id="bgMusicName">${escapedBgMusicName}</strong>
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
          // =====================================================
          // CRITICAL: Close button setup BEFORE anything else
          // This runs in its own scope to ensure it never fails
          // =====================================================
          (function setupCloseButton() {
            try {
              window.mediaRecorder = null;
              window.cameraStream = null;
              window.displayStream = null;
              
              var closeBtn = document.getElementById('closeBtn');
              console.log('🔴 Close button element:', closeBtn);
              
              if (closeBtn) {
                closeBtn.onclick = function() {
                  console.log('Close clicked!');
                  try {
                    if (window.mediaRecorder && window.mediaRecorder.state === 'recording') {
                      window.mediaRecorder.stop();
                    }
                    if (window.cameraStream) {
                      window.cameraStream.getTracks().forEach(function(t) { t.stop(); });
                    }
                    if (window.displayStream) {
                      window.displayStream.getTracks().forEach(function(t) { t.stop(); });
                    }
                  } catch(e) { console.log('Cleanup error:', e); }
                  window.close();
                  return false;
                };
                console.log('✅ Close button ready');
              } else {
                console.error('❌ No close button!');
              }
              
              document.onkeydown = function(e) {
                if (e.key === 'Escape' || e.keyCode === 27) {
                  closeBtn && closeBtn.click();
                }
              };
            } catch(e) {
              console.error('Close button setup error:', e);
            }
          })();
          
          // Global error handler
          window.onerror = function(msg, url, line) {
            console.error('Script Error:', msg, 'line:', line);
            var s = document.getElementById('status');
            if (s) { s.textContent = 'Script Error'; s.className = 'status error'; }
            return false;
          };
          
          // =====================================================
          // Main functionality in separate IIFE
          // =====================================================
          (function mainScript() {
            'use strict';
            console.log('🚀 Main script starting...');
            
            // Decode data from base64 (safe encoding to avoid template literal issues)
            function decodeData(encoded) {
              try {
                if (!encoded) return [];
                return JSON.parse(decodeURIComponent(atob(encoded)));
              } catch(e) {
                console.error('Failed to decode data:', e);
                return [];
              }
            }
            
            // Data from parent (base64 encoded for safety)
            var scripts = decodeData('${scriptsEncoded}');
            var voiceovers = decodeData('${voiceoversEncoded}');
            var musicList = decodeData('${musicEncoded}');
            
            console.log('📋 Data loaded:', { scripts: scripts.length, voiceovers: voiceovers.length, music: musicList.length });
            
            var mediaRecorder = null;
            var chunks = [];
            var stream = null;
            var startTime = 0;
            var timerInterval = null;
            var isPaused = false;
            var countdownInterval = null;
            var countdownValue = 5;
          
            var preview = document.getElementById('preview');
            var startBtn = document.getElementById('startBtn');
            var pauseBtn = document.getElementById('pauseBtn');
            var stopBtn = document.getElementById('stopBtn');
            var saveBtn = document.getElementById('saveBtn');
            var resetBtn = document.getElementById('resetBtn');
            var videoNameInput = document.getElementById('videoName');
            var recIndicator = document.getElementById('recIndicator');
            var timer = document.getElementById('timer');
            var status = document.getElementById('status');
            var voiceover = document.getElementById('voiceover');
            var bgMusic = document.getElementById('bgMusic');
            var countdownOverlay = document.getElementById('countdownOverlay');
            var countdownNumber = document.getElementById('countdownNumber');
            var cancelCountdown = document.getElementById('cancelCountdown');
            var scriptSelect = document.getElementById('scriptSelect');
            var voiceoverSelect = document.getElementById('voiceoverSelect');
            var musicSelect = document.getElementById('musicSelect');
            var scriptContent = document.getElementById('scriptContent');
            var audioPanel = document.getElementById('audioPanel');
            var musicPanel = document.getElementById('musicPanel');
            var voiceoverName = document.getElementById('voiceoverName');
            var bgMusicName = document.getElementById('bgMusicName');
            
            // Currently selected script ID
            var selectedScriptId = '${selectedScript?.id || ''}';
            var selectedVoiceoverId = '${selectedAudioFile?.id || ''}';
            var selectedMusicId = '${selectedBackgroundMusic?.id || ''}';
            
            // Populate dropdowns (wrapped in try-catch to prevent breaking close button)
            try {
              scripts.forEach(function(s) {
                var opt = document.createElement('option');
                opt.value = s.id;
                opt.textContent = s.title;
                if (s.id === selectedScriptId) opt.selected = true;
                scriptSelect.appendChild(opt);
              });
              console.log('✅ Scripts dropdown populated:', scripts.length);
              
              voiceovers.forEach(function(v) {
                var opt = document.createElement('option');
                opt.value = v.id;
                opt.textContent = v.name;
                if (v.id === selectedVoiceoverId) opt.selected = true;
                voiceoverSelect.appendChild(opt);
              });
              console.log('✅ Voiceovers dropdown populated:', voiceovers.length);
              
              musicList.forEach(function(m) {
                var opt = document.createElement('option');
                opt.value = m.id;
                opt.textContent = m.name;
                if (m.id === selectedMusicId) opt.selected = true;
                musicSelect.appendChild(opt);
              });
              console.log('✅ Music dropdown populated:', musicList.length);
            } catch(dropdownError) {
              console.error('❌ Error populating dropdowns:', dropdownError);
            }
            
            // Helper to escape HTML for safe display
            function escapeHtmlContent(str) {
              var div = document.createElement('div');
              div.textContent = str;
              // Convert newlines to <br> tags for proper display
              return div.innerHTML.replace(/\\n/g, '<br>').replace(/\n/g, '<br>');
            }
            
            // Debug log the loaded data
            console.log('📋 Pop-out loaded data:', {
              scriptsCount: scripts.length,
              voiceoversCount: voiceovers.length,
              musicCount: musicList.length
            });
            
            // Check if initial voiceover has attached script (wrapped in try-catch)
            try {
              var initialVoiceover = voiceovers.find(function(v) { return v.id === selectedVoiceoverId; });
              if (initialVoiceover && initialVoiceover.scriptText) {
                var useScriptBtnInit = document.getElementById('useVoiceoverScriptBtn');
                if (useScriptBtnInit) {
                  useScriptBtnInit.style.display = 'inline-block';
                  useScriptBtnInit.onclick = function() {
                    scriptContent.innerHTML = escapeHtmlContent(initialVoiceover.scriptText);
                    scriptSelect.value = '';
                    status.textContent = 'Script loaded from voiceover';
                    status.className = 'status ready';
                  };
                }
              }
            } catch(voError) {
              console.error('❌ Error setting up initial voiceover:', voError);
            }
            
            // Handle dropdown changes (wrapped in try-catch)
            try {
              scriptSelect.onchange = function() {
                var script = scripts.find(function(s) { return s.id === scriptSelect.value; });
                if (script) {
                  scriptContent.innerHTML = escapeHtmlContent(script.content);
                } else {
                  scriptContent.innerHTML = '<span style="opacity:0.5;">Select a script to display here...</span>';
                }
              };
              
              voiceoverSelect.onchange = function() {
                var vo = voiceovers.find(function(v) { return v.id === voiceoverSelect.value; });
                if (vo) {
                  voiceover.src = vo.url;
                  voiceoverName.textContent = vo.name;
                  audioPanel.style.display = 'block';
                  
                  // If voiceover has an attached script, show option to use it
                  var useScriptBtn = document.getElementById('useVoiceoverScriptBtn');
                  if (useScriptBtn) {
                    if (vo.scriptText) {
                      useScriptBtn.style.display = 'inline-block';
                      useScriptBtn.onclick = function() {
                        scriptContent.innerHTML = escapeHtmlContent(vo.scriptText);
                        scriptSelect.value = ''; // Deselect any selected script
                        status.textContent = 'Script loaded from voiceover';
                        status.className = 'status ready';
                      };
                    } else {
                      useScriptBtn.style.display = 'none';
                    }
                  }
                } else {
                  voiceover.src = '';
                  audioPanel.style.display = 'none';
                  var btn = document.getElementById('useVoiceoverScriptBtn');
                  if (btn) btn.style.display = 'none';
                }
              };
              
              musicSelect.onchange = function() {
                var m = musicList.find(function(x) { return x.id === musicSelect.value; });
                if (m) {
                  bgMusic.src = m.url;
                  bgMusicName.textContent = m.name;
                  musicPanel.style.display = 'block';
                } else {
                  bgMusic.src = '';
                  musicPanel.style.display = 'none';
                }
              };
              console.log('✅ Dropdown change handlers set up');
            } catch(changeError) {
              console.error('❌ Error setting up dropdown handlers:', changeError);
            }
            
            // Teleprompter scroll controls (wrapped in try-catch)
            try {
              var scrollUpBtn = document.getElementById('scrollUpBtn');
              var scrollDownBtn = document.getElementById('scrollDownBtn');
              var scrollResetBtn = document.getElementById('scrollResetBtn');
              
              if (scrollUpBtn) scrollUpBtn.onclick = function() { scriptContent.scrollTop -= 50; };
              if (scrollDownBtn) scrollDownBtn.onclick = function() { scriptContent.scrollTop += 50; };
              if (scrollResetBtn) scrollResetBtn.onclick = function() { scriptContent.scrollTop = 0; };
              console.log('✅ Teleprompter controls set up');
            } catch(scrollError) {
              console.error('❌ Error setting up scroll controls:', scrollError);
            }
            
            var cameraLoading = document.getElementById('cameraLoading');
            var cameraLoadingContent = document.getElementById('cameraLoadingContent');
            var cameraPermissionRequest = document.getElementById('cameraPermissionRequest');
            var requestCameraBtn = document.getElementById('requestCameraBtn');
          
          function showPermissionDenied() {
            cameraLoadingContent.style.display = 'none';
            cameraPermissionRequest.innerHTML = '<svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="1.5" style="margin-bottom:20px;"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg><p style="font-size:18px;font-weight:600;color:#ef4444;margin-bottom:10px;">Camera Access Blocked</p><p style="font-size:14px;opacity:0.7;margin-bottom:15px;">Camera permission was denied by browser</p><div style="background:rgba(255,255,255,0.05);padding:15px;border-radius:10px;text-align:left;margin-bottom:20px;max-width:400px;"><p style="font-size:13px;font-weight:600;margin-bottom:10px;">To allow camera access:</p><ol style="font-size:12px;opacity:0.8;padding-left:20px;margin:0;"><li style="margin-bottom:5px;">Click the camera/lock icon in your browser address bar</li><li style="margin-bottom:5px;">Find Camera and change to Allow</li><li style="margin-bottom:5px;">Click the button below to reload</li></ol></div><button onclick="location.reload()" style="padding:12px 25px;font-size:14px;background:#3b82f6;border:none;color:white;border-radius:8px;cursor:pointer;">Reload Window</button>';
            cameraPermissionRequest.style.display = 'block';
            status.textContent = 'Permission Denied';
            status.className = 'status error';
          }
          
          // Initialize camera - this triggers browser permission prompt right away
          function initCamera() {
            console.log('🎥 Requesting camera access...');
            
            // Check if mediaDevices is available
            if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
              console.error('Camera API not available');
              cameraLoadingContent.innerHTML = '<p style="color:#f87171;">Camera API not available in this browser</p>';
              status.textContent = 'Error';
              status.className = 'status error';
              return;
            }
            
            // Request immediately - browser will show permission prompt
            navigator.mediaDevices.getUserMedia({
              video: { 
                width: { ideal: 1280 },
                height: { ideal: 720 },
                facingMode: 'user'
              },
              audio: true
            }).then(function(mediaStream) {
              console.log('✅ Camera stream obtained');
              stream = mediaStream;
              window.cameraStream = mediaStream; // Set global for close handler
              
              // Set preview and play
              preview.srcObject = mediaStream;
              preview.muted = true;
              preview.play().then(function() {
                console.log('✅ Preview playing');
                cameraLoading.classList.add('hidden');
                status.textContent = 'Camera Ready';
                status.className = 'status ready';
              }).catch(function(playErr) {
                console.error('Preview play error:', playErr);
                // Still mark as ready even if autoplay fails
                cameraLoading.classList.add('hidden');
                status.textContent = 'Camera Ready';
                status.className = 'status ready';
              });
              
            }).catch(function(e) {
              console.error('❌ Camera error:', e.name, e.message);
              
              if (e.name === 'NotAllowedError') {
                showPermissionDenied();
              } else if (e.name === 'NotFoundError') {
                cameraLoadingContent.style.display = 'none';
                cameraPermissionRequest.innerHTML = '<svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="1.5" style="margin-bottom:20px;"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg><p style="font-size:18px;font-weight:600;color:#ef4444;margin-bottom:10px;">No Camera Found</p><p style="font-size:14px;opacity:0.7;margin-bottom:20px;">Please connect a camera and try again</p><button onclick="location.reload()" style="padding:12px 25px;background:#3b82f6;border:none;color:white;border-radius:8px;cursor:pointer;">Retry</button>';
                cameraPermissionRequest.style.display = 'block';
                status.textContent = 'No Camera';
                status.className = 'status error';
              } else {
                cameraLoadingContent.innerHTML = '<p style="color:#f87171;font-size:16px;margin-bottom:10px;">Camera Error</p><p style="font-size:13px;opacity:0.7;margin-bottom:15px;">' + (e.message || 'Unknown error') + '</p><button onclick="initCamera()" style="padding:10px 20px;background:#3b82f6;border:none;color:white;border-radius:8px;cursor:pointer;">Retry</button>';
                status.textContent = 'Error';
                status.className = 'status error';
              }
            });
          }
          
          // Button click to retry
          requestCameraBtn.onclick = initCamera;
          
          // Initialize camera immediately on load
          console.log('🎬 Starting camera initialization...');
          initCamera();
          
            function formatTime(seconds) {
              var mins = Math.floor(seconds / 60);
              var secs = seconds % 60;
              return mins.toString().padStart(2,'0') + ':' + secs.toString().padStart(2,'0');
            }
            
            var displayStream = null;
            var screenVideo = null;
            var webcamVideo = null;
            var canvas = null;
            var ctx = null;
            var audioContext = null;
            var scrollInterval = null;
            var ttsAudio = null;
          
          // Start recording - First get screen share, then show audio options, then countdown
          startBtn.onclick = function() {
            status.textContent = 'Select screen...';
            status.className = 'status countdown';
            
            // Step 1: Get screen share FIRST (before countdown)
            navigator.mediaDevices.getDisplayMedia({
              video: { width: 1920, height: 1080, frameRate: 30 },
              audio: true
            }).then(function(displayStr) {
              displayStream = displayStr;
              window.displayStream = displayStr; // Store globally for cleanup
              
              // Show screen preview immediately
              preview.srcObject = displayStream;
              
              status.textContent = 'Screen selected';
              
              // Step 2: Show audio options confirmation dialog
              showAudioOptionsDialog();
              
            }).catch(function(e) {
              console.error('Screen share error:', e);
              status.textContent = 'Ready';
              status.className = 'status ready';
              if (e.name !== 'NotAllowedError') {
                alert('Screen share error: ' + e.message);
              }
            });
          };
          
            // Audio options dialog
            function showAudioOptionsDialog() {
              var hasScript = scriptSelect.value && scripts.find(function(s) { return s.id === scriptSelect.value; });
              var hasVoiceover = voiceoverSelect.value && voiceovers.find(function(v) { return v.id === voiceoverSelect.value; });
              var hasMusic = musicSelect.value && musicList.find(function(m) { return m.id === musicSelect.value; });
              
              var dialogHtml = '<div id="audioOptionsDialog" style="position:fixed;inset:0;background:rgba(0,0,0,0.8);display:flex;align-items:center;justify-content:center;z-index:200;">';
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
                var voName = voiceovers.find(function(v) { return v.id === voiceoverSelect.value; });
                dialogHtml += '<div style="margin-bottom:20px;padding:15px;background:#2a2a3e;border-radius:8px;">';
                dialogHtml += '<label style="display:flex;align-items:center;gap:10px;cursor:pointer;">';
                dialogHtml += '<input type="checkbox" id="useVoiceover" checked style="width:20px;height:20px;">';
                dialogHtml += '<div><strong>🎤 Play Voiceover Audio</strong><br><small style="opacity:0.7;">' + (voName ? voName.name : '') + '</small></div>';
                dialogHtml += '</label></div>';
              }
              
              // Background music option
              if (hasMusic) {
                var mName = musicList.find(function(m) { return m.id === musicSelect.value; });
                dialogHtml += '<div style="margin-bottom:20px;padding:15px;background:#2a2a3e;border-radius:8px;">';
                dialogHtml += '<label style="display:flex;align-items:center;gap:10px;cursor:pointer;">';
                dialogHtml += '<input type="checkbox" id="useMusic" checked style="width:20px;height:20px;">';
                dialogHtml += '<div><strong>🎵 Play Background Music</strong><br><small style="opacity:0.7;">' + (mName ? mName.name : '') + '</small></div>';
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
                  displayStream.getTracks().forEach(function(t) { t.stop(); });
                  displayStream = null;
                }
                preview.srcObject = stream;
                status.textContent = 'Ready';
                status.className = 'status ready';
              };
              
              document.getElementById('confirmOptions').onclick = function() {
                var useTTSVal = document.getElementById('useTTS');
                var useVoiceoverVal = document.getElementById('useVoiceover');
                var useMusicVal = document.getElementById('useMusic');
                var useTTS = useTTSVal ? useTTSVal.checked : false;
                var useVoiceoverOpt = useVoiceoverVal ? useVoiceoverVal.checked : false;
                var useMusicOpt = useMusicVal ? useMusicVal.checked : false;
                
                document.getElementById('audioOptionsDialog').remove();
                
                // Generate TTS if requested (async, then start countdown)
                if (useTTS && hasScript) {
                  status.textContent = 'Generating TTS...';
                  var scriptToUse = scripts.find(function(s) { return s.id === scriptSelect.value; });
                  if (scriptToUse) {
                    generateTTS(scriptToUse.content, function() {
                      startCountdown(useVoiceoverOpt, useMusicOpt, useTTS);
                    });
                  } else {
                    startCountdown(useVoiceoverOpt, useMusicOpt, useTTS);
                  }
                } else {
                  // Start countdown immediately
                  startCountdown(useVoiceoverOpt, useMusicOpt, useTTS);
                }
              };
            }
          
          // Generate TTS from script (callback-based)
          function generateTTS(text, callback) {
            var supabaseUrl = '${supabaseUrl}';
            var supabaseKey = '${supabaseKey}';
            
            fetch(supabaseUrl + '/functions/v1/elevenlabs-voice', {
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
            }).then(function(response) {
              if (!response.ok) throw new Error('TTS API failed');
              return response.json();
            }).then(function(data) {
              if (data.audioContent) {
                ttsAudio = new Audio('data:audio/mpeg;base64,' + data.audioContent);
                ttsAudio.volume = 1.0;
              }
              if (callback) callback();
            }).catch(function(e) {
              console.error('TTS error:', e);
              // Fallback: try OpenAI TTS
              fetch(supabaseUrl + '/functions/v1/openai-tts', {
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
              }).then(function(response) {
                if (response.ok) return response.json();
                throw new Error('OpenAI TTS failed');
              }).then(function(data) {
                if (data.audioContent) {
                  ttsAudio = new Audio('data:audio/mpeg;base64,' + data.audioContent);
                  ttsAudio.volume = 1.0;
                }
                if (callback) callback();
              }).catch(function(e2) {
                console.error('OpenAI TTS fallback failed:', e2);
                if (callback) callback();
              });
            });
          }
          
            // Start countdown after screen share is ready
            function startCountdown(useVoiceover, useMusic, useTTS) {
              countdownValue = 5;
              countdownNumber.textContent = countdownValue;
              countdownOverlay.classList.remove('hidden');
              status.textContent = 'Countdown...';
              status.className = 'status countdown';
              
              countdownInterval = setInterval(function() {
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
                displayStream.getTracks().forEach(function(t) { t.stop(); });
                displayStream = null;
              }
              preview.srcObject = stream;
              status.textContent = 'Ready';
              status.className = 'status ready';
            };
            
            function actuallyStartRecording(useVoiceover, useMusic, useTTS) {
              // Create canvas for picture-in-picture (reduces delay)
              canvas = document.createElement('canvas');
              canvas.width = 1920;
              canvas.height = 1080;
              ctx = canvas.getContext('2d');
              
              screenVideo = document.createElement('video');
              screenVideo.srcObject = displayStream;
              screenVideo.muted = true;
              screenVideo.playsInline = true;
              
              webcamVideo = document.createElement('video');
              webcamVideo.srcObject = stream;
              webcamVideo.muted = true;
              webcamVideo.playsInline = true;
              
              // Play both videos using Promise.all pattern with callbacks
              var videosReady = 0;
              var totalVideos = 2;
              
              function onVideoReady() {
                videosReady++;
                if (videosReady >= totalVideos) {
                  startRecordingAfterVideos(useVoiceover, useMusic, useTTS);
                }
              }
              
              screenVideo.onloadedmetadata = function() {
                screenVideo.play().then(onVideoReady).catch(function(e) {
                  console.error('Screen video play error:', e);
                  onVideoReady(); // Continue anyway
                });
              };
              
              webcamVideo.onloadedmetadata = function() {
                webcamVideo.play().then(onVideoReady).catch(function(e) {
                  console.error('Webcam video play error:', e);
                  onVideoReady(); // Continue anyway
                });
              };
              
              // Fallback timeout in case onloadedmetadata doesn't fire
              setTimeout(function() {
                if (videosReady < totalVideos) {
                  console.log('Timeout reached, starting recording...');
                  startRecordingAfterVideos(useVoiceover, useMusic, useTTS);
                  videosReady = 999; // Prevent double-start
                }
              }, 3000);
            }
            
            function startRecordingAfterVideos(useVoiceover, useMusic, useTTS) {
              try {
                
                // Optimized drawing loop for less delay
                var lastDrawTime = 0;
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
                var dest = audioContext.createMediaStreamDestination();
                
                // Add display audio
                displayStream.getAudioTracks().forEach(function(track) {
                  var src = audioContext.createMediaStreamSource(new MediaStream([track]));
                  src.connect(dest);
                });
                
                // Add microphone audio
                stream.getAudioTracks().forEach(function(track) {
                  var src = audioContext.createMediaStreamSource(new MediaStream([track]));
                  src.connect(dest);
                });
                
                var canvasStream = canvas.captureStream(30);
                var videoTracks = canvasStream.getVideoTracks();
                var audioTracks = dest.stream.getAudioTracks();
                var allTracks = videoTracks.concat(audioTracks);
                var finalStream = new MediaStream(allTracks);
                
              preview.srcObject = finalStream;
              
              mediaRecorder = new MediaRecorder(finalStream, { 
                mimeType: 'video/webm;codecs=vp9',
                videoBitsPerSecond: 2500000 
              });
              window.mediaRecorder = mediaRecorder; // Set global for close handler
              chunks = [];
              
                mediaRecorder.ondataavailable = function(e) {
                  if(e.data.size > 0) chunks.push(e.data);
                };
                
                mediaRecorder.onstop = function() {
                  clearInterval(timerInterval);
                  clearInterval(scrollInterval);
                  var blob = new Blob(chunks, { type: 'video/webm' });
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
                  
                  // Hide audio control panel
                  audioControlPanel.classList.remove('visible');
                  
                  if(voiceover) voiceover.pause();
                  if(bgMusic) bgMusic.pause();
                  if(ttsAudio) ttsAudio.pause();
                  if(displayStream) displayStream.getTracks().forEach(function(t) { t.stop(); });
                };
                
                mediaRecorder.start(1000);
                startTime = Date.now();
                timerInterval = setInterval(function() {
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
                  ttsAudio.play().catch(function(e) { console.error('TTS playback error:', e); });
                }
                
                // Play voiceover if selected
                if(useVoiceover && voiceover && voiceover.src) {
                  voiceover.play().catch(function(e) { console.error('Voiceover error:', e); });
                }
                
                // Play background music if selected
                if(useMusic && bgMusic && bgMusic.src) { 
                  bgMusic.volume = 0.3; 
                  bgMusic.play().catch(function(e) { console.error('Music error:', e); });
                }
                
                // Show audio control panel
                showAudioControls(useVoiceover, useTTS, useMusic);
                
                // Auto-scroll teleprompter
                startTeleprompterScroll();
                
              } catch(e) {
                console.error('Recording error:', e);
                alert('Error: ' + e.message);
                if (displayStream) {
                  displayStream.getTracks().forEach(function(t) { t.stop(); });
                  displayStream = null;
                }
                preview.srcObject = stream;
                status.textContent = 'Ready';
                status.className = 'status ready';
              }
            }
            
            // Auto-scroll teleprompter during recording
            function startTeleprompterScroll() {
              var scrollSpeed = 1; // pixels per 50ms
              scrollInterval = setInterval(function() {
                if (!isPaused && scriptContent) {
                  scriptContent.scrollTop += scrollSpeed;
                }
              }, 50);
            }
            
            // Audio control panel element references
            var audioControlPanel = document.getElementById('audioControlPanel');
            var voiceoverControls = document.getElementById('voiceoverControls');
            var ttsControls = document.getElementById('ttsControls');
            var musicControls = document.getElementById('musicControls');
            
            // Track which audio sources are active
            var voiceoverActive = false;
            var ttsActive = false;
            var musicActive = false;
          
          // Show audio control panel during recording
          function showAudioControls(useVoiceover, useTTS, useMusic) {
            voiceoverActive = useVoiceover;
            ttsActive = useTTS;
            musicActive = useMusic;
            
            if (useVoiceover) voiceoverControls.style.display = 'flex';
            if (useTTS) ttsControls.style.display = 'flex';
            if (useMusic) musicControls.style.display = 'flex';
            
            if (useVoiceover || useTTS || useMusic) {
              audioControlPanel.classList.add('visible');
              updateAudioProgress();
            }
          }
          
            // Update progress bars
            function updateAudioProgress() {
              setInterval(function() {
                if (voiceoverActive && voiceover && voiceover.duration) {
                  document.getElementById('voProgress').style.width = (voiceover.currentTime / voiceover.duration * 100) + '%';
                }
                if (ttsActive && ttsAudio && ttsAudio.duration) {
                  document.getElementById('ttsProgress').style.width = (ttsAudio.currentTime / ttsAudio.duration * 100) + '%';
                }
                if (musicActive && bgMusic && bgMusic.duration) {
                  document.getElementById('musicProgress').style.width = (bgMusic.currentTime / bgMusic.duration * 100) + '%';
                }
              }, 100);
            }
          
          // Voiceover controls
          document.getElementById('voRewindBtn').onclick = function() {
            if (voiceover) voiceover.currentTime = Math.max(0, voiceover.currentTime - 5);
          };
          document.getElementById('voPlayPauseBtn').onclick = function() {
            if (voiceover) {
              if (voiceover.paused) {
                voiceover.play();
                this.textContent = '⏸️';
                voiceoverControls.classList.remove('paused');
                voiceoverControls.classList.add('playing');
              } else {
                voiceover.pause();
                this.textContent = '▶️';
                voiceoverControls.classList.remove('playing');
                voiceoverControls.classList.add('paused');
              }
            }
          };
          document.getElementById('voForwardBtn').onclick = function() {
            if (voiceover) voiceover.currentTime = Math.min(voiceover.duration || 0, voiceover.currentTime + 5);
          };
          
          // TTS controls
          document.getElementById('ttsRewindBtn').onclick = function() {
            if (ttsAudio) ttsAudio.currentTime = Math.max(0, ttsAudio.currentTime - 5);
          };
          document.getElementById('ttsPlayPauseBtn').onclick = function() {
            if (ttsAudio) {
              if (ttsAudio.paused) {
                ttsAudio.play();
                this.textContent = '⏸️';
                ttsControls.classList.remove('paused');
                ttsControls.classList.add('playing');
              } else {
                ttsAudio.pause();
                this.textContent = '▶️';
                ttsControls.classList.remove('playing');
                ttsControls.classList.add('paused');
              }
            }
          };
          document.getElementById('ttsForwardBtn').onclick = function() {
            if (ttsAudio) ttsAudio.currentTime = Math.min(ttsAudio.duration || 0, ttsAudio.currentTime + 5);
          };
          
          // Music controls
          document.getElementById('musicRewindBtn').onclick = function() {
            if (bgMusic) bgMusic.currentTime = Math.max(0, bgMusic.currentTime - 5);
          };
          document.getElementById('musicPlayPauseBtn').onclick = function() {
            if (bgMusic) {
              if (bgMusic.paused) {
                bgMusic.play();
                this.textContent = '⏸️';
                musicControls.classList.remove('paused');
                musicControls.classList.add('playing');
              } else {
                bgMusic.pause();
                this.textContent = '▶️';
                musicControls.classList.remove('playing');
                musicControls.classList.add('paused');
              }
            }
          };
          document.getElementById('musicVolumeDownBtn').onclick = function() {
            if (bgMusic) bgMusic.volume = Math.max(0, bgMusic.volume - 0.1);
          };
          document.getElementById('musicVolumeUpBtn').onclick = function() {
            if (bgMusic) bgMusic.volume = Math.min(1, bgMusic.volume + 0.1);
          };
          
          // All audio controls
          document.getElementById('pauseAllAudioBtn').onclick = function() {
            if (voiceover) { voiceover.pause(); document.getElementById('voPlayPauseBtn').textContent = '▶️'; }
            if (ttsAudio) { ttsAudio.pause(); document.getElementById('ttsPlayPauseBtn').textContent = '▶️'; }
            if (bgMusic) { bgMusic.pause(); document.getElementById('musicPlayPauseBtn').textContent = '▶️'; }
          };
          document.getElementById('resumeAllAudioBtn').onclick = function() {
            if (voiceoverActive && voiceover) { voiceover.play(); document.getElementById('voPlayPauseBtn').textContent = '⏸️'; }
            if (ttsActive && ttsAudio) { ttsAudio.play(); document.getElementById('ttsPlayPauseBtn').textContent = '⏸️'; }
            if (musicActive && bgMusic) { bgMusic.play(); document.getElementById('musicPlayPauseBtn').textContent = '⏸️'; }
          };
          document.getElementById('restartAllAudioBtn').onclick = function() {
            if (voiceover) { voiceover.currentTime = 0; voiceover.play(); document.getElementById('voPlayPauseBtn').textContent = '⏸️'; }
            if (ttsAudio) { ttsAudio.currentTime = 0; ttsAudio.play(); document.getElementById('ttsPlayPauseBtn').textContent = '⏸️'; }
            if (bgMusic) { bgMusic.currentTime = 0; bgMusic.play(); document.getElementById('musicPlayPauseBtn').textContent = '⏸️'; }
          };
          
          pauseBtn.onclick = function() {
            if(isPaused) {
              mediaRecorder.resume();
              pauseBtn.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg>Pause';
              isPaused = false;
              // Note: Audio resume is now handled by individual controls or "Resume All"
            } else {
              mediaRecorder.pause();
              pauseBtn.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>Resume';
              isPaused = true;
              // Note: Audio pause is now handled by individual controls or "Pause All"
            }
          };
          
            stopBtn.onclick = function() {
              mediaRecorder.stop();
              stream.getTracks().forEach(function(t) { t.stop(); });
            };
            
            saveBtn.onclick = function() {
              var name = videoNameInput.value.trim() || 'recording';
              var blob = new Blob(chunks, { type: 'video/webm' });
              var a = document.createElement('a');
              a.href = URL.createObjectURL(blob);
              a.download = name + '.webm';
              a.click();
              alert('Video downloaded! Close this window to return to the app.');
            };
          
          resetBtn.onclick = function() {
            location.reload();
          };
          
          // Close button is set up in separate IIFE at top
          
          })(); // End mainScript IIFE
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
