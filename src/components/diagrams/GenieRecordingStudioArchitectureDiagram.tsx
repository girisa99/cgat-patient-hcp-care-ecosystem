import React, { useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Maximize2, X, FileImage, FileCode, Video, Download, 
  Smartphone, Zap, Target, TrendingUp, Shield, Film,
  Sparkles, Users, Radio
} from 'lucide-react';
import html2canvas from 'html2canvas';
import { toast } from 'sonner';

const colors = {
  completed: { bg: '#10b981', text: '#ffffff', light: '#d1fae5' },
  partial: { bg: '#f59e0b', text: '#ffffff', light: '#fef3c7' },
  planned: { bg: '#6366f1', text: '#ffffff', light: '#e0e7ff' },
  
  p0: { bg: '#10b981', text: '#ffffff', light: '#d1fae5' },
  p1: { bg: '#0ea5e9', text: '#ffffff', light: '#e0f2fe' },
  p2: { bg: '#f59e0b', text: '#ffffff', light: '#fef3c7' },
  p3: { bg: '#ec4899', text: '#ffffff', light: '#fce7f3' },
  p4: { bg: '#8b5cf6', text: '#ffffff', light: '#ede9fe' },
  p5: { bg: '#64748b', text: '#ffffff', light: '#f1f5f9' },
  
  spark: { bg: '#f97316', text: '#ffffff' },
  arc: { bg: '#3b82f6', text: '#ffffff' },
  hub: { bg: '#7c3aed', text: '#ffffff' },
};

// Product Suite Integration with Agent & API connections
const genieSuiteProducts = [
  {
    id: 'spark',
    name: 'Genie Spark',
    icon: '⚡',
    color: colors.spark,
    description: 'Quick Ideas & Brainstorming',
    status: 'planned',
    phase: 'P2',
    features: ['Idea capture', 'Quick prompts', 'Template starter'],
    agents: ['idea_generator_agent', 'template_matcher_agent'],
    apis: ['ai-universal-processor']
  },
  {
    id: 'arc',
    name: 'Genie Arc',
    icon: '🌈',
    color: colors.arc,
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
    icon: '🎬',
    color: colors.hub,
    description: 'Enterprise Production Center',
    status: 'partial',
    phase: 'P1',
    features: ['Multi-show management', 'Broadcast scheduling', 'Team assignments', 'Pipeline automation'],
    agents: ['production_orchestrator_agent', 'scheduling_agent', 'resource_allocation_agent'],
    apis: ['shows-api', 'calendar-sync', 'team-management']
  }
];

// Phase Roadmap Data
const phaseRoadmap = [
  {
    id: 'p0',
    label: 'P0 - Core MVP',
    color: colors.p0,
    weeks: '1-4',
    status: '72% Complete',
    features: [
      { name: 'Script Editor + AI Enhancement', status: 'done' },
      { name: 'TTS Generation (ElevenLabs/OpenAI)', status: 'done' },
      { name: 'Recording Studio Core', status: 'done' },
      { name: 'Teleprompter + Audio Mixer', status: 'done' },
      { name: 'Vibe ↔ Mind Bidirectional', status: 'done' },
      { name: 'Basic Export (MP4/WebM)', status: 'done' },
      { name: 'Project Management', status: 'done' },
      { name: 'Recording Library (IndexedDB)', status: 'done' }
    ],
    integrations: ['Mind', 'Vibe']
  },
  {
    id: 'p1',
    label: 'P1 - Mobile + Remix',
    color: colors.p1,
    weeks: '5-8',
    status: '30% Complete',
    features: [
      { name: 'One-Tap Mobile Record', status: 'planned', market: '68% want' },
      { name: 'Quick Clips Generator', status: 'planned', market: '82% creators want' },
      { name: 'Multi-Clip Timeline', status: 'planned' },
      { name: 'Quick Templates (Social)', status: 'planned' },
      { name: 'PiP Recording Enhancement', status: 'partial' },
      { name: 'Background Music Library', status: 'done' },
      { name: 'Screen + Camera PiP', status: 'partial' },
      { name: 'Arc Integration (Basic)', status: 'partial' }
    ],
    integrations: ['Mind', 'Vibe', 'Arc']
  },
  {
    id: 'p2',
    label: 'P2 - Advanced',
    color: colors.p2,
    weeks: '9-12',
    status: '10% Complete',
    features: [
      { name: 'Offline Recording', status: 'planned', market: '54% need' },
      { name: 'Voice-First Editing', status: 'planned', market: '47% want' },
      { name: 'AI Auto-Arrange', status: 'planned' },
      { name: 'Smart Transitions', status: 'planned' },
      { name: 'Music Sync Assembly', status: 'planned' },
      { name: 'Collaborative Editing', status: 'planned' },
      { name: 'Spark Integration', status: 'planned' },
      { name: 'Location Story Mode', status: 'planned' }
    ],
    integrations: ['Mind', 'Vibe', 'Arc', 'Spark']
  },
  {
    id: 'p3',
    label: 'P3 - Segments',
    color: colors.p3,
    weeks: '13-18',
    status: '0%',
    features: [
      { name: 'Voice Cloning', status: 'planned', market: '61% want' },
      { name: 'Product Demo Mode (SMB)', status: 'planned', market: '71% want' },
      { name: 'Lesson Builder (Education)', status: 'planned', market: '69% want' },
      { name: 'Patient Education (Healthcare)', status: 'planned' },
      { name: 'Testimonial Collector', status: 'planned' },
      { name: 'Multi-Language Dubbing', status: 'planned' },
      { name: 'Traveler Kit (Auto-edit)', status: 'planned', market: '76% want' },
      { name: 'HIPAA Recording Mode', status: 'planned', market: '94% want <$100/mo' }
    ],
    integrations: ['Mind', 'Vibe', 'Arc', 'Spark', 'Hub']
  },
  {
    id: 'p4',
    label: 'P4 - Enterprise',
    color: colors.p4,
    weeks: '19-26',
    status: '0%',
    features: [
      { name: 'AI Avatar Presenter', status: 'planned' },
      { name: 'White-label Solution', status: 'planned' },
      { name: 'Multi-tenant Workspaces', status: 'planned' },
      { name: 'Franchise Templates', status: 'planned' },
      { name: 'Team Review Mobile', status: 'planned' },
      { name: 'Offline Compliance Mode', status: 'planned' },
      { name: 'Native Mobile App', status: 'planned' },
      { name: 'Real-time Translation', status: 'planned' }
    ],
    integrations: ['Full Suite']
  },
  {
    id: 'p5',
    label: 'P5 - Future',
    color: colors.p5,
    weeks: '27+',
    status: '0%',
    features: [
      { name: 'Batch Video Processing', status: 'planned' },
      { name: 'API Access', status: 'planned' },
      { name: 'SSO/SAML Integration', status: 'planned' },
      { name: 'Custom Model Training', status: 'planned' },
      { name: 'Advanced Analytics', status: 'planned' },
      { name: 'B-Roll Library', status: 'planned' },
      { name: 'Version Control (Git-like)', status: 'planned' },
      { name: 'Compliance Audit Trail', status: 'planned' }
    ],
    integrations: ['Full Suite + Partners']
  }
];

// Cross-functional scenarios with agent & API mappings
const crossFunctionalMatrix = {
  universal: {
    name: 'Universal (All Products)',
    scenarios: [1, 2, 3, 4, 5, 6, 7, 8, 61, 62, 63, 64, 65, 111, 112, 126, 127],
    features: ['Script Creation', 'TTS Generation', 'Recording', 'Export', 'Vibe↔Mind'],
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

export const GenieRecordingStudioArchitectureDiagram = () => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [activeTab, setActiveTab] = useState('architecture');
  const diagramRef = useRef<HTMLDivElement>(null);

  const handleDownloadSVG = () => {
    const svgElement = document.getElementById('genie-recording-architecture-svg');
    if (svgElement) {
      const svgData = new XMLSerializer().serializeToString(svgElement);
      const blob = new Blob([svgData], { type: 'image/svg+xml' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'genie-recording-studio-architecture.svg';
      link.click();
      URL.revokeObjectURL(url);
      toast.success('SVG downloaded successfully!');
    }
  };

  const handleDownloadPNG = async () => {
    if (!diagramRef.current) return;
    
    try {
      const canvas = await html2canvas(diagramRef.current, {
        backgroundColor: '#0f172a',
        scale: 3,
        useCORS: true,
        logging: false,
      });
      
      const link = document.createElement('a');
      link.download = 'genie-recording-studio-architecture.png';
      link.href = canvas.toDataURL('image/png', 1.0);
      link.click();
      
      toast.success('PNG downloaded successfully!');
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Failed to download PNG');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'done':
        return <Badge className="text-xs" style={{ backgroundColor: colors.completed.light, color: colors.completed.bg }}>✓ Done</Badge>;
      case 'partial':
        return <Badge className="text-xs" style={{ backgroundColor: colors.partial.light, color: colors.partial.bg }}>◐ Partial</Badge>;
      default:
        return <Badge className="text-xs" style={{ backgroundColor: colors.planned.light, color: colors.planned.bg }}>○ Planned</Badge>;
    }
  };

  const ArchitectureSVG = () => (
    <svg
      id="genie-recording-architecture-svg"
      viewBox="0 0 1600 1100"
      className="w-full h-auto"
      style={{ minHeight: '800px' }}
    >
      <defs>
        <linearGradient id="genieStudioGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#7c3aed" />
          <stop offset="100%" stopColor="#4f46e5" />
        </linearGradient>
        <linearGradient id="recordingStudioGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#059669" />
          <stop offset="100%" stopColor="#0d9488" />
        </linearGradient>
        <linearGradient id="dataFlowGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#f59e0b" />
          <stop offset="100%" stopColor="#ef4444" />
        </linearGradient>
        <linearGradient id="sparkGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#f97316" />
          <stop offset="100%" stopColor="#fb923c" />
        </linearGradient>
        <linearGradient id="arcGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#3b82f6" />
          <stop offset="100%" stopColor="#60a5fa" />
        </linearGradient>
        <linearGradient id="hubGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#7c3aed" />
          <stop offset="100%" stopColor="#a78bfa" />
        </linearGradient>
        <linearGradient id="mobileGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#f97316" />
          <stop offset="100%" stopColor="#eab308" />
        </linearGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
        <filter id="dropShadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="4" stdDeviation="6" floodOpacity="0.4"/>
        </filter>
      </defs>

      <rect width="1600" height="1100" fill="#0f172a" />

      {/* Title */}
      <text x="800" y="40" textAnchor="middle" fill="#ffffff" fontSize="26" fontWeight="bold">
        Genie Suite: Mind + Vibe + Spark + Arc + Hub Architecture
      </text>
      <text x="800" y="65" textAnchor="middle" fill="#94a3b8" fontSize="13">
        Complete Production Pipeline • 140 Scenarios • 6 Phases (P0-P5) • 12 Agents • 15 APIs • Full Automation
      </text>

      {/* Stats Bar */}
      <g transform="translate(100, 80)">
        <rect x="0" y="0" width="1400" height="40" rx="8" fill="#1e293b" stroke="#334155" strokeWidth="1" />
        <text x="50" y="25" fill="#10b981" fontSize="12" fontWeight="bold">✓ 13 Implemented</text>
        <text x="200" y="25" fill="#f59e0b" fontSize="12" fontWeight="bold">◐ 7 Partial</text>
        <text x="330" y="25" fill="#6366f1" fontSize="12" fontWeight="bold">○ 120 Planned</text>
        <text x="480" y="25" fill="#a855f7" fontSize="12" fontWeight="bold">🤖 12 Agents</text>
        <text x="610" y="25" fill="#06b6d4" fontSize="12" fontWeight="bold">🔌 15 APIs</text>
        <text x="750" y="25" fill="#94a3b8" fontSize="11">|</text>
        <text x="790" y="25" fill="#f97316" fontSize="11">68% Mobile</text>
        <text x="900" y="25" fill="#0ea5e9" fontSize="11">54% Offline</text>
        <text x="1010" y="25" fill="#ec4899" fontSize="11">82% Clips</text>
        <text x="1120" y="25" fill="#10b981" fontSize="11">94% HIPAA</text>
        <text x="1230" y="25" fill="#8b5cf6" fontSize="11">6 Segments</text>
        <text x="1340" y="25" fill="#64748b" fontSize="11">5 Products</text>
      </g>

      {/* GENIE SPARK (Top Left) */}
      <g transform="translate(30, 130)">
        <rect x="0" y="0" width="180" height="120" rx="12" fill="#7c2d12" stroke="#f97316" strokeWidth="2" filter="url(#dropShadow)" />
        <rect x="0" y="0" width="180" height="35" rx="12" fill="url(#sparkGrad)" />
        <text x="90" y="24" textAnchor="middle" fill="#fff" fontSize="14" fontWeight="bold">⚡ Genie Spark</text>
        <text x="90" y="55" textAnchor="middle" fill="#fdba74" fontSize="10">Quick Ideas Hub</text>
        <text x="90" y="72" textAnchor="middle" fill="#fed7aa" fontSize="9">• Idea Capture</text>
        <text x="90" y="86" textAnchor="middle" fill="#fed7aa" fontSize="9">• Quick Prompts</text>
        <text x="90" y="100" textAnchor="middle" fill="#fed7aa" fontSize="9">• Template Starter</text>
        <rect x="130" y="4" width="45" height="16" rx="4" fill="#f59e0b" />
        <text x="152" y="15" textAnchor="middle" fill="#fff" fontSize="8" fontWeight="bold">P2</text>
      </g>

      {/* Arrow Spark → Mind */}
      <path d="M 210 190 L 260 260" stroke="#f97316" strokeWidth="2" strokeDasharray="4" markerEnd="url(#arrowOrange)" />

      {/* GENIE MIND (Left) */}
      <g transform="translate(50, 260)">
        <rect x="0" y="0" width="580" height="400" rx="16" fill="#1e1b4b" stroke="#7c3aed" strokeWidth="3" filter="url(#dropShadow)" />
        
        <rect x="0" y="0" width="580" height="50" rx="16" fill="url(#genieStudioGrad)" />
        <text x="290" y="32" textAnchor="middle" fill="#ffffff" fontSize="20" fontWeight="bold">🧞 Genie Mind</text>
        <rect x="480" y="10" width="80" height="25" rx="6" fill="#10b981" />
        <text x="520" y="27" textAnchor="middle" fill="#fff" fontSize="10" fontWeight="bold">P0 Core</text>

        {/* Projects */}
        <g transform="translate(15, 65)">
          <rect x="0" y="0" width="175" height="90" rx="10" fill="#312e81" stroke="#6366f1" strokeWidth="2" />
          <text x="87" y="20" textAnchor="middle" fill="#a5b4fc" fontSize="12" fontWeight="bold">📁 Projects</text>
          <text x="87" y="40" textAnchor="middle" fill="#e0e7ff" fontSize="9">Create & Manage</text>
          <rect x="15" y="52" width="145" height="22" rx="4" fill="#4338ca" />
          <text x="87" y="67" textAnchor="middle" fill="#fff" fontSize="8">Patient Onboarding v2</text>
        </g>

        {/* Scripts */}
        <g transform="translate(200, 65)">
          <rect x="0" y="0" width="175" height="90" rx="10" fill="#312e81" stroke="#6366f1" strokeWidth="2" />
          <text x="87" y="20" textAnchor="middle" fill="#a5b4fc" fontSize="12" fontWeight="bold">📝 Scripts</text>
          <text x="87" y="40" textAnchor="middle" fill="#e0e7ff" fontSize="9">Write + AI Enhance</text>
          <rect x="10" y="52" width="70" height="22" rx="4" fill="#059669" />
          <text x="45" y="67" textAnchor="middle" fill="#fff" fontSize="8">Original</text>
          <rect x="90" y="52" width="70" height="22" rx="4" fill="#7c3aed" />
          <text x="125" y="67" textAnchor="middle" fill="#fff" fontSize="8">Enhanced</text>
        </g>

        {/* TTS */}
        <g transform="translate(385, 65)">
          <rect x="0" y="0" width="175" height="90" rx="10" fill="#312e81" stroke="#6366f1" strokeWidth="2" />
          <text x="87" y="20" textAnchor="middle" fill="#a5b4fc" fontSize="12" fontWeight="bold">🔊 TTS Engine</text>
          <text x="87" y="40" textAnchor="middle" fill="#e0e7ff" fontSize="9">Multi-Provider</text>
          <rect x="10" y="52" width="70" height="22" rx="4" fill="#ec4899" />
          <text x="45" y="67" textAnchor="middle" fill="#fff" fontSize="8">ElevenLabs</text>
          <rect x="90" y="52" width="70" height="22" rx="4" fill="#8b5cf6" />
          <text x="125" y="67" textAnchor="middle" fill="#fff" fontSize="8">OpenAI</text>
        </g>

        {/* Bidirectional Flow */}
        <g transform="translate(15, 165)">
          <rect x="0" y="0" width="545" height="60" rx="10" fill="#042f2e" stroke="#10b981" strokeWidth="2" />
          <text x="272" y="20" textAnchor="middle" fill="#10b981" fontSize="12" fontWeight="bold">✅ Bidirectional Vibe ↔ Mind Flow (P0 Complete)</text>
          <text x="140" y="40" textAnchor="middle" fill="#ccfbf1" fontSize="9">Mind → Script → TTS → Vibe → Publish</text>
          <text x="400" y="40" textAnchor="middle" fill="#ccfbf1" fontSize="9">Vibe → ContentAnalyzer → Mind → Script</text>
          <text x="272" y="52" textAnchor="middle" fill="#5eead4" fontSize="8">ContentAnalyzer.tsx • VibeToMindBridge.tsx • ScriptVersioning</text>
        </g>

        {/* Knowledge Base */}
        <g transform="translate(15, 235)">
          <rect x="0" y="0" width="265" height="70" rx="10" fill="#1e3a5f" stroke="#3b82f6" strokeWidth="2" />
          <text x="132" y="18" textAnchor="middle" fill="#93c5fd" fontSize="11" fontWeight="bold">📚 Knowledge Base (RAG)</text>
          <rect x="10" y="30" width="75" height="30" rx="4" fill="#0d9488" />
          <text x="47" y="50" textAnchor="middle" fill="#fff" fontSize="8">Documents</text>
          <rect x="95" y="30" width="75" height="30" rx="4" fill="#0284c7" />
          <text x="132" y="50" textAnchor="middle" fill="#fff" fontSize="8">Media</text>
          <rect x="180" y="30" width="75" height="30" rx="4" fill="#9333ea" />
          <text x="217" y="50" textAnchor="middle" fill="#fff" fontSize="8">Embeddings</text>
        </g>

        {/* Mobile-First */}
        <g transform="translate(295, 235)">
          <rect x="0" y="0" width="265" height="70" rx="10" fill="#7c2d12" stroke="#f97316" strokeWidth="2" />
          <text x="132" y="18" textAnchor="middle" fill="#fdba74" fontSize="11" fontWeight="bold">📱 Mobile-First (P1-P2)</text>
          <rect x="10" y="30" width="75" height="30" rx="4" fill="#ea580c" />
          <text x="47" y="45" textAnchor="middle" fill="#fff" fontSize="8">One-Tap</text>
          <text x="47" y="55" textAnchor="middle" fill="#fed7aa" fontSize="7">68%</text>
          <rect x="95" y="30" width="75" height="30" rx="4" fill="#d97706" />
          <text x="132" y="45" textAnchor="middle" fill="#fff" fontSize="8">Offline</text>
          <text x="132" y="55" textAnchor="middle" fill="#fef3c7" fontSize="7">54%</text>
          <rect x="180" y="30" width="75" height="30" rx="4" fill="#b45309" />
          <text x="217" y="45" textAnchor="middle" fill="#fff" fontSize="8">Voice-First</text>
          <text x="217" y="55" textAnchor="middle" fill="#fef3c7" fontSize="7">47%</text>
        </g>

        {/* Context Builder */}
        <g transform="translate(15, 315)">
          <rect x="0" y="0" width="545" height="70" rx="10" fill="url(#mobileGrad)" />
          <text x="272" y="20" textAnchor="middle" fill="#1e293b" fontSize="12" fontWeight="bold">📦 Production Context Builder</text>
          <rect x="10" y="35" width="125" height="28" rx="4" fill="#fef3c7" stroke="#f59e0b" />
          <text x="72" y="53" textAnchor="middle" fill="#78350f" fontSize="8">Scripts + Timings</text>
          <rect x="145" y="35" width="125" height="28" rx="4" fill="#fef3c7" stroke="#f59e0b" />
          <text x="207" y="53" textAnchor="middle" fill="#78350f" fontSize="8">TTS Audio Files</text>
          <rect x="280" y="35" width="125" height="28" rx="4" fill="#fef3c7" stroke="#f59e0b" />
          <text x="342" y="53" textAnchor="middle" fill="#78350f" fontSize="8">Project Metadata</text>
          <rect x="415" y="35" width="120" height="28" rx="4" fill="#fef3c7" stroke="#f59e0b" />
          <text x="475" y="53" textAnchor="middle" fill="#78350f" fontSize="8">Music Tracks</text>
        </g>
      </g>

      {/* DATA FLOW ARROW */}
      <g transform="translate(640, 420)">
        <rect x="0" y="0" width="100" height="60" rx="30" fill="url(#dataFlowGrad)" filter="url(#dropShadow)" />
        <text x="50" y="28" textAnchor="middle" fill="#ffffff" fontSize="18" fontWeight="bold">→</text>
        <text x="50" y="45" textAnchor="middle" fill="#ffffff" fontSize="9" fontWeight="bold">Handoff</text>
      </g>

      {/* GENIE VIBE (Right) */}
      <g transform="translate(750, 260)">
        <rect x="0" y="0" width="580" height="400" rx="16" fill="#042f2e" stroke="#059669" strokeWidth="3" filter="url(#dropShadow)" />
        
        <rect x="0" y="0" width="580" height="50" rx="16" fill="url(#recordingStudioGrad)" />
        <text x="290" y="32" textAnchor="middle" fill="#ffffff" fontSize="20" fontWeight="bold">🎬 Genie Vibe</text>
        <rect x="480" y="10" width="80" height="25" rx="6" fill="#10b981" />
        <text x="520" y="27" textAnchor="middle" fill="#fff" fontSize="10" fontWeight="bold">P0 Core</text>

        {/* Teleprompter */}
        <g transform="translate(15, 65)">
          <rect x="0" y="0" width="175" height="90" rx="10" fill="#134e4a" stroke="#14b8a6" strokeWidth="2" />
          <text x="87" y="20" textAnchor="middle" fill="#5eead4" fontSize="12" fontWeight="bold">📜 Teleprompter</text>
          <text x="87" y="40" textAnchor="middle" fill="#ccfbf1" fontSize="9">Synced Script Display</text>
          <rect x="15" y="52" width="145" height="22" rx="4" fill="#0f766e" />
          <text x="87" y="67" textAnchor="middle" fill="#99f6e4" fontSize="8">↕ Draggable • Speed Ctrl</text>
        </g>

        {/* Video Preview */}
        <g transform="translate(200, 65)">
          <rect x="0" y="0" width="175" height="90" rx="10" fill="#134e4a" stroke="#14b8a6" strokeWidth="2" />
          <text x="87" y="20" textAnchor="middle" fill="#5eead4" fontSize="12" fontWeight="bold">📹 Video Preview</text>
          <text x="87" y="40" textAnchor="middle" fill="#ccfbf1" fontSize="9">Live Camera + Screen</text>
          <rect x="10" y="52" width="50" height="22" rx="4" fill="#0891b2" />
          <text x="35" y="67" textAnchor="middle" fill="#fff" fontSize="7">Camera</text>
          <rect x="65" y="52" width="50" height="22" rx="4" fill="#7c3aed" />
          <text x="90" y="67" textAnchor="middle" fill="#fff" fontSize="7">Screen</text>
          <rect x="120" y="52" width="45" height="22" rx="4" fill="#059669" />
          <text x="142" y="67" textAnchor="middle" fill="#fff" fontSize="7">PiP</text>
        </g>

        {/* Audio Mixer */}
        <g transform="translate(385, 65)">
          <rect x="0" y="0" width="175" height="90" rx="10" fill="#134e4a" stroke="#14b8a6" strokeWidth="2" />
          <text x="87" y="20" textAnchor="middle" fill="#5eead4" fontSize="12" fontWeight="bold">🎚️ Audio Mixer</text>
          <text x="87" y="40" textAnchor="middle" fill="#ccfbf1" fontSize="9">Multi-track Control</text>
          {/* Volume bars */}
          <rect x="25" y="52" width="10" height="25" rx="2" fill="#374151" />
          <rect x="25" y="65" width="10" height="12" rx="2" fill="#22c55e" />
          <text x="30" y="87" textAnchor="middle" fill="#9ca3af" fontSize="6">TTS</text>
          <rect x="50" y="52" width="10" height="25" rx="2" fill="#374151" />
          <rect x="50" y="58" width="10" height="19" rx="2" fill="#3b82f6" />
          <text x="55" y="87" textAnchor="middle" fill="#9ca3af" fontSize="6">VO</text>
          <rect x="75" y="52" width="10" height="25" rx="2" fill="#374151" />
          <rect x="75" y="70" width="10" height="7" rx="2" fill="#ec4899" />
          <text x="80" y="87" textAnchor="middle" fill="#9ca3af" fontSize="6">Music</text>
          <rect x="100" y="52" width="10" height="25" rx="2" fill="#374151" />
          <rect x="100" y="55" width="10" height="22" rx="2" fill="#f59e0b" />
          <text x="105" y="87" textAnchor="middle" fill="#9ca3af" fontSize="6">Mic</text>
          <text x="145" y="65" textAnchor="middle" fill="#5eead4" fontSize="7">Ducking</text>
          <text x="145" y="78" textAnchor="middle" fill="#14b8a6" fontSize="9">ON</text>
        </g>

        {/* Remix & Clips */}
        <g transform="translate(15, 165)">
          <rect x="0" y="0" width="545" height="60" rx="10" fill="#164e63" stroke="#06b6d4" strokeWidth="2" />
          <text x="272" y="20" textAnchor="middle" fill="#22d3ee" fontSize="12" fontWeight="bold">🎬 Remix & Clips Engine (P1-P2) — 82% creators want</text>
          <rect x="15" y="32" width="100" height="20" rx="4" fill="#0891b2" />
          <text x="65" y="46" textAnchor="middle" fill="#fff" fontSize="8">Quick Clips</text>
          <rect x="125" y="32" width="100" height="20" rx="4" fill="#0e7490" />
          <text x="175" y="46" textAnchor="middle" fill="#fff" fontSize="8">Multi-Clip Timeline</text>
          <rect x="235" y="32" width="100" height="20" rx="4" fill="#155e75" />
          <text x="285" y="46" textAnchor="middle" fill="#fff" fontSize="8">AI Auto-Arrange</text>
          <rect x="345" y="32" width="90" height="20" rx="4" fill="#164e63" stroke="#06b6d4" />
          <text x="390" y="46" textAnchor="middle" fill="#22d3ee" fontSize="8">Music Sync</text>
          <rect x="445" y="32" width="90" height="20" rx="4" fill="#164e63" stroke="#06b6d4" />
          <text x="490" y="46" textAnchor="middle" fill="#22d3ee" fontSize="8">Highlights</text>
        </g>

        {/* Segment Modes */}
        <g transform="translate(15, 235)">
          <rect x="0" y="0" width="545" height="70" rx="10" fill="#1e1b4b" stroke="#8b5cf6" strokeWidth="2" />
          <text x="272" y="18" textAnchor="middle" fill="#a78bfa" fontSize="11" fontWeight="bold">🎯 Segment-Specific Modes (P3-P4)</text>
          <rect x="10" y="30" width="85" height="32" rx="4" fill="#6366f1" />
          <text x="52" y="45" textAnchor="middle" fill="#fff" fontSize="8">Creator</text>
          <text x="52" y="56" textAnchor="middle" fill="#e0e7ff" fontSize="7">Clips</text>
          <rect x="100" y="30" width="85" height="32" rx="4" fill="#8b5cf6" />
          <text x="142" y="45" textAnchor="middle" fill="#fff" fontSize="8">Traveler</text>
          <text x="142" y="56" textAnchor="middle" fill="#e0e7ff" fontSize="7">Offline</text>
          <rect x="190" y="30" width="85" height="32" rx="4" fill="#a855f7" />
          <text x="232" y="45" textAnchor="middle" fill="#fff" fontSize="8">SMB</text>
          <text x="232" y="56" textAnchor="middle" fill="#e0e7ff" fontSize="7">Demo 71%</text>
          <rect x="280" y="30" width="85" height="32" rx="4" fill="#c084fc" />
          <text x="322" y="45" textAnchor="middle" fill="#fff" fontSize="8">Education</text>
          <text x="322" y="56" textAnchor="middle" fill="#e0e7ff" fontSize="7">Lessons 69%</text>
          <rect x="370" y="30" width="85" height="32" rx="4" fill="#ec4899" />
          <text x="412" y="45" textAnchor="middle" fill="#fff" fontSize="8">Healthcare</text>
          <text x="412" y="56" textAnchor="middle" fill="#fff" fontSize="7">HIPAA 94%</text>
          <rect x="460" y="30" width="75" height="32" rx="4" fill="#64748b" />
          <text x="497" y="45" textAnchor="middle" fill="#fff" fontSize="8">Enterprise</text>
          <text x="497" y="56" textAnchor="middle" fill="#e0e7ff" fontSize="7">White-label</text>
        </g>

        {/* Export & Publish */}
        <g transform="translate(15, 315)">
          <rect x="0" y="0" width="545" height="70" rx="10" fill="#1e3a5f" stroke="#3b82f6" strokeWidth="2" />
          <text x="272" y="20" textAnchor="middle" fill="#93c5fd" fontSize="12" fontWeight="bold">📤 Export & Publish Pipeline</text>
          <rect x="10" y="35" width="100" height="28" rx="4" fill="#0284c7" />
          <text x="60" y="53" textAnchor="middle" fill="#fff" fontSize="8">MP4 / WebM</text>
          <rect x="120" y="35" width="100" height="28" rx="4" fill="#0891b2" />
          <text x="170" y="53" textAnchor="middle" fill="#fff" fontSize="8">Social Cuts</text>
          <rect x="230" y="35" width="100" height="28" rx="4" fill="#0d9488" />
          <text x="280" y="53" textAnchor="middle" fill="#fff" fontSize="8">Multi-Platform</text>
          <rect x="340" y="35" width="100" height="28" rx="4" fill="#059669" />
          <text x="390" y="53" textAnchor="middle" fill="#fff" fontSize="8">Scheduled</text>
          <rect x="450" y="35" width="85" height="28" rx="4" fill="#10b981" />
          <text x="492" y="53" textAnchor="middle" fill="#fff" fontSize="8">Analytics</text>
        </g>
      </g>

      {/* GENIE ARC (Top Right) */}
      <g transform="translate(1390, 130)">
        <rect x="0" y="0" width="180" height="120" rx="12" fill="#1e3a5f" stroke="#3b82f6" strokeWidth="2" filter="url(#dropShadow)" />
        <rect x="0" y="0" width="180" height="35" rx="12" fill="url(#arcGrad)" />
        <text x="90" y="24" textAnchor="middle" fill="#fff" fontSize="14" fontWeight="bold">🌈 Genie Arc</text>
        <text x="90" y="55" textAnchor="middle" fill="#93c5fd" fontSize="10">Team Collaboration</text>
        <text x="90" y="72" textAnchor="middle" fill="#bfdbfe" fontSize="9">• Review & Approval</text>
        <text x="90" y="86" textAnchor="middle" fill="#bfdbfe" fontSize="9">• Asset Sharing</text>
        <text x="90" y="100" textAnchor="middle" fill="#bfdbfe" fontSize="9">• Version Control</text>
        <rect x="130" y="4" width="45" height="16" rx="4" fill="#0ea5e9" />
        <text x="152" y="15" textAnchor="middle" fill="#fff" fontSize="8" fontWeight="bold">P1</text>
      </g>

      {/* Arrow Vibe → Arc */}
      <path d="M 1330 450 L 1390 230" stroke="#3b82f6" strokeWidth="2" strokeDasharray="4" />

      {/* PRODUCTION HUB (Bottom Center) */}
      <g transform="translate(640, 680)">
        <rect x="0" y="0" width="320" height="100" rx="12" fill="#1e1b4b" stroke="#7c3aed" strokeWidth="2" filter="url(#dropShadow)" />
        <rect x="0" y="0" width="320" height="35" rx="12" fill="url(#hubGrad)" />
        <text x="160" y="24" textAnchor="middle" fill="#fff" fontSize="14" fontWeight="bold">🎬 Production Hub</text>
        <text x="160" y="55" textAnchor="middle" fill="#c4b5fd" fontSize="10">Enterprise Production Center (P1-P4)</text>
        <text x="80" y="75" textAnchor="middle" fill="#ddd6fe" fontSize="9">• Multi-show Mgmt</text>
        <text x="240" y="75" textAnchor="middle" fill="#ddd6fe" fontSize="9">• Broadcast Schedule</text>
        <text x="160" y="90" textAnchor="middle" fill="#ddd6fe" fontSize="9">• Team Assignments • Approval Workflows</text>
      </g>

      {/* Arrows to Hub */}
      <path d="M 340 660 L 640 720" stroke="#7c3aed" strokeWidth="2" strokeDasharray="4" />
      <path d="M 1040 660 L 960 720" stroke="#7c3aed" strokeWidth="2" strokeDasharray="4" />

      {/* Cross-Functional Legend */}
      <g transform="translate(30, 800)">
        <rect x="0" y="0" width="1540" height="120" rx="12" fill="#1e293b" stroke="#334155" strokeWidth="1" />
        <text x="770" y="25" textAnchor="middle" fill="#fff" fontSize="14" fontWeight="bold">Cross-Functional Scenarios Matrix</text>
        
        {/* Universal */}
        <g transform="translate(20, 40)">
          <rect x="0" y="0" width="280" height="65" rx="8" fill="#042f2e" stroke="#10b981" />
          <text x="140" y="18" textAnchor="middle" fill="#10b981" fontSize="10" fontWeight="bold">Universal (13 scenarios)</text>
          <text x="140" y="35" textAnchor="middle" fill="#ccfbf1" fontSize="8">Script • TTS • Recording • Export • Vibe↔Mind</text>
          <text x="140" y="50" textAnchor="middle" fill="#5eead4" fontSize="8">Products: Mind, Vibe | All 6 Segments</text>
        </g>

        {/* Mobile */}
        <g transform="translate(320, 40)">
          <rect x="0" y="0" width="280" height="65" rx="8" fill="#7c2d12" stroke="#f97316" />
          <text x="140" y="18" textAnchor="middle" fill="#f97316" fontSize="10" fontWeight="bold">Mobile-First (5 scenarios) — 68%</text>
          <text x="140" y="35" textAnchor="middle" fill="#fed7aa" fontSize="8">One-Tap • Offline • Voice-First • Quick Templates</text>
          <text x="140" y="50" textAnchor="middle" fill="#fdba74" fontSize="8">Products: Mind, Vibe, Spark | 5 Segments</text>
        </g>

        {/* Remix */}
        <g transform="translate(620, 40)">
          <rect x="0" y="0" width="280" height="65" rx="8" fill="#164e63" stroke="#06b6d4" />
          <text x="140" y="18" textAnchor="middle" fill="#06b6d4" fontSize="10" fontWeight="bold">Remix & Clips (10 scenarios) — 82%</text>
          <text x="140" y="35" textAnchor="middle" fill="#a5f3fc" fontSize="8">Quick Clips • Timeline • Auto-Arrange • Music Sync</text>
          <text x="140" y="50" textAnchor="middle" fill="#22d3ee" fontSize="8">Products: Vibe, Arc | Creator, SMB, Education</text>
        </g>

        {/* Offline */}
        <g transform="translate(920, 40)">
          <rect x="0" y="0" width="280" height="65" rx="8" fill="#312e81" stroke="#6366f1" />
          <text x="140" y="18" textAnchor="middle" fill="#6366f1" fontSize="10" fontWeight="bold">Offline Mode (3 scenarios) — 54%</text>
          <text x="140" y="35" textAnchor="middle" fill="#c7d2fe" fontSize="8">Offline Recording • Location Story • Offline Compliance</text>
          <text x="140" y="50" textAnchor="middle" fill="#a5b4fc" fontSize="8">Products: Vibe, Mind | Traveler, Healthcare, Enterprise</text>
        </g>

        {/* Compliance */}
        <g transform="translate(1220, 40)">
          <rect x="0" y="0" width="300" height="65" rx="8" fill="#4c1d95" stroke="#8b5cf6" />
          <text x="150" y="18" textAnchor="middle" fill="#8b5cf6" fontSize="10" fontWeight="bold">Compliance (7 scenarios) — 94% &lt;$100</text>
          <text x="150" y="35" textAnchor="middle" fill="#ddd6fe" fontSize="8">HIPAA • Legal Review • Audit Trail • Accessibility</text>
          <text x="150" y="50" textAnchor="middle" fill="#c4b5fd" fontSize="8">Products: Vibe, Arc, Hub | Healthcare, Enterprise</text>
        </g>
      </g>

      {/* Phase Summary Bottom */}
      <g transform="translate(30, 940)">
        <rect x="0" y="0" width="1540" height="50" rx="8" fill="#1e293b" stroke="#334155" />
        <text x="60" y="30" textAnchor="middle" fill="#10b981" fontSize="11" fontWeight="bold">P0: 72%</text>
        <text x="180" y="30" textAnchor="middle" fill="#0ea5e9" fontSize="11" fontWeight="bold">P1: 30%</text>
        <text x="300" y="30" textAnchor="middle" fill="#f59e0b" fontSize="11" fontWeight="bold">P2: 10%</text>
        <text x="420" y="30" textAnchor="middle" fill="#ec4899" fontSize="11" fontWeight="bold">P3: 0%</text>
        <text x="540" y="30" textAnchor="middle" fill="#8b5cf6" fontSize="11" fontWeight="bold">P4: 0%</text>
        <text x="660" y="30" textAnchor="middle" fill="#64748b" fontSize="11" fontWeight="bold">P5: 0%</text>
        <text x="780" y="30" fill="#94a3b8" fontSize="9">|</text>
        <text x="920" y="30" textAnchor="middle" fill="#fff" fontSize="11">Total: 140 Scenarios • 5 Products • 6 Segments • 6 Phases • 12 Agents • 27 APIs</text>
        <text x="1200" y="30" textAnchor="middle" fill="#94a3b8" fontSize="10">Overall: ~25% Complete</text>
        <text x="1420" y="30" textAnchor="middle" fill="#94a3b8" fontSize="10">Target: 8 weeks P0-P2</text>
      </g>
    </svg>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Video className="h-8 w-8 text-muted-foreground" />
              <div>
                <CardTitle className="text-2xl text-foreground">Genie Suite Architecture</CardTitle>
                <p className="text-muted-foreground text-sm">
                  Mind + Vibe + Spark + Arc + Hub | 140 Scenarios | 6 Phases | 6 Segments | 12 Agents | 27 APIs
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleDownloadSVG} className="gap-2">
                <Download className="h-4 w-4" />
                SVG
              </Button>
              <Button variant="outline" size="sm" onClick={handleDownloadPNG} className="gap-2">
                <Download className="h-4 w-4" />
                PNG
              </Button>
              <Button variant="outline" size="sm" onClick={() => setIsFullscreen(true)} className="gap-2">
                <Maximize2 className="h-4 w-4" />
                Fullscreen
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-5 w-full">
          <TabsTrigger value="architecture">Architecture</TabsTrigger>
          <TabsTrigger value="phases">Phases (P0-P5)</TabsTrigger>
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="crossfunctional">Cross-Functional</TabsTrigger>
          <TabsTrigger value="roadmap">Roadmap</TabsTrigger>
        </TabsList>

        <TabsContent value="architecture">
          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <div ref={diagramRef}>
                <ArchitectureSVG />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="phases">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {phaseRoadmap.map((phase) => {
              const stats = phase.features.reduce((acc, f) => {
                if (f.status === 'done') acc.done++;
                else if (f.status === 'partial') acc.partial++;
                else acc.planned++;
                return acc;
              }, { done: 0, partial: 0, planned: 0 });
              
              return (
                <Card key={phase.id} className="bg-card border-border">
                  <CardHeader className="pb-2" style={{ borderLeft: `4px solid ${phase.color.bg}` }}>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{phase.label}</CardTitle>
                      <Badge style={{ backgroundColor: phase.color.bg, color: phase.color.text }}>
                        {phase.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">Weeks {phase.weeks}</p>
                  </CardHeader>
                  <CardContent>
                    <div className="flex gap-2 mb-3">
                      <Badge style={{ backgroundColor: colors.completed.light, color: colors.completed.bg }}>{stats.done} Done</Badge>
                      <Badge style={{ backgroundColor: colors.partial.light, color: colors.partial.bg }}>{stats.partial} Partial</Badge>
                      <Badge style={{ backgroundColor: colors.planned.light, color: colors.planned.bg }}>{stats.planned} Planned</Badge>
                    </div>
                    <ScrollArea className="h-48">
                      <div className="space-y-2">
                        {phase.features.map((feature, idx) => (
                          <div key={idx} className="flex items-center justify-between py-1 border-b border-border/50">
                            <div className="flex-1">
                              <span className="text-sm">{feature.name}</span>
                              {feature.market && (
                                <span className="text-xs text-muted-foreground ml-2">({feature.market})</span>
                              )}
                            </div>
                            {getStatusBadge(feature.status)}
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                    <div className="mt-3 pt-2 border-t border-border">
                      <p className="text-xs text-muted-foreground">
                        Integrations: {phase.integrations.join(', ')}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="products">
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {/* Mind */}
            <Card className="bg-card border-border" style={{ borderTop: `4px solid #7c3aed` }}>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Sparkles className="h-5 w-5" />
                  Genie Mind
                </CardTitle>
                <Badge style={{ backgroundColor: colors.p0.bg, color: colors.p0.text }}>P0 Core</Badge>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-3">AI Pre-Production Command Center</p>
                <ul className="text-sm space-y-1">
                  <li>✓ Script Editor + AI</li>
                  <li>✓ TTS Generation</li>
                  <li>✓ Knowledge Base (RAG)</li>
                  <li>✓ Vibe↔Mind Bridge</li>
                  <li>○ Mobile-First UI</li>
                </ul>
              </CardContent>
            </Card>

            {/* Vibe */}
            <Card className="bg-card border-border" style={{ borderTop: `4px solid #059669` }}>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Video className="h-5 w-5" />
                  Genie Vibe
                </CardTitle>
                <Badge style={{ backgroundColor: colors.p0.bg, color: colors.p0.text }}>P0 Core</Badge>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-3">Recording & Production Studio</p>
                <ul className="text-sm space-y-1">
                  <li>✓ Teleprompter</li>
                  <li>✓ Audio Mixer</li>
                  <li>✓ Video Recording</li>
                  <li>◐ Remix & Clips</li>
                  <li>○ Segment Modes</li>
                </ul>
              </CardContent>
            </Card>

            {/* Spark */}
            <Card className="bg-card border-border" style={{ borderTop: `4px solid #f97316` }}>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  Genie Spark
                </CardTitle>
                <Badge style={{ backgroundColor: colors.p2.bg, color: colors.p2.text }}>P2</Badge>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-3">Quick Ideas & Brainstorming</p>
                <ul className="text-sm space-y-1">
                  <li>○ Idea Capture</li>
                  <li>○ Quick Prompts</li>
                  <li>○ Template Starter</li>
                  <li>○ Mind Integration</li>
                  <li>○ Voice Ideas</li>
                </ul>
              </CardContent>
            </Card>

            {/* Arc */}
            <Card className="bg-card border-border" style={{ borderTop: `4px solid #3b82f6` }}>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Genie Arc
                </CardTitle>
                <Badge style={{ backgroundColor: colors.p1.bg, color: colors.p1.text }}>P1</Badge>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-3">Team Collaboration Hub</p>
                <ul className="text-sm space-y-1">
                  <li>◐ Team Workspace</li>
                  <li>○ Review & Approval</li>
                  <li>○ Asset Sharing</li>
                  <li>○ Version Control</li>
                  <li>○ Comments</li>
                </ul>
              </CardContent>
            </Card>

            {/* Hub */}
            <Card className="bg-card border-border" style={{ borderTop: `4px solid #7c3aed` }}>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Radio className="h-5 w-5" />
                  Production Hub
                </CardTitle>
                <Badge style={{ backgroundColor: colors.p1.bg, color: colors.p1.text }}>P1-P4</Badge>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-3">Enterprise Production Center</p>
                <ul className="text-sm space-y-1">
                  <li>◐ Multi-show Mgmt</li>
                  <li>○ Broadcast Schedule</li>
                  <li>○ Team Assignments</li>
                  <li>○ Approval Workflows</li>
                  <li>○ Analytics</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="crossfunctional">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(crossFunctionalMatrix).map(([key, data]) => (
              <Card key={key} className="bg-card border-border">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">{data.name}</CardTitle>
                  {'marketData' in data && data.marketData && (
                    <Badge variant="secondary">{data.marketData}</Badge>
                  )}
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Scenarios:</p>
                      <p className="text-sm">{data.scenarios.join(', ')} ({data.scenarios.length} total)</p>
                    </div>
                    {'segments' in data && (
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Segments:</p>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {data.segments.map((seg: string) => (
                            <Badge key={seg} variant="outline" className="text-xs">{seg}</Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    {'products' in data && (
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Products:</p>
                        <p className="text-sm">{data.products.join(', ')}</p>
                      </div>
                    )}
                    {'features' in data && (
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Features:</p>
                        <p className="text-sm">{data.features.join(' • ')}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="roadmap">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle>Implementation Roadmap</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {phaseRoadmap.map((phase, idx) => (
                  <div key={phase.id} className="flex items-center gap-4 p-4 rounded-lg" style={{ backgroundColor: `${phase.color.bg}10`, borderLeft: `4px solid ${phase.color.bg}` }}>
                    <div className="w-24 text-center">
                      <Badge style={{ backgroundColor: phase.color.bg, color: phase.color.text }} className="text-lg px-3 py-1">
                        {phase.id.toUpperCase()}
                      </Badge>
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{phase.label}</p>
                      <p className="text-sm text-muted-foreground">Weeks {phase.weeks}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{phase.status}</p>
                      <p className="text-sm text-muted-foreground">{phase.features.length} features</p>
                    </div>
                    <div className="w-32">
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div 
                          className="h-full rounded-full"
                          style={{ 
                            width: `${(phase.features.filter(f => f.status === 'done').length / phase.features.length) * 100}%`,
                            backgroundColor: phase.color.bg
                          }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Fullscreen Modal */}
      {isFullscreen && (
        <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm">
          <div className="absolute top-4 right-4 z-10 flex gap-2">
            <Button variant="outline" size="sm" onClick={handleDownloadSVG} className="gap-2">
              <FileCode className="h-4 w-4" />
              SVG
            </Button>
            <Button variant="outline" size="sm" onClick={handleDownloadPNG} className="gap-2">
              <FileImage className="h-4 w-4" />
              PNG
            </Button>
            <Button variant="outline" size="sm" onClick={() => setIsFullscreen(false)} className="gap-2">
              <X className="h-4 w-4" />
              Close
            </Button>
          </div>
          <ScrollArea className="h-screen w-screen p-8">
            <div ref={diagramRef}>
              <ArchitectureSVG />
            </div>
          </ScrollArea>
        </div>
      )}
    </div>
  );
};
