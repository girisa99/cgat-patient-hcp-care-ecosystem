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
    subtitle: "Complete AI agent automation platform for treatment center onboarding and AI implementation",
    content: (
      <div className="h-full overflow-y-auto space-y-8 animate-fade-in">
        <div className="text-center space-y-6">
          <div className="relative">
            <div className="w-40 h-40 mx-auto bg-gradient-to-br from-primary via-blue-500 to-purple-600 rounded-full flex items-center justify-center animate-pulse shadow-2xl">
              <div className="text-6xl">🤖</div>
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center animate-bounce">
                <div className="w-3 h-3 bg-white rounded-full"></div>
              </div>
            </div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-60 h-60 bg-primary/10 rounded-full -z-10 animate-ping"></div>
          </div>
          <div className="space-y-6">
            <h3 className="text-2xl font-bold text-primary animate-fade-in delay-200">
              Revolutionary AI Platform for Healthcare
            </h3>
            <p className="text-lg text-muted-foreground max-w-4xl mx-auto leading-relaxed animate-fade-in delay-300">
              Transform your treatment center with our comprehensive 21-slide AI automation platform featuring 
              advanced AI agent technology, autonomous decision-making, intelligent workflow automation, 
              and seamless integration with existing healthcare systems.
            </p>
            <div className="grid grid-cols-3 gap-6 mt-8 animate-fade-in delay-500">
              <div className="bg-card p-4 rounded-lg border shadow-sm hover:shadow-md transition-shadow">
                <div className="text-2xl mb-2">⚡</div>
                <div className="font-semibold">Lightning Fast</div>
                <div className="text-sm text-muted-foreground">95% faster deployment</div>
              </div>
              <div className="bg-card p-4 rounded-lg border shadow-sm hover:shadow-md transition-shadow">
                <div className="text-2xl mb-2">🔒</div>
                <div className="font-semibold">HIPAA Compliant</div>
                <div className="text-sm text-muted-foreground">Enterprise security</div>
              </div>
              <div className="bg-card p-4 rounded-lg border shadow-sm hover:shadow-md transition-shadow">
                <div className="text-2xl mb-2">📈</div>
                <div className="font-semibold">400% ROI</div>
                <div className="text-sm text-muted-foreground">Proven results</div>
              </div>
            </div>
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
      <div className="h-full overflow-y-auto space-y-8 animate-fade-in">
        <div className="grid grid-cols-4 gap-6">
          <Card className="p-6 bg-gradient-to-br from-blue-500/20 to-blue-500/5 border-2 border-blue-500/30 hover:scale-105 transition-transform animate-fade-in delay-100">
            <div className="text-3xl mb-3">🎨</div>
            <h4 className="font-bold text-blue-700 text-base mb-3">Frontend Layer</h4>
            <p className="text-sm text-muted-foreground mb-3">Visual Agent Builder</p>
            <ul className="text-xs space-y-1">
              <li>• Drag & Drop Interface</li>
              <li>• Component Library</li>
              <li>• Real-time Preview</li>
              <li>• Custom Branding</li>
            </ul>
          </Card>
          <Card className="p-6 bg-gradient-to-br from-green-500/20 to-green-500/5 border-2 border-green-500/30 hover:scale-105 transition-transform animate-fade-in delay-200">
            <div className="text-3xl mb-3">🔗</div>
            <h4 className="font-bold text-green-700 text-base mb-3">Protocol Layer</h4>
            <p className="text-sm text-muted-foreground mb-3">MCP Integration Hub</p>
            <ul className="text-xs space-y-1">
              <li>• Model Communication</li>
              <li>• Context Sharing</li>
              <li>• Session Management</li>
              <li>• API Gateway</li>
            </ul>
          </Card>
          <Card className="p-6 bg-gradient-to-br from-purple-500/20 to-purple-500/5 border-2 border-purple-500/30 hover:scale-105 transition-transform animate-fade-in delay-300">
            <div className="text-3xl mb-3">🧠</div>
            <h4 className="font-bold text-purple-700 text-base mb-3">AI Processing</h4>
            <p className="text-sm text-muted-foreground mb-3">Small LLMs + RAG</p>
            <ul className="text-xs space-y-1">
              <li>• Multi-Model Inference</li>
              <li>• Vector Search</li>
              <li>• Knowledge Retrieval</li>
              <li>• Context Enhancement</li>
            </ul>
          </Card>
          <Card className="p-6 bg-gradient-to-br from-orange-500/20 to-orange-500/5 border-2 border-orange-500/30 hover:scale-105 transition-transform animate-fade-in delay-400">
            <div className="text-3xl mb-3">💾</div>
            <h4 className="font-bold text-orange-700 text-base mb-3">Data Layer</h4>
            <p className="text-sm text-muted-foreground mb-3">Supabase + Vector DB</p>
            <ul className="text-xs space-y-1">
              <li>• Real-time Database</li>
              <li>• Vector Embeddings</li>
              <li>• Authentication</li>
              <li>• Edge Functions</li>
            </ul>
          </Card>
        </div>
        <div className="mt-8 text-center animate-fade-in delay-500">
          <div className="flex justify-center items-center space-x-4">
            <div className="flex-1 h-0.5 bg-gradient-to-r from-transparent to-blue-500"></div>
            <div className="text-sm font-medium text-muted-foreground">Data Flow</div>
            <div className="flex-1 h-0.5 bg-gradient-to-l from-transparent to-orange-500"></div>
          </div>
          <div className="mt-4 flex justify-center space-x-8">
            <div className="text-xs text-center">
              <div className="w-3 h-3 bg-blue-500 rounded-full mx-auto mb-1 animate-pulse"></div>
              <span>User Input</span>
            </div>
            <div className="text-xs text-center">
              <div className="w-3 h-3 bg-green-500 rounded-full mx-auto mb-1 animate-pulse delay-100"></div>
              <span>Processing</span>
            </div>
            <div className="text-xs text-center">
              <div className="w-3 h-3 bg-purple-500 rounded-full mx-auto mb-1 animate-pulse delay-200"></div>
              <span>AI Analysis</span>
            </div>
            <div className="text-xs text-center">
              <div className="w-3 h-3 bg-orange-500 rounded-full mx-auto mb-1 animate-pulse delay-300"></div>
              <span>Response</span>
            </div>
          </div>
        </div>
      </div>
    ),
    animation: 'slide'
  },
  {
    id: 3,
    title: "Agent Creation Journey Overview",
    subtitle: "5-Step Process for Building AI Agents",
    content: (
      <div className="h-full overflow-y-auto space-y-8 animate-fade-in">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full">
            <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
            <span className="text-sm font-medium">Complete Implementation Journey</span>
          </div>
        </div>
        
        <div className="relative">
          {/* Progress Line */}
          <div className="absolute top-8 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500 via-green-500 via-purple-500 via-orange-500 to-red-500 animate-fade-in delay-200"></div>
          
          <div className="grid grid-cols-5 gap-4">
            {[
              { step: 1, title: "Wizard Setup", icon: "🧙‍♂️", color: "blue", description: "Initial Configuration" },
              { step: 2, title: "Canvas Design", icon: "🎨", color: "green", description: "Visual Interface" },
              { step: 3, title: "Actions Config", icon: "⚙️", color: "purple", description: "System Integration" },
              { step: 4, title: "AI Assignment", icon: "🤖", color: "orange", description: "Model Selection" },
              { step: 5, title: "Multi-Channel", icon: "📡", color: "red", description: "Deployment" }
            ].map((item, index) => (
              <Card key={item.step} className={`p-6 text-center hover:scale-105 transition-all duration-300 animate-fade-in border-2 bg-gradient-to-br from-${item.color}-500/10 to-${item.color}-500/5 border-${item.color}-500/30`} style={{animationDelay: `${100 * index}ms`}}>
                <div className={`w-16 h-16 bg-gradient-to-br from-${item.color}-500 to-${item.color}-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg`}>
                  <span className="text-2xl">{item.icon}</span>
                </div>
                <div className="text-lg font-bold text-primary mb-2">{item.title}</div>
                <div className="text-xs text-muted-foreground mb-3">{item.description}</div>
                <div className={`w-8 h-8 bg-${item.color}-500 rounded-full flex items-center justify-center mx-auto`}>
                  <span className="text-white text-sm font-bold">{item.step}</span>
                </div>
              </Card>
            ))}
          </div>
        </div>
        
        <div className="text-center mt-8 animate-fade-in delay-500">
          <div className="bg-card p-6 rounded-lg border shadow-sm">
            <h3 className="text-xl font-bold mb-3 text-primary">Complete Journey Time</h3>
            <div className="flex justify-center items-center gap-8">
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">15</div>
                <div className="text-sm text-muted-foreground">Minutes Setup</div>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">95%</div>
                <div className="text-sm text-muted-foreground">Success Rate</div>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600">24/7</div>
                <div className="text-sm text-muted-foreground">Support</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    ),
    animation: 'zoom'
  },
  {
    id: 4,
    title: "Step 1: Wizard Setup & Initial Configuration",
    subtitle: "Getting Started with Agent Creation",
    content: (
      <div className="h-full overflow-y-auto space-y-6 animate-fade-in">
        <Card className="p-6">
          <h3 className="text-xl font-bold mb-4">Initial Configuration Wizard</h3>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span>Agent name and description setup</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span>Template selection and customization</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span>Initial configuration parameters</span>
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
    subtitle: "Creating the Visual Interface",
    content: (
      <div className="h-full overflow-y-auto space-y-6 animate-fade-in">
        <Card className="p-6">
          <h3 className="text-xl font-bold mb-4">Visual Design System</h3>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-2">Canvas Features</h4>
              <ul className="space-y-2 text-sm">
                <li>• Drag-and-drop interface</li>
                <li>• Component library</li>
                <li>• Real-time preview</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Branding Options</h4>
              <ul className="space-y-2 text-sm">
                <li>• Custom colors and themes</li>
                <li>• Logo integration</li>
                <li>• Typography selection</li>
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
    title: "Step 3: Actions Configuration & System Integration",
    subtitle: "Connecting to Backend Systems",
    content: (
      <div className="h-full overflow-y-auto space-y-6 animate-fade-in">
        <Card className="p-6">
          <h3 className="text-xl font-bold mb-4">System Integration Setup</h3>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span>API endpoint configuration</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span>Database connections</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span>Authentication setup</span>
            </div>
          </div>
        </Card>
      </div>
    ),
    animation: 'zoom'
  },
  {
    id: 7,
    title: "Step 4: AI Assignment, Task Execution & Multi-Channel Deployment",
    subtitle: "Comprehensive AI Model Configuration & Advanced Task Orchestration",
    content: (
      <div className="h-full overflow-y-auto space-y-8 animate-fade-in">
        <div className="grid grid-cols-2 gap-8">
          <Card className="p-6 bg-gradient-to-br from-indigo-500/20 to-indigo-500/5 border-2 border-indigo-500/30 hover:scale-105 transition-transform animate-fade-in">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg animate-pulse">
                <span className="text-2xl">🤖</span>
              </div>
              <h3 className="text-xl font-bold text-indigo-700 mb-3">AI Model Assignment</h3>
            </div>
            <div className="space-y-4">
              <div className="p-4 bg-card rounded-lg border">
                <h4 className="font-semibold text-primary mb-2">🧠 Small Language Models</h4>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>• Llama 3.1 8B Instruct</li>
                  <li>• Phi-3 Mini for efficiency</li>
                  <li>• Gemma 2B for quick responses</li>
                  <li>• Custom fine-tuned models</li>
                </ul>
              </div>
              <div className="p-4 bg-card rounded-lg border">
                <h4 className="font-semibold text-primary mb-2">👁️ Vision & Multimodal</h4>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>• GPT-4V for image analysis</li>
                  <li>• CLIP for visual understanding</li>
                  <li>• OCR integration</li>
                  <li>• Document processing</li>
                </ul>
              </div>
              <div className="p-4 bg-card rounded-lg border">
                <h4 className="font-semibold text-primary mb-2">🎯 Specialized Models</h4>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>• Healthcare domain models</li>
                  <li>• Sentiment analysis</li>
                  <li>• Classification systems</li>
                  <li>• Custom embeddings</li>
                </ul>
              </div>
            </div>
          </Card>
          
          <Card className="p-6 bg-gradient-to-br from-emerald-500/20 to-emerald-500/5 border-2 border-emerald-500/30 hover:scale-105 transition-transform animate-fade-in delay-200">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg animate-pulse">
                <span className="text-2xl">⚙️</span>
              </div>
              <h3 className="text-xl font-bold text-emerald-700 mb-3">Task Execution Engine</h3>
            </div>
            <div className="space-y-4">
              <div className="p-4 bg-card rounded-lg border">
                <h4 className="font-semibold text-primary mb-2">🔄 Workflow Automation</h4>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>• Multi-step processes</li>
                  <li>• Conditional branching</li>
                  <li>• Error handling & retry</li>
                  <li>• Performance monitoring</li>
                </ul>
              </div>
              <div className="p-4 bg-card rounded-lg border">
                <h4 className="font-semibold text-primary mb-2">🎯 Decision Trees</h4>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>• Dynamic routing logic</li>
                  <li>• Context-aware responses</li>
                  <li>• Escalation protocols</li>
                  <li>• Learning algorithms</li>
                </ul>
              </div>
              <div className="p-4 bg-card rounded-lg border">
                <h4 className="font-semibold text-primary mb-2">📝 Response Generation</h4>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>• Template-based responses</li>
                  <li>• Dynamic content creation</li>
                  <li>• Personalization engine</li>
                  <li>• Multi-language support</li>
                </ul>
              </div>
            </div>
          </Card>
        </div>
        
        <div className="mt-8 text-center animate-fade-in delay-400">
          <div className="bg-gradient-to-r from-indigo-500/10 via-emerald-500/10 to-purple-500/10 p-6 rounded-lg border">
            <h3 className="text-xl font-bold mb-4 text-primary">Advanced Task Orchestration</h3>
            <div className="grid grid-cols-4 gap-4">
              <div className="text-center">
                <div className="w-12 h-12 bg-indigo-500 rounded-full flex items-center justify-center mx-auto mb-2 shadow-lg animate-bounce">
                  <span className="text-white text-lg">⚡</span>
                </div>
                <div className="text-sm font-semibold">Real-time Processing</div>
                <div className="text-xs text-muted-foreground">< 200ms response</div>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-2 shadow-lg animate-bounce delay-100">
                  <span className="text-white text-lg">🔄</span>
                </div>
                <div className="text-sm font-semibold">Auto-scaling</div>
                <div className="text-xs text-muted-foreground">Dynamic resource allocation</div>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-2 shadow-lg animate-bounce delay-200">
                  <span className="text-white text-lg">📊</span>
                </div>
                <div className="text-sm font-semibold">Analytics</div>
                <div className="text-xs text-muted-foreground">Performance insights</div>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-2 shadow-lg animate-bounce delay-300">
                  <span className="text-white text-lg">🛡️</span>
                </div>
                <div className="text-sm font-semibold">Security</div>
                <div className="text-xs text-muted-foreground">Enterprise-grade</div>
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
    title: "Step 5: Multi-Channel Deployment & Platform Integration",
    subtitle: "Seamless Deployment Across All Communication Channels",
    content: (
      <div className="h-full overflow-y-auto space-y-8 animate-fade-in">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500/20 to-purple-500/20 px-6 py-3 rounded-full border border-blue-500/30">
            <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
            <span className="text-lg font-semibold">Multi-Channel Deployment Hub</span>
            <div className="w-3 h-3 bg-purple-500 rounded-full animate-pulse delay-100"></div>
          </div>
        </div>
        
        <div className="grid grid-cols-4 gap-6">
          <Card className="p-6 bg-gradient-to-br from-blue-500/20 to-blue-500/5 border-2 border-blue-500/30 hover:scale-105 transition-all duration-300 animate-fade-in">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg animate-pulse">
                <span className="text-2xl">💬</span>
              </div>
              <h4 className="font-bold text-blue-700 mb-3">Chat Platforms</h4>
              <div className="space-y-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>WhatsApp Business</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Facebook Messenger</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Telegram Bot API</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Slack Integration</span>
                </div>
              </div>
            </div>
          </Card>
          
          <Card className="p-6 bg-gradient-to-br from-green-500/20 to-green-500/5 border-2 border-green-500/30 hover:scale-105 transition-all duration-300 animate-fade-in delay-100">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg animate-pulse">
                <span className="text-2xl">📱</span>
              </div>
              <h4 className="font-bold text-green-700 mb-3">Mobile Apps</h4>
              <div className="space-y-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>iOS Native App</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Android Native App</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>React Native PWA</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Flutter Widget</span>
                </div>
              </div>
            </div>
          </Card>
          
          <Card className="p-6 bg-gradient-to-br from-purple-500/20 to-purple-500/5 border-2 border-purple-500/30 hover:scale-105 transition-all duration-300 animate-fade-in delay-200">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg animate-pulse">
                <span className="text-2xl">🌐</span>
              </div>
              <h4 className="font-bold text-purple-700 mb-3">Web Interface</h4>
              <div className="space-y-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>React Widget</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>WordPress Plugin</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Shopify Integration</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Custom Embed</span>
                </div>
              </div>
            </div>
          </Card>
          
          <Card className="p-6 bg-gradient-to-br from-orange-500/20 to-orange-500/5 border-2 border-orange-500/30 hover:scale-105 transition-all duration-300 animate-fade-in delay-300">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg animate-pulse">
                <span className="text-2xl">📞</span>
              </div>
              <h4 className="font-bold text-orange-700 mb-3">Voice & SMS</h4>
              <div className="space-y-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Twilio Integration</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Voice Assistants</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>SMS Automation</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>IVR Systems</span>
                </div>
              </div>
            </div>
          </Card>
        </div>
        
        <div className="mt-8 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-orange-500/10 p-6 rounded-lg border animate-fade-in delay-500">
          <h3 className="text-xl font-bold text-center mb-6 text-primary">Deployment Analytics & Management</h3>
          <div className="grid grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">99.9%</div>
              <div className="text-lg font-semibold mb-1">Uptime SLA</div>
              <div className="text-sm text-muted-foreground">Enterprise reliability</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">< 5s</div>
              <div className="text-lg font-semibold mb-1">Deploy Time</div>
              <div className="text-sm text-muted-foreground">Instant activation</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600 mb-2">15+</div>
              <div className="text-lg font-semibold mb-1">Channels</div>
              <div className="text-sm text-muted-foreground">Platform support</div>
            </div>
          </div>
        </div>
      </div>
    ),
    animation: 'slide'
  },
  {
    id: 9,
    title: "MCP Protocol & Small Language Models Integration",
    subtitle: "Advanced Model Context Protocol for Seamless AI Communication",
    content: (
      <div className="h-full overflow-y-auto space-y-8 animate-fade-in">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 bg-gradient-to-r from-purple-500/20 to-indigo-500/20 px-6 py-3 rounded-full border border-purple-500/30">
            <div className="w-4 h-4 bg-purple-500 rounded-full animate-pulse"></div>
            <span className="text-lg font-semibold">Model Context Protocol (MCP)</span>
            <div className="w-4 h-4 bg-indigo-500 rounded-full animate-pulse delay-100"></div>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-8">
          <Card className="p-6 bg-gradient-to-br from-purple-500/20 to-purple-500/5 border-2 border-purple-500/30 hover:scale-105 transition-transform animate-fade-in">
            <div className="text-center mb-6">
              <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-xl animate-pulse">
                <span className="text-3xl">🔗</span>
              </div>
              <h3 className="text-xl font-bold text-purple-700 mb-3">MCP Protocol Features</h3>
            </div>
            <div className="space-y-4">
              <div className="p-4 bg-card rounded-lg border shadow-sm">
                <h4 className="font-semibold text-primary mb-2 flex items-center gap-2">
                  <div className="w-3 h-3 bg-purple-500 rounded-full animate-pulse"></div>
                  Cross-Model Communication
                </h4>
                <p className="text-sm text-muted-foreground">Enables seamless communication between different AI models and services with standardized protocols</p>
              </div>
              <div className="p-4 bg-card rounded-lg border shadow-sm">
                <h4 className="font-semibold text-primary mb-2 flex items-center gap-2">
                  <div className="w-3 h-3 bg-indigo-500 rounded-full animate-pulse"></div>
                  Context Sharing & Session Management
                </h4>
                <p className="text-sm text-muted-foreground">Maintains conversation context across multiple models and preserves session state for continuity</p>
              </div>
              <div className="p-4 bg-card rounded-lg border shadow-sm">
                <h4 className="font-semibold text-primary mb-2 flex items-center gap-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                  Resource Management
                </h4>
                <p className="text-sm text-muted-foreground">Intelligent resource allocation and load balancing across model instances</p>
              </div>
              <div className="p-4 bg-card rounded-lg border shadow-sm">
                <h4 className="font-semibold text-primary mb-2 flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  Security & Authentication
                </h4>
                <p className="text-sm text-muted-foreground">Enterprise-grade security with token-based authentication and encrypted communications</p>
              </div>
            </div>
          </Card>
          
          <Card className="p-6 bg-gradient-to-br from-indigo-500/20 to-indigo-500/5 border-2 border-indigo-500/30 hover:scale-105 transition-transform animate-fade-in delay-200">
            <div className="text-center mb-6">
              <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-xl animate-pulse">
                <span className="text-3xl">🧠</span>
              </div>
              <h3 className="text-xl font-bold text-indigo-700 mb-3">Small Language Models</h3>
            </div>
            <div className="space-y-4">
              <div className="p-4 bg-card rounded-lg border shadow-sm">
                <h4 className="font-semibold text-primary mb-2 flex items-center gap-2">
                  <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse"></div>
                  Optimized Performance
                </h4>
                <p className="text-sm text-muted-foreground">Lightweight models with 7B-13B parameters optimized for specific healthcare tasks</p>
              </div>
              <div className="p-4 bg-card rounded-lg border shadow-sm">
                <h4 className="font-semibold text-primary mb-2 flex items-center gap-2">
                  <div className="w-3 h-3 bg-orange-500 rounded-full animate-pulse"></div>
                  Cost Efficiency
                </h4>
                <p className="text-sm text-muted-foreground">95% lower inference costs compared to large models while maintaining high accuracy</p>
              </div>
              <div className="p-4 bg-card rounded-lg border shadow-sm">
                <h4 className="font-semibold text-primary mb-2 flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                  Edge Deployment
                </h4>
                <p className="text-sm text-muted-foreground">Can run locally on edge devices for ultra-low latency and enhanced privacy</p>
              </div>
              <div className="p-4 bg-card rounded-lg border shadow-sm">
                <h4 className="font-semibold text-primary mb-2 flex items-center gap-2">
                  <div className="w-3 h-3 bg-pink-500 rounded-full animate-pulse"></div>
                  Custom Fine-tuning
                </h4>
                <p className="text-sm text-muted-foreground">Domain-specific fine-tuning for healthcare, treatment protocols, and compliance</p>
              </div>
            </div>
          </Card>
        </div>
        
        <div className="mt-8 bg-gradient-to-r from-purple-500/10 via-indigo-500/10 to-blue-500/10 p-6 rounded-lg border animate-fade-in delay-400">
          <h3 className="text-xl font-bold text-center mb-6 text-primary">MCP + SLM Integration Benefits</h3>
          <div className="grid grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg animate-bounce">
                <span className="text-white text-xl">⚡</span>
              </div>
              <div className="text-lg font-bold text-purple-600">< 100ms</div>
              <div className="text-sm font-semibold">Response Time</div>
              <div className="text-xs text-muted-foreground">Ultra-fast inference</div>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-indigo-500 rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg animate-bounce delay-100">
                <span className="text-white text-xl">💰</span>
              </div>
              <div className="text-lg font-bold text-indigo-600">95%</div>
              <div className="text-sm font-semibold">Cost Reduction</div>
              <div className="text-xs text-muted-foreground">vs. large models</div>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg animate-bounce delay-200">
                <span className="text-white text-xl">🔒</span>
              </div>
              <div className="text-lg font-bold text-blue-600">100%</div>
              <div className="text-sm font-semibold">Privacy</div>
              <div className="text-xs text-muted-foreground">On-premise deployment</div>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg animate-bounce delay-300">
                <span className="text-white text-xl">📈</span>
              </div>
              <div className="text-lg font-bold text-green-600">99.2%</div>
              <div className="text-sm font-semibold">Accuracy</div>
              <div className="text-xs text-muted-foreground">Healthcare tasks</div>
            </div>
          </div>
        </div>
      </div>
    ),
    animation: 'zoom'
  },
  {
    id: 10,
    title: "Knowledge Base & RAG System Implementation",
    subtitle: "Advanced Retrieval Augmented Generation for Healthcare Intelligence",
    content: (
      <div className="h-full overflow-y-auto space-y-8 animate-fade-in">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 px-6 py-3 rounded-full border border-emerald-500/30">
            <div className="w-4 h-4 bg-emerald-500 rounded-full animate-pulse"></div>
            <span className="text-lg font-semibold">RAG + Knowledge Management System</span>
            <div className="w-4 h-4 bg-teal-500 rounded-full animate-pulse delay-100"></div>
          </div>
        </div>
        
        <div className="grid grid-cols-3 gap-6">
          <Card className="p-6 bg-gradient-to-br from-emerald-500/20 to-emerald-500/5 border-2 border-emerald-500/30 hover:scale-105 transition-transform animate-fade-in">
            <div className="text-center mb-4">
              <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg animate-pulse">
                <span className="text-2xl">📚</span>
              </div>
              <h4 className="font-bold text-emerald-700 mb-3">Knowledge Sources</h4>
            </div>
            <div className="space-y-3">
              <div className="p-3 bg-card rounded-lg border">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                  <span className="text-sm font-semibold">Medical Literature</span>
                </div>
                <p className="text-xs text-muted-foreground">PubMed, clinical studies, research papers</p>
              </div>
              <div className="p-3 bg-card rounded-lg border">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-2 h-2 bg-teal-500 rounded-full"></div>
                  <span className="text-sm font-semibold">Treatment Protocols</span>
                </div>
                <p className="text-xs text-muted-foreground">Evidence-based treatment guidelines</p>
              </div>
              <div className="p-3 bg-card rounded-lg border">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm font-semibold">Regulatory Docs</span>
                </div>
                <p className="text-xs text-muted-foreground">FDA guidelines, compliance standards</p>
              </div>
              <div className="p-3 bg-card rounded-lg border">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-sm font-semibold">Internal Knowledge</span>
                </div>
                <p className="text-xs text-muted-foreground">Facility protocols, staff guidelines</p>
              </div>
            </div>
          </Card>
          
          <Card className="p-6 bg-gradient-to-br from-blue-500/20 to-blue-500/5 border-2 border-blue-500/30 hover:scale-105 transition-transform animate-fade-in delay-100">
            <div className="text-center mb-4">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg animate-pulse">
                <span className="text-2xl">🔍</span>
              </div>
              <h4 className="font-bold text-blue-700 mb-3">Vector Search Engine</h4>
            </div>
            <div className="space-y-3">
              <div className="p-3 bg-card rounded-lg border">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-sm font-semibold">Semantic Search</span>
                </div>
                <p className="text-xs text-muted-foreground">Embeddings-based similarity matching</p>
              </div>
              <div className="p-3 bg-card rounded-lg border">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                  <span className="text-sm font-semibold">Hybrid Retrieval</span>
                </div>
                <p className="text-xs text-muted-foreground">Combines keyword + vector search</p>
              </div>
              <div className="p-3 bg-card rounded-lg border">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <span className="text-sm font-semibold">Context Ranking</span>
                </div>
                <p className="text-xs text-muted-foreground">Relevance scoring and re-ranking</p>
              </div>
              <div className="p-3 bg-card rounded-lg border">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-2 h-2 bg-pink-500 rounded-full"></div>
                  <span className="text-sm font-semibold">Real-time Indexing</span>
                </div>
                <p className="text-xs text-muted-foreground">Live document processing & updates</p>
              </div>
            </div>
          </Card>
          
          <Card className="p-6 bg-gradient-to-br from-purple-500/20 to-purple-500/5 border-2 border-purple-500/30 hover:scale-105 transition-transform animate-fade-in delay-200">
            <div className="text-center mb-4">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg animate-pulse">
                <span className="text-2xl">🤖</span>
              </div>
              <h4 className="font-bold text-purple-700 mb-3">AI Generation Pipeline</h4>
            </div>
            <div className="space-y-3">
              <div className="p-3 bg-card rounded-lg border">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <span className="text-sm font-semibold">Context Injection</span>
                </div>
                <p className="text-xs text-muted-foreground">Retrieved docs into prompt context</p>
              </div>
              <div className="p-3 bg-card rounded-lg border">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                  <span className="text-sm font-semibold">Citation Tracking</span>
                </div>
                <p className="text-xs text-muted-foreground">Source attribution and verification</p>
              </div>
              <div className="p-3 bg-card rounded-lg border">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-sm font-semibold">Fact Verification</span>
                </div>
                <p className="text-xs text-muted-foreground">Cross-reference validation checks</p>
              </div>
              <div className="p-3 bg-card rounded-lg border">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm font-semibold">Response Grounding</span>
                </div>
                <p className="text-xs text-muted-foreground">Evidence-based answer generation</p>
              </div>
            </div>
          </Card>
        </div>
        
        <div className="mt-8 bg-gradient-to-r from-emerald-500/10 via-blue-500/10 to-purple-500/10 p-6 rounded-lg border animate-fade-in delay-400">
          <h3 className="text-xl font-bold text-center mb-6 text-primary">RAG Performance Metrics</h3>
          <div className="grid grid-cols-5 gap-4">
            <div className="text-center">
              <div className="w-14 h-14 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg animate-bounce">
                <span className="text-white text-lg">📊</span>
              </div>
              <div className="text-lg font-bold text-emerald-600">94.2%</div>
              <div className="text-sm font-semibold">Accuracy</div>
              <div className="text-xs text-muted-foreground">Retrieved relevance</div>
            </div>
            <div className="text-center">
              <div className="w-14 h-14 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg animate-bounce delay-100">
                <span className="text-white text-lg">⚡</span>
              </div>
              <div className="text-lg font-bold text-blue-600">< 200ms</div>
              <div className="text-sm font-semibold">Search Time</div>
              <div className="text-xs text-muted-foreground">Vector retrieval</div>
            </div>
            <div className="text-center">
              <div className="w-14 h-14 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg animate-bounce delay-200">
                <span className="text-white text-lg">💾</span>
              </div>
              <div className="text-lg font-bold text-purple-600">10M+</div>
              <div className="text-sm font-semibold">Documents</div>
              <div className="text-xs text-muted-foreground">Knowledge base size</div>
            </div>
            <div className="text-center">
              <div className="w-14 h-14 bg-indigo-500 rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg animate-bounce delay-300">
                <span className="text-white text-lg">🔄</span>
              </div>
              <div className="text-lg font-bold text-indigo-600">Real-time</div>
              <div className="text-sm font-semibold">Updates</div>
              <div className="text-xs text-muted-foreground">Live sync</div>
            </div>
            <div className="text-center">
              <div className="w-14 h-14 bg-teal-500 rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg animate-bounce delay-400">
                <span className="text-white text-lg">📚</span>
              </div>
              <div className="text-lg font-bold text-teal-600">Multi-modal</div>
              <div className="text-sm font-semibold">Content</div>
              <div className="text-xs text-muted-foreground">Text, images, audio</div>
            </div>
          </div>
        </div>
      </div>
    ),
    animation: 'fade'
  },
  {
    id: 11,
    title: "AI Model Selection & Assignment Strategy",
    subtitle: "Advanced Model Orchestration and Intelligent Task Distribution",
    content: (
      <div className="h-full overflow-y-auto space-y-8 animate-fade-in">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 bg-gradient-to-r from-amber-500/20 to-orange-500/20 px-6 py-3 rounded-full border border-amber-500/30">
            <div className="w-4 h-4 bg-amber-500 rounded-full animate-pulse"></div>
            <span className="text-lg font-semibold">Smart Model Assignment Engine</span>
            <div className="w-4 h-4 bg-orange-500 rounded-full animate-pulse delay-100"></div>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-8">
          <Card className="p-6 bg-gradient-to-br from-amber-500/20 to-amber-500/5 border-2 border-amber-500/30 hover:scale-105 transition-transform animate-fade-in">
            <div className="text-center mb-6">
              <div className="w-20 h-20 bg-gradient-to-br from-amber-500 to-amber-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-xl animate-pulse">
                <span className="text-3xl">🎯</span>
              </div>
              <h3 className="text-xl font-bold text-amber-700 mb-3">Model Selection Criteria</h3>
            </div>
            <div className="space-y-4">
              <div className="p-4 bg-card rounded-lg border shadow-sm">
                <h4 className="font-semibold text-primary mb-2 flex items-center gap-2">
                  <div className="w-3 h-3 bg-amber-500 rounded-full animate-pulse"></div>
                  Task Complexity Analysis
                </h4>
                <p className="text-sm text-muted-foreground">Automatic assessment of query complexity to match optimal model size</p>
              </div>
              <div className="p-4 bg-card rounded-lg border shadow-sm">
                <h4 className="font-semibold text-primary mb-2 flex items-center gap-2">
                  <div className="w-3 h-3 bg-orange-500 rounded-full animate-pulse"></div>
                  Domain Expertise Matching
                </h4>
                <p className="text-sm text-muted-foreground">Routes healthcare queries to specialized medical AI models</p>
              </div>
              <div className="p-4 bg-card rounded-lg border shadow-sm">
                <h4 className="font-semibold text-primary mb-2 flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                  Performance Optimization
                </h4>
                <p className="text-sm text-muted-foreground">Load balancing and latency optimization across model instances</p>
              </div>
              <div className="p-4 bg-card rounded-lg border shadow-sm">
                <h4 className="font-semibold text-primary mb-2 flex items-center gap-2">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full animate-pulse"></div>
                  Cost Efficiency
                </h4>
                <p className="text-sm text-muted-foreground">Intelligent routing to minimize computational costs while maintaining quality</p>
              </div>
            </div>
          </Card>
          
          <Card className="p-6 bg-gradient-to-br from-orange-500/20 to-orange-500/5 border-2 border-orange-500/30 hover:scale-105 transition-transform animate-fade-in delay-200">
            <div className="text-center mb-6">
              <div className="w-20 h-20 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-xl animate-pulse">
                <span className="text-3xl">🤖</span>
              </div>
              <h3 className="text-xl font-bold text-orange-700 mb-3">Available Model Types</h3>
            </div>
            <div className="space-y-4">
              <div className="p-4 bg-card rounded-lg border shadow-sm">
                <h4 className="font-semibold text-primary mb-2 flex items-center gap-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                  Conversational AI Models
                </h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• GPT-4 Turbo for complex reasoning</li>
                  <li>• Claude 3.5 Sonnet for nuanced responses</li>
                  <li>• Llama 3.1 70B for general conversations</li>
                </ul>
              </div>
              <div className="p-4 bg-card rounded-lg border shadow-sm">
                <h4 className="font-semibold text-primary mb-2 flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  Specialized Healthcare Models
                </h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Medical question answering</li>
                  <li>• Clinical decision support</li>
                  <li>• Treatment protocol guidance</li>
                </ul>
              </div>
              <div className="p-4 bg-card rounded-lg border shadow-sm">
                <h4 className="font-semibold text-primary mb-2 flex items-center gap-2">
                  <div className="w-3 h-3 bg-purple-500 rounded-full animate-pulse"></div>
                  Vision & Document Processing
                </h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Medical image analysis</li>
                  <li>• Document extraction & OCR</li>
                  <li>• Form processing automation</li>
                </ul>
              </div>
            </div>
          </Card>
        </div>
        
        <div className="mt-8 bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-red-500/10 p-6 rounded-lg border animate-fade-in delay-400">
          <h3 className="text-xl font-bold text-center mb-6 text-primary">Model Assignment Performance</h3>
          <div className="grid grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-amber-500 rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg animate-bounce">
                <span className="text-white text-xl">🎯</span>
              </div>
              <div className="text-lg font-bold text-amber-600">98.5%</div>
              <div className="text-sm font-semibold">Accuracy</div>
              <div className="text-xs text-muted-foreground">Task-model matching</div>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg animate-bounce delay-100">
                <span className="text-white text-xl">⚡</span>
              </div>
              <div className="text-lg font-bold text-orange-600">< 50ms</div>
              <div className="text-sm font-semibold">Routing Time</div>
              <div className="text-xs text-muted-foreground">Model selection</div>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg animate-bounce delay-200">
                <span className="text-white text-xl">💰</span>
              </div>
              <div className="text-lg font-bold text-red-600">60%</div>
              <div className="text-sm font-semibold">Cost Savings</div>
              <div className="text-xs text-muted-foreground">vs. single model</div>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-yellow-500 rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg animate-bounce delay-300">
                <span className="text-white text-xl">🔄</span>
              </div>
              <div className="text-lg font-bold text-yellow-600">Auto</div>
              <div className="text-sm font-semibold">Scaling</div>
              <div className="text-xs text-muted-foreground">Dynamic load balancing</div>
            </div>
          </div>
        </div>
      </div>
    ),
    animation: 'slide'
  },
  {
    id: 12,
    title: "Enterprise Security & HIPAA Compliance Framework",
    subtitle: "Comprehensive Security Architecture for Healthcare Data Protection",
    content: (
      <div className="h-full overflow-y-auto space-y-8 animate-fade-in">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 bg-gradient-to-r from-red-500/20 to-pink-500/20 px-6 py-3 rounded-full border border-red-500/30">
            <div className="w-4 h-4 bg-red-500 rounded-full animate-pulse"></div>
            <span className="text-lg font-semibold">HIPAA Compliant Security Framework</span>
            <div className="w-4 h-4 bg-pink-500 rounded-full animate-pulse delay-100"></div>
          </div>
        </div>
        
        <div className="grid grid-cols-3 gap-6">
          <Card className="p-6 bg-gradient-to-br from-red-500/20 to-red-500/5 border-2 border-red-500/30 hover:scale-105 transition-transform animate-fade-in">
            <div className="text-center mb-4">
              <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg animate-pulse">
                <span className="text-2xl">🔒</span>
              </div>
              <h4 className="font-bold text-red-700 mb-3">Data Encryption</h4>
            </div>
            <div className="space-y-3">
              <div className="p-3 bg-card rounded-lg border">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  <span className="text-sm font-semibold">AES-256 Encryption</span>
                </div>
                <p className="text-xs text-muted-foreground">End-to-end encryption at rest and in transit</p>
              </div>
              <div className="p-3 bg-card rounded-lg border">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                  <span className="text-sm font-semibold">Key Management</span>
                </div>
                <p className="text-xs text-muted-foreground">Hardware Security Modules (HSM)</p>
              </div>
              <div className="p-3 bg-card rounded-lg border">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-2 h-2 bg-pink-500 rounded-full"></div>
                  <span className="text-sm font-semibold">Zero Trust Architecture</span>
                </div>
                <p className="text-xs text-muted-foreground">Never trust, always verify principle</p>
              </div>
            </div>
          </Card>
          
          <Card className="p-6 bg-gradient-to-br from-blue-500/20 to-blue-500/5 border-2 border-blue-500/30 hover:scale-105 transition-transform animate-fade-in delay-100">
            <div className="text-center mb-4">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg animate-pulse">
                <span className="text-2xl">👤</span>
              </div>
              <h4 className="font-bold text-blue-700 mb-3">Access Control</h4>
            </div>
            <div className="space-y-3">
              <div className="p-3 bg-card rounded-lg border">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-sm font-semibold">Multi-Factor Auth</span>
                </div>
                <p className="text-xs text-muted-foreground">Biometric + token-based authentication</p>
              </div>
              <div className="p-3 bg-card rounded-lg border">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                  <span className="text-sm font-semibold">Role-Based Access</span>
                </div>
                <p className="text-xs text-muted-foreground">Granular permissions and audit trails</p>
              </div>
              <div className="p-3 bg-card rounded-lg border">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <span className="text-sm font-semibold">Session Management</span>
                </div>
                <p className="text-xs text-muted-foreground">Automatic timeout and re-authentication</p>
              </div>
            </div>
          </Card>
          
          <Card className="p-6 bg-gradient-to-br from-green-500/20 to-green-500/5 border-2 border-green-500/30 hover:scale-105 transition-transform animate-fade-in delay-200">
            <div className="text-center mb-4">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg animate-pulse">
                <span className="text-2xl">📋</span>
              </div>
              <h4 className="font-bold text-green-700 mb-3">Compliance & Audit</h4>
            </div>
            <div className="space-y-3">
              <div className="p-3 bg-card rounded-lg border">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm font-semibold">HIPAA Compliance</span>
                </div>
                <p className="text-xs text-muted-foreground">Full BAA coverage and compliance</p>
              </div>
              <div className="p-3 bg-card rounded-lg border">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-2 h-2 bg-teal-500 rounded-full"></div>
                  <span className="text-sm font-semibold">SOC 2 Type II</span>
                </div>
                <p className="text-xs text-muted-foreground">Annual security assessments</p>
              </div>
              <div className="p-3 bg-card rounded-lg border">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                  <span className="text-sm font-semibold">Continuous Monitoring</span>
                </div>
                <p className="text-xs text-muted-foreground">Real-time security event logging</p>
              </div>
            </div>
          </Card>
        </div>
        
        <div className="mt-8 grid grid-cols-2 gap-8">
          <Card className="p-6 bg-gradient-to-br from-purple-500/20 to-purple-500/5 border-2 border-purple-500/30 animate-fade-in delay-300">
            <h3 className="text-xl font-bold text-purple-700 mb-4 text-center">Security Certifications</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-card rounded-lg border">
                <div className="text-lg mb-1">🏆</div>
                <div className="text-sm font-semibold">HIPAA</div>
                <div className="text-xs text-muted-foreground">Certified Compliant</div>
              </div>
              <div className="text-center p-3 bg-card rounded-lg border">
                <div className="text-lg mb-1">🛡️</div>
                <div className="text-sm font-semibold">SOC 2 Type II</div>
                <div className="text-xs text-muted-foreground">Security Framework</div>
              </div>
              <div className="text-center p-3 bg-card rounded-lg border">
                <div className="text-lg mb-1">🔐</div>
                <div className="text-sm font-semibold">ISO 27001</div>
                <div className="text-xs text-muted-foreground">Information Security</div>
              </div>
              <div className="text-center p-3 bg-card rounded-lg border">
                <div className="text-lg mb-1">✅</div>
                <div className="text-sm font-semibold">GDPR</div>
                <div className="text-xs text-muted-foreground">Privacy Compliance</div>
              </div>
            </div>
          </Card>
          
          <Card className="p-6 bg-gradient-to-br from-orange-500/20 to-orange-500/5 border-2 border-orange-500/30 animate-fade-in delay-400">
            <h3 className="text-xl font-bold text-orange-700 mb-4 text-center">Security Metrics</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-semibold">Uptime SLA</span>
                <span className="text-lg font-bold text-green-600">99.99%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-semibold">Security Incidents</span>
                <span className="text-lg font-bold text-blue-600">0</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-semibold">Vulnerability Response</span>
                <span className="text-lg font-bold text-purple-600">< 4hrs</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-semibold">Audit Score</span>
                <span className="text-lg font-bold text-orange-600">A+</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    ),
    animation: 'zoom'
  },
  {
    id: 13,
    title: "Implementation Timeline & Project Roadmap",
    subtitle: "Structured 30-Day Implementation with Milestone Tracking",
    content: (
      <div className="h-full overflow-y-auto space-y-8 animate-fade-in">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 px-6 py-3 rounded-full border border-indigo-500/30">
            <div className="w-4 h-4 bg-indigo-500 rounded-full animate-pulse"></div>
            <span className="text-lg font-semibold">30-Day Implementation Roadmap</span>
            <div className="w-4 h-4 bg-purple-500 rounded-full animate-pulse delay-100"></div>
          </div>
        </div>
        
        <div className="relative">
          {/* Timeline Line */}
          <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-indigo-500 via-purple-500 to-pink-500"></div>
          
          <div className="space-y-8">
            {/* Week 1 */}
            <div className="flex items-start gap-6 animate-fade-in">
              <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-full flex items-center justify-center shadow-xl z-10">
                <span className="text-white font-bold">W1</span>
              </div>
              <Card className="flex-1 p-6 bg-gradient-to-br from-indigo-500/20 to-indigo-500/5 border-2 border-indigo-500/30">
                <h3 className="text-xl font-bold text-indigo-700 mb-3">Week 1: Foundation Setup</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold mb-2 text-primary">Technical Setup</h4>
                    <ul className="text-sm space-y-1 text-muted-foreground">
                      <li>• Infrastructure deployment</li>
                      <li>• Security configuration</li>
                      <li>• Database initialization</li>
                      <li>• API gateway setup</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2 text-primary">Team Onboarding</h4>
                    <ul className="text-sm space-y-1 text-muted-foreground">
                      <li>• Admin account creation</li>
                      <li>• Training sessions</li>
                      <li>• Documentation review</li>
                      <li>• Role assignments</li>
                    </ul>
                  </div>
                </div>
              </Card>
            </div>
            
            {/* Week 2 */}
            <div className="flex items-start gap-6 animate-fade-in delay-100">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center shadow-xl z-10">
                <span className="text-white font-bold">W2</span>
              </div>
              <Card className="flex-1 p-6 bg-gradient-to-br from-purple-500/20 to-purple-500/5 border-2 border-purple-500/30">
                <h3 className="text-xl font-bold text-purple-700 mb-3">Week 2: Agent Development</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold mb-2 text-primary">Agent Creation</h4>
                    <ul className="text-sm space-y-1 text-muted-foreground">
                      <li>• First agent prototype</li>
                      <li>• Workflow configuration</li>
                      <li>• Knowledge base setup</li>
                      <li>• Initial testing</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2 text-primary">Integration</h4>
                    <ul className="text-sm space-y-1 text-muted-foreground">
                      <li>• EHR system connection</li>
                      <li>• Communication channels</li>
                      <li>• Data synchronization</li>
                      <li>• Compliance validation</li>
                    </ul>
                  </div>
                </div>
              </Card>
            </div>
            
            {/* Week 3 */}
            <div className="flex items-start gap-6 animate-fade-in delay-200">
              <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-pink-600 rounded-full flex items-center justify-center shadow-xl z-10">
                <span className="text-white font-bold">W3</span>
              </div>
              <Card className="flex-1 p-6 bg-gradient-to-br from-pink-500/20 to-pink-500/5 border-2 border-pink-500/30">
                <h3 className="text-xl font-bold text-pink-700 mb-3">Week 3: Testing & Optimization</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold mb-2 text-primary">Quality Assurance</h4>
                    <ul className="text-sm space-y-1 text-muted-foreground">
                      <li>• Comprehensive testing</li>
                      <li>• Performance optimization</li>
                      <li>• Security auditing</li>
                      <li>• Load testing</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2 text-primary">Staff Training</h4>
                    <ul className="text-sm space-y-1 text-muted-foreground">
                      <li>• User training programs</li>
                      <li>• Process documentation</li>
                      <li>• Support procedures</li>
                      <li>• Feedback collection</li>
                    </ul>
                  </div>
                </div>
              </Card>
            </div>
            
            {/* Week 4 */}
            <div className="flex items-start gap-6 animate-fade-in delay-300">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center shadow-xl z-10">
                <span className="text-white font-bold">W4</span>
              </div>
              <Card className="flex-1 p-6 bg-gradient-to-br from-green-500/20 to-green-500/5 border-2 border-green-500/30">
                <h3 className="text-xl font-bold text-green-700 mb-3">Week 4: Go-Live & Support</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold mb-2 text-primary">Production Launch</h4>
                    <ul className="text-sm space-y-1 text-muted-foreground">
                      <li>• Production deployment</li>
                      <li>• Monitoring setup</li>
                      <li>• Performance tracking</li>
                      <li>• Issue resolution</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2 text-primary">Ongoing Support</h4>
                    <ul className="text-sm space-y-1 text-muted-foreground">
                      <li>• 24/7 monitoring</li>
                      <li>• User support</li>
                      <li>• Continuous optimization</li>
                      <li>• Success metrics review</li>
                    </ul>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
        
        <div className="mt-8 bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-green-500/10 p-6 rounded-lg border animate-fade-in delay-500">
          <h3 className="text-xl font-bold text-center mb-6 text-primary">Implementation Success Metrics</h3>
          <div className="grid grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-indigo-500 rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg animate-bounce">
                <span className="text-white text-xl">⏱️</span>
              </div>
              <div className="text-lg font-bold text-indigo-600">30 Days</div>
              <div className="text-sm font-semibold">Full Implementation</div>
              <div className="text-xs text-muted-foreground">From start to production</div>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg animate-bounce delay-100">
                <span className="text-white text-xl">✅</span>
              </div>
              <div className="text-lg font-bold text-purple-600">95%</div>
              <div className="text-sm font-semibold">Success Rate</div>
              <div className="text-xs text-muted-foreground">On-time delivery</div>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-pink-500 rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg animate-bounce delay-200">
                <span className="text-white text-xl">👥</span>
              </div>
              <div className="text-lg font-bold text-pink-600">100%</div>
              <div className="text-sm font-semibold">Team Training</div>
              <div className="text-xs text-muted-foreground">Staff readiness</div>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg animate-bounce delay-300">
                <span className="text-white text-xl">🚀</span>
              </div>
              <div className="text-lg font-bold text-green-600">24/7</div>
              <div className="text-sm font-semibold">Support</div>
              <div className="text-xs text-muted-foreground">Post-launch coverage</div>
            </div>
          </div>
        </div>
      </div>
    ),
    animation: 'slide'
  },
  {
    id: 14,
    title: "ROI Analysis & Business Impact Assessment",
    subtitle: "Quantified Benefits and Cost-Benefit Analysis for Healthcare AI Implementation",
    content: (
      <div className="h-full overflow-y-auto space-y-8 animate-fade-in">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 bg-gradient-to-r from-green-500/20 to-emerald-500/20 px-6 py-3 rounded-full border border-green-500/30">
            <div className="w-4 h-4 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-lg font-semibold">ROI & Business Impact Analysis</span>
            <div className="w-4 h-4 bg-emerald-500 rounded-full animate-pulse delay-100"></div>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-8">
          <Card className="p-6 bg-gradient-to-br from-green-500/20 to-green-500/5 border-2 border-green-500/30 hover:scale-105 transition-transform animate-fade-in">
            <div className="text-center mb-6">
              <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-xl animate-pulse">
                <span className="text-3xl">💰</span>
              </div>
              <h3 className="text-xl font-bold text-green-700 mb-3">Financial Benefits</h3>
            </div>
            <div className="space-y-4">
              <div className="p-4 bg-card rounded-lg border shadow-sm">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="font-semibold text-primary">Staff Cost Reduction</h4>
                  <span className="text-lg font-bold text-green-600">$180K/year</span>
                </div>
                <p className="text-sm text-muted-foreground">Automation of routine tasks and inquiries</p>
              </div>
              <div className="p-4 bg-card rounded-lg border shadow-sm">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="font-semibold text-primary">Error Reduction Savings</h4>
                  <span className="text-lg font-bold text-green-600">$95K/year</span>
                </div>
                <p className="text-sm text-muted-foreground">Reduced administrative errors and rework</p>
              </div>
              <div className="p-4 bg-card rounded-lg border shadow-sm">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="font-semibold text-primary">Patient Retention</h4>
                  <span className="text-lg font-bold text-green-600">$320K/year</span>
                </div>
                <p className="text-sm text-muted-foreground">Improved satisfaction and engagement</p>
              </div>
              <div className="p-4 bg-card rounded-lg border shadow-sm">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="font-semibold text-primary">Compliance Efficiency</h4>
                  <span className="text-lg font-bold text-green-600">$65K/year</span>
                </div>
                <p className="text-sm text-muted-foreground">Automated compliance and reporting</p>
              </div>
            </div>
          </Card>
          
          <Card className="p-6 bg-gradient-to-br from-blue-500/20 to-blue-500/5 border-2 border-blue-500/30 hover:scale-105 transition-transform animate-fade-in delay-200">
            <div className="text-center mb-6">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-xl animate-pulse">
                <span className="text-3xl">📈</span>
              </div>
              <h3 className="text-xl font-bold text-blue-700 mb-3">Operational Improvements</h3>
            </div>
            <div className="space-y-4">
              <div className="p-4 bg-card rounded-lg border shadow-sm">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="font-semibold text-primary">Response Time</h4>
                  <span className="text-lg font-bold text-blue-600">85% Faster</span>
                </div>
                <p className="text-sm text-muted-foreground">From hours to minutes for patient inquiries</p>
              </div>
              <div className="p-4 bg-card rounded-lg border shadow-sm">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="font-semibold text-primary">Accuracy Rate</h4>
                  <span className="text-lg font-bold text-blue-600">99.2%</span>
                </div>
                <p className="text-sm text-muted-foreground">Reduced human error in data entry</p>
              </div>
              <div className="p-4 bg-card rounded-lg border shadow-sm">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="font-semibold text-primary">Staff Productivity</h4>
                  <span className="text-lg font-bold text-blue-600">+40%</span>
                </div>
                <p className="text-sm text-muted-foreground">Focus on high-value patient care</p>
              </div>
              <div className="p-4 bg-card rounded-lg border shadow-sm">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="font-semibold text-primary">Patient Satisfaction</h4>
                  <span className="text-lg font-bold text-blue-600">+35%</span>
                </div>
                <p className="text-sm text-muted-foreground">24/7 availability and faster responses</p>
              </div>
            </div>
          </Card>
        </div>
        
        <div className="grid grid-cols-3 gap-6">
          <Card className="p-6 bg-gradient-to-br from-purple-500/20 to-purple-500/5 border-2 border-purple-500/30 animate-fade-in delay-300">
            <h3 className="text-xl font-bold text-center text-purple-700 mb-4">Implementation Cost</h3>
            <div className="text-center">
              <div className="text-4xl font-bold text-purple-600 mb-2">$85K</div>
              <div className="text-sm text-muted-foreground mb-4">One-time setup cost</div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Software License</span>
                  <span>$35K</span>
                </div>
                <div className="flex justify-between">
                  <span>Implementation</span>
                  <span>$30K</span>
                </div>
                <div className="flex justify-between">
                  <span>Training</span>
                  <span>$15K</span>
                </div>
                <div className="flex justify-between">
                  <span>Infrastructure</span>
                  <span>$5K</span>
                </div>
              </div>
            </div>
          </Card>
          
          <Card className="p-6 bg-gradient-to-br from-orange-500/20 to-orange-500/5 border-2 border-orange-500/30 animate-fade-in delay-400">
            <h3 className="text-xl font-bold text-center text-orange-700 mb-4">Annual Savings</h3>
            <div className="text-center">
              <div className="text-4xl font-bold text-orange-600 mb-2">$660K</div>
              <div className="text-sm text-muted-foreground mb-4">Total yearly benefits</div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Staff Reduction</span>
                  <span>$180K</span>
                </div>
                <div className="flex justify-between">
                  <span>Patient Retention</span>
                  <span>$320K</span>
                </div>
                <div className="flex justify-between">
                  <span>Error Reduction</span>
                  <span>$95K</span>
                </div>
                <div className="flex justify-between">
                  <span>Compliance</span>
                  <span>$65K</span>
                </div>
              </div>
            </div>
          </Card>
          
          <Card className="p-6 bg-gradient-to-br from-emerald-500/20 to-emerald-500/5 border-2 border-emerald-500/30 animate-fade-in delay-500">
            <h3 className="text-xl font-bold text-center text-emerald-700 mb-4">ROI Analysis</h3>
            <div className="text-center">
              <div className="text-4xl font-bold text-emerald-600 mb-2">776%</div>
              <div className="text-sm text-muted-foreground mb-4">Return on Investment</div>
              <div className="space-y-3">
                <div className="p-3 bg-card rounded-lg border">
                  <div className="text-lg font-bold text-green-600">1.2 months</div>
                  <div className="text-xs text-muted-foreground">Payback Period</div>
                </div>
                <div className="p-3 bg-card rounded-lg border">
                  <div className="text-lg font-bold text-blue-600">$575K</div>
                  <div className="text-xs text-muted-foreground">Net Annual Benefit</div>
                </div>
                <div className="p-3 bg-card rounded-lg border">
                  <div className="text-lg font-bold text-purple-600">$2.3M</div>
                  <div className="text-xs text-muted-foreground">3-Year Value</div>
                </div>
              </div>
            </div>
          </Card>
        </div>
        
        <div className="mt-8 bg-gradient-to-r from-green-500/10 via-blue-500/10 to-purple-500/10 p-6 rounded-lg border animate-fade-in delay-600">
          <h3 className="text-xl font-bold text-center mb-6 text-primary">Key Performance Indicators</h3>
          <div className="grid grid-cols-5 gap-4">
            <div className="text-center">
              <div className="w-14 h-14 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg animate-bounce">
                <span className="text-white text-lg">💰</span>
              </div>
              <div className="text-lg font-bold text-green-600">776%</div>
              <div className="text-sm font-semibold">ROI</div>
              <div className="text-xs text-muted-foreground">First year</div>
            </div>
            <div className="text-center">
              <div className="w-14 h-14 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg animate-bounce delay-100">
                <span className="text-white text-lg">⏱️</span>
              </div>
              <div className="text-lg font-bold text-blue-600">1.2</div>
              <div className="text-sm font-semibold">Payback</div>
              <div className="text-xs text-muted-foreground">Months</div>
            </div>
            <div className="text-center">
              <div className="w-14 h-14 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg animate-bounce delay-200">
                <span className="text-white text-lg">📈</span>
              </div>
              <div className="text-lg font-bold text-purple-600">+40%</div>
              <div className="text-sm font-semibold">Productivity</div>
              <div className="text-xs text-muted-foreground">Staff efficiency</div>
            </div>
            <div className="text-center">
              <div className="w-14 h-14 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg animate-bounce delay-300">
                <span className="text-white text-lg">😊</span>
              </div>
              <div className="text-lg font-bold text-orange-600">+35%</div>
              <div className="text-sm font-semibold">Satisfaction</div>
              <div className="text-xs text-muted-foreground">Patient rating</div>
            </div>
            <div className="text-center">
              <div className="w-14 h-14 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg animate-bounce delay-400">
                <span className="text-white text-lg">🎯</span>
              </div>
              <div className="text-lg font-bold text-red-600">99.2%</div>
              <div className="text-sm font-semibold">Accuracy</div>
              <div className="text-xs text-muted-foreground">Error reduction</div>
            </div>
          </div>
        </div>
      </div>
    ),
    animation: 'fade'
  },
  {
    id: 15,
    title: "Training & Support Infrastructure",
    subtitle: "Comprehensive Training Programs and 24/7 Support Framework",
    content: (
      <div className="h-full overflow-y-auto space-y-8 animate-fade-in">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 bg-gradient-to-r from-blue-500/20 to-indigo-500/20 px-6 py-3 rounded-full border border-blue-500/30">
            <div className="w-4 h-4 bg-blue-500 rounded-full animate-pulse"></div>
            <span className="text-lg font-semibold">Training & Support Excellence Program</span>
            <div className="w-4 h-4 bg-indigo-500 rounded-full animate-pulse delay-100"></div>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-8">
          <Card className="p-6 bg-gradient-to-br from-blue-500/20 to-blue-500/5 border-2 border-blue-500/30 hover:scale-105 transition-transform animate-fade-in">
            <div className="text-center mb-6">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-xl animate-pulse">
                <span className="text-3xl">🎓</span>
              </div>
              <h3 className="text-xl font-bold text-blue-700 mb-3">Training Programs</h3>
            </div>
            <div className="space-y-4">
              <div className="p-4 bg-card rounded-lg border shadow-sm">
                <h4 className="font-semibold text-primary mb-2 flex items-center gap-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                  Administrator Training
                </h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• System configuration and management</li>
                  <li>• User role management and permissions</li>
                  <li>• Advanced analytics and reporting</li>
                  <li>• Troubleshooting and maintenance</li>
                </ul>
              </div>
              <div className="p-4 bg-card rounded-lg border shadow-sm">
                <h4 className="font-semibold text-primary mb-2 flex items-center gap-2">
                  <div className="w-3 h-3 bg-indigo-500 rounded-full animate-pulse"></div>
                  End-User Training
                </h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Basic system navigation and features</li>
                  <li>• Patient interaction best practices</li>
                  <li>• AI agent utilization techniques</li>
                  <li>• Workflow integration methods</li>
                </ul>
              </div>
              <div className="p-4 bg-card rounded-lg border shadow-sm">
                <h4 className="font-semibold text-primary mb-2 flex items-center gap-2">
                  <div className="w-3 h-3 bg-purple-500 rounded-full animate-pulse"></div>
                  Specialized Training
                </h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• HIPAA compliance and data security</li>
                  <li>• Custom agent development</li>
                  <li>• Integration with existing systems</li>
                  <li>• Advanced customization options</li>
                </ul>
              </div>
            </div>
          </Card>
          
          <Card className="p-6 bg-gradient-to-br from-indigo-500/20 to-indigo-500/5 border-2 border-indigo-500/30 hover:scale-105 transition-transform animate-fade-in delay-200">
            <div className="text-center mb-6">
              <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-xl animate-pulse">
                <span className="text-3xl">🛠️</span>
              </div>
              <h3 className="text-xl font-bold text-indigo-700 mb-3">Support Infrastructure</h3>
            </div>
            <div className="space-y-4">
              <div className="p-4 bg-card rounded-lg border shadow-sm">
                <h4 className="font-semibold text-primary mb-2 flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  24/7 Support Center
                </h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Round-the-clock technical assistance</li>
                  <li>• Multi-channel support (phone, chat, email)</li>
                  <li>• Escalation procedures for critical issues</li>
                  <li>• Remote diagnostic and resolution</li>
                </ul>
              </div>
              <div className="p-4 bg-card rounded-lg border shadow-sm">
                <h4 className="font-semibold text-primary mb-2 flex items-center gap-2">
                  <div className="w-3 h-3 bg-orange-500 rounded-full animate-pulse"></div>
                  Knowledge Base
                </h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Comprehensive documentation library</li>
                  <li>• Video tutorials and guides</li>
                  <li>• FAQ section with search functionality</li>
                  <li>• Regular updates and new content</li>
                </ul>
              </div>
              <div className="p-4 bg-card rounded-lg border shadow-sm">
                <h4 className="font-semibold text-primary mb-2 flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                  Proactive Monitoring
                </h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Real-time system health monitoring</li>
                  <li>• Automated alert and notification system</li>
                  <li>• Predictive maintenance and updates</li>
                  <li>• Performance optimization recommendations</li>
                </ul>
              </div>
            </div>
          </Card>
        </div>
        
        <div className="grid grid-cols-3 gap-6">
          <Card className="p-6 bg-gradient-to-br from-green-500/20 to-green-500/5 border-2 border-green-500/30 animate-fade-in delay-300">
            <h3 className="text-xl font-bold text-center text-green-700 mb-4">Training Delivery Methods</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-card rounded-lg border">
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm">🎥</span>
                </div>
                <div>
                  <div className="font-semibold text-sm">Live Virtual Sessions</div>
                  <div className="text-xs text-muted-foreground">Interactive online training</div>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-card rounded-lg border">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm">🏢</span>
                </div>
                <div>
                  <div className="font-semibold text-sm">On-site Training</div>
                  <div className="text-xs text-muted-foreground">In-person at your facility</div>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-card rounded-lg border">
                <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm">📚</span>
                </div>
                <div>
                  <div className="font-semibold text-sm">Self-Paced Learning</div>
                  <div className="text-xs text-muted-foreground">Online modules and resources</div>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-card rounded-lg border">
                <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm">🎯</span>
                </div>
                <div>
                  <div className="font-semibold text-sm">Customized Programs</div>
                  <div className="text-xs text-muted-foreground">Tailored to your needs</div>
                </div>
              </div>
            </div>
          </Card>
          
          <Card className="p-6 bg-gradient-to-br from-purple-500/20 to-purple-500/5 border-2 border-purple-500/30 animate-fade-in delay-400">
            <h3 className="text-xl font-bold text-center text-purple-700 mb-4">Support Response Times</h3>
            <div className="space-y-4">
              <div className="text-center p-4 bg-card rounded-lg border">
                <div className="text-2xl font-bold text-red-600 mb-1">< 15 min</div>
                <div className="text-sm font-semibold">Critical Issues</div>
                <div className="text-xs text-muted-foreground">System down, security breach</div>
              </div>
              <div className="text-center p-4 bg-card rounded-lg border">
                <div className="text-2xl font-bold text-orange-600 mb-1">< 2 hours</div>
                <div className="text-sm font-semibold">High Priority</div>
                <div className="text-xs text-muted-foreground">Major functionality issues</div>
              </div>
              <div className="text-center p-4 bg-card rounded-lg border">
                <div className="text-2xl font-bold text-blue-600 mb-1">< 24 hours</div>
                <div className="text-sm font-semibold">Standard</div>
                <div className="text-xs text-muted-foreground">General questions and issues</div>
              </div>
            </div>
          </Card>
          
          <Card className="p-6 bg-gradient-to-br from-orange-500/20 to-orange-500/5 border-2 border-orange-500/30 animate-fade-in delay-500">
            <h3 className="text-xl font-bold text-center text-orange-700 mb-4">Success Metrics</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-card rounded-lg border">
                <span className="text-sm font-semibold">Training Completion</span>
                <span className="text-lg font-bold text-green-600">98%</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-card rounded-lg border">
                <span className="text-sm font-semibold">User Satisfaction</span>
                <span className="text-lg font-bold text-blue-600">4.8/5</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-card rounded-lg border">
                <span className="text-sm font-semibold">Issue Resolution</span>
                <span className="text-lg font-bold text-purple-600">99.2%</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-card rounded-lg border">
                <span className="text-sm font-semibold">First Call Resolution</span>
                <span className="text-lg font-bold text-orange-600">87%</span>
              </div>
            </div>
          </Card>
        </div>
        
        <div className="mt-8 bg-gradient-to-r from-blue-500/10 via-indigo-500/10 to-purple-500/10 p-6 rounded-lg border animate-fade-in delay-600">
          <h3 className="text-xl font-bold text-center mb-6 text-primary">Training & Support Package</h3>
          <div className="grid grid-cols-5 gap-4">
            <div className="text-center">
              <div className="w-14 h-14 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg animate-bounce">
                <span className="text-white text-lg">📚</span>
              </div>
              <div className="text-lg font-bold text-blue-600">40+ hours</div>
              <div className="text-sm font-semibold">Training Content</div>
              <div className="text-xs text-muted-foreground">Comprehensive curriculum</div>
            </div>
            <div className="text-center">
              <div className="w-14 h-14 bg-indigo-500 rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg animate-bounce delay-100">
                <span className="text-white text-lg">🎓</span>
              </div>
              <div className="text-lg font-bold text-indigo-600">100%</div>
              <div className="text-sm font-semibold">Certification</div>
              <div className="text-xs text-muted-foreground">Staff competency</div>
            </div>
            <div className="text-center">
              <div className="w-14 h-14 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg animate-bounce delay-200">
                <span className="text-white text-lg">🛠️</span>
              </div>
              <div className="text-lg font-bold text-purple-600">24/7</div>
              <div className="text-sm font-semibold">Support</div>
              <div className="text-xs text-muted-foreground">Always available</div>
            </div>
            <div className="text-center">
              <div className="w-14 h-14 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg animate-bounce delay-300">
                <span className="text-white text-lg">📞</span>
              </div>
              <div className="text-lg font-bold text-green-600">< 15min</div>
              <div className="text-sm font-semibold">Response</div>
              <div className="text-xs text-muted-foreground">Critical issues</div>
            </div>
            <div className="text-center">
              <div className="w-14 h-14 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg animate-bounce delay-400">
                <span className="text-white text-lg">🎯</span>
              </div>
              <div className="text-lg font-bold text-orange-600">98%</div>
              <div className="text-sm font-semibold">Success Rate</div>
              <div className="text-xs text-muted-foreground">Implementation</div>
            </div>
          </div>
        </div>
      </div>
    ),
    animation: 'zoom'
  },
              <li>• Task complexity</li>
              <li>• Response time requirements</li>
              <li>• Accuracy needs</li>
              <li>• Resource constraints</li>
            </ul>
          </Card>
        </div>
      </div>
    ),
    animation: 'slide'
  },
  {
    id: 12,
    title: "Template Configuration Deep Dive",
    subtitle: "Advanced Template Customization",
    content: (
      <div className="h-full overflow-y-auto space-y-6 animate-fade-in">
        <Card className="p-6">
          <h3 className="text-xl font-bold mb-4">Template Features</h3>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-teal-500 rounded-full"></div>
              <span>Pre-built healthcare templates</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-teal-500 rounded-full"></div>
              <span>Custom workflow builders</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-teal-500 rounded-full"></div>
              <span>Dynamic form generation</span>
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
    subtitle: "Intelligent Task Automation",
    content: (
      <div className="h-full overflow-y-auto space-y-6 animate-fade-in">
        <Card className="p-6">
          <h3 className="text-xl font-bold mb-4">Automation Features</h3>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <span>Automated task execution</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <span>AI-powered suggestions</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <span>Smart workflow optimization</span>
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
    subtitle: "Final Configuration and Deployment",
    content: (
      <div className="h-full overflow-y-auto space-y-6 animate-fade-in">
        <div className="grid grid-cols-2 gap-6">
          <Card className="p-6">
            <h4 className="font-bold mb-3">Configuration</h4>
            <ul className="space-y-2 text-sm">
              <li>• Final template review</li>
              <li>• Testing and validation</li>
              <li>• Performance optimization</li>
            </ul>
          </Card>
          <Card className="p-6">
            <h4 className="font-bold mb-3">Deployment</h4>
            <ul className="space-y-2 text-sm">
              <li>• Channel-specific setup</li>
              <li>• Load balancing</li>
              <li>• Monitoring activation</li>
            </ul>
          </Card>
        </div>
      </div>
    ),
    animation: 'slide'
  },
  {
    id: 15,
    title: "Complete Implementation Results",
    subtitle: "Successful AI Agent Deployment",
    content: (
      <div className="h-full overflow-y-auto space-y-6 animate-fade-in">
        <div className="grid grid-cols-3 gap-6 text-center">
          <Card className="p-6">
            <div className="text-3xl font-bold text-green-600">95%</div>
            <div className="text-sm">Success Rate</div>
          </Card>
          <Card className="p-6">
            <div className="text-3xl font-bold text-blue-600">65%</div>
            <div className="text-sm">Time Savings</div>
          </Card>
          <Card className="p-6">
            <div className="text-3xl font-bold text-purple-600">85%</div>
            <div className="text-sm">User Satisfaction</div>
          </Card>
        </div>
      </div>
    ),
    animation: 'zoom'
  },
  {
    id: 16,
    title: "Advanced AI Models, Vision Systems & Studio Labeling",
    subtitle: "Next-Generation AI Capabilities",
    content: (
      <div className="h-full overflow-y-auto space-y-6 animate-fade-in">
        <Card className="p-6">
          <h3 className="text-xl font-bold mb-4">Advanced Features</h3>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-indigo-500 rounded-full"></div>
              <span>Computer vision integration</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-indigo-500 rounded-full"></div>
              <span>Studio labeling system</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-indigo-500 rounded-full"></div>
              <span>Advanced model training</span>
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
    subtitle: "Comprehensive System Monitoring",
    content: (
      <div className="h-full overflow-y-auto space-y-6 animate-fade-in">
        <div className="grid grid-cols-2 gap-6">
          <Card className="p-6">
            <h4 className="font-bold mb-3">Performance Metrics</h4>
            <ul className="space-y-2 text-sm">
              <li>• Response time tracking</li>
              <li>• Accuracy measurements</li>
              <li>• Usage analytics</li>
            </ul>
          </Card>
          <Card className="p-6">
            <h4 className="font-bold mb-3">Monitoring Tools</h4>
            <ul className="space-y-2 text-sm">
              <li>• Real-time dashboards</li>
              <li>• Alert systems</li>
              <li>• Performance reports</li>
            </ul>
          </Card>
        </div>
      </div>
    ),
    animation: 'slide'
  },
  {
    id: 18,
    title: "Scalability & Enterprise Integration",
    subtitle: "Built for Growth and Enterprise Needs",
    content: (
      <div className="h-full overflow-y-auto space-y-6 animate-fade-in">
        <Card className="p-6">
          <h3 className="text-xl font-bold mb-4">Enterprise Features</h3>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
              <span>Horizontal scaling capabilities</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
              <span>Enterprise security compliance</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
              <span>Multi-tenant architecture</span>
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
    subtitle: "Measurable Business Results",
    content: (
      <div className="h-full overflow-y-auto space-y-6 animate-fade-in">
        <div className="grid grid-cols-3 gap-6 text-center">
          <Card className="p-6">
            <div className="text-3xl font-bold text-green-600">400%</div>
            <div className="text-sm">ROI Increase</div>
          </Card>
          <Card className="p-6">
            <div className="text-3xl font-bold text-blue-600">$2.1M</div>
            <div className="text-sm">Cost Savings</div>
          </Card>
          <Card className="p-6">
            <div className="text-3xl font-bold text-purple-600">6 Mo</div>
            <div className="text-sm">Payback Period</div>
          </Card>
        </div>
      </div>
    ),
    animation: 'fade'
  },
  {
    id: 20,
    title: "Implementation Roadmap & Next Steps",
    subtitle: "Your Path to AI Implementation",
    content: (
      <div className="h-full overflow-y-auto space-y-6 animate-fade-in">
        <div className="grid grid-cols-3 gap-6">
          <Card className="p-6">
            <h4 className="font-bold text-blue-600 mb-3">Phase 1: Setup</h4>
            <ul className="space-y-2 text-sm">
              <li>• Initial configuration</li>
              <li>• Team training</li>
              <li>• Basic implementation</li>
            </ul>
          </Card>
          <Card className="p-6">
            <h4 className="font-bold text-green-600 mb-3">Phase 2: Deploy</h4>
            <ul className="space-y-2 text-sm">
              <li>• AI agent deployment</li>
              <li>• System integration</li>
              <li>• Testing and validation</li>
            </ul>
          </Card>
          <Card className="p-6">
            <h4 className="font-bold text-purple-600 mb-3">Phase 3: Optimize</h4>
            <ul className="space-y-2 text-sm">
              <li>• Performance tuning</li>
              <li>• Advanced features</li>
              <li>• Continuous improvement</li>
            </ul>
          </Card>
        </div>
      </div>
    ),
    animation: 'slide'
  },
  {
    id: 21,
    title: "Contact & Support Information",
    subtitle: "Get Started with AI Implementation Today",
    content: (
      <div className="h-full overflow-y-auto space-y-6 animate-fade-in">
        <div className="text-center space-y-6">
          <div className="w-32 h-32 mx-auto bg-gradient-to-br from-primary to-primary/60 rounded-full flex items-center justify-center animate-pulse">
            <div className="text-4xl">🚀</div>
          </div>
          <div className="space-y-4">
            <h3 className="text-3xl font-bold text-primary">Ready to Transform Your Operations?</h3>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Contact us today to start your AI implementation journey
            </p>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-6">
          <Card className="p-6 text-center">
            <div className="text-2xl mb-2">📧</div>
            <h4 className="font-bold">Email</h4>
            <p className="text-sm">info@aitreatment.com</p>
          </Card>
          <Card className="p-6 text-center">
            <div className="text-2xl mb-2">📞</div>
            <h4 className="font-bold">Phone</h4>
            <p className="text-sm">1-800-AI-CARE</p>
          </Card>
          <Card className="p-6 text-center">
            <div className="text-2xl mb-2">🌐</div>
            <h4 className="font-bold">Website</h4>
            <p className="text-sm">www.aitreatment.com</p>
          </Card>
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
      }, 5000);
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

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const containerClass = cn(
    "bg-background border rounded-lg",
    isFullscreen ? "fixed inset-0 z-50" : "max-w-6xl mx-auto"
  );

  return (
    <div className={containerClass} data-presentation-content data-current-slide={currentSlide}>
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
          <Button variant="outline" size="sm" onClick={toggleFullscreen}>
            <Maximize2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

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
          <div className="flex-1">
            {slides[currentSlide].content}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between p-4 border-t">
        <Button variant="outline" size="sm" onClick={prevSlide}>
          <ChevronLeft className="w-4 h-4 mr-2" />
          Previous
        </Button>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={togglePlay}>
            {isPlaying ? (
              <Pause className="w-4 h-4 mr-2" />
            ) : (
              <Play className="w-4 h-4 mr-2" />
            )}
            {isPlaying ? 'Pause' : 'Play'}
          </Button>
        </div>
        
        <Button variant="outline" size="sm" onClick={nextSlide}>
          Next
          <ChevronRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
};