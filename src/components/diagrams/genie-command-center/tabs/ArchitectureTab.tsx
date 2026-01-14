/**
 * Architecture Tab - System Architecture Diagrams
 * Clean enterprise styling with proper design tokens
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Layers, Server, Database, Cloud, Shield,
  Monitor, Globe, GitBranch, Network, Box, Cpu
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';

const architectureDiagrams = [
  { id: 'full-suite', name: 'Full Genie Suite', icon: Layers, description: 'Complete system architecture showing all products and integrations' },
  { id: 'mind', name: 'Genie Mind', icon: Cpu, description: 'Script generation and AI processing architecture' },
  { id: 'vibe', name: 'Genie Vibe', icon: Monitor, description: 'Recording studio and media processing pipeline' },
  { id: 'spark', name: 'Genie Spark', icon: Box, description: 'Quick-start wizard and template system' },
  { id: 'arc', name: 'Genie Arc', icon: GitBranch, description: 'Agent builder and workflow automation' },
  { id: 'ask', name: 'Ask Genie', icon: Network, description: 'Conversational AI and context management' },
  { id: 'backend', name: 'Backend Services', icon: Server, description: 'Edge functions, APIs, and service layer' },
  { id: 'database', name: 'Database Schema', icon: Database, description: 'Entity relationships and data model' },
  { id: 'security', name: 'Security', icon: Shield, description: 'Authentication, authorization, and compliance' },
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
        <Card className="min-h-[600px]">
          <CardContent className="p-8">
            {selectedDiagram === 'full-suite' && (
              <div className="space-y-6">
                <h3 className="text-2xl font-bold text-foreground text-center mb-8">Genie Suite - Full System Architecture</h3>
                
                {/* Three-Tier Architecture */}
                <div className="grid grid-cols-1 gap-6">
                  {/* Presentation Layer */}
                  <Card className="border-primary/20 bg-primary/5">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex items-center gap-2 text-primary">
                        <Monitor className="w-5 h-5" />
                        Presentation Layer (Frontend)
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                        {['Genie Mind', 'Genie Vibe', 'Genie Spark', 'Genie Arc', 'Ask Genie', 'Production Hub'].map((app, idx) => (
                          <div key={idx} className="bg-primary/10 rounded-lg p-3 text-center border border-primary/20">
                            <div className="text-foreground font-medium text-sm">{app}</div>
                            <div className="text-xs text-muted-foreground mt-1">React + TypeScript</div>
                          </div>
                        ))}
                      </div>
                      <div className="mt-4 flex flex-wrap justify-center gap-2">
                        {['Tailwind CSS', 'shadcn/ui', 'Framer Motion', 'React Query'].map((tech) => (
                          <Badge key={tech} variant="secondary" className="text-xs">{tech}</Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* API Layer */}
                  <Card className="border-green-500/20 bg-green-500/5">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex items-center gap-2 text-green-600">
                        <Cloud className="w-5 h-5" />
                        Service Layer (Edge Functions)
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                        {[
                          { name: 'AI Processing', count: '25+', funcs: ['ai-universal-processor', 'ai-video-generator', 'ai-image-generator'] },
                          { name: 'TTS/Voice', count: '15+', funcs: ['text-to-speech', 'voice-clone-processor', 'elevenlabs-voice'] },
                          { name: 'Media', count: '20+', funcs: ['audio-mixer', 'auto-thumbnail', 'scene-analyzer'] },
                          { name: 'Automation', count: '30+', funcs: ['workflow-executor', 'social-publish', 'distribution-agent'] },
                          { name: 'Billing', count: '10+', funcs: ['create-checkout', 'purchase-credits', 'subscription-check'] },
                        ].map((group, idx) => (
                          <div key={idx} className="bg-green-500/10 rounded-lg p-3 border border-green-500/20">
                            <div className="text-foreground font-medium text-sm">{group.name}</div>
                            <div className="text-green-600 text-xs mt-1">{group.count} functions</div>
                            <div className="mt-2 space-y-0.5">
                              {group.funcs.map((f, i) => (
                                <div key={i} className="text-xs text-muted-foreground font-mono truncate">{f}</div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="mt-4 text-center text-sm text-green-600">
                        140+ Supabase Edge Functions • Deno Runtime • TypeScript
                      </div>
                    </CardContent>
                  </Card>

                  {/* Data Layer */}
                  <Card className="border-amber-500/20 bg-amber-500/5">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex items-center gap-2 text-amber-600">
                        <Database className="w-5 h-5" />
                        Data Layer (Supabase PostgreSQL)
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {[
                          { name: 'User & Auth', tables: ['profiles', 'roles', 'permissions', 'sessions'] },
                          { name: 'Content', tables: ['scripts', 'recordings', 'media_assets', 'projects'] },
                          { name: 'AI & Agents', tables: ['agents', 'agent_sessions', 'agent_conversations', 'knowledge_base'] },
                          { name: 'Billing', tables: ['subscriptions', 'ai_credits', 'transactions', 'invoices'] },
                        ].map((group, idx) => (
                          <div key={idx} className="bg-amber-500/10 rounded-lg p-3 border border-amber-500/20">
                            <div className="text-foreground font-medium text-sm">{group.name}</div>
                            <div className="mt-2 space-y-0.5">
                              {group.tables.map((t, i) => (
                                <div key={i} className="text-xs text-muted-foreground font-mono">{t}</div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="mt-4 text-center text-sm text-amber-600">
                        180+ Tables • Row Level Security • Real-time Subscriptions
                      </div>
                    </CardContent>
                  </Card>

                  {/* External Services */}
                  <Card className="border-blue-500/20 bg-blue-500/5">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex items-center gap-2 text-blue-600">
                        <Globe className="w-5 h-5" />
                        External Integrations
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
                        {[
                          { name: 'OpenAI', type: 'AI/LLM' },
                          { name: 'Claude', type: 'AI/LLM' },
                          { name: 'ElevenLabs', type: 'Voice' },
                          { name: 'Google TTS', type: 'Voice' },
                          { name: 'Stripe', type: 'Payments' },
                          { name: 'YouTube API', type: 'Distribution' },
                        ].map((service, idx) => (
                          <div key={idx} className="bg-blue-500/10 rounded-lg p-3 text-center border border-blue-500/20">
                            <div className="text-foreground font-medium text-sm">{service.name}</div>
                            <div className="text-xs text-blue-600">{service.type}</div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}

            {selectedDiagram === 'database' && (
              <div className="space-y-6">
                <h3 className="text-2xl font-bold text-foreground text-center mb-8">Database Entity Relationship Overview</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    { 
                      category: 'Core Entities', 
                      color: 'primary',
                      tables: [
                        { name: 'profiles', cols: 'id, user_id, email, role, created_at' },
                        { name: 'agents', cols: 'id, name, type, status, template_id, created_by' },
                        { name: 'agent_sessions', cols: 'id, agent_id, user_id, status, current_step' },
                        { name: 'agent_conversations', cols: 'id, agent_id, session_id, messages, context' },
                      ]
                    },
                    { 
                      category: 'Content', 
                      color: 'green',
                      tables: [
                        { name: 'scripts', cols: 'id, title, content, user_id, status' },
                        { name: 'vibe_recordings', cols: 'id, project_id, video_url, duration' },
                        { name: 'vibe_timeline_clips', cols: 'id, recording_id, start_time, end_time' },
                        { name: 'media_assets', cols: 'id, type, url, metadata, user_id' },
                      ]
                    },
                    { 
                      category: 'AI & Workflows', 
                      color: 'blue',
                      tables: [
                        { name: 'knowledge_base', cols: 'id, agent_id, content, embeddings' },
                        { name: 'agent_workflows', cols: 'id, name, workflow_data, status' },
                        { name: 'agent_actions', cols: 'id, agent_id, type, parameters' },
                        { name: 'ai_model_configs', cols: 'id, provider, model_id, settings' },
                      ]
                    },
                    { 
                      category: 'Billing', 
                      color: 'amber',
                      tables: [
                        { name: 'subscriptions', cols: 'id, user_id, plan, status, stripe_id' },
                        { name: 'ai_credit_packages', cols: 'id, name, credits, price' },
                        { name: 'ai_credit_transactions', cols: 'id, user_id, amount, type, balance' },
                        { name: 'subscription_features', cols: 'id, plan_id, feature, limit' },
                      ]
                    },
                  ].map((group, idx) => (
                    <Card key={idx} className={`border-${group.color}-500/20`}>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base">{group.category}</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        {group.tables.map((table, i) => (
                          <div key={i} className="bg-muted/50 rounded-lg p-2.5">
                            <div className="text-foreground font-mono text-sm font-medium">{table.name}</div>
                            <div className="text-xs text-muted-foreground mt-0.5 font-mono">{table.cols}</div>
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  ))}
                </div>
                <div className="text-center text-muted-foreground text-sm mt-4">
                  Showing key tables only. Full schema includes 180+ tables with complete RLS policies.
                </div>
              </div>
            )}

            {selectedDiagram === 'backend' && (
              <div className="space-y-6">
                <h3 className="text-2xl font-bold text-foreground text-center mb-8">Backend Service Architecture</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {[
                    {
                      name: 'AI Processing Services',
                      functions: [
                        'ai-universal-processor - Multi-model AI routing',
                        'ai-video-generator - Video generation pipeline',
                        'ai-image-generator - Image generation',
                        'analyze-script - Script analysis AI',
                        'enhance-script - AI script enhancement',
                        'scene-analyzer - Scene detection & analysis',
                      ]
                    },
                    {
                      name: 'Voice & Audio Services',
                      functions: [
                        'text-to-speech - Multi-provider TTS',
                        'voice-clone-processor - Voice cloning',
                        'elevenlabs-voice - ElevenLabs integration',
                        'google-tts - Google Cloud TTS',
                        'azure-tts - Azure Cognitive TTS',
                        'audio-mixer - Audio mixing & mastering',
                      ]
                    },
                    {
                      name: 'Automation Services',
                      functions: [
                        'workflow-executor - Workflow automation',
                        'distribution-agent - Content distribution',
                        'social-publish - Social media publishing',
                        'calendar-sync - Calendar integration',
                        'recurring-scheduler - Scheduled tasks',
                        'template-marketplace - Template management',
                      ]
                    },
                  ].map((service, idx) => (
                    <Card key={idx}>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base">{service.name}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-2">
                          {service.functions.map((fn, i) => (
                            <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                              <Server className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                              <span>{fn}</span>
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Placeholder for other diagrams */}
            {!['full-suite', 'database', 'backend'].includes(selectedDiagram) && (
              <div className="flex flex-col items-center justify-center h-[400px] text-muted-foreground">
                <Layers className="w-16 h-16 mb-4 opacity-50" />
                <p className="text-lg font-medium">Detailed {architectureDiagrams.find(d => d.id === selectedDiagram)?.name} architecture</p>
                <p className="text-sm mt-2">Comprehensive diagram available in technical documentation</p>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
};
