/**
 * Genie Spark - Smart Content Pipeline
 * "Ignite Your Ideas" - AI-powered content generation engine
 * Part of Genie Studio
 * 
 * Features session persistence, drafts management, and enhanced save/download
 */

import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Upload, 
  FileText, 
  Image as ImageIcon, 
  Mic, 
  Link, 
  Sparkles,
  Wand2,
  Loader2,
  CheckCircle,
  AlertCircle,
  X,
  Play,
  Film,
  BookOpen,
  Presentation,
  Layers,
  Video,
  Radio,
  GraduationCap,
  Search,
  Database,
  Save,
  RotateCcw,
  Clock,
  ChevronLeft
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { useDropzone } from 'react-dropzone';
import { AIProviderSelector, AIProviderType } from './AIProviderSelector';
import { ImageModelSelector, ImageModelType } from './ImageModelSelector';
import { PostGenerationActions, GeneratedContent, PostAction } from './PostGenerationActions';
import { FullPipelineWorkflow } from './FullPipelineWorkflow';
import { GenieSparkDraftsPanel } from './GenieSparkDraftsPanel';
import { useGenieSparkSession, type GenieSparkDraft } from './useGenieSparkSession';
import { ContentSafetyBanner, InlineContentNotice, UploadSafetyNotice } from './ContentSafetyBanner';
import { moderateTextContent, moderateFileUpload, moderateImagePrompt } from './ContentModerationService';
import { useTermsAcceptance } from './TermsAcceptanceModal';
import { useContentViolationWarning } from './ContentViolationWarning';
import { recordViolation, isUserRestricted } from '@/services/contentViolationTracker';
import genieSparkLogo from '@/assets/logos/genie-spark-combined.png';
import { urlToScriptService, ScriptOutputFormat as UrlScriptFormat } from '@/services/urlToScriptService';
import { documentToScriptService, OutputFormat as DocOutputFormat } from '@/services/documentToScriptService';
import { imageToScriptService, ScriptStyle } from '@/services/imageToScriptService';
import { audioToScriptService, ScriptOutputFormat as AudioScriptFormat } from '@/services/audioToScriptService';
import { videoToScriptService, SlideVoiceover } from '@/services/videoToScriptService';
import { PresentationScriptView } from './PresentationScriptView';
import { VideoContentAnalyzer, VideoAnalysisResult, VideoScriptOptions, DetectedContentType } from './VideoContentAnalyzer';
import { URLContentAnalyzer, URLAnalysisResult, URLScriptOptions, DetectedURLContentType } from './URLContentAnalyzer';
import { SlideScript } from './SlideScriptCard';
import { PresentationGeneratorPanel } from './presentation-generator';
import { 
  SegmentedScriptEditor, 
  SegmentedScriptData, 
  ScriptSegment,
  SourceType as SegmentSourceType,
  MediaContentType 
} from './segmented-editor';

// Content type options - now includes Presentation as a highlighted option
type ContentType = 'document' | 'image' | 'audio' | 'video' | 'url' | 'presentation' | 'full-pipeline';

interface ContentTypeOption {
  id: ContentType;
  label: string;
  description: string;
  icon: React.ReactNode;
  acceptedFiles: string;
  outputFormats: { value: string; label: string; icon: React.ReactNode }[];
  defaultTone: string;
  defaultDuration: number;
  isHighlighted?: boolean;
  badge?: string;
}

const CONTENT_TYPES: ContentTypeOption[] = [
  // PRESENTATION - Highlighted as primary option
  {
    id: 'presentation',
    label: 'Generate Presentation',
    description: 'AI-powered slides with rich content',
    icon: <Presentation className="h-4 w-4" />,
    acceptedFiles: '.pdf,.docx,.pptx,.txt,.md,.jpg,.jpeg,.png',
    outputFormats: [
      { value: 'presentation', label: 'Presentation Slides', icon: <Presentation className="h-4 w-4" /> },
      { value: 'marketing', label: 'Marketing Deck', icon: <Sparkles className="h-4 w-4" /> },
      { value: 'sales', label: 'Sales Pitch', icon: <Film className="h-4 w-4" /> },
      { value: 'training', label: 'Training Material', icon: <GraduationCap className="h-4 w-4" /> },
      { value: 'investor', label: 'Investor Deck', icon: <Layers className="h-4 w-4" /> },
    ],
    defaultTone: 'professional',
    defaultDuration: 300,
    isHighlighted: true,
    badge: 'NEW',
  },
  {
    id: 'document',
    label: 'Document → Script',
    description: 'PDF, DOCX, PPTX, TXT, MD',
    icon: <FileText className="h-4 w-4" />,
    acceptedFiles: '.pdf,.docx,.pptx,.txt,.md,.html,.rtf',
    outputFormats: [
      { value: 'video_script', label: 'Video Script', icon: <Film className="h-4 w-4" /> },
      { value: 'podcast_script', label: 'Podcast Script', icon: <Mic className="h-4 w-4" /> },
      { value: 'presentation_script', label: 'Presentation', icon: <Presentation className="h-4 w-4" /> },
      { value: 'webinar_script', label: 'Webinar Script', icon: <BookOpen className="h-4 w-4" /> },
      { value: 'tutorial_script', label: 'Tutorial Script', icon: <Play className="h-4 w-4" /> },
    ],
    defaultTone: 'professional',
    defaultDuration: 300,
  },
  {
    id: 'image',
    label: 'Image → Script',
    description: 'JPG, PNG, WebP, GIF or generate',
    icon: <ImageIcon className="h-4 w-4" />,
    acceptedFiles: '.jpg,.jpeg,.png,.webp,.gif,.svg',
    outputFormats: [
      { value: 'narration', label: 'Narration', icon: <Mic className="h-4 w-4" /> },
      { value: 'documentary', label: 'Documentary', icon: <Film className="h-4 w-4" /> },
      { value: 'commercial', label: 'Commercial', icon: <Sparkles className="h-4 w-4" /> },
      { value: 'educational', label: 'Educational', icon: <GraduationCap className="h-4 w-4" /> },
    ],
    defaultTone: 'informative',
    defaultDuration: 60,
  },
  {
    id: 'audio',
    label: 'Audio → Script',
    description: 'MP3, WAV, M4A (transcribe)',
    icon: <Mic className="h-4 w-4" />,
    acceptedFiles: '.mp3,.wav,.m4a,.ogg,.flac,.aac',
    outputFormats: [
      { value: 'transcript', label: 'Clean Transcript', icon: <FileText className="h-4 w-4" /> },
      { value: 'podcast_script', label: 'Podcast Format', icon: <Radio className="h-4 w-4" /> },
      { value: 'video_script', label: 'Video Script', icon: <Video className="h-4 w-4" /> },
    ],
    defaultTone: 'casual',
    defaultDuration: 600,
  },
  {
    id: 'video',
    label: 'Video → Script',
    description: 'MP4, MOV, WebM (extract & transcribe)',
    icon: <Video className="h-4 w-4" />,
    acceptedFiles: '.mp4,.mov,.webm,.avi,.mkv',
    outputFormats: [
      { value: 'video_script', label: 'Video Script', icon: <Film className="h-4 w-4" /> },
      { value: 'presentation_script', label: 'Slide-by-Slide', icon: <Presentation className="h-4 w-4" /> },
      { value: 'podcast_script', label: 'Podcast Script', icon: <Radio className="h-4 w-4" /> },
      { value: 'tutorial_script', label: 'Tutorial Script', icon: <GraduationCap className="h-4 w-4" /> },
    ],
    defaultTone: 'professional',
    defaultDuration: 300,
  },
  {
    id: 'url',
    label: 'URL → Script',
    description: 'Web pages, articles, online docs',
    icon: <Link className="h-4 w-4" />,
    acceptedFiles: '',
    outputFormats: [
      { value: 'video_script', label: 'Video Script', icon: <Film className="h-4 w-4" /> },
      { value: 'audio_script', label: 'Audio Script', icon: <Mic className="h-4 w-4" /> },
      { value: 'podcast_script', label: 'Podcast Script', icon: <Radio className="h-4 w-4" /> },
      { value: 'presentation_script', label: 'Presentation', icon: <Presentation className="h-4 w-4" /> },
      { value: 'tutorial_script', label: 'Tutorial', icon: <GraduationCap className="h-4 w-4" /> },
      { value: 'webinar_script', label: 'Webinar', icon: <BookOpen className="h-4 w-4" /> },
    ],
    defaultTone: 'informative',
    defaultDuration: 180,
  },
  {
    id: 'full-pipeline',
    label: 'Full Pipeline',
    description: 'Combine docs, images & audio into one script',
    icon: <Layers className="h-4 w-4" />,
    acceptedFiles: '.pdf,.docx,.pptx,.txt,.md,.jpg,.jpeg,.png,.webp,.mp3,.wav',
    outputFormats: [
      { value: 'video_script', label: 'Video Script', icon: <Film className="h-4 w-4" /> },
      { value: 'podcast_script', label: 'Podcast Script', icon: <Mic className="h-4 w-4" /> },
      { value: 'presentation_script', label: 'Presentation', icon: <Presentation className="h-4 w-4" /> },
    ],
    defaultTone: 'professional',
    defaultDuration: 600,
  },
];

const TONE_OPTIONS = [
  { value: 'professional', label: 'Professional' },
  { value: 'casual', label: 'Casual' },
  { value: 'educational', label: 'Educational' },
  { value: 'inspirational', label: 'Inspirational' },
  { value: 'dramatic', label: 'Dramatic' },
  { value: 'informative', label: 'Informative' },
];

const DURATION_OPTIONS = [
  { value: 30, label: '30 sec (~75 words)' },
  { value: 60, label: '1 min (~150 words)' },
  { value: 120, label: '2 min (~300 words)' },
  { value: 180, label: '3 min (~450 words)' },
  { value: 300, label: '5 min (~750 words)' },
  { value: 600, label: '10 min (~1500 words)' },
  { value: 900, label: '15 min (~2250 words)' },
  { value: 1800, label: '30 min (~4500 words)' },
];

interface DetectedFile {
  file: File;
  preview?: string;
}

interface SmartContentPipelineProps {
  onSendToScriptEditor?: (content: GeneratedContent) => void;
  onSendToVibe?: (content: GeneratedContent) => void;
  onSendToProductionHub?: (content: GeneratedContent) => void;
  onSaveToKnowledgeBase?: (content: GeneratedContent) => void;
  className?: string;
}

export function SmartContentPipeline({
  onSendToScriptEditor,
  onSendToVibe,
  onSendToProductionHub,
  onSaveToKnowledgeBase,
  className,
}: SmartContentPipelineProps) {
  // Session persistence hook
  const {
    sessionState,
    saveSession,
    clearSession,
    hasActiveSession,
    drafts,
    saveDraft,
    deleteDraft,
    exportDraft,
    isSaving: isDraftSaving,
  } = useGenieSparkSession();

  // Terms acceptance and violation warning hooks
  const { hasAccepted: termsAccepted, checkAndPrompt: checkTerms, TermsModal } = useTermsAcceptance();
  const { showWarning, WarningDialog } = useContentViolationWarning();

  // Active view tab (generate vs drafts)
  const [activeTab, setActiveTab] = useState<'generate' | 'drafts'>('generate');
  const [selectedDraft, setSelectedDraft] = useState<GenieSparkDraft | null>(null);

  // Content type selection - restore from session
  const [contentType, setContentType] = useState<ContentType>(
    (sessionState?.contentType as ContentType) || 'document'
  );
  const selectedContentType = CONTENT_TYPES.find(ct => ct.id === contentType)!;
  
  // Input state - restore from session
  const [uploadedFiles, setUploadedFiles] = useState<DetectedFile[]>([]);
  const [urlInput, setUrlInput] = useState(sessionState?.urlInput || '');
  const [imagePrompt, setImagePrompt] = useState(sessionState?.imagePrompt || '');
  const [generateImage, setGenerateImage] = useState(sessionState?.generateImage || false);
  
  // AI Provider - restore from session
  const [selectedProvider, setSelectedProvider] = useState<AIProviderType>(
    (sessionState?.selectedProvider as AIProviderType) || 'auto'
  );
  const [selectedImageModel, setSelectedImageModel] = useState<ImageModelType>(
    (sessionState?.selectedImageModel as ImageModelType) || 'auto'
  );
  
  // Knowledge Search enhancement
  const [enableKnowledgeSearch, setEnableKnowledgeSearch] = useState(
    sessionState?.enableKnowledgeSearch || false
  );
  
  // Script options - restore from session or use defaults
  const [outputFormat, setOutputFormat] = useState(
    sessionState?.outputFormat || selectedContentType.outputFormats[0]?.value || 'video_script'
  );
  const [tone, setTone] = useState(sessionState?.tone || selectedContentType.defaultTone);
  const [duration, setDuration] = useState(sessionState?.duration || selectedContentType.defaultDuration);
  const [targetAudience, setTargetAudience] = useState(sessionState?.targetAudience || '');
  
  // Processing state
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressMessage, setProgressMessage] = useState('');
  const [generatedContent, setGeneratedContent] = useState<GeneratedContent | null>(null);
  const [generatedSlides, setGeneratedSlides] = useState<SlideScript[] | null>(null);
  const [segmentedScriptData, setSegmentedScriptData] = useState<SegmentedScriptData | null>(null);
  const [showSegmentedEditor, setShowSegmentedEditor] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Video analysis state
  const [showVideoAnalyzer, setShowVideoAnalyzer] = useState(false);
  const [videoPreviewUrl, setVideoPreviewUrl] = useState<string | null>(null);
  
  // URL analysis state
  const [showURLAnalyzer, setShowURLAnalyzer] = useState(false);
  
  // Timer ref for cleanup
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const simulationTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Auto-save session state on changes
  useEffect(() => {
    saveSession({
      contentType,
      urlInput,
      imagePrompt,
      generateImage,
      selectedProvider,
      selectedImageModel,
      enableKnowledgeSearch,
      outputFormat,
      tone,
      duration,
      targetAudience,
      uploadedFileNames: uploadedFiles.map(f => f.file.name),
    });
  }, [contentType, urlInput, imagePrompt, generateImage, selectedProvider, selectedImageModel, 
      enableKnowledgeSearch, outputFormat, tone, duration, targetAudience, uploadedFiles, saveSession]);
  
  // Cleanup timers and object URLs on unmount
  useEffect(() => {
    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
      if (simulationTimeoutRef.current) {
        clearTimeout(simulationTimeoutRef.current);
      }
      // Revoke any object URLs to prevent memory leaks
      uploadedFiles.forEach(file => {
        if (file.preview) {
          URL.revokeObjectURL(file.preview);
        }
      });
    };
  }, [uploadedFiles]);

  // Update defaults when content type changes
  const handleContentTypeChange = (newType: ContentType) => {
    setContentType(newType);
    const newTypeConfig = CONTENT_TYPES.find(ct => ct.id === newType)!;
    setOutputFormat(newTypeConfig.outputFormats[0]?.value || 'video_script');
    setTone(newTypeConfig.defaultTone);
    setDuration(newTypeConfig.defaultDuration);
    setUploadedFiles([]);
    setUrlInput('');
    setImagePrompt('');
    setGenerateImage(false);
    setGeneratedContent(null);
    setSelectedDraft(null);
  };

  // File drop handler
  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newFiles: DetectedFile[] = acceptedFiles.map(file => {
      const isImage = file.type.startsWith('image/');
      const isVideo = file.type.startsWith('video/');
      const preview = isImage ? URL.createObjectURL(file) : undefined;
      return { file, preview };
    });
    
    setUploadedFiles(prev => [...prev, ...newFiles]);
    toast.success(`Uploaded ${newFiles.length} file(s)`);
    
    // If video content type and a video file uploaded, show analyzer
    if (contentType === 'video' && newFiles.length > 0 && newFiles[0].file.type.startsWith('video/')) {
      const videoUrl = URL.createObjectURL(newFiles[0].file);
      setVideoPreviewUrl(videoUrl);
      setShowVideoAnalyzer(true);
    }
  }, [contentType]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: selectedContentType.acceptedFiles ? 
      selectedContentType.acceptedFiles.split(',').reduce((acc, ext) => {
        const mimeType = ext === '.pdf' ? 'application/pdf' :
                        ext === '.docx' ? 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' :
                        ext === '.pptx' ? 'application/vnd.openxmlformats-officedocument.presentationml.presentation' :
                        ext.match(/\.(jpg|jpeg|png|gif|webp|svg)/) ? `image/${ext.replace('.', '')}` :
                        ext.match(/\.(mp3|wav|ogg|m4a|flac|aac)/) ? `audio/${ext.replace('.', '')}` :
                        `text/${ext.replace('.', '')}`;
        return { ...acc, [mimeType]: [ext] };
      }, {} as Record<string, string[]>) : undefined,
    multiple: contentType === 'full-pipeline',
    disabled: contentType === 'url',
  });

  const removeFile = (index: number) => {
    setUploadedFiles(prev => {
      const newFiles = [...prev];
      if (newFiles[index].preview) {
        URL.revokeObjectURL(newFiles[index].preview!);
      }
      newFiles.splice(index, 1);
      return newFiles;
    });
  };

  const handleGenerate = async () => {
    // Validate input based on content type
    if (contentType === 'url' && !urlInput.trim()) {
      toast.error('Please enter a URL');
      return;
    }
    if (contentType === 'image' && generateImage && !imagePrompt.trim()) {
      toast.error('Please enter an image prompt');
      return;
    }
    if (contentType !== 'url' && !generateImage && uploadedFiles.length === 0) {
      toast.error('Please upload a file');
      return;
    }

    setIsProcessing(true);
    setProgress(0);
    setError(null);
    setGeneratedContent(null);

    try {
      // Clear any existing interval
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
      
      progressIntervalRef.current = setInterval(() => {
        setProgress(prev => Math.min(prev + 5, 90));
        const messages = {
          'document': ['Extracting document content...', 'Analyzing structure...', 'Generating script...'],
          'image': ['Analyzing image...', 'Extracting visual details...', 'Creating narrative...'],
          'audio': ['Transcribing audio...', 'Processing speech...', 'Formatting script...'],
          'url': ['Crawling URL content...', 'Extracting key information...', 'Generating full script...', 'Enhancing with AI...'],
          'full-pipeline': ['Processing sources...', 'Orchestrating pipeline...', 'Synthesizing content...'],
        };
        const typeMessages = messages[contentType] || messages['document'];
        setProgressMessage(typeMessages[Math.floor(Math.random() * typeMessages.length)]);
      }, 1000);

      let content: GeneratedContent;

      // Use real service for URL content type
      if (contentType === 'url') {
        // Map AI provider selection to service format
        const aiProvider = selectedProvider === 'auto' ? 'gemini' : 
                          selectedProvider === 'claude' ? 'claude' : 
                          selectedProvider as 'openai' | 'claude' | 'gemini';
        
        const result = await urlToScriptService.convertUrlToScript({
          url: urlInput,
          outputFormat: outputFormat as UrlScriptFormat,
          duration: duration,
          tone: tone as 'professional' | 'casual' | 'educational' | 'inspirational' | 'dramatic',
          targetAudience: targetAudience || undefined,
          aiProvider: aiProvider as 'openai' | 'claude' | 'gemini',
          enhanceWithAI: true,
          useKnowledgeBase: enableKnowledgeSearch,
        });

        if (progressIntervalRef.current) {
          clearInterval(progressIntervalRef.current);
          progressIntervalRef.current = null;
        }

        if (!result.success || !result.script) {
          throw new Error(result.error || 'Failed to generate script from URL');
        }

        setProgress(100);
        setProgressMessage('Complete!');

        // Convert script scenes to text format
        const scriptText = result.script.scenes.map(scene => 
          `## Scene ${scene.sceneNumber}\n\n${scene.narration}\n\n${scene.visualDirection ? `**Visual Direction:** ${scene.visualDirection}\n` : ''}${scene.bRollSuggestions?.length ? `**B-Roll:** ${scene.bRollSuggestions.join(', ')}\n` : ''}`
        ).join('\n---\n\n');

        const fullScript = `# ${result.script.title}\n\n**Source:** ${result.script.sourceUrl}\n**Format:** ${result.script.format.replace('_', ' ')}\n**Duration:** ${Math.floor(result.script.totalDuration / 60)} minutes\n**Words:** ${result.script.metadata.wordCount}\n\n---\n\n${scriptText}`;

        content = {
          script: fullScript,
          title: result.script.title,
          type: outputFormat as GeneratedContent['type'],
          duration: result.script.totalDuration,
          sourceType: 'url',
          metadata: {
            wordCount: result.script.metadata.wordCount,
            estimatedDuration: result.script.totalDuration,
            provider: aiProvider,
            timestamp: Date.now(),
          },
        };
      } 
      // Use real service for DOCUMENT content type
      else if (contentType === 'document' && uploadedFiles.length > 0) {
        const file = uploadedFiles[0].file;
        
        // Read file content
        const fileContent = await readFileAsText(file);
        
        // Map output format
        const docFormat = outputFormat as DocOutputFormat;
        
        const result = await documentToScriptService.convertDocumentToScript({
          documentContent: fileContent,
          documentType: getDocumentType(file.name),
          outputFormat: docFormat,
          duration: duration,
          tone: tone as 'professional' | 'casual' | 'educational' | 'inspirational' | 'dramatic' | 'informative',
          targetAudience: targetAudience || undefined,
          enhanceWithAI: true,
          useKnowledgeBase: enableKnowledgeSearch,
        });

        if (progressIntervalRef.current) {
          clearInterval(progressIntervalRef.current);
          progressIntervalRef.current = null;
        }

        if (!result.success || !result.script) {
          throw new Error(result.error || 'Failed to generate script from document');
        }

        setProgress(100);
        setProgressMessage('Complete!');

        // Convert script scenes to text format
        const scriptText = result.script.scenes.map(scene => 
          `## Scene ${scene.sceneNumber}\n\n${scene.narration}\n\n${scene.visualDirection ? `**Visual Direction:** ${scene.visualDirection}\n` : ''}${scene.bRollSuggestions?.length ? `**B-Roll:** ${scene.bRollSuggestions.join(', ')}\n` : ''}`
        ).join('\n---\n\n');

        const fullScript = `# ${result.script.title}\n\n**Source:** ${file.name}\n**Format:** ${result.script.format.replace('_', ' ')}\n**Duration:** ${Math.floor(result.script.totalDuration / 60)} minutes\n**Words:** ${result.script.metadata.wordCount}\n\n---\n\n${scriptText}`;

        content = {
          script: fullScript,
          title: result.script.title,
          type: outputFormat as GeneratedContent['type'],
          duration: result.script.totalDuration,
          sourceType: 'document',
          metadata: {
            wordCount: result.script.metadata.wordCount,
            estimatedDuration: result.script.totalDuration,
            provider: selectedProvider,
            timestamp: Date.now(),
          },
        };
      }
      // Use real service for IMAGE content type
      else if (contentType === 'image') {
        const imageUrl = uploadedFiles[0]?.preview;
        const prompt = generateImage ? imagePrompt : 'Analyze this image';
        
        // Map script style from output format
        const scriptStyle = outputFormat as ScriptStyle;
        
        const result = await imageToScriptService.generateImageAndScript({
          imagePrompt: prompt,
          existingImageUrl: !generateImage ? imageUrl : undefined,
          scriptStyle: scriptStyle,
          duration: duration,
          tone: tone as 'professional' | 'casual' | 'dramatic' | 'informative' | 'educational' | 'inspirational',
          targetAudience: targetAudience || undefined,
          imageProvider: 'gemini',
        });

        if (progressIntervalRef.current) {
          clearInterval(progressIntervalRef.current);
          progressIntervalRef.current = null;
        }

        if (!result.success || !result.script) {
          throw new Error(result.error || 'Failed to generate script from image');
        }

        setProgress(100);
        setProgressMessage('Complete!');

        // Convert segments to text format
        const scriptText = result.script.segments.map((segment, idx) => 
          `## ${segment.type.charAt(0).toUpperCase() + segment.type.slice(1)} (${idx + 1})\n\n${segment.text}\n\n**Visual Notes:** ${segment.visualNotes}`
        ).join('\n---\n\n');

        const fullScript = `# ${result.script.title}\n\n**Image:** ${result.imageDescription || 'Generated'}\n**Duration:** ${Math.floor(result.script.totalDuration / 60)} minutes\n\n---\n\n${scriptText}`;

        content = {
          script: fullScript,
          title: result.script.title,
          type: outputFormat as GeneratedContent['type'],
          duration: result.script.totalDuration,
          sourceType: 'image',
          metadata: {
            wordCount: fullScript.split(/\s+/).length,
            estimatedDuration: result.script.totalDuration,
            provider: result.metadata?.imageProvider || 'gemini',
            timestamp: Date.now(),
          },
        };
      }
      // Use real service for AUDIO content type
      else if (contentType === 'audio' && uploadedFiles.length > 0) {
        const file = uploadedFiles[0].file;
        
        // Convert file to base64
        const audioBase64 = await readFileAsBase64(file);
        
        // Map output format
        const audioFormat = (outputFormat === 'transcript' ? 'meeting_notes' : outputFormat) as AudioScriptFormat;
        
        const result = await audioToScriptService.convertAudioToScript({
          audioSource: 'file',
          audioBase64: audioBase64,
          outputFormat: audioFormat,
          duration: duration,
          tone: tone as 'professional' | 'casual' | 'educational' | 'documentary',
          targetAudience: targetAudience || undefined,
          enhanceWithAI: true,
          removeFillerWords: true,
          structureContent: true,
          aiProvider: selectedProvider === 'auto' ? 'gemini' : selectedProvider as 'openai' | 'claude' | 'gemini',
        });

        if (progressIntervalRef.current) {
          clearInterval(progressIntervalRef.current);
          progressIntervalRef.current = null;
        }

        if (!result.success || !result.script) {
          throw new Error(result.error || 'Failed to generate script from audio');
        }

        setProgress(100);
        setProgressMessage('Complete!');

        // Convert scenes to text format
        const scriptText = result.script.scenes.map(scene => 
          `## Scene ${scene.sceneNumber}${scene.speaker ? ` - ${scene.speaker}` : ''}\n\n${scene.narration}\n\n${scene.visualDirection ? `**Visual Direction:** ${scene.visualDirection}\n` : ''}`
        ).join('\n---\n\n');

        const fullScript = `# ${result.script.title}\n\n**Source:** ${file.name}\n**Format:** ${result.script.format.replace('_', ' ')}\n**Duration:** ${Math.floor(result.script.totalDuration / 60)} minutes\n**Words:** ${result.script.metadata.wordCount}\n\n---\n\n${scriptText}`;

        content = {
          script: fullScript,
          title: result.script.title,
          type: outputFormat as GeneratedContent['type'],
          duration: result.script.totalDuration,
          sourceType: 'audio',
          metadata: {
            wordCount: result.script.metadata.wordCount,
            estimatedDuration: result.script.totalDuration,
            provider: result.metadata?.aiProvider || 'gemini',
            timestamp: Date.now(),
          },
        };
      }
      // Use video service for VIDEO content type
      else if (contentType === 'video' && uploadedFiles.length > 0) {
        const file = uploadedFiles[0].file;
        
        const generateSlideBySlide = outputFormat === 'presentation_script';
        
        const result = await videoToScriptService.convertVideoToScript({
          videoFile: file,
          outputFormat: outputFormat as 'video_script' | 'podcast_script' | 'presentation_script' | 'tutorial_script',
          generateSlideBySlide,
          enhanceWithAI: true,
          removeFillerWords: true,
          tone: tone as 'professional' | 'casual' | 'educational' | 'inspirational' | 'dramatic',
          targetAudience: targetAudience || undefined,
        });

        if (progressIntervalRef.current) {
          clearInterval(progressIntervalRef.current);
          progressIntervalRef.current = null;
        }

        if (!result.success || !result.script) {
          throw new Error(result.error || 'Failed to generate script from video');
        }

        setProgress(100);
        setProgressMessage('Complete!');

        // Convert scenes to text format
        const scriptText = result.script.scenes.map(scene => 
          `## Scene ${scene.sceneNumber}\n\n${scene.narration}\n\n${scene.visualDirection ? `**Visual Direction:** ${scene.visualDirection}\n` : ''}`
        ).join('\n---\n\n');

        const fullScript = `# ${result.script.title}\n\n**Source:** ${file.name}\n**Format:** ${result.script.format.replace('_', ' ')}\n**Duration:** ${Math.floor(result.script.totalDuration / 60)} minutes\n**Words:** ${result.script.metadata.wordCount}\n\n---\n\n${scriptText}`;

        // Convert slides to SlideScript format if available
        const slides = result.slides?.map(slide => ({
          slideNumber: slide.slideNumber,
          title: slide.title,
          narration: slide.narration,
          visualNotes: slide.visualNotes,
          duration: slide.duration,
          wordCount: slide.wordCount,
        }));

        content = {
          script: fullScript,
          title: result.script.title,
          type: outputFormat as GeneratedContent['type'],
          duration: result.script.totalDuration,
          sourceType: 'video',
          slides,
          metadata: {
            wordCount: result.script.metadata.wordCount,
            estimatedDuration: result.script.totalDuration,
            provider: 'gemini',
            timestamp: Date.now(),
          },
        };
      }
      // Fallback for any edge cases
      else {
        throw new Error('Please provide valid input for the selected content type');
      }

      setGeneratedContent(content);
      toast.success('Script generated successfully!');
    } catch (err) {
      console.error('Generation error:', err);
      setError(err instanceof Error ? err.message : 'An error occurred during generation');
      toast.error(err instanceof Error ? err.message : 'Generation failed. Please try again.');
    } finally {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }
      setIsProcessing(false);
    }
  };

  // Helper function to read file as text
  const readFileAsText = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsText(file);
    });
  };

  // Helper function to read file as base64
  const readFileAsBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        // Remove data URL prefix (e.g., "data:audio/mp3;base64,")
        const base64 = result.split(',')[1] || result;
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  // Helper function to determine document type from filename
  const getDocumentType = (filename: string): 'pdf' | 'docx' | 'pptx' | 'txt' | 'md' | 'html' => {
    const ext = filename.toLowerCase().split('.').pop();
    switch (ext) {
      case 'pdf': return 'pdf';
      case 'docx': return 'docx';
      case 'pptx': return 'pptx';
      case 'md': return 'md';
      case 'html': return 'html';
      default: return 'txt';
    }
  };

  const handlePostAction = async (action: PostAction) => {
    if (!generatedContent) return;

    switch (action) {
      case 'download':
        const blob = new Blob([generatedContent.script], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${generatedContent.title?.replace(/[^a-z0-9]/gi, '_') || 'script'}.txt`;
        a.click();
        URL.revokeObjectURL(url);
        toast.success('Script downloaded!');
        break;
        
      case 'script-editor':
        // Save as draft before sending
        await saveDraft(generatedContent);
        onSendToScriptEditor?.(generatedContent);
        toast.success('Sent to Script Editor');
        break;
        
      case 'vibe':
        // Save as draft before sending
        await saveDraft(generatedContent);
        onSendToVibe?.(generatedContent);
        toast.success('Sent to Vibe Recording');
        break;
        
      case 'production-hub':
        // Save as draft before sending to Production Hub
        await saveDraft(generatedContent);
        onSendToProductionHub?.(generatedContent);
        toast.success('Sent to Production Hub');
        break;
        
      case 'knowledge-base':
        onSaveToKnowledgeBase?.(generatedContent);
        toast.success('Saved to Knowledge Base');
        break;
    }
  };

  // Save generated content as draft
  const handleSaveToDrafts = async () => {
    if (!generatedContent) return;
    await saveDraft(generatedContent);
  };

  // Handle draft selection
  const handleSelectDraft = (draft: GenieSparkDraft) => {
    setSelectedDraft(draft);
    setActiveTab('drafts');
  };

  // Convert draft to GeneratedContent for actions
  const draftToContent = (draft: GenieSparkDraft): GeneratedContent => ({
    script: draft.content,
    title: draft.title,
    type: draft.type,
    duration: draft.duration,
    sourceType: draft.sourceType,
    metadata: draft.metadata,
  });

  // Send draft to script editor
  const handleDraftToEditor = (draft: GenieSparkDraft) => {
    onSendToScriptEditor?.(draftToContent(draft));
  };

  // Send draft to vibe
  const handleDraftToVibe = (draft: GenieSparkDraft) => {
    onSendToVibe?.(draftToContent(draft));
  };

  const resetPipeline = () => {
    setUploadedFiles([]);
    setUrlInput('');
    setImagePrompt('');
    setGeneratedContent(null);
    setGeneratedSlides(null);
    setSegmentedScriptData(null);
    setShowSegmentedEditor(false);
    setSelectedDraft(null);
    setError(null);
    setProgress(0);
    setShowVideoAnalyzer(false);
    setShowURLAnalyzer(false);
    if (videoPreviewUrl) {
      URL.revokeObjectURL(videoPreviewUrl);
      setVideoPreviewUrl(null);
    }
  };

  // Convert slides/scenes to SegmentedScriptData
  const createSegmentedData = (
    content: GeneratedContent, 
    slides?: SlideScript[],
    detectedType?: string,
    scriptFormat?: string
  ): SegmentedScriptData | null => {
    if (!slides || slides.length === 0) return null;

    const segments: ScriptSegment[] = slides.map((slide, index) => ({
      id: `segment-${index + 1}`,
      segmentNumber: slide.slideNumber,
      type: scriptFormat?.includes('slide') ? 'slide' : 
            scriptFormat?.includes('chapter') ? 'chapter' : 'scene',
      title: slide.title,
      narration: slide.narration,
      visualNotes: slide.visualNotes,
      duration: slide.duration,
      wordCount: slide.wordCount,
    }));

    const sourceType: SegmentSourceType = content.sourceType as SegmentSourceType;
    const mediaType: MediaContentType = detectedType as MediaContentType || 'general';

    return {
      id: `script-${Date.now()}`,
      title: content.title || 'Untitled Script',
      sourceType,
      mediaContentType: mediaType,
      segments,
      totalDuration: content.duration || segments.reduce((sum, s) => sum + s.duration, 0),
      totalWordCount: content.metadata?.wordCount || segments.reduce((sum, s) => sum + s.wordCount, 0),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      sourceUrl: content.sourceType === 'url' ? urlInput : undefined,
      sourceFilename: uploadedFiles[0]?.file?.name,
      detectedType,
      scriptFormat,
    };
  };

  // Handle opening segmented editor
  const handleOpenSegmentedEditor = () => {
    if (generatedContent && generatedSlides) {
      const segData = createSegmentedData(
        generatedContent, 
        generatedSlides,
        generatedContent.type,
        outputFormat
      );
      if (segData) {
        setSegmentedScriptData(segData);
        setShowSegmentedEditor(true);
      }
    }
  };

  // Handle segmented script update
  const handleSegmentedScriptUpdate = (data: SegmentedScriptData) => {
    setSegmentedScriptData(data);
  };

  // Handle segmented script save
  const handleSegmentedScriptSave = async (data: SegmentedScriptData) => {
    // Convert back to GeneratedContent for saving
    const script = data.segments.map(s => 
      `## ${s.type.charAt(0).toUpperCase() + s.type.slice(1)} ${s.segmentNumber}${s.title ? `: ${s.title}` : ''}\n\n${s.narration}${s.visualNotes ? `\n\n**Visual:** ${s.visualNotes}` : ''}`
    ).join('\n\n---\n\n');

    const updatedContent: GeneratedContent = {
      ...generatedContent!,
      script: `# ${data.title}\n\n${script}`,
      title: data.title,
      duration: data.totalDuration,
      metadata: {
        ...generatedContent?.metadata,
        wordCount: data.totalWordCount,
      },
    };

    setGeneratedContent(updatedContent);
    await saveDraft(updatedContent);
    toast.success('Script saved');
  };

  // Handle video analysis complete
  const handleVideoAnalysisComplete = async (
    analysisResult: VideoAnalysisResult,
    selectedFormat: string,
    options: VideoScriptOptions
  ) => {
    setShowVideoAnalyzer(false);
    
    if (uploadedFiles.length === 0) {
      toast.error('No video file found');
      return;
    }

    setIsProcessing(true);
    setProgress(0);
    setError(null);

    try {
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 5, 90));
        setProgressMessage('Processing video and generating script...');
      }, 1000);

      const file = uploadedFiles[0].file;
      const generateSlideBySlide = selectedFormat === 'slide_by_slide' || options.generateSlideBySlide;

      const result = await videoToScriptService.convertVideoToScript({
        videoFile: file,
        outputFormat: selectedFormat === 'slide_by_slide' ? 'presentation_script' : 
                      selectedFormat === 'podcast_style' ? 'podcast_script' :
                      selectedFormat === 'chapter_based' ? 'tutorial_script' : 'video_script',
        generateSlideBySlide,
        enhanceWithAI: options.enhanceWithAI,
        removeFillerWords: options.removeFillerWords,
        tone: tone as 'professional' | 'casual' | 'educational' | 'inspirational' | 'dramatic',
        targetAudience: targetAudience || undefined,
      });

      clearInterval(progressInterval);

      if (!result.success || !result.script) {
        throw new Error(result.error || 'Failed to generate script from video');
      }

      setProgress(100);
      setProgressMessage('Complete!');

      // Format script based on detected type
      const scriptText = result.script.scenes.map(scene => 
        `## Scene ${scene.sceneNumber}\n\n${scene.narration}\n\n${scene.visualDirection ? `**Visual Direction:** ${scene.visualDirection}\n` : ''}`
      ).join('\n---\n\n');

      const fullScript = `# ${result.script.title}\n\n**Source:** ${file.name}\n**Detected Type:** ${analysisResult.detectedType}\n**Format:** ${result.script.format.replace('_', ' ')}\n**Duration:** ${Math.floor(result.script.totalDuration / 60)} minutes\n**Words:** ${result.script.metadata.wordCount}\n\n---\n\n${scriptText}`;

      // Convert slides if available
      const slides = result.slides?.map(slide => ({
        slideNumber: slide.slideNumber,
        title: slide.title,
        narration: slide.narration,
        visualNotes: slide.visualNotes,
        duration: slide.duration,
        wordCount: slide.wordCount,
      }));

      if (slides && slides.length > 0) {
        setGeneratedSlides(slides);
      }

      const content: GeneratedContent = {
        script: fullScript,
        title: result.script.title,
        type: result.script.format as GeneratedContent['type'],
        duration: result.script.totalDuration,
        sourceType: 'video',
        slides,
        metadata: {
          wordCount: result.script.metadata.wordCount,
          estimatedDuration: result.script.totalDuration,
          provider: 'gemini',
          timestamp: Date.now(),
        },
      };

      setGeneratedContent(content);
      await saveDraft(content);
      toast.success('Script generated successfully!');

      // Auto-generate TTS if requested
      if (options.generateTTS) {
        toast.info('TTS generation will be available in the script view');
      }
    } catch (err) {
      console.error('Video processing error:', err);
      setError(err instanceof Error ? err.message : 'Processing failed');
      toast.error(err instanceof Error ? err.message : 'Video processing failed');
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle URL analysis complete
  const handleURLAnalysisComplete = async (
    analysisResult: URLAnalysisResult,
    selectedFormat: string,
    options: URLScriptOptions
  ) => {
    setShowURLAnalyzer(false);
    
    if (!urlInput.trim()) {
      toast.error('No URL provided');
      return;
    }

    setIsProcessing(true);
    setProgress(0);
    setError(null);

    try {
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 5, 90));
        setProgressMessage('Processing URL content and generating script...');
      }, 1000);

      // Map AI provider selection to service format
      const aiProvider = selectedProvider === 'auto' ? 'gemini' : 
                        selectedProvider === 'claude' ? 'claude' : 
                        selectedProvider as 'openai' | 'claude' | 'gemini';
      
      const result = await urlToScriptService.convertUrlToScript({
        url: urlInput,
        outputFormat: selectedFormat as UrlScriptFormat,
        duration: duration,
        tone: tone as 'professional' | 'casual' | 'educational' | 'inspirational' | 'dramatic',
        targetAudience: targetAudience || undefined,
        aiProvider: aiProvider as 'openai' | 'claude' | 'gemini',
        enhanceWithAI: options.enhanceWithAI,
        useKnowledgeBase: enableKnowledgeSearch,
      });

      clearInterval(progressInterval);

      if (!result.success || !result.script) {
        throw new Error(result.error || 'Failed to generate script from URL');
      }

      setProgress(100);
      setProgressMessage('Complete!');

      // Format script based on detected type and options
      let scriptText = result.script.scenes.map(scene => {
        let sceneContent = `## Scene ${scene.sceneNumber}\n\n${scene.narration}\n`;
        if (options.addVisualCues && scene.visualDirection) {
          sceneContent += `\n**Visual Direction:** ${scene.visualDirection}\n`;
        }
        if (options.addVisualCues && scene.bRollSuggestions?.length) {
          sceneContent += `**B-Roll:** ${scene.bRollSuggestions.join(', ')}\n`;
        }
        return sceneContent;
      }).join('\n---\n\n');

      // Add key points if enabled
      if (options.extractKeyPoints && analysisResult.keyTopics.length > 0) {
        scriptText = `## Key Points\n\n${analysisResult.keyTopics.map(t => `- ${t}`).join('\n')}\n\n---\n\n` + scriptText;
      }

      // Add call to action if enabled
      if (options.includeCallToAction) {
        scriptText += `\n---\n\n## Call to Action\n\n[Insert your call to action here based on the ${analysisResult.detectedType} content]\n`;
      }

      const fullScript = `# ${result.script.title}\n\n**Source:** ${result.script.sourceUrl}\n**Content Type:** ${analysisResult.detectedType.replace('_', ' ')}\n**Format:** ${selectedFormat.replace('_', ' ')}\n**Duration:** ${Math.floor(result.script.totalDuration / 60)} minutes\n**Words:** ${result.script.metadata.wordCount}\n\n---\n\n${scriptText}`;

      const content: GeneratedContent = {
        script: fullScript,
        title: result.script.title,
        type: selectedFormat as GeneratedContent['type'],
        duration: result.script.totalDuration,
        sourceType: 'url',
        metadata: {
          wordCount: result.script.metadata.wordCount,
          estimatedDuration: result.script.totalDuration,
          provider: aiProvider,
          timestamp: Date.now(),
        },
      };

      setGeneratedContent(content);
      await saveDraft(content);
      toast.success('Script generated successfully!');

      // Auto-generate TTS if requested
      if (options.generateTTS) {
        toast.info('TTS generation will be available in the script view');
      }
    } catch (err) {
      console.error('URL processing error:', err);
      setError(err instanceof Error ? err.message : 'Processing failed');
      toast.error(err instanceof Error ? err.message : 'URL processing failed');
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle Full Pipeline completion
  const handlePipelineComplete = async (result: { 
    script: string; 
    title: string;
    segments?: Array<{
      segmentNumber: number;
      title: string;
      narration: string;
      visualNotes?: string;
      duration: number;
      wordCount: number;
    }>;
  }) => {
    // Convert pipeline segments to SlideScript format for consistency
    const slides: SlideScript[] | undefined = result.segments?.map(seg => ({
      slideNumber: seg.segmentNumber,
      title: seg.title,
      narration: seg.narration,
      visualNotes: seg.visualNotes,
      duration: seg.duration,
      wordCount: seg.wordCount,
    }));

    const content: GeneratedContent = {
      script: result.script,
      title: result.title,
      type: 'video_script',
      duration: duration,
      sourceType: 'full-pipeline',
      slides,
      metadata: {
        wordCount: result.script.split(/\s+/).length,
        estimatedDuration: duration,
        provider: selectedProvider,
        timestamp: Date.now(),
      },
    };
    
    if (slides && slides.length > 0) {
      setGeneratedSlides(slides);
    }
    
    setGeneratedContent(content);
    // Auto-save to drafts
    await saveDraft(content);
  };

  // Show Segmented Script Editor if enabled
  if (showSegmentedEditor && segmentedScriptData) {
    return (
      <div className={cn("space-y-6", className)}>
        {/* Back button */}
        <div className="flex items-center justify-between">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => setShowSegmentedEditor(false)}
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back to Overview
          </Button>
          <Badge variant="outline" className="text-xs">
            <Clock className="h-3 w-3 mr-1" />
            {isDraftSaving ? 'Saving...' : 'Auto-saved'}
          </Badge>
        </div>

        <SegmentedScriptEditor
          scriptData={segmentedScriptData}
          onScriptUpdate={handleSegmentedScriptUpdate}
          onSave={handleSegmentedScriptSave}
          onExport={(format) => {
            const blob = new Blob([generatedContent?.script || ''], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${segmentedScriptData.title.replace(/[^a-z0-9]/gi, '_')}.${format}`;
            a.click();
            URL.revokeObjectURL(url);
            toast.success('Script exported');
          }}
        />
      </div>
    );
  }

  // Show post-generation actions if we have generated content
  if (generatedContent) {
    const hasSegments = generatedSlides && generatedSlides.length > 0;
    
    return (
      <div className={cn("space-y-6", className)}>
        {/* Session indicator */}
        {hasActiveSession && (
          <div className="flex items-center justify-between p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
            <div className="flex items-center gap-2 text-sm text-amber-600">
              <CheckCircle className="h-4 w-4" />
              <span>Script generated and auto-saved to drafts</span>
            </div>
            <Badge variant="outline" className="text-xs">
              <Clock className="h-3 w-3 mr-1" />
              {isDraftSaving ? 'Saving...' : 'Saved'}
            </Badge>
          </div>
        )}

        {/* Segmented Editor Option - Show when slides are available */}
        {hasSegments && (
          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Layers className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-medium text-sm">Segmented Script Available</h4>
                    <p className="text-xs text-muted-foreground">
                      {generatedSlides!.length} segments detected • Edit individually with TTS & AI
                    </p>
                  </div>
                </div>
                <Button size="sm" onClick={handleOpenSegmentedEditor}>
                  <Wand2 className="h-4 w-4 mr-1" />
                  Open Segment Editor
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
        
        <PostGenerationActions
          content={generatedContent}
          onAction={handlePostAction}
        />
        
        <div className="flex gap-3">
          <Button variant="outline" onClick={resetPipeline} className="flex-1">
            <RotateCcw className="h-4 w-4 mr-2" />
            Generate Another Script
          </Button>
          <Button 
            variant="secondary" 
            onClick={() => setActiveTab('drafts')}
            className="flex-1"
          >
            <FileText className="h-4 w-4 mr-2" />
            View All Drafts ({drafts.length})
          </Button>
        </div>
      </div>
    );
  }

  // Show Video Content Analyzer for video type with uploaded file
  if (contentType === 'video' && showVideoAnalyzer && uploadedFiles.length > 0) {
    return (
      <div className={cn("space-y-6", className)}>
        {/* Content Type Selector */}
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <Label className="text-sm font-semibold">Content Type</Label>
              <Select value={contentType} onValueChange={(v) => handleContentTypeChange(v as ContentType)}>
                <SelectTrigger className="w-full">
                  <SelectValue>
                    <div className="flex items-center gap-2">
                      {selectedContentType.icon}
                      <span>{selectedContentType.label}</span>
                      <Badge variant="secondary" className="text-[10px] ml-2">
                        {selectedContentType.description}
                      </Badge>
                    </div>
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {CONTENT_TYPES.map((ct) => (
                    <SelectItem key={ct.id} value={ct.id}>
                      <div className="flex items-center gap-3 py-1">
                        <div className="h-8 w-8 rounded-lg bg-secondary flex items-center justify-center">
                          {ct.icon}
                        </div>
                        <div>
                          <div className="font-medium">{ct.label}</div>
                          <div className="text-xs text-muted-foreground">{ct.description}</div>
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <VideoContentAnalyzer
          videoFile={uploadedFiles[0].file}
          videoPreviewUrl={videoPreviewUrl || undefined}
          onAnalysisComplete={handleVideoAnalysisComplete}
          onCancel={() => {
            setShowVideoAnalyzer(false);
            setUploadedFiles([]);
            if (videoPreviewUrl) {
              URL.revokeObjectURL(videoPreviewUrl);
              setVideoPreviewUrl(null);
            }
          }}
        />
      </div>
    );
  }

  // Show URL Content Analyzer for URL type with smart analysis
  if (contentType === 'url' && showURLAnalyzer && urlInput.trim()) {
    return (
      <div className={cn("space-y-6", className)}>
        {/* Content Type Selector */}
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <Label className="text-sm font-semibold">Content Type</Label>
              <Select value={contentType} onValueChange={(v) => handleContentTypeChange(v as ContentType)}>
                <SelectTrigger className="w-full">
                  <SelectValue>
                    <div className="flex items-center gap-2">
                      {selectedContentType.icon}
                      <span>{selectedContentType.label}</span>
                      <Badge variant="secondary" className="text-[10px] ml-2">
                        {selectedContentType.description}
                      </Badge>
                    </div>
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {CONTENT_TYPES.map((ct) => (
                    <SelectItem key={ct.id} value={ct.id}>
                      <div className="flex items-center gap-3 py-1">
                        <div className="h-8 w-8 rounded-lg bg-secondary flex items-center justify-center">
                          {ct.icon}
                        </div>
                        <div>
                          <div className="font-medium">{ct.label}</div>
                          <div className="text-xs text-muted-foreground">{ct.description}</div>
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <URLContentAnalyzer
          url={urlInput}
          onAnalysisComplete={handleURLAnalysisComplete}
          onCancel={() => {
            setShowURLAnalyzer(false);
          }}
        />
      </div>
    );
  }

  // Show Presentation Script View if we have generated slides
  if (generatedContent && generatedSlides && generatedSlides.length > 0) {
    return (
      <div className={cn("space-y-6", className)}>
        <PresentationScriptView
          title={generatedContent.title || 'Generated Presentation Script'}
          slides={generatedSlides}
          sourceType={generatedContent.sourceType === 'video' ? 'video' : 'pptx'}
          onSlidesUpdate={(updatedSlides) => setGeneratedSlides(updatedSlides)}
        />
        
        <div className="flex gap-3">
          <Button variant="outline" onClick={resetPipeline} className="flex-1">
            <RotateCcw className="h-4 w-4 mr-2" />
            Generate Another Script
          </Button>
          <Button 
            variant="secondary"
            onClick={() => onSendToScriptEditor?.(generatedContent)}
            className="flex-1"
          >
            <FileText className="h-4 w-4 mr-2" />
            Send to Script Editor
          </Button>
        </div>
      </div>
    );
  }

  // Show Full Pipeline Workflow for full-pipeline content type
  if (contentType === 'full-pipeline') {
    return (
      <div className={cn("space-y-6", className)}>
        {/* Content Type Selector - Always visible for switching */}
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <Label className="text-sm font-semibold">Content Type</Label>
              <Select value={contentType} onValueChange={(v) => handleContentTypeChange(v as ContentType)}>
                <SelectTrigger className="w-full">
                  <SelectValue>
                    <div className="flex items-center gap-2">
                      {selectedContentType.icon}
                      <span>{selectedContentType.label}</span>
                      <Badge variant="secondary" className="text-[10px] ml-2">
                        {selectedContentType.description}
                      </Badge>
                    </div>
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {CONTENT_TYPES.map((ct) => (
                    <SelectItem key={ct.id} value={ct.id}>
                      <div className="flex items-center gap-3 py-1">
                        <div className="h-8 w-8 rounded-lg bg-secondary flex items-center justify-center">
                          {ct.icon}
                        </div>
                        <div>
                          <div className="font-medium">{ct.label}</div>
                          <div className="text-xs text-muted-foreground">{ct.description}</div>
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
        
        <FullPipelineWorkflow
          onComplete={handlePipelineComplete}
          onCancel={() => handleContentTypeChange('document')}
        />
      </div>
    );
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Terms Acceptance Modal */}
      {TermsModal}
      
      {/* Violation Warning Dialog */}
      {WarningDialog}

      {/* Session persistence indicator */}
      {hasActiveSession && (
        <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/50 border">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>Session auto-saved • Your progress is preserved</span>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => {
              clearSession();
              resetPipeline();
              toast.success('Session cleared');
            }}
          >
            <RotateCcw className="h-4 w-4 mr-1" />
            Reset
          </Button>
        </div>
      )}

      {/* Tabs for Generate vs Drafts */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'generate' | 'drafts')}>
        <TabsList className="w-full grid grid-cols-2">
          <TabsTrigger value="generate" className="gap-2">
            <Wand2 className="h-4 w-4" />
            Generate New
          </TabsTrigger>
          <TabsTrigger value="drafts" className="gap-2">
            <FileText className="h-4 w-4" />
            Drafts ({drafts.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="drafts" className="mt-4">
          <GenieSparkDraftsPanel
            drafts={drafts}
            onSelectDraft={handleSelectDraft}
            onDeleteDraft={deleteDraft}
            onExportDraft={exportDraft}
            onSendToEditor={handleDraftToEditor}
            onSendToVibe={handleDraftToVibe}
            selectedDraftId={selectedDraft?.id}
          />
          
          {/* Selected Draft Preview */}
          {selectedDraft && (
            <Card className="mt-4 border-primary/30">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">{selectedDraft.title}</CardTitle>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setSelectedDraft(null)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <CardDescription>
                  {selectedDraft.metadata?.wordCount || 0} words • 
                  ~{Math.ceil((selectedDraft.duration || 0) / 60)} min
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="max-h-[300px] overflow-y-auto p-4 rounded-lg bg-muted/50 border">
                  <pre className="whitespace-pre-wrap text-sm font-mono">
                    {selectedDraft.content}
                  </pre>
                </div>
                <div className="flex gap-2">
                  <Button 
                    onClick={() => handleDraftToEditor(selectedDraft)} 
                    className="flex-1"
                  >
                    <Sparkles className="h-4 w-4 mr-2" />
                    Open in Script Editor
                  </Button>
                  <Button 
                    variant="secondary"
                    onClick={() => handleDraftToVibe(selectedDraft)}
                    className="flex-1"
                  >
                    <Mic className="h-4 w-4 mr-2" />
                    Send to Vibe
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => exportDraft(selectedDraft.id)}
                  >
                    <Save className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="generate" className="mt-4">
          <Card className="border-amber-500/20 bg-gradient-to-br from-background via-background to-amber-500/5">
            <CardHeader className="pb-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <img src={genieSparkLogo} alt="Genie Spark" className="h-12 w-auto" />
                </div>
                <Badge variant="secondary" className="bg-amber-500/10 text-amber-600 border-amber-500/20">
                  AI Engine
                </Badge>
              </div>
              <CardDescription className="mt-2">
                Select content type → Upload → Configure → Generate Script
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
          {/* Content Safety Notice */}
          <ContentSafetyBanner variant="compact" />
          {/* Step 1: Content Type Selection - Visual Grid with Highlighted Option */}
          <div className="space-y-3">
            <Label className="text-sm font-semibold">1. Select Content Type</Label>
            
            {/* Highlighted Presentation Option */}
            <div 
              onClick={() => handleContentTypeChange('presentation')}
              className={cn(
                "p-4 rounded-xl border-2 cursor-pointer transition-all",
                contentType === 'presentation' 
                  ? "border-primary bg-primary/10 ring-2 ring-primary/30"
                  : "border-amber-500/50 bg-gradient-to-r from-amber-500/10 to-orange-500/10 hover:border-amber-500 hover:shadow-md"
              )}
            >
              <div className="flex items-center gap-4">
                <div className={cn(
                  "h-12 w-12 rounded-xl flex items-center justify-center",
                  contentType === 'presentation' 
                    ? "bg-primary text-primary-foreground"
                    : "bg-gradient-to-br from-amber-500 to-orange-600 text-white"
                )}>
                  <Presentation className="h-6 w-6" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-base">Generate Presentation</span>
                    <Badge className="bg-amber-500 text-white text-[10px]">NEW</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">AI-powered slides with rich content, images & speaker notes</p>
                </div>
                {contentType === 'presentation' && (
                  <div className="h-6 w-6 rounded-full bg-primary flex items-center justify-center">
                    <CheckCircle className="h-4 w-4 text-primary-foreground" />
                  </div>
                )}
              </div>
            </div>

            {/* Other Content Types - Compact Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {CONTENT_TYPES.filter(ct => ct.id !== 'presentation').map((ct) => (
                <div
                  key={ct.id}
                  onClick={() => handleContentTypeChange(ct.id)}
                  className={cn(
                    "p-3 rounded-lg border cursor-pointer transition-all flex items-center gap-3",
                    contentType === ct.id 
                      ? "border-primary bg-primary/10 ring-1 ring-primary/30"
                      : "border-border hover:border-primary/50 hover:bg-secondary/50"
                  )}
                >
                  <div className={cn(
                    "h-8 w-8 rounded-lg flex items-center justify-center shrink-0",
                    contentType === ct.id ? "bg-primary text-primary-foreground" : "bg-secondary"
                  )}>
                    {ct.icon}
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-sm truncate">{ct.label}</p>
                    <p className="text-[10px] text-muted-foreground truncate">{ct.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Presentation Generator - Full Integrated Panel */}
          {contentType === 'presentation' && (
            <>
              <Separator />
              <div className="py-2">
                <PresentationGeneratorPanel
                  onComplete={(presentation) => {
                    toast.success(`Presentation "${presentation.title}" generated!`);
                    // Handle completion - could switch to drafts view
                  }}
                  onSaveToKnowledgeBase={onSaveToKnowledgeBase ? (title, content) => {
                    const generatedContent: GeneratedContent = {
                      id: `presentation-${Date.now()}`,
                      title,
                      script: content,
                      type: 'presentation',
                      createdAt: new Date().toISOString(),
                    };
                    onSaveToKnowledgeBase(generatedContent);
                  } : undefined}
                />
              </div>
            </>
          )}

          {/* Regular Script Generation Flow (non-presentation) */}
          {contentType !== 'presentation' && (
            <>
              <Separator />

              {/* Step 2: Upload/Input based on content type */}
              <div className="space-y-3">
                <Label className="text-sm font-semibold">2. {contentType === 'url' ? 'Enter URL' : contentType === 'image' ? 'Upload or Generate Image' : 'Upload File'}</Label>
                
                {/* URL Input */}
                {contentType === 'url' && (
                  <div className="space-y-3">
                    <div className="flex gap-2">
                      <Input
                        placeholder="https://example.com/article or document URL"
                        value={urlInput}
                        onChange={(e) => setUrlInput(e.target.value)}
                        className="flex-1"
                      />
                      <Button
                        variant="secondary"
                        onClick={() => {
                          if (!urlInput.trim()) {
                            toast.error('Please enter a URL first');
                            return;
                          }
                          setShowURLAnalyzer(true);
                        }}
                        disabled={!urlInput.trim()}
                        className="gap-2"
                      >
                        <Search className="h-4 w-4" />
                        Smart Analyze
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Click "Smart Analyze" to detect content type and get optimized script options, or use "Generate Script" for quick generation
                    </p>
                  </div>
                )}

                {/* Image: Toggle between upload and generate */}
                {contentType === 'image' && (
                  <div className="space-y-4">
                    <div className="flex gap-2">
                      <Button
                        variant={!generateImage ? "default" : "outline"}
                        size="sm"
                        onClick={() => setGenerateImage(false)}
                      >
                        <Upload className="h-4 w-4 mr-1" />
                        Upload Image
                      </Button>
                      <Button
                        variant={generateImage ? "default" : "outline"}
                        size="sm"
                        onClick={() => setGenerateImage(true)}
                      >
                        <Sparkles className="h-4 w-4 mr-1" />
                        Generate Image
                      </Button>
                    </div>

                    {generateImage ? (
                      <div className="space-y-4">
                        <Textarea
                          placeholder="Describe the image you want to generate..."
                          value={imagePrompt}
                          onChange={(e) => setImagePrompt(e.target.value)}
                          className="min-h-[100px]"
                        />
                        <ImageModelSelector
                          selectedModel={selectedImageModel}
                          onModelChange={setSelectedImageModel}
                          showLabel={true}
                        />
                      </div>
                    ) : (
                      <UploadZone 
                        getRootProps={getRootProps}
                        getInputProps={getInputProps}
                        isDragActive={isDragActive}
                        uploadedFiles={uploadedFiles}
                        onRemoveFile={removeFile}
                        acceptedTypes={selectedContentType.description}
                        isImage
                      />
                    )}
                  </div>
                )}

                {/* Document, Audio, Video: File Upload */}
                {(contentType === 'document' || contentType === 'audio' || contentType === 'video') && (
                  <UploadZone 
                    getRootProps={getRootProps}
                    getInputProps={getInputProps}
                    isDragActive={isDragActive}
                    uploadedFiles={uploadedFiles}
                    onRemoveFile={removeFile}
                    acceptedTypes={selectedContentType.description}
                    isMultiple={false}
                  />
                )}
              </div>

              <Separator />

              {/* Step 3: AI Provider Selection */}
              <div className="space-y-3">
                <Label className="text-sm font-semibold">3. AI Provider</Label>
                <AIProviderSelector
                  selectedProvider={selectedProvider}
                  onProviderChange={setSelectedProvider}
                  contentType={contentType}
                  showLabel={false}
                />
                
                {/* Knowledge Search Enhancement Toggle */}
                <div className="flex items-center justify-between p-3 rounded-lg border bg-muted/30">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-md bg-primary/10">
                      <Database className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <Label className="text-sm font-medium cursor-pointer" htmlFor="knowledge-search-toggle">
                        Knowledge Search Enhancement
                      </Label>
                      <p className="text-xs text-muted-foreground">
                        Auto-enhance script with relevant knowledge base content
                      </p>
                    </div>
                  </div>
                  <Switch
                    id="knowledge-search-toggle"
                    checked={enableKnowledgeSearch}
                    onCheckedChange={setEnableKnowledgeSearch}
                  />
                </div>
              </div>

              <Separator />

              {/* Step 4: Output Options */}
              <div className="space-y-4">
                <Label className="text-sm font-semibold">4. Output Options</Label>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {/* Output Format */}
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Script Type</Label>
                <Select value={outputFormat} onValueChange={setOutputFormat}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {selectedContentType.outputFormats.map((format) => (
                      <SelectItem key={format.value} value={format.value}>
                        <div className="flex items-center gap-2">
                          {format.icon}
                          {format.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Tone */}
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Tone</Label>
                <Select value={tone} onValueChange={setTone}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TONE_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Duration */}
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Duration</Label>
                <Select value={duration.toString()} onValueChange={(v) => setDuration(Number(v))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DURATION_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value.toString()}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Target Audience */}
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Target Audience</Label>
                <Input
                  placeholder="e.g., Healthcare pros..."
                  value={targetAudience}
                  onChange={(e) => setTargetAudience(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Generate Button */}
          <Button
            onClick={handleGenerate}
            disabled={isProcessing}
            className="w-full"
            size="lg"
          >
            {isProcessing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Wand2 className="h-4 w-4 mr-2" />
                Generate Script
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

          {/* Error */}
          {error && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 text-destructive">
              <AlertCircle className="h-5 w-5" />
              <span className="text-sm">{error}</span>
            </div>
          )}
        </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Upload Zone Component
interface UploadZoneProps {
  getRootProps: () => any;
  getInputProps: () => any;
  isDragActive: boolean;
  uploadedFiles: DetectedFile[];
  onRemoveFile: (index: number) => void;
  acceptedTypes: string;
  isImage?: boolean;
  isMultiple?: boolean;
}

function UploadZone({ 
  getRootProps, 
  getInputProps, 
  isDragActive, 
  uploadedFiles, 
  onRemoveFile, 
  acceptedTypes,
  isImage,
  isMultiple 
}: UploadZoneProps) {
  return (
    <div className="space-y-3">
      <div
        {...getRootProps()}
        className={cn(
          "border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-all",
          isDragActive 
            ? "border-primary bg-primary/5 scale-[1.01]" 
            : "border-border hover:border-primary/50",
          uploadedFiles.length > 0 && "border-green-500/50 bg-green-50/50 dark:bg-green-950/20"
        )}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center gap-2">
          <div className={cn(
            "h-12 w-12 rounded-full flex items-center justify-center",
            isDragActive ? "bg-primary/10" : "bg-secondary"
          )}>
            <Upload className={cn(
              "h-6 w-6",
              isDragActive ? "text-primary" : "text-muted-foreground"
            )} />
          </div>
          <div>
            <p className="font-medium text-sm">
              {isDragActive ? 'Drop files here' : 'Drop files or click to upload'}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {acceptedTypes} {isMultiple && '(multiple files allowed)'}
            </p>
          </div>
        </div>
      </div>

      {/* Uploaded Files */}
      {uploadedFiles.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {uploadedFiles.map((df, index) => (
            <div 
              key={index}
              className="flex items-center gap-3 p-2 rounded-lg border bg-secondary/30"
            >
              {isImage && df.preview ? (
                <img 
                  src={df.preview} 
                  alt={df.file.name}
                  className="h-10 w-10 rounded object-cover"
                />
              ) : (
                <div className="h-10 w-10 rounded bg-secondary flex items-center justify-center">
                  <FileText className="h-5 w-5 text-muted-foreground" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{df.file.name}</p>
                <p className="text-xs text-muted-foreground">
                  {(df.file.size / 1024).toFixed(1)} KB
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 shrink-0"
                onClick={() => onRemoveFile(index)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
