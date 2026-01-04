import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ExternalLink, 
  FileText, 
  Server, 
  Database, 
  Cpu, 
  Workflow, 
  GitBranch,
  CheckCircle,
  Clock,
  AlertCircle,
  Layers
} from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

export const GenieStudioTechnicalArchDiagram = () => {
  const [activeTab, setActiveTab] = useState('overview');

  const openDocs = () => {
    window.open('/docs/GENIE_STUDIO_TECHNICAL_ARCHITECTURE.md', '_blank');
  };

  return (
    <div className="space-y-6">
      {/* Header with Doc Link */}
      <Card className="bg-gradient-to-r from-violet-900/20 to-purple-900/20 border-violet-500/30">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Server className="h-8 w-8 text-violet-400" />
              <div>
                <CardTitle className="text-2xl text-white">Technical Architecture</CardTitle>
                <p className="text-violet-300 text-sm">Genie Studio & Recording Studio - System Design</p>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={openDocs} className="gap-2">
              <FileText className="h-4 w-4" />
              Full Documentation
              <ExternalLink className="h-3 w-3" />
            </Button>
          </div>
        </CardHeader>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-5 w-full bg-muted/50">
          <TabsTrigger value="overview">System Overview</TabsTrigger>
          <TabsTrigger value="script-pipeline">Script Pipeline</TabsTrigger>
          <TabsTrigger value="recording-pipeline">Recording Pipeline</TabsTrigger>
          <TabsTrigger value="data-model">Data Model</TabsTrigger>
          <TabsTrigger value="integration">Integration Points</TabsTrigger>
        </TabsList>

        <ScrollArea className="h-[600px] mt-4">
          <TabsContent value="overview" className="space-y-4">
            {/* System Overview SVG Diagram */}
            <Card className="bg-slate-900/50 border-slate-700">
              <CardContent className="pt-6">
                <svg viewBox="0 0 1200 600" className="w-full h-auto">
                  <defs>
                    <linearGradient id="techGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#7c3aed" />
                      <stop offset="100%" stopColor="#4f46e5" />
                    </linearGradient>
                    <linearGradient id="techGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#059669" />
                      <stop offset="100%" stopColor="#0d9488" />
                    </linearGradient>
                    <linearGradient id="techGrad3" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#f59e0b" />
                      <stop offset="100%" stopColor="#ef4444" />
                    </linearGradient>
                    <marker id="arrowTech" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                      <polygon points="0 0, 10 3.5, 0 7" fill="#60a5fa" />
                    </marker>
                  </defs>

                  {/* Background */}
                  <rect width="1200" height="600" fill="#0f172a" rx="12" />

                  {/* Title */}
                  <text x="600" y="40" textAnchor="middle" fill="#fff" fontSize="24" fontWeight="bold">
                    Genie Studio Technical Architecture - P0/P1/P2
                  </text>

                  {/* Frontend Layer */}
                  <g transform="translate(50, 80)">
                    <rect width="1100" height="100" rx="12" fill="#1e1b4b" stroke="#6366f1" strokeWidth="2" />
                    <text x="20" y="30" fill="#a5b4fc" fontSize="14" fontWeight="bold">FRONTEND LAYER (React + Vite + TypeScript)</text>
                    
                    <rect x="20" y="45" width="160" height="40" rx="6" fill="#4338ca" />
                    <text x="100" y="70" textAnchor="middle" fill="#fff" fontSize="11">GenieStudio.tsx</text>
                    
                    <rect x="200" y="45" width="160" height="40" rx="6" fill="#4338ca" />
                    <text x="280" y="70" textAnchor="middle" fill="#fff" fontSize="11">RecordingStudio.tsx</text>
                    
                    <rect x="380" y="45" width="160" height="40" rx="6" fill="#4338ca" />
                    <text x="460" y="70" textAnchor="middle" fill="#fff" fontSize="11">Teleprompter.tsx</text>
                    
                    <rect x="560" y="45" width="160" height="40" rx="6" fill="#4338ca" />
                    <text x="640" y="70" textAnchor="middle" fill="#fff" fontSize="11">AudioMixer.tsx</text>
                    
                    <rect x="740" y="45" width="160" height="40" rx="6" fill="#4338ca" />
                    <text x="820" y="70" textAnchor="middle" fill="#fff" fontSize="11">ScriptEditor.tsx</text>
                    
                    <rect x="920" y="45" width="160" height="40" rx="6" fill="#4338ca" />
                    <text x="1000" y="70" textAnchor="middle" fill="#fff" fontSize="11">ProjectManager.tsx</text>
                  </g>

                  {/* Services Layer */}
                  <g transform="translate(50, 200)">
                    <rect width="1100" height="100" rx="12" fill="#1e3a5f" stroke="#3b82f6" strokeWidth="2" />
                    <text x="20" y="30" fill="#93c5fd" fontSize="14" fontWeight="bold">SERVICES LAYER (Hooks & Services)</text>
                    
                    <rect x="20" y="45" width="200" height="40" rx="6" fill="#2563eb" />
                    <text x="120" y="70" textAnchor="middle" fill="#fff" fontSize="11">useUniversalAI</text>
                    
                    <rect x="240" y="45" width="200" height="40" rx="6" fill="#2563eb" />
                    <text x="340" y="70" textAnchor="middle" fill="#fff" fontSize="11">genieConversationService</text>
                    
                    <rect x="460" y="45" width="200" height="40" rx="6" fill="#2563eb" />
                    <text x="560" y="70" textAnchor="middle" fill="#fff" fontSize="11">useRecordingStudio</text>
                    
                    <rect x="680" y="45" width="200" height="40" rx="6" fill="#2563eb" />
                    <text x="780" y="70" textAnchor="middle" fill="#fff" fontSize="11">useTTSGeneration</text>
                    
                    <rect x="900" y="45" width="180" height="40" rx="6" fill="#2563eb" />
                    <text x="990" y="70" textAnchor="middle" fill="#fff" fontSize="11">useMediaRecorder</text>
                  </g>

                  {/* Edge Functions Layer */}
                  <g transform="translate(50, 320)">
                    <rect width="1100" height="100" rx="12" fill="#134e4a" stroke="#14b8a6" strokeWidth="2" />
                    <text x="20" y="30" fill="#5eead4" fontSize="14" fontWeight="bold">EDGE FUNCTIONS (Supabase)</text>
                    
                    <rect x="20" y="45" width="180" height="40" rx="6" fill="#0f766e" />
                    <text x="110" y="70" textAnchor="middle" fill="#fff" fontSize="10">ai-universal-processor</text>
                    
                    <rect x="220" y="45" width="180" height="40" rx="6" fill="#0f766e" />
                    <text x="310" y="70" textAnchor="middle" fill="#fff" fontSize="10">tts-generate</text>
                    
                    <rect x="420" y="45" width="180" height="40" rx="6" fill="#0f766e" />
                    <text x="510" y="70" textAnchor="middle" fill="#fff" fontSize="10">script-enhance</text>
                    
                    <rect x="620" y="45" width="180" height="40" rx="6" fill="#0f766e" />
                    <text x="710" y="70" textAnchor="middle" fill="#fff" fontSize="10">media-processor</text>
                    
                    <rect x="820" y="45" width="180" height="40" rx="6" fill="#0f766e" />
                    <text x="910" y="70" textAnchor="middle" fill="#fff" fontSize="10">knowledge-search</text>
                  </g>

                  {/* Database Layer */}
                  <g transform="translate(50, 440)">
                    <rect width="1100" height="100" rx="12" fill="#422006" stroke="#f59e0b" strokeWidth="2" />
                    <text x="20" y="30" fill="#fcd34d" fontSize="14" fontWeight="bold">DATABASE LAYER (Supabase PostgreSQL)</text>
                    
                    <rect x="20" y="45" width="160" height="40" rx="6" fill="#b45309" />
                    <text x="100" y="70" textAnchor="middle" fill="#fff" fontSize="10">genie_projects</text>
                    
                    <rect x="200" y="45" width="160" height="40" rx="6" fill="#b45309" />
                    <text x="280" y="70" textAnchor="middle" fill="#fff" fontSize="10">genie_scripts</text>
                    
                    <rect x="380" y="45" width="160" height="40" rx="6" fill="#b45309" />
                    <text x="460" y="70" textAnchor="middle" fill="#fff" fontSize="10">genie_recordings</text>
                    
                    <rect x="560" y="45" width="160" height="40" rx="6" fill="#b45309" />
                    <text x="640" y="70" textAnchor="middle" fill="#fff" fontSize="10">genie_tts_audio</text>
                    
                    <rect x="740" y="45" width="180" height="40" rx="6" fill="#b45309" />
                    <text x="830" y="70" textAnchor="middle" fill="#fff" fontSize="10">universal_knowledge_base</text>
                    
                    <rect x="940" y="45" width="140" height="40" rx="6" fill="#b45309" />
                    <text x="1010" y="70" textAnchor="middle" fill="#fff" fontSize="10">agent_conversations</text>
                  </g>

                  {/* Connecting Arrows */}
                  <line x1="600" y1="180" x2="600" y2="200" stroke="#60a5fa" strokeWidth="2" markerEnd="url(#arrowTech)" />
                  <line x1="600" y1="300" x2="600" y2="320" stroke="#60a5fa" strokeWidth="2" markerEnd="url(#arrowTech)" />
                  <line x1="600" y1="420" x2="600" y2="440" stroke="#60a5fa" strokeWidth="2" markerEnd="url(#arrowTech)" />

                  {/* Legend */}
                  <g transform="translate(50, 560)">
                    <rect x="0" y="0" width="20" height="12" fill="#4338ca" rx="2" />
                    <text x="30" y="10" fill="#94a3b8" fontSize="10">React Components</text>
                    
                    <rect x="160" y="0" width="20" height="12" fill="#2563eb" rx="2" />
                    <text x="190" y="10" fill="#94a3b8" fontSize="10">Hooks/Services</text>
                    
                    <rect x="300" y="0" width="20" height="12" fill="#0f766e" rx="2" />
                    <text x="330" y="10" fill="#94a3b8" fontSize="10">Edge Functions</text>
                    
                    <rect x="440" y="0" width="20" height="12" fill="#b45309" rx="2" />
                    <text x="470" y="10" fill="#94a3b8" fontSize="10">Database Tables</text>
                  </g>
                </svg>
              </CardContent>
            </Card>

            {/* Implementation Status Grid */}
            <div className="grid grid-cols-3 gap-4">
              <Card className="bg-emerald-900/20 border-emerald-500/30">
                <CardContent className="pt-4">
                  <div className="flex items-center gap-2 mb-3">
                    <CheckCircle className="h-5 w-5 text-emerald-400" />
                    <span className="text-emerald-300 font-semibold">P0 Core - 90% Done</span>
                  </div>
                  <ul className="text-sm text-emerald-200 space-y-1">
                    <li>✓ Script creation & editing</li>
                    <li>✓ TTS generation (ElevenLabs)</li>
                    <li>✓ Basic recording</li>
                    <li>✓ Teleprompter sync</li>
                    <li>○ Export pipeline</li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="bg-blue-900/20 border-blue-500/30">
                <CardContent className="pt-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Clock className="h-5 w-5 text-blue-400" />
                    <span className="text-blue-300 font-semibold">P1 Enhanced - 60% Done</span>
                  </div>
                  <ul className="text-sm text-blue-200 space-y-1">
                    <li>✓ Multi-track audio</li>
                    <li>✓ AI script enhancement</li>
                    <li>○ Screen recording</li>
                    <li>○ Audio ducking</li>
                    <li>○ Template library</li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="bg-amber-900/20 border-amber-500/30">
                <CardContent className="pt-4">
                  <div className="flex items-center gap-2 mb-3">
                    <AlertCircle className="h-5 w-5 text-amber-400" />
                    <span className="text-amber-300 font-semibold">P2 Advanced - 30% Done</span>
                  </div>
                  <ul className="text-sm text-amber-200 space-y-1">
                    <li>○ Collaborative editing</li>
                    <li>○ Version control</li>
                    <li>○ Analytics dashboard</li>
                    <li>○ Batch processing</li>
                    <li>○ API integrations</li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="script-pipeline" className="space-y-4">
            <Card className="bg-slate-900/50 border-slate-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-violet-300">
                  <Workflow className="h-5 w-5" />
                  Script Generation Pipeline
                </CardTitle>
              </CardHeader>
              <CardContent>
                <svg viewBox="0 0 1000 400" className="w-full h-auto">
                  <rect width="1000" height="400" fill="#0f172a" rx="8" />
                  
                  {/* Pipeline Steps */}
                  <g transform="translate(50, 50)">
                    {/* Step 1: Input */}
                    <rect x="0" y="0" width="160" height="80" rx="8" fill="#7c3aed" />
                    <text x="80" y="35" textAnchor="middle" fill="#fff" fontSize="12" fontWeight="bold">1. INPUT</text>
                    <text x="80" y="55" textAnchor="middle" fill="#e0e7ff" fontSize="10">User provides topic</text>
                    <text x="80" y="70" textAnchor="middle" fill="#e0e7ff" fontSize="10">or document</text>
                    
                    <line x1="160" y1="40" x2="200" y2="40" stroke="#60a5fa" strokeWidth="2" markerEnd="url(#arrowTech)" />
                    
                    {/* Step 2: AI Processing */}
                    <rect x="200" y="0" width="160" height="80" rx="8" fill="#ec4899" />
                    <text x="280" y="35" textAnchor="middle" fill="#fff" fontSize="12" fontWeight="bold">2. AI PROCESS</text>
                    <text x="280" y="55" textAnchor="middle" fill="#fce7f3" fontSize="10">useUniversalAI</text>
                    <text x="280" y="70" textAnchor="middle" fill="#fce7f3" fontSize="10">generates script</text>
                    
                    <line x1="360" y1="40" x2="400" y2="40" stroke="#60a5fa" strokeWidth="2" markerEnd="url(#arrowTech)" />
                    
                    {/* Step 3: Enhancement */}
                    <rect x="400" y="0" width="160" height="80" rx="8" fill="#3b82f6" />
                    <text x="480" y="35" textAnchor="middle" fill="#fff" fontSize="12" fontWeight="bold">3. ENHANCE</text>
                    <text x="480" y="55" textAnchor="middle" fill="#dbeafe" fontSize="10">Script optimization</text>
                    <text x="480" y="70" textAnchor="middle" fill="#dbeafe" fontSize="10">& timing calc</text>
                    
                    <line x1="560" y1="40" x2="600" y2="40" stroke="#60a5fa" strokeWidth="2" markerEnd="url(#arrowTech)" />
                    
                    {/* Step 4: TTS */}
                    <rect x="600" y="0" width="160" height="80" rx="8" fill="#059669" />
                    <text x="680" y="35" textAnchor="middle" fill="#fff" fontSize="12" fontWeight="bold">4. TTS</text>
                    <text x="680" y="55" textAnchor="middle" fill="#d1fae5" fontSize="10">ElevenLabs API</text>
                    <text x="680" y="70" textAnchor="middle" fill="#d1fae5" fontSize="10">voice generation</text>
                    
                    <line x1="760" y1="40" x2="800" y2="40" stroke="#60a5fa" strokeWidth="2" markerEnd="url(#arrowTech)" />
                    
                    {/* Step 5: Output */}
                    <rect x="800" y="0" width="140" height="80" rx="8" fill="#f59e0b" />
                    <text x="870" y="35" textAnchor="middle" fill="#fff" fontSize="12" fontWeight="bold">5. OUTPUT</text>
                    <text x="870" y="55" textAnchor="middle" fill="#fef3c7" fontSize="10">Script + Audio</text>
                    <text x="870" y="70" textAnchor="middle" fill="#fef3c7" fontSize="10">ready for recording</text>
                  </g>

                  {/* Data Flow Details */}
                  <g transform="translate(50, 160)">
                    <rect width="900" height="180" rx="8" fill="#1e293b" stroke="#475569" strokeWidth="1" />
                    <text x="20" y="30" fill="#94a3b8" fontSize="12" fontWeight="bold">DATA FLOW DETAILS</text>
                    
                    <text x="20" y="60" fill="#60a5fa" fontSize="11">Input Types:</text>
                    <text x="120" y="60" fill="#e2e8f0" fontSize="10">Text prompt, Document upload, Knowledge base query, Template selection</text>
                    
                    <text x="20" y="90" fill="#60a5fa" fontSize="11">AI Models:</text>
                    <text x="120" y="90" fill="#e2e8f0" fontSize="10">OpenAI GPT-4, Claude, Gemini (configurable via useUniversalAI)</text>
                    
                    <text x="20" y="120" fill="#60a5fa" fontSize="11">TTS Voices:</text>
                    <text x="120" y="120" fill="#e2e8f0" fontSize="10">ElevenLabs (30+ voices), Browser TTS fallback, Custom voice cloning (P3)</text>
                    
                    <text x="20" y="150" fill="#60a5fa" fontSize="11">Storage:</text>
                    <text x="120" y="150" fill="#e2e8f0" fontSize="10">Supabase Storage (audio), PostgreSQL (metadata), edge function processing</text>
                  </g>
                </svg>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="recording-pipeline" className="space-y-4">
            <Card className="bg-slate-900/50 border-slate-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-emerald-300">
                  <GitBranch className="h-5 w-5" />
                  Recording Pipeline
                </CardTitle>
              </CardHeader>
              <CardContent>
                <svg viewBox="0 0 1000 500" className="w-full h-auto">
                  <rect width="1000" height="500" fill="#0f172a" rx="8" />
                  
                  {/* Manual Recording Path */}
                  <g transform="translate(50, 40)">
                    <text x="0" y="20" fill="#10b981" fontSize="14" fontWeight="bold">MANUAL RECORDING PATH</text>
                    
                    <rect x="0" y="40" width="140" height="60" rx="8" fill="#059669" />
                    <text x="70" y="70" textAnchor="middle" fill="#fff" fontSize="11">Context</text>
                    <text x="70" y="85" textAnchor="middle" fill="#d1fae5" fontSize="9">from Genie Studio</text>
                    
                    <line x1="140" y1="70" x2="180" y2="70" stroke="#10b981" strokeWidth="2" />
                    
                    <rect x="180" y="40" width="140" height="60" rx="8" fill="#0f766e" />
                    <text x="250" y="70" textAnchor="middle" fill="#fff" fontSize="11">Teleprompter</text>
                    <text x="250" y="85" textAnchor="middle" fill="#ccfbf1" fontSize="9">Script display</text>
                    
                    <line x1="320" y1="70" x2="360" y2="70" stroke="#10b981" strokeWidth="2" />
                    
                    <rect x="360" y="40" width="140" height="60" rx="8" fill="#0d9488" />
                    <text x="430" y="70" textAnchor="middle" fill="#fff" fontSize="11">Video Capture</text>
                    <text x="430" y="85" textAnchor="middle" fill="#ccfbf1" fontSize="9">Camera/Screen</text>
                    
                    <line x1="500" y1="70" x2="540" y2="70" stroke="#10b981" strokeWidth="2" />
                    
                    <rect x="540" y="40" width="140" height="60" rx="8" fill="#14b8a6" />
                    <text x="610" y="70" textAnchor="middle" fill="#fff" fontSize="11">Audio Mixer</text>
                    <text x="610" y="85" textAnchor="middle" fill="#f0fdfa" fontSize="9">Multi-track</text>
                    
                    <line x1="680" y1="70" x2="720" y2="70" stroke="#10b981" strokeWidth="2" />
                    
                    <rect x="720" y="40" width="140" height="60" rx="8" fill="#2dd4bf" />
                    <text x="790" y="70" textAnchor="middle" fill="#042f2e" fontSize="11">Export</text>
                    <text x="790" y="85" textAnchor="middle" fill="#134e4a" fontSize="9">MP4/WebM</text>
                  </g>

                  {/* TTS-Only Path */}
                  <g transform="translate(50, 160)">
                    <text x="0" y="20" fill="#8b5cf6" fontSize="14" fontWeight="bold">TTS-ONLY PATH (AUTOMATED)</text>
                    
                    <rect x="0" y="40" width="140" height="60" rx="8" fill="#7c3aed" />
                    <text x="70" y="70" textAnchor="middle" fill="#fff" fontSize="11">Script</text>
                    <text x="70" y="85" textAnchor="middle" fill="#e0e7ff" fontSize="9">from editor</text>
                    
                    <line x1="140" y1="70" x2="180" y2="70" stroke="#8b5cf6" strokeWidth="2" />
                    
                    <rect x="180" y="40" width="140" height="60" rx="8" fill="#6d28d9" />
                    <text x="250" y="70" textAnchor="middle" fill="#fff" fontSize="11">TTS Engine</text>
                    <text x="250" y="85" textAnchor="middle" fill="#ede9fe" fontSize="9">ElevenLabs</text>
                    
                    <line x1="320" y1="70" x2="360" y2="70" stroke="#8b5cf6" strokeWidth="2" />
                    
                    <rect x="360" y="40" width="140" height="60" rx="8" fill="#5b21b6" />
                    <text x="430" y="70" textAnchor="middle" fill="#fff" fontSize="11">Audio Track</text>
                    <text x="430" y="85" textAnchor="middle" fill="#ede9fe" fontSize="9">+ Background</text>
                    
                    <line x1="500" y1="70" x2="720" y2="70" stroke="#8b5cf6" strokeWidth="2" strokeDasharray="5,5" />
                    
                    <rect x="720" y="40" width="140" height="60" rx="8" fill="#a78bfa" />
                    <text x="790" y="70" textAnchor="middle" fill="#1e1b4b" fontSize="11">Audio Export</text>
                    <text x="790" y="85" textAnchor="middle" fill="#2e1065" fontSize="9">MP3/WAV</text>
                  </g>

                  {/* Hybrid Path */}
                  <g transform="translate(50, 280)">
                    <text x="0" y="20" fill="#f59e0b" fontSize="14" fontWeight="bold">HYBRID PATH (RECOMMENDED)</text>
                    
                    <rect x="0" y="40" width="200" height="60" rx="8" fill="#f59e0b" />
                    <text x="100" y="65" textAnchor="middle" fill="#fff" fontSize="11">TTS + Manual Override</text>
                    <text x="100" y="80" textAnchor="middle" fill="#fef3c7" fontSize="9">Best of both worlds</text>
                    
                    <line x1="200" y1="70" x2="240" y2="70" stroke="#f59e0b" strokeWidth="2" />
                    
                    <rect x="240" y="40" width="200" height="60" rx="8" fill="#d97706" />
                    <text x="340" y="65" textAnchor="middle" fill="#fff" fontSize="11">Preview & Edit</text>
                    <text x="340" y="80" textAnchor="middle" fill="#fef3c7" fontSize="9">Timeline editor</text>
                    
                    <line x1="440" y1="70" x2="480" y2="70" stroke="#f59e0b" strokeWidth="2" />
                    
                    <rect x="480" y="40" width="200" height="60" rx="8" fill="#b45309" />
                    <text x="580" y="65" textAnchor="middle" fill="#fff" fontSize="11">Mix & Master</text>
                    <text x="580" y="80" textAnchor="middle" fill="#fef3c7" fontSize="9">Final adjustments</text>
                    
                    <line x1="680" y1="70" x2="720" y2="70" stroke="#f59e0b" strokeWidth="2" />
                    
                    <rect x="720" y="40" width="140" height="60" rx="8" fill="#92400e" />
                    <text x="790" y="65" textAnchor="middle" fill="#fff" fontSize="11">Final Export</text>
                    <text x="790" y="80" textAnchor="middle" fill="#fef3c7" fontSize="9">All formats</text>
                  </g>

                  {/* Status Labels */}
                  <g transform="translate(50, 420)">
                    <rect x="0" y="0" width="80" height="24" rx="4" fill="#22c55e" />
                    <text x="40" y="16" textAnchor="middle" fill="#fff" fontSize="10">Implemented</text>
                    
                    <rect x="100" y="0" width="80" height="24" rx="4" fill="#3b82f6" />
                    <text x="140" y="16" textAnchor="middle" fill="#fff" fontSize="10">Partial</text>
                    
                    <rect x="200" y="0" width="80" height="24" rx="4" fill="#6b7280" />
                    <text x="240" y="16" textAnchor="middle" fill="#fff" fontSize="10">Planned</text>
                  </g>
                </svg>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="data-model" className="space-y-4">
            <Card className="bg-slate-900/50 border-slate-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-amber-300">
                  <Database className="h-5 w-5" />
                  Database Schema
                </CardTitle>
              </CardHeader>
              <CardContent>
                <svg viewBox="0 0 1000 500" className="w-full h-auto">
                  <rect width="1000" height="500" fill="#0f172a" rx="8" />
                  
                  {/* genie_projects table */}
                  <g transform="translate(50, 30)">
                    <rect width="200" height="160" rx="8" fill="#1e293b" stroke="#f59e0b" strokeWidth="2" />
                    <rect width="200" height="30" rx="8" fill="#f59e0b" />
                    <text x="100" y="20" textAnchor="middle" fill="#fff" fontSize="12" fontWeight="bold">genie_projects</text>
                    
                    <text x="15" y="50" fill="#fcd34d" fontSize="10">id</text>
                    <text x="120" y="50" fill="#94a3b8" fontSize="9">UUID PK</text>
                    
                    <text x="15" y="70" fill="#e2e8f0" fontSize="10">name</text>
                    <text x="120" y="70" fill="#94a3b8" fontSize="9">TEXT</text>
                    
                    <text x="15" y="90" fill="#e2e8f0" fontSize="10">user_id</text>
                    <text x="120" y="90" fill="#94a3b8" fontSize="9">UUID FK</text>
                    
                    <text x="15" y="110" fill="#e2e8f0" fontSize="10">status</text>
                    <text x="120" y="110" fill="#94a3b8" fontSize="9">TEXT</text>
                    
                    <text x="15" y="130" fill="#e2e8f0" fontSize="10">metadata</text>
                    <text x="120" y="130" fill="#94a3b8" fontSize="9">JSONB</text>
                    
                    <text x="15" y="150" fill="#e2e8f0" fontSize="10">created_at</text>
                    <text x="120" y="150" fill="#94a3b8" fontSize="9">TIMESTAMPTZ</text>
                  </g>

                  {/* genie_scripts table */}
                  <g transform="translate(300, 30)">
                    <rect width="200" height="180" rx="8" fill="#1e293b" stroke="#7c3aed" strokeWidth="2" />
                    <rect width="200" height="30" rx="8" fill="#7c3aed" />
                    <text x="100" y="20" textAnchor="middle" fill="#fff" fontSize="12" fontWeight="bold">genie_scripts</text>
                    
                    <text x="15" y="50" fill="#a5b4fc" fontSize="10">id</text>
                    <text x="120" y="50" fill="#94a3b8" fontSize="9">UUID PK</text>
                    
                    <text x="15" y="70" fill="#e2e8f0" fontSize="10">project_id</text>
                    <text x="120" y="70" fill="#94a3b8" fontSize="9">UUID FK</text>
                    
                    <text x="15" y="90" fill="#e2e8f0" fontSize="10">title</text>
                    <text x="120" y="90" fill="#94a3b8" fontSize="9">TEXT</text>
                    
                    <text x="15" y="110" fill="#e2e8f0" fontSize="10">content</text>
                    <text x="120" y="110" fill="#94a3b8" fontSize="9">TEXT</text>
                    
                    <text x="15" y="130" fill="#e2e8f0" fontSize="10">enhanced_content</text>
                    <text x="120" y="130" fill="#94a3b8" fontSize="9">TEXT</text>
                    
                    <text x="15" y="150" fill="#e2e8f0" fontSize="10">duration_estimate</text>
                    <text x="120" y="150" fill="#94a3b8" fontSize="9">INTEGER</text>
                    
                    <text x="15" y="170" fill="#e2e8f0" fontSize="10">version</text>
                    <text x="120" y="170" fill="#94a3b8" fontSize="9">INTEGER</text>
                  </g>

                  {/* genie_recordings table */}
                  <g transform="translate(550, 30)">
                    <rect width="200" height="180" rx="8" fill="#1e293b" stroke="#059669" strokeWidth="2" />
                    <rect width="200" height="30" rx="8" fill="#059669" />
                    <text x="100" y="20" textAnchor="middle" fill="#fff" fontSize="12" fontWeight="bold">genie_recordings</text>
                    
                    <text x="15" y="50" fill="#6ee7b7" fontSize="10">id</text>
                    <text x="120" y="50" fill="#94a3b8" fontSize="9">UUID PK</text>
                    
                    <text x="15" y="70" fill="#e2e8f0" fontSize="10">script_id</text>
                    <text x="120" y="70" fill="#94a3b8" fontSize="9">UUID FK</text>
                    
                    <text x="15" y="90" fill="#e2e8f0" fontSize="10">video_url</text>
                    <text x="120" y="90" fill="#94a3b8" fontSize="9">TEXT</text>
                    
                    <text x="15" y="110" fill="#e2e8f0" fontSize="10">audio_url</text>
                    <text x="120" y="110" fill="#94a3b8" fontSize="9">TEXT</text>
                    
                    <text x="15" y="130" fill="#e2e8f0" fontSize="10">duration</text>
                    <text x="120" y="130" fill="#94a3b8" fontSize="9">INTEGER</text>
                    
                    <text x="15" y="150" fill="#e2e8f0" fontSize="10">status</text>
                    <text x="120" y="150" fill="#94a3b8" fontSize="9">TEXT</text>
                    
                    <text x="15" y="170" fill="#e2e8f0" fontSize="10">quality_score</text>
                    <text x="120" y="170" fill="#94a3b8" fontSize="9">DECIMAL</text>
                  </g>

                  {/* genie_tts_audio table */}
                  <g transform="translate(800, 30)">
                    <rect width="180" height="160" rx="8" fill="#1e293b" stroke="#ec4899" strokeWidth="2" />
                    <rect width="180" height="30" rx="8" fill="#ec4899" />
                    <text x="90" y="20" textAnchor="middle" fill="#fff" fontSize="12" fontWeight="bold">genie_tts_audio</text>
                    
                    <text x="15" y="50" fill="#f9a8d4" fontSize="10">id</text>
                    <text x="110" y="50" fill="#94a3b8" fontSize="9">UUID PK</text>
                    
                    <text x="15" y="70" fill="#e2e8f0" fontSize="10">script_id</text>
                    <text x="110" y="70" fill="#94a3b8" fontSize="9">UUID FK</text>
                    
                    <text x="15" y="90" fill="#e2e8f0" fontSize="10">voice_id</text>
                    <text x="110" y="90" fill="#94a3b8" fontSize="9">TEXT</text>
                    
                    <text x="15" y="110" fill="#e2e8f0" fontSize="10">audio_url</text>
                    <text x="110" y="110" fill="#94a3b8" fontSize="9">TEXT</text>
                    
                    <text x="15" y="130" fill="#e2e8f0" fontSize="10">provider</text>
                    <text x="110" y="130" fill="#94a3b8" fontSize="9">TEXT</text>
                    
                    <text x="15" y="150" fill="#e2e8f0" fontSize="10">duration_ms</text>
                    <text x="110" y="150" fill="#94a3b8" fontSize="9">INTEGER</text>
                  </g>

                  {/* Relationship Lines */}
                  <line x1="250" y1="100" x2="300" y2="100" stroke="#60a5fa" strokeWidth="2" />
                  <line x1="500" y1="100" x2="550" y2="100" stroke="#60a5fa" strokeWidth="2" />
                  <line x1="500" y1="60" x2="800" y2="60" stroke="#60a5fa" strokeWidth="1" strokeDasharray="4,4" />

                  {/* universal_knowledge_base */}
                  <g transform="translate(50, 250)">
                    <rect width="280" height="140" rx="8" fill="#1e293b" stroke="#3b82f6" strokeWidth="2" />
                    <rect width="280" height="30" rx="8" fill="#3b82f6" />
                    <text x="140" y="20" textAnchor="middle" fill="#fff" fontSize="12" fontWeight="bold">universal_knowledge_base</text>
                    
                    <text x="15" y="50" fill="#93c5fd" fontSize="10">id, title, content, content_type</text>
                    <text x="15" y="70" fill="#e2e8f0" fontSize="10">source_type, source_id, category</text>
                    <text x="15" y="90" fill="#e2e8f0" fontSize="10">tags[], search_vector (tsvector)</text>
                    <text x="15" y="110" fill="#e2e8f0" fontSize="10">embedding (vector), metadata</text>
                    <text x="15" y="130" fill="#94a3b8" fontSize="9">Used for RAG-enabled script generation</text>
                  </g>

                  {/* agent_conversations */}
                  <g transform="translate(380, 250)">
                    <rect width="280" height="140" rx="8" fill="#1e293b" stroke="#14b8a6" strokeWidth="2" />
                    <rect width="280" height="30" rx="8" fill="#14b8a6" />
                    <text x="140" y="20" textAnchor="middle" fill="#fff" fontSize="12" fontWeight="bold">agent_conversations</text>
                    
                    <text x="15" y="50" fill="#5eead4" fontSize="10">id, agent_id, user_id, session_id</text>
                    <text x="15" y="70" fill="#e2e8f0" fontSize="10">conversation_data (JSONB)</text>
                    <text x="15" y="90" fill="#e2e8f0" fontSize="10">title, status, metadata</text>
                    <text x="15" y="110" fill="#e2e8f0" fontSize="10">journey_context, healthcare_context</text>
                    <text x="15" y="130" fill="#94a3b8" fontSize="9">Stores all Genie AI conversations</text>
                  </g>

                  {/* Storage buckets */}
                  <g transform="translate(710, 250)">
                    <rect width="260" height="140" rx="8" fill="#1e293b" stroke="#f97316" strokeWidth="2" />
                    <rect width="260" height="30" rx="8" fill="#f97316" />
                    <text x="130" y="20" textAnchor="middle" fill="#fff" fontSize="12" fontWeight="bold">Supabase Storage</text>
                    
                    <text x="15" y="55" fill="#fdba74" fontSize="10">📁 genie-recordings/</text>
                    <text x="15" y="75" fill="#e2e8f0" fontSize="10">{"   └─ {project_id}/{recording_id}.webm"}</text>
                    <text x="15" y="100" fill="#fdba74" fontSize="10">📁 genie-tts/</text>
                    <text x="15" y="120" fill="#e2e8f0" fontSize="10">{"   └─ {script_id}/{voice_id}.mp3"}</text>
                  </g>

                  {/* RLS Badge */}
                  <g transform="translate(50, 420)">
                    <rect width="900" height="50" rx="8" fill="#1e293b" stroke="#22c55e" strokeWidth="1" />
                    <text x="20" y="30" fill="#22c55e" fontSize="12" fontWeight="bold">🔒 RLS POLICIES:</text>
                    <text x="150" y="30" fill="#e2e8f0" fontSize="11">All tables secured with auth.uid() = user_id policies. Users can only access their own projects, scripts, and recordings.</text>
                  </g>
                </svg>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="integration" className="space-y-4">
            <Card className="bg-slate-900/50 border-slate-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-cyan-300">
                  <Layers className="h-5 w-5" />
                  Integration Points & APIs
                </CardTitle>
              </CardHeader>
              <CardContent>
                <svg viewBox="0 0 1000 400" className="w-full h-auto">
                  <rect width="1000" height="400" fill="#0f172a" rx="8" />
                  
                  {/* External APIs */}
                  <g transform="translate(50, 30)">
                    <text x="0" y="20" fill="#06b6d4" fontSize="14" fontWeight="bold">EXTERNAL INTEGRATIONS</text>
                    
                    <rect x="0" y="40" width="180" height="80" rx="8" fill="#155e75" stroke="#06b6d4" strokeWidth="2" />
                    <text x="90" y="70" textAnchor="middle" fill="#fff" fontSize="12" fontWeight="bold">ElevenLabs</text>
                    <text x="90" y="90" textAnchor="middle" fill="#cffafe" fontSize="10">TTS API</text>
                    <text x="90" y="105" textAnchor="middle" fill="#22d3ee" fontSize="9">✓ Implemented</text>
                    
                    <rect x="200" y="40" width="180" height="80" rx="8" fill="#155e75" stroke="#06b6d4" strokeWidth="2" />
                    <text x="290" y="70" textAnchor="middle" fill="#fff" fontSize="12" fontWeight="bold">OpenAI</text>
                    <text x="290" y="90" textAnchor="middle" fill="#cffafe" fontSize="10">GPT-4 / Whisper</text>
                    <text x="290" y="105" textAnchor="middle" fill="#22d3ee" fontSize="9">✓ Implemented</text>
                    
                    <rect x="400" y="40" width="180" height="80" rx="8" fill="#155e75" stroke="#06b6d4" strokeWidth="2" />
                    <text x="490" y="70" textAnchor="middle" fill="#fff" fontSize="12" fontWeight="bold">Claude</text>
                    <text x="490" y="90" textAnchor="middle" fill="#cffafe" fontSize="10">Script Generation</text>
                    <text x="490" y="105" textAnchor="middle" fill="#22d3ee" fontSize="9">✓ Implemented</text>
                    
                    <rect x="600" y="40" width="180" height="80" rx="8" fill="#1e3a5f" stroke="#3b82f6" strokeWidth="2" />
                    <text x="690" y="70" textAnchor="middle" fill="#fff" fontSize="12" fontWeight="bold">Gemini</text>
                    <text x="690" y="90" textAnchor="middle" fill="#bfdbfe" fontSize="10">Multi-modal</text>
                    <text x="690" y="105" textAnchor="middle" fill="#60a5fa" fontSize="9">○ Partial</text>
                    
                    <rect x="800" y="40" width="150" height="80" rx="8" fill="#374151" stroke="#6b7280" strokeWidth="2" />
                    <text x="875" y="70" textAnchor="middle" fill="#fff" fontSize="12" fontWeight="bold">YouTube</text>
                    <text x="875" y="90" textAnchor="middle" fill="#d1d5db" fontSize="10">Upload API</text>
                    <text x="875" y="105" textAnchor="middle" fill="#9ca3af" fontSize="9">○ P2 Planned</text>
                  </g>

                  {/* Internal Services */}
                  <g transform="translate(50, 160)">
                    <text x="0" y="20" fill="#a78bfa" fontSize="14" fontWeight="bold">INTERNAL SERVICES</text>
                    
                    <rect x="0" y="40" width="200" height="80" rx="8" fill="#2e1065" stroke="#a78bfa" strokeWidth="2" />
                    <text x="100" y="65" textAnchor="middle" fill="#fff" fontSize="11" fontWeight="bold">useUniversalAI</text>
                    <text x="100" y="85" textAnchor="middle" fill="#e9d5ff" fontSize="10">Multi-model orchestration</text>
                    <text x="100" y="100" textAnchor="middle" fill="#c4b5fd" fontSize="9">✓ Implemented</text>
                    
                    <rect x="220" y="40" width="200" height="80" rx="8" fill="#2e1065" stroke="#a78bfa" strokeWidth="2" />
                    <text x="320" y="65" textAnchor="middle" fill="#fff" fontSize="11" fontWeight="bold">genieConversationService</text>
                    <text x="320" y="85" textAnchor="middle" fill="#e9d5ff" fontSize="10">Chat lifecycle management</text>
                    <text x="320" y="100" textAnchor="middle" fill="#c4b5fd" fontSize="9">✓ Implemented</text>
                    
                    <rect x="440" y="40" width="200" height="80" rx="8" fill="#2e1065" stroke="#a78bfa" strokeWidth="2" />
                    <text x="540" y="65" textAnchor="middle" fill="#fff" fontSize="11" fontWeight="bold">useMediaRecorder</text>
                    <text x="540" y="85" textAnchor="middle" fill="#e9d5ff" fontSize="10">Video/audio capture</text>
                    <text x="540" y="100" textAnchor="middle" fill="#c4b5fd" fontSize="9">✓ Implemented</text>
                    
                    <rect x="660" y="40" width="200" height="80" rx="8" fill="#1e3a5f" stroke="#3b82f6" strokeWidth="2" />
                    <text x="760" y="65" textAnchor="middle" fill="#fff" fontSize="11" fontWeight="bold">useKnowledgeSearch</text>
                    <text x="760" y="85" textAnchor="middle" fill="#bfdbfe" fontSize="10">RAG-enabled search</text>
                    <text x="760" y="100" textAnchor="middle" fill="#60a5fa" fontSize="9">○ Partial</text>
                  </g>

                  {/* Browser APIs */}
                  <g transform="translate(50, 290)">
                    <text x="0" y="20" fill="#fb7185" fontSize="14" fontWeight="bold">BROWSER APIs</text>
                    
                    <rect x="0" y="40" width="150" height="60" rx="8" fill="#4c1d47" stroke="#fb7185" strokeWidth="2" />
                    <text x="75" y="65" textAnchor="middle" fill="#fff" fontSize="11">MediaRecorder</text>
                    <text x="75" y="80" textAnchor="middle" fill="#fda4af" fontSize="9">✓ Implemented</text>
                    
                    <rect x="170" y="40" width="150" height="60" rx="8" fill="#4c1d47" stroke="#fb7185" strokeWidth="2" />
                    <text x="245" y="65" textAnchor="middle" fill="#fff" fontSize="11">getUserMedia</text>
                    <text x="245" y="80" textAnchor="middle" fill="#fda4af" fontSize="9">✓ Implemented</text>
                    
                    <rect x="340" y="40" width="150" height="60" rx="8" fill="#4c1d47" stroke="#fb7185" strokeWidth="2" />
                    <text x="415" y="65" textAnchor="middle" fill="#fff" fontSize="11">getDisplayMedia</text>
                    <text x="415" y="80" textAnchor="middle" fill="#fda4af" fontSize="9">✓ Implemented</text>
                    
                    <rect x="510" y="40" width="150" height="60" rx="8" fill="#4c1d47" stroke="#fb7185" strokeWidth="2" />
                    <text x="585" y="65" textAnchor="middle" fill="#fff" fontSize="11">Web Audio API</text>
                    <text x="585" y="80" textAnchor="middle" fill="#fda4af" fontSize="9">✓ Implemented</text>
                    
                    <rect x="680" y="40" width="150" height="60" rx="8" fill="#374151" stroke="#6b7280" strokeWidth="2" />
                    <text x="755" y="65" textAnchor="middle" fill="#fff" fontSize="11">WebGPU</text>
                    <text x="755" y="80" textAnchor="middle" fill="#9ca3af" fontSize="9">○ P3 Future</text>
                  </g>
                </svg>
              </CardContent>
            </Card>

            {/* Quick Links */}
            <div className="grid grid-cols-2 gap-4">
              <Card className="bg-slate-800/50 border-slate-600 hover:border-violet-500/50 transition-colors cursor-pointer" onClick={openDocs}>
                <CardContent className="pt-4 flex items-center gap-3">
                  <FileText className="h-8 w-8 text-violet-400" />
                  <div>
                    <p className="font-semibold text-white">Technical Documentation</p>
                    <p className="text-sm text-slate-400">docs/GENIE_STUDIO_TECHNICAL_ARCHITECTURE.md</p>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-slate-800/50 border-slate-600 hover:border-emerald-500/50 transition-colors cursor-pointer" onClick={() => window.open('/docs/GENIE_STUDIO_SCENARIO_MAP.md', '_blank')}>
                <CardContent className="pt-4 flex items-center gap-3">
                  <Cpu className="h-8 w-8 text-emerald-400" />
                  <div>
                    <p className="font-semibold text-white">Scenario Map</p>
                    <p className="text-sm text-slate-400">docs/GENIE_STUDIO_SCENARIO_MAP.md</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </ScrollArea>
      </Tabs>
    </div>
  );
};
