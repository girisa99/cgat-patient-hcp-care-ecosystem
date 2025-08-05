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
    subtitle: "Configuring AI Models and Tasks",
    content: (
      <div className="h-full overflow-y-auto space-y-6 animate-fade-in">
        <Card className="p-6">
          <h3 className="text-xl font-bold mb-4">AI Configuration</h3>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-2">AI Models</h4>
              <ul className="space-y-2 text-sm">
                <li>• Small Language Models</li>
                <li>• Vision systems</li>
                <li>• Custom trained models</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Task Assignment</h4>
              <ul className="space-y-2 text-sm">
                <li>• Automated workflows</li>
                <li>• Decision trees</li>
                <li>• Response generation</li>
              </ul>
            </div>
          </div>
        </Card>
      </div>
    ),
    animation: 'fade'
  },
  {
    id: 8,
    title: "Step 5: Multi-Channel Deployment",
    subtitle: "Deploying Across All Platforms",
    content: (
      <div className="h-full overflow-y-auto space-y-6 animate-fade-in">
        <div className="grid grid-cols-3 gap-6">
          <Card className="p-6 text-center">
            <div className="text-2xl mb-2">💬</div>
            <h4 className="font-bold">Chat Platforms</h4>
          </Card>
          <Card className="p-6 text-center">
            <div className="text-2xl mb-2">📱</div>
            <h4 className="font-bold">Mobile Apps</h4>
          </Card>
          <Card className="p-6 text-center">
            <div className="text-2xl mb-2">🌐</div>
            <h4 className="font-bold">Web Interface</h4>
          </Card>
        </div>
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
          <h3 className="text-xl font-bold mb-4">MCP Integration</h3>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
              <span>Cross-model communication</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
              <span>Context sharing and session management</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
              <span>Optimized small language models</span>
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
    subtitle: "Retrieval Augmented Generation",
    content: (
      <div className="h-full overflow-y-auto space-y-6 animate-fade-in">
        <Card className="p-6">
          <h3 className="text-xl font-bold mb-4">RAG Implementation</h3>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
              <span>Vector embeddings and semantic search</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
              <span>Real-time knowledge retrieval</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
              <span>Dynamic context enhancement</span>
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
    subtitle: "Choosing the Right AI for Each Task",
    content: (
      <div className="h-full overflow-y-auto space-y-6 animate-fade-in">
        <div className="grid grid-cols-2 gap-6">
          <Card className="p-6">
            <h4 className="font-bold mb-3">Model Types</h4>
            <ul className="space-y-2 text-sm">
              <li>• Conversational AI</li>
              <li>• Document processing</li>
              <li>• Vision recognition</li>
              <li>• Decision making</li>
            </ul>
          </Card>
          <Card className="p-6">
            <h4 className="font-bold mb-3">Assignment Criteria</h4>
            <ul className="space-y-2 text-sm">
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