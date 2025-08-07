import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight, Play, Pause, RotateCcw, Maximize2, Download, FileText, Presentation, Database, Cloud, MessageSquare, Globe, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSimplePresentationCapture } from '@/hooks/useSimplePresentationCapture';
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
    title: "Complete AI Agent Architecture & Deployment System",
    subtitle: "End-to-End Agent Lifecycle Management with Multi-Channel Deployment & Advanced Features",
    content: (
      <div className="h-full overflow-y-auto space-y-6 animate-fade-in">
        {/* Architecture Diagram */}
        <div className="relative">
          <div className="text-center mb-6">
            <h3 className="text-2xl font-bold text-primary mb-2">Complete Agent Lifecycle Management</h3>
            <p className="text-muted-foreground">From Creation to Deployment with Advanced Management Features</p>
          </div>
          
          <div className="grid grid-cols-4 gap-4 mb-8">
            <Card className="p-4 bg-gradient-to-br from-blue-500/20 to-blue-500/5 border-2 border-blue-500/30">
              <div className="text-2xl mb-2">🎨</div>
              <h4 className="font-bold text-blue-700 text-sm mb-2">Agent Creation</h4>
              <div className="text-xs space-y-1">
                <div>• Wizard-guided setup</div>
                <div>• Template-based creation</div>
                <div>• Custom canvas editor</div>
                <div>• Duplicate prevention</div>
                <div>• Draft management</div>
              </div>
            </Card>
            
            <Card className="p-4 bg-gradient-to-br from-green-500/20 to-green-500/5 border-2 border-green-500/30">
              <div className="text-2xl mb-2">🧪</div>
              <h4 className="font-bold text-green-700 text-sm mb-2">Testing & Validation</h4>
              <div className="text-xs space-y-1">
                <div>• Integrated testing suite</div>
                <div>• Live chat interface</div>
                <div>• Performance metrics</div>
                <div>• Model validation</div>
                <div>• Quality assurance</div>
              </div>
            </Card>
            
            <Card className="p-4 bg-gradient-to-br from-purple-500/20 to-purple-500/5 border-2 border-purple-500/30">
              <div className="text-2xl mb-2">🚀</div>
              <h4 className="font-bold text-purple-700 text-sm mb-2">Multi-Channel Deployment</h4>
              <div className="text-xs space-y-1">
                <div>• Voice calls (Twilio)</div>
                <div>• Web chat widgets</div>
                <div>• Email automation</div>
                <div>• Mobile app SDK</div>
                <div>• WhatsApp Business</div>
              </div>
            </Card>
            
            <Card className="p-4 bg-gradient-to-br from-orange-500/20 to-orange-500/5 border-2 border-orange-500/30">
              <div className="text-2xl mb-2">📊</div>
              <h4 className="font-bold text-orange-700 text-sm mb-2">Monitoring & Management</h4>
              <div className="text-xs space-y-1">
                <div>• Real-time health checks</div>
                <div>• Performance analytics</div>
                <div>• Automated status sync</div>
                <div>• Error recovery</div>
                <div>• Usage tracking</div>
              </div>
            </Card>
          </div>
        </div>

        {/* Advanced Agent Management Features */}
        <div className="grid grid-cols-2 gap-6">
          <Card className="p-6">
            <h3 className="text-lg font-bold text-primary mb-4">Advanced Agent Management</h3>
            <div className="space-y-3">
              <div className="p-3 bg-accent/20 rounded-lg">
                <div className="font-semibold text-sm">Duplicate Prevention System</div>
                <div className="text-xs text-muted-foreground">Validates unique agent names per user with database-level checks</div>
              </div>
              <div className="p-3 bg-accent/20 rounded-lg">
                <div className="font-semibold text-sm">Draft Cleanup Automation</div>
                <div className="text-xs text-muted-foreground">Auto-removes stale drafts after 7 days with user notifications</div>
              </div>
              <div className="p-3 bg-accent/20 rounded-lg">
                <div className="font-semibold text-sm">Status Synchronization</div>
                <div className="text-xs text-muted-foreground">Real-time agent status updates across deployment channels</div>
              </div>
              <div className="p-3 bg-accent/20 rounded-lg">
                <div className="font-semibold text-sm">Unified Workflow</div>
                <div className="text-xs text-muted-foreground">Create → Test → Deploy all in one integrated interface</div>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-bold text-primary mb-4">Deployment Infrastructure</h3>
            <div className="space-y-3">
              <div className="p-3 bg-accent/20 rounded-lg">
                <div className="font-semibold text-sm">Drag & Drop Deployment</div>
                <div className="text-xs text-muted-foreground">Visual interface for agent-to-channel assignments</div>
              </div>
              <div className="p-3 bg-accent/20 rounded-lg">
                <div className="font-semibold text-sm">Health Monitoring</div>
                <div className="text-xs text-muted-foreground">Continuous deployment health checks with metrics</div>
              </div>
              <div className="p-3 bg-accent/20 rounded-lg">
                <div className="font-semibold text-sm">Voice Provider Integration</div>
                <div className="text-xs text-muted-foreground">Support for Twilio, ElevenLabs, and custom providers</div>
              </div>
              <div className="p-3 bg-accent/20 rounded-lg">
                <div className="font-semibold text-sm">Database Architecture</div>
                <div className="text-xs text-muted-foreground">Complete backend with RLS policies and triggers</div>
              </div>
            </div>
          </Card>
        </div>

        {/* Technical Implementation */}
        <Card className="p-6">
          <h3 className="text-lg font-bold text-primary mb-4">Technical Implementation Details</h3>
          <div className="grid grid-cols-4 gap-4">
            <div className="p-4 bg-gradient-to-br from-blue-500/10 to-blue-500/5 rounded-lg border">
              <h4 className="font-semibold text-blue-700 mb-2">🛠️ Core Components</h4>
              <ul className="text-xs space-y-1">
                <li>• AgentManagement tabs</li>
                <li>• DeploymentChannels UI</li>
                <li>• DraggableAgentCard</li>
                <li>• useAgentDeployments hook</li>
              </ul>
            </div>
            <div className="p-4 bg-gradient-to-br from-green-500/10 to-green-500/5 rounded-lg border">
              <h4 className="font-semibold text-green-700 mb-2">🗄️ Database Tables</h4>
              <ul className="text-xs space-y-1">
                <li>• agents (main records)</li>
                <li>• agent_channel_deployments</li>
                <li>• voice_providers</li>
                <li>• agent_sessions (testing)</li>
              </ul>
            </div>
            <div className="p-4 bg-gradient-to-br from-purple-500/10 to-purple-500/5 rounded-lg border">
              <h4 className="font-semibold text-purple-700 mb-2">⚡ Automation Features</h4>
              <ul className="text-xs space-y-1">
                <li>• Status sync triggers</li>
                <li>• Draft cleanup functions</li>
                <li>• Duplicate name validation</li>
                <li>• Health check monitoring</li>
              </ul>
            </div>
            <div className="p-4 bg-gradient-to-br from-orange-500/10 to-orange-500/5 rounded-lg border">
              <h4 className="font-semibold text-orange-700 mb-2">🔗 Integration Points</h4>
              <ul className="text-xs space-y-1">
                <li>• AI model processors</li>
                <li>• Voice provider APIs</li>
                <li>• Real-time subscriptions</li>
                <li>• Channel adapters</li>
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
    title: "Complete Agent Creation Journey Overview",
    subtitle: "End-to-End Process: Create → Test → Deploy → Monitor with Advanced Features",
    content: (
      <div className="h-full overflow-y-auto space-y-6 animate-fade-in">
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full">
            <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
            <span className="text-sm font-medium">Complete Agent Lifecycle Management</span>
          </div>
        </div>
        
        {/* Main Process Overview - First 4 Steps */}
        <div className="grid grid-cols-4 gap-3 mb-6">
          {[
            { step: 1, title: "Create Agent", icon: "🤖", details: "Wizard setup, templates, duplicate prevention, draft management" },
            { step: 2, title: "Configure & Design", icon: "🎨", details: "Canvas editor, branding, actions, knowledge base integration" },
            { step: 3, title: "Test & Validate", icon: "🧪", details: "Live testing interface, performance validation, quality assurance" },
            { step: 4, title: "Deploy to Channels", icon: "🚀", details: "Multi-channel deployment, voice integration, health monitoring" }
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

        {/* Advanced Management & Automation */}
        <Card className="p-6">
          <h3 className="text-xl font-bold text-primary mb-6">🛡️ Advanced Management & Automation Features</h3>
          <div className="grid grid-cols-3 gap-6">
            <div className="space-y-3">
              <h4 className="font-semibold text-red-700">🚫 Duplicate Prevention</h4>
              <div className="p-3 bg-red-50 rounded-lg border">
                <ul className="text-xs space-y-1">
                  <li>• Real-time name validation</li>
                  <li>• Database-level constraint checking</li>
                  <li>• User-scoped uniqueness enforcement</li>
                  <li>• Immediate feedback on conflicts</li>
                </ul>
              </div>
            </div>
            <div className="space-y-3">
              <h4 className="font-semibold text-orange-700">🧹 Draft Cleanup System</h4>
              <div className="p-3 bg-orange-50 rounded-lg border">
                <ul className="text-xs space-y-1">
                  <li>• Automated 7-day draft expiration</li>
                  <li>• User notification before cleanup</li>
                  <li>• Bulk cleanup with confirmation</li>
                  <li>• Storage optimization</li>
                </ul>
              </div>
            </div>
            <div className="space-y-3">
              <h4 className="font-semibold text-green-700">🔄 Status Synchronization</h4>
              <div className="p-3 bg-green-50 rounded-lg border">
                <ul className="text-xs space-y-1">
                  <li>• Real-time deployment status updates</li>
                  <li>• Automated agent status sync</li>
                  <li>• Cross-channel status tracking</li>
                  <li>• Database trigger automation</li>
                </ul>
              </div>
            </div>
          </div>
        </Card>

        {/* Deployment Process Details */}
        <Card className="p-6">
          <h3 className="text-xl font-bold text-primary mb-6">🚀 Complete Deployment Process</h3>
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="font-semibold text-blue-700">📋 Pre-Deployment Steps</h4>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span className="text-sm">Agent validation & testing complete</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span className="text-sm">Voice provider configuration</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span className="text-sm">Channel capacity verification</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span className="text-sm">Security & compliance checks</span>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <h4 className="font-semibold text-purple-700">🎯 Deployment Execution</h4>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                  <span className="text-sm">Drag & drop agent to channels</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                  <span className="text-sm">Automatic database record creation</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                  <span className="text-sm">Real-time status updates</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                  <span className="text-sm">Health monitoring activation</span>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Multi-Channel Deployment Options */}
        <Card className="p-6">
          <h3 className="text-xl font-bold text-primary mb-6">🌐 Multi-Channel Deployment Options</h3>
          <div className="grid grid-cols-4 gap-4">
            <div className="p-4 bg-gradient-to-br from-blue-500/10 to-blue-500/5 rounded-lg border">
              <div className="text-center mb-3">
                <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center mx-auto">
                  <span className="text-white text-sm">📞</span>
                </div>
              </div>
              <h4 className="font-semibold text-blue-700 text-sm mb-2">Voice Channels</h4>
              <ul className="text-xs space-y-1">
                <li>• Twilio Voice API</li>
                <li>• ElevenLabs TTS</li>
                <li>• OpenAI Realtime</li>
                <li>• Custom voice providers</li>
              </ul>
            </div>
            <div className="p-4 bg-gradient-to-br from-green-500/10 to-green-500/5 rounded-lg border">
              <div className="text-center mb-3">
                <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center mx-auto">
                  <span className="text-white text-sm">💬</span>
                </div>
              </div>
              <h4 className="font-semibold text-green-700 text-sm mb-2">Chat Channels</h4>
              <ul className="text-xs space-y-1">
                <li>• Web chat widgets</li>
                <li>• WhatsApp Business</li>
                <li>• Facebook Messenger</li>
                <li>• SMS integration</li>
              </ul>
            </div>
            <div className="p-4 bg-gradient-to-br from-purple-500/10 to-purple-500/5 rounded-lg border">
              <div className="text-center mb-3">
                <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center mx-auto">
                  <span className="text-white text-sm">📧</span>
                </div>
              </div>
              <h4 className="font-semibold text-purple-700 text-sm mb-2">Email & API</h4>
              <ul className="text-xs space-y-1">
                <li>• Email automation</li>
                <li>• API webhooks</li>
                <li>• Mobile app SDK</li>
                <li>• Custom integrations</li>
              </ul>
            </div>
            <div className="p-4 bg-gradient-to-br from-orange-500/10 to-orange-500/5 rounded-lg border">
              <div className="text-center mb-3">
                <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center mx-auto">
                  <span className="text-white text-sm">🤖</span>
                </div>
              </div>
              <h4 className="font-semibold text-orange-700 text-sm mb-2">AI Assistants</h4>
              <ul className="text-xs space-y-1">
                <li>• Google Assistant</li>
                <li>• Alexa Skills</li>
                <li>• Digital health portals</li>
                <li>• Smart speakers</li>
              </ul>
            </div>
          </div>
        </Card>

        {/* Post-Deployment Monitoring */}
        <Card className="p-6">
          <h3 className="text-xl font-bold text-primary mb-6">📊 Post-Deployment Monitoring & Management</h3>
          <div className="grid grid-cols-3 gap-6">
            <div className="space-y-3">
              <h4 className="font-semibold text-emerald-700">💚 Health Monitoring</h4>
              <div className="p-3 bg-emerald-50 rounded-lg border">
                <ul className="text-xs space-y-1">
                  <li>• Real-time deployment health checks</li>
                  <li>• Performance metrics tracking</li>
                  <li>• Error rate monitoring</li>
                  <li>• Uptime & availability stats</li>
                </ul>
              </div>
            </div>
            <div className="space-y-3">
              <h4 className="font-semibold text-blue-700">📈 Analytics Dashboard</h4>
              <div className="p-3 bg-blue-50 rounded-lg border">
                <ul className="text-xs space-y-1">
                  <li>• Usage statistics per channel</li>
                  <li>• Response time analytics</li>
                  <li>• User satisfaction metrics</li>
                  <li>• Cost optimization insights</li>
                </ul>
              </div>
            </div>
            <div className="space-y-3">
              <h4 className="font-semibold text-purple-700">🔧 Management Tools</h4>
              <div className="p-3 bg-purple-50 rounded-lg border">
                <ul className="text-xs space-y-1">
                  <li>• Live deployment adjustments</li>
                  <li>• Channel capacity management</li>
                  <li>• A/B testing capabilities</li>
                  <li>• Emergency stop controls</li>
                </ul>
              </div>
            </div>
          </div>
        </Card>

        {/* Process Flow Indicator */}
        <div className="flex items-center justify-center mt-6">
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span>🤖 Create</span>
            <div className="w-4 h-0.5 bg-primary"></div>
            <span>🎨 Configure</span>
            <div className="w-4 h-0.5 bg-primary"></div>
            <span>🧪 Test</span>
            <div className="w-4 h-0.5 bg-primary"></div>
            <span>🚀 Deploy</span>
            <div className="w-4 h-0.5 bg-primary"></div>
            <span>📊 Monitor</span>
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
      <div className="h-full overflow-y-auto space-y-6 animate-fade-in">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full">
            <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
            <span className="text-sm font-medium">Complete Knowledge Base & RAG System</span>
          </div>
        </div>

        {/* Main Implementation Grid */}
        <div className="grid grid-cols-2 gap-6">
          {/* Auto-Creation & Upload */}
          <Card className="p-6">
            <div className="text-center mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl">📚</span>
              </div>
              <h3 className="text-lg font-bold text-blue-700">Auto-Creation & Upload</h3>
            </div>
            <div className="space-y-3">
              <div className="p-4 bg-blue-50 rounded-lg border">
                <h4 className="font-semibold text-blue-800 mb-2">🤖 Auto-Generation</h4>
                <p className="text-sm text-blue-700">OpenAI API integration for intelligent content generation</p>
              </div>
              <div className="p-4 bg-green-50 rounded-lg border">
                <h4 className="font-semibold text-green-800 mb-2">📁 File Upload</h4>
                <p className="text-sm text-green-700">Supabase storage with drag & drop functionality</p>
              </div>
            </div>
          </Card>

          {/* Web Crawling */}
          <Card className="p-6">
            <div className="text-center mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl">🌐</span>
              </div>
              <h3 className="text-lg font-bold text-purple-700">Web Crawling & Data</h3>
            </div>
            <div className="space-y-3">
              <div className="p-4 bg-purple-50 rounded-lg border">
                <h4 className="font-semibold text-purple-800 mb-2">🔥 Firecrawl API</h4>
                <p className="text-sm text-purple-700">Multi-URL scraping with intelligent parsing</p>
              </div>
              <div className="p-4 bg-orange-50 rounded-lg border">
                <h4 className="font-semibold text-orange-800 mb-2">🗃️ Source Manager</h4>
                <p className="text-sm text-orange-700">Auto-sync and content validation</p>
              </div>
            </div>
          </Card>
        </div>

        {/* RAG Implementation */}
        <div className="grid grid-cols-2 gap-6">
          <Card className="p-6">
            <div className="text-center mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl">🔍</span>
              </div>
              <h3 className="text-lg font-bold text-emerald-700">RAG Implementation</h3>
            </div>
            <div className="space-y-3">
              <div className="p-4 bg-emerald-50 rounded-lg border">
                <h4 className="font-semibold text-emerald-800 mb-2">🧠 Vector Database</h4>
                <p className="text-sm text-emerald-700">pgvector for semantic search and context retrieval</p>
              </div>
              <div className="p-4 bg-cyan-50 rounded-lg border">
                <h4 className="font-semibold text-cyan-800 mb-2">🎯 Context Retrieval</h4>
                <p className="text-sm text-cyan-700">Smart chunking and relevance scoring</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="text-center mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl">✅</span>
              </div>
              <h3 className="text-lg font-bold text-indigo-700">Content Approval</h3>
            </div>
            <div className="space-y-3">
              <div className="p-4 bg-indigo-50 rounded-lg border">
                <h4 className="font-semibold text-indigo-800 mb-2">🔄 Approval Workflow</h4>
                <p className="text-sm text-indigo-700">Multi-stage validation and review process</p>
              </div>
              <div className="p-4 bg-pink-50 rounded-lg border">
                <h4 className="font-semibold text-pink-800 mb-2">⚡ Auto-Generation</h4>
                <p className="text-sm text-pink-700">Context-aware content creation</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Technical Implementation Stack */}
        <Card className="p-6">
          <h3 className="text-xl font-bold text-primary mb-6">⚙️ Technical Implementation Stack</h3>
          <div className="grid grid-cols-4 gap-6 text-center">
            <div className="p-4 bg-gradient-to-br from-blue-500/10 to-blue-500/5 rounded-lg border">
              <div className="text-lg font-semibold text-primary mb-2">Storage</div>
              <div className="space-y-1">
                <div className="text-sm text-muted-foreground">Supabase Database</div>
                <div className="text-sm text-muted-foreground">Vector Storage</div>
                <div className="text-sm text-muted-foreground">File Management</div>
              </div>
            </div>
            <div className="p-4 bg-gradient-to-br from-green-500/10 to-green-500/5 rounded-lg border">
              <div className="text-lg font-semibold text-primary mb-2">Functions</div>
              <div className="space-y-1">
                <div className="text-sm text-muted-foreground">Content Generation</div>
                <div className="text-sm text-muted-foreground">Web Crawling</div>
                <div className="text-sm text-muted-foreground">Processing Pipeline</div>
              </div>
            </div>
            <div className="p-4 bg-gradient-to-br from-purple-500/10 to-purple-500/5 rounded-lg border">
              <div className="text-lg font-semibold text-primary mb-2">Components</div>
              <div className="space-y-1">
                <div className="text-sm text-muted-foreground">Enhanced KB Manager</div>
                <div className="text-sm text-muted-foreground">Upload Interface</div>
                <div className="text-sm text-muted-foreground">Search Engine</div>
              </div>
            </div>
            <div className="p-4 bg-gradient-to-br from-orange-500/10 to-orange-500/5 rounded-lg border">
              <div className="text-lg font-semibold text-primary mb-2">APIs</div>
              <div className="space-y-1">
                <div className="text-sm text-muted-foreground">OpenAI Integration</div>
                <div className="text-sm text-muted-foreground">Firecrawl Service</div>
                <div className="text-sm text-muted-foreground">Vector Search</div>
              </div>
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
    subtitle: "Complete Implementation with Advanced Features, Automation & Enterprise-Grade Management",
    content: (
      <div className="h-full overflow-y-auto space-y-6 animate-fade-in">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full">
            <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
            <span className="text-sm font-medium">Enterprise-Grade Deployment Management System</span>
          </div>
        </div>

        {/* New Advanced Features */}
        <div className="grid grid-cols-2 gap-6">
          <Card className="p-6">
            <div className="text-center mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl">🛡️</span>
              </div>
              <h3 className="text-lg font-bold text-red-700">Advanced Management Features</h3>
            </div>
            <div className="space-y-3">
              <div className="p-4 bg-red-50 rounded-lg border">
                <h4 className="font-semibold text-red-800 mb-2">🚫 Duplicate Prevention</h4>
                <p className="text-sm text-red-700">Database-level agent name validation with real-time checking</p>
              </div>
              <div className="p-4 bg-orange-50 rounded-lg border">
                <h4 className="font-semibold text-orange-800 mb-2">🧹 Draft Cleanup</h4>
                <p className="text-sm text-orange-700">Auto-removal of stale drafts after 7 days with notifications</p>
              </div>
              <div className="p-4 bg-yellow-50 rounded-lg border">
                <h4 className="font-semibold text-yellow-800 mb-2">🔄 Status Sync</h4>
                <p className="text-sm text-yellow-700">Real-time agent status updates via database triggers</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="text-center mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl">🎯</span>
              </div>
              <h3 className="text-lg font-bold text-blue-700">Unified Agent Workflow</h3>
            </div>
            <div className="space-y-3">
              <div className="p-4 bg-blue-50 rounded-lg border">
                <h4 className="font-semibold text-blue-800 mb-2">🎨 Create Tab</h4>
                <p className="text-sm text-blue-700">Wizard-guided agent creation with templates</p>
              </div>
              <div className="p-4 bg-purple-50 rounded-lg border">
                <h4 className="font-semibold text-purple-800 mb-2">🧪 Test Tab</h4>
                <p className="text-sm text-purple-700">Integrated live testing with chat interface</p>
              </div>
              <div className="p-4 bg-green-50 rounded-lg border">
                <h4 className="font-semibold text-green-800 mb-2">🚀 Deploy Tab</h4>
                <p className="text-sm text-green-700">Drag & drop deployment to multiple channels</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Enhanced Deployment Features */}
        <div className="grid grid-cols-2 gap-6">
          <Card className="p-6">
            <div className="text-center mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl">🎮</span>
              </div>
              <h3 className="text-lg font-bold text-purple-700">Advanced Drag & Drop System</h3>
            </div>
            <div className="space-y-3">
              <div className="p-4 bg-indigo-50 rounded-lg border">
                <h4 className="font-semibold text-indigo-800 mb-2">🎨 DraggableAgentCard</h4>
                <p className="text-sm text-indigo-700">@dnd-kit/core integration with visual feedback</p>
              </div>
              <div className="p-4 bg-purple-50 rounded-lg border">
                <h4 className="font-semibold text-purple-800 mb-2">📋 DroppableChannel</h4>
                <p className="text-sm text-purple-700">Capacity limits and conflict resolution</p>
              </div>
              <div className="p-4 bg-blue-50 rounded-lg border">
                <h4 className="font-semibold text-blue-800 mb-2">⚡ Real-time Updates</h4>
                <p className="text-sm text-blue-700">Live deployment status with Supabase subscriptions</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="text-center mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl">📊</span>
              </div>
              <h3 className="text-lg font-bold text-emerald-700">Health Monitoring & Analytics</h3>
            </div>
            <div className="space-y-3">
              <div className="p-4 bg-emerald-50 rounded-lg border">
                <h4 className="font-semibold text-emerald-800 mb-2">💚 Health Checks</h4>
                <p className="text-sm text-emerald-700">Continuous deployment monitoring with metrics</p>
              </div>
              <div className="p-4 bg-teal-50 rounded-lg border">
                <h4 className="font-semibold text-teal-800 mb-2">📈 Performance Tracking</h4>
                <p className="text-sm text-teal-700">Response times, success rates, error tracking</p>
              </div>
              <div className="p-4 bg-cyan-50 rounded-lg border">
                <h4 className="font-semibold text-cyan-800 mb-2">🔔 Alert System</h4>
                <p className="text-sm text-cyan-700">Automated notifications for deployment issues</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Voice Provider Integration */}
        <Card className="p-6">
          <h3 className="text-xl font-bold text-primary mb-6">🎙️ Voice Provider Integration & Management</h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="p-4 bg-gradient-to-br from-blue-500/10 to-blue-500/5 rounded-lg border">
              <div className="text-lg font-semibold text-primary mb-3">📞 Twilio Integration</div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span>Voice calls & conferencing</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>SMS & WhatsApp Business</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <span>Programmable chat & video</span>
                </div>
              </div>
            </div>
            
            <div className="p-4 bg-gradient-to-br from-orange-500/10 to-orange-500/5 rounded-lg border">
              <div className="text-lg font-semibold text-primary mb-3">🎵 ElevenLabs Voice</div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                  <span>High-quality TTS voices</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  <span>Voice cloning & customization</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-2 h-2 bg-pink-500 rounded-full"></div>
                  <span>Multilingual support</span>
                </div>
              </div>
            </div>
            
            <div className="p-4 bg-gradient-to-br from-purple-500/10 to-purple-500/5 rounded-lg border">
              <div className="text-lg font-semibold text-primary mb-3">🔧 Custom Providers</div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <span>OpenAI Realtime API</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                  <span>Azure Speech Services</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-2 h-2 bg-cyan-500 rounded-full"></div>
                  <span>Google Cloud Speech</span>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Database Architecture & Automation */}
        <Card className="p-6">
          <h3 className="text-xl font-bold text-primary mb-6">🗄️ Database Architecture & Automation</h3>
          <div className="grid grid-cols-4 gap-6 text-center">
            <div className="p-4 bg-gradient-to-br from-blue-500/10 to-blue-500/5 rounded-lg border">
              <div className="text-lg font-semibold text-primary mb-2">Core Tables</div>
              <div className="space-y-1">
                <div className="text-sm text-muted-foreground">agents (main records)</div>
                <div className="text-sm text-muted-foreground">agent_sessions (testing)</div>
                <div className="text-sm text-muted-foreground">agent_channel_deployments</div>
                <div className="text-sm text-muted-foreground">voice_providers</div>
              </div>
            </div>
            <div className="p-4 bg-gradient-to-br from-green-500/10 to-green-500/5 rounded-lg border">
              <div className="text-lg font-semibold text-primary mb-2">RLS Policies</div>
              <div className="space-y-1">
                <div className="text-sm text-muted-foreground">User-scoped access</div>
                <div className="text-sm text-muted-foreground">Role-based permissions</div>
                <div className="text-sm text-muted-foreground">Secure data isolation</div>
                <div className="text-sm text-muted-foreground">Audit trail compliance</div>
              </div>
            </div>
            <div className="p-4 bg-gradient-to-br from-purple-500/10 to-purple-500/5 rounded-lg border">
              <div className="text-lg font-semibold text-primary mb-2">Automation Triggers</div>
              <div className="space-y-1">
                <div className="text-sm text-muted-foreground">sync_agent_deployment_status</div>
                <div className="text-sm text-muted-foreground">cleanup_old_draft_agents</div>
                <div className="text-sm text-muted-foreground">check_duplicate_agent_name</div>
                <div className="text-sm text-muted-foreground">update_agent_updated_at</div>
              </div>
            </div>
            <div className="p-4 bg-gradient-to-br from-orange-500/10 to-orange-500/5 rounded-lg border">
              <div className="text-lg font-semibold text-primary mb-2">Real-time Features</div>
              <div className="space-y-1">
                <div className="text-sm text-muted-foreground">Live deployment status</div>
                <div className="text-sm text-muted-foreground">Health monitoring</div>
                <div className="text-sm text-muted-foreground">Performance metrics</div>
                <div className="text-sm text-muted-foreground">Error notifications</div>
              </div>
            </div>
          </div>
        </Card>

        {/* Implementation Results */}
        <Card className="p-6">
          <h3 className="text-xl font-bold text-primary mb-6">📈 Implementation Results & Key Achievements</h3>
          <div className="grid grid-cols-4 gap-6 text-center">
            <div className="p-4 bg-gradient-to-br from-green-500/10 to-green-500/5 rounded-lg border">
              <div className="text-2xl font-bold text-green-600 mb-1">100%</div>
              <div className="text-sm text-muted-foreground">Automated Workflow</div>
            </div>
            <div className="p-4 bg-gradient-to-br from-blue-500/10 to-blue-500/5 rounded-lg border">
              <div className="text-2xl font-bold text-blue-600 mb-1">95%</div>
              <div className="text-sm text-muted-foreground">Deployment Success Rate</div>
            </div>
            <div className="p-4 bg-gradient-to-br from-purple-500/10 to-purple-500/5 rounded-lg border">
              <div className="text-2xl font-bold text-purple-600 mb-1">5min</div>
              <div className="text-sm text-muted-foreground">Average Deployment Time</div>
            </div>
            <div className="p-4 bg-gradient-to-br from-orange-500/10 to-orange-500/5 rounded-lg border">
              <div className="text-2xl font-bold text-orange-600 mb-1">8+</div>
              <div className="text-sm text-muted-foreground">Supported Channels</div>
            </div>
          </div>
        </Card>
      </div>
    ),
    animation: 'slide'
  },
  {
    id: 9,
    title: "AI Models, MCP Protocol & Knowledge Base Implementation",
    subtitle: "Complete AI Infrastructure with RAG, Model Selection & Context Management",
    content: (
      <div className="h-full overflow-y-auto space-y-6 animate-fade-in">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full">
            <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
            <span className="text-sm font-medium">Comprehensive AI Infrastructure Implementation</span>
          </div>
        </div>

        {/* MCP Protocol & Model Selection */}
        <div className="grid grid-cols-2 gap-6">
          <Card className="p-6">
            <div className="text-center mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl">🔗</span>
              </div>
              <h3 className="text-lg font-bold text-blue-700">MCP Protocol Implementation</h3>
            </div>
            <div className="space-y-3">
              <div className="p-3 bg-blue-50 rounded-lg border">
                <h4 className="font-semibold text-blue-800 mb-2">🧠 Context Sharing</h4>
                <p className="text-sm text-blue-700">Multi-model communication and state management</p>
              </div>
              <div className="p-3 bg-indigo-50 rounded-lg border">
                <h4 className="font-semibold text-indigo-800 mb-2">⚡ Session Management</h4>
                <p className="text-sm text-indigo-700">Persistent context across agent interactions</p>
              </div>
              <div className="p-3 bg-purple-50 rounded-lg border">
                <h4 className="font-semibold text-purple-800 mb-2">🔄 Model Orchestration</h4>
                <p className="text-sm text-purple-700">Intelligent routing between AI models</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="text-center mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl">🎯</span>
              </div>
              <h3 className="text-lg font-bold text-green-700">AI Model Assignment Matrix</h3>
            </div>
            <div className="space-y-3">
              <div className="p-3 bg-green-50 rounded-lg border">
                <h4 className="font-semibold text-green-800 mb-2">📝 Text Processing</h4>
                <div className="text-xs space-y-1">
                  <div>• Llama 3.1 8B - Complex reasoning</div>
                  <div>• Phi-3 Mini - Quick responses</div>
                  <div>• Gemma 2B - Classifications</div>
                </div>
              </div>
              <div className="p-3 bg-emerald-50 rounded-lg border">
                <h4 className="font-semibold text-emerald-800 mb-2">👁️ Vision Tasks</h4>
                <div className="text-xs space-y-1">
                  <div>• GPT-4V - Document analysis</div>
                  <div>• CLIP - Image understanding</div>
                  <div>• OCR Engine - Text extraction</div>
                </div>
              </div>
              <div className="p-3 bg-cyan-50 rounded-lg border">
                <h4 className="font-semibold text-cyan-800 mb-2">🔬 Specialized Models</h4>
                <div className="text-xs space-y-1">
                  <div>• Medical NER - Entity recognition</div>
                  <div>• Sentiment Analysis - Emotional state</div>
                  <div>• Classification - Category assignment</div>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Knowledge Base & RAG Implementation */}
        <div className="grid grid-cols-2 gap-6">
          <Card className="p-6">
            <div className="text-center mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl">📚</span>
              </div>
              <h3 className="text-lg font-bold text-purple-700">RAG Knowledge Base</h3>
            </div>
            <div className="space-y-3">
              <div className="p-3 bg-purple-50 rounded-lg border">
                <h4 className="font-semibold text-purple-800 mb-2">📖 Knowledge Sources</h4>
                <div className="text-xs space-y-1">
                  <div>• Medical literature & protocols</div>
                  <div>• Treatment guidelines</div>
                  <div>• Internal policies & procedures</div>
                </div>
              </div>
              <div className="p-3 bg-violet-50 rounded-lg border">
                <h4 className="font-semibold text-violet-800 mb-2">🔍 Vector Database</h4>
                <div className="text-xs space-y-1">
                  <div>• pgvector semantic search</div>
                  <div>• Real-time updates</div>
                  <div>• Multi-language support</div>
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="text-center mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl">⚙️</span>
              </div>
              <h3 className="text-lg font-bold text-orange-700">Implementation Stack</h3>
            </div>
            <div className="space-y-3">
              <div className="p-3 bg-orange-50 rounded-lg border">
                <h4 className="font-semibold text-orange-800 mb-2">🏗️ Architecture</h4>
                <div className="text-xs space-y-1">
                  <div>• Supabase backend integration</div>
                  <div>• Real-time context sharing</div>
                  <div>• Edge functions processing</div>
                </div>
              </div>
              <div className="p-3 bg-red-50 rounded-lg border">
                <h4 className="font-semibold text-red-800 mb-2">🔧 Components</h4>
                <div className="text-xs space-y-1">
                  <div>• useHealthcareAI hook</div>
                  <div>• MCP SDK integration</div>
                  <div>• Vector embeddings system</div>
                </div>
              </div>
              <div className="p-3 bg-yellow-50 rounded-lg border">
                <h4 className="font-semibold text-yellow-800 mb-2">📊 Features</h4>
                <div className="text-xs space-y-1">
                  <div>• Context-aware retrieval</div>
                  <div>• Multi-model routing</div>
                  <div>• Performance monitoring</div>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Implementation Results */}
        <Card className="p-6">
          <h3 className="text-xl font-bold text-primary mb-6">🎯 Implementation Results & Performance</h3>
          <div className="grid grid-cols-4 gap-6 text-center">
            <div className="p-4 bg-gradient-to-br from-blue-500/10 to-blue-500/5 rounded-lg border">
              <div className="text-2xl font-bold text-blue-600 mb-1">96.8%</div>
              <div className="text-sm text-muted-foreground">AI Model Accuracy</div>
            </div>
            <div className="p-4 bg-gradient-to-br from-green-500/10 to-green-500/5 rounded-lg border">
              <div className="text-2xl font-bold text-green-600 mb-1">1.2s</div>
              <div className="text-sm text-muted-foreground">Response Time</div>
            </div>
            <div className="p-4 bg-gradient-to-br from-purple-500/10 to-purple-500/5 rounded-lg border">
              <div className="text-2xl font-bold text-purple-600 mb-1">85%</div>
              <div className="text-sm text-muted-foreground">Context Retention</div>
            </div>
            <div className="p-4 bg-gradient-to-br from-orange-500/10 to-orange-500/5 rounded-lg border">
              <div className="text-2xl font-bold text-orange-600 mb-1">99.9%</div>
              <div className="text-sm text-muted-foreground">System Uptime</div>
            </div>
          </div>
        </Card>
      </div>
    ),
    animation: 'zoom'
  },
  {
    id: 10,
    title: "Template Configuration & AI Automation Implementation",
    subtitle: "Complete Template System with Actions, Tasks & Intelligent Deployment",
    content: (
      <div className="h-full overflow-y-auto space-y-6 animate-fade-in">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full">
            <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
            <span className="text-sm font-medium">Advanced Template & Automation Framework</span>
          </div>
        </div>

        {/* Template Configuration & AI Automation */}
        <div className="grid grid-cols-2 gap-6">
          <Card className="p-6">
            <div className="text-center mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl">📋</span>
              </div>
              <h3 className="text-lg font-bold text-blue-700">Template Library & Configuration</h3>
            </div>
            <div className="space-y-3">
              <div className="p-3 bg-blue-50 rounded-lg border">
                <h4 className="font-semibold text-blue-800 mb-2">🏥 Pre-built Templates</h4>
                <div className="text-xs space-y-1">
                  <div>• Intake Assessment workflows</div>
                  <div>• Treatment Planning automation</div>
                  <div>• Progress Monitoring systems</div>
                </div>
              </div>
              <div className="p-3 bg-indigo-50 rounded-lg border">
                <h4 className="font-semibold text-indigo-800 mb-2">⚙️ Configuration Options</h4>
                <div className="text-xs space-y-1">
                  <div>• Custom fields & forms</div>
                  <div>• Workflow automation rules</div>
                  <div>• Integration endpoints</div>
                </div>
              </div>
              <div className="p-3 bg-purple-50 rounded-lg border">
                <h4 className="font-semibold text-purple-800 mb-2">🔒 Security & Compliance</h4>
                <div className="text-xs space-y-1">
                  <div>• HIPAA compliance settings</div>
                  <div>• Access control configuration</div>
                  <div>• Audit trail management</div>
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="text-center mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl">🤖</span>
              </div>
              <h3 className="text-lg font-bold text-green-700">AI-Powered Automation</h3>
            </div>
            <div className="space-y-3">
              <div className="p-3 bg-green-50 rounded-lg border">
                <h4 className="font-semibold text-green-800 mb-2">⚡ Smart Actions</h4>
                <div className="text-xs space-y-1">
                  <div>• Auto-routing & case assignment</div>
                  <div>• Contextual notifications</div>
                  <div>• AI-assisted form completion</div>
                </div>
              </div>
              <div className="p-3 bg-emerald-50 rounded-lg border">
                <h4 className="font-semibold text-emerald-800 mb-2">📊 Intelligent Tasks</h4>
                <div className="text-xs space-y-1">
                  <div>• Appointment optimization</div>
                  <div>• Automated reporting & insights</div>
                  <div>• Proactive follow-up outreach</div>
                </div>
              </div>
              <div className="p-3 bg-cyan-50 rounded-lg border">
                <h4 className="font-semibold text-cyan-800 mb-2">💡 AI Autosuggest</h4>
                <div className="text-xs space-y-1">
                  <div>• Evidence-based treatment plans</div>
                  <div>• Personalized interventions</div>
                  <div>• Predictive outcome analytics</div>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Multi-Platform Deployment */}
        <div className="grid grid-cols-2 gap-6">
          <Card className="p-6">
            <div className="text-center mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl">🌐</span>
              </div>
              <h3 className="text-lg font-bold text-purple-700">Multi-Platform Deployment</h3>
            </div>
            <div className="space-y-3">
              <div className="p-3 bg-purple-50 rounded-lg border">
                <h4 className="font-semibold text-purple-800 mb-2">🖥️ Web Platform</h4>
                <div className="text-xs space-y-1">
                  <div>• Rich interactive forms</div>
                  <div>• Advanced data visualization</div>
                  <div>• Multi-tab workflows</div>
                </div>
              </div>
              <div className="p-3 bg-violet-50 rounded-lg border">
                <h4 className="font-semibold text-violet-800 mb-2">📱 Mobile Apps</h4>
                <div className="text-xs space-y-1">
                  <div>• Touch-optimized interfaces</div>
                  <div>• Offline capabilities</div>
                  <div>• Push notification integration</div>
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="text-center mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl">🔄</span>
              </div>
              <h3 className="text-lg font-bold text-orange-700">Template Synchronization</h3>
            </div>
            <div className="space-y-3">
              <div className="p-3 bg-orange-50 rounded-lg border">
                <h4 className="font-semibold text-orange-800 mb-2">⚡ Real-time Sync</h4>
                <div className="text-xs space-y-1">
                  <div>• Cross-channel synchronization</div>
                  <div>• Version control & rollback</div>
                  <div>• A/B testing capabilities</div>
                </div>
              </div>
              <div className="p-3 bg-red-50 rounded-lg border">
                <h4 className="font-semibold text-red-800 mb-2">📊 Performance Monitoring</h4>
                <div className="text-xs space-y-1">
                  <div>• Template usage analytics</div>
                  <div>• User interaction tracking</div>
                  <div>• Conversion optimization</div>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Implementation Results */}
        <Card className="p-6">
          <h3 className="text-xl font-bold text-primary mb-6">📈 Template & Automation Results</h3>
          <div className="grid grid-cols-4 gap-6 text-center">
            <div className="p-4 bg-gradient-to-br from-blue-500/10 to-blue-500/5 rounded-lg border">
              <div className="text-2xl font-bold text-blue-600 mb-1">90%</div>
              <div className="text-sm text-muted-foreground">Form Completion Rate</div>
            </div>
            <div className="p-4 bg-gradient-to-br from-green-500/10 to-green-500/5 rounded-lg border">
              <div className="text-2xl font-bold text-green-600 mb-1">75%</div>
              <div className="text-sm text-muted-foreground">Admin Task Reduction</div>
            </div>
            <div className="p-4 bg-gradient-to-br from-purple-500/10 to-purple-500/5 rounded-lg border">
              <div className="text-2xl font-bold text-purple-600 mb-1">15min</div>
              <div className="text-sm text-muted-foreground">Average Setup Time</div>
            </div>
            <div className="p-4 bg-gradient-to-br from-orange-500/10 to-orange-500/5 rounded-lg border">
              <div className="text-2xl font-bold text-orange-600 mb-1">85%</div>
              <div className="text-sm text-muted-foreground">User Satisfaction</div>
            </div>
          </div>
        </Card>
      </div>
    ),
    animation: 'fade'
  },
  {
    id: 11,
    title: "Advanced AI Models & Multi-Modal Capabilities",
    subtitle: "Complete AI Infrastructure with Vision, Voice, Text Processing & Live Agents",
    content: (
      <div className="h-full overflow-y-auto space-y-6 animate-fade-in">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full">
            <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
            <span className="text-sm font-medium">Comprehensive AI Model Integration</span>
          </div>
        </div>

        {/* AI Model Categories */}
        <div className="grid grid-cols-2 gap-6">
          <Card className="p-6">
            <h3 className="text-xl font-bold mb-4 text-primary">🧠 Large Language Models</h3>
            <div className="space-y-3">
              <div className="p-4 bg-gradient-to-br from-blue-500/10 to-blue-500/5 rounded-lg border">
                <div className="font-semibold text-blue-700 mb-2">OpenAI Models</div>
                <div className="space-y-1 text-sm">
                  <div>• GPT-4 Turbo - Complex reasoning and analysis</div>
                  <div>• GPT-4V - Vision language understanding</div>
                  <div>• GPT-4 Realtime - Live voice conversations</div>
                  <div>• Whisper - Speech-to-text transcription</div>
                </div>
              </div>
              <div className="p-4 bg-gradient-to-br from-purple-500/10 to-purple-500/5 rounded-lg border">
                <div className="font-semibold text-purple-700 mb-2">Anthropic Models</div>
                <div className="space-y-1 text-sm">
                  <div>• Claude 4 Opus - Most capable model</div>
                  <div>• Claude 4 Sonnet - High performance & efficiency</div>
                  <div>• Claude 3.5 Haiku - Fastest responses</div>
                  <div>• 200K context window support</div>
                </div>
              </div>
              <div className="p-4 bg-gradient-to-br from-green-500/10 to-green-500/5 rounded-lg border">
                <div className="font-semibold text-green-700 mb-2">Hugging Face Models</div>
                <div className="space-y-1 text-sm">
                  <div>• FLUX.1-schnell - Fast image generation</div>
                  <div>• Llama 3.1 8B - Local text processing</div>
                  <div>• DistilBERT - Text classification</div>
                  <div>• Custom fine-tuned models</div>
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-xl font-bold mb-4 text-primary">🎵 Voice & Audio Processing</h3>
            <div className="space-y-3">
              <div className="p-4 bg-gradient-to-br from-orange-500/10 to-orange-500/5 rounded-lg border">
                <div className="font-semibold text-orange-700 mb-2">ElevenLabs Voice</div>
                <div className="space-y-1 text-sm">
                  <div>• 30+ High-quality voices (Aria, Roger, Sarah)</div>
                  <div>• Multilingual v2 - 29 languages</div>
                  <div>• Turbo v2.5 - Low latency, 32 languages</div>
                  <div>• Voice cloning & customization</div>
                </div>
              </div>
              <div className="p-4 bg-gradient-to-br from-red-500/10 to-red-500/5 rounded-lg border">
                <div className="font-semibold text-red-700 mb-2">Speech-to-Text</div>
                <div className="space-y-1 text-sm">
                  <div>• OpenAI Whisper integration</div>
                  <div>• Real-time transcription</div>
                  <div>• Multi-language support</div>
                  <div>• Optimized buffer handling</div>
                </div>
              </div>
              <div className="p-4 bg-gradient-to-br from-pink-500/10 to-pink-500/5 rounded-lg border">
                <div className="font-semibold text-pink-700 mb-2">Live Voice Agents</div>
                <div className="space-y-1 text-sm">
                  <div>• OpenAI Realtime API integration</div>
                  <div>• WebSocket-based voice conversations</div>
                  <div>• Function calling support</div>
                  <div>• Voice Activity Detection (VAD)</div>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Vision & Multi-Modal */}
        <div className="grid grid-cols-2 gap-6">
          <Card className="p-6">
            <h3 className="text-xl font-bold mb-4 text-primary">👁️ Vision & Image Processing</h3>
            <div className="space-y-3">
              <div className="p-4 bg-gradient-to-br from-indigo-500/10 to-indigo-500/5 rounded-lg border">
                <div className="font-semibold text-indigo-700 mb-2">Vision Language Models</div>
                <div className="space-y-1 text-sm">
                  <div>• GPT-4V - Document analysis & OCR</div>
                  <div>• CLIP - Visual understanding</div>
                  <div>• PaLI - Document processing</div>
                  <div>• Custom OCR pipelines</div>
                </div>
              </div>
              <div className="p-4 bg-gradient-to-br from-cyan-500/10 to-cyan-500/5 rounded-lg border">
                <div className="font-semibold text-cyan-700 mb-2">Image Generation</div>
                <div className="space-y-1 text-sm">
                  <div>• FLUX.1-dev - High-quality images</div>
                  <div>• FLUX.1-schnell - Fast generation</div>
                  <div>• Image editing & merging</div>
                  <div>• 1920x1920 max resolution</div>
                </div>
              </div>
              <div className="p-4 bg-gradient-to-br from-teal-500/10 to-teal-500/5 rounded-lg border">
                <div className="font-semibold text-teal-700 mb-2">Medical Imaging</div>
                <div className="space-y-1 text-sm">
                  <div>• X-ray & MRI analysis</div>
                  <div>• DICOM format support</div>
                  <div>• AI-powered diagnostics</div>
                  <div>• Healthcare compliance</div>
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-xl font-bold mb-4 text-primary">🔧 AI Model Processing</h3>
            <div className="space-y-3">
              <div className="p-4 bg-gradient-to-br from-violet-500/10 to-violet-500/5 rounded-lg border">
                <div className="font-semibold text-violet-700 mb-2">Unified AI Gateway</div>
                <div className="space-y-1 text-sm">
                  <div>• Multi-provider AI routing</div>
                  <div>• Automatic failover & load balancing</div>
                  <div>• Rate limiting & cost optimization</div>
                  <div>• Request/response caching</div>
                </div>
              </div>
              <div className="p-4 bg-gradient-to-br from-amber-500/10 to-amber-500/5 rounded-lg border">
                <div className="font-semibold text-amber-700 mb-2">Edge Functions</div>
                <div className="space-y-1 text-sm">
                  <div>• ai-model-processor - Unified API</div>
                  <div>• voice-to-text - Speech processing</div>
                  <div>• realtime-chat - Live conversations</div>
                  <div>• image-generation - Visual AI</div>
                </div>
              </div>
              <div className="p-4 bg-gradient-to-br from-rose-500/10 to-rose-500/5 rounded-lg border">
                <div className="font-semibold text-rose-700 mb-2">Model Management</div>
                <div className="space-y-1 text-sm">
                  <div>• Dynamic model selection</div>
                  <div>• Performance monitoring</div>
                  <div>• A/B testing capabilities</div>
                  <div>• Cost & usage analytics</div>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Implementation Architecture */}
        <Card className="p-6">
          <h3 className="text-xl font-bold text-primary mb-6">🏗️ AI Infrastructure Architecture</h3>
          <div className="grid grid-cols-4 gap-6 text-center">
            <div className="p-4 bg-gradient-to-br from-blue-500/10 to-blue-500/5 rounded-lg border">
              <div className="text-lg font-semibold text-primary mb-2">Text Processing</div>
              <div className="space-y-1">
                <div className="text-sm text-muted-foreground">GPT-4 Turbo</div>
                <div className="text-sm text-muted-foreground">Claude 4 Sonnet</div>
                <div className="text-sm text-muted-foreground">Llama 3.1</div>
                <div className="text-sm text-muted-foreground">Custom Models</div>
              </div>
            </div>
            <div className="p-4 bg-gradient-to-br from-green-500/10 to-green-500/5 rounded-lg border">
              <div className="text-lg font-semibold text-primary mb-2">Voice & Audio</div>
              <div className="space-y-1">
                <div className="text-sm text-muted-foreground">ElevenLabs TTS</div>
                <div className="text-sm text-muted-foreground">OpenAI Whisper</div>
                <div className="text-sm text-muted-foreground">Realtime API</div>
                <div className="text-sm text-muted-foreground">Voice Agents</div>
              </div>
            </div>
            <div className="p-4 bg-gradient-to-br from-purple-500/10 to-purple-500/5 rounded-lg border">
              <div className="text-lg font-semibold text-primary mb-2">Vision & Images</div>
              <div className="space-y-1">
                <div className="text-sm text-muted-foreground">GPT-4V</div>
                <div className="text-sm text-muted-foreground">FLUX Models</div>
                <div className="text-sm text-muted-foreground">CLIP</div>
                <div className="text-sm text-muted-foreground">OCR Engines</div>
              </div>
            </div>
            <div className="p-4 bg-gradient-to-br from-orange-500/10 to-orange-500/5 rounded-lg border">
              <div className="text-lg font-semibold text-primary mb-2">Infrastructure</div>
              <div className="space-y-1">
                <div className="text-sm text-muted-foreground">Supabase Edge</div>
                <div className="text-sm text-muted-foreground">WebSocket APIs</div>
                <div className="text-sm text-muted-foreground">Real-time Sync</div>
                <div className="text-sm text-muted-foreground">Auto-scaling</div>
              </div>
            </div>
          </div>
        </Card>

        {/* Performance Metrics */}
        <Card className="p-6">
          <h3 className="text-xl font-bold text-primary mb-6">📊 AI Performance Metrics</h3>
          <div className="grid grid-cols-4 gap-6 text-center">
            <div className="p-4 bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 rounded-lg border">
              <div className="text-2xl font-bold text-emerald-600 mb-1">99.9%</div>
              <div className="text-sm text-muted-foreground">Model Uptime</div>
            </div>
            <div className="p-4 bg-gradient-to-br from-blue-500/10 to-blue-500/5 rounded-lg border">
              <div className="text-2xl font-bold text-blue-600 mb-1">&lt;200ms</div>
              <div className="text-sm text-muted-foreground">Average Response Time</div>
            </div>
            <div className="p-4 bg-gradient-to-br from-purple-500/10 to-purple-500/5 rounded-lg border">
              <div className="text-2xl font-bold text-purple-600 mb-1">8+</div>
              <div className="text-sm text-muted-foreground">AI Providers</div>
            </div>
            <div className="p-4 bg-gradient-to-br from-orange-500/10 to-orange-500/5 rounded-lg border">
              <div className="text-2xl font-bold text-orange-600 mb-1">50+</div>
              <div className="text-sm text-muted-foreground">Supported Models</div>
            </div>
          </div>
        </Card>
      </div>
    ),
    animation: 'fade'
  },
  {
    id: 12,
    title: "Current Implementation & Enterprise Features",
    subtitle: "Complete System Overview with Advanced Agent Management & Multi-Channel Deployment",
    content: (
      <div className="h-full overflow-y-auto space-y-6 animate-fade-in">
        {/* Implementation Overview */}
        <Card className="p-6">
          <h3 className="text-xl font-bold mb-4 text-primary">🚀 Current Implementation Status</h3>
          <div className="grid grid-cols-3 gap-6">
            <div className="space-y-4">
              <h4 className="font-semibold text-green-700">✅ Completed Features</h4>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-sm">Complete agent lifecycle management</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-sm">Multi-channel deployment system</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-sm">Real-time testing & validation</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-sm">Advanced AI model integration</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-sm">Voice & TTS capabilities</span>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <h4 className="font-semibold text-blue-700">🔧 Advanced Features</h4>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span className="text-sm">Duplicate prevention system</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span className="text-sm">Automated draft cleanup</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span className="text-sm">Real-time status synchronization</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span className="text-sm">Health monitoring & metrics</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span className="text-sm">Database automation triggers</span>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <h4 className="font-semibold text-purple-700">🌐 Integrations</h4>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                  <span className="text-sm">OpenAI & Anthropic models</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                  <span className="text-sm">ElevenLabs voice synthesis</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                  <span className="text-sm">Hugging Face model hub</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                  <span className="text-sm">Supabase real-time backend</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                  <span className="text-sm">Multi-provider voice systems</span>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Technical Architecture */}
        <Card className="p-6">
          <h3 className="text-xl font-bold mb-4 text-primary">🏗️ Technical Architecture & Scalability</h3>
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="font-semibold">Database & Backend</h4>
              <div className="space-y-3">
                <div className="p-3 bg-blue-50 rounded-lg">
                  <div className="font-medium">🗄️ Supabase PostgreSQL</div>
                  <div className="text-sm text-muted-foreground">Complete schema with RLS policies & triggers</div>
                </div>
                <div className="p-3 bg-green-50 rounded-lg">
                  <div className="font-medium">⚡ Edge Functions</div>
                  <div className="text-sm text-muted-foreground">AI processing, voice services, real-time APIs</div>
                </div>
                <div className="p-3 bg-purple-50 rounded-lg">
                  <div className="font-medium">🔄 Real-time Subscriptions</div>
                  <div className="text-sm text-muted-foreground">Live updates, deployment status, health monitoring</div>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <h4 className="font-semibold">Frontend & UI</h4>
              <div className="space-y-3">
                <div className="p-3 bg-orange-50 rounded-lg">
                  <div className="font-medium">⚛️ React + TypeScript</div>
                  <div className="text-sm text-muted-foreground">Modern component architecture with full type safety</div>
                </div>
                <div className="p-3 bg-pink-50 rounded-lg">
                  <div className="font-medium">🎨 Design System</div>
                  <div className="text-sm text-muted-foreground">Tailwind CSS + shadcn/ui components</div>
                </div>
                <div className="p-3 bg-cyan-50 rounded-lg">
                  <div className="font-medium">🖱️ Drag & Drop</div>
                  <div className="text-sm text-muted-foreground">@dnd-kit integration for intuitive deployment</div>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Performance Metrics */}
        <Card className="p-6">
          <h3 className="text-xl font-bold text-primary mb-6">📊 System Performance & Achievements</h3>
          <div className="grid grid-cols-4 gap-6 text-center">
            <div className="p-4 bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 rounded-lg border">
              <div className="text-2xl font-bold text-emerald-600 mb-1">100%</div>
              <div className="text-sm text-muted-foreground">Feature Completion</div>
            </div>
            <div className="p-4 bg-gradient-to-br from-blue-500/10 to-blue-500/5 rounded-lg border">
              <div className="text-2xl font-bold text-blue-600 mb-1">8+</div>
              <div className="text-sm text-muted-foreground">Deployment Channels</div>
            </div>
            <div className="p-4 bg-gradient-to-br from-purple-500/10 to-purple-500/5 rounded-lg border">
              <div className="text-2xl font-bold text-purple-600 mb-1">50+</div>
              <div className="text-sm text-muted-foreground">AI Models Supported</div>
            </div>
            <div className="p-4 bg-gradient-to-br from-orange-500/10 to-orange-500/5 rounded-lg border">
              <div className="text-2xl font-bold text-orange-600 mb-1">99.9%</div>
              <div className="text-sm text-muted-foreground">System Uptime</div>
            </div>
          </div>
        </Card>
      </div>
    ),
    animation: 'zoom'
  },
  {
    id: 14,
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
  }
];

export const AgenticAIPresentation: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoplay, setIsAutoplay] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const { downloadHTML, downloadPDF } = useSimplePresentationCapture();

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
          await downloadHTML(slides);
          break;
        case 'pdf':
          await downloadPDF(slides);
          break;
        case 'ppt':
          // For PowerPoint, use HTML format with all slides captured
          await downloadHTML(slides);
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
              title="Export all slides as HTML with visual content"
            >
              <FileText className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleExport('pdf')}
              title="Export all slides as PDF with visual content"
            >
              <Download className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleExport('ppt')}
              title="Export all slides as comprehensive HTML (PowerPoint alternative)"
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
            "h-[calc(100%-120px)] overflow-y-auto", // Calculate available space minus header
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