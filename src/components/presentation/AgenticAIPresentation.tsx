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
    title: "AI Agent Architecture Overview",
    subtitle: "Multi-Agent System Design for Healthcare Automation",
    content: (
      <div className="h-full overflow-y-auto space-y-8 animate-slide-in">
        <div className="grid grid-cols-2 gap-8">
          <Card className="p-6 bg-gradient-to-br from-blue-500/15 to-blue-500/5 border-l-4 border-blue-500">
            <h3 className="text-xl font-bold text-blue-600 mb-4 flex items-center gap-2">
              <span className="text-2xl">🏗️</span> System Architecture
            </h3>
            <div className="space-y-4">
              <div className="bg-white/50 p-4 rounded-lg border">
                <h4 className="font-semibold mb-2">Agent Orchestrator</h4>
                <p className="text-sm text-muted-foreground">Central coordination hub managing all AI agents</p>
              </div>
              <div className="bg-white/50 p-4 rounded-lg border">
                <h4 className="font-semibold mb-2">Specialized Agents</h4>
                <p className="text-sm text-muted-foreground">Domain-specific agents for different healthcare tasks</p>
              </div>
              <div className="bg-white/50 p-4 rounded-lg border">
                <h4 className="font-semibold mb-2">Knowledge Base</h4>
                <p className="text-sm text-muted-foreground">Centralized repository of healthcare knowledge</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-green-500/15 to-green-500/5 border-l-4 border-green-500">
            <h3 className="text-xl font-bold text-green-600 mb-4 flex items-center gap-2">
              <span className="text-2xl">🤖</span> Agent Types
            </h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-white/50 rounded-lg">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm font-medium">Intake Agent</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-white/50 rounded-lg">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm font-medium">Assessment Agent</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-white/50 rounded-lg">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm font-medium">Scheduling Agent</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-white/50 rounded-lg">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm font-medium">Documentation Agent</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-white/50 rounded-lg">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm font-medium">Compliance Agent</span>
              </div>
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-3 gap-6">
          <Card className="p-6 bg-gradient-to-br from-purple-500/15 to-purple-500/5 border-l-4 border-purple-500">
            <h4 className="font-bold text-purple-600 mb-4 flex items-center gap-2">
              <span className="text-xl">🔄</span> Agent Communication
            </h4>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                <span className="text-sm">Message passing protocols</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                <span className="text-sm">Event-driven architecture</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                <span className="text-sm">Shared context management</span>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-orange-500/15 to-orange-500/5 border-l-4 border-orange-500">
            <h4 className="font-bold text-orange-600 mb-4 flex items-center gap-2">
              <span className="text-xl">🎯</span> Decision Making
            </h4>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                <span className="text-sm">Rule-based reasoning</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                <span className="text-sm">Machine learning models</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                <span className="text-sm">Consensus mechanisms</span>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-teal-500/15 to-teal-500/5 border-l-4 border-teal-500">
            <h4 className="font-bold text-teal-600 mb-4 flex items-center gap-2">
              <span className="text-xl">📊</span> Monitoring & Control
            </h4>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-teal-500 rounded-full"></div>
                <span className="text-sm">Real-time performance metrics</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-teal-500 rounded-full"></div>
                <span className="text-sm">Automated error handling</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-teal-500 rounded-full"></div>
                <span className="text-sm">Human oversight controls</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    ),
    animation: 'slide'
  },
  {
    id: 3,
    title: "Patient Intake Automation",
    subtitle: "Streamlined Onboarding with AI-Powered Intelligence",
    content: (
      <div className="h-full overflow-y-auto space-y-8 animate-zoom-in">
        <div className="grid grid-cols-2 gap-8">
          <Card className="p-6 bg-gradient-to-br from-indigo-500/15 to-indigo-500/5 border-l-4 border-indigo-500">
            <h3 className="text-xl font-bold text-indigo-600 mb-4 flex items-center gap-2">
              <span className="text-2xl">📋</span> Automated Intake Process
            </h3>
            <div className="space-y-4">
              <div className="bg-white/50 p-4 rounded-lg border">
                <h4 className="font-semibold mb-2 text-indigo-700">1. Initial Contact</h4>
                <p className="text-sm text-muted-foreground">AI chatbot captures basic information and assesses urgency</p>
              </div>
              <div className="bg-white/50 p-4 rounded-lg border">
                <h4 className="font-semibold mb-2 text-indigo-700">2. Form Generation</h4>
                <p className="text-sm text-muted-foreground">Dynamic forms created based on patient responses</p>
              </div>
              <div className="bg-white/50 p-4 rounded-lg border">
                <h4 className="font-semibold mb-2 text-indigo-700">3. Document Processing</h4>
                <p className="text-sm text-muted-foreground">OCR and NLP extract data from uploaded documents</p>
              </div>
              <div className="bg-white/50 p-4 rounded-lg border">
                <h4 className="font-semibold mb-2 text-indigo-700">4. Verification</h4>
                <p className="text-sm text-muted-foreground">Automated verification of insurance and eligibility</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-emerald-500/15 to-emerald-500/5 border-l-4 border-emerald-500">
            <h3 className="text-xl font-bold text-emerald-600 mb-4 flex items-center gap-2">
              <span className="text-2xl">🎯</span> Smart Routing
            </h3>
            <div className="space-y-4">
              <div className="bg-white/50 p-4 rounded-lg border">
                <h4 className="font-semibold mb-2 text-emerald-700">Priority Assessment</h4>
                <p className="text-sm text-muted-foreground">AI evaluates urgency and routes to appropriate care level</p>
              </div>
              <div className="bg-white/50 p-4 rounded-lg border">
                <h4 className="font-semibold mb-2 text-emerald-700">Specialist Matching</h4>
                <p className="text-sm text-muted-foreground">Matches patients with best-fit treatment specialists</p>
              </div>
              <div className="bg-white/50 p-4 rounded-lg border">
                <h4 className="font-semibold mb-2 text-emerald-700">Capacity Management</h4>
                <p className="text-sm text-muted-foreground">Real-time bed availability and resource allocation</p>
              </div>
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-4 gap-6">
          <Card className="p-6 bg-gradient-to-br from-blue-500/20 to-blue-500/5 border-2 border-blue-500/30">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-blue-700 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-white text-2xl">📞</span>
              </div>
              <h4 className="font-bold text-blue-700 text-base mb-2">24/7 Availability</h4>
              <p className="text-sm text-muted-foreground">Always-on intake support</p>
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-green-500/20 to-green-500/5 border-2 border-green-500/30">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-green-600 to-green-700 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-white text-2xl">⚡</span>
              </div>
              <h4 className="font-bold text-green-700 text-base mb-2">Instant Processing</h4>
              <p className="text-sm text-muted-foreground">Real-time data validation</p>
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-purple-500/20 to-purple-500/5 border-2 border-purple-500/30">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-purple-700 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-white text-2xl">🔒</span>
              </div>
              <h4 className="font-bold text-purple-700 text-base mb-2">HIPAA Compliant</h4>
              <p className="text-sm text-muted-foreground">Secure data handling</p>
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-orange-500/20 to-orange-500/5 border-2 border-orange-500/30">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-orange-600 to-orange-700 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-white text-2xl">📊</span>
              </div>
              <h4 className="font-bold text-orange-700 text-base mb-2">Analytics Ready</h4>
              <p className="text-sm text-muted-foreground">Built-in reporting</p>
            </div>
          </Card>
        </div>
      </div>
    ),
    animation: 'zoom'
  },
  {
    id: 4,
    title: "Intelligent Assessment Engine",
    subtitle: "AI-Powered Clinical Decision Support",
    content: (
      <div className="h-full overflow-y-auto space-y-8 animate-flip-in">
        <div className="grid grid-cols-2 gap-8">
          <Card className="p-6 bg-gradient-to-br from-rose-500/15 to-rose-500/5 border-l-4 border-rose-500">
            <h3 className="text-xl font-bold text-rose-600 mb-4 flex items-center gap-2">
              <span className="text-2xl">🧠</span> Clinical Assessment AI
            </h3>
            <div className="space-y-4">
              <div className="bg-white/50 p-4 rounded-lg border">
                <h4 className="font-semibold mb-2 text-rose-700">Risk Stratification</h4>
                <p className="text-sm text-muted-foreground">AI analyzes patient data to identify risk factors and severity levels</p>
              </div>
              <div className="bg-white/50 p-4 rounded-lg border">
                <h4 className="font-semibold mb-2 text-rose-700">Treatment Recommendations</h4>
                <p className="text-sm text-muted-foreground">Evidence-based treatment suggestions based on patient profile</p>
              </div>
              <div className="bg-white/50 p-4 rounded-lg border">
                <h4 className="font-semibold mb-2 text-rose-700">Outcome Prediction</h4>
                <p className="text-sm text-muted-foreground">Predictive modeling for treatment success probability</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-cyan-500/15 to-cyan-500/5 border-l-4 border-cyan-500">
            <h3 className="text-xl font-bold text-cyan-600 mb-4 flex items-center gap-2">
              <span className="text-2xl">📊</span> Data Integration
            </h3>
            <div className="space-y-4">
              <div className="bg-white/50 p-4 rounded-lg border">
                <h4 className="font-semibold mb-2 text-cyan-700">Multi-Source Analysis</h4>
                <p className="text-sm text-muted-foreground">Combines medical history, lab results, and behavioral data</p>
              </div>
              <div className="bg-white/50 p-4 rounded-lg border">
                <h4 className="font-semibold mb-2 text-cyan-700">Real-Time Updates</h4>
                <p className="text-sm text-muted-foreground">Continuous assessment updates as new data becomes available</p>
              </div>
              <div className="bg-white/50 p-4 rounded-lg border">
                <h4 className="font-semibold mb-2 text-cyan-700">Quality Assurance</h4>
                <p className="text-sm text-muted-foreground">Automated data validation and consistency checks</p>
              </div>
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-3 gap-6">
          <Card className="p-6 bg-gradient-to-br from-violet-500/15 to-violet-500/5 border-l-4 border-violet-500">
            <h4 className="font-bold text-violet-600 mb-4 flex items-center gap-2">
              <span className="text-xl">🎯</span> Assessment Types
            </h4>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-violet-500 rounded-full"></div>
                <span className="text-sm">Substance abuse screening</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-violet-500 rounded-full"></div>
                <span className="text-sm">Mental health evaluation</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-violet-500 rounded-full"></div>
                <span className="text-sm">Medical comorbidity assessment</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-violet-500 rounded-full"></div>
                <span className="text-sm">Social determinants analysis</span>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-amber-500/15 to-amber-500/5 border-l-4 border-amber-500">
            <h4 className="font-bold text-amber-600 mb-4 flex items-center gap-2">
              <span className="text-xl">⚡</span> AI Capabilities
            </h4>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-amber-500 rounded-full"></div>
                <span className="text-sm">Natural language processing</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-amber-500 rounded-full"></div>
                <span className="text-sm">Pattern recognition</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-amber-500 rounded-full"></div>
                <span className="text-sm">Predictive analytics</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-amber-500 rounded-full"></div>
                <span className="text-sm">Decision tree optimization</span>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-lime-500/15 to-lime-500/5 border-l-4 border-lime-500">
            <h4 className="font-bold text-lime-600 mb-4 flex items-center gap-2">
              <span className="text-xl">📈</span> Outcomes
            </h4>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-lime-500 rounded-full"></div>
                <span className="text-sm">Improved diagnostic accuracy</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-lime-500 rounded-full"></div>
                <span className="text-sm">Reduced assessment time</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-lime-500 rounded-full"></div>
                <span className="text-sm">Standardized evaluations</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-lime-500 rounded-full"></div>
                <span className="text-sm">Better treatment matching</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    ),
    animation: 'flip'
  },
  {
    id: 5,
    title: "Automated Scheduling & Resource Management",
    subtitle: "Optimized Capacity Planning with AI Intelligence",
    content: (
      <div className="h-full overflow-y-auto space-y-8 animate-fade-in">
        <div className="grid grid-cols-2 gap-8">
          <Card className="p-6 bg-gradient-to-br from-sky-500/15 to-sky-500/5 border-l-4 border-sky-500">
            <h3 className="text-xl font-bold text-sky-600 mb-4 flex items-center gap-2">
              <span className="text-2xl">📅</span> Smart Scheduling
            </h3>
            <div className="space-y-4">
              <div className="bg-white/50 p-4 rounded-lg border">
                <h4 className="font-semibold mb-2 text-sky-700">Dynamic Optimization</h4>
                <p className="text-sm text-muted-foreground">AI continuously optimizes schedules based on real-time constraints</p>
              </div>
              <div className="bg-white/50 p-4 rounded-lg border">
                <h4 className="font-semibold mb-2 text-sky-700">Multi-Resource Coordination</h4>
                <p className="text-sm text-muted-foreground">Coordinates staff, rooms, equipment, and patient availability</p>
              </div>
              <div className="bg-white/50 p-4 rounded-lg border">
                <h4 className="font-semibold mb-2 text-sky-700">Predictive Modeling</h4>
                <p className="text-sm text-muted-foreground">Forecasts demand patterns and adjusts capacity accordingly</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-pink-500/15 to-pink-500/5 border-l-4 border-pink-500">
            <h3 className="text-xl font-bold text-pink-600 mb-4 flex items-center gap-2">
              <span className="text-2xl">🏥</span> Resource Allocation
            </h3>
            <div className="space-y-4">
              <div className="bg-white/50 p-4 rounded-lg border">
                <h4 className="font-semibold mb-2 text-pink-700">Bed Management</h4>
                <p className="text-sm text-muted-foreground">Real-time bed availability tracking and assignment optimization</p>
              </div>
              <div className="bg-white/50 p-4 rounded-lg border">
                <h4 className="font-semibold mb-2 text-pink-700">Staff Optimization</h4>
                <p className="text-sm text-muted-foreground">Intelligent staff scheduling based on skills and patient needs</p>
              </div>
              <div className="bg-white/50 p-4 rounded-lg border">
                <h4 className="font-semibold mb-2 text-pink-700">Equipment Tracking</h4>
                <p className="text-sm text-muted-foreground">Automated equipment scheduling and maintenance coordination</p>
              </div>
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-4 gap-6">
          <Card className="p-6 bg-gradient-to-br from-indigo-500/20 to-indigo-500/5 border-2 border-indigo-500/30">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-indigo-600 to-indigo-700 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-white text-2xl">🔄</span>
              </div>
              <h4 className="font-bold text-indigo-700 text-base mb-2">Auto-Rescheduling</h4>
              <p className="text-sm text-muted-foreground">Handles cancellations automatically</p>
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-emerald-500/20 to-emerald-500/5 border-2 border-emerald-500/30">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-emerald-600 to-emerald-700 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-white text-2xl">📊</span>
              </div>
              <h4 className="font-bold text-emerald-700 text-base mb-2">Capacity Analytics</h4>
              <p className="text-sm text-muted-foreground">Real-time utilization metrics</p>
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-orange-500/20 to-orange-500/5 border-2 border-orange-500/30">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-orange-600 to-orange-700 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-white text-2xl">⚡</span>
              </div>
              <h4 className="font-bold text-orange-700 text-base mb-2">Instant Updates</h4>
              <p className="text-sm text-muted-foreground">Real-time schedule changes</p>
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-purple-500/20 to-purple-500/5 border-2 border-purple-500/30">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-purple-700 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-white text-2xl">🎯</span>
              </div>
              <h4 className="font-bold text-purple-700 text-base mb-2">Optimization</h4>
              <p className="text-sm text-muted-foreground">Maximum efficiency algorithms</p>
            </div>
          </Card>
        </div>
      </div>
    ),
    animation: 'fade'
  },
  {
    id: 6,
    title: "Documentation & Compliance Automation",
    subtitle: "Intelligent Record Management and Regulatory Compliance",
    content: (
      <div className="h-full overflow-y-auto space-y-8 animate-slide-in">
        <div className="grid grid-cols-2 gap-8">
          <Card className="p-6 bg-gradient-to-br from-teal-500/15 to-teal-500/5 border-l-4 border-teal-500">
            <h3 className="text-xl font-bold text-teal-600 mb-4 flex items-center gap-2">
              <span className="text-2xl">📝</span> Automated Documentation
            </h3>
            <div className="space-y-4">
              <div className="bg-white/50 p-4 rounded-lg border">
                <h4 className="font-semibold mb-2 text-teal-700">Template Generation</h4>
                <p className="text-sm text-muted-foreground">AI creates context-appropriate documentation templates</p>
              </div>
              <div className="bg-white/50 p-4 rounded-lg border">
                <h4 className="font-semibold mb-2 text-teal-700">Auto-Population</h4>
                <p className="text-sm text-muted-foreground">Automatically fills forms with available patient data</p>
              </div>
              <div className="bg-white/50 p-4 rounded-lg border">
                <h4 className="font-semibold mb-2 text-teal-700">Quality Checks</h4>
                <p className="text-sm text-muted-foreground">Validates completeness and accuracy of documentation</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-red-500/15 to-red-500/5 border-l-4 border-red-500">
            <h3 className="text-xl font-bold text-red-600 mb-4 flex items-center gap-2">
              <span className="text-2xl">🛡️</span> Compliance Management
            </h3>
            <div className="space-y-4">
              <div className="bg-white/50 p-4 rounded-lg border">
                <h4 className="font-semibold mb-2 text-red-700">Regulatory Tracking</h4>
                <p className="text-sm text-muted-foreground">Monitors compliance with healthcare regulations and standards</p>
              </div>
              <div className="bg-white/50 p-4 rounded-lg border">
                <h4 className="font-semibold mb-2 text-red-700">Audit Preparation</h4>
                <p className="text-sm text-muted-foreground">Automatically prepares documentation for regulatory audits</p>
              </div>
              <div className="bg-white/50 p-4 rounded-lg border">
                <h4 className="font-semibold mb-2 text-red-700">Alert System</h4>
                <p className="text-sm text-muted-foreground">Proactive alerts for compliance deadlines and requirements</p>
              </div>
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-3 gap-6">
          <Card className="p-6 bg-gradient-to-br from-blue-500/15 to-blue-500/5 border-l-4 border-blue-500">
            <h4 className="font-bold text-blue-600 mb-4 flex items-center gap-2">
              <span className="text-xl">📋</span> Document Types
            </h4>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span className="text-sm">Intake assessments</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span className="text-sm">Treatment plans</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span className="text-sm">Progress notes</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span className="text-sm">Discharge summaries</span>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-green-500/15 to-green-500/5 border-l-4 border-green-500">
            <h4 className="font-bold text-green-600 mb-4 flex items-center gap-2">
              <span className="text-xl">🔍</span> Quality Assurance
            </h4>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm">Completeness validation</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm">Consistency checks</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm">Error detection</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm">Version control</span>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-purple-500/15 to-purple-500/5 border-l-4 border-purple-500">
            <h4 className="font-bold text-purple-600 mb-4 flex items-center gap-2">
              <span className="text-xl">⚖️</span> Compliance Areas
            </h4>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                <span className="text-sm">HIPAA privacy rules</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                <span className="text-sm">Joint Commission standards</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                <span className="text-sm">State licensing requirements</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                <span className="text-sm">Insurance documentation</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    ),
    animation: 'slide'
  },
  {
    id: 7,
    title: "Integration & Interoperability",
    subtitle: "Seamless Connection with Existing Healthcare Systems",
    content: (
      <div className="h-full overflow-y-auto space-y-8 animate-zoom-in">
        <div className="grid grid-cols-2 gap-8">
          <Card className="p-6 bg-gradient-to-br from-violet-500/15 to-violet-500/5 border-l-4 border-violet-500">
            <h3 className="text-xl font-bold text-violet-600 mb-4 flex items-center gap-2">
              <span className="text-2xl">🔗</span> System Integration
            </h3>
            <div className="space-y-4">
              <div className="bg-white/50 p-4 rounded-lg border">
                <h4 className="font-semibold mb-2 text-violet-700">EHR Integration</h4>
                <p className="text-sm text-muted-foreground">Direct integration with major Electronic Health Record systems</p>
              </div>
              <div className="bg-white/50 p-4 rounded-lg border">
                <h4 className="font-semibold mb-2 text-violet-700">API Connectivity</h4>
                <p className="text-sm text-muted-foreground">RESTful APIs for seamless data exchange</p>
              </div>
              <div className="bg-white/50 p-4 rounded-lg border">
                <h4 className="font-semibold mb-2 text-violet-700">Legacy System Support</h4>
                <p className="text-sm text-muted-foreground">Bridges to older systems through custom adapters</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-amber-500/15 to-amber-500/5 border-l-4 border-amber-500">
            <h3 className="text-xl font-bold text-amber-600 mb-4 flex items-center gap-2">
              <span className="text-2xl">🌐</span> Data Standards
            </h3>
            <div className="space-y-4">
              <div className="bg-white/50 p-4 rounded-lg border">
                <h4 className="font-semibold mb-2 text-amber-700">HL7 FHIR</h4>
                <p className="text-sm text-muted-foreground">Full support for modern healthcare data exchange standards</p>
              </div>
              <div className="bg-white/50 p-4 rounded-lg border">
                <h4 className="font-semibold mb-2 text-amber-700">SNOMED CT</h4>
                <p className="text-sm text-muted-foreground">Standardized clinical terminology for consistent data</p>
              </div>
              <div className="bg-white/50 p-4 rounded-lg border">
                <h4 className="font-semibold mb-2 text-amber-700">ICD-10</h4>
                <p className="text-sm text-muted-foreground">International classification for diagnoses and procedures</p>
              </div>
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-4 gap-6">
          <Card className="p-6 bg-gradient-to-br from-cyan-500/20 to-cyan-500/5 border-2 border-cyan-500/30">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-cyan-600 to-cyan-700 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-white text-2xl">🏥</span>
              </div>
              <h4 className="font-bold text-cyan-700 text-base mb-2">EHR Systems</h4>
              <div className="space-y-1 text-xs">
                <div>• Epic</div>
                <div>• Cerner</div>
                <div>• Allscripts</div>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-rose-500/20 to-rose-500/5 border-2 border-rose-500/30">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-rose-600 to-rose-700 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-white text-2xl">💳</span>
              </div>
              <h4 className="font-bold text-rose-700 text-base mb-2">Billing Systems</h4>
              <div className="space-y-1 text-xs">
                <div>• Revenue cycle</div>
                <div>• Claims processing</div>
                <div>• Insurance verification</div>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-emerald-500/20 to-emerald-500/5 border-2 border-emerald-500/30">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-emerald-600 to-emerald-700 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-white text-2xl">🔬</span>
              </div>
              <h4 className="font-bold text-emerald-700 text-base mb-2">Lab Systems</h4>
              <div className="space-y-1 text-xs">
                <div>• Lab results</div>
                <div>• Diagnostic imaging</div>
                <div>• Test ordering</div>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-indigo-500/20 to-indigo-500/5 border-2 border-indigo-500/30">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-indigo-600 to-indigo-700 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-white text-2xl">📊</span>
              </div>
              <h4 className="font-bold text-indigo-700 text-base mb-2">Analytics</h4>
              <div className="space-y-1 text-xs">
                <div>• Business intelligence</div>
                <div>• Quality metrics</div>
                <div>• Performance dashboards</div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    ),
    animation: 'zoom'
  },
  {
    id: 8,
    title: "Security & Privacy Framework",
    subtitle: "Enterprise-Grade Security for Healthcare Data Protection",
    content: (
      <div className="h-full overflow-y-auto space-y-8 animate-flip-in">
        <div className="grid grid-cols-2 gap-8">
          <Card className="p-6 bg-gradient-to-br from-red-500/15 to-red-500/5 border-l-4 border-red-500">
            <h3 className="text-xl font-bold text-red-600 mb-4 flex items-center gap-2">
              <span className="text-2xl">🔒</span> Data Protection
            </h3>
            <div className="space-y-4">
              <div className="bg-white/50 p-4 rounded-lg border">
                <h4 className="font-semibold mb-2 text-red-700">End-to-End Encryption</h4>
                <p className="text-sm text-muted-foreground">AES-256 encryption for data at rest and in transit</p>
              </div>
              <div className="bg-white/50 p-4 rounded-lg border">
                <h4 className="font-semibold mb-2 text-red-700">Access Controls</h4>
                <p className="text-sm text-muted-foreground">Role-based access with multi-factor authentication</p>
              </div>
              <div className="bg-white/50 p-4 rounded-lg border">
                <h4 className="font-semibold mb-2 text-red-700">Audit Logging</h4>
                <p className="text-sm text-muted-foreground">Comprehensive logging of all system activities</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-blue-500/15 to-blue-500/5 border-l-4 border-blue-500">
            <h3 className="text-xl font-bold text-blue-600 mb-4 flex items-center gap-2">
              <span className="text-2xl">🛡️</span> Compliance Standards
            </h3>
            <div className="space-y-4">
              <div className="bg-white/50 p-4 rounded-lg border">
                <h4 className="font-semibold mb-2 text-blue-700">HIPAA Compliance</h4>
                <p className="text-sm text-muted-foreground">Full adherence to healthcare privacy regulations</p>
              </div>
              <div className="bg-white/50 p-4 rounded-lg border">
                <h4 className="font-semibold mb-2 text-blue-700">SOC 2 Type II</h4>
                <p className="text-sm text-muted-foreground">Certified security controls and procedures</p>
              </div>
              <div className="bg-white/50 p-4 rounded-lg border">
                <h4 className="font-semibold mb-2 text-blue-700">GDPR Ready</h4>
                <p className="text-sm text-muted-foreground">European data protection regulation compliance</p>
              </div>
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-3 gap-6">
          <Card className="p-6 bg-gradient-to-br from-green-500/15 to-green-500/5 border-l-4 border-green-500">
            <h4 className="font-bold text-green-600 mb-4 flex items-center gap-2">
              <span className="text-xl">🔐</span> Authentication
            </h4>
            <div className="space-y-3">
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
                <span className="text-sm">Biometric verification</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm">Session management</span>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-purple-500/15 to-purple-500/5 border-l-4 border-purple-500">
            <h4 className="font-bold text-purple-600 mb-4 flex items-center gap-2">
              <span className="text-xl">🔍</span> Monitoring
            </h4>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                <span className="text-sm">Real-time threat detection</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                <span className="text-sm">Anomaly detection</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                <span className="text-sm">Security incident response</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                <span className="text-sm">Compliance reporting</span>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-orange-500/15 to-orange-500/5 border-l-4 border-orange-500">
            <h4 className="font-bold text-orange-600 mb-4 flex items-center gap-2">
              <span className="text-xl">🏰</span> Infrastructure
            </h4>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                <span className="text-sm">Cloud security</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                <span className="text-sm">Network segmentation</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                <span className="text-sm">Firewall protection</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                <span className="text-sm">Backup & recovery</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    ),
    animation: 'flip'
  },
  {
    id: 9,
    title: "Implementation Roadmap",
    subtitle: "Phased Deployment Strategy for Treatment Centers",
    content: (
      <div className="h-full overflow-y-auto space-y-8 animate-fade-in">
        <div className="grid grid-cols-1 gap-6">
          <Card className="p-6 bg-gradient-to-br from-emerald-500/15 to-emerald-500/5 border-l-4 border-emerald-500">
            <h3 className="text-xl font-bold text-emerald-600 mb-6 flex items-center gap-2">
              <span className="text-2xl">🗺️</span> 4-Phase Implementation Plan
            </h3>
            <div className="grid grid-cols-4 gap-6">
              <div className="bg-white/50 p-4 rounded-lg border">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 bg-emerald-600 text-white rounded-full flex items-center justify-center text-sm font-bold">1</div>
                  <h4 className="font-semibold text-emerald-700">Foundation</h4>
                </div>
                <div className="space-y-2 text-sm">
                  <div>• System setup & configuration</div>
                  <div>• Basic integrations</div>
                  <div>• Staff training</div>
                  <div>• Security implementation</div>
                </div>
                <div className="mt-3 text-xs text-muted-foreground">Duration: 2-4 weeks</div>
              </div>

              <div className="bg-white/50 p-4 rounded-lg border">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">2</div>
                  <h4 className="font-semibold text-blue-700">Core Features</h4>
                </div>
                <div className="space-y-2 text-sm">
                  <div>• Patient intake automation</div>
                  <div>• Basic scheduling</div>
                  <div>• Document templates</div>
                  <div>• EHR integration</div>
                </div>
                <div className="mt-3 text-xs text-muted-foreground">Duration: 3-6 weeks</div>
              </div>

              <div className="bg-white/50 p-4 rounded-lg border">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-bold">3</div>
                  <h4 className="font-semibold text-purple-700">Advanced AI</h4>
                </div>
                <div className="space-y-2 text-sm">
                  <div>• Assessment engine</div>
                  <div>• Predictive analytics</div>
                  <div>• Smart routing</div>
                  <div>• Compliance automation</div>
                </div>
                <div className="mt-3 text-xs text-muted-foreground">Duration: 4-8 weeks</div>
              </div>

              <div className="bg-white/50 p-4 rounded-lg border">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 bg-orange-600 text-white rounded-full flex items-center justify-center text-sm font-bold">4</div>
                  <h4 className="font-semibold text-orange-700">Optimization</h4>
                </div>
                <div className="space-y-2 text-sm">
                  <div>• Performance tuning</div>
                  <div>• Advanced analytics</div>
                  <div>• Custom workflows</div>
                  <div>• Full automation</div>
                </div>
                <div className="mt-3 text-xs text-muted-foreground">Duration: 2-4 weeks</div>
              </div>
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-2 gap-8">
          <Card className="p-6 bg-gradient-to-br from-blue-500/15 to-blue-500/5 border-l-4 border-blue-500">
            <h3 className="text-xl font-bold text-blue-600 mb-4 flex items-center gap-2">
              <span className="text-2xl">🎯</span> Success Metrics
            </h3>
            <div className="space-y-4">
              <div className="bg-white/50 p-4 rounded-lg border">
                <h4 className="font-semibold mb-2 text-blue-700">Efficiency Gains</h4>
                <div className="space-y-1 text-sm">
                  <div>• 60% reduction in intake time</div>
                  <div>• 40% improvement in scheduling efficiency</div>
                  <div>• 80% automation of documentation</div>
                </div>
              </div>
              <div className="bg-white/50 p-4 rounded-lg border">
                <h4 className="font-semibold mb-2 text-blue-700">Quality Improvements</h4>
                <div className="space-y-1 text-sm">
                  <div>• 95% documentation accuracy</div>
                  <div>• 100% compliance tracking</div>
                  <div>• 50% reduction in errors</div>
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-green-500/15 to-green-500/5 border-l-4 border-green-500">
            <h3 className="text-xl font-bold text-green-600 mb-4 flex items-center gap-2">
              <span className="text-2xl">🤝</span> Support & Training
            </h3>
            <div className="space-y-4">
              <div className="bg-white/50 p-4 rounded-lg border">
                <h4 className="font-semibold mb-2 text-green-700">Training Program</h4>
                <div className="space-y-1 text-sm">
                  <div>• Comprehensive staff training</div>
                  <div>• Role-specific workshops</div>
                  <div>• Ongoing education resources</div>
                </div>
              </div>
              <div className="bg-white/50 p-4 rounded-lg border">
                <h4 className="font-semibold mb-2 text-green-700">Ongoing Support</h4>
                <div className="space-y-1 text-sm">
                  <div>• 24/7 technical support</div>
                  <div>• Regular system updates</div>
                  <div>• Performance optimization</div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    ),
    animation: 'fade'
  },
  {
    id: 10,
    title: "ROI & Business Impact",
    subtitle: "Quantifiable Benefits and Return on Investment",
    content: (
      <div className="h-full overflow-y-auto space-y-8 animate-slide-in">
        <div className="grid grid-cols-2 gap-8">
          <Card className="p-6 bg-gradient-to-br from-green-500/15 to-green-500/5 border-l-4 border-green-500">
            <h3 className="text-xl font-bold text-green-600 mb-4 flex items-center gap-2">
              <span className="text-2xl">💰</span> Financial Benefits
            </h3>
            <div className="space-y-4">
              <div className="bg-white/50 p-4 rounded-lg border">
                <h4 className="font-semibold mb-2 text-green-700">Cost Reduction</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Administrative costs</span>
                    <span className="font-semibold text-green-600">-45%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Documentation time</span>
                    <span className="font-semibold text-green-600">-60%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Compliance costs</span>
                    <span className="font-semibold text-green-600">-35%</span>
                  </div>
                </div>
              </div>
              <div className="bg-white/50 p-4 rounded-lg border">
                <h4 className="font-semibold mb-2 text-green-700">Revenue Enhancement</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Patient capacity</span>
                    <span className="font-semibold text-green-600">+30%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Billing accuracy</span>
                    <span className="font-semibold text-green-600">+25%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Insurance approvals</span>
                    <span className="font-semibold text-green-600">+40%</span>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-blue-500/15 to-blue-500/5 border-l-4 border-blue-500">
            <h3 className="text-xl font-bold text-blue-600 mb-4 flex items-center gap-2">
              <span className="text-2xl">📊</span> Operational Metrics
            </h3>
            <div className="space-y-4">
              <div className="bg-white/50 p-4 rounded-lg border">
                <h4 className="font-semibold mb-2 text-blue-700">Efficiency Gains</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Intake processing time</span>
                    <span className="font-semibold text-blue-600">-65%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Scheduling conflicts</span>
                    <span className="font-semibold text-blue-600">-80%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Documentation errors</span>
                    <span className="font-semibold text-blue-600">-90%</span>
                  </div>
                </div>
              </div>
              <div className="bg-white/50 p-4 rounded-lg border">
                <h4 className="font-semibold mb-2 text-blue-700">Quality Improvements</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Patient satisfaction</span>
                    <span className="font-semibold text-blue-600">+35%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Staff satisfaction</span>
                    <span className="font-semibold text-blue-600">+40%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Compliance score</span>
                    <span className="font-semibold text-blue-600">+50%</span>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-3 gap-6">
          <Card className="p-6 bg-gradient-to-br from-purple-500/15 to-purple-500/5 border-l-4 border-purple-500">
            <h4 className="font-bold text-purple-600 mb-4 flex items-center gap-2">
              <span className="text-xl">⏱️</span> Time Savings
            </h4>
            <div className="space-y-3">
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600">15</div>
                <div className="text-sm text-muted-foreground">Hours saved per day</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600">75</div>
                <div className="text-sm text-muted-foreground">Hours saved per week</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600">3,900</div>
                <div className="text-sm text-muted-foreground">Hours saved per year</div>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-orange-500/15 to-orange-500/5 border-l-4 border-orange-500">
            <h4 className="font-bold text-orange-600 mb-4 flex items-center gap-2">
              <span className="text-xl">💵</span> Cost Savings
            </h4>
            <div className="space-y-3">
              <div className="text-center">
                <div className="text-3xl font-bold text-orange-600">$2,400</div>
                <div className="text-sm text-muted-foreground">Saved per month</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-orange-600">$28,800</div>
                <div className="text-sm text-muted-foreground">Saved per year</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-orange-600">18</div>
                <div className="text-sm text-muted-foreground">Month payback period</div>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-teal-500/15 to-teal-500/5 border-l-4 border-teal-500">
            <h4 className="font-bold text-teal-600 mb-4 flex items-center gap-2">
              <span className="text-xl">📈</span> Growth Impact
            </h4>
            <div className="space-y-3">
              <div className="text-center">
                <div className="text-3xl font-bold text-teal-600">30%</div>
                <div className="text-sm text-muted-foreground">Capacity increase</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-teal-600">25%</div>
                <div className="text-sm text-muted-foreground">Revenue growth</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-teal-600">40%</div>
                <div className="text-sm text-muted-foreground">Efficiency gain</div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    ),
    animation: 'slide'
  },
  {
    id: 11,
    title: "Technology Stack & Architecture",
    subtitle: "Modern, Scalable Infrastructure for Healthcare AI",
    content: (
      <div className="h-full overflow-y-auto space-y-8 animate-zoom-in">
        <div className="grid grid-cols-2 gap-8">
          <Card className="p-6 bg-gradient-to-br from-indigo-500/15 to-indigo-500/5 border-l-4 border-indigo-500">
            <h3 className="text-xl font-bold text-indigo-600 mb-4 flex items-center gap-2">
              <span className="text-2xl">🏗️</span> Core Architecture
            </h3>
            <div className="space-y-4">
              <div className="bg-white/50 p-4 rounded-lg border">
                <h4 className="font-semibold mb-2 text-indigo-700">Microservices Architecture</h4>
                <p className="text-sm text-muted-foreground">Scalable, maintainable service-oriented design</p>
              </div>
              <div className="bg-white/50 p-4 rounded-lg border">
                <h4 className="font-semibold mb-2 text-indigo-700">Cloud-Native Platform</h4>
                <p className="text-sm text-muted-foreground">Built for AWS, Azure, and Google Cloud</p>
              </div>
              <div className="bg-white/50 p-4 rounded-lg border">
                <h4 className="font-semibold mb-2 text-indigo-700">Container Orchestration</h4>
                <p className="text-sm text-muted-foreground">Kubernetes for deployment and scaling</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-rose-500/15 to-rose-500/5 border-l-4 border-rose-500">
            <h3 className="text-xl font-bold text-rose-600 mb-4 flex items-center gap-2">
              <span className="text-2xl">🤖</span> AI/ML Stack
            </h3>
            <div className="space-y-4">
              <div className="bg-white/50 p-4 rounded-lg border">
                <h4 className="font-semibold mb-2 text-rose-700">Large Language Models</h4>
                <p className="text-sm text-muted-foreground">GPT-4, Claude, and custom healthcare models</p>
              </div>
              <div className="bg-white/50 p-4 rounded-lg border">
                <h4 className="font-semibold mb-2 text-rose-700">Vector Databases</h4>
                <p className="text-sm text-muted-foreground">Pinecone, Weaviate for knowledge retrieval</p>
              </div>
              <div className="bg-white/50 p-4 rounded-lg border">
                <h4 className="font-semibold mb-2 text-rose-700">ML Frameworks</h4>
                <p className="text-sm text-muted-foreground">TensorFlow, PyTorch for custom models</p>
              </div>
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-4 gap-6">
          <Card className="p-6 bg-gradient-to-br from-blue-500/20 to-blue-500/5 border-2 border-blue-500/30">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-blue-700 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-white text-2xl">⚛️</span>
              </div>
              <h4 className="font-bold text-blue-700 text-base mb-2">Frontend</h4>
              <div className="space-y-1 text-xs">
                <div>• React/Next.js</div>
                <div>• TypeScript</div>
                <div>• Tailwind CSS</div>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-green-500/20 to-green-500/5 border-2 border-green-500/30">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-green-600 to-green-700 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-white text-2xl">🔧</span>
              </div>
              <h4 className="font-bold text-green-700 text-base mb-2">Backend</h4>
              <div className="space-y-1 text-xs">
                <div>• Node.js/Python</div>
                <div>• FastAPI/Express</div>
                <div>• GraphQL/REST</div>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-purple-500/20 to-purple-500/5 border-2 border-purple-500/30">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-purple-700 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-white text-2xl">🗄️</span>
              </div>
              <h4 className="font-bold text-purple-700 text-base mb-2">Database</h4>
              <div className="space-y-1 text-xs">
                <div>• PostgreSQL</div>
                <div>• MongoDB</div>
                <div>• Redis Cache</div>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-orange-500/20 to-orange-500/5 border-2 border-orange-500/30">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-orange-600 to-orange-700 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-white text-2xl">☁️</span>
              </div>
              <h4 className="font-bold text-orange-700 text-base mb-2">Cloud</h4>
              <div className="space-y-1 text-xs">
                <div>• AWS/Azure/GCP</div>
                <div>• Docker/Kubernetes</div>
                <div>• CI/CD Pipelines</div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    ),
    animation: 'zoom'
  },
  {
    id: 12,
    title: "User Experience & Interface Design",
    subtitle: "Intuitive Design for Healthcare Professionals",
    content: (
      <div className="h-full overflow-y-auto space-y-8 animate-flip-in">
        <div className="grid grid-cols-2 gap-8">
          <Card className="p-6 bg-gradient-to-br from-cyan-500/15 to-cyan-500/5 border-l-4 border-cyan-500">
            <h3 className="text-xl font-bold text-cyan-600 mb-4 flex items-center gap-2">
              <span className="text-2xl">🎨</span> Design Principles
            </h3>
            <div className="space-y-4">
              <div className="bg-white/50 p-4 rounded-lg border">
                <h4 className="font-semibold mb-2 text-cyan-700">Healthcare-First Design</h4>
                <p className="text-sm text-muted-foreground">Designed specifically for healthcare workflows and terminology</p>
              </div>
              <div className="bg-white/50 p-4 rounded-lg border">
                <h4 className="font-semibold mb-2 text-cyan-700">Accessibility Compliant</h4>
                <p className="text-sm text-muted-foreground">WCAG 2.1 AA compliant for all users</p>
              </div>
              <div className="bg-white/50 p-4 rounded-lg border">
                <h4 className="font-semibold mb-2 text-cyan-700">Mobile Responsive</h4>
                <p className="text-sm text-muted-foreground">Optimized for tablets, phones, and desktop</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-amber-500/15 to-amber-500/5 border-l-4 border-amber-500">
            <h3 className="text-xl font-bold text-amber-600 mb-4 flex items-center gap-2">
              <span className="text-2xl">👥</span> User-Centered Features
            </h3>
            <div className="space-y-4">
              <div className="bg-white/50 p-4 rounded-lg border">
                <h4 className="font-semibold mb-2 text-amber-700">Role-Based Dashboards</h4>
                <p className="text-sm text-muted-foreground">Customized interfaces for different user roles</p>
              </div>
              <div className="bg-white/50 p-4 rounded-lg border">
                <h4 className="font-semibold mb-2 text-amber-700">Contextual Help</h4>
                <p className="text-sm text-muted-foreground">In-app guidance and tooltips</p>
              </div>
              <div className="bg-white/50 p-4 rounded-lg border">
                <h4 className="font-semibold mb-2 text-amber-700">Quick Actions</h4>
                <p className="text-sm text-muted-foreground">One-click access to common tasks</p>
              </div>
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-3 gap-6">
          <Card className="p-6 bg-gradient-to-br from-violet-500/15 to-violet-500/5 border-l-4 border-violet-500">
            <h4 className="font-bold text-violet-600 mb-4 flex items-center gap-2">
              <span className="text-xl">📱</span> Interface Types
            </h4>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-violet-500 rounded-full"></div>
                <span className="text-sm">Web dashboard</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-violet-500 rounded-full"></div>
                <span className="text-sm">Mobile app</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-violet-500 rounded-full"></div>
                <span className="text-sm">Tablet interface</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-violet-500 rounded-full"></div>
                <span className="text-sm">Voice interface</span>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-emerald-500/15 to-emerald-500/5 border-l-4 border-emerald-500">
            <h4 className="font-bold text-emerald-600 mb-4 flex items-center gap-2">
              <span className="text-xl">⚡</span> Performance
            </h4>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
                <span className="text-sm">Sub-second load times</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
                <span className="text-sm">Offline capability</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
                <span className="text-sm">Real-time updates</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
                <span className="text-sm">Progressive web app</span>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-rose-500/15 to-rose-500/5 border-l-4 border-rose-500">
            <h4 className="font-bold text-rose-600 mb-4 flex items-center gap-2">
              <span className="text-xl">🎯</span> Usability
            </h4>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-rose-500 rounded-full"></div>
                <span className="text-sm">Minimal training required</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-rose-500 rounded-full"></div>
                <span className="text-sm">Intuitive navigation</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-rose-500 rounded-full"></div>
                <span className="text-sm">Error prevention</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-rose-500 rounded-full"></div>
                <span className="text-sm">Customizable workflows</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    ),
    animation: 'flip'
  },
  {
    id: 13,
    title: "Training & Support Program",
    subtitle: "Comprehensive Onboarding and Ongoing Education",
    content: (
      <div className="h-full overflow-y-auto space-y-8 animate-fade-in">
        <div className="grid grid-cols-2 gap-8">
          <Card className="p-6 bg-gradient-to-br from-blue-500/15 to-blue-500/5 border-l-4 border-blue-500">
            <h3 className="text-xl font-bold text-blue-600 mb-4 flex items-center gap-2">
              <span className="text-2xl">🎓</span> Training Program
            </h3>
            <div className="space-y-4">
              <div className="bg-white/50 p-4 rounded-lg border">
                <h4 className="font-semibold mb-2 text-blue-700">Role-Based Training</h4>
                <p className="text-sm text-muted-foreground">Customized training paths for different user roles</p>
              </div>
              <div className="bg-white/50 p-4 rounded-lg border">
                <h4 className="font-semibold mb-2 text-blue-700">Interactive Modules</h4>
                <p className="text-sm text-muted-foreground">Hands-on learning with real scenarios</p>
              </div>
              <div className="bg-white/50 p-4 rounded-lg border">
                <h4 className="font-semibold mb-2 text-blue-700">Certification Program</h4>
                <p className="text-sm text-muted-foreground">Formal certification upon completion</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-green-500/15 to-green-500/5 border-l-4 border-green-500">
            <h3 className="text-xl font-bold text-green-600 mb-4 flex items-center gap-2">
              <span className="text-2xl">🤝</span> Support Services
            </h3>
            <div className="space-y-4">
              <div className="bg-white/50 p-4 rounded-lg border">
                <h4 className="font-semibold mb-2 text-green-700">24/7 Technical Support</h4>
                <p className="text-sm text-muted-foreground">Round-the-clock assistance for critical issues</p>
              </div>
              <div className="bg-white/50 p-4 rounded-lg border">
                <h4 className="font-semibold mb-2 text-green-700">Dedicated Success Manager</h4>
                <p className="text-sm text-muted-foreground">Personal point of contact for ongoing support</p>
              </div>
              <div className="bg-white/50 p-4 rounded-lg border">
                <h4 className="font-semibold mb-2 text-green-700">Regular Check-ins</h4>
                <p className="text-sm text-muted-foreground">Scheduled reviews and optimization sessions</p>
              </div>
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-4 gap-6">
          <Card className="p-6 bg-gradient-to-br from-purple-500/20 to-purple-500/5 border-2 border-purple-500/30">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-purple-700 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-white text-2xl">📚</span>
              </div>
              <h4 className="font-bold text-purple-700 text-base mb-2">Learning Resources</h4>
              <div className="space-y-1 text-xs">
                <div>• Video tutorials</div>
                <div>• Documentation</div>
                <div>• Best practices</div>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-orange-500/20 to-orange-500/5 border-2 border-orange-500/30">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-orange-600 to-orange-700 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-white text-2xl">🎯</span>
              </div>
              <h4 className="font-bold text-orange-700 text-base mb-2">Hands-On Training</h4>
              <div className="space-y-1 text-xs">
                <div>• Live workshops</div>
                <div>• Practice scenarios</div>
                <div>• Q&A sessions</div>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-teal-500/20 to-teal-500/5 border-2 border-teal-500/30">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-teal-600 to-teal-700 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-white text-2xl">📞</span>
              </div>
              <h4 className="font-bold text-teal-700 text-base mb-2">Support Channels</h4>
              <div className="space-y-1 text-xs">
                <div>• Phone support</div>
                <div>• Live chat</div>
                <div>• Email tickets</div>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-indigo-500/20 to-indigo-500/5 border-2 border-indigo-500/30">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-indigo-600 to-indigo-700 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-white text-2xl">🔄</span>
              </div>
              <h4 className="font-bold text-indigo-700 text-base mb-2">Ongoing Updates</h4>
              <div className="space-y-1 text-xs">
                <div>• Feature updates</div>
                <div>• Training refreshers</div>
                <div>• New capabilities</div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    ),
    animation: 'fade'
  },
  {
    id: 14,
    title: "Case Studies & Success Stories",
    subtitle: "Real-World Implementation Results",
    content: (
      <div className="h-full overflow-y-auto space-y-8 animate-slide-in">
        <div className="grid grid-cols-1 gap-6">
          <Card className="p-6 bg-gradient-to-br from-emerald-500/15 to-emerald-500/5 border-l-4 border-emerald-500">
            <h3 className="text-xl font-bold text-emerald-600 mb-6 flex items-center gap-2">
              <span className="text-2xl">🏥</span> Regional Treatment Center - 200 Beds
            </h3>
            <div className="grid grid-cols-3 gap-6">
              <div className="bg-white/50 p-4 rounded-lg border">
                <h4 className="font-semibold mb-3 text-emerald-700">Challenge</h4>
                <div className="space-y-2 text-sm">
                  <div>• 4-hour average intake time</div>
                  <div>• 30% documentation errors</div>
                  <div>• Manual scheduling conflicts</div>
                  <div>• Compliance audit failures</div>
                </div>
              </div>
              <div className="bg-white/50 p-4 rounded-lg border">
                <h4 className="font-semibold mb-3 text-emerald-700">Solution</h4>
                <div className="space-y-2 text-sm">
                  <div>• AI-powered intake automation</div>
                  <div>• Smart scheduling system</div>
                  <div>• Automated documentation</div>
                  <div>• Compliance monitoring</div>
                </div>
              </div>
              <div className="bg-white/50 p-4 rounded-lg border">
                <h4 className="font-semibold mb-3 text-emerald-700">Results</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Intake time:</span>
                    <span className="font-semibold text-emerald-600">90 minutes</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Error reduction:</span>
                    <span className="font-semibold text-emerald-600">85%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Capacity increase:</span>
                    <span className="font-semibold text-emerald-600">35%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Cost savings:</span>
                    <span className="font-semibold text-emerald-600">$45K/month</span>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-2 gap-8">
          <Card className="p-6 bg-gradient-to-br from-blue-500/15 to-blue-500/5 border-l-4 border-blue-500">
            <h3 className="text-xl font-bold text-blue-600 mb-4 flex items-center gap-2">
              <span className="text-2xl">🏢</span> Urban Addiction Center
            </h3>
            <div className="space-y-4">
              <div className="bg-white/50 p-4 rounded-lg border">
                <h4 className="font-semibold mb-2 text-blue-700">Key Improvements</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Patient satisfaction</span>
                    <span className="font-semibold text-blue-600">+42%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Staff efficiency</span>
                    <span className="font-semibold text-blue-600">+55%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Revenue increase</span>
                    <span className="font-semibold text-blue-600">+28%</span>
                  </div>
                </div>
              </div>
              <div className="bg-white/50 p-4 rounded-lg border">
                <h4 className="font-semibold mb-2 text-blue-700">Timeline</h4>
                <p className="text-sm text-muted-foreground">Full implementation completed in 8 weeks</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-purple-500/15 to-purple-500/5 border-l-4 border-purple-500">
            <h3 className="text-xl font-bold text-purple-600 mb-4 flex items-center gap-2">
              <span className="text-2xl">🌟</span> Behavioral Health Network
            </h3>
            <div className="space-y-4">
              <div className="bg-white/50 p-4 rounded-lg border">
                <h4 className="font-semibold mb-2 text-purple-700">Multi-Site Deployment</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Locations</span>
                    <span className="font-semibold text-purple-600">12 sites</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total beds</span>
                    <span className="font-semibold text-purple-600">800+</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Annual savings</span>
                    <span className="font-semibold text-purple-600">$2.1M</span>
                  </div>
                </div>
              </div>
              <div className="bg-white/50 p-4 rounded-lg border">
                <h4 className="font-semibold mb-2 text-purple-700">Standardization</h4>
                <p className="text-sm text-muted-foreground">Unified processes across all locations</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    ),
    animation: 'slide'
  },
  {
    id: 15,
    title: "Future Roadmap & Innovation",
    subtitle: "Continuous Evolution of AI Healthcare Technology",
    content: (
      <div className="h-full overflow-y-auto space-y-8 animate-zoom-in">
        <div className="grid grid-cols-2 gap-8">
          <Card className="p-6 bg-gradient-to-br from-violet-500/15 to-violet-500/5 border-l-4 border-violet-500">
            <h3 className="text-xl font-bold text-violet-600 mb-4 flex items-center gap-2">
              <span className="text-2xl">🚀</span> Upcoming Features
            </h3>
            <div className="space-y-4">
              <div className="bg-white/50 p-4 rounded-lg border">
                <h4 className="font-semibold mb-2 text-violet-700">Advanced Predictive Analytics</h4>
                <p className="text-sm text-muted-foreground">ML models for treatment outcome prediction and risk assessment</p>
              </div>
              <div className="bg-white/50 p-4 rounded-lg border">
                <h4 className="font-semibold mb-2 text-violet-700">Voice-Activated Interface</h4>
                <p className="text-sm text-muted-foreground">Hands-free documentation and system interaction</p>
              </div>
              <div className="bg-white/50 p-4 rounded-lg border">
                <h4 className="font-semibold mb-2 text-violet-700">IoT Integration</h4>
                <p className="text-sm text-muted-foreground">Connected devices for real-time patient monitoring</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-rose-500/15 to-rose-500/5 border-l-4 border-rose-500">
            <h3 className="text-xl font-bold text-rose-600 mb-4 flex items-center gap-2">
              <span className="text-2xl">🔬</span> Research & Development
            </h3>
            <div className="space-y-4">
              <div className="bg-white/50 p-4 rounded-lg border">
                <h4 className="font-semibold mb-2 text-rose-700">Federated Learning</h4>
                <p className="text-sm text-muted-foreground">Collaborative AI training while preserving privacy</p>
              </div>
              <div className="bg-white/50 p-4 rounded-lg border">
                <h4 className="font-semibold mb-2 text-rose-700">Quantum Computing</h4>
                <p className="text-sm text-muted-foreground">Next-generation processing for complex healthcare problems</p>
              </div>
              <div className="bg-white/50 p-4 rounded-lg border">
                <h4 className="font-semibold mb-2 text-rose-700">Augmented Reality</h4>
                <p className="text-sm text-muted-foreground">AR interfaces for enhanced clinical workflows</p>
              </div>
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-3 gap-6">
          <Card className="p-6 bg-gradient-to-br from-blue-500/15 to-blue-500/5 border-l-4 border-blue-500">
            <h4 className="font-bold text-blue-600 mb-4 flex items-center gap-2">
              <span className="text-xl">📅</span> 2024 Roadmap
            </h4>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span className="text-sm">Q1: Voice interface beta</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span className="text-sm">Q2: Advanced analytics</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span className="text-sm">Q3: IoT integration</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span className="text-sm">Q4: AR pilot program</span>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-green-500/15 to-green-500/5 border-l-4 border-green-500">
            <h4 className="font-bold text-green-600 mb-4 flex items-center gap-2">
              <span className="text-xl">🤝</span> Partnerships
            </h4>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm">Academic research institutions</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm">Healthcare technology vendors</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm">Clinical advisory boards</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm">Regulatory consultants</span>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-orange-500/15 to-orange-500/5 border-l-4 border-orange-500">
            <h4 className="font-bold text-orange-600 mb-4 flex items-center gap-2">
              <span className="text-xl">🌟</span> Innovation Focus
            </h4>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                <span className="text-sm">Patient-centered design</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                <span className="text-sm">Ethical AI development</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                <span className="text-sm">Sustainability initiatives</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                <span className="text-sm">Global accessibility</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    ),
    animation: 'zoom'
  },
  {
    id: 16,
    title: "Get Started Today",
    subtitle: "Transform Your Treatment Center with AI Automation",
    content: (
      <div className="h-full overflow-y-auto space-y-8 animate-flip-in">
        <div className="text-center space-y-6">
          <div className="w-32 h-32 mx-auto bg-gradient-to-br from-primary to-primary/60 rounded-full flex items-center justify-center animate-pulse">
            <div className="text-4xl">🚀</div>
          </div>
          <div className="space-y-4">
            <h3 className="text-2xl font-bold text-primary">Ready to Transform Your Healthcare Operations?</h3>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Join leading treatment centers already benefiting from our AI-powered automation platform. 
              Start your journey to improved efficiency, better patient outcomes, and reduced operational costs.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-8">
          <Card className="p-6 bg-gradient-to-br from-green-500/15 to-green-500/5 border-l-4 border-green-500">
            <h3 className="text-xl font-bold text-green-600 mb-4 flex items-center gap-2">
              <span className="text-2xl">📞</span> Next Steps
            </h3>
            <div className="space-y-4">
              <div className="bg-white/50 p-4 rounded-lg border">
                <h4 className="font-semibold mb-2 text-green-700">1. Schedule Consultation</h4>
                <p className="text-sm text-muted-foreground">Free 30-minute discovery call to assess your needs</p>
              </div>
              <div className="bg-white/50 p-4 rounded-lg border">
                <h4 className="font-semibold mb-2 text-green-700">2. Custom Demo</h4>
                <p className="text-sm text-muted-foreground">Personalized demonstration with your use cases</p>
              </div>
              <div className="bg-white/50 p-4 rounded-lg border">
                <h4 className="font-semibold mb-2 text-green-700">3. Pilot Program</h4>
                <p className="text-sm text-muted-foreground">30-day trial with limited scope implementation</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-blue-500/15 to-blue-500/5 border-l-4 border-blue-500">
            <h3 className="text-xl font-bold text-blue-600 mb-4 flex items-center gap-2">
              <span className="text-2xl">🎁</span> Special Offer
            </h3>
            <div className="space-y-4">
              <div className="bg-white/50 p-4 rounded-lg border">
                <h4 className="font-semibold mb-2 text-blue-700">Early Adopter Benefits</h4>
                <div className="space-y-2 text-sm">
                  <div>• 50% off first year implementation</div>
                  <div>• Free training for up to 20 staff members</div>
                  <div>• Priority support and feature requests</div>
                  <div>• Dedicated success manager</div>
                </div>
              </div>
              <div className="bg-white/50 p-4 rounded-lg border">
                <h4 className="font-semibold mb-2 text-blue-700">Limited Time</h4>
                <p className="text-sm text-muted-foreground">Offer valid for the first 10 treatment centers</p>
              </div>
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-3 gap-6">
          <Card className="p-6 bg-gradient-to-br from-purple-500/15 to-purple-500/5 border-l-4 border-purple-500">
            <h4 className="font-bold text-purple-600 mb-4 flex items-center gap-2">
              <span className="text-xl">📧</span> Contact Information
            </h4>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                <span className="text-sm">sales@agentichealthcare.ai</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                <span className="text-sm">1-800-AI-HEALTH</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                <span className="text-sm">www.agentichealthcare.ai</span>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-orange-500/15 to-orange-500/5 border-l-4 border-orange-500">
            <h4 className="font-bold text-orange-600 mb-4 flex items-center gap-2">
              <span className="text-xl">📅</span> Implementation Timeline
            </h4>
            <div className="space-y-3">
              <div className="text-center">
                <div className="text-3xl font-bold text-orange-600">2-4</div>
                <div className="text-sm text-muted-foreground">Weeks to basic deployment</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-orange-600">8-12</div>
                <div className="text-sm text-muted-foreground">Weeks to full implementation</div>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-teal-500/15 to-teal-500/5 border-l-4 border-teal-500">
            <h4 className="font-bold text-teal-600 mb-4 flex items-center gap-2">
              <span className="text-xl">🏆</span> Success Guarantee
            </h4>
            <div className="space-y-3">
              <div className="text-center">
                <div className="text-3xl font-bold text-teal-600">100%</div>
                <div className="text-sm text-muted-foreground">Satisfaction guarantee</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-teal-600">30</div>
                <div className="text-sm text-muted-foreground">Day money-back guarantee</div>
              </div>
            </div>
          </Card>
        </div>

        <div className="text-center space-y-4">
          <div className="flex justify-center gap-4">
            <Button size="lg" className="bg-primary hover:bg-primary/90">
              Schedule Free Consultation
            </Button>
            <Button size="lg" variant="outline">
              Request Custom Demo
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">
            Transform your treatment center today. Your patients and staff will thank you.
          </p>
        </div>
      </div>
    ),
    animation: 'flip'
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
            onClick={toggleFullscreen}
          >
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
          <div className="flex-1">
            {slides[currentSlide].content}
          </div>
        </div>
      </div>

      {/* Navigation Controls */}
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
