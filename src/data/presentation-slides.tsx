/**
 * PRESENTATION SLIDE DATA
 * Extracted from AgenticAIPresentation to improve maintainability
 * This file contains all slide content without affecting the main component
 */

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Database, MessageSquare, Zap, Cloud, Globe, FileText } from 'lucide-react';

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
    content: (
      <div className="h-full overflow-y-auto space-y-6 animate-fade-in">
        {/* Hero Section */}
        <div className="text-center space-y-4 mb-8">
          <div className="flex items-center justify-center gap-6 mb-6">
            <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center">
              <Database className="w-8 h-8 text-primary" />
            </div>
            <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center">
              <MessageSquare className="w-8 h-8 text-primary" />
            </div>
            <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center">
              <Zap className="w-8 h-8 text-primary" />
            </div>
          </div>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Transform your treatment center operations with comprehensive AI automation. 
            From patient intake to care coordination, our platform delivers measurable results.
          </p>
        </div>

        {/* Key Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-6 text-center">
            <CardContent className="space-y-4">
              <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mx-auto">
                <Database className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">Data Integration</h3>
              <p className="text-muted-foreground">
                Seamless integration with existing EHR systems and databases
              </p>
            </CardContent>
          </Card>

          <Card className="p-6 text-center">
            <CardContent className="space-y-4">
              <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mx-auto">
                <MessageSquare className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">AI Conversations</h3>
              <p className="text-muted-foreground">
                Natural language processing for patient interactions
              </p>
            </CardContent>
          </Card>

          <Card className="p-6 text-center">
            <CardContent className="space-y-4">
              <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mx-auto">
                <Zap className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">Automation</h3>
              <p className="text-muted-foreground">
                Streamlined workflows and automated processes
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Implementation Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
          <div className="text-center p-4 bg-card rounded-lg">
            <div className="text-2xl font-bold text-primary">95%</div>
            <div className="text-sm text-muted-foreground">Efficiency Gain</div>
          </div>
          <div className="text-center p-4 bg-card rounded-lg">
            <div className="text-2xl font-bold text-primary">60%</div>
            <div className="text-sm text-muted-foreground">Cost Reduction</div>
          </div>
          <div className="text-center p-4 bg-card rounded-lg">
            <div className="text-2xl font-bold text-primary">24/7</div>
            <div className="text-sm text-muted-foreground">AI Availability</div>
          </div>
          <div className="text-center p-4 bg-card rounded-lg">
            <div className="text-2xl font-bold text-primary">30+</div>
            <div className="text-sm text-muted-foreground">Integrations</div>
          </div>
        </div>
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
        {/* Architecture Overview */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="w-14 h-14 bg-primary/20 rounded-full flex items-center justify-center">
              <Cloud className="w-7 h-7 text-primary" />
            </div>
            <div className="w-14 h-14 bg-primary/20 rounded-full flex items-center justify-center">
              <Globe className="w-7 h-7 text-primary" />
            </div>
            <div className="w-14 h-14 bg-primary/20 rounded-full flex items-center justify-center">
              <FileText className="w-7 h-7 text-primary" />
            </div>
          </div>
          <p className="text-lg text-muted-foreground max-w-4xl mx-auto">
            Comprehensive AI agent infrastructure supporting multiple deployment channels, 
            real-time monitoring, and enterprise-grade security features.
          </p>
        </div>

        {/* Core Components */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="p-6">
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center">
                  <Database className="w-5 h-5 text-primary" />
                </div>
                <h3 className="text-lg font-semibold">Agent Registry</h3>
              </div>
              <p className="text-muted-foreground text-sm">
                Centralized management for all AI agents with version control and deployment tracking
              </p>
            </CardContent>
          </Card>

          <Card className="p-6">
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center">
                  <MessageSquare className="w-5 h-5 text-primary" />
                </div>
                <h3 className="text-lg font-semibold">Multi-Channel</h3>
              </div>
              <p className="text-muted-foreground text-sm">
                Deploy across web, mobile, SMS, voice, and social media platforms
              </p>
            </CardContent>
          </Card>

          <Card className="p-6">
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center">
                  <Zap className="w-5 h-5 text-primary" />
                </div>
                <h3 className="text-lg font-semibold">Real-time Monitoring</h3>
              </div>
              <p className="text-muted-foreground text-sm">
                Live performance metrics, conversation analytics, and system health monitoring
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Deployment Channels */}
        <div className="bg-card p-6 rounded-lg">
          <h3 className="text-xl font-semibold mb-4 text-center">Deployment Channels</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Badge variant="secondary" className="p-3 text-center justify-center">Web Chat</Badge>
            <Badge variant="secondary" className="p-3 text-center justify-center">Mobile App</Badge>
            <Badge variant="secondary" className="p-3 text-center justify-center">SMS/WhatsApp</Badge>
            <Badge variant="secondary" className="p-3 text-center justify-center">Voice Calls</Badge>
            <Badge variant="secondary" className="p-3 text-center justify-center">Email</Badge>
            <Badge variant="secondary" className="p-3 text-center justify-center">Social Media</Badge>
            <Badge variant="secondary" className="p-3 text-center justify-center">API Integration</Badge>
            <Badge variant="secondary" className="p-3 text-center justify-center">Webhook</Badge>
          </div>
        </div>
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
        {/* Process Flow */}
        <div className="text-center mb-8">
          <h3 className="text-2xl font-bold mb-4">4-Step Agent Creation Process</h3>
          <div className="flex items-center justify-center gap-8 mb-6">
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mb-2">
                <span className="text-2xl font-bold text-primary">1</span>
              </div>
              <span className="text-sm font-medium">Setup</span>
            </div>
            <div className="w-12 h-0.5 bg-primary/30"></div>
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mb-2">
                <span className="text-2xl font-bold text-primary">2</span>
              </div>
              <span className="text-sm font-medium">Design</span>
            </div>
            <div className="w-12 h-0.5 bg-primary/30"></div>
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mb-2">
                <span className="text-2xl font-bold text-primary">3</span>
              </div>
              <span className="text-sm font-medium">Configure</span>
            </div>
            <div className="w-12 h-0.5 bg-primary/30"></div>
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mb-2">
                <span className="text-2xl font-bold text-primary">4</span>
              </div>
              <span className="text-sm font-medium">Deploy</span>
            </div>
          </div>
        </div>

        {/* Step Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="p-6">
            <CardContent className="space-y-4">
              <h4 className="text-lg font-semibold text-primary">Step 1: Wizard Setup</h4>
              <ul className="text-sm text-muted-foreground space-y-2">
                <li>• Session management & authentication</li>
                <li>• Multi-step configuration wizard</li>
                <li>• User role assignment</li>
                <li>• Initial preferences setup</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="p-6">
            <CardContent className="space-y-4">
              <h4 className="text-lg font-semibold text-primary">Step 2: Canvas Design</h4>
              <ul className="text-sm text-muted-foreground space-y-2">
                <li>• Visual agent creation interface</li>
                <li>• Template system integration</li>
                <li>• Complete branding implementation</li>
                <li>• Use case definition</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="p-6">
            <CardContent className="space-y-4">
              <h4 className="text-lg font-semibold text-primary">Step 3: Actions & Connectors</h4>
              <ul className="text-sm text-muted-foreground space-y-2">
                <li>• Auto-assign templates</li>
                <li>• External system integration</li>
                <li>• Workflow configuration</li>
                <li>• API endpoint setup</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="p-6">
            <CardContent className="space-y-4">
              <h4 className="text-lg font-semibold text-primary">Step 4: Knowledge & Deploy</h4>
              <ul className="text-sm text-muted-foreground space-y-2">
                <li>• Knowledge base integration</li>
                <li>• Multi-channel deployment</li>
                <li>• Testing & validation</li>
                <li>• Performance monitoring</li>
              </ul>
            </CardContent>
          </Card>
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
        {/* Setup Overview */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl font-bold text-primary">1</span>
          </div>
          <h3 className="text-xl font-semibold mb-2">Initial Setup & Configuration</h3>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Streamlined onboarding process with intelligent defaults and guided configuration
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="p-6 text-center">
            <CardContent className="space-y-4">
              <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mx-auto">
                <Database className="w-6 h-6 text-primary" />
              </div>
              <h4 className="font-semibold">Session Management</h4>
              <p className="text-sm text-muted-foreground">
                Secure session handling with auto-save and recovery features
              </p>
            </CardContent>
          </Card>

          <Card className="p-6 text-center">
            <CardContent className="space-y-4">
              <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mx-auto">
                <MessageSquare className="w-6 h-6 text-primary" />
              </div>
              <h4 className="font-semibold">User Authentication</h4>
              <p className="text-sm text-muted-foreground">
                Multi-factor authentication with role-based access control
              </p>
            </CardContent>
          </Card>

          <Card className="p-6 text-center">
            <CardContent className="space-y-4">
              <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mx-auto">
                <Zap className="w-6 h-6 text-primary" />
              </div>
              <h4 className="font-semibold">Smart Defaults</h4>
              <p className="text-sm text-muted-foreground">
                Industry-specific templates and intelligent configuration suggestions
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Setup Steps */}
        <div className="bg-card p-6 rounded-lg">
          <h4 className="text-lg font-semibold mb-4">Setup Process Flow</h4>
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-3 bg-background rounded-lg">
              <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
                <span className="text-sm font-bold text-primary">1</span>
              </div>
              <div>
                <div className="font-medium">Account Creation & Verification</div>
                <div className="text-sm text-muted-foreground">Email verification, security setup, profile creation</div>
              </div>
            </div>
            <div className="flex items-center gap-4 p-3 bg-background rounded-lg">
              <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
                <span className="text-sm font-bold text-primary">2</span>
              </div>
              <div>
                <div className="font-medium">Organization Setup</div>
                <div className="text-sm text-muted-foreground">Company details, team structure, compliance requirements</div>
              </div>
            </div>
            <div className="flex items-center gap-4 p-3 bg-background rounded-lg">
              <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
                <span className="text-sm font-bold text-primary">3</span>
              </div>
              <div>
                <div className="font-medium">Integration Preferences</div>
                <div className="text-sm text-muted-foreground">EHR connections, API configurations, data sources</div>
              </div>
            </div>
          </div>
        </div>
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
        {/* Design Overview */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl font-bold text-primary">2</span>
          </div>
          <h3 className="text-xl font-semibold mb-2">Visual Design & Branding</h3>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Intuitive drag-and-drop interface for creating branded AI agents with professional templates
          </p>
        </div>

        {/* Key Features */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="p-6">
            <CardContent className="space-y-4">
              <h4 className="text-lg font-semibold text-primary">Visual Canvas Editor</h4>
              <ul className="text-sm text-muted-foreground space-y-2">
                <li>• Drag-and-drop interface builder</li>
                <li>• Real-time preview and testing</li>
                <li>• Responsive design templates</li>
                <li>• Custom component library</li>
                <li>• Advanced layout options</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="p-6">
            <CardContent className="space-y-4">
              <h4 className="text-lg font-semibold text-primary">Branding System</h4>
              <ul className="text-sm text-muted-foreground space-y-2">
                <li>• Logo and color customization</li>
                <li>• Typography and font selection</li>
                <li>• Brand voice and tone settings</li>
                <li>• Custom messaging templates</li>
                <li>• Multi-brand support</li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Template Categories */}
        <div className="bg-card p-6 rounded-lg">
          <h4 className="text-lg font-semibold mb-4">Pre-built Templates by Use Case</h4>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            <div className="p-4 bg-background rounded-lg text-center">
              <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center mx-auto mb-2">
                <MessageSquare className="w-5 h-5 text-primary" />
              </div>
              <div className="text-sm font-medium">Patient Intake</div>
            </div>
            <div className="p-4 bg-background rounded-lg text-center">
              <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center mx-auto mb-2">
                <Database className="w-5 h-5 text-primary" />
              </div>
              <div className="text-sm font-medium">Appointment Booking</div>
            </div>
            <div className="p-4 bg-background rounded-lg text-center">
              <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center mx-auto mb-2">
                <FileText className="w-5 h-5 text-primary" />
              </div>
              <div className="text-sm font-medium">Insurance Verification</div>
            </div>
            <div className="p-4 bg-background rounded-lg text-center">
              <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center mx-auto mb-2">
                <Zap className="w-5 h-5 text-primary" />
              </div>
              <div className="text-sm font-medium">Follow-up Care</div>
            </div>
          </div>
        </div>

        {/* Customization Options */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-card rounded-lg">
            <div className="text-xl font-bold text-primary">50+</div>
            <div className="text-sm text-muted-foreground">Design Templates</div>
          </div>
          <div className="text-center p-4 bg-card rounded-lg">
            <div className="text-xl font-bold text-primary">100+</div>
            <div className="text-sm text-muted-foreground">UI Components</div>
          </div>
          <div className="text-center p-4 bg-card rounded-lg">
            <div className="text-xl font-bold text-primary">∞</div>
            <div className="text-sm text-muted-foreground">Customization Options</div>
          </div>
        </div>
      </div>
    ),
    animation: 'slide'
  },
  {
    id: 6,
    title: "Step 3: Actions Configuration & System Connectors",
    subtitle: "Auto-Assign Templates & External System Integration",
    content: (
      <div className="h-full overflow-y-auto space-y-6 animate-fade-in">
        {/* Actions Overview */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl font-bold text-primary">3</span>
          </div>
          <h3 className="text-xl font-semibold mb-2">Actions & System Integration</h3>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Connect your AI agents to external systems with pre-built connectors and custom actions
          </p>
        </div>

        {/* Integration Categories */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="p-6">
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center">
                  <Database className="w-5 h-5 text-primary" />
                </div>
                <h4 className="font-semibold">EHR Systems</h4>
              </div>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Epic Integration</li>
                <li>• Cerner PowerChart</li>
                <li>• Allscripts</li>
                <li>• Custom FHIR APIs</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="p-6">
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center">
                  <MessageSquare className="w-5 h-5 text-primary" />
                </div>
                <h4 className="font-semibold">Communication</h4>
              </div>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• SMS/Text Messaging</li>
                <li>• Email Automation</li>
                <li>• Voice Calls</li>
                <li>• Video Conferencing</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="p-6">
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center">
                  <FileText className="w-5 h-5 text-primary" />
                </div>
                <h4 className="font-semibold">Document Systems</h4>
              </div>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Document Management</li>
                <li>• E-signature Integration</li>
                <li>• Form Generation</li>
                <li>• Report Creation</li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Action Templates */}
        <div className="bg-card p-6 rounded-lg">
          <h4 className="text-lg font-semibold mb-4">Pre-configured Action Templates</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-background rounded-lg">
                <div className="w-6 h-6 bg-primary/20 rounded flex items-center justify-center">
                  <Zap className="w-3 h-3 text-primary" />
                </div>
                <span className="text-sm font-medium">Schedule Appointment</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-background rounded-lg">
                <div className="w-6 h-6 bg-primary/20 rounded flex items-center justify-center">
                  <Zap className="w-3 h-3 text-primary" />
                </div>
                <span className="text-sm font-medium">Send Prescription</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-background rounded-lg">
                <div className="w-6 h-6 bg-primary/20 rounded flex items-center justify-center">
                  <Zap className="w-3 h-3 text-primary" />
                </div>
                <span className="text-sm font-medium">Update Patient Record</span>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-background rounded-lg">
                <div className="w-6 h-6 bg-primary/20 rounded flex items-center justify-center">
                  <Zap className="w-3 h-3 text-primary" />
                </div>
                <span className="text-sm font-medium">Insurance Verification</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-background rounded-lg">
                <div className="w-6 h-6 bg-primary/20 rounded flex items-center justify-center">
                  <Zap className="w-3 h-3 text-primary" />
                </div>
                <span className="text-sm font-medium">Lab Results Notification</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-background rounded-lg">
                <div className="w-6 h-6 bg-primary/20 rounded flex items-center justify-center">
                  <Zap className="w-3 h-3 text-primary" />
                </div>
                <span className="text-sm font-medium">Care Plan Updates</span>
              </div>
            </div>
          </div>
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
        {/* RAG Overview */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center">
              <FileText className="w-8 h-8 text-primary" />
            </div>
            <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center">
              <Database className="w-8 h-8 text-primary" />
            </div>
            <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center">
              <Zap className="w-8 h-8 text-primary" />
            </div>
          </div>
          <h3 className="text-xl font-semibold mb-2">Intelligent Knowledge Management</h3>
          <p className="text-muted-foreground max-w-3xl mx-auto">
            Advanced RAG (Retrieval-Augmented Generation) system with automated content processing, 
            intelligent indexing, and real-time knowledge updates for accurate AI responses.
          </p>
        </div>

        {/* Core Features */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="p-6">
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center">
                  <FileText className="w-5 h-5 text-primary" />
                </div>
                <h4 className="font-semibold">Document Processing</h4>
              </div>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Multi-format support (PDF, DOC, TXT)</li>
                <li>• OCR for scanned documents</li>
                <li>• Automatic text extraction</li>
                <li>• Content validation & approval</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="p-6">
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center">
                  <Globe className="w-5 h-5 text-primary" />
                </div>
                <h4 className="font-semibold">Web Crawling</h4>
              </div>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Automated website crawling</li>
                <li>• Content freshness monitoring</li>
                <li>• Scheduled updates</li>
                <li>• Custom crawling rules</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="p-6">
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center">
                  <Database className="w-5 h-5 text-primary" />
                </div>
                <h4 className="font-semibold">Vector Database</h4>
              </div>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Semantic search capabilities</li>
                <li>• Context-aware retrieval</li>
                <li>• Similarity matching</li>
                <li>• Fast query performance</li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* RAG Process Flow */}
        <div className="bg-card p-6 rounded-lg">
          <h4 className="text-lg font-semibold mb-4">RAG Process Flow</h4>
          <div className="flex items-center justify-between gap-4 overflow-x-auto">
            <div className="flex flex-col items-center min-w-0 flex-1">
              <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mb-2">
                <span className="text-sm font-bold text-primary">1</span>
              </div>
              <div className="text-center">
                <div className="font-medium text-sm">Ingest</div>
                <div className="text-xs text-muted-foreground">Documents & Data</div>
              </div>
            </div>
            <div className="w-8 h-0.5 bg-primary/30"></div>
            <div className="flex flex-col items-center min-w-0 flex-1">
              <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mb-2">
                <span className="text-sm font-bold text-primary">2</span>
              </div>
              <div className="text-center">
                <div className="font-medium text-sm">Process</div>
                <div className="text-xs text-muted-foreground">Chunk & Embed</div>
              </div>
            </div>
            <div className="w-8 h-0.5 bg-primary/30"></div>
            <div className="flex flex-col items-center min-w-0 flex-1">
              <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mb-2">
                <span className="text-sm font-bold text-primary">3</span>
              </div>
              <div className="text-center">
                <div className="font-medium text-sm">Index</div>
                <div className="text-xs text-muted-foreground">Vector Storage</div>
              </div>
            </div>
            <div className="w-8 h-0.5 bg-primary/30"></div>
            <div className="flex flex-col items-center min-w-0 flex-1">
              <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mb-2">
                <span className="text-sm font-bold text-primary">4</span>
              </div>
              <div className="text-center">
                <div className="font-medium text-sm">Retrieve</div>
                <div className="text-xs text-muted-foreground">Relevant Context</div>
              </div>
            </div>
            <div className="w-8 h-0.5 bg-primary/30"></div>
            <div className="flex flex-col items-center min-w-0 flex-1">
              <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mb-2">
                <span className="text-sm font-bold text-primary">5</span>
              </div>
              <div className="text-center">
                <div className="font-medium text-sm">Generate</div>
                <div className="text-xs text-muted-foreground">AI Response</div>
              </div>
            </div>
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-card rounded-lg">
            <div className="text-2xl font-bold text-primary">99.9%</div>
            <div className="text-sm text-muted-foreground">Accuracy Rate</div>
          </div>
          <div className="text-center p-4 bg-card rounded-lg">
            <div className="text-2xl font-bold text-primary">&lt;200ms</div>
            <div className="text-sm text-muted-foreground">Response Time</div>
          </div>
          <div className="text-center p-4 bg-card rounded-lg">
            <div className="text-2xl font-bold text-primary">1M+</div>
            <div className="text-sm text-muted-foreground">Documents Indexed</div>
          </div>
          <div className="text-center p-4 bg-card rounded-lg">
            <div className="text-2xl font-bold text-primary">24/7</div>
            <div className="text-sm text-muted-foreground">Auto Updates</div>
          </div>
        </div>
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
        {/* Deployment Overview */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center">
              <Globe className="w-8 h-8 text-primary" />
            </div>
            <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center">
              <MessageSquare className="w-8 h-8 text-primary" />
            </div>
            <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center">
              <Cloud className="w-8 h-8 text-primary" />
            </div>
          </div>
          <h3 className="text-xl font-semibold mb-2">Omnichannel AI Deployment</h3>
          <p className="text-muted-foreground max-w-3xl mx-auto">
            Deploy your AI agents across all communication channels with unified management, 
            consistent branding, and seamless user experiences.
          </p>
        </div>

        {/* Deployment Channels Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="p-6">
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center">
                  <Globe className="w-5 h-5 text-primary" />
                </div>
                <h4 className="font-semibold">Web & Mobile</h4>
              </div>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Responsive web chat widgets</li>
                <li>• Native mobile applications</li>
                <li>• Progressive web apps (PWA)</li>
                <li>• Custom iframe integration</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="p-6">
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center">
                  <MessageSquare className="w-5 h-5 text-primary" />
                </div>
                <h4 className="font-semibold">Messaging Platforms</h4>
              </div>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• SMS/Text messaging</li>
                <li>• WhatsApp Business API</li>
                <li>• Facebook Messenger</li>
                <li>• Microsoft Teams integration</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="p-6">
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center">
                  <Zap className="w-5 h-5 text-primary" />
                </div>
                <h4 className="font-semibold">Voice & Advanced</h4>
              </div>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Voice call automation</li>
                <li>• Interactive voice response (IVR)</li>
                <li>• Video consultation integration</li>
                <li>• API & webhook endpoints</li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Enterprise Features */}
        <div className="bg-card p-6 rounded-lg">
          <h4 className="text-lg font-semibold mb-4">Enterprise Management Features</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-background rounded-lg">
                <div className="w-8 h-8 bg-primary/20 rounded-lg flex items-center justify-center">
                  <Database className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <div className="font-medium">Centralized Analytics</div>
                  <div className="text-sm text-muted-foreground">Cross-channel performance metrics</div>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-background rounded-lg">
                <div className="w-8 h-8 bg-primary/20 rounded-lg flex items-center justify-center">
                  <FileText className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <div className="font-medium">Compliance Management</div>
                  <div className="text-sm text-muted-foreground">HIPAA, SOX, GDPR compliance</div>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-background rounded-lg">
                <div className="w-8 h-8 bg-primary/20 rounded-lg flex items-center justify-center">
                  <Zap className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <div className="font-medium">Auto-scaling</div>
                  <div className="text-sm text-muted-foreground">Dynamic resource allocation</div>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-background rounded-lg">
                <div className="w-8 h-8 bg-primary/20 rounded-lg flex items-center justify-center">
                  <Globe className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <div className="font-medium">Global Deployment</div>
                  <div className="text-sm text-muted-foreground">Multi-region, multi-language support</div>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-background rounded-lg">
                <div className="w-8 h-8 bg-primary/20 rounded-lg flex items-center justify-center">
                  <MessageSquare className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <div className="font-medium">Unified Messaging</div>
                  <div className="text-sm text-muted-foreground">Consistent experience across channels</div>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-background rounded-lg">
                <div className="w-8 h-8 bg-primary/20 rounded-lg flex items-center justify-center">
                  <Cloud className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <div className="font-medium">Secure Infrastructure</div>
                  <div className="text-sm text-muted-foreground">End-to-end encryption, secure APIs</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Deployment Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-card rounded-lg">
            <div className="text-2xl font-bold text-primary">8+</div>
            <div className="text-sm text-muted-foreground">Deployment Channels</div>
          </div>
          <div className="text-center p-4 bg-card rounded-lg">
            <div className="text-2xl font-bold text-primary">99.9%</div>
            <div className="text-sm text-muted-foreground">Uptime SLA</div>
          </div>
          <div className="text-center p-4 bg-card rounded-lg">
            <div className="text-2xl font-bold text-primary">1M+</div>
            <div className="text-sm text-muted-foreground">Daily Messages</div>
          </div>
          <div className="text-center p-4 bg-card rounded-lg">
            <div className="text-2xl font-bold text-primary">24/7</div>
            <div className="text-sm text-muted-foreground">Global Support</div>
          </div>
        </div>
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
        {/* AI Infrastructure Overview */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center">
              <Zap className="w-8 h-8 text-primary" />
            </div>
            <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center">
              <Database className="w-8 h-8 text-primary" />
            </div>
            <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center">
              <Cloud className="w-8 h-8 text-primary" />
            </div>
          </div>
          <h3 className="text-xl font-semibold mb-2">Advanced AI Infrastructure</h3>
          <p className="text-muted-foreground max-w-3xl mx-auto">
            State-of-the-art AI models with MCP protocol integration, advanced RAG capabilities, 
            and intelligent context management for superior conversational experiences.
          </p>
        </div>

        {/* AI Models Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="p-6">
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center">
                  <Zap className="w-5 h-5 text-primary" />
                </div>
                <h4 className="font-semibold">Large Language Models</h4>
              </div>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• GPT-4 & GPT-4 Turbo</li>
                <li>• Claude 3.5 Sonnet</li>
                <li>• Llama 3.1 & 3.2</li>
                <li>• Custom fine-tuned models</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="p-6">
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center">
                  <Database className="w-5 h-5 text-primary" />
                </div>
                <h4 className="font-semibold">MCP Protocol</h4>
              </div>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Model Context Protocol integration</li>
                <li>• Standardized tool interfaces</li>
                <li>• Cross-model compatibility</li>
                <li>• Efficient context sharing</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="p-6">
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center">
                  <FileText className="w-5 h-5 text-primary" />
                </div>
                <h4 className="font-semibold">Specialized Models</h4>
              </div>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Medical & healthcare models</li>
                <li>• Code generation & analysis</li>
                <li>• Vision & image processing</li>
                <li>• Speech & audio processing</li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* RAG Implementation */}
        <div className="bg-card p-6 rounded-lg">
          <h4 className="text-lg font-semibold mb-4">Advanced RAG Implementation</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h5 className="font-medium text-primary">Vector Database Technologies</h5>
              <div className="space-y-2">
                <div className="flex items-center gap-3 p-2 bg-background rounded">
                  <Badge variant="outline">Pinecone</Badge>
                  <span className="text-sm text-muted-foreground">High-performance vector search</span>
                </div>
                <div className="flex items-center gap-3 p-2 bg-background rounded">
                  <Badge variant="outline">Weaviate</Badge>
                  <span className="text-sm text-muted-foreground">Open-source vector database</span>
                </div>
                <div className="flex items-center gap-3 p-2 bg-background rounded">
                  <Badge variant="outline">Chroma</Badge>
                  <span className="text-sm text-muted-foreground">Lightweight embedding database</span>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <h5 className="font-medium text-primary">Context Management</h5>
              <div className="space-y-2">
                <div className="flex items-center gap-3 p-2 bg-background rounded">
                  <Badge variant="outline">Smart Chunking</Badge>
                  <span className="text-sm text-muted-foreground">Intelligent text segmentation</span>
                </div>
                <div className="flex items-center gap-3 p-2 bg-background rounded">
                  <Badge variant="outline">Hybrid Search</Badge>
                  <span className="text-sm text-muted-foreground">Semantic + keyword search</span>
                </div>
                <div className="flex items-center gap-3 p-2 bg-background rounded">
                  <Badge variant="outline">Reranking</Badge>
                  <span className="text-sm text-muted-foreground">Result optimization</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Model Selection Strategy */}
        <div className="bg-card p-6 rounded-lg">
          <h4 className="text-lg font-semibold mb-4">Intelligent Model Selection</h4>
          <div className="flex items-center justify-between gap-4 overflow-x-auto">
            <div className="flex flex-col items-center min-w-0 flex-1">
              <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mb-2">
                <Zap className="w-6 h-6 text-primary" />
              </div>
              <div className="text-center">
                <div className="font-medium text-sm">Query Analysis</div>
                <div className="text-xs text-muted-foreground">Intent & complexity</div>
              </div>
            </div>
            <div className="w-8 h-0.5 bg-primary/30"></div>
            <div className="flex flex-col items-center min-w-0 flex-1">
              <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mb-2">
                <Database className="w-6 h-6 text-primary" />
              </div>
              <div className="text-center">
                <div className="font-medium text-sm">Model Routing</div>
                <div className="text-xs text-muted-foreground">Optimal selection</div>
              </div>
            </div>
            <div className="w-8 h-0.5 bg-primary/30"></div>
            <div className="flex flex-col items-center min-w-0 flex-1">
              <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mb-2">
                <Cloud className="w-6 h-6 text-primary" />
              </div>
              <div className="text-center">
                <div className="font-medium text-sm">Response Generation</div>
                <div className="text-xs text-muted-foreground">Contextual output</div>
              </div>
            </div>
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-card rounded-lg">
            <div className="text-2xl font-bold text-primary">10+</div>
            <div className="text-sm text-muted-foreground">AI Models</div>
          </div>
          <div className="text-center p-4 bg-card rounded-lg">
            <div className="text-2xl font-bold text-primary">99.8%</div>
            <div className="text-sm text-muted-foreground">Context Accuracy</div>
          </div>
          <div className="text-center p-4 bg-card rounded-lg">
            <div className="text-2xl font-bold text-primary">&lt;150ms</div>
            <div className="text-sm text-muted-foreground">Response Latency</div>
          </div>
          <div className="text-center p-4 bg-card rounded-lg">
            <div className="text-2xl font-bold text-primary">100M+</div>
            <div className="text-sm text-muted-foreground">Token Capacity</div>
          </div>
        </div>
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
        {/* Template System Overview */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center">
              <FileText className="w-8 h-8 text-primary" />
            </div>
            <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center">
              <Zap className="w-8 h-8 text-primary" />
            </div>
            <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center">
              <Database className="w-8 h-8 text-primary" />
            </div>
          </div>
          <h3 className="text-xl font-semibold mb-2">Intelligent Template & Automation System</h3>
          <p className="text-muted-foreground max-w-3xl mx-auto">
            Comprehensive template library with smart automation, task orchestration, 
            and intelligent deployment strategies for maximum efficiency.
          </p>
        </div>

        {/* Template Categories */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="p-6">
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center">
                  <MessageSquare className="w-5 h-5 text-primary" />
                </div>
                <h4 className="font-semibold">Conversation Templates</h4>
              </div>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Patient intake workflows</li>
                <li>• Appointment scheduling flows</li>
                <li>• Symptom assessment guides</li>
                <li>• Insurance verification scripts</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="p-6">
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center">
                  <Zap className="w-5 h-5 text-primary" />
                </div>
                <h4 className="font-semibold">Automation Templates</h4>
              </div>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Follow-up reminders</li>
                <li>• Prescription refill automation</li>
                <li>• Lab result notifications</li>
                <li>• Care plan updates</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="p-6">
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center">
                  <Database className="w-5 h-5 text-primary" />
                </div>
                <h4 className="font-semibold">Integration Templates</h4>
              </div>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• EHR data synchronization</li>
                <li>• API workflow templates</li>
                <li>• Custom action sequences</li>
                <li>• Third-party integrations</li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Smart Task Orchestration */}
        <div className="bg-card p-6 rounded-lg">
          <h4 className="text-lg font-semibold mb-4">AI-Powered Task Orchestration</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h5 className="font-medium text-primary">Workflow Management</h5>
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-background rounded-lg">
                  <div className="w-6 h-6 bg-primary/20 rounded flex items-center justify-center">
                    <span className="text-xs font-bold text-primary">1</span>
                  </div>
                  <div>
                    <div className="font-medium text-sm">Trigger Detection</div>
                    <div className="text-xs text-muted-foreground">Event-based automation starts</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-background rounded-lg">
                  <div className="w-6 h-6 bg-primary/20 rounded flex items-center justify-center">
                    <span className="text-xs font-bold text-primary">2</span>
                  </div>
                  <div>
                    <div className="font-medium text-sm">Context Analysis</div>
                    <div className="text-xs text-muted-foreground">AI analyzes situation & needs</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-background rounded-lg">
                  <div className="w-6 h-6 bg-primary/20 rounded flex items-center justify-center">
                    <span className="text-xs font-bold text-primary">3</span>
                  </div>
                  <div>
                    <div className="font-medium text-sm">Template Selection</div>
                    <div className="text-xs text-muted-foreground">Best-fit template chosen</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-background rounded-lg">
                  <div className="w-6 h-6 bg-primary/20 rounded flex items-center justify-center">
                    <span className="text-xs font-bold text-primary">4</span>
                  </div>
                  <div>
                    <div className="font-medium text-sm">Action Execution</div>
                    <div className="text-xs text-muted-foreground">Automated task completion</div>
                  </div>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <h5 className="font-medium text-primary">Advanced Features</h5>
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-background rounded-lg">
                  <Badge variant="secondary">Conditional Logic</Badge>
                  <span className="text-sm text-muted-foreground">If-then-else workflows</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-background rounded-lg">
                  <Badge variant="secondary">Parallel Processing</Badge>
                  <span className="text-sm text-muted-foreground">Multiple actions simultaneously</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-background rounded-lg">
                  <Badge variant="secondary">Error Handling</Badge>
                  <span className="text-sm text-muted-foreground">Automatic retry & fallbacks</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-background rounded-lg">
                  <Badge variant="secondary">Learning Loops</Badge>
                  <span className="text-sm text-muted-foreground">AI improves over time</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Deployment Intelligence */}
        <div className="bg-card p-6 rounded-lg">
          <h4 className="text-lg font-semibold mb-4">Intelligent Deployment Strategies</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-background rounded-lg">
              <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-3">
                <Globe className="w-6 h-6 text-primary" />
              </div>
              <h5 className="font-medium mb-2">A/B Testing</h5>
              <p className="text-sm text-muted-foreground">
                Automatically test different templates and optimize performance
              </p>
            </div>
            <div className="text-center p-4 bg-background rounded-lg">
              <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-3">
                <Zap className="w-6 h-6 text-primary" />
              </div>
              <h5 className="font-medium mb-2">Progressive Rollout</h5>
              <p className="text-sm text-muted-foreground">
                Gradual deployment with real-time monitoring and rollback
              </p>
            </div>
            <div className="text-center p-4 bg-background rounded-lg">
              <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-3">
                <Database className="w-6 h-6 text-primary" />
              </div>
              <h5 className="font-medium mb-2">Performance Analytics</h5>
              <p className="text-sm text-muted-foreground">
                Real-time metrics and optimization recommendations
              </p>
            </div>
          </div>
        </div>

        {/* Template Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-card rounded-lg">
            <div className="text-2xl font-bold text-primary">200+</div>
            <div className="text-sm text-muted-foreground">Ready Templates</div>
          </div>
          <div className="text-center p-4 bg-card rounded-lg">
            <div className="text-2xl font-bold text-primary">85%</div>
            <div className="text-sm text-muted-foreground">Automation Rate</div>
          </div>
          <div className="text-center p-4 bg-card rounded-lg">
            <div className="text-2xl font-bold text-primary">50+</div>
            <div className="text-sm text-muted-foreground">Auto Actions</div>
          </div>
          <div className="text-center p-4 bg-card rounded-lg">
            <div className="text-2xl font-bold text-primary">99.5%</div>
            <div className="text-sm text-muted-foreground">Success Rate</div>
          </div>
        </div>
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
        {/* Multi-Modal Overview */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center">
              <FileText className="w-8 h-8 text-primary" />
            </div>
            <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center">
              <MessageSquare className="w-8 h-8 text-primary" />
            </div>
            <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center">
              <Zap className="w-8 h-8 text-primary" />
            </div>
          </div>
          <h3 className="text-xl font-semibold mb-2">Multi-Modal AI Capabilities</h3>
          <p className="text-muted-foreground max-w-3xl mx-auto">
            Advanced AI infrastructure supporting text, voice, vision, and real-time interactions 
            for comprehensive healthcare communication and processing.
          </p>
        </div>

        {/* Core Modalities */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="p-6">
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center">
                  <MessageSquare className="w-5 h-5 text-primary" />
                </div>
                <h4 className="font-semibold">Text & Language</h4>
              </div>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Natural language understanding</li>
                <li>• Medical terminology processing</li>
                <li>• Multi-language support (50+)</li>
                <li>• Sentiment & intent analysis</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="p-6">
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center">
                  <Zap className="w-5 h-5 text-primary" />
                </div>
                <h4 className="font-semibold">Voice & Speech</h4>
              </div>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Real-time speech-to-text</li>
                <li>• Natural voice synthesis</li>
                <li>• Accent & dialect recognition</li>
                <li>• Voice biometric authentication</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="p-6">
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center">
                  <FileText className="w-5 h-5 text-primary" />
                </div>
                <h4 className="font-semibold">Vision & Documents</h4>
              </div>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Medical image analysis</li>
                <li>• Document OCR & extraction</li>
                <li>• Form processing automation</li>
                <li>• Handwriting recognition</li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Live Agent Capabilities */}
        <div className="bg-card p-6 rounded-lg">
          <h4 className="text-lg font-semibold mb-4">Live Agent Integration</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h5 className="font-medium text-primary">Human-AI Collaboration</h5>
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-background rounded-lg">
                  <div className="w-8 h-8 bg-primary/20 rounded-lg flex items-center justify-center">
                    <MessageSquare className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <div className="font-medium text-sm">Seamless Handoff</div>
                    <div className="text-xs text-muted-foreground">AI to human agent transitions</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-background rounded-lg">
                  <div className="w-8 h-8 bg-primary/20 rounded-lg flex items-center justify-center">
                    <Zap className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <div className="font-medium text-sm">AI-Assisted Support</div>
                    <div className="text-xs text-muted-foreground">Real-time suggestions for agents</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-background rounded-lg">
                  <div className="w-8 h-8 bg-primary/20 rounded-lg flex items-center justify-center">
                    <Database className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <div className="font-medium text-sm">Context Preservation</div>
                    <div className="text-xs text-muted-foreground">Full conversation history maintained</div>
                  </div>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <h5 className="font-medium text-primary">Real-Time Processing</h5>
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-background rounded-lg">
                  <Badge variant="secondary">Live Transcription</Badge>
                  <span className="text-sm text-muted-foreground">Real-time speech processing</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-background rounded-lg">
                  <Badge variant="secondary">Emotion Detection</Badge>
                  <span className="text-sm text-muted-foreground">Patient sentiment analysis</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-background rounded-lg">
                  <Badge variant="secondary">Smart Routing</Badge>
                  <span className="text-sm text-muted-foreground">Intelligent call direction</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-background rounded-lg">
                  <Badge variant="secondary">Quality Monitoring</Badge>
                  <span className="text-sm text-muted-foreground">Automated QA & compliance</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Advanced Processing Features */}
        <div className="bg-card p-6 rounded-lg">
          <h4 className="text-lg font-semibold mb-4">Advanced Processing Capabilities</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-background rounded-lg">
              <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-3">
                <FileText className="w-6 h-6 text-primary" />
              </div>
              <h5 className="font-medium mb-2">Document Intelligence</h5>
              <p className="text-sm text-muted-foreground">
                Extract structured data from medical records, forms, and reports
              </p>
            </div>
            <div className="text-center p-4 bg-background rounded-lg">
              <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-3">
                <MessageSquare className="w-6 h-6 text-primary" />
              </div>
              <h5 className="font-medium mb-2">Conversation Analytics</h5>
              <p className="text-sm text-muted-foreground">
                Deep insights into patient interactions and communication patterns
              </p>
            </div>
            <div className="text-center p-4 bg-background rounded-lg">
              <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-3">
                <Zap className="w-6 h-6 text-primary" />
              </div>
              <h5 className="font-medium mb-2">Predictive Analytics</h5>
              <p className="text-sm text-muted-foreground">
                Anticipate patient needs and optimize care delivery workflows
              </p>
            </div>
          </div>
        </div>

        {/* Processing Performance */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-card rounded-lg">
            <div className="text-2xl font-bold text-primary">5</div>
            <div className="text-sm text-muted-foreground">Modalities Supported</div>
          </div>
          <div className="text-center p-4 bg-card rounded-lg">
            <div className="text-2xl font-bold text-primary">50+</div>
            <div className="text-sm text-muted-foreground">Languages</div>
          </div>
          <div className="text-center p-4 bg-card rounded-lg">
            <div className="text-2xl font-bold text-primary">95%</div>
            <div className="text-sm text-muted-foreground">Recognition Accuracy</div>
          </div>
          <div className="text-center p-4 bg-card rounded-lg">
            <div className="text-2xl font-bold text-primary">&lt;100ms</div>
            <div className="text-sm text-muted-foreground">Processing Latency</div>
          </div>
        </div>
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
        {/* Implementation Status */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center">
              <Cloud className="w-8 h-8 text-primary" />
            </div>
            <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center">
              <Globe className="w-8 h-8 text-primary" />
            </div>
            <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center">
              <Database className="w-8 h-8 text-primary" />
            </div>
          </div>
          <h3 className="text-xl font-semibold mb-2">Enterprise-Ready Implementation</h3>
          <p className="text-muted-foreground max-w-3xl mx-auto">
            Production-ready AI platform with enterprise-grade security, scalability, 
            and comprehensive management capabilities deployed across multiple healthcare organizations.
          </p>
        </div>

        {/* Current Deployments */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="p-6">
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center">
                  <Database className="w-5 h-5 text-primary" />
                </div>
                <h4 className="font-semibold">Treatment Centers</h4>
              </div>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• 25+ active implementations</li>
                <li>• 500,000+ patient interactions</li>
                <li>• 95% automation success rate</li>
                <li>• HIPAA compliant infrastructure</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="p-6">
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center">
                  <Globe className="w-5 h-5 text-primary" />
                </div>
                <h4 className="font-semibold">Multi-Channel Presence</h4>
              </div>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Web chat widgets</li>
                <li>• Mobile applications</li>
                <li>• Voice call automation</li>
                <li>• SMS/WhatsApp integration</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="p-6">
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center">
                  <Zap className="w-5 h-5 text-primary" />
                </div>
                <h4 className="font-semibold">Performance Metrics</h4>
              </div>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• 99.9% system uptime</li>
                <li>• &lt;200ms response times</li>
                <li>• 85% first-call resolution</li>
                <li>• 60% operational cost reduction</li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Enterprise Features */}
        <div className="bg-card p-6 rounded-lg">
          <h4 className="text-lg font-semibold mb-4">Enterprise Management Suite</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h5 className="font-medium text-primary">Security & Compliance</h5>
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-background rounded-lg">
                  <div className="w-8 h-8 bg-primary/20 rounded-lg flex items-center justify-center">
                    <FileText className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <div className="font-medium text-sm">HIPAA Compliance</div>
                    <div className="text-xs text-muted-foreground">Healthcare data protection standards</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-background rounded-lg">
                  <div className="w-8 h-8 bg-primary/20 rounded-lg flex items-center justify-center">
                    <Cloud className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <div className="font-medium text-sm">SOC 2 Type II</div>
                    <div className="text-xs text-muted-foreground">Security & availability controls</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-background rounded-lg">
                  <div className="w-8 h-8 bg-primary/20 rounded-lg flex items-center justify-center">
                    <Globe className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <div className="font-medium text-sm">GDPR Ready</div>
                    <div className="text-xs text-muted-foreground">European data protection</div>
                  </div>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <h5 className="font-medium text-primary">Operations & Monitoring</h5>
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-background rounded-lg">
                  <Badge variant="secondary">Real-time Analytics</Badge>
                  <span className="text-sm text-muted-foreground">Live performance dashboards</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-background rounded-lg">
                  <Badge variant="secondary">Auto-scaling</Badge>
                  <span className="text-sm text-muted-foreground">Dynamic resource management</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-background rounded-lg">
                  <Badge variant="secondary">24/7 Monitoring</Badge>
                  <span className="text-sm text-muted-foreground">Proactive system health checks</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-background rounded-lg">
                  <Badge variant="secondary">Backup & Recovery</Badge>
                  <span className="text-sm text-muted-foreground">Automated disaster recovery</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Agent Management Dashboard */}
        <div className="bg-card p-6 rounded-lg">
          <h4 className="text-lg font-semibold mb-4">Advanced Agent Management</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-background rounded-lg">
              <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-3">
                <MessageSquare className="w-6 h-6 text-primary" />
              </div>
              <h5 className="font-medium mb-2">Conversation Management</h5>
              <p className="text-sm text-muted-foreground">
                Real-time monitoring, intervention capabilities, and quality assurance
              </p>
            </div>
            <div className="text-center p-4 bg-background rounded-lg">
              <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-3">
                <Zap className="w-6 h-6 text-primary" />
              </div>
              <h5 className="font-medium mb-2">Performance Optimization</h5>
              <p className="text-sm text-muted-foreground">
                AI-driven insights for continuous improvement and optimization
              </p>
            </div>
            <div className="text-center p-4 bg-background rounded-lg">
              <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-3">
                <Database className="w-6 h-6 text-primary" />
              </div>
              <h5 className="font-medium mb-2">Data & Reporting</h5>
              <p className="text-sm text-muted-foreground">
                Comprehensive analytics and customizable reporting tools
              </p>
            </div>
          </div>
        </div>

        {/* Implementation Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-card rounded-lg">
            <div className="text-2xl font-bold text-primary">25+</div>
            <div className="text-sm text-muted-foreground">Active Deployments</div>
          </div>
          <div className="text-center p-4 bg-card rounded-lg">
            <div className="text-2xl font-bold text-primary">500K+</div>
            <div className="text-sm text-muted-foreground">Patient Interactions</div>
          </div>
          <div className="text-center p-4 bg-card rounded-lg">
            <div className="text-2xl font-bold text-primary">99.9%</div>
            <div className="text-sm text-muted-foreground">System Uptime</div>
          </div>
          <div className="text-center p-4 bg-card rounded-lg">
            <div className="text-2xl font-bold text-primary">60%</div>
            <div className="text-sm text-muted-foreground">Cost Reduction</div>
          </div>
        </div>
      </div>
    ),
    animation: 'zoom'
  },
  {
    id: 13,
    title: "Implementation Roadmap & Next Steps",
    subtitle: "Strategic Planning for AI Implementation",
    content: (
      <div className="h-full overflow-y-auto space-y-6 animate-fade-in">
        {/* Roadmap Overview */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center">
              <FileText className="w-8 h-8 text-primary" />
            </div>
            <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center">
              <Zap className="w-8 h-8 text-primary" />
            </div>
            <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center">
              <Globe className="w-8 h-8 text-primary" />
            </div>
          </div>
          <h3 className="text-xl font-semibold mb-2">Your AI Implementation Journey</h3>
          <p className="text-muted-foreground max-w-3xl mx-auto">
            Strategic roadmap for successful AI implementation with clear milestones, 
            timelines, and measurable outcomes for your treatment center.
          </p>
        </div>

        {/* Implementation Phases */}
        <div className="space-y-6">
          <Card className="p-6">
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center">
                  <span className="font-bold text-primary">1</span>
                </div>
                <h4 className="text-lg font-semibold text-primary">Discovery & Planning (Weeks 1-2)</h4>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h5 className="font-medium mb-2">Assessment Activities</h5>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Current workflow analysis</li>
                    <li>• System integration assessment</li>
                    <li>• Compliance requirements review</li>
                    <li>• Staff training needs evaluation</li>
                  </ul>
                </div>
                <div>
                  <h5 className="font-medium mb-2">Deliverables</h5>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Implementation strategy document</li>
                    <li>• Technical requirements specification</li>
                    <li>• Project timeline & milestones</li>
                    <li>• Success metrics definition</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="p-6">
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center">
                  <span className="font-bold text-primary">2</span>
                </div>
                <h4 className="text-lg font-semibold text-primary">Pilot Development (Weeks 3-6)</h4>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h5 className="font-medium mb-2">Development Activities</h5>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• AI agent configuration</li>
                    <li>• System integrations setup</li>
                    <li>• Knowledge base development</li>
                    <li>• Security & compliance configuration</li>
                  </ul>
                </div>
                <div>
                  <h5 className="font-medium mb-2">Testing & Validation</h5>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Functional testing & validation</li>
                    <li>• User acceptance testing</li>
                    <li>• Performance optimization</li>
                    <li>• Staff training sessions</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="p-6">
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center">
                  <span className="font-bold text-primary">3</span>
                </div>
                <h4 className="text-lg font-semibold text-primary">Production Deployment (Weeks 7-8)</h4>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h5 className="font-medium mb-2">Go-Live Activities</h5>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Production environment setup</li>
                    <li>• Gradual rollout strategy</li>
                    <li>• Real-time monitoring activation</li>
                    <li>• Support team activation</li>
                  </ul>
                </div>
                <div>
                  <h5 className="font-medium mb-2">Success Metrics</h5>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• 95% automation success rate</li>
                    <li>• &lt;200ms response times</li>
                    <li>• 90% patient satisfaction</li>
                    <li>• 50% efficiency improvement</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Next Steps */}
        <div className="bg-card p-6 rounded-lg">
          <h4 className="text-lg font-semibold mb-4">Immediate Next Steps</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-background rounded-lg">
              <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-3">
                <MessageSquare className="w-6 h-6 text-primary" />
              </div>
              <h5 className="font-medium mb-2">Schedule Discovery Call</h5>
              <p className="text-sm text-muted-foreground mb-3">
                30-minute consultation to assess your specific needs
              </p>
              <Badge variant="secondary">Week 1</Badge>
            </div>
            <div className="text-center p-4 bg-background rounded-lg">
              <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-3">
                <FileText className="w-6 h-6 text-primary" />
              </div>
              <h5 className="font-medium mb-2">Technical Assessment</h5>
              <p className="text-sm text-muted-foreground mb-3">
                Detailed analysis of your current systems and requirements
              </p>
              <Badge variant="secondary">Week 2</Badge>
            </div>
            <div className="text-center p-4 bg-background rounded-lg">
              <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-3">
                <Zap className="w-6 h-6 text-primary" />
              </div>
              <h5 className="font-medium mb-2">Pilot Program Launch</h5>
              <p className="text-sm text-muted-foreground mb-3">
                Begin development of your custom AI solution
              </p>
              <Badge variant="secondary">Week 3</Badge>
            </div>
          </div>
        </div>

        {/* Investment & ROI */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-card rounded-lg">
            <div className="text-2xl font-bold text-primary">8</div>
            <div className="text-sm text-muted-foreground">Week Implementation</div>
          </div>
          <div className="text-center p-4 bg-card rounded-lg">
            <div className="text-2xl font-bold text-primary">60%</div>
            <div className="text-sm text-muted-foreground">Cost Reduction</div>
          </div>
          <div className="text-center p-4 bg-card rounded-lg">
            <div className="text-2xl font-bold text-primary">6</div>
            <div className="text-sm text-muted-foreground">Month ROI</div>
          </div>
          <div className="text-center p-4 bg-card rounded-lg">
            <div className="text-2xl font-bold text-primary">24/7</div>
            <div className="text-sm text-muted-foreground">Support Included</div>
          </div>
        </div>
      </div>
    ),
    animation: 'slide'
  }
];

// Export a function to get slides dynamically (future enhancement)
export const getSlides = (): Slide[] => {
  return presentationSlides;
};

// Utility functions for slide management
export const getSlideById = (id: number): Slide | undefined => {
  return presentationSlides.find(slide => slide.id === id);
};

export const getTotalSlides = (): number => {
  return presentationSlides.length;
};
