/**
 * Architecture Tab - System Architecture Diagrams
 * Integrated with all architecture diagram components
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Layers, Server, Database, Cloud, Shield,
  Monitor, Globe, GitBranch, Network, Box, Cpu, Plug, Brain, Film, Users, Zap
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';

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

const architectureDiagrams = [
  { id: 'full-suite', name: 'Full Genie Suite', icon: Layers, description: 'Complete system architecture showing all products and integrations' },
  { id: 'mind', name: 'Genie Mind', icon: Brain, description: 'AI Intelligence Layer - Model Routing, Script Engine, TTS' },
  { id: 'vibe', name: 'Genie Vibe', icon: Film, description: 'Production Layer - Recording Studio, 6 AI Agents, Deployment Modes' },
  { id: 'spark', name: 'Genie Spark', icon: Zap, description: 'Quick-Start Engine - Idea to Content in Seconds' },
  { id: 'arc', name: 'Genie Arc/Hub', icon: Users, description: 'Team Collaboration & Enterprise Production Center' },
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
  visible: { opacity: 1, y: 0 },
};

export const ArchitectureTab: React.FC = () => {
  const [selectedDiagram, setSelectedDiagram] = useState('full-suite');

  const renderDiagram = () => {
    switch (selectedDiagram) {
      case 'full-suite':
        return <GenieStudioOverallArchitectureDiagram />;
      case 'mind':
        return <GenieMindArchitectureDiagram />;
      case 'vibe':
        return <GenieVibeArchitectureDiagram />;
      case 'spark':
        return <GenieSparkArchitectureDiagram />;
      case 'arc':
        return <GenieArcProductionHubDiagram />;
      case 'ask':
        return <AskGenieArchitecture />;
      case 'backend':
        return <BackendServicesArchitecture />;
      case 'integrations':
        return <GenieIntegrationsDiagram />;
      case 'microservices':
        return <GenieMicroservicesDiagram />;
      case 'database':
        return <GenieDataArchitectureDiagram />;
      case 'security':
        return <GenieSecurityArchitectureDiagram />;
      default:
        return <GenieStudioOverallArchitectureDiagram />;
    }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="max-w-[1920px] mx-auto space-y-6 p-6"
    >
      {/* Diagram Selector with Horizontal Scroll */}
      <motion.div variants={itemVariants}>
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
      </motion.div>

      {/* Selected Diagram Description */}
      <motion.div variants={itemVariants}>
        <Card>
          <CardContent className="py-3 px-4">
            <p className="text-muted-foreground text-sm">
              {architectureDiagrams.find(d => d.id === selectedDiagram)?.description}
            </p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Architecture Diagram Content */}
      <motion.div variants={itemVariants}>
        {renderDiagram()}
      </motion.div>
    </motion.div>
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

        {/* Stats */}
        <div className="grid grid-cols-5 gap-4 text-center">
          <div className="bg-green-50 dark:bg-green-950/20 rounded-lg p-3 border-2 border-green-200 dark:border-green-800/40">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">140+</div>
            <div className="text-xs text-muted-foreground font-medium">Edge Functions</div>
          </div>
          <div className="bg-purple-50 dark:bg-purple-950/20 rounded-lg p-3 border-2 border-purple-200 dark:border-purple-800/40">
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">25+</div>
            <div className="text-xs text-muted-foreground font-medium">AI Functions</div>
          </div>
          <div className="bg-cyan-50 dark:bg-cyan-950/20 rounded-lg p-3 border-2 border-cyan-200 dark:border-cyan-800/40">
            <div className="text-2xl font-bold text-cyan-600 dark:text-cyan-400">15+</div>
            <div className="text-xs text-muted-foreground font-medium">Voice/Audio</div>
          </div>
          <div className="bg-orange-50 dark:bg-orange-950/20 rounded-lg p-3 border-2 border-orange-200 dark:border-orange-800/40">
            <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">30+</div>
            <div className="text-xs text-muted-foreground font-medium">Automation</div>
          </div>
          <div className="bg-pink-50 dark:bg-pink-950/20 rounded-lg p-3 border-2 border-pink-200 dark:border-pink-800/40">
            <div className="text-2xl font-bold text-pink-600 dark:text-pink-400">10+</div>
            <div className="text-xs text-muted-foreground font-medium">Billing</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ArchitectureTab;
