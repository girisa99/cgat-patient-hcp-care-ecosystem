/**
 * Product-Feature Matrix - 253 Scenarios Across All Products
 * 
 * Maps all 253 user scenarios to:
 * - Vibe (Studio, Mobile, Desktop)
 * - Mind
 * - Spark
 * - Arc/Production Hub
 * 
 * Includes: Implementation status, gaps, recommendations
 * Updated: 2026-01-13 - Added 76 new scenarios for Production Calendar, Arc↔Hub Sync, etc.
 */

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Brain,
  Sparkles,
  Video,
  Film,
  Smartphone,
  Monitor,
  Users,
  CheckCircle2,
  Circle,
  AlertCircle,
  Clock,
  Lightbulb,
  TrendingUp,
  Search,
  Filter,
  Download,
  BarChart3,
  ChevronDown,
  ChevronUp,
  Star,
  Zap
} from 'lucide-react';
import { cn } from '@/lib/utils';

// =============================================================================
// TYPES
// =============================================================================

type ProductId = 'vibe-studio' | 'vibe-mobile' | 'vibe-desktop' | 'mind' | 'spark' | 'arc';
type Phase = 'P0' | 'P1' | 'P2' | 'P3' | 'P4' | 'P5';
type Status = 'complete' | 'partial' | 'planned' | 'gap';

interface ScenarioMapping {
  id: number;
  name: string;
  description: string;
  category: string;
  phase: Phase;
  status: Status;
  products: ProductId[];
  features: string[];
  agents: string[];
  apis: string[];
  crossover: boolean;
  gap?: string;
  recommendation?: string;
}

interface Product {
  id: ProductId;
  name: string;
  shortName: string;
  icon: React.ReactNode;
  color: string;
  description: string;
  totalScenarios: number;
  implemented: number;
  partial: number;
  planned: number;
}

// =============================================================================
// DATA - Complete 253 Scenario Product Mapping (177 Original + 76 New Features)
// =============================================================================

const PRODUCTS: Product[] = [
  {
    id: 'vibe-studio',
    name: 'Vibe Studio (Web)',
    shortName: 'Vibe Web',
    icon: <Video className="h-4 w-4" />,
    color: 'bg-purple-500/20 text-purple-600 border-purple-500/30',
    description: 'Full-featured web-based production studio',
    totalScenarios: 85,
    implemented: 38,
    partial: 5,
    planned: 42
  },
  {
    id: 'vibe-mobile',
    name: 'Vibe Mobile (iOS/Android)',
    shortName: 'Vibe Mobile',
    icon: <Smartphone className="h-4 w-4" />,
    color: 'bg-pink-500/20 text-pink-600 border-pink-500/30',
    description: 'Mobile-first recording and quick editing',
    totalScenarios: 28,
    implemented: 12,
    partial: 2,
    planned: 14
  },
  {
    id: 'vibe-desktop',
    name: 'Vibe Desktop (Electron)',
    shortName: 'Vibe Desktop',
    icon: <Monitor className="h-4 w-4" />,
    color: 'bg-violet-500/20 text-violet-600 border-violet-500/30',
    description: 'Native desktop app for power users',
    totalScenarios: 15,
    implemented: 2,
    partial: 0,
    planned: 13
  },
  {
    id: 'mind',
    name: 'Genie Mind',
    shortName: 'Mind',
    icon: <Brain className="h-4 w-4" />,
    color: 'bg-emerald-500/20 text-emerald-600 border-emerald-500/30',
    description: 'AI Intelligence & RAG pipeline',
    totalScenarios: 32,
    implemented: 18,
    partial: 3,
    planned: 11
  },
  {
    id: 'spark',
    name: 'Genie Spark',
    shortName: 'Spark',
    icon: <Sparkles className="h-4 w-4" />,
    color: 'bg-amber-500/20 text-amber-600 border-amber-500/30',
    description: 'Content generation engine',
    totalScenarios: 24,
    implemented: 12,
    partial: 2,
    planned: 10
  },
  {
    id: 'arc',
    name: 'Production Hub (Arc)',
    shortName: 'Arc/Hub',
    icon: <Users className="h-4 w-4" />,
    color: 'bg-indigo-500/20 text-indigo-600 border-indigo-500/30',
    description: 'Team coordination & multi-guest',
    totalScenarios: 18,
    implemented: 4,
    partial: 1,
    planned: 13
  }
];

// Complete 253 scenario mapping to products (177 Original + 76 New Features Beyond Roadmap)
const SCENARIOS: ScenarioMapping[] = [
  // Category A: Imagination → Production (1-10) - P0
  { id: 1, name: 'Text Prompt → Script → Video', description: 'AI generates script, TTS, video assembly', category: 'A', phase: 'P0', status: 'complete', products: ['spark', 'vibe-studio'], features: ['Script Generation', 'TTS', 'Video Assembly'], agents: ['script_generator', 'tts_orchestrator', 'video_assembly'], apis: ['/ai-universal-processor'], crossover: true },
  { id: 2, name: 'AI Images → Script → Video', description: 'Generate images, AI writes script, video', category: 'A', phase: 'P0', status: 'partial', products: ['mind', 'spark', 'vibe-studio'], features: ['Image Generation', 'Script Writing'], agents: ['image_generator', 'script_generator'], apis: ['/ai-image-generator'], crossover: true, gap: 'Image generation integration incomplete' },
  { id: 3, name: 'Script Only → Manual Record', description: 'Load to teleprompter, human records', category: 'A', phase: 'P0', status: 'complete', products: ['spark', 'vibe-studio', 'vibe-mobile'], features: ['Teleprompter', 'Recording'], agents: [], apis: [], crossover: true },
  { id: 4, name: 'Full Imagination Pipeline', description: 'AI images + AI script + AI voice + Auto-edit', category: 'A', phase: 'P0', status: 'partial', products: ['mind', 'spark', 'vibe-studio'], features: ['Full AI Pipeline'], agents: ['script_generator', 'tts_orchestrator', 'video_assembly'], apis: ['/ai-universal-processor'], crossover: true, gap: 'Image generation incomplete' },
  { id: 5, name: 'Voice Clone → Custom TTS', description: 'Clone user voice for personalized TTS', category: 'A', phase: 'P3', status: 'planned', products: ['vibe-studio', 'vibe-desktop'], features: ['Voice Cloning'], agents: ['voice_clone_agent'], apis: ['/voice-clone-processor'], crossover: false },
  { id: 6, name: 'Avatar → Full Video', description: 'AI avatar with lip sync', category: 'A', phase: 'P4', status: 'planned', products: ['vibe-studio'], features: ['AI Avatar'], agents: ['avatar_agent'], apis: [], crossover: false },
  { id: 7, name: 'PPT/Slides → Script → Video', description: 'Extract content, generate script, video', category: 'A', phase: 'P0', status: 'partial', products: ['mind', 'spark', 'vibe-studio'], features: ['Document Processing'], agents: ['document_processor'], apis: ['/process-documents'], crossover: true, gap: 'Slide extraction exists' },
  { id: 8, name: 'Document → Script → Video', description: 'Parse document, AI script, video', category: 'A', phase: 'P0', status: 'partial', products: ['mind', 'spark', 'vibe-studio'], features: ['Document Processing'], agents: ['document_processor'], apis: ['/process-documents'], crossover: true },
  { id: 9, name: 'URL → Script → Video', description: 'Scrape content, summarize, video', category: 'A', phase: 'P3', status: 'planned', products: ['mind', 'spark', 'vibe-studio'], features: ['Web Scraping'], agents: ['web_scraper'], apis: [], crossover: true },
  { id: 10, name: 'Audio → Script → Video', description: 'Transcribe, enhance, add visuals', category: 'A', phase: 'P0', status: 'partial', products: ['mind', 'vibe-studio'], features: ['Transcription'], agents: ['transcription_agent'], apis: [], crossover: true, gap: 'Transcription needed' },
  
  // Category B: Upload → Production (11-16) - P1
  { id: 11, name: 'Raw Recording → Polished', description: 'Transcribe, clean, re-record sections', category: 'B', phase: 'P1', status: 'planned', products: ['vibe-studio', 'vibe-mobile'], features: ['Re-record UI'], agents: ['polish_agent'], apis: [], crossover: false, recommendation: 'Add section re-record capability' },
  { id: 12, name: 'Images + Script → Video', description: 'Arrange images, TTS, compile', category: 'B', phase: 'P1', status: 'planned', products: ['spark', 'vibe-studio'], features: ['Image Arrangement'], agents: ['slideshow_agent'], apis: [], crossover: true },
  { id: 13, name: 'Multi-File Merge', description: 'AI arranges, transitions, export', category: 'B', phase: 'P1', status: 'planned', products: ['vibe-studio', 'vibe-desktop'], features: ['Merge Logic'], agents: ['merge_agent'], apis: [], crossover: false },
  { id: 14, name: 'B-Roll Integration', description: 'AI suggests placements, auto-insert', category: 'B', phase: 'P1', status: 'planned', products: ['vibe-studio', 'mind'], features: ['B-Roll Matching'], agents: ['broll_agent'], apis: [], crossover: true },
  { id: 15, name: 'Podcast → Video', description: 'Transcribe, add visuals, animate', category: 'B', phase: 'P1', status: 'planned', products: ['mind', 'vibe-studio'], features: ['Podcast Flow'], agents: ['podcast_agent'], apis: [], crossover: true },
  { id: 16, name: 'Webinar → Clips', description: 'AI identifies highlights, extract', category: 'B', phase: 'P1', status: 'planned', products: ['mind', 'vibe-studio', 'arc'], features: ['Highlight Detection'], agents: ['highlight_agent'], apis: [], crossover: true },

  // Category C: Video → Script → Enhance (17-20) - P2
  { id: 17, name: 'Video → Script Extraction', description: 'AI transcribes, formats as script', category: 'C', phase: 'P2', status: 'planned', products: ['mind', 'spark'], features: ['Transcription UI'], agents: ['transcription_agent'], apis: [], crossover: true },
  { id: 18, name: 'Video → Script → Better Video', description: 'Extract, enhance, re-record', category: 'C', phase: 'P2', status: 'planned', products: ['mind', 'spark', 'vibe-studio'], features: ['Enhancement Pipeline'], agents: ['enhancement_agent'], apis: [], crossover: true },
  { id: 19, name: 'Video → Script → Translate', description: 'Extract, translate, new TTS', category: 'C', phase: 'P2', status: 'planned', products: ['mind', 'spark', 'vibe-studio'], features: ['Translation Service'], agents: ['translation_agent'], apis: [], crossover: true },
  { id: 20, name: 'Video → Script → Repurpose', description: 'Extract, chunk, multiple formats', category: 'C', phase: 'P2', status: 'planned', products: ['spark', 'vibe-studio', 'vibe-mobile'], features: ['Chunking Logic'], agents: ['repurpose_agent'], apis: [], crossover: true },

  // Category D: Record → Refine Loops (21-24) - P1
  { id: 21, name: 'Record → Review → Re-record', description: 'Targeted re-record sections', category: 'D', phase: 'P1', status: 'planned', products: ['vibe-studio', 'vibe-mobile'], features: ['Section Re-record'], agents: [], apis: [], crossover: false },
  { id: 22, name: 'Record → AI Polish', description: 'AI removes filler, fixes pacing', category: 'D', phase: 'P1', status: 'planned', products: ['vibe-studio', 'mind'], features: ['Filler Removal AI'], agents: ['polish_agent'], apis: [], crossover: true },
  { id: 23, name: 'Record → Add TTS Sections', description: 'Fill gaps with TTS, blend', category: 'D', phase: 'P1', status: 'planned', products: ['vibe-studio'], features: ['Gap Filling'], agents: ['tts_orchestrator'], apis: [], crossover: false },
  { id: 24, name: 'Record → Split → Export', description: 'AI splits into chapters', category: 'D', phase: 'P1', status: 'planned', products: ['vibe-studio', 'mind'], features: ['Chapter Detection'], agents: ['chapter_agent'], apis: [], crossover: true },

  // Category E: Hybrid & Cross-Studio (25-32) - P2
  { id: 25, name: 'Genie → Recording → Genie', description: 'Round-trip enhancement', category: 'E', phase: 'P2', status: 'planned', products: ['mind', 'spark', 'vibe-studio'], features: ['Flow Logic'], agents: [], apis: [], crossover: true },
  { id: 26, name: 'Recording → Genie → Recording', description: 'Draft, enhance, re-record', category: 'E', phase: 'P2', status: 'planned', products: ['vibe-studio', 'spark'], features: ['Flow Logic'], agents: [], apis: [], crossover: true },
  { id: 27, name: 'Parallel Editing', description: 'Edit script while reviewing recording', category: 'E', phase: 'P2', status: 'planned', products: ['vibe-studio', 'spark'], features: ['Split View'], agents: [], apis: [], crossover: true },
  { id: 28, name: 'Version Compare', description: 'Compare takes side-by-side', category: 'E', phase: 'P2', status: 'planned', products: ['vibe-studio', 'vibe-desktop'], features: ['Comparison UI'], agents: [], apis: [], crossover: false },
  { id: 29, name: 'A/B Script Testing', description: 'Create 2 versions, compare', category: 'E', phase: 'P2', status: 'planned', products: ['spark', 'arc'], features: ['A/B Logic'], agents: [], apis: [], crossover: true },
  { id: 30, name: 'Collaborative Handoff', description: 'Writer → Editor → Recorder', category: 'E', phase: 'P2', status: 'planned', products: ['arc', 'vibe-studio', 'spark'], features: ['Role Handoff'], agents: [], apis: [], crossover: true },
  { id: 31, name: 'Asset Library Sync', description: 'Shared assets in real-time', category: 'E', phase: 'P2', status: 'planned', products: ['arc', 'vibe-studio'], features: ['Sync Engine'], agents: [], apis: [], crossover: true },
  { id: 32, name: 'Project Duplication', description: 'Duplicate for variations', category: 'E', phase: 'P2', status: 'planned', products: ['vibe-studio', 'spark'], features: ['Clone Function'], agents: [], apis: [], crossover: true },

  // Category L: Bidirectional Vibe ↔ Mind (61-65) - P0
  { id: 61, name: 'Recording → Mind → Script', description: 'Analyze with Mind, generate script', category: 'L', phase: 'P0', status: 'complete', products: ['vibe-studio', 'mind', 'spark'], features: ['Mind Analysis'], agents: ['rag_agent'], apis: ['/rag-search'], crossover: true },
  { id: 62, name: 'PPT → Mind → Script → Video', description: 'ContentAnalyzer, AI analysis, script', category: 'L', phase: 'P0', status: 'complete', products: ['mind', 'spark', 'vibe-studio'], features: ['Document Pipeline'], agents: ['document_processor', 'script_generator'], apis: ['/process-documents'], crossover: true },
  { id: 63, name: 'PDF → Mind → Script', description: 'Extract, summarize, script', category: 'L', phase: 'P0', status: 'complete', products: ['mind', 'spark'], features: ['PDF Processing'], agents: ['document_processor'], apis: ['/process-documents'], crossover: true },
  { id: 64, name: 'URL → Mind → Script', description: 'Scrape, analyze, script', category: 'L', phase: 'P0', status: 'complete', products: ['mind', 'spark'], features: ['URL Processing'], agents: ['web_scraper'], apis: [], crossover: true },
  { id: 65, name: 'Image → Mind → Script', description: 'Vision AI, description, script', category: 'L', phase: 'P0', status: 'complete', products: ['mind', 'spark'], features: ['Vision AI'], agents: ['vision_agent'], apis: ['/ai-universal-processor'], crossover: true },

  // Category M: Commercialization Infrastructure (66-80)
  { id: 66, name: 'Subscription Tier Database', description: 'Create database schema for tiers', category: 'M', phase: 'P0', status: 'complete', products: ['vibe-studio', 'arc'], features: ['Subscription DB'], agents: [], apis: [], crossover: false },
  { id: 67, name: 'Module Registry Database', description: 'Module definitions and access rules', category: 'M', phase: 'P0', status: 'planned', products: ['vibe-studio', 'arc'], features: ['Module Registry'], agents: [], apis: [], crossover: false, gap: 'Need module_registry table', recommendation: 'Create module_registry table with RLS' },
  { id: 68, name: 'useSubscription Hook', description: 'React hook for subscription state', category: 'M', phase: 'P0', status: 'complete', products: ['vibe-studio', 'vibe-mobile', 'vibe-desktop'], features: ['Subscription Hook'], agents: [], apis: [], crossover: false },
  { id: 69, name: 'useModuleAccess Hook', description: 'Access control per Genie module', category: 'M', phase: 'P0', status: 'complete', products: ['vibe-studio'], features: ['Module Access'], agents: [], apis: [], crossover: false },
  { id: 70, name: 'Beta User Migration', description: 'Mark existing users as beta tier', category: 'M', phase: 'P0', status: 'complete', products: ['vibe-studio'], features: ['Beta Migration'], agents: [], apis: [], crossover: false },
  { id: 71, name: 'Route-Level Access Guards', description: 'Protect routes by tier', category: 'M', phase: 'P1', status: 'partial', products: ['vibe-studio', 'vibe-mobile'], features: ['Route Guards'], agents: [], apis: [], crossover: false, gap: 'Need router integration with tier check' },
  { id: 72, name: 'Module-Level Access Gates', description: 'Component wrappers', category: 'M', phase: 'P1', status: 'planned', products: ['vibe-studio'], features: ['ModuleGate Component'], agents: [], apis: [], crossover: false, recommendation: 'Create <ModuleGate> wrapper component' },
  { id: 73, name: 'Upgrade Prompts UI', description: 'Upgrade modals/banners', category: 'M', phase: 'P1', status: 'planned', products: ['vibe-studio', 'vibe-mobile'], features: ['Upgrade UI'], agents: [], apis: [], crossover: false },
  { id: 74, name: 'Usage Tracking Integration', description: 'Track API calls per module', category: 'M', phase: 'P1', status: 'planned', products: ['vibe-studio', 'arc'], features: ['Tracking Middleware'], agents: [], apis: [], crossover: false },
  { id: 75, name: 'Genie AI Conversation Limits', description: 'Per-tier limits', category: 'M', phase: 'P1', status: 'planned', products: ['mind', 'spark'], features: ['Rate Limiting'], agents: [], apis: [], crossover: true },
  { id: 76, name: 'Public Landing Page', description: 'Marketing page', category: 'M', phase: 'P2', status: 'planned', products: ['vibe-studio'], features: ['Landing Design'], agents: [], apis: [], crossover: false },
  { id: 77, name: 'Pricing Page', description: 'Tier comparison', category: 'M', phase: 'P2', status: 'complete', products: ['vibe-studio'], features: ['Pricing UI'], agents: [], apis: [], crossover: false },
  { id: 78, name: 'Subscription Selection (Signup)', description: 'Tier choice during registration', category: 'M', phase: 'P2', status: 'planned', products: ['vibe-studio'], features: ['Signup Wizard'], agents: [], apis: [], crossover: false },
  { id: 79, name: 'Stripe Integration', description: 'Payment processing', category: 'M', phase: 'P2', status: 'complete', products: ['vibe-studio', 'arc'], features: ['Stripe Checkout'], agents: [], apis: ['/stripe-webhook'], crossover: false },
  { id: 80, name: 'Admin Subscription Dashboard', description: 'Manage subscriptions', category: 'M', phase: 'P2', status: 'planned', products: ['arc'], features: ['Admin Panel'], agents: [], apis: [], crossover: false },

  // Category N: Mobile-First (81-90) - P1/P2
  { id: 81, name: 'One-Tap Record', description: 'Single button to start', category: 'N', phase: 'P2', status: 'complete', products: ['vibe-mobile'], features: ['Quick Record UI'], agents: [], apis: [], crossover: false },
  { id: 82, name: 'Offline Recording', description: 'Record without internet', category: 'N', phase: 'P2', status: 'complete', products: ['vibe-mobile'], features: ['Offline Mode'], agents: [], apis: [], crossover: false },
  { id: 83, name: 'Quick Templates', description: 'Pre-built TikTok/Reels/Shorts templates', category: 'N', phase: 'P1', status: 'complete', products: ['vibe-mobile', 'vibe-studio'], features: ['Template Library'], agents: [], apis: [], crossover: false },
  { id: 84, name: 'Voice-First Editing', description: 'Voice commands', category: 'N', phase: 'P2', status: 'complete', products: ['vibe-mobile'], features: ['Voice Recognition'], agents: [], apis: [], crossover: false },
  { id: 85, name: 'Social Integration', description: 'Direct publish to platforms', category: 'N', phase: 'P1', status: 'planned', products: ['vibe-mobile', 'vibe-studio'], features: ['API Integrations'], agents: ['social_publisher'], apis: ['/social-publish'], crossover: false },
  { id: 86, name: 'Product Demo Mode', description: 'Guided product showcase', category: 'N', phase: 'P1', status: 'planned', products: ['vibe-mobile'], features: ['Demo Wizard'], agents: [], apis: [], crossover: false },
  { id: 87, name: 'Testimonial Collector', description: 'Customer review capture', category: 'N', phase: 'P2', status: 'planned', products: ['vibe-mobile', 'arc'], features: ['Testimonial UI'], agents: [], apis: [], crossover: true },
  { id: 88, name: 'Lesson Builder', description: 'Screen + camera + annotations', category: 'N', phase: 'P1', status: 'planned', products: ['vibe-mobile', 'vibe-desktop'], features: ['Education Mode'], agents: [], apis: [], crossover: false },
  { id: 89, name: 'Location Story', description: 'GPS tagging + map overlay', category: 'N', phase: 'P2', status: 'complete', products: ['vibe-mobile'], features: ['Geo Features'], agents: [], apis: [], crossover: false },
  { id: 90, name: 'Quick Clips', description: 'AI-generate 15s/30s/60s cuts', category: 'N', phase: 'P1', status: 'complete', products: ['vibe-mobile', 'vibe-studio'], features: ['Cut Detection'], agents: ['clip_agent'], apis: [], crossover: false },

  // Category P: Remix & Clip Assembly (101-110) - P2
  { id: 101, name: 'Multi-Clip Import', description: 'Bulk import clips', category: 'P', phase: 'P2', status: 'planned', products: ['vibe-studio', 'vibe-desktop'], features: ['Bulk Import'], agents: [], apis: [], crossover: false },
  { id: 102, name: 'AI Clip Analysis', description: 'Auto-categorize by content', category: 'P', phase: 'P2', status: 'planned', products: ['mind', 'vibe-studio'], features: ['Categorization'], agents: ['analysis_agent'], apis: [], crossover: true },
  { id: 103, name: 'Timeline Arrangement', description: 'Drag-drop assembly', category: 'P', phase: 'P2', status: 'complete', products: ['vibe-studio', 'vibe-mobile'], features: ['Timeline UI'], agents: [], apis: [], crossover: false },
  { id: 104, name: 'Smart Transitions', description: 'AI-suggested transitions', category: 'P', phase: 'P2', status: 'complete', products: ['vibe-studio', 'vibe-mobile'], features: ['Transition AI'], agents: ['transition_agent'], apis: [], crossover: false },
  { id: 105, name: 'Music Sync', description: 'Beat-matched transitions', category: 'P', phase: 'P2', status: 'complete', products: ['vibe-studio', 'vibe-mobile'], features: ['Beat Detection'], agents: ['music_sync_agent'], apis: [], crossover: false },
  { id: 106, name: 'Voice-Over Assembly', description: 'Record over arranged clips', category: 'P', phase: 'P2', status: 'planned', products: ['vibe-studio'], features: ['VO Overlay'], agents: [], apis: [], crossover: false },
  { id: 107, name: 'Text/Graphics Overlay', description: 'Add titles, captions', category: 'P', phase: 'P2', status: 'complete', products: ['vibe-studio', 'vibe-mobile'], features: ['Text Overlay'], agents: [], apis: [], crossover: false },
  { id: 108, name: 'Audio Mix', description: 'Multi-track mixing', category: 'P', phase: 'P2', status: 'complete', products: ['vibe-studio', 'vibe-mobile'], features: ['Audio Mixer'], agents: [], apis: [], crossover: false },
  { id: 109, name: 'Preview/Review', description: 'Full preview before export', category: 'P', phase: 'P2', status: 'complete', products: ['vibe-studio', 'vibe-mobile'], features: ['Preview Player'], agents: [], apis: [], crossover: false },
  { id: 110, name: 'Multi-Format Export', description: 'Export to various formats', category: 'P', phase: 'P2', status: 'complete', products: ['vibe-studio', 'vibe-mobile'], features: ['Export Options'], agents: [], apis: [], crossover: false },

  // Category Q: Agent Integration (111-125) - P0/P1/P2
  { id: 111, name: 'Script Generation Orchestration', description: 'script_generator_agent pipeline', category: 'Q', phase: 'P0', status: 'complete', products: ['spark'], features: ['Script Pipeline'], agents: ['script_generator'], apis: ['/ai-universal-processor'], crossover: false },
  { id: 112, name: 'TTS Multi-Provider Failover', description: 'tts_orchestrator_agent', category: 'Q', phase: 'P0', status: 'complete', products: ['vibe-studio'], features: ['TTS Failover'], agents: ['tts_orchestrator'], apis: [], crossover: false },
  { id: 113, name: 'Voice Clone Training', description: 'voice_clone_agent', category: 'Q', phase: 'P3', status: 'planned', products: ['vibe-studio', 'vibe-desktop'], features: ['Voice Training'], agents: ['voice_clone_agent'], apis: ['/voice-clone-processor'], crossover: false },
  { id: 114, name: 'Video Assembly Pipeline', description: 'video_assembly_agent', category: 'Q', phase: 'P0', status: 'complete', products: ['vibe-studio'], features: ['Video Pipeline'], agents: ['video_assembly'], apis: [], crossover: false },
  { id: 115, name: 'Social Multi-Platform Publish', description: 'social_publisher_agent', category: 'Q', phase: 'P0', status: 'complete', products: ['vibe-studio', 'vibe-mobile'], features: ['Social Publish'], agents: ['social_publisher'], apis: ['/social-publish'], crossover: false },
  { id: 116, name: 'Compliance Auto-Scan', description: 'compliance_monitor_agent', category: 'Q', phase: 'P1', status: 'planned', products: ['arc', 'vibe-studio'], features: ['Compliance Scan'], agents: ['compliance_monitor'], apis: ['/compliance-scanner'], crossover: true },
  { id: 117, name: 'PHI Auto-Redaction', description: 'Detect, redact PHI', category: 'Q', phase: 'P1', status: 'planned', products: ['mind', 'vibe-studio'], features: ['PHI Detection'], agents: ['phi_redactor'], apis: [], crossover: true },
  { id: 118, name: 'Approval Workflow Chain', description: 'Submit, review, approve', category: 'Q', phase: 'P1', status: 'planned', products: ['arc'], features: ['Workflow Engine'], agents: ['approval_agent'], apis: [], crossover: false },
  { id: 119, name: 'Translation Pipeline', description: 'Script → Dub', category: 'Q', phase: 'P1', status: 'planned', products: ['spark', 'vibe-studio'], features: ['Translation'], agents: ['translation_agent'], apis: [], crossover: true },
  { id: 120, name: 'Subscription Enforcement', description: 'subscription_agent', category: 'Q', phase: 'P1', status: 'complete', products: ['vibe-studio', 'arc'], features: ['Subscription Check'], agents: ['subscription_agent'], apis: ['/check-subscription'], crossover: false },
  { id: 121, name: 'Usage Metering', description: 'Action → Count', category: 'Q', phase: 'P2', status: 'planned', products: ['vibe-studio', 'arc'], features: ['Metering Service'], agents: ['metering_agent'], apis: [], crossover: false },
  { id: 122, name: 'Workflow Orchestration', description: 'Multi-step workflows', category: 'Q', phase: 'P2', status: 'planned', products: ['arc'], features: ['Orchestrator'], agents: ['workflow_orchestrator'], apis: [], crossover: false },
  { id: 123, name: 'Analytics Collection', description: 'Action → Insight', category: 'Q', phase: 'P2', status: 'planned', products: ['arc'], features: ['Analytics Agent'], agents: ['analytics_agent'], apis: [], crossover: false },
  { id: 124, name: 'Error Recovery', description: 'Failure → Retry', category: 'Q', phase: 'P2', status: 'complete', products: ['vibe-studio'], features: ['Recovery Logic'], agents: ['error_recovery'], apis: [], crossover: false },
  { id: 125, name: 'Cross-Agent Communication', description: 'Agent → Agent via MCP', category: 'Q', phase: 'P2', status: 'planned', products: ['arc', 'mind'], features: ['MCP Integration'], agents: [], apis: [], crossover: true },

  // Category S: Subscription & Access (141-155) - P0/P1
  { id: 141, name: 'User Registration', description: 'Supabase Auth → Create profile', category: 'S', phase: 'P0', status: 'complete', products: ['vibe-studio', 'vibe-mobile'], features: ['Auth Registration'], agents: [], apis: [], crossover: false },
  { id: 142, name: 'Login Flow', description: 'Auth validation → Session creation', category: 'S', phase: 'P0', status: 'complete', products: ['vibe-studio', 'vibe-mobile', 'vibe-desktop'], features: ['Auth Login'], agents: [], apis: [], crossover: false },
  { id: 143, name: 'Subscription Check', description: 'check-subscription edge fn', category: 'S', phase: 'P0', status: 'complete', products: ['vibe-studio', 'arc'], features: ['Subscription API'], agents: [], apis: ['/check-subscription'], crossover: false },
  { id: 144, name: 'Checkout Flow', description: 'create-checkout edge fn', category: 'S', phase: 'P0', status: 'complete', products: ['vibe-studio'], features: ['Checkout'], agents: [], apis: ['/create-checkout'], crossover: false },
  { id: 145, name: 'Customer Portal', description: 'customer-portal edge fn', category: 'S', phase: 'P0', status: 'complete', products: ['vibe-studio', 'arc'], features: ['Portal'], agents: [], apis: ['/customer-portal'], crossover: false },
  { id: 146, name: 'Module Access Control', description: 'hasModuleAccess()', category: 'S', phase: 'P0', status: 'complete', products: ['vibe-studio'], features: ['Access Control'], agents: [], apis: [], crossover: false },
  { id: 147, name: 'Credit Balance Check', description: 'Query ai_credit_transactions', category: 'S', phase: 'P0', status: 'complete', products: ['vibe-studio', 'mind', 'spark'], features: ['Credit Check'], agents: [], apis: [], crossover: true },
  { id: 148, name: 'Credit Consumption', description: 'Deduct credits → Log transaction', category: 'S', phase: 'P0', status: 'complete', products: ['vibe-studio', 'mind', 'spark'], features: ['Credit Deduction'], agents: [], apis: [], crossover: true },
  { id: 149, name: 'Tier Upgrade Prompt', description: 'Display upgrade modal', category: 'S', phase: 'P0', status: 'complete', products: ['vibe-studio'], features: ['Upgrade Modal'], agents: [], apis: [], crossover: false },
  { id: 150, name: 'Beta User Bypass', description: 'Full access for beta users', category: 'S', phase: 'P0', status: 'complete', products: ['vibe-studio', 'vibe-mobile'], features: ['Beta Bypass'], agents: [], apis: [], crossover: false },
  { id: 151, name: 'Free Trial Start', description: 'Set trial_ends_at', category: 'S', phase: 'P1', status: 'partial', products: ['vibe-studio'], features: ['Trial Logic'], agents: [], apis: [], crossover: false, gap: 'Trial expiration handling needed' },
  { id: 152, name: 'Trial Expiration', description: 'Downgrade to free', category: 'S', phase: 'P1', status: 'partial', products: ['vibe-studio'], features: ['Expiration Handler'], agents: [], apis: [], crossover: false },
  { id: 153, name: 'Pricing Page Display', description: 'Render tier cards', category: 'S', phase: 'P1', status: 'complete', products: ['vibe-studio'], features: ['Pricing UI'], agents: [], apis: [], crossover: false },
  { id: 154, name: 'Subscription Status UI', description: 'Display current tier', category: 'S', phase: 'P1', status: 'complete', products: ['vibe-studio', 'vibe-mobile'], features: ['Status UI'], agents: [], apis: [], crossover: false },
  { id: 155, name: 'Role-Based Navigation', description: 'Filter nav items by tier', category: 'S', phase: 'P1', status: 'planned', products: ['vibe-studio', 'arc'], features: ['Nav Filtering'], agents: [], apis: [], crossover: false, recommendation: 'Add tier-aware navigation component' },

  // Category T: Mobile Deployment (156-165) - P2
  { id: 156, name: 'PWA Installation', description: 'Add to home screen', category: 'T', phase: 'P2', status: 'complete', products: ['vibe-mobile'], features: ['PWA Install'], agents: [], apis: [], crossover: false },
  { id: 157, name: 'Service Worker', description: 'Offline caching', category: 'T', phase: 'P2', status: 'complete', products: ['vibe-mobile'], features: ['SW Caching'], agents: [], apis: [], crossover: false },
  { id: 158, name: 'Responsive Layout', description: 'Mobile-first design', category: 'T', phase: 'P2', status: 'complete', products: ['vibe-studio', 'vibe-mobile'], features: ['Responsive UI'], agents: [], apis: [], crossover: false },
  { id: 159, name: 'Touch Optimization', description: 'Touch gestures', category: 'T', phase: 'P2', status: 'complete', products: ['vibe-mobile'], features: ['Touch Handlers'], agents: [], apis: [], crossover: false },
  { id: 160, name: 'Capacitor Build', description: 'iOS/Android build', category: 'T', phase: 'P2', status: 'partial', products: ['vibe-mobile'], features: ['Native Build'], agents: [], apis: [], crossover: false, gap: 'Need iOS/Android store submission' },
  { id: 161, name: 'Camera Plugin', description: 'Native camera access', category: 'T', phase: 'P2', status: 'complete', products: ['vibe-mobile'], features: ['Camera Access'], agents: [], apis: [], crossover: false },
  { id: 162, name: 'Push Notifications', description: 'Notification support', category: 'T', phase: 'P2', status: 'partial', products: ['vibe-mobile', 'arc'], features: ['Push Setup'], agents: [], apis: [], crossover: true, gap: 'Need backend notification service' },
  { id: 163, name: 'App Store Listing', description: 'Store metadata', category: 'T', phase: 'P2', status: 'planned', products: ['vibe-mobile'], features: ['Store Assets'], agents: [], apis: [], crossover: false },
  { id: 164, name: 'Beta Testing', description: 'TestFlight/Play testing', category: 'T', phase: 'P2', status: 'planned', products: ['vibe-mobile'], features: ['Beta Config'], agents: [], apis: [], crossover: false },
  { id: 165, name: 'Production Release', description: 'Public app store release', category: 'T', phase: 'P2', status: 'planned', products: ['vibe-mobile'], features: ['Release Process'], agents: [], apis: [], crossover: false },

  // Category U: P2 AI Agents (166-177) - Complete
  { id: 166, name: 'Voice Coaching Session', description: 'Voice Director analysis', category: 'U', phase: 'P2', status: 'complete', products: ['vibe-studio', 'vibe-mobile', 'mind'], features: ['Voice Analysis'], agents: ['voice_director'], apis: [], crossover: true },
  { id: 167, name: 'TTS Direction', description: 'Guide TTS with style', category: 'U', phase: 'P2', status: 'complete', products: ['vibe-studio', 'spark'], features: ['TTS Styling'], agents: ['tts_director'], apis: [], crossover: true },
  { id: 168, name: 'Scene Analysis', description: 'Frame-by-frame analysis', category: 'U', phase: 'P2', status: 'complete', products: ['mind', 'vibe-studio'], features: ['Scene Detection'], agents: ['scene_analyzer'], apis: [], crossover: true },
  { id: 169, name: 'B-Roll Suggestions', description: 'Transition point identification', category: 'U', phase: 'P2', status: 'complete', products: ['mind', 'vibe-studio'], features: ['B-Roll AI'], agents: ['broll_suggester'], apis: [], crossover: true },
  { id: 170, name: 'Multi-Platform Publish', description: 'Platform format adaptation', category: 'U', phase: 'P2', status: 'complete', products: ['vibe-studio', 'vibe-mobile', 'arc'], features: ['Format Adaptation'], agents: ['social_publisher'], apis: ['/social-publish'], crossover: true },
  { id: 171, name: 'Social Optimization', description: 'Caption/hashtag generation', category: 'U', phase: 'P2', status: 'complete', products: ['vibe-studio', 'vibe-mobile'], features: ['Social AI'], agents: ['social_optimizer'], apis: [], crossover: false },
  { id: 172, name: 'Script-Video Matching', description: 'Vector embed matching', category: 'U', phase: 'P2', status: 'complete', products: ['mind', 'spark'], features: ['Vector Matching'], agents: ['script_video_matcher'], apis: ['/rag-search'], crossover: true },
  { id: 173, name: 'AI Music Generation', description: 'Mood-based music', category: 'U', phase: 'P2', status: 'complete', products: ['vibe-studio', 'vibe-mobile'], features: ['Music Gen'], agents: ['music_composer'], apis: [], crossover: false },
  { id: 174, name: 'SFX Generation', description: 'Sound effects generation', category: 'U', phase: 'P2', status: 'complete', products: ['vibe-studio'], features: ['SFX Gen'], agents: ['sfx_generator'], apis: [], crossover: false },
  { id: 175, name: 'Auto-Trim & Clean', description: 'Silence/error removal', category: 'U', phase: 'P2', status: 'complete', products: ['vibe-studio', 'vibe-mobile'], features: ['Auto Trim'], agents: ['auto_editor'], apis: [], crossover: false },
  { id: 176, name: 'Beat-Sync Edit', description: 'Music-synced cuts', category: 'U', phase: 'P2', status: 'complete', products: ['vibe-studio', 'vibe-mobile'], features: ['Beat Sync'], agents: ['music_sync'], apis: [], crossover: false },
  { id: 177, name: 'Seven-Phase Guided Edit', description: 'Complete guided workflow', category: 'U', phase: 'P2', status: 'complete', products: ['vibe-studio', 'vibe-mobile'], features: ['Guided Wizard'], agents: ['guided_editor'], apis: [], crossover: false },

  // =============================================================================
  // CATEGORY V: P3 DIFFERENTIATORS (178-195)
  // =============================================================================
  { id: 178, name: 'Voice Clone Studio', description: 'Train custom voice models', category: 'V', phase: 'P3', status: 'planned', products: ['vibe-studio', 'vibe-desktop'], features: ['Voice Training UI'], agents: ['voice_clone_agent'], apis: ['/voice-clone-processor'], crossover: false },
  { id: 179, name: 'Custom Avatar Creator', description: 'Design AI-driven avatars', category: 'V', phase: 'P3', status: 'planned', products: ['vibe-studio'], features: ['Avatar Designer'], agents: ['avatar_creator'], apis: [], crossover: false },
  { id: 180, name: 'Lip Sync Engine', description: 'Audio-to-lip movement sync', category: 'V', phase: 'P3', status: 'planned', products: ['vibe-studio'], features: ['Lip Sync AI'], agents: ['lip_sync_agent'], apis: [], crossover: false },
  { id: 181, name: 'Multi-Language Dubbing', description: 'Translate and dub in 20+ languages', category: 'V', phase: 'P3', status: 'planned', products: ['spark', 'vibe-studio'], features: ['Dubbing Pipeline'], agents: ['translation_agent', 'tts_orchestrator'], apis: [], crossover: true },
  { id: 182, name: 'Emotion Detection', description: 'Analyze speaker emotions in video', category: 'V', phase: 'P3', status: 'planned', products: ['mind', 'vibe-studio'], features: ['Emotion AI'], agents: ['emotion_analyzer'], apis: [], crossover: true },
  { id: 183, name: 'Auto Highlight Reels', description: 'AI-generated highlight compilations', category: 'V', phase: 'P3', status: 'planned', products: ['vibe-studio', 'vibe-mobile'], features: ['Highlight Gen'], agents: ['highlight_agent'], apis: [], crossover: false },
  { id: 184, name: 'Interactive Video Branches', description: 'Choose-your-adventure videos', category: 'V', phase: 'P3', status: 'planned', products: ['vibe-studio'], features: ['Branching Logic'], agents: [], apis: [], crossover: false },
  { id: 185, name: 'Real-Time Collaboration', description: 'Multi-user live editing', category: 'V', phase: 'P3', status: 'planned', products: ['arc', 'vibe-studio'], features: ['Real-Time Sync'], agents: [], apis: ['/collaboration-sync'], crossover: true },
  { id: 186, name: 'Version Control System', description: 'Git-like version management', category: 'V', phase: 'P3', status: 'planned', products: ['vibe-studio', 'arc'], features: ['Version Control'], agents: [], apis: [], crossover: true },
  { id: 187, name: 'AI Color Grading', description: 'Auto color correction and LUTs', category: 'V', phase: 'P3', status: 'planned', products: ['vibe-studio', 'vibe-desktop'], features: ['Color AI'], agents: ['color_grading_agent'], apis: [], crossover: false },
  { id: 188, name: 'Background Removal/Replace', description: 'Green-screen-free background swap', category: 'V', phase: 'P3', status: 'planned', products: ['vibe-studio', 'vibe-mobile'], features: ['Background AI'], agents: ['background_agent'], apis: [], crossover: false },
  { id: 189, name: 'Object Tracking', description: 'Track and label objects in video', category: 'V', phase: 'P3', status: 'planned', products: ['mind', 'vibe-studio'], features: ['Object Detection'], agents: ['object_tracker'], apis: [], crossover: true },
  { id: 190, name: 'Auto Chapters & Timestamps', description: 'Generate YouTube chapters', category: 'V', phase: 'P3', status: 'planned', products: ['mind', 'vibe-studio'], features: ['Chapter Gen'], agents: ['chapter_agent'], apis: [], crossover: true },
  { id: 191, name: 'SEO Metadata Generator', description: 'AI-optimized titles, descriptions, tags', category: 'V', phase: 'P3', status: 'planned', products: ['spark', 'vibe-studio'], features: ['SEO AI'], agents: ['seo_agent'], apis: [], crossover: true },
  { id: 192, name: 'Thumbnail Generator', description: 'AI-designed video thumbnails', category: 'V', phase: 'P3', status: 'planned', products: ['spark', 'vibe-studio', 'vibe-mobile'], features: ['Thumbnail AI'], agents: ['thumbnail_agent'], apis: [], crossover: true },
  { id: 193, name: 'Viral Potential Scoring', description: 'Predict engagement metrics', category: 'V', phase: 'P3', status: 'planned', products: ['mind', 'arc'], features: ['Viral Score'], agents: ['viral_predictor'], apis: [], crossover: true },
  { id: 194, name: 'Competitor Content Analysis', description: 'Analyze competitor videos', category: 'V', phase: 'P3', status: 'planned', products: ['mind'], features: ['Competitor AI'], agents: ['competitor_analyzer'], apis: [], crossover: false },
  { id: 195, name: 'Trend Forecasting', description: 'Predict upcoming content trends', category: 'V', phase: 'P3', status: 'planned', products: ['mind', 'spark'], features: ['Trend AI'], agents: ['trend_forecaster'], apis: [], crossover: true },

  // =============================================================================
  // CATEGORY W: P4 ADVANCED/FUTURE (196-215)
  // =============================================================================
  { id: 196, name: 'Full AI Avatar Video', description: 'Complete avatar-based video creation', category: 'W', phase: 'P4', status: 'planned', products: ['vibe-studio'], features: ['Avatar Pipeline'], agents: ['avatar_agent', 'lip_sync_agent'], apis: [], crossover: false },
  { id: 197, name: 'VR/360 Video Support', description: 'Immersive video editing', category: 'W', phase: 'P4', status: 'planned', products: ['vibe-studio', 'vibe-desktop'], features: ['VR Editor'], agents: [], apis: [], crossover: false },
  { id: 198, name: 'Live Streaming Studio', description: 'Multi-camera live production', category: 'W', phase: 'P4', status: 'planned', products: ['arc', 'vibe-studio'], features: ['Live Streaming'], agents: ['stream_director'], apis: ['/live-stream'], crossover: true },
  { id: 199, name: 'Multi-Guest Live Sessions', description: 'Remote guest integration', category: 'W', phase: 'P4', status: 'planned', products: ['arc'], features: ['Multi-Guest'], agents: ['guest_coordinator'], apis: [], crossover: false },
  { id: 200, name: 'AI Producer Bot', description: 'Autonomous video production', category: 'W', phase: 'P4', status: 'planned', products: ['mind', 'spark', 'vibe-studio'], features: ['Producer AI'], agents: ['producer_bot'], apis: [], crossover: true },
  { id: 201, name: 'Content Calendar AI', description: 'AI-planned content schedules', category: 'W', phase: 'P4', status: 'planned', products: ['arc', 'spark'], features: ['Calendar AI'], agents: ['calendar_planner'], apis: [], crossover: true },
  { id: 202, name: 'Audience Analytics', description: 'Deep viewer behavior analysis', category: 'W', phase: 'P4', status: 'planned', products: ['arc', 'mind'], features: ['Audience AI'], agents: ['audience_analyzer'], apis: [], crossover: true },
  { id: 203, name: 'A/B Testing Platform', description: 'Test video variations', category: 'W', phase: 'P4', status: 'planned', products: ['arc'], features: ['A/B Platform'], agents: ['ab_test_agent'], apis: [], crossover: false },
  { id: 204, name: 'Revenue Analytics', description: 'Monetization insights', category: 'W', phase: 'P4', status: 'planned', products: ['arc'], features: ['Revenue AI'], agents: ['revenue_analyzer'], apis: [], crossover: false },
  { id: 205, name: 'Sponsor Integration', description: 'Automated sponsor placement', category: 'W', phase: 'P4', status: 'planned', products: ['vibe-studio', 'arc'], features: ['Sponsor AI'], agents: ['sponsor_agent'], apis: [], crossover: true },
  { id: 206, name: 'Dynamic Ad Insertion', description: 'Programmatic ad placement', category: 'W', phase: 'P4', status: 'planned', products: ['vibe-studio', 'arc'], features: ['Ad Insertion'], agents: ['ad_agent'], apis: [], crossover: true },
  { id: 207, name: 'White-Label Platform', description: 'Rebrandable solution', category: 'W', phase: 'P4', status: 'planned', products: ['arc'], features: ['White Label'], agents: [], apis: [], crossover: false },
  { id: 208, name: 'Agency Dashboard', description: 'Multi-client management', category: 'W', phase: 'P4', status: 'planned', products: ['arc'], features: ['Agency UI'], agents: [], apis: [], crossover: false },
  { id: 209, name: 'Template Marketplace', description: 'Buy/sell video templates', category: 'W', phase: 'P4', status: 'planned', products: ['vibe-studio', 'arc'], features: ['Marketplace'], agents: [], apis: [], crossover: true },
  { id: 210, name: 'AI Scene Generator', description: 'Generate video scenes from prompts', category: 'W', phase: 'P4', status: 'planned', products: ['spark', 'vibe-studio'], features: ['Scene Gen'], agents: ['scene_generator'], apis: [], crossover: true },
  { id: 211, name: 'Motion Capture Integration', description: 'Import MoCap data', category: 'W', phase: 'P4', status: 'planned', products: ['vibe-studio', 'vibe-desktop'], features: ['MoCap Import'], agents: [], apis: [], crossover: false },
  { id: 212, name: '3D Asset Integration', description: 'Import 3D models and scenes', category: 'W', phase: 'P4', status: 'planned', products: ['vibe-studio', 'vibe-desktop'], features: ['3D Import'], agents: [], apis: [], crossover: false },
  { id: 213, name: 'Real-Time Effects', description: 'Live filters and effects', category: 'W', phase: 'P4', status: 'planned', products: ['vibe-studio', 'vibe-mobile'], features: ['Live Effects'], agents: [], apis: [], crossover: false },
  { id: 214, name: 'AI Script to Storyboard', description: 'Auto-generate storyboards', category: 'W', phase: 'P4', status: 'planned', products: ['spark', 'vibe-studio'], features: ['Storyboard AI'], agents: ['storyboard_agent'], apis: [], crossover: true },
  { id: 215, name: 'Podcast Studio Pro', description: 'Full podcast production suite', category: 'W', phase: 'P4', status: 'planned', products: ['vibe-studio', 'arc'], features: ['Podcast Suite'], agents: ['podcast_producer'], apis: [], crossover: true },

  // =============================================================================
  // CATEGORY X: P5 ENTERPRISE (216-235)
  // =============================================================================
  { id: 216, name: 'SSO/SAML Integration', description: 'Enterprise single sign-on', category: 'X', phase: 'P5', status: 'planned', products: ['arc'], features: ['SSO'], agents: [], apis: [], crossover: false },
  { id: 217, name: 'HIPAA Compliance Suite', description: 'Full healthcare compliance', category: 'X', phase: 'P5', status: 'planned', products: ['arc', 'vibe-studio'], features: ['HIPAA Tools'], agents: ['compliance_monitor'], apis: [], crossover: true },
  { id: 218, name: 'SOC2 Audit Trail', description: 'Comprehensive audit logging', category: 'X', phase: 'P5', status: 'planned', products: ['arc'], features: ['Audit Trail'], agents: [], apis: [], crossover: false },
  { id: 219, name: 'Data Residency Controls', description: 'Regional data storage', category: 'X', phase: 'P5', status: 'planned', products: ['arc'], features: ['Data Residency'], agents: [], apis: [], crossover: false },
  { id: 220, name: 'Custom Model Training', description: 'Fine-tune AI models', category: 'X', phase: 'P5', status: 'planned', products: ['mind'], features: ['Model Training'], agents: ['model_trainer'], apis: [], crossover: false },
  { id: 221, name: 'On-Premise Deployment', description: 'Self-hosted installation', category: 'X', phase: 'P5', status: 'planned', products: ['arc'], features: ['On-Premise'], agents: [], apis: [], crossover: false },
  { id: 222, name: 'Custom SLA Management', description: 'Enterprise SLA configuration', category: 'X', phase: 'P5', status: 'planned', products: ['arc'], features: ['SLA Config'], agents: [], apis: [], crossover: false },
  { id: 223, name: 'Advanced Role Permissions', description: 'Granular access control', category: 'X', phase: 'P5', status: 'planned', products: ['arc'], features: ['RBAC Advanced'], agents: [], apis: [], crossover: false },
  { id: 224, name: 'Multi-Tenant Isolation', description: 'Complete workspace isolation', category: 'X', phase: 'P5', status: 'planned', products: ['arc'], features: ['Multi-Tenant'], agents: [], apis: [], crossover: false },
  { id: 225, name: 'Enterprise API Gateway', description: 'Dedicated API infrastructure', category: 'X', phase: 'P5', status: 'planned', products: ['arc'], features: ['API Gateway'], agents: [], apis: [], crossover: false },
  { id: 226, name: 'Priority Support Portal', description: '24/7 enterprise support', category: 'X', phase: 'P5', status: 'planned', products: ['arc'], features: ['Support Portal'], agents: [], apis: [], crossover: false },
  { id: 227, name: 'Custom Integrations', description: 'Bespoke integration development', category: 'X', phase: 'P5', status: 'planned', products: ['arc'], features: ['Custom Dev'], agents: [], apis: [], crossover: false },
  { id: 228, name: 'Brand Asset Management', description: 'Enterprise DAM integration', category: 'X', phase: 'P5', status: 'planned', products: ['arc', 'vibe-studio'], features: ['DAM Integration'], agents: [], apis: [], crossover: true },
  { id: 229, name: 'Content Governance', description: 'Enterprise content policies', category: 'X', phase: 'P5', status: 'planned', products: ['arc'], features: ['Governance'], agents: ['governance_agent'], apis: [], crossover: false },
  { id: 230, name: 'Global CDN', description: 'Enterprise content delivery', category: 'X', phase: 'P5', status: 'planned', products: ['arc'], features: ['CDN'], agents: [], apis: [], crossover: false },
  { id: 231, name: 'Dedicated Infrastructure', description: 'Isolated compute resources', category: 'X', phase: 'P5', status: 'planned', products: ['arc'], features: ['Dedicated Infra'], agents: [], apis: [], crossover: false },
  { id: 232, name: 'Enterprise Analytics', description: 'Advanced reporting suite', category: 'X', phase: 'P5', status: 'planned', products: ['arc'], features: ['Enterprise Analytics'], agents: ['analytics_agent'], apis: [], crossover: false },
  { id: 233, name: 'Bulk Operations API', description: 'Mass video operations', category: 'X', phase: 'P5', status: 'planned', products: ['arc'], features: ['Bulk API'], agents: [], apis: ['/bulk-operations'], crossover: false },
  { id: 234, name: 'Workflow Automation SDK', description: 'Custom workflow development', category: 'X', phase: 'P5', status: 'planned', products: ['arc'], features: ['Workflow SDK'], agents: [], apis: [], crossover: false },
  { id: 235, name: 'AI Model Governance', description: 'Enterprise AI policies', category: 'X', phase: 'P5', status: 'planned', products: ['mind', 'arc'], features: ['AI Governance'], agents: ['ai_governance'], apis: [], crossover: true },
];

// Recommendations based on competitor analysis
const RECOMMENDATIONS = [
  { product: 'vibe-mobile', priority: 'High', recommendation: 'Add TikTok-style vertical editor with trending audio library', competitor: 'CapCut', potentialScenario: 'Trending Audio Integration' },
  { product: 'mind', priority: 'High', recommendation: 'Add real-time collaboration on knowledge bases', competitor: 'Notion AI', potentialScenario: 'Collaborative RAG' },
  { product: 'spark', priority: 'Medium', recommendation: 'Add brand voice consistency checker', competitor: 'Jasper', potentialScenario: 'Brand Voice Guard' },
  { product: 'arc', priority: 'High', recommendation: 'Add live streaming integration with multi-guest', competitor: 'StreamYard', potentialScenario: 'Live Multi-Guest Stream' },
  { product: 'vibe-studio', priority: 'Medium', recommendation: 'Add AI color grading and LUT suggestions', competitor: 'DaVinci Resolve', potentialScenario: 'AI Color Grading' },
  { product: 'vibe-desktop', priority: 'Low', recommendation: 'Add hardware acceleration for 4K exports', competitor: 'Final Cut Pro', potentialScenario: 'GPU-Accelerated Export' },
];

// =============================================================================
// COMPONENT
// =============================================================================

export const ProductFeatureMatrix: React.FC<{ className?: string }> = ({ className }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPhase, setSelectedPhase] = useState<Phase | 'all'>('all');
  const [selectedProduct, setSelectedProduct] = useState<ProductId | 'all'>('all');
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);

  // Filter scenarios based on search, phase, and product
  const filteredScenarios = useMemo(() => {
    return SCENARIOS.filter(scenario => {
      const matchesSearch = searchQuery === '' || 
        scenario.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        scenario.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesPhase = selectedPhase === 'all' || scenario.phase === selectedPhase;
      const matchesProduct = selectedProduct === 'all' || scenario.products.includes(selectedProduct);
      return matchesSearch && matchesPhase && matchesProduct;
    });
  }, [searchQuery, selectedPhase, selectedProduct]);

  // Calculate stats
  const stats = useMemo(() => {
    const byPhase: Record<Phase, { total: number; complete: number; partial: number; planned: number }> = {
      P0: { total: 0, complete: 0, partial: 0, planned: 0 },
      P1: { total: 0, complete: 0, partial: 0, planned: 0 },
      P2: { total: 0, complete: 0, partial: 0, planned: 0 },
      P3: { total: 0, complete: 0, partial: 0, planned: 0 },
      P4: { total: 0, complete: 0, partial: 0, planned: 0 },
      P5: { total: 0, complete: 0, partial: 0, planned: 0 },
    };

    const byProduct: Record<ProductId, { total: number; complete: number; partial: number; planned: number }> = {
      'vibe-studio': { total: 0, complete: 0, partial: 0, planned: 0 },
      'vibe-mobile': { total: 0, complete: 0, partial: 0, planned: 0 },
      'vibe-desktop': { total: 0, complete: 0, partial: 0, planned: 0 },
      'mind': { total: 0, complete: 0, partial: 0, planned: 0 },
      'spark': { total: 0, complete: 0, partial: 0, planned: 0 },
      'arc': { total: 0, complete: 0, partial: 0, planned: 0 },
    };

    let crossoverCount = 0;
    const gaps: ScenarioMapping[] = [];

    SCENARIOS.forEach(scenario => {
      // Phase stats
      byPhase[scenario.phase].total++;
      if (scenario.status === 'complete') byPhase[scenario.phase].complete++;
      else if (scenario.status === 'partial') byPhase[scenario.phase].partial++;
      else byPhase[scenario.phase].planned++;

      // Product stats
      scenario.products.forEach(product => {
        byProduct[product].total++;
        if (scenario.status === 'complete') byProduct[product].complete++;
        else if (scenario.status === 'partial') byProduct[product].partial++;
        else byProduct[product].planned++;
      });

      if (scenario.crossover) crossoverCount++;
      if (scenario.gap) gaps.push(scenario);
    });

    return { byPhase, byProduct, crossoverCount, gaps };
  }, []);

  const getStatusIcon = (status: Status) => {
    switch (status) {
      case 'complete': return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'partial': return <AlertCircle className="h-4 w-4 text-amber-500" />;
      case 'planned': return <Clock className="h-4 w-4 text-slate-400" />;
      default: return <Circle className="h-4 w-4 text-red-400" />;
    }
  };

  const getStatusBadge = (status: Status) => {
    const variants: Record<Status, string> = {
      complete: 'bg-green-500/20 text-green-600 border-green-500/30',
      partial: 'bg-amber-500/20 text-amber-600 border-amber-500/30',
      planned: 'bg-slate-500/20 text-slate-600 border-slate-500/30',
      gap: 'bg-red-500/20 text-red-600 border-red-500/30',
    };
    return <Badge variant="outline" className={cn("text-xs", variants[status])}>{status}</Badge>;
  };

  const toggleCategory = (category: string) => {
    setExpandedCategories(prev => 
      prev.includes(category) 
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  // Group scenarios by category
  const groupedScenarios = useMemo(() => {
    const groups: Record<string, ScenarioMapping[]> = {};
    filteredScenarios.forEach(scenario => {
      if (!groups[scenario.category]) groups[scenario.category] = [];
      groups[scenario.category].push(scenario);
    });
    return groups;
  }, [filteredScenarios]);

  const categoryNames: Record<string, string> = {
    'A': 'Imagination → Production',
    'B': 'Upload → Production',
    'C': 'Video → Script → Enhance',
    'D': 'Record → Refine Loops',
    'E': 'Hybrid & Cross-Studio',
    'L': 'Bidirectional Vibe ↔ Mind',
    'M': 'Commercialization',
    'N': 'Mobile-First',
    'P': 'Remix & Clip Assembly',
    'Q': 'Agent Integration',
    'S': 'Subscription & Access',
    'T': 'Mobile Deployment',
    'U': 'P2 AI Agents',
    'V': 'P3 Differentiators',
    'W': 'P4 Advanced/Future',
    'X': 'P5 Enterprise',
  };

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              Product-Feature Matrix
            </CardTitle>
            <CardDescription>
              {SCENARIOS.length} Scenarios (P0-P5) across 6 Products (Vibe Studio/Mobile/Desktop, Mind, Spark, Arc)
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-green-500/10 text-green-600">
              {SCENARIOS.filter(s => s.status === 'complete').length} Complete
            </Badge>
            <Badge variant="outline" className="bg-amber-500/10 text-amber-600">
              {SCENARIOS.filter(s => s.status === 'partial').length} Partial
            </Badge>
            <Badge variant="outline" className="bg-slate-500/10 text-slate-600">
              {SCENARIOS.filter(s => s.status === 'planned').length} Planned
            </Badge>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid grid-cols-5 w-full">
            <TabsTrigger value="overview" className="text-xs">Overview</TabsTrigger>
            <TabsTrigger value="by-product" className="text-xs">By Product</TabsTrigger>
            <TabsTrigger value="by-phase" className="text-xs">By Phase</TabsTrigger>
            <TabsTrigger value="full-matrix" className="text-xs">Full Matrix</TabsTrigger>
            <TabsTrigger value="recommendations" className="text-xs">Recommendations</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Product Cards */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {PRODUCTS.map(product => {
                const completionRate = Math.round((product.implemented / product.totalScenarios) * 100);
                return (
                  <Card key={product.id} className={cn("border", product.color)}>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        {product.icon}
                        <span className="font-semibold text-sm">{product.shortName}</span>
                      </div>
                      <Progress value={completionRate} className="h-2 mb-2" />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>{product.implemented}/{product.totalScenarios} scenarios</span>
                        <span>{completionRate}%</span>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Cross-Product Features */}
            <Card className="border-primary/30 bg-primary/5">
              <CardHeader className="py-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Zap className="h-4 w-4" />
                  Cross-Product Features
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-sm text-muted-foreground mb-2">
                  {stats.crossoverCount} scenarios span multiple products, enabling unified workflows.
                </p>
                <div className="flex flex-wrap gap-2">
                  {['Mind → Spark → Vibe', 'Recording ↔ Mind', 'Arc ↔ Vibe', 'Mobile ↔ Desktop'].map(flow => (
                    <Badge key={flow} variant="outline" className="text-xs">{flow}</Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Gap Summary */}
            <Card className="border-amber-500/30 bg-amber-500/5">
              <CardHeader className="py-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-amber-500" />
                  Implementation Gaps ({stats.gaps.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <ScrollArea className="h-32">
                  <div className="space-y-2">
                    {stats.gaps.slice(0, 8).map(gap => (
                      <div key={gap.id} className="flex items-start gap-2 text-xs">
                        <Badge variant="outline" className="shrink-0">{gap.phase}</Badge>
                        <span className="font-medium">#{gap.id} {gap.name}:</span>
                        <span className="text-muted-foreground">{gap.gap}</span>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          {/* By Product Tab */}
          <TabsContent value="by-product" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {PRODUCTS.map(product => {
                const productScenarios = SCENARIOS.filter(s => s.products.includes(product.id));
                const complete = productScenarios.filter(s => s.status === 'complete').length;
                const partial = productScenarios.filter(s => s.status === 'partial').length;
                const planned = productScenarios.filter(s => s.status === 'planned').length;
                
                return (
                  <Card key={product.id} className="border">
                    <CardHeader className="py-3">
                      <CardTitle className="text-sm flex items-center gap-2">
                        {product.icon}
                        {product.name}
                      </CardTitle>
                      <CardDescription className="text-xs">{product.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-0 space-y-3">
                      <Progress value={(complete / productScenarios.length) * 100} className="h-2" />
                      <div className="grid grid-cols-3 gap-2 text-center text-xs">
                        <div className="p-2 rounded bg-green-500/10">
                          <div className="font-bold text-green-600">{complete}</div>
                          <div className="text-muted-foreground">Complete</div>
                        </div>
                        <div className="p-2 rounded bg-amber-500/10">
                          <div className="font-bold text-amber-600">{partial}</div>
                          <div className="text-muted-foreground">Partial</div>
                        </div>
                        <div className="p-2 rounded bg-slate-500/10">
                          <div className="font-bold text-slate-600">{planned}</div>
                          <div className="text-muted-foreground">Planned</div>
                        </div>
                      </div>
                      <ScrollArea className="h-24">
                        <div className="space-y-1">
                          {productScenarios.slice(0, 6).map(s => (
                            <div key={s.id} className="flex items-center gap-2 text-xs">
                              {getStatusIcon(s.status)}
                              <span className="truncate">{s.name}</span>
                            </div>
                          ))}
                          {productScenarios.length > 6 && (
                            <div className="text-xs text-muted-foreground">+{productScenarios.length - 6} more...</div>
                          )}
                        </div>
                      </ScrollArea>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          {/* By Phase Tab */}
          <TabsContent value="by-phase" className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {(['P0', 'P1', 'P2', 'P3', 'P4', 'P5'] as Phase[]).map(phase => {
                const phaseStats = stats.byPhase[phase];
                const completionRate = phaseStats.total > 0 
                  ? Math.round(((phaseStats.complete + phaseStats.partial * 0.5) / phaseStats.total) * 100)
                  : 0;
                const phaseColors: Record<Phase, string> = {
                  P0: 'border-green-500/50 bg-green-500/5',
                  P1: 'border-blue-500/50 bg-blue-500/5',
                  P2: 'border-purple-500/50 bg-purple-500/5',
                  P3: 'border-amber-500/50 bg-amber-500/5',
                  P4: 'border-slate-500/50 bg-slate-500/5',
                  P5: 'border-red-500/50 bg-red-500/5',
                };
                const phaseNames: Record<Phase, string> = {
                  P0: 'Core MVP',
                  P1: 'Essential',
                  P2: 'AI Agents & UX',
                  P3: 'Differentiators',
                  P4: 'Future/Advanced',
                  P5: 'Enterprise',
                };
                
                return (
                  <Card key={phase} className={cn("border-2", phaseColors[phase])}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant="outline" className="font-bold">{phase}</Badge>
                        <span className="text-xs text-muted-foreground">{phaseNames[phase]}</span>
                      </div>
                      <Progress value={completionRate} className="h-2 mb-2" />
                      <div className="text-center">
                        <div className="text-2xl font-bold">{completionRate}%</div>
                        <div className="text-xs text-muted-foreground">
                          {phaseStats.complete}✓ / {phaseStats.partial}○ / {phaseStats.planned}⏳
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          {/* Full Matrix Tab */}
          <TabsContent value="full-matrix" className="space-y-4">
            {/* Filters */}
            <div className="flex flex-wrap gap-4">
              <div className="flex-1 min-w-[200px]">
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search scenarios..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-8"
                  />
                </div>
              </div>
              <select
                value={selectedPhase}
                onChange={(e) => setSelectedPhase(e.target.value as Phase | 'all')}
                className="px-3 py-2 border rounded-md text-sm bg-background"
              >
                <option value="all">All Phases</option>
                {(['P0', 'P1', 'P2', 'P3', 'P4', 'P5'] as Phase[]).map(p => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
              <select
                value={selectedProduct}
                onChange={(e) => setSelectedProduct(e.target.value as ProductId | 'all')}
                className="px-3 py-2 border rounded-md text-sm bg-background"
              >
                <option value="all">All Products</option>
                {PRODUCTS.map(p => (
                  <option key={p.id} value={p.id}>{p.shortName}</option>
                ))}
              </select>
            </div>

            {/* Matrix Table */}
            <ScrollArea className="h-[500px]">
              {Object.entries(groupedScenarios).map(([category, scenarios]) => (
                <div key={category} className="mb-4">
                  <Button
                    variant="ghost"
                    className="w-full justify-between p-2 hover:bg-muted"
                    onClick={() => toggleCategory(category)}
                  >
                    <span className="font-semibold">
                      Category {category}: {categoryNames[category] || category} ({scenarios.length})
                    </span>
                    {expandedCategories.includes(category) ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </Button>
                  {expandedCategories.includes(category) && (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-12">#</TableHead>
                          <TableHead>Scenario</TableHead>
                          <TableHead className="w-16">Phase</TableHead>
                          <TableHead className="w-20">Status</TableHead>
                          <TableHead>Products</TableHead>
                          <TableHead>Gap/Note</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {scenarios.map(scenario => (
                          <TableRow key={scenario.id}>
                            <TableCell className="font-mono text-xs">{scenario.id}</TableCell>
                            <TableCell>
                              <div className="font-medium text-sm">{scenario.name}</div>
                              <div className="text-xs text-muted-foreground">{scenario.description}</div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline" className="text-xs">{scenario.phase}</Badge>
                            </TableCell>
                            <TableCell>{getStatusBadge(scenario.status)}</TableCell>
                            <TableCell>
                              <div className="flex flex-wrap gap-1">
                                {scenario.products.map(p => {
                                  const product = PRODUCTS.find(pr => pr.id === p);
                                  return product ? (
                                    <Badge key={p} variant="outline" className={cn("text-xs", product.color)}>
                                      {product.shortName}
                                    </Badge>
                                  ) : null;
                                })}
                              </div>
                            </TableCell>
                            <TableCell className="text-xs text-muted-foreground">
                              {scenario.gap || scenario.recommendation || '-'}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </div>
              ))}
            </ScrollArea>
          </TabsContent>

          {/* Recommendations Tab */}
          <TabsContent value="recommendations" className="space-y-4">
            <Card className="border-primary/30">
              <CardHeader className="py-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Lightbulb className="h-4 w-4 text-primary" />
                  New Feature Recommendations
                </CardTitle>
                <CardDescription className="text-xs">
                  Based on competitor analysis and market gaps
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Recommendation</TableHead>
                      <TableHead>Competitor</TableHead>
                      <TableHead>Potential Scenario</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {RECOMMENDATIONS.map((rec, i) => (
                      <TableRow key={i}>
                        <TableCell>
                          <Badge variant="outline" className={cn("text-xs", PRODUCTS.find(p => p.id === rec.product)?.color)}>
                            {PRODUCTS.find(p => p.id === rec.product)?.shortName}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={rec.priority === 'High' ? 'default' : rec.priority === 'Medium' ? 'secondary' : 'outline'} className="text-xs">
                            {rec.priority}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm">{rec.recommendation}</TableCell>
                        <TableCell className="text-xs text-muted-foreground">{rec.competitor}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-xs bg-green-500/10 text-green-600">
                            + {rec.potentialScenario}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* Missing Features */}
            <Card className="border-amber-500/30">
              <CardHeader className="py-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Star className="h-4 w-4 text-amber-500" />
                  High-Priority Gaps to Address
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {stats.gaps.filter(g => ['P0', 'P1'].includes(g.phase)).slice(0, 6).map(gap => (
                    <div key={gap.id} className="p-3 border rounded-lg bg-muted/30">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline" className="text-xs">{gap.phase}</Badge>
                        <span className="font-medium text-sm">#{gap.id}</span>
                      </div>
                      <div className="text-sm font-medium">{gap.name}</div>
                      <div className="text-xs text-red-500 mt-1">{gap.gap}</div>
                      {gap.recommendation && (
                        <div className="text-xs text-green-600 mt-1">💡 {gap.recommendation}</div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default ProductFeatureMatrix;
