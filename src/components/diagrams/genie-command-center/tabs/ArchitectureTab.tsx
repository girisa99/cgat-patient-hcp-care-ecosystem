/**
 * Architecture Tab - System Architecture Diagrams
 * Integrated with all architecture diagram components
 */

import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Layers, Server, Database, Cloud, Shield,
  Monitor, Globe, GitBranch, Network, Box, Cpu, Plug, Brain, Film, Users, Zap, Presentation, Map
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { infrastructureMetrics } from '../data/implementation-data';

// Import all architecture diagrams
import { GenieStudioOverallArchitectureDiagram } from '@/components/diagrams/architecture/GenieStudioOverallArchitectureDiagram';
import { GenieMindArchitectureDiagram } from '@/components/diagrams/architecture/GenieMindArchitectureDiagram';
import { GenieVibeArchitectureDiagram } from '@/components/diagrams/architecture/GenieVibeArchitectureDiagram';
import { GenieArcProductionHubDiagram } from '@/components/diagrams/architecture/GenieArcProductionHubDiagram';
import { GenieSparkArchitectureDiagram } from '@/components/diagrams/architecture/GenieSparkArchitectureDiagram';
import { GenieIntegrationsDiagram } from '@/components/diagrams/architecture/GenieIntegrationsDiagram';
import { GenieMicroservicesDiagram } from '@/components/diagrams/architecture/GenieMicroservicesDiagram';
import { GenieDataArchitectureDiagram } from '@/components/diagrams/architecture/GenieDataArchitectureDiagram';
import { GenieSecurityArchitectureDiagram } from '@/components/diagrams/architecture/GenieSecurityArchitectureDiagram';
import { GenieCastArchitectureDiagram } from '@/components/diagrams/architecture/GenieCastArchitectureDiagram';
import { EcosystemMappingDiagram } from '@/components/diagrams/architecture/EcosystemMappingDiagram';
import { ProviderCapabilityMatrix } from '@/components/ai-hub/provider-matrix';

const architectureDiagrams = [
  { id: 'full-suite', name: 'Full Genie Suite', icon: Layers, description: 'Complete system architecture showing all products and integrations' },
  { id: 'ecosystem-map', name: 'Ecosystem Mapping', icon: Map, description: '7 Products × 21 Categories × 206 Pipelines × 25 Capabilities' },
  { id: 'capability-matrix', name: 'Provider Capability Matrix', icon: Cpu, description: 'Comprehensive feature × provider matrix with implementation status' },
  { id: 'mind', name: 'Genie Mind', icon: Brain, description: 'AI Intelligence Layer - Model Routing, Script Engine, TTS (30 pipelines)' },
  { id: 'vibe', name: 'Genie Vibe', icon: Film, description: 'Production Layer - Recording, Avatar, Dubbing (74 pipelines)' },
  { id: 'spark', name: 'Genie Spark', icon: Zap, description: 'Quick-Start Engine - Idea to Script (28 pipelines)' },
  { id: 'arc', name: 'Genie Arc/Hub', icon: Users, description: 'Production Journey - Scheduling, Collaboration (14 pipelines)' },
  { id: 'deck', name: 'Genie Deck', icon: Presentation, description: 'Presentation Generator - Ideas to Impact (34 pipelines)' },
  { id: 'cast', name: 'Genie Cast', icon: Globe, description: 'Distribution Engine - Make It. Show It. Scale It. (26 pipelines)' },
  { id: 'ask', name: 'Ask Genie', icon: Network, description: 'Conversational AI and context management' },
  { id: 'backend', name: 'Backend Services', icon: Server, description: 'Edge functions, APIs, and service layer (140+ functions)' },
  { id: 'integrations', name: 'Integrations', icon: Plug, description: 'External APIs - n8n, Resend, Gemini, OAuth, Stripe' },
  { id: 'microservices', name: 'Microservices', icon: Cloud, description: 'Service Architecture & API Gateway' },
  { id: 'database', name: 'Database Schema', icon: Database, description: 'Entity relationships, RLS policies, 180+ tables' },
  { id: 'security', name: 'Security', icon: Shield, description: 'Authentication, Authorization, RBAC, Compliance' },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

export const ArchitectureTab: React.FC = () => {
  const [selectedDiagram, setSelectedDiagram] = useState('full-suite');

  // Memoize the diagram component to prevent unnecessary re-renders
  const DiagramComponent = useMemo(() => {
    switch (selectedDiagram) {
      case 'full-suite':
        return GenieStudioOverallArchitectureDiagram;
      case 'ecosystem-map':
        return EcosystemMappingDiagram;
      case 'capability-matrix':
        return () => <ProviderCapabilityMatrix className="w-full" />;
      case 'mind':
        return GenieMindArchitectureDiagram;
      case 'vibe':
        return GenieVibeArchitectureDiagram;
      case 'spark':
        return GenieSparkArchitectureDiagram;
      case 'arc':
        return GenieArcProductionHubDiagram;
      case 'deck':
        return GenieDeckArchitecture;
      case 'cast':
        return GenieCastArchitectureDiagram;
      case 'ask':
        return AskGenieArchitecture;
      case 'backend':
        return BackendServicesArchitecture;
      case 'integrations':
        return GenieIntegrationsDiagram;
      case 'microservices':
        return GenieMicroservicesDiagram;
      case 'database':
        return GenieDataArchitectureDiagram;
      case 'security':
        return GenieSecurityArchitectureDiagram;
      default:
        return GenieStudioOverallArchitectureDiagram;
    }
  }, [selectedDiagram]);

  return (
    <div className="max-w-[1920px] mx-auto space-y-6 p-6">
      {/* Diagram Selector with Horizontal Scroll */}
      <div>
        <ScrollArea className="w-full whitespace-nowrap pb-3">
          <div className="flex gap-2">
            {architectureDiagrams.map((diagram) => (
              <button
                key={diagram.id}
                onClick={() => setSelectedDiagram(diagram.id)}
                className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-lg transition-all whitespace-nowrap ${
                  selectedDiagram === diagram.id
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'bg-card text-muted-foreground hover:bg-muted hover:text-foreground border border-border'
                }`}
              >
                <diagram.icon className="w-4 h-4" />
                <span className="font-medium text-sm">{diagram.name}</span>
              </button>
            ))}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </div>

      {/* Selected Diagram Description */}
      <div>
        <Card>
          <CardContent className="py-3 px-4">
            <p className="text-muted-foreground text-sm">
              {architectureDiagrams.find(d => d.id === selectedDiagram)?.description}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Architecture Diagram Content */}
      <div>
        <DiagramComponent />
      </div>
    </div>
  );
};

// Ask Genie Architecture Component
const AskGenieArchitecture: React.FC = () => {
  return (
    <Card className="bg-card border-border">
      <CardContent className="p-6 space-y-6">
        <div className="text-center border-b border-border pb-4">
          <h2 className="text-2xl font-bold text-foreground flex items-center justify-center gap-3">
            <Network className="h-8 w-8 text-blue-500" />
            Ask Genie Architecture
          </h2>
          <p className="text-muted-foreground mt-2">Conversational AI • Context Management • Multi-Modal Responses</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Context Engine */}
          <Card className="border-2 border-blue-200 dark:border-blue-800/40 bg-blue-50/50 dark:bg-blue-950/10">
            <CardContent className="p-4">
              <h3 className="font-semibold text-blue-700 dark:text-blue-400 flex items-center gap-2 mb-3">
                <Brain className="h-5 w-5" />
                Context Engine
              </h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• RAG Knowledge Base Integration</li>
                <li>• Conversation History Management</li>
                <li>• User Preference Learning</li>
                <li>• Session State Persistence</li>
                <li>• Multi-turn Context Window</li>
              </ul>
            </CardContent>
          </Card>

          {/* AI Processing */}
          <Card className="border-2 border-purple-200 dark:border-purple-800/40 bg-purple-50/50 dark:bg-purple-950/10">
            <CardContent className="p-4">
              <h3 className="font-semibold text-purple-700 dark:text-purple-400 flex items-center gap-2 mb-3">
                <Cpu className="h-5 w-5" />
                AI Processing
              </h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Multi-Model Router (GPT-4o, Claude)</li>
                <li>• Intent Classification</li>
                <li>• Response Generation</li>
                <li>• Function Calling Support</li>
                <li>• Streaming Responses</li>
              </ul>
            </CardContent>
          </Card>

          {/* Response Delivery */}
          <Card className="border-2 border-emerald-200 dark:border-emerald-800/40 bg-emerald-50/50 dark:bg-emerald-950/10">
            <CardContent className="p-4">
              <h3 className="font-semibold text-emerald-700 dark:text-emerald-400 flex items-center gap-2 mb-3">
                <Globe className="h-5 w-5" />
                Response Delivery
              </h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Text + Voice Responses</li>
                <li>• Rich Media Embedding</li>
                <li>• Action Card Generation</li>
                <li>• Cross-App Navigation</li>
                <li>• Real-time Streaming</li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Data Flow */}
        <Card className="border-2 border-amber-200 dark:border-amber-800/40 bg-amber-50/50 dark:bg-amber-950/10">
          <CardContent className="p-4">
            <h3 className="font-semibold text-amber-700 dark:text-amber-400 mb-3">Ask Genie Data Flow</h3>
            <div className="flex items-center justify-between flex-wrap gap-4 text-sm">
              {['User Query', 'Intent Classifier', 'Context Retrieval', 'AI Processing', 'Response Generation', 'Delivery'].map((step, index, arr) => (
                <React.Fragment key={step}>
                  <div className="bg-background rounded-lg px-4 py-2 border border-border text-center">
                    <span className="text-foreground font-medium">{step}</span>
                  </div>
                  {index < arr.length - 1 && (
                    <span className="text-muted-foreground font-bold">→</span>
                  )}
                </React.Fragment>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 text-center">
          <div className="bg-blue-50 dark:bg-blue-950/20 rounded-lg p-3 border-2 border-blue-200 dark:border-blue-800/40">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">4</div>
            <div className="text-xs text-muted-foreground font-medium">AI Models</div>
          </div>
          <div className="bg-purple-50 dark:bg-purple-950/20 rounded-lg p-3 border-2 border-purple-200 dark:border-purple-800/40">
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">RAG</div>
            <div className="text-xs text-muted-foreground font-medium">Knowledge Base</div>
          </div>
          <div className="bg-emerald-50 dark:bg-emerald-950/20 rounded-lg p-3 border-2 border-emerald-200 dark:border-emerald-800/40">
            <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">∞</div>
            <div className="text-xs text-muted-foreground font-medium">Context Window</div>
          </div>
          <div className="bg-amber-50 dark:bg-amber-950/20 rounded-lg p-3 border-2 border-amber-200 dark:border-amber-800/40">
            <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">70%</div>
            <div className="text-xs text-muted-foreground font-medium">Complete</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Genie Deck Architecture Component
const GenieDeckArchitecture: React.FC = () => {
  return (
    <Card className="bg-card border-border">
      <CardContent className="p-6 space-y-6">
        <div className="text-center border-b border-border pb-4">
          <h2 className="text-2xl font-bold text-foreground flex items-center justify-center gap-3">
            <Presentation className="h-8 w-8 text-cyan-500" />
            Genie Deck Architecture
          </h2>
          <p className="text-muted-foreground mt-2">Ideas to Impact • AI Presentation Generator • Multi-Language Export</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Content Generation */}
          <Card className="border-2 border-cyan-200 dark:border-cyan-800/40 bg-cyan-50/50 dark:bg-cyan-950/10">
            <CardContent className="p-4">
              <h3 className="font-semibold text-cyan-700 dark:text-cyan-400 flex items-center gap-2 mb-3">
                <Zap className="h-5 w-5" />
                Content Generation
              </h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Multi-Model AI (GPT-4o, Claude, Gemini)</li>
                <li>• Prompt to Slides Pipeline</li>
                <li>• Document Ingestion & Parsing</li>
                <li>• Smart Bullet Point Extraction</li>
                <li>• Speaker Notes Generation</li>
              </ul>
            </CardContent>
          </Card>

          {/* Visual Design */}
          <Card className="border-2 border-teal-200 dark:border-teal-800/40 bg-teal-50/50 dark:bg-teal-950/10">
            <CardContent className="p-4">
              <h3 className="font-semibold text-teal-700 dark:text-teal-400 flex items-center gap-2 mb-3">
                <Layers className="h-5 w-5" />
                Visual Design
              </h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Template Engine (10+ templates)</li>
                <li>• Brand Customization</li>
                <li>• AI Image Generation</li>
                <li>• Infographics & Charts</li>
                <li>• Drag-and-Drop Layout</li>
              </ul>
            </CardContent>
          </Card>

          {/* Export & Delivery */}
          <Card className="border-2 border-emerald-200 dark:border-emerald-800/40 bg-emerald-50/50 dark:bg-emerald-950/10">
            <CardContent className="p-4">
              <h3 className="font-semibold text-emerald-700 dark:text-emerald-400 flex items-center gap-2 mb-3">
                <Globe className="h-5 w-5" />
                Export & Delivery
              </h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• PPTX, PDF, Google Slides</li>
                <li>• Multi-Language (10+ languages)</li>
                <li>• Parallel Translation</li>
                <li>• Confidence Scoring</li>
                <li>• Label Studio ML Integration</li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Feature Stats */}
        <div className="grid grid-cols-4 gap-4 text-center">
          <div className="bg-cyan-50 dark:bg-cyan-950/20 rounded-lg p-3 border-2 border-cyan-200 dark:border-cyan-800/40">
            <div className="text-2xl font-bold text-cyan-600 dark:text-cyan-400">10+</div>
            <div className="text-xs text-muted-foreground font-medium">Templates</div>
          </div>
          <div className="bg-teal-50 dark:bg-teal-950/20 rounded-lg p-3 border-2 border-teal-200 dark:border-teal-800/40">
            <div className="text-2xl font-bold text-teal-600 dark:text-teal-400">AI</div>
            <div className="text-xs text-muted-foreground font-medium">Image Gen</div>
          </div>
          <div className="bg-emerald-50 dark:bg-emerald-950/20 rounded-lg p-3 border-2 border-emerald-200 dark:border-emerald-800/40">
            <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">10+</div>
            <div className="text-xs text-muted-foreground font-medium">Languages</div>
          </div>
          <div className="bg-blue-50 dark:bg-blue-950/20 rounded-lg p-3 border-2 border-blue-200 dark:border-blue-800/40">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">100%</div>
            <div className="text-xs text-muted-foreground font-medium">Complete</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Backend Services Architecture Component
const BackendServicesArchitecture: React.FC = () => {
  const serviceGroups = [
    {
      name: 'AI Processing Services',
      color: 'purple',
      functions: [
        { name: 'ai-universal-processor', desc: 'Multi-model AI routing & orchestration' },
        { name: 'ai-video-generator', desc: 'Video generation pipeline' },
        { name: 'ai-image-generator', desc: 'Image generation (DALL-E, Stable Diffusion)' },
        { name: 'analyze-script', desc: 'Script analysis & enhancement' },
        { name: 'scene-analyzer', desc: 'Scene detection & visual analysis' },
        { name: 'content-moderator', desc: 'Content safety & moderation' },
      ]
    },
    {
      name: 'Voice & Audio Services',
      color: 'cyan',
      functions: [
        { name: 'text-to-speech', desc: 'Multi-provider TTS orchestration' },
        { name: 'voice-clone-processor', desc: 'Voice cloning pipeline' },
        { name: 'elevenlabs-voice', desc: 'ElevenLabs API integration' },
        { name: 'google-tts', desc: 'Google Cloud TTS' },
        { name: 'audio-mixer', desc: 'Audio mixing & mastering' },
        { name: 'audio-transcriber', desc: 'Speech-to-text transcription' },
      ]
    },
    {
      name: 'Content & Media Services',
      color: 'orange',
      functions: [
        { name: 'auto-thumbnail', desc: 'AI thumbnail generation' },
        { name: 'video-encoder', desc: 'Video transcoding & optimization' },
        { name: 'media-processor', desc: 'Media format conversion' },
        { name: 'asset-manager', desc: 'Asset storage & retrieval' },
        { name: 'template-marketplace', desc: 'Template management' },
        { name: 'export-handler', desc: 'Multi-format export' },
      ]
    },
    {
      name: 'Automation & Workflow',
      color: 'emerald',
      functions: [
        { name: 'workflow-executor', desc: 'n8n workflow integration' },
        { name: 'distribution-agent', desc: 'Multi-platform distribution' },
        { name: 'social-publish', desc: 'Social media publishing' },
        { name: 'calendar-sync', desc: 'Calendar & scheduling' },
        { name: 'recurring-scheduler', desc: 'Scheduled task execution' },
        { name: 'notification-dispatcher', desc: 'Email/push notifications (Resend)' },
      ]
    },
    {
      name: 'Billing & Payments',
      color: 'pink',
      functions: [
        { name: 'create-checkout', desc: 'Stripe checkout sessions' },
        { name: 'purchase-credits', desc: 'AI credit purchases' },
        { name: 'subscription-check', desc: 'Subscription validation' },
        { name: 'stripe-webhook', desc: 'Payment event handling' },
        { name: 'invoice-generator', desc: 'Invoice creation' },
        { name: 'usage-tracker', desc: 'Usage metering & billing' },
      ]
    },
    {
      name: 'Authentication & Security',
      color: 'red',
      functions: [
        { name: 'auth-handler', desc: 'Supabase Auth integration' },
        { name: 'google-oauth', desc: 'Google OAuth provider' },
        { name: 'role-manager', desc: 'RBAC enforcement' },
        { name: 'api-key-validator', desc: 'API key validation' },
        { name: 'audit-logger', desc: 'Security audit logging' },
        { name: 'rate-limiter', desc: 'Rate limiting middleware' },
      ]
    },
  ];

  return (
    <Card className="bg-card border-border">
      <CardContent className="p-6 space-y-6">
        <div className="text-center border-b border-border pb-4">
          <h2 className="text-2xl font-bold text-foreground flex items-center justify-center gap-3">
            <Server className="h-8 w-8 text-green-500" />
            Backend Services Architecture
          </h2>
          <p className="text-muted-foreground mt-2">140+ Supabase Edge Functions • Deno Runtime • TypeScript</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {serviceGroups.map((group) => (
            <Card key={group.name} className={`border-2 border-${group.color}-200 dark:border-${group.color}-800/40 bg-${group.color}-50/50 dark:bg-${group.color}-950/10`}>
              <CardContent className="p-4">
                <h3 className={`font-semibold text-${group.color}-700 dark:text-${group.color}-400 mb-3 text-sm`}>
                  {group.name}
                </h3>
                <div className="space-y-2">
                  {group.functions.map((fn) => (
                    <div key={fn.name} className="bg-background rounded p-2 border border-border">
                      <code className="text-xs font-mono text-foreground">{fn.name}</code>
                      <p className="text-xs text-muted-foreground mt-0.5">{fn.desc}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Stats - Genie Studio Specific vs Total */}
        <div className="grid grid-cols-4 md:grid-cols-8 gap-3 text-center">
          <div className="bg-green-50 dark:bg-green-950/20 rounded-lg p-3 border-2 border-green-200 dark:border-green-800/40">
            <div className="text-lg font-bold text-green-600 dark:text-green-400">
              {infrastructureMetrics.edgeFunctions.genieStudio}
              <span className="text-xs text-muted-foreground">/{infrastructureMetrics.edgeFunctions.total}</span>
            </div>
            <div className="text-[10px] text-muted-foreground font-medium">Edge Functions</div>
          </div>
          <div className="bg-purple-50 dark:bg-purple-950/20 rounded-lg p-3 border-2 border-purple-200 dark:border-purple-800/40">
            <div className="text-lg font-bold text-purple-600 dark:text-purple-400">
              {infrastructureMetrics.hooks.genieStudio}
              <span className="text-xs text-muted-foreground">/{infrastructureMetrics.hooks.total}</span>
            </div>
            <div className="text-[10px] text-muted-foreground font-medium">Hooks</div>
          </div>
          <div className="bg-blue-50 dark:bg-blue-950/20 rounded-lg p-3 border-2 border-blue-200 dark:border-blue-800/40">
            <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
              {infrastructureMetrics.databaseTables.genieStudio}
              <span className="text-xs text-muted-foreground">/{infrastructureMetrics.databaseTables.total}</span>
            </div>
            <div className="text-[10px] text-muted-foreground font-medium">DB Tables</div>
          </div>
          <div className="bg-orange-50 dark:bg-orange-950/20 rounded-lg p-3 border-2 border-orange-200 dark:border-orange-800/40">
            <div className="text-lg font-bold text-orange-600 dark:text-orange-400">
              {infrastructureMetrics.aiAgents.genieStudio}
              <span className="text-xs text-muted-foreground">/{infrastructureMetrics.aiAgents.total}</span>
            </div>
            <div className="text-[10px] text-muted-foreground font-medium">AI Agents</div>
          </div>
          <div className="bg-cyan-50 dark:bg-cyan-950/20 rounded-lg p-3 border-2 border-cyan-200 dark:border-cyan-800/40">
            <div className="text-lg font-bold text-cyan-600 dark:text-cyan-400">
              {infrastructureMetrics.apiServices.genieStudio}
              <span className="text-xs text-muted-foreground">/{infrastructureMetrics.apiServices.total}</span>
            </div>
            <div className="text-[10px] text-muted-foreground font-medium">Services</div>
          </div>
          <div className="bg-pink-50 dark:bg-pink-950/20 rounded-lg p-3 border-2 border-pink-200 dark:border-pink-800/40">
            <div className="text-lg font-bold text-pink-600 dark:text-pink-400">
              {infrastructureMetrics.mobileComponents.genieStudio}
              <span className="text-xs text-muted-foreground">/{infrastructureMetrics.mobileComponents.total}</span>
            </div>
            <div className="text-[10px] text-muted-foreground font-medium">Mobile</div>
          </div>
          <div className="bg-indigo-50 dark:bg-indigo-950/20 rounded-lg p-3 border-2 border-indigo-200 dark:border-indigo-800/40">
            <div className="text-lg font-bold text-indigo-600 dark:text-indigo-400">
              {infrastructureMetrics.components.genieStudio}
              <span className="text-xs text-muted-foreground">/{infrastructureMetrics.components.total}</span>
            </div>
            <div className="text-[10px] text-muted-foreground font-medium">Components</div>
          </div>
          <div className="bg-amber-50 dark:bg-amber-950/20 rounded-lg p-3 border-2 border-amber-200 dark:border-amber-800/40">
            <div className="text-lg font-bold text-amber-600 dark:text-amber-400">
              {infrastructureMetrics.pages.genieStudio}
              <span className="text-xs text-muted-foreground">/{infrastructureMetrics.pages.total}</span>
            </div>
            <div className="text-[10px] text-muted-foreground font-medium">Pages</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ArchitectureTab;
