/**
 * Genie Studio Unified Hub
 * Consolidated view with segment-first navigation across all categories
 * Categories: Architecture, Technical, Functional, Market Analysis, Assets, Recording Studio
 */

import React, { useState, useRef, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Users,
  Plane,
  Briefcase,
  GraduationCap,
  Heart,
  Building,
  Smartphone,
  Globe,
  Code,
  Bot,
  TrendingUp,
  TrendingDown,
  Check,
  X,
  AlertCircle,
  Star,
  Target,
  Zap,
  Link,
  Download,
  Maximize2,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Layers,
  Package,
  Cpu,
  BarChart3,
  PieChart,
  LineChart,
  Server,
  Database,
  Workflow,
  CheckCircle,
  Clock,
  Shield,
  FileText,
  Film,
  Layout,
  FileImage,
  FileCode,
  Radio,
  Sparkles,
  Video,
  Mic
} from 'lucide-react';
import { cn } from '@/lib/utils';
import html2canvas from 'html2canvas';
import { toast } from 'sonner';
import '@/styles/enhanced-tabs.css';

// =============================================================================
// TYPES
// =============================================================================

interface Segment {
  id: string;
  name: string;
  icon: React.ElementType;
  emoji: string;
  marketSize: string;
  growthRate: string;
  competitionLevel: 'Low' | 'Medium' | 'High' | 'Very High';
  entryBarrier: 'Low' | 'Medium' | 'High' | 'Very High';
  genieFit: number;
  priority: 'P0' | 'P1' | 'P2';
  color: string;
  tagline: string;
}

interface Competitor {
  name: string;
  segment: string;
  type: 'Direct' | 'Feature' | 'Platform';
  strengths: string[];
  weaknesses: string[];
  pricing: string;
  threat: 'Low' | 'Medium' | 'High';
}

interface AppOpportunity {
  name: string;
  description: string;
  platforms: ('iOS' | 'Android' | 'Web' | 'Desktop' | 'API')[];
  segment: string;
  priority: 'P0' | 'P1' | 'P2';
  complexity: 'Low' | 'Medium' | 'High';
  marketGap: string;
}

interface Integration {
  partner: string;
  type: 'API' | 'Plugin' | 'LTI' | 'SSO' | 'Partnership';
  segment: string;
  value: string;
  priority: 'P0' | 'P1' | 'P2';
}

interface FeatureModule {
  name: string;
  standaloneApp: string;
  apiEndpoint: string;
  agentCapability: string;
  segments: string[];
}

interface UserPainPoint {
  segment: string;
  quote: string;
  source: string;
  painPoint: string;
}

interface RoadmapPhase {
  id: string;
  name: string;
  weeks: string;
  status: 'completed' | 'in-progress' | 'planned';
  completion: number;
  features: { name: string; status: string; market?: string }[];
  segments: string[];
}

// =============================================================================
// DATA - All consolidated data
// =============================================================================

const segments: Segment[] = [
  { id: 'all', name: 'All Segments', icon: Globe, emoji: '🌍', marketSize: '$150B+', growthRate: '+19%', competitionLevel: 'High', entryBarrier: 'Medium', genieFit: 5, priority: 'P0', color: 'hsl(var(--primary))', tagline: 'Complete view across all market segments' },
  { id: 'creator', name: 'Creator Economy', icon: Users, emoji: '🎨', marketSize: '$50B+', growthRate: '+20%', competitionLevel: 'Very High', entryBarrier: 'Medium', genieFit: 5, priority: 'P0', color: 'hsl(258, 90%, 66%)', tagline: '"I just want to go viral, is that too much to ask?" 🚀' },
  { id: 'traveler', name: 'Traveler/Experience', icon: Plane, emoji: '✈️', marketSize: '$8B+', growthRate: '+15%', competitionLevel: 'Medium', entryBarrier: 'Low', genieFit: 4, priority: 'P1', color: 'hsl(199, 89%, 48%)', tagline: '"500 photos from vacation, zero edited videos" 📸' },
  { id: 'smb', name: 'SMB Marketing', icon: Briefcase, emoji: '🏪', marketSize: '$15B+', growthRate: '+25%', competitionLevel: 'High', entryBarrier: 'Medium', genieFit: 5, priority: 'P0', color: 'hsl(38, 92%, 50%)', tagline: '"Synthesia is amazing but $67/month is too much" 💸' },
  { id: 'education', name: 'Education', icon: GraduationCap, emoji: '📚', marketSize: '$12B+', growthRate: '+18%', competitionLevel: 'Medium', entryBarrier: 'High', genieFit: 4, priority: 'P1', color: 'hsl(160, 84%, 39%)', tagline: '"4 hours to make a 10-minute lesson video" ⏰' },
  { id: 'healthcare', name: 'Healthcare', icon: Heart, emoji: '🏥', marketSize: '$25B+', growthRate: '+22%', competitionLevel: 'Low', entryBarrier: 'Very High', genieFit: 5, priority: 'P0', color: 'hsl(350, 70%, 50%)', tagline: '"Patients forget 80% of what I tell them" 💊' },
  { id: 'enterprise', name: 'Enterprise', icon: Building, emoji: '🏢', marketSize: '$40B+', growthRate: '+15%', competitionLevel: 'High', entryBarrier: 'High', genieFit: 4, priority: 'P1', color: 'hsl(215, 16%, 47%)', tagline: '"Legal review takes 3 weeks per video" ⚖️' },
];

const competitors: Competitor[] = [
  // Creator Economy
  { name: 'Descript', segment: 'Creator Economy', type: 'Direct', strengths: ['Transcription-first editing', 'Overdub voice cloning', 'Collaboration'], weaknesses: ['Expensive', 'Complex for beginners', 'Desktop only'], pricing: '$12-24/mo', threat: 'High' },
  { name: 'Riverside.fm', segment: 'Creator Economy', type: 'Direct', strengths: ['Studio-quality remote recording', 'Separate tracks'], weaknesses: ['Limited post-production', 'No AI editing'], pricing: '$15-24/mo', threat: 'Medium' },
  { name: 'Kapwing', segment: 'Creator Economy', type: 'Direct', strengths: ['Easy-to-use', 'Collaborative', 'Web-based'], weaknesses: ['Basic features', 'Watermarks on free'], pricing: '$16-24/mo', threat: 'Medium' },
  { name: 'CapCut', segment: 'Creator Economy', type: 'Direct', strengths: ['Free tier', 'TikTok integration', 'Mobile-first'], weaknesses: ['Limited AI', 'No voice cloning', 'Basic analytics'], pricing: 'Free/$8/mo', threat: 'High' },
  { name: 'ElevenLabs', segment: 'Creator Economy', type: 'Feature', strengths: ['Best-in-class voice cloning', 'Multiple voices'], weaknesses: ['No editing workflow', 'Standalone only'], pricing: '$5-99/mo', threat: 'Low' },
  { name: 'Opus Clip', segment: 'Creator Economy', type: 'Feature', strengths: ['AI clip generation', 'Viral scoring'], weaknesses: ['No production suite', 'Limited customization'], pricing: '$15-39/mo', threat: 'Medium' },
  { name: 'Clipchamp', segment: 'Creator Economy', type: 'Platform', strengths: ['Microsoft integration', 'Free tier', 'Web-based'], weaknesses: ['Basic features', 'No AI', 'Limited export'], pricing: 'Free/$11.99/mo', threat: 'Medium' },
  // Traveler
  { name: 'InShot', segment: 'Traveler/Experience', type: 'Direct', strengths: ['Mobile-native', 'Social templates', 'Easy filters'], weaknesses: ['Ads', 'Limited pro features', 'No desktop'], pricing: 'Free/$3.99/mo', threat: 'Medium' },
  { name: 'GoPro Quik', segment: 'Traveler/Experience', type: 'Direct', strengths: ['Action cam integration', 'Auto-edit'], weaknesses: ['GoPro-centric', 'Limited features'], pricing: 'Free/$9.99/yr', threat: 'Low' },
  // SMB
  { name: 'Loom', segment: 'SMB Marketing', type: 'Direct', strengths: ['Screen recording', 'Quick sharing', 'Analytics'], weaknesses: ['Limited editing', 'No AI features'], pricing: '$12.50/mo', threat: 'High' },
  { name: 'Synthesia', segment: 'SMB Marketing', type: 'Direct', strengths: ['AI avatars', 'Multi-language'], weaknesses: ['Expensive', 'Robotic feel'], pricing: '$22-67/mo', threat: 'High' },
  { name: 'Pictory', segment: 'SMB Marketing', type: 'Direct', strengths: ['Blog-to-video', 'AI summary'], weaknesses: ['Template-bound', 'Limited customization'], pricing: '$19-39/mo', threat: 'Medium' },
  { name: 'InVideo', segment: 'SMB Marketing', type: 'Direct', strengths: ['Templates', 'Stock library', '5000+ templates'], weaknesses: ['Quality ceiling', 'Learning curve'], pricing: '$15-30/mo', threat: 'Medium' },
  { name: 'Canva Video', segment: 'SMB Marketing', type: 'Feature', strengths: ['Brand kits', 'Templates', 'Team features'], weaknesses: ['Basic editing', 'No AI narration', 'Limited effects'], pricing: '$12.99/mo', threat: 'Medium' },
  // Education
  { name: 'Loom Education', segment: 'Education', type: 'Direct', strengths: ['Free for edu', 'Simple', 'Async learning'], weaknesses: ['No production tools', 'Basic features'], pricing: 'Free', threat: 'Low' },
  { name: 'Panopto', segment: 'Education', type: 'Platform', strengths: ['LMS integration', 'Lecture capture'], weaknesses: ['Enterprise pricing', 'Complex'], pricing: 'Custom', threat: 'High' },
  { name: 'Edpuzzle', segment: 'Education', type: 'Feature', strengths: ['Interactive videos', 'Student tracking'], weaknesses: ['Limited creation', 'K-12 focus'], pricing: 'Free/$8/mo', threat: 'Medium' },
  { name: 'WeVideo', segment: 'Education', type: 'Direct', strengths: ['LTI integration', 'Student accounts', 'Chromebook support'], weaknesses: ['Dated UI', 'Limited AI', 'Slow rendering'], pricing: '$4.99-15.99/mo', threat: 'Medium' },
  // Healthcare
  { name: 'Healthwise', segment: 'Healthcare', type: 'Direct', strengths: ['Clinical content library', 'Evidence-based'], weaknesses: ['No customization', 'Expensive'], pricing: 'Custom', threat: 'Medium' },
  { name: 'Emmi Solutions', segment: 'Healthcare', type: 'Direct', strengths: ['Patient engagement', 'Multi-language'], weaknesses: ['Expensive', 'Limited personalization'], pricing: 'Custom', threat: 'Medium' },
  // Enterprise
  { name: 'Brightcove', segment: 'Enterprise', type: 'Platform', strengths: ['Scalable', 'Reliable', 'Enterprise-grade'], weaknesses: ['No creation tools', 'Expensive'], pricing: 'Custom', threat: 'Medium' },
  { name: 'Kaltura', segment: 'Enterprise', type: 'Platform', strengths: ['Feature-rich', 'Open source option'], weaknesses: ['Overwhelming', 'Complex setup'], pricing: 'Custom', threat: 'High' },
  { name: 'Microsoft Stream', segment: 'Enterprise', type: 'Platform', strengths: ['M365 integration', 'Free with license'], weaknesses: ['Basic features', 'No AI creation'], pricing: 'Bundled', threat: 'Medium' },
  { name: 'Synthesia Enterprise', segment: 'Enterprise', type: 'Direct', strengths: ['AI avatars', 'Multi-language', 'Enterprise ready'], weaknesses: ['Very expensive', 'Limited customization', 'Robotic feel'], pricing: 'Custom', threat: 'Medium' },
];

const appOpportunities: AppOpportunity[] = [
  { name: 'ScriptGenius', description: 'AI script generation from prompts', platforms: ['iOS', 'Android', 'Web', 'API'], segment: 'Creator Economy', priority: 'P0', complexity: 'Medium', marketGap: 'No mobile-first script writing' },
  { name: 'VoiceOver Pro', description: 'TTS with voice selection & cloning', platforms: ['iOS', 'Android', 'Web', 'API'], segment: 'Creator Economy', priority: 'P0', complexity: 'Low', marketGap: 'Quick voiceover on mobile' },
  { name: 'ClipMaster', description: 'Auto-trim to highlights', platforms: ['iOS', 'Android', 'Web', 'Desktop', 'API'], segment: 'Creator Economy', priority: 'P0', complexity: 'Medium', marketGap: 'Social-first editing' },
  { name: 'TranscribeNow', description: 'Real-time transcription', platforms: ['iOS', 'Android', 'API'], segment: 'Creator Economy', priority: 'P1', complexity: 'Low', marketGap: 'Accurate mobile transcription' },
  { name: 'ReelGenius', description: 'AI-powered social reel creator', platforms: ['iOS', 'Android', 'Web'], segment: 'Creator Economy', priority: 'P0', complexity: 'Medium', marketGap: 'Creators want one-tap reels' },
  { name: 'TripClip', description: 'Auto-edit travel videos with location tagging', platforms: ['iOS', 'Android'], segment: 'Traveler/Experience', priority: 'P0', complexity: 'Medium', marketGap: 'No AI travel video editor exists' },
  { name: 'TravelMontage', description: 'Auto-edit trip highlights with maps', platforms: ['iOS', 'Android'], segment: 'Traveler/Experience', priority: 'P1', complexity: 'High', marketGap: 'Story-first editing' },
  { name: 'QuickPromo', description: '60-second marketing video generator', platforms: ['Web', 'iOS', 'Android'], segment: 'SMB Marketing', priority: 'P0', complexity: 'Low', marketGap: 'SMBs lack quick video tools' },
  { name: 'DemoMaker', description: 'Product demo automation', platforms: ['Web', 'Desktop'], segment: 'SMB Marketing', priority: 'P0', complexity: 'Medium', marketGap: 'Self-service demo creation' },
  { name: 'TrainingForge', description: 'SOP → Video converter', platforms: ['Web', 'API'], segment: 'SMB Marketing', priority: 'P1', complexity: 'High', marketGap: 'Document-first video' },
  { name: 'EduClip', description: 'Lecture-to-microlearning converter', platforms: ['Web', 'API'], segment: 'Education', priority: 'P1', complexity: 'High', marketGap: 'No automated lecture segmentation' },
  { name: 'LectureGenius', description: 'Curriculum → video course', platforms: ['Web'], segment: 'Education', priority: 'P1', complexity: 'High', marketGap: 'Automated course creation' },
  { name: 'HealthNarrate', description: 'HIPAA-compliant patient education videos', platforms: ['Web', 'API'], segment: 'Healthcare', priority: 'P0', complexity: 'High', marketGap: 'No compliant AI video for healthcare' },
  { name: 'PatientEducator', description: 'Condition-specific video library', platforms: ['iOS', 'Android', 'Web'], segment: 'Healthcare', priority: 'P0', complexity: 'High', marketGap: 'Personalized patient content' },
  { name: 'TrainBot', description: 'Corporate training video automation', platforms: ['Web', 'Desktop', 'API'], segment: 'Enterprise', priority: 'P1', complexity: 'High', marketGap: 'Training videos take too long' },
  { name: 'PolicyCaster', description: 'Compliance doc → video', platforms: ['Web', 'API'], segment: 'Enterprise', priority: 'P1', complexity: 'Medium', marketGap: 'Policy automation' },
  { name: 'GlobalVoice', description: 'Multi-language automation', platforms: ['Web', 'API'], segment: 'Enterprise', priority: 'P1', complexity: 'Medium', marketGap: 'Localization at scale' },
];

const integrations: Integration[] = [
  { partner: 'YouTube', type: 'API', segment: 'Creator Economy', value: 'Direct publish, analytics sync, Shorts', priority: 'P0' },
  { partner: 'Spotify/Anchor', type: 'API', segment: 'Creator Economy', value: 'Podcast distribution', priority: 'P0' },
  { partner: 'TikTok', type: 'API', segment: 'Creator Economy', value: 'Direct publishing, trending audio', priority: 'P0' },
  { partner: 'Instagram', type: 'API', segment: 'Creator Economy', value: 'Reel publishing, insights sync', priority: 'P0' },
  { partner: 'Canva', type: 'Plugin', segment: 'Creator Economy', value: 'Design-to-video pipeline', priority: 'P0' },
  { partner: 'Notion', type: 'API', segment: 'Creator Economy', value: 'Script storage/collaboration', priority: 'P0' },
  { partner: 'Expedia', type: 'Partnership', segment: 'Traveler/Experience', value: 'Trip memory videos', priority: 'P1' },
  { partner: 'Google Maps', type: 'API', segment: 'Traveler/Experience', value: 'Location tagging, route visualization', priority: 'P1' },
  { partner: 'HubSpot', type: 'API', segment: 'SMB Marketing', value: 'CRM-triggered video personalization', priority: 'P0' },
  { partner: 'Salesforce', type: 'API', segment: 'SMB Marketing', value: 'Sales enablement', priority: 'P1' },
  { partner: 'Shopify', type: 'Plugin', segment: 'SMB Marketing', value: 'Product video generation', priority: 'P0' },
  { partner: 'Zapier', type: 'API', segment: 'SMB Marketing', value: 'Multi-app workflows', priority: 'P0' },
  { partner: 'Canvas LMS', type: 'LTI', segment: 'Education', value: 'Grade passback, assignments', priority: 'P1' },
  { partner: 'Blackboard', type: 'LTI', segment: 'Education', value: 'LMS integration', priority: 'P1' },
  { partner: 'Google Classroom', type: 'API', segment: 'Education', value: 'K-12 distribution', priority: 'P1' },
  { partner: 'Epic', type: 'API', segment: 'Healthcare', value: 'EHR embedding via FHIR', priority: 'P0' },
  { partner: 'Cerner', type: 'API', segment: 'Healthcare', value: 'EHR embedding via FHIR', priority: 'P1' },
  { partner: 'Zoom Healthcare', type: 'API', segment: 'Healthcare', value: 'Telehealth + content', priority: 'P1' },
  { partner: 'Microsoft 365', type: 'API', segment: 'Enterprise', value: 'Teams/SharePoint embedding', priority: 'P0' },
  { partner: 'Workday', type: 'API', segment: 'Enterprise', value: 'HR/training integration', priority: 'P1' },
  { partner: 'Okta/Azure AD', type: 'SSO', segment: 'Enterprise', value: 'Enterprise authentication', priority: 'P0' },
  { partner: 'n8n', type: 'API', segment: 'Enterprise', value: 'Self-hosted workflows', priority: 'P1' },
];

const featureModules: FeatureModule[] = [
  { name: 'Trim/Clips', standaloneApp: 'ClipMaster Pro', apiEndpoint: '/api/trim', agentCapability: 'Auto-clip extraction', segments: ['creator', 'smb', 'education'] },
  { name: 'TTS/Voiceover', standaloneApp: 'VoiceGenius', apiEndpoint: '/api/tts', agentCapability: 'Voice generation agent', segments: ['creator', 'smb', 'education', 'healthcare'] },
  { name: 'Transcription', standaloneApp: 'TranscribeNow', apiEndpoint: '/api/transcribe', agentCapability: 'Real-time transcription', segments: ['creator', 'smb', 'enterprise'] },
  { name: 'Script Gen', standaloneApp: 'ScriptAI', apiEndpoint: '/api/script', agentCapability: 'Content generation agent', segments: ['creator', 'smb', 'education'] },
  { name: 'Doc-to-Video', standaloneApp: 'DocuCast', apiEndpoint: '/api/doc-to-video', agentCapability: 'Document processing agent', segments: ['smb', 'education', 'enterprise'] },
  { name: 'Translation', standaloneApp: 'GlobalCast', apiEndpoint: '/api/translate', agentCapability: 'Multi-language agent', segments: ['healthcare', 'enterprise'] },
];

const userPainPoints: UserPainPoint[] = [
  { segment: 'Creator Economy', quote: '"I spend 2 hours editing a 60-second reel. I wish I could just talk and have it edit itself."', source: 'TikTok Creator', painPoint: 'Time-consuming manual editing' },
  { segment: 'Creator Economy', quote: '"Finding the right music and syncing it takes forever. Auto-sync would save me so much time."', source: 'YouTube Creator', painPoint: 'Music sync challenges' },
  { segment: 'Traveler/Experience', quote: '"I have 500 photos and videos from my trip but no time to make a video. They just sit in my camera roll."', source: 'Travel Blogger', painPoint: 'Content overwhelm' },
  { segment: 'SMB Marketing', quote: '"We can\'t afford a video team, but customers expect professional videos. It\'s a huge gap."', source: 'Small Business Owner', painPoint: 'Resource constraints' },
  { segment: 'SMB Marketing', quote: '"Our product demos are outdated because updating them takes weeks with our current process."', source: 'Marketing Manager', painPoint: 'Update velocity' },
  { segment: 'Education', quote: '"Recording lectures is easy. Making them engaging for students? That takes hours of editing."', source: 'University Professor', painPoint: 'Engagement optimization' },
  { segment: 'Healthcare', quote: '"Patients forget 80% of what I tell them. Video would help, but HIPAA makes everything complicated."', source: 'Primary Care Physician', painPoint: 'Compliance complexity' },
  { segment: 'Healthcare', quote: '"We need patient education in 15 languages. Currently, we just don\'t have it."', source: 'Hospital Administrator', painPoint: 'Localization needs' },
  { segment: 'Enterprise', quote: '"Our training videos are 3 years old. Nobody wants to watch them, and nobody has time to update them."', source: 'L&D Director', painPoint: 'Content staleness' },
  { segment: 'Enterprise', quote: '"Legal review takes 3 weeks per video. By the time it\'s approved, the content is outdated."', source: 'Corporate Comms Manager', painPoint: 'Approval bottlenecks' },
];

const roadmapPhases: RoadmapPhase[] = [
  { id: 'P0', name: 'Core + Vibe↔Mind', weeks: '1-4', status: 'completed', completion: 100, features: [
    { name: 'Script Editor + AI Enhancement', status: 'done' },
    { name: 'TTS Generation (ElevenLabs/OpenAI)', status: 'done' },
    { name: 'Recording Studio Core', status: 'done' },
    { name: 'Teleprompter + Audio Mixer', status: 'done' },
    { name: 'Vibe ↔ Mind Bidirectional', status: 'done' },
  ], segments: ['all'] },
  { id: 'P1', name: 'Mobile & Remix', weeks: '5-8', status: 'in-progress', completion: 30, features: [
    { name: 'One-Tap Mobile Record', status: 'planned', market: '68% want' },
    { name: 'Quick Clips Generator', status: 'planned', market: '82% creators want' },
    { name: 'Multi-Clip Timeline', status: 'planned' },
    { name: 'Social Templates', status: 'planned' },
  ], segments: ['creator', 'traveler', 'smb'] },
  { id: 'P2', name: 'Advanced Features', weeks: '9-12', status: 'planned', completion: 10, features: [
    { name: 'Offline Mode', status: 'planned', market: '54% need' },
    { name: 'Voice-First Editing', status: 'planned', market: '47% want voice commands' },
    { name: 'AI Auto-Arrange', status: 'planned' },
    { name: 'Smart Transitions', status: 'planned' },
  ], segments: ['traveler', 'healthcare', 'enterprise'] },
  { id: 'P3', name: 'Segment-Specific', weeks: '13-16', status: 'planned', completion: 0, features: [
    { name: 'Product Demo Mode', status: 'planned', market: '71% want quick templates' },
    { name: 'Lesson Builder', status: 'planned', market: '69% want AI lesson scripts' },
    { name: 'HIPAA Recordings', status: 'planned', market: '94% want HIPAA <$100/mo' },
    { name: 'Voice Cloning', status: 'planned', market: '61% want voice cloning' },
  ], segments: ['smb', 'education', 'healthcare'] },
  { id: 'P4', name: 'Enterprise', weeks: '17-20', status: 'planned', completion: 0, features: [
    { name: 'AI Avatar Presenter', status: 'planned' },
    { name: 'White-label Solution', status: 'planned' },
    { name: 'Multi-tenant Workspaces', status: 'planned' },
    { name: 'Approval Workflows', status: 'planned' },
  ], segments: ['enterprise'] },
  { id: 'P5', name: 'Future + Auth', weeks: '21-24', status: 'planned', completion: 0, features: [
    { name: 'Batch Processing', status: 'planned' },
    { name: 'SSO/SAML Integration', status: 'planned' },
    { name: 'API Access', status: 'planned' },
    { name: 'Custom Model Training', status: 'planned' },
  ], segments: ['enterprise'] },
];

const architectureLayers = [
  { id: 'presentation', name: 'Presentation Layer', icon: Layout, color: 'hsl(199, 89%, 48%)', components: ['Script Repository UI', 'Recording Studio UI', 'Teleprompter', 'Export Manager'] },
  { id: 'application', name: 'Application Layer', icon: Workflow, color: 'hsl(258, 90%, 66%)', components: ['ContentFlow Engine', 'Multi-Clip Timeline', 'AI Orchestrator', 'Export Pipeline'] },
  { id: 'domain', name: 'Domain Layer', icon: Cpu, color: 'hsl(330, 81%, 60%)', components: ['ContentAnalyzer', 'Remix Engine', 'Compliance Checker', 'Translation Service'] },
  { id: 'infrastructure', name: 'Infrastructure Layer', icon: Database, color: 'hsl(215, 16%, 47%)', components: ['Supabase', 'TTS APIs', 'Storage', 'CDN'] },
];

const agentsList = [
  { name: 'script_generator_agent', status: 'partial', segments: ['creator', 'smb', 'education'] },
  { name: 'tts_orchestrator_agent', status: 'partial', segments: ['all'] },
  { name: 'content_analyzer_agent', status: 'implemented', segments: ['all'] },
  { name: 'remix_orchestrator_agent', status: 'planned', segments: ['creator', 'smb'] },
  { name: 'compliance_checker_agent', status: 'planned', segments: ['healthcare', 'enterprise'] },
  { name: 'translation_agent', status: 'planned', segments: ['healthcare', 'enterprise'] },
  { name: 'collaboration_agent', status: 'planned', segments: ['enterprise'] },
  { name: 'approval_workflow_agent', status: 'planned', segments: ['enterprise', 'healthcare'] },
  { name: 'production_orchestrator_agent', status: 'partial', segments: ['enterprise'] },
  { name: 'scheduling_agent', status: 'planned', segments: ['enterprise'] },
  { name: 'resource_allocation_agent', status: 'planned', segments: ['enterprise'] },
  { name: 'analytics_agent', status: 'planned', segments: ['creator', 'smb', 'enterprise'] },
];

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

const getSegmentColor = (segmentId: string): string => {
  const segment = segments.find(s => s.id === segmentId);
  return segment?.color || 'hsl(var(--muted))';
};

const getSegmentName = (segmentId: string): string => {
  const segment = segments.find(s => s.id === segmentId);
  return segment?.name || segmentId;
};

const filterBySegment = <T extends { segment?: string; segments?: string[] }>(
  items: T[],
  segmentId: string
): T[] => {
  if (segmentId === 'all') return items;
  return items.filter(item => {
    if (item.segment) {
      return item.segment === getSegmentName(segmentId) || 
             item.segment.toLowerCase().includes(segmentId.toLowerCase());
    }
    if (item.segments) {
      return item.segments.includes(segmentId) || item.segments.includes('all');
    }
    return true;
  });
};

// =============================================================================
// SUB-COMPONENTS
// =============================================================================

const SegmentSelector: React.FC<{
  selected: string;
  onSelect: (id: string) => void;
}> = ({ selected, onSelect }) => (
  <div className="flex flex-wrap gap-2 p-3 bg-muted/30 rounded-lg border border-border">
    {segments.map(segment => {
      const Icon = segment.icon;
      const isSelected = selected === segment.id;
      return (
        <Button
          key={segment.id}
          variant={isSelected ? "default" : "outline"}
          size="sm"
          onClick={() => onSelect(segment.id)}
          className={cn(
            "gap-2 transition-all",
            isSelected && "ring-2 ring-offset-2"
          )}
          style={isSelected ? { backgroundColor: segment.color } : {}}
        >
          <span className="text-lg">{segment.emoji}</span>
          <span className="hidden sm:inline">{segment.name}</span>
        </Button>
      );
    })}
  </div>
);

const SegmentOverviewCard: React.FC<{ segment: Segment }> = ({ segment }) => {
  const Icon = segment.icon;
  const segmentCompetitors = filterBySegment(competitors, segment.id);
  const segmentApps = filterBySegment(appOpportunities, segment.id);
  const segmentIntegrations = filterBySegment(integrations, segment.id);
  const segmentPainPoints = filterBySegment(userPainPoints, segment.id);

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-3">
          <div 
            className="w-12 h-12 rounded-lg flex items-center justify-center text-2xl"
            style={{ backgroundColor: segment.color + '20' }}
          >
            {segment.emoji}
          </div>
          <div>
            <CardTitle className="text-xl">{segment.name}</CardTitle>
            <p className="text-sm text-muted-foreground italic">{segment.tagline}</p>
          </div>
          <Badge variant="outline" className="ml-auto" style={{ borderColor: segment.color, color: segment.color }}>
            {segment.priority}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <div className="text-center p-3 bg-muted/30 rounded-lg">
            <p className="text-2xl font-bold" style={{ color: segment.color }}>{segment.marketSize}</p>
            <p className="text-xs text-muted-foreground">Market Size</p>
          </div>
          <div className="text-center p-3 bg-muted/30 rounded-lg">
            <p className="text-2xl font-bold text-green-500">{segment.growthRate}</p>
            <p className="text-xs text-muted-foreground">Growth Rate</p>
          </div>
          <div className="text-center p-3 bg-muted/30 rounded-lg">
            <p className="text-lg font-bold">{segmentCompetitors.length}</p>
            <p className="text-xs text-muted-foreground">Competitors</p>
          </div>
          <div className="text-center p-3 bg-muted/30 rounded-lg">
            <p className="text-lg font-bold">{segmentApps.length}</p>
            <p className="text-xs text-muted-foreground">App Opportunities</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <Target className="h-4 w-4 text-muted-foreground" />
            <span>Competition: <Badge variant="secondary">{segment.competitionLevel}</Badge></span>
          </div>
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-muted-foreground" />
            <span>Entry Barrier: <Badge variant="secondary">{segment.entryBarrier}</Badge></span>
          </div>
          <div className="flex items-center gap-2">
            <Star className="h-4 w-4 text-yellow-500" />
            <span>Genie Fit: {segment.genieFit}/5</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export const GenieStudioUnifiedHub: React.FC = () => {
  const [selectedSegment, setSelectedSegment] = useState<string>('all');
  const [activeCategory, setActiveCategory] = useState<string>('overview');
  const [activeSubTab, setActiveSubTab] = useState<string>('summary');
  const diagramRef = useRef<HTMLDivElement>(null);

  // Filtered data based on selected segment
  const filteredCompetitors = useMemo(() => filterBySegment(competitors, selectedSegment), [selectedSegment]);
  const filteredApps = useMemo(() => filterBySegment(appOpportunities, selectedSegment), [selectedSegment]);
  const filteredIntegrations = useMemo(() => filterBySegment(integrations, selectedSegment), [selectedSegment]);
  const filteredPainPoints = useMemo(() => filterBySegment(userPainPoints, selectedSegment), [selectedSegment]);
  const filteredModules = useMemo(() => 
    featureModules.filter(m => selectedSegment === 'all' || m.segments.includes(selectedSegment)), 
    [selectedSegment]
  );
  const filteredRoadmap = useMemo(() => 
    roadmapPhases.filter(p => selectedSegment === 'all' || p.segments.includes(selectedSegment) || p.segments.includes('all')),
    [selectedSegment]
  );
  const filteredAgents = useMemo(() => 
    agentsList.filter(a => selectedSegment === 'all' || a.segments.includes(selectedSegment) || a.segments.includes('all')),
    [selectedSegment]
  );

  const currentSegment = segments.find(s => s.id === selectedSegment) || segments[0];

  const handleDownloadPNG = async () => {
    if (!diagramRef.current) return;
    try {
      const canvas = await html2canvas(diagramRef.current, { backgroundColor: '#ffffff', scale: 2 });
      const url = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = url;
      link.download = `genie-studio-hub-${selectedSegment}-${activeCategory}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success('PNG downloaded successfully');
    } catch (error) {
      toast.error('Failed to download PNG');
    }
  };

  const categories = [
    { id: 'overview', label: 'Overview', icon: Globe },
    { id: 'architecture', label: 'Architecture', icon: Layers },
    { id: 'technical', label: 'Technical', icon: Server },
    { id: 'functional', label: 'Functional', icon: Users },
    { id: 'market', label: 'Market Analysis', icon: BarChart3 },
    { id: 'assets', label: 'Assets & Studio', icon: Video },
    { id: 'roadmap', label: 'Roadmap', icon: Target },
  ];

  return (
    <div className="space-y-4" ref={diagramRef}>
      {/* Header */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-2">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center">
                <Sparkles className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-2xl">Genie Studio Hub</CardTitle>
                <CardDescription>
                  Unified view across 6 segments • {competitors.length} Competitors • {appOpportunities.length} Apps • {integrations.length} Integrations
                </CardDescription>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleDownloadPNG} className="gap-2">
                <Download className="h-4 w-4" />PNG
              </Button>
              <Button variant="outline" size="sm" className="gap-2">
                <FileText className="h-4 w-4" />Docs<ExternalLink className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <SegmentSelector selected={selectedSegment} onSelect={setSelectedSegment} />
        </CardContent>
      </Card>

      {/* Category Tabs */}
      <Tabs value={activeCategory} onValueChange={setActiveCategory} className="w-full">
        <TabsList className="w-full justify-start flex-wrap h-auto gap-1 bg-muted/50 p-1">
          {categories.map(cat => {
            const Icon = cat.icon;
            return (
              <TabsTrigger key={cat.id} value={cat.id} className="gap-2 data-[state=active]:bg-background">
                <Icon className="h-4 w-4" />
                <span className="hidden md:inline">{cat.label}</span>
              </TabsTrigger>
            );
          })}
        </TabsList>

        {/* OVERVIEW TAB */}
        <TabsContent value="overview" className="space-y-4 mt-4">
          {selectedSegment === 'all' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {segments.filter(s => s.id !== 'all').map(segment => (
                <SegmentOverviewCard key={segment.id} segment={segment} />
              ))}
            </div>
          ) : (
            <SegmentOverviewCard segment={currentSegment} />
          )}

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            <Card className="bg-card border-border p-4 text-center">
              <p className="text-3xl font-bold text-primary">{filteredCompetitors.length}</p>
              <p className="text-sm text-muted-foreground">Competitors</p>
            </Card>
            <Card className="bg-card border-border p-4 text-center">
              <p className="text-3xl font-bold text-green-500">{filteredApps.length}</p>
              <p className="text-sm text-muted-foreground">App Opportunities</p>
            </Card>
            <Card className="bg-card border-border p-4 text-center">
              <p className="text-3xl font-bold text-blue-500">{filteredIntegrations.length}</p>
              <p className="text-sm text-muted-foreground">Integrations</p>
            </Card>
            <Card className="bg-card border-border p-4 text-center">
              <p className="text-3xl font-bold text-yellow-500">{filteredPainPoints.length}</p>
              <p className="text-sm text-muted-foreground">Pain Points</p>
            </Card>
            <Card className="bg-card border-border p-4 text-center">
              <p className="text-3xl font-bold text-purple-500">{filteredModules.length}</p>
              <p className="text-sm text-muted-foreground">Feature Modules</p>
            </Card>
            <Card className="bg-card border-border p-4 text-center">
              <p className="text-3xl font-bold text-orange-500">{filteredAgents.length}</p>
              <p className="text-sm text-muted-foreground">AI Agents</p>
            </Card>
          </div>
        </TabsContent>

        {/* ARCHITECTURE TAB */}
        <TabsContent value="architecture" className="space-y-4 mt-4">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Layers className="h-5 w-5" />
                Architecture Layers
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {architectureLayers.map(layer => {
                  const Icon = layer.icon;
                  return (
                    <div key={layer.id} className="p-4 rounded-lg border border-border" style={{ borderLeftColor: layer.color, borderLeftWidth: 4 }}>
                      <div className="flex items-center gap-2 mb-3">
                        <Icon className="h-5 w-5" style={{ color: layer.color }} />
                        <h4 className="font-semibold">{layer.name}</h4>
                      </div>
                      <ul className="space-y-1 text-sm text-muted-foreground">
                        {layer.components.map(comp => (
                          <li key={comp} className="flex items-center gap-2">
                            <Check className="h-3 w-3 text-green-500" />
                            {comp}
                          </li>
                        ))}
                      </ul>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Agents */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bot className="h-5 w-5" />
                AI Agents ({filteredAgents.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {filteredAgents.map(agent => (
                  <div key={agent.name} className="p-3 rounded-lg border border-border bg-muted/20 flex items-center gap-3">
                    <Bot className="h-5 w-5 text-primary" />
                    <div className="flex-1">
                      <p className="font-mono text-sm">{agent.name}</p>
                      <div className="flex gap-1 mt-1">
                        {agent.segments.slice(0, 3).map(seg => (
                          <Badge key={seg} variant="secondary" className="text-xs">{seg}</Badge>
                        ))}
                      </div>
                    </div>
                    <Badge variant={agent.status === 'implemented' ? 'default' : agent.status === 'partial' ? 'secondary' : 'outline'}>
                      {agent.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TECHNICAL TAB */}
        <TabsContent value="technical" className="space-y-4 mt-4">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Server className="h-5 w-5" />
                Feature Modules & APIs ({filteredModules.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Module</TableHead>
                    <TableHead>Standalone App</TableHead>
                    <TableHead>API Endpoint</TableHead>
                    <TableHead>Agent Capability</TableHead>
                    <TableHead>Segments</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredModules.map(module => (
                    <TableRow key={module.name}>
                      <TableCell className="font-semibold">{module.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="gap-1">
                          <Smartphone className="h-3 w-3" />
                          {module.standaloneApp}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-mono text-xs">{module.apiEndpoint}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{module.agentCapability}</TableCell>
                      <TableCell>
                        <div className="flex gap-1 flex-wrap">
                          {module.segments.map(seg => (
                            <Badge key={seg} variant="secondary" className="text-xs">{seg}</Badge>
                          ))}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* FUNCTIONAL TAB */}
        <TabsContent value="functional" className="space-y-4 mt-4">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-yellow-500" />
                User Pain Points ({filteredPainPoints.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredPainPoints.map((pain, idx) => (
                  <div key={idx} className="p-4 rounded-lg border border-border bg-muted/20">
                    <div className="flex items-start gap-3">
                      <div className="text-2xl">"</div>
                      <div className="flex-1">
                        <p className="italic text-sm mb-2">{pain.quote}</p>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{pain.source}</Badge>
                          <span className="text-xs text-muted-foreground">— {pain.painPoint}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* MARKET ANALYSIS TAB */}
        <TabsContent value="market" className="space-y-4 mt-4">
          <Tabs defaultValue="competitors" className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="competitors">Competitors ({filteredCompetitors.length})</TabsTrigger>
              <TabsTrigger value="apps">App Opportunities ({filteredApps.length})</TabsTrigger>
              <TabsTrigger value="integrations">Integrations ({filteredIntegrations.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="competitors">
              <Card className="bg-card border-border">
                <CardContent className="pt-4">
                  <ScrollArea className="h-[500px]">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Competitor</TableHead>
                          <TableHead>Segment</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Strengths</TableHead>
                          <TableHead>Weaknesses</TableHead>
                          <TableHead>Pricing</TableHead>
                          <TableHead>Threat</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredCompetitors.map(comp => (
                          <TableRow key={comp.name}>
                            <TableCell className="font-semibold">{comp.name}</TableCell>
                            <TableCell><Badge variant="secondary">{comp.segment}</Badge></TableCell>
                            <TableCell><Badge variant="outline">{comp.type}</Badge></TableCell>
                            <TableCell className="text-xs max-w-[200px]">
                              <ul className="list-disc list-inside">
                                {comp.strengths.slice(0, 2).map(s => <li key={s}>{s}</li>)}
                              </ul>
                            </TableCell>
                            <TableCell className="text-xs max-w-[200px]">
                              <ul className="list-disc list-inside text-muted-foreground">
                                {comp.weaknesses.slice(0, 2).map(w => <li key={w}>{w}</li>)}
                              </ul>
                            </TableCell>
                            <TableCell className="font-mono text-xs">{comp.pricing}</TableCell>
                            <TableCell>
                              <Badge variant={comp.threat === 'High' ? 'destructive' : comp.threat === 'Medium' ? 'secondary' : 'outline'}>
                                {comp.threat}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </ScrollArea>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="apps">
              <Card className="bg-card border-border">
                <CardContent className="pt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredApps.map(app => (
                      <div key={app.name} className="p-4 rounded-lg border border-border">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold">{app.name}</h4>
                          <Badge variant={app.priority === 'P0' ? 'default' : 'secondary'}>{app.priority}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">{app.description}</p>
                        <div className="flex flex-wrap gap-1 mb-2">
                          {app.platforms.map(p => (
                            <Badge key={p} variant="outline" className="text-xs">{p}</Badge>
                          ))}
                        </div>
                        <p className="text-xs text-green-600">Gap: {app.marketGap}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="integrations">
              <Card className="bg-card border-border">
                <CardContent className="pt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredIntegrations.map(int => (
                      <div key={int.partner} className="p-4 rounded-lg border border-border flex items-start gap-3">
                        <Link className="h-5 w-5 text-blue-500 mt-1" />
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h4 className="font-semibold">{int.partner}</h4>
                            <Badge variant="outline">{int.type}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">{int.value}</p>
                          <Badge variant={int.priority === 'P0' ? 'default' : 'secondary'} className="mt-2">{int.priority}</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </TabsContent>

        {/* ASSETS & STUDIO TAB */}
        <TabsContent value="assets" className="space-y-4 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-card border-border p-6 text-center">
              <Mic className="h-12 w-12 mx-auto mb-3 text-primary" />
              <h3 className="font-semibold mb-1">Recording Studio</h3>
              <p className="text-sm text-muted-foreground">Core recording with teleprompter, TTS, and audio mixing</p>
              <Badge className="mt-2" variant="default">P0 - Complete</Badge>
            </Card>
            <Card className="bg-card border-border p-6 text-center">
              <Film className="h-12 w-12 mx-auto mb-3 text-blue-500" />
              <h3 className="font-semibold mb-1">Quick Clips</h3>
              <p className="text-sm text-muted-foreground">AI-powered clip generation from long-form content</p>
              <Badge className="mt-2" variant="secondary">P1 - Planned</Badge>
            </Card>
            <Card className="bg-card border-border p-6 text-center">
              <FileImage className="h-12 w-12 mx-auto mb-3 text-green-500" />
              <h3 className="font-semibold mb-1">Asset Gallery</h3>
              <p className="text-sm text-muted-foreground">Organized media library with tagging and search</p>
              <Badge className="mt-2" variant="secondary">P1 - Partial</Badge>
            </Card>
          </div>
        </TabsContent>

        {/* ROADMAP TAB */}
        <TabsContent value="roadmap" className="space-y-4 mt-4">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Implementation Roadmap (24 Weeks)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredRoadmap.map(phase => (
                  <div key={phase.id} className="p-4 rounded-lg border border-border">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <Badge variant={phase.status === 'completed' ? 'default' : phase.status === 'in-progress' ? 'secondary' : 'outline'}>
                          {phase.id}
                        </Badge>
                        <h4 className="font-semibold">{phase.name}</h4>
                        <span className="text-sm text-muted-foreground">Weeks {phase.weeks}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Progress value={phase.completion} className="w-24 h-2" />
                        <span className="text-sm font-medium">{phase.completion}%</span>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      {phase.features.map(feature => (
                        <div key={feature.name} className="flex items-center gap-2 text-sm">
                          {feature.status === 'done' ? (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          ) : (
                            <Clock className="h-4 w-4 text-muted-foreground" />
                          )}
                          <span className={feature.status === 'done' ? '' : 'text-muted-foreground'}>
                            {feature.name}
                          </span>
                          {feature.market && (
                            <Badge variant="outline" className="text-xs">{feature.market}</Badge>
                          )}
                        </div>
                      ))}
                    </div>
                    <div className="flex gap-1 mt-3">
                      {phase.segments.map(seg => (
                        <Badge key={seg} variant="secondary" className="text-xs">{seg}</Badge>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default GenieStudioUnifiedHub;
