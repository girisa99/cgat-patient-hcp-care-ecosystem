/**
 * SIMPLE COMPOSITION STUDIO V3
 * 
 * Streamlined 2-step content creation with:
 * - IP-based primary language detection
 * - Multi-select dropdowns for templates, languages, visual types
 * - No nested cards/iframes
 * - Voice/music per chapter OR entire video
 * - Script generation per chapter OR all at once
 */

import React, { useState, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import { Slider } from '@/components/ui/slider';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { MultiSelectDropdown, MultiSelectOption } from '@/components/ui/multi-select-dropdown';
import { SearchableSelect, SearchableSelectOption } from '@/components/ui/searchable-select';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import {
  Wand2, Plus, Globe, Play, Upload, Save, Trash2,
  Sparkles, Video, User, Box, ChevronDown, ChevronUp,
  Loader2, Volume2, Music, GripVertical,
  Copy, Settings2, Zap, RotateCcw, X,
  Building2, MapPin, Pencil, Image, Presentation, 
  Monitor, Camera, Layers, Film, Mic,
  Send, FileCheck, BookTemplate, Share2
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { useIPBasedContent } from '@/hooks/useIPBasedContent';
import { useStudioEcosystem } from './useStudioEcosystem';

// ============================================
// INDUSTRY-SPECIFIC TEMPLATES (Multi-select ready)
// ============================================
const INDUSTRY_TEMPLATES: MultiSelectOption[] = [
  // Government & National Initiatives
  { id: 'saudi_vision_2030', value: 'saudi_vision_2030', label: 'Saudi Vision 2030', category: 'Government', description: 'Digital transformation for Saudi initiatives' },
  { id: 'uae_digital', value: 'uae_digital', label: 'UAE Digital Government', category: 'Government', description: 'UAE smart services' },
  { id: 'india_digital', value: 'india_digital', label: 'Digital India Initiative', category: 'Government', description: 'India digital transformation' },
  { id: 'india_upi', value: 'india_upi', label: 'India UPI Payment', category: 'Finance', description: 'UPI payment revolution' },
  // Tourism
  { id: 'africa_tourism', value: 'africa_tourism', label: 'Africa Tourism', category: 'Tourism', description: 'African destinations showcase' },
  { id: 'mena_tourism', value: 'mena_tourism', label: 'MENA Tourism', category: 'Tourism', description: 'Middle East experiences' },
  { id: 'asia_tourism', value: 'asia_tourism', label: 'Southeast Asia', category: 'Tourism', description: 'SEA destinations' },
  // Healthcare
  { id: 'healthcare_digital', value: 'healthcare_digital', label: 'Digital Healthcare', category: 'Healthcare', description: 'Healthcare tech innovation' },
  { id: 'pharma_product', value: 'pharma_product', label: 'Pharma Product Launch', category: 'Healthcare', description: 'Drug/treatment intro' },
  // Finance
  { id: 'banking_digital', value: 'banking_digital', label: 'Digital Banking', category: 'Finance', description: 'Modern fintech solutions' },
  { id: 'investment_pitch', value: 'investment_pitch', label: 'Investment Pitch', category: 'Finance', description: 'Startup pitch deck' },
  // Technology
  { id: 'saas_demo', value: 'saas_demo', label: 'SaaS Product Demo', category: 'Technology', description: 'Software demonstration' },
  { id: 'ai_showcase', value: 'ai_showcase', label: 'AI/ML Showcase', category: 'Technology', description: 'AI capabilities demo' },
  // Education
  { id: 'education_course', value: 'education_course', label: 'Online Course', category: 'Education', description: 'Course materials' },
  { id: 'corporate_training', value: 'corporate_training', label: 'Corporate Training', category: 'Education', description: 'Employee training' },
  // Landing Pages
  { id: 'landing_hero', value: 'landing_hero', label: 'Hero Showcase', category: 'Landing Page', description: 'Website hero video' },
  { id: 'landing_product', value: 'landing_product', label: 'Product Demo', category: 'Landing Page', description: 'Product walkthrough' },
  { id: 'landing_testimonial', value: 'landing_testimonial', label: 'Testimonials', category: 'Landing Page', description: 'Customer stories' },
  // Social Media
  { id: 'social_short', value: 'social_short', label: 'Short Form (Reels)', category: 'Social Media', description: 'TikTok/Reels ready' },
  { id: 'social_carousel', value: 'social_carousel', label: 'Carousel Post', category: 'Social Media', description: 'LinkedIn/Instagram slides' },
  { id: 'social_youtube', value: 'social_youtube', label: 'YouTube Long Form', category: 'Social Media', description: 'Full YouTube video' },
  // Quick Start
  { id: 'blank', value: 'blank', label: 'Start Blank', category: 'Quick Start', description: 'Empty canvas' },
  { id: 'single', value: 'single', label: 'Single Chapter', category: 'Quick Start', description: 'Quick one-off' },
  { id: '3_chapter', value: '3_chapter', label: '3 Chapters', category: 'Quick Start', description: 'Short series' },
  { id: '5_chapter', value: '5_chapter', label: '5 Chapters', category: 'Quick Start', description: 'Standard series' },
];

// Template chapters mapping
const TEMPLATE_CHAPTERS: Record<string, string[]> = {
  saudi_vision_2030: ['Vision Overview', 'Economic Diversification', 'Digital Infrastructure', 'Smart Cities', 'Future Outlook'],
  uae_digital: ['Digital Transformation', 'Smart Services', 'Innovation Hub', 'Future Plans'],
  india_digital: ['Digital India Vision', 'UPI Revolution', 'Aadhaar Ecosystem', 'Digital Infrastructure', 'Future Roadmap'],
  india_upi: ['UPI Introduction', 'Technology Behind UPI', 'Merchant Adoption', 'Global Expansion'],
  africa_tourism: ['Wildlife Safari', 'Cultural Heritage', 'Adventure Tourism', 'Beach Destinations', 'Eco Tourism'],
  mena_tourism: ['Historical Sites', 'Modern Attractions', 'Cultural Experiences', 'Luxury Tourism'],
  asia_tourism: ['Thailand Temples', 'Vietnam Heritage', 'Indonesia Islands', 'Singapore Modern', 'Local Experiences'],
  healthcare_digital: ['Patient Journey', 'Telemedicine', 'AI Diagnostics', 'Future of Care'],
  pharma_product: ['Product Overview', 'Clinical Benefits', 'Patient Stories'],
  banking_digital: ['Digital Banking Vision', 'Mobile First', 'Security & Trust', 'Future Banking'],
  investment_pitch: ['Problem Statement', 'Our Solution', 'Market Opportunity', 'Business Model', 'Investment Ask'],
  saas_demo: ['Product Overview', 'Key Features', 'Use Cases', 'Getting Started'],
  ai_showcase: ['AI Vision', 'Technology Stack', 'Applications', 'Future Roadmap'],
  education_course: ['Course Overview', 'Module Preview', 'Learning Outcomes', 'Instructor Bio', 'Enrollment'],
  corporate_training: ['Training Objectives', 'Core Concepts', 'Practical Exercises', 'Assessment'],
  landing_hero: ['Hero Section'],
  landing_product: ['Introduction', 'Features', 'Call to Action'],
  landing_testimonial: ['Client 1', 'Client 2', 'Client 3', 'Client 4', 'Client 5'],
  social_short: ['Short Video'],
  social_carousel: ['Slide 1', 'Slide 2', 'Slide 3', 'Slide 4', 'CTA Slide'],
  social_youtube: ['Intro', 'Hook', 'Point 1', 'Point 2', 'Point 3', 'Case Study', 'Summary', 'CTA'],
  blank: [],
  single: ['Chapter 1'],
  '3_chapter': ['Introduction', 'Main Content', 'Conclusion'],
  '5_chapter': ['Chapter 1', 'Chapter 2', 'Chapter 3', 'Chapter 4', 'Chapter 5'],
};

// ============================================
// VISUAL TYPES (Multi-select ready) - 45+ formats with language-aware variants
// ============================================
const VISUAL_TYPES: MultiSelectOption[] = [
  // ---- VIDEO (Core) ----
  { id: 'video', value: 'video', label: 'AI Video', category: 'Video', icon: <Video className="w-3 h-3" /> },
  { id: 'video_cinematic', value: 'video_cinematic', label: 'Cinematic Video', category: 'Video', icon: <Video className="w-3 h-3" /> },
  { id: 'video_explainer', value: 'video_explainer', label: 'Explainer Video', category: 'Video', icon: <Video className="w-3 h-3" /> },
  { id: 'video_promo', value: 'video_promo', label: 'Promo Video', category: 'Video', icon: <Video className="w-3 h-3" /> },
  { id: 'video_testimonial', value: 'video_testimonial', label: 'Testimonial Video', category: 'Video', icon: <Video className="w-3 h-3" /> },
  { id: 'video_tutorial', value: 'video_tutorial', label: 'Tutorial Video', category: 'Video', icon: <Video className="w-3 h-3" /> },
  { id: 'video_social_short', value: 'video_social_short', label: 'Short Form (Reels/TikTok)', category: 'Video', icon: <Video className="w-3 h-3" /> },
  { id: 'video_youtube_long', value: 'video_youtube_long', label: 'YouTube Long Form', category: 'Video', icon: <Video className="w-3 h-3" /> },
  
  // ---- ANIMATION ----
  { id: 'animation', value: 'animation', label: 'Animation', category: 'Animation', icon: <Sparkles className="w-3 h-3" /> },
  { id: 'kinetic_typography', value: 'kinetic_typography', label: 'Kinetic Typography', category: 'Animation', icon: <Sparkles className="w-3 h-3" /> },
  { id: 'motion_graphics', value: 'motion_graphics', label: 'Motion Graphics', category: 'Animation', icon: <Sparkles className="w-3 h-3" /> },
  { id: 'logo_animation', value: 'logo_animation', label: 'Logo Animation', category: 'Animation', icon: <Sparkles className="w-3 h-3" /> },
  { id: 'animated_infographic', value: 'animated_infographic', label: 'Animated Infographic', category: 'Animation', icon: <Sparkles className="w-3 h-3" /> },
  { id: 'whiteboard_animation', value: 'whiteboard_animation', label: 'Whiteboard Animation', category: 'Animation', icon: <Sparkles className="w-3 h-3" /> },
  { id: 'particle_effects', value: 'particle_effects', label: 'Particle Effects', category: 'Animation', icon: <Sparkles className="w-3 h-3" /> },
  
  // ---- AVATAR ----
  { id: 'avatar', value: 'avatar', label: 'AI Avatar (Headshot)', category: 'Avatar', icon: <User className="w-3 h-3" /> },
  { id: 'avatar_full_body', value: 'avatar_full_body', label: 'Avatar Full Body', category: 'Avatar', icon: <User className="w-3 h-3" /> },
  { id: 'avatar_presenter', value: 'avatar_presenter', label: 'Avatar + Screen', category: 'Avatar', icon: <User className="w-3 h-3" /> },
  { id: 'avatar_professional_western', value: 'avatar_professional_western', label: 'Professional (Western)', category: 'Avatar', icon: <User className="w-3 h-3" /> },
  { id: 'avatar_professional_mena', value: 'avatar_professional_mena', label: 'Professional (MENA)', category: 'Avatar', icon: <User className="w-3 h-3" /> },
  { id: 'avatar_professional_cjk', value: 'avatar_professional_cjk', label: 'Professional (CJK)', category: 'Avatar', icon: <User className="w-3 h-3" /> },
  { id: 'avatar_professional_south_asian', value: 'avatar_professional_south_asian', label: 'Professional (South Asian)', category: 'Avatar', icon: <User className="w-3 h-3" /> },
  { id: 'avatar_professional_african', value: 'avatar_professional_african', label: 'Professional (African)', category: 'Avatar', icon: <User className="w-3 h-3" /> },
  { id: 'avatar_casual', value: 'avatar_casual', label: 'Avatar Casual', category: 'Avatar', icon: <User className="w-3 h-3" /> },
  { id: 'talking_head', value: 'talking_head', label: 'Talking Head', category: 'Avatar', icon: <User className="w-3 h-3" /> },
  { id: 'avatar_lipsync', value: 'avatar_lipsync', label: 'Avatar with Lip-Sync', category: 'Avatar', icon: <User className="w-3 h-3" /> },
  
  // ---- 3D/IMMERSIVE ----
  { id: '3d', value: '3d', label: '3D Model', category: '3D/Immersive', icon: <Box className="w-3 h-3" /> },
  { id: '3d_product', value: '3d_product', label: '3D Product Showcase', category: '3D/Immersive', icon: <Box className="w-3 h-3" /> },
  { id: '3d_environment', value: '3d_environment', label: '3D Environment', category: '3D/Immersive', icon: <Box className="w-3 h-3" /> },
  { id: '3d_turntable', value: '3d_turntable', label: '3D 360° Turntable', category: '3D/Immersive', icon: <Box className="w-3 h-3" /> },
  { id: '3d_exploded', value: '3d_exploded', label: '3D Exploded View', category: '3D/Immersive', icon: <Box className="w-3 h-3" /> },
  { id: 'immersive', value: 'immersive', label: 'Immersive/VR', category: '3D/Immersive', icon: <Box className="w-3 h-3" /> },
  { id: 'ar_experience', value: 'ar_experience', label: 'AR Experience', category: '3D/Immersive', icon: <Box className="w-3 h-3" /> },
  { id: 'holographic', value: 'holographic', label: 'Holographic Display', category: '3D/Immersive', icon: <Box className="w-3 h-3" /> },
  
  // ---- STATIC/GRAPHICS ----
  { id: 'ppt', value: 'ppt', label: 'PPT/Slides', category: 'Static/Graphics', icon: <Presentation className="w-3 h-3" /> },
  { id: 'images', value: 'images', label: 'AI Images', category: 'Static/Graphics', icon: <Image className="w-3 h-3" /> },
  { id: 'infographics', value: 'infographics', label: 'Infographics', category: 'Static/Graphics', icon: <Layers className="w-3 h-3" /> },
  { id: 'customer_journey', value: 'customer_journey', label: 'Customer Journey Map', category: 'Static/Graphics', icon: <MapPin className="w-3 h-3" /> },
  { id: 'timeline', value: 'timeline', label: 'Timeline', category: 'Static/Graphics', icon: <Layers className="w-3 h-3" /> },
  { id: 'flowchart', value: 'flowchart', label: 'Flowchart', category: 'Static/Graphics', icon: <Layers className="w-3 h-3" /> },
  { id: 'comparison_chart', value: 'comparison_chart', label: 'Comparison Chart', category: 'Static/Graphics', icon: <Layers className="w-3 h-3" /> },
  { id: 'data_visualization', value: 'data_visualization', label: 'Data Visualization', category: 'Static/Graphics', icon: <Layers className="w-3 h-3" /> },
  
  // ---- CAPTURE ----
  { id: 'screen_record', value: 'screen_record', label: 'Screen Recording', category: 'Capture', icon: <Monitor className="w-3 h-3" /> },
  { id: 'screen_demo', value: 'screen_demo', label: 'Screen Demo + Cursor', category: 'Capture', icon: <Monitor className="w-3 h-3" /> },
  { id: 'capture', value: 'capture', label: 'Live Capture', category: 'Capture', icon: <Camera className="w-3 h-3" /> },
  { id: 'interview', value: 'interview', label: 'Interview Style', category: 'Capture', icon: <Mic className="w-3 h-3" /> },
  { id: 'webcam_overlay', value: 'webcam_overlay', label: 'Webcam Overlay', category: 'Capture', icon: <Camera className="w-3 h-3" /> },
  
  // ---- COMBINATIONS (Tier-gated recipes) ----
  { id: 'combo_avatar_ppt', value: 'combo_avatar_ppt', label: 'Avatar + PPT', category: 'Combinations', icon: <Layers className="w-3 h-3" /> },
  { id: 'combo_avatar_screen', value: 'combo_avatar_screen', label: 'Avatar + Screen Demo', category: 'Combinations', icon: <Layers className="w-3 h-3" /> },
  { id: 'combo_3d_voice', value: 'combo_3d_voice', label: '3D + Voiceover', category: 'Combinations', icon: <Box className="w-3 h-3" /> },
  { id: 'combo_3d_avatar', value: 'combo_3d_avatar', label: '3D + Avatar Presenter', category: 'Combinations', icon: <Box className="w-3 h-3" /> },
  { id: 'combo_video_avatar', value: 'combo_video_avatar', label: 'Video + Avatar Overlay', category: 'Combinations', icon: <Film className="w-3 h-3" /> },
  { id: 'combo_animation_voice', value: 'combo_animation_voice', label: 'Animation + Voiceover', category: 'Combinations', icon: <Sparkles className="w-3 h-3" /> },
  { id: 'combo_multi_dialect', value: 'combo_multi_dialect', label: 'Multi-Dialect Demo', category: 'Combinations', icon: <Globe className="w-3 h-3" /> },
  { id: 'combo_interactive_demo', value: 'combo_interactive_demo', label: 'Interactive Product Demo', category: 'Combinations', icon: <Layers className="w-3 h-3" /> },
  { id: 'combo_full_production', value: 'combo_full_production', label: 'Full Production', category: 'Combinations', icon: <Film className="w-3 h-3" /> },
  
  // ---- REGIONAL/CULTURAL (Language-aware) ----
  { id: 'regional_mena', value: 'regional_mena', label: 'MENA Styled (RTL)', category: 'Regional', icon: <Globe className="w-3 h-3" /> },
  { id: 'regional_arabic_calligraphy', value: 'regional_arabic_calligraphy', label: 'Arabic Calligraphy', category: 'Regional', icon: <Globe className="w-3 h-3" /> },
  { id: 'regional_indian', value: 'regional_indian', label: 'Indian Cultural', category: 'Regional', icon: <Globe className="w-3 h-3" /> },
  { id: 'regional_cjk', value: 'regional_cjk', label: 'CJK Minimalist', category: 'Regional', icon: <Globe className="w-3 h-3" /> },
  { id: 'regional_african', value: 'regional_african', label: 'African Heritage', category: 'Regional', icon: <Globe className="w-3 h-3" /> },
  { id: 'regional_latam', value: 'regional_latam', label: 'Latin American', category: 'Regional', icon: <Globe className="w-3 h-3" /> },
];

// ============================================
// LANGUAGES - 70+ WITH REGIONS (Multi-select ready)
// ============================================
const LANGUAGES: MultiSelectOption[] = [
  // Western/EU
  { id: 'en', value: 'en', label: 'English (US)', category: 'Western/EU' },
  { id: 'en-gb', value: 'en-gb', label: 'English (UK)', category: 'Western/EU' },
  { id: 'es', value: 'es', label: 'Spanish', category: 'Western/EU' },
  { id: 'fr', value: 'fr', label: 'French', category: 'Western/EU' },
  { id: 'de', value: 'de', label: 'German', category: 'Western/EU' },
  { id: 'it', value: 'it', label: 'Italian', category: 'Western/EU' },
  { id: 'pt', value: 'pt', label: 'Portuguese', category: 'Western/EU' },
  { id: 'nl', value: 'nl', label: 'Dutch', category: 'Western/EU' },
  { id: 'pl', value: 'pl', label: 'Polish', category: 'Western/EU' },
  { id: 'ru', value: 'ru', label: 'Russian', category: 'Western/EU' },
  { id: 'uk', value: 'uk', label: 'Ukrainian', category: 'Western/EU' },
  { id: 'tr', value: 'tr', label: 'Turkish', category: 'Western/EU' },
  { id: 'el', value: 'el', label: 'Greek', category: 'Western/EU' },
  { id: 'sv', value: 'sv', label: 'Swedish', category: 'Western/EU' },
  { id: 'da', value: 'da', label: 'Danish', category: 'Western/EU' },
  { id: 'fi', value: 'fi', label: 'Finnish', category: 'Western/EU' },
  { id: 'no', value: 'no', label: 'Norwegian', category: 'Western/EU' },
  { id: 'cs', value: 'cs', label: 'Czech', category: 'Western/EU' },
  { id: 'ro', value: 'ro', label: 'Romanian', category: 'Western/EU' },
  { id: 'hu', value: 'hu', label: 'Hungarian', category: 'Western/EU' },
  // MENA/Arabic
  { id: 'ar', value: 'ar', label: 'Arabic (MSA)', category: 'MENA/Arabic' },
  { id: 'ar-sa', value: 'ar-sa', label: 'Arabic (Saudi)', category: 'MENA/Arabic' },
  { id: 'ar-eg', value: 'ar-eg', label: 'Arabic (Egyptian)', category: 'MENA/Arabic' },
  { id: 'ar-ae', value: 'ar-ae', label: 'Arabic (Gulf/UAE)', category: 'MENA/Arabic' },
  { id: 'ar-ma', value: 'ar-ma', label: 'Arabic (Moroccan)', category: 'MENA/Arabic' },
  { id: 'ar-lb', value: 'ar-lb', label: 'Arabic (Levantine)', category: 'MENA/Arabic' },
  { id: 'ar-iq', value: 'ar-iq', label: 'Arabic (Iraqi)', category: 'MENA/Arabic' },
  { id: 'he', value: 'he', label: 'Hebrew', category: 'MENA/Arabic' },
  { id: 'fa', value: 'fa', label: 'Persian/Farsi', category: 'MENA/Arabic' },
  { id: 'ur', value: 'ur', label: 'Urdu', category: 'MENA/Arabic' },
  // South Asia
  { id: 'hi', value: 'hi', label: 'Hindi', category: 'South Asia' },
  { id: 'bn', value: 'bn', label: 'Bengali', category: 'South Asia' },
  { id: 'ta', value: 'ta', label: 'Tamil', category: 'South Asia' },
  { id: 'te', value: 'te', label: 'Telugu', category: 'South Asia' },
  { id: 'mr', value: 'mr', label: 'Marathi', category: 'South Asia' },
  { id: 'gu', value: 'gu', label: 'Gujarati', category: 'South Asia' },
  { id: 'kn', value: 'kn', label: 'Kannada', category: 'South Asia' },
  { id: 'ml', value: 'ml', label: 'Malayalam', category: 'South Asia' },
  { id: 'pa', value: 'pa', label: 'Punjabi', category: 'South Asia' },
  { id: 'or', value: 'or', label: 'Odia', category: 'South Asia' },
  { id: 'as', value: 'as', label: 'Assamese', category: 'South Asia' },
  { id: 'ne', value: 'ne', label: 'Nepali', category: 'South Asia' },
  { id: 'si', value: 'si', label: 'Sinhala', category: 'South Asia' },
  { id: 'ks', value: 'ks', label: 'Kashmiri', category: 'South Asia' },
  { id: 'sd', value: 'sd', label: 'Sindhi', category: 'South Asia' },
  { id: 'kok', value: 'kok', label: 'Konkani', category: 'South Asia' },
  { id: 'mni', value: 'mni', label: 'Manipuri', category: 'South Asia' },
  { id: 'brx', value: 'brx', label: 'Bodo', category: 'South Asia' },
  { id: 'sat', value: 'sat', label: 'Santali', category: 'South Asia' },
  { id: 'mai', value: 'mai', label: 'Maithili', category: 'South Asia' },
  { id: 'doi', value: 'doi', label: 'Dogri', category: 'South Asia' },
  { id: 'dv', value: 'dv', label: 'Dhivehi (Maldives)', category: 'South Asia' },
  // CJK
  { id: 'zh', value: 'zh', label: 'Chinese (Simplified)', category: 'CJK' },
  { id: 'zh-tw', value: 'zh-tw', label: 'Chinese (Traditional)', category: 'CJK' },
  { id: 'zh-hk', value: 'zh-hk', label: 'Chinese (Cantonese)', category: 'CJK' },
  { id: 'ja', value: 'ja', label: 'Japanese', category: 'CJK' },
  { id: 'ko', value: 'ko', label: 'Korean', category: 'CJK' },
  // Southeast Asia
  { id: 'th', value: 'th', label: 'Thai', category: 'Southeast Asia' },
  { id: 'vi', value: 'vi', label: 'Vietnamese', category: 'Southeast Asia' },
  { id: 'id', value: 'id', label: 'Indonesian', category: 'Southeast Asia' },
  { id: 'ms', value: 'ms', label: 'Malay', category: 'Southeast Asia' },
  { id: 'tl', value: 'tl', label: 'Filipino/Tagalog', category: 'Southeast Asia' },
  { id: 'my', value: 'my', label: 'Burmese', category: 'Southeast Asia' },
  { id: 'km', value: 'km', label: 'Khmer', category: 'Southeast Asia' },
  { id: 'lo', value: 'lo', label: 'Lao', category: 'Southeast Asia' },
  // Africa
  { id: 'sw', value: 'sw', label: 'Swahili', category: 'Africa' },
  { id: 'am', value: 'am', label: 'Amharic', category: 'Africa' },
  { id: 'ha', value: 'ha', label: 'Hausa', category: 'Africa' },
  { id: 'ig', value: 'ig', label: 'Igbo', category: 'Africa' },
  { id: 'yo', value: 'yo', label: 'Yoruba', category: 'Africa' },
  { id: 'zu', value: 'zu', label: 'Zulu', category: 'Africa' },
  { id: 'xh', value: 'xh', label: 'Xhosa', category: 'Africa' },
  { id: 'af', value: 'af', label: 'Afrikaans', category: 'Africa' },
  { id: 'rw', value: 'rw', label: 'Kinyarwanda', category: 'Africa' },
  { id: 'om', value: 'om', label: 'Oromo', category: 'Africa' },
  // Latin America
  { id: 'es-mx', value: 'es-mx', label: 'Spanish (Mexico)', category: 'Latin America' },
  { id: 'es-ar', value: 'es-ar', label: 'Spanish (Argentina)', category: 'Latin America' },
  { id: 'es-co', value: 'es-co', label: 'Spanish (Colombia)', category: 'Latin America' },
  { id: 'pt-br', value: 'pt-br', label: 'Portuguese (Brazil)', category: 'Latin America' },
];

// Language options for SearchableSelect (primary language)
const LANGUAGE_OPTIONS: SearchableSelectOption[] = LANGUAGES.map(l => ({
  value: l.value,
  label: l.label,
  category: l.category,
}));

// ============================================
// TYPES
// ============================================
interface SimpleChapter {
  id: string;
  title: string;
  script: string;
  scriptSource: 'auto' | 'manual';
  customPrompt: string; // User prompt for AI generation
  aiSuggestedPrompt: string; // AI suggested prompt based on context
  visualTypes: string[];
  duration: number;
  voiceSource: 'tts' | 'upload' | 'clone';
  musicSource: 'ai' | 'upload' | 'none';
  status: 'draft' | 'generating' | 'complete' | 'error';
  progress: number;
  industry?: string; // Industry for this chapter (from template)
  generatedContent?: {
    previewUrl: string;
    videoUrl?: string;
    script: string;
    audioUrl?: string;
    sceneDescription?: string;
    transcreatedScripts?: Record<string, string>;
    transcreatedAudio?: Record<string, string>;
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
  // IP-based content detection
  const { defaultLanguage, isLoading: isDetectingLocation, geoData } = useIPBasedContent();

  // Ecosystem services hook - connects to all existing services
  const ecosystemServices = useStudioEcosystem();

  // Project state
  const [projectName, setProjectName] = useState('');
  const [selectedTemplates, setSelectedTemplates] = useState<string[]>([]);
  const [primaryLanguage, setPrimaryLanguage] = useState('en');
  const [additionalLanguages, setAdditionalLanguages] = useState<string[]>([]);
  const [chapters, setChapters] = useState<SimpleChapter[]>([]);
  const [expandedChapter, setExpandedChapter] = useState<string | null>(null);
  
  // Audio settings scope
  const [audioScope, setAudioScope] = useState<'chapter' | 'entire'>('entire');
  const [globalVoiceSource, setGlobalVoiceSource] = useState<'tts' | 'upload'>('tts');
  const [globalMusicSource, setGlobalMusicSource] = useState<'ai' | 'upload' | 'none'>('ai');
  
  // Script generation scope
  const [scriptScope, setScriptScope] = useState<'chapter' | 'entire'>('entire');
  
  // Output options
  const [outputMode, setOutputMode] = useState<'combined' | 'individual'>('combined');
  
  // Generation state
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [currentGeneratingChapter, setCurrentGeneratingChapter] = useState<string | null>(null);

  // Set primary language from IP detection
  useEffect(() => {
    if (defaultLanguage && !isDetectingLocation) {
      setPrimaryLanguage(defaultLanguage);
      if (geoData?.countryName) {
        toast.info(`Detected region: ${geoData.countryName}`, { duration: 3000 });
      }
    }
  }, [defaultLanguage, isDetectingLocation, geoData]);

  // Apply templates - combines chapters from all selected templates
  // Get default visual types based on template
  const getDefaultVisualsForTemplate = (templateId: string): string[] => {
    const visualMap: Record<string, string[]> = {
      saudi_vision_2030: ['video', 'infographics', '3d_environment'],
      uae_digital: ['video', 'animation', 'ppt'],
      india_digital: ['video', 'infographics', 'customer_journey'],
      india_upi: ['animation', 'infographics', 'ppt'],
      africa_tourism: ['video', '3d_environment', 'images'],
      mena_tourism: ['video', 'images', '3d'],
      healthcare_digital: ['avatar_presenter', 'ppt', 'infographics'],
      saas_demo: ['screen_record', 'avatar', 'ppt'],
      ai_showcase: ['animation', 'video', '3d'],
      landing_hero: ['video', 'kinetic_typography'],
      landing_product: ['screen_record', 'avatar_presenter'],
      social_short: ['video', 'kinetic_typography'],
      social_carousel: ['images', 'infographics'],
      social_youtube: ['avatar', 'video', 'ppt'],
    };
    return visualMap[templateId] || ['video'];
  };

  // Generate AI suggested prompt for a chapter
  const generateAISuggestedPrompt = (title: string, industry: string): string => {
    const prompts: Record<string, Record<string, string>> = {
      saudi_vision_2030: {
        'Vision Overview': 'Create an inspiring overview of Saudi Vision 2030, highlighting economic diversification and digital transformation.',
        'Economic Diversification': 'Explain Saudi Arabia\'s strategy to reduce oil dependence through tourism and tech investments.',
        'Digital Infrastructure': 'Showcase the smart city initiatives and 5G/cloud infrastructure developments.',
        'Smart Cities': 'Present NEOM and other futuristic urban development projects.',
        'Future Outlook': 'Summarize the 2030 goals and call-to-action for global partnerships.',
      },
      india_upi: {
        'UPI Introduction': 'Introduce UPI as a revolutionary real-time payment system transforming digital payments.',
        'Technology Behind UPI': 'Explain the NPCI architecture and instant bank-to-bank transfer technology.',
        'Merchant Adoption': 'Show how small businesses and street vendors adopted QR-based payments.',
        'Global Expansion': 'Highlight UPI expansion to UAE, Singapore, and future markets.',
      },
      africa_tourism: {
        'Wildlife Safari': 'Showcase breathtaking wildlife experiences across Africa\'s national parks.',
        'Cultural Heritage': 'Highlight rich cultural traditions and historical sites.',
        'Adventure Tourism': 'Present adventure activities from mountain climbing to water sports.',
        'Beach Destinations': 'Feature stunning coastal destinations and island getaways.',
        'Eco Tourism': 'Emphasize sustainable tourism and conservation efforts.',
      },
      saas_demo: {
        'Product Overview': 'Present the key value proposition and solve the main customer pain point.',
        'Key Features': 'Demonstrate the most impactful features with real-world examples.',
        'Use Cases': 'Show how different industries use the product successfully.',
        'Getting Started': 'Walk through the onboarding process and first-time user experience.',
      },
    };
    return prompts[industry]?.[title] || `Create engaging content about "${title}" for ${industry.replace(/_/g, ' ')} audience.`;
  };

  const applyTemplates = useCallback((templateIds: string[]) => {
    setSelectedTemplates(templateIds);
    
    if (templateIds.length === 0) {
      return;
    }

    const newChapters: SimpleChapter[] = [];
    templateIds.forEach(templateId => {
      const chapterTitles = TEMPLATE_CHAPTERS[templateId] || [];
      const defaultVisuals = getDefaultVisualsForTemplate(templateId);
      
      chapterTitles.forEach((title) => {
        newChapters.push({
          id: generateId(),
          title,
          script: '',
          scriptSource: 'auto',
          customPrompt: '',
          aiSuggestedPrompt: generateAISuggestedPrompt(title, templateId),
          visualTypes: defaultVisuals,
          duration: 30,
          voiceSource: globalVoiceSource,
          musicSource: globalMusicSource,
          status: 'draft' as const,
          progress: 0,
          industry: templateId,
        });
      });
    });

    if (newChapters.length > 0) {
      setChapters(newChapters);
      setExpandedChapter(newChapters[0].id);
      toast.success(`Applied ${templateIds.length} template(s) with ${newChapters.length} chapters`);
    }
  }, [globalVoiceSource, globalMusicSource]);

  // Chapter CRUD
  const addChapter = useCallback(() => {
    const industry = selectedTemplates[0] || 'blank';
    const title = `Chapter ${chapters.length + 1}`;
    const newChapter: SimpleChapter = {
      id: generateId(),
      title,
      script: '',
      scriptSource: 'auto',
      customPrompt: '',
      aiSuggestedPrompt: generateAISuggestedPrompt(title, industry),
      visualTypes: getDefaultVisualsForTemplate(industry),
      duration: 30,
      voiceSource: globalVoiceSource,
      musicSource: globalMusicSource,
      status: 'draft',
      progress: 0,
      industry,
    };
    setChapters(prev => [...prev, newChapter]);
    setExpandedChapter(newChapter.id);
    toast.success('Chapter added');
  }, [chapters.length, globalVoiceSource, globalMusicSource, selectedTemplates]);

  const updateChapter = useCallback((id: string, updates: Partial<SimpleChapter>) => {
    setChapters(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
  }, []);

  const deleteChapter = useCallback((id: string) => {
    setChapters(prev => prev.filter(c => c.id !== id));
    toast.success('Chapter deleted');
  }, []);

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

  // Apply global audio settings
  const applyGlobalAudioSettings = useCallback(() => {
    setChapters(prev => prev.map(c => ({
      ...c,
      voiceSource: globalVoiceSource,
      musicSource: globalMusicSource,
    })));
    toast.success('Applied audio settings to all chapters');
  }, [globalVoiceSource, globalMusicSource]);

  // Generate single chapter using ecosystem services
  const generateChapter = async (chapter: SimpleChapter) => {
    updateChapter(chapter.id, { status: 'generating', progress: 0 });
    setCurrentGeneratingChapter(chapter.id);

    try {
      let script = chapter.script;
      updateChapter(chapter.id, { progress: 10 });
      
      // Step 1: Generate script if auto
      if (chapter.scriptSource === 'auto' || !script.trim()) {
        console.log('[Studio] Generating script for:', chapter.title);
        
        const effectivePrompt = chapter.customPrompt?.trim() 
          || chapter.aiSuggestedPrompt 
          || `Create engaging content about "${chapter.title}"`;
        
        const industryContext = chapter.industry 
          ? ` for ${chapter.industry.replace(/_/g, ' ')} industry` 
          : '';
        
        const { data: scriptData, error: scriptError } = await supabase.functions.invoke('ai-universal-processor', {
          body: {
            provider: 'gemini',
            model: 'gemini-2.0-flash',
            prompt: `${effectivePrompt}

Generate a professional ${chapter.duration}-second voiceover script${industryContext}.
Visual style: ${chapter.visualTypes.join(', ')}.
Language: ${primaryLanguage}. Keep it engaging, concise, and professional.`,
            systemPrompt: 'You are a professional scriptwriter specializing in video content. Generate only the script text suitable for voiceover, no formatting or stage directions.',
            maxTokens: 600,
            action: 'generate_script'
          }
        });

        if (scriptError) throw new Error(scriptError.message);
        script = scriptData?.content || scriptData?.response || `Script for ${chapter.title}`;
        updateChapter(chapter.id, { script, progress: 25 });
      } else {
        updateChapter(chapter.id, { progress: 25 });
      }

      // Step 2: Transcreation for additional languages (using ecosystem service)
      let transcreatedScripts: Record<string, string> = {};
      if (additionalLanguages.length > 0 && script) {
        console.log('[Studio] Transcreating to:', additionalLanguages);
        updateChapter(chapter.id, { progress: 35 });
        try {
          transcreatedScripts = await ecosystemServices.transcreateContent(
            script,
            primaryLanguage,
            additionalLanguages,
            'presentation'
          );
          console.log('[Studio] Transcreation complete for', Object.keys(transcreatedScripts).length, 'languages');
        } catch (e) {
          console.warn('[Studio] Transcreation skipped:', e);
        }
      }

      // Step 3: Generate TTS using ecosystem service (with regional routing)
      let audioUrl: string | undefined;
      let transcreatedAudio: Record<string, string> = {};
      
      if (chapter.voiceSource === 'tts' && script) {
        updateChapter(chapter.id, { progress: 50 });
        console.log('[Studio] Generating TTS with regional routing for:', primaryLanguage);
        
        try {
          // Primary language TTS using ecosystem service
          const voiceResult = await ecosystemServices.generateVoiceover(script, primaryLanguage);
          audioUrl = voiceResult.audioUrl;
          console.log('[Studio] Primary TTS complete, provider:', voiceResult.provider);
          
          // Additional languages TTS
          if (Object.keys(transcreatedScripts).length > 0) {
            updateChapter(chapter.id, { progress: 60 });
            transcreatedAudio = await ecosystemServices.generateMultiLanguageAudio(transcreatedScripts);
            console.log('[Studio] Multi-language audio complete for', Object.keys(transcreatedAudio).length, 'languages');
          }
        } catch (e) {
          console.warn('[Studio] TTS fallback used:', e);
          // Fallback to basic TTS
          try {
            const { data: ttsData } = await supabase.functions.invoke('text-to-speech', {
              body: { text: script.substring(0, 1000), voice: 'alloy', model: 'tts-1' }
            });
            if (ttsData?.audioContent) {
              audioUrl = `data:audio/mp3;base64,${ttsData.audioContent}`;
            }
          } catch (fallbackError) {
            console.warn('[Studio] TTS completely skipped');
          }
        }
      }

      // Step 4: Generate background music using ecosystem service
      if (chapter.musicSource === 'ai') {
        updateChapter(chapter.id, { progress: 70 });
        console.log('[Studio] Generating background music');
        try {
          const musicResult = await ecosystemServices.generateMusic(
            `Professional ${chapter.visualTypes[0] || 'corporate'} background music, ${chapter.industry || 'business'} style`,
            chapter.duration
          );
          console.log('[Studio] Music generated:', musicResult.audioUrl?.substring(0, 50));
          // Music URL stored for final mixing
        } catch (e) {
          console.warn('[Studio] Music generation skipped:', e);
        }
      }

      // Step 5: Generate video/visual content using ecosystem service
      updateChapter(chapter.id, { progress: 80 });
      const visualType = chapter.visualTypes[0] || 'video';
      let previewUrl = `https://placehold.co/1920x1080/ec4899/ffffff?text=${encodeURIComponent(chapter.title)}`;
      let videoUrl: string | undefined;
      
      try {
        console.log('[Studio] Generating visual content, type:', visualType);
        const videoResult = await ecosystemServices.generateVideo(
          `${chapter.title}: ${script.substring(0, 200)}`,
          visualType,
          Math.min(chapter.duration, 10)
        );
        
        if (videoResult.success) {
          videoUrl = videoResult.videoUrl;
          previewUrl = videoResult.thumbnailUrl || videoResult.videoUrl || previewUrl;
          console.log('[Studio] Video generated with provider:', videoResult.provider);
        }
      } catch (e) {
        console.warn('[Studio] Video fallback to image:', e);
        // Fallback to image generation
        try {
          const { data: imageData } = await supabase.functions.invoke('ai-universal-processor', {
            body: {
              provider: 'gemini',
              imageGeneration: true,
              action: 'image_generation',
              prompt: `Professional ${visualType} thumbnail for: ${chapter.title}`,
              aspectRatio: '16:9'
            }
          });
          if (imageData?.imageUrl) previewUrl = imageData.imageUrl;
        } catch (imgError) {
          console.warn('[Studio] Image fallback used');
        }
      }

      updateChapter(chapter.id, {
        status: 'complete',
        progress: 100,
        script,
        generatedContent: { 
          previewUrl, 
          videoUrl,
          script, 
          audioUrl,
          transcreatedScripts: Object.keys(transcreatedScripts).length > 0 ? transcreatedScripts : undefined,
          transcreatedAudio: Object.keys(transcreatedAudio).length > 0 ? transcreatedAudio : undefined,
        }
      });

      return { success: true };
    } catch (error) {
      console.error('[Studio] Error:', error);
      updateChapter(chapter.id, { status: 'error', progress: 0 });
      toast.error(`Failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return { success: false };
    } finally {
      setCurrentGeneratingChapter(null);
    }
  };

  // Generate all chapters with optional video combining
  const generateAll = async () => {
    if (chapters.length === 0) {
      toast.error('Add at least one chapter first');
      return;
    }

    setIsGenerating(true);
    setGenerationProgress(0);
    let completed = 0;

    for (const chapter of chapters) {
      await generateChapter(chapter);
      completed++;
      setGenerationProgress(Math.round((completed / chapters.length) * 90)); // Reserve 10% for combining
    }

    // Combine chapters if output mode is 'combined'
    if (outputMode === 'combined' && chapters.length > 1) {
      setGenerationProgress(95);
      const completedChaptersWithVideo = chapters.filter(c => c.generatedContent?.videoUrl);
      
      if (completedChaptersWithVideo.length > 1) {
        try {
          console.log('[Studio] Combining', completedChaptersWithVideo.length, 'chapter videos');
          const combined = await ecosystemServices.combineChapterVideos(
            completedChaptersWithVideo.map(c => ({
              chapterId: c.id,
              videoUrl: c.generatedContent!.videoUrl!,
              audioUrl: c.generatedContent?.audioUrl,
            }))
          );
          toast.success(`Combined video created: ${combined.duration}s`);
        } catch (e) {
          console.warn('[Studio] Video combining skipped:', e);
        }
      }
    }

    setGenerationProgress(100);
    setIsGenerating(false);
    toast.success('All chapters generated!');
  };

  // Stats
  const totalDuration = chapters.reduce((sum, c) => sum + c.duration, 0);
  const completedChapters = chapters.filter(c => c.status === 'complete').length;
  const canGenerate = projectName.trim() && chapters.length > 0;

  return (
    <div className={cn("space-y-6 p-4", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            Content Studio
          </h2>
          <p className="text-sm text-muted-foreground">
            {geoData?.countryName && !isDetectingLocation && (
              <span className="mr-2">📍 {geoData.countryName}</span>
            )}
            Create multi-chapter content with AI
          </p>
        </div>
        <div className="flex gap-2">
          <Badge variant="outline">{chapters.length} Chapters</Badge>
          <Badge variant="outline">{completedChapters} Complete</Badge>
          <Badge variant="outline">{Math.floor(totalDuration / 60)}:{(totalDuration % 60).toString().padStart(2, '0')}</Badge>
        </div>
      </div>

      <Separator />

      {/* ========== SETUP SECTION ========== */}
      <div className="space-y-4">
        <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">Setup</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Project Name */}
          <div className="space-y-2">
            <Label>Project Name *</Label>
            <Input
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              placeholder="My Video Project"
            />
          </div>

          {/* Primary Language (IP-based default) */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Globe className="w-3 h-3" />
              Primary Language
              {isDetectingLocation && <Loader2 className="w-3 h-3 animate-spin" />}
            </Label>
            <SearchableSelect
              options={LANGUAGE_OPTIONS}
              value={primaryLanguage}
              onValueChange={setPrimaryLanguage}
              placeholder="Select primary language..."
              groupByCategory
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Templates Multi-Select */}
          <div className="space-y-2">
            <Label>Templates (Multi-select)</Label>
            <MultiSelectDropdown
              options={INDUSTRY_TEMPLATES}
              selectedValues={selectedTemplates}
              onSelectionChange={applyTemplates}
              placeholder="Select template(s)..."
              groupByCategory
              searchable
            />
          </div>

          {/* Additional Languages Multi-Select */}
          <div className="space-y-2">
            <Label>Additional Languages</Label>
            <MultiSelectDropdown
              options={LANGUAGES.filter(l => l.value !== primaryLanguage)}
              selectedValues={additionalLanguages}
              onSelectionChange={setAdditionalLanguages}
              placeholder="Add more languages..."
              groupByCategory
              searchable
            />
          </div>
        </div>
      </div>

      <Separator />

      {/* ========== GLOBAL SETTINGS ========== */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wide flex items-center gap-2">
            <Settings2 className="w-4 h-4" />
            Global Settings
          </h3>
          <div className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
            These settings apply to {scriptScope === 'entire' && audioScope === 'entire' ? 'all chapters' : 'individual chapters'}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Script Scope */}
          <div className="space-y-2">
            <Label className="text-xs flex items-center gap-2">
              <Wand2 className="w-3 h-3" />
              Script Generation
            </Label>
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2 p-2 bg-muted/50 rounded-md">
                <span className={cn("text-xs", scriptScope === 'chapter' && "font-medium text-primary")}>Per Chapter</span>
                <Switch
                  checked={scriptScope === 'entire'}
                  onCheckedChange={(v) => setScriptScope(v ? 'entire' : 'chapter')}
                />
                <span className={cn("text-xs", scriptScope === 'entire' && "font-medium text-primary")}>Entire Video</span>
              </div>
              <p className="text-[10px] text-muted-foreground px-1">
                {scriptScope === 'chapter' 
                  ? '✏️ Each chapter has its own script prompt' 
                  : '📄 One script generated for full video'}
              </p>
            </div>
          </div>

          {/* Audio Scope */}
          <div className="space-y-2">
            <Label className="text-xs flex items-center gap-2">
              <Volume2 className="w-3 h-3" />
              Voice & Music
            </Label>
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2 p-2 bg-muted/50 rounded-md">
                <span className={cn("text-xs", audioScope === 'chapter' && "font-medium text-primary")}>Per Chapter</span>
                <Switch
                  checked={audioScope === 'entire'}
                  onCheckedChange={(v) => setAudioScope(v ? 'entire' : 'chapter')}
                />
                <span className={cn("text-xs", audioScope === 'entire' && "font-medium text-primary")}>Entire Video</span>
              </div>
              <p className="text-[10px] text-muted-foreground px-1">
                {audioScope === 'chapter' 
                  ? '🎤 Different voice/music per chapter' 
                  : '🎵 Same voice & music throughout'}
              </p>
            </div>
          </div>

          {/* Global Voice */}
          <div className="space-y-2">
            <Label className="text-xs">Voice Source {audioScope === 'entire' && <Badge variant="outline" className="text-[8px] ml-1">Global</Badge>}</Label>
            <div className="flex gap-1">
              <Button
                size="sm"
                variant={globalVoiceSource === 'tts' ? 'default' : 'outline'}
                onClick={() => setGlobalVoiceSource('tts')}
                className="flex-1 h-8 text-xs"
              >
                <Mic className="w-3 h-3 mr-1" /> TTS
              </Button>
              <Button
                size="sm"
                variant={globalVoiceSource === 'upload' ? 'default' : 'outline'}
                onClick={() => setGlobalVoiceSource('upload')}
                className="flex-1 h-8 text-xs"
              >
                <Upload className="w-3 h-3 mr-1" /> Upload
              </Button>
            </div>
          </div>

          {/* Global Music */}
          <div className="space-y-2">
            <Label className="text-xs">Background Music {audioScope === 'entire' && <Badge variant="outline" className="text-[8px] ml-1">Global</Badge>}</Label>
            <div className="flex gap-1">
              <Button
                size="sm"
                variant={globalMusicSource === 'ai' ? 'default' : 'outline'}
                onClick={() => setGlobalMusicSource('ai')}
                className="flex-1 h-8 text-xs"
              >
                AI
              </Button>
              <Button
                size="sm"
                variant={globalMusicSource === 'upload' ? 'default' : 'outline'}
                onClick={() => setGlobalMusicSource('upload')}
                className="flex-1 h-8 text-xs"
              >
                Upload
              </Button>
              <Button
                size="sm"
                variant={globalMusicSource === 'none' ? 'default' : 'outline'}
                onClick={() => setGlobalMusicSource('none')}
                className="flex-1 h-8 text-xs"
              >
                None
              </Button>
            </div>
          </div>
        </div>

        {audioScope === 'entire' && (
          <Button size="sm" variant="secondary" onClick={applyGlobalAudioSettings}>
            Apply Audio Settings to All Chapters
          </Button>
        )}
      </div>

      <Separator />

      {/* ========== CHAPTERS SECTION ========== */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
            Chapters ({chapters.length})
          </h3>
          <Button size="sm" onClick={addChapter}>
            <Plus className="w-4 h-4 mr-1" /> Add Chapter
          </Button>
        </div>

        {chapters.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg bg-muted/20">
            <Sparkles className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>No chapters yet.</p>
            <p className="text-sm">Select a template above or add chapters manually.</p>
          </div>
        ) : (
          <ScrollArea className="max-h-[500px]">
            <div className="space-y-2 pr-2">
              {chapters.map((chapter, index) => (
                <ChapterRow
                  key={chapter.id}
                  chapter={chapter}
                  index={index}
                  totalChapters={chapters.length}
                  isExpanded={expandedChapter === chapter.id}
                  isGenerating={currentGeneratingChapter === chapter.id}
                  audioScope={audioScope}
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
      </div>

      {/* Generation Progress */}
      {isGenerating && (
        <div className="p-4 border rounded-lg border-primary/30 bg-primary/5">
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
        </div>
      )}

      <Separator />

      {/* ========== OUTPUT OPTIONS ========== */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-medium text-sm flex items-center gap-2">
            <Zap className="w-4 h-4" />
            Output
          </h3>
          <p className="text-xs text-muted-foreground">
            {outputMode === 'combined' ? 'Single combined video' : 'Separate files per chapter'}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant={outputMode === 'combined' ? 'default' : 'outline'}
            onClick={() => setOutputMode('combined')}
          >
            Combined
          </Button>
          <Button
            size="sm"
            variant={outputMode === 'individual' ? 'default' : 'outline'}
            onClick={() => setOutputMode('individual')}
          >
            Individual
          </Button>
        </div>
      </div>

      {/* ========== ACTIONS ========== */}
      <div className="flex justify-between items-center pt-4 border-t">
        <div className="flex gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="outline">
            <Save className="w-4 h-4 mr-2" /> Save Draft
          </Button>
        </div>
        <div className="flex flex-wrap gap-2">
          {/* Editor Handoff Buttons */}
          {completedChapters > 0 && (
            <>
              <Button
                variant="outline"
                onClick={() => ecosystemServices.sendToScriptEditor({
                  name: projectName,
                  primaryLanguage,
                  additionalLanguages,
                  chapters: chapters as any,
                  outputMode
                })}
              >
                <Pencil className="w-4 h-4 mr-2" /> Edit Scripts
              </Button>
              <Button
                variant="outline"
                onClick={() => ecosystemServices.sendToVideoEditor({
                  name: projectName,
                  primaryLanguage,
                  additionalLanguages,
                  chapters: chapters as any,
                  outputMode
                })}
              >
                <Video className="w-4 h-4 mr-2" /> Edit Video
              </Button>
            </>
          )}
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
                Generate All ({chapters.length})
              </>
            )}
          </Button>
        </div>
      </div>

      {/* ========== POST-GENERATION ACTIONS ========== */}
      {completedChapters > 0 && (
        <div className="p-4 rounded-lg border-2 border-dashed border-primary/30 bg-primary/5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-semibold flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-primary" />
                Ready for Next Steps
              </h4>
              <p className="text-sm text-muted-foreground">
                {completedChapters} of {chapters.length} chapters complete
              </p>
            </div>
            <Badge variant="secondary" className="bg-primary/20 text-primary">
              {Math.round((completedChapters / chapters.length) * 100)}% Complete
            </Badge>
          </div>

          <div className="flex flex-wrap gap-2">
            {/* Send to Review */}
            <Button
              variant="outline"
              onClick={() => {
                ecosystemServices.sendToProductionHub({
                  name: projectName,
                  primaryLanguage,
                  additionalLanguages,
                  chapters: chapters as any,
                  outputMode
                });
              }}
              className="gap-2"
            >
              <Send className="w-4 h-4" />
              Send to Review
            </Button>

            {/* Save as Template */}
            <Button
              variant="outline"
              onClick={async () => {
                try {
                  const { data: { session } } = await supabase.auth.getSession();
                  if (!session) {
                    toast.error('Please sign in to save templates');
                    return;
                  }

                  const templateData = {
                    name: `${projectName} Template`,
                    description: `Template from ${projectName} with ${chapters.length} chapters`,
                    template_type: 'user_created',
                    is_default: false,
                    created_by: session.user.id,
                    journey_stages: chapters.map((ch, idx) => ({
                      title: ch.title,
                      order: idx,
                      visualTypes: ch.visualTypes,
                      duration: ch.duration,
                      aiSuggestedPrompt: ch.aiSuggestedPrompt || ch.customPrompt,
                      scriptSource: ch.scriptSource,
                      voiceSource: ch.voiceSource,
                      musicSource: ch.musicSource,
                    })),
                    configuration: {
                      primaryLanguage,
                      additionalLanguages,
                      scriptScope,
                      audioScope,
                      outputMode,
                      globalVoiceSource,
                      globalMusicSource,
                    }
                  };

                  const { error } = await supabase
                    .from('agent_templates')
                    .insert(templateData);

                  if (error) throw error;
                  toast.success('Template saved! Find it in your templates list.');
                } catch (err) {
                  console.error('Save template error:', err);
                  toast.error('Failed to save template');
                }
              }}
              className="gap-2"
            >
              <BookTemplate className="w-4 h-4" />
              Save as Template
            </Button>

            {/* Publish */}
            <Button
              onClick={() => {
                // Store project in session for publisher
                sessionStorage.setItem('studio_publish_project', JSON.stringify({
                  name: projectName,
                  primaryLanguage,
                  additionalLanguages,
                  chapters: chapters.filter(c => c.status === 'complete'),
                  outputMode,
                  totalDuration,
                }));
                toast.success('Project ready for publishing!');
                // Navigate to publisher or open modal
                window.location.href = '/genie-admin?tab=scheduler&action=publish';
              }}
              className="gap-2 bg-primary hover:bg-primary/90"
            >
              <Share2 className="w-4 h-4" />
              Publish Content
            </Button>
          </div>

          <p className="text-xs text-muted-foreground">
            💡 <strong>Review:</strong> Multi-stage approval workflow • 
            <strong> Template:</strong> Reuse this structure for future projects • 
            <strong> Publish:</strong> Schedule for landing page or social media
          </p>
        </div>
      )}
    </div>
  );
};

// ============================================
// CHAPTER ROW COMPONENT (No nested cards)
// ============================================
interface ChapterRowProps {
  chapter: SimpleChapter;
  index: number;
  totalChapters: number;
  isExpanded: boolean;
  isGenerating: boolean;
  audioScope: 'chapter' | 'entire';
  onToggle: () => void;
  onUpdate: (updates: Partial<SimpleChapter>) => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onGenerate: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
}

const ChapterRow: React.FC<ChapterRowProps> = ({
  chapter,
  index,
  totalChapters,
  isExpanded,
  isGenerating,
  audioScope,
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
        "border rounded-lg overflow-hidden transition-all bg-background",
        isExpanded ? "ring-2 ring-primary/20" : "",
        chapter.status === 'complete' ? "border-emerald-500/30" : "",
        chapter.status === 'error' ? "border-destructive/30" : ""
      )}>
        {/* Header Row */}
        <CollapsibleTrigger asChild>
          <div className="flex items-center gap-2 p-3 cursor-pointer hover:bg-muted/50">
            {/* Reorder */}
            <div className="flex flex-col gap-0.5" onClick={(e) => e.stopPropagation()}>
              <Button size="icon" variant="ghost" className="h-5 w-5" disabled={index === 0} onClick={onMoveUp}>
                <ChevronUp className="w-3 h-3" />
              </Button>
              <Button size="icon" variant="ghost" className="h-5 w-5" disabled={index === totalChapters - 1} onClick={onMoveDown}>
                <ChevronDown className="w-3 h-3" />
              </Button>
            </div>
            
            {/* Number */}
            <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center font-medium shrink-0">
              {index + 1}
            </span>
            
            {/* Title */}
            <Input
              value={chapter.title}
              onChange={(e) => { e.stopPropagation(); onUpdate({ title: e.target.value }); }}
              onClick={(e) => e.stopPropagation()}
              className="h-8 flex-1 max-w-[180px]"
            />
            
            {/* Visual badges */}
            <div className="hidden md:flex items-center gap-1">
              {chapter.visualTypes.slice(0, 2).map(type => {
                const v = VISUAL_TYPES.find(vt => vt.value === type);
                return v ? (
                  <Badge key={type} variant="secondary" className="text-[10px]">{v.label}</Badge>
                ) : null;
              })}
              {chapter.visualTypes.length > 2 && (
                <Badge variant="outline" className="text-[10px]">+{chapter.visualTypes.length - 2}</Badge>
              )}
            </div>
            
            {/* Duration & Status */}
            <Badge variant="secondary" className="text-[10px]">{chapter.duration}s</Badge>
            <Badge className={cn("text-[10px]", statusColors[chapter.status])}>
              {chapter.status === 'generating' && <Loader2 className="w-3 h-3 mr-1 animate-spin" />}
              {chapter.status}
            </Badge>
            
            {/* Actions */}
            <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
              <Button size="icon" variant="ghost" className="h-7 w-7" onClick={onDuplicate}><Copy className="w-3 h-3" /></Button>
              <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive" onClick={onDelete}><Trash2 className="w-3 h-3" /></Button>
            </div>
            
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </div>
        </CollapsibleTrigger>

        {/* Progress */}
        {chapter.status === 'generating' && <Progress value={chapter.progress} className="h-1" />}

        {/* Expanded Content */}
        <CollapsibleContent>
          <div className="p-4 pt-2 space-y-4 border-t bg-muted/10">
            {/* Preview */}
            {chapter.generatedContent?.previewUrl && (
              <div className="relative aspect-video rounded-lg overflow-hidden bg-black max-w-md">
                <img src={chapter.generatedContent.previewUrl} alt={chapter.title} className="w-full h-full object-cover" />
                <div className="absolute bottom-2 right-2">
                  <Button size="sm" variant="secondary"><Play className="w-3 h-3 mr-1" /> Preview</Button>
                </div>
              </div>
            )}

            {/* AI Prompt Section with Enhance Button */}
            {chapter.scriptSource === 'auto' && (
              <div className="space-y-2 p-3 rounded-lg bg-muted/30 border border-muted">
                <div className="flex items-center justify-between">
                  <Label className="flex items-center gap-2 text-xs font-medium">
                    <Wand2 className="w-3 h-3 text-primary" />
                    AI Generation Prompt
                  </Label>
                  <div className="flex items-center gap-2">
                    {chapter.aiSuggestedPrompt && !chapter.customPrompt && (
                      <Badge variant="secondary" className="text-[10px]">AI Suggested</Badge>
                    )}
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-6 text-xs gap-1 text-primary hover:text-primary"
                      onClick={async () => {
                        const currentPrompt = chapter.customPrompt || chapter.aiSuggestedPrompt || chapter.title;
                        try {
                          const { data, error } = await supabase.functions.invoke('ai-universal-processor', {
                            body: {
                              action: 'enhance_chapter_prompt',
                              content: currentPrompt,
                              context: {
                                chapterTitle: chapter.title,
                                visualTypes: chapter.visualTypes,
                              }
                            }
                          });
                          if (data?.enhancement?.enhancedPrompt) {
                            onUpdate({ 
                              customPrompt: data.enhancement.enhancedPrompt,
                              script: data.enhancement.suggestedScript || chapter.script
                            });
                            toast.success('✨ Prompt enhanced with AI');
                          } else {
                            // Fallback: simple enhancement
                            const enhanced = `Create a professional ${chapter.visualTypes[0] || 'video'} segment for "${chapter.title}": ${currentPrompt}. Focus on clarity, engagement, and brand consistency.`;
                            onUpdate({ customPrompt: enhanced });
                            toast.success('✨ Prompt enhanced');
                          }
                        } catch (err) {
                          // Fallback enhancement
                          const enhanced = `Create a compelling ${chapter.visualTypes[0] || 'video'} segment about: ${currentPrompt}. Ensure visual impact and clear messaging.`;
                          onUpdate({ customPrompt: enhanced });
                          toast.info('Enhanced with local suggestions');
                        }
                      }}
                    >
                      <Sparkles className="w-3 h-3" />
                      Enhance
                    </Button>
                  </div>
                </div>
                <Textarea
                  value={chapter.customPrompt || chapter.aiSuggestedPrompt || ''}
                  onChange={(e) => onUpdate({ customPrompt: e.target.value })}
                  placeholder="Enter custom prompt or use AI suggestion..."
                  rows={2}
                  className="text-sm bg-background"
                />
                {chapter.aiSuggestedPrompt && chapter.customPrompt && (
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-6 text-xs text-muted-foreground"
                    onClick={() => onUpdate({ customPrompt: '' })}
                  >
                    <RotateCcw className="w-3 h-3 mr-1" /> Reset to AI Suggestion
                  </Button>
                )}
              </div>
            )}

            {/* Script */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Script</Label>
                <div className="flex gap-1">
                  <Button size="sm" variant={chapter.scriptSource === 'auto' ? 'default' : 'outline'} onClick={() => onUpdate({ scriptSource: 'auto' })} className="h-7 text-xs">
                    <Wand2 className="w-3 h-3 mr-1" /> Auto
                  </Button>
                  <Button size="sm" variant={chapter.scriptSource === 'manual' ? 'default' : 'outline'} onClick={() => onUpdate({ scriptSource: 'manual' })} className="h-7 text-xs">
                    <Pencil className="w-3 h-3 mr-1" /> Manual
                  </Button>
                </div>
              </div>
              <Textarea
                value={chapter.script}
                onChange={(e) => onUpdate({ script: e.target.value })}
                placeholder={chapter.scriptSource === 'auto' ? "Script will be auto-generated based on the prompt above..." : "Enter your script manually..."}
                rows={3}
              />
            </div>

            {/* Visual Types Multi-Select */}
            <div className="space-y-2">
              <Label>Visual Types (Multi-select)</Label>
              <MultiSelectDropdown
                options={VISUAL_TYPES}
                selectedValues={chapter.visualTypes}
                onSelectionChange={(values) => onUpdate({ visualTypes: values.length > 0 ? values : ['video'] })}
                placeholder="Select visual types..."
                groupByCategory
                searchable
              />
            </div>

            {/* Duration */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Duration</Label>
                <span className="text-sm text-muted-foreground">{chapter.duration}s</span>
              </div>
              <Slider value={[chapter.duration]} onValueChange={([v]) => onUpdate({ duration: v })} min={5} max={120} step={5} />
            </div>

            {/* Per-Chapter Audio (only if audioScope is 'chapter') */}
            {audioScope === 'chapter' && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs">Voice</Label>
                  <div className="flex gap-1">
                    <Button size="sm" variant={chapter.voiceSource === 'tts' ? 'default' : 'outline'} onClick={() => onUpdate({ voiceSource: 'tts' })} className="flex-1 h-8 text-xs">TTS</Button>
                    <Button size="sm" variant={chapter.voiceSource === 'upload' ? 'default' : 'outline'} onClick={() => onUpdate({ voiceSource: 'upload' })} className="flex-1 h-8 text-xs">Upload</Button>
                    <Button size="sm" variant={chapter.voiceSource === 'clone' ? 'default' : 'outline'} onClick={() => onUpdate({ voiceSource: 'clone' })} className="flex-1 h-8 text-xs">Clone</Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">Music</Label>
                  <div className="flex gap-1">
                    <Button size="sm" variant={chapter.musicSource === 'ai' ? 'default' : 'outline'} onClick={() => onUpdate({ musicSource: 'ai' })} className="flex-1 h-8 text-xs">AI</Button>
                    <Button size="sm" variant={chapter.musicSource === 'upload' ? 'default' : 'outline'} onClick={() => onUpdate({ musicSource: 'upload' })} className="flex-1 h-8 text-xs">Upload</Button>
                    <Button size="sm" variant={chapter.musicSource === 'none' ? 'default' : 'outline'} onClick={() => onUpdate({ musicSource: 'none' })} className="flex-1 h-8 text-xs">None</Button>
                  </div>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-between pt-3 border-t">
              <div className="flex gap-2">
                <Button size="sm" variant="ghost" onClick={onDuplicate}><Copy className="w-4 h-4 mr-1" /> Duplicate</Button>
                <Button size="sm" variant="ghost" className="text-destructive" onClick={onDelete}><Trash2 className="w-4 h-4 mr-1" /> Delete</Button>
              </div>
              <Button size="sm" onClick={onGenerate} disabled={isGenerating}>
                {isGenerating ? <><Loader2 className="w-4 h-4 mr-1 animate-spin" /> Generating...</> :
                 chapter.status === 'complete' ? <><RotateCcw className="w-4 h-4 mr-1" /> Regenerate</> :
                 <><Zap className="w-4 h-4 mr-1" /> Generate</>}
              </Button>
            </div>
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
};

export default SimpleCompositionStudio;
