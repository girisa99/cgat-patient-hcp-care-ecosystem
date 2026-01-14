/**
 * Architecture Tab - System Architecture Diagrams
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Layers, Server, Database, Cloud, Shield,
  Smartphone, Monitor, Globe, GitBranch,
  Network, Box, Cpu, HardDrive
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const architectureDiagrams = [
  {
    id: 'full-suite',
    name: 'Full Genie Suite',
    icon: Layers,
    description: 'Complete system architecture showing all products and integrations',
  },
  {
    id: 'mind',
    name: 'Genie Mind',
    icon: Cpu,
    description: 'Script generation and AI processing architecture',
  },
  {
    id: 'vibe',
    name: 'Genie Vibe',
    icon: Monitor,
    description: 'Recording studio and media processing pipeline',
  },
  {
    id: 'spark',
    name: 'Genie Spark',
    icon: Box,
    description: 'Quick-start wizard and template system',
  },
  {
    id: 'arc',
    name: 'Genie Arc',
    icon: GitBranch,
    description: 'Agent builder and workflow automation',
  },
  {
    id: 'ask',
    name: 'Ask Genie',
    icon: Network,
    description: 'Conversational AI and context management',
  },
  {
    id: 'backend',
    name: 'Backend Services',
    icon: Server,
    description: 'Edge functions, APIs, and service layer',
  },
  {
    id: 'database',
    name: 'Database Schema',
    icon: Database,
    description: 'Entity relationships and data model',
  },
  {
    id: 'analytics',
    name: 'Analytics',
    icon: Globe,
    description: 'Metrics collection and reporting pipeline',
  },
  {
    id: 'security',
    name: 'Security',
    icon: Shield,
    description: 'Authentication, authorization, and compliance',
  },
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
      className="max-w-[1920px] mx-auto space-y-6 px-6"
    >
      {/* Diagram Selector */}
      <motion.div variants={itemVariants}>
        <div className="flex flex-wrap gap-2 mb-6">
          {architectureDiagrams.map((diagram) => (
            <button
              key={diagram.id}
              onClick={() => setSelectedDiagram(diagram.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                selectedDiagram === diagram.id
                  ? 'bg-violet-600 text-white'
                  : 'bg-slate-800/50 text-slate-300 hover:bg-slate-700/50 border border-slate-700/50'
              }`}
            >
              <diagram.icon className="w-4 h-4" />
              <span className="font-medium">{diagram.name}</span>
            </button>
          ))}
        </div>
      </motion.div>

      {/* Selected Diagram Description */}
      <motion.div variants={itemVariants} className="bg-slate-800/30 rounded-xl p-4 border border-slate-700/30">
        <p className="text-slate-300">
          {architectureDiagrams.find(d => d.id === selectedDiagram)?.description}
        </p>
      </motion.div>

      {/* Architecture Diagram Content */}
      <motion.div variants={itemVariants} className="bg-slate-800/50 rounded-2xl p-8 border border-slate-700/50 min-h-[600px]">
        {selectedDiagram === 'full-suite' && (
          <div className="space-y-8">
            <h3 className="text-2xl font-bold text-white text-center mb-8">Genie Suite - Full System Architecture</h3>
            
            {/* Three-Tier Architecture */}
            <div className="grid grid-cols-1 gap-6">
              {/* Presentation Layer */}
              <div className="bg-violet-500/10 rounded-xl p-6 border border-violet-500/20">
                <h4 className="text-lg font-semibold text-violet-400 mb-4 flex items-center gap-2">
                  <Monitor className="w-5 h-5" />
                  Presentation Layer (Frontend)
                </h4>
                <div className="grid grid-cols-6 gap-4">
                  {['Genie Mind', 'Genie Vibe', 'Genie Spark', 'Genie Arc', 'Ask Genie', 'Production Hub'].map((app, idx) => (
                    <div key={idx} className="bg-violet-500/20 rounded-lg p-4 text-center">
                      <div className="text-white font-medium">{app}</div>
                      <div className="text-xs text-violet-300 mt-1">React + TypeScript</div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 flex justify-center gap-4">
                  <span className="text-xs px-3 py-1 rounded-full bg-slate-700 text-slate-300">Tailwind CSS</span>
                  <span className="text-xs px-3 py-1 rounded-full bg-slate-700 text-slate-300">shadcn/ui</span>
                  <span className="text-xs px-3 py-1 rounded-full bg-slate-700 text-slate-300">Framer Motion</span>
                  <span className="text-xs px-3 py-1 rounded-full bg-slate-700 text-slate-300">React Query</span>
                </div>
              </div>

              {/* API Layer */}
              <div className="bg-emerald-500/10 rounded-xl p-6 border border-emerald-500/20">
                <h4 className="text-lg font-semibold text-emerald-400 mb-4 flex items-center gap-2">
                  <Cloud className="w-5 h-5" />
                  Service Layer (Edge Functions)
                </h4>
                <div className="grid grid-cols-5 gap-4">
                  {[
                    { name: 'AI Processing', count: '25+', funcs: ['ai-universal-processor', 'ai-video-generator', 'ai-image-generator'] },
                    { name: 'TTS/Voice', count: '15+', funcs: ['text-to-speech', 'voice-clone-processor', 'elevenlabs-voice'] },
                    { name: 'Media', count: '20+', funcs: ['audio-mixer', 'auto-thumbnail', 'scene-analyzer'] },
                    { name: 'Automation', count: '30+', funcs: ['workflow-executor', 'social-publish', 'distribution-agent'] },
                    { name: 'Billing', count: '10+', funcs: ['create-checkout', 'purchase-credits', 'subscription-check'] },
                  ].map((group, idx) => (
                    <div key={idx} className="bg-emerald-500/20 rounded-lg p-4">
                      <div className="text-white font-medium">{group.name}</div>
                      <div className="text-emerald-300 text-sm mt-1">{group.count} functions</div>
                      <div className="mt-2 space-y-1">
                        {group.funcs.map((f, i) => (
                          <div key={i} className="text-xs text-emerald-200/70 font-mono truncate">{f}</div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 text-center text-sm text-emerald-300">
                  140+ Supabase Edge Functions • Deno Runtime • TypeScript
                </div>
              </div>

              {/* Data Layer */}
              <div className="bg-amber-500/10 rounded-xl p-6 border border-amber-500/20">
                <h4 className="text-lg font-semibold text-amber-400 mb-4 flex items-center gap-2">
                  <Database className="w-5 h-5" />
                  Data Layer (Supabase PostgreSQL)
                </h4>
                <div className="grid grid-cols-4 gap-4">
                  {[
                    { name: 'User & Auth', tables: ['profiles', 'roles', 'permissions', 'sessions'] },
                    { name: 'Content', tables: ['scripts', 'recordings', 'media_assets', 'projects'] },
                    { name: 'AI & Agents', tables: ['agents', 'agent_sessions', 'agent_conversations', 'knowledge_base'] },
                    { name: 'Billing', tables: ['subscriptions', 'ai_credits', 'transactions', 'invoices'] },
                  ].map((group, idx) => (
                    <div key={idx} className="bg-amber-500/20 rounded-lg p-4">
                      <div className="text-white font-medium">{group.name}</div>
                      <div className="mt-2 space-y-1">
                        {group.tables.map((t, i) => (
                          <div key={i} className="text-xs text-amber-200/70 font-mono">{t}</div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 text-center text-sm text-amber-300">
                  180+ Tables • Row Level Security • Real-time Subscriptions
                </div>
              </div>

              {/* External Services */}
              <div className="bg-blue-500/10 rounded-xl p-6 border border-blue-500/20">
                <h4 className="text-lg font-semibold text-blue-400 mb-4 flex items-center gap-2">
                  <Globe className="w-5 h-5" />
                  External Integrations
                </h4>
                <div className="grid grid-cols-6 gap-4">
                  {[
                    { name: 'OpenAI', type: 'AI/LLM' },
                    { name: 'Claude', type: 'AI/LLM' },
                    { name: 'ElevenLabs', type: 'Voice' },
                    { name: 'Google TTS', type: 'Voice' },
                    { name: 'Stripe', type: 'Payments' },
                    { name: 'YouTube API', type: 'Distribution' },
                  ].map((service, idx) => (
                    <div key={idx} className="bg-blue-500/20 rounded-lg p-3 text-center">
                      <div className="text-white font-medium text-sm">{service.name}</div>
                      <div className="text-xs text-blue-300">{service.type}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {selectedDiagram === 'database' && (
          <div className="space-y-6">
            <h3 className="text-2xl font-bold text-white text-center mb-8">Database Entity Relationship Overview</h3>
            <div className="grid grid-cols-4 gap-4">
              {[
                { 
                  category: 'Core Entities', 
                  color: 'violet',
                  tables: [
                    { name: 'profiles', cols: 'id, user_id, email, role, created_at' },
                    { name: 'agents', cols: 'id, name, type, status, template_id, created_by' },
                    { name: 'agent_sessions', cols: 'id, agent_id, user_id, status, current_step' },
                    { name: 'agent_conversations', cols: 'id, agent_id, session_id, messages, context' },
                  ]
                },
                { 
                  category: 'Content', 
                  color: 'emerald',
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
                <div key={idx} className={`bg-${group.color}-500/10 rounded-xl p-4 border border-${group.color}-500/20`}>
                  <h4 className={`text-lg font-semibold text-${group.color}-400 mb-4`}>{group.category}</h4>
                  <div className="space-y-3">
                    {group.tables.map((table, i) => (
                      <div key={i} className="bg-slate-800/50 rounded-lg p-3">
                        <div className="text-white font-mono text-sm font-medium">{table.name}</div>
                        <div className="text-xs text-slate-400 mt-1 font-mono">{table.cols}</div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <div className="text-center text-slate-400 text-sm mt-4">
              Showing key tables only. Full schema includes 180+ tables with complete RLS policies.
            </div>
          </div>
        )}

        {selectedDiagram === 'backend' && (
          <div className="space-y-6">
            <h3 className="text-2xl font-bold text-white text-center mb-8">Backend Service Architecture</h3>
            <div className="grid grid-cols-3 gap-6">
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
                <div key={idx} className="bg-slate-700/30 rounded-xl p-5 border border-slate-600/30">
                  <h4 className="text-lg font-semibold text-white mb-4">{service.name}</h4>
                  <ul className="space-y-2">
                    {service.functions.map((fn, i) => (
                      <li key={i} className="text-sm text-slate-300 flex items-start gap-2">
                        <Server className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                        <span>{fn}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Placeholder for other diagrams */}
        {!['full-suite', 'database', 'backend'].includes(selectedDiagram) && (
          <div className="flex flex-col items-center justify-center h-[500px] text-slate-400">
            <Layers className="w-16 h-16 mb-4 opacity-50" />
            <p className="text-lg">Detailed {architectureDiagrams.find(d => d.id === selectedDiagram)?.name} architecture</p>
            <p className="text-sm mt-2">Comprehensive diagram available in technical documentation</p>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};
