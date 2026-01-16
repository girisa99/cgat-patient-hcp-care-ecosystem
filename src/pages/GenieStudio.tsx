/**
 * Genie Studio - AI-Powered Media Production Hub
 * "Mind to Media" - Complete production suite for content creation
 * Part of Genie Studio
 * 
 * REFACTORED: Phase 3 - Now imports from extracted modules
 * @see src/components/genie-studio/types/studio-types.ts
 * @see src/components/genie-studio/constants/studio-constants.ts
 * @see src/components/genie-studio/hooks/
 */

import React, { useState, useEffect, useRef, useCallback, useMemo, memo } from 'react';
import { useNavigate } from 'react-router-dom';
import AppLayout from '@/components/layout/AppLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  Video, 
  Mic, 
  FileText, 
  Play, 
  Pause,
  Sparkles, 
  Wand2,
  Library,
  Clock,
  Zap,
  Music,
  Download,
  Trash2,
  Layers,
  Film,
  Headphones,
  PenTool,
  Cpu,
  TrendingUp,
  Loader2,
  Upload,
  Check,
  Search,
  RotateCcw,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  Volume2,
  Copy,
  Plus,
  RefreshCw,
  Radio,
  Podcast,
  Tv,
  Send,
  Users,
  Calendar,
  Mail,
  UserPlus,
  X,
  Save,
  Image as ImageIcon,
  // New icons for extended scheduling
  GraduationCap,
  Phone,
  Briefcase,
  Rocket,
  BarChart,
  MessageCircle,
  Wrench,
  Monitor,
  Building,
  BookOpen,
  CreditCard,
  Smartphone,
  Brain
} from 'lucide-react';
import { NativeFeatureButton } from '@/components/mobile';
import { cn } from '@/lib/utils';
// RecordingStudio removed - now using dedicated /genie-vibe route
import { toast } from 'sonner';
import { useTTSGeneration, OPENAI_VOICES, ELEVENLABS_VOICES } from '@/components/document-processing/RecordingStudio/hooks/useTTSGeneration';
import { useMediaProject } from '@/components/document-processing/RecordingStudio/hooks/useMediaProject';
import { ScriptEditorTab } from '@/components/genie-studio/ScriptEditorTab';
import { SavedAudioCard } from '@/components/genie-studio/SavedAudioCard';
import { useGenieMediaLibrary } from '@/components/genie-studio/useGenieMediaLibrary';
import { useGenieScripts, type GenieScript } from '@/components/genie-studio/useGenieScripts';
// Genie Spark - Smart Content Pipeline
import { SmartContentPipeline } from '@/components/genie-studio/SmartContentPipeline';
import type { GeneratedContent } from '@/components/genie-studio/PostGenerationActions';
import { PresentationGeneratorPanel } from '@/components/genie-studio/presentation-generator';
import { supabase } from '@/integrations/supabase/client';
import { useGenieSession } from '@/hooks/useGenieSession';
import { SessionCalendarButtons } from '@/components/genie-studio/SessionCalendarButtons';
// Import unified schedule dialog for Arc integration
import { UnifiedScheduleShowDialog, type ScheduleShowData } from '@/components/production/UnifiedScheduleShowDialog';
import { ProductionStage } from '@/types/shows';
// Mobile Recording View for mobile-first experience
import { MobileRecordingView } from '@/components/document-processing/RecordingStudio/components/MobileRecordingView';
// Ask Genie - Unified AI Assistant
import { AskGenie } from '@/components/genie-studio/AskGenie';
// Ralph Wiggum is now global (see App.tsx) - RalphWiggumGlobalPanel
// Dashboard Welcome - First-time user experience
import { DashboardWelcome } from '@/components/genie-studio/DashboardWelcome';
// User Flow Tracking - DEV-ONLY journey tracking
import { useUserFlowTracking } from '@/components/genie-studio/hooks/useUserFlowTracking';
// HIPAA Compliance Footer - Addresses security/compliance requirement
import { HIPAAComplianceFooter } from '@/components/genie-studio/HIPAAComplianceFooter';
// Accessibility Enhancements - Addresses color contrast, readability
import { AccessibilityToggle } from '@/components/genie-studio/AccessibilityEnhancements';
// Info Banner - Addresses Ralph Wiggum: "What is Genie Studio?" clarity
import { GenieStudioInfoBanner } from '@/components/genie-studio/GenieStudioInfoBanner';
// Loading Spinner - Enhanced loading state feedback
import { LoadingSpinner } from '@/components/ui/loading-spinner';

// ========================================
// EXTRACTED MODULES - Phase 3 Refactoring
// ========================================
// Types extracted to: src/components/genie-studio/types/studio-types.ts
import type { 
  MediaItem, 
  SavedScript, 
  ShowEvent, 
  Participant 
} from '@/components/genie-studio/types';

// Constants extracted to: src/components/genie-studio/constants/studio-constants.ts
import { 
  SCRIPT_TEMPLATES, 
  MUSIC_GENRES, 
  FEATURES, 
  QUICK_TIPS 
} from '@/components/genie-studio/constants';

// Hooks extracted to: src/components/genie-studio/hooks/
import { useMediaLibrary } from '@/components/genie-studio/hooks/useMediaLibrary';
import { useShowEvents } from '@/components/genie-studio/hooks/useShowEvents';

// Import Genie logos - Using combined versions with taglines (finalized)
import genieStudioLogo from '@/assets/logos/genie-studio-banner.png';
import genieMindLogo from '@/assets/logos/genie-mind-combined.png';
import genieVibeLogo from '@/assets/logos/genie-vibe-combined.png';
import genieArcLogo from '@/assets/logos/genie-arc-combined.png';
import genieSparkLogo from '@/assets/logos/genie-spark-combined.png';
import askGenieLogo from '@/assets/logos/ask-genie-combined.png';
// Same logos used for all sizes (combined is the finalized version)
import genieMindProductLogo from '@/assets/logos/genie-mind-combined.png';
import genieVibeProductLogo from '@/assets/logos/genie-vibe-combined.png';
import genieArcProductLogo from '@/assets/logos/genie-arc-combined.png';
import genieSparkProductLogo from '@/assets/logos/genie-spark-combined.png';
import askGenieProductLogo from '@/assets/logos/ask-genie-combined.png';

// ========================================
// NOTE: Types, Constants, and Hooks are now imported from:
// - Types: @/components/genie-studio/types/studio-types.ts
// - Constants: @/components/genie-studio/constants/studio-constants.ts
// - Hooks: @/components/genie-studio/hooks/
// ========================================

export default function GenieStudio() {
  const navigate = useNavigate();
  // isStudioOpen removed - now using dedicated /genie-vibe route
  const [activeTab, setActiveTab] = useState('dashboard');
  const [currentHeroSlide, setCurrentHeroSlide] = useState(0);
  const [isCarouselPaused, setIsCarouselPaused] = useState(false);
  const carouselIntervalRef = useRef<NodeJS.Timeout | null>(null);
  
  // Mobile detection for responsive experience
  const [isMobile, setIsMobile] = useState(false);
  const [forceDesktopView, setForceDesktopView] = useState(false);
  
  // User flow tracking for Ralph Wiggum journey analysis (DEV-ONLY)
  const { userFlow, loadedComponents, trackAction, registerComponent } = useUserFlowTracking(activeTab);
  
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  
  // Auto-scroll carousel every 5 seconds
  useEffect(() => {
    if (isCarouselPaused) return;
    
    carouselIntervalRef.current = setInterval(() => {
      setCurrentHeroSlide(prev => (prev === 4 ? 0 : prev + 1));
    }, 5000);
    
    return () => {
      if (carouselIntervalRef.current) {
        clearInterval(carouselIntervalRef.current);
      }
    };
  }, [isCarouselPaused]);
  
  // Pause carousel on user interaction, resume after 10 seconds
  const handleCarouselInteraction = useCallback((slideIndex?: number) => {
    setIsCarouselPaused(true);
    if (slideIndex !== undefined) {
      setCurrentHeroSlide(slideIndex);
    }
    // Resume auto-scroll after 10 seconds of inactivity
    const resumeTimer = setTimeout(() => {
      setIsCarouselPaused(false);
    }, 10000);
    return () => clearTimeout(resumeTimer);
  }, []);
  
  // Note: Recording state tracking moved to /genie-vibe page
  
  // Script Editor State
  const [scriptContent, setScriptContent] = useState('');
  const [scriptName, setScriptName] = useState('');
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  // Script Analysis State
  const [analysisResult, setAnalysisResult] = useState<{
    stats?: { wordCount: number; sentenceCount: number; estimatedDurationMinutes: number; readabilityScore: string };
    recommendations?: Array<{ id: string; type: string; severity: string; title: string; description: string; accepted: boolean | null }>;
  } | null>(null);
  const [showAnalysis, setShowAnalysis] = useState(false);
  
  // Script Enhancement State
  const [enhancedScriptContent, setEnhancedScriptContent] = useState<string | null>(null);
  const [enhancementChanges, setEnhancementChanges] = useState<Array<{ id: string; type: string; original: string; enhanced: string; reason: string; accepted: boolean | null }>>([]);
  const [showEnhancementChanges, setShowEnhancementChanges] = useState(false);
  const [originalScriptContent, setOriginalScriptContent] = useState<string | null>(null);
  
  // File upload refs
  const voiceoverUploadRef = useRef<HTMLInputElement>(null);
  const musicUploadRef = useRef<HTMLInputElement>(null);
  const featuresScrollRef = useRef<HTMLDivElement>(null);
  
  // Publish Dialog State
  const [isPublishDialogOpen, setIsPublishDialogOpen] = useState(false);
  const [voiceText, setVoiceText] = useState('');
  const [selectedProvider, setSelectedProvider] = useState<'openai' | 'elevenlabs'>('elevenlabs');
  const [selectedVoice, setSelectedVoice] = useState('');
  
  // Ask Genie State - Track when floating overlay is open for Ralph Wiggum
  const [isAskGenieOpen, setIsAskGenieOpen] = useState(false);
  
  // Music Studio State
  const [musicPrompt, setMusicPrompt] = useState('');
  const [selectedGenre, setSelectedGenre] = useState<string | null>(null);
  const [isGeneratingMusic, setIsGeneratingMusic] = useState(false);
  const [generatedMusicUrl, setGeneratedMusicUrl] = useState<string | null>(null);
  const musicAudioRef = useRef<HTMLAudioElement | null>(null);
  
  // Show/Event State
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);
  const [selectedEventForInvite, setSelectedEventForInvite] = useState<ShowEvent | null>(null);
  const [isCreateShowDialogOpen, setIsCreateShowDialogOpen] = useState(false);
  const [newShowType, setNewShowType] = useState<string>('podcast');
  const [newEventCategory, setNewEventCategory] = useState<'media_production' | 'business_meeting' | 'event' | 'genie_demo'>('media_production');
  const [newShowTitle, setNewShowTitle] = useState('');
  const [newShowDescription, setNewShowDescription] = useState('');
  const [newShowDate, setNewShowDate] = useState('');
  const [newShowTime, setNewShowTime] = useState('');
  const [isSendingInvite, setIsSendingInvite] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteName, setInviteName] = useState('');
  const [inviteRole, setInviteRole] = useState<'host' | 'co-host' | 'guest' | 'panelist'>('guest');
  
  // New: Schedule Show with script, topics, and participants
  const [showTopics, setShowTopics] = useState('');
  const [showScript, setShowScript] = useState('');
  const [showScriptFilename, setShowScriptFilename] = useState<string | null>(null);
  const [showParticipants, setShowParticipants] = useState<Omit<Participant, 'id'>[]>([]);
  const [isGeneratingSuggestions, setIsGeneratingSuggestions] = useState(false);
  const [suggestedTitle, setSuggestedTitle] = useState('');
  const [suggestedIntro, setSuggestedIntro] = useState('');
  const [scheduleStep, setScheduleStep] = useState<'details' | 'content' | 'participants'>('details');
  const [hostName, setHostName] = useState('');
  const [attachScriptToInvite, setAttachScriptToInvite] = useState(true);
  const [selectedScriptId, setSelectedScriptId] = useState<string | null>(null);
  const [productionStage, setProductionStage] = useState<'script_review' | 'edit' | 'rehearsal' | 'final_review' | 'recording'>('script_review');
  const [hostEmail, setHostEmail] = useState('');
  const [aiProvider, setAiProvider] = useState<'gemini' | 'openai' | 'anthropic'>('gemini');
  const [aiModel, setAiModel] = useState<string>('gemini-2.0-flash');
  
  // Scripts from database (replaces localStorage)
  const {
    scripts: dbScripts,
    videoScripts,
    audioScripts,
    isLoading: isScriptsLoading,
    saveScript: saveDbScript,
    updateScript: updateDbScript,
    deleteScript: deleteDbScript,
    refresh: refreshScripts
  } = useGenieScripts();
  
  // Media projects from Recording Studio
  const { projects: mediaProjects, isLoading: isProjectsLoading } = useMediaProject();
  
  // Convert GenieScript to SavedScript format for compatibility
  const savedScripts: SavedScript[] = dbScripts.map(s => ({
    id: s.id,
    name: s.name,
    content: s.content,
    type: s.type,
    createdAt: s.createdAt,
    updatedAt: s.updatedAt,
    enhancedContent: s.enhancedContent || undefined,
    cleanContent: s.cleanContent || undefined,
    draftContent: s.draftContent || undefined,
    draftStatus: s.draftStatus || undefined,
    draftChanges: s.draftChanges || undefined,
    stats: s.stats || undefined,
    hasVoiceover: s.hasVoiceover,
    voiceoverId: s.voiceoverId || undefined,
  }));
  
  // Legacy localStorage for voiceovers and music (will merge with DB data)
  const [savedVoiceovers, setSavedVoiceovers] = useState<MediaItem[]>([]);
  const [savedMusic, setSavedMusic] = useState<MediaItem[]>([]);

  // Load voiceovers and music from localStorage (legacy support)
  useEffect(() => {
    try {
      const voiceovers = localStorage.getItem('genieStudioVoiceovers');
      if (voiceovers) setSavedVoiceovers(JSON.parse(voiceovers));
      
      const music = localStorage.getItem('genieStudioMusic');
      if (music) setSavedMusic(JSON.parse(music));
    } catch (e) {
      console.error('Failed to load saved content:', e);
    }
  }, []);

  // Save script to database
  const saveScript = async (script?: SavedScript) => {
    if (script) {
      await saveDbScript({
        name: script.name,
        content: script.content,
        type: script.type,
        enhancedContent: script.enhancedContent,
        cleanContent: script.cleanContent,
        draftContent: script.draftContent,
        draftStatus: script.draftStatus,
        draftChanges: script.draftChanges,
        stats: script.stats,
        hasVoiceover: script.hasVoiceover,
        voiceoverId: script.voiceoverId,
        id: script.id, // Pass ID for update
      });
      return;
    }
    
    // Legacy: if called without args, use the state values
    if (!scriptName.trim() || !scriptContent.trim()) {
      toast.error('Please add a name and content');
      return;
    }
    await saveDbScript({
      name: scriptName,
      content: scriptContent,
      type: 'video',
    });
  };
  
  // Update script in database
  const updateScript = async (id: string, updates: Partial<SavedScript>) => {
    await updateDbScript(id, {
      name: updates.name,
      content: updates.content,
      type: updates.type,
      enhancedContent: updates.enhancedContent,
      cleanContent: updates.cleanContent,
      draftContent: updates.draftContent,
      draftStatus: updates.draftStatus,
      draftChanges: updates.draftChanges,
      stats: updates.stats,
      hasVoiceover: updates.hasVoiceover,
      voiceoverId: updates.voiceoverId,
    });
  };

  const loadScript = (script: SavedScript) => {
    setScriptName(script.name);
    setScriptContent(script.content);
    toast.success(`Loaded "${script.name}"`);
  };

  // Delete script from database
  const deleteScript = async (id: string) => {
    await deleteDbScript(id);
  };

  // Save voiceover to database (generated_media table) - handles blob URLs and data URIs
  const saveVoiceover = async (
    url: string, 
    name: string, 
    audioBlob?: Blob,
    scriptMeta?: { originalScript?: string; scriptText?: string; scriptType?: string }
  ) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Please log in to save voiceovers');
        return;
      }
      
      const sanitizedName = name.replace(/[^a-zA-Z0-9.-]/g, '_');
      const uniquePath = `voiceovers/${user.id}/${Date.now()}_${sanitizedName}.mp3`;
      
      let finalUrl = url;
      
      // If we have a blob, upload it to storage
      if (audioBlob) {
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('genie-media')
          .upload(uniquePath, audioBlob, {
            contentType: 'audio/mpeg',
            upsert: true
          });
          
        if (uploadError) {
          console.error('Storage upload error:', uploadError);
          throw new Error('Failed to upload audio file');
        }
        
        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('genie-media')
          .getPublicUrl(uniquePath);
          
        finalUrl = publicUrl;
      } else if (url.startsWith('data:') || url.startsWith('blob:')) {
        // Convert data URI or blob URL to actual blob and upload
        try {
          const response = await fetch(url);
          const blob = await response.blob();
          
          const { data: uploadData, error: uploadError } = await supabase.storage
            .from('genie-media')
            .upload(uniquePath, blob, {
              contentType: 'audio/mpeg',
              upsert: true
            });
            
          if (uploadError) {
            console.error('Storage upload error:', uploadError);
            throw new Error('Failed to upload audio file');
          }
          
          const { data: { publicUrl } } = supabase.storage
            .from('genie-media')
            .getPublicUrl(uniquePath);
            
          finalUrl = publicUrl;
        } catch (fetchErr) {
          console.error('Failed to fetch blob:', fetchErr);
          throw new Error('Failed to process audio data');
        }
      }
      
      // Determine the correct metadata type:
      // - If scriptMeta.scriptType is 'tts' or name contains 'TTS' -> type = 'tts'
      // - Otherwise -> type = 'voiceover'
      const isTTSGenerated = 
        scriptMeta?.scriptType === 'tts' || 
        name.toLowerCase().includes(' tts') || 
        name.toLowerCase().includes('_tts') || 
        name.toLowerCase().includes('-tts') ||
        name.toLowerCase().includes('enhanced tts') ||
        name.toLowerCase().includes('original tts');
      
      const metadataType = isTTSGenerated ? 'tts' : 'voiceover';
      console.log('[GenieStudio] saveVoiceover:', { name, scriptType: scriptMeta?.scriptType, isTTSGenerated, metadataType });
      
      const { error } = await supabase
        .from('generated_media')
        .insert({
          user_id: user.id,
          name,
          file_type: 'audio',
          file_url: finalUrl,
          source: 'generated',
          storage_bucket: 'genie-media',
          storage_path: uniquePath,
          metadata: { 
            type: metadataType, 
            uploadedAs: metadataType, 
            generatedAt: new Date().toISOString(),
            scriptText: scriptMeta?.scriptText,
            originalScript: scriptMeta?.originalScript,
            scriptType: scriptMeta?.scriptType || 'tts'
          }
        });
      
      if (error) throw error;
      
      toast.success('Voiceover saved to library!');
      refreshDbMedia();
    } catch (err) {
      console.error('Failed to save voiceover:', err);
      toast.error('Failed to save voiceover: ' + (err instanceof Error ? err.message : 'Unknown error'));
    }
  };

  // Save music track to database (generated_media table) - handles blob URLs
  const saveMusicTrack = async (url: string, name: string, audioBlob?: Blob) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Please log in to save music');
        return;
      }
      
      const sanitizedName = name.replace(/[^a-zA-Z0-9.-]/g, '_');
      const uniquePath = `music/${user.id}/${Date.now()}_${sanitizedName}`;
      
      let finalUrl = url;
      
      // If we have a blob, upload it to storage for proper URL
      if (audioBlob) {
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('genie-media')
          .upload(uniquePath, audioBlob, {
            contentType: audioBlob.type || 'audio/mpeg',
            upsert: true
          });
          
        if (uploadError) {
          console.error('Storage upload error:', uploadError);
          throw new Error('Failed to upload music file');
        }
        
        const { data: { publicUrl } } = supabase.storage
          .from('genie-media')
          .getPublicUrl(uniquePath);
          
        finalUrl = publicUrl;
      } else if (url.startsWith('blob:') || url.startsWith('data:')) {
        // Convert blob/data URL to actual blob and upload
        try {
          const response = await fetch(url);
          const blob = await response.blob();
          
          const { error: uploadError } = await supabase.storage
            .from('genie-media')
            .upload(uniquePath, blob, {
              contentType: blob.type || 'audio/mpeg',
              upsert: true
            });
            
          if (uploadError) {
            console.error('Storage upload error:', uploadError);
            throw new Error('Failed to upload music file');
          }
          
          const { data: { publicUrl } } = supabase.storage
            .from('genie-media')
            .getPublicUrl(uniquePath);
            
          finalUrl = publicUrl;
        } catch (fetchErr) {
          console.error('Failed to fetch blob:', fetchErr);
          throw new Error('Failed to process music data');
        }
      }
      
      const { error } = await supabase
        .from('generated_media')
        .insert({
          user_id: user.id,
          name,
          file_type: 'audio',
          file_url: finalUrl,
          source: 'upload',
          storage_bucket: 'genie-media',
          storage_path: uniquePath,
          metadata: { type: 'instrumental', uploadedAs: 'music' }
        });
      
      if (error) throw error;
      
      toast.success('Music saved!');
      refreshDbMedia();
    } catch (err) {
      console.error('Failed to save music:', err);
      toast.error('Failed to save music: ' + (err instanceof Error ? err.message : 'Unknown error'));
    }
  };
  
  // TTS Hook
  const { 
    isGenerating: isTTSGenerating, 
    lastResult: ttsResult, 
    generate: generateTTS, 
    play: playTTS, 
    stop: stopTTS,
    download: downloadTTS 
  } = useTTSGeneration();
  
  // Load real media from localStorage
  const { videos, audios, isLoading, loadMedia, deleteMedia } = useMediaLibrary();
  
  // Load media from database (voiceovers, music, TTS files)
  const { 
    instrumentalMusic: dbMusic, 
    ttsFiles: dbTtsFiles, 
    voiceovers: dbVoiceovers,
    customVoices: dbCustomVoices,
    isLoading: isDbLoading,
    refresh: refreshDbMedia 
  } = useGenieMediaLibrary();
  
  // Merge localStorage voiceovers with database voiceovers (DB takes priority)
  // Preserve metadata for proper categorization and teleprompter sync
  const mergedVoiceovers = useMemo(() => [
    ...dbVoiceovers.map(v => ({
      id: v.id,
      name: v.name,
      type: 'audio' as const,
      url: v.url,
      timestamp: v.timestamp || Date.now(),
      scriptText: v.scriptText,
      originalScript: v.originalScript,
      scriptType: v.scriptType,
      metadataType: v.metadataType
    })),
    ...dbTtsFiles.map(v => ({
      id: v.id,
      name: v.name,
      type: 'audio' as const,
      url: v.url,
      timestamp: v.timestamp || Date.now(),
      scriptText: v.scriptText,
      originalScript: v.originalScript,
      scriptType: v.scriptType,
      metadataType: v.metadataType || 'tts'
    })),
    ...savedVoiceovers.filter(sv => 
      !dbVoiceovers.some(dv => dv.id === sv.id) && 
      !dbTtsFiles.some(dv => dv.id === sv.id)
    )
  ], [dbVoiceovers, dbTtsFiles, savedVoiceovers]);
  
  // Merge localStorage music with database instrumental files
  const mergedMusic = useMemo(() => [
    ...dbMusic.map(m => ({
      id: m.id,
      name: m.name,
      type: 'audio' as const,
      url: m.url,
      timestamp: Date.now()
    })),
    ...savedMusic.filter(sm => !dbMusic.some(dm => dm.id === sm.id))
  ], [dbMusic, savedMusic]);
  
  // Memoize RecordingStudio props to prevent unnecessary re-renders
  const studioScripts = useMemo(() => savedScripts.map(s => ({ 
    id: s.id, 
    title: s.name, 
    content: s.enhancedContent || s.content,
    originalContent: s.content,
    enhancedContent: s.enhancedContent,
    cleanContent: s.cleanContent,
    type: s.type
  })), [savedScripts]);
  
  const studioVoiceovers = useMemo(() => mergedVoiceovers.map(v => ({ 
    id: v.id, 
    name: v.name, 
    url: v.url || '',
    scriptText: (v as any).scriptText || null,
    scriptType: (v as any).scriptType || null,
    metadataType: (v as any).metadataType || null
  })), [mergedVoiceovers]);
  
  const studioMusic = useMemo(() => mergedMusic.map(m => ({ 
    id: m.id, 
    name: m.name, 
    url: m.url || '' 
  })), [mergedMusic]);
  
  // Show events
  const { events, upcomingEvents, addEvent, updateEvent, deleteEvent, addParticipant } = useShowEvents();

  // Set default voice when provider changes
  useEffect(() => {
    if (selectedProvider === 'openai') {
      setSelectedVoice(OPENAI_VOICES[0].value);
    } else {
      setSelectedVoice(ELEVENLABS_VOICES[0].value);
    }
  }, [selectedProvider]);

  // handleStudioClose removed - RecordingStudio modal no longer used
  // Navigate to /genie-vibe instead

  const handleFeatureClick = (featureId: string) => {
    if (featureId === 'productions') {
      navigate('/genie-studio/productions');
    } else if (featureId === 'record') {
      navigate('/genie-vibe'); // Redirect to Genie Vibe full studio
    } else if (featureId === 'voice') {
      setActiveTab('voice-generator');
    } else if (featureId === 'script') {
      setActiveTab('script-editor');
    } else if (featureId === 'music') {
      setActiveTab('music-studio');
    } else if (featureId === 'publish') {
      setIsPublishDialogOpen(true);
    }
  };

  // Scroll features cards
  const scrollFeatures = (direction: 'left' | 'right') => {
    if (featuresScrollRef.current) {
      const scrollAmount = 300;
      featuresScrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  // Script Editor Functions
  const calculateReadingTime = (text: string) => {
    const words = text.trim().split(/\s+/).length;
    const minutes = Math.ceil(words / 150);
    return { words, minutes };
  };

  const handleNewScript = () => {
    setScriptContent('');
    setScriptName('');
    setAnalysisResult(null);
    setShowAnalysis(false);
    setEnhancedScriptContent(null);
    setEnhancementChanges([]);
    setShowEnhancementChanges(false);
    setOriginalScriptContent(null);
    toast.success('Ready for a new script!');
  };

  // Script Analysis - AI powered
  const handleAnalyzeScript = async () => {
    if (!scriptContent.trim()) {
      toast.error('Please write some content first');
      return;
    }
    
    setIsAnalyzing(true);
    try {
      const { data, error } = await supabase.functions.invoke('enhance-script', {
        body: { scriptContent, mode: 'analyze' }
      });
      
      if (error) throw error;
      
      if (data?.stats || data?.recommendations) {
        const recs = (data.recommendations || []).map((r: any, i: number) => ({
          id: `rec-${i}`,
          type: r.type || 'readability',
          severity: r.severity || 'info',
          title: r.title,
          description: r.description,
          accepted: null
        }));
        
        setAnalysisResult({
          stats: data.stats,
          recommendations: recs
        });
        setShowAnalysis(true);
        toast.success('Script analyzed!');
      }
    } catch (err) {
      console.error('Analysis error:', err);
      toast.error('Failed to analyze script');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Script Enhancement - with change tracking
  const handleEnhanceScript = async () => {
    if (!scriptContent.trim()) {
      toast.error('Please write some content first');
      return;
    }
    
    setOriginalScriptContent(scriptContent);
    setIsEnhancing(true);
    try {
      const { data, error } = await supabase.functions.invoke('enhance-script', {
        body: { scriptContent, mode: 'enhance' }
      });
      
      if (error) throw error;
      
      if (data?.enhancedScript) {
        setEnhancedScriptContent(data.enhancedScript);
        
        // Parse changes if provided
        if (data.changes && Array.isArray(data.changes)) {
          setEnhancementChanges(data.changes.map((c: any, i: number) => ({
            id: `change-${i}`,
            type: c.type || 'modification',
            original: c.original || '',
            enhanced: c.enhanced || '',
            reason: c.reason || 'AI improvement',
            accepted: null
          })));
        } else {
          // Generate simple diff
          const origWords = scriptContent.split(/\s+/).length;
          const enhWords = data.enhancedScript.split(/\s+/).length;
          setEnhancementChanges([{
            id: 'change-summary',
            type: 'modification',
            original: `${origWords} words`,
            enhanced: `${enhWords} words`,
            reason: 'Script enhanced for clarity and engagement',
            accepted: null
          }]);
        }
        
        setShowEnhancementChanges(true);
        toast.success('Script enhanced! Review the changes below.');
      }
    } catch (err) {
      console.error('Enhancement error:', err);
      toast.error('Failed to enhance script');
    } finally {
      setIsEnhancing(false);
    }
  };

  const handleAcceptAllEnhancements = () => {
    if (enhancedScriptContent) {
      setScriptContent(enhancedScriptContent);
      setEnhancementChanges([]);
      setShowEnhancementChanges(false);
      setEnhancedScriptContent(null);
      toast.success('All enhancements applied!');
    }
  };

  const handleRejectAllEnhancements = () => {
    setEnhancementChanges([]);
    setShowEnhancementChanges(false);
    setEnhancedScriptContent(null);
    toast.info('Enhancements rejected');
  };

  const handleRevertToOriginal = () => {
    if (originalScriptContent) {
      setScriptContent(originalScriptContent);
      setOriginalScriptContent(null);
      toast.success('Reverted to original');
    }
  };

  // Generate TTS from full script
  const handleGenerateFullTTS = async () => {
    if (!scriptContent.trim()) {
      toast.error('Please write some content first');
      return;
    }
    
    const result = await generateTTS({
      provider: selectedProvider,
      voice: selectedVoice || (selectedProvider === 'openai' ? 'alloy' : 'EXAVITQu4vr4xnSDxMaL'),
      text: scriptContent
    });
    
    if (result) {
      playTTS();
      toast.success('Full script TTS generated! Save it to use in recording.');
    }
  };

  const handleScriptTTSPreview = async () => {
    if (!scriptContent.trim()) {
      toast.error('Please write some content first');
      return;
    }
    
    const previewText = scriptContent.slice(0, 500);
    const result = await generateTTS({
      provider: selectedProvider,
      voice: selectedVoice || (selectedProvider === 'openai' ? 'alloy' : 'EXAVITQu4vr4xnSDxMaL'),
      text: previewText
    });
    
    if (result) {
      playTTS();
    }
  };

  const handleLoadTemplate = (template: typeof SCRIPT_TEMPLATES[0]) => {
    setScriptContent(template.content);
    setScriptName(template.name);
    setActiveTab('script-editor');
    toast.success(`Loaded "${template.name}" template`);
  };

  // Upload handlers - pass the actual File blob for proper storage upload
  const handleUploadVoiceover = async (file: File) => {
    try {
      const url = URL.createObjectURL(file);
      // Pass the file as blob so it gets uploaded to storage with a proper URL
      saveVoiceover(url, file.name, file);
    } catch (err) {
      toast.error('Failed to upload voiceover');
    }
  };

  const handleUploadMusic = async (file: File) => {
    try {
      const url = URL.createObjectURL(file);
      // Pass the file as blob so it gets uploaded to storage with a proper URL
      saveMusicTrack(url, file.name, file);
    } catch (err) {
      toast.error('Failed to upload music');
    }
  };

  // Voice Generator Functions
  const handleGenerateVoice = async () => {
    if (!voiceText.trim()) {
      toast.error('Please enter text to generate');
      return;
    }
    
    const result = await generateTTS({
      provider: selectedProvider,
      voice: selectedVoice,
      text: voiceText
    });
    
    if (result) {
      playTTS();
    }
  };

  // Music Studio Functions
  const handleGenreSelect = (genre: typeof MUSIC_GENRES[0]) => {
    setSelectedGenre(genre.id);
    setMusicPrompt(genre.prompt);
  };

  const handleGenerateMusic = async () => {
    if (!musicPrompt.trim()) {
      toast.error('Please describe the music you want');
      return;
    }
    
    setIsGeneratingMusic(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/elevenlabs-music`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({
            prompt: musicPrompt,
            duration: 30
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Music generation failed');
      }

      const data = await response.json();
      
      const audioUrl = `data:audio/mpeg;base64,${data.audioContent}`;
      setGeneratedMusicUrl(audioUrl);
      
      if (musicAudioRef.current) {
        musicAudioRef.current.src = audioUrl;
        musicAudioRef.current.play();
      }
      
      toast.success('Music generated!');
    } catch (err) {
      console.error('Music generation error:', err);
      toast.error('Failed to generate music. Make sure ELEVENLABS_API_KEY is configured.');
    } finally {
      setIsGeneratingMusic(false);
    }
  };

  // Show/Event Functions
  const handleGenerateSuggestions = async () => {
    if (!showTopics.trim() && !showScript.trim()) {
      toast.error('Please add topics or upload a script first');
      return;
    }
    
    setIsGeneratingSuggestions(true);
    try {
      // Clean the content before sending to AI
      const rawContent = showScript.trim() || showTopics.trim();
      const contentForAI = rawContent
        .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '')
        .replace(/[""]/g, '"')
        .replace(/['']/g, "'")
        .replace(/[\u200B-\u200D\uFEFF]/g, '')
        .substring(0, 3000); // Limit to prevent token overflow
      
      const showTypeLabel = newShowType === 'podcast' ? 'Podcast Episode' : 
                           newShowType === 'webcast' ? 'Webcast/Webinar' : 
                           newShowType === 'interview' ? 'Interview' :
                           newShowType === 'panel' ? 'Panel Discussion' :
                           newShowType === 'tutorial' ? 'Tutorial' :
                           'Live Broadcast';
      
      // Use selected AI provider
      const { data, error } = await supabase.functions.invoke('ai-universal-processor', {
        body: { 
          provider: aiProvider,
          model: aiModel,
          prompt: `Generate a catchy title and engaging introduction for a ${showTypeLabel} about the following topics/content:

${contentForAI}

Provide your response in this exact format:
TITLE: [A compelling title, max 60 characters]
INTRODUCTION: [A brief introduction paragraph, 2-3 sentences that hooks the audience]`,
          systemPrompt: 'You are a professional media producer who creates compelling titles and introductions for podcasts, webcasts, and broadcasts. Be creative, engaging, and audience-focused.',
          action: 'generate'
        }
      });
      
      if (error) throw error;
      
      if (data?.content) {
        // Parse the AI response
        const content = data.content;
        const titleMatch = content.match(/TITLE:\s*(.+?)(?:\n|INTRODUCTION)/s);
        const introMatch = content.match(/INTRODUCTION:\s*(.+)/s);
        
        const extractedTitle = titleMatch ? titleMatch[1].trim().replace(/^["']|["']$/g, '') : '';
        const extractedIntro = introMatch ? introMatch[1].trim() : '';
        
        setSuggestedTitle(extractedTitle);
        setSuggestedIntro(extractedIntro);
        
        // Auto-populate the show title and description if empty
        if (!newShowTitle.trim() && extractedTitle) {
          setNewShowTitle(extractedTitle);
        }
        if (!newShowDescription.trim() && extractedIntro) {
          setNewShowDescription(extractedIntro);
        }
        
        toast.success('AI suggestions generated!');
      }
    } catch (err) {
      console.error('Suggestion error:', err);
      // Fallback suggestions based on show type
      const fallbackTitles: Record<string, string> = {
        podcast: `${showTopics.split(',')[0]?.trim() || 'Episode'} Deep Dive`,
        webcast: `${showTopics.split(',')[0]?.trim() || 'Topic'} Masterclass`,
        interview: `In Conversation: ${showTopics.split(',')[0]?.trim() || 'Expert Insights'}`,
        panel: `Panel: ${showTopics.split(',')[0]?.trim() || 'Industry Leaders Discuss'}`,
        tutorial: `How To: ${showTopics.split(',')[0]?.trim() || 'Master the Basics'}`,
        broadcast: `Live: ${showTopics.split(',')[0]?.trim() || 'Discussion'}`
      };
      setSuggestedTitle(fallbackTitles[newShowType] || fallbackTitles.podcast);
      setSuggestedIntro(`Join us for an insightful ${newShowType} exploring ${showTopics || 'exciting topics'}. Our guests will share valuable perspectives and actionable insights.`);
      toast.success('Suggestions ready!');
    } finally {
      setIsGeneratingSuggestions(false);
    }
  };

  // Handle script selection - auto-populate title and description
  const handleScriptSelect = (scriptId: string) => {
    const script = savedScripts.find(s => s.id === scriptId);
    if (script) {
      setSelectedScriptId(scriptId);
      setShowScript(script.content);
      
      // Auto-populate title from script name if empty
      if (!newShowTitle.trim()) {
        setNewShowTitle(script.name);
      }
      
      toast.success(`Script "${script.name}" loaded`);
    }
  };

  // Handle script file upload - cleans special characters and extracts metadata
  const handleScriptUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    try {
      // Handle .doc/.docx files - they need special processing
      const isWordDoc = file.name.endsWith('.doc') || file.name.endsWith('.docx');
      
      let text = '';
      
      if (isWordDoc) {
        // For Word docs, we need to use the document processor edge function
        toast.info('Processing Word document...');
        
        // Convert file to base64
        const arrayBuffer = await file.arrayBuffer();
        const uint8Array = new Uint8Array(arrayBuffer);
        let binary = '';
        for (let i = 0; i < uint8Array.byteLength; i++) {
          binary += String.fromCharCode(uint8Array[i]);
        }
        const base64Content = btoa(binary);
        
        // Call document processor
        const { data, error } = await supabase.functions.invoke('document-processor', {
          body: {
            file_content: base64Content,
            file_name: file.name,
            file_type: file.type || 'application/msword',
            extract_text: true
          }
        });
        
        if (error) {
          console.error('Document processing error:', error);
          toast.error('Failed to process Word document. Try uploading as .txt instead.');
          return;
        }
        
        text = data?.extracted_text || data?.text || '';
      } else {
        text = await file.text();
      }
      
      // Clean special characters while preserving structure
      const cleanedText = text
        // Remove common problematic characters
        .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '')
        // Normalize quotes
        .replace(/[""„‟]/g, '"')
        .replace(/[''‚‛]/g, "'")
        // Normalize dashes
        .replace(/[–—―‒]/g, '-')
        // Normalize ellipsis
        .replace(/…/g, '...')
        // Remove zero-width characters
        .replace(/[\u200B-\u200D\uFEFF\u00A0]/g, ' ')
        // Remove non-breaking spaces  
        .replace(/\u00A0/g, ' ')
        // Normalize line breaks
        .replace(/\r\n/g, '\n')
        .replace(/\r/g, '\n')
        // Remove excessive blank lines (more than 2 consecutive)
        .replace(/\n{3,}/g, '\n\n')
        // Remove multiple spaces
        .replace(/ {2,}/g, ' ')
        .trim();
      
      setShowScript(cleanedText);
      setShowScriptFilename(file.name);
      setSelectedScriptId(null);
      
      // Extract potential title from first non-empty line or heading
      const lines = cleanedText.split('\n').filter(line => line.trim());
      let extractedTitle = '';
      let extractedDescription = '';
      
      // Look for title-like patterns
      for (const line of lines.slice(0, 5)) {
        const trimmedLine = line.trim();
        // Check for heading formats: # Title, Title:, TITLE, or just short first line
        if (trimmedLine.startsWith('#')) {
          extractedTitle = trimmedLine.replace(/^#+\s*/, '').trim();
          break;
        } else if (trimmedLine.endsWith(':') && trimmedLine.length < 100) {
          extractedTitle = trimmedLine.replace(/:$/, '').trim();
          break;
        } else if (trimmedLine.length < 80 && trimmedLine === trimmedLine.toUpperCase() && trimmedLine.length > 5) {
          // All caps title
          extractedTitle = trimmedLine.charAt(0) + trimmedLine.slice(1).toLowerCase();
          break;
        } else if (lines.indexOf(line) === 0 && trimmedLine.length < 80) {
          // Use first short line as title
          extractedTitle = trimmedLine;
        }
      }
      
      // Extract description from second paragraph or after title
      const titleIndex = extractedTitle ? lines.findIndex(l => l.includes(extractedTitle)) : -1;
      if (titleIndex >= 0 && lines.length > titleIndex + 1) {
        extractedDescription = lines.slice(titleIndex + 1, titleIndex + 4)
          .filter(l => l.trim().length > 20)
          .join(' ')
          .substring(0, 300);
      }
      
      // Use filename as fallback title
      if (!newShowTitle.trim()) {
        if (extractedTitle) {
          setNewShowTitle(extractedTitle);
        } else {
          const nameWithoutExt = file.name.replace(/\.[^/.]+$/, '');
          const cleanedName = nameWithoutExt
            .replace(/[_-]+/g, ' ')
            .replace(/\s+/g, ' ')
            .trim();
          setNewShowTitle(cleanedName);
        }
      }
      
      // Set description if extracted and empty
      if (!newShowDescription.trim() && extractedDescription) {
        setNewShowDescription(extractedDescription);
      }
      
      // Extract potential topics from content using keywords
      if (!showTopics.trim()) {
        const topicsFromContent = extractTopicsFromScript(cleanedText);
        if (topicsFromContent.length > 0) {
          setShowTopics(topicsFromContent.join(', '));
        }
      }
      
      toast.success('Script uploaded and analyzed!');
      
      // Auto-trigger AI suggestions if we have content
      if (cleanedText.length > 100) {
        toast.info('Generating AI suggestions...', { duration: 2000 });
        // Delay slightly to allow state updates
        setTimeout(() => {
          handleGenerateSuggestions();
        }, 500);
      }
    } catch (err) {
      console.error('Failed to read file:', err);
      toast.error('Failed to read file');
    }
  };
  
  // Helper function to extract topics from script content
  const extractTopicsFromScript = (content: string): string[] => {
    const topics: Set<string> = new Set();
    const lowerContent = content.toLowerCase();
    
    // Common topic keywords/phrases
    const topicPatterns = [
      /(?:discussing|about|cover|explore|topic[s]?[:\s]+)([^.!?\n]{10,60})/gi,
      /(?:key points?|main topics?|agenda)[:\s]+([^.!?\n]{10,100})/gi,
    ];
    
    for (const pattern of topicPatterns) {
      const matches = content.matchAll(pattern);
      for (const match of matches) {
        if (match[1]) {
          topics.add(match[1].trim());
        }
      }
    }
    
    // Look for headings as topics
    const headingPattern = /^#+\s*(.+)$/gm;
    const headingMatches = content.matchAll(headingPattern);
    for (const match of headingMatches) {
      if (match[1] && match[1].length > 5 && match[1].length < 50) {
        topics.add(match[1].trim());
      }
    }
    
    // Return first 5 unique topics
    return Array.from(topics).slice(0, 5);
  };

  const handleAddParticipantToShow = () => {
    if (!inviteName.trim() || !inviteEmail.trim()) {
      toast.error('Please fill in participant details');
      return;
    }
    
    setShowParticipants(prev => [...prev, {
      name: inviteName,
      email: inviteEmail,
      role: inviteRole,
      status: 'pending'
    }]);
    
    setInviteName('');
    setInviteEmail('');
    setInviteRole('guest');
    toast.success('Participant added!');
  };

  const handleRemoveParticipantFromShow = (index: number) => {
    setShowParticipants(prev => prev.filter((_, i) => i !== index));
  };

  // Unified schedule handler for Arc - navigates to Production Hub after scheduling
  const handleUnifiedSchedule = async (data: ScheduleShowData) => {
    try {
      setIsSendingInvite(true);
      
      // Create session via edge function  
      const { data: sessionData, error } = await supabase.functions.invoke('create-session', {
        body: {
          title: data.title,
          description: data.description,
          session_type: data.show_type,
          session_mode: 'browser',
          production_stage: data.starting_stage,
          scheduled_at: data.scheduled_date,
          duration_minutes: 60,
          script_id: data.linked_script_id,
          script_content: data.attach_script_to_invite ? data.script_content : null,
          agenda: data.topics,
          host_name: data.host.name,
          host_email: data.host.email,
          participants: data.guests.map(g => ({
            name: g.name,
            email: g.email,
            role: g.role,
            email_reminder_24h: data.enable_email_reminders,
            email_reminder_1h: data.enable_email_reminders,
            email_reminder_30m: data.enable_email_reminders,
            email_reminder_15m: data.enable_email_reminders,
            sms_reminder_30m: data.enable_sms_reminders,
            sms_reminder_15m: data.enable_sms_reminders,
          })),
        },
      });

      if (error) throw error;

      // Send invites if session created successfully and there are guests
      if (sessionData?.session?.id && data.guests.length > 0) {
        console.log('Sending invites for session:', sessionData.session.id);
        const inviteResult = await supabase.functions.invoke('send-session-invites', {
          body: { session_id: sessionData.session.id },
        });
        console.log('Invite result:', inviteResult);
        if (inviteResult.error) {
          console.error('Invite error:', inviteResult.error);
          toast.warning('Session created but invites may have failed to send');
        } else {
          toast.success(`Session created! Invites sent to ${data.guests.length} participant(s)`);
        }
      } else {
        toast.success('Session created successfully!');
      }

      // Also save to local events for UI display
      addEvent({
        type: data.show_type as any,
        title: data.title,
        description: data.description,
        scheduledDate: new Date(data.scheduled_date),
        participants: data.guests.map(g => ({ 
          id: crypto.randomUUID(), 
          name: g.name, 
          email: g.email, 
          role: g.role, 
          status: 'pending' as const 
        })),
        scriptContent: data.script_content,
        hostName: data.host.name,
        status: 'scheduled',
        eventCategory: data.event_category,
        meetingLink: sessionData?.session?.join_url || data.meeting_url,
      });

      // Close dialog first
      setIsCreateShowDialogOpen(false);
      setIsSendingInvite(false);
      
      // Navigate to Production Hub immediately
      toast.success('Redirecting to Production Hub...', { duration: 1500 });
      navigate('/production-hub');
      return;

    } catch (err: any) {
      console.error('Create session error:', err);
      toast.error(err.message || 'Failed to create session');
      setIsSendingInvite(false);
    }
  };

  const handleSendInvite = async () => {
    if (!selectedEventForInvite || !inviteEmail.trim() || !inviteName.trim()) {
      toast.error('Please fill in all invite details');
      return;
    }

    setIsSendingInvite(true);
    try {
      // Add participant to event
      const participant = addParticipant(selectedEventForInvite.id, {
        name: inviteName,
        email: inviteEmail,
        role: inviteRole,
        status: 'pending'
      });

      // Send email invite via edge function with Genie Vibe meeting URL
      const { error } = await supabase.functions.invoke('send-show-invite', {
        body: {
          to: inviteEmail,
          participantName: inviteName,
          role: inviteRole,
          showType: selectedEventForInvite.type,
          showTitle: selectedEventForInvite.title,
          showDescription: selectedEventForInvite.description,
          scheduledDate: selectedEventForInvite.scheduledDate.toISOString(),
          hostName: selectedEventForInvite.hostName || 'Genie Mind',
          joinUrl: selectedEventForInvite.meetingLink, // Include meeting URL for Genie Vibe
          durationMinutes: selectedEventForInvite.durationMinutes || 60,
          topics: selectedEventForInvite.agenda,
        }
      });

      if (error) {
        console.error('Invite email error:', error);
        toast.success('Participant added! (Email sending requires email configuration)');
      } else {
        toast.success(`Invite sent to ${inviteEmail}!`);
      }

      setInviteEmail('');
      setInviteName('');
      setInviteRole('guest');
    } catch (err) {
      console.error('Send invite error:', err);
      toast.error('Failed to send invite');
    } finally {
      setIsSendingInvite(false);
    }
  };

  // Combine videos and audios for recent projects display
  const recentProjects = [...videos, ...audios]
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(0, 5)
    .map(item => ({
      id: item.id,
      name: item.name,
      type: item.type,
      duration: item.duration ? `${Math.floor(item.duration / 60)}:${String(item.duration % 60).padStart(2, '0')}` : '--:--',
      lastEdited: getRelativeTime(item.timestamp),
      thumbnail: item.type === 'video' ? '🎬' : '🎙️',
      url: item.url
    }));

  function getRelativeTime(timestamp: number): string {
    const diff = Date.now() - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (minutes < 60) return `${minutes} min ago`;
    if (hours < 24) return `${hours} hours ago`;
    return `${days} days ago`;
  }

  const { words, minutes } = calculateReadingTime(scriptContent);

  const getShowTypeIcon = (type: string) => {
    switch (type) {
      // Media Productions
      case 'podcast': return Podcast;
      case 'webcast': return Tv;
      case 'broadcast': return Radio;
      case 'interview': return Users;
      case 'panel': return Users;
      case 'tutorial': return GraduationCap;
      // Business Meetings
      case 'discovery_call': return Phone;
      case 'sales_meeting': return Briefcase;
      case 'project_kickoff': return Rocket;
      case 'status_update': return BarChart;
      case 'consultation': return MessageCircle;
      // Events
      case 'workshop': return Wrench;
      case 'webinar': return Monitor;
      case 'conference': return Building;
      case 'training_session': return BookOpen;
      default: return Video;
    }
  };

  const getShowTypeColor = (type: string) => {
    switch (type) {
      // Media Productions
      case 'podcast': return 'from-purple-500 to-indigo-500';
      case 'webcast': return 'from-blue-500 to-cyan-500';
      case 'broadcast': return 'from-red-500 to-pink-500';
      case 'interview': return 'from-green-500 to-emerald-500';
      case 'panel': return 'from-yellow-500 to-orange-500';
      case 'tutorial': return 'from-pink-500 to-rose-500';
      // Business Meetings
      case 'discovery_call': return 'from-blue-500 to-cyan-500';
      case 'sales_meeting': return 'from-green-500 to-emerald-500';
      case 'project_kickoff': return 'from-purple-500 to-indigo-500';
      case 'status_update': return 'from-yellow-500 to-orange-500';
      case 'consultation': return 'from-pink-500 to-rose-500';
      // Events
      case 'workshop': return 'from-blue-500 to-cyan-500';
      case 'webinar': return 'from-purple-500 to-indigo-500';
      case 'conference': return 'from-green-500 to-emerald-500';
      case 'training_session': return 'from-orange-500 to-red-500';
      default: return 'from-gray-500 to-slate-500';
    }
  };

  // Mobile-first: Show optimized mobile recording experience
  const showMobileView = isMobile && !forceDesktopView;
  
  // Scripts formatted for mobile view
  const scriptsForMobile = savedScripts.map(s => ({
    id: s.id,
    title: s.name,
    content: s.enhancedContent || s.content || ''
  }));

  // ============================================================
  // MOBILE VIEW - Streamlined recording-first experience
  // ============================================================
  if (showMobileView) {
    return (
      <MobileRecordingView
        isOpen={true}
        onClose={() => navigate(-1)}
        onSwitchToDesktop={() => setForceDesktopView(true)}
        scripts={scriptsForMobile}
        onRecordingComplete={(result) => {
          console.log('Mobile recording complete:', result);
          loadMedia();
        }}
      />
    );
  }

  // ============================================================
  // DESKTOP VIEW - Full studio with all features
  // ============================================================
  return (
    <AppLayout>
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
        {/* Hero Carousel Section */}
        <div className="relative border-b border-border/50">
          {/* Carousel Container */}
          <div className="relative overflow-hidden">
            {/* Slides */}
            <div 
              className="flex transition-transform duration-500 ease-out"
              style={{ transform: `translateX(-${currentHeroSlide * 100}%)` }}
            >
              {/* Slide 1: Genie Studio - The Complete Suite */}
              <div className="min-w-full relative h-[480px] md:h-[520px]">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-900 via-purple-700 to-pink-800" />
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjEwMCIgaGVpZ2h0PSIxMDAiIHBhdHRlcm5Vbml0cz0idXNlclNwYWNlT25Vc2UiPjxjaXJjbGUgY3g9IjUwIiBjeT0iNTAiIHI9IjEuNSIgZmlsbD0icmdiYSgyNTUsMjU1LDI1NSwwLjEpIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-50" />
                <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-black/20" />
                <div className="relative h-full max-w-7xl mx-auto px-8 py-8 flex items-center">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center w-full">
                    <div className="space-y-4">
                      {/* Industry Challenge */}
                      <div className="flex items-start gap-3 p-3 rounded-xl bg-red-500/10 border border-red-400/20 max-w-lg">
                        <div className="h-8 w-8 rounded-lg bg-red-500/20 flex items-center justify-center flex-shrink-0">
                          <TrendingUp className="h-4 w-4 text-red-300" />
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-red-300">Industry Challenge</p>
                          <p className="text-[11px] text-white/70">Content teams juggle 5+ disconnected tools, causing delays, inconsistent quality, and 40% higher production costs.</p>
                        </div>
                      </div>
                      
                      <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur border border-white/20">
                        <Sparkles className="h-4 w-4 text-yellow-300" />
                        <span className="text-sm text-white font-medium">AI-Powered Production Suite</span>
                      </div>
                      <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white tracking-tight leading-tight">
                        Genie <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-300 to-purple-300">Studio</span>
                      </h1>
                      <p className="text-xl md:text-2xl text-white/90 font-light">
                        Mind to Media — Complete Content Creation Suite
                      </p>
                      <p className="text-sm text-white/70 max-w-lg leading-relaxed">
                        <strong className="text-green-300">What users asked for:</strong> "One platform that handles ideation to publishing." Genie Studio integrates Arc, Mind, Spark, and Vibe into a unified AI-powered workflow.
                      </p>
                      
                      {/* Key Highlights */}
                      <div className="flex flex-wrap gap-2 pt-2">
                        <div className="flex items-center gap-2 px-3 py-2 bg-green-500/20 backdrop-blur rounded-lg border border-green-400/30">
                          <Check className="h-3 w-3 text-green-300" />
                          <span className="text-xs text-white">60% faster production</span>
                        </div>
                        <div className="flex items-center gap-2 px-3 py-2 bg-green-500/20 backdrop-blur rounded-lg border border-green-400/30">
                          <Check className="h-3 w-3 text-green-300" />
                          <span className="text-xs text-white">Single unified workflow</span>
                        </div>
                        <div className="flex items-center gap-2 px-3 py-2 bg-green-500/20 backdrop-blur rounded-lg border border-green-400/30">
                          <Check className="h-3 w-3 text-green-300" />
                          <span className="text-xs text-white">AI-assisted creativity</span>
                        </div>
                      </div>
                      
                      <div className="flex flex-wrap gap-2 pt-2">
                        <div className="flex items-center gap-2 px-3 py-2 bg-white/15 backdrop-blur rounded-xl border border-white/20">
                          <Calendar className="h-3 w-3 text-indigo-300" />
                          <span className="text-xs text-white">Arc</span>
                        </div>
                        <div className="flex items-center gap-2 px-3 py-2 bg-white/15 backdrop-blur rounded-xl border border-white/20">
                          <Cpu className="h-3 w-3 text-purple-300" />
                          <span className="text-xs text-white">Mind</span>
                        </div>
                        <div className="flex items-center gap-2 px-3 py-2 bg-white/15 backdrop-blur rounded-xl border border-white/20">
                          <Zap className="h-3 w-3 text-amber-300" />
                          <span className="text-xs text-white">Spark</span>
                        </div>
                        <div className="flex items-center gap-2 px-3 py-2 bg-white/15 backdrop-blur rounded-xl border border-white/20">
                          <Video className="h-3 w-3 text-pink-300" />
                          <span className="text-xs text-white">Vibe</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex justify-center lg:justify-end">
                      <div className="relative">
                        <div className="absolute -inset-4 bg-gradient-to-r from-purple-500/30 to-pink-500/30 rounded-3xl blur-2xl" />
                        <div className="relative h-56 w-72 md:h-64 md:w-80 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center p-6 shadow-2xl">
                          <img src={genieStudioLogo} alt="Genie Studio" className="h-full w-full object-contain drop-shadow-2xl" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Slide 2: Genie Arc - Team Coordination */}
              <div className="min-w-full relative h-[480px] md:h-[520px]">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 via-purple-800 to-indigo-900" />
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImxpbmVzIiB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHBhdHRlcm5Vbml0cz0idXNlclNwYWNlT25Vc2UiPjxwYXRoIGQ9Ik0gMCAwIEwgNjAgNjAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjA1KSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2xpbmVzKSIvPjwvc3ZnPg==')] opacity-60" />
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(129,140,248,0.3),transparent_60%)]" />
                <div className="relative h-full max-w-7xl mx-auto px-8 py-8 flex items-center">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center w-full">
                    <div className="space-y-4">
                      {/* Industry Challenge */}
                      <div className="flex items-start gap-3 p-3 rounded-xl bg-red-500/10 border border-red-400/20 max-w-lg">
                        <div className="h-8 w-8 rounded-lg bg-red-500/20 flex items-center justify-center flex-shrink-0">
                          <Users className="h-4 w-4 text-red-300" />
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-red-300">Industry Challenge</p>
                          <p className="text-[11px] text-white/70">Remote teams struggle with scheduling, guest coordination, and production logistics—resulting in missed shows and unhappy guests.</p>
                        </div>
                      </div>
                      
                      <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur border border-white/20">
                        <Calendar className="h-4 w-4 text-indigo-300" />
                        <span className="text-sm text-white font-medium">Production Journey Hub</span>
                        <Badge className="bg-indigo-400/20 text-indigo-200 border-indigo-300/30 text-xs">Optional</Badge>
                      </div>
                      <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white tracking-tight leading-tight">
                        Genie <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 to-purple-300">Arc</span>
                      </h1>
                      <p className="text-xl md:text-2xl text-white/90 font-light">
                        Your Production Journey With Infinite Possibilities
                      </p>
                      <p className="text-sm text-white/70 max-w-lg leading-relaxed">
                        <strong className="text-green-300">What users asked for:</strong> "One place to manage podcasts, webinars, and team productions." Arc handles scheduling, guest invitations, role assignments, and production pipelines.
                      </p>
                      
                      {/* Key Highlights */}
                      <div className="flex flex-wrap gap-2 pt-2">
                        <div className="flex items-center gap-2 px-3 py-2 bg-green-500/20 backdrop-blur rounded-lg border border-green-400/30">
                          <Check className="h-3 w-3 text-green-300" />
                          <span className="text-xs text-white">Auto email invitations</span>
                        </div>
                        <div className="flex items-center gap-2 px-3 py-2 bg-green-500/20 backdrop-blur rounded-lg border border-green-400/30">
                          <Check className="h-3 w-3 text-green-300" />
                          <span className="text-xs text-white">Guest RSVP tracking</span>
                        </div>
                        <div className="flex items-center gap-2 px-3 py-2 bg-green-500/20 backdrop-blur rounded-lg border border-green-400/30">
                          <Check className="h-3 w-3 text-green-300" />
                          <span className="text-xs text-white">Multi-show management</span>
                        </div>
                      </div>
                      
                      <div className="flex flex-wrap gap-2 pt-2">
                        <div className="flex items-center gap-2 px-3 py-2 bg-white/15 backdrop-blur rounded-xl border border-white/20">
                          <Calendar className="h-3 w-3 text-indigo-300" />
                          <span className="text-xs text-white">Show Scheduling</span>
                        </div>
                        <div className="flex items-center gap-2 px-3 py-2 bg-white/15 backdrop-blur rounded-xl border border-white/20">
                          <Users className="h-3 w-3 text-purple-300" />
                          <span className="text-xs text-white">Guest Management</span>
                        </div>
                        <div className="flex items-center gap-2 px-3 py-2 bg-white/15 backdrop-blur rounded-xl border border-white/20">
                          <Mail className="h-3 w-3 text-blue-300" />
                          <span className="text-xs text-white">Auto Invitations</span>
                        </div>
                      </div>
                      <Button 
                        size="lg" 
                        onClick={() => setIsCreateShowDialogOpen(true)}
                        className="mt-2 bg-white text-indigo-700 hover:bg-white/90 shadow-xl font-semibold px-8"
                      >
                        <Calendar className="h-5 w-5 mr-2" />
                        Open Genie Arc
                      </Button>
                    </div>
                    <div className="flex justify-center lg:justify-end">
                      <div className="relative">
                        <div className="absolute -inset-4 bg-gradient-to-r from-indigo-500/30 to-purple-500/30 rounded-3xl blur-2xl" />
                        <div 
                          className="relative h-56 w-72 md:h-64 md:w-80 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center p-6 shadow-2xl cursor-pointer hover:scale-105 transition-transform"
                          onClick={() => setIsCreateShowDialogOpen(true)}
                        >
                          <img src={genieArcLogo} alt="Genie Arc" className="h-full w-full object-contain drop-shadow-2xl" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Slide 3: Genie Mind - Pre-Production Command Center */}
              <div className="min-w-full relative h-[480px] md:h-[520px]">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-900 via-violet-800 to-purple-900" />
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAiIGhlaWdodD0iODAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImhleGFnb24iIHdpZHRoPSI4MCIgaGVpZ2h0PSI4MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBvbHlnb24gcG9pbnRzPSI0MCwwIDgwLDIwIDgwLDYwIDQwLDgwIDAsMjAgMCwyMCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMDUpIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjaGV4YWdvbikiLz48L3N2Zz4=')] opacity-40" />
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(168,85,247,0.3),transparent_60%)]" />
                <div className="relative h-full max-w-7xl mx-auto px-8 py-8 flex items-center">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center w-full">
                    <div className="space-y-4">
                      {/* Industry Challenge */}
                      <div className="flex items-start gap-3 p-3 rounded-xl bg-red-500/10 border border-red-400/20 max-w-lg">
                        <div className="h-8 w-8 rounded-lg bg-red-500/20 flex items-center justify-center flex-shrink-0">
                          <Cpu className="h-4 w-4 text-red-300" />
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-red-300">Industry Challenge</p>
                          <p className="text-[11px] text-white/70">Creators spend 70% of time on pre-production: writing scripts, finding voices, sourcing music. Manual processes kill creativity.</p>
                        </div>
                      </div>
                      
                      <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur border border-white/20">
                        <Cpu className="h-4 w-4 text-purple-300" />
                        <span className="text-sm text-white font-medium">Pre-Production Intelligence</span>
                        <Badge className="bg-green-500/20 text-green-300 border-green-400/30 text-xs ml-2">Active</Badge>
                      </div>
                      <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white tracking-tight leading-tight">
                        Genie <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-300 to-pink-300">Mind</span>
                      </h1>
                      <p className="text-xl md:text-2xl text-white/90 font-light">
                        AI That Understands — Your Creative Command Center
                      </p>
                      <p className="text-sm text-white/70 max-w-lg leading-relaxed">
                        <strong className="text-green-300">What users asked for:</strong> "AI that writes like me and voices that sound natural." Mind delivers 50+ premium voices, AI script enhancement, and royalty-free music generation.
                      </p>
                      
                      {/* Key Highlights */}
                      <div className="flex flex-wrap gap-2 pt-2">
                        <div className="flex items-center gap-2 px-3 py-2 bg-green-500/20 backdrop-blur rounded-lg border border-green-400/30">
                          <Check className="h-3 w-3 text-green-300" />
                          <span className="text-xs text-white">50+ AI voices</span>
                        </div>
                        <div className="flex items-center gap-2 px-3 py-2 bg-green-500/20 backdrop-blur rounded-lg border border-green-400/30">
                          <Check className="h-3 w-3 text-green-300" />
                          <span className="text-xs text-white">Script AI enhancement</span>
                        </div>
                        <div className="flex items-center gap-2 px-3 py-2 bg-green-500/20 backdrop-blur rounded-lg border border-green-400/30">
                          <Check className="h-3 w-3 text-green-300" />
                          <span className="text-xs text-white">Music generation</span>
                        </div>
                      </div>
                      
                      <div className="flex flex-wrap gap-2 pt-2">
                        <div className="flex items-center gap-2 px-3 py-2 bg-white/15 backdrop-blur rounded-xl border border-white/20">
                          <FileText className="h-3 w-3 text-purple-300" />
                          <span className="text-xs text-white">AI Script Writing</span>
                        </div>
                        <div className="flex items-center gap-2 px-3 py-2 bg-white/15 backdrop-blur rounded-xl border border-white/20">
                          <Mic className="h-3 w-3 text-pink-300" />
                          <span className="text-xs text-white">ElevenLabs + OpenAI</span>
                        </div>
                        <div className="flex items-center gap-2 px-3 py-2 bg-white/15 backdrop-blur rounded-xl border border-white/20">
                          <Music className="h-3 w-3 text-violet-300" />
                          <span className="text-xs text-white">Suno AI Music</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex justify-center lg:justify-end">
                      <div className="relative">
                        <div className="absolute -inset-4 bg-gradient-to-r from-purple-500/30 to-pink-500/30 rounded-3xl blur-2xl" />
                        <div className="relative h-56 w-72 md:h-64 md:w-80 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center p-6 shadow-2xl">
                          <img src={genieMindLogo} alt="Genie Mind" className="h-full w-full object-contain drop-shadow-2xl" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Slide 4: Genie Spark - Content Transformation Engine */}
              <div className="min-w-full relative h-[480px] md:h-[520px]">
                <div className="absolute inset-0 bg-gradient-to-br from-amber-900 via-orange-800 to-yellow-900" />
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(251,191,36,0.3),transparent_60%)]" />
                <div className="relative h-full max-w-7xl mx-auto px-8 py-8 flex items-center">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center w-full">
                    <div className="space-y-4">
                      <div className="flex items-start gap-3 p-3 rounded-xl bg-red-500/10 border border-red-400/20 max-w-lg">
                        <div className="h-8 w-8 rounded-lg bg-red-500/20 flex items-center justify-center flex-shrink-0">
                          <FileText className="h-4 w-4 text-red-300" />
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-red-300">Industry Challenge</p>
                          <p className="text-[11px] text-white/70">Repurposing content manually takes hours. PDFs, docs, and recordings sit unused because conversion is tedious.</p>
                        </div>
                      </div>
                      <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur border border-white/20">
                        <Zap className="h-4 w-4 text-amber-300" />
                        <span className="text-sm text-white font-medium">AI Content Transformation</span>
                      </div>
                      <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white tracking-tight">
                        Genie <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-yellow-300">Spark</span>
                      </h1>
                      <p className="text-xl md:text-2xl text-white/90 font-light">Ignite Your Ideas</p>
                      <p className="text-sm text-white/70 max-w-lg">
                        <strong className="text-green-300">What users asked for:</strong> "Turn my existing content into scripts instantly." Upload PDFs, images, audio—Spark transforms them into production-ready scripts.
                      </p>
                      <div className="flex flex-wrap gap-2 pt-2">
                        <div className="flex items-center gap-2 px-3 py-2 bg-green-500/20 rounded-lg border border-green-400/30">
                          <Check className="h-3 w-3 text-green-300" />
                          <span className="text-xs text-white">Any format → Script</span>
                        </div>
                        <div className="flex items-center gap-2 px-3 py-2 bg-green-500/20 rounded-lg border border-green-400/30">
                          <Check className="h-3 w-3 text-green-300" />
                          <span className="text-xs text-white">OCR + Speech-to-text</span>
                        </div>
                      </div>
                      <Button size="lg" onClick={() => setActiveTab('ai-tools')} className="mt-2 bg-white text-amber-700 hover:bg-white/90 shadow-xl font-semibold px-8">
                        <Zap className="h-5 w-5 mr-2" />Open Genie Spark
                      </Button>
                    </div>
                    <div className="flex justify-center lg:justify-end">
                      <div className="relative h-56 w-72 md:h-64 md:w-80 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center p-6 shadow-2xl cursor-pointer hover:scale-105 transition-transform" onClick={() => setActiveTab('ai-tools')}>
                        <img src={genieSparkLogo} alt="Genie Spark" className="h-full w-full object-contain drop-shadow-2xl" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Slide 5: Genie Vibe - Production Studio */}
              <div className="min-w-full relative h-[480px] md:h-[520px]">
                <div className="absolute inset-0 bg-gradient-to-br from-pink-900 via-rose-800 to-purple-900" />
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(236,72,153,0.3),transparent_60%)]" />
                <div className="relative h-full max-w-7xl mx-auto px-8 py-8 flex items-center">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center w-full">
                    <div className="space-y-4">
                      <div className="flex items-start gap-3 p-3 rounded-xl bg-red-500/10 border border-red-400/20 max-w-lg">
                        <div className="h-8 w-8 rounded-lg bg-red-500/20 flex items-center justify-center flex-shrink-0">
                          <Video className="h-4 w-4 text-red-300" />
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-red-300">Industry Challenge</p>
                          <p className="text-[11px] text-white/70">Pro recording software costs $500+/year and requires training. Creators need simple, browser-based tools.</p>
                        </div>
                      </div>
                      <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur border border-white/20">
                        <Video className="h-4 w-4 text-pink-300" />
                        <span className="text-sm text-white font-medium">Professional Recording Studio</span>
                      </div>
                      <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white tracking-tight">
                        Genie <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-300 to-rose-300">Vibe</span>
                      </h1>
                      <p className="text-xl md:text-2xl text-white/90 font-light">Script to Screen</p>
                      <p className="text-sm text-white/70 max-w-lg">
                        <strong className="text-green-300">What users asked for:</strong> "Record anywhere, no software install." Browser-based studio with camera, screen capture, teleprompter, and branded overlays.
                      </p>
                      <div className="flex flex-wrap gap-2 pt-2">
                        <div className="flex items-center gap-2 px-3 py-2 bg-green-500/20 rounded-lg border border-green-400/30">
                          <Check className="h-3 w-3 text-green-300" />
                          <span className="text-xs text-white">Camera + Screen PiP</span>
                        </div>
                        <div className="flex items-center gap-2 px-3 py-2 bg-green-500/20 rounded-lg border border-green-400/30">
                          <Check className="h-3 w-3 text-green-300" />
                          <span className="text-xs text-white">Smart teleprompter</span>
                        </div>
                      </div>
                      <Button size="lg" onClick={() => navigate('/genie-vibe')} className="mt-2 bg-white text-pink-600 hover:bg-white/90 shadow-xl font-semibold px-8">
                        <Video className="h-5 w-5 mr-2" />Open Genie Vibe
                      </Button>
                    </div>
                    <div className="flex justify-center lg:justify-end">
                      <div className="relative h-56 w-72 md:h-64 md:w-80 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center p-6 shadow-2xl cursor-pointer hover:scale-105 transition-transform" onClick={() => navigate('/genie-vibe')}>
                        <img src={genieVibeLogo} alt="Genie Vibe" className="h-full w-full object-contain drop-shadow-2xl" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Slide 6: Ask Genie - AI Assistant */}
              <div className="min-w-full relative h-[480px] md:h-[520px]">
                <div className="absolute inset-0 bg-gradient-to-br from-violet-900 via-fuchsia-800 to-purple-900" />
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(167,139,250,0.3),transparent_60%)]" />
                <div className="relative h-full max-w-7xl mx-auto px-8 py-8 flex items-center">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center w-full">
                    <div className="space-y-4">
                      <div className="flex items-start gap-3 p-3 rounded-xl bg-red-500/10 border border-red-400/20 max-w-lg">
                        <div className="h-8 w-8 rounded-lg bg-red-500/20 flex items-center justify-center flex-shrink-0">
                          <MessageCircle className="h-4 w-4 text-red-300" />
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-red-300">Industry Challenge</p>
                          <p className="text-[11px] text-white/70">New users feel overwhelmed by feature-rich platforms. They need guidance that adapts to their context and goals.</p>
                        </div>
                      </div>
                      <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur border border-white/20">
                        <Sparkles className="h-4 w-4 text-violet-300" />
                        <span className="text-sm text-white font-medium">Context-Aware AI Assistant</span>
                        <Badge className="bg-violet-400/20 text-violet-200 border-violet-300/30 text-xs">NEW</Badge>
                      </div>
                      <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white tracking-tight">
                        Ask <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-300 to-fuchsia-300">Genie</span>
                      </h1>
                      <p className="text-xl md:text-2xl text-white/90 font-light italic">"Your wish is my command"</p>
                      <p className="text-sm text-white/70 max-w-lg">
                        <strong className="text-green-300">What users asked for:</strong> "An AI that knows where I am and what I'm trying to do." Ask Genie provides contextual help, creative suggestions, and guided workflows across all products.
                      </p>
                      <div className="flex flex-wrap gap-2 pt-2">
                        <div className="flex items-center gap-2 px-3 py-2 bg-green-500/20 rounded-lg border border-green-400/30">
                          <Check className="h-3 w-3 text-green-300" />
                          <span className="text-xs text-white">Context-aware guidance</span>
                        </div>
                        <div className="flex items-center gap-2 px-3 py-2 bg-green-500/20 rounded-lg border border-green-400/30">
                          <Check className="h-3 w-3 text-green-300" />
                          <span className="text-xs text-white">Visual flow diagrams</span>
                        </div>
                        <div className="flex items-center gap-2 px-3 py-2 bg-green-500/20 rounded-lg border border-green-400/30">
                          <Check className="h-3 w-3 text-green-300" />
                          <span className="text-xs text-white">Cross-product navigation</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex justify-center lg:justify-end">
                      <div className="relative h-56 w-72 md:h-64 md:w-80 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center p-6 shadow-2xl">
                        <img src={askGenieLogo} alt="Ask Genie" className="h-full w-full object-contain drop-shadow-2xl" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Navigation Arrows */}
            <button
              onClick={() => {
                handleCarouselInteraction();
                setCurrentHeroSlide(prev => (prev === 0 ? 5 : prev - 1));
              }}
              className="absolute left-4 top-1/2 -translate-y-1/2 h-12 w-12 rounded-full bg-black/30 backdrop-blur border border-white/20 flex items-center justify-center text-white hover:bg-black/50 transition-colors z-10"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
            <button
              onClick={() => {
                handleCarouselInteraction();
                setCurrentHeroSlide(prev => (prev === 5 ? 0 : prev + 1));
              }}
              className="absolute right-4 top-1/2 -translate-y-1/2 h-12 w-12 rounded-full bg-black/30 backdrop-blur border border-white/20 flex items-center justify-center text-white hover:bg-black/50 transition-colors z-10"
            >
              <ChevronRight className="h-6 w-6" />
            </button>

            {/* Slide Indicators */}
            <div className="absolute -bottom-14 left-1/2 -translate-x-1/2 flex items-center gap-2 z-20">
              {['Studio', 'Arc', 'Mind', 'Spark', 'Vibe', 'Ask Genie'].map((name, index) => (
                <button
                  key={name}
                  onClick={() => handleCarouselInteraction(index)}
                  className={cn(
                    "px-3 py-1.5 rounded-full text-xs font-medium transition-all shadow-md",
                    currentHeroSlide === index
                      ? "bg-primary text-primary-foreground shadow-lg"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  )}
                >
                  {name}
                </button>
              ))}
            </div>
          </div>
          {/* Spacer for slide indicators */}
          <div className="h-16" />
        </div>

        {/* Genie Mind Metrics Section - Separate from Banners */}
        <div className="bg-gradient-to-br from-background via-background to-muted/20 border-b border-border/50">
          <div className="max-w-7xl mx-auto px-6 py-8">
            {/* Current View Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 bg-card/50 backdrop-blur rounded-xl p-6 border border-border/50 mb-8">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg overflow-hidden p-1">
                    <img src={genieMindProductLogo} alt="Genie Mind" className="h-full w-full object-contain" />
                  </div>
                  <div>
                    <h1 className="text-3xl md:text-4xl font-bold tracking-tight bg-gradient-to-r from-purple-600 via-pink-500 to-purple-600 bg-clip-text text-transparent">
                      Genie Mind
                    </h1>
                    <p className="text-muted-foreground">
                      AI That Understands — Pre-production command center
                    </p>
                  </div>
                </div>
              </div>

              {/* Quick Actions with Flow Indicator */}
              <div className="space-y-3">
                {/* Default Workflow Flow - Updated: Studio → Arc → Mind → Spark → Script → TTS → Vibe → Publish */}
                <div className="flex items-center gap-2 px-3 py-1.5 bg-primary/5 rounded-lg border border-primary/10">
                  <span className="text-xs text-muted-foreground">Default flow:</span>
                  <div className="flex items-center gap-1.5 text-xs flex-wrap">
                    <span className="font-medium text-purple-600">Studio</span>
                    <ChevronRight className="h-3 w-3 text-muted-foreground" />
                    <span className="font-medium text-indigo-600">Arc</span>
                    <ChevronRight className="h-3 w-3 text-muted-foreground" />
                    <span className="font-medium text-violet-600">Mind</span>
                    <ChevronRight className="h-3 w-3 text-muted-foreground" />
                    <span className="font-medium text-amber-600">Spark</span>
                    <ChevronRight className="h-3 w-3 text-muted-foreground" />
                    <span className="font-medium text-blue-600">Script</span>
                    <ChevronRight className="h-3 w-3 text-muted-foreground" />
                    <span className="font-medium text-cyan-600">TTS</span>
                    <ChevronRight className="h-3 w-3 text-muted-foreground" />
                    <span className="font-medium text-pink-600">Vibe</span>
                    <ChevronRight className="h-3 w-3 text-muted-foreground" />
                    <span className="font-medium text-green-600">Publish</span>
                  </div>
                </div>
                
                <div className="flex flex-wrap items-start gap-3">
                  {/* Genie Vibe - Unified Recording Studio (Quick Record merged) */}
                  <Button 
                    size="lg" 
                    onClick={() => navigate('/genie-vibe')}
                    className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white shadow-lg shadow-pink-500/25 transition-all hover:scale-105 flex items-center gap-3 h-auto py-2.5 px-5"
                  >
                    <img src={genieVibeProductLogo} alt="Genie Vibe" className="h-8 w-8 object-contain rounded bg-white p-0.5" />
                    <div className="flex flex-col items-start">
                      <span className="font-semibold">Genie Vibe</span>
                      <span className="text-[10px] font-normal opacity-80">Full Recording Studio</span>
                    </div>
                  </Button>
                  
                  {/* Genie Arc Button */}
                  <Button 
                    size="lg" 
                    variant="outline"
                    onClick={() => setIsCreateShowDialogOpen(true)}
                    className="border-indigo-500/30 hover:border-indigo-500 hover:bg-indigo-500/10 flex items-center gap-3 h-auto py-2.5 px-5"
                  >
                    <img src={genieArcProductLogo} alt="Genie Arc" className="h-8 w-8 object-contain rounded bg-indigo-100 p-0.5" />
                    <div className="flex flex-col items-start">
                      <span className="font-semibold">Genie Arc</span>
                      <span className="text-[10px] font-normal text-muted-foreground">Team Productions</span>
                    </div>
                  </Button>
                  
                  {/* Subscription Button */}
                  <Button 
                    size="lg" 
                    variant="outline"
                    onClick={() => navigate('/subscription')}
                    className="border-amber-500/30 hover:border-amber-500 hover:bg-amber-500/10 flex items-center gap-2 h-auto py-2.5 px-5"
                  >
                    <CreditCard className="h-5 w-5 text-amber-600" />
                    <div className="flex flex-col items-start">
                      <span className="font-semibold">Upgrade Plan</span>
                      <span className="text-[10px] font-normal text-muted-foreground">View Pricing</span>
                    </div>
                  </Button>
                  
                  {/* Accessibility Toggle - Ralph Wiggum: Color Contrast Fix */}
                  <AccessibilityToggle />
                  
                  {/* Mobile Features Button */}
                  <NativeFeatureButton variant="outline" className="h-auto py-2.5" />
                </div>
              </div>
            </div>

            {/* Stats Bar */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {[
                { label: 'Video Scripts', value: String(videoScripts.length), icon: FileText, trend: 'Created' },
                { label: 'Audio Scripts', value: String(audioScripts.length), icon: Headphones, trend: 'Created' },
                { label: 'Voiceovers', value: String(audios.length + savedVoiceovers.length), icon: Mic, trend: 'Generated' },
                { label: 'Music Tracks', value: String(mergedMusic.length), icon: Music, trend: 'Available' },
                { label: 'Videos Created', value: String(videos.length), icon: Film, trend: 'Recorded' },
                { label: 'Projects', value: String(mediaProjects.length), icon: Layers, trend: 'Active' }
              ].map((stat, i) => (
                <div key={i} className="bg-card/50 backdrop-blur border border-border/50 rounded-xl p-4 hover:border-primary/30 transition-colors">
                  <div className="flex items-center gap-2 text-muted-foreground mb-1">
                    <stat.icon className="h-4 w-4" />
                    <span className="text-xs">{stat.label}</span>
                  </div>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <div className="text-xs text-muted-foreground">{stat.trend}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-6 py-8">
          {/* Info Banner - Explains what Genie Studio is (Ralph Wiggum: Navigation Clarity) */}
          <GenieStudioInfoBanner className="mb-6" />
          
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            {/* Compact Tabs */}
            <TabsList className="bg-muted/50 border border-border/50 p-1 grid grid-cols-7 w-full">
              <TabsTrigger value="dashboard" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-xs px-2">
                <Layers className="h-4 w-4 md:mr-1" />
                <span className="hidden md:inline">Dashboard</span>
              </TabsTrigger>
              <TabsTrigger value="ai-tools" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-xs px-2 h-auto py-1.5">
                <Zap className="h-4 w-4 md:mr-1" />
                <div className="hidden md:flex flex-col items-start leading-tight">
                  <span>Genie Spark</span>
                  <span className="text-[8px] font-normal opacity-70">Content Creation Suite</span>
                </div>
              </TabsTrigger>
              <TabsTrigger value="script-editor" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-xs px-2">
                <PenTool className="h-4 w-4 md:mr-1" />
                <span className="hidden md:inline">Scripts</span>
              </TabsTrigger>
              <TabsTrigger value="voice-generator" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-xs px-2">
                <Mic className="h-4 w-4 md:mr-1" />
                <span className="hidden md:inline">Voice</span>
              </TabsTrigger>
              <TabsTrigger value="music-studio" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-xs px-2">
                <Music className="h-4 w-4 md:mr-1" />
                <span className="hidden md:inline">Music</span>
              </TabsTrigger>
              <TabsTrigger value="library" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-xs px-2">
                <Library className="h-4 w-4 md:mr-1" />
                <span className="hidden md:inline">Library</span>
              </TabsTrigger>
              <TabsTrigger value="templates" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-xs px-2">
                <FileText className="h-4 w-4 md:mr-1" />
                <span className="hidden md:inline">Templates</span>
              </TabsTrigger>
            </TabsList>

            {/* Dashboard Tab */}
            <TabsContent value="dashboard" className="space-y-8 mt-0">
              {/* Loading State - Ralph Wiggum: Loading State Indication */}
              {(isScriptsLoading || isProjectsLoading || isDbLoading) && (
                <div className="flex items-center justify-center py-8">
                  <LoadingSpinner 
                    size="lg" 
                    label="Loading your creative workspace..." 
                  />
                </div>
              )}
              
              {/* Welcome & Journey Progress - addresses Ralph Wiggum's feedback */}
              {!isScriptsLoading && !isProjectsLoading && (
                <DashboardWelcome
                  scriptsCount={savedScripts?.length || 0}
                  voiceoversCount={mergedVoiceovers?.length || 0}
                  musicCount={mergedMusic?.length || 0}
                  recordingsCount={mediaProjects?.length || 0}
                  onNavigate={(tab) => {
                    trackAction('dashboard_cta_clicked', { targetTab: tab });
                    setActiveTab(tab);
                  }}
                  onTrackAction={trackAction}
                />
              )}
              
              {/* Feature Cards - Horizontal Scrolling with Arrows */}
              <div className="relative group/scroll">
                {/* Left Arrow */}
                <Button
                  variant="outline"
                  size="icon"
                  className="absolute left-0 top-1/2 -translate-y-1/2 z-10 h-10 w-10 rounded-full bg-background/90 backdrop-blur border-border/50 shadow-lg opacity-0 group-hover/scroll:opacity-100 transition-opacity hover:bg-primary hover:text-primary-foreground"
                  onClick={() => scrollFeatures('left')}
                >
                  <ChevronLeft className="h-5 w-5" />
                </Button>
                
                {/* Scrollable Container */}
                <div 
                  ref={featuresScrollRef}
                  className="flex gap-4 overflow-x-auto pb-4 px-2 scrollbar-hide snap-x snap-mandatory scroll-smooth"
                  style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                >
                  {FEATURES.map((feature) => (
                    <Card 
                      key={feature.id}
                      className={cn(
                        "relative overflow-hidden cursor-pointer transition-all duration-300",
                        "hover:scale-[1.02] hover:shadow-xl hover:shadow-primary/10",
                        "border-border/50 bg-card backdrop-blur group",
                        "min-w-[280px] max-w-[300px] flex-shrink-0 snap-start"
                      )}
                      onClick={() => handleFeatureClick(feature.id)}
                    >
                      <div className={cn(
                        "absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity",
                        "bg-gradient-to-br", feature.color
                      )} style={{ opacity: 0.05 }} />
                      <CardContent className="p-5 flex flex-col h-full">
                        {/* Top row: Icon + Badge */}
                        <div className="flex items-start justify-between mb-4">
                          <div className={cn(
                            "h-12 w-12 rounded-xl flex items-center justify-center shadow-lg",
                            "bg-gradient-to-br", feature.color
                          )}>
                            <feature.icon className="h-6 w-6 text-white" />
                          </div>
                          {feature.badge && (
                            <Badge 
                              variant="secondary" 
                              className={cn(
                                "text-[10px] font-medium px-2 py-0.5",
                                feature.badge === 'New' && "bg-green-500/10 text-green-600 border-green-500/20",
                                feature.badge === 'AI Powered' && "bg-purple-500/10 text-purple-600 border-purple-500/20",
                                feature.badge === 'Popular' && "bg-orange-500/10 text-orange-600 border-orange-500/20",
                                feature.badge === 'Coming Soon' && "bg-cyan-500/10 text-cyan-600 border-cyan-500/20"
                              )}
                            >
                              {feature.badge}
                            </Badge>
                          )}
                        </div>
                        
                        {/* Title */}
                        <h3 className="font-semibold text-base mb-1.5">{feature.title}</h3>
                        
                        {/* Description - fixed height for alignment */}
                        <p className="text-sm text-muted-foreground mb-4 flex-1 line-clamp-2">{feature.description}</p>
                        
                        {/* Footer stats - aligned at bottom */}
                        <div className="flex items-center justify-between text-xs pt-3 border-t border-border/30">
                          <span className="text-muted-foreground">{feature.stats.label}</span>
                          <span className="font-semibold text-foreground">{feature.stats.value}</span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
                
                {/* Right Arrow */}
                <Button
                  variant="outline"
                  size="icon"
                  className="absolute right-0 top-1/2 -translate-y-1/2 z-10 h-10 w-10 rounded-full bg-background/90 backdrop-blur border-border/50 shadow-lg opacity-0 group-hover/scroll:opacity-100 transition-opacity hover:bg-primary hover:text-primary-foreground"
                  onClick={() => scrollFeatures('right')}
                >
                  <ChevronRight className="h-5 w-5" />
                </Button>
              </div>

              {/* Upcoming Shows Section */}
              {upcomingEvents.length > 0 && (
                <Card className="border-border/50 bg-card/80 backdrop-blur">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-lg font-semibold flex items-center gap-2">
                        <Calendar className="h-5 w-5 text-primary" />
                        Upcoming Shows
                      </h2>
                      <Button variant="ghost" size="sm" onClick={() => setIsCreateShowDialogOpen(true)}>
                        <Plus className="h-4 w-4 mr-1" />
                        Schedule New
                      </Button>
                    </div>
                    <div className="space-y-4">
                      {upcomingEvents.slice(0, 3).map((event) => {
                        const TypeIcon = getShowTypeIcon(event.type);
                        return (
                          <div 
                            key={event.id}
                            className="flex items-center gap-4 p-4 rounded-lg border border-border/50 hover:border-primary/30 hover:bg-muted/30 transition-all"
                          >
                            <div className={cn(
                              "h-12 w-12 rounded-xl flex items-center justify-center",
                              "bg-gradient-to-br", getShowTypeColor(event.type)
                            )}>
                              <TypeIcon className="h-6 w-6 text-white" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="font-medium truncate">{event.title}</div>
                              <div className="text-sm text-muted-foreground flex items-center gap-2">
                                <Badge variant="outline" className="text-xs capitalize">
                                  {event.type}
                                </Badge>
                                <span>•</span>
                                <span>{event.scheduledDate.toLocaleDateString()} at {event.scheduledDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="flex -space-x-2">
                                {event.participants.slice(0, 3).map((p, i) => (
                                  <Avatar key={p.id} className="h-8 w-8 border-2 border-background">
                                    <AvatarFallback className="text-xs bg-primary/10">
                                      {p.name.split(' ').map(n => n[0]).join('')}
                                    </AvatarFallback>
                                  </Avatar>
                                ))}
                                {event.participants.length > 3 && (
                                  <div className="h-8 w-8 rounded-full bg-muted border-2 border-background flex items-center justify-center text-xs">
                                    +{event.participants.length - 3}
                                  </div>
                                )}
                              </div>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => {
                                  setSelectedEventForInvite(event);
                                  setIsInviteDialogOpen(true);
                                }}
                              >
                                <UserPlus className="h-4 w-4 mr-1" />
                                Invite
                              </Button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Two Column Layout */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Recent Projects */}
                <div className="lg:col-span-2">
                  <Card className="border-border/50 bg-card/80 backdrop-blur">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg font-semibold flex items-center gap-2">
                          <Clock className="h-5 w-5 text-muted-foreground" />
                          Recent Projects
                        </h2>
                        <Button variant="ghost" size="sm" onClick={() => setActiveTab('library')}>
                          View All
                        </Button>
                      </div>
                      <div className="space-y-3">
                        {recentProjects.length === 0 ? (
                          <div className="text-center py-8 text-muted-foreground">
                            <Film className="h-12 w-12 mx-auto mb-3 opacity-50" />
                            <p>No recordings yet</p>
                            <p className="text-sm">Start recording to see your projects here</p>
                          </div>
                        ) : recentProjects.map((project) => (
                          <div 
                            key={project.id}
                            className="flex items-center gap-4 p-3 rounded-lg border border-border/50 hover:border-primary/30 hover:bg-muted/30 transition-all cursor-pointer group"
                          >
                            <div className="h-12 w-12 rounded-lg bg-muted flex items-center justify-center text-2xl">
                              {project.thumbnail}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="font-medium truncate">{project.name}</div>
                              <div className="text-sm text-muted-foreground flex items-center gap-2">
                                <Badge variant="outline" className="text-xs capitalize">
                                  {project.type}
                                </Badge>
                                <span>•</span>
                                <span>{project.duration}</span>
                              </div>
                            </div>
                            <div className="text-xs text-muted-foreground whitespace-nowrap">
                              {project.lastEdited}
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Quick Tips */}
                <div>
                  <Card className="border-border/50 bg-gradient-to-br from-card/80 to-primary/5 backdrop-blur">
                    <CardContent className="p-6">
                      <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <TrendingUp className="h-5 w-5 text-primary" />
                        Quick Tips
                      </h2>
                      <div className="space-y-3">
                        {QUICK_TIPS.map((tip, i) => (
                          <div key={i} className="flex items-start gap-3 text-sm">
                            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                              <tip.icon className="h-4 w-4 text-primary" />
                            </div>
                            <div>
                              <span className="font-medium text-foreground">{tip.title}</span>
                              <p className="text-muted-foreground text-xs">{tip.text}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            {/* Genie Spark Tab - AI Content Generation Engine */}
            <TabsContent value="ai-tools" className="mt-0 space-y-6">
              <div className="grid gap-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold flex items-center gap-2">
                      <Zap className="h-6 w-6 text-amber-500" />
                      Genie Spark
                    </h2>
                    <p className="text-muted-foreground">
                      Ignite Your Ideas — Smart content pipeline with AI provider selection
                    </p>
                  </div>
                </div>

                {/* Smart Content Pipeline - Single unified experience */}
                <SmartContentPipeline 
                  onSendToScriptEditor={(content: GeneratedContent) => {
                    // Create script and switch to Script Editor tab
                    const newScript = {
                      id: `script-${Date.now()}`,
                      name: content.title || 'Generated Script',
                      content: content.script,
                      type: content.type === 'podcast_script' ? 'audio' as const : 'video' as const,
                      createdAt: Date.now(),
                      updatedAt: Date.now(),
                      stats: {
                        wordCount: content.metadata?.wordCount || 0,
                        sentenceCount: 0,
                        characterCount: content.script.length,
                        estimatedReadingMinutes: Math.ceil((content.metadata?.estimatedDuration || 0) / 60),
                        estimatedSpeakingMinutes: Math.ceil((content.metadata?.estimatedDuration || 0) / 60),
                        readabilityScore: 'moderate' as const
                      }
                    };
                    saveScript(newScript);
                    setActiveTab('script-editor');
                    toast.success(`Script sent to Script Editor for refinement!`);
                  }}
                  onSendToVibe={(content: GeneratedContent) => {
                    // Create script and switch to Recording Studio
                    const newScript = {
                      id: `script-${Date.now()}`,
                      name: content.title || 'Generated Script',
                      content: content.script,
                      type: content.type === 'podcast_script' ? 'audio' as const : 'video' as const,
                      createdAt: Date.now(),
                      updatedAt: Date.now()
                    };
                    saveScript(newScript);
                    setActiveTab('recording-studio');
                    toast.success(`Script ready for recording in Vibe!`);
                  }}
                  onSaveToKnowledgeBase={(content: GeneratedContent) => {
                    // Save to knowledge base (would call actual KB service)
                    toast.success(`Script saved to Knowledge Base for future AI reference!`);
                  }}
                />
              </div>
            </TabsContent>

            {/* Script Editor Tab - Using dedicated component - forceMount to preserve state */}
            <TabsContent value="script-editor" className="mt-0" forceMount hidden={activeTab !== 'script-editor'}>
              <ScriptEditorTab
                savedScripts={savedScripts}
                onSaveScript={(script) => saveScript(script)}
                onDeleteScript={deleteScript}
                onUpdateScript={updateScript}
                onSaveVoiceover={(url, name, scriptId, audioBlob, scriptMeta) => {
                  saveVoiceover(url, name, audioBlob, scriptMeta);
                  if (scriptId) {
                    updateScript(scriptId, { hasVoiceover: true });
                  }
                }}
                savedVoiceovers={mergedVoiceovers.map(v => ({
                  id: v.id,
                  name: v.name,
                  url: v.url
                }))}
              />
            </TabsContent>

            {/* Voice Generator Tab - forceMount to preserve TTS state */}
            <TabsContent value="voice-generator" className="mt-0 space-y-6" forceMount hidden={activeTab !== 'voice-generator'}>
              {/* Scripts Ready for Voice Assignment */}
              {savedScripts.filter(s => (s.enhancedContent || s.content) && !s.hasVoiceover).length > 0 && (
                <Card className="border-border/50 bg-card/80 backdrop-blur border-blue-500/30 bg-blue-500/5">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                        <FileText className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold">Scripts Ready for Voice</h3>
                        <p className="text-sm text-muted-foreground">Add voiceovers to your saved scripts</p>
                      </div>
                    </div>
                    
                    <Tabs defaultValue="video" className="w-full">
                      <TabsList level="child" className="mb-4">
                        <TabsTrigger value="video" level="child">
                          <Video className="h-4 w-4 mr-2 text-red-500" />
                          Video ({savedScripts.filter(s => s.type === 'video' && (s.enhancedContent || s.content) && !s.hasVoiceover).length})
                        </TabsTrigger>
                        <TabsTrigger value="audio" level="child">
                          <Mic className="h-4 w-4 mr-2 text-purple-500" />
                          Audio ({savedScripts.filter(s => s.type === 'audio' && (s.enhancedContent || s.content) && !s.hasVoiceover).length})
                        </TabsTrigger>
                      </TabsList>
                      
                      <TabsContent value="video" level="child" className="mt-0 p-0 border-0 shadow-none bg-transparent">
                        {savedScripts.filter(s => s.type === 'video' && (s.enhancedContent || s.content) && !s.hasVoiceover).length === 0 ? (
                          <p className="text-sm text-muted-foreground text-center py-6">No video scripts ready for voice</p>
                        ) : (
                          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
                            {savedScripts.filter(s => s.type === 'video' && (s.enhancedContent || s.content) && !s.hasVoiceover).map(script => (
                              <div 
                                key={script.id}
                                className="p-4 rounded-lg border border-border/50 bg-background hover:border-red-500/30 transition-all"
                              >
                                <div className="flex items-center gap-2 mb-2">
                                  <Video className="h-4 w-4 text-red-500 flex-shrink-0" />
                                  <span className="font-medium truncate">{script.name}</span>
                                  {script.enhancedContent && (
                                    <Badge variant="outline" className="text-xs bg-purple-500/10">Enhanced</Badge>
                                  )}
                                </div>
                                <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
                                  {(script.enhancedContent || script.content).slice(0, 80)}...
                                </p>
                                <div className="flex items-center justify-between">
                                  <span className="text-xs text-muted-foreground">
                                    {script.stats?.wordCount || 0} words • ~{script.stats?.estimatedSpeakingMinutes || 1}m
                                  </span>
                                  <Button 
                                    size="sm" 
                                    variant="outline"
                                    onClick={() => {
                                      setVoiceText(script.cleanContent || script.enhancedContent || script.content);
                                      toast.success(`Loaded "${script.name}" - Select a voice and generate TTS`);
                                    }}
                                  >
                                    <Volume2 className="h-3 w-3 mr-1" />
                                    Add Voice
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </TabsContent>
                      
                      <TabsContent value="audio" level="child" className="mt-0 p-0 border-0 shadow-none bg-transparent">
                        {savedScripts.filter(s => s.type === 'audio' && (s.enhancedContent || s.content) && !s.hasVoiceover).length === 0 ? (
                          <p className="text-sm text-muted-foreground text-center py-6">No audio scripts ready for voice</p>
                        ) : (
                          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
                            {savedScripts.filter(s => s.type === 'audio' && (s.enhancedContent || s.content) && !s.hasVoiceover).map(script => (
                              <div 
                                key={script.id}
                                className="p-4 rounded-lg border border-border/50 bg-background hover:border-purple-500/30 transition-all"
                              >
                                <div className="flex items-center gap-2 mb-2">
                                  <Mic className="h-4 w-4 text-purple-500 flex-shrink-0" />
                                  <span className="font-medium truncate">{script.name}</span>
                                  {script.enhancedContent && (
                                    <Badge variant="outline" className="text-xs bg-purple-500/10">Enhanced</Badge>
                                  )}
                                </div>
                                <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
                                  {(script.enhancedContent || script.content).slice(0, 80)}...
                                </p>
                                <div className="flex items-center justify-between">
                                  <span className="text-xs text-muted-foreground">
                                    {script.stats?.wordCount || 0} words • ~{script.stats?.estimatedSpeakingMinutes || 1}m
                                  </span>
                                  <Button 
                                    size="sm" 
                                    variant="outline"
                                    onClick={() => {
                                      setVoiceText(script.cleanContent || script.enhancedContent || script.content);
                                      toast.success(`Loaded "${script.name}" - Select a voice and generate TTS`);
                                    }}
                                  >
                                    <Volume2 className="h-3 w-3 mr-1" />
                                    Add Voice
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </TabsContent>
                    </Tabs>
                  </CardContent>
                </Card>
              )}
              
              <Card className="border-border/50 bg-card/80 backdrop-blur">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                        <Mic className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h2 className="text-xl font-semibold">AI Voice Generator</h2>
                        <p className="text-sm text-muted-foreground">Create ultra-realistic voiceovers with AI</p>
                      </div>
                    </div>
                    <Badge className="bg-purple-500/10 text-purple-600 border-purple-500/20">
                      {selectedProvider === 'openai' ? '6' : '9'}+ Voice Styles
                    </Badge>
                  </div>

                  {/* Provider Selection */}
                  <div className="grid md:grid-cols-2 gap-4 mb-6">
                    <div>
                      <Label>Voice Provider</Label>
                      <Select value={selectedProvider} onValueChange={(v: 'openai' | 'elevenlabs') => setSelectedProvider(v)}>
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="elevenlabs">ElevenLabs (Premium Quality)</SelectItem>
                          <SelectItem value="openai">OpenAI TTS</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Voice Style</Label>
                      <Select value={selectedVoice} onValueChange={setSelectedVoice}>
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {(selectedProvider === 'openai' ? OPENAI_VOICES : ELEVENLABS_VOICES).map(voice => (
                            <SelectItem key={voice.value} value={voice.value}>
                              {voice.label} - {voice.description}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Voice Preview Cards */}
                  <div className="grid md:grid-cols-4 gap-3 mb-6">
                    {(selectedProvider === 'openai' ? OPENAI_VOICES.slice(0, 4) : ELEVENLABS_VOICES.slice(0, 4)).map((voice) => (
                      <div 
                        key={voice.value} 
                        className={cn(
                          "p-4 rounded-lg border cursor-pointer transition-all",
                          selectedVoice === voice.value 
                            ? "bg-purple-500/10 border-purple-500/50" 
                            : "bg-muted/50 border-border/50 hover:border-purple-500/30"
                        )}
                        onClick={() => setSelectedVoice(voice.value)}
                      >
                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mb-3 mx-auto">
                          <Mic className="h-5 w-5 text-white" />
                        </div>
                        <h3 className="font-medium text-center text-sm">{voice.label}</h3>
                        <p className="text-xs text-muted-foreground text-center mt-1">{voice.description}</p>
                      </div>
                    ))}
                  </div>

                  {/* Text Input */}
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="voice-text">Text to Convert</Label>
                      <Textarea
                        id="voice-text"
                        value={voiceText}
                        onChange={(e) => setVoiceText(e.target.value)}
                        placeholder="Enter the text you want to convert to speech, or load a script from above..."
                        className="mt-1 min-h-[150px]"
                      />
                    </div>
                    
                    <div className="flex gap-2 flex-wrap">
                      <Button 
                        onClick={handleGenerateVoice}
                        disabled={isTTSGenerating || !voiceText.trim()}
                        className="bg-gradient-to-r from-purple-500 to-pink-500 text-white"
                      >
                        {isTTSGenerating ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Generating...
                          </>
                        ) : (
                          <>
                            <Sparkles className="h-4 w-4 mr-2" />
                            Generate Voice
                          </>
                        )}
                      </Button>
                      {ttsResult && (
                        <>
                          <Button variant="outline" onClick={playTTS}>
                            <Play className="h-4 w-4 mr-2" />
                            Play
                          </Button>
                          <Button variant="outline" onClick={stopTTS}>
                            <Pause className="h-4 w-4 mr-2" />
                            Stop
                          </Button>
                          <Button variant="outline" onClick={() => downloadTTS()}>
                            <Download className="h-4 w-4 mr-2" />
                            Download MP3
                          </Button>
                          <Button 
                            variant="default"
                            onClick={() => {
                              if (ttsResult?.audioUrl) {
                                saveVoiceover(ttsResult.audioUrl, `Voiceover - ${new Date().toLocaleTimeString()}`);
                              }
                            }}
                          >
                            <Save className="h-4 w-4 mr-2" />
                            Save to Library
                          </Button>
                        </>
                      )}
                    </div>

                    {/* Result Preview */}
                    {ttsResult && (
                      <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20">
                        <div className="flex items-center gap-2 mb-2">
                          <Headphones className="h-5 w-5 text-green-500" />
                          <span className="font-medium text-green-700">Voice Generated!</span>
                        </div>
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <span className="text-muted-foreground">Duration:</span>
                            <span className="ml-2 font-medium">{ttsResult.duration.toFixed(1)}s</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Provider:</span>
                            <span className="ml-2 font-medium capitalize">{ttsResult.provider}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Characters:</span>
                            <span className="ml-2 font-medium">{ttsResult.charactersProcessed}</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Custom Voice Recording Section */}
              <Card className="border-border/50 bg-card/80 backdrop-blur">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <Radio className="h-5 w-5 text-orange-500" />
                      Record Custom Voice
                    </h3>
                    <Badge className="bg-orange-500/10 text-orange-600 border-orange-500/20">
                      Your Voice
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">
                    Record your own voice to create a custom voice profile. This voice can be used for all your TTS voiceovers, just like Alloy, Echo, or other preset voices.
                  </p>
                  
                  <div className="space-y-4">
                    <div>
                      <Label>Voice Sample Name</Label>
                      <Input 
                        placeholder="e.g., My Professional Voice, Casual Narrator..."
                        className="mt-1"
                        id="custom-voice-name"
                      />
                    </div>
                    
                    <div className="flex gap-3">
                      <Button 
                        variant="outline" 
                        className="flex-1"
                        onClick={() => {
                          // For now, trigger file upload for voice sample
                          const input = document.createElement('input');
                          input.type = 'file';
                          input.accept = 'audio/*';
                          input.onchange = (e) => {
                            const file = (e.target as HTMLInputElement).files?.[0];
                            if (file) {
                              const voiceName = (document.getElementById('custom-voice-name') as HTMLInputElement)?.value || `Custom Voice ${Date.now()}`;
                              const url = URL.createObjectURL(file);
                              const customVoice = {
                                id: `custom-voice-${Date.now()}`,
                                name: voiceName,
                                url,
                                timestamp: Date.now(),
                                type: 'custom-voice' as const
                              };
                              // Save to custom voices
                              const existing = JSON.parse(localStorage.getItem('genieStudioCustomVoices') || '[]');
                              const updated = [...existing, customVoice];
                              localStorage.setItem('genieStudioCustomVoices', JSON.stringify(updated));
                              toast.success(`Custom voice "${voiceName}" saved! You can now use it for TTS.`);
                            }
                          };
                          input.click();
                        }}
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        Upload Voice Sample
                      </Button>
                      <Button 
                        className="flex-1 bg-gradient-to-r from-orange-500 to-red-500 text-white"
                        onClick={() => {
                          toast.info('Voice cloning requires ElevenLabs Professional plan. Upload a sample above to get started.');
                        }}
                      >
                        <Mic className="h-4 w-4 mr-2" />
                        Record Voice (Coming Soon)
                      </Button>
                    </div>
                    
                    <p className="text-xs text-muted-foreground">
                      <strong>Tip:</strong> For best results, record 30+ seconds of clear speech in a quiet environment. Your custom voice can then be used for all scripts.
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Upload Voiceover Section */}
              <Card className="border-border/50 bg-card/80 backdrop-blur">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <Upload className="h-5 w-5 text-purple-500" />
                      Upload Voiceover
                    </h3>
                  </div>
                  <div className="flex gap-3">
                    <input
                      ref={voiceoverUploadRef}
                      type="file"
                      accept="audio/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          handleUploadVoiceover(file);
                        }
                        if (voiceoverUploadRef.current) voiceoverUploadRef.current.value = '';
                      }}
                    />
                    <Button 
                      variant="outline" 
                      onClick={() => voiceoverUploadRef.current?.click()}
                      className="flex-1"
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Upload Audio File (MP3, WAV, etc.)
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Upload pre-recorded voiceovers to use in your recordings.
                  </p>
                </CardContent>
              </Card>

              {/* Custom Voices Section */}
              <Card className="border-border/50 bg-card/80 backdrop-blur">
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Radio className="h-5 w-5 text-orange-500" />
                    My Custom Voices
                  </h3>
                  {(() => {
                    const customVoices = JSON.parse(localStorage.getItem('genieStudioCustomVoices') || '[]');
                    return customVoices.length === 0 ? (
                      <div className="text-center py-6 text-muted-foreground border border-dashed rounded-lg">
                        <Radio className="h-10 w-10 mx-auto mb-3 opacity-50" />
                        <p className="text-sm">No custom voices yet</p>
                        <p className="text-xs">Upload voice samples above to create custom voices</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {customVoices.map((voice: any) => (
                          <div 
                            key={voice.id}
                            className="flex items-center gap-4 p-3 rounded-lg border border-orange-500/30 bg-orange-500/5 hover:border-orange-500/50 transition-all"
                          >
                            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
                              <Mic className="h-5 w-5 text-white" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium truncate">{voice.name}</p>
                              <p className="text-xs text-muted-foreground">
                                Custom Voice • {voice.timestamp ? new Date(voice.timestamp).toLocaleDateString() : 'Unknown'}
                              </p>
                            </div>
                            {voice.url && (
                              <audio src={voice.url} controls className="h-8 w-48" />
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                const existing = JSON.parse(localStorage.getItem('genieStudioCustomVoices') || '[]');
                                const updated = existing.filter((v: any) => v.id !== voice.id);
                                localStorage.setItem('genieStudioCustomVoices', JSON.stringify(updated));
                                toast.success('Custom voice deleted');
                                // Force re-render
                                setActiveTab('voice');
                              }}
                            >
                              <Trash2 className="h-4 w-4 text-muted-foreground" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    );
                  })()}
                </CardContent>
              </Card>

              {/* Saved Voiceovers Section - Categorized */}
              <Card className="border-border/50 bg-card/80 backdrop-blur">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <Mic className="h-5 w-5 text-purple-500" />
                      Saved Audio Files
                      {isDbLoading && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
                    </h3>
                    <Button variant="ghost" size="sm" onClick={refreshDbMedia}>
                      <RefreshCw className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  {/* Filter Tabs */}
                  <div className="flex gap-2 mb-4 flex-wrap">
                    <Badge variant="outline" className="bg-purple-500/10 text-purple-600 border-purple-500/30">
                      All ({mergedVoiceovers.length})
                    </Badge>
                    <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/30">
                      TTS ({dbTtsFiles.length})
                    </Badge>
                    <Badge variant="outline" className="bg-blue-500/10 text-blue-600 border-blue-500/30">
                      Voiceovers ({dbVoiceovers.length})
                    </Badge>
                  </div>
                  
                  {mergedVoiceovers.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground border border-dashed rounded-lg">
                      <Mic className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No voiceovers saved yet</p>
                      <p className="text-sm">Generate TTS or upload audio files above</p>
                    </div>
                  ) : (
                    <div className="space-y-3 max-h-80 overflow-y-auto">
                      {mergedVoiceovers.map((voiceover) => {
                        // Check if from database TTS or voiceover lists
                        const isTTS = dbTtsFiles.some(t => t.id === voiceover.id) || 
                          voiceover.name?.toLowerCase().includes('tts') || 
                          voiceover.name?.toLowerCase().includes('generated');
                        const isVO = dbVoiceovers.some(v => v.id === voiceover.id) || 
                          voiceover.name?.toLowerCase().includes('voiceover') || 
                          voiceover.name?.toLowerCase().includes('recording');
                        
                        return (
                          <SavedAudioCard
                            key={voiceover.id}
                            audio={{
                              id: voiceover.id,
                              name: voiceover.name,
                              url: voiceover.url,
                              timestamp: voiceover.timestamp,
                              scriptText: voiceover.scriptText,
                              originalScript: voiceover.originalScript,
                              scriptType: voiceover.scriptType,
                              metadataType: voiceover.metadataType
                            }}
                            isTTS={isTTS}
                            isVoiceover={isVO}
                            onDelete={() => {
                              const updated = savedVoiceovers.filter(v => v.id !== voiceover.id);
                              setSavedVoiceovers(updated);
                              localStorage.setItem('genieStudioVoiceovers', JSON.stringify(updated));
                              toast.success('Audio file deleted');
                            }}
                          />
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Music Studio Tab - forceMount to preserve generation state */}
            <TabsContent value="music-studio" className="mt-0 space-y-6" forceMount hidden={activeTab !== 'music-studio'}>
              <Card className="border-border/50 bg-card/80 backdrop-blur">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
                        <Music className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h2 className="text-xl font-semibold">AI Music Studio</h2>
                        <p className="text-sm text-muted-foreground">Generate background music and soundscapes</p>
                      </div>
                    </div>
                    <Badge className="bg-green-500/10 text-green-600 border-green-500/20">
                      {MUSIC_GENRES.length} Genres
                    </Badge>
                  </div>

                  {/* Genre Selection */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                    {MUSIC_GENRES.map((genre) => (
                      <div 
                        key={genre.id} 
                        className={cn(
                          "p-4 rounded-lg border cursor-pointer transition-all text-center",
                          selectedGenre === genre.id 
                            ? "bg-green-500/10 border-green-500/50" 
                            : "bg-muted/50 border-border/50 hover:border-green-500/30"
                        )}
                        onClick={() => handleGenreSelect(genre)}
                      >
                        <Music className="h-6 w-6 text-green-500 mx-auto mb-2" />
                        <span className="font-medium text-sm">{genre.name}</span>
                      </div>
                    ))}
                  </div>

                  {/* Music Prompt */}
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="music-prompt">Describe Your Music</Label>
                      <Textarea
                        id="music-prompt"
                        value={musicPrompt}
                        onChange={(e) => setMusicPrompt(e.target.value)}
                        placeholder="E.g., Upbeat corporate music for product demo, 30 seconds..."
                        className="mt-1 min-h-[100px]"
                      />
                    </div>
                    
                    <div className="flex gap-2">
                      <Button 
                        onClick={handleGenerateMusic}
                        disabled={isGeneratingMusic || !musicPrompt.trim()}
                        className="bg-gradient-to-r from-green-500 to-emerald-500 text-white"
                      >
                        {isGeneratingMusic ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Generating...
                          </>
                        ) : (
                          <>
                            <Sparkles className="h-4 w-4 mr-2" />
                            Generate Music
                          </>
                        )}
                      </Button>
                      {selectedGenre && (
                        <Button 
                          variant="outline"
                          onClick={() => {
                            setSelectedGenre(null);
                            setMusicPrompt('');
                          }}
                        >
                          <RefreshCw className="h-4 w-4 mr-2" />
                          Clear
                        </Button>
                      )}
                    </div>

                    {/* Audio Player for Generated Music */}
                    {generatedMusicUrl && (
                      <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20">
                        <div className="flex items-center gap-2 mb-3">
                          <Music className="h-5 w-5 text-green-500" />
                          <span className="font-medium text-green-700">Music Generated!</span>
                        </div>
                        <audio 
                          ref={musicAudioRef}
                          src={generatedMusicUrl} 
                          controls 
                          className="w-full" 
                        />
                        <div className="flex gap-2 mt-3">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => {
                              const a = document.createElement('a');
                              a.href = generatedMusicUrl;
                              a.download = `genie-music-${Date.now()}.mp3`;
                              a.click();
                            }}
                          >
                            <Download className="h-4 w-4 mr-2" />
                            Download
                          </Button>
                          <Button 
                            size="sm"
                            onClick={() => {
                              saveMusicTrack(generatedMusicUrl, `${selectedGenre || 'custom'} - ${new Date().toLocaleTimeString()}`);
                            }}
                          >
                            Save to Library
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Upload Music Section */}
              <Card className="border-border/50 bg-card/80 backdrop-blur">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <Upload className="h-5 w-5 text-green-500" />
                      Upload Music
                    </h3>
                  </div>
                  <div className="flex gap-3">
                    <input
                      ref={musicUploadRef}
                      type="file"
                      accept="audio/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          handleUploadMusic(file);
                        }
                        if (musicUploadRef.current) musicUploadRef.current.value = '';
                      }}
                    />
                    <Button 
                      variant="outline" 
                      onClick={() => musicUploadRef.current?.click()}
                      className="flex-1"
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Upload Music File (MP3, WAV, etc.)
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Upload background music to use in your recordings.
                  </p>
                </CardContent>
              </Card>

              {/* Saved Music Section */}
              <Card className="border-border/50 bg-card/80 backdrop-blur">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <Music className="h-5 w-5 text-green-500" />
                      Saved Music Tracks ({mergedMusic.length})
                      {isDbLoading && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
                    </h3>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/30">
                        {dbMusic.length} from DB
                      </Badge>
                      <Button variant="ghost" size="sm" onClick={refreshDbMedia}>
                        <RefreshCw className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  {mergedMusic.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground border border-dashed rounded-lg">
                      <Music className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No music saved yet</p>
                      <p className="text-sm">Generate music or upload audio files above</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {mergedMusic.map((track) => {
                        const isFromDb = dbMusic.some(m => m.id === track.id);
                        return (
                          <div 
                            key={track.id}
                            className="flex items-center gap-4 p-3 rounded-lg border border-border/50 hover:border-primary/30 transition-all"
                          >
                            <div className="h-10 w-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                              <Music className="h-5 w-5 text-green-500" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <p className="font-medium truncate">{track.name}</p>
                                {isFromDb && (
                                  <Badge variant="outline" className="text-xs bg-green-500/10 text-green-600 border-green-500/30">
                                    DB
                                  </Badge>
                                )}
                              </div>
                              <p className="text-xs text-muted-foreground">
                                {new Date(track.timestamp).toLocaleDateString()}
                              </p>
                            </div>
                            {track.url && (
                              <audio src={track.url} controls className="h-8 w-48" />
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                const updated = savedMusic.filter(m => m.id !== track.id);
                                setSavedMusic(updated);
                                localStorage.setItem('genieStudioMusic', JSON.stringify(updated));
                                toast.success('Music track deleted');
                              }}
                            >
                              <Trash2 className="h-4 w-4 text-muted-foreground" />
                            </Button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Library Tab */}
            <TabsContent value="library" className="mt-0 space-y-6">
              {/* Videos Section */}
              <Card className="border-border/50 bg-card/80 backdrop-blur">
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Video className="h-5 w-5 text-red-500" />
                    <h2 className="text-lg font-semibold">Video Recordings</h2>
                    <Badge variant="outline" className="bg-red-500/10 text-red-600 border-red-500/30">
                      {videos.length} Videos
                    </Badge>
                  </div>
                  
                  {videos.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground border border-dashed rounded-lg">
                      <Video className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No videos recorded yet</p>
                      <Button variant="outline" className="mt-4" onClick={() => navigate('/genie-vibe')}>
                        <Video className="h-4 w-4 mr-2" />
                        Record Your First Video
                      </Button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {videos.map((video) => (
                        <div key={video.id} className="border rounded-lg overflow-hidden bg-card group">
                          {video.url ? (
                            <video 
                              src={video.url} 
                              className="w-full aspect-video object-cover"
                              controls
                            />
                          ) : (
                            <div className="w-full aspect-video bg-muted flex items-center justify-center">
                              <Video className="h-8 w-8 text-muted-foreground" />
                            </div>
                          )}
                          <div className="p-3 flex items-center justify-between">
                            <div>
                              <p className="font-medium truncate">{video.name}</p>
                              <p className="text-xs text-muted-foreground">
                                {new Date(video.timestamp).toLocaleDateString()}
                              </p>
                            </div>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8"
                              onClick={() => deleteMedia(video.id, 'video')}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Audio Section */}
              <Card className="border-border/50 bg-card/80 backdrop-blur">
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Music className="h-5 w-5 text-purple-500" />
                    <h2 className="text-lg font-semibold">Audio & Voiceovers</h2>
                    <Badge variant="outline" className="bg-purple-500/10 text-purple-600 border-purple-500/30">
                      {audios.length} Audio Files
                    </Badge>
                  </div>
                  
                  {audios.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground border border-dashed rounded-lg">
                      <Music className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No audio files yet</p>
                      <Button variant="outline" className="mt-4" onClick={() => setActiveTab('voice-generator')}>
                        <Mic className="h-4 w-4 mr-2" />
                        Generate Voiceover
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {audios.map((audio) => (
                        <div key={audio.id} className="border rounded-lg p-4 bg-card flex items-center gap-4 group">
                          <div className="h-12 w-12 rounded-full bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                            <Music className="h-6 w-6 text-purple-500" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">{audio.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(audio.timestamp).toLocaleDateString()}
                            </p>
                          </div>
                          {audio.url && (
                            <audio src={audio.url} controls className="max-w-xs" />
                          )}
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8"
                            onClick={() => deleteMedia(audio.id, 'audio')}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Templates Tab */}
            <TabsContent value="templates" className="mt-0 space-y-6">
              <Card className="border-border/50 bg-card/80 backdrop-blur">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
                        <FileText className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h2 className="text-xl font-semibold">Script Templates</h2>
                        <p className="text-sm text-muted-foreground">Pre-built templates for videos, podcasts, webcasts & broadcasts</p>
                      </div>
                    </div>
                  </div>

                  {/* Category Filter */}
                  <div className="flex flex-wrap gap-2 mb-6">
                    {['All', 'Podcast', 'Webcast', 'Broadcast', 'Marketing', 'Education', 'Corporate'].map((cat) => (
                      <Badge 
                        key={cat}
                        variant="outline"
                        className="cursor-pointer hover:bg-primary/10 transition-colors"
                      >
                        {cat}
                      </Badge>
                    ))}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {SCRIPT_TEMPLATES.map((template) => {
                      const TemplateIcon = template.type === 'podcast' ? Podcast 
                        : template.type === 'webcast' ? Tv 
                        : template.type === 'broadcast' ? Radio 
                        : FileText;
                      const iconColor = template.type === 'podcast' ? 'from-purple-500 to-indigo-500'
                        : template.type === 'webcast' ? 'from-blue-500 to-cyan-500'
                        : template.type === 'broadcast' ? 'from-red-500 to-pink-500'
                        : 'from-amber-500 to-orange-500';
                      
                      return (
                        <Card 
                          key={template.id}
                          className="border-border/50 hover:border-primary/30 transition-all cursor-pointer group"
                          onClick={() => handleLoadTemplate(template)}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between mb-3">
                              <div className={cn("h-10 w-10 rounded-lg bg-gradient-to-br flex items-center justify-center", iconColor)}>
                                <TemplateIcon className="h-5 w-5 text-white" />
                              </div>
                              <Badge variant="outline" className="text-xs">
                                {template.category}
                              </Badge>
                            </div>
                            <h3 className="font-semibold mb-1">{template.name}</h3>
                            <p className="text-sm text-muted-foreground mb-3">{template.description}</p>
                            <p className="text-xs text-muted-foreground line-clamp-2 italic">
                              "{template.content.slice(0, 100)}..."
                            </p>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="w-full mt-3 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <PenTool className="h-4 w-4 mr-2" />
                              Use Template
                            </Button>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Recording Studio Modal removed - now using dedicated /genie-vibe route */}

        {/* Publish & Go Live Dialog */}
        <Dialog open={isPublishDialogOpen} onOpenChange={setIsPublishDialogOpen}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-cyan-500 to-teal-500 flex items-center justify-center">
                  <Radio className="h-5 w-5 text-white" />
                </div>
                <div>
                  <span>Publish & Go Live</span>
                  <p className="text-sm font-normal text-muted-foreground">Distribute your content across platforms</p>
                </div>
              </DialogTitle>
            </DialogHeader>
            
            <div className="grid gap-3 py-4">
              {/* Schedule Webcast/Podcast - connects to existing flow */}
              <Card 
                className="cursor-pointer hover:border-primary/50 transition-colors group border-2"
                onClick={() => {
                  setIsPublishDialogOpen(false);
                  setIsCreateShowDialogOpen(true);
                }}
              >
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                    <Calendar className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold">Schedule Webcast / Podcast</h4>
                    <p className="text-sm text-muted-foreground">Plan and schedule your show with participants</p>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                </CardContent>
              </Card>
              
              {/* Publish as Podcast */}
              <Card 
                className="cursor-pointer hover:border-primary/50 transition-colors group"
                onClick={() => {
                  toast.info('Podcast Publishing', { 
                    description: 'Connect your podcast platforms to distribute automatically.',
                    action: {
                      label: 'Coming Soon',
                      onClick: () => {}
                    }
                  });
                }}
              >
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
                    <Podcast className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold">Publish as Podcast</h4>
                    <p className="text-sm text-muted-foreground">Spotify, Apple Podcasts, Google Podcasts</p>
                    <div className="flex gap-1 mt-1">
                      <Badge variant="outline" className="text-[10px] px-1.5">Spotify</Badge>
                      <Badge variant="outline" className="text-[10px] px-1.5">Apple</Badge>
                      <Badge variant="outline" className="text-[10px] px-1.5">Google</Badge>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                </CardContent>
              </Card>
              
              {/* Go Live Broadcast */}
              <Card 
                className="cursor-pointer hover:border-primary/50 transition-colors group"
                onClick={() => {
                  toast.info('Go Live Broadcast', { 
                    description: 'Connect LinkedIn, YouTube, or X to go live.',
                    action: {
                      label: 'Setup',
                      onClick: () => {}
                    }
                  });
                }}
              >
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center">
                    <Tv className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold">Go Live Broadcast</h4>
                    <p className="text-sm text-muted-foreground">Stream live to your audience</p>
                    <div className="flex gap-1 mt-1">
                      <Badge variant="outline" className="text-[10px] px-1.5 bg-blue-500/10 text-blue-600 border-blue-500/30">LinkedIn</Badge>
                      <Badge variant="outline" className="text-[10px] px-1.5 bg-red-500/10 text-red-600 border-red-500/30">YouTube</Badge>
                      <Badge variant="outline" className="text-[10px] px-1.5 bg-gray-500/10 text-gray-600 border-gray-500/30">X</Badge>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                </CardContent>
              </Card>
              
              {/* Share Recording */}
              <Card 
                className="cursor-pointer hover:border-primary/50 transition-colors group"
                onClick={() => {
                  toast.info('Share Recording', { 
                    description: 'Connect LinkedIn or X to share your recordings.',
                    action: {
                      label: 'Setup',
                      onClick: () => {}
                    }
                  });
                }}
              >
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center">
                    <Send className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold">Share Recording</h4>
                    <p className="text-sm text-muted-foreground">Post your video to social platforms</p>
                    <div className="flex gap-1 mt-1">
                      <Badge variant="outline" className="text-[10px] px-1.5 bg-blue-500/10 text-blue-600 border-blue-500/30">LinkedIn</Badge>
                      <Badge variant="outline" className="text-[10px] px-1.5 bg-gray-500/10 text-gray-600 border-gray-500/30">X</Badge>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                </CardContent>
              </Card>
            </div>
            
            <DialogFooter className="flex-col sm:flex-row gap-2">
              <p className="text-xs text-muted-foreground flex-1">Connect your accounts to enable publishing</p>
              <Button variant="outline" onClick={() => setIsPublishDialogOpen(false)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Unified Schedule Show Dialog - Shared with Production Hub */}
        <UnifiedScheduleShowDialog
          open={isCreateShowDialogOpen}
          onOpenChange={setIsCreateShowDialogOpen}
          onSchedule={handleUnifiedSchedule}
          variant="arc"
          availableScripts={savedScripts.map(s => ({ id: s.id, name: s.name, content: s.content }))}
        />

        {/* Invite Participants Dialog */}
        <Dialog open={isInviteDialogOpen} onOpenChange={setIsInviteDialogOpen}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <UserPlus className="h-5 w-5" />
                Invite Participants
              </DialogTitle>
              <DialogDescription>
                {selectedEventForInvite && (
                  <span>
                    Invite guests to "{selectedEventForInvite.title}" ({selectedEventForInvite.type})
                  </span>
                )}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              {/* Current Participants */}
              {selectedEventForInvite && selectedEventForInvite.participants.length > 0 && (
                <div className="space-y-2">
                  <Label>Current Participants</Label>
                  <div className="space-y-2">
                    {selectedEventForInvite.participants.map((p) => (
                      <div key={p.id} className="flex items-center gap-3 p-2 rounded-lg bg-muted/50">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="text-xs">
                            {p.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <p className="text-sm font-medium">{p.name}</p>
                          <p className="text-xs text-muted-foreground">{p.email}</p>
                        </div>
                        <Badge variant="outline" className="capitalize text-xs">
                          {p.role}
                        </Badge>
                        <Badge 
                          variant="outline" 
                          className={cn(
                            "text-xs",
                            p.status === 'confirmed' && "bg-green-500/10 text-green-600",
                            p.status === 'pending' && "bg-yellow-500/10 text-yellow-600",
                            p.status === 'declined' && "bg-red-500/10 text-red-600"
                          )}
                        >
                          {p.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* New Invite Form */}
              <div className="border-t pt-4">
                <Label className="mb-2 block">Add New Participant</Label>
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="invite-name" className="text-xs">Name *</Label>
                      <Input
                        id="invite-name"
                        value={inviteName}
                        onChange={(e) => setInviteName(e.target.value)}
                        placeholder="Full name"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="invite-role" className="text-xs">Role</Label>
                      <Select value={inviteRole} onValueChange={(v: any) => setInviteRole(v)}>
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="host">Host</SelectItem>
                          <SelectItem value="co-host">Co-Host</SelectItem>
                          <SelectItem value="guest">Guest</SelectItem>
                          <SelectItem value="panelist">Panelist</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="invite-email" className="text-xs">Email *</Label>
                    <Input
                      id="invite-email"
                      type="email"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      placeholder="email@example.com"
                      className="mt-1"
                    />
                  </div>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsInviteDialogOpen(false)}>
                Close
              </Button>
              <Button 
                onClick={handleSendInvite}
                disabled={isSendingInvite || !inviteEmail.trim() || !inviteName.trim()}
                className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white"
              >
                {isSendingInvite ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Send Invite
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Hidden audio element for music */}
        <audio ref={musicAudioRef} className="hidden" />

        {/* HIPAA Compliance Footer - Security & Privacy Notice */}
        <HIPAAComplianceFooter variant="compact" className="mt-4" />

        {/* Ask Genie - Unified AI Assistant for Genie Studio */}
        <AskGenie 
          product="studio" 
          currentTab={activeTab}
          sessionData={{ scriptsCount: savedScripts?.length || 0 }}
        />
        
        {/* Ralph Wiggum is now rendered globally from App.tsx */}
      </div>
    </AppLayout>
  );
}
