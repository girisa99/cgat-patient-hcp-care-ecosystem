import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight, Play, Pause, RotateCcw, Maximize2, Download, FileText, Presentation } from 'lucide-react';
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
    title: "Treatment Center AI Implementation Guide",
    subtitle: "Complete 16-Slide AI Automation Platform for Healthcare Onboarding",
    content: (
      <div className="h-full overflow-y-auto space-y-8 animate-fade-in">
        {/* Header Section */}
        <div className="text-center space-y-6">
          <div className="w-32 h-32 mx-auto bg-gradient-to-br from-primary to-primary/60 rounded-full flex items-center justify-center animate-pulse">
            <div className="text-4xl">🤖</div>
          </div>
          <div className="space-y-4">
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Comprehensive 16-slide implementation guide for treatment centers featuring advanced AI agent platform 
              with autonomous decision-making, intelligent automation, and seamless integration to transform 
              healthcare onboarding processes
            </p>
          </div>
        </div>

        {/* What is Agentic AI Section */}
        <div className="grid grid-cols-2 gap-8 mb-8">
          <Card className="p-6 bg-gradient-to-br from-blue-500/15 to-blue-500/5 border-l-4 border-blue-500">
            <h3 className="text-xl font-bold text-blue-600 mb-4 flex items-center gap-2">
              <span className="text-2xl">🧠</span> What is Agentic AI?
            </h3>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Agentic AI refers to autonomous AI systems that can make independent decisions, 
                take actions, and adapt to changing environments without constant human oversight.
              </p>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span className="text-sm">Autonomous decision-making capabilities</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span className="text-sm">Goal-oriented task execution</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span className="text-sm">Context-aware reasoning</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span className="text-sm">Self-improving through feedback</span>
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-green-500/15 to-green-500/5 border-l-4 border-green-500">
            <h3 className="text-xl font-bold text-green-600 mb-4 flex items-center gap-2">
              <span className="text-2xl">⚡</span> Intelligent Automation
            </h3>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Our platform combines multiple AI technologies to create sophisticated automation 
                that adapts, learns, and optimizes healthcare workflows.
              </p>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-sm">Workflow orchestration & optimization</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-sm">Real-time decision automation</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-sm">Multi-system integration</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-sm">Continuous learning & improvement</span>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Core Technologies */}
        <div className="space-y-6">
          <h3 className="text-2xl font-bold text-center text-primary">Core Technologies & Capabilities</h3>
          <div className="grid grid-cols-4 gap-6">
            <Card className="p-6 bg-gradient-to-br from-purple-500/20 to-purple-500/5 border-2 border-purple-500/30 hover:border-purple-500/50 transition-all duration-300 hover:scale-105">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-purple-700 rounded-full flex items-center justify-center mx-auto mb-3 animate-pulse">
                  <span className="text-white text-2xl">🔗</span>
                </div>
                <h4 className="font-bold text-purple-700 text-base mb-2">MCP Integration</h4>
                <p className="text-sm text-muted-foreground mb-3">Model Context Protocol</p>
                <div className="space-y-1 text-xs">
                  <div>• Cross-model communication</div>
                  <div>• Context sharing</div>
                  <div>• Session management</div>
                </div>
              </div>
            </Card>
            
            <Card className="p-6 bg-gradient-to-br from-orange-500/20 to-orange-500/5 border-2 border-orange-500/30 hover:border-orange-500/50 transition-all duration-300 hover:scale-105">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-orange-600 to-orange-700 rounded-full flex items-center justify-center mx-auto mb-3 animate-pulse">
                  <span className="text-white text-2xl">🧠</span>
                </div>
                <h4 className="font-bold text-orange-700 text-base mb-2">RAG Knowledge Base</h4>
                <p className="text-sm text-muted-foreground mb-3">Retrieval Augmented Generation</p>
                <div className="space-y-1 text-xs">
                  <div>• Vector embeddings</div>
                  <div>• Semantic search</div>
                  <div>• Real-time retrieval</div>
                </div>
              </div>
            </Card>
            
            <Card className="p-6 bg-gradient-to-br from-red-500/20 to-red-500/5 border-2 border-red-500/30 hover:border-red-500/50 transition-all duration-300 hover:scale-105">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-red-600 to-red-700 rounded-full flex items-center justify-center mx-auto mb-3 animate-pulse">
                  <span className="text-white text-2xl">🚀</span>
                </div>
                <h4 className="font-bold text-red-700 text-base mb-2">Small Language Models</h4>
                <p className="text-sm text-muted-foreground mb-3">Optimized Performance</p>
                <div className="space-y-1 text-xs">
                  <div>• Fast response times</div>
                  <div>• Cost-effective</div>
                  <div>• Domain-specific</div>
                </div>
              </div>
            </Card>
            
            <Card className="p-6 bg-gradient-to-br from-teal-500/20 to-teal-500/5 border-2 border-teal-500/30 hover:border-teal-500/50 transition-all duration-300 hover:scale-105">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-teal-600 to-teal-700 rounded-full flex items-center justify-center mx-auto mb-3 animate-pulse">
                  <span className="text-white text-2xl">📱</span>
                </div>
                <h4 className="font-bold text-teal-700 text-base mb-2">Multi-Channel Deploy</h4>
                <p className="text-sm text-muted-foreground mb-3">Universal Accessibility</p>
                <div className="space-y-1 text-xs">
                  <div>• Web & mobile</div>
                  <div>• Chat platforms</div>
                  <div>• Voice & SMS</div>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Platform Benefits */}
        <div className="grid grid-cols-3 gap-6">
          <Card className="p-6 bg-gradient-to-br from-indigo-500/15 to-indigo-500/5 border-l-4 border-indigo-500">
            <h4 className="font-bold text-indigo-600 mb-4 flex items-center gap-2">
              <span className="text-xl">🎯</span> Healthcare-Focused
            </h4>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-indigo-500 rounded-full"></div>
                <span className="text-sm">Patient onboarding optimization</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-indigo-500 rounded-full"></div>
                <span className="text-sm">HIPAA-compliant processes</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-indigo-500 rounded-full"></div>
                <span className="text-sm">EHR system integration</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-indigo-500 rounded-full"></div>
                <span className="text-sm">Regulatory compliance automation</span>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-emerald-500/15 to-emerald-500/5 border-l-4 border-emerald-500">
            <h4 className="font-bold text-emerald-600 mb-4 flex items-center gap-2">
              <span className="text-xl">⚡</span> Advanced Automation
            </h4>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
                <span className="text-sm">Intelligent task routing</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
                <span className="text-sm">Predictive workflow optimization</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
                <span className="text-sm">Real-time decision making</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
                <span className="text-sm">Exception handling & escalation</span>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-rose-500/15 to-rose-500/5 border-l-4 border-rose-500">
            <h4 className="font-bold text-rose-600 mb-4 flex items-center gap-2">
              <span className="text-xl">🛡️</span> Enterprise Ready
            </h4>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-rose-500 rounded-full"></div>
                <span className="text-sm">Scalable architecture</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-rose-500 rounded-full"></div>
                <span className="text-sm">Security & compliance</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-rose-500 rounded-full"></div>
                <span className="text-sm">Performance monitoring</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-rose-500 rounded-full"></div>
                <span className="text-sm">24/7 reliability</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    ),
    animation: 'fade'
  },
  {
    id: 2,
    title: "Complete AI Agent Architecture",
    subtitle: "Comprehensive System Design & Interactive Data Flow",
    content: (
      <div className="h-full overflow-y-auto space-y-6 animate-fade-in">
        {/* Clear Component Overview Cards */}
        <div className="grid grid-cols-4 gap-6 mb-6">
          <Card className="p-6 bg-gradient-to-br from-blue-500/20 to-blue-500/5 border-2 border-blue-500/30 hover:border-blue-500/50 transition-all duration-300 hover:scale-105">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-blue-700 rounded-full flex items-center justify-center mx-auto mb-3 animate-pulse">
                <span className="text-white text-2xl">🎨</span>
              </div>
              <h4 className="font-bold text-blue-700 text-base mb-2">Frontend Layer</h4>
              <p className="text-sm text-muted-foreground">Visual Agent Builder</p>
              <div className="mt-2">
                <Badge variant="outline" className="text-xs">React + TypeScript</Badge>
              </div>
            </div>
          </Card>
          
          <Card className="p-6 bg-gradient-to-br from-green-500/20 to-green-500/5 border-2 border-green-500/30 hover:border-green-500/50 transition-all duration-300 hover:scale-105">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-green-600 to-green-700 rounded-full flex items-center justify-center mx-auto mb-3 animate-pulse">
                <span className="text-white text-2xl">🔗</span>
              </div>
              <h4 className="font-bold text-green-700 text-base mb-2">Protocol Layer</h4>
              <p className="text-sm text-muted-foreground">MCP Integration Hub</p>
              <div className="mt-2">
                <Badge variant="outline" className="text-xs">Model Context Protocol</Badge>
              </div>
            </div>
          </Card>
          
          <Card className="p-6 bg-gradient-to-br from-purple-500/20 to-purple-500/5 border-2 border-purple-500/30 hover:border-purple-500/50 transition-all duration-300 hover:scale-105">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-purple-700 rounded-full flex items-center justify-center mx-auto mb-3 animate-pulse">
                <span className="text-white text-2xl">🧠</span>
              </div>
              <h4 className="font-bold text-purple-700 text-base mb-2">AI Processing</h4>
              <p className="text-sm text-muted-foreground">Small LLMs + RAG</p>
              <div className="mt-2">
                <Badge variant="outline" className="text-xs">Vector Intelligence</Badge>
              </div>
            </div>
          </Card>
          
          <Card className="p-6 bg-gradient-to-br from-orange-500/20 to-orange-500/5 border-2 border-orange-500/30 hover:border-orange-500/50 transition-all duration-300 hover:scale-105">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-orange-600 to-orange-700 rounded-full flex items-center justify-center mx-auto mb-3 animate-pulse">
                <span className="text-white text-2xl">💾</span>
              </div>
              <h4 className="font-bold text-orange-700 text-base mb-2">Data Layer</h4>
              <p className="text-sm text-muted-foreground">Supabase + Vector DB</p>
              <div className="mt-2">
                <Badge variant="outline" className="text-xs">Real-time Sync</Badge>
              </div>
            </div>
          </Card>
        </div>

        {/* Detailed System Components & Data Flow */}
        <div className="grid grid-cols-2 gap-8">
          <div className="space-y-4">
            <h3 className="text-2xl font-bold text-primary mb-4">System Components</h3>
            
            <Card className="p-5 bg-gradient-to-r from-blue-500/15 to-blue-500/5 border-l-4 border-blue-500 hover:from-blue-500/20 hover:to-blue-500/10 transition-all duration-300">
              <h4 className="font-bold text-blue-600 mb-3 flex items-center gap-2">
                <span className="text-xl">🎨</span> Agent Builder Interface
              </h4>
              <p className="text-sm text-muted-foreground mb-3">
                Visual drag-and-drop interface for creating AI agents without coding
              </p>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  Template selection
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  Real-time preview
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  Workflow designer
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  Component library
                </div>
              </div>
            </Card>
            
            <Card className="p-5 bg-gradient-to-r from-green-500/15 to-green-500/5 border-l-4 border-green-500 hover:from-green-500/20 hover:to-green-500/10 transition-all duration-300">
              <h4 className="font-bold text-green-600 mb-3 flex items-center gap-2">
                <span className="text-xl">🔗</span> MCP Protocol Engine
              </h4>
              <p className="text-sm text-muted-foreground mb-3">
                Model Context Protocol handles communication between AI components
              </p>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  Context sharing
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  Session management
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  Real-time sync
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  Multi-model coordination
                </div>
              </div>
            </Card>
          </div>
          
          <div className="space-y-4">
            <h3 className="text-2xl font-bold text-secondary mb-4">Interactive Data Flow</h3>
            
            <Card className="p-5 bg-gradient-to-r from-purple-500/15 to-purple-500/5 border-l-4 border-purple-500 hover:from-purple-500/20 hover:to-purple-500/10 transition-all duration-300">
              <h4 className="font-bold text-purple-600 mb-3 flex items-center gap-2">
                <span className="text-xl">🧠</span> Knowledge Processing
              </h4>
              <p className="text-sm text-muted-foreground mb-3">
                RAG system with vector database for intelligent knowledge retrieval
              </p>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  Document ingestion
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  Vector embeddings
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  Semantic search
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  Context responses
                </div>
              </div>
            </Card>
            
            <Card className="p-5 bg-gradient-to-r from-orange-500/15 to-orange-500/5 border-l-4 border-orange-500 hover:from-orange-500/20 hover:to-orange-500/10 transition-all duration-300">
              <h4 className="font-bold text-orange-600 mb-3 flex items-center gap-2">
                <span className="text-xl">⚡</span> Processing Pipeline
              </h4>
              <p className="text-sm text-muted-foreground mb-3">
                End-to-end data processing from user input to intelligent response
              </p>
              <div className="space-y-2 text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 bg-orange-500 text-white rounded-full flex items-center justify-center text-xs">1</span>
                  <span>User input captured via multiple channels</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 bg-orange-500 text-white rounded-full flex items-center justify-center text-xs">2</span>
                  <span>MCP protocol routes to appropriate AI model</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 bg-orange-500 text-white rounded-full flex items-center justify-center text-xs">3</span>
                  <span>RAG system retrieves relevant context</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 bg-orange-500 text-white rounded-full flex items-center justify-center text-xs">4</span>
                  <span>Small LLM generates contextual response</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
        
        {/* Enhanced Visual Architecture Flow */}
        <div className="bg-gradient-to-r from-primary/10 via-secondary/10 to-accent/10 rounded-xl p-8 border-2 border-primary/20">
          <h3 className="text-2xl font-bold text-center mb-8">Interactive System Architecture Flow</h3>
          <div className="flex items-center justify-between">
            <div className="flex flex-col items-center space-y-3 hover:scale-110 transition-transform duration-300">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-blue-700 rounded-full flex items-center justify-center text-white text-2xl shadow-lg animate-pulse">
                👤
              </div>
              <p className="font-bold text-base">User Input</p>
              <p className="text-sm text-muted-foreground text-center">Web, Mobile,<br/>Voice, Chat</p>
              <Badge variant="secondary" className="text-xs">Multi-Channel</Badge>
            </div>
            
            <div className="flex items-center animate-pulse">
              <div className="w-12 h-1 bg-gradient-to-r from-blue-600 to-green-600"></div>
              <div className="text-blue-600 text-2xl">→</div>
            </div>
            
            <div className="flex flex-col items-center space-y-3 hover:scale-110 transition-transform duration-300">
              <div className="w-20 h-20 bg-gradient-to-br from-green-600 to-green-700 rounded-full flex items-center justify-center text-white text-2xl shadow-lg animate-pulse">
                🔗
              </div>
              <p className="font-bold text-base">MCP Router</p>
              <p className="text-sm text-muted-foreground text-center">Context Protocol<br/>Intelligence</p>
              <Badge variant="secondary" className="text-xs">Smart Routing</Badge>
            </div>
            
            <div className="flex items-center animate-pulse">
              <div className="w-12 h-1 bg-gradient-to-r from-green-600 to-purple-600"></div>
              <div className="text-green-600 text-2xl">→</div>
            </div>
            
            <div className="flex flex-col items-center space-y-3 hover:scale-110 transition-transform duration-300">
              <div className="w-20 h-20 bg-gradient-to-br from-purple-600 to-purple-700 rounded-full flex items-center justify-center text-white text-2xl shadow-lg animate-pulse">
                🧠
              </div>
              <p className="font-bold text-base">AI Processing</p>
              <p className="text-sm text-muted-foreground text-center">RAG + Small LLM<br/>Vector Search</p>
              <Badge variant="secondary" className="text-xs">Intelligent</Badge>
            </div>
            
            <div className="flex items-center animate-pulse">
              <div className="w-12 h-1 bg-gradient-to-r from-purple-600 to-orange-600"></div>
              <div className="text-purple-600 text-2xl">→</div>
            </div>
            
            <div className="flex flex-col items-center space-y-3 hover:scale-110 transition-transform duration-300">
              <div className="w-20 h-20 bg-gradient-to-br from-orange-600 to-orange-700 rounded-full flex items-center justify-center text-white text-2xl shadow-lg animate-pulse">
                📱
              </div>
              <p className="font-bold text-base">Smart Response</p>
              <p className="text-sm text-muted-foreground text-center">Optimized Output<br/>Channel Specific</p>
              <Badge variant="secondary" className="text-xs">Adaptive</Badge>
            </div>
          </div>
        </div>
      </div>
    ),
    animation: 'fade'
  },
  {
    id: 3,
    title: "Agent Creation Journey Overview",
    subtitle: "Complete Step-by-Step Guide to Building Your AI Agent",
    content: (
      <div className="text-center space-y-8 animate-fade-in">
        <div className="w-32 h-32 mx-auto bg-gradient-to-br from-primary to-primary/60 rounded-full flex items-center justify-center">
          <div className="text-4xl">🛠️</div>
        </div>
        <div className="space-y-6">
          <p className="text-xl text-muted-foreground">
            Follow our structured wizard to create powerful AI agents in 5 simple steps
          </p>
          <div className="grid grid-cols-5 gap-4 max-w-4xl mx-auto">
            <Card className="p-4 bg-gradient-to-br from-blue-500/20 to-blue-500/5 border-2 border-blue-500/30">
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-2">
                  <span className="text-white text-xl">🧙‍♂️</span>
                </div>
                <div className="text-sm font-semibold">Step 1</div>
                <div className="text-xs text-muted-foreground">Wizard Setup</div>
              </div>
            </Card>
            <Card className="p-4 bg-gradient-to-br from-purple-500/20 to-purple-500/5 border-2 border-purple-500/30">
              <div className="text-center">
                <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-2">
                  <span className="text-white text-xl">🎨</span>
                </div>
                <div className="text-sm font-semibold">Step 2</div>
                <div className="text-xs text-muted-foreground">Canvas Design</div>
              </div>
            </Card>
            <Card className="p-4 bg-gradient-to-br from-green-500/20 to-green-500/5 border-2 border-green-500/30">
              <div className="text-center">
                <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-2">
                  <span className="text-white text-xl">⚙️</span>
                </div>
                <div className="text-sm font-semibold">Step 3</div>
                <div className="text-xs text-muted-foreground">Actions Config</div>
              </div>
            </Card>
            <Card className="p-4 bg-gradient-to-br from-orange-500/20 to-orange-500/5 border-2 border-orange-500/30">
              <div className="text-center">
                <div className="w-12 h-12 bg-orange-600 rounded-full flex items-center justify-center mx-auto mb-2">
                  <span className="text-white text-xl">🤖</span>
                </div>
                <div className="text-sm font-semibold">Step 4</div>
                <div className="text-xs text-muted-foreground">AI Assignment</div>
              </div>
            </Card>
            <Card className="p-4 bg-gradient-to-br from-red-500/20 to-red-500/5 border-2 border-red-500/30">
              <div className="text-center">
                <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-2">
                  <span className="text-white text-xl">🚀</span>
                </div>
                <div className="text-sm font-semibold">Step 5</div>
                <div className="text-xs text-muted-foreground">Deployment</div>
              </div>
            </Card>
          </div>
          <div className="mt-8">
            <p className="text-lg font-semibold text-primary">Next: Detailed Step-by-Step Walkthrough</p>
            <p className="text-sm text-muted-foreground">Each step will be explained in detail across the following slides</p>
          </div>
        </div>
      </div>
    ),
    animation: 'fade'
  },
  {
    id: 4,
    title: "Step 1: Wizard Setup & Initial Configuration",
    subtitle: "Foundation Setup for Your AI Agent",
    content: (
      <div className="h-full overflow-y-auto space-y-6 animate-slide-in-right">
        <div className="text-center mb-6">
          <div className="w-24 h-24 bg-gradient-to-br from-blue-600 to-blue-700 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-white text-3xl">🧙‍♂️</span>
          </div>
          <h3 className="text-2xl font-bold text-blue-600">Wizard Setup</h3>
          <p className="text-muted-foreground">Configure your agent's basic parameters and settings</p>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <Card className="p-6 bg-gradient-to-br from-blue-500/15 to-blue-500/5 border-l-4 border-blue-500">
            <h4 className="font-bold text-blue-600 mb-4 flex items-center gap-2">
              <span className="text-xl">📝</span> Basic Configuration
            </h4>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span className="text-sm">Agent name and description</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span className="text-sm">Purpose and objectives</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span className="text-sm">Target audience definition</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span className="text-sm">Operating environment</span>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-purple-500/15 to-purple-500/5 border-l-4 border-purple-500">
            <h4 className="font-bold text-purple-600 mb-4 flex items-center gap-2">
              <span className="text-xl">🎯</span> Template Selection
            </h4>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                <span className="text-sm">Healthcare onboarding templates</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                <span className="text-sm">Patient management workflows</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                <span className="text-sm">Custom template creation</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                <span className="text-sm">Pre-built integrations</span>
              </div>
            </div>
          </Card>
        </div>

        <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-xl p-6 border-2 border-blue-500/20">
          <h4 className="text-xl font-bold mb-4 text-center">Setup Process Flow</h4>
          <div className="flex items-center justify-between">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">1</div>
              <p className="text-sm font-medium">Choose Template</p>
            </div>
            <div className="text-2xl text-blue-600">→</div>
            <div className="text-center space-y-2">
              <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">2</div>
              <p className="text-sm font-medium">Configure Settings</p>
            </div>
            <div className="text-2xl text-blue-600">→</div>
            <div className="text-center space-y-2">
              <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">3</div>
              <p className="text-sm font-medium">Set Objectives</p>
            </div>
            <div className="text-2xl text-blue-600">→</div>
            <div className="text-center space-y-2">
              <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold">✓</div>
              <p className="text-sm font-medium">Ready for Design</p>
            </div>
          </div>
        </div>
      </div>
    ),
    animation: 'slide'
  },
  {
    id: 5,
    title: "Step 2: Canvas Design & Visual Branding",
    subtitle: "Create Your Agent's Visual Identity and Interface",
    content: (
      <div className="h-full overflow-y-auto space-y-6 animate-slide-in-right">
        <div className="text-center mb-6">
          <div className="w-24 h-24 bg-gradient-to-br from-purple-600 to-purple-700 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-white text-3xl">🎨</span>
          </div>
          <h3 className="text-2xl font-bold text-purple-600">Canvas Design</h3>
          <p className="text-muted-foreground">Design your agent's visual interface and branding</p>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <Card className="p-6 bg-gradient-to-br from-purple-500/15 to-purple-500/5 border-l-4 border-purple-500">
            <h4 className="font-bold text-purple-600 mb-4 flex items-center gap-2">
              <span className="text-xl">🎨</span> Visual Design Elements
            </h4>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                <span className="text-sm">Color scheme and themes</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                <span className="text-sm">Typography and fonts</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                <span className="text-sm">Logo and branding assets</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                <span className="text-sm">Custom UI components</span>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-pink-500/15 to-pink-500/5 border-l-4 border-pink-500">
            <h4 className="font-bold text-pink-600 mb-4 flex items-center gap-2">
              <span className="text-xl">📱</span> Interface Layout
            </h4>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-pink-500 rounded-full"></div>
                <span className="text-sm">Responsive design templates</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-pink-500 rounded-full"></div>
                <span className="text-sm">Widget arrangement</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-pink-500 rounded-full"></div>
                <span className="text-sm">Navigation structure</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-pink-500 rounded-full"></div>
                <span className="text-sm">User experience flow</span>
              </div>
            </div>
          </Card>
        </div>

        <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-xl p-6 border-2 border-purple-500/20">
          <h4 className="text-xl font-bold mb-4 text-center">Design Workflow</h4>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center space-y-3">
              <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center text-white text-2xl mx-auto">🎨</div>
              <p className="text-sm font-medium">Visual Elements</p>
              <p className="text-xs text-muted-foreground">Colors, fonts, logos</p>
            </div>
            <div className="text-center space-y-3">
              <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center text-white text-2xl mx-auto">📐</div>
              <p className="text-sm font-medium">Layout Design</p>
              <p className="text-xs text-muted-foreground">Structure and components</p>
            </div>
            <div className="text-center space-y-3">
              <div className="w-16 h-16 bg-pink-600 rounded-full flex items-center justify-center text-white text-2xl mx-auto">👀</div>
              <p className="text-sm font-medium">Preview & Test</p>
              <p className="text-xs text-muted-foreground">Real-time preview</p>
            </div>
          </div>
        </div>
      </div>
    ),
    animation: 'slide'
  },
  {
    id: 6,
    title: "Step 3: Actions Configuration & System Integration",
    subtitle: "Define Actions, Connect Systems, Setup Knowledge Base & Configure API Endpoints",
    content: (
      <div className="h-full overflow-y-auto space-y-6 animate-slide-in-right">
        <div className="text-center mb-6">
          <div className="w-24 h-24 bg-gradient-to-br from-green-600 to-green-700 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-white text-3xl">⚙️</span>
          </div>
          <h3 className="text-2xl font-bold text-green-600">Actions Configuration & System Integration</h3>
          <p className="text-muted-foreground">Comprehensive setup of actions, connectors, knowledge base, and API endpoints</p>
        </div>

        {/* System Connectors Section */}
        <div className="grid grid-cols-2 gap-6 mb-6">
          <Card className="p-6 bg-gradient-to-br from-blue-500/15 to-blue-500/5 border-l-4 border-blue-500">
            <h4 className="font-bold text-blue-600 mb-4 flex items-center gap-2">
              <span className="text-xl">🔗</span> System Connectors
            </h4>
            <div className="space-y-4">
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <h5 className="font-semibold text-blue-700 mb-3">Pre-built Connectors</h5>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span>EHR Systems (Epic, Cerner)</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span>Payment Gateways</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span>Slack/Teams Integration</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span>Email/SMS Services</span>
                  </div>
                </div>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <h5 className="font-semibold text-blue-700 mb-3">Custom Connectors</h5>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-xs">REST API integration builder</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-xs">GraphQL endpoint support</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-xs">Database direct connections</span>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-purple-500/15 to-purple-500/5 border-l-4 border-purple-500">
            <h4 className="font-bold text-purple-600 mb-4 flex items-center gap-2">
              <span className="text-xl">🧠</span> Knowledge Base & RAG Setup
            </h4>
            <div className="space-y-4">
              <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                <h5 className="font-semibold text-purple-700 mb-3">Document Processing</h5>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <span className="text-xs">PDF, DOC, HTML, Markdown support</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <span className="text-xs">Auto-chunking and indexing</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <span className="text-xs">Vector embeddings generation</span>
                  </div>
                </div>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                <h5 className="font-semibold text-purple-700 mb-3">RAG Configuration</h5>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <span className="text-xs">Semantic search algorithms</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <span className="text-xs">Context relevance scoring</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <span className="text-xs">Real-time content updates</span>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Manual Actions & Task Assignment */}
        <div className="grid grid-cols-2 gap-6 mb-6">
          <Card className="p-6 bg-gradient-to-br from-green-500/15 to-green-500/5 border-l-4 border-green-500">
            <h4 className="font-bold text-green-600 mb-4 flex items-center gap-2">
              <span className="text-xl">🔧</span> Manual Actions & Tasks
            </h4>
            <div className="space-y-4">
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <h5 className="font-semibold text-green-700 mb-3">Action Types</h5>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>Data processing tasks</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>Document generation</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>Approval workflows</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>Notification sending</span>
                  </div>
                </div>
              </div>
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <h5 className="font-semibold text-green-700 mb-3">Task Assignment</h5>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-xs">Assign tasks to system connectors</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-xs">Priority-based execution order</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-xs">Conditional task routing</span>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-orange-500/15 to-orange-500/5 border-l-4 border-orange-500">
            <h4 className="font-bold text-orange-600 mb-4 flex items-center gap-2">
              <span className="text-xl">🌐</span> API Endpoints & Visibility
            </h4>
            <div className="space-y-4">
              <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                <h5 className="font-semibold text-orange-700 mb-3">Auto-Generated APIs</h5>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                    <span className="text-xs">REST endpoints for each action</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                    <span className="text-xs">OpenAPI/Swagger documentation</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                    <span className="text-xs">Authentication & rate limiting</span>
                  </div>
                </div>
              </div>
              <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                <h5 className="font-semibold text-orange-700 mb-3">API Management</h5>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                    <span className="text-xs">Real-time monitoring dashboard</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                    <span className="text-xs">Usage analytics & logs</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                    <span className="text-xs">Version control & rollbacks</span>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Configuration Flow */}
        <div className="bg-gradient-to-r from-green-500/10 via-blue-500/10 to-purple-500/10 rounded-xl p-6 border-2 border-green-500/20">
          <h4 className="text-xl font-bold mb-6 text-center">Comprehensive Configuration Journey</h4>
          <div className="grid grid-cols-5 gap-4">
            <div className="text-center space-y-3">
              <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center text-white text-2xl mx-auto animate-pulse">🔧</div>
              <p className="text-sm font-medium">Define Actions</p>
              <p className="text-xs text-muted-foreground">Create manual & automated tasks</p>
            </div>
            <div className="text-center space-y-3">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center text-white text-2xl mx-auto animate-pulse">🔗</div>
              <p className="text-sm font-medium">Connect Systems</p>
              <p className="text-xs text-muted-foreground">Setup system connectors</p>
            </div>
            <div className="text-center space-y-3">
              <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center text-white text-2xl mx-auto animate-pulse">🧠</div>
              <p className="text-sm font-medium">Knowledge Base</p>
              <p className="text-xs text-muted-foreground">Configure RAG system</p>
            </div>
            <div className="text-center space-y-3">
              <div className="w-16 h-16 bg-orange-600 rounded-full flex items-center justify-center text-white text-2xl mx-auto animate-pulse">🌐</div>
              <p className="text-sm font-medium">API Endpoints</p>
              <p className="text-xs text-muted-foreground">Generate & manage APIs</p>
            </div>
            <div className="text-center space-y-3">
              <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center text-white text-2xl mx-auto animate-pulse">✓</div>
              <p className="text-sm font-medium">Ready for AI</p>
              <p className="text-xs text-muted-foreground">Assignment & deployment</p>
            </div>
          </div>
        </div>
      </div>
    ),
    animation: 'slide'
  },
  {
    id: 7,
    title: "Step 4: AI Assignment, Task Execution & Multi-Channel Deployment",
    subtitle: "Intelligent Assignment, System Connector Execution & Channel-Specific Deployment",
    content: (
      <div className="h-full overflow-y-auto space-y-6 animate-slide-in-right">
        <div className="text-center mb-6">
          <div className="w-24 h-24 bg-gradient-to-br from-orange-600 to-orange-700 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-white text-3xl">🤖</span>
          </div>
          <h3 className="text-2xl font-bold text-orange-600">AI Assignment & Multi-Channel Execution</h3>
          <p className="text-muted-foreground">Complete task assignment, connector execution, and deployment orchestration</p>
        </div>

        {/* AI Assignment & Task Execution */}
        <div className="grid grid-cols-2 gap-6 mb-6">
          <Card className="p-6 bg-gradient-to-br from-orange-500/15 to-orange-500/5 border-l-4 border-orange-500">
            <h4 className="font-bold text-orange-600 mb-4 flex items-center gap-2">
              <span className="text-xl">🧠</span> Intelligent AI Assignment
            </h4>
            <div className="space-y-4">
              <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                <h5 className="font-semibold text-orange-700 mb-3">Auto-Suggestion Engine</h5>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                    <span className="text-xs">Analyzes task complexity & requirements</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                    <span className="text-xs">Suggests optimal model combinations</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                    <span className="text-xs">Performance & cost optimization</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                    <span className="text-xs">Real-time model switching</span>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <Badge className="bg-orange-100 text-orange-700 text-xs">Small LLMs for Speed</Badge>
                <Badge className="bg-orange-100 text-orange-700 text-xs">Large LLMs for Complex Tasks</Badge>
                <Badge className="bg-orange-100 text-orange-700 text-xs">Domain-Specific Models</Badge>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-blue-500/15 to-blue-500/5 border-l-4 border-blue-500">
            <h4 className="font-bold text-blue-600 mb-4 flex items-center gap-2">
              <span className="text-xl">🔗</span> System Connector Execution
            </h4>
            <div className="space-y-4">
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <h5 className="font-semibold text-blue-700 mb-3">Task Assignment to Connectors</h5>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-xs">Assign manual actions to system connectors</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-xs">Priority-based execution queuing</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-xs">Conditional task routing logic</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-xs">Error handling & retry mechanisms</span>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <Badge className="bg-blue-100 text-blue-700 text-xs">Real-time Execution</Badge>
                <Badge className="bg-blue-100 text-blue-700 text-xs">Parallel Processing</Badge>
                <Badge className="bg-blue-100 text-blue-700 text-xs">Failure Recovery</Badge>
              </div>
            </div>
          </Card>
        </div>

        {/* Multi-Channel Deployment */}
        <div className="grid grid-cols-2 gap-6 mb-6">
          <Card className="p-6 bg-gradient-to-br from-purple-500/15 to-purple-500/5 border-l-4 border-purple-500">
            <h4 className="font-bold text-purple-600 mb-4 flex items-center gap-2">
              <span className="text-xl">🚀</span> Multi-Channel Deployment
            </h4>
            <div className="space-y-4">
              <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                <h5 className="font-semibold text-purple-700 mb-3">Channel Types</h5>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <span>Web Portal</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <span>Mobile App</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <span>Slack/Teams</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <span>WhatsApp/SMS</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <span>Voice/Phone</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <span>Email Integration</span>
                  </div>
                </div>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                <h5 className="font-semibold text-purple-700 mb-3">Deployment Features</h5>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <span className="text-xs">Channel-specific UI optimization</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <span className="text-xs">Cross-channel context preservation</span>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-green-500/15 to-green-500/5 border-l-4 border-green-500">
            <h4 className="font-bold text-green-600 mb-4 flex items-center gap-2">
              <span className="text-xl">🌐</span> API Endpoint Management
            </h4>
            <div className="space-y-4">
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <h5 className="font-semibold text-green-700 mb-3">Endpoint Availability</h5>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-xs">Auto-generated REST APIs for all actions</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-xs">Real-time API status monitoring</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-xs">OpenAPI/Swagger documentation</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-xs">Authentication & rate limiting</span>
                  </div>
                </div>
              </div>
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <h5 className="font-semibold text-green-700 mb-3">Visibility & Management</h5>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-xs">Live API usage dashboard</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-xs">Performance metrics & analytics</span>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Execution & Deployment Flow */}
        <div className="bg-gradient-to-r from-orange-500/10 via-blue-500/10 via-purple-500/10 to-green-500/10 rounded-xl p-6 border-2 border-orange-500/20">
          <h4 className="text-xl font-bold mb-6 text-center">Complete Assignment & Deployment Journey</h4>
          <div className="grid grid-cols-6 gap-3">
            <div className="text-center space-y-2">
              <div className="w-14 h-14 bg-orange-600 rounded-full flex items-center justify-center text-white text-xl mx-auto animate-pulse">🔍</div>
              <p className="text-xs font-medium">Analyze Tasks</p>
              <p className="text-xs text-muted-foreground">Requirements analysis</p>
            </div>
            <div className="text-center space-y-2">
              <div className="w-14 h-14 bg-blue-600 rounded-full flex items-center justify-center text-white text-xl mx-auto animate-pulse">🤖</div>
              <p className="text-xs font-medium">AI Assignment</p>
              <p className="text-xs text-muted-foreground">Model selection</p>
            </div>
            <div className="text-center space-y-2">
              <div className="w-14 h-14 bg-indigo-600 rounded-full flex items-center justify-center text-white text-xl mx-auto animate-pulse">🔗</div>
              <p className="text-xs font-medium">Connector Setup</p>
              <p className="text-xs text-muted-foreground">Task assignment</p>
            </div>
            <div className="text-center space-y-2">
              <div className="w-14 h-14 bg-purple-600 rounded-full flex items-center justify-center text-white text-xl mx-auto animate-pulse">🚀</div>
              <p className="text-xs font-medium">Deploy Channels</p>
              <p className="text-xs text-muted-foreground">Multi-platform launch</p>
            </div>
            <div className="text-center space-y-2">
              <div className="w-14 h-14 bg-green-600 rounded-full flex items-center justify-center text-white text-xl mx-auto animate-pulse">🌐</div>
              <p className="text-xs font-medium">API Endpoints</p>
              <p className="text-xs text-muted-foreground">Auto-generated APIs</p>
            </div>
            <div className="text-center space-y-2">
              <div className="w-14 h-14 bg-emerald-600 rounded-full flex items-center justify-center text-white text-xl mx-auto animate-pulse">✓</div>
              <p className="text-xs font-medium">Live System</p>
              <p className="text-xs text-muted-foreground">Production ready</p>
            </div>
          </div>
        </div>
      </div>
    ),
    animation: 'slide'
  },
  {
    id: 8,
    title: "Step 5: Multi-Channel Deployment",
    subtitle: "Launch Your Agent Across Multiple Platforms",
    content: (
      <div className="h-full overflow-y-auto space-y-6 animate-slide-in-right">
        <div className="text-center mb-6">
          <div className="w-24 h-24 bg-gradient-to-br from-red-600 to-red-700 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-white text-3xl">🚀</span>
          </div>
          <h3 className="text-2xl font-bold text-red-600">Multi-Channel Deployment</h3>
          <p className="text-muted-foreground">Deploy your AI agent across web, mobile, and communication platforms</p>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-6">
          <Card className="p-4 bg-gradient-to-br from-blue-500/20 to-blue-500/5 border-2 border-blue-500/30 hover:scale-105 transition-transform">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-white text-2xl">🌐</span>
              </div>
              <h4 className="font-bold text-blue-600 mb-2">Web Platform</h4>
              <p className="text-xs text-muted-foreground">Responsive web application</p>
            </div>
          </Card>
          
          <Card className="p-4 bg-gradient-to-br from-green-500/20 to-green-500/5 border-2 border-green-500/30 hover:scale-105 transition-transform">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-white text-2xl">📱</span>
              </div>
              <h4 className="font-bold text-green-600 mb-2">Mobile App</h4>
              <p className="text-xs text-muted-foreground">Native mobile experience</p>
            </div>
          </Card>
          
          <Card className="p-4 bg-gradient-to-br from-purple-500/20 to-purple-500/5 border-2 border-purple-500/30 hover:scale-105 transition-transform">
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-white text-2xl">💬</span>
              </div>
              <h4 className="font-bold text-purple-600 mb-2">Chat Platforms</h4>
              <p className="text-xs text-muted-foreground">Slack, Teams, WhatsApp</p>
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <Card className="p-6 bg-gradient-to-br from-red-500/15 to-red-500/5 border-l-4 border-red-500">
            <h4 className="font-bold text-red-600 mb-4 flex items-center gap-2">
              <span className="text-xl">🚀</span> Deployment Options
            </h4>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <span className="text-sm">One-click deployment</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <span className="text-sm">Staged rollout options</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <span className="text-sm">A/B testing framework</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <span className="text-sm">Rollback capabilities</span>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-blue-500/15 to-blue-500/5 border-l-4 border-blue-500">
            <h4 className="font-bold text-blue-600 mb-4 flex items-center gap-2">
              <span className="text-xl">📊</span> Monitoring & Analytics
            </h4>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span className="text-sm">Real-time performance metrics</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span className="text-sm">User engagement tracking</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span className="text-sm">Error monitoring and alerts</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span className="text-sm">Usage analytics dashboard</span>
              </div>
            </div>
          </Card>
        </div>

        <div className="bg-gradient-to-r from-red-500/10 to-blue-500/10 rounded-xl p-6 border-2 border-red-500/20">
          <h4 className="text-xl font-bold mb-6 text-center">Deployment Journey Complete!</h4>
          <div className="grid grid-cols-5 gap-4">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center text-white font-bold">✓</div>
              <p className="text-sm font-medium">Setup</p>
            </div>
            <div className="text-center space-y-2">
              <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center text-white font-bold">✓</div>
              <p className="text-sm font-medium">Design</p>
            </div>
            <div className="text-center space-y-2">
              <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center text-white font-bold">✓</div>
              <p className="text-sm font-medium">Actions</p>
            </div>
            <div className="text-center space-y-2">
              <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center text-white font-bold">✓</div>
              <p className="text-sm font-medium">AI Assignment</p>
            </div>
            <div className="text-center space-y-2">
              <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center text-white text-xl">🚀</div>
              <p className="text-sm font-medium">Deployed!</p>
            </div>
          </div>
          <div className="text-center mt-6">
            <Badge className="bg-green-100 text-green-700 px-4 py-2">Your AI Agent is Live and Ready!</Badge>
          </div>
        </div>
      </div>
    ),
    animation: 'slide'
  },
  {
    id: 4,
    title: "MCP Protocol & Small Language Models",
    subtitle: "Efficient AI Processing with Model Context Protocol",
    content: (
      <div className="grid grid-cols-2 gap-8 animate-slide-in-left">
        <div className="space-y-6">
          <h3 className="text-2xl font-bold text-primary">MCP Integration</h3>
          <div className="space-y-4">
            <Card className="p-4 bg-gradient-to-r from-primary/10 to-primary/5 border-l-4 border-primary">
              <h4 className="font-bold text-primary">🔗 Protocol Layer</h4>
              <p className="text-sm text-muted-foreground mt-2">
                Model Context Protocol enables seamless communication between AI agents and external systems
              </p>
              <div className="mt-2 text-xs">
                <Badge variant="outline">Real-time</Badge>
                <Badge variant="outline" className="ml-2">Standardized</Badge>
              </div>
            </Card>
            
            <Card className="p-4 bg-gradient-to-r from-secondary/10 to-secondary/5 border-l-4 border-secondary">
              <h4 className="font-bold text-secondary">📡 Context Sharing</h4>
              <p className="text-sm text-muted-foreground mt-2">
                Efficient context propagation across multiple AI models and services
              </p>
              <div className="mt-2 text-xs">
                <Badge variant="outline">Low Latency</Badge>
                <Badge variant="outline" className="ml-2">Secure</Badge>
              </div>
            </Card>
            
            <Card className="p-4 bg-gradient-to-r from-accent/10 to-accent/5 border-l-4 border-accent">
              <h4 className="font-bold text-accent">🔄 Auto-Sync</h4>
              <p className="text-sm text-muted-foreground mt-2">
                Automatic synchronization of agent state and conversation context
              </p>
              <div className="mt-2 text-xs">
                <Badge variant="outline">Persistent</Badge>
                <Badge variant="outline" className="ml-2">Distributed</Badge>
              </div>
            </Card>
          </div>
        </div>
        
        <div className="space-y-6">
          <h3 className="text-2xl font-bold text-secondary">Small Language Models</h3>
          <div className="space-y-4">
            <Card className="p-4 bg-gradient-to-r from-primary/10 to-secondary/10 border-l-4 border-primary">
              <h4 className="font-bold text-primary">⚡ Efficient Processing</h4>
              <p className="text-sm text-muted-foreground mt-2">
                Optimized small models for specific healthcare tasks with reduced latency
              </p>
              <div className="mt-2 text-xs">
                <Badge variant="outline">Fast Response</Badge>
                <Badge variant="outline" className="ml-2">Cost Effective</Badge>
              </div>
            </Card>
            
            <Card className="p-4 bg-gradient-to-r from-secondary/10 to-accent/10 border-l-4 border-secondary">
              <h4 className="font-bold text-secondary">🎯 Task-Specific</h4>
              <p className="text-sm text-muted-foreground mt-2">
                Specialized models for patient intake, document processing, and compliance
              </p>
              <div className="mt-2 text-xs">
                <Badge variant="outline">Healthcare</Badge>
                <Badge variant="outline" className="ml-2">Compliant</Badge>
              </div>
            </Card>
            
            <Card className="p-4 bg-gradient-to-r from-accent/10 to-primary/10 border-l-4 border-accent">
              <h4 className="font-bold text-accent">🔒 Privacy First</h4>
              <p className="text-sm text-muted-foreground mt-2">
                On-premise deployment ensuring patient data never leaves your infrastructure
              </p>
              <div className="mt-2 text-xs">
                <Badge variant="outline">HIPAA</Badge>
                <Badge variant="outline" className="ml-2">Local Processing</Badge>
              </div>
            </Card>
          </div>
        </div>
      </div>
    ),
    animation: 'slide'
  },
  {
    id: 5,
    title: "Knowledge Base & RAG System",
    subtitle: "Retrieval Augmented Generation for Intelligent Responses",
    content: (
      <div className="space-y-8 animate-fade-in">
        <div className="grid grid-cols-3 gap-6">
          <Card className="p-6 bg-gradient-to-br from-primary/20 to-primary/5 border-primary/20">
            <div className="text-center space-y-4">
              <div className="text-4xl">📚</div>
              <h4 className="text-lg font-semibold text-primary">Knowledge Ingestion</h4>
              <p className="text-sm text-muted-foreground">
                Automated processing of documents, policies, and treatment protocols
              </p>
              <div className="space-y-1">
                <Badge variant="outline" className="text-xs">PDF Processing</Badge>
                <Badge variant="outline" className="text-xs">Text Extraction</Badge>
                <Badge variant="outline" className="text-xs">Auto-Chunking</Badge>
              </div>
            </div>
          </Card>
          
          <Card className="p-6 bg-gradient-to-br from-secondary/20 to-secondary/5 border-secondary/20">
            <div className="text-center space-y-4">
              <div className="text-4xl">🧠</div>
              <h4 className="text-lg font-semibold text-secondary">Vector Storage</h4>
              <p className="text-sm text-muted-foreground">
                High-dimensional embeddings for semantic search and retrieval
              </p>
              <div className="space-y-1">
                <Badge variant="outline" className="text-xs">Embeddings</Badge>
                <Badge variant="outline" className="text-xs">Vector DB</Badge>
                <Badge variant="outline" className="text-xs">Similarity Search</Badge>
              </div>
            </div>
          </Card>
          
          <Card className="p-6 bg-gradient-to-br from-accent/20 to-accent/5 border-accent/20">
            <div className="text-center space-y-4">
              <div className="text-4xl">🎯</div>
              <h4 className="text-lg font-semibold text-accent">Context Retrieval</h4>
              <p className="text-sm text-muted-foreground">
                Real-time context injection for accurate and relevant responses
              </p>
              <div className="space-y-1">
                <Badge variant="outline" className="text-xs">Query Matching</Badge>
                <Badge variant="outline" className="text-xs">Context Ranking</Badge>
                <Badge variant="outline" className="text-xs">Response Gen</Badge>
              </div>
            </div>
          </Card>
        </div>
        
        <div className="bg-gradient-to-r from-primary/10 via-secondary/10 to-accent/10 rounded-lg p-6">
          <h3 className="text-xl font-bold text-center mb-6">RAG Processing Pipeline</h3>
          <div className="flex items-center justify-between">
            {[
              { step: "Document Upload", icon: "📄", desc: "Upload treatment docs" },
              { step: "Text Processing", icon: "🔍", desc: "Extract & clean text" },
              { step: "Embedding Gen", icon: "🧮", desc: "Create vector embeddings" },
              { step: "Vector Store", icon: "💾", desc: "Store in vector DB" },
              { step: "Query Match", icon: "🎯", desc: "Semantic search" },
              { step: "Context Inject", icon: "💉", desc: "Augment response" }
            ].map((item, index) => (
              <div key={index} className="flex flex-col items-center text-center">
                <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center mb-2">
                  <span className="text-xl">{item.icon}</span>
                </div>
                <p className="font-semibold text-sm">{item.step}</p>
                <p className="text-xs text-muted-foreground">{item.desc}</p>
                {index < 5 && <div className="mt-2 text-primary">→</div>}
              </div>
            ))}
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-8">
          <div className="space-y-4">
            <h4 className="text-lg font-bold text-primary">Knowledge Sources</h4>
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <span className="text-sm">Treatment center policies & procedures</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-secondary rounded-full"></div>
                <span className="text-sm">Regulatory compliance documents</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-accent rounded-full"></div>
                <span className="text-sm">Best practice guidelines</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <span className="text-sm">FAQ databases & support docs</span>
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            <h4 className="text-lg font-bold text-secondary">RAG Benefits</h4>
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm">Accurate, source-backed responses</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm">Real-time knowledge updates</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm">Reduced hallucinations</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm">Compliance-ready responses</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    ),
    animation: 'fade'
  },
  {
    id: 8,
    title: "AI Model Selection & Assignment",
    subtitle: "Auto-Assignment vs Manual Configuration",
    content: (
      <div className="space-y-8 animate-slide-in-left">
        <div className="grid grid-cols-2 gap-8">
          <div className="space-y-6">
            <h3 className="text-2xl font-bold text-primary">Available AI Models</h3>
            <div className="space-y-4">
              <Card className="p-4 bg-gradient-to-r from-blue-500/10 to-blue-500/5 border-l-4 border-blue-500">
                <h4 className="font-bold text-blue-600">🤖 Small Language Models</h4>
                <p className="text-sm text-muted-foreground mt-2">Specialized healthcare models for specific tasks</p>
                <div className="mt-2 text-xs space-y-1">
                  <Badge variant="outline">Patient Intake Model</Badge>
                  <Badge variant="outline" className="ml-2">Compliance Model</Badge>
                  <Badge variant="outline" className="ml-2">Document Processing</Badge>
                </div>
              </Card>
              
              <Card className="p-4 bg-gradient-to-r from-green-500/10 to-green-500/5 border-l-4 border-green-500">
                <h4 className="font-bold text-green-600">🎙️ Voice AI Models</h4>
                <p className="text-sm text-muted-foreground mt-2">ElevenLabs integration for voice interactions</p>
                <div className="mt-2 text-xs space-y-1">
                  <Badge variant="outline">Multilingual v2</Badge>
                  <Badge variant="outline" className="ml-2">Turbo v2.5</Badge>
                  <Badge variant="outline" className="ml-2">English v2</Badge>
                </div>
              </Card>
              
              <Card className="p-4 bg-gradient-to-r from-purple-500/10 to-purple-500/5 border-l-4 border-purple-500">
                <h4 className="font-bold text-purple-600">🧠 RAG Models</h4>
                <p className="text-sm text-muted-foreground mt-2">Knowledge retrieval and context understanding</p>
                <div className="mt-2 text-xs space-y-1">
                  <Badge variant="outline">Vector Embeddings</Badge>
                  <Badge variant="outline" className="ml-2">Semantic Search</Badge>
                  <Badge variant="outline" className="ml-2">Context Ranking</Badge>
                </div>
              </Card>
            </div>
          </div>
          
          <div className="space-y-6">
            <h3 className="text-2xl font-bold text-secondary">Assignment Methods</h3>
            <div className="space-y-4">
              <Card className="p-4 bg-gradient-to-r from-orange-500/10 to-orange-500/5 border-l-4 border-orange-500">
                <h4 className="font-bold text-orange-600">🤖 Auto-Assignment</h4>
                <p className="text-sm text-muted-foreground mt-2">AI automatically selects optimal models based on:</p>
                <div className="mt-2 text-xs space-y-1">
                  <div>• Treatment center type</div>
                  <div>• Patient demographics</div>
                  <div>• Interaction complexity</div>
                  <div>• Performance metrics</div>
                </div>
              </Card>
              
              <Card className="p-4 bg-gradient-to-r from-red-500/10 to-red-500/5 border-l-4 border-red-500">
                <h4 className="font-bold text-red-600">👤 Manual Assignment</h4>
                <p className="text-sm text-muted-foreground mt-2">Administrators can manually configure:</p>
                <div className="mt-2 text-xs space-y-1">
                  <div>• Specific model selection</div>
                  <div>• Custom voice assignments</div>
                  <div>• Template configurations</div>
                  <div>• Performance thresholds</div>
                </div>
              </Card>
              
              <Card className="p-4 bg-gradient-to-r from-teal-500/10 to-teal-500/5 border-l-4 border-teal-500">
                <h4 className="font-bold text-teal-600">⚖️ Hybrid Approach</h4>
                <p className="text-sm text-muted-foreground mt-2">Best of both worlds:</p>
                <div className="mt-2 text-xs space-y-1">
                  <div>• AI suggestions with human override</div>
                  <div>• Fallback model chains</div>
                  <div>• A/B testing capabilities</div>
                  <div>• Performance-based switching</div>
                </div>
              </Card>
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-primary/10 via-secondary/10 to-accent/10 rounded-lg p-6">
          <h3 className="text-xl font-bold text-center mb-6">Model Assignment Workflow</h3>
          <div className="flex items-center justify-between">
            {[
              { step: "Request Analysis", icon: "🔍", desc: "Analyze interaction type" },
              { step: "Model Selection", icon: "🎯", desc: "Auto or manual choice" },
              { step: "Performance Check", icon: "📊", desc: "Validate capabilities" },
              { step: "Template Match", icon: "📋", desc: "Match with templates" },
              { step: "Deploy Config", icon: "🚀", desc: "Apply configuration" },
              { step: "Monitor & Adapt", icon: "📈", desc: "Track performance" }
            ].map((item, index) => (
              <div key={index} className="flex flex-col items-center text-center">
                <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center mb-2">
                  <span className="text-xl">{item.icon}</span>
                </div>
                <p className="font-semibold text-sm">{item.step}</p>
                <p className="text-xs text-muted-foreground">{item.desc}</p>
                {index < 5 && <div className="mt-2 text-primary">→</div>}
              </div>
            ))}
          </div>
        </div>
      </div>
    ),
    animation: 'slide'
  },
  {
    id: 9,
    title: "Template Configuration Deep Dive",
    subtitle: "Dynamic AI Agent Template System",
    content: (
      <div className="space-y-8 animate-zoom-in">
        <div className="grid grid-cols-3 gap-6">
          <Card className="p-6 bg-gradient-to-br from-blue-500/20 to-blue-500/5 border-blue-500/20">
            <div className="text-center space-y-4">
              <div className="text-4xl">🎨</div>
              <h4 className="text-lg font-semibold text-blue-600">Template Builder</h4>
              <p className="text-sm text-muted-foreground">Visual drag-and-drop interface for creating AI agent templates</p>
              <div className="space-y-1">
                <Badge variant="outline" className="text-xs">Visual Editor</Badge>
                <Badge variant="outline" className="text-xs">Live Preview</Badge>
                <Badge variant="outline" className="text-xs">Component Library</Badge>
              </div>
            </div>
          </Card>
          
          <Card className="p-6 bg-gradient-to-br from-green-500/20 to-green-500/5 border-green-500/20">
            <div className="text-center space-y-4">
              <div className="text-4xl">🔧</div>
              <h4 className="text-lg font-semibold text-green-600">Auto-Configuration</h4>
              <p className="text-sm text-muted-foreground">AI analyzes requirements and auto-generates optimal templates</p>
              <div className="space-y-1">
                <Badge variant="outline" className="text-xs">Smart Defaults</Badge>
                <Badge variant="outline" className="text-xs">Best Practices</Badge>
                <Badge variant="outline" className="text-xs">Industry Standards</Badge>
              </div>
            </div>
          </Card>
          
          <Card className="p-6 bg-gradient-to-br from-purple-500/20 to-purple-500/5 border-purple-500/20">
            <div className="text-center space-y-4">
              <div className="text-4xl">🎯</div>
              <h4 className="text-lg font-semibold text-purple-600">Template Optimization</h4>
              <p className="text-sm text-muted-foreground">Continuous learning and template improvement based on performance</p>
              <div className="space-y-1">
                <Badge variant="outline" className="text-xs">A/B Testing</Badge>
                <Badge variant="outline" className="text-xs">Performance Analytics</Badge>
                <Badge variant="outline" className="text-xs">Auto-Refinement</Badge>
              </div>
            </div>
          </Card>
        </div>
        
        <div className="grid grid-cols-2 gap-8">
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-primary">Template Categories</h3>
            <div className="space-y-3">
              <Card className="p-3 bg-gradient-to-r from-primary/10 to-primary/5">
                <h4 className="font-bold text-sm">🏥 Treatment Center Types</h4>
                <div className="text-xs text-muted-foreground space-y-1 mt-2">
                  <div>• Rehabilitation Centers</div>
                  <div>• Mental Health Facilities</div>
                  <div>• Substance Abuse Centers</div>
                  <div>• Outpatient Clinics</div>
                </div>
              </Card>
              
              <Card className="p-3 bg-gradient-to-r from-secondary/10 to-secondary/5">
                <h4 className="font-bold text-sm">👥 Patient Demographics</h4>
                <div className="text-xs text-muted-foreground space-y-1 mt-2">
                  <div>• Adult Treatment</div>
                  <div>• Adolescent Care</div>
                  <div>• Senior Programs</div>
                  <div>• Family Support</div>
                </div>
              </Card>
              
              <Card className="p-3 bg-gradient-to-r from-accent/10 to-accent/5">
                <h4 className="font-bold text-sm">🔧 Interaction Types</h4>
                <div className="text-xs text-muted-foreground space-y-1 mt-2">
                  <div>• Initial Intake</div>
                  <div>• Progress Tracking</div>
                  <div>• Crisis Support</div>
                  <div>• Discharge Planning</div>
                </div>
              </Card>
            </div>
          </div>
          
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-secondary">Assignment Logic</h3>
            <div className="space-y-3">
              <Card className="p-4 bg-gradient-to-r from-orange-500/10 to-orange-500/5">
                <h4 className="font-bold text-orange-600 text-sm">🤖 Intelligent Matching</h4>
                <p className="text-xs text-muted-foreground mt-1">AI analyzes 50+ parameters including:</p>
                <div className="text-xs space-y-1 mt-2">
                  <div>• Facility specifications</div>
                  <div>• Patient complexity scores</div>
                  <div>• Historical performance data</div>
                  <div>• Regulatory requirements</div>
                  <div>• Staff expertise levels</div>
                </div>
              </Card>
              
              <Card className="p-4 bg-gradient-to-r from-teal-500/10 to-teal-500/5">
                <h4 className="font-bold text-teal-600 text-sm">⚡ Real-time Adaptation</h4>
                <p className="text-xs text-muted-foreground mt-1">Dynamic template switching based on:</p>
                <div className="text-xs space-y-1 mt-2">
                  <div>• Conversation flow changes</div>
                  <div>• Patient response patterns</div>
                  <div>• Emergency situations</div>
                  <div>• Staff availability</div>
                  <div>• System load balancing</div>
                </div>
              </Card>
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-primary/10 via-secondary/10 to-accent/10 rounded-lg p-6">
          <h3 className="text-xl font-bold text-center mb-4">Template Assignment Decision Tree</h3>
          <div className="grid grid-cols-4 gap-4 text-center">
            <div className="space-y-2">
              <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center mx-auto">
                <span className="text-lg">🏥</span>
              </div>
              <p className="font-semibold text-sm">Facility Analysis</p>
              <p className="text-xs text-muted-foreground">Type, size, specialization</p>
            </div>
            <div className="space-y-2">
              <div className="w-12 h-12 bg-secondary rounded-full flex items-center justify-center mx-auto">
                <span className="text-lg">👤</span>
              </div>
              <p className="font-semibold text-sm">Patient Profiling</p>
              <p className="text-xs text-muted-foreground">Demographics, needs, history</p>
            </div>
            <div className="space-y-2">
              <div className="w-12 h-12 bg-accent rounded-full flex items-center justify-center mx-auto">
                <span className="text-lg">🎯</span>
              </div>
              <p className="font-semibold text-sm">Template Matching</p>
              <p className="text-xs text-muted-foreground">AI selects best fit template</p>
            </div>
            <div className="space-y-2">
              <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center mx-auto">
                <span className="text-lg">🚀</span>
              </div>
              <p className="font-semibold text-sm">Deploy & Monitor</p>
              <p className="text-xs text-muted-foreground">Launch with performance tracking</p>
            </div>
          </div>
        </div>
      </div>
    ),
    animation: 'zoom'
  },
  {
    id: 6,
    title: "Actions, Tasks & AI Autosuggest",
    subtitle: "Intelligent Task Management & Real-time Suggestions",
    content: (
      <div className="space-y-8 animate-slide-in-right">
        <div className="grid grid-cols-2 gap-8">
          <div className="space-y-6">
            <h3 className="text-2xl font-bold text-primary">Actions & Tasks Engine</h3>
            <div className="space-y-4">
              <Card className="p-4 bg-gradient-to-r from-primary/10 to-primary/5 border-l-4 border-primary">
                <h4 className="font-bold text-primary">🎯 Smart Assignment</h4>
                <p className="text-sm text-muted-foreground mt-2">
                  AI automatically categorizes and assigns tasks based on context and priority
                </p>
                <div className="mt-2 text-xs">
                  <Badge variant="outline">Auto-categorize</Badge>
                  <Badge variant="outline" className="ml-2">Priority-based</Badge>
                </div>
              </Card>
              
              <Card className="p-4 bg-gradient-to-r from-secondary/10 to-secondary/5 border-l-4 border-secondary">
                <h4 className="font-bold text-secondary">⚡ Real-time Execution</h4>
                <p className="text-sm text-muted-foreground mt-2">
                  Immediate task processing with status tracking and completion updates
                </p>
                <div className="mt-2 text-xs">
                  <Badge variant="outline">Live Updates</Badge>
                  <Badge variant="outline" className="ml-2">Status Tracking</Badge>
                </div>
              </Card>
              
              <Card className="p-4 bg-gradient-to-r from-accent/10 to-accent/5 border-l-4 border-accent">
                <h4 className="font-bold text-accent">📋 Workflow Integration</h4>
                <p className="text-sm text-muted-foreground mt-2">
                  Seamless integration with existing treatment center workflows
                </p>
                <div className="mt-2 text-xs">
                  <Badge variant="outline">Workflow-aware</Badge>
                  <Badge variant="outline" className="ml-2">Process Integration</Badge>
                </div>
              </Card>
            </div>
          </div>
          
          <div className="space-y-6">
            <h3 className="text-2xl font-bold text-secondary">AI Autosuggest System</h3>
            <div className="space-y-4">
              <Card className="p-4 bg-gradient-to-r from-primary/10 to-secondary/10 border-l-4 border-primary">
                <h4 className="font-bold text-primary">💡 Context-Aware</h4>
                <p className="text-sm text-muted-foreground mt-2">
                  Intelligent suggestions based on current conversation and patient context
                </p>
                <div className="mt-2 text-xs">
                  <Badge variant="outline">Context-driven</Badge>
                  <Badge variant="outline" className="ml-2">Patient-specific</Badge>
                </div>
              </Card>
              
              <Card className="p-4 bg-gradient-to-r from-secondary/10 to-accent/10 border-l-4 border-secondary">
                <h4 className="font-bold text-secondary">🧠 Learning Algorithm</h4>
                <p className="text-sm text-muted-foreground mt-2">
                  Continuously improves suggestions based on user interactions and outcomes
                </p>
                <div className="mt-2 text-xs">
                  <Badge variant="outline">Machine Learning</Badge>
                  <Badge variant="outline" className="ml-2">Adaptive</Badge>
                </div>
              </Card>
              
              <Card className="p-4 bg-gradient-to-r from-accent/10 to-primary/10 border-l-4 border-accent">
                <h4 className="font-bold text-accent">🚀 Real-time Delivery</h4>
                <p className="text-sm text-muted-foreground mt-2">
                  Instant suggestions delivered as user types with minimal latency
                </p>
                <div className="mt-2 text-xs">
                  <Badge variant="outline">Sub-second</Badge>
                  <Badge variant="outline" className="ml-2">Low Latency</Badge>
                </div>
              </Card>
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-primary/10 via-secondary/10 to-accent/10 rounded-lg p-6">
          <h3 className="text-xl font-bold text-center mb-6">AI Autosuggest Pipeline</h3>
          <div className="flex items-center justify-between">
            {[
              { step: "User Input", icon: "⌨️", desc: "User starts typing" },
              { step: "Context Analysis", icon: "🔍", desc: "Analyze conversation" },
              { step: "Knowledge Query", icon: "🧠", desc: "Search knowledge base" },
              { step: "Generate Options", icon: "💭", desc: "Create suggestions" },
              { step: "Rank & Filter", icon: "📊", desc: "Priority ranking" },
              { step: "Display Results", icon: "📱", desc: "Show suggestions" }
            ].map((item, index) => (
              <div key={index} className="flex flex-col items-center text-center">
                <div className="w-12 h-12 bg-secondary rounded-full flex items-center justify-center mb-2">
                  <span className="text-xl">{item.icon}</span>
                </div>
                <p className="font-semibold text-sm">{item.step}</p>
                <p className="text-xs text-muted-foreground">{item.desc}</p>
                {index < 5 && <div className="mt-2 text-secondary">→</div>}
              </div>
            ))}
          </div>
        </div>
        
        <div className="grid grid-cols-3 gap-6">
          <Card className="p-4 bg-gradient-to-br from-primary/20 to-primary/5">
            <h4 className="font-bold text-primary mb-2 text-sm">Task Categories</h4>
            <div className="space-y-1 text-xs">
              <div>• Patient Intake</div>
              <div>• Document Review</div>
              <div>• Compliance Check</div>
              <div>• Follow-up Actions</div>
            </div>
          </Card>
          
          <Card className="p-4 bg-gradient-to-br from-secondary/20 to-secondary/5">
            <h4 className="font-bold text-secondary mb-2 text-sm">Suggestion Types</h4>
            <div className="space-y-1 text-xs">
              <div>• Response Templates</div>
              <div>• Next Best Actions</div>
              <div>• Document References</div>
              <div>• Compliance Reminders</div>
            </div>
          </Card>
          
          <Card className="p-4 bg-gradient-to-br from-accent/20 to-accent/5">
            <h4 className="font-bold text-accent mb-2 text-sm">Performance Metrics</h4>
            <div className="space-y-1 text-xs">
              <div>• 95% Accuracy Rate</div>
              <div>• 200ms Response Time</div>
              <div>• 80% Adoption Rate</div>
              <div>• 60% Time Savings</div>
            </div>
          </Card>
        </div>
      </div>
    ),
    animation: 'slide'
  },
  {
    id: 7,
    title: "Template Configuration & Channel Deployment",
    subtitle: "Dynamic Templates & Multi-Platform Distribution",
    content: (
      <div className="space-y-8 animate-zoom-in">
        <div className="grid grid-cols-2 gap-8">
          <div className="space-y-6">
            <h3 className="text-2xl font-bold text-primary">Template Configuration</h3>
            <div className="space-y-4">
              <Card className="p-4 bg-gradient-to-r from-primary/10 to-primary/5 border-l-4 border-primary">
                <h4 className="font-bold text-primary">🎨 Dynamic Templates</h4>
                <p className="text-sm text-muted-foreground mt-2">
                  AI-powered template customization based on treatment center type and requirements
                </p>
                <div className="mt-2 text-xs">
                  <Badge variant="outline">Industry-specific</Badge>
                  <Badge variant="outline" className="ml-2">Auto-adapt</Badge>
                </div>
              </Card>
              
              <Card className="p-4 bg-gradient-to-r from-secondary/10 to-secondary/5 border-l-4 border-secondary">
                <h4 className="font-bold text-secondary">🔧 Configuration Engine</h4>
                <p className="text-sm text-muted-foreground mt-2">
                  Visual configuration interface for customizing AI agent behavior and responses
                </p>
                <div className="mt-2 text-xs">
                  <Badge variant="outline">Visual Editor</Badge>
                  <Badge variant="outline" className="ml-2">Real-time Preview</Badge>
                </div>
              </Card>
              
              <Card className="p-4 bg-gradient-to-r from-accent/10 to-accent/5 border-l-4 border-accent">
                <h4 className="font-bold text-accent">📊 A/B Testing</h4>
                <p className="text-sm text-muted-foreground mt-2">
                  Built-in testing framework for optimizing template performance
                </p>
                <div className="mt-2 text-xs">
                  <Badge variant="outline">Split Testing</Badge>
                  <Badge variant="outline" className="ml-2">Performance Metrics</Badge>
                </div>
              </Card>
            </div>
          </div>
          
          <div className="space-y-6">
            <h3 className="text-2xl font-bold text-secondary">Channel Deployment</h3>
            <div className="space-y-4">
              <Card className="p-4 bg-gradient-to-r from-primary/10 to-secondary/10 border-l-4 border-primary">
                <h4 className="font-bold text-primary">🌐 Multi-Platform</h4>
                <p className="text-sm text-muted-foreground mt-2">
                  Automatic deployment across web, mobile, chat platforms, and voice assistants
                </p>
                <div className="mt-2 text-xs">
                  <Badge variant="outline">Web Portal</Badge>
                  <Badge variant="outline" className="ml-2">Mobile App</Badge>
                  <Badge variant="outline" className="ml-2">Voice AI</Badge>
                </div>
              </Card>
              
              <Card className="p-4 bg-gradient-to-r from-secondary/10 to-accent/10 border-l-4 border-secondary">
                <h4 className="font-bold text-secondary">🚀 Auto-Deploy</h4>
                <p className="text-sm text-muted-foreground mt-2">
                  One-click deployment with automatic optimization for each channel
                </p>
                <div className="mt-2 text-xs">
                  <Badge variant="outline">CI/CD Pipeline</Badge>
                  <Badge variant="outline" className="ml-2">Auto-optimize</Badge>
                </div>
              </Card>
              
              <Card className="p-4 bg-gradient-to-r from-accent/10 to-primary/10 border-l-4 border-accent">
                <h4 className="font-bold text-accent">📱 Channel Adaptation</h4>
                <p className="text-sm text-muted-foreground mt-2">
                  Intelligent adaptation of responses and UI for each deployment channel
                </p>
                <div className="mt-2 text-xs">
                  <Badge variant="outline">Responsive</Badge>
                  <Badge variant="outline" className="ml-2">Context-aware</Badge>
                </div>
              </Card>
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-primary/10 via-secondary/10 to-accent/10 rounded-lg p-6">
          <h3 className="text-xl font-bold text-center mb-6">Deployment Pipeline</h3>
          <div className="flex items-center justify-between">
            {[
              { step: "Template Design", icon: "🎨", desc: "Visual configuration" },
              { step: "AI Training", icon: "🧠", desc: "Knowledge integration" },
              { step: "Testing", icon: "🧪", desc: "A/B test variants" },
              { step: "Channel Prep", icon: "⚙️", desc: "Platform optimization" },
              { step: "Deploy", icon: "🚀", desc: "Multi-channel launch" },
              { step: "Monitor", icon: "📊", desc: "Performance tracking" }
            ].map((item, index) => (
              <div key={index} className="flex flex-col items-center text-center">
                <div className="w-12 h-12 bg-accent rounded-full flex items-center justify-center mb-2">
                  <span className="text-xl">{item.icon}</span>
                </div>
                <p className="font-semibold text-sm">{item.step}</p>
                <p className="text-xs text-muted-foreground">{item.desc}</p>
                {index < 5 && <div className="mt-2 text-accent">→</div>}
              </div>
            ))}
          </div>
        </div>
        
        <div className="grid grid-cols-4 gap-4">
          <Card className="p-4 bg-gradient-to-br from-blue-500/20 to-blue-500/5">
            <div className="text-center">
              <div className="text-2xl mb-2">🌐</div>
              <h4 className="font-bold text-sm">Web Portal</h4>
              <p className="text-xs text-muted-foreground">Responsive web interface</p>
            </div>
          </Card>
          
          <Card className="p-4 bg-gradient-to-br from-green-500/20 to-green-500/5">
            <div className="text-center">
              <div className="text-2xl mb-2">📱</div>
              <h4 className="font-bold text-sm">Mobile App</h4>
              <p className="text-xs text-muted-foreground">Native iOS/Android</p>
            </div>
          </Card>
          
          <Card className="p-4 bg-gradient-to-br from-purple-500/20 to-purple-500/5">
            <div className="text-center">
              <div className="text-2xl mb-2">💬</div>
              <h4 className="font-bold text-sm">Chat Platforms</h4>
              <p className="text-xs text-muted-foreground">Slack, Teams, Discord</p>
            </div>
          </Card>
          
          <Card className="p-4 bg-gradient-to-br from-orange-500/20 to-orange-500/5">
            <div className="text-center">
              <div className="text-2xl mb-2">🎤</div>
              <h4 className="font-bold text-sm">Voice AI</h4>
              <p className="text-xs text-muted-foreground">Alexa, Google, Phone</p>
            </div>
          </Card>
        </div>
      </div>
    ),
    animation: 'zoom'
  },
  {
    id: 8,
    title: "Complete Implementation Results",
    subtitle: "Comprehensive AI Agent Platform Impact",
    content: (
      <div className="space-y-8 animate-zoom-in">
        <div className="grid grid-cols-4 gap-6">
          <Card className="p-6 text-center bg-gradient-to-br from-blue-500/20 to-blue-500/5 border-blue-500/20">
            <div className="space-y-4">
              <div className="text-3xl font-bold text-blue-600">95%</div>
              <h4 className="text-sm font-semibold">Agent Accuracy</h4>
              <p className="text-xs text-muted-foreground">Response precision</p>
            </div>
          </Card>
          
          <Card className="p-6 text-center bg-gradient-to-br from-green-500/20 to-green-500/5 border-green-500/20">
            <div className="space-y-4">
              <div className="text-3xl font-bold text-green-600">200ms</div>
              <h4 className="text-sm font-semibold">Response Time</h4>
              <p className="text-xs text-muted-foreground">Real-time suggestions</p>
            </div>
          </Card>
          
          <Card className="p-6 text-center bg-gradient-to-br from-purple-500/20 to-purple-500/5 border-purple-500/20">
            <div className="space-y-4">
              <div className="text-3xl font-bold text-purple-600">24/7</div>
              <h4 className="text-sm font-semibold">Availability</h4>
              <p className="text-xs text-muted-foreground">Continuous operation</p>
            </div>
          </Card>
          
          <Card className="p-6 text-center bg-gradient-to-br from-orange-500/20 to-orange-500/5 border-orange-500/20">
            <div className="space-y-4">
              <div className="text-3xl font-bold text-orange-600">80%</div>
              <h4 className="text-sm font-semibold">Adoption Rate</h4>
              <p className="text-xs text-muted-foreground">User engagement</p>
            </div>
          </Card>
        </div>
        
        <div className="bg-gradient-to-r from-primary/10 via-secondary/10 to-accent/10 rounded-lg p-6">
          <h3 className="text-xl font-bold text-center mb-6">Complete Feature Implementation</h3>
          <div className="grid grid-cols-2 gap-8">
            <div className="space-y-3">
              <h4 className="font-bold text-primary">✅ Core AI Features</h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>MCP Protocol Integration</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Small Language Models</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>RAG Knowledge Base</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>AI Autosuggest Engine</span>
                </div>
              </div>
            </div>
            
            <div className="space-y-3">
              <h4 className="font-bold text-secondary">✅ Platform Features</h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Template Configuration</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Actions & Tasks Assignment</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Multi-Channel Deployment</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Connector & System Integration</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-3 gap-6">
          <Card className="p-6 bg-gradient-to-br from-primary/20 to-primary/5">
            <h4 className="text-lg font-bold text-primary mb-4">Traditional Setup</h4>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2 text-red-500">
                <span>❌</span>
                <span>Months of development</span>
              </div>
              <div className="flex items-center gap-2 text-red-500">
                <span>❌</span>
                <span>Manual configuration</span>
              </div>
              <div className="flex items-center gap-2 text-red-500">
                <span>❌</span>
                <span>Limited intelligence</span>
              </div>
              <div className="flex items-center gap-2 text-red-500">
                <span>❌</span>
                <span>High maintenance</span>
              </div>
            </div>
          </Card>
          
          <Card className="p-6 bg-gradient-to-br from-secondary/20 to-secondary/5">
            <h4 className="text-lg font-bold text-secondary mb-4">Our AI Platform</h4>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2 text-green-500">
                <span>✅</span>
                <span>One-click deployment</span>
              </div>
              <div className="flex items-center gap-2 text-green-500">
                <span>✅</span>
                <span>AI-powered automation</span>
              </div>
              <div className="flex items-center gap-2 text-green-500">
                <span>✅</span>
                <span>Advanced intelligence</span>
              </div>
              <div className="flex items-center gap-2 text-green-500">
                <span>✅</span>
                <span>Self-maintaining</span>
              </div>
            </div>
          </Card>
          
          <Card className="p-6 bg-gradient-to-br from-accent/20 to-accent/5">
            <h4 className="text-lg font-bold text-accent mb-4">Business Impact</h4>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <span>💰</span>
                <span>85% cost reduction</span>
              </div>
              <div className="flex items-center gap-2">
                <span>⚡</span>
                <span>90% faster time-to-market</span>
              </div>
              <div className="flex items-center gap-2">
                <span>📈</span>
                <span>300% ROI within 6 months</span>
              </div>
              <div className="flex items-center gap-2">
                <span>🎯</span>
                <span>99.9% system reliability</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    ),
    animation: 'zoom'
  },
  {
    id: 11,
    title: "Advanced AI Models, Vision Systems & Studio Labeling",
    subtitle: "Extended AI Capabilities, Vision Language Models & Data Preparation",
    content: (
      <div className="h-full overflow-y-auto space-y-6 animate-fade-in">
        <div className="text-center mb-6">
          <div className="w-24 h-24 bg-gradient-to-br from-indigo-600 to-indigo-700 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-white text-3xl">🔬</span>
          </div>
          <h3 className="text-2xl font-bold text-indigo-600">Advanced AI Models & Vision Systems</h3>
          <p className="text-muted-foreground">Comprehensive AI model ecosystem with vision capabilities and data labeling</p>
        </div>

        {/* Other AI Models Section */}
        <div className="grid grid-cols-2 gap-6 mb-6">
          <Card className="p-6 bg-gradient-to-br from-blue-500/15 to-blue-500/5 border-l-4 border-blue-500">
            <h4 className="font-bold text-blue-600 mb-4 flex items-center gap-2">
              <span className="text-xl">🤖</span> Additional AI Models
            </h4>
            <div className="space-y-4">
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <h5 className="font-semibold text-blue-700 mb-3">OpenAI Models</h5>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-xs">GPT-4.1-2025 (flagship model)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-xs">O3-2025 (reasoning model)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-xs">O4-mini (fast reasoning)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-xs">GPT Image-1 (image generation)</span>
                  </div>
                </div>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <h5 className="font-semibold text-blue-700 mb-3">Anthropic Claude Models</h5>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-xs">Claude Opus-4 (most capable)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-xs">Claude Sonnet-4 (high performance)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-xs">Claude Haiku-3.5 (fastest)</span>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <Badge className="bg-blue-100 text-blue-700 text-xs">Multi-modal Support</Badge>
                <Badge className="bg-blue-100 text-blue-700 text-xs">200K Context Window</Badge>
                <Badge className="bg-blue-100 text-blue-700 text-xs">Healthcare Specialized</Badge>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-purple-500/15 to-purple-500/5 border-l-4 border-purple-500">
            <h4 className="font-bold text-purple-600 mb-4 flex items-center gap-2">
              <span className="text-xl">👁️</span> Vision Language Models
            </h4>
            <div className="space-y-4">
              <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                <h5 className="font-semibold text-purple-700 mb-3">Vision Capabilities</h5>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <span className="text-xs">Document analysis & OCR</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <span className="text-xs">Medical image interpretation</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <span className="text-xs">Chart & graph understanding</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <span className="text-xs">Form processing automation</span>
                  </div>
                </div>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                <h5 className="font-semibold text-purple-700 mb-3">Use Cases in Healthcare</h5>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <span className="text-xs">Patient ID verification</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <span className="text-xs">Insurance document processing</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <span className="text-xs">Treatment progress visualization</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <span className="text-xs">Compliance documentation review</span>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Studio Labeling & Test Data */}
        <div className="grid grid-cols-2 gap-6 mb-6">
          <Card className="p-6 bg-gradient-to-br from-orange-500/15 to-orange-500/5 border-l-4 border-orange-500">
            <h4 className="font-bold text-orange-600 mb-4 flex items-center gap-2">
              <span className="text-xl">🏷️</span> Studio Labeling System
            </h4>
            <div className="space-y-4">
              <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                <h5 className="font-semibold text-orange-700 mb-3">Data Annotation Tools</h5>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                    <span className="text-xs">Medical text classification</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                    <span className="text-xs">Entity recognition labeling</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                    <span className="text-xs">Sentiment analysis training</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                    <span className="text-xs">Image annotation for vision models</span>
                  </div>
                </div>
              </div>
              <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                <h5 className="font-semibold text-orange-700 mb-3">Labeling Workflow</h5>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                    <span className="text-xs">Quality assurance protocols</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                    <span className="text-xs">Multi-annotator consensus</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                    <span className="text-xs">Active learning integration</span>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-green-500/15 to-green-500/5 border-l-4 border-green-500">
            <h4 className="font-bold text-green-600 mb-4 flex items-center gap-2">
              <span className="text-xl">🧪</span> Test Data & Training Sets
            </h4>
            <div className="space-y-4">
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <h5 className="font-semibold text-green-700 mb-3">Healthcare Training Data</h5>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-xs">De-identified patient conversations</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-xs">Treatment center documentation</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-xs">Regulatory compliance examples</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-xs">Multi-language healthcare terms</span>
                  </div>
                </div>
              </div>
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <h5 className="font-semibold text-green-700 mb-3">Test Data Requirements</h5>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-xs">HIPAA-compliant datasets</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-xs">Diverse demographic representation</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-xs">Edge case scenario coverage</span>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Model Usage & Integration */}
        <div className="bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-orange-500/10 rounded-xl p-6 border-2 border-indigo-500/20">
          <h4 className="text-xl font-bold mb-6 text-center">AI Model Integration & Usage Pipeline</h4>
          <div className="grid grid-cols-6 gap-3">
            <div className="text-center space-y-2">
              <div className="w-14 h-14 bg-blue-600 rounded-full flex items-center justify-center text-white text-xl mx-auto animate-pulse">📊</div>
              <p className="text-xs font-medium">Data Collection</p>
              <p className="text-xs text-muted-foreground">Gather training data</p>
            </div>
            <div className="text-center space-y-2">
              <div className="w-14 h-14 bg-orange-600 rounded-full flex items-center justify-center text-white text-xl mx-auto animate-pulse">🏷️</div>
              <p className="text-xs font-medium">Studio Labeling</p>
              <p className="text-xs text-muted-foreground">Annotate & classify</p>
            </div>
            <div className="text-center space-y-2">
              <div className="w-14 h-14 bg-purple-600 rounded-full flex items-center justify-center text-white text-xl mx-auto animate-pulse">👁️</div>
              <p className="text-xs font-medium">Vision Processing</p>
              <p className="text-xs text-muted-foreground">Image understanding</p>
            </div>
            <div className="text-center space-y-2">
              <div className="w-14 h-14 bg-green-600 rounded-full flex items-center justify-center text-white text-xl mx-auto animate-pulse">🧪</div>
              <p className="text-xs font-medium">Model Testing</p>
              <p className="text-xs text-muted-foreground">Validate performance</p>
            </div>
            <div className="text-center space-y-2">
              <div className="w-14 h-14 bg-indigo-600 rounded-full flex items-center justify-center text-white text-xl mx-auto animate-pulse">🚀</div>
              <p className="text-xs font-medium">Deploy Models</p>
              <p className="text-xs text-muted-foreground">Production ready</p>
            </div>
            <div className="text-center space-y-2">
              <div className="w-14 h-14 bg-emerald-600 rounded-full flex items-center justify-center text-white text-xl mx-auto animate-pulse">📈</div>
              <p className="text-xs font-medium">Monitor & Improve</p>
              <p className="text-xs text-muted-foreground">Continuous learning</p>
            </div>
          </div>
        </div>

        {/* Performance Metrics & Requirements */}
        <div className="grid grid-cols-3 gap-6">
          <Card className="p-6 bg-gradient-to-br from-indigo-500/15 to-indigo-500/5 border-l-4 border-indigo-500">
            <h4 className="font-bold text-indigo-600 mb-4 flex items-center gap-2">
              <span className="text-xl">📋</span> Data Requirements
            </h4>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-indigo-500 rounded-full"></div>
                <span className="text-sm">10K+ labeled healthcare interactions</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-indigo-500 rounded-full"></div>
                <span className="text-sm">5K+ medical document images</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-indigo-500 rounded-full"></div>
                <span className="text-sm">HIPAA-compliant anonymization</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-indigo-500 rounded-full"></div>
                <span className="text-sm">Multi-center validation sets</span>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-teal-500/15 to-teal-500/5 border-l-4 border-teal-500">
            <h4 className="font-bold text-teal-600 mb-4 flex items-center gap-2">
              <span className="text-xl">🎯</span> Model Performance
            </h4>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-teal-500 rounded-full"></div>
                <span className="text-sm">98% accuracy on medical NER</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-teal-500 rounded-full"></div>
                <span className="text-sm">95% vision model precision</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-teal-500 rounded-full"></div>
                <span className="text-sm">Sub-second inference time</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-teal-500 rounded-full"></div>
                <span className="text-sm">Multi-modal integration</span>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-rose-500/15 to-rose-500/5 border-l-4 border-rose-500">
            <h4 className="font-bold text-rose-600 mb-4 flex items-center gap-2">
              <span className="text-xl">🛡️</span> Security & Compliance
            </h4>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-rose-500 rounded-full"></div>
                <span className="text-sm">HIPAA-compliant processing</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-rose-500 rounded-full"></div>
                <span className="text-sm">End-to-end encryption</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-rose-500 rounded-full"></div>
                <span className="text-sm">Audit trail logging</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-rose-500 rounded-full"></div>
                <span className="text-sm">Data residency controls</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    ),
    animation: 'fade'
  },
    {
    title: "Real-Time Performance Analytics & Monitoring",
    subtitle: "Comprehensive Agent Performance Tracking & System Health Monitoring",
    content: (
      <div className="h-full overflow-y-auto space-y-6 animate-fade-in">
        <div className="grid grid-cols-2 gap-6">
          <Card className="p-6 bg-gradient-to-br from-green-500/20 to-green-500/5 border-green-500/20">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center text-white text-2xl">📊</div>
              <h3 className="text-xl font-bold text-green-600">Performance Metrics</h3>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/50 rounded-lg p-3 text-center">
                  <div className="text-2xl font-bold text-green-600">97.8%</div>
                  <div className="text-sm text-muted-foreground">Accuracy Rate</div>
                </div>
                <div className="bg-white/50 rounded-lg p-3 text-center">
                  <div className="text-2xl font-bold text-green-600">1.2s</div>
                  <div className="text-sm text-muted-foreground">Avg Response</div>
                </div>
                <div className="bg-white/50 rounded-lg p-3 text-center">
                  <div className="text-2xl font-bold text-green-600">99.9%</div>
                  <div className="text-sm text-muted-foreground">Uptime</div>
                </div>
                <div className="bg-white/50 rounded-lg p-3 text-center">
                  <div className="text-2xl font-bold text-green-600">24/7</div>
                  <div className="text-sm text-muted-foreground">Monitoring</div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm">Real-time alerts</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm">Predictive analytics</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm">Custom dashboards</span>
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-blue-500/20 to-blue-500/5 border-blue-500/20">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center text-white text-2xl">🔍</div>
              <h3 className="text-xl font-bold text-blue-600">System Health</h3>
            </div>
            <div className="space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm">CPU Usage</span>
                  <span className="text-sm font-medium">23%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-500 h-2 rounded-full" style={{width: '23%'}}></div>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm">Memory Usage</span>
                  <span className="text-sm font-medium">67%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-500 h-2 rounded-full" style={{width: '67%'}}></div>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm">API Response</span>
                  <span className="text-sm font-medium">98%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-green-500 h-2 rounded-full" style={{width: '98%'}}></div>
                </div>
              </div>
            </div>
          </Card>
        </div>
        
        <Card className="p-6 bg-gradient-to-br from-purple-500/20 to-purple-500/5 border-purple-500/20">
          <h3 className="text-xl font-bold text-purple-600 mb-4 flex items-center gap-2">
            <span className="text-2xl">📈</span> Continuous Improvement
          </h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-3xl mb-2">🎯</div>
              <h4 className="font-semibold">Auto-Optimization</h4>
              <p className="text-sm text-muted-foreground">ML-driven performance tuning</p>
            </div>
            <div className="text-center">
              <div className="text-3xl mb-2">📊</div>
              <h4 className="font-semibold">Usage Analytics</h4>
              <p className="text-sm text-muted-foreground">Detailed user behavior insights</p>
            </div>
            <div className="text-center">
              <div className="text-3xl mb-2">🔄</div>
              <h4 className="font-semibold">Auto-Updates</h4>
              <p className="text-sm text-muted-foreground">Seamless model improvements</p>
            </div>
          </div>
        </Card>
      </div>
    ),
    animation: 'fade'
  },
  {
    id: 13,
    title: "Scalability & Enterprise Integration",
    subtitle: "Enterprise-Grade Scaling, Multi-Tenant Architecture & System Integration",
    content: (
      <div className="h-full overflow-y-auto space-y-6 animate-slide-in-right">
        <div className="grid grid-cols-2 gap-6">
          <Card className="p-6 bg-gradient-to-br from-indigo-500/20 to-indigo-500/5 border-indigo-500/20">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-indigo-500 rounded-lg flex items-center justify-center text-white text-2xl">🏢</div>
              <h3 className="text-xl font-bold text-indigo-600">Enterprise Features</h3>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                <span className="text-sm">Multi-tenant architecture</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                <span className="text-sm">Horizontal auto-scaling</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                <span className="text-sm">Load balancing</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                <span className="text-sm">Global CDN deployment</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                <span className="text-sm">99.99% SLA guarantee</span>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-emerald-500/20 to-emerald-500/5 border-emerald-500/20">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-emerald-500 rounded-lg flex items-center justify-center text-white text-2xl">🔗</div>
              <h3 className="text-xl font-bold text-emerald-600">System Integration</h3>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                <span className="text-sm">EHR/EMR systems</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                <span className="text-sm">CRM platforms</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                <span className="text-sm">Billing systems</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                <span className="text-sm">Communication tools</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                <span className="text-sm">Analytics platforms</span>
              </div>
            </div>
          </Card>
        </div>

        <Card className="p-6 bg-gradient-to-br from-orange-500/20 to-orange-500/5 border-orange-500/20">
          <h3 className="text-xl font-bold text-orange-600 mb-6 flex items-center gap-2">
            <span className="text-2xl">📈</span> Scaling Capabilities
          </h3>
          <div className="grid grid-cols-4 gap-4">
            <div className="text-center bg-white/50 rounded-lg p-4">
              <div className="text-2xl font-bold text-orange-600">1K-1M+</div>
              <div className="text-sm text-muted-foreground">Users</div>
            </div>
            <div className="text-center bg-white/50 rounded-lg p-4">
              <div className="text-2xl font-bold text-orange-600">100K+</div>
              <div className="text-sm text-muted-foreground">Req/sec</div>
            </div>
            <div className="text-center bg-white/50 rounded-lg p-4">
              <div className="text-2xl font-bold text-orange-600">50+</div>
              <div className="text-sm text-muted-foreground">Regions</div>
            </div>
            <div className="text-center bg-white/50 rounded-lg p-4">
              <div className="text-2xl font-bold text-orange-600">24/7</div>
              <div className="text-sm text-muted-foreground">Support</div>
            </div>
          </div>
        </Card>
      </div>
    ),
    animation: 'slide'
  },
  {
    id: 14,
    title: "ROI & Business Impact Analysis",
    subtitle: "Quantified Results, Cost Savings & Business Value Metrics",
    content: (
      <div className="h-full overflow-y-auto space-y-6 animate-zoom-in">
        <div className="grid grid-cols-2 gap-6">
          <Card className="p-6 bg-gradient-to-br from-green-600/20 to-green-600/5 border-green-600/20">
            <div className="text-center mb-4">
              <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-white text-2xl">💰</span>
              </div>
              <h3 className="text-xl font-bold text-green-600">Cost Savings</h3>
            </div>
            <div className="space-y-4">
              <div className="bg-white/50 rounded-lg p-4 text-center">
                <div className="text-3xl font-bold text-green-600">67%</div>
                <div className="text-sm text-muted-foreground">Reduction in manual processing time</div>
              </div>
              <div className="bg-white/50 rounded-lg p-4 text-center">
                <div className="text-3xl font-bold text-green-600">$2.3M</div>
                <div className="text-sm text-muted-foreground">Annual operational savings</div>
              </div>
              <div className="bg-white/50 rounded-lg p-4 text-center">
                <div className="text-3xl font-bold text-green-600">3.2x</div>
                <div className="text-sm text-muted-foreground">ROI within 18 months</div>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-blue-600/20 to-blue-600/5 border-blue-600/20">
            <div className="text-center mb-4">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-white text-2xl">📊</span>
              </div>
              <h3 className="text-xl font-bold text-blue-600">Efficiency Gains</h3>
            </div>
            <div className="space-y-4">
              <div className="bg-white/50 rounded-lg p-4 text-center">
                <div className="text-3xl font-bold text-blue-600">85%</div>
                <div className="text-sm text-muted-foreground">Faster onboarding processes</div>
              </div>
              <div className="bg-white/50 rounded-lg p-4 text-center">
                <div className="text-3xl font-bold text-blue-600">92%</div>
                <div className="text-sm text-muted-foreground">Reduction in errors</div>
              </div>
              <div className="bg-white/50 rounded-lg p-4 text-center">
                <div className="text-3xl font-bold text-blue-600">78%</div>
                <div className="text-sm text-muted-foreground">Improved satisfaction</div>
              </div>
            </div>
          </Card>
        </div>

        <Card className="p-6 bg-gradient-to-br from-purple-600/20 to-purple-600/5 border-purple-600/20">
          <h3 className="text-xl font-bold text-purple-600 mb-6 flex items-center gap-2">
            <span className="text-2xl">🎯</span> Business Value Delivered
          </h3>
          <div className="grid grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-4xl mb-3">⚡</div>
              <h4 className="font-semibold text-purple-600">Speed</h4>
              <p className="text-sm text-muted-foreground">10x faster processing times with automated workflows</p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-3">🎯</div>
              <h4 className="font-semibold text-purple-600">Accuracy</h4>
              <p className="text-sm text-muted-foreground">99.2% accuracy in data processing and validation</p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-3">📈</div>
              <h4 className="font-semibold text-purple-600">Scale</h4>
              <p className="text-sm text-muted-foreground">Handle 50x more volume with same team size</p>
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-teal-600/20 to-teal-600/5 border-teal-600/20">
          <h3 className="text-xl font-bold text-teal-600 mb-4 flex items-center gap-2">
            <span className="text-2xl">💼</span> Implementation Timeline & ROI
          </h3>
          <div className="grid grid-cols-4 gap-4">
            <div className="text-center">
              <div className="font-bold text-teal-600">Week 1-2</div>
              <div className="text-sm text-muted-foreground">Initial setup & integration</div>
            </div>
            <div className="text-center">
              <div className="font-bold text-teal-600">Month 1-3</div>
              <div className="text-sm text-muted-foreground">Gradual deployment & training</div>
            </div>
            <div className="text-center">
              <div className="font-bold text-teal-600">Month 6</div>
              <div className="text-sm text-muted-foreground">Break-even point reached</div>
            </div>
            <div className="text-center">
              <div className="font-bold text-teal-600">Month 12+</div>
              <div className="text-sm text-muted-foreground">Full ROI realization</div>
            </div>
          </div>
        </Card>
      </div>
    ),
    animation: 'zoom'
  },
  {
    id: 15,
    title: "Implementation Roadmap & Next Steps",
    subtitle: "Strategic Deployment Plan for Treatment Center AI Implementation",
    content: (
      <div className="h-full overflow-y-auto space-y-6 animate-fade-in">
        <Card className="p-6 bg-gradient-to-br from-blue-600/20 to-blue-600/5 border-blue-600/20">
          <h3 className="text-2xl font-bold text-blue-600 mb-6 flex items-center gap-2">
            <span className="text-3xl">🗺️</span> Implementation Roadmap
          </h3>
          <div className="grid grid-cols-1 gap-4">
            <div className="bg-white/50 rounded-lg p-4 border-l-4 border-blue-500">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-sm">1</div>
                <h4 className="font-semibold">Discovery & Assessment (Week 1-2)</h4>
              </div>
              <p className="text-sm text-muted-foreground ml-11">Current system analysis, requirements gathering, and technical assessment</p>
            </div>
            
            <div className="bg-white/50 rounded-lg p-4 border-l-4 border-green-500">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white font-bold text-sm">2</div>
                <h4 className="font-semibold">Foundation Setup (Week 3-4)</h4>
              </div>
              <p className="text-sm text-muted-foreground ml-11">Infrastructure setup, security configuration, and initial integrations</p>
            </div>
            
            <div className="bg-white/50 rounded-lg p-4 border-l-4 border-orange-500">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-white font-bold text-sm">3</div>
                <h4 className="font-semibold">Agent Development (Month 2-3)</h4>
              </div>
              <p className="text-sm text-muted-foreground ml-11">Custom agent creation, training, and testing for your specific workflows</p>
            </div>
            
            <div className="bg-white/50 rounded-lg p-4 border-l-4 border-purple-500">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm">4</div>
                <h4 className="font-semibold">Deployment & Training (Month 4)</h4>
              </div>
              <p className="text-sm text-muted-foreground ml-11">Gradual rollout, staff training, and performance optimization</p>
            </div>
          </div>
        </Card>

        <div className="grid grid-cols-2 gap-6">
          <Card className="p-6 bg-gradient-to-br from-emerald-500/20 to-emerald-500/5 border-emerald-500/20">
            <h3 className="text-xl font-bold text-emerald-600 mb-4 flex items-center gap-2">
              <span className="text-2xl">✅</span> Immediate Actions
            </h3>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                <span className="text-sm">Schedule discovery call</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                <span className="text-sm">Technical requirements review</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                <span className="text-sm">Stakeholder alignment</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                <span className="text-sm">Pilot scope definition</span>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-amber-500/20 to-amber-500/5 border-amber-500/20">
            <h3 className="text-xl font-bold text-amber-600 mb-4 flex items-center gap-2">
              <span className="text-2xl">🎯</span> Success Metrics
            </h3>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                <span className="text-sm">50% reduction in processing time</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                <span className="text-sm">90% accuracy in automation</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                <span className="text-sm">User satisfaction &gt; 85%</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                <span className="text-sm">ROI positive within 6 months</span>
              </div>
            </div>
          </Card>
        </div>

        <Card className="p-6 bg-gradient-to-br from-indigo-600/20 to-indigo-600/5 border-indigo-600/20">
          <div className="text-center">
            <h3 className="text-2xl font-bold text-indigo-600 mb-4">Ready to Transform Your Treatment Center?</h3>
            <p className="text-lg text-muted-foreground mb-6">
              Join the future of healthcare automation with our proven AI agent platform
            </p>
            <div className="flex justify-center gap-4">
              <div className="bg-white/70 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-indigo-600">📞</div>
                <div className="text-sm font-medium">Schedule Demo</div>
              </div>
              <div className="bg-white/70 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-indigo-600">💼</div>
                <div className="text-sm font-medium">Start Pilot</div>
              </div>
              <div className="bg-white/70 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-indigo-600">🚀</div>
                <div className="text-sm font-medium">Full Deployment</div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    ),
    animation: 'fade'
  },
  {
    id: 16,
    title: "Contact & Support Information",
    subtitle: "Get Started with Your AI Implementation Journey",
    content: (
      <div className="h-full overflow-y-auto space-y-8 animate-slide-in-right">
        <div className="text-center space-y-6">
          <div className="w-32 h-32 mx-auto bg-gradient-to-br from-primary to-primary/60 rounded-full flex items-center justify-center">
            <div className="text-5xl">🚀</div>
          </div>
          <div>
            <h2 className="text-3xl font-bold text-primary mb-2">Ready to Get Started?</h2>
            <p className="text-xl text-muted-foreground">
              Transform your treatment center with AI-powered automation
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-8">
          <Card className="p-6 bg-gradient-to-br from-blue-500/20 to-blue-500/5 border-blue-500/20">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto">
                <span className="text-white text-2xl">📞</span>
              </div>
              <h3 className="text-xl font-bold text-blue-600">Schedule a Demo</h3>
              <p className="text-sm text-muted-foreground">
                See the platform in action with a personalized demonstration
              </p>
              <div className="space-y-2">
                <div className="bg-white/50 rounded-lg p-3">
                  <div className="font-medium">Available Times</div>
                  <div className="text-sm text-muted-foreground">Monday - Friday, 9 AM - 5 PM EST</div>
                </div>
                <div className="bg-white/50 rounded-lg p-3">
                  <div className="font-medium">Duration</div>
                  <div className="text-sm text-muted-foreground">30-45 minutes</div>
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-green-500/20 to-green-500/5 border-green-500/20">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto">
                <span className="text-white text-2xl">🎯</span>
              </div>
              <h3 className="text-xl font-bold text-green-600">Start a Pilot</h3>
              <p className="text-sm text-muted-foreground">
                Begin with a focused pilot project to prove value
              </p>
              <div className="space-y-2">
                <div className="bg-white/50 rounded-lg p-3">
                  <div className="font-medium">Pilot Duration</div>
                  <div className="text-sm text-muted-foreground">30-90 days</div>
                </div>
                <div className="bg-white/50 rounded-lg p-3">
                  <div className="font-medium">Limited Risk</div>
                  <div className="text-sm text-muted-foreground">Controlled scope & budget</div>
                </div>
              </div>
            </div>
          </Card>
        </div>

        <Card className="p-6 bg-gradient-to-br from-purple-500/20 to-purple-500/5 border-purple-500/20">
          <h3 className="text-xl font-bold text-purple-600 mb-6 flex items-center gap-2">
            <span className="text-2xl">📞</span> Contact Information
          </h3>
          <div className="grid grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl mb-2">📧</div>
              <h4 className="font-semibold">Email</h4>
              <p className="text-sm text-muted-foreground">contact@ai-platform.com</p>
            </div>
            <div className="text-center">
              <div className="text-3xl mb-2">📱</div>
              <h4 className="font-semibold">Phone</h4>
              <p className="text-sm text-muted-foreground">(555) 123-4567</p>
            </div>
            <div className="text-center">
              <div className="text-3xl mb-2">💬</div>
              <h4 className="font-semibold">Support</h4>
              <p className="text-sm text-muted-foreground">24/7 Live Chat</p>
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-orange-500/20 to-orange-500/5 border-orange-500/20">
          <h3 className="text-xl font-bold text-orange-600 mb-4 flex items-center gap-2">
            <span className="text-2xl">🎁</span> Special Launch Offer
          </h3>
          <div className="bg-white/50 rounded-lg p-6 text-center">
            <div className="text-2xl font-bold text-orange-600 mb-2">50% OFF</div>
            <div className="text-lg font-medium mb-2">Implementation Services</div>
            <div className="text-sm text-muted-foreground mb-4">
              For the first 20 treatment centers to sign up in Q1 2024
            </div>
            <div className="flex justify-center gap-4 text-sm">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                <span>Free setup & training</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                <span>3 months support included</span>
              </div>
            </div>
          </div>
        </Card>

        <div className="text-center space-y-4">
          <h3 className="text-2xl font-bold">Thank You!</h3>
          <p className="text-lg text-muted-foreground">
            Thank you for your time and interest in our AI automation platform.
          </p>
          <p className="text-sm text-muted-foreground">
            We look forward to helping you transform your treatment center operations.
          </p>
        </div>
      </div>
    ),
    animation: 'fade'
  }
];

export const AgenticAIPresentation: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const { exportHTML, exportPDF, exportPPT } = usePresentationExporter();

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % slides.length);
      }, 5000); // 5 seconds per slide
    }
    return () => clearInterval(interval);
  }, [isPlaying]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const resetPresentation = () => {
    setCurrentSlide(0);
    setIsPlaying(false);
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const downloadAsPDF = () => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      const css = `
        <style>
          @media print {
            body { margin: 0; padding: 20px; font-family: Arial, sans-serif; }
            .slide { page-break-after: always; padding: 40px; min-height: 90vh; }
            .slide:last-child { page-break-after: avoid; }
            .slide-title { font-size: 28px; font-weight: bold; margin-bottom: 10px; }
            .slide-subtitle { font-size: 18px; color: #666; margin-bottom: 30px; }
            .slide-content { font-size: 14px; line-height: 1.6; }
            .card { border: 1px solid #ddd; padding: 16px; margin: 16px 0; border-radius: 8px; }
            .badge { display: inline-block; padding: 4px 8px; background: #f0f0f0; border-radius: 4px; margin: 2px; }
            .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
            .grid-3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 20px; }
            .grid-4 { display: grid; grid-template-columns: 1fr 1fr 1fr 1fr; gap: 20px; }
            .space-y-4 > * + * { margin-top: 16px; }
            .space-y-6 > * + * { margin-top: 24px; }
            .text-center { text-align: center; }
            .font-bold { font-weight: bold; }
            .text-sm { font-size: 12px; }
            .text-xs { font-size: 10px; }
            .mb-4 { margin-bottom: 16px; }
            .mb-6 { margin-bottom: 24px; }
          }
        </style>
      `;
      
      const slidesHTML = slides.map((slide, index) => `
        <div class="slide">
          <div class="slide-title">Slide ${index + 1}: ${slide.title}</div>
          ${slide.subtitle ? `<div class="slide-subtitle">${slide.subtitle}</div>` : ''}
          <div class="slide-content">
            <p>Content summary: This slide covers ${slide.title.toLowerCase()}</p>
            <p>Key topics and features are presented in this section.</p>
          </div>
        </div>
      `).join('');

      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Agentic AI Presentation</title>
            ${css}
          </head>
          <body>
            <h1 style="text-align: center; margin-bottom: 40px;">Agentic AI & Automation Platform</h1>
            <p style="text-align: center; margin-bottom: 40px;">Complete AI Agent Implementation for Healthcare Onboarding</p>
            ${slidesHTML}
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
      }, 1000);
    }
  };

  const downloadAsHTML = () => {
    // Create a temporary container to render each slide's content
    const tempContainer = document.createElement('div');
    tempContainer.style.position = 'absolute';
    tempContainer.style.left = '-9999px';
    tempContainer.style.visibility = 'hidden';
    document.body.appendChild(tempContainer);

    const css = `
      <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background: #f5f5f5; }
        .presentation { max-width: 1200px; margin: 0 auto; }
        .slide { background: white; padding: 40px; margin: 20px 0; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); page-break-after: always; position: relative; min-height: 600px; }
        .slide-title { font-size: 28px; font-weight: bold; margin-bottom: 10px; color: #333; }
        .slide-subtitle { font-size: 18px; color: #666; margin-bottom: 30px; }
        .slide-content { font-size: 14px; line-height: 1.6; }
        .slide-number { position: absolute; top: 10px; right: 20px; background: #007acc; color: white; padding: 5px 10px; border-radius: 15px; font-size: 12px; }
        .header { text-align: center; margin-bottom: 40px; padding: 60px 0; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border-radius: 8px; }
        .header h1 { font-size: 36px; margin-bottom: 16px; }
        .header p { font-size: 20px; }
        .grid { display: grid; gap: 20px; margin: 20px 0; }
        .grid-cols-2 { grid-template-columns: repeat(2, 1fr); }
        .grid-cols-3 { grid-template-columns: repeat(3, 1fr); }
        .grid-cols-4 { grid-template-columns: repeat(4, 1fr); }
        .card { background: #f8f9fa; border: 1px solid #e9ecef; border-radius: 8px; padding: 20px; }
        .badge { display: inline-block; background: #e9ecef; color: #495057; padding: 4px 8px; border-radius: 4px; font-size: 12px; margin: 4px; }
        .text-center { text-align: center; }
        .font-bold { font-weight: bold; }
        .text-sm { font-size: 14px; }
        .text-xs { font-size: 12px; }
        .mb-2 { margin-bottom: 8px; }
        .mb-3 { margin-bottom: 12px; }
        .mb-4 { margin-bottom: 16px; }
        .space-y-2 > * + * { margin-top: 8px; }
        .space-y-3 > * + * { margin-top: 12px; }
        .space-y-4 > * + * { margin-top: 16px; }
        .space-y-6 > * + * { margin-top: 24px; }
        .flex { display: flex; }
        .items-center { align-items: center; }
        .gap-2 { gap: 8px; }
        .gap-3 { gap: 12px; }
        .w-3 { width: 12px; }
        .h-3 { height: 12px; }
        .rounded-full { border-radius: 50%; }
        .bg-blue-500 { background-color: #3b82f6; }
        .bg-green-500 { background-color: #22c55e; }
        .bg-purple-500 { background-color: #a855f7; }
        .bg-red-500 { background-color: #ef4444; }
        .bg-indigo-500 { background-color: #6366f1; }
        .bg-emerald-500 { background-color: #10b981; }
        .bg-rose-500 { background-color: #f43f5f; }
        .bg-orange-500 { background-color: #f97316; }
        .bg-teal-500 { background-color: #14b8a6; }
        .bg-yellow-500 { background-color: #eab308; }
        .text-blue-600 { color: #2563eb; }
        .text-green-600 { color: #16a34a; }
        .text-purple-600 { color: #9333ea; }
        .text-red-600 { color: #dc2626; }
        .text-indigo-600 { color: #4f46e5; }
        .text-emerald-600 { color: #059669; }
        .text-rose-600 { color: #e11d48; }
        .text-orange-600 { color: #ea580c; }
        .text-teal-600 { color: #0d9488; }
        .text-yellow-600 { color: #ca8a04; }
        .border-l-4 { border-left: 4px solid; }
        .border-blue-500 { border-color: #3b82f6; }
        .border-green-500 { border-color: #22c55e; }
        .border-purple-500 { border-color: #a855f7; }
        .border-red-500 { border-color: #ef4444; }
        .border-indigo-500 { border-color: #6366f1; }
        .border-emerald-500 { border-color: #10b981; }
        .border-rose-500 { border-color: #f43f5f; }
        .border-orange-500 { border-color: #f97316; }
        .border-teal-500 { border-color: #14b8a6; }
        .border-yellow-500 { border-color: #eab308; }
        .bg-gradient-to-br { background: linear-gradient(to bottom right, var(--tw-gradient-from), var(--tw-gradient-to)); }
        h2, h3, h4 { margin: 16px 0 8px 0; }
        ul, ol { margin: 12px 0; padding-left: 24px; }
        li { margin: 4px 0; }
        p { margin: 8px 0; }
        .text-muted-foreground { color: #6b7280; }
      </style>
    `;
    
    // Function to convert React content to HTML string
    const convertReactToHTML = (content: React.ReactNode): string => {
      if (!content) return '';
      
      // Create a temporary div and render the content as string representation
      const div = document.createElement('div');
      
      // For complex React content, we'll extract meaningful content
      // This is a simplified conversion - in a real app you'd use react-dom/server
      const contentStr = content.toString();
      
      // Try to extract basic structure and content from the React element
      if (typeof content === 'object' && content && 'props' in content) {
        // This is a very basic HTML conversion - normally you'd use renderToString
        return `<div class="slide-content-rendered">
          <p><em>Complex interactive content rendered from React components</em></p>
          <p>This slide contains rich interactive elements including cards, grids, animations, and dynamic content that enhance the presentation experience.</p>
        </div>`;
      }
      
      return '<div class="slide-content-rendered"><p>Interactive slide content</p></div>';
    };
    
    const slidesHTML = slides.map((slide, index) => {
      const contentHTML = convertReactToHTML(slide.content);
      
      return `
        <div class="slide">
          <div class="slide-number">Slide ${index + 1} of ${slides.length}</div>
          <div class="slide-title">${slide.title}</div>
          ${slide.subtitle ? `<div class="slide-subtitle">${slide.subtitle}</div>` : ''}
          <div class="slide-content">
            ${contentHTML}
            <hr style="margin: 20px 0; border: 1px solid #e9ecef;">
            <p><strong>Slide Overview:</strong> ${slide.title}</p>
            ${slide.subtitle ? `<p><strong>Focus Area:</strong> ${slide.subtitle}</p>` : ''}
            <p><strong>Content Type:</strong> Interactive presentation content with visual elements, cards, and structured information.</p>
            <p><strong>Key Benefits:</strong> This slide provides comprehensive insights into ${slide.title.toLowerCase()}, including detailed explanations, visual demonstrations, and practical implementation guidance for healthcare onboarding automation.</p>
          </div>
        </div>
      `;
    }).join('');

    const fullHTML = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Agentic AI Presentation - Complete Export (${slides.length} Slides)</title>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          ${css}
        </head>
        <body>
          <div class="presentation">
            <div class="header">
              <h1>Agentic AI & Automation Platform</h1>
              <p>Complete AI Agent Implementation for Healthcare Onboarding</p>
              <p><strong>Total Slides: ${slides.length}</strong></p>
              <p>Comprehensive presentation covering all aspects of AI agent architecture, implementation, and healthcare automation</p>
            </div>
            ${slidesHTML}
            <div style="text-align: center; margin-top: 40px; padding: 20px; background: #f8f9fa; border-radius: 8px;">
              <p><strong>End of Presentation</strong></p>
              <p>This HTML export contains all ${slides.length} slides from the Agentic AI Presentation</p>
              <p>Generated on: ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}</p>
            </div>
          </div>
        </body>
      </html>
    `;

    // Clean up temporary container
    document.body.removeChild(tempContainer);

    const blob = new Blob([fullHTML], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `agentic-ai-presentation-${slides.length}-slides.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const containerClass = isFullscreen 
    ? "fixed inset-0 z-50 bg-background" 
    : "w-full max-w-6xl mx-auto";

  return (
    <div className={containerClass} data-presentation-content data-current-slide={currentSlide}>
      {/* Slide Navigation Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-4">
          <Badge variant="secondary">{currentSlide + 1} / {slides.length}</Badge>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => exportHTML(slides, setCurrentSlide)}>
            <Download className="w-4 h-4 mr-2" />
            HTML
          </Button>
          <Button variant="outline" size="sm" onClick={() => exportPDF(slides, setCurrentSlide)}>
            <FileText className="w-4 h-4 mr-2" />
            PDF
          </Button>
          <Button variant="outline" size="sm" onClick={() => exportPPT(slides, setCurrentSlide)}>
            <Presentation className="w-4 h-4 mr-2" />
            PPT
          </Button>
          <Button variant="outline" size="sm" onClick={resetPresentation}>
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsPlaying(!isPlaying)}
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </Button>
          <Button variant="outline" size="sm" onClick={toggleFullscreen}>
            <Maximize2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Slide Container */}
      <div className={`relative ${isFullscreen ? 'h-[calc(100vh-140px)]' : 'h-[700px]'}`}>
        <div
          key={currentSlide}
          className="absolute inset-0 p-6 flex flex-col transition-opacity duration-500 overflow-y-auto"
          data-slide-content
          data-slide-index={currentSlide}
        >
          <div className="text-center mb-6 flex-shrink-0">
            <h1 className="text-3xl lg:text-4xl font-bold text-primary mb-2">
              {slides[currentSlide].title}
            </h1>
            {slides[currentSlide].subtitle && (
              <p className="text-lg lg:text-xl text-muted-foreground">
                {slides[currentSlide].subtitle}
              </p>
            )}
          </div>
          
          <div className="flex-1 min-h-0">
            {slides[currentSlide].content}
          </div>
        </div>
      </div>

      {/* Navigation Controls */}
      <div className="flex items-center justify-between p-4 border-t">
        <Button variant="outline" onClick={prevSlide} disabled={currentSlide === 0}>
          <ChevronLeft className="w-4 h-4 mr-2" />
          Previous
        </Button>
        
        <div className="flex gap-2">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              data-slide-index={index}
              className={`w-3 h-3 rounded-full transition-colors ${
                index === currentSlide 
                  ? 'bg-primary' 
                  : 'bg-muted hover:bg-muted-foreground/20'
              }`}
            />
          ))}
        </div>
        
        <Button variant="outline" onClick={nextSlide} disabled={currentSlide === slides.length - 1}>
          Next
          <ChevronRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
};