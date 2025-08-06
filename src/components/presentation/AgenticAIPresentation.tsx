import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight, Play, Pause, RotateCcw, Maximize2, Download, FileText, Presentation, Database, Cloud, MessageSquare, Globe, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import { usePresentationExporter } from '@/hooks/usePresentationExporter';
import './PresentationStyles.css';

interface Slide {
  id: number;
  title: string;
  subtitle?: string;
  content: React.ReactNode;
  animation: 'fade' | 'slide' | 'zoom' | 'flip';
}

const slides: Slide[] = [
  {
    id: 1,
    title: "Agentic AI Implementation for Treatment Centers",
    subtitle: "Comprehensive AI automation platform with proven results and real-world implementation",
    content: (
      <div className="h-full overflow-y-auto space-y-6 animate-fade-in">
        <div className="grid grid-cols-2 gap-8">
          <Card className="p-6">
            <div className="text-center mb-6">
              <div className="w-20 h-20 mx-auto bg-gradient-to-br from-primary via-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-2xl">
                <div className="text-4xl">🤖</div>
              </div>
              <h3 className="text-xl font-bold text-primary mt-4">Agentic AI Implementation</h3>
            </div>
            <div className="space-y-4">
              <div className="p-4 bg-accent/20 rounded-lg">
                <h4 className="font-semibold text-primary mb-2">🧠 Autonomous Decision Making</h4>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>• Multi-agent collaboration system</li>
                  <li>• Context-aware decision trees</li>
                  <li>• Self-improving algorithms</li>
                  <li>• Human-in-the-loop validation</li>
                </ul>
              </div>
              <div className="p-4 bg-accent/20 rounded-lg">
                <h4 className="font-semibold text-primary mb-2">⚙️ Workflow Automation</h4>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>• Patient intake automation (90% reduction in manual work)</li>
                  <li>• Treatment plan generation</li>
                  <li>• Insurance verification automation</li>
                  <li>• Appointment scheduling optimization</li>
                </ul>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-xl font-bold text-primary mb-6">What Was Implemented</h3>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center mt-1">
                  <span className="text-white text-xs">✓</span>
                </div>
                <div>
                  <div className="font-semibold">Multi-Tenant Healthcare Platform</div>
                  <div className="text-sm text-muted-foreground">Complete RBAC system with facility management</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center mt-1">
                  <span className="text-white text-xs">✓</span>
                </div>
                <div>
                  <div className="font-semibold">Intelligent Patient Onboarding</div>
                  <div className="text-sm text-muted-foreground">AI-powered form completion and validation</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center mt-1">
                  <span className="text-white text-xs">✓</span>
                </div>
                <div>
                  <div className="font-semibold">Automated Module Detection</div>
                  <div className="text-sm text-muted-foreground">Database schema scanning and code generation</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center mt-1">
                  <span className="text-white text-xs">✓</span>
                </div>
                <div>
                  <div className="font-semibold">Real-time Analytics Dashboard</div>
                  <div className="text-sm text-muted-foreground">Performance monitoring and insights</div>
                </div>
              </div>
            </div>
          </Card>
        </div>

        <Card className="p-6">
          <h3 className="text-xl font-bold text-primary mb-6">What Worked - Proven Results</h3>
          <div className="grid grid-cols-4 gap-6">
            <div className="text-center p-4 bg-primary/10 rounded-lg">
              <div className="text-3xl font-bold text-primary">95%</div>
              <div className="text-sm text-muted-foreground">Reduction in manual data entry</div>
            </div>
            <div className="text-center p-4 bg-primary/10 rounded-lg">
              <div className="text-3xl font-bold text-primary">80%</div>
              <div className="text-sm text-muted-foreground">Faster patient onboarding</div>
            </div>
            <div className="text-center p-4 bg-primary/10 rounded-lg">
              <div className="text-3xl font-bold text-primary">99.9%</div>
              <div className="text-sm text-muted-foreground">System uptime</div>
            </div>
            <div className="text-center p-4 bg-primary/10 rounded-lg">
              <div className="text-3xl font-bold text-primary">400%</div>
              <div className="text-sm text-muted-foreground">ROI within 6 months</div>
            </div>
          </div>
        </Card>
      </div>
    ),
    animation: 'fade'
  },
  {
    id: 2,
    title: "Complete AI Agent Architecture",
    subtitle: "Comprehensive System Design with MCP, LLMs, Vision Models & Full Stack Implementation",
    content: (
      <div className="h-full overflow-y-auto space-y-6 animate-fade-in">
        {/* Architecture Diagram */}
        <div className="relative">
          <div className="text-center mb-6">
            <h3 className="text-2xl font-bold text-primary mb-2">End-to-End Architecture Overview</h3>
            <p className="text-muted-foreground">Model Context Protocol (MCP) + Multi-Model AI + Full Stack Integration</p>
          </div>
          
          <div className="grid grid-cols-4 gap-4 mb-8">
            <Card className="p-4 bg-gradient-to-br from-blue-500/20 to-blue-500/5 border-2 border-blue-500/30">
              <div className="text-2xl mb-2">🎨</div>
              <h4 className="font-bold text-blue-700 text-sm mb-2">Frontend Layer</h4>
              <div className="text-xs space-y-1">
                <div>• React + TypeScript</div>
                <div>• Tailwind CSS + shadcn/ui</div>
                <div>• Real-time WebSocket</div>
                <div>• Component Architecture</div>
                <div>• State Management</div>
              </div>
            </Card>
            
            <Card className="p-4 bg-gradient-to-br from-green-500/20 to-green-500/5 border-2 border-green-500/30">
              <div className="text-2xl mb-2">🔗</div>
              <h4 className="font-bold text-green-700 text-sm mb-2">MCP Protocol</h4>
              <div className="text-xs space-y-1">
                <div>• Model Communication Protocol</div>
                <div>• Context Sharing Framework</div>
                <div>• Session Management</div>
                <div>• Tool Integration</div>
                <div>• Multi-Agent Coordination</div>
              </div>
            </Card>
            
            <Card className="p-4 bg-gradient-to-br from-purple-500/20 to-purple-500/5 border-2 border-purple-500/30">
              <div className="text-2xl mb-2">🧠</div>
              <h4 className="font-bold text-purple-700 text-sm mb-2">AI Processing</h4>
              <div className="text-xs space-y-1">
                <div>• Small LLMs (Llama 3.1, Phi-3)</div>
                <div>• Vision Models (GPT-4V, CLIP)</div>
                <div>• RAG Implementation</div>
                <div>• Vector Embeddings</div>
                <div>• Multi-Modal Processing</div>
              </div>
            </Card>
            
            <Card className="p-4 bg-gradient-to-br from-orange-500/20 to-orange-500/5 border-2 border-orange-500/30">
              <div className="text-2xl mb-2">💾</div>
              <h4 className="font-bold text-orange-700 text-sm mb-2">Backend Layer</h4>
              <div className="text-xs space-y-1">
                <div>• Supabase Database</div>
                <div>• Edge Functions</div>
                <div>• Vector Database</div>
                <div>• Real-time APIs</div>
                <div>• Authentication & RLS</div>
              </div>
            </Card>
          </div>
        </div>

        {/* Detailed Technical Stack */}
        <div className="grid grid-cols-2 gap-6">
          <Card className="p-6">
            <h3 className="text-lg font-bold text-primary mb-4">Frontend Architecture Details</h3>
            <div className="space-y-3">
              <div className="p-3 bg-accent/20 rounded-lg">
                <div className="font-semibold text-sm">React + TypeScript</div>
                <div className="text-xs text-muted-foreground">Component-based architecture with full type safety</div>
              </div>
              <div className="p-3 bg-accent/20 rounded-lg">
                <div className="font-semibold text-sm">UI Framework</div>
                <div className="text-xs text-muted-foreground">Tailwind CSS + shadcn/ui components</div>
              </div>
              <div className="p-3 bg-accent/20 rounded-lg">
                <div className="font-semibold text-sm">State Management</div>
                <div className="text-xs text-muted-foreground">React Query + Context API for data flow</div>
              </div>
              <div className="p-3 bg-accent/20 rounded-lg">
                <div className="font-semibold text-sm">Real-time Features</div>
                <div className="text-xs text-muted-foreground">WebSocket connections for live updates</div>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-bold text-primary mb-4">Backend & AI Stack</h3>
            <div className="space-y-3">
              <div className="p-3 bg-accent/20 rounded-lg">
                <div className="font-semibold text-sm">Supabase Platform</div>
                <div className="text-xs text-muted-foreground">PostgreSQL + Edge Functions + Real-time</div>
              </div>
              <div className="p-3 bg-accent/20 rounded-lg">
                <div className="font-semibold text-sm">AI Model Integration</div>
                <div className="text-xs text-muted-foreground">Multi-provider LLM routing with fallbacks</div>
              </div>
              <div className="p-3 bg-accent/20 rounded-lg">
                <div className="font-semibold text-sm">Vector Database</div>
                <div className="text-xs text-muted-foreground">pgvector for semantic search & RAG</div>
              </div>
              <div className="p-3 bg-accent/20 rounded-lg">
                <div className="font-semibold text-sm">Security & Compliance</div>
                <div className="text-xs text-muted-foreground">Row Level Security + HIPAA compliance</div>
              </div>
            </div>
          </Card>
        </div>

        {/* Model Details */}
        <Card className="p-6">
          <h3 className="text-lg font-bold text-primary mb-4">AI Model Specifications</h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="p-4 bg-gradient-to-br from-blue-500/10 to-blue-500/5 rounded-lg border">
              <h4 className="font-semibold text-blue-700 mb-2">🔤 Large Language Models</h4>
              <ul className="text-xs space-y-1">
                <li>• GPT-4 Turbo for complex reasoning</li>
                <li>• Claude 3.5 Sonnet for analysis</li>
                <li>• Llama 3.1 8B for local processing</li>
                <li>• Phi-3 Mini for edge deployment</li>
              </ul>
            </div>
            <div className="p-4 bg-gradient-to-br from-green-500/10 to-green-500/5 rounded-lg border">
              <h4 className="font-semibold text-green-700 mb-2">👁️ Vision Language Models</h4>
              <ul className="text-xs space-y-1">
                <li>• GPT-4V for image analysis</li>
                <li>• CLIP for visual understanding</li>
                <li>• PaLI for document processing</li>
                <li>• Custom OCR pipelines</li>
              </ul>
            </div>
            <div className="p-4 bg-gradient-to-br from-purple-500/10 to-purple-500/5 rounded-lg border">
              <h4 className="font-semibold text-purple-700 mb-2">🔍 Small Language Models</h4>
              <ul className="text-xs space-y-1">
                <li>• Gemma 2B for quick responses</li>
                <li>• DistilBERT for classification</li>
                <li>• T5-small for summarization</li>
                <li>• Custom fine-tuned models</li>
              </ul>
            </div>
          </div>
        </Card>
      </div>
    ),
    animation: 'slide'
  },
  {
    id: 3,
    title: "Agent Creation Journey Overview",
    subtitle: "Comprehensive 8-Step Process for Building Intelligent AI Agents",
    content: (
      <div className="h-full overflow-y-auto space-y-6 animate-fade-in">
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full">
            <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
            <span className="text-sm font-medium">End-to-End Implementation Journey</span>
          </div>
        </div>
        
        {/* Main Process Overview */}
        <div className="grid grid-cols-4 gap-3 mb-6">
          {[
            { step: 1, title: "Wizard Setup", icon: "🧙‍♂️", details: "Session initialization, user authentication, role assignment" },
            { step: 2, title: "Agent Creation", icon: "🤖", details: "Core agent definition, personality, objectives, constraints" },
            { step: 3, title: "Canvas Setup", icon: "🎨", details: "Visual interface design, component layout, user experience" },
            { step: 4, title: "Actions Config", icon: "⚙️", details: "Task assignment, workflow automation, business logic" }
          ].map((item) => (
            <Card key={item.step} className="p-4 text-center hover:scale-105 transition-all duration-300">
              <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary/80 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-lg">{item.icon}</span>
              </div>
              <div className="text-sm font-bold text-primary mb-1">{item.title}</div>
              <div className="text-xs text-muted-foreground mb-2">{item.details}</div>
              <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center mx-auto">
                <span className="text-white text-xs font-bold">{item.step}</span>
              </div>
            </Card>
          ))}
        </div>

        {/* Advanced Configuration Steps */}
        <div className="grid grid-cols-4 gap-3 mb-6">
          {[
            { step: 5, title: "AI Auto-Suggest", icon: "🧠", details: "ML-powered recommendations, intelligent task routing" },
            { step: 6, title: "Templates & Connectors", icon: "🔗", details: "Pre-built workflows, system integrations, APIs" },
            { step: 7, title: "Knowledge Base", icon: "📚", details: "RAG implementation, document ingestion, semantic search" },
            { step: 8, title: "Deployment", icon: "🚀", details: "Multi-channel publishing, monitoring, optimization" }
          ].map((item) => (
            <Card key={item.step} className="p-4 text-center hover:scale-105 transition-all duration-300">
              <div className="w-12 h-12 bg-gradient-to-br from-secondary to-secondary/80 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-lg">{item.icon}</span>
              </div>
              <div className="text-sm font-bold text-secondary mb-1">{item.title}</div>
              <div className="text-xs text-muted-foreground mb-2">{item.details}</div>
              <div className="w-6 h-6 bg-secondary rounded-full flex items-center justify-center mx-auto">
                <span className="text-white text-xs font-bold">{item.step}</span>
              </div>
            </Card>
          ))}
        </div>

        {/* Detailed Components Breakdown */}
        <div className="grid grid-cols-2 gap-4">
          <Card className="p-4">
            <h4 className="font-bold text-primary mb-3 flex items-center gap-2">
              <span>⚙️</span> Actions & Task Management
            </h4>
            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span><strong>Task Assignment:</strong> Automatic routing based on complexity & priority</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span><strong>Action Templates:</strong> Pre-configured workflows for common scenarios</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span><strong>Approval Workflows:</strong> Multi-step validation for critical tasks</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span><strong>Performance Monitoring:</strong> Real-time task execution tracking</span>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <h4 className="font-bold text-primary mb-3 flex items-center gap-2">
              <span>🔗</span> API & System Integration
            </h4>
            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span><strong>Internal APIs:</strong> Direct database access, user management, analytics</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span><strong>External APIs:</strong> Third-party services, payment gateways, messaging</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span><strong>System Connectors:</strong> EHR, CRM, email systems, cloud storage</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span><strong>Security Layer:</strong> OAuth, API keys, rate limiting, encryption</span>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <h4 className="font-bold text-primary mb-3 flex items-center gap-2">
              <span>🧠</span> AI Auto-Suggestion Engine
            </h4>
            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <span><strong>Context Analysis:</strong> Real-time conversation understanding</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <span><strong>Smart Routing:</strong> Optimal action selection based on intent</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <span><strong>Learning Loop:</strong> Continuous improvement from interactions</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <span><strong>Personalization:</strong> User-specific recommendations & preferences</span>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <h4 className="font-bold text-primary mb-3 flex items-center gap-2">
              <span>📚</span> Knowledge Base & RAG System
            </h4>
            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                <span><strong>Document Ingestion:</strong> PDF, Word, web content, databases</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                <span><strong>Vector Embeddings:</strong> Semantic search & content understanding</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                <span><strong>RAG Pipeline:</strong> Retrieval → Augmentation → Generation workflow</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                <span><strong>Context Relevance:</strong> Dynamic knowledge retrieval & ranking</span>
              </div>
            </div>
          </Card>
        </div>

        {/* Process Flow Indicator */}
        <div className="flex items-center justify-center mt-4">
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span>📋 Setup</span>
            <div className="w-4 h-0.5 bg-muted"></div>
            <span>🎨 Design</span>
            <div className="w-4 h-0.5 bg-muted"></div>
            <span>⚙️ Configure</span>
            <div className="w-4 h-0.5 bg-muted"></div>
            <span>🧠 Optimize</span>
            <div className="w-4 h-0.5 bg-muted"></div>
            <span>🚀 Deploy</span>
          </div>
        </div>
      </div>
    ),
    animation: 'zoom'
  },
  {
    id: 4,
    title: "Step 1: Wizard Setup & Initial Configuration",
    subtitle: "Session Management, User Authentication & Multi-Step Setup Process",
    content: (
      <div className="h-full overflow-y-auto space-y-6 animate-fade-in">
        {/* Wizard Process Flow */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full">
            <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
            <span className="text-sm font-medium">5-Step Wizard Configuration Process</span>
          </div>
        </div>

        <div className="grid grid-cols-5 gap-3 mb-6">
          {[
            { step: 1, title: "Session Init", icon: "🔐", desc: "User auth & session creation" },
            { step: 2, title: "Role Setup", icon: "👤", desc: "User role assignment & permissions" },
            { step: 3, title: "Agent Config", icon: "🤖", desc: "Basic agent parameters" },
            { step: 4, title: "Environment", icon: "⚙️", desc: "System environment setup" },
            { step: 5, title: "Validation", icon: "✅", desc: "Configuration testing" }
          ].map((item) => (
            <Card key={item.step} className="p-3 text-center hover:scale-105 transition-all duration-300">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary/80 rounded-full flex items-center justify-center mx-auto mb-2">
                <span className="text-sm">{item.icon}</span>
              </div>
              <div className="text-xs font-bold text-primary mb-1">{item.title}</div>
              <div className="text-xs text-muted-foreground">{item.desc}</div>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-6">
          <Card className="p-6">
            <h3 className="text-lg font-bold text-primary mb-4 flex items-center gap-2">
              <span>🧙‍♂️</span> Wizard Setup Implementation
            </h3>
            <div className="space-y-4">
              <div className="p-3 bg-accent/20 rounded-lg">
                <h4 className="font-semibold text-sm mb-2">Session Management</h4>
                <ul className="text-xs space-y-1 text-muted-foreground">
                  <li>• AgentBuilderProvider context for state management</li>
                  <li>• localStorage persistence for session data</li>
                  <li>• useAgentSession hook for operations</li>
                  <li>• Real-time session synchronization</li>
                </ul>
              </div>
              <div className="p-3 bg-accent/20 rounded-lg">
                <h4 className="font-semibold text-sm mb-2">Authentication Flow</h4>
                <ul className="text-xs space-y-1 text-muted-foreground">
                  <li>• useMasterAuth integration</li>
                  <li>• Role-based access control (RBAC)</li>
                  <li>• Multi-tenant user verification</li>
                  <li>• Security policy enforcement</li>
                </ul>
              </div>
              <div className="p-3 bg-accent/20 rounded-lg">
                <h4 className="font-semibold text-sm mb-2">Step Navigation</h4>
                <ul className="text-xs space-y-1 text-muted-foreground">
                  <li>• currentStep state management</li>
                  <li>• Validation at each step</li>
                  <li>• Back/forward navigation controls</li>
                  <li>• Progress indicator updates</li>
                </ul>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-bold text-primary mb-4 flex items-center gap-2">
              <span>⚙️</span> Configuration Details
            </h3>
            <div className="space-y-4">
              <div className="p-3 bg-accent/20 rounded-lg">
                <h4 className="font-semibold text-sm mb-2">Security Settings</h4>
                <ul className="text-xs space-y-1 text-muted-foreground">
                  <li>• HIPAA compliance configuration</li>
                  <li>• Data encryption parameters</li>
                  <li>• Access control policies</li>
                  <li>• Audit logging setup</li>
                </ul>
              </div>
              <div className="p-3 bg-accent/20 rounded-lg">
                <h4 className="font-semibold text-sm mb-2">System Integration</h4>
                <ul className="text-xs space-y-1 text-muted-foreground">
                  <li>• EHR system connections</li>
                  <li>• Database schema validation</li>
                  <li>• API endpoint configuration</li>
                  <li>• Third-party service setup</li>
                </ul>
              </div>
              <div className="p-3 bg-accent/20 rounded-lg">
                <h4 className="font-semibold text-sm mb-2">Environment Setup</h4>
                <ul className="text-xs space-y-1 text-muted-foreground">
                  <li>• Development/production modes</li>
                  <li>• Resource allocation settings</li>
                  <li>• Performance optimization</li>
                  <li>• Monitoring configuration</li>
                </ul>
              </div>
            </div>
          </Card>
        </div>

        {/* Implementation Components */}
        <Card className="p-6">
          <h3 className="text-lg font-bold text-primary mb-4">Technical Implementation Components</h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="p-4 bg-gradient-to-br from-blue-500/10 to-blue-500/5 rounded-lg border">
              <h4 className="font-semibold text-blue-700 mb-2">🔧 Core Hooks</h4>
              <ul className="text-xs space-y-1">
                <li>• <code>useAgentBuilder()</code> - Main context hook</li>
                <li>• <code>useMasterAuth()</code> - Authentication</li>
                <li>• <code>useAgentSession()</code> - Session operations</li>
                <li>• <code>useMasterFormStateManager()</code> - Form state</li>
              </ul>
            </div>
            <div className="p-4 bg-gradient-to-br from-green-500/10 to-green-500/5 rounded-lg border">
              <h4 className="font-semibold text-green-700 mb-2">🏗️ Provider Components</h4>
              <ul className="text-xs space-y-1">
                <li>• <code>AgentBuilderProvider</code> - Context wrapper</li>
                <li>• State management with <code>useState</code></li>
                <li>• Effect hooks for persistence</li>
                <li>• Error boundary integration</li>
              </ul>
            </div>
            <div className="p-4 bg-gradient-to-br from-purple-500/10 to-purple-500/5 rounded-lg border">
              <h4 className="font-semibold text-purple-700 mb-2">💾 State Management</h4>
              <ul className="text-xs space-y-1">
                <li>• <code>currentSessionId</code> tracking</li>
                <li>• <code>currentStep</code> navigation</li>
                <li>• UI state management</li>
                <li>• Form validation states</li>
              </ul>
            </div>
          </div>
        </Card>
      </div>
    ),
    animation: 'fade'
  },
  {
    id: 5,
    title: "Step 2: Canvas Design & Visual Branding",
    subtitle: "Agent Creation, Template System, Use Cases & Complete Branding Implementation",
    content: (
      <div className="h-full overflow-y-auto space-y-6 animate-fade-in">
        {/* Agent Creation Process */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-primary/20 to-secondary/20 px-4 py-2 rounded-full">
            <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
            <span className="text-sm font-medium">Complete Agent Creation & Branding System</span>
          </div>
        </div>

        {/* Agent Creation Methods */}
        <Card className="p-6">
          <h3 className="text-lg font-bold text-primary mb-4 flex items-center gap-2">
            <span>🤖</span> Agent Creation Pathways
          </h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="p-4 bg-gradient-to-br from-blue-500/10 to-blue-500/5 rounded-lg border border-blue-200">
              <div className="text-center mb-3">
                <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-2">
                  <span className="text-white text-lg">📋</span>
                </div>
                <h4 className="font-bold text-blue-700">Template-Based</h4>
              </div>
              <ul className="text-xs space-y-1">
                <li>• Pre-built healthcare templates</li>
                <li>• Industry-specific configurations</li>
                <li>• One-click deployment</li>
                <li>• Customizable parameters</li>
              </ul>
            </div>
            <div className="p-4 bg-gradient-to-br from-green-500/10 to-green-500/5 rounded-lg border border-green-200">
              <div className="text-center mb-3">
                <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-2">
                  <span className="text-white text-lg">🎨</span>
                </div>
                <h4 className="font-bold text-green-700">Custom Creation</h4>
              </div>
              <ul className="text-xs space-y-1">
                <li>• Drag-and-drop canvas interface</li>
                <li>• Component library access</li>
                <li>• Real-time visual editing</li>
                <li>• Advanced customization</li>
              </ul>
            </div>
            <div className="p-4 bg-gradient-to-br from-purple-500/10 to-purple-500/5 rounded-lg border border-purple-200">
              <div className="text-center mb-3">
                <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-2">
                  <span className="text-white text-lg">🚀</span>
                </div>
                <h4 className="font-bold text-purple-700">From Scratch</h4>
              </div>
              <ul className="text-xs space-y-1">
                <li>• Blank canvas starting point</li>
                <li>• Complete creative freedom</li>
                <li>• Step-by-step guidance</li>
                <li>• Custom workflow design</li>
              </ul>
            </div>
          </div>
        </Card>

        {/* Template System Implementation */}
        <div className="grid grid-cols-2 gap-6">
          <Card className="p-6">
            <h3 className="text-lg font-bold text-primary mb-4 flex items-center gap-2">
              <span>📚</span> Template System Details
            </h3>
            <div className="space-y-4">
              <div className="p-3 bg-accent/20 rounded-lg">
                <h4 className="font-semibold text-sm mb-2">Default Templates</h4>
                <ul className="text-xs space-y-1 text-muted-foreground">
                  <li>• Patient Intake Assistant</li>
                  <li>• Treatment Plan Coordinator</li>
                  <li>• Insurance Verification Agent</li>
                  <li>• Appointment Scheduler</li>
                  <li>• Care Manager Assistant</li>
                </ul>
              </div>
              <div className="p-3 bg-accent/20 rounded-lg">
                <h4 className="font-semibold text-sm mb-2">Custom Templates</h4>
                <ul className="text-xs space-y-1 text-muted-foreground">
                  <li>• Save custom configurations</li>
                  <li>• Share across team members</li>
                  <li>• Version control system</li>
                  <li>• Template marketplace</li>
                </ul>
              </div>
              <div className="p-3 bg-accent/20 rounded-lg">
                <h4 className="font-semibold text-sm mb-2">Template Features</h4>
                <ul className="text-xs space-y-1 text-muted-foreground">
                  <li>• Pre-configured AI models</li>
                  <li>• Built-in integrations</li>
                  <li>• Workflow automation</li>
                  <li>• Compliance settings</li>
                </ul>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-bold text-primary mb-4 flex items-center gap-2">
              <span>🎯</span> Implemented Categories & Business Units
            </h3>
            <div className="space-y-4">
              <div className="p-3 bg-accent/20 rounded-lg">
                <h4 className="font-semibold text-sm mb-2">Categories (from CategoryMapping component)</h4>
                <div className="grid grid-cols-2 gap-1 text-xs text-muted-foreground">
                  <div>• Onboarding and Credentaling</div>
                  <div>• Market access</div>
                  <div>• Distribution</div>
                  <div>• Manufacturing</div>
                  <div>• Claims Management</div>
                  <div>• Clinical information</div>
                  <div>• Product Information</div>
                  <div>• Packaging</div>
                  <div>• Scheduling</div>
                  <div>• Buy & Build</div>
                  <div>• Insurance</div>
                  <div>• Prior Authorization</div>
                  <div>• Compliance & Regulatory</div>
                </div>
              </div>
              <div className="p-3 bg-accent/20 rounded-lg">
                <h4 className="font-semibold text-sm mb-2">Business Units (Dropdown Selection)</h4>
                <div className="grid grid-cols-2 gap-1 text-xs text-muted-foreground">
                  <div>• Commercial</div>
                  <div>• Research & Development</div>
                  <div>• Supply Chain</div>
                  <div>• IT</div>
                  <div>• Manufacturing</div>
                  <div>• Compliance</div>
                  <div>• Finance</div>
                  <div>• HR</div>
                </div>
        </div>

        {/* Dynamic Use Case Generation */}
        <Card className="p-6">
          <h3 className="text-lg font-bold text-primary mb-4 flex items-center gap-2">
            <span>⚡</span> Dynamic Use Case Generation & Dropdown Implementation
          </h3>
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="p-3 bg-accent/20 rounded-lg">
                <h4 className="font-semibold text-sm mb-2">UseCaseSelector Implementation</h4>
                <ul className="text-xs space-y-1 text-muted-foreground">
                  <li>• Automatically generates use cases based on selected categories</li>
                  <li>• Real-time dropdown with category-based filtering</li>
                  <li>• Custom use case creation & management system</li>
                  <li>• Topic-based use case suggestions</li>
                  <li>• High z-index (z-[100]) dropdown implementation</li>
                </ul>
              </div>
              <div className="p-3 bg-accent/20 rounded-lg">
                <h4 className="font-semibold text-sm mb-2">Example Generated Use Cases</h4>
                <ul className="text-xs space-y-1 text-muted-foreground">
                  <li>• Provider Onboarding Assistant (from categories)</li>
                  <li>• Market Access Strategy Assistant (from selection)</li>
                  <li>• Claims Processing Assistant (dynamic generation)</li>
                  <li>• Insurance Verification Assistant (topic-based)</li>
                  <li>• Manufacturing Compliance Agent (category-based)</li>
                  <li>• + Custom user-defined use cases</li>
                </ul>
              </div>
            </div>
            <div className="space-y-4">
              <div className="p-3 bg-accent/20 rounded-lg">
                <h4 className="font-semibold text-sm mb-2">Dropdown Technical Implementation</h4>
                <ul className="text-xs space-y-1 text-muted-foreground">
                  <li>• Solid background (bg-background) for proper visibility</li>
                  <li>• Shadow-lg for depth and layering</li>
                  <li>• Smooth animations and transitions</li>
                  <li>• Keyboard navigation support</li>
                  <li>• Overflow handling with scrollable content</li>
                </ul>
              </div>
              <div className="p-3 bg-accent/20 rounded-lg">
                <h4 className="font-semibold text-sm mb-2">CategoryMapping Component Features</h4>
                <ul className="text-xs space-y-1 text-muted-foreground">
                  <li>• Three-column layout (Categories, Business Units, Topics)</li>
                  <li>• Real-time selection with visual feedback</li>
                  <li>• Add/remove custom entries with validation</li>
                  <li>• Toast notifications for user actions</li>
                  <li>• Proper z-indexing and dropdown positioning</li>
                </ul>
              </div>
            </div>
          </div>
        </Card>
              <div className="p-3 bg-accent/20 rounded-lg">
                <h4 className="font-semibold text-sm mb-2">Topics (Implementation)</h4>
                <div className="grid grid-cols-2 gap-1 text-xs text-muted-foreground">
                  <div>• Patient onboarding</div>
                  <div>• Treatment center</div>
                  <div>• Provider onboarding</div>
                  <div>• Pharma/Biotech onboarding</div>
                  <div>• Eligibility Investigation</div>
                  <div>• Eligibility Verification</div>
                  <div>• Delivery/Fulfillment</div>
                  <div>• Label & Adverse Events</div>
                  <div>• Product details</div>
                  <div>• Billing & Coding</div>
                  <div>• Appointments scheduling</div>
                  <div>• 21 CFR Part 11</div>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Visual Branding System */}
        <Card className="p-6">
          <h3 className="text-lg font-bold text-primary mb-4 flex items-center gap-2">
            <span>🎨</span> Complete Branding & Design System
          </h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="p-4 bg-gradient-to-br from-orange-500/10 to-orange-500/5 rounded-lg border">
              <h4 className="font-semibold text-orange-700 mb-3">🖼️ Logo Integration</h4>
              <ul className="text-xs space-y-1">
                <li>• Upload custom logos (SVG, PNG)</li>
                <li>• Automatic sizing & positioning</li>
                <li>• Responsive logo scaling</li>
                <li>• Brand consistency validation</li>
                <li>• Logo variation management</li>
              </ul>
            </div>
            <div className="p-4 bg-gradient-to-br from-pink-500/10 to-pink-500/5 rounded-lg border">
              <h4 className="font-semibold text-pink-700 mb-3">🎨 Color Palette System</h4>
              <ul className="text-xs space-y-1">
                <li>• HSL color system implementation</li>
                <li>• Semantic token architecture</li>
                <li>• Dark/light mode support</li>
                <li>• Accessibility compliance (WCAG)</li>
                <li>• Brand color extraction from logo</li>
              </ul>
            </div>
            <div className="p-4 bg-gradient-to-br from-indigo-500/10 to-indigo-500/5 rounded-lg border">
              <h4 className="font-semibold text-indigo-700 mb-3">✨ Design System Features</h4>
              <ul className="text-xs space-y-1">
                <li>• Tailwind CSS + shadcn/ui</li>
                <li>• Component variant system</li>
                <li>• Animation & transition effects</li>
                <li>• Typography scale & hierarchy</li>
                <li>• Consistent spacing system</li>
              </ul>
            </div>
          </div>
        </Card>

        {/* Canvas Implementation Details */}
        <Card className="p-6">
          <h3 className="text-lg font-bold text-primary mb-4">Canvas Implementation Architecture</h3>
          <div className="grid grid-cols-4 gap-4">
            <div className="p-3 bg-card rounded-lg border">
              <div className="text-center mb-2">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center mx-auto">
                  <span className="text-white text-xs">🎨</span>
                </div>
              </div>
              <h5 className="font-semibold text-xs mb-2">Visual Editor</h5>
              <ul className="text-xs space-y-1 text-muted-foreground">
                <li>• Drag-and-drop interface</li>
                <li>• Real-time preview</li>
                <li>• Component snapping</li>
                <li>• Undo/redo system</li>
              </ul>
            </div>
            <div className="p-3 bg-card rounded-lg border">
              <div className="text-center mb-2">
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center mx-auto">
                  <span className="text-white text-xs">🔧</span>
                </div>
              </div>
              <h5 className="font-semibold text-xs mb-2">Component Library</h5>
              <ul className="text-xs space-y-1 text-muted-foreground">
                <li>• Pre-built UI components</li>
                <li>• Healthcare-specific widgets</li>
                <li>• Form input collections</li>
                <li>• Data visualization</li>
              </ul>
            </div>
            <div className="p-3 bg-card rounded-lg border">
              <div className="text-center mb-2">
                <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center mx-auto">
                  <span className="text-white text-xs">📱</span>
                </div>
              </div>
              <h5 className="font-semibold text-xs mb-2">Responsive Design</h5>
              <ul className="text-xs space-y-1 text-muted-foreground">
                <li>• Mobile-first approach</li>
                <li>• Breakpoint management</li>
                <li>• Flexible grid system</li>
                <li>• Touch-friendly interfaces</li>
              </ul>
            </div>
            <div className="p-3 bg-card rounded-lg border">
              <div className="text-center mb-2">
                <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center mx-auto">
                  <span className="text-white text-xs">⚡</span>
                </div>
              </div>
              <h5 className="font-semibold text-xs mb-2">Performance</h5>
              <ul className="text-xs space-y-1 text-muted-foreground">
                <li>• Lazy loading components</li>
                <li>• Optimized rendering</li>
                <li>• Minimal bundle size</li>
                <li>• Fast hot reloading</li>
              </ul>
            </div>
          </div>
        </Card>
      </div>
    ),
    animation: 'slide'
  },
  {
    id: 6,
    title: "Step 3: Actions Configuration & System Connectors",
    subtitle: "Auto-Assign Templates & External System Integration",
    content: (
      <div className="h-full flex flex-col space-y-3 animate-fade-in max-h-full">
        <div className="grid grid-cols-2 gap-3 flex-1 min-h-0">
          {/* Left Column - AI Templates & Actions */}
          <Card className="p-3 flex flex-col min-h-0">
            <div className="text-center mb-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-2 shadow-lg">
                <span className="text-lg">🤖</span>
              </div>
              <h3 className="text-md font-bold text-purple-700">AI Template System</h3>
            </div>
            
            <div className="space-y-2 overflow-y-auto flex-1">
              <div className="p-2 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg border border-purple-200">
                <h4 className="font-semibold text-purple-700 mb-1 flex items-center gap-2 text-xs">
                  <span className="text-xs">⚡</span> Auto-Assign AI Templates
                </h4>
                <ul className="text-xs space-y-1 text-gray-700">
                  <li>• Context-aware action suggestions</li>
                  <li>• Agent type & purpose analysis</li>
                  <li>• Score-based connector matching</li>
                  <li>• Real-time task optimization</li>
                </ul>
              </div>
              
              <div className="p-2 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg border border-blue-200">
                <h4 className="font-semibold text-blue-700 mb-1 flex items-center gap-2 text-xs">
                  <span className="text-xs">🎨</span> Custom Template Creation
                </h4>
                <ul className="text-xs space-y-1 text-gray-700">
                  <li>• Wizard-guided setup</li>
                  <li>• Dynamic configuration forms</li>
                  <li>• Multi-step validation</li>
                  <li>• Reusable action chains</li>
                </ul>
              </div>
              
              <div className="p-2 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
                <h4 className="font-semibold text-green-700 mb-1 flex items-center gap-2 text-xs">
                  <span className="text-xs">📋</span> Task Assignment Engine
                </h4>
                <ul className="text-xs space-y-1 text-gray-700">
                  <li>• Intelligent connector assignment</li>
                  <li>• Type-based matching algorithm</li>
                  <li>• Category alignment scoring</li>
                  <li>• Performance monitoring</li>
                </ul>
              </div>
            </div>
          </Card>

          {/* Right Column - AI Models & Implementation */}
          <Card className="p-3 flex flex-col min-h-0">
            <div className="text-center mb-3">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-2 shadow-lg">
                <span className="text-lg">🧠</span>
              </div>
              <h3 className="text-md font-bold text-emerald-700">AI Models Implementation</h3>
            </div>
            
            <div className="space-y-2 overflow-y-auto flex-1">
              <div className="p-2 bg-card rounded-lg border">
                <h4 className="font-semibold text-primary mb-1 flex items-center gap-2 text-xs">
                  <span className="text-xs">🚀</span> Large Language Models
                </h4>
                <ul className="text-xs space-y-1 text-muted-foreground">
                  <li>• GPT-4 for complex reasoning</li>
                  <li>• Claude for healthcare compliance</li>
                  <li>• Multi-model orchestration</li>
                  <li>• Context-aware routing</li>
                </ul>
              </div>
              
              <div className="p-2 bg-card rounded-lg border">
                <h4 className="font-semibold text-primary mb-1 flex items-center gap-2 text-xs">
                  <span className="text-xs">⚡</span> Small Language Models
                </h4>
                <ul className="text-xs space-y-1 text-muted-foreground">
                  <li>• Llama 3.1 8B for efficiency</li>
                  <li>• Phi-3 Mini for quick responses</li>
                  <li>• Gemma 2B for lightweight tasks</li>
                  <li>• Edge deployment ready</li>
                </ul>
              </div>
              
              <div className="p-2 bg-card rounded-lg border">
                <h4 className="font-semibold text-primary mb-1 flex items-center gap-2 text-xs">
                  <span className="text-xs">👁️</span> Vision & MCP Protocol
                </h4>
                <ul className="text-xs space-y-1 text-muted-foreground">
                  <li>• GPT-4V for image analysis</li>
                  <li>• MCP SDK integration</li>
                  <li>• OCR document processing</li>
                  <li>• Labeling studio workflows</li>
                </ul>
              </div>
            </div>
          </Card>
        </div>

        {/* Bottom Section - System Connectors & Knowledge Base */}
        <div className="grid grid-cols-2 gap-3 h-48 min-h-0">
          <Card className="p-3 flex flex-col min-h-0">
            <h3 className="text-sm font-bold mb-2 text-primary flex items-center gap-2">
              <span className="text-md">🔌</span> System Connectors
            </h3>
            <div className="grid grid-cols-2 gap-1 overflow-y-auto flex-1">
              <div className="p-2 bg-gradient-to-r from-blue-50 to-blue-100 rounded border border-blue-200">
                <div className="font-medium text-blue-800 flex items-center gap-1 text-xs">
                  <Database className="h-3 w-3" />
                  Database
                </div>
                <div className="text-xs text-blue-600">Oracle • MySQL • PostgreSQL</div>
              </div>
              <div className="p-2 bg-gradient-to-r from-green-50 to-green-100 rounded border border-green-200">
                <div className="font-medium text-green-800 flex items-center gap-1 text-xs">
                  <Cloud className="h-3 w-3" />
                  REST API
                </div>
                <div className="text-xs text-green-600">HTTP endpoints • Webhooks</div>
              </div>
              <div className="p-2 bg-gradient-to-r from-purple-50 to-purple-100 rounded border border-purple-200">
                <div className="font-medium text-purple-800 flex items-center gap-1 text-xs">
                  <MessageSquare className="h-3 w-3" />
                  Messaging
                </div>
                <div className="text-xs text-purple-600">Kafka • RabbitMQ • SQS</div>
              </div>
              <div className="p-2 bg-gradient-to-r from-orange-50 to-orange-100 rounded border border-orange-200">
                <div className="font-medium text-orange-800 flex items-center gap-1 text-xs">
                  <FileText className="h-3 w-3" />
                  File System
                </div>
                <div className="text-xs text-orange-600">FTP • SFTP • S3 Storage</div>
              </div>
              <div className="p-2 bg-gradient-to-r from-red-50 to-red-100 rounded border border-red-200">
                <div className="font-medium text-red-800 flex items-center gap-1 text-xs">
                  <Globe className="h-3 w-3" />
                  External Services
                </div>
                <div className="text-xs text-red-600">Salesforce • Workday</div>
              </div>
              <div className="p-2 bg-gradient-to-r from-indigo-50 to-indigo-100 rounded border border-indigo-200">
                <div className="font-medium text-indigo-800 flex items-center gap-1 text-xs">
                  <Zap className="h-3 w-3" />
                  AI Models
                </div>
                <div className="text-xs text-indigo-600">OpenAI • Anthropic</div>
              </div>
            </div>
          </Card>

          <Card className="p-3 flex flex-col min-h-0">
            <h3 className="text-sm font-bold mb-2 text-primary flex items-center gap-2">
              <span className="text-md">🧠</span> Knowledge Base & Integration
            </h3>
            <div className="space-y-1 overflow-y-auto flex-1">
              <div className="p-2 bg-gradient-to-r from-indigo-50 to-indigo-100 rounded border border-indigo-200">
                <div className="font-medium text-indigo-800 flex items-center gap-2 text-xs">
                  <span className="text-xs">📚</span> Supabase Integration
                </div>
                <div className="text-xs text-indigo-600">Vector embeddings • Real-time data • Auth</div>
              </div>
              <div className="p-2 bg-gradient-to-r from-cyan-50 to-cyan-100 rounded border border-cyan-200">
                <div className="font-medium text-cyan-800 flex items-center gap-2 text-xs">
                  <span className="text-xs">🔍</span> RAG Implementation
                </div>
                <div className="text-xs text-cyan-600">Context retrieval • Smart suggestions</div>
              </div>
              <div className="p-2 bg-gradient-to-r from-emerald-50 to-emerald-100 rounded border border-emerald-200">
                <div className="font-medium text-emerald-800 flex items-center gap-2 text-xs">
                  <span className="text-xs">⚡</span> Auto-Assignment Features
                </div>
                <div className="text-xs text-emerald-600">Smart matching • Performance tracking</div>
              </div>
              <div className="p-2 bg-gradient-to-r from-violet-50 to-violet-100 rounded border border-violet-200">
                <div className="font-medium text-violet-800 flex items-center gap-2 text-xs">
                  <span className="text-xs">🔧</span> Configuration Wizard
                </div>
                <div className="text-xs text-violet-600">Step-by-step setup • Validation</div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    ),
    animation: 'zoom'
  },
  {
    id: 7,
    title: "Knowledge Base & RAG Implementation",
    subtitle: "Comprehensive Document Management, Auto-Creation, Upload, Crawl & RAG for Content Approval",
    content: (
      <div className="h-[420px] flex flex-col space-y-2 animate-fade-in">
        {/* Header */}
        <div className="text-center flex-shrink-0">
          <div className="inline-flex items-center gap-2 bg-primary/10 px-3 py-1 rounded-full">
            <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
            <span className="text-xs font-medium">Complete Knowledge Base & RAG System</span>
          </div>
        </div>

        {/* Main Implementation Grid */}
        <div className="grid grid-cols-2 gap-2 h-[180px] flex-shrink-0">
          {/* Auto-Creation & Upload */}
          <Card className="p-2 flex flex-col">
            <div className="text-center mb-1 flex-shrink-0">
              <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-1 shadow-lg">
                <span className="text-xs">📚</span>
              </div>
              <h3 className="text-xs font-bold text-blue-700">Auto-Creation & Upload</h3>
            </div>
            <div className="space-y-1 flex-1 overflow-y-auto">
              <div className="p-1 bg-gradient-to-r from-blue-50 to-blue-100 rounded border border-blue-200">
                <h4 className="font-semibold text-blue-800 mb-1 text-xs flex items-center gap-1">
                  <span>🤖</span> Auto-Generation
                </h4>
                <ul className="text-xs space-y-1 text-blue-700">
                  <li>• OpenAI API content generation</li>
                  <li>• Topic-based knowledge creation</li>
                </ul>
              </div>
              <div className="p-1 bg-gradient-to-r from-green-50 to-green-100 rounded border border-green-200">
                <h4 className="font-semibold text-green-800 mb-1 text-xs flex items-center gap-1">
                  <span>📁</span> File Upload
                </h4>
                <ul className="text-xs space-y-1 text-green-700">
                  <li>• Drag-and-drop interface</li>
                  <li>• Supabase storage integration</li>
                </ul>
              </div>
            </div>
          </Card>

          {/* Web Crawling & Data Sources */}
          <Card className="p-2 flex flex-col">
            <div className="text-center mb-1 flex-shrink-0">
              <div className="w-6 h-6 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-1 shadow-lg">
                <span className="text-xs">🌐</span>
              </div>
              <h3 className="text-xs font-bold text-purple-700">Web Crawling & Data Sources</h3>
            </div>
            <div className="space-y-1 flex-1 overflow-y-auto">
              <div className="p-1 bg-gradient-to-r from-purple-50 to-purple-100 rounded border border-purple-200">
                <h4 className="font-semibold text-purple-800 mb-1 text-xs flex items-center gap-1">
                  <span>🔥</span> Firecrawl API
                </h4>
                <ul className="text-xs space-y-1 text-purple-700">
                  <li>• Enhanced web scraping</li>
                  <li>• Multi-URL processing</li>
                </ul>
              </div>
              <div className="p-1 bg-gradient-to-r from-orange-50 to-orange-100 rounded border border-orange-200">
                <h4 className="font-semibold text-orange-800 mb-1 text-xs flex items-center gap-1">
                  <span>🗃️</span> Source Manager
                </h4>
                <ul className="text-xs space-y-1 text-orange-700">
                  <li>• URLs, documents, databases</li>
                  <li>• Auto-sync intervals</li>
                </ul>
              </div>
            </div>
          </Card>
        </div>

        {/* RAG Implementation & Content Approval */}
        <div className="grid grid-cols-2 gap-2 h-[180px] flex-shrink-0">
          <Card className="p-2 flex flex-col">
            <div className="text-center mb-1 flex-shrink-0">
              <div className="w-6 h-6 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-1 shadow-lg">
                <span className="text-xs">🔍</span>
              </div>
              <h3 className="text-xs font-bold text-emerald-700">RAG Implementation</h3>
            </div>
            <div className="space-y-1 flex-1 overflow-y-auto">
              <div className="p-1 bg-gradient-to-r from-emerald-50 to-emerald-100 rounded border border-emerald-200">
                <h4 className="font-semibold text-emerald-800 mb-1 text-xs flex items-center gap-1">
                  <span>🧠</span> Vector Database
                </h4>
                <ul className="text-xs space-y-1 text-emerald-700">
                  <li>• Supabase pgvector</li>
                  <li>• Semantic search</li>
                </ul>
              </div>
              <div className="p-1 bg-gradient-to-r from-cyan-50 to-cyan-100 rounded border border-cyan-200">
                <h4 className="font-semibold text-cyan-800 mb-1 text-xs flex items-center gap-1">
                  <span>🎯</span> Context Retrieval
                </h4>
                <ul className="text-xs space-y-1 text-cyan-700">
                  <li>• Smart chunking</li>
                  <li>• Relevance scoring</li>
                </ul>
              </div>
            </div>
          </Card>

          <Card className="p-2 flex flex-col">
            <div className="text-center mb-1 flex-shrink-0">
              <div className="w-6 h-6 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-1 shadow-lg">
                <span className="text-xs">✅</span>
              </div>
              <h3 className="text-xs font-bold text-indigo-700">Content Approval</h3>
            </div>
            <div className="space-y-1 flex-1 overflow-y-auto">
              <div className="p-1 bg-gradient-to-r from-indigo-50 to-indigo-100 rounded border border-indigo-200">
                <h4 className="font-semibold text-indigo-800 mb-1 text-xs flex items-center gap-1">
                  <span>🔄</span> Approval Workflow
                </h4>
                <ul className="text-xs space-y-1 text-indigo-700">
                  <li>• Knowledge-based approval</li>
                  <li>• Multi-stage review</li>
                </ul>
              </div>
              <div className="p-1 bg-gradient-to-r from-pink-50 to-pink-100 rounded border border-pink-200">
                <h4 className="font-semibold text-pink-800 mb-1 text-xs flex items-center gap-1">
                  <span>⚡</span> Auto-Generation
                </h4>
                <ul className="text-xs space-y-1 text-pink-700">
                  <li>• RAG-enhanced responses</li>
                  <li>• Context-aware suggestions</li>
                </ul>
              </div>
            </div>
          </Card>
        </div>

        {/* Technical Implementation Details */}
        <Card className="p-2 flex-shrink-0 h-[45px]">
          <h3 className="text-xs font-bold text-primary mb-1 flex items-center gap-2">
            <span>⚙️</span> Technical Stack
          </h3>
          <div className="grid grid-cols-4 gap-1">
            <div className="text-center">
              <div className="text-xs font-semibold text-primary">Storage</div>
              <div className="text-xs text-muted-foreground">Supabase • Vector DB</div>
            </div>
            <div className="text-center">
              <div className="text-xs font-semibold text-primary">Functions</div>
              <div className="text-xs text-muted-foreground">Generation • Crawling</div>
            </div>
            <div className="text-center">
              <div className="text-xs font-semibold text-primary">Components</div>
              <div className="text-xs text-muted-foreground">Enhanced KB • Manager</div>
            </div>
            <div className="text-center">
              <div className="text-xs font-semibold text-primary">APIs</div>
              <div className="text-xs text-muted-foreground">OpenAI • Firecrawl</div>
            </div>
          </div>
        </Card>
      </div>
    ),
    animation: 'fade'
  },
  {
    id: 8,
    title: "Multi-Channel Deployment System",
    subtitle: "Complete Implementation - Drag & Drop, Agent Assignment, Multi-Channel & Omni-Channel Support",
    content: (
      <div className="h-[420px] flex flex-col space-y-2 animate-fade-in">
        {/* Header */}
        <div className="text-center flex-shrink-0">
          <div className="inline-flex items-center gap-2 bg-primary/10 px-3 py-1 rounded-full">
            <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
            <span className="text-xs font-medium">Advanced Deployment Management System</span>
          </div>
        </div>

        {/* Drag & Drop Implementation */}
        <div className="grid grid-cols-2 gap-2 h-[180px] flex-shrink-0">
          <Card className="p-2 flex flex-col">
            <div className="text-center mb-1 flex-shrink-0">
              <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-1 shadow-lg">
                <span className="text-xs">🎯</span>
              </div>
              <h3 className="text-xs font-bold text-blue-700">Drag & Drop Agent Assignment</h3>
            </div>
            <div className="space-y-1 flex-1 overflow-y-auto">
              <div className="p-1 bg-gradient-to-r from-blue-50 to-blue-100 rounded border border-blue-200">
                <h4 className="font-semibold text-blue-800 mb-1 text-xs flex items-center gap-1">
                  <span>🎨</span> DraggableAgentCard
                </h4>
                <ul className="text-xs space-y-1 text-blue-700">
                  <li>• @dnd-kit/core integration</li>
                  <li>• Agent status visualization</li>
                  <li>• Real-time deployment metrics</li>
                </ul>
              </div>
              <div className="p-1 bg-gradient-to-r from-purple-50 to-purple-100 rounded border border-purple-200">
                <h4 className="font-semibold text-purple-800 mb-1 text-xs flex items-center gap-1">
                  <span>📋</span> DroppableChannel
                </h4>
                <ul className="text-xs space-y-1 text-purple-700">
                  <li>• Channel capacity management</li>
                  <li>• Visual drop indicators</li>
                  <li>• Assignment validation</li>
                </ul>
              </div>
            </div>
          </Card>

          <Card className="p-2 flex flex-col">
            <div className="text-center mb-1 flex-shrink-0">
              <div className="w-6 h-6 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-1 shadow-lg">
                <span className="text-xs">🌐</span>
              </div>
              <h3 className="text-xs font-bold text-green-700">Multi-Channel & Omni-Channel</h3>
            </div>
            <div className="space-y-1 flex-1 overflow-y-auto">
              <div className="p-1 bg-gradient-to-r from-green-50 to-green-100 rounded border border-green-200">
                <h4 className="font-semibold text-green-800 mb-1 text-xs flex items-center gap-1">
                  <span>📱</span> Channel Types
                </h4>
                <ul className="text-xs space-y-1 text-green-700">
                  <li>• Voice Call (VOIP)</li>
                  <li>• Web Chat • Email • SMS</li>
                  <li>• WhatsApp Business API</li>
                </ul>
              </div>
              <div className="p-1 bg-gradient-to-r from-emerald-50 to-emerald-100 rounded border border-emerald-200">
                <h4 className="font-semibold text-emerald-800 mb-1 text-xs flex items-center gap-1">
                  <span>🔄</span> Omni-Channel
                </h4>
                <ul className="text-xs space-y-1 text-emerald-700">
                  <li>• Cross-channel context sharing</li>
                  <li>• Unified customer journey</li>
                </ul>
              </div>
            </div>
          </Card>
        </div>

        {/* Agent Assignment Matrix */}
        <div className="grid grid-cols-2 gap-2 h-[180px] flex-shrink-0">
          <Card className="p-2 flex flex-col">
            <div className="text-center mb-1 flex-shrink-0">
              <div className="w-6 h-6 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-1 shadow-lg">
                <span className="text-xs">🤖</span>
              </div>
              <h3 className="text-xs font-bold text-purple-700">Agent Assignment Options</h3>
            </div>
            <div className="space-y-1 flex-1 overflow-y-auto">
              <div className="p-1 bg-gradient-to-r from-indigo-50 to-indigo-100 rounded border border-indigo-200">
                <h4 className="font-semibold text-indigo-800 mb-1 text-xs flex items-center gap-1">
                  <span>1️⃣</span> Single Agent → Single Channel
                </h4>
                <ul className="text-xs space-y-1 text-indigo-700">
                  <li>• Dedicated agent assignment</li>
                  <li>• Specialized expertise</li>
                </ul>
              </div>
              <div className="p-1 bg-gradient-to-r from-blue-50 to-blue-100 rounded border border-blue-200">
                <h4 className="font-semibold text-blue-800 mb-1 text-xs flex items-center gap-1">
                  <span>🔢</span> Single Agent → Multi-Channel
                </h4>
                <ul className="text-xs space-y-1 text-blue-700">
                  <li>• Cross-channel deployment</li>
                  <li>• Context consistency</li>
                </ul>
              </div>
              <div className="p-1 bg-gradient-to-r from-cyan-50 to-cyan-100 rounded border border-cyan-200">
                <h4 className="font-semibold text-cyan-800 mb-1 text-xs flex items-center gap-1">
                  <span>👥</span> Multi-Agent → Single/Multi
                </h4>
                <ul className="text-xs space-y-1 text-cyan-700">
                  <li>• Load balancing</li>
                  <li>• Redundancy & failover</li>
                </ul>
              </div>
            </div>
          </Card>

          <Card className="p-2 flex flex-col">
            <div className="text-center mb-1 flex-shrink-0">
              <div className="w-6 h-6 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-1 shadow-lg">
                <span className="text-xs">🔌</span>
              </div>
              <h3 className="text-xs font-bold text-orange-700">System Connector Assignment</h3>
            </div>
            <div className="space-y-1 flex-1 overflow-y-auto">
              <div className="p-1 bg-gradient-to-r from-orange-50 to-orange-100 rounded border border-orange-200">
                <h4 className="font-semibold text-orange-800 mb-1 text-xs flex items-center gap-1">
                  <span>⚡</span> Single Connector → Task
                </h4>
                <ul className="text-xs space-y-1 text-orange-700">
                  <li>• Dedicated API assignment</li>
                  <li>• Task-specific configuration</li>
                </ul>
              </div>
              <div className="p-1 bg-gradient-to-r from-red-50 to-red-100 rounded border border-red-200">
                <h4 className="font-semibold text-red-800 mb-1 text-xs flex items-center gap-1">
                  <span>🔗</span> Multiple Connectors
                </h4>
                <ul className="text-xs space-y-1 text-red-700">
                  <li>• Workflow orchestration</li>
                  <li>• Chain of API calls</li>
                </ul>
              </div>
              <div className="p-1 bg-gradient-to-r from-yellow-50 to-yellow-100 rounded border border-yellow-200">
                <h4 className="font-semibold text-yellow-800 mb-1 text-xs flex items-center gap-1">
                  <span>🎯</span> APIAssignmentManager
                </h4>
                <ul className="text-xs space-y-1 text-yellow-700">
                  <li>• Real-time assignment tracking</li>
                  <li>• Configuration management</li>
                </ul>
              </div>
            </div>
          </Card>
        </div>

        {/* Implementation Details */}
        <Card className="p-2 flex-shrink-0 h-[45px]">
          <h3 className="text-xs font-bold text-primary mb-1 flex items-center gap-2">
            <span>⚙️</span> Technical Implementation Components
          </h3>
          <div className="grid grid-cols-4 gap-1">
            <div className="text-center">
              <div className="text-xs font-semibold text-primary">Core Components</div>
              <div className="text-xs text-muted-foreground">DeploymentChannels • DraggableAgentCard</div>
            </div>
            <div className="text-center">
              <div className="text-xs font-semibold text-primary">Hooks & Logic</div>
              <div className="text-xs text-muted-foreground">useAgentDeployments • Drag & Drop Kit</div>
            </div>
            <div className="text-center">
              <div className="text-xs font-semibold text-primary">Data Management</div>
              <div className="text-xs text-muted-foreground">Agent Deployments • Channel Assignments</div>
            </div>
            <div className="text-center">
              <div className="text-xs font-semibold text-primary">Features</div>
              <div className="text-xs text-muted-foreground">Health Monitoring • Metrics • Config Dialog</div>
            </div>
          </div>
        </Card>
      </div>
    ),
    animation: 'slide'
  },
  {
    id: 9,
    title: "MCP Protocol & Small Language Models",
    subtitle: "Model Context Protocol Integration",
    content: (
      <div className="h-full overflow-y-auto space-y-6 animate-fade-in">
        <Card className="p-6">
          <h3 className="text-xl font-bold mb-4 text-primary">MCP Protocol Architecture</h3>
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="font-semibold">Protocol Features</h4>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-primary rounded-full"></div>
                  <span>Context sharing between models</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-primary rounded-full"></div>
                  <span>Efficient model communication</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-primary rounded-full"></div>
                  <span>Session state management</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-primary rounded-full"></div>
                  <span>Multi-model orchestration</span>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <h4 className="font-semibold">Small Language Models</h4>
              <div className="space-y-3">
                <div className="p-3 bg-muted rounded-lg">
                  <div className="font-medium">Llama 3.1 8B</div>
                  <div className="text-sm text-muted-foreground">General purpose reasoning</div>
                </div>
                <div className="p-3 bg-muted rounded-lg">
                  <div className="font-medium">Phi-3 Mini</div>
                  <div className="text-sm text-muted-foreground">Efficient inference</div>
                </div>
                <div className="p-3 bg-muted rounded-lg">
                  <div className="font-medium">Gemma 2B</div>
                  <div className="text-sm text-muted-foreground">Quick responses</div>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    ),
    animation: 'zoom'
  },
  {
    id: 10,
    title: "Knowledge Base & RAG System",
    subtitle: "Retrieval Augmented Generation Implementation",
    content: (
      <div className="h-full overflow-y-auto space-y-6 animate-fade-in">
        <Card className="p-6">
          <h3 className="text-xl font-bold mb-4 text-primary">RAG Architecture</h3>
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="font-semibold">Knowledge Sources</h4>
              <div className="space-y-3">
                <div className="p-3 bg-muted rounded-lg">
                  <div className="font-medium">📚 Medical Literature</div>
                  <div className="text-sm text-muted-foreground">Evidence-based protocols</div>
                </div>
                <div className="p-3 bg-muted rounded-lg">
                  <div className="font-medium">📋 Treatment Guidelines</div>
                  <div className="text-sm text-muted-foreground">Best practice recommendations</div>
                </div>
                <div className="p-3 bg-muted rounded-lg">
                  <div className="font-medium">🏥 Internal Policies</div>
                  <div className="text-sm text-muted-foreground">Center-specific procedures</div>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <h4 className="font-semibold">Vector Database</h4>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span>Semantic search capabilities</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span>Real-time updates</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span>Multi-language support</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span>Version control</span>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    ),
    animation: 'fade'
  },
  {
    id: 11,
    title: "AI Model Selection & Assignment",
    subtitle: "Choosing the Right Models for Each Task",
    content: (
      <div className="h-full overflow-y-auto space-y-6 animate-fade-in">
        <Card className="p-6">
          <h3 className="text-xl font-bold mb-4 text-primary">Model Assignment Matrix</h3>
          <div className="grid grid-cols-3 gap-6">
            <div className="space-y-4">
              <h4 className="font-semibold">Text Processing</h4>
              <div className="space-y-2">
                <div className="p-2 bg-blue-100 rounded text-sm">
                  <strong>Llama 3.1 8B</strong><br/>
                  Complex reasoning tasks
                </div>
                <div className="p-2 bg-green-100 rounded text-sm">
                  <strong>Phi-3 Mini</strong><br/>
                  Quick Q&A responses
                </div>
                <div className="p-2 bg-purple-100 rounded text-sm">
                  <strong>Gemma 2B</strong><br/>
                  Simple classifications
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <h4 className="font-semibold">Vision Tasks</h4>
              <div className="space-y-2">
                <div className="p-2 bg-orange-100 rounded text-sm">
                  <strong>GPT-4V</strong><br/>
                  Document analysis
                </div>
                <div className="p-2 bg-red-100 rounded text-sm">
                  <strong>CLIP</strong><br/>
                  Image understanding
                </div>
                <div className="p-2 bg-yellow-100 rounded text-sm">
                  <strong>OCR Engine</strong><br/>
                  Text extraction
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <h4 className="font-semibold">Specialized</h4>
              <div className="space-y-2">
                <div className="p-2 bg-cyan-100 rounded text-sm">
                  <strong>Medical NER</strong><br/>
                  Entity recognition
                </div>
                <div className="p-2 bg-pink-100 rounded text-sm">
                  <strong>Sentiment Analysis</strong><br/>
                  Emotional state detection
                </div>
                <div className="p-2 bg-indigo-100 rounded text-sm">
                  <strong>Classification</strong><br/>
                  Category assignment
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    ),
    animation: 'slide'
  },
  {
    id: 12,
    title: "Template Configuration Deep Dive",
    subtitle: "Customizable Templates for Different Use Cases",
    content: (
      <div className="h-full overflow-y-auto space-y-6 animate-fade-in">
        <Card className="p-6">
          <h3 className="text-xl font-bold mb-4 text-primary">Template Library</h3>
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="font-semibold">Pre-built Templates</h4>
              <div className="space-y-3">
                <div className="p-4 border rounded-lg">
                  <h5 className="font-medium">📋 Intake Assessment</h5>
                  <p className="text-sm text-muted-foreground">Patient onboarding workflow</p>
                  <div className="mt-2 text-xs">
                    <Badge variant="secondary">Pre-configured</Badge>
                  </div>
                </div>
                <div className="p-4 border rounded-lg">
                  <h5 className="font-medium">🩺 Treatment Planning</h5>
                  <p className="text-sm text-muted-foreground">Personalized care plan generation</p>
                  <div className="mt-2 text-xs">
                    <Badge variant="secondary">Customizable</Badge>
                  </div>
                </div>
                <div className="p-4 border rounded-lg">
                  <h5 className="font-medium">📊 Progress Monitoring</h5>
                  <p className="text-sm text-muted-foreground">Outcome tracking and reporting</p>
                  <div className="mt-2 text-xs">
                    <Badge variant="secondary">Adaptive</Badge>
                  </div>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <h4 className="font-semibold">Configuration Options</h4>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span>Custom fields and forms</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span>Workflow automation rules</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span>Integration endpoints</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span>Notification preferences</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span>Security and compliance settings</span>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    ),
    animation: 'zoom'
  },
  {
    id: 13,
    title: "Actions, Tasks & AI Autosuggest",
    subtitle: "Intelligent Automation and Recommendations",
    content: (
      <div className="h-full overflow-y-auto space-y-6 animate-fade-in">
        <Card className="p-6">
          <h3 className="text-xl font-bold mb-4 text-primary">AI-Powered Automation</h3>
          <div className="grid grid-cols-3 gap-6">
            <div className="space-y-4">
              <h4 className="font-semibold">Actions</h4>
              <div className="space-y-2">
                <div className="p-3 bg-blue-50 rounded-lg">
                  <div className="font-medium">🔄 Auto-routing</div>
                  <div className="text-sm text-muted-foreground">Smart case assignment</div>
                </div>
                <div className="p-3 bg-green-50 rounded-lg">
                  <div className="font-medium">📧 Notifications</div>
                  <div className="text-sm text-muted-foreground">Contextual alerts</div>
                </div>
                <div className="p-3 bg-purple-50 rounded-lg">
                  <div className="font-medium">📋 Form completion</div>
                  <div className="text-sm text-muted-foreground">AI-assisted data entry</div>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <h4 className="font-semibold">Tasks</h4>
              <div className="space-y-2">
                <div className="p-3 bg-orange-50 rounded-lg">
                  <div className="font-medium">⏰ Scheduling</div>
                  <div className="text-sm text-muted-foreground">Appointment optimization</div>
                </div>
                <div className="p-3 bg-red-50 rounded-lg">
                  <div className="font-medium">📊 Reporting</div>
                  <div className="text-sm text-muted-foreground">Automated insights</div>
                </div>
                <div className="p-3 bg-yellow-50 rounded-lg">
                  <div className="font-medium">🔍 Follow-ups</div>
                  <div className="text-sm text-muted-foreground">Proactive outreach</div>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <h4 className="font-semibold">AI Autosuggest</h4>
              <div className="space-y-2">
                <div className="p-3 bg-cyan-50 rounded-lg">
                  <div className="font-medium">💡 Treatment plans</div>
                  <div className="text-sm text-muted-foreground">Evidence-based recommendations</div>
                </div>
                <div className="p-3 bg-pink-50 rounded-lg">
                  <div className="font-medium">🎯 Interventions</div>
                  <div className="text-sm text-muted-foreground">Personalized strategies</div>
                </div>
                <div className="p-3 bg-indigo-50 rounded-lg">
                  <div className="font-medium">📈 Outcomes</div>
                  <div className="text-sm text-muted-foreground">Predictive analytics</div>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    ),
    animation: 'fade'
  },
  {
    id: 14,
    title: "Template Configuration & Channel Deployment",
    subtitle: "Multi-Platform Template Management",
    content: (
      <div className="h-full overflow-y-auto space-y-6 animate-fade-in">
        <Card className="p-6">
          <h3 className="text-xl font-bold mb-4 text-primary">Deployment Configuration</h3>
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="font-semibold">Channel-Specific Adaptations</h4>
              <div className="space-y-3">
                <div className="p-4 border rounded-lg">
                  <h5 className="font-medium flex items-center gap-2">
                    <span className="text-xl">🌐</span>
                    Web Platform
                  </h5>
                  <ul className="text-sm text-muted-foreground mt-2 space-y-1">
                    <li>• Rich interactive forms</li>
                    <li>• Advanced data visualization</li>
                    <li>• Multi-tab workflows</li>
                  </ul>
                </div>
                <div className="p-4 border rounded-lg">
                  <h5 className="font-medium flex items-center gap-2">
                    <span className="text-xl">📱</span>
                    Mobile App
                  </h5>
                  <ul className="text-sm text-muted-foreground mt-2 space-y-1">
                    <li>• Touch-optimized interfaces</li>
                    <li>• Offline capabilities</li>
                    <li>• Push notification integration</li>
                  </ul>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <h4 className="font-semibold">Template Synchronization</h4>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span>Real-time sync across channels</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span>Version control and rollback</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span>A/B testing capabilities</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span>Performance monitoring</span>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    ),
    animation: 'slide'
  },
  {
    id: 15,
    title: "Complete Implementation Results",
    subtitle: "Real-World Performance Metrics and Success Stories",
    content: (
      <div className="h-full overflow-y-auto space-y-6 animate-fade-in">
        <div className="grid grid-cols-3 gap-6">
          <Card className="p-6 text-center">
            <div className="text-4xl font-bold text-green-600 mb-2">95%</div>
            <div className="text-sm text-muted-foreground">Implementation Success Rate</div>
          </Card>
          <Card className="p-6 text-center">
            <div className="text-4xl font-bold text-blue-600 mb-2">15min</div>
            <div className="text-sm text-muted-foreground">Average Setup Time</div>
          </Card>
          <Card className="p-6 text-center">
            <div className="text-4xl font-bold text-purple-600 mb-2">400%</div>
            <div className="text-sm text-muted-foreground">Average ROI</div>
          </Card>
        </div>
        
        <Card className="p-6">
          <h3 className="text-xl font-bold mb-4 text-primary">Success Metrics</h3>
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="font-semibold">Operational Improvements</h4>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span>Patient wait times</span>
                  <span className="text-green-600 font-semibold">-60%</span>
                </div>
                <div className="flex justify-between">
                  <span>Administrative tasks</span>
                  <span className="text-green-600 font-semibold">-75%</span>
                </div>
                <div className="flex justify-between">
                  <span>Documentation accuracy</span>
                  <span className="text-green-600 font-semibold">+85%</span>
                </div>
                <div className="flex justify-between">
                  <span>Staff satisfaction</span>
                  <span className="text-green-600 font-semibold">+90%</span>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <h4 className="font-semibold">Patient Outcomes</h4>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span>Treatment adherence</span>
                  <span className="text-blue-600 font-semibold">+70%</span>
                </div>
                <div className="flex justify-between">
                  <span>Patient satisfaction</span>
                  <span className="text-blue-600 font-semibold">+80%</span>
                </div>
                <div className="flex justify-between">
                  <span>Recovery rates</span>
                  <span className="text-blue-600 font-semibold">+45%</span>
                </div>
                <div className="flex justify-between">
                  <span>Readmission rates</span>
                  <span className="text-green-600 font-semibold">-55%</span>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    ),
    animation: 'zoom'
  },
  {
    id: 16,
    title: "Advanced AI Models, Vision Systems & Studio Labeling",
    subtitle: "Cutting-Edge AI Capabilities",
    content: (
      <div className="h-full overflow-y-auto space-y-6 animate-fade-in">
        <Card className="p-6">
          <h3 className="text-xl font-bold mb-4 text-primary">Advanced AI Capabilities</h3>
          <div className="grid grid-cols-3 gap-6">
            <div className="space-y-4">
              <h4 className="font-semibold">Vision Systems</h4>
              <div className="space-y-3">
                <div className="p-3 bg-blue-50 rounded-lg">
                  <div className="font-medium">🔍 Medical Imaging</div>
                  <div className="text-sm text-muted-foreground">X-ray, MRI analysis</div>
                </div>
                <div className="p-3 bg-green-50 rounded-lg">
                  <div className="font-medium">📄 Document OCR</div>
                  <div className="text-sm text-muted-foreground">Form digitization</div>
                </div>
                <div className="p-3 bg-purple-50 rounded-lg">
                  <div className="font-medium">👤 Facial Recognition</div>
                  <div className="text-sm text-muted-foreground">Patient identification</div>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <h4 className="font-semibold">Advanced Models</h4>
              <div className="space-y-3">
                <div className="p-3 bg-orange-50 rounded-lg">
                  <div className="font-medium">🧠 GPT-4 Turbo</div>
                  <div className="text-sm text-muted-foreground">Complex reasoning</div>
                </div>
                <div className="p-3 bg-red-50 rounded-lg">
                  <div className="font-medium">⚡ Claude 3.5</div>
                  <div className="text-sm text-muted-foreground">Fast inference</div>
                </div>
                <div className="p-3 bg-yellow-50 rounded-lg">
                  <div className="font-medium">🎯 Specialized Models</div>
                  <div className="text-sm text-muted-foreground">Domain-specific</div>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <h4 className="font-semibold">Studio Labeling</h4>
              <div className="space-y-3">
                <div className="p-3 bg-cyan-50 rounded-lg">
                  <div className="font-medium">🏷️ Auto-labeling</div>
                  <div className="text-sm text-muted-foreground">ML-powered tagging</div>
                </div>
                <div className="p-3 bg-pink-50 rounded-lg">
                  <div className="font-medium">✅ Quality Control</div>
                  <div className="text-sm text-muted-foreground">Human-in-loop validation</div>
                </div>
                <div className="p-3 bg-indigo-50 rounded-lg">
                  <div className="font-medium">📊 Analytics</div>
                  <div className="text-sm text-muted-foreground">Performance tracking</div>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    ),
    animation: 'fade'
  },
  {
    id: 17,
    title: "Real-Time Performance Analytics & Monitoring",
    subtitle: "Comprehensive System Monitoring and Insights",
    content: (
      <div className="h-full overflow-y-auto space-y-6 animate-fade-in">
        <Card className="p-6">
          <h3 className="text-xl font-bold mb-4 text-primary">Performance Dashboard</h3>
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="font-semibold">Real-Time Metrics</h4>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                  <span>System Uptime</span>
                  <span className="text-green-600 font-bold">99.9%</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                  <span>Response Time</span>
                  <span className="text-blue-600 font-bold">1.2s</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                  <span>Active Users</span>
                  <span className="text-purple-600 font-bold">2,847</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg">
                  <span>Tasks Processed</span>
                  <span className="text-orange-600 font-bold">15,693</span>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <h4 className="font-semibold">AI Model Performance</h4>
              <div className="space-y-3">
                <div className="p-3 border rounded-lg">
                  <div className="flex justify-between mb-1">
                    <span className="font-medium">Accuracy Rate</span>
                    <span className="text-green-600">96.8%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-green-600 h-2 rounded-full" style={{width: '96.8%'}}></div>
                  </div>
                </div>
                <div className="p-3 border rounded-lg">
                  <div className="flex justify-between mb-1">
                    <span className="font-medium">Processing Speed</span>
                    <span className="text-blue-600">94.2%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full" style={{width: '94.2%'}}></div>
                  </div>
                </div>
                <div className="p-3 border rounded-lg">
                  <div className="flex justify-between mb-1">
                    <span className="font-medium">Error Rate</span>
                    <span className="text-green-600">0.3%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-green-600 h-2 rounded-full" style={{width: '99.7%'}}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    ),
    animation: 'slide'
  },
  {
    id: 18,
    title: "Scalability & Enterprise Integration",
    subtitle: "Enterprise-Grade Architecture and Scaling Solutions",
    content: (
      <div className="h-full overflow-y-auto space-y-6 animate-fade-in">
        <Card className="p-6">
          <h3 className="text-xl font-bold mb-4 text-primary">Enterprise Architecture</h3>
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="font-semibold">Scalability Features</h4>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span>Auto-scaling infrastructure</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span>Load balancing</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span>Microservices architecture</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span>Edge computing support</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span>Multi-region deployment</span>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <h4 className="font-semibold">Enterprise Integrations</h4>
              <div className="space-y-3">
                <div className="p-3 bg-blue-50 rounded-lg">
                  <div className="font-medium">🏥 EHR Systems</div>
                  <div className="text-sm text-muted-foreground">Epic, Cerner, Allscripts</div>
                </div>
                <div className="p-3 bg-green-50 rounded-lg">
                  <div className="font-medium">🔐 SSO Integration</div>
                  <div className="text-sm text-muted-foreground">SAML, OAuth 2.0</div>
                </div>
                <div className="p-3 bg-purple-50 rounded-lg">
                  <div className="font-medium">📊 BI Platforms</div>
                  <div className="text-sm text-muted-foreground">Tableau, Power BI</div>
                </div>
                <div className="p-3 bg-orange-50 rounded-lg">
                  <div className="font-medium">☁️ Cloud Platforms</div>
                  <div className="text-sm text-muted-foreground">AWS, Azure, GCP</div>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    ),
    animation: 'zoom'
  },
  {
    id: 19,
    title: "ROI & Business Impact Analysis",
    subtitle: "Quantified Business Value and Return on Investment",
    content: (
      <div className="h-full overflow-y-auto space-y-6 animate-fade-in">
        <div className="grid grid-cols-4 gap-4 mb-6">
          <Card className="p-4 text-center">
            <div className="text-3xl font-bold text-green-600">400%</div>
            <div className="text-sm text-muted-foreground">Average ROI</div>
          </Card>
          <Card className="p-4 text-center">
            <div className="text-3xl font-bold text-blue-600">$2.4M</div>
            <div className="text-sm text-muted-foreground">Annual Savings</div>
          </Card>
          <Card className="p-4 text-center">
            <div className="text-3xl font-bold text-purple-600">18</div>
            <div className="text-sm text-muted-foreground">Months Payback</div>
          </Card>
          <Card className="p-4 text-center">
            <div className="text-3xl font-bold text-orange-600">75%</div>
            <div className="text-sm text-muted-foreground">Cost Reduction</div>
          </Card>
        </div>
        
        <Card className="p-6">
          <h3 className="text-xl font-bold mb-4 text-primary">Business Impact Analysis</h3>
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="font-semibold">Cost Savings</h4>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span>Reduced administrative overhead</span>
                  <span className="text-green-600 font-semibold">$850K/year</span>
                </div>
                <div className="flex justify-between">
                  <span>Improved resource utilization</span>
                  <span className="text-green-600 font-semibold">$640K/year</span>
                </div>
                <div className="flex justify-between">
                  <span>Decreased readmission costs</span>
                  <span className="text-green-600 font-semibold">$520K/year</span>
                </div>
                <div className="flex justify-between">
                  <span>Automation of routine tasks</span>
                  <span className="text-green-600 font-semibold">$390K/year</span>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <h4 className="font-semibold">Revenue Enhancement</h4>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span>Increased patient throughput</span>
                  <span className="text-blue-600 font-semibold">$1.2M/year</span>
                </div>
                <div className="flex justify-between">
                  <span>Better insurance reimbursements</span>
                  <span className="text-blue-600 font-semibold">$780K/year</span>
                </div>
                <div className="flex justify-between">
                  <span>Improved treatment outcomes</span>
                  <span className="text-blue-600 font-semibold">$560K/year</span>
                </div>
                <div className="flex justify-between">
                  <span>New service offerings</span>
                  <span className="text-blue-600 font-semibold">$320K/year</span>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    ),
    animation: 'fade'
  },
  {
    id: 20,
    title: "Implementation Roadmap & Next Steps",
    subtitle: "Strategic Planning for AI Implementation",
    content: (
      <div className="h-full overflow-y-auto space-y-6 animate-fade-in">
        <Card className="p-6">
          <h3 className="text-xl font-bold mb-4 text-primary">Implementation Timeline</h3>
          <div className="space-y-6">
            <div className="grid grid-cols-4 gap-4">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-white font-bold">1</span>
                </div>
                <h4 className="font-semibold">Week 1-2</h4>
                <p className="text-sm text-muted-foreground">Initial assessment and planning</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-white font-bold">2</span>
                </div>
                <h4 className="font-semibold">Week 3-6</h4>
                <p className="text-sm text-muted-foreground">System setup and configuration</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-white font-bold">3</span>
                </div>
                <h4 className="font-semibold">Week 7-10</h4>
                <p className="text-sm text-muted-foreground">Testing and staff training</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-white font-bold">4</span>
                </div>
                <h4 className="font-semibold">Week 11-12</h4>
                <p className="text-sm text-muted-foreground">Full deployment and monitoring</p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-6 mt-8">
              <div className="space-y-3">
                <h4 className="font-semibold">Pre-Implementation Checklist</h4>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-green-500 rounded-sm flex items-center justify-center">
                      <span className="text-white text-xs">✓</span>
                    </div>
                    <span className="text-sm">Stakeholder alignment</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-green-500 rounded-sm flex items-center justify-center">
                      <span className="text-white text-xs">✓</span>
                    </div>
                    <span className="text-sm">Technical requirements review</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-green-500 rounded-sm flex items-center justify-center">
                      <span className="text-white text-xs">✓</span>
                    </div>
                    <span className="text-sm">Security and compliance audit</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-green-500 rounded-sm flex items-center justify-center">
                      <span className="text-white text-xs">✓</span>
                    </div>
                    <span className="text-sm">Staff readiness assessment</span>
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                <h4 className="font-semibold">Success Metrics</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">User adoption rate</span>
                    <span className="text-sm font-semibold">Target: 95%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">System uptime</span>
                    <span className="text-sm font-semibold">Target: 99.9%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Time to value</span>
                    <span className="text-sm font-semibold">Target: 30 days</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">ROI achievement</span>
                    <span className="text-sm font-semibold">Target: 18 months</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    ),
    animation: 'slide'
  },
  {
    id: 21,
    title: "Contact & Support Information",
    subtitle: "Get Started with Your AI Implementation Today",
    content: (
      <div className="h-full overflow-y-auto space-y-8 animate-fade-in">
        <div className="text-center space-y-6">
          <div className="relative">
            <div className="w-32 h-32 mx-auto bg-gradient-to-br from-primary via-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-2xl">
              <div className="text-5xl">🚀</div>
            </div>
          </div>
          <div className="space-y-4">
            <h3 className="text-2xl font-bold text-primary">
              Ready to Transform Your Treatment Center?
            </h3>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Join hundreds of treatment centers already leveraging AI to improve patient outcomes, 
              reduce costs, and streamline operations.
            </p>
          </div>
        </div>
        
        <div className="grid grid-cols-3 gap-6">
          <Card className="p-6 text-center">
            <div className="text-3xl mb-4">📞</div>
            <h4 className="font-bold mb-2">Sales & Demo</h4>
            <p className="text-sm text-muted-foreground mb-3">Schedule a personalized demo</p>
            <Button className="w-full">Book Demo</Button>
          </Card>
          <Card className="p-6 text-center">
            <div className="text-3xl mb-4">💬</div>
            <h4 className="font-bold mb-2">Technical Support</h4>
            <p className="text-sm text-muted-foreground mb-3">24/7 implementation assistance</p>
            <Button variant="outline" className="w-full">Contact Support</Button>
          </Card>
          <Card className="p-6 text-center">
            <div className="text-3xl mb-4">📚</div>
            <h4 className="font-bold mb-2">Documentation</h4>
            <p className="text-sm text-muted-foreground mb-3">Comprehensive guides and APIs</p>
            <Button variant="outline" className="w-full">View Docs</Button>
          </Card>
        </div>
        
        <Card className="p-6">
          <h3 className="text-xl font-bold mb-4 text-primary text-center">Contact Information</h3>
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="font-semibold">Business Development</h4>
              <div className="space-y-2 text-sm">
                <div>📧 sales@treatmentcenter-ai.com</div>
                <div>📞 1-800-AI-TREATMENT</div>
                <div>🌐 www.treatmentcenter-ai.com</div>
              </div>
            </div>
            <div className="space-y-4">
              <h4 className="font-semibold">Technical Support</h4>
              <div className="space-y-2 text-sm">
                <div>📧 support@treatmentcenter-ai.com</div>
                <div>📞 1-800-AI-SUPPORT</div>
                <div>💬 Live chat available 24/7</div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    ),
    animation: 'zoom'
  }
];

export const AgenticAIPresentation: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoplay, setIsAutoplay] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const { exportHTML, exportPDF, exportPPT } = usePresentationExporter();

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isAutoplay) {
      interval = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % slides.length);
      }, 8000);
    }
    return () => clearInterval(interval);
  }, [isAutoplay]);

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const resetPresentation = () => {
    setCurrentSlide(0);
    setIsAutoplay(false);
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const handleExport = async (format: 'html' | 'pdf' | 'ppt') => {
    try {
      switch (format) {
        case 'html':
          await exportHTML(slides, goToSlide);
          break;
        case 'pdf':
          await exportPDF(slides, goToSlide);
          break;
        case 'ppt':
          await exportPPT(slides, goToSlide);
          break;
      }
    } catch (error) {
      console.error(`Error exporting ${format}:`, error);
    }
  };

  const currentSlideData = slides[currentSlide];

  return (
    <div className={cn(
      "relative bg-background",
      isFullscreen ? "fixed inset-0 z-50" : "w-full max-w-6xl mx-auto"
    )}>
      {/* Header Controls */}
      <div className="flex justify-between items-center p-4 border-b bg-card/50 backdrop-blur-sm">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-bold text-primary">
            Treatment Center AI Implementation
          </h1>
          <Badge variant="secondary">
            {currentSlide + 1} of {slides.length}
          </Badge>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsAutoplay(!isAutoplay)}
            className="flex items-center gap-2"
          >
            {isAutoplay ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            {isAutoplay ? 'Pause' : 'Play'}
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={resetPresentation}
            className="flex items-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            Reset
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={toggleFullscreen}
            className="flex items-center gap-2"
          >
            <Maximize2 className="w-4 h-4" />
            {isFullscreen ? 'Exit' : 'Fullscreen'}
          </Button>
          
          <div className="flex items-center gap-1 ml-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleExport('html')}
              title="Export as HTML"
            >
              <FileText className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleExport('pdf')}
              title="Export as PDF"
            >
              <Download className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleExport('ppt')}
              title="Export as PowerPoint"
            >
              <Presentation className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Main Slide Area */}
      <div className={cn(
        "relative bg-gradient-to-br from-background via-muted/20 to-background",
        isFullscreen ? "h-[calc(100vh-120px)]" : "h-[600px]"
      )}>
        <div 
          className="w-full h-full p-8"
          data-slide-content
          data-slide-id={currentSlide}
          key={currentSlide}
        >
          {/* Slide Header */}
          <div className="text-center mb-8 animate-fade-in">
            <h2 className="text-3xl font-bold text-primary mb-2">
              {currentSlideData.title}
            </h2>
            {currentSlideData.subtitle && (
              <p className="text-lg text-muted-foreground">
                {currentSlideData.subtitle}
              </p>
            )}
          </div>
          
          {/* Slide Content */}
          <div className={cn(
            "h-[420px] overflow-hidden", // Fixed height instead of h-full to prevent overflow
            currentSlideData.animation === 'fade' && "animate-fade-in",
            currentSlideData.animation === 'slide' && "animate-slide-in-right",
            currentSlideData.animation === 'zoom' && "animate-scale-in",
            currentSlideData.animation === 'flip' && "animate-scale-in"
          )}>
            {currentSlideData.content}
          </div>
        </div>
      </div>

      {/* Navigation Controls */}
      <div className="flex justify-between items-center p-4 border-t bg-card/50 backdrop-blur-sm">
        <Button
          variant="outline"
          onClick={prevSlide}
          disabled={currentSlide === 0}
          className="flex items-center gap-2"
        >
          <ChevronLeft className="w-4 h-4" />
          Previous
        </Button>
        
        {/* Slide Indicators */}
        <div className="flex gap-2 overflow-x-auto max-w-md">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={cn(
                "w-3 h-3 rounded-full transition-all duration-200 flex-shrink-0",
                index === currentSlide
                  ? "bg-primary scale-125"
                  : "bg-muted-foreground/30 hover:bg-muted-foreground/50"
              )}
              title={`Slide ${index + 1}`}
            />
          ))}
        </div>
        
        <Button
          variant="outline"
          onClick={nextSlide}
          disabled={currentSlide === slides.length - 1}
          className="flex items-center gap-2"
        >
          Next
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};