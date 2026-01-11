/**
 * Genie Studio Unified Hub
 * Consolidated view with segment-first navigation across all categories
 * Categories: Architecture, Technical, Functional, Market Analysis, Assets, Recording Studio
 */

import React, { useState, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
  Mic,
  DollarSign
} from 'lucide-react';
import { GenieInvestorDashboard } from './GenieInvestorDashboard';
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
  // Enhanced market intelligence
  userBase: string;
  languages: number;
  subscriptionModel: string;
  revenue: string;
  founded: number;
  yearsInMarket: number;
  genieDifferentiator: string;
  improvementNeeded: string;
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
  statusText: string;
  features: { name: string; status: string; market?: string }[];
  segments: string[];
  integrations: string[];
}

interface ProductSuite {
  id: string;
  name: string;
  icon: string;
  color: string;
  description: string;
  status: 'completed' | 'partial' | 'planned';
  phase: string;
  features: string[];
  agents: string[];
  apis: string[];
}

interface CrossFunctionalScenario {
  name: string;
  marketData?: string;
  segments?: string[];
  scenarios: number[];
  products: string[];
  features?: string[];
  agents: string[];
  apis: string[];
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
  { name: 'Descript', segment: 'Creator Economy', type: 'Direct', strengths: ['Transcription-first editing', 'Overdub voice cloning', 'Collaboration'], weaknesses: ['Expensive', 'Complex for beginners', 'Desktop only'], pricing: '$12-24/mo', threat: 'High', userBase: '3M+', languages: 25, subscriptionModel: 'Freemium + Tiered', revenue: '$50M ARR', founded: 2017, yearsInMarket: 9, genieDifferentiator: 'Unified script-to-publish pipeline, mobile-first, healthcare compliance', improvementNeeded: 'Match voice cloning quality, add desktop app' },
  { name: 'Riverside.fm', segment: 'Creator Economy', type: 'Direct', strengths: ['Studio-quality remote recording', 'Separate tracks'], weaknesses: ['Limited post-production', 'No AI editing'], pricing: '$15-24/mo', threat: 'Medium', userBase: '500K+', languages: 12, subscriptionModel: 'Tiered Monthly', revenue: '$15M ARR', founded: 2020, yearsInMarket: 6, genieDifferentiator: 'Integrated post-production AI, script-first workflow', improvementNeeded: 'Add multi-guest remote recording' },
  { name: 'Kapwing', segment: 'Creator Economy', type: 'Direct', strengths: ['Easy-to-use', 'Collaborative', 'Web-based'], weaknesses: ['Basic features', 'Watermarks on free'], pricing: '$16-24/mo', threat: 'Medium', userBase: '10M+', languages: 8, subscriptionModel: 'Freemium', revenue: '$20M ARR', founded: 2017, yearsInMarket: 9, genieDifferentiator: 'AI-powered auto-edit, TTS integration, no watermarks', improvementNeeded: 'Improve collaboration features' },
  { name: 'CapCut', segment: 'Creator Economy', type: 'Direct', strengths: ['Free tier', 'TikTok integration', 'Mobile-first'], weaknesses: ['Limited AI', 'No voice cloning', 'Basic analytics'], pricing: 'Free/$8/mo', threat: 'High', userBase: '500M+', languages: 45, subscriptionModel: 'Freemium', revenue: '$200M+ ARR', founded: 2020, yearsInMarket: 6, genieDifferentiator: 'Script-first workflow, voice cloning, segment-specific templates', improvementNeeded: 'Match mobile UX polish, add trending sounds' },
  { name: 'ElevenLabs', segment: 'Creator Economy', type: 'Feature', strengths: ['Best-in-class voice cloning', 'Multiple voices'], weaknesses: ['No editing workflow', 'Standalone only'], pricing: '$5-99/mo', threat: 'Low', userBase: '2M+', languages: 32, subscriptionModel: 'Usage-based + Tiered', revenue: '$80M ARR', founded: 2022, yearsInMarket: 4, genieDifferentiator: 'Integrated TTS in full production suite, not standalone', improvementNeeded: 'Improve voice quality parity' },
  { name: 'Opus Clip', segment: 'Creator Economy', type: 'Feature', strengths: ['AI clip generation', 'Viral scoring'], weaknesses: ['No production suite', 'Limited customization'], pricing: '$15-39/mo', threat: 'Medium', userBase: '1M+', languages: 15, subscriptionModel: 'Tiered Monthly', revenue: '$25M ARR', founded: 2022, yearsInMarket: 4, genieDifferentiator: 'Full production pipeline, not just clipping', improvementNeeded: 'Add viral scoring algorithm' },
  { name: 'Clipchamp', segment: 'Creator Economy', type: 'Platform', strengths: ['Microsoft integration', 'Free tier', 'Web-based'], weaknesses: ['Basic features', 'No AI', 'Limited export'], pricing: 'Free/$11.99/mo', threat: 'Medium', userBase: '20M+', languages: 20, subscriptionModel: 'Freemium (M365 bundled)', revenue: 'N/A (Microsoft)', founded: 2013, yearsInMarket: 13, genieDifferentiator: 'AI-powered editing, script workflow, segment templates', improvementNeeded: 'Add Office integration' },
  // Traveler
  { name: 'InShot', segment: 'Traveler/Experience', type: 'Direct', strengths: ['Mobile-native', 'Social templates', 'Easy filters'], weaknesses: ['Ads', 'Limited pro features', 'No desktop'], pricing: 'Free/$3.99/mo', threat: 'Medium', userBase: '500M+', languages: 30, subscriptionModel: 'Freemium + Ads', revenue: '$100M+ ARR', founded: 2015, yearsInMarket: 11, genieDifferentiator: 'AI auto-edit travel montage, location tagging, offline sync', improvementNeeded: 'Match filter variety, social templates' },
  { name: 'GoPro Quik', segment: 'Traveler/Experience', type: 'Direct', strengths: ['Action cam integration', 'Auto-edit'], weaknesses: ['GoPro-centric', 'Limited features'], pricing: 'Free/$9.99/yr', threat: 'Low', userBase: '10M+', languages: 12, subscriptionModel: 'Hardware-bundled + Subscription', revenue: 'N/A (GoPro)', founded: 2016, yearsInMarket: 10, genieDifferentiator: 'Device-agnostic, AI narration, trip story templates', improvementNeeded: 'Add action cam auto-detect' },
  // SMB
  { name: 'Loom', segment: 'SMB Marketing', type: 'Direct', strengths: ['Screen recording', 'Quick sharing', 'Analytics'], weaknesses: ['Limited editing', 'No AI features'], pricing: '$12.50/mo', threat: 'High', userBase: '25M+', languages: 10, subscriptionModel: 'Freemium + Tiered', revenue: '$150M ARR', founded: 2015, yearsInMarket: 11, genieDifferentiator: 'AI editing, script generation, approval workflows', improvementNeeded: 'Add quick screen recording mode' },
  { name: 'Synthesia', segment: 'SMB Marketing', type: 'Direct', strengths: ['AI avatars', 'Multi-language'], weaknesses: ['Expensive', 'Robotic feel'], pricing: '$22-67/mo', threat: 'High', userBase: '100K+', languages: 140, subscriptionModel: 'Tiered Monthly/Annual', revenue: '$60M ARR', founded: 2017, yearsInMarket: 9, genieDifferentiator: '70% cheaper, natural TTS, real presenter option', improvementNeeded: 'Add AI avatar option' },
  { name: 'Pictory', segment: 'SMB Marketing', type: 'Direct', strengths: ['Blog-to-video', 'AI summary'], weaknesses: ['Template-bound', 'Limited customization'], pricing: '$19-39/mo', threat: 'Medium', userBase: '200K+', languages: 8, subscriptionModel: 'Tiered Monthly', revenue: '$10M ARR', founded: 2020, yearsInMarket: 6, genieDifferentiator: 'Full editing control, not template-bound', improvementNeeded: 'Add blog/article import' },
  { name: 'InVideo', segment: 'SMB Marketing', type: 'Direct', strengths: ['Templates', 'Stock library', '5000+ templates'], weaknesses: ['Quality ceiling', 'Learning curve'], pricing: '$15-30/mo', threat: 'Medium', userBase: '7M+', languages: 16, subscriptionModel: 'Freemium + Tiered', revenue: '$35M ARR', founded: 2017, yearsInMarket: 9, genieDifferentiator: 'AI-first approach, simpler UX, segment templates', improvementNeeded: 'Expand template library' },
  { name: 'Canva Video', segment: 'SMB Marketing', type: 'Feature', strengths: ['Brand kits', 'Templates', 'Team features'], weaknesses: ['Basic editing', 'No AI narration', 'Limited effects'], pricing: '$12.99/mo', threat: 'Medium', userBase: '170M+', languages: 100, subscriptionModel: 'Freemium + Pro', revenue: '$2.3B ARR', founded: 2013, yearsInMarket: 13, genieDifferentiator: 'AI TTS, script-first, advanced editing', improvementNeeded: 'Add brand kit import' },
  // Education
  { name: 'Loom Education', segment: 'Education', type: 'Direct', strengths: ['Free for edu', 'Simple', 'Async learning'], weaknesses: ['No production tools', 'Basic features'], pricing: 'Free', threat: 'Low', userBase: '5M+ edu', languages: 10, subscriptionModel: 'Free for Education', revenue: 'N/A (part of Loom)', founded: 2015, yearsInMarket: 11, genieDifferentiator: 'Full production suite, LMS integration, student tracking', improvementNeeded: 'Add edu-specific free tier' },
  { name: 'Panopto', segment: 'Education', type: 'Platform', strengths: ['LMS integration', 'Lecture capture'], weaknesses: ['Enterprise pricing', 'Complex'], pricing: 'Custom', threat: 'High', userBase: '1000+ institutions', languages: 20, subscriptionModel: 'Enterprise Annual', revenue: '$100M+ ARR', founded: 2007, yearsInMarket: 19, genieDifferentiator: 'Affordable, AI-powered, modern UX, no enterprise bloat', improvementNeeded: 'Deepen LMS integrations' },
  { name: 'Edpuzzle', segment: 'Education', type: 'Feature', strengths: ['Interactive videos', 'Student tracking'], weaknesses: ['Limited creation', 'K-12 focus'], pricing: 'Free/$8/mo', threat: 'Medium', userBase: '20M+ teachers', languages: 15, subscriptionModel: 'Freemium', revenue: '$30M ARR', founded: 2013, yearsInMarket: 13, genieDifferentiator: 'Full creation + interactivity, K-12 to higher ed', improvementNeeded: 'Add interactive quiz overlay' },
  { name: 'WeVideo', segment: 'Education', type: 'Direct', strengths: ['LTI integration', 'Student accounts', 'Chromebook support'], weaknesses: ['Dated UI', 'Limited AI', 'Slow rendering'], pricing: '$4.99-15.99/mo', threat: 'Medium', userBase: '30M+', languages: 8, subscriptionModel: 'Freemium + Edu Plans', revenue: '$25M ARR', founded: 2011, yearsInMarket: 15, genieDifferentiator: 'Modern AI-first UX, faster rendering, mobile support', improvementNeeded: 'Add Chromebook optimization' },
  // Healthcare
  { name: 'Healthwise', segment: 'Healthcare', type: 'Direct', strengths: ['Clinical content library', 'Evidence-based'], weaknesses: ['No customization', 'Expensive'], pricing: 'Custom', threat: 'Medium', userBase: '2000+ hospitals', languages: 20, subscriptionModel: 'Enterprise Annual', revenue: '$80M ARR', founded: 1975, yearsInMarket: 51, genieDifferentiator: 'Customizable, AI-personalized, provider-created content', improvementNeeded: 'Build clinical content library partnerships' },
  { name: 'Emmi Solutions', segment: 'Healthcare', type: 'Direct', strengths: ['Patient engagement', 'Multi-language'], weaknesses: ['Expensive', 'Limited personalization'], pricing: 'Custom', threat: 'Medium', userBase: '500+ health systems', languages: 25, subscriptionModel: 'Enterprise Annual', revenue: '$50M ARR', founded: 2002, yearsInMarket: 24, genieDifferentiator: 'AI personalization, affordable, provider-friendly', improvementNeeded: 'Add patient engagement tracking' },
  // Enterprise
  { name: 'Brightcove', segment: 'Enterprise', type: 'Platform', strengths: ['Scalable', 'Reliable', 'Enterprise-grade'], weaknesses: ['No creation tools', 'Expensive'], pricing: 'Custom', threat: 'Medium', userBase: '3000+ enterprises', languages: 20, subscriptionModel: 'Enterprise Annual', revenue: '$200M ARR', founded: 2004, yearsInMarket: 22, genieDifferentiator: 'Creation + hosting unified, AI-powered, affordable', improvementNeeded: 'Add enterprise CDN options' },
  { name: 'Kaltura', segment: 'Enterprise', type: 'Platform', strengths: ['Feature-rich', 'Open source option'], weaknesses: ['Overwhelming', 'Complex setup'], pricing: 'Custom', threat: 'High', userBase: '1000+ enterprises', languages: 30, subscriptionModel: 'Enterprise + Open Source', revenue: '$170M ARR', founded: 2006, yearsInMarket: 20, genieDifferentiator: 'Simple UX, AI-first, no complexity overhead', improvementNeeded: 'Add open source option' },
  { name: 'Microsoft Stream', segment: 'Enterprise', type: 'Platform', strengths: ['M365 integration', 'Free with license'], weaknesses: ['Basic features', 'No AI creation'], pricing: 'Bundled', threat: 'Medium', userBase: '300M+ M365', languages: 45, subscriptionModel: 'M365 Bundle', revenue: 'N/A (Microsoft)', founded: 2017, yearsInMarket: 9, genieDifferentiator: 'AI creation tools, not just hosting', improvementNeeded: 'Add M365 deep integration' },
  { name: 'Synthesia Enterprise', segment: 'Enterprise', type: 'Direct', strengths: ['AI avatars', 'Multi-language', 'Enterprise ready'], weaknesses: ['Very expensive', 'Limited customization', 'Robotic feel'], pricing: 'Custom', threat: 'Medium', userBase: '500+ enterprises', languages: 140, subscriptionModel: 'Enterprise Annual', revenue: '$40M ARR', founded: 2017, yearsInMarket: 9, genieDifferentiator: 'Natural TTS, real presenter + AI hybrid, 60% cheaper', improvementNeeded: 'Add AI avatar generation' },
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
  { id: 'P0', name: 'Core MVP', weeks: '1-4', status: 'completed', completion: 100, statusText: '100% Complete', features: [
    { name: 'Script Editor + AI Enhancement', status: 'done' },
    { name: 'TTS Generation (ElevenLabs/OpenAI)', status: 'done' },
    { name: 'Recording Studio Core', status: 'done' },
    { name: 'Teleprompter + Audio Mixer', status: 'done' },
    { name: 'Vibe ↔ Mind Bidirectional', status: 'done' },
    { name: 'Basic Export (MP4/WebM)', status: 'done' },
    { name: 'Project Management', status: 'done' },
    { name: 'Recording Library (IndexedDB)', status: 'done' },
  ], segments: ['all'], integrations: ['Mind', 'Vibe'] },
  { id: 'P1', name: 'Mobile + Remix', weeks: '5-8', status: 'in-progress', completion: 30, statusText: '30% Complete', features: [
    { name: 'One-Tap Mobile Record', status: 'planned', market: '68% want' },
    { name: 'Quick Clips Generator', status: 'planned', market: '82% creators want' },
    { name: 'Multi-Clip Timeline', status: 'planned' },
    { name: 'Quick Templates (Social)', status: 'planned' },
    { name: 'PiP Recording Enhancement', status: 'partial' },
    { name: 'Background Music Library', status: 'done' },
    { name: 'Screen + Camera PiP', status: 'partial' },
    { name: 'Arc Integration (Basic)', status: 'partial' },
  ], segments: ['creator', 'traveler', 'smb'], integrations: ['Mind', 'Vibe', 'Arc'] },
  { id: 'P2', name: 'Advanced Features', weeks: '9-12', status: 'planned', completion: 10, statusText: '10% Complete', features: [
    { name: 'Offline Recording', status: 'planned', market: '54% need' },
    { name: 'Voice-First Editing', status: 'planned', market: '47% want' },
    { name: 'AI Auto-Arrange', status: 'planned' },
    { name: 'Smart Transitions', status: 'planned' },
    { name: 'Music Sync Assembly', status: 'planned' },
    { name: 'Collaborative Editing', status: 'planned' },
    { name: 'Spark Integration', status: 'planned' },
    { name: 'Location Story Mode', status: 'planned' },
  ], segments: ['traveler', 'healthcare', 'enterprise'], integrations: ['Mind', 'Vibe', 'Arc', 'Spark'] },
  { id: 'P3', name: 'Segment-Specific', weeks: '13-18', status: 'planned', completion: 0, statusText: '0%', features: [
    { name: 'Voice Cloning', status: 'planned', market: '61% want' },
    { name: 'Product Demo Mode (SMB)', status: 'planned', market: '71% want' },
    { name: 'Lesson Builder (Education)', status: 'planned', market: '69% want' },
    { name: 'Patient Education (Healthcare)', status: 'planned' },
    { name: 'Testimonial Collector', status: 'planned' },
    { name: 'Multi-Language Dubbing', status: 'planned' },
    { name: 'Traveler Kit (Auto-edit)', status: 'planned', market: '76% want' },
    { name: 'HIPAA Recording Mode', status: 'planned', market: '94% want <$100/mo' },
  ], segments: ['smb', 'education', 'healthcare'], integrations: ['Mind', 'Vibe', 'Arc', 'Spark', 'Hub'] },
  { id: 'P4', name: 'Enterprise', weeks: '19-26', status: 'planned', completion: 0, statusText: '0%', features: [
    { name: 'AI Avatar Presenter', status: 'planned' },
    { name: 'White-label Solution', status: 'planned' },
    { name: 'Multi-tenant Workspaces', status: 'planned' },
    { name: 'Franchise Templates', status: 'planned' },
    { name: 'Team Review Mobile', status: 'planned' },
    { name: 'Offline Compliance Mode', status: 'planned' },
    { name: 'Native Mobile App', status: 'planned' },
    { name: 'Real-time Translation', status: 'planned' },
  ], segments: ['enterprise'], integrations: ['Full Suite'] },
  { id: 'P5', name: 'Future + Auth', weeks: '27+', status: 'planned', completion: 0, statusText: '0%', features: [
    { name: 'Batch Video Processing', status: 'planned' },
    { name: 'API Access', status: 'planned' },
    { name: 'SSO/SAML Integration', status: 'planned' },
    { name: 'Custom Model Training', status: 'planned' },
    { name: 'Advanced Analytics', status: 'planned' },
    { name: 'B-Roll Library', status: 'planned' },
    { name: 'Version Control (Git-like)', status: 'planned' },
    { name: 'Compliance Audit Trail', status: 'planned' },
  ], segments: ['enterprise'], integrations: ['Full Suite + Partners'] },
];

// Product Suite
const productSuite: ProductSuite[] = [
  {
    id: 'spark',
    name: 'Genie Spark',
    icon: '⚡',
    color: 'hsl(25, 95%, 53%)',
    description: 'Quick Ideas & Brainstorming',
    status: 'planned',
    phase: 'P2',
    features: ['Idea capture', 'Quick prompts', 'Template starter'],
    agents: ['idea_generator_agent', 'template_matcher_agent'],
    apis: ['ai-universal-processor']
  },
  {
    id: 'mind',
    name: 'Genie Mind',
    icon: '🧞',
    color: 'hsl(258, 90%, 66%)',
    description: 'Script & Content Creation',
    status: 'completed',
    phase: 'P0',
    features: ['Script Editor', 'AI Enhancement', 'Project Management', 'TTS Generation'],
    agents: ['script_generator_agent', 'tts_orchestrator_agent'],
    apis: ['ai-universal-processor', 'tts-generate']
  },
  {
    id: 'vibe',
    name: 'Genie Vibe',
    icon: '🎬',
    color: 'hsl(160, 84%, 39%)',
    description: 'Recording & Production Studio',
    status: 'completed',
    phase: 'P0',
    features: ['Recording Studio', 'Teleprompter', 'Audio Mixer', 'Export Pipeline'],
    agents: ['content_analyzer_agent', 'export_agent'],
    apis: ['media-processor', 'export-pipeline']
  },
  {
    id: 'arc',
    name: 'Genie Arc',
    icon: '🌈',
    color: 'hsl(217, 91%, 60%)',
    description: 'Team Collaboration Hub',
    status: 'partial',
    phase: 'P1',
    features: ['Team workspace', 'Review & approval', 'Asset sharing', 'Version control'],
    agents: ['collaboration_agent', 'approval_workflow_agent'],
    apis: ['collaboration-sync', 'asset-manager']
  },
  {
    id: 'hub',
    name: 'Production Hub',
    icon: '🎯',
    color: 'hsl(270, 76%, 51%)',
    description: 'Enterprise Production Center',
    status: 'partial',
    phase: 'P1',
    features: ['Multi-show management', 'Broadcast scheduling', 'Team assignments', 'Pipeline automation'],
    agents: ['production_orchestrator_agent', 'scheduling_agent', 'resource_allocation_agent'],
    apis: ['shows-api', 'calendar-sync', 'team-management']
  }
];

// Cross-functional scenarios matrix
const crossFunctionalScenarios: Record<string, CrossFunctionalScenario> = {
  universal: {
    name: 'Universal (All Products)',
    scenarios: [1, 2, 3, 4, 5, 6, 7, 8, 61, 62, 63, 64, 65, 111, 112, 126, 127],
    features: ['Script Creation', 'TTS Generation', 'Recording', 'Export', 'Vibe↔Mind'],
    products: ['Mind', 'Vibe'],
    agents: ['script_generator_agent', 'tts_orchestrator_agent', 'content_analyzer_agent'],
    apis: ['ai-universal-processor', 'tts-generate', 'process-documents']
  },
  mobileCrossover: {
    name: 'Mobile-First',
    marketData: '68% want mobile-first',
    segments: ['Creator', 'Traveler', 'SMB', 'Healthcare', 'Education'],
    scenarios: [81, 82, 83, 84, 85],
    products: ['Mind', 'Vibe', 'Spark'],
    agents: ['mobile_sync_agent', 'offline_cache_agent'],
    apis: ['mobile-sync', 'offline-storage']
  },
  remixCrossover: {
    name: 'Remix & Clips',
    marketData: '82% creators want quick clips',
    segments: ['Creator', 'SMB', 'Education'],
    scenarios: [90, 101, 102, 103, 104, 105, 107, 108, 109, 110],
    products: ['Vibe', 'Arc'],
    agents: ['remix_engine_agent', 'clip_generator_agent'],
    apis: ['media-processor', 'clip-assembly']
  },
  offlineCrossover: {
    name: 'Offline Mode',
    marketData: '54% need offline',
    segments: ['Traveler', 'Healthcare', 'Enterprise'],
    scenarios: [82, 89, 99],
    products: ['Vibe', 'Mind (cached)'],
    agents: ['offline_sync_agent'],
    apis: ['offline-storage', 'sync-queue']
  },
  complianceCrossover: {
    name: 'Compliance & Legal',
    segments: ['Healthcare', 'Enterprise', 'Finance'],
    scenarios: [36, 43, 44, 45, 46, 93, 99],
    products: ['Vibe', 'Arc', 'Hub'],
    agents: ['hipaa_compliance_agent', 'audit_trail_agent'],
    apis: ['hipaa-audit', 'compliance-check']
  },
  agentAutomation: {
    name: 'Agent & Automation',
    scenarios: [111, 112, 113, 114, 115, 116, 117, 118, 119, 120, 121, 122, 123, 124, 125],
    products: ['Mind', 'Vibe', 'Hub'],
    agents: ['orchestrator_agent', 'quality_control_agent', 'analytics_agent', 'export_agent'],
    apis: ['agent-registry', 'workflow-engine', 'automation-rules']
  },
  apiIntegration: {
    name: 'API & Data Integration',
    scenarios: [126, 127, 128, 129, 130, 131, 132, 133, 134, 135, 136, 137, 138, 139, 140],
    products: ['All Suite'],
    agents: ['data_sync_agent', 'webhook_handler_agent'],
    apis: ['ElevenLabs', 'OpenAI', 'Google Cloud', 'Azure', 'AWS S3', 'Stripe', 'Supabase']
  }
};

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
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [expandedCompetitor, setExpandedCompetitor] = useState<string | null>(null);
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

  // Verification data - comprehensive phase status
  const verificationData = {
    phases: [
      { id: 'P0', name: 'Core MVP', weeks: '1-4', complete: 8, partial: 0, planned: 0, completion: 100, status: 'complete' as const },
      { id: 'P1', name: 'Mobile + Remix', weeks: '5-8', complete: 1, partial: 3, planned: 4, completion: 30, status: 'in-progress' as const },
      { id: 'P2', name: 'Advanced Features', weeks: '9-12', complete: 0, partial: 1, planned: 7, completion: 10, status: 'in-progress' as const },
      { id: 'P3', name: 'Segment-Specific', weeks: '13-18', complete: 0, partial: 0, planned: 8, completion: 0, status: 'planned' as const },
      { id: 'P4', name: 'Enterprise', weeks: '19-26', complete: 0, partial: 0, planned: 8, completion: 0, status: 'planned' as const },
      { id: 'P5', name: 'Future + Auth', weeks: '27+', complete: 0, partial: 0, planned: 8, completion: 0, status: 'planned' as const },
    ],
    scenarios: {
      total: 140,
      implemented: 13,
      partial: 7,
      planned: 120,
      categories: [
        { name: 'Universal (All Products)', scenarios: '1-8, 61-65, 111-115, 126-127', status: '72%', implemented: 13 },
        { name: 'Mobile-First', scenarios: '81-85', status: '10%', implemented: 0 },
        { name: 'Remix & Clips', scenarios: '90, 101-110', status: '0%', implemented: 0 },
        { name: 'Offline Mode', scenarios: '82, 89, 99', status: '0%', implemented: 0 },
        { name: 'Compliance & Legal', scenarios: '43-46, 93, 99', status: '0%', implemented: 0 },
        { name: 'Agent & Automation', scenarios: '111-125', status: '30%', implemented: 5 },
        { name: 'API & Data Integration', scenarios: '126-140', status: '0%', implemented: 0 },
      ]
    },
    segmentCoverage: [
      { segment: 'Creator Economy', p0: 100, p1: 30, p2: 10, p3: 0, pending: 25 },
      { segment: 'Traveler/Experience', p0: 100, p1: 30, p2: 0, p3: 0, pending: 8 },
      { segment: 'SMB Marketing', p0: 100, p1: 30, p2: 10, p3: 0, pending: 15 },
      { segment: 'Education', p0: 100, p1: 0, p2: 0, p3: 0, pending: 10 },
      { segment: 'Healthcare', p0: 100, p1: 0, p2: 0, p3: 0, pending: 12 },
      { segment: 'Enterprise', p0: 100, p1: 0, p2: 0, p3: 0, pending: 20 },
    ],
    criticalGaps: [
      { issue: 'Subscription/Payment Infrastructure', impact: 'Revenue Blocking', effort: '2-3 weeks', priority: 'P0' },
      { issue: 'Mobile-First Features', impact: '68% Market Demand', effort: '3-4 weeks', priority: 'P1' },
      { issue: 'Segment-Specific Features', impact: 'Differentiation', effort: '6-8 weeks', priority: 'P3' },
      { issue: 'Agent Implementation', impact: 'Only 3 of 12 Active', effort: '4-6 weeks', priority: 'P2' },
    ],
    pendingScenarios: [
      { id: '81', name: 'One-Tap Mobile Record', segment: 'All', market: '68% want', phase: 'P1' },
      { id: '90', name: 'Quick Clips Generator', segment: 'Creator', market: '82% want', phase: 'P1' },
      { id: '82', name: 'Offline Recording', segment: 'Traveler', market: '54% need', phase: 'P2' },
      { id: '94', name: 'Product Demo Automation', segment: 'SMB', market: '71% want', phase: 'P3' },
      { id: '103', name: 'Lesson Builder', segment: 'Education', market: '69% want', phase: 'P3' },
      { id: '93', name: 'HIPAA Patient Education', segment: 'Healthcare', market: '94% want <$100', phase: 'P3' },
    ]
  };

  const categories = [
    { id: 'overview', label: 'Overview', icon: Globe },
    { id: 'verification', label: 'Verification', icon: CheckCircle },
    { id: 'products', label: 'Product Suite', icon: Package },
    { id: 'scenarios', label: 'Scenarios', icon: Workflow },
    { id: 'architecture', label: 'Architecture', icon: Layers },
    { id: 'technical', label: 'Technical', icon: Server },
    { id: 'functional', label: 'Functional', icon: Users },
    { id: 'market', label: 'Market Analysis', icon: BarChart3 },
    { id: 'investor', label: 'Investor Dashboard', icon: DollarSign },
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
                <CardTitle className="text-2xl">Genie Suite: Complete Production Pipeline</CardTitle>
                <CardDescription>
                  5 Products (Mind + Vibe + Spark + Arc + Hub) • 140 Scenarios • 6 Phases (P0-P5) • 12 Agents • 15 APIs • 6 Segments
                </CardDescription>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleDownloadPNG} className="gap-2">
                <Download className="h-4 w-4" />PNG
              </Button>
              <Button variant="outline" size="sm" onClick={() => setIsFullscreen(true)} className="gap-2">
                <Maximize2 className="h-4 w-4" />Fullscreen
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
              <TabsTrigger 
                key={cat.id} 
                value={cat.id} 
                className="gap-2 data-[state=active]:bg-background data-[state=active]:text-foreground text-muted-foreground"
              >
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

        {/* VERIFICATION TAB - Comprehensive Implementation Status */}
        <TabsContent value="verification" className="space-y-4 mt-4">
          {/* Executive Summary */}
          <Card className="bg-card border-border">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                Phase Implementation Verification Report
              </CardTitle>
              <CardDescription>Real-time status across P0-P5 phases, 140 scenarios, and 6 segments</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div className="text-center p-4 bg-green-500/10 rounded-lg border border-green-500/30">
                  <p className="text-3xl font-bold text-green-500">13</p>
                  <p className="text-sm text-muted-foreground">Implemented</p>
                  <p className="text-xs text-green-600">9.3%</p>
                </div>
                <div className="text-center p-4 bg-yellow-500/10 rounded-lg border border-yellow-500/30">
                  <p className="text-3xl font-bold text-yellow-500">7</p>
                  <p className="text-sm text-muted-foreground">Partial</p>
                  <p className="text-xs text-yellow-600">5%</p>
                </div>
                <div className="text-center p-4 bg-blue-500/10 rounded-lg border border-blue-500/30">
                  <p className="text-3xl font-bold text-blue-500">120</p>
                  <p className="text-sm text-muted-foreground">Planned</p>
                  <p className="text-xs text-blue-600">85.7%</p>
                </div>
                <div className="text-center p-4 bg-primary/10 rounded-lg border border-primary/30">
                  <p className="text-3xl font-bold text-primary">140</p>
                  <p className="text-sm text-muted-foreground">Total Scenarios</p>
                  <p className="text-xs text-primary">6 Phases</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Phase-by-Phase Status */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Phase-by-Phase Verification
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {verificationData.phases.map(phase => (
                  <div key={phase.id} className="p-4 rounded-lg border border-border">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <Badge 
                          variant={phase.status === 'complete' ? 'default' : phase.status === 'in-progress' ? 'secondary' : 'outline'}
                          className={phase.status === 'complete' ? 'bg-green-500' : ''}
                        >
                          {phase.id}
                        </Badge>
                        <span className="font-semibold">{phase.name}</span>
                        <span className="text-sm text-muted-foreground">Weeks {phase.weeks}</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="flex gap-2 text-sm">
                          <span className="text-green-500">✓ {phase.complete}</span>
                          <span className="text-yellow-500">◐ {phase.partial}</span>
                          <span className="text-muted-foreground">○ {phase.planned}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Progress value={phase.completion} className="w-24 h-2" />
                          <span className={cn(
                            "text-sm font-bold min-w-[3rem]",
                            phase.completion === 100 ? "text-green-500" : 
                            phase.completion > 0 ? "text-yellow-500" : "text-muted-foreground"
                          )}>
                            {phase.completion}%
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Scenario Categories Status */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Workflow className="h-5 w-5" />
                Scenario Category Coverage
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Category</TableHead>
                    <TableHead>Scenarios</TableHead>
                    <TableHead>Implemented</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {verificationData.scenarios.categories.map((cat, idx) => (
                    <TableRow key={idx}>
                      <TableCell className="font-medium">{cat.name}</TableCell>
                      <TableCell className="font-mono text-xs">{cat.scenarios}</TableCell>
                      <TableCell>{cat.implemented}</TableCell>
                      <TableCell>
                        <Badge variant={cat.status === '0%' ? 'outline' : cat.status === '100%' ? 'default' : 'secondary'}>
                          {cat.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Segment Coverage Matrix */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Segment Coverage Matrix
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Segment</TableHead>
                    <TableHead className="text-center">P0</TableHead>
                    <TableHead className="text-center">P1</TableHead>
                    <TableHead className="text-center">P2</TableHead>
                    <TableHead className="text-center">P3</TableHead>
                    <TableHead className="text-center">Pending Scenarios</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {verificationData.segmentCoverage.map((seg, idx) => (
                    <TableRow key={idx}>
                      <TableCell className="font-medium">{seg.segment}</TableCell>
                      <TableCell className="text-center">
                        <Badge variant="default" className="bg-green-500">{seg.p0}%</Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant={seg.p1 > 0 ? 'secondary' : 'outline'}>{seg.p1}%</Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant={seg.p2 > 0 ? 'secondary' : 'outline'}>{seg.p2}%</Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="outline">{seg.p3}%</Badge>
                      </TableCell>
                      <TableCell className="text-center text-orange-500 font-semibold">~{seg.pending}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Critical Gaps */}
          <Card className="bg-card border-border border-red-500/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-500">
                <AlertCircle className="h-5 w-5" />
                Critical Gaps & Recommended Priorities
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {verificationData.criticalGaps.map((gap, idx) => (
                  <div key={idx} className="p-4 rounded-lg border border-border bg-muted/20">
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant={gap.priority === 'P0' ? 'destructive' : gap.priority === 'P1' ? 'secondary' : 'outline'}>
                        {gap.priority}
                      </Badge>
                      <span className="text-xs text-muted-foreground">{gap.effort}</span>
                    </div>
                    <h4 className="font-semibold mb-1">{gap.issue}</h4>
                    <p className="text-sm text-orange-500">{gap.impact}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* High-Priority Pending Scenarios */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-yellow-500" />
                High-Priority Pending Scenarios (Market-Driven)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Scenario</TableHead>
                    <TableHead>Segment</TableHead>
                    <TableHead>Market Driver</TableHead>
                    <TableHead>Phase</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {verificationData.pendingScenarios.map(scenario => (
                    <TableRow key={scenario.id}>
                      <TableCell className="font-mono">#{scenario.id}</TableCell>
                      <TableCell className="font-medium">{scenario.name}</TableCell>
                      <TableCell><Badge variant="outline">{scenario.segment}</Badge></TableCell>
                      <TableCell className="text-green-500 text-sm">{scenario.market}</TableCell>
                      <TableCell><Badge variant="secondary">{scenario.phase}</Badge></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* SaaS & Multi-Tenant Readiness */}
          <Card className="bg-card border-border border-purple-500/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-purple-500">
                <Building className="h-5 w-5" />
                SaaS & Multi-Tenant Readiness Assessment
              </CardTitle>
              <CardDescription>Commercial platform support across subscription tiers and workspace isolation</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Overall Status */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-green-500/10 rounded-lg border border-green-500/30">
                  <CheckCircle className="h-6 w-6 text-green-500 mx-auto mb-2" />
                  <p className="text-lg font-bold text-green-500">Implemented</p>
                  <p className="text-xs text-muted-foreground">Multi-Tenant Context</p>
                </div>
                <div className="text-center p-4 bg-green-500/10 rounded-lg border border-green-500/30">
                  <CheckCircle className="h-6 w-6 text-green-500 mx-auto mb-2" />
                  <p className="text-lg font-bold text-green-500">Implemented</p>
                  <p className="text-xs text-muted-foreground">Facility Switching</p>
                </div>
                <div className="text-center p-4 bg-yellow-500/10 rounded-lg border border-yellow-500/30">
                  <Clock className="h-6 w-6 text-yellow-500 mx-auto mb-2" />
                  <p className="text-lg font-bold text-yellow-500">Documented</p>
                  <p className="text-xs text-muted-foreground">Subscription Tiers</p>
                </div>
                <div className="text-center p-4 bg-blue-500/10 rounded-lg border border-blue-500/30">
                  <Target className="h-6 w-6 text-blue-500 mx-auto mb-2" />
                  <p className="text-lg font-bold text-blue-500">Phase 5</p>
                  <p className="text-xs text-muted-foreground">Stripe Integration</p>
                </div>
              </div>

              {/* SaaS Feature Matrix */}
              <div>
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  SaaS Feature Implementation Status
                </h4>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Feature</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Phase</TableHead>
                      <TableHead>Segments Supported</TableHead>
                      <TableHead>Notes</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell className="font-medium">TenantContext Provider</TableCell>
                      <TableCell><Badge className="bg-green-500">✓ Implemented</Badge></TableCell>
                      <TableCell>P0</TableCell>
                      <TableCell>All</TableCell>
                      <TableCell className="text-xs text-muted-foreground">src/contexts/TenantContext.tsx</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Facility Switching</TableCell>
                      <TableCell><Badge className="bg-green-500">✓ Implemented</Badge></TableCell>
                      <TableCell>P0</TableCell>
                      <TableCell>Healthcare, Enterprise</TableCell>
                      <TableCell className="text-xs text-muted-foreground">Cross-tenant navigation</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">SuperAdmin Global Access</TableCell>
                      <TableCell><Badge className="bg-green-500">✓ Implemented</Badge></TableCell>
                      <TableCell>P0</TableCell>
                      <TableCell>Enterprise</TableCell>
                      <TableCell className="text-xs text-muted-foreground">isSuperAdmin check</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">User-Scoped RLS</TableCell>
                      <TableCell><Badge className="bg-green-500">✓ Implemented</Badge></TableCell>
                      <TableCell>P0</TableCell>
                      <TableCell>All</TableCell>
                      <TableCell className="text-xs text-muted-foreground">auth.uid() = user_id</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Subscription Tiers (5)</TableCell>
                      <TableCell><Badge variant="secondary">📋 Documented</Badge></TableCell>
                      <TableCell>P5</TableCell>
                      <TableCell>All</TableCell>
                      <TableCell className="text-xs text-muted-foreground">Free/Starter/Business/Pro/Enterprise</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Module-Based Access</TableCell>
                      <TableCell><Badge variant="secondary">📋 Documented</Badge></TableCell>
                      <TableCell>P5</TableCell>
                      <TableCell>All</TableCell>
                      <TableCell className="text-xs text-muted-foreground">modules_enabled array</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Stripe Integration</TableCell>
                      <TableCell><Badge variant="outline">⏳ Planned</Badge></TableCell>
                      <TableCell>P5</TableCell>
                      <TableCell>All</TableCell>
                      <TableCell className="text-xs text-muted-foreground">stripe_customer_id</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Usage Tracking</TableCell>
                      <TableCell><Badge variant="outline">⏳ Planned</Badge></TableCell>
                      <TableCell>P5</TableCell>
                      <TableCell>All</TableCell>
                      <TableCell className="text-xs text-muted-foreground">subscription_usage table</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">White-Label Config</TableCell>
                      <TableCell><Badge variant="outline">⏳ Planned</Badge></TableCell>
                      <TableCell>P4</TableCell>
                      <TableCell>Enterprise</TableCell>
                      <TableCell className="text-xs text-muted-foreground">Branding customization</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Workspace Isolation</TableCell>
                      <TableCell><Badge variant="outline">⏳ Planned</Badge></TableCell>
                      <TableCell>P4</TableCell>
                      <TableCell>Enterprise</TableCell>
                      <TableCell className="text-xs text-muted-foreground">workspace_id columns</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">SSO/SAML</TableCell>
                      <TableCell><Badge variant="outline">⏳ Planned</Badge></TableCell>
                      <TableCell>P5</TableCell>
                      <TableCell>Enterprise</TableCell>
                      <TableCell className="text-xs text-muted-foreground">Enterprise auth</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">HIPAA Compliance Mode</TableCell>
                      <TableCell><Badge variant="outline">⏳ Planned</Badge></TableCell>
                      <TableCell>P3</TableCell>
                      <TableCell>Healthcare</TableCell>
                      <TableCell className="text-xs text-muted-foreground">94% market demand</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>

              {/* Subscription Tier Overview */}
              <div>
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <Briefcase className="h-4 w-4" />
                  Planned Subscription Tiers
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                  {[
                    { name: 'Free', price: '$0', color: 'bg-muted', users: 'Trial', features: '3 videos, watermark' },
                    { name: 'Starter', price: '$9.99', color: 'bg-blue-500/20', users: 'Creator/Traveler', features: 'Unlimited, 10 TTS' },
                    { name: 'Business', price: '$29.99', color: 'bg-green-500/20', users: 'SMB', features: '3 seats, demos' },
                    { name: 'Pro', price: '$79.99', color: 'bg-purple-500/20', users: 'Education/Agency', features: '10 seats, lessons' },
                    { name: 'Enterprise', price: 'Custom', color: 'bg-orange-500/20', users: 'Healthcare/Large', features: 'HIPAA, white-label' },
                    { name: 'Beta', price: '$0', color: 'bg-yellow-500/20', users: 'Current Dev', features: 'Full access' },
                  ].map(tier => (
                    <div key={tier.name} className={`p-3 rounded-lg border ${tier.color}`}>
                      <p className="font-semibold">{tier.name}</p>
                      <p className="text-lg font-bold">{tier.price}</p>
                      <p className="text-xs text-muted-foreground">{tier.users}</p>
                      <p className="text-xs mt-1">{tier.features}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Implementation Roadmap */}
              <div className="p-4 bg-muted/30 rounded-lg border border-border">
                <h4 className="font-semibold mb-3">SaaS Implementation Roadmap</h4>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Badge className="bg-green-500">Phase 1 ✓</Badge>
                    <p className="text-sm font-medium">Core Infrastructure</p>
                    <ul className="text-xs space-y-1 text-muted-foreground">
                      <li>✓ TenantContext Provider</li>
                      <li>✓ Facility switching</li>
                      <li>✓ SuperAdmin access</li>
                      <li>✓ User-scoped RLS</li>
                    </ul>
                  </div>
                  <div className="space-y-2">
                    <Badge variant="secondary">Phase 2</Badge>
                    <p className="text-sm font-medium">Access Control</p>
                    <ul className="text-xs space-y-1 text-muted-foreground">
                      <li>○ useSubscription hook</li>
                      <li>○ useModuleAccess hook</li>
                      <li>○ Upgrade prompts</li>
                      <li>○ Beta user migration</li>
                    </ul>
                  </div>
                  <div className="space-y-2">
                    <Badge variant="outline">Phase 3</Badge>
                    <p className="text-sm font-medium">Landing & Auth</p>
                    <ul className="text-xs space-y-1 text-muted-foreground">
                      <li>○ Public landing page</li>
                      <li>○ Pricing page</li>
                      <li>○ Stripe integration</li>
                      <li>○ Plan selection</li>
                    </ul>
                  </div>
                  <div className="space-y-2">
                    <Badge variant="outline">Phase 4</Badge>
                    <p className="text-sm font-medium">Management</p>
                    <ul className="text-xs space-y-1 text-muted-foreground">
                      <li>○ Admin dashboard</li>
                      <li>○ Self-service plans</li>
                      <li>○ Usage analytics</li>
                      <li>○ Billing portal</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Segment-Tier Mapping */}
              <div>
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Segment → Tier Mapping (Recommended)
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {[
                    { segment: 'Creator Economy', tier: 'Starter', price: '$9.99', advantage: 'Script + TTS integrated' },
                    { segment: 'Traveler/Experience', tier: 'Starter', price: '$9.99', advantage: 'AI narration + offline' },
                    { segment: 'SMB Marketing', tier: 'Business', price: '$29.99', advantage: '50% cheaper than Synthesia' },
                    { segment: 'Education', tier: 'Pro', price: '$79.99', advantage: 'AI lesson scripts' },
                    { segment: 'Healthcare', tier: 'Enterprise', price: 'Custom', advantage: '90% cost savings vs VIDIZMO' },
                    { segment: 'Enterprise', tier: 'Enterprise', price: 'Custom', advantage: 'Approval workflows' },
                  ].map(mapping => (
                    <div key={mapping.segment} className="p-3 rounded-lg border border-border bg-muted/20">
                      <p className="font-medium text-sm">{mapping.segment}</p>
                      <div className="flex items-center justify-between mt-1">
                        <Badge variant="secondary">{mapping.tier}</Badge>
                        <span className="text-sm font-mono">{mapping.price}</span>
                      </div>
                      <p className="text-xs text-green-500 mt-1">{mapping.advantage}</p>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* PRODUCT SUITE TAB */}
        <TabsContent value="products" className="space-y-4 mt-4">
          {/* Stats Bar */}
          <Card className="bg-card border-border">
            <CardContent className="py-4">
              <div className="flex flex-wrap justify-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="font-semibold text-green-600">13 Implemented</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-yellow-500" />
                  <span className="font-semibold text-yellow-600">7 Partial</span>
                </div>
                <div className="flex items-center gap-2">
                  <Target className="h-4 w-4 text-blue-500" />
                  <span className="font-semibold text-blue-600">120 Planned</span>
                </div>
                <span className="text-muted-foreground">|</span>
                <span className="text-orange-500">🤖 12 Agents</span>
                <span className="text-cyan-500">🔌 15 APIs</span>
                <span className="text-muted-foreground">|</span>
                <span className="text-orange-400">68% Mobile</span>
                <span className="text-blue-400">54% Offline</span>
                <span className="text-pink-400">82% Clips</span>
                <span className="text-green-400">94% HIPAA</span>
              </div>
            </CardContent>
          </Card>

          {/* Product Suite Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {productSuite.map(product => (
              <Card key={product.id} className="bg-card border-border overflow-hidden">
                <div 
                  className="h-2" 
                  style={{ backgroundColor: product.color }}
                />
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <span className="text-2xl">{product.icon}</span>
                    <Badge 
                      variant={product.status === 'completed' ? 'default' : product.status === 'partial' ? 'secondary' : 'outline'}
                    >
                      {product.phase}
                    </Badge>
                  </div>
                  <CardTitle className="text-lg">{product.name}</CardTitle>
                  <CardDescription>{product.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground mb-1">Features</p>
                    <div className="flex flex-wrap gap-1">
                      {product.features.slice(0, 3).map(f => (
                        <Badge key={f} variant="outline" className="text-xs">{f}</Badge>
                      ))}
                      {product.features.length > 3 && (
                        <Badge variant="outline" className="text-xs">+{product.features.length - 3}</Badge>
                      )}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground mb-1">Agents ({product.agents.length})</p>
                    <div className="flex flex-wrap gap-1">
                      {product.agents.slice(0, 2).map(a => (
                        <Badge key={a} variant="secondary" className="text-xs font-mono">{a.split('_')[0]}</Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground mb-1">APIs ({product.apis.length})</p>
                    <div className="flex flex-wrap gap-1">
                      {product.apis.slice(0, 2).map(api => (
                        <Badge key={api} variant="outline" className="text-xs">{api}</Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* SCENARIOS TAB */}
        <TabsContent value="scenarios" className="space-y-4 mt-4">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Workflow className="h-5 w-5" />
                Cross-Functional Scenarios Matrix
              </CardTitle>
              <CardDescription>
                140+ scenarios mapped to products, agents, and APIs
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(crossFunctionalScenarios).map(([key, scenario]) => (
                  <div key={key} className="p-4 rounded-lg border border-border bg-muted/20">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold">{scenario.name}</h4>
                      {scenario.marketData && (
                        <Badge variant="outline" className="text-xs text-green-600">
                          {scenario.marketData}
                        </Badge>
                      )}
                    </div>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground w-20">Scenarios:</span>
                        <Badge variant="secondary">{scenario.scenarios.length} total</Badge>
                      </div>
                      
                      <div className="flex items-start gap-2">
                        <span className="text-muted-foreground w-20">Products:</span>
                        <div className="flex flex-wrap gap-1">
                          {scenario.products.map(p => (
                            <Badge key={p} variant="outline" className="text-xs">{p}</Badge>
                          ))}
                        </div>
                      </div>
                      
                      {scenario.segments && (
                        <div className="flex items-start gap-2">
                          <span className="text-muted-foreground w-20">Segments:</span>
                          <div className="flex flex-wrap gap-1">
                            {scenario.segments.slice(0, 3).map(s => (
                              <Badge key={s} variant="secondary" className="text-xs">{s}</Badge>
                            ))}
                            {scenario.segments.length > 3 && (
                              <Badge variant="secondary" className="text-xs">+{scenario.segments.length - 3}</Badge>
                            )}
                          </div>
                        </div>
                      )}
                      
                      <div className="flex items-start gap-2">
                        <span className="text-muted-foreground w-20">Agents:</span>
                        <div className="flex flex-wrap gap-1">
                          {scenario.agents.slice(0, 2).map(a => (
                            <Badge key={a} variant="outline" className="text-xs font-mono">
                              <Bot className="h-3 w-3 mr-1" />
                              {a.split('_')[0]}
                            </Badge>
                          ))}
                          {scenario.agents.length > 2 && (
                            <Badge variant="outline" className="text-xs">+{scenario.agents.length - 2}</Badge>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-2">
                        <span className="text-muted-foreground w-20">APIs:</span>
                        <div className="flex flex-wrap gap-1">
                          {scenario.apis.slice(0, 2).map(api => (
                            <Badge key={api} variant="outline" className="text-xs">
                              <Code className="h-3 w-3 mr-1" />
                              {api}
                            </Badge>
                          ))}
                          {scenario.apis.length > 2 && (
                            <Badge variant="outline" className="text-xs">+{scenario.apis.length - 2}</Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
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

          {/* Platform Compatibility Matrix */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Cpu className="h-5 w-5" />
                Platform Compatibility Matrix
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Feature/App</TableHead>
                    <TableHead className="text-center">iOS</TableHead>
                    <TableHead className="text-center">Android</TableHead>
                    <TableHead className="text-center">Web</TableHead>
                    <TableHead className="text-center">Desktop</TableHead>
                    <TableHead className="text-center">API</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredApps.slice(0, 8).map(app => (
                    <TableRow key={app.name}>
                      <TableCell className="font-medium">{app.name}</TableCell>
                      {(['iOS', 'Android', 'Web', 'Desktop', 'API'] as const).map(platform => (
                        <TableCell key={platform} className="text-center">
                          {app.platforms.includes(platform) 
                            ? <Check className="h-4 w-4 text-green-500 mx-auto" />
                            : <span className="h-4 w-4 text-muted-foreground mx-auto">—</span>
                          }
                        </TableCell>
                      ))}
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
                  <ScrollArea className="h-[600px]">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Competitor</TableHead>
                          <TableHead>Users</TableHead>
                          <TableHead>Revenue</TableHead>
                          <TableHead>Years</TableHead>
                          <TableHead>Pricing</TableHead>
                          <TableHead>Threat</TableHead>
                          <TableHead></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredCompetitors.map((comp, idx) => (
                          <React.Fragment key={`${comp.name}-${idx}`}>
                            <TableRow 
                              className="cursor-pointer hover:bg-muted/50"
                              onClick={() => setExpandedCompetitor(
                                expandedCompetitor === comp.name ? null : comp.name
                              )}
                            >
                              <TableCell>
                                <div>
                                  <p className="font-semibold">{comp.name}</p>
                                  <p className="text-xs text-muted-foreground">{comp.segment}</p>
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline" className="text-xs">{comp.userBase}</Badge>
                              </TableCell>
                              <TableCell className="font-mono text-xs text-green-600">{comp.revenue}</TableCell>
                              <TableCell className="text-center">{comp.yearsInMarket}y</TableCell>
                              <TableCell className="font-mono text-xs">{comp.pricing}</TableCell>
                              <TableCell>
                                <Badge variant={comp.threat === 'High' ? 'destructive' : comp.threat === 'Medium' ? 'secondary' : 'outline'}>
                                  {comp.threat}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                {expandedCompetitor === comp.name 
                                  ? <ChevronUp className="h-4 w-4" />
                                  : <ChevronDown className="h-4 w-4" />
                                }
                              </TableCell>
                            </TableRow>
                            {expandedCompetitor === comp.name && (
                              <TableRow>
                                <TableCell colSpan={7} className="bg-muted/30">
                                  <div className="p-4 space-y-4">
                                    {/* Market Intelligence Row */}
                                    <div className="grid grid-cols-4 gap-4 p-3 bg-background rounded-lg border border-border">
                                      <div className="text-center">
                                        <p className="text-xs text-muted-foreground">Founded</p>
                                        <p className="font-semibold">{comp.founded}</p>
                                      </div>
                                      <div className="text-center">
                                        <p className="text-xs text-muted-foreground">Languages</p>
                                        <p className="font-semibold">{comp.languages}</p>
                                      </div>
                                      <div className="text-center">
                                        <p className="text-xs text-muted-foreground">Model</p>
                                        <p className="font-semibold text-xs">{comp.subscriptionModel}</p>
                                      </div>
                                      <div className="text-center">
                                        <p className="text-xs text-muted-foreground">Type</p>
                                        <Badge variant="outline">{comp.type}</Badge>
                                      </div>
                                    </div>
                                    
                                    {/* Strengths & Weaknesses */}
                                    <div className="grid grid-cols-2 gap-4">
                                      <div>
                                        <h4 className="font-medium text-green-500 mb-2 flex items-center gap-2">
                                          <Check className="h-4 w-4" />
                                          Strengths
                                        </h4>
                                        <ul className="space-y-1 text-sm">
                                          {comp.strengths.map((s, i) => (
                                            <li key={i}>• {s}</li>
                                          ))}
                                        </ul>
                                      </div>
                                      <div>
                                        <h4 className="font-medium text-red-500 mb-2 flex items-center gap-2">
                                          <X className="h-4 w-4" />
                                          Weaknesses
                                        </h4>
                                        <ul className="space-y-1 text-sm text-muted-foreground">
                                          {comp.weaknesses.map((w, i) => (
                                            <li key={i}>• {w}</li>
                                          ))}
                                        </ul>
                                      </div>
                                    </div>
                                    
                                    {/* Genie Differentiation */}
                                    <div className="p-3 bg-primary/10 rounded-lg border border-primary/30">
                                      <h4 className="font-medium text-primary mb-2 flex items-center gap-2">
                                        <Zap className="h-4 w-4" />
                                        Genie Differentiator
                                      </h4>
                                      <p className="text-sm">{comp.genieDifferentiator}</p>
                                    </div>
                                    
                                    {/* Improvement Needed */}
                                    <div className="p-3 bg-yellow-500/10 rounded-lg border border-yellow-500/30">
                                      <h4 className="font-medium text-yellow-600 mb-2 flex items-center gap-2">
                                        <Target className="h-4 w-4" />
                                        Improvement Recommended
                                      </h4>
                                      <p className="text-sm text-muted-foreground">{comp.improvementNeeded}</p>
                                    </div>
                                  </div>
                                </TableCell>
                              </TableRow>
                            )}
                          </React.Fragment>
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

        {/* INVESTOR DASHBOARD TAB */}
        <TabsContent value="investor" className="space-y-4 mt-4">
          <GenieInvestorDashboard />
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
                    <div className="flex flex-wrap gap-1 mt-3">
                      <span className="text-xs text-muted-foreground mr-2">Segments:</span>
                      {phase.segments.map(seg => (
                        <Badge key={seg} variant="secondary" className="text-xs">{seg}</Badge>
                      ))}
                      <span className="text-xs text-muted-foreground mx-2">|</span>
                      <span className="text-xs text-muted-foreground mr-2">Integrations:</span>
                      {phase.integrations.map(int => (
                        <Badge key={int} variant="outline" className="text-xs">{int}</Badge>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Fullscreen Modal */}
      <AnimatePresence>
        {isFullscreen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm"
          >
            <div className="absolute top-4 right-4 z-10 flex gap-2">
              <Button variant="outline" size="sm" onClick={handleDownloadPNG} className="gap-2">
                <Download className="h-4 w-4" />
                PNG
              </Button>
              <Button variant="outline" size="sm" onClick={() => setIsFullscreen(false)} className="gap-2">
                <X className="h-4 w-4" />
                Close
              </Button>
            </div>
            <ScrollArea className="h-screen w-screen p-8">
              <div className="max-w-7xl mx-auto">
                {/* Segment Selector in Fullscreen */}
                <div className="mb-6">
                  <SegmentSelector selected={selectedSegment} onSelect={setSelectedSegment} />
                </div>
                
                {/* Stats Overview */}
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-6">
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
                    <p className="text-3xl font-bold text-purple-500">{productSuite.length}</p>
                    <p className="text-sm text-muted-foreground">Products</p>
                  </Card>
                  <Card className="bg-card border-border p-4 text-center">
                    <p className="text-3xl font-bold text-orange-500">{filteredAgents.length}</p>
                    <p className="text-sm text-muted-foreground">AI Agents</p>
                  </Card>
                  <Card className="bg-card border-border p-4 text-center">
                    <p className="text-3xl font-bold text-cyan-500">{roadmapPhases.length}</p>
                    <p className="text-sm text-muted-foreground">Phases (P0-P5)</p>
                  </Card>
                </div>

                {/* Product Suite Grid in Fullscreen */}
                <Card className="bg-card border-border mb-6">
                  <CardHeader>
                    <CardTitle>Product Suite Overview</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                      {productSuite.map(product => (
                        <div key={product.id} className="p-4 rounded-lg border" style={{ borderColor: product.color }}>
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-2xl">{product.icon}</span>
                            <span className="font-semibold">{product.name}</span>
                          </div>
                          <Badge variant={product.status === 'completed' ? 'default' : product.status === 'partial' ? 'secondary' : 'outline'}>
                            {product.phase} - {product.status}
                          </Badge>
                          <ul className="text-sm mt-2 space-y-1">
                            {product.features.slice(0, 4).map((f, i) => (
                              <li key={i} className="text-muted-foreground">
                                {product.status === 'completed' ? '✓' : product.status === 'partial' ? '◐' : '○'} {f}
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Phase Progress in Fullscreen */}
                <Card className="bg-card border-border">
                  <CardHeader>
                    <CardTitle>Implementation Phases</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {roadmapPhases.map(phase => {
                        const stats = phase.features.reduce((acc, f) => {
                          if (f.status === 'done') acc.done++;
                          else if (f.status === 'partial') acc.partial++;
                          else acc.planned++;
                          return acc;
                        }, { done: 0, partial: 0, planned: 0 });
                        
                        return (
                          <div key={phase.id} className="flex items-center gap-4 p-4 rounded-lg border border-border">
                            <Badge variant={phase.status === 'completed' ? 'default' : phase.status === 'in-progress' ? 'secondary' : 'outline'} className="text-lg px-3 py-1">
                              {phase.id}
                            </Badge>
                            <div className="flex-1">
                              <p className="font-medium">{phase.name}</p>
                              <p className="text-sm text-muted-foreground">Weeks {phase.weeks}</p>
                            </div>
                            <div className="flex gap-2">
                              <Badge className="bg-green-500/20 text-green-500">{stats.done} Done</Badge>
                              <Badge className="bg-yellow-500/20 text-yellow-500">{stats.partial} Partial</Badge>
                              <Badge className="bg-blue-500/20 text-blue-500">{stats.planned} Planned</Badge>
                            </div>
                            <div className="w-32">
                              <Progress value={phase.completion} className="h-2" />
                            </div>
                            <span className="text-sm font-medium">{phase.statusText}</span>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </ScrollArea>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default GenieStudioUnifiedHub;
