import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle, Bot, Workflow, BarChart3, Settings, Palette, Eye, Rocket, Monitor, Zap, Database, Shield, Link } from 'lucide-react';

export interface Slide {
  id: number;
  title: string;
  subtitle?: string;
  content: React.ReactNode;
  animation: 'fade' | 'slide' | 'zoom' | 'flip';
}

export const presentationSlides: Slide[] = [
  {
    id: 1,
    title: "Agentic AI Implementation for Treatment Centers",
    subtitle: "Comprehensive AI automation platform with proven results and real-world implementation",
    animation: 'fade',
    content: (
      <div className="space-y-8">
        {/* Main Hero Section */}
        <div className="text-center mb-12">
          <div className="w-24 h-24 bg-gradient-to-br from-purple-500 to-blue-600 rounded-full mx-auto mb-6 flex items-center justify-center animate-pulse">
            <Bot className="w-12 h-12 text-white" />
          </div>
          <h3 className="text-2xl font-bold text-gray-800 mb-4">Agentic AI Implementation</h3>
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Features */}
          <div className="space-y-6">
            <h4 className="text-xl font-semibold text-purple-600 mb-4">What Was Implemented</h4>
            
            <div className="space-y-4">
              <div className="flex items-start gap-3 p-4 bg-green-50 rounded-lg border border-green-200 animate-fade-in">
                <CheckCircle className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
                <div>
                  <div className="font-semibold text-green-800">Multi-Tenant Healthcare Platform</div>
                  <div className="text-sm text-green-700">Complete RBAC system with facility management</div>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-green-50 rounded-lg border border-green-200 animate-fade-in">
                <CheckCircle className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
                <div>
                  <div className="font-semibold text-green-800">Intelligent Patient Onboarding</div>
                  <div className="text-sm text-green-700">AI-powered form completion and validation</div>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-green-50 rounded-lg border border-green-200 animate-fade-in">
                <CheckCircle className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
                <div>
                  <div className="font-semibold text-green-800">Automated Module Detection</div>
                  <div className="text-sm text-green-700">Database schema scanning and code generation</div>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-green-50 rounded-lg border border-green-200 animate-fade-in">
                <CheckCircle className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
                <div>
                  <div className="font-semibold text-green-800">Real-time Analytics Dashboard</div>
                  <div className="text-sm text-green-700">Performance monitoring and insights</div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Core Capabilities */}
          <div className="space-y-6">
            <div className="bg-purple-50 rounded-lg p-6 border border-purple-200">
              <div className="flex items-center gap-3 mb-4">
                <Bot className="w-6 h-6 text-purple-600" />
                <h5 className="text-lg font-semibold text-purple-800">Autonomous Decision Making</h5>
              </div>
              <ul className="space-y-2 text-sm text-purple-700">
                <li>• Multi-agent decision system</li>
                <li>• Context-aware automation</li>
                <li>• Self-improving algorithms</li>
                <li>• Human-in-the-loop validation</li>
              </ul>
            </div>

            <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
              <div className="flex items-center gap-3 mb-4">
                <Workflow className="w-6 h-6 text-blue-600" />
                <h5 className="text-lg font-semibold text-blue-800">Workflow Automation</h5>
              </div>
              <ul className="space-y-2 text-sm text-blue-700">
                <li>• Patient intake automation (90% reduction in manual work)</li>
                <li>• Treatment plan generation</li>
                <li>• Insurance verification automation</li>
                <li>• Appointment scheduling optimization</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    )
  },
  {
    id: 2,
    title: "Complete AI Agent Architecture & Deployment System",
    subtitle: "End-to-End Agent Lifecycle Management with Multi-Channel Deployment & Advanced Features",
    animation: 'slide',
    content: (
      <div className="space-y-8">
        {/* Agent Lifecycle Management */}
        <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-6 border border-purple-200">
          <h4 className="text-xl font-semibold text-purple-800 mb-6 text-center">Complete Agent Lifecycle Management</h4>
          <div className="text-center text-gray-600 mb-8">End-to-End Management of AI Agents Throughout Development</div>
          
          {/* Four Main Phases */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card className="text-center p-4 bg-blue-100 border-blue-300 hover:scale-105 transition-transform">
              <div className="w-12 h-12 bg-blue-600 rounded-full mx-auto mb-3 flex items-center justify-center">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <div className="font-semibold text-blue-800">Agent Creation</div>
              <div className="text-xs text-blue-600 mt-2">
                • Wizard-based setup<br/>
                • Template configuration<br/>
                • Domain specification<br/>
                • Runtime provisioning
              </div>
            </Card>

            <Card className="text-center p-4 bg-green-100 border-green-300 hover:scale-105 transition-transform">
              <div className="w-12 h-12 bg-green-600 rounded-full mx-auto mb-3 flex items-center justify-center">
                <Settings className="w-6 h-6 text-white" />
              </div>
              <div className="font-semibold text-green-800">Testing & Validation</div>
              <div className="text-xs text-green-600 mt-2">
                • Integrated testing tools<br/>
                • Live chat interface<br/>
                • Performance metrics<br/>
                • Model validation
              </div>
            </Card>

            <Card className="text-center p-4 bg-purple-100 border-purple-300 hover:scale-105 transition-transform">
              <div className="w-12 h-12 bg-purple-600 rounded-full mx-auto mb-3 flex items-center justify-center">
                <Rocket className="w-6 h-6 text-white" />
              </div>
              <div className="font-semibold text-purple-800">Multi-Channel Deployment</div>
              <div className="text-xs text-purple-600 mt-2">
                • Voice and text<br/>
                • Web and mobile<br/>
                • API integration<br/>
                • Workflow forms
              </div>
            </Card>

            <Card className="text-center p-4 bg-orange-100 border-orange-300 hover:scale-105 transition-transform">
              <div className="w-12 h-12 bg-orange-600 rounded-full mx-auto mb-3 flex items-center justify-center">
                <Monitor className="w-6 h-6 text-white" />
              </div>
              <div className="font-semibold text-orange-800">Monitoring & Management</div>
              <div className="text-xs text-orange-600 mt-2">
                • Real-time monitoring<br/>
                • Performance analytics<br/>
                • Resource optimization<br/>
                • Usage tracking
              </div>
            </Card>
          </div>
        </div>

        {/* Bottom Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Advanced Agent Management */}
          <div className="space-y-4">
            <h5 className="text-lg font-semibold text-gray-800">Advanced Agent Management</h5>
            <div className="space-y-3">
              <div className="bg-gray-50 p-4 rounded border">
                <div className="font-medium text-gray-800">Duplicate Prevention System</div>
                <div className="text-sm text-gray-600">Automatic detection that prevents duplicate agents</div>
              </div>
              <div className="bg-gray-50 p-4 rounded border">
                <div className="font-medium text-gray-800">Draft Change Automation</div>
                <div className="text-sm text-gray-600">Auto-revision auto-save, API integration, and automation</div>
              </div>
              <div className="bg-gray-50 p-4 rounded border">
                <div className="font-medium text-gray-800">Agent Synchronization</div>
                <div className="text-sm text-gray-600">Real-time sync across all agent instances</div>
              </div>
            </div>
          </div>

          {/* Deployment Infrastructure */}
          <div className="space-y-4">
            <h5 className="text-lg font-semibold text-gray-800">Deployment Infrastructure</h5>
            <div className="space-y-3">
              <div className="bg-gray-50 p-4 rounded border">
                <div className="font-medium text-gray-800">Drag & Drop Deployment</div>
                <div className="text-sm text-gray-600">Visual interface for rapid agent deployment</div>
              </div>
              <div className="bg-gray-50 p-4 rounded border">
                <div className="font-medium text-gray-800">Health Monitoring</div>
                <div className="text-sm text-gray-600">Comprehensive application health check and analytics</div>
              </div>
              <div className="bg-gray-50 p-4 rounded border">
                <div className="font-medium text-gray-800">Meta Provider Integration</div>
                <div className="text-sm text-gray-600">Seamless integration with external meta providers</div>
              </div>
            </div>
          </div>
        </div>

        {/* Technical Implementation */}
        <div className="bg-gray-50 rounded-lg p-6">
          <h5 className="text-lg font-semibold text-gray-800 mb-4">Technical Implementation Details</h5>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div>
              <Badge className="mb-2 bg-blue-100 text-blue-800">Core Components</Badge>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• HealthflexAgent.tsx</li>
                <li>• DeploymentService.jsx</li>
                <li>• AgentConfigController</li>
                <li>• ComponentLinkages.hooks</li>
              </ul>
            </div>
            <div>
              <Badge className="mb-2 bg-green-100 text-green-800">Database Tables</Badge>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• agent_channel_deployment</li>
                <li>• agent_providers</li>
                <li>• deployment_configs</li>
                <li>• agent_deployment_tracking</li>
              </ul>
            </div>
            <div>
              <Badge className="mb-2 bg-purple-100 text-purple-800">Automation Features</Badge>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Auto work triggers</li>
                <li>• Draft change functions</li>
                <li>• Algorithm optimization</li>
                <li>• Health check tracking</li>
              </ul>
            </div>
            <div>
              <Badge className="mb-2 bg-orange-100 text-orange-800">Integration Points</Badge>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Voice provider APIs</li>
                <li>• Meta agent integrations</li>
                <li>• Real-time sync services</li>
                <li>• Template services</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    )
  },
  {
    id: 3,
    title: "Complete Agent Creation Journey Overview",
    subtitle: "End-to-End Process: Create → Test → Deploy → Monitor with Advanced Features",
    animation: 'zoom',
    content: (
      <div className="space-y-8">
        {/* Journey Steps */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6 border border-blue-200">
          <h4 className="text-xl font-semibold text-purple-800 mb-6 text-center">Complete Agent Lifecycle Management</h4>
          
          <div className="flex justify-center items-center space-x-8 mb-8">
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mb-3 animate-pulse">
                <Zap className="w-8 h-8 text-white" />
              </div>
              <div className="text-center">
                <div className="font-semibold text-blue-800">Create Agent</div>
                <div className="text-xs text-blue-600">Wizard setup, Template selection, Domain mapping</div>
              </div>
            </div>
            
            <div className="w-8 h-1 bg-gray-300 rounded"></div>
            
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mb-3">
                <Settings className="w-8 h-8 text-white" />
              </div>
              <div className="text-center">
                <div className="font-semibold text-green-800">Configure & Design</div>
                <div className="text-xs text-green-600">Canvas design, Custom templates, Data validation</div>
              </div>
            </div>
            
            <div className="w-8 h-1 bg-gray-300 rounded"></div>
            
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center mb-3">
                <Eye className="w-8 h-8 text-white" />
              </div>
              <div className="text-center">
                <div className="font-semibold text-purple-800">Test & Validate</div>
                <div className="text-xs text-purple-600">Live testing interface, Performance metrics</div>
              </div>
            </div>
            
            <div className="w-8 h-1 bg-gray-300 rounded"></div>
            
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-orange-600 rounded-full flex items-center justify-center mb-3">
                <Rocket className="w-8 h-8 text-white" />
              </div>
              <div className="text-center">
                <div className="font-semibold text-orange-800">Deploy to Channels</div>
                <div className="text-xs text-orange-600">Multi-channel deployment, Voice & text integration</div>
              </div>
            </div>
          </div>
        </div>

        {/* Feature Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Advanced Management */}
          <div className="space-y-6">
            <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
              <div className="flex items-center gap-3 mb-4">
                <Database className="w-6 h-6 text-blue-600" />
                <h5 className="text-lg font-semibold text-blue-800">Advanced Management & Automation Features</h5>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h6 className="font-semibold text-blue-700 mb-2">Duplicate Prevention System</h6>
                  <ul className="text-sm text-blue-600 space-y-1">
                    <li>• Real-time name validation</li>
                    <li>• Database duplication checks</li>
                    <li>• User-friendly duplication enforcement</li>
                    <li>• Formatted feedback on conflicts</li>
                  </ul>
                </div>
                <div>
                  <h6 className="font-semibold text-blue-700 mb-2">Draft Change System</h6>
                  <ul className="text-sm text-blue-600 space-y-1">
                    <li>• Automated 1-day draft operation</li>
                    <li>• User notification before cleanup</li>
                    <li>• Rich network with connections</li>
                    <li>• Storage optimization</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="bg-green-50 rounded-lg p-6 border border-green-200">
              <div className="flex items-center gap-3 mb-4">
                <Shield className="w-6 h-6 text-green-600" />
                <h5 className="text-lg font-semibold text-green-800">Status Synchronization</h5>
              </div>
              <ul className="text-sm text-green-600 space-y-2">
                <li>• Real-time deployment status updates</li>
                <li>• Distributed agent status sync</li>
                <li>• Cross-channel status tracking</li>
                <li>• Instant trigger automation</li>
              </ul>
            </div>
          </div>

          {/* Deployment Process */}
          <div className="space-y-6">
            <div className="bg-purple-50 rounded-lg p-6 border border-purple-200">
              <div className="flex items-center gap-3 mb-4">
                <Rocket className="w-6 h-6 text-purple-600" />
                <h5 className="text-lg font-semibold text-purple-800">Complete Deployment Process</h5>
              </div>
              
              <div className="space-y-4">
                <div>
                  <h6 className="font-semibold text-purple-700 mb-2">Pre-Deployment Steps</h6>
                  <div className="flex flex-wrap gap-2">
                    <Badge className="bg-purple-100 text-purple-700">Agent setup & testing complete</Badge>
                    <Badge className="bg-purple-100 text-purple-700">Model capacity verification</Badge>
                    <Badge className="bg-purple-100 text-purple-700">Channel capacity verification</Badge>
                    <Badge className="bg-purple-100 text-purple-700">Security & compliance checks</Badge>
                  </div>
                </div>
                
                <div>
                  <h6 className="font-semibold text-purple-700 mb-2">Deployment Execution</h6>
                  <div className="flex flex-wrap gap-2">
                    <Badge className="bg-green-100 text-green-700">Drag & drop agent to channels</Badge>
                    <Badge className="bg-green-100 text-green-700">Automatic database record creation</Badge>
                    <Badge className="bg-green-100 text-green-700">Real-time status updates</Badge>
                    <Badge className="bg-green-100 text-green-700">Health monitoring activation</Badge>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Multi-Channel Deployment */}
        <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg p-6 border border-gray-200">
          <h5 className="text-lg font-semibold text-gray-800 mb-6 text-center">Multi-Channel Deployment Options</h5>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="text-center p-4 bg-blue-100 border-blue-300">
              <div className="w-12 h-12 bg-blue-600 rounded-full mx-auto mb-3 flex items-center justify-center">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <div className="font-semibold text-blue-800 mb-2">Voice Channels</div>
              <ul className="text-xs text-blue-600 space-y-1">
                <li>• Twilio Voice API</li>
                <li>• OpenAI TTS</li>
                <li>• ElevenLabs voices</li>
                <li>• Custom voice providers</li>
              </ul>
            </Card>

            <Card className="text-center p-4 bg-green-100 border-green-300">
              <div className="w-12 h-12 bg-green-600 rounded-full mx-auto mb-3 flex items-center justify-center">
                <Link className="w-6 h-6 text-white" />
              </div>
              <div className="font-semibold text-green-800 mb-2">Chat Channels</div>
              <ul className="text-xs text-green-600 space-y-1">
                <li>• Web chat widgets</li>
                <li>• Messaging business</li>
                <li>• WhatsApp integration</li>
                <li>• SMS integration</li>
              </ul>
            </Card>

            <Card className="text-center p-4 bg-purple-100 border-purple-300">
              <div className="w-12 h-12 bg-purple-600 rounded-full mx-auto mb-3 flex items-center justify-center">
                <Database className="w-6 h-6 text-white" />
              </div>
              <div className="font-semibold text-purple-800 mb-2">Email & API</div>
              <ul className="text-xs text-purple-600 space-y-1">
                <li>• Email automation</li>
                <li>• API webhooks</li>
                <li>• Third-party integrations</li>
                <li>• Custom integrations</li>
              </ul>
            </Card>

            <Card className="text-center p-4 bg-orange-100 border-orange-300">
              <div className="w-12 h-12 bg-orange-600 rounded-full mx-auto mb-3 flex items-center justify-center">
                <Bot className="w-6 h-6 text-white" />
              </div>
              <div className="font-semibold text-orange-800 mb-2">AI Assistants</div>
              <ul className="text-xs text-orange-600 space-y-1">
                <li>• Google Assistant</li>
                <li>• Alexa Skills</li>
                <li>• Meta AI assistant</li>
                <li>• Smart speakers</li>
              </ul>
            </Card>
          </div>
        </div>

        {/* Post-Deployment Monitoring */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
            <div className="flex items-center gap-3 mb-4">
              <Monitor className="w-6 h-6 text-blue-600" />
              <h5 className="text-lg font-semibold text-blue-800">Health Monitoring</h5>
            </div>
            <ul className="text-sm text-blue-600 space-y-2">
              <li>• Real-time deployment health checks</li>
              <li>• Performance metrics monitoring</li>
              <li>• User experience monitoring</li>
              <li>• Uptime & availability data</li>
            </ul>
          </div>

          <div className="bg-purple-50 rounded-lg p-6 border border-purple-200">
            <div className="flex items-center gap-3 mb-4">
              <BarChart3 className="w-6 h-6 text-purple-600" />
              <h5 className="text-lg font-semibold text-purple-800">Analytics Dashboard</h5>
            </div>
            <ul className="text-sm text-purple-600 space-y-2">
              <li>• Usage statistics per channel</li>
              <li>• Response time analytics</li>
              <li>• User satisfaction metrics</li>
              <li>• Cost optimization insights</li>
            </ul>
          </div>
        </div>
      </div>
    )
  },
  {
    id: 4,
    title: "Step 1: Wizard Setup & Initial Configuration",
    subtitle: "Session Management, User Authentication & Multi-Step Setup Process",
    animation: 'flip',
    content: (
      <div className="space-y-8">
        {/* 5-Step Wizard Configuration Process */}
        <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-6 border border-purple-200">
          <h4 className="text-xl font-semibold text-purple-800 mb-6 text-center">5-Step Wizard Configuration Process</h4>
          
          <div className="flex justify-center items-center space-x-4 mb-8 overflow-x-auto">
            <div className="flex flex-col items-center min-w-[100px]">
              <div className="w-14 h-14 bg-blue-600 rounded-full flex items-center justify-center mb-2 text-white font-bold animate-pulse">1</div>
              <div className="text-center">
                <div className="font-semibold text-blue-800 text-sm">Session Init</div>
                <div className="text-xs text-blue-600">User session & environment setup</div>
              </div>
            </div>
            
            <div className="w-6 h-1 bg-gray-300 rounded hidden md:block"></div>
            
            <div className="flex flex-col items-center min-w-[100px]">
              <div className="w-14 h-14 bg-green-600 rounded-full flex items-center justify-center mb-2 text-white font-bold">2</div>
              <div className="text-center">
                <div className="font-semibold text-green-800 text-sm">Role Setup</div>
                <div className="text-xs text-green-600">Permission role & access permissions</div>
              </div>
            </div>
            
            <div className="w-6 h-1 bg-gray-300 rounded hidden md:block"></div>
            
            <div className="flex flex-col items-center min-w-[100px]">
              <div className="w-14 h-14 bg-purple-600 rounded-full flex items-center justify-center mb-2 text-white font-bold">3</div>
              <div className="text-center">
                <div className="font-semibold text-purple-800 text-sm">Agent Config</div>
                <div className="text-xs text-purple-600">Agent type selection & configuration</div>
              </div>
            </div>
            
            <div className="w-6 h-1 bg-gray-300 rounded hidden md:block"></div>
            
            <div className="flex flex-col items-center min-w-[100px]">
              <div className="w-14 h-14 bg-orange-600 rounded-full flex items-center justify-center mb-2 text-white font-bold">4</div>
              <div className="text-center">
                <div className="font-semibold text-orange-800 text-sm">Environment</div>
                <div className="text-xs text-orange-600">Development & production environment</div>
              </div>
            </div>
            
            <div className="w-6 h-1 bg-gray-300 rounded hidden md:block"></div>
            
            <div className="flex flex-col items-center min-w-[100px]">
              <div className="w-14 h-14 bg-indigo-600 rounded-full flex items-center justify-center mb-2 text-white font-bold">5</div>
              <div className="text-center">
                <div className="font-semibold text-indigo-800 text-sm">Validation</div>
                <div className="text-xs text-indigo-600">Configuration validation & testing</div>
              </div>
            </div>
          </div>
        </div>

        {/* Implementation Details */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Wizard Setup Implementation */}
          <div className="space-y-6">
            <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
              <div className="flex items-center gap-3 mb-4">
                <Settings className="w-6 h-6 text-blue-600" />
                <h5 className="text-lg font-semibold text-blue-800">Wizard Setup Implementation</h5>
              </div>
              
              <div className="space-y-4">
                <div>
                  <h6 className="font-semibold text-blue-700 mb-2">Session Management</h6>
                  <ul className="text-sm text-blue-600 space-y-1">
                    <li>• Secure session initialization</li>
                    <li>• Progressive permission flow for session data</li>
                    <li>• Authentication requirements</li>
                    <li>• Real-time session synchronization</li>
                  </ul>
                </div>
                
                <div>
                  <h6 className="font-semibold text-blue-700 mb-2">Authentication Flow</h6>
                  <ul className="text-sm text-blue-600 space-y-1">
                    <li>• Multi-provider authentication</li>
                    <li>• OAuth 2.0 integration</li>
                    <li>• Multi-factor user verification</li>
                    <li>• Identity policy enforcement</li>
                  </ul>
                </div>
                
                <div>
                  <h6 className="font-semibold text-blue-700 mb-2">Step Navigation</h6>
                  <ul className="text-sm text-blue-600 space-y-1">
                    <li>• Intelligent step management</li>
                    <li>• Validation of each step</li>
                    <li>• Conditional step logic</li>
                    <li>• Progress indicator updates</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Configuration Details */}
          <div className="space-y-6">
            <div className="bg-green-50 rounded-lg p-6 border border-green-200">
              <div className="flex items-center gap-3 mb-4">
                <Shield className="w-6 h-6 text-green-600" />
                <h5 className="text-lg font-semibold text-green-800">Configuration Details</h5>
              </div>
              
              <div className="space-y-4">
                <div>
                  <h6 className="font-semibold text-green-700 mb-2">Security Settings</h6>
                  <ul className="text-sm text-green-600 space-y-1">
                    <li>• Permission management</li>
                    <li>• Data encryption parameters</li>
                    <li>• Access control policies</li>
                    <li>• Audit logging setup</li>
                  </ul>
                </div>
                
                <div>
                  <h6 className="font-semibold text-green-700 mb-2">System Integration</h6>
                  <ul className="text-sm text-green-600 space-y-1">
                    <li>• Third-party system connections</li>
                    <li>• Database configuration</li>
                    <li>• API endpoint configuration</li>
                    <li>• Third-party service setup</li>
                  </ul>
                </div>
                
                <div>
                  <h6 className="font-semibold text-green-700 mb-2">Environment Setup</h6>
                  <ul className="text-sm text-green-600 space-y-1">
                    <li>• Development/production modes</li>
                    <li>• Resource allocation settings</li>
                    <li>• Network configuration</li>
                    <li>• Monitoring configuration</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Technical Implementation Components */}
        <div className="bg-gray-50 rounded-lg p-6">
          <h5 className="text-lg font-semibold text-gray-800 mb-6 text-center">Technical Implementation Components</h5>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Database className="w-5 h-5 text-blue-600" />
                <Badge className="bg-blue-100 text-blue-800">Core Hooks</Badge>
              </div>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• useAgentSetup() - Main wizard hook</li>
                <li>• useSessionFlow() - Session management</li>
                <li>• useAgentBuilder() - Session operations</li>
                <li>• useWizardNavigation() - Form steps</li>
              </ul>
            </div>
            
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Zap className="w-5 h-5 text-green-600" />
                <Badge className="bg-green-100 text-green-800">Provider Components</Badge>
              </div>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• AgentSetupProvider.jsx - Context wrapper</li>
                <li>• WizardFormValidation.jsx - Form logic</li>
                <li>• EfficiencyTools for persistence</li>
                <li>• Real-time step validation</li>
              </ul>
            </div>
            
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Monitor className="w-5 h-5 text-purple-600" />
                <Badge className="bg-purple-100 text-purple-800">State Management</Badge>
              </div>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Centralized configuration tracking</li>
                <li>• Step-by-step validation</li>
                <li>• UI state management</li>
                <li>• Error handling & recovery</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    )
  },
  {
    id: 5,
    title: "Step 2: Canvas Design & Visual Branding",
    subtitle: "Agent Creation, Template System, Use Cases & Complete Branding Implementation",
    animation: 'fade',
    content: (
      <div className="space-y-8">
        {/* Canvas Design Process */}
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-6 border border-purple-200">
          <h4 className="text-xl font-semibold text-purple-800 mb-6 text-center">Canvas Design & Visual Branding Process</h4>
          
          {/* Agent Creation Pathway */}
          <div className="mb-8">
            <h5 className="text-lg font-semibold text-purple-700 mb-4">🤖 Agent Creation Pathway</h5>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="p-4 bg-blue-100 border-blue-300 hover:scale-105 transition-transform">
                <div className="w-12 h-12 bg-blue-600 rounded-full mx-auto mb-3 flex items-center justify-center">
                  <Palette className="w-6 h-6 text-white" />
                </div>
                <div className="text-center">
                  <div className="font-semibold text-blue-800">Visual Design</div>
                  <div className="text-xs text-blue-600 mt-2">Custom UI elements, Color schemes, Layout design</div>
                </div>
              </Card>
              
              <Card className="p-4 bg-green-100 border-green-300 hover:scale-105 transition-transform">
                <div className="w-12 h-12 bg-green-600 rounded-full mx-auto mb-3 flex items-center justify-center">
                  <Settings className="w-6 h-6 text-white" />
                </div>
                <div className="text-center">
                  <div className="font-semibold text-green-800">Configuration</div>
                  <div className="text-xs text-green-600 mt-2">Behavioral settings, Response patterns, Integration points</div>
                </div>
              </Card>
              
              <Card className="p-4 bg-purple-100 border-purple-300 hover:scale-105 transition-transform">
                <div className="w-12 h-12 bg-purple-600 rounded-full mx-auto mb-3 flex items-center justify-center">
                  <Bot className="w-6 h-6 text-white" />
                </div>
                <div className="text-center">
                  <div className="font-semibold text-purple-800">Deployment</div>
                  <div className="text-xs text-purple-600 mt-2">Channel selection, Testing validation, Go-live process</div>
                </div>
              </Card>
            </div>
          </div>
        </div>

        {/* Template System & Categories */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Template System Details */}
          <div className="space-y-6">
            <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
              <div className="flex items-center gap-3 mb-4">
                <Database className="w-6 h-6 text-blue-600" />
                <h5 className="text-lg font-semibold text-blue-800">Template System Details</h5>
              </div>
              
              <div className="space-y-4">
                <div>
                  <h6 className="font-semibold text-blue-700 mb-2">Default Templates</h6>
                  <div className="text-sm text-blue-600 bg-white p-3 rounded border">
                    Pre-built agent templates for common healthcare use cases including patient intake, appointment scheduling, and treatment plan guidance.
                  </div>
                </div>
                
                <div>
                  <h6 className="font-semibold text-blue-700 mb-2">Custom Templates</h6>
                  <div className="text-sm text-blue-600 bg-white p-3 rounded border">
                    Build custom agent templates tailored to specific facility needs, workflows, and patient populations with drag-and-drop interface.
                  </div>
                </div>
                
                <div>
                  <h6 className="font-semibold text-blue-700 mb-2">Template Features</h6>
                  <div className="text-sm text-blue-600 bg-white p-3 rounded border">
                    Version control, template sharing, collaborative editing, and automated testing for all template configurations.
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Implementation Categories */}
          <div className="space-y-6">
            <div className="bg-green-50 rounded-lg p-6 border border-green-200">
              <div className="flex items-center gap-3 mb-4">
                <Workflow className="w-6 h-6 text-green-600" />
                <h5 className="text-lg font-semibold text-green-800">Implementation Categories & Business Units</h5>
              </div>
              
              <div className="space-y-4">
                <div>
                  <h6 className="font-semibold text-green-700 mb-2">Categories from Category Mapping Component</h6>
                  <div className="flex flex-wrap gap-2 mb-3">
                    <Badge className="bg-purple-100 text-purple-700">Intake</Badge>
                    <Badge className="bg-blue-100 text-blue-700">Treatment</Badge>
                    <Badge className="bg-green-100 text-green-700">Scheduling</Badge>
                    <Badge className="bg-orange-100 text-orange-700">Billing</Badge>
                  </div>
                </div>
                
                <div>
                  <h6 className="font-semibold text-green-700 mb-2">Assigned Data Repository Selection</h6>
                  <div className="text-sm text-green-600 bg-white p-3 rounded border">
                    Connect agents to specific data sources including patient records, treatment protocols, facility schedules, and insurance databases.
                  </div>
                </div>
                
                <div>
                  <h6 className="font-semibold text-green-700 mb-2">Dropdown Implementation</h6>
                  <div className="text-sm text-green-600 bg-white p-3 rounded border">
                    Dynamic dropdown menus for category selection, data source mapping, and workflow assignment with real-time validation.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Dynamic Use Case Generation */}
        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg p-6 border border-yellow-200">
          <h5 className="text-lg font-semibold text-orange-800 mb-6 text-center">🎯 Dynamic Use Case Generation & Dropdown Implementation</h5>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h6 className="font-semibold text-orange-700 mb-3">Use-Case Categories</h6>
              <div className="space-y-2">
                <div className="bg-white p-3 rounded border border-orange-200">
                  <div className="font-medium text-orange-800">Patient Intake</div>
                  <div className="text-sm text-orange-600">Automated form completion, insurance verification, medical history collection</div>
                </div>
                <div className="bg-white p-3 rounded border border-orange-200">
                  <div className="font-medium text-orange-800">Treatment Planning</div>
                  <div className="text-sm text-orange-600">Care plan generation, treatment recommendation, progress tracking</div>
                </div>
                <div className="bg-white p-3 rounded border border-orange-200">
                  <div className="font-medium text-orange-800">Appointment Management</div>
                  <div className="text-sm text-orange-600">Scheduling optimization, reminder automation, cancellation handling</div>
                </div>
              </div>
            </div>
            
            <div>
              <h6 className="font-semibold text-orange-700 mb-3">Dropdown Implementation</h6>
              <div className="space-y-2">
                <div className="bg-white p-3 rounded border border-orange-200">
                  <div className="font-medium text-orange-800">Category Selection</div>
                  <div className="text-sm text-orange-600">Hierarchical category dropdown with search and filtering capabilities</div>
                </div>
                <div className="bg-white p-3 rounded border border-orange-200">
                  <div className="font-medium text-orange-800">Template Assignment</div>
                  <div className="text-sm text-orange-600">Smart template matching based on selected categories and use cases</div>
                </div>
                <div className="bg-white p-3 rounded border border-orange-200">
                  <div className="font-medium text-orange-800">Configuration Options</div>
                  <div className="text-sm text-orange-600">Dynamic form generation based on selected templates and categories</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Visual Branding Components */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-6 bg-gradient-to-br from-purple-100 to-blue-100 border-purple-200">
            <div className="flex items-center gap-3 mb-4">
              <Palette className="w-6 h-6 text-purple-600" />
              <h6 className="font-semibold text-purple-800">Visual Elements</h6>
            </div>
            <ul className="text-sm text-purple-600 space-y-2">
              <li>• Custom color schemes</li>
              <li>• Brand logo integration</li>
              <li>• Typography selection</li>
              <li>• UI component styling</li>
            </ul>
          </Card>
          
          <Card className="p-6 bg-gradient-to-br from-green-100 to-teal-100 border-green-200">
            <div className="flex items-center gap-3 mb-4">
              <Settings className="w-6 h-6 text-green-600" />
              <h6 className="font-semibold text-green-800">Category/Mapping</h6>
            </div>
            <ul className="text-sm text-green-600 space-y-2">
              <li>• Component category mapping</li>
              <li>• Business unit assignments</li>
              <li>• Workflow integrations</li>
              <li>• Data source connections</li>
            </ul>
          </Card>
          
          <Card className="p-6 bg-gradient-to-br from-blue-100 to-cyan-100 border-blue-200">
            <div className="flex items-center gap-3 mb-4">
              <Eye className="w-6 h-6 text-blue-600" />
              <h6 className="font-semibold text-blue-800">Preview & Testing</h6>
            </div>
            <ul className="text-sm text-blue-600 space-y-2">
              <li>• Real-time canvas preview</li>
              <li>• Interactive agent testing</li>
              <li>• User experience validation</li>
              <li>• Performance optimization</li>
            </ul>
          </Card>
        </div>
      </div>
    )
  },
  {
    id: 8,
    title: "Complete Template System",
    subtitle: "Comprehensive template system with intelligent deployment, validation, and workflow automation",
    animation: 'fade',
    content: (
      <div className="space-y-8">
        {/* Main Stats */}
        <div className="grid grid-cols-4 gap-6 mb-8">
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600 mb-2">100%</div>
            <div className="text-sm text-green-700">Automated Workflow</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">95%</div>
            <div className="text-sm text-blue-700">Deployment Success Rate</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-600 mb-2">5min</div>
            <div className="text-sm text-purple-700">Average Deployment Time</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-orange-600 mb-2">8+</div>
            <div className="text-sm text-orange-700">Supported Channels</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Template Components */}
          <div className="space-y-6">
            <h4 className="text-xl font-semibold text-gray-800">Template Components</h4>
            <div className="text-sm text-gray-600 mb-4">Our comprehensive template system includes:</div>
            
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3 bg-blue-50 rounded border border-blue-200">
                <CheckCircle className="w-4 h-4 text-blue-600 mt-1 flex-shrink-0" />
                <div className="text-sm">
                  <div className="font-medium text-blue-800">Pre-built healthcare-specific agent templates</div>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-blue-50 rounded border border-blue-200">
                <CheckCircle className="w-4 h-4 text-blue-600 mt-1 flex-shrink-0" />
                <div className="text-sm">
                  <div className="font-medium text-blue-800">Customizable conversation flows</div>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-blue-50 rounded border border-blue-200">
                <CheckCircle className="w-4 h-4 text-blue-600 mt-1 flex-shrink-0" />
                <div className="text-sm">
                  <div className="font-medium text-blue-800">Clinical decision trees with medical validation</div>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-blue-50 rounded border border-blue-200">
                <CheckCircle className="w-4 h-4 text-blue-600 mt-1 flex-shrink-0" />
                <div className="text-sm">
                  <div className="font-medium text-blue-800">Integration points for EHR and other systems</div>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-blue-50 rounded border border-blue-200">
                <CheckCircle className="w-4 h-4 text-blue-600 mt-1 flex-shrink-0" />
                <div className="text-sm">
                  <div className="font-medium text-blue-800">Compliance-checked response patterns</div>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded border text-sm text-gray-600">
              Templates are maintained by clinical experts and updated regularly to reflect best practices and current medical guidelines. Each template undergoes rigorous validation before being made available.
            </div>
          </div>

          {/* Actions & Tasks */}
          <div className="space-y-6">
            <h4 className="text-xl font-semibold text-gray-800">Actions & Tasks</h4>
            <div className="text-sm text-gray-600 mb-4">Templates include configurable actions that agents can perform:</div>
            
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3 bg-green-50 rounded border border-green-200">
                <CheckCircle className="w-4 h-4 text-green-600 mt-1 flex-shrink-0" />
                <div className="text-sm">
                  <div className="font-medium text-green-800">Schedule appointments in integrated systems</div>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-green-50 rounded border border-green-200">
                <CheckCircle className="w-4 h-4 text-green-600 mt-1 flex-shrink-0" />
                <div className="text-sm">
                  <div className="font-medium text-green-800">Retrieve patient information from EHR</div>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-green-50 rounded border border-green-200">
                <CheckCircle className="w-4 h-4 text-green-600 mt-1 flex-shrink-0" />
                <div className="text-sm">
                  <div className="font-medium text-green-800">Process insurance eligibility checks</div>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-green-50 rounded border border-green-200">
                <CheckCircle className="w-4 h-4 text-green-600 mt-1 flex-shrink-0" />
                <div className="text-sm">
                  <div className="font-medium text-green-800">Generate and send documentation</div>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-green-50 rounded border border-green-200">
                <CheckCircle className="w-4 h-4 text-green-600 mt-1 flex-shrink-0" />
                <div className="text-sm">
                  <div className="font-medium text-green-800">Escalate to human providers when needed</div>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded border text-sm text-gray-600">
              Each action includes appropriate security checks, validation logic, and error handling to ensure reliable operation in healthcare environments.
            </div>
          </div>
        </div>

        {/* Intelligent Deployment */}
        <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-6 border border-purple-200">
          <h4 className="text-xl font-semibold text-purple-800 mb-6">Intelligent Deployment</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-4 rounded border border-purple-200">
              <h5 className="font-semibold text-purple-700 mb-3">Template Selection</h5>
              <div className="text-sm text-purple-600">
                AI-assisted recommendation of appropriate templates based on the specific healthcare use case and organizational requirements.
              </div>
            </div>
            
            <div className="bg-white p-4 rounded border border-purple-200">
              <h5 className="font-semibold text-purple-700 mb-3">Validation</h5>
              <div className="text-sm text-purple-600">
                Automated testing against common scenarios and edge cases to ensure the template performs as expected in clinical settings.
              </div>
            </div>
            
            <div className="bg-white p-4 rounded border border-purple-200">
              <h5 className="font-semibold text-purple-700 mb-3">Customization</h5>
              <div className="text-sm text-purple-600">
                Guided customization process with healthcare-specific parameters and compliance checks built into the workflow.
              </div>
            </div>
          </div>
          
          <div className="mt-6 bg-white p-4 rounded border border-purple-200">
            <h5 className="font-semibold text-purple-700 mb-3">Deployment</h5>
            <div className="text-sm text-purple-600">
              One-click deployment across selected channels with automatic configuration of necessary integrations and security settings.
            </div>
          </div>
        </div>
      </div>
    )
  },
  {
    id: 9,
    title: "Advanced AI Models & Multi-Modal Capabilities",
    subtitle: "Complete AI Infrastructure with RAG, Model Selection & Context Management",
    animation: 'slide',
    content: (
      <div className="space-y-8">
        {/* Main Header */}
        <div className="text-center mb-8">
          <h4 className="text-2xl font-bold text-gray-800 mb-4">AI Models, MCP Protocol & Knowledge Base Implementation</h4>
          <div className="text-gray-600">Complete AI Infrastructure with RAG, Model Selection & Context Management</div>
          <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-blue-100 rounded-full border border-blue-200">
            <Database className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-800">Comprehensive AI Infrastructure Implementation</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* MCP Protocol Implementation */}
          <div className="space-y-6">
            <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                  <Link className="w-4 h-4 text-white" />
                </div>
                <h5 className="text-lg font-semibold text-blue-800">MCP Protocol Implementation</h5>
              </div>
              
              <div className="space-y-4">
                <div className="bg-white p-4 rounded border border-blue-200">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-3 h-3 bg-pink-500 rounded-full"></div>
                    <div className="font-medium text-blue-800">Context Sharing</div>
                  </div>
                  <div className="text-sm text-blue-600">Multi-modal communication and state management</div>
                </div>
                
                <div className="bg-white p-4 rounded border border-blue-200">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                    <div className="font-medium text-blue-800">Session Management</div>
                  </div>
                  <div className="text-sm text-blue-600">Persistent context across agent interactions</div>
                </div>
                
                <div className="bg-white p-4 rounded border border-blue-200">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <div className="font-medium text-blue-800">Model Orchestration</div>
                  </div>
                  <div className="text-sm text-blue-600">Intelligent routing between AI models</div>
                </div>
              </div>
            </div>
          </div>

          {/* AI Model Assignment Matrix */}
          <div className="space-y-6">
            <div className="bg-green-50 rounded-lg p-6 border border-green-200">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <h5 className="text-lg font-semibold text-green-800">AI Model Assignment Matrix</h5>
              </div>
              
              <div className="space-y-4">
                <div className="bg-white p-4 rounded border border-green-200">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <div className="font-medium text-green-800">Text Processing</div>
                  </div>
                  <ul className="text-xs text-green-600 space-y-1">
                    <li>• Llama 3.1 8B - Complex reasoning</li>
                    <li>• Phi-3 Mini - Quick responses</li>
                    <li>• Gemma 2B - Classifications</li>
                  </ul>
                </div>
                
                <div className="bg-white p-4 rounded border border-green-200">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <div className="font-medium text-green-800">Vision Tasks</div>
                  </div>
                  <ul className="text-xs text-green-600 space-y-1">
                    <li>• GPT-4V - Document analysis</li>
                    <li>• CLIP - Image understanding</li>
                    <li>• OCR Engine - Text extraction</li>
                  </ul>
                </div>
                
                <div className="bg-white p-4 rounded border border-green-200">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <div className="font-medium text-green-800">Specialized Models</div>
                  </div>
                  <ul className="text-xs text-green-600 space-y-1">
                    <li>• Medical NER - Entity recognition</li>
                    <li>• Sentiment Analysis - Emotional state</li>
                    <li>• Classification - Category assignment</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* RAG Knowledge Base */}
          <div className="space-y-6">
            <div className="bg-purple-50 rounded-lg p-6 border border-purple-200">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center">
                  <Database className="w-4 h-4 text-white" />
                </div>
                <h5 className="text-lg font-semibold text-purple-800">RAG Knowledge Base</h5>
              </div>
              
              <div className="space-y-3">
                <div>
                  <h6 className="font-semibold text-purple-700 mb-2">Knowledge Sources</h6>
                  <ul className="text-sm text-purple-600 space-y-1">
                    <li>• Medical literature & protocols</li>
                    <li>• Treatment guidelines</li>
                    <li>• Institutional procedures</li>
                  </ul>
                </div>
                
                <div>
                  <h6 className="font-semibold text-purple-700 mb-2">Vector Database</h6>
                  <ul className="text-sm text-purple-600 space-y-1">
                    <li>• Embedding semantic search</li>
                    <li>• Real-time updates</li>
                    <li>• Context relevance scoring</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Implementation Stack */}
          <div className="space-y-6">
            <div className="bg-orange-50 rounded-lg p-6 border border-orange-200">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-orange-600 rounded-full flex items-center justify-center">
                  <Settings className="w-4 h-4 text-white" />
                </div>
                <h5 className="text-lg font-semibold text-orange-800">Implementation Stack</h5>
              </div>
              
              <div className="space-y-3">
                <div>
                  <h6 className="font-semibold text-orange-700 mb-2">Architecture</h6>
                  <ul className="text-sm text-orange-600 space-y-1">
                    <li>• Supabase backend integration</li>
                    <li>• Real-time context sharing</li>
                    <li>• Multi-tenant support</li>
                  </ul>
                </div>
                
                <div>
                  <h6 className="font-semibold text-orange-700 mb-2">Components</h6>
                  <ul className="text-sm text-orange-600 space-y-1">
                    <li>• useHealthcareAI hook</li>
                    <li>• MCP SDK integration</li>
                    <li>• Model selection system</li>
                  </ul>
                </div>
                
                <div>
                  <h6 className="font-semibold text-orange-700 mb-2">Features</h6>
                  <ul className="text-sm text-orange-600 space-y-1">
                    <li>• Context-aware retrieval</li>
                    <li>• Multi-modal routing</li>
                    <li>• Performance monitoring</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Performance Results */}
        <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
          <h5 className="text-lg font-semibold text-gray-800 mb-4 text-center">Implementation Results & Performance</h5>
          
          <div className="grid grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600 mb-1">96.8%</div>
              <div className="text-sm text-blue-700">AI Model Accuracy</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600 mb-1">1.2s</div>
              <div className="text-sm text-green-700">Response Time</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600 mb-1">85%</div>
              <div className="text-sm text-purple-700">Context Retention</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600 mb-1">99.9%</div>
              <div className="text-sm text-orange-700">System Uptime</div>
            </div>
          </div>
        </div>
      </div>
    )
  },
  {
    id: 10,
    title: "AI Model Infrastructure & Multi-Modal Processing",
    subtitle: "Large Language Models, Vision Processing, Voice & Audio capabilities with comprehensive implementation",
    animation: 'zoom',
    content: (
      <div className="space-y-8">
        {/* Large Language Models */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <h4 className="text-xl font-semibold text-gray-800">Large Language Models</h4>
            
            <div className="space-y-4">
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <h5 className="font-semibold text-blue-800 mb-3">OpenAI Models</h5>
                <ul className="text-sm text-blue-600 space-y-1">
                  <li>• GPT-4 Turbo: Complex reasoning and analysis</li>
                  <li>• GPT-4V: Vision language understanding</li>
                  <li>• GPT-4 Realtime: Live voice conversations</li>
                  <li>• Whisper: Speech-to-text transcription</li>
                </ul>
              </div>
              
              <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                <h5 className="font-semibold text-purple-800 mb-3">Anthropic Models</h5>
                <ul className="text-sm text-purple-600 space-y-1">
                  <li>• Claude 4 Opus: Most capable model</li>
                  <li>• Claude 4 Sonnet: High performance & efficiency</li>
                  <li>• Claude 3.5 Haiku: Fastest responses</li>
                  <li>• 200K context window support</li>
                </ul>
              </div>
              
              <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                <h5 className="font-semibold text-green-800 mb-3">Hugging Face Models</h5>
                <ul className="text-sm text-green-600 space-y-1">
                  <li>• FLUX 1-schnell: Fast image generation</li>
                  <li>• Llama 3.1 8B: Local text processing</li>
                  <li>• DistilBERT: Text classification</li>
                  <li>• Custom fine-tuned models</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Vision & Image Processing */}
          <div className="space-y-6">
            <h4 className="text-xl font-semibold text-gray-800">Vision & Image Processing</h4>
            
            <div className="space-y-4">
              <div className="bg-teal-50 rounded-lg p-4 border border-teal-200">
                <h5 className="font-semibold text-teal-800 mb-3">Vision Language Models</h5>
                <ul className="text-sm text-teal-600 space-y-1">
                  <li>• GPT-4V: Document analysis & OCR</li>
                  <li>• CLIP: Visual understanding</li>
                  <li>• PaLI: Document processing</li>
                  <li>• Custom OCR pipelines</li>
                </ul>
              </div>
              
              <div className="bg-indigo-50 rounded-lg p-4 border border-indigo-200">
                <h5 className="font-semibold text-indigo-800 mb-3">Image Generation</h5>
                <ul className="text-sm text-indigo-600 space-y-1">
                  <li>• FLUX 1-dev: High-quality images</li>
                  <li>• FLUX 1-schnell: Fast generation</li>
                  <li>• Image editing & merging</li>
                  <li>• 1920x1920 max resolution</li>
                </ul>
              </div>
              
              <div className="bg-pink-50 rounded-lg p-4 border border-pink-200">
                <h5 className="font-semibold text-pink-800 mb-3">Medical Imaging</h5>
                <ul className="text-sm text-pink-600 space-y-1">
                  <li>• X-ray & MRI analysis</li>
                  <li>• DICOM format support</li>
                  <li>• AI-powered diagnostics</li>
                  <li>• Healthcare compliance</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Voice & Audio Processing */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6 border border-blue-200">
          <h4 className="text-xl font-semibold text-purple-800 mb-6 text-center">Voice & Audio Processing</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* ElevenLabs Voice */}
            <div className="bg-white rounded-lg p-4 border border-blue-200">
              <h5 className="font-semibold text-blue-800 mb-3">ElevenLabs Voice</h5>
              <ul className="text-sm text-blue-600 space-y-2">
                <li>• 30+ High-quality voices (Aria, Roger, Sarah)</li>
                <li>• Multilingual v2: 29 languages</li>
                <li>• Turbo v2.5: Low latency, 32 languages</li>
                <li>• Voice cloning & customization</li>
              </ul>
            </div>
            
            {/* Live Voice Agents */}
            <div className="bg-white rounded-lg p-4 border border-green-200">
              <h5 className="font-semibold text-green-800 mb-3">Live Voice Agents</h5>
              <ul className="text-sm text-green-600 space-y-2">
                <li>• OpenAI Realtime API integration</li>
                <li>• WebSocket-based voice conversations</li>
                <li>• Function calling support</li>
                <li>• Voice Activity Detection (VAD)</li>
              </ul>
            </div>
            
            {/* Speech-to-Text */}
            <div className="bg-white rounded-lg p-4 border border-purple-200">
              <h5 className="font-semibold text-purple-800 mb-3">Speech-to-Text</h5>
              <ul className="text-sm text-purple-600 space-y-2">
                <li>• OpenAI Whisper integration</li>
                <li>• Real-time transcription</li>
                <li>• Multi-language support</li>
                <li>• Optimized buffer handling</li>
              </ul>
            </div>
            
            {/* AI Model Processing */}
            <div className="bg-white rounded-lg p-4 border border-orange-200">
              <h5 className="font-semibold text-orange-800 mb-3">AI Model Processing</h5>
              <ul className="text-sm text-orange-600 space-y-2">
                <li>• Unified AI Gateway with multi-provider routing</li>
                <li>• Automatic failover & load balancing</li>
                <li>• Rate limiting & cost optimization</li>
                <li>• Request/response caching</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Implementation Architecture */}
        <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
          <h4 className="text-xl font-semibold text-gray-800 mb-6 text-center">Implementation Architecture</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 rounded-full mx-auto mb-3 flex items-center justify-center">
                <Database className="w-8 h-8 text-white" />
              </div>
              <h5 className="font-semibold text-blue-800 mb-2">Model Management</h5>
              <div className="text-sm text-blue-600">
                Dynamic model selection based on task complexity, response time requirements, and cost optimization
              </div>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-green-600 rounded-full mx-auto mb-3 flex items-center justify-center">
                <Zap className="w-8 h-8 text-white" />
              </div>
              <h5 className="font-semibold text-green-800 mb-2">Real-time Processing</h5>
              <div className="text-sm text-green-600">
                Sub-second response times with intelligent caching and optimized model routing for healthcare workflows
              </div>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-600 rounded-full mx-auto mb-3 flex items-center justify-center">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <h5 className="font-semibold text-purple-800 mb-2">Healthcare Compliance</h5>
              <div className="text-sm text-purple-600">
                HIPAA-compliant processing with encrypted data handling and audit trails for all AI interactions
              </div>
            </div>
          </div>
        </div>

        {/* Technical Implementation */}
        <div className="bg-gradient-to-r from-gray-100 to-gray-50 rounded-lg p-6 border border-gray-300">
          <h4 className="text-xl font-semibold text-gray-800 mb-4 text-center">Technical Implementation Components</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Badge className="mb-2 bg-blue-100 text-blue-800">React Hooks</Badge>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• useConversation</li>
                <li>• useVoiceProcessing</li>
                <li>• useImageGeneration</li>
                <li>• useModelSelection</li>
              </ul>
            </div>
            <div>
              <Badge className="mb-2 bg-green-100 text-green-800">Services</Badge>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• AI Gateway Service</li>
                <li>• Voice Processing API</li>
                <li>• Image Analysis Service</li>
                <li>• Model Router</li>
              </ul>
            </div>
            <div>
              <Badge className="mb-2 bg-purple-100 text-purple-800">Integrations</Badge>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• @11labs/react</li>
                <li>• OpenAI SDK</li>
                <li>• Anthropic SDK</li>
                <li>• Hugging Face API</li>
              </ul>
            </div>
            <div>
              <Badge className="mb-2 bg-orange-100 text-orange-800">Infrastructure</Badge>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Supabase Edge Functions</li>
                <li>• Real-time WebSockets</li>
                <li>• Vector Database</li>
                <li>• CDN Integration</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    )
  },
  {
    id: 11,
    title: "Complete System Overview",
    subtitle: "Template Configuration & AI Automation Implementation - Complete Template System with Actions, Tasks & Intelligent Deployment",
    animation: 'fade',
    content: (
      <div className="space-y-8">
        {/* Main Header */}
        <div className="text-center mb-8">
          <h4 className="text-2xl font-bold text-gray-800 mb-4">Template Configuration & AI Automation Implementation</h4>
          <div className="text-gray-600 mb-4">Complete Template System with Actions, Tasks & Intelligent Deployment</div>
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-100 rounded-full border border-purple-200">
            <Zap className="w-4 h-4 text-purple-600" />
            <span className="text-sm font-medium text-purple-800">Advanced Template & Automation Framework</span>
          </div>
        </div>

        {/* Four Main Sections Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Template Library & Configuration */}
          <div className="space-y-6">
            <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                  <Database className="w-4 h-4 text-white" />
                </div>
                <h5 className="text-lg font-semibold text-blue-800">Template Library & Configuration</h5>
              </div>
              
              <div className="space-y-4">
                <div className="bg-white p-4 rounded border border-blue-200">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <div className="font-medium text-blue-800">Pre-built Templates</div>
                  </div>
                  <ul className="text-sm text-blue-600 space-y-1">
                    <li>• Patient Assessment workflows</li>
                    <li>• Treatment Planning automation</li>
                    <li>• Progress Monitoring systems</li>
                  </ul>
                </div>
                
                <div className="bg-white p-4 rounded border border-blue-200">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                    <div className="font-medium text-blue-800">Configuration Options</div>
                  </div>
                  <ul className="text-sm text-blue-600 space-y-1">
                    <li>• Custom fields & forms</li>
                    <li>• Workflow automation rules</li>
                    <li>• Integration endpoints</li>
                  </ul>
                </div>
                
                <div className="bg-white p-4 rounded border border-blue-200">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <div className="font-medium text-blue-800">Security & Compliance</div>
                  </div>
                  <ul className="text-sm text-blue-600 space-y-1">
                    <li>• HIPAA compliance validation</li>
                    <li>• Access control configuration</li>
                    <li>• Audit trail management</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* AI-Powered Automation */}
          <div className="space-y-6">
            <div className="bg-green-50 rounded-lg p-6 border border-green-200">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <h5 className="text-lg font-semibold text-green-800">AI-Powered Automation</h5>
              </div>
              
              <div className="space-y-4">
                <div className="bg-white p-4 rounded border border-green-200">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                    <div className="font-medium text-green-800">Smart Actions</div>
                  </div>
                  <ul className="text-sm text-green-600 space-y-1">
                    <li>• Auto-routing to case assignment</li>
                    <li>• Intelligent decision making</li>
                    <li>• Automated form completion</li>
                  </ul>
                </div>
                
                <div className="bg-white p-4 rounded border border-green-200">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <div className="font-medium text-green-800">Intelligent Tasks</div>
                  </div>
                  <ul className="text-sm text-green-600 space-y-1">
                    <li>• Appointment optimization</li>
                    <li>• Automated reporting & insights</li>
                    <li>• Proactive follow-up outreach</li>
                  </ul>
                </div>
                
                <div className="bg-white p-4 rounded border border-green-200">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <div className="font-medium text-green-800">AI Autosuggest</div>
                  </div>
                  <ul className="text-sm text-green-600 space-y-1">
                    <li>• Context-aware template selection</li>
                    <li>• Personalized interventions</li>
                    <li>• Predictive outcome analytics</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Multi-Platform Deployment */}
          <div className="space-y-6">
            <div className="bg-purple-50 rounded-lg p-6 border border-purple-200">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center">
                  <Monitor className="w-4 h-4 text-white" />
                </div>
                <h5 className="text-lg font-semibold text-purple-800">Multi-Platform Deployment</h5>
              </div>
              
              <div className="space-y-4">
                <div className="bg-white p-4 rounded border border-purple-200">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <div className="font-medium text-purple-800">Web Platform</div>
                  </div>
                  <ul className="text-sm text-purple-600 space-y-1">
                    <li>• Rich interactive interfaces</li>
                    <li>• Advanced data visualization</li>
                    <li>• Multi-tab workflows</li>
                  </ul>
                </div>
                
                <div className="bg-white p-4 rounded border border-purple-200">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                    <div className="font-medium text-purple-800">Mobile Apps</div>
                  </div>
                  <ul className="text-sm text-purple-600 space-y-1">
                    <li>• Native mobile interfaces</li>
                    <li>• Offline capabilities</li>
                    <li>• Push notification integration</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Template Synchronization */}
          <div className="space-y-6">
            <div className="bg-orange-50 rounded-lg p-6 border border-orange-200">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-orange-600 rounded-full flex items-center justify-center">
                  <Settings className="w-4 h-4 text-white" />
                </div>
                <h5 className="text-lg font-semibold text-orange-800">Template Synchronization</h5>
              </div>
              
              <div className="space-y-4">
                <div className="bg-white p-4 rounded border border-orange-200">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                    <div className="font-medium text-orange-800">Real-time Sync</div>
                  </div>
                  <ul className="text-sm text-orange-600 space-y-1">
                    <li>• Cross-channel synchronization</li>
                    <li>• Data model updates</li>
                    <li>• Version control & rollback</li>
                    <li>• A/B testing capabilities</li>
                  </ul>
                </div>
                
                <div className="bg-white p-4 rounded border border-orange-200">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <div className="font-medium text-orange-800">Performance Monitoring</div>
                  </div>
                  <ul className="text-sm text-orange-600 space-y-1">
                    <li>• Real-time usage analytics</li>
                    <li>• User interaction tracking</li>
                    <li>• Comprehensive reporting</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Template & Automation Results */}
        <div className="bg-gradient-to-r from-gray-100 to-gray-50 rounded-lg p-6 border border-gray-300">
          <div className="flex items-center gap-3 mb-6 justify-center">
            <BarChart3 className="w-6 h-6 text-gray-600" />
            <h5 className="text-lg font-semibold text-gray-800">Template & Automation Results</h5>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">90%</div>
              <div className="text-sm text-blue-700">Form Completion Rate</div>
              <div className="text-xs text-gray-500 mt-1">Automated workflow efficiency</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">75%</div>
              <div className="text-sm text-green-700">Admin Task Reduction</div>
              <div className="text-xs text-gray-500 mt-1">Time saved on manual processes</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600 mb-2">15min</div>
              <div className="text-sm text-purple-700">Average Setup Time</div>
              <div className="text-xs text-gray-500 mt-1">Template deployment speed</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-600 mb-2">85%</div>
              <div className="text-sm text-orange-700">User Satisfaction</div>
              <div className="text-xs text-gray-500 mt-1">System adoption rate</div>
            </div>
          </div>
        </div>

        {/* Key Implementation Benefits */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6 border border-blue-200">
          <h5 className="text-lg font-semibold text-purple-800 mb-6 text-center">Key Implementation Benefits</h5>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 rounded-full mx-auto mb-3 flex items-center justify-center">
                <Rocket className="w-8 h-8 text-white" />
              </div>
              <h6 className="font-semibold text-blue-800 mb-2">Rapid Deployment</h6>
              <div className="text-sm text-blue-600">
                Pre-configured templates enable 15-minute deployment with intelligent automation setup
              </div>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-green-600 rounded-full mx-auto mb-3 flex items-center justify-center">
                <Workflow className="w-8 h-8 text-white" />
              </div>
              <h6 className="font-semibold text-green-800 mb-2">Workflow Optimization</h6>
              <div className="text-sm text-green-600">
                AI-powered automation reduces administrative tasks by 75% with intelligent decision making
              </div>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-600 rounded-full mx-auto mb-3 flex items-center justify-center">
                <BarChart3 className="w-8 h-8 text-white" />
              </div>
              <h6 className="font-semibold text-purple-800 mb-2">Performance Analytics</h6>
              <div className="text-sm text-purple-600">
                Real-time monitoring and comprehensive reporting with 90% form completion rates
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  },
  {
    id: 12,
    title: "Strategic Planning for AI Implementation",
    subtitle: "Current Implementation & Enterprise Features - Complete System Overview with Advanced Agent Management & Multi-Channel Deployment",
    animation: 'slide',
    content: (
      <div className="space-y-8">
        {/* Main Header */}
        <div className="text-center mb-8">
          <h4 className="text-2xl font-bold text-gray-800 mb-4">Current Implementation & Enterprise Features</h4>
          <div className="text-gray-600">Complete System Overview with Advanced Agent Management & Multi-Channel Deployment</div>
        </div>

        {/* Current Implementation Status */}
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg p-6 border border-gray-200">
          <h5 className="text-lg font-semibold text-gray-800 mb-6 text-center">Current Implementation Status</h5>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Completed Features */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <h6 className="font-semibold text-green-800">Completed Features</h6>
              </div>
              <div className="space-y-3">
                <div className="bg-white p-3 rounded border border-green-200">
                  <div className="text-sm font-medium text-green-800">Complete agent lifecycle management</div>
                </div>
                <div className="bg-white p-3 rounded border border-green-200">
                  <div className="text-sm font-medium text-green-800">Multi-channel deployment system</div>
                </div>
                <div className="bg-white p-3 rounded border border-green-200">
                  <div className="text-sm font-medium text-green-800">Real-time testing & validation</div>
                </div>
                <div className="bg-white p-3 rounded border border-green-200">
                  <div className="text-sm font-medium text-green-800">Advanced AI model integration</div>
                </div>
                <div className="bg-white p-3 rounded border border-green-200">
                  <div className="text-sm font-medium text-green-800">Voice & TTS capabilities</div>
                </div>
              </div>
            </div>

            {/* Advanced Features */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <Zap className="w-5 h-5 text-blue-600" />
                <h6 className="font-semibold text-blue-800">Advanced Features</h6>
              </div>
              <div className="space-y-3">
                <div className="bg-white p-3 rounded border border-blue-200">
                  <div className="text-sm font-medium text-blue-800">Duplicate prevention system</div>
                </div>
                <div className="bg-white p-3 rounded border border-blue-200">
                  <div className="text-sm font-medium text-blue-800">Automated draft cleanup</div>
                </div>
                <div className="bg-white p-3 rounded border border-blue-200">
                  <div className="text-sm font-medium text-blue-800">Real-time status synchronization</div>
                </div>
                <div className="bg-white p-3 rounded border border-blue-200">
                  <div className="text-sm font-medium text-blue-800">Health monitoring & metrics</div>
                </div>
                <div className="bg-white p-3 rounded border border-blue-200">
                  <div className="text-sm font-medium text-blue-800">Database automation triggers</div>
                </div>
              </div>
            </div>

            {/* Integrations */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <Link className="w-5 h-5 text-purple-600" />
                <h6 className="font-semibold text-purple-800">Integrations</h6>
              </div>
              <div className="space-y-3">
                <div className="bg-white p-3 rounded border border-purple-200">
                  <div className="text-sm font-medium text-purple-800">OpenAI & Anthropic models</div>
                </div>
                <div className="bg-white p-3 rounded border border-purple-200">
                  <div className="text-sm font-medium text-purple-800">ElevenLabs voice synthesis</div>
                </div>
                <div className="bg-white p-3 rounded border border-purple-200">
                  <div className="text-sm font-medium text-purple-800">Hugging Face model hub</div>
                </div>
                <div className="bg-white p-3 rounded border border-purple-200">
                  <div className="text-sm font-medium text-purple-800">Supabase real-time backend</div>
                </div>
                <div className="bg-white p-3 rounded border border-purple-200">
                  <div className="text-sm font-medium text-purple-800">Multi-provider voice systems</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Technical Architecture & Scalability */}
        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg p-6 border border-yellow-200">
          <div className="flex items-center gap-3 mb-6 justify-center">
            <Settings className="w-6 h-6 text-orange-600" />
            <h5 className="text-lg font-semibold text-orange-800">Technical Architecture & Scalability</h5>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Database & Backend */}
            <div className="space-y-4">
              <h6 className="font-semibold text-orange-700">Database & Backend</h6>
              <div className="space-y-3">
                <div className="bg-blue-100 p-4 rounded border border-blue-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Database className="w-4 h-4 text-blue-600" />
                    <div className="font-medium text-blue-800">Supabase PostgreSQL</div>
                  </div>
                  <div className="text-sm text-blue-600">Complete schema with RLS policies & triggers</div>
                </div>
                
                <div className="bg-green-100 p-4 rounded border border-green-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Zap className="w-4 h-4 text-green-600" />
                    <div className="font-medium text-green-800">Edge Functions</div>
                  </div>
                  <div className="text-sm text-green-600">AI processing, voice services, real-time APIs</div>
                </div>
                
                <div className="bg-purple-100 p-4 rounded border border-purple-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Monitor className="w-4 h-4 text-purple-600" />
                    <div className="font-medium text-purple-800">Real-time Subscriptions</div>
                  </div>
                  <div className="text-sm text-purple-600">Live updates, deployment status, health monitoring</div>
                </div>
              </div>
            </div>

            {/* Frontend & UI */}
            <div className="space-y-4">
              <h6 className="font-semibold text-orange-700">Frontend & UI</h6>
              <div className="space-y-3">
                <div className="bg-purple-100 p-4 rounded border border-purple-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Bot className="w-4 h-4 text-purple-600" />
                    <div className="font-medium text-purple-800">React + TypeScript</div>
                  </div>
                  <div className="text-sm text-purple-600">Modern component architecture with full type safety</div>
                </div>
                
                <div className="bg-pink-100 p-4 rounded border border-pink-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Palette className="w-4 h-4 text-pink-600" />
                    <div className="font-medium text-pink-800">Design System</div>
                  </div>
                  <div className="text-sm text-pink-600">Tailwind CSS + shadcn/ui components</div>
                </div>
                
                <div className="bg-teal-100 p-4 rounded border border-teal-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Workflow className="w-4 h-4 text-teal-600" />
                    <div className="font-medium text-teal-800">Drag & Drop</div>
                  </div>
                  <div className="text-sm text-teal-600">@dnd-kit integration for intuitive development</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* System Performance & Achievements */}
        <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-6 border border-green-200">
          <div className="flex items-center gap-3 mb-6 justify-center">
            <BarChart3 className="w-6 h-6 text-blue-600" />
            <h5 className="text-lg font-semibold text-blue-800">System Performance & Achievements</h5>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">100%</div>
              <div className="text-sm text-green-700 font-medium">Feature Completion</div>
              <div className="text-xs text-gray-500 mt-1">All planned features implemented</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">8+</div>
              <div className="text-sm text-blue-700 font-medium">Deployment Channels</div>
              <div className="text-xs text-gray-500 mt-1">Multi-platform support</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600 mb-2">50+</div>
              <div className="text-sm text-purple-700 font-medium">AI Models Supported</div>
              <div className="text-xs text-gray-500 mt-1">Comprehensive model integration</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-600 mb-2">99.9%</div>
              <div className="text-sm text-orange-700 font-medium">System Uptime</div>
              <div className="text-xs text-gray-500 mt-1">Enterprise-grade reliability</div>
            </div>
          </div>
        </div>

        {/* Implementation Approach & Change Management */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Implementation Approach */}
          <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
            <h5 className="text-lg font-semibold text-gray-800 mb-6">Implementation Approach</h5>
            <div className="text-sm text-gray-600 mb-4">Our recommended strategy for healthcare organizations:</div>
            
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-bold">1</div>
                <div className="text-sm">
                  <div className="font-medium text-gray-800">Start with non-clinical use cases to build confidence and demonstrate value</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-green-600 rounded-full flex items-center justify-center text-white text-sm font-bold">2</div>
                <div className="text-sm">
                  <div className="font-medium text-gray-800">Gradually introduce clinical support functions with appropriate oversight</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center text-white text-sm font-bold">3</div>
                <div className="text-sm">
                  <div className="font-medium text-gray-800">Expand to patient-facing applications with rigorous validation</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-orange-600 rounded-full flex items-center justify-center text-white text-sm font-bold">4</div>
                <div className="text-sm">
                  <div className="font-medium text-gray-800">Continuously measure outcomes and adjust implementation</div>
                </div>
              </div>
            </div>
            
            <div className="mt-6 p-4 bg-blue-50 rounded border border-blue-200">
              <div className="text-sm text-blue-800">
                This phased approach minimizes risk while allowing organizations to realize benefits quickly and build internal expertise progressively.
              </div>
            </div>
          </div>

          {/* Change Management */}
          <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
            <h5 className="text-lg font-semibold text-gray-800 mb-6">Change Management</h5>
            <div className="text-sm text-gray-600 mb-4">Successful implementation requires thoughtful change management:</div>
            
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-4 h-4 text-green-600 mt-1 flex-shrink-0" />
                <div className="text-sm text-gray-800">Stakeholder engagement at all levels</div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="w-4 h-4 text-green-600 mt-1 flex-shrink-0" />
                <div className="text-sm text-gray-800">Clear communication about AI capabilities and limitations</div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="w-4 h-4 text-green-600 mt-1 flex-shrink-0" />
                <div className="text-sm text-gray-800">Comprehensive training for staff interacting with the system</div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="w-4 h-4 text-green-600 mt-1 flex-shrink-0" />
                <div className="text-sm text-gray-800">Feedback mechanisms to capture and address concerns</div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="w-4 h-4 text-green-600 mt-1 flex-shrink-0" />
                <div className="text-sm text-gray-800">Celebration of early wins to build momentum</div>
              </div>
            </div>
            
            <div className="mt-6 p-4 bg-green-50 rounded border border-green-200">
              <div className="text-sm text-green-800">
                We provide change management resources and guidance as part of our implementation package.
              </div>
            </div>
          </div>
        </div>

        {/* ROI Considerations */}
        <div className="bg-gradient-to-r from-green-100 to-blue-100 rounded-lg p-6 border border-green-300">
          <h5 className="text-lg font-semibold text-gray-800 mb-6 text-center">ROI Considerations</h5>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-4xl font-bold text-green-600 mb-3">30%</div>
              <div className="text-sm font-semibold text-green-800 mb-2">Staff Time Savings</div>
              <div className="text-xs text-green-600">
                Reduction in administrative tasks for clinical staff, allowing more time for direct patient care
              </div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600 mb-3">25%</div>
              <div className="text-sm font-semibold text-blue-800 mb-2">Call Volume Reduction</div>
              <div className="text-xs text-blue-600">
                Decrease in routine phone calls handled by staff through automation of common inquiries
              </div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-purple-600 mb-3">15%</div>
              <div className="text-sm font-semibold text-purple-800 mb-2">No-Show Reduction</div>
              <div className="text-xs text-purple-600">
                Decrease in missed appointments through improved reminder systems and engagement
              </div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-orange-600 mb-3">$120K</div>
              <div className="text-sm font-semibold text-orange-800 mb-2">Annual Savings</div>
              <div className="text-xs text-orange-600">
                Typical first-year cost savings for a mid-sized healthcare practice
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }
];

export const getSlideById = (id: number): Slide | undefined => {
  return presentationSlides.find(slide => slide.id === id);
};

export const getTotalSlides = (): number => {
  return presentationSlides.length;
};