/**
 * SIMPLE COMPOSITION STUDIO V2
 * 
 * Streamlined 2-step content creation with proper dropdowns and chapter management:
 * 1. Setup: Name, template dropdown, language dropdown, industry selection
 * 2. Create: Inline chapter editing with full CRUD operations
 * 
 * Key improvements:
 * - Dropdown selectors for templates, languages, visual types (not buttons)
 * - Industry-specific templates (Saudi Vision 2030, India UPI, Africa Tourism, etc.)
 * - Full chapter management: Add, Edit, Delete, Duplicate, Reorder
 * - Fixed generation pipeline with proper edge function connectivity
 */

import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectGroup, SelectLabel } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import { Slider } from '@/components/ui/slider';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { SearchableSelect, SearchableSelectOption } from '@/components/ui/searchable-select';
import {
  Wand2, Plus, Globe, Play, Upload, Save, Trash2,
  Sparkles, Video, User, Box, ChevronDown, ChevronUp,
  Loader2, Volume2, Music, FileAudio, GripVertical,
  Copy, Eye, Settings2, Zap, RotateCcw, Check, X,
  Building2, MapPin, Pencil, Image, Presentation, 
  Monitor, Camera, Layers
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';

// ============================================
// INDUSTRY-SPECIFIC TEMPLATES
// ============================================
const INDUSTRY_TEMPLATES = [
  // Government & National Initiatives
  { id: 'saudi_vision_2030', name: 'Saudi Vision 2030', industry: 'government', region: 'mena', chapters: 5, 
    description: 'Digital transformation showcase for Saudi national initiatives',
    defaultChapters: ['Vision Overview', 'Economic Diversification', 'Digital Infrastructure', 'Smart Cities', 'Future Outlook'] },
  { id: 'uae_digital', name: 'UAE Digital Government', industry: 'government', region: 'mena', chapters: 4,
    description: 'UAE digital services and smart government initiatives',
    defaultChapters: ['Digital Transformation', 'Smart Services', 'Innovation Hub', 'Future Plans'] },
  { id: 'india_digital', name: 'Digital India Initiative', industry: 'government', region: 'south_asia', chapters: 5,
    description: 'India\'s digital transformation journey',
    defaultChapters: ['Digital India Vision', 'UPI Revolution', 'Aadhaar Ecosystem', 'Digital Infrastructure', 'Future Roadmap'] },
  { id: 'india_upi', name: 'India UPI Payment Revolution', industry: 'fintech', region: 'south_asia', chapters: 4,
    description: 'UPI payment system transformation story',
    defaultChapters: ['UPI Introduction', 'Technology Behind UPI', 'Merchant Adoption', 'Global Expansion'] },
  
  // Tourism & Travel
  { id: 'africa_tourism', name: 'Africa Tourism Showcase', industry: 'tourism', region: 'africa', chapters: 5,
    description: 'Discover Africa\'s diverse tourism offerings',
    defaultChapters: ['Wildlife Safari', 'Cultural Heritage', 'Adventure Tourism', 'Beach Destinations', 'Eco Tourism'] },
  { id: 'mena_tourism', name: 'MENA Tourism Experience', industry: 'tourism', region: 'mena', chapters: 4,
    description: 'Middle East tourism and cultural experiences',
    defaultChapters: ['Historical Sites', 'Modern Attractions', 'Cultural Experiences', 'Luxury Tourism'] },
  { id: 'asia_tourism', name: 'Southeast Asia Discovery', industry: 'tourism', region: 'sea', chapters: 5,
    description: 'Explore Southeast Asian destinations',
    defaultChapters: ['Thailand Temples', 'Vietnam Heritage', 'Indonesia Islands', 'Singapore Modern', 'Local Experiences'] },
  
  // Healthcare
  { id: 'healthcare_digital', name: 'Digital Healthcare Transformation', industry: 'healthcare', region: 'global', chapters: 4,
    description: 'Healthcare technology and patient care innovation',
    defaultChapters: ['Patient Journey', 'Telemedicine', 'AI Diagnostics', 'Future of Care'] },
  { id: 'pharma_product', name: 'Pharmaceutical Product Launch', industry: 'healthcare', region: 'global', chapters: 3,
    description: 'New drug or treatment introduction',
    defaultChapters: ['Product Overview', 'Clinical Benefits', 'Patient Stories'] },
  
  // Finance & Banking
  { id: 'banking_digital', name: 'Digital Banking Transformation', industry: 'finance', region: 'global', chapters: 4,
    description: 'Modern banking and fintech solutions',
    defaultChapters: ['Digital Banking Vision', 'Mobile First', 'Security & Trust', 'Future Banking'] },
  { id: 'investment_pitch', name: 'Investment Pitch Deck', industry: 'finance', region: 'global', chapters: 5,
    description: 'Investor presentation for startups',
    defaultChapters: ['Problem Statement', 'Our Solution', 'Market Opportunity', 'Business Model', 'Investment Ask'] },
  
  // Technology
  { id: 'saas_demo', name: 'SaaS Product Demo', industry: 'technology', region: 'global', chapters: 4,
    description: 'Software product demonstration',
    defaultChapters: ['Product Overview', 'Key Features', 'Use Cases', 'Getting Started'] },
  { id: 'ai_showcase', name: 'AI/ML Capabilities Showcase', industry: 'technology', region: 'global', chapters: 4,
    description: 'Artificial intelligence and machine learning demo',
    defaultChapters: ['AI Vision', 'Technology Stack', 'Real-world Applications', 'Future Roadmap'] },
  
  // Education & Training
  { id: 'education_course', name: 'Online Course Introduction', industry: 'education', region: 'global', chapters: 5,
    description: 'Educational content and course materials',
    defaultChapters: ['Course Overview', 'Module 1 Preview', 'Learning Outcomes', 'Instructor Bio', 'Enrollment'] },
  { id: 'corporate_training', name: 'Corporate Training Module', industry: 'education', region: 'global', chapters: 4,
    description: 'Employee training and development',
    defaultChapters: ['Training Objectives', 'Core Concepts', 'Practical Exercises', 'Assessment'] },
  
  // Landing Page Templates
  { id: 'landing_hero', name: 'Hero Showcase', industry: 'marketing', region: 'global', chapters: 1,
    description: 'Full-screen hero video for website header',
    defaultChapters: ['Hero Section'] },
  { id: 'landing_product', name: 'Product Demo Landing', industry: 'marketing', region: 'global', chapters: 3,
    description: '3-chapter product walkthrough',
    defaultChapters: ['Introduction', 'Features', 'Call to Action'] },
  { id: 'landing_testimonial', name: 'Customer Testimonials', industry: 'marketing', region: 'global', chapters: 5,
    description: 'Customer success stories',
    defaultChapters: ['Client 1', 'Client 2', 'Client 3', 'Client 4', 'Client 5'] },
  
  // Social Media Templates
  { id: 'social_short', name: 'Short Form (TikTok/Reels)', industry: 'social', region: 'global', chapters: 1,
    description: 'TikTok/Reels/Shorts ready content',
    defaultChapters: ['Short Video'] },
  { id: 'social_carousel', name: 'Carousel Post', industry: 'social', region: 'global', chapters: 5,
    description: 'LinkedIn/Instagram carousel slides',
    defaultChapters: ['Slide 1', 'Slide 2', 'Slide 3', 'Slide 4', 'CTA Slide'] },
  { id: 'social_youtube', name: 'YouTube Long Form', industry: 'social', region: 'global', chapters: 8,
    description: 'Full YouTube video with chapters',
    defaultChapters: ['Intro', 'Hook', 'Main Point 1', 'Main Point 2', 'Main Point 3', 'Case Study', 'Summary', 'CTA'] },
  
  // Quick Start
  { id: 'blank', name: 'Start Blank', industry: 'quick', region: 'global', chapters: 0,
    description: 'Empty canvas - build from scratch',
    defaultChapters: [] },
  { id: 'single', name: 'Single Chapter', industry: 'quick', region: 'global', chapters: 1,
    description: 'Quick one-off content',
    defaultChapters: ['Chapter 1'] },
  { id: '3_chapter', name: '3 Chapters', industry: 'quick', region: 'global', chapters: 3,
    description: 'Short series',
    defaultChapters: ['Introduction', 'Main Content', 'Conclusion'] },
  { id: '5_chapter', name: '5 Chapters', industry: 'quick', region: 'global', chapters: 5,
    description: 'Standard series',
    defaultChapters: ['Chapter 1', 'Chapter 2', 'Chapter 3', 'Chapter 4', 'Chapter 5'] },
] as const;

// Industry categories for grouping templates
const INDUSTRY_CATEGORIES = [
  { id: 'government', label: 'Government & Initiatives', icon: Building2 },
  { id: 'tourism', label: 'Tourism & Travel', icon: MapPin },
  { id: 'healthcare', label: 'Healthcare & Pharma', icon: Building2 },
  { id: 'finance', label: 'Finance & Banking', icon: Building2 },
  { id: 'technology', label: 'Technology & SaaS', icon: Monitor },
  { id: 'education', label: 'Education & Training', icon: Building2 },
  { id: 'marketing', label: 'Landing Pages', icon: Globe },
  { id: 'social', label: 'Social Media', icon: Video },
  { id: 'quick', label: 'Quick Start', icon: Zap },
];

// ============================================
// VISUAL TYPES - COMPREHENSIVE LIST
// ============================================
const VISUAL_TYPES = [
  // Core Video Types
  { id: 'video', label: 'Video', icon: Video, category: 'video', description: 'Standard video content' },
  { id: 'animation', label: 'Animation', icon: Sparkles, category: 'video', description: 'Motion graphics' },
  { id: 'screen_record', label: 'Screen Record', icon: Monitor, category: 'video', description: 'Screen capture demo' },
  { id: 'kinetic_typography', label: 'Kinetic Typography', icon: Sparkles, category: 'video', description: 'Animated text' },
  // Avatar Types
  { id: 'avatar', label: 'Avatar (Headshot)', icon: User, category: 'avatar', description: 'AI avatar presenter' },
  { id: 'avatar_full_body', label: 'Avatar Full Body', icon: User, category: 'avatar', description: 'Full body avatar' },
  { id: 'avatar_presenter', label: 'Avatar + Screen', icon: User, category: 'avatar', description: 'Avatar with screen share' },
  { id: 'talking_head', label: 'Talking Head', icon: User, category: 'avatar', description: 'Realistic talking head' },
  // 3D & Immersive
  { id: '3d', label: '3D Model', icon: Box, category: '3d', description: '3D object showcase' },
  { id: 'immersive', label: 'Immersive/VR', icon: Box, category: '3d', description: '360° immersive content' },
  { id: '3d_product', label: '3D Product', icon: Box, category: '3d', description: 'Product 3D visualization' },
  { id: '3d_environment', label: '3D Environment', icon: Box, category: '3d', description: 'Virtual environments' },
  // Static & Graphics
  { id: 'ppt', label: 'PPT/Slides', icon: Presentation, category: 'static', description: 'Presentation slides' },
  { id: 'images', label: 'Images', icon: Image, category: 'static', description: 'Image slideshow' },
  { id: 'infographics', label: 'Infographics', icon: Layers, category: 'static', description: 'Data visualization' },
  { id: 'customer_journey', label: 'Customer Journey', icon: MapPin, category: 'static', description: 'Journey mapping' },
  { id: 'timeline', label: 'Timeline', icon: Layers, category: 'static', description: 'Timeline visualization' },
  // Capture
  { id: 'capture', label: 'Live Capture', icon: Camera, category: 'capture', description: 'Live recording' },
  { id: 'interview', label: 'Interview Style', icon: User, category: 'capture', description: 'Interview format' },
  // Combinations
  { id: 'combo_avatar_ppt', label: 'Avatar + PPT', icon: User, category: 'combo', description: 'Avatar presenting slides' },
  { id: 'combo_3d_voice', label: '3D + Voiceover', icon: Box, category: 'combo', description: '3D with narration' },
  { id: 'combo_full_production', label: 'Full Production', icon: Sparkles, category: 'combo', description: 'Multi-element production' },
] as const;

const VISUAL_CATEGORIES = [
  { id: 'video', label: 'Video' },
  { id: 'avatar', label: 'Avatar' },
  { id: '3d', label: '3D/Immersive' },
  { id: 'static', label: 'Static/Graphics' },
  { id: 'capture', label: 'Capture' },
  { id: 'combo', label: 'Combinations' },
];

// ============================================
// LANGUAGES - 70+ WITH REGIONS
// ============================================
const LANGUAGES: SearchableSelectOption[] = [
  // Western/EU
  { value: 'en', label: 'English (US)', category: 'Western/EU' },
  { value: 'en-gb', label: 'English (UK)', category: 'Western/EU' },
  { value: 'es', label: 'Spanish', category: 'Western/EU' },
  { value: 'fr', label: 'French', category: 'Western/EU' },
  { value: 'de', label: 'German', category: 'Western/EU' },
  { value: 'it', label: 'Italian', category: 'Western/EU' },
  { value: 'pt', label: 'Portuguese', category: 'Western/EU' },
  { value: 'nl', label: 'Dutch', category: 'Western/EU' },
  { value: 'pl', label: 'Polish', category: 'Western/EU' },
  { value: 'ru', label: 'Russian', category: 'Western/EU' },
  { value: 'uk', label: 'Ukrainian', category: 'Western/EU' },
  { value: 'tr', label: 'Turkish', category: 'Western/EU' },
  { value: 'el', label: 'Greek', category: 'Western/EU' },
  { value: 'sv', label: 'Swedish', category: 'Western/EU' },
  { value: 'da', label: 'Danish', category: 'Western/EU' },
  { value: 'fi', label: 'Finnish', category: 'Western/EU' },
  { value: 'no', label: 'Norwegian', category: 'Western/EU' },
  { value: 'cs', label: 'Czech', category: 'Western/EU' },
  { value: 'ro', label: 'Romanian', category: 'Western/EU' },
  { value: 'hu', label: 'Hungarian', category: 'Western/EU' },
  // MENA/Arabic
  { value: 'ar', label: 'Arabic (MSA)', category: 'MENA/Arabic' },
  { value: 'ar-sa', label: 'Arabic (Saudi)', category: 'MENA/Arabic' },
  { value: 'ar-eg', label: 'Arabic (Egyptian)', category: 'MENA/Arabic' },
  { value: 'ar-ae', label: 'Arabic (Gulf/UAE)', category: 'MENA/Arabic' },
  { value: 'ar-ma', label: 'Arabic (Moroccan)', category: 'MENA/Arabic' },
  { value: 'ar-lb', label: 'Arabic (Levantine)', category: 'MENA/Arabic' },
  { value: 'ar-iq', label: 'Arabic (Iraqi)', category: 'MENA/Arabic' },
  { value: 'he', label: 'Hebrew', category: 'MENA/Arabic' },
  { value: 'fa', label: 'Persian/Farsi', category: 'MENA/Arabic' },
  { value: 'ur', label: 'Urdu', category: 'MENA/Arabic' },
  // South Asia
  { value: 'hi', label: 'Hindi', category: 'South Asia' },
  { value: 'bn', label: 'Bengali', category: 'South Asia' },
  { value: 'ta', label: 'Tamil', category: 'South Asia' },
  { value: 'te', label: 'Telugu', category: 'South Asia' },
  { value: 'mr', label: 'Marathi', category: 'South Asia' },
  { value: 'gu', label: 'Gujarati', category: 'South Asia' },
  { value: 'kn', label: 'Kannada', category: 'South Asia' },
  { value: 'ml', label: 'Malayalam', category: 'South Asia' },
  { value: 'pa', label: 'Punjabi', category: 'South Asia' },
  { value: 'or', label: 'Odia', category: 'South Asia' },
  { value: 'as', label: 'Assamese', category: 'South Asia' },
  { value: 'ne', label: 'Nepali', category: 'South Asia' },
  { value: 'si', label: 'Sinhala', category: 'South Asia' },
  // CJK
  { value: 'zh', label: 'Chinese (Simplified)', category: 'CJK' },
  { value: 'zh-tw', label: 'Chinese (Traditional)', category: 'CJK' },
  { value: 'zh-hk', label: 'Chinese (Cantonese)', category: 'CJK' },
  { value: 'ja', label: 'Japanese', category: 'CJK' },
  { value: 'ko', label: 'Korean', category: 'CJK' },
  // Southeast Asia
  { value: 'th', label: 'Thai', category: 'Southeast Asia' },
  { value: 'vi', label: 'Vietnamese', category: 'Southeast Asia' },
  { value: 'id', label: 'Indonesian', category: 'Southeast Asia' },
  { value: 'ms', label: 'Malay', category: 'Southeast Asia' },
  { value: 'tl', label: 'Filipino/Tagalog', category: 'Southeast Asia' },
  { value: 'my', label: 'Burmese', category: 'Southeast Asia' },
  { value: 'km', label: 'Khmer', category: 'Southeast Asia' },
  // Africa
  { value: 'sw', label: 'Swahili', category: 'Africa' },
  { value: 'am', label: 'Amharic', category: 'Africa' },
  { value: 'ha', label: 'Hausa', category: 'Africa' },
  { value: 'ig', label: 'Igbo', category: 'Africa' },
  { value: 'yo', label: 'Yoruba', category: 'Africa' },
  { value: 'zu', label: 'Zulu', category: 'Africa' },
  { value: 'xh', label: 'Xhosa', category: 'Africa' },
  { value: 'af', label: 'Afrikaans', category: 'Africa' },
  // Latin America
  { value: 'es-mx', label: 'Spanish (Mexico)', category: 'Latin America' },
  { value: 'es-ar', label: 'Spanish (Argentina)', category: 'Latin America' },
  { value: 'es-co', label: 'Spanish (Colombia)', category: 'Latin America' },
  { value: 'pt-br', label: 'Portuguese (Brazil)', category: 'Latin America' },
];

// Chapter interface
interface SimpleChapter {
  id: string;
  title: string;
  script: string;
  scriptSource: 'auto' | 'manual';
  visualTypes: string[];
  duration: number;
  voiceSource: 'tts' | 'upload' | 'clone';
  voiceFile?: File;
  musicSource: 'ai' | 'upload' | 'none';
  musicFile?: File;
  status: 'draft' | 'generating' | 'complete' | 'error';
  progress: number;
  generatedContent?: {
    previewUrl: string;
    script: string;
    audioUrl?: string;
    sceneDescription?: string;
  };
}

interface SimpleCompositionStudioProps {
  className?: string;
  onClose?: () => void;
}

const generateId = () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

export const SimpleCompositionStudio: React.FC<SimpleCompositionStudioProps> = ({
  className,
  onClose,
}) => {
  // Project state
  const [projectName, setProjectName] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [primaryLanguage, setPrimaryLanguage] = useState('en');
  const [additionalLanguages, setAdditionalLanguages] = useState<string[]>([]);
  const [chapters, setChapters] = useState<SimpleChapter[]>([]);
  const [expandedChapter, setExpandedChapter] = useState<string | null>(null);
  
  // Global audio settings
  const [globalVoiceSource, setGlobalVoiceSource] = useState<'tts' | 'upload'>('tts');
  const [globalMusicSource, setGlobalMusicSource] = useState<'ai' | 'upload' | 'none'>('ai');
  const [globalScriptMode, setGlobalScriptMode] = useState<'auto' | 'manual'>('auto');
  
  // Output options
  const [outputMode, setOutputMode] = useState<'combined' | 'individual'>('combined');
  
  // Generation state
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [currentGeneratingChapter, setCurrentGeneratingChapter] = useState<string | null>(null);

  // Apply template
  const applyTemplate = (templateId: string) => {
    const template = INDUSTRY_TEMPLATES.find(t => t.id === templateId);
    if (!template) return;

    setSelectedTemplate(templateId);
    setChapters([]);
    
    if (template.defaultChapters.length > 0) {
      const newChapters: SimpleChapter[] = template.defaultChapters.map((title) => ({
        id: generateId(),
        title,
        script: '',
        scriptSource: globalScriptMode,
        visualTypes: ['video'],
        duration: 30,
        voiceSource: globalVoiceSource,
        musicSource: globalMusicSource,
        status: 'draft' as const,
        progress: 0,
      }));
      setChapters(newChapters);
      if (newChapters.length > 0) {
        setExpandedChapter(newChapters[0].id);
      }
    }
    
    toast.success(`Template "${template.name}" applied with ${template.chapters} chapters`);
  };

  // Create new chapter
  const addChapter = useCallback(() => {
    const newChapter: SimpleChapter = {
      id: generateId(),
      title: `Chapter ${chapters.length + 1}`,
      script: '',
      scriptSource: globalScriptMode,
      visualTypes: ['video'],
      duration: 30,
      voiceSource: globalVoiceSource,
      musicSource: globalMusicSource,
      status: 'draft',
      progress: 0,
    };
    setChapters(prev => [...prev, newChapter]);
    setExpandedChapter(newChapter.id);
    toast.success('Chapter added');
  }, [chapters.length, globalScriptMode, globalVoiceSource, globalMusicSource]);

  // Update chapter
  const updateChapter = useCallback((id: string, updates: Partial<SimpleChapter>) => {
    setChapters(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
  }, []);

  // Delete chapter
  const deleteChapter = useCallback((id: string) => {
    setChapters(prev => prev.filter(c => c.id !== id));
    toast.success('Chapter deleted');
  }, []);

  // Duplicate chapter
  const duplicateChapter = useCallback((id: string) => {
    const chapter = chapters.find(c => c.id === id);
    if (chapter) {
      const newChapter: SimpleChapter = {
        ...chapter,
        id: generateId(),
        title: `${chapter.title} (Copy)`,
        status: 'draft',
        progress: 0,
        generatedContent: undefined,
      };
      setChapters(prev => [...prev, newChapter]);
      toast.success('Chapter duplicated');
    }
  }, [chapters]);

  // Move chapter
  const moveChapter = useCallback((id: string, direction: 'up' | 'down') => {
    setChapters(prev => {
      const index = prev.findIndex(c => c.id === id);
      if (index < 0) return prev;
      const newIndex = direction === 'up' ? index - 1 : index + 1;
      if (newIndex < 0 || newIndex >= prev.length) return prev;
      const newChapters = [...prev];
      [newChapters[index], newChapters[newIndex]] = [newChapters[newIndex], newChapters[index]];
      return newChapters;
    });
  }, []);

  // Apply global settings to all chapters
  const applyGlobalSettings = () => {
    setChapters(prev => prev.map(c => ({
      ...c,
      voiceSource: globalVoiceSource,
      musicSource: globalMusicSource,
      scriptSource: globalScriptMode,
    })));
    toast.success('Applied settings to all chapters');
  };

  // Generate single chapter - FIXED PIPELINE
  const generateChapter = async (chapter: SimpleChapter) => {
    updateChapter(chapter.id, { status: 'generating', progress: 0 });
    setCurrentGeneratingChapter(chapter.id);

    try {
      // Step 1: Generate script if auto mode
      let script = chapter.script;
      updateChapter(chapter.id, { progress: 10 });
      
      if (chapter.scriptSource === 'auto' || !script.trim()) {
        console.log('[SimpleStudio] Generating script for chapter:', chapter.title);
        
        const template = INDUSTRY_TEMPLATES.find(t => t.id === selectedTemplate);
        const industry = template?.industry || 'general';
        const region = template?.region || 'global';
        
        const { data: scriptData, error: scriptError } = await supabase.functions.invoke('ai-universal-processor', {
          body: {
            provider: 'gemini',
            model: 'gemini-2.0-flash',
            prompt: `Generate a professional ${chapter.duration}-second voiceover script for a chapter titled "${chapter.title}". 
                     Industry: ${industry}
                     Region: ${region}
                     Visual style: ${chapter.visualTypes.join(', ')}.
                     Language: ${primaryLanguage}
                     Keep it concise, engaging, and culturally appropriate.`,
            systemPrompt: 'You are a professional scriptwriter specializing in video content. Generate only the script text suitable for voiceover, no formatting or stage directions.',
            maxTokens: 500,
            action: 'generate_script'
          }
        });

        if (scriptError) {
          console.error('[SimpleStudio] Script generation error:', scriptError);
          throw new Error(scriptError.message);
        }
        
        script = scriptData?.content || scriptData?.response || `Script for ${chapter.title}`;
        console.log('[SimpleStudio] Script generated:', script.substring(0, 100) + '...');
        updateChapter(chapter.id, { script, progress: 30 });
      } else {
        updateChapter(chapter.id, { progress: 30 });
      }

      // Step 2: Generate scene description for visuals
      updateChapter(chapter.id, { progress: 40 });
      console.log('[SimpleStudio] Generating scene description...');
      
      const { data: sceneData, error: sceneError } = await supabase.functions.invoke('ai-universal-processor', {
        body: {
          provider: 'gemini',
          model: 'gemini-2.0-flash',
          prompt: `Based on this script, describe the visual scenes for a ${chapter.visualTypes.join(' + ')} video:
          
          Script: "${script}"
          
          Describe 2-3 key visual moments with:
          - Camera angles
          - Visual elements
          - Transitions
          - Color mood`,
          systemPrompt: 'You are a video director. Provide brief, actionable scene descriptions.',
          maxTokens: 300,
          action: 'generate_content',
          context: {
            contentType: chapter.visualTypes[0] || 'video',
            language: primaryLanguage
          }
        }
      });

      const sceneDescription = sceneData?.content || sceneData?.response || '';
      updateChapter(chapter.id, { progress: 60 });

      // Step 3: Generate preview image
      console.log('[SimpleStudio] Generating preview...');
      const visualType = chapter.visualTypes[0] || 'video';
      let previewUrl = '';
      
      try {
        const { data: imageData, error: imageError } = await supabase.functions.invoke('ai-universal-processor', {
          body: {
            provider: 'gemini',
            imageGeneration: true,
            action: 'image_generation',
            prompt: `Professional ${visualType} thumbnail for: ${chapter.title}. ${sceneDescription.substring(0, 100)}`,
            aspectRatio: '16:9',
            style: 'cinematic'
          }
        });

        if (!imageError && imageData?.imageUrl) {
          previewUrl = imageData.imageUrl;
        } else {
          // Fallback to placeholder
          const colorMap: Record<string, string> = {
            video: 'ec4899', avatar: '6366f1', '3d': '8b5cf6', animation: 'f59e0b',
            ppt: '3b82f6', images: '10b981', static: '14b8a6'
          };
          previewUrl = `https://placehold.co/1920x1080/${colorMap[visualType] || 'ec4899'}/ffffff?text=${encodeURIComponent(chapter.title)}`;
        }
      } catch (imgErr) {
        console.warn('[SimpleStudio] Image generation fallback:', imgErr);
        previewUrl = `https://placehold.co/1920x1080/ec4899/ffffff?text=${encodeURIComponent(chapter.title)}`;
      }
      
      updateChapter(chapter.id, { progress: 80 });

      // Step 4: Generate TTS if needed
      let audioUrl: string | undefined;
      if (chapter.voiceSource === 'tts' && script) {
        console.log('[SimpleStudio] Generating TTS...');
        
        try {
          const { data: ttsData, error: ttsError } = await supabase.functions.invoke('text-to-speech', {
            body: {
              text: script.substring(0, 1000), // Limit text length
              voice: 'alloy',
              model: 'tts-1'
            }
          });

          if (!ttsError && ttsData?.audioContent) {
            audioUrl = `data:audio/mp3;base64,${ttsData.audioContent}`;
          }
        } catch (ttsErr) {
          console.warn('[SimpleStudio] TTS generation skipped:', ttsErr);
        }
      }

      // Complete
      updateChapter(chapter.id, {
        status: 'complete',
        progress: 100,
        script,
        generatedContent: {
          previewUrl,
          script,
          audioUrl,
          sceneDescription
        }
      });

      console.log('[SimpleStudio] Chapter generation complete:', chapter.title);
      return { success: true };
    } catch (error) {
      console.error('[SimpleStudio] Generation error:', error);
      updateChapter(chapter.id, { status: 'error', progress: 0 });
      toast.error(`Failed to generate: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return { success: false, error: error instanceof Error ? error.message : 'Generation failed' };
    } finally {
      setCurrentGeneratingChapter(null);
    }
  };

  // Generate all chapters
  const generateAll = async () => {
    if (chapters.length === 0) {
      toast.error('Add at least one chapter first');
      return;
    }

    setIsGenerating(true);
    setGenerationProgress(0);
    let completed = 0;
    let errors: string[] = [];

    for (const chapter of chapters) {
      const result = await generateChapter(chapter);
      if (!result.success) {
        errors.push(chapter.title);
      }
      completed++;
      setGenerationProgress(Math.round((completed / chapters.length) * 100));
    }

    setIsGenerating(false);
    
    if (errors.length > 0) {
      toast.warning(`Generated with ${errors.length} error(s)`);
    } else {
      toast.success('All chapters generated successfully!');
    }
  };

  // Stats
  const totalDuration = chapters.reduce((sum, c) => sum + c.duration, 0);
  const completedChapters = chapters.filter(c => c.status === 'complete').length;
  const canGenerate = projectName.trim() && chapters.length > 0;
  const currentTemplate = INDUSTRY_TEMPLATES.find(t => t.id === selectedTemplate);

  return (
    <div className={cn("space-y-4", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            Content Studio
          </h2>
          <p className="text-sm text-muted-foreground">
            Create multi-chapter content with AI-powered generation
          </p>
        </div>
        <div className="flex gap-2">
          <Badge variant="outline">{chapters.length} Chapters</Badge>
          <Badge variant="outline">{completedChapters} Complete</Badge>
          <Badge variant="outline">{Math.floor(totalDuration / 60)}:{(totalDuration % 60).toString().padStart(2, '0')}</Badge>
        </div>
      </div>

      {/* Setup Section - DROPDOWNS */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Setup</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Project Name */}
            <div className="space-y-2">
              <Label htmlFor="projectName">Project Name *</Label>
              <Input
                id="projectName"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                placeholder="My Video Project"
              />
            </div>

            {/* Template Dropdown - GROUPED BY INDUSTRY */}
            <div className="space-y-2">
              <Label>Template</Label>
              <Select value={selectedTemplate} onValueChange={applyTemplate}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a template..." />
                </SelectTrigger>
                <SelectContent className="max-h-[400px]">
                  {INDUSTRY_CATEGORIES.map(category => {
                    const templates = INDUSTRY_TEMPLATES.filter(t => t.industry === category.id);
                    if (templates.length === 0) return null;
                    return (
                      <SelectGroup key={category.id}>
                        <SelectLabel className="flex items-center gap-2">
                          <category.icon className="w-3 h-3" />
                          {category.label}
                        </SelectLabel>
                        {templates.map(template => (
                          <SelectItem key={template.id} value={template.id}>
                            <div className="flex items-center justify-between w-full">
                              <span>{template.name}</span>
                              <Badge variant="outline" className="ml-2 text-[10px]">
                                {template.chapters} ch
                              </Badge>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    );
                  })}
                </SelectContent>
              </Select>
              {currentTemplate && (
                <p className="text-xs text-muted-foreground">{currentTemplate.description}</p>
              )}
            </div>

            {/* Primary Language Dropdown */}
            <div className="space-y-2">
              <Label>Primary Language</Label>
              <SearchableSelect
                options={LANGUAGES}
                value={primaryLanguage}
                onValueChange={setPrimaryLanguage}
                placeholder="Select language..."
                groupByCategory
              />
            </div>

            {/* Additional Languages */}
            <div className="space-y-2">
              <Label>Additional Languages</Label>
              <Select 
                value="" 
                onValueChange={(lang) => {
                  if (lang && !additionalLanguages.includes(lang) && lang !== primaryLanguage) {
                    setAdditionalLanguages(prev => [...prev, lang]);
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder={additionalLanguages.length > 0 ? `${additionalLanguages.length} selected` : "Add more..."} />
                </SelectTrigger>
                <SelectContent>
                  {LANGUAGES.filter(l => l.value !== primaryLanguage && !additionalLanguages.includes(l.value)).map(lang => (
                    <SelectItem key={lang.value} value={lang.value}>
                      {lang.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {additionalLanguages.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-1">
                  {additionalLanguages.map(lang => {
                    const langObj = LANGUAGES.find(l => l.value === lang);
                    return (
                      <Badge 
                        key={lang} 
                        variant="secondary" 
                        className="text-xs cursor-pointer"
                        onClick={() => setAdditionalLanguages(prev => prev.filter(l => l !== lang))}
                      >
                        {langObj?.label} ×
                      </Badge>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Global Settings */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-medium flex items-center gap-2">
              <Settings2 className="w-4 h-4" />
              Global Settings
            </h3>
            <Button size="sm" variant="secondary" onClick={applyGlobalSettings}>
              Apply to All Chapters
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Script Mode */}
            <div className="space-y-2">
              <Label className="text-xs">Script Generation</Label>
              <Select value={globalScriptMode} onValueChange={(v: 'auto' | 'manual') => setGlobalScriptMode(v)}>
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="auto">
                    <span className="flex items-center gap-2">
                      <Wand2 className="w-3 h-3" /> AI Auto-Generate
                    </span>
                  </SelectItem>
                  <SelectItem value="manual">
                    <span className="flex items-center gap-2">
                      <Pencil className="w-3 h-3" /> Manual Entry
                    </span>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Voice Source */}
            <div className="space-y-2">
              <Label className="text-xs">Voice Source</Label>
              <Select value={globalVoiceSource} onValueChange={(v: 'tts' | 'upload') => setGlobalVoiceSource(v)}>
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="tts">AI Text-to-Speech</SelectItem>
                  <SelectItem value="upload">Upload Recording</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Music Source */}
            <div className="space-y-2">
              <Label className="text-xs">Background Music</Label>
              <Select value={globalMusicSource} onValueChange={(v: 'ai' | 'upload' | 'none') => setGlobalMusicSource(v)}>
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ai">AI Generate</SelectItem>
                  <SelectItem value="upload">Upload Track</SelectItem>
                  <SelectItem value="none">No Music</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Chapters Section */}
      <Card>
        <CardHeader className="p-4 pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Chapters ({chapters.length})</CardTitle>
            <Button size="sm" onClick={addChapter}>
              <Plus className="w-4 h-4 mr-1" /> Add Chapter
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          {chapters.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg">
              <Sparkles className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>No chapters yet.</p>
              <p className="text-sm">Select a template above or add chapters manually.</p>
            </div>
          ) : (
            <ScrollArea className="max-h-[500px]">
              <div className="space-y-2">
                {chapters.map((chapter, index) => (
                  <ChapterCard
                    key={chapter.id}
                    chapter={chapter}
                    index={index}
                    totalChapters={chapters.length}
                    isExpanded={expandedChapter === chapter.id}
                    isGenerating={currentGeneratingChapter === chapter.id}
                    onToggle={() => setExpandedChapter(expandedChapter === chapter.id ? null : chapter.id)}
                    onUpdate={(updates) => updateChapter(chapter.id, updates)}
                    onDelete={() => deleteChapter(chapter.id)}
                    onDuplicate={() => duplicateChapter(chapter.id)}
                    onGenerate={() => generateChapter(chapter)}
                    onMoveUp={() => moveChapter(chapter.id, 'up')}
                    onMoveDown={() => moveChapter(chapter.id, 'down')}
                  />
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      {/* Generation Progress */}
      {isGenerating && (
        <Card className="border-primary">
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <Loader2 className="w-5 h-5 animate-spin text-primary" />
              <div className="flex-1">
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium">Generating content...</span>
                  <span className="text-sm text-muted-foreground">{generationProgress}%</span>
                </div>
                <Progress value={generationProgress} className="h-2" />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Output Options */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium flex items-center gap-2">
                <Zap className="w-4 h-4" />
                Output Options
              </h3>
              <p className="text-xs text-muted-foreground mt-1">
                Choose how to export your content
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant={outputMode === 'combined' ? 'default' : 'outline'}
                onClick={() => setOutputMode('combined')}
              >
                Combined Video
              </Button>
              <Button
                size="sm"
                variant={outputMode === 'individual' ? 'default' : 'outline'}
                onClick={() => setOutputMode('individual')}
              >
                Individual Chapters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex justify-between items-center">
        <div className="flex gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="outline">
            <Save className="w-4 h-4 mr-2" /> Save Draft
          </Button>
        </div>
        <Button
          size="lg"
          disabled={!canGenerate || isGenerating}
          onClick={generateAll}
          className="gap-2"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Zap className="w-4 h-4" />
              Generate All ({chapters.length} chapters)
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

// ============================================
// CHAPTER CARD COMPONENT
// ============================================
interface ChapterCardProps {
  chapter: SimpleChapter;
  index: number;
  totalChapters: number;
  isExpanded: boolean;
  isGenerating: boolean;
  onToggle: () => void;
  onUpdate: (updates: Partial<SimpleChapter>) => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onGenerate: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
}

const ChapterCard: React.FC<ChapterCardProps> = ({
  chapter,
  index,
  totalChapters,
  isExpanded,
  isGenerating,
  onToggle,
  onUpdate,
  onDelete,
  onDuplicate,
  onGenerate,
  onMoveUp,
  onMoveDown,
}) => {
  const statusColors = {
    draft: 'bg-muted text-muted-foreground',
    generating: 'bg-blue-500 text-white',
    complete: 'bg-emerald-500 text-white',
    error: 'bg-destructive text-destructive-foreground',
  };

  return (
    <Collapsible open={isExpanded} onOpenChange={onToggle}>
      <div className={cn(
        "border rounded-lg overflow-hidden transition-all",
        isExpanded ? "ring-2 ring-primary/20" : "",
        chapter.status === 'complete' ? "border-emerald-500/30 bg-emerald-500/5" : "",
        chapter.status === 'error' ? "border-destructive/30 bg-destructive/5" : ""
      )}>
        {/* Header */}
        <CollapsibleTrigger asChild>
          <div className="flex items-center gap-3 p-3 cursor-pointer hover:bg-muted/50">
            {/* Reorder buttons */}
            <div className="flex flex-col gap-0.5" onClick={(e) => e.stopPropagation()}>
              <Button
                size="icon"
                variant="ghost"
                className="h-5 w-5"
                disabled={index === 0}
                onClick={(e) => { e.stopPropagation(); onMoveUp(); }}
                title="Move up"
              >
                <ChevronUp className="w-3 h-3" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                className="h-5 w-5"
                disabled={index === totalChapters - 1}
                onClick={(e) => { e.stopPropagation(); onMoveDown(); }}
                title="Move down"
              >
                <ChevronDown className="w-3 h-3" />
              </Button>
            </div>
            
            {/* Chapter number */}
            <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center font-medium">
              {index + 1}
            </span>
            
            {/* Title - Editable */}
            <Input
              value={chapter.title}
              onChange={(e) => {
                e.stopPropagation();
                onUpdate({ title: e.target.value });
              }}
              onClick={(e) => e.stopPropagation()}
              className="h-8 flex-1 max-w-[200px]"
            />
            
            {/* Visual type badges */}
            <div className="flex items-center gap-1">
              {chapter.visualTypes.slice(0, 2).map(type => {
                const visual = VISUAL_TYPES.find(v => v.id === type);
                return visual ? (
                  <Badge key={type} variant="secondary" className="text-xs">
                    {visual.label}
                  </Badge>
                ) : null;
              })}
              {chapter.visualTypes.length > 2 && (
                <Badge variant="outline" className="text-xs">+{chapter.visualTypes.length - 2}</Badge>
              )}
            </div>
            
            {/* Duration & Status */}
            <Badge variant="secondary" className="text-xs">{chapter.duration}s</Badge>
            <Badge className={cn("text-xs", statusColors[chapter.status])}>
              {chapter.status === 'generating' && <Loader2 className="w-3 h-3 mr-1 animate-spin" />}
              {chapter.status}
            </Badge>
            
            {/* Quick Actions */}
            <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
              <Button size="icon" variant="ghost" className="h-7 w-7" onClick={onDuplicate} title="Duplicate">
                <Copy className="w-3 h-3" />
              </Button>
              <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive" onClick={onDelete} title="Delete">
                <Trash2 className="w-3 h-3" />
              </Button>
            </div>
            
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </div>
        </CollapsibleTrigger>

        {/* Progress bar */}
        {chapter.status === 'generating' && (
          <Progress value={chapter.progress} className="h-1" />
        )}

        {/* Expanded Content */}
        <CollapsibleContent>
          <div className="p-4 pt-2 space-y-4 border-t">
            {/* Generated Preview */}
            {chapter.generatedContent?.previewUrl && (
              <div className="relative aspect-video rounded-lg overflow-hidden bg-black">
                <img 
                  src={chapter.generatedContent.previewUrl} 
                  alt={chapter.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                <div className="absolute bottom-2 left-2 right-2 flex justify-between items-end">
                  <div>
                    <Badge variant="secondary" className="mb-1">Generated</Badge>
                    {chapter.generatedContent.sceneDescription && (
                      <p className="text-xs text-white/80 line-clamp-2">
                        {chapter.generatedContent.sceneDescription.substring(0, 100)}...
                      </p>
                    )}
                  </div>
                  <Button size="sm" variant="secondary">
                    <Play className="w-3 h-3 mr-1" /> Preview
                  </Button>
                </div>
              </div>
            )}

            {/* Script Section */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Script</Label>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant={chapter.scriptSource === 'auto' ? 'default' : 'outline'}
                    onClick={() => onUpdate({ scriptSource: 'auto' })}
                    className="h-7 text-xs"
                  >
                    <Wand2 className="w-3 h-3 mr-1" /> Auto
                  </Button>
                  <Button
                    size="sm"
                    variant={chapter.scriptSource === 'manual' ? 'default' : 'outline'}
                    onClick={() => onUpdate({ scriptSource: 'manual' })}
                    className="h-7 text-xs"
                  >
                    <Pencil className="w-3 h-3 mr-1" /> Manual
                  </Button>
                </div>
              </div>
              <Textarea
                value={chapter.script}
                onChange={(e) => onUpdate({ script: e.target.value })}
                placeholder={chapter.scriptSource === 'auto' 
                  ? "Script will be auto-generated when you click Generate..."
                  : "Enter your script here..."
                }
                rows={3}
              />
            </div>

            {/* Visual Types - DROPDOWN */}
            <div className="space-y-2">
              <Label>Visual Type(s)</Label>
              <Select 
                value={chapter.visualTypes[0] || 'video'} 
                onValueChange={(v) => onUpdate({ visualTypes: [v] })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select visual type..." />
                </SelectTrigger>
                <SelectContent>
                  {VISUAL_CATEGORIES.map(category => {
                    const categoryVisuals = VISUAL_TYPES.filter(v => v.category === category.id);
                    if (categoryVisuals.length === 0) return null;
                    return (
                      <SelectGroup key={category.id}>
                        <SelectLabel>{category.label}</SelectLabel>
                        {categoryVisuals.map(visual => (
                          <SelectItem key={visual.id} value={visual.id}>
                            <div className="flex items-center gap-2">
                              <visual.icon className="w-3 h-3" />
                              <span>{visual.label}</span>
                              <span className="text-xs text-muted-foreground">- {visual.description}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    );
                  })}
                </SelectContent>
              </Select>
              
              {/* Multi-select for additional visuals */}
              {chapter.visualTypes.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {chapter.visualTypes.map(type => {
                    const visual = VISUAL_TYPES.find(v => v.id === type);
                    return visual ? (
                      <Badge 
                        key={type} 
                        variant="default" 
                        className="cursor-pointer"
                        onClick={() => {
                          if (chapter.visualTypes.length > 1) {
                            onUpdate({ visualTypes: chapter.visualTypes.filter(t => t !== type) });
                          }
                        }}
                      >
                        <visual.icon className="w-3 h-3 mr-1" />
                        {visual.label}
                        {chapter.visualTypes.length > 1 && <X className="w-3 h-3 ml-1" />}
                      </Badge>
                    ) : null;
                  })}
                  <Select 
                    value=""
                    onValueChange={(v) => {
                      if (v && !chapter.visualTypes.includes(v)) {
                        onUpdate({ visualTypes: [...chapter.visualTypes, v] });
                      }
                    }}
                  >
                    <SelectTrigger className="h-6 w-24 text-xs">
                      <Plus className="w-3 h-3 mr-1" />
                      Add
                    </SelectTrigger>
                    <SelectContent>
                      {VISUAL_TYPES.filter(v => !chapter.visualTypes.includes(v.id)).map(visual => (
                        <SelectItem key={visual.id} value={visual.id}>
                          {visual.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            {/* Duration */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Duration</Label>
                <span className="text-sm text-muted-foreground">{chapter.duration} seconds</span>
              </div>
              <Slider
                value={[chapter.duration]}
                onValueChange={([v]) => onUpdate({ duration: v })}
                min={5}
                max={120}
                step={5}
              />
            </div>

            {/* Audio Settings */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs">Voice</Label>
                <Select 
                  value={chapter.voiceSource} 
                  onValueChange={(v: 'tts' | 'upload' | 'clone') => onUpdate({ voiceSource: v })}
                >
                  <SelectTrigger className="h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="tts">AI Text-to-Speech</SelectItem>
                    <SelectItem value="upload">Upload Recording</SelectItem>
                    <SelectItem value="clone">Voice Clone</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Background Music</Label>
                <Select 
                  value={chapter.musicSource} 
                  onValueChange={(v: 'ai' | 'upload' | 'none') => onUpdate({ musicSource: v })}
                >
                  <SelectTrigger className="h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ai">AI Generate</SelectItem>
                    <SelectItem value="upload">Upload Track</SelectItem>
                    <SelectItem value="none">No Music</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Chapter Actions */}
            <div className="flex justify-between pt-3 border-t">
              <div className="flex gap-2">
                <Button size="sm" variant="ghost" onClick={onDuplicate}>
                  <Copy className="w-4 h-4 mr-1" /> Duplicate
                </Button>
                <Button size="sm" variant="ghost" className="text-destructive hover:text-destructive" onClick={onDelete}>
                  <Trash2 className="w-4 h-4 mr-1" /> Delete
                </Button>
              </div>
              <Button
                size="sm"
                onClick={onGenerate}
                disabled={isGenerating}
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-1 animate-spin" /> Generating...
                  </>
                ) : chapter.status === 'complete' ? (
                  <>
                    <RotateCcw className="w-4 h-4 mr-1" /> Regenerate
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4 mr-1" /> Generate
                  </>
                )}
              </Button>
            </div>
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
};

export default SimpleCompositionStudio;
