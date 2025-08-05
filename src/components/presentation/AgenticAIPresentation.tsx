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
    subtitle: "Complete 21-Slide AI Automation Platform for Healthcare Onboarding",
    content: (
      <div className="h-full overflow-y-auto space-y-8 animate-fade-in">
        <div className="text-center space-y-6">
          <div className="w-32 h-32 mx-auto bg-gradient-to-br from-primary to-primary/60 rounded-full flex items-center justify-center animate-pulse">
            <div className="text-4xl">🤖</div>
          </div>
          <div className="space-y-4">
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Comprehensive 21-slide implementation guide for treatment centers featuring advanced AI agent platform 
              with autonomous decision-making, intelligent automation, and seamless integration to transform 
              healthcare onboarding processes
            </p>
          </div>
        </div>

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
                  <span className="text-sm">Workflow orchestration &amp; optimization</span>
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
                  <span className="text-sm">Continuous learning &amp; improvement</span>
                </div>
              </div>
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <h3 className="text-2xl font-bold text-center text-primary">Core Technologies &amp; Capabilities</h3>
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
                  <div>• Web &amp; mobile</div>
                  <div>• Chat platforms</div>
                  <div>• Voice &amp; SMS</div>
                </div>
              </div>
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

        <div className="grid grid-cols-2 gap-8">
          <div className="space-y-4">
            <h3 className="text-2xl font-bold text-primary mb-4">System Components</h3>
            
            <Card className="p-5 bg-gradient-to-r from-blue-500/15 to-blue-500/5 border-l-4 border-blue-500">
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
          </div>
          
          <div className="space-y-4">
            <h3 className="text-2xl font-bold text-primary mb-4">Data Flow Architecture</h3>
            
            <Card className="p-5 bg-gradient-to-r from-orange-500/15 to-orange-500/5 border-l-4 border-orange-500">
              <h4 className="font-bold text-orange-600 mb-3 flex items-center gap-2">
                <span className="text-xl">💾</span> Data Persistence
              </h4>
              <p className="text-sm text-muted-foreground mb-3">
                Supabase with vector embeddings for intelligent data retrieval
              </p>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                  PostgreSQL database
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                  Vector embeddings
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                  Real-time sync
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                  Edge functions
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    ),
    animation: 'slide'
  },
  {
    id: 3,
    title: "Healthcare-Specific AI Agents",
    subtitle: "Specialized Agents for Treatment Center Operations",
    content: (
      <div className="h-full overflow-y-auto space-y-6 animate-fade-in">
        <div className="grid grid-cols-2 gap-8">
          <div className="space-y-6">
            <Card className="p-6 bg-gradient-to-br from-cyan-500/20 to-cyan-500/5 border-2 border-cyan-500/30">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-cyan-600 to-cyan-700 rounded-full flex items-center justify-center">
                  <span className="text-white text-xl">👥</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-cyan-600">Patient Intake Agent</h3>
                  <p className="text-sm text-muted-foreground">Automated patient onboarding</p>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-cyan-500 rounded-full"></div>
                  <span className="text-sm">Insurance verification</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-cyan-500 rounded-full"></div>
                  <span className="text-sm">Medical history collection</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-cyan-500 rounded-full"></div>
                  <span className="text-sm">Document processing</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-cyan-500 rounded-full"></div>
                  <span className="text-sm">Risk assessment</span>
                </div>
              </div>
            </Card>

            <Card className="p-6 bg-gradient-to-br from-emerald-500/20 to-emerald-500/5 border-2 border-emerald-500/30">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-600 to-emerald-700 rounded-full flex items-center justify-center">
                  <span className="text-white text-xl">🩺</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-emerald-600">Treatment Coordinator</h3>
                  <p className="text-sm text-muted-foreground">Care plan management</p>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
                  <span className="text-sm">Treatment planning</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
                  <span className="text-sm">Resource allocation</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
                  <span className="text-sm">Progress tracking</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
                  <span className="text-sm">Care team coordination</span>
                </div>
              </div>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="p-6 bg-gradient-to-br from-amber-500/20 to-amber-500/5 border-2 border-amber-500/30">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-amber-600 to-amber-700 rounded-full flex items-center justify-center">
                  <span className="text-white text-xl">💬</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-amber-600">Communication Hub</h3>
                  <p className="text-sm text-muted-foreground">Multi-channel messaging</p>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-amber-500 rounded-full"></div>
                  <span className="text-sm">Appointment reminders</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-amber-500 rounded-full"></div>
                  <span className="text-sm">Family notifications</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-amber-500 rounded-full"></div>
                  <span className="text-sm">Emergency alerts</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-amber-500 rounded-full"></div>
                  <span className="text-sm">Status updates</span>
                </div>
              </div>
            </Card>

            <Card className="p-6 bg-gradient-to-br from-rose-500/20 to-rose-500/5 border-2 border-rose-500/30">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-rose-600 to-rose-700 rounded-full flex items-center justify-center">
                  <span className="text-white text-xl">💰</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-rose-600">Financial Manager</h3>
                  <p className="text-sm text-muted-foreground">Billing &amp; insurance</p>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-rose-500 rounded-full"></div>
                  <span className="text-sm">Claims processing</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-rose-500 rounded-full"></div>
                  <span className="text-sm">Payment tracking</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-rose-500 rounded-full"></div>
                  <span className="text-sm">Financial counseling</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-rose-500 rounded-full"></div>
                  <span className="text-sm">Revenue optimization</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    ),
    animation: 'zoom'
  },
  {
    id: 4,
    title: "Patient Onboarding Automation",
    subtitle: "Streamlined Healthcare Journey Management",
    content: (
      <div className="h-full overflow-y-auto space-y-6 animate-fade-in">
        <div className="grid grid-cols-2 gap-8">
          <div className="space-y-6">
            <h3 className="text-2xl font-bold text-primary mb-4">Automated Workflow Steps</h3>
            
            <Card className="p-5 bg-gradient-to-r from-blue-500/15 to-blue-500/5 border-l-4 border-blue-500">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-sm">1</div>
                <h4 className="font-bold text-blue-600">Initial Contact</h4>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                AI agent captures inquiry details and schedules preliminary assessment
              </p>
              <div className="space-y-2 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span>24/7 availability via web, phone, or chat</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span>Immediate crisis assessment and routing</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span>Automatic calendar integration</span>
                </div>
              </div>
            </Card>

            <Card className="p-5 bg-gradient-to-r from-green-500/15 to-green-500/5 border-l-4 border-green-500">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white font-bold text-sm">2</div>
                <h4 className="font-bold text-green-600">Insurance Verification</h4>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                Automated benefits verification and pre-authorization management
              </p>
              <div className="space-y-2 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Real-time eligibility checking</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Automatic pre-auth submission</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Coverage limitations identification</span>
                </div>
              </div>
            </Card>
          </div>

          <div className="space-y-6">
            <h3 className="text-2xl font-bold text-primary mb-4">Key Benefits &amp; Metrics</h3>
            
            <Card className="p-6 bg-gradient-to-br from-emerald-500/20 to-emerald-500/5 border-2 border-emerald-500/30">
              <h4 className="font-bold text-emerald-600 mb-4 flex items-center gap-2">
                <span className="text-xl">⚡</span> Process Acceleration
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-emerald-600">75%</div>
                  <div className="text-sm text-muted-foreground">Faster intake</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-emerald-600">24/7</div>
                  <div className="text-sm text-muted-foreground">Availability</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-emerald-600">90%</div>
                  <div className="text-sm text-muted-foreground">Automation</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-emerald-600">50%</div>
                  <div className="text-sm text-muted-foreground">Cost reduction</div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    ),
    animation: 'fade'
  },
  {
    id: 5,
    title: "MCP Integration Framework",
    subtitle: "Model Context Protocol for Seamless AI Communication",
    content: (
      <div className="h-full overflow-y-auto space-y-6 animate-fade-in">
        <div className="text-center mb-8">
          <div className="w-24 h-24 mx-auto bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center mb-4">
            <span className="text-white text-3xl">🔗</span>
          </div>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Revolutionary protocol enabling AI models to share context, tools, and knowledge seamlessly across healthcare workflows
          </p>
        </div>

        <div className="grid grid-cols-3 gap-6">
          <Card className="p-6 bg-gradient-to-br from-blue-500/20 to-blue-500/5 border-2 border-blue-500/30">
            <h3 className="text-xl font-bold text-blue-600 mb-4 flex items-center gap-2">
              <span className="text-2xl">🤝</span> Context Sharing
            </h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span className="text-sm">Cross-model memory</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span className="text-sm">Session persistence</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span className="text-sm">Knowledge graphs</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span className="text-sm">Real-time sync</span>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-green-500/20 to-green-500/5 border-2 border-green-500/30">
            <h3 className="text-xl font-bold text-green-600 mb-4 flex items-center gap-2">
              <span className="text-2xl">🛠️</span> Tool Integration
            </h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm">Healthcare APIs</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm">EHR connectors</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm">Billing systems</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm">Communication tools</span>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-purple-500/20 to-purple-500/5 border-2 border-purple-500/30">
            <h3 className="text-xl font-bold text-purple-600 mb-4 flex items-center gap-2">
              <span className="text-2xl">🧠</span> Intelligence Layer
            </h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                <span className="text-sm">Multi-model reasoning</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                <span className="text-sm">Decision coordination</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                <span className="text-sm">Workflow optimization</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                <span className="text-sm">Adaptive learning</span>
              </div>
            </div>
          </Card>
        </div>

        <Card className="p-6 bg-gradient-to-br from-slate-500/20 to-slate-500/5 border-2 border-slate-500/30">
          <h3 className="text-xl font-bold text-slate-600 mb-4 flex items-center gap-2">
            <span className="text-2xl">🌐</span> Healthcare-Specific MCP Servers
          </h3>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-base mb-3">Clinical Operations Server</h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-slate-500 rounded-full"></div>
                  <span>Patient data management</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-slate-500 rounded-full"></div>
                  <span>Treatment protocol automation</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-slate-500 rounded-full"></div>
                  <span>Compliance monitoring</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-slate-500 rounded-full"></div>
                  <span>Quality assurance</span>
                </div>
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-base mb-3">Administrative Server</h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-slate-500 rounded-full"></div>
                  <span>Insurance verification</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-slate-500 rounded-full"></div>
                  <span>Billing automation</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-slate-500 rounded-full"></div>
                  <span>Scheduling coordination</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-slate-500 rounded-full"></div>
                  <span>Reporting &amp; analytics</span>
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
    id: 6,
    title: "RAG Knowledge System",
    subtitle: "Retrieval Augmented Generation for Healthcare Intelligence",
    content: (
      <div className="h-full overflow-y-auto space-y-6 animate-fade-in">
        <div className="text-center mb-8">
          <div className="w-24 h-24 mx-auto bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center mb-4">
            <span className="text-white text-3xl">🧠</span>
          </div>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Advanced knowledge retrieval system that enhances AI decision-making with real-time access to healthcare data, protocols, and best practices
          </p>
        </div>

        <div className="grid grid-cols-2 gap-8">
          <div className="space-y-6">
            <Card className="p-6 bg-gradient-to-br from-orange-500/20 to-orange-500/5 border-2 border-orange-500/30">
              <h3 className="text-xl font-bold text-orange-600 mb-4 flex items-center gap-2">
                <span className="text-2xl">📚</span> Knowledge Sources
              </h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                  <span className="text-sm">Clinical guidelines &amp; protocols</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                  <span className="text-sm">Patient treatment histories</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                  <span className="text-sm">Regulatory compliance docs</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                  <span className="text-sm">Medical research &amp; evidence</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                  <span className="text-sm">Insurance policies &amp; procedures</span>
                </div>
              </div>
            </Card>

            <Card className="p-6 bg-gradient-to-br from-blue-500/20 to-blue-500/5 border-2 border-blue-500/30">
              <h3 className="text-xl font-bold text-blue-600 mb-4 flex items-center gap-2">
                <span className="text-2xl">🔍</span> Retrieval Process
              </h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold">1</div>
                  <div>
                    <h4 className="font-semibold text-sm">Query Analysis</h4>
                    <p className="text-xs text-muted-foreground">Natural language understanding &amp; intent recognition</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold">2</div>
                  <div>
                    <h4 className="font-semibold text-sm">Vector Search</h4>
                    <p className="text-xs text-muted-foreground">Semantic similarity matching across knowledge base</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold">3</div>
                  <div>
                    <h4 className="font-semibold text-sm">Context Integration</h4>
                    <p className="text-xs text-muted-foreground">Relevant information synthesis &amp; ranking</p>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="p-6 bg-gradient-to-br from-green-500/20 to-green-500/5 border-2 border-green-500/30">
              <h3 className="text-xl font-bold text-green-600 mb-4 flex items-center gap-2">
                <span className="text-2xl">⚡</span> Performance Metrics
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">&lt;500ms</div>
                  <div className="text-sm text-muted-foreground">Query response</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">95%</div>
                  <div className="text-sm text-muted-foreground">Accuracy rate</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">50M+</div>
                  <div className="text-sm text-muted-foreground">Documents indexed</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">24/7</div>
                  <div className="text-sm text-muted-foreground">Availability</div>
                </div>
              </div>
            </Card>

            <Card className="p-6 bg-gradient-to-br from-purple-500/20 to-purple-500/5 border-2 border-purple-500/30">
              <h3 className="text-xl font-bold text-purple-600 mb-4 flex items-center gap-2">
                <span className="text-2xl">🎯</span> Use Cases
              </h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                  <span className="text-sm">Treatment recommendation support</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                  <span className="text-sm">Compliance checking &amp; validation</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                  <span className="text-sm">Clinical decision support</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                  <span className="text-sm">Insurance authorization assistance</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                  <span className="text-sm">Patient education content</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    ),
    animation: 'zoom'
  },
  {
    id: 7,
    title: "Small Language Models Optimization",
    subtitle: "Cost-Effective AI with Healthcare Domain Expertise",
    content: (
      <div className="h-full overflow-y-auto space-y-6 animate-fade-in">
        <div className="text-center mb-8">
          <div className="w-24 h-24 mx-auto bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center mb-4">
            <span className="text-white text-3xl">🚀</span>
          </div>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Specialized smaller AI models fine-tuned for healthcare tasks, delivering faster responses and lower costs while maintaining high accuracy
          </p>
        </div>

        <div className="grid grid-cols-3 gap-6 mb-8">
          <Card className="p-6 bg-gradient-to-br from-red-500/20 to-red-500/5 border-2 border-red-500/30">
            <div className="text-center">
              <div className="text-4xl font-bold text-red-600 mb-2">10x</div>
              <div className="text-sm text-muted-foreground">Faster Processing</div>
              <p className="text-xs mt-2">Optimized inference pipeline for real-time healthcare responses</p>
            </div>
          </Card>
          
          <Card className="p-6 bg-gradient-to-br from-green-500/20 to-green-500/5 border-2 border-green-500/30">
            <div className="text-center">
              <div className="text-4xl font-bold text-green-600 mb-2">75%</div>
              <div className="text-sm text-muted-foreground">Cost Reduction</div>
              <p className="text-xs mt-2">Significantly lower operational costs compared to large models</p>
            </div>
          </Card>
          
          <Card className="p-6 bg-gradient-to-br from-blue-500/20 to-blue-500/5 border-2 border-blue-500/30">
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">95%</div>
              <div className="text-sm text-muted-foreground">Domain Accuracy</div>
              <p className="text-xs mt-2">Specialized training on healthcare data and protocols</p>
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-2 gap-8">
          <div className="space-y-6">
            <Card className="p-6 bg-gradient-to-br from-purple-500/20 to-purple-500/5 border-2 border-purple-500/30">
              <h3 className="text-xl font-bold text-purple-600 mb-4 flex items-center gap-2">
                <span className="text-2xl">🎯</span> Model Specialization
              </h3>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-sm mb-2">Patient Intake Model (7B params)</h4>
                  <div className="space-y-1 text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                      <span>Insurance verification &amp; eligibility</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                      <span>Medical history processing</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                      <span>Risk assessment algorithms</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold text-sm mb-2">Clinical Support Model (13B params)</h4>
                  <div className="space-y-1 text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                      <span>Treatment planning assistance</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                      <span>Drug interaction checking</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                      <span>Care coordination workflows</span>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="p-6 bg-gradient-to-br from-indigo-500/20 to-indigo-500/5 border-2 border-indigo-500/30">
              <h3 className="text-xl font-bold text-indigo-600 mb-4 flex items-center gap-2">
                <span className="text-2xl">🔧</span> Technical Optimizations
              </h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-indigo-500 rounded-full"></div>
                  <span className="text-sm">Quantization &amp; pruning techniques</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-indigo-500 rounded-full"></div>
                  <span className="text-sm">Edge deployment capabilities</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-indigo-500 rounded-full"></div>
                  <span className="text-sm">GPU optimization for inference</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-indigo-500 rounded-full"></div>
                  <span className="text-sm">Batch processing efficiency</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-indigo-500 rounded-full"></div>
                  <span className="text-sm">Memory-efficient attention</span>
                </div>
              </div>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="p-6 bg-gradient-to-br from-amber-500/20 to-amber-500/5 border-2 border-amber-500/30">
              <h3 className="text-xl font-bold text-amber-600 mb-4 flex items-center gap-2">
                <span className="text-2xl">📊</span> Performance Comparison
              </h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Response Time</span>
                    <span className="font-semibold">Small LLM vs Large LLM</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-amber-500 h-2 rounded-full" style={{width: '15%'}}></div>
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">150ms vs 1.5s average</div>
                </div>
                
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Cost per Request</span>
                    <span className="font-semibold">75% Reduction</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-green-500 h-2 rounded-full" style={{width: '25%'}}></div>
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">$0.001 vs $0.004 per 1K tokens</div>
                </div>
                
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Healthcare Accuracy</span>
                    <span className="font-semibold">Comparable</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-500 h-2 rounded-full" style={{width: '95%'}}></div>
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">95% vs 97% on domain tasks</div>
                </div>
              </div>
            </Card>

            <Card className="p-6 bg-gradient-to-br from-teal-500/20 to-teal-500/5 border-2 border-teal-500/30">
              <h3 className="text-xl font-bold text-teal-600 mb-4 flex items-center gap-2">
                <span className="text-2xl">🌐</span> Deployment Options
              </h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-teal-500 rounded-full"></div>
                  <span className="text-sm">Cloud-native deployment</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-teal-500 rounded-full"></div>
                  <span className="text-sm">On-premises installation</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-teal-500 rounded-full"></div>
                  <span className="text-sm">Hybrid cloud architecture</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-teal-500 rounded-full"></div>
                  <span className="text-sm">Edge computing support</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-teal-500 rounded-full"></div>
                  <span className="text-sm">Auto-scaling capabilities</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    ),
    animation: 'fade'
  },
  {
    id: 8,
    title: "Multi-Channel Deployment",
    subtitle: "Universal AI Agent Access Across All Platforms",
    content: (
      <div className="h-full overflow-y-auto space-y-6 animate-fade-in">
        <div className="text-center mb-8">
          <div className="w-24 h-24 mx-auto bg-gradient-to-br from-teal-500 to-teal-600 rounded-full flex items-center justify-center mb-4">
            <span className="text-white text-3xl">📱</span>
          </div>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Deploy your AI agents across every channel your patients use, ensuring seamless healthcare support wherever they are
          </p>
        </div>

        <div className="grid grid-cols-4 gap-6 mb-8">
          <Card className="p-6 bg-gradient-to-br from-blue-500/20 to-blue-500/5 border-2 border-blue-500/30 hover:scale-105 transition-transform">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-blue-700 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-white text-2xl">🌐</span>
              </div>
              <h4 className="font-bold text-blue-700 text-base mb-2">Web Portal</h4>
              <p className="text-sm text-muted-foreground mb-3">Complete online experience</p>
              <div className="space-y-1 text-xs">
                <div>• Responsive design</div>
                <div>• Real-time chat</div>
                <div>• Document upload</div>
                <div>• Progress tracking</div>
              </div>
            </div>
          </Card>
          
          <Card className="p-6 bg-gradient-to-br from-green-500/20 to-green-500/5 border-2 border-green-500/30 hover:scale-105 transition-transform">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-green-600 to-green-700 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-white text-2xl">📱</span>
              </div>
              <h4 className="font-bold text-green-700 text-base mb-2">Mobile App</h4>
              <p className="text-sm text-muted-foreground mb-3">Native iOS/Android</p>
              <div className="space-y-1 text-xs">
                <div>• Push notifications</div>
                <div>• Offline support</div>
                <div>• Biometric auth</div>
                <div>• Location services</div>
              </div>
            </div>
          </Card>
          
          <Card className="p-6 bg-gradient-to-br from-purple-500/20 to-purple-500/5 border-2 border-purple-500/30 hover:scale-105 transition-transform">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-purple-700 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-white text-2xl">☎️</span>
              </div>
              <h4 className="font-bold text-purple-700 text-base mb-2">Voice Support</h4>
              <p className="text-sm text-muted-foreground mb-3">Phone &amp; voice AI</p>
              <div className="space-y-1 text-xs">
                <div>• Natural speech</div>
                <div>• Multi-language</div>
                <div>• Call routing</div>
                <div>• Voice transcription</div>
              </div>
            </div>
          </Card>
          
          <Card className="p-6 bg-gradient-to-br from-orange-500/20 to-orange-500/5 border-2 border-orange-500/30 hover:scale-105 transition-transform">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-orange-600 to-orange-700 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-white text-2xl">💬</span>
              </div>
              <h4 className="font-bold text-orange-700 text-base mb-2">Messaging</h4>
              <p className="text-sm text-muted-foreground mb-3">SMS &amp; chat platforms</p>
              <div className="space-y-1 text-xs">
                <div>• WhatsApp integration</div>
                <div>• SMS automation</div>
                <div>• Telegram support</div>
                <div>• Rich media messages</div>
              </div>
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-2 gap-8">
          <div className="space-y-6">
            <Card className="p-6 bg-gradient-to-br from-indigo-500/20 to-indigo-500/5 border-2 border-indigo-500/30">
              <h3 className="text-xl font-bold text-indigo-600 mb-4 flex items-center gap-2">
                <span className="text-2xl">🔄</span> Unified Experience
              </h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-indigo-500 rounded-full"></div>
                  <span className="text-sm">Consistent AI personality across channels</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-indigo-500 rounded-full"></div>
                  <span className="text-sm">Seamless conversation handoffs</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-indigo-500 rounded-full"></div>
                  <span className="text-sm">Shared context &amp; memory</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-indigo-500 rounded-full"></div>
                  <span className="text-sm">Synchronized data updates</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-indigo-500 rounded-full"></div>
                  <span className="text-sm">Universal authentication</span>
                </div>
              </div>
            </Card>

            <Card className="p-6 bg-gradient-to-br from-rose-500/20 to-rose-500/5 border-2 border-rose-500/30">
              <h3 className="text-xl font-bold text-rose-600 mb-4 flex items-center gap-2">
                <span className="text-2xl">🚀</span> Rapid Deployment
              </h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-rose-500 rounded-full"></div>
                  <span className="text-sm">One-click channel activation</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-rose-500 rounded-full"></div>
                  <span className="text-sm">Pre-built integrations</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-rose-500 rounded-full"></div>
                  <span className="text-sm">Custom branding options</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-rose-500 rounded-full"></div>
                  <span className="text-sm">Automated testing &amp; QA</span>
                </div>
              </div>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="p-6 bg-gradient-to-br from-emerald-500/20 to-emerald-500/5 border-2 border-emerald-500/30">
              <h3 className="text-xl font-bold text-emerald-600 mb-4 flex items-center gap-2">
                <span className="text-2xl">📊</span> Analytics &amp; Insights
              </h3>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-emerald-600">89%</div>
                  <div className="text-xs text-muted-foreground">Mobile usage</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-emerald-600">67%</div>
                  <div className="text-xs text-muted-foreground">Web portal</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-emerald-600">45%</div>
                  <div className="text-xs text-muted-foreground">Voice calls</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-emerald-600">78%</div>
                  <div className="text-xs text-muted-foreground">SMS/messaging</div>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                Real-time usage analytics help optimize channel performance and patient engagement
              </p>
            </Card>

            <Card className="p-6 bg-gradient-to-br from-cyan-500/20 to-cyan-500/5 border-2 border-cyan-500/30">
              <h3 className="text-xl font-bold text-cyan-600 mb-4 flex items-center gap-2">
                <span className="text-2xl">🛡️</span> Security &amp; Compliance
              </h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-cyan-500 rounded-full"></div>
                  <span className="text-sm">End-to-end encryption</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-cyan-500 rounded-full"></div>
                  <span className="text-sm">HIPAA compliance across all channels</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-cyan-500 rounded-full"></div>
                  <span className="text-sm">Multi-factor authentication</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-cyan-500 rounded-full"></div>
                  <span className="text-sm">Audit trails &amp; logging</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    ),
    animation: 'slide'
  },
  {
    id: 9,
    title: "Implementation Roadmap",
    subtitle: "90-Day Deployment Strategy for Treatment Centers",
    content: (
      <div className="h-full overflow-y-auto space-y-6 animate-fade-in">
        <div className="text-center mb-8">
          <div className="w-24 h-24 mx-auto bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-full flex items-center justify-center mb-4">
            <span className="text-white text-3xl">🗺️</span>
          </div>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Structured 90-day implementation plan designed to minimize disruption while maximizing adoption and ROI
          </p>
        </div>

        <div className="space-y-8">
          <Card className="p-6 bg-gradient-to-br from-blue-500/20 to-blue-500/5 border-2 border-blue-500/30">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-blue-700 rounded-full flex items-center justify-center">
                <span className="text-white text-2xl font-bold">1</span>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-blue-600">Phase 1: Foundation (Days 1-30)</h3>
                <p className="text-muted-foreground">Infrastructure setup and core agent deployment</p>
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-6">
              <div>
                <h4 className="font-bold text-base mb-3 text-blue-700">Week 1-2: Setup</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span>Environment provisioning</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span>Security configuration</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span>Data migration planning</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span>Team training kickoff</span>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="font-bold text-base mb-3 text-blue-700">Week 3: Integration</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span>EHR system connection</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span>Insurance API setup</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span>Communication tools</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span>Basic agent deployment</span>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="font-bold text-base mb-3 text-blue-700">Week 4: Testing</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span>Pilot group testing</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span>Workflow validation</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span>Performance optimization</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span>Initial feedback collection</span>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-green-500/20 to-green-500/5 border-2 border-green-500/30">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-green-600 to-green-700 rounded-full flex items-center justify-center">
                <span className="text-white text-2xl font-bold">2</span>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-green-600">Phase 2: Expansion (Days 31-60)</h3>
                <p className="text-muted-foreground">Full agent deployment and advanced feature activation</p>
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-6">
              <div>
                <h4 className="font-bold text-base mb-3 text-green-700">Week 5-6: Deployment</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>All 6 core agents active</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>Multi-channel activation</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>Staff training completion</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>Patient education launch</span>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="font-bold text-base mb-3 text-green-700">Week 7: Optimization</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>AI model fine-tuning</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>Workflow automation</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>Performance monitoring</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>Compliance validation</span>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="font-bold text-base mb-3 text-green-700">Week 8: Analytics</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>Dashboard deployment</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>KPI tracking setup</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>Automated reporting</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>ROI measurement</span>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-purple-500/20 to-purple-500/5 border-2 border-purple-500/30">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-purple-700 rounded-full flex items-center justify-center">
                <span className="text-white text-2xl font-bold">3</span>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-purple-600">Phase 3: Optimization (Days 61-90)</h3>
                <p className="text-muted-foreground">Advanced features and continuous improvement</p>
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-6">
              <div>
                <h4 className="font-bold text-base mb-3 text-purple-700">Week 9-10: Advanced</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <span>Predictive analytics</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <span>Custom agent creation</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <span>Advanced integrations</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <span>Mobile app deployment</span>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="font-bold text-base mb-3 text-purple-700">Week 11: Scale</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <span>Full patient rollout</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <span>Partner integrations</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <span>Volume testing</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <span>Performance tuning</span>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="font-bold text-base mb-3 text-purple-700">Week 12: Review</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <span>Comprehensive audit</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <span>Success metrics review</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <span>Future roadmap planning</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <span>Go-live celebration</span>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    ),
    animation: 'zoom'
  },
  {
    id: 10,
    title: "Security & Compliance Framework",
    subtitle: "HIPAA-Compliant AI with Enterprise-Grade Security",
    content: (
      <div className="h-full overflow-y-auto space-y-6 animate-fade-in">
        <div className="text-center mb-8">
          <div className="w-24 h-24 mx-auto bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center mb-4">
            <span className="text-white text-3xl">🛡️</span>
          </div>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Comprehensive security architecture ensuring patient data protection and regulatory compliance across all AI operations
          </p>
        </div>

        <div className="grid grid-cols-2 gap-8 mb-8">
          <Card className="p-6 bg-gradient-to-br from-red-500/20 to-red-500/5 border-2 border-red-500/30">
            <h3 className="text-xl font-bold text-red-600 mb-4 flex items-center gap-2">
              <span className="text-2xl">🏥</span> HIPAA Compliance
            </h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <span className="text-sm">Business Associate Agreements (BAA)</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <span className="text-sm">Administrative safeguards</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <span className="text-sm">Physical safeguards</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <span className="text-sm">Technical safeguards</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <span className="text-sm">Minimum necessary standard</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <span className="text-sm">Breach notification procedures</span>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-blue-500/20 to-blue-500/5 border-2 border-blue-500/30">
            <h3 className="text-xl font-bold text-blue-600 mb-4 flex items-center gap-2">
              <span className="text-2xl">🔐</span> Data Encryption
            </h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span className="text-sm">AES-256 encryption at rest</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span className="text-sm">TLS 1.3 in transit</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span className="text-sm">End-to-end encryption</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span className="text-sm">Key management service</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span className="text-sm">Encrypted backups</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span className="text-sm">Secure key rotation</span>
              </div>
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-3 gap-6 mb-8">
          <Card className="p-6 bg-gradient-to-br from-green-500/20 to-green-500/5 border-2 border-green-500/30">
            <h3 className="text-xl font-bold text-green-600 mb-4 flex items-center gap-2">
              <span className="text-2xl">👤</span> Access Control
            </h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm">Role-based access (RBAC)</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm">Multi-factor authentication</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm">Single sign-on (SSO)</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm">Session management</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm">Privilege escalation controls</span>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-purple-500/20 to-purple-500/5 border-2 border-purple-500/30">
            <h3 className="text-xl font-bold text-purple-600 mb-4 flex items-center gap-2">
              <span className="text-2xl">📊</span> Audit &amp; Monitoring
            </h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                <span className="text-sm">Comprehensive audit logs</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                <span className="text-sm">Real-time monitoring</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                <span className="text-sm">Anomaly detection</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                <span className="text-sm">Compliance reporting</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                <span className="text-sm">Incident response</span>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-orange-500/20 to-orange-500/5 border-2 border-orange-500/30">
            <h3 className="text-xl font-bold text-orange-600 mb-4 flex items-center gap-2">
              <span className="text-2xl">🏗️</span> Infrastructure
            </h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                <span className="text-sm">SOC 2 Type II certified</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                <span className="text-sm">ISO 27001 compliant</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                <span className="text-sm">FedRAMP authorized</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                <span className="text-sm">Private cloud deployment</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                <span className="text-sm">Network segmentation</span>
              </div>
            </div>
          </Card>
        </div>

        <Card className="p-6 bg-gradient-to-br from-slate-500/20 to-slate-500/5 border-2 border-slate-500/30">
          <h3 className="text-xl font-bold text-slate-600 mb-4 flex items-center gap-2">
            <span className="text-2xl">🔍</span> AI-Specific Security Measures
          </h3>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-base mb-3">Model Security</h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-slate-500 rounded-full"></div>
                  <span>Model versioning &amp; integrity checks</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-slate-500 rounded-full"></div>
                  <span>Input validation &amp; sanitization</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-slate-500 rounded-full"></div>
                  <span>Output filtering &amp; monitoring</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-slate-500 rounded-full"></div>
                  <span>Prompt injection protection</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-slate-500 rounded-full"></div>
                  <span>Adversarial attack detection</span>
                </div>
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-base mb-3">Data Privacy</h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-slate-500 rounded-full"></div>
                  <span>Data minimization principles</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-slate-500 rounded-full"></div>
                  <span>Differential privacy techniques</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-slate-500 rounded-full"></div>
                  <span>Federated learning support</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-slate-500 rounded-full"></div>
                  <span>Right to erasure compliance</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-slate-500 rounded-full"></div>
                  <span>Data lineage tracking</span>
                </div>
              </div>
            </div>
          </div>
        </Card>
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