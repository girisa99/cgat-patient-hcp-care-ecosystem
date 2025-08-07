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
  }
];

export const getSlideById = (id: number): Slide | undefined => {
  return presentationSlides.find(slide => slide.id === id);
};

export const getTotalSlides = (): number => {
  return presentationSlides.length;
};