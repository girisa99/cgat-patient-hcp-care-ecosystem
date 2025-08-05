import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight, Play, Pause, RotateCcw, Maximize2 } from 'lucide-react';
import { cn } from '@/lib/utils';

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
    title: "Agentic AI & Automation Platform",
    subtitle: "Complete AI Agent Implementation for Healthcare Onboarding",
    content: (
      <div className="text-center space-y-8 animate-fade-in">
        <div className="w-32 h-32 mx-auto bg-gradient-to-br from-primary to-primary/60 rounded-full flex items-center justify-center animate-pulse">
          <div className="text-4xl">🤖</div>
        </div>
        <div className="space-y-4">
          <p className="text-xl text-muted-foreground">
            End-to-end AI agent platform with MCP, RAG, and intelligent automation
          </p>
          <div className="flex justify-center gap-4 flex-wrap">
            <Badge variant="secondary" className="px-4 py-2">MCP Integration</Badge>
            <Badge variant="secondary" className="px-4 py-2">RAG Knowledge Base</Badge>
            <Badge variant="secondary" className="px-4 py-2">Small Language Models</Badge>
            <Badge variant="secondary" className="px-4 py-2">Channel Deployment</Badge>
            <Badge variant="secondary" className="px-4 py-2">AI Autosuggest</Badge>
          </div>
          <div className="grid grid-cols-3 gap-4 mt-6 max-w-2xl mx-auto">
            <Card className="p-3 bg-gradient-to-br from-primary/10 to-primary/5">
              <div className="text-sm font-semibold">🔗 MCP Protocol</div>
              <div className="text-xs text-muted-foreground">Model Context Protocol</div>
            </Card>
            <Card className="p-3 bg-gradient-to-br from-secondary/10 to-secondary/5">
              <div className="text-sm font-semibold">🧠 RAG System</div>
              <div className="text-xs text-muted-foreground">Knowledge Retrieval</div>
            </Card>
            <Card className="p-3 bg-gradient-to-br from-accent/10 to-accent/5">
              <div className="text-sm font-semibold">🚀 Auto-Deploy</div>
              <div className="text-xs text-muted-foreground">Multi-Channel</div>
            </Card>
          </div>
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
    title: "Step 3: Actions Configuration",
    subtitle: "Define Your Agent's Capabilities and Integrations",
    content: (
      <div className="h-full overflow-y-auto space-y-6 animate-slide-in-right">
        <div className="text-center mb-6">
          <div className="w-24 h-24 bg-gradient-to-br from-green-600 to-green-700 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-white text-3xl">⚙️</span>
          </div>
          <h3 className="text-2xl font-bold text-green-600">Actions Configuration</h3>
          <p className="text-muted-foreground">Set up your agent's core functionality and system integrations</p>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-4">
            <Card className="p-6 bg-gradient-to-br from-green-500/15 to-green-500/5 border-l-4 border-green-500">
              <h4 className="font-bold text-green-600 mb-4 flex items-center gap-2">
                <span className="text-xl">🔧</span> Core Actions
              </h4>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-sm">Patient data processing</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-sm">Onboarding workflows</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-sm">Document generation</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-sm">Notification systems</span>
                </div>
              </div>
            </Card>

            <Card className="p-6 bg-gradient-to-br from-blue-500/15 to-blue-500/5 border-l-4 border-blue-500">
              <h4 className="font-bold text-blue-600 mb-4 flex items-center gap-2">
                <span className="text-xl">🔗</span> System Connectors
              </h4>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span className="text-sm">Electronic Health Records</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span className="text-sm">Payment processing systems</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span className="text-sm">Communication platforms</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span className="text-sm">Third-party APIs</span>
                </div>
              </div>
            </Card>
          </div>

          <div className="space-y-4">
            <Card className="p-6 bg-gradient-to-br from-purple-500/15 to-purple-500/5 border-l-4 border-purple-500">
              <h4 className="font-bold text-purple-600 mb-4 flex items-center gap-2">
                <span className="text-xl">🧠</span> Knowledge Base Setup
              </h4>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                  <span className="text-sm">Document upload and processing</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                  <span className="text-sm">Vector embeddings creation</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                  <span className="text-sm">RAG system configuration</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                  <span className="text-sm">Semantic search optimization</span>
                </div>
              </div>
            </Card>

            <Card className="p-6 bg-gradient-to-br from-orange-500/15 to-orange-500/5 border-l-4 border-orange-500">
              <h4 className="font-bold text-orange-600 mb-4 flex items-center gap-2">
                <span className="text-xl">📋</span> Templates & Workflows
              </h4>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                  <span className="text-sm">Pre-built healthcare templates</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                  <span className="text-sm">Custom workflow builder</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                  <span className="text-sm">Conditional logic setup</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                  <span className="text-sm">Approval workflows</span>
                </div>
              </div>
            </Card>
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-500/10 to-blue-500/10 rounded-xl p-6 border-2 border-green-500/20">
          <h4 className="text-xl font-bold mb-4 text-center">Configuration Flow</h4>
          <div className="flex items-center justify-between">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center text-white font-bold">1</div>
              <p className="text-sm font-medium">Define Actions</p>
            </div>
            <div className="text-2xl text-green-600">→</div>
            <div className="text-center space-y-2">
              <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">2</div>
              <p className="text-sm font-medium">Connect Systems</p>
            </div>
            <div className="text-2xl text-blue-600">→</div>
            <div className="text-center space-y-2">
              <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold">3</div>
              <p className="text-sm font-medium">Setup Knowledge</p>
            </div>
            <div className="text-2xl text-purple-600">→</div>
            <div className="text-center space-y-2">
              <div className="w-12 h-12 bg-orange-600 rounded-full flex items-center justify-center text-white font-bold">✓</div>
              <p className="text-sm font-medium">Ready for AI</p>
            </div>
          </div>
        </div>
      </div>
    ),
    animation: 'slide'
  },
  {
    id: 7,
    title: "Step 4: AI Assignment & Model Selection",
    subtitle: "Intelligent Model Assignment with Manual Override Options",
    content: (
      <div className="h-full overflow-y-auto space-y-6 animate-slide-in-right">
        <div className="text-center mb-6">
          <div className="w-24 h-24 bg-gradient-to-br from-orange-600 to-orange-700 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-white text-3xl">🤖</span>
          </div>
          <h3 className="text-2xl font-bold text-orange-600">AI Assignment</h3>
          <p className="text-muted-foreground">Intelligent model selection and task assignment configuration</p>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <Card className="p-6 bg-gradient-to-br from-orange-500/15 to-orange-500/5 border-l-4 border-orange-500">
            <h4 className="font-bold text-orange-600 mb-4 flex items-center gap-2">
              <span className="text-xl">🧠</span> Auto-Suggest AI Models
            </h4>
            <div className="space-y-4">
              <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                <h5 className="font-semibold text-orange-700 mb-2">Intelligent Selection</h5>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                    <span className="text-sm">Analyzes your agent's requirements</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                    <span className="text-sm">Suggests optimal model combinations</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                    <span className="text-sm">Considers performance and cost</span>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <Badge className="bg-orange-100 text-orange-700">Small LLMs for Speed</Badge>
                <Badge className="bg-orange-100 text-orange-700">Large LLMs for Complex Tasks</Badge>
                <Badge className="bg-orange-100 text-orange-700">Specialized Models for Domain Tasks</Badge>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-blue-500/15 to-blue-500/5 border-l-4 border-blue-500">
            <h4 className="font-bold text-blue-600 mb-4 flex items-center gap-2">
              <span className="text-xl">⚙️</span> Manual Override Options
            </h4>
            <div className="space-y-4">
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <h5 className="font-semibold text-blue-700 mb-2">Full Control</h5>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-sm">Override AI suggestions</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-sm">Custom model selection</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-sm">Fine-tune parameters</span>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <Badge className="bg-blue-100 text-blue-700">Expert Mode</Badge>
                <Badge className="bg-blue-100 text-blue-700">Custom Configurations</Badge>
                <Badge className="bg-blue-100 text-blue-700">Advanced Settings</Badge>
              </div>
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <Card className="p-6 bg-gradient-to-br from-purple-500/15 to-purple-500/5 border-l-4 border-purple-500">
            <h4 className="font-bold text-purple-600 mb-4 flex items-center gap-2">
              <span className="text-xl">📋</span> Task Assignment Strategy
            </h4>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                <span className="text-sm">Role-based task distribution</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                <span className="text-sm">Workload balancing algorithms</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                <span className="text-sm">Priority-based assignment</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                <span className="text-sm">Automated escalation rules</span>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-green-500/15 to-green-500/5 border-l-4 border-green-500">
            <h4 className="font-bold text-green-600 mb-4 flex items-center gap-2">
              <span className="text-xl">🎯</span> Performance Optimization
            </h4>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm">Real-time performance monitoring</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm">Adaptive model switching</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm">Cost optimization algorithms</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm">Quality assurance metrics</span>
              </div>
            </div>
          </Card>
        </div>

        <div className="bg-gradient-to-r from-orange-500/10 to-purple-500/10 rounded-xl p-6 border-2 border-orange-500/20">
          <h4 className="text-xl font-bold mb-4 text-center">AI Assignment Process</h4>
          <div className="flex items-center justify-between">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 bg-orange-600 rounded-full flex items-center justify-center text-white font-bold">🔍</div>
              <p className="text-sm font-medium">Analyze Requirements</p>
            </div>
            <div className="text-2xl text-orange-600">→</div>
            <div className="text-center space-y-2">
              <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">🤖</div>
              <p className="text-sm font-medium">AI Suggestions</p>
            </div>
            <div className="text-2xl text-blue-600">→</div>
            <div className="text-center space-y-2">
              <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold">⚙️</div>
              <p className="text-sm font-medium">Manual Override</p>
            </div>
            <div className="text-2xl text-purple-600">→</div>
            <div className="text-center space-y-2">
              <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center text-white font-bold">✓</div>
              <p className="text-sm font-medium">Optimized Setup</p>
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
];

export const AgenticAIPresentation: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

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

  const containerClass = isFullscreen 
    ? "fixed inset-0 z-50 bg-background" 
    : "w-full max-w-6xl mx-auto";

  return (
    <div className={containerClass}>
      {/* Presentation Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-bold text-primary">Agentic AI Presentation</h2>
          <Badge variant="secondary">{currentSlide + 1} / {slides.length}</Badge>
        </div>
        
        <div className="flex items-center gap-2">
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