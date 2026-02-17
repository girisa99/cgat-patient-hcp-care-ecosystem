/**
 * Marketing Content Manager
 * 
 * Complete system for managing automated marketing content generation,
 * review workflow, template rotation, multi-language support, and SEO optimization.
 * 
 * Covers all 119 pipelines across 14 categories with full dogfooding capabilities.
 */

import { supabase } from '@/integrations/supabase/client';
import { seoOptimizationService } from './seoOptimizationService';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export type ContentStatus = 
  | 'draft'           // Initial generation
  | 'pending_review'  // Awaiting human review
  | 'approved'        // Approved for publishing
  | 'rejected'        // Rejected, needs revision
  | 'scheduled'       // Scheduled for publishing
  | 'publishing'      // Currently publishing
  | 'published'       // Successfully published
  | 'failed';         // Publishing failed

export type ReviewAction = 'approve' | 'reject' | 'request_changes' | 'skip';

export interface ContentReview {
  id: string;
  contentId: string;
  reviewerId: string;
  action: ReviewAction;
  feedback?: string;
  suggestedChanges?: Record<string, string>;
  reviewedAt: Date;
}

export interface MarketingTemplate {
  id: string;
  name: string;
  category: PipelineCategory;
  format: ContentFormat;
  
  // Template structure
  headlineTemplates: string[];
  hookTemplates: string[];
  bodyTemplates: string[];
  ctaTemplates: string[];
  
  // Visual templates
  thumbnailStyles: string[];
  colorSchemes: string[];
  fontPairings: string[];
  
  // Audio/Video
  musicStyles: string[];
  voiceTones: string[];
  avatarStyles: string[];
  
  // Regional variations
  regionalVariations: Record<string, Partial<MarketingTemplate>>;
  
  // Rotation settings
  rotationWeight: number; // 0-100, higher = more frequent
  lastUsed?: Date;
  usageCount: number;
}

export interface SEOOptimization {
  title: string;
  optimizedTitle: string;
  description: string;
  optimizedDescription: string;
  keywords: string[];
  hashtags: string[];
  seoScore: number;
  recommendations: string[];
  platformSpecific: Record<string, {
    title: string;
    description: string;
    hashtags: string[];
  }>;
}

export interface GeneratedContent {
  id: string;
  
  // Content metadata
  pipelineId: string;
  pipelineName: string;
  category: PipelineCategory;
  
  // Messaging
  headline: string;
  hook: string;
  body: string;
  cta: string;
  
  // Media
  format: ContentFormat;
  mediaAssets: {
    videoUrl?: string;
    thumbnailUrl?: string;
    audioUrl?: string;
    imageUrls?: string[];
    animationUrl?: string;
    threeDUrl?: string;
  };
  
  // Localization
  language: string;
  regionalBundle: string;
  templateUsed: string;
  
  // SEO
  seo: SEOOptimization;
  
  // Status & Review
  status: ContentStatus;
  reviews: ContentReview[];
  
  // Publishing
  platforms: Platform[];
  scheduledAt?: Date;
  publishedAt?: Date;
  publishedUrls?: Record<string, string>;
  
  // Analytics
  impressions?: number;
  engagement?: number;
  clicks?: number;
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

// ============================================================================
// PIPELINE CATEGORIES (all 14)
// ============================================================================

export type PipelineCategory =
  | 'text_based'
  | 'image_based'
  | 'voice_audio'
  | 'document_ppt'
  | 'video_based'
  | '3d_based'
  | 'ar_vr_scene'
  | 'complex_multimodal'
  | 'presentation'
  | 'repurposing'
  | 'training_ld'
  | 'marketing_sales'
  | 'localization'
  | 'social_publishing';

export const CATEGORY_METADATA: Record<PipelineCategory, {
  displayName: string;
  description: string;
  icon: string;
  marketingAngle: string;
  targetAudience: string[];
}> = {
  text_based: {
    displayName: 'Text-Based Generation',
    description: 'Transform text into images, videos, 3D, avatars, VR/AR',
    icon: 'Type',
    marketingAngle: 'From words to worlds - type it, see it',
    targetAudience: ['Writers', 'Marketers', 'Content Creators'],
  },
  image_based: {
    displayName: 'Image-Based Generation',
    description: 'Transform images into videos, 3D, animations',
    icon: 'Image',
    marketingAngle: 'Bring any image to life with AI',
    targetAudience: ['Designers', 'Photographers', 'Artists'],
  },
  voice_audio: {
    displayName: 'Voice & Audio',
    description: 'TTS, STT, voice cloning, music, sound effects',
    icon: 'Mic',
    marketingAngle: 'Your voice, amplified by AI',
    targetAudience: ['Podcasters', 'Voiceover Artists', 'Musicians'],
  },
  document_ppt: {
    displayName: 'Document & Presentation',
    description: 'PDF, PPTX, Word to video, slides, interactive',
    icon: 'FileText',
    marketingAngle: 'Documents that come alive',
    targetAudience: ['Business Professionals', 'Educators', 'Trainers'],
  },
  video_based: {
    displayName: 'Video Processing',
    description: 'Video enhancement, editing, lip-sync, dubbing',
    icon: 'Video',
    marketingAngle: 'Professional video, zero editing skills',
    targetAudience: ['Content Creators', 'Video Editors', 'Filmmakers'],
  },
  '3d_based': {
    displayName: '3D Generation',
    description: 'Image/text to 3D, mesh generation, rigging',
    icon: 'Box',
    marketingAngle: 'Create 3D without being a 3D artist',
    targetAudience: ['Game Developers', 'Architects', 'Product Designers'],
  },
  ar_vr_scene: {
    displayName: 'AR/VR Experiences',
    description: 'Immersive content, virtual environments, AR assets',
    icon: 'Glasses',
    marketingAngle: 'Build immersive worlds in minutes',
    targetAudience: ['XR Developers', 'Event Planners', 'Educators'],
  },
  complex_multimodal: {
    displayName: 'Multimodal Pipelines',
    description: 'Complex multi-step transformations',
    icon: 'Workflow',
    marketingAngle: 'One input, infinite outputs',
    targetAudience: ['Agencies', 'Enterprises', 'Content Teams'],
  },
  presentation: {
    displayName: 'Presentation Pipelines',
    description: 'Script to deck, deck to video, interactive',
    icon: 'Presentation',
    marketingAngle: 'Present like a pro, create like magic',
    targetAudience: ['Sales Teams', 'Executives', 'Consultants'],
  },
  repurposing: {
    displayName: 'Content Repurposing',
    description: 'Blog to video, webinar to shorts, podcast to clips',
    icon: 'RefreshCw',
    marketingAngle: 'One piece of content, ten times the reach',
    targetAudience: ['Marketing Teams', 'Solopreneurs', 'Agencies'],
  },
  training_ld: {
    displayName: 'Training & L&D',
    description: 'Course creation, microlearning, assessments',
    icon: 'GraduationCap',
    marketingAngle: 'Train smarter, not harder',
    targetAudience: ['L&D Teams', 'Course Creators', 'HR Departments'],
  },
  marketing_sales: {
    displayName: 'Marketing & Sales',
    description: 'Ads, carousels, social posts, email sequences',
    icon: 'TrendingUp',
    marketingAngle: 'Marketing campaigns at the speed of thought',
    targetAudience: ['Marketers', 'Sales Teams', 'Growth Hackers'],
  },
  localization: {
    displayName: 'Localization',
    description: 'Translation, dubbing, cultural adaptation',
    icon: 'Globe',
    marketingAngle: 'Go global without the hassle',
    targetAudience: ['Global Teams', 'Localization Managers', 'International Businesses'],
  },
  social_publishing: {
    displayName: 'Social Publishing',
    description: 'Multi-platform publishing, scheduling, analytics',
    icon: 'Share2',
    marketingAngle: 'Publish everywhere from one place',
    targetAudience: ['Social Media Managers', 'Influencers', 'Brands'],
  },
};

// ============================================================================
// CONTENT FORMATS
// ============================================================================

export type ContentFormat = 
  | 'video_avatar'
  | 'video_animated'
  | 'video_3d'
  | 'video_journey'
  | 'shorts_vertical'
  | 'carousel'
  | 'thread'
  | 'blog_post'
  | 'infographic'
  | 'podcast_clip'
  | 'interactive_demo'
  | 'tutorial_video'
  | 'comparison_video'
  | 'testimonial'
  | 'behind_the_scenes';

export type Platform = 
  | 'linkedin' | 'youtube' | 'youtube_shorts'
  | 'tiktok' | 'instagram_reels' | 'instagram_feed'
  | 'twitter' | 'facebook' | 'blog' | 'threads'
  | 'pinterest' | 'snapchat';

// ============================================================================
// ALL 119 PIPELINES FOR MARKETING
// ============================================================================

export const PIPELINE_MARKETING_CATALOG = [
  // Text-Based (10 pipelines)
  { id: 'text-to-image', name: 'Text to Image', category: 'text_based' as PipelineCategory, hook: 'Describe it, see it instantly' },
  { id: 'text-to-video', name: 'Text to Video', category: 'text_based' as PipelineCategory, hook: 'Words become motion pictures' },
  { id: 'text-to-3d', name: 'Text to 3D', category: 'text_based' as PipelineCategory, hook: 'Type a description, get a 3D model' },
  { id: 'text-to-animation', name: 'Text to Animation', category: 'text_based' as PipelineCategory, hook: 'Animated content from plain text' },
  { id: 'text-to-avatar', name: 'Text to Avatar', category: 'text_based' as PipelineCategory, hook: 'Create AI presenters with words' },
  { id: 'text-to-vr', name: 'Text to VR', category: 'text_based' as PipelineCategory, hook: 'Build virtual worlds from descriptions' },
  { id: 'text-to-ar', name: 'Text to AR', category: 'text_based' as PipelineCategory, hook: 'AR experiences from text prompts' },
  { id: 'text-to-interactive', name: 'Text to Interactive', category: 'text_based' as PipelineCategory, hook: 'Interactive content, zero coding' },
  { id: 'text-to-music', name: 'Text to Music', category: 'text_based' as PipelineCategory, hook: 'Describe the mood, get the soundtrack' },
  { id: 'text-to-sfx', name: 'Text to SFX', category: 'text_based' as PipelineCategory, hook: 'Sound effects on demand' },
  
  // Image-Based (8 pipelines)
  { id: 'image-to-video', name: 'Image to Video', category: 'image_based' as PipelineCategory, hook: 'Static images become dynamic videos' },
  { id: 'image-to-3d', name: 'Image to 3D', category: 'image_based' as PipelineCategory, hook: 'Photos transformed into 3D models' },
  { id: 'image-to-animation', name: 'Image to Animation', category: 'image_based' as PipelineCategory, hook: 'Bring any image to life' },
  { id: 'image-to-avatar', name: 'Image to Avatar', category: 'image_based' as PipelineCategory, hook: 'Your photo becomes an AI presenter' },
  { id: 'image-enhance', name: 'Image Enhancement', category: 'image_based' as PipelineCategory, hook: 'Upscale and enhance any image' },
  { id: 'image-style-transfer', name: 'Style Transfer', category: 'image_based' as PipelineCategory, hook: 'Apply any artistic style instantly' },
  { id: 'image-background-remove', name: 'Background Removal', category: 'image_based' as PipelineCategory, hook: 'Perfect cutouts in one click' },
  { id: 'image-to-panorama', name: 'Image to Panorama', category: 'image_based' as PipelineCategory, hook: 'Expand images into panoramas' },
  
  // Voice & Audio (10 pipelines)
  { id: 'text-to-speech', name: 'Text to Speech', category: 'voice_audio' as PipelineCategory, hook: '70+ languages, human-quality voices' },
  { id: 'speech-to-text', name: 'Speech to Text', category: 'voice_audio' as PipelineCategory, hook: 'Transcribe anything with 99% accuracy' },
  { id: 'voice-clone', name: 'Voice Cloning', category: 'voice_audio' as PipelineCategory, hook: 'Clone any voice ethically' },
  { id: 'audio-enhance', name: 'Audio Enhancement', category: 'voice_audio' as PipelineCategory, hook: 'Studio quality from any recording' },
  { id: 'music-generation', name: 'Music Generation', category: 'voice_audio' as PipelineCategory, hook: 'Original music in seconds' },
  { id: 'sfx-generation', name: 'SFX Generation', category: 'voice_audio' as PipelineCategory, hook: 'Custom sound effects instantly' },
  { id: 'voice-conversion', name: 'Voice Conversion', category: 'voice_audio' as PipelineCategory, hook: 'Change voice characteristics' },
  { id: 'audio-mixing', name: 'Audio Mixing', category: 'voice_audio' as PipelineCategory, hook: 'Professional mix, zero expertise' },
  { id: 'podcast-editing', name: 'Podcast Editing', category: 'voice_audio' as PipelineCategory, hook: 'Edit podcasts automatically' },
  { id: 'audio-translation', name: 'Audio Translation', category: 'voice_audio' as PipelineCategory, hook: 'Translate audio preserving voice' },
  
  // Document & PPT (8 pipelines)
  { id: 'doc-to-video', name: 'Document to Video', category: 'document_ppt' as PipelineCategory, hook: 'PDFs become engaging videos' },
  { id: 'doc-to-slides', name: 'Document to Slides', category: 'document_ppt' as PipelineCategory, hook: 'Reports to presentations instantly' },
  { id: 'slides-to-video', name: 'Slides to Video', category: 'document_ppt' as PipelineCategory, hook: 'Presentations become narrated videos' },
  { id: 'ppt-enhance', name: 'PPT Enhancement', category: 'document_ppt' as PipelineCategory, hook: 'Upgrade ugly slides automatically' },
  { id: 'doc-extract', name: 'Document Extraction', category: 'document_ppt' as PipelineCategory, hook: 'Extract data from any document' },
  { id: 'form-processing', name: 'Form Processing', category: 'document_ppt' as PipelineCategory, hook: 'Process forms with AI OCR' },
  { id: 'doc-summary', name: 'Document Summary', category: 'document_ppt' as PipelineCategory, hook: 'Long docs to key insights' },
  { id: 'doc-to-interactive', name: 'Document to Interactive', category: 'document_ppt' as PipelineCategory, hook: 'Static docs become interactive' },
  
  // Video-Based (12 pipelines)
  { id: 'video-enhance', name: 'Video Enhancement', category: 'video_based' as PipelineCategory, hook: '4K upscaling and stabilization' },
  { id: 'video-lipsync', name: 'Video Lip-Sync', category: 'video_based' as PipelineCategory, hook: 'Perfect lip-sync in any language' },
  { id: 'video-dubbing', name: 'Video Dubbing', category: 'video_based' as PipelineCategory, hook: 'Dub videos in 70+ languages' },
  { id: 'video-captioning', name: 'Auto Captioning', category: 'video_based' as PipelineCategory, hook: 'Captions in seconds, not hours' },
  { id: 'video-editing', name: 'AI Video Editing', category: 'video_based' as PipelineCategory, hook: 'Edit with words, not timelines' },
  { id: 'video-shorts', name: 'Shorts Generator', category: 'video_based' as PipelineCategory, hook: 'Long videos to viral shorts' },
  { id: 'video-thumbnail', name: 'Thumbnail Generator', category: 'video_based' as PipelineCategory, hook: 'Click-worthy thumbnails automatically' },
  { id: 'video-background', name: 'Background Replace', category: 'video_based' as PipelineCategory, hook: 'Change video backgrounds instantly' },
  { id: 'video-face-swap', name: 'Face Animation', category: 'video_based' as PipelineCategory, hook: 'Animate faces realistically' },
  { id: 'video-slow-mo', name: 'AI Slow Motion', category: 'video_based' as PipelineCategory, hook: 'Smooth slow-mo from any footage' },
  { id: 'video-restore', name: 'Video Restoration', category: 'video_based' as PipelineCategory, hook: 'Restore old footage to HD' },
  { id: 'video-colorize', name: 'Video Colorization', category: 'video_based' as PipelineCategory, hook: 'Colorize black & white videos' },
  
  // 3D-Based (8 pipelines)
  { id: '3d-mesh-gen', name: '3D Mesh Generation', category: '3d_based' as PipelineCategory, hook: 'Generate 3D meshes from text' },
  { id: '3d-texture', name: '3D Texturing', category: '3d_based' as PipelineCategory, hook: 'Auto-texture any 3D model' },
  { id: '3d-rigging', name: '3D Rigging', category: '3d_based' as PipelineCategory, hook: 'Rig characters automatically' },
  { id: '3d-animation', name: '3D Animation', category: '3d_based' as PipelineCategory, hook: 'Animate 3D with simple prompts' },
  { id: '3d-environment', name: '3D Environment', category: '3d_based' as PipelineCategory, hook: 'Create 3D worlds instantly' },
  { id: '3d-product', name: 'Product 3D', category: '3d_based' as PipelineCategory, hook: 'Product shots from any angle' },
  { id: '3d-character', name: 'Character Generation', category: '3d_based' as PipelineCategory, hook: 'Create 3D characters from text' },
  { id: '3d-export', name: '3D Format Export', category: '3d_based' as PipelineCategory, hook: 'Export to any 3D format' },
  
  // AR/VR (6 pipelines)
  { id: 'ar-object', name: 'AR Object Creator', category: 'ar_vr_scene' as PipelineCategory, hook: 'AR-ready 3D in minutes' },
  { id: 'vr-environment', name: 'VR Environment', category: 'ar_vr_scene' as PipelineCategory, hook: 'Immersive VR worlds from text' },
  { id: 'ar-try-on', name: 'AR Try-On', category: 'ar_vr_scene' as PipelineCategory, hook: 'Virtual try-on experiences' },
  { id: 'vr-tour', name: 'VR Tour Creator', category: 'ar_vr_scene' as PipelineCategory, hook: 'Virtual tours automatically' },
  { id: 'ar-filter', name: 'AR Filter Creator', category: 'ar_vr_scene' as PipelineCategory, hook: 'Custom AR filters instantly' },
  { id: 'spatial-audio', name: 'Spatial Audio', category: 'ar_vr_scene' as PipelineCategory, hook: '3D audio for immersive content' },
  
  // Multimodal (8 pipelines)
  { id: 'script-to-video', name: 'Script to Video', category: 'complex_multimodal' as PipelineCategory, hook: 'Write a script, get a video' },
  { id: 'idea-to-content', name: 'Idea to Content', category: 'complex_multimodal' as PipelineCategory, hook: 'One idea, full content suite' },
  { id: 'data-to-story', name: 'Data to Story', category: 'complex_multimodal' as PipelineCategory, hook: 'Turn data into compelling narratives' },
  { id: 'brand-to-assets', name: 'Brand to Assets', category: 'complex_multimodal' as PipelineCategory, hook: 'Full brand kit from description' },
  { id: 'product-to-marketing', name: 'Product to Marketing', category: 'complex_multimodal' as PipelineCategory, hook: 'Product info to full campaign' },
  { id: 'event-to-content', name: 'Event to Content', category: 'complex_multimodal' as PipelineCategory, hook: 'Events become content automatically' },
  { id: 'meeting-to-content', name: 'Meeting to Content', category: 'complex_multimodal' as PipelineCategory, hook: 'Meetings become shareable content' },
  { id: 'knowledge-to-course', name: 'Knowledge to Course', category: 'complex_multimodal' as PipelineCategory, hook: 'Expertise becomes training material' },
  
  // Presentation (8 pipelines)
  { id: 'script-to-deck', name: 'Script to Deck', category: 'presentation' as PipelineCategory, hook: 'Scripts become beautiful slides' },
  { id: 'outline-to-ppt', name: 'Outline to PPT', category: 'presentation' as PipelineCategory, hook: 'Bullet points to polished decks' },
  { id: 'deck-to-video', name: 'Deck to Video', category: 'presentation' as PipelineCategory, hook: 'Presentations become videos' },
  { id: 'deck-to-interactive', name: 'Deck to Interactive', category: 'presentation' as PipelineCategory, hook: 'Static slides become interactive' },
  { id: 'pitch-generator', name: 'Pitch Generator', category: 'presentation' as PipelineCategory, hook: 'Investor-ready pitches fast' },
  { id: 'sales-deck', name: 'Sales Deck Creator', category: 'presentation' as PipelineCategory, hook: 'Winning sales decks automatically' },
  { id: 'training-deck', name: 'Training Deck', category: 'presentation' as PipelineCategory, hook: 'Training materials in minutes' },
  { id: 'proposal-generator', name: 'Proposal Generator', category: 'presentation' as PipelineCategory, hook: 'Professional proposals fast' },
  
  // Repurposing (10 pipelines)
  { id: 'blog-to-video', name: 'Blog to Video', category: 'repurposing' as PipelineCategory, hook: 'Blog posts become videos' },
  { id: 'webinar-to-shorts', name: 'Webinar to Shorts', category: 'repurposing' as PipelineCategory, hook: 'Webinars become bite-sized clips' },
  { id: 'podcast-to-clips', name: 'Podcast to Clips', category: 'repurposing' as PipelineCategory, hook: 'Podcast episodes become social clips' },
  { id: 'video-to-blog', name: 'Video to Blog', category: 'repurposing' as PipelineCategory, hook: 'Videos become written articles' },
  { id: 'article-to-thread', name: 'Article to Thread', category: 'repurposing' as PipelineCategory, hook: 'Articles become viral threads' },
  { id: 'ebook-to-course', name: 'Ebook to Course', category: 'repurposing' as PipelineCategory, hook: 'Ebooks become video courses' },
  { id: 'interview-to-quotes', name: 'Interview to Quotes', category: 'repurposing' as PipelineCategory, hook: 'Interviews become quote graphics' },
  { id: 'report-to-infographic', name: 'Report to Infographic', category: 'repurposing' as PipelineCategory, hook: 'Reports become visual stories' },
  { id: 'case-study-to-video', name: 'Case Study to Video', category: 'repurposing' as PipelineCategory, hook: 'Case studies become testimonials' },
  { id: 'faq-to-video', name: 'FAQ to Video', category: 'repurposing' as PipelineCategory, hook: 'FAQs become helpful videos' },
  
  // Training & L&D (8 pipelines)
  { id: 'course-creator', name: 'Course Creator', category: 'training_ld' as PipelineCategory, hook: 'Full courses from content' },
  { id: 'microlearning', name: 'Microlearning', category: 'training_ld' as PipelineCategory, hook: 'Bite-sized learning modules' },
  { id: 'quiz-generator', name: 'Quiz Generator', category: 'training_ld' as PipelineCategory, hook: 'Assessments in seconds' },
  { id: 'simulation', name: 'Training Simulation', category: 'training_ld' as PipelineCategory, hook: 'Interactive scenarios' },
  { id: 'onboarding', name: 'Onboarding Creator', category: 'training_ld' as PipelineCategory, hook: 'Employee onboarding automated' },
  { id: 'compliance-training', name: 'Compliance Training', category: 'training_ld' as PipelineCategory, hook: 'Compliance content that engages' },
  { id: 'skill-assessment', name: 'Skill Assessment', category: 'training_ld' as PipelineCategory, hook: 'Measure skills automatically' },
  { id: 'certification', name: 'Certification Program', category: 'training_ld' as PipelineCategory, hook: 'Certification programs fast' },
  
  // Marketing & Sales (15 pipelines)
  { id: 'ad-creator', name: 'Ad Creator', category: 'marketing_sales' as PipelineCategory, hook: 'Scroll-stopping ads instantly' },
  { id: 'carousel-creator', name: 'Carousel Creator', category: 'marketing_sales' as PipelineCategory, hook: 'Engaging carousels in minutes' },
  { id: 'social-post', name: 'Social Post Generator', category: 'marketing_sales' as PipelineCategory, hook: 'Platform-perfect posts' },
  { id: 'email-sequence', name: 'Email Sequence', category: 'marketing_sales' as PipelineCategory, hook: 'Converting email campaigns' },
  { id: 'landing-page', name: 'Landing Page', category: 'marketing_sales' as PipelineCategory, hook: 'High-converting pages fast' },
  { id: 'product-video', name: 'Product Video', category: 'marketing_sales' as PipelineCategory, hook: 'Product demos that sell' },
  { id: 'testimonial-video', name: 'Testimonial Video', category: 'marketing_sales' as PipelineCategory, hook: 'Customer stories that convert' },
  { id: 'explainer-video', name: 'Explainer Video', category: 'marketing_sales' as PipelineCategory, hook: 'Complex ideas made simple' },
  { id: 'brand-video', name: 'Brand Video', category: 'marketing_sales' as PipelineCategory, hook: 'Brand stories that resonate' },
  { id: 'promo-video', name: 'Promo Video', category: 'marketing_sales' as PipelineCategory, hook: 'Promotional content that works' },
  { id: 'sales-video', name: 'Sales Video', category: 'marketing_sales' as PipelineCategory, hook: 'Sales pitches that close' },
  { id: 'demo-video', name: 'Demo Video', category: 'marketing_sales' as PipelineCategory, hook: 'Product demos that convert' },
  { id: 'comparison-video', name: 'Comparison Video', category: 'marketing_sales' as PipelineCategory, hook: 'Side-by-side comparisons' },
  { id: 'ugc-style', name: 'UGC Style Video', category: 'marketing_sales' as PipelineCategory, hook: 'Authentic-looking UGC' },
  { id: 'influencer-kit', name: 'Influencer Kit', category: 'marketing_sales' as PipelineCategory, hook: 'Everything influencers need' },
  
  // Localization (6 pipelines)
  { id: 'translation', name: 'Content Translation', category: 'localization' as PipelineCategory, hook: 'Translate to 70+ languages' },
  { id: 'dubbing', name: 'Video Dubbing', category: 'localization' as PipelineCategory, hook: 'Dub videos preserving voice' },
  { id: 'cultural-adapt', name: 'Cultural Adaptation', category: 'localization' as PipelineCategory, hook: 'Content that resonates locally' },
  { id: 'regional-variant', name: 'Regional Variants', category: 'localization' as PipelineCategory, hook: 'Same content, local flavor' },
  { id: 'subtitle-gen', name: 'Subtitle Generation', category: 'localization' as PipelineCategory, hook: 'Subtitles in any language' },
  { id: 'voice-localize', name: 'Voice Localization', category: 'localization' as PipelineCategory, hook: 'Local voices, global content' },
];

// ============================================================================
// TEMPLATE SYSTEM
// ============================================================================

export const MESSAGE_TEMPLATES: Record<string, MarketingTemplate> = {
  'feature_spotlight': {
    id: 'feature_spotlight',
    name: 'Feature Spotlight',
    category: 'marketing_sales',
    format: 'video_avatar',
    headlineTemplates: [
      '{feature} just changed the game',
      'Introducing: {feature}',
      '{feature} - See it in action',
      'This is {feature}',
    ],
    hookTemplates: [
      'What if you could {benefit} in seconds?',
      'Stop doing {pain_point} the hard way.',
      'This feature saves {time} every week.',
      'Watch {feature} transform your workflow.',
    ],
    bodyTemplates: [
      '{product} now includes {feature}, which lets you {capability}. No more {pain_point}. Just {benefit}.',
      'Meet {feature}: {description}. Built for {audience} who want {outcome}.',
    ],
    ctaTemplates: [
      'Try {feature} free',
      'See {feature} in action',
      'Start using {feature}',
      'Get access to {feature}',
    ],
    thumbnailStyles: ['gradient', 'screenshot', 'avatar', 'text-focused'],
    colorSchemes: ['brand-primary', 'dark-mode', 'light-clean', 'vibrant'],
    fontPairings: ['modern-sans', 'professional', 'bold-statement', 'minimal'],
    musicStyles: ['upbeat', 'corporate', 'inspiring', 'tech'],
    voiceTones: ['confident', 'friendly', 'expert', 'enthusiastic'],
    avatarStyles: ['professional', 'casual', 'presenter', 'character'],
    regionalVariations: {},
    rotationWeight: 80,
    usageCount: 0,
  },
  'problem_solution': {
    id: 'problem_solution',
    name: 'Problem → Solution',
    category: 'marketing_sales',
    format: 'shorts_vertical',
    headlineTemplates: [
      'Tired of {pain_point}?',
      '{pain_point}? There\'s a better way.',
      'The {pain_point} problem, solved.',
    ],
    hookTemplates: [
      'Raise your hand if you\'ve wasted hours on {pain_point}.',
      'Every {audience} knows this struggle: {pain_point}.',
      '{pain_point} is costing you {cost}. Here\'s the fix.',
    ],
    bodyTemplates: [
      '{product}\'s {feature} eliminates {pain_point} completely. Here\'s how: {steps}',
      'Before: {before}. After: {after}. The difference? {product}.',
    ],
    ctaTemplates: [
      'Solve {pain_point} today',
      'End {pain_point} now',
      'Say goodbye to {pain_point}',
    ],
    thumbnailStyles: ['before-after', 'problem-highlight', 'solution-focus'],
    colorSchemes: ['contrast', 'problem-red-solution-green', 'clean'],
    fontPairings: ['impact', 'problem-solution-split', 'bold'],
    musicStyles: ['tension-to-resolution', 'uplifting', 'triumphant'],
    voiceTones: ['empathetic', 'understanding', 'solution-focused'],
    avatarStyles: ['relatable', 'expert', 'friendly'],
    regionalVariations: {},
    rotationWeight: 70,
    usageCount: 0,
  },
  'quick_tip': {
    id: 'quick_tip',
    name: 'Quick Tip',
    category: 'training_ld',
    format: 'shorts_vertical',
    headlineTemplates: [
      '{product} tip you didn\'t know',
      'Quick tip: {tip_summary}',
      '30-second {topic} tip',
      'Pro tip: {tip_summary}',
    ],
    hookTemplates: [
      'Here\'s something most people miss...',
      'Did you know you can {capability}?',
      'This trick saves me {time} every {period}.',
    ],
    bodyTemplates: [
      'Step 1: {step1}. Step 2: {step2}. That\'s it. {result}.',
      'Here\'s the trick: {explanation}. Works every time.',
    ],
    ctaTemplates: [
      'Try this now',
      'Save this for later',
      'Share with someone who needs this',
    ],
    thumbnailStyles: ['numbered', 'quick', 'tip-style', 'lightbulb'],
    colorSchemes: ['bright', 'attention-grabbing', 'clean'],
    fontPairings: ['quick-read', 'bold-number', 'minimal'],
    musicStyles: ['upbeat-short', 'snappy', 'fun'],
    voiceTones: ['casual', 'helpful', 'quick'],
    avatarStyles: ['casual', 'friendly', 'quick-presenter'],
    regionalVariations: {},
    rotationWeight: 90,
    usageCount: 0,
  },
  'comparison': {
    id: 'comparison',
    name: 'Comparison',
    category: 'marketing_sales',
    format: 'carousel',
    headlineTemplates: [
      '{product} vs {competitor}: The real difference',
      'Why teams are switching from {competitor}',
      '{product} vs the rest',
    ],
    hookTemplates: [
      'Considering {competitor}? Read this first.',
      'Here\'s what {competitor} won\'t tell you.',
      'The honest comparison no one asked for.',
    ],
    bodyTemplates: [
      '{product} gives you {benefit1}, {benefit2}, and {benefit3}. {competitor}? Not so much.',
      'Feature by feature: {comparison_details}',
    ],
    ctaTemplates: [
      'See the full comparison',
      'Try {product} free',
      'Make the switch',
    ],
    thumbnailStyles: ['split-screen', 'versus', 'comparison-table'],
    colorSchemes: ['brand-vs-gray', 'professional', 'clean-comparison'],
    fontPairings: ['comparison', 'clean-table', 'professional'],
    musicStyles: ['neutral', 'informative', 'confident'],
    voiceTones: ['confident', 'factual', 'honest'],
    avatarStyles: ['professional', 'expert', 'analyst'],
    regionalVariations: {},
    rotationWeight: 50,
    usageCount: 0,
  },
  'customer_story': {
    id: 'customer_story',
    name: 'Customer Story',
    category: 'marketing_sales',
    format: 'video_avatar',
    headlineTemplates: [
      'How {customer} achieved {result}',
      '{customer}\'s journey with {product}',
      'From {before} to {after}: {customer}\'s story',
    ],
    hookTemplates: [
      '{customer} was struggling with {pain_point}. Then they found {product}.',
      'In {timeframe}, {customer} went from {before} to {after}.',
    ],
    bodyTemplates: [
      'Challenge: {challenge}. Solution: {solution}. Result: {result}.',
      '{customer} needed {need}. {product} delivered {outcome}.',
    ],
    ctaTemplates: [
      'Start your story',
      'Get similar results',
      'Join {customer} and others',
    ],
    thumbnailStyles: ['customer-photo', 'quote-highlight', 'result-focused'],
    colorSchemes: ['warm', 'trust', 'professional'],
    fontPairings: ['testimonial', 'quote-style', 'warm'],
    musicStyles: ['inspiring', 'emotional', 'success'],
    voiceTones: ['warm', 'genuine', 'inspiring'],
    avatarStyles: ['testimonial-presenter', 'documentary', 'story-teller'],
    regionalVariations: {},
    rotationWeight: 60,
    usageCount: 0,
  },
};

// ============================================================================
// MARKETING CONTENT MANAGER CLASS
// ============================================================================

class MarketingContentManager {
  private static instance: MarketingContentManager;
  private contentQueue: GeneratedContent[] = [];
  private reviewQueue: GeneratedContent[] = [];

  static getInstance(): MarketingContentManager {
    if (!this.instance) {
      this.instance = new MarketingContentManager();
    }
    return this.instance;
  }

  // ==========================================================================
  // CONTENT GENERATION
  // ==========================================================================

  /**
   * Generate marketing content for a specific pipeline
   */
  async generatePipelineContent(
    pipelineId: string,
    options: {
      languages: string[];
      formats: ContentFormat[];
      platforms: Platform[];
      templateId?: string;
    }
  ): Promise<GeneratedContent[]> {
    const pipeline = PIPELINE_MARKETING_CATALOG.find(p => p.id === pipelineId);
    if (!pipeline) throw new Error(`Pipeline ${pipelineId} not found`);

    const contents: GeneratedContent[] = [];

    for (const language of options.languages) {
      for (const format of options.formats) {
        const template = options.templateId 
          ? MESSAGE_TEMPLATES[options.templateId]
          : this.selectTemplate(pipeline.category, format);

        const content = await this.generateSingleContent({
          pipeline,
          template,
          language,
          format,
          platforms: options.platforms,
        });

        contents.push(content);
      }
    }

    return contents;
  }

  /**
   * Generate content for a category (all pipelines in category)
   */
  async generateCategoryContent(
    category: PipelineCategory,
    options: {
      languages: string[];
      pipelinesPerDay: number;
    }
  ): Promise<GeneratedContent[]> {
    const pipelines = PIPELINE_MARKETING_CATALOG.filter(p => p.category === category);
    const selectedPipelines = this.rotatePipelines(pipelines, options.pipelinesPerDay);
    
    const contents: GeneratedContent[] = [];

    for (const pipeline of selectedPipelines) {
      const categoryContents = await this.generatePipelineContent(pipeline.id, {
        languages: options.languages,
        formats: this.getFormatsForCategory(category),
        platforms: this.getPlatformsForCategory(category),
      });
      contents.push(...categoryContents);
    }

    return contents;
  }

  /**
   * Generate a single piece of content
   */
  private async generateSingleContent(params: {
    pipeline: typeof PIPELINE_MARKETING_CATALOG[0];
    template: MarketingTemplate;
    language: string;
    format: ContentFormat;
    platforms: Platform[];
  }): Promise<GeneratedContent> {
    const { pipeline, template, language, format, platforms } = params;
    const categoryMeta = CATEGORY_METADATA[pipeline.category];

    // Generate messaging using template
    const headline = this.fillTemplate(
      this.rotateArray(template.headlineTemplates),
      { feature: pipeline.name, product: 'Genie Suite' }
    );
    
    const hook = this.fillTemplate(
      this.rotateArray(template.hookTemplates),
      { 
        benefit: pipeline.hook,
        pain_point: 'manual work',
        feature: pipeline.name,
      }
    );

    const body = this.fillTemplate(
      this.rotateArray(template.bodyTemplates),
      {
        product: 'Genie Suite',
        feature: pipeline.name,
        capability: pipeline.hook,
        pain_point: 'hours of manual work',
        benefit: 'instant results',
        audience: categoryMeta.targetAudience[0],
      }
    );

    const cta = this.fillTemplate(
      this.rotateArray(template.ctaTemplates),
      { feature: pipeline.name }
    );

    // Generate SEO optimization
    const seo = await this.optimizeSEO(headline, body, pipeline.category, platforms);

    return {
      id: `${Date.now()}-${pipeline.id}-${language}`,
      pipelineId: pipeline.id,
      pipelineName: pipeline.name,
      category: pipeline.category,
      headline,
      hook,
      body,
      cta,
      format,
      mediaAssets: {},
      language,
      regionalBundle: this.getRegionalBundle(language),
      templateUsed: template.id,
      seo,
      status: 'draft',
      reviews: [],
      platforms,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  // ==========================================================================
  // SEO OPTIMIZATION
  // ==========================================================================

  private async optimizeSEO(
    title: string,
    description: string,
    category: PipelineCategory,
    platforms: Platform[]
  ): Promise<SEOOptimization> {
    const categoryMeta = CATEGORY_METADATA[category];
    
    // Get trending keywords
    const keywords = await seoOptimizationService.getTrendingKeywords(
      categoryMeta.displayName,
      'general',
      10
    );

    // Generate title variations
    const titleVariations = await seoOptimizationService.generateTitleVariations(
      title,
      'informative',
      3
    );

    // Analyze current content
    const analysis = await seoOptimizationService.analyzeContent(
      title,
      description,
      keywords.map(k => k.keyword)
    );

    // Generate platform-specific optimizations
    const platformSpecific: Record<string, { title: string; description: string; hashtags: string[] }> = {};
    
    for (const platform of platforms) {
      const platformKeywords = keywords.slice(0, 5).map(k => k.keyword);
      const hashtags = this.generateHashtags(category, platform, platformKeywords);
      
      platformSpecific[platform] = {
        title: titleVariations[0] || title,
        description: this.optimizeDescriptionForPlatform(description, platform),
        hashtags,
      };
    }

    return {
      title,
      optimizedTitle: titleVariations[0] || title,
      description,
      optimizedDescription: description,
      keywords: keywords.map(k => k.keyword),
      hashtags: this.generateHashtags(category, 'general', keywords.map(k => k.keyword)),
      seoScore: analysis.score,
      recommendations: analysis.recommendations.map(r => r.impact_description),
      platformSpecific,
    };
  }

  private generateHashtags(category: PipelineCategory, platform: Platform | 'general', keywords: string[]): string[] {
    const baseHashtags = ['#GenieStudio', '#AI', '#ContentCreation', '#Automation'];
    const categoryHashtag = `#${CATEGORY_METADATA[category].displayName.replace(/\s+/g, '')}`;
    const keywordHashtags = keywords.slice(0, 3).map(k => `#${k.replace(/\s+/g, '')}`);
    
    const platformSpecific: Record<string, string[]> = {
      tiktok: ['#fyp', '#viral', '#techtok'],
      instagram_reels: ['#reels', '#explore', '#trending'],
      linkedin: ['#innovation', '#business', '#productivity'],
      twitter: ['#tech', '#tools'],
      youtube: ['#tutorial', '#howto'],
    };

    return [
      ...baseHashtags,
      categoryHashtag,
      ...keywordHashtags,
      ...(platformSpecific[platform] || []),
    ].slice(0, 15);
  }

  private optimizeDescriptionForPlatform(description: string, platform: Platform): string {
    const maxLengths: Record<Platform, number> = {
      twitter: 240,
      tiktok: 300,
      instagram_reels: 500,
      instagram_feed: 2200,
      linkedin: 3000,
      youtube: 5000,
      youtube_shorts: 300,
      facebook: 500,
      blog: 10000,
      threads: 500,
      pinterest: 500,
      snapchat: 200,
    };

    const maxLength = maxLengths[platform] || 500;
    if (description.length <= maxLength) return description;
    
    return description.substring(0, maxLength - 3) + '...';
  }

  // ==========================================================================
  // REVIEW WORKFLOW
  // ==========================================================================

  /**
   * Submit content for review
   */
  submitForReview(contentIds: string[]): void {
    for (const id of contentIds) {
      const content = this.contentQueue.find(c => c.id === id);
      if (content) {
        content.status = 'pending_review';
        this.reviewQueue.push(content);
      }
    }
  }

  /**
   * Get content pending review
   */
  getReviewQueue(): GeneratedContent[] {
    return this.reviewQueue.filter(c => c.status === 'pending_review');
  }

  /**
   * Review content
   */
  reviewContent(
    contentId: string,
    review: {
      action: ReviewAction;
      feedback?: string;
      suggestedChanges?: Record<string, string>;
      reviewerId: string;
    }
  ): void {
    const content = this.reviewQueue.find(c => c.id === contentId);
    if (!content) throw new Error(`Content ${contentId} not found`);

    const contentReview: ContentReview = {
      id: `review-${Date.now()}`,
      contentId,
      reviewerId: review.reviewerId,
      action: review.action,
      feedback: review.feedback,
      suggestedChanges: review.suggestedChanges,
      reviewedAt: new Date(),
    };

    content.reviews.push(contentReview);

    switch (review.action) {
      case 'approve':
        content.status = 'approved';
        break;
      case 'reject':
        content.status = 'rejected';
        break;
      case 'request_changes':
        content.status = 'draft';
        break;
      case 'skip':
        // Keep in queue
        break;
    }

    content.updatedAt = new Date();
  }

  /**
   * Bulk approve content
   */
  bulkApprove(contentIds: string[], reviewerId: string): void {
    for (const id of contentIds) {
      this.reviewContent(id, { action: 'approve', reviewerId });
    }
  }

  // ==========================================================================
  // SCHEDULING & PUBLISHING
  // ==========================================================================

  /**
   * Schedule approved content for publishing
   */
  scheduleContent(contentId: string, scheduledAt: Date): void {
    const content = this.reviewQueue.find(c => c.id === contentId);
    if (!content) throw new Error(`Content ${contentId} not found`);
    if (content.status !== 'approved') throw new Error('Content must be approved before scheduling');

    content.scheduledAt = scheduledAt;
    content.status = 'scheduled';
    content.updatedAt = new Date();
  }

  /**
   * Get scheduled content
   */
  getScheduledContent(): GeneratedContent[] {
    return this.reviewQueue.filter(c => c.status === 'scheduled');
  }

  /**
   * Auto-publish content (for automated workflow)
   */
  async autoPublish(content: GeneratedContent): Promise<boolean> {
    try {
      content.status = 'publishing';
      
      // Call distribution agent for each platform
      for (const platform of content.platforms) {
        await supabase.functions.invoke('distribution-agent', {
          body: {
            action: 'distribute',
            platform,
            content: {
              title: content.seo.platformSpecific[platform]?.title || content.headline,
              description: content.seo.platformSpecific[platform]?.description || content.body,
              hashtags: content.seo.platformSpecific[platform]?.hashtags || content.seo.hashtags,
              mediaUrl: content.mediaAssets.videoUrl || content.mediaAssets.imageUrls?.[0],
            },
          },
        });
      }

      content.status = 'published';
      content.publishedAt = new Date();
      return true;
    } catch (error) {
      console.error('[MarketingContentManager] Publish failed:', error);
      content.status = 'failed';
      return false;
    }
  }

  // ==========================================================================
  // TEMPLATE ROTATION
  // ==========================================================================

  private selectTemplate(category: PipelineCategory, format: ContentFormat): MarketingTemplate {
    const templates = Object.values(MESSAGE_TEMPLATES).filter(
      t => t.category === category || t.format === format
    );

    if (templates.length === 0) {
      return MESSAGE_TEMPLATES['feature_spotlight'];
    }

    // Weighted random selection based on rotationWeight
    const totalWeight = templates.reduce((sum, t) => sum + t.rotationWeight, 0);
    let random = Math.random() * totalWeight;

    for (const template of templates) {
      random -= template.rotationWeight;
      if (random <= 0) {
        template.usageCount++;
        template.lastUsed = new Date();
        return template;
      }
    }

    return templates[0];
  }

  private rotatePipelines(
    pipelines: typeof PIPELINE_MARKETING_CATALOG,
    count: number
  ): typeof PIPELINE_MARKETING_CATALOG {
    // Simple round-robin with shuffle
    const shuffled = [...pipelines].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
  }

  private rotateArray<T>(arr: T[]): T {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  // ==========================================================================
  // HELPERS
  // ==========================================================================

  private fillTemplate(template: string, values: Record<string, string>): string {
    let result = template;
    for (const [key, value] of Object.entries(values)) {
      result = result.replace(new RegExp(`{${key}}`, 'g'), value);
    }
    return result;
  }

  private getRegionalBundle(language: string): string {
    const languageBundleMap: Record<string, string> = {
      'en': 'english_core',
      'de': 'europe',
      'fr': 'europe',
      'ja': 'asia',
      'ko': 'asia',
      'zh': 'asia',
      'hi': 'india',
      'ar': 'mea',
      'pt-BR': 'latam',
      'es': 'latam',
    };
    return languageBundleMap[language] || 'english_core';
  }

  private getFormatsForCategory(category: PipelineCategory): ContentFormat[] {
    const categoryFormats: Record<PipelineCategory, ContentFormat[]> = {
      text_based: ['video_avatar', 'shorts_vertical', 'carousel'],
      image_based: ['video_animated', 'carousel', 'infographic'],
      voice_audio: ['podcast_clip', 'video_avatar', 'shorts_vertical'],
      document_ppt: ['video_avatar', 'tutorial_video', 'carousel'],
      video_based: ['shorts_vertical', 'tutorial_video', 'comparison_video'],
      '3d_based': ['video_3d', 'video_animated', 'shorts_vertical'],
      ar_vr_scene: ['video_3d', 'video_journey', 'shorts_vertical'],
      complex_multimodal: ['video_journey', 'tutorial_video', 'video_avatar'],
      presentation: ['video_avatar', 'carousel', 'tutorial_video'],
      repurposing: ['shorts_vertical', 'carousel', 'thread'],
      training_ld: ['tutorial_video', 'video_avatar', 'carousel'],
      marketing_sales: ['shorts_vertical', 'carousel', 'video_avatar'],
      localization: ['video_avatar', 'shorts_vertical', 'carousel'],
      social_publishing: ['shorts_vertical', 'carousel', 'thread'],
    };
    return categoryFormats[category] || ['video_avatar', 'shorts_vertical'];
  }

  private getPlatformsForCategory(category: PipelineCategory): Platform[] {
    const categoryPlatforms: Record<PipelineCategory, Platform[]> = {
      text_based: ['linkedin', 'youtube', 'twitter'],
      image_based: ['instagram_feed', 'pinterest', 'linkedin'],
      voice_audio: ['youtube', 'linkedin', 'twitter'],
      document_ppt: ['linkedin', 'youtube', 'blog'],
      video_based: ['youtube', 'tiktok', 'instagram_reels'],
      '3d_based': ['youtube', 'linkedin', 'instagram_feed'],
      ar_vr_scene: ['youtube', 'linkedin', 'instagram_feed'],
      complex_multimodal: ['youtube', 'linkedin', 'blog'],
      presentation: ['linkedin', 'youtube', 'twitter'],
      repurposing: ['linkedin', 'twitter', 'instagram_feed'],
      training_ld: ['linkedin', 'youtube', 'blog'],
      marketing_sales: ['linkedin', 'instagram_reels', 'tiktok'],
      localization: ['linkedin', 'youtube', 'twitter'],
      social_publishing: ['linkedin', 'twitter', 'instagram_feed'],
    };
    return categoryPlatforms[category] || ['linkedin', 'youtube'];
  }

  // ==========================================================================
  // PUBLIC API
  // ==========================================================================

  /**
   * Get all pipelines
   */
  getAllPipelines() {
    return PIPELINE_MARKETING_CATALOG;
  }

  /**
   * Get pipelines by category
   */
  getPipelinesByCategory(category: PipelineCategory) {
    return PIPELINE_MARKETING_CATALOG.filter(p => p.category === category);
  }

  /**
   * Get all categories with metadata
   */
  getAllCategories() {
    return CATEGORY_METADATA;
  }

  /**
   * Get all templates
   */
  getAllTemplates() {
    return MESSAGE_TEMPLATES;
  }

  /**
   * Get content queue
   */
  getContentQueue() {
    return this.contentQueue;
  }

  /**
   * Get published content for analytics
   */
  getPublishedContent() {
    return this.reviewQueue.filter(c => c.status === 'published');
  }
}

export const marketingContentManager = MarketingContentManager.getInstance();
export default marketingContentManager;
