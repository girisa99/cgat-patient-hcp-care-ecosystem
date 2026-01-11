/**
 * Genie Investor Dashboard
 * Comprehensive visual analytics for investor presentations
 * Updated 2026-01-11 with collaboration features
 */

import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import {
  Users,
  Plane,
  Briefcase,
  GraduationCap,
  Heart,
  Building,
  TrendingUp,
  TrendingDown,
  Check,
  X,
  Star,
  Target,
  Zap,
  Download,
  Maximize2,
  PieChart,
  BarChart3,
  LineChart,
  Lightbulb,
  Shield,
  Globe,
  Smartphone,
  MessageSquare,
  RefreshCw,
  Award,
  ArrowRight,
  Clock,
  DollarSign,
  Layers,
  AlertCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import html2canvas from 'html2canvas';
import { toast } from 'sonner';

// Comprehensive Competitor Analysis with Pros/Cons
interface CompetitorDetail {
  name: string;
  pricing: string;
  softPricePoint: string;
  threat: 'Low' | 'Medium' | 'High';
  userBase: string;
  revenue: string;
  founded: number;
  yearsInMarket: number;
  languages: number;
  pros: string[];
  cons: string[];
  uxRating: number; // 1-5
  featureRating: number; // 1-5
  genieBetterAt: string[];
  genieWorseAt: string[];
}

// Enhanced Segment Data with Full Competitor Mapping
const segments = [
  {
    id: 'creator',
    name: 'Creator Economy',
    icon: Users,
    marketSize: '$50B+',
    growthRate: '+20%',
    tam: '$50B',
    sam: '$12B',
    som: '$600M',
    genieFit: 5,
    priority: 'P0',
    color: 'from-purple-500 to-pink-500',
    bgColor: 'bg-purple-500/10',
    collaboration: 'Basic',
    competitors: [
      { 
        name: 'Descript', 
        pricing: '$12-24/mo', 
        softPricePoint: '$15/mo',
        threat: 'High',
        userBase: '3M+',
        revenue: '$50M ARR',
        founded: 2017,
        yearsInMarket: 9,
        languages: 25,
        pros: ['Best-in-class transcription', 'Overdub voice cloning', 'Studio Sound (audio cleanup)', 'Screen recording built-in'],
        cons: ['Desktop-only (no mobile)', 'Steep learning curve', 'Expensive for solo creators', 'No real-time collaboration'],
        uxRating: 4,
        featureRating: 5,
        genieBetterAt: ['Mobile-first', 'Script-to-publish pipeline', 'Affordable pricing', 'Real-time collab'],
        genieWorseAt: ['Voice cloning quality', 'Desktop features', 'Transcription accuracy'],
      },
      { 
        name: 'Loom', 
        pricing: '$12.50/mo', 
        softPricePoint: '$10/mo',
        threat: 'High',
        userBase: '25M+',
        revenue: '$150M ARR',
        founded: 2015,
        yearsInMarket: 11,
        languages: 10,
        pros: ['Dead simple UX', 'Instant sharing', 'Great viewer analytics', 'Browser extension'],
        cons: ['No editing capabilities', 'No AI features', 'Recording only (not production)', 'Limited to screen/camera'],
        uxRating: 5,
        featureRating: 2,
        genieBetterAt: ['Full production suite', 'AI editing', 'Script generation', 'Multi-format output'],
        genieWorseAt: ['Quick capture simplicity', 'Viewer analytics', 'Browser extension'],
      },
      { 
        name: 'CapCut', 
        pricing: 'Free/$8/mo', 
        softPricePoint: 'Free',
        threat: 'High',
        userBase: '500M+',
        revenue: '$200M+ ARR',
        founded: 2020,
        yearsInMarket: 6,
        languages: 45,
        pros: ['Free tier excellent', 'TikTok native', 'Trending effects/sounds', 'Mobile UX polish'],
        cons: ['No script workflow', 'Limited AI', 'Basic collaboration', 'No voice cloning'],
        uxRating: 5,
        featureRating: 3,
        genieBetterAt: ['Script-first workflow', 'Voice generation', 'B2B features', 'Approval workflows'],
        genieWorseAt: ['Mobile UX polish', 'Free tier value', 'Trending sounds/effects'],
      },
      { 
        name: 'Riverside.fm', 
        pricing: '$15-24/mo', 
        softPricePoint: '$19/mo',
        threat: 'Medium',
        userBase: '500K+',
        revenue: '$15M ARR',
        founded: 2020,
        yearsInMarket: 6,
        languages: 12,
        pros: ['Studio-quality remote', 'Separate tracks', 'Local recording', 'Easy guest invites'],
        cons: ['Limited post-production', 'No AI editing', 'Podcast-focused', 'No mobile app'],
        uxRating: 4,
        featureRating: 3,
        genieBetterAt: ['Post-production AI', 'Script workflow', 'Mobile support', 'Multi-format'],
        genieWorseAt: ['Remote recording quality', 'Multi-guest handling', 'Track separation'],
      },
    ],
    painPoints: [
      '"I spend 2 hours editing a 60-second reel" (45% of creators)',
      '"Finding music and syncing takes forever" (38%)',
      '"No feedback loop with sponsors" (28%)',
    ],
    genieAdvantage: [
      'Script → TTS → Record → Publish unified',
      'AI auto-edit and clip extraction',
      'Basic collaboration for guest reviews',
    ],
    genieDisadvantage: [
      'Voice cloning not as natural as ElevenLabs/Descript',
      'No trending sounds library (yet)',
      'Desktop app not available',
    ],
    improvementNeeded: ['Match voice cloning quality (ElevenLabs level)', 'Add trending sounds library', 'Viral scoring algorithm'],
    appOpportunities: ['ScriptGenius', 'VoiceOver Pro', 'ClipMaster', 'ReelGenius'],
    integrations: ['YouTube', 'TikTok', 'Instagram', 'Spotify', 'Canva'],
    aiAgents: ['script_generation_agent', 'clip_extraction_agent', 'social_publish_agent'],
    userPreferences: { mobile: 72, desktop: 28, collaboration: 35 },
    softPricePoint: '$9-12/mo',
    marketPosition: 'Challenger',
  },
  {
    id: 'traveler',
    name: 'Travel Experience',
    icon: Plane,
    marketSize: '$8B+',
    growthRate: '+15%',
    tam: '$8B',
    sam: '$2B',
    som: '$100M',
    genieFit: 4,
    priority: 'P1',
    color: 'from-blue-500 to-cyan-500',
    bgColor: 'bg-blue-500/10',
    collaboration: 'None',
    competitors: [
      { 
        name: 'InShot', 
        pricing: 'Free/$3.99/mo', 
        softPricePoint: 'Free',
        threat: 'Medium',
        userBase: '500M+',
        revenue: '$100M+ ARR',
        founded: 2015,
        yearsInMarket: 11,
        languages: 30,
        pros: ['100+ filters', 'Social story templates', 'Music library', 'Tiny app size'],
        cons: ['Ads heavy', 'No AI narration', 'Basic features', 'No cloud sync'],
        uxRating: 4,
        featureRating: 3,
        genieBetterAt: ['AI auto-edit', 'Trip montage templates', 'Offline sync', 'No ads'],
        genieWorseAt: ['Filter variety', 'App size', 'Social templates'],
      },
      { 
        name: 'GoPro Quik', 
        pricing: 'Free/$9.99/yr', 
        softPricePoint: 'Free with GoPro',
        threat: 'Low',
        userBase: '10M+',
        revenue: 'N/A',
        founded: 2016,
        yearsInMarket: 10,
        languages: 12,
        pros: ['GoPro integration', 'Auto-edit highlights', 'Cloud backup', 'Action cam optimized'],
        cons: ['GoPro-centric', 'Limited phone footage', 'Basic features', 'No narration'],
        uxRating: 3,
        featureRating: 2,
        genieBetterAt: ['Device agnostic', 'AI narration', 'Trip story templates', 'All camera support'],
        genieWorseAt: ['Action cam features', 'GoPro cloud sync'],
      },
    ],
    painPoints: [
      '"500 photos/videos sit unused in my camera roll" (65%)',
      '"No time to edit trip memories" (58%)',
      '"Offline editing impossible" (42%)',
    ],
    genieAdvantage: [
      'Offline-first recording & sync',
      'AI location tagging & auto-edit',
      'Travel montage templates',
    ],
    genieDisadvantage: [
      'Less filter variety than InShot',
      'No action cam auto-detect',
      'Limited social story templates',
    ],
    improvementNeeded: ['Match InShot filter variety', 'Add social story templates', 'GPS-triggered auto-record'],
    appOpportunities: ['TripClip', 'TravelMontage'],
    integrations: ['Google Maps', 'Expedia'],
    aiAgents: ['location_tagging_agent', 'montage_generation_agent'],
    userPreferences: { mobile: 92, desktop: 8, collaboration: 5 },
    softPricePoint: '$4-6/mo',
    marketPosition: 'Opportunity',
  },
  {
    id: 'smb',
    name: 'SMB Marketing',
    icon: Briefcase,
    marketSize: '$15B+',
    growthRate: '+25%',
    tam: '$15B',
    sam: '$4B',
    som: '$200M',
    genieFit: 5,
    priority: 'P0',
    color: 'from-green-500 to-emerald-500',
    bgColor: 'bg-green-500/10',
    collaboration: 'Standard',
    competitors: [
      { 
        name: 'Loom', 
        pricing: '$12.50/mo', 
        softPricePoint: '$10/mo',
        threat: 'High',
        userBase: '25M+',
        revenue: '$150M ARR',
        founded: 2015,
        yearsInMarket: 11,
        languages: 10,
        pros: ['Instant async comms', 'CRM integrations', 'Viewer engagement', 'Simple UX'],
        cons: ['No editing', 'No AI features', 'Recording only', 'No production'],
        uxRating: 5,
        featureRating: 2,
        genieBetterAt: ['Full production', 'AI editing', 'Script generation', 'Marketing templates'],
        genieWorseAt: ['Quick capture UX', 'CRM integrations', 'Viewer analytics'],
      },
      { 
        name: 'Synthesia', 
        pricing: '$22-67/mo', 
        softPricePoint: '$29/mo',
        threat: 'High',
        userBase: '100K+',
        revenue: '$60M ARR',
        founded: 2017,
        yearsInMarket: 9,
        languages: 140,
        pros: ['AI avatars', '140 languages', 'No camera needed', 'Enterprise ready'],
        cons: ['Robotic feel', 'Expensive', 'Template bound', 'No real video'],
        uxRating: 4,
        featureRating: 4,
        genieBetterAt: ['70% cheaper', 'Natural TTS', 'Real presenter option', 'Mobile support'],
        genieWorseAt: ['AI avatar quality', 'Language count', 'Enterprise features'],
      },
      { 
        name: 'Pictory', 
        pricing: '$19-39/mo', 
        softPricePoint: '$23/mo',
        threat: 'Medium',
        userBase: '200K+',
        revenue: '$10M ARR',
        founded: 2020,
        yearsInMarket: 6,
        languages: 8,
        pros: ['Blog-to-video', 'AI summary', 'Stock library', 'Quick turnaround'],
        cons: ['Template-bound', 'Limited customization', 'Basic AI', 'No mobile'],
        uxRating: 3,
        featureRating: 3,
        genieBetterAt: ['Full editing control', 'Mobile support', 'Approval workflows'],
        genieWorseAt: ['Blog import', 'AI summary from URL'],
      },
      { 
        name: 'Canva Video', 
        pricing: '$12.99/mo', 
        softPricePoint: '$10/mo',
        threat: 'Medium',
        userBase: '170M+',
        revenue: '$2.3B ARR',
        founded: 2013,
        yearsInMarket: 13,
        languages: 100,
        pros: ['Brand kits', 'Huge template library', 'Team features', 'All-in-one design'],
        cons: ['Basic editing', 'No AI narration', 'Limited effects', 'Jack of all trades'],
        uxRating: 5,
        featureRating: 3,
        genieBetterAt: ['AI TTS', 'Script-first', 'Advanced editing', 'Video-focused'],
        genieWorseAt: ['Design integration', 'Brand kit import', 'Template variety'],
      },
    ],
    painPoints: [
      '"Cannot afford a video team" (72%)',
      '"Product demos are outdated" (55%)',
      '"No easy way to get manager approval" (48%)',
    ],
    genieAdvantage: [
      'Affordable AI + product templates',
      'Team feedback without email chains',
      'Auto-update demos from product changes',
    ],
    genieDisadvantage: [
      'No AI avatar option (yet)',
      'Limited CRM integrations',
      'No blog/URL import',
    ],
    improvementNeeded: ['Add AI avatar option', 'Quick screen recording mode', 'Blog/article import'],
    appOpportunities: ['QuickPromo', 'DemoMaker', 'TrainingForge'],
    integrations: ['HubSpot', 'Shopify', 'Zapier', 'Salesforce'],
    aiAgents: ['product_demo_agent', 'marketing_video_agent', 'brand_voice_agent'],
    userPreferences: { mobile: 35, desktop: 65, collaboration: 68 },
    softPricePoint: '$12-18/mo',
    marketPosition: 'Disruptor',
  },
  {
    id: 'education',
    name: 'Education',
    icon: GraduationCap,
    marketSize: '$12B+',
    growthRate: '+18%',
    tam: '$12B',
    sam: '$3B',
    som: '$150M',
    genieFit: 4,
    priority: 'P1',
    color: 'from-amber-500 to-orange-500',
    bgColor: 'bg-amber-500/10',
    collaboration: 'Full',
    competitors: [
      { 
        name: 'Panopto', 
        pricing: 'Custom ($2-5/user)', 
        softPricePoint: '$3/user/mo',
        threat: 'High',
        userBase: '1000+ inst',
        revenue: '$100M+ ARR',
        founded: 2007,
        yearsInMarket: 19,
        languages: 20,
        pros: ['Deep LMS integration', 'Lecture capture', 'Video search', 'Enterprise scale'],
        cons: ['Enterprise pricing', 'Complex setup', 'Dated UI', 'No AI creation'],
        uxRating: 2,
        featureRating: 4,
        genieBetterAt: ['Modern AI UX', 'Affordable', 'Mobile support', 'Quick setup'],
        genieWorseAt: ['LMS depth', 'Enterprise scale', 'Video search'],
      },
      { 
        name: 'Edpuzzle', 
        pricing: 'Free/$8/mo', 
        softPricePoint: 'Free',
        threat: 'Medium',
        userBase: '20M+ teachers',
        revenue: '$30M ARR',
        founded: 2013,
        yearsInMarket: 13,
        languages: 15,
        pros: ['Interactive quizzes', 'Student tracking', 'Free tier', 'YouTube import'],
        cons: ['Limited creation', 'K-12 focus', 'No original production', 'Basic features'],
        uxRating: 4,
        featureRating: 3,
        genieBetterAt: ['Full creation suite', 'AI generation', 'K-12 to higher ed'],
        genieWorseAt: ['Interactive quizzes', 'Student tracking granularity'],
      },
      { 
        name: 'WeVideo', 
        pricing: '$4.99-15.99/mo', 
        softPricePoint: '$8/mo',
        threat: 'Medium',
        userBase: '30M+',
        revenue: '$25M ARR',
        founded: 2011,
        yearsInMarket: 15,
        languages: 8,
        pros: ['LTI integration', 'Student accounts', 'Chromebook support', 'School licensing'],
        cons: ['Dated UI', 'Limited AI', 'Slow rendering', 'No mobile'],
        uxRating: 2,
        featureRating: 3,
        genieBetterAt: ['Modern AI-first UX', 'Faster rendering', 'Mobile support'],
        genieWorseAt: ['Chromebook optimization', 'School district licensing'],
      },
    ],
    painPoints: [
      '"Recording is easy, making it engaging takes hours" (68%)',
      '"No way to get student feedback on content" (45%)',
      '"LMS integration is a nightmare" (52%)',
    ],
    genieAdvantage: [
      'Lesson builder from curriculum notes',
      'Student review cycles with status tracking',
      'Native LMS integration (Canvas, Blackboard)',
    ],
    genieDisadvantage: [
      'No interactive quiz overlay (yet)',
      'Limited Chromebook optimization',
      'Fewer language options than Panopto',
    ],
    improvementNeeded: ['Deepen LMS integrations', 'Add interactive quiz overlay', 'Chromebook optimization'],
    appOpportunities: ['EduClip', 'LectureGenius'],
    integrations: ['Canvas LMS', 'Blackboard', 'Google Classroom'],
    aiAgents: ['lesson_builder_agent', 'curriculum_agent', 'assessment_agent'],
    userPreferences: { mobile: 25, desktop: 75, collaboration: 82 },
    softPricePoint: '$6-10/mo or $2-3/student',
    marketPosition: 'Challenger',
  },
  {
    id: 'healthcare',
    name: 'Healthcare',
    icon: Heart,
    marketSize: '$25B+',
    growthRate: '+22%',
    tam: '$25B',
    sam: '$6B',
    som: '$300M',
    genieFit: 5,
    priority: 'P0',
    color: 'from-red-500 to-rose-500',
    bgColor: 'bg-red-500/10',
    collaboration: 'Full',
    competitors: [
      { 
        name: 'Healthwise', 
        pricing: 'Custom ($50K+/yr)', 
        softPricePoint: '$80K/yr',
        threat: 'Medium',
        userBase: '2000+ hosp',
        revenue: '$80M ARR',
        founded: 1975,
        yearsInMarket: 51,
        languages: 20,
        pros: ['Clinical content library', 'Evidence-based', 'EHR integration', 'Compliance proven'],
        cons: ['No customization', 'Very expensive', 'Outdated UX', 'No personalization'],
        uxRating: 2,
        featureRating: 4,
        genieBetterAt: ['Customizable content', 'AI personalization', 'Modern UX', '90% cheaper'],
        genieWorseAt: ['Clinical library breadth', '51yr compliance track record'],
      },
      { 
        name: 'Emmi Solutions', 
        pricing: 'Custom ($30K+/yr)', 
        softPricePoint: '$50K/yr',
        threat: 'Medium',
        userBase: '500+ health sys',
        revenue: '$50M ARR',
        founded: 2002,
        yearsInMarket: 24,
        languages: 25,
        pros: ['Patient engagement proven', 'Multi-language', 'Outcome tracking', 'Research backed'],
        cons: ['Expensive', 'Limited personalization', 'No provider creation', 'Fixed content'],
        uxRating: 3,
        featureRating: 3,
        genieBetterAt: ['Provider-created content', 'AI personalization', '80% cheaper', 'Modern UX'],
        genieWorseAt: ['Outcome tracking', 'Research validation'],
      },
    ],
    painPoints: [
      '"Patients forget 80% of what I tell them" (physicians)',
      '"HIPAA makes video complicated" (IT teams)',
      '"Need content in 15 languages" (health systems)',
    ],
    genieAdvantage: [
      'First HIPAA-compliant AI video under $100/mo',
      'Multi-stakeholder approval workflows',
      'Multi-language patient education',
    ],
    genieDisadvantage: [
      'No established clinical content library',
      'Limited outcome tracking (Phase 2)',
      'EHR integration depth pending',
    ],
    improvementNeeded: ['Build clinical content library partnerships', 'Add patient engagement tracking', 'EHR deep integration'],
    appOpportunities: ['HealthNarrate', 'PatientEducator'],
    integrations: ['Epic', 'Cerner', 'Zoom Healthcare'],
    aiAgents: ['patient_education_agent', 'compliance_agent', 'translation_agent'],
    userPreferences: { mobile: 40, desktop: 60, collaboration: 95 },
    softPricePoint: '$50-100/mo (provider) or $5K-15K/yr (org)',
    marketPosition: 'Blue Ocean',
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    icon: Building,
    marketSize: '$40B+',
    growthRate: '+15%',
    tam: '$40B',
    sam: '$10B',
    som: '$500M',
    genieFit: 4,
    priority: 'P1',
    color: 'from-indigo-500 to-violet-500',
    bgColor: 'bg-indigo-500/10',
    collaboration: 'Full',
    competitors: [
      { 
        name: 'Brightcove', 
        pricing: 'Custom ($500+/mo)', 
        softPricePoint: '$1000/mo',
        threat: 'Medium',
        userBase: '3000+ ent',
        revenue: '$200M ARR',
        founded: 2004,
        yearsInMarket: 22,
        languages: 20,
        pros: ['Enterprise CDN', 'Analytics', 'Scalable', 'White-label'],
        cons: ['No creation tools', 'Expensive', 'Complex', 'Hosting only'],
        uxRating: 3,
        featureRating: 4,
        genieBetterAt: ['Creation + hosting unified', 'AI-powered', 'Modern UX', 'Affordable entry'],
        genieWorseAt: ['CDN scale', 'Enterprise analytics', 'White-label depth'],
      },
      { 
        name: 'Kaltura', 
        pricing: 'Custom ($300+/mo)', 
        softPricePoint: '$500/mo',
        threat: 'High',
        userBase: '1000+ ent',
        revenue: '$170M ARR',
        founded: 2006,
        yearsInMarket: 20,
        languages: 30,
        pros: ['Open source option', 'Feature-rich', 'Flexible', 'API-first'],
        cons: ['Overwhelming UI', 'Complex setup', 'Needs dev team', 'Hidden costs'],
        uxRating: 2,
        featureRating: 5,
        genieBetterAt: ['Simple UX', 'AI-first', 'No-code setup', 'Predictable pricing'],
        genieWorseAt: ['Feature depth', 'Open source option', 'API extensibility'],
      },
      { 
        name: 'Synthesia Enterprise', 
        pricing: 'Custom ($1000+/mo)', 
        softPricePoint: '$1500/mo',
        threat: 'Medium',
        userBase: '500+ ent',
        revenue: '$40M ARR',
        founded: 2017,
        yearsInMarket: 9,
        languages: 140,
        pros: ['AI avatars', 'Multi-language at scale', 'Training focus', 'SOC2 compliant'],
        cons: ['Very expensive', 'Robotic feel', 'Limited customization', 'No real video'],
        uxRating: 4,
        featureRating: 4,
        genieBetterAt: ['60% cheaper', 'Natural TTS + real presenter', 'Approval workflows', 'Mobile'],
        genieWorseAt: ['AI avatar quality', 'Language count', 'Training templates'],
      },
    ],
    painPoints: [
      '"Training videos are 3 years old" (L&D leaders)',
      '"Approval chains take weeks" (content teams)',
      '"Localization at scale is impossible" (global orgs)',
    ],
    genieAdvantage: [
      'White-label + full approval workflows',
      'Real-time collaboration with audit trails',
      'Multi-language automation at scale',
    ],
    genieDisadvantage: [
      'No M365 deep integration (yet)',
      'CDN options limited',
      'No open source option',
    ],
    improvementNeeded: ['Add M365 deep integration', 'Enterprise CDN options', 'Open source option'],
    appOpportunities: ['TrainBot', 'PolicyCaster', 'GlobalVoice'],
    integrations: ['Microsoft 365', 'Workday', 'Okta/Azure AD', 'n8n'],
    aiAgents: ['training_agent', 'compliance_agent', 'localization_agent', 'approval_workflow_agent'],
    userPreferences: { mobile: 20, desktop: 80, collaboration: 98 },
    softPricePoint: '$200-500/mo (team) or $50-100K/yr (enterprise)',
    marketPosition: 'Challenger',
  },
];
// Genie Differentiators - Enhanced with Pros AND Cons
const differentiators = [
  {
    icon: Layers,
    title: 'Unified Pipeline',
    description: 'Script → TTS → Record → Publish in one platform',
    competitors: 'Competitors require 3-5 tools',
    metric: '73%',
    metricLabel: 'users want "one app for everything"',
    pros: ['Single workflow', 'Faster time-to-publish', 'Lower total cost'],
    cons: ['Less depth in each area', 'Jack of all trades risk'],
  },
  {
    icon: MessageSquare,
    title: 'Real-time Collaboration',
    description: 'Two-way host/participant feedback with live status sync',
    competitors: 'Competitors rely on email chains',
    metric: '42%',
    metricLabel: 'want "team feedback without email"',
    pros: ['Faster approvals', 'Better team alignment', 'Audit trails'],
    cons: ['New behavior to learn', 'Requires team buy-in'],
  },
  {
    icon: RefreshCw,
    title: 'Bidirectional Flow',
    description: 'Content → AI Analysis → Enhanced Script → Production',
    competitors: 'One-way workflows only',
    metric: 'Unique',
    metricLabel: 'no competitor offers this',
    pros: ['Continuous improvement', 'Data-driven content', 'AI learning loop'],
    cons: ['Complex to explain', 'Requires content volume'],
  },
  {
    icon: Smartphone,
    title: 'Mobile-First',
    description: 'Full production suite on mobile with offline support',
    competitors: 'Desktop-only or limited mobile',
    metric: '68%',
    metricLabel: 'want mobile-first editing',
    pros: ['Create anywhere', 'Lower barrier', 'Gen-Z native'],
    cons: ['Some features harder on mobile', 'Desktop power users may feel limited'],
  },
  {
    icon: Shield,
    title: 'Healthcare Compliant',
    description: 'HIPAA-compliant AI video under $100/month',
    competitors: '$1000+/month for compliance',
    metric: '<$100',
    metricLabel: 'vs $1000+ competitors',
    pros: ['10x cheaper entry', 'Modern UX', 'AI-powered'],
    cons: ['No 50yr track record', 'Clinical library building'],
  },
  {
    icon: Globe,
    title: 'Multi-Language',
    description: 'AI translation and dubbing at scale',
    competitors: 'Manual or expensive services',
    metric: '15+',
    metricLabel: 'languages supported',
    pros: ['Affordable localization', 'AI consistency', 'Quick turnaround'],
    cons: ['Not 140 like Synthesia', 'Quality varies by language'],
  },
];

// Soft Price Points Summary
const softPricePoints = [
  { segment: 'Creator Economy', price: '$9-12/mo', competitors: 'CapCut Free, Descript $12, Loom $12.50', sweetSpot: '$10/mo' },
  { segment: 'Travel Experience', price: '$4-6/mo', competitors: 'InShot Free, GoPro Free', sweetSpot: '$5/mo or Free tier' },
  { segment: 'SMB Marketing', price: '$12-18/mo', competitors: 'Loom $12.50, Canva $13, Synthesia $22-67', sweetSpot: '$15/mo' },
  { segment: 'Education', price: '$6-10/mo', competitors: 'Edpuzzle Free, WeVideo $5-16, Panopto Custom', sweetSpot: '$8/mo or $2-3/student' },
  { segment: 'Healthcare', price: '$50-100/mo', competitors: 'Healthwise $50K+/yr, Emmi $30K+/yr', sweetSpot: '$75/mo provider tier' },
  { segment: 'Enterprise', price: '$200-500/mo', competitors: 'Brightcove $500+, Kaltura $300+, Synthesia $1000+', sweetSpot: '$300/mo team tier' },
];

// Roadmap phases - enhanced
const roadmapPhases = [
  { phase: 'P0', name: 'Core + Collaboration', status: 'completed', completion: 100, scenarios: 14, quarter: 'Q1 2026', focusSegments: ['Creator', 'SMB', 'Healthcare'] },
  { phase: 'P1', name: 'Mobile & Remix', status: 'in-progress', completion: 30, scenarios: 10, quarter: 'Q2 2026', focusSegments: ['Creator', 'Traveler'] },
  { phase: 'P2', name: 'Advanced Features', status: 'planned', completion: 10, scenarios: 10, quarter: 'Q3 2026', focusSegments: ['SMB', 'Education'] },
  { phase: 'P3', name: 'Segment-Specific', status: 'planned', completion: 0, scenarios: 10, quarter: 'Q4 2026', focusSegments: ['Healthcare', 'Enterprise'] },
  { phase: 'P4', name: 'Enterprise', status: 'planned', completion: 0, scenarios: 10, quarter: 'Q1 2027', focusSegments: ['Enterprise'] },
  { phase: 'P5', name: 'Innovation', status: 'planned', completion: 0, scenarios: 10, quarter: 'Q2 2027', focusSegments: ['All'] },
];

// Key metrics for investors
const keyMetrics = [
  { label: 'Total Addressable Market', value: '$150B+', icon: DollarSign },
  { label: 'Serviceable Market', value: '$37B', icon: Target },
  { label: 'Initial Target (SOM)', value: '$1.85B', icon: Zap },
  { label: 'Scenarios Implemented', value: '14/140', icon: Check },
  { label: 'AI Agents Ready', value: '12', icon: Lightbulb },
  { label: 'Integration Partners', value: '25+', icon: Globe },
];

// Competitive Position Summary
const competitivePosition = {
  strongerThan: ['Kapwing', 'WeVideo', 'InShot', 'GoPro Quik', 'Pictory'],
  parityWith: ['Riverside.fm', 'Edpuzzle', 'InVideo'],
  catchingUpTo: ['Loom', 'Descript', 'CapCut', 'Synthesia'],
  respectButDifferent: ['Canva', 'Panopto', 'Kaltura', 'Brightcove'],
};

export const GenieInvestorDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedSegment, setSelectedSegment] = useState<string | null>(null);
  const diagramRef = useRef<HTMLDivElement>(null);

  const handleDownloadPNG = async () => {
    if (!diagramRef.current) return;
    try {
      const html2canvasModule = await import('html2canvas');
      const canvas = await html2canvasModule.default(diagramRef.current, {
        backgroundColor: '#ffffff',
        scale: 2,
      });
      const link = document.createElement('a');
      link.download = `genie-investor-dashboard-${activeTab}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
      toast.success('Dashboard exported as PNG');
    } catch (error) {
      toast.error('Failed to export');
    }
  };

  const getSegmentById = (id: string) => segments.find(s => s.id === id);

  return (
    <Card className="w-full border border-border bg-card">
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <div>
          <CardTitle className="text-xl font-semibold flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            Genie Suite — Investor Dashboard
          </CardTitle>
          <CardDescription>
            Market Analysis • Competitive Landscape • User Analytics • Roadmap
          </CardDescription>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleDownloadPNG}>
            <Download className="h-4 w-4 mr-1" />
            Export
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-8 w-full mb-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="segments">6 Segments</TabsTrigger>
            <TabsTrigger value="competitors">Competitors</TabsTrigger>
            <TabsTrigger value="differentiators">Why Genie?</TabsTrigger>
            <TabsTrigger value="pricing">Pricing</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="roadmap">Roadmap</TabsTrigger>
            <TabsTrigger value="financials">TAM/SAM/SOM</TabsTrigger>
          </TabsList>

          <ScrollArea className="h-[650px]">
            <div ref={diagramRef} className="p-6 bg-white dark:bg-slate-900 rounded-lg space-y-6">
              
              {/* OVERVIEW TAB */}
              <TabsContent value="overview" className="space-y-6 mt-0">
                {/* Key Metrics */}
                <div className="grid grid-cols-6 gap-3">
                  {keyMetrics.map((metric, i) => (
                    <Card key={i} className="p-4 text-center">
                      <metric.icon className="h-6 w-6 mx-auto mb-2 text-primary" />
                      <div className="text-2xl font-bold text-foreground">{metric.value}</div>
                      <div className="text-xs text-muted-foreground">{metric.label}</div>
                    </Card>
                  ))}
                </div>

                {/* Quick Segment Summary */}
                <Card className="p-4">
                  <h3 className="font-semibold mb-4 flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    Market Segments at a Glance
                  </h3>
                  <div className="grid grid-cols-6 gap-3">
                    {segments.map((seg) => (
                      <div
                        key={seg.id}
                        className={cn(
                          "p-3 rounded-lg border cursor-pointer transition-all hover:scale-105",
                          seg.bgColor,
                          selectedSegment === seg.id && "ring-2 ring-primary"
                        )}
                        onClick={() => setSelectedSegment(seg.id === selectedSegment ? null : seg.id)}
                      >
                        <seg.icon className="h-6 w-6 mb-2" />
                        <div className="font-semibold text-sm">{seg.name}</div>
                        <div className="text-xs text-muted-foreground">{seg.marketSize}</div>
                        <Badge variant="outline" className="mt-2 text-xs">
                          {seg.collaboration} Collab
                        </Badge>
                      </div>
                    ))}
                  </div>
                </Card>

                {/* Competitive Advantage Summary */}
                <Card className="p-4 bg-gradient-to-r from-primary/5 to-primary/10">
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <Award className="h-5 w-5 text-primary" />
                    Why Genie Wins
                  </h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-primary">73%</div>
                      <div className="text-sm text-muted-foreground">Want unified platform</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-green-500">42%</div>
                      <div className="text-sm text-muted-foreground">Need team collaboration</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-blue-500">68%</div>
                      <div className="text-sm text-muted-foreground">Prefer mobile-first</div>
                    </div>
                  </div>
                </Card>

                {/* Implementation Progress */}
                <Card className="p-4">
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Implementation Progress
                  </h3>
                  <div className="space-y-3">
                    {roadmapPhases.slice(0, 3).map((phase) => (
                      <div key={phase.phase} className="flex items-center gap-4">
                        <Badge variant={phase.status === 'completed' ? 'default' : phase.status === 'in-progress' ? 'secondary' : 'outline'}>
                          {phase.phase}
                        </Badge>
                        <div className="flex-1">
                          <div className="flex justify-between text-sm mb-1">
                            <span>{phase.name}</span>
                            <span>{phase.completion}%</span>
                          </div>
                          <Progress value={phase.completion} className="h-2" />
                        </div>
                        <span className="text-xs text-muted-foreground">{phase.scenarios} scenarios</span>
                      </div>
                    ))}
                  </div>
                </Card>
              </TabsContent>

              {/* SEGMENTS TAB - Enhanced with Pros/Cons */}
              <TabsContent value="segments" className="space-y-4 mt-0">
                <div className="grid grid-cols-2 gap-4">
                  {segments.map((seg) => (
                    <Card key={seg.id} className={cn("p-4", seg.bgColor)}>
                      <div className="flex items-center gap-3 mb-3">
                        <seg.icon className="h-8 w-8" />
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold">{seg.name}</h3>
                            <Badge variant={seg.marketPosition === 'Blue Ocean' ? 'default' : seg.marketPosition === 'Disruptor' ? 'secondary' : 'outline'} className="text-xs">
                              {seg.marketPosition}
                            </Badge>
                          </div>
                          <div className="flex gap-2 mt-1">
                            <Badge variant="outline" className="text-xs">{seg.marketSize}</Badge>
                            <Badge variant="outline" className="text-xs">{seg.growthRate}</Badge>
                            <Badge className="text-xs">{seg.softPricePoint}</Badge>
                          </div>
                        </div>
                      </div>
                      
                      {/* Pain Points */}
                      <div className="mb-2">
                        <div className="text-xs font-semibold text-muted-foreground mb-1">Top Pain Points:</div>
                        {seg.painPoints.slice(0, 2).map((pain, i) => (
                          <div key={i} className="text-xs italic text-muted-foreground truncate">{pain}</div>
                        ))}
                      </div>

                      {/* Genie Advantage vs Disadvantage */}
                      <div className="grid grid-cols-2 gap-2 mb-3">
                        <div>
                          <div className="text-xs font-semibold text-green-600 mb-1">✓ Genie Advantage</div>
                          {seg.genieAdvantage.slice(0, 2).map((adv, i) => (
                            <div key={i} className="text-xs flex items-start gap-1">
                              <Check className="h-3 w-3 text-green-500 mt-0.5 shrink-0" />
                              <span className="line-clamp-1">{adv}</span>
                            </div>
                          ))}
                        </div>
                        <div>
                          <div className="text-xs font-semibold text-amber-600 mb-1">⚠ Improvement Needed</div>
                          {seg.genieDisadvantage?.slice(0, 2).map((dis, i) => (
                            <div key={i} className="text-xs flex items-start gap-1">
                              <AlertCircle className="h-3 w-3 text-amber-500 mt-0.5 shrink-0" />
                              <span className="line-clamp-1">{dis}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Competitors with threat */}
                      <div className="mb-3">
                        <div className="text-xs font-semibold text-red-600 mb-1">Key Competitors ({seg.competitors.length}):</div>
                        <div className="flex flex-wrap gap-1">
                          {seg.competitors.slice(0, 3).map((c, i) => (
                            <Badge 
                              key={i} 
                              variant={c.threat === 'High' ? 'destructive' : 'outline'} 
                              className="text-xs"
                            >
                              {c.name} {c.threat === 'High' && '🔥'}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      {/* User Preferences */}
                      <div className="grid grid-cols-3 gap-2 text-center border-t pt-2">
                        <div>
                          <div className="text-sm font-bold">{seg.userPreferences.mobile}%</div>
                          <div className="text-xs text-muted-foreground">📱 Mobile</div>
                        </div>
                        <div>
                          <div className="text-sm font-bold">{seg.userPreferences.desktop}%</div>
                          <div className="text-xs text-muted-foreground">🖥️ Desktop</div>
                        </div>
                        <div>
                          <div className="text-sm font-bold">{seg.userPreferences.collaboration}%</div>
                          <div className="text-xs text-muted-foreground">👥 Collab</div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              {/* COMPETITORS TAB - NEW */}
              <TabsContent value="competitors" className="space-y-4 mt-0">
                {/* Competitive Position Overview */}
                <Card className="p-4 bg-gradient-to-r from-green-500/5 to-red-500/5">
                  <h3 className="font-semibold mb-4 flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    Genie Competitive Position
                  </h3>
                  <div className="grid grid-cols-4 gap-4">
                    <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
                      <div className="text-sm font-semibold text-green-700 dark:text-green-300 mb-2">✅ Stronger Than</div>
                      <div className="flex flex-wrap gap-1">
                        {competitivePosition.strongerThan.map((c, i) => (
                          <Badge key={i} variant="outline" className="text-xs bg-green-50">{c}</Badge>
                        ))}
                      </div>
                    </div>
                    <div className="p-3 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
                      <div className="text-sm font-semibold text-amber-700 dark:text-amber-300 mb-2">⚖️ At Parity</div>
                      <div className="flex flex-wrap gap-1">
                        {competitivePosition.parityWith.map((c, i) => (
                          <Badge key={i} variant="outline" className="text-xs bg-amber-50">{c}</Badge>
                        ))}
                      </div>
                    </div>
                    <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                      <div className="text-sm font-semibold text-orange-700 dark:text-orange-300 mb-2">🏃 Catching Up To</div>
                      <div className="flex flex-wrap gap-1">
                        {competitivePosition.catchingUpTo.map((c, i) => (
                          <Badge key={i} variant="outline" className="text-xs bg-orange-50">{c}</Badge>
                        ))}
                      </div>
                    </div>
                    <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                      <div className="text-sm font-semibold text-blue-700 dark:text-blue-300 mb-2">🎯 Different Focus</div>
                      <div className="flex flex-wrap gap-1">
                        {competitivePosition.respectButDifferent.map((c, i) => (
                          <Badge key={i} variant="outline" className="text-xs bg-blue-50">{c}</Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </Card>

                {/* Detailed Competitor Analysis by Segment */}
                {segments.map((seg) => (
                  <Card key={seg.id} className={cn("p-4", seg.bgColor)}>
                    <div className="flex items-center gap-2 mb-4">
                      <seg.icon className="h-6 w-6" />
                      <h3 className="font-semibold">{seg.name} Competitors</h3>
                      <Badge variant="outline">{seg.competitors.length} players</Badge>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      {seg.competitors.map((comp, i) => (
                        <div key={i} className="p-3 bg-white dark:bg-slate-800 rounded-lg border">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold">{comp.name}</span>
                              <Badge variant={comp.threat === 'High' ? 'destructive' : comp.threat === 'Medium' ? 'secondary' : 'outline'} className="text-xs">
                                {comp.threat} Threat
                              </Badge>
                            </div>
                            <span className="text-sm font-medium text-primary">{comp.pricing}</span>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-2 text-xs mb-2">
                            <div><span className="text-muted-foreground">Users:</span> {comp.userBase}</div>
                            <div><span className="text-muted-foreground">Revenue:</span> {comp.revenue}</div>
                            <div><span className="text-muted-foreground">Founded:</span> {comp.founded} ({comp.yearsInMarket}yr)</div>
                            <div><span className="text-muted-foreground">Languages:</span> {comp.languages}</div>
                          </div>

                          {/* UX & Feature Ratings */}
                          <div className="flex gap-4 mb-2">
                            <div className="flex items-center gap-1">
                              <span className="text-xs text-muted-foreground">UX:</span>
                              {[1,2,3,4,5].map(n => (
                                <Star key={n} className={cn("h-3 w-3", n <= comp.uxRating ? "text-yellow-500 fill-yellow-500" : "text-gray-300")} />
                              ))}
                            </div>
                            <div className="flex items-center gap-1">
                              <span className="text-xs text-muted-foreground">Features:</span>
                              {[1,2,3,4,5].map(n => (
                                <Star key={n} className={cn("h-3 w-3", n <= comp.featureRating ? "text-blue-500 fill-blue-500" : "text-gray-300")} />
                              ))}
                            </div>
                          </div>

                          {/* Pros & Cons */}
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <div className="text-xs font-semibold text-green-600 mb-1">Their Pros:</div>
                              {comp.pros.slice(0, 2).map((p, j) => (
                                <div key={j} className="text-xs flex items-start gap-1">
                                  <Check className="h-3 w-3 text-green-500 mt-0.5 shrink-0" />
                                  <span className="line-clamp-1">{p}</span>
                                </div>
                              ))}
                            </div>
                            <div>
                              <div className="text-xs font-semibold text-red-600 mb-1">Their Cons:</div>
                              {comp.cons.slice(0, 2).map((c, j) => (
                                <div key={j} className="text-xs flex items-start gap-1">
                                  <X className="h-3 w-3 text-red-500 mt-0.5 shrink-0" />
                                  <span className="line-clamp-1">{c}</span>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Genie vs This Competitor */}
                          <div className="mt-2 pt-2 border-t grid grid-cols-2 gap-2">
                            <div>
                              <div className="text-xs font-semibold text-primary mb-1">Genie Better At:</div>
                              {comp.genieBetterAt.slice(0, 2).map((g, j) => (
                                <div key={j} className="text-xs text-primary">• {g}</div>
                              ))}
                            </div>
                            <div>
                              <div className="text-xs font-semibold text-muted-foreground mb-1">Genie Improving:</div>
                              {comp.genieWorseAt.slice(0, 2).map((g, j) => (
                                <div key={j} className="text-xs text-muted-foreground">• {g}</div>
                              ))}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>
                ))}
              </TabsContent>

              {/* DIFFERENTIATORS TAB - Enhanced with Pros/Cons */}
              <TabsContent value="differentiators" className="space-y-4 mt-0">
                <div className="grid grid-cols-2 gap-4">
                  {differentiators.map((diff, i) => (
                    <Card key={i} className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-lg bg-primary/10">
                          <diff.icon className="h-6 w-6 text-primary" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold">{diff.title}</h3>
                          <p className="text-sm text-muted-foreground mb-2">{diff.description}</p>
                          <div className="flex items-center gap-2 text-xs mb-2">
                            <X className="h-3 w-3 text-red-500" />
                            <span className="text-red-600">{diff.competitors}</span>
                          </div>
                          {/* Pros/Cons for this differentiator */}
                          <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t">
                            <div>
                              <div className="text-xs font-medium text-green-600 mb-1">Pros:</div>
                              {diff.pros.map((p, j) => (
                                <div key={j} className="text-xs text-muted-foreground">+ {p}</div>
                              ))}
                            </div>
                            <div>
                              <div className="text-xs font-medium text-amber-600 mb-1">Cons:</div>
                              {diff.cons.map((c, j) => (
                                <div key={j} className="text-xs text-muted-foreground">- {c}</div>
                              ))}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-primary">{diff.metric}</div>
                          <div className="text-xs text-muted-foreground">{diff.metricLabel}</div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>

                {/* NEW: Collaboration Feature Highlight */}
                <Card className="p-4 bg-gradient-to-r from-green-500/10 to-emerald-500/10 border-green-500/30">
                  <h3 className="font-semibold mb-3 flex items-center gap-2 text-green-700">
                    <MessageSquare className="h-5 w-5" />
                    NEW: Two-Way Session Collaboration (Just Launched)
                  </h3>
                  <div className="grid grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-2xl">📝</div>
                      <div className="text-sm font-medium">Suggestion Box</div>
                      <div className="text-xs text-muted-foreground">Script, title, recording feedback</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl">🔄</div>
                      <div className="text-sm font-medium">Live Status Sync</div>
                      <div className="text-xs text-muted-foreground">ARC ↔ Production Hub</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl">🔔</div>
                      <div className="text-sm font-medium">Push/Pull Notifications</div>
                      <div className="text-xs text-muted-foreground">Host & participant alerts</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl">✅</div>
                      <div className="text-sm font-medium">Approval Workflow</div>
                      <div className="text-xs text-muted-foreground">Multi-stage review</div>
                    </div>
                  </div>
                </Card>
              </TabsContent>

              {/* PRICING TAB - NEW */}
              <TabsContent value="pricing" className="space-y-4 mt-0">
                {/* Soft Price Points by Segment */}
                <Card className="p-4">
                  <h3 className="font-semibold mb-4 flex items-center gap-2">
                    <DollarSign className="h-5 w-5" />
                    Soft Price Points by Segment
                  </h3>
                  <div className="space-y-3">
                    {softPricePoints.map((sp, i) => (
                      <div key={i} className="p-3 bg-muted/50 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium">{sp.segment}</span>
                          <Badge variant="default" className="text-sm">{sp.sweetSpot}</Badge>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-muted-foreground">Genie Range: </span>
                            <span className="font-medium text-primary">{sp.price}</span>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Competitors: {sp.competitors}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>

                {/* Competitor Pricing Comparison */}
                <Card className="p-4">
                  <h3 className="font-semibold mb-4">Competitor Pricing Landscape</h3>
                  <div className="grid grid-cols-3 gap-4">
                    {/* Free Tier */}
                    <div className="p-3 border rounded-lg">
                      <div className="font-semibold text-green-600 mb-2">Free / Freemium</div>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between"><span>CapCut</span><span>Free</span></div>
                        <div className="flex justify-between"><span>InShot</span><span>Free (ads)</span></div>
                        <div className="flex justify-between"><span>Edpuzzle</span><span>Free tier</span></div>
                        <div className="flex justify-between"><span>Loom</span><span>Free (limited)</span></div>
                        <div className="flex justify-between text-primary font-medium"><span>Genie</span><span>Free tier</span></div>
                      </div>
                    </div>
                    {/* Mid-Tier */}
                    <div className="p-3 border rounded-lg bg-primary/5">
                      <div className="font-semibold text-primary mb-2">$10-30/mo (Sweet Spot)</div>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between"><span>Loom</span><span>$12.50/mo</span></div>
                        <div className="flex justify-between"><span>Descript</span><span>$12-24/mo</span></div>
                        <div className="flex justify-between"><span>Canva</span><span>$12.99/mo</span></div>
                        <div className="flex justify-between"><span>Pictory</span><span>$19-39/mo</span></div>
                        <div className="flex justify-between text-primary font-medium"><span>Genie</span><span>$9.99-29.99/mo</span></div>
                      </div>
                    </div>
                    {/* Enterprise */}
                    <div className="p-3 border rounded-lg">
                      <div className="font-semibold text-amber-600 mb-2">Enterprise / Custom</div>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between"><span>Synthesia</span><span>$22-1000+/mo</span></div>
                        <div className="flex justify-between"><span>Panopto</span><span>$2-5/user</span></div>
                        <div className="flex justify-between"><span>Brightcove</span><span>$500+/mo</span></div>
                        <div className="flex justify-between"><span>Healthwise</span><span>$50K+/yr</span></div>
                        <div className="flex justify-between text-primary font-medium"><span>Genie</span><span>Custom</span></div>
                      </div>
                    </div>
                  </div>
                </Card>

                {/* Pricing Strategy Recommendations */}
                <Card className="p-4 bg-gradient-to-r from-primary/5 to-primary/10">
                  <h3 className="font-semibold mb-4">💡 Pricing Strategy Recommendations</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium text-green-600 mb-2">✅ Undercut Opportunities</h4>
                      <ul className="text-sm space-y-1">
                        <li>• Synthesia ($22-67) → Genie $15-20 (save 30-70%)</li>
                        <li>• Descript ($24) → Genie $12-15 (save 40%)</li>
                        <li>• Healthwise ($50K+) → Genie $5-15K (save 70-90%)</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-medium text-amber-600 mb-2">⚠️ Price Sensitive Segments</h4>
                      <ul className="text-sm space-y-1">
                        <li>• Creators: Free tier critical (CapCut dominates)</li>
                        <li>• Travelers: &lt;$5/mo or free (InShot baseline)</li>
                        <li>• Education: Institutional pricing expected</li>
                      </ul>
                    </div>
                  </div>
                </Card>
              </TabsContent>

              {/* ANALYTICS TAB */}
              <TabsContent value="analytics" className="space-y-4 mt-0">
                {/* User Preference Charts */}
                <div className="grid grid-cols-2 gap-4">
                  <Card className="p-4">
                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                      <Smartphone className="h-5 w-5" />
                      Platform Preference by Segment
                    </h3>
                    <div className="space-y-3">
                      {segments.map((seg) => (
                        <div key={seg.id} className="space-y-1">
                          <div className="flex justify-between text-sm">
                            <span>{seg.name}</span>
                            <span className="text-muted-foreground">
                              📱 {seg.userPreferences.mobile}% | 🖥️ {seg.userPreferences.desktop}%
                            </span>
                          </div>
                          <div className="flex h-2 rounded-full overflow-hidden bg-muted">
                            <div 
                              className="bg-blue-500" 
                              style={{ width: `${seg.userPreferences.mobile}%` }}
                            />
                            <div 
                              className="bg-gray-400" 
                              style={{ width: `${seg.userPreferences.desktop}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>

                  <Card className="p-4">
                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                      <Users className="h-5 w-5" />
                      Collaboration Need by Segment
                    </h3>
                    <div className="space-y-3">
                      {segments.map((seg) => (
                        <div key={seg.id} className="space-y-1">
                          <div className="flex justify-between text-sm">
                            <span>{seg.name}</span>
                            <span className={cn(
                              seg.userPreferences.collaboration > 80 ? "text-green-600 font-semibold" :
                              seg.userPreferences.collaboration > 50 ? "text-amber-600" : "text-muted-foreground"
                            )}>
                              {seg.userPreferences.collaboration}%
                            </span>
                          </div>
                          <Progress 
                            value={seg.userPreferences.collaboration} 
                            className="h-2"
                          />
                        </div>
                      ))}
                    </div>
                  </Card>
                </div>

                {/* User Research Quotes */}
                <Card className="p-4">
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <MessageSquare className="h-5 w-5" />
                    User Research Highlights
                  </h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                      <div className="text-3xl mb-2">73%</div>
                      <div className="text-sm font-medium">"One app for everything"</div>
                      <div className="text-xs text-muted-foreground">Want unified platform</div>
                    </div>
                    <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <div className="text-3xl mb-2">42%</div>
                      <div className="text-sm font-medium">"No more email chains"</div>
                      <div className="text-xs text-muted-foreground">Want team feedback</div>
                    </div>
                    <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <div className="text-3xl mb-2">38%</div>
                      <div className="text-sm font-medium">"Know when approved"</div>
                      <div className="text-xs text-muted-foreground">Want real-time status</div>
                    </div>
                  </div>
                </Card>

                {/* AI Agents Summary */}
                <Card className="p-4">
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <Lightbulb className="h-5 w-5" />
                    AI Agents by Segment (12 Total)
                  </h3>
                  <div className="grid grid-cols-6 gap-2">
                    {segments.map((seg) => (
                      <div key={seg.id} className={cn("p-2 rounded-lg text-center", seg.bgColor)}>
                        <seg.icon className="h-5 w-5 mx-auto mb-1" />
                        <div className="text-xs font-medium">{seg.name}</div>
                        <div className="text-lg font-bold">{seg.aiAgents.length}</div>
                        <div className="text-xs text-muted-foreground">agents</div>
                      </div>
                    ))}
                  </div>
                </Card>
              </TabsContent>

              {/* ROADMAP TAB */}
              <TabsContent value="roadmap" className="space-y-4 mt-0">
                <div className="space-y-4">
                  {roadmapPhases.map((phase, i) => (
                    <Card 
                      key={phase.phase} 
                      className={cn(
                        "p-4",
                        phase.status === 'completed' && "bg-green-50 dark:bg-green-900/20 border-green-500/30",
                        phase.status === 'in-progress' && "bg-amber-50 dark:bg-amber-900/20 border-amber-500/30",
                        phase.status === 'planned' && "bg-muted/50"
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <Badge 
                            variant={phase.status === 'completed' ? 'default' : phase.status === 'in-progress' ? 'secondary' : 'outline'}
                            className="text-lg px-3 py-1"
                          >
                            {phase.phase}
                          </Badge>
                          <div>
                            <h3 className="font-semibold">{phase.name}</h3>
                            <div className="flex gap-2 text-sm text-muted-foreground">
                              <span>{phase.scenarios} scenarios</span>
                              <span>•</span>
                              <span>{phase.quarter}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="w-32">
                            <Progress value={phase.completion} className="h-3" />
                          </div>
                          <span className="font-bold text-lg">{phase.completion}%</span>
                          {phase.status === 'completed' && <Check className="h-6 w-6 text-green-500" />}
                          {phase.status === 'in-progress' && <Clock className="h-6 w-6 text-amber-500" />}
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>

                {/* Timeline Visual */}
                <Card className="p-4">
                  <h3 className="font-semibold mb-4">18-Month Timeline</h3>
                  <div className="flex items-center justify-between">
                    {roadmapPhases.map((phase, i) => (
                      <React.Fragment key={phase.phase}>
                        <div className="text-center">
                          <div className={cn(
                            "w-12 h-12 rounded-full flex items-center justify-center font-bold text-white",
                            phase.status === 'completed' && "bg-green-500",
                            phase.status === 'in-progress' && "bg-amber-500",
                            phase.status === 'planned' && "bg-gray-300"
                          )}>
                            {phase.phase}
                          </div>
                          <div className="text-xs mt-1">{phase.quarter}</div>
                        </div>
                        {i < roadmapPhases.length - 1 && (
                          <ArrowRight className="h-6 w-6 text-muted-foreground" />
                        )}
                      </React.Fragment>
                    ))}
                  </div>
                </Card>
              </TabsContent>

              {/* FINANCIALS TAB */}
              <TabsContent value="financials" className="space-y-4 mt-0">
                {/* TAM/SAM/SOM Summary */}
                <Card className="p-6 bg-gradient-to-r from-primary/5 to-primary/10">
                  <h3 className="font-semibold mb-4 text-xl">Total Addressable Market Analysis</h3>
                  <div className="grid grid-cols-3 gap-8 text-center">
                    <div>
                      <div className="text-4xl font-bold text-primary">$150B+</div>
                      <div className="text-lg font-medium">TAM</div>
                      <div className="text-sm text-muted-foreground">Total Addressable Market</div>
                    </div>
                    <div>
                      <div className="text-4xl font-bold text-green-500">$37B</div>
                      <div className="text-lg font-medium">SAM</div>
                      <div className="text-sm text-muted-foreground">Serviceable Addressable Market</div>
                    </div>
                    <div>
                      <div className="text-4xl font-bold text-amber-500">$1.85B</div>
                      <div className="text-lg font-medium">SOM</div>
                      <div className="text-sm text-muted-foreground">Serviceable Obtainable Market</div>
                    </div>
                  </div>
                </Card>

                {/* By Segment */}
                <Card className="p-4">
                  <h3 className="font-semibold mb-4">Market Size by Segment</h3>
                  <div className="space-y-4">
                    {segments.map((seg) => (
                      <div key={seg.id} className="flex items-center gap-4">
                        <seg.icon className="h-6 w-6" />
                        <div className="flex-1">
                          <div className="flex justify-between mb-1">
                            <span className="font-medium">{seg.name}</span>
                            <span className="text-sm">{seg.marketSize} TAM</span>
                          </div>
                          <div className="flex gap-2 text-xs text-muted-foreground">
                            <span>SAM: {seg.sam}</span>
                            <span>•</span>
                            <span>SOM: {seg.som}</span>
                            <span>•</span>
                            <span className="text-green-600">{seg.growthRate} YoY</span>
                          </div>
                        </div>
                        <Badge variant={seg.priority === 'P0' ? 'default' : 'outline'}>
                          {seg.priority}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </Card>

                {/* Revenue Model */}
                <Card className="p-4">
                  <h3 className="font-semibold mb-4">Subscription Tiers</h3>
                  <div className="grid grid-cols-5 gap-3">
                    {[
                      { tier: 'Free', price: '$0', target: 'Trial', collab: 'None' },
                      { tier: 'Starter', price: '$9.99/mo', target: 'Creator/Traveler', collab: 'Basic' },
                      { tier: 'Business', price: '$29.99/mo', target: 'SMB', collab: 'Standard' },
                      { tier: 'Pro', price: '$79.99/mo', target: 'Education', collab: 'Full' },
                      { tier: 'Enterprise', price: 'Custom', target: 'Healthcare/Enterprise', collab: 'Full' },
                    ].map((tier, i) => (
                      <div key={tier.tier} className={cn(
                        "p-3 rounded-lg border text-center",
                        i === 2 && "border-primary bg-primary/5"
                      )}>
                        <div className="font-bold">{tier.tier}</div>
                        <div className="text-xl font-bold text-primary">{tier.price}</div>
                        <div className="text-xs text-muted-foreground">{tier.target}</div>
                        <Badge variant="outline" className="mt-2 text-xs">
                          {tier.collab} Collab
                        </Badge>
                      </div>
                    ))}
                  </div>
                </Card>
              </TabsContent>
            </div>
          </ScrollArea>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default GenieInvestorDashboard;
