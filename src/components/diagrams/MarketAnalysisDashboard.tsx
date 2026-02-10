/**
 * Market Analysis Dashboard
 * Comprehensive view of competitive landscape, opportunities, and integration possibilities
 * Enhanced with detailed competitor intelligence and market differentiators
 */

import React, { useState } from 'react';
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
  Minus,
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
  Shield,
  Award,
  DollarSign,
  BarChart3,
  PieChart,
  Activity,
  Sparkles,
  Crown,
  Rocket,
  Scale,
  Timer,
  Brain,
  Mic,
  Video,
  FileText,
  Languages,
  Lock,
  Cloud,
  Gauge
} from 'lucide-react';
import { cn } from '@/lib/utils';
import html2canvas from 'html2canvas';

// Types
interface Segment {
  id: string;
  name: string;
  icon: React.ElementType;
  marketSize: string;
  growthRate: string;
  competitionLevel: 'Low' | 'Medium' | 'High' | 'Very High';
  entryBarrier: 'Low' | 'Medium' | 'High' | 'Very High';
  genieFit: number;
  priority: 'P0' | 'P1' | 'P2';
  color: string;
  tam: string;
  sam: string;
  som: string;
  keyDrivers: string[];
}

interface Competitor {
  name: string;
  segment: string;
  type: 'Direct' | 'Feature' | 'Platform';
  strengths: string[];
  weaknesses: string[];
  pricing: string;
  threat: 'Low' | 'Medium' | 'High';
  marketShare?: string;
  funding?: string;
  employees?: string;
  aiCapabilities: ('TTS' | 'STT' | 'LLM' | 'Vision' | 'Voice Clone' | 'Auto Edit' | 'Multi-Model')[];
  userBase?: string;
  yearFounded?: number;
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

interface Differentiator {
  id: string;
  category: string;
  icon: React.ElementType;
  title: string;
  description: string;
  genieAdvantage: string;
  competitorGap: string;
  impactScore: number;
  features: string[];
}

interface MarketMetrics {
  totalTAM: string;
  totalSAM: string;
  totalSOM: string;
  cagr: string;
  aiPenetration: string;
  mobileFirst: string;
}

// Enhanced Data
const MARKET_METRICS: MarketMetrics = {
  totalTAM: '$180B',
  totalSAM: '$45B',
  totalSOM: '$2.5B',
  cagr: '24.5%',
  aiPenetration: '35%',
  mobileFirst: '68%'
};

const SEGMENTS: Segment[] = [
  {
    id: 'creator',
    name: 'Creator Economy',
    icon: Users,
    marketSize: '$50B+',
    growthRate: '20%',
    competitionLevel: 'Very High',
    entryBarrier: 'Medium',
    genieFit: 5,
    priority: 'P0',
    color: 'from-purple-500 to-pink-500',
    tam: '$50B',
    sam: '$15B',
    som: '$750M',
    keyDrivers: ['YouTube Shorts growth', 'TikTok monetization', 'Podcast boom', 'AI content tools demand']
  },
  {
    id: 'traveler',
    name: 'Traveler/Experience',
    icon: Plane,
    marketSize: '$8B+',
    growthRate: '15%',
    competitionLevel: 'Medium',
    entryBarrier: 'Low',
    genieFit: 4,
    priority: 'P1',
    color: 'from-blue-500 to-cyan-500',
    tam: '$8B',
    sam: '$2B',
    som: '$100M',
    keyDrivers: ['Travel content sharing', 'Memory preservation', 'Social storytelling', 'GoPro/DJI ecosystem']
  },
  {
    id: 'smb',
    name: 'SMB',
    icon: Briefcase,
    marketSize: '$15B+',
    growthRate: '25%',
    competitionLevel: 'High',
    entryBarrier: 'Medium',
    genieFit: 5,
    priority: 'P0',
    color: 'from-green-500 to-emerald-500',
    tam: '$15B',
    sam: '$5B',
    som: '$400M',
    keyDrivers: ['Video marketing adoption', 'Sales enablement', 'Training cost reduction', 'Remote work']
  },
  {
    id: 'education',
    name: 'Education',
    icon: GraduationCap,
    marketSize: '$12B+',
    growthRate: '18%',
    competitionLevel: 'Medium',
    entryBarrier: 'High',
    genieFit: 4,
    priority: 'P1',
    color: 'from-amber-500 to-orange-500',
    tam: '$12B',
    sam: '$4B',
    som: '$200M',
    keyDrivers: ['LMS video integration', 'Flipped classroom', 'Microlearning', 'SCORM compliance']
  },
  {
    id: 'healthcare',
    name: 'Healthcare',
    icon: Heart,
    marketSize: '$25B+',
    growthRate: '22%',
    competitionLevel: 'Low',
    entryBarrier: 'Very High',
    genieFit: 5,
    priority: 'P0',
    color: 'from-red-500 to-rose-500',
    tam: '$25B',
    sam: '$8B',
    som: '$600M',
    keyDrivers: ['Patient education mandate', 'Telehealth growth', 'Health literacy gap', 'HIPAA-compliant tools shortage']
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    icon: Building,
    marketSize: '$40B+',
    growthRate: '15%',
    competitionLevel: 'High',
    entryBarrier: 'High',
    genieFit: 4,
    priority: 'P1',
    color: 'from-indigo-500 to-violet-500',
    tam: '$40B',
    sam: '$12B',
    som: '$450M',
    keyDrivers: ['Internal communications', 'Compliance training', 'Global workforce', 'Accessibility mandates']
  }
];

const COMPETITORS: Competitor[] = [
  // Creator - Enhanced with more details
  { 
    name: 'Descript', 
    segment: 'creator', 
    type: 'Direct', 
    strengths: ['Transcription-first editing', 'Overdub voice cloning', 'Strong brand recognition', 'Storyboard feature'], 
    weaknesses: ['Expensive at scale', 'Complex for beginners', 'No mobile app', 'Limited AI agents'], 
    pricing: '$12-24/mo', 
    threat: 'High',
    marketShare: '8%',
    funding: '$100M',
    employees: '200-500',
    aiCapabilities: ['TTS', 'STT', 'Voice Clone'],
    userBase: '3M+',
    yearFounded: 2017
  },
  { 
    name: 'Riverside.fm', 
    segment: 'creator', 
    type: 'Direct', 
    strengths: ['Studio-quality remote recording', 'Local recording backup', 'Magic Clips AI'], 
    weaknesses: ['Limited post-production', 'No comprehensive editing', 'Recording-focused only'], 
    pricing: '$15-24/mo', 
    threat: 'Medium',
    marketShare: '3%',
    funding: '$47M',
    employees: '100-200',
    aiCapabilities: ['STT', 'Auto Edit'],
    userBase: '500K+',
    yearFounded: 2019
  },
  { 
    name: 'Kapwing', 
    segment: 'creator', 
    type: 'Direct', 
    strengths: ['Easy-to-use', 'Collaborative editing', 'Browser-based'], 
    weaknesses: ['Basic AI features', 'Watermarks on free tier', 'Limited pro tools'], 
    pricing: '$16-24/mo', 
    threat: 'Medium',
    marketShare: '2%',
    funding: '$68M',
    employees: '50-100',
    aiCapabilities: ['STT', 'LLM'],
    userBase: '1M+',
    yearFounded: 2017
  },
  { 
    name: 'CapCut', 
    segment: 'creator', 
    type: 'Direct', 
    strengths: ['Free tier', 'TikTok integration', 'Mobile-first', 'Massive user base'], 
    weaknesses: ['Limited professional features', 'ByteDance concerns', 'Template-focused'], 
    pricing: 'Free/$8/mo', 
    threat: 'High',
    marketShare: '25%',
    funding: 'ByteDance subsidiary',
    employees: '500+',
    aiCapabilities: ['TTS', 'STT', 'Auto Edit'],
    userBase: '200M+',
    yearFounded: 2020
  },
  { 
    name: 'ElevenLabs', 
    segment: 'creator', 
    type: 'Feature', 
    strengths: ['Best-in-class voice cloning', 'Natural TTS', 'Voice library'], 
    weaknesses: ['No editing workflow', 'API-first complexity', 'Expensive at scale'], 
    pricing: '$5-99/mo', 
    threat: 'Low',
    marketShare: '5%',
    funding: '$101M',
    employees: '100-200',
    aiCapabilities: ['TTS', 'Voice Clone', 'Multi-Model'],
    userBase: '1M+',
    yearFounded: 2022
  },
  { 
    name: 'Opus Clip', 
    segment: 'creator', 
    type: 'Feature', 
    strengths: ['AI clip generation', 'Virality scoring', 'Multi-platform formatting'], 
    weaknesses: ['No production suite', 'Clip-only workflow', 'Limited customization'], 
    pricing: '$15-39/mo', 
    threat: 'Medium',
    marketShare: '2%',
    funding: '$20M',
    employees: '50-100',
    aiCapabilities: ['LLM', 'Auto Edit', 'Vision'],
    userBase: '500K+',
    yearFounded: 2022
  },
  { 
    name: 'HeyGen', 
    segment: 'creator', 
    type: 'Direct', 
    strengths: ['AI avatars', 'Video translation', 'Enterprise features'], 
    weaknesses: ['Uncanny valley', 'Expensive', 'Limited editing'], 
    pricing: '$24-72/mo', 
    threat: 'High',
    marketShare: '4%',
    funding: '$60M',
    employees: '100-200',
    aiCapabilities: ['TTS', 'LLM', 'Vision', 'Voice Clone'],
    userBase: '500K+',
    yearFounded: 2020
  },
  // SMB
  { 
    name: 'Loom', 
    segment: 'smb', 
    type: 'Direct', 
    strengths: ['Screen recording excellence', 'Quick sharing', 'Team analytics'], 
    weaknesses: ['Limited editing', 'Recording-focused only', 'No AI production'], 
    pricing: '$12.50/mo', 
    threat: 'High',
    marketShare: '15%',
    funding: '$203M',
    employees: '300-500',
    aiCapabilities: ['STT', 'LLM'],
    userBase: '25M+',
    yearFounded: 2015
  },
  { 
    name: 'Synthesia', 
    segment: 'smb', 
    type: 'Direct', 
    strengths: ['AI avatars', 'Enterprise trust', '140+ languages'], 
    weaknesses: ['Expensive', 'No audio/voice work', 'Template constraints'], 
    pricing: '$22-67/mo', 
    threat: 'High',
    marketShare: '10%',
    funding: '$156M',
    employees: '200-400',
    aiCapabilities: ['TTS', 'LLM', 'Vision'],
    userBase: '55K+ companies',
    yearFounded: 2017
  },
  { 
    name: 'Pictory', 
    segment: 'smb', 
    type: 'Direct', 
    strengths: ['Blog-to-video', 'Script generation', 'Stock integration'], 
    weaknesses: ['Template-bound', 'Limited customization', 'Basic editing'], 
    pricing: '$19-39/mo', 
    threat: 'Medium',
    marketShare: '3%',
    funding: '$10M',
    employees: '50-100',
    aiCapabilities: ['TTS', 'LLM', 'Auto Edit'],
    userBase: '200K+',
    yearFounded: 2019
  },
  { 
    name: 'InVideo', 
    segment: 'smb', 
    type: 'Direct', 
    strengths: ['Templates library', 'Stock library', 'Easy workflow'], 
    weaknesses: ['Quality ceiling', 'Limited AI', 'Basic features'], 
    pricing: '$15-30/mo', 
    threat: 'Medium',
    marketShare: '4%',
    funding: '$52M',
    employees: '200-400',
    aiCapabilities: ['TTS', 'LLM'],
    userBase: '7M+',
    yearFounded: 2017
  },
  // Education
  { 
    name: 'Loom Education', 
    segment: 'education', 
    type: 'Direct', 
    strengths: ['Free for educators', 'Simple interface', 'LMS integrations'], 
    weaknesses: ['No production tools', 'Basic features only', 'Limited AI'], 
    pricing: 'Free', 
    threat: 'Low',
    marketShare: '8%',
    aiCapabilities: ['STT'],
    userBase: '5M+ educators'
  },
  { 
    name: 'Panopto', 
    segment: 'education', 
    type: 'Platform', 
    strengths: ['Deep LMS integration', 'Video CMS', 'Enterprise features'], 
    weaknesses: ['Enterprise pricing', 'Complex setup', 'No AI creation'], 
    pricing: 'Custom', 
    threat: 'High',
    marketShare: '12%',
    funding: '$45M',
    employees: '200-400',
    aiCapabilities: ['STT'],
    userBase: '1000+ universities'
  },
  { 
    name: 'Edpuzzle', 
    segment: 'education', 
    type: 'Feature', 
    strengths: ['Interactive videos', 'Student tracking', 'Free tier'], 
    weaknesses: ['Limited creation', 'No production', 'Assessment-focused'], 
    pricing: 'Free/$8/mo', 
    threat: 'Medium',
    marketShare: '6%',
    aiCapabilities: [],
    userBase: '80M+ users'
  },
  // Healthcare
  { 
    name: 'Healthwise', 
    segment: 'healthcare', 
    type: 'Direct', 
    strengths: ['Clinical content library', 'Evidence-based', 'EHR integration'], 
    weaknesses: ['No customization', 'Expensive', 'Static content'], 
    pricing: 'Custom', 
    threat: 'Medium',
    marketShare: '20%',
    employees: '500+',
    aiCapabilities: [],
    userBase: '2000+ hospitals'
  },
  { 
    name: 'Emmi Solutions (Wolters Kluwer)', 
    segment: 'healthcare', 
    type: 'Direct', 
    strengths: ['Patient engagement programs', 'Outcomes data', 'Care pathways'], 
    weaknesses: ['Expensive', 'Limited customization', 'Legacy platform'], 
    pricing: 'Custom', 
    threat: 'Medium',
    marketShare: '15%',
    aiCapabilities: [],
    userBase: '1000+ health systems'
  },
  // Enterprise
  { 
    name: 'Brightcove', 
    segment: 'enterprise', 
    type: 'Platform', 
    strengths: ['Scalable streaming', 'Reliable CDN', 'Analytics'], 
    weaknesses: ['No creation tools', 'Expensive', 'Complex'], 
    pricing: 'Custom', 
    threat: 'Medium',
    marketShare: '10%',
    funding: 'Public (BCOV)',
    employees: '500+',
    aiCapabilities: ['STT'],
    userBase: '3000+ enterprises'
  },
  { 
    name: 'Kaltura', 
    segment: 'enterprise', 
    type: 'Platform', 
    strengths: ['Feature-rich', 'Open source base', 'Education focus'], 
    weaknesses: ['Overwhelming complexity', 'Support issues', 'Outdated UX'], 
    pricing: 'Custom', 
    threat: 'High',
    marketShare: '8%',
    funding: '$166M',
    employees: '500+',
    aiCapabilities: ['STT', 'LLM'],
    userBase: '1000+ enterprises'
  },
  { 
    name: 'Microsoft Stream', 
    segment: 'enterprise', 
    type: 'Platform', 
    strengths: ['M365 integration', 'SharePoint native', 'Free with licenses'], 
    weaknesses: ['Basic features', 'No creation tools', 'Limited AI'], 
    pricing: 'Bundled', 
    threat: 'Medium',
    marketShare: '20%',
    aiCapabilities: ['STT'],
    userBase: '300M+ M365 users'
  },
];

const DIFFERENTIATORS: Differentiator[] = [
  {
    id: 'multi-model-ai',
    category: 'AI Engine',
    icon: Brain,
    title: 'Multi-Model AI Routing',
    description: 'Intelligent task routing across Claude, GPT-4, Gemini, and Llama based on context',
    genieAdvantage: 'First platform with dynamic AI model selection per task type',
    competitorGap: 'Competitors locked to single provider (OpenAI or Anthropic only)',
    impactScore: 95,
    features: ['Auto-routing', 'Cost optimization', 'Best-of-breed responses', 'Fallback chains']
  },
  {
    id: 'voice-ecosystem',
    category: 'Voice & Audio',
    icon: Mic,
    title: 'Universal Voice Ecosystem',
    description: 'ElevenLabs, OpenAI TTS, Azure Speech, and Google unified interface',
    genieAdvantage: 'Single API for all major TTS/STT providers with quality comparison',
    competitorGap: 'Others use single TTS provider or require separate integrations',
    impactScore: 90,
    features: ['Voice cloning', 'Multi-language', 'Real-time preview', 'Cost tracking']
  },
  {
    id: 'guided-experience',
    category: 'UX Innovation',
    icon: Sparkles,
    title: '7-Phase Guided Experience',
    description: 'AI-assisted workflow from concept to distribution with 6 specialized agents',
    genieAdvantage: 'End-to-end production guidance vs. tool-only approach',
    competitorGap: 'Competitors offer tools without production methodology',
    impactScore: 88,
    features: ['Voice Director', 'Scene Analyzer', 'Script Matcher', 'Music Composer', 'Auto-Editor', 'Distribution Agent']
  },
  {
    id: 'deployment-modes',
    category: 'Platform Flexibility',
    icon: Layers,
    title: 'Tri-Mode Deployment',
    description: 'Mobile-first, Desktop Pro, and Full Studio modes from single codebase',
    genieAdvantage: 'Same project across all form factors with optimized UX',
    competitorGap: 'CapCut mobile-only, Descript desktop-only, no unified experience',
    impactScore: 85,
    features: ['Progressive disclosure', 'Context-aware tools', 'Seamless sync', 'Offline-first mobile']
  },
  {
    id: 'healthcare-compliance',
    category: 'Vertical Expertise',
    icon: Shield,
    title: 'Healthcare-Grade Compliance',
    description: 'HIPAA, SOC2, and HITRUST ready with patient data isolation',
    genieAdvantage: 'Only AI video platform with healthcare-first architecture',
    competitorGap: 'Generic platforms require expensive customization for compliance',
    impactScore: 92,
    features: ['BAA available', 'Audit logging', 'PHI isolation', 'Consent management']
  },
  {
    id: 'api-first',
    category: 'Developer Platform',
    icon: Code,
    title: 'API-First Architecture',
    description: 'Every feature accessible via REST/GraphQL with SDK support',
    genieAdvantage: 'White-label ready with comprehensive API coverage',
    competitorGap: 'Limited API access, feature parity gaps between UI and API',
    impactScore: 82,
    features: ['Webhooks', 'SDK packages', 'OpenAPI spec', 'Rate limiting controls']
  },
  {
    id: 'agent-marketplace',
    category: 'Extensibility',
    icon: Bot,
    title: 'Agent Marketplace (Roadmap)',
    description: 'Community-built specialized agents for niche workflows',
    genieAdvantage: 'Platform play enabling ecosystem growth',
    competitorGap: 'Closed ecosystems with no third-party extension model',
    impactScore: 78,
    features: ['Agent SDK', 'Revenue share', 'Quality certification', 'Usage analytics']
  },
  {
    id: 'real-time-collab',
    category: 'Collaboration',
    icon: Users,
    title: 'Real-Time Multiplayer Editing',
    description: 'Google Docs-style collaboration on video projects',
    genieAdvantage: 'True real-time with conflict resolution and presence',
    competitorGap: 'Most have async-only collaboration or basic sharing',
    impactScore: 80,
    features: ['Live cursors', 'Version control', 'Comments/mentions', 'Role-based access']
  }
];

const APP_OPPORTUNITIES: AppOpportunity[] = [
  { name: 'ScriptGenius', description: 'AI script generation from prompts', platforms: ['iOS', 'Android', 'Web', 'API'], segment: 'creator', priority: 'P0', complexity: 'Medium', marketGap: 'No mobile-first script writing' },
  { name: 'VoiceOver Pro', description: 'TTS with voice selection', platforms: ['iOS', 'Android', 'Web', 'API'], segment: 'creator', priority: 'P0', complexity: 'Low', marketGap: 'Quick voiceover on mobile' },
  { name: 'ClipMaster', description: 'Auto-trim to highlights', platforms: ['iOS', 'Android', 'Web', 'Desktop', 'API'], segment: 'creator', priority: 'P0', complexity: 'Medium', marketGap: 'Social-first editing' },
  { name: 'TranscribeNow', description: 'Real-time transcription', platforms: ['iOS', 'Android', 'API'], segment: 'creator', priority: 'P1', complexity: 'Low', marketGap: 'Accurate mobile transcription' },
  { name: 'TravelMontage', description: 'Auto-edit trip highlights', platforms: ['iOS', 'Android'], segment: 'traveler', priority: 'P1', complexity: 'High', marketGap: 'Story-first editing' },
  { name: 'DemoMaker', description: 'Product demo automation', platforms: ['Web', 'Desktop'], segment: 'smb', priority: 'P0', complexity: 'Medium', marketGap: 'Self-service demo creation' },
  { name: 'TrainingForge', description: 'SOP → Video converter', platforms: ['Web', 'API'], segment: 'smb', priority: 'P1', complexity: 'High', marketGap: 'Document-first video' },
  { name: 'LectureGenius', description: 'Curriculum → video course', platforms: ['Web'], segment: 'education', priority: 'P1', complexity: 'High', marketGap: 'Automated course creation' },
  { name: 'PatientEducator', description: 'Condition-specific video library', platforms: ['iOS', 'Android', 'Web'], segment: 'healthcare', priority: 'P0', complexity: 'High', marketGap: 'Personalized patient content' },
  { name: 'PolicyCaster', description: 'Compliance doc → video', platforms: ['Web', 'API'], segment: 'enterprise', priority: 'P1', complexity: 'Medium', marketGap: 'Policy automation' },
  { name: 'GlobalVoice', description: 'Multi-language automation', platforms: ['Web', 'API'], segment: 'enterprise', priority: 'P1', complexity: 'Medium', marketGap: 'Localization at scale' },
];

const INTEGRATIONS: Integration[] = [
  { partner: 'YouTube', type: 'API', segment: 'creator', value: 'Direct publish, analytics sync', priority: 'P0' },
  { partner: 'Spotify/Anchor', type: 'API', segment: 'creator', value: 'Podcast distribution', priority: 'P0' },
  { partner: 'TikTok', type: 'API', segment: 'creator', value: 'Auto-format for vertical', priority: 'P0' },
  { partner: 'Canva', type: 'Plugin', segment: 'creator', value: 'Design-to-video pipeline', priority: 'P0' },
  { partner: 'Notion', type: 'API', segment: 'creator', value: 'Script storage/collaboration', priority: 'P0' },
  { partner: 'HubSpot', type: 'API', segment: 'smb', value: 'CRM-triggered video personalization', priority: 'P0' },
  { partner: 'Salesforce', type: 'API', segment: 'smb', value: 'Sales enablement', priority: 'P1' },
  { partner: 'Shopify', type: 'Plugin', segment: 'smb', value: 'Product video generation', priority: 'P1' },
  { partner: 'Canvas', type: 'LTI', segment: 'education', value: 'LMS embedding', priority: 'P1' },
  { partner: 'Google Classroom', type: 'API', segment: 'education', value: 'K-12 distribution', priority: 'P1' },
  { partner: 'Epic', type: 'API', segment: 'healthcare', value: 'EHR embedding via FHIR', priority: 'P0' },
  { partner: 'Cerner', type: 'API', segment: 'healthcare', value: 'EHR embedding via FHIR', priority: 'P1' },
  { partner: 'Zoom Healthcare', type: 'API', segment: 'healthcare', value: 'Telehealth + content', priority: 'P1' },
  { partner: 'Microsoft 365', type: 'API', segment: 'enterprise', value: 'Teams/SharePoint embedding', priority: 'P0' },
  { partner: 'Workday', type: 'API', segment: 'enterprise', value: 'HR/training integration', priority: 'P1' },
  { partner: 'Okta/Azure AD', type: 'SSO', segment: 'enterprise', value: 'Enterprise authentication', priority: 'P0' },
  { partner: 'Zapier', type: 'API', segment: 'smb', value: 'Multi-app workflows', priority: 'P0' },
  { partner: 'n8n', type: 'API', segment: 'enterprise', value: 'Self-hosted workflows', priority: 'P1' },
];

const FEATURE_MODULES: FeatureModule[] = [
  { name: 'Trim/Clips', standaloneApp: 'ClipMaster Pro', apiEndpoint: '/api/trim', agentCapability: 'Auto-clip extraction', segments: ['creator', 'smb', 'education'] },
  { name: 'TTS/Voiceover', standaloneApp: 'VoiceGenius', apiEndpoint: '/api/tts', agentCapability: 'Voice generation agent', segments: ['creator', 'smb', 'education', 'healthcare'] },
  { name: 'Transcription', standaloneApp: 'TranscribeNow', apiEndpoint: '/api/transcribe', agentCapability: 'Real-time transcription', segments: ['creator', 'smb', 'enterprise'] },
  { name: 'Script Gen', standaloneApp: 'ScriptAI', apiEndpoint: '/api/script', agentCapability: 'Content generation agent', segments: ['creator', 'smb', 'education'] },
  { name: 'Doc-to-Video', standaloneApp: 'DocuCast', apiEndpoint: '/api/doc-to-video', agentCapability: 'Document processing agent', segments: ['smb', 'education', 'enterprise'] },
  { name: 'Translation', standaloneApp: 'GlobalCast', apiEndpoint: '/api/translate', agentCapability: 'Multi-language agent', segments: ['healthcare', 'enterprise'] },
];

// Helper functions
const getCompetitionColor = (level: string) => {
  switch (level) {
    case 'Low': return 'text-green-500 bg-green-500/10';
    case 'Medium': return 'text-amber-500 bg-amber-500/10';
    case 'High': return 'text-orange-500 bg-orange-500/10';
    case 'Very High': return 'text-red-500 bg-red-500/10';
    default: return 'text-muted-foreground bg-muted';
  }
};

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'P0': return 'bg-red-500 text-white';
    case 'P1': return 'bg-amber-500 text-white';
    case 'P2': return 'bg-blue-500 text-white';
    default: return 'bg-muted text-muted-foreground';
  }
};

const getThreatColor = (threat: string) => {
  switch (threat) {
    case 'Low': return 'text-green-500';
    case 'Medium': return 'text-amber-500';
    case 'High': return 'text-red-500';
    default: return 'text-muted-foreground';
  }
};

const getAICapabilityColor = (capability: string) => {
  switch (capability) {
    case 'TTS': return 'bg-blue-500/20 text-blue-400';
    case 'STT': return 'bg-green-500/20 text-green-400';
    case 'LLM': return 'bg-purple-500/20 text-purple-400';
    case 'Vision': return 'bg-amber-500/20 text-amber-400';
    case 'Voice Clone': return 'bg-pink-500/20 text-pink-400';
    case 'Auto Edit': return 'bg-cyan-500/20 text-cyan-400';
    case 'Multi-Model': return 'bg-violet-500/20 text-violet-400';
    default: return 'bg-muted text-muted-foreground';
  }
};

const PlatformIcon = ({ platform }: { platform: string }) => {
  switch (platform) {
    case 'iOS':
    case 'Android':
      return <Smartphone className="h-3 w-3" />;
    case 'Web':
      return <Globe className="h-3 w-3" />;
    case 'Desktop':
      return <Layers className="h-3 w-3" />;
    case 'API':
      return <Code className="h-3 w-3" />;
    default:
      return null;
  }
};

export const MarketAnalysisDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedSegment, setSelectedSegment] = useState<string | null>(null);
  const [expandedCompetitor, setExpandedCompetitor] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const dashboardRef = React.useRef<HTMLDivElement>(null);

  const handleDownloadPNG = async () => {
    if (!dashboardRef.current) return;
    try {
      const canvas = await html2canvas(dashboardRef.current, {
        backgroundColor: '#1a1a2e',
        scale: 2
      });
      const link = document.createElement('a');
      link.download = 'market-analysis-dashboard.png';
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (error) {
      console.error('Failed to download PNG:', error);
    }
  };

  const filteredCompetitors = selectedSegment
    ? COMPETITORS.filter(c => c.segment === selectedSegment)
    : COMPETITORS;

  const filteredApps = selectedSegment
    ? APP_OPPORTUNITIES.filter(a => a.segment === selectedSegment)
    : APP_OPPORTUNITIES;

  const filteredIntegrations = selectedSegment
    ? INTEGRATIONS.filter(i => i.segment === selectedSegment)
    : INTEGRATIONS;

  return (
    <AnimatePresence>
      <motion.div
        ref={dashboardRef}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className={cn(
          "space-y-6 p-6 bg-background rounded-xl",
          isFullscreen && "fixed inset-0 z-50 overflow-auto"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">
              Market & Competitive Intelligence
            </h1>
            <p className="text-muted-foreground">
              Comprehensive analysis across 6 segments • {COMPETITORS.length} competitors • {DIFFERENTIATORS.length} differentiators
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleDownloadPNG}>
              <Download className="h-4 w-4 mr-2" />
              Export PNG
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setIsFullscreen(!isFullscreen)}
            >
              {isFullscreen ? <X className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        {/* Market Metrics Banner */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
          <Card className="bg-gradient-to-br from-violet-500/10 to-purple-500/10 border-violet-500/30">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-1">
                <DollarSign className="h-4 w-4 text-violet-400" />
                <span className="text-xs text-muted-foreground">Total TAM</span>
              </div>
              <div className="text-xl font-bold text-violet-400">{MARKET_METRICS.totalTAM}</div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-blue-500/30">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-1">
                <Target className="h-4 w-4 text-blue-400" />
                <span className="text-xs text-muted-foreground">SAM</span>
              </div>
              <div className="text-xl font-bold text-blue-400">{MARKET_METRICS.totalSAM}</div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/30">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-1">
                <Rocket className="h-4 w-4 text-green-400" />
                <span className="text-xs text-muted-foreground">SOM (3yr)</span>
              </div>
              <div className="text-xl font-bold text-green-400">{MARKET_METRICS.totalSOM}</div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 border-amber-500/30">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="h-4 w-4 text-amber-400" />
                <span className="text-xs text-muted-foreground">CAGR</span>
              </div>
              <div className="text-xl font-bold text-amber-400">{MARKET_METRICS.cagr}</div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-pink-500/10 to-rose-500/10 border-pink-500/30">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-1">
                <Brain className="h-4 w-4 text-pink-400" />
                <span className="text-xs text-muted-foreground">AI Adoption</span>
              </div>
              <div className="text-xl font-bold text-pink-400">{MARKET_METRICS.aiPenetration}</div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-cyan-500/10 to-teal-500/10 border-cyan-500/30">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-1">
                <Smartphone className="h-4 w-4 text-cyan-400" />
                <span className="text-xs text-muted-foreground">Mobile-First</span>
              </div>
              <div className="text-xl font-bold text-cyan-400">{MARKET_METRICS.mobileFirst}</div>
            </CardContent>
          </Card>
        </div>

        {/* Segment Filter */}
        <div className="flex flex-wrap gap-2">
          <Button
            variant={selectedSegment === null ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedSegment(null)}
          >
            All Segments
          </Button>
          {SEGMENTS.map(segment => (
            <Button
              key={segment.id}
              variant={selectedSegment === segment.id ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedSegment(segment.id)}
              className="gap-2"
            >
              <segment.icon className="h-4 w-4" />
              {segment.name}
            </Button>
          ))}
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-6 w-full max-w-3xl">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="competitors">Competitors</TabsTrigger>
            <TabsTrigger value="differentiators">Differentiators</TabsTrigger>
            <TabsTrigger value="apps">Apps</TabsTrigger>
            <TabsTrigger value="integrations">Integrations</TabsTrigger>
            <TabsTrigger value="modules">Modules</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Segment Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {SEGMENTS.map((segment, idx) => (
                <motion.div
                  key={segment.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                >
                  <Card 
                    className={cn(
                      "cursor-pointer transition-all hover:shadow-lg",
                      selectedSegment === segment.id && "ring-2 ring-primary"
                    )}
                    onClick={() => setSelectedSegment(segment.id === selectedSegment ? null : segment.id)}
                  >
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <div className={cn(
                          "p-2 rounded-lg bg-gradient-to-br",
                          segment.color
                        )}>
                          <segment.icon className="h-5 w-5 text-white" />
                        </div>
                        <Badge className={getPriorityColor(segment.priority)}>
                          {segment.priority}
                        </Badge>
                      </div>
                      <CardTitle className="text-lg">{segment.name}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="grid grid-cols-3 gap-2 text-xs">
                        <div className="text-center p-2 rounded bg-muted/50">
                          <p className="text-muted-foreground">TAM</p>
                          <p className="font-semibold">{segment.tam}</p>
                        </div>
                        <div className="text-center p-2 rounded bg-muted/50">
                          <p className="text-muted-foreground">SAM</p>
                          <p className="font-semibold">{segment.sam}</p>
                        </div>
                        <div className="text-center p-2 rounded bg-muted/50">
                          <p className="text-muted-foreground">SOM</p>
                          <p className="font-semibold">{segment.som}</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Growth</span>
                        <span className="font-semibold flex items-center gap-1 text-green-500">
                          <TrendingUp className="h-3 w-3" />
                          {segment.growthRate} CAGR
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Competition</span>
                        <Badge variant="outline" className={getCompetitionColor(segment.competitionLevel)}>
                          {segment.competitionLevel}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Genie Fit</span>
                        <div className="flex gap-0.5">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={cn(
                                "h-4 w-4",
                                i < segment.genieFit
                                  ? "text-amber-400 fill-amber-400"
                                  : "text-muted-foreground"
                              )}
                            />
                          ))}
                        </div>
                      </div>
                      <div className="pt-2 border-t">
                        <p className="text-xs text-muted-foreground mb-1">Key Drivers:</p>
                        <div className="flex flex-wrap gap-1">
                          {segment.keyDrivers.slice(0, 2).map((driver, i) => (
                            <Badge key={i} variant="secondary" className="text-xs">
                              {driver}
                            </Badge>
                          ))}
                          {segment.keyDrivers.length > 2 && (
                            <Badge variant="outline" className="text-xs">
                              +{segment.keyDrivers.length - 2}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="text-3xl font-bold text-primary">{MARKET_METRICS.totalTAM}</div>
                  <p className="text-muted-foreground text-sm">Total Addressable Market</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-3xl font-bold text-green-500">{COMPETITORS.length}</div>
                  <p className="text-muted-foreground text-sm">Competitors Tracked</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-3xl font-bold text-blue-500">{DIFFERENTIATORS.length}</div>
                  <p className="text-muted-foreground text-sm">Key Differentiators</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-3xl font-bold text-purple-500">{INTEGRATIONS.length}</div>
                  <p className="text-muted-foreground text-sm">Integration Partners</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Competitors Tab - Enhanced */}
          <TabsContent value="competitors" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-primary" />
                  Competitor Intelligence
                </CardTitle>
                <CardDescription>
                  {selectedSegment 
                    ? `${filteredCompetitors.length} competitors in ${SEGMENTS.find(s => s.id === selectedSegment)?.name}`
                    : `All ${COMPETITORS.length} competitors across segments`
                  }
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[600px]">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Competitor</TableHead>
                        <TableHead>Segment</TableHead>
                        <TableHead>AI Capabilities</TableHead>
                        <TableHead>Pricing</TableHead>
                        <TableHead>User Base</TableHead>
                        <TableHead>Threat</TableHead>
                        <TableHead></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredCompetitors.map((competitor, idx) => (
                        <React.Fragment key={`${competitor.name}-${idx}`}>
                          <TableRow 
                            className="cursor-pointer hover:bg-muted/50"
                            onClick={() => setExpandedCompetitor(
                              expandedCompetitor === competitor.name ? null : competitor.name
                            )}
                          >
                            <TableCell>
                              <div className="font-medium">{competitor.name}</div>
                              {competitor.yearFounded && (
                                <div className="text-xs text-muted-foreground">Est. {competitor.yearFounded}</div>
                              )}
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">
                                {SEGMENTS.find(s => s.id === competitor.segment)?.name}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex flex-wrap gap-1 max-w-[200px]">
                                {competitor.aiCapabilities.slice(0, 3).map((cap, i) => (
                                  <Badge key={i} className={cn("text-xs", getAICapabilityColor(cap))}>
                                    {cap}
                                  </Badge>
                                ))}
                                {competitor.aiCapabilities.length > 3 && (
                                  <Badge variant="outline" className="text-xs">
                                    +{competitor.aiCapabilities.length - 3}
                                  </Badge>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>{competitor.pricing}</TableCell>
                            <TableCell className="text-sm">{competitor.userBase || '-'}</TableCell>
                            <TableCell>
                              <Badge className={cn(
                                "text-xs",
                                competitor.threat === 'High' && "bg-red-500/20 text-red-400",
                                competitor.threat === 'Medium' && "bg-amber-500/20 text-amber-400",
                                competitor.threat === 'Low' && "bg-green-500/20 text-green-400"
                              )}>
                                {competitor.threat}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {expandedCompetitor === competitor.name 
                                ? <ChevronUp className="h-4 w-4" />
                                : <ChevronDown className="h-4 w-4" />
                              }
                            </TableCell>
                          </TableRow>
                          {expandedCompetitor === competitor.name && (
                            <TableRow>
                              <TableCell colSpan={7} className="bg-muted/30">
                                <div className="grid grid-cols-3 gap-6 p-4">
                                  <div>
                                    <h4 className="font-medium text-green-500 mb-2 flex items-center gap-2">
                                      <Check className="h-4 w-4" />
                                      Strengths
                                    </h4>
                                    <ul className="space-y-1 text-sm">
                                      {competitor.strengths.map((s, i) => (
                                        <li key={i}>• {s}</li>
                                      ))}
                                    </ul>
                                  </div>
                                  <div>
                                    <h4 className="font-medium text-red-500 mb-2 flex items-center gap-2">
                                      <X className="h-4 w-4" />
                                      Weaknesses
                                    </h4>
                                    <ul className="space-y-1 text-sm">
                                      {competitor.weaknesses.map((w, i) => (
                                        <li key={i}>• {w}</li>
                                      ))}
                                    </ul>
                                  </div>
                                  <div className="space-y-3">
                                    <h4 className="font-medium text-blue-500 mb-2 flex items-center gap-2">
                                      <BarChart3 className="h-4 w-4" />
                                      Key Metrics
                                    </h4>
                                    <div className="grid grid-cols-2 gap-2 text-sm">
                                      {competitor.marketShare && (
                                        <div>
                                          <span className="text-muted-foreground">Market Share:</span>
                                          <span className="ml-1 font-medium">{competitor.marketShare}</span>
                                        </div>
                                      )}
                                      {competitor.funding && (
                                        <div>
                                          <span className="text-muted-foreground">Funding:</span>
                                          <span className="ml-1 font-medium">{competitor.funding}</span>
                                        </div>
                                      )}
                                      {competitor.employees && (
                                        <div>
                                          <span className="text-muted-foreground">Team:</span>
                                          <span className="ml-1 font-medium">{competitor.employees}</span>
                                        </div>
                                      )}
                                    </div>
                                    <div className="pt-2">
                                      <span className="text-xs text-muted-foreground">AI Stack:</span>
                                      <div className="flex flex-wrap gap-1 mt-1">
                                        {competitor.aiCapabilities.map((cap, i) => (
                                          <Badge key={i} className={cn("text-xs", getAICapabilityColor(cap))}>
                                            {cap}
                                          </Badge>
                                        ))}
                                      </div>
                                    </div>
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

          {/* Differentiators Tab - NEW */}
          <TabsContent value="differentiators" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Crown className="h-5 w-5 text-amber-500" />
                  Genie Suite Competitive Advantages
                </CardTitle>
                <CardDescription>
                  Key differentiators that set Genie Suite apart from the competition
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {DIFFERENTIATORS.map((diff, idx) => (
                    <motion.div
                      key={diff.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                    >
                      <Card className="h-full bg-gradient-to-br from-background to-muted/20 border-l-4 border-l-primary">
                        <CardHeader className="pb-2">
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3">
                              <div className="p-2 rounded-lg bg-primary/10">
                                <diff.icon className="h-5 w-5 text-primary" />
                              </div>
                              <div>
                                <CardTitle className="text-base">{diff.title}</CardTitle>
                                <Badge variant="outline" className="text-xs mt-1">
                                  {diff.category}
                                </Badge>
                              </div>
                            </div>
                            <div className="flex items-center gap-1">
                              <Gauge className="h-4 w-4 text-muted-foreground" />
                              <span className="text-lg font-bold text-primary">{diff.impactScore}</span>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <p className="text-sm text-muted-foreground">{diff.description}</p>
                          
                          <div className="space-y-2">
                            <div className="p-2 rounded bg-green-500/10 border border-green-500/20">
                              <div className="flex items-center gap-2 text-green-500 text-xs font-medium mb-1">
                                <Check className="h-3 w-3" />
                                Genie Advantage
                              </div>
                              <p className="text-sm">{diff.genieAdvantage}</p>
                            </div>
                            
                            <div className="p-2 rounded bg-red-500/10 border border-red-500/20">
                              <div className="flex items-center gap-2 text-red-500 text-xs font-medium mb-1">
                                <X className="h-3 w-3" />
                                Competitor Gap
                              </div>
                              <p className="text-sm">{diff.competitorGap}</p>
                            </div>
                          </div>
                          
                          <div className="pt-2">
                            <div className="text-xs text-muted-foreground mb-1">Key Features:</div>
                            <div className="flex flex-wrap gap-1">
                              {diff.features.map((feature, i) => (
                                <Badge key={i} variant="secondary" className="text-xs">
                                  {feature}
                                </Badge>
                              ))}
                            </div>
                          </div>
                          
                          <div className="pt-2">
                            <div className="flex justify-between text-xs text-muted-foreground mb-1">
                              <span>Impact Score</span>
                              <span>{diff.impactScore}/100</span>
                            </div>
                            <Progress value={diff.impactScore} className="h-2" />
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
            
            {/* Competitive Matrix */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Scale className="h-5 w-5 text-primary" />
                  Feature Comparison Matrix
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="w-full">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[200px]">Feature</TableHead>
                        <TableHead className="text-center bg-primary/10">
                          <div className="flex items-center justify-center gap-1">
                            <Sparkles className="h-4 w-4" />
                            Genie Suite
                          </div>
                        </TableHead>
                        <TableHead className="text-center">Descript</TableHead>
                        <TableHead className="text-center">CapCut</TableHead>
                        <TableHead className="text-center">Synthesia</TableHead>
                        <TableHead className="text-center">Loom</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {[
                        { feature: 'Multi-Model AI', genie: true, descript: false, capcut: false, synthesia: false, loom: false },
                        { feature: 'Mobile App', genie: true, descript: false, capcut: true, synthesia: false, loom: true },
                        { feature: 'Voice Cloning', genie: true, descript: true, capcut: false, synthesia: false, loom: false },
                        { feature: 'TTS Multi-Provider', genie: true, descript: false, capcut: false, synthesia: true, loom: false },
                        { feature: 'Healthcare Compliance', genie: true, descript: false, capcut: false, synthesia: false, loom: false },
                        { feature: 'Real-time Collab', genie: true, descript: true, capcut: false, synthesia: false, loom: true },
                        { feature: 'Agent Workflows', genie: true, descript: false, capcut: false, synthesia: false, loom: false },
                        { feature: 'API-First', genie: true, descript: true, capcut: false, synthesia: true, loom: true },
                        { feature: 'White-Label', genie: true, descript: false, capcut: false, synthesia: true, loom: false },
                        { feature: 'Auto-Distribution', genie: true, descript: false, capcut: true, synthesia: false, loom: true },
                      ].map((row, idx) => (
                        <TableRow key={idx}>
                          <TableCell className="font-medium">{row.feature}</TableCell>
                          <TableCell className="text-center bg-primary/5">
                            {row.genie ? <Check className="h-5 w-5 text-green-500 mx-auto" /> : <X className="h-5 w-5 text-red-400 mx-auto" />}
                          </TableCell>
                          <TableCell className="text-center">
                            {row.descript ? <Check className="h-5 w-5 text-green-500 mx-auto" /> : <X className="h-5 w-5 text-muted-foreground mx-auto" />}
                          </TableCell>
                          <TableCell className="text-center">
                            {row.capcut ? <Check className="h-5 w-5 text-green-500 mx-auto" /> : <X className="h-5 w-5 text-muted-foreground mx-auto" />}
                          </TableCell>
                          <TableCell className="text-center">
                            {row.synthesia ? <Check className="h-5 w-5 text-green-500 mx-auto" /> : <X className="h-5 w-5 text-muted-foreground mx-auto" />}
                          </TableCell>
                          <TableCell className="text-center">
                            {row.loom ? <Check className="h-5 w-5 text-green-500 mx-auto" /> : <X className="h-5 w-5 text-muted-foreground mx-auto" />}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Standalone Apps Tab */}
          <TabsContent value="apps" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Smartphone className="h-5 w-5 text-primary" />
                  Standalone App Opportunities
                </CardTitle>
                <CardDescription>
                  Features that can be launched as independent apps
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredApps.map((app, idx) => (
                    <motion.div
                      key={app.name}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                    >
                      <Card className="h-full">
                        <CardHeader className="pb-2">
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-base">{app.name}</CardTitle>
                            <Badge className={getPriorityColor(app.priority)}>
                              {app.priority}
                            </Badge>
                          </div>
                          <CardDescription>{app.description}</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div className="flex flex-wrap gap-1">
                            {app.platforms.map(platform => (
                              <Badge key={platform} variant="outline" className="gap-1">
                                <PlatformIcon platform={platform} />
                                {platform}
                              </Badge>
                            ))}
                          </div>
                          <div className="text-sm">
                            <span className="text-muted-foreground">Segment: </span>
                            <Badge variant="secondary">
                              {SEGMENTS.find(s => s.id === app.segment)?.name}
                            </Badge>
                          </div>
                          <div className="text-sm">
                            <span className="text-muted-foreground">Complexity: </span>
                            <Badge variant="outline" className={getCompetitionColor(app.complexity)}>
                              {app.complexity}
                            </Badge>
                          </div>
                          <div className="text-sm">
                            <span className="text-muted-foreground">Market Gap: </span>
                            <span>{app.marketGap}</span>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Integrations Tab */}
          <TabsContent value="integrations" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Link className="h-5 w-5 text-primary" />
                  Integration Opportunities
                </CardTitle>
                <CardDescription>
                  Strategic partnerships and API integrations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[500px]">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Partner</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Segment</TableHead>
                        <TableHead>Value Proposition</TableHead>
                        <TableHead>Priority</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredIntegrations.map((integration, idx) => (
                        <TableRow key={`${integration.partner}-${idx}`}>
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-2">
                              {integration.partner}
                              <ExternalLink className="h-3 w-3 text-muted-foreground" />
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary">{integration.type}</Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {SEGMENTS.find(s => s.id === integration.segment)?.name}
                            </Badge>
                          </TableCell>
                          <TableCell className="max-w-xs">
                            {integration.value}
                          </TableCell>
                          <TableCell>
                            <Badge className={getPriorityColor(integration.priority)}>
                              {integration.priority}
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

          {/* Feature Modules Tab */}
          <TabsContent value="modules" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5 text-primary" />
                  Feature Module Extraction
                </CardTitle>
                <CardDescription>
                  Core features deployable as apps, APIs, and agents
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {FEATURE_MODULES.map((module, idx) => (
                    <motion.div
                      key={module.name}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: idx * 0.05 }}
                    >
                      <Card className="h-full bg-gradient-to-br from-background to-muted/30">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-lg flex items-center gap-2">
                            <Zap className="h-5 w-5 text-amber-500" />
                            {module.name}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="grid grid-cols-3 gap-2">
                            <div className="text-center p-2 rounded-lg bg-primary/10">
                              <Smartphone className="h-5 w-5 mx-auto mb-1 text-primary" />
                              <p className="text-xs font-medium">{module.standaloneApp}</p>
                              <p className="text-xs text-muted-foreground">App</p>
                            </div>
                            <div className="text-center p-2 rounded-lg bg-blue-500/10">
                              <Code className="h-5 w-5 mx-auto mb-1 text-blue-500" />
                              <p className="text-xs font-medium">{module.apiEndpoint}</p>
                              <p className="text-xs text-muted-foreground">API</p>
                            </div>
                            <div className="text-center p-2 rounded-lg bg-purple-500/10">
                              <Bot className="h-5 w-5 mx-auto mb-1 text-purple-500" />
                              <p className="text-xs font-medium truncate">{module.agentCapability}</p>
                              <p className="text-xs text-muted-foreground">Agent</p>
                            </div>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">Target Segments:</p>
                            <div className="flex flex-wrap gap-1">
                              {module.segments.map(seg => (
                                <Badge key={seg} variant="outline" className="text-xs">
                                  {SEGMENTS.find(s => s.id === seg)?.name}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>
    </AnimatePresence>
  );
};

export default MarketAnalysisDashboard;
